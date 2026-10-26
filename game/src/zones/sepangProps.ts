import * as THREE from "three";
import { paperTexture } from "../overworld/paper";
import { LORBEL_LOOKS, passengerDoodle } from "../content/doodles";
import { model } from "../overworld/models";
import { roundedBox, canvasTexture, flat, signTexture } from "../overworld/props";
import type { Box } from "../overworld/zone";
import { rng } from "./boothProps";
import { shadowed } from "./common";
import type { Anim } from "./labuProps";
import { BAYS, BAY_X, MALAS, TEAMS, TRACK, TW, type Team, f1Car, insideLoop, trackPoint } from "./sepangTrack";

// Litar Sepang, everything round the track: the pit building with the garages and the podium on its
// roof, the pit wall, the start gantry, the grandstand under its leaf roofs between the two straights,
// the footbridges over the track, the main gate and the car park outside it, the paddock and fan zone,
// and the weather (a grey sky about to break: drizzle, the odd lightning flash).

const INK = "#17151f";

function box(w: number, h: number, d: number, mat: THREE.Material, x: number, y: number, z: number) {
  const m = new THREE.Mesh(roundedBox(w, h, d), mat);
  m.position.set(x, y, z);
  return m;
}

function cyl(r: number, h: number, mat: THREE.Material, x: number, y: number, z: number, seg = 8) {
  const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, Math.max(20,seg)), mat);
  m.position.set(x, y, z);
  return m;
}

/** A thin rod between two points (cables, rails, truss members). */
function rod(a: THREE.Vector3, b: THREE.Vector3, r: number, mat: THREE.Material) {
  const d = new THREE.Vector3().subVectors(b, a);
  const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, d.length(), 5), mat);
  m.position.copy(a).addScaledVector(d, 0.5);
  m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize());
  return m;
}

/** A box with a picture on its front (+z) face, and optionally its back. */
function panel(tex: THREE.Texture, w: number, h: number, d: number, edge: THREE.Material, back?: THREE.Texture, emissive = false) {
  const face = (t: THREE.Texture) => (emissive ? new THREE.MeshBasicMaterial({ map: t }) : new THREE.MeshLambertMaterial({ map: t }));
  return new THREE.Mesh(roundedBox(w, h, d), [edge, edge, edge, edge, face(tex), back ? face(back) : edge]);
}

/** Soft round glow, shared by every lamp (kept across zone teardowns). */
let GLOW: THREE.Texture | null = null;
function glow(color: number, size: number, opacity = 0.8) {
  if (!GLOW) {
    GLOW = canvasTexture(64, 64, (g) => {
      const grad = g.createRadialGradient(32, 32, 0, 32, 32, 32);
      grad.addColorStop(0, "rgba(255,255,255,1)");
      grad.addColorStop(1, "rgba(255,255,255,0)");
      g.fillStyle = grad;
      g.fillRect(0, 0, 64, 64);
    });
    GLOW.userData.shared = true;
  }
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: GLOW, color, transparent: true, opacity, depthWrite: false, blending: THREE.AdditiveBlending }));
  s.scale.setScalar(size);
  return s;
}

function wordTex(text: string, bg: string, fg: string, w = 512, h = 128, font = "bold 70px 'Bagel Fat One', sans-serif", sub?: string) {
  return canvasTexture(w, h, (g) => {
    g.fillStyle = bg;
    g.fillRect(0, 0, w, h);
    g.fillStyle = fg;
    g.font = font;
    g.textAlign = "center";
    g.textBaseline = "middle";
    g.fillText(text, w / 2, sub ? h * 0.4 : h / 2 + 4);
    if (sub) {
      g.font = `bold ${Math.round(h * 0.2)}px 'Bagel Fat One', sans-serif`;
      g.fillText(sub, w / 2, h * 0.78);
    }
  });
}

/** Eases a set of objects between solid and see-through (`ghost`), for things that would hide Qish
 * from the camera when she walks behind them. */
export function fader(root: THREE.Object3D, ghostOpacity = 0.15) {
  const mats = new Set<THREE.Material>();
  root.traverse((o) => {
    const m = o as THREE.Mesh;
    if (m.isMesh) for (const mat of Array.isArray(m.material) ? m.material : [m.material]) mats.add(mat);
  });
  let k = 1;
  return (ghost: boolean, dt: number) => {
    const want = ghost ? ghostOpacity : 1;
    if (Math.abs(k - want) < 0.001) return;
    k += (want - k) * Math.min(1, dt * 8);
    if (Math.abs(k - want) < 0.01) k = want;
    const see = k < 0.999;
    for (const m of mats) {
      if (m.transparent !== see) {
        m.transparent = see;
        m.depthWrite = !see;
        m.needsUpdate = true;
      }
      m.opacity = k;
    }
  };
}

// ---------------------------------------------------------------- Layout shared with the zone

/** The pit building: garages along the pit lane, the podium on the roof over the middle. */
export const PB = { x0: -21, x1: 21, z0: -1.4, z1: 4.6, h: 3.4 };
export const DECK_Y = 3.6;
/** The roof deck round the podium, and the stairs up to it from the paddock. */
export const DECK: Box = [-4.5, -1.4, 4.5, 4.6];
export const STAIRS = { x0: -1.5, x1: 1.5, z0: 4.6, z1: 9.8 };
export const GRANDSTAND = { x0: -18.6, x1: 18.6, z0: -26.6, z1: -16.5 };

export interface Bridge {
  x: number;
  /** Where it leaves the ground and where it comes down again. */
  z0: number;
  z1: number;
  h: number;
  ramp: number;
}
export const BRIDGE_HW = 1.4;
/** Over the pit entry and the main straight, paddock to the grandstand side. */
export const BRIDGE1: Bridge = { x: -24, z0: 4.8, z1: -19.4, h: 3.8, ramp: 3.6 };
/** Over the back straight, infield to the road out to Labu Lanjut. */
export const BRIDGE2: Bridge = { x: 26, z0: -23.8, z1: -40.4, h: 3.8, ramp: 3.6 };

export function bridgeY(b: Bridge, x: number, z: number) {
  if (Math.abs(x - b.x) > BRIDGE_HW) return 0;
  const total = Math.abs(b.z1 - b.z0);
  const along = (z - b.z0) * Math.sign(b.z1 - b.z0);
  if (along < 0 || along > total) return 0;
  return b.h * Math.min(1, along / b.ramp, (total - along) / b.ramp);
}
export const onBridge = (b: Bridge, x: number, z: number) =>
  Math.abs(x - b.x) <= BRIDGE_HW && (z - b.z0) * Math.sign(b.z1 - b.z0) >= 0 && (z - b.z1) * Math.sign(b.z0 - b.z1) >= 0;

export function podiumY(x: number, z: number) {
  if (x >= STAIRS.x0 && x <= STAIRS.x1 && z >= STAIRS.z0 && z <= STAIRS.z1) return (DECK_Y * (STAIRS.z1 - z)) / (STAIRS.z1 - STAIRS.z0);
  if (x >= DECK[0] && x <= DECK[2] && z >= DECK[1] && z < STAIRS.z0) return DECK_Y;
  return 0;
}

// ---------------------------------------------------------------- Pit building and podium

const CONCRETE = 0xe6e2da;

/** Garages, both ends open so the cars show from the paddock side; team names over the back doors.
 * MALAS RACING's car is under a cover and their crew are on the sofa. The roof comes back separately
 * (not for merging) so the zone can fade it. */
