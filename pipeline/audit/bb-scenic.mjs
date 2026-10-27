// Dev server: GPU-backed desktop measurements, not an iPhone FPS benchmark.
import {writeFile, mkdir} from 'node:fs/promises';
const {chromium} = await import(process.env.PW_CORE ?? '/home/durioo/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core/index.mjs');
const out=process.env.AUDIT_OUT ?? '/tmp/qish-bb-scenic';
await mkdir(out,{recursive:true});
const browser=await chromium.launch({args:['--use-angle=vulkan','--enable-features=Vulkan','--ignore-gpu-blocklist']});
const report=[];
try {
  for(const [layout,width,height,touch] of [['landscape',844,390,true],['portrait',390,844,true],['desktop',1280,720,false]]) {
    const context=await browser.newContext({viewport:{width,height},hasTouch:touch,deviceScaleFactor:touch?3:1});
    const page=await context.newPage();const errors=[];
    page.on('pageerror',error=>errors.push(String(error)));
    page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
    await page.goto(process.env.GAME_URL ?? 'http://127.0.0.1:5181/');
    await page.waitForFunction(()=>window.__pokelove&&!document.querySelector('.startup-loading'),null,{timeout:120000});
    await page.evaluate(async ()=>{
      const {save,loadZone,overworld:ow}=window.__pokelove;
      save.data.cards=[];save.data.flags={introSeen:true,bbArrived:true,bbSpray:true};
      await loadZone('sunway','start');ow.stopLoop?.();ow.stopLoop=null;ow.lock();
      ow.renderer.info.autoReset=false;
    });
    const cases=[];
    for(const variant of ['normal','scenic','no-shadows','no-screens','no-skyline']) {
      const sample=await page.evaluate(async variant=>{
        const ow=window.__overworld,r=ow.renderer;
        const skyline=ow.zoneRoot.children.find(o=>o.children.some(m=>{
          if(!m.geometry)return false;m.geometry.computeBoundingBox();
          return m.geometry.boundingBox.max.x-m.geometry.boundingBox.min.x>=500;
        }));
        const animations=ow.animated;
        const sun=r.shadowMap.enabled;
        const faders=ow.faders;
        const sc=ow.sun.shadow.camera;
        if(variant==='no-shadows')r.shadowMap.enabled=false;
        if(variant==='no-screens')ow.animated=animations.filter(fn=>!fn.toString().includes('corner.update')&&!fn.toString().includes('s.update'));
        if(variant==='no-skyline'&&skyline)skyline.visible=false;
        if(variant==='no-fade')ow.faders=[];
        ow.placePlayer(0,variant==='normal'?12:20.6,'back');
        const live=new Set();ow.zoneRoot.traverse(o=>{
          const mats=Array.isArray(o.material)?o.material:[o.material];
          for(const m of mats)if(m?.map?.image instanceof HTMLCanvasElement&&(
            m.map.image.width===1024&&m.map.image.height===288||
            m.map.image.width===768&&(m.map.image.height===384||m.map.image.height===96)
          ))live.add(m.map);
        });
        const versions=new Map([...live].map(t=>[t,t.version]));
        const gl=r.getContext(),times=[],calls=[],triangles=[];
        let coldMs=0;
        for(let frame=0;frame<34;frame++) {
          await new Promise(resolve=>requestAnimationFrame(resolve));
          r.info.reset();const start=performance.now();ow.update(1/60,performance.now()/1000);gl.finish();
          const elapsed=performance.now()-start;
          if(frame===0)coldMs=elapsed;
          if(frame>=10){times.push(elapsed);calls.push(r.info.render.calls);triangles.push(r.info.render.triangles);}
        }
        times.sort((a,b)=>a-b);
        const result={variant,coldMs:Math.round(coldMs),medianMs:+times[12].toFixed(2),p95Ms:+times[22].toFixed(2),calls:Math.max(...calls),triangles:Math.max(...triangles),textures:r.info.memory.textures,programs:r.info.programs.length,buffer:[r.domElement.width,r.domElement.height],fading:faders.filter(f=>f.k<.995).length,shadowRadius:+sc.right.toFixed(1),liveScreens:live.size,screenUpdates:[...live].reduce((n,t)=>n+t.version-versions.get(t),0)};
        r.shadowMap.enabled=sun;ow.animated=animations;ow.faders=faders;if(skyline)skyline.visible=true;
        return result;
      },variant);
      cases.push(sample);console.log(JSON.stringify({layout,...sample}));
      if(variant==='scenic')await page.screenshot({path:`${out}/${layout}.png`});
    }
    report.push({layout,cases,errors});await context.close();
  }
  await writeFile(`${out}/report.json`,JSON.stringify(report,null,2));
}finally{await browser.close();}
