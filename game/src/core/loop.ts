import { input } from "./input";

// The single frame clock. Input is polled first, then every subscriber runs,
// so all scenes and UI widgets see the same pressed() edges in a frame.

type FrameFn = (dt: number, time: number) => void;

const subs = new Set<FrameFn>();
let last = performance.now();
let started = false;
const frameInterval = navigator.maxTouchPoints > 0 ? 1000 / 60 : 0;
document.addEventListener("visibilitychange", () => { last = performance.now(); });

function tick(now: number) {
  requestAnimationFrame(tick);
  // 90/120 Hz phone displays need not render this game twice as often.
  // Keep the accumulated elapsed time when a display frame is skipped.
  if (document.hidden || now - last < frameInterval - .5) return;
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  input.poll();
  for (const fn of [...subs]) fn(dt, now / 1000);
}

export function startLoop() {
  if (started) return;
  started = true;
  last = performance.now();
  requestAnimationFrame(tick);
}

export function onFrame(fn: FrameFn) {
  subs.add(fn);
  return () => {
    subs.delete(fn);
  };
}

/** Resolve on the next frame where `test` returns true. */
export function waitFor(test: () => boolean) {
  return new Promise<void>((resolve) => {
    const off = onFrame(() => {
      if (test()) {
        off();
        resolve();
      }
    });
  });
}

export const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));