export function pitBuilding() {
  const g = new THREE.Group();
  const { x0, x1, z0, z1, h } = PB;
  const cz = (z0 + z1) / 2;
  const depth = z1 - z0;
  const wall = flat(CONCRETE);
  const bayW = (x1 - x0) / BAYS.length;
  g.add(box(x1 - x0, 0.04, depth, flat(0xc9ccd2), 0, 0.02, cz));
  for (let i = 0; i <= BAYS.length; i++) g.add(box(0.3, h, depth, wall, x0 + i * bayW, h / 2, cz));
  // The roof (with its parapet and clutter) is its own group: it turns see-through while Qish is in
  // the pit lane behind it.
  const roof = new THREE.Group();
  roof.add(box(x1 - x0 + 0.4, 0.22, depth + 0.3, flat(0xd2cfc8), 0, h + 0.11, cz));
  const para = flat(0xbdb9b1);
  for (const [px0, px1] of [[x0, -1.5], [1.5, x1]] as const) roof.add(box(px1 - px0, 0.4, 0.2, para, (px0 + px1) / 2, h + 0.4, z1));
  roof.add(box(x1 - x0, 0.4, 0.2, para, 0, h + 0.4, z0));
  for (const sx of [x0, x1]) roof.add(box(0.2, 0.4, depth, para, sx, h + 0.4, cz));
  for (const [ax, az] of [[-16, 2.6], [-12.4, 1.2], [11, 2.8], [15.6, 1.4], [-8, 3.2]] as const) roof.add(box(1.4, 0.7, 1.0, flat(0xa9adb5), ax, h + 0.57, az));
  BAYS.forEach((t, i) => {
    const bx = BAY_X[i];
    const team = t === "pass" ? null : TEAMS[t];
    // Over the back door: the team's name (or the way through).
    const sign = team ? wordTex(team.name, team.css, "#fffdf6", 512, 96, "bold 54px 'Bagel Fat One', sans-serif") : wordTex("↑ PIT LANE", "#2a2730", "#ffcb05", 512, 96, "bold 54px 'Bagel Fat One', sans-serif");
    const s = panel(sign, bayW - 0.4, 0.62, 0.12, flat(0x2a2730));
    s.position.set(bx, h - 0.42, z1 + 0.08);
    g.add(s);
    // Team stripe over the pit-lane doors.
    roof.add(box(bayW - 0.3, 0.5, 0.12, flat(team ? team.body : 0x2a2730), bx, h - 0.35, z0 - 0.06));
    if (!team) {
      // The walk-through: arrows on the floor, a turnstile by the pit-lane end.
      const arrow = canvasTexture(64, 128, (c) => {
        c.fillStyle = "#ffcb05";
        c.beginPath();
        c.moveTo(32, 8);
        c.lineTo(58, 50);
        c.lineTo(42, 50);
        c.lineTo(42, 120);
        c.lineTo(22, 120);
        c.lineTo(22, 50);
        c.lineTo(6, 50);
        c.closePath();
        c.fill();
      });
      for (const az of [3.2, 0.6]) {
        const a = new THREE.Mesh(new THREE.PlaneGeometry(0.8, 1.6), new THREE.MeshBasicMaterial({ map: arrow, transparent: true }));
        a.rotation.x = -Math.PI / 2;
        a.position.set(bx, 0.05, az);
        g.add(a);
      }
      return;
    }
    // Team colours down the walls.
    for (const side of [-1, 1]) g.add(box(0.06, 2.0, depth - 0.8, flat(team.body), bx + side * (bayW / 2 - 0.2), 1.5, cz));
    if (t === MALAS) {
      // Covered car, sofa, pillows, and a sign on the door.
      const cover = new THREE.Mesh(new THREE.SphereGeometry(1,20,14), flat(0x9aa0aa));
      cover.scale.set(0.95, 0.5, 1.9);
      cover.position.set(bx, 0.4, 1.4);
      g.add(cover);
      const sofa = flat(0x6d5a7e);
      g.add(box(3.0, 0.45, 0.9, sofa, bx, 0.42, 3.75), box(3.0, 0.75, 0.25, sofa, bx, 0.85, 3.32));
      for (const sx of [-1.5, 1.5]) g.add(box(0.25, 0.65, 0.9, sofa, bx + sx, 0.55, 3.75));
      for (const [px, c] of [[-0.9, 0xc9ccd2], [0.1, 0xffb3cb], [0.95, 0xc9ccd2]] as const) {
        const p = box(0.62, 0.42, 0.24, flat(c), bx + px, 0.82, 3.5);
        p.rotation.x = -0.3;
        g.add(p);
      }
      const dnd = panel(wordTex("JANGAN KACAU", "#fffdf6", INK, 256, 96, "bold 38px 'Gaegu', sans-serif", "Raja Nonchalant tengah rehat"), 1.3, 0.48, 0.05, flat(0xdddddd));
      dnd.position.set(bx + 1.4, 1.5, z1 + 0.05);
      g.add(dnd);
      return;
    }
    if (bx === 0) {
      // Behind the stairs: shutter down.
      const shutter = canvasTexture(64, 128, (c) => {
        c.fillStyle = team.css;
        c.fillRect(0, 0, 64, 128);
        c.fillStyle = "rgba(0,0,0,.18)";
        for (let y = 0; y < 128; y += 8) c.fillRect(0, y, 64, 2);
      });
      const sh = panel(shutter, bayW - 0.35, h - 0.75, 0.1, flat(team.body));
      sh.position.set(bx, (h - 0.75) / 2, z1 - 0.05);
      g.add(sh);
    }
    // The spare car on stands, tyre stacks in warmers, a tool chest and the data screens.
    const car = f1Car(team).group;
    car.rotation.y = Math.PI;
    car.position.set(bx, 0.18, 1.0);
    g.add(car);
    for (const sx of [-1, 1]) g.add(box(0.3, 0.18, 0.3, flat(0x3a3f4a), bx + sx * 0.75, 0.09, 1.0));
    for (const sx of [-1.55, 1.55]) {
      for (let k = 0; k < 4; k++) {
        g.add(cyl(0.34, 0.26, flat(0x1c1c22), bx + sx, 0.14 + k * 0.27, 3.75, 10));
        g.add(cyl(0.355, 0.12, flat(team.body), bx + sx, 0.16 + k * 0.27, 3.75, 10));
      }
    }
    g.add(box(0.8, 0.9, 0.5, flat(0xd63a3a), bx + 1.4, 0.45, 2.3));
    g.add(box(0.9, 0.55, 0.06, new THREE.MeshBasicMaterial({ color: 0x3b6fe0 }), bx - 1.4, 1.6, 2.5), box(0.06, 1.3, 0.06, flat(0x3a3f4a), bx - 1.4, 0.65, 2.5));
  });
  shadowed(roof);
  return { group: shadowed(g), roof, fade: fader(roof) };
}

/** The podium on the roof deck: three steps, the trophy and champagne, an arch with the sign, and
 * the beach umbrella Raja Nonchalant brought because it might rain. Glass rail round the deck. */
export function podium() {
  const g = new THREE.Group();
  const y = DECK_Y;
  g.add(box(DECK[2] - DECK[0], 0.04, DECK[3] - DECK[1], flat(0x7a1f2a), 0, y + 0.02, (DECK[1] + DECK[3]) / 2));
  const steps: [number, number, number, string][] = [[0, 0.8, 0xfffdf6, "1"], [-1.6, 0.55, 0xf0ede6, "2"], [1.6, 0.36, 0xf0ede6, "3"]].map(
    ([x, hh, c, n]) => [x as number, hh as number, c as number, n as string],
  );
  for (const [x, hh, c, n] of steps) {
    g.add(box(1.6, hh, 1.6, flat(c), x, y + hh / 2, -0.5));
    const num = new THREE.Mesh(new THREE.PlaneGeometry(0.8, 0.8), new THREE.MeshBasicMaterial({ map: wordTex(n, "#fffdf6", "#d4af37", 128, 128, "bold 100px 'Bagel Fat One', sans-serif") }));
    num.rotation.x = -Math.PI / 2;
    num.position.set(x, y + hh + 0.01, -0.2);
    g.add(num);
  }
  // Trophy and champagne.
  const gold = flat(0xd4af37);
  g.add(cyl(0.18, 0.12, gold, 0.55, y + 0.86, -1.0), cyl(0.06, 0.3, gold, 0.55, y + 1.05, -1.0));
  const cup = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.1, 0.42, 10), gold);
  cup.position.set(0.55, y + 1.4, -1.0);
  g.add(cup);
  for (const [bx, hh] of [[-1.9, 0.55], [1.9, 0.36]] as const) {
    g.add(cyl(0.09, 0.42, flat(0x1f5a32), bx, y + hh + 0.21, -0.9), cyl(0.04, 0.16, flat(0xd4af37), bx, y + hh + 0.5, -0.9));
  }
  // Arch with the sign, readable from both sides.
  const steel = flat(0xd9dce2);
  for (const sx of [-3.6, 3.6]) g.add(box(0.22, 3.4, 0.22, steel, sx, y + 1.7, -1.15));
  const sign = panel(
    wordTex("PODIUM", "#e3350d", "#fffdf6", 768, 128, "bold 84px 'Bagel Fat One', sans-serif", "LITAR ANTARABANGSA SEPANG"),
    7.4,
    1.0,
    0.2,
    flat(0xb32a0b),
    wordTex("PODIUM", "#e3350d", "#fffdf6", 768, 128, "bold 84px 'Bagel Fat One', sans-serif", "LITAR ANTARABANGSA SEPANG"),
  );
  sign.position.set(0, y + 3.25, -1.15);
  g.add(sign);
  // The umbrella, leaning over the top step from behind.
  const stripes = canvasTexture(256, 64, (c) => {
    for (let i = 0; i < 8; i++) {
      c.fillStyle = i % 2 ? "#fffdf6" : "#ff6fa0";
      c.fillRect(i * 32, 0, 32, 64);
    }
  });
  const um = new THREE.Group();
  um.add(cyl(0.04, 2.6, flat(0xf4f2ea), 0, 1.3, 0));
  const canopy = new THREE.Mesh(new THREE.ConeGeometry(1.5, 0.6, 16, 1, true), new THREE.MeshLambertMaterial({ map: stripes, side: THREE.DoubleSide }));
  canopy.position.y = 2.6;
  um.add(canopy);
  um.position.set(0.7, y + 0.8, -1.05);
  um.rotation.x = -0.32;
  um.rotation.z = -0.12;
  g.add(um);
  // Glass rail round the deck.
  const glass = new THREE.MeshLambertMaterial({ color: 0xbfe2f2, transparent: true, opacity: 0.32 });
  const rail = flat(0xd9dce2);
  const rails: [number, number, number, number][] = [
    [DECK[0], DECK[1], DECK[2], DECK[1]],
    [DECK[0], DECK[1], DECK[0], DECK[3]],
    [DECK[2], DECK[1], DECK[2], DECK[3]],
    [DECK[0], DECK[3], STAIRS.x0, DECK[3]],
    [STAIRS.x1, DECK[3], DECK[2], DECK[3]],
  ];
  for (const [ax, az, bx, bz] of rails) {
    const len = Math.hypot(bx - ax, bz - az);
    const along = Math.abs(bx - ax) > 0.01;
    g.add(box(along ? len : 0.05, 0.9, along ? 0.05 : len, glass, (ax + bx) / 2, y + 0.45, (az + bz) / 2));
    g.add(box(along ? len : 0.08, 0.07, along ? 0.08 : len, rail, (ax + bx) / 2, y + 0.92, (az + bz) / 2));
  }
  // The stairs from the paddock: treads up the slope, rails both sides.
  const n = 14;
  const run = STAIRS.z1 - STAIRS.z0;
  for (let k = 0; k < n; k++) {
    const z = STAIRS.z1 - ((k + 0.5) / n) * run;
    const hh = (DECK_Y * (k + 1)) / n;
    g.add(box(STAIRS.x1 - STAIRS.x0, hh, run / n + 0.02, flat(k % 2 ? 0xd8d4cc : 0xcfcbc2), 0, hh / 2, z));
  }
  for (const sx of [STAIRS.x0 - 0.05, STAIRS.x1 + 0.05]) {
    g.add(rod(new THREE.Vector3(sx, 0.95, STAIRS.z1), new THREE.Vector3(sx, DECK_Y + 0.95, STAIRS.z0), 0.04, rail));
    for (let k = 0; k <= 4; k++) {
      const z = STAIRS.z1 - (k / 4) * run;
      const base = (DECK_Y * k) / 4;
      g.add(box(0.06, 0.95, 0.06, rail, sx, base + 0.47, z));
    }
  }
  return shadowed(g);
}

/** Pit wall between the pit lane and the main straight, with a catch fence on top and the teams'
 * timing stands. Returns the stand spots (where the engineers sit). */
