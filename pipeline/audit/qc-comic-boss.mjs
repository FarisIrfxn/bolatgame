// Oct 27 second follow-up: cold boss loads, centered countdown, road perspective, keycaps.
import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
const {chromium}=await import(process.env.PW_CORE??'/home/durioo/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core/index.mjs');
const out='art/ending-comic-2026-10-27/qa';await mkdir(out,{recursive:true});
const browser=await chromium.launch({args:['--use-angle=vulkan','--enable-features=Vulkan','--ignore-gpu-blocklist']});
const report={bosses:[],keycaps:[],runner:null,errors:[]};
async function fresh(zone='bilik',width=1280,height=720){
 const page=await browser.newPage({viewport:{width,height}});
 page.on('pageerror',e=>report.errors.push(String(e)));
 page.on('response',r=>{if(r.status()>=400)report.errors.push(`${r.status()} ${r.url()}`)});
 await page.addInitScript(zone=>localStorage.setItem('pokelove-save-v1',JSON.stringify({cards:[1,2,3,4,5,6,7,8],flags:{introSeen:true,endingSeen:true,clueBowat:true,clueStrips:true,clueFaris:true},vals:{},recordingMode:false,handedOver:[],zone})),zone);
 await page.goto('http://localhost:5181/',{waitUntil:'networkidle'});
 await page.locator('.press').click();await page.getByRole('button',{name:/Sambung/}).click();
 await page.waitForFunction(zone=>window.__pokelove.overworld.currentZone===zone,zone);
 await page.waitForFunction(()=>{const label=document.querySelector('.zone-label');return label&&getComputedStyle(label).display!=='none'&&!document.querySelector('.fade.on')});
 await page.locator('.zone-title').waitFor({state:'detached'});await page.waitForTimeout(450);return page;
}
async function keycap(page,selector){
 const k=await page.evaluate(selector=>{const node=document.querySelector(selector),c=getComputedStyle(node);return{text:node.textContent,width:node.clientWidth,scroll:node.scrollWidth,radius:c.borderRadius,height:node.clientHeight}},selector);
 assert.equal(k.text,'Space');assert(k.scroll<=k.width,'Space fits inside its keycap');assert(k.radius==='5px'&&k.width>k.height,`Keyboard keycap is rectangular: ${JSON.stringify(k)}`);return k;
}
try{
 for(const boss of (process.argv[2]==='keycaps'?[]:process.argv[2]?.split(',')??['bowat','bolat','snorlax','blep','megabowat','bolatex','finale','qishex'])){
  const page=await fresh();await page.evaluate(()=>window.__pokelove.overworld.lock());
  let stall=false,release;const gate=new Promise(resolve=>release=resolve);
  await page.route('**/assets/storybook/*.png',async route=>{if(stall)await gate;await route.continue()});
  await page.evaluate(boss=>{void window.__pokelove.playBoss(boss,{zone:'bilik',spawn:'start'})},boss);
  await page.locator('.mg-go kbd').waitFor();
  const cap=await keycap(page,'.mg-go kbd');
  assert((await page.locator('.storybook-host').evaluate(node=>getComputedStyle(node).backgroundImage)).includes(`bg_${boss}`),'Illustrated backdrop exists before fade lifts');
  // Wait out the normal fade, then deliberately hold gameplay art requests.
  await page.waitForTimeout(650);stall=true;await page.locator('.mg-go').click();
  await page.waitForTimeout(450);
  assert.equal(await page.locator('.mg-intro[aria-busy="true"]').count(),1,'Intro remains over the arena until graphics are ready');
  const loadingCanvas=await page.locator('.storybook-host canvas').first().evaluate(node=>getComputedStyle(node).visibility).catch(()=>null);
  if(boss!=='qishex')assert.equal(loadingCanvas,'hidden','Phaser cannot expose a flat loading frame');
  if(boss==='bowat'||boss==='qishex')await page.screenshot({path:`${out}/${boss}-loading.png`});
  stall=false;release();await page.locator('.mg-intro').waitFor({state:'detached',timeout:30000});
  if(boss==='bowat'){
   const centers=[];
   for(const text of ['Sedia...','Pijak Bowat!']){
    await page.waitForFunction(text=>window.__pokelove.activeMinigameScene()?.hintText.text===text,text,{timeout:2500});
    const b=await page.evaluate(()=>{const s=window.__pokelove.activeMinigameScene();const b=s.hintText.getBounds();return{text:s.hintText.text,x:b.centerX,y:b.centerY}});
    assert.equal(b.x,640);assert.equal(b.y,360);centers.push(b);
    await page.screenshot({path:`${out}/bowat-${text==='Sedia...'?'sedia':'pijak'}.png`});
   }
   report.countdown=centers;
  }
  if(boss==='qishex'){
   await page.waitForFunction(()=>window.__qishRunner?.().ready);
   await page.evaluate(()=>{const canvas=document.querySelector('.storybook-runner'),g=canvas.getContext('2d');window.__extraRoadStrokes=0;const stroke=g.stroke.bind(g);g.stroke=(...args)=>{window.__extraRoadStrokes++;return stroke(...args)}});
   let pathShot=false,strikeShot=false;const samples=[];
   for(let i=0;i<700;i++){
    const state=await page.evaluate(()=>window.__qishRunner?.());if(!state)break;
    for(const w of state.words){
     assert(w.projected.y>=104&&w.projected.y<150,'Signs rise from the road horizon and remain above the bottom edge');
     const roadHalf=3*(w.projected.groundY-104)+3;
     assert(Math.abs(w.projected.x-161)+38.5*w.projected.p<roadHalf,'Sign stays inside the painted boulevard');
    }
    if(state.smacked>=10){report.runner={smacked:state.smacked,fails:state.fails,samples,extraRoadStrokes:await page.evaluate(()=>window.__extraRoadStrokes)};break}
    const next=state.words.filter(w=>w.state==='incoming').sort((a,b)=>a.z-b.z)[0];
    if(next){
     if(!pathShot&&next.z<65&&next.z>40){await page.screenshot({path:`${out}/runner-perspective.png`});pathShot=true;samples.push(next)}
     if(next.z<40&&next.lane!==state.lane){const key=next.lane>state.lane?'ArrowRight':'ArrowLeft';await page.keyboard.down(key);await page.waitForTimeout(60);await page.keyboard.up(key);await page.waitForTimeout(60)}
     if(next.z<10.5&&next.z>2&&next.lane===state.lane){
      if(!strikeShot){await page.screenshot({path:`${out}/runner-hit-window.png`});strikeShot=true;samples.push(next)}
      await page.keyboard.press('Space');
     }
    }
    await page.waitForTimeout(70);
   }
   assert(report.runner&&report.runner.smacked===10,'Runner won with real lane and Space input');
   assert.equal(report.runner.extraRoadStrokes,0,'No extra lane lines are painted over the background');
  }
  report.bosses.push({boss,keptIntroWhileLoading:true,illustratedFirstFrame:true,keycap:cap});console.log(boss,'cold transition passed');
  await page.close();
 }
 for(const [name,width,height] of [['desktop',1280,720],['small',320,568]]){
  const page=await fresh('sunway',width,height);
  await page.evaluate(()=>window.__pokelove.overworld.placePlayer(35,20.6,'front'));
  await page.locator('.prompt-bubble:not([hidden]) kbd').waitFor();
  const bubble=await keycap(page,'.prompt-bubble kbd');
  if(name==='desktop'){
   await page.evaluate(()=>{window.__promptPad={id:'Xbox Wireless Controller',axes:[.3,0],buttons:Array.from({length:16},()=>({pressed:false}))};Object.defineProperty(navigator,'getGamepads',{value:()=>[window.__promptPad],configurable:true})});
   await page.waitForFunction(()=>document.querySelector('.prompt-bubble kbd')?.textContent==='A');
   const labels=await page.evaluate(async()=>{const labels=[];for(let i=0;i<16;i++){await new Promise(requestAnimationFrame);labels.push(document.querySelector('.prompt-bubble kbd')?.textContent)}return labels});
   assert(labels.every(label=>label==='A'),'World prompt keeps the controller label across frames');
   await page.evaluate(()=>window.__promptPad=null);await page.keyboard.press('ArrowLeft');
   await page.waitForFunction(()=>document.querySelector('.prompt-bubble kbd')?.textContent==='Space');
   report.controllerPromptStable=true;
  }
  await page.screenshot({path:`${out}/${name}-space-prompt.png`});
  await page.evaluate(async()=>{const {repMeter}=await import('/src/ui/reps.ts');void repMeter('Hayun kaki',4,()=>{})});
  const reps=await keycap(page,'.rep-panel kbd');report.keycaps.push({name,bubble,reps});
  await page.screenshot({path:`${out}/${name}-space-reps.png`});await page.close();
 }
 assert.deepEqual(report.errors,[]);await writeFile(`${out}/boss-verification${process.argv[2]?'-'+process.argv[2].replaceAll(',','-'):''}.json`,JSON.stringify(report,null,2));
}finally{await browser.close()}
