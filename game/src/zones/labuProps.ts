import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { sfx } from "../core/sfx";
import { canvasTexture, cloudCrown, flat, gableWall, leafBlade, pitchedRoof, roofTileMaterial, roundedBox, signTexture } from "../overworld/props";
import { PAL } from "../overworld/style";
import { painted, paintedMat } from "../overworld/textures";
import { frontZ, model, modelBox, type ModelId } from "../overworld/models";
import { paintedCoat } from "./cats";
import type { Box } from "../overworld/zone";
import { shadowed } from "./common";

// Kampung Labu Lanjut: the props and the small animated life (chickens, a cat, laundry,
// ducks, butterflies, birds, drifting cloud shadows) that make Qish's home village feel lived in.

const INK = "#17151f";

export interface Anim {
  group: THREE.Group;
  update: (t: number) => void;
}

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

function planks(base: string, line: string, repeat: [number, number]) {
  const t = canvasTexture(128, 128, (g) => {
    g.fillStyle = base;
    g.fillRect(0, 0, 128, 128);
    g.fillStyle = line;
    for (let y = 0; y < 128; y += 16) g.fillRect(0, y, 128, 2);
    g.fillStyle = "rgba(0,0,0,.06)";
    for (let i = 0; i < 10; i++) g.fillRect((i * 53) % 128, ((i * 37) % 8) * 16 + 2, 2, 14);
  });
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(...repeat);
  return t;
}

function stripes(a: string, b: string, n: number) {
  return canvasTexture(128, 128, (g) => {
    const w = 128 / n;
    for (let i = 0; i < n; i++) {
      g.fillStyle = i % 2 ? b : a;
      g.fillRect(i * w, 0, w, 128);
    }
  });
}

/** Worn kampung tar for a road `len` long (runs along z). */
export function tarTexture(len: number) {
  const t = canvasTexture(128, 256, (c) => {
    c.fillStyle = "#8d8893";
    c.fillRect(0, 0, 128, 256);
    for (let i = 0; i < 700; i++) {
      c.fillStyle = Math.random() > 0.5 ? "rgba(255,255,255,.07)" : "rgba(0,0,0,.08)";
      c.fillRect(Math.random() * 128, Math.random() * 256, 2, 2);
    }
    // Patched potholes and a faint tyre track either side.
    c.fillStyle = "rgba(30,30,36,.12)";
    c.fillRect(22, 40, 26, 18);
    c.fillRect(80, 170, 30, 22);
    c.fillStyle = "rgba(255,255,255,.035)";
    c.fillRect(26, 0, 14, 256);
    c.fillRect(88, 0, 14, 256);
  });
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(1, len / 10);
  return t;
}

/** Stand a generated model at (x, z), turned a little by `seed` (plants) so copies differ. */
function placed(g: THREE.Group, x: number, z: number, seed: number, turn = true) {
  g.position.set(x, 0, z);
  if (turn) g.rotation.y = (seed * 2.399) % (Math.PI * 2);
  return g;
}

// ---------------------------------------------------------------- plants

export function mangoTree(x: number, z: number, seed = 0) {
  const gen = model("mango", 5.4 + (seed % 3) * 0.2, "height");
  if (gen) return placed(gen, x, z, seed);
  const g = new THREE.Group();
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.4, 2.4, 14), flat(PAL.trunk));
  trunk.position.y = 1.2;
  g.add(trunk);
  const crown = cloudCrown(1.65, [PAL.leaf, PAL.leafDeep, PAL.leafLight], seed);
  crown.position.y = 3.4;
  g.add(crown);
  for (let i = 0; i < 11; i++) {
    const a = (i / 11) * Math.PI * 2 + seed;
    const mango = new THREE.Mesh(new THREE.SphereGeometry(0.15, 12, 10), flat(i % 3 ? 0xffb53f : 0xa6d24a));
    mango.scale.set(1, 1.3, 1);
    mango.position.set(Math.cos(a) * 1.55, 2.45 + Math.sin(i * 1.9) * 0.3, Math.sin(a) * 1.45 + 0.2);
    g.add(mango);
  }
  g.position.set(x, 0, z);
  return shadowed(g);
}

export function bananaTree(x: number, z: number, seed = 0) {
  const gen = model("banana", 3.3 + (seed % 3) * 0.15, "height");
  if (gen) return placed(gen, x, z, seed);
  const g = new THREE.Group();
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.26, 1.9, 12), flat(0x8fa354));
  trunk.position.y = 0.95;
  g.add(trunk);
  const light = flat(PAL.leafLight);
  const dark = flat(PAL.leaf);
  for (const m of [light, dark]) m.side = THREE.DoubleSide;
  for (let i = 0; i < 7; i++) {
    const pivot = new THREE.Group();
    pivot.position.y = 1.85;
    pivot.rotation.y = (i / 7) * Math.PI * 2 + seed;
    const leaf = leafBlade(2.2, 0.75, 0.9, i % 2 ? light : dark, 0.45);
    leaf.rotation.x = -0.75 - (i % 3) * 0.2;
    pivot.add(leaf);
    g.add(pivot);
  }
  const bunch = new THREE.Mesh(new THREE.CapsuleGeometry(0.15, 0.3, 4, 10), flat(0xd8e05a));
  bunch.position.set(0.25, 1.45, 0.15);
  g.add(bunch);
  g.position.set(x, 0, z);
  g.rotation.y = seed;
  return shadowed(g);
}

/** Oil palm (kelapa sawit): short fat trunk, a big drooping crown. Labu Lanjut is ringed with them. */
export function oilPalm(x: number, z: number, seed = 0, scale = 1) {
  const gen = model("oilpalm", 4.6 * scale, "height");
  if (gen) return placed(gen, x, z, seed);
  const g = new THREE.Group();
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.48, 1.9, 12), flat(0x7a5e40));
  trunk.position.y = 0.95;
  g.add(trunk);
  const dark = flat(PAL.leafDeep);
  const light = flat(PAL.leaf);
  for (const m of [dark, light]) m.side = THREE.DoubleSide;
  for (let i = 0; i < 12; i++) {
    const pivot = new THREE.Group();
    pivot.position.y = 1.85;
    pivot.rotation.y = (i / 12) * Math.PI * 2 + seed;
    const frond = leafBlade(2.9, 0.62, 1.4, i % 2 ? dark : light, 0.55);
    frond.rotation.x = -0.55 - (i % 3) * 0.22;
    pivot.add(frond);
    g.add(pivot);
  }
  const fruit = new THREE.Mesh(new THREE.SphereGeometry(0.3, 12, 10), flat(0x8a2f22));
  fruit.position.set(0.3, 1.75, 0.2);
  g.add(fruit);
  g.position.set(x, 0, z);
  g.scale.setScalar(scale);
  return shadowed(g);
}

export function pottedFlower(x: number, z: number, color = 0xff5fa2) {
  const gen = model("pot", 1.15, "height");
  if (gen) return placed(gen, x, z, x * 3.1 + color);
  const g = new THREE.Group();
  const pot = new THREE.Mesh(
    new THREE.LatheGeometry([new THREE.Vector2(0, 0), new THREE.Vector2(0.24, 0), new THREE.Vector2(0.31, 0.42), new THREE.Vector2(0.37, 0.46), new THREE.Vector2(0.37, 0.54), new THREE.Vector2(0.3, 0.54)], 18),
    flat(PAL.terracotta),
  );
  const leafy = new THREE.Mesh(new THREE.SphereGeometry(0.42, 16, 12), flat(PAL.leaf));
  leafy.position.y = 0.82;
  leafy.scale.y = 0.85;
  g.add(pot, leafy);
  for (let i = 0; i < 9; i++) {
    const a = i * 2.4;
    const f = new THREE.Mesh(new THREE.SphereGeometry(0.1, 10, 8), flat(color));
    f.position.set(Math.cos(a) * 0.34, 0.8 + Math.sin(i * 1.7) * 0.22, Math.sin(a) * 0.34);
    g.add(f);
  }
  g.position.set(x, 0, z);
  return shadowed(g);
}

/** Two crossed upright quads, `h` tall, standing on y = 0. Normals point up so they light like the
 * ground they grow from rather than flaring as the camera passes. */
function crossedQuad(h: number) {
  const a = new THREE.PlaneGeometry(h, h);
  a.translate(0, h / 2, 0);
  const b = a.clone().rotateY(Math.PI / 2);
  const geo = mergeGeometries([a, b])!;
  const n = geo.attributes.normal as THREE.BufferAttribute;
  for (let i = 0; i < n.count; i++) n.setXYZ(i, 0, 1, 0);
  return geo;
}

/** Painted grass clumps and wildflower clumps (art/sprites) scattered over the open ground,
 * skipping roads and buildings. Falls back to little cones if the sprites did not load. */
export function meadow(area: Box, avoid: Box[], tufts = 520, flowers = 170) {
  const g = new THREE.Group();
  const inAvoid = (x: number, z: number) => avoid.some(([x0, z0, x1, z1]) => x > x0 && x < x1 && z > z0 && z < z1);
  const spot = () => {
    for (let k = 0; k < 20; k++) {
      const x = area[0] + Math.random() * (area[2] - area[0]);
      const z = area[1] + Math.random() * (area[3] - area[1]);
      if (!inAvoid(x, z)) return [x, z] as const;
    }
    return null;
  };
  const m = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  const c = new THREE.Color();
  const scatter = (mesh: THREE.InstancedMesh, n: number, size: [number, number], tints: number[]) => {
    for (let i = 0; i < n; i++) {
      const p = spot() ?? [0, -999];
      const s = size[0] + Math.random() * (size[1] - size[0]);
      q.setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.random() * Math.PI);
      m.compose(new THREE.Vector3(p[0], 0, p[1]), q, new THREE.Vector3(s, s, s));
      mesh.setMatrixAt(i, m);
      mesh.setColorAt(i, c.setHex(tints[i % tints.length]));
    }
    mesh.receiveShadow = true;
    g.add(mesh);
  };
  const sprite = (name: "tuft" | "flowers") => {
    const map = painted(name, 1, 1, 1);
    if (!map) return null;
    map.wrapS = map.wrapT = THREE.ClampToEdgeWrapping;
    return new THREE.MeshLambertMaterial({ map, alphaTest: 0.45, side: THREE.DoubleSide });
  };
  const tuftMat = sprite("tuft");
  const flowerMat = sprite("flowers");
  if (tuftMat && flowerMat) {
    scatter(new THREE.InstancedMesh(crossedQuad(1), tuftMat, tufts), tufts, [0.45, 0.8], [0xffffff, 0xeef7dc, 0xf6ffe8, 0xe2efd0]);
    scatter(new THREE.InstancedMesh(crossedQuad(1), flowerMat, Math.round(flowers * 0.6)), Math.round(flowers * 0.6), [0.5, 0.75], [0xffffff]);
    return g;
  }
  scatter(new THREE.InstancedMesh(new THREE.ConeGeometry(0.09, 0.34, 5).translate(0, 0.17, 0), new THREE.MeshLambertMaterial(), tufts), tufts, [0.6, 1.4], [0x7aae58, 0x6fa34f, 0x86b862, 0x689c4b]);
  return g;
}

