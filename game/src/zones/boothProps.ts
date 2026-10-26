import { roundedBox } from "../overworld/props";
import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import type { PersonLook } from "../content/doodles";
import { canvasTexture, flat } from "../overworld/props";
import { shadowed } from "./common";
import type { Anim } from "./labuProps";

// Lorong Photobooth: a pastel photobooth town on a bright studio day. The road is one long film strip
// that winds like a snake (in from Nyomnyom at the bottom left, three bends, out to Putrajaya at the
// top right). Photobooth machines line the road, there are backdrops with ring lights and softboxes
// everywhere, and a giant pink digital camera in the middle flashes the whole town every few seconds
// and prints strips that the wind carries off. Everything tall stands on the north side of the road
// facing south, so nothing ever hides Qish from the camera.

const INK = "#17151f";

function ticker() {
  let last = -1;
  return (t: number) => {
    const dt = last < 0 ? 0 : Math.min(0.1, t - last);
    last = t;
    return dt;
  };
}

/** Small seeded random, so scattered things land in the same places every visit. */
export function rng(seed: number) {
  let s = seed >>> 0 || 1;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

/** Textures reused by every prop; marked shared so zone teardown keeps them. */
const shared = (t: THREE.Texture) => {
  t.userData.shared = true;
  return t;
};
const once = <T>(make: () => T) => {
  let v: T | undefined;
  return () => (v ??= make());
};

function radial(inner: string, outer: string, size = 64) {
  return canvasTexture(size, size, (g) => {
    const grad = g.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    grad.addColorStop(0, inner);
    grad.addColorStop(1, outer);
    g.fillStyle = grad;
    g.fillRect(0, 0, size, size);
  });
}

const GLOW = once(() => shared(radial("rgba(255,255,255,1)", "rgba(255,255,255,0)")));
const POOL = once(() => shared(radial("rgba(255,255,255,.75)", "rgba(255,255,255,0)", 128)));
const BLOB = once(() => new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.22, depthWrite: false }));

const basic = (color: number) => new THREE.MeshBasicMaterial({ color });

function mesh(geo: THREE.BufferGeometry, mat: THREE.Material, x = 0, y = 0, z = 0) {
  const m = new THREE.Mesh(geo, mat);
  m.position.set(x, y, z);
  return m;
}

/** An additive glow sprite (flash flare, bulb halo). */
function flare(color: number, size: number, opacity = 0) {
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: GLOW(), color, transparent: true, opacity, depthWrite: false, blending: THREE.AdditiveBlending }));
  s.scale.setScalar(size);
  return s;
}

/** A pool of light on the ground that a flash throws (additive, faded in by the caller). */
function spill(r: number, color = 0xffffff) {
  const m = new THREE.Mesh(
    new THREE.PlaneGeometry(r * 2, r * 2),
    new THREE.MeshBasicMaterial({ map: POOL(), color, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending }),
  );
  m.rotation.x = -Math.PI / 2;
  m.position.y = 0.09;
  return m;
}

/** A flat face (sign, panel) as a box with the picture on its front only. */
function panel(tex: THREE.Texture, w: number, h: number, d: number, edge: THREE.Material, emissive = 0x000000) {
  return new THREE.Mesh(roundedBox(w, h, d), [edge, edge, edge, edge, new THREE.MeshLambertMaterial({ map: tex, emissive }), edge]);
}

function heartPath(g: CanvasRenderingContext2D, x: number, y: number, s: number) {
  g.beginPath();
  g.moveTo(x, y + s * 0.35);
  g.bezierCurveTo(x - s * 0.9, y - s * 0.25, x - s * 0.45, y - s * 0.95, x, y - s * 0.45);
  g.bezierCurveTo(x + s * 0.45, y - s * 0.95, x + s * 0.9, y - s * 0.25, x, y + s * 0.35);
  g.closePath();
}

export const PASTEL = {
  pink: 0xffb3cb,
  hot: 0xff6fa0,
  cream: 0xfff4e8,
  mint: 0xa8e3c8,
  lilac: 0xcdb9f2,
  butter: 0xffe7a0,
  peach: 0xffc4a8,
  sky: 0xb7dcff,
  mauve: 0x5b4766,
};

// ---------------------------------------------------------------- The snake road

/** Half the road's width. */
export const HW = 2.3;

/** Centre line of the road, from the Nyomnyom end (off the map, left) to the Putrajaya end (right).
 * Bottom run along z ~19, a bend up on the right, the middle run back left along z ~2.5, a bend up
 * on the left, and the top run out along z ~-17. Both long runs wiggle. */
const CTRL: [number, number][] = [
  [-40, 18.8], [-31, 18.8], [-22, 20.4], [-12, 18.4], [-2, 20.2], [8, 18.4], [15, 19.2],
  [21, 17.6], [24, 13], [23.4, 7.6], [19.6, 4.2], [13, 3],
  [5, 2.4], [-1, 3.4], [-8, 2.2], [-14, 3.0],
  [-20.5, 1.4], [-24.6, -3.4], [-25, -9.4], [-22, -14.8], [-15.5, -17.6],
  [-7, -16.6], [2, -18.4], [11, -16.8], [19, -18.2], [27, -17.2], [40, -17.6],
];

export interface RoadHit {
  /** Distance from the centre line. */
  d: number;
  /** Arc length along the road at the nearest point. */
  s: number;
  x: number;
  z: number;
}

function makeSnake() {
  const curve = new THREE.CatmullRomCurve3(CTRL.map(([x, z]) => new THREE.Vector3(x, 0, z)), false, "centripetal");
  const N = 560;
  const pts = curve.getSpacedPoints(N).map((p) => [p.x, p.z] as [number, number]);
  const cum = [0];
  for (let i = 1; i < pts.length; i++) cum.push(cum[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
  const len = cum[cum.length - 1];
  const nearest = (x: number, z: number): RoadHit => {
    let best: RoadHit = { d: Infinity, s: 0, x: 0, z: 0 };
    for (let i = 1; i < pts.length; i++) {
      const [ax, az] = pts[i - 1];
      const [bx, bz] = pts[i];
      // Quick reject: segments are short, so anything far from the first end can't be nearest.
      const qx = x - ax;
      const qz = z - az;
      if (Math.abs(qx) > best.d + 1 || Math.abs(qz) > best.d + 1) continue;
      const dx = bx - ax;
      const dz = bz - az;
      const l2 = dx * dx + dz * dz || 1;
      const k = Math.max(0, Math.min(1, (qx * dx + qz * dz) / l2));
      const px = ax + dx * k;
      const pz = az + dz * k;
      const d = Math.hypot(x - px, z - pz);
      if (d < best.d) best = { d, s: cum[i - 1] + (cum[i] - cum[i - 1]) * k, x: px, z: pz };
    }
    return best;
  };
  /** Point and direction of travel at arc length s. */
  const at = (s: number) => {
    const c = Math.max(0, Math.min(len, s));
    let lo = 1;
    let hi = cum.length - 1;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (cum[mid] < c) lo = mid + 1;
      else hi = mid;
    }
    const [ax, az] = pts[lo - 1];
    const [bx, bz] = pts[lo];
    const seg = cum[lo] - cum[lo - 1] || 1;
    const k = (c - cum[lo - 1]) / seg;
    return { x: ax + (bx - ax) * k, z: az + (bz - az) * k, tx: (bx - ax) / seg, tz: (bz - az) / seg };
  };
  return { pts, cum, len, nearest, at };
}

export const SNAKE = makeSnake();

/** A point on the road at arc length s, `off` to the side: positive is the left of travel, which is the
 * north side on the two runs that head east (bottom and top). */
export function onRoad(s: number, off = 0): [number, number] {
  const p = SNAKE.at(s);
  return [p.x + p.tz * off, p.z - p.tx * off];
}

/** Arc length of the nearest road point to (x, z). */
export const roadS = (x: number, z: number) => SNAKE.nearest(x, z).s;

/** Points along the road between two arc lengths, `off` to the side (a walker's route). */
export function roadRoute(s0: number, s1: number, off: number, step = 1.6): [number, number][] {
  const n = Math.max(1, Math.round(Math.abs(s1 - s0) / step));
  return Array.from({ length: n + 1 }, (_, k) => onRoad(s0 + ((s1 - s0) * k) / n, off));
}

const FILM_LEN = 3.6;

/** The road itself: one long film strip. Dark sprocket bands with holes along both edges, edge print,
 * and pale frames down the middle. */
export function filmRoad() {
  const tex = shared(
    canvasTexture(512, 256, (g) => {
      g.fillStyle = "#5b4766";
      g.fillRect(0, 0, 512, 256);
      // The frame: pale, with a soft picture area and a shine.
      g.fillStyle = "#fbe6ee";
      g.fillRect(0, 44, 512, 168);
      g.fillStyle = "#fff4f7";
      g.beginPath();
      g.roundRect(22, 58, 468, 140, 18);
      g.fill();
      g.fillStyle = "rgba(255,180,205,.28)";
      heartPath(g, 256, 138, 70);
      g.fill();
      g.fillStyle = "rgba(255,255,255,.55)";
      g.beginPath();
      g.moveTo(60, 196);
      g.lineTo(140, 60);
      g.lineTo(180, 60);
      g.lineTo(100, 196);
      g.fill();
      // Frame line between frames.
      g.fillStyle = "#5b4766";
      g.fillRect(0, 44, 8, 168);
      g.fillRect(504, 44, 8, 168);
      // Sprocket holes.
      g.fillStyle = "#fff3ea";
      for (let i = 0; i < 8; i++) {
        for (const y of [12, 222]) {
          g.beginPath();
          g.roundRect(i * 64 + 18, y, 28, 22, 5);
          g.fill();
        }
      }
      // Edge print, like a real negative.
      g.fillStyle = "#ffcb05";
      g.font = "bold 13px 'Bagel Fat One', sans-serif";
      g.textBaseline = "middle";
      g.fillText("BOLAT 400", 52, 40);
      g.fillText("▶ 26", 310, 40);
      g.fillText("QISH ♥", 180, 216);
      g.fillText("▶ 26A", 436, 216);
    }),
  );
  tex.wrapS = THREE.RepeatWrapping;
  const { pts, cum } = SNAKE;
  const pos: number[] = [];
  const uv: number[] = [];
  const idx: number[] = [];
  for (let i = 0; i < pts.length; i++) {
    const a = pts[Math.max(0, i - 1)];
    const b = pts[Math.min(pts.length - 1, i + 1)];
    const l = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
    const tx = (b[0] - a[0]) / l;
    const tz = (b[1] - a[1]) / l;
    const [x, z] = pts[i];
    pos.push(x + tz * HW, 0.075, z - tx * HW, x - tz * HW, 0.075, z + tx * HW);
    uv.push(cum[i] / FILM_LEN, 1, cum[i] / FILM_LEN, 0);
    if (i) {
      const k = i * 2;
      idx.push(k - 2, k - 1, k, k - 1, k + 1, k);
    }
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  geo.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
  geo.setIndex(idx);
  geo.computeVertexNormals();
  const m = new THREE.Mesh(geo, new THREE.MeshLambertMaterial({ map: tex }));
  m.receiveShadow = true;
  return m;
}

/** Velvet rope on brass stanchions along both edges of the road, gapped wherever `skip` says (plaza
 * mouths, booth fronts). */
export function ropeLine(skip: (x: number, z: number) => boolean, from = 7, to = SNAKE.len - 7) {
  const g = new THREE.Group();
  const brass = flat(0xe0b252);
  const velvet = flat(0xe0507e);
  const post = new THREE.CylinderGeometry(0.045, 0.045, 0.9, 6);
  const ball = new THREE.SphereGeometry(0.08,20,14);
  const foot = new THREE.CylinderGeometry(0.17, 0.2, 0.05, 10);
  for (const side of [1, -1]) {
    let prev: [number, number] | null = null;
    for (let s = from; s <= to; s += 1.9) {
      const p = onRoad(s, side * (HW + 0.22));
      if (skip(p[0], p[1])) {
        prev = null;
        continue;
      }
      g.add(mesh(post, brass, p[0], 0.45, p[1]), mesh(ball, brass, p[0], 0.93, p[1]), mesh(foot, brass, p[0], 0.03, p[1]));
      if (prev && Math.hypot(p[0] - prev[0], p[1] - prev[1]) < 2.6) {
        const curve = new THREE.QuadraticBezierCurve3(
          new THREE.Vector3(prev[0], 0.84, prev[1]),
          new THREE.Vector3((p[0] + prev[0]) / 2, 0.52, (p[1] + prev[1]) / 2),
          new THREE.Vector3(p[0], 0.84, p[1]),
        );
        g.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 6, 0.04, 5), velvet));
      }
      prev = p;
    }
  }
  return shadowed(g);
}

/** A floor sticker on the road: pink circle with a camera, "SPOT GAMBAR". */
export function photoDecal(x: number, z: number, r = 0.9) {
  const tex = shared(
    canvasTexture(256, 256, (g) => {
      g.fillStyle = "#ff8fb1";
      g.beginPath();
      g.arc(128, 128, 120, 0, Math.PI * 2);
      g.fill();
      g.lineWidth = 10;
      g.strokeStyle = "#fffdf6";
      g.setLineDash([22, 14]);
      g.beginPath();
      g.arc(128, 128, 104, 0, Math.PI * 2);
      g.stroke();
      g.setLineDash([]);
      g.fillStyle = "#fffdf6";
      g.beginPath();
      g.roundRect(70, 92, 116, 78, 14);
      g.fill();
      g.fillRect(100, 80, 40, 16);
      g.fillStyle = "#ff8fb1";
      g.beginPath();
      g.arc(128, 131, 26, 0, Math.PI * 2);
      g.fill();
      g.fillStyle = "#fffdf6";
      g.font = "bold 22px 'Bagel Fat One', sans-serif";
      g.textAlign = "center";
      g.fillText("SPOT GAMBAR", 128, 206);
    }),
  );
  const m = new THREE.Mesh(new THREE.PlaneGeometry(r * 2, r * 2), new THREE.MeshLambertMaterial({ map: tex, transparent: true }));
  m.rotation.x = -Math.PI / 2;
  m.position.set(x, 0.085, z);
  return m;
}

// ---------------------------------------------------------------- Ground

/** Checkered studio floor (pink and cream) for the plazas. */
export function checkerFloor(x0: number, z0: number, x1: number, z1: number, a = "#ffe3ec", b = "#fff7f1") {
  const tex = canvasTexture(64, 64, (g) => {
    g.fillStyle = a;
    g.fillRect(0, 0, 64, 64);
    g.fillStyle = b;
    g.fillRect(0, 0, 32, 32);
    g.fillRect(32, 32, 32, 32);
  });
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.magFilter = THREE.NearestFilter;
  tex.repeat.set((x1 - x0) / 2.4, (z1 - z0) / 2.4);
  const m = new THREE.Mesh(new THREE.PlaneGeometry(x1 - x0, z1 - z0), new THREE.MeshLambertMaterial({ map: tex }));
  m.rotation.x = -Math.PI / 2;
  m.position.set((x0 + x1) / 2, 0.05, (z0 + z1) / 2);
  m.receiveShadow = true;
  return m;
}

