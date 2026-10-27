import { roundedBox } from "../overworld/props";
import { bubbleTex, setBubbleText, speechDuration } from "../ui/speechBubble";
import * as THREE from "three";
import { type PersonLook, buskerDoodle, cajonDoodle, passengerDoodle, personBackDoodle } from "../content/doodles";
import { paperStandee } from "../overworld/paper";
import { canvasTexture, flat } from "../overworld/props";
import type { Box } from "../overworld/zone";
import { shadowed } from "./common";
import type { Anim } from "./labuProps";

// Lorbel: the back lane of a row of shops that turns into a pasar malam at night. Shop backs with
// aircon units and pipes, warm bulbs strung criss-cross overhead, a busking stage with tables in
// front, bundle clothes up top, food stalls down below, and a crowd that is always in the way.

const INK = "#17151f";
type V3 = [number, number, number];

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

const GLOW = once(() => shared(radial("rgba(255,230,170,1)", "rgba(255,170,80,0)")));
const POOL = once(() => shared(radial("rgba(255,190,110,.5)", "rgba(255,170,90,0)", 128)));
const SMOKE = once(() => shared(radial("rgba(220,214,206,.75)", "rgba(220,214,206,0)")));
const BLOB = once(() => new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.28, depthWrite: false }));

const glowMat = (color: number, opacity = 1) =>
  new THREE.SpriteMaterial({ map: GLOW(), color, transparent: true, opacity, depthWrite: false, blending: THREE.AdditiveBlending });

/** Warm pool of light on the ground under the bulbs. */
export function warmPool(x: number, z: number, r = 3, color = 0xffffff) {
  const m = new THREE.Mesh(
    new THREE.PlaneGeometry(r * 2, r * 2),
    new THREE.MeshBasicMaterial({ map: POOL(), color, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }),
  );
  m.rotation.x = -Math.PI / 2;
  m.position.set(x, 0.06, z);
  return m;
}

/** A warm point light (no shadows) to light up the props around a cluster of bulbs. */
export function lampLight(x: number, y: number, z: number, intensity = 30, distance = 13, color = 0xffb468) {
  const l = new THREE.PointLight(color, intensity, distance, 1.4);
  l.position.set(x, y, z);
  return l;
}

/** Hand-lettered sign on cardboard or a painted board. */
function handSign(text: string, sub: string | null, bg: string, fg: string, w = 256, h = 128, font = "bold 54px 'Gaegu', sans-serif") {
  return canvasTexture(w, h, (g) => {
    g.fillStyle = bg;
    g.fillRect(0, 0, w, h);
    g.strokeStyle = "rgba(0,0,0,.25)";
    g.lineWidth = 6;
    g.strokeRect(3, 3, w - 6, h - 6);
    g.fillStyle = fg;
    g.textAlign = "center";
    g.textBaseline = "middle";
    g.font = font;
    g.fillText(text, w / 2, sub ? h * 0.4 : h / 2 + 2);
    if (sub) {
      g.font = `bold ${Math.round(h * 0.24)}px 'Gaegu', sans-serif`;
      g.fillText(sub, w / 2, h * 0.78);
    }
  });
}

function board(tex: THREE.Texture, w: number, h: number, edge = 0x6b4f2a) {
  const e = flat(edge);
  return new THREE.Mesh(roundedBox(w, h, 0.06), [e, e, e, e, new THREE.MeshLambertMaterial({ map: tex }), e]);
}

// ---------------------------------------------------------------- Shop backs

/** Rear facade of a row of shophouses: stained render, grilled windows (some lit), steel back doors,
 * a "no rubbish" sign and one bit of graffiti. Returns the colour map and the lit-window map. */
function facade(wu: number, hu: number, seed: number, wall: string, heart: boolean) {
  const PX = 40;
  const w = Math.min(2048, Math.round(wu * PX));
  const h = Math.round(hu * PX);
  const sx = w / wu;
  const r = rng(seed);
  const lit: [number, number, number, number][] = [];
  const map = canvasTexture(w, h, (g) => {
    g.fillStyle = wall;
    g.fillRect(0, 0, w, h);
    // Rain streaks and grime.
    for (let i = 0; i < w / 6; i++) {
      g.fillStyle = `rgba(30,24,30,${0.04 + r() * 0.08})`;
      const x = r() * w;
      g.fillRect(x, r() * h * 0.3, 2 + r() * 5, h * (0.3 + r() * 0.7));
    }
    g.fillStyle = "rgba(20,16,20,.25)";
    g.fillRect(0, h - 26, w, 26);
    // Floor line ledge.
    const floorY = h - 3.4 * sx;
    g.fillStyle = "rgba(255,255,255,.12)";
    g.fillRect(0, floorY - 6, w, 6);
    g.fillStyle = "rgba(0,0,0,.2)";
    g.fillRect(0, floorY, w, 4);
    // Upper floor windows, every 3 units.
    for (let x = 0.8 * sx; x < w - 1.6 * sx; x += 3 * sx) {
      const wy = floorY - 2.6 * sx;
      const ww = 1.5 * sx;
      const wh = 1.3 * sx;
      const on = r() < 0.45;
      g.fillStyle = on ? "#ffd38a" : "#262a3c";
      g.fillRect(x, wy, ww, wh);
      if (on) {
        lit.push([x, wy, ww, wh]);
        // A curtain half drawn, or someone's silhouette.
        g.fillStyle = r() < 0.5 ? "rgba(214,110,90,.55)" : "rgba(60,40,50,.5)";
        g.fillRect(x, wy, ww * (0.3 + r() * 0.3), wh);
      }
      g.strokeStyle = "#2a2a30";
      g.lineWidth = 3;
      g.strokeRect(x, wy, ww, wh);
      g.lineWidth = 2;
      for (let gx = x + 8; gx < x + ww; gx += 9) {
        g.beginPath();
        g.moveTo(gx, wy);
        g.lineTo(gx, wy + wh);
        g.stroke();
      }
      g.fillStyle = "rgba(0,0,0,.25)";
      g.fillRect(x - 3, wy + wh, ww + 6, 5);
    }
    // Ground floor: steel doors and shutters.
    for (let x = 1.6 * sx; x < w - 1.4 * sx; x += (4 + r() * 3) * sx) {
      const dw = 1.1 * sx;
      const dh = 2.3 * sx;
      if (r() < 0.5) {
        g.fillStyle = "#4a4e58";
        g.fillRect(x, h - dh, dw, dh);
        g.strokeStyle = "#2a2a30";
        g.lineWidth = 3;
        g.strokeRect(x, h - dh, dw, dh);
        g.fillStyle = "#c9ced6";
        g.fillRect(x + dw - 10, h - dh * 0.5, 6, 12);
      } else {
        g.fillStyle = "#6b6e76";
        g.fillRect(x, h - dh, dw * 2, dh);
        g.fillStyle = "rgba(0,0,0,.25)";
        for (let y = h - dh; y < h; y += 6) g.fillRect(x, y, dw * 2, 2);
        x += dw;
      }
    }
    // "No rubbish" plate, which nobody reads.
    const px = w * (0.15 + r() * 0.5);
    g.fillStyle = "#f6f1e4";
    g.fillRect(px, h - 3.0 * sx, 1.4 * sx, 0.5 * sx);
    g.fillStyle = "#c0392b";
    g.font = `bold ${Math.round(0.16 * sx)}px sans-serif`;
    g.textAlign = "center";
    g.fillText("DILARANG BUANG", px + 0.7 * sx, h - 2.8 * sx);
    g.fillText("SAMPAH DI SINI", px + 0.7 * sx, h - 2.6 * sx);
    if (heart) {
      // Somebody's graffiti. Somebody very lazy.
      const hx = w * 0.62;
      const hy = h - 1.3 * sx;
      g.strokeStyle = "#ff5fa2";
      g.lineWidth = 5;
      g.beginPath();
      g.moveTo(hx, hy + 18);
      g.bezierCurveTo(hx - 30, hy - 6, hx - 14, hy - 30, hx, hy - 12);
      g.bezierCurveTo(hx + 14, hy - 30, hx + 30, hy - 6, hx, hy + 18);
      g.stroke();
      g.fillStyle = "#fffdf6";
      g.font = "bold 22px 'Gaegu', sans-serif";
      g.fillText("F + Q", hx, hy - 2);
    }
  });
  const emissive = canvasTexture(w, h, (g) => {
    g.fillStyle = "#000";
    g.fillRect(0, 0, w, h);
    g.fillStyle = "#c98a3a";
    for (const [x, y, ww, wh] of lit) g.fillRect(x, y, ww, wh);
  });
  return { map, emissive };
}

/** A block of shophouses seen from the back lane: the south face is the lane wall. Aircon units hum
 * on the wall (fans spin), pipes run down it, and the roof has water tanks and more aircon. */
export function shopBlock(x0: number, z0: number, x1: number, z1: number, h: number, o: { seed: number; wall?: string; acs?: [number, number][]; heart?: boolean; bins?: number[] }): Anim & { statics: THREE.Group } {
  const statics = new THREE.Group();
  const group = new THREE.Group();
  const wall = o.wall ?? "#a39a8c";
  const front = facade(x1 - x0, h, o.seed, wall, !!o.heart);
  const side = facade(z1 - z0, h, o.seed + 7, wall, false);
  const roof = canvasTexture(128, 128, (g) => {
    g.fillStyle = "#6a6670";
    g.fillRect(0, 0, 128, 128);
    for (let i = 0; i < 60; i++) {
      g.fillStyle = `rgba(0,0,0,${Math.random() * 0.12})`;
      g.fillRect(Math.random() * 128, Math.random() * 128, 12, 12);
    }
  });
  roof.wrapS = roof.wrapT = THREE.RepeatWrapping;
  roof.repeat.set((x1 - x0) / 4, (z1 - z0) / 4);
  const faceMat = (f: { map: THREE.Texture; emissive: THREE.Texture }) =>
    new THREE.MeshLambertMaterial({ map: f.map, emissiveMap: f.emissive, emissive: 0xffffff });
  const sideMat = faceMat(side);
  const body = new THREE.Mesh(roundedBox(x1 - x0, h, z1 - z0), [
    sideMat,
    sideMat,
    new THREE.MeshLambertMaterial({ map: roof }),
    flat(0x333333),
    faceMat(front),
    flat(0x555555),
  ]);
  body.position.set((x0 + x1) / 2, h / 2, (z0 + z1) / 2);
  body.receiveShadow = true;
  body.castShadow = true;
  statics.add(body);
  // Parapet lip round the roof.
  const lip = flat(0x8a8276);
  for (const [w, d, px, pz] of [[x1 - x0, 0.25, (x0 + x1) / 2, z1 - 0.12], [x1 - x0, 0.25, (x0 + x1) / 2, z0 + 0.12], [0.25, z1 - z0, x0 + 0.12, (z0 + z1) / 2], [0.25, z1 - z0, x1 - 0.12, (z0 + z1) / 2]] as const) {
    const m = new THREE.Mesh(roundedBox(w, 0.5, d), lip);
    m.position.set(px, h + 0.25, pz);
    statics.add(m);
  }
  const r = rng(o.seed * 3 + 1);
  // Pipes down the wall, with a horizontal run.
  const pipe = flat(0x8d929a);
  for (let x = x0 + 2.4; x < x1 - 1; x += 5 + r() * 4) {
    const p = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, h, 6), pipe);
    p.position.set(x, h / 2, z1 + 0.14);
    statics.add(p);
  }
  const run = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, x1 - x0, 6), pipe);
  run.rotation.z = Math.PI / 2;
  run.position.set((x0 + x1) / 2, 3.05, z1 + 0.12);
  statics.add(run);
  // Roof clutter: water tanks, aircon condensers.
  for (let x = x0 + 3; x < x1 - 2; x += 6 + r() * 5) {
    const tank = new THREE.Mesh(new THREE.CylinderGeometry(0.75, 0.75, 1.3, 12), flat(r() < 0.5 ? 0x3b6fe0 : 0xd9d4c8));
    tank.position.set(x, h + 1.4, z0 + 1.5 + r() * (z1 - z0 - 3));
    const stand = new THREE.Mesh(roundedBox(1.4, 0.75, 1.4), flat(0x5a5660));
    stand.position.set(tank.position.x, h + 0.38, tank.position.z);
    statics.add(tank, stand);
    const cond = new THREE.Mesh(roundedBox(1.1, 0.8, 0.6), flat(0xe8e4dc));
    cond.position.set(x + 2.2, h + 0.4, z1 - 1.2);
    statics.add(cond);
  }
  // Green wheelie bins at the foot of the wall.
  for (const bx of o.bins ?? []) {
    const bin = new THREE.Mesh(roundedBox(0.75, 1.05, 0.75), flat(0x2f7a4a));
    bin.position.set(bx, 0.53, z1 + 0.5);
    const lid = new THREE.Mesh(roundedBox(0.82, 0.08, 0.82), flat(0x235c38));
    lid.position.set(bx, 1.1, z1 + 0.48);
    lid.rotation.x = -0.15;
    statics.add(bin, lid);
  }
  shadowed(statics);

  // Aircon units on the wall with spinning fans.
  const fans: THREE.Mesh[] = [];
  const grill = once(() =>
    canvasTexture(64, 64, (g) => {
      g.fillStyle = "#d9d5cc";
      g.fillRect(0, 0, 64, 64);
      g.fillStyle = "#3a3a40";
      g.beginPath();
      g.arc(28, 32, 22, 0, Math.PI * 2);
      g.fill();
      g.strokeStyle = "#9a9a92";
      g.lineWidth = 2;
      for (let i = 8; i < 50; i += 6) {
        g.beginPath();
        g.moveTo(8, i);
        g.lineTo(50, i);
        g.stroke();
      }
    }),
  );
  for (const [ax, ay] of o.acs ?? []) {
    const box = flat(0xd9d5cc);
    const unit = new THREE.Mesh(roundedBox(1.0, 0.72, 0.45), [box, box, box, box, new THREE.MeshLambertMaterial({ map: grill() }), box]);
    unit.position.set(ax, ay, z1 + 0.3);
    unit.castShadow = true;
    const fan = new THREE.Mesh(roundedBox(0.62, 0.08, 0.02), flat(0x6b6e76));
    fan.position.set(ax - 0.06, ay, z1 + 0.54);
    const bracket = new THREE.Mesh(roundedBox(1.1, 0.06, 0.5), flat(0x55555e));
    bracket.position.set(ax, ay - 0.4, z1 + 0.28);
    // A drip line staining the wall under it.
    const drip = new THREE.Mesh(new THREE.PlaneGeometry(0.12, ay - 0.4), new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.18 }));
    drip.position.set(ax + 0.3, (ay - 0.4) / 2, z1 + 0.02);
    statics.add(bracket, drip);
    group.add(unit, fan);
    fans.push(fan);
  }
  const update = (t: number) => fans.forEach((f, i) => (f.rotation.z = t * (9 + i)));
  return { group, update, statics };
}

