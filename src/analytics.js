// Analytics never blocks navigation, video controls, or rendering.
export function initAnalytics({ websiteId, scriptUrl, domains = ['nauyz.github.io'] }) {
  const query = new URLSearchParams(location.search);
  try {
    if (query.get('analytics') === 'off') localStorage.setItem('umami.disabled', '1');
    if (query.get('analytics') === 'on') localStorage.removeItem('umami.disabled');
    if (localStorage.getItem('umami.disabled')) return;
  } catch { /* Storage can be unavailable in embedded browsers. */ }
  if (!websiteId || !scriptUrl || !domains.includes(location.hostname) || query.has('video_debug') || navigator.doNotTrack === '1') return;
  if (document.getElementById('portfolio-analytics')) return;

  const pending = [];
  let ready = false;
  let stopped = false;
  function track(name, data) {
    if (stopped) return;
    if (!ready) { if (pending.length < 30) pending.push([name, data]); return; }
    try { Promise.resolve(window.umami.track(name, data)).catch(() => {}); } catch { /* Ignore collector errors. */ }
  }
  const onClick = event => {
    const target = event.target.closest?.('[data-analytics-event]');
    if (!target || target.disabled) return;
    if (target.dataset.analyticsEvent === 'experience_open' && target.getAttribute('aria-expanded') === 'true') return;
    track(target.dataset.analyticsEvent, target.dataset.analyticsProject ? { project: target.dataset.analyticsProject } : undefined);
  };
  // Count the first actual playback per video per page, not every seek/resume.
  const played = new WeakSet();
  const onPlaying = event => {
    const video = event.target;
    if (!video.matches?.('video[data-analytics-project]') || played.has(video)) return;
    played.add(video);
    track('video_play', { project: video.dataset.analyticsProject });
  };
  document.addEventListener('click', onClick, true);
  document.addEventListener('playing', onPlaying, true);
  const script = document.createElement('script');
  script.id = 'portfolio-analytics';
  script.src = scriptUrl;
  script.defer = true;
  script.dataset.websiteId = websiteId;
  script.dataset.autoTrack = 'false';
  script.dataset.excludeSearch = 'true';
  script.dataset.excludeHash = 'true';
  script.onload = async () => {
    try {
      // Random browser ID: no email, phone number, or browser fingerprint.
      let visitor;
      try {
        visitor = localStorage.getItem('portfolio.visitor');
        if (!visitor) { visitor = crypto.randomUUID(); localStorage.setItem('portfolio.visitor', visitor); }
      } catch { /* Default Umami session counting still works without storage. */ }
      if (visitor) await window.umami.identify(visitor);
      await window.umami.track();
      ready = true;
      pending.splice(0).forEach(([name, data]) => track(name, data));
    } catch { stop(); }
  };
  function stop() {
    stopped = true;
    pending.length = 0;
    document.removeEventListener('click', onClick, true);
    document.removeEventListener('playing', onPlaying, true);
  }
  script.onerror = stop;
  document.head.appendChild(script);
}
