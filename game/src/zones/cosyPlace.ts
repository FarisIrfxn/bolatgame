import { roundedBox } from "../overworld/props";
import * as THREE from "three";
import { mergeStatic } from "../overworld/merge";
import { canvasTexture, flat } from "../overworld/props";
import type { Box } from "../overworld/zone";
import { type PersonLook } from "../content/doodles";
import { shadowed } from "./common";
import type { Anim } from "./labuProps";
import { type Stander, type Walker, smoke } from "./lorbelProps";
import { musicNotes } from "./bintangProps";
import { DEG, INK, ROAD_IN, ROTUNDA_R, glow, mesh, polar, pool, rng, sign, ticker } from "./nyomProps";

// Cosy Place, in the middle of Nyomnyom City: a classical fine-dining rotunda on the marble plaza. A
// ring of columns under a gold-ribbed glass dome and a crystal chandelier; white tablecloths, candles,
// red velvet chairs, waiters in waistcoats and bow ties carrying cloches out of the kitchen, a pianist
// at the grand piano. Table 8, by the entrance, is the one booked for Qish (first date: lasagna).

const COL_R = 6.55;
const RING_Y = 4.0;
const APEX = 8.1;

/** Table 8 (the first-date table, right under the chandelier) and the chair Bowat ends up in. */
export const MEJA8: [number, number] = [0, 0.9];
export const BOWAT_SEAT: [number, number] = [-1.08, 0.9];
export const KITCHEN_DOOR: [number, number] = [0, -7.25];
export const PIANO: [number, number] = [-2.9, -3.6];
export const MAITRE: [number, number] = [2.3, 8.5];

/** The other tables: [x, z, which couple]. */
const TABLES: [number, number][] = [polar(3.6, 20 * DEG), polar(3.6, 160 * DEG), polar(3.9, 212 * DEG), polar(3.9, 328 * DEG)];

const BURGUNDY = 0x6e1626;
const CREAM = 0xf3ead8;
const GOLD = new THREE.MeshLambertMaterial({ color: 0xd9b25a, emissive: 0x6a4a10, emissiveIntensity: 0.35 });

function floorTex() {
  return canvasTexture(1024, 1024, (g) => {
    const k = 1024 / (ROTUNDA_R * 2);
    g.translate(512, 512);
    g.scale(k, k);
    // Marble checkerboard on the outer band.
    for (let x = -8; x < 8; x += 0.8) {
      for (let z = -8; z < 8; z += 0.8) {
        g.fillStyle = (Math.round(x / 0.8) + Math.round(z / 0.8)) % 2 ? "#f4efe4" : "#2a2328";
        g.fillRect(x, z, 0.8, 0.8);
      }
    }
    // Burgundy carpet with a gold border and a rosette in the middle.
    g.fillStyle = "#7a1a2c";
    g.beginPath();
    g.arc(0, 0, 5.5, 0, Math.PI * 2);
    g.fill();
    g.strokeStyle = "#d9b25a";
    g.lineWidth = 0.14;
    for (const r of [5.3, 4.9, 1.4]) {
      g.beginPath();
      g.arc(0, 0, r, 0, Math.PI * 2);
      g.stroke();
    }
    g.lineWidth = 0.07;
    for (let i = 0; i < 24; i++) {
      const a = (i / 24) * Math.PI * 2;
      g.beginPath();
      g.ellipse(Math.cos(a) * 5.1, Math.sin(a) * 5.1, 0.22, 0.1, a, 0, Math.PI * 2);
      g.stroke();
    }
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      g.beginPath();
      g.ellipse(Math.cos(a) * 0.8, Math.sin(a) * 0.8, 0.55, 0.22, a, 0, Math.PI * 2);
      g.stroke();
    }
  });
}

