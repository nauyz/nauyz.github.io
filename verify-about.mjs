import { chromium, expect } from '@playwright/test';
import { existsSync } from 'node:fs';
import { mkdir, writeFile } from 'node:fs/promises';

const executablePath = ['C:/Program Files/Google/Chrome/Application/chrome.exe', 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'].find(existsSync);
const browser = await chromium.launch({ executablePath, headless: true });
const page = await browser.newPage();
const errors = [];
page.on('pageerror', error => errors.push(error.message));
const url = process.env.PREVIEW_URL || 'http://127.0.0.1:5187';
await mkdir('qa/about', { recursive: true });
const checks = [];
try {
  for (const width of [1440, 390, 360, 768]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto(url);
    await page.evaluate(() => document.fonts.ready);
    await page.getByRole('link', { name: '关于我', exact: true }).click();
    await expect(page.locator('#about')).toBeInViewport();
    await expect(page.locator('.request-nodes > li')).toHaveCount(5);
    await expect(page.locator('.request-nodes > li').last()).toHaveAttribute('data-state', 'lit');
    await page.locator('#agent-trace').scrollIntoViewIfNeeded();
    await expect(page.getByRole('button', { name: '重新播放' })).toBeEnabled();
    await expect(page.locator('.trace-lines > li')).toHaveCount(3);
    await expect(page.locator('.request-nodes > li').last()).toContainText('2025.07 — 至今');
    await page.locator('#about').evaluate(el => window.scrollTo({ top: el.offsetTop - 80, behavior: 'instant' }));
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth);
    if (overflow) throw Error(`Horizontal overflow at ${width}`);
    for (const theme of ['dark', 'light']) {
      await page.evaluate(theme => document.documentElement.dataset.theme = theme, theme);
      await page.waitForTimeout(600);
      if (width === 1440 || width === 390) await page.locator('#about').screenshot({ path: `qa/about/${width}-${theme}.png` });
    }
    checks.push({ width, overflow });
  }
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto(url);
    const toggle = page.getByRole('button', { name: '展开完整经历' });
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await expect(page.locator('.trace-details')).toBeHidden();
    await toggle.focus();
    await page.keyboard.press('Enter');
    await expect(page.getByRole('button', { name: '收起完整经历' })).toHaveAttribute('aria-expanded', 'true');
    await expect(page.locator('.trace-details')).toBeVisible();
    await expect(page.locator('.trace-details dt')).toHaveCount(8);
    await expect(page.locator('.trace-details')).toContainText('UV CTR 84%');
    await expect(page.locator('.trace-details')).toContainText('18.47%');
    await expect(page.locator('.trace-details')).toContainText('全员左移');
    if (await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)) throw Error(`Expanded overflow at ${width}`);
    await page.locator('.trace-details').screenshot({ path: `qa/about/${width}-expanded.png` });
    await page.getByRole('button', { name: '收起完整经历' }).click();
    await expect(page.locator('.trace-details')).toBeHidden();
    await expect(toggle).toBeFocused();
  }
  await expect(page.locator('a[href="tel:15568773476"]')).toHaveCount(1);
  await expect(page.locator('a[href="mailto:yuan_zhang11@163.com"]')).toHaveCount(1);
  const downloadEvent = page.waitForEvent('download');
  await page.getByRole('link', { name: '下载简历' }).click();
  const download = await downloadEvent;
  if (await download.failure()) throw Error('Resume download failed');
  if (download.suggestedFilename() !== '张裕安-简历.pdf') throw Error('Unexpected download filename');
  await page.getByRole('button', { name: '重新播放' }).click();
  await expect(page.getByRole('button', { name: '重新播放' })).toBeEnabled();
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(url);
  await page.getByRole('link', { name: '关于我', exact: true }).click();
  await expect(page.getByText('AI Native 实践', { exact: true })).toBeVisible();
  await page.locator('#video').evaluate(el => window.scrollTo({ top: el.offsetTop, behavior: 'instant' }));
  await expect(page.getByRole('button', { name: '下一个案例' })).toBeEnabled();
  await page.getByRole('button', { name: '下一个案例' }).click();
  await expect(page.getByRole('heading', { name: 'One workflow. Every frame.' })).toBeVisible();
  await page.getByRole('button', { name: '查看案例', exact: true }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(page.locator('.naval-stage')).toHaveCount(1);
  await expect(page.locator('a[href="https://nauyz.github.io/personal-signal-desk/"]')).toHaveCount(1);
  if (errors.length) throw Error(errors.join('\n'));
  await writeFile('qa/about/results.json', JSON.stringify({ passed: true, checks, errors, resume: download.suggestedFilename(), reducedMotion: true, projectPagingAndDialog: true }, null, 2));
  console.log('PASS: responsive layouts, themes, contact links, PDF download, reduced motion, project paging and dialog.');
} finally { await browser.close(); }
