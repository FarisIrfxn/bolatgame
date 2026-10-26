// Title, real card HUD, Myvi travel and TV boss selection through their real main handlers.
import assert from 'node:assert/strict';
import {mkdir,writeFile,rm} from 'node:fs/promises';
const {chromium}=await import(process.env.PW_CORE??'/home/durioo/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core/index.mjs');
const out='art/ui-navigation';await mkdir(out,{recursive:true});
const browser=await chromium.launch({args:['--use-angle=vulkan','--enable-features=Vulkan','--ignore-gpu-blocklist']});
const errors=[],results=[];
async function shot(p,name){await p.waitForTimeout(150);await p.screenshot({path:`${out}/${name}.png`});}
async function fits(p,selector){const b=await p.locator(selector).boundingBox(),v=p.viewportSize();assert(b&&b.x>=-1&&b.y>=-1&&b.x+b.width<=v.width+1&&b.y+b.height<=v.height+1,`${v.width} ${selector}: ${JSON.stringify(b)}`);}
async function settle(p){for(let i=0;i<60&&await p.locator('.dialog').count();i++){await p.keyboard.press('Enter');await p.waitForTimeout(100);}}
async function direction(p,key){await p.keyboard.down(key);await p.waitForTimeout(100);await p.keyboard.up(key);await p.waitForTimeout(100);}
async function choose(p,selector,touch){if(touch)await p.locator(selector).tap();else await p.locator(selector).click();}
try{
  const viewports=process.argv.includes('--small')?[['small',320,568]]:[['desktop',1280,720],['phone',390,844],['landscape',844,390]];
  for(const [name,width,height] of viewports){
    const context=await browser.newContext({viewport:{width,height},hasTouch:name!=='desktop',isMobile:name!=='desktop'}),p=await context.newPage();
    p.setDefaultTimeout(20000);p.on('pageerror',e=>errors.push(String(e)));p.on('console',m=>{if(m.type()==='error')errors.push(m.text());});p.on('response',r=>{if(r.status()>=400)errors.push(`${r.status()} ${r.url()}`);});
    await p.addInitScript(()=>localStorage.setItem('pokelove-save-v1',JSON.stringify({cards:[5,3,7],flags:{introSeen:true},vals:{},recordingMode:false,handedOver:[],zone:'labulanjut'})));
    await p.goto(process.env.GAME_URL??'http://localhost:5181/',{waitUntil:'networkidle'});await p.evaluate(()=>document.fonts.ready);
    await fits(p,'.title-inner');await shot(p,`${name}-title`);
    const first=await p.locator('.title-runner.qish').boundingBox(),frames=new Set();
    for(let i=0;i<7;i++){frames.add(await p.locator('.title-runner.qish img').getAttribute('src'));await p.waitForTimeout(85);}
    const next=await p.locator('.title-runner.qish').boundingBox();assert(Math.abs(first.x-next.x)<1&&Math.abs(first.y-next.y)<1,'Bolat stays fixed');assert(frames.size>1,'walk frames animate in place');
    assert.equal(await p.locator('.title-screen .sub,.title-footer,.title-eyebrow,.title-controls').count(),0);
    await p.locator('.press').click();await p.getByRole('button',{name:/Sambung/}).waitFor();await fits(p,'.title-inner');await fits(p,'.title-menu');await shot(p,`${name}-title-menu`);
    await p.getByRole('button',{name:/Sambung/}).click();await p.locator('.hud:visible').waitFor();await p.waitForTimeout(4300);await settle(p);
    assert(await p.locator('.hud .got img').evaluateAll(imgs=>imgs.length===3&&imgs.every(i=>i.src.includes('/assets/cards/')&&i.complete&&i.naturalWidth>0)),'actual unlocked cards in HUD');
    await shot(p,`${name}-hud-cards`);
    await p.mouse.move(0,0);await p.evaluate(()=>{void window.__pokelove.myviTravel('labulanjut');});await p.locator('.travel-map').waitFor();await p.waitForTimeout(300);
    assert.equal(await p.locator('.dialog').count(),0,'map replaces dialogue');await fits(p,'.map-panel');await shot(p,`${name}-map`);
    const zoneBefore=await p.evaluate(()=>window.__pokelove.save.data.zone);
    await choose(p,'.map-stop[data-zone="sepang"]',name!=='desktop');assert(await p.locator('.picker-confirm').isDisabled());assert.equal(await p.evaluate(()=>window.__pokelove.save.data.zone),zoneBefore,'locked destinations do not travel');
    await choose(p,'.map-stop[data-zone="labulanjut"]',name!=='desktop');assert(await p.locator('.picker-confirm').isDisabled(),'current place cannot travel to itself');
    if(name==='desktop')await p.keyboard.press('Escape');else await p.locator('.picker-close').tap();await p.locator('.game-picker').waitFor({state:'detached'});assert.equal(await p.evaluate(()=>window.__pokelove.overworld.sceneLock),false,'cancel restores movement');
    await p.evaluate(()=>{void window.__pokelove.myviTravel('labulanjut');});await p.locator('.travel-map').waitFor();await p.waitForTimeout(100);
    await direction(p,'ArrowRight');assert.notEqual(await p.locator('.map-stop.sel').getAttribute('data-zone'),'labulanjut','map supports arrows');
    await choose(p,'.map-stop[data-zone="sunway"]',name!=='desktop');await p.locator('.game-picker').waitFor({state:'detached'});await p.waitForFunction(()=>window.__pokelove.save.data.zone==='sunway');await settle(p);
    assert.equal(await p.evaluate(()=>window.__pokelove.overworld.currentZone),'sunway','destination handler travels to zone');
    await p.evaluate(async()=>{window.__pokelove.save.data.cards=[1,2,3,4,5,6,7,8];window.__pokelove.save.setFlag('endingSeen');await window.__pokelove.travel('bilik','start');});await p.waitForTimeout(1500);await settle(p);
    await p.evaluate(()=>{void window.__pokelove.replayConsole();});await p.locator('.boss-library').waitFor();await p.waitForTimeout(350);await fits(p,'.boss-panel');
    assert.equal(await p.locator('.boss-choice').count(),8);assert.equal(await p.locator('.dialog').count(),0,'TV uses the banner library');
    const row1=await p.locator('.boss-choice').nth(0).boundingBox(),row2=await p.locator('.boss-choice').nth(width>700?4:2).boundingBox();assert(row2.y>=row1.y+row1.height,'boss rows never overlap on a short screen');
    assert(await p.locator('.boss-choice img').evaluateAll(imgs=>imgs.every(i=>i.complete&&i.naturalWidth>0)),'all banners and boss portraits loaded');await shot(p,`${name}-boss-select`);
    await p.mouse.move(0,0);await p.locator('.picker-close').focus();await p.locator('.boss-choice[data-boss="bowat"]').focus();assert.equal(await p.locator('.boss-choice.sel').getAttribute('data-boss'),'bowat');await direction(p,'ArrowRight');assert.equal(await p.locator('.boss-choice.sel').getAttribute('data-boss'),'bolat');
    await p.keyboard.press('Escape');await p.locator('.game-picker').waitFor({state:'detached'});assert.equal(await p.evaluate(()=>window.__pokelove.overworld.sceneLock),false);
    await p.evaluate(()=>{void window.__pokelove.replayConsole();});await p.locator('.boss-library').waitFor();await choose(p,'.boss-choice[data-boss="bowat"]',name!=='desktop');
    await p.locator('.mg-intro').waitFor();assert.equal(await p.locator('.boss-library').count(),0);assert.match(await p.locator('.mg-box h2').innerText(),/Bowat/);
    if(name==='desktop'){
      await p.locator('.mg-go').click();await p.waitForFunction(()=>window.__pokelove.activeMinigameScene()?.children.list.length>5);await p.waitForTimeout(500);
      await p.evaluate(()=>window.__pokelove.activeMinigameScene().forceWin());await p.locator('.dialog').waitFor();assert.equal(await p.locator('.reveal').count(),0,'replay does not award cards');await settle(p);await p.waitForFunction(()=>window.__pokelove.overworld.currentZone==='bilik');
      assert.equal(await p.evaluate(()=>window.__pokelove.save.data.cards.length),8);
    }
    results.push({name,stationaryWalk:true,realCards:true,mapGating:true,mapTravel:true,mapCancel:true,bossBanners:8,bossStart:true});console.log(`${name}: title, cards, map, boss library passed`);await context.close();
  }
  assert.deepEqual(errors,[]);await writeFile(`${out}/${process.argv.includes('--small')?'small-':''}verification.json`,JSON.stringify({results,errors},null,2));await rm(`${out}/failure.json`,{force:true});
}catch(e){await writeFile(`${out}/failure.json`,JSON.stringify({error:String(e),errors,results},null,2));throw e;}finally{await browser.close();}
