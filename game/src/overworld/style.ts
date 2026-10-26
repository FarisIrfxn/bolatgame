import * as THREE from "three";

// Style B (Faris's pick, 2026-10-25; anchor: art/style/style_B.png): an Animal Crossing / Kirby
// world. Chunky rounded forms, soft two-band toon shading that falls into warm-lilac shadow,
// pastel but saturated colours. Characters stay 2D outlined paper cutouts on top of it.
//
// Every zone is converted to this look after it builds (toonify), so props keep using plain
// Lambert materials and still match. Reach for PAL when choosing colours for new props.

export const PAL = {
  grass: 0x8fc45a,
  grassDeep: 0x6fa94a,
  grassMown: ["#9bcb62", "#8cbf55"],
  sand: 0xecc58c,
  sandEdge: 0xd9a96b,
  wallCream: 0xfbe9cf,
  wallPeach: 0xf7d2bd,
  roofPlum: 0x8e6a92,
  roofPlumDark: 0x735479,
  wood: 0x9b6a45,
  woodDark: 0x7a4c33,
  woodLight: 0xc89a6a,
  stone: 0xe4d8c4,
  leaf: 0x6fb04a,
  leafLight: 0x86c45a,
  leafDeep: 0x4f9442,
  trunk: 0x9a6a44,
  palmLeaf: 0x7cc155,
  bloomPink: 0xff8fb8,
  bloomMagenta: 0xe0569a,
  bloomWhite: 0xfff8ee,
  bloomYellow: 0xffd65c,
  terracotta: 0xd9774c,
  carRed: 0xe2463c,
  glass: 0x8cc6e8,
  ink: 0x3b3046,
} as const;

/** Light ramp sampled at half-Lambert (0 = facing away, 1 = facing the sun): a soft shadow band
 * and a soft lit band, instead of Lambert's long even falloff. */
function makeRamp() {
  const n = 256;
  const data = new Uint8Array(n * 4);
  const smooth = (a: number, b: number, x: number) => {
    const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
    return t * t * (3 - 2 * t);
  };
  for (let i = 0; i < n; i++) {
    const u = i / (n - 1);
    const v = 0.6 + 0.24 * smooth(0.36, 0.6, u) + 0.16 * smooth(0.62, 0.98, u);
    data.set([v * 255, v * 255, v * 255, 255], i * 4);
  }
  const tex = new THREE.DataTexture(data, n, 1);
  tex.minFilter = tex.magFilter = THREE.LinearFilter;
  tex.generateMipmaps = false;
  tex.needsUpdate = true;
  tex.userData.shared = true;
  return tex;
}

export const toonRamp = makeRamp();

type LitMaterial = THREE.MeshLambertMaterial | THREE.MeshPhongMaterial | THREE.MeshStandardMaterial;

const CONVERT = new Set(["MeshLambertMaterial", "MeshPhongMaterial", "MeshStandardMaterial", "MeshPhysicalMaterial"]);

function toToon(src: LitMaterial) {
  const m = new THREE.MeshToonMaterial({
    color: src.color,
    map: src.map,
    gradientMap: toonRamp,
    emissive: src.emissive,
    emissiveIntensity: src.emissiveIntensity,
    emissiveMap: src.emissiveMap,
    normalMap: (src as THREE.MeshStandardMaterial).normalMap ?? null,
    alphaMap: src.alphaMap,
    transparent: src.transparent,
    opacity: src.opacity,
    alphaTest: src.alphaTest,
    side: src.side,
    vertexColors: src.vertexColors,
    depthWrite: src.depthWrite,
    depthTest: src.depthTest,
    fog: src.fog,
  });
  m.name = src.name;
  m.userData = src.userData;
  m.polygonOffset = src.polygonOffset;
  m.polygonOffsetFactor = src.polygonOffsetFactor;
  m.polygonOffsetUnits = src.polygonOffsetUnits;
  return m;
}

/** Swap every lit material under `root` for its soft-toon twin. Materials shared before stay
 * shared after (one twin each), so baked meshes keep their few draw calls. Run it before
 * anything patches shaders (the tiny-planet bend). */
export function toonify(root: THREE.Object3D) {
  const twins = new Map<THREE.Material, THREE.Material>();
  const swap = (mat: THREE.Material) => {
    if (!CONVERT.has(mat.type) || mat.userData.keepShading) return mat;
    let t = twins.get(mat);
    if (!t) {
      twins.set(mat, (t = toToon(mat as LitMaterial)));
      mat.dispose();
    }
    return t;
  };
  root.traverse((o) => {
    const m = o as THREE.Mesh;
    if (!m.isMesh || !m.material) return;
    m.material = Array.isArray(m.material) ? m.material.map(swap) : swap(m.material);
  });
}
