import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { frontZ, model, modelBox } from "./models";
import { PAL } from "./style";

// Soft toy-diorama props. The whole overworld shares this material, so a cheap
// hand-built prop still belongs beside the few hero assets we generate later.
// Deliberately do not use flat shading: rounded forms and soft light are the
// visual grammar of the Animal Crossing / Kirby direction.

export const palette = {
  ink: 0x2b2638,
  warmLight: 0xffe4bb,
  coolShadow: 0x8d83b7,
};

export const flat = (color: number) =>
  new THREE.MeshLambertMaterial({ color, emissive: color, emissiveIntensity: 0.025, flatShading: false });

/** A low-segment soft cuboid. Reserve this for readable foreground props, not flooring or tiny detail. */
export function roundedBox(w: number, h: number, d: number, radius = 0.12, segments = 2) {
  return new RoundedBoxGeometry(w, h, d, segments, Math.min(radius, w / 4, h / 4, d / 4));
}

/** A fluffy rounded tree crown in the style-B way: one big smooth ball ringed and topped with
 * smaller balls so the silhouette scallops like a cloud. `squash` flattens it (umbrella trees). */
export function cloudCrown(r: number, colors: readonly number[], seed = 0, squash = 1) {
  const g = new THREE.Group();
  const ball = (radius: number, x: number, y: number, z: number, c: number) => {
    const m = new THREE.Mesh(new THREE.SphereGeometry(radius, 18, 14), flat(c));
    m.position.set(x, y * squash, z);
    m.scale.y = squash;
    g.add(m);
  };
  ball(r, 0, 0, 0, colors[0]);
  const ring = 7;
  for (let i = 0; i < ring; i++) {
    const a = (i / ring) * Math.PI * 2 + seed;
    const rr = r * (0.5 + ((i * 37 + seed * 11) % 5) * 0.03);
    ball(rr, Math.cos(a) * r * 0.78, -r * 0.18 + (i % 2) * r * 0.12, Math.sin(a) * r * 0.78, colors[i % colors.length]);
  }
  for (let i = 0; i < 3; i++) {
    const a = (i / 3) * Math.PI * 2 + seed * 2;
    ball(r * 0.48, Math.cos(a) * r * 0.38, r * 0.62, Math.sin(a) * r * 0.38, colors[(i + 1) % colors.length]);
  }
  return g;
}

/** A soft leaf blade (banana, palm frond): rounded outline, drooping along its length. It grows
 * from the origin along +z; tilt it with the returned mesh's rotation. */
export function leafBlade(len: number, width: number, droop: number, mat: THREE.Material, roundness = 0.6) {
  const geo = new THREE.PlaneGeometry(width, len, 2, 8);
  geo.rotateX(-Math.PI / 2);
  geo.translate(0, 0, len / 2);
  const p = geo.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < p.count; i++) {
    const t = p.getZ(i) / len;
    p.setX(i, p.getX(i) * Math.pow(Math.sin(Math.PI * Math.min(1, t * 0.92 + 0.08)), roundness));
    p.setY(i, p.getY(i) - droop * t * t + Math.abs(p.getX(i)) * 0.25);
  }
  geo.computeVertexNormals();
  return new THREE.Mesh(geo, mat);
}

function shadowed<T extends THREE.Object3D>(o: T): T {
  o.traverse((c) => {
    if ((c as THREE.Mesh).isMesh) {
      c.castShadow = true;
      c.receiveShadow = true;
    }
  });
  return o;
}

export function canvasTexture(w: number, h: number, draw: (g: CanvasRenderingContext2D) => void) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  draw(c.getContext("2d")!);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

export function signTexture(text: string, bg: string, fg: string, w = 512, h = 128, font = "bold 74px 'Bagel Fat One', sans-serif") {
  return canvasTexture(w, h, (g) => {
    g.fillStyle = bg;
    g.fillRect(0, 0, w, h);
    g.strokeStyle = "rgba(0,0,0,.18)";
    g.lineWidth = 8;
    g.strokeRect(4, 4, w - 8, h - 8);
    g.fillStyle = fg;
    g.font = font;
    g.textAlign = "center";
    g.textBaseline = "middle";
    g.fillText(text, w / 2, h / 2 + 4);
  });
}

