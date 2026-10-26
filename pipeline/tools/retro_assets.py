"""Generate and export the complete UI/boss pixel-art kit through local ComfyUI.

Run with the ComfyUI venv: retro_assets.py generate [asset ...], export, or contact.
Sources, prompts and reproducible seeds live under art/retro; runtime is assets/retro.
"""
import argparse
import json
import subprocess
import sys
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
import numpy as np
from scipy import ndimage

ROOT = Path(__file__).resolve().parents[2]
ART = ROOT / "art/retro"
OUT = ROOT / "game/public/assets/retro"
PY = sys.executable
STYLE = "Authentic 8-bit pixel art for a charming retro handheld RPG, drawn on a coarse square pixel grid. Hard stair-step pixel edges, compact readable clusters, dark navy pixel outlines, flat limited 16-color palette, exactly two shade tones per material, occasional checkerboard dithering. Nostalgic colorful game sprite art, absolutely no smooth shading, no antialiasing, no brush strokes, no 3D rendering, no realistic fur, no vector illustration. Palette midnight navy, indigo, cream, coral pink, mint, warm yellow. "
SHEET = "A sprite sheet with EXACTLY FOUR equal square cells in a clean 2 by 2 grid, no visible grid lines. One complete full-body character centered in each cell at exactly the same scale with clear white margins. Solid pure white background. Top left neutral idle pose, top right action pose, bottom left hurt/surprised pose, bottom right happy victory pose. All four show the SAME character and outfit, same proportions, complete head and feet visible. No labels, no letters, no words, no shadows on the white background, no extra people or props outside the hands. "

