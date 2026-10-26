"""Export the complete single-plane concepts and continuous studio wall from world QC.
Generate sources with qwen_gen.py using art/storybook/world-qc/prompts/*.txt, seed 861.
Run with the ComfyUI venv. White-keying only; never split a plane across sheet cells.
"""
from pathlib import Path
import importlib.util
from PIL import Image
ROOT=Path(__file__).resolve().parents[2]
spec=importlib.util.spec_from_file_location('retro_assets',ROOT/'pipeline/tools/retro_assets.py')
kit=importlib.util.module_from_spec(spec);spec.loader.exec_module(kit)
art=ROOT/'art/storybook/world-qc';out=ROOT/'game/public/assets/storybook'
for key in ['playerplane','enemyplane']:
    src=Image.open(art/f'qc_{key}_00001.png')
    obj=kit.key_white(src).convert('RGBA')
    obj.thumbnail((232,232),Image.Resampling.LANCZOS)
    frame=Image.new('RGBA',(256,256))
    frame.alpha_composite(obj,((256-obj.width)//2,(256-obj.height)//2))
    frame.save(out/f'item_{key}.png')
    assert frame.getbbox()[0]>4 and frame.getbbox()[1]>4 and frame.getbbox()[2]<252 and frame.getbbox()[3]<252
Image.open(art/'qc_bg_bolatex_00001.png').convert('RGB').resize((1600,900),Image.Resampling.LANCZOS).save(out/'bg_bolatex.webp',quality=90)
print('Exported two complete planes and Bolat ex studio')
# The boulevard keeps its terracotta identity, using the painted tar's brush grain.
from PIL import ImageOps, ImageEnhance
src=Image.open(ROOT/'game/public/assets/textures/tar.webp').convert('RGB')
lum=ImageOps.grayscale(src)
lum=ImageEnhance.Contrast(lum).enhance(0.65)
ImageOps.colorize(lum,(110,60,63),(205,133,104)).save(ROOT/'game/public/assets/textures/putra_road.webp',quality=90)
