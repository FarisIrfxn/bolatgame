"""Faris/Babah art pass, Qwen Edit on local ComfyUI. Run with Comfy's venv Python.

Phases are review boundaries: bases, views, faces. Prompts and raw outputs remain in work/.
"""
import argparse
import hashlib
import shutil
from pathlib import Path
from types import SimpleNamespace

from qwen_gen import EDIT, build_edit, finish, run
from export_game_assets import clean_human_sprite
from PIL import Image

ROOT = Path(__file__).resolve().parents[2]
ART = ROOT / 'art/chars'


def generate(who, name, prompt, images, size='1024x1024', seed=7):
    folder = ART / who
    work = folder / 'work' / 'generated'
    work.mkdir(parents=True, exist_ok=True)
    target = folder / f'{name}.png'
    if target.exists():
        return
    prompt_path = work / f'p_{name}.txt'
    prompt_path.write_text(prompt + '\n')
    # ComfyUI inputs are global. The shared helper stages only by basename, so
    # two characters' portrait_normal.png would overwrite a queued reference.
    # Immutable content-addressed inputs avoid that across concurrent art jobs.
    inputs = work / 'inputs'
    inputs.mkdir(exist_ok=True)
    staged = []
    for image in images:
        data = image.read_bytes()
        immutable = inputs / f'{hashlib.sha256(data).hexdigest()[:16]}_{image.name}'
        if not immutable.exists():
            immutable.write_bytes(data)
        staged.append(immutable)
    args = SimpleNamespace(image=staged, size=size, enhance='off', max_tokens=None,
                           name=f'human_{who}_{name}', quality=False)
    graph = build_edit(args, prompt)
    finish(graph, EDIT, args, seed)
    # The template's enhancer preview is an output node; remove it so an unused
    # prompt enhancer is not evaluated during direct-prompt edits.
    graph.pop('459:480', None)
    output = run(graph, 8188, EDIT['save'])[0]
    shutil.copy2(output, work / output.name)
    shutil.copy2(output, target)
    if name.startswith('idle_'):
        clean_human_sprite(Image.open(target)).save(target)
    print(f'Installed source: {target.relative_to(ROOT)}', flush=True)


def bases():
    generate('faris', 'idle_front',
        'Clean up and color <image1> into the same polished cute doodle game sprite style as <image2>. '
        'Preserve EXACTLY the male doodle silhouette and proportions of <image1>: huge long tilted rectangular head, '
        'very long wavy hair flaring out widely at both sides, large round ears, tiny short-sleeved T-shirt body, '
        'tiny shorts, thin bare arms and legs, small shoes. Keep the original long hair shape, NOT short hair. '
        'Smooth continuous confident medium-thick black outlines with no gaps, flat colors, no texture. '
        'Color the long hair dark brown-black, face warm tan, T-shirt muted teal-blue, shorts dark navy, shoes dark brown. '
        'Stand upright, arms down, feet together, facing straight forward. Change laughing face to relaxed open '
        'black oval eyes and a small closed-mouth nonchalant smile. Keep big head/tiny body scale. '
        'Single full-body character centered, pure white background, clear white margins, no text, no other characters.',
        [ART/'faris/work/doodle_front.png', ART/'qish/idle_front.png'])
    generate('babah', 'idle_front',
        'Draw the middle-aged Malaysian man from <image2> as a game doodle sprite matching <image1> style and '
        'proportions: a huge rounded slightly rectangular head, small ears, very tiny short body, short thin limbs, '
        'smooth even thick black outline and simple flat colours. NOT an anime portrait. Same big head tiny body '
        'scale as the girl reference, but only ONE male character. Preserve his short dark side-parted hair, '
        'fine moustache and short chin stubble, warm tan skin, small black oval eyes and gentle fatherly smile. '
        'White short-sleeve aircraft engineer shirt with tiny shoulder epaulettes, red sleeve piping, a dark chest '
        'pocket stripe, white ID lanyard with small badge, black trousers and black shoes. No vest, no ear defenders. '
        'Facing straight forward, standing upright with arms relaxed down, feet close together. '
        'Centered full body, complete head and shoes, plain pure white background, generous white margins, no text.',
        [ART/'qish/idle_front.png', ART/'babah/work/babah_photo.png'])


