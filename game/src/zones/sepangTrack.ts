import { roundedBox } from "../overworld/props";
import * as THREE from "three";
import { type PersonLook, passengerDoodle } from "../content/doodles";
import { mergeStatic } from "../overworld/merge";
import { paperStandee } from "../overworld/paper";
import { canvasTexture, flat } from "../overworld/props";
import { rng } from "./boothProps";
import { shadowed } from "./common";
import type { Anim } from "./labuProps";

// Litar Sepang, the circuit itself: the track (a simplified Sepang: the main straight past the pits,
// the hairpin on the west joining it to the back straight, and a twisty complex on the east), the pit
// lane, and an F1 race running on it all the time. Cars brake for corners, queue up and overtake,
// one at a time they peel off into the pit lane for a tyre stop with their crew, and now and then the
// safety car comes out and the whole field bunches up behind it. The track is wet (rain is coming):
// spray hangs behind every car and their rain lights blink.

/** Half the track's width. */
export const TW = 3.6;

/** Centre line of the circuit, from the start line on the main straight, heading east. */
const TRACK_CTRL: [number, number][] = [
  [0, -9.5], [14, -9.5], [27, -9.5], [33.6, -10.5], [38.2, -14.2], [39.4, -19], [36.4, -22.6], [37.4, -27.2], [34, -31.1], [27.5, -32],
  [14, -32], [0, -32], [-14, -32], [-29.5, -32], [-36, -30.8], [-40.2, -26.8], [-41.3, -20.75], [-40.2, -14.7], [-36, -10.7], [-29.5, -9.5], [-14, -9.5],
];

/** Pit lane: off the track after the hairpin, along the garages at z -4.2, back on before turn 1. */
const PIT_CTRL: [number, number][] = [
  [-33.4, -9.9], [-30.6, -8.4], [-27.6, -5.7], [-24.2, -4.3], [-21, -4.2], [0, -4.2], [21, -4.2], [24.2, -4.4], [27.6, -6.2], [30.4, -8.7], [32.8, -10.1],
];

export interface Path {
  pts: [number, number][];
  cum: number[];
  len: number;
  closed: boolean;
  nearest(x: number, z: number): { d: number; s: number; x: number; z: number };
  at(s: number): { x: number; z: number; tx: number; tz: number };
}

