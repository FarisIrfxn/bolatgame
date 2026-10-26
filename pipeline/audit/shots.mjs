// Screenshot a zone as Qish would see it.
//   node shots.mjs --zone labulanjut --at 0,1 --out /tmp/a.png        one spot
//   node shots.mjs --zone labulanjut --grid -24,12,-6,30 --out /tmp/g  4x4 grid over x0,x1,z0,z1
//   --save '{"cards":[8],"flags":{"introSeen":true,"endingSeen":true}}'  start from a given save (Labu's party)
// Prints any page errors (a zone that throws while building shows up here first).
import { args, openZone, teleport } from "./lib.mjs";

const a = args();
const zone = a.zone ?? "labulanjut";
const spots = [];
if (a.grid) {
  const [x0, x1, z0, z1] = String(a.grid).split(",").map(Number);
  for (let j = 0; j < 4; j++) for (let i = 0; i < 4; i++) spots.push([x0 + ((x1 - x0) * i) / 3, z0 + ((z1 - z0) * j) / 3]);
} else spots.push(String(a.at ?? "0,0").split(",").map(Number));

const { browser, page, errors } = await openZone(zone, {
  width: Number(a.width ?? 1600),
  height: Number(a.height ?? 900),
  save: a.save ? JSON.parse(a.save) : null,
});
for (const [k, [x, z]] of spots.entries()) {
  await teleport(page, x, z);
  const out = a.grid ? `${a.out ?? "/tmp/zone"}_${k}_${x.toFixed(0)}_${z.toFixed(0)}.png` : (a.out ?? "/tmp/zone.png");
  await page.screenshot({ path: out });
  console.log(out);
}
console.log(JSON.stringify({ errors }));
await browser.close();
