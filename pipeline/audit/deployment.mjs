// Production smoke and deployment diagnostics; GAME_URL, DEV_URL, PW_CORE and AUDIT_OUT are configurable.
const { chromium } = await import(process.env.PW_CORE ?? '/home/durioo/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core/index.mjs');
import { readdir, stat, writeFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
const publicRoot = fileURLToPath(new URL('../../game/public', import.meta.url)).replace(/\/$/, '');
const base = process.env.GAME_URL ?? 'http://localhost:5180';
const devBase = process.env.DEV_URL ?? 'http://localhost:5181';
const out = process.env.AUDIT_OUT ?? 'art/deployment-audit';
await mkdir(out, {recursive:true});
const report = { production: [], assetFailures: [], regressions: {}, externalFailures: [] };
const browser = await chromium.launch({args:['--use-angle=vulkan','--enable-features=Vulkan','--ignore-gpu-blocklist']});
const saved = {cards:[1,2,3,4,5,6,7,8],flags:{introSeen:true,endingSeen:true,clueBowat:true,clueStrips:true,clueFaris:true,bowatJoined:true},vals:{},recordingMode:false,handedOver:[],zone:'bilik'};
async function pageFor(viewport, save = saved) {
  const page = await browser.newPage({viewport});
  const errors = [], warnings = [];
  page.on('pageerror', e=>errors.push(String(e)));
  page.on('console', m=>{if(m.type()==='warning')warnings.push(m.text())});
  page.on('requestfailed', r=>{if(!r.url().startsWith(base))report.externalFailures.push({url:r.url(),error:r.failure()?.errorText})});
  await page.addInitScript(s=>localStorage.setItem('pokelove-save-v1',JSON.stringify(s)), save);
  return {page,errors,warnings};
}
try {
  for (const viewport of [{width:1280,height:720},{width:390,height:844}]) {
    const {page,errors,warnings}=await pageFor(viewport);
    await page.goto(base,{waitUntil:'networkidle'});
    await page.locator('.press').waitFor();
    await page.waitForTimeout(1800);
    const initial=await page.evaluate(()=>{
      const res=performance.getEntriesByType('resource').filter(r=>r.name.startsWith(location.origin));
      const gl=document.createElement('canvas').getContext('webgl2');
      const ext=gl?.getExtension('WEBGL_debug_renderer_info');
      return {requests:res.length,bytes:res.reduce((s,r)=>s+r.encodedBodySize,0),models:res.filter(r=>r.name.endsWith('.glb')).length,modelBytes:res.filter(r=>r.name.endsWith('.glb')).reduce((s,r)=>s+r.encodedBodySize,0),js:res.filter(r=>r.initiatorType==='script'||r.name.endsWith('.js')).map(r=>({name:new URL(r.name).pathname,bytes:r.encodedBodySize})),gpu:ext?gl.getParameter(ext.UNMASKED_RENDERER_WEBGL):null};
    });
    await page.locator('.press').click();
    await page.getByRole('button',{name:/Sambung/}).click();
    await page.locator('#stage canvas').waitFor({timeout:30000});
    await page.locator('.zone-title').waitFor({state:'detached',timeout:15000});
    await page.screenshot({path:`${out}/production-${viewport.width}.png`});
    const zones=[];
    if(viewport.width===1280) {
      for(const zone of ['Labu Lanjut','Bukit Bintang','Lorbel','Lakefront','KLIA','Nyomnyom','Photobooth','Putrajaya','Litar Sepang']) {
        await page.keyboard.press('Backquote');
        const buttons=await page.locator('.dev button').allTextContents();
        const label=buttons.find(b=>b.startsWith('↪')&&b.includes(zone));
        if(!label){zones.push({zone,missingPanelLabel:buttons}); await page.keyboard.press('Backquote');continue}
        await page.locator('.dev button').filter({hasText:label}).click();
        await page.locator('.dev button').filter({hasText:'Tutup'}).click();
        await page.waitForTimeout(1700);
        await page.locator('.zone-title').waitFor({state:'detached',timeout:15000});
        for(let i=0;i<18&&await page.locator('.dialog').count();i++){await page.keyboard.press('Space');await page.waitForTimeout(100)}
        console.log('Zone smoke:',zone);
        zones.push({zone,canvas:await page.locator('#stage canvas').count(),label:await page.locator('.zone-label').innerText()});
      }
    }
    report.production.push({viewport,initial,zones,errors,warnings});
    console.log('Production viewport done',viewport.width,initial);
    await page.close();
  }
  const {page,errors}=await pageFor({width:1280,height:720},{cards:null,flags:null});
  await page.goto(base,{waitUntil:'networkidle'});
  await page.waitForTimeout(1500);
  await page.locator('.press').click(); await page.waitForTimeout(600);
  report.regressions.malformedSave={errors,menuVisible:await page.locator('.title-menu').count()};
  await page.close();
  const dev=await browser.newPage({viewport:{width:1280,height:720}});
  await dev.goto(devBase,{waitUntil:'networkidle'});
  await dev.evaluate(async()=>{
    Object.defineProperty(navigator,'mediaDevices',{value:{getUserMedia:()=>new Promise(()=>{})},configurable:true});
    const {blowCandles}=await import('/src/ending/cake.ts');
    const root=document.createElement('div'); root.style.cssText='position:fixed;inset:0;z-index:99999';document.body.append(root);
    window.__auditCakeDone=false; void blowCandles(root,1).then(()=>window.__auditCakeDone=true);
  });
  await dev.locator('.cake-scene').waitFor();
  await dev.keyboard.down('Space');await dev.waitForTimeout(3500);await dev.keyboard.up('Space');
  report.regressions.pendingMic=await dev.evaluate(()=>({done:window.__auditCakeDone,meterHidden:document.querySelector('.cake-meter')?.hidden}));
  await dev.close();
  const client=await browser.newContext();
  // Compare production responses with the runtime exports; raw sources are unnecessary.
  const assets=[];
  async function walk(dir){for(const item of await readdir(dir,{withFileTypes:true})){const path=`${dir}/${item.name}`;if(item.isDirectory())await walk(path);else assets.push(path)}}
  await walk(publicRoot);
  let next=0;
  await Promise.all(Array.from({length:8},async()=>{while(next<assets.length){const path=assets[next++];const res=await client.request.get(base+path.slice(publicRoot.length));const body=await res.body();if(res.status()!==200||body.length!==(await stat(path)).size)report.assetFailures.push({path,status:res.status(),length:body.length})}}));
  report.assetsChecked=assets.length;
} finally {
  report.normalFlowPassed = report.production.length === 2 && report.production.every(p => p.errors.length === 0) && report.production[0].zones.length === 9 && report.production[0].zones.every(z => z.canvas === 1) && report.assetsChecked > 0 && report.assetFailures.length === 0;
  if (!report.normalFlowPassed) process.exitCode = 1;
  await writeFile(`${out}/verification.json`,JSON.stringify(report,null,2));
  console.log(JSON.stringify(report));
  await browser.close();
}
