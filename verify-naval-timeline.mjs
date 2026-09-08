import {chromium,expect} from '@playwright/test';
import {navalTimeline as entries} from './src/naval-timeline.js';
import fs from 'node:fs/promises';
const b=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'}),results=[];
try{
 for(const width of [1440,390,360]){
  const p=await b.newPage({viewport:{width,height:1100}});
  await p.goto('http://127.0.0.1:5173/');const stage=p.locator('.naval-stage'),v=stage.locator('video'),card=p.locator('.naval-cover');
  await stage.scrollIntoViewIfNeeded();await expect.poll(()=>v.evaluate(e=>!e.paused&&e.currentTime>0)).toBe(true);
  const boxes=await stage.locator('.naval-device').evaluateAll(es=>es.map(e=>{const r=e.getBoundingClientRect();return {x:r.x,y:r.y,w:r.width,h:r.height}}));
  expect(boxes[0].w).toBe(boxes[1].w);expect(boxes[0].h).toBe(boxes[1].h);expect(boxes[0].x+boxes[0].w).toBeLessThan(boxes[1].x);
  expect(boxes[0].x).toBeGreaterThan(0);expect(boxes[1].x+boxes[1].w).toBeLessThan(width);
  if(width!==360)for(const entry of entries){
    await v.evaluate((e,t)=>{e.currentTime=t},entry.at-.2);
    await p.waitForFunction(()=>document.querySelector('.naval-stage').dataset.cue==='rest');
    const held=await v.evaluate(e=>e.currentTime);expect(held).toBeLessThan(entry.landing);
    await p.waitForFunction(()=>document.querySelector('.naval-stage').dataset.cue==='tap');
    await expect(stage).toHaveAttribute('data-feature',entry.label);expect(await v.evaluate(e=>e.currentTime)).toBe(held);
    await p.waitForFunction(()=>document.querySelector('.naval-stage').dataset.cue==='transfer');
    await card.getByRole('button',{name:'暂停演示'}).click();await p.waitForTimeout(180);expect(await v.evaluate(e=>e.currentTime)).toBe(held);
    await card.getByRole('button',{name:'播放演示'}).click();
    await p.waitForFunction(()=>document.querySelector('.naval-stage').dataset.cue==='demo');
    const resumed=await v.evaluate(e=>e.currentTime);expect(resumed).toBeGreaterThanOrEqual(held);expect(resumed-held).toBeLessThan(.25);
    await v.evaluate((e,t)=>{e.currentTime=t},entry.landing+.25);
    await expect(stage).toHaveAttribute('data-feature',entry.label);
    if(width===1440&&['original','continue'].includes(entry.id))await p.locator('.project-card').first().screenshot({path:`qa/naval/timeline-${entry.id}.png`});
    const next=entries[entries.indexOf(entry)+1];
    await v.evaluate((e,t)=>{e.currentTime=t},Math.min(entry.home+.05,next?next.at-.3:59));await expect(stage).toHaveAttribute('data-feature',entry.label);
  }
  if(width!==360){await v.evaluate(e=>{e.currentTime=59.7});await expect.poll(()=>v.evaluate(e=>e.currentTime<1)).toBe(true);await p.waitForFunction(()=>document.querySelector('.naval-stage').dataset.cue==='tap');await expect(stage).toHaveAttribute('data-feature','目录');}
  await p.evaluate(()=>window.scrollTo({top:0,behavior:'instant'}));await expect(v).toHaveJSProperty('paused',true);
  results.push({width,passed:true,boxes});await p.close();
 }
 for(const mode of ['reduce','blocked','missing']){
  const p=await b.newPage({viewport:{width:1440,height:1100},reducedMotion:mode==='reduce'?'reduce':'no-preference'});
  if(mode==='missing')await p.route('**/naval/user-timeline.mp4',r=>r.abort());
  if(mode==='blocked')await p.addInitScript(()=>{const original=HTMLMediaElement.prototype.play;let blocked=false;HTMLMediaElement.prototype.play=function(){if(this.src.includes('user-timeline')&&!blocked){blocked=true;return Promise.reject(new DOMException('Blocked','NotAllowedError'));}return original.call(this);};});
  await p.goto('http://127.0.0.1:5173/');await p.locator('.naval-stage').scrollIntoViewIfNeeded();
  if(mode==='missing')await expect(p.locator('.naval-playback')).toHaveText('演示暂不可用');
  else{if(mode==='blocked')await expect(p.locator('.naval-stage')).toHaveAttribute('data-cue','demo');await p.locator('.naval-cover').getByRole('button',{name:'播放演示'}).click();await expect.poll(()=>p.locator('.naval-stage video').evaluate(e=>!e.paused)).toBe(true);}
  results.push({mode,passed:true});await p.close();
 }
}finally{await b.close();await fs.writeFile('qa/naval/timeline-tests.json',JSON.stringify(results,null,2));}
console.log(results);
