// World QC minigames: real landing, full planes, continuous background, painted runner.
import assert from 'node:assert/strict';
import {writeFile} from 'node:fs/promises';
import{openZone}from './lib.mjs';
const results=[];
for(const boss of['bowat','blep','bolatex','qishex']){
 const{browser,page,errors}=await openZone('labulanjut',{width:1280,height:720,save:{cards:[1,2,3,4,5,6,7,8],flags:{introSeen:true,endingSeen:true}}});
 await page.evaluate(boss=>{void window.__pokelove.playBoss(boss,{zone:'labulanjut',spawn:'start'});},boss);
 await page.locator('.mg-go').waitFor();await page.locator('.mg-go').click();await page.waitForTimeout(2200);
 if(boss==='qishex')await page.waitForFunction(()=>window.__qishRunner?.().ready);
 else await page.waitForFunction(()=>window.__pokelove.activeMinigameScene()?.sys.isActive());
 await page.screenshot({path:`/mnt/storage/qish/art/style/world-qc/boss-${boss}.png`});
 if(boss==='bowat'){
  const landed=await page.evaluate(async()=>{
   const s=window.__pokelove.activeMinigameScene();s.started=false;s.player.body.reset(300,285);s.player.body.setVelocity(0,0);
   await new Promise(r=>setTimeout(r,1300));
   const platform=s.platforms.getChildren()[1];const awning=s.children.list.find(o=>o.texture?.key==='art_awning');
   return{feet:s.player.body.bottom,platformTop:platform.body.top,artY:awning.y,onGround:s.player.body.touching.down||s.player.body.blocked.down};
  });
  assert(landed.onGround);assert(Math.abs(landed.feet-landed.platformTop)<1);results.push({boss,...landed});
  await page.screenshot({path:'/mnt/storage/qish/art/style/world-qc/boss-bowat-landed.png'});
 }
 if(boss==='blep'){
  const bounds=await page.evaluate(()=>{const s=window.__pokelove.activeMinigameScene();return{boss:s.boss.getBounds(),ship:s.ship.getBounds()};});
  for(const k of['boss','ship'])assert(bounds[k].y>=0&&bounds[k].y+bounds[k].height<=720,`${k} fully on screen`);
  results.push({boss,bounds});
 }
 await page.setViewportSize({width:390,height:844});await page.waitForTimeout(600);await page.screenshot({path:`/mnt/storage/qish/art/style/world-qc/boss-${boss}-phone.png`});
 results.push({boss,loaded:true,phone:true});
 assert.equal(errors.length,0,errors.join('\n'));await browser.close();console.log(boss,'passed');
}
await writeFile('/mnt/storage/qish/art/style/world-qc/boss-verification.json',JSON.stringify(results,null,2));
