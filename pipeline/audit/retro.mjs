// Pixel-art integration audit: real scene loads, input, rematches and visual evidence.
import assert from 'node:assert/strict';
import { mkdir, writeFile, readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
const { chromium } = await import(process.env.PW_CORE ?? '/home/durioo/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core/index.mjs');
const out = 'art/retro/qa';
await mkdir(out, { recursive: true });
const browser = await chromium.launch({ args: ['--use-angle=vulkan', '--enable-features=Vulkan', '--ignore-gpu-blocklist'] });
const errors = [];
const results = [];
async function fresh(width = 1280, height = 720, touch = false) {
  const context = await browser.newContext({ viewport: { width, height }, hasTouch: touch });
  const page = await context.newPage();
  page.on('pageerror', e => errors.push(String(e)));
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('response', r => { if (r.status() >= 400) errors.push(`${r.status()} ${r.url()}`); });
  await page.addInitScript(() => localStorage.setItem('pokelove-save-v1', JSON.stringify({ cards: [1,2,3,4,5,6,7,8], flags: { introSeen: true, endingSeen: true }, vals: {}, recordingMode: false, handedOver: [], zone: 'bilik' })));
  await page.goto('http://localhost:5181/', { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  return { context, page };
}
async function enter(page) {
  await page.locator('.press').click();
  await page.getByRole('button', { name: /Sambung/ }).click();
  await page.waitForTimeout(4700);
  await page.evaluate(() => window.__pokelove.overworld.lock());
}
async function startBoss(page, boss, rematch = true) {
  console.log(`Starting ${boss}`);
  await page.evaluate(({ boss, rematch }) => { void window.__pokelove.playBoss(boss, rematch ? { zone: 'bilik', spawn: 'start' } : undefined); }, { boss, rematch });
  try { await page.locator('.mg-intro').waitFor(); }
  catch (e) { console.log('Browser errors:', errors, 'Page:', await page.locator('body').innerText()); await page.screenshot({path:`${out}/failure.png`}); throw e; }
  await page.waitForTimeout(500);
  const bounds = await page.locator('.mg-box').boundingBox();
  const v = page.viewportSize();
  assert(bounds && bounds.x >= 0 && bounds.y >= 0 && bounds.x + bounds.width <= v.width + 1 && bounds.y + bounds.height <= v.height + 1, `${boss}: intro fits`);
  const image = await page.locator('.mg-art img').getAttribute('src');
  assert(image.startsWith('/assets/retro/'), `${boss}: pixel portrait`);
  await page.screenshot({ path: `${out}/${v.width}-${boss}-intro.png` });
  await page.locator('.mg-go').click();
  if (boss === 'qishex') await page.waitForFunction(() => window.__retroRunner?.().ready);
  else await page.waitForFunction(() => window.__pokelove.activeMinigameScene()?.sys.isActive());
  await page.waitForTimeout(2000);
}
try {
  for (const boss of ['bowat','bolat','snorlax','blep','megabowat','bolatex','qishex','finale']) {
    const { context, page } = await fresh();
    await enter(page);
    await startBoss(page, boss);
    await page.screenshot({ path: `${out}/${boss}-game.png` });
    const state = await page.evaluate(boss => {
      if (boss === 'qishex') return window.__retroRunner();
      const s = window.__pokelove.activeMinigameScene();
      return { scene: s.sys.settings.key, background: s.textures.get('px_background').getSourceImage().width, art: s.textures.exists(`px_${boss === 'finale' ? 'faris' : boss}`) };
    }, boss);
    if (boss !== 'qishex') { assert.equal(state.background, 320); assert(state.art); }
    if (boss === 'bowat') {
      const before = await page.evaluate(() => window.__pokelove.activeMinigameScene().player.x);
      await page.keyboard.down('ArrowRight'); await page.waitForTimeout(500); await page.keyboard.up('ArrowRight');
      const after = await page.evaluate(() => { const s = window.__pokelove.activeMinigameScene(); return { x: s.player.x, texture: s.qish.texture.key }; });
      assert(after.x > before + 20, 'Bowat: movement still works');
      assert(after.texture.startsWith('qish_'), 'Bowat: original player art retained');
    }
    if (boss === 'megabowat') {
      await page.keyboard.press('Enter'); await page.waitForTimeout(160);
      assert(await page.evaluate(() => window.__pokelove.activeMinigameScene().started), 'Flappy starts with A');
    }
    if (boss === 'blep') {
      await page.keyboard.down('ArrowRight'); await page.waitForTimeout(400); await page.keyboard.up('ArrowRight');
      assert(await page.evaluate(() => window.__pokelove.activeMinigameScene().ship.x > 700), 'Blep flies right');
    }
    // Verify all rematch completion paths remain usable and do not reveal/reward cards again.
    if (boss !== 'qishex') await page.evaluate(() => window.__pokelove.activeMinigameScene().forceWin());
    else {
      await page.keyboard.press('Backquote');
      await page.getByRole('button', { name: /Menang boss sekarang/ }).click();
      await page.getByRole('button', { name: 'Tutup', exact: true }).click();
    }
    await page.waitForTimeout(3000);
    await page.locator('.dialog').waitFor();
    assert.equal(await page.locator('.reveal').count(), 0, `${boss}: rematch no card reveal`);
    assert.equal(await page.evaluate(() => window.__pokelove.save.data.cards.length), 8);
    results.push({ boss, state, rematch: 'passed' });
    console.log(`${boss}: loaded, pixel art, rematch passed`);
    await context.close();
  }
  for (const [name, width, height] of [['phone',390,844], ['landscape',844,390]]) {
    const { context, page } = await fresh(width, height, true);
    await page.screenshot({ path: `${out}/${name}-title.png` });
    await enter(page);
    await page.screenshot({ path: `${out}/${name}-hud.png` });
    await page.evaluate(() => { void window.__pokelove.say([{ who: 'qish', text: 'Jom cari Faris!', expression: 'thinking' }, { who: 'bowat', text: '...Bukan aku.', expression: 'innocent' }]); });
    await page.waitForTimeout(1000);
    assert(await page.locator('.vn-fig.lit').getAttribute('src').then(s => s.includes('/assets/chars/qish_portrait_')), 'HD dialog preserved');
    assert(await page.locator('.vn-fig.lit').evaluate(e => getComputedStyle(e).imageRendering === 'auto'));
    assert(await page.locator('.dialog .box').evaluate(e => parseFloat(getComputedStyle(e).borderRadius) > 0));
    await page.screenshot({ path: `${out}/${name}-dialog-original.png` });
    for (let i=0;i<4;i++) { await page.keyboard.press('Enter'); await page.waitForTimeout(150); }
    await startBoss(page, 'megabowat');
    await page.screenshot({ path: `${out}/${name}-flappy.png` });
    await context.close();
  }
  const protectedWalks = JSON.parse(await readFile('art/retro/protected-walks.json', 'utf8'));
  for (const [file, digest] of Object.entries(protectedWalks)) assert.equal(createHash('sha256').update(await readFile(file)).digest('hex'), digest, `protected ${file}`);
  assert.deepEqual(errors, [], 'No browser or asset errors');
  await writeFile(`${out}/verification.json`, JSON.stringify({ results, originalDialog: true, protectedWalks: Object.keys(protectedWalks).length, errors }, null, 2));
} finally { await browser.close(); }