export function fallingLeaves(x: number, z: number, top: number, n = 7): Anim {
  const g = new THREE.Group();
  const leaves = Array.from({ length: n }, (_, i) => {
    const leaf = new THREE.Mesh(new THREE.PlaneGeometry(0.2, 0.12), new THREE.MeshLambertMaterial({ color: i % 3 ? 0x6aa840 : 0xe0b84a, side: THREE.DoubleSide }));
    g.add(leaf);
    return { leaf, phase: i / n + Math.random() * 0.1, ox: (Math.random() - 0.5) * 2.6, oz: (Math.random() - 0.5) * 2 };
  });
  g.position.set(x, 0, z);
  const update = (t: number) => {
    for (const l of leaves) {
      const k = (t * 0.12 + l.phase) % 1;
      l.leaf.position.set(l.ox + Math.sin(t * 1.6 + l.phase * 9) * 0.5, top * (1 - k), l.oz + k * 1.2);
      l.leaf.rotation.set(t * 2 + l.phase * 6, t * 1.3, Math.sin(t * 2 + l.phase) * 0.8);
      l.leaf.visible = k < 0.97;
    }
  };
  return { group: g, update };
}

/** Pokok hujan-hujan: a big umbrella-shaped shade tree for the padang. */
export function rainTree(x: number, z: number, seed = 0) {
  const gen = model("raintree", 5.6, "height");
  if (gen) {
    gen.scale.x = gen.scale.z = 1.15;
    return placed(gen, x, z, seed);
  }
  const g = new THREE.Group();
  const bark = flat(0x7d5a3e);
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.58, 2.9, 14), bark);
  trunk.position.y = 1.45;
  g.add(trunk);
  for (let i = 0; i < 3; i++) {
    const a = (i / 3) * Math.PI * 2 + seed;
    const branch = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.22, 1.8, 10), bark);
    branch.position.set(Math.cos(a) * 0.6, 3.1, Math.sin(a) * 0.6);
    branch.rotation.set(Math.sin(a) * 0.7, 0, -Math.cos(a) * 0.7);
    g.add(branch);
  }
  const crown = cloudCrown(2.7, [PAL.leaf, PAL.leafDeep, PAL.leafLight], seed, 0.55);
  crown.position.y = 4.3;
  g.add(crown);
  for (let i = 0; i < 14; i++) {
    const a = i * 2.39 + seed;
    const bloom = new THREE.Mesh(new THREE.SphereGeometry(0.15, 10, 8), flat(PAL.bloomPink));
    bloom.position.set(Math.cos(a) * (1 + (i % 4) * 0.6), 5.0 + (i % 3) * 0.15, Math.sin(a) * (1 + (i % 4) * 0.6));
    g.add(bloom);
  }
  g.position.set(x, 0, z);
  return shadowed(g);
}

/** Freshly mowed padang: alternating stripes of green. */
export function mowedLawn(x0: number, z0: number, x1: number, z1: number) {
  const t = canvasTexture(128, 128, (c) => {
    for (let i = 0; i < 4; i++) {
      c.fillStyle = i % 2 ? "#7caf58" : "#86b961";
      c.fillRect(i * 32, 0, 32, 128);
    }
    for (let i = 0; i < 260; i++) {
      c.fillStyle = Math.random() > 0.5 ? "rgba(255,255,255,.06)" : "rgba(0,60,0,.07)";
      c.fillRect(Math.random() * 128, Math.random() * 128, 2, 4);
    }
  });
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set((x1 - x0) / 6, (z1 - z0) / 6);
  const m = new THREE.Mesh(new THREE.PlaneGeometry(x1 - x0, z1 - z0), new THREE.MeshLambertMaterial({ map: t }));
  m.rotation.x = -Math.PI / 2;
  m.position.set((x0 + x1) / 2, 0.015, (z0 + z1) / 2);
  m.receiveShadow = true;
  return m;
}

/** Tikar (woven mengkuang mat) lying on the grass: the painted weave, a few soft creases and corners
 * that lift a little, with a frayed edge that fades into the grass instead of a cut-out rectangle. */
export function tikar(x: number, z: number, w: number, d: number) {
  const map = painted("thatch", w, d, 2.4);
  if (map) {
    const geo = new THREE.PlaneGeometry(w, d, Math.ceil(w * 10), Math.ceil(d * 10));
    geo.rotateX(-Math.PI / 2);
    // Three or four long soft creases where it was folded, at angles picked from where it lies.
    let seed = Math.abs(Math.round(x * 131 + z * 71)) + 1;
    const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    const creases = Array.from({ length: 3 + (seed % 2) }, (_, i) => {
      const a = (i % 2 ? 0 : Math.PI / 2) + (rnd() - 0.5) * 0.5;
      return { nx: Math.cos(a), nz: Math.sin(a), c: (rnd() - 0.5) * Math.min(w, d) * 0.7, h: 0.04 + rnd() * 0.035, wd: 0.16 + rnd() * 0.14 };
    });
    const height = (px: number, pz: number) => {
      let y = 0;
      for (const k of creases) y += k.h * Math.exp(-(((px * k.nx + pz * k.nz - k.c) / k.wd) ** 2));
      // Corners curl up a touch, then the whole mat ripples very gently.
      const ex = Math.abs(px) / (w / 2);
      const ez = Math.abs(pz) / (d / 2);
      return y + 0.2 * Math.max(0, ex * ez - 0.75) + 0.01 * Math.sin(px * 3.1 + seed) * Math.sin(pz * 2.7);
    };
    const pos = geo.attributes.position as THREE.BufferAttribute;
    const col = new Float32Array(pos.count * 3);
    for (let i = 0; i < pos.count; i++) {
      const px = pos.getX(i);
      const pz = pos.getZ(i);
      const y = height(px, pz);
      pos.setY(i, y);
      // Paint the creases (the toon ramp alone flattens them): lit on the side facing the sun
      // (upper left), shaded on the other, plus the darker woven binding round the edge.
      const slope = (height(px + 0.03, pz + 0.03) - y) / 0.03;
      let k = Math.max(0.72, Math.min(1.12, 1 - slope * 1.6));
      const edge = Math.min(w / 2 - Math.abs(px), d / 2 - Math.abs(pz));
      const band = edge < 0.16 ? 1 : edge < 0.2 ? (0.2 - edge) / 0.04 : 0;
      col[i * 3] = k * (1 - band * 0.38);
      col[i * 3 + 1] = k * (1 - band * 0.62);
      col[i * 3 + 2] = k * (1 - band * 0.6);
    }
    geo.setAttribute("color", new THREE.BufferAttribute(col, 3));
    geo.computeVertexNormals();
    // A soft, gently wavy outline (alpha) so the mat settles into the grass.
    const PX = 32;
    const alphaMap = canvasTexture(Math.round(w * PX), Math.round(d * PX), (c) => {
      const cw = c.canvas.width;
      const ch = c.canvas.height;
      const img = c.createImageData(cw, ch);
      for (let j = 0; j < ch; j++)
        for (let i = 0; i < cw; i++) {
          const edge = Math.min(i, cw - 1 - i, j, ch - 1 - j) / PX;
          const wave = 0.02 * Math.sin((i + j) * 0.21 + seed) + 0.015 * Math.sin((i - j) * 0.13);
          const v = Math.max(0, Math.min(1, (edge - 0.02 + wave) / 0.07));
          const o = (j * cw + i) * 4;
          img.data[o] = img.data[o + 1] = img.data[o + 2] = v * 255;
          img.data[o + 3] = 255;
        }
      c.putImageData(img, 0, 0);
    });
    const m = new THREE.Mesh(geo, new THREE.MeshLambertMaterial({ map, alphaMap, transparent: true, vertexColors: true }));
    m.position.set(x, 0.025, z);
    m.receiveShadow = true;
    return m;
  }
  const tex = canvasTexture(64, 64, (c) => {
    c.fillStyle = "#e8c98a";
    c.fillRect(0, 0, 64, 64);
    c.fillStyle = "#c0392b";
    for (let i = 0; i < 64; i += 8) {
      c.fillRect(i, 0, 3, 64);
      c.fillRect(0, i + 4, 64, 2);
    }
  });
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(w / 2, d / 2);
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, d), new THREE.MeshLambertMaterial({ map: tex }));
  m.rotation.x = -Math.PI / 2;
  m.position.set(x, 0.03, z);
  m.receiveShadow = true;
  return m;
}

