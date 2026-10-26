import { roundedBox } from "../overworld/props";
import * as THREE from "three";
import { mergeStatic } from "../overworld/merge";
import { canvasTexture, flat } from "../overworld/props";
import { type PersonLook } from "../content/doodles";
import { shadowed } from "./common";
import type { Anim } from "./labuProps";
import { type Stander, neonSign, smoke } from "./lorbelProps";
import { DEG, ENTRY_A, INK, chalkboard, glow, local, mesh, placeAt, polar, pool, popWord, rng, sign, slabBoxes } from "./nyomProps";
import type { Box } from "../overworld/zone";

// The seven places to eat round Nyomnyom City, one per pizza slice. Each is built in its slice's local
// frame (origin at the shop's middle, front facing +z in to the city) and then turned into place.

export type ShopKind = "kek" | "gepuk" | "malatang" | "dubuyo" | "mcd" | "salai" | "cookies";

/** Shop middle, radius from the city centre: shops on the north half face in to the middle (the front
 * is 3 nearer it); the camera looks north, so shops on the south half face out instead, towards the
 * crust, with the terrace behind them. */
export const SHOP_R = 26;
export const SHOP_R_OUT = 21.6;
const W = 10;
const D = 6;

export interface ShopSpot {
  kind: ShopKind;
  /** Slice angle. */
  a: number;
  /** Faces out to the crust (south half) rather than in to the middle. */
  out: boolean;
  /** Radius of the shop's middle. */
  r: number;
  name: string;
  /** Where Bowat's receipt waits once he's run off without paying (in front of the vendor). */
  resit: [number, number];
  /** Where Bowat sits eating. */
  eat: [number, number];
  /** The shopkeeper outside the door. */
  vendor: [number, number];
}

/** In the order Bowat eats his way round (clockwise from the gate): his trail, and the receipts. */
const ORDER: [ShopKind, number, string][] = [
  ["kek", 112.5, "Kek Mango"],
  ["gepuk", 202.5, "Ayam Gepuk"],
  ["malatang", 247.5, "Malatang"],
  ["dubuyo", 292.5, "Dubuyo"],
  ["mcd", 337.5, "McDonald's"],
  ["salai", 382.5, "Daging Salai"],
  ["cookies", 427.5, "Cookies"],
];

export const SHOPS: ShopSpot[] = ORDER.map(([kind, deg, name]) => {
  const a = deg * DEG;
  const out = Math.sin(a) > 0.2;
  const r = out ? SHOP_R_OUT : SHOP_R;
  return { kind, a, out, r, name, vendor: local(a, r, 2.0, 3.7, out), resit: local(a, r, 2.0, 5.3, out), eat: local(a, r, -4.1, 6.45, out) };
});

export interface ShopBuild {
  statics: THREE.Group;
  anims: Anim[];
  boxes: Box[];
  crowd: Stander[];
  /** Point lights are costly: one per shop, warm, no shadows. */
  lights: THREE.PointLight[];
  /** Plates piled up where Bowat ate (hidden until he has been here). */
  plates: THREE.Group;
}

// ---------------------------------------------------------------- Shell

interface Look {
  wall: string;
  trim: number;
  base: string;
  glass: string;
  door: string;
  awning: [string, string];
  /** Window dressing drawn behind the glass. */
  inside?: (g: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) => void;
}

/** Front wall canvas (colour + lit-window maps): two big shop windows and a glass door, warm inside. */
function facade(o: Look, w: number, h: number) {
  const S = 64;
  const Wp = w * S;
  const Hp = h * S;
  const y0 = Hp - 2.65 * S;
  const y1 = Hp - 0.75 * S;
  const panes: [number, number, number, number][] = [
    [0.55 * S, y0, (w / 2 - 1.5) * S, y1 - y0],
    [(w / 2 + 0.95) * S, y0, (w / 2 - 1.5) * S, y1 - y0],
  ];
  const door: [number, number, number, number] = [(w / 2 - 0.75) * S, Hp - 2.5 * S, 1.5 * S, 2.5 * S - 0.06 * S];
  const glassFill = (g: CanvasRenderingContext2D, [x, y, pw, ph]: [number, number, number, number]) => {
    const grad = g.createLinearGradient(0, y, 0, y + ph);
    grad.addColorStop(0, o.glass);
    grad.addColorStop(1, "#fff4d6");
    g.fillStyle = grad;
    g.fillRect(x, y, pw, ph);
  };
  const map = canvasTexture(Wp, Hp, (g) => {
    g.fillStyle = o.wall;
    g.fillRect(0, 0, Wp, Hp);
    g.fillStyle = o.base;
    g.fillRect(0, Hp - 0.4 * S, Wp, 0.4 * S);
    for (const p of panes) {
      glassFill(g, p);
      o.inside?.(g, ...p);
      // Heads of people inside, and a shelf line.
      g.fillStyle = "rgba(60,40,40,.35)";
      for (let i = 0; i < 3; i++) {
        g.beginPath();
        g.arc(p[0] + p[2] * (0.2 + i * 0.3), p[1] + p[3] * 0.62, S * 0.2, 0, Math.PI * 2);
        g.fill();
        g.fillRect(p[0] + p[2] * (0.2 + i * 0.3) - S * 0.22, p[1] + p[3] * 0.7, S * 0.44, p[3] * 0.3);
      }
      g.strokeStyle = "#f6f1e4";
      g.lineWidth = 8;
      g.strokeRect(...p);
      g.lineWidth = 4;
      g.beginPath();
      g.moveTo(p[0] + p[2] / 2, p[1]);
      g.lineTo(p[0] + p[2] / 2, p[1] + p[3]);
      g.stroke();
    }
    glassFill(g, door);
    g.fillStyle = o.door;
    g.lineWidth = 10;
    g.strokeStyle = o.door;
    g.strokeRect(...door);
    g.fillRect(door[0] + door[2] / 2 - 3, door[1], 6, door[3]);
    g.fillStyle = "#c9a14a";
    g.fillRect(door[0] + door[2] / 2 - 18, door[1] + door[3] * 0.5, 10, 30);
    g.fillRect(door[0] + door[2] / 2 + 8, door[1] + door[3] * 0.5, 10, 30);
    // "BUKA" tag.
    g.fillStyle = "#e3262e";
    g.fillRect(door[0] + 10, door[1] + 20, 64, 26);
    g.fillStyle = "#fff";
    g.font = "bold 20px sans-serif";
    g.fillText("BUKA", door[0] + 16, door[1] + 40);
  });
  const lit = canvasTexture(Wp, Hp, (g) => {
    g.fillStyle = "#000";
    g.fillRect(0, 0, Wp, Hp);
    g.fillStyle = "#ffcf8a";
    for (const p of [...panes, door]) g.fillRect(...p);
  });
  return { map, lit };
}

