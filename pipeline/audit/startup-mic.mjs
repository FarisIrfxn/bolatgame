import assert from 'node:assert/strict';
import { mkdir, readdir, stat, writeFile } from 'node:fs/promises';
// Font requests must not consume the deliberate 45s asset-stall timeout while
// taking four screenshots. Text already has readable system-font fallbacks.
process.env.PW_TEST_SCREENSHOT_NO_FONTS_READY = '1';
const { chromium } = await import(process.env.PW_CORE ?? '/home/durioo/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core/index.mjs');
const production = process.env.GAME_URL ?? 'http://localhost:5190';
const dev = process.env.DEV_URL ?? 'http://localhost:5191';
const out = process.env.AUDIT_OUT ?? 'art/startup-mic-2026-10-27/qa';
const part = process.argv[2] ?? 'all';
await mkdir(out, {recursive:true});
const assets=[];
async function walk(dir, prefix='') {
  for (const item of await readdir(dir,{withFileTypes:true})) {
    const path=`${dir}/${item.name}`, url=`${prefix}/${item.name}`;
    if(item.isDirectory()) await walk(path,url);
    else if(item.isFile()) assets.push({url,bytes:(await stat(path)).size});
  }
}
await walk('game/public/assets','/assets');
const report={loading:[],microphone:[],errors:[]};
const browser=await chromium.launch({args:['--use-angle=vulkan','--enable-features=Vulkan','--ignore-gpu-blocklist']});
async function fresh(base=production, serviceWorkers='allow') {
  const page=await browser.newPage({viewport:{width:1280,height:720},serviceWorkers});
  page.on('pageerror',e=>report.errors.push(String(e)));
  page.on('console',m=>{if(m.type()==='error')console.log('Browser:',m.text())});
  page.on('console',m=>{if(m.type()==='warning'&&m.text().startsWith('Asset download failed'))console.log(m.text())});
  await page.addInitScript(()=>performance.setResourceTimingBufferSize(5000));
  return page;
}
try {
  if(part !== 'mic') {
  const gated=await fresh(production,'block');
  let release; const gate=new Promise(resolve=>release=resolve);
  await gated.route('**/assets/models/house.glb',async route=>{await gate;await route.continue()});
  await gated.goto(production,{waitUntil:'domcontentloaded'});
  await gated.waitForFunction(()=>Number(document.querySelector('.startup-track')?.getAttribute('aria-valuenow'))>20);
  assert.equal(await gated.locator('.press').count(),0,'No Press Start while an asset is outstanding');
  await gated.keyboard.press('Space');
  assert.equal(await gated.locator('.dream-scene').count(),0,'Early Space cannot start the dream');
  for(const [width,height] of [[1280,720],[390,844],[844,390],[320,568]]) {
    await gated.setViewportSize({width,height});
    const layout=await gated.locator('.startup-content').evaluate(node=>{const r=node.getBoundingClientRect();return {left:r.left,right:r.right,top:r.top,bottom:r.bottom,width:innerWidth,height:innerHeight}});
    assert(layout.left>=0&&layout.top>=0&&layout.right<=width&&layout.bottom<=height,JSON.stringify(layout));
    assert(await gated.locator('.startup-mascot img').evaluate(img=>img.complete&&img.naturalWidth>0));
    await gated.screenshot({path:`${out}/loading-${width}.png`,animations:'disabled'});
    console.log('Loading layout captured:',width);
  }
  release();
  await Promise.race([
    gated.locator('.press').waitFor({timeout:60000}),
    gated.locator('.startup-retry:not([hidden])').waitFor({timeout:60000}).then(()=>{throw new Error('Held download failed before title')}),
  ]);
  assert.equal(await gated.locator('.startup-loading').count(),0);
  report.loading.push({heldAssetBlockedStart:true,responsiveSizes:4});
  console.log('Loading gate and responsive layouts passed');
  await gated.close();

  const retry=await fresh(production,'block'); let fail=true; const requests=new Map();
  retry.on('request',req=>requests.set(new URL(req.url()).pathname,(requests.get(new URL(req.url()).pathname)??0)+1));
  await retry.route('**/assets/models/house.glb',route=>fail?route.abort('failed'):route.continue());
  await retry.goto(production,{waitUntil:'domcontentloaded'});
  await retry.locator('.startup-retry:not([hidden])').waitFor({timeout:60000});
  assert.equal(await retry.locator('.press').count(),0);
  await retry.screenshot({path:`${out}/download-retry.png`});
  const completedRequests=requests.get('/assets/ending/ensemble-comic.webp');
  fail=false; await retry.locator('.startup-retry').click();
  await retry.locator('.press').waitFor({timeout:60000});
  assert.equal(requests.get('/assets/ending/ensemble-comic.webp'),completedRequests,'Retry preserves completed downloads');
  assert(requests.get('/assets/models/house.glb')>=2);
  report.loading.push({failedAssetRetry:true,preservedCompletedDownloads:true});
  console.log('Download retry passed');
  await retry.close();

  const normal=await fresh();
  await normal.goto(production,{waitUntil:'domcontentloaded'});
  await normal.locator('.press').waitFor({timeout:60000});
  const entries=await normal.evaluate(()=>performance.getEntriesByType('resource').map(r=>({url:new URL(r.name).pathname,type:r.initiatorType,bytes:r.decodedBodySize,transfer:r.transferSize})));
  for(const asset of assets) {
    assert(entries.some(r=>r.url===asset.url&&r.type==='fetch'&&r.bytes===asset.bytes),`Fully downloaded ${asset.url}`);
  }
  const cachedModels=entries.filter(r=>r.url.endsWith('.glb')&&r.transfer===0).length;
  assert(cachedModels>=51,'Model preparation reuses the downloaded cache');
  const cachedAssets=await normal.evaluate(async()=>{
    const controller=navigator.serviceWorker.controller;
    if(!controller)return 0;
    const version=new URL(controller.scriptURL).searchParams.get('v');
    return (await (await caches.open(`bolat-assets-${version}`)).keys()).length;
  });
  assert.equal(cachedAssets,assets.length,'All game assets persist in the versioned cache');
  await normal.locator('.press').click();
  await normal.locator('.dream-scene').waitFor();
  report.loading.push({allAssetsDownloaded:assets.length,bytes:assets.reduce((n,a)=>n+a.bytes,0),cachedAssets,cachedModels,pressStartOpenedDream:true});
  await normal.close();
  }

  const mic=await fresh(dev);
  await mic.goto(dev,{waitUntil:'domcontentloaded'});
  await mic.locator('.press').waitFor({timeout:60000});
  for(const mode of ['pending-keyboard','pending-touch','denied','accepted','setup-failure','cancel-pending','cancel-active']) {
    await mic.evaluate(async mode=>{
      window.__originalAC??=window.AudioContext;
      window.__micAudit={mode,done:false,stops:0,closed:0,contexts:0};
      const state=window.__micAudit;
      const stream={getTracks:()=>[{stop:()=>state.stops++}]};
      let accept; const pending=new Promise(resolve=>accept=resolve);
      state.accept=()=>accept(stream);
      Object.defineProperty(navigator,'mediaDevices',{configurable:true,value:{getUserMedia:()=>{
        if(mode==='denied')return Promise.reject(new DOMException('Denied','NotAllowedError'));
        if(mode==='accepted'||mode==='setup-failure'||mode==='cancel-active')return Promise.resolve(stream);
        return pending;
      }}});
      window.AudioContext=class {
        state='running';
        constructor(){state.contexts++;if(mode==='setup-failure')throw new Error('Audio setup failed')}
        resume(){return Promise.resolve()}
        createAnalyser(){return{fftSize:1024,getFloatTimeDomainData:buf=>buf.fill(mode==='accepted'?.3:0)}}
        createMediaStreamSource(){return{connect(){}}}
        close(){state.closed++;return Promise.resolve()}
      };
      const {blowCandles}=await import('/src/ending/cake.ts');
      const root=document.createElement('div');root.className='mic-test-root';root.style.cssText='position:fixed;inset:0;z-index:20000;background:#f7e6f0';document.body.append(root);
      void blowCandles(root,mode==='pending-keyboard'?26:1).then(()=>state.done=true);
    },mode);
    await mic.locator('.cake-scene').waitFor();
    assert(await mic.locator('.cake-scene canvas').evaluate(canvas=>canvas.getContext('2d').getImageData(canvas.width/2,canvas.height/2,1,1).data[3]>0),'Cake is already drawn while permission may be pending');
    if(mode.startsWith('cancel')) {
      if(mode==='cancel-active')await mic.waitForFunction(()=>window.__micAudit.contexts===1);
      await mic.locator('.mic-test-root').evaluate(root=>root.remove());
    } else if(mode==='accepted') {
      await mic.waitForFunction(()=>!document.querySelector('.cake-meter').hidden);
    } else if(mode==='pending-touch') {
      await mic.locator('.cake-scene canvas').dispatchEvent('pointerdown');
    } else await mic.keyboard.down('Space');
    await mic.waitForFunction(()=>window.__micAudit.done,null,{timeout:10000});
    await mic.keyboard.up('Space');
    await mic.dispatchEvent('body','pointerup');
    if(mode.startsWith('pending')||mode==='cancel-pending') {
      await mic.evaluate(()=>window.__micAudit.accept());
      await mic.waitForFunction(()=>window.__micAudit.stops===1);
    }
    const state=await mic.evaluate(()=>{const {mode,done,stops,closed,contexts}=window.__micAudit;return{mode,done,stops,closed,contexts}});
    if(mode==='accepted'||mode==='cancel-active')assert.equal(state.closed,1);
    if(mode!=='denied')assert.equal(state.stops,1);
    if(mode.startsWith('pending')||mode==='cancel-pending')assert.equal(state.contexts,0,'Late mic permission stops tracks before creating audio resources');
    report.microphone.push(state); console.log('Mic passed:',mode);
    await mic.evaluate(()=>{document.querySelector('.mic-test-root')?.remove();window.AudioContext=window.__originalAC});
  }
  await mic.close();
  assert.deepEqual(report.errors,[]);
  report.passed=true;
} finally {
  await writeFile(`${out}/verification${part==='all'?'':`-${part}`}.json`,JSON.stringify(report,null,2));
  console.log(JSON.stringify(report));
  await browser.close();
}
