import * as THREE from "three";
import { type JogLook, type PersonLook, cyclistDoodle, joggerDoodle, passengerDoodle } from "../content/doodles";
import { sfx } from "../core/sfx";
import { paperStandee } from "../overworld/paper";
import { roundedBox, canvasTexture, flat, signTexture } from "../overworld/props";
import { paintedMat } from "../overworld/textures";
import { splatShape, type MaskPainter } from "../overworld/splat";
import type { Box } from "../overworld/zone";
import { shadowed } from "./common";
import { oilPalm, rainTree, type Anim } from "./labuProps";
import { bubbleTex, setBubbleText, speechDuration } from "../ui/speechBubble";

// Putrajaya on a late afternoon: Jambatan Putra over the lake, Persiaran Perdana running up to the
// Dataran Putra roundabout with its star garden, Masjid Putra's pink dome on the water to the west,
// Perdana Putra's green dome at the top. Car-free evening, so the boulevard belongs to the joggers.

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

function radial(inner: string, outer: string, size = 64) {
  return canvasTexture(size, size, (g) => {
    const grad = g.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    grad.addColorStop(0, inner);
    grad.addColorStop(1, outer);
    g.fillStyle = grad;
    g.fillRect(0, 0, size, size);
  });
}

/** A cylinder between two points (frames, rails, handles). */
function rod(a: THREE.Vector3, b: THREE.Vector3, r: number, mat: THREE.Material, seg = 6) {
  const len = a.distanceTo(b);
  const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, len, seg), mat);
  m.position.copy(a).add(b).multiplyScalar(0.5);
  m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), b.clone().sub(a).normalize());
  return m;
}

const v3 = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

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

/** A square pyramid roof (hip roof) of the given footprint, sitting on y = 0. */
function hipRoof(w: number, d: number, h: number, mat: THREE.Material) {
  const geo = new THREE.ConeGeometry(Math.SQRT1_2, 1, 4, 1);
  geo.rotateY(Math.PI / 4);
  geo.translate(0, 0.5, 0);
  const m = new THREE.Mesh(geo, mat);
  m.scale.set(w, h, d);
  return m;
}

/** A gabled roof: a triangular prism `w` wide and `h` tall running `len` along z (or x), base at y = 0. */
function prismRoof(len: number, w: number, h: number, mat: THREE.Material, alongX = false) {
  const tri = new THREE.Shape([new THREE.Vector2(-w / 2, 0), new THREE.Vector2(w / 2, 0), new THREE.Vector2(0, h)]);
  const geo = new THREE.ExtrudeGeometry(tri, { depth: len, bevelEnabled: true, bevelSize: 0.07, bevelThickness: 0.06, bevelSegments: 3 });
  geo.translate(0, 0, -len / 2);
  if (alongX) geo.rotateY(Math.PI / 2);
  return new THREE.Mesh(geo, mat);
}

/** Wall texture: rows of arched windows over a plinth line. */
function archWall(wall: string, glass: string, cols: number, rows: number, w = 512, h = 256, trim = "rgba(255,255,255,.55)") {
  return canvasTexture(w, h, (g) => {
    g.fillStyle = wall;
    g.fillRect(0, 0, w, h);
    const cw = w / cols;
    const rh = h / rows;
    for (let r = 0; r < rows; r++)
      for (let c = 0; c < cols; c++) {
        const x = c * cw + cw * 0.28;
        const ww = cw * 0.44;
        const y = r * rh + rh * 0.22;
        const hh = rh * 0.62;
        g.fillStyle = trim;
        g.beginPath();
        g.moveTo(x - 4, y + hh + 3);
        g.lineTo(x - 4, y + ww / 2);
        g.arc(x + ww / 2, y + ww / 2, ww / 2 + 4, Math.PI, 0);
        g.lineTo(x + ww + 4, y + hh + 3);
        g.fill();
        g.fillStyle = glass;
        g.beginPath();
        g.moveTo(x, y + hh);
        g.lineTo(x, y + ww / 2);
        g.arc(x + ww / 2, y + ww / 2, ww / 2, Math.PI, 0);
        g.lineTo(x + ww, y + hh);
        g.fill();
      }
    g.fillStyle = "rgba(0,0,0,.08)";
    for (let r = 1; r <= rows; r++) g.fillRect(0, r * rh - 5, w, 5);
  });
}

// ---------------------------------------------------------------- Land & water

/** The land above the lake: an outline of (x, z) points extruded down to the water, grass on top and
 * a dressed-stone embankment on the sides. */
export function landMass(outline: [number, number][], depth = 1.4, paint: (p: MaskPainter) => void = () => {}) {
  const shape = new THREE.Shape(outline.map(([x, z]) => new THREE.Vector2(x, -z)));
  const geo = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: false, curveSegments: 1 });
  const grass = repeat(
    canvasTexture(256, 256, (g) => {
      g.fillStyle = "#80bd52";
      g.fillRect(0, 0, 256, 256);
      for (let i = 0; i < 900; i++) {
        g.fillStyle = Math.random() > 0.5 ? "#8dca5e" : "#72ad47";
        g.fillRect(Math.random() * 256, Math.random() * 256, 3, 6);
      }
    }),
    0.2,
    0.2,
  );
  const stone = repeat(
    canvasTexture(128, 64, (g) => {
      g.fillStyle = "#d9c4a4";
      g.fillRect(0, 0, 128, 64);
      g.strokeStyle = "#b9a284";
      g.lineWidth = 2;
      for (let r = 0; r < 4; r++) {
        g.beginPath();
        g.moveTo(0, r * 16);
        g.lineTo(128, r * 16);
        g.stroke();
        for (let c = 0; c < 4; c++) {
          const x = c * 32 + (r % 2) * 16;
          g.beginPath();
          g.moveTo(x, r * 16);
          g.lineTo(x, r * 16 + 16);
          g.stroke();
        }
      }
      g.fillStyle = "rgba(60,80,70,.35)";
      g.fillRect(0, 54, 128, 10);
    }),
    0.5,
    0.7,
  );
  const m = new THREE.Mesh(geo, [new THREE.MeshLambertMaterial({ map: grass }), new THREE.MeshLambertMaterial({ map: stone })]);
  m.rotation.x = -Math.PI / 2;
  m.position.y = -depth;
  m.receiveShadow = true;
  const g = new THREE.Group();
  g.add(m, splatShape(shape, [0, -10, 140, 80], paint, { tar: "putra_road", pavers: "bb_pavers" }));
  return g;
}

/** Tasik Putrajaya: a big sheet of water below the land, rippling, with the low sun glinting on it. */
export function lake(x0: number, z0: number, x1: number, z1: number, y = -0.8): Anim {
  const group = new THREE.Group();
  const w = x1 - x0;
  const d = z1 - z0;
  const base = repeat(
    canvasTexture(256, 256, (g) => {
      const grad = g.createLinearGradient(0, 0, 0, 256);
      grad.addColorStop(0, "#3f97b9");
      grad.addColorStop(1, "#3a8db0");
      g.fillStyle = grad;
      g.fillRect(0, 0, 256, 256);
      g.strokeStyle = "rgba(255,255,255,.22)";
      g.lineWidth = 3;
      for (let i = 0; i < 26; i++) {
        const x = (i * 97) % 256;
        const yy = (i * 61) % 256;
        g.beginPath();
        g.moveTo(x, yy);
        g.quadraticCurveTo(x + 12, yy - 5, x + 26, yy);
        g.stroke();
      }
    }),
    w / 7,
    d / 7,
  );
  const water = new THREE.Mesh(new THREE.PlaneGeometry(w, d), new THREE.MeshLambertMaterial({ map: base, emissive: 0x0c4a6e, emissiveIntensity: 0.25 }));
  water.rotation.x = -Math.PI / 2;
  water.position.set((x0 + x1) / 2, y, (z0 + z1) / 2);
  water.receiveShadow = true;
  group.add(water);
  // Sun glints: a sparse sparkle layer drifting the other way, added on top.
  const glint = repeat(
    canvasTexture(256, 256, (g) => {
      for (let i = 0; i < 40; i++) {
        const x = (i * 131) % 256;
        const yy = (i * 89 + (i % 7) * 13) % 256;
        g.fillStyle = `rgba(255,236,190,${0.35 + (i % 4) * 0.15})`;
        g.fillRect(x, yy, 6 + (i % 3) * 5, 2);
      }
    }),
    w / 9,
    d / 9,
  );
  const sparkle = new THREE.Mesh(
    new THREE.PlaneGeometry(w, d),
    new THREE.MeshBasicMaterial({ map: glint, transparent: true, opacity: 0.55, depthWrite: false, blending: THREE.AdditiveBlending }),
  );
  sparkle.rotation.x = -Math.PI / 2;
  sparkle.position.set((x0 + x1) / 2, y + 0.02, (z0 + z1) / 2);
  group.add(sparkle);
  const update = (t: number) => {
    base.offset.set(t * 0.012, t * 0.006);
    glint.offset.set(-t * 0.008, t * 0.011);
    (sparkle.material as THREE.MeshBasicMaterial).opacity = 0.45 + Math.sin(t * 2.3) * 0.12;
  };
  return { group, update };
}

/** Balustrade along the waterfront (a polyline of x, z points), plus colliders so nobody falls in. */
export function shoreRail(points: [number, number][]): { group: THREE.Group; boxes: Box[] } {
  const g = new THREE.Group();
  const post = flat(0xf2e6d2);
  const cap = flat(0xb08a4a);
  const rail = flat(0xe8d8bc);
  const boxes: Box[] = [];
  for (let i = 1; i < points.length; i++) {
    const [ax, az] = points[i - 1];
    const [bx, bz] = points[i];
    const len = Math.hypot(bx - ax, bz - az);
    const n = Math.max(1, Math.round(len / 1.6));
    for (let k = 0; k <= n; k++) {
      if (k === n && i < points.length - 1) continue;
      const x = ax + ((bx - ax) * k) / n;
      const z = az + ((bz - az) * k) / n;
      g.add(mesh(roundedBox(0.22, 0.85, 0.22), post, x, 0.42, z));
      g.add(mesh(new THREE.SphereGeometry(0.11,20,14), cap, x, 0.9, z));
    }
    const top = rod(v3(ax, 0.78, az), v3(bx, 0.78, bz), 0.06, rail, 5);
    const mid = rod(v3(ax, 0.42, az), v3(bx, 0.42, bz), 0.04, rail, 5);
    g.add(top, mid);
    const steps = Math.max(1, Math.round(len / 0.5));
    for (let k = 0; k <= steps; k++) {
      const x = ax + ((bx - ax) * k) / steps;
      const z = az + ((bz - az) * k) / steps;
      boxes.push([x - 0.25, z - 0.25, x + 0.25, z + 0.25]);
    }
  }
  return { group: shadowed(g), boxes };
}

