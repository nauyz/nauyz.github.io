const {icons,tools}=await fetch('icons.json').then(r=>r.json());
const inputs=[['FFmpeg','执行工具',tools[0]],['镜头与主音频','输入素材',icons[5]],['统一字幕','字幕规则',icons[0]],['音画同步检查','检验标准',tools[2]]];
const clamp=x=>Math.max(0,Math.min(1,x)),ease=x=>1-(1-clamp(x))**3;
// The reference tooltip uses stiffness 260, damping 10, mass 1.
const spring=t=>1-Math.exp(-5*Math.max(0,t))*(Math.cos(Math.sqrt(235)*Math.max(0,t))+5/Math.sqrt(235)*Math.sin(Math.sqrt(235)*Math.max(0,t)));
const glyph=(svg,x,y,size=24)=>`<g transform="translate(${x} ${y}) scale(${size/36})">${svg}</g>`;
const positions=[[100,145],[260,115],[100,315],[390,130]];
const scenes=[document.querySelector('#icons-scene'),document.querySelector('#list-scene')];
function hub(x,y,finished,pulse){return `<g transform="translate(${x} ${y}) scale(${1+pulse*.025})"><rect x="-34" y="-34" width="68" height="68" rx="19" fill="${finished?'#f0f0eb':'#fff'}" stroke="${finished?'#aaa990':'#d9dad5'}"/>${glyph(icons[5],-18,-18,36)}<text y="60" text-anchor="middle" font-size="15" fill="#555d4e">合成</text>${finished?'<circle cx="28" cy="-28" r="10" fill="#424a3f" stroke="#fcfcfb" stroke-width="3"/><path d="M24-28L27-25L32-31" stroke="white" fill="none" stroke-width="1.7"/>':''}</g>`}
function renderTogether(svg,time){
 const t=time%7,merge=ease((t-3.5)/.8),fade=1-ease((t-4)/.35),pop=spring(t),appear=clamp(t/.15),finished=t>=4.35;
 const hx=260,hy=225,spots=[[125,130],[395,130],[125,320],[395,320]];
 let out='<defs><linearGradient id="tooltip-paper" x2="0" y2="1"><stop stop-color="#ffffff"/><stop offset="1" stop-color="#f3f7f1"/></linearGradient></defs>';
 inputs.forEach(([name,desc,art],i)=>{
  const [sx,sy]=spots[i],dx=sx-hx,dy=sy-hy,k=34/Math.max(Math.abs(dx),Math.abs(dy)),tx=hx+dx*k,ty=hy+dy*k,cx=sx+(tx-sx)*.65;
  const line=ease((t-.65)/.8);
  const route=`M${sx} ${sy} Q${cx} ${sy} ${tx} ${ty}`;
  out+=`<defs><linearGradient id="green-${i}" gradientUnits="userSpaceOnUse" x1="${sx}" y1="${sy}" x2="${tx}" y2="${ty}"><stop stop-color="#afd4b3" stop-opacity=".25"/><stop offset=".5" stop-color="#68b08a" stop-opacity=".75"/><stop offset="1" stop-color="#32946b"/></linearGradient><mask id="reveal-${i}" maskUnits="userSpaceOnUse" x="0" y="0" width="520" height="420"><path d="${route}" fill="none" stroke="white" stroke-width="5" pathLength="1" stroke-dasharray="${line} 1"/></mask></defs><path class="together-connection" d="${route}" fill="none" stroke="url(#green-${i})" stroke-width="1.5" stroke-linecap="round" stroke-dasharray="4 6" stroke-dashoffset="${-t*7}" opacity="${fade*line}" mask="url(#reveal-${i})"/>`;
  const x=(1-merge)**2*sx+2*(1-merge)*merge*cx+merge**2*tx,y=(1-merge)**2*sy+2*(1-merge)*merge*sy+merge**2*ty;
  out+=`<g class="together-input" opacity="${appear*fade}" transform="translate(${x} ${y+12*(1-pop)}) scale(${(.6+.4*pop)*(1-.35*merge)})"><circle r="19" fill="#fff" stroke="#b5c8b4"/>${glyph(art,-11,-11,22)}</g>`;
  const labelWidth=Math.max(90,[...name].reduce((w,c)=>w+(/[\u3400-\u9fff]/.test(c)?12:7),0)+26);
  out+=`<g class="together-tooltip" opacity="${appear*fade}" transform="translate(${sx} ${sy-51+20*(1-pop)+8*(1-fade)}) scale(${.6+.4*pop})"><rect x="${-labelWidth/2}" y="-20" width="${labelWidth}" height="40" rx="9" fill="url(#tooltip-paper)" stroke="#dbe5d8" stroke-width=".8"/><text text-anchor="middle" y="-2" font-size="12" fill="#344a3c">${name}</text><text text-anchor="middle" y="12" font-size="9" fill="#899888">${desc}</text></g>`;
 });
 out+=hub(hx,hy,finished,Math.sin(clamp((t-4.3)/.4)*Math.PI));
 if(finished)out+=`<g opacity="${ease((t-4.35)/.4)}"><rect x="222" y="298" width="76" height="25" rx="6" fill="#fff" stroke="#dedfd8"/><text x="260" y="314" text-anchor="middle" fill="#555d4e" font-size="11">合成.mp4</text></g>`;
 svg.innerHTML=out;
}
function renderScene(svg,mode,t){
if(mode===0){renderTogether(svg,t);return;}
const active=Math.min(3,Math.floor(t/3)),local=t-active*3,finished=t>=12,merge=ease((local-1.85)/.7),arrival=clamp((local-2.5)/.35);
const hx=mode===0?280:385,hy=mode===0?255:225;
let out=`<defs><linearGradient id="beam-${mode}"><stop stop-color="#6299ef" stop-opacity=".2"/><stop offset="1" stop-color="#a855f7"/></linearGradient><filter id="lift-${mode}" x="-40%" y="-60%" width="180%" height="240%"><feDropShadow dy="3" stdDeviation="3" flood-opacity=".09"/></filter></defs>`;
if(mode===1)out+='<rect x="37" y="112" width="210" height="223" rx="12" fill="#f0f1ed" stroke="#e0e2db"/><text x="54" y="137" fill="#888d82" font-size="11">合成所需</text>';
inputs.forEach(([name,desc,art],i)=>{
const current=!finished&&i===active,done=finished||i<active;const sx=mode===0?positions[i][0]:142,sy=mode===0?positions[i][1]:167+i*46;
const dx=sx-hx,dy=sy-hy,k=34/Math.max(Math.abs(dx),Math.abs(dy)),tx=hx+dx*k,ty=hy+dy*k;
if(current){out+=`<path d="M${sx} ${sy} Q${hx-30} ${sy} ${tx} ${ty}" fill="none" stroke="#dde1d7" stroke-width="1" opacity="${clamp(local/.3)}"/>`;if(local>1.7)out+=`<path d="M${sx} ${sy} Q${hx-30} ${sy} ${tx} ${ty}" fill="none" stroke="url(#beam-${mode})" stroke-width="1.8" pathLength="1" stroke-dasharray="${merge} 1"/>`;}
const selectable=`class="source" data-input="${i}" role="button" tabindex="0" aria-label="查看${name}"`;
if(mode===0){
out+=`<g ${selectable} transform="translate(${sx} ${sy})" opacity="${done?.3:current?.22:.65}"><circle r="19" fill="#fff" stroke="#d9ddd5"/>${glyph(art,-11,-11,22)}<text y="35" text-anchor="middle" fill="#747c6d" font-size="10">${desc}</text></g>`;
if(current){const mx=(1-merge)**2*sx+2*(1-merge)*merge*(hx-30)+merge**2*tx,my=(1-merge)**2*sy+2*(1-merge)*merge*sy+merge**2*ty;out+=`<g transform="translate(${mx} ${my}) scale(${1-.45*merge})" opacity="${1-ease((merge-.85)/.15)}"><circle r="19" fill="#fff" stroke="#b5aa88"/>${glyph(art,-11,-11,22)}</g>`;
const pop=spring(local),op=clamp(local/.12)*(1-ease((local-1.55)/.3));out+=`<g pointer-events="none" transform="translate(${sx} ${sy-53+20*(1-pop)}) scale(${.6+.4*pop})" opacity="${op}"><rect x="-69" y="-26" width="138" height="44" rx="7" fill="#20251f"/><path d="M-5 18L0 23L5 18" fill="#20251f"/><text text-anchor="middle" y="-8" font-size="12" fill="#fff">${name}</text><text text-anchor="middle" y="8" font-size="9" fill="#bbc4b4">${desc}</text></g>`;}
}else{
out+=`<g ${selectable}><rect x="54" y="${sy-16}" width="176" height="32" rx="6" fill="${current?'#e7e9e2':'#fff'}" opacity="${done?.4:1}"/>${done?`<path d="M65 ${sy}l3 3 6-7" stroke="#7c8573" stroke-width="1.4" fill="none"/>`:''}<text x="${done?83:65}" y="${sy+4}" font-size="11" fill="#828a7b" opacity="${current?.25:1}">${name}</text></g>`;
if(current){const pop=spring(local),mx=sx+(tx-sx)*merge,my=sy+(ty-sy)*merge-5*pop*(1-merge),scale=1+.025*pop-.65*merge;out+=`<g pointer-events="none" transform="translate(${mx} ${my}) scale(${scale})" opacity="${1-ease((merge-.85)/.15)}" filter="url(#lift-${mode})"><rect x="-88" y="-16" width="176" height="32" rx="6" fill="#fff" stroke="#b6ae95"/>${glyph(art,-77,-10,20)}<text x="-49" y="4" font-size="11" fill="#434d3e">${name}</text></g>`;}
}
});
out+=hub(hx,hy,finished,Math.sin(arrival*Math.PI));if(finished)out+=`<g opacity="${ease((t-12)/.4)}"><rect x="${hx-38}" y="${hy+73}" width="76" height="25" rx="6" fill="#fff" stroke="#dedfd8"/><text x="${hx}" y="${hy+89}" text-anchor="middle" fill="#555d4e" font-size="11">合成.mp4</text></g>`;
svg.innerHTML=out;
}
const reduced=matchMedia('(prefers-reduced-motion:reduce)').matches;let time=reduced?13:0,playing=!reduced,last=0,visible=true;
function draw(){scenes.forEach((svg,i)=>renderScene(svg,i,time));document.querySelector('#seek').value=time;document.querySelector('.time').textContent=`${time.toFixed(1)} / 14 s`;document.querySelector('#play').textContent=playing?'暂停':'播放'}
function seek(t){time=t;playing=false;draw()}
scenes.forEach(svg=>{svg.addEventListener('click',e=>{const item=e.target.closest('[data-input]');if(item)seek(Number(item.dataset.input)*3+.6)});svg.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){const item=e.target.closest('[data-input]');if(item){e.preventDefault();seek(Number(item.dataset.input)*3+.6)}}})});
document.querySelector('#play').onclick=()=>{playing=!playing;draw()};document.querySelector('#restart').onclick=()=>{time=0;playing=true;draw()};document.querySelector('#seek').oninput=e=>seek(Number(e.target.value));new IntersectionObserver(entries=>{visible=entries.some(e=>e.isIntersecting)}).observe(document.querySelector('.samples'));
function tick(now){if(last&&playing&&!document.hidden&&visible){time=(time+Math.min(.1,(now-last)/1000))%14;draw()}last=now;requestAnimationFrame(tick)}window.setComparisonTime=seek;draw();requestAnimationFrame(tick);
