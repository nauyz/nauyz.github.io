import React, { useEffect, useRef, useState } from 'react';
import { Play, Pause } from '@phosphor-icons/react';
import './inline-project-video.css';

export default function InlineProjectVideo({ media, name }) {
  const videoRef = useRef(null);
  const gate = useRef({ visible: false, reduced: false, manual: null, failed: false, pending: false });
  const [playing, setPlaying] = useState(false);
  const [started, setStarted] = useState(false);
  const [failed, setFailed] = useState(false);

  function reconcile() {
    const video = videoRef.current;
    const state = gate.current;
    if (!video) return;
    const wanted = state.visible && !document.hidden && !state.failed && state.manual !== false && (!state.reduced || state.manual === true);
    if (!wanted) { video.pause(); return; }
    if (!video.paused || state.pending) return;
    state.pending = true;
    video.play().then(() => {
      state.pending = false;
      // The tab/viewport may have changed while play() was pending.
      if (!state.visible || document.hidden || state.manual === false || (state.reduced && state.manual !== true)) video.pause();
    }).catch(() => { state.pending = false; setPlaying(false); });
  }

  useEffect(() => {
    const video = videoRef.current;
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    gate.current.reduced = motion.matches;
    const observer = new IntersectionObserver(([entry]) => {
      gate.current.visible = entry.isIntersecting && entry.intersectionRatio >= 0.2;
      reconcile();
    }, { threshold: [0, 0.2] });
    const onMotion = () => { gate.current.reduced = motion.matches; gate.current.manual = null; reconcile(); };
    observer.observe(video);
    document.addEventListener('visibilitychange', reconcile);
    motion.addEventListener('change', onMotion);
    return () => {
      gate.current.visible = false;
      observer.disconnect(); video.pause();
      document.removeEventListener('visibilitychange', reconcile);
      motion.removeEventListener('change', onMotion);
    };
  }, []);

  function toggle() {
    gate.current.manual = videoRef.current.paused;
    reconcile();
  }

  return <div className="inline-project-video">
    <video ref={videoRef} src={media.src} poster={media.poster} muted loop playsInline preload="none"
      aria-label={media.alt || `${name}操作演示`} onPlaying={() => { setPlaying(true); setStarted(true); }}
      onPause={() => setPlaying(false)} onError={() => { gate.current.failed = true; setFailed(true); setPlaying(false); }} />
    {(!started || failed) && <img className="inline-video-poster" src={media.poster} alt={`${name}：内容精选页面`} />}
    {!failed && <button type="button" className="inline-video-toggle" onClick={toggle} aria-label={playing ? '暂停演示' : '播放演示'}>
      {playing ? <Pause size={14} weight="fill" aria-hidden="true" /> : <Play size={14} weight="fill" aria-hidden="true" />}
      <span>{playing ? '暂停' : '播放演示'}</span>
    </button>}
    {failed && <span className="inline-video-unavailable">演示暂不可用</span>}
  </div>;
}
