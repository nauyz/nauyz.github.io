import { useEffect, useRef, useState } from 'react';
import { useInView, useReducedMotion } from 'motion/react';
import { ArrowClockwise } from '@phosphor-icons/react';
import { requestFlow } from './request-flow-data';
import './request-flow.css';

function timeLabel(timestamp) {
  const date = new Date(timestamp);
  return `${date.toLocaleTimeString('en-GB', { hour12: false })}.${String(date.getMilliseconds()).padStart(3, '0')}`;
}

export default function RequestFlow({ data = requestFlow, experience = false, children }) {
  const root = useRef(null);
  const inView = useInView(root, { once: true, amount: 0.2 });
  const reduce = useReducedMotion();
  const [run, setRun] = useState(0);
  const [visible, setVisible] = useState(0);
  const [start, setStart] = useState(0);
  const complete = visible === data.logs.length;
  const active = visible ? data.logs[visible - 1].node : -1;
  useEffect(() => {
    if (!inView) return;
    setStart(Date.now());
    setVisible(reduce ? data.logs.length : 0);
    if (reduce) return;
    const timers = data.logs.map((entry, index) => setTimeout(() => setVisible(index + 1), entry.at));
    return () => timers.forEach(clearTimeout);
  }, [inView, reduce, run, data]);
  const total = data.logs.reduce((sum, entry) => sum + entry.ms, 0);
  return <section className="request-flow" id={experience ? 'about' : 'request-flow'} ref={root} aria-labelledby="request-heading">
    <div className="request-inner">
      <h2 id="request-heading">{experience ? <>关于我<em> · 张裕安</em></> : <>A request <em>travels</em>.</>}</h2>
      <p className="request-intro">{data.description}</p>
      <div className="request-panel">
        <div className="request-diagram-scroll" tabIndex={0} role="region" aria-label={experience ? '学校与公司经历，小屏可左右滑动' : '请求流转图，小屏可左右滑动'}>
          <div className="request-diagram">
            <div className="request-wire" aria-hidden="true"><div className="request-wire-fill" style={{ transform: `scaleX(${Math.max(0, active) / (data.nodes.length - 1)})` }}/><span className="request-packet" style={{ left: `${Math.max(0, active) / (data.nodes.length - 1) * 100}%`, opacity: visible && !complete ? 1 : 0 }}/></div>
            <ol className="request-nodes">{data.nodes.map((node, index) => <li key={node.code} data-state={index <= active ? 'lit' : 'idle'} aria-current={index === active ? 'step' : undefined}>
              <div className="request-chip">{node.code}</div><div className="request-node-name">{node.name}</div><div className="request-node-detail">{node.detail}</div>
            </li>)}</ol>
          </div>
        </div>
        {!experience && <><div className="request-log" role="region" aria-label="请求演示日志" tabIndex={0}>
          {visible === 0 && <div className="request-log-empty">等待发送演示请求<span className="request-caret" aria-hidden="true">▍</span></div>}
          {data.logs.slice(0, visible).map((entry, index) => <div className="request-log-row" key={`${run}-${index}`}>
            <time>{timeLabel(start + entry.at)}</time><span className="request-service">{entry.service}</span><span className="request-message">{entry.message} <span className="request-duration">+{entry.ms}ms</span></span>
          </div>)}
        </div>
        <div className="request-bottom"><div className="request-result" role="status">示例数据 · total: <strong>{complete ? `${total} ms` : '…'}</strong><span> · {complete ? '请求已完成' : '请求流转中'}</span></div><button className="request-replay" disabled={!complete} onClick={() => { setVisible(0); setRun(value => value + 1); }}><ArrowClockwise size={14} aria-hidden="true"/>{complete ? 'send request' : 'request running'}</button></div></>}
        {children}
      </div>
    </div>
  </section>;
}
