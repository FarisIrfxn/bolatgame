import * as THREE from "three";
import { sfx } from "../core/sfx";
import { mergeStatic } from "../overworld/merge";
import { paperStandee } from "../overworld/paper";
import { roundedBox, canvasTexture, flat, signTexture } from "../overworld/props";
import { splatShape, type MaskPainter } from "../overworld/splat";
import { paintedMat } from "../overworld/textures";
import type { Box } from "../overworld/zone";
import { type PersonLook, fisherBackDoodle } from "../content/doodles";
import { shadowed } from "./common";
import type { Anim } from "./labuProps";
import { smoke } from "./lorbelProps";
import { setBubbleText, speechDuration } from "../ui/speechBubble";
import { BOAT, BRIDGE, DECK, DOCK, ISLAND, JETTY, LAKE, type Pt, SAMPAN, WATER_Y, boat, edgeDist, inBox, inPoly } from "./sampan";

// Tasik Lily on a soft, bright morning: water lilies all over the lake, Lilium beds along the
// promenade, otters, anglers on the deck, a batik-painting corner, a picnic lawn, a car boot sale in
// the car park, and the sampan Qish rows out in to pick lilies for Snorlax Twin.

const INK = "#17151f";

/** Delta time for props that only get the clock. */
function ticker() {
  let last = -1;
  return (t: number) => {
    const dt = last < 0 ? 0 : Math.min(0.1, t - last);
    last = t;
    return dt;
  };
}

/** Small seeded random, so the scattered reeds and lilies land in the same places every visit. */
function rng(seed: number) {
  let s = seed >>> 0 || 1;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

function radial(inner: string, outer: string, size = 64) {
  return canvasTexture(size, size, (g) => {
    const grad = g.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    grad.addColorStop(0, inner);
    grad.addColorStop(1, outer);
    g.fillStyle = grad;
    g.fillRect(0, 0, size, size);
  });
}

const repeat = (t: THREE.Texture, x: number, y: number) => {
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(x, y);
  return t;
};

function mesh(geo: THREE.BufferGeometry, mat: THREE.Material, x = 0, y = 0, z = 0) {
  const m = new THREE.Mesh(geo, mat);
  m.position.set(x, y, z);
  return m;
}

const v3 = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

/** Point a unit-height cylinder from a to b (rods, lines that bend). */
function aim(m: THREE.Mesh, a: THREE.Vector3, b: THREE.Vector3) {
  m.position.copy(a).add(b).multiplyScalar(0.5);
  m.scale.set(1, a.distanceTo(b), 1);
  m.quaternion.setFromUnitVectors(v3(0, 1, 0), b.clone().sub(a).normalize());
}

function rod(a: THREE.Vector3, b: THREE.Vector3, r: number, mat: THREE.Material, seg = 6) {
  const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, 1, seg), mat);
  aim(m, a, b);
  return m;
}

/** Bake a little group of parts down to one mesh per material (shadows on). */
function baked(...parts: THREE.Object3D[]) {
  const g = new THREE.Group();
  g.add(...parts);
  return mergeStatic(shadowed(g));
}

const dbl = (color: number) => new THREE.MeshLambertMaterial({ color, side: THREE.DoubleSide, flatShading: false });

function planks(base: string, line: string, rx: number, ry: number) {
  return repeat(
    canvasTexture(128, 128, (g) => {
      g.fillStyle = base;
      g.fillRect(0, 0, 128, 128);
      g.fillStyle = line;
      for (let y = 0; y < 128; y += 16) g.fillRect(0, y, 128, 2);
      g.fillStyle = "rgba(0,0,0,.07)";
      for (let i = 0; i < 12; i++) g.fillRect((i * 53) % 128, ((i * 37) % 8) * 16 + 2, 2, 14);
    }),
    rx,
    ry,
  );
}

/** A speech bubble that pops up over someone for a moment ("WOI!", "Dapat!"). */
function shout(height: number) {
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ transparent: true, depthWrite: false }));
  sprite.scale.set(2.2, 0.66, 1);
  sprite.visible = false;
  sprite.renderOrder = 5;
  let until = -1;
  let pending: string | null = null;
  return {
    sprite,
    say(text: string) {
      pending = text;
    },
    update(t: number, x: number, z: number) {
      if (pending) {
        setBubbleText(sprite, pending);
        until = t + speechDuration(pending, 2.2);
        pending = null;
      }
      sprite.visible = t < until;
      if (sprite.visible) sprite.position.set(x, height + Math.min(0.25, (until - t) * 0.5), z);
    },
  };
}

// ---------------------------------------------------------------- Land & water

/** Grass all round with the lake (and its stream) cut out, earthy banks down to the water, and the
 * otters' island in the middle. */
export function lakeLand(depth = 1.2, paint: (p: MaskPainter) => void = () => {}) {
  const g = new THREE.Group();
  const grass = repeat(
    canvasTexture(256, 256, (c) => {
      c.fillStyle = "#86c056";
      c.fillRect(0, 0, 256, 256);
      for (let i = 0; i < 1100; i++) {
        c.fillStyle = ["#93cc62", "#78b14a", "#8cc65c", "#6fa844"][i % 4];
        c.fillRect(Math.random() * 256, Math.random() * 256, 3, 6);
      }
      for (let i = 0; i < 26; i++) {
        c.fillStyle = ["#fff6f0", "#ffd84a", "#ffb3cf"][i % 3];
        c.fillRect(Math.random() * 256, Math.random() * 256, 4, 4);
      }
    }),
    0.2,
    0.2,
  );
  // Bank: a grass fringe on top, damp earth, darker where the water laps it (side-wall UVs run
  // bottom to top, so the repeat is flipped to put the fringe at the top).
  const bank = canvasTexture(64, 128, (c) => {
    c.fillStyle = "#8b6a44";
    c.fillRect(0, 0, 64, 128);
    c.fillStyle = "#6e5236";
    c.fillRect(0, 58, 64, 70);
    c.fillStyle = "rgba(255,255,255,.18)";
    c.fillRect(0, 56, 64, 3);
    for (let i = 0; i < 40; i++) {
      c.fillStyle = i % 2 ? "rgba(0,0,0,.12)" : "rgba(255,240,200,.12)";
      c.fillRect(Math.random() * 64, 16 + Math.random() * 40, 4, 3);
    }
    c.fillStyle = "#78b14a";
    c.beginPath();
    c.moveTo(0, 0);
    for (let x = 0; x <= 64; x += 4) c.lineTo(x, 10 + ((x * 7) % 11));
    c.lineTo(64, 0);
    c.fill();
  });
  bank.wrapS = bank.wrapT = THREE.RepeatWrapping;
  bank.repeat.set(0.5, -1 / depth);
  bank.offset.set(0, 1 / depth);
  const mats = [new THREE.MeshLambertMaterial({ map: grass }), new THREE.MeshLambertMaterial({ map: bank })];
  const shape = (pts: Pt[]) => new THREE.Shape(pts.map(([x, z]) => new THREE.Vector2(x, -z)));
  const outer = shape([[-90, -70], [90, -70], [90, 70], [-90, 70]]);
  outer.holes.push(new THREE.Path(LAKE.map(([x, z]) => new THREE.Vector2(x, -z))));
  for (const s of [outer, shape(ISLAND)]) {
    const m = new THREE.Mesh(new THREE.ExtrudeGeometry(s, { depth, bevelEnabled: false, curveSegments: 1 }), mats);
    m.rotation.x = -Math.PI / 2;
    m.position.y = -depth;
    m.receiveShadow = true;
    g.add(m, splatShape(s, [0, 0, 180, 140], paint));
  }
  return g;
}

/** The lake water: calm green-teal with lazy ripples, a deeper tint in the middle and sun glints. */
export function lakeWater(): Anim {
  const group = new THREE.Group();
  const W = 110;
  const D = 90;
  const base = repeat(
    canvasTexture(256, 256, (g) => {
      g.fillStyle = "#48a9b0";
      g.fillRect(0, 0, 256, 256);
      g.strokeStyle = "rgba(255,255,255,.2)";
      g.lineWidth = 3;
      for (let i = 0; i < 24; i++) {
        const x = (i * 97) % 256;
        const y = (i * 61) % 256;
        g.beginPath();
        g.moveTo(x, y);
        g.quadraticCurveTo(x + 12, y - 5, x + 26, y);
        g.stroke();
      }
      g.strokeStyle = "rgba(20,70,80,.12)";
      for (let i = 0; i < 14; i++) {
        const x = (i * 71 + 30) % 256;
        const y = (i * 113 + 12) % 256;
        g.beginPath();
        g.moveTo(x, y);
        g.quadraticCurveTo(x + 16, y + 6, x + 34, y);
        g.stroke();
      }
    }),
    W / 7,
    D / 7,
  );
  const water = mesh(new THREE.PlaneGeometry(W, D), new THREE.MeshLambertMaterial({ map: base, emissive: 0x0d4f58, emissiveIntensity: 0.22 }), 0, WATER_Y, -4);
  water.rotation.x = -Math.PI / 2;
  water.receiveShadow = true;
  const deep = mesh(
    new THREE.PlaneGeometry(30, 22),
    new THREE.MeshBasicMaterial({ map: radial("rgba(14,60,80,.42)", "rgba(14,60,80,0)", 128), transparent: true, depthWrite: false }),
    0.5,
    WATER_Y + 0.004,
    -1.8,
  );
  deep.rotation.x = -Math.PI / 2;
  const glint = repeat(
    canvasTexture(256, 256, (g) => {
      for (let i = 0; i < 40; i++) {
        const x = (i * 131) % 256;
        const y = (i * 89 + (i % 7) * 13) % 256;
        g.fillStyle = `rgba(255,250,225,${0.35 + (i % 4) * 0.15})`;
        g.fillRect(x, y, 6 + (i % 3) * 5, 2);
      }
    }),
    W / 9,
    D / 9,
  );
  const sparkle = mesh(
    new THREE.PlaneGeometry(W, D),
    new THREE.MeshBasicMaterial({ map: glint, transparent: true, opacity: 0.5, depthWrite: false, blending: THREE.AdditiveBlending }),
    0,
    WATER_Y + 0.01,
    -4,
  );
  sparkle.rotation.x = -Math.PI / 2;
  group.add(water, deep, sparkle);
  const update = (t: number) => {
    base.offset.set(t * 0.01, t * 0.005);
    glint.offset.set(-t * 0.007, t * 0.009);
    (sparkle.material as THREE.MeshBasicMaterial).opacity = 0.42 + Math.sin(t * 2.1) * 0.1;
  };
  return { group, update };
}

/** Soft white water lapping at every bank and round the island. */
export function shoreFoam(): Anim {
  const pos: number[] = [];
  const uv: number[] = [];
  const ribbon = (poly: Pt[], into: (x: number, z: number) => boolean, w: number) => {
    for (let i = 0; i < poly.length; i++) {
      const [ax, az] = poly[i];
      const [bx, bz] = poly[(i + 1) % poly.length];
      const len = Math.hypot(bx - ax, bz - az);
      let nx = -(bz - az) / len;
      let nz = (bx - ax) / len;
      if (!into((ax + bx) / 2 + nx * 0.3, (az + bz) / 2 + nz * 0.3)) {
        nx = -nx;
        nz = -nz;
      }
      const y = WATER_Y + 0.012;
      const [cx, cz, dx, dz] = [bx + nx * w, bz + nz * w, ax + nx * w, az + nz * w];
      pos.push(ax, y, az, bx, y, bz, cx, y, cz, ax, y, az, cx, y, cz, dx, y, dz);
      const u = len / 2;
      uv.push(0, 0, u, 0, u, 1, 0, 0, u, 1, 0, 1);
    }
  };
  ribbon(LAKE, (x, z) => inPoly(LAKE, x, z), 0.8);
  ribbon(ISLAND, (x, z) => !inPoly(ISLAND, x, z), 0.6);
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  geo.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
  const tex = canvasTexture(64, 64, (g) => {
    const grad = g.createLinearGradient(0, 64, 0, 0);
    grad.addColorStop(0, "rgba(255,255,255,.75)");
    grad.addColorStop(0.25, "rgba(255,255,255,.28)");
    grad.addColorStop(1, "rgba(255,255,255,0)");
    g.fillStyle = grad;
    g.fillRect(0, 0, 64, 64);
    g.fillStyle = "rgba(255,255,255,.55)";
    for (let i = 0; i < 6; i++) g.fillRect(i * 11, 40 + (i % 3) * 5, 7, 2);
  });
  tex.wrapS = THREE.RepeatWrapping;
  const m = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false, side: THREE.DoubleSide }));
  m.renderOrder = 1;
  const group = new THREE.Group();
  group.add(m);
  const update = (t: number) => {
    tex.offset.x = t * 0.04;
    m.material.opacity = 0.75 + Math.sin(t * 1.3) * 0.2;
  };
  return { group, update };
}

