// One input layer for keyboard, gamepad and touch. Call poll() once per frame
// (main.ts runs it from the first requestAnimationFrame callback), then read
// axis(), down() and pressed() from any scene.

export type Button = "a" | "b" | "start";

const KEYMAP: Record<string, Button | "up" | "down" | "left" | "right"> = {
  ArrowUp: "up", KeyW: "up",
  ArrowDown: "down", KeyS: "down",
  ArrowLeft: "left", KeyA: "left",
  ArrowRight: "right", KeyD: "right",
  Space: "a", Enter: "a", KeyZ: "a", KeyJ: "a",
  Escape: "b", KeyX: "b", KeyK: "b", Backspace: "b",
  KeyP: "start",
};

class Input {
  private keys = new Set<string>();
  /** Buttons pressed since the last poll, kept even if released within the same frame. */
  private latched = new Set<Button>();
  private touchAxis = { x: 0, y: 0 };
  private touchButtons = new Set<Button>();
  private now = new Set<Button>();
  private prev = new Set<Button>();
  private stick = { x: 0, y: 0 };
  lastDevice: "keyboard" | "gamepad" | "touch" = matchMedia("(pointer: coarse)").matches ? "touch" : "keyboard";
  private padId = "";

  /** Labels always describe the same standard Gamepad API buttons used below. */
  label(button: Button): string {
    if (this.lastDevice === "keyboard") return { a: "Space", b: "Esc", start: "P" }[button];
    if (this.lastDevice === "touch") return { a: "A", b: "B", start: "Menu" }[button];
    if (/dualsense|dualshock|playstation|sony|054c/i.test(this.padId)) return { a: "✕", b: "○", start: "Options" }[button];
    if (/nintendo|switch|057e/i.test(this.padId)) return { a: "B", b: "A", start: "+" }[button];
    return { a: "A", b: "B", start: "Menu" }[button];
  }

  constructor() {
    window.addEventListener("keydown", (e) => {
      const action = KEYMAP[e.code];
      if (action) {
        e.preventDefault();
        this.keys.add(action);
        if (!e.repeat && (action === "a" || action === "b" || action === "start")) this.latched.add(action);
        this.lastDevice = "keyboard";
      }
    });
    window.addEventListener("keyup", (e) => {
      const action = KEYMAP[e.code];
      if (action) this.keys.delete(action);
    });
    window.addEventListener("pointerdown", e => {
      this.lastDevice = e.pointerType === "touch" ? "touch" : "keyboard";
    }, { passive: true });
    window.addEventListener("blur", () => this.reset());
    window.addEventListener("gameviewportresize", () => this.reset());
    document.addEventListener("visibilitychange", () => { if (document.hidden) this.reset(); });
  }

  /** Rotating, opening browser UI or switching apps must never leave an action held. */
  reset() {
    this.keys.clear(); this.latched.clear(); this.touchButtons.clear();
    this.touchAxis = { x: 0, y: 0 }; this.stick = { x: 0, y: 0 };
    this.now.clear(); this.prev.clear();
  }

  setTouchAxis(x: number, y: number) {
    this.touchAxis = { x, y };
    this.lastDevice = "touch";
  }

  setTouchButton(b: Button, on: boolean) {
    if (on) {
      this.touchButtons.add(b);
      this.latched.add(b);
    } else this.touchButtons.delete(b);
    this.lastDevice = "touch";
  }

  poll() {
    this.prev = this.now;
    this.now = new Set<Button>();
    let x = 0;
    let y = 0;
    if (this.keys.has("left")) x -= 1;
    if (this.keys.has("right")) x += 1;
    if (this.keys.has("up")) y -= 1;
    if (this.keys.has("down")) y += 1;
    for (const b of ["a", "b", "start"] as Button[]) if (this.keys.has(b)) this.now.add(b);
    // A tap shorter than a frame still counts as one press.
    for (const b of this.latched) if (!this.prev.has(b)) this.now.add(b);
    this.latched.clear();

    let padConnected = false;
    for (const pad of navigator.getGamepads ? navigator.getGamepads() : []) {
      if (!pad) continue;
      padConnected = true;
      const ax = Math.abs(pad.axes[0] ?? 0) > 0.25 ? pad.axes[0] : 0;
      const ay = Math.abs(pad.axes[1] ?? 0) > 0.25 ? pad.axes[1] : 0;
      const b = (i: number) => !!pad.buttons[i]?.pressed;
      const dx = (b(15) ? 1 : 0) - (b(14) ? 1 : 0);
      const dy = (b(13) ? 1 : 0) - (b(12) ? 1 : 0);
      if (ax || ay || dx || dy || b(0) || b(1) || b(9)) { this.lastDevice = "gamepad"; this.padId = pad.id; }
      x += ax + dx;
      y += ay + dy;
      if (b(0)) this.now.add("a");
      if (b(1)) this.now.add("b");
      if (b(9)) this.now.add("start");
    }
    if (!padConnected && this.lastDevice === "gamepad") this.lastDevice = matchMedia("(pointer: coarse)").matches ? "touch" : "keyboard";

    x += this.touchAxis.x;
    y += this.touchAxis.y;
    for (const b of this.touchButtons) this.now.add(b);

    const len = Math.hypot(x, y);
    this.stick = len > 1 ? { x: x / len, y: y / len } : { x, y };
  }

  /** Movement vector, length <= 1. y is positive downward (screen space). */
  axis() {
    return this.stick;
  }

  down(b: Button) {
    return this.now.has(b);
  }

  pressed(b: Button) {
    return this.now.has(b) && !this.prev.has(b);
  }
}

export const input = new Input();