CHARS = {
 "bowat": ("art/chars/bowat/idle_side.png", "Bowat, the beige grey chubby sloth in the reference. Soft beige body, cream face, dark grey eye patches, dark brown tiny hands and feet, adorable sleepy eyes. Side three-quarter view facing right. Action pose looks back showing his big round bottom to fart; hurt pose dizzy eyes; victory cheeky grin. Preserve the sloth's face and fat round silhouette.", 105),
 "megabowat": ("card:2", "Mega Bowat, the extremely overfed enormous round beige sloth from the reference card, cream belly, grey eye patches, dark brown tiny arms/feet, cookie crumbs on cheeks. Much fatter than regular Bowat, enormous belly, tiny limbs. Side view facing right, action floating upward with butt pointing down, hurt cheeks puffed, victory eating a cookie.", 102),
 "bolat": ("art/chars/qish/idle_front.png", "Bolat, the happy tiny cartoon girl in the reference doodle: very large round head, brown short pigtails, tiny pink sleeveless shirt with a white collar, thin bare arms, tiny legs, huge happy eyes and smiling mouth. No hijab for this doodle. Action opens arms for a cuddle; hurt sulks with puffed cheeks; victory jumps for joy. Front three-quarter view.", 103),
 "bolatex": ("card:6", "Bolat ex, the lively cartoon girl from this memory card. Large round head, short brown pigtails, tiny pink dress with white collar, fine little arms and legs. She holds a small silver digital camera and a white photobooth strip. Happy open mouth and excited eyes. Front three-quarter. Action takes a photo; hurt surprised; victory poses with camera.", 106),
 "snorlax": ("card:7", "Snorlax Twin from the reference: a hugely round sleepy navy-blue Snorlax plush body/costume, cream oval belly, tiny triangular ears, thick feet with cream paw pads. Qish's face in a light mauve hijab peeks out from the open cream hood at the top. The sleeping girl has closed eyes and a peaceful smile. Idle asleep reclined, action eating, hurt wakes surprised, victory sitting happily full. Keep the personal girl face inside the giant sleepy costume.", 107),
 "blep": ("card:1", "Blep, a cute chibi girl based on the reference photo, black hijab, expressive big eyes, tiny round face, tongue sticking out playfully, pink blush, black outfit with pink accent, pink psychic/fairy spark motif. Complete full body. Action casts a tiny heart from her hands, hurt surprised, victory winks tongue out. No photo realism.", 101),
 "qishex": ("card:4", "Qish ex, a confident tiny chibi girl based on this card. Black hijab, light beige bucket hat, black long-sleeved outfit and trousers, peach face, sneakers, warm mischievous smile. Full body front three-quarter, tiny powerful fighting stance. Action punching, hurt surprised, victory showing tiny muscles. Do not draw the other doodle/sloth companions from the card.", 104),
 "megaqish": ("card:8", "Mega Qish ex, a powerful cute chibi heroine in a mauve hijab and flowing dark outfit with fiery orange-gold cape trim. Based on the woman's face and hijab in this card, but fully 8-bit chibi. Full-body battle stance, fierce confident eyes, tiny gold flame crown above hijab. Action casts fire, hurt determined, victory one hand on hip. Keep fire as compact pixel shapes, no giant effects hiding the character.", 108),
 "faris": ("pipeline/inputs/faris_doodle_sq.png", "Raja Malas Faris from this doodle: very large long oval head, long fluffy wavy dark brown hair parted in the middle, lazy grin and relaxed half-closed eyes, tiny body, white T-shirt and dark shorts, little slippers. Full body front three-quarter. Preserve the distinctive long hair and long face, do not draw a generic short-haired man. Action scratching head, hurt says nothing with shocked face, victory lounging lazily.", 126),
 "qish": ("art/chars/qish/idle_side.png", "Qish player is the HUMAN girl from the reference doodle, peach skin on face/arms/legs, very large round head, brown pigtails, tiny pink sleeveless shirt with small white collar, thin bare arms and little legs. HUMAN face with small dot eyes, tiny smile and tiny nose, no animal muzzle, no eye patches, no fur. No hijab. Full body side view facing right. Four poses: idle standing, running with arms swinging, jumping with knees bent, celebrating. Same head/body proportions as original doodle.", 188),
 "qishback": ("art/chars/qish/idle_back.png", "The player Qish from behind, brown round hair with two short pigtails, tiny pink sleeveless shirt, thin bare arms and legs. Strict back view, NO FACE visible in any cell. Four running poses with clear alternating legs, same brown hair silhouette. Full body.", 189),
 "bowatback": ("art/chars/bowat/idle_back.png", "Bowat beige sloth strictly from behind. Round beige hood, brown arms/feet, fat little body, no visible face or eyes in any cell. Four waddling running poses with alternating tiny legs.", 190),
 "slothfaris": ("art/chars/slothfaris/idle_front.png", "Encik Sloth from the reference: a sloth with a blue body wrapping the back of its head like a hood, cream sloth face, dark brown eye patches, lazy relaxed eyes, tiny paws. Preserve reference proportions. Full body front view. Four poses standing, speaking, surprised, smiling.", 191),
 "babah": (None, "Babah, a kind older Malay aircraft engineer with short grey hair, moustache, glasses, a navy maintenance jumpsuit with cream pockets, safety boots, holding a spanner. Full body friendly chibi RPG NPC, front view, four expressions idle/talking/surprised/proud. No logos or letters.", 192),
 "busker": (None, "A chibi Malaysian busker with shoulder-length wavy brown hair, dark square spectacles, white T-shirt with a small green frog face motif, dark trousers, holding a brown acoustic guitar. Full body, four poses standing/strumming/singing/celebrating. Pixel NPC for a night market rhythm game.", 193),
 "cajon": (None, "A chibi Malaysian percussionist with short dark hair, mint T-shirt and navy jeans, sitting on a small wooden cajon box drum. Full body, four poses resting/tapping/cheering/smiling. Pixel NPC for a night market rhythm game.", 194),
 "crowd": (None, "Four DIFFERENT little audience NPCs seen STRICTLY from behind: one long brown-haired girl in pink, one short black-haired man in mint, one girl in mauve hijab, one curly-haired man in cream. One character per cell, back view only, no faces visible. All raising hands to cheer at a concert, dark navy outlines and colorful clothes.", 195),
}
ref, desc, seed = CHARS["snorlax"]
CHARS["snorlax"] = (ref, desc + " CRITICAL: EVERY cell, including the top-left sleeping pose, shows the HUMAN GIRL FACE framed by her MAUVE HIJAB inside the blue hood. Do not put a plain Snorlax face on the head. The sleepy top-left face is the same mauve-hijab girl's face with her eyes shut.", 207)
ref, desc, seed = CHARS["slothfaris"]
CHARS["slothfaris"] = (ref, desc + " This is an ANIMAL SLOTH with a huge round cream face, dark sloth eye patches, a little muzzle, blue round body and grey animal paws, exactly as the reference. Not a human in a hoodie. No human hair, no human clothes, no trousers, no human hands.", 291)

