import Phaser from "phaser";
import type { BossId } from "../content/bosses";

export const PIXEL_FONT = "VT323";
export const PIXEL_TITLE = "Press Start 2P";
export const RETRO_ROOT = "/assets/retro";
export const PIXEL_CHARACTERS = ["bowat", "bowatback", "faris", "bolat", "bolatex", "snorlax", "blep", "megabowat", "qishex", "megaqish", "busker", "cajon", "crowd"] as const;
export const PIXEL_ITEMS = ["cookie", "fart", "heart", "kiss", "cuddle", "alarm", "meat", "cake", "ramen", "malatang", "pot", "awning", "cloud", "sleep", "fire", "star", "camera", "film", "lily", "pass", "request", "resit", "spanner", "cardback", "playerplane", "enemyplane"] as const;
export type PixelCharacter = typeof PIXEL_CHARACTERS[number];
export type PixelItem = typeof PIXEL_ITEMS[number];
export const bossArt = (id: BossId) => `${RETRO_ROOT}/${id === "finale" ? "faris" : id}_idle.png`;

/** Small native pixel textures; aliases keep the existing hitboxes and game rules intact. */
export function preloadRetro(scene: Phaser.Scene, boss: BossId, aliases: Record<string, string> = {}) {
  scene.load.image("px_background", `${RETRO_ROOT}/bg_${boss}.png`);
  for (const id of PIXEL_CHARACTERS) scene.load.spritesheet(`px_${id}`, `${RETRO_ROOT}/${id}.png`, { frameWidth: 96, frameHeight: 96 });
  for (const id of PIXEL_ITEMS) scene.load.image(`px_${id}`, `${RETRO_ROOT}/item_${id}.png`);
  // Player movement art is protected: use the approved smooth doodles, including in minigames.
  for (let i = 0; i < 4; i++) scene.load.image(`qish_side_walk_${i}`, `/assets/chars/qish_side_walk_${i}.png`);
  for (const [key, value] of Object.entries(aliases)) {
    scene.load.image(key, key.startsWith("qish_") ? `/assets/chars/${key}.png` : `${RETRO_ROOT}/${value}.png`);
  }
}

export function retroBackdrop(scene: Phaser.Scene) {
  return scene.add.image(0, 0, "px_background").setOrigin(0).setDisplaySize(1280, 720).setDepth(-1000);
}

export function pixelPanel(scene: Phaser.Scene, x: number, y: number, w: number, h: number, accent = 0x77d8ca) {
  return scene.add.graphics().fillStyle(0x0a1029).fillRect(x + 4, y + 4, w, h)
    .fillStyle(0x172642, 0.98).fillRect(x, y, w, h)
    .lineStyle(4, accent).strokeRect(x + 2, y + 2, w - 4, h - 4)
    .lineStyle(2, 0x334c73).strokeRect(x + 8, y + 8, w - 16, h - 16);
}

export function pixelItem(scene: Phaser.Scene, id: PixelItem, x: number, y: number, size: number) {
  return scene.add.image(x, y, `px_${id}`).setDisplaySize(size, size);
}

export function pixelPose(image: Phaser.GameObjects.Image, id: PixelCharacter, pose: "idle" | "action" | "hurt" | "win") {
  image.setTexture(`px_${id}`, { idle: 0, action: 1, hurt: 2, win: 3 }[pose]);
}

const plain = (s: string) => s.replace(/🍪/gu, "COOKIE").replace(/⚖️?/gu, "").replace(/❤️?/gu, "<3").replace(/\p{Extended_Pictographic}/gu, "").replace(/\uFE0F/gu, "");

/** Style newly spawned score labels too. No screen filter: pixels come from native art. */
export function styleRetroScene(scene: Phaser.Scene) {
  const walk = (objects: Phaser.GameObjects.GameObject[]) => {
    for (const obj of objects) {
      if (obj instanceof Phaser.GameObjects.Container) walk(obj.list);
      if (!(obj instanceof Phaser.GameObjects.Text)) continue;
      if (!obj.getData("pixelStyled")) {
        obj.setFontFamily(PIXEL_FONT).setFontStyle("normal").setStroke("#101a30", 4);
        obj.setShadow(3, 3, "#101a30", 0, false, true);
        obj.setData("pixelStyled", true);
      }
      const text = plain(obj.text);
      if (text !== obj.text) obj.setText(text);
    }
  };
  scene.textures.getTextureKeys().forEach(k => scene.textures.get(k).setFilter(k.startsWith("qish_") ? Phaser.Textures.FilterMode.LINEAR : Phaser.Textures.FilterMode.NEAREST));
  walk(scene.children.list);
  scene.events.on(Phaser.Scenes.Events.POST_UPDATE, () => walk(scene.children.list));
}