// ---------------------------------------------------------------- Dataran Putra

/** The 14-point Bintang Persekutuan as a flat shape. */
function star14(rOut: number, rIn: number) {
  const s = new THREE.Shape();
  for (let i = 0; i < 28; i++) {
    const a = (i / 28) * Math.PI * 2 + Math.PI / 2;
    const r = i % 2 ? rIn : rOut;
    if (i) s.lineTo(Math.cos(a) * r, Math.sin(a) * r);
    else s.moveTo(Math.cos(a) * r, Math.sin(a) * r);
  }
  return s;
}

/** Dataran Putra: the paved roundabout plaza with the star garden in the middle, the red ring road
 * round it and a jogging track round that. Centre at (cx, cz). */
export function dataranPutra(cx: number, cz: number, r: { plaza: number; road: number; track: number }) {
  const g = new THREE.Group();
  const dash = new THREE.MeshLambertMaterial({ color: 0xfff3dc });
  const mid = (r.plaza + r.road) / 2;
  for (let k = 0; k < 40; k++) {
    const a = (k / 40) * Math.PI * 2;
    const m = mesh(new THREE.PlaneGeometry(0.12, 0.6), dash, Math.cos(a) * mid, 0.035, Math.sin(a) * mid);
    m.rotation.set(-Math.PI / 2, 0, -a); g.add(m);
  }
  // The star garden: clipped hedge star, a lighter star inside, yellow flowers at the heart.
  const hedge = new THREE.Mesh(new THREE.ExtrudeGeometry(star14(4.3, 2.5), { depth: 0.22, bevelEnabled: true, bevelSegments: 4, bevelSize: 0.12, bevelThickness: 0.08 }), flat(0x4f9a3a));
  hedge.rotation.x = -Math.PI / 2;
  const inner = new THREE.Mesh(new THREE.ExtrudeGeometry(star14(2.5, 1.45), { depth: 0.28, bevelEnabled: true, bevelSegments: 4, bevelSize: 0.08, bevelThickness: 0.06 }), flat(0x86c95a));
  inner.rotation.x = -Math.PI / 2;
  const heart = mesh(new THREE.CylinderGeometry(0.95, 1.05, 0.44, 14), flat(0xf7c531), 0, 0.22, 0);
  g.add(hedge, inner, heart);
  const ballMat = flat(0x3f8530);
  for (let k = 0; k < 14; k++) {
    const a = (k / 14) * Math.PI * 2 + Math.PI / 2;
    g.add(mesh(new THREE.SphereGeometry(0.28, 24, 16), ballMat, Math.cos(a) * 4.6, 0.3, -Math.sin(a) * 4.6));
  }
  for (let k = 0; k < 18; k++) {
    const a = k * 2.4;
    const rr = 0.2 + (k % 5) * 0.15;
    g.add(mesh(new THREE.SphereGeometry(0.09, 24, 16), flat(k % 3 ? 0xff7a2f : 0xffffff), Math.cos(a) * rr, 0.48, Math.sin(a) * rr));
  }
  g.position.set(cx, 0, cz);
  return shadowed(g);
}

// ---------------------------------------------------------------- Bridge, lamps, trees

/** Putrajaya street lamp: dark green pole, gold bands, a pair of lanterns on curled arms. */
export function putraLamp(x: number, z: number, h = 3.6) {
  const g = new THREE.Group();
  const iron = flat(0x2f4a3e);
  const gold = flat(0xc9a14a);
  g.add(mesh(new THREE.CylinderGeometry(0.2, 0.26, 0.5, 8), iron, 0, 0.25, 0));
  g.add(mesh(new THREE.CylinderGeometry(0.06, 0.09, h, 8), iron, 0, h / 2, 0));
  g.add(mesh(new THREE.CylinderGeometry(0.11, 0.11, 0.1, 8), gold, 0, 0.6, 0));
  g.add(mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.08, 8), gold, 0, h - 0.3, 0));
  const glass = new THREE.MeshLambertMaterial({ color: 0xfff1c8, emissive: 0xffd88a, emissiveIntensity: 0.35 });
  for (const sx of [-1, 1]) {
    g.add(rod(v3(0, h - 0.2, 0), v3(sx * 0.55, h + 0.05, 0), 0.035, iron, 5));
    g.add(mesh(new THREE.CylinderGeometry(0.16, 0.1, 0.36, 6), glass, sx * 0.6, h - 0.15, 0));
    g.add(mesh(new THREE.ConeGeometry(0.2, 0.2, 6), iron, sx * 0.6, h + 0.12, 0));
  }
  g.add(mesh(new THREE.SphereGeometry(0.08,20,14), gold, 0, h + 0.08, 0));
  g.position.set(x, 0, z);
  return shadowed(g);
}

/** Royal palm: a tall smooth grey trunk, a green crownshaft and a tuft of fronds. */
export function royalPalm(x: number, z: number, h = 5.6, seed = 0) {
  return oilPalm(x, z, seed, h / 5.2);
}

/** Roadside shade trees reuse the painted Labu canopy, with varied proportions. */
export function roundTree(x: number, z: number, s = 1, _color = 0x4f9a3a) {
  const g = rainTree(x, z, Math.round(x * z));
  g.scale.set(s * 0.4, s * 0.57, s * 0.4);
  return g;
}

/** A long clipped hedge. */
export function hedge(x0: number, z0: number, x1: number, z1: number, h = 0.6, color = 0x4a8f38) {
  const m = mesh(roundedBox(x1 - x0, h, z1 - z0), flat(color), (x0 + x1) / 2, h / 2, (z0 + z1) / 2);
  m.castShadow = true;
  m.receiveShadow = true;
  return m;
}

/** Jambatan Putra's deck running along z (x0..x1 wide), with balustrades, lamps and arches on its piers. */
export function putraBridge(x0: number, x1: number, z0: number, z1: number) {
  const g = new THREE.Group();
  const len = z1 - z0;
  const w = x1 - x0;
  const cx = (x0 + x1) / 2;
  const cz = (z0 + z1) / 2;
  const sideTex = repeat(
    canvasTexture(256, 64, (c) => {
      c.fillStyle = "#e6d3b6";
      c.fillRect(0, 0, 256, 64);
      c.fillStyle = "#26475a";
      for (let k = 0; k < 2; k++) {
        c.beginPath();
        c.moveTo(k * 128 + 14, 64);
        c.lineTo(k * 128 + 14, 40);
        c.arc(k * 128 + 64, 40, 50, Math.PI, 0);
        c.lineTo(k * 128 + 114, 64);
        c.fill();
      }
      c.fillStyle = "#c9b18c";
      c.fillRect(0, 0, 256, 8);
    }),
    len / 6,
    1,
  );
  const stone = paintedMat("plaster", w, len, 4);
  const side = new THREE.MeshLambertMaterial({ map: sideTex });
  const deck = new THREE.Mesh(roundedBox(w, 1.6, len), [side, side, paintedMat("bb_pavers", w, len, 2.2), stone, stone, stone]);
  deck.position.set(cx, -0.8, cz);
  deck.receiveShadow = true;
  g.add(deck);
  // Red road down the middle, cream walkways either side, then the balustrades.
  const road = mesh(roundedBox(4.8, 0.04, len), paintedMat("putra_road", 4.8, len, 5), cx, 0.02, cz);
  road.receiveShadow = true;
  g.add(road);
  const dash = new THREE.MeshBasicMaterial({ color: 0xf6efe0 });
  for (let z = z0 + 0.6; z < z1; z += 1.8) g.add(mesh(roundedBox(0.12, 0.02, 0.8), dash, cx, 0.05, z));
  const balTex = repeat(
    canvasTexture(128, 64, (c) => {
      c.fillStyle = "#f2e6d2";
      c.fillRect(0, 0, 128, 64);
      c.fillStyle = "#9c8a70";
      for (let k = 0; k < 6; k++) {
        c.beginPath();
        c.ellipse(k * 21 + 11, 36, 5, 16, 0, 0, Math.PI * 2);
        c.fill();
      }
      c.fillStyle = "#d8c4a4";
      c.fillRect(0, 0, 128, 12);
      c.fillRect(0, 56, 128, 8);
    }),
    len / 2.4,
    1,
  );
  const balMat = new THREE.MeshLambertMaterial({ map: balTex });
  for (const bx of [x0 + 0.15, x1 - 0.15]) {
    const b = new THREE.Mesh(roundedBox(0.3, 0.8, len), [balMat, balMat, flat(0xd8c4a4), stone, stone, stone]);
    b.position.set(bx, 0.4, cz);
    b.castShadow = true;
    g.add(b);
  }
  return shadowed(g);
}

/** One of Jambatan Putra's octagonal pavilions, standing on its own pier in the water. */
export function pavilion(x: number, z: number, s = 1) {
  const g = new THREE.Group();
  const stone = flat(0xd8c3a2);
  const body = new THREE.MeshLambertMaterial({ map: archWall("#efe0c6", "#2c4a5c", 8, 1, 512, 128) });
  const upper = new THREE.MeshLambertMaterial({ map: archWall("#efe0c6", "#2c4a5c", 8, 1, 512, 96) });
  g.add(mesh(new THREE.CylinderGeometry(1.75, 1.9, 1.6, 8), stone, 0, -0.6, 0));
  g.add(mesh(new THREE.CylinderGeometry(1.45, 1.5, 0.6, 8), flat(0xc9b08a), 0, 0.3, 0));
  g.add(mesh(new THREE.CylinderGeometry(1.25, 1.25, 2.6, 8), body, 0, 1.9, 0));
  g.add(mesh(new THREE.CylinderGeometry(1.45, 1.35, 0.24, 8), flat(0xc9a878), 0, 3.3, 0));
  g.add(mesh(new THREE.CylinderGeometry(0.95, 0.95, 1.2, 8), upper, 0, 4.0, 0));
  g.add(mesh(new THREE.CylinderGeometry(1.1, 1.0, 0.16, 8), flat(0xc9a878), 0, 4.66, 0));
  const dome = mesh(new THREE.SphereGeometry(0.9,20,14, 0, Math.PI * 2, 0, Math.PI / 2), flat(0x5f8a86), 0, 4.72, 0);
  dome.scale.y = 0.95;
  g.add(dome);
  g.add(mesh(new THREE.ConeGeometry(0.08, 0.7, 6), flat(0xd4af37), 0, 5.9, 0));
  g.position.set(x, 0, z);
  g.scale.setScalar(s);
  return shadowed(g);
}

