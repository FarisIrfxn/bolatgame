"""Smooth illustrated minigame kit. Source prompts/seeds remain in art/storybook.

Run with the local ComfyUI venv: storybook_assets.py [asset ...].
Existing approved doodles are reused for Qish, Bowat and Faris; no walk art is changed.
"""
import importlib.util
import json
import re
import subprocess
import sys
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[2]
spec = importlib.util.spec_from_file_location('old_kit', ROOT/'pipeline/tools/retro_assets.py')
old = importlib.util.module_from_spec(spec)
spec.loader.exec_module(old)
ART = ROOT/'art/storybook'
OUT = ROOT/'game/public/assets/storybook'
for p in [ART/'raw', ART/'prompts', ART/'refs', OUT]: p.mkdir(parents=True, exist_ok=True)
STYLE = ('A polished 2D storybook game illustration, thick smooth warm dark plum-brown outlines, '
         'rounded friendly shapes, hand-painted cel shading, softly highlighted volumes, '
         'layered cut-paper depth and little contact shadows, like a beautiful illustrated camping adventure. '
         'High resolution antialiased edges. Warm pink, blush, cream, sage green and honey palette. '
         'No pixel art, no dithering, no coarse pixels, no realistic 3D rendering, no flat vector. ')
SHEET = ('A clean sprite sheet with exactly FOUR equal square cells in a 2 by 2 grid on pure white, '
         'one complete full-body character per cell with generous white margins, same size in all cells. '
         'Top left idle, top right action, bottom left hurt/surprised, bottom right happy victory. '
         'Same character and costume in every cell. No grid lines, no captions, no extra figures. ')

def clean(s):
    s = re.sub(r'\b(?:8-bit|pixel-art|pixel|retro|coarse|checkerboard dithering)\b', '', s, flags=re.I)
    return re.sub(r'\s+', ' ', s).replace('2- highlight','small highlight')

def generate(key, prompt, ref=None, wide=False):
    src=ART/'raw'/f'{key}.png'
    if src.exists(): return src
    pf=ART/'prompts'/f'{key}.txt'; pf.write_text(prompt)
    cmd=[sys.executable,str(ROOT/'pipeline/tools/qwen_gen.py'),'--prompt-file',str(pf),
         '--seed','733','--name','storybook_'+key,'--out',str(ART/'raw')]
    if ref:
        cmd += ['--image',str(ROOT/'pipeline/inputs/blank_1024.png'),'--image',str(ref),'--size','1024x1024']
    else: cmd += ['--t2i','--aspect','16:9' if wide else '1:1','--megapixels','1.4' if wide else '1.0']
    print('generating',key,flush=True)
    result=subprocess.run(cmd,capture_output=True,text=True,check=True)
    data=json.loads(result.stdout); Image.open(data['outputs'][0]).save(src)
    print('ready',key,data['seconds'],flush=True)
    return src

def frame(obj,size=256):
    obj=obj.convert('RGBA'); obj.thumbnail((size-24,size-16),Image.Resampling.LANCZOS)
    out=Image.new('RGBA',(size,size)); out.alpha_composite(obj,((size-obj.width)//2,size-8-obj.height))
    return out

def character(key,parts):
    sheet=Image.new('RGBA',(1024,256))
    for i,(pose,part) in enumerate(zip(['idle','action','hurt','win'],parts)):
        f=frame(part); f.save(OUT/f'{key}_{pose}.png'); sheet.alpha_composite(f,(i*256,0))
    sheet.save(OUT/f'{key}.png')

def main():
    selected=set(sys.argv[1:])
    want=lambda key: not selected or key in selected
    approved={
        'bowat':['bowat_side','bowat_fart_back','bowat_hurt','bowat_front'],
        'bowatback':['bowat_back','bowat_back_walk_1','bowat_back_walk_2','bowat_back'],
        'faris':['faris_front','faris_front_smile','faris_front_blink','faris_front_smile'],
        'bolat':['qish_front','qish_front_laugh','qish_front_blink','qish_front_laugh'],
    }
    for key,files in approved.items():
        if want(key): character(key,[Image.open(ROOT/f'game/public/assets/chars/{f}.png') for f in files])
    keys=['bolatex','snorlax','blep','megabowat','qishex','megaqish','busker','cajon','crowd']
    for key in keys:
        if not want(key): continue
        ref,desc,_=old.CHARS[key]
        if ref and ref.startswith('card:'):
            n=int(ref.split(':')[1]); im=Image.open(ROOT/f'cards/{n}.png'); w,h=im.size
            ref=ART/'refs'/f'{key}.png'; im.crop((int(w*.055),int(h*.13),int(w*.95),int(h*.58))).save(ref)
        elif ref: ref=ROOT/ref
        if key=='crowd':
            desc='Four DIFFERENT concert audience members strictly FROM BEHIND, one per cell: brown-haired girl in pink; short-haired man in mint; girl in mauve hijab; curly-haired man in cream. Raised hands cheering. No faces.'
            prompt=STYLE+SHEET+desc
        else: prompt=STYLE+SHEET+clean(desc)+' Use the reference only for identity, redraw completely in smooth storybook line art.'
        im=Image.open(generate(key,prompt,ref)); w,h=im.size
        character(key,[old.key_white(im.crop((x*w//2,y*h//2,(x+1)*w//2,(y+1)*h//2))) for y in range(2) for x in range(2)])
    for key,desc in old.BGS.items():
        if key=='title' or not want('bg_'+key): continue
        desc=clean(desc).replace('dark indigo rectangle','pale warm blush rectangle').replace('central indigo','central blush')
        src=generate('bg_'+key,STYLE+desc+' Entirely uninhabited environment. No people, animals, text or interface.',wide=True)
        Image.open(src).convert('RGB').resize((1600,900),Image.Resampling.LANCZOS).save(OUT/f'bg_{key}.webp',quality=90)
    items=list(old.PROPS)
    for start in range(0,len(items),4):
        group=items[start:start+4]
        if selected and not any('item_'+k in selected for k in group): continue
        desc=' A clean sheet of four different isolated inanimate inventory objects, exactly 2 by 2 equal square cells on pure white, one object per cell. Generous clear margins. No grid lines, no labels, no human or animal faces. '
        for pos,key in zip(['TOP LEFT','TOP RIGHT','BOTTOM LEFT','BOTTOM RIGHT'],group): desc+=pos+': '+clean(old.PROPS[key])+' '
        im=Image.open(generate(f'items_{start//4}',STYLE+desc)); w,h=im.size
        for i,key in enumerate(group):
            x,y=i%2,i//2
            obj=old.key_white(im.crop((x*w//2,y*h//2,(x+1)*w//2,(y+1)*h//2)))
            frame(obj).save(OUT/f'item_{key}.png')
    # These QC concepts contain complete single objects; the original sheet cells cropped the planes.
    if (ART/'world-qc/qc_playerplane_00001.png').exists() and (not selected or selected & {'item_playerplane', 'item_enemyplane', 'bg_bolatex'}):
        subprocess.run([sys.executable, str(ROOT/'pipeline/tools/world_qc_assets.py')], check=True)
    if (ART/'world-qc-v2/qc2_kitchen_v2_00001.png').exists() and (not selected or 'bg_megabowat' in selected):
        subprocess.run([sys.executable, str(ROOT/'pipeline/tools/world_qc_v2_assets.py')], check=True)
    print('storybook kit exported',flush=True)

if __name__=='__main__': main()