/** Round checkered floor. */
export function checkerDisc(x: number, z: number, r: number) {
  const m = checkerFloor(-r, -r, r, r);
  const g = new THREE.CircleGeometry(r, 36);
  g.rotateX(-Math.PI / 2);
  // Reuse the square's material on a disc: the UVs of CircleGeometry span 0..1 the same way.
  const disc = new THREE.Mesh(g, m.material);
  (disc.material as THREE.MeshLambertMaterial).map!.repeat.set((r * 2) / 2.4, (r * 2) / 2.4);
  disc.position.set(x, 0.05, z);
  disc.receiveShadow = true;
  m.geometry.dispose();
  return disc;
}

/** Pastel flowers and tufts scattered over the lawn wherever `ok` allows. Two instanced meshes. */
export function lawnFlowers(area: [number, number, number, number], ok: (x: number, z: number) => boolean, n = 900, seed = 4) {
  const r = rng(seed);
  const g = new THREE.Group();
  const colors = [0xff9fc0, 0xffffff, 0xffd6a0, 0xcdb9f2, 0xffe27a, 0xff7fa8].map((c) => new THREE.Color(c));
  const heads = new THREE.InstancedMesh(new THREE.SphereGeometry(0.11, 24, 16), new THREE.MeshLambertMaterial({ color: 0xffffff, flatShading: false }), n);
  const tufts = new THREE.InstancedMesh(new THREE.ConeGeometry(0.1, 0.32, 4), new THREE.MeshLambertMaterial({ color: 0x8fcf9f, flatShading: false }), n);
  const m4 = new THREE.Matrix4();
  let hi = 0;
  let ti = 0;
  for (let tries = 0; tries < n * 4 && (hi < n || ti < n); tries++) {
    const x = area[0] + r() * (area[2] - area[0]);
    const z = area[1] + r() * (area[3] - area[1]);
    if (!ok(x, z)) continue;
    if (r() < 0.55 && hi < n) {
      m4.makeTranslation(x, 0.16 + r() * 0.08, z);
      heads.setMatrixAt(hi, m4);
      heads.setColorAt(hi, colors[Math.floor(r() * colors.length)]);
      hi++;
    } else if (ti < n) {
      m4.makeRotationY(r() * 3).setPosition(x, 0.14, z);
      tufts.setMatrixAt(ti++, m4);
    }
  }
  heads.count = hi;
  tufts.count = ti;
  g.add(heads, tufts);
  return g;
}

/** A low clipped hedge with pastel flowers on top, along a line (edges of the map). */
export function flowerHedge(x0: number, z0: number, x1: number, z1: number, seed = 1) {
  const g = new THREE.Group();
  const len = Math.hypot(x1 - x0, z1 - z0);
  const box = mesh(roundedBox(len, 0.8, 0.8), flat(0x7cc48f), (x0 + x1) / 2, 0.4, (z0 + z1) / 2);
  box.rotation.y = -Math.atan2(z1 - z0, x1 - x0);
  g.add(box);
  const r = rng(seed);
  const petals = [0xff9fc0, 0xffffff, 0xffd6a0, 0xcdb9f2].map((c) => flat(c));
  const geo = new THREE.SphereGeometry(0.12, 24, 16);
  for (let i = 0; i < len * 3; i++) {
    const k = r();
    g.add(mesh(geo, petals[i % petals.length], x0 + (x1 - x0) * k + (r() - 0.5) * 0.5, 0.82 + r() * 0.06, z0 + (z1 - z0) * k + (r() - 0.5) * 0.5));
  }
  return shadowed(g);
}

/** A round pot of pastel flowers (pink tub). */
export function flowerTub(x: number, z: number, seed = 0, s = 1) {
  const g = new THREE.Group();
  const r = rng(seed + 3);
  g.add(mesh(new THREE.CylinderGeometry(0.55 * s, 0.45 * s, 0.5, 12), flat([0xffb3cb, 0xcdb9f2, 0xa8e3c8, 0xffe7a0][seed % 4]), 0, 0.25, 0));
  const leaf = flat(0x6fb383);
  for (let i = 0; i < 6; i++) {
    const a = r() * Math.PI * 2;
    g.add(mesh(new THREE.SphereGeometry(0.2 * s, 24, 16), leaf, Math.cos(a) * 0.3 * s, 0.6, Math.sin(a) * 0.3 * s));
  }
  const petals = [0xff7fa8, 0xffffff, 0xffd6a0, 0xb79cf0].map((c) => flat(c));
  for (let i = 0; i < 10; i++) {
    const a = r() * Math.PI * 2;
    const d = r() * 0.42 * s;
    g.add(mesh(new THREE.SphereGeometry(0.1 * s, 24, 16), petals[i % 4], Math.cos(a) * d, 0.72 + r() * 0.1, Math.sin(a) * d));
  }
  g.position.set(x, 0, z);
  return shadowed(g);
}

// ---------------------------------------------------------------- Strip pictures

/** A made-up photo strip (not one of theirs): four pastel frames with little doodled faces. */
const STRIP_TEX = Array.from({ length: 6 }, (_, v) =>
  once(() =>
    shared(
      canvasTexture(96, 288, (g) => {
        const frames = ["#ffd1df", "#d9ccff", "#c8f0dc", "#ffe7b0", "#cfe6ff", "#ffd6c4"];
        g.fillStyle = v % 2 ? "#fffdf6" : "#2a2730";
        g.fillRect(0, 0, 96, 288);
        for (let i = 0; i < 4; i++) {
          const y = 8 + i * 64;
          g.fillStyle = frames[(v + i) % frames.length];
          g.fillRect(8, y, 80, 58);
          // Two faces leaning in, or a big heart.
          g.strokeStyle = INK;
          g.lineWidth = 2.5;
          if ((i + v) % 3 === 2) {
            g.fillStyle = "#ff6fa0";
            heartPath(g, 48, y + 34, 22);
            g.fill();
          } else {
            for (const [fx, r] of [[36, 12], [60, 11]] as const) {
              g.fillStyle = "#f6d2b8";
              g.beginPath();
              g.arc(fx, y + 34, r, 0, Math.PI * 2);
              g.fill();
              g.stroke();
              g.fillStyle = INK;
              g.fillRect(fx - 5, y + 31, 2, 3);
              g.fillRect(fx + 3, y + 31, 2, 3);
            }
          }
        }
        g.fillStyle = v % 2 ? "#ff6fa0" : "#fffdf6";
        g.font = "bold 13px 'Gaegu', sans-serif";
        g.textAlign = "center";
        g.fillText(["♥ 26.10", "senyum~", "BFF ♥", "4 CUT", "kita ♥", "say hi"][v], 48, 281);
      }),
    ),
  ),
);
export const stripTex = (v: number) => STRIP_TEX[((v % STRIP_TEX.length) + STRIP_TEX.length) % STRIP_TEX.length]();

const realStrip = new Map<number, THREE.Texture>();
/** One of their ten real photo strips. */
export function realStripTex(i: number) {
  let t = realStrip.get(i);
  if (!t) {
    t = new THREE.TextureLoader().load(`/assets/strips/strip${i}.webp`);
    t.colorSpace = THREE.SRGBColorSpace;
    realStrip.set(i, t);
  }
  return t;
}

// ---------------------------------------------------------------- Flying strips

export interface StripWind extends Anim {
  /** Send a strip off on the wind from here. */
  emit(x: number, y: number, z: number, vx?: number, vy?: number, vz?: number): void;
}

/** Strips riding the breeze all over town: fresh ones printed by the booths and the giant camera, and a
 * steady few drifting in on the wind from the left. They flutter, tumble and fade. */
export function flyingStrips(area: [number, number, number, number], n = 30): StripWind {
  const group = new THREE.Group();
  const geo = new THREE.PlaneGeometry(0.3, 0.9);
  const mats = Array.from({ length: 6 }, (_, v) => new THREE.MeshLambertMaterial({ map: stripTex(v), side: THREE.DoubleSide, transparent: true }));
  const pool = Array.from({ length: n }, (_, i) => {
    const m = new THREE.Mesh(geo, mats[i % mats.length].clone());
    m.visible = false;
    group.add(m);
    return { m, p: new THREE.Vector3(), v: new THREE.Vector3(), age: 0, life: 0, spin: new THREE.Vector3(), phase: i * 1.3 };
  });
  const tick = ticker();
  let nextDrift = 0;
  let cursor = 0;
  const emit = (x: number, y: number, z: number, vx = 0.6, vy = 1.6, vz = -0.2) => {
    const s = pool.find((q) => !q.m.visible) ?? pool[cursor++ % pool.length];
    s.p.set(x, y, z);
    s.v.set(vx + (Math.random() - 0.5) * 0.6, vy, vz + (Math.random() - 0.5) * 0.6);
    s.age = 0;
    s.life = 9 + Math.random() * 5;
    s.spin.set(1.2 + Math.random() * 2, 0.6 + Math.random() * 1.5, 0.8 + Math.random() * 2);
    s.m.visible = true;
  };
  const update = (t: number) => {
    const dt = tick(t);
    if (t > nextDrift) {
      // Drifting in on the breeze from the upwind (left) side, at roof height.
      nextDrift = t + 0.9 + Math.random() * 1.1;
      emit(area[0] + Math.random() * 6, 3.5 + Math.random() * 3, area[1] + Math.random() * (area[3] - area[1]), 1.6, 0.2, 0);
    }
    const gust = 1 + Math.sin(t * 0.37) * 0.5 + Math.sin(t * 1.3) * 0.2;
    for (const s of pool) {
      if (!s.m.visible) continue;
      s.age += dt;
      // Breeze to the right, a lazy flutter up and down, and paper sinking slowly.
      s.v.x += (1.5 * gust - s.v.x) * dt * 0.6;
      s.v.z += (Math.sin(t * 0.5 + s.phase) * 0.5 - s.v.z) * dt * 0.5;
      s.v.y += (Math.sin(t * 2.1 + s.phase) * 0.9 - 0.25 - s.v.y) * dt * 1.4;
      s.p.addScaledVector(s.v, dt);
      if (s.p.y < 0.15) {
        s.p.y = 0.15;
        s.v.y = Math.abs(s.v.y) * 0.3 + 0.6;
      }
      s.m.position.copy(s.p);
      s.m.rotation.set(Math.sin(t * s.spin.x + s.phase) * 1.2, t * s.spin.y + s.phase, Math.sin(t * s.spin.z + s.phase) * 0.8);
      const fade = Math.min(1, s.age * 3, (s.life - s.age) * 1.5);
      (s.m.material as THREE.MeshLambertMaterial).opacity = fade;
      if (s.age > s.life || s.p.x > area[2] + 4) s.m.visible = false;
    }
  };
  return { group, update, emit };
}

// ---------------------------------------------------------------- Photobooth machines

const BULB_ON = once(() => new THREE.MeshBasicMaterial({ color: 0xfff6c8 }));
const BULB_OFF = once(() => new THREE.MeshBasicMaterial({ color: 0xd8a868 }));

const SCREEN_TEX = once(() => {
  const make = (big: string, small: string, bg: string) =>
    shared(
      canvasTexture(192, 128, (g) => {
        g.fillStyle = bg;
        g.fillRect(0, 0, 192, 128);
        g.fillStyle = "#fffdf6";
        g.textAlign = "center";
        g.textBaseline = "middle";
        g.font = `bold ${big.length > 2 ? 34 : 78}px 'Bagel Fat One', sans-serif`;
        g.fillText(big, 96, 56);
        g.font = "bold 22px 'Gaegu', sans-serif";
        g.fillText(small, 96, 106);
      }),
    );
  return {
    idle: make("SENTUH ♥", "RM15 · 2 strip", "#ff6fa0"),
    n3: make("3", "senyum~", "#7a5cd6"),
    n2: make("2", "pose!", "#7a5cd6"),
    n1: make("1", "jangan kelip!", "#7a5cd6"),
    snap: make("CHEESE!", "♥ ♥ ♥", "#ffcb05"),
    print: make("CETAK...", "tunggu kejap", "#3fae8a"),
  };
});

function curtainTex(color: string) {
  return canvasTexture(128, 192, (g) => {
    g.fillStyle = color;
    g.fillRect(0, 0, 128, 192);
    for (let i = 0; i < 8; i++) {
      const grad = g.createLinearGradient(i * 16, 0, i * 16 + 16, 0);
      grad.addColorStop(0, "rgba(0,0,0,.22)");
      grad.addColorStop(0.5, "rgba(255,255,255,.18)");
      grad.addColorStop(1, "rgba(0,0,0,.22)");
      g.fillStyle = grad;
      g.fillRect(i * 16, 0, 16, 192);
    }
    g.fillStyle = "rgba(255,255,255,.6)";
    g.fillRect(0, 0, 128, 10);
  });
}

function boothSign(name: string, bg: string, fg: string) {
  return canvasTexture(640, 170, (g) => {
    g.fillStyle = bg;
    g.beginPath();
    g.roundRect(0, 0, 640, 170, 40);
    g.fill();
    g.fillStyle = "rgba(255,255,255,.35)";
    g.beginPath();
    g.roundRect(14, 12, 612, 40, 20);
    g.fill();
    g.fillStyle = fg;
    g.textAlign = "center";
    g.textBaseline = "middle";
    const size = name.length > 12 ? 58 : 70;
    g.font = `bold ${size}px 'Bagel Fat One', sans-serif`;
    g.fillText(name, 320, 92);
  });
}

/** A sample-photo board on the booth front: four little strips. */
const SAMPLE_TEX = once(() =>
  shared(
    canvasTexture(160, 128, (g) => {
      g.fillStyle = "#fffdf6";
      g.fillRect(0, 0, 160, 128);
      g.fillStyle = INK;
      g.font = "bold 14px 'Gaegu', sans-serif";
      g.textAlign = "center";
      g.fillText("contoh gambar ♥", 80, 16);
      const cols = ["#ffd1df", "#d9ccff", "#c8f0dc", "#ffe7b0"];
      for (let s = 0; s < 4; s++) {
        for (let i = 0; i < 4; i++) {
          g.fillStyle = cols[(s + i) % 4];
          g.fillRect(14 + s * 36, 26 + i * 25, 26, 21);
        }
      }
    }),
  ),
);

export interface BoothStyle {
  name: string;
  body: number;
  trim: number;
  sign: string;
  ink: string;
  curtain: string;
}

export const BOOTH_STYLES: BoothStyle[] = [
  { name: "123 ANNYEONG", body: 0xffb3cb, trim: 0xfff4e8, sign: "#ff6fa0", ink: "#fffdf6", curtain: "#e0507e" },
  { name: "INSSA FILM", body: 0xfff4e8, trim: 0x2a2730, sign: "#2a2730", ink: "#fffdf6", curtain: "#3a3442" },
  { name: "DEAR MEMORIES", body: 0xffe7a0, trim: 0xfff4e8, sign: "#fffdf6", ink: "#e08a2e", curtain: "#e8a83a" },
  { name: "FOTOPOT", body: 0xa8e3c8, trim: 0xfff4e8, sign: "#3fae8a", ink: "#fffdf6", curtain: "#3fae8a" },
  { name: "PHOTOMANSION", body: 0x3a3442, trim: 0xe0b252, sign: "#e0b252", ink: "#2a2730", curtain: "#7a2d4a" },
  { name: "KPIX", body: 0xb7dcff, trim: 0xfff4e8, sign: "#4f7fe0", ink: "#fffdf6", curtain: "#4f7fe0" },
  { name: "HANA FILM", body: 0xffc4a8, trim: 0xfff4e8, sign: "#fffdf6", ink: "#ff6f5a", curtain: "#ff8a6e" },
  // Made-up studios to fill the town.
  { name: "SENYUM STUDIO", body: 0xcdb9f2, trim: 0xfff4e8, sign: "#7a5cd6", ink: "#fffdf6", curtain: "#7a5cd6" },
  { name: "KIMCHI CLICK", body: 0xff8f8f, trim: 0xfff4e8, sign: "#fffdf6", ink: "#e3350d", curtain: "#c8323a" },
  { name: "4 POSE", body: 0xfff4e8, trim: 0xff6fa0, sign: "#ff6fa0", ink: "#fffdf6", curtain: "#ff6fa0" },
  { name: "SNAP SNAP", body: 0x9fd3e8, trim: 0x2a2730, sign: "#2a2730", ink: "#9fd3e8", curtain: "#2a6f8a" },
  { name: "BOLAT·BOOTH", body: 0xffb3cb, trim: 0xffe7a0, sign: "#ffe7a0", ink: "#ff4f8a", curtain: "#ff4f8a" },
];

