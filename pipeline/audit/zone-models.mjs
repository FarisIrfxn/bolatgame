// Dev server required. Exercises real city loading, cache eviction, decoded
// ImageBitmap cleanup, shared-model reuse and a failed model download/retry.
import assert from 'node:assert/strict';
import {writeFile} from 'node:fs/promises';
const {chromium} = await import(process.env.PW_CORE ?? '/home/durioo/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core/index.mjs');
const GAME = process.env.GAME_URL ?? 'http://127.0.0.1:5181/';
const browser = await chromium.launch({args:['--use-angle=vulkan','--enable-features=Vulkan','--ignore-gpu-blocklist']});
try {
  const context = await browser.newContext({viewport:{width:844,height:390},hasTouch:true,deviceScaleFactor:3,serviceWorkers:'block'});
  await context.addInitScript(() => {
    const bitmaps = new Set(); let closed = 0;
    const create = window.createImageBitmap.bind(window);
    window.createImageBitmap = async (...args) => { const bitmap=await create(...args);bitmaps.add(bitmap);return bitmap; };
    const close = ImageBitmap.prototype.close;
    ImageBitmap.prototype.close = function() { if(bitmaps.delete(this))closed++;return close.call(this); };
    window.__bitmapState = () => ({open:bitmaps.size,closed});
  });
  const page = await context.newPage();
  const errors=[];page.on('pageerror', error => errors.push(String(error)));
  await page.goto(GAME);
  await page.waitForFunction(() => window.__pokelove && !document.querySelector('.startup-loading'),null,{timeout:120000});
  assert.deepEqual(await page.evaluate(() => window.__overworld.modelState().loaded),[], 'title must not decode GLBs');
  const samples=[];
  for(const mode of ['morning','party','waiting']) for(const zone of ['bilik','labulanjut','sunway','galeri','dusun','angkasa','cosyplace','photobooth','bukit','sepang']) {
    const sample=await page.evaluate(async ({mode,zone}) => {
      const {save,loadZone,overworld:ow}=window.__pokelove;
      save.data.cards=mode==='morning'?[]:[1,2,3,4,5,6,7,8];
      save.data.flags={introSeen:true,endingSeen:mode==='party'};
      const started=performance.now();await loadZone(zone,'start');
      await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
      return {mode,zone,...ow.modelState(),...window.__bitmapState(),buildMs:Math.round(performance.now()-started)};
    },{mode,zone});
    assert.deepEqual(sample.missing,[], `${mode}/${zone}: missing models`);
    assert.deepEqual([...sample.loaded].sort(),[...sample.requested].sort(), `${mode}/${zone}: cache includes unused models`);
    assert.equal(sample.open,sample.loaded.length, `${mode}/${zone}: decoded model images leaked`);
    assert.equal(await page.locator('.city-loading').count(),0);
    samples.push(sample);
    console.log(JSON.stringify({mode,zone,models:sample.loaded.length,bitmaps:sample.open,buildMs:sample.buildMs}));
  }
  // Shared models must keep the same decoded bitmap during a city switch.
  const reuse=await page.evaluate(async () => {
    const {loadZone,overworld:ow}=window.__pokelove;
    await loadZone('galeri','start');
    const before=window.__bitmapState();
    await loadZone('photobooth','start');
    return {before,after:window.__bitmapState(),state:ow.modelState()};
  });
  assert.equal(reuse.after.closed-reuse.before.closed,1,'only Lorbel motorbike should be evicted; Myvi/signboard must be reused');
  // Fail the very first city load, after boot's full download has completed.
  const failure=await context.newPage();
  await failure.goto(GAME);
  await failure.waitForFunction(() => window.__pokelove && !document.querySelector('.startup-loading'),null,{timeout:120000});
  await failure.route('**/assets/models/bilik_plant.glb',route=>route.abort());
  await failure.evaluate(() => window.__pokelove.travel('bilik','start'));
  assert.equal(await failure.locator('.travel-failure').count(),1,'first city failure must offer retry');
  assert.equal(await failure.locator('.city-loading').count(),0,'loading overlay must be cleaned on failure');
  await failure.unroute('**/assets/models/bilik_plant.glb');
  await failure.locator('.travel-failure button').click();
  await failure.waitForFunction(() => window.__overworld.currentZone==='bilik' && !document.querySelector('.city-loading'));
  assert.deepEqual(await failure.evaluate(() => window.__overworld.modelState().missing),[]);
  assert.deepEqual(errors,[]);
  const result={result:'PASS',titleModels:0,samples,reuse,firstCityRetry:true,errors};
  await writeFile(process.env.AUDIT_OUT ?? '/tmp/qish-zone-models.json',JSON.stringify(result,null,2));
  console.log(JSON.stringify({result:'PASS',cases:samples.length,reuse:true,firstCityRetry:true,errors}));
} finally {await browser.close();}
