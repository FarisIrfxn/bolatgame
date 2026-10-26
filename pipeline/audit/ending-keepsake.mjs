// Focused QA of the exact final screen used by playEnding; no unrelated boss checks.
import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
const {chromium}=await import(process.env.PW_CORE??'/home/durioo/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core/index.mjs');
const out='art/ending-keepsake-2026-10-27';await mkdir(out,{recursive:true});
const browser=await chromium.launch({args:['--use-angle=vulkan','--enable-features=Vulkan','--ignore-gpu-blocklist']});
const report=[];
try{
 for(const [name,width,height,touch] of [['desktop',1280,720,false],['phone',390,844,true],['landscape',844,390,true],['small-phone',320,568,true]]){
  const page=await browser.newPage({viewport:{width,height},hasTouch:touch,isMobile:touch});
  const errors=[];page.on('pageerror',e=>errors.push(String(e)));
  await page.route('**/src/boot.ts',route=>route.fulfill({contentType:'text/javascript',body:`
    import '/src/style.css'; import '/src/ui/theme.css'; import '/src/ui/dialogue.css';
    import '/src/ui/paper.css'; import '/src/ui/adventure-hud.css'; import '/src/ui/navigation.css';
    import '/src/ui/qc.css'; window.__endingPreviewReady=true;
  `}));
  await page.goto(process.env.GAME_URL??'http://localhost:5182/',{waitUntil:'networkidle'});
  await page.waitForFunction(()=>window.__endingPreviewReady);
  await page.evaluate(async()=>{
   const {createEndScreen}=await import('/src/ending/endScreen.ts');
   const {el,ui}=await import('/src/ui/dom.ts');
   document.querySelector('.title-screen')?.remove();
   const root=el('div','ending');root.append(createEndScreen());ui().append(root);
   await Promise.all([...root.querySelectorAll('img')].map(img=>img.decode()));
   await document.fonts.ready;
   window.__continueClicked=0;root.querySelector('button').addEventListener('click',()=>window.__continueClicked++);
  });
  await page.waitForTimeout(950);
  if(errors.length)console.log(name,'browser errors',errors);
  const data=await page.evaluate(()=>{
   const selectors=['.ending-message','.ending-logo','.ending-keepsake','.ending-word','.ending-greeting','.ending-continue'];
   const boxes=selectors.map(selector=>{const node=document.querySelector(selector),r=node.getBoundingClientRect(),s=getComputedStyle(node);return{selector,x:r.x,y:r.y,w:r.width,h:r.height,scrollW:node.scrollWidth,clientW:node.clientWidth,scrollH:node.scrollHeight,clientH:node.clientHeight,color:s.color,background:s.backgroundColor,opacity:s.opacity}});
   const rgb=value=>value.match(/[\d.]+/g).slice(0,3).map(Number);
   const luma=color=>rgb(color).map(c=>{c/=255;return c<=.04045?c/12.92:((c+.055)/1.055)**2.4}).reduce((sum,c,i)=>sum+c*[.2126,.7152,.0722][i],0);
   const ratio=(a,b)=>{const x=luma(a),y=luma(b);return(Math.max(x,y)+.05)/(Math.min(x,y)+.05)};
   const stops=selector=>[...getComputedStyle(document.querySelector(selector)).backgroundImage.matchAll(/rgb\([^)]+\)/g)].map(m=>m[0]);
   const ink=selector=>getComputedStyle(document.querySelector(selector)).color;
   const contrast={
    title:Math.min(...stops('.ending-keepsake').map(bg=>ratio(ink('.ending-word h1'),bg))),
    greeting:Math.min(...stops('.ending-keepsake').map(bg=>ratio(ink('.ending-greeting'),bg))),
    action:Math.min(...stops('.ending-continue').map(bg=>ratio(ink('.ending-continue'),bg))),
   };
   return{boxes,contrast,poster:document.querySelector('.ending-poster').getAttribute('src'),label:document.querySelector('button').innerText};
  });
  for(const b of data.boxes){assert(b.x>=-1&&b.y>=-1&&b.x+b.w<=width+1&&b.y+b.h<=height+1,`${name} ${b.selector} outside viewport ${JSON.stringify(b)}`);if(b.selector!=='.ending-message')assert(b.scrollW<=b.clientW+1,`${name} horizontal text overflow ${b.selector}`)}
  for(const [label,ratio] of Object.entries(data.contrast))assert(ratio>=4.5,`${name} ${label} contrast ${ratio}`);
  const card=data.boxes.find(b=>b.selector==='.ending-keepsake'),logo=data.boxes.find(b=>b.selector==='.ending-logo');
  assert(logo.y+logo.h<=card.y+1,'Logo and message panel do not overlap');
  assert.equal(data.boxes.find(b=>b.selector==='.ending-continue').opacity,'1','Button text stays fully visible');
  await page.screenshot({path:`${out}/${name}.png`});
  if(touch)await page.locator('.ending-continue').tap();else await page.locator('.ending-continue').click();
  assert.equal(await page.evaluate(()=>window.__continueClicked),1,'Click/tap activates the actual button');
  if(!touch){await page.locator('.ending-continue').focus();await page.keyboard.press('Enter');assert.equal(await page.evaluate(()=>window.__continueClicked),2,'Keyboard activates the semantic button')}
  assert.deepEqual(errors,[]);report.push({name,...data,errors});console.log(name,'ending keepsake passed');await page.close();
 }
 await writeFile(`${out}/verification.json`,JSON.stringify(report,null,2));
}finally{await browser.close()}