BGS = {
 "title": "Title-screen scenery for a Malaysian adventure RPG: a tiny kampung village on a green island, cream house with pink roof in the center distance, red hatchback parked nearby, winding path leading toward the viewer, little river and wooden bridge, coconut palms and mango trees. Azure sky with pixel clouds, sparkling sea, small pink flowers. Calm open blue sky in the upper half for a title to be added in code. Wide 16:9 full-bleed landscape, no people, no text, no UI.",
 "bowat": "Side-view platformer battle arena at Bukit Bintang Kuala Lumpur at blue-hour night. Dense vibrant pixel city, Petronas twin towers and Menara KL in the distant skyline, neon blank signs and digital screens, shopfronts, monorail bridge in midground. Lower quarter is broad dark asphalt scramble crossing with bold white zebra stripes and yellow box, completely empty space for characters. Platforms will be added later, no floating platforms in this image. Wide side-on view, playful saturated indigo/cyan/coral night palette. No people, no text, no UI.",
 "bolat": "Side-view rhythm game stage in a narrow Malaysian night market alley at Lorbel. Warm string lights across the top, closed shop shutters and pipes at back, stage truss with blank dark banner, two big pixel loudspeakers at sides, wood stage floor at lower third. Clear center stage for performers to be added later. Dark indigo night, bright magenta and cyan spotlights drawn as pixel checkerboard beams, gold lights. No people, no text, no UI.",
 "snorlax": "Side-view game arena at Tasik Lily on a beautiful morning. Bright turquoise lake fills middle and lower-middle, little island and large willow trees in distance, pink and cream water lilies near the edges, tiny wooden jetty to left. Bottom sixth is a horizontal grassy bank with little pixel flowers, a clean straight playable grass platform. Clear blue sky upper half, readable empty space in center for a huge sleepy boss added later. Wide full-bleed landscape, no people, no creatures, no text, no UI.",
 "blep": "Top-down vertical-scrolling shooter environment seen from high above KLIA airport at sunset. Mauve pink and coral pixel cloud banks at sides, far below tiny cyan terminal buildings and twin runways with white markings, miniature green oil palm plantations, airplane hangars and airport taxiways. Center is a clear corridor of warm peach sky so projectiles read well. Wide 16:9 composition. No aircraft, no characters, no letters, no words, no UI.",
 "megabowat": "Side-view scrolling game environment: the lavish Cosy Place restaurant kitchen, warm copper cookware, burgundy and gold decor at far back, cream checkerboard backsplash, brick oven at left distance, shelves with jars and bread, pixel copper hanging lamps, stainless counters. The middle and right foreground are completely empty for a flying sloth and obstacles added later. Bottom narrow strip dark wood counter. Wide full-bleed landscape, clean readable silhouettes. No people, no floating food, no words, no UI.",
 "bolatex": "Memory card game arena inside a bright pastel pink digital-camera photobooth studio. Large camera-shaped pink building facade in background, soft mint and cream checkerboard flooring, magenta and lilac walls, cyan neon outlines, pixel fairy lights, tiny blank photo frames and film reels at outer edges. Large clear dark indigo rectangular wall area through the middle for a 4 by 3 grid of cards added later. Wide 16:9 landscape, no characters, no readable words, no UI, no cards in the center.",
 "qishex": "Retro racing game horizon at Putrajaya Malaysia viewed straight up Persiaran Perdana boulevard. Recognizable green-domed Perdana Putra palace at distant center, pink-domed Putra Mosque on the left, royal palms lining both sides and turquoise lake beyond. Lower half has a wide empty red asphalt road widening toward the viewer in three lanes with cream sidewalks. Sunny warm cyan/peach sky. Clear center road for runner sprites added later. Wide 16:9, no people, no vehicles, no writing, no UI.",
 "finale": "Turn-based JRPG battle arena at Malaysia Sepang race circuit. Seven distinctive white curved leaf canopy roofs above the far grandstand across the middle distance, red-white racing kerbs, oil palms behind. Upper half beautiful indigo storm sky with peach sunset streak near horizon. Lower half completely empty dark slate purple racetrack paddock for two fighters added later. Pixel pavement and racing markings at edges. Wide side-view full-bleed arena background, no people, no cars, no words, no UI.",
}