function makePath(ctrl: [number, number][], closed: boolean, n: number): Path {
  const curve = new THREE.CatmullRomCurve3(ctrl.map(([x, z]) => new THREE.Vector3(x, 0, z)), closed, "centripetal");
  const pts = curve.getSpacedPoints(n).map((p) => [p.x, p.z] as [number, number]);
  const cum = [0];
  for (let i = 1; i < pts.length; i++) cum.push(cum[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
  const len = cum[cum.length - 1];
  return {
    pts,
    cum,
    len,
    closed,
    nearest(x, z) {
      let best = { d: Infinity, s: 0, x: 0, z: 0 };
      for (let i = 1; i < pts.length; i++) {
        const [ax, az] = pts[i - 1];
        const qx = x - ax;
        const qz = z - az;
        if (Math.abs(qx) > best.d + 1 || Math.abs(qz) > best.d + 1) continue;
        const dx = pts[i][0] - ax;
        const dz = pts[i][1] - az;
        const k = Math.max(0, Math.min(1, (qx * dx + qz * dz) / (dx * dx + dz * dz || 1)));
        const px = ax + dx * k;
        const pz = az + dz * k;
        const d = Math.hypot(x - px, z - pz);
        if (d < best.d) best = { d, s: cum[i - 1] + (cum[i] - cum[i - 1]) * k, x: px, z: pz };
      }
      return best;
    },
    at(s) {
      const c = closed ? ((s % len) + len) % len : Math.max(0, Math.min(len, s));
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
    },
  };
}

export const TRACK = makePath(TRACK_CTRL, true, 1000);
export const PIT = makePath(PIT_CTRL, false, 300);
const PIT_ENTRY_S = TRACK.nearest(...PIT_CTRL[0]).s;
const PIT_EXIT_S = TRACK.nearest(...PIT_CTRL[PIT_CTRL.length - 1]).s;
/** The fast lane in front of the garages. */
export const PIT_Z = -4.2;

/** A point on the track at arc length s, `lane` to the left of travel. */
export function trackPoint(s: number, lane = 0): [number, number] {
  const p = TRACK.at(s);
  return [p.x + p.tz * lane, p.z - p.tx * lane];
}

/** Inside the circuit's loop (the infield). */
export function insideLoop(x: number, z: number) {
  const pts = TRACK.pts;
  let inside = false;
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    const [xi, zi] = pts[i];
    const [xj, zj] = pts[j];
    if (zi > z !== zj > z && x < ((xj - xi) * (z - zi)) / (zj - zi) + xi) inside = !inside;
  }
  return inside;
}

/** How sharply the track turns at each sample (1 / radius), smoothed. */
const CURVE = (() => {
  const { pts, cum } = TRACK;
  const n = pts.length - 1;
  const head = Array.from({ length: n }, (_, i) => Math.atan2(pts[i + 1][1] - pts[i][1], pts[i + 1][0] - pts[i][0]));
  const raw = head.map((h, i) => {
    let d = head[(i + 1) % n] - h;
    d = Math.atan2(Math.sin(d), Math.cos(d));
    return Math.abs(d) / ((cum[i + 1] - cum[i]) || 1);
  });
  return raw.map((_, i) => {
    let s = 0;
    for (let k = -6; k <= 6; k++) s += raw[(i + k + n) % n];
    return s / 13;
  });
})();

/** Top speed at each sample: flat out on the straights, braking into the corners, accelerating out. */
const SPEED = (() => {
  const n = CURVE.length;
  const ds = TRACK.len / n;
  const v = CURVE.map((k) => Math.min(30, Math.sqrt(32 / Math.max(k, 1e-4))));
  for (let pass = 0; pass < 2; pass++) {
    for (let i = n - 1; i >= 0; i--) v[i] = Math.min(v[i], Math.sqrt(v[(i + 1) % n] ** 2 + 2 * 34 * ds));
    for (let i = 0; i < n; i++) v[i] = Math.min(v[i], Math.sqrt(v[(i - 1 + n) % n] ** 2 + 2 * 15 * ds));
  }
  return v;
})();
const speedAt = (s: number) => SPEED[Math.floor((((s % TRACK.len) + TRACK.len) % TRACK.len) / (TRACK.len / SPEED.length)) % SPEED.length];

// ---------------------------------------------------------------- Teams

export interface Team {
  name: string;
  short: string;
  body: number;
  accent: number;
  helmet: number;
  css: string;
}

const hex = (c: number) => `#${c.toString(16).padStart(6, "0")}`;
const team = (name: string, short: string, body: number, accent: number, helmet: number): Team => ({ name, short, body, accent, helmet, css: hex(body) });

/** The grid, every team an inside joke. MALAS RACING is Raja Nonchalant's own, and their car hasn't left the
 * garage all day. */
export const TEAMS: Team[] = [
  team("BOLAT GP", "BOL", 0xff6fa0, 0xfffdf6, 0xffcb05),
  team("OMEY RACING", "OMY", 0x9b6ad6, 0xffe7a0, 0xfffdf6),
  team("MALAS RACING", "MLS", 0x8a8f99, 0x5b4766, 0xc9ccd2),
  team("KEK MANGO F1", "MGO", 0xffbe1a, 0x2f8a3a, 0xff6f1a),
  team("ALAMAK RACING", "ALM", 0x2f62d8, 0xffcb05, 0xe3350d),
  team("KENTOT BUSHUK", "KBK", 0x4caf50, 0x2a2730, 0xb6ff6a),
  team("SAMBAL GEPUK", "SGP", 0xe3350d, 0x17151f, 0xfffdf6),
  team("ANTI EMOK", "AEM", 0x22b8c8, 0xfffdf6, 0xff6fa0),
];
export const MALAS = 2;

/** Garage bays along the pit building, west to east: a team, or the walk-through to the pit lane. */
export const BAY_X = [-18.67, -14, -9.33, -4.67, 0, 4.67, 9.33, 14, 18.67];
export const BAYS: (number | "pass")[] = [0, 1, "pass", MALAS, 3, 4, 5, 6, 7];
const bayOf = (t: number) => BAY_X[BAYS.indexOf(t)];

/** Which teams run which cars (two each for Bolat GP and Omey). */
const GRID = [0, 4, 6, 1, 3, 7, 5, 0, 1];

// ---------------------------------------------------------------- Cars

const DARK = 0x1f2128;

function box(w: number, h: number, d: number, mat: THREE.Material, x: number, y: number, z: number) {
  const m = new THREE.Mesh(roundedBox(w, h, d), mat);
  m.position.set(x, y, z);
  return m;
}

/** A chunky low-poly F1 car pointing along +z, in a team's colours. Statics are merged; the rain light
 * at the back is kept separate so it can blink. */
export function f1Car(t: Team): { group: THREE.Group; light: THREE.Mesh } {
  const src = new THREE.Group();
  const body = flat(t.body);
  const accent = flat(t.accent);
  const dark = flat(DARK);
  src.add(box(1.3, 0.08, 3.1, dark, 0, 0.13, -0.05));
  // Monocoque, nose and cockpit.
  src.add(box(0.56, 0.36, 1.9, body, 0, 0.4, 0.1));
  const nose = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.27, 1.15, 24), body);
  nose.rotation.x = Math.PI / 2;
  nose.rotation.y = Math.PI / 4;
  nose.scale.set(1.3, 1, 0.7);
  nose.position.set(0, 0.3, 1.55);
  src.add(nose);
  src.add(box(0.2, 0.1, 0.2, accent, 0, 0.27, 2.1));
  src.add(box(0.36, 0.08, 0.5, dark, 0, 0.6, 0.35));
  // Sidepods, engine cover and fin.
  src.add(box(1.16, 0.32, 1.05, body, 0, 0.36, -0.25));
  src.add(box(1.18, 0.06, 0.9, accent, 0, 0.54, -0.25));
  src.add(box(0.5, 0.42, 1.25, body, 0, 0.58, -0.75));
  src.add(box(0.05, 0.3, 0.9, accent, 0, 0.9, -0.9));
  // Halo over the cockpit.
  src.add(box(0.06, 0.06, 0.55, dark, 0, 0.84, 0.42));
  src.add(box(0.5, 0.05, 0.06, dark, 0, 0.82, 0.15));
  // Front and rear wings.
  src.add(box(1.56, 0.05, 0.34, accent, 0, 0.13, 1.9));
  for (const sx of [-0.78, 0.78]) src.add(box(0.05, 0.22, 0.42, body, sx, 0.2, 1.9));
  src.add(box(1.32, 0.07, 0.32, accent, 0, 0.92, -1.48));
  src.add(box(1.32, 0.05, 0.2, body, 0, 0.78, -1.5));
  for (const sx of [-0.66, 0.66]) src.add(box(0.05, 0.56, 0.46, body, sx, 0.66, -1.48));
  // Wheels: fat rears.
  for (const [wx, wz, r, w] of [[-0.72, 1.05, 0.29, 0.32], [0.72, 1.05, 0.29, 0.32], [-0.75, -1.0, 0.33, 0.4], [0.75, -1.0, 0.33, 0.4]] as const) {
    const wh = new THREE.Mesh(new THREE.CylinderGeometry(r, r, w, 24), dark);
    wh.rotation.z = Math.PI / 2;
    wh.position.set(wx, r, wz);
    src.add(wh);
  }
  const helmet = new THREE.Mesh(new THREE.SphereGeometry(0.16,20,14), flat(t.helmet));
  helmet.position.set(0, 0.72, 0.3);
  src.add(helmet);
  shadowed(src);
  const group = new THREE.Group();
  group.add(mergeStatic(src));
  const light = new THREE.Mesh(roundedBox(0.16, 0.12, 0.05), new THREE.MeshBasicMaterial({ color: 0xff2a2a }));
  light.position.set(0, 0.5, -1.62);
  group.add(light);
  return { group, light };
}