function stripes(a: string, b: string, n = 10) {
  return canvasTexture(256, 64, (g) => {
    for (let i = 0; i < n; i++) {
      g.fillStyle = i % 2 ? b : a;
      g.fillRect((i * 256) / n, 0, 256 / n + 1, 64);
    }
    // Scalloped hem.
    g.fillStyle = "rgba(0,0,0,.18)";
    g.fillRect(0, 56, 256, 8);
  });
}

/** The building: walls, lit front, parapet, striped awning and a sign above it. Local frame. */
function shell(o: Look, signText: string, signBg: string, signFg: string, sub?: string, h = 4.2) {
  const g = new THREE.Group();
  const f = facade(o, W, h);
  const wall = flat(new THREE.Color(o.wall).getHex());
  const front = new THREE.MeshLambertMaterial({ map: f.map, emissiveMap: f.lit, emissive: 0xffffff, emissiveIntensity: 0.85 });
  const roofTex = canvasTexture(128, 96, (c) => {
    c.fillStyle = "#b9b2a6";
    c.fillRect(0, 0, 128, 96);
    c.strokeStyle = "#a59d90";
    c.lineWidth = 2;
    for (let x = 0; x < 128; x += 16) {
      c.beginPath();
      c.moveTo(x, 0);
      c.lineTo(x, 96);
      c.stroke();
    }
    c.fillStyle = "rgba(60,50,40,.15)";
    c.fillRect(70, 20, 30, 50);
  });
  g.add(mesh(roundedBox(W, h, D), [wall, wall, new THREE.MeshLambertMaterial({ map: roofTex }), wall, front, wall], 0, h / 2, 0));
  // Air-con units and a water tank up top (the south shops are seen from above and behind).
  const metal = flat(0xd8dade);
  for (const x of [-3.4, -1.9]) {
    g.add(mesh(roundedBox(1.0, 0.6, 0.7), metal, x, h + 0.3, -1.6));
    g.add(mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.04, 10), flat(0x6b7180), x, h + 0.62, -1.6));
  }
  g.add(mesh(new THREE.CylinderGeometry(0.55, 0.55, 0.9, 12), flat(0x4a8fd0), 3.4, h + 0.45, -1.8));
  const trim = flat(o.trim);
  // Parapet round the roof.
  g.add(mesh(roundedBox(W + 0.3, 0.45, 0.3), trim, 0, h + 0.2, D / 2));
  g.add(mesh(roundedBox(W + 0.3, 0.45, 0.3), trim, 0, h + 0.2, -D / 2));
  g.add(mesh(roundedBox(0.3, 0.45, D), trim, -W / 2, h + 0.2, 0));
  g.add(mesh(roundedBox(0.3, 0.45, D), trim, W / 2, h + 0.2, 0));
  // Awning over the windows, sloping out.
  const aw = mesh(new THREE.PlaneGeometry(W - 0.4, 1.5), new THREE.MeshLambertMaterial({ map: stripes(...o.awning), side: THREE.DoubleSide }), 0, 2.85, D / 2 + 0.62);
  aw.rotation.x = -1.05;
  g.add(aw);
  const s = sign(signText, W * 0.72, 1.15, signBg, signFg, sub);
  s.position.set(0, h - 0.55, D / 2 + 0.06);
  g.add(s);
  return g;
}

/** A terrace table with chairs, a cloth and (optionally) a parasol. Local frame. */
function terraceTable(x: number, z: number, cloth: number, parasol?: [number, number], seed = 0) {
  const g = new THREE.Group();
  const r = rng(seed);
  g.add(mesh(new THREE.CylinderGeometry(0.72, 0.72, 0.06, 16), flat(cloth), 0, 0.76, 0));
  g.add(mesh(new THREE.CylinderGeometry(0.74, 0.74, 0.22, 16, 1, true), flat(cloth), 0, 0.66, 0));
  g.add(mesh(new THREE.CylinderGeometry(0.06, 0.08, 0.76, 6), flat(0x3a3a40), 0, 0.38, 0));
  const chair = flat(0x8a5a32);
  for (const [cx, cz, ry] of [[-1.0, 0, Math.PI / 2], [1.0, 0, -Math.PI / 2]] as const) {
    const c = new THREE.Group();
    c.add(mesh(roundedBox(0.5, 0.06, 0.5), chair, 0, 0.48, 0));
    c.add(mesh(roundedBox(0.5, 0.55, 0.06), chair, 0, 0.78, -0.24));
    for (const lx of [-0.2, 0.2]) for (const lz of [-0.2, 0.2]) c.add(mesh(roundedBox(0.05, 0.48, 0.05), chair, lx, 0.24, lz));
    c.position.set(cx, 0, cz);
    c.rotation.y = ry;
    g.add(c);
  }
  // Food on it.
  const foods = [0xe8a33c, 0xd9452b, 0x7a3b22, 0xffd23f, 0x46b86a];
  for (let i = 0; i < 2; i++) {
    const px = (i - 0.5) * 0.6;
    g.add(mesh(new THREE.CylinderGeometry(0.2, 0.17, 0.04, 10), flat(0xf4f1e6), px, 0.81, (r() - 0.5) * 0.3));
    const heap = mesh(new THREE.SphereGeometry(0.12, 24, 16), flat(foods[Math.floor(r() * foods.length)]), px, 0.87, 0);
    heap.scale.y = 0.6;
    g.add(heap);
  }
  if (parasol) {
    g.add(mesh(new THREE.CylinderGeometry(0.04, 0.04, 2.3, 6), flat(0xe8e2d6), 0, 1.15, 0));
    const top = mesh(new THREE.ConeGeometry(1.15, 0.5, 8, 1, true), new THREE.MeshLambertMaterial({ map: stripes(`#${parasol[0].toString(16).padStart(6, "0")}`, `#${parasol[1].toString(16).padStart(6, "0")}`, 8), side: THREE.DoubleSide }), 0, 2.25, 0);
    g.add(top);
  }
  g.position.set(x, 0, z);
  return g;
}

/** Plates piled up where Bowat ate (local frame, on the table top). */
function plateStack(x: number, z: number, n: number) {
  const g = new THREE.Group();
  for (let i = 0; i < n; i++) g.add(mesh(new THREE.CylinderGeometry(0.22, 0.18, 0.05, 12), flat(0xf8f6ee), x + Math.sin(i * 2.1) * 0.03, 0.82 + i * 0.055, z));
  return g;
}


