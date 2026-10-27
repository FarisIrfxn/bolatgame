import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { MeshoptDecoder } from "three/examples/jsm/libs/meshopt_decoder.module.js";
import type { ZoneId } from "./zone";

// Files are downloaded to browser storage at boot. Decode only the current
// zone's models, then let the synchronous prop builders clone them as before.

const MODELS = {
  myvi: "/assets/models/myvi.glb",
  // Labu Lanjut set (art/props/labu -> art/3d/labu), 2026-10-25.
  house: "/assets/models/house.glb",
  kedai: "/assets/models/kedai.glb",
  stilt_blue: "/assets/models/stilt_blue.glb",
  stilt_terra: "/assets/models/stilt_terra.glb",
  wakaf: "/assets/models/wakaf.glb",
  mango: "/assets/models/mango.glb",
  raintree: "/assets/models/raintree.glb",
  banana: "/assets/models/banana.glb",
  oilpalm: "/assets/models/oilpalm.glb",
  coconut: "/assets/models/coconut.glb",
  bush: "/assets/models/bush.glb",
  bench: "/assets/models/bench.glb",
  arch: "/assets/models/arch.glb",
  fence: "/assets/models/fence.glb",
  flowerbed: "/assets/models/flowerbed.glb",
  lamppost: "/assets/models/lamppost.glb",
  pole: "/assets/models/pole.glb",
  signboard: "/assets/models/signboard.glb",
  mailbox: "/assets/models/mailbox.glb",
  pot: "/assets/models/pot.glb",
  bridge: "/assets/models/bridge.glb",
  motorbike: "/assets/models/motorbike.glb",
  hammock: "/assets/models/hammock.glb",
  lanternpole: "/assets/models/lanternpole.glb",
  roadblock: "/assets/models/roadblock.glb",
  clothesline: "/assets/models/clothesline.glb",
  // Labu's birthday party on the padang (2026-10-26). The cake came out without its table, so it
  // stands on its own cloth-covered table.
  foodtable: "/assets/models/foodtable.glb",
  cake: "/assets/models/cake.glb",
  clothtable: "/assets/models/clothtable.glb",
  // Qish's bedroom: furnishings in the same painted style as Labu Lanjut.
  bilik_bed: "/assets/models/bilik_bed_solidpink.glb",
  bilik_curtain: "/assets/models/bilik_curtain.glb",
  bilik_desk: "/assets/models/bilik_desk_pink.glb",
  bilik_door: "/assets/models/bilik_door_pink.glb",
  bilik_wardrobe: "/assets/models/bilik_wardrobe.glb",
  bilik_console: "/assets/models/bilik_console.glb",
  bilik_plant: "/assets/models/bilik_plant.glb",
  // Bukit Bintang: painted city architecture, transit and street life.
  bb_screen_tower: "/assets/models/bb_screen_tower.glb",
  bb_shops_left: "/assets/models/bb_shops_left.glb",
  bb_shops_right: "/assets/models/bb_shops_right.glb",
  bb_mrt: "/assets/models/bb_mrt.glb",
  bb_monorail: "/assets/models/bb_monorail.glb",
  bb_monorail_station: "/assets/models/bb_monorail_station.glb",
  bb_bus: "/assets/models/bb_bus.glb",
  bb_car_red: "/assets/models/bb_car_red.glb",
  bb_car_green: "/assets/models/bb_car_green.glb",
  bb_taxi: "/assets/models/bb_taxi.glb",
  bb_burger: "/assets/models/bb_burger.glb",
  bb_shawarma: "/assets/models/bb_shawarma.glb",
  bb_tree: "/assets/models/bb_tree.glb",
  bb_banner_lamp: "/assets/models/bb_banner_lamp.glb",
} as const;
export type ModelId = keyof typeof MODELS;

// Audited against every zone build before/after the ending. Keep this list in
// sync when a builder starts using another GLB; the audit checks every request.
const ZONE_MODELS: Record<ZoneId, readonly ModelId[]> = {
  bilik: ["bilik_bed", "bilik_console", "bilik_curtain", "bilik_desk", "bilik_door", "bilik_plant", "bilik_wardrobe"],
  labulanjut: ["arch", "banana", "bench", "bridge", "bush", "clothesline", "coconut", "fence", "hammock", "house", "kedai", "lamppost", "lanternpole", "mailbox", "mango", "motorbike", "myvi", "oilpalm", "pole", "pot", "raintree", "roadblock", "signboard", "stilt_blue", "stilt_terra", "wakaf"],
  sunway: ["bb_banner_lamp", "bb_bus", "bb_car_green", "bb_car_red", "bb_screen_tower", "bb_shops_left", "bb_shops_right", "bb_taxi", "bb_tree", "motorbike", "myvi", "signboard"],
  galeri: ["motorbike", "myvi", "signboard"],
  dusun: ["bench", "lamppost", "myvi", "raintree", "signboard", "wakaf"],
  angkasa: ["bench", "coconut", "lamppost", "myvi"],
  cosyplace: ["bb_car_green", "bb_car_red", "bb_taxi", "mango", "myvi", "oilpalm", "raintree"],
  photobooth: ["myvi", "signboard"],
  bukit: ["bench", "flowerbed", "motorbike", "myvi", "oilpalm", "raintree", "signboard"],
  sepang: ["bb_car_green", "bb_car_red", "bench", "coconut", "myvi", "oilpalm"],
};