/** The safety car: a silver sports car with a green stripe and an orange light bar. */
function safetyCar(): { group: THREE.Group; bar: THREE.Mesh[] } {
  const src = new THREE.Group();
  const silver = flat(0xc9ced6);
  const green = flat(0x1f8a5a);
  const dark = flat(DARK);
  src.add(box(1.7, 0.42, 3.7, silver, 0, 0.42, 0));
  src.add(box(1.5, 0.4, 1.7, silver, 0, 0.82, -0.35));
  src.add(box(1.54, 0.3, 1.5, flat(0x2f4258), 0, 0.86, -0.3));
  src.add(box(1.72, 0.06, 3.72, green, 0, 0.5, 0));
  src.add(box(0.3, 0.02, 3.7, green, 0, 0.64, 0));
  for (const [wx, wz] of [[-0.82, 1.15], [0.82, 1.15], [-0.82, -1.15], [0.82, -1.15]] as const) {
    const wh = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.32, 0.26, 24), dark);
    wh.rotation.z = Math.PI / 2;
    wh.position.set(wx, 0.32, wz);
    src.add(wh);
  }
  src.add(box(1.0, 0.1, 0.3, dark, 0, 1.06, -0.4));
  shadowed(src);
  const group = new THREE.Group();
  group.add(mergeStatic(src));
  const bar = [-0.3, 0.3].map((x) => {
    const m = new THREE.Mesh(roundedBox(0.34, 0.12, 0.22), new THREE.MeshBasicMaterial({ color: 0xff9a1a }));
    m.position.set(x, 1.16, -0.4);
    group.add(m);
    return m;
  });
  return { group, bar };
}

// ---------------------------------------------------------------- Track surfaces

/** A ribbon along a path between two side offsets (positive = left of travel), with v running along it. */
function ribbon(path: Path, s0: number, s1: number, off0: number, off1: number, y: number, vScale: number, step = 0.6) {
  const n = Math.max(2, Math.ceil(Math.abs(s1 - s0) / step));
  const pos: number[] = [];
  const uv: number[] = [];
  const idx: number[] = [];
  for (let i = 0; i <= n; i++) {
    const s = s0 + ((s1 - s0) * i) / n;
    const p = path.at(s);
    for (const [k, off] of [[0, off0], [1, off1]] as const) {
      pos.push(p.x + p.tz * off, y, p.z - p.tx * off);
      uv.push(k, (s - s0) / vScale);
    }
    if (i) {
      const a = (i - 1) * 2;
      idx.push(a, a + 2, a + 1, a + 1, a + 2, a + 3);
    }
  }
  // Wind the triangles so they face up, whichever side of the centre line the strip is on.
  const [ax, , az] = pos.slice(idx[0] * 3, idx[0] * 3 + 3);
  const [bx, , bz] = pos.slice(idx[1] * 3, idx[1] * 3 + 3);
  const [cx, , cz] = pos.slice(idx[2] * 3, idx[2] * 3 + 3);
  if ((bz - az) * (cx - ax) - (bx - ax) * (cz - az) < 0) for (let i = 0; i < idx.length; i += 3) [idx[i + 1], idx[i + 2]] = [idx[i + 2], idx[i + 1]];
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
  g.setIndex(idx);
  g.computeVertexNormals();
  const nrm = g.attributes.normal;
  for (let i = 0; i < nrm.count; i++) nrm.setXYZ(i, 0, 1, 0);
  return g;
}

