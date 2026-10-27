import { input } from "../../core/input";
import { onFrame } from "../../core/loop";
import { sfx } from "../../core/sfx";
import { confetti } from "../../ui/cardReveal";
import { el } from "../../ui/dom";
import { paperBorder } from "../../core/paperBorder";
import type { CustomMinigame, MinigameCtx } from "../framework";
import { runnerRoad } from "./road";
import { projectLane } from "./perspective";
import { gameViewport } from "../../core/viewport";

// Smooth illustrated runner. Logical coordinates retain the original three-lane rules;
// the canvas draws at 4x resolution so signs and curves stay clean at desktop size.
const W = 320, H = 180, GOAL = 10, FAR = 95, HIT_FAR = 11, HIT_NEAR = 1.6;
const TAUNTS = ["GEMOK!", "BOLAT!", "EMOK!", "80 KG!", "FAT ASS!"] as const;
interface Word { label: string; lane: number; z: number; state: "incoming" | "smacked" | "passed"; life: number }

export function createQishRunner(host: HTMLElement, ctx: MinigameCtx): CustomMinigame {
  const canvas = el("canvas", "storybook-runner");
  canvas.width = W * 4; canvas.height = H * 4;
  canvas.style.cssText = "position:absolute;inset:0;width:100%;height:100%;transform:none;image-rendering:auto";
  host.appendChild(canvas);
  const g = canvas.getContext("2d")!;
  g.imageSmoothingEnabled = true;
  g.imageSmoothingQuality = "high";
  // A nearby sign passes in front of Qish; distant signs remain behind her.
  const foreground = el("canvas", "runner-near-signs");
  foreground.width = canvas.width; foreground.height = canvas.height;
  foreground.style.cssText = `${canvas.style.cssText};background:transparent;pointer-events:none;z-index:3`;
  host.appendChild(foreground);
  const nearInk = foreground.getContext("2d")!;
  const art = new Map<string, HTMLImageElement | HTMLCanvasElement>();
  const walkers = ["qish", "bowat"].map(who => {
    const img = el("img", "runner-walker");
    img.alt = who === "qish" ? "Qish" : "Bowat";
    img.style.cssText = "position:absolute;object-fit:contain;image-rendering:auto;pointer-events:none;z-index:2";
    host.appendChild(img);
    return img;
  });
  let scale = 1, left = 0, top = 0, span = W;
  let road: ReturnType<typeof runnerRoad>;
  const resize = () => {
    const bounds = host.getBoundingClientRect();
    const ratio = bounds.width > 0 && bounds.height > 0 ? bounds.width / bounds.height : gameViewport.width / gameViewport.height;
    // Fill landscape while preserving proportions: wide screens reveal scenery,
    // narrower landscape screens crop only the outer edges. Keep the existing
    // centered 16:9 playfield in portrait.
    const fullBleed = ratio >= 1.4;
    const w = fullBleed ? H * ratio : gameViewport.width;
    const h = fullBleed ? H : gameViewport.height;
    scale = fullBleed ? h / H : Math.min(w / W, h / H);
    left = (w - W * scale) / 2; top = (h - H * scale) / 2;
    span = fullBleed ? w / scale : W;
    for (const layer of [canvas, foreground]) {
      layer.width = Math.ceil(span * 4); layer.height = H * 4;
      layer.style.cssText = fullBleed
        ? "position:absolute;inset:0;width:100%;height:100%;transform:none;image-rendering:auto"
        : "position:absolute;left:50%;top:50%;width:min(100%,calc(100cqh * 16 / 9));height:auto;transform:translate(-50%,-50%);image-rendering:auto";
    }
    for (const ink of [g, nearInk]) {
      ink.setTransform(4, 0, 0, 4, (span - W) * 2, 0);
      ink.imageSmoothingEnabled = true; ink.imageSmoothingQuality = "high";
    }
    if (art.has("putra_road")) road = runnerRoad(art.get("bg_qishex")!, art.get("putra_road") as HTMLImageElement,
      span, art.get("bg_qishex_wide") as HTMLImageElement);
  };
  resize(); window.addEventListener("gameviewportresize", resize);
  let ready = false, destroyed = false, endingTimer = 0;
  let roadDistance = 0;
  let firstDraw!: () => void;
  const firstFrame = new Promise<void>(resolve => { firstDraw = resolve; });
  void Promise.all(["bg_qishex", "bg_qishex_wide", "qishex", "putra_road"].map(name => new Promise<void>((resolve, reject) => {
    const img = new Image(); img.onload = () => { art.set(name, name === "qishex" ? paperBorder(img,256,256) : img); resolve(); };
    img.onerror = () => reject(new Error(`Runner art missing: ${name}`));
    img.src = name === "putra_road" ? "/assets/textures/putra_road.webp" : name === "bg_qishex_wide" ? "/assets/mobile/bg_qishex.webp" : `/assets/storybook/${name}.${name.startsWith("bg_") ? "webp" : "png"}`;
  }))).then(() => {
    if (!destroyed) { resize(); ready = true; }
  }).catch(error => console.error(error));
  for (const who of ["qish", "bowat"]) for (let i = 0; i < 4; i++) new Image().src = `/assets/chars/${who}_back_walk_${i}.png`;
  const hud = el("div", "runner-hud", '<div class="rh-count"></div><div class="rh-msg"></div>');
  host.appendChild(hud);
  const counter = hud.querySelector(".rh-count") as HTMLElement;
  const message = hud.querySelector(".rh-msg") as HTMLElement;
  let messageTime = 0;
  const msg = (text: string, time = 1.2) => { message.textContent = text; messageTime = time; };
  let lane = 1, visualLane = 1, lastAxis = 0, smacked = 0, stumbles = 0, fails = 0;
  let stumbleT = 0, swingT = 0, spawnIn = 2.2, done = false, tapped = false;
  const words: Word[] = [];
  const refresh = () => { counter.innerHTML = `SO TINY! <b>${smacked}</b> / ${GOAL}`; };
  refresh(); msg("Sedia... LARI!", 1.6);
  const onTap = (e: PointerEvent) => {
    const r = canvas.getBoundingClientRect(), scale = Math.min(r.width / W, r.height / H);
    const x = (e.clientX - r.left - (r.width - W * scale) / 2) / scale;
    const y = (e.clientY - r.top - (r.height - H * scale) / 2) / scale;
    if (x < 0 || x > W || y < 0 || y > H) return;
    lane = Math.min(2, Math.floor(x / (W / 3))); tapped = true;
  };
  canvas.addEventListener("pointerdown", onTap);
  const win = () => {
    if (done) return;
    done = true; sfx.fanfare(); msg("SHE'S SO TINY!!", 3); confetti(host, 100);
    endingTimer = window.setTimeout(() => { if (!destroyed) ctx.win(); }, 2400);
  };
  const sprite = (id: string, frame: number, x: number, y: number, size: number) => {
    const im = art.get(id); if (!im) return;
    g.drawImage(im, frame * 256, 0, 256, 256, x - size / 2, y - size, size, size);
  };
  const boardPoint = (word: Word) => {
    const point = projectLane(Math.max(0, word.z), word.lane);
    return { x: point.x, y: point.y - 25 * point.p, groundY: point.y, p: point.p };
  };
  const drawBoard = (word: Word, target: boolean, g: CanvasRenderingContext2D) => {
    const p = boardPoint(word), scale = Math.max(0.12, p.p);
    const width = Math.round(77 * scale), height = Math.round(24 * scale);
    const y = Math.round(p.y - (word.state === "smacked" ? word.life * 45 : 0));
    if (word.state === "incoming") {
      g.fillStyle = "#6f425a30"; g.beginPath();
      g.ellipse(p.x, p.groundY, width * .42, Math.max(.6, 2 * scale), 0, 0, Math.PI * 2); g.fill();
    }
    const round = (x: number, y: number, w: number, h: number) => { g.beginPath(); g.roundRect(x,y,w,h,Math.max(1,4*scale)); g.fill(); };
    g.fillStyle = "#80506a55"; round(p.x-width/2+1,y+3,width,height);
    g.fillStyle = target ? "#d27b9e" : word.state === "smacked" ? "#86a47b" : "#c895ab";
    round(p.x-width/2-1,y-1,width+2,height+2);
    g.fillStyle = word.state === "smacked" ? "#e5efd6" : "#fff7e4"; round(p.x-width/2,y,width,height);
    if (scale > 0.34) {
      g.fillStyle = word.state === "smacked" ? "#668354" : "#a4577c";
      g.font = `900 ${Math.max(5, 11 * scale)}px Nunito`; g.textAlign = "center";
      g.fillText(word.state === "smacked" ? "SO TINY!" : word.label, Math.round(p.x), y + height * .76);
    }
    if (target) {
      const label = input.label("a");
      g.font = "900 7px Nunito";
      const keyWidth = g.measureText(label).width + 8;
      g.fillStyle = "#a20d67"; g.beginPath(); g.roundRect(p.x - keyWidth / 2 - 1, y - 17, keyWidth + 2, 14, 3); g.fill();
      g.fillStyle = "#ff2697"; g.beginPath(); g.roundRect(p.x - keyWidth / 2, y - 17, keyWidth, 11, 2); g.fill();
      g.fillStyle = "#ff94ce"; g.fillRect(p.x - keyWidth / 2 + 2, y - 16, keyWidth - 4, 1);
      g.fillStyle = "#ffffff"; g.textAlign = "center"; g.fillText(label, p.x, y - 8);
    }
  };
  const draw = (t: number) => {
    const pad = (span - W) / 2;
    nearInk.clearRect(-pad, 0, span, H);
    g.fillStyle = "#f4dbe5"; g.fillRect(-pad, 0, span, H);
    if (!ready) { g.fillStyle = "#aa6081"; g.font = "bold 12px Nunito"; g.textAlign = "center"; g.fillText("Sekejap ya…", 160, 90); return; }
    road.draw(g, roadDistance);
    // Feet sit on the near sidewalk rather than floating above the distant road.
    g.fillStyle = "#6f425a35"; g.beginPath(); g.ellipse(302, 150, 10, 2, 0, 0, Math.PI * 2); g.fill();
    sprite("qishex", done ? 2 : Math.floor(t * 5) % 2, 302, 151, 36);
    const near = words.filter(w => w.state === "incoming" && w.lane === lane && w.z < HIT_FAR && w.z > HIT_NEAR).sort((a, b) => a.z - b.z)[0];
    for (const word of [...words].sort((a, b) => b.z - a.z)) {
      drawBoard(word, word === near, word.z < HIT_FAR || word.state === "smacked" ? nearInk : g);
    }
    const x = projectLane(0, visualLane).x;
    g.fillStyle = "#6f425a40"; g.beginPath(); g.ellipse(x,176,17,3,0,0,Math.PI*2); g.fill();
    const frame = Math.floor(t * 8) % 4;
    const placeWalker = (img: HTMLImageElement, who: string, px: number, py: number, size: number) => {
      const src = `/assets/chars/${who}_back_walk_${frame}.png`;
      if (img.getAttribute("src") !== src) img.src = src;
      img.style.left = `${left + (px - size / 2) * scale}px`;
      img.style.top = `${top + (py - size) * scale}px`;
      img.style.width = img.style.height = `${size * scale}px`;
    };
    placeWalker(walkers[1], "bowat", x + 27, 170, 35);
    placeWalker(walkers[0], "qish", x + (stumbleT > 0 ? Math.sin(t * 45) * 3 : 0), 178 - (swingT > 0 ? 5 : 0), 52);
    firstDraw();
  };
  const off = onFrame((dt, t) => {
    if (destroyed) return;
    if (!ready) { draw(t); return; }
    roadDistance += dt * (done ? 7 : 21);
    const axis = input.axis().x, dir = Math.abs(axis) > .5 ? Math.sign(axis) : 0;
    if (!done && dir && dir !== lastAxis) { lane = Math.max(0, Math.min(2, lane + dir)); sfx.flip(); }
    lastAxis = dir; visualLane += (lane - visualLane) * Math.min(1, dt * 12);
    stumbleT = Math.max(0, stumbleT - dt); swingT = Math.max(0, swingT - dt);
    if (!done) {
      spawnIn -= dt;
      if (spawnIn <= 0) {
        words.push({ label: TAUNTS[Math.floor(Math.random() * TAUNTS.length)], lane: Math.floor(Math.random() * 3), z: FAR, state: "incoming", life: 0 });
        spawnIn = (fails > 0 ? 2.4 : 1.8) - Math.min(.5, smacked * .04) + Math.random() * .5;
      }
      if (input.pressed("a") || tapped) {
        swingT = .18;
        const target = words.filter(w => w.state === "incoming" && w.lane === lane && w.z < HIT_FAR && w.z > HIT_NEAR).sort((a, b) => a.z - b.z)[0];
        if (target) {
          target.state = "smacked"; target.life = 0; smacked++; refresh(); sfx.stomp();
          msg(["ANGAT KUYUSH!", "SO TINY!", "Tau pun!", "Antek giler!"][smacked % 4], .8);
          if (smacked >= GOAL) win();
        }
      }
      for (const word of words) {
        word.life += dt;
        if (word.state === "incoming") {
          word.z -= 21 * dt;
          if (word.z < HIT_NEAR) {
            word.state = "passed";
            if (word.lane === lane) {
              stumbles++; stumbleT = .5; sfx.hurt(); msg("Angat!", .9);
              if (stumbles % 3 === 0) { fails++; ctx.fail(); }
            }
          }
        }
      }
    }
    tapped = false;
    for (let i = words.length - 1; i >= 0; i--) if (words[i].state === "passed" || (words[i].state === "smacked" && words[i].life > 1)) words.splice(i, 1);
    if (messageTime > 0) { messageTime -= dt; if (messageTime <= 0) message.textContent = ""; }
    draw(t);
  });
  if (import.meta.env.DEV) Object.assign(window, { __qishRunner: () => ({ lane, smacked, fails, words: words.map(w => ({ ...w, projected: boardPoint(w) })), ready, done }) });
  return {
    ready: firstFrame,
    forceWin() { smacked = GOAL; refresh(); win(); },
    destroy() {
      destroyed = true; off(); window.clearTimeout(endingTimer);
      canvas.removeEventListener("pointerdown", onTap); canvas.remove(); foreground.remove(); hud.remove();
      window.removeEventListener("gameviewportresize", resize); walkers.forEach(img => img.remove());
      if (import.meta.env.DEV) delete (window as unknown as Record<string, unknown>).__qishRunner;
    },
  };
}
