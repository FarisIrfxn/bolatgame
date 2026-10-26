// Automated layout checks for one zone. Run after every change to a zone.
//   node check.mjs --zone labulanjut [--from 0,2] [--exit west]
//
//  1. page errors while building
//  2. pickups no walkable point can reach (sampan-only pickups like Tasik Lily's lilies are expected)
//  3. generated models whose footprints overlap (trees shrunk to their trunks), and models standing
//     on a road box given with --roads "x0,z0,x1,z1;..."
//  4. flood fill from --from: which exits Qish can walk into right now (a closed exit she can
//     reach means she can get pushed back into a collider: the "stuck after dialog" bug)
import { args, openZone } from "./lib.mjs";

const a = args();
const zone = a.zone ?? "labulanjut";
const from = String(a.from ?? "0,2").split(",").map(Number);
const roads = a.roads ? String(a.roads).split(";").map((r) => r.split(",").map(Number)) : [];

const { browser, page, errors } = await openZone(zone, { noMerge: true, save: a.save ? JSON.parse(a.save) : null });
const r = await page.evaluate(([from]) => {
  const ow = window.__overworld;
  // Pickups.
  const unreachable = [];
  for (const p of ow.pickups) {
    let ok = false;
    for (let rr = 0; rr <= 0.9 && !ok; rr += 0.15)
      for (let k = 0; k < 16 && !ok; k++) if (!ow.blocked(p.pos.x + Math.cos((k / 16) * 6.283) * rr, p.pos.z + Math.sin((k / 16) * 6.283) * rr)) ok = true;
    if (!ok) unreachable.push([p.id, +p.pos.x.toFixed(1), +p.pos.z.toFixed(1)]);
  }
  // Model footprints.
  const models = [];
  ow.zoneRoot.updateMatrixWorld(true);
  ow.zoneRoot.traverse((o) => {
    if (!o.userData.model) return;
    const box = { x0: Infinity, z0: Infinity, x1: -Infinity, z1: -Infinity };
    o.traverse((m) => {
      if (!m.isMesh) return;
      m.geometry.computeBoundingBox();
      const bb = m.geometry.boundingBox.clone().applyMatrix4(m.matrixWorld);
      box.x0 = Math.min(box.x0, bb.min.x);
      box.z0 = Math.min(box.z0, bb.min.z);
      box.x1 = Math.max(box.x1, bb.max.x);
      box.z1 = Math.max(box.z1, bb.max.z);
    });
    models.push({ id: o.userData.model, ...box });
  });
  // Flood fill.
  const step = 0.25;
  const seen = new Set();
  const q = [from];
  const reached = new Set();
  while (q.length && seen.size < 300000) {
    const [x, z] = q.pop();
    for (const [dx, dz] of [[step, 0], [-step, 0], [0, step], [0, -step]]) {
      const nx = x + dx;
      const nz = z + dz;
      const k = `${Math.round(nx / step)},${Math.round(nz / step)}`;
      if (seen.has(k) || ow.blocked(nx, nz)) continue;
      seen.add(k);
      for (const e of ow.exits) if (nx > e.box[0] && nx < e.box[2] && nz > e.box[1] && nz < e.box[3]) reached.add(e.id);
      q.push([nx, nz]);
    }
  }
  return { unreachable, models, reached: [...reached], exits: ow.exits.map((e) => e.id), cells: seen.size };
}, [from]);
await browser.close();

const TREES = new Set(["mango", "raintree", "banana", "oilpalm", "coconut", "bb_tree"]);
const SMALL = new Set(["fence", "flowerbed", "pot", "bush", "signboard", "mailbox", "lamppost", "pole", "bench", "myvi", "lanternpole", "clothesline", "hammock", "motorbike", "roadblock", "bb_banner_lamp", "bb_bus", "bb_car_red", "bb_car_green", "bb_taxi", "bb_burger", "bb_shawarma", "bb_monorail"]);
const shrink = (m) => {
  const k = TREES.has(m.id) ? 0.3 : 0.05;
  const w = (m.x1 - m.x0) * k;
  const d = (m.z1 - m.z0) * k;
  return [m.x0 + w, m.z0 + d, m.x1 - w, m.z1 - d];
};
const big = r.models.filter((m) => !SMALL.has(m.id));
const overlaps = [];
for (let i = 0; i < big.length; i++)
  for (let j = i + 1; j < big.length; j++) {
    const A = shrink(big[i]);
    const B = shrink(big[j]);
    if (A[0] < B[2] && B[0] < A[2] && A[1] < B[3] && B[1] < A[3]) overlaps.push(`${big[i].id} @${A.map((v) => v.toFixed(1))} x ${big[j].id} @${B.map((v) => v.toFixed(1))}`);
  }
const onRoad = [];
for (const m of r.models) {
  const cx = (m.x0 + m.x1) / 2;
  const cz = (m.z0 + m.z1) / 2;
  for (const [x0, z0, x1, z1] of roads) if (cx > x0 && cx < x1 && cz > z0 && cz < z1) onRoad.push(`${m.id} @${cx.toFixed(1)},${cz.toFixed(1)}`);
}
console.log(`zone ${zone}: ${r.models.length} generated models, ${r.cells} walkable cells from ${from}`);
console.log(`errors: ${errors.length ? errors.join(" | ") : "none"}`);
console.log(`unreachable pickups: ${r.unreachable.length ? JSON.stringify(r.unreachable) : "none"}`);
console.log(`overlapping models: ${overlaps.length ? "\n  " + overlaps.join("\n  ") : "none"}`);
if (roads.length) console.log(`models on roads: ${onRoad.length ? onRoad.join(", ") : "none"}`);
console.log(`exits reachable on foot right now: ${r.reached.join(", ") || "none"} (all: ${r.exits.join(", ")})`);
