// Reproducible visual checks for the shared UI. Run against the dev server on 5181.
// Uses isolated browser saves; never touches the player's real browser progress.
import { mkdir, writeFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
const { chromium } = await import(process.env.PW_CORE ?? '/home/durioo/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core/index.mjs');
const out = process.env.UI_AUDIT_OUT ?? 'art/style/ui';
await mkdir(out, { recursive: true });
const browser = await chromium.launch({ args: ['--use-angle=vulkan', '--enable-features=Vulkan', '--ignore-gpu-blocklist'] });
const report = [];
try {
  for (const [name, width, height] of [['desktop', 1600, 900], ['phone', 390, 844], ['landscape', 844, 390]]) {
    const context = await browser.newContext({ viewport: { width, height }, hasTouch: name !== 'desktop', isMobile: name !== 'desktop' });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', e => errors.push(String(e)));
    page.on('response', r => { if (r.status() >= 400) errors.push(`${r.status()} ${r.url()}`); });
    await page.addInitScript(() => {
      localStorage.setItem('pokelove-save-v1', JSON.stringify({ cards: [5, 3, 7], flags: { introSeen: true }, vals: {}, recordingMode: false, handedOver: [], zone: 'bilik' }));
    });
    const shot = async label => { await page.waitForTimeout(300); await page.screenshot({ path: `${out}/${name}-${label}.png` }); };
    const fits = async selector => {
      const r = await page.locator(selector).first().boundingBox();
      assert(r && r.x >= -1 && r.y >= -1 && r.x + r.width <= width + 1 && r.y + r.height <= height + 1, `${name}: ${selector} outside viewport: ${JSON.stringify(r)}`);
    };
    await page.goto('http://localhost:5181/', { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    await fits('.title-inner');
    await shot('title');
    await page.locator('.press').click();
    await page.locator('.title-menu').waitFor();
    await fits('.title-menu');
    await shot('menu');
    // The reset confirmation can be cancelled without losing the collected cards.
    await page.keyboard.down('ArrowDown');
    await page.waitForTimeout(100);
    await page.keyboard.up('ArrowDown');
    await page.waitForTimeout(150);
    assert.match(await page.locator('.tm-btn.sel').innerText(), /Main baru/);
    await page.keyboard.press('Enter');
    await page.waitForTimeout(100);
    await page.getByRole('button', { name: 'Tak jadi' }).waitFor();
    await shot('reset-confirm');
    await page.getByRole('button', { name: 'Tak jadi' }).click();
    await page.waitForTimeout(100);
    await page.getByRole('button', { name: /Sambung/ }).click();
    await page.waitForTimeout(5000);
    for (let i = 0; i < 8 && await page.locator('.dialog').count(); i++) {
      await page.keyboard.press('Enter'); await page.waitForTimeout(150);
    }
    assert.equal(await page.evaluate(() => window.__pokelove.save.data.cards.length), 3);
    await fits('.hud'); await fits('.zone-label');
    assert.equal(await page.locator('.hud .got img').count(), 3);
    await shot('hud');
    await page.evaluate(async () => {
      const moduleUrl = performance.getEntriesByType('resource').find(e => e.name.includes('/src/ui/hud'))?.name;
      const { setCollect } = await import(moduleUrl);
      const itemUrl = performance.getEntriesByType('resource').find(e => e.name.includes('/src/overworld/items'))?.name;
      const { itemIcon } = await import(itemUrl);
      setCollect({ icon: itemIcon('cookie'), name: 'Cookies Bowat', got: 3, need: 6 });
    });
    await fits('.collect-hud');
    await shot('mission');
    await page.evaluate(() => { void window.__pokelove.say([{ who: 'qish', text: 'Faris hilang. Bowat pun hilang. Okay, jom cari sayang!', expression: 'thinking' }]); });
    await page.waitForTimeout(2200);
    await fits('.dialog');
    await shot('dialog');
    await page.keyboard.press('Enter');
    await page.waitForTimeout(400);
    await page.evaluate(() => { void window.__pokelove.playBoss('finale'); });
    await page.locator('.mg-intro').waitFor();
    await page.waitForTimeout(700);
    assert.equal(await page.locator('.collect-hud:visible').count(), 0, 'overworld mission hidden during minigames');
    await fits('.mg-box');
    await shot('boss-ticket');
    await page.locator('.mg-go').click();
    await page.waitForTimeout(2000);
    await shot('finale');
    await context.close();
    assert.deepEqual(errors, [], `${name} browser errors`);
    report.push({ viewport: name, width, height, errors, checks: ['title', 'menu', 'cancel-reset-keeps-save', 'card-thumbnails', 'hud', 'mission', 'dialog', 'boss-ticket', 'finale-load'] });
    console.log(`${name}: passed`);
  }
  await writeFile(`${out}/verification.json`, JSON.stringify(report, null, 2));
} finally { await browser.close(); }