function column() {
  const g = new THREE.Group();
  const cream = flat(CREAM);
  g.add(mesh(roundedBox(0.85, 0.3, 0.85), cream, 0, 0.23, 0));
  g.add(mesh(new THREE.TorusGeometry(0.34, 0.08, 6, 14), cream, 0, 0.42, 0).rotateX(Math.PI / 2));
  const flutes = canvasTexture(64, 16, (c) => {
    c.fillStyle = "#f6efe0";
    c.fillRect(0, 0, 64, 16);
    c.fillStyle = "#ddd2bc";
    for (let x = 0; x < 64; x += 8) c.fillRect(x, 0, 3, 16);
  });
  g.add(mesh(new THREE.CylinderGeometry(0.27, 0.3, RING_Y - 0.85, 16), new THREE.MeshLambertMaterial({ map: flutes }), 0, (RING_Y - 0.85) / 2 + 0.45, 0));
  g.add(mesh(new THREE.TorusGeometry(0.31, 0.07, 6, 14), GOLD, 0, RING_Y - 0.36, 0).rotateX(Math.PI / 2));
  g.add(mesh(roundedBox(0.8, 0.28, 0.8), cream, 0, RING_Y - 0.15, 0));
  return g;
}

/** A table for two: white cloth to the floor, red velvet chairs with gold legs, candle and a rose.
 * `dish` sets what's on the plates. */
function diningSet(x: number, z: number, dish: "steak" | "lasagna", seed: number) {
  const g = new THREE.Group();
  const r = rng(seed);
  const cloth = flat(0xfbf8f1);
  g.add(mesh(new THREE.CylinderGeometry(0.78, 0.86, 0.78, 20), cloth, 0, 0.39, 0));
  g.add(mesh(new THREE.CylinderGeometry(0.8, 0.8, 0.04, 20), cloth, 0, 0.8, 0));
  for (const s of [-1, 1]) {
    const plate = mesh(new THREE.CylinderGeometry(0.24, 0.2, 0.03, 16), flat(0xffffff), s * 0.38, 0.83, 0);
    g.add(plate);
    if (dish === "steak") {
      const steak = mesh(roundedBox(0.22, 0.06, 0.15), flat(0x6b3020), s * 0.38, 0.87, 0.02);
      steak.rotation.y = r();
      g.add(steak, mesh(new THREE.SphereGeometry(0.05, 24, 16), flat(0x4f9a3a), s * 0.38 + 0.1, 0.88, -0.07));
    } else {
      // Lasagna: pasta, sauce and cheese layers, golden on top.
      [0xf6d27a, 0xc23b22, 0xfff3d6, 0xc23b22, 0xe8a33c].forEach((c, i) => g.add(mesh(roundedBox(0.26, 0.035, 0.2), flat(c), s * 0.38, 0.86 + i * 0.035, 0)));
      g.add(mesh(new THREE.SphereGeometry(0.035, 24, 16), flat(0x4f9a3a), s * 0.38 + 0.05, 1.04, 0));
    }
    // Wine glass.
    g.add(mesh(new THREE.CylinderGeometry(0.06, 0.03, 0.14, 8), new THREE.MeshLambertMaterial({ color: 0xe8f4ff, transparent: true, opacity: 0.5 }), s * 0.3, 0.98, -0.3));
    g.add(mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.12, 4), flat(0xe8f4ff), s * 0.3, 0.86, -0.3));
    // Velvet chair, facing in to the table.
    const chair = new THREE.Group();
    const velvet = flat(BURGUNDY);
    chair.add(mesh(roundedBox(0.56, 0.12, 0.56), velvet, 0, 0.5, 0));
    const back = mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.1, 14, 1, false, 0, Math.PI), velvet, 0, 1.05, 0.26);
    back.rotation.x = Math.PI / 2;
    back.scale.set(1, 1, 1.9);
    chair.add(back);
    chair.add(mesh(roundedBox(0.6, 0.05, 0.08), GOLD, 0, 0.6, 0.27));
    for (const lx of [-0.22, 0.22]) for (const lz of [-0.22, 0.22]) chair.add(mesh(new THREE.CylinderGeometry(0.03, 0.025, 0.46, 5), GOLD, lx, 0.23, lz));
    chair.position.set(s * 1.08, 0, 0);
    chair.rotation.y = s * Math.PI / 2;
    g.add(chair);
  }
  g.add(mesh(new THREE.CylinderGeometry(0.04, 0.05, 0.22, 8), flat(0xfff6dc), 0, 0.93, 0.12));
  g.add(mesh(new THREE.CylinderGeometry(0.035, 0.05, 0.2, 8), new THREE.MeshLambertMaterial({ color: 0xcfe8ff, transparent: true, opacity: 0.6 }), 0, 0.92, -0.16));
  g.add(mesh(new THREE.SphereGeometry(0.06,20,14), flat(0xd92f3b), 0, 1.07, -0.16));
  g.position.set(x, 0, z);
  return shadowed(g);
}

