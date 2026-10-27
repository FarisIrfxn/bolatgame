import assert from 'node:assert/strict';
const {chromium} = await import(process.env.PW_CORE ?? '/home/durioo/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core/index.mjs');
const GAME = process.env.GAME_URL ?? 'http://127.0.0.1:5181/';

const browser = await chromium.launch({args:['--use-angle=vulkan','--enable-features=Vulkan','--ignore-gpu-blocklist']});
try {
  const context = await browser.newContext({viewport:{width:844,height:390},hasTouch:true,deviceScaleFactor:3});
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(String(error)));
  await page.addInitScript(() => localStorage.setItem('pokelove-save-v1', JSON.stringify({cards:[1,2,3,4,5,6,7,8],flags:{introSeen:true,endingSeen:true},vals:{},recordingMode:false,handedOver:[],zone:'bilik'})));
  await page.goto(GAME);
  await page.waitForFunction(() => window.__pokelove && !document.querySelector('.startup-loading'), {timeout:120000});
  const blur = await page.evaluate(async () => {
    const original = Object.getOwnPropertyDescriptor(CanvasRenderingContext2D.prototype, 'filter');
    const source = document.createElement('canvas'); source.width = source.height = 96;
    const ctx = source.getContext('2d'); ctx.fillStyle = 'black';ctx.fillRect(0,0,96,96);
    ctx.fillStyle = 'rgb(255,0,0)';ctx.fillRect(24,12,40,65);
    const {blurMask} = await import('/src/overworld/maskBlur.ts');
    const native = blurMask(source,2.5).getContext('2d').getImageData(0,0,96,96).data;
    Object.defineProperty(CanvasRenderingContext2D.prototype,'filter',{configurable:true,get(){return 'none'},set(){}});
    const fallbackModule = await import('/src/overworld/maskBlur.ts?software-test');
    const software = fallbackModule.blurMask(source,2.5).getContext('2d').getImageData(0,0,96,96).data;
    Object.defineProperty(CanvasRenderingContext2D.prototype,'filter',original);
    let error=0, count=0;
    for(let y=8;y<88;y++)for(let x=8;x<88;x++) { const i=(y*96+x)*4;error+=(native[i]-software[i])**2;count++; }
    const edge=software[(40*96+23)*4];
    return {rmse:Math.sqrt(error/count),edge};
  });
  assert(blur.edge>0 && blur.edge<255, 'software blur must soften road edge');
  assert(blur.rmse<5, `desktop/software masks differ too much: ${blur.rmse}`);
  await page.evaluate(() => window.__pokelove.travel('bilik','start'));
  assert.equal(await page.locator('.city-loading').count(),0);
  const samples=[];
  const leaks=[];
  for(let cycle=0;cycle<5;cycle++)for(const zone of ['labulanjut','sunway','galeri']) {
    const build = await page.evaluate(async zone => {
      const {ZONES}=await import('/src/zones/zones.ts');
      const ow=window.__overworld;ow.unmount();const start=performance.now();
      await ow.loadZone(ZONES[zone],'start');await ow.mount();return performance.now()-start;
    },zone);
    await page.waitForTimeout(450);
    const memory=await page.evaluate(() => ({...window.__overworld.renderer.info.memory}));
    const ownership=await page.evaluate(() => {
      const ow=window.__overworld;
      const leaked=(window.__testTextures??[]).filter(t => !t.userData.shared && ow.renderer.properties.get(t).__webglInit);
      const current=new Set();
      ow.zoneRoot.traverse(o => {
        for(const mat of o.material ? (Array.isArray(o.material)?o.material:[o.material]):[]) {
          for(const value of Object.values(mat))if(value?.isTexture)current.add(value);
        }
      });
      window.__testTextures=[...current];
      return leaked.map(t=>({id:t.id,width:t.image?.width,height:t.image?.height}));
    });
    leaks.push(...ownership);
    samples.push({cycle,zone,buildMs:Math.round(build),...memory});
    console.log(JSON.stringify(samples.at(-1)));
  }
  for(const zone of ['labulanjut','sunway','galeri']) {
    const rows=samples.filter(sample=>sample.zone===zone);
    assert(rows[4].textures<=rows[3].textures+2, `${zone}: textures keep growing`);
    assert(rows[4].geometries<=rows[3].geometries+4, `${zone}: geometry keeps growing`);
  }
  assert.deepEqual(errors,[]);
  assert.deepEqual(leaks,[], 'old world still owns uploaded non-shared textures');
  await page.screenshot({path:'/tmp/qish-mobile-resource-smoke.png'});
  console.log(JSON.stringify({result:'PASS',blur,errors,samples}));
  const safari = await context.newPage();
  await safari.addInitScript(() => Object.defineProperty(CanvasRenderingContext2D.prototype,'filter',{configurable:true,get(){return 'none'},set(){}}));
  await safari.goto(GAME);
  await safari.waitForFunction(() => window.__pokelove && !document.querySelector('.startup-loading'), {timeout:120000});
  const fallbackBuild=await safari.evaluate(async () => {
    const {ZONES}=await import('/src/zones/zones.ts');const ow=window.__overworld;
    const start=performance.now();await ow.loadZone(ZONES.labulanjut,'start');await ow.mount();return Math.round(performance.now()-start);
  });
  console.log(JSON.stringify({safariFilterDisabledBuildMs:fallbackBuild}));
} finally {await browser.close();}
