"""Make the zone's seamless hand-painted ground/material textures (Qwen T2I + seamless.py).

  python texture_kit.py grass dirt        # writes art/textures/<name>.png (512, tileable)
Then convert to game/public/assets/textures/<name>.webp (PIL, quality 88) and add the name to
NAMES in game/src/overworld/textures.ts. Flat surfaces (plaster, tar) come out as icon sheets from
T2I; paint those procedurally with numpy noise instead (see docs/ZONE_ART_GUIDE.md).
"""
import json, subprocess, sys
from pathlib import Path
TOOLS = Path(__file__).resolve().parent
P = "/mnt/storage/Projects/Comfy/.venv/bin/python"
BASE = ("The image is a square seamless tileable hand-painted stylized game texture, viewed perfectly straight from above with flat even lighting and no perspective, "
        "painted like a cosy hand-painted 3D adventure game texture: soft painterly brush strokes, gentle light-to-dark colour variation, "
        "saturated cheerful colours, clean readable shapes, no harsh noise. The pattern fills the whole frame edge to edge evenly with no border, no vignette, "
        "no objects, no shadows from outside, no text. ")
TEX = {
  "airport_concrete": "An unmarked airport apron concrete surface, cool pale silver-grey with a faint blue-lilac undertone, soft broad trowelled brush strokes and fine cement grain, very subtle irregular cloud-like curing variation. Completely continuous material without lines, paving blocks, cobbles, bricks, tile grid or rectangular panels. No aircraft, no buildings, no yellow markings, no objects. All lighting is painted gently into the material, uniform exposure.",
  "circuit_concrete": "A continuous pedestrian concourse concrete surface at a modern motor racing circuit. Light warm pearl-grey cast concrete with delicate aggregate flecks, broad subtle cloudy patches and painterly brushed mineral grain. Calm neutral grey rather than yellow sand, no bricks, no stone blocks, no tiles, no grout, no grid, no stripes, no symbols, no objects. The material fills the entire square uninterrupted.",
  "bb_pavers": "It shows a Kuala Lumpur pedestrian pavement made of many small rounded rectangular concrete pavers in an alternating woven pattern. Most pavers are warm pale grey, dusty rose and muted brick red, with softly painted bevel highlights and narrow lilac-grey joints. The scale is fine and walkable, not a stone wall, with subtle wear and colour variation.",
  "bilik_floor": "It shows wide wooden bedroom floorboards running horizontally in five calm even rows. The boards are painted warm ivory white with very pale blush-pink undertones and subtle hand-brushed pink-grey wood grain; seams are narrow and softly shaded pale rose, not black. Bright airy pink-and-white bedroom palette. No brown, orange or dark wood, no nails, no objects.",
  "grass": "It shows lush short lawn grass with visible detail: hundreds of small painted grass blade strokes in soft spring green and mid green, gentle darker green shading between blades, lighter warm yellow-green patches where the sun hits, a few tiny white clover flowers. Natural soft greens, not neon.",
  "dirt": "It shows a soft sandy dirt path: warm light tan and peach sand with gentle painted patches, a few small rounded pebbles in cream and light brown.",
  "planks": "It shows weathered wooden floor planks running horizontally in six even rows: warm honey-brown wood with painted grain lines, rounded plank edges with bright highlights on top edges and darker gaps between planks, a few small nail dots.",
  "bricks": "It shows a sandstone block wall: rows of rounded rectangular stone blocks in warm beige, tan and light brown, painted soft highlights on the top edge of each block and darker mortar gaps.",
  "rooftiles": "It shows clay roof tiles in neat overlapping horizontal rows: dusty plum-mauve tiles with rounded scalloped lower edges, lighter painted highlight on each tile top and a darker shade under each row.",
  "plaster": "It shows a plain smooth cream plaster wall surface only: warm off-white and pale peach with very subtle soft painted mottling and faint brush strokes. Completely plain, no pattern, no shapes, no icons.",
  "tar": "It shows a plain old country road asphalt surface only: warm mid grey with gentle painted mottling, fine tiny lighter grit specks and one or two faint darker patched areas. Completely plain, no markings, no shapes, no icons.",
  "foliage": "It shows a dense mass of leafy tree foliage: many overlapping rounded leaf clumps in rich greens, lighter yellow-green painted highlights on top of each clump and deeper green shade between them.",
  "water": "It shows stylized clear tropical water: bright cyan and turquoise with soft painted lighter ripple shapes and a few white sparkle strokes.",
  "thatch": "It shows woven pandan mat (tikar) texture: interlaced cream and soft red woven strips in a neat checker weave with painted highlights.",
}
which = sys.argv[1:] or list(TEX)
for k in which:
    swatch = TOOLS.parents[1] / "art/textures/world-qc-v2" / f"{k}.txt"
    prompt = swatch.read_text() if k in ("airport_concrete", "circuit_concrete") and swatch.exists() else BASE + TEX[k]
    seed = "953" if k in ("airport_concrete", "circuit_concrete") else "91"
    r = subprocess.run([P, str(TOOLS / "qwen_gen.py"), "--t2i", "--prompt", prompt, "--seed", seed, "--name", f"tex_{k}", "--out", "/mnt/storage/qish/art/textures/raw"], capture_output=True, text=True)
    out = json.loads(r.stdout.strip().splitlines()[-1])["outputs"][0]
    band = "0.08" if k in ("planks", "bricks", "rooftiles", "thatch", "bb_pavers") else "0.16"
    subprocess.run([P, str(TOOLS / "seamless.py"), out, f"/mnt/storage/qish/art/textures/{k}.png", "--size", "512", "--band", band], check=True, capture_output=True)
    print(k, "ok", r.stdout.strip().splitlines()[-1][:60])
