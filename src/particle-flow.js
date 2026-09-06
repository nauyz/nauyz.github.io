import { ParticleWake } from './particle-wake.js';
// Shared wakes fold the cloud; particle-specific response prevents a rigid shell.
const canvas = document.querySelector('#stage');
const gl = canvas.getContext('webgl', { alpha: false, antialias: false });
const panel = document.querySelector('#panel');
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const settings = { radius: 260, spring: 3.2 };
let width, height, dpr, count = 0, position, home, velocity, grain, colors;
let last = 0, elapsed = 0, raf = 0, averageDrift = 0, frameMs = 16;
let wake, traits, energy;
const pointer = { x: 0, y: 0, tx: 0, ty: 0, vx: 0, vy: 0, active: false, lastMove: -100 };
let draw;
const densityLayers = 4;
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

function createRenderer() {
  if (!gl) return false;
  const compile = (type, source) => {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source); gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) throw Error(gl.getShaderInfoLog(shader));
    return shader;
  };
  const program = gl.createProgram();
  gl.attachShader(program, compile(gl.VERTEX_SHADER, `
    attribute vec2 aPosition;
    attribute vec2 aGrain;
    attribute vec2 aHome;
    uniform vec2 uResolution;
    uniform float uDpr;
    uniform float uLayer;
    varying float vAlpha;
    void main(){
      float spread=smoothstep(3.,100.,length(aPosition-aHome));
      float seed=dot(aHome,vec2(12.9898,78.233))+uLayer*37.719;
      vec2 jitter=fract(sin(vec2(seed,seed+19.19))*43758.5453)-.5;
      vec2 offset=jitter*mix(1.7,11.,spread)*min(uLayer,1.);
      gl_Position=vec4((aPosition+offset)/uResolution*vec2(2.,-2.)+vec2(-1.,1.),0.,1.);
      gl_PointSize=aGrain.x*uDpr*.9;
      // Dense dust stays readable in motion without overexposing resting text.
      vAlpha=aGrain.y*mix(.52,.95,spread);
    }`));
  gl.attachShader(program, compile(gl.FRAGMENT_SHADER, `
    precision mediump float;
    varying float vAlpha;
    void main(){
      float r=length(gl_PointCoord-0.5)*2.;
      float edge=1.-smoothstep(0.35,1.,r);
      gl_FragColor=vec4(vec3(.72,.70,.51),vAlpha*edge);
    }`));
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw Error(gl.getProgramInfoLog(program));
  gl.useProgram(program);
  const buffer = gl.createBuffer(), appearance = gl.createBuffer(), origins = gl.createBuffer();
  const aPosition = gl.getAttribLocation(program, 'aPosition');
  const aGrain = gl.getAttribLocation(program, 'aGrain');
  const aHome = gl.getAttribLocation(program, 'aHome');
  const layer = gl.getUniformLocation(program, 'uLayer');
  const resolution = gl.getUniformLocation(program, 'uResolution');
  const ratio = gl.getUniformLocation(program, 'uDpr');
  gl.enable(gl.BLEND); gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
  gl.clearColor(8/255, 14/255, 12/255, 1);
  draw = (rebuild = false) => {
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.uniform2f(resolution, width, height); gl.uniform1f(ratio, dpr);
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    if (rebuild) gl.bufferData(gl.ARRAY_BUFFER, position, gl.DYNAMIC_DRAW);
    else gl.bufferSubData(gl.ARRAY_BUFFER, 0, position);
    gl.enableVertexAttribArray(aPosition); gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, appearance);
    if (rebuild) gl.bufferData(gl.ARRAY_BUFFER, colors, gl.STATIC_DRAW);
    gl.enableVertexAttribArray(aGrain); gl.vertexAttribPointer(aGrain, 2, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, origins);
    if(rebuild)gl.bufferData(gl.ARRAY_BUFFER,home,gl.STATIC_DRAW);
    gl.enableVertexAttribArray(aHome);gl.vertexAttribPointer(aHome,2,gl.FLOAT,false,0,0);
    // Four unique grains per simulated carrier, expanded on the GPU.
    for(let i=0;i<densityLayers;i++){
      gl.uniform1f(layer,i);gl.drawArrays(gl.POINTS,0,count);
    }
  };
  return true;
}

