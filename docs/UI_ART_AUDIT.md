# Audit seni & UI Pokélove — 26 Oktober 2026

> **Arah terkini:** nama game **The Adventure of Qish**, UI kertas pink berlapis dan
> ilustrasi minigame licin. Pas retro telah diganti. Katalog semasa: [UI_QC.md](UI_QC.md);
> aset/prompt baharu: [art/ui/paper](../art/ui/paper/README.md), `art/storybook/`.
> Audit di bawah merekod pas scrapbook terdahulu; sebahagian backlog art boss/minigame
> kini telah dilaksanakan dalam kit ilustrasi baharu.

Pas ini memfokuskan lapisan yang pemain nampak sepanjang game. Rujukan dunia kekal
Labu Lanjut, `art/style/anchor_painted_00003.png` dan `docs/ZONE_ART_GUIDE.md`.

## Arah seni UI

**Scrapbook pengembaraan Qish:** kertas krim, pink susu, lilac, cahaya hangat, foto sebenar,
kad koleksi, pita dan tulisan tangan sebagai aksen. Bentuk bulat dan bayang lembut menyambung
UI dengan dunia 3D bercat. Outline hitam doodle watak dikekalkan sebagai identiti Qish.
Nunito untuk arahan yang mudah dibaca, Bagel untuk tajuk, Gaegu untuk kenangan.

Palet: ink `#59465d`, paper `#fffaf0`, rose `#c45e83`, lilac `#b175a4`, butter `#f3ca79`.
Tema bersama: `game/src/ui/theme.css`; layout/animasi asas: `game/src/style.css`.

## Sudah dikemaskan dalam pas ini

| Bahagian | Hasil |
|---|---|
| Tajuk | Ilustrasi pulau kampung, rumah pink, Myvi, jambatan; photo strip sebenar + Bowat sebagai keepsake. Copy fokus mencari Faris supaya birthday kekal kejutan. |
| Menu | Pilihan kertas dengan keadaan terpilih pink; keyboard/gamepad/tap dan pengesahan reset dikekalkan. |
| HUD lokasi | Kad lokasi, nama zon jelas dan kemajuan petunjuk bilik berasingan. |
| HUD kad | Thumbnail kad diperoleh, slot bernombor untuk kad terkunci, urutan boss sebenar `[5,3,7,1,2,6,4,8]`. |
| Misi & senaman | Bar progres, label/kiraan berhierarki, keadaan lengkap, warna selaras. |
| Dialog & pilihan | Kertas berbingkai halus, tab nama pink, petunjuk A, pilihan terpilih jelas; art ekspresi sedia ada dikekalkan. |
| Interaksi & touch | Palet pink/krim dan bayang lembut. Kawalan touch disorok pada halaman yang menerima tap sendiri. |
| Intro 8 boss | Tiket pertemuan bergambar + langkah bernombor. Watak tanpa art sendiri menggunakan belakang kad misteri. Art evolusi tidak dibocorkan. |
| Finale | Latar Sepang ComfyUI, bayang sentuhan watak, panel HP dan menu move kertas, sumber kad serta DMG/HP. Hujan/tint cuaca kekal dinamik. Input penutup dialog tidak lagi terus memilih move. |
| Card reveal | Spotlight lilac/rose-gold, bingkai, nama dan progres koleksi. Holo/flip dan serahan kad fizikal dikekalkan. |
| Kisah Kita | Scrapbook, pita foto dan dua poskad Cosy Place/Sunway menggantikan kotak kosong. Poskad ditandakan sebagai ilustrasi. |
| Surat & tamat | Kertas bergaris, butang sambung berasingan, tatal keyboard/gamepad/touch, palet ending dan kad rahsia selaras. |

Dialog Babah dalam parti dibuang supaya selari dengan keputusan terkini dalam log projek;
Babah kekal di KLIA. Surat sebenar masih perlu ditulis Faris.

## Baki yang masih terasa prototaip

