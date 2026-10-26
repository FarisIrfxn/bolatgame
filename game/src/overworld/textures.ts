import * as THREE from "three";

// Hand-painted seamless textures generated in ComfyUI (pipeline: art/textures -> public/assets/textures).
// Preloaded before the first zone so builders can use them synchronously.

const NAMES = ["grass", "dirt", "planks", "bricks", "rooftiles", "plaster", "tar", "foliage", "water", "thatch", "tuft", "flowers", "bilik_floor", "bilik_wood", "bb_pavers", "putra_road", "airport_concrete", "circuit_concrete"] as const;
export type PaintedName = (typeof NAMES)[number];

const cache = new Map<PaintedName, THREE.Texture>();

export async function preloadTextures() {
  const loader = new THREE.TextureLoader();
  await Promise.all(
    NAMES.map(async (n) => {
      try {
        const t = await loader.loadAsync(`/assets/textures/${n}.webp`);
        t.colorSpace = THREE.SRGBColorSpace;
        t.wrapS = t.wrapT = THREE.RepeatWrapping;
        t.anisotropy = 8;
        cache.set(n, t);
      } catch (err) {
        console.warn(`texture ${n} failed to load`, err);
      }
    }),
  );
}

/** A painted texture repeating every `metres` world units over a surface `w` x `h` big (plane or
 * box face UVs run 0..1 across it). Null if it failed to load, so callers keep their fallback. */
export function painted(name: PaintedName, w: number, h: number, metres = 4): THREE.Texture | null {
  const src = cache.get(name);
  if (!src) return null;
  const t = src.clone();
  t.repeat.set(w / metres, h / metres);
  t.userData.shared = true;
  t.needsUpdate = true;
  return t;
}

/** A Lambert material with a painted texture (toonify turns it into the soft-toon look). */
export function paintedMat(name: PaintedName, w: number, h: number, metres = 4, fallback = 0xffffff) {
  const map = painted(name, w, h, metres);
  return map ? new THREE.MeshLambertMaterial({ map }) : new THREE.MeshLambertMaterial({ color: fallback });
}
