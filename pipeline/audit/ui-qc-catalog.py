"""Build numbered contact sheets and a Malay QC checklist from ui-qc.mjs captures."""
import json
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, ImageOps

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / 'art/ui-paper-qc'
data = json.loads((OUT / 'manifest.json').read_text())
shots = {s['id']: s for s in data['shots']}
boss_labels = ['Bowat / platformer', 'Bolat / rhythm', 'Snorlax Twin / catcher', 'Blep / shooter', 'Mega Bowat / flappy', 'Bolat ex / memory', 'Qish ex / runner', 'Raja Malas / finale']
for n, title in enumerate(boss_labels, 1):
    for suffix, prefix in [('game', 'Minigame'), ('intro', 'Intro boss')]:
        id = f'B{n:02}-{suffix}'
        if id in shots: shots[id]['title'] = f'{prefix} {n}: {title}'
font = ImageFont.truetype('/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf', 23)
small = ImageFont.truetype('/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf', 18)
groups = [
    ('01-menu-hud', 'Menu, HUD dan interaksi', [f'A{i:02}' for i in [1,2,3,4,5,6,7,8,15]]),
    ('02-dialog-panel', 'Dialog, phone, pilihan dan retake', [f'A{i:02}' for i in [9,10,11,12,13,14,16,17,18,19]]),
    ('03-minigame', 'Semua 8 minigame', [f'B{i:02}-game' for i in range(1,9)]),
    ('04-intro-boss', 'Intro semua boss dan bantuan skip', [f'B{i:02}-intro' for i in range(1,9)]+['B09']),
    ('05-ending', 'Ending, surat dan kad rahsia', [f'C{i:02}' for i in [1,2,3,7,8,10,12,13,14,15]]),
    ('06-kisah-kita', 'Kesemua 9 halaman Kisah Kita', [f'C{i:02}' for i in range(4,13)]),
    ('07-phone-ui', 'Phone portrait: UI, HUD dan panel', [f'M{i:02}' for i in range(1,17)]),
    ('08-phone-ending', 'Phone portrait: ending', [f'N{i:02}' for i in range(1,16)]),
]

def sheet(slug, title, ids):
    ids = [i for i in ids if i in shots]
    mobile = slug.startswith(('07-', '08-'))
    cols, w, h = (4, 310, 671) if mobile else (2, 640, 360)
    pad, label, head = 20, 56, 85
    rows = (len(ids)+cols-1)//cols
    canvas = Image.new('RGB', (cols*(w+pad)+pad, head+rows*(h+label+pad)+pad), '#f5e4e9')
    d = ImageDraw.Draw(canvas)
    d.text((pad,18),title,font=font,fill='#9e5175')
    d.text((pad,49),'The Adventure of Qish · QC · 26 Oktober 2026 · Klik fail asal untuk saiz penuh',font=small,fill='#8f6b7c')
    for n, id in enumerate(ids):
        s=shots[id]; x=pad+(n%cols)*(w+pad); y=head+(n//cols)*(h+label+pad)
        im=Image.open(OUT/s['file']).convert('RGB')
        im=ImageOps.contain(im,(w,h),Image.Resampling.LANCZOS)
        canvas.paste(im,(x+(w-im.width)//2,y+(h-im.height)//2))
        text=f'{id}  {s["title"]}'
        if len(text)> (40 if mobile else 63): text=text[:(37 if mobile else 60)]+'…'
        d.text((x,y+h+8),text,font=small,fill='#75445c')
    canvas.save(OUT/f'{slug}.jpg',quality=92)

for slug,title,ids in groups: sheet(slug,title,ids)

lines=['# QC UI & HUD The Adventure of Qish', '',
    'Snapshot **26 Oktober 2026**, selepas pas ilustrasi kertas pink, daripada game semasa di dev port **5181**. Snapshot retro terdahulu kekal di `art/ui-qc/` sebagai perbandingan sahaja.', '',
    f'**{len(shots)} screenshot** desktop 1280×720 dan phone portrait 390×844. Save ujian berasingan daripada save browser pemain.', '',
    'Bagi komen ikut ID, contohnya **A04: HUD kad terlalu kecil** atau **B02-game: tulisan susah baca**. Tandakan `[x]` selepas lulus; tulis perubahan pada ruang catatan.', '',
    'Semak rupa, saiz tulisan, kontras, susunan, potret, arahan dan sama ada UI menutup benda penting. Komen teks dialog penuh kekal dalam [DIALOGUE_QC.md](DIALOGUE_QC.md).', '',
    'Gaya semasa: ilustrasi licin 2D dengan depth; logo baharu; HUD/menu kertas berlapis, warna pink, cream, pita foto dan bayang lembut. Dialog menggunakan potret anime dan overworld kekal 3D bercat. Surat dan kad ke-9 masih draf. Album kad/Pokélove-dex serta album photobooth yang boleh dibuka belum ada.', '',
    'Ini inventori visual, bukan keputusan lulus QC. Preview misi, workout dan pilihan menggunakan komponen runtime sebenar dengan nilai contoh; latar bilik mungkin kekal. Ending dicetus melalui dev di padang parti. Skip ditunjukkan dengan simulasi tiga kegagalan. Mikrofon fizikal, gamepad fizikal dan animasi tidak dinilai melalui gambar.', '',
    f'Ralat browser/aset semasa tangkapan: **{len(data["errors"])}**. Butiran mesin: [manifest.json](../art/ui-paper-qc/manifest.json).', '']
for slug,title,ids in groups:
    lines += [f'## {title}', '', f'[Buka contact sheet](../art/ui-paper-qc/{slug}.jpg)', '', f'![{title}](../art/ui-paper-qc/{slug}.jpg)', '', '| Lulus | ID / screenshot saiz penuh | Catatan |', '|---|---|---|']
    for id in ids:
        if id not in shots: continue
        s=shots[id]
        lines.append(f'| [ ] | [{id} — {s["title"]}](../art/ui-paper-qc/{s["file"]}) | {s["note"]} |')
    lines += ['']
lines += ['## Cara buka dalam game', '',
    '- Game: http://localhost:5181/ · tunnel build production: https://qish.durioo.app (boleh berbeza daripada dev jika build belum dikemas kini).',
    '- Tekan backquote (`) untuk panel dev, atau tap 5 kali laju bucu kiri atas pada phone.',
    '- Dari panel dev boleh lompat zon, mula boss, menang boss, buka kad dan ulang intro.',
    '- Phone: meja dalam bilik. Replay: konsol bilik selepas ending. Myvi: menu destinasi.',
    '- Ending semula: bercakap dengan Faris di padang selepas tamat.', '',
    'Jana semula katalog: `node pipeline/audit/ui-qc.mjs` kemudian `python3 pipeline/audit/ui-qc-catalog.py` dari root projek.', '']
(ROOT/'docs/UI_QC.md').write_text('\n'.join(lines))
print(f'{len(shots)} screenshots; {len(groups)} contact sheets; docs/UI_QC.md')
