// Actual title animation, objective persistence and the new game HUD in isolated saves.
import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
const {chromium}=await import(process.env.PW_CORE??'/home/durioo/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core/index.mjs');
const out='art/ui-hud-refresh';await mkdir(out,{recursive:true});
const browser=await chromium.launch({args:['--use-angle=vulkan','--enable-features=Vulkan','--ignore-gpu-blocklist']});
const errors=[],results=[];
const pause=async p=>{for(let n=0;n<30&&await p.locator('.dialog').count();n++){await p.keyboard.press('Enter');await p.waitForTimeout(100);}await p.evaluate(()=>window.__pokelove.overworld.lock());};
async function shot(p,name){await p.screenshot({path:`${out}/${name}.png`});}
async function fits(p,selector){const b=await p.locator(selector).boundingBox(),v=p.viewportSize();assert(b&&b.x>=0&&b.y>=0&&b.x+b.width<=v.width+1&&b.y+b.height<=v.height+1,`${selector} fits ${v.width}: ${JSON.stringify(b)}`);}
try{
  const viewports=process.argv.includes('--small') ? [['phone-small',320,568]] : [['desktop',1280,720],['phone',390,844],['landscape',844,390]];
  for(const [name,width,height] of viewports){
    const context=await browser.newContext({viewport:{width,height},hasTouch:name!=='desktop',isMobile:name!=='desktop'}),p=await context.newPage();
    p.on('pageerror',e=>errors.push(String(e)));p.on('response',r=>{if(r.status()>=400)errors.push(`${r.status()} ${r.url()}`);});
    await p.addInitScript(()=>localStorage.setItem('pokelove-save-v1',JSON.stringify({cards:[5,3,7],flags:{introSeen:true},vals:{},recordingMode:false,handedOver:[],zone:'labulanjut'})));
    await p.goto('http://localhost:5181/',{waitUntil:'networkidle'});await p.evaluate(()=>document.fonts.ready);
    assert.equal(await p.locator('.title-screen .press').innerText(),'Press Start');
    assert.equal(await p.locator('.title-screen .sub,.title-eyebrow,.title-footer,.title-controls').count(),0);
    await fits(p,'.title-inner');await shot(p,`${name}-title`);
    const frames=new Set(),x=await p.locator('.title-runner.qish').evaluate(e=>e.style.left);
    for(let i=0;i<8;i++){frames.add(await p.locator('.title-runner.qish img').getAttribute('src'));await p.waitForTimeout(80);}
    assert(frames.size>1,'Bolat walk frames advance');
    assert.notEqual(await p.locator('.title-runner.qish').evaluate(e=>e.style.left),x,'runners move along the path');
    await p.locator('.press').click();await p.getByRole('button',{name:/Sambung/}).waitFor();await fits(p,'.title-menu');
    await shot(p,`${name}-menu`);await p.getByRole('button',{name:/Sambung/}).click();await p.locator('.hud:visible').waitFor();await p.waitForTimeout(4200);await pause(p);
    for(const selector of ['.zone-label','.hud','.collect-hud:not(.workout-hud)'])await fits(p,selector);
    assert(!/PULAU POKÉLOVE/.test(await p.locator('.zone-label').innerText()));
    assert.equal(await p.locator('.hud .slot').count(),8);assert.equal(await p.locator('.hud .got img').count(),3);
    assert.equal(await p.locator('.collect-status').innerText(),'Complete','older progressed saves are marked complete');
    await shot(p,`${name}-complete`);
    await p.evaluate(async()=>{const d=window.__pokelove.save.data;d.cards=[];for(let i=0;i<6;i++)d.flags[`got:labulanjut:${i}`]=i<3;window.__pokelove.save.write();await window.__pokelove.travel('labulanjut','start');});
    await p.waitForTimeout(1200);await pause(p);assert.equal(await p.locator('.collect-status').count(),0);
    assert.match(await p.locator('.collect-line b').innerText(),/3\s*\/6/);await shot(p,`${name}-objective`);
    await p.evaluate(async()=>{for(let i=0;i<6;i++)window.__pokelove.save.setFlag(`got:labulanjut:${i}`);await window.__pokelove.travel('bilik','start');await window.__pokelove.travel('labulanjut','start');});
    await p.waitForTimeout(1200);await pause(p);
    assert.equal(await p.locator('.collect-status').innerText(),'Complete','objective remains complete after returning');
    assert.match(await p.locator('.collect-line b').innerText(),/6\s*\/6/);
    await shot(p,`${name}-return-complete`);results.push({name,titleAnimation:true,cardRing:true,objectivePersists:true});await context.close();
    console.log(`${name}: title, walk frames, HUD, objective persistence passed`);
  }
  assert.deepEqual(errors,[]);await writeFile(`${out}/${process.argv.includes('--small')?'small-':''}verification.json`,JSON.stringify({results,errors},null,2));
}finally{await browser.close();}
