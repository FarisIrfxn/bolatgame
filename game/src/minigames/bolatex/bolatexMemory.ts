import Phaser from "phaser";
import { preloadStorybook, illustratedBackdrop, paperPanel, setPose } from "../storybook";
import { input } from "../../core/input";
import { sfx } from "../../core/sfx";
import type { MinigameCtx, MinigameSceneData } from "../framework";

// Boss 6: Bolat ex at the Galeri Memori pop-up in Lorbel. Faris was too lazy to sort their memories, so
// Qish matches pairs of their real photobooth strips. No fail state; every 8 misses
// counts as a fail so the skip safety net is still there.

const W = 1280;
const COLS = 4;
const ROWS = 3;
const CW = 124;
const CH = 168;
const GAP = 14;
const STRIPS = [0, 2, 3, 5, 7, 9]; // same aspect, six different studios

interface Card {
  pair: number;
  c: Phaser.GameObjects.Container;
  front: Phaser.GameObjects.Container;
  back: Phaser.GameObjects.Image;
  open: boolean;
  matched: boolean;
}

export class BolatexMemory extends Phaser.Scene {
  private ctx!: MinigameCtx;
  private cards: Card[] = [];
  private sel = 0;
  private cursor!: Phaser.GameObjects.Rectangle;
  private openCards: Card[] = [];
  private busy = false;
  private misses = 0;
  private matched = 0;
  private done = false;
  private lastAxis = { x: 0, y: 0 };
  private msg!: Phaser.GameObjects.Text;
  private countText!: Phaser.GameObjects.Text;
  private bolat!: Phaser.GameObjects.Image;

  constructor() {
    super("BolatexMemory");
  }

  init(data: MinigameSceneData) {
    this.ctx = data.ctx;
    this.cards = [];
    this.openCards = [];
    this.misses = 0;
    this.matched = 0;
    this.busy = false;
    this.done = false;
    this.sel = 0;
  }

  preload() {
    preloadStorybook(this, "bolatex", { cardback: "item_cardback" });
    for (const i of STRIPS) this.load.image(`strip${i}`, `/assets/strips/strip${i}.webp`);
  }

  create() {
    illustratedBackdrop(this);
    paperPanel(this, 330, 12, 620, 88, 0xf8d878);
    paperPanel(this, 320, 108, 640, 586);
    this.bolat = this.add.image(160, 480, "art_bolatex", 0).setDisplaySize(248, 248);
    const style = { fontFamily: "Bagel Fat One, sans-serif", color: "#17151f" };
    this.add
      .text(W / 2, 39, "GALERI MEMORI", { ...style, fontSize: "36px", color: "#754459" })
      .setOrigin(0.5)
      .setShadow(0, 0, "#ff4fa0", 0);
    this.countText = this.add.text(W / 2, 78, "", { fontFamily: "Nunito", fontSize: "24px", color: "#754459", fontStyle: "bold" }).setOrigin(0.5);
    this.msg = this.add
      .text(1115, 345, "", { ...style, fontSize: "26px", color: "#ff5c93", stroke: "#17151f", strokeThickness: 5, align: "center", wordWrap: { width: 205 } })
      .setOrigin(0.5)
      .setDepth(40);

    const pairs = Phaser.Utils.Array.Shuffle([...STRIPS, ...STRIPS].map((_, i) => i % STRIPS.length));
    const x0 = W / 2 - ((COLS - 1) * (CW + GAP)) / 2;
    const y0 = 118 + CH / 2;
    pairs.forEach((pair, i) => {
      const x = x0 + (i % COLS) * (CW + GAP);
      const y = y0 + Math.floor(i / COLS) * (CH + GAP);
      const c = this.add.container(x, y);
      const back = this.add.image(0, 0, "cardback").setDisplaySize(CW, CH);
      const photo = this.add.image(0, 0, `strip${STRIPS[pair]}`);
      photo.setScale(Math.min((CW - 16) / photo.width, (CH - 16) / photo.height));
      const front = this.add.container(0, 0, [this.add.rectangle(0, 0, CW, CH, 0xfffdf6).setStrokeStyle(4, 0x17151f), photo]);
      front.setVisible(false);
      c.add([back, front]);
      c.setSize(CW, CH).setInteractive();
      // Pegged on the string, swaying a little.
      c.add(this.add.rectangle(0, -CH / 2 - 2, 14, 24, [0xff8fb1, 0xffcb05, 0x9fd3b0, 0xb9c4ff][i % 4]).setStrokeStyle(3, 0x17151f));
      c.setAngle(0);

      const card: Card = { pair, c, front, back, open: false, matched: false };
      c.on("pointerdown", () => {
        this.sel = i;
        this.moveCursor();
        this.pick();
      });
      this.cards.push(card);
    });
    this.cursor = this.add.rectangle(0, 0, CW + 14, CH + 14).setStrokeStyle(7, 0xff5c93).setDepth(5);
    this.moveCursor();
    this.refresh();
    this.say("Padankan kenangan yang sama!", 1.6);
  }

