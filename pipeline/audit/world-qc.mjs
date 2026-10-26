// Regression audit for the 2026-10-26 world QC: camera framing, Myvi access, boat and zone layouts.
import assert from 'node:assert/strict';
import { mkdir, writeFile, readFile } from 'node:fs/promises';
import { openZone, teleport } from './lib.mjs';
const out='art/style/world-qc';await mkdir(out,{recursive:true});
const flags={introSeen:true,bbArrived:true,tasikArrived:true,nyomArrived:true,pbArrived:true,pjArrived:true,spArrived:true,sampanTip:true,bowatJoined:true};
const selected=process.argv.slice(2);
const report=selected.length?JSON.parse(await readFile(`${out}/verification.json`,'utf8').catch(()=>'[]')):[];
for(const zone of selected.length?selected:['sunway','dusun','cosyplace','photobooth','bukit','sepang','galeri','angkasa','labulanjut']){
 const{browser,page,errors}=await openZone(zone,{width:1280,height:720,noMerge:true,save:{flags}});
 await page.evaluate(()=>window.__overworld.lock());
 const layout=await page.evaluate(()=>{
  const o=window.__overworld, start=o.zone.spawns.start.slice(0,2), step=.35;
  const key=(x,z)=>`${Math.round(x/step)},${Math.round(z/step)}`;
  // Flood from a free point near the entrance; this measures real bounds, regions and colliders.
  const seed=[Math.round(start[0]/step)*step,Math.round(start[1]/step)*step];
  const seen=new Set([key(...seed)]),stack=[seed],reached=new Set(),access=new Set();
  while(stack.length&&seen.size<160000){
   const[x,z]=stack.pop();
   for(const e of o.exits)if(x>e.box[0]&&x<e.box[2]&&z>e.box[1]&&z<e.box[3])reached.add(e.id);
   for(const it of o.interactables)if(Math.hypot(it.pos.x-x,it.pos.z-z)<it.range)access.add(it.id);
   for(const[dx,dz]of[[step,0],[-step,0],[0,step],[0,-step]]){
    const nx=x+dx,nz=z+dz,k=key(nx,nz);if(seen.has(k)||o.blocked(nx,nz))continue;seen.add(k);stack.push([nx,nz]);
   }
  }
  const models=[];o.zoneRoot.traverse(g=>{if(g.userData.model)models.push(g.userData.model);});
  const spawns=Object.entries(o.zone.spawns).filter(([id])=>id!=='boss').map(([id,[x,z]])=>({id,x,z,blocked:o.blocked(x,z)}));
  const unreachable=o.pickups.filter(p=>{
   for(let rr=0;rr<.92;rr+=.15)for(let k=0;k<16;k++)if(!o.blocked(p.pos.x+Math.cos(k/16*Math.PI*2)*rr,p.pos.z+Math.sin(k/16*Math.PI*2)*rr))return false;
   return true;
  }).map(p=>p.id);
  return{zone:o.zone.id,cells:seen.size,spawns,reached:[...reached],exits:o.exits.map(e=>e.id),myviReachable:access.has('myvi'),unreachable,models};
 });
 assert.equal(layout.zone,zone);assert.equal(errors.length,0,errors.join('\n'));
 assert(layout.myviReachable,`${zone}: Myvi reachable from entrance`);
 assert(!layout.spawns.some(s=>s.id==='myvi'&&s.blocked),`${zone}: Myvi arrival free`);
 if(zone==='sunway')assert(!layout.models.some(id=>['bb_mrt','bb_monorail','bb_monorail_station','bb_shawarma','bb_burger'].includes(id)));
 if(zone==='sepang')assert(layout.models.filter(id=>id==='bb_car_red'||id==='bb_car_green').length>30);
 if(zone==='cosyplace')assert(layout.models.includes('bb_car_red'));
 if(zone==='sunway'||zone==='dusun'){
  const z=zone==='sunway'?28.4:21.8;
  for(const[width,height]of[[1280,720],[1920,1080],[844,390],[390,844]]){
   await page.setViewportSize({width,height});await teleport(page,0,z-6);
   // Walk down with the real controls, rather than resetting the camera by teleporting to the edge.
   await page.evaluate(()=>window.__overworld.unlock());await page.keyboard.down('ArrowDown');await page.waitForTimeout(1600);await page.keyboard.up('ArrowDown');await page.evaluate(()=>window.__overworld.lock());await page.waitForTimeout(1600);
   const frame=await page.evaluate(()=>{const o=window.__overworld;return[.1,2.25].map(y=>{const p=o.player.group.position.clone();p.y+=y;return p.project(o.camera).toArray();});});
   for(const p of frame)assert(Math.abs(p[0])<.92&&Math.abs(p[1])<.92,`${zone} ${width}: Qish visible ${JSON.stringify(frame)}`);
   await page.screenshot({path:`${out}/camera-${zone}-${width}.png`});
  }
  await page.setViewportSize({width:1280,height:720});
 }
 if(zone==='dusun'){
  await teleport(page,-2.2,3.7);await page.evaluate(()=>{void window.__pokelove.boardSampan();});await page.waitForTimeout(700);
  await page.evaluate(()=>window.__overworld.unlock());await page.keyboard.down('ArrowUp');await page.waitForTimeout(1600);await page.keyboard.up('ArrowUp');await page.evaluate(()=>window.__overworld.lock());
  const ride=await page.evaluate(()=>{const o=window.__overworld;return{riding:!!o.ride,canGo:o.ride?.canGo(o.player.group.position.x,o.player.group.position.z),pos:o.player.group.position.toArray()};});
  assert(ride.riding&&ride.canGo);await page.screenshot({path:`${out}/boat-riding.png`});layout.ride=ride;
 }
 const points={sunway:[[0,-16],[31,21.4],[-17.5,4.6]],dusun:[[-2.2,3.7],[.4,-14.4]],cosyplace:[[-15,9]],photobooth:[[24,10],[-24,-4]],bukit:[[0,22],[18,-7],[-11,18],[0,-3]],sepang:[[-33,30]],galeri:[[-19,0]],angkasa:[[0,5]],labulanjut:[[-10,5]]}[zone];
 if(zone==='dusun')await page.evaluate(()=>{window.__overworld.setRide(null);});
 for(const[i,[x,z]]of points.entries()){await teleport(page,x,z);await page.screenshot({path:`${out}/final-${zone}-${i}.png`});}
 const old=report.findIndex(z=>z.zone===zone);if(old>=0)report.splice(old,1);report.push({...layout,errors});await writeFile(`${out}/verification.json`,JSON.stringify(report,null,2));
 console.log(zone,JSON.stringify({cells:layout.cells,spawns:layout.spawns,exits:layout.reached,unreachable:layout.unreachable}));await browser.close();
}
console.log('World QC passed');