export interface Booth extends Anim {
  statics: THREE.Group;
  /** Footprint for the collider. */
  box: [number, number, number, number];
  /** Where to stand to look at it. */
  front: [number, number];
}

/** A photobooth machine facing the camera (+z): curtained doorway on the right, touch screen and sample
 * board on the left, marquee sign of chasing bulbs on top. Every so often someone inside takes four
 * shots (countdown on the screen, the curtain lights up), and a strip slides out of the printer slot on
 * the side; some of them catch the wind. */
export function boothMachine(x: number, z: number, st: BoothStyle, seed: number, onShot: (x: number, z: number) => void, wind?: StripWind): Booth {
  const statics = new THREE.Group();
  const group = new THREE.Group();
  const W = 2.7;
  const H = 2.9;
  const D = 2.2;
  const body = flat(st.body);
  const trim = flat(st.trim);
  statics.add(mesh(roundedBox(W, H, D), body, 0, H / 2, 0));
  // Rounded cap and a plinth.
  statics.add(mesh(roundedBox(W + 0.12, 0.16, D + 0.12), trim, 0, H + 0.08, 0));
  statics.add(mesh(roundedBox(W + 0.1, 0.18, D + 0.1), trim, 0, 0.09, 0));
  // Doorway frame on the right of the front.
  const fz = D / 2;
  statics.add(mesh(roundedBox(0.1, 2.35, 0.08), trim, 0.02, 1.3, fz + 0.03));
  statics.add(mesh(roundedBox(1.35, 0.1, 0.08), trim, 0.66, 2.45, fz + 0.03));
  // Dark interior behind the curtain, which lights up on every shot.
  const inside = mesh(new THREE.PlaneGeometry(1.2, 2.3), new THREE.MeshBasicMaterial({ color: 0x2a2232 }), 0.66, 1.28, fz + 0.012);
  group.add(inside);
  const cTex = curtainTex(st.curtain);
  const curtain = mesh(new THREE.PlaneGeometry(1.24, 2.0), new THREE.MeshLambertMaterial({ map: cTex, side: THREE.DoubleSide }), 0, -1.0, 0);
  const curtainPivot = new THREE.Group();
  curtainPivot.position.set(0.66, 2.4, fz + 0.06);
  curtainPivot.add(curtain);
  group.add(curtainPivot);
  // Rail over the curtain.
  statics.add(mesh(new THREE.CylinderGeometry(0.03, 0.03, 1.3, 6), flat(0xd8d8e0), 0.66, 2.4, fz + 0.08));
  statics.children[statics.children.length - 1].rotation.z = Math.PI / 2;
  // Screen and sample board on the left.
  const tex = SCREEN_TEX();
  const screenMat = new THREE.MeshBasicMaterial({ map: tex.idle });
  statics.add(mesh(roundedBox(0.98, 0.72, 0.08), flat(0x2a2730), -0.68, 1.62, fz + 0.04));
  group.add(mesh(new THREE.PlaneGeometry(0.86, 0.6), screenMat, -0.68, 1.62, fz + 0.085));
  const sample = mesh(new THREE.PlaneGeometry(0.86, 0.68), new THREE.MeshLambertMaterial({ map: SAMPLE_TEX() }), -0.68, 0.82, fz + 0.012);
  statics.add(sample);
  // Coin & card slot.
  statics.add(mesh(roundedBox(0.3, 0.16, 0.06), flat(0xd8d8e0), -0.68, 1.12, fz + 0.03));
  // Marquee sign with chasing bulbs.
  const signTex = boothSign(st.name, st.sign, st.ink);
  const sign = panel(signTex, W + 0.3, 0.78, 0.22, trim);
  sign.position.set(0, H + 0.58, fz - 0.12);
  statics.add(sign);
  const bulbGeo = new THREE.SphereGeometry(0.055,20,14);
  const odd: THREE.BufferGeometry[] = [];
  const even: THREE.BufferGeometry[] = [];
  const nB = 12;
  for (let i = 0; i < nB; i++) {
    const bx = -(W + 0.2) / 2 + ((W + 0.2) * i) / (nB - 1);
    for (const by of [H + 0.22, H + 0.94]) {
      const g = bulbGeo.clone();
      g.translate(bx, by, fz + 0.01);
      ((i + (by > H + 0.5 ? 1 : 0)) % 2 ? odd : even).push(g);
    }
  }
  const oddMesh = new THREE.Mesh(mergeGeometries(odd), BULB_ON());
  const evenMesh = new THREE.Mesh(mergeGeometries(even), BULB_OFF());
  [...odd, ...even, bulbGeo].forEach((g) => g.dispose());
  group.add(oddMesh, evenMesh);
  // Printer slot on the right side, with a tray under it.
  statics.add(mesh(roundedBox(0.06, 0.08, 0.5), flat(0x2a2730), W / 2 + 0.02, 1.35, 0.55));
  statics.add(mesh(roundedBox(0.22, 0.08, 0.6), trim, W / 2 + 0.1, 0.62, 0.55));
  const printed = mesh(new THREE.PlaneGeometry(0.28, 0.84), new THREE.MeshLambertMaterial({ map: stripTex(seed), side: THREE.DoubleSide }), W / 2 + 0.05, 1.3, 0.55);
  printed.rotation.y = Math.PI / 2;
  printed.visible = false;
  group.add(printed);
  // Light thrown out of the doorway on a shot.
  const pool = spill(1.6, 0xfff4fa);
  pool.position.set(0.66, 0.09, fz + 1.0);
  const glare = flare(0xffffff, 2.2);
  glare.position.set(0.66, 1.6, fz + 0.3);
  group.add(pool, glare);
  shadowed(statics);
  for (const o of [statics, group]) o.position.set(x, 0, z);

  // Session: idle → 3, 2, 1 → snap ×4 → printing → strip out of the slot.
  const r = rng(seed * 7 + 1);
  let next = 2 + r() * 10;
  let start = -1;
  let shots = 0;
  const SHOT_GAP = 1.05;
  let lastBulb = -1;
  const update = (t: number) => {
    const chase = Math.floor(t * 2.6 + seed) % 2;
    if (chase !== lastBulb) {
      lastBulb = chase;
      oddMesh.material = chase ? BULB_ON() : BULB_OFF();
      evenMesh.material = chase ? BULB_OFF() : BULB_ON();
    }
    // Someone shifting about behind the curtain.
    curtainPivot.rotation.x = Math.sin(t * 1.3 + seed) * 0.03 + (start >= 0 ? Math.sin(t * 9) * 0.015 : 0);
    curtain.scale.x = 1 + Math.sin(t * 0.8 + seed) * 0.02;
    let flash = 0;
    if (start < 0 && t > next) {
      start = t;
      shots = 0;
    }
    if (start >= 0) {
      const k = t - start;
      if (k < 2.4) screenMat.map = k < 0.8 ? tex.n3 : k < 1.6 ? tex.n2 : tex.n1;
      else if (k < 2.4 + SHOT_GAP * 4) {
        const shot = Math.floor((k - 2.4) / SHOT_GAP);
        const f = (k - 2.4) % SHOT_GAP;
        screenMat.map = tex.snap;
        flash = Math.max(0, 1 - f / 0.28);
        if (shot >= shots) {
          shots = shot + 1;
          onShot(x, z);
        }
      } else if (k < 2.4 + SHOT_GAP * 4 + 1.0) screenMat.map = tex.print;
      else if (k < 2.4 + SHOT_GAP * 4 + 2.4) {
        // The strip slides down out of the slot.
        const f = (k - 2.4 - SHOT_GAP * 4 - 1.0) / 1.4;
        printed.visible = true;
        printed.position.y = 1.3 - f * 0.45;
        screenMat.map = tex.print;
      } else {
        printed.visible = false;
        screenMat.map = tex.idle;
        if (wind && r() < 0.55) wind.emit(x + W / 2 + 0.2, 1.0, z + 0.55, 1.2, 2.2, 0.2);
        start = -1;
        next = t + 7 + r() * 12;
      }
    }
    (inside.material as THREE.MeshBasicMaterial).color.setRGB(0.16 + flash * 0.84, 0.13 + flash * 0.87, 0.2 + flash * 0.8);
    (pool.material as THREE.MeshBasicMaterial).opacity = flash * 0.9;
    glare.material.opacity = flash * 0.9;
    (curtain.material as THREE.MeshLambertMaterial).emissive.setScalar(flash * 0.45);
  };
  return { group, update, statics, box: [x - W / 2 - 0.15, z - D / 2, x + W / 2 + 0.3, z + D / 2 + 0.1], front: [x, z + D / 2 + 0.9] };
}

// ---------------------------------------------------------------- Lights, tripods

export interface Flashable extends Anim {
  /** The stand and the light's body, to bake with the zone's statics. */
  statics: THREE.Group;
  fire(strength?: number): void;
}

function tripod(g: THREE.Group, h: number, mat: THREE.Material) {
  for (let i = 0; i < 3; i++) {
    const a = (i / 3) * Math.PI * 2;
    const leg = mesh(new THREE.CylinderGeometry(0.025, 0.03, h * 0.55, 5), mat, Math.cos(a) * 0.22, h * 0.26, Math.sin(a) * 0.22);
    leg.rotation.set(Math.sin(a) * 0.38, 0, -Math.cos(a) * 0.38);
    g.add(leg);
  }
  g.add(mesh(new THREE.CylinderGeometry(0.025, 0.025, h * 0.55, 5), mat, 0, h * 0.7, 0));
}

export type LightKind = "softbox" | "ring" | "umbrella" | "strobe";

/** A studio light on a stand, aimed along its local +z (turn with `rotY`). It fires now and then on
 * its own (or when told): the face blazes white and throws a flare. The stand and body come back as
 * statics; only the face, flare and light pool stay live. */
export function studioLight(kind: LightKind, x: number, z: number, rotY = 0, h = 2.3, seed = 0, auto = true): Flashable {
  const statics = new THREE.Group();
  const group = new THREE.Group();
  const steel = flat(0x2a2730);
  tripod(statics, h, steel);
  // The head twice over: the body in the statics, the glowing face in the live group.
  const headS = new THREE.Group();
  const headD = new THREE.Group();
  for (const hd of [headS, headD]) {
    hd.position.y = h;
    hd.rotation.x = -0.12;
  }
  const face = new THREE.MeshBasicMaterial({ color: 0xf2eee8 });
  const flareAt = new THREE.Vector3();
  if (kind === "softbox") {
    headS.add(mesh(roundedBox(0.9, 0.9, 0.5), steel, 0, 0, -0.1));
    headD.add(mesh(new THREE.PlaneGeometry(0.84, 0.84), face, 0, 0, 0.16));
    flareAt.set(0, 0, 0.3);
  } else if (kind === "ring") {
    headD.add(new THREE.Mesh(new THREE.TorusGeometry(0.42, 0.07, 6, 24), face));
    headS.add(mesh(roundedBox(0.12, 0.2, 0.05), steel, 0, -0.1, 0));
    flareAt.set(0, 0, 0.1);
  } else if (kind === "umbrella") {
    const um = mesh(new THREE.ConeGeometry(0.75, 0.45, 12, 1, true), new THREE.MeshLambertMaterial({ color: 0xfffdf8, side: THREE.DoubleSide }), 0, 0, -0.35);
    um.rotation.x = -Math.PI / 2;
    headS.add(um);
    headD.add(mesh(new THREE.CylinderGeometry(0.1, 0.12, 0.3, 8), face, 0, 0, 0.05));
    flareAt.set(0, 0, 0.2);
  } else {
    // Bare strobe with a reflector dish.
    const dish = mesh(new THREE.CylinderGeometry(0.34, 0.14, 0.25, 12, 1, true), new THREE.MeshLambertMaterial({ color: 0xd8d8e0, side: THREE.DoubleSide }), 0, 0, 0.05);
    dish.rotation.x = Math.PI / 2;
    headS.add(dish, mesh(roundedBox(0.28, 0.28, 0.42), steel, 0, 0, -0.2));
    headD.add(mesh(new THREE.SphereGeometry(0.12,20,14), face, 0, 0, 0.08));
    flareAt.set(0, 0, 0.15);
  }
  statics.add(headS);
  group.add(headD);
  const fl = flare(0xffffff, 2.4);
  fl.position.copy(flareAt).applyEuler(headD.rotation).add(headD.position);
  group.add(fl);
  const pool = spill(1.3);
  pool.position.set(0, 0.09, 1.4);
  group.add(pool);
  shadowed(statics);
  for (const o of [statics, group]) {
    o.position.set(x, 0, z);
    o.rotation.y = rotY;
  }
  const r = rng(seed * 13 + 5);
  let at = -9;
  let power = 1;
  let queued = 0;
  let again = -1;
  let next = 1 + r() * 8;
  const fire = (strength = 1) => {
    queued = strength;
  };
  const update = (t: number) => {
    if (auto && t > next) {
      next = t + 3 + r() * 9;
      queued = 1;
      // A quick double pop sometimes, like a photographer firing two frames.
      if (r() < 0.35) again = t + 0.26;
    }
    if (again > 0 && t > again) {
      again = -1;
      queued = 0.8;
    }
    if (queued) {
      at = t;
      power = queued;
      queued = 0;
    }
    const k = Math.max(0, 1 - (t - at) / 0.3) * power;
    face.color.setRGB(0.95 + k * 0.05, 0.93 + k * 0.07, 0.91 + k * 0.09);
    fl.material.opacity = k;
    (pool.material as THREE.MeshBasicMaterial).opacity = k * 0.8;
  };
  return { group, update, fire, statics };
}

/** A DSLR on a tripod, aimed along local +z. */
export function tripodCamera(x: number, z: number, rotY = 0, h = 1.45) {
  const g = new THREE.Group();
  const steel = flat(0x2a2730);
  tripod(g, h, steel);
  g.add(mesh(roundedBox(0.42, 0.3, 0.24), steel, 0, h + 0.14, 0));
  g.add(mesh(roundedBox(0.14, 0.12, 0.14), steel, -0.06, h + 0.34, -0.02));
  const lens = mesh(new THREE.CylinderGeometry(0.11, 0.12, 0.3, 10), flat(0x3a3442), 0, h + 0.13, 0.25);
  lens.rotation.x = Math.PI / 2;
  g.add(lens, mesh(new THREE.CircleGeometry(0.09, 10), basic(0x6a7aa8), 0, h + 0.13, 0.405));
  g.add(mesh(roundedBox(0.06, 0.06, 0.06), flat(0xe3350d), 0.15, h + 0.31, 0.05));
  g.position.set(x, 0, z);
  g.rotation.y = rotY;
  return shadowed(g);
}