function asphaltTex(lines: boolean, base = "#474a52") {
  const t = canvasTexture(256, 512, (g) => {
    g.fillStyle = base;
    g.fillRect(0, 0, 256, 512);
    const r = rng(7);
    for (let i = 0; i < 2600; i++) {
      g.fillStyle = r() > 0.5 ? "rgba(255,255,255,.05)" : "rgba(0,0,0,.08)";
      g.fillRect(r() * 256, r() * 512, 2, 2);
    }
    // Wet sheen: long pale streaks down the racing line.
    for (let i = 0; i < 26; i++) {
      g.fillStyle = `rgba(190,205,230,${0.04 + r() * 0.06})`;
      g.fillRect(40 + r() * 176, r() * 512, 3 + r() * 10, 60 + r() * 200);
    }
    // Darker rubbered-in line.
    g.fillStyle = "rgba(10,10,14,.18)";
    g.fillRect(96, 0, 64, 512);
    if (lines) {
      g.fillStyle = "#f4f2ea";
      g.fillRect(6, 0, 7, 512);
      g.fillRect(243, 0, 7, 512);
    }
  });
  t.wrapS = THREE.ClampToEdgeWrapping;
  t.wrapT = THREE.RepeatWrapping;
  return t;
}

const kerbTex = () => {
  const t = canvasTexture(32, 128, (g) => {
    g.fillStyle = "#f4f2ea";
    g.fillRect(0, 0, 32, 128);
    g.fillStyle = "#e3350d";
    g.fillRect(0, 0, 32, 64);
    g.fillStyle = "rgba(0,0,0,.15)";
    g.fillRect(0, 0, 4, 128);
  });
  t.wrapT = THREE.RepeatWrapping;
  return t;
};

/** Ranges of arc length where the track bends (for kerbs, gravel and tyre walls), and which side is the
 * outside of each bend (+1 = left of travel). */
const BENDS = (() => {
  const out: { s0: number; s1: number; outer: number }[] = [];
  const n = CURVE.length;
  const ds = TRACK.len / n;
  let start = -1;
  for (let i = 0; i <= n; i++) {
    const bend = i < n && CURVE[i] > 1 / 26;
    if (bend && start < 0) start = i;
    if (!bend && start >= 0) {
      const s0 = start * ds - 3;
      const s1 = i * ds + 3;
      const [mx, mz] = trackPoint((s0 + s1) / 2, TW + 2);
      out.push({ s0, s1, outer: insideLoop(mx, mz) ? -1 : 1 });
      start = -1;
    }
  }
  return out;
})();

/** The circuit: wet asphalt with white edges, red-white kerbs on every bend, gravel traps and tyre walls
 * on the outside of the big ones, the start line and grid boxes on the main straight. */
export function trackSurface() {
  const g = new THREE.Group();
  const mat = new THREE.MeshPhongMaterial({ map: asphaltTex(true), shininess: 70, specular: 0x55596a });
  const road = new THREE.Mesh(ribbon(TRACK, 0, TRACK.len, TW, -TW, 0.03, 9, 0.5), mat);
  road.receiveShadow = true;
  g.add(road);
  const kt = kerbTex();
  const kerb = new THREE.MeshLambertMaterial({ map: kt });
  const gravel = new THREE.MeshLambertMaterial({
    map: canvasTexture(128, 128, (c) => {
      c.fillStyle = "#cdb48a";
      c.fillRect(0, 0, 128, 128);
      const r = rng(3);
      for (let i = 0; i < 700; i++) {
        c.fillStyle = r() > 0.5 ? "#b89b70" : "#e0cba4";
        c.fillRect(r() * 128, r() * 128, 2, 2);
      }
    }),
  });
  (gravel.map as THREE.Texture).wrapS = (gravel.map as THREE.Texture).wrapT = THREE.RepeatWrapping;
  const tyres = new THREE.Group();
  const tyreMat = [flat(0x1c1c22), flat(0x26262d)];
  const tyreTop = [flat(0xf4f2ea), flat(0xe3350d)];
  const tyreGeo = new THREE.CylinderGeometry(0.34, 0.34, 0.26, 10);
  for (const { s0, s1, outer } of BENDS) {
    for (const side of [1, -1]) {
      const a = side * TW;
      const k = new THREE.Mesh(ribbon(TRACK, s0, s1, a, a + side * 0.75, side === outer ? 0.04 : 0.05, 2, 0.4), kerb);
      k.receiveShadow = true;
      g.add(k);
    }
    // Long bends get a gravel trap and a tyre wall on the outside.
    if (s1 - s0 < 18) continue;
    const gt = new THREE.Mesh(ribbon(TRACK, s0 + 2, s1 - 2, outer * (TW + 0.75), outer * (TW + 5.2), 0.025, 3, 0.5), gravel);
    gt.receiveShadow = true;
    g.add(gt);
    for (let s = s0 + 3; s < s1 - 3; s += 0.7) {
      const [x, z] = trackPoint(s, outer * (TW + 5.6));
      const i = Math.round(s / 0.7);
      for (let h = 0; h < 3; h++) {
        const t = new THREE.Mesh(tyreGeo, h === 2 ? tyreTop[i % 2] : tyreMat[h % 2]);
        t.position.set(x, 0.13 + h * 0.26, z);
        tyres.add(t);
      }
    }
  }
  g.add(shadowed(tyres));
  // Start line (chequered, at s = 0) and the grid behind it.
  const chk = canvasTexture(64, 256, (c) => {
    for (let i = 0; i < 2; i++) for (let j = 0; j < 8; j++) {
      c.fillStyle = (i + j) % 2 ? "#17151f" : "#fffdf6";
      c.fillRect(i * 32, j * 32, 32, 32);
    }
  });
  const line = new THREE.Mesh(new THREE.PlaneGeometry(0.9, TW * 2), new THREE.MeshLambertMaterial({ map: chk }));
  line.rotation.x = -Math.PI / 2;
  line.position.set(0, 0.045, -9.5);
  g.add(line);
  const paint = new THREE.MeshBasicMaterial({ color: 0xf4f2ea });
  for (let k = 0; k < 6; k++) {
    const x = -4 - k * 4.2;
    const z = -9.5 + (k % 2 ? 1.5 : -1.5);
    for (const [w, d, ox, oz] of [[0.12, 1.6, 0.9, 0], [1.0, 0.12, 0.4, -0.8], [1.0, 0.12, 0.4, 0.8]] as const) {
      const m = new THREE.Mesh(new THREE.PlaneGeometry(w, d), paint);
      m.rotation.x = -Math.PI / 2;
      m.position.set(x + ox, 0.045, z + oz);
      g.add(m);
    }
  }
  return g;
}