const FADE = new Set<ModelId>([
  "house", "kedai", "stilt_blue", "stilt_terra", "wakaf", "mango", "raintree", "banana", "oilpalm", "coconut", "arch",
  "bb_screen_tower", "bb_shops_left", "bb_shops_right", "bb_tree",
]);

const cache = new Map<ModelId, THREE.Object3D>();
const requested = new Set<ModelId>();
/** Read-only diagnostics for zone dependency and cache lifetime audits. */
export function modelCacheState() {
  return { loaded: [...cache.keys()], requested: [...requested], missing: [...requested].filter(id => !cache.has(id)) };
}
const loader = new GLTFLoader().setMeshoptDecoder(MeshoptDecoder);

export async function prepareZoneModels(zone: ZoneId, party = false) {
  const required = new Set(ZONE_MODELS[zone]);
  if (zone === "labulanjut" && party) {
    required.delete("roadblock");
    for (const id of ["cake", "clothtable", "foodtable"] as const) required.add(id);
  }
  requested.clear();
  // Called only AFTER the old scene has been torn down. Retain the intersection
  // (e.g. Myvi); dispose and close decoded images for everything else.
  for (const [id, scene] of cache) if (!required.has(id)) {
    releaseModel(scene);
    cache.delete(id);
  }
  const pending = [...required].filter(id => !cache.has(id));
  const failures: ModelId[] = [];
  let next = 0;
  const worker = async () => {
    while (next < pending.length) {
      const id = pending[next++];
      try {
        const gltf = await loader.loadAsync(MODELS[id]);
        const converted = new Map<THREE.Material, THREE.Material>();
        const originalTextures = new Set<THREE.Texture>();
        const keptImages = new Set<unknown>();
        const geometries = new Set<THREE.BufferGeometry>();
        gltf.scene.traverse((o) => {
          const m = o as THREE.Mesh;
          if (!m.isMesh) return;
          if (!geometries.has(m.geometry)) {
            dequantize(m.geometry);
            geometries.add(m.geometry);
          }
          // `model()` deliberately clones Object3D hierarchies shallowly so many
          // copies stay cheap. Mark the underlying GPU resources as belonging to
          // this cache; zone teardown and static merging must not dispose them.
          m.geometry.userData.shared = true;
          const materialValue = m.material as THREE.Material | THREE.Material[];
          const wasArray = Array.isArray(materialValue);
          const materials: THREE.Material[] = wasArray ? materialValue : [materialValue];
          const flattened = materials.map((material) => {
            let value = converted.get(material);
            if (!value) {
              for (const texture of Object.values(material)) if (texture?.isTexture) originalTextures.add(texture);
              const source = material as THREE.MeshStandardMaterial;
              if (source.map) keptImages.add(source.map.image);
              value = flatten(source);
              converted.set(material, value);
            }
            return value;
          });
          m.material = wasArray ? flattened : flattened[0];
        });
        // TRELLIS normal/metal/rough maps are deliberately stripped. Close
        // those decoded bitmaps now instead of retaining them with the GLTF.
        const unusedImages = new Set<unknown>();
        for (const texture of originalTextures) if (!keptImages.has(texture.image)) {
          texture.dispose();
          unusedImages.add(texture.image);
        }
        for (const image of unusedImages) closeImage(image);
        cache.set(id, gltf.scene);
      } catch (err) {
        failures.push(id);
        console.warn(`model ${id} failed to load`, err);
      }
    }
  };
  // Bound decode concurrency to avoid a large burst of images/buffers on iOS.
  await Promise.all(Array.from({ length: Math.min(2, pending.length) }, worker));
  if (failures.length) throw new Error(`Models failed to load: ${failures.join(", ")}`);
}

function closeImage(image: unknown) {
  if (typeof ImageBitmap !== "undefined" && image instanceof ImageBitmap) image.close();
}

