# Pipeline aset

## ComfyUI

- Install: `/mnt/storage/Projects/Comfy/ComfyUI`, venv python: `/mnt/storage/Projects/Comfy/.venv/bin/python`
- **Satu instance sahaja: port 8188** (disatukan 2026-10-25; 8189 dah ditutup). Mula / restart
  (log di `ComfyUI/user/comfy8188.log`):

```bash
/mnt/storage/qish/pipeline/tools/comfy.sh
```

  Skrip ni lancar `main.py --port 8188 --enable-manager --use-ck-attention` terus dengan python venv.
  `comfy launch --background` tak boleh dipakai: ia guna python lain (`No module named 'filelock'`).
- **Dynamic VRAM kini jalan.** Python uv dalam venv tiada `os.memfd_create`; shim
  `site-packages/_memfd_shim.py` (dimuat oleh `memfd_shim.pth`) sambungkannya ke glibc melalui ctypes.
  Flag lama `--disable-dynamic-vram` tak perlu lagi.
- `--use-ck-attention` (attention Comfy Kitchen) aktif. Sampling turbo 8 step ±4s pada 1792×1024.
- Output projek: `ComfyUI/output/pokelove/` (2D), `ComfyUI/output/pokelove3d/` (3D). Tools comfy-mcp
  pun tunjuk ke 8188, jadi kedua-dua cara guna server yang sama.

**Panduan penuh rombakan seni zon (untuk mana-mana agent): `docs/ZONE_ART_GUIDE.md`.**

## Tools utama (jalankan dengan venv python)

| Skrip | Guna | Masa (RTX 5080) |
|---|---|---|
| `tools/qwen_gen.py --t2i` | Prop / objek terasing dari teks (Qwen Image 2.1 Turbo) | **±2.5s** warm, ±12s cold |
| `tools/qwen_gen.py --image ...` | Edit / scene dengan gambar rujukan (sampai 10) | ±15–35s, +15s dengan `--enhance on` |
| `tools/gen3d.py` | Gambar → GLB bertekstur (TRELLIS.2 default, Pixal3D pilihan) | ±36s (TRELLIS.2, preset game) |
| `tools/render_glb.py` | Render GLB dari 4 sudut jadi PNG (three.js game sendiri, headless) | ±10s |

```bash
P=/mnt/storage/Projects/Comfy/.venv/bin/python
$P tools/qwen_gen.py --t2i --prompt-file p.txt --name prop_x --out ../art/props
$P tools/gen3d.py ../art/props/prop_x_00001.png --out ../art/3d --optimize
python3 tools/render_glb.py ../art/3d/prop_x_trellis_00001.web.glb --out /tmp/x.png
```

Kedua-dua skrip hantar graf API (`workflows/api/*.json`) terus ke `/prompt` ComfyUI, bukan melalui
`comfy run`. Sebab: penukaran subgraph comfy-cli **membuang** sambungan prompt mentah ke switch
enhancer, jadi setiap run tanpa enhancer sebenarnya render prompt kosong (rama-rama rawak / doodle
disalin bulat-bulat). Nota lama "tanpa enhancer model cuma salin doodle" ialah bug ni, bukan sifat model.
Untuk tambah template baru: jalankan sekali melalui `comfy run`, ambil graf dari `GET /history`, simpan
dalam `workflows/api/`.

### Bila guna apa

- **Prop / objek untuk 3D:** `--t2i`, enhancer off. Tulis prompt gaya "pemerhati" yang panjang
  (`The image is a square 3D-rendered game asset ... isolated on a pure flat white background ...`),
  satu objek penuh di tengah. Jangan guna mod edit dengan gambar gaya sebagai rujukan untuk prop:
  model akan ambil watak dari gambar tu.
- **Scene dengan watak:** mod edit, `<image1>` kanvas kosong (saiz output), `<image2>` doodle watak.
  Enhancer off pun dah jadi (lihat `art/style/`); `--enhance on` kadang-kadang beri komposisi lebih kemas.
- **Turnaround watak:** `--enhance think` (lihat resepi di bawah).
- **3D:** TRELLIS.2 keluar tegak & simetri; Pixal3D ikut perspektif kamera gambar (selalu senget).
  Perbandingan: `art/3d/myvi_pixal_vs_trellis.png`.

### Preset 3D (`gen3d.py --preset`)

| Preset | Segi tiga | Tekstur | GLB mentah → `.web.glb` |
|---|---|---|---|
| `game` (default) | 20k | 1024 | ±3MB → ±0.4MB |
| `hero` | 60k | 2048 | untuk centrepiece |
| `full` | 700k | 4096 | setting template asal: 42MB, 104s; jangan guna dalam game |

