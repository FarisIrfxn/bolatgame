#!/usr/bin/env python3
"""Export the approved built-in Imagegen panoramas; do not regenerate or modify art."""
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[2]
SOURCE = ROOT / 'art/mobile-fullscreen-2026-10-27'
OUTPUT = ROOT / 'game/public/assets/mobile'
OUTPUT.mkdir(parents=True, exist_ok=True)
for name in ['title', 'bowat', 'bolat', 'snorlax', 'blep', 'megabowat', 'bolatex', 'qishex', 'finale', 'ending']:
    filename = name if name in ['title', 'ending'] else f'bg_{name}'
    with Image.open(SOURCE / f'{name}.png') as image:
        image.convert('RGB').save(OUTPUT / f'{filename}.webp', 'WEBP', quality=88, method=6)
    print(filename)
