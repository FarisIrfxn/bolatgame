// Repeated city switches: detect retained GPU allocations and closed model bitmaps.
import {writeFile,mkdir} from 'node:fs/promises';
const {chromium}=await import(process.env.PW_CORE??'/home/durioo/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core/index.mjs');
const out=process.env.AUDIT_OUT??'/tmp/qish-zone-memory';await mkdir(out,{recursive:true});
const browser=await chromium.launch({args:['--use-angle=vulkan','--enable-features=Vulkan','--ignore-gpu-blocklist']});
const rows=[],errors=[];
try{
  const page=await browser.newPage({viewport:{width:844,height:390},hasTouch:true,deviceScaleFactor:3});
  page.on('pageerror',e=>errors.push(String(e)));
  page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});
  await page.goto(process.env.GAME_URL??'http://127.0.0.1:5181/');
  await page.waitForFunction(()=>window.__pokelove&&!document.querySelector('.startup-loading'),null,{timeout:120000});
  await page.evaluate(()=>{const s=window.__pokelove.save;s.data.cards=[];s.data.flags={introSeen:true,bbSpray:true};});
  for(let cycle=0;cycle<3;cycle++)for(const id of ['labulanjut','sunway','galeri']){
    const row=await page.evaluate(async({id,cycle})=>{
      const p=window.__pokelove;await p.loadZone(id,'start');
      await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));
      const w=p.overworld,r=w.renderer,closed=[];let maps=0;
      w.zoneRoot.traverse(o=>{
        const mats=o.material?(Array.isArray(o.material)?o.material:[o.material]):[];
        for(const m of mats)for(const key of ['map','emissiveMap','alphaMap']){
          const t=m[key];if(!t)continue;maps++;
          if(t.image&&'width' in t.image&&t.image.width===0)closed.push({material:m.name||m.type,key});
        }
      });
      return{id,cycle,textures:r.info.memory.textures,geometries:r.info.memory.geometries,maps,closed,modelState:w.modelState()};
    },{id,cycle});
    rows.push(row);console.log(JSON.stringify({cycle,id,textures:row.textures,geometries:row.geometries,maps:row.maps,closed:row.closed.length}));
  }
  await writeFile(`${out}/report.json`,JSON.stringify({rows,errors},null,2));
  if(errors.length||rows.some(x=>x.closed.length))throw Error(`zone errors: ${errors.length}; closed textures: ${rows.flatMap(x=>x.closed).length}`);
}finally{await browser.close()}
