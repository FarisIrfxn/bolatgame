import * as THREE from "three";
import { flat, gableWall, pitchedRoof, roofTileMaterial, roundedBox, signTexture } from "../overworld/props";
import { PAL } from "../overworld/style";
import { model, modelBox } from "../overworld/models";
import { shadowed } from "./common";

// Zone-specific low-poly props. Placeholders for the art pass, but each one should
// already say "this is that place" at a glance.

export function volcano(x: number, z: number) {
  const g = new THREE.Group();
  const cone = new THREE.Mesh(new THREE.ConeGeometry(5.5, 8, 7), flat(0x8a6a55));
  cone.position.y = 4;
  const lava = new THREE.Mesh(new THREE.ConeGeometry(1.4, 1.2, 7), flat(0xe3350d));
  lava.position.y = 7.6;
  g.add(cone, lava);
  g.position.set(x, 0, z);
  const puffs: THREE.Mesh[] = [];
  for (let i = 0; i < 3; i++) {
    const p = new THREE.Mesh(new THREE.SphereGeometry(0.7 + i * 0.25, 24, 16), new THREE.MeshLambertMaterial({ color: 0xffffff, transparent: true, opacity: 0.8 }));
    g.add(p);
    puffs.push(p);
  }
  const update = (t: number) =>
    puffs.forEach((p, i) => {
      const k = (t * 0.25 + i / 3) % 1;
      p.position.set(Math.sin(k * 6) * 0.4, 8.4 + k * 4, 0);
      p.scale.setScalar(0.6 + k);
      (p.material as THREE.MeshLambertMaterial).opacity = 0.85 * (1 - k);
    });
  return { group: shadowed(g), update };
}

/** The lion Faris once called a bear. */
export function lion(x: number, z: number) {
  const g = new THREE.Group();
  const gold = flat(0xd9a441);
  const body = new THREE.Mesh(roundedBox(2.2, 1.1, 1.1), gold);
  body.position.y = 1.0;
  const mane = new THREE.Mesh(new THREE.SphereGeometry(0.95, 24, 16), flat(0x9a5a22));
  mane.position.set(1.15, 1.75, 0);
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.62, 24, 16), gold);
  head.position.set(1.45, 1.75, 0);
  const tail = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 1.2, 5), gold);
  tail.position.set(-1.35, 1.4, 0);
  tail.rotation.z = 0.8;
  g.add(body, mane, head, tail);
  for (const [lx, lz] of [[-0.8, -0.35], [-0.8, 0.35], [0.8, -0.35], [0.8, 0.35]]) {
    const leg = new THREE.Mesh(roundedBox(0.3, 0.6, 0.3), gold);
    leg.position.set(lx, 0.3, lz);
    g.add(leg);
  }
  const plinth = new THREE.Mesh(roundedBox(3, 0.3, 1.6), flat(0xcfc6b5));
  plinth.position.y = 0.15;
  g.add(plinth);
  g.position.set(x, 0, z);
  return shadowed(g);
}

export function pool(x0: number, z0: number, x1: number, z1: number) {
  const g = new THREE.Group();
  const rim = new THREE.Mesh(roundedBox(x1 - x0 + 0.8, 0.3, z1 - z0 + 0.8), flat(0xf4f1e6));
  rim.position.set((x0 + x1) / 2, 0.15, (z0 + z1) / 2);
  const water = new THREE.Mesh(
    roundedBox(x1 - x0, 0.32, z1 - z0),
    new THREE.MeshLambertMaterial({ color: 0x3fb4e8, emissive: 0x0b4f7a, emissiveIntensity: 0.25 }),
  );
  water.position.set((x0 + x1) / 2, 0.17, (z0 + z1) / 2);
  g.add(rim, water);
  return shadowed(g);
}

export function booth(x: number, z: number, name: string, color: number) {
  const g = new THREE.Group();
  const body = new THREE.Mesh(roundedBox(3.2, 3.2, 2.4), flat(color));
  body.position.y = 1.6;
  const curtain = new THREE.Mesh(roundedBox(1.5, 2.3, 0.08), flat(0x2a2730));
  curtain.position.set(0.55, 1.25, 1.22);
  const sign = new THREE.Mesh(
    roundedBox(3.4, 0.8, 0.15),
    [flat(color), flat(color), flat(color), flat(color), new THREE.MeshLambertMaterial({ map: signTexture(name, "#fffdf6", "#17151f", 640, 150, "bold 58px 'Bagel Fat One', sans-serif") }), flat(color)],
  );
  sign.position.set(0, 3.6, 0.9);
  g.add(body, curtain, sign);
  g.position.set(x, 0, z);
  return shadowed(g);
}

