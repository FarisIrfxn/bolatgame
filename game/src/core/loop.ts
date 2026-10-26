import { input } from "./input";

// The single frame clock. Input is polled first, then every subscriber runs,
// so all scenes and UI widgets see the same pressed() edges in a frame.

type FrameFn = (dt: number, time: number) => void;

const subs = new Set<FrameFn>();
let last = performance.now();

function tick(now: number) {
  requestAnimationFrame(tick);
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  input.poll();
  for (const fn of [...subs]) fn(dt, now / 1000);
}

export function startLoop() {
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