function windowsTexture(cols: number, rows: number, wall: string, glass: string, band?: string) {
  return canvasTexture(64 * cols, 64 * rows, (g) => {
    g.fillStyle = wall;
    g.fillRect(0, 0, 64 * cols, 64 * rows);
    for (let r = 0; r < rows; r++) {
      if (band && r === rows - 1) {
        g.fillStyle = band;
        g.fillRect(0, r * 64 + 52, 64 * cols, 12);
      }
      for (let c = 0; c < cols; c++) {
        g.fillStyle = glass;
        g.fillRect(c * 64 + 10, r * 64 + 12, 44, 34);
        g.fillStyle = "rgba(255,255,255,.35)";
        g.fillRect(c * 64 + 12, r * 64 + 14, 12, 30);
      }
    }
  });
}

/** Clay roof tiles: rows run across the texture's v axis, each row lit on top and shaded under its
 * scalloped lip. Repeat it so a row is about half a metre. */
function roofTiles(base: string, dark: string, light: string) {
  const t = canvasTexture(128, 128, (g) => {
    g.fillStyle = base;
    g.fillRect(0, 0, 128, 128);
    for (let row = 0; row < 4; row++) {
      const y = row * 32;
      const grad = g.createLinearGradient(0, y, 0, y + 32);
      grad.addColorStop(0, light);
      grad.addColorStop(0.55, base);
      grad.addColorStop(1, dark);
      g.fillStyle = grad;
      g.fillRect(0, y, 128, 32);
      g.fillStyle = dark;
      for (let k = 0; k < 4; k++) {
        const x = k * 32 + (row % 2) * 16;
        g.beginPath();
        g.ellipse(x + 16, y + 31, 15, 5, 0, 0, Math.PI);
        g.fill();
        g.fillRect(x - 1, y + 4, 2, 26);
      }
    }
  });
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return t;
}

export function roofTileMaterial(color: number, repeatAlong: number) {
  const c = new THREE.Color(color);
  const css = (k: number) => `#${c.clone().multiplyScalar(k).getHexString()}`;
  const t = roofTiles(css(1), css(0.78), css(1.18));
  t.repeat.set(repeatAlong, 4);
  return new THREE.MeshLambertMaterial({ map: t });
}

/** Two sloped roof slabs meeting at a ridge along x, `span` wide (eave to eave) and `len` long. */
export function pitchedRoof(len: number, span: number, rise: number, mat: THREE.Material, thick = 0.26) {
  const g = new THREE.Group();
  const half = span / 2;
  const slope = Math.hypot(half, rise);
  const a = Math.atan2(rise, half);
  for (const side of [1, -1]) {
    const slab = new THREE.Mesh(roundedBox(len, thick, slope, 0.1, 3), mat);
    slab.rotation.x = a * side;
    slab.position.set(0, rise / 2, (side * half) / 2);
    g.add(slab);
  }
  const ridge = new THREE.Mesh(new THREE.CapsuleGeometry(0.2, len - 0.3, 4, 10), mat);
  ridge.rotation.z = Math.PI / 2;
  ridge.position.y = rise + 0.08;
  g.add(ridge);
  return g;
}

/** A solid gable triangle (wall infill under a pitched roof), `span` wide and `rise` high, facing z. */
export function gableWall(span: number, rise: number, mat: THREE.Material, depth = 0.3) {
  const shape = new THREE.Shape();
  shape.moveTo(-span / 2, 0);
  shape.lineTo(0, rise);
  shape.lineTo(span / 2, 0);
  shape.lineTo(-span / 2, 0);
  const geo = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: true, bevelThickness: 0.06, bevelSize: 0.06, bevelSegments: 2 });
  geo.translate(0, 0, -depth / 2);
  return new THREE.Mesh(geo, mat);
}

export interface Building {
  group: THREE.Group;
  box: [number, number, number, number]; // collider x0, z0, x1, z1
}