export function pitWall() {
  const g = new THREE.Group();
  const x0 = -24;
  const x1 = 22;
  const z = -5.7;
  const tex = canvasTexture(512, 64, (c) => {
    for (let i = 0; i < 8; i++) {
      c.fillStyle = i % 2 ? "#fffdf6" : "#e3350d";
      c.fillRect(i * 64, 0, 64, 64);
    }
  });
  tex.wrapS = THREE.RepeatWrapping;
  tex.repeat.set((x1 - x0) / 8, 1);
  const w = new THREE.Mesh(roundedBox(x1 - x0, 1.05, 0.5), [flat(CONCRETE), flat(CONCRETE), flat(CONCRETE), flat(CONCRETE), new THREE.MeshLambertMaterial({ map: tex }), new THREE.MeshLambertMaterial({ map: tex })]);
  w.position.set((x0 + x1) / 2, 0.52, z);
  g.add(w);
  g.add(catchFence([[x0, z], [x1, z]], 2.1, 1.05));
  const spots: [number, number][] = [];
  for (const ti of [0, 1, 4, 6]) {
    const bx = BAY_X[BAYS.indexOf(ti)];
    const team = TEAMS[ti];
    g.add(box(3.0, 0.12, 1.3, flat(0x3a3f4a), bx, 1.1, z + 0.3));
    for (const sx of [-1.4, 1.4]) g.add(box(0.1, 1.6, 0.1, flat(0x3a3f4a), bx + sx, 1.9, z + 0.85));
    g.add(box(3.2, 0.12, 1.6, flat(team.body), bx, 2.75, z + 0.3));
    for (const sx of [-0.8, 0, 0.8]) g.add(box(0.6, 0.4, 0.05, new THREE.MeshBasicMaterial({ color: 0x5ad1ff }), bx + sx, 1.75, z - 0.2));
    spots.push([bx, z + 0.55]);
  }
  return { group: shadowed(g), spots };
}

/** A tall catch fence along a polyline: posts and see-through mesh, on a concrete base `base` high. */
export function catchFence(pts: [number, number][], h: number, base = 0) {
  const g = new THREE.Group();
  const mesh = canvasTexture(64, 64, (c) => {
    c.strokeStyle = "rgba(200,206,214,.95)";
    c.lineWidth = 3;
    c.beginPath();
    c.moveTo(0, 0);
    c.lineTo(64, 64);
    c.moveTo(64, 0);
    c.lineTo(0, 64);
    c.stroke();
  });
  mesh.wrapS = mesh.wrapT = THREE.RepeatWrapping;
  const post = flat(0x8c929c);
  for (let i = 1; i < pts.length; i++) {
    const [ax, az] = pts[i - 1];
    const [bx, bz] = pts[i];
    const len = Math.hypot(bx - ax, bz - az);
    const t = mesh.clone();
    t.repeat.set(len / 0.6, h / 0.6);
    t.needsUpdate = true;
    const m = new THREE.Mesh(new THREE.PlaneGeometry(len, h), new THREE.MeshBasicMaterial({ map: t, transparent: true, alphaTest: 0.3, side: THREE.DoubleSide, depthWrite: false }));
    m.position.set((ax + bx) / 2, base + h / 2, (az + bz) / 2);
    m.rotation.y = -Math.atan2(bz - az, bx - ax);
    g.add(m);
    const n = Math.max(1, Math.round(len / 3));
    for (let k = 0; k <= n; k++) {
      const x = ax + ((bx - ax) * k) / n;
      const z = az + ((bz - az) * k) / n;
      g.add(box(0.1, h + 0.15, 0.1, post, x, base + (h + 0.15) / 2, z));
    }
    g.add(rod(new THREE.Vector3(ax, base + h, az), new THREE.Vector3(bx, base + h, bz), 0.04, post));
  }
  return g;
}

/** Low armco along the infield edge of the whole lap (steel rail on white posts). */
export function armco(skip: (x: number, z: number) => boolean) {
  const g = new THREE.Group();
  const rail = flat(0xc5cad2);
  const postM = flat(0xf4f2ea);
  const step = 2;
  for (let s = 0; s < TRACK.len; s += step) {
    const [ax, az] = trackPoint(s, -(TW + 1.05));
    const [bx, bz] = trackPoint(s + step, -(TW + 1.05));
    // The infield side is whichever offset falls inside the loop.
    const inside = insideLoop(ax, az);
    const [cx, cz] = inside ? [ax, az] : trackPoint(s, TW + 1.05);
    const [dx, dz] = inside ? [bx, bz] : trackPoint(s + step, TW + 1.05);
    if (skip(cx, cz)) continue;
    g.add(box(0.12, 0.7, 0.12, postM, cx, 0.35, cz));
    for (const y of [0.42, 0.62]) g.add(rod(new THREE.Vector3(cx, y, cz), new THREE.Vector3(dx, y, dz), 0.06, rail));
  }
  return g;
}

/** Start/finish gantry across the main straight: truss on two legs, the start lights (all green, the
 * race is on), and the circuit's name facing the camera. */
export function startGantry(x: number) {
  const g = new THREE.Group();
  const steel = flat(0x3a3f4a);
  for (const z of [-14.3, -5.2]) g.add(box(0.5, 6.4, 0.5, steel, x, 3.2, z));
  const chk = canvasTexture(64, 512, (c) => {
    for (let i = 0; i < 2; i++) for (let j = 0; j < 16; j++) {
      c.fillStyle = (i + j) % 2 ? INK : "#fffdf6";
      c.fillRect(i * 32, j * 32, 32, 32);
    }
  });
  const top = new THREE.MeshLambertMaterial({ map: chk });
  g.add(new THREE.Mesh(roundedBox(0.6, 0.7, 9.6), [steel, steel, top, steel, steel, steel]).translateX(x).translateY(6.2).translateZ(-9.75));
  for (let k = 0; k < 5; k++) {
    const z = -12 + k * 1.1;
    g.add(box(0.4, 0.5, 0.5, steel, x - 0.35, 5.6, z));
    const l = glow(0x6dff7a, 0.7, 0.9);
    l.position.set(x - 0.6, 5.6, z);
    g.add(l);
  }
  return shadowed(g);
}

// ---------------------------------------------------------------- Grandstand

/** The leaf roof's vein texture. */
function leafTex() {
  return canvasTexture(256, 256, (c) => {
    c.fillStyle = "#f6f3ec";
    c.fillRect(0, 0, 256, 256);
    c.strokeStyle = "rgba(150,140,125,.45)";
    c.lineWidth = 6;
    c.beginPath();
    c.moveTo(128, 0);
    c.lineTo(128, 256);
    c.stroke();
    c.lineWidth = 3;
    for (let y = 20; y < 256; y += 26) {
      c.beginPath();
      c.moveTo(128, y + 18);
      c.quadraticCurveTo(70, y + 4, 4, y - 12);
      c.moveTo(128, y + 18);
      c.quadraticCurveTo(186, y + 4, 252, y - 12);
      c.stroke();
    }
  });
}

/** One leaf of the roof: pointed at both ends, cupped, arching from its stem at the back of the stand
 * out towards the track. */
