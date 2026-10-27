import { sleep } from "../core/loop";
import { sfx } from "../core/sfx";
import { DREAM } from "../content/script";
import { say } from "../ui/dialog";
import { el, ui } from "../ui/dom";

// Opening dream: a soft pastel stage with Faris and Bolat on the sofa. Lines play through
// the normal dialog box; the stage actions animate the doodles between lines.

const CRY = "/assets/ui/qish-seated-cry.webp";

function stageHtml() {
  const sparkles = Array.from({ length: 14 }, (_, i) => `<span style="--i:${i};--x:${(i * 37) % 100}%;--d:${4 + (i % 5)}s"></span>`).join("");
  return `
    <div class="dream-sky"><div class="dream-sparkles">${sparkles}</div></div>
    <div class="dream-tag">~ zzz ~</div>
    <div class="dream-scene">
      <img class="d-sofa" src="/assets/ui/dream-sofa.webp" alt="">
      <img class="d-faris" src="/assets/ui/faris-seated.webp" alt="Faris">
      <img class="d-qish" src="/assets/ui/qish-seated.webp" alt="Qish">
    </div>
    <div class="dream-haze"></div>`;
}

function pop(scene: HTMLElement, text: string, cls: string) {
  const p = el("div", `dream-pop ${cls}`, text);
  scene.appendChild(p);
  return p;
}

async function act(root: HTMLElement, kind: "pinch" | "sulk" | "leave" | "cry") {
  const scene = root.querySelector(".dream-scene") as HTMLElement;
  const faris = scene.querySelector(".d-faris") as HTMLImageElement;
  const qish = scene.querySelector(".d-qish") as HTMLImageElement;
  if (kind === "pinch") {
    faris.animate([{ transform: "translateX(0)" }, { transform: "translateX(18%) rotate(8deg)" }, { transform: "translateX(0)" }], { duration: 520, easing: "ease-in-out" });
    await sleep(260);
    sfx.hurt();
    pop(scene, "CUBIT!", "pinch");
    qish.animate([{ translate: "0 0" }, { translate: "0 -14%" }, { translate: "0 0" }], { duration: 380, easing: "cubic-bezier(.3,1.6,.5,1)" });
    await sleep(900);
  } else if (kind === "sulk") {
    // Turn her back on him: the side sprite faces right, away from Faris.
    sfx.flip();
    qish.classList.add("sulk");
    pop(scene, "hmph 💢", "sulk");
    await sleep(700);
  } else if (kind === "leave") {
    scene.querySelector(".dream-pop.sulk")?.remove();
    const bye = pop(scene, "k bye", "bye");
    await sleep(500);
    sfx.puff();
    faris.animate([{ opacity: 1, transform: "translateX(0)" }, { opacity: 0, transform: "translateX(-60%)" }], { duration: 1400, easing: "ease-in", fill: "forwards" });
    bye.animate([{ opacity: 1 }, { opacity: 0, transform: "translateX(-60%)" }], { duration: 1400, easing: "ease-in", fill: "forwards" });
    await sleep(1600);
    bye.remove();
  } else {
    // Still on the sofa where she sulked, now sobbing into her hands, tears flying off both eyes.
    root.classList.add("crying");
    qish.src = CRY;
    await qish.decode().catch(() => {});
    qish.classList.add("cry");
    // The square art is centred inside the img box (object-fit: contain): place the tears on her eyes.
    const s = scene.getBoundingClientRect();
    const q = qish.getBoundingClientRect();
    const scale = s.width / scene.offsetWidth;
    const side = Math.min(q.width, q.height);
    const ax = q.left + (q.width - side) / 2 - s.left;
    const ay = q.top + (q.height - side) / 2 - s.top;
    for (const [cls, fx, fy] of [["l", 0.52, 0.42], ["r", 0.74, 0.4]] as const) {
      const t = el("div", `tears ${cls}`, Array.from({ length: 6 }, (_, i) => `<b style="--i:${i}"></b>`).join(""));
      Object.assign(t.style, { left: `${(ax + fx * side) / scale}px`, top: `${(ay + fy * side) / scale}px`, right: "auto", bottom: "auto" });
      scene.appendChild(t);
    }
    sfx.hurt();
    await sleep(900);
  }
}

/** Plays the dream; resolves on the wake-up flash with the screen white. */
export async function playDream() {
  new Image().src = CRY;
  const root = el("div", "dream", stageHtml());
  ui().appendChild(root);
  root.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 1200, fill: "forwards" });
  await sleep(1400);
  for (const step of DREAM) {
    if ("act" in step) await act(root, step.act);
    else await say([step]);
  }
  // Wake up: the dream shakes, blurs and whites out.
  root.classList.add("waking");
  sfx.stomp();
  await sleep(1100);
  return () => root.remove();
}
