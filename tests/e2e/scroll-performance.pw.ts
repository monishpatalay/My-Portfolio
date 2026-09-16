import {test,expect,ready,settleFullscreen} from './helpers';

for(const method of ['slow','fast','keyboard'])test(`scroll round trip: ${method}`,async({page},info)=>{
  test.skip(info.project.name==='performance');test.setTimeout(180_000);await ready(page,'/');
  for(const direction of ['down','up'])for(const fraction of direction==='down'?[0,.25,.5,.75,1]:[1,.75,.5,.25,0]){
    const goal=await page.evaluate(f=>(document.documentElement.scrollHeight-innerHeight)*f,fraction);
    const before=await page.evaluate(()=>scrollY);
    if(method==='keyboard'){
      if(fraction===0)await page.keyboard.press('Home');else if(fraction===1)await page.keyboard.press('End');
      else for(let i=0;i<6;i++)await page.keyboard.press(direction==='down'?'PageDown':'PageUp');
    }else{
      const current=await page.evaluate(()=>scrollY);const steps=method==='slow'?12:1;
      for(let i=0;i<steps;i++){await page.mouse.wheel(0,(goal-current)/steps);await page.waitForTimeout(method==='slow'?80:250);}
    }
    await settleFullscreen(page);await page.waitForTimeout(1200);
    const after=await page.evaluate(()=>scrollY);
    if(Math.abs(goal-before)>100)expect.soft(Math.abs(after-before),'Input must actually move the page').toBeGreaterThan(20);
    if(method!=='keyboard')expect.soft(Math.abs(after-goal),'Scroll should settle near requested position').toBeLessThan(150);
    // Record the requested 25% checkpoint even when the input assertion failed.
    await page.evaluate(y=>scrollTo(0,y),goal);await page.waitForTimeout(500);
    await page.screenshot({path:info.outputPath(`${method}-${direction}-${fraction*100}.png`)});
    expect.soft(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`${method} ${direction} ${fraction}: overflow`).toBeTruthy();
    await expect.soft(page.locator('.site-header')).toBeInViewport();
    if(fraction>0&&fraction<1)expect.soft(await page.locator('.chapter-nav a[aria-current="true"]').count()).toBeGreaterThan(0);
  }
  await page.evaluate(()=>scrollTo(0,document.documentElement.scrollHeight*.5));await page.reload();await expect(page.getByRole('dialog',{name:'Loading',exact:true})).toBeHidden({timeout:15000});
  await expect(page.locator('main')).toBeVisible();
  for(const section of await page.locator('main section[id]').all()){
    await section.scrollIntoViewIfNeeded();await page.waitForTimeout(800);
    expect.soft(await section.evaluate(el=>Number(getComputedStyle(el).opacity))).toBeGreaterThan(0);
  }
});

test('reduced motion keeps content visible and stops rail pinning',async({page},info)=>{
  test.skip(info.project.name==='performance');await page.emulateMedia({reducedMotion:'reduce'});await ready(page,'/');
  await expect(page.getByRole('button',{name:'Motion is off. Turn motion on.'}).first()).toBeVisible();
  expect(await page.locator('.rail-track').evaluate(el=>getComputedStyle(el).transform)).toBe('none');
  for(const section of await page.locator('main section[id]').all()){await section.scrollIntoViewIfNeeded();await expect(section).toBeVisible();}
});

type Metrics={frames:number[];longtasks:number[];cls:number;last:number;running:boolean};
declare global {interface Window {__qaMetrics:Metrics}}

