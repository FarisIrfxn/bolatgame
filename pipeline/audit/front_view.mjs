// Render a GLB straight from the front (orthographic, red line = centre, blue = every 10% of
// width) to measure where a door or a sign board sits.  node front_view.mjs model.glb out.png
const { chromium } = await import(process.env.PW_CORE ?? "/home/durioo/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core/index.mjs");
import http from "node:http"; import fs from "node:fs"; import path from "node:path";
const glb = process.argv[2], out = process.argv[3];
const root = "/mnt/storage/qish/game/node_modules";
const server = http.createServer((req, res) => {
  const u = decodeURIComponent(req.url.split("?")[0]);
  if (u === "/") { res.setHeader("content-type", "text/html"); return res.end(`<!doctype html><script type="importmap">{"imports":{"three":"/three/build/three.module.js","three/addons/":"/three/examples/jsm/"}}</script>
<script type="module">
import * as THREE from "three"; import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js"; import { MeshoptDecoder } from "three/addons/libs/meshopt_decoder.module.js";
const r = new THREE.WebGLRenderer({antialias:true,preserveDrawingBuffer:true}); r.setSize(1200,600); document.body.style.margin=0; document.body.appendChild(r.domElement);
const s = new THREE.Scene(); s.background = new THREE.Color(0xf4efe6); s.add(new THREE.HemisphereLight(0xffffff,0x999999,2.5));
const g = await new GLTFLoader().setMeshoptDecoder(MeshoptDecoder).loadAsync("/m.glb");
const box = new THREE.Box3().setFromObject(g.scene), c = box.getCenter(new THREE.Vector3()), sz = box.getSize(new THREE.Vector3());
g.scene.position.sub(c); s.add(g.scene);
const cam = new THREE.OrthographicCamera(-sz.x*0.55, sz.x*0.55, sz.x*0.275, -sz.x*0.275, 0.01, 100); cam.position.set(0, 0, sz.z*3); cam.lookAt(0,0,0);
// grid lines every 10% of width
for (let i=-5;i<=5;i++){ const l=new THREE.Mesh(new THREE.PlaneGeometry(sz.x*0.002, sz.y*2), new THREE.MeshBasicMaterial({color:i==0?0xff0000:0x3366ff})); l.position.set(i*sz.x*0.1,0,sz.z); s.add(l); }
r.render(s, cam); window.done = r.domElement.toDataURL();
</script>`); }
  const f = u === "/m.glb" ? glb : path.join(root, u);
  fs.readFile(f, (e, d) => { if (e) { res.statusCode = 404; return res.end(); } if (f.endsWith(".js")) res.setHeader("content-type","text/javascript"); res.end(d); });
}).listen(0);
const browser = await chromium.launch({ args: ["--use-angle=vulkan","--enable-features=Vulkan"] });
const page = await browser.newPage();
await page.goto(`http://127.0.0.1:${server.address().port}/`);
await page.waitForFunction(() => window.done, null, { timeout: 60000 });
fs.writeFileSync(out, Buffer.from((await page.evaluate(() => window.done)).split(",")[1], "base64"));
await browser.close(); server.close(); console.log(out);