/** A low car park boom: a striped arm on a short post that swings up when `open()` is true, and a small
 * sign. Kept low so it never hides Qish walking through. The arm spans `w` towards +x. */
export function parkingBoom(x: number, z: number, w: number, open: () => boolean): Anim {
  const group = new THREE.Group();
  const housing = new THREE.Mesh(roundedBox(0.45, 1.05, 0.45), flat(0xf2c41b));
  housing.position.y = 0.52;
  const cap = new THREE.Mesh(roundedBox(0.5, 0.08, 0.5), flat(0x2a2730));
  cap.position.y = 1.08;
  const rest = new THREE.Mesh(roundedBox(0.12, 0.8, 0.12), flat(0x2a2730));
  rest.position.set(w, 0.4, 0);
  const sign = board(handSign("P", "MASUK / KELUAR", "#2f5fd0", "#fffdf6", 192, 160, "bold 76px 'Bagel Fat One', sans-serif"), 0.75, 0.62, 0x2a2730);
  sign.position.set(-0.45, 1.55, 0.05);
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 1.3, 5), flat(0x2a2730));
  pole.position.set(-0.45, 0.65, 0);
  group.add(housing, cap, rest, sign, pole);
  const pivot = new THREE.Group();
  pivot.position.set(0, 0.92, 0.1);
  const tex = canvasTexture(128, 16, (g) => {
    for (let i = 0; i < 8; i++) {
      g.fillStyle = i % 2 ? "#fffdf6" : "#e3350d";
      g.fillRect(i * 16, 0, 16, 16);
    }
  });
  const arm = new THREE.Mesh(roundedBox(w, 0.12, 0.12), new THREE.MeshLambertMaterial({ map: tex }));
  arm.geometry.translate(w / 2, 0, 0);
  pivot.add(arm);
  group.add(pivot);
  shadowed(group);
  group.position.set(x, 0, z);
  let angle = open() ? 1.35 : 0;
  const tick = ticker();
  const update = (t: number) => {
    const dt = tick(t);
    angle += ((open() ? 1.35 : 0) - angle) * Math.min(1, dt * 3);
    pivot.rotation.z = angle;
  };
  update(0);
  return { group, update };
}

/** Words painted on the ground (car park markings), reading from the camera. */
export function groundPaint(text: string, x: number, z: number, w: number, d: number) {
  const tex = canvasTexture(512, Math.round(512 * (d / w)), (g) => {
    g.fillStyle = "rgba(240,236,224,.85)";
    g.font = `bold ${Math.round(g.canvas.height * 0.62)}px 'Bagel Fat One', sans-serif`;
    g.textAlign = "center";
    g.textBaseline = "middle";
    g.fillText(text, 256, g.canvas.height / 2 + 4);
  });
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, d), new THREE.MeshLambertMaterial({ map: tex, transparent: true, depthWrite: false }));
  m.rotation.x = -Math.PI / 2;
  m.position.set(x, 0.05, z);
  return m;
}

/** Low concrete wall (the lane's open side) with a drain along it. */
export function lowWall(x0: number, x1: number, z: number, h = 0.9) {
  const g = new THREE.Group();
  const w = new THREE.Mesh(roundedBox(x1 - x0, h, 0.3), flat(0x9a948a));
  w.position.set((x0 + x1) / 2, h / 2, z);
  const cap = new THREE.Mesh(roundedBox(x1 - x0, 0.08, 0.4), flat(0xb5afa4));
  cap.position.set((x0 + x1) / 2, h + 0.04, z);
  const drain = new THREE.Mesh(roundedBox(x1 - x0, 0.04, 0.45), flat(0x3a3a40));
  drain.position.set((x0 + x1) / 2, 0.03, z - 0.45);
  g.add(w, cap, drain);
  return shadowed(g);
}

/** Painted pole the light strings tie off on. */
export function lightPole(x: number, z: number, h = 4.8) {
  const g = new THREE.Group();
  const p = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.09, h, 6), flat(0x3a3a40));
  p.position.y = h / 2;
  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.32, 0.35, 8), flat(0x9a948a));
  base.position.y = 0.17;
  g.add(p, base);
  g.position.set(x, 0, z);
  return shadowed(g);
}

// ---------------------------------------------------------------- Lights

export interface Strand {
  a: V3;
  b: V3;
  sag?: number;
  /** Bulbs per unit length. */
  density?: number;
}

/** Strings of warm bulbs criss-crossing overhead. One instanced mesh for every bulb, one point cloud
 * for their glow, one line set for the wires; they sway a little and the odd bulb flickers. */
export function festoons(strands: Strand[]): Anim {
  const group = new THREE.Group();
  const SEG = 14;
  type Bulb = { s: number; k: number; tint: THREE.Color };
  const bulbs: Bulb[] = [];
  const at = (s: Strand, k: number, t: number, out: THREE.Vector3) => {
    const sag = (s.sag ?? 0.7) * Math.sin(k * Math.PI);
    out.set(s.a[0] + (s.b[0] - s.a[0]) * k, s.a[1] + (s.b[1] - s.a[1]) * k - sag, s.a[2] + (s.b[2] - s.a[2]) * k);
    const sway = Math.sin(t * 0.9 + s.a[0] * 0.7 + s.a[2]) * 0.07 * Math.sin(k * Math.PI);
    out.z += sway;
    out.x += sway * 0.5;
    return out;
  };
  const warm = new THREE.Color(0xffc45e);
  const white = new THREE.Color(0xfff0c8);
  strands.forEach((s, si) => {
    const len = Math.hypot(s.b[0] - s.a[0], s.b[1] - s.a[1], s.b[2] - s.a[2]);
    const n = Math.max(4, Math.round(len * (s.density ?? 1.7)));
    for (let i = 0; i < n; i++) bulbs.push({ s: si, k: (i + 0.5) / n, tint: (i * 7 + si) % 9 === 0 ? white : warm });
  });
  const mesh = new THREE.InstancedMesh(new THREE.SphereGeometry(0.075,20,14), new THREE.MeshBasicMaterial({ color: 0xffffff, toneMapped: false }), bulbs.length);
  const glowPos = new Float32Array(bulbs.length * 3);
  const glowCol = new Float32Array(bulbs.length * 3);
  const glowGeo = new THREE.BufferGeometry();
  glowGeo.setAttribute("position", new THREE.BufferAttribute(glowPos, 3));
  glowGeo.setAttribute("color", new THREE.BufferAttribute(glowCol, 3));
  const glow = new THREE.Points(
    glowGeo,
    new THREE.PointsMaterial({ size: 1.05, map: GLOW(), vertexColors: true, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, sizeAttenuation: true }),
  );
  glow.frustumCulled = false;
  const wirePos = new Float32Array(strands.length * SEG * 6);
  const wireGeo = new THREE.BufferGeometry();
  wireGeo.setAttribute("position", new THREE.BufferAttribute(wirePos, 3));
  const wire = new THREE.LineSegments(wireGeo, new THREE.LineBasicMaterial({ color: 0x15121a }));
  wire.frustumCulled = false;
  mesh.frustumCulled = false;
  group.add(wire, mesh, glow);

  const dim = new Float32Array(bulbs.length).fill(1);
  const v = new THREE.Vector3();
  const m4 = new THREE.Matrix4();
  const c = new THREE.Color();
  const tick = ticker();
  let nextFlicker = 0;
  const update = (t: number) => {
    const dt = tick(t);
    if (t > nextFlicker) {
      dim[Math.floor(Math.random() * bulbs.length)] = 0.15;
      nextFlicker = t + 0.4 + Math.random() * 1.6;
    }
    bulbs.forEach((b, i) => {
      at(strands[b.s], b.k, t, v);
      m4.makeTranslation(v.x, v.y, v.z);
      mesh.setMatrixAt(i, m4);
      dim[i] = Math.min(1, dim[i] + dt * 2.5);
      c.copy(b.tint).multiplyScalar(dim[i]);
      mesh.setColorAt(i, c);
      glowPos.set([v.x, v.y, v.z], i * 3);
      glowCol.set([c.r * 0.9, c.g * 0.75, c.b * 0.5], i * 3);
    });
    strands.forEach((s, si) => {
      for (let j = 0; j < SEG; j++) {
        at(s, j / SEG, t, v);
        wirePos.set([v.x, v.y + 0.07, v.z], (si * SEG + j) * 6);
        at(s, (j + 1) / SEG, t, v);
        wirePos.set([v.x, v.y + 0.07, v.z], (si * SEG + j) * 6 + 3);
      }
    });
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    glowGeo.attributes.position.needsUpdate = true;
    glowGeo.attributes.color.needsUpdate = true;
    wireGeo.attributes.position.needsUpdate = true;
  };
  update(0);
  return { group, update };
}

