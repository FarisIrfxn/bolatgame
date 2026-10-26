import * as THREE from "three";
import { canvasTexture } from "./props";

/** Persistent world hints for Myvi travel and post-game rematches, even from a distance. */
export function discoveryMarker(x: number, y: number, z: number, kind: "map" | "replay", visible?: () => boolean) {
  const tex = canvasTexture(144, 144, c => {
    c.shadowColor = "#9e6286"; c.shadowBlur = 12; c.shadowOffsetY = 5;
    c.fillStyle = "#ffcf48"; c.strokeStyle = "#a87b27"; c.lineWidth = 5;
    c.beginPath(); c.arc(72, 66, 53, 0, Math.PI * 2); c.fill(); c.stroke();
    c.shadowBlur = 0; c.shadowOffsetY = 0;
    c.fillStyle = "#694827"; c.textAlign = "center"; c.textBaseline = "middle";
    c.font = "900 86px Nunito, sans-serif"; c.fillText("!", 72, 69);
  });
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false, depthWrite: false }));
  sprite.position.set(x,y,z); sprite.scale.set(.88,.88,1); sprite.renderOrder = 8;
  sprite.userData.discovery = kind;
  return { sprite, update(t: number) {
    sprite.visible = visible?.() ?? true;
    sprite.position.y = y + Math.sin(t * 2.7) * .035;
  } };
}
