// Static server for the production build (dist/), used behind the Cloudflare tunnel
// (qish.durioo.app -> localhost:5180). Hashed bundles are cached forever so Cloudflare's
// edge serves them; index.html is never cached so new builds show up immediately.
//
//   node serve.mjs            (after `npm run build`, or alongside `npm run watch`)

import { createReadStream, statSync } from "node:fs";
import { createServer } from "node:http";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(fileURLToPath(new URL(".", import.meta.url)), "dist");
const PORT = Number(process.env.PORT ?? 5180);

const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".png": "image/png",
  ".ico": "image/x-icon",
  ".webp": "image/webp",
  ".jpg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".json": "application/json",
  ".mp3": "audio/mpeg",
  ".ogg": "audio/ogg",
  ".wav": "audio/wav",
};

// Vite names bundles like index-B00pDuD0.js; those never change content.
const HASHED = /-[A-Za-z0-9_-]{8}\.(js|css)$/;

function cacheControl(path) {
  if (path.endsWith(".html")) return "no-cache";
  if (HASHED.test(path)) return "public, max-age=31536000, immutable";
  return "public, max-age=3600"; // art in public/assets: an hour, so re-exported art shows up soon
}

createServer((req, res) => {
  const url = decodeURIComponent((req.url ?? "/").split("?")[0]);
  let path = normalize(join(ROOT, url));
  if (!path.startsWith(ROOT)) {
    res.writeHead(403).end();
    return;
  }
  let stat;
  try {
    stat = statSync(path);
    if (stat.isDirectory()) {
      path = join(path, "index.html");
      stat = statSync(path);
    }
  } catch {
    res.writeHead(404, { "content-type": "text/plain" }).end("not found");
    return;
  }
  res.writeHead(200, {
    "content-type": TYPES[extname(path)] ?? "application/octet-stream",
    "content-length": stat.size,
    "cache-control": cacheControl(path),
  });
  if (req.method === "HEAD") res.end();
  else createReadStream(path).pipe(res);
}).listen(PORT, "127.0.0.1", () => console.log(`serving ${ROOT} on http://localhost:${PORT}`));