/** Neon on the wall: tube letters with a halo, buzzing off for a blink now and then. */
export function neonSign(text: string, x: number, y: number, z: number, color: string, w = 4, h = 1.2, rotY = 0): Anim {
  const group = new THREE.Group();
  const tex = canvasTexture(1024, Math.round(1024 * (h / w)), (g) => {
    const H = g.canvas.height;
    g.font = `bold ${Math.round(H * 0.62)}px 'Bagel Fat One', sans-serif`;
    g.textAlign = "center";
    g.textBaseline = "middle";
    g.shadowColor = color;
    for (const blur of [40, 22, 10]) {
      g.shadowBlur = blur;
      g.strokeStyle = color;
      g.lineWidth = 10;
      g.strokeText(text, 512, H / 2 + 6);
    }
    g.shadowBlur = 0;
    g.lineWidth = 4;
    g.strokeStyle = "#fff6fb";
    g.strokeText(text, 512, H / 2 + 6);
  });
  const back = new THREE.Mesh(roundedBox(w * 0.96, h * 0.8, 0.08), flat(0x1c1a22));
  back.position.z = -0.06;
  const face = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false, toneMapped: false }));
  const halo = new THREE.Sprite(glowMat(new THREE.Color(color).getHex(), 0.5));
  halo.scale.set(w * 1.6, h * 2.4, 1);
  halo.position.z = 0.05;
  group.add(back, face, halo);
  group.position.set(x, y, z);
  group.rotation.y = rotY;
  let off = 0;
  const update = (t: number) => {
    // Mostly steady; every few seconds a short double blink.
    const cycle = (t + x) % 6.5;
    off = cycle > 6.0 && (cycle < 6.08 || (cycle > 6.18 && cycle < 6.24)) ? 1 : 0;
    face.material.opacity = off ? 0.25 : 1;
    halo.material.opacity = off ? 0.1 : 0.45 + Math.sin(t * 13) * 0.03;
  };
  return { group, update };
}

// ---------------------------------------------------------------- Puddles, tables

/** Rain puddle on the lane, catching the bulbs above. */
export function puddle(x: number, z: number, w: number, d: number, seed = 0) {
  const g = new THREE.Group();
  const shape = new THREE.Mesh(new THREE.CircleGeometry(1, 20), new THREE.MeshBasicMaterial({ color: 0x1a1a2a, transparent: true, opacity: 0.45, depthWrite: false }));
  shape.rotation.x = -Math.PI / 2;
  shape.scale.set(w / 2, d / 2, 1);
  shape.position.y = 0.04;
  g.add(shape);
  const r = rng(seed + 11);
  for (let i = 0; i < 4; i++) {
    const s = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.5), new THREE.MeshBasicMaterial({ map: GLOW(), color: 0xffb060, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
    s.rotation.x = -Math.PI / 2;
    s.position.set((r() - 0.5) * w * 0.7, 0.05, (r() - 0.5) * d * 0.6);
    g.add(s);
  }
  g.position.set(x, 0, z);
  return g;
}

/** Plastic table with four stools and someone's dinner on it. */
export function diningTable(x: number, z: number, top: number, stool: number, seed = 0, round = false) {
  const g = new THREE.Group();
  const t = new THREE.Mesh(round ? new THREE.CylinderGeometry(0.7, 0.7, 0.06, 18) : roundedBox(1.15, 0.06, 1.15), flat(top));
  t.position.y = 0.74;
  g.add(t);
  const legs = round ? [[0, 0]] : [[-0.5, -0.5], [0.5, -0.5], [-0.5, 0.5], [0.5, 0.5]];
  for (const [lx, lz] of legs) {
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(round ? 0.06 : 0.03, round ? 0.06 : 0.03, 0.72, 6), flat(top));
    leg.position.set(lx, 0.36, lz);
    g.add(leg);
  }
  if (round) {
    const foot = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.4, 0.05, 12), flat(top));
    foot.position.y = 0.03;
    g.add(foot);
  }
  for (const [sx, sz] of [[0, -0.9], [0, 0.9], [-0.9, 0], [0.9, 0]]) {
    const s = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.16, 0.45, 8), flat(stool));
    s.position.set(sx, 0.225, sz);
    g.add(s);
  }
  const r = rng(seed + 3);
  const foods = [0xd9452b, 0x7a3b22, 0xf2c14b, 0x46b86a, 0xe8d8b0];
  for (let i = 0; i < 2 + Math.floor(r() * 2); i++) {
    const px = (r() - 0.5) * 0.6;
    const pz = (r() - 0.5) * 0.6;
    const plate = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.17, 0.04, 10), flat(0xf4f1e6));
    plate.position.set(px, 0.79, pz);
    const heap = new THREE.Mesh(new THREE.SphereGeometry(0.12, 24, 16), flat(foods[Math.floor(r() * foods.length)]));
    heap.scale.y = 0.55;
    heap.position.set(px, 0.85, pz);
    g.add(plate, heap);
  }
  for (let i = 0; i < 2; i++) {
    const cup = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.05, 0.18, 8), flat([0xff5f7a, 0xffcb05, 0x46b86a, 0xb57cff][Math.floor(r() * 4)]));
    cup.position.set(-0.35 + i * 0.7, 0.86, 0.38 - i * 0.7);
    g.add(cup);
  }
  const tissue = new THREE.Mesh(roundedBox(0.22, 0.1, 0.12), flat(0xffffff));
  tissue.position.set(0.3, 0.82, -0.05);
  g.add(tissue);
  g.position.set(x, 0, z);
  return shadowed(g);
}

// ---------------------------------------------------------------- Busking stage

/** Collider boxes covering a rotated rectangle, sliced along its width. */
export function rotatedBoxes(cx: number, cz: number, w: number, d: number, rot: number, slices = 5): Box[] {
  const out: Box[] = [];
  const c = Math.cos(rot);
  const s = Math.sin(rot);
  for (let i = 0; i < slices; i++) {
    const xa = -w / 2 + (w * i) / slices;
    const xb = xa + w / slices;
    const pts = [[xa, -d / 2], [xb, -d / 2], [xa, d / 2], [xb, d / 2]].map(([lx, lz]) => [cx + lx * c + lz * s, cz - lx * s + lz * c]);
    out.push([Math.min(...pts.map((p) => p[0])) + 0.2, Math.min(...pts.map((p) => p[1])) + 0.2, Math.max(...pts.map((p) => p[0])) - 0.2, Math.max(...pts.map((p) => p[1])) - 0.2]);
  }
  return out;
}

const NOTE_TEX = once(() =>
  ["♪", "♫", "♥", "♪"].map((ch, i) =>
    shared(
      canvasTexture(64, 64, (g) => {
        g.font = "bold 48px sans-serif";
        g.textAlign = "center";
        g.textBaseline = "middle";
        g.lineWidth = 6;
        g.strokeStyle = INK;
        g.strokeText(ch, 32, 34);
        g.fillStyle = ["#ffe08a", "#ff9fd0", "#ff5fa2", "#9fe0ff"][i];
        g.fillText(ch, 32, 34);
      }),
    ),
  ),
);

/** Lorbel's busking stage: a low platform under a truss with par cans sweeping coloured beams, a
 * hand-painted banner, speakers that thump on the beat, and the busker plus a friend on a cajon. */
