import AxeBuilder from '@axe-core/playwright';
import {readFile} from 'node:fs/promises';
import {test, expect, ready, projectPaths, settleFullscreen} from './helpers';

for (const path of ['/', '/work', '/playground', '/studio']) {
  test(`load, metadata and accessibility: ${path}`, async ({page}, info) => {
    await ready(page, path);
    await expect(page).toHaveTitle(/Monish|Studio/);
    await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /\S/);
    await expect(page.locator('link[rel*="icon"]').first()).toHaveAttribute('href', /\S/);
    await expect(page.locator('meta[property="og:image"]').first()).toHaveAttribute('content', /\S/);
    const result = await new AxeBuilder({page}).analyze();
    await info.attach('axe', {body:JSON.stringify(result.violations,null,2),contentType:'application/json'});
    expect(result.violations).toEqual([]);
  });
}

test('crawl all current case studies and click their contents and next links', async ({page}, info) => {
  test.setTimeout(240_000);
  const paths = await projectPaths(page);
  expect(paths.length).toBeGreaterThan(0);
  for (const path of paths) {
    await ready(page,path);
    await expect(page.locator('h1')).toBeVisible();
    const violations = (await new AxeBuilder({page}).analyze()).violations;
    await info.attach(`axe-${path.split('/').pop()}`,{body:JSON.stringify(violations),contentType:'application/json'});
    expect.soft(violations, path).toEqual([]);
    for (const link of await page.locator('.toc a').all()) {
      const href = await link.getAttribute('href');
      await link.click(); await settleFullscreen(page);
      await expect.soft(page.locator(href!)).toBeInViewport();
    }
    const next = page.locator('.next-project');
    const href = await next.getAttribute('href');
    await next.click(); await expect(page).toHaveURL(new RegExp(`${href}$`));
  }
});

test('all rendered internal links and hash destinations', async ({page}) => {
  test.setTimeout(600_000);
  const routes = ['/', '/work', '/playground', ...await projectPaths(page)];
  for (const route of routes) {
    await ready(page,route);
    const links = await page.locator('a[href]').evaluateAll(nodes => [...new Set(nodes.map(n => n.getAttribute('href')!).filter(href => href.startsWith('/') || href.startsWith('#')))].map(href=>({href})));
    for (const {href} of links) {
      if (href === '/resume') continue; // Dedicated real download test below.
      await ready(page,route);
      const link = page.locator('a[href]').filter({visible:true});
      const index = await link.evaluateAll((nodes,href) => nodes.findIndex(n => n.getAttribute('href') === href),href);
      if (index < 0) {test.info().annotations.push({type:'manual',description:`Hidden link ${route}: ${href}; check keyboard/mobile reachability`}); continue;}
      await link.nth(index).click(); await settleFullscreen(page);
      const destination = new URL(href,`http://127.0.0.1:3100${route}`);
      await expect(page).toHaveURL(destination.href);
      if (destination.hash && destination.hash !== '#ask') await expect.soft(page.locator(destination.hash)).toBeInViewport();
    }
  }
});

test('external URLs, blank-tab protection and contact formats', async ({page,request}, info) => {
  test.setTimeout(300_000);
  const routes = ['/', '/work', ...await projectPaths(page)];
  const external = new Set<string>();
  for (const path of routes) {
    await ready(page,path);
    for (const a of await page.locator('a[href]').all()) {
      const href = (await a.getAttribute('href'))!;
      if (await a.getAttribute('target') === '_blank') {
        const rel = (await a.getAttribute('rel') ?? '').split(/\s+/);
        expect.soft(rel,`${path}: ${href}`).toEqual(expect.arrayContaining(['noopener','noreferrer']));
      }
      if (/^https?:/.test(href)) external.add(href);
      if (href.startsWith('mailto:')) expect.soft(decodeURIComponent(href.split('?')[0])).toMatch(/^mailto:[^\s@]+@[^\s@]+\.[^\s@]+$/);
      if (href.startsWith('tel:')) expect.soft(href).toMatch(/^tel:\+?[\d(). -]{7,}$/);
    }
  }
  const results = [];
  for (const url of external) {
    try {
      const response = await request.get(url,{timeout:30_000});
      results.push({url,status:response.status()});
      if (url.includes('linkedin.com') && [403,999].includes(response.status())) info.annotations.push({type:'manual',description:`LinkedIn bot blocked: ${url}`});
      else expect.soft(response.status(),url).toBeLessThan(400);
    } catch (error) {results.push({url,error:String(error)}); expect.soft(false,`External request failed: ${url}`).toBeTruthy();}
  }
  await info.attach('external-links',{body:JSON.stringify(results,null,2),contentType:'application/json'});
});

test('résumé delivers a nonempty PDF and an actual browser download', async ({page,request},info) => {
  const response = await request.get('/resume');
  const body = await response.body();
  await info.attach('resume-response',{body:JSON.stringify({url:response.url(),status:response.status(),type:response.headers()['content-type'],bytes:body.length}),contentType:'application/json'});
  expect.soft(response.ok()).toBeTruthy();
  expect.soft(body.subarray(0,5).toString()).toBe('%PDF-');
  expect.soft(body.length).toBeGreaterThan(100);
  await ready(page,'/');
  const downloadPromise = page.waitForEvent('download',{timeout:15_000});
  await page.locator('.contact-bottom a[href="/resume"]').click();
  const download = await downloadPromise;
  expect(await download.failure()).toBeNull();
  const file = await download.path();
  expect((await readFile(file!)).subarray(0,5).toString()).toBe('%PDF-');
});

test('redirects, metadata files and unknown route', async ({request}) => {
  for (const [from,to] of [['/myworks','/work'],['/play','/playground']]) {
    const response = await request.get(from,{maxRedirects:0});
    expect(response.status()).toBe(308); expect(response.headers().location).toBe(to);
  }
  for (const path of ['/robots.txt','/sitemap.xml','/manifest.webmanifest','/favicon.ico','/opengraph-image']) expect((await request.get(path)).ok(),path).toBeTruthy();
  expect((await request.get('/qa-route-does-not-exist')).status()).toBe(404);
});

test('keyboard focus is visible and interactive elements can be reached', async ({page},info) => {
  await ready(page,'/work');
  const records = [];
  for (let i=0;i<60;i++) {
    await page.keyboard.press('Tab');
    records.push(await page.evaluate(() => {
      const el=document.activeElement as HTMLElement, css=getComputedStyle(el),r=el.getBoundingClientRect();
      return {tag:el.tagName,text:el.textContent?.slice(0,80),outline:css.outlineStyle,outlineWidth:parseFloat(css.outlineWidth),outlineColor:css.outlineColor,shadow:css.boxShadow,visible:r.width>0&&r.bottom>0&&r.top<innerHeight&&css.visibility==='visible'&&Number(css.opacity)>0};
    }));
  }
  await info.attach('tab-order',{body:JSON.stringify(records,null,2),contentType:'application/json'});
  expect(records.some(r=>r.tag==='A')).toBeTruthy(); expect(records.some(r=>r.tag==='BUTTON')).toBeTruthy();
  expect.soft(records.filter(r=>!r.visible || ((r.outline==='none'||r.outlineWidth===0||r.outlineColor==='rgba(0, 0, 0, 0)')&&r.shadow==='none')), 'Focused controls without visible focus styling').toEqual([]);
  info.annotations.push({type:'manual',description:'Review attached Tab sequence for logical order and confirm all CMS-specific controls are reachable.'});
});