export function fruitTree(x: number, z: number, seed: number) {
  const g = new THREE.Group();
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.3, 1.6, 6), flat(0x7a5536));
  trunk.position.y = 0.8;
  const crown = new THREE.Mesh(new THREE.SphereGeometry(1.5, 24, 16), flat(seed % 2 ? 0x4f9a3a : 0x5aa844));
  crown.position.y = 2.6;
  g.add(trunk, crown);
  const fruitColors = [0xe3350d, 0xffcb05, 0xff8f3a, 0x7a2d8f];
  for (let i = 0; i < 7; i++) {
    const a = (i / 7) * Math.PI * 2 + seed;
    const f = new THREE.Mesh(new THREE.SphereGeometry(0.2, 24, 16), flat(fruitColors[(i + seed) % fruitColors.length]));
    f.position.set(Math.cos(a) * 1.25, 2.3 + Math.sin(i * 2.1) * 0.6, Math.sin(a) * 1.25);
    g.add(f);
  }
  g.position.set(x, 0, z);
  return shadowed(g);
}

export function crate(x: number, z: number) {
  const g = new THREE.Group();
  const box = new THREE.Mesh(roundedBox(1.1, 0.7, 0.8), flat(0xb58450));
  box.position.y = 0.35;
  g.add(box);
  for (let i = 0; i < 6; i++) {
    const f = new THREE.Mesh(new THREE.SphereGeometry(0.17, 24, 16), flat([0xe3350d, 0xffcb05, 0x7a2d8f][i % 3]));
    f.position.set(-0.35 + (i % 3) * 0.35, 0.78, i < 3 ? -0.15 : 0.15);
    g.add(f);
  }
  g.position.set(x, 0, z);
  return shadowed(g);
}

export function dome(x: number, z: number) {
  const g = new THREE.Group();
  const base = new THREE.Mesh(new THREE.CylinderGeometry(5, 5, 1.2, 16), flat(0xe8ebf2));
  base.position.y = 0.6;
  const top = new THREE.Mesh(new THREE.SphereGeometry(4.8,20,14, 0, Math.PI * 2, 0, Math.PI / 2), flat(0xf4f6fb));
  top.position.y = 1.2;
  g.add(base, top);
  g.position.set(x, 0, z);
  return shadowed(g);
}

export function rocket(x: number, z: number) {
  const g = new THREE.Group();
  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 1.0, 5.5, 10), flat(0xf4f6fb));
  body.position.y = 3.2;
  const nose = new THREE.Mesh(new THREE.ConeGeometry(0.9, 1.8, 10), flat(0xe3350d));
  nose.position.y = 6.85;
  const window_ = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.38, 0.1, 12), flat(0x3b6fe0));
  window_.rotation.x = Math.PI / 2;
  window_.position.set(0, 4.6, 0.95);
  g.add(body, nose, window_);
  for (let i = 0; i < 3; i++) {
    const fin = new THREE.Mesh(roundedBox(0.15, 1.6, 1.2), flat(0xe3350d));
    const a = (i / 3) * Math.PI * 2;
    fin.position.set(Math.cos(a) * 1.0, 1.1, Math.sin(a) * 1.0);
    fin.rotation.y = -a;
    g.add(fin);
  }
  g.position.set(x, 0, z);
  return shadowed(g);
}

/** Twinkling dots on the ground for the space zone. */
export function stars(count: number) {
  const g = new THREE.Group();
  const mats = [0xffffff, 0xffcb05, 0x9fd3ff].map((c) => new THREE.MeshBasicMaterial({ color: c }));
  const items: THREE.Mesh[] = [];
  for (let i = 0; i < count; i++) {
    const s = new THREE.Mesh(new THREE.OctahedronGeometry(0.09 + Math.random() * 0.08, 0), mats[i % 3]);
    s.position.set((Math.random() - 0.5) * 60, 0.1 + Math.random() * 0.2, -12 + Math.random() * 28);
    g.add(s);
    items.push(s);
  }
  const update = (t: number) => items.forEach((s, i) => s.scale.setScalar(0.6 + Math.abs(Math.sin(t * 2 + i))));
  return { group: g, update };
}

