import { input, type Button } from "../core/input";
import { el, ui } from "./dom";

/** On-screen joystick + A/B buttons, shown only on touch devices. */
export function mountTouchControls() {
  if (!matchMedia("(any-pointer: coarse)").matches && navigator.maxTouchPoints === 0) return;

  const root = el("div", "touch");
  const stick = el("div", "stick");
  const knob = el("div", "knob");
  stick.appendChild(knob);
  root.appendChild(stick);

  let stickId: number | null = null;
  const moveStick = (e: PointerEvent) => {
    const r = stick.getBoundingClientRect();
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;
    let dx = (e.clientX - cx) / (r.width / 2);
    let dy = (e.clientY - cy) / (r.height / 2);
    const len = Math.hypot(dx, dy);
    if (len > 1) {
      dx /= len;
      dy /= len;
    }
    knob.style.transform = `translate(${dx * 40}px, ${dy * 40}px)`;
    input.setTouchAxis(Math.abs(dx) > 0.2 ? dx : 0, Math.abs(dy) > 0.2 ? dy : 0);
  };
  stick.addEventListener("pointerdown", (e) => {
    stickId = e.pointerId;
    stick.setPointerCapture(e.pointerId);
    moveStick(e);
  });
  stick.addEventListener("pointermove", (e) => {
    if (e.pointerId === stickId) moveStick(e);
  });
  const release = (e: PointerEvent) => {
    if (e.pointerId !== stickId) return;
    stickId = null;
    knob.style.transform = "";
    input.setTouchAxis(0, 0);
  };
  stick.addEventListener("pointerup", release);
  stick.addEventListener("pointercancel", release);

  const button = (b: Button, cls: string, label: string) => {
    const btn = el("div", `btn ${cls}`, label);
    const on = (v: boolean) => {
      input.setTouchButton(b, v);
      btn.classList.toggle("on", v);
    };
    btn.addEventListener("pointerdown", (e) => {
      btn.setPointerCapture(e.pointerId);
      on(true);
    });
    btn.addEventListener("pointerup", () => on(false));
    btn.addEventListener("pointercancel", () => on(false));
    root.appendChild(btn);
  };
  button("a", "btn-a", "A");
  button("b", "btn-b", "B");

  ui().appendChild(root);
}
