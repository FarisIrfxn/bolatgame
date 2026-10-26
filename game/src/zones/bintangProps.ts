import * as THREE from "three";
import { type Instrument, type PersonLook, cityWalkerDoodle, musicianDoodle } from "../content/doodles";
import { sfx } from "../core/sfx";
import { paperStandee } from "../overworld/paper";
import { mergeStatic } from "../overworld/merge";
import { canvasTexture, flat, roundedBox } from "../overworld/props";
import { model, modelBox } from "../overworld/models";
import { splatGround } from "../overworld/splat";
import { paintedMat } from "../overworld/textures";
import type { Pickup } from "../overworld/zone";
import { shadowed } from "./common";
import type { Anim } from "./labuProps";
import { bubbleTex, setBubbleText, speechDuration } from "../ui/speechBubble";

// Bukit Bintang on a late afternoon, the city of music: a Shibuya-style scramble crossing in the middle,
// giant screens on the mall, the monorail gliding along Jalan Sultan Ismail, shawarma smoke, buskers, a
// vinyl shop, and the KL skyline (KLCC, Menara KL, Merdeka 118) at the far end of the road. While Bowat's
// fart clouds hang over the junction everyone runs about holding their noses; once Qish has sprayed them
// all away the city goes back to strolling and the lights start cycling again.

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

function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

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

function mesh(geo: THREE.BufferGeometry, mat: THREE.Material | THREE.Material[], x = 0, y = 0, z = 0) {
  const m = new THREE.Mesh(geo, mat);
  m.position.set(x, y, z);
  return m;
}

const box = (w: number, h: number, d: number, mat: THREE.Material, x = 0, y = 0, z = 0) => mesh(roundedBox(w, h, d, 0.14, 2), mat, x, y, z);

/** A cylinder between two points (frames, rails, handles). */
function rod(a: THREE.Vector3, b: THREE.Vector3, r: number, mat: THREE.Material, seg = 6) {
  const len = a.distanceTo(b);
  const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, len, seg), mat);
  m.position.copy(a).add(b).multiplyScalar(0.5);
  m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), b.clone().sub(a).normalize());
  return m;
}

const v3 = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

/** Unlit and untouched by tone mapping: LED screens, neon, lit windows. */
const glow = (map: THREE.Texture | null, color = 0xffffff) => new THREE.MeshBasicMaterial({ map, color, toneMapped: false });

/** A flat decal lying on the ground (road paint, crossings). */
function decal(w: number, d: number, mat: THREE.Material, x: number, z: number, rot = 0, y = 0.045) {
  const m = mesh(new THREE.PlaneGeometry(w, d), mat, x, y, z);
  m.rotation.x = -Math.PI / 2;
  m.rotation.z = rot;
  m.receiveShadow = true;
  return m;
}

// ---------------------------------------------------------------- Layout

// The junction sits at 45° to the camera, so the two roads make an X across the screen and the four
// blocks between them sit top, right, bottom and left. Road-related things are laid out in the road
// frame (u, v): Jalan Bukit Bintang runs along u (top-left to bottom-right on screen), Jalan Sultan
// Ismail along v (top-right to bottom-left).

/** Half the width of each road: two lanes each way. */
export const ROAD = 5.5;
/** Outer edge of the sidewalks along each road. */
export const WALK = 8.5;
/** Stop lines, just outside the crossings. */
export const STOP = 9.8;
/** Group rotation that turns the road frame into the world. */
export const ROT = -Math.PI / 4;
/** Road frame (u, v) to world (x, z). */
export const W = (u: number, v: number): [number, number] => [(u - v) / Math.SQRT2, (u + v) / Math.SQRT2];
/** World (x, z) to road frame (u, v). */
export const UV = (x: number, z: number): [number, number] => [(x + z) / Math.SQRT2, (z - x) / Math.SQRT2];
/** The monorail runs along Jalan Bukit Bintang, above the south-west edge of its sidewalk. */
export const RAIL_V = 10.6;
export const RAIL_Y = 6.4;
/** Where the four corner waiting areas of the scramble are, in the world: top, right, bottom, left. */
export const CORNERS: [number, number][] = [W(-7, -7), W(7, -7), W(7, 7), W(-7, 7)];

// ---------------------------------------------------------------- Ground

/** Pavers under everything, the two roads (built in the road frame and turned 45°), kerbs, and all
 * the road paint: lane lines, stop lines, the four zebra crossings and the scramble's big yellow
 * diagonals (which, turned, cross the middle of the screen as a +). */
export function junction(): THREE.Group {
  const out = new THREE.Group();
  const LEN = 95;
  out.add(
    splatGround(
      [0, -45, 180, 210],
      (p) => {
        p.polygon("tar", [W(-LEN, -ROAD), W(LEN, -ROAD), W(LEN, ROAD), W(-LEN, ROAD)]);
        p.polygon("tar", [W(-ROAD, -LEN), W(ROAD, -LEN), W(ROAD, LEN), W(-ROAD, LEN)]);
        p.rect("tar", 34.9, 15.7, 37.5, 20.0, 0.12, 0.8);
      },
      { grass: 2.2, dirt: 3.2, tar: 5, pavers: 2.2 },
      5,
      "bb_pavers",
    ),
  );
  const g = new THREE.Group();

  // Kerbs along every road edge, broken at the corners.
  const kerb = flat(0xc9c4ba);
  const k = (x0: number, z0: number, x1: number, z1: number) => g.add(box(Math.max(0.22, x1 - x0), 0.16, Math.max(0.22, z1 - z0), kerb, (x0 + x1) / 2, 0.08, (z0 + z1) / 2));
  for (const s of [-1, 1]) {
    k(-LEN, s * ROAD - 0.11, -WALK, s * ROAD + 0.11);
    k(WALK, s * ROAD - 0.11, LEN, s * ROAD + 0.11);
    k(s * ROAD - 0.11, -LEN, s * ROAD + 0.11, -WALK);
    k(s * ROAD - 0.11, WALK, s * ROAD + 0.11, LEN);
  }

  const white = new THREE.MeshLambertMaterial({ color: 0xf4f1ea });
  const yellow = new THREE.MeshLambertMaterial({ color: 0xf4c430 });
  const armLen = LEN - STOP - 1;
  const armMid = (LEN + STOP + 1) / 2;
  // Double yellow down the middle of each arm, dashed white between the two lanes each way.
  for (const s of [-0.12, 0.12]) {
    for (const d of [-1, 1]) {
      g.add(decal(armLen, 0.1, yellow, d * armMid, s));
      g.add(decal(0.1, armLen, yellow, s, d * armMid));
    }
  }
  for (let a = STOP + 2; a < LEN; a += 4) {
    for (const d of [-1, 1]) {
      for (const lane of [-2.75, 2.75]) {
        g.add(decal(2, 0.12, white, d * a, lane));
        g.add(decal(0.12, 2, white, lane, d * a));
      }
    }
  }
  // Stop lines across the approach lanes.
  g.add(decal(0.4, ROAD - 0.3, white, -STOP, -ROAD / 2));
  g.add(decal(0.4, ROAD - 0.3, white, STOP, ROAD / 2));
  g.add(decal(ROAD - 0.3, 0.4, white, ROAD / 2, -STOP));
  g.add(decal(ROAD - 0.3, 0.4, white, -ROAD / 2, STOP));
  // Zebra crossings over each arm, between the corner kerbs.
  const mid = (ROAD + 0.4 + STOP - 0.4) / 2;
  const span = STOP - ROAD - 1.2;
  for (let i = -5; i <= 5; i++) {
    for (const s of [-1, 1]) {
      g.add(decal(span, 0.55, white, s * mid, i * 0.98));
      g.add(decal(0.55, span, white, i * 0.98, s * mid));
    }
  }
  // The scramble's diagonals, in yellow like the real one.
  for (const rot of [Math.PI / 4, -Math.PI / 4]) {
    for (let i = -7; i <= 7; i++) {
      const d = i * 1.05;
      g.add(decal(2.6, 0.6, yellow, d * Math.cos(rot), -d * Math.sin(rot), rot, 0.047));
    }
  }
  g.rotation.y = ROT;
  out.add(g);
  return out;
}

/** Red-painted motorbike bay with "ZON MOTOSIKAL" in big white letters, like the corner in the photo. */
export function motoZone(x0: number, z0: number, x1: number, z1: number) {
  const w = x1 - x0;
  const d = z1 - z0;
  const tex = canvasTexture(512, Math.round((512 * d) / w), (g) => {
    const H = g.canvas.height;
    g.fillStyle = "#c8322a";
    g.fillRect(0, 0, 512, H);
    g.strokeStyle = "#f4f1ea";
    g.lineWidth = 10;
    g.strokeRect(10, 10, 492, H - 20);
    g.save();
    g.translate(256, H * 0.72);
    g.fillStyle = "#f4f1ea";
    g.font = `bold ${Math.round(H * 0.24)}px 'Bagel Fat One', sans-serif`;
    g.textAlign = "center";
    g.textBaseline = "middle";
    g.fillText("ZON MOTOSIKAL", 0, 4);
    g.restore();
  });
  return decal(w, d, new THREE.MeshLambertMaterial({ map: tex }), (x0 + x1) / 2, (z0 + z1) / 2, 0, 0.05);
}

/** A painted piano keyboard on the plaza: each white key plays a note when Qish steps on it.
 * `key(x, z)` says which key (0..n-1) is under a point, or -1. */
export function pianoWalk(x0: number, z0: number, n: number, keyW: number, len: number, player: () => THREE.Vector3): Anim & { key: (x: number, z: number) => number } {
  const group = new THREE.Group();
  const whiteMat = new THREE.MeshLambertMaterial({ color: 0xf6f3ec });
  const lit = new THREE.MeshBasicMaterial({ color: 0xffe28a, toneMapped: false });
  const keys: THREE.Mesh[] = [];
  for (let i = 0; i < n; i++) {
    const k = decal(keyW - 0.08, len, whiteMat, x0 + keyW * (i + 0.5), z0 + len / 2, 0, 0.05);
    group.add(k);
    keys.push(k);
  }
  // Black keys between white ones, in the 2-3 pattern.
  const black = new THREE.MeshLambertMaterial({ color: 0x1c1a20 });
  for (let i = 0; i < n - 1; i++) {
    if (i % 7 === 2 || i % 7 === 6) continue;
    group.add(decal(keyW * 0.55, len * 0.6, black, x0 + keyW * (i + 1), z0 + len * 0.3, 0, 0.055));
  }
  group.add(decal(keyW * n + 0.3, len + 0.3, new THREE.MeshLambertMaterial({ color: 0x2a2730 }), x0 + (keyW * n) / 2, z0 + len / 2, 0, 0.04));
  const key = (x: number, z: number) => (z < z0 || z > z0 + len || x < x0 || x > x0 + keyW * n ? -1 : Math.floor((x - x0) / keyW));
  // C major scale up from middle C.
  const SCALE = [0, 2, 4, 5, 7, 9, 11, 12, 14, 16, 17, 19, 21, 23];
  let last = -1;
  const glowT = new Array(n).fill(0);
  const tick = ticker();
  const update = (t: number) => {
    const dt = tick(t);
    const p = player();
    const k = key(p.x, p.z);
    if (k >= 0 && k !== last) {
      sfx.piano(SCALE[k % SCALE.length]);
      glowT[k] = 0.5;
    }
    last = k;
    keys.forEach((m, i) => {
      glowT[i] = Math.max(0, glowT[i] - dt);
      m.material = glowT[i] > 0 ? lit : whiteMat;
    });
  };
  return { group, update, key };
}

// ---------------------------------------------------------------- Buildings

/** Upper floors of a city building: rows of windows (some lit), a colour band per floor, the odd aircon
 * box. Colour map plus a matching emissive map so lit windows glow at dusk. */
function towerFace(wu: number, hu: number, o: { seed: number; wall: string; glass?: string; floor?: number; ground?: number; lit?: number; band?: string }) {
  const PX = 24;
  const w = Math.min(1024, Math.round(wu * PX));
  const h = Math.min(1024, Math.round(hu * PX));
  const sx = w / wu;
  const sy = h / hu;
  const r = rng(o.seed);
  const floor = o.floor ?? 3;
  const ground = o.ground ?? 0;
  const lit: [number, number, number, number][] = [];
  const map = canvasTexture(w, h, (g) => {
    g.fillStyle = o.wall;
    g.fillRect(0, 0, w, h);
    for (let i = 0; i < 160; i++) {
      g.fillStyle = `rgba(0,0,0,${r() * 0.05})`;
      g.fillRect(r() * w, r() * h, 6 + r() * 20, 4 + r() * 30);
    }
    for (let fy = hu - ground; fy > 0.5; fy -= floor) {
      const y0 = (hu - fy) * sy;
      if (o.band) {
        g.fillStyle = o.band;
        g.fillRect(0, y0 + floor * sy - 4, w, 4);
      }
      for (let x = 0.4; x < wu - 0.8; x += 1.6) {
        const lightOn = r() < (o.lit ?? 0.35);
        const rect: [number, number, number, number] = [x * sx, y0 + floor * 0.22 * sy, 1.1 * sx, floor * 0.5 * sy];
        g.fillStyle = lightOn ? "#ffe2a6" : o.glass ?? "#53708c";
        g.fillRect(...rect);
        if (!lightOn) {
          g.fillStyle = "rgba(255,255,255,.22)";
          g.fillRect(rect[0] + 2, rect[1] + 2, rect[2] * 0.25, rect[3] - 4);
        } else lit.push(rect);
        if (r() < 0.08) {
          g.fillStyle = "#e8e4dc";
          g.fillRect(rect[0] + rect[2] * 0.2, rect[1] + rect[3] + 2, rect[2] * 0.6, floor * 0.18 * sy);
        }
      }
    }
  });
  const emissive = canvasTexture(w, h, (g) => {
    g.fillStyle = "#000";
    g.fillRect(0, 0, w, h);
    g.fillStyle = "#c9a060";
    for (const rect of lit) g.fillRect(...rect);
  });
  return { map, emissive };
}

/** A city block: a box with window faces on its four sides (south, east and west show in the views)
 * and a flat roof with a parapet and water tanks. */
export function cityBlock(x0: number, z0: number, x1: number, z1: number, h: number, o: { seed: number; wall: string; glass?: string; floor?: number; ground?: number; lit?: number; band?: string }) {
  const g = new THREE.Group();
  const front = towerFace(x1 - x0, h, o);
  const side = towerFace(z1 - z0, h, { ...o, seed: o.seed + 11 });
  const faceMat = (f: { map: THREE.Texture; emissive: THREE.Texture }) => new THREE.MeshLambertMaterial({ map: f.map, emissiveMap: f.emissive, emissive: 0xffffff });
  const sideMat = faceMat(side);
  const roof = flat(0x77737a);
  const body = mesh(roundedBox(x1 - x0, h, z1 - z0), [sideMat, sideMat, roof, roof, faceMat(front), roof], (x0 + x1) / 2, h / 2, (z0 + z1) / 2);
  body.castShadow = true;
  body.receiveShadow = true;
  g.add(body);
  const lip = flat(0x8d8890);
  g.add(box(x1 - x0 + 0.2, 0.5, 0.25, lip, (x0 + x1) / 2, h + 0.25, z1));
  g.add(box(0.25, 0.5, z1 - z0, lip, x0, h + 0.25, (z0 + z1) / 2));
  g.add(box(0.25, 0.5, z1 - z0, lip, x1, h + 0.25, (z0 + z1) / 2));
  const r = rng(o.seed + 5);
  for (let x = x0 + 2; x < x1 - 2; x += 5 + r() * 5) {
    g.add(mesh(new THREE.CylinderGeometry(0.7, 0.7, 1.2, 10), flat(r() < 0.5 ? 0x3b6fe0 : 0xd9d4c8), x, h + 1.0, z0 + 1.6 + r() * (z1 - z0 - 3)));
  }
  g.userData.fade = true;
  return g;
}

