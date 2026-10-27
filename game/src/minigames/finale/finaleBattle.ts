import Phaser from "phaser";
import { preloadStorybook, illustratedBackdrop, paperPanel, setPose, illustratedItem } from "../storybook";
import { input } from "../../core/input";
import { sfx } from "../../core/sfx";
import { el } from "../../ui/dom";
import type { MinigameCtx, MinigameSceneData } from "../framework";

// Finale: Pokémon-style turn-based battle against Raja Nonchalant at Litar Sepang.
// Qish cannot lose: Faris's moves are harmless and her HP never drops below a quarter.
// At half HP it starts raining, Snorlax Twin's card glows, Qish Mega Evolves and
// Hot Giler ends it (and the rain).

const W = 1280;
const H = 720;
const ENEMY_MAX = 600;
const PLAYER_MAX = 250; // Qish ex HP on her card

interface Move {
  name: string;
  from: string;
  dmg?: number;
  heal?: number;
  text: string;
  stun?: boolean;
}

const MOVES: Move[] = [
  { name: "Omey Blast", from: "Blep", dmg: 100, stun: true, text: "Cuteness overload! Raja Nonchalant tak boleh cakap, fikir atau pertahankan diri." },
  { name: "Kentot Bushuk", from: "Bowat", dmg: 60, text: "Kentut senyap... Raja Nonchalant salahkan diri sendiri. 100% guilty, 0% evidence." },
  { name: "Antek Giler", from: "Qish ex", dmg: 200, text: "Cantik giler, walaupun tanpa makeup. Sangat berkesan!" },
  { name: "Makan Banyak", from: "Mega Bowat", heal: 80, text: "Qish curi cookies Bowat. HP naik!" },
];

const ENEMY_MOVES: { name: string; text: string; dmg: number; reply?: string }[] = [
  { name: "MALAS", text: "...tapi dia terlalu malas nak buat apa-apa.", dmg: 0 },
  { name: "ALAMAK", text: "Dia keliru dengan diri sendiri.", dmg: 0 },
  { name: "SILA MENINGGAL", text: "Gaya Luqman Podolski. Qish tak terkesan.", dmg: 25, reply: "Tak lawak." },
  { name: "GARU KEPALA", text: "Dia garu kepala lama-lama. Tiada apa berlaku.", dmg: 0 },
];

export class FinaleBattle extends Phaser.Scene {
  private ctx!: MinigameCtx;
  private enemy!: Phaser.GameObjects.Image;
  private player!: Phaser.GameObjects.Image;
  private enemyHp = ENEMY_MAX;
  private playerHp = PLAYER_MAX;
  private enemyBar!: Phaser.GameObjects.Rectangle;
  private playerBar!: Phaser.GameObjects.Rectangle;
  private playerHpText!: Phaser.GameObjects.Text;
  private playerName!: Phaser.GameObjects.Text;
  private text!: Phaser.GameObjects.Text;
  private dialoguePanel!: Phaser.GameObjects.Graphics;
  private sky!: Phaser.GameObjects.Graphics;
  private rain!: Phaser.GameObjects.Particles.ParticleEmitter;
  private storm = 0;
  private fire!: Phaser.GameObjects.Particles.ParticleEmitter;
  private stunned = false;
  private mega = false;
  private clicked = false;
  private forced = false;

  constructor() {
    super("FinaleBattle");
  }

  init(data: MinigameSceneData) {
    this.ctx = data.ctx;
    this.enemyHp = ENEMY_MAX;
    this.playerHp = PLAYER_MAX;
    this.stunned = false;
    this.mega = false;
    this.forced = false;
  }

  preload() {
    preloadStorybook(this, "finale", { faris_front: "faris_idle", qish_back: "qishback_idle", spark: "item_fire" });
  }