function leaf(x: number, mat: THREE.Material, zBack: number, zTip: number, yBack: number, yTip: number, half: number) {
  const nu = 18;
  const nv = 8;
  const pos: number[] = [];
  const uv: number[] = [];
  const idx: number[] = [];
  for (let i = 0; i <= nu; i++) {
    const u = i / nu;
    const w = half * Math.pow(Math.sin(Math.PI * Math.min(0.98, Math.max(0.02, u))), 0.75);
    const z = zBack + (zTip - zBack) * u;
    const y = yBack + (yTip - yBack) * u + Math.sin(Math.PI * u) * 0.7;
    for (let j = 0; j <= nv; j++) {
      const v = (j / nv) * 2 - 1;
      pos.push(x + v * w, y + v * v * 0.55 * (w / half), z);
      uv.push((v + 1) / 2, u);
      if (i && j) {
        const a = (i - 1) * (nv + 1) + j - 1;
        const b = i * (nv + 1) + j - 1;
        idx.push(a, b, a + 1, a + 1, b, b + 1);
      }
    }
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  geo.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
  geo.setIndex(idx);
  geo.computeVertexNormals();
  const m = new THREE.Mesh(geo, mat);
  m.castShadow = true;
  return m;
}

const SEAT_COLORS = [0x2f62d8, 0xffcb05, 0xe3350d, 0xe3350d, 0xffcb05, 0x2f62d8];
/** The main grandstand between the straights, facing the pits: tiers of coloured seats packed with
 * fans (umbrellas up), Mexican waves, the two banners Faris hung on the front, and the famous roof of
 * white leaves on masts. Statics in `statics`; the crowd animates. */
export async function grandstand(onWave?: () => void): Promise<Anim & { statics: THREE.Group; wave(): void }> {
  const group = new THREE.Group();
  const statics = new THREE.Group();
  const { x0, x1 } = GRANDSTAND;
  const front = GRANDSTAND.z1;
  const rows = 10;
  const D = 0.95;
  const R = 0.55;
  const W = x1 - x0;
  const concrete = flat(0xd8d4cc);
  const aisles = [-12, -6, 0, 6, 12];
  const inAisle = (x: number) => aisles.some((a) => Math.abs(x - a) < 0.55);
  for (let k = 0; k < rows; k++) {
    const zf = front - k * D;
    const top = R * (k + 1);
    statics.add(box(W, top, D, concrete, 0, top / 2, zf - D / 2));
    // Seat backs by section, and lighter steps up the aisles.
    for (let s = 0; s < 6; s++) {
      const sx0 = x0 + s * 6.2 + (s ? 0.55 : 0.2);
      const sx1 = x0 + (s + 1) * 6.2 - (s < 5 ? 0.55 : 0.2);
      statics.add(box(sx1 - sx0, 0.34, 0.16, flat(SEAT_COLORS[s]), (sx0 + sx1) / 2, top + 0.17, zf - D * 0.78));
    }
    for (const a of aisles) statics.add(box(1.0, 0.04, D, flat(0xf0ede6), a, top + 0.02, zf - D / 2));
  }
  const backZ = front - rows * D;
  statics.add(box(W + 0.4, 6.6, 0.4, flat(0xcfcac0), 0, 3.3, backZ - 0.2));
  for (const sx of [x0 - 0.2, x1 + 0.2]) statics.add(box(0.4, 6.0, rows * D + 0.4, flat(0xcfcac0), sx, 3.0, front - (rows * D) / 2));
  // Front parapet (gap at the middle aisle for the stairs up).
  for (const [ax, bx] of [[x0, -0.6], [0.6, x1]] as const) statics.add(box(bx - ax, 0.9, 0.25, flat(0xe6e2da), (ax + bx) / 2, 0.45, front + 0.12));
  // Banners on the parapet.
  for (const [x, text, bg, fg] of [[-8.5, "SEPANG BADDIE ♥", "#fffdf6", "#e3350d"], [8.5, "LABU LANJUT QUEEN", "#5b4766", "#ffd34d"]] as const) {
    const b = panel(wordTex(text, bg, fg, 768, 128, "bold 76px 'Bagel Fat One', sans-serif"), 6.6, 1.1, 0.04, flat(0xdddddd));
    b.position.set(x, 0.62, front + 0.27);
    b.rotation.x = -0.08;
    statics.add(b);
  }
  // The roof: a leaf over each section, a mast behind each, cables out to the leaf.
  const lm = new THREE.MeshLambertMaterial({ map: leafTex(), side: THREE.DoubleSide });
  const mast = flat(0xd9dce2);
  const zBack = backZ - 0.3;
  const zTip = front - 1.6;
  for (let i = 0; i < 7; i++) {
    const x = -18 + i * 6;
    statics.add(leaf(x, lm, zBack, zTip, 9.4, 8.2, 3.0));
    statics.add(cyl(0.15, 12, mast, x, 6, zBack - 0.6));
    const top = new THREE.Vector3(x, 12, zBack - 0.6);
    for (const u of [0.45, 0.85]) {
      const z = zBack + (zTip - zBack) * u;
      const y = 9.4 + (8.2 - 9.4) * u + Math.sin(Math.PI * u) * 0.7;
      statics.add(rod(top, new THREE.Vector3(x, y, z), 0.025, mast));
    }
  }
  shadowed(statics);
  for (const m of statics.children) if ((m as THREE.Mesh).material === lm) m.receiveShadow = false;

  // The crowd: instanced fans in the seats, some under umbrellas.
  const r = rng(88);
  const people: { x: number; y: number; z: number; brolly: number; ph: number }[] = [];
  for (let k = 0; k < rows; k++) {
    for (let x = x0 + 0.4; x < x1 - 0.3; x += 0.62) {
      if (inAisle(x) || r() > 0.72) continue;
      people.push({ x: x + (r() - 0.5) * 0.12, y: R * (k + 1), z: front - k * D - D * 0.42, brolly: r() < 0.14 ? 1 : 0, ph: r() * 6.28 });
    }
  }
  // The seated spectators use the same doodle people as the rest of the world.
  // Six instanced paper meshes keep the whole stand inexpensive to render.
  const fans = await Promise.all(Array.from({length:6}, async (_,kind) => {
    const look = { ...LORBEL_LOOKS[kind * 2], carry: "none" as const };
    const {tex,aspect} = await paperTexture(passengerDoodle(look), 9);
    const geo = new THREE.PlaneGeometry(1.05 * aspect,1.05); geo.translate(0,.525,0);
    const count = people.filter((_,i)=>i % 6 === kind).length;
    const mesh = new THREE.InstancedMesh(geo,new THREE.MeshBasicMaterial({map:tex,alphaTest:.5,side:THREE.DoubleSide}),count);
    mesh.frustumCulled = false; mesh.userData.seatedNPC = true; group.add(mesh);
    return mesh;
  }));
  const brGeo = new THREE.ConeGeometry(.5,.26,20);
  const brollies = people.filter(p=>p.brolly);
  const umbrellas = new THREE.InstancedMesh(brGeo,flat(0xf2b4cb),Math.max(1,brollies.length));
  umbrellas.frustumCulled = false; group.add(umbrellas);
  const m4 = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  const sc = new THREE.Vector3();
  const v = new THREE.Vector3();
  let waveAt = 6;
  let forced = false;
  const update = (t: number) => {
    if (forced || t > waveAt + 24) {
      waveAt = t;
      forced = false;
      onWave?.();
    }
    let bi = 0;
    const used = [0,0,0,0,0,0];
    for (let i = 0; i < people.length; i++) {
      const p = people[i];
      const w = (t - waveAt) * 11 - (p.x - x0);
      const up = w > 0 && w < Math.PI ? Math.sin(w) : 0;
      const bob = Math.abs(Math.sin(t * 3 + p.ph)) * 0.04;
      const y = p.y + up * 0.32 + bob;
      sc.set(1,1 + up * .15,1);
      q.setFromAxisAngle(new THREE.Vector3(1,0,0),-.42);
      m4.compose(v.set(p.x,y-.16,p.z),q,sc);
      fans[i % 6].setMatrixAt(used[i % 6]++,m4);
      sc.set(1,1,1); q.identity();
      if (p.brolly) {
        m4.compose(v.set(p.x, y + 0.55 * (1 + up * 0.5) + 0.62, p.z), q, sc);
        umbrellas.setMatrixAt(bi++, m4);
      }
    }
    for (const fan of fans) fan.instanceMatrix.needsUpdate = true;
    umbrellas.instanceMatrix.needsUpdate = true;
  };
  update(0);
  return {
    group,
    update,
    statics,
    wave() {
      forced = true;
    },
  };
}

// ---------------------------------------------------------------- Footbridges

/** A footbridge on a straight north-south line: ramps at both ends, deck over the track, glass rails,
 * columns at the given z (keep them off the track), a red fascia stripe and lamps. */
export function footbridge(b: Bridge, columns: number[]) {
  const g = new THREE.Group();
  const dir = Math.sign(b.z1 - b.z0);
  const total = Math.abs(b.z1 - b.z0);
  const deck0 = b.z0 + dir * b.ramp;
  const deck1 = b.z1 - dir * b.ramp;
  const W = BRIDGE_HW * 2;
  const top = flat(0xe9e6df);
  const glass = new THREE.MeshLambertMaterial({ color: 0xbfe2f2, transparent: true, opacity: 0.32 });
  const rail = flat(0xd9dce2);
  const red = flat(0xe3350d);
  // Deck.
  const deckLen = total - 2 * b.ramp;
  g.add(box(W, 0.3, deckLen, top, b.x, b.h - 0.15, (deck0 + deck1) / 2));
  for (const sx of [-1, 1]) g.add(box(0.08, 0.45, deckLen, red, b.x + sx * (BRIDGE_HW + 0.02), b.h - 0.3, (deck0 + deck1) / 2));
  // Ramps (slabs tilted up to the deck).
  const len = Math.hypot(b.ramp, b.h);
  const a = Math.atan2(b.h, b.ramp);
  for (const [zc, rot] of [[b.z0 + (dir * b.ramp) / 2, -dir * a], [b.z1 - (dir * b.ramp) / 2, dir * a]] as const) {
    const ramp = box(W, 0.3, len, top, b.x, b.h / 2 - 0.12, zc);
    ramp.rotation.x = rot;
    g.add(ramp);
    for (const sx of [-1, 1]) {
      const gl = box(0.05, 0.9, len, glass, b.x + sx * (BRIDGE_HW + 0.03), b.h / 2 + 0.45, zc);
      gl.rotation.x = rot;
      const hr = box(0.08, 0.07, len, rail, b.x + sx * (BRIDGE_HW + 0.03), b.h / 2 + 0.92, zc);
      hr.rotation.x = rot;
      g.add(gl, hr);
    }
  }
  for (const sx of [-1, 1]) {
    g.add(box(0.05, 0.9, deckLen, glass, b.x + sx * (BRIDGE_HW + 0.03), b.h + 0.45, (deck0 + deck1) / 2));
    g.add(box(0.08, 0.07, deckLen, rail, b.x + sx * (BRIDGE_HW + 0.03), b.h + 0.92, (deck0 + deck1) / 2));
  }
  for (const z of columns) for (const sx of [-0.9, 0.9]) g.add(cyl(0.18, b.h - 0.3, flat(0xcfcac0), b.x + sx, (b.h - 0.3) / 2, z));
  // Lamps along the deck.
  for (let z = deck0 + dir * 1.5; (deck1 - z) * dir > 0.5; z += dir * 4.5) {
    for (const sx of [-1, 1]) {
      g.add(box(0.06, 1.5, 0.06, rail, b.x + sx * (BRIDGE_HW + 0.03), b.h + 0.75, z));
      const l = glow(0xfff1cf, 0.8, 0.7);
      l.position.set(b.x + sx * (BRIDGE_HW + 0.03), b.h + 1.55, z);
      g.add(l);
    }
  }
  return shadowed(g);
}

// ---------------------------------------------------------------- Gate, car park, paddock

/** The main gate: two red pylons, a long canopy with the circuit's name facing the car park, turnstile
 * lanes in the middle and a ticket booth either side. Fences run off from it to both ends. The big sign
 * comes back on its own (not for merging) so it can fade while Qish is inside. */
export function mainGate(z: number) {
  const g = new THREE.Group();
  const red = flat(0xd8281e);
  const white = flat(0xf4f2ea);
  for (const sx of [-12.6, 12.6]) {
    g.add(box(2.0, 7.4, 2.0, red, sx, 3.7, z));
    g.add(box(2.06, 0.6, 2.06, white, sx, 6.2, z), box(0.5, 7.4, 2.06, white, sx, 3.7, z));
  }
  // Open frame overhead (beams, not a slab, so it doesn't blot out the paddock behind).
  const beam = flat(0xe9e6df);
  for (const dz of [-1.2, 0, 1.2]) g.add(box(26.2, 0.22, 0.28, beam, 0, 5.9, z + dz));
  for (let x = -11.5; x <= 11.5; x += 2.3) g.add(box(0.16, 0.16, 2.7, beam, x, 6.05, z));
  for (const sx of [-6.6, 6.6]) g.add(box(0.3, 5.8, 0.3, flat(0xb9bdc4), sx, 2.9, z + 1.6));
  const sign = panel(
    wordTex("LITAR ANTARABANGSA SEPANG", "#d8281e", "#fffdf6", 1024, 128, "bold 64px 'Bagel Fat One', sans-serif", "SEPANG INTERNATIONAL CIRCUIT"),
    17,
    1.6,
    0.3,
    red,
  );
  sign.position.set(0, 7.0, z + 1.9);
  const top = new THREE.Group();
  top.add(sign);
  shadowed(top);
  // Turnstiles.
  const steel = flat(0xb9bdc4);
  for (const x of [-3.4, -1.7, 0, 1.7, 3.4]) {
    g.add(box(0.32, 1.0, 0.7, steel, x, 0.5, z));
    if (x < 3.4) for (let k = 0; k < 3; k++) {
      const arm = cyl(0.03, 0.6, steel, x + 0.45, 0.85, z, 5);
      arm.rotation.x = (k / 3) * Math.PI * 2;
      arm.rotation.z = Math.PI / 2;
      g.add(arm);
    }
  }
  // Ticket booths: open window, counter, TIKET sign.
  for (const sx of [-8.2, 8.2]) {
    const wallM = flat(0xf4f2ea);
    g.add(box(3.0, 2.6, 0.15, wallM, sx, 1.3, z - 1.0));
    for (const ex of [-1.45, 1.45]) g.add(box(0.15, 2.6, 2.1, wallM, sx + ex, 1.3, z));
    g.add(box(3.0, 1.05, 0.2, red, sx, 0.52, z + 1.0), box(3.2, 0.1, 0.6, white, sx, 1.1, z + 1.05));
    g.add(box(3.3, 0.25, 2.5, red, sx, 2.72, z));
    const t = panel(wordTex("TIKET", "#ffcb05", INK, 256, 96, "bold 60px 'Bagel Fat One', sans-serif"), 1.8, 0.62, 0.1, flat(0x2a2730));
    t.position.set(sx, 3.2, z + 1.0);
    g.add(t);
  }
  return { group: shadowed(g), sign: top, fade: fader(top, 0.25) };
}

/** A metal crowd-control fence: concrete footing, posts, two rails and mesh. */
export function barricade(x0: number, x1: number, z: number) {
  const g = new THREE.Group();
  g.add(box(x1 - x0, 0.2, 0.3, flat(0xbdb9b1), (x0 + x1) / 2, 0.1, z));
  g.add(catchFence([[x0, z], [x1, z]], 1.3, 0.2));
  return g;
}

/** An ordinary car in the car park. */
export function parkedCar(x: number, z: number, rotY: number, color: number) {
  const generated = model((color >> 16 & 255) > (color >> 8 & 255) ? "bb_car_red" : "bb_car_green", 3.4);
  if (generated) {
    generated.position.set(x, 0, z);
    generated.rotation.y = rotY;
    return generated;
  }
  const g = new THREE.Group();
  const body = flat(color);
  g.add(box(1.7, 0.6, 3.4, body, 0, 0.55, 0), box(1.5, 0.55, 1.8, body, 0, 1.1, -0.2), box(1.54, 0.38, 1.6, flat(0x2f4258), 0, 1.12, -0.2));
  for (const [wx, wz] of [[-0.8, 1.05], [0.8, 1.05], [-0.8, -1.1], [0.8, -1.1]] as const) {
    const w = cyl(0.3, 0.22, flat(0x1c1c22), wx, 0.3, wz, 10);
    w.rotation.z = Math.PI / 2;
    g.add(w);
  }
  g.position.set(x, 0, z);
  g.rotation.y = rotY;
  return shadowed(g);
}

/** Car park ground: asphalt with bay lines and arrows. Bays along the north and south rows. */
export function carPark(x0: number, x1: number, z0: number, z1: number, rows: { z0: number; z1: number }[]) {
  const g = new THREE.Group();
  const paint = new THREE.MeshBasicMaterial({ color: 0xf4f2ea });
  for (const row of rows) {
    for (let x = x0 + 1; x <= x1 - 1; x += 2.6) {
      const m = new THREE.Mesh(new THREE.PlaneGeometry(0.1, row.z1 - row.z0), paint);
      m.rotation.x = -Math.PI / 2;
      m.position.set(x, 0.05, (row.z0 + row.z1) / 2);
      g.add(m);
    }
  }
  return g;
}

/** A team's transporter truck in the paddock, its name down the side facing the camera. */
export function transporter(x: number, z: number, t: Team) {
  const g = new THREE.Group();
  const body = flat(t.body);
  const side = new THREE.Mesh(roundedBox(7.0,2.3,2.3,.3,6),body);
  const lettering = new THREE.Mesh(new THREE.PlaneGeometry(6.3,1.3),new THREE.MeshLambertMaterial({map:wordTex(t.name,t.css,"#fffdf6",768,192)}));
  lettering.position.set(0,0,1.165); side.add(lettering);
  side.position.set(0, 1.55, 0);
  g.add(side);
  g.add(box(7.0, 0.2, 2.32, flat(t.accent), 0, 0.5, 0));
  const cab = new THREE.Mesh(roundedBox(1.9,2.0,2.2,.38,6),body); cab.position.set(4.4,1.3,0); g.add(cab);
  g.add(box(.08,.72,1.66,flat(0x2f4258),5.32,1.8,0));
  for (const wx of [-2.6, -1.6, 1.8, 4.4]) for (const sz of [-1.05, 1.05]) {
    const w = cyl(0.42, 0.3, flat(0x1c1c22), wx, 0.42, sz, 10);
    w.rotation.x = Math.PI / 2;
    g.add(w);
  }
  g.position.set(x, 0, z);
  return shadowed(g);
}

/** A merch tent in a team's colours: peaked canopy, a table of caps and folded shirts, a banner. */
export function merchTent(x: number, z: number, t: Team, sub = "OFFICIAL MERCH") {
  const g = new THREE.Group();
  const pole = flat(0xd9dce2);
  for (const [px, pz] of [[-1.7, -1.4], [1.7, -1.4], [-1.7, 1.4], [1.7, 1.4]] as const) g.add(cyl(0.05, 2.3, pole, px, 1.15, pz));
  const roof = new THREE.Mesh(new THREE.ConeGeometry(2.6, 1.0, 4, 1), flat(t.body));
  roof.rotation.y = Math.PI / 4;
  roof.scale.set(1, 1, 0.82);
  roof.position.y = 2.8;
  g.add(roof);
  g.add(box(3.0, 0.08, 0.9, flat(0xfffdf6), 0, 0.85, 0.6), box(3.0, 0.8, 0.85, flat(t.accent), 0, 0.42, 0.6));
  for (let k = 0; k < 4; k++) {
    const cap = new THREE.Mesh(new THREE.SphereGeometry(0.17,20,14, 0, Math.PI * 2, 0, Math.PI / 2), flat(k % 2 ? t.body : t.accent));
    cap.position.set(-1.1 + k * 0.4, 0.9, 0.45);
    g.add(cap);
  }
  for (let k = 0; k < 3; k++) g.add(box(0.36, 0.1, 0.3, flat(k === 1 ? t.accent : t.body), 0.6 + k * 0.42, 0.94, 0.7));
  const ban = panel(wordTex(t.name, t.css, "#fffdf6", 512, 96, "bold 50px 'Bagel Fat One', sans-serif", sub), 3.2, 0.8, 0.06, flat(t.body));
  ban.position.set(0, 2.0, -1.4);
  g.add(ban);
  g.position.set(x, 0, z);
  return shadowed(g);
}

/** The show car spinning slowly on a turntable, behind rope posts. */
export function showCar(x: number, z: number, t: Team): Anim {
  const group = new THREE.Group();
  const statics = new THREE.Group();
  statics.add(cyl(2.4, 0.3, flat(0x2a2730), 0, 0.15, 0, 24), cyl(2.2, 0.06, flat(0xd9dce2), 0, 0.33, 0, 24));
  for (let k = 0; k < 8; k++) {
    const a = (k / 8) * Math.PI * 2;
    statics.add(cyl(0.06, 0.9, flat(0xd4af37), Math.cos(a) * 3, 0.45, Math.sin(a) * 3));
  }
  group.add(shadowed(statics));
  const spin = new THREE.Group();
  const car = f1Car(t).group;
  car.position.y = 0.36;
  spin.add(car);
  group.add(spin);
  group.position.set(x, 0, z);
  return { group, update: (tt) => (spin.rotation.y = tt * 0.35) };
}

/** A sim rig: seat in front of three screens facing the camera, the screens showing the track. */
export function simRig(x: number, z: number): Anim {
  const group = new THREE.Group();
  const c = document.createElement("canvas");
  c.width = 256;
  c.height = 96;
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  const scr = new THREE.MeshBasicMaterial({ map: tex });
  for (const [sx, ry] of [[-1.05, 0.35], [0, 0], [1.05, -0.35]] as const) {
    const s = new THREE.Mesh(new THREE.PlaneGeometry(1.0, 0.62), scr);
    s.position.set(sx, 1.35, -0.4 + Math.abs(sx) * 0.15);
    s.rotation.y = ry;
    group.add(s);
  }
  const st = new THREE.Group();
  st.add(box(3.2, 0.1, 0.1, flat(0x2a2730), 0, 1.0, -0.5), box(0.1, 1.0, 0.1, flat(0x2a2730), 0, 0.5, -0.5));
  st.add(box(0.7, 0.35, 1.2, flat(0xe3350d), 0, 0.3, 0.7), box(0.7, 0.8, 0.2, flat(0xe3350d), 0, 0.7, 1.2));
  const sign = panel(wordTex("SIMULATOR F1", "#2f62d8", "#fffdf6", 512, 96, "bold 54px 'Bagel Fat One', sans-serif", "CUBA LAH! RM0"), 2.4, 0.5, 0.06, flat(0x2a2730));
  sign.position.set(0, 2.15, -0.5);
  st.add(sign);
  group.add(shadowed(st));
  group.position.set(x, 0, z);
  let lastDraw = -1;
  return {
    group,
    update(t) {
      if (t - lastDraw < 0.1) return;
      lastDraw = t;
      const g = c.getContext("2d")!;
      g.fillStyle = "#7fb4e6";
      g.fillRect(0, 0, 256, 48);
      g.fillStyle = "#4f8f36";
      g.fillRect(0, 48, 256, 48);
      // A road rushing towards the screen, swerving.
      const sway = Math.sin(t * 1.3) * 40;
      g.fillStyle = "#4a4d55";
      g.beginPath();
      g.moveTo(128 + sway * 0.2 - 8, 48);
      g.lineTo(128 + sway * 0.2 + 8, 48);
      g.lineTo(128 + sway + 120, 96);
      g.lineTo(128 + sway - 120, 96);
      g.fill();
      g.fillStyle = "#fffdf6";
      for (let k = 0; k < 4; k++) {
        const y = 48 + ((k * 12 + t * 60) % 48);
        g.fillRect(126 + sway * ((y - 48) / 48), y, 4, 4);
      }
      tex.needsUpdate = true;
    },
  };
}

/** A big screen on legs facing the camera: a live map of the race with every car as a dot, the top
 * five and the lap, and SAFETY CAR in yellow when it's out. */
export function jumbotron(x: number, z: number, w: number, race: { dots(): { x: number; z: number; team: number }[]; order(): { team: number; pit: boolean }[]; lap(): number; safety(): boolean }): Anim {
  const group = new THREE.Group();
  const h = (w * 9) / 16;
  const st = new THREE.Group();
  for (const sx of [-w / 2 + 0.6, w / 2 - 0.6]) st.add(box(0.4, 2.6, 0.4, flat(0x3a3f4a), sx, 1.3, 0));
  st.add(box(w + 0.5, h + 0.5, 0.45, flat(0x2a2730), 0, 2.6 + h / 2, 0));
  group.add(shadowed(st));
  const c = document.createElement("canvas");
  c.width = 640;
  c.height = 360;
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  const s = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: tex }));
  s.position.set(0, 2.6 + h / 2, 0.24);
  group.add(s);
  group.position.set(x, 0, z);
  // Track outline in screen space.
  const xs = TRACK.pts.map((p) => p[0]);
  const zs = TRACK.pts.map((p) => p[1]);
  const [mx0, mx1, mz0, mz1] = [Math.min(...xs), Math.max(...xs), Math.min(...zs), Math.max(...zs)];
  const k = Math.min(360 / (mx1 - mx0), 250 / (mz1 - mz0));
  const map = (px: number, pz: number): [number, number] => [24 + (px - mx0) * k, 70 + (pz - mz0) * k];
  let last = -1;
  return {
    group,
    update(t) {
      if (t - last < 0.12) return;
      last = t;
      const g = c.getContext("2d")!;
      g.fillStyle = "#121828";
      g.fillRect(0, 0, 640, 360);
      g.fillStyle = "#e3350d";
      g.beginPath();
      g.roundRect(20, 16, 96, 38, 8);
      g.fill();
      g.fillStyle = "#fffdf6";
      g.font = "bold 28px 'Bagel Fat One', sans-serif";
      g.textBaseline = "middle";
      g.fillText(Math.floor(t * 2) % 2 ? "● LIVE" : "  LIVE", 28, 36);
      g.fillText(`LAP ${race.lap()}`, 132, 36);
      g.fillStyle = "#8fa3c8";
      g.font = "bold 22px 'Bagel Fat One', sans-serif";
      g.fillText("SEPANG TV", 520, 36);
      g.strokeStyle = "#5a6478";
      g.lineWidth = 12;
      g.lineJoin = "round";
      g.beginPath();
      TRACK.pts.forEach((p, i) => (i ? g.lineTo(...map(p[0], p[1])) : g.moveTo(...map(p[0], p[1]))));
      g.closePath();
      g.stroke();
      g.strokeStyle = "#fffdf6";
      g.lineWidth = 2;
      g.stroke();
      for (const d of race.dots()) {
        const [px, py] = map(d.x, d.z);
        g.fillStyle = d.team < 0 ? "#ff9a1a" : TEAMS[d.team].css;
        g.strokeStyle = "#fffdf6";
        g.lineWidth = 2;
        g.beginPath();
        g.arc(px, py, d.team < 0 ? 9 : 8, 0, Math.PI * 2);
        g.fill();
        g.stroke();
      }
      const order = race.order();
      g.font = "bold 24px 'Bagel Fat One', sans-serif";
      order.slice(0, 6).forEach((o, i) => {
        const y = 92 + i * 40;
        g.fillStyle = "rgba(255,255,255,.08)";
        g.fillRect(410, y - 16, 210, 34);
        g.fillStyle = TEAMS[o.team].css;
        g.fillRect(410, y - 16, 10, 34);
        g.fillStyle = "#fffdf6";
        g.fillText(`${i + 1}  ${TEAMS[o.team].short}`, 430, y + 1);
        if (o.pit) {
          g.fillStyle = "#ffcb05";
          g.fillText("PIT", 560, y + 1);
        }
      });
      if (race.safety()) {
        g.fillStyle = "#ffcb05";
        g.fillRect(0, 316, 640, 44);
        g.fillStyle = INK;
        g.font = "bold 30px 'Bagel Fat One', sans-serif";
        g.fillText("⚠ SAFETY CAR ⚠", 220, 339);
      } else {
        g.fillStyle = "#8fa3c8";
        g.font = "bold 20px 'Bagel Fat One', sans-serif";
        g.fillText("RAJA NONCHALANT: DI PODIUM SEJAK PAGI · TAK MASUK KERETA PUN · HUJAN DIJANGKA", 640 - ((t * 60) % 1400), 339);
      }
      tex.needsUpdate = true;
    },
  };
}