export type ShopKind = "urut" | "kedai24" | "shawarma" | "mamak" | "vinyl" | "gitar" | "tutup";

const SHOP_LOOK: Record<ShopKind, { name: string; sub: string; bg: string; fg: string; awning?: [string, string] }> = {
  urut: { name: "URUT KAKI", sub: "REFLEKSOLOGI · RM30", bg: "#2f8a5a", fg: "#fffdf6", awning: ["#2f8a5a", "#fffdf6"] },
  kedai24: { name: "KEDAI 24 JAM", sub: "SEMUA ADA", bg: "#f2f0ea", fg: "#e3350d" },
  shawarma: { name: "SHAWARMA BINTANG", sub: "AYAM · DAGING · KEJU", bg: "#1f2f7a", fg: "#ffcb05", awning: ["#e3350d", "#fffdf6"] },
  mamak: { name: "MAMAK 24J", sub: "ROTI · TEH TARIK", bg: "#ffcb05", fg: "#7a2a1a", awning: ["#3fae5a", "#fffdf6"] },
  vinyl: { name: "PIRING HITAM", sub: "VINYL · KASET · CD", bg: "#17151f", fg: "#ff8fb1" },
  gitar: { name: "KEDAI GITAR", sub: "GITAR · UKULELE", bg: "#7a3b22", fg: "#ffe28a", awning: ["#7a3b22", "#f2d27a"] },
  tutup: { name: "", sub: "", bg: "#9a958c", fg: "#fff" },
};

/** One shopfront on the ground floor of a row, facing south (+z) at `z`, `x0..x1` wide, 3.4 tall:
 * a lit sign board, glass front (or a pulled-down shutter), and a striped awning over the door. */
function shopFront(kind: ShopKind, x0: number, x1: number, z: number) {
  const g = new THREE.Group();
  const w = x1 - x0;
  const cx = (x0 + x1) / 2;
  const L = SHOP_LOOK[kind];
  if (kind === "tutup") {
    // A rolled-down steel shutter with a scrawl on it, closed for the day.
    const tex = canvasTexture(256, 160, (c) => {
      c.fillStyle = "#a8a39a";
      c.fillRect(0, 0, 256, 160);
      c.fillStyle = "rgba(0,0,0,.18)";
      for (let y = 0; y < 160; y += 8) c.fillRect(0, y, 256, 3);
      c.fillStyle = "#ff5c93";
      c.font = "bold 30px 'Gaegu', sans-serif";
      c.fillText("Untuk disewa", 30, 70);
      c.font = "bold 22px 'Gaegu', sans-serif";
      c.fillText("012-3456789", 60, 104);
    });
    g.add(mesh(new THREE.PlaneGeometry(w - 0.4, 3.0), new THREE.MeshLambertMaterial({ map: tex }), cx, 1.5, z + 0.02));
    return g;
  }
  const sign = canvasTexture(512, 112, (c) => {
    c.fillStyle = L.bg;
    c.fillRect(0, 0, 512, 112);
    c.fillStyle = L.fg;
    c.textAlign = "center";
    c.textBaseline = "middle";
    c.font = `bold ${L.name.length > 13 ? 50 : 60}px 'Bagel Fat One', sans-serif`;
    c.fillText(L.name, 256, 46);
    c.font = "bold 26px 'Gaegu', sans-serif";
    c.fillText(L.sub, 256, 92);
  });
  g.add(mesh(roundedBox(w - 0.3, 0.9, 0.18), [flat(0x2a2730), flat(0x2a2730), flat(0x2a2730), flat(0x2a2730), glow(sign), flat(0x2a2730)], cx, 3.35, z + 0.1));
  // Glass front: a warm-lit interior with shelves.
  const inside = canvasTexture(256, 128, (c) => {
    const grad = c.createLinearGradient(0, 0, 0, 128);
    grad.addColorStop(0, "#fff3d0");
    grad.addColorStop(1, "#e8c890");
    c.fillStyle = grad;
    c.fillRect(0, 0, 256, 128);
    const r = rng(kind.length * 31);
    for (let y = 22; y < 120; y += 30) {
      c.fillStyle = "#8a6a4a";
      c.fillRect(8, y + 18, 240, 5);
      for (let x = 10; x < 240; x += 9 + r() * 8) {
        c.fillStyle = ["#e3350d", "#3b6fe0", "#ffcb05", "#3fae5a", "#ff8fb1", "#2a2730"][Math.floor(r() * 6)];
        c.fillRect(x, y + 4 + r() * 6, 6, 14 - r() * 4);
      }
    }
    c.fillStyle = "rgba(255,255,255,.35)";
    c.fillRect(30, 0, 18, 128);
    c.fillRect(150, 0, 10, 128);
    c.strokeStyle = "#2a2730";
    c.lineWidth = 6;
    c.strokeRect(3, 3, 250, 122);
    c.beginPath();
    c.moveTo(128, 0);
    c.lineTo(128, 128);
    c.stroke();
  });
  g.add(mesh(new THREE.PlaneGeometry(w - 0.5, 2.7), glow(inside, 0xe0d8c8), cx, 1.38, z + 0.03));
  if (L.awning) {
    const stripes = canvasTexture(128, 32, (c) => {
      for (let i = 0; i < 8; i++) {
        c.fillStyle = L.awning![i % 2];
        c.fillRect(i * 16, 0, 16, 32);
      }
    });
    const aw = mesh(roundedBox(w - 0.2, 0.08, 1.3), new THREE.MeshLambertMaterial({ map: stripes }), cx, 2.75, z + 0.6);
    aw.rotation.x = 0.32;
    aw.castShadow = true;
    g.add(aw);
  }
  return g;
}

/** A row of shophouses with its front at `z` (facing south), shops along the ground floor, windows
 * and hanging vertical signs above. */
export function shopRow(x0: number, z0: number, x1: number, z: number, h: number, shops: [ShopKind, number, number][], o: { seed: number; wall: string; band?: string; signs?: [string, string, number][] }) {
  const g = new THREE.Group();
  const generated = modelBox(o.seed === 3 ? "bb_shops_left" : "bb_shops_right", x1 - x0, h, z - z0);
  if (generated) {
    generated.position.set((x0 + x1) / 2, 0, (z0 + z) / 2);
    g.add(generated);
    g.userData.fade = true;
  } else {
    g.add(cityBlock(x0, z0, x1, z, h, { seed: o.seed, wall: o.wall, ground: 4, band: o.band, lit: 0.45 }));
  }
  for (const [kind, a, b] of shops) g.add(shopFront(kind, a, b, z));
  // Vertical neon blade signs sticking out from the facade.
  for (const [text, color, x] of o.signs ?? []) {
    const tex = canvasTexture(64, 320, (c) => {
      c.fillStyle = "#17151f";
      c.fillRect(0, 0, 64, 320);
      c.strokeStyle = color;
      c.lineWidth = 5;
      c.strokeRect(5, 5, 54, 310);
      c.fillStyle = color;
      c.font = "bold 40px 'Bagel Fat One', sans-serif";
      c.textAlign = "center";
      c.textBaseline = "middle";
      const chars = [...text];
      chars.forEach((ch, i) => c.fillText(ch, 32, 30 + (i * 270) / Math.max(1, chars.length - 1 || 1)));
    });
    const blade = mesh(roundedBox(0.2, 4.4, 1.0), [glow(tex), glow(tex), flat(0x17151f), flat(0x17151f), flat(0x17151f), flat(0x17151f)], x, 7.4, z + 0.6);
    g.add(blade);
  }
  return g;
}

// ---------------------------------------------------------------- LED screens

/** What the screens are showing: the news about the fart clouds while there are any left, music
 * otherwise. */
export interface ScreenState {
  clouds: () => number;
}

const TRACKS: [string, string, string][] = [
  ["LAUFEY", "From The Start", "#f6c6d8"],
  ["JOJI", "SANCTUARY", "#9fc6ff"],
  ["BRYANT BARNES", "Adore You", "#ffe28a"],
  ["MALCOLM TODD", "Chest Pain (I Love)", "#b8f0c8"],
];

function drawVinyl(c: CanvasRenderingContext2D, x: number, y: number, r: number, spin: number, label: string) {
  c.save();
  c.translate(x, y);
  c.rotate(spin);
  c.fillStyle = "#141218";
  c.beginPath();
  c.arc(0, 0, r, 0, Math.PI * 2);
  c.fill();
  c.strokeStyle = "rgba(255,255,255,.12)";
  c.lineWidth = 2;
  for (let k = r * 0.45; k < r; k += r * 0.09) {
    c.beginPath();
    c.arc(0, 0, k, 0, Math.PI * 2);
    c.stroke();
  }
  c.fillStyle = "rgba(255,255,255,.25)";
  c.beginPath();
  c.moveTo(0, 0);
  c.arc(0, 0, r, -0.5, -0.2);
  c.fill();
  c.fillStyle = label;
  c.beginPath();
  c.arc(0, 0, r * 0.32, 0, Math.PI * 2);
  c.fill();
  c.fillStyle = "#141218";
  c.beginPath();
  c.arc(0, 0, r * 0.05, 0, Math.PI * 2);
  c.fill();
  c.restore();
}

/** A simple grey sloth silhouette with a green cloud behind, for the news. */
function drawSuspect(c: CanvasRenderingContext2D, x: number, y: number, s: number, t: number) {
  c.save();
  c.translate(x, y);
  c.scale(s, s);
  c.fillStyle = "#a6d65a";
  for (const [px, py, r] of [[-40, 10, 30], [-62, -10, 22], [-30, -22, 20]]) {
    c.beginPath();
    c.arc(px + Math.sin(t * 3 + px) * 3, py, r, 0, Math.PI * 2);
    c.fill();
  }
  c.fillStyle = "#b9b0a2";
  c.strokeStyle = INK;
  c.lineWidth = 5;
  c.beginPath();
  c.ellipse(0, 10, 34, 40, 0, 0, Math.PI * 2);
  c.fill();
  c.stroke();
  c.beginPath();
  c.ellipse(0, -36, 26, 22, 0, 0, Math.PI * 2);
  c.fill();
  c.stroke();
  c.fillStyle = "#6a5a4a";
  c.beginPath();
  c.ellipse(-10, -36, 9, 6, 0.3, 0, Math.PI * 2);
  c.ellipse(10, -36, 9, 6, -0.3, 0, Math.PI * 2);
  c.fill();
  c.fillStyle = "#fffdf6";
  c.font = "bold 40px 'Bagel Fat One', sans-serif";
  c.textAlign = "center";
  c.fillText("?", 0, 24);
  c.restore();
}

/** Paint one frame of a screen. `kind` picks the programme: the big screens alternate news and music,
 * the small ones run equalisers and ads. */
function paintScreen(c: CanvasRenderingContext2D, W: number, H: number, t: number, kind: "main" | "eq" | "ad", st: ScreenState) {
  const left = st.clouds();
  if (left > 0 && kind !== "eq") {
    // BERITA TERKINI: the fart clouds.
    const grad = c.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, "#1b2a5a");
    grad.addColorStop(1, "#0d1430");
    c.fillStyle = grad;
    c.fillRect(0, 0, W, H);
    c.fillStyle = Math.floor(t * 2) % 2 ? "#e3350d" : "#c4180a";
    c.fillRect(0, 0, W, H * 0.2);
    c.fillStyle = "#fffdf6";
    c.font = `bold ${Math.round(H * 0.13)}px 'Bagel Fat One', sans-serif`;
    c.textBaseline = "middle";
    c.textAlign = "left";
    c.fillText("⚠ BERITA TERKINI", W * 0.03, H * 0.105);
    c.textAlign = "right";
    c.fillText(`AWAN: ${left}/6`, W * 0.97, H * 0.105);
    c.textAlign = "left";
    c.font = `bold ${Math.round(H * (kind === "main" ? 0.12 : 0.1))}px 'Bagel Fat One', sans-serif`;
    c.fillStyle = "#c6f26b";
    c.fillText("AWAN KENTUT MISTERI", W * 0.05, H * 0.38);
    c.fillStyle = "#fffdf6";
    c.fillText("LANDA BUKIT BINTANG", W * 0.05, H * 0.55);
    drawSuspect(c, W * 0.8, H * 0.52, H / 300, t);
    c.fillStyle = "#ffcb05";
    c.fillRect(0, H * 0.78, W, H * 0.22);
    c.fillStyle = INK;
    c.font = `bold ${Math.round(H * 0.1)}px 'Gaegu', sans-serif`;
    const ticker = "Orang ramai diminta bertenang · Suspek: sloth kelabu, gemuk, comel · Suspek nafi: \"0% bukti\" · Pewangi habis stok di seluruh KL · ";
    const tw = c.measureText(ticker).width;
    const off = (t * W * 0.12) % tw;
    c.fillText(ticker + ticker, W * 0.02 - off, H * 0.89);
    return;
  }
  if (kind === "eq") {
    // Equaliser bars in a gradient, bouncing.
    c.fillStyle = "#120f1c";
    c.fillRect(0, 0, W, H);
    const n = 18;
    for (let i = 0; i < n; i++) {
      const v = 0.25 + 0.7 * Math.abs(Math.sin(t * (2.2 + (i % 5) * 0.5) + i * 1.3)) * (left > 0 ? 0.3 : 1);
      const bh = v * H * 0.8;
      const hue = 300 + i * 6 + t * 30;
      c.fillStyle = `hsl(${hue % 360},90%,62%)`;
      c.fillRect((i + 0.15) * (W / n), H * 0.9 - bh, (W / n) * 0.7, bh);
    }
    c.fillStyle = "#fffdf6";
    c.font = `bold ${Math.round(H * 0.16)}px 'Bagel Fat One', sans-serif`;
    c.textAlign = "center";
    c.textBaseline = "top";
    c.fillText(left > 0 ? "♪ ...uhuk" : "♪ BANDAR MUZIK ♪", W / 2, H * 0.04);
    return;
  }
  if (kind === "ad") {
    const k = Math.floor(t / 6) % 2;
    c.fillStyle = k ? "#1f2f7a" : "#ff8fb1";
    c.fillRect(0, 0, W, H);
    c.textAlign = "center";
    c.textBaseline = "middle";
    if (k) {
      c.fillStyle = "#ffcb05";
      c.font = `bold ${Math.round(H * 0.2)}px 'Bagel Fat One', sans-serif`;
      c.fillText("SHAWARMA", W / 2, H * 0.3);
      c.fillStyle = "#fffdf6";
      c.font = `bold ${Math.round(H * 0.14)}px 'Gaegu', sans-serif`;
      c.fillText("Bintang · 24 jam · RM9", W / 2, H * 0.62);
    } else {
      c.fillStyle = "#fffdf6";
      c.font = `bold ${Math.round(H * 0.17)}px 'Bagel Fat One', sans-serif`;
      c.fillText("PIRING HITAM", W / 2, H * 0.3);
      c.font = `bold ${Math.round(H * 0.13)}px 'Gaegu', sans-serif`;
      c.fillText("vinyl baru setiap minggu ♪", W / 2, H * 0.62);
      drawVinyl(c, W * 0.88, H * 0.82, H * 0.3, t * 3, "#ffcb05");
    }
    return;
  }
  // Main screen: "now playing" with a spinning record, the four favourites in turn.
  const [artist, song, col] = TRACKS[Math.floor(t / 7) % TRACKS.length];
  const grad = c.createLinearGradient(0, 0, W, H);
  grad.addColorStop(0, col);
  grad.addColorStop(1, "#2a2050");
  c.fillStyle = grad;
  c.fillRect(0, 0, W, H);
  drawVinyl(c, W * 0.2, H * 0.52, H * 0.4, t * 2.2, col);
  c.textAlign = "left";
  c.textBaseline = "middle";
  c.fillStyle = "rgba(255,255,255,.75)";
  c.font = `bold ${Math.round(H * 0.09)}px 'Gaegu', sans-serif`;
  c.fillText("SEDANG DIMAIN ♪", W * 0.42, H * 0.24);
  c.fillStyle = "#fffdf6";
  c.font = `bold ${Math.round(H * 0.17)}px 'Bagel Fat One', sans-serif`;
  c.fillText(artist, W * 0.42, H * 0.46);
  c.font = `bold ${Math.round(H * 0.11)}px 'Gaegu', sans-serif`;
  c.fillText(song, W * 0.42, H * 0.66);
  for (let i = 0; i < 14; i++) {
    const v = Math.abs(Math.sin(t * 3 + i * 0.8));
    c.fillRect(W * 0.42 + i * W * 0.035, H * 0.88 - v * H * 0.08, W * 0.02, v * H * 0.08 + 4);
  }
}

