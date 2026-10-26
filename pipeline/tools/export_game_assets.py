"""Copy finished art into the game's public/assets folder at game-friendly sizes.

Run from anywhere with system python3 (needs Pillow):
    python3 pipeline/tools/export_game_assets.py
"""
from pathlib import Path

from PIL import Image, ImageChops, ImageDraw, ImageFilter

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / "game" / "public" / "assets"

# turnaround view index -> direction name used by the game (side views face right)
VIEWS = {1: "front", 3: "side", 4: "back"}
CHARS = ["qish", "faris", "bowat", "slothfaris", "babah"]
QISH_ART = ROOT / "art" / "chars" / "qish"
SLOTH_ART = ROOT / "art" / "chars" / "slothfaris"
BOWAT_ART = ROOT / "art" / "chars" / "bowat"


def export_chars():
    dest = OUT / "chars"
    dest.mkdir(parents=True, exist_ok=True)
    for name in CHARS:
        if name in ("faris", "babah"):
            folder = ROOT / "art/chars" / name
            if all((folder / f"idle_{direction}.png").exists() for direction in VIEWS.values()):
                export_human(dest, name)
                continue
            if name == "babah":  # No legacy turnaround; safe while a fresh art pass is still generating.
                continue
        if name == "qish" and (QISH_ART / "walk_front_sheet.png").exists():
            export_qish(dest)
            continue
        if name == "slothfaris" and (SLOTH_ART / "idle_front.png").exists():
            export_slothfaris(dest)
            continue
        if name == "bowat" and (BOWAT_ART / "walk_front_0.png").exists():
            export_bowat(dest)
            continue
        for idx, direction in VIEWS.items():
            src = ROOT / "art" / "turnaround" / f"{name}_view{idx}.png"
            im = Image.open(src).convert("RGBA")
            im = im.crop(im.getbbox())
            h = 512
            im = im.resize((round(im.width * h / im.height), h), Image.LANCZOS)
            im.save(dest / f"{name}_{direction}.png", optimize=True)


def key_white(im: Image.Image, neutral: bool = False, extras: bool = False) -> Image.Image:
    """White background -> alpha, flood-filled from the edges so the white collar stays.

    `neutral` only keys grey-white pixels, so a pale cream face behind a gappy outline survives.
    `extras` keeps detached marks too (Zzz, stars, a fart cloud), dropping only tiny specks.
    """
    im = im.convert("RGB")
    mask = im.convert("L").point(lambda v: 255 if v > 232 else 0)
    if neutral:
        r, g, b = im.split()
        lo = ImageChops.darker(ImageChops.darker(r, g), b)
        hi = ImageChops.lighter(ImageChops.lighter(r, g), b)
        grey = ImageChops.subtract(hi, lo).point(lambda v: 255 if v < 16 else 0)
        mask = ImageChops.multiply(mask, grey)
    flood = Image.new("L", (im.width + 2, im.height + 2), 255)
    flood.paste(mask, (1, 1))
    ImageDraw.floodfill(flood, (0, 0), 128)
    bg = flood.crop((1, 1, im.width + 1, im.height + 1)).point(lambda v: 255 if v == 128 else 0)
    # Soft edge: background-adjacent pale pixels fade by their lightness.
    light = im.convert("L").point(lambda v: max(0, min(255, (250 - v) * 12)))
    edge = bg.filter(ImageFilter.MaxFilter(5))
    alpha = Image.composite(Image.new("L", im.size, 0), Image.composite(light, Image.new("L", im.size, 255), edge), bg)
    out = im.convert("RGBA")
    out.putalpha(Image.composite(alpha, Image.new("L", im.size, 0), main_blob(alpha, 40 if extras else 0)))
    return out