/** The pit lane: the entry and exit roads, the lane along the garages with a working strip by the
 * doors, each team's box painted in its colours, and the pit speed limit. */
export function pitSurface() {
  const g = new THREE.Group();
  const mat = new THREE.MeshPhongMaterial({ map: asphaltTex(false, "#50535b"), shininess: 50, specular: 0x444855 });
  const sEnd = PIT.nearest(-21, PIT_Z).s;
  const sOut = PIT.nearest(21, PIT_Z).s;
  for (const [a, b] of [[0, sEnd + 0.5], [sOut - 0.5, PIT.len]] as const) {
    const m = new THREE.Mesh(ribbon(PIT, a, b, 1.9, -1.9, 0.028, 9), mat);
    m.receiveShadow = true;
    g.add(m);
  }
  const lane = new THREE.Mesh(roundedBox(42, 0.05, 4.2), new THREE.MeshPhongMaterial({ color: 0x5a5d66, shininess: 50, specular: 0x444855 }));
  lane.position.set(0, 0.025, -3.5);
  lane.receiveShadow = true;
  g.add(lane);
  const strip = new THREE.Mesh(roundedBox(42, 0.05, 1.5), flat(0x6e7280));
  strip.position.set(0, 0.03, -2.15);
  strip.receiveShadow = true;
  g.add(strip);
  const white = new THREE.MeshBasicMaterial({ color: 0xf4f2ea });
  const dash = new THREE.Mesh(new THREE.PlaneGeometry(42, 0.1), white);
  dash.rotation.x = -Math.PI / 2;
  dash.position.set(0, 0.06, -2.9);
  g.add(dash);
  BAYS.forEach((t, i) => {
    if (t === "pass") return;
    const c = new THREE.MeshBasicMaterial({ color: TEAMS[t].body });
    for (const [w, d, ox, oz] of [[4.0, 0.12, 0, -1.0], [4.0, 0.12, 0, 1.0], [0.12, 2.0, -2.0, 0], [0.12, 2.0, 2.0, 0]] as const) {
      const m = new THREE.Mesh(new THREE.PlaneGeometry(w, d), c);
      m.rotation.x = -Math.PI / 2;
      m.position.set(BAY_X[i] + ox, 0.06, PIT_Z + oz);
      g.add(m);
    }
  });
  const limit = canvasTexture(128, 128, (c) => {
    c.fillStyle = "#fffdf6";
    c.beginPath();
    c.arc(64, 64, 60, 0, Math.PI * 2);
    c.fill();
    c.lineWidth = 14;
    c.strokeStyle = "#e3350d";
    c.stroke();
    c.fillStyle = "#17151f";
    c.font = "bold 58px 'Bagel Fat One', sans-serif";
    c.textAlign = "center";
    c.textBaseline = "middle";
    c.fillText("80", 64, 68);
  });
  for (const x of [-23.6, 22.6]) {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 2.2), new THREE.MeshLambertMaterial({ map: limit, transparent: true }));
    m.rotation.x = -Math.PI / 2;
    m.position.set(x, 0.07, PIT_Z);
    g.add(m);
  }
  return g;
}

// ---------------------------------------------------------------- The race

interface Car {
  team: number;
  group: THREE.Group;
  light: THREE.Mesh;
  /** Distance round the lap, laps done. */
  s: number;
  lap: number;
  v: number;
  pace: number;
  lane: number;
  laneT: number;
  home: number;
  mode: "track" | "pit";
  ps: number;
  stop: number;
  stopLen: number;
  wantPit: boolean;
  lastPit: number;
  near: number;
  lastZoom: number;
  passedT: number;
}

interface Crew {
  g: THREE.Group;
  pivot: THREE.Group;
  idle: [number, number];
  job: [number, number];
  at: THREE.Vector3;
  phase: number;
}

export interface RaceOpts {
  player: () => THREE.Vector3;
  /** A car went by close to Qish: `k` 0..1, closer is louder. */
  onPass?: (k: number) => void;
  /** A pit stop's wheel guns, at the box's x. */
  onStop?: (x: number) => void;
}

export interface Race extends Anim {
  /** Running order (team index, in the pits). */
  order(): { team: number; pit: boolean }[];
  lap(): number;
  safety(): boolean;
  /** Where everyone is (team, or -1 for the safety car), for the live map on the big screen. */
  dots(): { x: number; z: number; team: number }[];
}

