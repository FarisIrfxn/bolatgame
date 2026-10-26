import Phaser from "phaser";
import { raisedMeter, preloadStorybook, illustratedBackdrop, illustratedItem, paperPanel, setPose, type IllustratedItem } from "../storybook";
import { input } from "../../core/input";
import { sfx } from "../../core/sfx";
import type { MinigameCtx, MinigameSceneData } from "../framework";

// Boss 3: Snorlax Twin sleeps across the bridge at Tasik Lily and only wakes up when hungry.
// Qish runs left/right catching her favourite food and throws it up to her; alarm
// clocks just make her stumble. Feed 12 and she wakes with a NYAM.

const W = 1280;
const H = 720;
const GOAL = 12;
const FLOOR_Y = 650;

const FOODS = [
  { icon: "🍖", name: "Daging salai" },
  { icon: "🍰", name: "Kek mango" },
  { icon: "🍜", name: "Dubuyo" },
  { icon: "🍢", name: "Malatang" },
  { icon: "🍪", name: "Cookies" },
];

interface Faller {
  obj: Phaser.GameObjects.Image;
  vy: number;
  alarm: boolean;
  food?: (typeof FOODS)[number];
}

export class SnorlaxCatcher extends Phaser.Scene {
  private ctx!: MinigameCtx;
  private qish!: Phaser.GameObjects.Image;
  private belly!: Phaser.GameObjects.Container;
  private snorlax!: Phaser.GameObjects.Image;
  private hunger!: Phaser.GameObjects.Rectangle;
  private msg!: Phaser.GameObjects.Text;
  private zzz!: Phaser.GameObjects.Text;
  private fallers: Faller[] = [];
  private fed = 0;
  private stumbles = 0;
  private fails = 0;
  private stunned = 0;
  private spawnIn = 1;
  private done = false;
  private facing = 1;
  private pointerX: number | null = null;

  constructor() {
    super("SnorlaxCatcher");
  }

  init(data: MinigameSceneData) {
    this.ctx = data.ctx;
    this.fed = 0;
    this.stumbles = 0;
    this.fails = 0;
    this.done = false;
    this.fallers = [];
  }

  preload() {
    preloadStorybook(this, "snorlax", { qish_front: "bolat_idle", qish_side: "qish_idle" });
  }

  create() {
    illustratedBackdrop(this);
    this.belly = this.add.container(W / 2, 230);
    this.snorlax = this.add.image(0, 0, "art_snorlax", 0).setDisplaySize(400, 400);
    this.belly.add(this.snorlax);
    this.tweens.add({ targets: this.belly, y: 236, duration: 1400, yoyo: true, repeat: -1, ease: "Sine.easeInOut" });
    paperPanel(this, 20, 12, 400, 94);
    this.zzz = this.add.text(W / 2 + 200, 70, "Zzz", { fontFamily: "Gaegu, sans-serif", fontSize: "56px", color: "#1f2f7a", fontStyle: "bold" });
    this.tweens.add({ targets: this.zzz, y: 40, alpha: 0.3, duration: 1200, yoyo: true, repeat: -1 });

    this.qish = this.add.image(W / 2, FLOOR_Y, "qish_side").setOrigin(0.5, 1);
    this.qish.setScale(170 / this.qish.height);

    const style = { fontFamily: "Bagel Fat One, sans-serif", color: "#f8f1d8" };
    this.add.text(40, 26, "Kenyang", { ...style, fontSize: "28px" });
    this.hunger = raisedMeter(this, 43, 74, 354, 24, 0xf3be69);
    this.hunger.width = 0;
    this.msg = this.add
      .text(W / 2, 420, "", { ...style, fontSize: "52px", color: "#ffcb05", stroke: "#17151f", strokeThickness: 8 })
      .setOrigin(0.5)
      .setDepth(5);

    this.input.on("pointermove", (p: Phaser.Input.Pointer) => p.isDown && (this.pointerX = p.x));
    this.input.on("pointerdown", (p: Phaser.Input.Pointer) => (this.pointerX = p.x));
    this.input.on("pointerup", () => (this.pointerX = null));
    this.say("Tangkap makanan untuk dia!", 1.6);
  }

  private say(text: string, secs = 1) {
    this.msg.setText(text).setScale(1.3).setAlpha(1);
    this.tweens.killTweensOf(this.msg);
    this.tweens.add({ targets: this.msg, scale: 1, duration: 160 });
    this.tweens.add({ targets: this.msg, alpha: 0, delay: secs * 1000, duration: 300 });
  }

  forceWin() {
    if (this.done) return;
    this.fed = GOAL;
    this.win();
  }

