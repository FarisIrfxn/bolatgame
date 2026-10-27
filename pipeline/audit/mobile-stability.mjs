// Touch Chromium smoke test for all worlds and all bosses. iPhone Safari still
// needs a physical-device run; this catches missing art and transition errors.
import assert from 'node:assert/strict';
import {mkdir, writeFile} from 'node:fs/promises';
const {chromium}=await import(process.env.PW_CORE??'/home/durioo/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core/index.mjs');
const out=process.env.AUDIT_OUT??'/tmp/qish-mobile-stability';await mkdir(out,{recursive:true});
const browser=await chromium.launch({args:['--use-angle=vulkan','--enable-features=Vulkan','--ignore-gpu-blocklist']});
const report={worlds:[],bosses:[],errors:[]};
const worlds=['bilik','labulanjut','sunway','galeri','dusun','angkasa','cosyplace','photobooth','bukit','sepang'];
const bosses=['bowat','bolat','snorlax','blep','megabowat','bolatex','qishex','finale'];
const selectedWorlds=process.env.AUDIT_WORLDS?.split(',')??worlds;
const selectedBosses=process.env.AUDIT_BOSSES?.split(',')??bosses;
try{
  for(const [layout,width,height] of [['landscape',844,390],['portrait',390,844]]){
    const context=await browser.newContext({viewport:{width,height},hasTouch:true,deviceScaleFactor:3});
    const page=await context.newPage();
    page.on('pageerror',e=>report.errors.push(`${layout}: ${e.stack}`));
    page.on('console',m=>{if(m.type()==='error')report.errors.push(`${layout}: ${m.text()}`)});
    await page.goto(process.env.GAME_URL??'http://127.0.0.1:5181/');
    await page.waitForFunction(()=>window.__pokelove&&!document.querySelector('.startup-loading'),null,{timeout:120000});
    await page.evaluate(()=>{const s=window.__pokelove.save;s.data.cards=[];s.data.flags={introSeen:true,bbSpray:true};});
    for(const id of selectedWorlds){
      const state=await page.evaluate(async id=>{
        const p=window.__pokelove;await p.loadZone(id,'start');
        await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));
        const w=p.overworld,r=w.renderer;
        return {id,zone:w.currentZone,models:w.modelState(),textures:r.info.memory.textures,geometries:r.info.memory.geometries,canvas:[r.domElement.width,r.domElement.height]};
      },id);
      assert.equal(state.zone,id);report.worlds.push({layout,...state});console.log(layout,'world',id,state.textures);
      if(id==='sunway'){
        await page.evaluate(()=>window.__pokelove.overworld.placePlayer(0,25.5,'back'));
        await page.waitForTimeout(400);
        await page.screenshot({path:`${out}/bintang-${layout}.png`});
      }
    }
    await page.close();
    for(const boss of selectedBosses){
      const p=await context.newPage();
      p.on('pageerror',e=>report.errors.push(`${layout}/${boss}: ${e.stack}`));
      p.on('console',m=>{if(m.type()==='error')report.errors.push(`${layout}/${boss}: ${m.text()}`)});
      await p.goto(process.env.GAME_URL??'http://127.0.0.1:5181/');
      await p.waitForFunction(()=>window.__pokelove&&!document.querySelector('.startup-loading'),null,{timeout:120000});
      await p.evaluate(()=>{
        const a=window.__pokelove;
        a.save.data.cards=[];a.save.data.flags={introSeen:true,bbSpray:true,bbArrived:true};
        a.save.data.zone='sunway';a.save.write();
      });
      await p.locator('.title-screen').click();
      await p.locator('.tm-btn').first().click();
      await p.waitForFunction(()=>window.__pokelove.overworld.currentZone==='sunway'&&document.querySelector('.prompt-bubble'),null,{timeout:30000});
      await p.evaluate(boss=>void window.__pokelove.playBoss(boss,{zone:'sunway',spawn:'start'}),boss);
      await p.locator('.mg-go').waitFor({timeout:30000});
      await p.locator('.mg-go').click();
      if(boss==='qishex')await p.waitForFunction(()=>window.__qishRunner?.().ready,null,{timeout:30000});
      else await p.waitForFunction(()=>window.__pokelove.activeMinigameScene()?.sys.isActive(),null,{timeout:30000});
      await p.waitForTimeout(350);
      const state=await p.evaluate(boss=>{
        const scene=window.__pokelove.activeMinigameScene();
        const log=JSON.parse(localStorage.getItem('qish-diagnostics-v1')||'[]');
        return {boss,backend:scene?.game.renderer.type??'custom',art:scene?.textures.getTextureKeys().filter(k=>k.startsWith('art_'))??[],lastEvents:log.slice(-4).map(x=>x.event)};
      },boss);
      report.bosses.push({layout,...state});console.log(layout,'boss',boss,state.backend,state.art.length);
      if(boss==='bolat')await p.screenshot({path:`${out}/bolat-${layout}.png`});
      if(boss==='bolat'){
        await p.evaluate(()=>window.__pokelove.activeMinigameScene().forceWin());
        await p.locator('.dialog').waitFor({timeout:10000});
        for(let i=0;i<24;i++){
          if(await p.evaluate(()=>window.__pokelove.overworld.currentZone==='sunway'&&!!document.querySelector('.prompt-bubble')))break;
          await p.keyboard.press('Enter');await p.waitForTimeout(250);
        }
        await p.waitForFunction(()=>window.__pokelove.overworld.currentZone==='sunway'&&document.querySelector('.prompt-bubble'),null,{timeout:30000});
        report.bosses.at(-1).returnedToCity=true;
      }
      await p.close();
    }
    await context.close();
  }
  await writeFile(`${out}/report.json`,JSON.stringify(report,null,2));
  assert.deepEqual(report.errors,[]);
}finally{await browser.close()}