/** The reserved card on table 8. */
function reservedCard() {
  const tex = canvasTexture(256, 128, (c) => {
    c.fillStyle = "#fffdf6";
    c.fillRect(0, 0, 256, 128);
    c.strokeStyle = "#d9b25a";
    c.lineWidth = 8;
    c.strokeRect(6, 6, 244, 116);
    c.fillStyle = INK;
    c.textAlign = "center";
    c.font = "italic bold 38px Georgia, serif";
    c.fillText("Reserved", 128, 58);
    c.font = "bold 30px 'Gaegu', sans-serif";
    c.fillText("Meja 8 · Qish", 128, 100);
  });
  const m = mesh(new THREE.PlaneGeometry(0.42, 0.21), new THREE.MeshLambertMaterial({ map: tex, side: THREE.DoubleSide }), 0, 0.95, 0.38);
  m.rotation.x = -0.35;
  return m;
}

function grandPiano() {
  const g = new THREE.Group();
  const lacquer = new THREE.MeshLambertMaterial({ color: 0x141218, emissive: 0x1a1620, emissiveIntensity: 0.4 });
  const shape = new THREE.Shape();
  shape.moveTo(-0.75, 0);
  shape.lineTo(0.75, 0);
  shape.lineTo(0.75, -0.6);
  shape.bezierCurveTo(0.75, -1.4, 0.2, -1.4, 0.05, -2.0);
  shape.bezierCurveTo(-0.1, -2.3, -0.75, -2.3, -0.75, -1.6);
  shape.closePath();
  const body = new THREE.ExtrudeGeometry(shape, { depth: 0.36, bevelEnabled: false });
  body.rotateX(Math.PI / 2);
  g.add(mesh(body, lacquer, 0, 1.05, 0));
  const lid = mesh(new THREE.ShapeGeometry(shape), new THREE.MeshLambertMaterial({ color: 0x141218, side: THREE.DoubleSide }), 0, 1.06, 0);
  lid.rotation.set(Math.PI / 2, 0, 0);
  const hinge = new THREE.Group();
  hinge.add(lid);
  hinge.position.x = 0.75;
  lid.position.x = -0.75;
  hinge.rotation.z = 0.55;
  g.add(hinge);
  // Keys along the front edge, legs, the pedal lyre and the bench.
  g.add(mesh(roundedBox(1.4, 0.06, 0.28), flat(0xfbfaf6), 0, 0.92, 0.14));
  for (let i = 0; i < 10; i++) g.add(mesh(roundedBox(0.05, 0.03, 0.15), flat(0x141218), -0.6 + i * 0.13 + (i % 2) * 0.03, 0.96, 0.1));
  for (const [x, z] of [[-0.6, -0.1], [0.6, -0.1], [-0.4, -1.8]]) g.add(mesh(new THREE.CylinderGeometry(0.07, 0.05, 0.7, 6), lacquer, x, 0.35, z));
  g.add(mesh(roundedBox(0.9, 0.08, 0.4), lacquer, 0, 0.5, 0.75));
  for (const sx of [-0.38, 0.38]) g.add(mesh(roundedBox(0.06, 0.5, 0.34), lacquer, sx, 0.25, 0.75));
  return shadowed(g);
}

