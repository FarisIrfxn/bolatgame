import * as THREE from "three";
import { model } from "../overworld/models";
import { mergeStatic } from "../overworld/merge";
import { roundedBox, canvasTexture, flat, signTexture } from "../overworld/props";
import type { Box } from "../overworld/zone";
import { shadowed } from "./common";
import type { Anim } from "./labuProps";
import { setBubbleText, speechDuration } from "../ui/speechBubble";

// Nyomnyom City: a round food town cut like a pizza and drawn on a tiny planet. Cosy Place (fine
// dining, first date) sits in the middle on a marble plaza; a one-way ring road goes round it; eight
// brick streets run out to the crust like slice cuts, and each slice is one place to eat. Dusk: the
// sky goes orange to violet and the shop lights come on.

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

/** Small seeded random, so scattered things land in the same places every visit. */
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

function mesh(geo: THREE.BufferGeometry, mat: THREE.Material | THREE.Material[], x = 0, y = 0, z = 0) {
  const m = new THREE.Mesh(geo, mat);
  m.position.set(x, y, z);
  return m;
}

const basic = (color: number) => new THREE.MeshBasicMaterial({ color });
const glowTex = (() => {
  let t: THREE.Texture | null = null;
  return () => {
    if (!t) {
      t = radial("rgba(255,230,170,1)", "rgba(255,170,80,0)");
      t.userData.shared = true;
    }
    return t;
  };
})();

/** A soft additive glow sprite (bulbs, candles, windows). */
export function glow(x: number, y: number, z: number, size: number, color = 0xffc070, opacity = 0.9) {
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex(), color, transparent: true, opacity, depthWrite: false, blending: THREE.AdditiveBlending }));
  s.position.set(x, y, z);
  s.scale.setScalar(size);
  return s;
}

/** A warm pool of light on the ground. */
export function pool(x: number, z: number, r: number, color = 0xffb468, opacity = 0.45) {
  const m = new THREE.Mesh(
    new THREE.CircleGeometry(r, 20),
    new THREE.MeshBasicMaterial({ map: glowTex(), color, transparent: true, opacity, depthWrite: false, blending: THREE.AdditiveBlending }),
  );
  m.rotation.x = -Math.PI / 2;
  m.position.set(x, 0.05, z);
  return m;
}

// ---------------------------------------------------------------- Layout

export const DEG = Math.PI / 180;
/** Inner edge of the crust: the walkable city is a disc this size. */
export const CITY_R = 32.6;
export const PLAZA_R = 9.6;
export const ROAD_IN = 10.4;
export const ROAD_OUT = 14.6;
export const WALK_OUT = 16.2;
export const STREET_W = 3.4;
/** Way in from KLIA (south) and out to Lorong Photobooth (north-east). */
export const ENTRY_A = 90 * DEG;
export const EXIT_A = -45 * DEG;
/** The rotunda's marble floor. */
export const ROTUNDA_R = 7.1;

export const polar = (r: number, a: number): [number, number] => [r * Math.cos(a), r * Math.sin(a)];
/** A point in a slice given in degrees, out along it (`r`) and across it (`t`, clockwise positive). */
export const nyomPoint = (deg: number, r: number, t: number): [number, number] => {
  const a = deg * DEG;
  return [r * Math.cos(a) - t * Math.sin(a), r * Math.sin(a) + t * Math.cos(a)];
};

/** A slice's local frame: origin at radius `r` on angle `a`, local +z pointing in to the middle (or,
 * with `out`, out towards the crust). */
export const facing = (a: number, out = false) => Math.atan2(-Math.cos(a), -Math.sin(a)) + (out ? Math.PI : 0);
export function local(a: number, r: number, lx: number, lz: number, out = false): [number, number] {
  const [cx, cz] = polar(r, a);
  const th = facing(a, out);
  return [cx + lx * Math.cos(th) + lz * Math.sin(th), cz - lx * Math.sin(th) + lz * Math.cos(th)];
}
export function placeAt<T extends THREE.Object3D>(o: T, a: number, r: number, out = false): T {
  const [x, z] = polar(r, a);
  o.position.set(x, o.position.y, z);
  o.rotation.y = facing(a, out);
  return o;
}

