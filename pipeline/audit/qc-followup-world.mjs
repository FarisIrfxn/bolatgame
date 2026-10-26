import assert from 'node:assert/strict';
import { mkdir,writeFile } from 'node:fs/promises';
import { openZone,teleport } from './lib.mjs';
const out='art/ending-qc-2026-10-27/qa';await mkdir(out,{recursive:true});
const report=[];
for(const zone of ['sunway','cosyplace','bukit']){
 const {browser,page,errors}=await openZone(zone,{width:1280,height:720,save:{cards:[1,2,3,4,5,6,7,8],flags:{introSeen:true,endingSeen:true}}});
 try{
  if(zone==='sunway'){
   await teleport(page,33.8,20.7);
   const markers=await page.evaluate(()=>{const out=[];window.__overworld.zoneRoot.traverse(o=>{if(o.userData.discovery)out.push({kind:o.userData.discovery,x:o.position.x,y:o.position.y,z:o.position.z})});return out});
   assert(markers.some(m=>m.kind==='map'&&m.y<2.4));
   await page.screenshot({path:`${out}/bukit-bintang-myvi.png`});report.push({zone,markers});
  }
  if(zone==='cosyplace'){
   const shop=await page.evaluate(async()=>{const {SHOPS}=await import('/src/zones/nyomShops.ts');return SHOPS.find(s=>s.kind==='cookies')});
   await teleport(page,...shop.vendor);
   await page.screenshot({path:`${out}/cookies-banner.png`});report.push({zone,cookieShop:shop});
  }
  if(zone==='bukit'){
   await page.evaluate(()=>{void window.__pokelove.playBoss('qishex',{zone:'bukit',spawn:'start'})});
   await page.locator('.mg-go').click();await page.waitForFunction(()=>window.__qishRunner?.().ready);
   await page.waitForTimeout(6200);await page.screenshot({path:`${out}/runner-lowered-signs.png`});
   assert(await page.evaluate(()=>window.__qishRunner().words.length)>0);
   const music=await page.evaluate(()=>window.__pokelove.music.state());assert(music.level<=.2);report.push({zone,music});
  }
  assert.equal(errors.length,0,errors.join('\n'));console.log(zone,'world follow-up passed');
 }finally{await browser.close()}
}
await writeFile(`${out}/world-verification.json`,JSON.stringify(report,null,2));