/** A live screen: a canvas texture repainted ~12 times a second. */
function screenTexture(W: number, H: number, kind: "main" | "eq" | "ad", st: ScreenState, phase = 0) {
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const c = canvas.getContext("2d")!;
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  let next = 0;
  const update = (t: number) => {
    if (t < next) return;
    next = t + 1 / 12;
    paintScreen(c, W, H, t + phase, kind, st);
    tex.needsUpdate = true;
  };
  return { tex, update };
}

/** The screen tower on the top block, its corner pointing at the junction like the real one: a giant
 * curved screen wrapped round the corner, a big screen on each face above the street, an equaliser
 * band along the top, glass doors at street level. Built with its corner at the origin and faces along
 * +x (south-east face) and -z (south-west face), then turned 45° and stood at `at`. */
export function screenTower(at: [number, number], st: ScreenState): Anim {
  const group = new THREE.Group();
  const L = 24;
  const H = 13;
  const generated = modelBox("bb_screen_tower", L, H, L);
  if (generated) {
    generated.position.set(L / 2, 0, -L / 2);
    group.add(generated);
    group.userData.fade = true;
  } else {
    const face = (wu: number) =>
      canvasTexture(Math.min(1024, wu * 24), H * 24, (c) => {
        const Wd = c.canvas.width;
        const Hd = c.canvas.height;
        c.fillStyle = "#2a2d3a";
        c.fillRect(0, 0, Wd, Hd);
        c.fillStyle = "#3a3e50";
        for (let y = 0; y < Hd; y += 48) c.fillRect(0, y, Wd, 4);
        const grad = c.createLinearGradient(0, Hd - 72, 0, Hd);
        grad.addColorStop(0, "#fff3d0");
        grad.addColorStop(1, "#e8c890");
        c.fillStyle = grad;
        c.fillRect(0, Hd - 66, Wd, 66);
        c.strokeStyle = "#5a6470";
        c.lineWidth = 5;
        for (let x = 0; x < Wd; x += 60) {
          c.beginPath();
          c.moveTo(x, Hd - 66);
          c.lineTo(x, Hd);
          c.stroke();
        }
      });
    const se = new THREE.MeshLambertMaterial({ map: face(L), emissive: 0x111118 });
    const sw = new THREE.MeshLambertMaterial({ map: face(L), emissive: 0x111118 });
    const roof = flat(0x55555e);
    const body = mesh(roundedBox(L, H, L, 0.6, 4), [roof, sw, roof, roof, se, roof], L / 2, H / 2, -L / 2);
    body.castShadow = true;
    body.receiveShadow = true;
    group.add(body);
    group.add(box(L + 0.3, 0.5, 0.3, flat(0x1c1c22), L / 2, H + 0.25, 0.1), box(0.3, 0.5, L + 0.3, flat(0x1c1c22), -0.1, H + 0.25, -L / 2));
  }

  // The giant curved corner screen.
  const R = 3.6;
  const cx = R * 0.7;
  const cz = -R * 0.7;
  const corner = screenTexture(1024, 288, "main", st);
  group.add(mesh(new THREE.CylinderGeometry(R, R, 7.4, 28, 1, true, -Math.PI / 2 - 0.35, Math.PI / 2 + 0.7), glow(corner.tex), cx, 6.9, cz));
  for (const y of [3.1, 10.7]) group.add(mesh(new THREE.CylinderGeometry(R + 0.14, R + 0.14, 0.32, 28, 1, false, -Math.PI / 2 - 0.35, Math.PI / 2 + 0.7), flat(0x1c1c22), cx, y, cz));
  // A big screen on each face.
  const s2 = screenTexture(768, 384, "ad", st, 3);
  const a = mesh(new THREE.PlaneGeometry(12, 6), glow(s2.tex), 11.6, 6.7, 0.18);
  group.add(a, box(12.5, 6.5, 0.12, flat(0x1c1c22), 11.6, 6.7, 0.04));
  const s3 = screenTexture(768, 384, "main", st, 5);
  const b = mesh(new THREE.PlaneGeometry(12, 6), glow(s3.tex), -0.18, 6.7, -11.6);
  b.rotation.y = -Math.PI / 2;
  group.add(b, box(0.12, 6.5, 12.5, flat(0x1c1c22), -0.04, 6.7, -11.6));
  // Equaliser bands along the top of both faces.
  const eq = screenTexture(768, 96, "eq", st, 1);
  const e1 = mesh(new THREE.PlaneGeometry(18, 1.6), glow(eq.tex), 13, 11.9, 0.06);
  const e2 = mesh(new THREE.PlaneGeometry(18, 1.6), glow(eq.tex), -0.06, 11.9, -13);
  e2.rotation.y = -Math.PI / 2;
  group.add(e1, e2);
  // Shop sign over the doors on the south-east face.
  const entry = canvasTexture(512, 96, (c) => {
    c.fillStyle = "#fffdf6";
    c.fillRect(0, 0, 512, 96);
    c.fillStyle = "#1f2f7a";
    c.font = "bold 62px 'Bagel Fat One', sans-serif";
    c.textAlign = "center";
    c.textBaseline = "middle";
    c.fillText("BINTANG WALK", 256, 52);
  });
  group.add(mesh(new THREE.PlaneGeometry(6, 1.1), glow(entry), 19.5, 2.3, 0.12));
  group.position.set(at[0], 0, at[1]);
  group.rotation.y = Math.PI / 4;
  // Clear of the haze, so the screens still glow from the far side of the junction.
  group.traverse((o) => {
    const m = (o as THREE.Mesh).material;
    if (m) (Array.isArray(m) ? m : [m]).forEach((x) => ((x as THREE.MeshBasicMaterial).fog = false));
  });
  return {
    group,
    update(t) {
      corner.update(t);
      s2.update(t);
      s3.update(t);
      eq.update(t);
    },
  };
}

/** A rooftop billboard screen on legs, facing south. */
export function roofScreen(x: number, y: number, z: number, w: number, h: number, kind: "main" | "eq" | "ad", st: ScreenState, phase = 0): Anim {
  const group = new THREE.Group();
  const s = screenTexture(512, Math.round((512 * h) / w), kind, st, phase);
  group.add(mesh(new THREE.PlaneGeometry(w, h), glow(s.tex), x, y + h / 2 + 1, z + 0.08));
  group.add(box(w + 0.3, h + 0.3, 0.12, flat(0x2a2730), x, y + h / 2 + 1, z));
  for (const dx of [-w / 3, w / 3]) group.add(box(0.2, 1.2, 0.2, flat(0x55555e), x + dx, y + 0.5, z - 0.2));
  return { group, update: s.update };
}

// ---------------------------------------------------------------- Monorail

/** Bukit Bintang station on the guideway, between these distances along it (u). */
export const STATION: [number, number] = [-28, -19];
/** Pillar positions along the guideway (u), clear of Jalan Sultan Ismail and the photo spot. */
export const PILLARS = [-81, -69, -57, -45, -33, -21, -13];

/** The KL Monorail coming in along Jalan Bukit Bintang from the top-left: a concrete guideway on
 * T-pillars, ending at Bukit Bintang station over the left block (stairs down to the sidewalk, buffer
 * stops at the end), and a two-car train that runs in, stops, and runs back out. Built along its own z
 * axis (= u) and turned onto the road. */
export function monorail(player: () => THREE.Vector3): Anim {
  const group = new THREE.Group();
  const concrete = paintedMat("plaster", 8, 8, 2.4, 0xcfcac0);
  const shade = paintedMat("tar", 8, 8, 2.8, 0xa9a499);
  const Z0 = -100;
  const Z1 = -12;
  group.add(box(0.75, 0.9, Z1 - Z0, concrete, 0, RAIL_Y, (Z0 + Z1) / 2));
  // Buffer stop at the end of the line.
  group.add(box(1.4, 1.0, 0.5, flat(0xe3350d), 0, RAIL_Y + 0.9, Z1 - 0.3), box(1.4, 0.2, 0.52, flat(0xfffdf6), 0, RAIL_Y + 1.0, Z1 - 0.3));
  group.add(box(0.8, 0.16, Z1 - Z0, shade, 0, RAIL_Y - 0.5, (Z0 + Z1) / 2));
  for (const z of PILLARS) {
    group.add(box(1.1, RAIL_Y - 0.6, 1.1, concrete, 0, (RAIL_Y - 0.6) / 2, z));
    group.add(box(2.6, 0.6, 1.2, shade, 0, RAIL_Y - 0.75, z));
  }
  // Station: platform deck, roof, signs both ends, and stairs down to the sidewalk (+x is towards the road).
  const [s0, s1] = STATION;
  const sl = s1 - s0;
  const sc = (s0 + s1) / 2;
  group.add(box(5.6, 0.4, sl, shade, 0, RAIL_Y - 1.0, sc));
  for (const dx of [-2.3, 2.3]) {
    group.add(box(0.12, 1.0, sl, new THREE.MeshLambertMaterial({ color: 0x9fd0e8, transparent: true, opacity: 0.45 }), dx, RAIL_Y - 0.3, sc));
    for (let z = s0 + 0.5; z <= s1; z += 3) group.add(box(0.2, 3.2, 0.2, flat(0x55555e), dx, RAIL_Y + 0.8, z));
  }
  const roof = box(6.2, 0.3, sl + 0.8, flat(0xe8e4dc), 0, RAIL_Y + 2.55, sc);
  roof.castShadow = true;
  group.add(roof);
  for (let i = 0; i < 12; i++) {
    const y = RAIL_Y - 1.2 - i * ((RAIL_Y - 1.2) / 12);
    group.add(box(1.7, 0.22, 0.55, shade, 3.25, y, s1 - 2.6 + i * 0.52));
  }
  for (const dx of [2.35, 4.15]) group.add(box(0.1, 0.1, 7.6, flat(0x55555e), dx, RAIL_Y - 2.0, s1 + 0.4).rotateX(0.68));
  const nameTex = canvasTexture(512, 96, (c) => {
    c.fillStyle = "#1f2f7a";
    c.fillRect(0, 0, 512, 96);
    c.fillStyle = "#fffdf6";
    c.font = "bold 56px 'Bagel Fat One', sans-serif";
    c.textAlign = "center";
    c.textBaseline = "middle";
    c.fillText("BUKIT BINTANG", 256, 52);
    c.fillStyle = "#e3350d";
    c.fillRect(0, 84, 512, 12);
  });
  for (const [z, ry] of [[s1 + 0.42, 0], [s0 - 0.42, Math.PI]] as const) {
    const sign = mesh(new THREE.PlaneGeometry(6.0, 1.1), glow(nameTex), 0, RAIL_Y + 3.25, z);
    sign.rotation.y = ry;
    group.add(sign, box(6, 1.2, 0.1, flat(0x1f2f7a), 0, RAIL_Y + 3.25, z + (ry ? 0.06 : -0.06)));
  }

  // The train: two cars, white with a blue band and rounded noses.
  const train = new THREE.Group();
  const bodyMat = paintedMat("plaster", 6.6, 2.2, 2.2, 0xf4f1ea);
  const band = flat(0x2f6fd8);
  const glass = new THREE.MeshLambertMaterial({ color: 0x2a3a52, emissive: 0x2a2010 });
  for (const [cz, nose] of [[-3.6, -1], [3.6, 1]] as const) {
    const car = new THREE.Group();
    car.add(box(2.1, 2.2, 6.6, bodyMat, 0, 1.25, 0));
    car.add(box(2.14, 0.55, 6.62, band, 0, 0.45, 0));
    for (const sx of [-1.07, 1.07]) car.add(box(0.04, 0.8, 5.6, glass, sx, 1.55, 0));
    const capGeo = new THREE.SphereGeometry(1.1,32,20, 0, Math.PI * 2, 0, Math.PI / 2);
    const cap = mesh(capGeo, bodyMat, 0, 1.2, nose * 3.3);
    cap.rotation.x = nose * (Math.PI / 2);
    cap.scale.set(0.95, 1.6, 1.0);
    const screen = box(1.4, 0.6, 0.2, glass, 0, 1.75, nose * 3.75);
    car.add(cap, screen);
    car.position.z = cz;
    train.add(car);
  }
  // Bake the guideway and station, and the train in its own frame (it moves).
  const mergedStatics = mergeStatic(shadowed(group));
  // The audit's no-merge mode returns its input unchanged; clone before clearing the wrapper so we
  // never try to add the monorail group as a child of itself.
  const statics = mergedStatics === group ? group.clone(true) : mergedStatics;
  group.clear();
  const trainBaked = mergeStatic(train);
  trainBaked.position.set(0, RAIL_Y + 0.15, Z0);
  trainBaked.traverse((o) => (o.castShadow = (o as THREE.Mesh).isMesh));
  group.add(statics, trainBaked);
  const [ox, oz] = W(0, RAIL_V);
  group.position.set(ox, 0, oz);
  group.rotation.y = Math.PI / 4;

  // Timetable: in from the top-left, slow into the station, wait, back out the way it came, wait.
  const tick = ticker();
  const far = Z0 - 6;
  let z = far;
  let dir = 1;
  let wait = 4;
  let dwell = 0;
  let whooshCool = 0;
  const update = (t: number) => {
    const dt = tick(t);
    whooshCool -= dt;
    if (wait > 0) {
      wait -= dt;
      trainBaked.visible = false;
      return;
    }
    trainBaked.visible = true;
    if (dwell > 0) {
      dwell -= dt;
      if (dwell <= 0) dir = -1;
    } else {
      z += dir * Math.min(9, 0.8 + Math.abs(dir > 0 ? sc - z : z - sc) * 0.5) * dt;
      if (dir > 0 && z >= sc) {
        z = sc;
        dwell = 5;
      }
    }
    trainBaked.position.z = z;
    const p = player();
    const [pu, pv] = UV(p.x, p.z);
    if (whooshCool <= 0 && Math.abs(pu - z) < 10 && Math.abs(pv - RAIL_V) < 14 && dwell <= 0) {
      whooshCool = 6;
      sfx.whoosh();
    }
    if (dir < 0 && z < far) {
      dir = 1;
      wait = 9;
    }
  };
  return { group, update };
}

