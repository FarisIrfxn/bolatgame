// Exercise the real ending and its new continue button, after entering through main.
import assert from 'node:assert/strict';
import {writeFile} from 'node:fs/promises';
const {chromium}=await import(process.env.PW_CORE??'/home/durioo/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core/index.mjs');
const browser=await chromium.launch({args:['--use-angle=vulkan','--enable-features=Vulkan','--ignore-gpu-blocklist']});
const out='art/ending-keepsake-2026-10-27';
try{
 const page=await browser.newPage({viewport:{width:1280,height:720}}),errors=[];
 page.on('pageerror',e=>errors.push(String(e)));
 await page.addInitScript(()=>localStorage.setItem('pokelove-save-v1',JSON.stringify({cards:[1,2,3,4,5,6,7,8],flags:{introSeen:true,endingSeen:true,clueBowat:true,clueStrips:true,clueFaris:true},vals:{},recordingMode:false,handedOver:[],zone:'bilik'})));
 // Skip only the unrelated bulk-download progress UI, then call its real main entry.
 await page.route('**/src/boot.ts',route=>route.fulfill({contentType:'text/javascript',body:`import {startGame} from '/src/main.ts'; await startGame();`}));
 await page.goto('http://localhost:5182/',{waitUntil:'networkidle'});
 await page.locator('.press').waitFor({timeout:60000}).catch(async error=>{await page.screenshot({path:`${out}/flow-load-failure.png`});console.log('Load errors',errors);console.log((await page.locator('body').innerText()).slice(0,1200));throw error});
 await page.locator('.press').click();await page.getByRole('button',{name:/Sambung/}).click();
 await page.waitForFunction(()=>window.__pokelove?.overworld.currentZone==='bilik');
 await page.waitForTimeout(1200);
 await page.evaluate(()=>{window.__endingFinished=false;window.__pokelove.overworld.lock();void window.__pokelove.playEnding().then(()=>window.__endingFinished=true)});
 for(let i=0;i<80&&!await page.locator('.cake-scene').count();i++){await page.keyboard.press('Enter');await page.waitForTimeout(150)}
 await page.locator('.cake-scene').waitFor();await page.keyboard.down('Space');await page.locator('.bday-banner').waitFor();await page.keyboard.up('Space');await page.waitForTimeout(1900);await page.keyboard.press('Enter');
 for(let i=0;i<130&&!await page.locator('.letter-next').count();i++){await page.keyboard.press('Enter');await page.waitForTimeout(150)}
 await page.locator('.letter-next').waitFor();await page.keyboard.press('Enter');await page.waitForTimeout(400);await page.locator('.letter-next').click();
 await page.locator('.card9').waitFor();await page.waitForTimeout(4200);await page.keyboard.press('Enter');
 await page.locator('.ending-continue').waitFor();await page.waitForTimeout(1000);
 await page.screenshot({path:`${out}/actual-flow.png`});
 await page.locator('.ending-continue').click();await page.waitForFunction(()=>window.__endingFinished);
 assert.equal(await page.locator('.ending').count(),0);assert.equal(await page.evaluate(()=>window.__pokelove.save.flag('endingSeen')),true);
 assert.deepEqual(errors,[]);await writeFile(`${out}/flow-verification.json`,JSON.stringify({actualEnding:true,continueClosesEnding:true,progressSaved:true,errors},null,2));
 console.log('Real ending flow and continue button passed');
}finally{await browser.close()}