`--optimize` tulis `.web.glb` (tekstur webp + meshopt) guna `npx @gltf-transform/cli@4.1.1`. Loader game
perlu `MeshoptDecoder` (`three/addons/libs/meshopt_decoder.module.js`).

## Kit tekstur & set prop (2026-10-25)

- Tekstur seamless: T2I dengan prompt "square seamless tileable hand-painted stylized game texture ... viewed
  straight from above" (jangan sebut nama game, nanti keluar ikon), kemudian `tools/seamless.py src dst --size 512
  [--band 0.08 untuk bata/papan]`. Permukaan rata (plaster, tar) lebih baik dilukis prosedur dengan numpy.
- Set prop: konsep `--t2i` (latar putih, satu objek penuh, 3/4 depan-kiri) → `gen3d.py --faces N --optimize`.
  Rumah besar: `--preset hero --faces 80000` (40k berlubang). Teks dalam model sentiasa rosak: jana papan tanda
  kosong, letak teks dalam game. Model keluar menghadap +z; rumah atas tiang keluar dengan pintu di +x.

- Sprite (rumpun rumput/bunga): `--t2i` atas latar putih, kemudian key putih → alpha (jarak dari putih,
  feather), crop, petak 256, isi warna purata ke piksel lutsinar supaya mipmap tak berbingkai putih.
- Model dalam game: hanya tekstur warna dipakai (normal map & PBR TRELLIS dibuang dalam `models.ts`).

## Set bilik Qish (2026-10-26)

Konsep dalam `pipeline/tools/prop_concepts.py` (`--zone bilik`) menghasilkan
`art/props/bilik/` → `art/3d/bilik/` → `game/public/assets/models/bilik_*.glb`:
katil, meja + kerusi, almari, konsol, pokok pasu, langsir dan pintu. Guna `gen3d.py --optimize`;
hasil `.web.glb` dipakai oleh `game/src/zones/bedroom.ts` melalui `modelBox()` / `model()`.
Papan strip, tingkap pagi/petang, permaidani lily dan tulisan TV kekal dalam kod kerana
kandungannya berubah ikut cerita. Selepas semakan Faris, katil pink putih berasal daripada
`art/props/bilik/bilik_bed_00004.png` → `art/3d/bilik/bilik_bed_solidpink_00001.web.glb`
→ `pink_bedding.py` → `game/public/assets/models/bilik_bed_solidpink.glb`.
Semua kain katil satu warna pink, tanpa jalur/throw warna lain. Langsir:
`bilik_curtain_00001.png` → `bilik_curtain_00001.web.glb` → `bilik_curtain.glb` (12k faces).
Meja pink: `bilik_desk_00002.png` → `bilik_desk_pink_00001.web.glb` (24k faces);
pintu pink penuh: `bilik_door_00001.png` → `bilik_door_pink_00001.web.glb` (12k faces).
Kedua-duanya seed 91, kemudian `pink_bedding.py` menyamakan palet pink dengan katil
sebelum eksport sebagai `bilik_desk_pink.glb` dan `bilik_door_pink.glb`.
Tekstur lantai pink putih dibuat melalui
`texture_kit.py bilik_floor`; kayu putih halus untuk trim (`bilik_wood`) dilukis
prosedur kerana permukaan kosong tidak keluar baik daripada T2I.

## Set Bukit Bintang (2026-10-26)

Prompt sumber berada dalam `tools/prop_concepts.py` (`--zone sunway`). Empat belas konsep objek tunggal
berlatar putih dijana ke `art/props/sunway/`, kemudian ditukar dengan TRELLIS.2 dan dioptimumkan sebagai
`art/3d/sunway/*.web.glb`. Salinan runtime bernama `game/public/assets/models/bb_*.glb`:
`screen_tower`, `shops_left`, `shops_right`, `mrt`, `monorail`, `monorail_station`, `bus`, `car_red`,
`car_green`, `taxi`, `burger`, `shawarma`, `tree`, dan `banner_lamp`.

Semua konsep papan tanda meminta panel kosong; teks stesen, kedai, banner dan skrin ditindih dalam game.
Menara/skylines besar guna preset hero, aset lain preset game. Setiap model dirender dari empat sudut dengan
`render_glb.py` sebelum dipasang. Tekstur pejalan kaki ialah `texture_kit.py bb_pavers` →
`art/textures/bb_pavers.png` → `game/public/assets/textures/bb_pavers.webp`; jalan simpang berputar dilukis
sebagai topeng poligon oleh sistem splat.

Bukti audit seni disimpan di `art/style/bukit_bintang_before_after.png`,
`art/style/bukit_bintang_final_audit.png` dan `art/style/bukit_bintang_phone.png`.

## Kit UI scrapbook (2026-10-26)

Empat ilustrasi UI dijana dengan `tools/qwen_gen.py --t2i` (Qwen Image 2.1 Turbo,
enhancer off, seed 88). Prompt yang boleh diulang di `art/ui/prompts/`, sumber PNG
di `art/ui/`, runtime WebP di `game/public/assets/ui/` (jumlah kurang 0.5 MB):

- `title-island.webp` ← `ui_title_island_00001.png` (16:9, 1.6 MP): pulau kampung untuk tajuk.
- `sepang-arena.webp` ← `ui_sepang_arena_00002.png` (16:9, 1.6 MP): arena kosong finale.
  Calon pertama ada watak tambahan dan ditolak. Prompt akhir meminta kajian persekitaran,
  tanpa istilah player/enemy/battle yang menyebabkan model memasukkan watak.
- `cosy-memory.webp` ← `ui_cosy_memory_00001.png` (1:1): dua lasagna di meja first date.
- `sunway-memory.webp` ← `ui_sunway_memory_00001.png` (1:1): singa, bukan beruang.

WebP landscape quality 88; poskad dikecilkan ke 800×800, quality 86. Tiada tulisan UI
di dalam gambar. Poskad dalam Kisah Kita dilabel sebagai ilustrasi; foto peribadi boleh
menggantikannya kemudian. Tema dan audit baki: `docs/UI_ART_AUDIT.md`.
Semakan visual: `node pipeline/audit/ui.mjs` dan `node pipeline/audit/story-ui.mjs`.

## Kit ilustrasi kertas pink (2026-10-26)

Nama game kini **The Adventure of Qish**. Faris menolak gaya retro dan memilih 2D licin
dengan kedalaman, pink dan HUD kertas. Logo alpha + scenery tajuk dijana menggunakan
built-in image_gen; PNG asal dan prompt penuh ada di `art/ui/paper/`.

Title terkini menggunakan latar ringkas **langit + jalan rumput 2D timbul**:
`art/ui/paper/title-meadow-source.png` + `title-meadow-prompt.txt` →
`game/public/assets/ui/title-meadow.webp` (1672×941, quality 91).
Dijana dengan built-in image_gen; hanya resize/encode WebP selepas penjanaan.
Sprite Bolat/Bowat asal dianimasi pada posisi tetap dalam DOM, logo/menu berasingan.
Audit title, kad sebenar, peta Myvi dan banner TV: `pipeline/audit/navigation.mjs`;
gambar terkini: `art/ui-navigation/`, katalog `docs/UI_QC.md`.

Kit minigame dijana dengan ComfyUI Qwen Image 2.1 Turbo, seed 733:
`tools/storybook_assets.py` → `art/storybook/{raw,prompts,refs}` →
`game/public/assets/storybook/`. Sprite sheet 4 pose × 256px, latar WebP 1600×900,
ikon PNG 256px, alpha tanpa palet pixel. Qish/Bowat/Faris asas disalin daripada
sprite doodle yang diluluskan; aset berjalan asal tidak diubah.

Jalankan dengan venv ComfyUI. Argumen pilihan memilih aset, contohnya `bg_bowat` atau
`item_cookie`. Sumber yang sudah ada digunakan semula. Kod permainan kini menggunakan
`minigames/storybook.ts`; kit retro lama disimpan sebagai sejarah sahaja.

Audit: `pipeline/audit/storybook.mjs` (8 minigame, input, rematch, phone, hash walk asal),
`finale-paper.mjs` (battle sebenar sampai kad #8), `ui.mjs` (desktop/portrait/landscape),
dan `ui-qc.mjs` + `ui-qc-catalog.py` (katalog visual terkini dalam `art/ui-paper-qc/`).

## Muzik cover 8-bit (2026-10-26)

Faris menyediakan lima MP3 dalam `music/`. Jangan jana semula; potong/guna sumber
sedia ada. `music/cues.json` menetapkan timecode chorus dan timing rhythm.
Jalankan `/mnt/storage/Projects/Comfy/.venv/bin/python pipeline/tools/prepare_music.py`
untuk eksport MP3 runtime ke `game/public/assets/music/` dan metadata ke
`game/src/content/music.generated.json`. Skrip menggunakan ffmpeg daripada
`imageio_ffmpeg`, gain tetap, fade 5ms dan validasi RMS/peak hasil encoding.
Rujukan penuh: `music/README.md`. Audit audio: `node pipeline/audit/music.mjs`.

## Penanda aras asal (2026-10-25)

| Kerja | Sebelum | Selepas |
|---|---|---|
| Style frame 1792×1024 (edit, 2 gambar) | 187s (30 step + enhancer thinking ±80s, kadang OOM) | 15–35s turbo; 31s dengan enhancer |
| Prop 1024² | — | 5s (`--t2i`) |
| Gambar → 3D | 104s, 42MB, 700k tri | 36s, 0.4MB, 20k tri |

Masa dari mana: enhancer menjana sampai `max_length` walaupun thinking off, jadi `qwen_gen.py` hadkan
1024 token (4096 untuk think). OOM lama berlaku sebab dua instance + model enhancer 9GB tanpa dynamic VRAM.

## Workflow lama (`workflows/`)

| Fail | Guna |
|---|---|
| `qwen21_edit.json`, `qwen21_turbo_edit.json`, `qwen21_turbo_t2i.json`, `3d_trellis2.json` | Template asal (format UI) |
| `api/edit_turbo.json`, `api/t2i_turbo.json`, `api/image_to_3d.json` | Graf API yang dipakai tools |
| `turn_*.json`, `one_*.json` | Turnaround watak (image_1 = kanvas putih 1792×1024, image_2 = doodle) |
| `style_A..D.json` | Style frame gaya Nintendo (2026-10-25) |

## Input (`inputs/`)

Crop setiap watak dari doodle Qish dalam `ref/`, atas latar putih. `blank_1792x1024.png` /
`blank_1024.png` = kanvas kosong. `style_anchor_B.png` = style frame terpilih.

## Resepi turnaround yang berjaya

1. **Sloth / watak berwarna:** image_1 = sheet 4 pandangan yang dah ada (layout), image_2 = doodle watak,
   prompt "Replace each of the four girls in <image1> with the character from <image2>...". Berjaya kali pertama.
2. **Paling boleh dipercayai: satu figura pada satu masa** (`one_*.json`). Doodle asal diletak atas kanvas
   1024×1024 sebagai image_1 → edit pose jadi berdiri neutral menghadap depan → dari pandangan depan tu, edit
   berasingan untuk sisi / belakang / 3-4. Identiti watak kekal. Jana 2 seed setiap pandangan dan pilih.
   Kemudian `tools/compose_sheet.py` susun pandangan pada tinggi sama.
   Cara sheet penuh sekali gus (layout transfer / 4 salinan) hilangkan identiti manusia (Faris jadi orang lain).
3. Output ada bunyi kuning/merah jambu di latar: bersihkan dengan `tools/clean_sheet.py`
   (`--mode lineart` atau `--mode color`, jalankan dengan python venv ComfyUI).

## Watak manusia Faris & Babah (2026-10-26)

Sumber akhir: `art/chars/faris/` dan `art/chars/babah/`; README masing-masing merekod rujukan,
seed dan ekspresi. `tools/human_characters.py` menggunakan Qwen Edit Turbo tempatan (8188):
`portraits` → `bases` → `views` → `faces`. Jalankan dengan Python venv ComfyUI. Semua prompt
tersimpan di `art/chars/<watak>/work/generated/p_*.txt`; input diberi hash kandungan supaya
fail bernama sama daripada watak berbeza tidak tertukar semasa kerja beratur.

`export_game_assets.py` mengeksport 3 arah idle + kelip/senyum (7 PNG seorang) dan 10 potret Faris /
7 potret Babah (WebP, crop dada ke atas yang sama untuk semua ekspresi). Pembersihan latar sprite
mengekalkan uniform putih dan membuang noise terasing. `preview_humans.py` menghasilkan konsep,
lembaran ekspresi dan GIF idle; `pipeline/audit/human-characters.mjs` menyemak integrasi browser.

## Pembetulan QC dunia & boss (2026-10-26)

Shawarma, MRT dan monorel BB kini sengaja menggunakan binaan kod licin, mengikut arahan Faris;
GLB lama disimpan sebagai sumber. GLB `bb_car_red`, `bb_car_green` dan `bb_taxi` dikongsi dengan
Nyomnyom/parking Sepang. Tidak perlu menjana kereta baharu.

Pesawat Blep dahulu terpotong kerana objek melimpasi sel sheet. Dua konsep lengkap kini dijana
**secara individu** dengan Qwen Turbo, seed 861, 1:1/1 MP; studio Bolat ex 16:9/1.4 MP:

- Prompt: `art/storybook/world-qc/prompts/{playerplane,enemyplane,bg_bolatex}.txt`.
- Sumber: `art/storybook/world-qc/qc_*_00001.png`.
- Eksport: Python venv ComfyUI + `pipeline/tools/world_qc_assets.py` (white key + frame 256px dengan
  margin jelas; studio 1600×900 WebP). `storybook_assets.py` menggunakan override ini semasa eksport.
- `putra_road.webp`: grain tekstur tar sedia ada diwarnakan terracotta oleh exporter yang sama;
  digunakan pada permukaan tanah splat Putrajaya. Tiada slab jalan tambahan.

Audit/bukti: `pipeline/audit/world-qc.mjs`, `world-boss-qc.mjs`, `art/style/world-qc/`,
`docs/WORLD_QC.md`. Audit dunia boleh terima ID zon untuk ulangan terpilih, contohnya
`node pipeline/audit/world-qc.mjs photobooth bukit`.

## QC2: konkrit KLIA/Sepang & dapur Mega Bowat (2026-10-27)

- `art/textures/world-qc-v2/qc2_airport_concrete_00001.png` dan `qc2_circuit_concrete_00001.png`:
  swatch bahan kosong, Qwen T2I seed 953, 1 MP. Prompt lengkap di folder sama. Percubaan seed 91
  dengan konteks game/airport menghasilkan ikon/marking dan **ditolak**; prompt akhir hanya menyebut
  macro cement/concrete. `texture_kit.py` menggunakan prompt akhir untuk kedua-dua swatch ini.
- `art/storybook/world-qc-v2/qc2_kitchen_v2_00001.png`: dapur 16:9/1.4 MP, seed 953. Oven/balang
  diminta di dalam frame, outer quarter kanan kosong. Prompt `art/textures/world-qc-v2/mega-kitchen-v2.txt`.
- Eksport: `/mnt/storage/Projects/Comfy/.venv/bin/python pipeline/tools/world_qc_v2_assets.py`.
  Seamless blend 0.16 → 512px WebP konkrit; dapur → 1600×900 WebP.
  `storybook_assets.py` memasang override dapur semula pada eksport kit.
- Runtime: `airport_concrete.webp`, `circuit_concrete.webp`, `bg_megabowat.webp`.
  Dapur kini satu backdrop penuh; tiada scroll/tile yang memotong tepi kanan.
- Audit manual-fire Blep + runner labels + backdrop: `node pipeline/audit/world-qc-v2.mjs`.
  Bukti/senarai: `docs/WORLD_QC.md`, `art/style/world-qc-v2/`.

## QC susulan ending (2026-10-27)

Empat aset baharu dijana melalui built-in Imagegen: memori doodle berwarna, pasangan sebenar
versi kartun untuk kad 9, poster ensemble enam watak dengan tengah kosong, dan lilin alpha.
Sumber dan prompt lengkap: `art/ending-qc-2026-10-27/README.md`.
Eksport: `python3 pipeline/tools/ending_qc_assets.py` → `game/public/assets/ending/`.
Lilin hanya di-trim pada alpha dan dioptimumkan; flame/smoke kekal lapisan interaktif.
Poster dipaparkan `object-fit: contain` supaya watak tidak hilang pada skrin telefon.


## Ending komik, pembetulan gaya (2026-10-27)

Komposisi kad 9/Tamat disahkan Faris; rendering manusia dan taman sebelumnya terlalu
realistik. Built-in Imagegen mengedit dua gambar asal dengan arah cel animation/komik
(Ben 10 / Into the Spider-Verse), termasuk latar: outline, bayang blok, halftone.
Sumber baharu/prompt: `art/ending-comic-2026-10-27/README.md`. Eksporter
`python3 pipeline/tools/ending_qc_assets.py` kini turut menghasilkan `couple-comic.webp`
dan `ensemble-comic.webp`. Nama baharu mengelakkan cache gambar lama.


## Panorama mobile fullscreen (2026-10-27)

Sepuluh latar diluaskan ke sekitar 3:1 menggunakan **built-in Imagegen**, dengan
art sedia ada sebagai edit target. Sumber PNG + prompt penuh:
`art/mobile-fullscreen-2026-10-27/` (`generation.json`). Eksport WebP runtime:
`python3 pipeline/tools/mobile_fullscreen_assets.py` → `game/public/assets/mobile/`.
10 fail menambah 1.77 MB; keseluruhan 481 aset menjadi 69.3 MB. Sumber desktop asal
kekal. Runner menggunakan registration panorama seragam + mask jalan di
`runner/road.ts`, mengekalkan satu projection bagi road, pembahagi dan sasaran.
Audit dan screenshot: README dalam folder sumber serta `pipeline/audit/mobile-fullscreen*.mjs`.
