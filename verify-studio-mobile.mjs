import {chromium,webkit,devices,expect} from '@playwright/test';

const url=process.env.PREVIEW_URL||'http://127.0.0.1:5189/';
for(const engine of [chromium,webkit]){
  const browser=await engine.launch(engine===chromium?{executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true}:{});
  try{
    const context=await browser.newContext({...devices['iPhone 13']});
    const page=await context.newPage();
    await page.goto(`${url}#video`,{waitUntil:'domcontentloaded'});
    const face=page.locator('.studio-face').first(),video=face.locator('video'),slider=face.getByRole('slider');
    await expect(video).toHaveAttribute('src',engine===chromium?/^blob:/:/^(blob:|.*mobile\.mp4)/,{timeout:60000});
    await expect.poll(()=>video.evaluate(v=>v.readyState),{timeout:15000}).toBeGreaterThanOrEqual(2);
    // Reproduce the transport problem: no further network access after initial load.
    await context.setOffline(true);
    for(const ratio of [.8,.25,.65]){
      const box=await slider.boundingBox();
      await slider.tap({position:{x:box.width*ratio,y:box.height/2}});
      await expect.poll(()=>video.evaluate(v=>v.seeking),{timeout:5000}).toBe(false);
      if(await video.evaluate(v=>v.paused))await face.getByRole('button',{name:'播放展示',exact:true}).tap();
      const time=await video.evaluate(v=>v.currentTime);
      await expect.poll(()=>video.evaluate(v=>v.currentTime),{timeout:5000}).toBeGreaterThan(time+.3);
    }
    await face.getByRole('button',{name:'暂停展示',exact:true}).tap();
    await slider.tap({position:{x:50,y:20}});
    await expect.poll(()=>video.evaluate(v=>v.seeking)).toBe(false);
    expect(await video.evaluate(v=>v.paused)).toBe(true);
    console.log(`${engine.name()}: PASS offline touch seeks and preserved pause state`);
  }finally{await browser.close();}
}
