import React,{useEffect,useRef,useState} from 'react';
import {motion,useMotionValueEvent,useReducedMotion,useScroll,useTransform} from 'motion/react';
import {ArrowLeft,ArrowRight,Play,Pause,ArrowCounterClockwise} from '@phosphor-icons/react';
import {studioScenes,beatAt,cameraAt} from './studio-scenes';
import './studio-deck.css';

function Architecture({scene,time}){
  const beat=beatAt(scene.beats,time), n=beat.node;
  const u=Math.min(1,Math.max(0,(time-beat.at)/.65)), taskX=(n===0?0:n-1+1-Math.pow(1-u,3))*160;
  return <><svg className="studio-map map-wide" viewBox="0 0 800 500" role="img" aria-label="任务从修改要求经过上下文、执行器、版本产物，进入人工确认">
    <defs><pattern id="studio-grid" width="25" height="25" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r=".7" fill="currentColor" opacity=".13"/></pattern><linearGradient id="studio-line"><stop stopColor="#d8b66d"/><stop offset="1" stopColor="#87b4b0"/></linearGradient></defs>
    <rect width="800" height="500" fill="url(#studio-grid)"/>
    <text x="32" y="35" className="map-eyebrow">CREATIVE PIPELINE</text>
    {scene.stages.map(([name,engine],i)=><g key={name} opacity={i===3?1:.6}><rect x={25+i*129} y="53" width="113" height="57" rx="7" className={i===3?'map-stage active':'map-stage'}/><text x={81+i*129} y="76" textAnchor="middle" className="map-label">{name}</text><text x={81+i*129} y="96" textAnchor="middle" className="map-small">{engine}</text></g>)}
    <path d="M468 112 V140 H80 V195" className="map-link" strokeDasharray="4 6"/>
    <path d="M80 223 H720" className="map-link"/>
    <motion.path d={`M80 223 H${80+n*160}`} stroke="url(#studio-line)" strokeWidth="3" fill="none"/>
    {scene.nodes.map(([name,detail],i)=><g key={name}><circle cx={80+i*160} cy="223" r="23" className={n===i?'map-node active':'map-node'}/><text x={80+i*160} y="230" textAnchor="middle" className="map-number">{String(i+1).padStart(2,'0')}</text><text x={80+i*160} y="272" textAnchor="middle" className="map-label">{name}</text><text x={80+i*160} y="295" textAnchor="middle" className="map-small">{detail}</text></g>)}
    <g transform={`translate(${taskX} 0)`}><rect x="24" y="151" width="112" height="36" rx="18" fill="#d8b66d"/><text x="80" y="174" textAnchor="middle" fill="#14272a" fontSize="15" fontWeight="600">镜头修改任务</text></g>
    <path d="M240 317 V342 M560 317 V342" className="map-link"/>
    <rect x="30" y="345" width="362" height="125" rx="12" className="map-panel"/>
    <text x="50" y="374" className="map-label">任务携带的资料</text>
    {scene.resources.map((name,i)=><g key={name} opacity={n>=1?1:.45}><rect x={49+i*83} y="392" width="74" height="53" rx="5" className="map-stage"/><path d={`M${59+i*83} 404 h28`} className="map-link"/><text x={86+i*83} y="430" textAnchor="middle" className="map-small">{name}</text></g>)}
    <rect x="412" y="345" width="358" height="125" rx="12" className="map-panel"/>
    <text x="432" y="374" className="map-label">产物与版本</text>
    <rect x="433" y="389" width="128" height="63" rx="5" className="map-stage"/><text x="497" y="415" textAnchor="middle" className="map-label">原版本</text><text x="497" y="438" textAnchor="middle" className="map-small">保留 · 可回看</text>
    <g opacity={n>=3?1:.3}><path d="M572 420 h23 m-7 -5 7 5 -7 5" className="map-link"/><rect x="609" y="389" width="142" height="63" rx="5" className="map-stage active"/><text x="680" y="415" textAnchor="middle" className="map-label">修改版本</text><text x="680" y="438" textAnchor="middle" className="map-small">{n===4?'检查 · 人工确认':'独立保存产物'}</text></g>
  </svg><svg className="studio-map map-compact" viewBox="0 0 400 300" role="img" aria-label={`镜头修改任务：${scene.nodes[n][0]}`}>
    <text x="24" y="29" className="map-eyebrow">镜头制作 / CODEX</text>
    <rect x="24" y="48" width="352" height="115" rx="12" className="map-stage active"/>
    <text x="44" y="78" className="map-small">镜头修改任务</text><text x="44" y="113" className="map-label" style={{fontSize:25}}>{scene.nodes[n][0]}</text><text x="44" y="143" className="map-label">{scene.nodes[n][1]}</text>
    <path d="M40 197 H360" className="map-link"/>
    {['要求','上下文','执行','版本','确认'].map((label,i)=><g key={label}><circle cx={40+i*80} cy="197" r="12" className={n===i?'map-node active':'map-node'}/><text x={40+i*80} y="231" textAnchor="middle" className="map-label">{label}</text></g>)}
    <text x="24" y="275" className="map-label">口播 · 分镜 · 当前镜头 · 制作规则</text>
  </svg></>;
}
function StudioFace({scene,selected,running,reduce}){
  const [time,setTime]=useState(0),[paused,setPaused]=useState(false),[manual,setManual]=useState(false),[failed,setFailed]=useState(false);
  const video=useRef(null);
  const enabled=running&&!paused&&(!reduce||manual);
  useEffect(()=>{setTime(0);setPaused(false);setManual(false);setFailed(false);},[selected]);
  useEffect(()=>{if(!enabled)return;let frame,last=performance.now();const tick=now=>{const dt=Math.min((now-last)/1000,.1);last=now;setTime(t=>(t+dt)%scene.duration);frame=requestAnimationFrame(tick);};frame=requestAnimationFrame(tick);return()=>cancelAnimationFrame(frame);},[enabled,scene.duration]);
  useEffect(()=>{if(!video.current)return;if(enabled)video.current.play().catch(()=>setPaused(true));else video.current.pause();},[enabled]);
  const state=scene.kind==='screens'?cameraAt(scene.shots,time):beatAt(scene.beats,time);
  function replay(){setTime(0);setPaused(false);setManual(true);if(video.current)video.current.currentTime=0;}
  return <><div className="studio-visual"><div className="studio-canvas" data-time={time.toFixed(2)} data-running={enabled}>
    {scene.kind==='architecture'?<Architecture scene={scene} time={time}/>:scene.media.type==='video'&&scene.media.src?<video ref={video} src={scene.media.src} poster={scene.media.poster} muted playsInline loop onError={()=>setFailed(true)}/>:<img src={failed?scene.media.poster:state.src} alt="视频工作台的真实镜头审核与任务上下文界面" onError={()=>setFailed(true)} style={{transform:`translate(${state.camera[1]}%,${state.camera[2]}%) scale(${state.camera[0]})`}}/>}
    </div><div className="studio-caption">{state.caption}</div><div className="studio-playbar"><div className="studio-progress"><span style={{width:`${time/scene.duration*100}%`}}/></div><button aria-label={enabled?'暂停展示':'播放展示'} onClick={()=>{setPaused(enabled);setManual(true);}}>{enabled?<Pause size={15}/>:<Play size={15}/>}</button><button aria-label="重播展示" onClick={replay}><ArrowCounterClockwise size={16}/></button></div></div>
    <aside className="studio-copy"><span className="feature-label mono">{scene.label}</span><h2>{scene.title.map(line=><span key={line}>{line}</span>)}</h2><p>{scene.description}</p><ul>{scene.points.map((point,i)=><li key={point}><span>0{i+1}</span>{point}</li>)}</ul>{scene.note&&<small>{scene.note}</small>}<div className="studio-face-number">{scene.kind==='screens'?'01':'02'}<span>CREATOR<br/>STUDIO</span></div></aside></>;
}
export default function StudioDeck(){
  const root=useRef(null),viewport=useRef(null),[index,setIndex]=useState(0),[settled,setSettled]=useState(true),[visible,setVisible]=useState(false),[foreground,setForeground]=useState(!document.hidden);
  const reduce=useReducedMotion();
  const {scrollYProgress}=useScroll({target:root,offset:['start start','end end']});
  const rotateY=useTransform(scrollYProgress,[0,.12,.88,1],[0,0,-180,-180]);
  useMotionValueEvent(scrollYProgress,'change',v=>{setIndex(v>=.5?1:0);setSettled(v<=.12||v>=.88);});
  useEffect(()=>{const observer=new IntersectionObserver(([entry])=>setVisible(entry.isIntersecting&&entry.intersectionRatio>=.55),{threshold:[0,.55]});observer.observe(viewport.current);const change=()=>setForeground(!document.hidden);document.addEventListener('visibilitychange',change);return()=>{observer.disconnect();document.removeEventListener('visibilitychange',change);};},[]);
  useEffect(()=>{
    if(location.hash!=='#video')return;
    let cancelled=false;
    const align=async()=>{await document.fonts.ready;requestAnimationFrame(()=>requestAnimationFrame(()=>{if(!cancelled&&root.current)window.scrollTo({top:root.current.getBoundingClientRect().top+scrollY,behavior:'instant'});}));};
    if(document.readyState==='complete')align();else window.addEventListener('load',align,{once:true});
    return()=>{cancelled=true;window.removeEventListener('load',align);};
  },[]);
  function select(next){if(next<0||next>1)return;const el=root.current;window.scrollTo({top:el.getBoundingClientRect().top+scrollY+Math.max(0,el.offsetHeight-innerHeight)*next,behavior:reduce?'instant':'smooth'});}
  return <section id="video" className="feature-scroll studio-deck" ref={root} aria-label="视频工作台"><div className="feature-sticky"><div className="deck-top"><span>视频工作台</span><span className="mono">FEATURED WORK</span></div><div className="deck-perspective" ref={viewport} tabIndex={0} role="region" aria-label="工作台双面展示，左右方向键翻页" onKeyDown={e=>{if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();select(index+(e.key==='ArrowRight'?1:-1));}}}><motion.div className="flip-wrapper" style={reduce?{}:{rotateY,transformPerspective:1600}}>{studioScenes.map((scene,i)=><article key={scene.id} className="feature-card flip-face studio-face" aria-hidden={index!==i} inert={index!==i?true:undefined} style={reduce?{visibility:index===i?'visible':'hidden'}:{transform:`rotateY(${i*180}deg)`}}><StudioFace scene={scene} selected={index===i} running={visible&&foreground&&index===i&&(reduce||settled)} reduce={reduce}/></article>)}</motion.div></div><div className="deck-controls"><span className="deck-hint">滚动翻面 · 从使用到架构</span><div className="pagination"><button className="icon-button" disabled={index===0} onClick={()=>select(0)} aria-label="上一面"><ArrowLeft/></button><span className="mono"><b>0{index+1}</b><span className="page-divider">/</span>02</span><button className="icon-button" disabled={index===1} onClick={()=>select(1)} aria-label="下一面"><ArrowRight/></button></div><a className="next-section" href="#projects">更多项目 <ArrowRight/></a></div></div></section>;
}
