import { input } from "../core/input";
import { onFrame } from "../core/loop";
import { sfx } from "../core/sfx";
import { el } from "./dom";

/** Vertical button menu inside `parent`: arrows/stick + A, or tap. Resolves with the chosen index. */
export function chooseMenu(parent: HTMLElement, options: string[], heading = "") {
  const box = el("div", "title-menu");
  if (heading) box.appendChild(el("div", "tm-heading", heading));
  const buttons = options.map((label, i) => {
    const b = el("button", "tm-btn", label);
    b.addEventListener("pointerdown", (e) => {
      e.stopPropagation();
      picked = i;
    });
    box.appendChild(b);
    return b;
  });
  parent.appendChild(box);
  let sel = 0;
  let picked = -1;
  // Ignore a direction already held when the menu opens.
  const dirOf = () => {
    const a = input.axis();
    return Math.abs(a.y) > 0.5 ? Math.sign(a.y) : Math.abs(a.x) > 0.5 ? Math.sign(a.x) : 0;
  };
  let last = dirOf();
  const paint = () => buttons.forEach((b, i) => b.classList.toggle("sel", i === sel));
  paint();
  return new Promise<number>((resolve) => {
    const off = onFrame(() => {
      const d = dirOf();
      if (d && d !== last) {
        sel = (sel + d + options.length) % options.length;
        paint();
        sfx.blip();
      }
      last = d;
      if (input.pressed("a")) picked = sel;
      if (picked >= 0) {
        off();
        sfx.select();
        box.remove();
        resolve(picked);
      }
    });
  });
}