// ---------------------------------------------------------------- Landmarks

function onionDome(r: number, h: number, base: string, line: string) {
  const pts = [
    [1.0, 0],
    [1.06, 0.12],
    [1.1, 0.28],
    [1.04, 0.45],
    [0.86, 0.62],
    [0.58, 0.78],
    [0.3, 0.9],
    [0.1, 0.97],
    [0, 1],
  ].map(([pr, py]) => new THREE.Vector2(pr * r, py * h));
  const tex = canvasTexture(256, 256, (c) => {
    c.fillStyle = base;
    c.fillRect(0, 0, 256, 256);
    c.strokeStyle = line;
    c.lineWidth = 4;
    // Diamond lattice that narrows to the top.
    for (let k = -8; k < 16; k++) {
      c.beginPath();
      c.moveTo(k * 32, 256);
      c.lineTo(k * 32 + 256, 0);
      c.moveTo(k * 32, 0);
      c.lineTo(k * 32 + 256, 256);
      c.stroke();
    }
  });
  repeat(tex, 6, 1);
  return new THREE.Mesh(new THREE.LatheGeometry(pts, 28), new THREE.MeshLambertMaterial({ map: tex }));
}

/** A gold finial with a crescent on top. */
function finial(y: number, s = 1) {
  const g = new THREE.Group();
  const gold = flat(0xd9b04a);
  g.add(mesh(new THREE.CylinderGeometry(0.05, 0.09, 0.9, 6), gold, 0, 0.45, 0));
  g.add(mesh(new THREE.SphereGeometry(0.15,20,14), gold, 0, 0.6, 0));
  g.add(mesh(new THREE.SphereGeometry(0.11,20,14), gold, 0, 0.85, 0));
  const moon = mesh(new THREE.TorusGeometry(0.22, 0.05, 5, 12, Math.PI * 1.3), gold, 0, 1.18, 0);
  moon.rotation.z = Math.PI * 0.85;
  g.add(moon);
  g.position.y = y;
  g.scale.setScalar(s);
  return g;
}

/** Masjid Putra: rose-pink dome over the prayer hall, small domes at the corners and a grey-roofed
 * arcade towards the plaza. Centred on the prayer hall. */
export function masjidPutra(x: number, z: number) {
  const g = new THREE.Group();
  const wall = new THREE.MeshLambertMaterial({ map: archWall("#efd3c4", "#5a4048", 5, 2) });
  const trim = flat(0xd9b3a3);
  const pink = flat(0xe7a6ac);
  // Raised courtyard platform.
  g.add(mesh(roundedBox(14.5, 0.5, 19), flat(0xead8c8), 0, 0.25, 0));
  g.add(mesh(roundedBox(9, 3.4, 9), wall, 0, 2.2, -2));
  g.add(mesh(roundedBox(9.5, 0.35, 9.5), trim, 0, 4.05, -2));
  g.add(mesh(new THREE.CylinderGeometry(3.1, 3.2, 1.5, 24), new THREE.MeshLambertMaterial({ map: repeat(archWall("#efd3c4", "#5a4048", 3, 1, 256, 96), 4, 1) }), 0, 4.95, -2));
  const dome = onionDome(3.25, 4.6, "#e8a1a8", "#f6cdd1");
  dome.position.set(0, 5.7, -2);
  g.add(dome);
  g.add(finial(10.25, 1.4).translateZ(-2));
  for (const [dx, dz] of [[-3.9, -5.9], [3.9, -5.9], [-3.9, 1.9], [3.9, 1.9]]) {
    g.add(mesh(new THREE.CylinderGeometry(0.55, 0.6, 0.8, 8), trim, dx, 4.6, dz));
    const d = onionDome(0.62, 1.0, "#e8a1a8", "#f6cdd1");
    d.position.set(dx, 5.0, dz);
    g.add(d);
  }
  // Arcade wing towards the plaza with a slate-blue pitched roof.
  const arcade = new THREE.MeshLambertMaterial({ map: repeat(archWall("#f1dccf", "#6b5058", 4, 1, 512, 128), 2, 1) });
  g.add(mesh(roundedBox(4, 2.4, 13), arcade, 5.6, 1.7, 2.5));
  const slate = flat(0x7d93a8);
  g.add(prismRoof(13.4, 4.6, 1.3, slate).translateX(5.6).translateY(2.9).translateZ(2.5));
  g.add(mesh(roundedBox(9.5, 2.0, 3.5), arcade, -0.5, 1.5, 6.5));
  g.add(prismRoof(9.9, 4.0, 1.1, slate, true).translateX(-0.5).translateY(2.5).translateZ(6.5));
  // Gate arch in the arcade facing the plaza.
  g.add(mesh(roundedBox(0.6, 3.6, 2.6), pink, 7.6, 1.8, 2.5));
  g.position.set(x, 0, z);
  return shadowed(g);
}

/** Masjid Putra's minaret: stacked octagonal shafts with balconies and a little pink dome. */
export function minaret(x: number, z: number) {
  const g = new THREE.Group();
  const wall = new THREE.MeshLambertMaterial({ map: archWall("#efd3c4", "#5a4048", 8, 1, 512, 128) });
  const trim = flat(0xd9b3a3);
  let y = 0;
  const tier = (r: number, h: number, mat: THREE.Material) => {
    g.add(mesh(new THREE.CylinderGeometry(r, r * 1.04, h, 8), mat, 0, y + h / 2, 0));
    y += h;
  };
  tier(1.15, 3.2, wall);
  g.add(mesh(new THREE.CylinderGeometry(1.4, 1.2, 0.3, 8), trim, 0, y + 0.15, 0));
  y += 0.3;
  tier(0.85, 4.6, wall);
  g.add(mesh(new THREE.CylinderGeometry(1.15, 0.9, 0.35, 8), trim, 0, y + 0.17, 0));
  y += 0.35;
  tier(0.7, 3.6, wall);
  g.add(mesh(new THREE.CylinderGeometry(1.0, 0.75, 0.3, 8), trim, 0, y + 0.15, 0));
  y += 0.3;
  tier(0.55, 1.6, flat(0xf2e2d6));
  const d = onionDome(0.6, 1.2, "#e8a1a8", "#f6cdd1");
  d.position.y = y;
  g.add(d);
  g.add(finial(y + 1.15, 0.8));
  g.position.set(x, 0, z);
  return shadowed(g);
}

/** Perdana Putra: the cream palace-like office with its green onion dome, colonnaded front, long
 * wings with green hip roofs and little domed corner towers. (x, z) is the front of the main block. */
export function perdanaPutra(x: number, z: number) {
  const g = new THREE.Group();
  const front = new THREE.MeshLambertMaterial({ map: archWall("#f1e2c8", "#43606e", 6, 2) });
  const wingWall = new THREE.MeshLambertMaterial({ map: repeat(archWall("#f1e2c8", "#43606e", 6, 2), 1.4, 1) });
  const plain = flat(0xeedcc0);
  const trim = flat(0xd8c19c);
  const mats = (face: THREE.Material) => [plain, plain, plain, plain, face, plain];
  const main = new THREE.Mesh(roundedBox(11, 6, 8), mats(front));
  main.position.set(0, 3, -4);
  g.add(main);
  g.add(mesh(roundedBox(11.6, 0.4, 8.6), trim, 0, 6.2, -4));
  // Portico of columns.
  for (let i = 0; i < 6; i++) g.add(mesh(new THREE.CylinderGeometry(0.24, 0.28, 4.6, 8), plain, -3.75 + i * 1.5, 2.3, 0.9));
  g.add(mesh(roundedBox(8.6, 0.6, 1.6), trim, 0, 4.9, 0.5));
  g.add(prismRoof(8.6, 1.6, 0.9, plain, true).translateY(5.2).translateZ(0.5));
  g.add(mesh(roundedBox(9.2, 0.35, 2.6), plain, 0, 0.17, 1.1));
  // Drum and dome.
  g.add(mesh(new THREE.CylinderGeometry(2.6, 2.7, 2.0, 24), new THREE.MeshLambertMaterial({ map: repeat(archWall("#f1e2c8", "#43606e", 3, 1, 256, 96), 4, 1) }), 0, 7.4, -4));
  g.add(mesh(new THREE.CylinderGeometry(2.9, 2.9, 0.3, 24), trim, 0, 8.5, -4));
  const dome = onionDome(2.75, 4.6, "#3f8b68", "#5fae86");
  dome.position.set(0, 8.6, -4);
  g.add(dome);
  g.add(finial(13.1, 1.2).translateZ(-4));
  // Wings and corner towers.
  for (const sx of [-1, 1]) {
    const wing = new THREE.Mesh(roundedBox(10, 4.6, 6), mats(wingWall));
    wing.position.set(sx * 10.5, 2.3, -4.5);
    g.add(wing);
    const roof = hipRoof(10.4, 6.4, 1.6, flat(0x9cc4b0));
    roof.position.set(sx * 10.5, 4.6, -4.5);
    g.add(roof);
    const tower = new THREE.Mesh(roundedBox(2.6, 6.2, 2.6), mats(front));
    tower.position.set(sx * 16.4, 3.1, -3.4);
    g.add(tower);
    g.add(mesh(roundedBox(3, 0.3, 3), trim, sx * 16.4, 6.3, -3.4));
    const d = onionDome(1.15, 2.0, "#3f8b68", "#5fae86");
    d.position.set(sx * 16.4, 6.45, -3.4);
    g.add(d);
    g.add(finial(8.4, 0.7).translateX(sx * 16.4).translateZ(-3.4));
  }
  g.position.set(x, 0, z);
  return shadowed(g);
}

