"""Clean a generated turnaround sheet: remove the noisy background and split it into views.

Usage (needs numpy + scipy, e.g. the ComfyUI venv):
    python clean_sheet.py <in.png> <out_dir> <name> --mode lineart|color

Writes <name>_sheet.png (transparent), <name>_sheet_white.png, and <name>_view{1..N}.png.
"""
import argparse
import os

import numpy as np
from PIL import Image
from scipy import ndimage


def background_mask(lum, gap=12):
    """Pale pixels connected to the image border, treating small gaps in doodle outlines as closed."""
    walls = ndimage.binary_dilation(lum < 110, iterations=gap)
    labels, _ = ndimage.label(~walls)
    border = np.unique(np.concatenate([labels[0], labels[-1], labels[:, 0], labels[:, -1]]))
    bg = np.isin(labels, border[border != 0])
    # Grow back over the thickening, but only across pale pixels, so the real outline stays.
    return ndimage.binary_dilation(bg, iterations=gap + 1, mask=lum > 120)


def lineart_alpha(rgb):
    lum = rgb.mean(axis=2)
    bg = background_mask(lum)
    # Pure black ink over a white body fill; lines are near-black and the noise is pale.
    ink = np.clip((150 - lum) / 90.0, 0, 1)
    value = (255 * (1 - ink)).astype(np.uint8)
    alpha = np.where(bg, ink * 255, 255).astype(np.uint8)
    return np.dstack([value, value, value, alpha])


def color_alpha(rgb):
    lum = rgb.mean(axis=2)
    bg = background_mask(lum)
    return np.dstack([rgb, np.where(bg, 0, 255)]).astype(np.uint8)


def split_views(rgba, min_gap=20):
    cols = (rgba[..., 3] > 40).sum(axis=0) > 0
    runs, start = [], None
    for x, on in enumerate(cols):
        if on and start is None:
            start = x
        elif not on and start is not None:
            runs.append([start, x])
            start = None
    if start is not None:
        runs.append([start, len(cols)])
    merged = []
    for r in runs:
        if merged and r[0] - merged[-1][1] < min_gap:
            merged[-1][1] = r[1]
        else:
            merged.append(r)
    # Drop specks narrower than 40px.
    return [r for r in merged if r[1] - r[0] >= 40]


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("src")
    ap.add_argument("out_dir")
    ap.add_argument("name")
    ap.add_argument("--mode", choices=["lineart", "color"], required=True)
    a = ap.parse_args()

    rgb = np.asarray(Image.open(a.src).convert("RGB")).astype(np.float32)
    rgba = lineart_alpha(rgb) if a.mode == "lineart" else color_alpha(rgb.astype(np.uint8))
    os.makedirs(a.out_dir, exist_ok=True)
    sheet = Image.fromarray(rgba, "RGBA")
    sheet.save(os.path.join(a.out_dir, f"{a.name}_sheet.png"))
    white = Image.new("RGBA", sheet.size, "white")
    white.alpha_composite(sheet)
    white.convert("RGB").save(os.path.join(a.out_dir, f"{a.name}_sheet_white.png"))

    for i, (x0, x1) in enumerate(split_views(rgba), 1):
        part = rgba[:, x0:x1]
        rows = np.where((part[..., 3] > 40).any(axis=1))[0]
        crop = sheet.crop((x0, rows[0], x1, rows[-1] + 1))
        crop.save(os.path.join(a.out_dir, f"{a.name}_view{i}.png"))
        print(f"{a.name}_view{i}: {crop.size}")


if __name__ == "__main__":
    main()
