import Phaser from "phaser";
import { input } from "../core/input";
import { sfx } from "../core/sfx";
import type { MinigameCtx, MinigameDef, MinigameSceneData } from "./framework";

/** Stand-in for a minigame that isn't built yet: tap A three times to win. Keeps the whole game playable end to end. */
export class PlaceholderScene extends Phaser.Scene {
  private ctx!: MinigameCtx;
  private def!: MinigameDef;
  private taps = 0;
  private counter!: Phaser.GameObjects.Text;
  private done = false;

  constructor() {
    super("Placeholder");
  }

  init(data: MinigameSceneData) {
    this.ctx = data.ctx;
    this.def = data.def;
    this.taps = 0;
    this.done = false;
  }

  create() {
    const W = this.scale.width;
    const style = { fontFamily: "Bagel Fat One, sans-serif", color: "#fffdf6", stroke: "#17151f", strokeThickness: 10, align: "center" };
    this.add.text(W / 2, 150, this.def.title, { ...style, fontSize: "84px" }).setOrigin(0.5);
    this.add
      .text(W / 2, 290, this.def.plan ?? "", { fontFamily: "Gaegu, sans-serif", fontSize: "34px", color: "#fffdf6", align: "center", wordWrap: { width: 980 } })
      .setOrigin(0.5);
    this.add
      .text(W / 2, 470, "PROTOTAIP — tekan A 3 kali untuk menang", { fontFamily: "Gaegu, sans-serif", fontSize: "40px", color: "#ffcb05", stroke: "#17151f", strokeThickness: 6 })
      .setOrigin(0.5);
    this.counter = this.add.text(W / 2, 580, "○ ○ ○", { ...style, fontSize: "72px" }).setOrigin(0.5);
  }

  forceWin() {
    this.taps = 3;
    this.finish();
  }

  private finish() {
    if (this.done) return;
    this.done = true;
    sfx.fanfare();
    this.counter.setText("● ● ●");
    this.time.delayedCall(700, () => this.ctx.win());
  }

  update() {
    if (this.done || !input.consumePressed("a")) return;
    this.taps++;
    sfx.stomp();
    this.counter.setText(Array.from({ length: 3 }, (_, i) => (i < this.taps ? "●" : "○")).join(" "));
    this.tweens.add({ targets: this.counter, scale: { from: 1.4, to: 1 }, duration: 180 });
    if (this.taps >= 3) this.finish();
  }
}