# Environments are architecture studies, not mock gameplay screenshots. Mentioning
# players/monsters/platformers in these prompts made Qwen paint unwanted actors into them.
BGS.update({
 "bowat": "An entirely deserted Bukit Bintang intersection in Kuala Lumpur at blue hour. Side-on architectural street view, Petronas twin towers and Menara KL on the skyline, magenta/cyan blank advertising panels, colorful shop facades, elevated monorail guideway. Broad absolutely empty asphalt foreground with large white zebra crossing and yellow crosswalk markings. Only buildings, trees, road and sky. No figures or animals anywhere.",
 "bolat": "An entirely deserted little concert stage in a Malaysian night market alley at night. Side-on architectural view, empty wood stage lower third, blank navy banner on a metal truss, a speaker at either side, two pools of magenta and cyan light, warm strings of tiny square yellow bulbs across the top. The stage floor is totally bare and vacant. Only architecture, lights, speakers and floor.",
 "snorlax": "An uninhabited Malaysian lily lake at morning. Wide side-on landscape, blue sky upper half, turquoise lake across the middle, a little green island and willow trees on the far shore, a wooden jetty at the left edge, pink lilies on the water. Lower sixth is a bare, completely empty straight grassy bank. Only sky, trees, lake and grass, no figures or animals.",
 "blep": "A deserted Malaysian airport seen from very high directly above through gaps in peach and lavender clouds. Terminal buildings, hangars, tiny palm plantations and runway markings near the far outer edges; the entire center is clear warm peach air with no objects in it. Only clouds and distant landscape, no aircraft or figures.",
 "megabowat": "An entirely vacant luxurious restaurant kitchen. Side-on architectural view: cream backsplash tiles, copper hanging lamps, brass shelves with jars, burgundy curtains at the side, a brick oven at the left, bare clean stainless counters along the lower edge. Large uninterrupted empty cream tile wall across the center and right. Only furniture, kitchen equipment and walls. No figures, animals or flying objects.",
 "bolatex": "An entirely vacant photobooth studio with a pink digital camera-shaped facade around its outer edges. A giant perfectly BLANK plain dark indigo rectangle occupies the middle two thirds, with no objects or pictures inside that rectangle. Pink camera shell, silver knobs, fairy lights, tiny film reels ONLY at the far sides, mint checkerboard floor in the bottom tenth. The central indigo area is completely featureless. Architecture only, no figures, portraits, cards, grid, letters or icons.",
 "qishex": "An entirely deserted Putrajaya boulevard in Malaysia. Straight view up a wide empty red three-lane road toward the distant green domes of Perdana Putra palace. Pink Putra Mosque and royal palms at left, turquoise lake at sides, cream sidewalks, warm sunny cyan sky. The whole red road is completely vacant: only pavement and white lane markings, no vehicles, figures, animals or objects.",
})
ENV_STYLE = "A beautiful authentic 8-bit pixel-art environmental illustration. Clearly visible large square pixels, stair-step edges, compact color clusters, a limited indigo/cyan/coral/cream/gold palette and sparse checkerboard dithering. Hard pixel outlines, no smooth shading, no antialiasing, no 3D render. A static uninhabited architectural landscape, completely deserted. Wide horizontal 16:9 composition. No text, no logos, no interface. "

