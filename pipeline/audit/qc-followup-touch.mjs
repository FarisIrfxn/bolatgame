// Real pointer-type touch gestures plus switching back to a desktop keyboard.
import assert from 'node:assert/strict';
import {writeFile} from 'node:fs/promises';
const {chromium}=await import(process.env.PW_CORE??'/home/durioo/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core/index.mjs');
const browser=await chromium.launch({args:['--use-angle=vulkan','--enable-features=Vulkan','--ignore-gpu-blocklist']});
const out='art/ending-qc-2026-10-27/qa',report=[];
try{
 for(const [name,width,height] of [['phone',390,844],['landscape',844,390]]){
  const page=await browser.newPage({viewport:{width,height},hasTouch:true,isMobile:true});
  const errors=[];page.on('pageerror',e=>errors.push(String(e)));
  await page.addInitScript(()=>localStorage.setItem('pokelove-save-v1',JSON.stringify({cards:[1,2,3,4,5,6,7,8],flags:{introSeen:true,endingSeen:true},vals:{},recordingMode:false,handedOver:[],zone:'labulanjut'})));
  await page.goto('http://localhost:5181/',{waitUntil:'networkidle'});
  await page.locator('.press').tap();await page.getByRole('button',{name:/Sambung/}).tap();await page.waitForTimeout(1500);
  await page.evaluate(()=>{void window.__pokelove.playBoss('megabowat',{zone:'labulanjut',spawn:'start'})});
  await page.locator('.mg-go').waitFor();assert.equal(await page.locator('.mg-go [data-control="a"]').innerText(),'A');
  await page.locator('.mg-go').tap();await page.waitForFunction(()=>!!window.__pokelove.activeMinigameScene()?.sys.isActive());
  await page.locator('.touch:visible').waitFor();
  await page.locator('.btn-a').tap();await page.waitForFunction(()=>window.__pokelove.activeMinigameScene().started);
  await page.screenshot({path:`${out}/${name}-real-touch.png`});
  await page.keyboard.press('ArrowRight');await page.waitForFunction(()=>document.body.dataset.inputDevice==='keyboard');
  assert.equal(await page.locator('.touch:visible').count(),0);
  assert.equal(errors.length,0,errors.join('\n'));report.push({name,touchStartsGame:true,keyboardHidesTouch:true,errors});
  await page.close();console.log(name,'real touch and keyboard switch passed');
 }
 await writeFile(`${out}/touch-verification.json`,JSON.stringify(report,null,2));
}finally{await browser.close()}
