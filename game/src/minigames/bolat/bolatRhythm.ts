import Phaser from "phaser";
import { preloadStorybook, illustratedBackdrop, illustratedItem, paperPanel, setPose, type IllustratedItem } from "../storybook";
import type { SongHandle } from "../../core/chiptune";
import { playRhythmSong, RHYTHM_BARS } from "../../core/music";
import { input } from "../../core/input";
import { sfx } from "../../core/sfx";
import type { MinigameCtx, MinigameSceneData } from "../framework";

// Boss 2: Bolat on the Lorbel busking stage at night. Three-lane rhythm: Kiss / Cuddle / Peluk
// requests slide in, Qish moves the heart up/down to the matching lane and presses A on the beat. The busker and his cajon friend
// play, the par cans sweep, the crowd bobs; every hit flashes the stage in the request's colour and
// ticks a heart on the request board, which grows to the middle at the end. Half fulfilled wins.
//
// The original 108 BPM song is synthesized on the AudioContext clock (core/music.ts). Judge
// against that clock, with a four-beat count-in and a half-time grid for an easy round.

const W = 1280;
const BARS = RHYTHM_BARS;
const HIT_X = 250;
const JUDGE_X = 470;
const JUDGE_Y = 470;
/** Three lanes in a panel below the stage floor, so they never cover the performers. */
const LANES = [532, 598, 664];
const LANE_H = 62;
/** A fixed, non-cycling lane order: the player reads each request instead of learning a loop. */
const PATTERN = [0, 1, 2, 1, 0, 2, 2, 1, 0, 0, 2, 1];
const LANE_Y = LANES[1];
const PASS_RATE = 0.5;
/** Where the performers stand on the stage. */
const STAGE_Y = 478;

const REQUESTS = [
  { icon: "💋", label: "Kiss", color: 0xff5c93 },
  { icon: "🤗", label: "Cuddle", color: 0xffcb05 },
  { icon: "❤️", label: "Peluk", color: 0xe3350d },
];

/** Half-time beats from the trimmed chorus. Gentle start, then a few pairs. */
function buildChart() {
  const beats: number[] = [];
  for (let bar = 1; bar < BARS; bar++) {
    const b = bar * 4;
    beats.push(b, b + 2);
  }
  return beats;
}

interface Note {
  beat: number;
  kind: number;
  obj: Phaser.GameObjects.Container;
  state: "live" | "hit" | "miss";
}

export class BolatRhythm extends Phaser.Scene {
  private ctx!: MinigameCtx;
  private song: SongHandle | null = null;
  private notes: Note[] = [];
  private hits = 0;
  private attempt = 0;
  private combo = 0;
  private pxPerSec = 430;
  private window = 0.2;
  private finished = false;
  private bolat!: Phaser.GameObjects.Image;
  private faris!: Phaser.GameObjects.Image;
  private judge!: Phaser.GameObjects.Text;
  private comboText!: Phaser.GameObjects.Text;
  private progress!: Phaser.GameObjects.Rectangle;
  private flash!: Phaser.GameObjects.Rectangle;
  private slots: Phaser.GameObjects.Text[] = [];
  private board!: Phaser.GameObjects.Container;
  /** Everything that bobs on the beat (performers, crowd), with its resting y. */
  private bobbers: { o: Phaser.GameObjects.Image; y: number; amp: number }[] = [];
  private woofers: Phaser.GameObjects.Arc[] = [];
  private heart!: Phaser.GameObjects.Container;
  private lastBeat = -1;
  /** Seconds left in the lockout after a press with no note near (stops button mashing). */
  private cooldown = 0;
  private lane = 1;
  private lastY = 0;

  constructor() {
    super("BolatRhythm");
  }

  init(data: MinigameSceneData) {
    this.ctx = data.ctx;
    this.attempt = 0;
  }

  preload() {
    const aliases: Record<string, string> = { qish_front: "bolat_idle", faris_front: "faris_idle", busker: "busker_idle", cajon: "cajon_idle" };
    for (let i = 0; i < 8; i++) aliases[`crowd${i}`] = `crowd_${["idle", "action", "hurt", "win"][i % 4]}`;
    preloadStorybook(this, "bolat", aliases);
  }