/** Party table with Qish's favourite food laid out. */
export function foodTable(x: number, z: number) {
  const gen = model("foodtable", 2.9);
  if (gen) {
    gen.position.set(x, 0, z);
    return gen;
  }
  const g = new THREE.Group();
  const top = new THREE.Mesh(roundedBox(2.6, 0.12, 1.2), flat(0xf4f1e6));
  top.position.y = 0.85;
  const cloth = new THREE.Mesh(roundedBox(2.7, 0.5, 1.3), flat(0xff8fb1));
  cloth.position.y = 0.6;
  g.add(top, cloth);
  for (const [lx, lz] of [[-1.15, -0.45], [1.15, -0.45], [-1.15, 0.45], [1.15, 0.45]]) {
    const leg = new THREE.Mesh(roundedBox(0.08, 0.4, 0.08), flat(0x9a9a92));
    leg.position.set(lx, 0.2, lz);
    g.add(leg);
  }
  // Daging salai, malatang, Dubuyo, and drinks.
  const dishes: [number, number, number, number][] = [[-0.8, -0.15, 0x7a3b22, 0xffffff], [0.05, 0.15, 0xe3350d, 0xf4f1e6], [0.85, -0.15, 0xd9452b, 0x2a2730]];
  for (const [dx, dz, food, plate] of dishes) {
    const pl = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.26, 0.07, 12), flat(plate));
    pl.position.set(dx, 0.95, dz);
    const heap = new THREE.Mesh(new THREE.IcosahedronGeometry(0.2, 0), flat(food));
    heap.scale.y = 0.55;
    heap.position.set(dx, 1.03, dz);
    g.add(pl, heap);
  }
  for (let i = 0; i < 4; i++) {
    const cup = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.06, 0.2, 8), flat([0xff8fb1, 0xffcb05, 0x46b86a, 0x3b6fe0][i]));
    cup.position.set(-1.0 + i * 0.66, 1.01, 0.42);
    g.add(cup);
  }
  g.position.set(x, 0, z);
  return shadowed(g);
}

/** Bamboo pole with a paper lantern; strings of lights hang between these. */
export function lanternPole(x: number, z: number, evening = false) {
  const gen = model("lanternpole", 3.6, "height");
  if (gen) {
    placed(gen, x, z, 0, false);
    if (!evening) return gen;
    // At the party the lantern is lit.
    const glow = new THREE.Mesh(new THREE.SphereGeometry(0.34, 18, 14), new THREE.MeshBasicMaterial({ color: 0xffb24a, transparent: true, opacity: 0.55 }));
    glow.position.set(x + 0.55, 2.55, z);
    const g = new THREE.Group();
    g.add(gen, glow);
    return g;
  }
  const g = new THREE.Group();
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.09, 3.6, 6), flat(0xc9b06b));
  pole.position.y = 1.8;
  const lantern = new THREE.Mesh(
    new THREE.SphereGeometry(0.28, 10, 8),
    evening ? new THREE.MeshBasicMaterial({ color: 0xffb24a }) : flat(0xe3350d),
  );
  lantern.scale.y = 1.2;
  lantern.position.set(0.25, 3.0, 0);
  g.add(pole, lantern);
  g.position.set(x, 0, z);
  return shadowed(g);
}

// ---------------------------------------------------------------- buildings

/** Neighbour's timber house on stilts (rumah kayu), stairs at the front. */
export function stiltHouse(
  x: number,
  z: number,
  o: { wall: string; roof: number; shutter: number; evening?: boolean; w?: number; d?: number; model?: ModelId; door?: "east" | "west" },
) {
  // The generated houses stand gable-on to the camera, about 5 wide and 7.4 deep, with the door and
  // steps on their east side; `door: "west"` turns one round so it faces a road to its west.
  const gen = o.model ? model(o.model, 7.4) : null;
  if (gen) {
    const west = o.door === "west";
    placed(gen, x, z, 0, false);
    if (west) gen.rotation.y = Math.PI;
    const steps: Box = west ? [x - 3.8, z - 0.7, x - 2.5, z + 0.7] : [x + 2.5, z - 0.7, x + 3.8, z + 0.7];
    return { group: gen, boxes: [[x - 2.5, z - 3.7, x + 2.5, z + 3.7], steps] as Box[] };
  }
  const g = new THREE.Group();
  const w = o.w ?? 7;
  const d = o.d ?? 5;
  const lift = 0.9;
  const h = 2.6;
  const wood = flat(PAL.wood);
  for (const px of [-w / 2 + 0.3, 0, w / 2 - 0.3])
    for (const pz of [-d / 2 + 0.3, d / 2 - 0.3]) {
      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.15, lift + 0.1, 12), wood);
      post.position.set(px, lift / 2, pz);
      g.add(post);
    }
  const wallTex = planks(o.wall, "rgba(0,0,0,.1)", [w / 2, h / 2]);
  const body = new THREE.Mesh(roundedBox(w, h, d, 0.22, 3), new THREE.MeshLambertMaterial({ map: wallTex }));
  body.position.y = lift + h / 2;
  const floor = new THREE.Mesh(roundedBox(w + 0.25, 0.2, d + 0.25, 0.08), wood);
  floor.position.y = lift;
  g.add(body, floor);
  const rise = 2.0;
  const roof = pitchedRoof(w + 1.0, d + 1.4, rise, roofTileMaterial(o.roof, w / 2));
  roof.position.y = lift + h;
  g.add(roof);
  for (const sx of [-1, 1]) {
    const gable = gableWall(d - 0.1, rise - 0.2, new THREE.MeshLambertMaterial({ map: wallTex }));
    gable.rotation.y = Math.PI / 2;
    gable.position.set(sx * (w / 2 - 0.18), lift + h, 0);
    g.add(gable);
  }
  const glass = o.evening ? new THREE.MeshBasicMaterial({ color: 0xffd27a }) : flat(PAL.glass);
  for (const wx of [-w / 2 + 1.3, w / 2 - 1.3]) {
    const frame = new THREE.Mesh(roundedBox(1.15, 1.15, 0.1, 0.05), flat(PAL.woodLight));
    frame.position.set(wx, lift + 1.4, d / 2 + 0.04);
    const win = new THREE.Mesh(roundedBox(0.9, 0.9, 0.08, 0.04), glass);
    win.position.set(wx, lift + 1.4, d / 2 + 0.08);
    g.add(frame, win);
    for (const sx of [-0.68, 0.68]) {
      const sh = new THREE.Mesh(roundedBox(0.3, 1.1, 0.06, 0.04), flat(o.shutter));
      sh.position.set(wx + sx, lift + 1.4, d / 2 + 0.12);
      sh.rotation.y = sx > 0 ? -0.5 : 0.5;
      g.add(sh);
    }
  }
  const door = new THREE.Mesh(roundedBox(1.0, 1.9, 0.1, 0.06), flat(PAL.woodDark));
  door.position.set(0, lift + 0.95, d / 2 + 0.05);
  g.add(door);
  // Wooden stairs up to the door.
  for (let i = 0; i < 4; i++) {
    const step = new THREE.Mesh(roundedBox(1.3, 0.14, 0.34, 0.05), flat(PAL.woodLight));
    step.position.set(0, lift - i * 0.24, d / 2 + 0.2 + i * 0.3);
    g.add(step);
  }
  g.position.set(x, 0, z);
  return {
    group: shadowed(g),
    boxes: [
      [x - w / 2, z - d / 2, x + w / 2, z + d / 2],
      [x - 0.7, z + d / 2, x + 0.7, z + d / 2 + 1.3],
    ] as Box[],
  };
}

export function kedaiRuncit(x: number, z: number, evening = false) {
  const gen = model("kedai", 7.4);
  const g = new THREE.Group();
  const w = 7;
  const d = 4.4;
  const h = 3.1;
  const front = canvasTexture(512, 228, (c) => {
    c.fillStyle = "#f3e6c8";
    c.fillRect(0, 0, 512, 228);
    c.fillStyle = evening ? "#6b5032" : "#3b2f2a";
    c.fillRect(40, 40, 432, 188);
    const goods = ["#e3350d", "#ffcb05", "#3b6fe0", "#46b86a", "#ff8fb1", "#ffffff", "#f28a1c"];
    for (let r = 0; r < 4; r++) {
      c.fillStyle = "#8a6440";
      c.fillRect(48, 82 + r * 38, 416, 5);
      for (let i = 0; i < 26; i++) {
        c.fillStyle = goods[(i * 3 + r) % goods.length];
        const bw = 9 + ((i * 7 + r) % 6);
        c.fillRect(54 + i * 15.6, 82 + r * 38 - 22 - ((i + r) % 3) * 3, bw, 22 + ((i + r) % 3) * 3);
      }
    }
    c.fillStyle = "#c98f55";
    c.fillRect(150, 178, 212, 50);
  });
  const wall = flat(0xf3e6c8);
  const body = new THREE.Mesh(roundedBox(w, h, d, 0.2, 3), [wall, wall, wall, wall, new THREE.MeshLambertMaterial({ map: front }), wall]);
  body.position.y = h / 2;
  g.add(body);
  const roof = new THREE.Mesh(roundedBox(w + 0.5, 0.32, d + 0.5, 0.14), flat(0x6f9ab0));
  roof.position.y = h + 0.14;
  g.add(roof);
  const awnTex = stripes("#e3350d", "#fffdf6", 12);
  const awning = new THREE.Mesh(roundedBox(w + 0.3, 0.07, 1.7), new THREE.MeshLambertMaterial({ map: awnTex }));
  awning.position.set(0, h - 0.35, d / 2 + 0.75);
  awning.rotation.x = 0.32;
  g.add(awning);
  const valance = new THREE.Mesh(roundedBox(w + 0.3, 0.32, 0.05), new THREE.MeshLambertMaterial({ map: awnTex }));
  valance.position.set(0, h - 0.78, d / 2 + 1.58);
  g.add(valance);
  const sign = new THREE.Mesh(
    roundedBox(5.2, 0.95, 0.15),
    [flat(0x1f6a35), flat(0x1f6a35), flat(0x1f6a35), flat(0x1f6a35), new THREE.MeshLambertMaterial({ map: signTexture("KEDAI RUNCIT", "#1f7a3a", "#ffe9b8", 640, 117) }), flat(0x1f6a35)],
  );
  sign.position.set(0, h + 0.75, d / 2 - 0.1);
  g.add(sign);
  // Ice cream freezer, drink crates, a table with red plastic chairs.
  const freezer = new THREE.Mesh(
    roundedBox(1.4, 0.9, 0.8),
    [flat(0xffffff), flat(0xffffff), flat(0x3b6fe0), flat(0xffffff), new THREE.MeshLambertMaterial({ map: signTexture("AISKRIM", "#ffffff", "#3b6fe0", 256, 160, "bold 54px 'Bagel Fat One', sans-serif") }), flat(0xffffff)],
  );
  freezer.position.set(-2.6, 0.45, d / 2 + 0.9);
  g.add(freezer);
  for (let i = 0; i < 5; i++) {
    const crate = new THREE.Mesh(roundedBox(0.62, 0.36, 0.46), flat(i % 2 ? 0xe3350d : 0xffcb05));
    crate.position.set(2.75 + (i % 2) * 0.05, 0.18 + Math.floor(i / 2) * 0.37 - (i === 4 ? 0.37 : 0), d / 2 + 0.7 + (i === 4 ? 0.5 : 0));
    g.add(crate);
  }
  const top = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.6, 0.05, 14), flat(0xf4f1e6));
  top.position.set(-0.3, 0.75, d / 2 + 2.3);
  const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.12, 0.75, 6), flat(0x9a9a92));
  leg.position.set(-0.3, 0.37, d / 2 + 2.3);
  g.add(top, leg);
  for (const cx of [-1.25, 0.65]) g.add(plasticChair(cx, d / 2 + 2.3, cx < 0 ? Math.PI / 2 : -Math.PI / 2));
  if (evening) {
    const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.13, 8, 6), new THREE.MeshBasicMaterial({ color: 0xfff1c2 }));
    bulb.position.set(0, h - 0.65, d / 2 + 0.6);
    g.add(bulb);
  }
  g.position.set(x, 0, z);
  if (gen) {
    // Generated text comes out garbled, so the model has a blank board and the words go on here.
    placed(gen, x, z, 0, false);
    const box = new THREE.Box3().setFromObject(gen);
    const size = box.getSize(new THREE.Vector3());
    const board = new THREE.Mesh(
      roundedBox(size.x * 0.6, size.y * 0.19, 0.08, 0.04),
      [flat(0x1f6a35), flat(0x1f6a35), flat(0x1f6a35), flat(0x1f6a35), new THREE.MeshLambertMaterial({ map: signTexture("KEDAI RUNCIT", "#1f7a3a", "#ffe9b8", 640, 160) }), flat(0x1f6a35)],
    );
    board.position.set(x + SIGN.x * size.x, box.min.y + SIGN.y * size.y, box.max.z - SIGN.z * size.z);
    board.rotation.x = SIGN.tilt;
    const group = new THREE.Group();
    group.add(gen, board);
    group.userData.fade = true;
    delete gen.userData.fade;
    // The generated shop is about 7.4 x 6.9 with everything on its own plinth: one box covers it.
    return { group, boxes: [[x - 3.6, z - 3.3, x + 3.6, z + 3.3]] as Box[] };
  }
  return {
    group: shadowed(g),
    boxes: shopBoxes(x, z, w, d),
  };
}

