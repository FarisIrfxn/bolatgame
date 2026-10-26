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

Sebelum title, loading screen menggunakan latar pastel mimpi dan Bowat idle. Semua 471 aset
game (sekitar 68 MB, termasuk muzik) dimuat sebelum Press Start muncul. Bar MB/peratus
berdasarkan byte sebenar, bukan timer. Selepas download, model dan sprite disediakan sebelum
kawalan title diaktifkan. Fail yang gagal boleh dicuba semula tanpa mengulang fail yang siap.

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
