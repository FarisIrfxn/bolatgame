// Simulate a 120 Hz display and verify a 60 Hz phone clock without slowing time.
import assert from 'node:assert/strict';
import {writeFile} from 'node:fs/promises';
const {chromium}=await import(process.env.PW_CORE??'/home/durioo/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core/index.mjs');
const browser=await chromium.launch();const results=[];
try{
 for(const touch of [true,false]){
  const p=await browser.newPage({hasTouch:touch});await p.route('**/src/boot.ts',r=>r.fulfill({contentType:'text/javascript',body:''}));
  await p.goto('http://127.0.0.1:5181',{waitUntil:'domcontentloaded'});
  const r=await p.evaluate(async()=>{
   const callbacks=[];window.requestAnimationFrame=fn=>{callbacks.push(fn);return callbacks.length};
   const {onFrame,startLoop}=await import('/src/core/loop.ts');let ticks=0,elapsed=0;onFrame(dt=>{ticks++;elapsed+=dt});
   const begin=performance.now();startLoop();startLoop();const queued=callbacks.length;
   for(let i=1;i<=120;i++)callbacks.shift()(begin+i*1000/120);
   return {touch:navigator.maxTouchPoints>0,ticks,elapsed,queued};
  });
  assert.equal(r.queued,1,'Calling start twice cannot double the frame loop');assert(Math.abs(r.elapsed-1)<.035,'Capping frames preserves real game time');
  assert(touch?r.ticks>=59&&r.ticks<=61:r.ticks===120,'Only the phone clock is capped');results.push(r);await p.close();
 }
 await writeFile('art/mobile-fullscreen-2026-10-27/qa/frame-budget-verification.json',JSON.stringify({results},null,2));console.log('120 Hz simulation: phone renders 60 updates; desktop unchanged; elapsed time preserved');
}finally{await browser.close()}