/** Collider boxes covering a rotated rectangle (local w × d at the slice frame), cut into strips. */
export function slabBoxes(a: number, r: number, lx: number, lz: number, w: number, d: number, strips = 5, out = false): Box[] {
  const res: Box[] = [];
  const long = w >= d;
  for (let i = 0; i < strips; i++) {
    const f0 = -0.5 + i / strips;
    const f1 = f0 + 1 / strips;
    const pts = long
      ? [[lx + f0 * w, lz - d / 2], [lx + f1 * w, lz - d / 2], [lx + f0 * w, lz + d / 2], [lx + f1 * w, lz + d / 2]]
      : [[lx - w / 2, lz + f0 * d], [lx + w / 2, lz + f0 * d], [lx - w / 2, lz + f1 * d], [lx + w / 2, lz + f1 * d]];
    const ws = pts.map(([px, pz]) => local(a, r, px, pz, out));
    const xs = ws.map((p) => p[0]);
    const zs = ws.map((p) => p[1]);
    // Shrink a little: the axis-aligned box of a turned strip overhangs it.
    const sx = (Math.max(...xs) - Math.min(...xs)) * 0.12;
    const sz = (Math.max(...zs) - Math.min(...zs)) * 0.12;
    res.push([Math.min(...xs) + sx, Math.min(...zs) + sz, Math.max(...xs) - sx, Math.max(...zs) - sz]);
  }
  return res;
}

/** True where Qish can't walk: past the crust (except through the two gates). */
export function outsideCity(x: number, z: number) {
  const r = Math.hypot(x, z);
  if (r < CITY_R - 0.4) return false;
  const a = Math.atan2(z, x);
  for (const g of [ENTRY_A, EXIT_A]) {
    const d = Math.abs(Math.atan2(Math.sin(a - g), Math.cos(a - g)));
    if (d * r < STREET_W / 2 - 0.25) return false;
  }
  return true;
}

// ---------------------------------------------------------------- Floor

const FLOOR_R = 36;

/** Slice tints, keyed by slice centre angle (degrees): each topping its own colour. */
const SLICE_TINT: [number, string, string][] = [
  [112.5, "#fbe9b4", "#efd58e"], // kek mango
  [157.5, "#5d5f68", "#4c4e57"], // parking
  [202.5, "#e8e4c2", "#d6d0a2"], // ayam gepuk
  [247.5, "#f2cdbf", "#e3b2a2"], // malatang
  [292.5, "#d9d4d8", "#c4bec4"], // dubuyo
  [337.5, "#f6dcc0", "#ebc49f"], // mcd
  [22.5, "#d9c29a", "#c8ab7c"], // daging salai (packed earth)
  [67.5, "#f6d6dc", "#ebbcc6"], // cookies
];

function sector(g: CanvasRenderingContext2D, r0: number, r1: number, a0: number, a1: number) {
  g.beginPath();
  g.arc(0, 0, r1, a0, a1);
  g.arc(0, 0, r0, a1, a0, true);
  g.closePath();
}

/** The whole city floor painted top-down on one canvas: slices, brick streets, sidewalks, the ring
 * road with its zebras, the marble plaza and the toasted crust bed. */