/** Reeds, bulrushes and stones all along the banks (left clear at the decks and the bridge). Static. */
export function shoreReeds() {
  const g = new THREE.Group();
  const r = rng(7);
  const reed = [flat(0x5f8f3a), flat(0x6fa043), flat(0x4f7f30), flat(0x86b04a)];
  const cattail = flat(0x7a4a26);
  const stone = [flat(0x9a968a), flat(0x8a877c), flat(0xb0ab9c)];
  const clear = (x: number, z: number) => inBox(JETTY, x, z, 1.1) || inBox(DECK, x, z, 1.1) || inBox(BRIDGE, x, z, 1.0);
  const walk = (poly: Pt[], into: (x: number, z: number) => boolean) => {
    for (let i = 0; i < poly.length; i++) {
      const [ax, az] = poly[i];
      const [bx, bz] = poly[(i + 1) % poly.length];
      const len = Math.hypot(bx - ax, bz - az);
      let nx = -(bz - az) / len;
      let nz = (bx - ax) / len;
      if (!into((ax + bx) / 2 + nx * 0.3, (az + bz) / 2 + nz * 0.3)) {
        nx = -nx;
        nz = -nz;
      }
      for (let d = 0; d < len; d += 0.5) {
        const px = ax + ((bx - ax) * d) / len;
        const pz = az + ((bz - az) * d) / len;
        if (clear(px, pz) || pz < -30 || px > 32) continue;
        const k = r();
        if (k < 0.22) continue;
        if (k < 0.34) {
          const s = 0.22 + r() * 0.3;
          const rock = mesh(new THREE.SphereGeometry(s, 24, 16), stone[Math.floor(r() * 3)], px + nx * 0.1, WATER_Y + s * 0.4, pz + nz * 0.1);
          rock.rotation.set(r() * 3, r() * 3, 0);
          rock.scale.y = 0.7;
          g.add(rock);
          continue;
        }
        const off = -0.25 + r() * 0.7;
        const wetBase = off > 0;
        const base = wetBase ? WATER_Y : 0;
        const cx = px + nx * off;
        const cz = pz + nz * off;
        const blades = 3 + Math.floor(r() * 3);
        for (let b = 0; b < blades; b++) {
          const h = 0.6 + r() * 0.75 + (wetBase ? 0.55 : 0);
          const bx2 = cx + (r() - 0.5) * 0.3;
          const bz2 = cz + (r() - 0.5) * 0.3;
          const blade = mesh(new THREE.ConeGeometry(0.045, h, 3), reed[Math.floor(r() * 4)], bx2, base + h / 2, bz2);
          blade.rotation.set((r() - 0.5) * 0.35, r() * 3, (r() - 0.5) * 0.35);
          g.add(blade);
          if (b === 0 && r() < 0.3) g.add(mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.26, 6), cattail, bx2, base + h * 0.82, bz2));
        }
      }
    }
  };
  walk(LAKE, (x, z) => inPoly(LAKE, x, z));
  walk(ISLAND, (x, z) => !inPoly(ISLAND, x, z));
  return g;
}

// ---------------------------------------------------------------- Lilies

const WATER_LILY: [number, number][] = [
  [0xffa6c9, 0xff6fa6],
  [0xfffaf0, 0xffdcea],
  [0xf2558f, 0xff9cc2],
  [0xffc2da, 0xffffff],
];

/** One water lily in bloom: two rings of pointed petals round a golden centre. */
function waterLily(outer: number, inner: number, s: number) {
  const g = new THREE.Group();
  const petal = new THREE.SphereGeometry(0.1,20,14);
  const ring = (n: number, reach: number, tilt: number, mat: THREE.Material, size: number, turn: number) => {
    for (let k = 0; k < n; k++) {
      const pivot = new THREE.Group();
      pivot.rotation.y = (k / n) * Math.PI * 2 + turn;
      const p = mesh(petal, mat, reach, 0, 0);
      p.scale.set(1.25 * size, 0.24 * size, 0.42 * size);
      p.rotation.z = tilt;
      pivot.add(p);
      g.add(pivot);
    }
  };
  ring(8, 0.12, 0.3, flat(outer), 1, 0);
  ring(6, 0.075, 0.85, flat(inner), 0.85, 0.3);
  g.add(mesh(new THREE.SphereGeometry(0.045,20,14), flat(0xffcf3a), 0, 0.06, 0));
  g.scale.setScalar(s);
  return g;
}

/** Lily pads (and blooms, and a few buds) floating in clusters of [x, z, radius, count]. Static. */
export function lilyPads(clusters: [number, number, number, number][], seed = 3) {
  const g = new THREE.Group();
  const r = rng(seed);
  const pads = [flat(0x4f9a3f), flat(0x5fae4a), flat(0x3f8a3a), flat(0x6cb852)];
  let layer = 0;
  for (const [cx, cz, rad, n] of clusters) {
    for (let i = 0; i < n; i++) {
      const a = r() * Math.PI * 2;
      const d = Math.sqrt(r()) * rad;
      const x = cx + Math.cos(a) * d;
      const z = cz + Math.sin(a) * d;
      if (!inPoly(BOAT, x, z) || edgeDist(BOAT, x, z) < 0.5 || inPoly(ISLAND, x, z) || edgeDist(ISLAND, x, z) < 0.35) continue;
      const s = 0.26 + r() * 0.34;
      const geo = new THREE.CircleGeometry(s, 14, 0.28, Math.PI * 2 - 0.56);
      geo.rotateX(-Math.PI / 2);
      const pad = mesh(geo, pads[Math.floor(r() * pads.length)], x, WATER_Y + 0.015 + (layer++ % 40) * 0.0007, z);
      pad.rotation.y = r() * Math.PI * 2;
      g.add(pad);
      const k = r();
      if (k < 0.3) {
        const [o, inn] = WATER_LILY[Math.floor(r() * WATER_LILY.length)];
        const f = waterLily(o, inn, 1 + r() * 0.5);
        f.position.set(x + (r() - 0.5) * s * 0.6, WATER_Y + 0.05, z + (r() - 0.5) * s * 0.6);
        f.rotation.y = r() * 3;
        g.add(f);
      } else if (k < 0.4) {
        const bud = mesh(new THREE.ConeGeometry(0.06, 0.2, 5), flat(0xff8fb8), x, WATER_Y + 0.12, z);
        bud.rotation.z = (r() - 0.5) * 0.4;
        g.add(bud);
      }
    }
  }
  return g;
}

const LILIUM = [0xfffaf2, 0xff9cc2, 0xf2558f, 0xffc9a0, 0xfff0a8];

/** A Lilium: tall stem, strappy leaves and two or three open trumpets facing out. */
function lilium(x: number, z: number, color: number, h: number, seed: number) {
  const g = new THREE.Group();
  const stem = flat(0x4f8f35);
  g.add(mesh(new THREE.CylinderGeometry(0.02, 0.028, h, 5), stem, 0, h / 2, 0));
  for (let k = 0; k < 4; k++) {
    const leaf = mesh(new THREE.ConeGeometry(0.045, 0.36, 3), flat(0x5a9e3c), 0, 0.2 + k * h * 0.18, 0);
    leaf.rotation.set(0, seed + k * 2.1, 0.9);
    leaf.translateY(0.12);
    g.add(leaf);
  }
  const petals = dbl(color);
  const n = 2 + (seed % 2);
  for (let k = 0; k < n; k++) {
    const pivot = new THREE.Group();
    pivot.position.y = h - 0.02 - k * 0.06;
    pivot.rotation.y = seed * 1.7 + (k / n) * Math.PI * 2;
    const e = 0.3 + (k % 2) * 0.25;
    // Cone apex points at the stem; the open mouth faces out and a little up.
    const trumpet = mesh(new THREE.ConeGeometry(0.15, 0.32, 6, 1, true), petals, Math.cos(e) * 0.16, Math.sin(e) * 0.16, 0);
    trumpet.rotation.z = Math.PI / 2 + e;
    pivot.add(trumpet);
    pivot.add(mesh(new THREE.SphereGeometry(0.025,20,14), flat(0xb5541c), Math.cos(e) * 0.3, Math.sin(e) * 0.3 + 0.02, 0));
    g.add(pivot);
  }
  g.position.set(x, 0, z);
  return g;
}

/** A raised bed of Lilium in Qish's favourite colours, with a stone kerb. Static. */
export function liliumBed(x: number, z: number, w: number, d: number, seed = 0) {
  const g = new THREE.Group();
  const r = rng(seed + 11);
  g.add(mesh(roundedBox(w, 0.16, d), flat(0x6b4a2e), 0, 0.08, 0));
  const kerb = flat(0xe6dccb);
  for (const sz of [-1, 1]) g.add(mesh(roundedBox(w + 0.2, 0.22, 0.12), kerb, 0, 0.11, (sz * (d + 0.08)) / 2));
  for (const sx of [-1, 1]) g.add(mesh(roundedBox(0.12, 0.22, d), kerb, (sx * (w + 0.08)) / 2, 0.11, 0));
  const n = Math.round(w * d * 2.4);
  for (let i = 0; i < n; i++) {
    const px = (r() - 0.5) * (w - 0.3);
    const pz = (r() - 0.5) * (d - 0.3);
    g.add(lilium(px, pz, LILIUM[Math.floor(r() * LILIUM.length)], 0.7 + r() * 0.45, i + seed));
  }
  for (let i = 0; i < n; i++) g.add(mesh(new THREE.IcosahedronGeometry(0.14 + r() * 0.08, 0), flat(0x5fa043), (r() - 0.5) * (w - 0.2), 0.2, (r() - 0.5) * (d - 0.2)));
  g.position.set(x, 0, z);
  return shadowed(g);
}

/** A few Lilium in a pot (the car boot plant stall sells them). */
export function potLily(x: number, z: number, color: number, seed = 0, y = 0) {
  const g = new THREE.Group();
  g.add(mesh(new THREE.CylinderGeometry(0.2, 0.15, 0.32, 8), flat(0xc4673a), 0, 0.16, 0));
  for (let k = 0; k < 3; k++) {
    const l = lilium((k - 1) * 0.08, ((k * 7) % 3 - 1) * 0.06, color, 0.5 + k * 0.08, seed + k);
    l.position.y = 0.3;
    g.add(l);
  }
  g.position.set(x, y, z);
  return g;
}

/** Weeping willow leaning out over the water, its curtain of strands hanging down to the surface. */
export function willow(x: number, z: number, lean: [number, number], seed = 0): Anim {
  const g = new THREE.Group();
  const r = rng(seed + 31);
  const bark = flat(0x6a5038);
  const [lx, lz] = lean;
  const tree = new THREE.Group();
  tree.add(rod(v3(0, 0, 0), v3(lx * 0.9, 2.9, lz * 0.9), 0.3, bark, 7));
  tree.add(rod(v3(lx * 0.9, 2.9, lz * 0.9), v3(lx * 1.6 + 0.6, 3.6, lz * 1.6), 0.14, bark, 5));
  tree.add(rod(v3(lx * 0.9, 2.9, lz * 0.9), v3(lx * 1.4 - 0.7, 3.5, lz * 1.4 + 0.3), 0.14, bark, 5));
  const top = v3(lx * 1.3, 3.7, lz * 1.3);
  const greens = [0x7cb85a, 0x6aa84f, 0x8cc46a, 0x5f9a45];
  for (const [ox, oy, oz, s] of [[0, 0.2, 0, 1.6], [0.9, 0, 0.3, 1.1], [-0.9, -0.05, -0.2, 1.15], [0.2, 0.05, 0.9, 1.0]] as const) {
    const crown = mesh(new THREE.SphereGeometry(s, 24, 16), flat(greens[Math.floor(r() * 4)]), top.x + ox, top.y + oy, top.z + oz);
    crown.scale.y = 0.5;
    tree.add(crown);
  }
  g.add(baked(tree));
  // Strands in a separate group so they can sway in the breeze.
  const strands = new THREE.Group();
  const mats = greens.map((c) => flat(c));
  for (let i = 0; i < 44; i++) {
    const a = r() * Math.PI * 2;
    const rad = 0.8 + r() * 1.3;
    const len = 1.6 + r() * 1.3;
    const s = mesh(roundedBox(0.2, len, 0.05), mats[Math.floor(r() * 4)], Math.cos(a) * rad, -len / 2 - (rad - 0.8) * 0.25, Math.sin(a) * rad);
    s.rotation.y = -a + Math.PI / 2;
    strands.add(s);
  }
  const curtain = baked(strands);
  curtain.position.copy(top);
  g.add(curtain);
  g.position.set(x, 0, z);
  const update = (t: number) => {
    curtain.rotation.z = Math.sin(t * 0.9 + seed) * 0.035;
    curtain.rotation.x = Math.sin(t * 0.7 + seed * 2) * 0.03;
  };
  return { group: g, update };
}

// ---------------------------------------------------------------- Jetty, deck, bridge