/** The timing tower: a tall pylon with the running order down its face. */
export function timingTower(x: number, z: number, race: { order(): { team: number; pit: boolean }[]; lap(): number; safety(): boolean }): Anim {
  const group = new THREE.Group();
  const st = new THREE.Group();
  st.add(box(2.0, 9.4, 0.8, flat(0x2a2730), 0, 4.7, 0));
  st.add(box(2.2, 0.5, 1.0, flat(0xe3350d), 0, 9.6, 0));
  group.add(shadowed(st));
  const c = document.createElement("canvas");
  c.width = 160;
  c.height = 640;
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  const s = new THREE.Mesh(new THREE.PlaneGeometry(1.7, 6.8), new THREE.MeshBasicMaterial({ map: tex }));
  s.position.set(0, 5.4, 0.41);
  group.add(s);
  group.position.set(x, 0, z);
  let last = -1;
  return {
    group,
    update(t) {
      if (t - last < 0.25) return;
      last = t;
      const g = c.getContext("2d")!;
      g.fillStyle = "#121828";
      g.fillRect(0, 0, 160, 640);
      g.fillStyle = race.safety() ? "#ffcb05" : "#e3350d";
      g.fillRect(0, 0, 160, 64);
      g.fillStyle = race.safety() ? INK : "#fffdf6";
      g.font = "bold 30px 'Bagel Fat One', sans-serif";
      g.textAlign = "center";
      g.textBaseline = "middle";
      g.fillText(race.safety() ? "SC" : `LAP ${race.lap()}`, 80, 34);
      g.textAlign = "left";
      race.order().forEach((o, i) => {
        const y = 92 + i * 60;
        g.fillStyle = TEAMS[o.team].css;
        g.fillRect(8, y - 22, 12, 44);
        g.fillStyle = "#fffdf6";
        g.font = "bold 30px 'Bagel Fat One', sans-serif";
        g.fillText(`${i + 1} ${TEAMS[o.team].short}`, 28, y + 2);
        if (o.pit) {
          g.fillStyle = "#ffcb05";
          g.font = "bold 18px 'Bagel Fat One', sans-serif";
          g.fillText("PIT", 116, y + 2);
        }
      });
      tex.needsUpdate = true;
    },
  };
}