function resize() {
  width = innerWidth; height = innerHeight; dpr = Math.min(devicePixelRatio || 1, 2);
  canvas.width = Math.round(width*dpr); canvas.height = Math.round(height*dpr);
  const mask = document.createElement('canvas'); mask.width = width; mask.height = height;
  const ctx = mask.getContext('2d', { willReadFrequently: true });
  let size = Math.min(height*.272, width*.29, 270);
  ctx.font = `900 ${size}px ParticleSans`;
  size *= Math.min(1, width*.79 / ctx.measureText('edison.').width);
  ctx.font = `900 ${size}px ParticleSans`; ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.fillStyle='#fff';
  ['talk','with','edison.'].forEach((line,i)=>ctx.fillText(line,width*.485,height*.515+(i-1)*size*.83));
  const pixels=ctx.getImageData(0,0,width,height).data, points=[];
  // Fixed seed makes reloads and responsive QA reproducible; jitter removes the pixel grid.
  let seed=9341;
  const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
  const step = Math.max(1.25, size/135);
  for(let y=0;y<height;y+=step) for(let x=0;x<width;x+=step) {
    if(pixels[(Math.floor(y)*width+Math.floor(x))*4+3]>160) points.push(x+(random()-.5)*step,y+(random()-.5)*step);
  }
  home=new Float32Array(points); position=new Float32Array(home); count=home.length/2;
  velocity=new Float32Array(home.length); grain=new Float32Array(count); colors=new Float32Array(home.length);
  traits=new Float32Array(count*4);energy=new Float32Array(count);
  for(let i=0;i<count;i++) {
    grain[i]=random();colors[i*2]=.8+random()*.55;colors[i*2+1]=.18+random()*.36;
    const dust=random()<.4;
    traits[i*4]=dust?.4+random()*1.45:.7+random()*.6;
    traits[i*4+1]=dust?.65+random()*.7:.85+random()*.3;
    traits[i*4+2]=dust?.7+random()*.6:.8+random()*.4;
    traits[i*4+3]=random()*Math.PI*2;
  }
  wake=new ParticleWake(width,height);
  pointer.active=false; averageDrift=0; draw(true);
}

function reset() {position.set(home);velocity.fill(0);energy.fill(0);wake.clear();pointer.active=false;averageDrift=0;draw();}

function simulate(dt) {
  elapsed+=dt;
  const scale=Math.min(width/922,height/692,1.4);
  if(pointer.active) {
    const blend=1-Math.exp(-60*dt), px=pointer.x, py=pointer.y;
    pointer.x+=(pointer.tx-pointer.x)*blend; pointer.y+=(pointer.ty-pointer.y)*blend;
    pointer.vx=clamp((pointer.x-px)/dt,-2600,2600); pointer.vy=clamp((pointer.y-py)/dt,-2600,2600);
  } else {pointer.vx=pointer.vy=0;}
  const radius=settings.radius*scale;
  const speed=Math.hypot(pointer.vx,pointer.vy);
  const idle=elapsed-pointer.lastMove;
  const activity=pointer.active?Math.exp(-Math.max(0,idle-.06)*7):0;
  wake.step(dt,pointer,radius);
  let drift=0;
  for(let i=0;i<count;i++) {
    const j=i*2, x=position[j], y=position[j+1];
    const hx=home[j]-x, hy=home[j+1]-y, dist=Math.sqrt(hx*hx+hy*hy);
    drift+=dist;
    const k=i*4,response=traits[k],reach=traits[k+1],recovery=traits[k+2],phase=traits[k+3];
    energy[i]*=Math.exp(-dt*(.65+recovery*.3));
    const agitation=Math.min(energy[i],1);
    const spring=settings.spring*recovery*(1-.36*agitation);
    let ax=hx*spring, ay=hy*spring;
    // Evaluate the stroke in material coordinates, not just the displaced cloud.
    // Otherwise grains meet an equilibrium ring and the pointer becomes a solid ball.
    const dx=home[j]*.78+x*.22-pointer.x,dy=home[j+1]*.78+y*.22-pointer.y,d2=dx*dx+dy*dy;
    if(activity>.001) {
      const d=Math.max(Math.sqrt(d2),1),r=radius*reach;
      // Smooth Gaussian tails and varied reach avoid a common stopping radius.
      const force=Math.exp(-d2/(r*r*.42))*activity*response;
      const push=(600+Math.min(speed,1200)*.5)*scale;
      ax+=(dx/d*push-dy/d*550*scale+pointer.vx*1.5)*force;
      ay+=(dy/d*push+dx/d*550*scale+pointer.vy*1.5)*force;
      energy[i]=Math.min(1.5,energy[i]+force*dt*6);
    }
    const fu=wake.sample(wake.u,x,y),fv=wake.sample(wake.v,x,y);
    ax+=fu*1.25*response;ay+=fv*1.25*response;
    // Large folds retain coherence, small eddies separate the dust into layers.
    if(dist>1) {
      const gate=Math.min(dist/(60*scale),1)*Math.min(energy[i],1),frequency=.018/scale;
      const sx=x*frequency+elapsed*.6,sy=y*frequency-elapsed*.4;
      ax+=(Math.sin(sx)*Math.cos(sy)*190+Math.sin(sy*2.1+phase+elapsed*1.4)*95)*scale*gate;
      ay+=(-Math.cos(sx)*Math.sin(sy)*190+Math.cos(sx*1.7+phase-elapsed*1.2)*95)*scale*gate;
    }
    // Free-flight while disturbed; restore damping as energy decays for clean settling.
    const damping=Math.exp(-((1.2+recovery*.65)*(1-.48*agitation))*dt);
    velocity[j]=(velocity[j]+ax*dt)*damping;velocity[j+1]=(velocity[j+1]+ay*dt)*damping;
    position[j]+=velocity[j]*dt;position[j+1]+=velocity[j+1]*dt;
    if(dist<.18 && Math.abs(velocity[j])+Math.abs(velocity[j+1])<.5) {
      position[j]=home[j];position[j+1]=home[j+1];velocity[j]=velocity[j+1]=0;
    }
  }
  averageDrift=drift/count;
}