export async function buskingStage(
  x: number,
  z: number,
  rot: number,
  beat: number,
  o: { w?: number; d?: number; sideBanner?: boolean } = {},
): Promise<Anim & { boxes: Box[]; statics: THREE.Group }> {
  const group = new THREE.Group();
  const statics = new THREE.Group();
  const W = o.w ?? 7.2;
  const D = o.d ?? 4.2;
  const H = 0.65;
  const planks = canvasTexture(128, 128, (g) => {
    g.fillStyle = "#4a3426";
    g.fillRect(0, 0, 128, 128);
    g.fillStyle = "rgba(0,0,0,.3)";
    for (let y = 0; y < 128; y += 16) g.fillRect(0, y, 128, 2);
  });
  planks.wrapS = planks.wrapT = THREE.RepeatWrapping;
  planks.repeat.set(3, 2);
  const skirt = flat(0x1c1a22);
  const deck = new THREE.Mesh(roundedBox(W, H, D), [skirt, skirt, new THREE.MeshLambertMaterial({ map: planks }), skirt, skirt, skirt]);
  deck.position.y = H / 2;
  const rug = new THREE.Mesh(roundedBox(3.4, 0.02, 2.2), flat(0x8a2a3a));
  rug.position.set(0.3, H + 0.01, 0.1);
  const rugBorder = new THREE.Mesh(roundedBox(3.0, 0.025, 1.8), flat(0xd9a03a));
  rugBorder.position.set(0.3, H + 0.012, 0.1);
  const step = new THREE.Mesh(roundedBox(1.2, 0.32, 0.6), flat(0x2a2730));
  step.position.set(-W / 2 + 0.9, 0.16, D / 2 + 0.3);
  statics.add(deck, rug, rugBorder, step);
  // Truss.
  const truss = flat(0xb7bec8);
  const TH = 4.6;
  for (const [px, pz] of [[-W / 2 + 0.2, D / 2 - 0.2], [W / 2 - 0.2, D / 2 - 0.2], [-W / 2 + 0.2, -D / 2 + 0.2], [W / 2 - 0.2, -D / 2 + 0.2]]) {
    const post = new THREE.Mesh(roundedBox(0.2, TH, 0.2), truss);
    post.position.set(px, H + TH / 2, pz);
    statics.add(post);
  }
  for (const pz of [D / 2 - 0.2, -D / 2 + 0.2]) {
    const beam = new THREE.Mesh(roundedBox(W, 0.22, 0.22), truss);
    beam.position.set(0, H + TH, pz);
    statics.add(beam);
  }
  for (const px of [-W / 2 + 0.2, W / 2 - 0.2]) {
    const beam = new THREE.Mesh(roundedBox(0.22, 0.22, D), truss);
    beam.position.set(px, H + TH, 0);
    statics.add(beam);
  }
  // Banner across the back.
  const banner = canvasTexture(1024, 220, (g) => {
    g.fillStyle = "#1f1a3a";
    g.fillRect(0, 0, 1024, 220);
    g.fillStyle = "#ffcb05";
    for (let i = 0; i < 1024; i += 40) {
      g.beginPath();
      g.arc(i + 20, 10, 6, 0, Math.PI * 2);
      g.arc(i + 20, 210, 6, 0, Math.PI * 2);
      g.fill();
    }
    g.textAlign = "center";
    g.textBaseline = "middle";
    g.font = "bold 100px 'Bagel Fat One', sans-serif";
    g.lineWidth = 12;
    g.strokeStyle = "#ff5fa2";
    g.strokeText("BUSKING LORBEL", 512, 96);
    g.fillStyle = "#fffdf6";
    g.fillText("BUSKING LORBEL", 512, 96);
    g.font = "bold 38px 'Gaegu', sans-serif";
    g.fillStyle = "#ffe08a";
    g.fillText("♪ setiap malam · request lagu boleh ♪", 512, 172);
  });
  // Across the back, or (for a stage seen side-on) across the end nearest the camera.
  const ban = new THREE.Mesh(new THREE.PlaneGeometry((o.sideBanner ? D : W) - 0.6, (o.sideBanner ? D - 0.6 : W - 0.6) * 0.22), new THREE.MeshLambertMaterial({ map: banner, emissive: 0x2a2030 }));
  if (o.sideBanner) {
    ban.position.set(-W / 2 + 0.2, H + TH - 0.85, 0);
    ban.rotation.y = -Math.PI / 2;
  } else ban.position.set(0, H + 3.6, -D / 2 + 0.25);
  statics.add(ban);
  // Speakers on the front corners, monitor wedge, mic stand, amp, tip box.
  const woofers: THREE.Mesh[] = [];
  for (const sx of [-W / 2 + 0.7, W / 2 - 0.7]) {
    const sp = new THREE.Mesh(roundedBox(0.95, 1.7, 0.75), flat(0x1c1a22));
    sp.position.set(sx, H + 0.85, D / 2 - 0.6);
    statics.add(sp);
    for (const wy of [0.45, 1.25]) {
      const cone = new THREE.Mesh(new THREE.CircleGeometry(wy < 1 ? 0.32 : 0.18, 16), flat(0x3a3a44));
      cone.position.set(sx, H + wy, D / 2 - 0.22);
      group.add(cone);
      woofers.push(cone);
    }
  }
  const wedge = new THREE.Mesh(roundedBox(0.9, 0.4, 0.5), flat(0x1c1a22));
  wedge.position.set(-0.4, H + 0.2, D / 2 - 0.45);
  wedge.rotation.x = -0.4;
  const stand = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 1.5, 5), flat(0x2a2a30));
  stand.position.set(-0.55, H + 0.75, 0.75);
  const mic = new THREE.Mesh(new THREE.SphereGeometry(0.07,20,14), flat(0x9aa0aa));
  mic.position.set(-0.55, H + 1.52, 0.8);
  const amp = new THREE.Mesh(roundedBox(0.8, 0.6, 0.45), flat(0x2a2730));
  amp.position.set(2.6, H + 0.3, -0.6);
  const ampGrill = new THREE.Mesh(new THREE.PlaneGeometry(0.66, 0.4), flat(0xc9b48a));
  ampGrill.position.set(2.6, H + 0.32, -0.37);
  const tip = new THREE.Mesh(roundedBox(0.55, 0.35, 0.4), flat(0xd38a3c));
  tip.position.set(0.4, 0.18, D / 2 + 0.55);
  const tipSign = board(handSign("TQ ♥", "tip sikit~", "#fffdf6", INK, 192, 112), 0.55, 0.32, 0xd38a3c);
  tipSign.position.set(0.4, 0.55, D / 2 + 0.72);
  tipSign.rotation.set(-0.3, 0, 0, "YXZ");
  tipSign.rotation.y = -rot;
  const cash = new THREE.Mesh(roundedBox(0.3, 0.04, 0.15), flat(0x6fbf73));
  cash.position.set(0.35, 0.37, D / 2 + 0.55);
  statics.add(wedge, stand, mic, amp, ampGrill, tip, tipSign, cash);
  shadowed(statics);

  // Par cans on the front beam, each throwing a coloured beam that sweeps the stage.
  const COLORS = [0xff4fa0, 0x4fd2ff, 0xffb347, 0xb57cff];
  const beamTex = once(() =>
      canvasTexture(4, 64, (g) => {
        const grad = g.createLinearGradient(0, 0, 0, 64);
        grad.addColorStop(0, "rgba(255,255,255,.75)");
        grad.addColorStop(1, "rgba(255,255,255,0)");
        g.fillStyle = grad;
        g.fillRect(0, 0, 4, 64);
      }),
  );
  const cans = COLORS.map((col, i) => {
    const pivot = new THREE.Group();
    pivot.position.set(-W / 2 + W * ((i + 0.5) / 4), H + TH - 0.25, D / 2 - 0.2);
    const can = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.2, 0.42, 10), flat(0x1c1a22));
    const lens = new THREE.Mesh(new THREE.CircleGeometry(0.15, 12), new THREE.MeshBasicMaterial({ color: col, toneMapped: false }));
    lens.rotation.x = Math.PI / 2;
    lens.position.y = -0.22;
    const L = 4.4;
    const cone = new THREE.Mesh(
      new THREE.CylinderGeometry(0.12, 1.1, L, 18, 1, true),
      new THREE.MeshBasicMaterial({ map: beamTex(), color: col, transparent: true, opacity: 0.32, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide }),
    );
    cone.position.y = -L / 2 - 0.2;
    const spot = new THREE.Mesh(
      new THREE.PlaneGeometry(2.4, 2.4),
      new THREE.MeshBasicMaterial({ map: GLOW(), color: col, transparent: true, opacity: 0.6, depthWrite: false, blending: THREE.AdditiveBlending }),
    );
    spot.rotation.x = -Math.PI / 2;
    group.add(spot);
    pivot.add(can, lens, cone);
    group.add(pivot);
    return { pivot, cone, spot, i };
  });

  // The performers.
  const busker = await paperStandee(buskerDoodle(), 2.35);
  busker.group.position.set(-0.6, H, 0.35);
  // Paper people face the camera whichever way the stage is turned.
  busker.group.rotation.y = -rot;
  const cajon = await paperStandee(cajonDoodle(), 1.75);
  cajon.group.position.set(1.7, H, -0.2);
  cajon.group.rotation.y = -rot;
  group.add(busker.group, cajon.group);

  // Notes floating up off the guitar.
  const notes = Array.from({ length: 6 }, (_, i) => {
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: NOTE_TEX()[i % 4], transparent: true, depthWrite: false }));
    s.scale.setScalar(0.45);
    group.add(s);
    return { s, phase: i / 6 };
  });

  for (const g of [group, statics]) {
    g.position.set(x, 0, z);
    g.rotation.y = rot;
  }
  const v = new THREE.Vector3();
  const update = (t: number) => {
    const ph = (t / beat) % 1;
    const thump = Math.pow(1 - ph, 4);
    woofers.forEach((w) => w.scale.setScalar(1 + thump * 0.12));
    busker.pivot.rotation.z = Math.sin((t / beat) * Math.PI) * 0.05;
    busker.group.position.y = H + thump * 0.04;
    cajon.group.position.y = H + Math.abs(Math.sin((t / beat) * Math.PI * 2)) * 0.05;
    cajon.pivot.rotation.z = Math.sin((t / beat) * Math.PI * 2) * 0.03;
    for (const c of cans) {
      // Sweep slowly; cross over every few bars.
      c.pivot.rotation.z = Math.sin(t * 0.55 + c.i * 1.6) * 0.42;
      c.pivot.rotation.x = 0.35 + Math.sin(t * 0.4 + c.i) * 0.18;
      c.cone.material.opacity = 0.22 + thump * 0.12;
      v.set(0, -4.6, 0).applyEuler(c.pivot.rotation).add(c.pivot.position);
      c.spot.position.set(v.x, H + 0.03, THREE.MathUtils.clamp(v.z, -D / 2, D / 2 + 2.5));
      if (v.z > D / 2) c.spot.position.y = 0.05;
    }
    for (const n of notes) {
      const k = (t * 0.32 + n.phase) % 1;
      n.s.position.set(-0.4 + Math.sin(k * 6 + n.phase * 9) * 0.5 + k * 0.6, H + 2.0 + k * 2.6, 0.5);
      n.s.material.opacity = Math.sin(k * Math.PI);
      n.s.material.rotation = Math.sin(t * 2 + n.phase * 6) * 0.3;
    }
  };
  return { group, update, statics, boxes: rotatedBoxes(x, z, W, D, rot) };
}

// ---------------------------------------------------------------- Smoke & steam

/** Smoke off a satay grill or steam off a pot: soft puffs rising and spreading out. */
export function smoke(x: number, y: number, z: number, o: { n?: number; rise?: number; size?: number; color?: number; drift?: number; opacity?: number } = {}): Anim {
  const group = new THREE.Group();
  const n = o.n ?? 8;
  const puffs = Array.from({ length: n }, (_, i) => {
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: SMOKE(), color: o.color ?? 0xd8d2ca, transparent: true, depthWrite: false }));
    group.add(s);
    return { s, phase: i / n, seed: Math.random() * 10 };
  });
  group.position.set(x, y, z);
  const rise = o.rise ?? 2.6;
  const size = o.size ?? 0.9;
  const update = (t: number) => {
    for (const p of puffs) {
      const k = (t * 0.28 + p.phase) % 1;
      p.s.position.set(Math.sin(k * 4 + p.seed) * 0.3 + k * (o.drift ?? 0.8), k * rise, Math.cos(k * 3 + p.seed) * 0.2);
      p.s.scale.setScalar(size * (0.4 + k * 1.4));
      p.s.material.opacity = Math.sin(k * Math.PI) * (o.opacity ?? 0.45);
    }
  };
  return { group, update };
}

// ---------------------------------------------------------------- Food stalls

export type StallKind = "satay" | "salai" | "malatang" | "balang" | "mango" | "burger" | "ramen" | "takoyaki";

const STALL_LOOK: Record<StallKind, { name: string; sub: string; tarp: [string, string]; sign: string; text: string }> = {
  satay: { name: "SATAY", sub: "ayam · daging · 80sen", tarp: ["#e3350d", "#fffdf6"], sign: "#e3350d", text: "#fffdf6" },
  salai: { name: "DAGING SALAI", sub: "masak lemak cili api", tarp: ["#2f8a4a", "#f2d27a"], sign: "#2f5a3a", text: "#ffe08a" },
  malatang: { name: "MALATANG", sub: "pilih sendiri · timbang", tarp: ["#c0392b", "#ffcb05"], sign: "#8a1c1c", text: "#ffcb05" },
  balang: { name: "AIR BALANG", sub: "RM2 · sejuk gila", tarp: ["#3b6fe0", "#fffdf6"], sign: "#3b6fe0", text: "#fffdf6" },
  mango: { name: "KEK MANGO", sub: "fresh setiap hari", tarp: ["#ffb347", "#fffdf6"], sign: "#f29a1f", text: "#fffdf6" },
  burger: { name: "BURGER", sub: "special · double · telur", tarp: ["#2a2730", "#ffcb05"], sign: "#2a2730", text: "#ffcb05" },
  ramen: { name: "RAMEN PEDAS", sub: "level 1 sampai level 10", tarp: ["#8a1c1c", "#fffdf6"], sign: "#1c1a22", text: "#ff6a3a" },
  takoyaki: { name: "TAKOYAKI", sub: "6 biji RM6", tarp: ["#2a2730", "#ff8fb1"], sign: "#ff8fb1", text: "#2a2730" },
};

function stripesTex(a: string, b: string) {
  return canvasTexture(128, 64, (g) => {
    for (let i = 0; i < 8; i++) {
      g.fillStyle = i % 2 ? b : a;
      g.fillRect(i * 16, 0, 16, 64);
    }
    // Scalloped valance shadow.
    g.fillStyle = "rgba(0,0,0,.12)";
    g.fillRect(0, 54, 128, 10);
  });
}

/** A pasar malam stall facing +z: counter with a printed banner, striped canopy, name board on top,
 * a bare bulb, and whatever it sells (with smoke or steam). */
/** Axis-aligned box around a local box [x0, z0, x1, z1] turned by `rot` about (cx, cz). */
function turnedBox(cx: number, cz: number, b: Box, rot: number): Box {
  const c = Math.cos(rot);
  const s = Math.sin(rot);
  const pts = [[b[0], b[1]], [b[2], b[1]], [b[0], b[3]], [b[2], b[3]]].map(([lx, lz]) => [cx + lx * c + lz * s, cz - lx * s + lz * c]);
  return [Math.min(...pts.map((p) => p[0])), Math.min(...pts.map((p) => p[1])), Math.max(...pts.map((p) => p[0])), Math.max(...pts.map((p) => p[1]))];
}