// ---------------------------------------------------------------- Skyline

/** Fog-free materials for things far beyond the fog, pre-tinted towards the haze. */
const haze = (color: number, mix = 0.2, sky = 0xc8d4e6) => {
  const c = new THREE.Color(color).lerp(new THREE.Color(sky), mix);
  return new THREE.MeshLambertMaterial({ color: c, fog: false, emissive: c.clone().multiplyScalar(0.12) });
};

/** One Petronas tower: stacked tiers stepping in, a pinnacle and spire. Eight-sided like the real
 * star-shaped plan, at this distance. */
function petronasTower(x: number, z: number, s: number) {
  const g = new THREE.Group();
  const steel = haze(0xb4c0d0, 0.15);
  const band = haze(0x5a6a80, 0.15);
  const tiers: [number, number][] = [[1.0, 0.62], [0.93, 0.08], [0.86, 0.08], [0.78, 0.06], [0.68, 0.05], [0.56, 0.04], [0.42, 0.03]];
  let y = 0;
  const H = 30 * s;
  for (const [r, f] of tiers) {
    const h = H * f;
    g.add(mesh(new THREE.CylinderGeometry(r * 2.2 * s, r * 2.25 * s, h, 8), steel, 0, y + h / 2, 0));
    g.add(mesh(new THREE.CylinderGeometry(r * 2.26 * s, r * 2.26 * s, 0.25 * s, 8), band, 0, y + h, 0));
    y += h;
  }
  g.add(mesh(new THREE.CylinderGeometry(0.35 * s, 0.6 * s, 3 * s, 8), steel, 0, y + 1.5 * s, 0));
  g.add(mesh(new THREE.CylinderGeometry(0.05 * s, 0.25 * s, 6 * s, 6), steel, 0, y + 6 * s, 0));
  g.position.set(x, 0, z);
  return g;
}

/** KLCC's twin towers with the skybridge, Menara KL with its pod and mast, Merdeka 118's faceted spire,
 * a spread of other towers, and a dusk sky behind it all. Only the low camera at the north end of
 * the junction sees this. */
export function skyline(): THREE.Group {
  const g = new THREE.Group();
  // Sky: a huge gradient wall far behind, peach at the horizon to blue overhead.
  const skyTex = canvasTexture(16, 256, (c) => {
    const grad = c.createLinearGradient(0, 0, 0, 256);
    grad.addColorStop(0, "#5f86c4");
    grad.addColorStop(0.55, "#a9c3e4");
    grad.addColorStop(0.8, "#f2cdb2");
    grad.addColorStop(1, "#f6dcc4");
    c.fillStyle = grad;
    c.fillRect(0, 0, 16, 256);
  });
  const sky = mesh(new THREE.PlaneGeometry(560, 150), new THREE.MeshBasicMaterial({ map: skyTex, fog: false, toneMapped: false }), 0, 52, -150);
  g.add(sky);
  // Soft clouds lit from below.
  const cloudTex = radial("rgba(255,240,228,.85)", "rgba(255,240,228,0)", 64);
  for (const [x, y, w, h] of [[-70, 42, 70, 12], [10, 58, 90, 14], [80, 46, 60, 10], [-20, 34, 50, 7], [50, 30, 40, 6]] as const) {
    g.add(mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: cloudTex, transparent: true, depthWrite: false, fog: false }), x, y, -146));
  }

  // Petronas Twin Towers off to the left of the screen tower (seen from the photo spot), the skybridge
  // between them.
  const s = 0.7;
  const px = -40;
  const pz = -112;
  g.add(petronasTower(px - 3.8, pz, s), petronasTower(px + 3.8, pz, s));
  const bridge = haze(0x8a96a8, 0.15);
  g.add(box(5, 0.55, 1, bridge, px, 15 * s, pz));
  g.add(rod(v3(px - 2.4, 10.5 * s, pz), v3(px, 14.6 * s, pz), 0.1, bridge), rod(v3(px + 2.4, 10.5 * s, pz), v3(px, 14.6 * s, pz), 0.1, bridge));

  // Menara KL on its hill to the west.
  const kl = new THREE.Group();
  const klMat = haze(0xd8d4cc, 0.15);
  const klHill = mesh(new THREE.SphereGeometry(14,20,14, 0, Math.PI * 2, 0, Math.PI / 2), haze(0x4f8a4a, 0.3), 0, -4, 0);
  klHill.scale.y = 0.45;
  kl.add(klHill);
  kl.add(mesh(new THREE.CylinderGeometry(0.9, 1.4, 26, 10), klMat, 0, 13, 0));
  kl.add(mesh(new THREE.CylinderGeometry(3.4, 2.0, 2.8, 14), klMat, 0, 26.4, 0));
  kl.add(mesh(new THREE.CylinderGeometry(3.5, 3.5, 1.0, 14), haze(0x3a5a7a, 0.1), 0, 27.6, 0));
  kl.add(mesh(new THREE.CylinderGeometry(2.4, 3.4, 1.8, 14), klMat, 0, 29, 0));
  kl.add(mesh(new THREE.CylinderGeometry(0.3, 0.5, 4, 8), klMat, 0, 31.8, 0));
  kl.add(mesh(new THREE.CylinderGeometry(0.06, 0.2, 9, 6), klMat, 0, 38, 0));
  kl.position.set(38, 0, -118);
  kl.scale.setScalar(0.7);
  g.add(kl);

  // Merdeka 118 to the south-east of them: faceted, tapering, crowned by a long spire.
  const m = new THREE.Group();
  const mMat = haze(0x7a94b4, 0.15);
  for (let i = 0; i < 9; i++) {
    const r0 = 4.4 - i * 0.42;
    const r1 = 4.4 - (i + 1) * 0.42;
    m.add(mesh(new THREE.CylinderGeometry(r1, r0, 5.2, 6), mMat, 0, i * 5.2 + 2.6, 0).rotateY(i * 0.1));
  }
  m.add(mesh(new THREE.CylinderGeometry(0.08, 0.7, 20, 6), mMat, 0, 9 * 5.2 + 10, 0));
  m.position.set(64, 0, -130);
  m.scale.setScalar(0.55);
  g.add(m);

  // Other towers, lower and greyer, across the whole width.
  const r = rng(118);
  for (let i = 0; i < 26; i++) {
    const x = -110 + i * 8.6 + r() * 4;
    if (Math.abs(x - px) < 9 || Math.abs(x - 38) < 6) continue;
    const h = 6 + r() * 11;
    const w = 3 + r() * 4;
    const col = [0xb8c0cc, 0xd0c8bc, 0x9fb0c4, 0xc4ccd6][i % 4];
    const tower = box(w, h, w, haze(col, 0.3), x, h / 2, -95 - r() * 25);
    g.add(tower);
  }
  return mergeStatic(g);
}

// ---------------------------------------------------------------- Traffic

/** A city car: hatchback or sedan in a colour, facing +z. */
function car(color: number, sedan: boolean) {
  const generated = model(sedan ? "bb_car_green" : "bb_car_red", sedan ? 4.0 : 3.5);
  if (generated) return { g: generated, len: sedan ? 4.0 : 3.5 };
  const g = new THREE.Group();
  const paint = flat(color);
  const L = sedan ? 4.0 : 3.5;
  g.add(box(1.8, 0.7, L, paint, 0, 0.62, 0));
  g.add(box(1.6, 0.62, sedan ? 2.0 : 2.1, paint, 0, 1.28, sedan ? -0.1 : -0.25));
  g.add(box(1.64, 0.42, sedan ? 1.8 : 1.9, flat(0x2f4258), 0, 1.32, sedan ? -0.1 : -0.25));
  for (const [wx, wz] of [[-0.85, L / 2 - 0.65], [0.85, L / 2 - 0.65], [-0.85, -L / 2 + 0.65], [0.85, -L / 2 + 0.65]]) {
    const w = mesh(new THREE.CylinderGeometry(0.33, 0.33, 0.25, 10), flat(0x1c1c22), wx, 0.33, wz);
    w.rotation.z = Math.PI / 2;
    g.add(w);
  }
  for (const hx of [-0.55, 0.55]) {
    g.add(box(0.35, 0.16, 0.05, new THREE.MeshBasicMaterial({ color: 0xfff6cf }), hx, 0.78, L / 2 + 0.01));
    g.add(box(0.35, 0.14, 0.05, new THREE.MeshBasicMaterial({ color: 0xc81818 }), hx, 0.82, -L / 2 - 0.01));
  }
  return { g: shadowed(g), len: L };
}

/** A city bus, facing +z. */
function bus() {
  const generated = model("bb_bus", 8.6);
  if (generated) return { g: generated, len: 8.6 };
  const g = new THREE.Group();
  const L = 8.6;
  g.add(box(2.3, 2.6, L, flat(0xf4f1ea), 0, 1.65, 0));
  g.add(box(2.32, 0.7, L, flat(0xe3350d), 0, 0.75, 0));
  g.add(box(2.34, 0.9, L - 1.6, flat(0x2a3a52), 0, 2.2, -0.4));
  g.add(box(2.0, 1.0, 0.1, flat(0x2a3a52), 0, 2.1, L / 2 + 0.01));
  const sign = canvasTexture(256, 48, (c) => {
    c.fillStyle = "#17151f";
    c.fillRect(0, 0, 256, 48);
    c.fillStyle = "#ffb000";
    c.font = "bold 34px 'Gaegu', sans-serif";
    c.textAlign = "center";
    c.textBaseline = "middle";
    c.fillText("BB ↔ KLCC", 128, 26);
  });
  g.add(mesh(new THREE.PlaneGeometry(1.8, 0.34), glow(sign), 0, 2.78, L / 2 + 0.02));
  g.add(box(2.36, 0.14, L, flat(0x3b6fe0), 0, 3.0, 0));
  for (const wz of [L / 2 - 1.3, -L / 2 + 1.5]) {
    for (const wx of [-1.05, 1.05]) {
      const w = mesh(new THREE.CylinderGeometry(0.45, 0.45, 0.3, 10), flat(0x1c1c22), wx, 0.45, wz);
      w.rotation.z = Math.PI / 2;
      g.add(w);
    }
  }
  return { g: shadowed(g), len: L };
}

/** Yellow city taxi, facing +z. */
function cab() {
  const generated = model("bb_taxi", 4.0);
  if (generated) return { g: generated, len: 4.0 };
  const g = new THREE.Group();
  const c = car(0xf4c430, true);
  g.add(c.g);
  const roofSign = canvasTexture(128, 40, (ctx) => {
    ctx.fillStyle = "#fffdf6";
    ctx.fillRect(0, 0, 128, 40);
    ctx.fillStyle = INK;
    ctx.font = "bold 28px 'Bagel Fat One', sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("TEKSI", 64, 22);
  });
  g.add(mesh(roundedBox(0.8, 0.26, 0.34), [flat(0xfffdf6), flat(0xfffdf6), flat(0xfffdf6), flat(0xfffdf6), glow(roofSign), glow(roofSign)], 0, 1.74, -0.1));
  return { g, len: c.len };
}

export type Light = "ew" | "ewAmber" | "red" | "ns" | "nsAmber" | "walk" | "walkEnd";

/** Lanes, driving on the left, two each way. A lane runs along one road (`axis`) in direction `dir`,
 * `off` to the side of the centre line; `s` is the distance along it, with the stop line at -STOP. */
interface Lane {
  axis: "u" | "v";
  dir: 1 | -1;
  off: number;
  /** Heading for rotation.y (the car models face +z). */
  rot: number;
  /** Which signal lets it go: "ew" is Jalan Bukit Bintang (u), "ns" Jalan Sultan Ismail (v). */
  group: "ew" | "ns";
  s0: number;
  s1: number;
}

const lane = (axis: "u" | "v", dir: 1 | -1, off: number): Lane => ({
  axis,
  dir,
  off,
  // +u heads down-right on screen, +v down-left.
  rot: axis === "u" ? (dir > 0 ? Math.PI / 4 : (-3 * Math.PI) / 4) : dir > 0 ? -Math.PI / 4 : (3 * Math.PI) / 4,
  group: axis === "u" ? "ew" : "ns",
  s0: -72,
  s1: 72,
});

// Keeping left: heading +u the kerb is on the -v side, heading +v it's on the +u side.
const LANES: Lane[] = [
  lane("u", 1, -1.4), lane("u", 1, -4.1), lane("u", -1, 1.4), lane("u", -1, 4.1),
  lane("v", 1, 1.4), lane("v", 1, 4.1), lane("v", -1, -1.4), lane("v", -1, -4.1),
];

/** A point `s` along a lane, in the world. */
const laneAt = (l: Lane, s: number): [number, number] => (l.axis === "u" ? W(l.dir * s, l.off) : W(l.off, l.dir * s));
/** A world point in a lane's terms: distance along it and offset from its middle. */
const laneOf = (l: Lane, x: number, z: number): [number, number] => {
  const [u, v] = UV(x, z);
  return l.axis === "u" ? [l.dir * u, v - l.off] : [l.dir * v, u - l.off];
};

/** The junction's traffic. While Bowat's clouds hang about it's a jam: cars stopped wherever they
 * were, hazards blinking, the odd honk. Once the air is clear the lights run their cycle, ending each
 * round with the all-way scramble for pedestrians (or stay on "walk" while Bowat still sits in the
 * middle). Cars always stop for Qish. Returns the current signal and the cars' positions so Qish
 * can't walk through them. */