/** Government block with a terracotta hip roof, the kind that fills Putrajaya's precincts. */
export function redRoofBlock(x: number, z: number, w: number, d: number, floors = 3, seed = 0) {
  const g = new THREE.Group();
  const h = floors * 1.3;
  const wall = new THREE.MeshLambertMaterial({
    map: repeat(
      canvasTexture(256, 128, (c) => {
        c.fillStyle = seed % 2 ? "#f3e7d3" : "#efe2cf";
        c.fillRect(0, 0, 256, 128);
        for (let r = 0; r < 3; r++)
          for (let k = 0; k < 8; k++) {
            c.fillStyle = "#56707e";
            c.fillRect(k * 32 + 8, r * 42 + 12, 16, 22);
            c.fillStyle = "rgba(255,255,255,.6)";
            c.fillRect(k * 32 + 6, r * 42 + 34, 20, 3);
          }
      }),
      w / 6,
      floors / 3,
    ),
  });
  g.add(mesh(roundedBox(w, h, d), wall, 0, h / 2, 0));
  const roof = hipRoof(w + 0.8, d + 0.8, 1.4, flat(seed % 3 ? 0xc85a3a : 0xd0643f));
  roof.position.y = h;
  g.add(roof);
  g.position.set(x, 0, z);
  return shadowed(g);
}

/** Perdana Putra's forecourt pool with a row of fountain jets. */
export function fountain(x: number, z: number, w: number, d: number): Anim {
  const group = new THREE.Group();
  const rim = flat(0xe6d6bc);
  group.add(mesh(roundedBox(w, 0.35, d), rim, 0, 0.17, 0));
  const water = mesh(roundedBox(w - 0.4, 0.05, d - 0.4), new THREE.MeshLambertMaterial({ color: 0x5ab4d6, emissive: 0x1a5f80, emissiveIntensity: 0.3 }), 0, 0.36, 0);
  group.add(water);
  const jetMat = new THREE.MeshLambertMaterial({ color: 0xeaf8ff, transparent: true, opacity: 0.75, emissive: 0x9fd8f0, emissiveIntensity: 0.3 });
  const jets: THREE.Mesh[] = [];
  const n = Math.max(3, Math.round(w / 1.6));
  for (let k = 0; k < n; k++) {
    const j = mesh(new THREE.ConeGeometry(0.16, 1, 6, 1, true), jetMat, -w / 2 + 0.8 + (k * (w - 1.6)) / (n - 1), 0.36, 0);
    j.geometry.translate(0, 0.5, 0);
    j.rotation.x = Math.PI;
    j.geometry.rotateX(Math.PI);
    jets.push(j);
    group.add(j);
  }
  group.position.set(x, 0, z);
  const update = (t: number) => {
    jets.forEach((j, k) => {
      j.scale.y = 1.1 + Math.sin(t * 2.2 + k * 0.9) * 0.45;
    });
  };
  return { group: shadowed(group), update };
}

/** Low painted text on the ground, e.g. HARI BEBAS KENDERAAN across the boulevard. */
export function roadText(text: string, x: number, z: number, w: number, d: number, color = "rgba(250,244,228,.9)") {
  const tex = canvasTexture(512, Math.round(512 * (d / w)), (g) => {
    g.fillStyle = color;
    g.font = `bold ${Math.round(g.canvas.height * 0.6)}px 'Bagel Fat One', sans-serif`;
    g.textAlign = "center";
    g.textBaseline = "middle";
    g.fillText(text, 256, g.canvas.height / 2 + 3);
  });
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, d), new THREE.MeshLambertMaterial({ map: tex, transparent: true, depthWrite: false }));
  m.rotation.x = -Math.PI / 2;
  m.position.set(x, 0.06, z);
  return m;
}


// ---------------------------------------------------------------- Taman Kecergasan

const STEEL_Y = () => flat(0xf2c230);
const STEEL_B = () => flat(0x2f7fd0);
const STEEL_G = () => flat(0x3fae5a);

/** How hard a machine is being worked: 1 right after a rep, easing to 0. */
const effort = (i: number, t: number, gym: { active: number; rep: number }) => (gym.active === i ? Math.max(0, 1 - (t - gym.rep) * 1.6) : 0);

/** Green rubber safety floor with a red border. */
export function rubberFloor(x0: number, z0: number, x1: number, z1: number) {
  const tex = repeat(
    canvasTexture(128, 128, (c) => {
      c.fillStyle = "#3f9a58";
      c.fillRect(0, 0, 128, 128);
      for (let i = 0; i < 500; i++) {
        c.fillStyle = ["#2f8248", "#55b26c", "#f2c230", "#e8e2d0"][i % 4 === 0 ? (i % 8 === 0 ? 2 : 3) : i % 2];
        c.fillRect(Math.random() * 128, Math.random() * 128, 2, 2);
      }
    }),
    (x1 - x0) / 3,
    (z1 - z0) / 3,
  );
  const g = new THREE.Group();
  g.add(mesh(roundedBox(x1 - x0 + 0.5, 0.06, z1 - z0 + 0.5), flat(0xc8473a), (x0 + x1) / 2, 0.03, (z0 + z1) / 2));
  const top = mesh(roundedBox(x1 - x0, 0.08, z1 - z0), new THREE.MeshLambertMaterial({ map: tex }), (x0 + x1) / 2, 0.04, (z0 + z1) / 2);
  g.add(top);
  g.traverse((o) => ((o as THREE.Mesh).receiveShadow = true));
  return g;
}

/** Air walker: two pendulum legs hanging from a yellow A-frame. They swing while Qish strides. */
export function airWalker(x: number, z: number, i: number, gym: { active: number; rep: number }): Anim {
  const group = new THREE.Group();
  const y = STEEL_Y();
  const b = STEEL_B();
  for (const sx of [-0.95, 0.95]) {
    group.add(rod(v3(sx, 0, -0.7), v3(sx, 2.0, 0), 0.07, y));
    group.add(rod(v3(sx, 0, 0.7), v3(sx, 2.0, 0), 0.07, y));
  }
  group.add(rod(v3(-1.05, 2.0, 0), v3(1.05, 2.0, 0), 0.08, y));
  // Handlebars at chest height.
  group.add(rod(v3(-0.95, 1.35, 0.42), v3(-0.35, 1.35, 0.42), 0.04, b));
  group.add(rod(v3(0.95, 1.35, 0.42), v3(0.35, 1.35, 0.42), 0.04, b));
  const legs = [-0.3, 0.3].map((lx) => {
    const piv = new THREE.Group();
    piv.position.set(lx, 1.95, 0);
    piv.add(rod(v3(0, 0, 0), v3(0, -1.55, 0), 0.05, b));
    piv.add(mesh(roundedBox(0.34, 0.06, 0.5), flat(0x2a2a30), 0, -1.6, 0.05));
    group.add(piv);
    return piv;
  });
  group.position.set(x, 0, z);
  shadowed(group);
  let swing = 0;
  const update = (t: number) => {
    const e = effort(i, t, gym);
    swing += (e * 0.55 - swing) * 0.08;
    const a = Math.sin(t * 5) * swing + Math.sin(t * 0.8 + i) * 0.03;
    legs[0].rotation.x = a;
    legs[1].rotation.x = -a;
  };
  return { group, update };
}

/** Pull-up bars at three heights. */
export function pullUpBars(x: number, z: number) {
  const g = new THREE.Group();
  const b = STEEL_B();
  const y = STEEL_Y();
  const posts: [number, number][] = [[-1.3, 2.0], [0, 2.4], [1.3, 2.7]];
  for (const [px, h] of posts) g.add(rod(v3(px, 0, 0), v3(px, h + 0.15, 0), 0.08, b));
  g.add(rod(v3(-1.3, 2.0, 0), v3(0, 2.0, 0), 0.05, y));
  g.add(rod(v3(0, 2.4, 0), v3(1.3, 2.4, 0), 0.05, y));
  for (const [px, h] of posts) g.add(mesh(new THREE.SphereGeometry(0.1,20,14), y, px, h + 0.17, 0));
  g.position.set(x, 0, z);
  return shadowed(g);
}

/** Inclined sit-up bench with a padded foot bar. */
export function situpBench(x: number, z: number) {
  const g = new THREE.Group();
  const frame = STEEL_G();
  const pad = flat(0xd23a3a);
  const board = mesh(roundedBox(0.62, 0.12, 2.0), pad, 0, 0.75, 0);
  board.rotation.x = -0.3;
  g.add(board);
  g.add(rod(v3(-0.25, 0, -0.75), v3(-0.25, 0.48, -0.75), 0.05, frame), rod(v3(0.25, 0, -0.75), v3(0.25, 0.48, -0.75), 0.05, frame));
  g.add(rod(v3(-0.25, 0, 0.8), v3(-0.25, 1.0, 0.8), 0.05, frame), rod(v3(0.25, 0, 0.8), v3(0.25, 1.0, 0.8), 0.05, frame));
  const roll = mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.7, 10), pad, 0, 1.12, 1.0);
  roll.rotation.z = Math.PI / 2;
  g.add(roll);
  g.position.set(x, 0, z);
  return shadowed(g);
}

// ---------------------------------------------------------------- Fun run & stalls

