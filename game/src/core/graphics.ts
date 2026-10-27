export type GraphicsTier = 0 | 1 | 2;
export type GraphicsProfile = { tier: GraphicsTier; name: "tinggi" | "sederhana" | "rendah"; maxDpr: number; shadowSize: number; shadows: boolean; postProcessing: "cinematic" | "grade" | "none" };
export type GraphicsPreference = "auto" | GraphicsProfile["name"];

const PREFERENCE_KEY = "qish-graphics-preference-v1";

const PROFILES: readonly GraphicsProfile[] = [
  { tier: 0, name: "tinggi", maxDpr: 2, shadowSize: 2048, shadows: true, postProcessing: "cinematic" },
  { tier: 1, name: "sederhana", maxDpr: 1.25, shadowSize: 1024, shadows: true, postProcessing: "grade" },
  { tier: 2, name: "rendah", maxDpr: 0.8, shadowSize: 0, shadows: false, postProcessing: "none" },
] as const;

/** Pick once per app session. Safari hides device memory and GPU model, so iOS is conservative. */
export function detectGraphicsProfile(renderer: { getContext(): WebGLRenderingContext | WebGL2RenderingContext }): GraphicsProfile {
  const automatic = detectAutomaticGraphicsProfile(renderer);
  const preference = getGraphicsPreference();
  return preference === "auto" ? automatic : PROFILES.find((profile) => profile.name === preference) ?? automatic;
}

export function getGraphicsPreference(): GraphicsPreference {
  try {
    const stored = localStorage.getItem(PREFERENCE_KEY);
    return stored === "tinggi" || stored === "sederhana" || stored === "rendah" ? stored : "auto";
  } catch { return "auto"; }
}

export function setGraphicsPreference(preference: GraphicsPreference): void {
  try {
    if (preference === "auto") localStorage.removeItem(PREFERENCE_KEY);
    else localStorage.setItem(PREFERENCE_KEY, preference);
  } catch { /* private browsing may block storage */ }
}

function detectAutomaticGraphicsProfile(renderer: { getContext(): WebGLRenderingContext | WebGL2RenderingContext }): GraphicsProfile {
  const ua = navigator.userAgent;
  const iosTouch = /iPhone|iPad|iPod/i.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  let gpu = "";
  try {
    const gl = renderer.getContext();
    const debug = gl.getExtension("WEBGL_debug_renderer_info") as { UNMASKED_RENDERER_WEBGL: number } | null;
    gpu = String(gl.getParameter(debug?.UNMASKED_RENDERER_WEBGL ?? gl.RENDERER));
  } catch { /* use the platform fallback */ }

  const nav = navigator as Navigator & { deviceMemory?: number };
  const memory = nav.deviceMemory;
  const cores = nav.hardwareConcurrency || 0;
  const capableIntegratedGpu = /Mali-G7\d|Mali-G5[7-9]|Adreno (?:6[4-9]\d|7\d\d)|Apple M[1-9]/i.test(gpu);

  let tier: GraphicsTier = 1;
  if (iosTouch || ((memory !== undefined && memory <= 4) || (cores > 0 && cores <= 4) || /Mali-G52|Adreno 61[0-8]|PowerVR GE/i.test(gpu)) && !capableIntegratedGpu) {
    tier = 2;
  } else if (/GeForce|NVIDIA.*RTX|Radeon RX/i.test(gpu)) {
    tier = 0;
  }
  return PROFILES[tier];
}

export const GRAPHICS_PROFILES = PROFILES;