export function simpleBuilding(x: number, z: number, w: number, d: number, h: number, wall: string, roofColor: number, band?: string): Building {
  const g = new THREE.Group();
  const tex = windowsTexture(Math.max(2, Math.round(w / 1.6)), Math.max(1, Math.round(h / 3)), wall, "#58748f", band);
  const sideTex = windowsTexture(Math.max(2, Math.round(d / 1.6)), Math.max(1, Math.round(h / 3)), wall, "#58748f", band);
  const mats = [
    new THREE.MeshLambertMaterial({ map: sideTex }),
    new THREE.MeshLambertMaterial({ map: sideTex }),
    flat(roofColor),
    flat(roofColor),
    new THREE.MeshLambertMaterial({ map: tex }),
    new THREE.MeshLambertMaterial({ map: tex }),
  ];
  const body = new THREE.Mesh(roundedBox(w, h, d, 0.24), mats);
  body.position.y = h / 2;
  g.add(body);
  const roof = new THREE.Mesh(roundedBox(w + 0.4, 0.4, d + 0.4, 0.12), flat(roofColor));
  roof.position.y = h + 0.2;
  g.add(roof);
  g.position.set(x, 0, z);
  return { group: shadowed(g), box: [x - w / 2, z - d / 2, x + w / 2, z + d / 2] };
}

export function palm(x: number, z: number, scale = 1, seed = 0) {
  const gen = model("coconut", 6.2 * scale, "height");
  if (gen) {
    gen.position.set(x, 0, z);
    gen.rotation.y = seed * 2.399;
    return gen;
  }
  const g = new THREE.Group();
  const trunkMat = flat(PAL.trunk);
  const ringMat = flat(0x84593a);
  const lean = ((seed % 5) - 2) * 0.05;
  let px = 0;
  let py = 0;
  const segs = 6;
  for (let i = 0; i < segs; i++) {
    const seg = new THREE.Mesh(new THREE.CylinderGeometry(0.17 - i * 0.012, 0.2 - i * 0.012, 0.75, 12), i % 2 ? trunkMat : ringMat);
    px += lean * (i + 1) * 0.3;
    seg.position.set(px, py + 0.375, 0);
    seg.rotation.z = -lean * (i + 1) * 0.35;
    py += 0.72;
    g.add(seg);
  }
  const leafMat = flat(seed % 2 ? PAL.palmLeaf : PAL.leafLight);
  leafMat.side = THREE.DoubleSide;
  for (let i = 0; i < 8; i++) {
    const leaf = leafBlade(2.5, 0.7, 1.1, leafMat, 0.5);
    const pivot = new THREE.Group();
    pivot.position.set(px, py, 0);
    pivot.rotation.y = (i / 8) * Math.PI * 2 + seed;
    leaf.rotation.x = -0.35 - (i % 2) * 0.2;
    pivot.add(leaf);
    g.add(pivot);
  }
  for (let i = 0; i < 3; i++) {
    const nut = new THREE.Mesh(new THREE.SphereGeometry(0.17, 12, 10), flat(0x8a6a2a));
    nut.position.set(px + Math.cos(i * 2.1) * 0.2, py - 0.18, Math.sin(i * 2.1) * 0.2);
    g.add(nut);
  }
  g.position.set(x, 0, z);
  g.scale.setScalar(scale);
  return shadowed(g);
}

export function bush(x: number, z: number, s = 1, color: number = PAL.leaf) {
  const gen = model("bush", 1.25 * s, "height");
  if (gen) {
    gen.position.set(x, 0, z);
    gen.rotation.y = x * 1.7 + z;
    return gen;
  }
  const g = new THREE.Group();
  const shades = [color, PAL.leafDeep, PAL.leafLight];
  for (let i = 0; i < 5; i++) {
    const r = (i < 3 ? 0.55 : 0.4) * s;
    const b = new THREE.Mesh(new THREE.SphereGeometry(r, 16, 12), flat(shades[i % 3]));
    const a = i * 2.1 + x;
    b.position.set(i < 3 ? (i - 1) * 0.5 * s : Math.cos(a) * 0.3 * s, i < 3 ? 0.45 * s : 0.85 * s, i < 3 ? (i % 2) * 0.2 * s : Math.sin(a) * 0.2 * s);
    b.scale.y = 0.9;
    g.add(b);
  }
  g.position.set(x, 0, z);
  return shadowed(g);
}