PROPS = {
 "cookie": "A single chocolate chip cookie with one bite missing, golden biscuit and dark chocolate chips, inventory item icon.",
 "fart": "A single lime green smelly gas puff, large stepped pixel cloud silhouette with three dark green stink squiggles, readable hazard sprite.",
 "heart": "A single bright pink heart with a white 2-pixel highlight, magic projectile and rhythm note icon.",
 "kiss": "A single coral red lipstick kiss mark, arcade rhythm game note icon.",
 "cuddle": "Two tiny cream mitten hands hugging a pink heart, friendly arcade rhythm note icon.",
 "alarm": "A single red twin-bell alarm clock, cream face, dark hands, game hazard icon.",
 "meat": "A single serving of smoked beef daging salai on a little brown plate, game food icon.",
 "cake": "A single slice of mango cake, golden mango cubes and cream layers, game food icon.",
 "ramen": "A single red bowl of spicy ramen with noodles and chopsticks, game food icon.",
 "malatang": "A single red bowl of malatang skewers, spicy soup and mushrooms, game food icon.",
 "pot": "A single tall stainless steel cooking stockpot with little black handles and a copper lid. Side view, tall rectangular body, game obstacle sprite.",
 "awning": "A single wide red and cream striped shop awning seen from side front, flat solid top ledge and scalloped lower edge, two short brackets, platform game tile.",
 "cloud": "A single white and pale lilac fluffy pixel cloud seen from above, game flying scenery sprite.",
 "sleep": "A single sleepy dark indigo bubble with three small cream Z shapes inside, enemy projectile sprite.",
 "fire": "A single strong orange and yellow stylized flame, stepped pixel outline, attack sprite.",
 "star": "A single golden four-point sparkle star with white highlight, battle magic sprite.",
 "camera": "A single pink compact digital camera with silver lens and cyan flash, inventory icon.",
 "film": "A single dark indigo and gold film roll with a little film strip tail, inventory icon.",
 "lily": "A single pink lily flower with mint leaves, inventory icon.",
 "pass": "A single gold VIP paddock pass on a coral lanyard, blank card center, inventory icon.",
 "request": "A single cream request letter with a red heart seal, inventory icon.",
 "resit": "A single long cream restaurant receipt with dark pixel marks, inventory icon, no readable words.",
 "spanner": "A single silver aircraft engineer spanner with dark navy outline, inventory icon.",
 "cardback": "A single vertical monster trading card back, indigo background, ornate cyan pixel corners, large central pink heart inside a cream circle, tiny golden sparkles. Card back design, no letters or words.",
 "playerplane": "A single cute small white and cyan propeller airplane seen STRICTLY from directly above, nose pointing UP, pink heart on wings, glass cockpit. Top-down shooter player sprite, symmetrical.",
 "enemyplane": "A single large cream and gold passenger jet seen STRICTLY from directly above, nose pointing DOWN, dark indigo wings and engines, gold stripe, tiny glass cockpit. Top-down shooter boss sprite, symmetrical, no letters.",
}

def ref_for(key, path):
    if not path:
        return None
    if not path.startswith("card:"):
        return ROOT / path
    n = int(path.split(":")[1])
    im = Image.open(ROOT / f"cards/{n}.png").convert("RGB")
    w, h = im.size
    box = (int(w*.055), int(h*.13), int(w*.95), int(h*.58))
    im.crop(box).resize((1024, 768)).save(ART / f"refs/{key}.png")
    return ART / f"refs/{key}.png"