// ---------------------------------------------------------------- Backdrops

export type BackdropKind = "flowers" | "balloons" | "neon" | "sequin" | "wings" | "frame" | "clouds";

function backdropTex(kind: BackdropKind) {
  return canvasTexture(512, 384, (g) => {
    if (kind === "neon") {
      g.fillStyle = "#cdb9f2";
      g.fillRect(0, 0, 512, 384);
      g.fillStyle = "rgba(255,255,255,.22)";
      for (let i = 0; i < 512; i += 32) g.fillRect(i, 0, 14, 384);
      g.textAlign = "center";
      g.textBaseline = "middle";
      g.shadowColor = "#ff4f9a";
      g.font = "bold 70px 'Bagel Fat One', sans-serif";
      for (const blur of [30, 14, 0]) {
        g.shadowBlur = blur;
        g.fillStyle = blur ? "#ff4f9a" : "#fff0f7";
        g.fillText("SAY", 256, 130);
        g.fillText("CHEESE!", 256, 220);
      }
      g.shadowBlur = 0;
      g.font = "bold 40px 'Gaegu', sans-serif";
      g.fillStyle = "#fff0f7";
      g.fillText("♥ you look cute today ♥", 256, 312);
    } else if (kind === "wings") {
      g.fillStyle = "#fff6f2";
      g.fillRect(0, 0, 512, 384);
      g.strokeStyle = "#c9b0d8";
      g.lineWidth = 5;
      for (const side of [-1, 1]) {
        for (let row = 0; row < 5; row++) {
          for (let i = 0; i < 6 - row; i++) {
            const cx = 256 + side * (40 + i * 30 + row * 8);
            const cy = 110 + row * 42 + i * 6;
            g.fillStyle = ["#ffd9e6", "#e9dcff", "#fff0c8", "#d9f2e6"][(row + i) % 4];
            g.beginPath();
            g.ellipse(cx, cy, 30, 46 - row * 3, side * (0.5 + i * 0.12), 0, Math.PI * 2);
            g.fill();
            g.stroke();
          }
        }
      }
      g.fillStyle = "#c27aa8";
      g.font = "bold 34px 'Gaegu', sans-serif";
      g.textAlign = "center";
      g.fillText("berdiri sini ♥", 256, 360);
    } else if (kind === "sequin") {
      g.fillStyle = "#e7c7e8";
      g.fillRect(0, 0, 512, 384);
      for (let y = 0; y < 384; y += 12) {
        for (let x = (y / 12) % 2 ? 6 : 0; x < 512; x += 12) {
          const k = Math.random();
          g.fillStyle = k > 0.8 ? "#ffffff" : k > 0.5 ? "#f6d6f2" : k > 0.25 ? "#d9b2e0" : "#c79bd2";
          g.beginPath();
          g.arc(x, y, 5, 0, Math.PI * 2);
          g.fill();
        }
      }
    } else if (kind === "clouds") {
      const grad = g.createLinearGradient(0, 0, 0, 384);
      grad.addColorStop(0, "#9fd0ff");
      grad.addColorStop(1, "#ffd6e6");
      g.fillStyle = grad;
      g.fillRect(0, 0, 512, 384);
      g.fillStyle = "#ffffff";
      for (const [cx, cy, s] of [[110, 100, 1], [380, 80, 0.8], [250, 230, 1.2], [90, 300, 0.7], [430, 290, 0.9]]) {
        for (const [dx, dy, r] of [[0, 0, 40], [38, -10, 32], [-36, 6, 28], [12, 18, 34]]) {
          g.beginPath();
          g.arc(cx + dx * s, cy + dy * s, r * s, 0, Math.PI * 2);
          g.fill();
        }
      }
      g.fillStyle = "#ff6fa0";
      g.font = "bold 44px 'Bagel Fat One', sans-serif";
      g.textAlign = "center";
      g.fillText("cloud nine ♥", 256, 370);
    } else {
      // Flower wall base, balloon arch panel: soft cream with a hand-lettered line.
      g.fillStyle = kind === "flowers" ? "#ffd1df" : "#fff4e8";
      g.fillRect(0, 0, 512, 384);
      if (kind === "balloons") {
        g.fillStyle = "#ff6fa0";
        g.font = "bold 66px 'Gaegu', sans-serif";
        g.textAlign = "center";
        g.fillText("senyum~", 256, 200);
        g.font = "bold 30px 'Gaegu', sans-serif";
        g.fillStyle = "#b07ac8";
        g.fillText("#lorongphotobooth", 256, 252);
      }
    }
  });
}

/** A photo backdrop facing the camera, about 3.8 wide, posing spot in front (+z). */
export function backdrop(kind: BackdropKind, x: number, z: number, seed = 0): Anim & { statics: THREE.Group; box: [number, number, number, number] } {
  const statics = new THREE.Group();
  const group = new THREE.Group();
  const W = 3.8;
  const H = 2.9;
  const r = rng(seed + 31);
  const frameMat = flat(0xfffdf8);
  const tex = backdropTex(kind);
  if (kind === "frame") {
    // A giant instant-photo cut-out: people stand behind it and pose in the hole.
    const white = flat(0xfffdf8);
    statics.add(mesh(roundedBox(W, 0.3, 0.12), white, 0, H - 0.15, 0));
    statics.add(mesh(roundedBox(0.3, H - 0.9, 0.12), white, -W / 2 + 0.15, (H - 0.9) / 2 + 0.9, 0));
    statics.add(mesh(roundedBox(0.3, H - 0.9, 0.12), white, W / 2 - 0.15, (H - 0.9) / 2 + 0.9, 0));
    const capTex = canvasTexture(512, 128, (g) => {
      g.fillStyle = "#fffdf8";
      g.fillRect(0, 0, 512, 128);
      g.fillStyle = "#ff6fa0";
      g.font = "bold 50px 'Gaegu', sans-serif";
      g.textAlign = "center";
      g.textBaseline = "middle";
      g.fillText("#BOLATEX ♥ kenangan", 256, 64, 480);
    });
    const cap = panel(capTex, W, 0.9, 0.12, white);
    cap.position.set(0, 0.45 + 0.35, 0);
    cap.scale.y = 1;
    statics.add(cap);
    for (const lx of [-1.2, 1.2]) statics.add(mesh(roundedBox(0.08, 0.4, 0.5), flat(0xd8c8b8), lx, 0.2, -0.2));
    // Raise the whole thing so the hole sits at face height.
    statics.children.forEach((c) => (c.position.y += 0.15));
  } else {
    // Panel on two feet with a frame.
    const back = panel(tex, W, H, 0.12, frameMat, kind === "neon" ? 0x2a1a30 : 0x000000);
    back.position.set(0, H / 2 + 0.1, 0);
    statics.add(back);
    statics.add(mesh(roundedBox(W + 0.16, 0.14, 0.18), frameMat, 0, H + 0.17, 0));
    for (const lx of [-W / 2, W / 2]) {
      statics.add(mesh(roundedBox(0.14, H + 0.2, 0.18), frameMat, lx, (H + 0.2) / 2, 0));
      statics.add(mesh(roundedBox(0.2, 0.08, 0.8), frameMat, lx, 0.04, -0.2));
    }
    // A low rug to stand on.
    const rug = mesh(new THREE.CircleGeometry(1.25, 24), flat([0xffd1df, 0xe9dcff, 0xfff0c8, 0xd9f2e6][seed % 4]), 0, 0.07, 1.2);
    rug.rotation.x = -Math.PI / 2;
    rug.scale.y = 0.6;
    statics.add(rug);
  }
  if (kind === "flowers") {
    // Covered in blooms.
    const petals = [0xff7fa8, 0xffffff, 0xffc4a8, 0xcdb9f2, 0xffe27a, 0xff9fc0].map((c) => flat(c));
    const leaf = flat(0x7cc48f);
    const geo = new THREE.SphereGeometry(0.16, 24, 16);
    const lgeo = new THREE.SphereGeometry(0.12, 24, 16);
    for (let i = 0; i < 120; i++) {
      const fx = (r() - 0.5) * (W - 0.3);
      const fy = 0.3 + r() * (H - 0.4);
      statics.add(mesh(i % 5 ? geo : lgeo, i % 5 ? petals[i % petals.length] : leaf, fx, fy, 0.1 + r() * 0.06));
    }
    const neon = canvasTexture(512, 128, (g) => {
      g.textAlign = "center";
      g.textBaseline = "middle";
      g.font = "bold 76px 'Gaegu', sans-serif";
      g.shadowColor = "#ffffff";
      g.shadowBlur = 18;
      g.fillStyle = "#fffaf4";
      g.fillText("senyum sikit ♥", 256, 64);
    });
    group.add(mesh(new THREE.PlaneGeometry(2.8, 0.7), new THREE.MeshBasicMaterial({ map: neon, transparent: true, depthWrite: false }), 0, 2.15, 0.2));
  }
  let shimmer: THREE.Texture | null = null;
  if (kind === "sequin") {
    shimmer = tex;
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  }
  const balloons: THREE.Mesh[] = [];
  if (kind === "balloons") {
    const cols = [0xffb3cb, 0xfffdf8, 0xcdb9f2, 0xffe7a0, 0xa8e3c8, 0xff8fb1];
    const n = 34;
    for (let i = 0; i < n; i++) {
      const a = Math.PI * (i / (n - 1));
      const rr = 2.05 + (i % 3) * 0.18;
      const b = mesh(new THREE.SphereGeometry(0.26 + (i % 4) * 0.04, 10, 8), new THREE.MeshLambertMaterial({ color: cols[i % cols.length] }), -Math.cos(a) * rr, 0.35 + Math.sin(a) * (rr + 0.35), 0.2 + (i % 2) * 0.1);
      b.scale.y = 1.12;
      b.castShadow = true;
      balloons.push(b);
      group.add(b);
    }
  }
  shadowed(statics);
  for (const o of [statics, group]) o.position.set(x, 0, z);
  const update = (t: number) => {
    if (shimmer) shimmer.offset.set(Math.sin(t * 0.7) * 0.01, Math.floor(t * 6) % 2 ? 0.004 : 0);
    balloons.forEach((b, i) => {
      b.position.y += Math.sin(t * 1.6 + i) * 0.0015;
      b.rotation.z = Math.sin(t * 1.1 + i * 0.7) * 0.08;
    });
  };
  return { group, update, statics, box: [x - W / 2 - 0.2, z - 0.45, x + W / 2 + 0.2, z + 0.3] };
}

// ---------------------------------------------------------------- Giant camera

/** Where things are on the giant camera, relative to its centre on the ground. */
export const CAM_W = 11;
export const CAM_H = 5;
export const CAM_D = 3.6;
const LENS_Y = 2.6;

export interface GiantCamera extends Anim {
  statics: THREE.Group;
  boxes: [number, number, number, number][];
  /** World position of the flash window, for the town-wide flash. */
  flashPos: THREE.Vector3;
  /** Strip x positions on the gallery strings, and the z where to stand to read them. */
  stripX: number[];
  stripZ: number;
  easel: [number, number];
  /** Run the zoom-and-flash right now (an arrival scene). */
  kick(): void;
}

function lensRingTex() {
  return canvasTexture(512, 512, (g) => {
    g.fillStyle = "#2a2730";
    g.fillRect(0, 0, 512, 512);
    g.fillStyle = "#e9e2ea";
    g.font = "bold 26px 'Bagel Fat One', sans-serif";
    g.textAlign = "center";
    g.textBaseline = "middle";
    const text = "BOLAT·CAM  ZOOM LENS 26x  ♥  1:2.8  OPTICAL  ♥  QISH EDITION  ";
    for (let i = 0; i < text.length; i++) {
      const a = (i / text.length) * Math.PI * 2 - Math.PI / 2;
      g.save();
      g.translate(256 + Math.cos(a) * 222, 256 + Math.sin(a) * 222);
      g.rotate(a + Math.PI / 2);
      g.fillText(text[i], 0, 0);
      g.restore();
    }
  });
}

function glassTex() {
  return canvasTexture(256, 256, (g) => {
    const grad = g.createRadialGradient(128, 128, 10, 128, 128, 128);
    grad.addColorStop(0, "#1a1430");
    grad.addColorStop(0.6, "#3b2f6e");
    grad.addColorStop(0.85, "#7a5cb0");
    grad.addColorStop(1, "#2a2050");
    g.fillStyle = grad;
    g.fillRect(0, 0, 256, 256);
    // Coated-glass reflections: a pink arc and a green glint.
    g.strokeStyle = "rgba(255,150,210,.55)";
    g.lineWidth = 12;
    g.beginPath();
    g.arc(128, 128, 84, Math.PI * 1.1, Math.PI * 1.5);
    g.stroke();
    g.strokeStyle = "rgba(140,255,200,.4)";
    g.lineWidth = 7;
    g.beginPath();
    g.arc(128, 128, 60, Math.PI * 0.15, Math.PI * 0.4);
    g.stroke();
    g.fillStyle = "rgba(255,255,255,.75)";
    g.beginPath();
    g.ellipse(86, 82, 22, 12, -0.7, 0, Math.PI * 2);
    g.fill();
  });
}

/** The centrepiece: a pink compact digital camera the size of a house, lens facing the road. Every
 * few seconds it zooms out, beeps, and fires a flash that lights the whole town, then prints a strip
 * out of the slot on top that the wind takes. Bolat ex's Galeri Memori hangs across its front: two
 * strings of fairy lights either side of the lens with the strips pegged on. `shown(i)` says which
 * of the ten strips are back (the rest are empty pegs until Qish chases them down). */
