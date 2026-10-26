// Screenshot catalogue of the current UI. Uses isolated browser saves and real components.
// Run from repo root: node pipeline/audit/ui-qc.mjs
import { mkdir, readFile, writeFile } from 'node:fs/promises';
const { chromium } = await import(process.env.PW_CORE ?? '/home/durioo/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core/index.mjs');
const out = 'art/ui-paper-qc';
await mkdir(out, { recursive: true });
const browser = await chromium.launch({ args: ['--use-angle=vulkan', '--enable-features=Vulkan', '--ignore-gpu-blocklist'] });
const onlyBoss = process.argv[process.argv.indexOf('--boss') + 1];
const filtered = process.argv.includes('--boss');
const previous = filtered ? JSON.parse(await readFile(`${out}/manifest.json`, 'utf8')) : null;
const shots = previous?.shots ?? [], errors = previous?.errors ?? [];
async function fresh(mobile = false, party = false) {
  const context = await browser.newContext({ viewport: mobile ? { width: 390, height: 844 } : { width: 1280, height: 720 }, hasTouch: mobile, isMobile: mobile });
  const page = await context.newPage();
  page.setDefaultTimeout(15000);
  page.on('pageerror', e => errors.push(String(e)));
  page.on('response', r => { if (r.status() >= 400) errors.push(`${r.status()} ${r.url()}`); });
  await page.addInitScript(party => localStorage.setItem('pokelove-save-v1', JSON.stringify({ cards: party ? [5,3,7,1,2,6,4,8] : [5,3,7], flags: { introSeen: true, endingSeen: party }, vals: {}, recordingMode: false, handedOver: [], zone: party ? 'labulanjut' : 'bilik' })), party);
  await page.goto('http://localhost:5181/', { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  return page;
}
async function shot(page, id, title, note = '') {
  await page.waitForTimeout(250);
  await page.screenshot({ path: `${out}/${id}.png` });
  const existing = shots.findIndex(s=>s.id===id);
  const entry = { id, title, note, file: `${id}.png`, viewport: page.viewportSize() };
  if(existing>=0) shots[existing]=entry; else shots.push(entry);
  await writeFile(`${out}/manifest.json`, JSON.stringify({ capturedAt: new Date().toISOString(), source: 'http://localhost:5181/', shots, errors }, null, 2));
  console.log(`${id}: ${title}`);
}
async function enter(page) {
  await page.locator('.press').click();
  await page.getByRole('button', { name: /Sambung/ }).click();
  await page.waitForTimeout(4500);
  await clearDialog(page);
  await page.evaluate(() => window.__pokelove.overworld.lock());
}
async function clearDialog(page) {
  for (let i=0; i<60 && await page.locator('.dialog').count(); i++) { await page.keyboard.press('Enter'); await page.waitForTimeout(90); }
}
// Invoke an existing runtime component without adding QC controls to the game.
async function invoke(page, module, fn, args = []) {
  await page.evaluate(async ({module, fn, args}) => { const m = await import(`/src/${module}.ts`); void m[fn](...args); }, { module, fn, args });
}
async function basic(mobile) {
  const p = await fresh(mobile), prefix = mobile ? 'M' : 'A';
  await shot(p, `${prefix}01`, 'Title / Press Start');
  await p.locator('.press').click();
  await shot(p, `${prefix}02`, 'Sambung / Main baru');
  await p.getByRole('button', { name: /Main baru/ }).dispatchEvent('pointerdown');
  await p.getByRole('button', {name:'Tak jadi'}).waitFor();
  await shot(p, `${prefix}03`, 'Pengesahan reset save');
  await p.getByRole('button', {name:'Tak jadi'}).click();
  await p.getByRole('button', {name:/Sambung/}).dispatchEvent('pointerdown');
  await p.waitForTimeout(4500); await clearDialog(p);
  await shot(p, `${prefix}04`, 'HUD lokasi + koleksi kad + kawalan', mobile ? 'Joystick dan butang A/B sebenar pada peranti touch.' : 'Tiga kad diperoleh; lima slot terkunci.');
  await p.evaluate(() => window.__pokelove.overworld.lock());
  await invoke(p, 'ui/hud', 'setCollect', [{icon:'',kind:'cookie',name:'Cookies Bowat',got:3,need:6}]);
  await shot(p, `${prefix}05`, 'HUD quest / koleksi 3 daripada 6', 'Preview komponen sebenar dengan nilai contoh.');
  await invoke(p, 'ui/hud', 'setCollect', [{icon:'',kind:'cookie',name:'Cookies Bowat',got:6,need:6}]);
  await shot(p, `${prefix}06`, 'Quest lengkap', 'Preview komponen sebenar dengan nilai contoh.');
  await invoke(p, 'ui/hud', 'setCollect', [null]);
  await invoke(p, 'ui/hud', 'setWorkout', [{kg:'83.0kg',progress:0.5,buddy:true}]);
  await shot(p, `${prefix}07`, 'HUD berat / sasaran 80kg / bonus x2', 'Preview komponen sebenar dengan nilai contoh.');
  await p.evaluate(async () => { const {repMeter}=await import('/src/ui/reps.ts'); void repMeter('Air Walker',12,()=>{}); });
  await shot(p, `${prefix}08`, 'Panel senaman / kiraan rep', 'Preview panel; dunia belakang kekal bilik.');
  for(let n=0;n<12;n++){await p.locator('.rep-panel').dispatchEvent('pointerdown');await p.waitForTimeout(35);}
  await p.locator('.rep-panel').waitFor({state:'detached'});
  await invoke(p, 'ui/hud', 'setWorkout', [null]);
  await p.evaluate(() => { void window.__pokelove.say([{who:'qish',text:'Faris hilang. Bowat pun hilang. Okay, jom cari sayang!',expression:'thinking'}, {who:'farisbiasa',text:'Aku tunggu kat luar.',expression:'love'}]); });
  await p.waitForTimeout(1800); await shot(p, `${prefix}09`, 'Dialog Qish / ekspresi / petunjuk A', 'Ayat contoh untuk preview susun atur.');
  await p.keyboard.press('Enter'); await p.keyboard.press('Enter');
  await p.waitForTimeout(1100); await shot(p, `${prefix}10`, 'Dialog dua watak / spotlight Faris');
  await clearDialog(p);
  await p.evaluate(async () => { const {ask}=await import('/src/ui/dialog.ts'); const {MYVI_ASK}=await import('/src/content/script.ts'); void ask(MYVI_ASK,['Labu Lanjut','Bukit Bintang','Lorbel','Tasik Lily','KLIA','Nyomnyom City','Lorong Photobooth','Putrajaya','Litar Sepang','Batal']); });
  await p.locator('.choices').waitFor();
  await shot(p, `${prefix}11`, 'Myvi / senarai destinasi', 'Preview senarai penuh menggunakan dialog pilihan yang sama.');
  await p.locator('.choice').last().dispatchEvent('pointerdown'); await p.waitForTimeout(150);
  await invoke(p,'ui/phone','showPhone',['unanswered']);
  await p.waitForTimeout(1800); await shot(p,`${prefix}12`,'Phone pagi / mesej tidak berbalas');
  await p.keyboard.press('Enter'); await p.waitForTimeout(150);
  await invoke(p,'ui/phone','showPhone',['wake']);
  await p.waitForTimeout(7300); await shot(p,`${prefix}13`,'Phone petang / Faris online dan membalas');
  await p.keyboard.press('Enter'); await p.waitForTimeout(150);
  await p.evaluate(async () => { const {ask}=await import('/src/ui/dialog.ts'); const {CONSOLE_ASK}=await import('/src/content/script.ts'); const {BOSSES}=await import('/src/content/bosses.ts'); void ask(CONSOLE_ASK,[...Object.values(BOSSES).map(b=>b.name),'Batal']); });
  await p.locator('.choices').waitFor(); await shot(p,`${prefix}14`,'Konsol bilik / menu main semula boss');
  await p.locator('.choice').last().dispatchEvent('pointerdown'); await p.waitForTimeout(150);
  await invoke(p,'ui/zoneTitle','zoneTitle',['Labu Lanjut',true]);
  await p.waitForTimeout(850); await shot(p,`${prefix}15`,'Overlay nama zon');
  await p.waitForTimeout(3100);
  await p.keyboard.press('Backquote'); await shot(p,`${prefix}16`,'Panel dev / retake', 'Panel rahsia untuk Faris; bukan menu pemain biasa.');
  await p.context().close();
}
async function bosses() {
  for (const [i,boss] of ['bowat','bolat','snorlax','blep','megabowat','bolatex','qishex','finale'].entries()) {
    if(filtered && boss!==onlyBoss) continue;
    const p = await fresh(); await enter(p);
    await p.evaluate(boss=>{void window.__pokelove.playBoss(boss);},boss);
    await p.locator('.mg-intro').waitFor(); await p.waitForTimeout(500);
    await shot(p,`B${String(i+1).padStart(2,'0')}-intro`,`Intro boss ${i+1} / ${boss}`);
    await p.locator('.mg-go').click(); await p.waitForTimeout(2100);
    if(boss==='finale') {
      for(let n=0;n<20;n++) {
        const ready=await p.evaluate(()=>window.__pokelove.activeMinigameScene()?.children.list.some(e=>e.type==='Container' && e.list.some(t=>t.text==='Antek Giler')));
        if(ready) break;
        await p.keyboard.press('Enter'); await p.waitForTimeout(180);
      }
    }
    await shot(p,`B${String(i+1).padStart(2,'0')}-game`,`Minigame ${i+1} / ${boss}`);
    if(boss==='bowat') {
      await p.evaluate(()=>{const s=window.__pokelove.activeMinigameScene();s.ctx.fail();s.ctx.fail();s.ctx.fail();});
      await shot(p,'B09','Bantuan / skip selepas 3 kegagalan','Kiraan gagal disimulasi melalui dev; UI skip sebenar.');
    }
    await p.context().close();
  }
}
async function ending(mobile=false) {
  const p = await fresh(mobile,true), pre=mobile?'N':'C'; await enter(p);
  await p.evaluate(()=>window.__pokelove.overworld.placePlayer(-20,0,'back'));
  await p.waitForTimeout(1700);
  await p.evaluate(()=>{void window.__pokelove.playEnding();});
  await shot(p,`${pre}01`,'SURPRISE / confetti');
  for(let n=0;n<90 && !await p.locator('.cake-scene').count();n++){await p.keyboard.press('Enter');await p.waitForTimeout(130);}
  await p.locator('.cake-scene').waitFor(); await p.waitForTimeout(700);
  await shot(p,`${pre}02`,'Kek mangga / 26 lilin / arahan tiup','Tanpa mikrofon; kawalan tahan A digunakan.');
  await p.keyboard.down('Space'); await p.waitForTimeout(4300); await p.keyboard.up('Space');
  await p.locator('.bday-banner').waitFor(); await p.waitForTimeout(1900);
  await shot(p,`${pre}03`,'Ucapan birthday / confetti');
  await p.keyboard.press('Enter'); await p.locator('.kisah').waitFor();
  for(let i=0;i<9;i++) {
    await p.waitForTimeout(200); await p.keyboard.press('Enter'); await p.waitForTimeout(250);
    await shot(p,`${pre}${String(i+4).padStart(2,'0')}`,`Kisah Kita / memori ${i+1} daripada 9`);
    await p.keyboard.press('Enter');
  }
  for(let n=0;n<70 && !await p.locator('.letter-layer').count();n++){await p.keyboard.press('Enter');await p.waitForTimeout(150);}
  await p.locator('.letter-layer').waitFor(); await p.keyboard.press('Enter'); await p.waitForTimeout(400);
  await shot(p,`${pre}13`,'Surat Faris','Teks surat masih draf / placeholder.');
  await p.locator('.letter-next').click(); await p.locator('.reveal').waitFor(); await p.waitForTimeout(4000);
  await shot(p,`${pre}14`,'Kad rahsia ke-9','Rekaan kad masih sementara.');
  await p.keyboard.press('Enter'); await p.locator('.the-end').waitFor();
  await shot(p,`${pre}15`,'Tamat / kembali free roam');
  await p.context().close();
}
try {
  if(filtered) {
    await bosses();
  } else {
  await basic(false); await basic(true); await bosses();
  const p = await fresh(); await enter(p);
  await invoke(p,'ui/cardReveal','revealCard',[5]); await p.waitForTimeout(3000);
  await shot(p,'A17','Card reveal / holo / kad diperoleh');
  await p.keyboard.press('Enter'); await p.waitForTimeout(500);
  await p.evaluate(()=>{window.__pokelove.save.data.recordingMode=true;window.__pokelove.save.data.handedOver=[];});
  await invoke(p,'ui/cardReveal','revealCard',[3]); await p.waitForTimeout(3000);
  await shot(p,'A18','Card reveal / minta kad fizikal','Mode rakaman ON.');
  await p.keyboard.press('Enter'); await p.waitForTimeout(500);
  await invoke(p,'intro/dream','playDream'); await p.waitForTimeout(2500);
  await shot(p,'A19','Intro mimpi / sofa / dialog'); await p.context().close();
  await ending(); await ending(true);
  }
  console.log(`Captured ${shots.length} screens; ${errors.length} browser/asset errors.`);
} finally { await browser.close(); }
