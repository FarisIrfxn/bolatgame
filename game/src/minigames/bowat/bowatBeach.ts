import Phaser from "phaser";
import { raisedMeter, preloadStorybook, illustratedBackdrop, illustratedItem, paperPanel } from "../storybook";
import { input } from "../../core/input";
import { sfx } from "../../core/sfx";
import type { MinigameCtx, MinigameSceneData } from "../framework";

// Boss 1: Bowat in the middle of the Bukit Bintang scramble at dusk. Single-screen arena platformer.
// Stomp Bowat three times; dodge the Kentot Bushuk clouds. Built for someone who
// rarely plays: generous jumps, no game over, assists kick in after each fail.

const W = 1280;
const GROUND_Y = 610;
const HITS_TO_WIN = 3;

export class BowatBeach extends Phaser.Scene {
  private ctx!: MinigameCtx;
  private player!: Phaser.GameObjects.Rectangle & { body: Phaser.Physics.Arcade.Body };
  private qish!: Phaser.GameObjects.Image;
  private boss!: Phaser.GameObjects.Rectangle & { body: Phaser.Physics.Arcade.Body };
  private bowat!: Phaser.GameObjects.Image;
  private platforms!: Phaser.Physics.Arcade.StaticGroup;
  private clouds!: Phaser.Physics.Arcade.Group;
  private bossBar!: Phaser.GameObjects.Rectangle;
  private hintText!: Phaser.GameObjects.Text;
  private arrow!: Phaser.GameObjects.Text;

  private facing = 1;
  private flipping = false;
  private coyote = 0;
  private jumpBuffer = 0;
  private hearts = 3;
  private hits = 0;
  private fails = 0;
  private invuln = 0;
  private bossInvuln = 0;
  private bossDir = -1;
  private bossState: "walk" | "windup" | "fart" | "dizzy" = "walk";
  private bossTimer = 2.2;
  private started = false;
  private won = false;
  private walkT = 0;

  constructor() {
    super("BowatBeach");
  }

  /** Dev panel shortcut for retakes. */
  forceWin() {
    if (!this.won) {
      this.hits = HITS_TO_WIN;
      this.refreshHud();
      this.win();
    }
  }

  init(data: MinigameSceneData) {
    this.ctx = data.ctx;
    this.hearts = 3;
    this.hits = 0;
    this.fails = 0;
    this.won = false;
    this.started = false;
  }

  preload() {
    preloadStorybook(this, "bowat", {
      qish_side: "qish_idle", qish_front: "bolat_idle", bowat_side: "bowat_idle",
      bowat_front: "bowat_idle", bowat_back: "bowatback_idle", bowat_fart_back: "bowatback_action",
      bowat_hurt: "bowat_hurt", bowat_dizzy: "bowat_hurt",
      bowat_side_walk_0: "bowat_idle", bowat_side_walk_1: "bowat_action",
      bowat_side_walk_2: "bowat_idle", bowat_side_walk_3: "bowat_action", fart: "item_fart",
    });
  }