/** Where the KEDAI RUNCIT words sit on the generated shop's blank board, as fractions of the model's
 * size (x from centre, y up from the base, z back from the front) and the board's tilt. */
const SIGN = { x: -0.04, y: 0.87, z: 0.4, tilt: -0.3 };

function shopBoxes(x: number, z: number, w: number, d: number): Box[] {
  return [
    [x - w / 2, z - d / 2, x + w / 2, z + d / 2 + 0.2],
    [x - 3.35, z + d / 2, x - 1.85, z + d / 2 + 1.35],
    [x + 2.35, z + d / 2, x + 3.15, z + d / 2 + 1.5],
    [x - 1.6, z + d / 2 + 1.85, x + 1.0, z + d / 2 + 2.75],
  ];
}

function plasticChair(x: number, z: number, rotY: number) {
  const g = new THREE.Group();
  const red = flat(0xd8282a);
  const seat = new THREE.Mesh(roundedBox(0.46, 0.05, 0.46), red);
  seat.position.y = 0.45;
  const back = new THREE.Mesh(roundedBox(0.46, 0.42, 0.05), red);
  back.position.set(0, 0.68, -0.22);
  g.add(seat, back);
  for (const [lx, lz] of [[-0.19, -0.19], [0.19, -0.19], [-0.19, 0.19], [0.19, 0.19]]) {
    const l = new THREE.Mesh(roundedBox(0.05, 0.45, 0.05), red);
    l.position.set(lx, 0.22, lz);
    g.add(l);
  }
  g.position.set(x, 0, z);
  g.rotation.y = rotY;
  return g;
}

/** Kapcai parked by the shop. */
export function motorbike(x: number, z: number, rotY = 0) {
  const gen = model("motorbike", 1.9);
  if (gen) {
    placed(gen, x, z, 0, false);
    gen.rotation.y = rotY;
    return gen;
  }
  const g = new THREE.Group();
  for (const wz of [-0.6, 0.6]) {
    const wheel = new THREE.Mesh(new THREE.TorusGeometry(0.28, 0.08, 6, 14), flat(0x1c1c22));
    wheel.rotation.y = Math.PI / 2;
    wheel.position.set(0, 0.32, wz);
    g.add(wheel);
  }
  const body = new THREE.Mesh(roundedBox(0.32, 0.35, 1.0), flat(0x3b6fe0));
  body.position.set(0, 0.62, -0.1);
  const seat = new THREE.Mesh(roundedBox(0.3, 0.12, 0.62), flat(0x1c1c22));
  seat.position.set(0, 0.86, -0.25);
  const shield = new THREE.Mesh(roundedBox(0.42, 0.7, 0.12), flat(0xf4f1e6));
  shield.position.set(0, 0.85, 0.45);
  shield.rotation.x = -0.25;
  const bar = new THREE.Mesh(roundedBox(0.75, 0.06, 0.06), flat(0x9a9a92));
  bar.position.set(0, 1.25, 0.42);
  const basket = new THREE.Mesh(roundedBox(0.4, 0.25, 0.3), flat(0x9a9a92));
  basket.position.set(0, 1.0, 0.68);
  g.add(body, seat, shield, bar, basket);
  g.position.set(x, 0, z);
  g.rotation.y = rotY;
  return shadowed(g);
}

/** Wakaf: a raised wooden gazebo for lepak. */
export function wakaf(x: number, z: number) {
  const gen = model("wakaf", 3.9);
  if (gen) return placed(gen, x, z, 0, false);
  const g = new THREE.Group();
  const wood = flat(0x8a5a36);
  const deck = new THREE.Mesh(roundedBox(3.2, 0.16, 3.2), new THREE.MeshLambertMaterial({ map: planks("#b07a4a", "rgba(0,0,0,.18)", [2, 2]) }));
  deck.position.y = 0.62;
  g.add(deck);
  for (const px of [-1.45, 1.45])
    for (const pz of [-1.45, 1.45]) {
      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.13, 3.0, 12), wood);
      post.position.set(px, 1.5, pz);
      g.add(post);
    }
  const roof = new THREE.Mesh(new THREE.ConeGeometry(2.75, 1.6, 4, 1), flat(0x9a6f8e));
  roof.rotation.y = Math.PI / 4;
  roof.position.y = 3.75;
  roof.scale.set(1, 1, 1);
  const eave = new THREE.Mesh(roundedBox(3.95, 0.16, 3.95, 0.07), flat(PAL.woodDark));
  eave.position.y = 2.98;
  const finial = new THREE.Mesh(new THREE.SphereGeometry(0.2, 14, 10), flat(PAL.bloomYellow));
  finial.position.y = 4.6;
  g.add(eave);
  const mat = new THREE.Mesh(
    new THREE.PlaneGeometry(2.4, 2.4),
    new THREE.MeshLambertMaterial({
      map: canvasTexture(64, 64, (c) => {
        c.fillStyle = "#e8c98a";
        c.fillRect(0, 0, 64, 64);
        c.fillStyle = "#c0392b";
        for (let i = 0; i < 64; i += 8) {
          c.fillRect(i, 0, 3, 64);
          c.fillRect(0, i + 4, 64, 2);
        }
      }),
    }),
  );
  mat.rotation.x = -Math.PI / 2;
  mat.position.y = 0.71;
  const step = new THREE.Mesh(roundedBox(1.2, 0.3, 0.5), wood);
  step.position.set(0, 0.15, 1.85);
  g.add(roof, finial, mat, step);
  g.position.set(x, 0, z);
  return shadowed(g);
}

/** Concrete electricity pole; `wires()` strings cables between a row of them. */
export function electricPole(x: number, z: number) {
  const gen = model("pole", 6.7, "height");
  if (gen) {
    gen.scale.x *= 0.55;
    gen.scale.z *= 0.55;
    return placed(gen, x, z, 0, false);
  }
  const g = new THREE.Group();
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.14, 6.6, 12), flat(0xc9c2b4));
  pole.position.y = 3.3;
  const bar = new THREE.Mesh(roundedBox(0.1, 0.1, 1.6), flat(0x6b6b66));
  bar.position.y = 6.25;
  g.add(pole, bar);
  for (const oz of [-0.7, 0, 0.7]) {
    const ins = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.14, 6), flat(0xf4f1e6));
    ins.position.set(0, 6.36, oz);
    g.add(ins);
  }
  g.position.set(x, 0, z);
  return shadowed(g);
}

export function wires(poles: [number, number][], y = 6.42) {
  const g = new THREE.Group();
  const mat = new THREE.LineBasicMaterial({ color: 0x2a2a30 });
  for (let i = 0; i < poles.length - 1; i++) {
    const [ax, az] = poles[i];
    const [bx, bz] = poles[i + 1];
    for (const oz of [-0.7, 0, 0.7]) {
      const pts: THREE.Vector3[] = [];
      for (let k = 0; k <= 16; k++) {
        const f = k / 16;
        pts.push(new THREE.Vector3(ax + (bx - ax) * f, y - Math.sin(f * Math.PI) * 0.7, az + (bz - az) * f + oz));
      }
      g.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), mat));
    }
  }
  return g;
}

export function mailbox(x: number, z: number) {
  const gen = model("mailbox", 1.45, "height");
  if (gen) return placed(gen, x, z, 0, false);
  const g = new THREE.Group();
  const post = new THREE.Mesh(roundedBox(0.16, 1.0, 0.16, 0.05), flat(PAL.wood));
  post.position.y = 0.5;
  const box = new THREE.Mesh(roundedBox(0.56, 0.36, 0.44, 0.08), flat(PAL.carRed));
  box.position.y = 1.15;
  const lid = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.56, 16, 1, false, 0, Math.PI), flat(PAL.carRed));
  lid.rotation.z = Math.PI / 2;
  lid.position.y = 1.32;
  const slot = new THREE.Mesh(roundedBox(0.28, 0.04, 0.02, 0.01), flat(PAL.ink));
  slot.position.set(0, 1.18, 0.23);
  const flag = new THREE.Mesh(roundedBox(0.04, 0.3, 0.12, 0.015), flat(PAL.bloomYellow));
  flag.position.set(0.3, 1.35, 0);
  g.add(post, box, lid, slot, flag);
  g.position.set(x, 0, z);
  return shadowed(g);
}