const LOOKS: PersonLook[] = [
  { skin: "#e8b48f", top: "#ff8fb1", bottom: "#3d4a7a", hijab: "#9b6ad6", bag: "#ffcb05", carry: "drink" },
  { skin: "#c98c64", top: "#3fae5a", bottom: "#2a2730", hair: "#26222a", bag: "#f2f0ea", carry: "none" },
  { skin: "#f0c8a8", top: "#f2f0ea", bottom: "#6b5a8a", hair: "#7a4a2a", bag: "#ff8fb1", carry: "cone" },
  { skin: "#e3ad86", top: "#1f2f7a", bottom: "#9aa0aa", hijab: "#7dd3c0", bag: "#f2f0ea", carry: "bowl" },
  { skin: "#b97a52", top: "#e3350d", bottom: "#2a2730", hair: "#1c1a20", bag: "#7a3b22", carry: "satay" },
  { skin: "#ecc0a0", top: "#2a2730", bottom: "#c9b48a", hijab: "#f2d27a", bag: "#e8f0ff", carry: "phone" },
  { skin: "#d39a72", top: "#9fd3b0", bottom: "#3d4a7a", hair: "#26222a", bag: "#e3350d", carry: "drink" },
  { skin: "#f2cfb2", top: "#b9c4ff", bottom: "#2a2730", hijab: "#2a2730", bag: "#ffcb05", carry: "none" },
  { skin: "#d9a27a", top: "#ffcb05", bottom: "#3b6fe0", hair: "#26222a", bag: "#ffb4d0", carry: "cone", kid: true },
  { skin: "#e0a882", top: "#6b5a8a", bottom: "#d9d2c4", hijab: "#ff8fb1", bag: "#f2f0ea", carry: "wrap" },
];
const look = (i: number, carry?: PersonLook["carry"]): PersonLook => ({ ...LOOKS[i % LOOKS.length], ...(carry ? { carry } : {}) });

/** Passers-by round the city, most with something to eat in hand. */
export const NYOM_LOOKS: PersonLook[] = [
  ...LOOKS,
  { skin: "#c98c64", top: "#f6a04b", bottom: "#4a4a55", cap: "#2a2730", hair: "#26222a", bag: "#46b86a", carry: "drink", kid: true },
  { skin: "#e8b48f", top: "#ffd6e0", bottom: "#3d4a7a", hijab: "#7a4a2a", bag: "#f2f0ea", carry: "cone" },
];

// ---------------------------------------------------------------- The seven shops

