import * as THREE from "three";

// Tiny planet: in zones that ask for it, the whole world is wrapped onto a sphere that sits under the camera
// target, so the ground rolls away on every side and the far streets drop over the horizon into the sky.
// It is done in the vertex shader (every material in the zone is patched once), on top of the usual flat
// world: walking, colliders, shadows and the camera all stay flat, only what is drawn bends.

const uniforms = {
  uPlanetC: { value: new THREE.Vector2() },
  /** Sphere radius; 0 = flat (every other zone). */
  uPlanetR: { value: 0 },
};

const BEND = /* glsl */ `
uniform vec2 uPlanetC;
uniform float uPlanetR;
vec3 planetBend(vec3 w) {
  if (uPlanetR <= 0.0) return w;
  vec2 d = w.xz - uPlanetC;
  float r = length(d);
  if (r < 1e-4) return w;
  float th = r / uPlanetR;
  float rr = uPlanetR + w.y;
  return vec3(uPlanetC.x + d.x / r * rr * sin(th), rr * cos(th) - uPlanetR, uPlanetC.y + d.y / r * rr * sin(th));
}
`;

const PROJECT = /* glsl */ `
vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
  mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
  mvPosition = instanceMatrix * mvPosition;
#endif
vec4 planetW = modelMatrix * mvPosition;
planetW.xyz = planetBend( planetW.xyz );
mvPosition = viewMatrix * planetW;
gl_Position = projectionMatrix * mvPosition;
`;

// Sprites face the camera around their bent centre.
const SPRITE_FROM = "vec4 mvPosition = modelViewMatrix[ 3 ];";
const SPRITE_TO = "vec4 planetW = modelMatrix[ 3 ]; planetW.xyz = planetBend( planetW.xyz ); vec4 mvPosition = viewMatrix * planetW;";

export const planet = {
  get radius() {
    return uniforms.uPlanetR.value;
  },
  set radius(r: number) {
    uniforms.uPlanetR.value = r;
  },
  centre(x: number, z: number) {
    uniforms.uPlanetC.value.set(x, z);
  },
  /** Where a flat-world point is drawn (for DOM prompts over the bent world). */
  bend(v: THREE.Vector3) {
    const R = uniforms.uPlanetR.value;
    if (R <= 0) return v;
    const c = uniforms.uPlanetC.value;
    const dx = v.x - c.x;
    const dz = v.z - c.y;
    const r = Math.hypot(dx, dz);
    if (r < 1e-4) return v;
    const th = r / R;
    const rr = R + v.y;
    return v.set(c.x + (dx / r) * rr * Math.sin(th), rr * Math.cos(th) - R, c.y + (dz / r) * rr * Math.sin(th));
  },
};

/** Patch a material so it bends with the planet (harmless in flat zones: the radius is 0 there). */
export function bendMaterial(m: THREE.Material) {
  if (m.userData.planet) return;
  m.userData.planet = true;
  const prev = m.onBeforeCompile;
  const prevKey = m.customProgramCacheKey.bind(m);
  m.onBeforeCompile = (shader, renderer) => {
    prev.call(m, shader, renderer);
    const vs = shader.vertexShader;
    const sprite = vs.includes(SPRITE_FROM);
    if (!sprite && !vs.includes("#include <project_vertex>")) return;
    shader.uniforms.uPlanetC = uniforms.uPlanetC;
    shader.uniforms.uPlanetR = uniforms.uPlanetR;
    shader.vertexShader = vs
      .replace("#include <common>", `#include <common>\n${BEND}`)
      .replace("#include <project_vertex>", PROJECT)
      .replace(SPRITE_FROM, SPRITE_TO);
  };
  m.customProgramCacheKey = () => prevKey() + "|planet";
  m.needsUpdate = true;
}

/** Split triangles until no edge is longer than `maxLen`, so long walls and slabs follow the curve
 * instead of cutting chords through it. Keeps material groups. Returns the same geometry if nothing
 * needed splitting. */