/** A flag on a pole, flapping hard in the wind before the rain. */
export function windFlag(x: number, z: number, draw: (c: CanvasRenderingContext2D) => void, phase = 0, h = 4.6): Anim {
  const group = new THREE.Group();
  group.add(shadowed(cyl(0.05, h, flat(0xeeeeee), 0, h / 2, 0)));
  const tex = canvasTexture(200, 120, draw);
  const W = 1.9;
  const geo = new THREE.PlaneGeometry(W, 1.1, 14, 4);
  geo.translate(W / 2, 0, 0);
  const base = Float32Array.from(geo.attributes.position.array as Float32Array);
  const flag = new THREE.Mesh(geo, new THREE.MeshLambertMaterial({ map: tex, side: THREE.DoubleSide }));
  flag.position.set(0.05, h - 0.6, 0);
  flag.castShadow = true;
  group.add(flag);
  group.position.set(x, 0, z);
  const pos = geo.attributes.position;
  return {
    group,
    update(t) {
      for (let i = 0; i < pos.count; i++) {
        const bx = base[i * 3];
        const by = base[i * 3 + 1];
        const k = bx / W;
        pos.setZ(i, Math.sin(bx * 3.2 - t * 8 + phase) * 0.2 * k + Math.sin(by * 3 - t * 5) * 0.04 * k);
        pos.setY(i, by - k * k * 0.06);
      }
      pos.needsUpdate = true;
      geo.computeVertexNormals();
    },
  };
}

export const teamFlagArt = (t: Team) => (c: CanvasRenderingContext2D) => {
  c.fillStyle = t.css;
  c.fillRect(0, 0, 200, 120);
  c.fillStyle = `#${t.accent.toString(16).padStart(6, "0")}`;
  c.fillRect(0, 84, 200, 18);
  c.fillStyle = "#fffdf6";
  c.font = "bold 40px 'Bagel Fat One', sans-serif";
  c.textAlign = "center";
  c.textBaseline = "middle";
  c.fillText(t.short, 100, 46);
};
export const chequeredArt = (c: CanvasRenderingContext2D) => {
  for (let i = 0; i < 8; i++) for (let j = 0; j < 5; j++) {
    c.fillStyle = (i + j) % 2 ? INK : "#fffdf6";
    c.fillRect(i * 25, j * 24, 25, 24);
  }
};

/** A marshal's flag waved on a stick: green normally, yellow while the safety car is out. */
export function marshalFlag(x: number, y: number, z: number, yellow: () => boolean, phase = 0): Anim {
  const group = new THREE.Group();
  const arm = new THREE.Group();
  arm.add(cyl(0.025, 1.3, flat(0x3a3a40), 0, 0.65, 0, 5));
  const mat = new THREE.MeshLambertMaterial({ color: 0x3fae5a, side: THREE.DoubleSide });
  const flag = new THREE.Mesh(new THREE.PlaneGeometry(0.8, 0.55), mat);
  flag.position.set(0.42, 1.0, 0);
  arm.add(flag);
  group.add(arm);
  group.position.set(x, y, z);
  return {
    group,
    update(t) {
      const y = yellow();
      mat.color.setHex(y ? 0xffcb05 : 0x3fae5a);
      arm.rotation.z = Math.sin(t * (y ? 9 : 3) + phase) * (y ? 0.7 : 0.25) - 0.3;
    },
  };
}

