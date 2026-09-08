import { useEffect, useRef, useState } from 'react';
import { useInView, useReducedMotion } from 'motion/react';
import { ArrowClockwise } from '@phosphor-icons/react';
import './agent-trace.css';

// Display values are demonstration data, not live telemetry. Replace here later.
export const traceDemo = {
  label: 'LIVE · AGENT RUN', context: '演示流程', title: 'AGENT.TRACE · DEMO RUN',
  summary: 'CACHED · COST $0.0019',
  steps: [
    { tool: 'router.classify', arg: '"create a video"', detail: 'intent=video', ms: 42 },
    { tool: 'retriever.search', arg: 'k=8 · rerank', detail: 'assets=ready', ms: 191 },
    { tool: 'llm.stream', arg: 'script · storyboard', detail: 'frames=planned', ms: 612 },
    { tool: 'trace.log', arg: 'ok', detail: 'workflow complete', ms: 6 },
  ],
};

export default function AgentTrace({ data = traceDemo, experience = false }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.35 });
  const reduce = useReducedMotion();
  const [statuses, setStatuses] = useState(() => data.steps.map(() => 'pending'));
  const [run, setRun] = useState(0);
  const complete = statuses.every(status => status === 'ok');
  useEffect(() => {
    if (!inView) return;
    if (reduce) { setStatuses(data.steps.map(() => 'ok')); return; }
    setStatuses(data.steps.map(() => 'pending'));
    const timers = [];
    let time = 220;
    data.steps.forEach((step, index) => {
      timers.push(setTimeout(() => setStatuses(current => current.map((state, i) => i === index ? 'running' : state)), time));
      time += experience ? 650 : Math.max(320, step.ms * 4);
      timers.push(setTimeout(() => setStatuses(current => current.map((state, i) => i === index ? 'ok' : state)), time));
    });
    return () => timers.forEach(clearTimeout);
  }, [inView, reduce, run, data, experience]);
  return <section id="agent-trace" className="trace-section" ref={ref} aria-label={experience ? '小米工作经历' : 'Agent 运行流程演示'}>
    <div className="trace-eyebrow"><h2>/ {data.label}</h2><span>{data.context}</span></div>
    <div className="trace-window">
      <div className="trace-chrome"><span className="trace-dots" aria-hidden="true"><i/><i/><i/></span><span>{data.title}</span><span className="trace-live">● {experience ? '小米' : complete ? 'DONE' : 'LIVE'}</span></div>
      <ol className="trace-lines" aria-label={experience ? '工作内容' : '示例执行步骤'}>{data.steps.map((step, index) => <li key={step.tool} data-status={statuses[index]}>
        <span className="trace-number" aria-hidden="true">{String(index).padStart(2, '0')}</span>
        <span className="trace-marker" aria-hidden="true">{statuses[index] === 'ok' ? '✓' : statuses[index] === 'running' ? '▸' : '·'}</span>
        <span className="trace-code"><span className="trace-tool">{step.tool}</span>{experience ? <><br/><span className="trace-output">{step.detail}</span></> : <><span className="trace-punctuation">(</span><span className="trace-arg">{step.arg}</span><span className="trace-punctuation">)</span><wbr/><span className="trace-output"> → {step.detail}</span><span className="trace-ms"> {step.ms}ms</span></>}</span>
      </li>)}</ol>
      <div className="trace-summary"><span>{experience ? '2025.07 — 至今' : `TOTAL · ${data.steps.reduce((sum,step) => sum + step.ms, 0)}MS`}</span><span><b aria-hidden="true">●</b> {data.summary}</span></div>
    </div>
    <div className="trace-actions"><span role="status">{experience ? complete ? '经历已展开' : '逐项展开工作经历' : complete ? '示例流程已完成' : inView ? '正在演示执行过程' : '示例流程'}</span><button disabled={!complete} onClick={() => { setStatuses(data.steps.map(() => 'pending')); setRun(value => value + 1); }}><ArrowClockwise size={14} aria-hidden="true"/>重新播放</button></div>
  </section>;
}