function chandelier(): Anim {
  const group = new THREE.Group();
  group.add(mesh(new THREE.CylinderGeometry(0.03, 0.03, APEX - 6.4, 4), GOLD, 0, (APEX + 6.4) / 2, 0));
  const body = new THREE.Group();
  body.add(mesh(new THREE.TorusGeometry(0.95, 0.05, 6, 24), GOLD, 0, 0, 0).rotateX(Math.PI / 2));
  body.add(mesh(new THREE.TorusGeometry(0.55, 0.05, 6, 20), GOLD, 0, 0.45, 0).rotateX(Math.PI / 2));
  body.add(mesh(new THREE.SphereGeometry(0.18,20,14), GOLD, 0, -0.25, 0));
  const crystal = new THREE.MeshLambertMaterial({ color: 0xf2f8ff, emissive: 0xbfd8ff, emissiveIntensity: 0.6, transparent: true, opacity: 0.85 });
  const flames: THREE.Sprite[] = [];
  for (const [r, y, n] of [[0.95, 0, 10], [0.55, 0.45, 6]] as const) {
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2;
      const x = Math.cos(a) * r;
      const z = Math.sin(a) * r;
      body.add(mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.18, 6), flat(0xfff6dc), x, y + 0.12, z));
      const f = glow(x, y + 0.27, z, 0.55, 0xffd98a, 0.95);
      flames.push(f);
      body.add(f);
      body.add(mesh(new THREE.OctahedronGeometry(0.06, 0), crystal, x * 1.02, y - 0.22, z * 1.02).rotateY(a));
    }
  }
  const halo = glow(0, 0.2, 0, 4.2, 0xffcf7a, 0.5);
  body.add(halo);
  const baked = mergeStatic(body);
  baked.position.y = 6.0;
  group.add(baked);
  const update = (t: number) => {
    baked.rotation.y = Math.sin(t * 0.3) * 0.05;
    flames.forEach((f, i) => (f.material.opacity = 0.75 + Math.sin(t * 13 + i * 2.3) * 0.12 + Math.sin(t * 7.1 + i) * 0.08));
    halo.material.opacity = 0.45 + Math.sin(t * 2.1) * 0.04;
  };
  return { group, update };
}

/** Brass posts with red velvet ropes along both sides of the red carpet. */
function ropes(z0: number, z1: number) {
  const g = new THREE.Group();
  for (const sx of [-1.05, 1.05]) {
    const posts: number[] = [];
    for (let z = z0; z <= z1 + 0.01; z += (z1 - z0) / 3) posts.push(z);
    for (const z of posts) {
      g.add(mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.9, 6), GOLD, sx, 0.45, z));
      g.add(mesh(new THREE.SphereGeometry(0.08,20,14), GOLD, sx, 0.94, z));
      g.add(mesh(new THREE.CylinderGeometry(0.16, 0.18, 0.05, 10), GOLD, sx, 0.03, z));
    }
    for (let i = 0; i < posts.length - 1; i++) {
      const a = new THREE.Vector3(sx, 0.85, posts[i]);
      const b = new THREE.Vector3(sx, 0.85, posts[i + 1]);
      const mid = a.clone().add(b).multiplyScalar(0.5);
      mid.y -= 0.22;
      g.add(mesh(new THREE.TubeGeometry(new THREE.QuadraticBezierCurve3(a, mid, b), 8, 0.035, 4), flat(0xa01830)));
    }
  }
  return g;
}

function urn(x: number, z: number, seed: number) {
  const g = new THREE.Group();
  g.add(mesh(new THREE.LatheGeometry([[0, 0], [0.3, 0], [0.24, 0.2], [0.42, 0.6], [0.46, 0.75], [0, 0.72]].map(([a, b]) => new THREE.Vector2(a, b)), 12), flat(0xe6dccb)));
  const leaf = flat(0x3f7f34);
  if (seed % 2) {
    // Cone topiary.
    g.add(mesh(new THREE.ConeGeometry(0.45, 1.5, 10), leaf, 0, 1.45, 0));
  } else {
    // Ball topiary on a stick.
    g.add(mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.8, 5), flat(0x6b4f35), 0, 1.1, 0));
    g.add(mesh(new THREE.SphereGeometry(0.48, 24, 16), leaf, 0, 1.6, 0));
  }
  g.position.set(x, 0, z);
  return shadowed(g);
}

/** A classical lamp: fluted post, two lanterns on scrolled arms. */
function plazaLamp(x: number, z: number) {
  const g = new THREE.Group();
  const iron = flat(0x2a2a30);
  g.add(mesh(new THREE.CylinderGeometry(0.09, 0.13, 3.4, 8), iron, 0, 1.7, 0));
  g.add(mesh(new THREE.CylinderGeometry(0.24, 0.3, 0.35, 8), iron, 0, 0.18, 0));
  g.add(mesh(roundedBox(1.4, 0.06, 0.06), iron, 0, 3.3, 0));
  const glows: THREE.Sprite[] = [];
  for (const sx of [-0.7, 0.7]) {
    g.add(mesh(new THREE.CylinderGeometry(0.17, 0.12, 0.42, 6), new THREE.MeshBasicMaterial({ color: 0xffe3a8 }), sx, 3.1, 0));
    g.add(mesh(new THREE.ConeGeometry(0.22, 0.18, 6), iron, sx, 3.4, 0));
    glows.push(glow(sx, 3.1, 0, 1.5, 0xffc878, 0.8));
  }
  g.position.set(x, 0, z);
  glows.forEach((s) => g.add(s));
  return shadowed(g);
}

