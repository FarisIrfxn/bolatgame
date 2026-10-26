import { defineConfig, normalizePath } from "vite";
import { readFile, readdir, stat } from "node:fs/promises";
import { createHash } from "node:crypto";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const assetsModule = "\0virtual:game-assets";
const publicDir = fileURLToPath(new URL("./public", import.meta.url));
const gameAssetDir = join(publicDir, "assets");
let isBuild = false;

export default defineConfig({
  plugins: [{
    name: "game-asset-manifest",
    configResolved(config) { isBuild = config.command === "build"; },
    configureServer(server) {
      server.watcher.add(gameAssetDir);
      server.watcher.on("all", (_event, path) => {
        if (!normalizePath(path).startsWith(`${normalizePath(gameAssetDir)}/`)) return;
        const module = server.moduleGraph.getModuleById(assetsModule);
        if (module) server.moduleGraph.invalidateModule(module);
        server.ws.send({ type: "full-reload" });
      });
    },
    resolveId(id) { if (id === "virtual:game-assets") return assetsModule; },
    async load(id) {
      if (id !== assetsModule) return;
      const assets: { url: string; bytes: number }[] = [];
      const revision = createHash("sha256");
      const walk = async (directory: string, relative = "") => {
        if (isBuild) this.addWatchFile(directory);
        const items = await readdir(directory, { withFileTypes: true });
        for (const item of items.sort((a, b) => a.name.localeCompare(b.name))) {
          const path = join(directory, item.name);
          const name = `${relative}/${item.name}`;
          if (item.isDirectory()) await walk(path, name);
          else if (item.isFile()) {
            if (isBuild) this.addWatchFile(path);
            assets.push({ url: name.split("/").map(encodeURIComponent).join("/"), bytes: (await stat(path)).size });
            revision.update(name).update(createHash("sha256").update(await readFile(path)).digest());
          }
        }
      };
      // Browser-owned favicon/manifest requests can race a fetch for the same URL.
      // Gate on the complete game asset set; browser chrome loads its own icons.
      await walk(gameAssetDir, "/assets");
      assets.sort((a, b) => a.url.localeCompare(b.url));
      return `export const version = ${JSON.stringify(revision.digest("hex"))}; export default ${JSON.stringify(assets)};`;
    },
  }],
  server: { port: 5181 },
  // `npm run serve` (serve.mjs) serves the production build on 5180, which the Cloudflare tunnel
  // (qish.durioo.app) points at. The dev server stays on 5181.
  build: {
    chunkSizeWarningLimit: 1500,
    rollupOptions: {
      output: {
        // Big libraries in their own files so the browser caches them across game updates.
        manualChunks: { three: ["three"], phaser: ["phaser"] },
      },
    },
  },
});
