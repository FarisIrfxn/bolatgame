export type GraphicsMode = "auto" | "low" | "high";
export type GraphicsTier = 0 | 1 | 2;

const KEY = "qish-graphics-mode-v1";
const changed = new EventTarget();
let mode: GraphicsMode = readMode();
let tier: GraphicsTier = mode === "low" ? 2 : mode === "high" ? 0 : (navigator.maxTouchPoints > 0 ? 1 : 0);

function readMode(): GraphicsMode {
  try {
    const value = localStorage.getItem(KEY);
    if (value === "low" || value === "high" || value === "auto") return value;
  } catch { /* storage can be disabled */ }
  return "auto";
}

export function graphicsMode() { return mode; }
export function graphicsTier() { return tier; }
export function graphicsLabel() { return mode === "auto" ? "Auto" : mode === "low" ? "Rendah" : "Tinggi"; }

export function setGraphicsMode(next: GraphicsMode) {
  mode = next;
  if (next !== "auto") tier = next === "low" ? 2 : 0;
  else tier = navigator.maxTouchPoints > 0 ? 1 : 0;
  try { localStorage.setItem(KEY, mode); } catch { /* keep the setting for this session */ }
  changed.dispatchEvent(new CustomEvent("change", { detail: { mode, tier } }));
  return mode;
}

export function cycleGraphicsMode() {
  return setGraphicsMode(mode === "auto" ? "low" : mode === "low" ? "high" : "auto");
}

export function onGraphicsChange(listener: (mode: GraphicsMode, tier: GraphicsTier) => void) {
  const handler = (event: Event) => {
    const detail = (event as CustomEvent<{ mode: GraphicsMode; tier: GraphicsTier }>).detail;
    listener(detail.mode, detail.tier);
  };
  changed.addEventListener("change", handler);
  return () => changed.removeEventListener("change", handler);
}

export function setAutomaticTier(next: GraphicsTier) {
  if (mode !== "auto" || next === tier) return false;
  tier = next;
  changed.dispatchEvent(new CustomEvent("change", { detail: { mode, tier } }));
  return true;
}

export const GRAPHICS_PROFILES = [
  { maxDpr: 2, shadowSize: 2048, tiltShift: true },
  { maxDpr: 1.25, shadowSize: 1024, tiltShift: false },
  { maxDpr: 1, shadowSize: 512, tiltShift: false },
] as const;
