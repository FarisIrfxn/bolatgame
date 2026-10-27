import Phaser from "phaser";
import { preloadStorybook, illustratedBackdrop, paperPanel, setPose, illustratedItem } from "../storybook";
import { input } from "../../core/input";
import { sfx } from "../../core/sfx";
import type { MinigameCtx, MinigameSceneData } from "../framework";

// Boss 5: Mega Bowat loose in the Cosy Place kitchen. Press A (or tap) to PROT upward,
// eat 10 cookies floating between the pots. Bumping a pot only bounces him back.

const W = 1280;
const H = 720;
const GOAL = 10;
const GRAVITY = 1500;
const FLAP = -560;

interface Column {
  x: number;
  gapY: number;
  gap: number;
  top: Phaser.GameObjects.Container;
  bottom: Phaser.GameObjects.Container;
  cookie: Phaser.GameObjects.Container | null;
  passed: boolean;
}

export class MegaBowatFlappy extends Phaser.Scene {
  private ctx!: MinigameCtx;
  private bowat!: Phaser.GameObjects.Image;
  private vy = 0;
  private columns: Column[] = [];
  private eaten = 0;
  private bumps = 0;
  private fails = 0;
  private bumpT = 0;
  private spawnIn = 0.6;
  private started = false;
  private done = false;
  private tapped = false;
  private countText!: Phaser.GameObjects.Text;
  private msg!: Phaser.GameObjects.Text;
  private alphaMasks = new Map<string, { width: number; height: number; pixels: Uint8ClampedArray }>();

  constructor() {
    super("MegaBowatFlappy");
  }

  init(data: MinigameSceneData) {
    this.ctx = data.ctx;
    this.eaten = 0;
    this.bumps = 0;
    this.fails = 0;
    this.started = false;
    this.done = false;
    this.columns = [];
    this.vy = 0;
  }

  preload() {
    preloadStorybook(this, "megabowat", { bowat_side: "megabowat_idle", cookie: "item_cookie" });
  }

  create() {
    illustratedBackdrop(this);
    paperPanel(this, 14, 12, 270, 64).setDepth(30);
    this.bowat = this.add.image(300, H / 2, "bowat_side").setOrigin(0.5);
    this.bowat.setScale(130 / this.bowat.height).setFlipX(true).setDepth(3);

    const style = { fontFamily: "Bagel Fat One, sans-serif", color: "#f8f1d8" };
    this.countText = this.add.text(30, 20, "", { ...style, fontSize: "34px" }).setDepth(32);
    this.msg = this.add
      .text(W / 2, 220, "Tekan A untuk PROT! 💨", { ...style, fontSize: "50px", color: "#ffcb05", stroke: "#17151f", strokeThickness: 8 })
      .setOrigin(0.5)
      .setDepth(32);
    this.refresh();
    this.input.on("pointerdown", () => (this.tapped = true));
  }

  private refresh() {
    this.countText.setText(`🍪 ${this.eaten} / ${GOAL}`);
  }

  private say(text: string, secs = 1) {
    this.msg.setText(text).setAlpha(1).setScale(1.2);
    this.tweens.killTweensOf(this.msg);
    this.tweens.add({ targets: this.msg, scale: 1, duration: 150 });
    this.tweens.add({ targets: this.msg, alpha: 0, delay: secs * 1000, duration: 300 });
  }

  private pot(x: number, y: number, h: number, flip: boolean) {
    const c = this.add.container(x, flip ? y - h : y);
    const art = illustratedItem(this, "pot", 0, h / 2, 96).setDisplaySize(164, Math.max(24, h)).setFlipY(flip);
    c.add(art);
    return c;
  }

  private spawnColumn() {
    const assist = this.fails > 0;
    const gap = assist ? 330 : 270;
    const gapY = Phaser.Math.Between(170 + gap / 2 - 100, H - 80 - gap / 2);
    const x = W + (this.data.get("widePad") ?? 0) + 100;
    const top = this.pot(x, gapY - gap / 2, gapY - gap / 2, true);
    const bottom = this.pot(x, gapY + gap / 2, H - 40 - (gapY + gap / 2), false);
    const cookie = this.add.container(x, gapY, [this.add.image(0, 0, "cookie").setDisplaySize(56, 56)]);
    this.tweens.add({ targets: cookie, angle: 360, duration: 2000, repeat: -1 });
    this.columns.push({ x, gapY, gap, top, bottom, cookie, passed: false });
  }

  forceWin() {
    if (this.done) return;
    this.eaten = GOAL;
    this.refresh();
    this.win();
  }

  private win() {
    this.done = true;
    sfx.fanfare();
    this.say("Kenyang! *garu ontot*", 2.4);
    setPose(this.bowat, "megabowat", "win");
    this.tweens.add({ targets: this.bowat, x: W / 2, y: H / 2, scale: this.bowat.scale * 1.4, duration: 800, ease: "Back.easeOut" });
    this.time.delayedCall(2400, () => this.ctx.win());
  }

