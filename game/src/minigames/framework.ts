import Phaser from "phaser";
import { input } from "../core/input";
import { diagnostic } from "../core/diagnostics";
import { onFrame, waitFor } from "../core/loop";
import { sfx } from "../core/sfx";
import { music, BOSS_MUSIC, prepareRhythmSong } from "../core/music";
import type { BossId } from "../content/bosses";
import { BOSSES } from "../content/bosses";
import { bossArt, styleIllustratedScene } from "./storybook";
import { el } from "../ui/dom";
import { controlHints } from "../ui/controlHints";
import { ARENA_STYLE, gameViewport } from "../core/viewport";

// Every boss minigame runs through here: intro card -> Phaser scene -> win/skip.
// Scenes only call ctx.win() / ctx.fail(); the "skip after 3 fails" safety net
// lives here so every minigame gets it for free.

export interface MinigameCtx {
  win(): void;
  fail(): void;
  readonly fails: number;
}

export interface MinigameSceneData {
  ctx: MinigameCtx;
  def: MinigameDef;
}

/** A minigame not built on Phaser (e.g. the Three.js runner). */
export interface CustomMinigame {
  destroy(): void;
  forceWin?(): void;
  /** Resolves after the first illustrated frame has actually been drawn. */
  ready?: Promise<void>;
}

export interface MinigameDef {
  id: BossId;
  title: string;
  place: string;
  howTo: string[];
  /** Phaser minigames: scene class + key. */
  scene?: new () => Phaser.Scene;
  sceneKey?: string;
  /** Anything else: build into `host` and call ctx.win()/ctx.fail(). */
  custom?: (host: HTMLElement, ctx: MinigameCtx) => CustomMinigame;
  /** Background colour for the Phaser canvas and intro card accent. */
  color: string;
  /** For placeholders: the planned design, shown on screen. */
  plan?: string;
}

const SKIP_AFTER = 3;

let game: Phaser.Game | null = null;
let customGame: CustomMinigame | null = null;
let current: { def: MinigameDef; ctx: MinigameCtx } | null = null;
// Bounds are physical (for touch), while the canvas CSS size is logical.
window.addEventListener("gameviewportresize", () => {
  // Container-query layout finishes after the viewport styles change. Measuring
  // immediately can retain the previous orientation's touch bounds.
  requestAnimationFrame(() => game?.scale.refresh());
});

async function introCard(def: MinigameDef, host: HTMLElement, onReady?: () => void) {
  const art = bossArt(def.id);
  const card = el(
    "div",
    "mg-intro",
    `<div class="mg-box" style="--accent:${def.color}">
       <div class="mg-art"><span class="mg-orbit" aria-hidden="true">✦</span><img src="${art}" class="character" alt="${BOSSES[def.id].name}"><span class="mg-ticket">${def.id === "finale" ? "FINAL BOSS" : `STAGE ${Object.keys(BOSSES).indexOf(def.id) + 1}`}</span></div>
       <div class="mg-content"><div class="mg-place">${def.place}</div>
       <h2>${def.title}</h2>
       ${def.plan ? `<p class="mg-plan">${def.plan}</p>` : ""}
       <ul>${def.howTo.map((h, i) => `<li><span>${String(i + 1).padStart(2, "0")}</span><div>${controlHints(h)}</div></li>`).join("")}</ul>
       <div class="mg-go"><kbd data-control="a">Space</kbd> START!</div></div>
     </div>`,
  );
  host.appendChild(card);
  let clicked = false;
  card.addEventListener("pointerdown", () => (clicked = true));
  onReady?.();
  await waitFor(() => input.pressed("a") || clicked);
  sfx.select();
  card.querySelector(".mg-go")!.textContent = "Sekejap ya…";
  card.setAttribute("aria-busy", "true");
  return card;
}

