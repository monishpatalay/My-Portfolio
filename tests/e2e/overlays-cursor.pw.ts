import {test,expect,ready,projectPaths,settleFullscreen} from './helpers';
import AxeBuilder from '@axe-core/playwright';

test('mobile chat focus containment, Escape and scroll restoration',async({page},info)=>{
  await page.setViewportSize({width:375,height:812});await ready(page,'/');
  const original=await page.evaluate(()=>({body:getComputedStyle(document.body).overflow,html:getComputedStyle(document.documentElement).overflow}));
  await page.locator('.chat-launcher').click();await settleFullscreen(page);
  const panel=page.locator('#chat-panel');await expect(panel).toBeVisible();
  for(let i=0;i<20;i++){await page.keyboard.press('Tab');expect.soft(await panel.evaluate(el=>el.contains(document.activeElement)),`Tab ${i} escaped mobile chat`).toBeTruthy();}
  for(let i=0;i<20;i++){await page.keyboard.press('Shift+Tab');expect.soft(await panel.evaluate(el=>el.contains(document.activeElement)),`Shift+Tab ${i} escaped mobile chat`).toBeTruthy();}
  await page.keyboard.press('Escape');await expect(panel).toBeHidden();
  expect(await page.evaluate(()=>({body:getComputedStyle(document.body).overflow,html:getComputedStyle(document.documentElement).overflow}))).toEqual(original);
  await page.locator('.chat-launcher').click();await page.mouse.click(5,5);
  await expect.soft(panel,'Mobile overlay should close when tapping outside').toBeHidden();
  const violations=(await new AxeBuilder({page}).analyze()).violations;await info.attach('mobile-chat-axe',{body:JSON.stringify(violations),contentType:'application/json'});
});

test('cursor persists while idle, on reentry, and after tab changes',async({page,context})=>{
  await ready(page,'/');await expect(page.locator('.site-header')).toHaveCSS('cursor',/url\(.*cursor.svg.*\)/);
  await page.mouse.move(420,260);await page.waitForTimeout(10_000);await expect(page.locator('.site-header')).not.toHaveCSS('cursor','none');
  const other=await context.newPage();await other.goto('about:blank');await other.bringToFront();await page.bringToFront();
  await page.mouse.move(1,1);await page.mouse.move(400,250);await expect(page.locator('.site-header')).toHaveCSS('cursor',/url\(.*cursor.svg.*\)/);await expect(page.locator('.cursor-aura')).toHaveCount(0);await other.close();
  test.info().annotations.push({type:'manual',description:'Computed CSS is verified; physical cursor appearance across monitors and Chrome toolbar needs native human testing.'});
});

test('conditional CMS rich controls',async({page},info)=>{
  test.setTimeout(180_000);const paths=await projectPaths(page);let controls=0;
  for(const path of paths){await ready(page,path);
    for(const enlarge of await page.getByRole('button',{name:/^Enlarge /}).all()){
      controls++;await enlarge.click();await settleFullscreen(page);const dialog=page.locator('dialog[open]');await expect(dialog).toBeVisible();
      await page.keyboard.press('Tab');expect.soft(await dialog.evaluate(n=>n.contains(document.activeElement))).toBeTruthy();
      await page.keyboard.press('Escape');await expect(dialog).toHaveCount(0);
      await enlarge.click();await page.locator('dialog[open]').getByRole('button',{name:'Close',exact:true}).click();await expect(page.locator('dialog[open]')).toHaveCount(0);
      await enlarge.click();await page.mouse.click(1,1);await expect.soft(page.locator('dialog[open]'),'Backdrop close').toHaveCount(0);await page.keyboard.press('Escape');
    }
    for(const copy of await page.getByRole('button',{name:'Copy code',exact:true}).all()){controls++;await copy.click();await expect(copy).toHaveText('Copied');}
    for(const range of await page.locator('.case-body input[type="range"]').all()){controls++;await range.fill('75');await expect(range).toHaveValue('75');}
    for(const video of await page.locator('.case-body video').all()){controls++;await expect(video).toHaveAttribute('controls','');info.annotations.push({type:'manual',description:`Native video playback/control matrix: ${path}`});}
  }
  test.skip(controls===0,'No CMS rich image/code/comparison/video controls rendered in current content.');
});