/** A round little flower: five petal balls round a yellow heart. */
function blossom(color: number, r = 0.07) {
  const g = new THREE.Group();
  const petal = flat(color);
  for (let i = 0; i < 5; i++) {
    const p = new THREE.Mesh(new THREE.SphereGeometry(r, 8, 6), petal);
    const a = (i / 5) * Math.PI * 2;
    p.position.set(Math.cos(a) * r * 1.1, 0, Math.sin(a) * r * 1.1);
    p.scale.y = 0.6;
    g.add(p);
  }
  const heart = new THREE.Mesh(new THREE.SphereGeometry(r * 0.75, 8, 6), flat(PAL.bloomYellow));
  heart.position.y = r * 0.25;
  g.add(heart);
  return g;
}

export function flowerBed(x: number, z: number, w: number, d: number) {
  const gen = modelBox("flowerbed", w, 0.8, d);
  if (gen) {
    gen.position.set(x, 0, z);
    return gen;
  }
  const g = new THREE.Group();
  const frame = new THREE.Mesh(roundedBox(w, 0.34, d, 0.12, 3), flat(PAL.woodLight));
  frame.position.y = 0.17;
  const soil = new THREE.Mesh(roundedBox(w - 0.22, 0.3, d - 0.22, 0.1, 2), flat(0x8a5c3c));
  soil.position.y = 0.2;
  g.add(frame, soil);
  const colors = [PAL.bloomPink, PAL.bloomWhite, PAL.bloomMagenta, PAL.bloomYellow, 0xb58cff];
  const n = Math.round(w * d * 5);
  for (let i = 0; i < n; i++) {
    const fx = (((i * 0.618) % 1) - 0.5) * (w - 0.45);
    const fz = (((i * 0.382 + 0.17) % 1) - 0.5) * (d - 0.4);
    const leaf = new THREE.Mesh(new THREE.SphereGeometry(0.17, 10, 8), flat(i % 2 ? PAL.leaf : PAL.leafDeep));
    leaf.position.set(fx, 0.42, fz);
    leaf.scale.y = 0.8;
    const f = blossom(colors[i % colors.length]);
    f.position.set(fx + 0.05, 0.58 + (i % 3) * 0.04, fz + 0.04);
    g.add(leaf, f);
  }
  g.position.set(x, 0, z);
  return shadowed(g);
}

export function lampPost(x: number, z: number) {
  const gen = model("lamppost", 3.5, "height");
  if (gen) {
    gen.position.set(x, 0, z);
    return gen;
  }
  const g = new THREE.Group();
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.11, 3.2, 12), flat(0x5a4a5e));
  pole.position.y = 1.6;
  g.add(pole);
  const head = new THREE.Mesh(roundedBox(0.42, 0.3, 0.42, 0.1), flat(0x4a3d4f));
  head.position.y = 3.3;
  g.add(head);
  const glow = new THREE.Mesh(roundedBox(0.3, 0.1, 0.3, 0.04), new THREE.MeshBasicMaterial({ color: 0xfff1c2 }));
  glow.position.y = 3.13;
  g.add(glow);
  g.position.set(x, 0, z);
  return shadowed(g);
}