/** A plank jetty out over the water on posts, rails along the west side, bollards and a life ring. */
export function jetty([x0, z0, x1, z1]: Box) {
  const g = new THREE.Group();
  const w = x1 - x0;
  const d = z1 - z0;
  const cx = (x0 + x1) / 2;
  const cz = (z0 + z1) / 2;
  g.add(mesh(roundedBox(w, 0.14, d), new THREE.MeshLambertMaterial({ map: planks("#b8875a", "rgba(60,30,10,.35)", 1, d / 1.4) }), cx, 0.06, cz));
  const post = flat(0x6b4a2e);
  for (let z = z0 + 0.2; z < z1 - 0.4; z += 1.3) for (const x of [x0 + 0.1, x1 - 0.1]) g.add(mesh(new THREE.CylinderGeometry(0.09, 0.09, 1.3, 6), post, x, -0.55, z));
  for (const x of [x0 + 0.12, x1 - 0.12]) g.add(mesh(new THREE.CylinderGeometry(0.1, 0.12, 0.55, 8), post, x, 0.32, z0 + 0.15));
  const rail = flat(0x8a5f3a);
  for (let z = z0 + 0.3; z <= z1 - 0.6; z += 1.1) g.add(mesh(roundedBox(0.09, 0.8, 0.09), rail, x0 + 0.06, 0.45, z));
  g.add(mesh(roundedBox(0.08, 0.08, d - 0.9), rail, x0 + 0.06, 0.82, cz - 0.15));
  const ring = mesh(new THREE.TorusGeometry(0.24, 0.07, 6, 14), flat(0xff7a2f), x0 + 0.02, 0.55, z0 + 1.6);
  ring.rotation.y = Math.PI / 2;
  g.add(ring);
  for (const a of [0, Math.PI / 2, Math.PI, Math.PI * 1.5]) {
    const band = mesh(roundedBox(0.06, 0.16, 0.16), flat(0xfffaf0), x0 + 0.02, 0.55 + Math.sin(a) * 0.24, z0 + 1.6 + Math.cos(a) * 0.24);
    g.add(band);
  }
  return shadowed(g);
}

/** The angler's deck: a wider platform with a bench rail round three sides. */
export function fishingDeck([x0, z0, x1, z1]: Box) {
  const g = new THREE.Group();
  const w = x1 - x0;
  const d = z1 - z0;
  g.add(mesh(roundedBox(w, 0.14, d), new THREE.MeshLambertMaterial({ map: planks("#a9784e", "rgba(60,30,10,.35)", w / 1.4, 1) }), (x0 + x1) / 2, 0.06, (z0 + z1) / 2));
  const post = flat(0x6b4a2e);
  for (const x of [x0 + 0.1, (x0 + x1) / 2, x1 - 0.1]) for (const z of [z0 + 0.1, z0 + d * 0.5]) g.add(mesh(new THREE.CylinderGeometry(0.1, 0.1, 1.3, 6), post, x, -0.55, z));
  const rail = flat(0x8a5f3a);
  for (let x = x0 + 0.06; x <= x1; x += 0.9) g.add(mesh(roundedBox(0.09, 0.62, 0.09), rail, x, 0.36, z0 + 0.06));
  g.add(mesh(roundedBox(w, 0.08, 0.08), rail, (x0 + x1) / 2, 0.66, z0 + 0.06));
  for (const x of [x0 + 0.06, x1 - 0.06]) {
    for (let z = z0 + 0.06; z < z1 - 1.2; z += 0.9) g.add(mesh(roundedBox(0.09, 0.62, 0.09), rail, x, 0.36, z));
    g.add(mesh(roundedBox(0.08, 0.08, d - 1.2), rail, x, 0.66, z0 + (d - 1.2) / 2));
  }
  return shadowed(g);
}

/** A wooden footbridge over the stream, running along x, with green railings and lanterns. */
export function footBridge([x0, z0, x1, z1]: Box) {
  const g = new THREE.Group();
  const w = x1 - x0;
  const cz = (z0 + z1) / 2;
  const boards = planks("#b8875a", "rgba(60,30,10,.32)", 1, w / 1.2);
  boards.center.set(0.5, 0.5);
  boards.rotation = Math.PI / 2;
  g.add(mesh(roundedBox(w, 0.18, z1 - z0), new THREE.MeshLambertMaterial({ map: boards }), (x0 + x1) / 2, 0.08, cz));
  // Arched beams underneath, down to the water.
  const beam = flat(0x6b4a2e);
  for (const z of [z0 + 0.2, z1 - 0.2]) {
    for (let k = 0; k < 8; k++) {
      const a0 = (k / 8) * Math.PI;
      const a1 = ((k + 1) / 8) * Math.PI;
      const p = (a: number) => v3((x0 + x1) / 2 - Math.cos(a) * (w / 2 - 0.2), -0.05 - (1 - Math.sin(a)) * 0.6, z);
      g.add(rod(p(a0), p(a1), 0.08, beam, 5));
    }
  }
  const green = flat(0x2f8a5a);
  for (const z of [z0 + 0.08, z1 - 0.08]) {
    for (let x = x0 + 0.1; x <= x1 - 0.05; x += (w - 0.2) / 4) g.add(mesh(roundedBox(0.12, 0.9, 0.12), green, x, 0.55, z));
    g.add(mesh(roundedBox(w, 0.1, 0.12), green, (x0 + x1) / 2, 1.0, z));
    g.add(mesh(roundedBox(w, 0.06, 0.08), green, (x0 + x1) / 2, 0.55, z));
  }
  for (const x of [x0 + 0.1, x1 - 0.1])
    for (const z of [z0 + 0.08, z1 - 0.08]) {
      g.add(mesh(roundedBox(0.2, 0.06, 0.2), flat(0x24282e), x, 1.1, z));
      g.add(mesh(roundedBox(0.16, 0.22, 0.16), new THREE.MeshBasicMaterial({ color: 0xffe9b0 }), x, 1.24, z));
      g.add(mesh(new THREE.ConeGeometry(0.16, 0.14, 4), flat(0x24282e), x, 1.42, z));
    }
  return shadowed(g);
}

/** The sampan rental kiosk at the foot of the jetty: blue hut, paddles, a stack of life jackets. */
export function sampanKiosk(x: number, z: number) {
  const g = new THREE.Group();
  g.add(mesh(roundedBox(1.7, 1.5, 1.2), flat(0x8fc8d8), 0, 0.75, 0));
  g.add(mesh(roundedBox(1.3, 0.55, 0.06), flat(0x2a3a48), 0, 1.05, 0.61));
  g.add(mesh(roundedBox(1.5, 0.1, 0.4), flat(0xe8d8bc), 0, 0.78, 0.78));
  const roof = mesh(roundedBox(2.1, 0.1, 1.7), flat(0xd8402c), 0, 1.62, 0.1);
  roof.rotation.x = 0.16;
  g.add(roof);
  const sign = mesh(new THREE.PlaneGeometry(1.9, 0.48), new THREE.MeshLambertMaterial({ map: signTexture("SAMPAN · SEWA", "#fffdf6", "#d8402c", 512, 128, "bold 56px 'Bagel Fat One', sans-serif") }), 0, 1.98, 0.62);
  sign.rotation.x = -0.2;
  g.add(sign);
  for (const [px, c] of [[-1.05, 0xffcb05], [1.05, 0x3fae5a]] as const) {
    const paddle = new THREE.Group();
    paddle.add(mesh(new THREE.CylinderGeometry(0.03, 0.03, 1.5, 5), flat(0x9a6a3e), 0, 0.75, 0));
    paddle.add(mesh(roundedBox(0.22, 0.45, 0.04), flat(c), 0, 0.2, 0));
    paddle.position.set(px, 0, 0.62);
    paddle.rotation.z = px > 0 ? -0.15 : 0.15;
    g.add(paddle);
  }
  for (let k = 0; k < 3; k++) g.add(mesh(roundedBox(0.5, 0.16, 0.36), flat(0xff7a2f), 1.25, 0.08 + k * 0.17, -0.3));
  g.position.set(x, 0, z);
  return shadowed(g);
}

// ---------------------------------------------------------------- The sampan

/** A painted Malay sampan: long open hull with upturned ends, red gunwale, two thwarts. Faces +z. */
function sampanMesh(hull: number) {
  const g = new THREE.Group();
  const bowl = new THREE.Mesh(new THREE.SphereGeometry(1, 64, 32, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), dbl(hull));
  bowl.scale.set(0.58, 0.42, 1.65);
  g.add(bowl);
  // A complete oval inner floor above the water sheet: no blue water can cut through the hull.
  const floor = mesh(new THREE.CircleGeometry(1, 64), new THREE.MeshLambertMaterial({ map: planks("#b8875a", "rgba(60,30,10,.3)", 1, 2) }), 0, -0.20, 0);
  floor.rotation.x = -Math.PI / 2; floor.scale.set(0.53, 1.5, 1);
  g.add(floor);
  const rim = new THREE.Mesh(new THREE.TorusGeometry(1, 0.055, 10, 64), flat(0xd8402c));
  rim.rotation.x = Math.PI / 2;
  rim.scale.set(0.58, 1.65, 1);
  g.add(rim);
  for (const z of [-0.55, 0.75]) g.add(mesh(roundedBox(1.0, 0.06, 0.22), flat(0xc89a62), 0, -0.06, z));
  for (const s of [-1, 1]) {
    const tip = mesh(new THREE.CapsuleGeometry(0.065, 0.28, 6, 12), flat(hull), 0, 0.12, s * 1.62);
    tip.rotation.x = s * 1.0;
    g.add(tip);
    g.add(mesh(new THREE.SphereGeometry(0.05,20,14), flat(0xffcb05), 0, 0.3, s * 1.78));
  }
  return mergeStatic(shadowed(g));
}

/** Qish's sampan: tied up at the jetty until she boards, then it carries her about the lake (the
 * overworld moves her; the boat follows and turns, she paddles and it leaves rings behind). The
 * other rental sampans bob at their moorings. */
export function sampan(player: () => THREE.Vector3): Anim {
  const group = new THREE.Group();
  const hull = sampanMesh(0x2f8f9a);
  const paddle = new THREE.Group();
  paddle.add(mesh(new THREE.CylinderGeometry(0.03, 0.03, 1.5, 5), flat(0x9a6a3e), 0, 0, 0));
  paddle.add(mesh(roundedBox(0.2, 0.42, 0.035), flat(0xffcb05), 0, -0.85, 0));
  paddle.position.set(0.5, 0.35, 0.2);
  hull.add(shadowed(paddle));
  group.add(hull);
  const rings = Array.from({ length: 10 }, () => {
    const m = new THREE.Mesh(new THREE.RingGeometry(0.85, 1, 28), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0, depthWrite: false }));
    m.rotation.x = -Math.PI / 2;
    m.renderOrder = 2;
    group.add(m);
    return { m, born: -10 };
  });
  let next = 0;
  let lastRing = 0;
  const pos = new THREE.Vector3(DOCK[0], WATER_Y + 0.38, DOCK[1]);
  let heading = Math.PI;
  const dtOf = ticker();
  const update = (t: number) => {
    const dt = dtOf(t);
    const speed = Math.hypot(SAMPAN.vx, SAMPAN.vz);
    if (boat.riding) {
      const p = player();
      pos.set(p.x, WATER_Y + 0.38, p.z);
      heading = SAMPAN.heading;
    } else {
      pos.x += (DOCK[0] - pos.x) * Math.min(1, dt * 2);
      pos.z += (DOCK[1] - pos.z) * Math.min(1, dt * 2);
      let d = Math.PI - heading;
      d = Math.atan2(Math.sin(d), Math.cos(d));
      heading += d * Math.min(1, dt * 2);
    }
    hull.position.set(pos.x, pos.y + Math.sin(t * 1.8) * 0.035, pos.z);
    hull.rotation.set(Math.sin(t * 1.3) * 0.02, heading, Math.sin(t * 1.8 + 1) * 0.03);
    // Paddle: sweeping strokes while she rows, laid across the boat when she stops.
    const rowing = boat.riding && speed > 0.4;
    paddle.rotation.x = rowing ? Math.sin(t * 5.5) * 0.7 : 0;
    paddle.rotation.z = rowing ? 0.5 + Math.cos(t * 5.5) * 0.15 : 1.45;
    paddle.position.y = rowing ? 0.35 : 0.05;
    if (boat.riding && speed > 0.7 && t - lastRing > 0.32) {
      lastRing = t;
      const r = rings[next++ % rings.length];
      r.born = t;
      r.m.position.set(pos.x - Math.sin(heading) * 1.3, WATER_Y + 0.02, pos.z - Math.cos(heading) * 1.3);
    }
    for (const r of rings) {
      const k = (t - r.born) / 1.8;
      r.m.visible = k >= 0 && k < 1;
      if (!r.m.visible) continue;
      r.m.scale.setScalar(0.3 + k * 1.3);
      r.m.material.opacity = (1 - k) * 0.45;
    }
  };
  return { group, update };
}

// ---------------------------------------------------------------- Ripples