export function tessellate(src: THREE.BufferGeometry, maxLen: number, maxDepth = 7): THREE.BufferGeometry {
  const geo = src.index ? src.toNonIndexed() : src;
  const pos = geo.attributes.position;
  const max2 = maxLen * maxLen;
  let long = false;
  for (let i = 0; i < pos.count && !long; i += 3) {
    for (let e = 0; e < 3; e++) {
      const a = i + e;
      const b = i + ((e + 1) % 3);
      const d2 = (pos.getX(a) - pos.getX(b)) ** 2 + (pos.getY(a) - pos.getY(b)) ** 2 + (pos.getZ(a) - pos.getZ(b)) ** 2;
      if (d2 > max2) {
        long = true;
        break;
      }
    }
  }
  if (!long) return src;

  const names = Object.keys(geo.attributes);
  const attrs = names.map((n) => geo.attributes[n] as THREE.BufferAttribute);
  const out: number[][] = names.map(() => []);
  type V = number[][]; // one array per attribute
  const read = (i: number): V => attrs.map((a) => Array.from({ length: a.itemSize }, (_, k) => a.array[i * a.itemSize + k] as number));
  const mid = (p: V, q: V): V => p.map((arr, ai) => arr.map((x, k) => (x + q[ai][k]) / 2));
  const len2 = (p: V, q: V) => (p[0][0] - q[0][0]) ** 2 + (p[0][1] - q[0][1]) ** 2 + (p[0][2] - q[0][2]) ** 2;
  const emit = (v: V) => v.forEach((arr, ai) => out[ai].push(...arr));
  // Position must be first for len2.
  const pi = names.indexOf("position");
  if (pi !== 0) {
    [names[0], names[pi]] = [names[pi], names[0]];
    [attrs[0], attrs[pi]] = [attrs[pi], attrs[0]];
  }
  const split = (a: V, b: V, c: V, depth: number): number => {
    const ab = len2(a, b);
    const bc = len2(b, c);
    const ca = len2(c, a);
    const m = Math.max(ab, bc, ca);
    if (m <= max2 || depth >= maxDepth) {
      emit(a);
      emit(b);
      emit(c);
      return 3;
    }
    if (m === ab) {
      const n = mid(a, b);
      return split(a, n, c, depth + 1) + split(n, b, c, depth + 1);
    }
    if (m === bc) {
      const n = mid(b, c);
      return split(a, b, n, depth + 1) + split(a, n, c, depth + 1);
    }
    const n = mid(c, a);
    return split(a, b, n, depth + 1) + split(n, b, c, depth + 1);
  };

  const groups = geo.groups.length ? geo.groups : [{ start: 0, count: pos.count, materialIndex: 0 }];
  const res = new THREE.BufferGeometry();
  let start = 0;
  for (const g of groups) {
    let count = 0;
    for (let i = g.start; i < g.start + g.count; i += 3) count += split(read(i), read(i + 1), read(i + 2), 0);
    if (geo.groups.length) res.addGroup(start, count, g.materialIndex);
    start += count;
  }
  names.forEach((n, ai) => res.setAttribute(n, new THREE.Float32BufferAttribute(out[ai], attrs[ai].itemSize, attrs[ai].normalized)));
  if (geo !== src) geo.dispose();
  return res;
}

/** Make everything under `root` bend: patch materials, subdivide big geometry, and stop frustum culling
 * (bending pulls things into view from beyond the flat frustum). */
export function bendTree(root: THREE.Object3D, maxLen = 2.2) {
  root.updateMatrixWorld(true);
  const s = new THREE.Vector3();
  // Geometry shared between meshes is split once.
  const done = new Map<THREE.BufferGeometry, THREE.BufferGeometry>();
  root.traverse((o) => {
    const m = o as THREE.Mesh;
    if (!m.isMesh && !(o as THREE.Sprite).isSprite && !(o as THREE.Points).isPoints && !(o as THREE.Line).isLine) return;
    o.frustumCulled = false;
    const mats = Array.isArray(m.material) ? m.material : [m.material];
    mats.forEach((mat) => mat && bendMaterial(mat));
    if (m.isMesh && !(o as THREE.Sprite).isSprite && m.geometry?.attributes.position) {
      const old = m.geometry;
      if (old.userData.planetDone) return;
      let g = done.get(old);
      if (!g) {
        m.matrixWorld.decompose(new THREE.Vector3(), new THREE.Quaternion(), s);
        const k = Math.max(Math.abs(s.x), Math.abs(s.y), Math.abs(s.z)) || 1;
        g = tessellate(old, maxLen / k);
        g.userData.planetDone = true;
        done.set(old, g);
      }
      m.geometry = g;
    }
  });
  for (const [old, g] of done) if (g !== old) old.dispose();
}