/** Birthday balloons tied to something; returns the group and an update fn for the bobbing. */
export function balloons(x: number, z: number, baseY: number) {
  const g = new THREE.Group();
  const colors = [0xe3350d, 0xffcb05, 0x3b6fe0, 0xff8fb1, 0x46b86a];
  const items: { mesh: THREE.Mesh; line: THREE.Line; phase: number; home: THREE.Vector3 }[] = [];
  colors.forEach((c, i) => {
    const mesh = new THREE.Mesh(
      new THREE.SphereGeometry(0.32, 18, 14),
      new THREE.MeshLambertMaterial({ color: c, emissive: c, emissiveIntensity: 0.15 }),
    );
    mesh.scale.y = 1.18;
    const home = new THREE.Vector3(Math.cos(i * 1.3) * 0.5, baseY + 1.2 + (i % 3) * 0.35, Math.sin(i * 1.3) * 0.4);
    mesh.position.copy(home);
    mesh.castShadow = true;
    const geo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, baseY, 0), home]);
    const line = new THREE.Line(geo, new THREE.LineBasicMaterial({ color: 0xffffff }));
    g.add(mesh, line);
    items.push({ mesh, line, phase: i * 0.9, home });
  });
  if (baseY < 0.1) {
    // Tied down on the grass: the strings meet at a little weight.
    const weight = new THREE.Mesh(roundedBox(0.2, 0.16, 0.2, 0.06), new THREE.MeshLambertMaterial({ color: 0xff8fb1 }));
    weight.position.y = 0.08;
    weight.castShadow = true;
    g.add(weight);
  }
  g.position.set(x, 0, z);
  const update = (t: number) => {
    for (const it of items) {
      it.mesh.position.set(
        it.home.x + Math.sin(t * 0.9 + it.phase) * 0.08,
        it.home.y + Math.sin(t * 1.4 + it.phase) * 0.1,
        it.home.z + Math.cos(t * 0.8 + it.phase) * 0.06,
      );
      const pos = it.line.geometry.attributes.position as THREE.BufferAttribute;
      pos.setXYZ(1, it.mesh.position.x, it.mesh.position.y - 0.36, it.mesh.position.z);
      pos.needsUpdate = true;
    }
  };
  return { group: g, update };
}

/** A bench facing +z, turned by `rotY`. */
export function bench(x: number, z: number, rotY = 0) {
  const gen = model("bench", 2.3);
  if (gen) {
    gen.position.set(x, 0, z);
    gen.rotation.y = rotY;
    return gen;
  }
  const g = new THREE.Group();
  const wood = flat(PAL.woodLight);
  const iron = flat(0x5a4a5e);
  for (let i = 0; i < 3; i++) {
    const slat = new THREE.Mesh(roundedBox(2.2, 0.1, 0.18, 0.05), wood);
    slat.position.set(0, 0.55, -0.2 + i * 0.2);
    g.add(slat);
  }
  for (let i = 0; i < 2; i++) {
    const slat = new THREE.Mesh(roundedBox(2.2, 0.16, 0.08, 0.04), wood);
    slat.position.set(0, 0.82 + i * 0.22, -0.31);
    slat.rotation.x = -0.12;
    g.add(slat);
  }
  for (const sx of [-0.92, 0.92]) {
    const leg = new THREE.Mesh(new THREE.TorusGeometry(0.26, 0.045, 8, 16, Math.PI), iron);
    leg.position.set(sx, 0.28, 0);
    leg.rotation.y = Math.PI / 2;
    const back = new THREE.Mesh(new THREE.CapsuleGeometry(0.04, 0.6, 3, 8), iron);
    back.position.set(sx, 0.8, -0.33);
    back.rotation.x = -0.12;
    g.add(leg, back);
  }
  g.position.set(x, 0, z);
  g.rotation.y = rotY;
  return shadowed(g);
}

/** Qish's red Myvi: the generated model (art/3d), or a hand-built stand-in if it failed to load.
 * Nose towards +z before `rotY`. */
export function myvi(x: number, z: number, rotY = 0) {
  const car = model("myvi", 3.5);
  if (car) {
    car.position.set(x, 0, z);
    car.rotation.y = rotY;
    return car;
  }
  const g = new THREE.Group();
  const red = flat(0xd8282a);
  const body = new THREE.Mesh(roundedBox(1.8, 0.75, 3.5, 0.22), red);
  body.position.y = 0.65;
  const cabin = new THREE.Mesh(roundedBox(1.62, 0.7, 2.1, 0.25), red);
  cabin.position.set(0, 1.35, -0.25);
  const glass = new THREE.Mesh(roundedBox(1.66, 0.48, 1.9, 0.18), flat(0x2f4258));
  glass.position.set(0, 1.4, -0.25);
  const bonnet = new THREE.Mesh(roundedBox(1.7, 0.3, 0.9, 0.13), red);
  bonnet.position.set(0, 1.0, 1.25);
  bonnet.rotation.x = 0.25;
  g.add(body, cabin, glass, bonnet);
  for (const [wx, wz] of [[-0.85, 1.1], [0.85, 1.1], [-0.85, -1.15], [0.85, -1.15]]) {
    const w = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.34, 0.25, 10), flat(0x1c1c22));
    w.rotation.z = Math.PI / 2;
    w.position.set(wx, 0.34, wz);
    g.add(w);
  }
  for (const hx of [-0.55, 0.55]) {
    const hl = new THREE.Mesh(roundedBox(0.35, 0.18, 0.05, 0.02), new THREE.MeshBasicMaterial({ color: 0xfff6cf }));
    hl.position.set(hx, 0.8, 1.76);
    g.add(hl);
  }
  g.position.set(x, 0, z);
  g.rotation.y = rotY;
  return shadowed(g);
}

