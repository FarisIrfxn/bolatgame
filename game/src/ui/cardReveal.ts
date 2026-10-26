import { input } from "../core/input";
import { sleep, waitFor } from "../core/loop";
import { save } from "../core/save";
import { sfx } from "../core/sfx";
import { CARDS, CARD_BACK, cardImage } from "../content/cards";
import { el, ui } from "./dom";

const CONFETTI = ["#ffcb05", "#e3350d", "#ff8fb1", "#7dd3fc", "#a7f3d0", "#ffffff"];

export function confetti(root: HTMLElement, count = 90) {
  for (let i = 0; i < count; i++) {
    const c = el("div", "confetti");
    c.style.left = `${Math.random() * 100}%`;
    c.style.background = CONFETTI[i % CONFETTI.length];
    c.style.animationDuration = `${2.2 + Math.random() * 2.4}s`;
    c.style.animationDelay = `${Math.random() * 0.6}s`;
    c.style.transform = `rotate(${Math.random() * 360}deg)`;
    root.appendChild(c);
  }
}

/** Big holo card unlock. Adds the card to the save before resolving. */
export async function revealCard(n: number) {
  const card = CARDS[n];
  const root = el("div", "reveal");
  root.innerHTML = `
    <div class="rays"></div>
    <div class="reveal-label">SATU JEJAK. SATU KENANGAN.</div>
    <div class="card-wrap">
      <div class="card">
        <div class="face back"><img src="${CARD_BACK}" alt="Belakang kad Pokélove"></div>
        <div class="face front"><img src="${cardImage(n)}" alt="Kad ${card.name}"><div class="holo"></div></div>
      </div>
    </div>
    <div class="caption"></div>`;
  ui().appendChild(root);
  const cardEl = root.querySelector(".card") as HTMLDivElement;
  const caption = root.querySelector(".caption") as HTMLDivElement;

  cardEl.animate(
    [
      { transform: "translateY(60vh) rotateZ(-25deg) scale(.4)" },
      { transform: "translateY(-4vh) rotateZ(4deg) scale(1.05)" },
      { transform: "translateY(0) rotateZ(0) scale(1)" },
    ],
    { duration: 900, easing: "cubic-bezier(.2,1.2,.4,1)" },
  );
  sfx.sparkle();
  await sleep(1300);
  cardEl.style.transform = "rotateY(180deg)";
  sfx.flip();
  await sleep(500);
  sfx.fanfare();
  confetti(root);
  save.addCard(n);

  caption.innerHTML = `<div class="reveal-number">KOLEKSI POKÉLOVE · ${save.data.cards.length} / 8</div><h2>${card.name}!</h2>`;
  await sleep(900);

  caption.insertAdjacentHTML("beforeend", `<div class="hint">Tekan <kbd data-control="a">Space</kbd> untuk teruskan</div>`);

  let clicked = false;
  root.addEventListener("pointerdown", () => (clicked = true));
  await waitFor(() => input.pressed("a") || clicked);
  sfx.select();
  root.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 350, fill: "forwards" });
  await sleep(350);
  root.remove();
}