  create() {
    this.makeTextures();
    illustratedBackdrop(this);
    this.sky = this.add.graphics();
    this.drawSky(0);
    this.drawField();

    this.enemy = this.add.image(930, 420, "faris_front").setOrigin(0.5, 1);
    this.enemy.setScale(230 / this.enemy.height);
    this.player = this.add.image(330, 552, "qish_back").setOrigin(0.5, 1);
    this.player.setScale(245 / this.player.height);

    this.fire = this.add.particles(0, 0, "spark", {
      speed: { min: 60, max: 180 },
      angle: { min: 240, max: 300 },
      scale: { start: 0.125, end: 0 },
      lifespan: 700,
      frequency: 30,
      tint: [0xffcb05, 0xff7a1a, 0xe3350d],
      blendMode: "ADD",
      emitting: false,
    });
    this.fire.setPosition(330, 520);
    this.rain = this.add.particles(0, 0, "drop", {
      x: { min: -100, max: W + 100 },
      y: -20,
      speedY: { min: 900, max: 1200 },
      speedX: -180,
      lifespan: 900,
      frequency: 8,
      alpha: 0.6,
      emitting: false,
    });
    this.events.on("widearenaresize", () => {
      const pad = this.data.get("widePad") ?? 0;
      this.rain.particleX = { min: -pad - 100, max: W + pad + 100 };
      this.rain.setFrequency(8 * W / (W + pad * 2));
      this.drawSky(this.storm);
    });

    this.hud();
    this.input.on("pointerdown", () => (this.clicked = true));
    void this.run();
  }

  forceWin() {
    this.forced = true;
    this.enemyHp = 0;
    this.text.setText("");
    this.dialoguePanel.setVisible(false);
    this.ctx.win();
  }

  // ---------- drawing ----------

  private makeTextures() {
    const g = this.make.graphics({ x: 0, y: 0 }, false);
    g.fillStyle(0x8ba8c9).fillRect(0, 0, 3, 14);
    g.generateTexture("drop", 3, 14);
    g.destroy();
  }

  /** 0 = sunset, 1 = storm. */
  private drawSky(storm: number) {
    this.storm = storm;
    const pad = this.data.get("widePad") ?? 0;
    this.sky.clear().fillStyle(0x101a30, storm * 0.6).fillRect(-pad, 0, W + pad * 2, H);
  }

  private drawField() {
    const g = this.add.graphics();
    for (const [x, y, w] of [[930, 420, 180], [330, 552, 220]]) {
      g.fillStyle(0x72445f, 0.18).fillEllipse(x, y + 3, w, 24).fillStyle(0x72445f, 0.1).fillEllipse(x, y + 5, w + 25, 32);
    }
  }

  private hud() {
    const box = (x: number, y: number, w: number, h: number) => paperPanel(this, x, y, w, h);
    const label = { fontFamily: "Nunito", fontSize: "34px", color: "#f8f1d8" };


    box(50, 40, 430, 100);
    this.add.text(72, 52, "RAJA NONCHALANT", { ...label, fontSize: "28px" });
    this.add.text(390, 58, "Lv.26", { ...label, fontSize: "22px" });
    this.add.rectangle(72, 110, 380, 12, 0xe9d4d7).setOrigin(0, 0.5);
    this.enemyBar = this.add.rectangle(74, 110, 376, 8, 0x80d8c0).setOrigin(0, 0.5);

    box(760, 425, 470, 110);
    this.playerName = this.add.text(782, 440, "QISH", label);
    this.add.text(1130, 446, "Lv.26", { ...label, fontSize: "20px" });
    this.add.rectangle(782, 490, 420, 12, 0xe9d4d7).setOrigin(0, 0.5);
    this.playerBar = this.add.rectangle(784, 490, 416, 8, 0x80d8c0).setOrigin(0, 0.5);
    this.playerHpText = this.add.text(1200, 505, "", { ...label, fontFamily: "Nunito, sans-serif", fontSize: "15px" }).setOrigin(1, 0);

    this.dialoguePanel = box(20, 560, W - 40, 140);
    this.text = this.add.text(52, 584, "", {
      fontFamily: "Nunito, sans-serif",
      fontSize: "30px",
      fontStyle: "bold",
      color: "#f8f1d8",
      wordWrap: { width: W - 120 },
      lineSpacing: 6,
    });
    this.refreshBars(false);
  }

  private refreshBars(animate = true) {
    const e = Math.max(0, this.enemyHp / ENEMY_MAX);
    const p = Math.max(0, this.playerHp / PLAYER_MAX);
    const color = (k: number) => (k > 0.5 ? 0x80d8c0 : k > 0.2 ? 0xf8d878 : 0xf07898);
    this.enemyBar.fillColor = color(e);
    this.playerBar.fillColor = color(p);
    if (animate) {
      this.tweens.add({ targets: this.enemyBar, width: 376 * e, duration: 500 });
      this.tweens.add({ targets: this.playerBar, width: 416 * p, duration: 500 });
    } else {
      this.enemyBar.width = 376 * e;
      this.playerBar.width = 416 * p;
    }
    this.playerHpText.setText(`${Math.max(0, Math.round(this.playerHp))} / ${PLAYER_MAX}`);
  }