def main_blob(alpha: Image.Image, min_cells: int = 0) -> Image.Image:
    """Mask of the largest opaque region, dropping stray marks bled in from neighbour frames.

    With `min_cells`, every region of at least that many 4 px cells is kept as well.
    """
    step = 4
    small = alpha.point(lambda a: 255 if a > 40 else 0).filter(ImageFilter.MaxFilter(3)).resize(
        (alpha.width // step, alpha.height // step), Image.Resampling.BOX)
    w, h = small.size
    on = [v > 0 for v in small.tobytes()]
    seen = [False] * len(on)
    best: list[int] = []
    for start in range(len(on)):
        if not on[start] or seen[start]:
            continue
        blob, stack = [], [start]
        seen[start] = True
        while stack:
            i = stack.pop()
            blob.append(i)
            x, y = i % w, i // w
            for j in (i - 1 if x else -1, i + 1 if x < w - 1 else -1, i - w if y else -1, i + w if y < h - 1 else -1):
                if j >= 0 and on[j] and not seen[j]:
                    seen[j] = True
                    stack.append(j)
        if min_cells and len(blob) >= min_cells:
            best = best + blob if len(best) >= len(blob) else blob + best
        elif len(blob) > len(best):
            best = blob
    keep = Image.new("L", (w, h), 0)
    px = keep.load()
    for i in best:
        px[i % w, i // w] = 255
    return keep.resize(alpha.size, Image.Resampling.NEAREST).filter(ImageFilter.MaxFilter(9))


def export_qish(dest: Path):
    """Cut four evenly spaced walk poses per direction into aligned paper sprites."""
    def align(cell: Image.Image, bounds=None) -> Image.Image:
        bounds = bounds or cell.getchannel("A").point(lambda a: 255 if a > 16 else 0).getbbox()
        if bounds is None:
            raise ValueError("Empty Qish frame")
        cutout = cell.crop(bounds)
        scale = min(480 / cutout.height, 486 / cutout.width)
        size = (round(cutout.width * scale), round(cutout.height * scale))
        cutout = cutout.resize(size, Image.Resampling.LANCZOS)
        canvas = Image.new("RGBA", (512, 512))
        canvas.alpha_composite(cutout, ((512 - size[0]) // 2, 506 - size[1]))
        return canvas

    # Idle poses (ComfyUI img2img from the walk frames, see README): one bounding box per
    # direction so the blink / laugh faces swap in pixel-aligned.
    for direction, faces in (("front", ("", "_blink", "_laugh")), ("side", ("", "_blink", "_laugh")), ("back", ("",))):
        cuts = [key_white(Image.open(QISH_ART / f"idle_{direction}{face}.png")) for face in faces]
        bounds = cuts[0].getchannel("A").point(lambda a: 255 if a > 16 else 0).getbbox()
        for face, cut in zip(faces, cuts):
            frame = align(cut, bounds)
            frame.save(dest / f"qish_{direction}{face}.png", optimize=True)

    for direction in ("front", "back", "side"):
        # Hair-outline repaired frames (ComfyUI img2img from walk_*_sheet.png, see README).
        for frame in range(4):
            canvas = align(key_white(Image.open(QISH_ART / f"walk_{direction}_{frame}.png")))
            canvas.save(dest / f"qish_{direction}_walk_{frame}.png", optimize=True)

    # Dialogue portraits: normal/excited came transparent; the rest are ComfyUI edits of normal on white.
    for src in sorted(QISH_ART.glob("portrait_*.png")):
        emotion = src.stem.removeprefix("portrait_")
        portrait = Image.open(src)
        opaque = portrait.mode != "RGBA" or portrait.getchannel("A").getextrema()[0] > 200
        portrait = key_white(portrait) if opaque else portrait.convert("RGBA")
        portrait.save(dest / f"qish_portrait_{emotion}.webp", "WEBP", quality=92, method=6)


def export_slothfaris(dest: Path):
    """Encik Sloth: clean doodle sprites and anime dialogue portraits (see art/chars/slothfaris/README.md)."""
    # One bounding box per direction so the idle faces swap in pixel-aligned.
    faces = ("", "_blink", "_drowsy", "_nod", "_yawn")
    for direction, faces in (("front", faces), ("side", faces), ("back", ("",))):
        cuts = [key_white(Image.open(SLOTH_ART / f"idle_{direction}{face}.png"), neutral=True) for face in faces]
        alphas = [c.getchannel("A").point(lambda a: 255 if a > 16 else 0) for c in cuts]
        boxes = [a.getbbox() for a in alphas]
        bounds = (min(b[0] for b in boxes), min(b[1] for b in boxes), max(b[2] for b in boxes), max(b[3] for b in boxes))
        for face, cut in zip(faces, cuts):
            im = cut.crop(bounds)
            im = im.resize((round(im.width * 512 / im.height), 512), Image.LANCZOS)
            im.save(dest / f"slothfaris_{direction}{face}.png", optimize=True)
    for src in sorted(SLOTH_ART.glob("portrait_*.png")):
        emotion = src.stem.removeprefix("portrait_")
        portrait = key_white(Image.open(src), neutral=True)
        portrait = portrait.crop(portrait.getchannel("A").getbbox())
        portrait.thumbnail((1024, 1024), Image.LANCZOS)
        portrait.save(dest / f"slothfaris_portrait_{emotion}.webp", "WEBP", quality=92, method=6)


def flatten(im: Image.Image) -> Image.Image:
    """Smooth speckle out of flat colour areas (some ComfyUI seeds add grain), leaving the outlines alone."""
    im = im.convert("RGB")
    smooth = im.filter(ImageFilter.MedianFilter(7))
    lines = im.convert("L").point(lambda v: 255 if v < 90 else 0).filter(ImageFilter.MaxFilter(7))
    return Image.composite(im, smooth, lines)


def clean_human_sprite(im: Image.Image) -> Image.Image:
    """Keep the closed dark doodle outline and its interior; clear generated background grain.

    A dark-outline component is more reliable here than white keying alone: some Qwen
    seeds scatter connected pink/green grain outside the character. Filling the closed
    silhouette also preserves white shirts and badges.
    """
    im = im.convert("RGB")
    # These two outfits contain no magenta. Remove saturated background flecks
    # before extracting the outline (a few seeds put one directly below a shoe).
    r, g, b = im.split()
    red = ImageChops.subtract(r, g).point(lambda v: 255 if v > 30 else 0)
    blue = ImageChops.subtract(b, g).point(lambda v: 255 if v > 30 else 0)
    im = Image.composite(Image.new("RGB", im.size, "white"), im, ImageChops.multiply(red, blue))
    outline = main_blob(im.convert("L").point(lambda v: 255 if v < 110 else 0))
    flood = Image.new("L", (im.width + 2, im.height + 2), 0)
    flood.paste(outline, (1, 1))
    ImageDraw.floodfill(flood, (0, 0), 128)
    silhouette = flood.crop((1, 1, im.width + 1, im.height + 1)).point(lambda v: 0 if v == 128 else 255)
    silhouette = silhouette.filter(ImageFilter.MinFilter(3))
    return Image.composite(im, Image.new("RGB", im.size, "white"), silhouette)


def human_sprite_cut(im: Image.Image) -> Image.Image:
    cut = key_white(flatten(clean_human_sprite(im)), neutral=True)
    # Keep the exact connected character after keying too. Coarse outline masks
    # can retain a detached fleck within a few pixels of a shoe.
    alpha = cut.getchannel("A")
    connected = alpha.point(lambda v: 255 if v > 16 else 0)
    seed = (cut.width // 2, cut.height // 2)
    if connected.getpixel(seed) != 255:
        raise ValueError("Human sprite must cover its canvas centre")
    ImageDraw.floodfill(connected, seed, 128)
    cut.putalpha(ImageChops.multiply(alpha, connected.point(lambda v: 255 if v == 128 else 0)))
    return cut


def export_human(dest: Path, name: str, *, directions=("front", "side", "back"), portraits=True):
    """Human NPCs: aligned clean doodle idles and photo-referenced anime portraits."""
    folder = ROOT / "art/chars" / name
    for direction in directions:
        sources = [folder / f"idle_{direction}.png", *sorted(folder.glob(f"idle_{direction}_*.png"))]
        cuts = [human_sprite_cut(Image.open(src)) for src in sources]
        boxes = [im.getchannel("A").getbbox() for im in cuts]
        bounds = (min(b[0] for b in boxes), min(b[1] for b in boxes),
                  max(b[2] for b in boxes), max(b[3] for b in boxes))
        scale = min(480 / (bounds[3] - bounds[1]), 486 / (bounds[2] - bounds[0]))
        size = (round((bounds[2] - bounds[0]) * scale), round((bounds[3] - bounds[1]) * scale))
        for src, cut in zip(sources, cuts):
            canvas = Image.new("RGBA", (512, 512))
            canvas.alpha_composite(cut.crop(bounds).resize(size, Image.LANCZOS), ((512 - size[0]) // 2, 506 - size[1]))
            suffix = src.stem.removeprefix("idle_")
            canvas.save(dest / f"{name}_{suffix}.png", optimize=True)
    if not portraits:
        return
    # Shared crop: expressions keep the same head position and scale on the VN stage.
    sources = sorted(folder.glob("portrait_*.png"))
    cuts = [key_white(Image.open(src), neutral=True) for src in sources]
    boxes = [im.getchannel("A").getbbox() for im in cuts]
    bounds = (min(b[0] for b in boxes), min(b[1] for b in boxes),
              max(b[2] for b in boxes), max(b[3] for b in boxes))
    # VN uses a bust crop so the face reads at the same scale as Qish's portrait.
    # Full waist-up source art remains in art/chars for other compositions.
    bounds = (*bounds[:3], round(bounds[1] + (bounds[3] - bounds[1]) * 0.63))
    for src, cut in zip(sources, cuts):
        portrait = cut.crop(bounds)
        portrait.thumbnail((1024, 1200), Image.LANCZOS)
        portrait.save(dest / f"{name}_{src.stem}.webp", "WEBP", quality=92, method=6)


def export_bowat(dest: Path):
    """Bowat: doodle sprites, walk cycle, poses and anime portraits (see art/chars/bowat/README.md).

    Everything is drawn at one pixel density: standing is 480 px tall on a 512 px canvas. Pose
    sprites get a canvas of their own size, and the game scales them by height / 512.
    """
    def alpha_box(im: Image.Image):
        return im.getchannel("A").point(lambda a: 255 if a > 16 else 0).getbbox()

    def place(cut: Image.Image, scale: float, cx: float, bottom: float, width: int | None = None, top_pad: int = 26):
        """Scale `cut` and put source point (cx, bottom) at the canvas bottom centre."""
        box = alpha_box(cut)
        im = cut.resize((round(cut.width * scale), round(cut.height * scale)), Image.LANCZOS)
        x0, y0, x1, y1 = (round(v * scale) for v in box)
        ax, ay = round(cx * scale), round(bottom * scale)
        half = max(ax - x0, x1 - ax) + 8
        w = max(width or 0, 2 * half)
        h = max(512, ay - y0 + top_pad + 6)
        canvas = Image.new("RGBA", (w, h))
        canvas.alpha_composite(im, (w // 2 - ax, h - 6 - ay))
        return canvas

    def load(path: Path, extras: bool = False) -> Image.Image:
        return key_white(flatten(Image.open(path)), neutral=True, extras=extras)

    bases = {}
    for direction in ("front", "side", "back"):
        base = load(BOWAT_ART / f"idle_{direction}.png")
        x0, y0, x1, y1 = alpha_box(base)
        bases[direction] = (480 / (y1 - y0), (x0 + x1) / 2, y1)
        scale, cx, bottom = bases[direction]
        place(base, scale, cx, bottom, 512).save(dest / f"bowat_{direction}.png", optimize=True)
        # Idle faces are edits of the base, so they share its box and stay pixel-aligned.
        for src in sorted(BOWAT_ART.glob(f"idle_{direction}_*.png")):
            face = src.stem.removeprefix(f"idle_{direction}_")
            cut = load(src, extras=face == "fart")  # the fart puff floats free of his body
            frame = place(cut, scale, cx, bottom, 512)
            frame.crop((0, frame.height - 512, 512, frame.height)).save(dest / f"bowat_{direction}_{face}.png", optimize=True)
        # Walk frames: each scaled to standing height (the generator drifts in size) and centred on its feet.
        for frame in range(4):
            cut = load(BOWAT_ART / f"walk_{direction}_{frame}.png")
            fx0, fy0, fx1, fy1 = alpha_box(cut)
            place(cut, 480 / (fy1 - fy0), (fx0 + fx1) / 2, fy1, 512).save(dest / f"bowat_{direction}_walk_{frame}.png", optimize=True)

    # Poses edited from a base view keep its density and anchor.
    for name, direction in POSE_EDITS.items():
        scale, cx, bottom = bases[direction]
        cut = load(BOWAT_ART / f"pose_{name}.png", extras=True)
        place(cut, scale, cx, alpha_box(cut)[3]).save(dest / f"bowat_{name}.png", optimize=True)
    # Redrawn poses (lying, sitting): scaled so the head matches the standing sprite.
    for name, height in POSE_REDRAWS.items():
        cut = load(BOWAT_ART / f"pose_{name}.png", extras=True)
        x0, y0, x1, y1 = alpha_box(cut)
        place(cut, 480 * height / (y1 - y0), (x0 + x1) / 2, y1).save(dest / f"bowat_{name}.png", optimize=True)

    for src in sorted(BOWAT_ART.glob("portrait_*.png")):
        emotion = src.stem.removeprefix("portrait_")
        portrait = load(src, extras=True)
        portrait = portrait.crop(portrait.getchannel("A").getbbox())
        portrait.thumbnail((1024, 1024), Image.LANCZOS)
        portrait.save(dest / f"bowat_portrait_{emotion}.webp", "WEBP", quality=92, method=6)


# Bowat pose sprites: name -> the base view it was edited from.
POSE_EDITS = {"fart_back": "back", "dizzy": "front", "hurt": "front"}
# Redrawn poses: name -> drawing height as a fraction of standing height.
POSE_REDRAWS = {"lie_sleep": 0.5, "lie_tired": 0.5, "sit_eat_front_0": 0.8, "sit_eat_front_1": 0.8,
                "sit_eat_side_0": 0.8, "sit_eat_side_1": 0.8}


def export_cards():
    dest = OUT / "cards"
    dest.mkdir(parents=True, exist_ok=True)
    for src in (ROOT / "cards").glob("*.png"):
        im = Image.open(src).convert("RGB")
        im.thumbnail((860, 1200), Image.LANCZOS)
        im.save(dest / f"{src.stem.lower()}.webp", quality=88)


def export_strips():
    """Photo strips, sorted by filename so index i is stable (see GAME_VISION.md)."""
    dest = OUT / "strips"
    dest.mkdir(parents=True, exist_ok=True)
    for i, src in enumerate(sorted((ROOT / "strip").glob("*.jpeg"))):
        im = Image.open(src).convert("RGB")
        im.thumbnail((700, 900), Image.LANCZOS)
        im.save(dest / f"strip{i}.webp", quality=84)


def export_story():
    """Images for the ending's Kisah Kita slides and the 9th card."""
    dest = OUT / "story"
    dest.mkdir(parents=True, exist_ok=True)
    for src, name in [("ni kitorang.jpeg", "doodle_kita"), ("aku pakai spek jugak waktu ni.png", "listening_night")]:
        im = Image.open(ROOT / "ref" / src).convert("RGB")
        im.thumbnail((1000, 1000), Image.LANCZOS)
        im.save(dest / f"{name}.webp", quality=86)


if __name__ == "__main__":
    export_chars()
    export_cards()
    export_strips()
    export_story()
    print("exported to", OUT)
