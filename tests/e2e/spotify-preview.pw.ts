import {test,expect} from '@playwright/test';

test('project previews animate on hover and pause on exit',async({page})=>{
  await page.goto('/work',{waitUntil:'domcontentloaded'});
  await expect(page.getByRole('dialog',{name:'Loading',exact:true})).toBeHidden({timeout:15_000});
  for(const [title,name] of [['Spotify Library Organizer','spotify'],['Airbnc','airbnc']]){
    const card=page.locator('.rail-card').filter({hasText:title});
    const video=card.locator('video');
    await expect.poll(async()=>{const src=await video.getAttribute('src');return src===`/videos/${name}-preview.mp4`||src?.startsWith('https://cdn.sanity.io/files/')}).toBe(true);
    await expect(card.locator('.project-media img, .project-art').first()).toBeVisible();
    await expect(video).toHaveCSS('opacity','0');
    await card.hover();
    await expect.poll(()=>video.evaluate(node=>!(node as HTMLVideoElement).paused&&(node as HTMLVideoElement).currentTime>0&&Number(getComputedStyle(node).opacity)>.9)).toBe(true);
    await page.mouse.move(0,0);
    await expect.poll(()=>video.evaluate(node=>(node as HTMLVideoElement).paused&&Number(getComputedStyle(node).opacity)<.1)).toBe(true);
  }
});
