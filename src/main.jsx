import React, { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { motion, useMotionValueEvent, useReducedMotion, useScroll, useTransform } from 'motion/react';
import { ArrowUpRight, ArrowLeft, ArrowRight, ArrowUp, X, Sun, Moon, ImageSquare } from '@phosphor-icons/react';
import '@fontsource/cormorant-garamond/400.css';
import '@fontsource/cormorant-garamond/400-italic.css';
import '@fontsource/dm-sans/400.css';
import '@fontsource/dm-sans/500.css';
import './styles.css';
import './feature-deck.css';
import { featuredProjects, otherProjects } from './projects';
import AgentTrace from './AgentTrace';
import RequestFlow from './RequestFlow';

const Icon = ({ as: Component, ...props }) => <Component size={20} weight="regular" aria-hidden="true" {...props} />;

function Media({ project, enlarged = false }) {
  const media = project.media;
  if (media?.src) return media.type === 'video'
    ? <video controls={enlarged} muted={!enlarged} preload="metadata" playsInline poster={media.poster} src={media.src} aria-label={media.alt || project.name} />
    : <img src={media.src} alt={media.alt || project.name} loading={enlarged ? 'eager' : 'lazy'} />;
  return <div className={`media-placeholder ${project.id}`}>
    <div className="media-wordmark">{project.english || 'Moving ideas.'}</div>
    <span className="media-caption">{project.coverLabel || '从创意到画面。'}</span>
    <span className="media-status"><Icon as={ImageSquare} size={14} />{enlarged ? '项目媒体待补充' : '产品画面待补充'}</span>
  </div>;
}

function ProjectDialog({ project, close }) {
  const ref = useRef(null);
  useEffect(() => {
    const dialog = ref.current;
    const previous = document.activeElement;
    dialog.showModal();
    const old = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = old; previous?.focus(); };
  }, []);
  return <dialog ref={ref} className="project-dialog" aria-labelledby="detail-title" onCancel={close} onClick={e => { if (e.target === e.currentTarget) close(); }}>
    <div className="dialog-content">
      <button className="icon-button dialog-close" aria-label="关闭项目详情" onClick={close}><Icon as={X} /></button>
      <span className="mono">{project.caption || '项目介绍'}</span>
      <h2 id="detail-title">{project.name}</h2>
      <p>{project.detail}</p>
      <div className="dialog-media"><Media project={project} enlarged /></div>
    </div>
  </dialog>;
}

function FeatureDeck({ onOpen }) {
  const root = useRef(null);
  const [index, setIndex] = useState(0);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: root, offset: ['start start', 'end end'] });
  // Match the reference's continuous two-sided Y-axis rotation, not a timed transition.
  const rotateY = useTransform(scrollYProgress, [0, 1], [0, -180]);
  useMotionValueEvent(scrollYProgress, 'change', value => {
    const next = value >= 0.5 ? 1 : 0;
    if (next !== index) setIndex(next);
  });
  function select(next) {
    if (next < 0 || next >= featuredProjects.length) return;
    const el = root.current;
    const top = el.getBoundingClientRect().top + window.scrollY;
    const distance = el.offsetHeight - window.innerHeight;
    window.scrollTo({ top: top + Math.max(0, distance) * next, behavior: reduce ? 'instant' : 'smooth' });
  }
  return <section id="video" className="feature-scroll" ref={root} aria-label="视频生成 Agent 案例">
    <div className="feature-sticky">
      <div className="deck-top"><span>视频生成 Agent</span><span className="mono">FEATURED WORK</span></div>
      <div className="deck-perspective" tabIndex={0} role="region" aria-label="项目翻页，使用左右方向键切换" onKeyDown={e => {
        if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { e.preventDefault(); select(index + (e.key === 'ArrowRight' ? 1 : -1)); }
      }}>
        <motion.div className="flip-wrapper" style={reduce ? {} : { rotateY, transformPerspective: 1600 }}>
          {featuredProjects.map((project, faceIndex) => (
            <article key={project.id} className="feature-card flip-face" aria-hidden={faceIndex !== index} inert={faceIndex !== index ? true : undefined} style={reduce ? { visibility: faceIndex === index ? 'visible' : 'hidden' } : { transform: `rotateY(${faceIndex * 180}deg)` }}>
              <div className="feature-main">
                <span className="feature-label mono">{project.label}</span>
                <h2>{project.title.map(line => <span key={line}>{line}</span>)}</h2>
                <p className="feature-description">{project.description}</p>
                <div className="facts">{project.facts.map(([label, value, sub]) => <div className="fact" key={label}><span>{label}</span><strong>{value}</strong><small>{sub}</small></div>)}</div>
                <ul className="tech-tags">{project.tags.map(tag => <li key={tag}>{tag}</li>)}</ul>
              </div>
              <aside className="feature-aside"><dl>{project.meta.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>
                <button className="text-button" onClick={() => onOpen(project)}>查看案例 <Icon as={ArrowUpRight}/></button>
                <div className="aside-bottom"><span className="large-index">{String(faceIndex + 1).padStart(2, '0')}</span><span className="mono">VIDEO<br/>PROJECT</span></div>
              </aside>
            </article>
          ))}
        </motion.div>
      </div>
      <div className="deck-controls">
        <span className="deck-hint">滚动，翻阅创作案例</span>
        <div className="pagination"><button className="icon-button" disabled={index === 0} onClick={() => select(index - 1)} aria-label="上一个案例"><Icon as={ArrowLeft}/></button><span className="mono" aria-live="polite"><b>{String(index + 1).padStart(2, '0')}</b><span className="page-divider">/</span>02</span><button className="icon-button" disabled={index === 1} onClick={() => select(index + 1)} aria-label="下一个案例"><Icon as={ArrowRight}/></button></div>
        <a href="#projects" className="next-section">更多项目 <Icon as={ArrowRight} size={16}/></a>
      </div>
    </div>
  </section>;
}

