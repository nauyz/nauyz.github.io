import { chromium } from '@playwright/test';
import fs from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { performance } from 'node:perf_hooks';
import { fileURLToPath } from 'node:url';

const out = fileURLToPath(new URL('./qa/personal-signal/', import.meta.url));
await fs.mkdir(out, { recursive: true });
const chrome = ['C:/Program Files/Google/Chrome/Application/chrome.exe', 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'].find(existsSync);
const auditOnly = process.argv.includes('--audit');
const browser = await chromium.launch({ executablePath: chrome, headless: true });
const context = await browser.newContext({ viewport: { width: 1600, height: 1000 }, deviceScaleFactor: 1,
  ...(!auditOnly && { recordVideo: { dir: out, size: { width: 1600, height: 1000 } } }) });
const page = await context.newPage();
const errors = [];
page.on('pageerror', error => errors.push(error.message));
await page.goto('http://127.0.0.1:8765/content', { waitUntil: 'networkidle' });
await page.evaluate(() => document.fonts.ready);
await page.locator('#search').waitFor({ state: 'visible' });
await page.waitForFunction(() => !document.querySelector('#search')?.disabled);
await page.locator('.content-card').first().waitFor();
const layout = await page.evaluate(() => ({ width: innerWidth, height: innerHeight, scrollWidth: document.documentElement.scrollWidth, count: document.querySelectorAll('.content-card').length }));
if (layout.scrollWidth > layout.width || errors.length) throw Error(JSON.stringify({ layout, errors }));

async function selected() {
  await page.getByRole('button', { name: '仅看精选', exact: true }).click();
  await page.waitForFunction(() => document.querySelector('[data-scope="selected"]')?.getAttribute('aria-pressed') === 'true');
  await page.waitForTimeout(450);
}
async function agent() {
  await page.locator('.advanced-filters summary').click();
  await page.locator('[data-filter="topic"] [data-value="agent"]').click();
  await page.waitForTimeout(450);
}
if (auditOnly) {
  await page.screenshot({ path: out + 'all.png' });
  await selected();
  await page.screenshot({ path: out + 'poster.png' });
  await agent();
  await page.screenshot({ path: out + 'filtered.png' });
  await page.locator('a[data-nav="projects"]').first().click();
  await page.waitForTimeout(700);
  await page.screenshot({ path: out + 'projects.png' });
  await fs.writeFile(out + 'layout-audit.json', JSON.stringify({ layout, errors }, null, 2));
} else {
  // Browser recordings omit the system pointer. A simple cursor follows actual mouse events.
  await page.evaluate(() => {
    const cursor = document.createElement('div'); cursor.id = 'capture-cursor';
    cursor.innerHTML = '<svg width="23" height="29" viewBox="0 0 23 29"><path d="M2 2 L2 23 L8 18 L13 27 L17 25 L12 16 L21 16 Z" fill="#202621" stroke="white" stroke-width="1.5"/></svg>';
    cursor.style.cssText = 'position:fixed;left:0;top:0;z-index:2147483647;pointer-events:none;transform:translate(1450px,850px)';
    document.body.append(cursor);
    document.addEventListener('mousemove', e => { cursor.style.transform = `translate(${e.clientX}px,${e.clientY}px)`; });
  });
  await page.mouse.move(1450, 850);
  // Let the recorder settle before the clean in-point; this lead-in is trimmed away.
  await page.waitForTimeout(900);
  const start = performance.now();
  const at = async seconds => { const wait = start + seconds * 1000 - performance.now(); if (wait > 0) await page.waitForTimeout(wait); };
  const moveTo = async locator => { const box = await locator.boundingBox(); if (!box) throw Error('Missing capture target'); await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2, { steps: 20 }); };
  await at(4); await moveTo(page.getByRole('button', { name: '仅看精选', exact: true })); await selected();
  await at(8); await moveTo(page.locator('.advanced-filters summary')); await page.locator('.advanced-filters summary').click();
  await at(9.5); const filter = page.locator('[data-filter="topic"] [data-value="agent"]'); await moveTo(filter); await filter.click();
  await at(13); await page.mouse.move(1210, 650, { steps: 20 }); await page.mouse.wheel(0, 230);
  await at(14.3); await moveTo(page.locator('.content-card a').filter({ hasText: '第三方原文' }).first());
  await at(17); const projects = page.locator('a[data-nav="projects"]').first(); await moveTo(projects); await projects.click(); await page.keyboard.press('Control+Home');
  await at(22); await moveTo(page.locator('a[data-nav="content"]').first()); await page.locator('a[data-nav="content"]').first().click(); await page.keyboard.press('Control+Home');
  await page.mouse.move(1450, 850, { steps: 20 });
  await at(24.3);
  await fs.writeFile(out + 'recording-report.json', JSON.stringify({ viewport: layout, errors, recordingContentMs: performance.now() - start, raw: await page.video().path() }, null, 2));
}
await context.close(); await browser.close();
console.log(JSON.stringify({ out, auditOnly, errors }));