export function cityFloor() {
  const N = 2048;
  const k = N / (FLOOR_R * 2);
  const r = rng(11);
  const tex = canvasTexture(N, N, (g) => {
    g.translate(N / 2, N / 2);
    g.scale(k, k);
    g.fillStyle = "#6f9a43";
    g.fillRect(-FLOOR_R, -FLOOR_R, FLOOR_R * 2, FLOOR_R * 2);
    // Toasted crust bed.
    g.fillStyle = "#b9732f";
    g.beginPath();
    g.arc(0, 0, 35.6, 0, Math.PI * 2);
    g.fill();
    // Slices, each paved in its own tint with a tile grid.
    for (const [deg, fill, line] of SLICE_TINT) {
      const a0 = (deg - 22.5) * DEG;
      const a1 = (deg + 22.5) * DEG;
      sector(g, WALK_OUT, CITY_R + 0.6, a0, a1);
      g.fillStyle = fill;
      g.fill();
      g.save();
      g.clip();
      if (deg === 157.5) {
        // The car park: bays either side of a driving aisle.
        g.rotate(deg * DEG);
        g.strokeStyle = "#f2f0ea";
        g.lineWidth = 0.12;
        for (const lane of [-1, 1]) {
          for (let x = 19; x < 31; x += 2.6) {
            g.beginPath();
            g.moveTo(x, lane * 1.6);
            g.lineTo(x, lane * 5.6);
            g.stroke();
          }
        }
        g.fillStyle = "rgba(255,255,255,.5)";
        g.font = "bold 1.4px sans-serif";
        g.textAlign = "center";
        g.fillText("P", 30, 0.5);
      } else {
        g.strokeStyle = line;
        g.lineWidth = 0.07;
        for (let x = -CITY_R; x < CITY_R; x += 1.2) {
          g.beginPath();
          g.moveTo(x, -CITY_R);
          g.lineTo(x, CITY_R);
          g.moveTo(-CITY_R, x);
          g.lineTo(CITY_R, x);
          g.stroke();
        }
        g.fillStyle = "rgba(0,0,0,.05)";
        for (let i = 0; i < 260; i++) {
          const rr = WALK_OUT + r() * (CITY_R - WALK_OUT);
          const aa = a0 + r() * (a1 - a0);
          g.fillRect(Math.cos(aa) * rr, Math.sin(aa) * rr, 1.15, 1.15);
        }
      }
      g.restore();
    }
    // Outer sidewalk.
    sector(g, ROAD_OUT, WALK_OUT, 0, Math.PI * 2);
    g.fillStyle = "#d8d2c6";
    g.fill();
    g.strokeStyle = "#bdb5a6";
    g.lineWidth = 0.06;
    for (let a = 0; a < 360; a += 3) {
      g.beginPath();
      g.moveTo(Math.cos(a * DEG) * ROAD_OUT, Math.sin(a * DEG) * ROAD_OUT);
      g.lineTo(Math.cos(a * DEG) * WALK_OUT, Math.sin(a * DEG) * WALK_OUT);
      g.stroke();
    }
    // Brick streets out to the crust (the slice cuts), herringbone-ish rows.
    for (let i = 0; i < 8; i++) {
      g.save();
      g.rotate(i * 45 * DEG);
      g.fillStyle = "#c4553a";
      g.fillRect(ROAD_OUT, -STREET_W / 2, CITY_R + 3.4 - ROAD_OUT, STREET_W);
      g.strokeStyle = "#a8432c";
      g.lineWidth = 0.06;
      for (let x = ROAD_OUT; x < CITY_R + 3.4; x += 0.5) {
        const off = Math.round((x - ROAD_OUT) / 0.5) % 2 ? 0.2 : 0;
        g.beginPath();
        g.moveTo(x, -STREET_W / 2);
        g.lineTo(x, STREET_W / 2);
        g.stroke();
        for (let y = -STREET_W / 2 + off; y < STREET_W / 2; y += 0.42) {
          g.beginPath();
          g.moveTo(x, y);
          g.lineTo(x + 0.5, y);
          g.stroke();
        }
      }
      g.fillStyle = "#e8dccb";
      g.fillRect(WALK_OUT, -STREET_W / 2 - 0.12, CITY_R - WALK_OUT, 0.18);
      g.fillRect(WALK_OUT, STREET_W / 2 - 0.06, CITY_R - WALK_OUT, 0.18);
      g.restore();
    }
    // Ring road: asphalt, edge lines, a dashed centre line, a zebra at every street.
    sector(g, ROAD_IN, ROAD_OUT, 0, Math.PI * 2);
    g.fillStyle = "#3d3f48";
    g.fill();
    g.fillStyle = "rgba(255,255,255,.035)";
    for (let i = 0; i < 1600; i++) {
      const rr = ROAD_IN + r() * (ROAD_OUT - ROAD_IN);
      const aa = r() * Math.PI * 2;
      g.fillRect(Math.cos(aa) * rr, Math.sin(aa) * rr, 0.08, 0.08);
    }
    g.strokeStyle = "#f2f0ea";
    g.lineWidth = 0.12;
    for (const rr of [ROAD_IN + 0.3, ROAD_OUT - 0.3]) {
      g.beginPath();
      g.arc(0, 0, rr, 0, Math.PI * 2);
      g.stroke();
    }
    g.strokeStyle = "#ffd23f";
    g.setLineDash([1.2, 1.0]);
    g.beginPath();
    g.arc(0, 0, (ROAD_IN + ROAD_OUT) / 2, 0, Math.PI * 2);
    g.stroke();
    g.setLineDash([]);
    for (let i = 0; i < 8; i++) {
      g.save();
      g.rotate(i * 45 * DEG);
      g.fillStyle = "#3d3f48";
      g.fillRect(ROAD_IN + 0.2, -STREET_W / 2, ROAD_OUT - ROAD_IN - 0.4, STREET_W);
      g.fillStyle = "#f6f4ee";
      for (let x = ROAD_IN + 0.45; x < ROAD_OUT - 0.4; x += 0.6) g.fillRect(x, -STREET_W / 2 + 0.15, 0.32, STREET_W - 0.3);
      g.restore();
    }
    // Inner kerb walk.
    sector(g, PLAZA_R, ROAD_IN, 0, Math.PI * 2);
    g.fillStyle = "#e4ddd0";
    g.fill();
    // Marble plaza: cream with a gold-and-rose compass rosette.
    g.fillStyle = "#f3ebdd";
    g.beginPath();
    g.arc(0, 0, PLAZA_R, 0, Math.PI * 2);
    g.fill();
    g.strokeStyle = "#c9a14a";
    g.lineWidth = 0.14;
    for (const rr of [PLAZA_R - 0.35, ROTUNDA_R + 0.9]) {
      g.beginPath();
      g.arc(0, 0, rr, 0, Math.PI * 2);
      g.stroke();
    }
    for (let i = 0; i < 32; i++) {
      const a = (i / 32) * Math.PI * 2;
      g.fillStyle = i % 2 ? "#e9d3c4" : "#efe2cf";
      g.beginPath();
      g.moveTo(Math.cos(a) * (ROTUNDA_R + 0.9), Math.sin(a) * (ROTUNDA_R + 0.9));
      g.lineTo(Math.cos(a + Math.PI / 32) * (PLAZA_R - 0.35), Math.sin(a + Math.PI / 32) * (PLAZA_R - 0.35));
      g.lineTo(Math.cos(a + Math.PI / 16) * (ROTUNDA_R + 0.9), Math.sin(a + Math.PI / 16) * (ROTUNDA_R + 0.9));
      g.closePath();
      g.fill();
    }
  });
  tex.anisotropy = 8;
  const m = new THREE.Mesh(new THREE.RingGeometry(0, FLOOR_R, 128, 40), new THREE.MeshLambertMaterial({ map: tex }));
  m.rotation.x = -Math.PI / 2;
  m.receiveShadow = true;
  return m;
}