def generate(keys):
    tasks = {}
    for k,(ref,desc,seed) in CHARS.items():
        tasks[k] = (STYLE + SHEET + desc + " Use the reference only for character identity; entirely redraw in coarse pixel art.", ref_for(k,ref), seed, "1:1")
    tasks["crowd"] = ("A sheet of four pixel-art spectators, arranged in a 2 by 2 grid on pure white. EXACTLY ONE individual per quadrant, all shown full body strictly FROM BEHIND, backs of heads visible, no faces. Top left: long brown-haired woman pink shirt; top right: black-haired man mint shirt; bottom left: woman mauve hijab black shirt; bottom right: curly-haired man cream shirt. Each has two arms raised cheering. No other figures anywhere. Coarse square pixels, navy outlines, limited palette, no smooth shading. ", None, 295, "1:1")
    for i,(k,desc) in enumerate(BGS.items()):
        tasks["bg_"+k] = (ENV_STYLE + desc, None, 260+i, "16:9")
    for i,(k,desc) in enumerate(PROPS.items()):
        tasks["item_"+k] = (desc + " This is an inanimate OBJECT, no characters, no animals, no faces, no eyes, no limbs. One complete object centered on pure white with generous margins, no shadow or text. Coarse square-pixel illustration for an 8-bit inventory, dark navy outlines, limited cream/coral/mint/gold palette, flat clusters, hard edges, no antialiasing. ", None, 450+i, "1:1")
    for key in keys or tasks:
        if key not in tasks:
            raise SystemExit(f"Unknown {key}")
        dest = ART / f"raw/{key}.png"
        if dest.exists():
            print("cached",key,flush=True)
            continue
        prompt,ref,seed,aspect = tasks[key]
        pf = ART / f"prompts/{key}.txt"
        pf.write_text(prompt)
        cmd = [PY, str(ROOT/"pipeline/tools/qwen_gen.py"), "--seed",str(seed),"--name","retro_"+key,"--out",str(ART/"raw"),"--prompt-file",str(pf)]
        if ref:
            cmd += ["--image",str(ROOT/"pipeline/inputs/blank_1024.png"),"--image",str(ref),"--size","1024x1024"]
        else:
            cmd += ["--t2i","--aspect",aspect,"--megapixels","1.0"]
        print("generating",key,flush=True)
        result = subprocess.run(cmd,capture_output=True,text=True,check=True)
        data = json.loads(result.stdout)
        Image.open(data["outputs"][0]).save(dest)
        print(key,data["seconds"],flush=True)

def key_white(im):
    a = np.asarray(im.convert("RGB"))
    white = a.min(axis=2) > 230
    seeds = np.zeros(white.shape,bool)
    seeds[0,:]=white[0,:]; seeds[-1,:]=white[-1,:]; seeds[:,0]=white[:,0]; seeds[:,-1]=white[:,-1]
    bg = ndimage.binary_propagation(seeds,mask=white)
    mask = ~bg
    labels,n = ndimage.label(mask)
    counts = np.bincount(labels.ravel()); counts[0]=0
    # Keep connected art and significant detached limbs, eliminate tiny generation specks.
    mask &= counts[labels] > max(18, mask.size*.00015)
    alpha = (mask*255).astype("uint8")
    rgba = np.dstack([a,alpha])
    obj = Image.fromarray(rgba)
    box = obj.getbbox()
    return obj.crop(box) if box else obj

def crisp(im, size):
    # Generated artwork is authored as pixels; export to a common native pixel grid/palette.
    return im.resize(size, Image.Resampling.NEAREST).quantize(colors=24,method=Image.Quantize.FASTOCTREE,dither=Image.Dither.NONE).convert("RGBA")

