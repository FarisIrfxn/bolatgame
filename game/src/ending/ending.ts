import { input } from "../core/input";
import { onFrame, sleep, waitFor } from "../core/loop";
import { save } from "../core/save";
import { sfx } from "../core/sfx";
import { music } from "../core/music";
import { CARD_BACK } from "../content/cards";
import { BIRTHDAY_BANNER, CANDLES, CARD_9, CONFESS, KISAH_KITA, LETTER, PARTY, type Slide } from "../content/ending";
import { confetti } from "../ui/cardReveal";
import { say } from "../ui/dialog";
import { el, ui } from "../ui/dom";
import { blowCandles } from "./cake";
import { createEndScreen } from "./endScreen";

// The birthday ending: SURPRISE in the yard -> cake & candles -> Kisah Kita -> confession ->
// letter -> secret 9th card -> the end. Plays as DOM layers over the 3D party.

const confirm = (root: HTMLElement) => {
  let clicked = false;
  const onDown = () => (clicked = true);
  root.addEventListener("pointerdown", onDown);
  return waitFor(() => input.pressed("a") || clicked).then(() => root.removeEventListener("pointerdown", onDown));
};

async function kisahKita(root: HTMLElement) {
  const layer = el("div", "kisah");
  root.appendChild(layer);
  for (const s of KISAH_KITA) {
    layer.innerHTML = slideHtml(s);
    const cap = layer.querySelector(".kisah-cap") as HTMLElement;
    const full = s.caption;
    cap.textContent = "";
    let i = 0;
    let skip = false;
    const off = onFrame(() => {
      if (input.pressed("a")) skip = true;
    });
    while (i < full.length && !skip) {
      cap.textContent = full.slice(0, ++i);
      if (i % 3 === 0) sfx.talk();
      await sleep(32);
    }
    off();
    cap.textContent = full;
    await sleep(150);
    await confirm(layer);
    sfx.blip();
  }
  layer.remove();
}

function slideHtml(s: Slide) {
  let media = "";
  if (s.strips) {
    media = `<div class="kisah-strips">${Array.from({ length: 10 }, (_, i) => `<img src="/assets/strips/strip${i}.webp" style="--i:${i}" alt="">`).join("")}</div>`;
  } else if (s.img) {
    media = `<div class="kisah-photo"><img src="${s.img}" alt="${s.mediaLabel ?? "Kenangan Qish dan Faris"}">${s.mediaLabel ? `<span class="kisah-media-label">${s.mediaLabel}</span>` : ""}</div>`;
  } else if (s.placeholder) {
    media = `<div class="kisah-photo kisah-ph">${s.placeholder}<small>Kenangan kita ♡</small></div>`;
  }
  return `<div class="kisah-slide ${media ? "" : "kisah-big"}">${media}<p class="kisah-cap"></p><div class="kisah-next">▼</div></div>`;
}

async function letter(root: HTMLElement) {
  const layer = el("div", "letter-layer");
  layer.innerHTML = `<div class="letter-shell"><div class="letter"><div class="letter-meta">SEPUCUK SURAT, UNTUK SAYANG ♡</div><div class="letter-text"></div></div><button class="letter-next"><kbd data-control="a">Space</kbd> Baca terus <span>♡</span></button><div class="letter-scroll-hint">↑ ↓ / Scroll untuk baca</div></div>`;
  root.appendChild(layer);
  const box = layer.querySelector(".letter-text") as HTMLElement;
  const paper = layer.querySelector(".letter") as HTMLElement;
  const next = layer.querySelector(".letter-next") as HTMLButtonElement;
  const text = `${LETTER.greeting}\n\n${LETTER.body}\n\n${LETTER.signoff}`;
  let i = 0;
  let skip = false;
  let ready = false;
  let picked = false;
  // Tapping the paper is reserved for scrolling; only the button turns the page.
  next.addEventListener("click", () => { if (ready) picked = true; else skip = true; });
  const off = onFrame(() => {
    if (input.pressed("a")) skip = true;
  });
  while (i < text.length && !skip) {
    i += 2;
    box.textContent = text.slice(0, i);
    await sleep(28);
  }
  off();
  box.textContent = text;
  next.innerHTML = `<kbd data-control="a">Space</kbd> Simpan dalam hati <span>♡</span>`;
  await sleep(200);
  ready = true;
  const scroll = onFrame(dt => {
    const y = input.axis().y;
    if (Math.abs(y) > 0.15) paper.scrollTop += y * dt * 280;
  });
  await waitFor(() => input.pressed("a") || picked);
  scroll();
  sfx.blip();
  layer.remove();
}

