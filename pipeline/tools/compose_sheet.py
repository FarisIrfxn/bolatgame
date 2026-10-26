"""Compose single-view PNGs (transparent, cropped) into one turnaround row at a common height.

Usage:
    python compose_sheet.py <out_prefix> <view1.png> <view2.png> ... [--height 480]

Writes <out_prefix>_sheet.png (transparent) and <out_prefix>_sheet_white.png, and
re-saves each scaled view as <out_prefix>_view{i}.png so the per-view files stay in sync.
"""
import argparse

from PIL import Image


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("out_prefix")
    ap.add_argument("views", nargs="+")
    ap.add_argument("--height", type=int, default=480)
    ap.add_argument("--gap", type=int, default=60)
    a = ap.parse_args()

    views = []
    for path in a.views:
        im = Image.open(path).convert("RGBA")
        im = im.crop(im.getbbox())
        scale = a.height / im.height
        views.append(im.resize((round(im.width * scale), a.height), Image.LANCZOS))

    pad = a.gap
    width = sum(v.width for v in views) + a.gap * (len(views) - 1) + 2 * pad
    sheet = Image.new("RGBA", (width, a.height + 2 * pad), (0, 0, 0, 0))
    x = pad
    for i, v in enumerate(views, 1):
        sheet.alpha_composite(v, (x, pad))
        v.save(f"{a.out_prefix}_view{i}.png")
        x += v.width + a.gap
    sheet.save(f"{a.out_prefix}_sheet.png")
    white = Image.new("RGBA", sheet.size, "white")
    white.alpha_composite(sheet)
    white.convert("RGB").save(f"{a.out_prefix}_sheet_white.png")
    print(sheet.size)


if __name__ == "__main__":
    main()
