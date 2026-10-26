import * as THREE from "three";
import { toonRamp } from "./style";
import { painted, type PaintedName } from "./textures";

// One ground surface that paints grass, dirt, tar and pavers together through a soft mask, so paths
// and roads melt into the grass with ragged painted edges instead of sitting on it as hard slabs.
// The mask is a canvas drawn in world units; red = dirt, green = tar, blue = pavers, black = grass.

export type SplatLayer = "dirt" | "tar" | "pavers";
const CHANNEL: Record<SplatLayer, string> = { dirt: "rgb(255,0,0)", tar: "rgb(0,255,0)", pavers: "rgb(0,0,255)" };
const TEXTURE: Record<SplatLayer | "grass", PaintedName> = { grass: "grass", dirt: "dirt", tar: "tar", pavers: "bricks" };

export interface MaskPainter {
  /** A rounded rectangle whose edge wobbles by `rough` metres. */
  rect(layer: SplatLayer, x0: number, z0: number, x1: number, z1: number, rough?: number, radius?: number): void;
  /** A ragged round patch; `strength` below 1 leaves it half grass (worn spots). */
  blob(layer: SplatLayer, x: number, z: number, r: number, rough?: number, strength?: number): void;
  /** A flowing painted path; bends use a smooth spline with rounded ends. */
  path(layer: SplatLayer, points: [number, number][], width: number): void;
  /** An arbitrary footprint, useful for roads and plazas that are rotated in world space. */
  polygon(layer: SplatLayer, points: [number, number][], strength?: number): void;
}

/** Deterministic value noise, so a zone looks the same every visit. */
function wobble(seed: number) {
  return (t: number) => Math.sin(t * 1.7 + seed) * 0.5 + Math.sin(t * 4.3 + seed * 2.1) * 0.3 + Math.sin(t * 9.1 + seed * 3.7) * 0.2;
}

