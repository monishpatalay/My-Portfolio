import {test,expect} from '@playwright/test';

test('project previews animate on hover and pause on exit',async({page})=>{
  await page.goto('/work',{waitUntil:'domcontentloaded'});
  await expect(page.getByRole('dialog',{name:'Loading',exact:true})).toBeHidden({timeout:15_000});
  // A user gesture gives the browser permission to play audible media.
  await page.getByRole('heading',{level:1}).click();
  for(const [title,name] of [['Spotify Library Organizer','spotify'],['Airbnc','airbnc']]){
    const card=page.locator('.rail-card').filter({hasText:title});
    const video=card.locator('.project-preview-video');
    await expect.poll(async()=>{const src=await video.getAttribute('src');if(await video.getAttribute('playback-id'))return true;return src===`/videos/${name}-preview.mp4`||src?.startsWith('https://cdn.sanity.io/files/')||src?.startsWith('https://stream.mux.com/')}).toBe(true);
    await expect.poll(()=>video.evaluate(node=>(node as HTMLVideoElement).preload)).toBe('auto');
    await expect.poll(()=>video.evaluate(node=>(node as HTMLVideoElement).readyState)).toBeGreaterThanOrEqual(3);
    await expect(card.locator('.project-media img, .project-art').first()).toBeVisible();
    await expect(video).toHaveCSS('opacity','0');
    const sound=card.getByRole('button',{name:'Preview sound'});
    await expect.poll(()=>video.evaluate(node=>(node as HTMLVideoElement).muted)).toBe(false);
    await expect(sound).toHaveAttribute('aria-pressed','true');
    await card.hover({position:{x:100,y:150}});
    await expect.poll(()=>video.evaluate(node=>!(node as HTMLVideoElement).paused&&(node as HTMLVideoElement).currentTime>0&&Number(getComputedStyle(node).opacity)>.9)).toBe(true);
    await expect.poll(()=>video.evaluate(node=>(node as HTMLVideoElement).muted)).toBe(false);
    const bounds=await sound.boundingBox();
    if(!bounds)throw new Error('Sound control has no layout');
    await page.mouse.move(bounds.x+5,bounds.y+5);
    await page.mouse.move(bounds.x+10,bounds.y+10);
    await sound.click();
    await expect(sound).toHaveAttribute('aria-pressed','false');
    await expect.poll(()=>video.evaluate(node=>(node as HTMLVideoElement).muted)).toBe(true);
    await sound.blur();
    await page.mouse.move(0,0);
    await expect.poll(()=>video.evaluate(node=>(node as HTMLVideoElement).paused&&Number(getComputedStyle(node).opacity)<.1)).toBe(true);
    await card.hover({position:{x:100,y:150}});
    await expect(sound).toHaveAttribute('aria-pressed','false');
    await expect.poll(()=>video.evaluate(node=>(node as HTMLVideoElement).muted)).toBe(true);
    await sound.press('Enter');
    await expect(sound).toHaveAttribute('aria-pressed','true');
    await expect.poll(()=>video.evaluate(node=>(node as HTMLVideoElement).muted)).toBe(false);
    await sound.blur();
    await page.mouse.move(0,0);
  }
});

test('blocked sound autoplay falls back to muted playback',async({page})=>{
  await page.goto('/work',{waitUntil:'domcontentloaded'});
  const card=page.locator('.rail-card').filter({hasText:'Spotify Library Organizer'});
  const video=card.locator('.project-preview-video');
  await expect.poll(()=>video.evaluate(node=>(node as HTMLVideoElement).readyState)).toBeGreaterThanOrEqual(3);
  await expect.poll(()=>video.evaluate(node=>(node as HTMLVideoElement).muted)).toBe(false);
  await video.evaluate(node=>{
    const media=node as HTMLVideoElement;
    const play=media.play.bind(media);
    media.play=()=>media.muted?play():Promise.reject(new DOMException('Autoplay blocked','NotAllowedError'));
  });
  await card.hover({position:{x:100,y:150}});
  await expect.poll(()=>video.evaluate(node=>(node as HTMLVideoElement).muted&&!(node as HTMLVideoElement).paused)).toBe(true);
  await expect(card.getByRole('button',{name:'Preview sound'})).toHaveAttribute('aria-pressed','false');
});