const crewLook = (t: Team, i: number): PersonLook => ({
  skin: ["#f2c9a5", "#c98e5f", "#e8b48a", "#a8704a"][i % 4],
  top: t.css,
  bottom: t.css,
  helmet: i === 6 ? hex(t.accent) : "#f4f4f4",
  bag: "#333",
  carry: "none",
});

/** Bubble over a pit box after a stop: "2.3s". */
function stopLabel() {
  const c = document.createElement("canvas");
  c.width = 256;
  c.height = 96;
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false }));
  s.scale.set(2.4, 0.9, 1);
  s.renderOrder = 6;
  s.visible = false;
  const show = (text: string, color: string) => {
    const g = c.getContext("2d")!;
    g.clearRect(0, 0, 256, 96);
    g.fillStyle = color;
    g.strokeStyle = "#17151f";
    g.lineWidth = 6;
    g.beginPath();
    g.roundRect(8, 8, 240, 80, 26);
    g.fill();
    g.stroke();
    g.fillStyle = "#fffdf6";
    g.font = "bold 50px 'Bagel Fat One', sans-serif";
    g.textAlign = "center";
    g.textBaseline = "middle";
    g.fillText(text, 128, 52);
    tex.needsUpdate = true;
  };
  return { s, show };
}

/** Spray off the wet track behind fast cars: a pool of soft grey puffs. */
function sprayPool(n: number) {
  const tex = canvasTexture(64, 64, (g) => {
    const grad = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    grad.addColorStop(0, "rgba(235,240,248,.9)");
    grad.addColorStop(1, "rgba(235,240,248,0)");
    g.fillStyle = grad;
    g.fillRect(0, 0, 64, 64);
  });
  const group = new THREE.Group();
  const list = Array.from({ length: n }, () => {
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false, opacity: 0 }));
    s.visible = false;
    group.add(s);
    return { s, born: -9, vx: 0, vz: 0 };
  });
  let next = 0;
  return {
    group,
    puff(x: number, z: number, vx: number, vz: number, t: number) {
      const p = list[next++ % n];
      p.s.position.set(x, 0.35, z);
      p.vx = vx;
      p.vz = vz;
      p.born = t;
      p.s.visible = true;
    },
    update(t: number, dt: number) {
      for (const p of list) {
        if (!p.s.visible) continue;
        const k = (t - p.born) / 0.75;
        if (k >= 1) {
          p.s.visible = false;
          continue;
        }
        p.s.position.x += p.vx * dt;
        p.s.position.z += p.vz * dt;
        p.s.position.y += dt * 0.9;
        p.s.scale.setScalar(0.7 + k * 2.2);
        p.s.material.opacity = 0.42 * (1 - k);
      }
    },
  };
}

/** The race: nine cars on track, pit stops one at a time with the crews, and the safety car every so
 * often. Returns the running order for the timing screens. */
