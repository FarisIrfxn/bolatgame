#!/usr/bin/env python3
"""Prepare the user's existing chiptune covers; never regenerate the music.

Run with ComfyUI's Python (imageio_ffmpeg is already installed there).
Edit music/cues.json to adjust chorus cuts, then rerun this script.
"""
from pathlib import Path
import hashlib
import json
import re
import shutil
import subprocess

ROOT = Path(__file__).resolve().parents[2]
SOURCES = ROOT / "music"
DEST = ROOT / "game/public/assets/music"
TIMING = ROOT / "game/src/content/music.generated.json"


def ffmpeg_binary():
    if binary := shutil.which("ffmpeg"):
        return binary
    import imageio_ffmpeg
    return imageio_ffmpeg.get_ffmpeg_exe()


def prepare():
    ffmpeg = ffmpeg_binary()
    cues = json.loads((SOURCES / "cues.json").read_text())
    DEST.mkdir(parents=True, exist_ok=True)
    manifest = {}
    for key, cue in cues.items():
        source = SOURCES / cue["source"]
        output = DEST / f"{key}.mp3"
        trim = []
        if cue["duration"] is not None:
            trim += ["-t", str(cue["duration"])]
        # Input seeking resets timestamps before the fade filters. Output-side
        # seeking would leave their timestamps at the original chorus position.
        command = [ffmpeg, "-hide_banner", "-nostats", "-ss", str(cue["start"]), "-i", str(source), *trim, "-vn"]
        # Measure precisely the selected passage, then apply constant gain. Preserve
        # the dynamics of the supplied arrangement; leave headroom for game SFX.
        measured = subprocess.run(
            [*command, "-af", "loudnorm=I=-19:TP=-2:LRA=11:print_format=json", "-f", "null", "-"],
            check=True, capture_output=True, text=True,
        )
        stats = json.loads(re.findall(r"\{[^{}]+\}", measured.stderr)[-1])
        gain = min(-19 - float(stats["input_i"]), -4 - float(stats["input_tp"]))
        filters = [f"volume={gain:.4f}dB"]
        if cue["duration"] is not None:
            # Five-millisecond edge fades prevent clicks without changing bar length.
            filters += ["afade=t=in:d=0.005", f"afade=t=out:st={cue['duration'] - 0.005:.6f}:d=0.005"]
        subprocess.run(
            [*command, "-af", ",".join(filters), "-ar", "44100", "-ac", "2",
             "-codec:a", "libmp3lame", "-b:a", "96k", "-map_metadata", "-1", "-y", str(output)],
            check=True, capture_output=True,
        )
        checked = subprocess.run(
            [ffmpeg, "-hide_banner", "-nostats", "-i", str(output), "-af",
             "astats=measure_overall=RMS_level+Peak_level:measure_perchannel=none", "-f", "null", "-"],
            check=True, capture_output=True, text=True,
        )
        rms = float(re.search(r"RMS level dB: ([-\w.]+)", checked.stderr)[1])
        peak = float(re.search(r"Peak level dB: ([-\w.]+)", checked.stderr)[1])
        if rms < -55 or peak > -0.5:
            raise ValueError(f"{key}: exported audio is silent or clips (RMS {rms}, peak {peak} dB)")
        manifest[key] = {
            "url": f"/assets/music/{key}.mp3",
            "title": cue["title"],
            "source": cue["source"],
            "sourceSha256": hashlib.sha256(source.read_bytes()).hexdigest(),
            "start": cue["start"],
            "duration": cue["duration"],
            "gainDb": round(gain, 4),
            "rmsDb": round(rms, 4),
            "peakDb": round(peak, 4),
            "bytes": output.stat().st_size,
            **{k: cue[k] for k in ("bpm", "bars") if k in cue},
        }
        print(f"{key}: {output.stat().st_size / 1024:.0f} KB, {gain:+.2f} dB", flush=True)
    data = json.dumps(manifest, indent=2, ensure_ascii=False) + "\n"
    (DEST / "manifest.json").write_text(data)
    TIMING.write_text(data)


if __name__ == "__main__":
    prepare()
