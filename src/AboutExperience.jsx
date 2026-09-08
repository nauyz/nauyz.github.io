import { EnvelopeSimple, Phone, ArrowUpRight } from '@phosphor-icons/react';
import { profile, experience, xiaomiWork } from './experience-data';
import './about-experience.css';

export default function AboutExperience() {
  return <section id="about" className="about-experience" aria-labelledby="about-heading">
    <div className="about-heading">
      <div><h2 id="about-heading">关于我</h2><p>{profile.introduction}</p></div>
      <span className="about-name">{profile.name}</span>
    </div>
    <ol className="about-timeline" aria-label="学校与工作经历">
      {experience.map(item => <li key={item.name} className={item.current ? 'is-current' : undefined}>
        <h3>{item.name}</h3>
        <span className="about-node" aria-hidden="true"/>
        <p className="about-dates">{item.dates}</p>
        <p className="about-role">{item.description}</p>
      </li>)}
    </ol>
    <section className="about-terminal" aria-labelledby="xiaomi-heading">
      <div className="about-terminal-bar">
        <span className="about-terminal-dots" aria-hidden="true"><i/><i/><i/></span>
        <h3 id="xiaomi-heading">小米 · 工作经历</h3>
        <span className="about-terminal-date">2025.07 — 至今</span>
      </div>
      <ol className="about-work">
        {xiaomiWork.map((item, index) => <li key={item.title}>
          <span className="about-work-number" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
          <h4>{item.title}</h4>
          <div>{item.lines.map(line => <p key={line}>{line}</p>)}</div>
        </li>)}
      </ol>
    </section>
    <address className="about-contact" id="contact">
      <a href={`tel:${profile.phone.replaceAll('-', '')}`}><Phone size={18} aria-hidden="true"/>{profile.phone}</a>
      <a href={`mailto:${profile.email}`}><EnvelopeSimple size={18} aria-hidden="true"/>{profile.email}</a>
      <a className="about-download" href={profile.resume} download="张裕安-简历.pdf">下载简历<ArrowUpRight size={18} aria-hidden="true"/></a>
    </address>
  </section>;
}