export interface CosyBuild {
  statics: THREE.Group;
  anims: Anim[];
  boxes: Box[];
  crowd: Stander[];
  walkers: Walker[];
  lights: THREE.PointLight[];
  /** Kitchen doors swing when someone walks through. */
  doors: (people: () => readonly THREE.Vector3[]) => Anim;
}

const TUX = (skin: string, hair: string): PersonLook => ({ skin, top: "#1d1b22", bottom: "#1d1b22", hair, bag: "#000", carry: "none", bowtie: "#1d1b22" });
const WAITER = (skin: string, hair: string, hijab?: string): PersonLook => ({ skin, top: "#f7f4ee", bottom: "#1d1b22", apron: "#1d1b22", bowtie: "#7a1a2c", hair, hijab, bag: "#000", carry: "tray" });
const COUPLES: PersonLook[][] = [
  [{ skin: "#e8b48f", top: "#7a1a2c", bottom: "#2a2730", hijab: "#e9d3c4", bag: "#000", carry: "none" }, { skin: "#c98c64", top: "#2a3a5a", bottom: "#2a2730", hair: "#26222a", bag: "#000", carry: "none", bowtie: "#2a2730" }],
  [{ skin: "#f0c8a8", top: "#1d1b22", bottom: "#2a2730", hair: "#3a2a20", bag: "#000", carry: "none" }, { skin: "#d39a72", top: "#f2f0ea", bottom: "#2a2730", hair: "#1c1a20", bag: "#000", carry: "none" }],
  [{ skin: "#e3ad86", top: "#3b6fe0", bottom: "#2a2730", hijab: "#1f2f7a", bag: "#000", carry: "none" }, { skin: "#b97a52", top: "#6b5a8a", bottom: "#2a2730", hair: "#26222a", bag: "#000", carry: "none" }],
  [{ skin: "#ecc0a0", top: "#2f8a4a", bottom: "#2a2730", hijab: "#f2d27a", bag: "#000", carry: "none" }, { skin: "#c98c64", top: "#1d1b22", bottom: "#2a2730", hair: "#26222a", bag: "#000", carry: "none", bowtie: "#7a1a2c" }],
];
const DINER_LINES = [
  ["Steak medium rare, perfect", "Romantiknya tempat ni", "Sayang, nak dessert?"],
  ["Mahal tapi berbaloi", "Lasagna dia sedap kata orang", "Shh, piano tengah main"],
  ["Happy anniversary, sayang", "Cantik chandelier tu", "Kenyang... tapi nak lagi"],
  ["Lilin ni wangi", "First date kita kat sini kan?", "Pelayan dia handsome"],
];

