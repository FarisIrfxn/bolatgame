"""Generate images with Qwen Image 2.1 on the local ComfyUI in one command.

Submits API-format graphs (workflows/api/*.json, captured from the stock templates)
straight to ComfyUI's /prompt. This skips comfy-cli's subgraph expansion, which
drops the raw-prompt link and made every enhancer-off run render an empty prompt.

  # edit: <image1> is the canvas / size source, more --image are references
  python qwen_gen.py --image canvas.png --image ref.png --enhance on --prompt-file p.txt --out art/x
  # text to image (isolated props): write a long observer-style description, enhancer off
  python qwen_gen.py --t2i --aspect 1:1 --prompt "The image is a square ..." --out art/props

--quality       30-step base model instead of the 8-step turbo (slower, rarely needed)
--enhance off   use the prompt as written (default). Fine for t2i.
--enhance on    Qwen3.5 rewrites the prompt first (+~15s). Needed for edits that build a
                new scene from references, otherwise the model just copies <image2>.
--enhance think enhancer with reasoning (+~60s); turnaround sheets.

Run with the ComfyUI venv python.
"""
import argparse
import hashlib
import json
import shutil
import sys
import time
import urllib.error
import urllib.request
import uuid
from pathlib import Path

COMFY = Path("/mnt/storage/Projects/Comfy/ComfyUI")
API_DIR = Path(__file__).resolve().parent.parent / "workflows/api"
BASE_UNET = "qwen_image_2.1_int8_convrot.safetensors"
ASPECTS = {"1:1": "1:1 (Square)", "2:3": "2:3 (Portrait Photo)", "3:2": "3:2 (Photo)",
           "3:4": "3:4 (Portrait Standard)", "4:3": "4:3 (Standard)", "9:16": "9:16 (Portrait Widescreen)",
           "16:9": "16:9 (Widescreen)", "21:9": "21:9 (Ultrawide)"}

# Node ids inside the captured graphs.
EDIT = dict(unet="459:451", encode="459:474", latent_switch="459:468", latent="459:456",
            prompt_switch="459:484", enhancer="459:500", batch="459:485", noise="459:504",
            sigmas="459:502", sampler="459:505", model="459:469", save="461")
T2I = dict(unet="459:451", encode="459:452", enhancer="459:471", preview="459:472", prompt_switch="459:474",
           noise="459:488", sigmas="459:484", sampler="459:486", model="459:490", res="13", save="461")


def stage_image(path: Path) -> str:
    """Copy an image into ComfyUI's input folder and return the name LoadImage sees."""
    # Different characters commonly have the same basename (idle_front/idle_side).
    # Comfy's input folder is shared, so the source path must be part of the key.
    identity = hashlib.sha1(str(path.resolve()).encode()).hexdigest()[:12]
    name = f"pl_{path.stem}_{identity}{path.suffix}"
    dest = COMFY / "input" / name
    if not dest.exists() or dest.stat().st_mtime < path.stat().st_mtime:
        shutil.copy2(path, dest)
    return name


def build_edit(args, prompt: str) -> dict:
    g = json.loads((API_DIR / "edit_turbo.json").read_text())
    ids = EDIT
    for nid in ("470", "508", "472"):  # template's own LoadImages and the compare preview
        g.pop(nid, None)
    encode, batch = g[ids["encode"]]["inputs"], g[ids["batch"]]["inputs"]
    for key in [k for k in encode if k.startswith("images.")]:
        del encode[key]
    batch.clear()
    for k, path in enumerate(args.image, start=1):
        nid = f"img{k}"
        g[nid] = {"class_type": "LoadImage", "inputs": {"image": stage_image(path.resolve())}}
        encode[f"images.image_{k}"] = [nid, 0]
        batch[f"images.image{k - 1}"] = [nid, 0]

    if args.size:
        w, h = (int(v) for v in args.size.lower().split("x"))
        g[ids["latent"]]["inputs"] |= {"width": w, "height": h}
        g[ids["latent_switch"]]["inputs"]["switch"] = True
    route_prompt(g, ids, args, prompt)
    return g


def build_t2i(args, prompt: str) -> dict:
    g = json.loads((API_DIR / "t2i_turbo.json").read_text())
    ids = T2I
    g[ids["res"]]["inputs"] |= {"aspect_ratio": ASPECTS[args.aspect], "megapixels": args.megapixels}
    route_prompt(g, ids, args, prompt)
    return g