export function traffic(o: { jam: () => boolean; bowatHere: () => boolean; player: () => THREE.Vector3 }): Anim & { light: () => Light; walkLeft: () => number; solid: () => readonly THREE.Vector3[] } {
  const group = new THREE.Group();
  const r = rng(42);
  const COLORS = [0xf4f1ea, 0x2a2730, 0x9aa0aa, 0x3b6fe0, 0xc8322a, 0x2f8a5a, 0xd9d4c8, 0x6b5a8a];
  type Car = { g: THREE.Group; len: number; lane: Lane; s: number; v: number; hazard: THREE.Mesh[]; respawn: number };
  const cars: Car[] = [];
  const hazardMat = new THREE.MeshBasicMaterial({ color: 0xffa020, toneMapped: false });
  const hazardOff = flat(0x8a5a20);
  LANES.forEach((lane, li) => {
    const n = 3;
    for (let i = 0; i < n; i++) {
      // Buses on the kerb lanes of Jalan Bukit Bintang.
      const kind = lane.group === "ew" && Math.abs(lane.off) > 3 && i === 1 ? 0 : 1 + ((li * 7 + i * 3) % 8);
      const raw = kind === 0 ? bus() : kind < 3 ? cab() : car(COLORS[(li * 5 + i) % COLORS.length], kind % 2 === 0);
      const m = { g: mergeStatic(raw.g), len: raw.len };
      m.g.traverse((o) => (o.castShadow = (o as THREE.Mesh).isMesh));
      group.add(m.g);
      cars.push({ g: m.g, len: m.len, lane, s: 0, v: 0, hazard: [], respawn: 0 });
    }
  });
  // Jam positions: half of each lane queued up to its stop line, half already through the junction,
  // none on the crossings.
  const jamLayout = () => {
    for (const lane of LANES) {
      const mine = cars.filter((c) => c.lane === lane);
      const before = Math.ceil(mine.length / 2);
      let edge = -STOP - 0.4;
      mine.slice(0, before).forEach((c) => {
        c.s = edge - c.len / 2;
        edge = c.s - c.len / 2 - 1.4 - r() * 2.2;
      });
      edge = STOP + 2.5;
      mine.slice(before).forEach((c) => {
        c.s = edge + c.len / 2;
        edge = c.s + c.len / 2 + 1.6 + r() * 3;
      });
      mine.forEach((c) => (c.v = 0));
    }
  };
  jamLayout();

  // Signal heads on each corner: car lights facing the approach, a walking-man light for the crossing.
  const lamp = (c: number) => new THREE.MeshBasicMaterial({ color: c, toneMapped: false });
  const dim = (c: number) => new THREE.MeshLambertMaterial({ color: new THREE.Color(c).multiplyScalar(0.25) });
  const heads: { group: "ew" | "ns"; red: THREE.Mesh; amber: THREE.Mesh; green: THREE.Mesh; man: THREE.Mesh }[] = [];
  const pole = flat(0x3a3f4a);
  const signals = new THREE.Group();
  signals.rotation.y = ROT;
  group.add(signals);
  const C = ROAD + 0.8;
  // Three corners only: a pole on the bottom corner would stand in the middle of the photo-spot view.
  for (const [cx, cz, grp, ry] of [[-C, -C, "ns", 0], [C, -C, "ew", -Math.PI / 2], [-C, C, "ew", Math.PI / 2]] as const) {
    const g = new THREE.Group();
    g.add(box(0.18, 4.4, 0.18, pole, 0, 2.2, 0));
    g.add(box(0.5, 1.4, 0.4, flat(0x2a2730), 0, 3.9, 0.3));
    const red = mesh(new THREE.CircleGeometry(0.15, 12), dim(0xff3020), 0, 4.3, 0.51);
    const amber = mesh(new THREE.CircleGeometry(0.15, 12), dim(0xffb020), 0, 3.9, 0.51);
    const green = mesh(new THREE.CircleGeometry(0.15, 12), dim(0x30e070), 0, 3.5, 0.51);
    g.add(red, amber, green);
    g.add(box(0.42, 0.5, 0.3, flat(0x2a2730), 0, 2.6, -0.25));
    const man = mesh(new THREE.PlaneGeometry(0.3, 0.38), dim(0x30e070), 0, 2.6, -0.41);
    man.rotation.y = Math.PI;
    g.add(man);
    g.position.set(cx, 0, cz);
    g.rotation.y = ry;
    signals.add(shadowed(g));
    heads.push({ group: grp, red, amber, green, man });
  }
  const ON = { red: lamp(0xff3020), amber: lamp(0xffb020), green: lamp(0x30e070) };
  const OFF = { red: dim(0xff3020), amber: dim(0xffb020), green: dim(0x30e070) };

  const CYCLE: [Light, number][] = [["ew", 8], ["ewAmber", 1.6], ["red", 1], ["ns", 8], ["nsAmber", 1.6], ["red", 1], ["walk", 10], ["walkEnd", 1.4]];
  let ci = 6;
  let left = CYCLE[ci][1];
  let light: Light = "walk";
  let wasJam = o.jam();
  let honk = 3;
  let chirp = 0;
  const tick = ticker();
  const solid: THREE.Vector3[] = cars.flatMap(() => [new THREE.Vector3(), new THREE.Vector3()]);
  const update = (t: number) => {
    const dt = tick(t);
    const jam = o.jam();
    if (jam) light = "red";
    else if (o.bowatHere()) {
      light = "walk";
      left = 99;
    } else {
      if (wasJam) {
        ci = 6;
        left = CYCLE[ci][1];
      }
      left -= dt;
      if (left <= 0) {
        ci = (ci + 1) % CYCLE.length;
        left = CYCLE[ci][1];
      }
      light = CYCLE[ci][0];
    }
    if (wasJam && !jam) cars.forEach((c) => c.hazard.forEach((h) => (h.material = hazardOff)));
    wasJam = jam;
    for (const h of heads) {
      const go = light === h.group;
      const amber = light === `${h.group}Amber`;
      h.green.material = go ? ON.green : OFF.green;
      h.amber.material = amber || (jam && Math.floor(t * 2) % 2 === 0) ? ON.amber : OFF.amber;
      h.red.material = !go && !amber && !jam ? ON.red : OFF.red;
      h.man.material = light === "walk" || (light === "walkEnd" && Math.floor(t * 4) % 2 === 0) ? ON.green : OFF.red;
    }
    if (light === "walk" && !jam) {
      chirp -= dt;
      if (chirp <= 0) {
        chirp = 0.6;
        const p = o.player();
        if (Math.hypot(p.x, p.z) < 18) sfx.chirp();
      }
    }

    const p = o.player();
    for (const lane of LANES) {
      const mine = cars.filter((c) => c.lane === lane).sort((a, b) => b.s - a.s);
      mine.forEach((c, i) => {
        if (jam) {
          c.v = 0;
          const blink = Math.floor(t * 2.2) % 2 === 0;
          c.hazard.forEach((h) => (h.material = blink ? hazardMat : hazardOff));
        } else {
          let limit = 9;
          // Car ahead.
          const ahead = mine[i - 1];
          if (ahead) limit = Math.min(limit, (ahead.s - ahead.len / 2 - (c.s + c.len / 2) - 1.4) * 1.6);
          // Red light: stop at the line unless already over it.
          const front = c.s + c.len / 2;
          const green = light === lane.group || (light === `${lane.group}Amber` && front > -STOP - 3);
          if (!green && front < -STOP + 0.2) limit = Math.min(limit, (-STOP - 0.3 - front) * 1.8);
          // Qish in the lane ahead.
          const [ps, side] = laneOf(lane, p.x, p.z);
          const along = ps - c.s;
          if (Math.abs(side) < 1.5 && along > 0 && along < c.len / 2 + 5) limit = Math.min(limit, (along - c.len / 2 - 1.2) * 1.5);
          const target = Math.max(0, limit);
          c.v += (target - c.v) * Math.min(1, dt * (target < c.v ? 6 : 1.4));
          c.s += c.v * dt;
          if (c.s - c.len / 2 > lane.s1) {
            // Off the end: round to the back of the queue.
            const last = mine[mine.length - 1];
            c.s = Math.min(lane.s0, last.s - last.len - 3 - r() * 8);
            c.v = 6;
          }
        }
        const [x, z] = laneAt(lane, c.s);
        c.g.position.set(x, 0, z);
        c.g.rotation.y = lane.rot;
      });
    }
    cars.forEach((c, i) => {
      const [x, z] = laneAt(c.lane, c.s - c.len / 4);
      const [x2, z2] = laneAt(c.lane, c.s + c.len / 4);
      solid[i * 2].set(x, 0, z);
      solid[i * 2 + 1].set(x2, 0, z2);
    });
    if (jam) {
      honk -= dt;
      if (honk <= 0) {
        honk = 2.5 + r() * 5;
        if (Math.hypot(p.x, p.z) < 24) sfx.honk();
      }
    }
  };
  return { group, update, light: () => light, walkLeft: () => (light === "walk" ? left : 0), solid: () => solid };
}

// ---------------------------------------------------------------- Fart clouds

/** One puff of Bowat cloud, doodle style: dark green outline, lime fill, a pale highlight. */
const puffTex = once(() => {
  const t = canvasTexture(128, 128, (c) => {
    const puffs: [number, number, number][] = [[64, 70, 34], [38, 78, 24], [90, 78, 24], [62, 44, 26], [86, 54, 18], [42, 52, 18]];
    c.fillStyle = "#3f6b1c";
    for (const [x, y, r] of puffs) {
      c.beginPath();
      c.arc(x, y, r + 5, 0, Math.PI * 2);
      c.fill();
    }
    c.fillStyle = "#a6d65a";
    for (const [x, y, r] of puffs) {
      c.beginPath();
      c.arc(x, y, r, 0, Math.PI * 2);
      c.fill();
    }
    c.fillStyle = "#d6f29a";
    c.beginPath();
    c.ellipse(50, 50, 13, 9, -0.5, 0, Math.PI * 2);
    c.fill();
  });
  t.userData.shared = true;
  return t;
});

const squiggleTex = once(() => {
  const t = canvasTexture(32, 96, (c) => {
    c.strokeStyle = "#4f8a22";
    c.lineWidth = 6;
    c.lineCap = "round";
    c.beginPath();
    c.moveTo(16, 92);
    c.quadraticCurveTo(30, 76, 16, 60);
    c.quadraticCurveTo(2, 44, 16, 28);
    c.quadraticCurveTo(30, 14, 16, 4);
    c.stroke();
  });
  t.userData.shared = true;
  return t;
});

const MIST = once(() => {
  const t = radial("rgba(255,214,236,1)", "rgba(255,214,236,0)");
  t.userData.shared = true;
  return t;
});
const HAZE = once(() => {
  const t = radial("rgba(150,200,70,.55)", "rgba(150,200,70,0)", 128);
  t.userData.shared = true;
  return t;
});

/** A big fart cloud Qish walks into with the spray: a swirling heap of puffs over a green haze, stink
 * squiggles rising, a couple of flies. Popping it bursts into pink lily-scented mist. */
export function fartCloud(seed: number, size = 1): Pickup {
  const group = new THREE.Group();
  const r = rng(seed * 17 + 3);
  const hazeMat = new THREE.MeshBasicMaterial({ map: HAZE(), transparent: true, depthWrite: false });
  const haze = mesh(new THREE.PlaneGeometry(6 * size, 6 * size), hazeMat, 0, 0.08, 0);
  haze.rotation.x = -Math.PI / 2;
  group.add(haze);
  const puffs = Array.from({ length: 7 }, (_, i) => {
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: puffTex(), transparent: true, depthWrite: false }));
    const a = (i / 7) * Math.PI * 2 + r();
    const rad = (i < 2 ? 0.3 : 1.0 + r() * 0.5) * size;
    const base = { a, rad, y: (0.7 + r() * 1.9) * size, sz: (1.2 + r() * 0.9) * size, sp: 0.2 + r() * 0.35, ph: r() * 6 };
    s.scale.setScalar(base.sz);
    group.add(s);
    return { s, ...base };
  });
  const squiggles = Array.from({ length: 3 }, (_, i) => {
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: squiggleTex(), transparent: true, depthWrite: false }));
    s.scale.set(0.35, 1.0, 1);
    group.add(s);
    return { s, ph: i / 3, x: (r() - 0.5) * 1.8 * size };
  });
  const flies = Array.from({ length: 3 }, () => {
    const f = mesh(new THREE.SphereGeometry(0.06,20,14), new THREE.MeshBasicMaterial({ color: 0x17151f }));
    group.add(f);
    return { f, ph: r() * 6, rad: 0.9 + r() * 0.6 };
  });
  const mist = Array.from({ length: 12 }, () => {
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: MIST(), transparent: true, depthWrite: false }));
    s.visible = false;
    group.add(s);
    return { s, dir: new THREE.Vector3(r() - 0.5, 0.4 + r() * 0.6, r() - 0.5).normalize() };
  });
  let popped = -1;
  let popAt = 0;
  const update = (t: number) => {
    if (popped >= 0) {
      if (popped === 0) popAt = t;
      popped = 1;
      const k = Math.min(1, (t - popAt) / 1.1);
      for (const p of puffs) {
        p.s.material.opacity = 1 - k;
        p.s.scale.setScalar(p.sz * (1 + k * 0.8));
        p.s.position.y += 0.03;
      }
      hazeMat.opacity = 1 - k;
      squiggles.forEach((q) => (q.s.visible = false));
      flies.forEach((f) => (f.f.visible = false));
      mist.forEach((m, i) => {
        m.s.visible = true;
        m.s.position.copy(m.dir).multiplyScalar(0.3 + k * 3.2 * size).add(new THREE.Vector3(0, 1.2, 0));
        m.s.scale.setScalar((0.8 + k * 1.6) * size);
        m.s.material.opacity = (1 - k) * (i % 2 ? 0.9 : 0.6);
      });
      if (k >= 1) group.visible = false;
      return;
    }
    for (const p of puffs) {
      const a = p.a + t * p.sp;
      p.s.position.set(Math.cos(a) * p.rad, p.y + Math.sin(t * 1.3 + p.ph) * 0.15, Math.sin(a) * p.rad * 0.7);
      p.s.scale.setScalar(p.sz * (1 + Math.sin(t * 1.7 + p.ph) * 0.06));
      p.s.material.rotation = Math.sin(t * 0.6 + p.ph) * 0.2;
    }
    for (const q of squiggles) {
      const k = (t * 0.45 + q.ph) % 1;
      q.s.position.set(q.x + Math.sin(t * 2 + q.ph * 6) * 0.15, (2.4 + k * 1.8) * size, 0.2);
      q.s.material.opacity = Math.sin(k * Math.PI);
    }
    for (const f of flies) f.f.position.set(Math.cos(t * 5 + f.ph) * f.rad, 2.0 * size + Math.sin(t * 7 + f.ph) * 0.4, Math.sin(t * 4 + f.ph) * f.rad);
  };
  return {
    group,
    update,
    pop() {
      popped = 0;
    },
  };
}

/** The thick ring of cloud round Bowat in the middle of the scramble: as dense as the clouds still
 * out there, gone once they're all sprayed. Bowat keeps letting off little puffs while it lasts. */
