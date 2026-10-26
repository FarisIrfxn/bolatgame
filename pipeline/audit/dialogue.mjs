// Regression audit for clipped NPC bubbles and long dialogue; isolated browser saves.
import assert from 'node:assert/strict';
import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
const require = createRequire(new URL('../../game/package.json', import.meta.url));
const ts = require('typescript');
const { chromium } = await import(process.env.PW_CORE ?? '/home/durioo/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core/index.mjs');
const out = 'art/style/dialogue';
await mkdir(out, { recursive: true });
const barks = new Set();
const lines = [];
const visit = (n, fn) => { fn(n); ts.forEachChild(n, c => visit(c, fn)); };
const strings = n => {
  const values = [];
  visit(n, x => { if (ts.isStringLiteral(x) && !(ts.isPropertyAssignment(x.parent) && x === x.parent.name)) values.push(x.text); });
  return values;
};
for (const name of (await readdir('game/src/zones')).filter(n => n.endsWith('.ts'))) {
  const sf = ts.createSourceFile(name, await readFile(`game/src/zones/${name}`, 'utf8'), ts.ScriptTarget.Latest, true);
  visit(sf, n => {
    if (ts.isVariableDeclaration(n) && /BARK|(?:^|_)LINES$/.test(n.name.getText()) && n.initializer)
      strings(n.initializer).forEach(t => barks.add(t));
    if (ts.isPropertyAssignment(n) && ['lines','walk','jog','bike','pass','buddy'].includes(n.name.getText()) && ts.isArrayLiteralExpression(n.initializer))
      strings(n.initializer).forEach(t => barks.add(t));
    if (ts.isCallExpression(n) && /\.say$|^diners$/.test(n.expression.getText()))
      strings(n).filter(t => !t.startsWith('#')).forEach(t => barks.add(t));
  });
}
for (const name of ['script','ending']) {
  const sf = ts.createSourceFile(name, await readFile(`game/src/content/${name}.ts`, 'utf8'), ts.ScriptTarget.Latest, true);
  visit(sf, n => {
    if (!ts.isObjectLiteralExpression(n)) return;
    const who = n.properties.find(p => p.name?.getText() === 'who');
    const text = n.properties.find(p => p.name?.getText() === 'text');
    if (who && text && ts.isStringLiteral(text.initializer)) lines.push({ who: who.initializer.text, text: text.initializer.text });
  });
}
lines.sort((a,b) => b.text.length - a.text.length);
const browser = await chromium.launch({ args: ['--use-angle=vulkan','--enable-features=Vulkan','--ignore-gpu-blocklist'] });
const report = [];
try {
  for (const [name,width,height] of [['desktop',1280,720],['phone',390,844],['landscape',844,390],['small-phone',320,568]]) {
    const page = await browser.newPage({ viewport: { width,height } });
    const errors = [];
    page.on('pageerror', e => {errors.push(String(e));console.error(`${name}: ${e}`);});
    await page.addInitScript(() => localStorage.setItem('pokelove-save-v1',JSON.stringify({ cards: [], flags: {introSeen:true}, vals:{}, recordingMode:false, handedOver:[], zone:'bilik' })));
    await page.goto(process.env.GAME_URL ?? 'http://localhost:5181/',{waitUntil:'networkidle'});
    await page.evaluate(() => document.fonts.ready);
    await page.locator('.press').click().catch(async error => {
      await page.screenshot({path:`${out}/${name}-load-failure.png`});
      console.error(await page.locator('body').innerText());
      throw error;
    });
    await page.getByRole('button',{name:/Sambung/}).click();
    await page.waitForFunction(() => !!window.__pokelove?.overworld);
    await page.waitForTimeout(1500);
    const bubble = await page.evaluate(async texts => {
      const {bubbleTex,setBubbleText,speechDuration} = await import('/src/ui/speechBubble.ts');
      const THREE = await import('/node_modules/.vite/deps/three.js');
      const draw = CanvasRenderingContext2D.prototype.fillText;
      const ink = [];
      CanvasRenderingContext2D.prototype.fillText = function(text,x,y,...rest) {
        const m = this.measureText(text);
        ink.push({text,x,y,left:x-m.actualBoundingBoxLeft,right:x+m.actualBoundingBoxRight,top:y-m.actualBoundingBoxAscent,bottom:y+m.actualBoundingBoxDescent,w:this.canvas.width,h:this.canvas.height});
        return draw.call(this,text,x,y,...rest);
      };
      const previews = [];
      try {
        for (const text of [...texts,'SUPERPANJANGTANPARUANG'.repeat(4),'Baris pertama\nBaris kedua']) {
          const start = ink.length;
          const tex = bubbleTex(text);
          const image = tex.image;
          const rendered = ink.slice(start);
          // Previously used textures are cached, so fresh draws alone are instrumented.
          if (rendered.length) {
            if (rendered.some(r => r.left<3 || r.right>r.w-3 || r.top<6 || r.bottom>r.h-28)) throw Error(`Clipped glyphs: ${text}`);
            if (rendered.map(r=>r.text).join('').replace(/\s/g,'') !== text.replace(/\s/g,'')) throw Error(`Missing text: ${text}`);
          }
          const sprite = new THREE.Sprite(); sprite.scale.set(2.7,.81,1);
          setBubbleText(sprite,text);
          if (Math.abs(sprite.scale.y/sprite.scale.x-image.height/image.width)>1e-6) throw Error(`Distorted bubble: ${text}`);
          if (Math.abs(sprite.center.y*sprite.scale.y-.405)>1e-6) throw Error(`Moving tail: ${text}`);
          if (speechDuration(text,1.8)<Math.max(1.8,text.length/18)) throw Error('Reading time too short');
          if (previews.length<8 && image.height>96) previews.push({text,src:image.toDataURL()});
        }
      } finally {CanvasRenderingContext2D.prototype.fillText=draw;}
      window.__bubblePreviews=previews;
      return {checked:texts.length,drawnLines:ink.length,wrappedExamples:previews.map(p=>p.text)};
    },[...barks].sort((a,b)=>b.length-a.length));

    const inputText = (lines[0].text+' ').repeat(10)+'🌸 TAMAT AYAT.';
    await page.evaluate(text => { window.__dialogDone=false; void window.__pokelove.say([{who:'maitre',text}]).then(()=>window.__dialogDone=true); },inputText);
    const pages=[];
    for(let i=0;i<40;i++) {
      await page.locator('.dialog .text').waitFor();
      if (!await page.locator('.dialog .next').count()) await page.locator('.dialog .box').click();
      await page.locator('.dialog .next').waitFor();
      const result=await page.locator('.dialog').evaluate(root=>{
        const text=root.querySelector('.text'),r=root.getBoundingClientRect(),t=text.getBoundingClientRect(),next=root.querySelector('.next').getBoundingClientRect();
        return {text:text.textContent,fits:text.scrollHeight<=text.clientHeight+1 && text.scrollWidth<=text.clientWidth+1,inside:r.x>=0&&r.y>=20&&r.right<=innerWidth&&r.bottom<=innerHeight,footer:t.bottom<=next.top+1,textBottom:t.bottom,footerTop:next.top};
      });
      if(!result.fits||!result.inside||!result.footer)await page.screenshot({path:`${out}/${name}-clipping.png`});
      assert(result.fits&&result.inside&&result.footer,`${name}: clipping ${JSON.stringify(result)}`);
      pages.push(result.text);
      if(i===0) await page.screenshot({path:`${out}/${name}-long-dialogue.png`});
      const footer = await page.locator('.dialog .next').elementHandle();
      await page.locator('.dialog .next').click();
      await page.waitForFunction(el => !el.isConnected,footer);
      await page.waitForTimeout(150);
      if(await page.evaluate(()=>window.__dialogDone))break;
    }
    assert.equal(pages.join(''),inputText,`${name}: pagination preserves every character`);
    assert(pages.length>1,'Long dialogue paginates');
    assert(await page.evaluate(()=>window.__dialogDone),'Dialogue completes');
    await page.evaluate(async text => {
      const {ask}=await import('/src/ui/dialog.ts');
      window.__answer=-1;void ask({who:'kaktiket',text},['Jom!','Nanti dulu']).then(n=>window.__answer=n);
    },inputText);
    for(let i=0;i<80 && !await page.locator('.choices').count();i++) {
      if (await page.locator('.dialog .box').count()) await page.locator('.dialog .box').click();
      await page.waitForTimeout(150);
    }
    await page.locator('.choices').waitFor();
    assert.equal(await page.evaluate(()=>window.__answer),-1,'Choices wait for player');
    await page.getByRole('button',{name:'Nanti dulu',exact:true}).click();
    await page.waitForFunction(()=>window.__answer===1);
    // Render representative wrapped canvases large enough to inspect their glyphs.
    if(name==='desktop') {
      await page.evaluate(()=>{
        const panel=document.createElement('div');panel.id='bubble-proof';
        panel.style.cssText='position:fixed;inset:0;background:#f7e7ee;z-index:1000;display:grid;grid-template-columns:repeat(4,320px);align-content:start;overflow:auto';
        for(const p of window.__bubblePreviews){const item=document.createElement('div');const img=document.createElement('img');img.src=p.src;img.style.width='320px';item.append(img);panel.append(item);}
        document.body.append(panel);
      });
      await page.screenshot({path:`${out}/wrapped-npc-bubbles.png`});
    }
    assert.deepEqual(errors,[],`${name}: browser errors`);
    report.push({viewport:name,bubble,pages:pages.length,exactText:true,choices:true,errors});
    console.log(`${name}: ${bubble.checked} NPC texts fit, ${pages.length} dialogue pages preserved`);
    await page.close();
  }
  await writeFile(`${out}/verification.json`,JSON.stringify(report,null,2));
} finally {await browser.close();}