def export(keys):
    manifest = {}
    for key in keys or [*CHARS,*("bg_"+k for k in BGS),*("item_"+k for k in PROPS)]:
        src = ART / f"raw/{key}.png"
        if not src.exists():
            continue
        im = Image.open(src).convert("RGB")
        if key in CHARS:
            w,h=im.size
            parts=[key_white(im.crop((x*w//2,y*h//2,(x+1)*w//2,(y+1)*h//2))) for y in range(2) for x in range(2)]
            scale=min(80/max(p.width for p in parts),86/max(p.height for p in parts))
            sheet=Image.new("RGBA",(384,96))
            for i,(state,part) in enumerate(zip(["idle","action","hurt","win"],parts)):
                p=crisp(part,(max(1,round(part.width*scale)),max(1,round(part.height*scale))))
                frame=Image.new("RGBA",(96,96))
                frame.alpha_composite(p,((96-p.width)//2,92-p.height))
                frame.save(OUT/f"{key}_{state}.png")
                sheet.alpha_composite(frame,(i*96,0))
            sheet.save(OUT/f"{key}.png")
            manifest[key]={"type":"sprite","frames":4,"cell":96,"source":str(src.relative_to(ROOT))}
        elif key.startswith("bg_"):
            crisp(im,(320,180)).convert("RGB").save(OUT/f"{key}.png")
            manifest[key]={"type":"background","size":[320,180]}
        else:
            obj=key_white(im)
            size=(64,64) if key not in ["item_awning","item_enemyplane","item_playerplane","item_cardback","item_pot"] else (96,96)
            scale=min((size[0]-4)/obj.width,(size[1]-4)/obj.height)
            obj=crisp(obj,(max(1,round(obj.width*scale)),max(1,round(obj.height*scale))))
            frame=Image.new("RGBA",size)
            frame.alpha_composite(obj,((size[0]-obj.width)//2,(size[1]-obj.height)//2))
            frame.save(OUT/f"{key}.png")
            manifest[key]={"type":"item","size":size}
    old=json.loads((OUT/"manifest.json").read_text()) if (OUT/"manifest.json").exists() else {}
    old.update(manifest)
    (OUT/"manifest.json").write_text(json.dumps(old,indent=2))
    print("exported",len(manifest),flush=True)

def contact():
    font=ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",16)
    for label,files,cols,cw,ch in [
        ("characters",[OUT/f"{k}.png" for k in CHARS],2,810,230),
        ("arenas",[OUT/f"bg_{k}.png" for k in BGS],3,480,300),
        ("items",[OUT/f"item_{k}.png" for k in PROPS],6,180,190),
    ]:
        files=[f for f in files if f.exists()]
        if not files: continue
        im=Image.new("RGB",(cols*cw,((len(files)+cols-1)//cols)*ch),"#26304e")
        d=ImageDraw.Draw(im)
        for i,f in enumerate(files):
            x,y=i%cols*cw,i//cols*ch
            p=Image.open(f).convert("RGBA")
            p.thumbnail((cw-20,ch-35),Image.Resampling.NEAREST)
            # Upscale native sprites so individual pixels can be reviewed.
            if label=="characters": p=p.resize((768,192),Image.Resampling.NEAREST)
            elif label=="items": p=p.resize((144,144),Image.Resampling.NEAREST)
            im.paste(p,(x+10,y+7),p)
            d.text((x+10,y+ch-25),f.stem,font=font,fill="#ffdfa4")
        im.save(ART/f"{label}-contact.png")

if __name__=="__main__":
    for p in [ART/"raw",ART/"refs",ART/"prompts",OUT]: p.mkdir(parents=True,exist_ok=True)
    ap=argparse.ArgumentParser();ap.add_argument("action",choices=["generate","export","contact"]);ap.add_argument("keys",nargs="*");a=ap.parse_args()
    if a.action=="generate":generate(a.keys)
    elif a.action=="export":export(a.keys)
    else:contact()
