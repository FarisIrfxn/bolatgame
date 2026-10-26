import { audio } from "./sfx";

// An original twelve-bar rhythm song. Kick marks every chart beat; melody, bass
// and percussion all use the same AudioContext clock as note judgement.

const midi = (n: number) => 440 * Math.pow(2, (n - 69) / 12);

// I–V–vi–IV in C, one chord per bar.
const CHORDS = [
  [60, 64, 67],
  [55, 59, 62],
  [57, 60, 64],
  [53, 57, 60],
];
// 16-step lead motif per chord (offsets into the chord, -1 = rest).
const MOTIF = [0, -1, 1, 2, -1, 1, 0, -1, 2, -1, 1, -1, 0, 1, 2, -1];

export interface SongHandle {
  /** Seconds since beat 0 of the song (negative during the count-in). */
  now(): number;
  readonly beat: number; // seconds per beat
  readonly length: number; // seconds until the last bar ends
  stop(): void;
}

export function playLoopSong(bpm: number, bars: number, countInBeats = 4): SongHandle {
  const a = audio();
  const beat = 60 / bpm;
  const step = beat / 4;
  const start = a.currentTime + 0.15 + countInBeats * beat;
  const sources: (OscillatorNode | AudioBufferSourceNode)[] = [];
  const out = a.createGain();
  out.gain.value = 0.24;
  out.connect(a.destination);

  const tone = (f: number, t: number, dur: number, type: OscillatorType, gain: number) => {
    const o = a.createOscillator();
    const g = a.createGain();
    o.type = type;
    o.frequency.value = f;
    g.gain.setValueAtTime(gain, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(out);
    sources.push(o);
    o.start(t);
    o.stop(t + dur + 0.02);
  };
  const kick = (t: number) => {
    const o = a.createOscillator();
    const g = a.createGain();
    o.frequency.setValueAtTime(150, t);
    o.frequency.exponentialRampToValueAtTime(45, t + 0.12);
    g.gain.setValueAtTime(0.5, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.18);
    o.connect(g).connect(out);
    sources.push(o);
    o.start(t);
    o.stop(t + 0.2);
  };
  const noiseBuf = a.createBuffer(1, a.sampleRate * 0.2, a.sampleRate);
  noiseBuf.getChannelData(0).forEach((_, i, d) => (d[i] = Math.random() * 2 - 1));
  const hit = (t: number, dur: number, freq: number, gain: number) => {
    const s = a.createBufferSource();
    s.buffer = noiseBuf;
    const f = a.createBiquadFilter();
    f.type = "highpass";
    f.frequency.value = freq;
    const g = a.createGain();
    g.gain.setValueAtTime(gain, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    s.connect(f).connect(g).connect(out);
    sources.push(s);
    s.start(t);
    s.stop(t + dur);
  };

  // Count-in clicks.
  for (let i = 0; i < countInBeats; i++) tone(i === 0 ? 1320 : 990, start - (countInBeats - i) * beat, 0.05, "square", 0.08);

  const totalSteps = bars * 16;
  let next = 0;
  let stopped = false;
  const schedule = () => {
    if (stopped) return;
    const horizon = a.currentTime + 0.2;
    while (next < totalSteps && start + next * step < horizon) {
      const t = start + next * step;
      const bar = Math.floor(next / 16);
      const s = next % 16;
      const chord = CHORDS[bar % 4];
      const intro = bar < 2;
      if (s % 4 === 0) kick(t);
      if (s % 8 === 4) hit(t, 0.12, 1200, 0.25); // snare
      if (s % 2 === 1) hit(t, 0.03, 7000, 0.06); // hat
      if (s % 4 === 0) tone(midi(chord[0] - 24), t, beat * 0.9, "triangle", 0.16); // bass
      if (!intro && MOTIF[s] >= 0) tone(midi(chord[MOTIF[s]] + 12), t, step * 1.6, "square", 0.045);
      next++;
    }
  };
  const timer = window.setInterval(schedule, 25);
  schedule();

  return {
    now: () => a.currentTime - start,
    beat,
    length: totalSteps * step,
    stop() {
      if (stopped) return;
      stopped = true;
      for (const source of sources) { try { source.stop(); } catch { /* Already ended. */ } }
      clearInterval(timer);
      out.gain.setTargetAtTime(0, a.currentTime, 0.05);
      setTimeout(() => out.disconnect(), 400);
    },
  };
}
