import AxeBuilder from '@axe-core/playwright';
import {test,expect,ready,settleFullscreen} from './helpers';

test('work filters and layout persistence',async({page})=>{
  await ready(page,'/work');
  for(const [label,value] of [['AI & ML','ai-ml'],['Full stack','full-stack'],['Computer vision','computer-vision'],['Web','web'],['All projects','all']]){
    const button=page.getByRole('button',{name:label,exact:true}); await button.click(); await settleFullscreen(page);
    await expect(button).toHaveAttribute('aria-pressed','true');
    expect(new URL(page.url()).searchParams.get('category')??'all').toBe(value);
    if(value!=='all') for(const card of await page.locator('.project-meta').all()) await expect(card).toContainText(value.replaceAll('-',' ').toUpperCase());
  }
  await page.getByRole('button',{name:/List view/}).click();
  await expect(page.locator('.work-grid')).toHaveClass(/list-view/);
  await ready(page,'/work'); await expect(page.locator('.work-grid')).toHaveClass(/list-view/);
  await page.getByRole('button',{name:/Grid view/}).click(); await expect(page.locator('.work-grid')).not.toHaveClass(/list-view/);
});

test('motion choice persists and skills respond',async({page})=>{
  await ready(page,'/');
  const motion=page.getByRole('button',{name:/Motion is/}).first();
  await motion.click(); await settleFullscreen(page); await expect(page.locator('html')).toHaveAttribute('data-motion','calm');
  await ready(page,'/'); await expect(page.locator('html')).toHaveAttribute('data-motion','calm');
  await motion.click(); await expect(page.locator('html')).toHaveAttribute('data-motion','full');
  for(const filter of await page.locator('.skill-filters button').all()) {await filter.click();await expect(filter).toHaveAttribute('aria-pressed','true');await expect(page.locator('.skill-pill').first()).toBeVisible();}
  const skill=page.locator('.skill-pill').first();await skill.click();await expect(skill).toHaveClass(/is-falling/);await expect(skill).not.toHaveClass(/is-falling/,{timeout:8000});
});

test('chat opens, validates, mocks success, feedback, reset, Escape and focus',async({page},info)=>{
  await page.route('**/api/chat',r=>r.fulfill({status:200,contentType:'text/plain',body:'Monish builds AI products. **Full stack** experience.',headers:{'X-Question-ID':'00000000-0000-4000-8000-000000000001'}}));
  await page.route('**/api/chat/feedback',r=>r.fulfill({status:200,json:{ok:true}}));
  await ready(page,'/');const launcher=page.locator('.chat-launcher');await launcher.click();await settleFullscreen(page);
  const panel=page.getByRole('dialog',{name:'Monish’s AI assistant'});
  await expect(panel).toBeVisible();await expect(page.getByLabel('Your question')).toBeFocused();await expect(page.getByLabel('Send question')).toBeDisabled();
  await page.getByLabel('Your question').fill('  ');await expect(page.getByLabel('Send question')).toBeDisabled();
  await page.getByLabel('Help improve').check();
  await page.getByLabel('Your question').fill('What has he built?');await page.getByLabel('Send question').click();
  await expect(page.locator('.chat-message.assistant')).toContainText('Monish builds AI products');
  await page.getByLabel('Helpful answer',{exact:true}).click();await expect(panel).toContainText('Thanks — feedback saved.');
  await page.getByLabel('Unhelpful answer',{exact:true}).click();await expect(panel).toContainText('Thanks — feedback saved.');
  await page.getByText('What’s saved?',{exact:true}).click();await expect(panel).toContainText('90 days');
  const violations=(await new AxeBuilder({page}).include('#chat-panel').analyze()).violations;
  await info.attach('chat-axe',{body:JSON.stringify(violations),contentType:'application/json'});expect.soft(violations).toEqual([]);
  await page.getByLabel('Reset conversation').click();await expect(page.locator('.chat-message')).toHaveCount(0);
  await page.keyboard.press('Escape');await expect(panel).toBeHidden();await expect(launcher).toBeFocused();
  await page.keyboard.press('Control+k');await expect(panel).toBeVisible();await page.getByLabel('Close assistant').click();await expect(panel).toBeHidden();
});

