import { onFrame } from "../core/loop";
import { el } from "./dom";

/** Bolat and Bowat walk in place at opposite edges of the title scene. */
export function mountTitleChase(root: HTMLElement) {
  const runners = ["qish", "bowat"].map((who) => {
    const wrap = el("div", `title-runner ${who}`);
    wrap.setAttribute("aria-hidden", "true");
    const image = el("img");
    image.alt = who === "qish" ? "Bolat" : "Bowat";
    image.src = `/assets/chars/${who}_side_walk_0.png`;
    image.style.transform = who === "bowat" ? "scaleX(-1)" : "none";
    wrap.appendChild(image); root.appendChild(wrap);
    for (let i=0;i<4;i++) new Image().src = `/assets/chars/${who}_side_walk_${i}.png`;
    return { who, image };
  });
  let time=0;
  const reduce=matchMedia("(prefers-reduced-motion: reduce)").matches;
  const stop=onFrame((dt)=>{
    if (!root.isConnected) { stop(); return; }
    if (!reduce) time+=Math.max(0,dt);
    const frame=Math.floor(time*8)%4;
    for (const runner of runners) {
      const src=`/assets/chars/${runner.who}_side_walk_${frame}.png`;
      if (runner.image.getAttribute("src")!==src) runner.image.src=src;
    }
  });
}