  // ---------- flow helpers ----------

  private nextFrame() {
    return new Promise<void>((r) => this.time.delayedCall(16, r));
  }

  private wait(ms: number) {
    return new Promise<void>((r) => this.time.delayedCall(ms, r));
  }

  /** Typewriter into the text box, then wait for A / tap. */
  private async say(msg: string) {
    this.clicked = false;
    let shown = 0;
    while (shown < msg.length) {
      if (this.forced) return;
      if (input.consumePressed("a") || this.clicked) {
        this.clicked = false;
        shown = msg.length;
      } else shown++;
      this.text.setText(msg.slice(0, shown));
      if (shown % 3 === 0) sfx.talk();
      await this.nextFrame();
    }
    const arrow = this.add.text(W - 32, 670, `${input.label("a")} · Teruskan ▸`, { fontFamily: "Nunito, sans-serif", fontSize: "14px", color: "#f8d878" }).setOrigin(1, 0);
    this.tweens.add({ targets: arrow, alpha: 0.5, yoyo: true, repeat: -1, duration: 650 });
    this.clicked = false;
    while (!(input.consumePressed("a") || this.clicked) && !this.forced) {
      arrow.setText(`${input.label("a")} · Teruskan ▸`);
      await this.nextFrame();
    }
    arrow.destroy();
    sfx.blip();
  }

