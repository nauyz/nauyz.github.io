import { chromium } from '@playwright/test';
import { writeFile,mkdir } from 'node:fs/promises';
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
const page=await browser.newPage({viewport:{width:1440,height:1000}});
await mkdir('qa/depth-reference',{recursive:true});
try{
 await page.goto('https://harisahmed.dev/',{waitUntil:'domcontentloaded'});await page.waitForTimeout(1200);
 const styles=await page.locator('link[rel=stylesheet]').evaluateAll(es=>es.map(e=>e.href));
 for(let i=0;i<styles.length;i++)await writeFile(`qa/depth-reference/style-${i}.css`,await(await page.request.get(styles[i])).text());
 const inspect=()=>page.locator('#projects [style*="preserve-3d"]').evaluate(el=>({scrollY, transform:el.style.transform, origin:getComputedStyle(el).transformOrigin,ancestors:(()=>{const a=[];for(let p=el.parentElement;p;p=p.parentElement){const c=getComputedStyle(p);a.push({cls:p.className,transform:c.transform,perspective:c.perspective})}return a})(),faces:[...el.querySelectorAll('.lux-card')].map(e=>({hover:e.matches(':hover'),before:(()=>{let c=getComputedStyle(e,'::before');return {content:c.content,background:c.background,opacity:c.opacity,transform:c.transform,transition:c.transition}})(),after:(()=>{let c=getComputedStyle(e,'::after');return {content:c.content,background:c.background,opacity:c.opacity,transform:c.transform,transition:c.transition}})()}))}));
 const origin=await page.locator('#projects [style*="preserve-3d"]').evaluate(el=>{let p=el;while(p&&!p.style.height?.includes('vh'))p=p.parentElement;return p.getBoundingClientRect().top+scrollY});
 for(const offset of [0,225,450,675,900]){
 await page.evaluate(y=>window.scrollTo({top:y,behavior:'instant'}),origin+offset);await page.mouse.move(1400,950);await page.waitForTimeout(1200);
 console.log('OFF',offset,JSON.stringify(await inspect()));await page.screenshot({path:`qa/depth-reference/off-${offset}.png`});
 }
 await page.mouse.move(700,480);await page.waitForTimeout(500);console.log('HOVER',JSON.stringify(await inspect()));await page.screenshot({path:'qa/depth-reference/hover.png'});
}finally{await browser.close()}
