#!/usr/bin/env python3
"""Resize the approved Bowat Imagegen master into browser and home-screen icons."""
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[2]
SOURCE = ROOT / "art/app-icon/bowat-source.png"
PUBLIC = ROOT / "game/public"
DEST = PUBLIC / "icons"
DEST.mkdir(parents=True, exist_ok=True)

image = Image.open(SOURCE).convert("RGB")
assert image.width == image.height, "App icon master must be a full-bleed square"
for size in (16, 32, 180, 192, 512):
    image.resize((size, size), Image.Resampling.LANCZOS).save(
        DEST / f"bowat-{size}.png", optimize=True
    )
image.resize((48, 48), Image.Resampling.LANCZOS).save(
    PUBLIC / "favicon.ico", sizes=[(16, 16), (32, 32), (48, 48)]
)
print("Exported Bowat favicon and 5 PNG app icons")
