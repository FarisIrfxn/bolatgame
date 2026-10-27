// Compare the promenade framing after removing the photo camera.
import {mkdir} from 'node:fs/promises';
const {chromium}=await import(process.env.PW_CORE??'/home/durioo/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core/index.mjs');
const out=process.env.AUDIT_OUT??'/tmp/qish-bb-camera';await mkdir(out,{recursive:true});
const browser=await chromium.launch({args:['--use-angle=vulkan','--enable-features=Vulkan','--ignore-gpu-blocklist']});
try{
 const page=await browser.newPage({viewport:{width:844,height:390},hasTouch:true,deviceScaleFactor:3});
 await page.goto(process.env.GAME_URL??'http://127.0.0.1:5181/');
 await page.waitForFunction(()=>window.__pokelove&&!document.querySelector('.startup-loading'),null,{timeout:120000});
 await page.evaluate(async()=>{const p=window.__pokelove;p.save.data.cards=[];p.save.data.flags={introSeen:true,bbSpray:true};await p.loadZone('sunway','start')});
 for(const cap of [28.6,24,22,20]){
  await page.evaluate(cap=>{const w=window.__pokelove.overworld;w.zone.cam[3]=cap;w.placePlayer(0,25.5,'back')},cap);
  await page.waitForTimeout(1200);
  await page.screenshot({path:`${out}/cap-${cap}.png`});console.log('cap',cap);
 }
 await page.evaluate(()=>window.__pokelove.overworld.placePlayer(0,26.5,'back'));
 await page.waitForTimeout(900);
 await page.screenshot({path:`${out}/cap-20-edge.png`});
}finally{await browser.close()}