/** `rot` turns the stall to face along a corridor (±π/2); its name board keeps facing the camera. */
export function foodStall(x: number, z: number, kind: StallKind, rot = 0): { statics: THREE.Group; anim: Anim; box: Box } {
  const look = STALL_LOOK[kind];
  const g = new THREE.Group();
  const live = new THREE.Group();
  const updates: ((t: number) => void)[] = [];
  const W = 3.3;
  // Counter with banner.
  const front = canvasTexture(512, 128, (c) => {
    c.fillStyle = look.sign;
    c.fillRect(0, 0, 512, 128);
    c.fillStyle = look.text;
    c.textAlign = "center";
    c.textBaseline = "middle";
    c.font = "bold 58px 'Bagel Fat One', sans-serif";
    c.fillText(look.name, 256, 52);
    c.font = "bold 30px 'Gaegu', sans-serif";
    c.fillText(look.sub, 256, 104);
  });
  const steel = flat(0xb7bec8);
  const counter = new THREE.Mesh(roundedBox(W, 0.95, 0.8), [steel, steel, flat(0xd9d5cc), steel, new THREE.MeshLambertMaterial({ map: front }), steel]);
  counter.position.set(0, 0.475, 0.5);
  const backTable = new THREE.Mesh(roundedBox(W, 0.85, 0.6), flat(0x8a8276));
  backTable.position.set(0, 0.425, -0.75);
  g.add(counter, backTable);
  // Canopy.
  const pole = flat(0x9aa0aa);
  for (const [px, pz, ph] of [[-W / 2 - 0.1, 1.0, 2.6], [W / 2 + 0.1, 1.0, 2.6], [-W / 2 - 0.1, -1.1, 2.45], [W / 2 + 0.1, -1.1, 2.45]]) {
    const p = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, ph, 5), pole);
    p.position.set(px, ph / 2, pz);
    g.add(p);
  }
  const tarpTex = stripesTex(...look.tarp);
  tarpTex.wrapS = THREE.RepeatWrapping;
  tarpTex.repeat.set(2, 1);
  // Seen side-on (facing along a corridor) the canopy only covers the back, so the counter shows from above.
  const sideOn = rot !== 0;
  const roof = new THREE.Mesh(roundedBox(W + 0.5, 0.05, sideOn ? 1.0 : 2.4), new THREE.MeshLambertMaterial({ map: tarpTex }));
  roof.position.set(0, 2.55, sideOn ? -0.8 : -0.05);
  roof.rotation.x = 0.07;
  const valance = new THREE.Mesh(roundedBox(W + 0.5, 0.3, 0.04), new THREE.MeshLambertMaterial({ map: tarpTex }));
  valance.position.set(0, 2.45, sideOn ? -0.3 : 1.15);
  g.add(roof, valance);
  // Name board on top, facing the lane.
  const top = board(handSign(look.name, null, "#fffdf6", look.sign, 512, 120, "bold 70px 'Bagel Fat One', sans-serif"), W - 0.3, 0.62, 0x2a2730);
  top.position.set(0, 3.05, 1.0);
  top.rotation.y = -rot;
  g.add(top);

  // Bare bulb under the canopy front.
  const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.09,20,14), new THREE.MeshBasicMaterial({ color: 0xffe2a0, toneMapped: false }));
  bulb.position.set(0, 2.15, 0.65);
  const cord = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.01, 0.35, 4), flat(0x1c1a22));
  cord.position.set(0, 2.35, 0.65);
  const halo = new THREE.Sprite(glowMat(0xffc070, 0.85));
  halo.scale.setScalar(1.6);
  halo.position.copy(bulb.position);
  live.add(bulb, cord, halo);
  live.add(warmPool(0, 1.6, 2.2));

  const C = 0.97; // counter top
  const add = (m: THREE.Object3D, px: number, py: number, pz: number) => {
    m.position.set(px, py, pz);
    g.add(m);
    return m;
  };
  if (kind === "satay") {
    add(new THREE.Mesh(roundedBox(2.2, 0.22, 0.42), flat(0x2a2730)), 0, C + 0.11, 0.55);
    const coals = new THREE.Mesh(roundedBox(2.05, 0.04, 0.3), new THREE.MeshBasicMaterial({ color: 0xff6a20, toneMapped: false }));
    coals.position.set(0, C + 0.23, 0.55);
    live.add(coals);
    updates.push((t) => coals.material.color.setHSL(0.05, 1, 0.45 + Math.sin(t * 7) * 0.06 + Math.sin(t * 13) * 0.04));
    for (let i = 0; i < 14; i++) {
      const stick = new THREE.Mesh(roundedBox(0.03, 0.03, 0.6), flat(0xd9c39a));
      add(stick, -0.95 + i * 0.145, C + 0.27, 0.55);
      for (let k = 0; k < 3; k++) add(new THREE.Mesh(roundedBox(0.08, 0.06, 0.08), flat(0x8a4a22)), -0.95 + i * 0.145, C + 0.29, 0.42 + k * 0.1);
    }
    const sm = smoke(0, C + 0.4, 0.55, { n: 10, rise: 3.4, size: 1.1, drift: 1.4, opacity: 0.4 });
    live.add(sm.group);
    updates.push(sm.update);
    const glow = new THREE.Sprite(glowMat(0xff7a30, 0.6));
    glow.scale.set(3, 1.2, 1);
    glow.position.set(0, C + 0.4, 0.6);
    live.add(glow);
  } else if (kind === "salai") {
    const pot = add(new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.36, 0.45, 14), flat(0x9aa0aa)), -0.6, C + 0.23, 0.45);
    add(new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.38, 0.03, 14), flat(0xf2a71b)), pot.position.x, C + 0.44, 0.45);
    const st = smoke(-0.6, C + 0.5, 0.45, { n: 6, rise: 1.6, size: 0.6, drift: 0.3, color: 0xffffff, opacity: 0.35 });
    live.add(st.group);
    updates.push(st.update);
    // Smoked beef hanging off the canopy, swaying.
    const meats: THREE.Group[] = [];
    for (let i = 0; i < 4; i++) {
      const hang = new THREE.Group();
      hang.position.set(0.15 + i * 0.32, 2.4, 0.75);
      const str = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.35, 3), flat(0xd9c39a));
      str.position.y = -0.17;
      const meat = new THREE.Mesh(new THREE.DodecahedronGeometry(0.16, 0), flat(0x5a2a16));
      meat.scale.set(0.8, 1.4, 0.6);
      meat.position.y = -0.48;
      hang.add(str, meat);
      live.add(hang);
      meats.push(hang);
    }
    updates.push((t) => meats.forEach((m, i) => (m.rotation.z = Math.sin(t * 1.4 + i) * 0.12)));
    add(new THREE.Mesh(roundedBox(0.9, 0.06, 0.5), flat(0x7a3b22)), 0.7, C + 0.03, 0.45);
  } else if (kind === "malatang") {
    for (let row = 0; row < 3; row++) {
      add(new THREE.Mesh(roundedBox(1.6, 0.12, 0.3), flat(0xd9d5cc)), -0.55, C + 0.06 + row * 0.16, 0.7 - row * 0.28);
      for (let i = 0; i < 9; i++) {
        const col = [0x46b86a, 0xffb4c8, 0xf2e2b0, 0xe3350d, 0x9fd3b0, 0xfff2d0][(i + row * 2) % 6];
        add(new THREE.Mesh(roundedBox(0.1, 0.22, 0.1), flat(col)), -1.22 + i * 0.165, C + 0.24 + row * 0.16, 0.7 - row * 0.28);
      }
    }
    add(new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.34, 0.4, 14), flat(0x2a2730)), 0.95, C + 0.2, 0.45);
    add(new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.36, 0.03, 14), flat(0xc0261a)), 0.95, C + 0.39, 0.45);
    const st = smoke(0.95, C + 0.45, 0.45, { n: 6, rise: 1.6, size: 0.6, drift: 0.2, color: 0xffffff, opacity: 0.35 });
    live.add(st.group);
    updates.push(st.update);
    add(new THREE.Mesh(roundedBox(0.4, 0.12, 0.3), flat(0xe8e4dc)), 1.3, C + 0.06, 0.75);
  } else if (kind === "balang") {
    const cols = [0xe3354a, 0xff9fc0, 0x58c46a, 0xffa53a, 0x9a6ad6, 0xffe14a];
    cols.forEach((col, i) => {
      const jar = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.62, 12), new THREE.MeshLambertMaterial({ color: col, transparent: true, opacity: 0.82 }));
      add(jar, -1.25 + i * 0.5, C + 0.31, 0.5);
      add(new THREE.Mesh(new THREE.CylinderGeometry(0.21, 0.21, 0.06, 12), flat(0xd9d5cc)), -1.25 + i * 0.5, C + 0.65, 0.5);
      const shine = new THREE.Mesh(new THREE.PlaneGeometry(0.06, 0.45), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.5 }));
      add(shine, -1.33 + i * 0.5, C + 0.33, 0.71);
    });
    for (let i = 0; i < 5; i++) add(new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.06, 0.2, 8), flat(0xf4f1e6)), -0.6 + i * 0.3, C + 0.1, 0.85);
  } else if (kind === "mango") {
    // Sold out. Only a boxed cake with a ribbon is left: reserved for someone.
    add(new THREE.Mesh(roundedBox(0.6, 0.4, 0.5), flat(0xfffdf6)), 0.4, C + 0.2, 0.45);
    add(new THREE.Mesh(roundedBox(0.62, 0.05, 0.12), flat(0xff5fa2)), 0.4, C + 0.42, 0.45);
    add(new THREE.Mesh(roundedBox(0.12, 0.42, 0.52), flat(0xff5fa2)), 0.4, C + 0.21, 0.45);
    const tag = board(handSign("TEMPAHAN", "a/n: F.", "#fffdf6", INK, 160, 100), 0.36, 0.22, 0xff5fa2);
    tag.position.set(0.82, C + 0.32, 0.72);
    tag.rotation.set(-0.3, -0.3, 0.1);
    g.add(tag);
    for (const px of [-1.1, -0.5]) add(new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.24, 0.04, 14), flat(0xf4f1e6)), px, C + 0.02, 0.5);
    const habis = board(handSign("HABIS!", "esok datang lagi", "#fffdf6", "#c0392b", 256, 140), 1.1, 0.6, 0xfffdf6);
    habis.position.set(-0.7, 0.62, 0.93);
    habis.rotation.z = -0.08;
    g.add(habis);
  } else if (kind === "burger") {
    add(new THREE.Mesh(roundedBox(1.5, 0.06, 0.6), flat(0x2a2a30)), -0.3, C + 0.03, 0.5);
    for (let i = 0; i < 5; i++) add(new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.13, 0.05, 10), flat(0x6a3a1a)), -0.85 + i * 0.28, C + 0.09, 0.5 + (i % 2) * 0.1 - 0.05);
    for (let i = 0; i < 4; i++) add(new THREE.Mesh(new THREE.SphereGeometry(0.13,20,14, 0, Math.PI * 2, 0, Math.PI / 2), flat(0xe0a352)), 0.75 + (i % 2) * 0.3, C + 0.02, 0.35 + Math.floor(i / 2) * 0.3);
    for (const [px, col] of [[1.35, 0xc0261a], [1.5, 0xffcb05]] as const) add(new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.28, 8), flat(col)), px, C + 0.14, 0.75);
    const st = smoke(-0.3, C + 0.1, 0.5, { n: 7, rise: 1.8, size: 0.7, drift: 0.5, color: 0xffffff, opacity: 0.3 });
    live.add(st.group);
    updates.push(st.update);
  } else if (kind === "ramen") {
    add(new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.38, 0.5, 14), flat(0x9aa0aa)), -0.9, C + 0.25, 0.45);
    add(new THREE.Mesh(new THREE.CylinderGeometry(0.39, 0.39, 0.03, 14), flat(0xc0261a)), -0.9, C + 0.49, 0.45);
    for (let i = 0; i < 4; i++) {
      const bx = -0.15 + i * 0.42;
      add(new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.11, 0.14, 12), flat(0xfffdf6)), bx, C + 0.07, 0.55);
      add(new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 0.02, 12), flat(0xd9381e)), bx, C + 0.13, 0.55);
      add(new THREE.Mesh(roundedBox(0.1, 0.03, 0.06), flat(0xf2d27a)), bx, C + 0.15, 0.55);
    }
    add(new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.22, 8), flat(0xe3350d)), 1.4, C + 0.11, 0.75);
    const st = smoke(-0.9, C + 0.55, 0.45, { n: 7, rise: 1.8, size: 0.65, drift: 0.3, color: 0xffffff, opacity: 0.38 });
    live.add(st.group);
    updates.push(st.update);
  } else if (kind === "takoyaki") {
    add(new THREE.Mesh(roundedBox(1.4, 0.1, 0.6), flat(0x2a2a30)), -0.35, C + 0.05, 0.5);
    for (let r = 0; r < 3; r++)
      for (let c = 0; c < 6; c++) add(new THREE.Mesh(new THREE.SphereGeometry(0.075,20,14), flat(0xd98a3a)), -0.95 + c * 0.24, C + 0.13, 0.32 + r * 0.18);
    for (let i = 0; i < 3; i++) {
      add(new THREE.Mesh(roundedBox(0.34, 0.05, 0.22), flat(0xe8d8b0)), 0.75 + i * 0.36, C + 0.03, 0.6);
      for (let k = 0; k < 3; k++) add(new THREE.Mesh(new THREE.SphereGeometry(0.06,20,14), flat(0xb8642a)), 0.65 + i * 0.36 + k * 0.1, C + 0.1, 0.6);
    }
    const st = smoke(-0.35, C + 0.15, 0.5, { n: 6, rise: 1.6, size: 0.6, drift: 0.4, color: 0xffffff, opacity: 0.3 });
    live.add(st.group);
    updates.push(st.update);
  }
  for (const o of [g, live]) {
    o.position.set(x, 0, z);
    o.rotation.y = rot;
  }
  return {
    statics: shadowed(g),
    anim: { group: live, update: (t) => updates.forEach((u) => u(t)) },
    box: turnedBox(x, z, [-W / 2 - 0.15, -1.15, W / 2 + 0.15, 0.92], rot),
  };
}

