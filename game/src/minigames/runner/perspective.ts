// Shared by the road paint, target boards and player: slots 0/1/2 are lane centers;
// half slots .5/1.5 are the two dividers between those exact same three lanes.
export const RUNNER_ROAD = { width: 320, horizon: 104, feet: 178, focal: 18 };

export function projectLane(z: number, slot: number) {
  const p = RUNNER_ROAD.focal / (Math.max(-1.5, z) + RUNNER_ROAD.focal);
  const nearX = (slot + .5) * RUNNER_ROAD.width / 3;
  return { x: 161 + (nearX - 161) * p, y: RUNNER_ROAD.horizon + (RUNNER_ROAD.feet - RUNNER_ROAD.horizon) * p, p };
}
