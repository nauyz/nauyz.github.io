import { useId, useState } from 'react';
import { EnvelopeSimple, Phone, ArrowUpRight, CaretDown } from '@phosphor-icons/react';
import RequestFlow from './RequestFlow';
import AgentTrace from './AgentTrace';
import { profile, experience, workHistory } from './experience-data';
import './about-experience.css';

const journey = {
  description: profile.introduction,
  nodes: experience.map(item => ({ code: item.name, name: item.dates, detail: item.description })),
  logs: experience.map((_, index) => ({ node: index, at: 180 + index * 650, ms: 0 })),
};
const traces = workHistory.map(job => ({
  label: `${job.company} · 工作经历`, context: job.role, company: job.company, dates: job.dates,
  title: job.title, summary: job.department,
  steps: job.work.map(item => ({ tool: item.title, detail: item.lines.join('') })),
}));
function Highlight({ text }) {
  return text.split(/(\d[\d,.]*(?:\+|%| 万余条| 条| 倍)?)/g).map((part, index) => /^\d/.test(part) ? <strong key={index}>{part}</strong> : part);
}
function WorkDetails({ job }) {
  return <article className="work-detail-article">
    <header className="work-detail-intro"><span>{job.role}</span><p>{job.details.introduction}</p></header>
    {job.details.sections.map(section => <section className="work-detail-section" key={section.title}>
      <h3>{section.title.replace(/^[一二]、/, '')}</h3>
      {section.introduction && <p className="work-detail-context">{section.introduction}</p>}
      {section.groups.map(group => <div className="work-detail-group" key={group.title}>
        {group.title && <h4>{group.title.replace(/^\d\. /, '').split(' — ')[0]}<span>{group.title.split(' — ')[1]}</span></h4>}
        <dl>{group.items.map(([label, body]) => <div key={label}><dt>{label}</dt><dd><Highlight text={body}/></dd></div>)}</dl>
      </div>)}
    </section>)}
  </article>;
}
export default function AboutExperience() {
  const [selected, setSelected] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const panelId = useId();
  const job = workHistory[selected];
  return <div className="about-experience">
    <RequestFlow data={journey} experience>
      <address className="about-contact" id="contact">
        <a href={`tel:${profile.phone.replaceAll('-', '')}`}><Phone size={18} aria-hidden="true"/>{profile.phone}</a>
        <a href={`mailto:${profile.email}`}><EnvelopeSimple size={18} aria-hidden="true"/>{profile.email}</a>
        <span className="about-contact-actions">
          <button className="about-download" aria-expanded={expanded} aria-controls={panelId} onClick={() => setExpanded(value => !value)}>{expanded ? '收起完整经历' : '展示完整经历'}<CaretDown size={18} aria-hidden="true" style={{ transform: expanded ? 'rotate(180deg)' : undefined }}/></button>
          <a className="about-download" href={profile.resume} download="张裕安-简历.pdf">下载简历<ArrowUpRight size={18} aria-hidden="true"/></a>
        </span>
      </address>
      <section id="work-history" className="work-history" aria-label="完整工作经历">
      <div id={panelId} hidden={!expanded}>
      <div className="work-company-selector" role="group" aria-label="选择公司经历">
        {workHistory.map((item, index) => <button type="button" key={item.id} aria-pressed={selected === index} onClick={() => setSelected(index)}><span>{item.company}</span><small>{item.dates}</small></button>)}
      </div>
      <AgentTrace key={job.id} data={traces[selected]} experience detailsOnly details={<WorkDetails job={job}/>}/>
      </div>
      </section>
    </RequestFlow>
  </div>;
}
