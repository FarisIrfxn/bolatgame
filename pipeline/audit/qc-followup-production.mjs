import assert from 'node:assert/strict';
import { readFile,writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
const {chromium}=await import(process.env.PW_CORE??'/home/durioo/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core/index.mjs');
const out=process.argv[2]??'art/ending-qc-2026-10-27/qa';
const browser=await chromium.launch({args:['--use-angle=vulkan','--enable-features=Vulkan','--ignore-gpu-blocklist']});
const report={assets:[],errors:[]};
try{
 const page=await browser.newPage({viewport:{width:1280,height:720}});
 page.on('pageerror',e=>report.errors.push(String(e)));
 await page.goto('http://localhost:5180/',{waitUntil:'networkidle'});
 await page.locator('.press').waitFor();await page.screenshot({path:`${out}/production-title.png`});
 for(const name of ['memory-friends.webp','couple-comic.webp','ensemble-comic.webp','candle.png']){
  const response=await page.request.get(`http://localhost:5180/assets/ending/${name}`);assert.equal(response.status(),200);
  const served=await response.body(),disk=await readFile(`game/public/assets/ending/${name}`);
  assert(served.equals(disk),`${name}: production matches reviewed export`);
  report.assets.push({name,bytes:disk.length,sha256:createHash('sha256').update(disk).digest('hex')});
 }
 await page.close();
 // Check first-unlock recording mode through the live dev component.
 const dev=await browser.newPage({viewport:{width:1280,height:720}});
 dev.on('pageerror',e=>report.errors.push(String(e)));
 await dev.addInitScript(()=>localStorage.setItem('pokelove-save-v1',JSON.stringify({cards:[],flags:{introSeen:true},vals:{},recordingMode:true,handedOver:[],zone:'bilik'})));
 await dev.goto('http://localhost:5181/',{waitUntil:'networkidle'});
 await dev.evaluate(async()=>{const {revealCard}=await import('/src/ui/cardReveal.ts');void revealCard(5)});
 await dev.locator('.reveal .caption .hint').waitFor();
 assert.equal(await dev.locator('.reveal .ask').count(),0,'No physical-card request even in recording mode');
 assert(!(await dev.locator('.reveal').innerText()).includes('Minta kad betul'));
 await dev.screenshot({path:`${out}/card-reveal-no-request.png`});
 await dev.keyboard.press('Space');await dev.locator('.reveal').waitFor({state:'detached'});
 report.recordingRevealWithoutRequest=true;
 assert.equal(report.errors.length,0,report.errors.join('\n'));
 await writeFile(`${out}/production-verification.json`,JSON.stringify(report,null,2));console.log('Production assets, title and first-unlock recording reveal passed');
}finally{await browser.close()}