export function bowatHaze(x: number, z: number, left: () => number, player: () => THREE.Vector3): Anim {
  const group = new THREE.Group();
  const ring = Array.from({ length: 12 }, (_, i) => {
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: puffTex(), transparent: true, depthWrite: false }));
    group.add(s);
    return { s, a: (i / 12) * Math.PI * 2, y: 0.5 + (i % 3) * 0.7, sz: 1.3 + (i % 4) * 0.25 };
  });
  const groundMat = new THREE.MeshBasicMaterial({ map: HAZE(), transparent: true, depthWrite: false });
  const ground = mesh(new THREE.PlaneGeometry(8, 8), groundMat, 0, 0.07, 0);
  ground.rotation.x = -Math.PI / 2;
  group.add(ground);
  const small = Array.from({ length: 6 }, () => {
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: puffTex(), transparent: true, depthWrite: false }));
    s.visible = false;
    group.add(s);
    return { s, born: -9, dir: 0 };
  });
  const protTex = canvasTexture(192, 80, (c) => {
    c.font = "bold 54px 'Bagel Fat One', sans-serif";
    c.textAlign = "center";
    c.textBaseline = "middle";
    c.lineWidth = 10;
    c.strokeStyle = INK;
    c.strokeText("PROT!", 96, 42);
    c.fillStyle = "#c6f26b";
    c.fillText("PROT!", 96, 42);
  });
  const prot = new THREE.Sprite(new THREE.SpriteMaterial({ map: protTex, transparent: true, depthTest: false }));
  prot.scale.set(1.9, 0.8, 1);
  prot.renderOrder = 6;
  prot.visible = false;
  group.add(prot);
  group.position.set(x, 0, z);
  let next = 2;
  let protAt = -9;
  let shown = left();
  const update = (t: number) => {
    const n = left();
    shown += (n - shown) * 0.05;
    const k = Math.min(1, shown / 6);
    group.visible = shown > 0.02;
    if (!group.visible) return;
    ring.forEach((p, i) => {
      const a = p.a + t * 0.25;
      const rad = 2.3 + Math.sin(t * 1.1 + i) * 0.15;
      p.s.position.set(Math.cos(a) * rad, p.y + Math.sin(t * 1.4 + i) * 0.12, Math.sin(a) * rad * 0.8);
      p.s.scale.setScalar(p.sz * (0.5 + k * 0.5));
      p.s.material.opacity = Math.min(1, k * 1.3);
    });
    groundMat.opacity = k;
    if (t > next && n > 0) {
      next = t + 3.5 + Math.random() * 2;
      protAt = t;
      const p = player();
      if (Math.hypot(p.x - x, p.z - z) < 16) sfx.prot();
      small.forEach((q, i) => {
        q.born = t;
        q.dir = (i / small.length) * Math.PI * 2 + Math.random();
      });
    }
    const pk = (t - protAt) / 1.2;
    prot.visible = pk < 1;
    if (prot.visible) {
      prot.position.set(0.6, 2.6 + pk * 0.8, 0);
      prot.material.opacity = 1 - pk;
    }
    for (const q of small) {
      const a = (t - q.born) / 2.2;
      q.s.visible = a < 1;
      if (!q.s.visible) continue;
      q.s.position.set(Math.cos(q.dir) * (0.4 + a * 3), 0.6 + a * 0.6, Math.sin(q.dir) * (0.4 + a * 3) * 0.8);
      q.s.scale.setScalar(0.5 + a * 0.6);
      q.s.material.opacity = 1 - a;
    }
  };
  return { group, update };
}

// ---------------------------------------------------------------- Street props

/** The shawarma counter: a steel counter, the vertical spit turning in front of its glowing grill,
 * a stack of wraps and a little smoke. */
export function shawarmaStand(x: number, z: number): Anim {
  const group = new THREE.Group();
  const steel = paintedMat("plaster", 3.2, 1.1, 1.4, 0xc9ccd2);
  group.add(box(3.2, 1.05, 0.9, steel, 0, 0.52, 0));
  group.add(box(3.3, 0.08, 1.0, flat(0xe8eaee), 0, 1.08, 0));
  const grill = new THREE.MeshBasicMaterial({ color: 0xff7a2a, toneMapped: false });
  group.add(box(0.9, 1.5, 0.12, grill, -0.7, 1.9, -0.32));
  group.add(box(1.0, 1.6, 0.1, steel, -0.7, 1.9, -0.4));
  // The meat cone, wider at the top, browned.
  const cone = new THREE.Group();
  const meatTex = canvasTexture(64, 64, (c) => {
    c.fillStyle = "#a05a2a";
    c.fillRect(0, 0, 64, 64);
    for (let i = 0; i < 80; i++) {
      c.fillStyle = Math.random() < 0.5 ? "#7a3a14" : "#c9844a";
      c.fillRect(Math.random() * 64, Math.random() * 64, 6, 3);
    }
  });
  cone.add(mesh(new THREE.CylinderGeometry(0.34, 0.2, 1.2, 28), new THREE.MeshLambertMaterial({ map: meatTex }), 0, 0, 0));
  cone.add(mesh(new THREE.CylinderGeometry(0.03, 0.03, 1.8, 6), steel, 0, 0.1, 0));
  cone.position.set(-0.7, 1.85, -0.05);
  group.add(cone);
  // Wraps in a basket, a sauce bottle.
  group.add(box(0.7, 0.18, 0.4, flat(0xd9a860), 0.7, 1.2, 0.1));
  for (let i = 0; i < 4; i++) group.add(mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.45, 8), flat(0xf3e2b8), 0.45 + i * 0.16, 1.3, 0.1).rotateZ(Math.PI / 2));
  group.add(mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.3, 8), flat(0xe3350d), 1.3, 1.27, 0.15));
  const smokeTex = radial("rgba(230,226,220,.6)", "rgba(230,226,220,0)");
  const smoke = Array.from({ length: 5 }, (_, i) => {
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: smokeTex, transparent: true, depthWrite: false }));
    group.add(s);
    return { s, ph: i / 5 };
  });
  group.position.set(x, 0, z);
  shadowed(group);
  return {
    group,
    update(t) {
      cone.rotation.y = t * 0.8;
      for (const p of smoke) {
        const k = (t * 0.35 + p.ph) % 1;
        p.s.position.set(-0.7 + Math.sin(t + p.ph * 6) * 0.2, 2.6 + k * 2.2, -0.2);
        p.s.scale.setScalar(0.5 + k * 1.2);
        p.s.material.opacity = Math.sin(k * Math.PI) * 0.7;
      }
    },
  };
}

/** A small burger kiosk with a hot plate and a tin sign. */
export function burgerKiosk(x: number, z: number): Anim {
  const group = new THREE.Group();
  const generated = model("bb_burger", 3.2);
  if (generated) {
    group.add(generated);
    const smokeTex = radial("rgba(230,226,220,.5)", "rgba(230,226,220,0)");
    const smoke = Array.from({ length: 4 }, (_, i) => {
      const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: smokeTex, transparent: true, depthWrite: false }));
      group.add(s);
      return { s, ph: i / 4 };
    });
    group.position.set(x, 0, z);
    return {
      group,
      update(t) {
        for (const p of smoke) {
          const k = (t * 0.4 + p.ph) % 1;
          p.s.position.set(-0.3 + Math.sin(t + p.ph * 6) * 0.2, 1.4 + k * 1.8, 0);
          p.s.scale.setScalar(0.4 + k);
          p.s.material.opacity = Math.sin(k * Math.PI) * 0.6;
        }
      },
    };
  }
  group.add(box(2.4, 1.0, 1.4, flat(0xe3350d), 0, 0.5, 0));
  group.add(box(2.5, 0.08, 1.5, flat(0xc9ccd2), 0, 1.04, 0));
  group.add(box(1.0, 0.08, 0.7, flat(0x2a2a30), -0.4, 1.12, 0));
  for (const dx of [-1.15, 1.15]) group.add(box(0.08, 1.6, 0.08, flat(0x55555e), dx, 1.85, -0.6));
  const sign = canvasTexture(256, 72, (c) => {
    c.fillStyle = "#ffcb05";
    c.fillRect(0, 0, 256, 72);
    c.fillStyle = "#e3350d";
    c.font = "bold 46px 'Bagel Fat One', sans-serif";
    c.textAlign = "center";
    c.textBaseline = "middle";
    c.fillText("BURGER", 128, 40);
  });
  group.add(mesh(roundedBox(2.5, 0.7, 0.1), [flat(0xffcb05), flat(0xffcb05), flat(0xffcb05), flat(0xffcb05), glow(sign), flat(0xffcb05)], 0, 2.85, -0.6));
  const patties = [0, 1, 2].map((i) => {
    const p = mesh(new THREE.CylinderGeometry(0.13, 0.13, 0.05, 10), flat(0x6a3a1a), -0.7 + i * 0.3, 1.19, 0);
    group.add(p);
    return p;
  });
  const smokeTex = radial("rgba(230,226,220,.5)", "rgba(230,226,220,0)");
  const smoke = Array.from({ length: 4 }, (_, i) => {
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: smokeTex, transparent: true, depthWrite: false }));
    group.add(s);
    return { s, ph: i / 4 };
  });
  group.position.set(x, 0, z);
  shadowed(group);
  return {
    group,
    update(t) {
      patties.forEach((p, i) => (p.position.y = 1.19 + Math.max(0, Math.sin(t * 2 + i * 2)) * 0.12));
      for (const p of smoke) {
        const k = (t * 0.4 + p.ph) % 1;
        p.s.position.set(-0.4 + Math.sin(t + p.ph * 6) * 0.2, 1.4 + k * 1.8, 0);
        p.s.scale.setScalar(0.4 + k);
        p.s.material.opacity = Math.sin(k * Math.PI) * 0.6;
      }
    },
  };
}

/** A giant vinyl record spinning on the shop roof, leaning towards the street, with a tone arm. */
export function roofRecord(x: number, y: number, z: number, r: number): Anim {
  const group = new THREE.Group();
  const tex = canvasTexture(256, 256, (c) => drawVinyl(c, 128, 128, 126, 0, "#ff8fb1"));
  const labelTex = canvasTexture(128, 128, (c) => {
    c.fillStyle = "#ff8fb1";
    c.beginPath();
    c.arc(64, 64, 62, 0, Math.PI * 2);
    c.fill();
    c.fillStyle = INK;
    c.font = "bold 22px 'Bagel Fat One', sans-serif";
    c.textAlign = "center";
    c.textBaseline = "middle";
    c.fillText("PIRING", 64, 48);
    c.fillText("HITAM", 64, 74);
  });
  const disc = new THREE.Group();
  disc.add(mesh(new THREE.CircleGeometry(r, 48), new THREE.MeshLambertMaterial({ map: tex })));
  disc.add(mesh(new THREE.CircleGeometry(r * 0.31, 32), new THREE.MeshLambertMaterial({ map: labelTex }), 0, 0, 0.02));
  disc.add(mesh(new THREE.CylinderGeometry(r, r, 0.08, 48), flat(0x141218), 0, 0, -0.05).rotateX(Math.PI / 2));
  const tilt = new THREE.Group();
  tilt.rotation.x = -0.75;
  tilt.add(disc);
  // Tone arm resting on the record.
  tilt.add(rod(v3(r * 0.95, r * 0.9, 0.2), v3(r * 0.35, -r * 0.2, 0.2), 0.08, flat(0xc9ccd2)));
  tilt.add(mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.3, 10), flat(0x55555e), r * 0.95, r * 0.9, 0.15).rotateX(Math.PI / 2));
  group.add(tilt);
  group.add(box(0.3, r * 0.9, 0.3, flat(0x2a2730), 0, -r * 0.55, -0.6));
  group.position.set(x, y + r, z);
  return { group, update: (t) => (disc.rotation.z = -t * 1.6) };
}

/** Crates of records outside the vinyl shop, sleeves in every colour. */
export function recordCrates(x: number, z: number, n = 3) {
  const g = new THREE.Group();
  const r = rng(Math.round(x * 10));
  for (let i = 0; i < n; i++) {
    const cx = (i - (n - 1) / 2) * 1.0;
    g.add(box(0.85, 0.5, 0.7, flat(0xc9a060), cx, 0.65, 0));
    g.add(box(0.95, 0.4, 0.8, flat(0x6b4f2a), cx, 0.2, 0));
    for (let k = 0; k < 6; k++) {
      const sleeve = box(0.7, 0.62, 0.03, flat([0xff8fb1, 0x3b6fe0, 0xffcb05, 0x2a2730, 0x3fae5a, 0xf6a04b, 0x9b6ad6][Math.floor(r() * 7)]), cx, 0.95, -0.25 + k * 0.09);
      sleeve.rotation.x = -0.25;
      g.add(sleeve);
    }
  }
  g.position.set(x, 0, z);
  return shadowed(g);
}

/** The busker's corner: a little amp, a mic stand, an open guitar case with coins, a chalk sign. */
export function buskerSpot(x: number, z: number) {
  const g = new THREE.Group();
  g.add(box(0.7, 0.8, 0.45, flat(0x2a2730), -1.4, 0.4, -0.3));
  g.add(box(0.55, 0.55, 0.02, flat(0x55555e), -1.4, 0.45, -0.06));
  g.add(rod(v3(1.3, 0, 0.2), v3(1.3, 1.5, 0.2), 0.03, flat(0x9aa0aa)));
  g.add(mesh(new THREE.SphereGeometry(0.08,20,14), flat(0x55555e), 1.3, 1.55, 0.2));
  const caseG = new THREE.Group();
  caseG.add(box(1.2, 0.12, 0.5, flat(0x2a2730), 0, 0.06, 0));
  caseG.add(box(1.1, 0.04, 0.42, flat(0xa8323e), 0, 0.12, 0));
  for (let i = 0; i < 7; i++) caseG.add(mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.02, 8), flat(0xd9b84a), -0.4 + (i % 4) * 0.25, 0.15, -0.1 + Math.floor(i / 4) * 0.18));
  caseG.position.set(0.1, 0, 1.2);
  g.add(caseG);
  const sign = canvasTexture(256, 160, (c) => {
    c.fillStyle = "#2a2f2a";
    c.fillRect(0, 0, 256, 160);
    c.fillStyle = "#fffdf6";
    c.font = "bold 34px 'Gaegu', sans-serif";
    c.textAlign = "center";
    c.fillText("BUSKER BINTANG", 128, 50);
    c.font = "bold 28px 'Gaegu', sans-serif";
    c.fillText("request lagu RM1 ♪", 128, 98);
    c.fillText("terima kasih!", 128, 138);
  });
  const board = box(0.9, 0.6, 0.05, new THREE.MeshLambertMaterial({ map: sign }), 1.0, 0.55, 1.4);
  board.rotation.x = -0.35;
  g.add(board);
  g.position.set(x, 0, z);
  return shadowed(g);
}

/** Where a family sleeps rough by a shuttered shop: flattened cardboard, a rolled mat, bags of their
 * things, a cup. */
export function cardboardCamp(x: number, z: number) {
  const g = new THREE.Group();
  const cardTex = canvasTexture(128, 64, (c) => {
    c.fillStyle = "#c9a26a";
    c.fillRect(0, 0, 128, 64);
    c.strokeStyle = "rgba(90,60,30,.4)";
    c.lineWidth = 3;
    c.strokeRect(4, 4, 56, 56);
    c.strokeRect(66, 4, 58, 56);
    c.fillStyle = "rgba(90,60,30,.35)";
    c.font = "bold 14px sans-serif";
    c.fillText("THIS SIDE UP", 70, 36);
  });
  const card = mesh(roundedBox(3.6, 0.04, 1.8), new THREE.MeshLambertMaterial({ map: cardTex }), 0, 0.03, 0);
  card.rotation.y = 0.04;
  g.add(card);
  g.add(mesh(new THREE.CylinderGeometry(0.22, 0.22, 1.4, 10), flat(0x7a5cb8), -1.6, 0.25, -0.75).rotateZ(Math.PI / 2));
  g.add(mesh(new THREE.SphereGeometry(0.38,20,14), flat(0xf2f0ea), 1.55, 0.3, -0.6));
  g.add(mesh(new THREE.SphereGeometry(0.3,20,14), flat(0x3b6fe0), 1.95, 0.24, -0.35));
  g.add(mesh(new THREE.CylinderGeometry(0.08, 0.06, 0.16, 8), flat(0xfffdf6), 1.2, 0.1, 0.7));
  g.position.set(x, 0, z);
  return shadowed(g);
}

