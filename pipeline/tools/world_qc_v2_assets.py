"""Export approved QC2 concrete swatches and complete non-scrolling kitchen background.
ComfyUI Qwen Turbo, seed 953; rejected first attempts are kept for provenance.
"""
from pathlib import Path
import importlib.util
from PIL import Image
ROOT=Path(__file__).resolve().parents[2]
spec=importlib.util.spec_from_file_location('seamless',ROOT/'pipeline/tools/seamless.py')
seam=importlib.util.module_from_spec(spec);spec.loader.exec_module(seam)
for name in ['airport_concrete','circuit_concrete']:
    src=ROOT/f'art/textures/world-qc-v2/qc2_{name}_00001.png'
    tile=seam.make_seamless(Image.open(src),.16).resize((512,512),Image.Resampling.LANCZOS)
    tile.save(ROOT/f'art/textures/{name}.png')
    tile.save(ROOT/f'game/public/assets/textures/{name}.webp',quality=90)
Image.open(ROOT/'art/storybook/world-qc-v2/qc2_kitchen_v2_00001.png').convert('RGB').resize((1600,900),Image.Resampling.LANCZOS).save(ROOT/'game/public/assets/storybook/bg_megabowat.webp',quality=90)
print('QC2 concrete and kitchen exported')
