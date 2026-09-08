import { chromium, expect } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
const browser = await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
const page = await browser.newPage();
const errors=[];page.on('pageerror',e=>errors.push(e.message));
await mkdir('qa/about',{recursive:true});
try {
for(const width of [1440,390]) {
 await page.setViewportSize({width,height:1000});
 await page.goto('http://127.0.0.1:5187/');
 const toggle=page.getByRole('button',{name:'展示完整经历'});
 await expect(toggle).toHaveAttribute('aria-expanded','false');
 await expect(page.locator('.work-company-selector')).toBeHidden();
 await expect(page.locator('.trace-lines')).toBeHidden();
 await toggle.focus();await page.keyboard.press('Enter');
 await expect(page.locator('.work-company-selector')).toBeVisible();
 await expect(page.locator('.trace-details')).toContainText('84%');
 for(const [company,evidence] of [['思必驰','95%'],['爱莫科技','LangChain'],['小米','84%']]) {
  await page.getByRole('button',{name:new RegExp(company+' ')}).click();
  await expect(page.locator('.trace-details')).toBeVisible();
  await expect(page.locator('.trace-details')).toContainText(evidence);
  await expect(page.locator('.trace-lines')).toBeHidden();
 }
 if(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth))throw Error('Overflow');
 await page.locator('#work-history').screenshot({path:`qa/about/${width}-hierarchy.png`});
 await page.getByRole('button',{name:'收起完整经历'}).click();
 await expect(page.locator('.work-company-selector')).toBeHidden();
 await expect(page.locator('.trace-details')).toBeHidden();
 await expect(toggle).toBeFocused();
}
if(errors.length)throw Error(errors.join('\n'));
console.log('PASS: collapsed default, keyboard expansion, company switching without collapse, no summaries, collapse, desktop/mobile layouts');
}finally{await browser.close();}