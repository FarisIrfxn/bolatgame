// Full-bleed mobile regression: adaptive scenery, safe HUD and fixed physics,
// safe insets and rotation, including actual Phaser and runner touch input.
import assert from 'node:assert/strict';
import {mkdir, writeFile, rm} from 'node:fs/promises';
const {chromium}=await import(process.env.PW_CORE??'/home/durioo/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core/index.mjs');
const base=process.env.GAME_URL??'http://127.0.0.1:5181';
const out=process.env.AUDIT_OUT??'art/mobile-fullscreen-2026-10-27/qa';
await mkdir(out,{recursive:true});
const browser=await chromium.launch({args:['--use-angle=vulkan','--enable-features=Vulkan','--ignore-gpu-blocklist']});
const sizes=[[1280,720],[1600,900],[844,390],[667,375],[568,320],[932,430],[740,280],[1024,768]];
const report={layouts:[],touch:[],errors:[]};
const overlaysOnly=process.argv.includes('--overlays');
const selectedBosses=process.argv.find(a=>a.startsWith('--bosses='))?.slice(9).split(',');
let page;
const settle=async()=>{for(let i=0;i<80&&await page.locator('.dialog').count();i++){await page.keyboard.press('Enter');await page.waitForTimeout(80)}};
const resized=async(w,h)=>{
 await page.setViewportSize({width:w,height:h});
 await page.waitForFunction(([w,h])=>{const r=document.querySelector('#game-viewport')?.getBoundingClientRect();return r&&Math.abs(r.width-w)<.1&&Math.abs(r.height-h)<.1},[w,h]);
 await page.waitForTimeout(80);
};
async function boxes(selectors){return page.evaluate(selectors=>{
  const v=document.querySelector('#game-viewport'),r=v.getBoundingClientRect(),scale=r.height/v.clientHeight;
  return selectors.map(selector=>{
    const n=document.querySelector(selector);if(!n)throw new Error(`Missing ${selector}`);
    const b=n.getBoundingClientRect();
    return {selector,x:(b.x-r.x)/scale,y:(b.y-r.y)/scale,w:b.width/scale,h:b.height/scale,font:getComputedStyle(n).fontSize,scrollW:n.scrollWidth,clientW:n.clientWidth};
  });
},selectors)}
async function layouts(label,selectors,{portrait=true}={}){
  if(overlaysOnly&&!['card-reveal','phone-chat','ending'].includes(label))return;
  await resized(1280,720);const expected=await boxes(selectors);
  for(const [w,h] of sizes){
    await resized(w,h);const actual=await boxes(selectors);
    const surface=await page.locator('#game-viewport').evaluate(n=>({w:n.clientWidth,h:n.clientHeight}));
    for(let i=0;i<actual.length;i++){
      const n=actual[i];
      assert.equal(n.font,expected[i].font,`${label} ${w}: logical text size stays at desktop scale`);
      assert(n.x>=-.15&&n.y>=-.15&&n.x+n.w<=surface.w+1&&n.y+n.h<=surface.h+.2,`${label} ${w} ${n.selector} clipped: ${JSON.stringify(n)} within ${JSON.stringify(surface)}`);
      if(label==='hud'){
        assert(Math.abs(n.w-expected[i].w)<.12&&Math.abs(n.h-expected[i].h)<.12,'HUD size is constant; placement uses new width');
      }
    }
    const r=await page.locator('#game-viewport').boundingBox();
    assert(Math.abs(r.x)<.1&&Math.abs(r.y)<.1&&Math.abs(r.width-w)<.1&&Math.abs(r.height-h)<.1,`Full visible viewport, no bars: ${JSON.stringify(r)}`);
    if(label==='hud'){
      const c=await page.evaluate(()=>({aspect:window.__pokelove.overworld.camera.aspect,fov:window.__pokelove.overworld.camera.fov}));
      assert(Math.abs(c.aspect-w/h)<.001);assert.equal(c.fov,34);
    }
    if(label.endsWith('-arena')&&!label.startsWith('qishex')){
      const canvas=await page.locator('.storybook-host canvas').boundingBox();
      assert(Math.abs(canvas.width/canvas.height-16/9)<.001,'Boss physics arena remains 16:9');
      assert.deepEqual(await page.locator('.storybook-host canvas').evaluate(n=>[n.width,n.height]),[1280,720]);
      if(w/h>1.79)assert((await page.locator('.storybook-host').evaluate(n=>getComputedStyle(n).backgroundImage)).includes('/assets/mobile/'));
    }
    if([1280,844,568].includes(w))await page.screenshot({path:`${out}/${label}-${w}.png`});
  }
  if(portrait)for(const [w,h]of[[390,844],[320,568]]){
    await resized(w,h);
    for(const selector of selectors){const r=await page.locator(selector).first().boundingBox();assert(r&&r.x>=-1&&r.y>=-1&&r.x+r.width<=w+1&&r.y+r.height<=h+1,`${label} portrait ${w} ${selector}: ${JSON.stringify(r)}`);}
  }
  await resized(844,390);
  report.layouts.push({label,fullViewport:true,landscapeSizes:sizes.length,portraitSizes:portrait?2:0,desktopTextScale:true});
  console.log(`${label}: full viewport, fixed text scale, rotation passed`);
}

