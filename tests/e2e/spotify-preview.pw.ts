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
    await card.hover();
    await expect.poll(()=>video.evaluate(node=>!(node as HTMLVideoElement).paused&&(node as HTMLVideoElement).currentTime>0&&Number(getComputedStyle(node).opacity)>.9)).toBe(true);
    await expect.poll(()=>video.evaluate(node=>(node as HTMLVideoElement).muted)).toBe(false);
    await sound.click();
    await expect(sound).toHaveAttribute('aria-pressed','false');
    await expect.poll(()=>video.evaluate(node=>(node as HTMLVideoElement).muted)).toBe(true);
    await sound.blur();
    await page.mouse.move(0,0);
    await expect.poll(()=>video.evaluate(node=>(node as HTMLVideoElement).paused&&Number(getComputedStyle(node).opacity)<.1)).toBe(true);
    await card.hover();
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
  await card.hover();
  await expect.poll(()=>video.evaluate(node=>(node as HTMLVideoElement).muted&&!(node as HTMLVideoElement).paused)).toBe(true);
  await expect(card.getByRole('button',{name:'Preview sound'})).toHaveAttribute('aria-pressed','false');
});