/** A marshal post: a small hut on stilts with its number. */
export function marshalPost(x: number, z: number, n: number) {
  const g = new THREE.Group();
  const white = flat(0xf4f2ea);
  for (const [px, pz] of [[-0.8, -0.7], [0.8, -0.7], [-0.8, 0.7], [0.8, 0.7]] as const) g.add(box(0.12, 1.2, 0.12, flat(0x8c929c), px, 0.6, pz));
  g.add(box(1.9, 0.12, 1.7, flat(0x8c929c), 0, 1.25, 0), box(1.9, 1.3, 0.1, white, 0, 1.95, -0.8));
  for (const sx of [-0.95, 0.95]) g.add(box(0.1, 1.3, 1.7, white, sx, 1.95, 0));
  g.add(box(2.1, 0.12, 1.9, flat(0xff8a1c), 0, 2.66, 0));
  const sign = panel(wordTex(`POS ${n}`, "#ff8a1c", INK, 256, 96, "bold 60px 'Bagel Fat One', sans-serif"), 1.4, 0.5, 0.06, flat(0xff8a1c));
  sign.position.set(0, 1.0, 0.86);
  g.add(sign);
  g.position.set(x, 0, z);
  return shadowed(g);
}

/** The commentary box: glass cabin on stilts with LIVE on it. */
export function commentaryBox(x: number, z: number) {
  const g = new THREE.Group();
  const steel = flat(0x8c929c);
  for (const [px, pz] of [[-1.3, -1], [1.3, -1], [-1.3, 1], [1.3, 1]] as const) g.add(box(0.18, 2.3, 0.18, steel, px, 1.15, pz));
  g.add(box(3.0, 0.2, 2.4, flat(0x3a3f4a), 0, 2.4, 0), box(3.0, 1.2, 0.1, flat(0x3a3f4a), 0, 3.1, -1.15));
  g.add(box(3.0, 1.2, 0.06, new THREE.MeshLambertMaterial({ color: 0xbfe2f2, transparent: true, opacity: 0.4 }), 0, 3.1, 1.15));
  for (const sx of [-1.45, 1.45]) g.add(box(0.1, 1.2, 2.4, flat(0x3a3f4a), sx, 3.1, 0));
  g.add(box(3.3, 0.2, 2.7, flat(0xe3350d), 0, 3.8, 0));
  const sign = panel(wordTex("● LIVE · PENGULAS", "#e3350d", "#fffdf6", 512, 96, "bold 52px 'Bagel Fat One', sans-serif"), 3.0, 0.55, 0.08, flat(0xe3350d));
  sign.position.set(0, 4.25, 1.2);
  g.add(sign);
  g.add(box(0.7, 0.45, 0.05, new THREE.MeshBasicMaterial({ color: 0x5ad1ff }), -0.6, 2.85, -0.6), box(0.7, 0.45, 0.05, new THREE.MeshBasicMaterial({ color: 0x5ad1ff }), 0.6, 2.85, -0.6));
  // Stairs up the side.
  for (let k = 0; k < 6; k++) g.add(box(0.8, 0.08, 0.35, steel, 1.95, 0.35 + k * 0.38, 1.0 - k * 0.38));
  g.position.set(x, 0, z);
  return shadowed(g);
}

/** The medical helicopter on its pad, rotor idling round. */
export function helicopter(x: number, z: number): Anim {
  const group = new THREE.Group();
  const st = new THREE.Group();
  const pad = new THREE.Mesh(
    new THREE.CircleGeometry(3.4, 32),
    new THREE.MeshLambertMaterial({
      map: canvasTexture(256, 256, (c) => {
        c.fillStyle = "#5a5d66";
        c.fillRect(0, 0, 256, 256);
        c.strokeStyle = "#ffcb05";
        c.lineWidth = 12;
        c.beginPath();
        c.arc(128, 128, 112, 0, Math.PI * 2);
        c.stroke();
        c.fillStyle = "#fffdf6";
        c.font = "bold 150px 'Bagel Fat One', sans-serif";
        c.textAlign = "center";
        c.textBaseline = "middle";
        c.fillText("H", 128, 138);
      }),
    }),
  );
  pad.rotation.x = -Math.PI / 2;
  pad.position.y = 0.04;
  st.add(pad);
  const white = flat(0xf4f2ea);
  const red = flat(0xe3350d);
  const body = new THREE.Mesh(new THREE.SphereGeometry(1,20,14), white);
  body.scale.set(0.95, 0.85, 1.5);
  body.position.set(0, 1.25, 0.2);
  st.add(body);
  st.add(box(1.92, 0.25, 1.6, red, 0, 1.25, 0.3));
  st.add(box(1.5, 0.6, 0.1, flat(0x2f4258), 0, 1.5, 1.55));
  st.add(box(0.3, 0.35, 3.0, white, 0, 1.45, -2.4), box(0.08, 0.9, 0.6, red, 0, 1.9, -3.8));
  for (const sx of [-0.75, 0.75]) st.add(box(0.08, 0.08, 2.6, flat(0x3a3f4a), sx, 0.1, 0.2), box(0.06, 0.4, 0.06, flat(0x3a3f4a), sx, 0.3, 0.8));
  st.add(cyl(0.1, 0.4, flat(0x3a3f4a), 0, 2.25, 0.2));
  group.add(shadowed(st));
  const rotor = new THREE.Group();
  for (let k = 0; k < 2; k++) {
    const blade = box(6.2, 0.04, 0.22, flat(0x2a2730), 0, 0, 0);
    blade.rotation.y = (k * Math.PI) / 2;
    rotor.add(blade);
  }
  rotor.position.set(0, 2.47, 0.2);
  group.add(rotor);
  group.position.set(x, 0, z);
  group.rotation.y = 0.5;
  return { group, update: (t) => (rotor.rotation.y = t * 1.6) };
}

/** A floodlight tower: tall mast, a bank of lamps tilted down towards `look`. */
export function lightTower(x: number, z: number, look: [number, number], h = 12) {
  const g = new THREE.Group();
  const steel = flat(0x8c929c);
  g.add(box(0.5, h, 0.5, steel, 0, h / 2, 0));
  for (let y = 1; y < h; y += 1.2) g.add(box(0.7, 0.06, 0.7, steel, 0, y, 0));
  const head = new THREE.Group();
  head.add(box(3.2, 1.6, 0.25, flat(0x3a3f4a), 0, 0, 0));
  for (let i = 0; i < 4; i++) for (let j = 0; j < 2; j++) {
    const lamp = new THREE.Mesh(new THREE.PlaneGeometry(0.62, 0.55), new THREE.MeshBasicMaterial({ color: 0xfff6dc }));
    lamp.position.set(-1.15 + i * 0.77, -0.35 + j * 0.7, 0.14);
    head.add(lamp);
  }
  const gl = glow(0xfff1cf, 4.2, 0.6);
  gl.position.set(0, 0, 0.6);
  head.add(gl);
  head.position.set(0, h + 0.5, 0);
  head.rotation.y = Math.atan2(look[0] - x, look[1] - z);
  head.rotation.x = 0.45;
  head.rotation.order = "YXZ";
  g.add(head);
  g.position.set(x, 0, z);
  return shadowed(g);
}

/** Two paddock scooters going up and down the paddock road (they wait for Qish). */
export function scooters(x0: number, x1: number, z: number, player: () => THREE.Vector3): Anim {
  const group = new THREE.Group();
  const list = [0, 1].map((i) => {
    const s = new THREE.Group();
    const t = TEAMS[[4, 0][i]];
    s.add(box(0.45, 0.35, 1.4, flat(t.body), 0, 0.45, 0), box(0.4, 0.5, 0.35, flat(t.body), 0, 0.75, 0.5));
    for (const wz of [-0.55, 0.55]) {
      const w = cyl(0.22, 0.12, flat(0x1c1c22), 0, 0.22, wz, 10);
      w.rotation.z = Math.PI / 2;
      s.add(w);
    }
    s.add(box(0.42, 0.7, 0.32, flat(t.body), 0, 1.05, -0.1), new THREE.Mesh(new THREE.SphereGeometry(0.2,20,14), flat(0xfffdf6)).translateY(1.6).translateZ(-0.05));
    shadowed(s);
    group.add(s);
    return { s, u: i * 0.5, dir: i ? -1 : 1, z: z + (i ? 0.7 : -0.7) };
  });
  let last = -1;
  return {
    group,
    update(t) {
      const dt = last < 0 ? 0 : Math.min(0.05, t - last);
      last = t;
      const p = player();
      for (const sc of list) {
        const x = x0 + (x1 - x0) * sc.u;
        const blocked = Math.abs(p.z - sc.z) < 1.2 && (p.x - x) * sc.dir > 0 && (p.x - x) * sc.dir < 2.6;
        if (!blocked) sc.u += (sc.dir * dt * 4.2) / (x1 - x0);
        if (sc.u > 1) {
          sc.u = 1;
          sc.dir = -1;
        } else if (sc.u < 0) {
          sc.u = 0;
          sc.dir = 1;
        }
        sc.s.position.set(x0 + (x1 - x0) * sc.u, 0, sc.z);
        sc.s.rotation.y = sc.dir > 0 ? Math.PI / 2 : -Math.PI / 2;
      }
    },
  };
}

/** A car crawling along the car park aisle looking for a space; it waits for Qish. */
export function searchingCar(x0: number, x1: number, z: number, player: () => THREE.Vector3): Anim & { x: () => number } {
  const g = parkedCar(0, 0, 0, 0x3b6fe0);
  const group = new THREE.Group();
  group.add(g);
  let x = x0;
  let last = -1;
  const blinker = new THREE.Mesh(roundedBox(0.2, 0.12, 0.05), new THREE.MeshBasicMaterial({ color: 0xff9a1a }));
  blinker.position.set(-0.7, 0.62, 1.72);
  g.add(blinker);
  return {
    group,
    x: () => x,
    update(t) {
      const dt = last < 0 ? 0 : Math.min(0.05, t - last);
      last = t;
      const p = player();
      const blocked = Math.abs(p.z - z) < 1.6 && p.x - x > 0 && p.x - x < 3.4;
      if (!blocked) x += dt * 2.6;
      if (x > x1) x = x0;
      g.position.set(x, 0, z);
      g.rotation.y = Math.PI / 2;
      blinker.visible = Math.floor(t * 3) % 2 === 0;
    },
  };
}

