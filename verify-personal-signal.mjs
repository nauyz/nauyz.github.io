import { chromium, expect } from '@playwright/test';
import fs from 'node:fs/promises';
const browser = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
const results = [];
const out = 'qa/personal-signal/';
async function scenario(name, options, run, setup) {
  const context = await browser.newContext(options);
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  try {
    if (setup) await setup(page);
    await page.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle' });
    const card = page.locator('.project-card').filter({ has: page.getByRole('heading', { name: '个人信源', exact: true }) });
    await card.scrollIntoViewIfNeeded();
    await page.waitForTimeout(650);
    await run(page, card, card.locator('video'));
    expect(errors).toEqual([]);
    results.push({ name, status: 'passed' });
  } finally { await context.close(); }
}
try {
  for (const width of [1440, 390]) await scenario(`playback-${width}`, { viewport: { width, height: width === 390 ? 844 : 1100 } }, async (page, card, video) => {
    await expect.poll(() => video.evaluate(v => !v.paused && v.currentTime > 0)).toBe(true);
    await expect(video).toHaveJSProperty('muted', true);
    await expect(video).toHaveJSProperty('loop', true);
    await card.locator('.monitor-screen').click({ position: { x: 30, y: 30 } });
    await expect(page.locator('dialog')).toHaveCount(0);
    await expect(card.locator('.cover-open')).toHaveCount(0);
    const link = card.getByRole('link', { name: '打开个人信源' });
    await expect(link).toHaveAttribute('href', 'https://nauyz.github.io/personal-signal-desk/');
    await expect(link).toHaveAttribute('target', '_blank');
    await card.getByRole('button', { name: '暂停演示' }).click();
    await expect(video).toHaveJSProperty('paused', true);
    await video.evaluate(v => new Promise(resolve => { v.addEventListener('seeked', resolve, { once: true }); v.currentTime = 6; }));
    await page.waitForTimeout(350);
    await card.screenshot({ path: out + `card-${width}.png` });
    await page.screenshot({ path: out + `page-${width}.png` });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
    await page.waitForTimeout(250); await card.scrollIntoViewIfNeeded(); await page.waitForTimeout(350);
    await expect(video).toHaveJSProperty('paused', true);
    await card.getByRole('button', { name: '播放演示' }).click();
    await expect.poll(() => video.evaluate(v => !v.paused)).toBe(true);
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
    await expect.poll(() => video.evaluate(v => v.paused)).toBe(true);
    await card.scrollIntoViewIfNeeded(); await expect.poll(() => video.evaluate(v => !v.paused)).toBe(true);
    // Simulate the browser visibility signal deterministically in headless Chromium.
    await page.evaluate(() => { Object.defineProperty(document, 'hidden', { configurable: true, get: () => true }); document.dispatchEvent(new Event('visibilitychange')); });
    await expect(video).toHaveJSProperty('paused', true);
    await page.evaluate(() => { delete document.hidden; document.dispatchEvent(new Event('visibilitychange')); });
    await expect.poll(() => video.evaluate(v => !v.paused)).toBe(true);
    await video.evaluate(v => { v.currentTime = v.duration - 0.15; });
    await expect.poll(() => video.evaluate(v => v.currentTime < 2)).toBe(true);
    if (width === 1440) {
      await page.locator('.naval-home').click({ position: { x: 30, y: 30 } });
      await expect(page.locator('dialog')).toHaveCount(0);
    }
  });
  await scenario('reduced-motion', { viewport: { width: 1440, height: 1100 }, reducedMotion: 'reduce' }, async (page, card, video) => {
    await expect(video).toHaveJSProperty('paused', true);
    await expect(card.locator('.inline-video-poster')).toBeVisible();
    await card.getByRole('button', { name: '播放演示' }).click();
    await expect.poll(() => video.evaluate(v => !v.paused)).toBe(true);
  });
  await scenario('autoplay-blocked', { viewport: { width: 1440, height: 1100 } }, async (page, card, video) => {
    await expect(video).toHaveJSProperty('paused', true);
    await expect(card.locator('.inline-video-poster')).toBeVisible();
    await card.getByRole('button', { name: '播放演示' }).click();
    await expect.poll(() => video.evaluate(v => !v.paused)).toBe(true);
  }, page => page.addInitScript(() => {
    const original = HTMLMediaElement.prototype.play;
    let blocked = false;
    HTMLMediaElement.prototype.play = function () { if (!blocked && this.src.includes('/personal-signal/')) { blocked = true; return Promise.reject(new DOMException('Test autoplay policy', 'NotAllowedError')); } return original.call(this); };
  }));
  await scenario('missing-video', { viewport: { width: 1440, height: 1100 } }, async (page, card) => {
    await expect(card.locator('.inline-video-unavailable')).toBeVisible();
    await expect(card.locator('.inline-video-poster')).toBeVisible();
    await expect(card.getByRole('link', { name: '打开个人信源' })).toBeVisible();
  }, page => page.route('**/media/personal-signal/demo.mp4', route => route.abort()));
} finally {
  await fs.writeFile(out + 'playback-tests.json', JSON.stringify(results, null, 2));
  await browser.close();
}
console.log(JSON.stringify(results));