/** A vendor's van parked tight behind the stalls (they unload straight into the back of the kiosk).
 * Long along local x; `rotY` turns it. Gas tanks and a cooler sit by the tailgate. */
export function vendorVan(x: number, z: number, rotY: number, body: number, stripe: number) {
  const g = new THREE.Group();
  const L = 4.0;
  const box = new THREE.Mesh(roundedBox(L - 0.9, 1.75, 1.85), flat(body));
  box.position.set(-0.45, 1.25, 0);
  const cab = new THREE.Mesh(roundedBox(0.95, 1.25, 1.8), flat(body));
  cab.position.set(L / 2 - 0.5, 1.0, 0);
  const glass = new THREE.Mesh(roundedBox(0.06, 0.55, 1.6), flat(0x2a3350));
  glass.position.set(L / 2 - 0.02, 1.3, 0);
  glass.rotation.z = -0.35;
  const band = new THREE.Mesh(roundedBox(L - 0.9, 0.22, 1.87), flat(stripe));
  band.position.set(-0.45, 1.05, 0);
  const bumper = new THREE.Mesh(roundedBox(0.12, 0.2, 1.8), flat(0x2a2a30));
  bumper.position.set(L / 2 + 0.02, 0.45, 0);
  g.add(box, cab, glass, band, bumper);
  for (const [wx, wz] of [[-1.3, -0.85], [-1.3, 0.85], [1.25, -0.85], [1.25, 0.85]]) {
    const w = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.34, 0.24, 12), flat(0x1c1a22));
    w.rotation.x = Math.PI / 2;
    w.position.set(wx, 0.34, wz);
    g.add(w);
  }
  for (const [tx, tz, col] of [[-L / 2 - 0.35, -0.5, 0xd63a3a], [-L / 2 - 0.35, -0.05, 0xd63a3a]] as const) {
    const tank = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.17, 0.62, 10), flat(col));
    tank.position.set(tx, 0.31, tz);
    g.add(tank);
  }
  const cooler = new THREE.Mesh(roundedBox(0.5, 0.42, 0.6), flat(0x3b6fe0));
  cooler.position.set(-L / 2 - 0.35, 0.21, 0.55);
  g.add(cooler);
  g.position.set(x, 0, z);
  g.rotation.y = rotY;
  return shadowed(g);
}

// ---------------------------------------------------------------- Bundle

type Garment = "tee" | "flannel" | "denim" | "hoodie" | "jeans" | "floral" | "varsity" | "band";
const GARMENTS: Garment[] = ["tee", "flannel", "denim", "hoodie", "jeans", "floral", "varsity", "band"];

function drawGarment(g: CanvasRenderingContext2D, kind: Garment, col: string) {
  g.lineJoin = "round";
  g.lineWidth = 5;
  g.strokeStyle = INK;
  if (kind === "jeans") {
    g.beginPath();
    g.moveTo(34, 12);
    g.lineTo(94, 12);
    g.lineTo(104, 152);
    g.lineTo(72, 152);
    g.lineTo(64, 60);
    g.lineTo(56, 152);
    g.lineTo(24, 152);
    g.closePath();
    g.fillStyle = col;
    g.fill();
    g.stroke();
    g.strokeStyle = "rgba(255,240,200,.7)";
    g.lineWidth = 2;
    g.beginPath();
    g.moveTo(34, 26);
    g.lineTo(94, 26);
    g.stroke();
    return;
  }
  const sleeve = kind === "tee" || kind === "band" || kind === "floral" ? 52 : 120;
  g.beginPath();
  g.moveTo(44, 14);
  g.quadraticCurveTo(64, 26, 84, 14);
  g.lineTo(118, 30);
  g.lineTo(124, sleeve);
  g.lineTo(102, sleeve + 4);
  g.lineTo(98, 52);
  g.lineTo(100, 150);
  g.lineTo(28, 150);
  g.lineTo(30, 52);
  g.lineTo(26, sleeve + 4);
  g.lineTo(4, sleeve);
  g.lineTo(10, 30);
  g.closePath();
  g.fillStyle = col;
  g.fill();
  g.save();
  g.clip();
  if (kind === "flannel") {
    g.fillStyle = "rgba(20,10,20,.35)";
    for (let i = 0; i < 128; i += 22) {
      g.fillRect(i, 0, 8, 160);
      g.fillRect(0, i, 128, 8);
    }
  } else if (kind === "floral") {
    for (let i = 0; i < 14; i++) {
      g.fillStyle = ["#fffdf6", "#ffcb05", "#ff5fa2"][i % 3];
      g.beginPath();
      g.arc((i * 37) % 120 + 6, (i * 53) % 140 + 10, 7, 0, Math.PI * 2);
      g.fill();
    }
  } else if (kind === "varsity") {
    g.fillStyle = "#fffdf6";
    g.fillRect(0, 0, 30, 160);
    g.fillRect(98, 0, 30, 160);
    g.fillStyle = col;
    g.font = "bold 40px 'Bagel Fat One', sans-serif";
    g.textAlign = "center";
  } else if (kind === "band") {
    g.fillStyle = "#fffdf6";
    g.beginPath();
    g.arc(64, 84, 18, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = INK;
    g.fillRect(56, 78, 4, 6);
    g.fillRect(68, 78, 4, 6);
    g.beginPath();
    g.arc(64, 88, 8, 0.2, Math.PI - 0.2);
    g.lineWidth = 3;
    g.stroke();
  } else if (kind === "denim") {
    g.strokeStyle = "rgba(255,240,200,.6)";
    g.lineWidth = 2;
    g.strokeRect(36, 60, 22, 20);
    g.strokeRect(70, 60, 22, 20);
    g.beginPath();
    g.moveTo(64, 20);
    g.lineTo(64, 150);
    g.stroke();
  } else if (kind === "hoodie") {
    g.fillStyle = "rgba(0,0,0,.18)";
    g.fillRect(40, 96, 48, 26);
  } else {
    g.fillStyle = "rgba(255,255,255,.7)";
    g.font = "bold 22px 'Gaegu', sans-serif";
    g.textAlign = "center";
    g.fillText("vintage", 64, 84);
  }
  g.restore();
  g.lineWidth = 5;
  g.strokeStyle = INK;
  g.stroke();
}

const GARMENT_COLS = ["#e3350d", "#3b6fe0", "#2f8a4a", "#ffcb05", "#9b6ad6", "#f2f0ea", "#2a2730", "#ff8fb1", "#7a5536", "#4a6fa0"];
const garmentTex = (() => {
  const cache = new Map<string, THREE.Texture>();
  return (kind: Garment, col: string) => {
    const key = kind + col;
    if (!cache.has(key)) {
      const c = kind === "jeans" ? "#3d5a8f" : kind === "denim" ? "#5a7ab0" : col;
      cache.set(key, shared(canvasTexture(128, 160, (g) => drawGarment(g, kind, c))));
    }
    return cache.get(key)!;
  };
})();

/** Clothing rail with garments hung face-out; they sway, and swish when Qish brushes past. */
export function clothesRack(x: number, z: number, w: number, seed: number, player: () => THREE.Vector3): Anim {
  const group = new THREE.Group();
  const chrome = flat(0xc9ced6);
  for (const px of [-w / 2, w / 2]) {
    const up = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 1.9, 5), chrome);
    up.position.set(px, 0.95, 0);
    const foot = new THREE.Mesh(roundedBox(0.06, 0.05, 0.7), chrome);
    foot.position.set(px, 0.03, 0);
    group.add(up, foot);
  }
  const rail = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, w, 5), chrome);
  rail.rotation.z = Math.PI / 2;
  rail.position.y = 1.88;
  group.add(rail);
  const r = rng(seed);
  const n = Math.max(3, Math.floor(w / 0.36));
  const hangers = Array.from({ length: n }, (_, i) => {
    const p = new THREE.Group();
    p.position.set(-w / 2 + 0.25 + (i * (w - 0.5)) / (n - 1), 1.88, (i % 2) * 0.05 - 0.02);
    const kind = GARMENTS[Math.floor(r() * GARMENTS.length)];
    const tex = garmentTex(kind, GARMENT_COLS[Math.floor(r() * GARMENT_COLS.length)]);
    const len = kind === "jeans" ? 1.05 : 0.95;
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(0.78, len), new THREE.MeshLambertMaterial({ map: tex, alphaTest: 0.5, side: THREE.DoubleSide }));
    mesh.position.y = -0.04 - len / 2;
    p.add(mesh);
    p.rotation.y = (r() - 0.5) * 0.25;
    group.add(p);
    return { p, base: (r() - 0.5) * 0.06, swish: 0 };
  });
  shadowed(group);
  hangers.forEach((h) => h.p.traverse((o) => (o.castShadow = false)));
  group.position.set(x, 0, z);
  const tick = ticker();
  const update = (t: number) => {
    const dt = tick(t);
    const pl = player();
    const near = Math.abs(pl.z - z) < 1.1;
    hangers.forEach((h, i) => {
      if (near && Math.abs(pl.x - (x + h.p.position.x)) < 0.45) h.swish = Math.min(1, h.swish + dt * 6);
      h.swish *= 1 - Math.min(1, dt * 1.8);
      h.p.rotation.z = h.base + Math.sin(t * 1.3 + i * 0.7) * 0.025 + Math.sin(t * 9 + i) * 0.22 * h.swish;
    });
  };
  return { group, update };
}

/** A bundle stall along the corridor: a mat, two rails of face-out clothes (so they read from the camera),
 * a folding table of stacks along the corridor edge, a cardboard sign on a pole and a bare bulb.
 * `face` is +1 when it opens east, -1 when it opens west; `len` runs along the corridor (z). */
export function bundleStall(x: number, z: number, face: 1 | -1, len: number, mat: number, text: string, sub: string, seed: number, player: () => THREE.Vector3) {
  const g = new THREE.Group();
  const live = new THREE.Group();
  const updates: ((t: number) => void)[] = [];
  const D = 4.2;
  const floor = new THREE.Mesh(roundedBox(D, 0.03, len), flat(mat));
  floor.position.set(x, 0.02, z);
  g.add(floor);
  for (const dz of [-len / 4 - 0.15, len / 4 - 0.05]) {
    const r = clothesRack(x - face * 0.35, z + dz, D - 1.6, seed + Math.round(dz * 10), player);
    live.add(r.group);
    updates.push(r.update);
  }
  // Folding table along the corridor edge, piled with folded tees.
  const ex = x + face * (D / 2 - 0.45);
  const table = new THREE.Mesh(roundedBox(0.75, 0.07, len - 0.9), flat(0xd9d5cc));
  table.position.set(ex, 0.78, z);
  g.add(table);
  for (const dz of [-(len - 1.3) / 2, (len - 1.3) / 2]) {
    const leg = new THREE.Mesh(roundedBox(0.65, 0.78, 0.06), flat(0x9aa0aa));
    leg.position.set(ex, 0.39, z + dz);
    g.add(leg);
  }
  const rr = rng(seed);
  for (let i = 0; i < Math.floor((len - 1.1) / 0.48); i++) {
    const f = new THREE.Mesh(roundedBox(0.5, 0.12 + rr() * 0.14, 0.42), flat(new THREE.Color(GARMENT_COLS[Math.floor(rr() * GARMENT_COLS.length)]).getHex()));
    f.position.set(ex, 0.88, z - (len - 1.4) / 2 + i * 0.48);
    g.add(f);
  }
  // Sign on a pole at the corridor corner nearest the camera.
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 2.6, 5), flat(0x7a5536));
  pole.position.set(ex, 1.3, z + len / 2 - 0.25);
  const sign = board(handSign(text, sub, "#c9a46a", INK, 320, 160, "bold 64px 'Gaegu', sans-serif"), 1.5, 0.75, 0x8a6a3a);
  sign.position.set(ex, 2.45, z + len / 2 - 0.2);
  sign.rotation.z = face * 0.05;
  g.add(pole, sign);
  // A bare bulb over the rails.
  const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.09,20,14), new THREE.MeshBasicMaterial({ color: 0xffe2a0, toneMapped: false }));
  bulb.position.set(x, 2.7, z);
  const halo = new THREE.Sprite(glowMat(0xffc070, 0.8));
  halo.scale.setScalar(1.6);
  halo.position.copy(bulb.position);
  live.add(bulb, halo, warmPool(x, z, 2.4));
  return {
    statics: shadowed(g),
    anim: { group: live, update: (t: number) => updates.forEach((u) => u(t)) } as Anim,
    box: [x - D / 2, z - len / 2, x + D / 2, z + len / 2] as Box,
  };
}

