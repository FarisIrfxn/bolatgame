import {openZone,teleport} from './lib.mjs';
const {browser,page,errors}=await openZone('sunway');
const spots=[['sunway',31,20],['bilik',-1,0],['labulanjut',0,0],['galeri',-1,1],['dusun',-2,5],['angkasa',9,3],['cosyplace',-12,0],['bukit',0,24],['sepang',0,-15]];
for(const [id,x,z] of spots){
 await page.evaluate(async id=>{const {ZONES}=await import('/src/zones/zones.ts');await window.__overworld.loadZone(ZONES[id],'start');},id);
 await teleport(page,x,z);
 await page.screenshot({path:`art/playtest-qc/before/${id}.png`});
 console.log(id);
}
console.log(JSON.stringify({errors}));await browser.close();
