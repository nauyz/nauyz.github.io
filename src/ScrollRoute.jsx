import { useEffect, useRef } from 'react';
import './scroll-route.css';

// All positions come from the actual layout, including the pinned project deck.
export default function ScrollRoute() {
  const svg = useRef(null);
  useEffect(() => {
    const element = svg.current;
    const main = element.closest('main');
    const track = element.querySelector('.scroll-route-track');
    const fill = element.querySelector('.scroll-route-fill');
    const marker = element.querySelector('.scroll-route-marker');
    const dots = [...element.querySelectorAll('.scroll-route-node')];
    let frame = 0;
    let length = 0;
    let height = 0;
    let stops = [];
    const update = () => {
      frame = 0;
      const top = main.getBoundingClientRect().top;
      const atBottom = window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2;
      const y = atBottom ? height - 24 : Math.max(30, Math.min(height - 24, window.innerHeight * .48 - top));
      // Locate the reading position on the curve instead of approximating its arc length.
      let low = 0, high = length;
      for (let i = 0; i < 16; i++) {
        const mid = (low + high) / 2;
        if (track.getPointAtLength(mid).y < y) low = mid; else high = mid;
      }
      const distance = window.scrollY < 2 ? 0 : (low + high) / 2;
      fill.style.strokeDashoffset = String(length - distance);
      const point = track.getPointAtLength(distance);
      marker.setAttribute('cx', point.x);
      marker.setAttribute('cy', point.y);
      dots.forEach((dot, index) => dot.dataset.lit = String(distance > 0 && y >= stops[index]));
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
    const measure = () => {
      height = Math.max(240, main.offsetHeight);
      element.setAttribute('viewBox', `0 0 42 ${height}`);
      const path = `M 32 30 L 32 60 C 32 100 10 90 10 132 L 10 ${height - 24}`;
      track.setAttribute('d', path);
      fill.setAttribute('d', path);
      length = track.getTotalLength();
      fill.style.strokeDasharray = String(length);
      stops = ['#agent-trace', '#video', '#projects', '#request-flow'].map(selector => {
        const section = main.querySelector(selector);
        return section ? Math.max(145, section.getBoundingClientRect().top - main.getBoundingClientRect().top + 44) : 145;
      });
      dots.forEach((dot, index) => dot.setAttribute('transform', `translate(10 ${stops[index]})`));
      update();
    };
    const observer = new ResizeObserver(measure);
    observer.observe(main);
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', measure);
    measure();
    return () => { observer.disconnect(); cancelAnimationFrame(frame); window.removeEventListener('scroll', schedule); window.removeEventListener('resize', measure); };
  }, []);
  return <svg ref={svg} className="scroll-route" aria-hidden="true" width="42" preserveAspectRatio="none">
    <path className="scroll-route-track"/><path className="scroll-route-fill"/>
    <path className="scroll-route-plane" d="M32 10 l2 7 6 4 v2 l-7-2 v5 l2 2 v1 l-3-1-3 1 v-1 l2-2 v-5 l-7 2 v-2 l6-4z"/>
    {[0,1,2,3].map(index => <g key={index} className="scroll-route-node"><circle r="4.5"/><circle className="scroll-route-dot" r="2"/></g>)}
    <circle className="scroll-route-marker" r="2.5"/>
  </svg>;
}