/** Grass from the crust out to (and over) the horizon. */
export function outerGrass() {
  const tex = canvasTexture(256, 256, (g) => {
    g.fillStyle = "#6f9a43";
    g.fillRect(0, 0, 256, 256);
    for (let i = 0; i < 900; i++) {
      g.fillStyle = Math.random() > 0.5 ? "#7da94e" : "#628c3a";
      g.fillRect(Math.random() * 256, Math.random() * 256, 3, 6);
    }
  });
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(26, 26);
  const m = new THREE.Mesh(new THREE.RingGeometry(FLOOR_R - 0.6, 90, 128, 30), new THREE.MeshLambertMaterial({ map: tex }));
  m.rotation.x = -Math.PI / 2;
  m.position.y = -0.01;
  m.receiveShadow = true;
  return m;
}

// ---------------------------------------------------------------- Crust

/** The pizza crust: a fat, lumpy ring of baked dough round the city (golden on top, toasted spots, a
 * few burnt bubbles), broken only where the two gates go through. */
export function crust() {
  const g = new THREE.Group();
  // The dough keeps its vertex colours, so it stays out of mergeStatic (which drops them).
  const dough = new THREE.Group();
  const R = 34.2;
  const gap = (STREET_W / 2 + 1.5) / R;
  const golden = new THREE.Color(0xe9b062);
  const toasty = new THREE.Color(0xb86a2a);
  const pale = new THREE.Color(0xf6d79a);
  const mat = new THREE.MeshLambertMaterial({ vertexColors: true });
  // Two arcs between the gates (angles increase clockwise on screen).
  const arcs: [number, number][] = [
    [ENTRY_A + gap, EXIT_A + Math.PI * 2 - gap],
    [EXIT_A + gap, ENTRY_A - gap],
  ];
  for (const [a0, a1] of arcs) {
    const span = (((a1 - a0) % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
    const geo = new THREE.TorusGeometry(R, 1.25, 12, Math.ceil(span * 40), span);
    // Torus is built in the XY plane from +X going anticlockwise; lay it flat (XZ) so it runs from a0
    // with the angle increasing like the rest of the city.
    geo.rotateX(Math.PI / 2);
    geo.rotateY(-a0);
    const pos = geo.attributes.position as THREE.BufferAttribute;
    const colors: number[] = [];
    const c = new THREE.Color();
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      const z = pos.getZ(i);
      const a = Math.atan2(z, x);
      const r = Math.hypot(x, z);
      // Lumps along the ring, a flatter bottom, a puffed-up top.
      const lump = 1 + Math.sin(a * 37) * 0.1 + Math.sin(a * 91 + 1.3) * 0.07 + Math.sin(a * 13) * 0.05;
      const k = (r - R) * lump;
      const yy = (y > 0 ? y * 0.85 : y * 0.4) * lump + 0.55;
      pos.setXYZ(i, Math.cos(a) * (R + k), yy, Math.sin(a) * (R + k));
      const top = THREE.MathUtils.clamp(y / 1.25, 0, 1);
      const spot = Math.sin(a * 53 + y * 3) * Math.sin(a * 29 - x * 0.1) > 0.55;
      c.copy(toasty).lerp(golden, 0.4 + top * 0.6);
      if (top > 0.6) c.lerp(pale, (top - 0.6) * 0.8);
      if (spot) c.lerp(toasty, 0.7);
      colors.push(c.r, c.g, c.b);
    }
    geo.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
    geo.computeVertexNormals();
    dough.add(new THREE.Mesh(geo, mat));
    // Rounded ends either side of each gate.
    for (const a of [a0, a1]) {
      const end = mesh(new THREE.SphereGeometry(1.25,20,14), flat(0xd9973f), Math.cos(a) * R, 0.55, Math.sin(a) * R);
      end.scale.set(1, 0.8, 1);
      g.add(end);
    }
  }
  const r = rng(5);
  const burnt = flat(0x7a3f18);
  for (let i = 0; i < 70; i++) {
    const a = r() * Math.PI * 2;
    if ([ENTRY_A, EXIT_A].some((x) => Math.abs(Math.atan2(Math.sin(a - x), Math.cos(a - x))) < gap + 0.04)) continue;
    const rr = R + (r() - 0.5) * 1.2;
    g.add(mesh(new THREE.SphereGeometry(0.16 + r() * 0.16, 6, 4), burnt, Math.cos(a) * rr, 1.55 + r() * 0.2, Math.sin(a) * rr));
  }
  const out = mergeStatic(shadowed(g));
  out.add(shadowed(dough));
  return out;
}

/** A welcome arch over a gate in the crust: two bread-brown pillars and a signboard across. `a` is the
 * gate's angle; the sign faces into the city (or out, for a gate on the camera's side). */
export function gateArch(a: number, text: string, sub: string, bg: string, fg: string, out = false) {
  const g = new THREE.Group();
  const pillar = flat(0xc47a30);
  const cap = flat(0xf0d39a);
  for (const sx of [-1, 1]) {
    g.add(mesh(roundedBox(0.7, 4.4, 0.7), pillar, sx * (STREET_W / 2 + 0.6), 2.2, 0));
    g.add(mesh(new THREE.SphereGeometry(0.55,20,14), cap, sx * (STREET_W / 2 + 0.6), 4.6, 0));
  }
  const tex = canvasTexture(1024, 256, (c) => {
    c.fillStyle = bg;
    c.beginPath();
    c.roundRect(8, 8, 1008, 240, 60);
    c.fill();
    c.lineWidth = 12;
    c.strokeStyle = INK;
    c.stroke();
    c.fillStyle = fg;
    c.textAlign = "center";
    c.textBaseline = "middle";
    c.font = "bold 120px 'Bagel Fat One', sans-serif";
    c.fillText(text, 512, 110);
    c.font = "bold 50px 'Gaegu', sans-serif";
    c.fillText(sub, 512, 205);
  });
  const sign = mesh(new THREE.PlaneGeometry(STREET_W + 2.8, (STREET_W + 2.8) / 4), new THREE.MeshLambertMaterial({ map: tex, transparent: true, side: THREE.DoubleSide }), 0, 4.1, 0);
  g.add(sign);
  placeAt(g, a, 34.1, out);
  return shadowed(g);
}

// ---------------------------------------------------------------- Street furniture

/** A black iron street lamp with a glowing globe and a pool of light (dusk). */
export function streetLamp(x: number, z: number, h = 3.6) {
  const g = new THREE.Group();
  const iron = flat(0x26262e);
  g.add(mesh(new THREE.CylinderGeometry(0.07, 0.11, h, 6), iron, 0, h / 2, 0));
  g.add(mesh(new THREE.CylinderGeometry(0.2, 0.26, 0.3, 8), iron, 0, 0.15, 0));
  g.add(mesh(new THREE.SphereGeometry(0.28,20,14), basic(0xfff0c4), 0, h + 0.2, 0));
  g.add(mesh(new THREE.ConeGeometry(0.22, 0.2, 8), iron, 0, h + 0.5, 0));
  g.position.set(x, 0, z);
  return { group: shadowed(g), glow: glow(x, h + 0.2, z, 1.9, 0xffc878, 0.85), pool: pool(x, z, 2.4) };
}

/** A round "pepperoni" planter: dark red tub, a dome of red and orange flowers. */
export function pepperoni(x: number, z: number, s = 1, seed = 0) {
  const g = new THREE.Group();
  const r = rng(seed + 9);
  g.add(mesh(new THREE.CylinderGeometry(0.85 * s, 0.75 * s, 0.38, 16), flat(0x9a2f22), 0, 0.19, 0));
  g.add(mesh(new THREE.CylinderGeometry(0.78 * s, 0.78 * s, 0.05, 16), flat(0x5a3a22), 0, 0.39, 0));
  const leaf = flat(0x3f7f34);
  for (let i = 0; i < 9; i++) {
    const a = r() * Math.PI * 2;
    const d = r() * 0.55 * s;
    g.add(mesh(new THREE.SphereGeometry(0.22 * s, 24, 16), leaf, Math.cos(a) * d, 0.5, Math.sin(a) * d));
  }
  const petals = [0xe63b2e, 0xff7a3d, 0xffd23f, 0xd92f5b].map((c) => flat(c));
  for (let i = 0; i < 14; i++) {
    const a = r() * Math.PI * 2;
    const d = r() * 0.62 * s;
    g.add(mesh(new THREE.SphereGeometry(0.1 * s, 24, 16), petals[i % petals.length], Math.cos(a) * d, 0.62 + r() * 0.08, Math.sin(a) * d));
  }
  g.position.set(x, 0, z);
  return shadowed(g);
}

/** Bench facing in to the middle. */
export function parkBench(a: number, r: number) {
  const g = new THREE.Group();
  const wood = flat(0xa0683a);
  const iron = flat(0x2a2a30);
  for (let i = 0; i < 3; i++) g.add(mesh(roundedBox(1.8, 0.07, 0.16), wood, 0, 0.48, -0.15 + i * 0.17));
  for (let i = 0; i < 2; i++) g.add(mesh(roundedBox(1.8, 0.16, 0.05), wood, 0, 0.72 + i * 0.2, -0.3));
  for (const sx of [-0.8, 0.8]) g.add(mesh(roundedBox(0.08, 0.5, 0.5), iron, sx, 0.25, 0));
  placeAt(g, a, r);
  return shadowed(g);
}

/** Tree in a round grate, for the sidewalk and the slices. */
export function cityTree(x: number, z: number, s = 1, seed = 0) {
  const g = new THREE.Group();
  const r = rng(seed + 2);
  g.add(mesh(new THREE.CylinderGeometry(0.6 * s, 0.6 * s, 0.06, 12), flat(0x4a4a50), 0, 0.03, 0));
  g.add(mesh(new THREE.CylinderGeometry(0.1 * s, 0.15 * s, 1.8 * s, 6), flat(0x6b4f35), 0, 0.9 * s, 0));
  const greens = [0x4f9a3a, 0x5aa843, 0x3f8a34];
  for (let i = 0; i < 4; i++) {
    g.add(mesh(new THREE.IcosahedronGeometry((0.75 + r() * 0.3) * s, 1), flat(greens[i % 3]), (r() - 0.5) * 0.9 * s, (2.1 + r() * 0.6) * s, (r() - 0.5) * 0.9 * s));
  }
  g.position.set(x, 0, z);
  return shadowed(g);
}

// ---------------------------------------------------------------- Ring road traffic

export function carMesh(body: number, kind: "car" | "van" | "taxi") {
  const generated = model(kind === "taxi" ? "bb_taxi" : kind === "van" ? "bb_car_green" : "bb_car_red", kind === "van" ? 3.4 : 3);
  if (generated) {
    const car = new THREE.Group();
    // A contact shadow follows the bent road itself; directional shadows are in
    // flat world space and used to detach the wheels visually from Nyomnyom's road.
    const contact = canvasTexture(128,128,g => {
      const shade = g.createRadialGradient(64,64,12,64,64,64);
      shade.addColorStop(0,"rgba(48,29,39,.42)"); shade.addColorStop(1,"rgba(48,29,39,0)");
      g.fillStyle = shade; g.fillRect(0,0,128,128);
    });
    const shadow = new THREE.Mesh(new THREE.PlaneGeometry(1.85,kind === "van" ? 3.5 : 3.1),new THREE.MeshBasicMaterial({map:contact,transparent:true,depthWrite:false}));
    shadow.rotation.x = -Math.PI / 2; shadow.position.y = .018;
    generated.position.y = -.04;
    car.add(shadow,generated);
    return car;
  }
  const g = new THREE.Group();
  const paint = flat(body);
  const glass = flat(0x2b3a4f);
  const len = kind === "van" ? 3.4 : 3;
  g.add(mesh(roundedBox(1.5, 0.55, len), paint, 0, 0.5, 0));
  const cab = mesh(roundedBox(1.32, 0.5, kind === "van" ? 2.6 : 1.6), glass, 0, 1.0, kind === "van" ? -0.2 : -0.1);
  g.add(cab);
  g.add(mesh(roundedBox(1.36, 0.08, kind === "van" ? 2.66 : 1.66), paint, 0, 1.28, cab.position.z));
  if (kind === "taxi") {
    g.add(mesh(roundedBox(0.5, 0.18, 0.26), basic(0xffd23f), 0, 1.42, -0.1));
    g.add(mesh(roundedBox(1.52, 0.12, len - 0.2), flat(0xffd23f), 0, 0.62, 0));
  }
  const tyre = flat(0x1b1b20);
  for (const sx of [-0.72, 0.72]) for (const sz of [-len / 2 + 0.6, len / 2 - 0.6]) {
    const w = mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.22, 10), tyre, sx, 0.3, sz);
    w.rotation.z = Math.PI / 2;
    g.add(w);
  }
  for (const sx of [-0.5, 0.5]) {
    g.add(mesh(roundedBox(0.28, 0.14, 0.05), basic(0xfff3c8), sx, 0.58, len / 2 + 0.01));
    g.add(mesh(roundedBox(0.28, 0.12, 0.05), basic(0xff3b30), sx, 0.6, -len / 2 - 0.01));
  }
  return mergeStatic(shadowed(g));
}

