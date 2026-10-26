import { sfx } from "../core/sfx";
import { el, ui } from "./dom";

let last = "";

/** Big centred place name when Qish walks into a new zone ("KLIA · Sepang" → title + subtitle).
 * Coming back to the zone she just left (a boss fight, a rematch) shows nothing. Resolves as the
 * card starts to fade, so arrival dialogue follows it instead of covering it. */
export function zoneTitle(name: string, force = false) {
  if (!force && name === last) return Promise.resolve();
  last = name;
  const [title, sub] = name.split(" · ");
  const root = el("div", "zone-title");
  const h = el("h1");
  [...title].forEach((ch, i) => {
    const s = el("span", "", ch === " " ? "&nbsp;" : ch);
    s.style.animationDelay = `${0.15 + i * 0.045}s`;
    h.appendChild(s);
  });
  root.appendChild(el("div", "rule", "<i></i>♥<i></i>"));
  root.appendChild(h);
  if (sub) root.appendChild(el("div", "sub", sub));
  ui().appendChild(root);
  setTimeout(() => sfx.place(), 150);
  return new Promise<void>((resolve) => {
    setTimeout(() => {
      root.classList.add("out");
      resolve();
      setTimeout(() => root.remove(), 700);
    }, 2400 + title.length * 45);
  });
}