/** Wooden picket fence along x: round-topped pickets on two rails, a sturdier post every few metres. */
export function picketFence(x0: number, x1: number, z: number) {
  // Generated fence sections laid end to end, each about 2.6 m.
  const n = Math.max(1, Math.round((x1 - x0) / 2.6));
  const seg = (x1 - x0) / n;
  if (model("fence", 1)) {
    const g = new THREE.Group();
    for (let i = 0; i < n; i++) {
      const f = modelBox("fence", seg + 0.06, 1.15, 0.4)!;
      f.position.set(x0 + seg * (i + 0.5), 0, z);
      g.add(f);
    }
    return g;
  }
  const g = new THREE.Group();
  const paint = flat(0xe0b585);
  const postMat = flat(PAL.wood);
  const picket = new THREE.CapsuleGeometry(0.1, 0.66, 4, 8);
  for (let x = x0; x <= x1 + 0.01; x += 0.42) {
    const p = new THREE.Mesh(picket, paint);
    p.scale.z = 0.6;
    p.position.set(x, 0.48, z);
    g.add(p);
  }
  for (let x = x0; x <= x1 + 0.01; x += 3.5) {
    const p = new THREE.Mesh(roundedBox(0.24, 1.05, 0.24, 0.08), postMat);
    p.position.set(x, 0.52, z - 0.02);
    const cap = new THREE.Mesh(new THREE.SphereGeometry(0.15, 12, 10), postMat);
    cap.position.set(x, 1.1, z - 0.02);
    g.add(p, cap);
  }
  for (const y of [0.3, 0.66]) {
    const rail = new THREE.Mesh(new THREE.CapsuleGeometry(0.045, x1 - x0, 3, 8), paint);
    rail.rotation.z = Math.PI / 2;
    rail.position.set((x0 + x1) / 2, y, z - 0.07);
    g.add(rail);
  }
  return shadowed(g);
}

/** Height of the generated arch's blank board, as a fraction of the arch's height. */
const ARCH_SIGN = { y: 0.775 };

/** Kampung welcome arch over the road. */
export function welcomeArch(x: number, z: number, text: string) {
  const gen = model("arch", 8.8);
  if (gen) {
    placed(gen, x, z, 0, false);
    const box = new THREE.Box3().setFromObject(gen);
    const s = box.getSize(new THREE.Vector3());
    const card = new THREE.Mesh(
      new THREE.PlaneGeometry(s.x * 0.63, s.y * 0.17),
      new THREE.MeshLambertMaterial({ map: signTexture(text, "#2f7a44", "#ffe08a", 900, 140, "bold 70px 'Bagel Fat One', sans-serif") }),
    );
    const cy = box.min.y + s.y * ARCH_SIGN.y;
    card.position.set(x, cy, frontZ(gen, x, cy));
    const g = new THREE.Group();
    g.add(gen, card);
    g.userData.fade = true;
    delete gen.userData.fade;
    return g;
  }
  const g = new THREE.Group();
  for (const px of [-3.9, 3.9]) {
    const pillar = new THREE.Mesh(roundedBox(0.6, 4.2, 0.6), flat(0xf6f1e4));
    pillar.position.set(px, 2.1, 0);
    const cap = new THREE.Mesh(roundedBox(0.85, 0.3, 0.85), flat(0x2f8a4a));
    cap.position.set(px, 4.35, 0);
    const ball = new THREE.Mesh(new THREE.SphereGeometry(0.22, 10, 8), flat(0xffcb05));
    ball.position.set(px, 4.7, 0);
    const planter = new THREE.Mesh(roundedBox(1.0, 0.4, 1.0), flat(0x2f8a4a));
    planter.position.set(px, 0.2, 0);
    g.add(pillar, cap, ball, planter);
    for (let i = 0; i < 6; i++) {
      const f = new THREE.Mesh(new THREE.IcosahedronGeometry(0.12, 0), flat([0xff5fa2, 0xffcb05, 0xffffff][i % 3]));
      f.position.set(px + Math.cos(i) * 0.38, 0.48, Math.sin(i) * 0.38);
      g.add(f);
    }
  }
  const green = flat(0x2f8a4a);
  const panel = new THREE.Mesh(
    roundedBox(7.4, 1.15, 0.25),
    [green, green, green, green, new THREE.MeshLambertMaterial({ map: signTexture(text, "#2f8a4a", "#ffe08a", 900, 140, "bold 70px 'Bagel Fat One', sans-serif") }), green],
  );
  panel.position.y = 3.75;
  g.add(panel);
  g.position.set(x, 0, z);
  return shadowed(g);
}

/** Exit gate across a north-south road, with a boom barrier that lifts once `open()` is true. */
export function barrierGate(x: number, z: number, text: string, open: () => boolean, plateText = "IKUT JEJAK BOWAT"): Anim {
  const g = new THREE.Group();
  const wood = flat(0xf28a1c);
  for (const px of [-3.3, 3.3]) {
    const p = new THREE.Mesh(roundedBox(0.35, 3.4, 0.35), wood);
    p.position.set(px, 1.7, 0);
    g.add(p);
  }
  const beam = new THREE.Mesh(roundedBox(7.0, 0.4, 0.4), wood);
  beam.position.y = 3.4;
  const panel = new THREE.Mesh(
    roundedBox(4.6, 1.05, 0.15),
    [flat(0xd8701a), flat(0xd8701a), flat(0xd8701a), flat(0xd8701a), new THREE.MeshLambertMaterial({ map: signTexture(text, "#fffdf6", "#1f2f7a", 700, 160, "bold 64px 'Bagel Fat One', sans-serif") }), flat(0xd8701a)],
  );
  panel.position.y = 4.2;
  g.add(beam, panel);
  const pivot = new THREE.Group();
  pivot.position.set(-3.05, 1.05, 0.3);
  const bar = new THREE.Mesh(roundedBox(6.0, 0.16, 0.16), new THREE.MeshLambertMaterial({ map: stripes("#e3350d", "#fffdf6", 10) }));
  bar.geometry.translate(3.0, 0, 0);
  const plate = new THREE.Mesh(
    roundedBox(1.9, 0.5, 0.06),
    [flat(0xffffff), flat(0xffffff), flat(0xffffff), flat(0xffffff), new THREE.MeshLambertMaterial({ map: signTexture(plateText, "#ffcb05", INK, 512, 135, "bold 50px 'Gaegu', sans-serif") }), flat(0xffffff)],
  );
  plate.position.set(3.0, -0.38, 0.05);
  pivot.add(bar, plate);
  g.add(pivot);
  g.position.set(x, 0, z);
  let angle = open() ? 1.4 : 0;
  pivot.rotation.z = angle;
  const tick = ticker();
  const update = (t: number) => {
    const dt = tick(t);
    const target = open() ? 1.4 : 0;
    angle += (target - angle) * Math.min(1, dt * 2.5);
    pivot.rotation.z = angle;
    plate.visible = angle < 0.6;
  };
  return { group: shadowed(g), update };
}

/** "JALAN DITUTUP" barricade. */
export function roadBlock(x: number, z: number) {
  const gen = modelBox("roadblock", 3.2, 1.3, 0.7);
  if (gen) {
    const g = new THREE.Group();
    gen.rotation.y = Math.PI / 2;
    g.add(gen);
    const plate = new THREE.Mesh(
      roundedBox(1.5, 0.62, 0.06, 0.05),
      [flat(0xffcb05), flat(0xffcb05), flat(0xffcb05), flat(0xffcb05), new THREE.MeshLambertMaterial({ map: signTexture("DITUTUP", "#ffcb05", INK, 320, 132, "bold 62px 'Bagel Fat One', sans-serif") }), flat(0xffcb05)],
    );
    plate.position.set(0, 1.55, 0.2);
    g.add(plate);
    g.position.set(x, 0, z);
    return g;
  }
  const g = new THREE.Group();
  const board = new THREE.Mesh(roundedBox(0.12, 0.45, 3.0), new THREE.MeshLambertMaterial({ map: stripes("#e3350d", "#fffdf6", 8) }));
  board.position.y = 0.85;
  g.add(board);
  for (const lz of [-1.2, 1.2]) {
    for (const lx of [-0.25, 0.25]) {
      const leg = new THREE.Mesh(roundedBox(0.08, 1.1, 0.08), flat(0xf4f1e6));
      leg.position.set(lx, 0.5, lz);
      leg.rotation.z = lx > 0 ? -0.25 : 0.25;
      g.add(leg);
    }
  }
  const yellow = flat(0xffcb05);
  const sign = new THREE.Mesh(
    roundedBox(1.6, 0.7, 0.06),
    [yellow, yellow, yellow, yellow, new THREE.MeshLambertMaterial({ map: signTexture("DITUTUP", "#ffcb05", INK, 320, 140, "bold 62px 'Bagel Fat One', sans-serif") }), yellow],
  );
  sign.position.set(0, 1.45, 0.12);
  g.add(sign);
  g.position.set(x, 0, z);
  return shadowed(g);
}

// ---------------------------------------------------------------- water