export function buildShop(spot: ShopSpot): ShopBuild {
  const { a, kind, out } = spot;
  const R = spot.r;
  const g = new THREE.Group();
  const anims: Anim[] = [];
  const crowd: Stander[] = [];
  const lights: THREE.PointLight[] = [];
  const box = (lx: number, lz: number, w: number, d: number, strips = 1) => slabBoxes(a, R, lx, lz, w, d, strips, out);
  const boxes: Box[] = box(0, 0, W, D, 5);
  const at = (lx: number, lz: number) => local(a, R, lx, lz, out);
  /** Add an animated piece in the local frame. */
  const anim = (an: Anim, lx = 0, ly = 0, lz = 0) => {
    const holder = new THREE.Group();
    holder.add(an.group);
    an.group.position.add(new THREE.Vector3(lx, ly, lz));
    placeAt(holder, a, R, out);
    anims.push({ group: holder, update: an.update });
  };
  const table = (lx: number, lz: number, cloth: number, parasol?: [number, number], seed = 0) => {
    g.add(terraceTable(lx, lz, cloth, parasol, seed));
    boxes.push(...box(lx, lz, 2.4, 1.2));
  };
  /** Diners at a table; `one` leaves the outer chair free (Bowat's). */
  const diners = (lx: number, lz: number, i: number, lines: string[], one = false) => {
    [at(lx - 1.0, lz), at(lx + 1.0, lz)].forEach(([x, z], k) => {
      if (!one || k === 1) crowd.push({ x, z, look: look(i + k), mode: "eat", seated: true, lines, flip: k === 1 });
    });
  };
  const vendor = (lk: PersonLook, lines: string[]) => crowd.push({ x: spot.vendor[0], z: spot.vendor[1], look: lk, mode: "vendor", lines });
  const light = (lx: number, ly: number, lz: number, color = 0xffb468, intensity = 18) => {
    const [x, z] = at(lx, lz);
    const l = new THREE.PointLight(color, intensity, 11, 1.5);
    l.position.set(x, ly, z);
    lights.push(l);
  };
  // Bowat's plates, where he ate: the zone shows them once he has been here.
  const plates = placeAt(plateStack(-3.1 - 0.3, 6.45, 6), a, R, out);
  plates.visible = false;

  switch (kind) {
    case "kek": {
      g.add(
        shell(
          {
            wall: "#fff1c9",
            trim: 0xf2a516,
            base: "#e9a31c",
            glass: "#ffe7a6",
            door: "#c97b12",
            awning: ["#ffc93c", "#fffaf0"],
            inside: (c, x, y, w, h) => {
              // Cakes on stands behind the glass.
              for (let i = 0; i < 3; i++) {
                const cx = x + w * (0.2 + i * 0.3);
                c.fillStyle = "#fff3d6";
                c.fillRect(cx - 18, y + h * 0.35, 36, 22);
                c.fillStyle = "#ffb321";
                c.fillRect(cx - 18, y + h * 0.35, 36, 7);
              }
            },
          },
          "KEK MANGO",
          "#f7a21b",
          "#fffbe8",
          "Kek mango paling sedap kat Malaysia",
        ),
      );
      // Giant mango cake on the roof, turning slowly.
      const cake = new THREE.Group();
      cake.add(mesh(new THREE.CylinderGeometry(2.0, 2.0, 0.14, 24), flat(0xf8f6ee), 0, 0.07, 0));
      cake.add(mesh(new THREE.CylinderGeometry(1.65, 1.65, 0.75, 24), flat(0xfff3d6), 0, 0.5, 0));
      cake.add(mesh(new THREE.CylinderGeometry(1.67, 1.67, 0.2, 24), flat(0xffb321), 0, 0.6, 0));
      cake.add(mesh(new THREE.CylinderGeometry(1.65, 1.65, 0.55, 24), flat(0xfff3d6), 0, 1.15, 0));
      cake.add(mesh(new THREE.CylinderGeometry(1.68, 1.68, 0.14, 24), flat(0xffc93c), 0, 1.47, 0));
      const r = rng(4);
      for (let i = 0; i < 14; i++) {
        const an = r() * Math.PI * 2;
        const d = r() * 1.2;
        const cube = mesh(roundedBox(0.3, 0.26, 0.3), flat(i % 3 ? 0xffa21b : 0xffbe3a), Math.cos(an) * d, 1.66, Math.sin(an) * d);
        cube.rotation.y = r() * 3;
        cake.add(cube);
      }
      for (let i = 0; i < 12; i++) {
        const an = (i / 12) * Math.PI * 2;
        cake.add(mesh(new THREE.SphereGeometry(0.2,20,14), flat(0xfffdf6), Math.cos(an) * 1.45, 1.62, Math.sin(an) * 1.45));
      }
      cake.add(mesh(new THREE.SphereGeometry(0.2,20,14), flat(0xd92f3b), 0, 1.92, 0));
      const cakeBaked = mergeStatic(shadowed(cake));
      anim({ group: cakeBaked, update: (t) => (cakeBaked.rotation.y = t * 0.35) }, 0, 4.42, 0);
      // Display fridge out front, and the terrace.
      const fridge = new THREE.Group();
      fridge.add(mesh(roundedBox(1.8, 0.7, 0.8), flat(0xf2f0ea), 0, 0.35, 0));
      fridge.add(mesh(roundedBox(1.8, 0.7, 0.8), new THREE.MeshLambertMaterial({ color: 0xcfeaff, transparent: true, opacity: 0.35 }), 0, 1.05, 0));
      for (let i = 0; i < 4; i++) fridge.add(mesh(new THREE.CylinderGeometry(0.17, 0.17, 0.2, 10), flat(i % 2 ? 0xffb321 : 0xfff3d6), -0.6 + i * 0.4, 0.82, 0));
      fridge.position.set(-2.4, 0, 3.9);
      g.add(fridge);
      boxes.push(...box(-2.4, 3.9, 1.8, 0.8, 1));
      table(-3.1, 6.3, 0xfffaf0, undefined, 1);
      table(3.6, 6.8, 0xfffaf0, [0xffc93c, 0xfffaf0], 2);
      diners(3.6, 6.8, 0, ["Kek mango ni lembut gila", "Nak bungkus satu", "Manis tapi tak muak"]);
      g.add(chalkboard(["KEK HARI NI", "Mango Cheese", "Mango Pavlova", "Mango Susu"], 0.2, 7.2, 0.2));
      vendor({ skin: "#e3ad86", top: "#ffcb05", bottom: "#2a2730", hijab: "#fff1c9", bag: "#000", carry: "none", apron: "#f2f0ea" }, ["Jemput dik!", "Kek mango baru keluar!", "Fresh dari oven!"]);
      light(0, 3, 4.5);
      break;
    }
    case "gepuk": {
      g.add(
        shell(
          { wall: "#f3e6d0", trim: 0x2f8a4a, base: "#2f8a4a", glass: "#ffe2a6", door: "#2a5a35", awning: ["#2f8a4a", "#f6f1e4"] },
          "AYAM GEPUK",
          "#2f8a4a",
          "#fff7e0",
          "Sambal level 1 – 10",
        ),
      );
      // Giant lesung on the roof, the antan pounding away.
      const lesung = new THREE.Group();
      const bowl = new THREE.LatheGeometry(
        [[0, 0], [1.2, 0], [1.45, 0.35], [1.5, 0.9], [1.25, 0.95], [1.15, 0.5], [0, 0.45]].map(([x, y]) => new THREE.Vector2(x, y)),
        18,
      );
      lesung.add(mesh(bowl, flat(0x7d7a74)));
      lesung.add(mesh(new THREE.CylinderGeometry(1.16, 1.16, 0.06, 18), flat(0xd8341f), 0, 0.72, 0));
      for (const [x, z] of [[0.4, 0.2], [-0.3, -0.35], [-0.2, 0.45]]) lesung.add(mesh(new THREE.SphereGeometry(0.3, 24, 16), flat(0xb9702f), x, 0.85, z));
      const antan = new THREE.Group();
      antan.add(mesh(new THREE.CylinderGeometry(0.2, 0.28, 2.6, 10), flat(0x8a8780), 0, 1.3, 0));
      antan.rotation.z = 0.35;
      shadowed(antan);
      const pop = popWord(3.2, 2.4);
      const pounder = new THREE.Group();
      pounder.add(mergeStatic(shadowed(lesung)), antan, pop.sprite);
      let hit = -1;
      anim(
        {
          group: pounder,
          update: (t) => {
            const k = (t * 0.9) % 1;
            const up = k < 0.6 ? Math.sin((k / 0.6) * Math.PI * 0.5) : 1 - (k - 0.6) / 0.4;
            antan.position.set(0.15, 0.6 + up * 1.1, 0);
            const beat = Math.floor(t * 0.9);
            if (k > 0.97 && beat !== hit) {
              hit = beat;
              if (beat % 3 === 0) pop.say("GEPUK!");
            }
            pop.update(t, 0, 0);
          },
        },
        0,
        4.4,
        0,
      );
      table(-3.1, 6.3, 0xf3e6d0, undefined, 3);
      table(3.4, 6.6, 0xf3e6d0, undefined, 4);
      diners(-3.1, 6.3, 2, ["PEDAS!!", "Level 3 pun dah menangis", "Sambal dia padu"], true);
      diners(3.4, 6.6, 4, ["Nak level 10 ke berani?", "Air! AIR!", "Sedap gila sambal ni"]);
      g.add(chalkboard(["LEVEL PEDAS", "1 · Bayi", "5 · Berani", "10 · Sepang"], 0.4, 7.4, -0.15));
      vendor({ skin: "#b97a52", top: "#2f8a4a", bottom: "#2a2730", cap: "#2f8a4a", hair: "#26222a", bag: "#000", carry: "none", apron: "#f2f0ea" }, ["GEPUK!", "Level berapa dik?", "Ayam panas!"]);
      light(0, 3, 4.5);
      break;
    }
    case "malatang": {
      g.add(
        shell(
          { wall: "#b8261f", trim: 0xe9b949, base: "#7a1a14", glass: "#ffcf8a", door: "#e9b949", awning: ["#e9b949", "#b8261f"] },
          "麻辣烫 MALATANG",
          "#7a1a14",
          "#ffd86a",
          "Pilih sendiri · bayar ikut berat",
        ),
      );
      // Pagoda eaves over the roof, with turned-up corners.
      const eave = mesh(new THREE.ConeGeometry(7.6, 1.2, 4, 1, true), flat(0xa8281e), 0, 5.05, 0);
      eave.rotation.y = Math.PI / 4;
      eave.scale.z = 0.66;
      g.add(eave);
      for (const [x, z] of [[-5.3, -3.5], [5.3, -3.5], [-5.3, 3.5], [5.3, 3.5]]) {
        const tip = mesh(new THREE.ConeGeometry(0.22, 0.7, 6), flat(0xe9b949), x, 4.75, z);
        tip.rotation.z = Math.sign(x) * -0.9;
        g.add(tip);
      }
      g.add(mesh(roundedBox(2.4, 0.22, 0.22), flat(0xe9b949), 0, 5.85, 0));
      // A big bowl on top, skewers sticking out and steam.
      const bowl = new THREE.Group();
      bowl.add(mesh(new THREE.LatheGeometry([[0, 0], [0.7, 0], [1.3, 0.5], [1.5, 1.1], [1.42, 1.12], [0, 0.9]].map(([x, y]) => new THREE.Vector2(x, y)), 18), flat(0xf8f6ee)));
      bowl.add(mesh(new THREE.CylinderGeometry(1.44, 1.44, 0.05, 18), flat(0xd8341f), 0, 1.0, 0));
      const r = rng(8);
      const bits = [0xffd23f, 0x7ac94a, 0xf2f0ea, 0xd98a5a, 0x5a3a22];
      for (let i = 0; i < 7; i++) {
        const an = (i / 7) * Math.PI * 2;
        const stick = mesh(new THREE.CylinderGeometry(0.03, 0.03, 1.8, 4), flat(0xd9b07a), Math.cos(an) * 0.6, 1.6, Math.sin(an) * 0.6);
        stick.rotation.set(Math.sin(an) * 0.3, 0, -Math.cos(an) * 0.3);
        bowl.add(stick);
        for (let k = 0; k < 3; k++) bowl.add(mesh(new THREE.SphereGeometry(0.13,20,14), flat(bits[Math.floor(r() * bits.length)]), Math.cos(an) * (0.66 + k * 0.1), 1.75 + k * 0.22, Math.sin(an) * (0.66 + k * 0.1)));
      }
      bowl.position.y = 5.95;
      g.add(bowl);
      anim(smoke(0, 7.3, 0, { n: 7, rise: 2.2, size: 1.1, color: 0xffffff, drift: 0.3, opacity: 0.4 }));
      // Red lanterns along the awning, swaying.
      const lanterns = new THREE.Group();
      const hung: THREE.Group[] = [];
      for (let i = 0; i < 4; i++) {
        const l = new THREE.Group();
        l.add(mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.4, 4), flat(0x3a2a20), 0, -0.2, 0));
        const body = mesh(new THREE.SphereGeometry(0.34,20,14), new THREE.MeshLambertMaterial({ color: 0xe3262e, emissive: 0xc0201a, emissiveIntensity: 0.7 }), 0, -0.65, 0);
        body.scale.y = 0.85;
        l.add(body, mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.08, 8), flat(0xe9b949), 0, -0.36, 0), mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.08, 8), flat(0xe9b949), 0, -0.94, 0));
        l.add(glow(0, -0.65, 0, 1.3, 0xff5a3a, 0.6));
        const baked = mergeStatic(l);
        baked.position.set(-3.6 + i * 2.4, 3.3, 4.05);
        lanterns.add(baked);
        hung.push(baked);
      }
      anim({ group: lanterns, update: (t) => hung.forEach((l, i) => (l.rotation.z = Math.sin(t * 1.3 + i) * 0.12)) });
      // Self-pick fridge and the weighing scale (Qish can step on it).
      const fridge = new THREE.Group();
      fridge.add(mesh(roundedBox(2.2, 1.9, 0.7), flat(0xd9dde4), 0, 0.95, 0));
      fridge.add(mesh(roundedBox(2.0, 1.6, 0.05), new THREE.MeshBasicMaterial({ color: 0xdff4ff }), 0, 1.0, 0.36));
      for (let row = 0; row < 3; row++) for (let i = 0; i < 6; i++) fridge.add(mesh(roundedBox(0.22, 0.16, 0.1), flat(bits[(row * 6 + i) % bits.length]), -0.8 + i * 0.32, 0.5 + row * 0.5, 0.42));
      fridge.position.set(-3.3, 0, 3.6);
      g.add(fridge);
      boxes.push(...box(-3.3, 3.6, 2.2, 0.7, 1));
      const scale = new THREE.Group();
      scale.add(mesh(roundedBox(0.8, 0.9, 0.6), flat(0xf2f0ea), 0, 0.45, 0));
      scale.add(mesh(roundedBox(0.7, 0.04, 0.5), flat(0xb9c0c8), 0, 0.92, 0));
      const dial = sign("80.0kg", 0.62, 0.28, "#1d2a22", "#7dff9a");
      dial.position.set(0, 0.62, 0.31);
      scale.add(dial);
      scale.position.set(-0.6, 0, 4.0);
      g.add(scale);
      boxes.push(...box(-0.6, 4.0, 0.8, 0.6, 1));
      table(-3.1, 6.6, 0xf2f0ea, undefined, 5);
      table(3.5, 6.8, 0xf2f0ea, undefined, 6);
      diners(-3.1, 6.6, 3, ["Mala level sederhana je", "Kuah dia sampai ke jiwa", "Saya ambil fishball je 30 biji"], true);
      diners(3.5, 6.8, 6, ["Berapa gram saya ambil ni...", "Pedas tapi sedap", "Mi kaca!!"]);
      vendor({ skin: "#f0c8a8", top: "#b8261f", bottom: "#2a2730", hair: "#1c1a20", bag: "#000", carry: "none", apron: "#f2f0ea" }, ["Ambil mangkuk, pilih sendiri!", "Timbang sini ya!", "Mala ka tomato?"]);
      light(0, 3, 4.6, 0xff7a4a);
      break;
    }
    case "dubuyo": {
      g.add(
        shell(
          { wall: "#24222b", trim: 0xe3262e, base: "#e3262e", glass: "#ffb27a", door: "#e3262e", awning: ["#e3262e", "#24222b"] },
          "DUBUYO",
          "#24222b",
          "#ff4a3a",
          "Korean Spicy Ramen 🔥",
        ),
      );
      // Giant ramen pot, chopsticks lifting the noodles up and down.
      const pot = new THREE.Group();
      pot.add(mesh(new THREE.CylinderGeometry(1.4, 1.3, 1.1, 20), flat(0x1d1b22), 0, 0.55, 0));
      pot.add(mesh(new THREE.TorusGeometry(1.4, 0.1, 6, 24), flat(0xe3262e), 0, 1.1, 0).rotateX(Math.PI / 2));
      pot.add(mesh(new THREE.CylinderGeometry(1.32, 1.32, 0.05, 20), flat(0xe8501f), 0, 1.02, 0));
      for (const sx of [-1, 1]) pot.add(mesh(roundedBox(0.5, 0.12, 0.2), flat(0x1d1b22), sx * 1.55, 0.9, 0));
      pot.add(mesh(new THREE.SphereGeometry(0.28,20,14, 0, Math.PI * 2, 0, Math.PI / 2), flat(0xfff3d6), 0.6, 1.02, 0.3));
      pot.add(mesh(new THREE.SphereGeometry(0.16,20,14), flat(0xffb321), 0.6, 1.05, 0.3));
      const potBaked = mergeStatic(shadowed(pot));
      const lift = new THREE.Group();
      const noodle = flat(0xf6d27a);
      for (let i = 0; i < 6; i++) {
        const curve = new THREE.CatmullRomCurve3([0, 0.3, 0.6, 0.9, 1.2].map((y, k) => new THREE.Vector3(Math.sin(k * 1.7 + i) * 0.08 + (i - 2.5) * 0.06, y, Math.cos(k * 1.3 + i) * 0.05)));
        lift.add(mesh(new THREE.TubeGeometry(curve, 10, 0.035, 4), noodle));
      }
      for (const sx of [-0.05, 0.05]) {
        const stick = mesh(new THREE.CylinderGeometry(0.03, 0.02, 1.6, 5), flat(0x8a5a32), sx, 1.6, 0);
        stick.rotation.z = sx * 2;
        lift.add(stick);
      }
      const liftBaked = mergeStatic(shadowed(lift));
      const topper = new THREE.Group();
      topper.add(potBaked, liftBaked);
      anim(
        {
          group: topper,
          update: (t) => {
            const k = (Math.sin(t * 1.2) + 1) / 2;
            liftBaked.position.y = 0.7 + k * 0.9;
          },
        },
        0,
        4.42,
        0,
      );
      anim(smoke(0, 6.1, 0, { n: 7, rise: 2, size: 1.0, color: 0xffffff, drift: 0.2, opacity: 0.4 }));
      anim(neonSign("LEVEL 🔥5", 0, 0, 0, "#ff3b30", 2.6, 0.7), 3.6, 2.0, 3.12);
      table(-3.1, 6.4, 0x2a2730, undefined, 7);
      table(3.5, 6.8, 0x2a2730, undefined, 8);
      diners(-3.1, 6.4, 5, ["Level 2 pun dah berpeluh", "Hah... hah... sedap", "Air susu mana air susu"], true);
      diners(3.5, 6.8, 1, ["Level 5 challenge, record saya!", "Bibir saya dah kebas", "Ramen dengan keju best"]);
      // A queue of three.
      for (let i = 1; i < 3; i++) {
        const [x, z] = at(2.0 + 0.2 * i, 4.6 + i * 0.85);
        crowd.push({ x, z, look: look(i + 2, "phone"), mode: "queue", back: true, lines: ["Lama lagi ke?", "Bau dia sampai sini", "Level berapa nak ambil ni"] });
      }
      g.add(chalkboard(["CABARAN", "LEVEL 5", "Habis =", "gambar free!"], -0.4, 7.3, 0.1));
      vendor({ skin: "#c98c64", top: "#24222b", bottom: "#2a2730", cap: "#e3262e", hair: "#26222a", bag: "#000", carry: "none", apron: "#e3262e" }, ["Annyeong! Level berapa?", "Ramen ready!", "Masuk masuk!"]);
      light(0, 3, 4.6, 0xff6a4a);
      break;
    }
    case "mcd": {
      g.add(
        shell(
          {
            wall: "#d52b1e",
            trim: 0xffc72c,
            base: "#ffc72c",
            glass: "#fff0b8",
            door: "#ffc72c",
            awning: ["#ffc72c", "#d52b1e"],
            inside: (c, x, y, w, h) => {
              // Menu boards glowing behind the counter.
              c.fillStyle = "#2a2730";
              c.fillRect(x + w * 0.1, y + 8, w * 0.8, h * 0.22);
              c.fillStyle = "#ffc72c";
              for (let i = 0; i < 4; i++) c.fillRect(x + w * (0.14 + i * 0.19), y + 14, w * 0.14, h * 0.12);
            },
          },
          "McDonald's",
          "#d52b1e",
          "#ffc72c",
          "i'm lovin' it",
        ),
      );
      // The golden arches up on a tall pylon by the corner.
      const pylon = new THREE.Group();
      pylon.add(mesh(roundedBox(0.5, 6.4, 0.5), flat(0xd52b1e), 0, 3.2, 0));
      const boardM = mesh(roundedBox(2.8, 2.2, 0.35), flat(0xd52b1e), 0, 6.9, 0);
      pylon.add(boardM);
      const gold = new THREE.MeshLambertMaterial({ color: 0xffc72c, emissive: 0xffb300, emissiveIntensity: 0.8 });
      for (const sx of [-1, 1]) {
        const arch = new THREE.CatmullRomCurve3([
          new THREE.Vector3(sx * 1.1, -0.85, 0),
          new THREE.Vector3(sx * 0.95, 0.2, 0),
          new THREE.Vector3(sx * 0.55, 0.85, 0),
          new THREE.Vector3(sx * 0.18, 0.2, 0),
          new THREE.Vector3(0, -0.3, 0),
        ]);
        for (const fz of [0.2, -0.2]) pylon.add(mesh(new THREE.TubeGeometry(arch, 20, 0.13, 6), gold, 0, 6.9, fz));
      }
      pylon.add(glow(0, 6.9, 0.5, 4.5, 0xffc72c, 0.45));
      pylon.position.set(5.8, 0, 3.4);
      g.add(pylon);
      boxes.push(...box(5.8, 3.4, 0.6, 0.6, 1));
      // Drive-thru round the side: a car waiting at the window, and the menu board.
      const car = new THREE.Group();
      car.add(mesh(roundedBox(1.5, 0.55, 3), flat(0x7a5ad6), 0, 0.5, 0));
      car.add(mesh(roundedBox(1.32, 0.5, 1.6), flat(0x2b3a4f), 0, 1.0, -0.1));
      for (const sx of [-0.72, 0.72]) for (const sz of [-0.9, 0.9]) {
        const w = mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.22, 10), flat(0x1b1b20), sx, 0.3, sz);
        w.rotation.z = Math.PI / 2;
        car.add(w);
      }
      car.position.set(-6.7, 0, -0.8);
      g.add(car);
      boxes.push(...box(-6.7, -0.8, 1.5, 3, 2));
      const menu = sign("DRIVE-THRU ↑", 1.4, 0.9, "#ffc72c", "#d52b1e");
      menu.position.set(-6.9, 1.4, 2.2);
      g.add(menu, mesh(roundedBox(0.1, 1.0, 0.1), flat(0x3a3a40), -6.9, 0.5, 2.15));
      // Giant fries by the door.
      const fries = new THREE.Group();
      fries.add(mesh(new THREE.CylinderGeometry(0.62, 0.45, 1.2, 4), flat(0xd52b1e), 0, 0.6, 0).rotateY(Math.PI / 4));
      for (let i = 0; i < 12; i++) fries.add(mesh(roundedBox(0.1, 0.9, 0.1), flat(0xffd23f), -0.35 + (i % 6) * 0.14, 1.3 + Math.sin(i) * 0.1, i < 6 ? -0.1 : 0.12).rotateZ(Math.sin(i * 2.3) * 0.12));
      fries.position.set(-3.6, 0, 3.9);
      g.add(fries);
      boxes.push(...box(-3.6, 3.9, 1.0, 1.0, 1));
      table(-3.1, 6.4, 0xffc72c, undefined, 9);
      table(3.0, 6.9, 0xffc72c, [0xd52b1e, 0xffc72c], 10);
      diners(-3.1, 6.4, 8, ["Fries panas!!", "Nak Happy Meal lagi", "Aiskrim cone RM1 je"], true);
      diners(3.0, 6.9, 0, ["McFlurry Oreo terbaik", "Ayam goreng spicy please", "Sos cili lagi satu"]);
      vendor({ skin: "#e3ad86", top: "#d52b1e", bottom: "#2a2730", hijab: "#2a2730", bag: "#000", carry: "none", cap: "#ffc72c" }, ["Welcome to McDonald's!", "Upsize, kak?", "Nak air apa?"]);
      light(0, 3, 4.6, 0xffd27a);
      break;
    }
    case "salai": {
      // A kampung stall instead of a shop: plank back wall, posts, zinc roof, open front.
      const plank = canvasTexture(256, 128, (c) => {
        c.fillStyle = "#8a5a32";
        c.fillRect(0, 0, 256, 128);
        c.fillStyle = "#6e4526";
        for (let y = 0; y < 128; y += 16) c.fillRect(0, y, 256, 3);
        c.fillStyle = "rgba(0,0,0,.12)";
        for (let i = 0; i < 18; i++) c.fillRect((i * 47) % 256, ((i * 29) % 8) * 16 + 3, 3, 13);
      });
      plank.wrapS = plank.wrapT = THREE.RepeatWrapping;
      plank.repeat.set(3, 2);
      const wood = new THREE.MeshLambertMaterial({ map: plank });
      g.add(mesh(roundedBox(W, 3.2, 0.25), wood, 0, 1.6, -D / 2 + 0.2));
      for (const sx of [-1, 1]) g.add(mesh(roundedBox(0.25, 3.2, D - 0.4), wood, sx * (W / 2 - 0.15), 1.6, 0));
      for (const x of [-4.8, -1.6, 1.6, 4.8]) g.add(mesh(new THREE.CylinderGeometry(0.12, 0.14, 3.4, 6), flat(0x6e4526), x, 1.7, D / 2 - 0.2));
      const zinc = canvasTexture(128, 128, (c) => {
        c.fillStyle = "#a9b0b4";
        c.fillRect(0, 0, 128, 128);
        for (let x = 0; x < 128; x += 10) {
          c.fillStyle = "#8f979c";
          c.fillRect(x, 0, 4, 128);
        }
        c.fillStyle = "rgba(150,80,40,.35)";
        c.fillRect(20, 60, 30, 40);
        c.fillRect(84, 10, 20, 26);
      });
      zinc.wrapS = zinc.wrapT = THREE.RepeatWrapping;
      zinc.repeat.set(4, 1);
      // A lean-to: the zinc only covers the back half, so the counter and the meat show from above.
      const roof = mesh(roundedBox(W + 1.4, 0.08, 3.6), new THREE.MeshLambertMaterial({ map: zinc }), 0, 3.75, -1.4);
      roof.rotation.x = 0.24;
      g.add(roof);
      const sg = sign("DAGING SALAI", 6.4, 1.2, "#f6e7c4", "#7a2e1f", "Masak lemak cili api", "'Gaegu', sans-serif");
      sg.position.set(0, 3.25, D / 2 + 0.4);
      sg.rotation.x = -0.1;
      g.add(sg);
      // Counter with banana leaves, smoked meat on a rack, firewood.
      g.add(mesh(roundedBox(6, 1.0, 1), wood, 0.6, 0.5, 1.6));
      g.add(mesh(roundedBox(6, 0.04, 1), flat(0x4f9a3a), 0.6, 1.02, 1.6));
      const meat = flat(0x5a2a18);
      for (let i = 0; i < 9; i++) g.add(mesh(roundedBox(0.28, 0.7 + (i % 3) * 0.12, 0.08), meat, -1.8 + i * 0.6, 2.3, -0.6));
      g.add(mesh(new THREE.CylinderGeometry(0.04, 0.04, 6, 5), flat(0x3a2a20), 0.6, 2.75, -0.6).rotateZ(Math.PI / 2));
      for (let i = 0; i < 8; i++) g.add(mesh(new THREE.CylinderGeometry(0.13, 0.13, 1.4, 6), flat(0x7a4f2a), -4.2 + (i % 4) * 0.28, 0.14 + Math.floor(i / 4) * 0.25, -1.8).rotateX(Math.PI / 2));
      // Three smoking drums out front.
      for (const [x, z] of [[-4.0, 3.9], [-3.0, 4.4], [-4.3, 5.0]]) {
        g.add(mesh(new THREE.CylinderGeometry(0.45, 0.45, 1.0, 12), flat(0x26262c), x, 0.5, z));
        g.add(mesh(new THREE.CylinderGeometry(0.48, 0.48, 0.08, 12), flat(0x3a3a40), x, 1.04, z));
        g.add(glow(x, 0.25, z + 0.4, 0.9, 0xff6a2a, 0.75));
        anim(smoke(0, 1.1, 0, { n: 9, rise: 4.2, size: 1.4, color: 0xcfc6bc, drift: 1.1, opacity: 0.5 }), x, 0, z);
        boxes.push(...box(x, z, 1.0, 1.0, 1));
      }
      // Long table with benches.
      const long = new THREE.Group();
      long.add(mesh(roundedBox(3.4, 0.08, 1.0), wood, 0, 0.78, 0));
      for (const sx of [-1.5, 1.5]) long.add(mesh(roundedBox(0.1, 0.78, 0.9), wood, sx, 0.39, 0));
      for (const sz of [-0.85, 0.85]) long.add(mesh(roundedBox(3.4, 0.08, 0.35), wood, 0, 0.45, sz));
      for (let i = 0; i < 3; i++) long.add(mesh(new THREE.CylinderGeometry(0.22, 0.18, 0.05, 10), flat(0xf4f1e6), -1 + i, 0.84, 0), mesh(new THREE.SphereGeometry(0.13, 24, 16), flat(i % 2 ? 0xf2c14b : 0x5a2a18), -1 + i, 0.9, 0));
      long.position.set(2.6, 0, 6.4);
      g.add(long);
      boxes.push(...box(2.6, 6.4, 3.4, 1.0, 2));
      for (const [lx, lz, i] of [[1.8, 5.55, 4], [3.4, 5.55, 9], [2.6, 7.25, 1]] as const) {
        const [x, z] = at(lx, lz);
        crowd.push({ x, z, look: look(i), mode: "eat", seated: true, back: lz < 6.4, lines: ["Masak lemak cili api ni... fuh", "Nasi tambah!", "Bau asap pun dah kenyang"] });
      }
      table(-3.1, 6.6, 0xf6e7c4, undefined, 11);
      vendor({ skin: "#b97a52", top: "#f2f0ea", bottom: "#4a4a55", hair: "#26222a", kufi: "#f2f0ea", beard: true, bag: "#000", carry: "none", apron: "#7a4a2a" }, ["Salai pagi tadi, dik!", "Sekilo ke setengah?", "Cili api cukup?"]);
      light(0, 2.8, 2.4, 0xff9a4a, 22);
      break;
    }
    case "cookies": {
      g.add(
        shell(
          {
            wall: "#ffd6e0",
            trim: 0x7a4a2a,
            base: "#7a4a2a",
            glass: "#ffe9c9",
            door: "#7a4a2a",
            awning: ["#7a4a2a", "#ffd6e0"],
            inside: (c, x, y, w, h) => {
              // Jars of cookies on the shelf.
              for (let i = 0; i < 4; i++) {
                const cx = x + w * (0.15 + i * 0.23);
                c.fillStyle = "rgba(220,240,255,.8)";
                c.fillRect(cx - 14, y + h * 0.2, 28, 34);
                c.fillStyle = "#e0a352";
                c.beginPath();
                c.arc(cx, y + h * 0.2 + 24, 10, 0, Math.PI * 2);
                c.fill();
              }
            },
          },
          "COOKIES",
          "#7a4a2a",
          "#ffe9c9",
          "Fresh dari oven, panas-panas",
        ),
      );
      // Keep the COOKIES banner clear; roof decorations stay above the parapet.
      // Giant cookie standing on the roof, turning.
      const cookie = new THREE.Group();
      const disc = mesh(new THREE.CylinderGeometry(1.7, 1.7, 0.35, 28), flat(0xe0a352), 0, 0, 0);
      disc.rotation.x = Math.PI / 2;
      cookie.add(disc);
      const r = rng(13);
      for (let i = 0; i < 16; i++) {
        const an = r() * Math.PI * 2;
        const d = 0.3 + r() * 1.2;
        for (const sz of [-1, 1]) cookie.add(mesh(new THREE.SphereGeometry(0.14, 24, 16), flat(0x4a2a17), Math.cos(an) * d, Math.sin(an) * d, sz * 0.18));
      }
      const cookieBaked = mergeStatic(shadowed(cookie));
      const turn = new THREE.Group();
      turn.add(cookieBaked, mesh(new THREE.CylinderGeometry(0.08, 0.08, 1.2, 6), flat(0x5a3220), 0, -1.4, 0));
      cookieBaked.position.y = 0.6;
      anim({ group: turn, update: (t) => (cookieBaked.rotation.y = t * 0.6) }, 0, 6.3, 0);
      // The big jar by the door.
      const jar = new THREE.Group();
      jar.add(mesh(new THREE.CylinderGeometry(0.7, 0.7, 1.4, 16), new THREE.MeshLambertMaterial({ color: 0xdff4ff, transparent: true, opacity: 0.4 }), 0, 0.7, 0));
      jar.add(mesh(new THREE.CylinderGeometry(0.74, 0.74, 0.2, 16), flat(0xd94a6a), 0, 1.5, 0));
      for (let i = 0; i < 9; i++) jar.add(mesh(new THREE.CylinderGeometry(0.28, 0.28, 0.08, 10), flat(0xe0a352), Math.sin(i * 2.4) * 0.3, 0.2 + i * 0.12, Math.cos(i * 2.4) * 0.3).rotateX(1.1 + i));
      jar.position.set(-3.6, 0, 3.8);
      g.add(jar);
      boxes.push(...box(-3.6, 3.8, 1.4, 1.4, 1));
      table(-3.1, 6.6, 0xfff6f8, undefined, 12);
      table(3.6, 6.9, 0xfff6f8, [0xff8fb1, 0xfff6f8], 13);
      diners(3.6, 6.9, 2, ["Cookies dengan susu sejuk!", "Choc chip terbaik", "Rangup luar lembut dalam"]);
      for (let i = 0; i < 2; i++) {
        const [x, z] = at(1.0 - i * 0.2, 4.6 + i * 0.85);
        crowd.push({ x, z, look: look(i + 6, "phone"), mode: "queue", back: true, lines: ["Bau dia!!", "Nak satu balang", "Sabar, sabar..."] });
      }
      vendor({ skin: "#ecc0a0", top: "#ffd6e0", bottom: "#2a2730", hijab: "#7a4a2a", bag: "#000", carry: "none", apron: "#fff6f8" }, ["Cookies panas!", "Nak rasa satu?", "Baru keluar oven!"]);
      light(0, 3, 4.6, 0xffc0a0);
      break;
    }
  }
  g.add(pool(0, 4.6, 3.4));
  placeAt(g, a, R, out);
  const statics = new THREE.Group();
  statics.add(shadowed(g));
  return { statics, anims, boxes, crowd, lights, plates };
}