export async function race(o: RaceOpts): Promise<Race> {
  const group = new THREE.Group();
  const r = rng(26);
  const cars: Car[] = GRID.map((ti, i) => {
    const { group: g, light } = f1Car(TEAMS[ti]);
    group.add(g);
    const home = [-1.3, 1.1, -0.4, 1.6, -1.7, 0.5, -0.9, 1.4, 0.1][i];
    return {
      team: ti,
      group: g,
      light,
      s: TRACK.len - i * (TRACK.len / GRID.length) * 0.92,
      lap: 12,
      v: 18,
      pace: 0.88 + r() * 0.12,
      lane: home,
      laneT: home,
      home,
      mode: "track",
      ps: 0,
      stop: 0,
      stopLen: 2.4,
      wantPit: false,
      lastPit: -20 - i * 9,
      near: 99,
      lastZoom: -9,
      passedT: 0,
    };
  });

  // Safety car: parked at the end of the pit lane until it's sent out.
  const sc = safetyCar();
  group.add(sc.group);
  const SC_PARK: [number, number] = [22.6, -2.3];
  const scState = { mode: "park" as "park" | "pitout" | "track" | "pitin", s: 0, ps: 0, laps: 0, v: 0, next: 38 };
  const placeSC = () => {
    sc.group.position.set(SC_PARK[0], 0, SC_PARK[1]);
    sc.group.rotation.y = Math.PI / 2;
  };
  placeSC();

  // Pit crews: seven per racing garage, waiting by their doors.
  const crews = new Map<number, Crew[]>();
  for (let ti = 0; ti < TEAMS.length; ti++) {
    if (ti === MALAS) continue;
    const bx = bayOf(ti);
    const jobs: [number, number][] = [
      [bx + 1.05, PIT_Z - 1.1], [bx + 1.05, PIT_Z + 1.1], [bx - 1.0, PIT_Z - 1.15], [bx - 1.0, PIT_Z + 1.15],
      [bx + 2.5, PIT_Z], [bx - 2.5, PIT_Z], [bx + 1.7, PIT_Z + 2.05],
    ];
    const list = await Promise.all(
      jobs.map(async (job, i) => {
        const st = await paperStandee(passengerDoodle(crewLook(TEAMS[ti], i)), 1.55);
        const idle: [number, number] = [bx - 1.8 + i * 0.6, i % 2 ? -1.75 : -2.05];
        st.group.position.set(idle[0], 0, idle[1]);
        group.add(st.group);
        return { g: st.group, pivot: st.pivot, idle, job, at: new THREE.Vector3(idle[0], 0, idle[1]), phase: i * 1.3 + ti };
      }),
    );
    crews.set(ti, list);
  }
  const label = stopLabel();
  group.add(label.s);
  let labelUntil = 0;

  const spray = sprayPool(90);
  group.add(spray.group);

  const pitS = (x: number) => PIT.nearest(x, PIT_Z).s;
  let lastPitCall = 0;
  let last = -1;
  let racing = 0;
  const tmp = new THREE.Vector3();

  const place = (c: Car) => {
    let x: number;
    let z: number;
    let tx: number;
    let tz: number;
    if (c.mode === "pit") {
      const p = PIT.at(c.ps);
      ({ x, z, tx, tz } = p);
    } else {
      const p = TRACK.at(c.s);
      x = p.x + p.tz * c.lane;
      z = p.z - p.tx * c.lane;
      tx = p.tx;
      tz = p.tz;
    }
    c.group.position.set(x, 0, z);
    c.group.rotation.y = Math.atan2(tx, tz) + (c.mode === "track" ? (c.laneT - c.lane) * -0.06 : 0);
    return { x, z, tx, tz };
  };

  /** Arc distance from a to b going forward round the lap. */
  const ahead = (a: number, b: number) => (((b - a) % TRACK.len) + TRACK.len) % TRACK.len;

  const update = (t: number) => {
    const dt = last < 0 ? 0 : Math.min(0.05, t - last);
    last = t;
    racing += dt;
    const pl = o.player();
    const scOut = scState.mode === "track" || scState.mode === "pitout";

    // Call the next car in for tyres (not under the safety car).
    if (!scOut && t - lastPitCall > 9 && !cars.some((c) => c.wantPit || c.mode === "pit")) {
      const due = cars
        .filter((c) => c.mode === "track" && ahead(c.s, PIT_ENTRY_S) > 30 && ahead(c.s, PIT_ENTRY_S) < 70)
        .sort((a, b) => a.lastPit - b.lastPit)[0];
      if (due) {
        due.wantPit = true;
        lastPitCall = t;
      }
    }

    // Safety car out every so often: from the pit exit, two slow laps, then back in.
    if (scState.mode === "park" && racing > scState.next && !cars.some((c) => c.mode === "pit")) {
      scState.mode = "pitout";
      scState.ps = pitS(21);
      scState.v = 6;
    }
    if (scState.mode === "pitout") {
      scState.v = Math.min(14, scState.v + dt * 6);
      scState.ps += scState.v * dt;
      if (scState.ps >= PIT.len) {
        scState.mode = "track";
        scState.s = PIT_EXIT_S;
        scState.laps = 0;
      }
    } else if (scState.mode === "track") {
      scState.v = Math.min(13, speedAt(scState.s) * 0.75);
      const before = scState.s;
      scState.s += scState.v * dt;
      if (ahead(before, PIT_ENTRY_S) < scState.v * dt + 0.01) {
        scState.laps++;
        if (scState.laps >= 2) {
          scState.mode = "pitin";
          scState.ps = 0;
        }
      }
    } else if (scState.mode === "pitin") {
      const end = pitS(SC_PARK[0]);
      scState.v = Math.max(2, Math.min(10, (end - scState.ps) * 1.2));
      scState.ps += scState.v * dt;
      if (scState.ps >= end) {
        scState.mode = "park";
        scState.next = racing + 70 + r() * 30;
        placeSC();
      }
    }
    if (scState.mode !== "park") {
      const p = scState.mode === "track" ? TRACK.at(scState.s) : PIT.at(scState.ps);
      sc.group.position.set(p.x, 0, p.z);
      sc.group.rotation.y = Math.atan2(p.tx, p.tz);
    }
    const blink = Math.floor(t * 6) % 2;
    sc.bar[0].visible = scState.mode !== "park" && blink === 0;
    sc.bar[1].visible = scState.mode !== "park" && blink === 1;

    for (const c of cars) {
      if (c.mode === "track") {
        let target = speedAt(c.s) * c.pace;
        // Whoever is just ahead on track (including the safety car).
        let gap = Infinity;
        let other: { lane: number; v: number } | null = null;
        for (const d of cars) {
          if (d === c || d.mode !== "track") continue;
          const a = ahead(c.s, d.s);
          if (a < gap && a < 9) {
            gap = a;
            other = d;
          }
        }
        if (scState.mode === "track") {
          const a = ahead(c.s, scState.s);
          if (a < gap && a < 30) {
            gap = a;
            other = { lane: 0, v: scState.v };
          }
        }
        if (scOut) {
          c.laneT = 0;
          target = Math.min(target, 14);
          if (other && gap < 6) target = Math.min(target, other.v * (gap < 4 ? 0.85 : 1));
        } else if (other && Math.abs(other.lane - c.lane) < 1.6) {
          if (target > other.v + 0.5 && gap > 2.2) {
            // Have a go: pull out the other side.
            c.laneT = THREE.MathUtils.clamp(other.lane > 0 ? other.lane - 2.1 : other.lane + 2.1, -2.3, 2.3);
          } else if (gap < 5.5) target = Math.min(target, other.v * (gap < 3.5 ? 0.9 : 1));
        } else if (!other) c.laneT += (c.home - c.laneT) * Math.min(1, dt * 0.4);
        // Called in: over to the pit side (right of travel) on the run to the entry.
        if (c.wantPit && ahead(c.s, PIT_ENTRY_S) < 40) c.laneT = -2.2;
        c.v += THREE.MathUtils.clamp(target - c.v, -34 * dt, 15 * dt);
        c.lane += (c.laneT - c.lane) * Math.min(1, dt * 1.8);
        const before = c.s;
        c.s += c.v * dt;
        if (c.s >= TRACK.len) {
          c.s -= TRACK.len;
          c.lap++;
        }
        if (c.wantPit && ahead(before, PIT_ENTRY_S) < c.v * dt + 0.01) {
          c.mode = "pit";
          c.ps = 0;
          c.stop = 0;
          c.stopLen = 1.9 + r() * 0.9;
          c.wantPit = false;
        }
      } else {
        // In the pit lane: down to the limiter, stop in the box, go.
        const box = pitS(bayOf(c.team));
        const toBox = box - c.ps;
        if (c.stop === 0 && toBox > 0) {
          const want = Math.min(c.ps < 8 ? 14 : 9, Math.max(0.6, toBox * 1.6));
          c.v += THREE.MathUtils.clamp(want - c.v, -26 * dt, 10 * dt);
          c.ps = Math.min(box, c.ps + c.v * dt);
          if (box - c.ps < 0.02) {
            c.stop = t;
            c.v = 0;
            if (Math.abs(pl.x - bayOf(c.team)) < 14 && Math.abs(pl.z - PIT_Z) < 12) o.onStop?.(bayOf(c.team));
          }
        } else if (c.stop > 0 && t - c.stop < c.stopLen) {
          c.v = 0;
        } else {
          if (c.stop > 0) {
            label.show(`${c.stopLen.toFixed(1)}s`, TEAMS[c.team].css);
            label.s.position.set(bayOf(c.team), 3.2, PIT_Z);
            labelUntil = t + 1.6;
            c.stop = -1;
            c.lastPit = t;
          }
          c.v = Math.min(c.ps > box + 12 ? 16 : 9, c.v + dt * 10);
          c.ps += c.v * dt;
          if (c.ps >= PIT.len) {
            c.mode = "track";
            c.s = PIT_EXIT_S;
            c.lane = c.laneT = -1.6;
          }
        }
      }
      const p = place(c);
      // Jacked up during the stop.
      c.group.position.y = c.mode === "pit" && c.stop > 0 && t - c.stop > 0.15 && t - c.stop < c.stopLen - 0.15 ? 0.16 : 0;
      c.light.visible = Math.floor(t * 4 + c.team) % 2 === 0;
      if (c.v > 12 && r() < dt * 22) {
        const back = 1.9;
        spray.puff(p.x - p.tx * back + (r() - 0.5) * 0.6, p.z - p.tz * back + (r() - 0.5) * 0.6, -p.tx * c.v * 0.18, -p.tz * c.v * 0.18, t);
      }
      // Pass-by sound when it was closest to her a moment ago.
      const d = Math.hypot(p.x - pl.x, p.z - pl.z);
      if (d > c.near && c.near < 9 && c.v > 14 && t - c.lastZoom > 1.2) {
        c.lastZoom = t;
        o.onPass?.(1 - c.near / 9);
      }
      c.near = d;
    }
    spray.update(t, dt);

    // Crews: out to their spots when their car is on its way in, back to the doors after.
    for (const [ti, list] of crews) {
      const car = cars.find((c) => c.team === ti && c.mode === "pit");
      const out = !!car && (car.stop > 0 || (car.stop === 0 && pitS(bayOf(ti)) - car.ps < 26));
      const working = !!car && car.stop > 0 && t - car.stop < car.stopLen;
      for (const m of list) {
        const want = out ? m.job : m.idle;
        tmp.set(want[0], 0, want[1]);
        const dist = m.at.distanceTo(tmp);
        if (dist > 0.02) m.at.lerp(tmp, Math.min(1, (dt * 7) / dist));
        m.g.position.copy(m.at);
        const moving = dist > 0.05;
        m.g.position.y = moving ? Math.abs(Math.sin(t * 14 + m.phase)) * 0.08 : working ? Math.abs(Math.sin(t * 20 + m.phase)) * 0.05 : 0;
        m.pivot.rotation.z = moving ? Math.sin(t * 14 + m.phase) * 0.06 : working ? -0.12 : Math.sin(t * 0.8 + m.phase) * 0.02;
      }
    }
    label.s.visible = t < labelUntil;
    if (label.s.visible) label.s.position.y = 3.2 + (1.6 - (labelUntil - t)) * 0.4;
  };

  return {
    group,
    update,
    order() {
      return [...cars]
        .sort((a, b) => b.lap * TRACK.len + b.s - (a.lap * TRACK.len + a.s))
        .map((c) => ({ team: c.team, pit: c.mode === "pit" }));
    },
    lap: () => Math.max(...cars.map((c) => c.lap)),
    safety: () => scState.mode === "track" || scState.mode === "pitout",
    dots: () => [
      ...cars.map((c) => ({ x: c.group.position.x, z: c.group.position.z, team: c.team })),
      ...(scState.mode === "park" ? [] : [{ x: sc.group.position.x, z: sc.group.position.z, team: -1 }]),
    ],
  };
}
