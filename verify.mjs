import { chromium, expect } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';

const executablePath = process.env.CHROME_PATH || ['C:/Program Files/Google/Chrome/Application/chrome.exe', 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'].find(existsSync);
const browser = await chromium.launch({ executablePath, headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 1 });
const errors = [];
page.on('pageerror', error => errors.push(error.message));
const url = process.env.PREVIEW_URL || 'http://127.0.0.1:5173';
await mkdir('qa', { recursive: true });
try {
  await page.goto(url);
  await page.evaluate(() => document.fonts.ready);
  await expect(page.getByRole('heading', { name: 'Selected work.' })).toBeVisible();
  await page.locator('#video').evaluate(el => window.scrollTo({ top: el.offsetTop + 25, behavior: 'instant' }));
  await page.waitForTimeout(550);
  await page.screenshot({ path: 'qa/desktop-feature.png' });
  await page.getByRole('button', { name: '下一个案例' }).click();
  await expect(page.getByRole('heading', { name: 'One workflow. Every frame.' })).toBeVisible();
  await page.getByRole('button', { name: '下一个案例' }).isDisabled().then(value => { if (!value) throw Error('Last slide boundary failed'); });
  await page.locator('.deck-perspective').focus();
  await page.keyboard.press('ArrowLeft');
  await expect(page.getByRole('heading', { name: 'From a thought. To a finished film.' })).toBeVisible();
  await page.getByRole('button', { name: '查看案例' }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(page.getByRole('button', { name: '查看案例' })).toBeFocused();
  await page.locator('#projects').scrollIntoViewIfNeeded();
  await page.waitForTimeout(650);
  await page.screenshot({ path: 'qa/desktop-projects.png' });
  await page.getByRole('button', { name: '预览纳瓦尔 APP' }).click();
  await expect(page.getByRole('dialog')).toContainText('纳瓦尔 APP');
  await page.getByRole('button', { name: '关闭项目详情' }).click();
  await page.getByRole('button', { name: '切换浅色主题' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await page.locator('#projects').evaluate(el => window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY + 50, behavior: 'instant' }));
  await page.waitForTimeout(400);
  await page.screenshot({ path: 'qa/light-projects.png' });
  await page.getByRole('button', { name: '切换深色主题' }).click();
  const checks = [];
  for (const width of [360, 390, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: width < 768 ? 844 : 1000 });
    await page.goto(url);
    await page.locator('#video').evaluate(el => window.scrollTo({ top: el.offsetTop + 20, behavior: 'instant' }));
    await page.waitForTimeout(500);
    const measurement = await page.evaluate(() => ({ width: innerWidth, documentWidth: document.documentElement.scrollWidth, cardOverflow: document.querySelector('.feature-card').scrollHeight > document.querySelector('.feature-card').clientHeight + 2 }));
    if (measurement.documentWidth > width || measurement.cardOverflow) throw Error(`Layout overflow: ${JSON.stringify(measurement)}`);
    checks.push(measurement);
    if (width === 390) {
      await page.screenshot({ path: 'qa/mobile-feature.png' });
      await page.getByRole('button', { name: '下一个案例' }).click();
      await expect(page.getByRole('heading', { name: 'One workflow. Every frame.' })).toBeVisible();
      await page.locator('#projects').scrollIntoViewIfNeeded();
      await page.waitForTimeout(600);
      await page.screenshot({ path: 'qa/mobile-projects.png' });
    }
  }
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(url);
  await page.getByRole('button', { name: '下一个案例' }).click();
  await expect(page.getByRole('heading', { name: 'One workflow. Every frame.' })).toBeVisible();
  if (errors.length) throw Error(errors.join('\n'));
  await writeFile('qa/results.json', JSON.stringify({ passed: true, checks, errors, verified: ['scroll and button paging', 'keyboard paging', 'slide boundaries', 'dialog and Escape', 'focus return', 'media preview', 'light theme', 'mobile paging', 'responsive overflow', 'reduced motion'] }, null, 2));
  console.log('PASS: navigation, dialogs, themes, reduced motion and five responsive widths. Screenshots: qa/');
} finally { await browser.close(); }