/** Inflatable START arch across the boulevard, gently breathing, with a race clock beside it. */
export function startArch(x: number, z: number, w: number): Anim {
  const group = new THREE.Group();
  const r = w / 2;
  // Inflatable segments: pink and white bands round the arch, yellow at the ends.
  const stripes = canvasTexture(512, 16, (c) => {
    for (let k = 0; k < 16; k++) {
      c.fillStyle = k === 0 || k === 15 ? "#ffcb05" : k % 2 ? "#fffdf6" : "#ff5c93";
      c.fillRect(k * 32, 0, 32, 16);
    }
  });
  const tube = new THREE.Mesh(new THREE.TorusGeometry(r, 0.55, 12, 40, Math.PI), new THREE.MeshLambertMaterial({ map: stripes }));
  tube.castShadow = true;
  const arch = new THREE.Group();
  arch.add(tube);
  // Banner hanging under the top.
  const banner = new THREE.Mesh(
    roundedBox(w * 0.56, 1.0, 0.08),
    [flat(0xffcb05), flat(0xffcb05), flat(0xffcb05), flat(0xffcb05), new THREE.MeshLambertMaterial({ map: signTexture("START", "#ffcb05", "#e3350d", 640, 120) }), flat(0xffcb05)],
  );
  banner.position.set(0, r - 1.1, 0.25);
  arch.add(banner);
  group.add(arch);
  for (const sx of [-r, r]) group.add(mesh(new THREE.CylinderGeometry(0.7, 0.75, 0.4, 10), flat(0x3b6fe0), sx, 0.2, 0));
  // Race clock on a stand, counting up.
  const clockC = document.createElement("canvas");
  clockC.width = 256;
  clockC.height = 72;
  const clockTex = new THREE.CanvasTexture(clockC);
  clockTex.colorSpace = THREE.SRGBColorSpace;
  const draw = (sec: number) => {
    const c = clockC.getContext("2d")!;
    c.fillStyle = "#17151f";
    c.fillRect(0, 0, 256, 72);
    c.fillStyle = "#ff4a3a";
    c.font = "bold 50px monospace";
    c.textAlign = "center";
    c.textBaseline = "middle";
    const m = Math.floor(sec / 60) % 60;
    c.fillText(`00:${String(m).padStart(2, "0")}:${String(sec % 60).padStart(2, "0")}`, 128, 38);
    clockTex.needsUpdate = true;
  };
  draw(0);
  const clock = new THREE.Group();
  clock.add(mesh(roundedBox(0.1, 2.2, 0.1), flat(0x2a2a30), 0, 1.1, 0));
  clock.add(new THREE.Mesh(roundedBox(1.7, 0.5, 0.18), [flat(0x2a2a30), flat(0x2a2a30), flat(0x2a2a30), flat(0x2a2a30), new THREE.MeshBasicMaterial({ map: clockTex }), flat(0x2a2a30)]).translateY(2.3));
  clock.position.set(r + 1.6, 0, 0.2);
  group.add(clock);
  group.position.set(x, 0, z);
  shadowed(group);
  let shown = -1;
  const update = (t: number) => {
    arch.scale.set(1 + Math.sin(t * 1.6) * 0.008, 1 + Math.sin(t * 1.6 + 0.6) * 0.014, 1);
    arch.rotation.z = Math.sin(t * 0.9) * 0.008;
    const sec = Math.floor(t + 1563);
    if (sec !== shown) {
      shown = sec;
      draw(sec);
    }
  };
  return { group, update };
}

/** A white canopy tent with a striped valance. */
export function canopy(x: number, z: number, w: number, d: number, stripe = "#ff5c93") {
  const g = new THREE.Group();
  const pole = flat(0xd8d8d8);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) g.add(mesh(new THREE.CylinderGeometry(0.05, 0.05, 2.3, 5), pole, (sx * w) / 2, 1.15, (sz * d) / 2));
  const roof = hipRoof(w + 0.3, d + 0.3, 0.9, flat(0xfbf8f2));
  roof.position.y = 2.3;
  g.add(roof);
  const val = canvasTexture(128, 32, (c) => {
    for (let k = 0; k < 8; k++) {
      c.fillStyle = k % 2 ? "#fbf8f2" : stripe;
      c.fillRect(k * 16, 0, 16, 32);
    }
  });
  const valMat = new THREE.MeshLambertMaterial({ map: repeat(val, w / 1.2, 1) });
  g.add(mesh(roundedBox(w + 0.3, 0.3, 0.04), valMat, 0, 2.15, d / 2 + 0.15));
  g.position.set(x, 0, z);
  return shadowed(g);
}

/** Air tebu stall: the cane press with its wheel turning, a bundle of cane and a row of cups. */
export function tebuStall(x: number, z: number): Anim {
  const group = new THREE.Group();
  group.add(mesh(roundedBox(2.2, 0.85, 0.8), flat(0x3b6fe0), 0, 0.42, 0));
  group.add(mesh(roundedBox(2.3, 0.06, 0.9), flat(0xf2f0ea), 0, 0.87, 0));
  const press = mesh(roundedBox(0.7, 0.6, 0.55), flat(0x3fae5a), -0.5, 1.2, 0);
  group.add(press);
  const wheel = new THREE.Group();
  wheel.position.set(-0.5, 1.25, 0.32);
  const rim = mesh(new THREE.TorusGeometry(0.34, 0.04, 6, 16), flat(0x9aa0aa));
  wheel.add(rim);
  for (let k = 0; k < 3; k++) {
    const spoke = mesh(roundedBox(0.66, 0.04, 0.04), flat(0x9aa0aa));
    spoke.rotation.z = (k / 3) * Math.PI;
    wheel.add(spoke);
  }
  group.add(wheel);
  for (let k = 0; k < 7; k++) {
    const cane = mesh(new THREE.CylinderGeometry(0.05, 0.05, 2.2, 5), flat(k % 2 ? 0x8a6a3a : 0x7a8a3a), 1.25 + (k % 3) * 0.08, 1.05, -0.2 + k * 0.06);
    cane.rotation.z = 0.28 + (k % 2) * 0.06;
    group.add(cane);
  }
  for (let k = 0; k < 4; k++) group.add(mesh(new THREE.CylinderGeometry(0.08, 0.06, 0.22, 8), new THREE.MeshLambertMaterial({ color: 0xc8e07a, transparent: true, opacity: 0.85 }), 0.2 + k * 0.22, 1.0, 0.18));
  const sign = new THREE.Mesh(
    roundedBox(1.6, 0.5, 0.06),
    [flat(0x2a2a30), flat(0x2a2a30), flat(0x2a2a30), flat(0x2a2a30), new THREE.MeshLambertMaterial({ map: signTexture("AIR TEBU", "#fffdf6", "#3fae5a", 512, 160) }), flat(0x2a2a30)],
  );
  sign.position.set(0, 0.45, 0.42);
  group.add(sign);
  group.position.set(x, 0, z);
  shadowed(group);
  const update = (t: number) => {
    wheel.rotation.z = -t * 3;
    press.position.y = 1.2 + Math.sin(t * 18) * 0.008;
  };
  return { group, update };
}

/** Air kelapa: a heap of green coconuts and one already opened with a straw. */
export function kelapaStall(x: number, z: number) {
  const g = new THREE.Group();
  g.add(mesh(roundedBox(2.0, 0.85, 0.8), flat(0xe3350d), 0, 0.42, 0));
  g.add(mesh(roundedBox(2.1, 0.06, 0.9), flat(0xf2f0ea), 0, 0.87, 0));
  const coco = flat(0x5f9a3a);
  for (let k = 0; k < 9; k++) {
    const row = k < 5 ? 0 : 1;
    const c = mesh(new THREE.SphereGeometry(0.2, 24, 16), coco, -0.6 + (row ? 0.12 : 0) + (k % 5) * 0.24, 1.08 + row * 0.24, row ? -0.05 : 0.05);
    c.scale.y = 1.15;
    g.add(c);
  }
  g.add(mesh(new THREE.SphereGeometry(0.2, 24, 16), coco, 0.7, 1.08, 0.15));
  g.add(mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.03, 10), flat(0xf6f0e0), 0.7, 1.28, 0.15));
  g.add(rod(v3(0.72, 1.25, 0.15), v3(0.8, 1.7, 0.2), 0.02, flat(0xff5c93)));
  const sign = new THREE.Mesh(
    roundedBox(1.6, 0.5, 0.06),
    [flat(0x2a2a30), flat(0x2a2a30), flat(0x2a2a30), flat(0x2a2a30), new THREE.MeshLambertMaterial({ map: signTexture("AIR KELAPA", "#fffdf6", "#3b6fe0", 512, 160) }), flat(0x2a2a30)],
  );
  sign.position.set(0, 0.45, 0.42);
  g.add(sign);
  g.position.set(x, 0, z);
  return shadowed(g);
}

/** Pakcik aiskrim's motorbike with its sidecar freezer and rainbow umbrella. Rings when Qish comes near. */
export function iceCreamBike(x: number, z: number, player: () => THREE.Vector3): Anim {
  const group = new THREE.Group();
  for (const wx of [-0.6, 0.6]) {
    const wheel = mesh(new THREE.TorusGeometry(0.28, 0.08, 6, 14), flat(0x1c1c22), wx, 0.32, 0);
    group.add(wheel);
  }
  group.add(mesh(roundedBox(1.0, 0.35, 0.32), flat(0xe3350d), -0.1, 0.62, 0));
  group.add(mesh(roundedBox(0.62, 0.12, 0.3), flat(0x1c1c22), -0.25, 0.86, 0));
  group.add(mesh(roundedBox(0.06, 0.06, 0.75), flat(0x9a9a92), 0.45, 1.2, 0));
  const box = new THREE.Mesh(
    roundedBox(1.2, 0.8, 0.9),
    [flat(0xf2f0ea), flat(0xf2f0ea), flat(0x3b6fe0), flat(0xf2f0ea), new THREE.MeshLambertMaterial({ map: signTexture("AISKRIM", "#f2f0ea", "#e3350d", 512, 340) }), flat(0xf2f0ea)],
  );
  box.position.set(-0.1, 0.75, 0.75);
  group.add(box);
  group.add(mesh(new THREE.CylinderGeometry(0.03, 0.03, 1.9, 5), flat(0x9a9a92), 0.2, 1.6, 0.75));
  const umb = canvasTexture(256, 64, (c) => {
    const cols = ["#e3350d", "#ffcb05", "#3fae5a", "#3b6fe0", "#9b6ad6", "#ff8fb1"];
    for (let k = 0; k < 12; k++) {
      c.fillStyle = cols[k % 6];
      c.fillRect(k * 21.3, 0, 22, 64);
    }
  });
  const shade = mesh(new THREE.ConeGeometry(1.1, 0.5, 12, 1, true), new THREE.MeshLambertMaterial({ map: umb, side: THREE.DoubleSide }), 0.2, 2.6, 0.75);
  group.add(shade);
  group.position.set(x, 0, z);
  shadowed(group);
  let rang = false;
  const update = (t: number) => {
    const d = Math.hypot(player().x - x, player().z - z);
    if (d < 4.2 && !rang) {
      rang = true;
      sfx.bell();
      setTimeout(() => sfx.bell(), 260);
    } else if (d > 7) rang = false;
    shade.rotation.y = Math.sin(t * 0.7) * 0.1;
  };
  return { group, update };
}

