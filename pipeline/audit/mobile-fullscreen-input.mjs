// Physical touch targets, interrupted gestures, safe areas and the mobile GPU budget.
import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
const {chromium}=await import(process.env.PW_CORE??'/home/durioo/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core/index.mjs');
const out='art/mobile-fullscreen-2026-10-27/qa';await mkdir(out,{recursive:true});
const browser=await chromium.launch({args:['--use-angle=vulkan','--enable-features=Vulkan','--ignore-gpu-blocklist']});
const report={errors:[]};let p;
try{
 p=await browser.newPage({viewport:{width:844,height:390},hasTouch:true,isMobile:true,deviceScaleFactor:3});
 p.on('pageerror',e=>report.errors.push(String(e)));
 await p.addInitScript(()=>localStorage.setItem('pokelove-save-v1',JSON.stringify({cards:[1,2,3,4,5,6,7,8],flags:{introSeen:true,endingSeen:true},vals:{},recordingMode:false,handedOver:[],zone:'bilik'})));
 await p.goto(process.env.GAME_URL??'http://127.0.0.1:5181',{waitUntil:'domcontentloaded'});await p.locator('.press').waitFor({timeout:60000});
 await p.locator('.press').tap();await p.getByRole('button',{name:/Sambung/}).tap();await p.locator('.hud:visible').waitFor();await p.waitForTimeout(4300);
 for(let i=0;i<20&&await p.locator('.dialog').count();i++){await p.keyboard.press('Enter');await p.waitForTimeout(100)}
 await p.evaluate(()=>{window.__pokelove.overworld.lock();window.__pokelove.input.lastDevice='touch'});await p.waitForTimeout(100);
 const read=()=>p.evaluate(()=>({axis:window.__pokelove.input.axis(),a:window.__pokelove.input.down('a'),b:window.__pokelove.input.down('b')}));
 const cdp=await p.context().newCDPSession(p);
 const gesture=async()=>{
  const stick=await p.locator('.touch .stick').boundingBox(),button=await p.locator('.touch .btn-a').boundingBox();
  assert(stick&&button);assert(button.width>=44&&button.height>=44);
  await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{id:1,x:stick.x+stick.width*.85,y:stick.y+stick.height/2},{id:2,x:button.x+button.width/2,y:button.y+button.height/2}]});
  await p.waitForTimeout(100);const state=await read();assert(state.axis.x>.5&&state.a,'Joystick + A work simultaneously');
 };
 const released=async()=>{await p.waitForTimeout(100);const state=await read();assert.deepEqual(state.axis,{x:0,y:0});assert.equal(state.a,false);assert.equal(state.b,false);assert.equal(await p.locator('.touch .on').count(),0);assert.equal(await p.locator('.knob').evaluate(n=>n.style.transform),'')};
 await gesture();await cdp.send('Input.dispatchTouchEvent',{type:'touchCancel',touchPoints:[]});await released();report.pointerCancel=true;
 await gesture();await p.setViewportSize({width:390,height:844});await released();await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});report.rotateClearsHeldInput=true;
 await p.setViewportSize({width:844,height:390});await p.waitForTimeout(100);
 await gesture();await p.evaluate(()=>window.dispatchEvent(new Event('blur')));await released();await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});report.blurClearsHeldInput=true;
 await gesture();await p.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,value:true});document.dispatchEvent(new Event('visibilitychange'))});await released();
 await p.evaluate(()=>{delete document.hidden;document.dispatchEvent(new Event('visibilitychange'))});await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});report.appSwitchClearsHeldInput=true;
 await p.evaluate(async()=>{const {setCollect}=await import('/src/ui/hud.ts');setCollect({icon:'/assets/storybook/item_cookie.png',name:'Cookies Bowat',got:3,need:6});document.querySelector('#safe-area-probe').style.padding='12px 34px 21px 52px';window.dispatchEvent(new Event('resize'))});
 await p.waitForTimeout(250);
 const root=await p.locator('#game-viewport').boundingBox();assert(Math.abs(root.x)<.1&&Math.abs(root.width-844)<.1&&Math.abs(root.height-390)<.1);
 const location=await p.locator('.zone-label').boundingBox(),hud=await p.locator('.hud').boundingBox(),objective=await p.locator('.collect-hud:not(.workout-hud):visible').boundingBox();
 assert(location.x>=52&&location.y>=12);assert(hud.x>=52&&hud.y>=12);assert(objective.x+objective.width<=844-34+.2&&objective.y>=12);
 await p.screenshot({path:`out/notch-world.png`.replace('out/',`${out}/`),scale:'css'});
 report.safeArea={left:52,right:34,top:12,bottom:21,backgroundStillFullBleed:true,hudProtected:true};
 report.gpu=await p.evaluate(()=>{const w=window.__pokelove.overworld;return{canvas:[w.renderer.domElement.width,w.renderer.domElement.height],shadow:w.sun.shadow.mapSize.toArray(),dpr:devicePixelRatio,drawCalls:w.renderer.info.render.calls}});
 assert(report.gpu.canvas[0]<=Math.ceil(844*1.5)+1&&report.gpu.canvas[1]<=Math.ceil(390*1.5)+1);assert.deepEqual(report.gpu.shadow,[1024,1024]);
 // The complete arena is fitted inside safe insets, while the panorama fills outside them.
 await p.evaluate(()=>{void window.__pokelove.playBoss('bolatex',{zone:'bilik',spawn:'start'})});await p.locator('.mg-intro').waitFor();await p.locator('.mg-go').tap();await p.locator('.mg-intro').waitFor({state:'detached'});await p.waitForTimeout(100);
 const arena=await p.locator('.storybook-host canvas').boundingBox();assert(arena.x>=52&&arena.y>=12&&arena.x+arena.width<=844-34+.1&&arena.y+arena.height<=390-21+.1);
 await p.touchscreen.tap(arena.x+433/1280*arena.width,arena.y+202/720*arena.height);await p.waitForTimeout(100);assert(await p.evaluate(()=>window.__pokelove.activeMinigameScene().cards[0].open));
 await p.screenshot({path:`${out}/notch-memory.png`,scale:'css'});report.notchedMemoryTouch=true;
 // Long dialogue may scroll if a page was already displayed before rotation.
 await p.keyboard.press('Backquote');await p.getByRole('button',{name:/Menang boss sekarang/}).click();await p.getByRole('button',{name:'Tutup',exact:true}).click();
 for(let i=0;i<80&&await p.locator('.storybook-host').count();i++){await p.keyboard.press('Enter');await p.waitForTimeout(100)}
 await p.evaluate(()=>{document.querySelector('#safe-area-probe').style.padding='';window.dispatchEvent(new Event('resize'));window.__longDone=false;void window.__pokelove.say([{who:'qish',text:'Awak sentiasa ada dalam hati saya. '.repeat(24)}]).then(()=>window.__longDone=true)});
 await p.locator('.dialog').waitFor();await p.locator('.dialog .box').click();await p.waitForTimeout(100);await p.setViewportSize({width:320,height:568});await p.waitForTimeout(100);
 const before=await p.locator('.dialog .text').innerText();assert(before.length>0);assert.equal(await p.locator('.dialog .text').evaluate(n=>getComputedStyle(n).overflowY),'auto');
 const r=await p.locator('.dialog .text').boundingBox();
 await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{id:1,x:r.x+r.width/2,y:r.y+r.height*.85}]});
 for(let i=0;i<6;i++){await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{id:1,x:r.x+r.width/2,y:r.y+r.height*(.85-i*.1)}]});await p.waitForTimeout(20)}
 await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await p.waitForTimeout(150);
 assert((await p.locator('.dialog .text').evaluate(n=>n.scrollTop))>0,'Dialogue actually scrolls with a finger');
 assert.equal(await p.locator('.dialog .text').innerText(),before,'Scrolling does not confirm or skip dialogue');assert.equal(await p.evaluate(()=>window.__longDone),false);report.dialogueRotationScroll=true;
 assert.deepEqual(report.errors,[]);await writeFile(`${out}/input-verification.json`,JSON.stringify(report,null,2));console.log('Multitouch, cancelled gestures, app switch, notch, GPU cap and rotated dialogue passed');
}catch(error){await p?.screenshot({path:`${out}/input-failure.png`}).catch(()=>{});await writeFile(`${out}/input-failure.json`,JSON.stringify({error:String(error),...report},null,2));throw error}finally{await browser.close()}
