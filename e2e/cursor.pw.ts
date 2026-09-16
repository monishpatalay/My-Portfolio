import {test, expect, type Page} from '@playwright/test';

const arrow = /url\(.*\/cursor\.svg.*\) 5 4, (auto|pointer)/;

async function openPortfolio(page: Page, path = '/') {
  await page.goto(path);
  await expect(page.getByRole('navigation', {name: 'Main', exact: true})).toBeVisible();
  // Wait for hydration without relying on mouse input to initialize the cursor.
  await expect(page.locator('.chat-launcher')).toBeAttached();
}

async function expectArrow(page: Page) {
  await expect(page.locator('.site-header')).toHaveCSS('cursor', arrow);
  // A second cursor painted into the document would remain behind on window exit.
  await expect(page.locator('.cursor-aura')).toHaveCount(0);
}

test('cursor exists before the first mouse movement', async ({page}) => {
  await openPortfolio(page);
  await expectArrow(page);
});

test('cursor survives blur and focus without another mouse event', async ({page}) => {
  await openPortfolio(page);
  await page.mouse.move(400, 250);
  await page.evaluate(() => {
    window.dispatchEvent(new Event('blur'));
    window.dispatchEvent(new Event('focus'));
  });
  await expectArrow(page);
});

test('Calm to Full while stationary keeps a visible cursor', async ({page}) => {
  await openPortfolio(page);
  const toggle = page.locator('.site-header button[aria-pressed]');
  await toggle.focus();
  await page.keyboard.press('Space');
  await expect(toggle).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('.site-header')).toHaveCSS('cursor', 'auto');
  await page.keyboard.press('Space');
  await expect(toggle).toHaveAttribute('aria-pressed', 'false');
  await expectArrow(page);
});

test('chat uses text and disabled-control cursors', async ({page}) => {
  await openPortfolio(page);
  await page.locator('.chat-launcher').click();
  await expect(page.locator('#chat-input')).toBeVisible();
  await expect(page.locator('#chat-input')).toHaveCSS('cursor', 'text');
  const send = page.getByRole('button', {name: 'Send question', exact: true});
  await expect(send).toBeDisabled();
  await expect(send).toHaveCSS('cursor', 'not-allowed');
  await page.locator('#chat-input').fill('Cursor test only — do not send');
  await expect(send).toBeEnabled();
  await expect(send).toHaveCSS('cursor', arrow);
  await page.locator('.chat-privacy summary').click();
  await expect(page.locator('.chat-privacy details')).toHaveCSS('cursor', arrow);
  await page.getByRole('button', {name: 'Close assistant', exact: true}).click();
});

test('cursor remains available after ten seconds idle', async ({page}) => {
  await openPortfolio(page);
  await page.mouse.move(420, 260);
  await expectArrow(page);
  // Deliberate idle interval: this is the regression, not a page-loading wait.
  await page.waitForTimeout(10_000);
  await expectArrow(page);
});

test('repeated viewport exits do not leave a ghost cursor', async ({page}) => {
  await openPortfolio(page);
  for (const outside of [{x: 500, y: -20}, {x: -20, y: 300}, {x: 1500, y: 300}]) {
    await page.mouse.move(500, 300);
    await page.mouse.move(outside.x, outside.y);
    await expect(page.locator('.cursor-aura')).toHaveCount(0);
    await page.mouse.move(800, 400);
    await expectArrow(page);
  }
});

test('switching browser tabs does not require mouse movement to restore the cursor', async ({page, context}) => {
  await openPortfolio(page);
  await page.mouse.move(600, 250);
  const other = await context.newPage();
  await other.goto('about:blank');
  await other.bringToFront();
  await page.bringToFront();
  await expectArrow(page);
  await other.close();
});

test('cursor follows route changes and reloads', async ({page}) => {
  await openPortfolio(page);
  await page.getByRole('navigation', {name: 'Main', exact: true}).getByRole('link', {name: 'Work', exact: true}).click();
  await expect(page).toHaveURL(/\/work$/);
  await expectArrow(page);
  await page.getByRole('link', {name: 'Cook', exact: true}).click();
  await expect(page).toHaveURL(/\/work\/cook$/);
  await expectArrow(page);
  await page.reload();
  await expectArrow(page);
  await page.getByRole('navigation', {name: 'Main', exact: true}).getByRole('link', {name: 'Playground', exact: true}).click();
  await expect(page).toHaveURL(/\/playground$/);
  await expectArrow(page);
  await expect(page.locator('.canvas-wrap canvas')).toHaveCSS('cursor', 'crosshair');
});

