// Isolate the work of BB traffic, crowd, screens and shadows in a touch browser.
import {writeFile,mkdir} from 'node:fs/promises';
const {chromium}=await import(process.env.PW_CORE??'/home/durioo/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core/index.mjs');
const out=process.env.AUDIT_OUT??'/tmp/qish-bb-load';await mkdir(out,{recursive:true});
const browser=await chromium.launch({args:['--use-angle=vulkan','--enable-features=Vulkan','--ignore-gpu-blocklist']});
const rows=[];
try{
  for(const [layout,width,height] of [['landscape',844,390],['portrait',390,844]]){
    const context=await browser.newContext({viewport:{width,height},hasTouch:true,deviceScaleFactor:3});
    const page=await context.newPage();const errors=[];
    page.on('pageerror',e=>errors.push(String(e)));
    page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});
    await page.goto(process.env.GAME_URL??'http://127.0.0.1:5181/');
    await page.waitForFunction(()=>window.__pokelove&&!document.querySelector('.startup-loading'),null,{timeout:120000});
    await page.evaluate(async()=>{const p=window.__pokelove;p.save.data.cards=[];p.save.data.flags={introSeen:true,bbSpray:true};await p.loadZone('sunway','start');p.overworld.stopLoop?.();p.overworld.stopLoop=null;p.overworld.lock();p.overworld.renderer.info.autoReset=false;});
    for(const [spot,x,z] of [['junction',0,4],['promenade',0,22]]){
      for(const variant of ['all','no-traffic','no-crowd','no-shadows','no-screens','no-traffic-crowd']){
        const result=await page.evaluate(async({spot,x,z,variant})=>{
          const w=window.__pokelove.overworld,b=window.__bb,r=w.renderer,gl=r.getContext();
          const old=w.animated,shadow=r.shadowMap.enabled;
          const traffic=variant.includes('traffic'),crowd=variant.includes('crowd'),screens=variant==='no-screens';
          if(traffic)b.trafficGroup.visible=false;
          if(crowd)b.crowdGroup.visible=false;
          if(screens)b.screenGroup.visible=false;
          if(variant==='no-shadows')r.shadowMap.enabled=false;
          w.animated=old.filter(fn=>!(traffic&&fn===b.trafficUpdate)&&!(crowd&&fn===b.crowdUpdate)&&!(screens&&fn===b.screenUpdate));
          w.placePlayer(x,z,'back');
          const times=[],calls=[],triangles=[];
          for(let i=0;i<40;i++){
            await new Promise(resolve=>requestAnimationFrame(resolve));
            r.info.reset();const start=performance.now();w.update(1/60,performance.now()/1000);gl.finish();
            if(i>=8){times.push(performance.now()-start);calls.push(r.info.render.calls);triangles.push(r.info.render.triangles)}
          }
          const meanMs=times.reduce((n,t)=>n+t,0)/times.length;
          times.sort((a,b)=>a-b);
          const row={spot,variant,meanMs:+meanMs.toFixed(2),medianMs:+times[16].toFixed(2),p95Ms:+times[30].toFixed(2),calls:Math.max(...calls),triangles:Math.max(...triangles),textures:r.info.memory.textures};
          w.animated=old;r.shadowMap.enabled=shadow;b.trafficGroup.visible=b.crowdGroup.visible=b.screenGroup.visible=true;
          return row;
        },{spot,x,z,variant});
        rows.push({layout,...result});console.log(JSON.stringify({layout,...result}));
      }
    }
    if(errors.length)throw Error(`${layout}: ${errors.join('\n')}`);
    await context.close();
  }
  await writeFile(`${out}/report.json`,JSON.stringify(rows,null,2));
}finally{await browser.close()}
