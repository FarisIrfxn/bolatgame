/** One desktop composition for every landscape screen, including browser chrome/notches. */
export const GAME_WIDTH = 1280;
export const GAME_HEIGHT = 720;

const shell = document.getElementById("game-shell")!;
const viewport = document.getElementById("game-viewport")!;

export const gameViewport = { width: GAME_WIDTH, height: GAME_HEIGHT, scale: 1 };

function resizeViewport() {
  const width = shell.clientWidth;
  const height = shell.clientHeight;
  if (!width || !height) return;
  const landscape = window.innerWidth >= window.innerHeight;
  const w = landscape ? GAME_WIDTH : width;
  const h = landscape ? GAME_HEIGHT : height;
  const scale = Math.min(width / w, height / h);
  Object.assign(gameViewport, { width: w, height: h, scale });
  Object.assign(viewport.style, {
    width: `${w}px`, height: `${h}px`,
    left: `${(width - w * scale) / 2}px`, top: `${(height - h * scale) / 2}px`,
    transform: `scale(${scale})`,
  });
  window.dispatchEvent(new Event("gameviewportresize"));
}

resizeViewport();
window.addEventListener("resize", resizeViewport);
window.visualViewport?.addEventListener("resize", resizeViewport);
new ResizeObserver(resizeViewport).observe(shell);