  /** Move menu over the text box; returns the chosen index. Arrows/stick to move, A or tap to pick. */
  private async choose(options: { label: string; sub: string; glow?: boolean }[]) {
    // The A press that finishes the preceding line must not also pick a move.
    do { await this.nextFrame(); } while (input.down("a") && !this.forced);
    this.text.setText("");
    this.text.setVisible(false);
    const c = this.add.container(0, 0);
    const cols = options.length > 1 ? 2 : 1;
    const bw = options.length > 1 ? 375 : 520;
    const x0 = options.length > 1 ? 460 : 700;
    const items = options.map((o, i) => {
      const x = x0 + (i % cols) * (bw + 16);
      const y = 576 + Math.floor(i / cols) * 60;
      const bg = this.add.graphics();
      const hit = this.add.zone(x, y, bw, 52).setOrigin(0).setInteractive();
      const t = this.add.text(x + 16, y + 4, o.label, { fontFamily: "Bagel Fat One, sans-serif", fontSize: "23px", color: "#f8f1d8" });
      const s = this.add.text(x + 17, y + 31, o.sub, { fontFamily: "Nunito, sans-serif", fontSize: "15px", color: "#80d8c0" });
      c.add([bg, t, s, hit]);
      return { bg, hit, x, y };
    });
    let sel = 0;
    let picked = -1;
    const touchMenu = el("div", `finale-choice-menu${options.length === 1 ? " single" : ""}`,
      `<div class="finale-choice-heading">${options.length > 1 ? "Qish nak guna move mana?" : "Pilih aksi"}</div><div class="finale-choice-grid"></div>`);
    const choiceGrid = touchMenu.querySelector<HTMLElement>(".finale-choice-grid")!;
    options.forEach((option, i) => {
      const button = el("button", "", `<strong>${option.label}</strong><small>${option.sub}</small>`);
      button.type = "button";
      button.addEventListener("click", event => { event.stopPropagation(); picked = i; });
      choiceGrid.appendChild(button);
    });
    this.game.canvas.parentElement!.appendChild(touchMenu);
    const removeTouchMenu = () => touchMenu.remove();
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, removeTouchMenu);
    const syncTouch = () => {
      touchMenu.hidden = false;
      c.setVisible(false);
      touchMenu.querySelectorAll<HTMLButtonElement>("button").forEach((button, i) => {
        button.classList.toggle("selected", i === sel);
      });
    };
    syncTouch();
    items.forEach((b, i) => {
      b.hit.on("pointerdown", () => (picked = i));
      b.hit.on("pointerover", () => { sel = i; paint(); });
    });
    const paint = () => items.forEach(({ bg, x, y }, i) => {
      bg.clear().fillStyle(0xc794a9).fillRoundedRect(x, y + 3, bw, 52, 10)
        .fillStyle(i === sel ? 0xf1c2d3 : options[i].glow ? 0xf8e2b3 : 0xfff8e8).fillRoundedRect(x, y, bw, 52, 10)
        .lineStyle(i === sel ? 3 : 1, i === sel ? 0xb96890 : 0xd6b4c2).strokeRoundedRect(x, y, bw, 52, 10);
      if (i === sel) bg.fillStyle(0xb96890).fillTriangle(x + bw - 20, y + 20, x + bw - 12, y + 26, x + bw - 20, y + 32);
    });
    paint();
    let last = { x: 0, y: 0 };
    while (picked < 0 && !this.forced) {
      syncTouch();
      const a = input.axis();
      const dx = Math.abs(a.x) > 0.5 ? Math.sign(a.x) : 0;
      const dy = Math.abs(a.y) > 0.5 ? Math.sign(a.y) : 0;
      if ((dx && dx !== last.x) || (dy && dy !== last.y)) {
        sel = Phaser.Math.Clamp(sel + dx + dy * cols, 0, options.length - 1);
        paint();
        sfx.blip();
      }
      last = { x: dx, y: dy };
      if (input.consumePressed("a")) picked = sel;
      await this.nextFrame();
    }
    sfx.select();
    touchMenu.remove();
    this.events.off(Phaser.Scenes.Events.SHUTDOWN, removeTouchMenu);
    this.text.setVisible(true);
    c.destroy();
    return picked;
  }

  private damageNumber(target: Phaser.GameObjects.Image, label: string, color = "#ffcb05") {
    const t = this.add
      .text(target.x, target.y - target.displayHeight - 10, label, {
        fontFamily: "Bagel Fat One, sans-serif",
        fontSize: "56px",
        color,
        stroke: "#17151f",
        strokeThickness: 8,
      })
      .setOrigin(0.5);
    this.tweens.add({ targets: t, y: t.y - 80, alpha: 0, duration: 1100, onComplete: () => t.destroy() });
  }

  private async hitEnemy(dmg: number, label = `-${dmg}`) {
    // Projectile of sparkles from Qish to Faris.
    if (this.mega) setPose(this.player, "megaqish", "action");
    const orb = illustratedItem(this, this.mega ? "fire" : "heart", this.player.x, this.player.y - 170, this.mega ? 80 : 52);
    await new Promise<void>((r) => this.tweens.add({ targets: orb, x: this.enemy.x, y: this.enemy.y - 120, duration: 420, ease: "Quad.easeIn", onComplete: () => r() }));
    orb.destroy();
    sfx.stomp();
    this.cameras.main.shake(220, 0.01);
    this.tweens.add({ targets: this.enemy, x: this.enemy.x + 24, yoyo: true, repeat: 3, duration: 50 });
    this.tweens.add({ targets: this.enemy, alpha: 0.3, yoyo: true, repeat: 2, duration: 90 });
    setPose(this.enemy, "faris", "hurt");
    this.time.delayedCall(600, () => { if (!this.forced) setPose(this.enemy, "faris", "idle"); });
    this.enemyHp = Math.max(0, this.enemyHp - dmg);
    this.damageNumber(this.enemy, label);
    this.refreshBars();
    await this.wait(700);
    if (this.mega) setPose(this.player, "megaqish", "idle");
  }

  // ---------- battle ----------

  private async run() {
    this.player.x -= 600;
    this.enemy.x += 600;
    this.tweens.add({ targets: this.enemy, x: 930, duration: 700, ease: "Back.easeOut" });
    await this.say("Raja Nonchalant mencabar Qish!");
    this.tweens.add({ targets: this.player, x: 330, duration: 600, ease: "Back.easeOut" });
    await this.say("Pergi, Qish! 💛");

    while (this.enemyHp > 0 && !this.forced) {
      if (!this.mega && this.enemyHp <= ENEMY_MAX / 2) await this.megaEvolve();
      await this.playerTurn();
      if (this.enemyHp <= 0 || this.forced) break;
      await this.enemyTurn();
    }
    if (this.forced) return;
    await this.victory();
  }

  private async playerTurn() {
    if (this.mega) {
      await this.choose([{ label: "HOT GILER", sub: "Mega Qish ex · 290", glow: true }]);
      await this.say("Mega Qish ex guna HOT GILER! 🔥");
      this.fire.setFrequency(10);
      await this.hitEnemy(this.enemyHp, "290 × ∞");
      return;
    }
    const pick = await this.choose(MOVES.map((m) => ({ label: m.name, sub: `${m.from} · ${m.heal ? `+${m.heal} HP` : `${m.dmg} DMG`}` })));
    if (this.forced) return;
    const m = MOVES[pick];
    await this.say(`Qish guna ${m.name.toUpperCase()}!`);
    if (m.heal) {
      this.playerHp = Math.min(PLAYER_MAX, this.playerHp + m.heal);
      this.damageNumber(this.player, `+${m.heal}`, "#7ee08a");
      sfx.sparkle();
      this.refreshBars();
      await this.wait(500);
    } else if (m.dmg) {
      await this.hitEnemy(m.dmg);
    }
    await this.say(m.text);
    if (m.stun) {
      this.stunned = true;
      await this.say('Raja Nonchalant: "Alamak."');
    }
  }

  private async enemyTurn() {
    if (this.stunned) {
      this.stunned = false;
      await this.say("Raja Nonchalant masih tergamam. Dia tak boleh bergerak!");
      return;
    }
    const mv = Phaser.Utils.Array.GetRandom(ENEMY_MOVES);
    setPose(this.enemy, "faris", "action");
    await this.say(`Raja Nonchalant guna ${mv.name}!`);
    if (mv.dmg) {
      this.tweens.add({ targets: this.enemy, x: this.enemy.x - 40, yoyo: true, duration: 120 });
      sfx.hurt();
      // Never below a quarter: this fight is unlosable on purpose.
      this.playerHp = Math.max(PLAYER_MAX / 4, this.playerHp - mv.dmg);
      this.damageNumber(this.player, `-${mv.dmg}`, "#ffffff");
      this.refreshBars();
      await this.wait(400);
    }
    await this.say(mv.text);
    if (mv.reply) await this.say(`Qish: "${mv.reply}"`);
  }

  private async megaEvolve() {
    await this.say('Raja Nonchalant: "Saya belum serius lagi!"');
    // Storm rolls in.
    this.rain.start();
    const sky = { k: 0 };
    this.tweens.add({ targets: sky, k: 1, duration: 1200, onUpdate: () => this.drawSky(sky.k) });
    sfx.prot();
    await this.say("Tiba-tiba hujan lebat turun atas Litar Sepang...");
    await this.say("Kad Snorlax Twin dalam poket Qish mula bersinar! ✨");
    await this.choose([{ label: "MEGA EVOLVE!", sub: "Snorlax Twin → ?", glow: true }]);

    // Evolution: white flashes, grow, fire aura.
    for (let i = 0; i < 4; i++) {
      this.cameras.main.flash(180, 255, 255, 255);
      sfx.sparkle();
      await this.wait(260);
    }
    this.player.clearTint();
    setPose(this.player, "megaqish", "idle");
    this.player.setDisplaySize(290, 290);
    this.tweens.add({ targets: this.player, scale: { from: this.player.scale * 0.7, to: this.player.scale }, duration: 500, ease: "Back.easeOut" });
    this.fire.start();
    this.mega = true;
    this.playerName.setText("MEGA QISH ex");
    this.playerHp = PLAYER_MAX;
    this.refreshBars();
    sfx.fanfare();
    await this.say("Qish Mega Evolve jadi MEGA QISH ex!! 🔥");
    await this.say("Ability SEPANG BADDIE aktif! Labu Lanjut queen dah sampai.");
  }

  private async victory() {
    this.rain.stop();
    setPose(this.enemy, "faris", "hurt");
    setPose(this.player, "megaqish", "win");
    const sky = { k: 1 };
    this.tweens.add({ targets: sky, k: 0, duration: 1600, onUpdate: () => this.drawSky(sky.k) });
    this.tweens.add({ targets: this.enemy, angle: 90, y: this.enemy.y + 30, alpha: 0.6, duration: 900, ease: "Bounce.easeOut" });
    await this.say("Hujan berhenti. Malaysia berhenti hujan sebab dia muncul. ☀️");
    await this.say("Raja Nonchalant tumbang... dengan malas.");
    this.fire.stop();
    this.text.setText("");
    this.dialoguePanel.setVisible(false);
    this.ctx.win();
  }

  update() {
    // Keep the aura following Qish when she grows.
    if (this.fire) this.fire.setPosition(this.player.x, this.player.y - 60);
  }
}