function releaseModel(scene: THREE.Object3D) {
  const geometries = new Set<THREE.BufferGeometry>();
  const materials = new Set<THREE.Material>();
  const textures = new Set<THREE.Texture>();
  scene.traverse(o => {
    const mesh = o as THREE.Mesh;
    if (!mesh.isMesh) return;
    geometries.add(mesh.geometry);
    for (const mat of Array.isArray(mesh.material) ? mesh.material : [mesh.material]) {
      materials.add(mat);
      for (const value of Object.values(mat)) if (value?.isTexture) textures.add(value);
    }
  });
  for (const geometry of geometries) geometry.dispose();
  for (const material of materials) material.dispose();
  for (const texture of textures) texture.dispose();
  for (const image of new Set([...textures].map(t => t.image))) closeImage(image);
}

/** TRELLIS bakes light and shade into the colour texture and ships a noisy normal map and PBR
 * metal/rough maps. Shaded again by the toon ramp, that read as dark, blotchy and unlike the
 * painted ground. Keep only the colour, lift it a little so its baked shade is not doubled, and let
 * toonify give it the same soft light as everything else. */
function flatten(src: THREE.MeshStandardMaterial) {
  const map = src.map;
  if (map) map.userData.shared = true;
  const m = new THREE.MeshLambertMaterial({ map, side: THREE.DoubleSide, emissive: 0xffffff, emissiveMap: map, emissiveIntensity: 0.22 });
  m.userData.shared = true;
  src.dispose();
  return m;
}

/** The optimised GLBs store positions/normals/uvs as quantised ints (KHR_mesh_quantization).
 * mergeStatic bakes transforms into the vertices, which needs plain floats. */
function dequantize(geo: THREE.BufferGeometry) {
  for (const [name, attr] of Object.entries(geo.attributes) as [string, THREE.BufferAttribute][]) {
    if (attr.array instanceof Float32Array && !attr.normalized) continue;
    const out = new Float32Array(attr.count * attr.itemSize);
    for (let i = 0; i < attr.count; i++) for (let c = 0; c < attr.itemSize; c++) out[i * attr.itemSize + c] = attr.getComponent(i, c);
    geo.setAttribute(name, new THREE.BufferAttribute(out, attr.itemSize));
  }
}

/** A fresh copy of a generated model sitting on y = 0, centred, facing +z (the camera) as it was
 * generated. `size` sets its longest horizontal side, or its height with `by: "height"` (trees).
 * Null until prepareZoneModels() has it, so callers keep a hand-built fallback. */
export function model(id: ModelId, size: number, by: "length" | "height" = "length"): THREE.Group | null {
  return fitted(id, size, by);
}

/** A generated model stretched to fill a w x h x d box (planters, fence runs). `turn` first spins
 * it a quarter so its long side runs along z (a bridge generated lying across x). */
export function modelBox(id: ModelId, w: number, h: number, d: number, turn = false): THREE.Group | null {
  const g = fitted(id, 1, "length");
  if (!g) return null;
  if (turn) g.children[0].rotation.y = Math.PI / 2;
  const box = new THREE.Box3().setFromObject(g);
  const s = box.getSize(new THREE.Vector3());
  g.scale.set(w / s.x, h / s.y, d / s.z);
  return g;
}

function fitted(id: ModelId, size: number, by: "length" | "height"): THREE.Group | null {
  requested.add(id);
  const src = cache.get(id);
  if (!src) return null;
  const inner = src.clone(true);
  const box = new THREE.Box3().setFromObject(inner);
  const dims = box.getSize(new THREE.Vector3());
  const pivot = new THREE.Group();
  const s = size / (by === "height" ? dims.y : Math.max(dims.x, dims.z));
  inner.scale.setScalar(s);
  const c = box.getCenter(new THREE.Vector3());
  inner.position.set(-c.x * s, -box.min.y * s, -c.z * s);
  pivot.add(inner);
  const g = new THREE.Group();
  g.add(pivot);
  g.userData.model = id;
  // Buildings and trees turn see-through when Qish walks behind them (overworld.updateFade).
  if (FADE.has(id)) g.userData.fade = true;
  g.traverse((o) => {
    if ((o as THREE.Mesh).isMesh) o.castShadow = o.receiveShadow = true;
  });
  return g;
}

/** World z of the model's front surface (+z side) at (x, y): where to stick a sign card so it sits
 * on the board instead of floating in front of it or hiding behind it. */
export function frontZ(g: THREE.Object3D, x: number, y: number): number {
  g.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(g);
  const ray = new THREE.Raycaster(new THREE.Vector3(x, y, box.max.z + 1), new THREE.Vector3(0, 0, -1));
  const hit = ray.intersectObject(g, true)[0];
  return (hit ? hit.point.z : box.max.z) + 0.03;
}
