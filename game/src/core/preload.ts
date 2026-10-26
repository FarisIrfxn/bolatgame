import assets from "virtual:game-assets";
import { openAssetCache } from "./assetCache";

export interface DownloadProgress { loaded: number; total: number }

/** Download the full game into cache without retaining every body in JS memory. */
export function createAssetDownload() {
  const completed = new Set<string>();
  const loaded = new Map<string, number>();
  const attempted = new Set<string>();
  const total = assets.reduce((sum, asset) => sum + asset.bytes, 0);
  let running: Promise<void> | null = null;
  const persistentCache = openAssetCache();

  return {
    run(onProgress: (progress: DownloadProgress) => void): Promise<void> {
      if (running) return running;
      const report = () => onProgress({ loaded: [...loaded.values()].reduce((sum, n) => sum + n, 0), total });
      const pending = assets.filter((asset) => !completed.has(asset.url));
      let next = 0;
      const failures: string[] = [];
      report();
      const worker = async () => {
        const cache = await persistentCache;
        while (next < pending.length) {
          const asset = pending[next++];
          const controller = new AbortController();
          const timeout = window.setTimeout(() => controller.abort(), 45000);
          let reader: ReadableStreamDefaultReader<Uint8Array> | undefined;
          try {
            loaded.set(asset.url, 0);
            const mode = attempted.has(asset.url) ? "reload" : "default";
            attempted.add(asset.url);
            const cached = mode !== "reload" ? await cache?.match(asset.url) : undefined;
            const response = cached ?? await fetch(asset.url, { cache: mode, signal: controller.signal });
            if (!response.ok) throw new Error(`HTTP ${response.status}: ${asset.url}`);
            // Cache consumes a clone alongside the progress reader, with at most
            // six files in flight. No full-game ArrayBuffer is retained in JS.
            const stored = cache && !cached ? cache.put(asset.url, response.clone()).then(() => null, error => error) : Promise.resolve(null);
            reader = response.body?.getReader();
            let received = 0;
            if (reader) {
              while (true) {
                const part = await reader.read();
                if (part.done) break;
                received += part.value.byteLength;
                loaded.set(asset.url, Math.min(asset.bytes, received));
                report();
              }
            } else received = (await response.arrayBuffer()).byteLength;
            if (received !== asset.bytes) throw new Error(`Incomplete asset: ${asset.url}`);
            const storageError = await stored;
            if (storageError) console.warn("Asset could not be persisted", asset.url, storageError);
            loaded.set(asset.url, asset.bytes);
            completed.add(asset.url);
          } catch (error) {
            await cache?.delete(asset.url);
            loaded.delete(asset.url);
            failures.push(asset.url);
            console.warn("Asset download failed", asset.url, error);
          } finally {
            reader?.releaseLock();
            window.clearTimeout(timeout);
            report();
          }
        }
      };
      running = Promise.all(Array.from({ length: 6 }, worker)).then(() => {
        if (failures.length) throw new Error(`${failures.length} assets failed to download`);
      }).finally(() => { running = null; });
      return running;
    },
  };
}