test('sound control follows cursor activity and remains keyboard accessible',async({page})=>{
  await page.goto('/work',{waitUntil:'domcontentloaded'});
  const card=page.locator('.rail-card').filter({hasText:'Spotify Library Organizer'});
  const sound=card.getByRole('button',{name:'Preview sound'});
  await expect.poll(()=>card.locator('.project-preview-video').evaluate(node=>(node as HTMLVideoElement).readyState)).toBeGreaterThanOrEqual(3);
  await expect(sound).toHaveCSS('opacity','0');
  await card.hover({position:{x:100,y:150}});
  await expect(card).toHaveAttribute('data-cursor-hidden','');
  await expect(sound).toHaveCSS('opacity','0');
  const bounds=await sound.boundingBox();
  if(!bounds)throw new Error('Sound control has no layout');
  await page.mouse.move(bounds.x+5,bounds.y+5);
  await page.mouse.move(bounds.x+10,bounds.y+10);
  await expect(sound).toHaveCSS('opacity','1');
  await expect(sound).toHaveCSS('pointer-events','auto');
  await page.mouse.move(0,0);
  await expect(sound).toHaveCSS('opacity','0');
  await page.keyboard.press('Tab');
  await sound.focus();
  await expect(sound).toHaveCSS('opacity','1');
  await sound.press('Enter');
  await expect.poll(()=>card.locator('.project-preview-video').evaluate(node=>(node as HTMLVideoElement).paused)).toBe(false);
});

test('homepage sound clicks keep the rail still while keyboard focus still aligns cards',async({page})=>{
  await page.goto('/',{waitUntil:'domcontentloaded'});
  await expect(page.getByRole('dialog',{name:'Loading',exact:true})).toBeHidden({timeout:15_000});
  await page.locator('h1').click();
  const rail=page.locator('#work');
  await expect(rail).toHaveAttribute('data-rail-state','pinned');
  await rail.evaluate(node=>window.scrollTo({top:node.getBoundingClientRect().top+scrollY+230,behavior:'instant'}));
  const cards=rail.locator('.rail-card');
  const card=cards.nth(1),video=card.locator('.project-preview-video');
  await expect.poll(()=>video.evaluate(node=>(node as HTMLVideoElement).readyState)).toBeGreaterThanOrEqual(3);
  const sound=card.getByRole('button',{name:'Preview sound'});
  const bounds=await sound.boundingBox();
  if(!bounds)throw new Error('Sound control has no layout');
  const x=bounds.x+25,y=bounds.y+20;
  await page.mouse.move(x-5,y-5);
  await page.mouse.move(x,y);
  await expect(video).toHaveCSS('opacity','1');
  await expect(sound).toHaveCSS('opacity','1');
  const previous=await sound.getAttribute('aria-pressed');
  const [frames]=await Promise.all([
    video.evaluate(node=>new Promise<{scrollY:number;width:number;opacity:number}[]>(resolve=>{
      const start=performance.now(),samples:{scrollY:number;width:number;opacity:number}[]=[];
      const sample=()=>{samples.push({scrollY,width:node.getBoundingClientRect().width,opacity:Number(getComputedStyle(node).opacity)});if(performance.now()-start<1000)requestAnimationFrame(sample);else resolve(samples);};sample();
    })),
    page.mouse.click(x,y,{delay:70}),
  ]);
  await expect(sound).toHaveAttribute('aria-pressed',previous==='true'?'false':'true');
  expect(Math.max(...frames.map(f=>f.scrollY))-Math.min(...frames.map(f=>f.scrollY))).toBeLessThan(2);
  expect(Math.max(...frames.map(f=>f.width))-Math.min(...frames.map(f=>f.width))).toBeLessThan(2);
  expect(Math.min(...frames.map(f=>f.opacity))).toBeGreaterThan(.99);
  await cards.first().locator('.project-links a').last().focus();
  await page.keyboard.press('Tab');
  await expect(sound).toBeFocused();
  await expect(rail).toHaveAttribute('data-rail-index','1');
  await expect.poll(()=>card.evaluate(node=>Math.round(node.getBoundingClientRect().left))).toBe(72);
});
