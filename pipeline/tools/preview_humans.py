"""Contact sheets and idle GIFs for the reviewed Faris/Babah sources. System Python + Pillow."""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
from export_game_assets import ROOT, key_white

FONT = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', 20)
SMALL = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', 16)


def tile(path, size):
    if path.stem.startswith('idle_'):
        im = Image.open(ROOT/f'game/public/assets/chars/{path.parent.name}_{path.stem.removeprefix("idle_")}.png').convert('RGBA')
    else:
        im = key_white(Image.open(path), neutral=True)
    im = im.crop(im.getchannel('A').getbbox())
    im.thumbnail(size, Image.Resampling.LANCZOS)
    return im


def previews():
    for who in ('faris', 'babah'):
        folder = ROOT / 'art/chars' / who
        sheet = Image.new('RGB', (1200, 760), '#fff6ed')
        draw = ImageDraw.Draw(sheet)
        draw.text((25, 18), f'{who.title()} | doodle overworld + anime dialogue', font=FONT, fill='#47344b')
        for i, direction in enumerate(('front', 'side', 'back')):
            im = tile(folder / f'idle_{direction}.png', (230, 390))
            sheet.paste(im, (i * 250 + (250 - im.width)//2 + 8, 165 + (390 - im.height)//2), im)
            draw.text((i*250+90, 595), direction, font=FONT, fill='#47344b')
        im = tile(folder / 'portrait_normal.png', (410, 630))
        sheet.paste(im, (770+(410-im.width)//2, 85), im)
        sheet.save(folder/'preview_concepts.jpg', quality=94)
        portraits = sorted(folder.glob('portrait_*.png'))
        cols = 5 if who == 'faris' else 4
        rows = (len(portraits)+cols-1)//cols
        sheet = Image.new('RGB', (cols*240, rows*350+50), '#fff6ed')
        draw = ImageDraw.Draw(sheet)
        draw.text((20, 12), f'{who.title()} dialogue expressions',font=FONT,fill='#47344b')
        for i, path in enumerate(portraits):
            x,y=(i%cols)*240,(i//cols)*350+50
            im=Image.open(path).convert('RGB')
            im=im.crop((round(im.width*.2),0,round(im.width*.8),round(im.height*.45)))
            im.thumbnail((225,305),Image.Resampling.LANCZOS)
            sheet.paste(im,(x+(240-im.width)//2,y))
            draw.text((x+20,y+315),path.stem.removeprefix('portrait_'),font=SMALL,fill='#47344b')
        sheet.save(folder/'preview_expressions.jpg',quality=94)
        # Exported frames share a bounding box, so the GIF reveals alignment jitter.
        frames=[]
        for face in ('','_blink','','_smile',''):
            sheet=Image.new('RGB',(640,380),'#e9e3ef')
            for i,direction in enumerate(('front','side')):
                im=Image.open(ROOT/f'game/public/assets/chars/{who}_{direction}{face}.png').convert('RGBA')
                im.thumbnail((300,340),Image.Resampling.LANCZOS)
                sheet.paste(im,(i*320+(320-im.width)//2,20),im)
            frames.append(sheet)
        frames[0].save(folder/'preview_idle.gif',save_all=True,append_images=frames[1:],duration=[1800,130,900,1300,1000],loop=0)


if __name__ == '__main__':
    previews()
