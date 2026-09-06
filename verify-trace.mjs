import { chromium, expect } from '@playwright/test';
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
const page=await browser.newPage({viewport:{width:1440,height:1000}});
const errors=[];page.on('pageerror',e=>errors.push(e.message));
try{
 await page.goto('http://127.0.0.1:5173/#agent-trace');
 await expect(page.locator('.trace-lines [data-status=running]')).toHaveCount(1);
 await expect(page.locator('.trace-lines [data-status=ok]')).toHaveCount(4,{timeout:8000});
 await page.locator('.trace-section').screenshot({path:'qa/agent-trace-desktop.png'});
 await page.getByRole('button',{name:'重新播放'}).click();
 await expect(page.locator('.trace-lines [data-status=pending]')).toHaveCount(4);
 await expect(page.locator('.trace-lines [data-status=ok]')).toHaveCount(4,{timeout:8000});
 await page.setViewportSize({width:390,height:844});
 await page.locator('.trace-section').screenshot({path:'qa/agent-trace-mobile.png'});
 if(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth))throw Error('Mobile overflow');
 await page.emulateMedia({reducedMotion:'reduce'});await page.reload();
 await expect(page.locator('.trace-lines [data-status=ok]')).toHaveCount(4);
 if(errors.length)throw Error(errors.join('\n'));
 console.log('PASS: sequential execution, replay, mobile layout, reduced motion, no browser exceptions.');
}finally{await browser.close();}
