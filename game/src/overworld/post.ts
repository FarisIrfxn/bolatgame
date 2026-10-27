import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";

// Diorama look: tilt-shift blur at the top and bottom of the screen plus a warm grade and vignette.

export interface TiltShiftOptions {
  focus?: number;
  range?: number;
  amount?: number;
  lowPower?: boolean;
}

const tiltShift = (dir: [number, number], o: TiltShiftOptions) => ({
  uniforms: {
    tDiffuse: { value: null },
    resolution: { value: new THREE.Vector2(1, 1) },
    dir: { value: new THREE.Vector2(...dir) },
    focus: { value: o.focus ?? 0.46 },
    range: { value: o.range ?? 0.2 },
    amount: { value: o.amount ?? 1.7 },
  },
  vertexShader: /* glsl */ `
    varying vec2 vUv;
    void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
  fragmentShader: /* glsl */ `
    uniform sampler2D tDiffuse;
    uniform vec2 resolution, dir;
    uniform float focus, range, amount;
    varying vec2 vUv;
    void main() {
      float d = abs(vUv.y - focus);
      float b = smoothstep(range, range + 0.32, d) * amount;
      vec4 sum = vec4(0.0);
      float wsum = 0.0;
      for (int i = -7; i <= 7; i++) {
        float w = exp(-float(i * i) / 24.0);
        sum += texture2D(tDiffuse, vUv + dir * float(i) * b / resolution) * w;
        wsum += w;
      }
      gl_FragColor = sum / wsum;
    }`,
});

const grade = {
  uniforms: { tDiffuse: { value: null } },
  vertexShader: /* glsl */ `
    varying vec2 vUv;
    void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
  fragmentShader: /* glsl */ `
    uniform sampler2D tDiffuse;
    varying vec2 vUv;
    void main() {
      vec4 c = texture2D(tDiffuse, vUv);
      float l = dot(c.rgb, vec3(0.299, 0.587, 0.114));
      c.rgb = mix(vec3(l), c.rgb, 1.04);          // the painted textures bring their own colour
      // Keep sunlight creamy while the darkest forms fall gently towards
      // lavender. It is a small grade, not a colour filter over the art.
      vec3 coolShadow = vec3(0.82, 0.79, 0.96);
      vec3 warmLight = vec3(1.06, 1.01, 0.93);
      c.rgb *= mix(coolShadow, warmLight, smoothstep(0.18, 0.78, l));
      float v = smoothstep(0.95, 0.35, distance(vUv, vec2(0.5, 0.48)));
      c.rgb *= mix(0.78, 1.0, v);                 // vignette
      gl_FragColor = c;
    }`,
};

export function makeComposer(renderer: THREE.WebGLRenderer, scene: THREE.Scene, camera: THREE.Camera, tilt: TiltShiftOptions = {}) {
  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  const h = new ShaderPass(tiltShift([1, 0], tilt));
  const v = new ShaderPass(tiltShift([0, 1], tilt));
  composer.addPass(h);
  composer.addPass(v);
  composer.addPass(new ShaderPass(grade));
  composer.addPass(new OutputPass());
  const setTiltShift = (enabled: boolean) => { h.enabled = v.enabled = enabled; };
  setTiltShift(!tilt.lowPower);
  const resize = (w: number, hgt: number) => {
    composer.setPixelRatio(renderer.getPixelRatio());
    composer.setSize(w, hgt);
    const px = renderer.getPixelRatio();
    for (const p of [h, v]) p.uniforms.resolution.value.set(w * px, hgt * px);
  };
  return { composer, resize, setTiltShift };
}
