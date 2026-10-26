// Verify the Faris/Babah portraits, shared Faris alias and living overworld NPCs.
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
const { chromium } = await import(process.env.PW_CORE ?? '/home/durioo/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core/index.mjs');
const out = 'art/chars/human-audit';
await mkdir(out, { recursive: true });
const browser = await chromium.launch({ args: ['--use-angle=vulkan', '--enable-features=Vulkan', '--ignore-gpu-blocklist'] });
const report = [];
try {
  for (const [name, width, height] of [['desktop',1280,720], ['phone',390,844], ['landscape',844,390]]) {
    const page = await browser.newPage({ viewport: { width, height } });
    const errors = [];
    page.on('pageerror', e => errors.push(String(e)));
    page.on('response', r => { if (r.status() >= 400) errors.push(`${r.status()} ${r.url()}`); });
    await page.addInitScript(() => localStorage.setItem('pokelove-save-v1', JSON.stringify({
      cards: [5,3,7,1,2,6,4,8], flags: { introSeen: true, endingSeen: true, babahMet: true, babahFixed: true },
      vals: {}, recordingMode: false, handedOver: [], zone: 'bilik',
    })));
    await page.goto('http://localhost:5181/', { waitUntil: 'networkidle' });
    await page.locator('.press').click();
    await page.getByRole('button', { name: /Sambung/ }).click();
    await page.waitForTimeout(3500);
    const sets = {
      farisbiasa: name === 'desktop' ? ['normal','happy','smug','surprised','deadpan','sleepy','shy','sorry','love','defeated'] : ['love','sorry'],
      babah: name === 'desktop' ? ['normal','happy','surprised','guilty','thinking','deadpan','love'] : ['guilty','love'],
    };
    for (const [who, faces] of Object.entries(sets)) {
      await page.evaluate(({who, faces}) => { void window.__pokelove.say([
        { who: 'qish', text: 'Sayang.', expression: 'thinking' },
        ...faces.map(face => ({ who, text: face, ...(face === 'normal' ? {} : {expression: face}) })),
      ]); }, {who, faces});
      await page.waitForTimeout(400);
      await page.keyboard.press('Enter');
      for (const face of faces) {
        const prefix = who === 'farisbiasa' ? 'faris' : who;
        const portrait = page.locator(`.vn-stage img.lit[src$="${prefix}_portrait_${face}.webp"]`);
        await portrait.waitFor();
        await portrait.evaluate(img => img.decode());
        assert.equal(await portrait.evaluate(img => getComputedStyle(img).imageRendering), 'auto', 'anime portrait uses smooth sampling');
        const visible = await portrait.evaluate(img => {
          const r = img.getBoundingClientRect(), aspect = img.naturalWidth / img.naturalHeight;
          const w = Math.min(r.width, r.height * aspect), h = w / aspect;
          return { x: r.x + (r.width-w)/2, y: r.bottom-h, right: r.x + (r.width+w)/2, bottom: r.bottom };
        });
        if (visible.x < -1 || visible.y < -1 || visible.right > width+1 || visible.bottom > height+1)
          await page.screenshot({ path: `${out}/${name}-${prefix}-overflow.png` });
        assert(visible.x >= -1 && visible.y >= -1 && visible.right <= width+1 && visible.bottom <= height+1, `${name}: ${prefix} ${face} portrait drawing fits: ${JSON.stringify(visible)}`);
        const bounds = await page.locator('.dialog').boundingBox();
        assert(bounds && bounds.x >= -1 && bounds.y >= -1 && bounds.x + bounds.width <= width + 1 && bounds.y + bounds.height <= height + 1, `${name} dialogue fits`);
        if (['love','guilty','sorry'].includes(face)) {
          await page.waitForTimeout(300);
          await page.screenshot({ path: `${out}/${name}-${prefix}-${face}.png` });
        }
        await page.waitForTimeout(350);
        await page.keyboard.press('Enter');
      }
      await page.waitForTimeout(350);
    }
    // Alternate names/forms share one portrait on the right.
    await page.evaluate(() => { void window.__pokelove.say([
      {who:'faris',text:'Raja Malas.',expression:'smug'}, {who:'farisbiasa',text:'Faris.',expression:'love'},
    ]); });
    await page.waitForTimeout(500);
    assert.equal(await page.locator('.vn-stage .right img').count(), 1, 'Faris aliases share one figure');
    await page.keyboard.press('Enter'); await page.waitForTimeout(450); await page.keyboard.press('Enter');
    await page.waitForTimeout(500);
    await page.evaluate(async () => { await window.__pokelove.travel('angkasa', 'babah'); });
    assert(await page.evaluate(() => !!window.__pokelove.overworld.npc('babah')), 'Babah is a PaperSprite NPC');
    const checkIdle = async id => {
      const result = await page.evaluate(id => {
        const npc = window.__pokelove.overworld.npc(id);
        // Advance the real idle state machine to its blink and smile steps.
        npc.face('front'); npc.update(.3, false);
        npc.expr = ''; npc.routine = null; npc.faceTimer = 0; npc.blinksLeft = 1;
        npc.update(.016, false);
        const blink = npc.mesh.material.map === npc.faceTex.front.blink.tex;
        npc.routine = [{face:'smile', hold:1}]; npc.step = 0; npc.faceTimer = 0;
        npc.update(.016, false);
        const smile = npc.mesh.material.map === npc.faceTex.front.smile.tex;
        npc.routine = null; npc.faceTimer = 0;
        npc.update(.016, false);
        return {blink, smile};
      }, id);
      assert.deepEqual(result, {blink:true, smile:true}, `${id}: real idle textures switch`);
    };
    await checkIdle('babah');
    await page.waitForTimeout(2500);
    await page.screenshot({ path: `${out}/${name}-babah-klia.png` });
    await page.evaluate(async () => { await window.__pokelove.travel('labulanjut', 'start');
      window.__pokelove.overworld.player.group.position.set(-22.4, 0, 0); });
    assert(await page.evaluate(() => !!window.__pokelove.overworld.npc('faris')), 'Faris party NPC loads');
    await checkIdle('faris');
    await page.waitForTimeout(1800);
    await page.screenshot({ path: `${out}/${name}-faris-party.png` });
    assert.deepEqual(errors, [], `${name}: browser and asset errors`);
    report.push({ viewport: name, errors, portraits: Object.values(sets).flat().length, checks: ['expressions','smooth-portraits-fit','Faris-alias','dialogue-fits','Babah-idle','Faris-idle','Babah-NPC','Faris-NPC'] });
    console.log(`${name}: passed`);
    await page.close();
  }
  await writeFile(`${out}/verification.json`, JSON.stringify(report, null, 2));
} finally { await browser.close(); }