export function cafeTable(x: number, z: number) {
  const g = new THREE.Group();
  const top = new THREE.Mesh(new THREE.CylinderGeometry(0.75, 0.75, 0.08, 12), flat(0xf4f1e6));
  top.position.y = 0.95;
  const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.1, 0.95, 6), flat(0x3a3f4a));
  leg.position.y = 0.47;
  const candle = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.25, 6), new THREE.MeshBasicMaterial({ color: 0xffe9a8 }));
  candle.position.y = 1.12;
  g.add(top, leg, candle);
  for (const cx of [-1.05, 1.05]) {
    const seat = new THREE.Mesh(roundedBox(0.55, 0.08, 0.55), flat(0x9b6b3d));
    seat.position.set(cx, 0.55, 0);
    const back = new THREE.Mesh(roundedBox(0.08, 0.6, 0.55), flat(0x9b6b3d));
    back.position.set(cx + Math.sign(cx) * 0.25, 0.85, 0);
    g.add(seat, back);
  }
  g.position.set(x, 0, z);
  return shadowed(g);
}

/** String of warm bulbs between two points; returns update for twinkle. */
export function fairyLights(x0: number, x1: number, z: number, y: number, n = 14) {
  const g = new THREE.Group();
  const bulbs: THREE.Mesh[] = [];
  for (let i = 0; i < n; i++) {
    const k = i / (n - 1);
    const b = new THREE.Mesh(new THREE.SphereGeometry(0.11,20,14), new THREE.MeshBasicMaterial({ color: 0xffe08a }));
    b.position.set(x0 + (x1 - x0) * k, y - Math.sin(k * Math.PI) * 0.5, z);
    g.add(b);
    bulbs.push(b);
  }
  const update = (t: number) =>
    bulbs.forEach((b, i) => (b.material as THREE.MeshBasicMaterial).color.setHSL(0.12, 1, 0.6 + Math.sin(t * 3 + i) * 0.15));
  return { group: g, update };
}

export function hill(x: number, z: number, r: number, color: number) {
  const m = new THREE.Mesh(new THREE.SphereGeometry(r, 24, 16), flat(color));
  m.scale.y = 0.45;
  m.position.set(x, -r * 0.1, z);
  m.receiveShadow = true;
  return m;
}

export function flowerPatch(x: number, z: number, n: number, colors: number[]) {
  const g = new THREE.Group();
  for (let i = 0; i < n; i++) {
    const f = new THREE.Mesh(new THREE.SphereGeometry(0.14, 24, 16), flat(colors[i % colors.length]));
    f.position.set(x + (Math.random() - 0.5) * 3, 0.18, z + (Math.random() - 0.5) * 2);
    g.add(f);
  }
  return g;
}

export function raceTrack(z0: number, z1: number) {
  const g = new THREE.Group();
  const asphalt = new THREE.Mesh(roundedBox(80, 0.06, z1 - z0), flat(0x3f4048));
  asphalt.position.set(0, 0.03, (z0 + z1) / 2);
  asphalt.receiveShadow = true;
  g.add(asphalt);
  for (const kz of [z0 - 0.3, z1 + 0.3]) {
    for (let i = -40; i < 40; i += 1.2) {
      const k = new THREE.Mesh(roundedBox(1.2, 0.1, 0.6), flat(Math.round(i / 1.2) % 2 ? 0xe3350d : 0xffffff));
      k.position.set(i, 0.05, kz);
      g.add(k);
    }
  }
  return g;
}

export function grandstand(x: number, z: number, w: number) {
  const g = new THREE.Group();
  for (let r = 0; r < 4; r++) {
    const step = new THREE.Mesh(roundedBox(w, 0.8, 1.2), flat(r % 2 ? 0xdfe4ee : 0xc9d0dc));
    step.position.set(0, 0.4 + r * 0.8, -r * 1.2);
    g.add(step);
  }
  const roof = new THREE.Mesh(roundedBox(w + 1, 0.3, 5), flat(0xe3350d));
  roof.position.set(0, 5.4, -1.8);
  g.add(roof);
  g.position.set(x, 0, z);
  return shadowed(g);
}

export function checkerFlag(x: number, z: number) {
  const g = new THREE.Group();
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 4, 6), flat(0xdddddd));
  pole.position.y = 2;
  const tex = new THREE.CanvasTexture(
    (() => {
      const c = document.createElement("canvas");
      c.width = c.height = 64;
      const ctx = c.getContext("2d")!;
      for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) {
        ctx.fillStyle = (i + j) % 2 ? "#111" : "#fff";
        ctx.fillRect(i * 16, j * 16, 16, 16);
      }
      return c;
    })(),
  );
  const flag = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 1), new THREE.MeshLambertMaterial({ map: tex, side: THREE.DoubleSide }));
  flag.position.set(0.7, 3.5, 0);
  g.add(pole, flag);
  g.position.set(x, 0, z);
  const update = (t: number) => (flag.rotation.y = Math.sin(t * 3 + x) * 0.3);
  return { group: shadowed(g), update };
}

