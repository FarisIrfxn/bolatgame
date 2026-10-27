export const ui = () => document.getElementById("ui") as HTMLDivElement;
export const stage = () => document.getElementById("stage") as HTMLDivElement;

export function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  cls = "",
  html = "",
): HTMLElementTagNameMap[K] {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (html) e.innerHTML = html;
  return e;
}

let fadeEl: HTMLDivElement | null = null;

/** Fade to black (or white, slowly, for waking up), run `mid`, fade back in. */
export async function fadeThrough(mid: () => void | Promise<void>, white = false) {
  if (!fadeEl) {
    fadeEl = el("div", "fade");
    document.getElementById("game-viewport")!.appendChild(fadeEl);
  }
  fadeEl.classList.toggle("white", white);
  fadeEl.classList.add("on");
  await new Promise((r) => setTimeout(r, white ? 1300 : 480));
  await mid();
  await new Promise((r) => setTimeout(r, white ? 600 : 120));
  fadeEl.classList.remove("on");
  if (white) await new Promise((r) => setTimeout(r, 1200));
}
