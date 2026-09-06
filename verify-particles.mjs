import { chromium } from '@playwright/test';
import { existsSync } from 'node:fs';
import { writeFile } from 'node:fs/promises';
const executablePath=['C:/Program Files/Google/Chrome/Application/chrome.exe','C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'].find(existsSync);
const browser=await chromium.launch({executablePath,headless:true,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const page=await browser.newPage({viewport:{width:922,height:692}});
const errors=[];page.on('pageerror',e=>errors.push(e.message));
const url=process.env.PREVIEW_URL||'http://127.0.0.1:5175/demo-particle-flow.html';
const read=()=>page.evaluate(()=>window.particleDiagnostics());
try {
 await page.goto(url);await page.waitForFunction(()=>window.particleDiagnostics);
 await page.screenshot({path:'qa/particle-rest.png'});
 const rest=await read();
 for(let i=0;i<100;i++){
  const a=i/100*Math.PI*3;
  await page.mouse.move(461+Math.cos(a)*190,346+Math.sin(a)*140);
  await page.waitForTimeout(16);
  if(i===60)await page.screenshot({path:'qa/particle-curl.png'});
 }
 const moving=await read();
 await page.mouse.move(920,690);await page.locator('canvas').dispatchEvent('pointerleave');
 await page.waitForTimeout(10000);
 const returned=await read();await page.screenshot({path:'qa/particle-return.png'});
 if(moving.averageDrift<20||returned.averageDrift>2||!returned.finite)throw Error('Motion/recovery failed '+JSON.stringify({moving,returned}));
 await page.keyboard.press('h');if(!await page.locator('#panel').isVisible())throw Error('Panel failed');
 await page.keyboard.press('Escape');if(await page.locator('#panel').isVisible())throw Error('Panel remained visible');
 await page.setViewportSize({width:390,height:844});await page.waitForTimeout(250);
 await page.screenshot({path:'qa/particle-mobile.png'});
 const cdp=await page.context().newCDPSession(page);
 await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:140,y:400}]});
 for(let i=0;i<20;i++) {await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:140+i*5,y:400+i*2}]});await page.waitForTimeout(20);}
 const touch=await read();await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
 if(touch.averageDrift<1)throw Error('Touch failed');
 await page.emulateMedia({reducedMotion:'reduce'});await page.waitForTimeout(100);
 const reduced=await read();if(reduced.averageDrift!==0||!reduced.reducedMotion)throw Error('Reduced motion failed');
 if(errors.length)throw Error(errors.join('\n'));
 await writeFile('qa/particle-results.json',JSON.stringify({passed:true,rest,moving,returned,touch,reduced,errors},null,2));
 console.log(JSON.stringify({passed:true,rest,moving,returned,touch,reduced}));
}finally{await browser.close();}