export function bunting(x0: number, x1: number, z: number, y: number) {
  const g = new THREE.Group();
  const colors = [0xe3350d, 0xffcb05, 0x3b6fe0, 0xff8fb1, 0x46b86a];
  const n = Math.round((x1 - x0) / 0.7);
  for (let i = 0; i < n; i++) {
    const k = i / (n - 1);
    const tri = new THREE.Mesh(new THREE.ConeGeometry(0.25, 0.5, 3), flat(colors[i % colors.length]));
    tri.rotation.x = Math.PI;
    tri.scale.z = 0.2;
    tri.position.set(x0 + (x1 - x0) * k, y - Math.sin(k * Math.PI) * 0.6, z);
    g.add(tri);
  }
  return g;
}

/** Qish's mango birthday cake on its pink-covered table. */
export function cake(x: number, z: number) {
  const cloth = modelBox("clothtable", 2.3, 0.85, 1.25);
  const top = model("cake", 1.1);
  if (cloth && top) {
    top.position.y = 0.84;
    const g = new THREE.Group();
    g.add(cloth, top);
    g.position.set(x, 0, z);
    return g;
  }
  const g = new THREE.Group();
  const table = new THREE.Mesh(roundedBox(2.4, 0.9, 1.4), flat(0xf4f1e6));
  table.position.y = 0.45;
  const l1 = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.6, 0.45, 16), flat(0xffc845));
  l1.position.y = 1.12;
  const l2 = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 0.35, 16), flat(0xffe08a));
  l2.position.y = 1.5;
  g.add(table, l1, l2);
  g.position.set(x, 0, z);
  return shadowed(g);
}

export const HOUSE_DOOR_X = 1.85;

/** Qish's family house in Labu Lanjut (style B): cream walls on a stone plinth, a plum clay-tile
 * roof, a gabled porch on two columns over the door, framed windows with wooden shutters. */