  create() {
    this.bobbers = [];
    this.woofers = [];
    this.drawStage();
    const person = (key: string, x: number, h: number, amp: number) => {
      const img = this.add.image(x, STAGE_Y, key).setOrigin(0.5, 1);
      img.setScale(h / img.height);
      this.bobbers.push({ o: img, y: STAGE_Y, amp });
      return img;
    };
    person("busker", 560, 250, 6);
    person("cajon", 720, 190, 8);
    this.faris = person("faris_front", 950, 260, 0);
    this.bolat = person("art_bolat", 1125, 255, 0);
    this.drawCrowd();

    // The request board that ticks a heart for every quarter of the requests fulfilled.
    this.board = this.add.container(0, 0);
    const bx = 64;
    this.board.add(paperPanel(this, bx, 70, 136, 380, 0xf8d878));
    this.board.add(
      this.add.text(bx + 68, 104, "REQUEST\nMALAM NI", { fontFamily: "Gaegu, sans-serif", fontSize: "26px", color: "#fffdf6", fontStyle: "bold", align: "center" }).setOrigin(0.5),
    );
    this.slots = [];
    for (let i = 0; i < 4; i++) {
      const t = this.add.text(bx + 68, 190 + i * 66, "♡", { fontSize: "54px", color: "#9fb0a6" }).setOrigin(0.5);
      this.slots.push(t);
      this.board.add(t);
    }

    // Track: the front edge of the stage, where the requests slide in.
    LANES.forEach((y, i) => {
      this.add.rectangle(W / 2, y, W, LANE_H - 6, 0x2a1f30, 0.82).setStrokeStyle(2, REQUESTS[i].color, 0.45);
      this.add.circle(26, y, 7, REQUESTS[i].color);
      this.add.text(42, y, REQUESTS[i].label, { fontFamily: "Bagel Fat One, sans-serif", fontSize: "24px", color: "#fff5e9" }).setOrigin(0, .5);
      // Touch players select the lane by tapping it. A is the same shared action button.
      this.add.zone(W / 2, y, W, LANE_H).setInteractive().on("pointerdown", () => this.selectLane(i));
    });
    this.heart = this.add.container(HIT_X, LANE_Y);
    const ring = this.add.circle(0, 0, 34, 0xfff3df).setStrokeStyle(5, 0xff7eb0);
    const glyph = illustratedItem(this, "heart", 0, 0, 48);
    this.heart.add([ring, glyph]);

    const style = { fontFamily: "Bagel Fat One, sans-serif", color: "#ffffff", stroke: "#17151f", strokeThickness: 8 };
    // Judge text sits right of the heart so it never covers the photo strip on the left.
    this.judge = this.add.text(JUDGE_X, JUDGE_Y, "", { ...style, fontSize: "40px" }).setOrigin(0.5).setDepth(20);
    this.comboText = this.add.text(JUDGE_X + 230, JUDGE_Y, "", { ...style, fontSize: "30px", color: "#ffcb05" }).setOrigin(0.5).setDepth(20);
    this.add.rectangle(W / 2, 708, W - 120, 10, 0x17151f, 0.5);
    this.progress = this.add.rectangle(60, 708, 0, 6, 0xffcb05).setOrigin(0, 0.5);
    this.flash = this.add.rectangle(W / 2, 360, W, 720, 0xffffff, 0).setDepth(10).setBlendMode(Phaser.BlendModes.ADD);

    this.events.once("shutdown", () => this.song?.stop());
    this.events.once("destroy", () => this.song?.stop());
    this.startSong();
  }

  /** Lorbel at night: shop backs, bulbs strung overhead, the truss with its banner, four par cans
   * sweeping coloured beams across the stage, and a speaker either side. */
  private drawStage() {
    illustratedBackdrop(this);
    this.add.text(760, 100, "BUSKING LORBEL", { fontFamily: "Nunito", fontSize: "40px", color: "#f8d878" }).setOrigin(0.5);
    for (const [i, col] of [0xf07898, 0x80d8c0, 0xf8d878, 0x8c98db].entries()) {
      const light = this.add.rectangle(330 + i * 270, 200, 80, 280, col, 0.1).setBlendMode(Phaser.BlendModes.ADD);
      this.tweens.add({ targets: light, alpha: 0.3, duration: 600 + i * 100, yoyo: true, repeat: -1 });
    }
  }

