"""Lay the four style frames out as a labelled 2x2 comparison sheet."""
import sys
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

OUT_DIR = Path("/mnt/storage/Projects/Comfy/ComfyUI/output/pokelove")
DEST = Path("/mnt/storage/qish/art/style")
LABELS = {"A": "A · Paper Mario", "B": "B · Animal Crossing / Kirby",
          "C": "C · Captain Toad", "D": "D · Wind Waker"}

DEST.mkdir(parents=True, exist_ok=True)
tiles = []
for k, label in LABELS.items():
    src = sorted(OUT_DIR.glob(f"style_{k}_*.png"))[-1]
    im = Image.open(src).convert("RGB")
    im.save(DEST / f"style_{k}.png")
    tiles.append((label, im.resize((896, int(896 * im.height / im.width)), Image.LANCZOS)))

w, h = tiles[0][1].size
pad, bar = 16, 56
sheet = Image.new("RGB", (2 * w + 3 * pad, 2 * (h + bar) + 3 * pad), "#1d1b22")
draw = ImageDraw.Draw(sheet)
try:
    font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 30)
except OSError:
    font = ImageFont.load_default()
for i, (label, im) in enumerate(tiles):
    x = pad + (i % 2) * (w + pad)
    y = pad + (i // 2) * (h + bar + pad)
    draw.text((x + 4, y + 10), label, fill="#fff4e0", font=font)
    sheet.paste(im, (x, y + bar))
sheet.save(DEST / "style_compare.png")
print(DEST / "style_compare.png")
