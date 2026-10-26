import * as THREE from "three";
import { canvasTexture } from "../overworld/props";

const WIDTH = 320;
const FONT = "bold 40px 'Gaegu', sans-serif";
const LINE_HEIGHT = 44;
const cache = new Map<string, THREE.Texture>();

/** Keep the original lettering size and wrap long NPC barks inside their paper bubble. */
export function bubbleTex(text: string) {
  const cached = cache.get(text);
  if (cached) return cached;
  const measure = document.createElement("canvas").getContext("2d")!;
  measure.font = FONT;
  const lines: string[] = [];
  for (const paragraph of text.split("\n")) {
    let line = "";
    for (const word of paragraph.split(/\s+/).filter(Boolean)) {
      const candidate = line ? `${line} ${word}` : word;
      if (measure.measureText(candidate).width <= WIDTH - 40) {
        line = candidate;
        continue;
      }
      if (line) lines.push(line);
      line = "";
      // An unusually long word must fit too; never cut it off at the canvas edge.
      for (const char of Array.from(word)) {
        if (line && measure.measureText(line + char).width > WIDTH - 40) {
          lines.push(line);
          line = "";
        }
        line += char;
      }
    }
    lines.push(line);
  }
  const bodyHeight = 62 + (lines.length - 1) * LINE_HEIGHT;
  const width = Math.min(WIDTH - 6, Math.max(44, ...lines.map(line => measure.measureText(line).width + 32)));
  const tex = canvasTexture(WIDTH, bodyHeight + 34, g => {
    g.fillStyle = "#fffdf6";
    g.strokeStyle = "#17151f";
    g.lineWidth = 4;
    g.beginPath();
    g.roundRect((WIDTH - width) / 2, 6, width, bodyHeight, 22);
    g.moveTo(150, bodyHeight + 4);
    g.lineTo(160, bodyHeight + 26);
    g.lineTo(172, bodyHeight + 4);
    g.fill();
    g.stroke();
    g.fillStyle = "#fffdf6";
    g.fillRect(152, bodyHeight, 18, 6);
    g.fillStyle = "#17151f";
    g.font = FONT;
    g.textAlign = "center";
    g.textBaseline = "middle";
    lines.forEach((line, i) => g.fillText(line, WIDTH / 2, 38 + i * LINE_HEIGHT));
  });
  tex.userData.shared = true;
  cache.set(text, tex);
  return tex;
}

/** Preserve the text's proportions and grow upwards, leaving the tail above its speaker. */
export function setBubbleText(sprite: THREE.Sprite, text: string) {
  const texture = bubbleTex(text);
  const image = texture.image as HTMLCanvasElement;
  sprite.material.map = texture;
  sprite.material.needsUpdate = true;
  sprite.scale.y = sprite.scale.x * image.height / image.width;
  sprite.center.set(0.5, 48 / image.height);
}

export const speechDuration = (text: string, minimum: number) => Math.max(minimum, text.length / 18);
