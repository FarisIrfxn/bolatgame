"""Turn one image into a textured GLB with Pixal3D or TRELLIS.2 on the local ComfyUI.

  python gen3d.py art/props/myvi.png --out art/3d --optimize      # game preset, TRELLIS.2
  python gen3d.py art/props/myvi.png --backend pixal --preset hero

The input works best as one object, whole, centred on a plain background (qwen_gen.py
--t2i makes those). Background removal runs first. Graph: workflows/api/image_to_3d.json,
captured from the stock "Pixal3D & TRELLIS.2: Image to Model" template.

Presets (faces / texture / normal map / AO / upsample res):
  game  20k / 1024 / 1024 / 512 / 1024   small web-ready props (default)
  hero  60k / 2048 / 2048 / 1024 / 1536  centrepieces seen up close
  full  700k / 4096 / 2048 / 1024 / 1536 the template's own settings

Pass --optimize to also write <name>.web.glb (webp textures + meshopt) via gltf-transform.
Run with the ComfyUI venv python.
"""
import argparse
import json
import shutil
import subprocess
import sys
import time
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from qwen_gen import COMFY, API_DIR, call, stage_image  # noqa: E402

PRESETS = {
    "game": dict(faces=20_000, texture=1024, normal=1024, ao=512, upsample=1024),
    "hero": dict(faces=60_000, texture=2048, normal=2048, ao=1024, upsample=1536),
    "full": dict(faces=700_000, texture=4096, normal=2048, ao=1024, upsample=1536),
}
# Node ids in the captured graph.
N = dict(image="122", use_trellis="316", decimate="186", texture="288", normal="224", ao="233",
         upsample="94", seeds=("3", "12", "18", "23"), save="322",
         previews=("246", "247", "323", "282", "262", "261"))
GLTF_TRANSFORM = ["npx", "--yes", "@gltf-transform/cli@4.1.1"]


def build(args) -> dict:
    g = json.loads((API_DIR / "image_to_3d.json").read_text())
    p = PRESETS[args.preset]
    g[N["image"]]["inputs"]["image"] = stage_image(args.image.resolve())
    g[N["use_trellis"]]["inputs"]["value"] = args.backend == "trellis"
    g[N["decimate"]]["inputs"]["target_face_count"] = args.faces or p["faces"]
    g[N["texture"]]["inputs"]["value"] = p["texture"]
    g[N["normal"]]["inputs"]["resolution"] = p["normal"]
    g[N["ao"]]["inputs"]["resolution"] = p["ao"]
    g[N["upsample"]]["inputs"]["target_resolution"] = p["upsample"]
    for nid in N["seeds"]:
        g[nid]["inputs"]["seed"] = args.seed + int(nid)
    g[N["save"]]["inputs"]["filename_prefix"] = f"pokelove3d/{args.name}"
    for nid in N["previews"]:  # intermediate previews the UI shows; not needed headless
        g.pop(nid, None)
    return g


def run(g: dict, port: int, timeout: float = 3600) -> Path:
    prompt_id = call(port, "/prompt", {"prompt": g})["prompt_id"]
    deadline = time.time() + timeout
    while time.time() < deadline:
        entry = call(port, f"/history/{prompt_id}").get(prompt_id)
        if entry and entry.get("status", {}).get("completed"):
            out = entry["outputs"][N["save"]]
            item = next(v[0] for v in out.values() if isinstance(v, list) and v and isinstance(v[0], dict))
            return COMFY / "output" / item.get("subfolder", "") / item["filename"]
        if entry and entry.get("status", {}).get("status_str") == "error":
            msgs = [m for m in entry["status"].get("messages", []) if m[0] == "execution_error"]
            sys.exit(json.dumps(msgs, indent=1)[:3000])
        time.sleep(1)
    sys.exit(f"timed out waiting for {prompt_id}")


def optimize(glb: Path, texture: int) -> Path:
    web = glb.with_suffix(".web.glb")
    subprocess.run([*GLTF_TRANSFORM, "optimize", str(glb), str(web), "--compress", "meshopt",
                    "--texture-compress", "webp", "--texture-size", str(texture), "--simplify", "false"],
                   check=True, capture_output=True)
    return web


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("image", type=Path)
    ap.add_argument("--backend", choices=["trellis", "pixal"], default="trellis")
    ap.add_argument("--preset", choices=PRESETS, default="game")
    ap.add_argument("--faces", type=int, help="override the preset's face count")
    ap.add_argument("--seed", type=int, default=42)
    ap.add_argument("--name", help="output name (default: image stem + backend)")
    ap.add_argument("--out", type=Path, help="copy the GLB into this folder")
    ap.add_argument("--optimize", action="store_true", help="also write a compressed .web.glb")
    ap.add_argument("--port", type=int, default=8188)
    args = ap.parse_args()
    args.name = args.name or f"{args.image.stem}_{args.backend}"

    t0 = time.time()
    glb = run(build(args), args.port)
    seconds = round(time.time() - t0, 1)
    if args.out:
        args.out.mkdir(parents=True, exist_ok=True)
        glb = Path(shutil.copy2(glb, args.out / glb.name))
    result = {"seconds": seconds, "glb": str(glb), "mb": round(glb.stat().st_size / 1e6, 1)}
    if args.optimize:
        web = optimize(glb, PRESETS[args.preset]["texture"])
        result |= {"web_glb": str(web), "web_mb": round(web.stat().st_size / 1e6, 2)}
    print(json.dumps(result))


if __name__ == "__main__":
    main()