export function splatGround(
  area: [number, number, number, number],
  paint: (p: MaskPainter) => void,
  metres: Record<SplatLayer | "grass", number> = { grass: 7, dirt: 3.2, tar: 5, pavers: 2.2 },
  pxPerMetre = 10,
  base: PaintedName = "grass",
  layerTextures: Partial<Record<SplatLayer, PaintedName>> = {},
  layering: GlobalCompositeOperation = "lighter",
) {
  const [cx, cz, w, d] = area;
  const W = Math.round(w * pxPerMetre);
  const H = Math.round(d * pxPerMetre);
  const raw = document.createElement("canvas");
  raw.width = W;
  raw.height = H;
  const g = raw.getContext("2d")!;
  g.fillStyle = "#000";
  g.fillRect(0, 0, W, H);
  g.globalCompositeOperation = layering;
  const px = (x: number) => (x - (cx - w / 2)) * pxPerMetre;
  const pz = (z: number) => (z - (cz - d / 2)) * pxPerMetre;
  let seed = 1;

  const shape = (layer: SplatLayer, pts: [number, number][], strength = 1) => {
    g.fillStyle = CHANNEL[layer].replace(/255/g, String(Math.round(255 * strength)));
    g.beginPath();
    pts.forEach(([x, z], i) => (i ? g.lineTo(px(x), pz(z)) : g.moveTo(px(x), pz(z))));
    g.closePath();
    g.fill();
  };

  const painter: MaskPainter = {
    rect(layer, x0, z0, x1, z1, rough = 0.35, radius = 0.6) {
      const n = wobble(seed++ * 7.3);
      const pts: [number, number][] = [];
      const r = Math.min(radius, (x1 - x0) / 2, (z1 - z0) / 2);
      // Walk the rounded rectangle's outline, pushing each point in or out along its normal.
      const corners: [number, number, number][] = [[x1 - r, z1 - r, 0], [x0 + r, z1 - r, 0.5], [x0 + r, z0 + r, 1], [x1 - r, z0 + r, 1.5]];
      const sides: [number, number, number, number][] = [[x1, z0 + r, x1, z1 - r], [x1 - r, z1, x0 + r, z1], [x0, z1 - r, x0, z0 + r], [x0 + r, z0, x1 - r, z0]];
      let t = 0;
      const push = (x: number, z: number, nx: number, nz: number) => {
        const o = n(t) * rough;
        pts.push([x + nx * o, z + nz * o]);
        t += 0.35;
      };
      for (let s = 0; s < 4; s++) {
        const [ax, az, bx, bz] = sides[s];
        const len = Math.hypot(bx - ax, bz - az);
        const steps = Math.max(1, Math.round(len * 2));
        const nx = s === 0 ? 1 : s === 2 ? -1 : 0;
        const nz = s === 1 ? 1 : s === 3 ? -1 : 0;
        for (let i = 0; i < steps; i++) push(ax + ((bx - ax) * i) / steps, az + ((bz - az) * i) / steps, nx, nz);
        const [ccx, ccz, start] = corners[s];
        for (let i = 0; i <= 6; i++) {
          const a = (start + (i / 6) * 0.5) * Math.PI;
          push(ccx + Math.cos(a) * r, ccz + Math.sin(a) * r, Math.cos(a), Math.sin(a));
        }
      }
      shape(layer, pts);
    },
    blob(layer, x, z, r, rough = 0.3, strength = 1) {
      const n = wobble(seed++ * 5.1);
      const pts: [number, number][] = [];
      for (let i = 0; i < 40; i++) {
        const a = (i / 40) * Math.PI * 2;
        const rr = r * (1 + n(i * 0.6) * rough);
        pts.push([x + Math.cos(a) * rr, z + Math.sin(a) * rr]);
      }
      shape(layer, pts, strength);
    },
    path(layer, points, width) {
      const curve = new THREE.CatmullRomCurve3(points.map(([x, z]) => new THREE.Vector3(x, 0, z)), false, "centripetal");
      const n = Math.max(16, Math.ceil(curve.getLength() * 3));
      const left: [number, number][] = [], right: [number, number][] = [];
      for (let i = 0; i <= n; i++) {
        const t = i / n, p = curve.getPoint(t), d = curve.getTangent(t);
        const half = width / 2 + Math.sin(t * 43.7) * 0.035;
        left.push([p.x - d.z * half, p.z + d.x * half]);
        right.push([p.x + d.z * half, p.z - d.x * half]);
      }
      shape(layer, [...left, ...right.reverse()]);
      this.blob(layer, ...points[0], width / 2, 0.025);
      this.blob(layer, ...points[points.length - 1], width / 2, 0.025);
    },
    polygon(layer, points, strength = 1) {
      shape(layer, points, strength);
    },
  };
  paint(painter);

  // Soften every edge a little; the shader adds the painterly break-up on top.
  const mask = document.createElement("canvas");
  mask.width = W;
  mask.height = H;
  const m = mask.getContext("2d")!;
  m.filter = `blur(${Math.max(1, pxPerMetre * 0.25)}px)`;
  m.drawImage(raw, 0, 0);
  const maskTex = new THREE.CanvasTexture(mask);
  maskTex.colorSpace = THREE.NoColorSpace;

  const tex = (k: SplatLayer | "grass") => {
    const t = painted((k !== "grass" && layerTextures[k]) || TEXTURE[k], 1, 1, 1);
    if (t) t.repeat.set(1, 1);
    return t;
  };
  const grass = painted(base, 1, 1, 1);
  if (grass) grass.repeat.set(1, 1);
  const mat = new THREE.MeshToonMaterial({ map: grass, gradientMap: toonRamp, color: grass ? 0xffffff : 0x86b95a });
  mat.userData.keepShading = true;
  const uniforms = {
    splatMask: { value: maskTex },
    tDirt: { value: tex("dirt") },
    tTar: { value: tex("tar") },
    tPavers: { value: tex("pavers") },
    reps: { value: new THREE.Vector4(w / metres.grass, w / metres.dirt, w / metres.tar, w / metres.pavers) },
    aspect: { value: d / w },
  };
  mat.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, uniforms);
    shader.fragmentShader = shader.fragmentShader
      .replace(
        "#include <map_pars_fragment>",
        `#include <map_pars_fragment>
        uniform sampler2D splatMask, tDirt, tTar, tPavers;
        uniform vec4 reps;
        uniform float aspect;`,
      )
      .replace(
        "#include <map_fragment>",
        `{
          vec2 uv = vMapUv;
          vec2 tile = vec2(1.0, aspect);
          vec4 mk = texture2D(splatMask, uv);
          vec3 grass = texture2D(map, uv * tile * reps.x).rgb;
          vec3 dirt = texture2D(tDirt, uv * tile * reps.y).rgb;
          vec3 tar = texture2D(tTar, uv * tile * reps.z).rgb;
          vec3 pav = texture2D(tPavers, uv * tile * reps.w).rgb;
          // Break the soft mask edge up with the grass texture itself, like dabs of paint.
          float n = texture2D(map, uv * tile * reps.x * 0.31).g - 0.5;
          float wd = smoothstep(0.32, 0.68, mk.r + n * 0.55);
          float wt = smoothstep(0.4, 0.6, mk.g + n * 0.25);
          float wp = smoothstep(0.38, 0.62, mk.b + n * 0.3);
          vec3 col = mix(grass, dirt, wd);
          col = mix(col, dirt * 0.92, clamp(mk.g * 2.0 - wt, 0.0, 1.0) * 0.6);
          col = mix(col, tar, wt);
          col = mix(col, pav, wp);
          diffuseColor.rgb *= col;
        }`,
      );
  };
  const mesh: THREE.Mesh<THREE.BufferGeometry, THREE.MeshToonMaterial> = new THREE.Mesh(new THREE.PlaneGeometry(w, d), mat);
  mesh.rotation.x = -Math.PI / 2;
  mesh.position.set(cx, 0, cz);
  mesh.receiveShadow = true;
  return mesh;
}

/** Apply the same continuous painted ground to a shore outline, including its lake holes. */
export function splatShape(shape: THREE.Shape, area: [number, number, number, number], paint: (p: MaskPainter) => void, layerTextures: Partial<Record<SplatLayer, PaintedName>> = {}) {
  const m = splatGround(area, paint, undefined, 12, "grass", layerTextures, "source-over");
  m.geometry.dispose();
  const geo = new THREE.ShapeGeometry(shape, 32);
  const pos = geo.getAttribute("position"), uv = geo.getAttribute("uv");
  const [cx, cz, w, d] = area;
  for (let i = 0; i < pos.count; i++) uv.setXY(i, (pos.getX(i) - cx) / w + 0.5, (pos.getY(i) + cz) / d + 0.5);
  m.geometry = geo;
  m.position.set(0, 0.012, 0);
  return m;
}