export function giantCamera(cx: number, cz: number, shown: (i: number) => boolean, onFlash: (strength: number) => void, wind: StripWind): GiantCamera {
  const statics = new THREE.Group();
  const group = new THREE.Group();
  const W = CAM_W;
  const H = CAM_H;
  const D = CAM_D;
  const pink = flat(0xffa6c4);
  const deep = flat(0xf07aa4);
  const silver = flat(0xe6e2ea);
  const dark = flat(0x2a2730);
  const R = 0.7;
  // Body with rounded vertical edges.
  statics.add(mesh(roundedBox(W - 2 * R, H, D), pink, 0, H / 2, 0));
  statics.add(mesh(roundedBox(W, H, D - 2 * R), pink, 0, H / 2, 0));
  for (const [ex, ez] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) statics.add(mesh(new THREE.CylinderGeometry(R, R, H, 14), pink, ex * (W / 2 - R), H / 2, ez * (D / 2 - R)));
  // Silver top plate, slightly inset, and a darker band at the bottom.
  statics.add(mesh(roundedBox(W - 1.6, 0.22, D - 0.5), silver, 0, H + 0.11, 0));
  statics.add(mesh(roundedBox(W - 0.2, 0.3, D - 0.2), deep, 0, 0.15, 0));
  // Grip bulge on the right of the front, with a leatherette texture.
  const grip = canvasTexture(128, 256, (g) => {
    g.fillStyle = "#f07aa4";
    g.fillRect(0, 0, 128, 256);
    for (let i = 0; i < 1400; i++) {
      g.fillStyle = Math.random() < 0.5 ? "rgba(255,255,255,.12)" : "rgba(120,20,60,.15)";
      g.fillRect(Math.random() * 128, Math.random() * 256, 2, 2);
    }
  });
  const gripMesh = panel(grip, 0.6, H - 1.4, 0.5, deep);
  gripMesh.position.set(W / 2 - 0.35, (H - 1.4) / 2 + 0.6, D / 2 + 0.2);
  statics.add(gripMesh);
  const fz = D / 2;
  // Lens: a fixed outer ring, two zoom barrels that slide out, the glass and the iris.
  const lensX = -0.1;
  const ring = mesh(new THREE.CylinderGeometry(2.45, 2.55, 0.5, 36), silver, lensX, LENS_Y, fz + 0.25);
  ring.rotation.x = Math.PI / 2;
  statics.add(ring);
  const ringFace = mesh(new THREE.RingGeometry(1.95, 2.45, 48), new THREE.MeshLambertMaterial({ map: lensRingTex() }), lensX, LENS_Y, fz + 0.505);
  statics.add(ringFace);
  const zoom = new THREE.Group();
  zoom.position.set(lensX, LENS_Y, fz + 0.5);
  const b1 = mesh(new THREE.CylinderGeometry(1.95, 1.95, 0.7, 36), dark, 0, 0, 0);
  b1.rotation.x = Math.PI / 2;
  const b2 = mesh(new THREE.CylinderGeometry(1.75, 1.75, 0.7, 36), silver, 0, 0, 0);
  b2.rotation.x = Math.PI / 2;
  const glass = mesh(new THREE.CircleGeometry(1.55, 40), new THREE.MeshBasicMaterial({ map: glassTex() }), 0, 0, 0);
  // Iris: an aperture closing in from the rim, drawn at a few stops and swapped in on the shot.
  const stops = [0.3, 0.55, 0.8, 0.97].map((k) =>
    canvasTexture(256, 256, (g) => {
      g.fillStyle = "#15121a";
      g.beginPath();
      g.arc(128, 128, 127, 0, Math.PI * 2);
      const r = 124 * (1 - k);
      for (let i = 0; i <= 7; i++) {
        const a = (i / 7) * Math.PI * 2 + k * 0.8;
        const px = 128 + Math.cos(a) * r;
        const py = 128 + Math.sin(a) * r;
        if (i) g.lineTo(px, py);
        else g.moveTo(px, py);
      }
      g.fill("evenodd");
      g.strokeStyle = "rgba(90,80,110,.8)";
      g.lineWidth = 3;
      for (let i = 0; i < 7; i++) {
        const a = (i / 7) * Math.PI * 2 + k * 0.8;
        g.beginPath();
        g.moveTo(128 + Math.cos(a) * r, 128 + Math.sin(a) * r);
        g.lineTo(128 + Math.cos(a + 0.9) * 127, 128 + Math.sin(a + 0.9) * 127);
        g.stroke();
      }
    }),
  );
  const irisMat = new THREE.MeshBasicMaterial({ map: stops[0], transparent: true, depthWrite: false });
  const iris = mesh(new THREE.CircleGeometry(1.55, 40), irisMat, 0, 0, 0);
  zoom.add(b1, b2, glass, iris);
  group.add(zoom);
  // A touch smaller than the parts were drawn, so the gallery strings fit either side.
  for (const o of [ring, ringFace, zoom]) o.scale.setScalar(0.9);
  ring.scale.y = 0.9;
  // Flash window top left, AF lamp, brand plate top right.
  const flashTex = canvasTexture(256, 96, (g) => {
    g.fillStyle = "#f4f2ee";
    g.fillRect(0, 0, 256, 96);
    g.strokeStyle = "rgba(160,150,170,.5)";
    g.lineWidth = 3;
    for (let x = 8; x < 256; x += 12) {
      g.beginPath();
      g.moveTo(x, 6);
      g.lineTo(x, 90);
      g.stroke();
    }
  });
  const flashMat = new THREE.MeshBasicMaterial({ map: flashTex, color: 0xd8d4dc });
  statics.add(mesh(roundedBox(2.3, 0.95, 0.12), silver, -3.7, H - 0.75, fz + 0.04));
  group.add(mesh(new THREE.PlaneGeometry(2.1, 0.78), flashMat, -3.7, H - 0.75, fz + 0.11));
  const af = new THREE.MeshBasicMaterial({ color: 0xb85a2a });
  group.add(mesh(new THREE.CircleGeometry(0.17, 12), af, -1.95, H - 0.6, fz + 0.02));
  const brand = canvasTexture(512, 160, (g) => {
    g.fillStyle = "#e6e2ea";
    g.fillRect(0, 0, 512, 160);
    g.fillStyle = "#ff4f8a";
    g.font = "bold 74px 'Bagel Fat One', sans-serif";
    g.textAlign = "center";
    g.textBaseline = "middle";
    g.fillText("BOLAT·CAM", 256, 66);
    g.fillStyle = "#5b4766";
    g.font = "bold 28px 'Gaegu', sans-serif";
    g.fillText("DIGITAL 9000 · 26.0 MEGAPIXEL · HD", 256, 128);
  });
  const brandMesh = panel(brand, 3.2, 1.0, 0.08, silver);
  brandMesh.position.set(2.95, H - 0.75, fz + 0.03);
  statics.add(brandMesh);
  // Top: shutter button with zoom collar, mode dial, power button, slot for prints.
  statics.add(mesh(new THREE.CylinderGeometry(0.75, 0.75, 0.16, 20), silver, 3.4, H + 0.3, 0.3));
  const shutter = mesh(new THREE.CylinderGeometry(0.5, 0.5, 0.3, 20), flat(0xffd0de), 3.4, H + 0.5, 0.3);
  group.add(shutter);
  const dialTex = canvasTexture(128, 128, (g) => {
    g.fillStyle = "#3a3442";
    g.fillRect(0, 0, 128, 128);
    g.fillStyle = "#fffdf6";
    g.font = "bold 18px 'Bagel Fat One', sans-serif";
    g.textAlign = "center";
    g.textBaseline = "middle";
    ["AUTO", "P", "♥", "M", "▶", "SCN"].forEach((s, i) => {
      const a = (i / 6) * Math.PI * 2;
      g.fillText(s, 64 + Math.cos(a) * 42, 64 + Math.sin(a) * 42);
    });
  });
  const dial = new THREE.Mesh(new THREE.CylinderGeometry(0.85, 0.85, 0.36, 24), [flat(0x3a3442), new THREE.MeshLambertMaterial({ map: dialTex }), flat(0x3a3442)]);
  dial.position.set(1.2, H + 0.4, 0.2);
  group.add(dial);
  statics.add(mesh(new THREE.CylinderGeometry(0.28, 0.28, 0.12, 14), flat(0x5bd18a), -0.6, H + 0.27, 0.6));
  statics.add(mesh(roundedBox(3.0, 0.14, 0.32), dark, -2.6, H + 0.29, -0.6));
  // Pop-up hot shoe and strap lugs with a big strap draped down both sides to the plaza.
  statics.add(mesh(roundedBox(1.0, 0.18, 0.7), silver, -0.9, H + 0.31, -0.2));
  const strapMat = flat(0xfffdf8);
  for (const side of [-1, 1]) {
    const lug = new THREE.Mesh(new THREE.TorusGeometry(0.22, 0.07, 6, 12), silver);
    lug.position.set(side * (W / 2 + 0.05), H - 0.6, 0);
    lug.rotation.y = Math.PI / 2;
    statics.add(lug);
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(side * (W / 2 + 0.15), H - 0.75, 0),
      new THREE.Vector3(side * (W / 2 + 0.7), H - 2.2, 0.6),
      new THREE.Vector3(side * (W / 2 + 1.1), 0.3, 1.4),
      new THREE.Vector3(side * (W / 2 + 0.6), 0.12, 2.4),
      new THREE.Vector3(side * (W / 2 - 0.4), 0.12, 2.6),
    ]);
    const strap = new THREE.Mesh(new THREE.TubeGeometry(curve, 24, 0.22, 6), strapMat);
    statics.add(strap);
  }
  // A print coming up out of the slot on top.
  const printMat = new THREE.MeshLambertMaterial({ map: stripTex(2), side: THREE.DoubleSide });
  const print = mesh(new THREE.PlaneGeometry(0.7, 2.0), printMat, -2.6, H, -0.6);
  print.visible = false;
  group.add(print);

  // Galeri Memori: two strings of fairy lights across the front with the strips pegged on.
  const stripX: number[] = [];
  const pegs: { m: THREE.Mesh; base: number; i: number }[] = [];
  const SW = 0.46;
  const SH = 1.38;
  const leftX: [number, number] = [-W / 2 + 0.35, lensX - 2.4];
  const rightX: [number, number] = [lensX + 2.4, W / 2 - 0.75];
  const gz = fz + 0.12;
  const strandY = 3.55;
  const strings: [number, number][] = [leftX, rightX];
  const wire = new THREE.Group();
  const bulbAt: THREE.Vector3[] = [];
  strings.forEach(([x0, x1], si) => {
    const pts: THREE.Vector3[] = [];
    for (let k = 0; k <= 12; k++) {
      const f = k / 12;
      pts.push(new THREE.Vector3(x0 + (x1 - x0) * f, strandY - Math.sin(f * Math.PI) * 0.22, gz + 0.04));
    }
    wire.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), new THREE.LineBasicMaterial({ color: 0x5b4766 })));
    for (let k = 0; k < 9; k++) {
      const f = (k + 0.5) / 9;
      bulbAt.push(new THREE.Vector3(x0 + (x1 - x0) * f, strandY - Math.sin(f * Math.PI) * 0.22 - 0.06, gz + 0.06));
    }
    for (let k = 0; k < 5; k++) {
      const i = si * 5 + k;
      const f = (k + 0.5) / 5;
      const sx = x0 + (x1 - x0) * f;
      const top = strandY - Math.sin(f * Math.PI) * 0.22;
      stripX.push(cx + sx);
      const p = new THREE.Group();
      p.position.set(sx, top, gz + 0.02);
      const frame = mesh(new THREE.PlaneGeometry(SW + 0.06, SH + 0.06), new THREE.MeshBasicMaterial({ color: 0x2a2730 }), 0, -SH / 2 - 0.03, -0.005);
      const photo = mesh(new THREE.PlaneGeometry(SW, SH), new THREE.MeshBasicMaterial({ map: realStripTex(i), color: 0xf6efe6 }), 0, -SH / 2 - 0.03, 0);
      const peg = mesh(roundedBox(0.06, 0.16, 0.05), flat([0xff8fb1, 0xffcb05, 0x9fd3b0, 0xb9c4ff][i % 4]), 0, -0.02, 0.01);
      p.add(peg);
      const hang = new THREE.Group();
      hang.add(frame, photo);
      p.add(hang);
      group.add(p);
      pegs.push({ m: hang as unknown as THREE.Mesh, base: (i % 2 ? 1 : -1) * 0.04, i });
    }
  });
  group.add(wire);
  const bulbs = new THREE.InstancedMesh(new THREE.SphereGeometry(0.06,20,14), new THREE.MeshBasicMaterial({ color: 0xffffff }), bulbAt.length);
  bulbAt.forEach((p, i) => bulbs.setMatrixAt(i, new THREE.Matrix4().makeTranslation(p.x, p.y, p.z)));
  const warm = new THREE.Color(0xfff2c0);
  const rose = new THREE.Color(0xffc4dc);
  group.add(bulbs);
  shadowed(statics);
  // Easel with Qish's doodle and a little table with an instant camera, either side of the plaza.
  const wood = flat(0x8a5a32);
  const easel = new THREE.Group();
  for (const lx of [-0.42, 0.42]) {
    const leg = mesh(roundedBox(0.07, 2.2, 0.07), wood, lx, 1.1, 0);
    leg.rotation.z = lx > 0 ? -0.1 : 0.1;
    easel.add(leg);
  }
  const eb = mesh(roundedBox(0.07, 2.1, 0.07), wood, 0, 1.0, -0.45);
  eb.rotation.x = 0.35;
  easel.add(eb, mesh(roundedBox(1.15, 0.06, 0.16), wood, 0, 0.95, 0.05));
  const canvasBack = mesh(roundedBox(1.2, 1.0, 0.05), flat(0xfffdf6), 0, 1.47, 0.02);
  canvasBack.rotation.x = -0.1;
  const doodleTex = new THREE.TextureLoader().load("/assets/story/doodle_kita.webp");
  doodleTex.colorSpace = THREE.SRGBColorSpace;
  const doodle = mesh(new THREE.PlaneGeometry(1.1, 0.9), new THREE.MeshBasicMaterial({ map: doodleTex, color: 0xf6eee2 }), 0, 1.47, 0.06);
  doodle.rotation.x = -0.1;
  easel.add(canvasBack, doodle);
  const easelAt: [number, number] = [-W / 2 + 0.2, fz + 2.3];
  easel.position.set(easelAt[0], 0, easelAt[1]);
  easel.rotation.y = 0.35;
  statics.add(shadowed(easel));
  const tx = W / 2 - 0.6;
  const tz = fz + 2.2;
  statics.add(mesh(roundedBox(1.1, 0.06, 0.75), flat(0xfffdf6), tx, 0.8, tz));
  for (const [lx, lz] of [[-0.46, -0.3], [0.46, -0.3], [-0.46, 0.3], [0.46, 0.3]]) statics.add(mesh(roundedBox(0.05, 0.8, 0.05), dark, tx + lx, 0.4, tz + lz));
  statics.add(mesh(roundedBox(0.4, 0.3, 0.24), flat(0xff8fb1), tx - 0.18, 0.98, tz - 0.05));
  const tl = mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.06, 12), dark, tx - 0.18, 0.97, tz + 0.09);
  tl.rotation.x = Math.PI / 2;
  statics.add(tl);
  for (let i = 0; i < 5; i++) {
    const pol = mesh(roundedBox(0.18, 0.006, 0.21), flat(0xfffdf6), tx + 0.2 + (i % 2) * 0.14, 0.835 + i * 0.006, tz - 0.1 + i * 0.06);
    pol.rotation.y = i * 0.5;
    statics.add(pol);
  }
  // A-frame sandwich board out at the plaza mouth.
  const boardTex = canvasTexture(256, 320, (g) => {
    g.fillStyle = "#fff4f8";
    g.fillRect(0, 0, 256, 320);
    g.strokeStyle = "#ff5fa2";
    g.lineWidth = 10;
    g.strokeRect(8, 8, 240, 304);
    g.textAlign = "center";
    g.fillStyle = "#ff5fa2";
    g.font = "bold 40px 'Bagel Fat One', sans-serif";
    g.fillText("GALERI", 128, 70);
    g.fillText("MEMORI", 128, 116);
    g.fillStyle = INK;
    g.font = "bold 26px 'Gaegu', sans-serif";
    g.fillText("pop-up · oleh", 128, 166);
    g.fillText("Jom susun!", 128, 196);
    g.fillText("dalam lensa ↑", 128, 244);
    g.fillStyle = "#ff5fa2";
    heartPath(g, 128, 284, 22);
    g.fill();
  });
  const aframe = new THREE.Group();
  const bm = panel(boardTex, 0.9, 1.15, 0.05, flat(0xffd1df));
  bm.position.set(0, 0.62, 0.18);
  bm.rotation.x = -0.28;
  const bb = mesh(roundedBox(0.9, 1.15, 0.05), flat(0xffd1df), 0, 0.62, -0.18);
  bb.rotation.x = 0.28;
  aframe.add(bm, bb);
  aframe.position.set(-W / 2 - 1.4, 0, fz + 3.6);
  aframe.rotation.y = 0.3;
  statics.add(shadowed(aframe));

  for (const o of [statics, group]) o.position.set(cx, 0, cz);
  const flashPos = new THREE.Vector3(cx - 3.7, H - 0.75, cz + fz + 0.6);
  const bigFlare = flare(0xffffff, 0.1);
  bigFlare.position.copy(flashPos);
  const pool = spill(9, 0xfff6fa);
  pool.position.set(cx, 0.1, cz + fz + 5);
  const light = new THREE.PointLight(0xffffff, 0, 38, 1.2);
  light.position.copy(flashPos).add(new THREE.Vector3(0, 0, 1.2));
  const fx = new THREE.Group();
  fx.add(bigFlare, pool, light);

  // The cycle: zoom out → AF beep → FLASH (iris snaps) → print rises out of the top → off it flies → zoom back.
  const PERIOD = 10;
  let fired = -1;
  let emitted = -1;
  let base = 0;
  let kicked = false;
  const update = (t: number) => {
    if (kicked) {
      // Jump to just before the shot.
      kicked = false;
      base = t - 1.9 - Math.floor((t - 1.9) / PERIOD) * PERIOD;
    }
    const k = (t - base) % PERIOD;
    const cycle = Math.floor((t - base) / PERIOD) + 1000;
    const ease = (v: number) => v * v * (3 - 2 * v);
    const out = k < 1.4 ? ease(k / 1.4) : k < 5 ? 1 : k < 6.4 ? 1 - ease((k - 5) / 1.4) : 0;
    b1.position.z = 0.35 + out * 0.55;
    b2.position.z = 0.7 + out * 1.15;
    glass.position.z = iris.position.z = 1.06 + out * 1.15;
    iris.position.z += 0.01;
    shutter.position.y = H + 0.5 - (k > 1.9 && k < 2.25 ? 0.14 : 0);
    // AF assist lamp blinks before the shot.
    const afOn = k > 1.4 && k < 2.2 && Math.floor(k * 10) % 2 === 0;
    af.color.setHex(afOn ? 0xffa040 : 0xb85a2a);
    let f = 0;
    if (k >= 2.2 && k < 3.0) f = Math.max(0, 1 - (k - 2.2) / 0.45);
    if (k >= 2.2 && fired !== cycle) {
      fired = cycle;
      onFlash(1);
    }
    flashMat.color.setRGB(0.85 + f * 0.15, 0.83 + f * 0.17, 0.86 + f * 0.14);
    bigFlare.scale.setScalar(2 + f * 26);
    bigFlare.material.opacity = f;
    (pool.material as THREE.MeshBasicMaterial).opacity = f * 0.55;
    light.intensity = f * 180;
    // Iris snaps shut and opens again.
    const shut = k >= 2.2 && k < 2.7 ? Math.sin(((k - 2.2) / 0.5) * Math.PI) : 0;
    iris.visible = shut > 0.1;
    if (iris.visible) irisMat.map = stops[Math.min(3, Math.floor(shut * 4))];
    // The print.
    if (k > 3.4 && k < 5.0) {
      print.visible = true;
      print.position.y = H - 0.9 + Math.min(1, (k - 3.4) / 1.2) * 1.9;
      print.rotation.z = Math.sin(t * 6) * 0.05;
    } else {
      print.visible = false;
      if (k >= 5.0 && emitted !== cycle) {
        emitted = cycle;
        printMat.map = stripTex(cycle);
        wind.emit(cx - 2.6, H + 1.9, cz - 0.6, 1.4, 2.2, 0.4);
        if (cycle % 2) wind.emit(cx - 2.2, H + 1.6, cz - 0.4, 0.8, 2.6, 0.8);
      }
    }
    dial.rotation.y = t * 0.15;
    for (let i = 0; i < bulbAt.length; i++) bulbs.setColorAt(i, (Math.floor(t * 2) + i) % 3 ? warm : rose);
    if (bulbs.instanceColor) bulbs.instanceColor.needsUpdate = true;
    pegs.forEach((p) => {
      p.m.visible = shown(p.i);
      p.m.rotation.z = p.base + Math.sin(t * 1.2 + p.i) * 0.03 + f * 0.1;
    });
  };
  group.add(fx);
  return {
    group,
    update,
    statics,
    boxes: [
      [cx - W / 2 - 0.1, cz - D / 2, cx + W / 2 + 0.1, cz + D / 2 + 0.55],
      [cx + lensX - 2.6, cz + D / 2, cx + lensX + 2.6, cz + D / 2 + 1.9],
      [cx + easelAt[0] - 0.6, cz + easelAt[1] - 0.6, cx + easelAt[0] + 0.6, cz + easelAt[1] + 0.3],
      [cx + tx - 0.6, cz + tz - 0.45, cx + tx + 0.6, cz + tz + 0.45],
      [cx - W / 2 - 1.85, cz + fz + 3.25, cx - W / 2 - 0.95, cz + fz + 3.95],
      // The strap loops on the plaza.
      [cx - W / 2 - 1.3, cz - 0.4, cx - W / 2 + 0.2, cz + D / 2 + 1.2],
      [cx + W / 2 - 0.2, cz - 0.4, cx + W / 2 + 1.3, cz + D / 2 + 1.2],
    ],
    flashPos,
    stripX,
    stripZ: cz + gz + 1.6,
    easel: [cx + easelAt[0], cz + easelAt[1] + 0.7],
    kick() {
      kicked = true;
    },
  };
}

