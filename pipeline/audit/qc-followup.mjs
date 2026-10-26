// Oct 27 follow-up: real UI, active-device hints, boss bounds and complete ending.
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
const { chromium } = await import(process.env.PW_CORE ?? '/home/durioo/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core/index.mjs');
const out = process.argv[2] ?? process.env.FOLLOWUP_OUT ?? 'art/ending-qc-2026-10-27/qa';
await mkdir(out, { recursive: true });
const browser = await chromium.launch({ args: ['--use-angle=vulkan', '--enable-features=Vulkan', '--ignore-gpu-blocklist'] });
const report = [];
async function fresh(width, height, touch = false) {
  const context = await browser.newContext({ viewport: { width, height }, hasTouch: touch, isMobile: touch });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(String(e)));
  page.on('response', r => { if (r.status() >= 400) errors.push(`${r.status()} ${r.url()}`); });
  await page.addInitScript(() => {
    localStorage.setItem('pokelove-save-v1', JSON.stringify({ cards: [1,2,3,4,5,6,7,8], flags: { introSeen: true, endingSeen: true }, vals: {}, recordingMode: true, handedOver: [], zone: 'bilik' }));
    window.__qcPad = null;
    Object.defineProperty(navigator, 'getGamepads', { value: () => [window.__qcPad] });
  });
  await page.goto(process.env.GAME_URL ?? 'http://localhost:5181/', { waitUntil: 'networkidle' });
  await page.locator('.press').waitFor();
  if (touch) await page.locator('.press').tap(); else await page.locator('.press').click();
  await page.getByRole('button', { name: /Sambung/ }).click();
  await page.waitForFunction(() => window.__pokelove?.overworld?.zone?.id === 'bilik');
  await page.evaluate(() => { window.__pokelove.overworld.lock(); return document.fonts.ready; });
  return { page, context, errors };
}
async function scene(page, boss) {
  await page.evaluate(boss => { void window.__pokelove.playBoss(boss, { zone: 'bilik', spawn: 'start' }); }, boss);
  await page.locator('.mg-go').waitFor({ timeout: 30000 });
  if(await page.evaluate(()=>navigator.maxTouchPoints>0)) await page.locator('.mg-go').tap();
  else await page.locator('.mg-go').click();
  await page.waitForFunction(() => !!window.__pokelove.activeMinigameScene()?.sys.isActive());
  await page.waitForTimeout(350);
}
async function leaveBoss(page) {
  await page.evaluate(() => window.__pokelove.activeMinigameScene().ctx.win());
  for (let i = 0; i < 25; i++) {
    if(!await page.evaluate(()=>!!window.__pokelove.activeMinigameScene()) && !await page.locator('.dialog').count()) break;
    await page.keyboard.press('Enter'); await page.waitForTimeout(180);
  }
  await page.waitForFunction(() => !window.__pokelove.activeMinigameScene() && window.__pokelove.overworld.zone.id === 'bilik');
  await page.evaluate(()=>{window.__pokelove.overworld.lock();window.__pokelove.overworld.placePlayer(0,1,'front')});
}
try {
  for (const [name,width,height,touch] of [['desktop',1280,720,false],['phone',390,844,true],['landscape',844,390,true]]) {
    const { page, context, errors } = await fresh(width,height,touch);
    await page.evaluate(() => { void window.__pokelove.say([{who:'qish',text:'Tekan A untuk sambung adventure!',expression:'happy'}]); });
    await page.locator('.dialog .next').waitFor();
    await page.keyboard.press('ArrowLeft');
    await page.waitForFunction(() => document.querySelector('.dialog [data-control="a"]')?.textContent === 'Space');
    await page.evaluate(async () => {
      const url = performance.getEntriesByType('resource').find(e => e.name.includes('/src/core/input.ts')).name;
      window.__qcInput = (await import(url)).input;
    });
    const pad = async (id, button = 0) => {
      await page.evaluate(([id,button]) => { window.__qcPad = {id, axes:[0,0], buttons:Array.from({length:16},(_,i)=>({pressed:i===button,value:i===button?1:0}))}; }, [id,button]);
      await page.waitForTimeout(100);
    };
    // Use an axis instead of action to keep this particular dialogue visible.
    for (const [id,label] of [['Xbox Wireless Controller','A'],['DualSense Wireless Controller (054c)','✕'],['Nintendo Switch Pro Controller (057e)','B']]) {
      await page.evaluate(id => { window.__qcPad={id,axes:[.6,0],buttons:Array.from({length:16},()=>({pressed:false,value:0}))}; },id);
      await page.waitForFunction(label => document.querySelector('[data-control="a"]')?.textContent===label,label);
      assert.equal(await page.locator('.touch:visible').count(),0,'Touch controls hide during gamepad use');
      await page.waitForFunction(label=>document.querySelector('.dialog .text')?.textContent.includes(`Tekan ${label}`),label);
    }
    await pad('Xbox Wireless Controller',3);
    assert.equal(await page.evaluate(()=>window.__qcInput.down('a')),false,'Y is not the A action');
    await pad('Xbox Wireless Controller',0);
    assert.equal(await page.evaluate(()=>window.__qcInput.down('a')),true,'Standard bottom face button is A action');
    await page.evaluate(()=>{window.__qcPad=null;window.__qcInput.setTouchAxis(0,0)});
    await page.waitForTimeout(100);
    assert.equal(await page.evaluate(()=>window.__qcInput.label('a')),'A');
    for(let i=0;i<12&&await page.locator('.dialog').count();i++){await page.keyboard.press('Enter');await page.waitForTimeout(150);}
    await page.evaluate(()=>window.__pokelove.overworld.lock());
    await page.screenshot({path:`${out}/${name}-controls.png`});
    await scene(page,'bolatex');
    const bounds=await page.evaluate(()=>{
      const s=window.__pokelove.activeMinigameScene();
      return s.children.list.filter(o=>o.text==='GALERI MEMORI'||o.text?.startsWith('Kenangan tersusun:')).map(o=>({text:o.text,b:o.getBounds()}));
    });
    for(const {text,b} of bounds) assert(b.x>=338&&b.x+b.width<=942&&b.y>=12&&b.y+b.height<=100,`${text} fits header: ${JSON.stringify(b)}`);
    await page.screenshot({path:`${out}/${name}-memory.png`});
    await leaveBoss(page);
    if(name==='desktop'){
      await scene(page,'bolat');
      assert.equal(await page.evaluate(()=>window.__pokelove.activeMinigameScene().children.list.some(o=>o.text?.includes('pilih hati'))),false);
      await page.screenshot({path:`${out}/desktop-busking.png`});
      await leaveBoss(page);
      await scene(page,'bowat');
      await page.evaluate(()=>window.__pokelove.activeMinigameScene().forceWin());
      const center=await page.evaluate(()=>{const t=window.__pokelove.activeMinigameScene().hintText;const b=t.getBounds();return{x:b.centerX,y:b.centerY}});
      assert(Math.abs(center.x-640)<2&&Math.abs(center.y-360)<2,JSON.stringify(center));
      await page.screenshot({path:`${out}/desktop-bowat-win.png`});
      for(let i=0;i<20;i++){await page.keyboard.press('Enter');await page.waitForTimeout(220);}
      await page.waitForFunction(()=>!window.__pokelove.activeMinigameScene());
      await scene(page,'finale');
      // Exercise the actual victory sequence, rather than bypassing the panel cleanup.
      await page.evaluate(()=>{const s=window.__pokelove.activeMinigameScene();s.enemyHp=0;});
      for(let i=0;i<65;i++){
        const winning=await page.evaluate(()=>window.__pokelove.activeMinigameScene()?.dialoguePanel.visible===false);
        if(winning)break;
        await page.keyboard.press('Enter');await page.waitForTimeout(160);
      }
      assert.equal(await page.evaluate(()=>window.__pokelove.activeMinigameScene().dialoguePanel.visible),false,'Victory clears panel as well as text');
      await page.screenshot({path:`${out}/desktop-finale-win.png`});
      for(let i=0;i<15;i++){await page.keyboard.press('Enter');await page.waitForTimeout(180);}
    }
    // A fresh page avoids carrying a rematch or held action into the ending.
    await context.close();
    const ending=await fresh(width,height,touch);
    const p=ending.page;
    await p.evaluate(()=>{window.__pokelove.overworld.lock();void window.__pokelove.playEnding();});
    for(let i=0;i<70&&!await p.locator('.cake-scene').count();i++){await p.keyboard.press('Enter');await p.waitForTimeout(150);}
    await p.locator('.cake-scene').waitFor();
    await p.screenshot({path:`${out}/${name}-candles.png`});
    await p.keyboard.down('Space');await p.locator('.bday-banner').waitFor({timeout:20000});await p.keyboard.up('Space');await p.waitForTimeout(1900);
    await p.keyboard.press('Enter');
    for(let i=0;i<110&&!await p.locator('.letter-next').count();i++){
      const caption=await p.locator('.kisah-cap').count()?await p.locator('.kisah-cap').innerText():'';
      if(caption.includes('Mula-mula kawan')&&!await p.evaluate(()=>window.__friendShot)){await p.evaluate(()=>window.__friendShot=true);await p.screenshot({path:`${out}/${name}-friends.png`});}
      await p.keyboard.press('Enter');await p.waitForTimeout(170);
    }
    await p.locator('.letter-next').waitFor();
    console.log(name,'ending reached letter');
    await p.keyboard.press('Enter');await p.waitForTimeout(400);
    await p.locator('.letter-next').click();
    await p.locator('.card9').waitFor();await p.waitForTimeout(4200);
    await p.screenshot({path:`${out}/${name}-secret-card.png`});
    assert(!(await p.locator('.ending').innerText()).includes('Minta kad betul'));
    await p.keyboard.press('Enter');await p.locator('.the-end').waitFor();
    await p.locator('.ending-poster').evaluate(img=>img.decode());
    await p.screenshot({path:`${out}/${name}-the-end.png`});
    const image=await p.locator('.ending-poster').evaluate(img=>({w:img.naturalWidth,h:img.naturalHeight,fit:getComputedStyle(img).objectFit}));
    assert(image.w>1000&&image.h>500&&image.fit==='contain');
    assert.equal(errors.length,0,errors.join('\n'));assert.equal(ending.errors.length,0,ending.errors.join('\n'));
    report.push({name,controls:['keyboard','touch','Xbox','PlayStation','Nintendo'],memoryHeader:bounds,endingPoster:image,errors:[...errors,...ending.errors]});
    await ending.context.close();
    console.log(name,'follow-up QC passed');
  }
  await writeFile(`${out}/verification.json`,JSON.stringify(report,null,2));
} finally {await browser.close();}