/** Simple standing signboard with text. */
export function signBoard(x: number, z: number, text: string) {
  const gen = model("signboard", 2.0, "height");
  if (gen) {
    gen.position.set(x, 0, z);
    // The generated board is blank; the words go on a thin card over its face.
    const box = new THREE.Box3().setFromObject(gen);
    const s = box.getSize(new THREE.Vector3());
    // Painted straight onto the board: same cream, no frame of its own.
    const words = canvasTexture(512, 340, (c) => {
      c.fillStyle = "#f6e9cc";
      c.fillRect(0, 0, 512, 340);
      c.fillStyle = "#4a3418";
      c.font = `bold ${Math.min(150, Math.floor(1150 / Math.max(6, text.length)))}px 'Gaegu', sans-serif`;
      c.textAlign = "center";
      c.textBaseline = "middle";
      c.fillText(text, 256, 176);
    });
    const card = new THREE.Mesh(new THREE.PlaneGeometry(s.x * 0.76, s.y * 0.48), new THREE.MeshLambertMaterial({ map: words }));
    const cy = box.min.y + s.y * 0.6;
    card.position.set(x, cy, frontZ(gen, x, cy));
    card.rotation.x = -0.1;
    const g = new THREE.Group();
    g.add(gen, card);
    return g;
  }
  const g = new THREE.Group();
  const board = new THREE.Mesh(
    roundedBox(1.9, 1.0, 0.12, 0.05),
    [flat(0x7a5536), flat(0x7a5536), flat(0x7a5536), flat(0x7a5536), new THREE.MeshLambertMaterial({ map: signTexture(text, "#fff6dd", "#3b2f00", 512, 256, "bold 64px 'Gaegu', sans-serif") }), flat(0x7a5536)],
  );
  board.position.y = 1.25;
  board.rotation.x = -0.2;
  const post = new THREE.Mesh(roundedBox(0.14, 1.0, 0.14, 0.05), flat(0x7a5536));
  post.position.y = 0.5;
  g.add(board, post);
  g.position.set(x, 0, z);
  return shadowed(g);
}

/** Gate arch at a zone exit. */
export function gate(x: number, z: number, text: string) {
  const g = new THREE.Group();
  const wood = flat(0xf28a1c);
  for (const sz of [-1.8, 1.8]) {
    const p = new THREE.Mesh(roundedBox(0.35, 3.4, 0.35, 0.11), wood);
    p.position.set(0, 1.7, sz);
    g.add(p);
  }
  const beam = new THREE.Mesh(roundedBox(0.4, 0.4, 4.4, 0.12), wood);
  beam.position.y = 3.4;
  g.add(beam);
  // The sign faces the camera (+z) so it reads from the overworld view.
  const panel = new THREE.Mesh(
    roundedBox(4.2, 1.05, 0.15, 0.06),
    [flat(0xd8701a), flat(0xd8701a), flat(0xd8701a), flat(0xd8701a), new THREE.MeshLambertMaterial({ map: signTexture(text, "#fffdf6", "#1f2f7a", 640, 160, "bold 64px 'Bagel Fat One', sans-serif") }), flat(0xd8701a)],
  );
  panel.position.set(0, 4.2, 0);
  g.add(panel);
  g.position.set(x, 0, z);
  return shadowed(g);
}
