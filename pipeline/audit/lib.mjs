// Shared helpers for the zone audit scripts: open the dev game (npm run dev, port 5181) in a
// GPU-backed headless Chromium and jump to a zone through the secret dev panel.
//
// Needs playwright-core. Point PW_CORE at its index.mjs if the default below is gone
// (e.g. `npm i -D playwright-core` somewhere and use node_modules/playwright-core/index.mjs).

const PW = process.env.PW_CORE ?? "/home/durioo/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core/index.mjs";
const { chromium } = await import(PW);

export const GAME = process.env.GAME_URL ?? "http://localhost:5181/";

/** Dev-panel button labels per zone id (what `--zone` takes). */
export const ZONE_LABEL = {
  labulanjut: "Labu Lanjut",
  sunway: "Bukit Bintang",
  galeri: "Lorbel",
  dusun: "Tasik Lily",
  angkasa: "KLIA",
  cosyplace: "Nyomnyom",
  photobooth: "Photobooth",
  bukit: "Putrajaya",
  sepang: "Litar Sepang",
};

/** Launch, load a fresh save, and enter `zone`. `noMerge` keeps props unbaked (for measuring). */
export async function openZone(zone, { width = 1600, height = 900, noMerge = false, save = null } = {}) {
  const browser = await chromium.launch({ args: ["--use-angle=vulkan", "--enable-features=Vulkan", "--ignore-gpu-blocklist"] });
  const page = await browser.newPage({ viewport: { width, height } });
  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  // `save` overrides parts of the fresh save, e.g. { cards: [8], flags: { introSeen: true, endingSeen: true } } for Labu's party.
  await page.addInitScript(([noMerge, save]) => {
    if (noMerge) window.__noMerge = true;
    localStorage.setItem("pokelove-save-v1", JSON.stringify({ cards: [], flags: { introSeen: true }, vals: {}, recordingMode: false, handedOver: [], zone: "bilik", ...save }));
  }, [noMerge, save]);
  await page.goto(GAME, { waitUntil: "networkidle" });
  for (let i = 0; i < 6; i++) {
    await page.keyboard.press("Enter");
    await page.waitForTimeout(400);
  }
  await page.waitForTimeout(1500);
  await page.keyboard.press("Backquote");
  await page.waitForTimeout(400);
  await page.locator("button", { hasText: ZONE_LABEL[zone] ?? zone }).first().click();
  await page.waitForTimeout(4500);
  await page.locator("button", { hasText: "Tutup" }).first().click().catch(() => {});
  for (let i = 0; i < 12 && (await page.locator(".dialog").count()) > 0; i++) {
    await page.keyboard.press("Enter");
    await page.waitForTimeout(450);
  }
  return { browser, page, errors };
}

/** Stand Qish at (x, z) (dev builds expose window.__overworld). */
export async function teleport(page, x, z) {
  await page.evaluate(([x, z]) => window.__overworld.placePlayer(x, z, "front"), [x, z]);
  await page.waitForTimeout(1500);
}

export function args() {
  const out = { _: [] };
  const a = process.argv.slice(2);
  for (let i = 0; i < a.length; i++) {
    if (a[i].startsWith("--")) out[a[i].slice(2)] = a[i + 1]?.startsWith("--") || a[i + 1] === undefined ? true : a[++i];
    else out._.push(a[i]);
  }
  return out;
}