function frame(now) {
  raf=0;
  const rawDelta=last?(now-last)/1000:1/60;
  const delta=Math.min(rawDelta,.1);last=now;
  frameMs+=(rawDelta*1000-frameMs)*.05;
  if(!reduced.matches) {
    const steps=Math.ceil(delta/(1/60));
    for(let i=0;i<steps;i++) simulate(delta/steps);
    draw();
  }
  if(!panel.hidden) document.querySelector('#stats').textContent=` ${(count*densityLayers).toLocaleString()} 可见粒子 · ${Math.round(1000/frameMs)} FPS`;
  if(!document.hidden&&!reduced.matches) raf=requestAnimationFrame(frame);
}
function start(){if(!raf&&!document.hidden&&!reduced.matches){last=0;raf=requestAnimationFrame(frame);}}
function move(e) {
  if(reduced.matches)return;
  if(!pointer.active){pointer.x=e.clientX;pointer.y=e.clientY;pointer.vx=pointer.vy=0;}
  pointer.tx=e.clientX;pointer.ty=e.clientY;pointer.active=true;pointer.lastMove=elapsed;
}
function leave(){pointer.active=false;}

if(createRenderer()) {
  await document.fonts.load('900 120px ParticleSans');
  resize(); document.documentElement.classList.add('ready');start();
  canvas.addEventListener('pointermove',move);
  canvas.addEventListener('pointerdown',move);
  canvas.addEventListener('pointerleave',leave);
  canvas.addEventListener('pointercancel',leave);
  canvas.addEventListener('pointerup',e=>{if(e.pointerType!=='mouse')leave();});
  addEventListener('blur',leave);
  let resizeTimer;
  addEventListener('resize',()=>{clearTimeout(resizeTimer);resizeTimer=setTimeout(resize,100);});
  document.addEventListener('visibilitychange',()=>{leave();if(document.hidden){cancelAnimationFrame(raf);raf=0;}else start();});
  reduced.addEventListener('change',()=>{cancelAnimationFrame(raf);raf=0;reset();start();});
  document.querySelector('#reset').addEventListener('click',reset);
  for(const key of ['radius','spring']) document.getElementById(key).addEventListener('input',e=>settings[key]=Number(e.target.value));
  addEventListener('keydown',e=>{if(e.key.toLowerCase()==='h')panel.hidden=!panel.hidden; if(e.key==='Escape'){panel.hidden=true;reset();}});
  // Read-only diagnostics, without production overlays or artificial animation controls.
  window.particleDiagnostics=()=>({count,visibleCount:count*densityLayers,averageDrift,frameMs,reducedMotion:reduced.matches,finite:position.every(Number.isFinite),width,height});
  canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();cancelAnimationFrame(raf);document.documentElement.classList.remove('ready');});
  canvas.addEventListener('webglcontextrestored',()=>location.reload());
}
