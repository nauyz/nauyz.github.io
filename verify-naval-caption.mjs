import {chromium,expect} from '@playwright/test';
const b=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});
try{
 const p=await b.newPage({viewport:{width:1440,height:1100}});
 await p.goto('http://127.0.0.1:5173/');const s=p.locator('.naval-stage'),v=s.locator('video'),label=s.locator('.naval-transfer span');await s.scrollIntoViewIfNeeded();
 await expect.poll(()=>v.evaluate(e=>!e.paused)).toBe(true);
 await v.evaluate(e=>e.currentTime=1.5);await expect(label).toHaveText('目录');
 await p.evaluate(()=>{window.captionChanges=[];let last;const node=document.querySelector('.naval-transfer span');const capture=()=>{const value=getComputedStyle(node).opacity==='1'?node.textContent:'';if(value!==last){window.captionChanges.push(value);last=value;}};window.captionObserver=new MutationObserver(capture);window.captionObserver.observe(document.querySelector('.naval-transfer'),{subtree:true,childList:true,attributes:true,characterData:true});capture();});
 await p.waitForFunction(()=>document.querySelector('.naval-stage').dataset.cue==='demo');
 await p.waitForTimeout(250);await v.evaluate(e=>e.currentTime=5.5);
 await expect(label).toHaveText('问答');await p.waitForFunction(()=>document.querySelector('.naval-stage').dataset.cue==='demo');
 await p.waitForTimeout(300);await v.evaluate(e=>e.currentTime=12);await p.waitForTimeout(200);
 expect(await p.evaluate(()=>window.captionChanges)).toEqual(['目录','问答']);
 await v.evaluate(e=>e.currentTime=19.2);await expect(label).toHaveText('');
 expect(await p.evaluate(()=>window.captionChanges)).toEqual(['目录','问答','']);
 console.log('Caption remains latched across both arrow/video handoffs; no blank frame or reversion; clears on home return.');
}finally{await b.close();}