/** Warm the intro while the overworld is still visible, rather than holding an empty fade. */
export async function prepareMinigame(def: MinigameDef) {
  const backdrop = `/assets/storybook/bg_${def.id}.webp`;
  const images = [backdrop, `/assets/mobile/bg_${def.id}.webp`, bossArt(def.id)].map(src => {
    const image = new Image(); image.src = src; return image.decode();
  });
  await Promise.all([document.fonts.load('24px "Nunito"'), document.fonts.load('24px "Bagel Fat One"'),
    ...images,
    ...(def.id === "bolat" ? [prepareRhythmSong()] : [])]);
}

export async function runMinigame(def: MinigameDef, host: HTMLElement, onIntroReady?: () => void): Promise<"win" | "skip"> {
  host.classList.add("storybook-host");
  await prepareMinigame(def);
  host.dataset.boss = def.id;
  const syncBackdrop = () => {
    const ratio = gameViewport.width / gameViewport.height;
    const exact = Math.abs(ratio - 1280 / 720) <= .005;
    const art = ratio > 1280 / 720 + .005 ? `/assets/mobile/bg_${def.id}.webp` : `/assets/storybook/bg_${def.id}.webp`;
    // The 16:9 scene art is used once inside the canvas at its native ratio.
    // Other aspect ratios get a full-bleed cover behind the transparent canvas.
    host.style.background = exact ? "#f4dbe5" : `#f4dbe5 url("${art}") center / cover no-repeat`;
  };
  syncBackdrop();
  window.addEventListener("gameviewportresize", syncBackdrop);
  const intro = await introCard(def, host, onIntroReady);
  diagnostic("boss intro ready", { boss: def.id });
  if (def.id !== "bolat") music.play(BOSS_MUSIC[def.id]);
  return new Promise((resolve) => {
    let fails = 0;
    let done = false;
    let skipHint: HTMLElement | null = null;
    let stopSkip: (() => void) | null = null;

    const finish = (r: "win" | "skip") => {
      if (done) return;
      done = true;
      music.stop();
      intro.remove();
      stopSkip?.();
      skipHint?.remove();
      window.removeEventListener("gameviewportresize", syncBackdrop);
      resolve(r);
    };
    const ctx: MinigameCtx = {
      win: () => finish("win"),
      fail: () => {
        fails++;
        if (fails >= SKIP_AFTER && !skipHint) {
          skipHint = el("div", "mg-skip", controlHints("Susah sangat? Tekan B untuk skip 😉"));
          host.appendChild(skipHint);
          stopSkip = onFrame(() => {
            if (input.pressed("b")) finish("skip");
          });
        }
      },
      get fails() {
        return fails;
      },
    };
    current = { def, ctx };
    if (def.custom) {
      customGame = def.custom(host, ctx);
      if (customGame.ready) void customGame.ready.then(() => intro.remove());
      else intro.remove();
      return;
    }
    game = new Phaser.Game({
      // The Three.js world keeps its WebGL context while a boss runs. A second
      // context is expensive on iOS; these illustrated 2D scenes work in Canvas.
      type: navigator.maxTouchPoints > 0 ? Phaser.CANVAS : Phaser.AUTO,
      parent: host,
      width: 1280,
      height: 720,
      pixelArt: false,
      roundPixels: false,
      antialias: true,
      fps: { target: 60, limit: navigator.maxTouchPoints > 0 ? 60 : 0 },
      transparent: true,
      // The shared viewport already scales landscape. FIT measures the transformed
      // parent and would shrink the arena a second time on phones.
      scale: { mode: Phaser.Scale.NONE, autoCenter: Phaser.Scale.NO_CENTER },
      canvasStyle: ARENA_STYLE,
      physics: { default: "arcade", arcade: { gravity: { x: 0, y: 0 } } },
      input: { keyboard: false, gamepad: false },
      audio: { noAudio: true },
      banner: false,
    });
    const instance = game;
    instance.canvas.addEventListener("webglcontextlost", () => diagnostic("boss WebGL lost", { boss: def.id }));
    instance.canvas.addEventListener("webglcontextrestored", () => diagnostic("boss WebGL restored", { boss: def.id }));
    diagnostic("boss renderer created", { boss: def.id, canvas: [instance.canvas.width, instance.canvas.height] });
    // SceneManager queues additions until READY; getScene would still be null before boot.
    instance.events.once(Phaser.Core.Events.READY, () => {
      if (game !== instance) return;
      // CSS transforms can change the displayed bounds without changing the
      // canvas's logical size. Phaser's parent-size polling misses that case.
      const refreshBounds = () => {
        const r = instance.canvas.getBoundingClientRect();
        const { canvasBounds: b, displayScale, baseSize } = instance.scale;
        if (r.width && r.height && (Math.abs(r.x - b.x) > .01 || Math.abs(r.y - b.y) > .01 ||
          Math.abs(r.width - b.width) > .01 || Math.abs(r.height - b.height) > .01 ||
          Math.abs(displayScale.x - baseSize.width / r.width) > .00001 ||
          Math.abs(displayScale.y - baseSize.height / r.height) > .00001)) instance.scale.refresh();
      };
      instance.events.on(Phaser.Core.Events.PRE_STEP, refreshBounds);
      instance.canvas.addEventListener("touchstart", refreshBounds, { capture: true, passive: true });
      instance.canvas.addEventListener("mousedown", refreshBounds, { capture: true });
      instance.canvas.style.visibility = "hidden";
      instance.scene.add(def.sceneKey!, def.scene!, false);
      const scene = instance.scene.getScene(def.sceneKey!);
      scene.events.once(Phaser.Scenes.Events.CREATE, () => {
        // Fill landscape screens without distorting the 16:9 gameplay. Wider
        // screens show extra sides; 16:10 laptop screens show extra sky/ground.
        // World bounds and gameplay coordinates remain in the original 1280×720 area.
        const fit = () => {
          const ratio = gameViewport.width / gameViewport.height;
          const fillLandscape = ratio >= 1.4;
          const width = fillLandscape && ratio > 1280 / 720 + .005 ? gameViewport.width : 1280;
          const height = fillLandscape && ratio < 1280 / 720 - .005 ? 1280 / ratio : 720;
          const padX = (width - 1280) / 2;
          const padY = (height - 720) / 2;
          instance.scale.resize(width, height);
          instance.canvas.style.cssText = fillLandscape
            ? "position:absolute;inset:0;width:100%;height:100%;transform:none"
            : ARENA_STYLE;
          scene.cameras.main.setSize(width, height).setScroll(-padX, -padY);
          scene.physics.world.setBounds(0, 0, 1280, 720);
          scene.data.set("widePad", padX);
          scene.data.set("tallPad", padY);
          scene.events.emit("widearenaresize");
          instance.scale.refresh();
        };
        const resized = () => requestAnimationFrame(() => { if (game === instance) fit(); });
        fit(); window.addEventListener("gameviewportresize", resized);
        scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => window.removeEventListener("gameviewportresize", resized));
        styleIllustratedScene(scene);
        instance.events.once(Phaser.Core.Events.POST_RENDER, () => {
          instance.canvas.style.visibility = "visible";
          intro.remove();
          diagnostic("boss first frame", { boss: def.id });
        });
      });
      instance.scene.start(def.sceneKey!, { ctx, def } satisfies MinigameSceneData);
    });
  });
}

/** Dev panel: win the running minigame now. Scenes may implement forceWin() for a nicer ending. */
export function forceWinMinigame() {
  if (!current) return;
  if (customGame) {
    if (customGame.forceWin) customGame.forceWin();
    else current.ctx.win();
    return;
  }
  if (!game) return;
  const scene = game.scene.getScene(current.def.sceneKey!) as Phaser.Scene & { forceWin?: () => void };
  if (scene?.forceWin) scene.forceWin();
  else current.ctx.win();
}

/** Read-only scene access for the existing dev tools and visual playthroughs. */
export function activeMinigameScene() {
  return game?.scene.getScenes(true)[0] ?? null;
}

export function destroyMinigame() {
  game?.destroy(true);
  game = null;
  customGame?.destroy();
  customGame = null;
  current = null;
}
