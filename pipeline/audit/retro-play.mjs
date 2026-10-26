// Play the changed scenes through public input; scene reads only guide the automated player.
import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
const {chromium}=await import('/home/durioo/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core/index.mjs');
const out='art/retro/qa/play'; await mkdir(out,{recursive:true});
const browser=await chromium.launch({args:['--use-angle=vulkan','--enable-features=Vulkan','--ignore-gpu-blocklist']});
const errors=[], results=[];
async function start(boss){
 const context=await browser.newContext({viewport:{width:1280,height:720}}),page=await context.newPage();
 page.on('pageerror',e=>errors.push(String(e)));
 await page.addInitScript(()=>localStorage.setItem('pokelove-save-v1',JSON.stringify({cards:[1,2,3,4,5,6,7,8],flags:{introSeen:true,endingSeen:true},vals:{},recordingMode:false,handedOver:[],zone:'bilik'})));
 await page.goto('http://localhost:5181/',{waitUntil:'networkidle'});
 await page.locator('.press').click(); await page.getByRole('button',{name:/Sambung/}).click(); await page.waitForTimeout(4500);
 await page.evaluate(boss=>{window.__pokelove.overworld.lock();void window.__pokelove.playBoss(boss,{zone:'bilik',spawn:'start'});},boss);
 await page.locator('.mg-go').click();
 await page.waitForFunction(boss=>boss==='qishex'?window.__retroRunner?.().ready:window.__pokelove.activeMinigameScene()?.sys.isActive(),boss);
 return {context,page};
}
async function point(page,x,y){const r=await page.locator('.retro-host canvas').boundingBox(); await page.mouse.move(r.x+x*r.width/1280,r.y+y*r.height/720);}
async function key(page,k,ms=65){await page.keyboard.down(k);await page.waitForTimeout(ms);await page.keyboard.up(k);await page.waitForTimeout(35);}
try{
 for(const boss of ['qishex','bolatex','snorlax','megabowat','blep','bolat','bowat']){
  console.log('Playing',boss); const {context,page}=await start(boss); const deadline=Date.now()+140000; let won=false, state;
  // Memory clicks use native canvas coordinates (the pointer is at each card's centre).
  if(boss==='bolatex'){
   const cards=await page.evaluate(()=>window.__pokelove.activeMinigameScene().cards.map(c=>({pair:c.pair,x:c.c.x,y:c.c.y})));
   for(let p=0;p<6;p++){
    for(const c of cards.filter(c=>c.pair===p)){await point(page,c.x,c.y);await page.mouse.down();await page.mouse.up();await page.waitForTimeout(260);}
    await page.waitForTimeout(600);
   }
  }
  let direction='', heldA=false;
  while(Date.now()<deadline){
   if(await page.locator('.dialog').count()){won=true;break;}
   if(boss==='qishex'){
    state=await page.evaluate(()=>window.__retroRunner()); if(state.done){won=state.smacked===10;break;}
    const w=state.words.filter(w=>w.state==='incoming').sort((a,b)=>a.z-b.z)[0];
    if(w&&w.z<55){if(w.lane!==state.lane) await key(page,w.lane<state.lane?'ArrowLeft':'ArrowRight');else if(w.z<9.5&&w.z>2.2) await key(page,'Enter');}
   }else{
    state=await page.evaluate(boss=>{const s=window.__pokelove.activeMinigameScene();if(!s)return null;
     if(boss==='bolatex')return {done:s.done,matched:s.matched};
     if(boss==='snorlax')return {done:s.done,fed:s.fed,x:s.qish.x,fallers:s.fallers.map(f=>({x:f.obj.x,y:f.obj.y,alarm:f.alarm}))};
     if(boss==='megabowat')return {done:s.done,eaten:s.eaten,y:s.bowat.y,vy:s.vy,started:s.started,columns:s.columns.filter(c=>c.x>245).map(c=>({x:c.x,y:c.gapY,cookie:!!c.cookie}))};
     if(boss==='blep')return {done:s.done,hp:s.bossHp,bx:s.boss.x,x:s.ship.x,charge:s.charge};
     if(boss==='bolat')return {done:s.finished,hits:s.hits,total:s.notes.length,dt:Math.min(...s.notes.filter(n=>n.state==='live').map(n=>n.beat*s.song.beat-s.song.now()))};
     return {done:s.won,hits:s.hits,started:s.started,x:s.player.x,y:s.player.y,bx:s.boss.x,ground:s.player.body.blocked.down||s.player.body.touching.down,vy:s.player.body.velocity.y};
    },boss);
    if(!state){won=true;break;}
    if(state.done){won=boss==='bolat'?state.hits>=state.total/2:true;break;}
    if(boss==='snorlax'){
     const f=state.fallers.filter(f=>!f.alarm&&f.y>30).sort((a,b)=>b.y-a.y)[0];
     if(f){await point(page,f.x,600);await page.mouse.down();}
    }
    if(boss==='megabowat'){
     const c=state.columns.sort((a,b)=>a.x-b.x)[0],target=c?.y??360;
     if(!state.started||(state.vy>-220&&(state.y>target+25||state.y+state.vy*.16>target+35)))await key(page,'Enter',45);
    }
    if(boss==='blep'){
     await point(page,state.bx,640);await page.mouse.down();if(state.charge>=1)await key(page,'Enter');
    }
    if(boss==='bolat'&&state.dt<.07&&state.dt>-.1)await key(page,'Enter',45);
    if(boss==='bowat'){
     if(!state.started)await key(page,'Enter');
     const want=Math.abs(state.bx-state.x)<22?'':state.bx<state.x?'ArrowLeft':'ArrowRight';
     if(want!==direction){if(direction)await page.keyboard.up(direction);if(want)await page.keyboard.down(want);direction=want;}
     if(state.ground&&Math.abs(state.bx-state.x)<300&&!heldA){await page.keyboard.down('Enter');heldA=true;}
     if(heldA&&state.vy>0){await page.keyboard.up('Enter');heldA=false;}
    }
   }
   await page.waitForTimeout(boss==='bolat'?30:60);
  }
  if(direction)await page.keyboard.up(direction);if(heldA)await page.keyboard.up('Enter');await page.mouse.up();
  await page.screenshot({path:`${out}/${boss}-${won?'won':'failed'}.png`});
  results.push({boss,won,state});console.log(boss,won?'WON':'FAILED',JSON.stringify(state));
  assert(won,`${boss}: real input reaches win`);await page.locator('.dialog').waitFor({timeout:7000});await context.close();
 }
 assert.deepEqual(errors,[]);await writeFile(`${out}/verification.json`,JSON.stringify({results,errors},null,2));
}finally{await browser.close();}
