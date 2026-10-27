// Production smoke check through player UI + the existing recording panel.
import assert from 'node:assert/strict';
import {readFile,writeFile} from 'node:fs/promises';
const {chromium}=await import(process.env.PW_CORE??'/home/durioo/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core/index.mjs');
const base=process.env.PRODUCTION_URL??'http://127.0.0.1:5180';
const out='art/mobile-landscape-2026-10-27';
const browser=await chromium.launch({args:['--use-angle=vulkan','--enable-features=Vulkan','--ignore-gpu-blocklist']});
const errors=[];
try{
 const p=await browser.newPage({viewport:{width:844,height:390},hasTouch:true,isMobile:true,deviceScaleFactor:3});
 p.on('pageerror',e=>errors.push(String(e)));
 await p.addInitScript(()=>localStorage.setItem('pokelove-save-v1',JSON.stringify({cards:[1,2,3,4,5,6,7,8],flags:{introSeen:true,endingSeen:true},vals:{},recordingMode:false,handedOver:[],zone:'bilik'})));
 await p.goto(base,{waitUntil:'domcontentloaded'});await p.locator('.press').waitFor({timeout:60000});
 await p.emulateMedia({reducedMotion:'reduce'});await p.screenshot({path:`${out}/production-title.png`,scale:'css'});
 assert.equal(await p.evaluate(()=>typeof window.__pokelove),'undefined');
 const viewport=await p.locator('#game-viewport').evaluate(n=>({w:n.clientWidth,h:n.clientHeight}));assert.deepEqual(viewport,{w:1280,h:720});
 await p.locator('.press').tap();await p.getByRole('button',{name:/Sambung/}).tap();await p.locator('.hud:visible').waitFor();await p.waitForTimeout(4300);
 for(let i=0;i<25&&await p.locator('.dialog').count();i++){await p.keyboard.press('Enter');await p.waitForTimeout(150)}
 await p.touchscreen.tap(420,205);
 const buttons=await p.locator('.touch .btn').evaluateAll(nodes=>nodes.map(n=>({w:n.offsetWidth,h:n.offsetHeight})));assert(buttons.every(b=>b.w>=48&&b.h>=48));
 await p.screenshot({path:`${out}/production-hud.png`,scale:'css'});
 const measure=()=>p.locator('.hud').evaluate(n=>{const v=document.querySelector('#game-viewport').getBoundingClientRect(),r=n.getBoundingClientRect(),s=v.width/1280;return{x:(r.x-v.x)/s,y:(r.y-v.y)/s,w:r.width/s,h:r.height/s}});
 const small=await measure();await p.setViewportSize({width:1280,height:720});await p.waitForTimeout(150);const desktop=await measure();
 for(const k of ['x','y','w','h'])assert(Math.abs(small[k]-desktop[k])<.1);
 await p.setViewportSize({width:844,height:390});await p.waitForTimeout(150);
 await p.keyboard.press('Backquote');await p.getByRole('button',{name:/↪ Photobooth/}).click();await p.getByRole('button',{name:'Tutup',exact:true}).click();await p.waitForTimeout(4500);
 for(let i=0;i<40&&await p.locator('.dialog').count();i++){await p.keyboard.press('Enter');await p.waitForTimeout(100)}
 await p.keyboard.press('Backquote');await p.getByRole('button',{name:/Boss zon ni/}).click();await p.getByRole('button',{name:'Tutup',exact:true}).click();await p.locator('.mg-intro').waitFor();await p.locator('.mg-go').tap();await p.locator('.mg-intro').waitFor({state:'detached'});
 for(const [w,h]of[[844,390],[390,844],[568,320],[844,390]]){
  await p.setViewportSize({width:w,height:h});await p.waitForTimeout(150);const r=await p.locator('.storybook-host canvas').boundingBox();
  await p.touchscreen.tap(r.x+433/1280*r.width,r.y+202/720*r.height);await p.waitForTimeout(150);
 }
 await p.screenshot({path:`${out}/production-memory-rotated.png`,scale:'css'});
 const urls=await p.evaluate(()=>performance.getEntriesByType('resource').map(r=>new URL(r.name).pathname).filter(n=>/^\/assets\/.*\.(js|css)$/.test(n)));
 for(const url of new Set(urls)){const served=Buffer.from(await(await fetch(base+url)).arrayBuffer()),disk=await readFile(`game/dist${url}`);assert(served.equals(disk),url)}
 assert.deepEqual(errors,[]);await writeFile(`${out}/production-verification.json`,JSON.stringify({viewport,devicePixelRatio:3,hudMatchesDesktop:true,rotatedMemoryTouch:true,servedBundlesMatchBuild:urls.length,errors},null,2));console.log('Production landscape, rotation, touch, DPR 3 and bundle bytes passed');
}finally{await browser.close()}