  /** The crowd in front of the stage, seen from behind in the dark, bobbing on the beat. */
  private drawCrowd() {
    for (let i = 0; i < 11; i++) {
      const x = 40 + i * 122 + (i % 2) * 20;
      const img = this.add.image(x, 880 + (i % 3) * 16, `crowd${i % 8}`).setOrigin(0.5, 1);
      img.setScale(320 / img.height).setTint(0x3e3550);
      if (i % 2) img.setFlipX(true);
      this.bobbers.push({ o: img, y: img.y, amp: 10 });
    }
  }

  private startSong() {
    for (const n of this.notes) n.obj.destroy();
    this.notes = [];
    this.hits = 0;
    this.combo = 0;
    this.finished = false;
    this.lastBeat = -1;
    this.lastY = Math.sign(input.axis().y);
    this.selectLane(1);
    // Assist on retries: slower notes and a wider timing window.
    this.pxPerSec = this.attempt > 0 ? 340 : 430;
    this.window = this.attempt > 0 ? 0.3 : 0.2;
    this.slots.forEach((t) => t.setText("♡").setColor("#9fb0a6"));
    buildChart().forEach((beat, i) => {
      const kind = PATTERN[i % PATTERN.length];
      const r = REQUESTS[kind];
      const c = this.add.container(-200, LANES[kind]);
      c.add(this.add.circle(0, 0, 28, 0xfff3df).setStrokeStyle(4, r.color));
      c.add(illustratedItem(this, ["kiss", "cuddle", "heart"][kind] as IllustratedItem, 0, 0, 42));
      this.notes.push({ beat, kind, obj: c, state: "live" });
    });
    this.song?.stop();
    this.cooldown = 0;
    this.progress.width = 0;
    this.song = playRhythmSong();
    this.judge.setText("Sedia...");
  }

  forceWin() {
    if (this.finished) return;
    this.finished = true;
    this.song?.stop();
    this.ctx.win();
  }

  private showJudge(text: string, color: string) {
    this.judge.setText(text).setColor(color).setScale(1.3);
    this.tweens.add({ targets: this.judge, scale: 1, duration: 160 });
  }

  private selectLane(lane: number) {
    this.lane = Phaser.Math.Clamp(lane, 0, 2);
    if (this.heart) this.heart.y = LANES[this.lane];
  }

  /** A hit: the stage strobes in the request's colour, a heart rises from the crowd, the board ticks up. */
  private snap(kind: number) {
    this.flash.setFillStyle(REQUESTS[kind].color, 1).setAlpha(0.35);
    this.tweens.add({ targets: this.flash, alpha: 0, duration: 260 });
    const h = illustratedItem(this, "heart", Phaser.Math.Between(120, W - 120), 640, 48);
    setPose(this.bolat, "bolat", "win");
    this.time.delayedCall(160, () => { if (!this.finished) setPose(this.bolat, "bolat", "idle"); });
    this.tweens.add({ targets: h, y: 420, alpha: 0, duration: 900, ease: "Sine.easeOut", onComplete: () => h.destroy() });
    const total = this.notes.length;
    const filled = Math.min(4, Math.floor((this.hits / (total * PASS_RATE)) * 4));
    this.slots.forEach((t, i) => (i < filled ? t.setText("♥").setColor("#ff5c93") : t.setText("♡").setColor("#9fb0a6")));
  }

