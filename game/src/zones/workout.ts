import { save } from "../core/save";

// Putrajaya: Qish arrives, remembers she hasn't jogged today (and ate like Snorlax at the Dusun),
// and has to work the scale from 86kg back down to 80kg before the Qish ex chase. Jogging burns a
// little per metre, more when she runs beside another jogger; the three machines at the Taman
// Kecergasan take a chunk each.

export const KG_START = 86;
export const KG_GOAL = 80;
/** kg per world unit jogged; doubled beside a jogging buddy. */
export const KG_PER_UNIT = 0.016;
export const KG_PER_STATION = 1;

export interface Station {
  name: string;
  reps: number;
  /** Where the machine stands, and where Qish stands to use it. */
  at: [number, number];
  spot: [number, number];
}

export const STATIONS: Station[] = [
  { name: "Air Walker", reps: 12, at: [-12.3, 13.1], spot: [-12.3, 13.15] },
  { name: "Palang Tarik", reps: 8, at: [-8.6, 12.0], spot: [-9.25, 12.05] },
  { name: "Sit-up", reps: 10, at: [-9.9, 15.0], spot: [-9.9, 15.05] },
];

/** Qish's pose on a machine: `e` is how fresh the last rep is (1 right after, easing to 0). */
export function stationPose(i: number, t: number, e: number) {
  if (i === 0) return { y: 0.18, rot: Math.sin(t * 6) * (0.08 + e * 0.22), squash: 1 };
  if (i === 1) return { y: 0.2 + e * 0.75, rot: Math.sin(t * 3) * 0.03, squash: 1 + e * 0.04 };
  return { y: 0.05, rot: -0.05 + e * 0.12, squash: 0.68 + e * 0.32 };
}

/** Set by the zone each frame: Qish is running beside a jogger (burns double). */
export const live = { buddy: false };

const KG = "pjKg";
const DONE = "pjFit";

export const kgNow = () => (save.flag(DONE) ? KG_GOAL : save.val(KG, KG_START));
export const workoutDone = () => save.flag(DONE);
export const stationDone = (i: number) => save.flag(`pjGym:${i}`);
export const markStation = (i: number) => save.setFlag(`pjGym:${i}`);

type Listener = (kg: number, step: boolean, done: boolean) => void;
const listeners = new Set<Listener>();

/** Called on every change; `step` is true each time the scale crosses another 0.1kg. */
export function onWorkout(fn: Listener) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

/** Counts every 0.1kg tick, for the little "-0.1kg" pops over Qish. */
export const scaleTicks = { n: 0 };

/** The station Qish is on right now and when she last did a rep, for the machines to move with her. */
export const gym = { active: -1, rep: -10 };

/** Burn `kg`. Saved each time the scale crosses another 0.1kg; at the goal it sets the flag and
 * tells listeners (once, since nothing burns after that). */
export function burn(kg: number) {
  if (workoutDone() || kg <= 0) return;
  const before = save.val(KG, KG_START);
  const after = Math.max(KG_GOAL, before - kg);
  const step = Math.ceil(before * 10 - 1e-6) !== Math.ceil(after * 10 - 1e-6);
  const done = after <= KG_GOAL + 1e-6;
  save.data.vals[KG] = after;
  if (done) save.data.flags[DONE] = true;
  if (step) scaleTicks.n++;
  if (step || done) save.write();
  for (const fn of listeners) fn(after, step, done);
}

/** "84.3kg" */
export const kgText = (kg = kgNow()) => `${(Math.ceil(kg * 10 - 1e-6) / 10).toFixed(1)}kg`;