export function kampungHouse(x: number, z: number, evening = false) {
  const gen = model("house", 13.2);
  if (gen) {
    // The generated house's front door sits 1.85 m right of its middle; stand it so the door is at x.
    const cx = x - HOUSE_DOOR_X;
    gen.position.set(cx, 0, z);
    return { group: gen, box: [cx - 6, z - 3.5, cx + 6, z + 3.5] as [number, number, number, number], generated: true };
  }
  const g = new THREE.Group();
  const w = 12;
  const d = 7;
  const h = 3.6;
  const wall = flat(PAL.wallCream);
  const wood = flat(PAL.wood);
  const woodDark = flat(PAL.woodDark);
  const stone = flat(PAL.stone);
  const roofMat = roofTileMaterial(0x8a6f8f, w / 2);

  const plinth = new THREE.Mesh(roundedBox(w + 0.35, 0.5, d + 0.35, 0.16, 3), stone);
  plinth.position.y = 0.25;
  const body = new THREE.Mesh(roundedBox(w, h, d, 0.32, 3), wall);
  body.position.y = h / 2 + 0.1;
  const fascia = new THREE.Mesh(roundedBox(w + 0.25, 0.26, d + 0.25, 0.1, 2), wood);
  fascia.position.y = h + 0.02;
  g.add(plinth, body, fascia);

  // Main roof with a deep overhang, and cream gable ends tucked under it.
  const rise = 2.5;
  const roof = pitchedRoof(w + 1.3, d + 1.7, rise, roofMat);
  roof.position.y = h + 0.1;
  g.add(roof);
  for (const sx of [-1, 1]) {
    const gable = gableWall(d, rise - 0.2, wall);
    gable.rotation.y = Math.PI / 2;
    gable.position.set(sx * (w / 2 - 0.2), h + 0.1, 0);
    g.add(gable);
  }

  // Windows: wooden frame, cross bars, pale glass with a highlight, shutters and a flower box.
  const glass = evening ? new THREE.MeshBasicMaterial({ color: 0xffd27a }) : flat(PAL.glass);
  const shine = new THREE.MeshBasicMaterial({ color: 0xf2fbff });
  const blooms = [flat(PAL.bloomPink), flat(PAL.bloomWhite), flat(PAL.bloomMagenta)];
  const leaves = flat(PAL.leaf);
  const front = d / 2 + 0.1;
  for (const wx of [-4.4, -2.7, 2.7, 4.4]) {
    const frame = new THREE.Mesh(roundedBox(1.25, 1.3, 0.14, 0.06), wood);
    frame.position.set(wx, 2.05, front);
    const pane = new THREE.Mesh(roundedBox(1.0, 1.05, 0.08, 0.04), glass);
    pane.position.set(wx, 2.05, front + 0.05);
    g.add(frame, pane);
    if (!evening) {
      const hl = new THREE.Mesh(roundedBox(0.16, 0.6, 0.02, 0.01), shine);
      hl.position.set(wx - 0.28, 2.18, front + 0.1);
      g.add(hl);
    }
    for (const [bw, bh] of [[0.07, 1.05], [1.0, 0.07]] as const) {
      const bar = new THREE.Mesh(roundedBox(bw, bh, 0.05, 0.02), wood);
      bar.position.set(wx, 2.05, front + 0.1);
      g.add(bar);
    }
    for (const sx of [-0.83, 0.83]) {
      const shutter = new THREE.Mesh(roundedBox(0.38, 1.35, 0.08, 0.05), woodDark);
      shutter.position.set(wx + sx, 2.05, front + 0.02);
      g.add(shutter);
      for (let k = -2; k <= 2; k++) {
        const slat = new THREE.Mesh(roundedBox(0.3, 0.05, 0.03, 0.012), wood);
        slat.position.set(wx + sx, 2.05 + k * 0.24, front + 0.07);
        g.add(slat);
      }
    }
    const planter = new THREE.Mesh(roundedBox(1.3, 0.28, 0.34, 0.08), wood);
    planter.position.set(wx, 1.25, front + 0.2);
    g.add(planter);
    for (let k = 0; k < 6; k++) {
      const bx = wx - 0.5 + k * 0.2;
      const leaf = new THREE.Mesh(new THREE.SphereGeometry(0.13,20,14), leaves);
      leaf.position.set(bx, 1.45, front + 0.22);
      const bloom = new THREE.Mesh(new THREE.SphereGeometry(0.08,20,14), blooms[k % 3]);
      bloom.position.set(bx + 0.06, 1.55 + (k % 2) * 0.05, front + 0.3);
      g.add(leaf, bloom);
    }
  }

  // Gabled porch on two round columns over the door.
  const porchY = 3.15;
  const porchRoof = pitchedRoof(2.9, 4.6, 1.35, roofMat, 0.22);
  porchRoof.rotation.y = Math.PI / 2;
  porchRoof.position.set(0, porchY, d / 2 + 0.95);
  g.add(porchRoof);
  const porchGable = gableWall(4.0, 1.2, wall, 0.2);
  porchGable.position.set(0, porchY, d / 2 + 2.15);
  g.add(porchGable);
  const vent = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.26, 0.08, 18), flat(PAL.woodLight));
  vent.rotation.x = Math.PI / 2;
  vent.position.set(0, porchY + 0.48, d / 2 + 2.3);
  g.add(vent);
  const porchBeam = new THREE.Mesh(roundedBox(4.2, 0.24, 0.3, 0.08), wood);
  porchBeam.position.set(0, porchY - 0.05, d / 2 + 2.15);
  g.add(porchBeam);
  for (const px of [-1.85, 1.85]) {
    const column = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.2, porchY - 0.5, 14), flat(0xfff6e8));
    column.position.set(px, porchY / 2 + 0.2, d / 2 + 2.15);
    const base = new THREE.Mesh(roundedBox(0.5, 0.3, 0.5, 0.1), stone);
    base.position.set(px, 0.35, d / 2 + 2.15);
    g.add(column, base);
  }
  const porchFloor = new THREE.Mesh(roundedBox(4.1, 0.42, 2.3, 0.12), stone);
  porchFloor.position.set(0, 0.21, d / 2 + 1.15);
  const step = new THREE.Mesh(roundedBox(2.6, 0.22, 0.7, 0.08), stone);
  step.position.set(0, 0.11, d / 2 + 2.6);
  g.add(porchFloor, step);
  // Slippers at the door.
  for (const [sx, c] of [[-0.9, 0xff8fb1], [-0.6, 0xff8fb1], [0.7, 0x3b6fe0], [1.0, 0x3b6fe0]] as const) {
    const s = new THREE.Mesh(roundedBox(0.22, 0.06, 0.45, 0.025), flat(c));
    s.position.set(sx, 0.45, d / 2 + 0.9);
    g.add(s);
  }
  g.position.set(x, 0, z);
  return { group: shadowed(g), box: [x - w / 2, z - d / 2, x + w / 2, z + d / 2] as [number, number, number, number], generated: false };
}