/** Sign up where people can stand and look at the whole city: a map of every place to eat. */
export function cityMap(a: number, r: number) {
  const g = new THREE.Group();
  const tex = canvasTexture(512, 400, (c) => {
    c.fillStyle = "#fff6e0";
    c.fillRect(0, 0, 512, 400);
    c.strokeStyle = INK;
    c.lineWidth = 10;
    c.strokeRect(5, 5, 502, 390);
    c.fillStyle = INK;
    c.textAlign = "center";
    c.font = "bold 40px 'Bagel Fat One', sans-serif";
    c.fillText("PETA NYOMNYOM", 256, 52);
    // The pizza: slices, crust, Cosy Place in the middle.
    const cx = 256;
    const cy = 225;
    c.fillStyle = "#e0a050";
    c.beginPath();
    c.arc(cx, cy, 150, 0, Math.PI * 2);
    c.fill();
    c.fillStyle = "#fbe9b4";
    c.beginPath();
    c.arc(cx, cy, 132, 0, Math.PI * 2);
    c.fill();
    c.strokeStyle = "#c4553a";
    c.lineWidth = 7;
    for (let i = 0; i < 8; i++) {
      c.beginPath();
      c.moveTo(cx + Math.cos(i * 45 * DEG) * 40, cy + Math.sin(i * 45 * DEG) * 40);
      c.lineTo(cx + Math.cos(i * 45 * DEG) * 132, cy + Math.sin(i * 45 * DEG) * 132);
      c.stroke();
    }
    c.fillStyle = "#3d3f48";
    c.beginPath();
    c.arc(cx, cy, 44, 0, Math.PI * 2);
    c.fill();
    c.fillStyle = "#f3ebdd";
    c.beginPath();
    c.arc(cx, cy, 30, 0, Math.PI * 2);
    c.fill();
    c.fillStyle = INK;
    c.font = "bold 17px 'Gaegu', sans-serif";
    c.fillText("Cosy", cx, cy - 2);
    c.fillText("Place", cx, cy + 14);
    const labels: [number, string][] = [[112.5, "🥭"], [157.5, "P"], [202.5, "🍗"], [247.5, "🍢"], [292.5, "🍜"], [337.5, "🍟"], [22.5, "🥩"], [67.5, "🍪"]];
    c.font = "bold 34px sans-serif";
    for (const [deg, l] of labels) c.fillText(l, cx + Math.cos(deg * DEG) * 92, cy + Math.sin(deg * DEG) * 92 + 12);
    c.fillStyle = "#e3262e";
    c.beginPath();
    c.arc(cx + Math.cos(ENTRY_A) * 150, cy + Math.sin(ENTRY_A) * 150, 9, 0, Math.PI * 2);
    c.fill();
    c.font = "bold 20px 'Gaegu', sans-serif";
    c.fillText("ANDA DI SINI", cx + 150, cy + 165);
  });
  const face = new THREE.MeshLambertMaterial({ map: tex, emissive: 0x332211, emissiveIntensity: 0.3 });
  const wood = flat(0x6b4f2a);
  g.add(mesh(roundedBox(2.6, 2.0, 0.12), [wood, wood, wood, wood, face, wood], 0, 1.9, 0));
  for (const sx of [-1.1, 1.1]) g.add(mesh(roundedBox(0.12, 1.0, 0.12), wood, sx, 0.5, 0));
  // Facing the camera (south) whatever slice it stands in, so it can be read.
  const [x, z] = polar(r, a);
  g.position.set(x, 0, z);
  return shadowed(g);
}

/** Bake a slice's statics (it is a lot of little meshes). */
export const bakeShop = (b: ShopBuild) => mergeStatic(b.statics);
