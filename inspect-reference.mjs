import { chromium } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
const browser = await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
const page = await browser.newPage({viewport:{width:1440,height:1000}});
await mkdir('qa/reference',{recursive:true});
try {
 await page.goto('https://harisahmed.dev/',{waitUntil:'domcontentloaded',timeout:60000});
 await page.waitForTimeout(2000);
 console.log(await page.locator('section').evaluateAll(els=>els.map(el=>({id:el.id,cls:el.className,top:el.offsetTop,height:el.offsetHeight,text:el.textContent.slice(0,90)}))));
 console.log(await page.locator('#projects [style]').evaluateAll(els=>els.filter(el=>el.style.height || el.style.transformStyle).map(el=>({tag:el.tagName,cls:el.className,style:el.getAttribute('style'),top:el.getBoundingClientRect().top+scrollY,height:el.offsetHeight}))));
 for (const y of [4300,4700,4900,5100,5300,5500]) {
   await page.evaluate(y=>window.scrollTo({top:y,behavior:'instant'}),y);
   await page.waitForTimeout(1000);
   await page.screenshot({path:`qa/reference/scroll-${y}.png`});
   console.log(y,await page.locator('#projects [style*="preserve-3d"]').evaluateAll(els=>els.map(el=>el.getAttribute('style'))));
 }
} finally {await browser.close();}
