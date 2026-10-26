// Exercise the real finale and ending with input, and capture the remaining minigame art.
import assert from 'node:assert/strict';
import { writeFile } from 'node:fs/promises';
const { chromium } = await import(process.env.PW_CORE ?? '/home/durioo/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core/index.mjs');
const browser = await chromium.launch({ args: ['--use-angle=vulkan', '--enable-features=Vulkan', '--ignore-gpu-blocklist'] });
const out = 'art/storybook/qa';
const errors = [];
async function fresh(width = 1280, height = 720, endingSeen = false) {
  const page = await browser.newPage({ viewport: { width, height } });
  page.on('pageerror', e => errors.push(String(e)));
  page.on('response', r => { if (r.status() >= 400) errors.push(`${r.status()} ${r.url()}`); });
  await page.addInitScript(endingSeen => localStorage.setItem('pokelove-save-v1', JSON.stringify({ cards: endingSeen ? [5,3,7,1,2,6,4,8] : [5,3,7,1,2,6,4], flags: { introSeen: true, endingSeen }, vals: {}, recordingMode: false, handedOver: [], zone: endingSeen ? 'labulanjut' : 'bilik' })), endingSeen);
  await page.goto('http://localhost:5181/', { waitUntil: 'networkidle' });
  await page.locator('.press').click();
  await page.getByRole('button', { name: /Sambung/ }).click();
  await page.waitForTimeout(5000);
  return page;
}
async function shot(page, name) { await page.screenshot({ path: `${out}/${name}.png` }); }
try {
  const battle = await fresh();
  await battle.evaluate(() => { void window.__pokelove.playBoss('finale'); });
  await battle.locator('.mg-intro').waitFor();
  await battle.waitForTimeout(700);
  await battle.locator('.mg-go').click();
  await battle.waitForTimeout(1000);
  const seen = new Set();
  for (let i = 0; i < 220; i++) {
    if (await battle.locator('.reveal').count()) break;
    const choice = await battle.evaluate(() => {
      const scene = window.__pokelove.activeMinigameScene();
      if (!scene) return null;
      const all = scene.children.list.flatMap(e => e.type === 'Container' ? e.list : []);
      const text = all.find(e => ['Antek Giler', 'MEGA EVOLVE!', 'HOT GILER'].includes(e.text));
      if (!text) return null;
      const b = text.getBounds();
      return { text: text.text, x: b.centerX, y: b.centerY };
    });
    if (choice) {
      if (!seen.has(choice.text)) { await shot(battle, `finale-${choice.text === 'Antek Giler' ? 'moves' : choice.text === 'HOT GILER' ? 'mega' : 'storm'}`); seen.add(choice.text); }
      const rect = await battle.locator('#stage canvas').boundingBox();
      await battle.mouse.click(rect.x + choice.x * rect.width / 1280, rect.y + choice.y * rect.height / 720);
    } else await battle.keyboard.press('Enter');
    await battle.waitForTimeout(250);
  }
  await shot(battle, 'finale-last-state');
  console.log('Finale phases:', [...seen]);
  assert(seen.has('Antek Giler') && seen.has('MEGA EVOLVE!') && seen.has('HOT GILER'), 'all finale phases reached');
  await battle.locator('.reveal').waitFor();
  await battle.waitForTimeout(3000);
  await shot(battle, 'finale-card-reveal');
  assert(await battle.evaluate(() => window.__pokelove.save.hasCard(8)), 'finale unlocks Mega Qish card');
  console.log('Finale: moves → storm → Mega Evolve → Hot Giler → card 8 passed');
  await battle.close();

  assert.deepEqual(errors, [], 'no browser or asset errors');
  await writeFile(`${out}/finale-verification.json`, JSON.stringify({finale:[...seen], errors}, null, 2));
} finally { await browser.close(); }