/** A food-delivery rider on a scooter with a big pink box. */
function scooterMesh() {
  const g = new THREE.Group();
  g.add(mesh(roundedBox(0.4, 0.4, 1.4), flat(0xf2f0ea), 0, 0.45, 0));
  g.add(mesh(roundedBox(0.75, 0.7, 0.7), flat(0xff4f8b), 0, 1.2, -0.45));
  g.add(mesh(roundedBox(0.44, 0.7, 0.3), flat(0xff4f8b), 0, 1.15, 0.1));
  g.add(mesh(new THREE.SphereGeometry(0.22,20,14), flat(0xff4f8b), 0, 1.7, 0.1));
  for (const z of [-0.55, 0.55]) {
    const w = mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.14, 10), flat(0x1b1b20), 0, 0.22, z);
    w.rotation.z = Math.PI / 2;
    g.add(w);
  }
  g.add(mesh(roundedBox(0.2, 0.1, 0.05), basic(0xfff3c8), 0, 0.7, 0.72));
  return mergeStatic(shadowed(g));
}

/** Cars and a delivery scooter going clockwise round the ring road. Each keeps its distance from the
 * one ahead, and everything stops for Qish (and Bowat). `solid()` gives two circles per car (nose and
 * tail) so she can't walk through one that has stopped. */
