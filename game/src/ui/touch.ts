import { input, type Button } from "../core/input";
import { el } from "./dom";

/** On-screen joystick + A/B buttons, shown only on touch devices. */
export function mountTouchControls() {
  if (!matchMedia("(any-pointer: coarse)").matches && navigator.maxTouchPoints === 0) return;

  const root = el("div", "touch");
  const stick = el("div", "stick");
  const knob = el("div", "knob");
  stick.appendChild(knob);
  root.appendChild(stick);

  let stickId: number | null = null;
  const resets: (() => void)[] = [];
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
    const travel = (stick.clientWidth - knob.offsetWidth) / 2;
    knob.style.transform = `translate(${dx * travel}px, ${dy * travel}px)`;
    input.setTouchAxis(Math.abs(dx) > 0.2 ? dx : 0, Math.abs(dy) > 0.2 ? dy : 0);
  };
  stick.addEventListener("pointerdown", (e) => {
    if (stickId !== null) return;
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
  stick.addEventListener("lostpointercapture", release);
  resets.push(() => {
    if (stickId !== null && stick.hasPointerCapture(stickId)) stick.releasePointerCapture(stickId);
    stickId = null; knob.style.transform = "";
  });

  const button = (b: Button, cls: string, label: string) => {
    const btn = el("div", `btn ${cls}`, label);
    const fingers = new Set<number>();
    const on = (v: boolean) => {
      input.setTouchButton(b, v);
      btn.classList.toggle("on", v);
    };
    btn.addEventListener("pointerdown", (e) => {
      fingers.add(e.pointerId);
      btn.setPointerCapture(e.pointerId);
      on(true);
    });
    const releaseButton = (e: PointerEvent) => {
      if (!fingers.delete(e.pointerId)) return;
      on(fingers.size > 0);
    };
    btn.addEventListener("pointerup", releaseButton);
    btn.addEventListener("pointercancel", releaseButton);
    btn.addEventListener("lostpointercapture", releaseButton);
    resets.push(() => {
      for (const id of fingers) if (btn.hasPointerCapture(id)) btn.releasePointerCapture(id);
      fingers.clear(); btn.classList.remove("on");
    });
    root.appendChild(btn);
  };
  button("a", "btn-a", "A");
  button("b", "btn-b", "B");
  const reset = () => { input.reset(); resets.forEach(fn => fn()); };
  window.addEventListener("blur", reset);
  window.addEventListener("gameviewportresize", reset);
  document.addEventListener("visibilitychange", () => { if (document.hidden) reset(); });

  // Finger targets stay in physical CSS pixels while the game scales uniformly.
  document.getElementById("touch-ui")!.appendChild(root);
}