/** A pool of expanding rings on the water: splashes, wakes, a fish breaking the surface. */
function ripples(n = 12) {
  const group = new THREE.Group();
  const list = Array.from({ length: n }, () => {
    const m = new THREE.Mesh(new THREE.RingGeometry(0.82, 1, 24), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0, depthWrite: false }));
    m.rotation.x = -Math.PI / 2;
    m.renderOrder = 2;
    m.visible = false;
    group.add(m);
    return { m, born: -10, size: 1, life: 1.4 };
  });
  let next = 0;
  return {
    group,
    spawn(x: number, z: number, t: number, size = 1, life = 1.4) {
      const r = list[next++ % n];
      r.born = t;
      r.size = size;
      r.life = life;
      r.m.position.set(x, WATER_Y + 0.02, z);
    },
    update(t: number) {
      for (const r of list) {
        const k = (t - r.born) / r.life;
        r.m.visible = k >= 0 && k < 1;
        if (!r.m.visible) continue;
        r.m.scale.setScalar((0.2 + k) * r.size);
        r.m.material.opacity = (1 - k) * 0.55;
      }
    },
  };
}

/** Droplets thrown up by a splash. */
function droplets(n = 8) {
  const group = new THREE.Group();
  const mat = new THREE.MeshBasicMaterial({ color: 0xe8fbff });
  const list = Array.from({ length: n }, (_, i) => {
    const m = mesh(new THREE.SphereGeometry(0.045,20,14), mat);
    m.visible = false;
    group.add(m);
    return { m, a: (i / n) * Math.PI * 2 };
  });
  let born = -10;
  let at = v3(0, 0, 0);
  return {
    group,
    burst(x: number, z: number, t: number) {
      born = t;
      at = v3(x, WATER_Y, z);
    },
    update(t: number) {
      const k = (t - born) / 0.6;
      for (const d of list) {
        d.m.visible = k >= 0 && k < 1;
        if (!d.m.visible) continue;
        const r = 0.15 + k * 0.6;
        d.m.position.set(at.x + Math.cos(d.a) * r, at.y + Math.sin(k * Math.PI) * 0.5, at.z + Math.sin(d.a) * r);
      }
    },
  };
}

// ---------------------------------------------------------------- Otters

interface OtterRig {
  g: THREE.Group;
  body: THREE.Group;
  head: THREE.Group;
  tail: THREE.Group;
  snack: THREE.Mesh;
}

/** A smooth-coated otter (memerang), low-poly, facing +x. `snack` is a keropok it can carry. */
function otterRig(s = 1): OtterRig {
  const g = new THREE.Group();
  const body = new THREE.Group();
  g.add(body);
  const fur = flat(0x76502f);
  const cream = flat(0xe0c69e);
  const dark = flat(0x17151f);
  const torso = mesh(new THREE.SphereGeometry(0.2,20,14), fur, 0, 0.19, 0);
  torso.scale.set(2.0, 0.85, 0.9);
  const chest = mesh(new THREE.SphereGeometry(0.15,20,14), cream, 0.2, 0.15, 0);
  chest.scale.set(1.3, 0.75, 0.85);
  const legs = [[0.2, 0.12], [0.2, -0.12], [-0.22, 0.13], [-0.22, -0.13]].map(([lx, lz]) => mesh(new THREE.SphereGeometry(0.055,20,14), fur, lx, 0.05, lz));
  body.add(baked(torso, chest, ...legs));
  const head = new THREE.Group();
  head.position.set(0.43, 0.28, 0);
  body.add(head);
  const skull = mesh(new THREE.SphereGeometry(0.135,20,14), fur);
  skull.scale.set(1.15, 0.9, 1);
  const muzzle = mesh(new THREE.SphereGeometry(0.07,20,14), cream, 0.11, -0.035, 0);
  muzzle.scale.set(1.1, 0.75, 1.25);
  const face: THREE.Object3D[] = [skull, muzzle, mesh(roundedBox(0.04, 0.035, 0.06), dark, 0.19, -0.005, 0)];
  for (const ez of [-0.065, 0.065]) {
    face.push(mesh(new THREE.SphereGeometry(0.022,20,14), dark, 0.07, 0.05, ez));
    face.push(mesh(new THREE.SphereGeometry(0.035,20,14), fur, -0.03, 0.1, ez * 1.45));
  }
  head.add(baked(...face));
  const snack = mesh(roundedBox(0.16, 0.05, 0.08), flat(0xf2a33a), 0.2, -0.08, 0);
  snack.visible = false;
  head.add(snack);
  const tail = new THREE.Group();
  tail.position.set(-0.38, 0.17, 0);
  const cone = mesh(new THREE.ConeGeometry(0.085, 0.6, 6), fur, -0.28, 0, 0);
  cone.rotation.z = Math.PI / 2;
  tail.add(cone);
  body.add(tail);
  g.scale.setScalar(s);
  return { g: shadowed(g), body, head, tail, snack };
}

/** An otter floating on its back, paws on its belly, face to the sky. Faces +x. */
function floaterRig() {
  const g = new THREE.Group();
  const fur = flat(0x76502f);
  const cream = flat(0xe0c69e);
  const dark = flat(0x17151f);
  const torso = mesh(new THREE.SphereGeometry(0.2,20,14), fur);
  torso.scale.set(2.0, 0.7, 0.9);
  const belly = mesh(new THREE.SphereGeometry(0.17,20,14), cream, 0.02, 0.07, 0);
  belly.scale.set(1.9, 0.55, 0.8);
  g.add(torso, belly);
  g.add(mesh(new THREE.SphereGeometry(0.14,20,14), fur, 0.43, 0.1, 0));
  const face = mesh(new THREE.SphereGeometry(0.075,20,14), cream, 0.5, 0.2, 0);
  face.scale.set(1, 0.8, 1.2);
  g.add(face, mesh(roundedBox(0.05, 0.04, 0.06), dark, 0.55, 0.26, 0));
  for (const ez of [-0.06, 0.06]) {
    g.add(mesh(roundedBox(0.05, 0.015, 0.025), dark, 0.47, 0.235, ez));
    g.add(mesh(new THREE.SphereGeometry(0.05,20,14), fur, 0.2, 0.16, ez * 1.6));
    g.add(mesh(new THREE.SphereGeometry(0.05,20,14), fur, -0.36, 0.1, ez * 1.5));
  }
  const tail = mesh(new THREE.ConeGeometry(0.075, 0.5, 6), fur, -0.62, 0, 0);
  tail.rotation.z = Math.PI / 2;
  g.add(tail);
  return mergeStatic(shadowed(g));
}

const steerTo = (o: { x: number; z: number; h: number }, tx: number, tz: number, v: number, dt: number) => {
  const dx = tx - o.x;
  const dz = tz - o.z;
  const d = Math.hypot(dx, dz);
  if (d < 0.03) return 0;
  const step = Math.min(d, v * dt);
  o.x += (dx / d) * step;
  o.z += (dz / d) * step;
  let dd = Math.atan2(dx, dz) - o.h;
  dd = Math.atan2(Math.sin(dd), Math.cos(dd));
  o.h += dd * Math.min(1, dt * 4);
  return step;
};

/** A mother otter and three pups swimming laps round the island in a line, heads up, little wakes
 * behind. When Qish rows close they fall in behind her sampan and follow her about for a while. */
export function otterFamily(c: Pt, rx: number, rz: number, player: () => THREE.Vector3): Anim {
  const group = new THREE.Group();
  const wakes = ripples(14);
  group.add(wakes.group);
  const pack = [1, 0.64, 0.6, 0.56].map((s, i) => {
    const r = otterRig(s);
    group.add(r.g);
    const a = -i * 0.14;
    return { r, x: c[0] + Math.cos(a) * rx, z: c[1] + Math.sin(a) * rz, h: 0, s, lastWake: 0 };
  });
  let ang = 0;
  let follow = false;
  const dtOf = ticker();
  const update = (t: number) => {
    const dt = dtOf(t);
    const p = player();
    const lead = pack[0];
    const dBoat = Math.hypot(p.x - lead.x, p.z - lead.z);
    if (boat.riding && dBoat < 4.5) follow = true;
    if (!boat.riding || dBoat > 10) follow = false;
    if (follow) {
      const h = SAMPAN.heading;
      const tx = p.x - Math.sin(h) * 2.3 + Math.cos(h) * 0.7;
      const tz = p.z - Math.cos(h) * 2.3 - Math.sin(h) * 0.7;
      if (inPoly(LAKE, tx, tz) && !inPoly(ISLAND, tx, tz)) steerTo(lead, tx, tz, Math.max(1.4, Math.hypot(SAMPAN.vx, SAMPAN.vz) * 1.15 + 0.3), dt);
      ang = Math.atan2((lead.z - c[1]) / rz, (lead.x - c[0]) / rx);
    } else {
      ang += dt * 0.11;
      steerTo(lead, c[0] + Math.cos(ang) * rx, c[1] + Math.sin(ang) * rz, 1.3, dt);
    }
    for (let i = 1; i < pack.length; i++) {
      const prev = pack[i - 1];
      const o = pack[i];
      const tx = prev.x - Math.sin(prev.h) * 0.62;
      const tz = prev.z - Math.cos(prev.h) * 0.62;
      steerTo(o, tx, tz, Math.min(4.5, Math.hypot(tx - o.x, tz - o.z) * 2.4), dt);
    }
    pack.forEach((o, i) => {
      const dip = i ? Math.max(0, Math.sin(t * 0.45 + i * 1.9) - 0.94) * 5 : 0;
      o.r.g.position.set(o.x, WATER_Y - 0.13 * o.s + Math.sin(t * 3 + i) * 0.025 - dip * 0.3, o.z);
      o.r.g.rotation.y = o.h - Math.PI / 2;
      o.r.head.rotation.z = 0.28 + Math.sin(t * 3 + i) * 0.08;
      o.r.tail.rotation.y = Math.sin(t * 4 + i) * 0.35;
      if (t - o.lastWake > 0.7 + i * 0.05) {
        o.lastWake = t;
        wakes.spawn(o.x, o.z, t, 0.55 * o.s + 0.25, 1.3);
      }
    });
    wakes.update(t);
  };
  return { group, update };
}

/** Two otters asleep on their backs holding paws so they don't drift apart, turning slowly. */
export function otterPair(x: number, z: number): Anim {
  const group = new THREE.Group();
  const pivot = new THREE.Group();
  group.add(pivot);
  const a = floaterRig();
  const b = floaterRig();
  a.position.z = -0.32;
  b.position.z = 0.32;
  b.scale.setScalar(0.9);
  pivot.add(a, b, mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.4, 5), flat(0x76502f), 0.2, 0.17, 0).rotateX(Math.PI / 2));
  const wakes = ripples(4);
  group.add(wakes.group);
  let last = 0;
  const update = (t: number) => {
    const cx = x + Math.cos(t * 0.05) * 0.9;
    const cz = z + Math.sin(t * 0.05) * 0.6;
    pivot.position.set(cx, WATER_Y + 0.05 + Math.sin(t * 1.6) * 0.03, cz);
    pivot.rotation.y = t * 0.12;
    pivot.rotation.x = Math.sin(t * 1.6) * 0.05;
    if (t - last > 2.4) {
      last = t;
      wakes.spawn(cx, cz, t, 1.1, 2.2);
    }
    wakes.update(t);
  };
  return { group, update };
}

/** Otters sunbathing on the island rocks (one rolls about). When Qish rows up close they slide into
 * the water and swim about, and climb back out once she has gone. */
export function islandOtters(spots: { rest: [number, number, number]; water: Pt }[], c: Pt, player: () => THREE.Vector3): Anim {
  const group = new THREE.Group();
  const wakes = ripples(8);
  const drops = droplets();
  group.add(wakes.group, drops.group);
  const list = spots.map((s, i) => {
    const r = otterRig(i === 1 ? 0.8 : 0.95);
    group.add(r.g);
    return { r, s, mode: "rest" as "rest" | "out" | "swim" | "in", t0: 0, x: s.rest[0], z: s.rest[1], h: 0, ang: i * 2 };
  });
  let calmSince = 0;
  const dtOf = ticker();
  const update = (t: number) => {
    const dt = dtOf(t);
    const p = player();
    const near = Math.hypot(p.x - c[0], p.z - c[1]) < 5.2;
    if (near) calmSince = t;
    list.forEach((o, i) => {
      const [rx, rz, rot] = o.s.rest;
      const [wx, wz] = o.s.water;
      if (o.mode === "rest") {
        o.r.g.position.set(rx, 0.02, rz);
        o.r.g.rotation.set(i === 2 ? Math.sin(t * 1.1) * 1.4 : 0, rot, 0);
        o.r.head.rotation.z = i === 0 ? -0.2 + Math.sin(t * 0.8) * 0.1 : Math.sin(t * 0.5 + i) * 0.15;
        o.r.tail.rotation.y = Math.sin(t * 1.2 + i) * 0.2;
        if (near) {
          o.mode = "out";
          o.t0 = t + i * 0.35;
        }
      } else if (o.mode === "out" || o.mode === "in") {
        const out = o.mode === "out";
        const k = Math.max(0, Math.min(1, (t - o.t0) / 0.8));
        const e = out ? k : 1 - k;
        o.x = rx + (wx - rx) * e;
        o.z = rz + (wz - rz) * e;
        o.r.g.position.set(o.x, (1 - e) * 0.02 + e * (WATER_Y - 0.12) + Math.sin(k * Math.PI) * 0.45, o.z);
        o.r.g.rotation.set(0, Math.atan2(out ? wx - rx : rx - wx, out ? wz - rz : rz - wz) - Math.PI / 2, out ? -0.5 * Math.sin(k * Math.PI) : 0.5 * Math.sin(k * Math.PI));
        if (out && k >= 1) {
          o.mode = "swim";
          o.h = 0;
          wakes.spawn(wx, wz, t, 1.2, 1.2);
          drops.burst(wx, wz, t);
          if (i === 0) sfx.splash();
        }
        if (!out && k >= 1) o.mode = "rest";
      } else {
        o.ang += dt * (0.7 + i * 0.15);
        const tx = wx + Math.cos(o.ang) * 1.0;
        const tz = wz + Math.sin(o.ang) * 0.8;
        steerTo(o, tx, tz, 1.4, dt);
        o.r.g.position.set(o.x, WATER_Y - 0.12 + Math.sin(t * 3 + i) * 0.025, o.z);
        o.r.g.rotation.set(0, o.h - Math.PI / 2, 0);
        o.r.head.rotation.z = 0.3;
        if (t - calmSince > 3 + i) {
          o.mode = "in";
          o.t0 = t;
          o.x = wx;
          o.z = wz;
        }
      }
    });
    wakes.update(t);
    drops.update(t);
  };
  return { group, update };
}