  /** Check only visible, opaque art pixels. Padding around either sprite is free space. */
  private touchesPot(c: Column) {
    if (Math.abs(c.x - this.bowat.x) > 160) return false;
    for (const pot of [c.top, c.bottom]) {
      const art = pot.first as Phaser.GameObjects.Image;
      const left = pot.x - art.displayWidth / 2;
      const top = pot.y + art.y - art.displayHeight / 2;
      const frame = this.bowat.frame;
      // Sample the opaque silhouette, accounting for flip and tilt. Never judge against
      // the full 256px sprite square: most of that square is transparent padding.
      for (let sy = 16; sy < frame.height; sy += 8) for (let sx = 16; sx < frame.width; sx += 8) {
        const alpha = this.alphaAt(this.bowat, sx, sy);
        if (alpha < 160) continue;
        const dx = (sx - frame.width / 2) * this.bowat.scaleX * (this.bowat.flipX ? -1 : 1);
        const dy = (sy - frame.height / 2) * this.bowat.scaleY;
        const angle = this.bowat.rotation;
        const wx = this.bowat.x + dx * Math.cos(angle) - dy * Math.sin(angle);
        const wy = this.bowat.y + dx * Math.sin(angle) + dy * Math.cos(angle);
        const px = (wx - left) / art.displayWidth * art.frame.width;
        let py = (wy - top) / art.displayHeight * art.frame.height;
        if (art.flipY) py = art.frame.height - py;
        if (px >= 0 && px < art.frame.width && py >= 0 && py < art.frame.height &&
          this.alphaAt(art, px, py) > 160) return true;
      }
    }
    return false;
  }

  private alphaAt(image: Phaser.GameObjects.Image, x: number, y: number) {
    const f = image.frame;
    const key = `${image.texture.key}:${f.name}`;
    let mask = this.alphaMasks.get(key);
    if (!mask) {
      const canvas = document.createElement("canvas"); canvas.width = f.width; canvas.height = f.height;
      const g = canvas.getContext("2d", { willReadFrequently: true })!;
      g.drawImage(f.source.image as HTMLImageElement, f.cutX, f.cutY, f.cutWidth, f.cutHeight, 0, 0, f.width, f.height);
      mask = { width: f.width, height: f.height, pixels: g.getImageData(0,0,f.width,f.height).data };
      this.alphaMasks.set(key, mask);
    }
    x = Math.floor(x); y = Math.floor(y);
    if (x < 0 || y < 0 || x >= mask.width || y >= mask.height) return 0;
    return mask.pixels[(y * mask.width + x) * 4 + 3];
  }

  private bump() {
    if (this.bumpT > 0) return;
    this.bumpT = 1;
    this.bumps++;
    sfx.hurt();
    this.cameras.main.shake(140, 0.008);
    this.say("Tang! 🍳", 0.6);
    this.vy = -260;
    setPose(this.bowat, "megabowat", "hurt");
    if (this.bumps % 3 === 0) {
      this.fails++;
      this.ctx.fail();
    }
  }

  update(_t: number, deltaMs: number) {
    const dt = deltaMs / 1000;
    if (this.done) return;
    const flap = input.pressed("a") || this.tapped;
    this.tapped = false;
    if (flap) {
      if (!this.started) {
        this.started = true;
        this.msg.setAlpha(0);
      }
      this.vy = FLAP;
      sfx.prot();
      setPose(this.bowat, "megabowat", "action");
      this.time.delayedCall(150, () => { if (!this.done) setPose(this.bowat, "megabowat", "idle"); });
      const puff = illustratedItem(this, "fart", this.bowat.x - 60, this.bowat.y + 30, 64);
      this.tweens.add({ targets: puff, x: puff.x - 80, scale: puff.scale * 1.8, alpha: 0, duration: 500, onComplete: () => puff.destroy() });
    }
    if (!this.started) {
      this.bowat.y = H / 2 + Math.sin(this.time.now / 300) * 14;
      return;
    }

    this.bumpT = Math.max(0, this.bumpT - dt);
    this.vy = Math.min(700, this.vy + GRAVITY * dt);
    this.bowat.y = Phaser.Math.Clamp(this.bowat.y + this.vy * dt, 70, H - 100);
    if (this.bowat.y >= H - 100) this.vy = Math.min(this.vy, 0);
    this.bowat.setAngle(Phaser.Math.Clamp(this.vy / 20, -20, 30));
    this.bowat.setAlpha(this.bumpT > 0 && Math.floor(this.bumpT * 12) % 2 ? 0.5 : 1);

    const speed = this.fails > 0 ? 220 : 280;
    this.spawnIn -= dt;
    if (this.spawnIn <= 0) {
      this.spawnColumn();
      this.spawnIn = this.fails > 0 ? 2.3 : 1.9;
    }

    for (let i = this.columns.length - 1; i >= 0; i--) {
      const c = this.columns[i];
      c.x -= speed * dt;
      c.top.x = c.bottom.x = c.x;
      if (c.cookie) {
        c.cookie.x = c.x;
        if (Math.abs(c.x - this.bowat.x) < 60 && Math.abs(c.gapY - this.bowat.y) < 80) {
          c.cookie.destroy();
          c.cookie = null;
          this.eaten++;
          this.refresh();
          sfx.blip();
          this.say(["Nyam!", "MAKAN BANYAK!", "Cookies! 🍪", "Lagi!"][this.eaten % 4], 0.6);
          if (this.eaten >= GOAL) return this.win();
        }
      }
      // Hit a pot: inside the column horizontally and outside the gap vertically.
      if (this.touchesPot(c)) this.bump();
      if (c.x < -(this.data.get("widePad") ?? 0) - 120) {
        c.top.destroy();
        c.bottom.destroy();
        c.cookie?.destroy();
        this.columns.splice(i, 1);
      }
    }
  }
}
