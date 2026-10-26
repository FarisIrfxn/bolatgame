import { audio } from "./sfx";

// The Lorbel busker: an original, gentle acoustic loop (plucked guitar, a cajon, a hummed melody)
// whose loudness the zone sets every frame from how close Qish is to the stage. Placeholder until
// Faris's 8-bit tracks arrive. It stops by itself once the zone stops calling setLevel() (zone
// change, minigame), so it needs no teardown hook.

const midi = (n: number) => 440 * Math.pow(2, (n - 69) / 12);

// G – Em – C – D, two bars each.
const CHORDS = [
  [55, 59, 62, 67],
  [52, 55, 59, 64],
  [48, 52, 55, 60],
  [50, 54, 57, 62],
];
// Fingerpicking order over 8 eighth notes (indices into the chord).
const PICK = [0, 2, 1, 3, 0, 2, 1, 2];
// Melody per 2-bar chord: [eighth-step, midi note, length in eighths]; original tune.
const MELODY: [number, number, number][][] = [
  [[0, 74, 3], [4, 76, 2], [6, 74, 2], [8, 71, 4], [13, 69, 3]],
  [[0, 71, 3], [4, 67, 2], [6, 69, 2], [8, 71, 6]],
  [[0, 72, 3], [4, 71, 2], [6, 69, 2], [8, 67, 4], [13, 64, 3]],
  [[0, 66, 2], [2, 67, 2], [4, 69, 4], [10, 74, 6]],
];

export interface BuskerMusic {
  /** 0..1, called every frame while the zone is up. */
  setLevel(v: number): void;
}

export function buskerMusic(bpm = 92): BuskerMusic {
  const a = audio();
  const eighth = 30 / bpm;
  const out = a.createGain();
  out.gain.value = 0;
  // A little room: a short feedback delay so it sounds like it comes off the alley walls.
  const delay = a.createDelay();
  delay.delayTime.value = eighth * 1.5;
  const fb = a.createGain();
  fb.gain.value = 0.22;
  const wet = a.createGain();
  wet.gain.value = 0.35;
  out.connect(a.destination);
  out.connect(delay);
  delay.connect(fb).connect(delay);
  delay.connect(wet).connect(a.destination);

  const pluck = (f: number, t: number, dur: number, gain: number) => {
    const o = a.createOscillator();
    const flt = a.createBiquadFilter();
    const g = a.createGain();
    o.type = "sawtooth";
    o.frequency.value = f;
    flt.type = "lowpass";
    flt.frequency.setValueAtTime(2600, t);
    flt.frequency.exponentialRampToValueAtTime(500, t + dur);
    g.gain.setValueAtTime(gain, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(flt).connect(g).connect(out);
    o.start(t);
    o.stop(t + dur + 0.02);
  };
  const hum = (f: number, t: number, dur: number) => {
    const o = a.createOscillator();
    const g = a.createGain();
    o.type = "triangle";
    o.frequency.value = f;
    const vib = a.createOscillator();
    const vg = a.createGain();
    vib.frequency.value = 5.2;
    vg.gain.value = f * 0.006;
    vib.connect(vg).connect(o.frequency);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(0.07, t + 0.06);
    g.gain.setValueAtTime(0.07, t + dur * 0.7);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(out);
    o.start(t);
    vib.start(t);
    o.stop(t + dur + 0.02);
    vib.stop(t + dur + 0.02);
  };
  const noiseBuf = a.createBuffer(1, a.sampleRate * 0.15, a.sampleRate);
  noiseBuf.getChannelData(0).forEach((_, i, d) => (d[i] = Math.random() * 2 - 1));
  const cajon = (t: number, slap: boolean) => {
    if (!slap) {
      const o = a.createOscillator();
      const g = a.createGain();
      o.frequency.setValueAtTime(120, t);
      o.frequency.exponentialRampToValueAtTime(55, t + 0.14);
      g.gain.setValueAtTime(0.35, t);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.2);
      o.connect(g).connect(out);
      o.start(t);
      o.stop(t + 0.22);
      return;
    }
    const s = a.createBufferSource();
    s.buffer = noiseBuf;
    const f = a.createBiquadFilter();
    f.type = "bandpass";
    f.frequency.value = 1800;
    const g = a.createGain();
    g.gain.setValueAtTime(0.22, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.1);
    s.connect(f).connect(g).connect(out);
    s.start(t);
    s.stop(t + 0.12);
  };

  // 2 bars per chord, 4 chords: a 64-eighth loop.
  const LOOP = 64;
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
      }, 600);
      return;
    }
    const horizon = a.currentTime + 0.25;
    while (start + next * eighth < horizon) {
      const t = start + next * eighth;
      const step = next % LOOP;
      const ci = Math.floor(step / 16);
      const chord = CHORDS[ci];
      const inChord = step % 16;
      // Quiet passages cost nothing: skip scheduling when nobody can hear it.
      if (level > 0.01) {
        pluck(midi(chord[PICK[inChord % 8]] - (inChord % 8 === 0 ? 12 : 0)), t, eighth * 3, inChord % 8 === 0 ? 0.11 : 0.07);
        if (inChord % 4 === 0) cajon(t, false);
        if (inChord % 4 === 2) cajon(t, true);
        if (inChord === 7 || inChord === 15) cajon(t + eighth * 0.5, true);
        for (const [at, note, len] of MELODY[ci]) if (at === inChord) hum(midi(note), t, eighth * len);
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
        out.gain.setTargetAtTime(level * 0.55, a.currentTime, 0.15);
      }
    },
  };
}
