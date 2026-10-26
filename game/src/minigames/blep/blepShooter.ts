import Phaser from "phaser";
import { preloadStorybook, illustratedBackdrop, paperPanel, illustratedItem, raisedMeter } from "../storybook";
import { input } from "../../core/input";
import { sfx } from "../../core/sfx";
import type { MinigameCtx, MinigameSceneData } from "../framework";

// Boss 4: Blep over KLIA. Move to dodge the zzz shots, press A to fire a heart.
// The same button releases Omey Blast once its bar is charged. Empty MALAS AIR's HP and all the cockpit can say is ALAMAK.

const W = 1280;
const H = 720;
const BOSS_HP = 60;

export class BlepShooter extends Phaser.Scene {
  private ctx!: MinigameCtx;
  private ship!: Phaser.GameObjects.Container;
  private boss!: Phaser.GameObjects.Container;
  private hearts!: Phaser.Physics.Arcade.Group;
  private zzz!: Phaser.Physics.Arcade.Group;
  private bossHp = BOSS_HP;
  private bossBar!: Phaser.GameObjects.Rectangle;
  private msg!: Phaser.GameObjects.Text;
  private clouds: { o: Phaser.GameObjects.Container; speed: number }[] = [];
  private trails: { o: Phaser.GameObjects.Arc; life: number }[] = [];
  private trailIn = 0;
  private shootIn = 1.6;
  private invuln = 0;
  private hits = 0;
  private fails = 0;
  private done = false;
  private bossT = 0;
  private pointer: { x: number; y: number } | null = null;

  constructor() {
    super("BlepShooter");
  }

  init(data: MinigameSceneData) {
    this.ctx = data.ctx;
    this.bossHp = BOSS_HP;
    this.hits = 0;
    this.fails = 0;
    this.done = false;
    this.shootIn = 1.6;
    this.bossT = 0;
    this.pointer = null;
  }

  preload() {
    preloadStorybook(this, "blep", { qish_front: "bolat_idle", babah_front: "babah_front", heart: "item_heart", zbubble: "item_sleep" });
  }

  create() {
    this.clouds = [];
    this.trails = [];
    illustratedBackdrop(this);
    for (let i = 0; i < 6; i++) this.spawnCloud(Math.random() * H, i % 3 === 0);
    this.boss = this.add.container(W / 2, 265);
    this.boss.add(illustratedItem(this, "enemyplane", 0, -12, 250));
    this.boss.add(this.add.image(0, 17, "babah_front").setDisplaySize(48, 48));
    paperPanel(this, W / 2 - 290, 12, 580, 70, 0xf8d878);
    this.add.text(W / 2, 30, "MALAS AIR · BABAH", { fontFamily: "Bagel Fat One, sans-serif", fontSize: "24px", color: "#ffffff", stroke: "#17151f", strokeThickness: 5 }).setOrigin(0.5).setDepth(4);
    this.bossBar = raisedMeter(this, W / 2 - 250, 62, 500, 22, 0xe99aaf);

    this.ship = this.add.container(W / 2, H - 110);
    this.ship.add(illustratedItem(this, "playerplane", 0, 0, 176));
    this.ship.add(this.add.image(0, -16, "qish_front").setDisplaySize(52, 52));
    this.hearts = this.physics.add.group({ allowGravity: false });
    this.zzz = this.physics.add.group({ allowGravity: false });

    const style = { fontFamily: "Bagel Fat One, sans-serif", color: "#ffffff" };
    this.msg = this.add
      .text(W / 2, H / 2, "", { ...style, fontSize: "58px", color: "#ffcb05", stroke: "#17151f", strokeThickness: 8, align: "center" })
      .setOrigin(0.5)
      .setDepth(5);

    this.input.on("pointerdown", (p: Phaser.Input.Pointer) => (this.pointer = { x: p.x, y: p.y }));
    this.input.on("pointermove", (p: Phaser.Input.Pointer) => p.isDown && (this.pointer = { x: p.x, y: p.y }));
    this.input.on("pointerup", () => (this.pointer = null));
    this.say("A untuk tembak! Elak zzz 😛", 2);
  }

  /** A puffy cloud; `big` ones drift past in front, small ones far below. */
  private spawnCloud(y: number, big: boolean) {
    const o = this.add.container(Math.random() * W, y);
    o.add(illustratedItem(this, "cloud", 0, 0, big ? 260 : 140).setAlpha(big ? 0.8 : 0.5));
    o.setDepth(big ? -2 : -5);
    this.clouds.push({ o, speed: big ? 220 + Math.random() * 60 : 70 + Math.random() * 40 });
  }



  private say(text: string, secs = 1) {
    this.msg.setText(text).setAlpha(1).setScale(1.2);
    this.tweens.killTweensOf(this.msg);
    this.tweens.add({ targets: this.msg, scale: 1, duration: 150 });
    this.tweens.add({ targets: this.msg, alpha: 0, delay: secs * 1000, duration: 300 });
  }

  forceWin() {
    if (this.done) return;
    this.bossHp = 0;
    this.win();
  }

  private damage(n: number) {
    if (this.done) return;
    this.bossHp = Math.max(0, this.bossHp - n);
    this.bossBar.width = (500 * this.bossHp) / BOSS_HP;
    this.tweens.add({ targets: this.boss, alpha: 0.5, duration: 60, yoyo: true });
    if (this.bossHp <= 0) this.win();
  }

