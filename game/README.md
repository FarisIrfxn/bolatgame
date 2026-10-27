# The Adventure of Qish — game

Vite + TypeScript. Overworld dalam Three.js, minigame dalam Phaser 3.

Nama tab browser dan Add to Home Screen: **Bolat The Game**. Ikon muka Bowat jelir lidah
dipasang melalui `index.html` dan `public/manifest.json` (Android/iOS, standalone).
Sumber/prompt: `../art/app-icon/`; eksport semula: `python3 pipeline/tools/app_icons.py`
dari root projek. Logo pada skrin title game kekal sedia ada.

## Jalankan

```bash
cd game
npm install
npm run dev
```

Dev server (hot reload): http://localhost:5181.

### Production / tunnel

`qish.durioo.app` ialah Cloudflare Tunnel → `localhost:5180`. Port tu mesti hidangkan **build production**
(dev server terlalu lambat lalu tunnel: ratusan fail kecil):

```bash
npm run serve        # build sekali + node serve.mjs di 5180
npm run watch        # (tab lain) build semula automatik bila fail berubah
```

`npm run watch` tak kosongkan `dist/` dulu (`--emptyOutDir=false`): dulu watcher tersekat separuh jalan lepas
banyak suntingan, `dist/index.html` hilang dan tunnel bagi 404. Kalau laman 404 juga, jalankan `npx vite build` sekali.

`serve.mjs` set `Cache-Control` immutable untuk bundle ber-hash dan `no-cache` untuk `index.html`.

### GitHub / Netlify

Konfigurasi root `../netlify.toml`: base `game`, build `npm run build`, publish `dist`, Node 22.
Commit `public/` dan `package-lock.json`; Netlify membina daripada eksport siap, tanpa ComfyUI/Python.
Panduan commit/ignore, hasil audit dan isu sebelum release:
[`docs/DEPLOYMENT_READINESS.md`](../docs/DEPLOYMENT_READINESS.md).

## Skrin tajuk

Sebelum title, loading screen menggunakan latar pastel mimpi dan Bowat idle. Semua 481 aset
game (sekitar 69 MB, termasuk muzik) dimuat sebelum Press Start muncul. Bar MB/peratus
berdasarkan byte sebenar, bukan timer. Selepas download, sprite/tekstur kongsi disediakan;
tiada GLB di-decode pada title. Fail yang gagal boleh dicuba semula tanpa mengulang fail yang siap.

Model GLB di-decode **mengikut bandar** ketika `Sediakan [bandar]…` dipaparkan, maksimum
dua fail serentak. Bandar lama dibersihkan dahulu; model yang turut digunakan destinasi
dikekalkan, selebihnya dilepaskan bersama decoded ImageBitmap. Download awal kekal penuh.
Senarai dependency ialah `ZONE_MODELS` dalam `src/overworld/models.ts`; tambah model baharu
ke senarai bandar yang memakainya. Uji semua keadaan cerita/cache/retry dengan
`node pipeline/audit/zone-models.mjs` dari root (dev 5181; `GAME_URL`/`PW_CORE` pilihan).

Pada touch, boss Phaser memakai Canvas 2D supaya peralihan dari bandar 3D tidak
membuka WebGL context kedua. Setiap boss hanya memuat sprite dan item yang dipakai
olehnya (`src/minigames/storybook.ts`). Doodle NPC bandar lama dilepaskan apabila
bertukar bandar; sprite Qish/Bowat kekal.

Untuk masalah pada phone, buka game dengan `?diag=1`. Butang **Log** tersedia dari
awal download dan memaparkan log tempatan yang kekal selepas refresh: peringkat load bandar/boss, FPS dunia setiap
5 saat, bilangan sumber GPU, tekstur yang tertutup, kehilangan WebGL dan ralat JS.
Tekan **Log → Salin log** dan hantar kandungannya. Log disimpan dalam localStorage pada
peranti itu sahaja. Audit Chromium touch:
`node pipeline/audit/mobile-stability.mjs`, `bb-load.mjs`, `zone-memory.mjs`.

Senarai/saiz/revisi aset dijana terus daripada `public/assets/` oleh plugin Vite dalam
`vite.config.ts`, jadi aset eksport mesti committed. `src/boot.ts` ialah entry HTML;
ia memuat `main.ts` selepas download. `public/asset-cache.js` menyajikan aset daripada
cache mengikut hash kandungan supaya renderer/audio tidak memuat turun semula semuanya.
HTML serta bundle JS/CSS tidak disimpan oleh worker ini; perubahan deployment kekal dikemas kini.
Browser yang menyekat service worker/storage menggunakan HTTP cache biasa sebagai fallback.
Ini tidak menyediakan offline reload keseluruhan app.

Audit loading/mikrofon: `node pipeline/audit/startup-mic.mjs` dari root (default production
5190, dev 5191; boleh set `GAME_URL`/`DEV_URL`). Kes microphone menggunakan simulasi browser.