  create() {
    this.drawBackdrop();

    this.platforms = this.physics.add.staticGroup();
    const ground = this.add.rectangle(W / 2, GROUND_Y + 60, W + 200, 120, 0x000000, 0);
    this.platforms.add(ground);
    for (const [x, y, w] of [[300, 420, 230], [980, 420, 230], [640, 270, 200]] as const) this.makeFloat(x, y, w);

    // Physics bodies are invisible rectangles; the doodle images follow them so the
    // paper-flip squash never changes the hitbox.
    this.player = this.add.rectangle(200, GROUND_Y - 80, 56, 130, 0xff0000, 0) as never;
    this.physics.add.existing(this.player);
    this.player.body.setCollideWorldBounds(true);
    // The doodle is wider than its collision body; keep the whole sprite visible.
    this.player.body.setBoundsRectangle(new Phaser.Geom.Rectangle(50, 0, W - 100, 720));
    this.player.body.setGravityY(1700);
    this.qish = this.add.image(0, 0, "qish_side").setOrigin(0.5, 1);
    this.qish.setScale(150 / this.qish.height);

    this.boss = this.add.rectangle(980, GROUND_Y - 70, 120, 120, 0x00ff00, 0) as never;
    this.physics.add.existing(this.boss);
    this.boss.body.setCollideWorldBounds(true);
    this.boss.body.setGravityY(1700);
    this.bowat = this.add.image(0, 0, "bowat_side").setOrigin(0.5, 1);
    this.bowat.setScale(150 / this.bowat.height);

    this.physics.add.collider(this.player, this.platforms);
    this.physics.add.collider(this.boss, ground);

    this.clouds = this.physics.add.group({ allowGravity: false });
    this.physics.add.overlap(this.player, this.clouds, () => this.hurt("Busuk!!"));
    this.physics.add.overlap(this.player, this.boss, () => this.touchBoss());

    const style = { fontFamily: "Gaegu, sans-serif", fontSize: "40px", color: "#ffffff", stroke: "#17151f", strokeThickness: 8 };
    this.add.text(W / 2, 29, "BOWAT", { ...style, fontSize: "28px" }).setOrigin(.5).setDepth(33);
    this.bossBar = raisedMeter(this, W / 2 - 250, 65, 500, 24, 0xee9cba);
    this.hintText = this.add.text(W / 2, 360, "", { ...style, fontSize: "44px", align: "center" }).setOrigin(0.5).setDepth(35);
    this.arrow = this.add.text(0, 0, "▼", { ...style, fontSize: "52px", color: "#ffcb05" }).setOrigin(0.5, 1).setVisible(false);
    this.refreshHud();
    this.intro();
  }

  private drawBackdrop() {
    illustratedBackdrop(this);
    paperPanel(this, W / 2 - 290, 8, 580, 90).setDepth(29);
  }

  private makeFloat(x: number, y: number, w: number) {
    // Match the flat canopy top to the collision surface, accounting for alpha padding in the art.
    const awning = illustratedItem(this, "awning", x, 0, 96).setDisplaySize(w + 12, 72);
    const source = this.textures.get("art_awning").getSourceImage() as HTMLImageElement;
    const canvas = document.createElement("canvas"); canvas.width = source.width; canvas.height = source.height;
    const g = canvas.getContext("2d")!; g.drawImage(source, 0, 0);
    const pixels = g.getImageData(0, 0, canvas.width, canvas.height).data;
    let top = 0;
    outer: for (; top < canvas.height; top++) for (let xx = Math.floor(canvas.width * 0.3); xx < canvas.width * 0.7; xx++) {
      if (pixels[(top * canvas.width + xx) * 4 + 3] > 220) break outer;
    }
    awning.y = y - 12 + 36 - top / source.height * 72;
    const r = this.add.rectangle(x, y, w, 24, 0, 0);
    this.platforms.add(r);
    const body = r.body as Phaser.Physics.Arcade.StaticBody;
    body.checkCollision.down = false;
    body.checkCollision.left = false;
    body.checkCollision.right = false;
  }



  private async intro() {
    // The how-to lives on the framework's intro card; this is just the countdown.
    for (const l of ["Sedia...", "Pijak Bowat!"]) {
      this.hintText.setText(l);
      await new Promise((r) => this.time.delayedCall(700, r));
    }
    this.hintText.setText("");
    this.started = true;
  }

  private refreshHud() {
    this.bossBar.width = 500 * Math.max(0, 1 - this.hits / HITS_TO_WIN);
  }

  private flash(text: string, x: number, y: number, color = "#ffffff") {
    const t = this.add
      .text(x, y, text, { fontFamily: "Bagel Fat One, sans-serif", fontSize: "54px", color, stroke: "#17151f", strokeThickness: 8 })
      .setOrigin(0.5);
    this.tweens.add({ targets: t, y: y - 90, alpha: 0, scale: 1.3, duration: 900, onComplete: () => t.destroy() });
  }

