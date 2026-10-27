// Companion to mobile-landscape.mjs: real dream, exercise and complete ending.
import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
const {chromium}=await import(process.env.PW_CORE??'/home/durioo/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core/index.mjs');
const out=process.env.AUDIT_OUT??'art/mobile-landscape-2026-10-27';await mkdir(out,{recursive:true});
const browser=await chromium.launch({args:['--use-angle=vulkan','--enable-features=Vulkan','--ignore-gpu-blocklist']});
const report={layouts:[],errors:[]};let p;
const endingOnly=process.argv.includes('--ending-only');
async function resize(w,h){await p.setViewportSize({width:w,height:h});await p.waitForTimeout(100)}
async function layout(name,selectors){
  if(endingOnly&&name!=='actual-ending')return;
  await resize(1280,720);
  const measure=()=>p.evaluate(selectors=>{const v=document.querySelector('#game-viewport'),r=v.getBoundingClientRect(),scale=r.width/v.clientWidth;return selectors.map(selector=>{const n=document.querySelector(selector),b=n.getBoundingClientRect();return{selector,x:(b.x-r.x)/scale,y:(b.y-r.y)/scale,w:b.width/scale,h:b.height/scale,overflow:!n.matches('.letter-shell,.ending-message')&&n.scrollWidth>n.clientWidth+1}})},selectors);
  const baseline=await measure();
  for(const [w,h]of[[1280,720],[844,390],[667,375],[568,320],[932,430],[740,280]]){
    await resize(w,h);const values=await measure();
    for(let i=0;i<values.length;i++){
      const b=values[i];for(const k of ['x','y','w','h'])assert(Math.abs(b[k]-baseline[i][k])<.15,`${name} ${w} ${b.selector}.${k}`);
      assert(!b.overflow,`${name} text overflows ${b.selector}`);
      assert(b.x>=-.15&&b.y>=-.15&&b.x+b.w<=1280.2&&b.y+b.h<=720.2,`${name} ${b.selector} clipped: ${JSON.stringify(b)}`);
    }
    if([1280,844,568].includes(w))await p.screenshot({path:`${out}/${name}-${w}.png`});
  }
  report.layouts.push({name,landscapeSizes:6,sameAsDesktop:true});console.log(name,'passed');await resize(844,390);
}
async function advanceUntil(selector,limit=160){for(let i=0;i<limit&&!await p.locator(selector).count();i++){await p.keyboard.press('Enter');await p.waitForTimeout(100)}await p.locator(selector).first().waitFor()}
try{
 p=await browser.newPage({viewport:{width:844,height:390},hasTouch:true,isMobile:true});p.on('pageerror',e=>report.errors.push(String(e)));
 await p.emulateMedia({reducedMotion:'reduce'});
 await p.addInitScript(()=>{
  localStorage.setItem('pokelove-save-v1',JSON.stringify({cards:[1,2,3,4,5,6,7,8],flags:{introSeen:true,endingSeen:true,clueBowat:true,clueStrips:true,clueFaris:true},vals:{},recordingMode:false,handedOver:[],zone:'bilik'}));
  Object.defineProperty(navigator.mediaDevices,'getUserMedia',{value:()=>new Promise(()=>{})});
 });
 await p.goto(process.env.GAME_URL??'http://127.0.0.1:5181',{waitUntil:'domcontentloaded'});await p.locator('.press').waitFor({timeout:60000});
 await p.locator('.press').tap();await p.getByRole('button',{name:/Sambung/}).tap();await p.locator('.hud:visible').waitFor();await p.waitForTimeout(4300);
 for(let i=0;i<40&&await p.locator('.dialog').count();i++){await p.keyboard.press('Enter');await p.waitForTimeout(100)}
 if(!endingOnly){
 // Putrajaya HUD and the real exercise panel, with actual tap-to-complete.
 await p.evaluate(async()=>{const {setWorkout}=await import('/src/ui/hud.ts');setWorkout({kg:'84.0',progress:1/3,buddy:true});const {repMeter}=await import('/src/ui/reps.ts');void repMeter('Senaman',3,()=>{})});
 await layout('exercise',['.workout-hud','.rep-panel']);
 for(let i=0;i<3;i++){await p.locator('.rep-panel').tap();await p.waitForTimeout(100)}await p.locator('.rep-panel').waitFor({state:'detached'});
 // The actual opening cinematic and seated cry art; no alternate preview markup.
 await p.keyboard.press('Backquote');await p.getByRole('button',{name:/Intro \(mimpi sofa\)/}).click();await p.getByRole('button',{name:'Tutup',exact:true}).click();
 await p.locator('.dream-scene').waitFor();await p.locator('.dialog').waitFor();await p.waitForTimeout(300);
 await layout('dream',['.dream-scene','.dream-tag','.dialog']);
 await advanceUntil('.dream.crying .tears');
 await p.waitForTimeout(950); // Hold at the next real line, after the 900ms cry act.
 const tears=await p.evaluate(()=>{
  const scene=document.querySelector('.dream-scene'),q=scene.querySelector('.d-qish'),s=scene.getBoundingClientRect(),r=q.getBoundingClientRect(),side=Math.min(r.width,r.height);
  return [...scene.querySelectorAll('.tears')].map((n,i)=>{const b=n.getBoundingClientRect();return{dx:Math.abs(b.x-(r.x+(r.width-side)/2+[.52,.74][i]*side)),dy:Math.abs(b.y-(r.y+(r.height-side)/2+[.42,.4][i]*side))}});
 });
 assert.equal(tears.length,2);assert(tears.every(t=>t.dx<2&&t.dy<2),'Cry tears follow the scaled eyes');
 await layout('dream-cry',['.dream-scene']);report.cryTears=tears;
 // Finish the dream through its real dialogue and wake transition.
 for(let i=0;i<160&&await p.locator('.dream').count();i++){await p.keyboard.press('Enter');await p.waitForTimeout(100)}
 await p.waitForTimeout(3500);for(let i=0;i<30&&await p.locator('.dialog').count();i++){await p.keyboard.press('Enter');await p.waitForTimeout(100)}
 }
 await p.evaluate(()=>{window.__endingFinished=false;window.__pokelove.overworld.lock();void window.__pokelove.playEnding().then(()=>window.__endingFinished=true)});
 await advanceUntil('.cake-scene');await layout('cake',['.cake-scene canvas','.cake-hint']);
 assert.equal(await p.locator('.cake-meter:visible').count(),0,'Pending mic still permits touch');
 const r=await p.locator('.cake-scene canvas').boundingBox();const cdp=await p.context().newCDPSession(p);
 await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:r.x+r.width/2,y:r.y+r.height*.5}]});
 await p.locator('.bday-banner').waitFor({timeout:10000});await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
 await layout('birthday',['.bday-banner']);await p.waitForTimeout(1900);await p.keyboard.press('Enter');await p.locator('.kisah').waitFor();
 await p.waitForTimeout(1800);await layout('memory-story',['.kisah-slide','.kisah-cap']);
 await advanceUntil('.letter-next');await p.keyboard.press('Enter');await p.waitForTimeout(350);
 await layout('letter',['.letter-shell','.letter','.letter-next']);
 await p.locator('.letter-next').tap();await p.locator('.card9').waitFor();await p.waitForTimeout(3700);
 await layout('ninth-card',['.card-wrap','.caption']);await p.keyboard.press('Enter');await p.locator('.ending-continue').waitFor();
 await layout('actual-ending',['.ending-message','.ending-continue']);await p.locator('.ending-continue').tap();await p.waitForFunction(()=>window.__endingFinished);
 assert.equal(await p.locator('.ending').count(),0);assert(await p.evaluate(()=>window.__pokelove.save.flag('endingSeen')));
 assert.deepEqual(report.errors,[]);report.touchCake=true;if(!endingOnly)report.exerciseTaps=true;report.actualEndingCompleted=true;
 await writeFile(`${out}/${endingOnly?'ending-flow':'story'}-verification.json`,JSON.stringify(report,null,2));console.log(endingOnly?'Complete ending and final continue passed':'Real dream, exercise, touch cake and complete ending passed');
}catch(error){await p?.screenshot({path:`${out}/story-failure.png`}).catch(()=>{});await writeFile(`${out}/story-failure.json`,JSON.stringify({error:String(error),...report},null,2));throw error}finally{await browser.close()}
