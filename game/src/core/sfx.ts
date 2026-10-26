// Synthesized sound effects. The supplied chiptune BGM is managed by music.ts.

let ctx: AudioContext | null = null;

export function audio() {
  if (!ctx) ctx = new AudioContext();
  if (ctx.state === "suspended" && !document.hidden) void ctx.resume().catch(() => {});
  return ctx;
}

function tone(freq: number, dur: number, type: OscillatorType, gain = 0.12, slideTo?: number) {
  const a = audio();
  const osc = a.createOscillator();
  const g = a.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, a.currentTime);
  if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, a.currentTime + dur);
  g.gain.setValueAtTime(gain, a.currentTime);
  g.gain.exponentialRampToValueAtTime(0.0001, a.currentTime + dur);
  osc.connect(g).connect(a.destination);
  osc.start();
  osc.stop(a.currentTime + dur);
}

function noise(dur: number, lowpass: number, gain = 0.25) {
  const a = audio();
  const buf = a.createBuffer(1, Math.floor(a.sampleRate * dur), a.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / d.length);
  const src = a.createBufferSource();
  src.buffer = buf;
  const f = a.createBiquadFilter();
  f.type = "lowpass";
  f.frequency.value = lowpass;
  const g = a.createGain();
  g.gain.value = gain;
  src.connect(f).connect(g).connect(a.destination);
  src.start();
}

const NOTE: Record<string, number> = {
  D4: 293.66, E4: 329.63, "F#4": 369.99, G4: 392, A4: 440, B4: 493.88, C5: 523.25, D5: 587.33,
};

// Happy Birthday to You (public domain). [note, beats] in 3/4.
const HAPPY_BIRTHDAY: [string, number][] = [
  ["D4", 0.75], ["D4", 0.25], ["E4", 1], ["D4", 1], ["G4", 1], ["F#4", 2],
  ["D4", 0.75], ["D4", 0.25], ["E4", 1], ["D4", 1], ["A4", 1], ["G4", 2],
  ["D4", 0.75], ["D4", 0.25], ["D5", 1], ["B4", 1], ["G4", 1], ["F#4", 1], ["E4", 2],
  ["C5", 0.75], ["C5", 0.25], ["B4", 1], ["G4", 1], ["A4", 1], ["G4", 3],
];

/** Loop an 8-bit Happy Birthday until the returned stop() is called. */
function happyBirthday(bpm = 110) {
  const a = audio();
  const out = a.createGain();
  out.connect(a.destination);
  const voices = new Set<OscillatorNode>();
  const beat = 60 / bpm;
  let stopped = false;
  let timer = 0;
  const playOnce = () => {
    if (stopped) return;
    let t = a.currentTime + 0.05;
    for (const [n, beats] of HAPPY_BIRTHDAY) {
      for (const [type, mult, gain] of [["square", 1, 0.06], ["triangle", 0.5, 0.08]] as const) {
        const osc = a.createOscillator();
        const g = a.createGain();
        osc.type = type;
        osc.frequency.value = NOTE[n] * mult;
        g.gain.setValueAtTime(gain, t);
        g.gain.exponentialRampToValueAtTime(0.0001, t + beats * beat * 0.95);
        osc.connect(g).connect(out);
        voices.add(osc);
        osc.onended = () => { voices.delete(osc); osc.disconnect(); g.disconnect(); };
        osc.start(t);
        osc.stop(t + beats * beat);
      }
      t += beats * beat;
    }
    const total = HAPPY_BIRTHDAY.reduce((s, [, b]) => s + b, 0) * beat;
    timer = window.setTimeout(playOnce, (total + 1.2) * 1000);
  };
  playOnce();
  return () => {
    if (stopped) return;
    stopped = true;
    clearTimeout(timer);
    out.gain.setTargetAtTime(0, a.currentTime, 0.015);
    for (const osc of voices) osc.stop(a.currentTime + 0.08);
    window.setTimeout(() => out.disconnect(), 120);
  };
}

