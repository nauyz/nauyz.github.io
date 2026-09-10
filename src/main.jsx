import VideoDiagnostics from './VideoDiagnostics';
import { initAnalytics } from './analytics';
import ProjectOverview from './ProjectOverview';
import React, { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { motion, useReducedMotion } from 'motion/react';
import { ArrowUpRight, ArrowLeft, ArrowRight, ArrowUp, X, Sun, Moon, ImageSquare } from '@phosphor-icons/react';
import '@fontsource/cormorant-garamond/400.css';
import '@fontsource/cormorant-garamond/400-italic.css';
import '@fontsource/dm-sans/400.css';
import '@fontsource/dm-sans/500.css';
import './styles.css';
import './feature-deck.css';
import { otherProjects } from './projects';
import AboutExperience from './AboutExperience';
import StudioDeck from './StudioDeck';

import ScrollRoute from './ScrollRoute';
import InlineProjectVideo from './InlineProjectVideo';
import NavalShowcase from './NavalShowcase';
import './theme.css';
import './project-headings.css';


const Icon = ({ as: Component, ...props }) => <Component size={20} weight="regular" aria-hidden="true" {...props} />;
initAnalytics({ websiteId: import.meta.env.VITE_UMAMI_WEBSITE_ID, scriptUrl: import.meta.env.VITE_UMAMI_SCRIPT_URL });

function Media({ project, enlarged = false }) {
  const media = project.media;
  if (media?.inline) return <InlineProjectVideo media={media} name={project.name} />;
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

function ProjectGrid({ onOpen }) {
  const reduce = useReducedMotion();
  return <section id="projects" className="project-section">

    <div className="project-grid">{otherProjects.map((project, index) => <motion.article className="project-card" key={project.id} initial={reduce ? false : { opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.15 }} transition={{ duration: 0.55, delay: index * 0.1 }}>
      <header className="project-name-bar"><h2 className="project-name">{project.name}</h2>{project.url && <a data-analytics-event="project_visit" data-analytics-project={project.id} className="text-button project-visit-button" href={project.url} target="_blank" rel="noopener noreferrer">打开网站<Icon as={ArrowUpRight}/></a>}</header>
      {project.presentation === 'phone'
        ? <NavalShowcase project={project}/>
        : project.media?.inline
        ? <div className="cover-button project-cover-static"><div className="monitor"><div className="monitor-screen"><Media project={project}/></div><div className="monitor-chin"/></div><div className="monitor-stand"/><div className="monitor-foot"/></div>
        : <button className="cover-button" aria-label={`预览${project.name}`} onClick={() => onOpen(project)}><div className="monitor"><div className="monitor-screen"><Media project={project}/></div><div className="monitor-chin"/></div><div className="monitor-stand"/><div className="monitor-foot"/><span className="cover-open"><Icon as={ArrowUpRight} size={22}/></span></button>}
      <div className="project-copy"><ul className="project-tags">{project.tags.map(tag => <li key={tag}>{tag}</li>)}</ul><ProjectOverview tagline={project.tagline} description={project.description} implementation={project.implementation}/></div>
    </motion.article>)}</div>
  </section>;
}

function App() {
  const [project, setProject] = useState(null);
  const [theme, setTheme] = useState(() => { try { return localStorage.getItem('portfolio-theme') || 'dark'; } catch { return 'dark'; } });
  useEffect(() => { document.documentElement.dataset.theme = theme; try { localStorage.setItem('portfolio-theme', theme); } catch {} }, [theme]);
  return <><a className="skip-link" href="#video">跳转到项目</a><header className="site-header"><a href="#top" className="wordmark">Personal<span> / </span>Portfolio</a><nav aria-label="主导航"><a href="#video">视频创作</a><a href="#projects">更多项目</a><a href="#about">关于我</a><button className="icon-button theme-toggle" aria-label={theme === 'dark' ? '切换浅色主题' : '切换深色主题'} onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}><Icon as={theme === 'dark' ? Sun : Moon} size={18}/></button></nav></header>
    <main id="top"><ScrollRoute/><AboutExperience/><div className="page-intro"><h1>个人项目</h1></div><StudioDeck/><ProjectGrid onOpen={setProject}/></main>

    <footer><a href="#top" className="wordmark">Personal<span> / </span>Portfolio</a><a href="#top" className="back-top">回到顶部 <Icon as={ArrowUp} size={16}/></a></footer>
    {new URLSearchParams(location.search).get('video_debug') === '1' && <VideoDiagnostics/>}{project && <ProjectDialog project={project} close={() => setProject(null)}/>}</>;
}

createRoot(document.getElementById('root')).render(<App/>);
