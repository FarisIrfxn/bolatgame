import Phaser from "phaser";
import type { BossId } from "../content/bosses";
import { paperBorder } from "../core/paperBorder";
import { input } from "../core/input";

export const ART_ROOT = "/assets/storybook";
const CHARACTERS = ["bowat", "bowatback", "faris", "bolat", "bolatex", "snorlax", "blep", "megabowat", "qishex", "megaqish", "busker", "cajon", "crowd"] as const;
const ITEMS = ["cookie", "fart", "heart", "kiss", "cuddle", "alarm", "meat", "cake", "ramen", "malatang", "pot", "awning", "cloud", "sleep", "fire", "star", "camera", "film", "lily", "pass", "request", "resit", "spanner", "cardback", "playerplane", "enemyplane"] as const;
export type IllustratedCharacter = typeof CHARACTERS[number];
export type IllustratedItem = typeof ITEMS[number];
export const bossArt = (id: BossId) => id === "blep" ? "/assets/chars/babah_front.png" : `${ART_ROOT}/${id === "finale" ? "faris" : id}_idle.png`;

// Each Phaser scene only needs its own art. Loading every sheet and item for
// every boss decoded and outlined dozens of unused images on top of the world.
const SCENE_ART: Record<BossId, { characters: IllustratedCharacter[]; items: IllustratedItem[] }> = {
  bowat: { characters: ["bowat"], items: ["awning"] },
  bolat: { characters: ["bolat", "faris"], items: ["heart", "kiss", "cuddle"] },
  snorlax: { characters: ["snorlax"], items: ["alarm", "meat", "cake", "ramen", "malatang", "cookie"] },
  blep: { characters: ["blep"], items: ["enemyplane", "playerplane", "cloud"] },
  megabowat: { characters: ["megabowat"], items: ["pot", "fart"] },
  bolatex: { characters: ["bolatex"], items: [] },
  qishex: { characters: [], items: [] },
  finale: { characters: ["faris", "megaqish"], items: ["fire", "heart"] },
};

/** Smooth art shares the original hitboxes, input and assist rules. */
export function preloadStorybook(scene: Phaser.Scene, boss: BossId, aliases: Record<string, string> = {}) {
  scene.load.image("art_background", `${ART_ROOT}/bg_${boss}.webp`);
  scene.load.image("art_background_wide", `/assets/mobile/bg_${boss}.webp`);
  const { characters, items } = SCENE_ART[boss];
  for (const id of characters) scene.load.spritesheet(`art_${id}`, `${ART_ROOT}/${id}.png`, { frameWidth: 256, frameHeight: 256 });
  for (const id of items) scene.load.image(`art_${id}`, `${ART_ROOT}/item_${id}.png`);
  for (let i = 0; i < 4; i++) scene.load.image(`qish_side_walk_${i}`, `/assets/chars/qish_side_walk_${i}.png`);
  for (const [key, value] of Object.entries(aliases)) {
    const native = key.startsWith("babah_") || key.startsWith("qish_") || (boss === "bowat" && key.startsWith("bowat_"));
    scene.load.image(key, native ? `/assets/chars/${key}.png` : `${ART_ROOT}/${value}.png`);
  }
  // Bake borders before the scene creates images. Each pose/frame is processed separately,
  // with the same frame dimensions and alpha padding, so physics and animation stay aligned.
  scene.load.once(Phaser.Loader.Events.COMPLETE, () => {
    const sheets = characters.map(id=>`art_${id}`);
    const singles = [...Array.from({length:4},(_,i)=>`qish_side_walk_${i}`),
      ...Object.keys(aliases).filter(key=>/^(qish_|bowat_|faris_|crowd\d|busker$|cajon$)/.test(key))];
    for (const key of new Set([...sheets,...singles])) {
      if (!scene.textures.exists(key)) continue;
      const src=scene.textures.get(key).getSourceImage() as HTMLImageElement;
      const isSheet=sheets.includes(key);
      const canvas=paperBorder(src,isSheet?256:src.width,isSheet?256:src.height);
      scene.textures.remove(key);
      if (isSheet) {
        const texture=scene.textures.addCanvas(key,canvas);
        if (texture) scene.textures.addSpriteSheet("",texture,{frameWidth:256,frameHeight:256});
      } else scene.textures.addCanvas(key,canvas);
    }
    scene.data.set("paperOutlinedKeys",[...new Set([...sheets,...singles])]);
  });
}

export function illustratedBackdrop(scene: Phaser.Scene) {
  const normal = scene.add.image(640, 360, "art_background").setDepth(-1000);
  const wide = scene.add.image(640, 360, "art_background_wide").setDepth(-1000);
  const cover = (image: Phaser.GameObjects.Image, width: number, height: number) => {
    const scale = Math.max(width / image.width, height / image.height);
    image.setDisplaySize(image.width * scale, image.height * scale);
  };
  const sync = () => {
    const camera = scene.cameras.main;
    const width = camera.width || 1280;
    const height = camera.height || 720;
    const useWide = width / height > 1280 / 720 + .005;
    normal.setVisible(!useWide);
    wide.setVisible(useWide);
    cover(useWide ? wide : normal, width, height);
  };
  sync();
  scene.events.on("widearenaresize", sync);
  scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => scene.events.off("widearenaresize", sync));
  return normal;
}