  private spawn() {
    const assist = this.fails > 0;
    const alarm = Math.random() < (assist ? 0.12 : 0.22);
    const food = FOODS[Math.floor(Math.random() * FOODS.length)];
    const key = alarm ? "alarm" : ["meat", "cake", "ramen", "malatang", "cookie"][FOODS.indexOf(food)] as IllustratedItem;
    const obj = illustratedItem(this, key, Phaser.Math.Between(80, W - 80), -40, 64);
    this.fallers.push({ obj, vy: (assist ? 170 : 230) + Math.random() * 80 + this.fed * 6, alarm, food: alarm ? undefined : food });
  }

  private catchFood(f: Faller) {
    this.fed++;
    sfx.blip();
    this.hunger.width = (354 * this.fed) / GOAL;
    this.say(`${f.food!.name}! 😋`, 0.7);
    // Toss it up into her mouth.
    const key = ["meat", "cake", "ramen", "malatang", "cookie"][FOODS.indexOf(f.food!)] as IllustratedItem;
    const toss = illustratedItem(this, key, this.qish.x, this.qish.y - 160, 64);
    setPose(this.snorlax, "snorlax", "action");
    this.time.delayedCall(500, () => { if (!this.done) setPose(this.snorlax, "snorlax", "idle"); });
    this.tweens.add({
      targets: toss,
      x: W / 2,
      y: 200,
      scale: toss.scale * 0.4,
      duration: 500,
      ease: "Quad.easeIn",
      onComplete: () => {
        toss.destroy();
        this.tweens.add({ targets: this.belly, scaleX: 1.08, duration: 90, yoyo: true });
      },
    });
    if (this.fed >= GOAL) this.win();
  }

  private stumble() {
    this.stumbles++;
    this.stunned = 0.6;
    sfx.hurt();
    this.cameras.main.shake(150, 0.006);
    this.say("Eh! Jam loceng! ⏰", 0.9);
    if (this.stumbles % 3 === 0) {
      this.fails++;
      this.ctx.fail();
    }
  }

  private win() {
    this.done = true;
    for (const f of this.fallers) f.obj.destroy();
    this.fallers = [];
    this.zzz.setText("!!");
    setPose(this.snorlax, "snorlax", "win");
    sfx.fanfare();
    this.tweens.add({ targets: this.belly, y: 180, scale: 1.12, duration: 300, yoyo: true, repeat: 2 });
    this.say("NYAM!! Dah kenyang! 😋", 2.4);
    this.time.delayedCall(2400, () => this.ctx.win());
  }

  update(_t: number, deltaMs: number) {
    const dt = deltaMs / 1000;
    if (this.done) return;
    this.stunned = Math.max(0, this.stunned - dt);

    let vx = input.axis().x;
    if (this.pointerX !== null) vx = Phaser.Math.Clamp((this.pointerX - this.qish.x) / 60, -1, 1);
    if (this.stunned > 0) vx = 0;
    this.qish.x = Phaser.Math.Clamp(this.qish.x + vx * 620 * dt, 70, W - 70);
    if (Math.abs(vx) > 0.2 && Math.sign(vx) !== this.facing) {
      this.facing = Math.sign(vx);
      this.qish.setFlipX(this.facing < 0);
    }
    this.qish.setTexture(Math.abs(vx) > 0.2 ? `qish_side_walk_${Math.floor(this.time.now / 110) % 4}` : "qish_side");
    this.qish.setAngle(this.stunned > 0 ? Math.sin(this.time.now / 30) * 10 : Math.abs(vx) > 0.2 ? Math.sin(this.time.now / 70) * 5 : 0);

    this.spawnIn -= dt;
    if (this.spawnIn <= 0) {
      this.spawn();
      this.spawnIn = (this.fails > 0 ? 1.1 : 0.85) + Math.random() * 0.4;
    }

    const reach = this.fails > 0 ? 110 : 85;
    for (let i = this.fallers.length - 1; i >= 0; i--) {
      const f = this.fallers[i];
      f.obj.y += f.vy * dt;
      f.obj.angle += dt * 60;
      const caught = Math.abs(f.obj.x - this.qish.x) < reach && f.obj.y > FLOOR_Y - 190 && f.obj.y < FLOOR_Y - 60;
      if (caught) {
        if (f.alarm) this.stumble();
        else this.catchFood(f);
        f.obj.destroy();
        this.fallers.splice(i, 1);
      } else if (f.obj.y > H + 40) {
        f.obj.destroy();
        this.fallers.splice(i, 1);
      }
      if (this.done) return;
    }
  }
}
