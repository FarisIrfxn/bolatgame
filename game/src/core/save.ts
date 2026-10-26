// Progress lives in localStorage. Every access is guarded so a blocked or
// private-mode storage never breaks the game; it just won't persist.

export interface SaveData {
  cards: number[]; // card numbers (1-8, matching cards/*.png) the player has unlocked
  flags: Record<string, boolean>;
  /** Numbers the story keeps (Qish's weight on the Putrajaya scale). */
  vals: Record<string, number>;
  /** First playthrough on camera: include the secret card's "Pusing belakang" note. */
  recordingMode: boolean;
  /** Cards already handed over in real life, so replays skip the prompt. */
  handedOver: number[];
  /** Zone to continue from. */
  zone?: string;
}

const KEY = "pokelove-save-v1";

const fresh = (): SaveData => ({ cards: [], flags: {}, vals: {}, recordingMode: true, handedOver: [] });

function load(): SaveData {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return { ...fresh(), ...JSON.parse(raw) };
  } catch {
    /* storage unavailable */
  }
  return fresh();
}

export const save = {
  data: load(),

  write() {
    try {
      localStorage.setItem(KEY, JSON.stringify(this.data));
    } catch {
      /* storage unavailable */
    }
  },

  reset() {
    this.data = fresh();
    this.write();
  },

  /** Fresh playthrough from the title menu. Keeps recording mode and resets secret-card handover. */
  newGame() {
    const recordingMode = this.data.recordingMode;
    this.data = { ...fresh(), recordingMode };
    this.write();
  },

  /** True when there is something to continue. */
  hasProgress() {
    return !!this.data.flags.introSeen;
  },

  hasCard(n: number) {
    return this.data.cards.includes(n);
  },

  addCard(n: number) {
    if (!this.hasCard(n)) this.data.cards.push(n);
    this.write();
  },

  flag(name: string) {
    return !!this.data.flags[name];
  },

  setFlag(name: string, value = true) {
    this.data.flags[name] = value;
    this.write();
  },

  val(name: string, fallback: number) {
    return this.data.vals[name] ?? fallback;
  },

  setVal(name: string, value: number) {
    this.data.vals[name] = value;
    this.write();
  },
};