/** Bukit Bintang lamp post with a pair of hanging banners: "BANDAR MUZIK". */
export function bannerLamp(x: number, z: number, i: number) {
  const g = new THREE.Group();
  const black = flat(0x26262c);
  const generated = model("bb_banner_lamp", 5.2, "height");
  if (generated) g.add(generated);
  else {
    g.add(box(0.16, 5.2, 0.16, black, 0, 2.6, 0));
    g.add(box(1.4, 0.1, 0.1, black, 0.55, 5.1, 0));
    g.add(mesh(new THREE.CylinderGeometry(0.18, 0.3, 0.3, 10), black, 1.2, 4.95, 0));
    g.add(mesh(new THREE.SphereGeometry(0.16,20,14), new THREE.MeshBasicMaterial({ color: 0xffe8b0, toneMapped: false }), 1.2, 4.78, 0));
  }
  const tex = canvasTexture(96, 256, (c) => {
    c.fillStyle = i % 2 ? "#ff5c93" : "#3b6fe0";
    c.fillRect(0, 0, 96, 256);
    c.fillStyle = "#fffdf6";
    c.font = "bold 44px 'Bagel Fat One', sans-serif";
    c.textAlign = "center";
    c.fillText("♪", 48, 60);
    c.font = "bold 22px 'Bagel Fat One', sans-serif";
    c.fillText("BANDAR", 48, 130);
    c.fillText("MUZIK", 48, 160);
    c.font = "bold 16px 'Gaegu', sans-serif";
    c.fillText("Bukit Bintang", 48, 210);
  });
  const ban = mesh(new THREE.PlaneGeometry(0.62, 1.6), new THREE.MeshLambertMaterial({ map: tex, side: THREE.DoubleSide }), -0.42, 3.6, 0.02);
  g.add(ban);
  g.add(box(0.8, 0.05, 0.05, black, -0.4, 4.42, 0));
  g.position.set(x, 0, z);
  return shadowed(g);
}

/** A street tree in a round granite planter. */
export function planterTree(x: number, z: number, seed: number) {
  const generated = model("bb_tree", 4.7, "height");
  if (generated) {
    generated.position.set(x, 0, z);
    return generated;
  }
  const g = new THREE.Group();
  const r = rng(seed);
  g.add(mesh(new THREE.CylinderGeometry(0.95, 1.0, 0.55, 14), flat(0xbab4aa), 0, 0.28, 0));
  g.add(mesh(new THREE.CylinderGeometry(0.85, 0.85, 0.04, 14), flat(0x5a4632), 0, 0.56, 0));
  g.add(mesh(new THREE.CylinderGeometry(0.12, 0.18, 2.6, 7), flat(0x6b4f2a), 0, 1.8, 0));
  for (let i = 0; i < 4; i++) {
    const s = 0.9 + r() * 0.5;
    g.add(mesh(new THREE.SphereGeometry(s, 24, 16), flat([0x3f8a3a, 0x4f9a3a, 0x5aa040][i % 3]), (r() - 0.5) * 1.2, 3.2 + r() * 0.9, (r() - 0.5) * 1.0));
  }
  g.position.set(x, 0, z);
  return shadowed(g);
}

/** A green road-name sign on a pole. */
export function streetSign(x: number, z: number, text: string, rotY = 0) {
  const g = new THREE.Group();
  g.add(box(0.1, 2.8, 0.1, flat(0x9aa0aa), 0, 1.4, 0));
  const tex = canvasTexture(320, 64, (c) => {
    c.fillStyle = "#1f6a3a";
    c.fillRect(0, 0, 320, 64);
    c.strokeStyle = "#fffdf6";
    c.lineWidth = 4;
    c.strokeRect(4, 4, 312, 56);
    c.fillStyle = "#fffdf6";
    c.font = "bold 32px sans-serif";
    c.textAlign = "center";
    c.textBaseline = "middle";
    c.fillText(text, 160, 34);
  });
  const plate = mesh(roundedBox(1.9, 0.38, 0.04), [flat(0x1f6a3a), flat(0x1f6a3a), flat(0x1f6a3a), flat(0x1f6a3a), new THREE.MeshLambertMaterial({ map: tex }), new THREE.MeshLambertMaterial({ map: tex })], 0, 2.7, 0);
  plate.rotation.y = rotY;
  g.add(plate);
  g.position.set(x, 0, z);
  return shadowed(g);
}

/** Steel bollards along a kerb. */
export function bollards(points: [number, number][]) {
  const g = new THREE.Group();
  const mat = flat(0x3a3f4a);
  for (const [x, z] of points) {
    g.add(mesh(new THREE.CylinderGeometry(0.11, 0.13, 0.8, 8), mat, x, 0.4, z));
    g.add(mesh(new THREE.CylinderGeometry(0.14, 0.14, 0.06, 8), flat(0xf4c430), x, 0.7, z));
  }
  return shadowed(g);
}

/** Music notes floating up from a spot while `on()` (busker playing, a shop's speaker). */
export function musicNotes(x: number, y: number, z: number, on: () => boolean, n = 5): Anim {
  const group = new THREE.Group();
  const notes = ["♪", "♫", "♬"].map((ch, i) =>
    canvasTexture(64, 64, (c) => {
      c.font = "bold 50px sans-serif";
      c.textAlign = "center";
      c.textBaseline = "middle";
      c.lineWidth = 6;
      c.strokeStyle = "#fffdf6";
      c.strokeText(ch, 32, 34);
      c.fillStyle = ["#ff5c93", "#3b6fe0", "#9b6ad6"][i];
      c.fillText(ch, 32, 34);
    }),
  );
  const list = Array.from({ length: n }, (_, i) => {
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: notes[i % 3], transparent: true, depthWrite: false }));
    s.scale.setScalar(0.5);
    group.add(s);
    return { s, ph: i / n, dx: (Math.random() - 0.5) * 1.6 };
  });
  group.position.set(x, y, z);
  return {
    group,
    update(t) {
      const show = on();
      for (const q of list) {
        q.s.visible = show;
        if (!show) continue;
        const k = (t * 0.3 + q.ph) % 1;
        q.s.position.set(q.dx + Math.sin(t * 2 + q.ph * 9) * 0.3, k * 2.4, 0);
        q.s.material.opacity = Math.sin(k * Math.PI);
      }
    },
  };
}

// ---------------------------------------------------------------- The crowd

const PANIC_BARK = ["BUSUKNYA!!", "Siapa kentut?!", "Lari!!", "Tak tahan!!", "Mak aiii!", "Hidung saya!!", "Bau apa ni?!", "Tolong!!", "Uhuk uhuk!", "Ya Allah..."];
const CALM_BARK = ["Jom shawarma!", "Cantiknya skrin tu", "Monorel dah sampai", "Sale kat Bintang Walk!", "Lagu ni best", "Wangi bau lily...", "Tadi siapa kentut eh?", "Selfie jap!", "Jom karaoke!", "Laparnya..."];
const WHIFF_BARK = ["Eee bau apa ni", "Uhuk...", "Busuk sikit area ni"];
const PASS_BARK = ["Tumpang lalu~", "Sorry!", "Excuse me!"];

/** Which corner's side of the junction a point is on: top, right, bottom, left (as CORNERS). */
const quadrant = (x: number, z: number) => (Math.abs(x) > Math.abs(z) ? (x > 0 ? 1 : 3) : z < 0 ? 0 : 2);

/** Where people scatter to while running from the clouds: along every sidewalk, and the corners. */
const FLEE: [number, number][] = [
  ...CORNERS,
  ...[12, 17, 22, 27].flatMap((a) => [-1, 1].flatMap((d) => [-1, 1].flatMap((s) => [W(d * a, s * 7), W(s * 7, d * a)]))),
].filter(([x, z]) => Math.abs(x) < 31 && Math.abs(z) < 25);

export interface StandSpot {
  x: number;
  z: number;
  look: PersonLook;
  /** Faces away from the camera (queueing at a counter, watching a busker or a screen). */
  back?: boolean;
  /** Only stands here once this cloud has been sprayed (they ran off till then). */
  cloud?: number;
}

export interface Musician {
  x: number;
  z: number;
  look: PersonLook;
  kind: Instrument;
  /** Plays once this cloud has been sprayed. */
  cloud?: number;
}

type Agent = {
  g: THREE.Group;
  frames: { group: THREE.Group; pivot: THREE.Group }[];
  kind: "cross" | "walk";
  pos: THREE.Vector3;
  path: [number, number][];
  /** Walkers: distance along their route (ping-pong). Crossers: index of the next path point. */
  s: number;
  dir: number;
  speed: number;
  stride: number;
  state: "wait" | "go" | "flee";
  corner: number;
  wait: number;
  panic: boolean;
  decide: number;
  turnCool: number;
  side: number;
  dx: number;
  dz: number;
  idx: number;
};

/** Everyone out in Bukit Bintang. Crossers wait at the four corners and cross (straight or diagonal)
 * on the scramble's walk phase; walkers stroll up and down the sidewalks; standers queue and watch.
 * Anyone near one of Bowat's clouds panics: holds their nose and runs (crossers scatter all over,
 * walkers turn and flee), until the clouds near them are sprayed. */