  private hurt() {
    if (this.invuln > 0 || this.done) return;
    this.invuln = 1.4;
    this.hits++;
    sfx.hurt();
    this.cameras.main.shake(150, 0.008);
    this.say("Zzz... mengantuk sekejap!", 0.8);
    if (this.hits % 3 === 0) {
      this.fails++;
      this.ctx.fail();
    }
  }

  private win() {
    this.done = true;
    for (const z of this.zzz.getChildren()) (z.getData("label") as Phaser.GameObjects.Text | undefined)?.destroy();
    this.zzz.clear(true, true);
    sfx.fanfare();
    for (let i = 0; i < 6; i++) {
      this.time.delayedCall(i * 160, () => {
        this.cameras.main.flash(120, 255, 255, 255);
        const h = this.add.image(this.boss.x + Phaser.Math.Between(-140, 140), this.boss.y + Phaser.Math.Between(-40, 60), "heart").setDisplaySize(128,128);
        this.tweens.add({ targets: h, scale: h.scale * 2, alpha: 0, duration: 700 });
      });
    }
    this.tweens.add({ targets: this.boss, y: this.boss.y - 20, angle: 12, duration: 300, yoyo: true, repeat: 3 });
    this.say("Bagus, kakak! ✨", 2.5);
    this.time.delayedCall(2600, () => this.ctx.win());
  }

  update(_t: number, deltaMs: number) {
    const dt = deltaMs / 1000;
    for (const c of this.clouds) {
      c.o.y += c.speed * dt;
      if (c.o.y > H + 120) {
        c.o.y = -120;
        c.o.x = Math.random() * W;
      }
    }
    // Contrails from both engines.
    this.trailIn -= dt;
    if (!this.done && this.trailIn <= 0) {
      this.trailIn = 0.05;
      for (const ex of [-46, 46]) {
        const p = this.add.circle(this.ship.x + ex, this.ship.y + 34, 7, 0xffffff, 0.7).setDepth(-1);
        this.trails.push({ o: p, life: 0.7 });
      }
    }
    this.trails = this.trails.filter((p) => {
      p.life -= dt;
      p.o.y += 260 * dt;
      p.o.setScale(1 + (0.7 - p.life) * 1.6).setAlpha(Math.max(0, p.life));
      if (p.life <= 0) p.o.destroy();
      return p.life > 0;
    });
    if (this.done) return;
    this.invuln = Math.max(0, this.invuln - dt);
    this.ship.setAlpha(this.invuln > 0 && Math.floor(this.invuln * 12) % 2 ? 0.4 : 1);

    // Move: stick/arrows, or drag on touch.
    const a = input.axis();
    let vx = a.x;
    let vy = a.y;
    if (this.pointer) {
      vx = Phaser.Math.Clamp((this.pointer.x - this.ship.x) / 60, -1, 1);
      vy = Phaser.Math.Clamp((this.pointer.y - 80 - this.ship.y) / 60, -1, 1);
    }
    this.ship.x = Phaser.Math.Clamp(this.ship.x + vx * 560 * dt, 104, W - 104);
    this.ship.y = Phaser.Math.Clamp(this.ship.y + vy * 420 * dt, H / 2, H - 90);
    this.ship.angle = vx * 10;

    if (input.pressed("a")) {
      const h = this.hearts.create(this.ship.x, this.ship.y - 70, "heart") as Phaser.Physics.Arcade.Image;
      h.setDisplaySize(32, 32).setVelocityY(-900);
      sfx.blip();
    }

    // Boss drifts and lazily shoots.
    this.bossT += dt;
    this.boss.x = W / 2 + Math.sin(this.bossT * 0.7) * 380;
    this.shootIn -= dt;
    if (this.shootIn <= 0) {
      const easy = this.fails > 0;
      this.shootIn = (easy ? 1.6 : 1.1) + Math.random() * 0.6;
      const z = this.zzz.create(this.boss.x, this.boss.y + 60, "zbubble") as Phaser.Physics.Arcade.Image;
      const ang = Phaser.Math.Angle.Between(this.boss.x, this.boss.y, this.ship.x, this.ship.y);
      const sp = easy ? 170 : 230;
      z.setDisplaySize(44, 44).setVelocity(Math.cos(ang) * sp, Math.sin(ang) * sp);
      const label = this.add.text(z.x, z.y, "z", { fontFamily: "Gaegu, sans-serif", fontSize: "30px", color: "#1f2f7a", fontStyle: "bold" }).setOrigin(0.5);
      z.setData("label", label);
    }

    // Collisions done by hand: few objects, simple circles.
    for (const h of this.hearts.getChildren() as Phaser.Physics.Arcade.Image[]) {
      if (h.y < -40) h.destroy();
      else if (Math.abs(h.x - this.boss.x) < 108 && Math.abs(h.y - (this.boss.y + 10)) < 50) {
        h.destroy();
        this.damage(2);
        sfx.blip();
      }
    }
    for (const z of this.zzz.getChildren() as Phaser.Physics.Arcade.Image[]) {
      const label = z.getData("label") as Phaser.GameObjects.Text;
      label.setPosition(z.x, z.y);
      if (z.y > H + 40 || z.x < -40 || z.x > W + 40) {
        label.destroy();
        z.destroy();
      } else if (Phaser.Math.Distance.Between(z.x, z.y, this.ship.x, this.ship.y) < 50) {
        label.destroy();
        z.destroy();
        this.hurt();
      }
    }
  }
}