/** Penimbang berat 20 sen: the old coin scale. The needle swings to Qish's weight when she steps on. */
export function weighScale(x: number, z: number, player: () => THREE.Vector3, kg: () => number): Anim {
  const group = new THREE.Group();
  group.add(mesh(roundedBox(0.9, 0.18, 0.9), flat(0x9aa0aa), 0, 0.09, 0.35));
  group.add(mesh(roundedBox(0.8, 1.9, 0.4), flat(0xd23a3a), 0, 0.95, -0.2));
  const head = mesh(new THREE.CylinderGeometry(0.55, 0.55, 0.36, 24), flat(0xd23a3a), 0, 2.15, -0.2);
  head.rotation.x = Math.PI / 2;
  group.add(head);
  const face = canvasTexture(256, 256, (c) => {
    c.fillStyle = "#fffdf6";
    c.beginPath();
    c.arc(128, 128, 124, 0, Math.PI * 2);
    c.fill();
    c.strokeStyle = INK;
    c.lineWidth = 4;
    for (let k = 0; k <= 24; k++) {
      const a = -Math.PI * 1.25 + (k / 24) * Math.PI * 1.5;
      c.beginPath();
      c.moveTo(128 + Math.cos(a) * 104, 128 + Math.sin(a) * 104);
      c.lineTo(128 + Math.cos(a) * (k % 4 ? 112 : 92), 128 + Math.sin(a) * (k % 4 ? 112 : 92));
      c.stroke();
    }
    c.fillStyle = INK;
    c.font = "bold 30px 'Bagel Fat One', sans-serif";
    c.textAlign = "center";
    c.fillText("kg", 128, 190);
    c.font = "bold 22px sans-serif";
    c.fillText("20 sen", 128, 82);
  });
  const dial = mesh(new THREE.CircleGeometry(0.46, 28), new THREE.MeshBasicMaterial({ map: face }), 0, 2.15, -0.01);
  group.add(dial);
  const needle = new THREE.Group();
  needle.position.set(0, 2.15, 0.01);
  needle.add(mesh(roundedBox(0.03, 0.38, 0.01), flat(0xe3350d), 0, 0.17, 0));
  group.add(needle);
  const top = new THREE.Mesh(
    roundedBox(1.3, 0.42, 0.1),
    [flat(0xd23a3a), flat(0xd23a3a), flat(0xd23a3a), flat(0xd23a3a), new THREE.MeshLambertMaterial({ map: signTexture("TIMBANG", "#ffcb05", "#d23a3a", 512, 160) }), flat(0xd23a3a)],
  );
  top.position.set(0, 2.95, -0.2);
  group.add(top);
  group.position.set(x, 0, z);
  shadowed(group);
  // 0kg points down-left, 120kg down-right, like the real ones.
  const angleOf = (v: number) => Math.PI * 0.75 - (v / 120) * Math.PI * 1.5;
  let a = angleOf(0);
  const update = () => {
    const p = player();
    const on = Math.abs(p.x - x) < 0.7 && p.z - z > -0.2 && p.z - z < 1.1;
    const target = angleOf(on ? kg() : 0);
    a += (target - a) * 0.08;
    needle.rotation.z = a;
  };
  return { group, update };
}

// ---------------------------------------------------------------- Life

/** A wau bulan high in the sky on a long string, flown by a kid standing on the grass. */
export async function wauKite(x: number, z: number, look: PersonLook, colors: [string, string], phase = 0): Promise<Anim> {
  const group = new THREE.Group();
  const kid = await paperStandee(passengerDoodle({ ...look, kid: true, carry: "none" }), 1.35);
  kid.group.position.set(x, 0, z);
  group.add(kid.group);
  const tex = canvasTexture(256, 220, (c) => {
    c.lineJoin = "round";
    c.strokeStyle = INK;
    c.lineWidth = 6;
    const [a, b] = colors;
    // Wings.
    c.fillStyle = a;
    c.beginPath();
    c.moveTo(128, 30);
    c.quadraticCurveTo(40, 40, 8, 96);
    c.quadraticCurveTo(70, 88, 128, 110);
    c.quadraticCurveTo(186, 88, 248, 96);
    c.quadraticCurveTo(216, 40, 128, 30);
    c.fill();
    c.stroke();
    // Crescent tail (the "bulan").
    c.fillStyle = b;
    c.beginPath();
    c.moveTo(60, 150);
    c.quadraticCurveTo(128, 230, 196, 150);
    c.quadraticCurveTo(128, 186, 60, 150);
    c.fill();
    c.stroke();
    // Spine and head.
    c.fillStyle = b;
    c.beginPath();
    c.ellipse(128, 22, 12, 16, 0, 0, Math.PI * 2);
    c.fill();
    c.stroke();
    c.beginPath();
    c.moveTo(128, 34);
    c.lineTo(128, 186);
    c.stroke();
    c.fillStyle = "#fffdf6";
    for (const [px, py] of [[70, 74], [186, 74], [128, 70]]) {
      c.beginPath();
      c.arc(px, py, 9, 0, Math.PI * 2);
      c.fill();
    }
  });
  const kite = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 2.25), new THREE.MeshBasicMaterial({ map: tex, transparent: true, side: THREE.DoubleSide, alphaTest: 0.3 }));
  group.add(kite);
  const N = 18;
  const pts = new Float32Array(N * 3);
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(pts, 3));
  const line = new THREE.Line(geo, new THREE.LineBasicMaterial({ color: 0xfffdf6, transparent: true, opacity: 0.8 }));
  group.add(line);
  const hand = v3(x + 0.32, 0.95, z);
  const anchor = v3(x + 2.2, 6.2, z - 2.6);
  const update = (t: number) => {
    const k = kite.position;
    k.set(anchor.x + Math.sin(t * 0.7 + phase) * 1.1, anchor.y + Math.sin(t * 1.3 + phase) * 0.45, anchor.z);
    kite.rotation.set(-0.5, 0, Math.sin(t * 0.9 + phase) * 0.22);
    for (let i = 0; i < N; i++) {
      const f = i / (N - 1);
      const sag = Math.sin(f * Math.PI) * 0.9;
      pts[i * 3] = hand.x + (k.x - hand.x) * f;
      pts[i * 3 + 1] = hand.y + (k.y - 0.8 - hand.y) * f - sag;
      pts[i * 3 + 2] = hand.z + (k.z - hand.z) * f;
    }
    geo.attributes.position.needsUpdate = true;
    kid.pivot.rotation.z = Math.sin(t * 1.1 + phase) * 0.05;
  };
  return { group, update };
}

/** Pigeons pecking about the plaza. They burst up when Qish walks through and settle back later. */
export function pigeons(cx: number, cz: number, r: number, n: number, player: () => THREE.Vector3): Anim {
  const group = new THREE.Group();
  const body = flat(0x9aa0aa);
  const dark = flat(0x6b7180);
  const neck = flat(0x5f8f8a);
  const tick = ticker();
  const birds = Array.from({ length: n }, (_, i) => {
    const g = new THREE.Group();
    const b = mesh(new THREE.SphereGeometry(0.17,20,14), body, 0, 0.2, 0);
    b.scale.set(1, 0.85, 1.45);
    const head = new THREE.Group();
    head.position.set(0, 0.32, 0.18);
    head.add(mesh(new THREE.SphereGeometry(0.09,20,14), dark));
    head.add(mesh(new THREE.SphereGeometry(0.075,20,14), neck, 0, -0.07, -0.02));
    head.add(mesh(new THREE.ConeGeometry(0.025, 0.08, 4), flat(0xe0b080), 0, -0.01, 0.1).rotateX(Math.PI / 2));
    const wings = [-1, 1].map((sx) => {
      const w = new THREE.Group();
      w.position.set(sx * 0.12, 0.27, 0);
      const plane = mesh(roundedBox(0.34, 0.02, 0.22), dark, sx * 0.17, 0, 0);
      w.add(plane);
      w.visible = false;
      g.add(w);
      return w;
    });
    g.add(b, head);
    g.add(mesh(roundedBox(0.14, 0.03, 0.2), dark, 0, 0.18, -0.26));
    const a = (i / n) * Math.PI * 2 + i;
    const home = v3(cx + Math.cos(a) * r * (0.3 + ((i * 37) % 10) / 14), 0, cz + Math.sin(a) * r * (0.3 + ((i * 53) % 10) / 14));
    g.position.copy(home);
    g.rotation.y = a;
    group.add(g);
    return { g, head, wings, home, state: "peck" as "peck" | "fly", vel: v3(0, 0, 0), timer: 0, ph: i * 1.7 };
  });
  shadowed(group);
  const update = (t: number) => {
    const dt = tick(t);
    const p = player();
    let flushed = false;
    for (const bd of birds) {
      const pos = bd.g.position;
      if (bd.state === "peck") {
        bd.head.position.y = 0.32 - Math.max(0, Math.sin(t * 6 + bd.ph)) * 0.12;
        bd.head.position.z = 0.18 + Math.max(0, Math.sin(t * 6 + bd.ph)) * 0.05;
        // Shuffle about a little.
        pos.x += Math.sin(t * 0.7 + bd.ph) * dt * 0.15;
        pos.z += Math.cos(t * 0.5 + bd.ph) * dt * 0.15;
        if (Math.hypot(p.x - pos.x, p.z - pos.z) < 2.3) {
          bd.state = "fly";
          bd.timer = 0;
          const away = v3(pos.x - p.x, 0, pos.z - p.z).normalize();
          bd.vel.set(away.x * 4 + (Math.random() - 0.5) * 2, 4.5 + Math.random() * 2, away.z * 4 - 2);
          bd.wings.forEach((w) => (w.visible = true));
          bd.g.rotation.y = Math.atan2(bd.vel.x, bd.vel.z);
          flushed = true;
        }
      } else {
        bd.timer += dt;
        if (bd.timer < 3.2) {
          pos.addScaledVector(bd.vel, dt);
          bd.vel.y -= dt * 0.8;
        } else {
          // Glide back home.
          const to = bd.home.clone().sub(pos);
          const d = to.length();
          if (d < 0.2) {
            pos.copy(bd.home);
            bd.state = "peck";
            bd.wings.forEach((w) => (w.visible = false));
            continue;
          }
          if (Math.hypot(p.x - bd.home.x, p.z - bd.home.z) < 3 && pos.y > 0.5) {
            bd.timer = 1.6;
            continue;
          }
          pos.addScaledVector(to.normalize(), dt * Math.min(5, d * 1.5 + 0.5));
          bd.g.rotation.y = Math.atan2(to.x, to.z);
        }
        pos.y = Math.max(0, pos.y);
        const flap = Math.sin(t * 28 + bd.ph) * 0.9;
        bd.wings[0].rotation.z = flap;
        bd.wings[1].rotation.z = -flap;
      }
    }
    if (flushed) sfx.flutter();
  };
  return { group, update };
}