  private faceTo(dir: number) {
    if (dir === this.facing || this.flipping) return;
    this.flipping = true;
    sfx.flip();
    const sx = this.qish.scaleY;
    this.tweens.add({
      targets: this.qish,
      scaleX: 0.02,
      duration: 70,
      onComplete: () => {
        this.facing = dir;
        this.qish.setFlipX(dir < 0);
        this.tweens.add({ targets: this.qish, scaleX: sx, duration: 70, onComplete: () => (this.flipping = false) });
      },
    });
  }

  private hurt(label: string) {
    if (this.invuln > 0 || this.won || !this.started) return;
    this.invuln = 1.4;
    this.hearts--;
    sfx.hurt();
    this.flash(label, this.player.x, this.player.y - 90, "#c6f26b");
    this.player.body.setVelocity(this.player.x < this.boss.x ? -420 : 420, -520);
    if (this.hearts <= 0) this.fail();
    this.refreshHud();
  }

  private fail() {
    this.fails++;
    this.ctx.fail();
    this.hearts = 3;
    this.clouds.clear(true, true);
    this.hintText.setText(this.fails >= 2 ? "Cuba lagi! Ikut anak panah ▼" : "Bowat gelak... cuba lagi!");
    this.time.delayedCall(2200, () => {
      if (!this.won) this.hintText.setText("");
    });
  }

  private touchBoss() {
    if (this.won || !this.started) return;
    const pb = this.player.body;
    const falling = pb.velocity.y > 50;
    const above = pb.bottom < this.boss.body.top + 45;
    if (falling && above) {
      if (this.bossInvuln > 0) {
        pb.setVelocityY(-600);
        return;
      }
      this.stomp();
    } else if (this.bossInvuln <= 0) {
      this.hurt("Aduh!");
    }
  }

  private stomp() {
    this.hits++;
    this.player.body.setVelocityY(-820);
    this.bossInvuln = 1.3;
    sfx.stomp();
    this.flash("PROT!", this.boss.x, this.boss.y - 120, "#ffcb05");
    this.bowat.setTexture("bowat_hurt").setFlipX(false);
    this.tweens.add({ targets: this.bowat, scaleY: this.bowat.scaleX * 0.6, duration: 90, yoyo: true });
    this.cameras.main.shake(180, 0.008);
    this.refreshHud();
    if (this.hits >= HITS_TO_WIN) this.win();
  }

  private win() {
    this.won = true;
    this.bossState = "dizzy";
    this.boss.body.setVelocityX(0);
    this.clouds.clear(true, true);
    this.arrow.setVisible(false);
    this.bowat.setTexture("bowat_dizzy").setFlipX(false);
    this.tweens.add({ targets: this.bowat, angle: { from: -10, to: 10 }, duration: 220, yoyo: true, repeat: 6 });
    this.hintText.setText("Bowat pening! 💫").setOrigin(0.5).setPosition(W / 2, 360).setDepth(35);
    sfx.fanfare();
    this.time.delayedCall(2200, () => this.ctx.win());
  }

  private fart() {
    sfx.prot();
    this.flash("PROT!", this.boss.x, this.boss.y - 140, "#c6f26b");
    const assist = this.fails >= 1;
    const c = this.clouds.create(this.boss.x - this.bossDir * 40, this.boss.y - 30, "fart") as Phaser.Physics.Arcade.Image;
    const toPlayer = Math.sign(this.player.x - this.boss.x) || 1;
    c.setVelocity(toPlayer * (assist ? 70 : 115), -12);
    // The new art has more pixels; preserve the original on-screen size and hitbox.
    c.setScale((assist ? 1.3 : 1.7) * 64 / c.width);
    c.body!.setSize(c.width * 40 / 64, c.height * 35 / 64);
    this.tweens.add({ targets: c, scale: c.scale * 1.35, alpha: 0, delay: 1800, duration: 1200, onComplete: () => c.destroy() });
  }