try{
  page=await browser.newPage({viewport:{width:1280,height:720},hasTouch:true,isMobile:true,deviceScaleFactor:1,serviceWorkers:'block'});
  page.on('pageerror',e=>report.errors.push(String(e)));
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.addInitScript(()=>localStorage.setItem('pokelove-save-v1',JSON.stringify({cards:[1,2,3,4,5,6,7,8],flags:{introSeen:true,endingSeen:true},vals:{},recordingMode:false,handedOver:[],zone:'bilik'})));
  // Hold one actual asset to inspect the startup view before the title exists.
  let release;const gate=new Promise(resolve=>release=resolve);
  await page.route('**/assets/models/house.glb',async route=>{await gate;await route.continue()});
  await page.goto(base,{waitUntil:'domcontentloaded'});
  await page.locator('.startup-content').waitFor();await page.evaluate(()=>document.fonts.ready);
  await layouts('loading',['.startup-content','.startup-mascot','.startup-track']);
  release();await page.locator('.press').waitFor({timeout:60000});
  await page.evaluate(()=>document.fonts.ready);
  await layouts('title',['.title-inner','.title-runner.qish','.title-runner.bowat']);
  if(await page.locator('.mobile-fullscreen:visible').count()){
    const button=await page.locator('.mobile-fullscreen').boundingBox();assert(button.width>=43.9&&button.height>=43.9);
    await page.locator('.mobile-fullscreen').tap();await page.waitForFunction(()=>!!document.fullscreenElement);
    assert.equal(await page.locator('.press').count(),1,'Fullscreen gesture does not also press Start');
    await page.evaluate(()=>document.exitFullscreen());await page.waitForFunction(()=>!document.fullscreenElement);
    report.fullscreenGesture=true;await resized(844,390);
  }

  await page.locator('.press').tap();await page.locator('.title-menu').waitFor();
  await layouts('menu',['.title-inner','.title-menu']);
  await page.getByRole('button',{name:/Sambung/}).tap();
  await page.locator('.hud:visible').waitFor();await page.waitForTimeout(4400);await settle();
  await page.evaluate(async()=>{
    const {setCollect}=await import('/src/ui/hud.ts');
    setCollect({icon:'/assets/storybook/item_cookie.png',name:'Cookies Bowat',got:3,need:6});
  });
  await layouts('hud',['.hud','.zone-label','.collect-hud']);
  if(!overlaysOnly&&!process.argv.includes('--no-world')){
    report.zones=[];
    for(const zone of ['labulanjut','sunway','galeri','dusun','angkasa','cosyplace','photobooth','bukit','sepang']){
      await page.evaluate(zone=>{void window.__pokelove.travel(zone,'start')},zone);
      await page.waitForFunction(zone=>window.__pokelove.overworld.currentZone===zone,zone);
      await page.waitForTimeout(3900);await settle();
      await page.screenshot({path:`${out}/world-${zone}.png`});
      assert(await page.evaluate(()=>window.__pokelove.overworld.camera.aspect>2.16),'World camera uses full phone width');
      report.zones.push(zone);
    }
    await page.evaluate(()=>{void window.__pokelove.travel('bilik','start')});await page.waitForTimeout(1200);await settle();
  }

  // Real analog joystick movement and release, using physical coordinates.
  await page.touchscreen.tap(420,190);await page.waitForTimeout(100);
  const stick=await page.locator('.touch .stick').boundingBox();
  const before=await page.evaluate(()=>window.__pokelove.overworld.player.group.position.x);
  const cdp=await page.context().newCDPSession(page);
  await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:stick.x+stick.width*.8,y:stick.y+stick.height/2}]});
  await page.waitForTimeout(350);
  await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
  await page.waitForTimeout(120);
  assert(await page.evaluate(()=>window.__pokelove.overworld.player.group.position.x)>before+.15,'Joystick really moves Qish');
  const axis=await page.evaluate(async()=>{return window.__pokelove.input.axis()});
  assert(Math.abs(axis.x)<.001&&Math.abs(axis.y)<.001,'Joystick releases cleanly');
  report.touch.push({joystickMovement:true,joystickRelease:true});
  await page.evaluate(()=>{void window.__pokelove.say([{who:'qish',text:'Faris hilang. Bowat pun hilang. Okay, jom cari sayang!',expression:'thinking'},{who:'faris',text:'Saya tunggu awak di luar.'}])});
  await page.locator('.dialog').waitFor();await page.waitForTimeout(1800);
  await layouts('dialog',['.dialog','.dialog .text','.vn-stage']);
  assert(await page.locator('.dialog .text').evaluate(n=>n.scrollHeight<=n.clientHeight+1));
  await settle();
  await page.evaluate(()=>{void window.__pokelove.myviTravel('bilik')});await page.locator('.travel-map').waitFor();
  await layouts('map',['.map-panel','.map-board','.map-destination']);
  await page.locator('.picker-close').tap();await page.locator('.game-picker').waitFor({state:'detached'});
  await page.evaluate(()=>{void window.__pokelove.replayConsole()});await page.locator('.boss-library').waitFor();
  await layouts('boss-library',['.boss-panel','.boss-grid']);
  assert.equal(await page.locator('.boss-choice').count(),8);
  await page.locator('.picker-close').tap();await page.locator('.game-picker').waitFor({state:'detached'});
  // Use the real framework, artwork and input handling for all eight arenas.
  for(const id of (overlaysOnly?[]:selectedBosses??['bowat','bolat','snorlax','blep','megabowat','bolatex','qishex','finale'])){
    await page.evaluate(id=>{void window.__pokelove.playBoss(id,{zone:'bilik',spawn:'start'})},id);
    await page.locator('.mg-intro').waitFor();
    await layouts(`${id}-intro`,['.mg-box','.mg-content']);
    await page.locator('.mg-go').tap();await page.locator('.mg-intro').waitFor({state:'detached'});await page.waitForTimeout(150);
    if(id==='qishex'){
      await layouts(`${id}-arena`,['.storybook-runner','.runner-hud'],{portrait:false});
      for(const [w,h]of[[844,390],[390,844],[568,320]]){
        await resized(w,h);const r=await page.locator('.storybook-runner').boundingBox();
        const s=Math.min(r.width/320,r.height/180),left=r.x+(r.width-320*s)/2,top=r.y+(r.height-180*s)/2;
        for(const lane of [0,2,1]){
          await page.touchscreen.tap(left+(lane+.5)*320/3*s,top+50*s);
          await page.waitForTimeout(80);assert.equal(await page.evaluate(()=>window.__qishRunner().lane),lane,`runner ${w} lane ${lane}`);
        }
      }
      report.touch.push({runnerThreeLanes:true,rotation:true});
    }else{
      await layouts(`${id}-arena`,['.storybook-host canvas'],{portrait:false});
      if(id==='bolatex'){
        await resized(568,320);
        await page.evaluate(async()=>{window.__pokelove.input.lastDevice='touch'});
        await page.waitForTimeout(80);
        const r=await page.locator('.storybook-host canvas').boundingBox();
        const controls=await page.locator('.touch .stick:visible,.touch .btn:visible').evaluateAll(nodes=>nodes.map(n=>n.getBoundingClientRect().toJSON()));
        for(const c of await page.evaluate(()=>window.__pokelove.activeMinigameScene().cards.map(c=>({x:c.c.x,y:c.c.y})))){
          const cx=r.x+c.x/1280*r.width,cy=r.y+c.y/720*r.height,halfW=62/1280*r.width,halfH=84/720*r.height;
          for(const b of controls)assert(cx+halfW<=b.x||cx-halfW>=b.right||cy+halfH<=b.y||cy-halfH>=b.bottom,'Touch controls do not cover memory cards');
        }
        report.touch.push({memoryGridClearOfControls:true,smallPhone:[568,320]});

        await page.evaluate(()=>{const scene=window.__pokelove.activeMinigameScene();scene.input.on('pointerdown',p=>window.__lastPointer={x:p.x,y:p.y})});
        for(const [w,h]of[[844,390],[390,844],[568,320]]){
          await resized(w,h);const r=await page.locator('.storybook-host canvas').boundingBox();
          await page.touchscreen.tap(r.x+433/1280*r.width,r.y+202/720*r.height);
          await page.waitForTimeout(120);
          const pointer=await page.evaluate(()=>window.__lastPointer);
          assert(Math.abs(pointer.x-433)<1&&Math.abs(pointer.y-202)<1,`Phaser touch after rotation: ${JSON.stringify(pointer)}`);
        }
        assert(await page.evaluate(()=>window.__pokelove.activeMinigameScene().cards[0].open),'Tapped first memory card opens');
        report.touch.push({phaserCardHit:true,rotationCoordinates:true});
      }
    }

    if(id==='finale'){
      await page.evaluate(()=>{window.__pokelove.input.lastDevice='touch'});
      for(let i=0;i<80&&!await page.locator('.finale-touch-menu:visible').count();i++){
        const r=await page.locator('.storybook-host canvas').boundingBox();await page.touchscreen.tap(r.x+r.width/2,r.y+r.height/2);await page.waitForTimeout(180);
      }
      await page.locator('.finale-touch-menu:visible').waitFor();
      assert(await page.locator('.finale-touch-menu button').evaluateAll(nodes=>nodes.every(n=>n.getBoundingClientRect().height>=43.9)));
      const menu=await page.locator('.finale-touch-menu').boundingBox();
      const hpBottom=await page.evaluate(()=>{const s=window.__pokelove.activeMinigameScene();const b=s.playerHpText.getBounds();const r=s.game.canvas.getBoundingClientRect();return r.y+b.bottom/720*r.height});
      assert(menu.y>=hpBottom+1,'Touch move menu stays below the player HP panel');
      const first=await page.locator('.finale-touch-menu button').nth(0).boundingBox();
      const fourth=await page.locator('.finale-touch-menu button').nth(3).boundingBox();assert(Math.abs(first.y-fourth.y)<1,'All four touch moves share one clear row');
      await page.screenshot({path:`${out}/finale-touch-moves.png`});
      const hp=await page.evaluate(()=>window.__pokelove.activeMinigameScene().enemyHp);
      await page.getByRole('button',{name:/Antek Giler/}).tap();
      for(let i=0;i<80&&(await page.evaluate(()=>window.__pokelove.activeMinigameScene().enemyHp))===hp;i++){
        const r=await page.locator('.storybook-host canvas').boundingBox();await page.touchscreen.tap(r.x+r.width/2,r.y+r.height/2);await page.waitForTimeout(120);
      }
      assert((await page.evaluate(()=>window.__pokelove.activeMinigameScene().enemyHp))<hp,'Native touch move actually damages the boss');
      report.touch.push({finaleNativeMoves:true,minTouchHeight:44,realDamage:true});
    }
    // End this isolated preview via the existing framework, then close the real reveal.
    await page.keyboard.press('Backquote');await page.getByRole('button',{name:/Menang boss sekarang/}).click();await page.getByRole('button',{name:'Tutup',exact:true}).click();
    for(let i=0;i<110&&await page.locator('.storybook-host').count();i++){
      await page.keyboard.press('Enter');await page.waitForTimeout(100);
    }
    await settle();
    // Finale normally starts the ending; the eight-card save uses a rematch instead.
    await page.locator('.storybook-host').waitFor({state:'detached'});
  }
  // Actual reusable overlay renderers also inherit the same viewport.
  await page.evaluate(async()=>{const {revealCard}=await import('/src/ui/cardReveal.ts');void revealCard(5)});
  await page.locator('.reveal').waitFor();await page.waitForTimeout(3300);
  await layouts('card-reveal',['.card-wrap','.reveal .caption']);
  await page.keyboard.press('Enter');await page.locator('.reveal').waitFor({state:'detached'});
  await page.evaluate(async()=>{const {showPhone}=await import('/src/ui/phone.ts');void showPhone('unanswered')});
  await page.locator('.phone-layer').waitFor();await page.waitForTimeout(1700);
  await layouts('phone-chat',['.phone','.phone-hint']);
  await page.locator('.phone-layer').tap();await page.locator('.phone-layer').waitFor({state:'detached'});
  await page.evaluate(async()=>{
    const {createEndScreen}=await import('/src/ending/endScreen.ts');
    const root=document.createElement('div');root.className='ending';root.append(createEndScreen());document.querySelector('#ui').append(root);
    await Promise.all([...root.querySelectorAll('img')].map(i=>i.decode()));
  });
  await layouts('ending',['.ending-message','.ending-logo','.ending-keepsake','.ending-continue']);
  // Emulate notch/home indicator while preserving the full background rectangle.
  await page.evaluate(()=>{document.querySelector('#safe-area-probe').style.padding='0px 44px 21px';window.dispatchEvent(new Event('resize'))});
  await page.waitForTimeout(200);
  const safeViewport=await page.locator('#game-viewport').boundingBox();
  assert(Math.abs(safeViewport.width-844)<.1&&Math.abs(safeViewport.height-390)<.1,'Background still fills notch/home-indicator regions');
  report.safeInsets={simulated:true,backgroundFullBleed:true};
  await page.evaluate(()=>{document.querySelector('#safe-area-probe').style.padding='';window.dispatchEvent(new Event('resize'))});
  assert.deepEqual(report.errors,[]);
  await rm(`${out}/failure.json`,{force:true});await rm(`${out}/failure.png`,{force:true});
  await writeFile(`${out}/${overlaysOnly?'overlay-':''}verification.json`,JSON.stringify(report,null,2));
  console.log('All landscape, rotation, touch and inset checks passed');
}catch(error){
  await page?.screenshot({path:`out/failure.png`.replace('out/',`${out}/`)}).catch(()=>{});
  await writeFile(`${out}/failure.json`,JSON.stringify({error:String(error),...report},null,2));throw error;
}finally{await browser.close()}