export function ringTraffic(stoppers: () => readonly THREE.Vector3[]): Anim & { solid: () => readonly THREE.Vector3[] } {
  const group = new THREE.Group();
  const lanes = [ROAD_IN + 1.15, ROAD_OUT - 1.15];
  const spec: [number, number, "car" | "van" | "taxi" | "scooter", number][] = [
    [0, 0, "car", 0xd94a3a],
    [0, 1.7, "taxi", 0xf2f0ea],
    [0, 3.4, "car", 0x3b6fe0],
    [0, 5.0, "scooter", 0],
    [1, 0.8, "van", 0xf2e6c8],
    [1, 2.6, "car", 0x46b86a],
    [1, 4.4, "car", 0xffcb05],
  ];
  const cars = spec.map(([lane, a, kind, color], i) => {
    const m = kind === "scooter" ? scooterMesh() : carMesh(color, kind);
    group.add(m);
    return { m, lane, a, v: 0, top: (kind === "scooter" ? 6.2 : 4.6) * (1 + (i % 3) * 0.06), len: kind === "scooter" ? 1.6 : 3.4, ends: [new THREE.Vector3(), new THREE.Vector3()] };
  });
  const solid = cars.flatMap((c) => c.ends);
  const tick = ticker();
  const update = (t: number) => {
    const dt = tick(t);
    const people = stoppers();
    for (const c of cars) {
      const r = lanes[c.lane];
      // Gap (in metres along the lane) to the next car ahead, and to Qish if she's on this lane.
      let gap = Infinity;
      for (const o of cars) {
        if (o === c || o.lane !== c.lane) continue;
        const d = (((o.a - c.a) % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
        gap = Math.min(gap, d * r - (o.len + c.len) / 2);
      }
      for (const p of people) {
        if (Math.abs(Math.hypot(p.x, p.z) - r) > 1.5) continue;
        const d = (((Math.atan2(p.z, p.x) - c.a) % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
        gap = Math.min(gap, d * r - c.len / 2 - 0.9);
      }
      const want = Math.max(0, Math.min(c.top, (gap - 0.8) * 1.6));
      c.v += (want - c.v) * Math.min(1, dt * (want < c.v ? 6 : 1.4));
      c.a += (c.v / r) * dt;
      c.m.position.set(Math.cos(c.a) * r, 0, Math.sin(c.a) * r);
      // Driving clockwise on screen (angle increasing): nose along the tangent.
      c.m.rotation.y = Math.atan2(-Math.sin(c.a), Math.cos(c.a));
      const da = (c.len / 2 - 0.7) / r;
      c.ends[0].set(Math.cos(c.a + da) * r, 0, Math.sin(c.a + da) * r);
      c.ends[1].set(Math.cos(c.a - da) * r, 0, Math.sin(c.a - da) * r);
    }
  };
  return { group, update, solid: () => solid };
}

// ---------------------------------------------------------------- Bowat's route

const SIDEWALK = (ROAD_OUT + WALK_OUT) / 2;
export const SIDEWALK_R = SIDEWALK;
const nearestStreet = (a: number) => Math.round(a / (45 * DEG)) * 45 * DEG;

/** The way Bowat dashes between places: out of a slice along its nearest street, clockwise round the
 * outer sidewalk, and up the next street; or, at the end, over the zebra at the front and up the red
 * carpet into Cosy Place (`cosy` = the points from the kerb to his chair). */
export function bowatTrail(from: [number, number], to: [number, number], cosy?: [number, number][]): [number, number][] {
  const pts: [number, number][] = [from];
  const rf = Math.hypot(...from);
  let a0 = Math.atan2(from[1], from[0]);
  if (rf > WALK_OUT - 0.3) {
    a0 = nearestStreet(a0);
    pts.push(polar(rf, a0), polar(SIDEWALK, a0));
  }
  const a1 = cosy ? ENTRY_A : nearestStreet(Math.atan2(to[1], to[0]));
  const span = (((a1 - a0) % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
  for (let k = 6 * DEG; k < span; k += 6 * DEG) pts.push(polar(SIDEWALK, a0 + k));
  pts.push(polar(SIDEWALK, a1));
  if (cosy) pts.push(...cosy);
  else pts.push(polar(Math.hypot(...to), a1), to);
  return pts;
}

// ---------------------------------------------------------------- Bits

/** A floating word that pops up over something for a moment ("GEPUK!", "NYOM!"). */
export function popWord(height: number, w = 2.2) {
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ transparent: true, depthWrite: false, depthTest: false }));
  sprite.scale.set(w, w * 0.3, 1);
  sprite.visible = false;
  sprite.renderOrder = 6;
  let until = -1;
  let pending: string | null = null;
  return {
    sprite,
    say(text: string) {
      pending = text;
    },
    update(t: number, x: number, z: number, y0 = 0) {
      if (pending) {
        setBubbleText(sprite, pending);
        until = t + speechDuration(pending, 1.6);
        pending = null;
      }
      sprite.visible = t < until;
      if (sprite.visible) sprite.position.set(x, y0 + height + Math.min(0.25, (until - t) * 0.5), z);
    },
  };
}

/** A painted signboard (Bagel Fat One on a colour, ink edge) as a flat mesh facing local +z. */
export function sign(text: string, w: number, h: number, bg: string, fg: string, sub?: string, font = "'Bagel Fat One', sans-serif") {
  const px = 256;
  const tex = canvasTexture(Math.round(px * (w / h)), px, (g) => {
    const W = g.canvas.width;
    g.fillStyle = bg;
    g.beginPath();
    g.roundRect(4, 4, W - 8, px - 8, 28);
    g.fill();
    g.lineWidth = 8;
    g.strokeStyle = INK;
    g.stroke();
    g.fillStyle = fg;
    g.textAlign = "center";
    g.textBaseline = "middle";
    let size = sub ? 120 : 150;
    g.font = `bold ${size}px ${font}`;
    while (g.measureText(text).width > W - 50 && size > 30) g.font = `bold ${(size -= 6)}px ${font}`;
    g.fillText(text, W / 2, sub ? px * 0.4 : px / 2 + 6);
    if (sub) {
      g.font = "bold 54px 'Gaegu', sans-serif";
      g.fillText(sub, W / 2, px * 0.8);
    }
  });
  return mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshLambertMaterial({ map: tex, transparent: true, emissive: 0x332211, emissiveIntensity: 0.4 }));
}

/** An A-frame chalkboard menu on the pavement. */
export function chalkboard(lines: string[], x: number, z: number, rotY: number) {
  const g = new THREE.Group();
  const tex = canvasTexture(192, 256, (c) => {
    c.fillStyle = "#2c3a33";
    c.fillRect(0, 0, 192, 256);
    c.strokeStyle = "#a0683a";
    c.lineWidth = 14;
    c.strokeRect(0, 0, 192, 256);
    c.fillStyle = "#f6f1e4";
    c.textAlign = "center";
    c.font = "bold 34px 'Gaegu', sans-serif";
    lines.forEach((l, i) => c.fillText(l, 96, 52 + i * 44));
  });
  const face = new THREE.MeshLambertMaterial({ map: tex });
  const wood = flat(0xa0683a);
  for (const s of [-1, 1]) {
    const b = mesh(roundedBox(0.75, 1.0, 0.04), [wood, wood, wood, wood, face, face], 0, 0.52, s * 0.16);
    b.rotation.x = s * 0.28;
    g.add(b);
  }
  g.position.set(x, 0, z);
  g.rotation.y = rotY;
  return shadowed(g);
}

export { INK, basic, mesh, radial, rng, ticker, signTexture };

/** Things past the planet's horizon can't be seen, but with frustum culling off (the bend pulls things
 * into view) they would still be drawn. Hide whatever is further than `reach` from Qish; each entry is
 * a fixed spot with a radius, or something that moves (its own position). */
export function horizonCull(player: () => THREE.Vector3, reach = 31) {
  const fixed: { o: THREE.Object3D; x: number; z: number; r: number }[] = [];
  const moving: { o: THREE.Object3D; r: number }[] = [];
  return {
    at(o: THREE.Object3D, x: number, z: number, r: number) {
      fixed.push({ o, x, z, r });
    },
    follow(o: THREE.Object3D, r = 1.5) {
      moving.push({ o, r });
    },
    update() {
      const p = player();
      for (const f of fixed) f.o.visible = Math.hypot(f.x - p.x, f.z - p.z) - f.r < reach;
      for (const m of moving) m.o.visible = Math.hypot(m.o.position.x - p.x, m.o.position.z - p.z) - m.r < reach;
    },
  };
}