/** The picnic's nemesis: an otter swims in, scurries up the lawn, nicks a packet of keropok from the
 * basket ("WOI!"), and gallops back into the lake to eat it, every half minute or so. */
export function otterThief(water: Pt, shore: Pt, basket: Pt, shoutAt: [number, number, number]): Anim {
  const group = new THREE.Group();
  const r = otterRig(0.9);
  group.add(r.g);
  const wakes = ripples(6);
  const drops = droplets();
  const bubble = shout(shoutAt[1]);
  group.add(wakes.group, drops.group, bubble.sprite);
  const P = 32;
  let lastPhase = -1;
  let lastWake = 0;
  const lerp = (a: Pt, b: Pt, k: number): Pt => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k];
  const face = (a: Pt, b: Pt) => Math.atan2(b[0] - a[0], b[1] - a[1]) - Math.PI / 2;
  const update = (t: number) => {
    const k = t % P;
    let at: Pt;
    let y = WATER_Y - 0.12;
    let rot = 0;
    let gallop = false;
    let phase = 0;
    r.head.rotation.z = 0.25;
    if (k < 3) {
      at = lerp(water, shore, k / 3);
      rot = face(water, shore);
    } else if (k < 3.6) {
      phase = 1;
      at = shore;
      const e = (k - 3) / 0.6;
      y = WATER_Y - 0.12 + e * (0.12 - WATER_Y) + Math.sin(e * Math.PI) * 0.3;
      rot = face(water, shore);
    } else if (k < 7) {
      phase = 2;
      at = lerp(shore, basket, (k - 3.6) / 3.4);
      y = 0;
      gallop = true;
      rot = face(shore, basket);
    } else if (k < 8.4) {
      phase = 3;
      at = basket;
      y = 0;
      rot = face(shore, basket);
      r.head.rotation.z = -0.5 + Math.abs(Math.sin(k * 9)) * 0.4;
    } else if (k < 11.4) {
      phase = 4;
      at = lerp(basket, shore, (k - 8.4) / 3);
      y = 0;
      gallop = true;
      rot = face(basket, shore);
    } else if (k < 12) {
      phase = 5;
      at = shore;
      const e = (k - 11.4) / 0.6;
      y = (1 - e) * 0 + e * (WATER_Y - 0.12) + Math.sin(e * Math.PI) * 0.35;
      rot = face(basket, shore) + Math.PI;
    } else {
      phase = 6;
      // Back out on the water, turning lazy circles with its prize.
      const a = (k - 12) * 0.5;
      at = [water[0] + Math.cos(a) * 1.2, water[1] + Math.sin(a) * 0.8];
      rot = -a - Math.PI;
    }
    r.snack.visible = phase >= 3 && k > 7.7 && k < P - 4;
    r.g.position.set(at[0], y + (gallop ? Math.abs(Math.sin(k * 13)) * 0.12 : 0), at[1]);
    r.g.rotation.set(0, rot, gallop ? Math.sin(k * 13) * 0.12 : 0);
    r.tail.rotation.y = Math.sin(t * (gallop ? 12 : 4)) * 0.35;
    if (phase !== lastPhase) {
      if (phase === 3) {
        bubble.say("WOI! Keropok saya!");
      }
      if (phase === 6 || phase === 1) {
        drops.burst(at[0], at[1], t);
        wakes.spawn(at[0], at[1], t, 1.1);
      }
      lastPhase = phase;
    }
    if ((phase === 0 || phase === 6) && t - lastWake > 0.7) {
      lastWake = t;
      wakes.spawn(at[0], at[1], t, 0.6, 1.2);
    }
    bubble.update(t, shoutAt[0], shoutAt[2]);
    wakes.update(t);
    drops.update(t);
  };
  return { group, update };
}

// ---------------------------------------------------------------- Anglers

/** A striped beach parasol. */
export function parasol(x: number, z: number, a: string, b: string, h = 2.3, tilt: [number, number] = [0, 0]) {
  const g = new THREE.Group();
  g.add(mesh(new THREE.CylinderGeometry(0.035, 0.035, h, 5), flat(0xe8e2d6), 0, h / 2, 0));
  const tex = canvasTexture(128, 16, (c) => {
    for (let i = 0; i < 8; i++) {
      c.fillStyle = i % 2 ? b : a;
      c.fillRect(i * 16, 0, 16, 16);
    }
  });
  const canopy = mesh(new THREE.ConeGeometry(1.25, 0.45, 8, 1, true), new THREE.MeshLambertMaterial({ map: tex, side: THREE.DoubleSide }), 0, h, 0);
  g.add(canopy, mesh(new THREE.SphereGeometry(0.06,20,14), flat(0xfffaf0), 0, h + 0.25, 0));
  g.rotation.set(tilt[0], 0, tilt[1]);
  g.position.set(x, 0, z);
  return shadowed(g);
}

export interface Angler {
  x: number;
  z: number;
  /** Deck height under the stool. */
  y: number;
  look: PersonLook & { hat: string };
  /** Where the float sits on the water. */
  float: Pt;
}

/** Pakcik-pakcik memancing: seen from behind on their stools, rods out over the water, floats bobbing.
 * Now and then a float twitches, the rod jerks up and a fish comes flying out ("Dapat!"). If Qish rows
 * right up to their floats they shush her. */
export async function anglers(list: Angler[], player: () => THREE.Vector3): Promise<Anim> {
  const group = new THREE.Group();
  const wakes = ripples(8);
  group.add(wakes.group);
  const rodMat = flat(0x2a2a30);
  const fishMat = flat(0xc9d6de);
  const rigs = await Promise.all(
    list.map(async (a, i) => {
      const s = await paperStandee(fisherBackDoodle(a.look), 1.55);
      s.group.position.set(a.x, a.y, a.z);
      group.add(s.group);
      const hand = v3(a.x, a.y + 1.0, a.z - 0.25);
      const F = v3(a.float[0], WATER_Y + 0.03, a.float[1]);
      const dir = F.clone().sub(hand).setY(0).normalize();
      const rest = hand.clone().addScaledVector(dir, 2.2).setY(a.y + 2.0);
      const rodM = rod(hand, rest, 0.022, rodMat, 5);
      group.add(rodM);
      const lineGeo = new THREE.BufferGeometry().setFromPoints([rest, F]);
      const line = new THREE.Line(lineGeo, new THREE.LineBasicMaterial({ color: 0xf6f6f0 }));
      group.add(line);
      const float = new THREE.Group();
      float.add(mesh(new THREE.SphereGeometry(0.07,20,14), flat(0xe3350d), 0, 0.03, 0), mesh(new THREE.SphereGeometry(0.06,20,14), flat(0xfffaf0), 0, -0.04, 0));
      group.add(float);
      const fish = new THREE.Group();
      const fb = mesh(new THREE.SphereGeometry(0.12,20,14), fishMat);
      fb.scale.set(1.6, 0.8, 0.55);
      const ft = mesh(new THREE.ConeGeometry(0.1, 0.18, 4), flat(0xf2a33a), -0.24, 0, 0);
      ft.rotation.z = -Math.PI / 2;
      fish.add(fb, ft);
      fish.visible = false;
      group.add(fish);
      group.add(mesh(new THREE.CylinderGeometry(0.17, 0.13, 0.3, 8), flat(0x3b6fe0), a.x + 0.62, a.y + 0.15, a.z + 0.15));
      group.add(mesh(roundedBox(0.5, 0.32, 0.34), flat(0xe3350d), a.x - 0.66, a.y + 0.16, a.z + 0.2));
      group.add(mesh(roundedBox(0.52, 0.06, 0.36), flat(0xfffaf0), a.x - 0.66, a.y + 0.35, a.z + 0.2));
      const bubble = shout(a.y + 2.6);
      group.add(bubble.sprite);
      return { a, hand, F, rest, rodM, line, float, fish, bubble, P: 21 + i * 6, off: i * 7.3, phase: 0, hushed: -20 };
    }),
  );
  const tip = v3(0, 0, 0);
  const update = (t: number) => {
    const p = player();
    for (const r of rigs) {
      const k = (t + r.off) % r.P;
      const strike = r.P - 6;
      let fy = WATER_Y + 0.03 + Math.sin(t * 2.2 + r.off) * 0.025;
      tip.copy(r.rest);
      let phase = 0;
      if (k > strike - 2 && k < strike) fy += Math.sin(t * 14) * 0.04 - 0.04;
      if (k >= strike && k < strike + 3.2) {
        phase = 1;
        const e = Math.min(1, (k - strike) / 0.35);
        tip.y += e * 0.75;
        tip.lerp(r.hand, e * 0.25);
        const f = Math.min(1, (k - strike) / 1.1);
        r.fish.visible = true;
        const fp = r.F.clone().lerp(tip, f);
        fp.y += Math.sin(f * Math.PI) * 0.9 - (f >= 1 ? 0.35 : 0);
        r.fish.position.copy(fp);
        r.fish.rotation.set(0, 0, f < 1 ? t * 12 : Math.sin(t * 22) * 0.6 - 1.4);
        fy = r.F.y + Math.sin(f * Math.PI) * 0.3;
      } else r.fish.visible = false;
      if (phase !== r.phase) {
        if (phase === 1) {
          wakes.spawn(r.F.x, r.F.z, t, 1.2);
          r.bubble.say(["Dapat!", "Haaa! Besar!", "Rezeki!"][Math.floor((t / r.P) % 3)]);
        }
        r.phase = phase;
      }
      const fx = phase ? r.fish.position.x : r.F.x;
      const fz = phase ? r.fish.position.z : r.F.z;
      r.float.position.set(phase ? fx : r.F.x, phase ? r.fish.position.y + 0.15 : fy, phase ? fz : r.F.z);
      aim(r.rodM, r.hand, tip);
      const pos = r.line.geometry.attributes.position as THREE.BufferAttribute;
      pos.setXYZ(0, tip.x, tip.y, tip.z);
      pos.setXYZ(1, r.float.position.x, r.float.position.y, r.float.position.z);
      pos.needsUpdate = true;
      if (boat.riding && Math.hypot(p.x - r.F.x, p.z - r.F.z) < 2.6 && t - r.hushed > 9) {
        r.hushed = t;
        r.bubble.say("Shhh! Ikan lari!");
      }
      r.bubble.update(t, r.a.x, r.a.z);
    }
    wakes.update(t);
  };
  return { group, update };
}

// ---------------------------------------------------------------- Batik

interface BatikPal {
  bg: string;
  petal: string;
  petal2: string;
  leaf: string;
  dot: string;
}

const BATIK: BatikPal[] = [
  { bg: "#1f6f8b", petal: "#ff7aa8", petal2: "#ffc2da", leaf: "#5fae4a", dot: "#ffcb05" },
  { bg: "#7a2a5a", petal: "#ffd3e2", petal2: "#ff8fb8", leaf: "#7dd3c0", dot: "#ffe08a" },
  { bg: "#e3742d", petal: "#fff0c2", petal2: "#ffd84a", leaf: "#2f8a5a", dot: "#7a2a5a" },
  { bg: "#3b4fa8", petal: "#fffaf0", petal2: "#b9c4ff", leaf: "#9fd3b0", dot: "#ff9cc2" },
  { bg: "#2f8a5a", petal: "#ffb4a8", petal2: "#fffaf0", leaf: "#c8e66a", dot: "#ff6f6f" },
];

type BatikShape = { kind: "petal" | "petal2" | "leaf" | "dot"; x: number; y: number; rx: number; ry: number; rot: number };