/** Shop mannequin wearing a bundle jacket. */
export function mannequin(x: number, z: number, jacket: string, rotY = 0) {
  const g = new THREE.Group();
  const skin = flat(0xe8e2d6);
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.9, 5), flat(0x2a2a30));
  pole.position.y = 0.45;
  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.28, 0.05, 10), flat(0x2a2a30));
  const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.22, 0.85, 10), flat(new THREE.Color(jacket).getHex()));
  torso.position.y = 1.32;
  const hip = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.24, 0.22, 10), flat(0x3d5a8f));
  hip.position.y = 0.88;
  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.07, 0.15, 6), skin);
  neck.position.y = 1.82;
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.17,20,14), skin);
  head.scale.y = 1.2;
  head.position.y = 2.05;
  g.add(pole, base, torso, hip, neck, head);
  for (const s of [-1, 1]) {
    const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.06, 0.75, 6), flat(new THREE.Color(jacket).getHex()));
    arm.position.set(s * 0.36, 1.3, 0);
    arm.rotation.z = s * 0.15;
    g.add(arm);
  }
  g.position.set(x, 0, z);
  g.rotation.y = rotY;
  return shadowed(g);
}

/** Standing mirror for trying things on. */
export function standMirror(x: number, z: number) {
  const g = new THREE.Group();
  const frame = new THREE.Mesh(roundedBox(0.7, 1.7, 0.08), flat(0x7a5536));
  frame.position.y = 1.05;
  frame.rotation.x = -0.12;
  const glass = new THREE.Mesh(new THREE.PlaneGeometry(0.56, 1.52), new THREE.MeshBasicMaterial({ color: 0x9fb8d8 }));
  glass.position.set(0, 1.05, 0.05);
  glass.rotation.x = -0.12;
  const shine = new THREE.Mesh(new THREE.PlaneGeometry(0.08, 1.2), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.55 }));
  shine.position.set(-0.15, 1.1, 0.06);
  shine.rotation.set(-0.12, 0, 0.3);
  const feet = new THREE.Mesh(roundedBox(0.6, 0.05, 0.5), flat(0x7a5536));
  feet.position.y = 0.03;
  g.add(frame, glass, shine, feet);
  g.position.set(x, 0, z);
  return shadowed(g);
}

// ---------------------------------------------------------------- Galeri Memori

/** Bolat ex's pop-up gallery: all ten photo strips pegged on a string of fairy lights in front of a
 * cork wall, a painted sign, an easel with Qish's own doodle of the two of them, and a little table
 * with an instant camera and film. */
export function galeriMemori(x0: number, x1: number, z: number, strips: string[]): Anim & { stripX: number[]; statics: THREE.Group } {
  const group = new THREE.Group();
  const statics = new THREE.Group();
  const wood = flat(0x6b4421);
  const H = 3.6;
  for (const px of [x0, x1]) {
    const post = new THREE.Mesh(roundedBox(0.18, H + 0.9, 0.18), wood);
    post.position.set(px, (H + 0.9) / 2, z - 0.3);
    statics.add(post);
  }
  const beam = new THREE.Mesh(roundedBox(x1 - x0 + 0.4, 0.18, 0.18), wood);
  beam.position.set((x0 + x1) / 2, H + 0.4, z - 0.3);
  statics.add(beam);
  const cork = canvasTexture(256, 128, (g) => {
    g.fillStyle = "#c79a63";
    g.fillRect(0, 0, 256, 128);
    for (let i = 0; i < 900; i++) {
      g.fillStyle = Math.random() < 0.5 ? "rgba(120,80,40,.35)" : "rgba(255,230,190,.25)";
      g.fillRect(Math.random() * 256, Math.random() * 128, 2, 2);
    }
  });
  cork.wrapS = cork.wrapT = THREE.RepeatWrapping;
  cork.repeat.set((x1 - x0) / 3, 1);
  const wall = new THREE.Mesh(roundedBox(x1 - x0, H - 0.2, 0.12), [wood, wood, wood, wood, new THREE.MeshLambertMaterial({ map: cork }), wood]);
  wall.position.set((x0 + x1) / 2, (H - 0.2) / 2 + 0.2, z - 0.42);
  statics.add(wall);
  // Painted sign above.
  const signTex = canvasTexture(1024, 200, (g) => {
    g.fillStyle = "#fff4f8";
    g.beginPath();
    g.roundRect(6, 6, 1012, 188, 40);
    g.fill();
    g.lineWidth = 10;
    g.strokeStyle = "#ff5fa2";
    g.stroke();
    g.textAlign = "center";
    g.textBaseline = "middle";
    g.font = "bold 96px 'Bagel Fat One', sans-serif";
    g.fillStyle = "#ff5fa2";
    g.fillText("GALERI MEMORI", 512, 90);
    g.font = "bold 40px 'Gaegu', sans-serif";
    g.fillStyle = INK;
    g.fillText("pop-up · oleh Bolat ex · jangan sentuh ♥", 512, 160);
    for (const hx of [70, 954]) {
      g.fillStyle = "#ff5fa2";
      g.beginPath();
      g.moveTo(hx, 120);
      g.bezierCurveTo(hx - 34, 90, hx - 20, 54, hx, 76);
      g.bezierCurveTo(hx + 20, 54, hx + 34, 90, hx, 120);
      g.fill();
    }
  });
  const sw = Math.min(6.4, x1 - x0 - 0.6);
  const sign = new THREE.Mesh(roundedBox(sw, sw * (200 / 1024), 0.1), [wood, wood, wood, wood, new THREE.MeshLambertMaterial({ map: signTex, emissive: 0x2a1a22 }), wood]);
  sign.position.set((x0 + x1) / 2, H + 1.05, z - 0.25);
  statics.add(sign);

  // Easel with Qish's doodle.
  const easel = new THREE.Group();
  for (const lx of [-0.4, 0.4]) {
    const leg = new THREE.Mesh(roundedBox(0.07, 2.2, 0.07), wood);
    leg.position.set(lx, 1.1, 0);
    leg.rotation.z = lx > 0 ? -0.1 : 0.1;
    easel.add(leg);
  }
  const back = new THREE.Mesh(roundedBox(0.07, 2.1, 0.07), wood);
  back.position.set(0, 1.0, -0.45);
  back.rotation.x = 0.35;
  const ledge = new THREE.Mesh(roundedBox(1.1, 0.06, 0.16), wood);
  ledge.position.set(0, 0.95, 0.05);
  const canvasBack = new THREE.Mesh(roundedBox(1.15, 0.95, 0.05), flat(0xfffdf6));
  canvasBack.position.set(0, 1.45, 0.02);
  canvasBack.rotation.x = -0.1;
  easel.add(back, ledge, canvasBack);
  const doodleTex = new THREE.TextureLoader().load("/assets/story/doodle_kita.webp");
  doodleTex.colorSpace = THREE.SRGBColorSpace;
  const doodle = new THREE.Mesh(new THREE.PlaneGeometry(1.05, 0.85), new THREE.MeshBasicMaterial({ map: doodleTex, color: 0xf0e6d8 }));
  doodle.position.set(0, 1.45, 0.06);
  doodle.rotation.x = -0.1;
  easel.add(doodle);
  easel.position.set(x0 - 1.05, 0, z + 0.35);
  easel.rotation.y = 0.25;
  statics.add(easel);

  // Little table: instant camera, film rolls, loose photos.
  const table = new THREE.Mesh(roundedBox(1.0, 0.06, 0.7), flat(0xf4f1e6));
  table.position.set(x1 + 0.85, 0.8, z + 0.1);
  statics.add(table);
  for (const [lx, lz] of [[-0.42, -0.28], [0.42, -0.28], [-0.42, 0.28], [0.42, 0.28]]) {
    const leg = new THREE.Mesh(roundedBox(0.05, 0.8, 0.05), flat(0x2a2730));
    leg.position.set(x1 + 0.85 + lx, 0.4, z + 0.1 + lz);
    statics.add(leg);
  }
  const cam = new THREE.Mesh(roundedBox(0.36, 0.26, 0.22), flat(0xff8fb1));
  cam.position.set(x1 + 0.75, 0.96, z + 0.05);
  const lens = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.06, 12), flat(0x2a2730));
  lens.rotation.x = Math.PI / 2;
  lens.position.set(x1 + 0.75, 0.95, z + 0.18);
  statics.add(cam, lens);
  for (let i = 0; i < 3; i++) {
    const roll = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.13, 8), flat(0xffcb05));
    roll.position.set(x1 + 1.05 + i * 0.1, 0.9, z + 0.25 - i * 0.05);
    statics.add(roll);
  }
  for (let i = 0; i < 4; i++) {
    const pol = new THREE.Mesh(roundedBox(0.16, 0.005, 0.19), flat(0xfffdf6));
    pol.position.set(x1 + 1.1 + (i % 2) * 0.12, 0.835, z - 0.05 + i * 0.05);
    pol.rotation.y = i * 0.5;
    statics.add(pol);
  }
  shadowed(statics);

  // The strips, pegged along a sagging string.
  const SW = 0.6;
  const SH = 1.8;
  const n = strips.length;
  const span = x1 - x0 - 0.9;
  const stripX: number[] = [];
  const hung = strips.map((url, i) => {
    const k = (i + 0.5) / n;
    const sx = x0 + 0.45 + span * k;
    stripX.push(sx);
    const top = H - 0.05 - Math.sin(k * Math.PI) * 0.28;
    const p = new THREE.Group();
    p.position.set(sx, top, z - 0.22);
    const tex = new THREE.TextureLoader().load(url);
    tex.colorSpace = THREE.SRGBColorSpace;
    const frame = new THREE.Mesh(new THREE.PlaneGeometry(SW + 0.08, SH + 0.08), new THREE.MeshBasicMaterial({ color: 0x2a2730 }));
    frame.position.set(0, -SH / 2 - 0.04, -0.005);
    const photo = new THREE.Mesh(new THREE.PlaneGeometry(SW, SH), new THREE.MeshBasicMaterial({ map: tex, color: 0xf2e8da }));
    photo.position.y = -SH / 2 - 0.04;
    const peg = new THREE.Mesh(roundedBox(0.06, 0.18, 0.05), flat([0xff8fb1, 0xffcb05, 0x9fd3b0, 0xb9c4ff][i % 4]));
    peg.position.y = -0.02;
    photo.castShadow = true;
    p.add(frame, photo, peg);
    p.rotation.z = (i % 2 ? 1 : -1) * 0.03;
    group.add(p);
    return { p, base: p.rotation.z };
  });
  const lights = festoons([{ a: [x0, H + 0.02, z - 0.18], b: [x1, H + 0.02, z - 0.18], sag: 0.3, density: 2.6 }]);
  group.add(lights.group);
  group.add(warmPool((x0 + x1) / 2, z + 0.9, (x1 - x0) / 2, 0xffc0d0));
  const update = (t: number) => {
    lights.update(t);
    hung.forEach((h, i) => (h.p.rotation.z = h.base + Math.sin(t * 1.1 + i * 0.9) * 0.025));
  };
  return { group, update, stripX, statics };
}

