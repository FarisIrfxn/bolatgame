/** Full-bleed surface with a fixed vertical scale; extra width is scenery/layout space. */
export const GAME_WIDTH = 1280;
export const GAME_HEIGHT = 720;

const shell = document.getElementById("game-shell")!;
const viewport = document.getElementById("game-viewport")!;
const safeProbe = document.createElement("div");
safeProbe.id = "safe-area-probe";
safeProbe.setAttribute("aria-hidden", "true");
document.body.appendChild(safeProbe);

export const gameViewport = { width: GAME_WIDTH, height: GAME_HEIGHT, scale: 1, landscape: true,
  safe: { top: 0, right: 0, bottom: 0, left: 0 } };
export const ARENA_STYLE = "position:absolute;left:calc(50% + (var(--game-safe-left) - var(--game-safe-right)) / 2);top:calc(50% + (var(--game-safe-top) - var(--game-safe-bottom)) / 2);width:min(calc(100% - var(--game-safe-left) - var(--game-safe-right)),calc((100cqh - var(--game-safe-top) - var(--game-safe-bottom)) * 16 / 9)) !important;height:auto !important;transform:translate(-50%,-50%)";
let previous = "";
let resizeFrame = 0;

function resizeViewport() {
  const visible = window.visualViewport;
  const width = Math.min(window.innerWidth, visible?.width ?? window.innerWidth);
  const height = Math.min(window.innerHeight, visible?.height ?? window.innerHeight);
  if (!width || !height) return;
  const landscape = width >= height;
  const scale = landscape ? height / GAME_HEIGHT : 1;
  const w = width / scale;
  const h = landscape ? GAME_HEIGHT : height;
  const insets = getComputedStyle(safeProbe);
  const safe = [insets.paddingTop, insets.paddingRight, insets.paddingBottom, insets.paddingLeft].map(value => parseFloat(value) || 0);
  const left = visible?.offsetLeft ?? 0, top = visible?.offsetTop ?? 0;
  const key = [width, height, left, top, ...safe].join(":");
  if (key === previous) return;
  previous = key;
  Object.assign(gameViewport, { width: w, height: h, scale, landscape });
  const setStyles = (node: HTMLElement, styles: Record<string, string>) => {
    for (const [key, value] of Object.entries(styles)) {
      const property = key.replace(/[A-Z]/g, m => `-${m.toLowerCase()}`);
      if (node.style.getPropertyValue(property) !== value) node.style.setProperty(property, value);
    }
  };
  setStyles(shell, { width: `${width}px`, height: `${height}px`, left: `${left}px`, top: `${top}px` });
  setStyles(viewport, { width: `${w}px`, height: `${h}px`, left: "0px", top: "0px", transform: `scale(${scale})` });
  for (const [i, side] of ["top", "right", "bottom", "left"].entries()) {
    viewport.style.setProperty(`--game-safe-${side}`, `${safe[i] / scale}px`);
    gameViewport.safe[side as keyof typeof gameViewport.safe] = safe[i] / scale;
  }
  // Typography keeps the desktop scale even when the available width grows.
  viewport.style.setProperty("--ui-vw", `${(landscape ? GAME_WIDTH : w) / 100}px`);
  viewport.style.setProperty("--game-scale", String(scale));
  viewport.dataset.layout = landscape ? "landscape" : "portrait";
  viewport.dataset.wide = String(w / h > GAME_WIDTH / GAME_HEIGHT + .005);
  window.dispatchEvent(new Event("gameviewportresize"));
}

resizeViewport();
const queueResize = () => {
  if (resizeFrame) return;
  resizeFrame = requestAnimationFrame(() => { resizeFrame = 0; resizeViewport(); });
};
window.addEventListener("resize", queueResize);
window.visualViewport?.addEventListener("resize", queueResize);
window.visualViewport?.addEventListener("scroll", queueResize);
