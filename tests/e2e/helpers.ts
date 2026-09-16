import {test as base, expect, type Page} from '@playwright/test';

export {expect};

/** Browser-only instrumentation. No application flag or behavior is replaced. */
export const test = base.extend<{diagnostics: void}>({
  diagnostics: [async ({page}, use, testInfo) => {
    const errors: string[] = [], warnings: string[] = [], failed: string[] = [];
    const assets: {url: string; status: number; bytes: number}[] = [];
    const pending: Promise<void>[] = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('console', message => {
      if (message.type() === 'error') errors.push(message.text());
      if (message.type() === 'warning') warnings.push(message.text());
    });
    page.on('requestfailed', request => failed.push(`${request.method()} ${request.url()}: ${request.failure()?.errorText}`));
    page.on('response', response => {
      pending.push((async () => {
        await response.finished().catch(() => null);
        const sizes = await response.request().sizes().catch(() => null);
        assets.push({url: response.url(), status: response.status(), bytes: sizes?.responseBodySize ?? 0});
      })());
    });
    await use();
    await Promise.allSettled(pending);
    await testInfo.attach('browser-diagnostics', {body: JSON.stringify({errors,warnings,failed,assets}, null, 2), contentType:'application/json'});
    // Intentionally mocked HTTP errors remain in evidence, but are not application regressions.
    const expected = testInfo.annotations.filter(a => a.type === 'expected-console').map(a => a.description ?? '');
    const unexpected = errors.filter(error => !expected.some(pattern => pattern && error.includes(pattern)));
    expect.soft(unexpected, 'Unexpected console or page errors').toEqual([]);
    expect.soft(failed.filter(entry => !entry.includes('net::ERR_ABORTED')), 'Failed network requests (aborted navigations remain in diagnostics)').toEqual([]);
    expect.soft(assets.filter(asset => asset.status === 404), '404 responses').toEqual([]);
  }, {auto:true}],
});

export async function ready(page: Page, path = '/') {
  await page.goto(path, {waitUntil:'domcontentloaded'});
  if (!new URL(page.url()).pathname.startsWith('/studio')) {
    await expect(page.getByRole('dialog', {name:'Loading', exact:true})).toBeHidden({timeout:15_000});
    await expect(page.locator('main')).toBeVisible();
    await page.evaluate(() => document.fonts.ready);
  }
}

export async function settleFullscreen(page: Page) {
  await page.evaluate(async () => {if (document.fullscreenElement) await document.exitFullscreen();});
}

export async function assertHealthy(page: Page) {
  await expect(page.locator('body')).not.toContainText('Application error:');
  await expect(page.locator('body')).not.toContainText('Internal Server Error');
}

export async function projectPaths(page: Page) {
  await ready(page, '/work');
  return page.locator('.project-title a').evaluateAll(links => [...new Set(links.map(link => (link as HTMLAnchorElement).pathname))]);
}
