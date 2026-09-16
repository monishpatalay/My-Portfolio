import {devices} from '@playwright/test';
import {test,expect,ready} from './helpers';
for(const [width,height] of [[375,812],[768,1024],[1440,900],[1920,1080]])test(`responsive ${width}x${height}`,async({page},info)=>{
  test.skip(info.project.name!=='chromium');test.setTimeout(90_000);await page.setViewportSize({width,height});
  for(const path of ['/','/work','/playground']){
    await ready(page,path);
    expect.soft(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`${path} overflow`).toBeTruthy();
    const small=await page.locator('a:visible,button:visible,input:visible,summary:visible').evaluateAll(nodes=>nodes.map(n=>{const r=n.getBoundingClientRect();return {text:n.getAttribute('aria-label')||n.textContent?.slice(0,60),width:r.width,height:r.height};}).filter(r=>r.width<44||r.height<44));
    await info.attach(`tap-targets-${path.replaceAll('/','_')}`,{body:JSON.stringify(small),contentType:'application/json'});
    expect.soft(small,`${path}: tap targets below 44x44`).toEqual([]);
    await page.screenshot({path:info.outputPath(`${path.replaceAll('/','_')}-${width}.png`),fullPage:true});
  }
});
for(const device of ['iPhone 13','Pixel 7'])test(`touch parity: ${device}`,async({browser,page},info)=>{
  test.skip(info.project.name!=='chromium');await ready(page,'/work');const desktop=await page.locator('.project-title').allTextContents();
  const context=await browser.newContext({...devices[device],baseURL:'http://127.0.0.1:3100'});const mobile=await context.newPage();
  const errors:string[]=[],warnings:string[]=[],failed:string[]=[];
  mobile.on('pageerror',e=>errors.push(e.message));mobile.on('console',m=>{if(m.type()==='error')errors.push(m.text());if(m.type()==='warning')warnings.push(m.text());});mobile.on('requestfailed',r=>failed.push(`${r.url()}: ${r.failure()?.errorText}`));
  try {await ready(mobile,'/work');expect(await mobile.locator('.project-title').allTextContents()).toEqual(desktop);expect(await mobile.evaluate(()=>navigator.maxTouchPoints)).toBeGreaterThan(0);
    await ready(mobile,'/');await mobile.locator('.chat-launcher').tap();await expect(mobile.locator('#chat-panel')).toBeVisible();await mobile.getByLabel('Close assistant').tap();await expect(mobile.locator('#chat-panel')).toBeHidden();
    expect(await mobile.evaluate(()=>document.pointerLockElement)).toBeNull();
  }finally{await mobile.screenshot({path:info.outputPath('mobile-final.png')}).catch(()=>{});await info.attach('mobile-diagnostics',{body:JSON.stringify({errors,warnings,failed}),contentType:'application/json'});await context.close();expect.soft(errors).toEqual([]);expect.soft(failed.filter(e=>!e.includes('net::ERR_ABORTED'))).toEqual([]);}
});