/** A dragon boat team training on the lake: paddles in sync to the drummer. Goes round an ellipse. */
export function dragonBoat(cx: number, cz: number, rx: number, rz: number, y: number, speed = 0.05, phase = 0): Anim {
  const group = new THREE.Group();
  const boat = new THREE.Group();
  const hull = mesh(roundedBox(0.9, 0.35, 7), flat(0xd23a3a), 0, 0.17, 0);
  boat.add(hull);
  boat.add(mesh(roundedBox(0.95, 0.08, 7.05), flat(0xffcb05), 0, 0.36, 0));
  const headG = new THREE.Group();
  headG.position.set(0, 0.5, 3.7);
  headG.add(mesh(new THREE.ConeGeometry(0.28, 0.8, 6), flat(0xd23a3a), 0, 0.2, 0.2).rotateX(Math.PI / 2.4));
  headG.add(mesh(new THREE.SphereGeometry(0.22,20,14), flat(0xffcb05), 0, 0.42, 0.45));
  boat.add(headG);
  boat.add(mesh(new THREE.ConeGeometry(0.2, 0.9, 5), flat(0x3fae5a), 0, 0.6, -3.7).rotateX(-Math.PI / 3));
  const shirts = [0xffcb05, 0xf2f0ea];
  const paddles: THREE.Group[] = [];
  for (let k = 0; k < 8; k++) {
    const zz = -2.6 + k * 0.7;
    for (const sx of [-1, 1]) {
      boat.add(mesh(new THREE.CylinderGeometry(0.11, 0.13, 0.4, 6), flat(shirts[k % 2]), sx * 0.22, 0.55, zz));
      boat.add(mesh(new THREE.SphereGeometry(0.1,20,14), flat(0x6b4a35), sx * 0.22, 0.85, zz));
      const pv = new THREE.Group();
      pv.position.set(sx * 0.4, 0.6, zz);
      pv.add(mesh(roundedBox(0.04, 0.04, 0.9), flat(0x8a6a3a), sx * 0.15, -0.25, 0).rotateZ(sx * 0.9));
      boat.add(pv);
      paddles.push(pv);
    }
  }
  boat.add(mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.28, 10), flat(0xd23a3a), 0, 0.5, 2.95));
  const drummer = mesh(new THREE.CylinderGeometry(0.12, 0.14, 0.45, 6), flat(0xe3350d), 0, 0.6, 3.25);
  boat.add(drummer);
  const wake = new THREE.Mesh(
    new THREE.PlaneGeometry(1.6, 4),
    new THREE.MeshBasicMaterial({ map: radial("rgba(255,255,255,.7)", "rgba(255,255,255,0)"), transparent: true, depthWrite: false }),
  );
  wake.rotation.x = -Math.PI / 2;
  wake.position.set(0, 0.02, -4.6);
  boat.add(wake);
  group.add(boat);
  shadowed(boat);
  const update = (t: number) => {
    const a = t * speed + phase;
    boat.position.set(cx + Math.cos(a) * rx, y, cz + Math.sin(a) * rz);
    boat.rotation.y = Math.atan2(-Math.sin(a) * rx, Math.cos(a) * rz);
    const stroke = Math.sin(t * 7.5);
    paddles.forEach((p) => (p.rotation.x = stroke * 0.7));
    drummer.position.y = 0.6 + Math.max(0, Math.sin(t * 15)) * 0.06;
    boat.rotation.z = Math.sin(t * 7.5) * 0.015;
  };
  return { group, update };
}

/** The lake cruise boat, white with a canopy, pottering round an ellipse. */
export function cruiseBoat(cx: number, cz: number, rx: number, rz: number, y: number, speed = 0.035, phase = 0): Anim {
  const group = new THREE.Group();
  const boat = new THREE.Group();
  boat.add(mesh(roundedBox(2.2, 0.6, 6.2), flat(0xf6f3ea), 0, 0.3, 0));
  boat.add(mesh(new THREE.ConeGeometry(1.1, 1.4, 4), flat(0xf6f3ea), 0, 0.3, 3.7).rotateX(Math.PI / 2).rotateY(Math.PI / 4));
  boat.add(mesh(roundedBox(2.25, 0.14, 6.25), flat(0x2f7fd0), 0, 0.5, 0));
  const cabin = new THREE.MeshLambertMaterial({ map: repeat(archWall("#fbf8f0", "#3a6a86", 4, 1, 256, 96, "rgba(0,0,0,0)"), 1, 1) });
  boat.add(mesh(roundedBox(1.8, 0.9, 4.2), cabin, 0, 1.05, -0.4));
  boat.add(mesh(roundedBox(2.1, 0.12, 4.6), flat(0x2f7fd0), 0, 1.56, -0.4));
  const wake = new THREE.Mesh(
    new THREE.PlaneGeometry(2.6, 5),
    new THREE.MeshBasicMaterial({ map: radial("rgba(255,255,255,.65)", "rgba(255,255,255,0)"), transparent: true, depthWrite: false }),
  );
  wake.rotation.x = -Math.PI / 2;
  wake.position.set(0, 0.02, -4.4);
  boat.add(wake);
  group.add(boat);
  shadowed(boat);
  const update = (t: number) => {
    const a = t * speed + phase;
    boat.position.set(cx + Math.cos(a) * rx, y + Math.sin(t * 1.3) * 0.03, cz + Math.sin(a) * rz);
    boat.rotation.y = Math.atan2(-Math.sin(a) * rx, Math.cos(a) * rz);
    boat.rotation.z = Math.sin(t * 0.9) * 0.02;
  };
  return { group, update };
}

// ---------------------------------------------------------------- Joggers

export interface JogRoute {
  path: [number, number][];
  look: JogLook;
  kind?: "jog" | "walk" | "bike";
  loop?: boolean;
  speed?: number;
  /** 0..1 start point along the route. */
  phase?: number;
  bike?: string;
}

export type JogBarks = Record<"jog" | "walk" | "bike" | "pass" | "buddy", string[]>;

const JOG_BARK: JogBarks = {
  jog: ["Semangat!", "Lagi satu round!", "Fuh, penat...", "Petang cantik ni", "Strava dah on?", "PB hari ni!", "Lepas ni nasi lemak", "Esok sambung~", "Jangan berhenti!"],
  walk: ["Jalan laju pun kira", "Dah 8 ribu langkah!", "Makcik jalan je", "Hayun tangan!", "Turun 2kg dah bulan ni"],
  bike: ["Ting ting!", "Best kayuh petang", "Angin sedap!"],
  pass: ["Tumpang kanan~", "Excuse me!", "Tepi sikit dik~", "Ops, sorry!"],
  buddy: ["Jom sama-sama!", "Pace awak okay!", "Ikut saya!", "Semangat dik!", "Lagi sikit!", "Awak boleh!"],
};

/** Everyone out for their evening run: joggers (two-frame stride), makcik power-walkers and rental
 * bikes, going round their routes. They swerve round Qish rather than stopping, and when she runs
 * the same way beside one of them they cheer her on: `buddy()` says that's happening right now. */
