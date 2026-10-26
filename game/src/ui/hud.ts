import { save } from "../core/save";
import { CARDS, cardImage } from "../content/cards";
import { el, ui } from "./dom";

let hud: HTMLDivElement | null = null;
let zone: HTMLDivElement | null = null;
let collect: HTMLDivElement | null = null;
let workout: HTMLDivElement | null = null;

export function showHud(zoneName: string) {
  if (!hud) {
    hud = el("div", "hud");
    zone = el("div", "zone-label");
    ui().prepend(hud, zone);
  }
  hud.hidden = false;
  zone!.hidden = false;
  const [place, ...detail] = zoneName.split(" · ");
  zone!.innerHTML = `<span class="zone-pin" aria-hidden="true"><svg viewBox="0 0 24 28" fill="none"><path d="M12 26S2 17 2 11a10 10 0 0 1 20 0c0 6-10 15-10 15Z" fill="currentColor"/><circle cx="12" cy="11" r="4" fill="#fff8e9"/></svg></span><div><strong></strong><span class="zone-detail"></span></div>`;
  zone!.querySelector("strong")!.textContent = place;
  zone!.querySelector(".zone-detail")!.textContent = detail.join(" · ");
  refreshHud();
}

export function refreshHud() {
  if (!hud) return;
  // Adventure order follows the bosses; printed card numbers deliberately differ.
  const slots = [5, 3, 7, 1, 2, 6, 4, 8].map((n, i) => {
    const a = i / 8 * Math.PI * 2;
    return `<div class="slot ${save.hasCard(n) ? "got" : ""}" style="--slot-x:${50 + Math.sin(a) * 37}%;--slot-y:${50 - Math.cos(a) * 37}%" aria-label="${save.hasCard(n) ? CARDS[n].name : `Kad ${i + 1} belum ditemui`}">${save.hasCard(n) ? `<img src="${cardImage(n)}" alt="Kad ${CARDS[n].name}">` : `<span>${i + 1}</span>`}</div>`;
  }).join("");
  hud.setAttribute("aria-label", `${save.data.cards.length} daripada 8 kad dikumpul`);
  hud.innerHTML = `<div class="hud-heading"><b>${save.data.cards.length}<small>/8</small></b><span>KAD</span></div><div class="hud-slots">${slots}</div>`;
}

/** Right-side objective tracker. Completed objectives stay visible in their zone. */
export function setCollect(c: { icon: string; kind?: string; name: string; got: number; need: number } | null, bump = false) {
  if (!collect) {
    collect = el("div", "collect-hud");
    ui().prepend(collect);
  }
  collect.hidden = !c;
  if (!c) return;
  const done = c.got >= c.need;
  collect.classList.toggle("done", done);
  const kind = c.kind ? ({ kentut: "fart", strip: "film" }[c.kind] ?? c.kind) : null;
  collect.innerHTML = `<div class="collect-icon"><img src="${kind ? `/assets/storybook/item_${kind}.png` : c.icon}" alt="">${done ? '<span class="collect-check">✓</span>' : ''}</div><div class="collect-body"><div class="collect-top"><small>OBJECTIVE</small>${done ? '<span class="collect-status">Complete</span>' : ''}</div><div class="collect-line"><span>${c.name}</span><b>${Math.min(c.got,c.need)}<em>/${c.need}</em></b></div><div class="collect-track"><i style="width:${Math.min(100, Math.max(0, c.got / c.need * 100))}%"></i></div></div>`;
  if (bump) {
    collect.classList.remove("bump");
    void collect.offsetWidth;
    collect.classList.add("bump");
  }
}

/** Putrajaya's scale: current weight and a bar from the start weight down to the goal. null hides it. */
export function setWorkout(w: { kg: string; progress: number; buddy: boolean } | null, bump = false) {
  if (!workout) {
    workout = el("div", "collect-hud workout-hud");
    ui().prepend(workout);
  }
  workout.hidden = !w;
  if (!w) return;
  const done = w.progress >= 1;
  workout.classList.toggle("done", done);
  workout.classList.toggle("buddy", w.buddy && !done);
  workout.innerHTML = `<span class="scale">KG</span><b>${w.kg}</b><span class="bar"><i style="width:${Math.round(w.progress * 100)}%"></i></span><span class="goal">80kg${done ? " ✓" : ""}</span>${w.buddy && !done ? '<span class="x2">×2</span>' : ""}`;
  if (bump) {
    workout.classList.remove("bump");
    void workout.offsetWidth;
    workout.classList.add("bump");
  }
}

export function hideHud() {
  if (hud) hud.hidden = true;
  if (zone) zone.hidden = true;
  if (collect) collect.hidden = true;
  if (workout) workout.hidden = true;
}
