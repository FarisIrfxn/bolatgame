import type { Box, Ride } from "../overworld/zone";

// Tasik Lily's water, and the sampan Qish rows out to pick the lilies. The shapes live here because
// the zone (land, shore, reeds), the boat ride (where it may go) and the walking test (where she may
// not) all need the same outline.

export type Pt = [number, number];

/** Water level: the land top is y = 0. */
export const WATER_Y = -0.62;

/** The lake in the middle of the zone, clockwise from the west shore. Two arms run off it: one north
 * off the top of the map (the bridge where Snorlax Twin sleeps crosses it) and one east off the right
 * edge, so the north-east corner with the road to KLIA is only reachable over that bridge. */
export const LAKE: Pt[] = [
  [-13.6, -2.0], [-12.4, -7.0], [-8.6, -10.4], [-3, -11.8], [2.5, -11.6],
  [6.0, -11.0], [6.0, -34], [9.2, -34], [9.2, -10.6],
  [11.8, -9.2], [13.6, -6.6],
  [14.6, -5.6], [22, -7.6], [36, -8.4], [36, -5.8], [22, -5.0], [15.0, -3.2],
  [14.6, 0.2], [12.6, 4.2], [7.6, 7.0], [1.5, 8.2], [-4.6, 7.8], [-9.8, 5.4], [-12.8, 1.8],
];

/** The open lake without its arms: where the sampan can go. */
export const BOAT: Pt[] = [
  [-13.6, -2.0], [-12.4, -7.0], [-8.6, -10.4], [-3, -11.8], [2.5, -11.6], [6.0, -11.0], [9.2, -10.6], [11.8, -9.2], [13.6, -6.6],
  [14.6, -5.6], [15.0, -3.2], [14.6, 0.2], [12.6, 4.2], [7.6, 7.0], [1.5, 8.2], [-4.6, 7.8], [-9.8, 5.4], [-12.8, 1.8],
];

/** The island in the middle where the otters sunbathe. */
export const ISLAND: Pt[] = [
  [-1.6, -3.4], [-0.6, -5.0], [1.4, -5.5], [3.4, -4.8], [4.2, -3.0], [3.6, -1.2], [1.6, -0.5], [-0.6, -1.2],
];

/** Wooden decks over the water that Qish can walk on. */
export const JETTY: Box = [-3.0, 3.2, -1.4, 8.6];
export const DECK: Box = [5.6, 4.6, 8.8, 8.4];
export const BRIDGE: Box = [5.0, -14.6, 10.2, -11.8];

/** Where the sampan ties up (east of the jetty's end), and where Qish steps off it. */
export const DOCK: Pt = [-0.25, 3.9];
export const JETTY_END: Pt = [-2.2, 3.7];

export function inPoly(poly: Pt[], x: number, z: number) {
  let hit = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, zi] = poly[i];
    const [xj, zj] = poly[j];
    if (zi > z !== zj > z && x < ((xj - xi) * (z - zi)) / (zj - zi) + xi) hit = !hit;
  }
  return hit;
}

export function edgeDist(poly: Pt[], x: number, z: number) {
  let best = Infinity;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [ax, az] = poly[j];
    const [bx, bz] = poly[i];
    const dx = bx - ax;
    const dz = bz - az;
    const k = Math.max(0, Math.min(1, ((x - ax) * dx + (z - az) * dz) / (dx * dx + dz * dz)));
    best = Math.min(best, Math.hypot(x - ax - dx * k, z - az - dz * k));
  }
  return best;
}

export const inBox = ([x0, z0, x1, z1]: Box, x: number, z: number, pad = 0) => x > x0 - pad && x < x1 + pad && z > z0 - pad && z < z1 + pad;

/** On foot: the water (lake and its arms) is out, except the jetty, the fishing deck and the bridge. */
export function wet(x: number, z: number) {
  if (inBox(JETTY, x, z) || inBox(DECK, x, z) || inBox(BRIDGE, x, z)) return false;
  return inPoly(LAKE, x, z) || edgeDist(LAKE, x, z) < 0.25 || inPoly(ISLAND, x, z);
}

/** Afloat: the open lake only (not its arms), clear of the banks, the island and the decks. */
function afloat(x: number, z: number) {
  if (!inPoly(BOAT, x, z) || edgeDist(BOAT, x, z) < 0.85) return false;
  if (inPoly(ISLAND, x, z) || edgeDist(ISLAND, x, z) < 0.85) return false;
  if (inBox(JETTY, x, z, 0.75) || inBox(DECK, x, z, 0.75)) return false;
  return true;
}

/** The ride the overworld steers while Qish is in the sampan. */
export const SAMPAN: Ride = { canGo: afloat, speed: 3.6, seat: WATER_Y + 0.38, vx: 0, vz: 0, heading: Math.PI };

/** Is Qish in the sampan right now (the boat prop and the otters watch this). */
export const boat = { riding: false };
