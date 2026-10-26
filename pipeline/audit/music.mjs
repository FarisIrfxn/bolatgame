// Real-browser audio integration: decoded signal, loops, rhythm clock, retries,
// skip/teardown and the birthday -> ending transition. Needs the dev server.
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
const { chromium } = await import(process.env.PW_CORE ?? '/home/durioo/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core/index.mjs');
const browser = await chromium.launch({ args: ['--use-angle=vulkan', '--enable-features=Vulkan', '--ignore-gpu-blocklist'] });
const results = {};
const errors = [];
const out = 'art/music/qa';
await mkdir(out, { recursive: true });

async function fresh({ touch = false, blockRhythm = false } = {}) {
  const context = await browser.newContext({ viewport: touch ? { width: 390, height: 844 } : { width: 1280, height: 720 }, hasTouch: touch });
  const page = await context.newPage();
  page.on('pageerror', e => errors.push(String(e)));
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  if (blockRhythm) await page.route('**/assets/music/loverGirl.mp3', route => route.fulfill({ status: 200, contentType: 'audio/mpeg', body: 'invalid audio for fallback check' }));
  await page.addInitScript(() => {
    localStorage.setItem('pokelove-save-v1', JSON.stringify({ cards: [1,2,3,4,5,6,7,8], flags: { introSeen: true, endingSeen: true }, vals: {}, recordingMode: false, handedOver: [], zone: 'bilik' }));
    const record = { streams: [], buffers: [], oscillators: new Set() };
    window.__audioAudit = record;
    const nativeMedia = AudioContext.prototype.createMediaElementSource;
    AudioContext.prototype.createMediaElementSource = function(media) {
      const node = nativeMedia.call(this, media);
      const analyser = this.createAnalyser();
      node.connect(analyser);
      record.streams.push({ media, analyser });
      return node;
    };
    const nativeBuffer = AudioContext.prototype.createBufferSource;
    AudioContext.prototype.createBufferSource = function() {
      const node = nativeBuffer.call(this);
      const analyser = this.createAnalyser();
      node.connect(analyser);
      record.buffers.push({ node, analyser });
      return node;
    };
    const nativeOscillator = AudioContext.prototype.createOscillator;
    AudioContext.prototype.createOscillator = function() {
      const node = nativeOscillator.call(this);
      record.oscillators.add(node);
      node.addEventListener('ended', () => record.oscillators.delete(node));
      return node;
    };
  });
  await page.goto(process.env.GAME_URL ?? 'http://localhost:5181/', { waitUntil: 'networkidle' });
  return { context, page };
}
const state = page => page.evaluate(() => window.__pokelove.music.state());
async function signal(page, kind = 'streams') {
  return page.evaluate(kind => {
    const items = window.__audioAudit[kind];
    const analyser = items.at(-1)?.analyser;
    if (!analyser) return 0;
    const samples = new Float32Array(analyser.fftSize);
    analyser.getFloatTimeDomainData(samples);
    return Math.sqrt(samples.reduce((sum, x) => sum + x*x, 0) / samples.length);
  }, kind);
}
async function enter(page, touch = false) {
  if (touch) {
    await page.locator('.press').tap();
    await page.getByRole('button', { name: /Sambung/ }).tap();
  } else {
    await page.locator('.press').click();
    await page.getByRole('button', { name: /Sambung/ }).click();
  }
  await page.waitForFunction(() => window.__pokelove.music.state().track === 'overworld' && !window.__pokelove.music.state().paused);
  await page.waitForTimeout(3000);
}
async function boss(page, id) {
  await page.evaluate(id => { void window.__pokelove.playBoss(id, { zone: 'bilik', spawn: 'start' }); }, id);
  await page.locator('.mg-go').waitFor();
  await page.locator('.mg-go').click();
  await page.waitForFunction(() => window.__pokelove.activeMinigameScene()?.sys.isActive());
}
async function dismiss(page) {
  for (let i = 0; i < 8; i++) {
    if (!await page.locator('.dialog').count()) break;
    await page.keyboard.press('Enter');
    await page.waitForTimeout(160);
  }
}

