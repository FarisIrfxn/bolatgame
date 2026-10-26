// QC2 boss checks: manual Blep input, complete static kitchen, runner label variety/grounding.
import assert from 'node:assert/strict';
import {writeFile} from 'node:fs/promises';
import{openZone}from'./lib.mjs';
const out='art/style/world-qc-v2',report=[];
for(const boss of ['blep','megabowat','qishex']){
 const{browser,page,errors}=await openZone('labulanjut',{width:1280,height:720,save:{cards:[1,2,3,4,5,6,7,8],flags:{introSeen:true,endingSeen:true}}});
 try{
  await page.evaluate(b=>{void window.__pokelove.playBoss(b,{zone:'labulanjut',spawn:'start'});},boss);await page.locator('.mg-go').click();
  if(boss==='qishex')await page.waitForFunction(()=>window.__qishRunner?.().ready);
  else await page.waitForFunction(()=>window.__pokelove.activeMinigameScene()?.sys.isActive());
  await page.waitForTimeout(500);
  if(boss==='blep'){
   await page.evaluate(()=>{const s=window.__pokelove.activeMinigameScene();s.charge=0;window.__shots=0;const create=s.hearts.create;s.hearts.create=function(...args){window.__shots++;return create.apply(this,args);};});
   await page.waitForTimeout(750);assert.equal(await page.evaluate(()=>window.__shots),0,'No auto fire while idle');
   await page.keyboard.press('Space');await page.waitForTimeout(70);assert.equal(await page.evaluate(()=>window.__shots),1,'A fires one heart');
   await page.waitForTimeout(80);await page.keyboard.down('Space');await page.waitForTimeout(600);await page.keyboard.up('Space');
   assert.equal(await page.evaluate(()=>window.__shots),2,'Holding A does not auto repeat');
   await page.evaluate(()=>{window.__pokelove.activeMinigameScene().charge=1;});await page.keyboard.press('Space');await page.waitForTimeout(80);
   assert.equal(await page.evaluate(()=>window.__shots),2,'Charged A releases blast instead of a heart');
   assert(await page.evaluate(()=>window.__pokelove.activeMinigameScene().charge)<.1,'Blast consumes charge');
   await page.screenshot({path:`${out}/blep-manual.png`});
   // Aim with the same directional keys a player uses and defeat the boss using only A shots/blasts.
   for(let i=0;i<110;i++){
    const state=await page.evaluate(()=>{const s=window.__pokelove.activeMinigameScene();return s&&{done:s.done,ship:s.ship.x,t:s.bossT,hp:s.bossHp};});
    if(!state||state.done)break;
    const goal=640+Math.sin((state.t+.33)*.7)*380,dx=goal-state.ship;
    if(Math.abs(dx)>12){const key=dx>0?'ArrowRight':'ArrowLeft';await page.keyboard.down(key);await page.waitForTimeout(Math.min(150,Math.abs(dx)/560*1000));await page.keyboard.up(key);}
    await page.keyboard.press('Space');await page.waitForTimeout(145);
   }
   const hp=await page.evaluate(()=>window.__pokelove.activeMinigameScene()?.bossHp??0);assert.equal(hp,0,'Blep beatable with manual fire');
   report.push({boss,idleShots:0,singlePress:1,holdDoesNotRepeat:true,chargedBlast:true,wonWithManualInput:true});
  }
  if(boss==='megabowat'){
   const count=await page.evaluate(()=>window.__pokelove.activeMinigameScene().children.list.filter(o=>o.type==='TileSprite').length);assert.equal(count,0,'Kitchen is a complete illustration, not a wrapping tile');
   await page.keyboard.press('Space');await page.waitForTimeout(300);await page.screenshot({path:`${out}/megabowat-complete.png`});report.push({boss,wrappingBackgrounds:count});
  }
  if(boss==='qishex'){
   // Observe actual spawned labels across enough spawns to check each word is preserved on a board.
   const seen=new Set();for(let i=0;i<9;i++){await page.waitForTimeout(2100);const s=await page.evaluate(()=>window.__qishRunner());for(const w of s.words)seen.add(w.label);}
   assert(seen.size>=2,'Runner has varied taunts');assert([...seen].every(s=>['GEMOK!','BOLAT!','EMOK!','80 KG!','FAT ASS!'].includes(s)));
   await page.screenshot({path:`${out}/runner-taunts.png`});report.push({boss,labels:[...seen]});
  }
  assert.equal(errors.length,0,errors.join('\n'));console.log(boss,'QC2 passed');
 }finally{await browser.close();}
}
await writeFile(`${out}/boss-verification.json`,JSON.stringify(report,null,2));