def portraits():
    for who in ('faris', 'babah'):
        generate(who, 'portrait_normal',
            'Completely redraw the man in <image1> as a polished hand-drawn Japanese anime visual novel '
            'character, using the illustration style of <image2> as the rendering reference only. '
            'Strong anime stylization: clean delicate dark linework, simplified handsome anime face, larger '
            'expressive illustrated brown eyes, simplified small nose and mouth, distinct cel shaded skin '
            'planes and painted grouped hair locks. Clearly a 2D anime drawing, NOT a photograph or photo '
            'filter. Preserve the man\'s recognizable face shape, age, skin tone, hairstyle and clothing. '
            'One man only, waist-up, facing slightly left with a relaxed kind smile. Entire head and hair '
            'inside the frame with white margin above. Pure solid flat white background, no noise, no '
            'scenery, no texture, no lettering or watermark. Do not draw the woman. ' +
            ('Young Malaysian man, short tousled curly black hair, clean shaven, white grey-pinstripe shirt, '
             'calm nonchalant smile, no glasses.' if who == 'faris' else
             'Middle-aged Malaysian father, short side-parted black hair, small moustache and chin stubble. '
             'White short sleeve aircraft engineer uniform, epaulettes, red sleeve piping, pocket pen, '
             'white ID lanyard, black trousers. No vest or ear defenders.'),
            [ART/who/'work'/f'{who}_photo.png', ART/'qish/portrait_normal.png'], '1024x1536', seed=11)


def views():
    for who in ('faris', 'babah'):
        for direction, pose in [
            ('side', 'three-quarter side view facing RIGHT, nose pointing right with both eyes visible, body also turned right'),
            ('back', 'directly from BEHIND, back of head and back of shirt visible, absolutely no face or eyes or nose visible')]:
            generate(who, f'idle_{direction}',
                f'Redraw this SAME exact doodle character in {pose}. Preserve identity, outfit, colors, huge head '
                'tiny body proportions and smooth clean black line style. Standing still with arms relaxed down and '
                'feet together, no walking pose. One entire full body centered on pure white background, no text, '
                'same scale and margins as reference. ' +
                ('Keep his very long dark wavy hair reaching below both ears, with the same wide flared silhouette. '
                 if who == 'faris' else 'Keep his short neatly side-parted black hair, white uniform shirt and black trousers. '),
                [ART/who/'idle_front.png'])


FACES = {
    'faris': {
        'happy': 'warm pleased smile, eyes gently closed, relaxed eyebrows',
        'smug': 'a teasing crooked smirk, one eyebrow raised, mischievous half-lidded eyes',
        'surprised': 'startled wide eyes, raised eyebrows, mouth slightly open: Alamak',
        'deadpan': 'utterly blank nonchalant face, half-lidded eyes, straight small mouth',
        'sleepy': 'very sleepy half-closed eyes and a small yawn',
        'shy': 'embarrassed sincere smile, warm blushing cheeks, eyes looking slightly aside',
        'sorry': 'sincere apologetic expression, inner eyebrows lifted, softened eyes, small regretful smile',
        'love': 'tender loving smile and soft shining eyes, warm cheeks, calm heartfelt expression',
        'defeated': 'weary sheepish resigned smile, eyes half closed, a small sweat drop by temple',
    },
    'babah': {
        'happy': 'warm proud fatherly smile with gently closed eyes',
        'surprised': 'surprised raised eyebrows, wide eyes and small open mouth',
        'guilty': 'comically bad at keeping a secret, nervous awkward smile, eyes glancing aside and a tiny sweat drop',
        'thinking': 'focused thoughtful expression, slightly furrowed eyebrows, eyes looking aside',
        'deadpan': 'dry serious deadpan expression, straight mouth and half-lidded eyes',
        'love': 'warm tender fatherly smile, gentle proud eyes, loving birthday greeting',
    },
}


def faces():
    for who, expressions in FACES.items():
        for name, change in expressions.items():
            generate(who, f'portrait_{name}',
                'Edit <image1>. Keep this SAME exact man, face identity, age, hair, clothes, pose, body, scale, '
                'framing, thin anime linework, cel shading and pure white background unchanged. '
                f'Change ONLY his facial expression to: {change}. No extra text, no new objects or people.',
                [ART/who/'portrait_normal.png'], '1024x1536')
        for direction in ('front', 'side'):
            for face, change in [('blink', 'both eyes closed as two short gentle curved lines, same mouth'),
                                 ('smile', 'both eyes closed as happy upward curves with a small happy smile')]:
                generate(who, f'idle_{direction}_{face}',
                    'Edit <image1>. Keep exactly the same doodle character, same body, hair outline, position, '
                    'size, colors, white background and clean smooth thick black outlines. Change ONLY the face: '
                    f'{change}. All pixels outside the face must remain identical. No extra objects or text.',
                    [ART/who/f'idle_{direction}.png'])


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('phase', choices=['bases', 'portraits', 'views', 'faces'])
    args = parser.parse_args()
    globals()[args.phase]()
