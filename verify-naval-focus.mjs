import {chromium,expect} from '@playwright/test';
import fs from 'node:fs/promises';
const b=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});
try{
 const p=await b.newPage({viewport:{width:1440,height:1100}});
 await p.goto('http://127.0.0.1:5173/');await p.locator('.naval-stage').scrollIntoViewIfNeeded();
 await expect.poll(()=>p.locator('.naval-stage video').evaluate(v=>!v.paused&&v.currentTime>0),{timeout:12000}).toBe(true);
 const samples=await p.evaluate(async()=>{
   const root=document.querySelector('.naval-stage'),v=root.querySelector('video'),hand=root.querySelector('.naval-tap-hand');
   v.currentTime=1.53;const records=[];const start=performance.now();
   await new Promise(resolve=>{function tick(now){records.push({phase:root.dataset.cue,time:v.currentTime,paused:v.paused,hand:getComputedStyle(hand).transform+'|'+getComputedStyle(hand).filter,arrow:[...root.querySelectorAll('.naval-transfer-signal')].map(e=>getComputedStyle(e).opacity).join(',')});if(now-start<4400)requestAnimationFrame(tick);else resolve();}requestAnimationFrame(tick);});
   return records;
 });
 const start=samples.findIndex(s=>s.phase==='rest'),records=samples.slice(start);
 const phases=records.map(s=>s.phase).filter((s,i,a)=>i===0||s!==a[i-1]);
 expect(phases).toEqual(['rest','flash','tap','reaction','transfer','settle','demo']);
 for(const phase of phases){
   const rows=records.filter(s=>s.phase===phase).slice(2,-2);
   if(phase!=='demo'){expect(rows.every(s=>s.paused)).toBe(true);expect(new Set(rows.map(s=>s.time)).size).toBe(1);}
   if(['reaction','transfer','settle','demo'].includes(phase))expect(new Set(rows.map(s=>s.hand)).size).toBe(1);
   if(['rest','flash','tap','reaction','settle','demo'].includes(phase))expect(new Set(rows.map(s=>s.arrow)).size).toBe(1);
 }
 await fs.writeFile('qa/naval/focus-timing.json',JSON.stringify({phases,records},null,2));
 console.log('Passed: rest → two flashes → tap → reaction hold → arrow → settle → right playback; only one surface animates.');
}finally{await b.close();}
