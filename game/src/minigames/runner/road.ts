// Native canvas layers: fixed scenery with a transparent road cutout, and a moving
// painted road plane. Both use the same measured boundary from bg_qishex.
import { projectLane, RUNNER_ROAD } from "./perspective";

const W = RUNNER_ROAD.width, H = 180;
const { horizon: HORIZON, feet: FEET, focal: FOCAL } = RUNNER_ROAD;
const EDGES = [
  [104, 154, 167], [124, 90, 228], [140, 46, 277], [156, 5, 311], [180, -58, 365],
] as const;
// Measured from the generated panorama after uniformly registering its vanishing
// point to the same (161,104) used by targets and the moving lane dividers.
const WIDE_EDGES = [
  [104, 153, 166], [124, 84, 235], [140, 54, 265], [156, 11, 307], [180, -90, 403],
] as const;

function edges(y: number, outline: typeof EDGES | typeof WIDE_EDGES) {
  const i = Math.min(outline.length - 2, Math.max(0, outline.findIndex((p, i) => i < outline.length - 1 && y <= outline[i + 1][0])));
  const a = outline[i], b = outline[i + 1], k = (y - a[0]) / (b[0] - a[0]);
  return [a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k];
}

export function runnerRoad(background: CanvasImageSource, texture: HTMLImageElement, span = W, panorama?: HTMLImageElement) {
  const wide = !!panorama && span > W + .1, pad = (span - W) / 2;
  const outline = wide ? WIDE_EDGES : EDGES;
  const shape = new Path2D();
  outline.forEach(([y, left], i) => i ? shape.lineTo(left, y) : shape.moveTo(left, y));
  [...outline].reverse().forEach(([y, , right]) => shape.lineTo(right, y));
  shape.closePath();
  const scenery = document.createElement("canvas"); scenery.width = Math.ceil(span * 4); scenery.height = H * 4;
  const fixed = scenery.getContext("2d")!; fixed.setTransform(4, 0, 0, 4, pad * 4, 0);
  if (wide) {
    const zoom = (180 - HORIZON) / (180 - 110);
    const height = H * zoom, width = height * panorama!.width / panorama!.height;
    fixed.drawImage(panorama!, 160 - width / 2, H - height, width, height);
  } else fixed.drawImage(background, 0, 0, W, H);
  fixed.globalCompositeOperation = "destination-out"; fixed.fill(shape);

  const surface = document.createElement("canvas"); surface.width = scenery.width; surface.height = H * 4;
  const road = surface.getContext("2d")!; road.setTransform(4, 0, 0, 4, pad * 4, 0);
  const stripe = (z0: number, z1: number, slot: number, halfWidth: number) => {
    const a = projectLane(z0, slot), b = projectLane(z1, slot);
    road.beginPath(); road.moveTo(a.x - a.p * halfWidth, a.y); road.lineTo(a.x + a.p * halfWidth, a.y);
    road.lineTo(b.x + b.p * halfWidth, b.y); road.lineTo(b.x - b.p * halfWidth, b.y); road.closePath(); road.fill();
  };
  return {
    draw(g: CanvasRenderingContext2D, distance: number) {
      road.clearRect(-pad, 0, span, H); road.save(); road.clip(shape);
      road.fillStyle = "#b9573e"; road.fill(shape);
      // Perspective texture sampling makes the asphalt itself move with the signs.
      for (let y = HORIZON + .25; y < H; y += .5) {
        const [left, right] = edges(y, outline);
        const z = FOCAL * (FEET - HORIZON) / (y - HORIZON) - FOCAL;
        const v = (((z + distance) % 18 + 18) % 18) / 18 * (texture.height - 1);
        road.drawImage(texture, 0, v, texture.width, 1, left, y, right - left, .6);
      }
      road.fillStyle = "#fff0ce";
      // Solid outer edges make the playable three-lane width unambiguous.
      for (const boundary of [-.5, 2.5]) stripe(-1.5, 350, boundary, .8);
      for (let z = -(distance % 12); z < 350; z += 12) {
        if (z + 4 < -1.5) continue;
        for (const divider of [.5, 1.5]) stripe(z, z + 4, divider, .75);
      }
      road.restore();
      g.drawImage(surface, -pad, 0, span, H);
      g.drawImage(scenery, -pad, 0, span, H);
    },
  };
}