export function cosyPlace(): CosyBuild {
  const g = new THREE.Group();
  const anims: Anim[] = [];
  const boxes: Box[] = [];
  const crowd: Stander[] = [];
  const lights: THREE.PointLight[] = [];
  const cream = flat(CREAM);

  // Floor: a low marble drum with a gold rim.
  g.add(mesh(new THREE.CylinderGeometry(ROTUNDA_R, ROTUNDA_R + 0.1, 0.1, 64), cream, 0, 0.05, 0));
  const top = mesh(new THREE.CircleGeometry(ROTUNDA_R - 0.05, 64), new THREE.MeshLambertMaterial({ map: floorTex() }), 0, 0.105, 0);
  top.rotation.x = -Math.PI / 2;
  g.add(top);
  g.add(mesh(new THREE.TorusGeometry(ROTUNDA_R, 0.05, 6, 64), GOLD, 0, 0.1, 0).rotateX(Math.PI / 2));

  // Twelve columns, the gap at the front (south) left wide for the entrance.
  for (let i = 0; i < 12; i++) {
    const a = (15 + i * 30) * DEG;
    const [x, z] = polar(COL_R, a);
    const c = column();
    c.position.set(x, 0, z);
    g.add(c);
    boxes.push([x - 0.42, z - 0.42, x + 0.42, z + 0.42]);
  }
  // Entablature ring with a gold band.
  g.add(mesh(new THREE.LatheGeometry([[COL_R - 0.55, RING_Y], [COL_R + 0.55, RING_Y], [COL_R + 0.62, RING_Y + 0.2], [COL_R + 0.55, RING_Y + 0.65], [COL_R - 0.55, RING_Y + 0.65]].map(([a, b]) => new THREE.Vector2(a, b)), 64), cream));
  g.add(mesh(new THREE.TorusGeometry(COL_R + 0.6, 0.06, 6, 64), GOLD, 0, RING_Y + 0.42, 0).rotateX(Math.PI / 2));
  // Dome: gold ribs over faint glass, a little lantern on top.
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    const pts = Array.from({ length: 9 }, (_, k) => {
      const t = (k / 8) * (Math.PI / 2);
      const r = (COL_R - 0.1) * Math.cos(t);
      return new THREE.Vector3(Math.cos(a) * r, RING_Y + 0.65 + (APEX - RING_Y - 0.65) * Math.sin(t), Math.sin(a) * r);
    });
    g.add(mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 16, 0.08, 5), GOLD));
  }
  const glass = mesh(
    new THREE.SphereGeometry(COL_R - 0.1,36,14, 0, Math.PI * 2, 0, Math.PI / 2),
    new THREE.MeshLambertMaterial({ color: 0xbfe0ff, transparent: true, opacity: 0.12, depthWrite: false, side: THREE.DoubleSide, emissive: 0x405070, emissiveIntensity: 0.4 }),
    0,
    RING_Y + 0.65,
    0,
  );
  glass.scale.y = (APEX - RING_Y - 0.65) / (COL_R - 0.1);
  glass.castShadow = false;
  g.add(glass);
  g.add(mesh(new THREE.CylinderGeometry(0.6, 0.6, 0.6, 12), cream, 0, APEX + 0.25, 0));
  g.add(mesh(new THREE.SphereGeometry(0.62,20,14, 0, Math.PI * 2, 0, Math.PI / 2), GOLD, 0, APEX + 0.55, 0));
  g.add(mesh(new THREE.ConeGeometry(0.08, 0.6, 6), GOLD, 0, APEX + 1.4, 0));
  // The name over the entrance.
  const name = sign("Cosy Place", 4.4, 1.25, "#3a1420", "#f0d39a", "Fine Dining · Wangsa Maju", "italic Georgia, serif");
  name.position.set(0, RING_Y + 1.2, COL_R + 0.75);
  g.add(name);
  g.add(mesh(roundedBox(4.6, 0.12, 0.3), GOLD, 0, RING_Y + 0.56, COL_R + 0.62));

  // Tables: table 8 by the entrance, and four couples round the room.
  g.add(diningSet(MEJA8[0], MEJA8[1], "lasagna", 8));
  const card = reservedCard();
  card.position.add(new THREE.Vector3(MEJA8[0], 0, MEJA8[1]));
  g.add(card);
  boxes.push([MEJA8[0] - 0.85, MEJA8[1] - 0.6, MEJA8[0] + 0.85, MEJA8[1] + 0.6]);
  TABLES.forEach(([x, z], i) => {
    g.add(diningSet(x, z, "steak", i + 1));
    boxes.push([x - 0.85, z - 0.6, x + 0.85, z + 0.6]);
    COUPLES[i].forEach((lk, k) => crowd.push({ x: x + (k ? 1.1 : -1.1), z, look: lk, mode: "eat", seated: true, flip: k === 1, solid: false, lines: DINER_LINES[i] }));
    g.add(glow(x, 1.12, z + 0.12, 0.8, 0xffc070, 0.9));
  });
  const candle8 = glow(MEJA8[0], 1.12, MEJA8[1] + 0.12, 0.8, 0xffc070, 0.9);
  g.add(candle8);

  // Grand piano and pianist; notes drift up while he plays.
  const piano = grandPiano();
  piano.position.set(PIANO[0], 0, PIANO[1]);
  piano.rotation.y = 0.75;
  g.add(piano);
  boxes.push([PIANO[0] - 1.2, PIANO[1] - 1.3, PIANO[0] + 1.2, PIANO[1] + 1.1]);
  crowd.push({ x: PIANO[0] + 0.55, z: PIANO[1] + 0.85, look: TUX("#e8b48f", "#3a2a20"), mode: "sway", seated: true, back: true, solid: false, lines: ["♪ ~ ♫", "Request? Tak boleh.", "♫"] });
  anims.push(musicNotes(PIANO[0], 1.6, PIANO[1] - 0.3, () => true, 6));

  const chand = chandelier();
  anims.push(chand);
  const l = new THREE.PointLight(0xffc982, 34, 15, 1.4);
  l.position.set(0, 5.4, 0);
  lights.push(l);

  // Kitchen annex at the back: porthole windows, swinging doors, a chimney puffing steam.
  const k = new THREE.Group();
  const kTex = canvasTexture(512, 256, (c) => {
    c.fillStyle = "#efe4cf";
    c.fillRect(0, 0, 512, 256);
    c.fillStyle = "#d9cdb4";
    c.fillRect(0, 230, 512, 26);
    for (const x of [90, 422]) {
      c.fillStyle = "#ffcf8a";
      c.beginPath();
      c.arc(x, 110, 36, 0, Math.PI * 2);
      c.fill();
      c.lineWidth = 10;
      c.strokeStyle = "#b08a3a";
      c.stroke();
    }
    c.fillStyle = INK;
    c.font = "bold 34px 'Bagel Fat One', sans-serif";
    c.textAlign = "center";
    c.fillText("DAPUR", 256, 44);
  });
  const kLit = canvasTexture(512, 256, (c) => {
    c.fillStyle = "#000";
    c.fillRect(0, 0, 512, 256);
    c.fillStyle = "#ffcf8a";
    for (const x of [90, 422]) {
      c.beginPath();
      c.arc(x, 110, 34, 0, Math.PI * 2);
      c.fill();
    }
  });
  const kWall = flat(0xefe4cf);
  k.add(mesh(roundedBox(5.2, 3.2, 2.4), [kWall, kWall, flat(0x8a6a50), kWall, new THREE.MeshLambertMaterial({ map: kTex, emissiveMap: kLit, emissive: 0xffffff, emissiveIntensity: 0.8 }), kWall], 0, 1.6, 0));
  k.add(mesh(roundedBox(5.5, 0.3, 2.7), flat(0x6e1626), 0, 3.3, 0));
  k.add(mesh(roundedBox(0.7, 1.6, 0.7), flat(0x9a8a7a), 1.6, 3.9, -0.4));
  k.position.set(0, 0, -8.45);
  g.add(k);
  boxes.push([-2.6, -9.65, 2.6, -7.3]);
  anims.push(smoke(1.6, 4.7, -8.85, { n: 8, rise: 3.2, size: 1.2, color: 0xffffff, drift: 0.6, opacity: 0.45 }));
  // Door frame (the leaves themselves animate).
  g.add(mesh(roundedBox(1.7, 0.2, 0.2), GOLD, 0, 2.3, -7.22));
  // Chef by the door, shouting orders.
  crowd.push({ x: 1.75, z: -6.75, look: { skin: "#c98c64", top: "#fbfaf6", bottom: "#4a4a55", hair: "#26222a", chef: true, bag: "#000", carry: "none", apron: "#fbfaf6" }, mode: "vendor", lines: ["Lasagna meja 3!", "Steak medium rare!", "Garnish! GARNISH!", "Sapa curi garlic bread saya?"] });

  // Red carpet out to the kerb, velvet ropes, the maître d' at his podium.
  const carpet = mesh(new THREE.PlaneGeometry(1.7, ROAD_IN - ROTUNDA_R + 0.2), new THREE.MeshLambertMaterial({ color: 0xa01830 }), 0, 0.07, (ROAD_IN + ROTUNDA_R) / 2 - 0.1);
  carpet.rotation.x = -Math.PI / 2;
  g.add(carpet);
  for (const sx of [-0.88, 0.88]) {
    const edge = mesh(new THREE.PlaneGeometry(0.08, ROAD_IN - ROTUNDA_R + 0.2), GOLD, sx, 0.075, (ROAD_IN + ROTUNDA_R) / 2 - 0.1);
    edge.rotation.x = -Math.PI / 2;
    g.add(edge);
  }
  g.add(ropes(ROTUNDA_R + 0.3, ROAD_IN - 0.5));
  const podium = new THREE.Group();
  podium.add(mesh(roundedBox(0.7, 1.1, 0.5), flat(0x4a2a1a), 0, 0.55, 0));
  const book = mesh(roundedBox(0.6, 0.05, 0.42), flat(0x6e1626), 0, 1.15, 0.02);
  book.rotation.x = 0.3;
  podium.add(book, mesh(roundedBox(0.5, 0.02, 0.36), flat(0xfffdf6), 0, 1.18, 0.02).rotateX(0.3));
  podium.position.set(MAITRE[0] - 0.75, 0, MAITRE[1] - 0.2);
  g.add(podium, glow(MAITRE[0] - 0.75, 1.5, MAITRE[1] - 0.2, 0.9, 0xffd98a, 0.7));
  boxes.push([MAITRE[0] - 1.1, MAITRE[1] - 0.45, MAITRE[0] - 0.4, MAITRE[1] + 0.05]);

  // Plaza: lamps either side of the carpet and all round, topiary urns between.
  for (let i = 0; i < 8; i++) {
    const a = (22.5 + i * 45) * DEG;
    const [x, z] = polar(8.6, a);
    g.add(plazaLamp(x, z));
    g.add(pool(x, z, 2.2));
    boxes.push([x - 0.3, z - 0.3, x + 0.3, z + 0.3]);
  }
  [0, 45, 135, 180, 225, 315].forEach((deg, i) => {
    const [x, z] = polar(8.7, deg * DEG);
    g.add(urn(x, z, i));
    boxes.push([x - 0.45, z - 0.45, x + 0.45, z + 0.45]);
  });
  g.add(pool(0, 0, ROTUNDA_R, 0xffc070, 0.35));

  const statics = new THREE.Group();
  statics.add(shadowed(g));
  glass.castShadow = false;

  const walkers: Walker[] = [
    { path: [[0.25, -6.9], [0.4, -2.2], [1.6, 0.4], [1.85, 1.9]], look: WAITER("#c98c64", "#26222a"), speed: 0.9, phase: 0 },
    { path: [[-0.25, -6.9], [-0.5, -2.3], [-1.7, 0.2], [-2.1, 1.7]], look: WAITER("#e3ad86", "#26222a", "#1d1b22"), speed: 0.8, phase: 0.55 },
    { path: [[0.1, -6.9], [1.2, -3.6], [2.3, -1.4]], look: WAITER("#b97a52", "#1c1a20"), speed: 0.85, phase: 0.3 },
  ];
  crowd.push({ x: MAITRE[0], z: MAITRE[1], look: TUX("#e3ad86", "#26222a"), mode: "idle", lines: ["Bonsoir~", "Ada tempahan?", "Silakan, mademoiselle"] });

  /** The two swinging leaves of the kitchen door: they flap open when a waiter comes through. */
  const doors = (people: () => readonly THREE.Vector3[]): Anim => {
    const group = new THREE.Group();
    const leaves = [-1, 1].map((s) => {
      const hinge = new THREE.Group();
      const leaf = mesh(roundedBox(0.75, 2.1, 0.06), flat(0x6e1626), -s * 0.375, 1.08, 0);
      leaf.add(mesh(new THREE.CircleGeometry(0.16, 12), new THREE.MeshBasicMaterial({ color: 0xffcf8a }), 0, 0.4, 0.035));
      hinge.add(leaf);
      hinge.position.set(KITCHEN_DOOR[0] + s * 0.75, 0, KITCHEN_DOOR[1]);
      group.add(hinge);
      return { hinge, s };
    });
    shadowed(group);
    const tick = ticker();
    let open = 0;
    const update = (t: number) => {
      const dt = tick(t);
      const near = people().some((p) => Math.hypot(p.x - KITCHEN_DOOR[0], p.z - KITCHEN_DOOR[1]) < 1.3);
      open += ((near ? 1 : 0) - open) * Math.min(1, dt * 7);
      leaves.forEach(({ hinge, s }, i) => (hinge.rotation.y = s * (open * 1.3 + Math.sin(t * 9 + i) * 0.08 * open)));
    };
    return { group, update };
  };

  return { statics, anims, boxes, crowd, walkers, lights, doors };
}