/** A white wash over the whole view for the giant camera's flash: a big plane between the camera and
 * Qish, faded out fast. */
export function screenFlash(): Anim & { pop(strength: number): void; follow(p: THREE.Vector3): void } {
  const group = new THREE.Group();
  const m = new THREE.Mesh(new THREE.PlaneGeometry(90, 90), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0, depthTest: false, depthWrite: false }));
  m.renderOrder = 50;
  m.frustumCulled = false;
  m.visible = false;
  group.add(m);
  let at = -9;
  let power = 0;
  let pending = 0;
  const off = new THREE.Vector3(0, 19, 17.5).multiplyScalar(0.35);
  return {
    group,
    pop(strength: number) {
      pending = strength;
    },
    follow(p: THREE.Vector3) {
      m.position.copy(p).add(off);
      m.lookAt(p.x, p.y + 19, p.z + 17.5);
    },
    update(t: number) {
      if (pending) {
        at = t;
        power = pending;
        pending = 0;
      }
      const k = Math.max(0, 1 - (t - at) / 0.55);
      const o = power * k * k * 0.5;
      m.visible = o > 0.005;
      (m.material as THREE.MeshBasicMaterial).opacity = o;
    },
  };
}

// ---------------------------------------------------------------- Town pieces

/** A giant 35mm film canister standing on end (a pillar of the welcome gate). */
function canister(x: number, z: number, h = 3.8) {
  const g = new THREE.Group();
  const label = canvasTexture(512, 256, (c) => {
    c.fillStyle = "#ffcb05";
    c.fillRect(0, 0, 512, 256);
    c.fillStyle = "#ff4f8a";
    c.fillRect(0, 70, 512, 116);
    c.fillStyle = "#fffdf6";
    c.font = "bold 70px 'Bagel Fat One', sans-serif";
    c.textAlign = "center";
    c.textBaseline = "middle";
    c.fillText("BOLAT 400", 256, 130);
    c.fillStyle = "#2a2730";
    c.font = "bold 30px 'Bagel Fat One', sans-serif";
    c.fillText("COLOR FILM · 36 EXP", 256, 40);
    c.fillText("♥ FOTOBOOTH ♥", 256, 218);
  });
  const body = new THREE.Mesh(new THREE.CylinderGeometry(1.0, 1.0, h, 28, 1, true), new THREE.MeshLambertMaterial({ map: label }));
  body.position.y = h / 2 + 0.25;
  const dark = flat(0x2a2730);
  g.add(body, mesh(new THREE.CylinderGeometry(1.08, 1.08, 0.3, 28), dark, 0, 0.15, 0), mesh(new THREE.CylinderGeometry(1.08, 1.08, 0.3, 28), dark, 0, h + 0.4, 0));
  g.add(mesh(new THREE.CylinderGeometry(0.35, 0.35, 0.4, 14), dark, 0, h + 0.75, 0));
  g.position.set(x, 0, z);
  return shadowed(g);
}

/** Welcome sign on the Nyomnyom end, beside the road facing the camera: two film-canister pillars
 * with a length of film across the top carrying the town's name. */
export function canisterGate(x0: number, x1: number, z: number) {
  const g = new THREE.Group();
  g.add(canister(x0, z), canister(x1, z));
  const tex = canvasTexture(1024, 200, (c) => {
    c.fillStyle = "#5b4766";
    c.fillRect(0, 0, 1024, 200);
    c.fillStyle = "#fff3ea";
    for (let i = 0; i < 16; i++) for (const y of [8, 170]) c.fillRect(i * 64 + 18, y, 28, 22);
    c.fillStyle = "#fbe6ee";
    c.fillRect(0, 40, 1024, 120);
    c.fillStyle = "#ff4f8a";
    c.font = "bold 76px 'Bagel Fat One', sans-serif";
    c.textAlign = "center";
    c.textBaseline = "middle";
    c.fillText("FOTOBOOTH", 512, 96);
    c.fillStyle = "#5b4766";
    c.font = "bold 26px 'Gaegu', sans-serif";
    c.fillText("senyum! · 1, 2, 3 · cheese!", 512, 142);
  });
  const span = Math.abs(x1 - x0) + 1.6;
  const banner = panel(tex, span, span * (200 / 1024), 0.16, flat(0x5b4766));
  banner.position.set((x0 + x1) / 2, 4.75, z + 0.2);
  g.add(banner);
  return shadowed(g);
}

/** Way-out sign on the Putrajaya end, beside the road facing the camera: two giant photo strips
 * standing up as pillars, a sign across the top. */
export function stripGate(x0: number, x1: number, z: number, text: string) {
  const g = new THREE.Group();
  const white = flat(0xfffdf8);
  for (const [x, v] of [[x0, 0], [x1, 3]] as const) {
    g.add(mesh(roundedBox(1.5, 4.6, 0.2), white, x, 2.3, z));
    g.add(mesh(new THREE.PlaneGeometry(1.4, 4.5), new THREE.MeshLambertMaterial({ map: stripTex(v) }), x, 2.3, z + 0.105));
  }
  const tex = canvasTexture(1024, 220, (c) => {
    c.fillStyle = "#fffdf8";
    c.beginPath();
    c.roundRect(0, 0, 1024, 220, 50);
    c.fill();
    c.fillStyle = "#ff6fa0";
    c.font = "bold 92px 'Bagel Fat One', sans-serif";
    c.textAlign = "center";
    c.textBaseline = "middle";
    c.fillText(text, 512, 92);
    c.fillStyle = "#5b4766";
    c.font = "bold 34px 'Gaegu', sans-serif";
    c.fillText("terima kasih sebab senyum ♥", 512, 172);
  });
  const span = Math.abs(x1 - x0) + 1.5;
  const sign = panel(tex, span, span * (220 / 1024), 0.16, white);
  sign.position.set((x0 + x1) / 2, 5.0, z + 0.15);
  g.add(sign);
  return shadowed(g);
}

/** A two-storey pastel studio shophouse facing the camera: big shop window full of strips, a striped
 * awning, a sign, flower boxes upstairs. */
export function studioShop(x: number, z: number, w: number, name: string, seed: number) {
  const g = new THREE.Group();
  const r = rng(seed + 77);
  const walls = [0xffd6e3, 0xe6dcff, 0xd6f2e4, 0xfff0c4, 0xffdcc8, 0xd8ecff];
  const accents = ["#ff6fa0", "#7a5cd6", "#3fae8a", "#e0a020", "#ff7a5a", "#4f7fe0"];
  const c = seed % walls.length;
  const H = 6.2;
  const D = 4.5;
  const wall = flat(walls[c]);
  g.add(mesh(roundedBox(w, H, D), wall, 0, H / 2, 0));
  g.add(mesh(roundedBox(w + 0.3, 0.35, D + 0.3), flat(0xfffdf8), 0, H + 0.17, 0));
  const front = canvasTexture(512, 512, (k) => {
    k.fillStyle = "#" + walls[c].toString(16).padStart(6, "0");
    k.fillRect(0, 0, 512, 512);
    // Upstairs windows with flower boxes.
    for (const wx of [70, 300]) {
      k.fillStyle = "#fffdf8";
      k.fillRect(wx - 8, 40, 156, 150);
      k.fillStyle = "#bfe0f5";
      k.fillRect(wx, 48, 140, 134);
      k.fillStyle = "rgba(255,255,255,.6)";
      k.fillRect(wx + 10, 56, 26, 118);
      k.fillStyle = "#fffdf8";
      k.fillRect(wx + 66, 48, 8, 134);
      k.fillStyle = "#7cc48f";
      k.fillRect(wx - 6, 188, 152, 18);
      for (let i = 0; i < 9; i++) {
        k.fillStyle = ["#ff7fa8", "#fffdf8", "#ffd27a"][i % 3];
        k.beginPath();
        k.arc(wx + 4 + i * 17, 186, 7, 0, Math.PI * 2);
        k.fill();
      }
    }
    // Shop window full of strips, and a door.
    k.fillStyle = "#fffdf8";
    k.fillRect(22, 296, 330, 200);
    k.fillStyle = "#fff4f8";
    k.fillRect(32, 306, 310, 190);
    const cols = ["#ffd1df", "#d9ccff", "#c8f0dc", "#ffe7b0", "#cfe6ff"];
    for (let s = 0; s < 9; s++) {
      k.fillStyle = s % 2 ? "#2a2730" : "#fffdf8";
      k.fillRect(44 + s * 33, 330 + (s % 3) * 10, 24, 120);
      for (let i = 0; i < 4; i++) {
        k.fillStyle = cols[(s + i) % 5];
        k.fillRect(47 + s * 33, 334 + (s % 3) * 10 + i * 29, 18, 24);
      }
    }
    k.fillStyle = accents[c];
    k.fillRect(380, 300, 110, 196);
    k.fillStyle = "#fffdf8";
    k.fillRect(392, 312, 86, 120);
    k.fillStyle = "#ffcb05";
    k.beginPath();
    k.arc(470, 400, 6, 0, Math.PI * 2);
    k.fill();
  });
  const face = mesh(new THREE.PlaneGeometry(w, H), new THREE.MeshLambertMaterial({ map: front }), 0, H / 2, D / 2 + 0.01);
  g.add(face);
  // Striped awning over the shop floor.
  const awn = canvasTexture(256, 64, (k) => {
    for (let i = 0; i < 8; i++) {
      k.fillStyle = i % 2 ? "#fffdf8" : accents[c];
      k.fillRect(i * 32, 0, 32, 64);
    }
  });
  const awning = mesh(roundedBox(w * 0.86, 0.08, 1.3), new THREE.MeshLambertMaterial({ map: awn }), 0, 2.55, D / 2 + 0.6);
  awning.rotation.x = 0.32;
  g.add(awning);
  // Shop sign between the floors.
  const signTex = canvasTexture(640, 140, (k) => {
    k.fillStyle = "#fffdf8";
    k.beginPath();
    k.roundRect(0, 0, 640, 140, 30);
    k.fill();
    k.fillStyle = accents[c];
    k.font = `bold ${name.length > 12 ? 56 : 68}px 'Bagel Fat One', sans-serif`;
    k.textAlign = "center";
    k.textBaseline = "middle";
    k.fillText(name, 320, 74);
  });
  const sign = panel(signTex, Math.min(w - 0.4, 4.6), Math.min(w - 0.4, 4.6) * (140 / 640), 0.12, flat(0xfffdf8));
  sign.position.set(0, 3.55, D / 2 + 0.08);
  g.add(sign);
  if (r() < 0.6) {
    // A round blade sign sticking out.
    const blade = mesh(new THREE.CylinderGeometry(0.55, 0.55, 0.1, 18), flat(new THREE.Color(accents[c]).getHex()), w / 2 - 0.4, 4.7, D / 2 + 0.6);
    blade.rotation.x = Math.PI / 2;
    blade.rotation.z = Math.PI / 2;
    g.add(blade);
  }
  g.position.set(x, 0, z);
  return shadowed(g);
}