export function stream(x0: number, x1: number, z0: number, z1: number): Anim {
  const g = new THREE.Group();
  const tex = canvasTexture(128, 64, (c) => {
    c.fillStyle = "#4fb3d9";
    c.fillRect(0, 0, 128, 64);
    c.strokeStyle = "rgba(255,255,255,.55)";
    c.lineWidth = 3;
    for (let i = 0; i < 7; i++) {
      const y = 6 + i * 9;
      const ox = (i * 37) % 128;
      c.beginPath();
      c.moveTo(ox, y);
      c.quadraticCurveTo(ox + 10, y - 4, ox + 22, y);
      c.stroke();
    }
  });
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set((x1 - x0) / 5, 1);
  const paintedWater = painted("water", x1 - x0, z1 - z0, 4);
  const surface = paintedWater ?? tex;
  // The water reaches a little past the banks and fades out along a wobbly line, with a band of
  // white foam just inside it, so the edge reads as a shore rather than a cut.
  const pad = 0.5;
  const w = x1 - x0;
  const d = z1 - z0 + pad * 2;
  const PX = 12;
  const shore = (x: number, side: number) => Math.sin(x * 0.55 + side * 2) * 0.16 + Math.sin(x * 1.7 + side) * 0.08;
  const edgeMask = (foam: boolean) =>
    canvasTexture(Math.round(w * PX), Math.round(d * PX), (c) => {
      const W = c.canvas.width;
      const H = c.canvas.height;
      c.fillStyle = "#000";
      c.fillRect(0, 0, W, H);
      for (let px = 0; px < W; px++) {
        const x = px / PX;
        const top = (pad + shore(x, 0)) * PX;
        const bot = H - (pad + shore(x, 1)) * PX;
        const grad = c.createLinearGradient(0, top - 6, 0, bot + 6);
        const f = 6 / (bot - top + 12);
        if (foam) {
          grad.addColorStop(0, "#000");
          grad.addColorStop(f * 0.9, "#fff");
          grad.addColorStop(f * 2.6, "#000");
          grad.addColorStop(1 - f * 2.6, "#000");
          grad.addColorStop(1 - f * 0.9, "#fff");
          grad.addColorStop(1, "#000");
        } else {
          grad.addColorStop(0, "#000");
          grad.addColorStop(f * 1.6, "#fff");
          grad.addColorStop(1 - f * 1.6, "#fff");
          grad.addColorStop(1, "#000");
        }
        c.fillStyle = grad;
        c.fillRect(px, top - 6, 1, bot - top + 12);
      }
    });
  const plane = () => {
    const geo = new THREE.PlaneGeometry(w, d);
    geo.rotateX(-Math.PI / 2);
    return geo;
  };
  const water = new THREE.Mesh(
    plane(),
    new THREE.MeshLambertMaterial({ map: surface, emissive: 0x0b6f8a, emissiveIntensity: 0.18, alphaMap: edgeMask(false), transparent: true, depthWrite: false }),
  );
  water.position.set((x0 + x1) / 2, 0.025, (z0 + z1) / 2);
  water.receiveShadow = true;
  const foam = new THREE.Mesh(plane(), new THREE.MeshBasicMaterial({ color: 0xf4fbff, alphaMap: edgeMask(true), transparent: true, opacity: 0.7, depthWrite: false }));
  foam.position.set((x0 + x1) / 2, 0.03, (z0 + z1) / 2);
  g.add(water, foam);
  // No bank strips: the zone's painted ground runs a dusty bank along the water instead.
  for (let i = 0; i < 46; i++) {
    const x = x0 + Math.random() * (x1 - x0);
    if (Math.abs(x) < 3.6) continue;
    const bz = i % 2 ? z0 - 0.15 : z1 + 0.15;
    if (i % 5 === 0) {
      const rock = new THREE.Mesh(new THREE.IcosahedronGeometry(0.22 + Math.random() * 0.18, 0), flat(0x9a968a));
      rock.position.set(x, 0.12, bz);
      g.add(rock);
    } else {
      const reed = new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.9 + Math.random() * 0.5, 3), flat(0x5f8f3a));
      reed.position.set(x, 0.45, bz);
      reed.rotation.z = (Math.random() - 0.5) * 0.3;
      g.add(reed);
    }
  }
  const update = (t: number) => {
    surface.offset.x = t * 0.04;
    surface.offset.y = Math.sin(t * 0.6) * 0.02;
  };
  return { group: shadowed(g), update };
}

/** The generated bridge: total height, how far it reaches past each bank, and its deck height at the
 * ends and middle (for the walking floor laid over it in the zone). */
export const STREAM_BRIDGE = { h: 1.5, overhang: 1.3, deckEnd: 0.12, deckMid: 0.62 };

/** Plank bridge over the stream; the deck runs along z between the two banks. */
export function bridge(x0: number, x1: number, z0: number, z1: number) {
  const gen = modelBox("bridge", x1 - x0 + 0.4, STREAM_BRIDGE.h, z1 - z0 + STREAM_BRIDGE.overhang * 2, true);
  if (gen) return placed(gen, (x0 + x1) / 2, (z0 + z1) / 2, 0, false);
  const g = new THREE.Group();
  const deck = new THREE.Mesh(roundedBox(x1 - x0, 0.2, z1 - z0 + 0.9, 0.08), paintedMat("planks", x1 - x0, z1 - z0 + 0.9, 2.2));
  deck.position.set((x0 + x1) / 2, 0.16, (z0 + z1) / 2);
  g.add(deck);
  const wood = flat(0x7a5536);
  for (const rx of [x0 + 0.08, x1 - 0.08]) {
    for (let k = 0; k <= 3; k++) {
      const post = new THREE.Mesh(roundedBox(0.14, 0.9, 0.14), wood);
      post.position.set(rx, 0.6, z0 - 0.3 + ((z1 - z0 + 0.6) * k) / 3);
      g.add(post);
    }
    const rail = new THREE.Mesh(roundedBox(0.12, 0.1, z1 - z0 + 0.7), wood);
    rail.position.set(rx, 1.0, (z0 + z1) / 2);
    g.add(rail);
  }
  return shadowed(g);
}

function duckMesh() {
  const g = new THREE.Group();
  const body = new THREE.Mesh(new THREE.SphereGeometry(0.24, 18, 14), flat(0xfffdf6));
  body.scale.set(1.4, 0.75, 0.95);
  body.position.y = 0.12;
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.13, 18, 14), flat(0xfffdf6));
  head.position.set(0.26, 0.36, 0);
  const beak = new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.14, 14), flat(0xf28a1c));
  beak.rotation.z = -Math.PI / 2;
  beak.position.set(0.42, 0.34, 0);
  const tail = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.16, 14), flat(0xfffdf6));
  tail.rotation.z = 0.9;
  tail.position.set(-0.36, 0.22, 0);
  g.add(body, head, beak, tail);
  for (const ez of [-0.08, 0.08]) {
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.025, 18, 14), flat(0x17151f));
    eye.position.set(0.34, 0.4, ez);
    g.add(eye);
  }
  return shadowed(g);
}

/** Ducks paddling up and down the stream, one family each side of the bridge. */
export function ducks(z: number, lanes: [number, number][]): Anim {
  const g = new THREE.Group();
  const list = lanes.flatMap(([a, b], li) =>
    [0, 1, 2].map((i) => {
      const m = duckMesh();
      m.scale.setScalar(i ? 0.6 : 1);
      g.add(m);
      return { m, a, b, phase: li * 2.1, lag: i * 0.55, zo: (i - 1) * 0.25 };
    }),
  );
  const update = (t: number) => {
    for (const d of list) {
      const s = (t - d.lag) * 0.09 + d.phase;
      const k = (Math.sin(s) + 1) / 2;
      d.m.position.set(d.a + (d.b - d.a) * k, 0.02 + Math.sin(t * 3 + d.lag) * 0.02, z + d.zo + Math.sin(t * 0.7 + d.phase) * 0.2);
      d.m.rotation.y = Math.cos(s) > 0 ? 0 : Math.PI;
    }
  };
  return { group: g, update };
}

// ---------------------------------------------------------------- animals

function chickenMesh(body: number, tail: number, scale: number, chick = false) {
  const g = new THREE.Group();
  const ball = (r: number, mat: THREE.Material, sx: number, sy: number, sz: number) => {
    const m = new THREE.Mesh(new THREE.SphereGeometry(r, 20, 16), mat);
    m.scale.set(sx, sy, sz);
    return m;
  };
  const bodyMat = flat(body);
  // A plump teardrop: round breast in front, tapering up into the tail.
  const torso = ball(0.28, bodyMat, 1.2, 1, 0.95);
  torso.position.y = 0.42;
  g.add(torso);
  const rump = ball(0.2, bodyMat, 1.1, 1, 0.9);
  rump.position.set(-0.2, 0.52, 0);
  g.add(rump);
  if (!chick) {
    // Three soft tail feathers fanned up and back.
    const tailMat = flat(tail);
    for (const [a, y] of [[0.5, 0.0], [0.85, 0.06], [1.2, 0.04]] as const) {
      const f = ball(0.1, tailMat, 1, 2.4, 0.5);
      f.position.set(-0.36 - Math.cos(a) * 0.06, 0.68 + y, 0);
      f.rotation.z = a;
      g.add(f);
    }
    // Wings folded on each side, a shade darker than the body.
    const wingMat = flat(new THREE.Color(body).multiplyScalar(0.86).getHex());
    for (const s of [-1, 1]) {
      const w = ball(0.17, wingMat, 1.45, 0.75, 0.32);
      w.position.set(-0.05, 0.46, s * 0.24);
      w.rotation.z = 0.25;
      g.add(w);
    }
  }
  const head = new THREE.Group();
  head.position.set(0.24, 0.58, 0);
  const skull = ball(0.15, bodyMat, 1, 1, 1);
  skull.position.set(0.06, 0.14, 0);
  const beak = new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.13, 16), flat(0xf2a51c));
  beak.rotation.z = -Math.PI / 2;
  beak.position.set(0.24, 0.12, 0);
  head.add(skull, beak);
  if (!chick) {
    const red = flat(0xe0281f);
    for (const [cx, cy, r] of [[0.0, 0.28, 0.05], [0.07, 0.31, 0.055], [0.14, 0.28, 0.045]] as const) {
      const bump = ball(r, red, 1, 1, 0.6);
      bump.position.set(cx, cy, 0);
      head.add(bump);
    }
    const wattle = ball(0.045, red, 1, 1.4, 0.8);
    wattle.position.set(0.19, 0.03, 0);
    head.add(wattle);
  }
  for (const ez of [-0.1, 0.1]) {
    const eye = ball(0.025, flat(0x17151f), 1, 1, 1);
    eye.position.set(0.16, 0.19, ez);
    head.add(eye);
  }
  g.add(head);
  const legs = [-0.08, 0.08].map((lz) => {
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.24, 12), flat(0xf2a51c));
    leg.geometry.translate(0, -0.12, 0);
    leg.position.set(0, 0.26, lz);
    g.add(leg);
    return leg;
  });
  g.scale.setScalar(scale);
  return { g: shadowed(g), head, legs, torso };
}

