"""Render GLB files to a PNG contact sheet (4 angles each) with headless Chromium + three.js.

  python render_glb.py art/3d/a.web.glb art/3d/b.web.glb --out /tmp/compare.png

Uses the game's own three.js so what you see matches the game's loader (meshopt and
webp included). Lighting is a neutral warm key + lilac fill, close to the style-B look.
"""
import argparse
import base64
import functools
import http.server
import shutil
import socketserver
import subprocess
import tempfile
import threading
import time
from pathlib import Path

THREE = Path("/mnt/storage/qish/game/node_modules/three")
CHROME = next(Path.home().glob(".cache/ms-playwright/chromium_headless_shell-*/*/chrome-headless-shell"))
TILE = 384

PAGE = """<!doctype html><html><head><meta charset="utf-8">
<style>body{margin:0;background:#f4efe6;font:14px sans-serif}canvas{display:block}</style>
<script type="importmap">{"imports":{"three":"./three/build/three.module.js","three/addons/":"./three/examples/jsm/"}}</script>
</head><body><script>
const report = (path, body) => fetch(path, { method: "POST", body });
addEventListener("error", e => report("/error", String(e.message)));
addEventListener("unhandledrejection", e => report("/error", String(e.reason && e.reason.stack || e.reason)));
</script><script type="module">
import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { MeshoptDecoder } from "three/addons/libs/meshopt_decoder.module.js";
const files = __FILES__, T = __TILE__, angles = [35, 125, 215, 305];
const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
renderer.setSize(T * angles.length, T * files.length);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.setScissorTest(true);
document.body.appendChild(renderer.domElement);
const loader = new GLTFLoader().setMeshoptDecoder(MeshoptDecoder);
for (const [row, file] of files.entries()) {
  const gltf = await loader.loadAsync(file);
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(row % 2 ? 0xefe8dc : 0xf4efe6);
  scene.add(new THREE.HemisphereLight(0xfff4e0, 0xb7a6d9, 1.6));
  const sun = new THREE.DirectionalLight(0xfff0d8, 2.2); sun.position.set(3, 5, 4); scene.add(sun);
  const obj = gltf.scene, box = new THREE.Box3().setFromObject(obj);
  const size = box.getSize(new THREE.Vector3()).length(), centre = box.getCenter(new THREE.Vector3());
  obj.position.sub(centre); scene.add(obj);
  const cam = new THREE.PerspectiveCamera(30, 1, size / 100, size * 10);
  for (const [col, deg] of angles.entries()) {
    const a = THREE.MathUtils.degToRad(deg), r = size * 1.7;
    cam.position.set(Math.sin(a) * r, r * 0.45, Math.cos(a) * r); cam.lookAt(0, 0, 0);
    const y = T * (files.length - 1 - row);
    renderer.setViewport(col * T, y, T, T); renderer.setScissor(col * T, y, T, T);
    renderer.render(scene, cam);
  }
}
report("/png", renderer.domElement.toDataURL("image/png"));
</script></body></html>"""


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("glbs", type=Path, nargs="+")
    ap.add_argument("--out", type=Path, required=True)
    args = ap.parse_args()

    with tempfile.TemporaryDirectory() as tmp:
        root = Path(tmp)
        (root / "three").symlink_to(THREE)
        names = []
        for i, glb in enumerate(args.glbs):
            name = f"m{i}.glb"
            shutil.copy2(glb, root / name)
            names.append(name)
        page = PAGE.replace("__FILES__", repr(names)).replace("__TILE__", str(TILE))
        (root / "index.html").write_text(page)

        result: dict[str, str] = {}

        class Handler(http.server.SimpleHTTPRequestHandler):
            def log_message(self, *a):
                pass

            def do_POST(self):
                body = self.rfile.read(int(self.headers["Content-Length"])).decode()
                result[self.path.strip("/")] = body
                self.send_response(204)
                self.end_headers()

        handler = functools.partial(Handler, directory=tmp)
        with socketserver.TCPServer(("127.0.0.1", 0), handler) as httpd:
            threading.Thread(target=httpd.serve_forever, daemon=True).start()
            url = f"http://127.0.0.1:{httpd.server_address[1]}/index.html"
            chrome = subprocess.Popen([str(CHROME), "--headless", "--no-sandbox", "--use-angle=swiftshader",
                                       "--enable-unsafe-swiftshader", f"--window-size={TILE * 4},{TILE * len(names)}",
                                       "--remote-debugging-port=0", url],
                                      stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
            deadline = time.time() + 180
            while not result and time.time() < deadline:
                time.sleep(0.2)
            chrome.kill()
            httpd.shutdown()
        if "error" in result:
            raise SystemExit(f"render failed: {result['error']}")
        if "png" not in result:
            raise SystemExit("render timed out")
        args.out.write_bytes(base64.b64decode(result["png"].split(",", 1)[1]))
    print(args.out)


if __name__ == "__main__":
    main()