def route_prompt(g: dict, ids: dict, args, prompt: str) -> None:
    """Feed the prompt through the enhancer, or straight into the encoder."""
    enhancer = g[ids["enhancer"]]["inputs"]
    enhancer |= {"prompt": prompt, "thinking": args.enhance == "think",
                 "max_length": args.max_tokens or (4096 if args.enhance == "think" else 1024)}
    if args.enhance == "off":
        g[ids["encode"]]["inputs"]["prompt"] = prompt
    else:
        g[ids["prompt_switch"]]["inputs"]["switch"] = True


def finish(g: dict, ids: dict, args, seed: int) -> None:
    g[ids["noise"]]["inputs"]["noise_seed"] = seed
    g[ids["enhancer"]]["inputs"]["sampling_mode.seed"] = seed
    g[ids["save"]]["inputs"]["filename_prefix"] = f"pokelove/{args.name}"
    if args.quality:
        g[ids["unet"]]["inputs"]["unet_name"] = BASE_UNET
        g[ids["sigmas"]] = {"class_type": "BasicScheduler", "inputs": {
            "scheduler": "simple", "steps": args.steps, "denoise": 1.0, "model": [ids["model"], 0]}}


def call(port: int, path: str, payload: dict | None = None) -> dict:
    req = urllib.request.Request(f"http://127.0.0.1:{port}{path}",
                                 data=json.dumps(payload).encode() if payload else None,
                                 headers={"Content-Type": "application/json"})
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            return json.loads(resp.read())
    except urllib.error.HTTPError as err:
        sys.exit(f"ComfyUI rejected the graph: {err.read().decode()[:3000]}")


def run(g: dict, port: int, save_node: str, timeout: float = 1800) -> list[Path]:
    prompt_id = call(port, "/prompt", {"prompt": g, "client_id": uuid.uuid4().hex})["prompt_id"]
    deadline = time.time() + timeout
    while time.time() < deadline:
        entry = call(port, f"/history/{prompt_id}").get(prompt_id)
        if entry and entry.get("status", {}).get("completed"):
            images = entry["outputs"][save_node]["images"]
            return [COMFY / "output" / im["subfolder"] / im["filename"] for im in images]
        if entry and entry.get("status", {}).get("status_str") == "error":
            msgs = [m for m in entry["status"].get("messages", []) if m[0] == "execution_error"]
            sys.exit(json.dumps(msgs, indent=1)[:3000])
        time.sleep(0.5)
    sys.exit(f"timed out waiting for {prompt_id}")


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--prompt")
    ap.add_argument("--prompt-file", type=Path)
    ap.add_argument("--image", type=Path, action="append", default=[],
                    help="edit mode; repeat. The first image is <image1> (canvas / size source)")
    ap.add_argument("--t2i", action="store_true", help="text to image, no reference images")
    ap.add_argument("--quality", action="store_true", help="base model with --steps steps instead of turbo")
    ap.add_argument("--steps", type=int, default=30)
    ap.add_argument("--enhance", choices=["off", "on", "think"], default="off")
    ap.add_argument("--max-tokens", type=int, help="enhancer budget (default 1024, 4096 with think)")
    ap.add_argument("--seed", type=int)
    ap.add_argument("--size", help="edit: WxH output instead of following image 1")
    ap.add_argument("--aspect", choices=ASPECTS, default="1:1", help="t2i only")
    ap.add_argument("--megapixels", type=float, default=1.0, help="t2i only")
    ap.add_argument("--name", default="qwen", help="output filename prefix")
    ap.add_argument("--out", type=Path, help="copy the result into this folder")
    ap.add_argument("--port", type=int, default=8188)
    args = ap.parse_args()

    prompt = args.prompt or (args.prompt_file.read_text().strip() if args.prompt_file else None)
    if not prompt:
        sys.exit("give --prompt or --prompt-file")
    if args.t2i == bool(args.image):
        sys.exit("--t2i takes no --image; edit mode needs at least one")
    if len(args.image) > 10:
        sys.exit("at most 10 images")

    seed = args.seed if args.seed is not None else int(time.time()) % 1_000_000
    ids = T2I if args.t2i else EDIT
    g = build_t2i(args, prompt) if args.t2i else build_edit(args, prompt)
    finish(g, ids, args, seed)

    t0 = time.time()
    outputs = run(g, args.port, ids["save"])
    if args.out:
        args.out.mkdir(parents=True, exist_ok=True)
        outputs = [Path(shutil.copy2(o, args.out / o.name)) for o in outputs]
    print(json.dumps({"seconds": round(time.time() - t0, 1), "seed": seed, "outputs": [str(o) for o in outputs]}))


if __name__ == "__main__":
    main()