  update(_t: number, deltaMs: number) {
    const dt = deltaMs / 1000;
    this.invuln = Math.max(0, this.invuln - dt);
    this.bossInvuln = Math.max(0, this.bossInvuln - dt);

    const pb = this.player.body;
    const onGround = pb.blocked.down || pb.touching.down;
    this.coyote = onGround ? 0.12 : Math.max(0, this.coyote - dt);
    this.jumpBuffer = input.pressed("a") ? 0.14 : Math.max(0, this.jumpBuffer - dt);

    const ax = this.started && !this.won ? input.axis().x : 0;
    pb.setVelocityX(ax * 380);
    if (Math.abs(ax) > 0.2) this.faceTo(Math.sign(ax));
    if (this.started && !this.won && this.jumpBuffer > 0 && this.coyote > 0) {
      pb.setVelocityY(-940);
      this.jumpBuffer = 0;
      this.coyote = 0;
      sfx.jump();
    }
    if (pb.velocity.y < 0 && !input.down("a")) pb.setVelocityY(pb.velocity.y * 0.88);

    this.walkT += Math.abs(ax) > 0.2 && onGround ? dt * 12 : 0;
    this.qish.setPosition(this.player.x, pb.bottom + 4);
    this.qish.setTexture(Math.abs(ax) > 0.2 && onGround ? `qish_side_walk_${Math.floor(this.time.now / 110) % 4}` : "qish_side");
    this.qish.setAngle(onGround ? Math.sin(this.walkT) * 4 : this.facing * -6);
    this.qish.setAlpha(this.invuln > 0 && Math.floor(this.invuln * 12) % 2 ? 0.35 : 1);

    this.updateBoss(dt);
  }

  private updateBoss(dt: number) {
    const b = this.boss.body;
    this.bowat.setPosition(this.boss.x, b.bottom + 4);
    this.bowat.setAlpha(this.bossInvuln > 0 && !this.won && Math.floor(this.bossInvuln * 10) % 2 ? 0.5 : 1);
    if (!this.started || this.bossState === "dizzy") {
      b.setVelocityX(0);
      return;
    }
    const assist = this.fails >= 2;
    this.arrow.setVisible(assist).setPosition(this.boss.x, b.top - 60 + Math.sin(this.time.now / 150) * 8);

    this.bossTimer -= dt;
    if (this.bossState === "walk") {
      const speed = (assist ? 90 : 130) + this.hits * 30;
      if (this.boss.x < 120) this.bossDir = 1;
      if (this.boss.x > W - 120) this.bossDir = -1;
      b.setVelocityX(this.bossDir * speed);
      // Still seeing stars for a moment after a stomp, then back to waddling.
      const dazed = this.bossInvuln > 0.8;
      const frame = Math.floor(this.time.now / 110) % 4;
      this.bowat.setTexture(dazed ? "bowat_hurt" : `bowat_side_walk_${frame}`).setFlipX(!dazed && this.bossDir < 0);
      this.bowat.y -= Math.abs(Math.sin(this.time.now / 90)) * 2;
      if (this.bossTimer <= 0) {
        this.bossState = "windup";
        this.bossTimer = 0.6;
      }
    } else if (this.bossState === "windup") {
      b.setVelocityX(0);
      // Turns around and shows the famous Bowat booty before the cloud.
      this.bowat.setTexture("bowat_back").setFlipX(false);
      this.bowat.x += Math.sin(this.time.now / 25) * 4;
      if (this.bossTimer <= 0) {
        this.fart();
        this.bossState = "fart";
        this.bossTimer = 0.45;
      }
    } else if (this.bossState === "fart") {
      // Holds the pose, looking back over his shoulder at the cloud.
      b.setVelocityX(0);
      this.bowat.setTexture("bowat_fart_back").setFlipX(this.bossDir < 0);
      if (this.bossTimer <= 0) {
        this.bossState = "walk";
        this.bossTimer = (assist ? 3.2 : 2.4) + Math.random();
      }
    }
  }

  /** The big screen flicking between ads, and the monorail gliding along the back every so often. */

}