function ProjectGrid({ onOpen }) {
  const reduce = useReducedMotion();
  return <section id="projects" className="project-section">
    <div className="section-title"><h2>还有这些，<span>正在发生。</span></h2><p>关于阅读、信息，以及日常生活里的更多可能。</p></div>
    <div className="project-grid">{otherProjects.map((project, index) => <motion.article className="project-card" key={project.id} initial={reduce ? false : { opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.15 }} transition={{ duration: 0.55, delay: index * 0.1 }}>
      <button className="cover-button" aria-label={`预览${project.name}`} onClick={() => onOpen(project)}><div className="monitor"><div className="monitor-screen"><Media project={project}/></div><div className="monitor-chin"/></div><div className="monitor-stand"/><div className="monitor-foot"/><span className="cover-open"><Icon as={ArrowUpRight} size={22}/></span></button>
      <div className="project-copy"><ul className="project-tags">{project.tags.map(tag => <li key={tag}>{tag}</li>)}</ul><h3>{project.name}</h3><p className="project-subtitle">{project.subtitle}</p><p className="project-description">{project.description}</p><button className="text-button project-link" onClick={() => onOpen(project)}>探索项目 <Icon as={ArrowUpRight}/></button></div>
    </motion.article>)}</div>
  </section>;
}

function App() {
  const [project, setProject] = useState(null);
  const [theme, setTheme] = useState(() => { try { return localStorage.getItem('portfolio-theme') || 'dark'; } catch { return 'dark'; } });
  useEffect(() => { document.documentElement.dataset.theme = theme; try { localStorage.setItem('portfolio-theme', theme); } catch {} }, [theme]);
  return <><a className="skip-link" href="#video">跳转到项目</a><header className="site-header"><a href="#top" className="wordmark">Personal<span> / </span>Portfolio</a><nav aria-label="主导航"><a href="#video">视频创作</a><a href="#projects">更多项目</a><button className="icon-button theme-toggle" aria-label={theme === 'dark' ? '切换浅色主题' : '切换深色主题'} onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}><Icon as={theme === 'dark' ? Sun : Moon} size={18}/></button></nav></header>
    <main id="top"><div className="page-intro"><h1>Selected <em>work.</em></h1><p>一些想法，一些做出来的东西。</p></div><AgentTrace/><FeatureDeck onOpen={setProject}/><ProjectGrid onOpen={setProject}/><RequestFlow/></main>
    <footer><a href="#top" className="wordmark">Personal<span> / </span>Portfolio</a><a href="#top" className="back-top">回到顶部 <Icon as={ArrowUp} size={16}/></a></footer>
    {project && <ProjectDialog project={project} close={() => setProject(null)}/>}</>;
}

createRoot(document.getElementById('root')).render(<App/>);