/** Lily motifs for a batik, in unit coordinates: flowers on a jittered grid, leaves, golden centres. */
function batikShapes(seed: number, cols: number, rows: number) {
  const r = rng(seed);
  const shapes: BatikShape[] = [];
  const swirls: [number, number, number][] = [];
  for (let j = 0; j < rows; j++)
    for (let i = 0; i < cols; i++) {
      const x = (i + 0.5 + (r() - 0.5) * 0.35) / cols;
      const y = (j + 0.5 + (r() - 0.5) * 0.35) / rows;
      const rad = (0.5 / Math.max(cols, rows)) * (0.75 + r() * 0.2);
      const turn = r() * Math.PI;
      for (const s of [-1, 1]) shapes.push({ kind: "leaf", x: x + Math.cos(turn + s * 1.9) * rad * 1.15, y: y + Math.sin(turn + s * 1.9) * rad * 1.15, rx: rad * 0.55, ry: rad * 0.22, rot: turn + s * 1.9 });
      for (let k = 0; k < 6; k++) {
        const a = turn + (k / 6) * Math.PI * 2;
        shapes.push({ kind: k % 2 ? "petal2" : "petal", x: x + Math.cos(a) * rad * 0.5, y: y + Math.sin(a) * rad * 0.5, rx: rad * 0.5, ry: rad * 0.21, rot: a });
      }
      shapes.push({ kind: "dot", x, y, rx: rad * 0.2, ry: rad * 0.2, rot: 0 });
      swirls.push([(i + 1) / cols, (j + (j % 2 ? 0.1 : 0.9)) / rows, rad * 0.45]);
    }
  return { shapes, swirls };
}

/** Paint a batik onto a canvas. `progress` < 1 is a piece still being worked: the wax lines are all
 * drawn but only some of the colour is in, on bare white cloth. */
function paintBatik(c: CanvasRenderingContext2D, w: number, h: number, pal: BatikPal, motif: ReturnType<typeof batikShapes>, progress = 1) {
  const done = progress >= 1;
  c.fillStyle = done ? pal.bg : "#fbf6ea";
  c.fillRect(0, 0, w, h);
  const n = Math.floor(motif.shapes.length * Math.min(1, progress * 1.15));
  const ell = (s: BatikShape) => {
    c.beginPath();
    c.ellipse(s.x * w, s.y * h, s.rx * Math.min(w, h) * 1.4, s.ry * Math.min(w, h) * 1.4, s.rot, 0, Math.PI * 2);
  };
  motif.shapes.forEach((s, i) => {
    if (i >= n) return;
    ell(s);
    c.fillStyle = pal[s.kind];
    c.fill();
  });
  // Wax lines (cream on the finished cloth, tan while the wax is still on).
  c.strokeStyle = done ? "#f8eed6" : "#d9bf86";
  c.lineWidth = Math.max(2, w / 110);
  for (const s of motif.shapes) {
    ell(s);
    c.stroke();
  }
  for (const [sx, sy, sr] of motif.swirls) {
    c.beginPath();
    for (let a = 0; a < Math.PI * 4; a += 0.2) {
      const rr = (sr * Math.min(w, h) * a) / (Math.PI * 4);
      const px = sx * w + Math.cos(a) * rr;
      const py = sy * h + Math.sin(a) * rr;
      if (a) c.lineTo(px, py);
      else c.moveTo(px, py);
    }
    c.stroke();
  }
  c.lineWidth = Math.max(3, w / 70);
  c.strokeRect(w * 0.035, h * 0.04, w * 0.93, h * 0.92);
  c.fillStyle = c.strokeStyle;
  for (let x = w * 0.06; x < w * 0.95; x += w / 18) {
    c.beginPath();
    c.arc(x, h * 0.02 + 2, 2, 0, Math.PI * 2);
    c.arc(x, h * 0.98 - 2, 2, 0, Math.PI * 2);
    c.fill();
  }
}

/** Sudut batik lukis: three painting frames on easels facing the path (the middle one being worked
 * on, its colours filling in as you watch), finished batiks swaying on a line behind, a table of dye
 * pots and a pot of wax steaming on its little stove. `statics` is for the zone to bake. */
export function batikCorner(x: number, z: number): Anim & { statics: THREE.Group } {
  const group = new THREE.Group();
  const statics = new THREE.Group();
  const wood = flat(0x8a5f3a);
  const frame = (fx: number, tex: THREE.Texture) => {
    const g = new THREE.Group();
    const cloth = mesh(new THREE.PlaneGeometry(1.45, 0.98), new THREE.MeshLambertMaterial({ map: tex, side: THREE.DoubleSide }), 0, 0, 0.02);
    g.add(cloth);
    for (const sy of [-1, 1]) g.add(mesh(roundedBox(1.62, 0.07, 0.07), wood, 0, sy * 0.52, 0));
    for (const sx of [-1, 1]) g.add(mesh(roundedBox(0.07, 1.12, 0.07), wood, sx * 0.78, 0, 0));
    g.position.set(fx, 1.25, 0);
    g.rotation.x = -0.38;
    const legs = new THREE.Group();
    for (const sx of [-0.6, 0.6]) legs.add(rod(v3(fx + sx, 0, 0.35), v3(fx + sx * 0.9, 1.75, -0.2), 0.035, wood, 5));
    legs.add(rod(v3(fx, 0, -0.75), v3(fx, 1.7, -0.2), 0.035, wood, 5));
    return { g, legs };
  };
  const finished = [0, 2].map((pal, i) => {
    const tex = canvasTexture(256, 172, (c) => paintBatik(c, 256, 172, BATIK[pal], batikShapes(40 + i, 3, 2)));
    return frame(i ? 1.95 : -1.95, tex);
  });
  for (const f of finished) statics.add(f.g, f.legs);
  // The piece in progress redraws a little more colour every half second, then starts a new cloth.
  const live = document.createElement("canvas");
  live.width = 256;
  live.height = 172;
  const lg = live.getContext("2d")!;
  const liveTex = new THREE.CanvasTexture(live);
  liveTex.colorSpace = THREE.SRGBColorSpace;
  const wip = frame(0, liveTex);
  group.add(wip.g);
  statics.add(wip.legs);
  let motif = batikShapes(77, 3, 2);
  let lastDraw = -1;
  let cloth = 0;
  // Finished batiks drying on a line at the back, swinging in the breeze.
  for (const px of [-2.9, 2.9]) {
    statics.add(mesh(new THREE.CylinderGeometry(0.05, 0.06, 2.6, 6), wood, px, 1.3, -1.7));
  }
  statics.add(rod(v3(-2.9, 2.5, -1.7), v3(2.9, 2.5, -1.7), 0.015, flat(0xf4f1e6), 4));
  const hung = [1, 3, 4, 0].map((pal, i) => {
    const tex = canvasTexture(128, 200, (c) => paintBatik(c, 128, 200, BATIK[pal], batikShapes(60 + i, 2, 3)));
    const geo = new THREE.PlaneGeometry(1.1, 1.7, 1, 8);
    geo.translate(0, -0.85, 0);
    const m = mesh(geo, new THREE.MeshLambertMaterial({ map: tex, side: THREE.DoubleSide }), -2.05 + i * 1.37, 2.48, -1.7);
    group.add(m);
    return { m, base: (geo.attributes.position.array as Float32Array).slice() };
  });
  // Banner on the poles.
  const banner = mesh(new THREE.PlaneGeometry(4.6, 0.62), new THREE.MeshLambertMaterial({ map: signTexture("CANTING BATIK · CUBA SENDIRI", "#7a2a5a", "#ffe08a", 768, 104, "bold 44px 'Bagel Fat One', sans-serif"), side: THREE.DoubleSide }), 0, 2.95, -1.7);
  statics.add(banner);
  // Dye table and the wax stove.
  statics.add(mesh(roundedBox(1.5, 0.08, 0.75), flat(0xc89a62), 3.55, 0.78, 0.25));
  for (const [lx, lz] of [[-0.65, -0.3], [0.65, -0.3], [-0.65, 0.3], [0.65, 0.3]]) statics.add(mesh(roundedBox(0.06, 0.78, 0.06), wood, 3.55 + lx, 0.39, 0.25 + lz));
  ["#e3350d", "#ffcb05", "#3b6fe0", "#3fae5a", "#ff5c93", "#9b6ad6"].forEach((col, i) => {
    const px = 3.0 + (i % 3) * 0.3;
    const pz = 0.08 + Math.floor(i / 3) * 0.3;
    statics.add(mesh(new THREE.CylinderGeometry(0.1, 0.09, 0.14, 8), flat(0xfffaf0), px, 0.89, pz));
    statics.add(mesh(new THREE.CylinderGeometry(0.085, 0.085, 0.02, 8), flat(new THREE.Color(col).getHex()), px, 0.96, pz));
  });
  statics.add(mesh(new THREE.CylinderGeometry(0.16, 0.18, 0.14, 8), flat(0x2a2a30), 4.05, 0.89, 0.42));
  statics.add(mesh(new THREE.CylinderGeometry(0.13, 0.12, 0.16, 8), flat(0x8a6a44), 4.05, 1.02, 0.42));
  const steam = smoke(4.05, 1.12, 0.42, { n: 4, rise: 0.8, size: 0.25, color: 0xffffff, opacity: 0.35 });
  group.add(steam.group);
  group.position.set(x, 0, z);
  statics.position.set(x, 0, z);
  const update = (t: number) => {
    const cyc = t % 50;
    if (Math.floor(t / 50) !== cloth) {
      cloth = Math.floor(t / 50);
      motif = batikShapes(77 + cloth * 13, 3, 2);
    }
    if (t - lastDraw > 0.5) {
      lastDraw = t;
      paintBatik(lg, 256, 172, BATIK[cloth % BATIK.length], motif, Math.min(1, cyc / 40) * 0.999);
      liveTex.needsUpdate = true;
    }
    hung.forEach(({ m, base }, i) => {
      const pos = m.geometry.attributes.position as THREE.BufferAttribute;
      const gust = 0.6 + Math.max(0, Math.sin(t * 0.35 + i)) * 0.8;
      for (let v = 0; v < pos.count; v++) {
        const y = base[v * 3 + 1];
        const k = -y / 1.7;
        pos.setZ(v, Math.sin(t * 2.0 + i * 0.9 + k * 2) * 0.18 * k * gust);
      }
      pos.needsUpdate = true;
    });
    steam.update(t);
  };
  return { group, update, statics };
}

// ---------------------------------------------------------------- Car boot sale

type CarKind = "hatch" | "sedan" | "mpv";

/** A car with its boot open, nose towards -z. */
function bootCar(kind: CarKind, color: number) {
  const g = new THREE.Group();
  const L = kind === "hatch" ? 3.4 : kind === "sedan" ? 4.0 : 4.1;
  const paint = flat(color);
  const glass = flat(0x2f4258);
  const dark = flat(0x1c1c22);
  g.add(mesh(roundedBox(1.8, 0.7, L), paint, 0, 0.62, 0));
  const cab =
    kind === "hatch" ? { z: 0.27, d: 2.5, h: 0.68 } : kind === "sedan" ? { z: -0.25, d: 1.9, h: 0.62 } : { z: 0.3, d: 3.2, h: 0.82 };
  const roof = 0.97 + cab.h;
  g.add(mesh(roundedBox(1.62, cab.h, cab.d), paint, 0, 0.97 + cab.h / 2, cab.z));
  g.add(mesh(roundedBox(1.66, cab.h * 0.66, cab.d - 0.3), glass, 0, 0.97 + cab.h * 0.52, cab.z));
  for (const [wx, wz] of [[-0.86, L / 2 - 0.75], [0.86, L / 2 - 0.75], [-0.86, -L / 2 + 0.75], [0.86, -L / 2 + 0.75]]) {
    const w = mesh(new THREE.CylinderGeometry(0.34, 0.34, 0.25, 10), dark, wx, 0.34, wz);
    w.rotation.z = Math.PI / 2;
    g.add(w);
  }
  for (const hx of [-0.6, 0.6]) {
    g.add(mesh(roundedBox(0.35, 0.16, 0.05), new THREE.MeshBasicMaterial({ color: 0xfff6cf }), hx, 0.78, -L / 2 - 0.01));
    g.add(mesh(roundedBox(0.3, 0.16, 0.05), flat(0xd8282a), hx, 0.82, L / 2 + 0.01));
  }
  const lid = new THREE.Group();
  if (kind === "sedan") {
    g.add(mesh(roundedBox(1.5, 0.12, 1.15), dark, 0, 0.92, L / 2 - 0.62));
    lid.position.set(0, 0.98, cab.z + cab.d / 2);
    lid.add(mesh(roundedBox(1.62, 0.05, 1.2), paint, 0, 0, 0.6));
    lid.rotation.x = -1.3;
  } else {
    const back = cab.z + cab.d / 2;
    g.add(mesh(roundedBox(1.5, cab.h + 0.25, 0.6), dark, 0, 0.97 + cab.h / 2 - 0.1, back - 0.28));
    lid.position.set(0, roof, back);
    lid.add(mesh(roundedBox(1.6, cab.h + 0.3, 0.06), paint, 0, -(cab.h + 0.3) / 2, 0));
    lid.add(mesh(roundedBox(1.4, (cab.h + 0.3) * 0.55, 0.07), glass, 0, -(cab.h + 0.3) * 0.32, 0.005));
    lid.rotation.x = -2.0;
  }
  g.add(lid);
  return { g, L };
}