  private refresh() {
    this.countText.setText(`Kenangan tersusun: ${this.matched} / ${STRIPS.length}`);
  }

  private say(text: string, secs = 1) {
    this.msg.setText(text).setAlpha(1).setScale(1.2);
    this.tweens.killTweensOf(this.msg);
    this.tweens.add({ targets: this.msg, scale: 1, duration: 150 });
    this.tweens.add({ targets: this.msg, alpha: 0, delay: secs * 1000, duration: 300 });
  }

  private moveCursor() {
    const c = this.cards[this.sel].c;
    this.cursor.setPosition(c.x, c.y);
  }

  private flip(card: Card, open: boolean) {
    card.open = open;
    this.tweens.add({
      targets: card.c,
      scaleX: 0,
      duration: 110,
      onComplete: () => {
        card.back.setVisible(!open);
        card.front.setVisible(open);
        this.tweens.add({ targets: card.c, scaleX: 1, duration: 110 });
      },
    });
    sfx.flip();
  }

  private pick() {
    if (this.busy || this.done) return;
    const card = this.cards[this.sel];
    if (card.open || card.matched) return;
    this.flip(card, true);
    setPose(this.bolat, "bolatex", "action");
    this.openCards.push(card);
    if (this.openCards.length < 2) return;
    const [a, b] = this.openCards;
    this.openCards = [];
    this.busy = true;
    if (a.pair === b.pair) {
      this.time.delayedCall(350, () => {
        a.matched = b.matched = true;
        this.matched++;
        setPose(this.bolat, "bolatex", "win");
        this.refresh();
        sfx.sparkle();
        this.say(["Good memories ♡", "Ingat ni!", "Comel!", "♡♡♡"][this.matched % 4], 0.9);
        for (const m of [a, b]) this.tweens.add({ targets: m.c, scale: 1.08, duration: 120, yoyo: true });
        this.busy = false;
        if (this.matched >= STRIPS.length) this.win();
      });
    } else {
      this.misses++;
      setPose(this.bolat, "bolatex", "hurt");
      if (this.misses % 8 === 0) this.ctx.fail();
      this.time.delayedCall(900, () => {
        this.flip(a, false);
        this.flip(b, false);
        this.busy = false;
      });
    }
  }

  forceWin() {
    if (this.done) return;
    this.win();
  }

  private win() {
    this.done = true;
    this.cursor.setVisible(false);
    for (const c of this.cards) if (!c.open) this.flip(c, true);
    sfx.fanfare();
    this.say("Semua kenangan tersusun! ♡", 2.4);
    this.time.delayedCall(2600, () => this.ctx.win());
  }

  update() {
    if (this.done) return;
    const a = input.axis();
    const dx = Math.abs(a.x) > 0.5 ? Math.sign(a.x) : 0;
    const dy = Math.abs(a.y) > 0.5 ? Math.sign(a.y) : 0;
    if ((dx && dx !== this.lastAxis.x) || (dy && dy !== this.lastAxis.y)) {
      const col = Phaser.Math.Clamp((this.sel % COLS) + (dx !== this.lastAxis.x ? dx : 0), 0, COLS - 1);
      const row = Phaser.Math.Clamp(Math.floor(this.sel / COLS) + (dy !== this.lastAxis.y ? dy : 0), 0, ROWS - 1);
      this.sel = row * COLS + col;
      this.moveCursor();
      sfx.blip();
    }
    this.lastAxis = { x: dx, y: dy };
    if (input.pressed("a")) this.pick();
  }
}
