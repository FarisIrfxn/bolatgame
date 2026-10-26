import { audio } from "./sfx";

// Cosy Place's pianist: an original, slow waltz in 3/4 (bass on one, a soft chord on two and three, a
// simple melody over it). Like the Lorbel busker, the zone sets the loudness every frame from how close
// Qish is to the piano, and it stops by itself once the zone stops calling setLevel().

const midi = (n: number) => 440 * Math.pow(2, (n - 69) / 12);

// One chord per bar: C – Am – Dm – G7 – C – Am – F – G.
const BARS: [number, number[]][] = [
  [36, [52, 55, 60]],
  [45, [52, 57, 60]],
  [38, [53, 57, 62]],
  [43, [53, 55, 59]],
  [36, [52, 55, 60]],
  [45, [52, 57, 60]],
  [41, [53, 57, 60]],
  [43, [50, 55, 59]],
];
// Melody per bar: [beat, midi note, length in beats]; original tune.
const MELODY: [number, number, number][][] = [
  [[0, 76, 2], [2, 79, 1]],
  [[0, 81, 2], [2, 79, 1]],
  [[0, 77, 1], [1, 76, 1], [2, 74, 1]],
  [[0, 79, 3]],
  [[0, 76, 1], [1, 74, 1], [2, 72, 1]],
  [[0, 69, 2], [2, 72, 1]],
  [[0, 77, 1], [1, 76, 1], [2, 74, 1]],
  [[0, 71, 2], [2, 74, 1]],
];

export interface PianoMusic {
  /** 0..1, called every frame while the zone is up. */
  setLevel(v: number): void;
}

export function pianoMusic(bpm = 96): PianoMusic {
  const a = audio();
  const beat = 60 / bpm;
  const out = a.createGain();
  out.gain.value = 0;
  // A big room: a longer, darker echo than the busker's alley.
  const delay = a.createDelay();
  delay.delayTime.value = beat * 0.75;
  const fb = a.createGain();
  fb.gain.value = 0.3;
  const damp = a.createBiquadFilter();
  damp.type = "lowpass";
  damp.frequency.value = 1800;
  const wet = a.createGain();
  wet.gain.value = 0.3;
  out.connect(a.destination);
  out.connect(delay);
  delay.connect(damp).connect(fb).connect(delay);
  damp.connect(wet).connect(a.destination);

  /** A soft piano-ish note: a sine and a quieter octave triangle, quick attack, long decay. */
  const key = (n: number, t: number, dur: number, gain: number) => {
    const f = midi(n);
    const g = a.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(gain, t + 0.012);
    g.gain.exponentialRampToValueAtTime(gain * 0.35, t + 0.25);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur + 0.6);
    g.connect(out);
    for (const [type, mul, lvl] of [["sine", 1, 1], ["triangle", 2, 0.18]] as const) {
      const o = a.createOscillator();
      const og = a.createGain();
      o.type = type;
      o.frequency.value = f * mul;
      og.gain.value = lvl;
      o.connect(og).connect(g);
      o.start(t);
      o.stop(t + dur + 0.65);
    }
  };

  const LOOP = BARS.length * 3;
  const start = a.currentTime + 0.1;
  let next = 0;
  let lastCall = performance.now();
  let level = 0;
  const schedule = () => {
    if (performance.now() - lastCall > 300) {
      clearInterval(timer);
      out.gain.setTargetAtTime(0, a.currentTime, 0.08);
      setTimeout(() => {
        out.disconnect();
        wet.disconnect();
      }, 800);
      return;
    }
    const horizon = a.currentTime + 0.3;
    while (start + next * beat < horizon) {
      const t = start + next * beat;
      const step = next % LOOP;
      const bar = Math.floor(step / 3);
      const b = step % 3;
      if (level > 0.01) {
        const [bass, chord] = BARS[bar];
        if (b === 0) key(bass, t, beat * 2.5, 0.16);
        else chord.forEach((n) => key(n, t, beat * 0.8, 0.05));
        for (const [mb, n, len] of MELODY[bar]) if (mb === b) key(n, t + (bar % 2 && b === 0 ? 0.03 : 0), beat * len, 0.11);
      }
      next++;
    }
  };
  const timer = window.setInterval(schedule, 40);

  return {
    setLevel(v: number) {
      lastCall = performance.now();
      const target = Math.max(0, Math.min(1, v));
      if (Math.abs(target - level) > 0.01) {
        level = target;
        out.gain.setTargetAtTime(level * 0.6, a.currentTime, 0.15);
      }
    },
  };
}