export type BootKind = "kuih" | "pokok" | "preloved" | "vinyl";

/** One car boot pitch: the car, a folding table behind its open boot with the goods, a cardboard
 * sign and a parasol. Static. Returns the group and the length of the car (the table sits behind it). */
export function bootStall(x: number, z: number, kind: BootKind, color: number) {
  const g = new THREE.Group();
  const carKind: CarKind = kind === "kuih" ? "hatch" : kind === "pokok" ? "sedan" : kind === "preloved" ? "mpv" : "mpv";
  const { g: car, L } = bootCar(carKind, color);
  g.add(car);
  const tz = L / 2 + 0.95;
  const cloth = { kuih: 0xffe3ea, pokok: 0xdff2d0, preloved: 0xe8e2f6, vinyl: 0xf2e6c8 }[kind];
  g.add(mesh(roundedBox(1.8, 0.06, 0.78), flat(cloth), 0, 0.76, tz));
  g.add(mesh(roundedBox(1.8, 0.4, 0.02), flat(cloth), 0, 0.56, tz + 0.39));
  for (const lx of [-0.8, 0.8]) g.add(mesh(roundedBox(0.05, 0.74, 0.05), flat(0x9a9aa2), lx, 0.37, tz - 0.3));
  const top = 0.8;
  const label = { kuih: "KUIH MUIH RM1", pokok: "POKOK BUNGA", preloved: "PRELOVED RM5", vinyl: "VINYL · KASET" }[kind];
  const sign = mesh(new THREE.PlaneGeometry(0.9, 0.34), new THREE.MeshLambertMaterial({ map: signTexture(label, "#d9b98a", INK, 384, 144, "bold 44px 'Gaegu', sans-serif"), side: THREE.DoubleSide }), -0.4, 0.62, tz + 0.42);
  g.add(sign);
  if (kind === "kuih") {
    const kuih = [
      [0xe3350d, 0xfffaf0],
      [0x3fae5a, 0xfffaf0],
      [0x7a3b22, 0xffcb05],
    ];
    kuih.forEach(([a, b], i) => {
      const tx = -0.55 + i * 0.55;
      g.add(mesh(roundedBox(0.48, 0.04, 0.38), flat(0xd9d2c4), tx, top, tz - 0.05));
      for (let r = 0; r < 2; r++)
        for (let c = 0; c < 3; c++) {
          const px = tx - 0.14 + c * 0.14;
          const pz = tz - 0.15 + r * 0.18;
          if (i === 1) g.add(mesh(new THREE.SphereGeometry(0.05,20,14), flat(a), px, top + 0.06, pz));
          else for (let l = 0; l < 3; l++) g.add(mesh(roundedBox(0.1, 0.03, 0.1), flat(l % 2 ? b : a), px, top + 0.04 + l * 0.03, pz));
        }
    });
    for (let i = 0; i < 4; i++) g.add(mesh(roundedBox(0.1, 0.16, 0.07), flat([0xffcb05, 0x3b6fe0, 0xff8fb1, 0x3fae5a][i]), 0.45 + i * 0.12, top + 0.08, tz + 0.25));
    g.add(mesh(roundedBox(0.6, 0.4, 0.4), flat(0x3b6fe0), 1.25, 0.2, tz - 0.2));
  } else if (kind === "pokok") {
    LILIUM.slice(0, 4).forEach((col, i) => g.add(potLily(-0.6 + i * 0.4, tz - 0.05, col, i * 3, top - 0.02)));
    for (const [px, pz, s] of [[-1.25, tz + 0.1, 1.2], [1.25, tz - 0.1, 1.0], [1.15, tz + 0.65, 0.8]] as const) {
      g.add(mesh(new THREE.CylinderGeometry(0.26 * s, 0.2 * s, 0.4 * s, 8), flat(0xc4673a), px, 0.2 * s, pz));
      g.add(mesh(new THREE.SphereGeometry(0.38 * s, 24, 16), flat(0x4f9a3a), px, 0.6 * s, pz));
    }
    g.add(potLily(0.4, tz + 0.75, 0xfffaf2, 9));
    g.add(potLily(-0.9, tz + 0.8, 0xff9cc2, 12));
  } else if (kind === "preloved") {
    for (let i = 0; i < 4; i++) for (let l = 0; l < 3; l++) g.add(mesh(roundedBox(0.34, 0.05, 0.28), flat([0xff8fb1, 0x3d4a7a, 0xf2f0ea, 0x46b86a, 0xffcb05, 0x9b6ad6][(i + l * 2) % 6]), -0.6 + i * 0.4, top + 0.03 + l * 0.05, tz - 0.05));
    const rx = 1.5;
    for (const pz of [tz - 0.6, tz + 0.6]) g.add(mesh(new THREE.CylinderGeometry(0.025, 0.025, 1.6, 5), flat(0x9a9aa2), rx, 0.8, pz));
    g.add(mesh(new THREE.CylinderGeometry(0.02, 0.02, 1.2, 5), flat(0x9a9aa2), rx, 1.58, tz).rotateX(Math.PI / 2));
    for (let i = 0; i < 5; i++) {
      const shirt = mesh(roundedBox(0.05, 0.6, 0.42), flat([0xe3350d, 0xfffaf0, 0x3b6fe0, 0x2a2730, 0xffcb05][i]), rx, 1.25, tz - 0.45 + i * 0.22);
      shirt.rotation.y = 0.12 * (i - 2);
      g.add(shirt);
    }
    for (let i = 0; i < 3; i++) for (const s of [-1, 1]) g.add(mesh(roundedBox(0.1, 0.08, 0.24), flat([0xfffaf0, 0xe3350d, 0x2a2730][i]), -0.6 + i * 0.5 + s * 0.07, 0.04, tz + 0.75));
  } else {
    for (let c = 0; c < 2; c++) {
      const cx = -0.45 + c * 0.75;
      g.add(mesh(roundedBox(0.6, 0.3, 0.38), flat(0xb07a4a), cx, top + 0.15, tz - 0.08));
      for (let i = 0; i < 7; i++) {
        const rec = mesh(roundedBox(0.03, 0.32, 0.32), flat([0xe3350d, 0xffcb05, 0x2a2730, 0x9b6ad6, 0x3fae5a, 0xff8fb1, 0xfffaf0][(i + c * 3) % 7]), cx - 0.24 + i * 0.08, top + 0.3, tz - 0.08);
        rec.rotation.z = -0.15;
        g.add(rec);
      }
    }
    g.add(mesh(roundedBox(0.4, 0.1, 0.32), flat(0x6b4a2e), 0.68, top + 0.05, tz + 0.15));
    g.add(mesh(new THREE.CylinderGeometry(0.13, 0.13, 0.015, 16), flat(0x17151f), 0.66, top + 0.11, tz + 0.15));
    for (let i = 0; i < 5; i++) g.add(mesh(roundedBox(0.16, 0.03, 0.1), flat([0x2a2730, 0xffcb05, 0xfffaf0][i % 3]), -0.2, top + 0.02 + i * 0.03, tz + 0.25));
  }
  // Something left in the boot too.
  g.add(mesh(roundedBox(0.5, 0.3, 0.4), flat(0xc9a77a), -0.35, 1.1, L / 2 - 0.4));
  g.position.set(x, 0, z);
  return { group: shadowed(g), tableZ: z + tz };
}

// ---------------------------------------------------------------- Picnic

/** A gingham picnic blanket. */
export function picnicMat(x: number, z: number, w: number, d: number, a: string, rot = 0) {
  const tex = canvasTexture(64, 64, (c) => {
    c.fillStyle = "#fffaf0";
    c.fillRect(0, 0, 64, 64);
    c.fillStyle = a;
    c.globalAlpha = 0.55;
    for (let i = 0; i < 64; i += 16) {
      c.fillRect(i, 0, 8, 64);
      c.fillRect(0, i, 64, 8);
    }
  });
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(w / 1.2, d / 1.2);
  const m = mesh(new THREE.PlaneGeometry(w, d), new THREE.MeshLambertMaterial({ map: tex }), x, 0.035, z);
  m.rotation.set(-Math.PI / 2, 0, rot);
  m.receiveShadow = true;
  return m;
}

/** What's on the blanket: a wicker basket, plates of food, a flask, cups and a packet of keropok. */
export function picnicSpread(x: number, z: number, seed = 0) {
  const g = new THREE.Group();
  const r = rng(seed + 5);
  const wicker = flat(0xc8924a);
  g.add(mesh(roundedBox(0.6, 0.36, 0.4), wicker, 0, 0.2, 0));
  g.add(mesh(roundedBox(0.62, 0.05, 0.42), flat(0xa8743a), 0, 0.4, 0));
  const handle = mesh(new THREE.TorusGeometry(0.22, 0.025, 4, 10, Math.PI), wicker, 0, 0.4, 0);
  g.add(handle);
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2 + seed;
    const px = Math.cos(a) * 0.75;
    const pz = Math.sin(a) * 0.55;
    g.add(mesh(new THREE.CylinderGeometry(0.2, 0.17, 0.03, 12), flat(0xfffaf0), px, 0.05, pz));
    const food = [0xffcb05, 0xe3350d, 0x7a3b22, 0x3fae5a, 0xf2a33a][Math.floor(r() * 5)];
    for (let k = 0; k < 3; k++) g.add(mesh(new THREE.SphereGeometry(0.06, 24, 16), flat(food), px + (r() - 0.5) * 0.16, 0.1, pz + (r() - 0.5) * 0.16));
  }
  g.add(mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.36, 8), flat(0xe3350d), 0.45, 0.2, -0.35));
  g.add(mesh(new THREE.CylinderGeometry(0.085, 0.085, 0.06, 8), flat(0xd9d2c4), 0.45, 0.41, -0.35));
  for (const [cx, cz] of [[-0.35, 0.4], [0.1, 0.5]]) g.add(mesh(new THREE.CylinderGeometry(0.06, 0.05, 0.12, 8), flat(0xff8fb1), cx, 0.08, cz));
  g.add(mesh(roundedBox(0.3, 0.06, 0.2), flat(0xf2a33a), -0.55, 0.06, -0.2));
  g.position.set(x, 0, z);
  return shadowed(g);
}

/** A kid's soap bubbles drifting off on the breeze and popping. */
export function soapBubbles(x: number, y: number, z: number): Anim {
  const group = new THREE.Group();
  const mats = [0xbfe8ff, 0xffd3ec, 0xe2ffd8, 0xfff2b8].map((c) => new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: 0.45, depthWrite: false }));
  const shine = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const r = rng(91);
  const list = Array.from({ length: 14 }, (_, i) => {
    const b = new THREE.Group();
    const s = 0.06 + r() * 0.08;
    b.add(mesh(new THREE.SphereGeometry(s,20,14), mats[i % 4]));
    b.add(mesh(new THREE.SphereGeometry(s * 0.22,20,14), shine, -s * 0.4, s * 0.45, s * 0.5));
    group.add(b);
    return { b, life: 3 + r() * 2.5, off: r() * 5, vx: 0.35 + r() * 0.4, vz: (r() - 0.5) * 0.5, wob: r() * 6 };
  });
  const update = (t: number) => {
    for (const p of list) {
      const k = ((t + p.off) % p.life) / p.life;
      const age = k * p.life;
      p.b.position.set(x + age * p.vx + Math.sin(t * 2 + p.wob) * 0.1, y + age * 0.45 + Math.sin(t * 3 + p.wob) * 0.05, z + age * p.vz);
      p.b.scale.setScalar(k > 0.94 ? 1 + (k - 0.94) * 18 : Math.min(1, k * 8));
      p.b.visible = k < 0.985;
    }
  };
  return { group, update };
}

/** A frisbee flying back and forth between two people. */
export function frisbee(a: Pt, b: Pt): Anim {
  const group = new THREE.Group();
  const disc = mesh(new THREE.CylinderGeometry(0.17, 0.15, 0.04, 14), flat(0xff5c93));
  disc.castShadow = true;
  group.add(disc);
  const update = (t: number) => {
    const P = 3.2;
    const k = (t % (P * 2)) / P;
    const leg = k < 1 ? 0 : 1;
    const e = Math.min(1, ((k % 1) * P) / (P - 0.7));
    const [from, to] = leg ? [b, a] : [a, b];
    const s = e * e * (3 - 2 * e);
    disc.position.set(from[0] + (to[0] - from[0]) * s, 1.15 + Math.sin(e * Math.PI) * 1.3, from[1] + (to[1] - from[1]) * s);
    disc.rotation.set(0.25 * Math.sin(e * Math.PI), t * 14, leg ? -0.2 : 0.2);
  };
  return { group, update };
}

// ---------------------------------------------------------------- Snorlax Twin