/** Pokok Strip: a little tree in a round bed with photo strips pegged all over it instead of leaves,
 * fluttering; now and then one comes loose and blows away. */
export function stripTree(x: number, z: number, wind: StripWind, seed = 0): Anim & { statics: THREE.Group } {
  const statics = new THREE.Group();
  const group = new THREE.Group();
  const bark = flat(0x9a6a48);
  statics.add(mesh(new THREE.CylinderGeometry(1.6, 1.7, 0.4, 24), flat(0xfffdf8), 0, 0.2, 0));
  statics.add(mesh(new THREE.CylinderGeometry(1.45, 1.45, 0.05, 24), flat(0x8fcf9f), 0, 0.41, 0));
  statics.add(mesh(new THREE.CylinderGeometry(0.2, 0.32, 2.6, 7), bark, 0, 1.6, 0));
  const r = rng(seed + 5);
  const tips: THREE.Vector3[] = [];
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2 + r() * 0.4;
    const len = 1.3 + r() * 0.5;
    const br = mesh(new THREE.CylinderGeometry(0.07, 0.12, len, 5), bark, Math.cos(a) * len * 0.35, 2.7 + r() * 0.3, Math.sin(a) * len * 0.35);
    br.rotation.set(Math.sin(a) * 0.9, 0, -Math.cos(a) * 0.9);
    statics.add(br);
    tips.push(new THREE.Vector3(Math.cos(a) * len * 0.7, 3.1 + r() * 0.3, Math.sin(a) * len * 0.7));
  }
  // A light pink crown of blossom over the branches.
  const blossom = flat(0xffc6d8);
  for (let i = 0; i < 9; i++) {
    const a = r() * Math.PI * 2;
    const d = r() * 1.1;
    statics.add(mesh(new THREE.IcosahedronGeometry(0.7 + r() * 0.3, 0), blossom, Math.cos(a) * d, 3.7 + r() * 0.6, Math.sin(a) * d));
  }
  shadowed(statics);
  const N = 30;
  const leaves = new THREE.InstancedMesh(new THREE.PlaneGeometry(0.26, 0.78), new THREE.MeshLambertMaterial({ map: stripTex(seed), side: THREE.DoubleSide }), N);
  leaves.castShadow = true;
  const spots = Array.from({ length: N }, (_, i) => {
    const tip = tips[i % tips.length];
    const a = r() * Math.PI * 2;
    return { p: new THREE.Vector3(tip.x * (0.4 + r() * 0.7) + Math.cos(a) * 0.4, 2.3 + r() * 1.0, tip.z * (0.4 + r() * 0.7) + Math.sin(a) * 0.4), yaw: r() * 6, phase: r() * 6, gone: 0 };
  });
  const colors = [0xffffff, 0xffe8f0, 0xf0e8ff, 0xe8fff4].map((c) => new THREE.Color(c));
  spots.forEach((_, i) => leaves.setColorAt(i, colors[i % colors.length]));
  group.add(leaves);
  for (const o of [statics, group]) o.position.set(x, 0, z);
  const m4 = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  const e = new THREE.Euler();
  const one = new THREE.Vector3(1, 1, 1);
  const zero = new THREE.Vector3(0, 0, 0);
  let next = 4;
  const update = (t: number) => {
    if (t > next) {
      next = t + 5 + r() * 6;
      const i = Math.floor(r() * N);
      if (spots[i].gone < t) {
        spots[i].gone = t + 8;
        wind.emit(x + spots[i].p.x, spots[i].p.y, z + spots[i].p.z, 1, 1.4, 0.2);
      }
    }
    spots.forEach((s, i) => {
      e.set(Math.sin(t * 3 + s.phase) * 0.25, s.yaw + Math.sin(t * 1.4 + s.phase) * 0.4, Math.sin(t * 2.2 + s.phase) * 0.15);
      q.setFromEuler(e);
      // A fresh strip grows back where one blew off.
      m4.compose(s.p, q, s.gone > t ? zero : one);
      leaves.setMatrixAt(i, m4);
    });
    leaves.instanceMatrix.needsUpdate = true;
  };
  return { group, update, statics };
}

/** A giant compact digital camera on a plinth (Y2K digicam street art), facing the camera. Its flash
 * pops now and then. */
export function digicamStatue(x: number, z: number, body: number, label: string, seed = 0): Anim & { statics: THREE.Group } {
  const statics = new THREE.Group();
  const group = new THREE.Group();
  statics.add(mesh(roundedBox(2.6, 1.0, 1.6), flat(0xfffdf8), 0, 0.5, 0));
  const plaque = canvasTexture(256, 64, (g) => {
    g.fillStyle = "#e0b252";
    g.fillRect(0, 0, 256, 64);
    g.fillStyle = "#2a2730";
    g.font = "bold 26px 'Bagel Fat One', sans-serif";
    g.textAlign = "center";
    g.textBaseline = "middle";
    g.fillText(label, 128, 34);
  });
  const pl = mesh(new THREE.PlaneGeometry(1.4, 0.35), new THREE.MeshLambertMaterial({ map: plaque }), 0, 0.55, 0.81);
  statics.add(pl);
  const cam = new THREE.Group();
  cam.position.y = 1.0;
  const bodyMat = flat(body);
  cam.add(mesh(roundedBox(2.3, 1.4, 0.75), bodyMat, 0, 0.75, 0));
  for (const ex of [-1, 1]) cam.add(mesh(new THREE.CylinderGeometry(0.37, 0.37, 1.4, 10), bodyMat, ex * 1.15, 0.75, 0));
  const lr = mesh(new THREE.CylinderGeometry(0.5, 0.55, 0.35, 20), flat(0xd8d8e0), 0.25, 0.72, 0.5);
  lr.rotation.x = Math.PI / 2;
  const lg = mesh(new THREE.CircleGeometry(0.38, 20), basic(0x3b2f6e), 0.25, 0.72, 0.68);
  cam.add(lr, lg, mesh(new THREE.CircleGeometry(0.1, 10), basic(0xffffff), 0.12, 0.84, 0.685));
  const flashMat = new THREE.MeshBasicMaterial({ color: 0xe8e4ee });
  cam.add(mesh(new THREE.PlaneGeometry(0.55, 0.22), flashMat, -0.75, 1.2, 0.38));
  cam.add(mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.12, 12), flat(0xd8d8e0), 0.75, 1.5, 0));
  cam.rotation.y = (seed % 2 ? 1 : -1) * 0.18;
  statics.add(cam);
  shadowed(statics);
  const fl = flare(0xffffff, 2.5);
  fl.position.set(-0.75 * Math.cos(cam.rotation.y), 2.2, 0.5);
  group.add(fl);
  for (const o of [statics, group]) o.position.set(x, 0, z);
  const r = rng(seed + 11);
  let next = 2 + r() * 6;
  let at = -9;
  const update = (t: number) => {
    if (t > next) {
      at = t;
      next = t + 5 + r() * 8;
    }
    const k = Math.max(0, 1 - (t - at) / 0.3);
    flashMat.color.setRGB(0.9 + k * 0.1, 0.89 + k * 0.11, 0.93 + k * 0.07);
    fl.material.opacity = k;
  };
  return { group, update, statics };
}

/** A string of little instant photos across the road between two posts, swaying (one instanced mesh
 * for every photo on every string). */
export function polaroidBunting(strings: [[number, number, number], [number, number, number]][]): Anim & { statics: THREE.Group } {
  const group = new THREE.Group();
  const statics = new THREE.Group();
  const pole = flat(0xfffdf8);
  const tex = shared(
    canvasTexture(64, 76, (g) => {
      g.fillStyle = "#fffdf8";
      g.fillRect(0, 0, 64, 76);
      g.fillStyle = "#d8d0d8";
      g.fillRect(6, 6, 52, 50);
      g.fillStyle = "#ffffff";
      g.beginPath();
      g.arc(32, 31, 12, 0, Math.PI * 2);
      g.fill();
    }),
  );
  type Pic = { a: THREE.Vector3; b: THREE.Vector3; k: number; phase: number };
  const pics: Pic[] = [];
  const wires = new THREE.Group();
  strings.forEach(([a, b], si) => {
    const A = new THREE.Vector3(...a);
    const B = new THREE.Vector3(...b);
    for (const p of [A, B]) {
      statics.add(mesh(new THREE.CylinderGeometry(0.06, 0.08, p.y + 0.2, 6), pole, p.x, (p.y + 0.2) / 2, p.z));
      statics.add(mesh(new THREE.SphereGeometry(0.12,20,14), flat(0xff8fb1), p.x, p.y + 0.25, p.z));
    }
    const pts: THREE.Vector3[] = [];
    for (let k = 0; k <= 16; k++) pts.push(A.clone().lerp(B, k / 16).add(new THREE.Vector3(0, -Math.sin((k / 16) * Math.PI) * 0.6, 0)));
    wires.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), new THREE.LineBasicMaterial({ color: 0x5b4766 })));
    const n = Math.max(4, Math.round(A.distanceTo(B) / 0.75));
    for (let i = 0; i < n; i++) pics.push({ a: A, b: B, k: (i + 0.5) / n, phase: si * 3 + i * 0.9 });
  });
  shadowed(statics);
  const inst = new THREE.InstancedMesh(new THREE.PlaneGeometry(0.34, 0.4).translate(0, -0.22, 0), new THREE.MeshLambertMaterial({ map: tex, side: THREE.DoubleSide }), pics.length);
  const tints = [0xffd1df, 0xd9ccff, 0xc8f0dc, 0xffe7b0, 0xcfe6ff, 0xffffff].map((c) => new THREE.Color(c));
  pics.forEach((_, i) => inst.setColorAt(i, tints[i % tints.length]));
  group.add(wires, inst);
  const m4 = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  const e = new THREE.Euler();
  const p = new THREE.Vector3();
  const one = new THREE.Vector3(1, 1, 1);
  const update = (t: number) => {
    pics.forEach((pc, i) => {
      p.copy(pc.a).lerp(pc.b, pc.k);
      p.y -= Math.sin(pc.k * Math.PI) * 0.6;
      const yaw = Math.atan2(pc.b.x - pc.a.x, pc.b.z - pc.a.z) + Math.PI / 2;
      e.set(Math.sin(t * 2.2 + pc.phase) * 0.35, yaw + Math.sin(t * 1.3 + pc.phase) * 0.2, 0);
      q.setFromEuler(e);
      m4.compose(p, q, one);
      inst.setMatrixAt(i, m4);
    });
    inst.instanceMatrix.needsUpdate = true;
  };
  update(0);
  return { group, update, statics };
}

/** An open studio set: a curved pink paper sweep, three strobes firing in turn at a model on a stool,
 * an assistant holding a gold reflector. Faces the camera. */
export function studioSet(x: number, z: number): { statics: THREE.Group; lights: Flashable[]; box: [number, number, number, number] } {
  const statics = new THREE.Group();
  const W = 7;
  const paper = new THREE.MeshLambertMaterial({ color: 0xffc2d6, side: THREE.DoubleSide });
  statics.add(mesh(new THREE.PlaneGeometry(W, 3.2), paper, 0, 2.0, -1.6));
  // The sweep: a quarter cylinder from wall to floor.
  const sweep = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.8, W, 12, 1, true, Math.PI, Math.PI / 2), paper);
  sweep.rotation.z = Math.PI / 2;
  sweep.position.set(0, 0.8, -0.8);
  statics.add(sweep);
  const floor = mesh(new THREE.PlaneGeometry(W, 2.0), paper, 0, 0.065, 0.2);
  floor.rotation.x = -Math.PI / 2;
  statics.add(floor);
  // Roll and stands holding the paper up.
  const roll = mesh(new THREE.CylinderGeometry(0.18, 0.18, W + 0.6, 12), flat(0xff9fc0), 0, 3.7, -1.6);
  roll.rotation.z = Math.PI / 2;
  statics.add(roll);
  for (const sx of [-W / 2 - 0.25, W / 2 + 0.25]) statics.add(mesh(new THREE.CylinderGeometry(0.05, 0.06, 3.8, 6), flat(0x2a2730), sx, 1.9, -1.6));
  const signTex = canvasTexture(512, 128, (g) => {
    g.fillStyle = "#2a2730";
    g.beginPath();
    g.roundRect(0, 0, 512, 128, 24);
    g.fill();
    g.fillStyle = "#ffcb05";
    g.font = "bold 54px 'Bagel Fat One', sans-serif";
    g.textAlign = "center";
    g.textBaseline = "middle";
    g.fillText("STUDIO FLASH", 256, 52);
    g.fillStyle = "#fffdf6";
    g.font = "bold 26px 'Gaegu', sans-serif";
    g.fillText("sesi gambar sedang berjalan · senyap ya", 256, 104);
  });
  const sign = panel(signTex, 3.4, 0.85, 0.08, flat(0x2a2730));
  sign.position.set(0, 4.3, -1.6);
  statics.add(sign);
  // Stool for the model, apple boxes.
  statics.add(mesh(new THREE.CylinderGeometry(0.28, 0.28, 0.06, 12), flat(0xfffdf8), 0, 0.72, 0));
  statics.add(mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.7, 6), flat(0x2a2730), 0, 0.36, 0));
  statics.add(mesh(roundedBox(0.6, 0.3, 0.4), flat(0xc89a6a), -1.7, 0.15, 0.6));
  shadowed(statics);
  statics.position.set(x, 0, z);
  const lights = [
    studioLight("softbox", x - 2.6, z + 1.7, 0.55, 2.4, 1, false),
    studioLight("umbrella", x + 2.6, z + 1.7, -0.55, 2.5, 2, false),
    studioLight("strobe", x - 0.2, z - 1.0, 0, 3.0, 3, false),
  ];
  return { statics, lights, box: [x - W / 2 - 0.4, z - 1.9, x + W / 2 + 0.4, z + 1.2] };
}

