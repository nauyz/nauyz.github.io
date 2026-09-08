import { EnvelopeSimple, Phone, ArrowUpRight } from '@phosphor-icons/react';
import RequestFlow from './RequestFlow';
import AgentTrace from './AgentTrace';
import { profile, experience, xiaomiWork, xiaomiDetails } from './experience-data';
import './about-experience.css';

const journey = {
  description: profile.introduction,
  nodes: experience.map(item => ({ code: item.name, name: item.dates, detail: item.description })),
  // Presentation timing only: no performance metrics or simulated work logs.
  logs: experience.map((_, index) => ({ node: index, at: 180 + index * 650, ms: 0 })),
};
const workTrace = {
  label: '小米 · 工作经历', context: '用户产品经理',
  title: 'XIAOMI · PRODUCT', summary: '电视与视频事业部 · 核心产品组',
  steps: xiaomiWork.map(item => ({ tool: item.title, detail: item.lines.join('') })),
};

export default function AboutExperience() {
  return <div className="about-experience">
    <RequestFlow data={journey} experience>
      <AgentTrace data={workTrace} experience details={<>
        <p>{xiaomiDetails.introduction}</p>
        {xiaomiDetails.sections.map(section => <section key={section.title}>
          <h3>{section.title}</h3>
          {section.introduction && <p>{section.introduction}</p>}
          {section.groups.map(group => <div key={group.title}>
            {group.title && <h4>{group.title}</h4>}
            <dl>{group.items.map(([label, body]) => <div key={label}><dt>{label}</dt><dd>{body}</dd></div>)}</dl>
          </div>)}
        </section>)}
      </>}/>
      <address className="about-contact" id="contact">
        <a href={`tel:${profile.phone.replaceAll('-', '')}`}><Phone size={18} aria-hidden="true"/>{profile.phone}</a>
        <a href={`mailto:${profile.email}`}><EnvelopeSimple size={18} aria-hidden="true"/>{profile.email}</a>
        <a className="about-download" href={profile.resume} download="张裕安-简历.pdf">下载简历<ArrowUpRight size={18} aria-hidden="true"/></a>
      </address>
    </RequestFlow>
  </div>;
}