function zTexture() {
  return canvasTexture(64, 64, (c) => {
    c.font = "bold 52px 'Bagel Fat One', sans-serif";
    c.textAlign = "center";
    c.textBaseline = "middle";
    c.lineWidth = 8;
    c.strokeStyle = INK;
    c.strokeText("Z", 32, 34);
    c.fillStyle = "#b9c4ff";
    c.fillText("Z", 32, 34);
  });
}

/** Snorlax Twin out cold on her back on a picnic mat: smooth blue-teal fur, a cream belly,
 * feet up towards the camera and arms flopped out.
 * Her belly rises and falls, Zs float up, and she snores when Qish comes close. Head towards -z. */
export function snorlaxTwin(x: number, z: number, rotY: number, player: () => THREE.Vector3): Anim {
  const group = new THREE.Group();
  const root = new THREE.Group();
  group.add(root);
  const teal = paintedMat("plaster", 3, 3, 1.7); teal.color.setHex(0x2f5f7c);
  const cream = paintedMat("plaster", 3, 3, 1.7); cream.color.setHex(0xf1dcb8);
  const dark = flat(0x17151f);
  const breathe = new THREE.Group();
  root.add(breathe);
  const torso = mesh(new THREE.SphereGeometry(1, 48, 32), teal, 0, 0.8, 0.1);
  torso.scale.set(1.45, 0.8, 1.6);
  const belly = mesh(new THREE.SphereGeometry(1, 48, 32), cream, 0, 0.95, 0.35);
  belly.scale.set(1.12, 0.74, 1.2);
  const chest: THREE.Object3D[] = [torso, belly];
  breathe.add(baked(...chest));
  const head = new THREE.Group();
  head.position.set(0, 0.85, -1.75);
  root.add(head);
  const skull = mesh(new THREE.SphereGeometry(0.8, 48, 32), teal);
  skull.scale.set(1.12, 0.85, 0.95);
  const faceCream = mesh(new THREE.SphereGeometry(0.62, 48, 32), cream, 0, 0.32, 0.1);
  faceCream.scale.set(1.05, 0.5, 0.9);
  const headParts: THREE.Object3D[] = [skull, faceCream, mesh(roundedBox(0.34, 0.03, 0.04), dark, 0, 0.6, 0.38)];
  for (const sx of [-1, 1]) {
    const eye = mesh(roundedBox(0.26, 0.04, 0.05), dark, sx * 0.25, 0.62, 0.12);
    eye.rotation.y = sx * 0.12;
    const ear = mesh(new THREE.CapsuleGeometry(0.15, 0.19, 6, 16), teal, sx * 0.62, 0.35, -0.5);
    ear.rotation.set(-0.9, 0, -sx * 0.5);
    const tooth = mesh(new THREE.ConeGeometry(0.05, 0.12, 4), flat(0xfffaf0), sx * 0.12, 0.6, 0.42);
    tooth.rotation.x = Math.PI;
    headParts.push(eye, ear, tooth);
  }
  head.add(baked(...headParts));
  const limbs: THREE.Object3D[] = [];
  for (const sx of [-1, 1]) {
    const arm = mesh(new THREE.SphereGeometry(0.42, 48, 32), teal, sx * 1.55, 0.5, -0.65);
    arm.scale.set(1.3, 0.62, 0.75);
    arm.rotation.y = sx * 0.4;
    limbs.push(arm);
    for (let k = 0; k < 3; k++) {
      const claw = mesh(new THREE.ConeGeometry(0.06, 0.2, 4), flat(0xfffaf0), sx * 2.05, 0.55, -0.9 + k * 0.17);
      claw.rotation.z = -sx * Math.PI / 2;
      limbs.push(claw);
    }
    const foot = new THREE.Group();
    foot.position.set(sx * 0.78, 0.62, 1.65);
    foot.rotation.set(-1.1, sx * 0.25, 0);
    const sole = mesh(new THREE.CylinderGeometry(0.5, 0.52, 0.32, 14), cream);
    sole.scale.set(1, 1, 1.15);
    const pad = mesh(new THREE.CylinderGeometry(0.28, 0.28, 0.06, 12), flat(0xc9a27a), 0, 0.18, 0.06);
    foot.add(sole, pad);
    for (let k = 0; k < 3; k++) {
      const toe = mesh(new THREE.ConeGeometry(0.07, 0.18, 4), flat(0xfffaf0), (k - 1) * 0.22, 0.2, -0.42);
      toe.rotation.x = -0.9;
      foot.add(toe);
    }
    limbs.push(foot);
  }
  root.add(baked(...limbs));
  root.rotation.y = rotY;
  // Zs drifting up from her head.
  const zt = zTexture();
  const zs = [0, 1, 2].map((i) => {
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: zt, transparent: true, depthWrite: false }));
    s.renderOrder = 4;
    group.add(s);
    return { s, off: i / 3 };
  });
  let lastSnore = 0;
  group.position.set(x, 0, z);
  const update = (t: number) => {
    const b = Math.sin(t * 1.3);
    breathe.scale.set(1 + b * 0.015, 1 + b * 0.05, 1 + b * 0.01);
    head.rotation.x = b * 0.03;
    zs.forEach(({ s, off }) => {
      const k = ((t * 0.32 + off) % 1 + 1) % 1;
      s.position.set(-Math.sin(rotY) * 1.8 + Math.sin(k * 6) * 0.3 + k * 0.6, 2.0 + k * 2.2, -Math.cos(rotY) * 1.8 - k * 0.3);
      s.scale.setScalar(0.35 + k * 0.45);
      s.material.opacity = Math.min(1, k * 4) * (1 - k);
    });
    const p = player();
    if (b > 0.98 && t - lastSnore > 3 && Math.hypot(p.x - x, p.z - z) < 7) {
      lastSnore = t;
      sfx.snore();
    }
  };
  return { group, update };
}

// ---------------------------------------------------------------- Little life

/** Dragonflies darting and hovering over the shallows. */
export function dragonflies(spots: Pt[]): Anim {
  const group = new THREE.Group();
  const wingMat = new THREE.MeshBasicMaterial({ color: 0xdff6ff, transparent: true, opacity: 0.55, side: THREE.DoubleSide, depthWrite: false });
  const list = spots.map(([x, z], i) => {
    const d = new THREE.Group();
    d.add(mesh(roundedBox(0.32, 0.035, 0.035), flat([0x2fa3c7, 0xe3350d, 0x3fae5a][i % 3])));
    const wings = [-1, 1].map((s) => {
      const w = mesh(new THREE.PlaneGeometry(0.08, 0.26), wingMat, 0.05, 0.02, s * 0.13);
      w.rotation.x = -Math.PI / 2;
      d.add(w);
      return w;
    });
    group.add(d);
    const y = inPoly(LAKE, x, z) ? WATER_Y + 0.6 : 0.9;
    return { d, wings, x, z, y, from: v3(x, y, z), to: v3(x, y, z), t0: 0, i };
  });
  const update = (t: number) => {
    for (const f of list) {
      if (t - f.t0 > 1.4 + (f.i % 3) * 0.4) {
        f.t0 = t;
        f.from.copy(f.d.position.lengthSq() ? f.d.position : f.to);
        const a = Math.sin(t * 7.1 + f.i * 3) * Math.PI;
        f.to.set(f.x + Math.cos(a) * 1.4, f.y + Math.sin(t * 3 + f.i) * 0.3, f.z + Math.sin(a) * 1.0);
        f.d.rotation.y = Math.atan2(-(f.to.z - f.from.z), f.to.x - f.from.x);
      }
      const k = Math.min(1, (t - f.t0) / 0.35);
      f.d.position.lerpVectors(f.from, f.to, k * k * (3 - 2 * k));
      f.d.position.y += Math.sin(t * 9 + f.i) * 0.02;
      const flap = Math.sin(t * 60 + f.i) * 0.6;
      f.wings[0].rotation.y = flap;
      f.wings[1].rotation.y = -flap;
    }
  };
  return { group, update };
}

/** Every few seconds a fish jumps somewhere out on the lake. */
export function fishJumps(): Anim {
  const group = new THREE.Group();
  const wakes = ripples(6);
  const fish = new THREE.Group();
  const body = mesh(new THREE.SphereGeometry(0.12,20,14), flat(0xc9d6de));
  body.scale.set(1.7, 0.8, 0.5);
  const tail = mesh(new THREE.ConeGeometry(0.1, 0.18, 4), flat(0x9ab0bc), -0.26, 0, 0);
  tail.rotation.z = -Math.PI / 2;
  fish.add(body, tail);
  fish.visible = false;
  group.add(wakes.group, fish);
  const r = rng(17);
  let at = v3(0, 0, -10);
  let t0 = -10;
  let next = 2;
  const update = (t: number) => {
    if (t > next) {
      for (let tries = 0; tries < 12; tries++) {
        const x = -13 + r() * 27;
        const z = -11 + r() * 19;
        if (inPoly(BOAT, x, z) && edgeDist(BOAT, x, z) > 1.5 && !inPoly(ISLAND, x, z)) {
          at = v3(x, WATER_Y, z);
          break;
        }
      }
      t0 = t;
      next = t + 3 + r() * 4;
      wakes.spawn(at.x, at.z, t, 0.8);
    }
    const k = (t - t0) / 0.8;
    fish.visible = k >= 0 && k < 1;
    if (fish.visible) {
      fish.position.set(at.x + k * 0.9, WATER_Y + Math.sin(k * Math.PI) * 0.75, at.z);
      fish.rotation.z = (0.5 - k) * 2.4;
    }
    if (k >= 1 && k < 1.05) wakes.spawn(at.x + 0.9, at.z, t, 0.7);
    wakes.update(t);
  };
  return { group, update };
}

/** White egrets (bangau) standing in the shallows; they flap off when Qish walks right up to one
 * and settle again somewhere else along the shore. */
export function egrets(spots: Pt[], player: () => THREE.Vector3): Anim {
  const group = new THREE.Group();
  const white = flat(0xfffcf4);
  const beakMat = flat(0xf2b81c);
  const legMat = flat(0x2a2a30);
  const birds = [0, 1].map((i) => {
    const g = new THREE.Group();
    const body = mesh(new THREE.SphereGeometry(0.2,20,14), white, 0, 0.75, 0);
    body.scale.set(1.5, 0.8, 0.8);
    const neck = rod(v3(0.18, 0.8, 0), v3(0.32, 1.25, 0), 0.05, white, 5);
    const head = mesh(new THREE.SphereGeometry(0.08,20,14), white, 0.34, 1.28, 0);
    const beak = mesh(new THREE.ConeGeometry(0.03, 0.24, 4), beakMat, 0.5, 1.26, 0);
    beak.rotation.z = -Math.PI / 2 - 0.15;
    g.add(body, neck, head, beak);
    for (const lz of [-0.06, 0.06]) g.add(rod(v3(0, 0, lz), v3(-0.02, 0.62, lz), 0.018, legMat, 4));
    const wings = [-1, 1].map((s) => {
      const w = mesh(roundedBox(0.32, 0.03, 0.55), white, 0, 0.82, s * 0.32);
      w.visible = false;
      g.add(w);
      return w;
    });
    group.add(shadowed(g));
    return { g, wings, head, at: i, from: v3(0, 0, 0), to: v3(0, 0, 0), t0: -10, flying: false };
  });
  const place = (b: (typeof birds)[number], k: number) => {
    const [x, z] = spots[k];
    b.g.position.set(x, inPoly(LAKE, x, z) ? WATER_Y + 0.05 : 0, z);
  };
  birds.forEach((b, i) => {
    b.at = i * 2;
    place(b, b.at);
  });
  const update = (t: number) => {
    const p = player();
    for (const b of birds) {
      if (!b.flying) {
        b.head.position.y = 1.28 + Math.max(0, Math.sin(t * 0.7 + b.at) - 0.9) * -3;
        b.g.rotation.y = Math.sin(t * 0.2 + b.at) * 0.6;
        if (Math.hypot(p.x - b.g.position.x, p.z - b.g.position.z) < 2.6) {
          b.flying = true;
          b.t0 = t;
          b.from.copy(b.g.position);
          let n = (b.at + 3) % spots.length;
          if (birds.some((o) => o !== b && o.at === n)) n = (n + 1) % spots.length;
          b.at = n;
          const [x, z] = spots[n];
          b.to.set(x, inPoly(LAKE, x, z) ? WATER_Y + 0.05 : 0, z);
          b.g.rotation.y = Math.atan2(-(b.to.z - b.from.z), b.to.x - b.from.x);
          sfx.flutter();
        }
      } else {
        const k = Math.min(1, (t - b.t0) / 3.2);
        b.g.position.lerpVectors(b.from, b.to, k);
        b.g.position.y += Math.sin(k * Math.PI) * 3.2;
        const flap = Math.sin(t * 12) * 0.7;
        b.wings.forEach((w, i) => {
          w.visible = k < 0.96;
          w.rotation.x = i ? -flap : flap;
        });
        if (k >= 1) b.flying = false;
      }
    }
  };
  return { group, update };
}
