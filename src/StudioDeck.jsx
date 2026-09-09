import ProjectOverview from './ProjectOverview';
import React,{useEffect,useRef,useState} from 'react';
import {motion,useMotionValueEvent,useReducedMotion,useScroll,useTransform} from 'motion/react';
import {ArrowLeft,ArrowRight,Play,Pause,ArrowCounterClockwise} from '@phosphor-icons/react';
import {studioScenes} from './studio-scenes';
import './studio-deck.css';

function StudioFace({scene,running,reduce}){
  const [time,setTime]=useState(0),[paused,setPaused]=useState(false),[manual,setManual]=useState(false),[failed,setFailed]=useState(false),[frameReady,setFrameReady]=useState(false),[scrubbing,setScrubbing]=useState(false);
  const [playing,setPlaying]=useState(false),[waiting,setWaiting]=useState(false);
  const video=useRef(null),frame=useRef(null),dragging=useRef(false);
  const architecture=scene.kind==='architecture';
  const startOffset=scene.startOffset??0,playbackRate=scene.playbackRate??1;
  const duration=(scene.duration-startOffset)/playbackRate;
  // Native video seeking preserves playback; avoid an asynchronous play() restart
  // after touch release, which mobile browsers may reject. Only freeze the iframe clock.
  const enabled=running&&!paused&&(!architecture||!scrubbing)&&(!architecture||frameReady)&&(!reduce||manual);

  useEffect(()=>{if(!enabled||!architecture)return;let raf,last=performance.now();const tick=now=>{setTime(t=>(t+Math.min((now-last)/1000,.1))%duration);last=now;raf=requestAnimationFrame(tick);};raf=requestAnimationFrame(tick);return()=>cancelAnimationFrame(raf);},[enabled,architecture,duration]);
  useEffect(()=>{const media=video.current;if(!media)return;let cancelled=false;if(enabled)media.play().catch(()=>{if(!cancelled)setPaused(true);});else media.pause();return()=>{cancelled=true;};},[enabled]);
  useEffect(()=>{if(frameReady)frame.current?.contentWindow?.setJourneyTime?.(reduce&&!manual?scene.duration-1:startOffset+time*playbackRate);},[time,frameReady,reduce,manual,scene.duration,startOffset,playbackRate]);
  function seek(value){const next=Math.max(0,Math.min(duration-.01,Number(value)));if(reduce&&!manual)setPaused(true);setManual(true);setTime(next);if(video.current)video.current.currentTime=next;}
  function beginScrub(e){dragging.current=true;setScrubbing(true);e.currentTarget.setPointerCapture(e.pointerId);}
  function endScrub(){dragging.current=false;setScrubbing(false);}
  function togglePlayback(){
    setManual(true);
    if(architecture){setPaused(enabled);return;}
    const media=video.current;
    if(!media)return;
    if(playing&&!media.paused){setPaused(true);media.pause();return;}
    setPaused(false);
    if(waiting&&media.readyState<3){
      const resumeAt=media.currentTime;
      media.load();
      media.currentTime=resumeAt;
    }
    // Call inside the tap handler: embedded mobile browsers require user activation.
    media.play().catch(()=>{setPlaying(false);setWaiting(false);setPaused(true);});
  }
  function replay(){setTime(0);setPaused(false);setManual(true);if(video.current)video.current.currentTime=0;}
  return <><div className="studio-visual"><div className={`studio-canvas ${architecture?'studio-workflow':'studio-recording'}`} data-time={time.toFixed(2)} data-running={enabled}>
    {architecture?<iframe ref={frame} src={scene.media.src} title="视频生产 Agent 工作流编排动画" onLoad={()=>setFrameReady(true)} tabIndex={-1}/>:failed?<img src={scene.media.poster} alt="视频工作台演示封面"/>:<video ref={video} src={scene.media.src} poster={scene.media.poster} muted playsInline loop preload="metadata" onPlaying={()=>{setPlaying(true);setWaiting(false);}} onPause={()=>{setPlaying(false);setWaiting(false);}} onWaiting={()=>{setPlaying(false);setWaiting(true);}} onSeeking={()=>{setPlaying(false);setWaiting(true);}} onTimeUpdate={e=>{if(!dragging.current)setTime(e.currentTarget.currentTime);}} onError={()=>{setFailed(true);setPaused(true);setPlaying(false);setWaiting(false);}}/>}
    </div><div className="studio-playbar"><input className="studio-progress" type="range" min="0" max={duration-.01} step="0.1" value={time} aria-label={architecture?'流程动画进度':'视频进度'} aria-valuetext={`${Math.floor(time)} 秒，共 ${Math.round(duration)} 秒`} style={{'--progress':`${time/duration*100}%`}} disabled={failed||(architecture&&!frameReady)} onPointerDown={beginScrub} onPointerUp={endScrub} onPointerCancel={endScrub} onLostPointerCapture={endScrub} onBlur={endScrub} onChange={e=>seek(e.target.value)} onKeyDown={e=>e.stopPropagation()}/><button aria-label={(architecture?enabled:playing)?'暂停展示':'播放展示'} title={waiting?'视频缓冲中，点击重试播放':undefined} onClick={togglePlayback} disabled={failed}>{(architecture?enabled:playing)?<Pause size={15}/>:<Play size={15}/>}</button><button aria-label="重播展示" onClick={replay} disabled={failed}><ArrowCounterClockwise size={16}/></button>{failed&&<small>视频暂时无法播放</small>}</div></div>
    {!architecture&&<aside className="studio-copy"><ProjectOverview tagline="Agent Workflow" description={scene.description} points={scene.points}/></aside>}</>;
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
  return <section id="video" className="feature-scroll studio-deck" ref={root} aria-label="视频工作台"><div className="feature-sticky"><header className="deck-top project-name-bar"><h2 className="project-name">视频工作台</h2></header><div className="deck-perspective" ref={viewport} tabIndex={0} role="region" aria-label="工作台双面展示，左右方向键翻页" onKeyDown={e=>{if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();select(index+(e.key==='ArrowRight'?1:-1));}}}><motion.div className="flip-wrapper" style={reduce?{}:{rotateY,transformPerspective:1600}}>{studioScenes.map((scene,i)=><article key={scene.id} className={`feature-card flip-face studio-face ${scene.kind==='architecture'?'studio-architecture-face':''}`} aria-hidden={index!==i} inert={index!==i?true:undefined} style={reduce?{visibility:index===i?'visible':'hidden'}:{transform:`rotateY(${i*180}deg)`}}><StudioFace scene={scene} running={visible&&foreground&&index===i&&(i===1||reduce||settled)} reduce={reduce}/></article>)}</motion.div></div><div className="deck-controls"><span className="deck-hint">滚动翻面 · 从使用到架构</span><div className="pagination"><button className="icon-button" disabled={index===0} onClick={()=>select(0)} aria-label="上一面"><ArrowLeft/></button><span className="mono"><b>0{index+1}</b><span className="page-divider">/</span>02</span><button className="icon-button" disabled={index===1} onClick={()=>select(1)} aria-label="下一面"><ArrowRight/></button></div><a className="next-section" href="#projects">更多项目 <ArrowRight/></a></div></div></section>;
}