async function ninthCard(root: HTMLElement) {
  const c = CARD_9;
  const layer = el("div", "reveal");
  layer.innerHTML = `
    <div class="rays"></div>
    <div class="card-wrap">
      <div class="card">
        <div class="face back"><img src="${CARD_BACK}" alt="Belakang kad Pokélove"></div>
        <div class="face front card9">
          <div class="c9-top"><span class="c9-rarity">${c.rarity}</span><b>${c.name}</b><span class="c9-hp">HP ${c.hp}</span></div>
          <div class="c9-art"><img src="${c.art}" alt=""></div>
          <div class="c9-move"><b>${c.move}</b><p>${c.moveText}</p></div>
          <div class="c9-foot">${c.footer}</div>
          <div class="holo"></div>
        </div>
      </div>
    </div>
    <div class="caption"></div>`;
  root.appendChild(layer);
  const card = layer.querySelector(".card") as HTMLElement;
  const caption = layer.querySelector(".caption") as HTMLElement;
  card.animate([{ transform: "scale(.2) rotateZ(-30deg)", opacity: 0 }, { transform: "scale(1) rotateZ(0)", opacity: 1 }], {
    duration: 900,
    easing: "cubic-bezier(.2,1.2,.4,1)",
  });
  caption.innerHTML = `<div class="hint">Satu kad lagi...?</div>`;
  sfx.sparkle();
  await sleep(1800);
  card.style.transform = "rotateY(180deg)";
  sfx.flip();
  await sleep(500);
  sfx.fanfare();
  confetti(layer, 140);
  caption.innerHTML = `<h2>Kad ke-9 rahsia!</h2>`;
  await sleep(1200);
  const s = save.data;
  const firstTime = s.recordingMode && !s.handedOver.includes(9);
  caption.insertAdjacentHTML(
    "beforeend",
    firstTime
      ? `<div class="ask">💌 Pusing belakang!</div><div class="hint">Tekan <kbd data-control="a">Space</kbd> untuk teruskan</div>`
      : `<div class="hint">Tekan <kbd data-control="a">Space</kbd> untuk teruskan</div>`,
  );
  await confirm(layer);
  if (firstTime) {
    s.handedOver.push(9);
    save.write();
  }
  sfx.select();
  layer.remove();
}

export async function playEnding() {
  music.stop();
  // Plays over the party in the yard: the 3D scene stays visible behind these layers.
  const root = el("div", "ending");
  ui().appendChild(root);
  const shout = el("div", "surprise", "SURPRISE!! 🎉");
  root.appendChild(shout);
  sfx.fanfare();
  confetti(root, 160);
  await sleep(2200);
  shout.remove();
  await say(PARTY);

  // Cake and candles.
  const cake = await blowCandles(root, CANDLES);
  sfx.fanfare();
  confetti(root, 200);
  const banner = el("div", "bday-banner", BIRTHDAY_BANNER);
  root.appendChild(banner);
  await sleep(1800);
  await confirm(root);
  banner.remove();
  cake.remove();

  music.play("ending");
  await kisahKita(root);
  await say(CONFESS);
  await letter(root);
  await ninthCard(root);

  const end = createEndScreen();
  root.appendChild(end);
  save.setFlag("endingSeen");
  await sleep(800);
  await confirm(end);
  root.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 500, fill: "forwards" });
  await sleep(500);
  root.remove();
  music.stop();
}