test('failed chat retry must not duplicate the question',async({page},info)=>{
  info.annotations.push({type:'expected-console',description:'503'});
  let calls=0;const payloads:unknown[]=[];
  await page.route('**/api/chat',r=>{payloads.push(r.request().postDataJSON());return ++calls===1?r.fulfill({status:503,json:{code:'unavailable'}}):r.fulfill({status:200,contentType:'text/plain',body:'Recovered.'});});
  await ready(page,'/');await page.locator('.chat-launcher').click();await settleFullscreen(page);
  await page.getByLabel('Your question').fill('Show projects');await page.getByLabel('Send question').click();
  await expect(page.locator('.chat-error[role="alert"]')).toContainText('Couldn’t reach');await page.getByRole('button',{name:'Retry',exact:true}).click();
  await expect(page.locator('.chat-message.assistant')).toContainText('Recovered');
  await info.attach('retry-payloads',{body:JSON.stringify(payloads),contentType:'application/json'});
  await expect(page.locator('.chat-message.user')).toHaveCount(1);
});

test('playground samples, clear and paused-game free drawing',async({page})=>{
  await ready(page,'/playground');
  for(let i=0;i<10;i++){const sample=page.getByLabel(`Try sample digit ${i}`,{exact:true});await expect(sample).toBeEnabled();await sample.click();await settleFullscreen(page);await expect(page.locator('.prediction-result span')).toContainText('confidence');}
  await page.getByRole('button',{name:/Clear/}).click();await expect(page.locator('.prediction-result strong')).toHaveText('?');
  await page.getByRole('button',{name:'Beat the model',exact:true}).click();await expect(page.locator('.game-banner')).toContainText('Round 1/10');
  await page.getByRole('button',{name:'Pause timer',exact:true}).click();
  await page.getByRole('button',{name:'+10 seconds',exact:true}).click();await expect(page.locator('.game-banner')).toContainText(/1\d+s|20s/);
  await page.getByRole('button',{name:'Free draw',exact:true}).click();
  const canvas=page.locator('.canvas-wrap canvas');const before=await canvas.evaluate(n=>(n as HTMLCanvasElement).toDataURL());const box=(await canvas.boundingBox())!;
  await page.mouse.move(box.x+box.width*.5,box.y+box.height*.2);await page.mouse.down();await page.mouse.move(box.x+box.width*.5,box.y+box.height*.8,{steps:15});await page.mouse.up();
  expect(await canvas.evaluate(n=>(n as HTMLCanvasElement).toDataURL())).not.toBe(before);
});

test('game timer reaches results and replay',async({page})=>{
  test.setTimeout(150_000);await ready(page,'/playground');await expect(page.getByLabel('Try sample digit 0',{exact:true})).toBeEnabled();
  await page.getByRole('button',{name:'Beat the model',exact:true}).click();await settleFullscreen(page);
  await expect(page.locator('.game-results')).toBeVisible({timeout:115_000});
  await expect(page.locator('.game-results h2')).toContainText('/10');
  await page.getByRole('button',{name:'Share score',exact:true}).click();
  await expect(page.getByRole('status').last()).toContainText(/copied|cancelled|unavailable/i);
  await page.getByRole('button',{name:'Play again',exact:true}).click();await expect(page.locator('.game-banner')).toContainText('Round 1/10');
});

for(const path of ['/','/work','/playground'])test(`rapid clicks on initially visible buttons: ${path}`,async({page},info)=>{
  test.setTimeout(180_000);await page.route('**/api/chat',r=>r.fulfill({status:200,contentType:'text/plain',body:'QA mock'}));await ready(page,path);
  const buttons=await page.locator('button:visible').evaluateAll(nodes=>nodes.map(n=>({name:n.getAttribute('aria-label')||n.textContent||'',html:n.outerHTML.slice(0,180)})));
  await info.attach('rapid-button-inventory',{body:JSON.stringify(buttons),contentType:'application/json'});
  for(let index=0;index<buttons.length;index++){
    await ready(page,path);const button=page.locator('button:visible').nth(index);if(!await button.isEnabled())continue;
    const box=await button.boundingBox();if(!box)continue;
    await button.scrollIntoViewIfNeeded();
    for(let i=0;i<10;i++){const current=await button.boundingBox();if(current)await page.mouse.click(current.x+current.width/2,current.y+current.height/2);}
    await expect(page.locator('#chat-panel')).toHaveCount(await page.locator('#chat-panel').count()?1:0);
    await expect(page.locator('main')).toBeVisible();
  }
  info.annotations.push({type:'manual',description:'Contextual controls (game results, modal controls, busy/retry states) need separate ten-click stress verification.'});
});
