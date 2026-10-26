// Verify the production server behind the tunnel, independently of Vite/dev hooks.
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
const { chromium } = await import(process.env.PW_CORE ?? '/home/durioo/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core/index.mjs');
const out = 'art/ui/paper';
await mkdir(out,{recursive:true});
const browser=await chromium.launch({args:['--use-angle=vulkan','--enable-features=Vulkan','--ignore-gpu-blocklist']});
const errors=[],results=[];
try {
  for(const [name,width,height] of [['desktop',1280,720],['phone',390,844]]) {
    const context=await browser.newContext({viewport:{width,height},hasTouch:name==='phone'});
    const page=await context.newPage();
    page.on('pageerror',e=>errors.push(String(e)));
    page.on('response',r=>{if(r.status()>=400) errors.push(`${r.status()} ${r.url()}`);});
    await page.addInitScript(()=>localStorage.setItem('pokelove-save-v1',JSON.stringify({cards:[5,3,7],flags:{introSeen:true},vals:{},recordingMode:false,handedOver:[],zone:'bilik'})));
    await page.goto('http://127.0.0.1:5180/',{waitUntil:'networkidle'});
    await page.evaluate(()=>document.fonts.ready);
    assert.equal(await page.title(),'The Adventure of Qish');
    assert(await page.locator('.logo img').evaluate(e=>e.complete&&e.naturalWidth>0));
    await page.screenshot({path:`${out}/production-${name}-title.png`});
    await page.locator('.press').click();
    await page.getByRole('button',{name:/Sambung/}).click();
    await page.locator('.hud:visible').waitFor();
    await page.waitForTimeout(4500);
    const state=await page.evaluate(()=>({font:getComputedStyle(document.querySelector('.hud')).fontFamily,bg:getComputedStyle(document.querySelector('.hud')).backgroundColor,images:[...document.querySelectorAll('.hud img')].every(e=>e.complete&&e.naturalWidth>0),retro:performance.getEntriesByType('resource').filter(e=>e.name.includes('/assets/retro/')).map(e=>e.name)}));
    assert(!/VT323|Press Start/i.test(state.font));assert(state.images);assert.deepEqual(state.retro,[]);
    await page.screenshot({path:`${out}/production-${name}-hud.png`});
    results.push({name,width,height,...state});
    await context.close();
  }
  assert.deepEqual(errors,[]);
  await writeFile(`${out}/production-verification.json`,JSON.stringify({results,errors},null,2));
  console.log('Production desktop + phone: title, logo, paper HUD, card art, no retro resource requests; passed.');
} finally {await browser.close();}