export async function bintangCrowd(o: {
  looks: PersonLook[];
  crossers: number;
  walkRoutes: [number, number][][];
  stand: StandSpot[];
  musicians: Musician[];
  player: () => THREE.Vector3;
  clouds: () => readonly ([number, number] | null)[];
  light: () => Light;
  walkLeft: () => number;
  bowatHere: () => boolean;
}): Promise<Anim & { solid: () => readonly THREE.Vector3[]; debug: () => string }> {
  const group = new THREE.Group();
  const shadowMat = new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.22, depthWrite: false });
  // Frames per look: calm front/back ×2, panic front/back ×2.
  const urls = o.looks.map((l) => [
    cityWalkerDoodle(l, 0), cityWalkerDoodle(l, 1), cityWalkerDoodle(l, 0, true), cityWalkerDoodle(l, 1, true),
    cityWalkerDoodle(l, 0, false, true), cityWalkerDoodle(l, 1, false, true), cityWalkerDoodle(l, 0, true, true), cityWalkerDoodle(l, 1, true, true),
  ]);
  const r = rng(99);
  const make = async (li: number) => {
    const look = o.looks[li];
    const frames = await Promise.all(urls[li].map((u) => paperStandee(u, look.kid ? 1.5 : 1.95)));
    const g = new THREE.Group();
    for (const f of frames) {
      (f.pivot.children[0] as THREE.Mesh).castShadow = false;
      f.group.visible = false;
      g.add(f.group);
    }
    const sh = mesh(new THREE.CircleGeometry(0.34, 14), shadowMat, 0, 0.03, 0);
    sh.rotation.x = -Math.PI / 2;
    g.add(sh);
    group.add(g);
    return { g, frames };
  };
  const agents: Agent[] = [];
  for (let i = 0; i < o.crossers; i++) {
    const { g, frames } = await make(i % o.looks.length);
    const corner = i % 4;
    const [cx, cz] = CORNERS[corner];
    const pos = new THREE.Vector3(cx + (r() - 0.5) * 2.6, 0, cz + (r() - 0.5) * 2.6);
    agents.push({ g, frames, kind: "cross", pos, path: [], s: 0, dir: 1, speed: 2.0 + r() * 0.5, stride: r() * 6, state: "wait", corner, wait: r() * 1.4, panic: false, decide: r(), turnCool: 0, side: 0, dx: 0, dz: 1, idx: i });
  }
  for (let i = 0; i < o.walkRoutes.length; i++) {
    const { g, frames } = await make((i * 3 + 1) % o.looks.length);
    const path = o.walkRoutes[i];
    let total = 0;
    for (let k = 1; k < path.length; k++) total += Math.hypot(path[k][0] - path[k - 1][0], path[k][1] - path[k - 1][1]);
    agents.push({ g, frames, kind: "walk", pos: new THREE.Vector3(path[0][0], 0, path[0][1]), path, s: r() * total, dir: r() < 0.5 ? 1 : -1, speed: 1.4 + r() * 0.5, stride: r() * 6, state: "go", corner: 0, wait: 0, panic: false, decide: r(), turnCool: 0, side: 0, dx: 0, dz: 1, idx: o.crossers + i });
  }

  // Standers and musicians: still paper figures that only show up once their spot is clear.
  const standers = await Promise.all(
    o.stand.map(async (sp) => {
      const { group: sg, pivot } = await paperStandee(cityWalkerDoodle(sp.look, 0, !!sp.back), sp.look.kid ? 1.5 : 1.95);
      (pivot.children[0] as THREE.Mesh).castShadow = false;
      sg.position.set(sp.x, 0, sp.z);
      group.add(sg);
      return { sp, sg, pivot, ph: r() * 6 };
    }),
  );
  const players = await Promise.all(
    o.musicians.map(async (m) => {
      const f = await Promise.all([0, 1].map((k) => paperStandee(musicianDoodle(m.look, m.kind, k as 0 | 1), 2.05)));
      const mg = new THREE.Group();
      f.forEach((x) => mg.add(x.group));
      mg.position.set(m.x, 0, m.z);
      group.add(mg);
      return { m, mg, f };
    }),
  );

  // Path helpers.
  const routeLen = (a: Agent) => {
    let total = 0;
    for (let k = 1; k < a.path.length; k++) total += Math.hypot(a.path[k][0] - a.path[k - 1][0], a.path[k][1] - a.path[k - 1][1]);
    return total;
  };
  const totals = new Map<Agent, number>();
  agents.forEach((a) => a.kind === "walk" && totals.set(a, routeLen(a)));
  const along = (a: Agent, out: THREE.Vector3) => {
    const total = totals.get(a)!;
    let d = ((a.s % (total * 2)) + total * 2) % (total * 2);
    let fwd = true;
    if (d > total) {
      d = total * 2 - d;
      fwd = false;
    }
    let k = 1;
    let acc = 0;
    for (; k < a.path.length; k++) {
      const seg = Math.hypot(a.path[k][0] - a.path[k - 1][0], a.path[k][1] - a.path[k - 1][1]);
      if (acc + seg >= d || k === a.path.length - 1) {
        const f = seg ? (d - acc) / seg : 0;
        out.set(a.path[k - 1][0] + (a.path[k][0] - a.path[k - 1][0]) * f, 0, a.path[k - 1][1] + (a.path[k][1] - a.path[k - 1][1]) * f);
        const sgn = fwd ? 1 : -1;
        a.dx = ((a.path[k][0] - a.path[k - 1][0]) / (seg || 1)) * sgn;
        a.dz = ((a.path[k][1] - a.path[k - 1][1]) / (seg || 1)) * sgn;
        return out;
      }
      acc += seg;
    }
    return out;
  };
  /** A path from where they are to a spot, going through the junction when it's in another quadrant
   * (so nobody runs through the jammed cars), and round Bowat when he's sitting in the middle. */
  const routeTo = (a: Agent, x: number, z: number): [number, number][] => {
    const q0 = quadrant(a.pos.x, a.pos.z);
    const q1 = quadrant(x, z);
    const pts: [number, number][] = [];
    const inBox = (px: number, pz: number) => {
      const [u, v] = UV(px, pz);
      return Math.abs(u) < WALK + 1 && Math.abs(v) < WALK + 1;
    };
    if (q0 !== q1) {
      if (!inBox(a.pos.x, a.pos.z)) pts.push([CORNERS[q0][0] + (r() - 0.5) * 2, CORNERS[q0][1] + (r() - 0.5) * 2]);
      // Diagonal across the middle: bend round Bowat, off to one side of the X.
      if ((q0 + 2) % 4 === q1 && o.bowatHere()) {
        const side = r() < 0.5 ? 3.2 : -3.2;
        const dx = CORNERS[q1][0] - CORNERS[q0][0];
        const dz = CORNERS[q1][1] - CORNERS[q0][1];
        const d = Math.hypot(dx, dz);
        pts.push([(-dz / d) * side, (dx / d) * side]);
      }
      if (!inBox(x, z)) pts.push([CORNERS[q1][0] + (r() - 0.5) * 2, CORNERS[q1][1] + (r() - 0.5) * 2]);
    }
    pts.push([x, z]);
    return pts;
  };
  const nearestCloud = (x: number, z: number) => {
    let best = Infinity;
    let at: [number, number] | null = null;
    for (const c of o.clouds()) {
      if (!c) continue;
      const d = Math.hypot(c[0] - x, c[1] - z);
      if (d < best) {
        best = d;
        at = c;
      }
    }
    return { d: best, at };
  };
  const cloudClear = (i?: number) => i === undefined || !o.clouds()[i];

  // Speech bubbles.
  const bubbles = Array.from({ length: 5 }, () => {
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: bubbleTex("..."), depthTest: false, transparent: true }));
    s.scale.set(2.7, 0.81, 1);
    s.renderOrder = 6;
    s.visible = false;
    group.add(s);
    return { s, owner: null as THREE.Object3D | null, until: 0 };
  });
  let clock = 0;
  const speak = (owner: THREE.Object3D, text: string, dur = 1.8) => {
    if (bubbles.some((b) => b.owner === owner && b.until > clock)) return;
    const b = bubbles.find((x) => x.until <= clock) ?? bubbles.reduce((p, q) => (p.until < q.until ? p : q));
    setBubbleText(b.s, text);
    b.owner = owner;
    b.until = clock + speechDuration(text, dur);
    b.s.visible = true;
  };
  const pick = <T,>(a: T[]) => a[Math.floor(Math.random() * a.length)];

  const tick = ticker();
  const v = new THREE.Vector3();
  let lastLight: Light = o.light();
  let nextBark = 2;
  // Only calm people block Qish; anyone running about in a panic just dodges past.
  const solid: THREE.Vector3[] = [];
  const update = (t: number) => {
    const dt = tick(t);
    clock = t;
    const pl = o.player();
    const light = o.light();
    const walkStart = light === "walk" && lastLight !== "walk";
    lastLight = light;
    const anyCloud = o.clouds().some((c) => c);
    for (const a of agents) {
      // Decide every so often whether this one is panicking: near a cloud, or (a third of the crossers)
      // just caught up in the chaos while any cloud is left.
      a.decide -= dt;
      if (a.decide <= 0) {
        a.decide = 1 + Math.random();
        // Bowat's own cloud in the middle counts too while any are left.
        const near = nearestCloud(a.pos.x, a.pos.z).d < 12 || Math.hypot(a.pos.x, a.pos.z) < 15;
        const was = a.panic;
        a.panic = anyCloud && (near || a.idx % 2 === 0);
        if (a.panic && !was && a.kind === "cross") {
          a.state = "flee";
          a.path = [];
        }
        if (!a.panic && was && a.kind === "cross") {
          // Calmed down: walk back to a corner and wait for the green man.
          a.corner = quadrant(a.pos.x, a.pos.z);
          const [cx, cz] = CORNERS[a.corner];
          a.path = routeTo(a, cx + (Math.random() - 0.5) * 2.6, cz + (Math.random() - 0.5) * 2.6);
          a.s = 0;
          a.state = "go";
        }
      }
      let moving = false;
      if (a.kind === "walk") {
        const sp = a.speed * (a.panic ? 2.9 : 1);
        a.turnCool -= dt;
        // Running from a cloud ahead: turn round.
        if (a.panic && a.turnCool <= 0) {
          const c = nearestCloud(a.pos.x, a.pos.z);
          if (c.at && c.d < 4.2 && (c.at[0] - a.pos.x) * a.dx + (c.at[1] - a.pos.z) * a.dz > 0) {
            a.dir = -a.dir;
            a.turnCool = 1.6;
          }
        }
        a.s += a.dir * sp * dt;
        along(a, v);
        if (a.dir < 0) {
          a.dx = -a.dx;
          a.dz = -a.dz;
        }
        moving = true;
      } else {
        const sp = a.state === "flee" ? 4.6 + (a.idx % 4) * 0.25 : a.speed * (light === "walkEnd" ? 1.8 : 1);
        if (a.state === "flee" && a.path.length === 0) {
          // Pick somewhere away from the clouds to run to.
          let best: [number, number] = FLEE[0];
          for (let k = 0; k < 6; k++) {
            const c = pick(FLEE);
            if (nearestCloud(c[0], c[1]).d > 6 && Math.hypot(c[0] - a.pos.x, c[1] - a.pos.z) > 5) {
              best = c;
              break;
            }
            best = c;
          }
          a.path = routeTo(a, best[0] + (Math.random() - 0.5) * 2, best[1] + (Math.random() - 0.5) * 2);
          a.s = 0;
        }
        if (a.state === "wait") {
          // Not everyone steps off the kerb the moment the green man shows.
          if (walkStart) a.wait = Math.random() * 1.4;
          a.wait -= dt;
          const go = !a.panic && light === "walk" && a.wait <= 0 && (o.walkLeft() > 4 || o.bowatHere());
          if (go) {
            let to = (a.corner + 1 + Math.floor(Math.random() * 3)) % 4;
            if (Math.random() < 0.35) to = (a.corner + 2) % 4;
            const [tx, tz] = CORNERS[to];
            a.path = routeTo(a, tx + (Math.random() - 0.5) * 2.6, tz + (Math.random() - 0.5) * 2.6);
            a.s = 0;
            a.corner = to;
            a.state = "go";
            if (Math.random() < 0.15) speak(a.g, pick(["Hijau! Jom!", "Lintas!", "Cepat sikit~"]));
          }
        }
        if ((a.state === "go" || a.state === "flee") && a.path.length) {
          const [tx, tz] = a.path[Math.min(a.s, a.path.length - 1)];
          const ddx = tx - a.pos.x;
          const ddz = tz - a.pos.z;
          const d = Math.hypot(ddx, ddz);
          if (d < 0.15) {
            a.s++;
            if (a.s >= a.path.length) {
              a.path = [];
              if (a.state === "go") {
                a.state = "wait";
                a.wait = o.bowatHere() ? 2 + Math.random() * 4 : 0.5;
              }
            }
          } else {
            const step = Math.min(d, sp * dt);
            a.pos.x += (ddx / d) * step;
            a.pos.z += (ddz / d) * step;
            a.dx = ddx / d;
            a.dz = ddz / d;
            moving = true;
          }
        }
        v.copy(a.pos);
      }
      // Swerve round Qish rather than walking through her.
      const tx = pl.x - v.x;
      const tz = pl.z - v.z;
      const ahead = tx * a.dx + tz * a.dz;
      const lat = -tx * a.dz + tz * a.dx;
      let target = 0;
      if (moving && ahead > -0.5 && ahead < 2.2 && Math.abs(lat - a.side) < 1.0) {
        target = lat > 0 ? -1.0 : 1.0;
        if (!a.panic && Math.random() < dt * 0.6) speak(a.g, pick(PASS_BARK));
      }
      a.side += (target - a.side) * Math.min(1, dt * 5);
      if (a.kind === "walk") a.pos.set(v.x - a.dz * a.side, 0, v.z + a.dx * a.side);
      a.g.position.copy(a.pos);
      if (a.kind === "cross" && moving) a.g.position.set(a.pos.x - a.dz * a.side, 0, a.pos.z + a.dx * a.side);
      // Frames: calm 0-3, panic 4-7; front or back by direction; mirrored when heading left.
      if (moving) a.stride += dt * (a.panic ? 9 : 5.2);
      const frame = moving ? Math.floor(a.stride / Math.PI) % 2 : 0;
      // Waiting at a corner they face the junction (the bottom corner shows its back).
      const away = moving ? a.dz < -0.3 : a.kind === "cross" && a.state === "wait" ? a.pos.z > 3 : false;
      const k = (a.panic ? 4 : 0) + (away ? 2 : 0) + frame;
      const mirror = a.dx < -0.15 ? -1 : 1;
      a.frames.forEach((f, i) => {
        f.group.visible = i === k;
        f.pivot.scale.x = mirror;
        f.group.position.y = moving ? Math.abs(Math.sin(a.stride)) * (a.panic ? 0.14 : 0.05) : 0;
        f.pivot.rotation.z = moving ? Math.sin(a.stride) * (a.panic ? 0.09 : 0.035) : Math.sin(t * 1.3 + a.idx) * 0.015;
      });
    }
    solid.length = 0;
    for (const a of agents) if (!a.panic) solid.push(a.pos);
    for (const st of standers) {
      st.sg.visible = cloudClear(st.sp.cloud);
      st.pivot.rotation.z = Math.sin(t * 1.4 + st.ph) * 0.03;
    }
    for (const m of players) {
      const on = cloudClear(m.m.cloud);
      m.mg.visible = on;
      const beat = Math.floor(t * 2.2 + m.m.x) % 2;
      m.f.forEach((f, i) => (f.group.visible = i === beat));
    }

    if (t > nextBark) {
      nextBark = t + (anyCloud ? 0.9 : 2.2) + Math.random() * 1.6;
      const near = agents.filter((a) => a.g.position.distanceTo(pl) < 12);
      if (near.length) {
        const a = pick(near);
        const whiff = !a.panic && anyCloud && nearestCloud(a.pos.x, a.pos.z).d < 14;
        speak(a.g, pick(a.panic ? PANIC_BARK : whiff ? WHIFF_BARK : CALM_BARK), a.panic ? 1.4 : 2.2);
      }
    }
    for (const b of bubbles) {
      if (!b.owner || b.until <= t) {
        b.s.visible = false;
        continue;
      }
      const left = b.until - t;
      b.s.position.set(b.owner.position.x, 2.65 + Math.min(0.15, (2.2 - left) * 0.6), b.owner.position.z);
      b.s.material.opacity = Math.min(1, left * 4);
    }
  };
  return { group, update, solid: () => solid, debug: () => agents.map((a) => `${a.kind[0]}${a.state[0]}${a.panic ? "!" : ""}${a.wait.toFixed(1)}/${a.path.length}`).join(" ") };
}

/** A painted walking arrow on the pavement, pointing north (the way back to Labu Lanjut). */
export function groundArrow(x: number, z: number) {
  const tex = canvasTexture(128, 128, (c) => {
    c.fillStyle = "#fffdf6";
    c.beginPath();
    c.moveTo(64, 8);
    c.lineTo(112, 60);
    c.lineTo(80, 60);
    c.lineTo(80, 120);
    c.lineTo(48, 120);
    c.lineTo(48, 60);
    c.lineTo(16, 60);
    c.closePath();
    c.fill();
  });
  return decal(1.6, 1.6, new THREE.MeshLambertMaterial({ map: tex, transparent: true }), x, z, 0, 0.05);
}

/** An underground station entrance on the plaza, open towards the camera: stairs dropping away north
 * into the dark, low glass walls either side, a glass canopy, a back wall with the MRT roundel, and a
 * totem with where the train goes. Walking down the stairs takes Qish there. */
export function subwayEntrance(x: number, z: number, dest: string, color: string) {
  const g = new THREE.Group();
  const steel = paintedMat("plaster", 3, 2.6, 1.8, 0x55606e);
  // The stairwell: steps getting darker the further down they go.
  const steps = canvasTexture(128, 256, (c) => {
    for (let i = 0; i < 16; i++) {
      const k = i / 15;
      const v = Math.round(200 - k * 175);
      c.fillStyle = `rgb(${v},${v - 4},${v - 10})`;
      c.fillRect(0, 256 - (i + 1) * 16, 128, 16);
      c.fillStyle = `rgba(255,214,90,${0.8 - k * 0.6})`;
      c.fillRect(0, 256 - (i + 1) * 16, 128, 3);
    }
  });
  g.add(decal(2.6, 3.6, new THREE.MeshBasicMaterial({ map: steps }), 0, -0.8, 0, 0.05));
  const glass = new THREE.MeshLambertMaterial({ color: 0xbfe3f4, transparent: true, opacity: 0.4 });
  for (const sx of [-1.45, 1.45]) {
    g.add(box(0.12, 1.1, 3.8, glass, sx, 0.55, -0.8));
    g.add(box(0.16, 0.1, 3.8, steel, sx, 1.12, -0.8));
  }
  // Back wall with the roundel, and the canopy over the top of the stairs.
  const roundel = canvasTexture(256, 160, (c) => {
    c.fillStyle = "#2a2d3a";
    c.fillRect(0, 0, 256, 160);
    c.fillStyle = color;
    c.beginPath();
    c.arc(128, 62, 44, 0, Math.PI * 2);
    c.fill();
    c.fillStyle = "#fffdf6";
    c.font = "bold 38px 'Bagel Fat One', sans-serif";
    c.textAlign = "center";
    c.textBaseline = "middle";
    c.fillText("MRT", 128, 64);
    c.font = "bold 26px 'Gaegu', sans-serif";
    c.fillText("BUKIT BINTANG", 128, 136);
  });
  g.add(mesh(roundedBox(3.1, 2.6, 0.2, 0.12, 2), [steel, steel, steel, steel, glow(roundel), steel], 0, 1.3, -2.75));
  const canopy = box(3.3, 0.08, 3.4, new THREE.MeshLambertMaterial({ color: 0xd8eef8, transparent: true, opacity: 0.32 }), 0, 2.75, -1.0);
  canopy.rotation.x = 0.08;
  g.add(canopy);
  for (const sx of [-1.55, 1.55]) g.add(box(0.1, 2.75, 0.1, steel, sx, 1.38, 0.6));
  // Totem by the top step.
  const totem = canvasTexture(96, 320, (c) => {
    c.fillStyle = "#fffdf6";
    c.fillRect(0, 0, 96, 320);
    c.fillStyle = color;
    c.beginPath();
    c.arc(48, 52, 36, 0, Math.PI * 2);
    c.fill();
    c.fillStyle = "#fffdf6";
    c.font = "bold 28px 'Bagel Fat One', sans-serif";
    c.textAlign = "center";
    c.textBaseline = "middle";
    c.fillText("MRT", 48, 54);
    c.fillStyle = "#1f2f7a";
    c.font = "bold 24px 'Gaegu', sans-serif";
    const words = ["BUKIT", "BINTANG"];
    words.forEach((w, i) => c.fillText(w, 48, 130 + i * 30));
    c.font = "bold 40px sans-serif";
    c.fillText("⬇", 48, 270);
  });
  g.add(mesh(roundedBox(0.5, 2.6, 0.5), [steel, steel, steel, steel, glow(totem), steel], 2.1, 1.3, 1.3));
  g.position.set(x, 0, z);
  return shadowed(g);
}

/** A cardboard-looking ring on the paving with a camera in it: the photo spot. */
export function photoSpot(x: number, z: number) {
  const tex = canvasTexture(256, 256, (c) => {
    c.strokeStyle = "#ff5c93";
    c.lineWidth = 14;
    c.setLineDash([26, 16]);
    c.beginPath();
    c.arc(128, 128, 110, 0, Math.PI * 2);
    c.stroke();
    c.font = "bold 90px sans-serif";
    c.textAlign = "center";
    c.textBaseline = "middle";
    c.fillText("📸", 128, 112);
    c.fillStyle = "#ff5c93";
    c.font = "bold 30px 'Bagel Fat One', sans-serif";
    c.fillText("SPOT GAMBAR", 128, 196);
  });
  return decal(3.2, 3.2, new THREE.MeshLambertMaterial({ map: tex, transparent: true }), x, z, 0, 0.05);
}
