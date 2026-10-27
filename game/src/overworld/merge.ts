import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";

/**
 * Bake a group of static low-poly props into one mesh per material look, so a busy zone costs a
 * few dozen draw calls instead of well over a thousand (it matters on phones). Multi-material
 * meshes, instanced meshes, lines and sprites are moved across untouched.
 */
export function mergeStatic(src: THREE.Group): THREE.Group {
  // Dev only: the layout audit script turns baking off to measure each prop on its own.
  if (import.meta.env.DEV && (window as unknown as { __noMerge?: boolean }).__noMerge) return src;
  src.updateMatrixWorld(true);
  const out = new THREE.Group();
  // Props that fade when Qish is behind them need their own meshes and materials: keep them whole.
  const faders: THREE.Object3D[] = [];
  src.traverse((o) => {
    if (o.userData.fade && !faders.some((f) => isAncestor(f, o))) faders.push(o);
  });
  for (const o of faders) out.attach(o);
  const buckets = new Map<string, { mat: THREE.Material; cast: boolean; geos: THREE.BufferGeometry[] }>();
  const keep: THREE.Object3D[] = [];
  const merged: THREE.Mesh[] = [];
  src.traverse((o) => {
    const m = o as THREE.Mesh;
    if ((o as THREE.InstancedMesh).isInstancedMesh || (o as THREE.Line).isLine || (o as THREE.Sprite).isSprite || (m.isMesh && Array.isArray(m.material))) {
      keep.push(o);
      return;
    }
    if (!m.isMesh) return;
    const mat = m.material as THREE.MeshLambertMaterial;
    const key = [
      mat.type,
      mat.color?.getHex(),
      mat.map?.uuid,
      mat.alphaMap?.uuid,
      mat.vertexColors,
      mat.emissive?.getHex(),
      mat.emissiveIntensity,
      mat.transparent,
      mat.opacity,
      mat.side,
      mat.alphaTest,
      mat.flatShading,
      m.castShadow,
    ].join("|");
    const g = m.geometry.index ? m.geometry.toNonIndexed() : m.geometry.clone();
    g.applyMatrix4(m.matrixWorld);
    for (const name of Object.keys(g.attributes)) if (name !== "position" && name !== "normal" && name !== "uv" && !(name === "color" && mat.vertexColors)) g.deleteAttribute(name);
    if (!g.attributes.normal) g.computeVertexNormals();
    if (!g.attributes.uv) g.setAttribute("uv", new THREE.Float32BufferAttribute(new Float32Array(g.attributes.position.count * 2), 2));
    g.clearGroups();
    let b = buckets.get(key);
    if (!b) buckets.set(key, (b = { mat, cast: m.castShadow, geos: [] }));
    b.geos.push(g);
    merged.push(m);
  });
  for (const o of keep) out.attach(o);
  for (const { mat, cast, geos } of buckets.values()) {
    const mesh = new THREE.Mesh(mergeGeometries(geos), mat);
    mesh.castShadow = cast;
    mesh.receiveShadow = true;
    out.add(mesh);
    geos.forEach((g) => g.dispose());
  }
  const used = new Set([...buckets.values()].map((b) => b.mat));
  for (const m of merged) {
    if (!m.geometry.userData.shared) m.geometry.dispose();
    const material = m.material as THREE.Material;
    if (!used.has(material) && !material.userData.shared) material.dispose();
  }
  return out;
}

function isAncestor(a: THREE.Object3D, o: THREE.Object3D) {
  for (let p = o.parent; p; p = p.parent) if (p === a) return true;
  return false;
}