export async function joggers(routes: JogRoute[], player: () => THREE.Vector3, barks: JogBarks = JOG_BARK): Promise<Anim & { buddy: () => boolean }> {
  const group = new THREE.Group();
  const shadowMat = new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.22, depthWrite: false });
  const list = await Promise.all(
    routes.map(async (rt, i) => {
      const kind = rt.kind ?? "jog";
      const urls =
        kind === "bike"
          ? [cyclistDoodle(rt.look, rt.bike ?? "#2fa36b"), cyclistDoodle(rt.look, rt.bike ?? "#2fa36b"), cyclistDoodle(rt.look, rt.bike ?? "#2fa36b", true), cyclistDoodle(rt.look, rt.bike ?? "#2fa36b", true)]
          : [joggerDoodle(rt.look, 0), joggerDoodle(rt.look, 1), joggerDoodle(rt.look, 0, true), joggerDoodle(rt.look, 1, true)];
      const h = kind === "bike" ? 2.05 : 1.9;
      const frames = await Promise.all(urls.map((u) => paperStandee(u, h)));
      const g = new THREE.Group();
      for (const f of frames) {
        (f.pivot.children[0] as THREE.Mesh).castShadow = false;
        f.group.visible = false;
        g.add(f.group);
      }
      const sh = new THREE.Mesh(new THREE.CircleGeometry(0.36, 14), shadowMat);
      sh.rotation.x = -Math.PI / 2;
      sh.position.y = 0.03;
      sh.scale.set(1, kind === "bike" ? 1.6 : 1, 1);
      g.add(sh);
      group.add(g);
      const pts = rt.loop ? [...rt.path, rt.path[0]] : rt.path;
      const cum = [0];
      for (let k = 1; k < pts.length; k++) cum.push(cum[k - 1] + Math.hypot(pts[k][0] - pts[k - 1][0], pts[k][1] - pts[k - 1][1]));
      const total = cum[cum.length - 1];
      const base = rt.speed ?? (kind === "bike" ? 6.4 : kind === "walk" ? 1.9 : 3.6);
      return {
        rt,
        kind,
        g,
        frames,
        pts,
        cum,
        total,
        s: (rt.phase ?? (i * 0.37) % 1) * (rt.loop ? total : total * 2),
        speed: base * (0.9 + ((i * 0.29) % 0.25)),
        side: 0,
        stride: i * 1.3,
        dx: 0,
        dz: 1,
        passCool: 0,
      };
    }),
  );

  const at = (r: (typeof list)[number], out: THREE.Vector3) => {
    let d = r.rt.loop ? ((r.s % r.total) + r.total) % r.total : r.s % (r.total * 2);
    let forward = true;
    if (!r.rt.loop && d > r.total) {
      d = r.total * 2 - d;
      forward = false;
    }
    let k = 1;
    while (k < r.cum.length - 1 && r.cum[k] < d) k++;
    const a = r.pts[k - 1];
    const b = r.pts[k];
    const seg = r.cum[k] - r.cum[k - 1] || 1;
    const f = (d - r.cum[k - 1]) / seg;
    out.set(a[0] + (b[0] - a[0]) * f, 0, a[1] + (b[1] - a[1]) * f);
    const sgn = forward ? 1 : -1;
    r.dx = ((b[0] - a[0]) / seg) * sgn;
    r.dz = ((b[1] - a[1]) / seg) * sgn;
    return out;
  };

  const bubbles = Array.from({ length: 4 }, () => {
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
  const last = new THREE.Vector3();
  let haveLast = false;
  let buddyNow = false;
  let buddyWas = false;
  let buddyCool = 0;
  let nextBark = 3;
  const update = (t: number) => {
    const dt = tick(t);
    clock = t;
    const pl = player();
    const pvx = haveLast && dt > 0 ? (pl.x - last.x) / dt : 0;
    const pvz = haveLast && dt > 0 ? (pl.z - last.z) / dt : 0;
    last.copy(pl);
    haveLast = true;
    const pSpeed = Math.hypot(pvx, pvz);
    let buddy: (typeof list)[number] | null = null;
    for (const r of list) {
      r.s += dt * r.speed;
      at(r, v);
      // Swerve round Qish instead of stopping: pick the side away from her.
      const tx = pl.x - v.x;
      const tz = pl.z - v.z;
      const along = tx * r.dx + tz * r.dz;
      const lat = -tx * r.dz + tz * r.dx;
      let target = 0;
      if (along > -0.6 && along < (r.kind === "bike" ? 4 : 2.6) && Math.abs(lat - r.side) < 1.1) {
        target = lat > 0 ? -1.2 : 1.2;
        r.passCool -= dt;
        if (r.passCool <= 0) {
          r.passCool = 6;
          if (r.kind === "bike") sfx.bell();
          speak(r.g, pick(r.kind === "bike" ? ["Ting ting!", "Tepi sikit~"] : barks.pass));
        }
      }
      r.side += (target - r.side) * Math.min(1, dt * 5);
      r.g.position.set(v.x - r.dz * r.side, 0, v.z + r.dx * r.side);
      // Stride: alternate the two frames, bounce on each step.
      r.stride += dt * r.speed * (r.kind === "walk" ? 3.4 : 2.3);
      const frame = Math.floor(r.stride / Math.PI) % 2;
      const away = r.dz < -0.5;
      const mirror = r.dx < -0.1 ? -1 : 1;
      r.frames.forEach((f, k) => {
        f.group.visible = k === (away ? 2 : 0) + (r.kind === "bike" ? 0 : frame);
        f.pivot.scale.x = mirror;
        f.group.position.y = r.kind === "bike" ? Math.abs(Math.sin(r.stride * 0.5)) * 0.03 : Math.abs(Math.sin(r.stride)) * (r.kind === "walk" ? 0.05 : 0.12);
        f.pivot.rotation.z = r.kind === "bike" ? Math.sin(r.stride * 0.5) * 0.03 : Math.sin(r.stride) * 0.05;
      });
      if (r.kind !== "bike" && pSpeed > 2 && !buddy) {
        const d = Math.hypot(r.g.position.x - pl.x, r.g.position.z - pl.z);
        if (d < 2.8 && (pvx * r.dx + pvz * r.dz) / pSpeed > 0.55) buddy = r;
      }
    }
    buddyNow = !!buddy;
    buddyCool -= dt;
    if (buddy && !buddyWas && buddyCool <= 0) {
      buddyCool = 4;
      speak(buddy.g, pick(barks.buddy), 2.2);
    }
    buddyWas = buddyNow;
    if (t > nextBark) {
      nextBark = t + 2.2 + Math.random() * 2.5;
      const near = list.filter((r) => r.g.position.distanceTo(pl) < 11);
      if (near.length) {
        const r = pick(near);
        speak(r.g, pick(barks[r.kind]), 2.2);
      }
    }
    for (const b of bubbles) {
      if (!b.owner || b.until <= t) {
        b.s.visible = false;
        continue;
      }
      const left = b.until - t;
      b.s.position.set(b.owner.position.x, 2.55 + Math.min(0.15, (2.2 - left) * 0.6), b.owner.position.z);
      b.s.material.opacity = Math.min(1, left * 4);
    }
  };
  return { group, update, buddy: () => buddyNow };
}

/** Sweat flicking off Qish while she runs, and a little "-0.1kg" rising each time the scale ticks down. */
export function sweatAndScale(player: () => THREE.Vector3, active: () => boolean, ticks: () => number): Anim {
  const group = new THREE.Group();
  const dropTex = canvasTexture(32, 48, (c) => {
    c.fillStyle = "#8fd3ff";
    c.strokeStyle = INK;
    c.lineWidth = 3;
    c.beginPath();
    c.moveTo(16, 4);
    c.quadraticCurveTo(30, 30, 16, 44);
    c.quadraticCurveTo(2, 30, 16, 4);
    c.fill();
    c.stroke();
  });
  const drops = Array.from({ length: 10 }, () => {
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: dropTex, transparent: true, depthWrite: false }));
    s.scale.set(0.16, 0.24, 1);
    s.visible = false;
    group.add(s);
    return { s, vel: v3(0, 0, 0), life: 0 };
  });
  const kgTex = canvasTexture(192, 64, (c) => {
    c.font = "bold 40px 'Bagel Fat One', sans-serif";
    c.textAlign = "center";
    c.textBaseline = "middle";
    c.lineWidth = 8;
    c.strokeStyle = "#fffdf6";
    c.strokeText("-0.1kg", 96, 34);
    c.fillStyle = "#ff5c93";
    c.fillText("-0.1kg", 96, 34);
  });
  const floats = Array.from({ length: 5 }, () => {
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: kgTex, transparent: true, depthTest: false, depthWrite: false }));
    s.scale.set(1.5, 0.5, 1);
    s.renderOrder = 7;
    s.visible = false;
    group.add(s);
    return { s, life: 0 };
  });
  const tick = ticker();
  const last = new THREE.Vector3();
  let haveLast = false;
  let spawn = 0;
  let seen = ticks();
  const update = (t: number) => {
    const dt = tick(t);
    const p = player();
    const moving = haveLast && Math.hypot(p.x - last.x, p.z - last.z) > 0.02;
    last.copy(p);
    haveLast = true;
    spawn -= dt;
    if (moving && active() && spawn <= 0) {
      spawn = 0.28;
      const d = drops.find((x) => x.life <= 0);
      if (d) {
        d.life = 0.7;
        d.s.visible = true;
        d.s.position.set(p.x + (Math.random() - 0.5) * 0.5, 2.3, p.z);
        d.vel.set((Math.random() - 0.5) * 2.4, 2.2, 0.4);
      }
    }
    for (const d of drops) {
      if (d.life <= 0) continue;
      d.life -= dt;
      d.vel.y -= dt * 9;
      d.s.position.addScaledVector(d.vel, dt);
      d.s.material.opacity = Math.min(1, d.life * 3);
      if (d.life <= 0) d.s.visible = false;
    }
    const n = ticks();
    if (n !== seen) {
      seen = n;
      const f = floats.find((x) => x.life <= 0) ?? floats[0];
      f.life = 1;
      f.s.visible = true;
      f.s.position.set(p.x + (Math.random() < 0.5 ? -1 : 1) * (0.8 + Math.random() * 0.4), 2.4 + Math.random() * 0.3, p.z);
    }
    for (const f of floats) {
      if (f.life <= 0) continue;
      f.life -= dt;
      f.s.position.y += dt * 0.9;
      f.s.material.opacity = Math.min(1, f.life * 2.5);
      if (f.life <= 0) f.s.visible = false;
    }
  };
  return { group, update };
}

// ---------------------------------------------------------------- Paths & signs

/** A paved path along a polyline (promenades, footpaths), with rounded joints. */
export function pathStrip(points: [number, number][], w: number, fill: string, speck = "rgba(0,0,0,.06)", y = 0.025) {
  const tex = repeat(
    canvasTexture(64, 64, (c) => {
      c.fillStyle = fill;
      c.fillRect(0, 0, 64, 64);
      c.fillStyle = speck;
      for (let i = 0; i < 60; i++) c.fillRect(Math.random() * 64, Math.random() * 64, 2, 2);
      c.fillRect(0, 0, 64, 2);
    }),
    1,
    1,
  );
  const mat = new THREE.MeshLambertMaterial({ map: tex });
  const g = new THREE.Group();
  for (let i = 1; i < points.length; i++) {
    const [ax, az] = points[i - 1];
    const [bx, bz] = points[i];
    const len = Math.hypot(bx - ax, bz - az);
    const m = mesh(roundedBox(w, y * 2, len), mat, (ax + bx) / 2, y, (az + bz) / 2);
    m.rotation.y = Math.atan2(bx - ax, bz - az);
    m.receiveShadow = true;
    g.add(m);
  }
  for (const [x, z] of points.slice(1, -1)) {
    const j = mesh(new THREE.CylinderGeometry(w / 2, w / 2, y * 2, 16), mat, x, y, z);
    j.receiveShadow = true;
    g.add(j);
  }
  return g;
}

/** Big standing letters on a stone base, the city name photo spot. */
export function wordSign(text: string, x: number, z: number, w: number, h: number) {
  const g = new THREE.Group();
  const tex = canvasTexture(1024, Math.round(1024 * (h / w)), (c) => {
    const H = c.canvas.height;
    c.font = `bold ${Math.round(H * 0.8)}px 'Bagel Fat One', sans-serif`;
    c.textAlign = "center";
    c.textBaseline = "middle";
    c.lineJoin = "round";
    c.lineWidth = H * 0.12;
    c.strokeStyle = INK;
    c.strokeText(text, 512, H / 2 + H * 0.05);
    const grad = c.createLinearGradient(0, 0, 1024, 0);
    ["#ff5c93", "#ffcb05", "#3fae5a", "#3b6fe0", "#9b6ad6"].forEach((col, i) => grad.addColorStop(i / 4, col));
    c.fillStyle = grad;
    c.fillText(text, 512, H / 2 + H * 0.05);
  });
  const letters = mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshLambertMaterial({ map: tex, transparent: true, alphaTest: 0.4, side: THREE.DoubleSide }), 0, 0.45 + h / 2, 0);
  letters.rotation.x = -0.15;
  letters.castShadow = true;
  letters.customDepthMaterial = new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking, map: tex, alphaTest: 0.4 });
  g.add(letters);
  g.add(mesh(roundedBox(w * 0.96, 0.45, 0.7), flat(0xd8c3a2), 0, 0.22, -0.05));
  g.position.set(x, 0, z);
  return g;
}