  update(_t: number, deltaMs: number) {
    if (!this.song || this.finished) return;
    this.cooldown = Math.max(0, this.cooldown - deltaMs / 1000);
    const now = this.song.now();
    const b = this.song.beat;
    const y = input.axis().y;
    const dir = Math.abs(y) > .5 ? Math.sign(y) : 0;
    if (dir && dir !== this.lastY) { this.selectLane(this.lane + dir); sfx.blip(); }
    this.lastY = dir;

    // Bob to the beat.
    const beatIdx = Math.floor(now / b);
    if (beatIdx !== this.lastBeat && now >= 0) {
      this.lastBeat = beatIdx;
      setPose(this.faris, "faris", beatIdx % 2 ? "idle" : "action");
      if (this.bolat.texture.key === "art_bolat") this.bolat.setFrame(beatIdx % 2);
      for (const img of [this.bolat, this.faris]) {
        this.tweens.add({ targets: img, scaleY: img.scaleX * 1.06, duration: 90, yoyo: true });
      }
      for (const bb of this.bobbers) if (bb.amp) this.tweens.add({ targets: bb.o, y: bb.y - bb.amp, duration: 110, yoyo: true });
      for (const w of this.woofers) this.tweens.add({ targets: w, scale: 1.18, duration: 70, yoyo: true });
      this.tweens.add({ targets: this.heart, scale: 1.12, duration: 80, yoyo: true });
      if (this.judge.text === "Sedia...") this.judge.setText("");
    }

    for (const n of this.notes) {
      const dt = n.beat * b - now;
      if (n.state === "live") {
        n.obj.setPosition(HIT_X + dt * this.pxPerSec, LANES[n.kind]);
        if (dt < -this.window) {
          n.state = "miss";
          this.combo = 0;
          this.comboText.setText("");
          this.showJudge("Miss", "#cfd3e6");
          this.tweens.add({ targets: n.obj, alpha: 0, duration: 250 });
        }
      }
    }

    if (input.consumePressed("a") && this.cooldown <= 0) {
      let best: Note | null = null;
      for (const n of this.notes) {
        if (n.state !== "live" || n.kind !== this.lane) continue;
        const d = Math.abs(n.beat * b - now);
        if (d <= this.window && (!best || d < Math.abs(best.beat * b - now))) best = n;
      }
      if (best) {
        const d = Math.abs(best.beat * b - now);
        best.state = "hit";
        this.hits++;
        this.combo++;
        const perfect = d < this.window * 0.45;
        this.showJudge(perfect ? `Perfect! ${REQUESTS[best.kind].icon}` : "Good!", perfect ? "#ffcb05" : "#ffffff");
        if (this.combo >= 4) this.comboText.setText(`${this.combo} combo!`);
        sfx.blip();
        this.snap(best.kind);
        this.tweens.add({ targets: best.obj, scale: 1.6, alpha: 0, y: LANES[best.kind] - 40, duration: 260 });
      } else {
        this.cooldown = 0.22;
        this.combo = 0;
        this.comboText.setText("");
        this.showJudge("Padankan hati + rentak!", "#cfd3e6");
      }
    }

    this.progress.width = Math.max(0, Math.min(1, now / this.song.length)) * (W - 120);
    if (now > this.song.length + 0.6) this.finish();
  }

  private finish() {
    this.finished = true;
    this.song?.stop();
    const rate = this.hits / this.notes.length;
    const pct = Math.round(rate * 100);
    if (rate >= PASS_RATE) {
      sfx.fanfare();
      this.judge.setPosition(W / 2, 300).setText(`Request dipenuhi: ${pct}%!`).setColor("#ffcb05");
      // The request board slides to the middle and grows; the crowd goes wild.
      this.board.setDepth(5);
      this.tweens.add({ targets: this.board, x: 500, y: -20, scale: 1.25, duration: 900, ease: "Back.easeOut" });
      for (let i = 0; i < 14; i++) this.time.delayedCall(i * 90, () => this.snap(i % REQUESTS.length));
      this.time.delayedCall(2600, () => this.ctx.win());
    } else {
      this.ctx.fail();
      this.attempt++;
      this.judge.setPosition(W / 2, 300).setText(`${pct}%... Bolat merajuk 😤\nCuba lagi!`).setColor("#ffffff");
      this.time.delayedCall(2600, () => {
        this.judge.setPosition(JUDGE_X, JUDGE_Y);
        this.startSong();
      });
    }
  }
}