// ---------------------------------------------------------------- Crowd

export type StandMode = "sway" | "eat" | "browse" | "queue" | "vendor" | "idle" | "pose" | "snap";

export interface Walker {
  path: [number, number][];
  look: PersonLook;
  speed?: number;
  /** Closed loop (otherwise it walks there and back). */
  loop?: boolean;
  /** 0..1 start point along the path. */
  phase?: number;
}

export interface Stander {
  x: number;
  z: number;
  look: PersonLook;
  mode: StandMode;
  back?: boolean;
  /** Sitting on a stool: drop the paper so the table hides the legs. */
  seated?: boolean;
  /** Mirror the doodle (looking the other way). */
  flip?: boolean;
  /** Blocks Qish (default true, except seated diners). */
  solid?: boolean;
  lines?: string[];
}

const BARK: Record<StandMode | "walk" | "bump", string[]> = {
  sway: ["Best lagu ni!", "Encore!!", "♪ ~ ♪", "Sedap suara dia", "Request lagu sedih!"],
  eat: ["Sedapnya!", "Pedas gila!", "Nak tambah lagi", "Nyum~", "Kenyang..."],
  browse: ["RM5 je?!", "Cantik ni!", "Ada saiz M?", "Vintage ni weh", "Muat ke ni..."],
  queue: ["Lama lagi ke?", "Lapar...", "Bau dia sampai sini"],
  vendor: ["Jemput dik!", "Murah murah!", "Panas-panas!"],
  idle: ["Sesak gila malam ni", "Jom makan dulu", "Parking penuh tadi"],
  pose: ["Cheese!", "Angle kiri saya lagi cantik", "Peace ✌", "Satu lagi!", "Mata saya tertutup tak?", "Buat muka comel!"],
  snap: ["1, 2, 3... senyum!", "Satu lagi!", "Candid, candid!", "Okay cantik!", "Dagu turun sikit", "Flash on ke off?"],
  walk: ["Sesak gila malam ni", "Jom makan dulu", "Parking penuh tadi", "Mana dia ni...", "Cari air dulu"],
  bump: ["Tumpang lalu~", "Eh sorry!", "Oops, sorry dik", "Jalan elok-elok~", "Sesak kan?", "Silakan, silakan"],
};

export { bubbleTex } from "../ui/speechBubble";

const NIGHT_TINT = 0xe4cdb6;

async function person(look: PersonLook, back: boolean, tint = NIGHT_TINT) {
  const url = back ? personBackDoodle(look) : passengerDoodle(look);
  const s = await paperStandee(url, look.kid ? 1.35 : 1.85);
  const mesh = s.pivot.children[0] as THREE.Mesh;
  (mesh.material as THREE.MeshBasicMaterial).color.setHex(tint);
  mesh.castShadow = false;
  return s;
}

function blobShadow(r = 0.36) {
  const m = new THREE.Mesh(new THREE.CircleGeometry(r, 14), BLOB());
  m.rotation.x = -Math.PI / 2;
  m.position.y = 0.025;
  return m;
}

/** The Lorbel crowd: walkers wandering their routes (they stop and say "tumpang lalu" when Qish is in
 * the way, and turn back if she just stands there), and people standing about: watching the busker
 * on the beat, eating, browsing, queueing, selling. Now and then someone near her says something. */
export async function lorbelCrowd(walkers: Walker[], standers: Stander[], player: () => THREE.Vector3, beat: number, o: { tint?: number; walk?: string[] } = {}): Promise<Anim & { solid: () => THREE.Vector3[]; statics: THREE.Group }> {
  const group = new THREE.Group();
  const statics = new THREE.Group();

  const walk = await Promise.all(
    walkers.map(async (w, i) => {
      const g = new THREE.Group();
      const [front, back] = await Promise.all([person(w.look, false, o.tint), person(w.look, true, o.tint)]);
      back.group.visible = false;
      g.add(front.group, back.group, blobShadow());
      group.add(g);
      // Cumulative lengths along the route.
      const pts = w.loop ? [...w.path, w.path[0]] : w.path;
      const cum = [0];
      for (let k = 1; k < pts.length; k++) cum.push(cum[k - 1] + Math.hypot(pts[k][0] - pts[k - 1][0], pts[k][1] - pts[k - 1][1]));
      const total = cum[cum.length - 1];
      return { w, g, front, back, pts, cum, total, s: (w.phase ?? (i * 0.37) % 1) * (w.loop ? total : total * 2), dir: 1, wait: 0, speed: (w.speed ?? 1) * (0.85 + ((i * 0.31) % 0.3)), bob: i * 1.7, dx: 1, dz: 0 };
    }),
  );

  const stand = await Promise.all(
    standers.map(async (st, i) => {
      const s = await person(st.look, !!st.back, o.tint);
      if (st.flip) s.pivot.scale.x = -1;
      const g = new THREE.Group();
      g.add(s.group);
      if (!st.seated) {
        const sh = blobShadow();
        sh.position.set(st.x, 0.025, st.z);
        statics.add(sh);
      }
      g.position.set(st.x, st.seated ? -0.42 : 0, st.z);
      group.add(g);
      return { st, s, g, phase: i * 0.83 };
    }),
  );

  const pos = (wk: (typeof walk)[number], out: THREE.Vector3) => {
    let d = wk.w.loop ? ((wk.s % wk.total) + wk.total) % wk.total : ((wk.s % (wk.total * 2)) + wk.total * 2) % (wk.total * 2);
    let forward = true;
    if (!wk.w.loop && d > wk.total) {
      d = wk.total * 2 - d;
      forward = false;
    }
    let k = 1;
    while (k < wk.cum.length - 1 && wk.cum[k] < d) k++;
    const a = wk.pts[k - 1];
    const b = wk.pts[k];
    const seg = wk.cum[k] - wk.cum[k - 1] || 1;
    const f = (d - wk.cum[k - 1]) / seg;
    out.set(a[0] + (b[0] - a[0]) * f, 0, a[1] + (b[1] - a[1]) * f);
    const sgn = (forward ? 1 : -1) * wk.dir;
    wk.dx = ((b[0] - a[0]) / seg) * sgn;
    wk.dz = ((b[1] - a[1]) / seg) * sgn;
    return out;
  };

  // Speech bubbles: a small pool, one per person at a time.
  const bubbles = Array.from({ length: 4 }, () => {
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: bubbleTex("..."), depthTest: false, transparent: true }));
    s.scale.set(2.7, 0.81, 1);
    s.renderOrder = 6;
    s.visible = false;
    group.add(s);
    return { s, owner: null as THREE.Object3D | null, until: 0, height: 2.4 };
  });
  let clock = 0;
  const speak = (owner: THREE.Object3D, text: string, dur = 1.8, height = 2.45) => {
    if (bubbles.some((b) => b.owner === owner && b.until > clock)) return;
    const b = bubbles.find((x) => x.until <= clock) ?? bubbles.reduce((p, q) => (p.until < q.until ? p : q));
    setBubbleText(b.s, text);
    b.owner = owner;
    b.until = clock + speechDuration(text, dur);
    b.height = height;
    b.s.visible = true;
  };
  const pick = <T,>(a: T[]) => a[Math.floor(Math.random() * a.length)];

  const tick = ticker();
  const v = new THREE.Vector3();
  let nextBark = 2;
  const update = (t: number) => {
    const dt = tick(t);
    clock = t;
    const pl = player();
    for (const wk of walk) {
      pos(wk, v);
      const tx = pl.x - v.x;
      const tz = pl.z - v.z;
      const dist = Math.hypot(tx, tz);
      const ahead = dist < 1.45 && (tx * wk.dx + tz * wk.dz) / (dist || 1) > 0.25;
      if (ahead) {
        wk.wait += dt;
        if (wk.wait > 0.45 && wk.wait - dt <= 0.45) speak(wk.g, pick(BARK.bump));
        // She isn't moving: go round the other way instead.
        if (wk.wait > 2.6) {
          wk.dir *= -1;
          wk.wait = 0;
        }
      } else {
        wk.wait = Math.max(0, wk.wait - dt * 2);
        wk.s += dt * wk.speed * wk.dir;
      }
      pos(wk, v);
      wk.g.position.copy(v);
      const away = wk.dz < -0.6;
      wk.front.group.visible = !away;
      wk.back.group.visible = away;
      const mirror = wk.dx < -0.1 ? -1 : 1;
      wk.front.pivot.scale.x = wk.back.pivot.scale.x = mirror;
      const step = ahead ? 0 : t * 7 + wk.bob;
      for (const s of [wk.front, wk.back]) {
        s.group.position.y = Math.abs(Math.sin(step)) * 0.06;
        s.pivot.rotation.z = Math.sin(step) * 0.04;
      }
    }
    const bp = (t / beat) * Math.PI;
    for (const sd of stand) {
      const { st, s, phase } = sd;
      switch (st.mode) {
        case "sway":
          s.pivot.rotation.z = Math.sin(bp + phase) * 0.07;
          s.group.position.y = Math.abs(Math.sin(bp * 2)) * 0.05;
          break;
        case "eat": {
          const k = (t * 0.8 + phase) % 1;
          s.group.position.y = k < 0.15 ? Math.sin((k / 0.15) * Math.PI) * -0.08 : 0;
          s.pivot.rotation.z = Math.sin(t * 0.7 + phase) * 0.02;
          break;
        }
        case "browse":
          s.pivot.rotation.z = Math.sin(t * 0.9 + phase) * 0.06;
          s.group.position.y = Math.max(0, Math.sin(t * 2.2 + phase)) * 0.05;
          break;
        case "vendor":
          s.pivot.rotation.z = Math.sin(t * 3 + phase) * 0.05;
          s.group.position.y = Math.abs(Math.sin(t * 3 + phase)) * 0.04;
          break;
        case "pose": {
          // A new pose for every shot: hop, lean one way, hold it.
          const shot = Math.floor(t / 1.6 + phase);
          const k = (t / 1.6 + phase) % 1;
          s.pivot.rotation.z = (shot % 3 === 0 ? -0.12 : shot % 3 === 1 ? 0.1 : 0) + Math.sin(t * 0.8 + phase) * 0.01;
          s.group.position.y = k < 0.12 ? Math.sin((k / 0.12) * Math.PI) * 0.12 : 0;
          break;
        }
        case "snap":
          // Crouching for the angle, bobbing up to check the screen.
          s.group.position.y = -Math.max(0, Math.sin(t * 0.7 + phase)) * 0.12;
          s.pivot.rotation.z = Math.sin(t * 0.5 + phase) * 0.03;
          break;
        default:
          s.pivot.rotation.z = Math.sin(t * 0.6 + phase) * 0.025;
      }
    }
    // Someone nearby (on screen) says something now and then.
    if (t > nextBark) {
      nextBark = t + 1.6 + Math.random() * 2.2;
      const near = [
        ...stand.filter((sd) => Math.hypot(sd.st.x - pl.x, sd.st.z - pl.z) < 10).map((sd) => ({ g: sd.g, lines: sd.st.lines ?? BARK[sd.st.mode], h: sd.st.seated ? 2.05 : 2.45 })),
        ...walk.filter((wk) => wk.g.position.distanceTo(pl) < 10).map((wk) => ({ g: wk.g, lines: o.walk ?? BARK.walk, h: 2.45 })),
      ];
      if (near.length) {
        const who = pick(near);
        speak(who.g, pick(who.lines), 2.2, who.h);
      }
    }
    for (const b of bubbles) {
      if (!b.owner || b.until <= t) {
        b.s.visible = false;
        continue;
      }
      const left = b.until - t;
      b.s.position.set(b.owner.position.x, b.owner.position.y + b.height + Math.min(0.15, (2.2 - left) * 0.6), b.owner.position.z);
      b.s.material.opacity = Math.min(1, left * 4);
    }
  };

  const solidStand = stand.filter((sd) => sd.st.solid ?? !sd.st.seated).map((sd) => sd.g.position);
  return { group, update, statics, solid: () => [...walk.map((wk) => wk.g.position), ...solidStand] };
}