type PaperBounds = { x: number; y: number; w: number; h: number };
/** A cream paper face, a second sheet beneath, a pink edge and a folded corner. */
export function paperPanel(scene: Phaser.Scene, x: number, y: number, w: number, h: number, _accent = 0xd996b0) {
  const bounds: PaperBounds[] = scene.data.get("paperBounds") ?? [];
  bounds.push({ x, y, w, h }); scene.data.set("paperBounds", bounds);
  const r = Math.min(17, h / 4);
  return scene.add.graphics()
    .fillStyle(0x714055, 0.14).fillRoundedRect(x + 3, y + 10, w, h, r)
    .fillStyle(0xd6a0b5).fillRoundedRect(x, y + 5, w, h, r)
    .fillStyle(0xfff2dc).fillRoundedRect(x + 2, y + 2, w - 4, h, r)
    .fillStyle(0xfff9ed).fillRoundedRect(x, y, w, h - 2, r)
    .lineStyle(2, 0xba839d).strokeRoundedRect(x, y, w, h - 2, r)
    .lineStyle(1, 0xe9ccd2).strokeRoundedRect(x + 6, y + 6, w - 12, h - 14, Math.max(4, r - 4))
    .fillStyle(0xf0d4d8).fillTriangle(x + w - 20, y + h - 3, x + w - 2, y + h - 21, x + w - 2, y + h - 3);
}

export function illustratedItem(scene: Phaser.Scene, id: IllustratedItem, x: number, y: number, size: number) {
  return scene.add.image(x, y, `art_${id}`).setDisplaySize(size, size);
}

/** A raised candy-like meter: soft shadow, cream rim, inset track and light on the fill. */
export function raisedMeter(scene: Phaser.Scene, x: number, y: number, w: number, h = 24, color = 0xec9bbb) {
  const rim = scene.add.graphics().setDepth(30);
  rim.fillStyle(0x70445b, .23).fillRoundedRect(x - 7, y - h / 2 + 7, w + 14, h + 12, (h + 12) / 2)
    .fillStyle(0xc28ba3).fillRoundedRect(x - 7, y - h / 2 - 3, w + 14, h + 12, (h + 12) / 2)
    .fillStyle(0xfff8eb).fillRoundedRect(x - 7, y - h / 2 - 6, w + 14, h + 12, (h + 12) / 2)
    .fillStyle(0xe7ceda).fillRoundedRect(x, y - h / 2, w, h, h / 2);
  const fill = scene.add.rectangle(x, y, w, h, color).setOrigin(0,.5).setDepth(31);
  const shine = scene.add.graphics().setDepth(32);
  const paint = () => {
    shine.clear();
    if (fill.width > 8) shine.fillStyle(0xffffff,.36).fillRoundedRect(x + 3, y - h / 2 + 3, fill.width - 6, Math.max(3,h * .25), 3);
  };
  const mask = scene.make.graphics({ x: 0, y: 0 }, false).fillRoundedRect(x,y-h/2,w,h,h/2);
  fill.setMask(mask.createGeometryMask());
  scene.events.on(Phaser.Scenes.Events.POST_UPDATE, paint);
  scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => mask.destroy());
  paint();
  return fill;
}
export function setPose(image: Phaser.GameObjects.Image, id: IllustratedCharacter, pose: "idle" | "action" | "hurt" | "win") {
  image.setTexture(`art_${id}`, { idle: 0, action: 1, hurt: 2, win: 3 }[pose]);
}

/** Dynamic labels use smooth typography and keep contrast on paper or scenery. */
export function styleIllustratedScene(scene: Phaser.Scene) {
  const walk = (objects: Phaser.GameObjects.GameObject[]) => {
    for (const obj of objects) {
      if (obj instanceof Phaser.GameObjects.Container) walk(obj.list);
      if (!(obj instanceof Phaser.GameObjects.Text) || obj.getData("paperStyled")) continue;
      const b = obj.getBounds();
      const bounds: PaperBounds[] = scene.data.get("paperBounds") ?? [];
      const onPaper = bounds.some(p => b.centerX >= p.x && b.centerX <= p.x + p.w && b.centerY >= p.y && b.centerY <= p.y + p.h);
      obj.setFontFamily(obj.style.fontFamily.includes("Bagel") ? "Bagel Fat One" : "Nunito").setFontStyle("bold");
      obj.setColor(onPaper ? "#754459" : "#fff8e9").setStroke(onPaper ? "#fff9ed" : "#75445c", onPaper ? 0 : 4);
      obj.setShadow(0, onPaper ? 0 : 3, "#67334c35", 3, false, true);
      obj.setData("paperStyled", true);
    }
  };
  scene.textures.getTextureKeys().forEach(k => scene.textures.get(k).setFilter(Phaser.Textures.FilterMode.LINEAR));
  walk(scene.children.list);
  const hints = new Map<Phaser.GameObjects.Text, { original: string; rendered: string }>();
  const syncHints = (objects: Phaser.GameObjects.GameObject[]) => {
    for (const obj of objects) {
      if (obj instanceof Phaser.GameObjects.Container) syncHints(obj.list);
      if (!(obj instanceof Phaser.GameObjects.Text)) continue;
      // Only explicit instruction copy, never dialogue or names.
      const old = hints.get(obj);
      if (old && obj.text !== old.rendered) hints.delete(obj);
      if (!hints.has(obj) && /(?:[Tt]ekan|[Tt]ahan) A\b/.test(obj.text)) hints.set(obj, { original: obj.text, rendered: obj.text });
      const hint = hints.get(obj);
      if (hint) {
        const next = hint.original.replace(/\bA\b/g, input.label("a"));
        if (obj.text !== next) obj.setText(next);
        hint.rendered = next;
      }
    }
  };
  scene.events.on(Phaser.Scenes.Events.POST_UPDATE, () => { syncHints(scene.children.list); walk(scene.children.list); });
}
