import { input } from "../core/input";
import { onFrame } from "../core/loop";
import { sfx } from "../core/sfx";
import { el, ui } from "./dom";

/** Exercise rep counter: mash A (or tap the panel) `reps` times. `onRep` runs on every rep with the
 * count so far. Resolves after a short "SIAP!" once the last rep is in. */
export function repMeter(title: string, reps: number, onRep: (n: number) => void) {
  const panel = el(
    "div",
    "rep-panel",
    `<h3>${title}</h3><div class="count">0 / ${reps}</div><div class="meter"><i></i></div><div class="hint">Tekan <kbd data-control="a">Space</kbd> berulang-ulang!</div>`,
  );
  const count = panel.querySelector(".count") as HTMLElement;
  const bar = panel.querySelector(".meter i") as HTMLElement;
  let taps = 0;
  panel.addEventListener("pointerdown", (e) => {
    e.stopPropagation();
    taps++;
  });
  ui().appendChild(panel);
  let n = 0;
  // The A that opened the machine is still "pressed" this frame; start listening on the next one.
  let armed = false;
  return new Promise<void>((resolve) => {
    const off = onFrame(() => {
      if (!armed) {
        armed = true;
        taps = 0;
        return;
      }
      let presses = taps + (input.pressed("a") ? 1 : 0);
      taps = 0;
      while (presses-- > 0 && n < reps) {
        n++;
        onRep(n);
        count.textContent = `${n} / ${reps}`;
        count.classList.remove("pop");
        void count.offsetWidth;
        count.classList.add("pop");
        bar.style.width = `${(n / reps) * 100}%`;
        if (n === reps) {
          off();
          sfx.fanfare();
          panel.classList.add("done");
          count.textContent = "SIAP!";
          panel.querySelector(".hint")!.textContent = "-1.0kg 🔥";
          setTimeout(() => {
            panel.remove();
            resolve();
          }, 900);
        }
      }
    });
  });
}