try {
  const { context, page } = await fresh();
  assert.equal((await state(page)).track, 'gimmeLove');
  await page.locator('.press').click();
  await page.waitForTimeout(1200);
  assert.equal((await state(page)).paused, false, 'Title unlocks after a user gesture');
  const titleSignal = await signal(page);
  console.log('Title playback:', await state(page), 'signal:', titleSignal);
  assert(titleSignal > 0.0001, 'Title has an actual decoded audio signal');
  results.title = await state(page);
  await page.getByRole('button', { name: /Sambung/ }).click();
  await page.waitForTimeout(4000);
  assert.equal((await state(page)).track, 'overworld');
  const beforeTravel = (await state(page)).time;
  await page.evaluate(() => { void window.__pokelove.travel('labulanjut', 'start'); });
  await page.waitForTimeout(4000);
  assert((await state(page)).time > beforeTravel, 'Zone travel preserves song position');
  // Exercise the real HTMLMediaElement loop boundary without waiting 158 seconds.
  await page.evaluate(() => { const p = window.__audioAudit.streams[0].media; p.currentTime = p.duration - 0.3; });
  await page.waitForTimeout(1500);
  assert((await state(page)).time < 4, 'Full overworld recording loops to its beginning');
  results.overworld = await state(page);
  console.log('Overworld: continuous across zones, full recording loops');
  const module = await page.evaluate(async () => {
    const { BOSS_MUSIC } = await import('/src/core/music.ts');
    return BOSS_MUSIC;
  });
  assert.deepEqual(module, { bowat: 'gimmeLove', snorlax: 'sanctuary', blep: 'gimmeLove', megabowat: 'sanctuary', bolatex: 'gimmeLove', qishex: 'sanctuary', finale: 'gimmeLove' });
  results.bosses = module;
  for (const [id, expected] of [['bowat','gimmeLove'], ['snorlax','sanctuary']]) {
    await boss(page, id);
    await page.waitForTimeout(1000);
    assert.equal((await state(page)).track, expected);
    assert(await signal(page) > 0.0001, `${id}: actual chorus signal`);
    await page.evaluate(() => { const p = window.__audioAudit.streams[0].media; p.currentTime = p.duration - 0.2; });
    await page.waitForTimeout(1100);
    assert((await state(page)).time < 3, `${id}: chorus loops`);
    await page.evaluate(() => window.__pokelove.activeMinigameScene().forceWin());
    await page.locator('.dialog').waitFor();
    assert.equal((await state(page)).track, null, `${id}: stop on win`);
    await dismiss(page);
    await page.waitForFunction(() => window.__pokelove.music.state().track === 'overworld');
    await page.waitForTimeout(2000);
    console.log(`${id}: chorus signal, loop and win teardown passed`);
  }
  await boss(page, 'bolat');
  await page.waitForTimeout(4200);
  const buffer = await page.evaluate(() => {
    const node = window.__audioAudit.buffers.at(-1).node;
    const s = window.__pokelove.activeMinigameScene();
    return { duration: node.buffer.duration, loop: node.loop, loopEnd: node.loopEnd, beat: s.song.beat, length: s.song.length };
  });
  assert(buffer.duration > 23 && buffer.duration < 23.4, 'Real Lover Girl cut was decoded');
  assert(buffer.loop && Math.abs(buffer.loopEnd - 23.272727) < 0.001);
  assert(Math.abs(buffer.beat - 60/82.5) < 0.001);
  assert(await signal(page, 'buffers') > 0.0001, 'Rhythm plays real audio');
  // Hit the actual chart through the game's keyboard layer and shared clock.
  await page.evaluate(() => {
    window.__rhythmBot = setInterval(() => {
      const s = window.__pokelove.activeMinigameScene();
      if (!s?.song || s.finished) return;
      const n = s.notes.find(n => n.state === 'live' && Math.abs(n.beat * s.song.beat - s.song.now()) < 0.04);
      if (!n || n.bot) return;
      n.bot = true;
      window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyZ' }));
      setTimeout(() => window.dispatchEvent(new KeyboardEvent('keyup', { code: 'KeyZ' })), 65);
    }, 8);
  });
  await page.waitForFunction(() => window.__pokelove.activeMinigameScene()?.finished, null, { timeout: 65000 });
  const rhythm = await page.evaluate(() => {
    clearInterval(window.__rhythmBot);
    const s = window.__pokelove.activeMinigameScene();
    return { hits: s.hits, notes: s.notes.length, stopped: !window.__pokelove.music.state().rhythm };
  });
  assert(rhythm.hits / rhythm.notes > 0.9, 'Chart can be played accurately against the audio clock');
  assert(rhythm.stopped, 'Rhythm audio stops on completion');
  results.rhythm = { ...buffer, ...rhythm };
  console.log('Rhythm real-clock playthrough:', results.rhythm);
  await page.waitForTimeout(2900);
  await dismiss(page);
  await page.waitForTimeout(2000);
  await boss(page, 'bolat');
  // An unattended round retries using a fresh count-in and song clock.
  await page.waitForFunction(() => window.__pokelove.activeMinigameScene()?.attempt > 0 && !window.__pokelove.activeMinigameScene()?.finished, null, { timeout: 65000 });
  const retry = await page.evaluate(() => {
    const s = window.__pokelove.activeMinigameScene();
    return { attempt: s.attempt, now: s.song.now(), window: s.window, rhythm: window.__pokelove.music.state().rhythm };
  });
  assert(retry.now < 0 && retry.rhythm && retry.window === 0.3, 'Retry restarts audio and count-in with assist');
  // Unlock skip through the framework and exercise the genuine B input path.
  await page.evaluate(() => { const s = window.__pokelove.activeMinigameScene(); s.ctx.fail(); s.ctx.fail(); s.ctx.fail(); });
  await page.keyboard.press('Escape');
  await page.waitForTimeout(400);
  assert(!(await state(page)).rhythm, 'Skip immediately stops the rhythm track');
  results.retryAndSkip = retry;
  console.log('Rhythm retry and skip passed');
  await dismiss(page);
  await page.waitForTimeout(2000);
  await page.evaluate(() => { void window.__pokelove.playEnding(); });
  await page.waitForTimeout(2500);
  for (let i = 0; i < 55 && !await page.locator('.cake-scene').count(); i++) {
    await page.keyboard.press('Enter'); await page.waitForTimeout(100);
  }
  await page.locator('.cake-scene').waitFor();
  await page.evaluate(() => { window.__birthdayVoices = [...window.__audioAudit.oscillators]; });
  assert.equal((await state(page)).track, null, 'Only Happy Birthday during candles');
  await page.keyboard.down('Enter');
  await page.waitForTimeout(4500);
  await page.keyboard.up('Enter');
  await page.waitForTimeout(1700);
  for (let i=0; i<5 && !await page.locator('.kisah').count(); i++) {
    await page.keyboard.press('Enter'); await page.waitForTimeout(250);
  }
  await page.locator('.kisah').waitFor();
  await page.waitForTimeout(600);
  assert.equal((await state(page)).track, 'ending');
  assert(await page.evaluate(() => window.__birthdayVoices.every(node => !window.__audioAudit.oscillators.has(node))), 'Birthday oscillators are cancelled before Bryant starts');
  results.ending = await state(page);
  await page.screenshot({ path: `${out}/ending.png` });
  // Continue through the actual scrapbook and letter; Bryant must keep playing.
  for (let i = 0; i < 90 && !await page.locator('.letter-layer').count(); i++) {
    await page.keyboard.press('Enter'); await page.waitForTimeout(150);
  }
  await page.locator('.letter-layer').waitFor();
  await page.keyboard.press('Enter');
  await page.waitForTimeout(400);
  assert.equal((await state(page)).track, 'ending', 'Ending song continues through the letter');
  await page.locator('.letter-next').click();
  await page.locator('.reveal').waitFor();
  await page.waitForTimeout(4000);
  assert.equal((await state(page)).track, 'ending', 'Ending song continues through the secret card');
  await page.keyboard.press('Enter');
  await page.locator('.the-end').waitFor();
  await page.waitForTimeout(900);
  await page.keyboard.press('Enter');
  await page.waitForFunction(() => window.__pokelove.music.state().track === null);
  console.log('Birthday, scrapbook, letter, secret card and ending teardown passed');
  await context.close();

  const phone = await fresh({ touch: true });
  await enter(phone.page, true);
  assert.equal((await state(phone.page)).paused, false, 'Phone touch unlocks playback');
  await phone.page.evaluate(() => window.__pokelove.music.stop());
  await phone.page.waitForTimeout(300);
  assert.equal((await state(phone.page)).paused, true, 'Explicit teardown pauses the stream');
  results.phone = 'touch unlock and teardown passed';
  await phone.context.close();

  const fallback = await fresh({ blockRhythm: true });
  await enter(fallback.page);
  await boss(fallback.page, 'bolat');
  await fallback.page.waitForTimeout(400);
  assert(await fallback.page.evaluate(() => !!window.__pokelove.activeMinigameScene().song), 'Invalid MP3 still gives a playable fallback round');
  results.fallback = 'invalid audio remains playable';
  await fallback.context.close();
  assert.deepEqual(errors, [], 'No browser errors');
  await writeFile(`${out}/verification.json`, JSON.stringify({ results, errors }, null, 2));
  console.log(JSON.stringify(results, null, 2));
} finally {
  await browser.close();
}