/** A small flock of ayam kampung that wanders, pecks, and scatters (clucking) when Qish runs at them. */
export function chickens(area: Box, player: () => THREE.Vector3): Anim {
  const group = new THREE.Group();
  const rand = (a: number, b: number) => a + Math.random() * (b - a);
  const inArea = (v: THREE.Vector2) => {
    v.x = THREE.MathUtils.clamp(v.x, area[0], area[2]);
    v.y = THREE.MathUtils.clamp(v.y, area[1], area[3]);
    return v;
  };
  const kinds = [
    { body: 0xfffdf6, tail: 0xf4f1e6, scale: 1, chick: false },
    { body: 0xb5652e, tail: 0x3a2a20, scale: 1.15, chick: false },
    { body: 0xd99a55, tail: 0x8a4a22, scale: 1, chick: false },
    { body: 0xffe36b, tail: 0, scale: 0.45, chick: true },
    { body: 0xffe36b, tail: 0, scale: 0.45, chick: true },
    { body: 0xffe36b, tail: 0, scale: 0.45, chick: true },
  ];
  const birds = kinds.map((k, i) => {
    const mesh = chickenMesh(k.body, k.tail, k.scale, k.chick);
    group.add(mesh.g);
    const pos = inArea(new THREE.Vector2(rand(area[0], area[2]), rand(area[1], area[3])));
    return { ...mesh, k, pos, target: pos.clone(), speed: 1, state: "idle" as "idle" | "walk" | "peck" | "flee", timer: rand(0, 2), phase: i * 1.3, heading: 0 };
  });
  let lastCluck = -10;
  const tick = ticker();
  const update = (t: number) => {
    const dt = tick(t);
    const p = player();
    for (const [i, b] of birds.entries()) {
      const away = new THREE.Vector2(b.pos.x - p.x, b.pos.y - p.z);
      const near = away.length() < 2.3;
      b.timer -= dt;
      if (near && b.state !== "flee") {
        b.state = "flee";
        b.timer = 0.9;
        b.speed = b.k.chick ? 3.2 : 4.2;
        b.target = inArea(b.pos.clone().add(away.normalize().multiplyScalar(3.4).rotateAround(new THREE.Vector2(), rand(-0.6, 0.6))));
        if (t - lastCluck > 0.8) {
          lastCluck = t;
          sfx.cluck();
        }
      } else if (b.timer <= 0) {
        if (b.k.chick) {
          // Chicks trail after the white hen.
          const mom = birds[0].pos;
          b.state = "walk";
          b.speed = 1.6;
          b.target = inArea(new THREE.Vector2(mom.x - 0.7 + rand(-0.4, 0.4), mom.y + (i - 4) * 0.45));
          b.timer = rand(0.6, 1.4);
        } else {
          const r = Math.random();
          b.state = r < 0.5 ? "walk" : r < 0.85 ? "peck" : "idle";
          b.speed = 1.1;
          b.timer = b.state === "walk" ? 3 : rand(1.2, 2.6);
          if (b.state === "walk") b.target = inArea(new THREE.Vector2(rand(area[0], area[2]), rand(area[1], area[3])));
        }
      }
      let moving = false;
      if (b.state === "walk" || b.state === "flee") {
        const d = b.target.clone().sub(b.pos);
        const len = d.length();
        if (len > 0.08) {
          b.pos.add(d.multiplyScalar(Math.min(len, b.speed * dt) / len));
          b.heading = Math.atan2(-(b.target.y - b.pos.y), b.target.x - b.pos.x);
          moving = true;
        } else if (b.state === "flee") b.timer = 0;
      }
      b.g.position.set(b.pos.x, moving ? Math.abs(Math.sin(t * 14 + b.phase)) * 0.06 : 0, b.pos.y);
      const diff = b.heading - b.g.rotation.y;
      const turn = Math.atan2(Math.sin(diff), Math.cos(diff));
      b.g.rotation.y += turn * Math.min(1, dt * 10);
      b.head.rotation.z = b.state === "peck" ? -1.1 * Math.max(0, Math.sin(t * 8 + b.phase)) : Math.sin(t * 2 + b.phase) * 0.1;
      b.legs[0].rotation.z = moving ? Math.sin(t * 16 + b.phase) * 0.6 : 0;
      b.legs[1].rotation.z = moving ? -Math.sin(t * 16 + b.phase) * 0.6 : 0;
    }
  };
  return { group, update };
}

/** Ginger kampung cat asleep (on Qish's Myvi, naturally), tail swishing, little z's floating up. */
export function sleepingCat(x: number, y: number, z: number): Anim {
  const g = new THREE.Group();
  const orange = flat(0xf0a04b);
  const ginger = { body: 0xf0a04b, pattern: "tabby" as const, accent: 0xc9772e };
  const body = new THREE.Mesh(new THREE.SphereGeometry(0.3, 24, 18), paintedCoat(ginger, "torso"));
  body.scale.set(1.35, 0.62, 0.95);
  body.position.y = 0.18;
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.18, 24, 18), paintedCoat(ginger, "head"));
  head.position.set(0.38, 0.2, 0.06);
  g.add(body, head);
  for (const ez of [-0.09, 0.11]) {
    const ear = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.13, 14), orange);
    ear.position.set(0.4, 0.38, ez);
    g.add(ear);
  }
  const tail = new THREE.Mesh(new THREE.TorusGeometry(0.26, 0.05, 12, 28, Math.PI * 0.9), orange);
  tail.rotation.x = -Math.PI / 2;
  tail.position.set(-0.05, 0.06, 0.05);
  g.add(tail);
  const zTex = canvasTexture(64, 64, (c) => {
    c.font = "bold 50px 'Gaegu', sans-serif";
    c.textAlign = "center";
    c.textBaseline = "middle";
    c.lineWidth = 6;
    c.strokeStyle = "#fffdf6";
    c.strokeText("z", 32, 34);
    c.fillStyle = INK;
    c.fillText("z", 32, 34);
  });
  const zs = [0, 0.5].map(() => {
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: zTex, transparent: true, depthWrite: false }));
    g.add(s);
    return s;
  });
  g.position.set(x, y, z);
  const update = (t: number) => {
    body.scale.y = 0.62 * (1 + Math.sin(t * 1.6) * 0.06);
    tail.rotation.z = Math.sin(t * 0.9) * 0.35;
    zs.forEach((s, i) => {
      const k = (t * 0.32 + i * 0.5) % 1;
      s.position.set(0.5 + k * 0.35, 0.45 + k * 0.8, 0);
      s.scale.setScalar(0.18 + k * 0.18);
      s.material.opacity = Math.min(1, (1 - k) * 2);
    });
  };
  return { group: shadowed(g), update };
}

// ---------------------------------------------------------------- laundry

type Garment = { w: number; h: number; draw: (c: CanvasRenderingContext2D, w: number, h: number) => void };

const outline = (c: CanvasRenderingContext2D, fill: string) => {
  c.fillStyle = fill;
  c.fill();
  c.lineWidth = 6;
  c.lineJoin = "round";
  c.strokeStyle = INK;
  c.stroke();
};

const GARMENTS: Garment[] = [
  {
    // Bawal tudung folded into a triangle, in Qish's mauve.
    w: 1.25,
    h: 0.95,
    draw: (c, w, h) => {
      c.beginPath();
      c.moveTo(6, 6);
      c.lineTo(w - 6, 6);
      c.lineTo(w / 2, h - 6);
      c.closePath();
      outline(c, "#b98cb4");
      c.strokeStyle = "rgba(255,255,255,.35)";
      c.lineWidth = 4;
      c.beginPath();
      c.moveTo(20, 18);
      c.lineTo(w - 20, 18);
      c.stroke();
    },
  },
  {
    // Black tee.
    w: 1.05,
    h: 0.95,
    draw: (c, w, h) => {
      c.beginPath();
      c.moveTo(w * 0.3, 6);
      c.quadraticCurveTo(w / 2, 30, w * 0.7, 6);
      c.lineTo(w - 6, 34);
      c.lineTo(w * 0.86, 62);
      c.lineTo(w * 0.78, 52);
      c.lineTo(w * 0.78, h - 6);
      c.lineTo(w * 0.22, h - 6);
      c.lineTo(w * 0.22, 52);
      c.lineTo(w * 0.14, 62);
      c.lineTo(6, 34);
      c.closePath();
      outline(c, "#34303b");
    },
  },
  {
    // Pink towel with stripes.
    w: 0.75,
    h: 1.1,
    draw: (c, w, h) => {
      c.beginPath();
      c.rect(6, 6, w - 12, h - 12);
      outline(c, "#ff9fbf");
      c.fillStyle = "#fffdf6";
      c.fillRect(8, h - 36, w - 16, 8);
      c.fillRect(8, h - 22, w - 16, 5);
    },
  },
  {
    // Socks.
    w: 0.3,
    h: 0.5,
    draw: (c, w, h) => {
      c.beginPath();
      c.moveTo(8, 6);
      c.lineTo(w - 8, 6);
      c.lineTo(w - 8, h * 0.7);
      c.quadraticCurveTo(w - 8, h - 6, w * 0.3, h - 6);
      c.lineTo(8, h - 6);
      c.closePath();
      outline(c, "#f4f1e6");
    },
  },
];