/** "CETAK GAMBAR" kiosk: a counter with three printers spitting out prints, a staffer, a queue sign. */
export function printKiosk(x: number, z: number, wind: StripWind): Anim & { statics: THREE.Group; box: [number, number, number, number] } {
  const statics = new THREE.Group();
  const group = new THREE.Group();
  statics.add(mesh(roundedBox(3.0, 1.0, 1.0), flat(0xa8e3c8), 0, 0.5, 0));
  statics.add(mesh(roundedBox(3.1, 0.08, 1.1), flat(0xfffdf8), 0, 1.04, 0));
  // Canopy on posts at the back.
  for (const px of [-1.45, 1.45]) statics.add(mesh(new THREE.CylinderGeometry(0.05, 0.05, 2.7, 6), flat(0xfffdf8), px, 1.35, -0.45));
  const awn = canvasTexture(256, 64, (k) => {
    for (let i = 0; i < 8; i++) {
      k.fillStyle = i % 2 ? "#fffdf8" : "#3fae8a";
      k.fillRect(i * 32, 0, 32, 64);
    }
  });
  const canopy = mesh(roundedBox(3.3, 0.08, 1.5), new THREE.MeshLambertMaterial({ map: awn }), 0, 2.7, 0.1);
  canopy.rotation.x = 0.18;
  statics.add(canopy);
  const signTex = canvasTexture(512, 112, (g) => {
    g.fillStyle = "#fffdf8";
    g.fillRect(0, 0, 512, 112);
    g.fillStyle = "#3fae8a";
    g.font = "bold 56px 'Bagel Fat One', sans-serif";
    g.textAlign = "center";
    g.textBaseline = "middle";
    g.fillText("CETAK GAMBAR", 256, 46);
    g.fillStyle = "#5b4766";
    g.font = "bold 24px 'Gaegu', sans-serif";
    g.fillText("dari phone · siap 1 minit · RM2", 256, 94);
  });
  const sign = panel(signTex, 2.8, 0.62, 0.06, flat(0xfffdf8));
  sign.position.set(0, 3.05, -0.45);
  statics.add(sign);
  const prints: THREE.Mesh[] = [];
  for (let i = 0; i < 3; i++) {
    const px = -0.9 + i * 0.9;
    statics.add(mesh(roundedBox(0.6, 0.32, 0.45), flat(0xf2f0ea), px, 1.24, 0));
    statics.add(mesh(roundedBox(0.4, 0.03, 0.06), flat(0x2a2730), px, 1.4, 0.23));
    const p = mesh(new THREE.PlaneGeometry(0.3, 0.42), new THREE.MeshLambertMaterial({ map: stripTex(i + 1), side: THREE.DoubleSide }), px, 1.42, 0.3);
    p.rotation.x = -1.2;
    prints.push(p);
    group.add(p);
  }
  shadowed(statics);
  for (const o of [statics, group]) o.position.set(x, 0, z);
  const emitted = [-1, -1, -1];
  const update = (t: number) => {
    prints.forEach((p, i) => {
      const period = 4 + i * 0.7;
      const k = (t + i * 1.3) % period;
      const cycle = Math.floor((t + i * 1.3) / period);
      p.visible = k < 2.2;
      p.position.z = 0.3 + Math.min(1, k / 1.6) * 0.32;
      if (k > 2.2 && emitted[i] !== cycle && cycle % 3 === 0) {
        emitted[i] = cycle;
        wind.emit(x - 0.9 + i * 0.9, 1.6, z + 0.6, 0.9, 1.8, 0.4);
      }
    });
  };
  return { group, update, statics, box: [x - 1.6, z - 0.7, x + 1.6, z + 0.6] };
}

/** Bench with a cushion (pastel). */
export function pastelBench(x: number, z: number, rotY = 0, color = 0xffb3cb) {
  const g = new THREE.Group();
  const leg = flat(0xfffdf8);
  g.add(mesh(roundedBox(1.8, 0.12, 0.55), flat(color), 0, 0.48, 0));
  g.add(mesh(roundedBox(1.8, 0.5, 0.1), flat(color), 0, 0.8, -0.24));
  for (const lx of [-0.75, 0.75]) g.add(mesh(roundedBox(0.1, 0.45, 0.5), leg, lx, 0.22, 0));
  g.position.set(x, 0, z);
  g.rotation.y = rotY;
  return shadowed(g);
}

/** A tall street lamp whose head is a camera flash (hot-shoe speedlight on a pole); it pops now and
 * then like everything else in town. */
export function flashLamp(x: number, z: number, seed = 0): Anim & { statics: THREE.Group } {
  const statics = new THREE.Group();
  const group = new THREE.Group();
  const pole = flat(0xfffdf8);
  statics.add(mesh(new THREE.CylinderGeometry(0.08, 0.12, 3.6, 8), pole, 0, 1.8, 0));
  statics.add(mesh(new THREE.CylinderGeometry(0.24, 0.3, 0.25, 10), flat(0xff8fb1), 0, 0.12, 0));
  statics.add(mesh(roundedBox(0.42, 0.42, 0.42), flat(0x2a2730), 0, 3.75, 0));
  statics.add(mesh(roundedBox(0.5, 0.36, 0.3), flat(0x2a2730), 0, 4.1, 0.12));
  const face = new THREE.MeshBasicMaterial({ color: 0xe8e4ee });
  group.add(mesh(new THREE.PlaneGeometry(0.42, 0.28), face, 0, 4.1, 0.275));
  shadowed(statics);
  const fl = flare(0xffffff, 2.2);
  fl.position.set(0, 4.1, 0.45);
  group.add(fl);
  for (const o of [statics, group]) o.position.set(x, 0, z);
  const r = rng(seed + 41);
  let next = 1 + r() * 9;
  let at = -9;
  const update = (t: number) => {
    if (t > next) {
      at = t;
      next = t + 6 + r() * 10;
    }
    const k = Math.max(0, 1 - (t - at) / 0.25);
    face.color.setRGB(0.9 + k * 0.1, 0.89 + k * 0.11, 0.93 + k * 0.07);
    fl.material.opacity = k;
  };
  return { group, update, statics };
}

/** Blob shadow for small things. */
export function blob(x: number, z: number, r = 0.4) {
  const m = new THREE.Mesh(new THREE.CircleGeometry(r, 14), BLOB());
  m.rotation.x = -Math.PI / 2;
  m.position.set(x, 0.09, z);
  return m;
}

// ---------------------------------------------------------------- Mission strips

/** One of the six strips that blew off Bolat ex's gallery: it sits glowing on the ground, and when Qish
 * gets close it takes off on the wind and flutters to the next spot, until it gets stuck somewhere she
 * can pick it up. The flying picture is the real strip. */
export function fleeingStrip(stripIndex: number, hops: [number, number][], player: () => THREE.Vector3, onFly: (to: number) => void): Anim & { stage: () => number; pos: THREE.Vector3; landed: () => boolean } {
  const group = new THREE.Group();
  const tex = realStripTex(stripIndex);
  const m = new THREE.Mesh(new THREE.PlaneGeometry(0.42, 1.26), new THREE.MeshBasicMaterial({ map: tex, side: THREE.DoubleSide, color: 0xf6efe6 }));
  m.castShadow = true;
  const halo = flare(0xffe27a, 2.0, 0.7);
  const sh = new THREE.Mesh(new THREE.CircleGeometry(0.35, 14), BLOB());
  sh.rotation.x = -Math.PI / 2;
  group.add(m, halo, sh);
  let stage = 0;
  let fly: { from: THREE.Vector3; to: THREE.Vector3; t0: number; dur: number } | null = null;
  const pos = new THREE.Vector3(hops[0][0], 0, hops[0][1]);
  const last = hops.length - 1;
  const FLEE_R = 3.6;
  const update = (t: number) => {
    const p = player();
    if (!fly && stage < last && Math.hypot(p.x - pos.x, p.z - pos.z) < FLEE_R) {
      const to = new THREE.Vector3(hops[stage + 1][0], 0, hops[stage + 1][1]);
      fly = { from: pos.clone(), to, t0: t, dur: Math.min(2.6, Math.max(1.3, pos.distanceTo(to) / 6.5)) };
      stage++;
      onFly(stage);
    }
    let y = 0.75 + Math.sin(t * 2.4 + stripIndex) * 0.12;
    if (fly) {
      const k = Math.min(1, (t - fly.t0) / fly.dur);
      const e = k * k * (3 - 2 * k);
      pos.lerpVectors(fly.from, fly.to, e);
      // Sideways wobble as it rides the wind.
      const dx = fly.to.x - fly.from.x;
      const dz = fly.to.z - fly.from.z;
      const l = Math.hypot(dx, dz) || 1;
      const wob = Math.sin(k * Math.PI * 3) * 0.9 * Math.sin(k * Math.PI);
      pos.x += (-dz / l) * wob;
      pos.z += (dx / l) * wob;
      y = 0.75 + Math.sin(k * Math.PI) * 3.2;
      m.rotation.set(Math.sin(t * 7) * 1.1, t * 5, Math.sin(t * 5.3) * 0.9);
      if (k >= 1) {
        fly = null;
        pos.copy(new THREE.Vector3(hops[stage][0], 0, hops[stage][1]));
      }
    } else {
      // Resting: flapping in the breeze, and stuck at an angle on its last spot.
      m.rotation.set(stage === last ? 0.25 : Math.sin(t * 3 + stripIndex) * 0.35, Math.sin(t * 0.9 + stripIndex) * 0.6, stage === last ? 0.5 : Math.sin(t * 2.2) * 0.2);
    }
    m.position.set(pos.x, y, pos.z);
    halo.position.set(pos.x, y, pos.z);
    halo.material.opacity = fly ? 0.35 : 0.55 + Math.sin(t * 3) * 0.15;
    sh.position.set(pos.x, 0.09, pos.z);
    sh.scale.setScalar(1 - Math.min(0.6, (y - 0.75) * 0.2));
  };
  return { group, update, stage: () => stage, pos, landed: () => !fly && stage === last };
}

// ---------------------------------------------------------------- People

const look = (o: Partial<PersonLook>): PersonLook => ({ skin: "#e8b48f", top: "#ff8fb1", bottom: "#3d4a7a", bag: "#ffcb05", carry: "none", ...o });

/** Visitors in pastel, many with a phone, a digicam or a fresh strip in hand. */
export const PB_LOOKS: PersonLook[] = [
  look({ top: "#ffd1df", bottom: "#f2f0ea", hijab: "#cdb9f2", carry: "strip" }),
  look({ skin: "#c98c64", top: "#a8e3c8", bottom: "#2a2730", hair: "#26222a", carry: "camera" }),
  look({ skin: "#f0c8a8", top: "#fff4e8", bottom: "#6b5a8a", hair: "#7a4a2a", carry: "phone" }),
  look({ skin: "#e3ad86", top: "#b7dcff", bottom: "#f2f0ea", hijab: "#ff8fb1", carry: "strip" }),
  look({ skin: "#b97a52", top: "#ffe7a0", bottom: "#3d4a7a", hair: "#1c1a20", cap: "#ff8fb1", carry: "camera" }),
  look({ skin: "#ecc0a0", top: "#cdb9f2", bottom: "#fff4e8", hijab: "#fff4e8", carry: "phone" }),
  look({ skin: "#d39a72", top: "#ffc4a8", bottom: "#2a2730", hair: "#26222a", carry: "drink" }),
  look({ skin: "#f2cfb2", top: "#fffdf8", bottom: "#ff8fb1", hijab: "#2a2730", carry: "strip" }),
  look({ skin: "#d9a27a", top: "#ffcb05", bottom: "#b7dcff", hair: "#26222a", carry: "cone", kid: true }),
  look({ skin: "#e0a882", top: "#ff8fb1", bottom: "#fff4e8", hijab: "#a8e3c8", carry: "camera" }),
  look({ skin: "#c98c64", top: "#5b4766", bottom: "#f2f0ea", hair: "#26222a", carry: "phone" }),
  look({ skin: "#f6dcc6", top: "#a8e3c8", bottom: "#cdb9f2", hair: "#c9a050", carry: "strip", kid: true }),
];

// ---------------------------------------------------------------- Lawn pieces

/** A heart-shaped flower bed: a low white kerb and pink and white blooms filling the heart. */
export function heartGarden(x: number, z: number, s = 1, seed = 0) {
  const g = new THREE.Group();
  const r = rng(seed + 19);
  const inHeart = (u: number, v: number) => {
    // Classic implicit heart, point up towards -z (the top of the screen is the heart's top).
    const X = u * 1.25;
    const Y = -v * 1.25 + 0.25;
    return Math.pow(X * X + Y * Y - 1, 3) - X * X * Y * Y * Y < 0;
  };
  const kerb = flat(0xfffdf8);
  for (let i = 0; i < 64; i++) {
    const t = (i / 64) * Math.PI * 2;
    const hx = 16 * Math.pow(Math.sin(t), 3);
    const hz = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
    g.add(mesh(roundedBox(0.28, 0.22, 0.28), kerb, (hx / 16) * 2.1 * s, 0.11, (hz / 16) * 2.1 * s));
  }
  const soil = flat(0x8fcf9f);
  const petals = [0xff6fa0, 0xff9fc0, 0xffffff, 0xffc6d8].map((c) => flat(c));
  const geo = new THREE.SphereGeometry(0.15, 24, 16);
  for (let i = 0; i < 200; i++) {
    const u = (r() - 0.5) * 2.2;
    const v = (r() - 0.5) * 2.2;
    if (!inHeart(u, v)) continue;
    g.add(mesh(geo, i % 6 === 0 ? soil : petals[i % petals.length], u * 1.75 * s, 0.22 + r() * 0.08, v * 1.75 * s));
  }
  g.position.set(x, 0, z);
  return shadowed(g);
}

/** A giant film reel lying on the lawn, a tail of film unrolling off it across the grass. */
export function filmReel(x: number, z: number, rotY = 0) {
  const g = new THREE.Group();
  const silver = flat(0xd8d8e0);
  const film = flat(0x5b4766);
  g.add(mesh(new THREE.CylinderGeometry(1.7, 1.7, 0.08, 32), silver, 0, 0.06, 0));
  g.add(mesh(new THREE.CylinderGeometry(1.25, 1.25, 0.42, 32), film, 0, 0.3, 0));
  g.add(mesh(new THREE.CylinderGeometry(1.7, 1.7, 0.08, 32), silver, 0, 0.55, 0));
  g.add(mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.62, 12), silver, 0, 0.3, 0));
  // Spoke holes on the top flange.
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2;
    const hole = mesh(new THREE.CylinderGeometry(0.32, 0.32, 0.02, 12), flat(0x8fcf9f), Math.cos(a) * 0.95, 0.6, Math.sin(a) * 0.95);
    g.add(hole);
  }
  // The tail: a ribbon of film snaking off on the ground.
  const tex = shared(
    canvasTexture(128, 64, (c) => {
      c.fillStyle = "#5b4766";
      c.fillRect(0, 0, 128, 64);
      c.fillStyle = "#fbe6ee";
      c.fillRect(4, 14, 120, 36);
      c.fillStyle = "#fff3ea";
      for (let i = 0; i < 4; i++) for (const y of [3, 53]) c.fillRect(i * 32 + 10, y, 12, 8);
    }),
  );
  tex.wrapS = THREE.RepeatWrapping;
  const pts: number[] = [];
  const uv: number[] = [];
  const idx: number[] = [];
  const N = 30;
  for (let i = 0; i <= N; i++) {
    const t = i / N;
    const px = 1.25 + t * 7;
    const pz = Math.sin(t * Math.PI * 2.2) * 1.1;
    const dz = Math.cos(t * Math.PI * 2.2) * 1.1 * Math.PI * 2.2 / 7;
    const l = Math.hypot(1, dz);
    const nx = -dz / l;
    const nz = 1 / l;
    pts.push(px + nx * 0.4, 0.08, pz + nz * 0.4, px - nx * 0.4, 0.08, pz - nz * 0.4);
    uv.push(t * 9, 1, t * 9, 0);
    if (i) idx.push(i * 2 - 2, i * 2 - 1, i * 2, i * 2 - 1, i * 2 + 1, i * 2);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(pts, 3));
  geo.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
  geo.setIndex(idx);
  geo.computeVertexNormals();
  g.add(new THREE.Mesh(geo, new THREE.MeshLambertMaterial({ map: tex, side: THREE.DoubleSide })));
  g.position.set(x, 0, z);
  g.rotation.y = rotY;
  return shadowed(g);
}
