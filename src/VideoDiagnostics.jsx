import React, {useEffect, useRef, useState} from 'react';

// Opt-in, local-only diagnostics. Nothing is uploaded or stored.
export default function VideoDiagnostics(){
  const [report,setReport]=useState('等待视频加载'),[copied,setCopied]=useState(false);
  const history=useRef([]),latest=useRef('');
  useEffect(()=>{
    const sample=()=>{
      const host=document.querySelector('.studio-recording'),v=host?.querySelector('video'),deck=document.querySelector('#video');
      if(!v)return '找不到录屏视频';
      const ranges=[];for(let i=0;i<v.buffered.length;i++)ranges.push(`${v.buffered.start(i).toFixed(1)}-${v.buffered.end(i).toFixed(1)}`);
      return `版本 diag-2 · ${v.currentSrc.startsWith('blob:')?'完整本地视频':'网络视频'} · 时间 ${v.currentTime.toFixed(1)}s\n暂停 ${v.paused} · 跳转 ${v.seeking} · 就绪 ${v.readyState} · 网络 ${v.networkState}\n允许播放 ${host.dataset.running} · 可见 ${deck.dataset.visible} · 正面 ${deck.dataset.face==='0'} · 翻转停止 ${deck.dataset.settled}\n帧数 ${v.getVideoPlaybackQuality?.().totalVideoFrames??'未知'} · 滚动 ${Math.round(scrollY)} · 后台 ${document.hidden}\n缓冲 ${ranges.join(', ')||'无'} · 错误 ${v.error?.code??'无'}`;
    };
    const refresh=()=>{const state=sample();latest.current=`${navigator.userAgent}\n${state}\n${history.current.join('\n')}`;setReport(state);};
    const event=e=>{
      if(!e.target.matches?.('.studio-recording video,.studio-face:first-child .studio-progress,.studio-face:first-child .studio-playbar button'))return;
      history.current.push(`${new Date().toISOString().slice(11,23)} ${e.type} ${e.target.value??''}\n${sample()}`);
      history.current=history.current.slice(-30);refresh();
    };
    const names=['pointerdown','pointerup','pointercancel','input','change','click','play','playing','pause','seeking','seeked','waiting','stalled','error'];
    names.forEach(n=>document.addEventListener(n,event,true));
    const timer=setInterval(refresh,500);refresh();
    return()=>{clearInterval(timer);names.forEach(n=>document.removeEventListener(n,event,true));};
  },[]);
  const copy=async()=>{try{await navigator.clipboard.writeText(latest.current);setCopied(true);}catch{setCopied(false);window.prompt('复制诊断信息',latest.current);}};
  return <aside aria-label="视频播放诊断" style={{position:'fixed',bottom:8,left:8,right:8,zIndex:10000,padding:12,border:'1px solid #8ab4f8',borderRadius:8,background:'#101010f5',color:'#fff',font:'12px/1.5 monospace',maxHeight:'34vh',overflow:'auto'}}>
    <pre style={{margin:'0 0 8px',whiteSpace:'pre-wrap'}}>{report}</pre>
    <button onClick={copy} style={{padding:'8px 12px',border:'1px solid #8ab4f8',borderRadius:6,color:'#8ab4f8'}}>{copied?'已复制诊断信息':'复制诊断信息'}</button>
    <a href="/media/creator-studio/demo.mp4?v=faststart-3" target="_blank" rel="noopener noreferrer" style={{marginLeft:16,color:'#8ab4f8'}}>原视频对照</a>
  </aside>;
}