// ---------------------------------------------------------------- Weather

/** Drizzle round the camera: slanting streaks, and little rings where they land. */
export function drizzle(n = 520): Anim & { follow(p: THREE.Vector3): void; strength: number } {
  const group = new THREE.Group();
  const pos = new Float32Array(n * 6);
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  const lines = new THREE.LineSegments(geo, new THREE.LineBasicMaterial({ color: 0xdfe7f2, transparent: true, opacity: 0.42, depthWrite: false }));
  lines.frustumCulled = false;
  group.add(lines);
  const r = rng(12);
  const drops = Array.from({ length: n }, () => ({ x: (r() - 0.5) * 48, y: r() * 14, z: (r() - 0.5) * 36, v: 13 + r() * 5 }));
  const ringTex = canvasTexture(64, 64, (c) => {
    c.strokeStyle = "rgba(230,238,248,.9)";
    c.lineWidth = 4;
    c.beginPath();
    c.arc(32, 32, 26, 0, Math.PI * 2);
    c.stroke();
  });
  const rings = Array.from({ length: 26 }, () => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: ringTex, transparent: true, depthWrite: false, opacity: 0 }));
    m.rotation.x = -Math.PI / 2;
    group.add(m);
    return { m, born: -9 };
  });
  let ri = 0;
  const centre = new THREE.Vector3();
  let last = -1;
  const self = {
    group,
    strength: 1,
    follow(p: THREE.Vector3) {
      centre.set(p.x, 0, p.z - 4);
    },
    update(t: number) {
      const dt = last < 0 ? 0 : Math.min(0.05, t - last);
      last = t;
      lines.visible = self.strength > 0.01;
      (lines.material as THREE.LineBasicMaterial).opacity = 0.42 * self.strength;
      for (let i = 0; i < n; i++) {
        const d = drops[i];
        d.y -= d.v * dt;
        d.x += dt * 2.2;
        if (d.y < 0) {
          if (ri % 3 === 0 && self.strength > 0.3) {
            const rg = rings[(ri / 3) % rings.length | 0];
            rg.m.position.set(centre.x + d.x, 0.06, centre.z + d.z);
            rg.born = t;
          }
          ri++;
          d.y += 14;
          d.x = (r() - 0.5) * 48;
          d.z = (r() - 0.5) * 36;
        }
        const x = centre.x + d.x;
        const z = centre.z + d.z;
        pos[i * 6] = x;
        pos[i * 6 + 1] = d.y;
        pos[i * 6 + 2] = z;
        pos[i * 6 + 3] = x - 0.12;
        pos[i * 6 + 4] = d.y + 0.75;
        pos[i * 6 + 5] = z;
      }
      geo.attributes.position.needsUpdate = true;
      for (const rg of rings) {
        const k = (t - rg.born) / 0.5;
        const mat = rg.m.material as THREE.MeshBasicMaterial;
        if (k < 0 || k > 1) {
          mat.opacity = 0;
          continue;
        }
        rg.m.scale.setScalar(0.15 + k * 0.5);
        mat.opacity = (1 - k) * 0.6 * self.strength;
      }
    },
  };
  return self;
}

/** A rainbow over the north once the rain has stopped (after the finale). */
export function rainbow() {
  const tex = canvasTexture(8, 128, (c) => {
    const cols = ["#ff4b4b", "#ff9a3c", "#ffe14d", "#5fd36a", "#4aa8ff", "#7a5cff", "#c46bff"];
    cols.forEach((col, i) => {
      c.fillStyle = col;
      c.fillRect(0, 16 + i * 14, 8, 14);
    });
  });
  const m = new THREE.Mesh(
    new THREE.TorusGeometry(70, 4.2, 4, 64, Math.PI),
    new THREE.MeshBasicMaterial({ map: tex, transparent: true, opacity: 0.38, depthWrite: false, fog: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide }),
  );
  m.position.set(0, -6, -95);
  return m;
}

/** A trackside advertising board on two legs, facing +z unless turned. */
export function hoarding(text: string, bg: string, fg: string, x: number, z: number, w = 5.2, rotY = 0) {
  const g = new THREE.Group();
  const b = panel(wordTex(text, bg, fg, 768, 128, "bold 72px 'Bagel Fat One', sans-serif"), w, 0.95, 0.1, flat(0x2a2730));
  b.position.y = 0.75;
  g.add(b);
  g.position.set(x, 0, z);
  g.rotation.y = rotY;
  return shadowed(g);
}

/** Generic sign texture on a board on a post (wayfinding). */
export function waySign(text: string, x: number, z: number, bg = "#2a2730", fg = "#ffcb05") {
  const g = new THREE.Group();
  const b = panel(signTexture(text, bg, fg, 512, 128, "bold 56px 'Bagel Fat One', sans-serif"), 2.6, 0.65, 0.08, flat(0x2a2730));
  b.position.y = 2.1;
  g.add(b, box(0.1, 1.8, 0.1, flat(0x8c929c), 0, 0.9, 0));
  g.position.set(x, 0, z);
  return shadowed(g);
}

/** An arch over a north-south road: two posts, a beam, the name facing the camera. */
export function archGate(x: number, z: number, text: string, w = 4.6) {
  const g = new THREE.Group();
  const red = flat(0xd8281e);
  for (const sx of [-w / 2, w / 2]) g.add(box(0.4, 3.8, 0.4, red, x + sx, 1.9, z));
  g.add(box(w + 0.6, 0.4, 0.45, red, x, 3.8, z));
  const s = panel(signTexture(text, "#fffdf6", "#1f2f7a", 640, 160, "bold 64px 'Bagel Fat One', sans-serif"), w, 1.05, 0.15, red);
  s.position.set(x, 4.55, z + 0.1);
  g.add(s);
  return shadowed(g);
}

/** The shuttle bus parked in the car park, long side to the camera. */
export function shuttleBus(x: number, z: number) {
  const g = new THREE.Group();
  const side = panel(
    wordTex("SHUTTLE LITAR SEPANG", "#2f62d8", "#fffdf6", 1024, 256, "bold 70px 'Bagel Fat One', sans-serif", "KLIA ↔ SEPANG ↔ LABU LANJUT"),
    8.0,
    2.2,
    2.4,
    flat(0x2f62d8),
  );
  side.position.set(0, 1.55, 0);
  g.add(side);
  g.add(box(8.02, 0.46, 2.42, flat(0x2f4258), 0, 2.38, 0), box(8.1, 0.15, 2.5, flat(0xf4f2ea), 0, 2.75, 0));
  for (const wx of [-2.8, 2.6]) for (const sz of [-1.15, 1.15]) {
    const w = cyl(0.45, 0.3, flat(0x1c1c22), wx, 0.45, sz, 10);
    w.rotation.x = Math.PI / 2;
    g.add(w);
  }
  g.position.set(x, 0, z);
  return shadowed(g);
}

/** "z z z" drifting up off whoever is asleep (Raja Nonchalant, his crew). */
export function sleepyZs(): Anim & { add(x: number, y: number, z: number, seed: number): void } {
  const group = new THREE.Group();
  const tex = canvasTexture(64, 64, (c) => {
    c.fillStyle = "#fffdf6";
    c.strokeStyle = INK;
    c.lineWidth = 7;
    c.font = "bold 50px 'Bagel Fat One', sans-serif";
    c.textAlign = "center";
    c.textBaseline = "middle";
    c.strokeText("z", 32, 34);
    c.fillText("z", 32, 34);
  });
  const list: { s: THREE.Sprite; x: number; y: number; z: number; ph: number }[] = [];
  return {
    group,
    add(x, y, z, seed) {
      for (let k = 0; k < 3; k++) {
        const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false }));
        group.add(s);
        list.push({ s, x, y, z, ph: k / 3 + seed * 0.37 });
      }
    },
    update(t) {
      for (const it of list) {
        const k = (t * 0.35 + it.ph) % 1;
        it.s.position.set(it.x + Math.sin(k * 6 + it.ph * 9) * 0.25 + k * 0.4, it.y + k * 1.4, it.z);
        it.s.scale.setScalar(0.25 + k * 0.35);
        it.s.material.opacity = k < 0.15 ? k / 0.15 : 1 - (k - 0.15) / 0.85;
      }
    },
  };
}

/** A red velvet rope on two brass posts with an ALL ACCESS sign; the rope comes down when `open`. */
export function vipRope(x: number, z: number, open: () => boolean): Anim {
  const group = new THREE.Group();
  const st = new THREE.Group();
  const brass = flat(0xd4af37);
  for (const sx of [-1.75, 1.75]) st.add(cyl(0.07, 1.0, brass, x + sx, 0.5, z), cyl(0.2, 0.06, brass, x + sx, 0.03, z, 12), new THREE.Mesh(new THREE.SphereGeometry(0.1,20,14), brass).translateX(x + sx).translateY(1.02).translateZ(z));
  const sign = panel(wordTex("ALL ACCESS", "#17151f", "#ffcb05", 384, 160, "bold 64px 'Bagel Fat One', sans-serif", "PODIUM · VIP SAHAJA"), 1.3, 0.55, 0.05, flat(0x17151f));
  sign.position.set(x - 2.8, 1.25, z + 0.2);
  sign.rotation.x = -0.15;
  st.add(sign, cyl(0.04, 1.0, flat(0x3a3a40), x - 2.8, 0.5, z + 0.18), cyl(0.18, 0.05, flat(0x3a3a40), x - 2.8, 0.03, z + 0.18, 10));
  group.add(shadowed(st));
  const curve = new THREE.CatmullRomCurve3([new THREE.Vector3(x - 1.7, 0.9, z), new THREE.Vector3(x, 0.62, z + 0.05), new THREE.Vector3(x + 1.7, 0.9, z)]);
  const rope = new THREE.Mesh(new THREE.TubeGeometry(curve, 16, 0.05, 6), flat(0xb3122e));
  rope.castShadow = true;
  group.add(rope);
  // Unhooked: hanging straight down off the left post.
  const hang = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.85, 6), flat(0xb3122e));
  hang.position.set(x - 1.68, 0.5, z + 0.08);
  group.add(hang);
  return {
    group,
    update() {
      const o = open();
      rope.visible = !o;
      hang.visible = o;
    },
  };
}
