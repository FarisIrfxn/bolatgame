import { version } from "virtual:game-assets";

/** Persist full downloads and serve them to image, GLTF and audio consumers alike. */
export async function openAssetCache(): Promise<Cache | null> {
  if (!("serviceWorker" in navigator) || !("caches" in window) || !window.isSecureContext) return null;
  try {
    await navigator.serviceWorker.register(`/asset-cache.js?v=${version}`, { scope: "/", updateViaCache: "none" });
    await new Promise<void>((resolve, reject) => {
      const ready = () => {
        const controller = navigator.serviceWorker.controller;
        if (controller && new URL(controller.scriptURL).searchParams.get("v") === version) {
          window.clearTimeout(timeout);
          navigator.serviceWorker.removeEventListener("controllerchange", ready);
          resolve();
        }
      };
      const timeout = window.setTimeout(() => {
        navigator.serviceWorker.removeEventListener("controllerchange", ready);
        reject(new Error("Asset cache activation timed out"));
      }, 10000);
      navigator.serviceWorker.addEventListener("controllerchange", ready);
      ready();
    });
    return await caches.open(`bolat-assets-${version}`);
  } catch (error) {
    // Storage may be disabled in a private browser. Full download still works
    // through the HTTP cache; never make storage permission a requirement.
    console.warn("Persistent asset cache unavailable; using the browser cache", error);
    return null;
  }
}