test('headed performance at normal speed and 4x CPU',async({page},info)=>{
  test.skip(info.project.name!=='performance');test.setTimeout(240_000);
  await page.addInitScript(()=>{
    const m:Metrics={frames:[],longtasks:[],cls:0,last:0,running:false};window.__qaMetrics=m;
    const tick=(time:number)=>{if(m.running&&m.last)m.frames.push(time-m.last);m.last=time;requestAnimationFrame(tick);};requestAnimationFrame(tick);
    new PerformanceObserver(list=>{if(m.running)for(const e of list.getEntries())m.longtasks.push(e.duration);}).observe({type:'longtask',buffered:true});
    new PerformanceObserver(list=>{if(m.running)for(const e of list.getEntries()){const shift=e as PerformanceEntry&{hadRecentInput:boolean;value:number};if(!shift.hadRecentInput)m.cls+=shift.value;}}).observe({type:'layout-shift',buffered:true});
  });
  await ready(page,'/');const cdp=await page.context().newCDPSession(page);const rows=[];
  for(const rate of [1,4]){
    await cdp.send('Emulation.setCPUThrottlingRate',{rate});
    for(const scenario of ['idle','scroll','hero','work','journey','skills','try-it','contact']){
      await page.evaluate(()=>Object.assign(window.__qaMetrics,{frames:[],longtasks:[],cls:0,last:0,running:true}));
      if(scenario==='scroll'){for(let i=0;i<30;i++){await page.mouse.wheel(0,180);await page.waitForTimeout(100);}}
      else {if(scenario!=='idle')await page.locator(`#${scenario}`).scrollIntoViewIfNeeded();await page.waitForTimeout(3000);}
      const m=await page.evaluate(()=>{window.__qaMetrics.running=false;return window.__qaMetrics;});
      const sorted=[...m.frames].sort((a,b)=>a-b);const avg=m.frames.reduce((a,b)=>a+b,0)/m.frames.length;
      const row={rate,scenario,fps:1000/avg,p95:sorted[Math.floor(sorted.length*.95)],maxLongTask:Math.max(0,...m.longtasks),cls:m.cls,frames:m.frames.length};rows.push(row);
      expect.soft(row.frames,`${scenario}: samples`).toBeGreaterThan(10);
      expect.soft(row.fps,`${rate}x ${scenario} FPS`).toBeGreaterThanOrEqual(rate===1?55:30);
      if(rate===1)expect.soft(row.p95,`${scenario} p95`).toBeLessThanOrEqual(25);
      expect.soft(row.maxLongTask,`${scenario} long task`).toBeLessThanOrEqual(100);expect.soft(row.cls,`${scenario} CLS`).toBeLessThan(.1);
    }
  }
  await cdp.send('Emulation.setCPUThrottlingRate',{rate:1});
  await info.attach('performance',{body:JSON.stringify(rows,null,2),contentType:'application/json'});
});

test('headed heap after twenty route changes',async({page},info)=>{
  test.skip(info.project.name!=='performance');test.setTimeout(240_000);await ready(page,'/');
  const cdp=await page.context().newCDPSession(page);
  for(const name of ['Work','Playground']){await page.locator('.nav-links a').filter({hasText:name}).click();await expect(page).toHaveURL(name==='Work'?/\/work$/:/\/playground$/);await page.waitForTimeout(1500);}
  await page.locator('.wordmark').click();await expect(page).toHaveURL(/\/$/);await page.waitForTimeout(2000);await cdp.send('HeapProfiler.collectGarbage');
  const before=await cdp.send('Runtime.getHeapUsage');
  for(let i=0;i<20;i++){await page.locator('.nav-links a').filter({hasText:i%2===0?'Work':'Playground'}).click();await expect(page).toHaveURL(i%2===0?/\/work$/:/\/playground$/);await expect(page.locator('main')).toBeVisible();await page.waitForTimeout(500);}
  await page.locator('.wordmark').click();await page.waitForTimeout(2000);await cdp.send('HeapProfiler.collectGarbage');const after=await cdp.send('Runtime.getHeapUsage');
  const growth=(after.usedSize-before.usedSize)/before.usedSize;
  await info.attach('heap',{body:JSON.stringify({before,after,growth}),contentType:'application/json'});expect(growth).toBeLessThanOrEqual(.2);
});

test('WebGL context loss shows fallback',async({page},info)=>{
  test.skip(info.project.name!=='chromium');await ready(page,'/?tier=3');
  await page.waitForFunction(()=>document.querySelector('canvas')||document.querySelector('.particle-poster'),{timeout:10000});
  const result=await page.evaluate(()=>{
    const canvas=document.querySelector('canvas');const gl=canvas?.getContext('webgl2');
    if(!gl)return 'unavailable';const extension=gl.getExtension('WEBGL_lose_context');if(!extension)return 'extension-unavailable';extension.loseContext();return 'lost';
  });
  test.skip(result!=='lost',`MANUAL CHECK NEEDED: ${result}; this device did not expose a usable particle context.`);
  await expect(page.locator('.particle-poster')).toBeVisible();
});

test('hidden tab rAF suspension',async({page,context},info)=>{
  test.skip(info.project.name!=='performance');await ready(page,'/');
  await page.evaluate(()=>{window.__qaMetrics={frames:[],longtasks:[],cls:0,last:0,running:true};const tick=()=>{window.__qaMetrics.last++;requestAnimationFrame(tick);};requestAnimationFrame(tick);});
  const other=await context.newPage();await other.goto('about:blank');await other.bringToFront();await page.waitForTimeout(1000);
  const before=await page.evaluate(()=>({hidden:document.hidden,count:window.__qaMetrics.last}));
  await page.waitForTimeout(2000);const after=await page.evaluate(()=>window.__qaMetrics.last);
  await info.attach('hidden-tab',{body:JSON.stringify({before,after}),contentType:'application/json'});
  expect(before.hidden).toBeTruthy();expect(after-before.count).toBeLessThanOrEqual(2);await other.close();
  info.annotations.push({type:'manual',description:'rAF suspension is observed; worker/timer/GSAP internal loop suspension requires profiler inspection.'});
});
