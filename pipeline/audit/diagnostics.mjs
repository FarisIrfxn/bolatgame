// The phone's crash trail must survive reload and stay accessible without DevTools.
import assert from 'node:assert/strict';
const {chromium}=await import(process.env.PW_CORE??'/home/durioo/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core/index.mjs');
const browser=await chromium.launch({args:['--use-angle=vulkan','--enable-features=Vulkan','--ignore-gpu-blocklist']});
try{
 const page=await browser.newPage({viewport:{width:390,height:844},hasTouch:true});
 const errors=[];page.on('pageerror',e=>errors.push(String(e)));
 await page.goto((process.env.GAME_URL??'http://127.0.0.1:5181/')+'?diag=1');
 await page.waitForFunction(()=>window.__pokelove&&!document.querySelector('.startup-loading'),null,{timeout:120000});
 assert(await page.locator('aside textarea').count());
 await page.evaluate(async()=>{const {diagnostic}=await import('/src/core/diagnostics.ts');diagnostic('audit marker',{value:42})});
 await page.reload();
 assert(await page.locator('aside textarea').isHidden());
 await page.getByRole('button',{name:'Log',exact:true}).click();
 await page.locator('aside textarea').waitFor();
 const log=await page.locator('aside textarea').inputValue();
 assert(log.includes('audit marker')&&log.includes('"value": 42'));
 assert.deepEqual(errors,[]);
 console.log('Phone diagnostic log survives reload and is visible');
}finally{await browser.close()}
