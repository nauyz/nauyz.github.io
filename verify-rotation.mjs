import { chromium, expect } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
const browser = await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
await mkdir('qa/rotation',{recursive:true});
const context = await browser.newContext({viewport:{width:1440,height:1000},recordVideo:{dir:'qa/rotation',size:{width:1440,height:1000}}});
const page = await context.newPage();
const samples = [];
try {
 await page.goto('http://127.0.0.1:5173/');
 await page.evaluate(()=>document.fonts.ready);
 for (const progress of [0,.25,.49,.51,.75,1,.75,.25,0]) {
  await page.locator('#video').evaluate((el,p)=>window.scrollTo({top:el.offsetTop+(el.offsetHeight-innerHeight)*p,behavior:'instant'}),progress);
  await page.waitForTimeout(180);
  const state=await page.locator('.flip-wrapper').evaluate(el=>({transform:el.style.transform,backface:getComputedStyle(el.firstElementChild).backfaceVisibility,faces:el.children.length}));
  const angle=Number(state.transform.match(/rotateY\(([-\d.]+)deg\)/)?.[1] || 0);
  if(Math.abs(angle+progress*180)>.5)throw Error(`Angle ${angle}, expected ${-progress*180}`);
  if(state.faces!==2||state.backface!=='hidden')throw Error('Physical faces invalid');
  samples.push({progress,angle});
  await page.screenshot({path:`qa/rotation/angle-${Math.round(progress*180)}.png`});
 }
 // A continuous real wheel pass, forward and backward, for the review recording.
 await page.mouse.move(1350,500);
 const travel=await page.locator('#video').evaluate(el=>el.offsetHeight-innerHeight);
 for(const direction of [1,-1]) for(let step=0;step<42;step++) {await page.mouse.wheel(0,direction*travel/42);await page.waitForTimeout(50);}
  await expect(page.getByRole('heading',{name:'From a thought. To a finished film.'})).toBeVisible();
 await page.mouse.move(700,480);await page.waitForTimeout(600);
 const light=await page.locator('.flip-face').first().evaluate(el=>({shadow:getComputedStyle(el).boxShadow,glaze:getComputedStyle(el,'::before').opacity}));
 if(light.glaze!=='1'||!light.shadow.includes('30px 70px -18px'))throw Error('Reference glow or hover glaze missing');
 await page.screenshot({path:'qa/rotation/hover-glow.png'});
 await page.waitForTimeout(800);
 await writeFile('qa/rotation/results.json',JSON.stringify({passed:true,samples},null,2));
 const video=page.video();
 await page.close();await video.saveAs('qa/rotation/scroll-rotation.webm');
 console.log('PASS: continuous 0 to -180 degrees, edge-on handoff, reverse scroll. qa/rotation/scroll-rotation.webm');
} finally {await context.close();await browser.close();}
