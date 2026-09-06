// A low-resolution advected velocity field. Mouse energy stays in the wake
// instead of moving a rigid circular exclusion zone around the screen.
export class ParticleWake {
  constructor(width,height) {
    this.width=width;this.height=height;
    this.cols=88;this.rows=Math.max(24,Math.round(88*height/width));
    this.dx=width/(this.cols-1);this.dy=height/(this.rows-1);
    this.u=new Float32Array(this.cols*this.rows);this.v=new Float32Array(this.u.length);
    this.nextU=new Float32Array(this.u.length);this.nextV=new Float32Array(this.u.length);
  }
  sample(array,x,y) {
    x=Math.max(0,Math.min(this.cols-1.001,x/this.dx));
    y=Math.max(0,Math.min(this.rows-1.001,y/this.dy));
    const ix=x|0,iy=y|0,fx=x-ix,fy=y-iy,i=iy*this.cols+ix;
    return (array[i]*(1-fx)+array[i+1]*fx)*(1-fy)+(array[i+this.cols]*(1-fx)+array[i+this.cols+1]*fx)*fy;
  }
  step(dt,mouse,radius) {
    const fade=Math.exp(-1.05*dt),speed=Math.hypot(mouse.vx,mouse.vy);
    const ux=speed>1?mouse.vx/speed:1,uy=speed>1?mouse.vy/speed:0;
    for(let y=0;y<this.rows;y++)for(let x=0;x<this.cols;x++){
      const i=y*this.cols+x,px=x*this.dx,py=y*this.dy;
      // Semi-Lagrangian transport keeps old curls moving after the pointer leaves.
      let u=this.sample(this.u,px-this.u[i]*dt,py-this.v[i]*dt)*fade;
      let v=this.sample(this.v,px-this.u[i]*dt,py-this.v[i]*dt)*fade;
      if(mouse.active&&speed>3){
        const dx=px-mouse.x,dy=py-mouse.y;
        const along=dx*ux+dy*uy,across=-dx*uy+dy*ux;
        const weight=Math.exp(-(along*along*.55+across*across)/(radius*radius*.32));
        const injection=(1-Math.exp(-7*dt))*weight;
        u+=(mouse.vx*.75-u)*injection;
        v+=(mouse.vy*.75-v)*injection;
        // Opposite rotations on the two sides of a stroke produce folding wakes.
        const curl=Math.sin(across/radius*3)*Math.min(speed,900)*weight*dt*2;
        u+=-uy*curl;v+=ux*curl;
      }
      this.nextU[i]=u;this.nextV[i]=v;
    }
    [this.u,this.nextU]=[this.nextU,this.u];[this.v,this.nextV]=[this.nextV,this.v];
  }
  clear(){this.u.fill(0);this.v.fill(0);}
}
