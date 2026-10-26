"""Make a generated texture tile seamlessly by cross-fading its edges into the overflow beyond them.

  python seamless.py in.png out.png --size 512 [--band 0.14]

The tile keeps the top-left (1 - band) of the square; each edge band blends with the
pixels just past the opposite edge, so left/right and top/bottom meet without a seam.
Works best on organic textures (grass, dirt, foliage); keep bands narrow for bricks/planks.
"""
import argparse

import numpy as np
from PIL import Image


def make_seamless(img: Image.Image, band: float) -> Image.Image:
    a = np.asarray(img.convert("RGB"), dtype=np.float32)
    h, w, _ = a.shape
    s = min(h, w)
    b = int(s * band)
    t = s - b  # final tile size
    out = a[:t, :t].copy()
    ramp = (np.arange(b, dtype=np.float32) / b)[None, :, None]
    # Horizontal: columns 0..b blend from the overflow (t..t+b) into the tile itself.
    out[:, :b] = a[:t, t : t + b] * (1 - ramp) + out[:, :b] * ramp
    # Vertical, using the horizontally fixed rows for the overflow too.
    over = a[t : t + b, :t].copy()
    over[:, :b] = a[t : t + b, t : t + b] * (1 - ramp) + over[:, :b] * ramp
    ramp_v = ramp.transpose(1, 0, 2)
    out[:b] = over * (1 - ramp_v) + out[:b] * ramp_v
    return Image.fromarray(np.clip(out, 0, 255).astype(np.uint8))


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("src")
    ap.add_argument("dst")
    ap.add_argument("--size", type=int, default=512)
    ap.add_argument("--band", type=float, default=0.14)
    args = ap.parse_args()
    tile = make_seamless(Image.open(args.src), args.band).resize((args.size, args.size), Image.LANCZOS)
    tile.save(args.dst)
    print(args.dst)


if __name__ == "__main__":
    main()