export const sfx = {
  happyBirthday,
  puff: () => noise(0.25, 900, 0.12),
  /** Unlock audio on the first user gesture (browsers block it before that). */
  unlock() {
    audio();
  },
  blip: () => tone(880, 0.06, "square", 0.05),
  talk: () => tone(520 + Math.random() * 160, 0.04, "triangle", 0.04),
  select: () => tone(660, 0.1, "square", 0.07, 990),
  jump: () => tone(300, 0.18, "square", 0.08, 700),
  stomp: () => {
    tone(180, 0.25, "sawtooth", 0.12, 60);
    noise(0.2, 400, 0.3);
  },
  prot: () => {
    // A proper Bowat fart: low wobbly buzz.
    tone(95, 0.45, "sawtooth", 0.16, 55);
    noise(0.4, 260, 0.35);
  },
  hurt: () => tone(400, 0.25, "square", 0.08, 120),
  flip: () => tone(1200, 0.05, "triangle", 0.04, 1800),
  fanfare: () => {
    const notes = [523, 659, 784, 1047, 784, 1047];
    notes.forEach((n, i) => setTimeout(() => tone(n, 0.22, "square", 0.08), i * 120));
  },
  /** Ayam kampung startled. */
  cluck: () => {
    tone(820, 0.05, "square", 0.025, 560);
    setTimeout(() => tone(900, 0.06, "square", 0.025, 600), 90);
  },
  /** Kampung cat saying hello. */
  meow: () => {
    tone(620, 0.09, "triangle", 0.045, 880);
    setTimeout(() => tone(880, 0.22, "triangle", 0.045, 520), 90);
  },
  /** Picking up a collectible: a crunch and a rising chime. */
  pickup: () => {
    noise(0.07, 2200, 0.08);
    [988, 1319, 1760].forEach((n, i) => setTimeout(() => tone(n, 0.12, "triangle", 0.06), 40 + i * 55));
  },
  /** Spanner on metal. */
  clank: () => {
    tone(1480, 0.12, "square", 0.05, 900);
    noise(0.05, 4000, 0.08);
  },
  /** A jet far off: long low rumble. */
  jet: () => noise(2.6, 300, 0.05),
  /** Split-flap board rattling. */
  flap: () => [0, 35, 70, 105, 140].forEach((d) => setTimeout(() => noise(0.015, 3200, 0.025), d)),
  /** Bicycle / aiskrim bell. */
  bell: () => {
    tone(2350, 0.18, "sine", 0.05);
    tone(3130, 0.12, "sine", 0.025);
  },
  /** Pigeons bursting up. */
  flutter: () => [0, 50, 100, 150, 210].forEach((d) => setTimeout(() => noise(0.04, 1400, 0.05), d)),
  /** One exercise rep: a little "hup". */
  rep: () => tone(330 + Math.random() * 40, 0.08, "triangle", 0.06, 520),
  sparkle: () => [1568, 2093, 2637].forEach((n, i) => setTimeout(() => tone(n, 0.18, "sine", 0.06), i * 70)),
  /** Zone title card: a soft rising arpeggio. */
  place: () => [523, 659, 784, 1047, 1319].forEach((n, i) => setTimeout(() => tone(n, 0.5, "triangle", 0.045), i * 90)),
  /** Something dropping into the lake (an otter sliding in, a paddle stroke). */
  splash: () => {
    noise(0.35, 1500, 0.09);
    tone(420, 0.12, "sine", 0.03, 180);
  },
  /** Air freshener spray: a hiss and a little sparkle. */
  spray: () => {
    noise(0.55, 7000, 0.07);
    setTimeout(() => [2093, 2637].forEach((n, i) => setTimeout(() => tone(n, 0.14, "sine", 0.035), i * 60)), 380);
  },
  /** A car horn stuck in the Bukit Bintang jam. */
  honk: () => {
    tone(392, 0.32, "square", 0.025);
    tone(494, 0.32, "square", 0.02);
  },
  /** The scramble crossing's walk signal: quick high chirps. */
  chirp: () => [0, 110].forEach((d) => setTimeout(() => tone(2600, 0.05, "square", 0.012, 2200), d)),
  /** One note of the street piano (semitones above middle C). */
  piano: (semi: number) => {
    const f = 261.63 * Math.pow(2, semi / 12);
    tone(f, 0.7, "triangle", 0.07);
    tone(f * 2, 0.35, "sine", 0.02);
  },
  /** The monorail gliding past overhead. */
  whoosh: () => {
    noise(2.2, 520, 0.05);
    tone(180, 1.8, "sine", 0.015, 120);
  },
  /** Qish caught in a fart cloud. */
  cough: () => [0, 170].forEach((d) => setTimeout(() => noise(0.09, 900, 0.1), d)),
  /** A photobooth shot: a soft mechanical click and a short flash whine. */
  shutter: () => {
    noise(0.03, 3800, 0.05);
    setTimeout(() => noise(0.04, 2400, 0.04), 60);
  },
  /** The giant camera: AF beep-beep, a big shutter clack and the flash charging back up. */
  bigFlash: () => {
    tone(2900, 0.05, "square", 0.02);
    setTimeout(() => tone(2900, 0.05, "square", 0.02), 110);
    setTimeout(() => {
      noise(0.08, 2200, 0.12);
      noise(0.12, 600, 0.08);
      tone(1800, 0.9, "sine", 0.012, 5200);
    }, 280);
  },
  /** Paper caught by the wind. */
  whip: () => {
    noise(0.22, 1800, 0.06);
    tone(700, 0.18, "triangle", 0.015, 1400);
  },
  /** Snorlax Twin snoring: a long low rumble and a little whistle on the way out. */
  snore: () => {
    noise(0.9, 240, 0.12);
    tone(110, 0.8, "sawtooth", 0.03, 80);
    setTimeout(() => tone(900, 0.4, "sine", 0.012, 1400), 950);
  },
  /** An F1 car screaming past: a raspy engine note that drops in pitch as it goes by (Doppler),
   * plus tyre hiss off the wet track. `k` 0..1 is how close it passed. */
  zoom: (k = 1) => {
    const a = audio();
    const t = a.currentTime;
    const g = a.createGain();
    const f = a.createBiquadFilter();
    f.type = "lowpass";
    f.frequency.setValueAtTime(2400, t);
    f.frequency.exponentialRampToValueAtTime(700, t + 0.8);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.05 * k, t + 0.12);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.9);
    f.connect(g).connect(a.destination);
    for (const [type, mult] of [["sawtooth", 1], ["square", 1.5]] as const) {
      const o = a.createOscillator();
      o.type = type;
      o.frequency.setValueAtTime(560 * mult, t);
      o.frequency.exponentialRampToValueAtTime(240 * mult, t + 0.85);
      o.connect(f);
      o.start(t);
      o.stop(t + 0.92);
    }
    noise(0.6, 1600, 0.05 * k);
  },
  /** Thunder far off: a crack, then a long low rumble. */
  thunder: () => {
    noise(0.25, 900, 0.08);
    setTimeout(() => noise(2.6, 160, 0.32), 120);
    setTimeout(() => noise(1.8, 110, 0.22), 700);
  },
  /** Pit crew wheel guns: brrrt-brrrt. */
  wheelGun: () => [0, 90, 380, 470].forEach((d) => setTimeout(() => tone(140, 0.07, "sawtooth", 0.05, 90), d)),
  /** The grandstand going up: a wash of noise. */
  cheer: () => {
    noise(1.6, 2600, 0.07);
    setTimeout(() => noise(1.2, 1800, 0.05), 300);
  },
};