| Keutamaan | Tempat / fail | Bukti & cadangan kerja |
|---|---|---|
| **P0: sebelum rakaman** | `content/ending.ts`: `LETTER` | Masih teks arahan placeholder. Faris perlu tulis surat sebenar; ini kemuncak emosi. Pembaca surat sudah siap. |
| **P1: Faris** | `assets/chars/faris_*`, `intro/dream.ts`, `finaleBattle.ts` | Pas watak 2026-10-26: sprite doodle berwarna 3 arah + idle kelip/senyum dan 10 potret anime siap. Rambut sprite kekal panjang mengikut doodle. Pose cubit/duduk khusus masih boleh ditambah kemudian. |
| **P1: Mega Qish** | `minigames/finale/finaleBattle.ts`: `megaEvolve()` | Masih sprite belakang Qish dibesarkan/tint jingga. Perlu pose evolusi khusus, siluet cahaya, transformasi jelas dan VFX Hot Giler. |
| **P1: Mega Bowat** | `minigames/megabowat/megaBowatFlappy.ts` | Masih memuat `bowat_side.png`. Perlu bentuk evolusi tersendiri, animasi PROT, kenyang dan reaksi. |
| **P1: art boss lain** | `snorlax/snorlaxCatcher.ts`, `blep/blepShooter.ts`, `bolat/bolatRhythm.ts` | Snorlax blob geometri, Blep kapal + Qish, Bolat menggunakan set Qish/Faris. Perlu asset sheet setiap boss berpandukan kad fizikal. |
| **P1: visual 7 minigame lain** | `minigames/{bowat,bolat,snorlax,blep,megabowat,bolatex,runner}/` | Backdrop/props banyak `Graphics.fillRect`, HUD hitam tebal dan ikon emoji. Tema DOM tidak mengubah canvas Phaser. Buat kit panel Phaser bersama, backdrop bercat dan sprite makanan/cookies/periuk/awan/nota. |
| **P1: phone portrait** | `minigames/framework.ts` dan scene | Canvas Phaser masih 1280×720 FIT. UI muat tetapi ruang permainan kecil. Perlu susun HUD/touch per genre dan semak kebolehbacaan pada phone sebenar. |
| **P1: enam zon baki** | `zones/lorbelProps.ts`, `tasikProps.ts`, `nyomProps.ts`, `putrajayaProps.ts`, `sepangProps.ts`, KLIA dalam `zones.ts` | Kit model khusus runtime baru meliputi Labu, bilik dan Bukit Bintang. Zon lain berkongsi beberapa prop cantik tetapi landmark/permukaan utama masih geometri. Audit satu demi satu ikut `ZONE_ART_GUIDE.md`. |
| **P2: mimpi sofa** | `intro/dream.ts`, dream dalam `style.css` | Sofa masih shape CSS; Faris sudah memakai sprite doodle berwarna. Perlu ilustrasi sofa/ruang lembut serta pose cubit/merajuk/pergi yang lebih terarah. |
| **P2: kek interaktif** | `ending/cake.ts` | Kek canvas 2D beroutline tebal berbeza daripada kek 3D di padang. Gunakan art/model kek mango yang sama; lilin/flame/smoke kekal interaktif. |
| **P2: kad ke-9** | `content/ending.ts`: `CARD_9` | Bingkai sudah selaras tetapi art doodle/layout masih sementara. Perlu reka kad akhir yang sama dengan cetakan fizikal. |
| **P2: album koleksi** | `ui/hud.ts`, `ui/cardReveal.ts` | HUD menunjukkan kad, tetapi belum ada Pokélove-dex/album untuk buka kad besar dan photo strip. Reka binder, zoom dan kawalan tutup yang konsisten. |
| **P2: tanda dunia** | `overworld/items.ts`, pembina `?`/`!` | Item doodle dan penanda kuning lama masih berguna tetapi kurang seragam. Reka keluarga ikon jejak/misi/lengkap dengan kontras jelas di atas rumput/air. |
| **P2: fast travel & replay** | `main.ts`: Myvi/konsol, `ui/dialog.ts` | Masih senarai pilihan generik. Cadangan: peta poskad untuk Myvi dan rak tiket untuk replay selepas semua scene siap. |
| **P2: audio** | `core/music.ts`, `music/cues.json` | Lima cover 8-bit Faris sudah dipasang: Joji title/boss, Laufey overworld penuh + rhythm ikut jam audio, Bryant ending. Potongan chorus/mix boleh dilaras selepas Faris dengar. Busker/piano sementara disenyapkan; SFX masih sintetik. |
| **P3: loading & performance** | `overworld/models.ts` | Semua model dipreload sekali. Tambahan art membesarkan muat turun; perlukan loading bertema, muat mengikut zon dan ukuran fps pada phone sebenar. |

**Urutan paling berbaloi:** Faris + Mega Qish/Mega Bowat → kit HUD Phaser dan satu minigame
sebagai rujukan → Lorbel/Tasik Lily/KLIA/Nyomnyom/Putrajaya/Sepang satu demi satu →
mimpi/kek/kad rahsia → album dan menu khas. Surat sebenar boleh disiapkan serentak.

## Bukti & cara semak

- `art/style/ui/`: desktop, phone 390×844 dan landscape 844×390.
- `pipeline/audit/ui.mjs`: tajuk, batal reset tanpa kehilangan save, thumbnail, sempadan HUD/dialog/intro dan muat finale.
- `pipeline/audit/story-ui.mjs`: finale dengan input sebenar, evolusi, ending, tatal surat dan inventori visual minigame.
- Keputusan mesin: `verification.json` dan `story-verification.json` dalam folder bukti selepas setiap skrip lulus.
- Audit menggunakan Chromium berasaskan GPU. Gamepad fizikal, mikrofon sebenar dan fps phone sebenar masih perlu sesi main di peranti.

**Keputusan akhir:** build TypeScript/Vite lulus, 27 semakan UI lulus; finale sampai kad #8,
ending lengkap pada ketiga-tiga saiz (9 memori, surat panjang, kad rahsia, Tamat) lulus tanpa
ralat browser/aset. Tujuh minigame lain berjaya dimuat untuk semakan seni; ini bukan ujian
menang/kalah penuh bagi ketujuh-tujuhnya. Production port 5180 turut disemak.
Pratonton ringkas: `art/style/ui/overview.jpg`; perbandingan HUD: `hud-before-after.jpg`;
inventori visual minigame: `minigames-backlog.jpg` dalam folder yang sama.

## Aset baharu

Semua dijana secara tempatan dengan **ComfyUI Qwen Image 2.1 Turbo**, kemudian WebP untuk
runtime. Tiada fallback Imagegen diperlukan. Prompt: `art/ui/prompts/`; imej asal: `art/ui/`;
runtime: `game/public/assets/ui/`.

| Runtime | Sumber dipilih | Seed |
|---|---|---|
| `title-island.webp` | `ui_title_island_00001.png` | 88 |
| `sepang-arena.webp` | `ui_sepang_arena_00002.png` | 88 |
| `cosy-memory.webp` | `ui_cosy_memory_00001.png` | 88 |
| `sunway-memory.webp` | `ui_sunway_memory_00001.png` | 88 |

Calon Sepang pertama ditolak kerana terselit dua watak tambahan; dijana semula sebagai
kajian persekitaran kosong. Tiada teks penting dibakar ke dalam gambar.
