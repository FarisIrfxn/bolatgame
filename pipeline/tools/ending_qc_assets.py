#!/usr/bin/env python3
"""Export the reviewed Imagegen ending art without altering the source files."""
from pathlib import Path
from PIL import Image, ImageOps
ROOT = Path(__file__).resolve().parents[2]
SOURCE = ROOT / 'art/ending-qc-2026-10-27'
DEST = ROOT / 'game/public/assets/ending'
DEST.mkdir(parents=True, exist_ok=True)
for name in ('memory-friends', 'couple-happy', 'ensemble-poster'):
    image = Image.open(SOURCE / f'{name}.png').convert('RGB')
    image.thumbnail((1920, 1600), Image.Resampling.LANCZOS)
    image.save(DEST / f'{name}.webp', quality=91, method=6)
    print(name, image.size)
for name in ('couple-comic', 'ensemble-comic'):
    image = Image.open(ROOT / 'art/ending-comic-2026-10-27' / f'{name}.png').convert('RGB')
    image.thumbnail((1920, 1600), Image.Resampling.LANCZOS)
    image.save(DEST / f'{name}.webp', quality=93, method=6)
    print(name, image.size)
image = Image.open(SOURCE / 'candle.png').convert('RGBA')
assert image.getchannel('A').getextrema()[0] == 0, 'Candle must preserve transparency'
image = image.crop(image.getchannel('A').getbbox())
image.thumbnail((160, 640), Image.Resampling.LANCZOS)
image = ImageOps.expand(image, border=2, fill=(0,0,0,0))
image.save(DEST / 'candle.png', optimize=True)
print('candle', image.size)
