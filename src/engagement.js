// Durations are estimates of visible/active time, never proof of attention.
export function startEngagement(track) {
  let last = performance.now(), activeAt = last, foreground = 0, active = 0;
  let sentForeground = 0, sentActive = 0, lastFlush = last;
  let running = true;
  const depths = new Set(), sections = new Map(), videos = new Map(), faces = new Set();
  const listeners = [];
  const listen = (target, name, fn, options) => {
    target.addEventListener(name, fn, options);
    listeners.push(() => target.removeEventListener(name, fn, options));
  };
  function visible(element) {
    if (element.closest('[hidden], [aria-hidden="true"], [inert]')) return false;
    const rect = element.getBoundingClientRect();
    return rect.width > 0 && rect.height > 0 && Math.min(rect.bottom, innerHeight) - Math.max(rect.top, 0) >= Math.min(rect.height, innerHeight) * 0.3;
  }
  function videoState(video) {
    if (!videos.has(video)) videos.set(video, { project: video.dataset.analyticsProject, seconds: 0, sent: 0, time: video.currentTime, errors: new Set(), milestones: new Set() });
    return videos.get(video);
  }
  function sample() {
    const now = performance.now(), dt = Math.min((now - last) / 1000, 2);
    last = now;
    if (!running || document.hidden) return;
    const media = [...document.querySelectorAll('video[data-analytics-project]')];
    const watching = media.some(v => !v.paused && !v.seeking && v.readyState >= 2 && visible(v));
    const engaged = now - activeAt < 60000 || watching;
    foreground += dt;
    if (engaged) active += dt;
    const distance = document.documentElement.scrollHeight - innerHeight;
    // Short pages are fully visible; expandable content can change this denominator.
    const depth = distance <= 0 ? 100 : Math.min(100, scrollY / distance * 100);
    for (const threshold of [25, 50, 75, 95]) if (depth >= threshold && !depths.has(threshold)) {
      depths.add(threshold); track('scroll_depth', { percent: threshold });
    }
    document.querySelectorAll('[data-analytics-section]').forEach(element => {
      const id = element.dataset.analyticsSection;
      if (!visible(element)) return;
      if (!sections.has(id)) { sections.set(id, { seconds: 0, sent: 0 }); track('section_view', { section: id }); }
      if (engaged) sections.get(id).seconds += dt;
    });
    const studio = document.querySelector('#video');
    if (studio && visible(studio) && !faces.has(studio.dataset.face)) {
      faces.add(studio.dataset.face); track('studio_face_view', { face: studio.dataset.face === '1' ? 'architecture' : 'demo' });
    }
    media.forEach(video => {
      const state = videoState(video), advance = video.currentTime - state.time;
      // Ignore seek jumps, buffering, background playback, and hidden reverse faces.
      if (!video.paused && !video.seeking && video.readyState >= 2 && visible(video) && advance > 0 && advance <= dt * Math.max(video.playbackRate, 1) + 0.75) {
        state.seconds += Math.min(dt, advance / Math.max(video.playbackRate, 0.1));
        for (const seconds of [10, 30, 60, 120]) if (state.seconds >= seconds && !state.milestones.has(seconds)) {
          state.milestones.add(seconds); track('video_watch_milestone', { project: state.project, seconds });
        }
      }
      state.time = video.currentTime;
    });
    if (now - lastFlush >= 30000) flush();
  }
  function flush() {
    lastFlush = performance.now();
    const f = Math.floor(foreground), a = Math.floor(active);
    if (f > sentForeground) {
      track('engagement_time', { foreground_seconds: f - sentForeground, active_seconds: a - sentActive });
      sentForeground = f; sentActive = a;
    }
    sections.forEach((s, section) => {
      const delta = Math.floor(s.seconds) - s.sent;
      if (delta > 0) { track('section_time', { section, seconds: delta }); s.sent += delta; }
    });
    videos.forEach(s => {
      const delta = Math.floor(s.seconds) - s.sent;
      if (delta > 0) { track('video_watch_time', { project: s.project, seconds: delta }); s.sent += delta; }
    });
  }
  const activity = () => { activeAt = performance.now(); };
  ['pointerdown', 'keydown', 'scroll'].forEach(name => listen(window, name, activity, { passive: true }));
  listen(document, 'click', event => {
    const target = event.target.closest?.('button, a');
    if (!target || target.disabled || target.hasAttribute('data-analytics-event')) return;
    const company = target.dataset.analyticsCompany;
    if (company) { if (target.getAttribute('aria-pressed') !== 'true') track('company_select', { company }); return; }
    const href = target.getAttribute('href') || '';
    if (href.startsWith('tel:') || href.startsWith('mailto:')) track('contact_click', { method: href.startsWith('tel:') ? 'phone' : 'email' });
    else if (href.startsWith('#')) track('navigation_click', { target: href.slice(0, 40) });
    else if (target.closest('.studio-playbar, .project-playback')) {
      const label = target.getAttribute('aria-label');
      const action = label?.startsWith('暂停') ? 'pause' : label?.startsWith('播放') ? 'play' : label?.startsWith('重播') ? 'replay' : null;
      const video = target.closest('.studio-face, .project-card')?.querySelector('video[data-analytics-project]');
      if (action) track('media_control', { action, project: video?.dataset.analyticsProject || 'architecture' });
    } else if (target.closest('.deck-controls')) track('studio_flip_click', { direction: target.getAttribute('aria-label') === '下一面' ? 'next' : 'previous' });
  }, true);
  listen(document, 'error', event => {
    if (!event.target.matches?.('video[data-analytics-project]')) return;
    const video = event.target, state = videoState(video), code = video.error?.code || 0;
    if (!state.errors.has(code)) { state.errors.add(code); track('video_error', { project: state.project, code }); }
  }, true);
  listen(document, 'seeked', event => {
    if (event.target.matches?.('video[data-analytics-project]')) videoState(event.target).time = event.target.currentTime;
  }, true);
  listen(document, 'visibilitychange', () => { flush(); last = performance.now(); if (!document.hidden) activeAt = last; });
  listen(window, 'pagehide', () => { sample(); flush(); running = false; });
  listen(window, 'pageshow', () => { running = true; last = performance.now(); activeAt = last; });
  const timer = setInterval(sample, 1000);
  return () => { clearInterval(timer); listeners.forEach(remove => remove()); };
}
