// Exercise the real finale and ending with input, and capture the remaining minigame art.
import assert from 'node:assert/strict';
import { writeFile } from 'node:fs/promises';
const { chromium } = await import(process.env.PW_CORE ?? '/home/durioo/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core/index.mjs');
const browser = await chromium.launch({ args: ['--use-angle=vulkan', '--enable-features=Vulkan', '--ignore-gpu-blocklist'] });
const out = 'art/style/ui';
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

  for (const [name, width, height] of [['desktop',1280,720], ['phone',390,844], ['landscape',844,390]]) {
    const page = await fresh(width, height, true);
    await page.evaluate(() => { window.__pokelove.overworld.lock(); void window.__pokelove.playEnding(); });
    for (let i = 0; i < 60 && !await page.locator('.cake-scene').count(); i++) {
      await page.keyboard.press('Enter'); await page.waitForTimeout(200);
    }
    await page.locator('.cake-scene').waitFor();
    await page.waitForTimeout(300);
    await shot(page, `${name}-cake`);
    await page.keyboard.down('Space');
    await page.waitForTimeout(4000);
    await page.keyboard.up('Space');
    await page.locator('.bday-banner').waitFor();
    await page.waitForTimeout(2000);
    await page.keyboard.press('Enter');
    await page.locator('.kisah').waitFor();
    for (let slide = 0; slide < 9; slide++) {
      await page.waitForTimeout(300);
      await page.keyboard.press('Enter');
      await page.waitForTimeout(300);
      if (slide === 3 || slide === 4 || slide === 6 || slide === 8) await shot(page, `${name}-memory-${slide}`);
      const bounds = await page.locator('.kisah-slide').boundingBox();
      assert(bounds && bounds.y >= -2 && bounds.y + bounds.height <= height + 2, `${name} memory slide ${slide} fits`);
      await page.keyboard.press('Enter');
    }
    for (let i = 0; i < 40 && !await page.locator('.letter-layer').count(); i++) {
      await page.keyboard.press('Enter'); await page.waitForTimeout(200);
    }
    await page.locator('.letter-layer').waitFor();
    await page.keyboard.press('Enter'); // Finish the typewriter.
    await page.waitForTimeout(500);
    await shot(page, `${name}-letter`);
    // A long letter can be scrolled with gamepad/keyboard and touching paper doesn't close it.
    await page.evaluate(() => {
      document.querySelector('.letter-text').textContent += '\n\n' + 'Sayang kau selalu.\n'.repeat(45);
    });
    await page.keyboard.down('ArrowDown');
    await page.waitForTimeout(500);
    await page.keyboard.up('ArrowDown');
    assert(await page.locator('.letter').evaluate(e => e.scrollTop > 0), `${name} letter scrolls with keyboard`);
    await page.locator('.letter').click({ position: { x: 25, y: 25 } });
    assert.equal(await page.locator('.letter-layer').count(), 1, 'touching paper leaves letter open');
    await page.locator('.letter-next').click();
    await page.locator('.reveal').waitFor();
    await page.waitForTimeout(4200);
    await shot(page, `${name}-secret-card`);
    await page.keyboard.press('Enter');
    await page.locator('.the-end').waitFor();
    await shot(page, `${name}-the-end`);
    console.log(`${name}: ending, 9 memories, letter scroll, secret card, the end passed`);
    await page.close();
  }

  // Evidence for the art backlog: untouched minigames, through their real intro screens.
  for (const boss of ['bowat','bolat','snorlax','blep','megabowat','bolatex','qishex']) {
    const page = await fresh();
    await page.evaluate(boss => { void window.__pokelove.playBoss(boss); }, boss);
    await page.locator('.mg-intro').waitFor();
    await page.waitForTimeout(700);
    await page.locator('.mg-go').click();
    await page.waitForTimeout(1800);
    await shot(page, `audit-minigame-${boss}`);
    await page.close();
  }
  assert.deepEqual(errors, [], 'no browser or asset errors');
  await writeFile(`${out}/story-verification.json`, JSON.stringify({ finale: [...seen], ending: ['desktop','phone','landscape'], otherMinigames: 7, errors }, null, 2));
} finally { await browser.close(); }
