import tracks from "../content/music.generated.json";
import type { BossId } from "../content/bosses";
import { audio } from "./sfx";
import { playLoopSong, type SongHandle } from "./chiptune";

type TrackId = keyof typeof tracks;

/** Alternate the seven non-rhythm bosses; Bolat has an original beat-synced song. */
export const BOSS_MUSIC: Record<Exclude<BossId, "bolat">, TrackId> = {
  bowat: "gimmeLove", snorlax: "sanctuary", blep: "gimmeLove", megabowat: "sanctuary",
  bolatex: "gimmeLove", qishex: "sanctuary", finale: "gimmeLove",
};

export const RHYTHM_BPM = 108;
export const RHYTHM_BARS = 12;

// Stream the full songs instead of keeping several minutes of decoded PCM in
// phone memory. Rhythm is synthesized directly on the shared audio clock.
const player = new Audio();
player.preload = "auto";
player.loop = true;
let requested: TrackId | null = null;
let revision = 0;
let graph: { context: AudioContext; gain: GainNode } | null = null;
let playbackError: string | null = null;
let rhythm: SongHandle | null = null;
// Leave room for the short, quiet interaction and dialogue effects.
const LEVEL = 0.16;

function connect() {
  if (graph) return graph;
  const context = audio();
  const gain = context.createGain();
  gain.gain.value = LEVEL;
  context.createMediaElementSource(player).connect(gain).connect(context.destination);
  graph = { context, gain };
  return graph;
}

function attemptPlay() {
  if (!requested || document.hidden) return;
  void player.play().catch((error: DOMException) => {
    // Autoplay denial is expected on the initial title. Retry inside the next
    // real pointer/key gesture; changing scenes also cancels pending play().
    if (error.name !== "NotAllowedError" && error.name !== "AbortError") playbackError = error.message;
  });
}

export const music = {
  play(id: TrackId) {
    if (requested === id) return; // Zone changes keep the overworld song's position.
    this.stop();
    requested = id;
    playbackError = null;
    const { context, gain } = connect();
    gain.gain.cancelScheduledValues(context.currentTime);
    gain.gain.setValueAtTime(0, context.currentTime);
    gain.gain.linearRampToValueAtTime(LEVEL, context.currentTime + 0.25);
    player.src = tracks[id].url;
    attemptPlay();
  },
  stop() {
    requested = null;
    rhythm?.stop();
    rhythm = null;
    const token = ++revision;
    if (!graph) return;
    const { context, gain } = graph;
    gain.gain.cancelScheduledValues(context.currentTime);
    gain.gain.setTargetAtTime(0, context.currentTime, 0.025);
    window.setTimeout(() => { if (revision === token && !requested) player.pause(); }, 120);
  },
  unlock() {
    if (document.hidden) return;
    void audio().resume().catch(() => {});
    attemptPlay();
  },
  /** Dev/audit diagnostics; never shown in the player UI. */
  state() {
    return { track: requested, time: player.currentTime, paused: player.paused, loop: player.loop,
      ready: player.readyState, error: playbackError ?? player.error?.message ?? null,
      context: graph?.context.state ?? null, rhythm: !!rhythm, level: LEVEL };
  },
};

for (const event of ["pointerdown", "keydown", "touchend"] as const) {
  window.addEventListener(event, () => music.unlock(), { passive: true });
}
document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    player.pause();
    void graph?.context.suspend();
  } else music.unlock();
});

/** No audio download is needed: the original song is synthesized on the audio clock. */
export function prepareRhythmSong(): Promise<void> {
  return Promise.resolve();
}

/** Original 108 BPM song, four count-in beats, with one shared clock for audio and notes. */
export function playRhythmSong(): SongHandle {
  music.stop();
  const song = playLoopSong(RHYTHM_BPM, RHYTHM_BARS);
  const handle: SongHandle = {
    now: () => song.now(), beat: song.beat, length: song.length,
    stop() {
      song.stop();
      if (rhythm === handle) rhythm = null;
    },
  };
  rhythm = handle;
  return handle;
}