Lepas tekan A: **Sambung** (zon terakhir, semua kad kekal) atau **Main baru** (minta pengesahan; reset kad, zon dan
senarai kad "dah serah", tapi kekalkan tetapan mode rakaman). Sebelum rakaman sebenar, pilih **Main baru**.

Latar title: ilustrasi dijana `assets/ui/title-meadow.webp`; logo + Press Start di tengah.
Bolat di kiri dan Bowat di kanan hanya menukar bingkai jalan, tanpa bergerak kedudukan.

## Peta Myvi dan TV bilik

Interaksi Myvi membuka peta perjalanan. Destinasi terkunci boleh dilihat tetapi tidak boleh
dimasuki; lokasi semasa ditanda. Pilih dengan klik/sentuhan atau anak panah + A.
TV bilik selepas tamat cerita membuka banner boss yang sudah dikalahkan untuk rematch.
Butang ×, B atau Esc menutup kedua-dua paparan dan memulihkan kawalan overworld.
Komponen: `src/ui/travelMap.ts`, `bossSelect.ts`, `picker.ts`, `navigation.css`.
Audit browser: `node pipeline/audit/navigation.mjs` dari root repo; `--small` untuk 320×568.

## Paparan desktop dan fon landscape

Landscape mengisi seluruh ruang browser dengan tinggi logik 720; lebarnya mengikut
nisbah sebenar skrin. Dunia 3D menunjukkan kawasan tambahan di sisi. Title, boss dan
Tamat memakai panorama dijana di `public/assets/mobile/`. Safe area melindungi HUD,
panel dan sentuhan; latar diteruskan di bawah notch/home indicator. Portrait kekal
responsif. `src/core/viewport.ts` mengikuti visual viewport termasuk perubahan browser UI.

CSS layout memakai `cqw/cqh` dan `@container game`. Teks menggunakan `--ui-vw`, iaitu
lebar rujukan 1280/100 pada landscape, supaya huruf tidak membesar ikut lebar fon.
`ui/mobile.css` memusatkan panel dan menambat HUD kepada sisi yang selamat. Joystick/A/B
serta hit area interaktif memakai saiz piksel fizikal. Tombol fullscreen pada title
muncul jika browser touch menyokongnya; manifest installed app meminta landscape.

Boss Phaser mengekalkan bounds gameplay 1280×720, sementara kamera/render window
memenuhi landscape: paparan lebih lebar menunjukkan kawasan tambahan di sisi, skrin
laptop 16:10 menunjukkan sedikit kawasan tambahan atas/bawah tanpa meregangkan sprite.
Latar penuh skrin mengisi kawasan luar arena; portrait kekal 16:9 berpusat. Canvas mengukur
semula bounds sentuhan selepas rotate. Runner turut memenuhi landscape dengan crop kecil
di sisi jika skrin lebih sempit, dan kekal 16:9 berpusat dalam portrait. Finale mempunyai menu move sentuh
native (minimum 44px); memory boleh ditap terus tanpa joystick menutup grid.

Input dilepaskan selepas rotate, blur, pointer cancel atau app switch. Dialog/surat
boleh diskrol dengan jari. Renderer dunia memilih profil sekali berdasarkan maklumat
peranti/GPU: tinggi untuk GPU diskret, sederhana untuk kebanyakan peranti, dan rendah
untuk iOS serta peranti Android berspesifikasi rendah. Profil rendah mengehadkan DPR
kepada 0.8, mematikan shadow dan post-processing; sederhana memakai DPR 1.25 dan shadow
1024px; tinggi memakai DPR 2, shadow 2048px dan tilt-shift. Tiada pertukaran profil
semasa bermain. Frame clock dan Phaser dihadkan kepada 60 FPS pada peranti touch. Ini
had render, bukan jaminan FPS pada semua perkakasan. Semua **481 aset / 69.3 MB** masih
dimuat di awal, mengikut keputusan Faris; panorama menambah 1.77 MB.

Profil dan maklumat GPU yang browser dedahkan direkodkan bersama FPS/kiraan sumber GPU
melalui `?diag=1`. Safari boleh menyembunyikan model GPU dan RAM; dalam keadaan itu profil
iOS rendah dipilih secara konservatif.

Audit: `pipeline/audit/mobile-fullscreen*.mjs`. Sumber/prompt Imagegen, exporter,
screenshot dan laporan: [mobile fullscreen](../art/mobile-fullscreen-2026-10-27/README.md).
Ujian menggunakan emulasi Chromium; fon fizikal/Safari dan prestasi peranti belum diukur.

## Kawalan

| | Keyboard | Gamepad | Phone |
|---|---|---|---|
| Gerak | Arrow / WASD | Stick kiri / D-pad | Joystick kiri |
| A (cakap, lompat, teruskan) | Space / Enter / Z | A (Xbox) / ✕ (PS) | Butang A |
| B (skip) | Esc / X | B / ○ | Butang B |

