import React, {useEffect, useRef, useState} from 'react';
import {Play, Pause} from '@phosphor-icons/react';
import './naval-showcase.css';
import {navalTimeline as navalScenes,navalPlaybackRate} from './naval-timeline.js';
import {navalTiming as timing,navalCuePhase} from './naval-timing.js';

const labels=navalScenes.map(scene=>scene.label);
export default function NavalShowcase({project}) {
  const root=useRef(null), video=useRef(null);
  const gate=useRef({visible:false,paused:false,blocked:false,failed:false,pending:false,reduced:false,intro:0,cue:null,next:0,selected:0,lastTime:0,captionIndex:null});
  const [frame,setFrame]=useState({intro:0,time:0,running:false,cue:null,selected:0,captionIndex:null});
  const [started,setStarted]=useState(false),[failed,setFailed]=useState(false);
  useEffect(()=>{
    const state=gate.current, el=video.current;
    const motion=matchMedia('(prefers-reduced-motion: reduce)');
    const preference=()=>{state.reduced=motion.matches;if(state.reduced){state.intro=1.6;state.paused=true;state.cue=null;} };
    preference(); motion.addEventListener('change',preference);
    const observer=new IntersectionObserver(([entry])=>{state.visible=entry.isIntersecting&&entry.intersectionRatio>=.2;if(!state.visible)el.pause();},{threshold:[0,.2]});
    observer.observe(root.current);
    const visibility=()=>{if(document.hidden)el.pause();};document.addEventListener('visibilitychange',visibility);
    let raf,last=performance.now(),updated=0,alive=true;
    function tick(now){
      const dt=Math.min((now-last)/1000,.1);last=now;
      const active=state.visible&&!document.hidden&&!state.paused&&!state.blocked&&!state.failed;
      if(active)state.intro=Math.min(1.6,state.intro+dt);
      // The media clock is authoritative. Resume at the same frame after each cue.
      if(el.currentTime<state.lastTime-.5){state.next=0;state.captionIndex=null;}
      state.lastTime=el.currentTime;
      if(state.captionIndex!==null&&el.currentTime>=navalScenes[state.captionIndex].home)state.captionIndex=null;
      const rate=navalPlaybackRate(el.currentTime);
      if(el.playbackRate!==rate)el.playbackRate=rate;
      if(active&&state.intro>=1.6&&!state.cue&&state.next<navalScenes.length&&el.currentTime>=navalScenes[state.next].at){
        state.cue={index:state.next,elapsed:0};
      }
      if(active&&state.intro>=1.6&&state.cue){
        state.cue.elapsed+=dt;
        if(state.cue.elapsed>=timing.rest)state.selected=state.cue.index;
        // Latch the caption at the arrow cue; keep it across the media handoff.
        if(state.cue.elapsed>=timing.reactionEnd)state.captionIndex=state.cue.index;
        if(state.cue.elapsed>=timing.end){state.next=state.cue.index+1;state.cue=null;}
      }
      if(!active||state.cue)el.pause();
      else if(state.intro>=1.6&&el.paused&&!state.pending){
        state.pending=true;
        el.play().then(()=>{state.pending=false;if(!alive||!state.visible||document.hidden||state.paused)el.pause();}).catch(()=>{state.pending=false;state.blocked=true;});
      }
      if(now-updated>=33){setFrame(old=>old.intro===state.intro&&old.time===el.currentTime&&old.running===active&&old.cue?.elapsed===state.cue?.elapsed&&old.selected===state.selected&&old.captionIndex===state.captionIndex?old:{intro:state.intro,time:el.currentTime,running:active,cue:state.cue?{...state.cue}:null,selected:state.selected,captionIndex:state.captionIndex});updated=now;}
      raf=requestAnimationFrame(tick);
    }
    raf=requestAnimationFrame(tick);
    return()=>{alive=false;cancelAnimationFrame(raf);observer.disconnect();document.removeEventListener('visibilitychange',visibility);motion.removeEventListener('change',preference);el.pause();};
  },[]);
  const progress=Math.max(0,Math.min(1,(frame.intro-.6)/.65));
  const opening=progress*progress*(3-2*progress);
  const index=frame.selected;
  const scene=navalScenes[index];
  const [left,top,width,height]=scene.box;
  const cueTime=frame.intro>=1.6?frame.cue?.elapsed:undefined;
  const phase=frame.intro<1.6?'layout':navalCuePhase(cueTime);
  const pulse=phase==='tap';
  const tapProgress=pulse?(cueTime-timing.flashEnd)/(timing.tapEnd-timing.flashEnd):0;
  const press=pulse?Math.sin(tapProgress*Math.PI):0;
  const flash=phase==='flash'?Math.pow(Math.sin((cueTime-timing.rest)/(timing.flashEnd-timing.rest)*Math.PI*2),2):0;
  const arrowVisible=phase==='transfer';
  const transferProgress=arrowVisible?cueTime-timing.reactionEnd:0;
  const transferFade=arrowVisible?Math.min(1,(timing.transferEnd-cueTime)/.18):0;
  const caption=frame.captionIndex===null?undefined:navalScenes[frame.captionIndex].label;
  function toggle(){const s=gate.current;if(s.paused||s.blocked){s.paused=false;s.blocked=false;}else s.paused=true;}
  return <div className="cover-button project-cover-static naval-cover">
    <div ref={root} className="naval-stage" data-phase={opening===1?'expanded':'intro'} data-cue={phase} data-running={frame.running} data-feature={labels[index]} style={{'--opening':opening,'--reveal-y':`${14*(1-opening)}px`}}>
      <div className="naval-device naval-home"><div className="naval-screen">
        <img src={project.media.poster} alt="纳瓦尔认知库首页" draggable="false"/>
        {frame.intro>=.15&&<span aria-hidden="true" className={`naval-hotspot${pulse?' is-pressing':''}`} style={{left:`${left}%`,top:`${top}%`,width:`${width}%`,height:`${height}%`,'--hand-y':`${scene.handY??55}%`}}>
            <svg className="naval-tap-hand" viewBox="0 0 32 40" fill="none" style={{transform:`translateY(${press*3}px) scale(${1-press*.12})`,filter:`drop-shadow(0 0 ${1+flash*7}px rgba(7,210,143,${.25+flash*.65}))`}}>
              <path d="M10 23V8a3 3 0 0 1 6 0v10-2a2.7 2.7 0 0 1 5.4 0v3-1a2.6 2.6 0 0 1 5.2 0v3a2.4 2.4 0 0 1 4.4 1.3V28c0 5-3.2 9-8.2 9h-4.6c-3.3 0-5.5-1.4-7.4-4L4 24a2.8 2.8 0 0 1 4.4-3.4L10 23Z" fill="#07D28F" stroke="#065f46" strokeWidth="1.4" strokeLinejoin="round"/>
              <path d="M16 19v6m5.4-5v5m5.2-2v3M17 32h7" stroke="#067552" strokeWidth="1.2" strokeLinecap="round"/>
            </svg>
            {pulse&&<span className="naval-tap-ring" style={{transform:`translate(-50%,-50%) scale(${1+tapProgress*1.4})`,opacity:1-tapProgress}}/>}
        </span>}
      </div></div>
      <div aria-hidden="true" className={`naval-transfer${arrowVisible?' is-active':''}${caption?' has-caption':''}`} style={{opacity:opening}}>
        <svg viewBox="0 0 48 32" fill="none">
          {[10,26].map((x,i)=><g key={x}>
            <path d={`m${x} 7 9 9-9 9`}/>
            <path className="naval-transfer-signal" d={`m${x} 7 9 9-9 9`} style={{opacity:arrowVisible?Math.max(0,Math.min(1,(transferProgress-i*.16)/.22))*transferFade:0}}/>
          </g>)}
        </svg>
        <span>{caption??''}</span>
      </div>
      <div className="naval-device naval-detail" aria-hidden={opening===0}><div className="naval-screen">
        <video ref={video} src={project.media.showcaseSrc} poster={project.media.showcasePoster} muted loop playsInline preload="none" aria-label="目录问答、原文、搜索、继续阅读、双语原文、图解、智能问答与音频真机演示"
          onPlaying={()=>setStarted(true)} onError={()=>{gate.current.failed=true;setFailed(true);}}/>
        {(!started||failed)&&<img className="naval-detail-poster" src={project.media.showcasePoster} alt="纳瓦尔认知库录像首页"/>}
      </div></div>
    </div>
    <div className="naval-playback">{failed?<span>演示暂不可用</span>:<button type="button" onClick={toggle} aria-label={frame.running?'暂停演示':'播放演示'}>{frame.running?<Pause size={13} weight="fill"/>:<Play size={13} weight="fill"/>}<span>{frame.running?'暂停':'播放演示'}</span></button>}</div>
  </div>;
}