test('OS reduced motion and an explicit Full override both work', async ({page}) => {
  await page.emulateMedia({reducedMotion: 'reduce'});
  await openPortfolio(page);
  const toggle = page.locator('.site-header button[aria-pressed]');
  await expect(toggle).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('.site-header')).toHaveCSS('cursor', 'auto');
  await toggle.focus();
  await page.keyboard.press('Space');
  await expectArrow(page);
  await page.emulateMedia({reducedMotion: 'no-preference'});
  await expectArrow(page);
});

test('pointer capability changes cannot hide or duplicate the cursor', async ({page, context}) => {
  await openPortfolio(page);
  await expectArrow(page);
  const session = await context.newCDPSession(page);
  await session.send('Emulation.setTouchEmulationEnabled', {enabled: true, maxTouchPoints: 1});
  await expect.poll(() => page.evaluate(() => matchMedia('(pointer: coarse)').matches)).toBe(true);
  await expect(page.locator('.site-header')).toHaveCSS('cursor', 'auto');
  await expect(page.locator('.cursor-aura')).toHaveCount(0);
  await session.send('Emulation.setTouchEmulationEnabled', {enabled: false});
  await expect.poll(() => page.evaluate(() => matchMedia('(pointer: fine)').matches)).toBe(true);
  await expectArrow(page);
  await session.detach();
});

test('blocked cursor image retains the browser fallback', async ({page}) => {
  let blocked = 0;
  await page.route('**/cursor.svg', route => {
    blocked++;
    return route.abort();
  });
  await openPortfolio(page);
  await page.mouse.move(500, 250);
  await expect.poll(() => blocked).toBeGreaterThan(0);
  // CSS retains the requested URL on failure; its final keyword is the renderer fallback.
  await expectArrow(page);
  await expect(page.locator('.site-header')).toHaveCSS('cursor', /, auto$/);
  await expect(page.locator('.site-header button').first()).toHaveCSS('cursor', /, pointer$/);
});

test('cursor loads and remains available with JavaScript disabled', async ({browser}) => {
  const context = await browser.newContext({javaScriptEnabled: false, viewport: {width: 1440, height: 900}});
  const page = await context.newPage();
  try {
    await page.goto('http://127.0.0.1:3000/');
    await expectArrow(page);
  } finally {
    await context.close();
  }
});

for (const deviceScaleFactor of [1, 2]) {
  test(`click targets remain usable at ${deviceScaleFactor}x display scale`, async ({browser}) => {
    const context = await browser.newContext({viewport: {width: 1440, height: 900}, deviceScaleFactor});
    const page = await context.newPage();
    try {
      await openPortfolio(page, 'http://127.0.0.1:3000/');
      const button = page.locator('.chat-launcher');
      await expect(button).toBeVisible();
      const bounds = await button.boundingBox();
      expect(bounds).not.toBeNull();
      await page.mouse.click(bounds!.x + bounds!.width / 2, bounds!.y + bounds!.height / 2);
      await expect(page.locator('#chat-input')).toBeVisible();
      await expectArrow(page);
    } finally {
      await context.close();
    }
  });
}

test('the existing cursor SVG decodes at its intended size', async ({page}) => {
  await openPortfolio(page);
  const size = await page.evaluate(async () => {
    const image = new Image();
    image.src = '/cursor.svg';
    await image.decode();
    return [image.naturalWidth, image.naturalHeight];
  });
  expect(size).toEqual([40, 40]);
});

test('touchscreen does not create a synthetic cursor', async ({browser}) => {
  const context = await browser.newContext({hasTouch: true, isMobile: true, viewport: {width: 390, height: 844}});
  const page = await context.newPage();
  try {
    await openPortfolio(page, 'http://127.0.0.1:3000/');
    await page.locator('.chat-launcher').tap();
    await expect(page.locator('#chat-input')).toBeVisible();
    await expect(page.locator('.cursor-aura')).toHaveCount(0);
    await expect(page.locator('.site-header')).toHaveCSS('cursor', 'auto');
  } finally {
    await context.close();
  }
});