Label arahan ikut peranti yang sedang digunakan: **Space/Esc** pada keyboard, **A/B**
pada touch, dan simbol yang sepadan pada controller. Switch menggunakan B/A untuk
butang bawah/kanan standard. Touch controls hilang apabila keyboard/controller aktif.

## Panel dev rahsia (untuk retake masa rakaman)

- Keyboard: tekan **`** (backquote, kiri nombor 1)
- Phone: tap **5 kali laju** di bucu kiri atas

Boleh lompat ke mana-mana zon, mula boss zon semasa, menang boss serta-merta, unlock/reset kad, dan on/off "mode rakaman"
(nota “Pusing belakang!” pada kad rahsia yang belum diserah; reveal kad biasa tiada prompt fizikal).

## Struktur

| Folder | Isi |
|---|---|
| `src/core/` | Input (keyboard/gamepad/touch), frame loop, save (localStorage), SFX sintetik |
| `src/ui/` | Dialog, card reveal, HUD, kawalan touch, panel dev |
| `src/overworld/` | Enjin overworld: muat zon, watak paper-cutout, tilt-shift, prop asas |
| `src/zones/` | 10 zon pulau (`zones.ts`), layout biasa & prop tema |
| `src/minigames/` | `framework.ts` (intro, skip, menang), `registry.ts` (8 boss), satu folder setiap minigame |
| `src/ending/` | Ending: party, kek & lilin (mikrofon), Kisah Kita, surat, kad ke-9 |
| `src/content/` | **Semua dialog** (`script.ts`) dan data kad. Edit teks di sini. |
| `public/assets/` | Dieksport oleh `pipeline/tools/export_game_assets.py` |

## Aset

### Muzik

Lima cover 8-bit daripada `music/` sudah disambungkan ke title, overworld, boss,
rhythm dan ending. Timecode chorus dan arahan eksport: [`music/README.md`](../music/README.md).
Overworld main lagu penuh dan tidak mula semula semasa tukar zon. Title mula
berbunyi selepas gesture pertama yang dibenarkan browser. Audit audio sebenar:
`node pipeline/audit/music.mjs` dari akar projek (dev server 5181).

Jangan edit `public/assets/chars` atau `cards` dengan tangan; jalankan semula:

```bash
python3 pipeline/tools/export_game_assets.py
```

Sumber Qish di `art/chars/qish/`: 4 bingkai langkah bagi arah depan, belakang dan sisi;
potret dialog `normal` dan `excited`. `PaperSprite` memilih bingkai berjalan bila Qish bergerak,
dan `Line.expression: "excited"` memilih potret mata besar untuk baris dialog yang sesuai.

Sumber Faris dan Babah di `art/chars/faris/` dan `art/chars/babah/` (README masing-masing ada
rujukan, prompt dan cara jana semula). Kedua-duanya memakai sprite doodle dengan idle kelip/senyum
dan potret dialog anime berasaskan foto. Rambut sprite Faris kekal panjang mengikut doodle Qish.
`FARIS_EXPRESSIONS` / `BABAH_EXPRESSIONS` dalam `src/ui/dialog.ts` menyenaraikan ekspresi;
kedua-duanya mengekalkan potret anime atas pilihan Faris.


### Aset ending & QC susulan

Gambar memori kawan, kad 9, poster Tamat dan lilin sudah dijana; sumber serta prompt
di `art/ending-qc-2026-10-27/README.md`. Eksport semula dari root:
`python3 pipeline/tools/ending_qc_assets.py`. Override peribadi masih diterima melalui
`ref/kad-rahsia.*` dan `ref/tamat.*`.

Audit susulan dari root projek: `node pipeline/audit/qc-followup.mjs`,
`qc-followup-world.mjs`, `qc-followup-touch.mjs`, `qc-followup-production.mjs`.
Semua skrip berada dalam `pipeline/audit/`; production audit memerlukan 5180 dan 5181.
Bukti dan senarai pembetulan di `docs/UI_QC.md`.


### Intro boss tanpa frame loading kosong

`prepareMinigame()` memuat font/ilustrasi intro sebelum overworld ditutup.
`runMinigame()` memasang kad intro sebelum fade dibuka; kad hanya dibuang selepas
render pertama Phaser atau `CustomMinigame.ready` (runner). Jangan buang intro ketika
START ditekan sahaja, kerana preload masih boleh berjalan.

Gaya terbaru kad 9/Tamat menggunakan `couple-comic.webp` / `ensemble-comic.webp`;
komposisi lama kekal, semua rendering ditukar kepada ilustrasi komik cel shading.
Sumber/prompt: `art/ending-comic-2026-10-27/README.md`.
Audit boss/keycap/perspektif: `node pipeline/audit/qc-comic-boss.mjs`.