/** Ampaian: a washing line with Qish's laundry swaying in the breeze. */
export function clothesline(x: number, z: number, w: number): Anim {
  const g = new THREE.Group();
  const pole = flat(0x9a9a92);
  const frame = modelBox("clothesline", w + 0.5, 2.45, 0.5);
  if (frame) g.add(frame);
  // Height of the rope at x: cast down onto the generated frame (the rope sags), else the old line.
  const down = new THREE.Raycaster();
  const ropeY = (x: number) => {
    if (!frame) return 2.2;
    frame.updateMatrixWorld(true);
    down.set(new THREE.Vector3(x, 5, 0), new THREE.Vector3(0, -1, 0));
    const hit = down.intersectObject(frame, true).find((h) => h.point.y > 1);
    return hit ? hit.point.y - 0.02 : 2.2;
  };
  if (!frame) for (const px of [-w / 2, w / 2]) {
    const p = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.06, 2.3, 14), pole);
    p.position.set(px, 1.15, 0);
    const t = new THREE.Mesh(roundedBox(0.06, 0.06, 0.6), pole);
    t.position.set(px, 2.25, 0);
    g.add(p, t);
  }
  if (!frame) {
    const line = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, w, 14), flat(0xf4f1e6));
    line.rotation.z = Math.PI / 2;
    line.position.y = 2.2;
    g.add(line);
  }
  const order = [0, 2, 1, 3, 0];
  const hung: THREE.Mesh[] = [];
  let cx = -w / 2 + 0.45;
  for (const gi of order) {
    const gm = GARMENTS[gi];
    if (cx + gm.w > w / 2) break;
    const px = 128;
    const tex = canvasTexture(Math.round(gm.w * px), Math.round(gm.h * px), (c) => gm.draw(c, gm.w * px, gm.h * px));
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(gm.w, gm.h), new THREE.MeshLambertMaterial({ map: tex, alphaTest: 0.5, side: THREE.DoubleSide }));
    mesh.geometry.translate(0, -gm.h / 2, 0);
    mesh.position.set(cx + gm.w / 2, ropeY(cx + gm.w / 2), 0);
    g.add(mesh);
    hung.push(mesh);
    for (const pxo of [-gm.w / 2 + 0.08, gm.w / 2 - 0.08]) {
      const peg = new THREE.Mesh(roundedBox(0.04, 0.12, 0.05), flat(0x3b6fe0));
      peg.position.set(cx + gm.w / 2 + pxo, ropeY(cx + gm.w / 2 + pxo), 0.02);
      g.add(peg);
    }
    cx += gm.w + 0.25;
  }
  g.position.set(x, 0, z);
  const update = (t: number) =>
    hung.forEach((m, i) => {
      const gust = 0.5 + Math.max(0, Math.sin(t * 0.35)) * 0.8;
      m.rotation.x = (Math.sin(t * 2.1 + i * 0.9) * 0.16 + 0.12) * gust;
      m.rotation.y = Math.sin(t * 1.3 + i) * 0.08;
    });
  return { group: shadowed(g), update };
}

/** Buaian: a striped hammock between two posts, rocking gently. */
export function hammock(x: number, z: number, w = 3.6): Anim {
  const gen = modelBox("hammock", w + 0.3, 1.8, 1.0);
  if (gen) return { group: placed(gen, x, z, 0, false), update: () => {} };
  const g = new THREE.Group();
  const wood = flat(0x7a5536);
  for (const px of [-w / 2, w / 2]) {
    const p = new THREE.Mesh(roundedBox(0.18, 1.7, 0.18), wood);
    p.position.set(px, 0.85, 0);
    g.add(p);
  }
  const geo = new THREE.PlaneGeometry(w - 0.3, 0.9, 14, 1);
  geo.rotateX(-Math.PI / 2);
  const pos = geo.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < pos.count; i++) {
    const u = (pos.getX(i) + (w - 0.3) / 2) / (w - 0.3);
    pos.setY(i, -Math.sin(u * Math.PI) * 0.55);
  }
  geo.computeVertexNormals();
  const tex = canvasTexture(128, 32, (c) => {
    ["#ff8fb1", "#ffcb05", "#3b6fe0", "#46b86a", "#fffdf6", "#e3350d"].forEach((col, i) => {
      c.fillStyle = col;
      c.fillRect(0, i * 6, 128, 6);
    });
  });
  const cloth = new THREE.Mesh(geo, new THREE.MeshLambertMaterial({ map: tex, side: THREE.DoubleSide }));
  const pivot = new THREE.Group();
  pivot.position.y = 1.45;
  pivot.add(cloth);
  g.add(pivot);
  g.position.set(x, 0, z);
  const update = (t: number) => (pivot.rotation.x = Math.sin(t * 1.1) * 0.12);
  return { group: shadowed(g), update };
}

// ---------------------------------------------------------------- ambient life

const BUTTERFLY_COLORS = [0xffd84a, 0xffffff, 0xff9fc4, 0x6fb7ff, 0xf28a1c];

export function butterflies(spots: [number, number][]): Anim {
  const group = new THREE.Group();
  const list = spots.map(([x, z], i) => {
    const b = new THREE.Group();
    const mat = new THREE.MeshLambertMaterial({ color: BUTTERFLY_COLORS[i % BUTTERFLY_COLORS.length], side: THREE.DoubleSide, emissive: 0x332200, emissiveIntensity: 0.2 });
    const wings = [-1, 1].map((s) => {
      const geo = new THREE.PlaneGeometry(0.2, 0.17);
      geo.rotateX(-Math.PI / 2);
      geo.translate(0, 0, (s * 0.17) / 2);
      const w = new THREE.Mesh(geo, mat);
      b.add(w);
      return w;
    });
    const body = new THREE.Mesh(roundedBox(0.16, 0.03, 0.03), flat(0x17151f));
    b.add(body);
    group.add(b);
    return { b, wings, x, z, phase: i * 1.7 };
  });
  const update = (t: number) => {
    for (const it of list) {
      const s = t * 0.55 + it.phase;
      it.b.position.set(it.x + Math.sin(s) * 1.8, 0.9 + Math.sin(t * 1.4 + it.phase) * 0.35, it.z + Math.sin(s * 1.37) * 1.2);
      it.b.rotation.y = Math.atan2(-Math.cos(s * 1.37) * 1.37 * 1.2, Math.cos(s) * 1.8);
      const flap = Math.sin(t * 20 + it.phase) * 1.0;
      it.wings[0].rotation.x = flap;
      it.wings[1].rotation.x = -flap;
    }
  };
  return { group, update };
}

/** A small V of birds crossing high over the village every so often; their shadows sweep the ground. */
export function birds(zRange: [number, number]): Anim {
  const group = new THREE.Group();
  const mat = flat(0x3a3a46);
  const list = Array.from({ length: 5 }, (_, i) => {
    const b = new THREE.Group();
    const wings = [-1, 1].map((s) => {
      const geo = new THREE.SphereGeometry(0.28, 16, 10);
      geo.scale(0.38, 0.09, 1);
      geo.translate(-0.02, 0, s * 0.27);
      const w = new THREE.Mesh(geo, mat);
      w.castShadow = true;
      b.add(w);
      return w;
    });
    const body = new THREE.Mesh(new THREE.SphereGeometry(0.12, 16, 12), mat);
    body.scale.set(1.9, 0.9, 0.95);
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.075, 14, 10), mat);
    head.position.set(0.22, 0.04, 0);
    const beak = new THREE.Mesh(new THREE.ConeGeometry(0.025, 0.08, 10), flat(0xf2a51c));
    beak.rotation.z = -Math.PI / 2;
    beak.position.set(0.31, 0.035, 0);
    const tail = new THREE.Mesh(new THREE.SphereGeometry(0.08, 12, 8), mat);
    tail.scale.set(1.6, 0.25, 1);
    tail.position.set(-0.24, 0.01, 0);
    for (const m of [body, head, tail]) m.castShadow = true;
    b.add(body, head, beak, tail);
    group.add(b);
    const row = Math.ceil(i / 2);
    return { b, wings, ox: -row * 0.9, oz: (i % 2 ? -1 : 1) * row * 0.8, phase: i * 0.7 };
  });
  const PERIOD = 32;
  const update = (t: number) => {
    const loop = Math.floor(t / PERIOD);
    const k = (t % PERIOD) / 14;
    group.visible = k < 1;
    if (!group.visible) return;
    const z = zRange[0] + ((loop * 0.618) % 1) * (zRange[1] - zRange[0]);
    const x = -40 + k * 80;
    for (const it of list) {
      it.b.position.set(x + it.ox, 9 + Math.sin(t * 2 + it.phase) * 0.2, z + it.oz);
      const flap = Math.sin(t * 9 + it.phase) * 0.6;
      it.wings[0].rotation.x = flap;
      it.wings[1].rotation.x = -flap;
    }
  };
  return { group, update };
}

/** Soft cloud shadows drifting across the ground. */
export function cloudShadows(zRange: [number, number]): Anim {
  const group = new THREE.Group();
  const tex = radial("rgba(20,30,40,1)", "rgba(20,30,40,0)", 128);
  const list = Array.from({ length: 5 }, (_, i) => {
    const m = new THREE.Mesh(
      new THREE.PlaneGeometry(15 + (i % 3) * 4, 10 + (i % 2) * 3),
      new THREE.MeshBasicMaterial({ map: tex, transparent: true, opacity: 0.16, depthWrite: false }),
    );
    m.rotation.x = -Math.PI / 2;
    m.position.y = 0.08;
    m.renderOrder = 1;
    group.add(m);
    return { m, z: zRange[0] + (i / 4) * (zRange[1] - zRange[0]), start: i * 23, speed: 0.6 + (i % 3) * 0.15 };
  });
  const update = (t: number) => {
    for (const c of list) c.m.position.set((((t * c.speed + c.start) % 100) + 100) % 100 - 50, 0.08, c.z);
  };
  return { group, update };
}

/** Fireflies for the evening party. */
export function fireflies(area: Box, n = 26): Anim {
  const group = new THREE.Group();
  const tex = radial("rgba(240,255,170,1)", "rgba(240,255,170,0)");
  const list = Array.from({ length: n }, (_, i) => {
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
    s.scale.setScalar(0.35);
    group.add(s);
    return { s, x: area[0] + Math.random() * (area[2] - area[0]), z: area[1] + Math.random() * (area[3] - area[1]), phase: i * 2.3 };
  });
  const update = (t: number) => {
    for (const f of list) {
      f.s.position.set(f.x + Math.sin(t * 0.4 + f.phase) * 1.2, 0.8 + Math.sin(t * 0.7 + f.phase) * 0.6, f.z + Math.cos(t * 0.33 + f.phase) * 1.2);
      f.s.material.opacity = Math.max(0, Math.sin(t * 1.8 + f.phase));
    }
  };
  return { group, update };
}

/** Warm pool of light on the ground under a street lamp (evening). */
export function lightPool(x: number, z: number, r = 3) {
  const m = new THREE.Mesh(
    new THREE.PlaneGeometry(r * 2, r * 2),
    new THREE.MeshBasicMaterial({ map: radial("rgba(255,200,120,.38)", "rgba(255,200,120,0)"), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }),
  );
  m.rotation.x = -Math.PI / 2;
  m.position.set(x, 0.09, z);
  return m;
}
