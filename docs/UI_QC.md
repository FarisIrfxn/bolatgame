# QC UI & HUD The Adventure of Qish


## Fullscreen mobile port (2026-10-27)

Paparan landscape kini **mengisi skrin penuh** dengan lebar adaptif dan tinggi logik
720. UI/HUD mengekalkan skala rujukan desktop, dengan placement mengikut sisi/notch.
Dunia 3D menunjukkan kawasan tambahan. Sepuluh panorama Imagegen sekitar 3:1
meliputi title, lapan boss dan Tamat; sumber 16:9 asal disimpan.

- Arena/hitbox boss kekal 1280×720 di atas latar lebar; input kekal tepat selepas rotate.
  Runner merender satu panorama berterusan dengan road bergerak dan tiga lorong asal.
- Finale memakai menu sentuh minimum 44px; memory ditap terus. Hit area butang kecil
  diluaskan tanpa membesarkan bentuknya. Fullscreen boleh dipilih pada title jika disokong.
- Notch/home indicator dikecualikan daripada HUD/panel penting. Pointer capture, multitouch,
  rotate, blur dan app switch diuji. Dialog dan surat boleh diskrol dengan jari tanpa skip.
- Render dunia fon: maksimum DPR 1.5, shadow 1024px; clock/Phaser maksimum 60 FPS untuk
  mengelakkan render 90/120 FPS yang tidak perlu. Kelajuan/game time dikekalkan.

**Validasi:** TypeScript/Vite lulus. Sembilan zon; semua lapan boss; title, HUD, peta,
reveal, phone; mimpi hingga ending sebenar lulus. Lapan saiz landscape/desktop/tablet,
serta portrait panel bersama. Menu finale ditap hingga damage sebenar; tap memory,
tiga lorong runner, gesture surat/dialog, pending mic + touch kek dan save ending lulus.
Simulasi safe area asimetri serta 120 Hz lulus. Production 5180 pada DPR 3 dan semua
JS/CSS dimuat sepadan byte build. Tiada page error dalam laporan selesai.

**Batas ujian:** Chromium emulation; fon fizikal, Safari, FPS, haba dan bateri peranti
belum diuji. Had 60 FPS ialah konfigurasi, bukan hasil penanda aras hardware.

[Bukti, gambar, sumber dan prompt](../art/mobile-fullscreen-2026-10-27/README.md) ·
[Laporan gabungan](../art/mobile-fullscreen-2026-10-27/qa/summary.json).


## Mobile landscape sama komposisi desktop (2026-10-27)

Permintaan Faris: main di fon yang dipusing landscape mesti mengekalkan rupa desktop.
Sebelum pas ini, breakpoint skrin pendek mengubah saiz HUD/title/dialog, manakala kamera
mengikut aspect ratio fon. Sekarang seluruh landscape memakai satu permukaan **1280×720**
yang diskala sekata. Ruang lebih pada skrin lebar/4:3 menjadi bingkai; gambar tidak diregang
atau dipotong. Kawasan notch/home indicator dikecualikan sebelum skala dikira.

- `core/viewport.ts` menyelaraskan saiz semasa loading, title, overworld, boss dan ending.
  `cqw/cqh` serta size container queries menggunakan permukaan game yang sama; portrait
  mengekalkan layout responsif. Auto pembesaran teks browser dimatikan.
- Kamera dan prompt dunia memakai koordinat game. Resolusi Three.js/postprocessing
  mengikut saiz paparan × DPR dengan had sedia ada, supaya skrin kecil tidak merender
  seluruh framebuffer desktop pada DPR penuh secara berlebihan.
- Phaser tidak lagi menskala dua kali. Bounds input diselaraskan dengan canvas sebenar
  selepas rotate, termasuk sebelum touch bermula. Runner menggunakan bounds sebenar juga.
- Joystick/A/B berada dalam lapisan fizikal berasingan; landscape pendek memakai joystick
  96px, A 64px dan B 48px. Knob mengikut radius joystick. Grid memory 568×320 tidak ditutup
  kawalan. Touch disembunyikan sepanjang mimpi; kedudukan air mata mengambil kira skala.
- Title portrait 320px turut dikemaskan supaya kotak watak tidak melimpah tepi.

Validasi lulus: TypeScript/Vite; 1280×720, 1600×900, 844×390, 667×375,
568×320, 932×430, 740×280 dan 1024×768. Ukuran/font logik dibanding dengan desktop;
semua lapan boss, peta, dialog, reveal, phone, senaman, mimpi dan ending disemak.
Tap memory dan tiga lorong runner kekal tepat selepas rotate. Ending sebenar selesai
menggunakan sentuhan pada kek semasa mic pending, surat, kad 9 dan butang Tamat;
progress kekal disimpan. Port 5180 diuji pada DPR 3; JS/CSS sama byte dengan build.
Tiada page error. Ini emulasi Chromium, **bukan ujian fon fizikal/Safari atau ukuran FPS**.

Bukti: [folder screenshot dan laporan](../art/mobile-landscape-2026-10-27/README.md).
Skrip: `pipeline/audit/mobile-landscape.mjs` (pilihan `--overlays` untuk bahagian overlay),
`mobile-landscape-story.mjs` dan `mobile-landscape-production.mjs`.


## Semakan terbaru: latar dijana, kad sebenar, peta Myvi & banner boss

Title menggunakan latar **ilustrasi 2D timbul yang dijana**, dengan langit pink dan jalan
rumput ringkas. Logo dibesarkan dan diletakkan bersama **Press Start di tengah**.
Bolat (manusia) di kiri dan Bowat (sloth) di kanan **kekal pada tempat masing-masing**;
hanya bingkai jalan bertukar. Sumber dan prompt: [art/UI](../art/ui/paper/README.md).

HUD kini memaparkan **gambar kad sebenar** dalam susunan mengelilingi kiraan koleksi.
Myvi membuka **peta interaktif** dengan lokasi semasa, destinasi dibuka dan laluan terkunci.
TV bilik membuka **pilihan boss berbentuk banner**, dengan muka boss dan latar arenanya.
Pilih dengan sentuhan/klik atau anak panah + A; B atau butang × menutup paparan.
Syarat unlock perjalanan dan syarat tamat cerita untuk rematch kekal.

![Title, HUD kad, peta Myvi dan banner boss semasa](../art/ui-navigation/overview.jpg)

| Paparan semasa | Desktop | Phone | Landscape | Phone kecil |
|---|---|---|---|---|
| Title | [Buka](../art/ui-navigation/desktop-title.png) | [Buka](../art/ui-navigation/phone-title.png) | [Buka](../art/ui-navigation/landscape-title.png) | [Buka](../art/ui-navigation/small-title.png) |
| Kad sebenar | [Buka](../art/ui-navigation/desktop-hud-cards.png) | [Buka](../art/ui-navigation/phone-hud-cards.png) | [Buka](../art/ui-navigation/landscape-hud-cards.png) | [Buka](../art/ui-navigation/small-hud-cards.png) |
| Peta Myvi | [Buka](../art/ui-navigation/desktop-map.png) | [Buka](../art/ui-navigation/phone-map.png) | [Buka](../art/ui-navigation/landscape-map.png) | [Buka](../art/ui-navigation/small-map.png) |
| Pilihan boss TV | [Buka](../art/ui-navigation/desktop-boss-select.png) | [Buka](../art/ui-navigation/phone-boss-select.png) | [Buka](../art/ui-navigation/landscape-boss-select.png) | [Buka](../art/ui-navigation/small-boss-select.png) |

Audit: `node pipeline/audit/navigation.mjs` dan `--small`.
Keputusan: [desktop/phone/landscape](../art/ui-navigation/verification.json),
[320×568](../art/ui-navigation/small-verification.json).
**Lulus:** empat saiz skrin, travel sebenar, destinasi terkunci, tutup/pulihkan gerakan,
lapan banner dan mula rematch. Desktop turut menguji menang rematch dan kembali ke bilik
tanpa kad tambahan. Tiada ralat browser/aset. Build production serta audit title/HUD production lulus.
Audit menggunakan browser desktop dan emulasi viewport/sentuhan; gamepad fizikal belum diuji.
Screenshot di bawah bahagian ini ialah sejarah; title, kad, Myvi dan TV semasa menggunakan pautan di atas.

## Semakan terdahulu: title ringkas, HUD game & outline putih

Title kini hanya **logo + Press Start**, langit dan jalan rumput. **Bolat (doodle manusia Qish)**
berjalan di kiri dan **Bowat si sloth** di kanan menggunakan bingkai jalan sedia ada;
kedua-duanya bergerak saling mengejar. Teks tambahan dan scenery terperinci dibuang.

Lokasi menggunakan label pin tanpa “Pulau Pokélove”. Kad ialah lapan medallion bulat
mengelilingi kiraan koleksi di kiri. Objective berada di hujung kanan dan kekal bertanda
**Complete** selepas cukup, termasuk apabila kembali ke zon. Sprite boss fight kini mempunyai
outline kertas putih seperti overworld; bingkai dan hitbox dikekalkan.

| Paparan terbaru | Desktop | Phone | Landscape |
|---|---|---|---|
| Title | [Buka](../art/ui-hud-refresh/desktop-title.png) | [Buka](../art/ui-hud-refresh/phone-title.png) | [Buka](../art/ui-hud-refresh/landscape-title.png) |
| Menu sambung | [Buka](../art/ui-hud-refresh/desktop-menu.png) | [Buka](../art/ui-hud-refresh/phone-menu.png) | [Buka](../art/ui-hud-refresh/landscape-menu.png) |
| Objective 3/6 | [Buka](../art/ui-hud-refresh/desktop-objective.png) | [Buka](../art/ui-hud-refresh/phone-objective.png) | [Buka](../art/ui-hud-refresh/landscape-objective.png) |
| Kad dikumpul + Complete | [Buka](../art/ui-hud-refresh/desktop-complete.png) | [Buka](../art/ui-hud-refresh/phone-complete.png) | [Buka](../art/ui-hud-refresh/landscape-complete.png) |
| Kembali ke zon, Complete kekal | [Buka](../art/ui-hud-refresh/desktop-return-complete.png) | [Buka](../art/ui-hud-refresh/phone-return-complete.png) | [Buka](../art/ui-hud-refresh/landscape-return-complete.png) |

Outline boss: [Bowat](../art/storybook/qa/bowat-game.png), [Bolat](../art/storybook/qa/bolat-game.png),
[Snorlax](../art/storybook/qa/snorlax-game.png), [Blep](../art/storybook/qa/blep-game.png),
[Mega Bowat](../art/storybook/qa/megabowat-game.png), [Bolat ex](../art/storybook/qa/bolatex-game.png),
[Qish ex](../art/storybook/qa/qishex-game.png), [Finale](../art/storybook/qa/finale-game.png).

Audit khusus: `pipeline/audit/hud-refresh.mjs`; keputusan:
[verification.json](../art/ui-hud-refresh/verification.json).

**Katalog 82 gambar di bawah ialah snapshot pas kertas pink sebelumnya.** Gunakan pautan terbaru
di atas untuk title, lokasi, kad, objective dan outline; snapshot terdahulu dikekalkan untuk perbandingan.

Snapshot **26 Oktober 2026**, selepas pas ilustrasi kertas pink, daripada game semasa di dev port **5181**. Snapshot retro terdahulu kekal di `art/ui-qc/` sebagai perbandingan sahaja.

**82 screenshot** desktop 1280×720 dan phone portrait 390×844. Save ujian berasingan daripada save browser pemain.

Bagi komen ikut ID, contohnya **A04: HUD kad terlalu kecil** atau **B02-game: tulisan susah baca**. Tandakan `[x]` selepas lulus; tulis perubahan pada ruang catatan.

Semak rupa, saiz tulisan, kontras, susunan, potret, arahan dan sama ada UI menutup benda penting. Komen teks dialog penuh kekal dalam [DIALOGUE_QC.md](DIALOGUE_QC.md).

Gaya semasa: ilustrasi licin 2D dengan depth; logo baharu; HUD/menu kertas berlapis, warna pink, cream, pita foto dan bayang lembut. Dialog menggunakan potret anime dan overworld kekal 3D bercat. Surat dan kad ke-9 masih draf. Album kad/Pokélove-dex serta album photobooth yang boleh dibuka belum ada.

Ini inventori visual, bukan keputusan lulus QC. Preview misi, workout dan pilihan menggunakan komponen runtime sebenar dengan nilai contoh; latar bilik mungkin kekal. Ending dicetus melalui dev di padang parti. Skip ditunjukkan dengan simulasi tiga kegagalan. Mikrofon fizikal, gamepad fizikal dan animasi tidak dinilai melalui gambar.

Ralat browser/aset semasa tangkapan: **0**. Butiran mesin: [manifest.json](../art/ui-paper-qc/manifest.json).

## Menu, HUD dan interaksi

[Buka contact sheet](../art/ui-paper-qc/01-menu-hud.jpg)

![Menu, HUD dan interaksi](../art/ui-paper-qc/01-menu-hud.jpg)

| Lulus | ID / screenshot saiz penuh | Catatan |
|---|---|---|
| [ ] | [A01 — Title / Press Start](../art/ui-paper-qc/A01.png) |  |
| [ ] | [A02 — Sambung / Main baru](../art/ui-paper-qc/A02.png) |  |
| [ ] | [A03 — Pengesahan reset save](../art/ui-paper-qc/A03.png) |  |
| [ ] | [A04 — HUD lokasi + koleksi kad + kawalan](../art/ui-paper-qc/A04.png) | Tiga kad diperoleh; lima slot terkunci. |
| [ ] | [A05 — HUD quest / koleksi 3 daripada 6](../art/ui-paper-qc/A05.png) | Preview komponen sebenar dengan nilai contoh. |
| [ ] | [A06 — Quest lengkap](../art/ui-paper-qc/A06.png) | Preview komponen sebenar dengan nilai contoh. |
| [ ] | [A07 — HUD berat / sasaran 80kg / bonus x2](../art/ui-paper-qc/A07.png) | Preview komponen sebenar dengan nilai contoh. |
| [ ] | [A08 — Panel senaman / kiraan rep](../art/ui-paper-qc/A08.png) | Preview panel; dunia belakang kekal bilik. |
| [ ] | [A15 — Overlay nama zon](../art/ui-paper-qc/A15.png) |  |

## Dialog, phone, pilihan dan retake

[Buka contact sheet](../art/ui-paper-qc/02-dialog-panel.jpg)

![Dialog, phone, pilihan dan retake](../art/ui-paper-qc/02-dialog-panel.jpg)

| Lulus | ID / screenshot saiz penuh | Catatan |
|---|---|---|
| [ ] | [A09 — Dialog Qish / ekspresi / petunjuk A](../art/ui-paper-qc/A09.png) | Ayat contoh untuk preview susun atur. |
| [ ] | [A10 — Dialog dua watak / spotlight Faris](../art/ui-paper-qc/A10.png) |  |
| [ ] | [A11 — Myvi / senarai destinasi](../art/ui-paper-qc/A11.png) | Preview senarai penuh menggunakan dialog pilihan yang sama. |
| [ ] | [A12 — Phone pagi / mesej tidak berbalas](../art/ui-paper-qc/A12.png) |  |
| [ ] | [A13 — Phone petang / Faris online dan membalas](../art/ui-paper-qc/A13.png) |  |
| [ ] | [A14 — Konsol bilik / menu main semula boss](../art/ui-paper-qc/A14.png) |  |
| [ ] | [A16 — Panel dev / retake](../art/ui-paper-qc/A16.png) | Panel rahsia untuk Faris; bukan menu pemain biasa. |
| [ ] | [A17 — Card reveal / holo / kad diperoleh](../art/ui-paper-qc/A17.png) |  |
| [ ] | [A18 — Card reveal / minta kad fizikal](../art/ui-paper-qc/A18.png) | Mode rakaman ON. |
| [ ] | [A19 — Intro mimpi / sofa / dialog](../art/ui-paper-qc/A19.png) |  |

## Semua 8 minigame

[Buka contact sheet](../art/ui-paper-qc/03-minigame.jpg)

![Semua 8 minigame](../art/ui-paper-qc/03-minigame.jpg)

| Lulus | ID / screenshot saiz penuh | Catatan |
|---|---|---|
| [ ] | [B01-game — Minigame 1: Bowat / platformer](../art/ui-paper-qc/B01-game.png) |  |
| [ ] | [B02-game — Minigame 2: Bolat / rhythm](../art/ui-paper-qc/B02-game.png) |  |
| [ ] | [B03-game — Minigame 3: Snorlax Twin / catcher](../art/ui-paper-qc/B03-game.png) |  |
| [ ] | [B04-game — Minigame 4: Blep / shooter](../art/ui-paper-qc/B04-game.png) |  |
| [ ] | [B05-game — Minigame 5: Mega Bowat / flappy](../art/ui-paper-qc/B05-game.png) |  |
| [ ] | [B06-game — Minigame 6: Bolat ex / memory](../art/ui-paper-qc/B06-game.png) |  |
| [ ] | [B07-game — Minigame 7: Qish ex / runner](../art/ui-paper-qc/B07-game.png) |  |
| [ ] | [B08-game — Minigame 8: Raja Nonchalant / finale](../art/ui-paper-qc/B08-game.png) |  |

## Intro semua boss dan bantuan skip

[Buka contact sheet](../art/ui-paper-qc/04-intro-boss.jpg)

![Intro semua boss dan bantuan skip](../art/ui-paper-qc/04-intro-boss.jpg)

| Lulus | ID / screenshot saiz penuh | Catatan |
|---|---|---|
| [ ] | [B01-intro — Intro boss 1: Bowat / platformer](../art/ui-paper-qc/B01-intro.png) |  |
| [ ] | [B02-intro — Intro boss 2: Bolat / rhythm](../art/ui-paper-qc/B02-intro.png) |  |
| [ ] | [B03-intro — Intro boss 3: Snorlax Twin / catcher](../art/ui-paper-qc/B03-intro.png) |  |
| [ ] | [B04-intro — Intro boss 4: Blep / shooter](../art/ui-paper-qc/B04-intro.png) |  |
| [ ] | [B05-intro — Intro boss 5: Mega Bowat / flappy](../art/ui-paper-qc/B05-intro.png) |  |
| [ ] | [B06-intro — Intro boss 6: Bolat ex / memory](../art/ui-paper-qc/B06-intro.png) |  |
| [ ] | [B07-intro — Intro boss 7: Qish ex / runner](../art/ui-paper-qc/B07-intro.png) |  |
| [ ] | [B08-intro — Intro boss 8: Raja Nonchalant / finale](../art/ui-paper-qc/B08-intro.png) |  |
| [ ] | [B09 — Bantuan / skip selepas 3 kegagalan](../art/ui-paper-qc/B09.png) | Kiraan gagal disimulasi melalui dev; UI skip sebenar. |

## Ending, surat dan kad rahsia

[Buka contact sheet](../art/ui-paper-qc/05-ending.jpg)

![Ending, surat dan kad rahsia](../art/ui-paper-qc/05-ending.jpg)

| Lulus | ID / screenshot saiz penuh | Catatan |
|---|---|---|
| [ ] | [C01 — SURPRISE / confetti](../art/ui-paper-qc/C01.png) |  |
| [ ] | [C02 — Kek mangga / 26 lilin / arahan tiup](../art/ui-paper-qc/C02.png) | Tanpa mikrofon; kawalan tahan A digunakan. |
| [ ] | [C03 — Ucapan birthday / confetti](../art/ui-paper-qc/C03.png) |  |
| [ ] | [C07 — Kisah Kita / memori 4 daripada 9](../art/ui-paper-qc/C07.png) |  |
| [ ] | [C08 — Kisah Kita / memori 5 daripada 9](../art/ui-paper-qc/C08.png) |  |
| [ ] | [C10 — Kisah Kita / memori 7 daripada 9](../art/ui-paper-qc/C10.png) |  |
| [ ] | [C12 — Kisah Kita / memori 9 daripada 9](../art/ui-paper-qc/C12.png) |  |
| [ ] | [C13 — Surat Faris](../art/ui-paper-qc/C13.png) | Teks surat masih draf / placeholder. |
| [ ] | [C14 — Kad rahsia ke-9](../art/ui-paper-qc/C14.png) | Rekaan kad masih sementara. |
| [ ] | [C15 — Tamat / kembali free roam](../art/ui-paper-qc/C15.png) |  |

## Kesemua 9 halaman Kisah Kita

[Buka contact sheet](../art/ui-paper-qc/06-kisah-kita.jpg)

![Kesemua 9 halaman Kisah Kita](../art/ui-paper-qc/06-kisah-kita.jpg)

| Lulus | ID / screenshot saiz penuh | Catatan |
|---|---|---|
| [ ] | [C04 — Kisah Kita / memori 1 daripada 9](../art/ui-paper-qc/C04.png) |  |
| [ ] | [C05 — Kisah Kita / memori 2 daripada 9](../art/ui-paper-qc/C05.png) |  |
| [ ] | [C06 — Kisah Kita / memori 3 daripada 9](../art/ui-paper-qc/C06.png) |  |
| [ ] | [C07 — Kisah Kita / memori 4 daripada 9](../art/ui-paper-qc/C07.png) |  |
| [ ] | [C08 — Kisah Kita / memori 5 daripada 9](../art/ui-paper-qc/C08.png) |  |
| [ ] | [C09 — Kisah Kita / memori 6 daripada 9](../art/ui-paper-qc/C09.png) |  |
| [ ] | [C10 — Kisah Kita / memori 7 daripada 9](../art/ui-paper-qc/C10.png) |  |
| [ ] | [C11 — Kisah Kita / memori 8 daripada 9](../art/ui-paper-qc/C11.png) |  |
| [ ] | [C12 — Kisah Kita / memori 9 daripada 9](../art/ui-paper-qc/C12.png) |  |

## Phone portrait: UI, HUD dan panel

[Buka contact sheet](../art/ui-paper-qc/07-phone-ui.jpg)

![Phone portrait: UI, HUD dan panel](../art/ui-paper-qc/07-phone-ui.jpg)

| Lulus | ID / screenshot saiz penuh | Catatan |
|---|---|---|
| [ ] | [M01 — Title / Press Start](../art/ui-paper-qc/M01.png) |  |
| [ ] | [M02 — Sambung / Main baru](../art/ui-paper-qc/M02.png) |  |
| [ ] | [M03 — Pengesahan reset save](../art/ui-paper-qc/M03.png) |  |
| [ ] | [M04 — HUD lokasi + koleksi kad + kawalan](../art/ui-paper-qc/M04.png) | Joystick dan butang A/B sebenar pada peranti touch. |
| [ ] | [M05 — HUD quest / koleksi 3 daripada 6](../art/ui-paper-qc/M05.png) | Preview komponen sebenar dengan nilai contoh. |
| [ ] | [M06 — Quest lengkap](../art/ui-paper-qc/M06.png) | Preview komponen sebenar dengan nilai contoh. |
| [ ] | [M07 — HUD berat / sasaran 80kg / bonus x2](../art/ui-paper-qc/M07.png) | Preview komponen sebenar dengan nilai contoh. |
| [ ] | [M08 — Panel senaman / kiraan rep](../art/ui-paper-qc/M08.png) | Preview panel; dunia belakang kekal bilik. |
| [ ] | [M09 — Dialog Qish / ekspresi / petunjuk A](../art/ui-paper-qc/M09.png) | Ayat contoh untuk preview susun atur. |
| [ ] | [M10 — Dialog dua watak / spotlight Faris](../art/ui-paper-qc/M10.png) |  |
| [ ] | [M11 — Myvi / senarai destinasi](../art/ui-paper-qc/M11.png) | Preview senarai penuh menggunakan dialog pilihan yang sama. |
| [ ] | [M12 — Phone pagi / mesej tidak berbalas](../art/ui-paper-qc/M12.png) |  |
| [ ] | [M13 — Phone petang / Faris online dan membalas](../art/ui-paper-qc/M13.png) |  |
| [ ] | [M14 — Konsol bilik / menu main semula boss](../art/ui-paper-qc/M14.png) |  |
| [ ] | [M15 — Overlay nama zon](../art/ui-paper-qc/M15.png) |  |
| [ ] | [M16 — Panel dev / retake](../art/ui-paper-qc/M16.png) | Panel rahsia untuk Faris; bukan menu pemain biasa. |

## Phone portrait: ending

[Buka contact sheet](../art/ui-paper-qc/08-phone-ending.jpg)

![Phone portrait: ending](../art/ui-paper-qc/08-phone-ending.jpg)

| Lulus | ID / screenshot saiz penuh | Catatan |
|---|---|---|
| [ ] | [N01 — SURPRISE / confetti](../art/ui-paper-qc/N01.png) |  |
| [ ] | [N02 — Kek mangga / 26 lilin / arahan tiup](../art/ui-paper-qc/N02.png) | Tanpa mikrofon; kawalan tahan A digunakan. |
| [ ] | [N03 — Ucapan birthday / confetti](../art/ui-paper-qc/N03.png) |  |
| [ ] | [N04 — Kisah Kita / memori 1 daripada 9](../art/ui-paper-qc/N04.png) |  |
| [ ] | [N05 — Kisah Kita / memori 2 daripada 9](../art/ui-paper-qc/N05.png) |  |
| [ ] | [N06 — Kisah Kita / memori 3 daripada 9](../art/ui-paper-qc/N06.png) |  |
| [ ] | [N07 — Kisah Kita / memori 4 daripada 9](../art/ui-paper-qc/N07.png) |  |
| [ ] | [N08 — Kisah Kita / memori 5 daripada 9](../art/ui-paper-qc/N08.png) |  |
| [ ] | [N09 — Kisah Kita / memori 6 daripada 9](../art/ui-paper-qc/N09.png) |  |
| [ ] | [N10 — Kisah Kita / memori 7 daripada 9](../art/ui-paper-qc/N10.png) |  |
| [ ] | [N11 — Kisah Kita / memori 8 daripada 9](../art/ui-paper-qc/N11.png) |  |
| [ ] | [N12 — Kisah Kita / memori 9 daripada 9](../art/ui-paper-qc/N12.png) |  |
| [ ] | [N13 — Surat Faris](../art/ui-paper-qc/N13.png) | Teks surat masih draf / placeholder. |
| [ ] | [N14 — Kad rahsia ke-9](../art/ui-paper-qc/N14.png) | Rekaan kad masih sementara. |
| [ ] | [N15 — Tamat / kembali free roam](../art/ui-paper-qc/N15.png) |  |

## Cara buka dalam game

- Game: http://localhost:5181/ · tunnel build production: https://qish.durioo.app (boleh berbeza daripada dev jika build belum dikemas kini).
- Tekan backquote (`) untuk panel dev, atau tap 5 kali laju bucu kiri atas pada phone.
- Dari panel dev boleh lompat zon, mula boss, menang boss, buka kad dan ulang intro.
- Phone: meja dalam bilik. Replay: konsol bilik selepas ending. Myvi: menu destinasi.
- Ending semula: bercakap dengan Faris di padang selepas tamat.

Jana semula katalog: `node pipeline/audit/ui-qc.mjs` kemudian `python3 pipeline/audit/ui-qc-catalog.py` dari root projek.


## Pembetulan teks dialog panjang — 26 Oktober 2026

Belon NPC kini turun baris dan membesar mengikut teks. Dialog utama yang melebihi ruang
bersambung halaman dengan **A · Sambung ayat**; pilihan jawapan menunggu halaman terakhir.
Footer mempunyai ruang sendiri supaya tidak menindih ayat.

Semakan automatik 242 ayat NPC serta dialog panjang dan pilihan lulus pada desktop, telefon
portrait/landscape dan skrin kecil 320×568. Screenshot katalog di atas ialah snapshot terdahulu;
bukti pembetulan baharu:

- [Belon NPC berbilang baris](../art/style/dialogue/wrapped-npc-bubbles.png)
- [Dialog panjang telefon portrait](../art/style/dialogue/phone-long-dialogue.png)
- [Dialog panjang telefon landscape](../art/style/dialogue/landscape-long-dialogue.png)
- [Keputusan audit](../art/style/dialogue/verification.json)

Screenshot dialog panjang menggunakan ayat ulangan untuk menguji sambungan halaman.


## QC susulan — 27 Oktober 2026

Semua item susulan Faris dipasang; screenshot di bawah menggantikan snapshot terdahulu
bagi komponen yang berubah. Build production tempatan port 5180 sudah dikemas kini.

| Pembetulan | Bukti terkini |
|---|---|
| Bukit Bintang: tapak parking ikut Myvi, tapak lama hilang | [Myvi](../art/ending-qc-2026-10-27/qa/bukit-bintang-myvi.png) |
| Bowat: teks pening di pusat arena | [Bowat menang](../art/ending-qc-2026-10-27/qa/desktop-bowat-win.png) |
| Bolat: arahan bawah BUSKING LORBEL dibuang | [Busking](../art/ending-qc-2026-10-27/qa/desktop-busking.png) |
| Bolat 2: tajuk dan kiraan kenangan muat panel | [Galeri Memori](../art/ending-qc-2026-10-27/qa/desktop-memory.png) |
| Myself: papan usikan datang rendah atas boulevard | [Runner](../art/ending-qc-2026-10-27/qa/runner-lowered-signs.png) |
| Nyomnyom: drip bulat yang menutup banner cookies dibuang | [Cookies](../art/ending-qc-2026-10-27/qa/cookies-banner.png) |
| Finale: panel tumbang hilang sebelum dialog seterusnya | [Finale](../art/ending-qc-2026-10-27/qa/desktop-finale-win.png) |
| Surprise: lilin ilustrasi pink/krim, flame/smoke interaktif | [Lilin](../art/ending-qc-2026-10-27/qa/desktop-candles.png) |
| Reveal: tiada lagi minta kad betul walaupun recording ON | [Card reveal](../art/ending-qc-2026-10-27/qa/card-reveal-no-request.png) |
| Kisah Kita: doodle asal diwarnakan dan diberi latar | [Memori kawan](../art/ending-qc-2026-10-27/qa/desktop-friends.png) |
| Kad 9: foto Faris/Qish dikartunkan bersama | [Kad 9](../art/ending-qc-2026-10-27/qa/desktop-secret-card.png) |
| Tamat: enam watak mengelilingi ruang tengah kosong | [Desktop](../art/ending-qc-2026-10-27/qa/desktop-the-end.png), [phone](../art/ending-qc-2026-10-27/qa/phone-the-end.png), [landscape](../art/ending-qc-2026-10-27/qa/landscape-the-end.png) |

Myvi dan ulang boss memakai satu ikon `!` dalam bulatan kuning, lebih rapat dengan objek.
BGM biasa diturunkan 0.8 → 0.16; rhythm 0.9 → 0.24 supaya SFX mendapat ruang.
Label kawalan bertukar mengikut input terakhir: Space/Esc, touch A/B, Xbox A/B,
PlayStation ✕/○ dan Switch B/A untuk butang standard bawah/kanan.

Semakan: build TypeScript/Vite; aliran penuh ending pada 1280×720, 390×844 dan 844×390;
ukuran teks Galeri Memori; kemenangan Bowat/finale; tiga zon dunia; aset production
dipadankan byte-for-byte; pagination dialog hingga 320×568. Controller diuji melalui
emulasi Gamepad API; gamepad fizikal dan tahap bunyi pada speaker sebenar belum diuji.
QA phone untuk ending menggunakan input keyboard untuk mempercepat aliran, jadi label
Space pada screenshot itu menunjukkan input yang benar-benar aktif.

Sumber dan prompt Imagegen: [artwork README](../art/ending-qc-2026-10-27/README.md).
Laporan mesin: [UI/ending](../art/ending-qc-2026-10-27/qa/verification.json),
[dunia/audio](../art/ending-qc-2026-10-27/qa/world-verification.json),
[production](../art/ending-qc-2026-10-27/qa/production-verification.json).

Touch juga diuji dengan gesture sebenar dalam emulasi telefon: tap A memulakan Mega Bowat,
kemudian input keyboard menyembunyikan touch controls.
Bukti [portrait](../art/ending-qc-2026-10-27/qa/phone-real-touch.png),
[landscape](../art/ending-qc-2026-10-27/qa/landscape-real-touch.png),
[laporan](../art/ending-qc-2026-10-27/qa/touch-verification.json).


## QC kedua — countdown Bowat, perspektif Myself & gaya komik (27 Oktober 2026)

Pembetulan ini mengatasi kedudukan runner dan gaya ending dalam pas sebelumnya.

| Item | Perubahan | Bukti |
|---|---|---|
| Bowat | “Sedia...” dan “Pijak Bowat!” kini berpusat pada (640,360), sama seperti mesej pening | [Sedia](../art/ending-comic-2026-10-27/qa/bowat-sedia.png), [Pijak](../art/ending-comic-2026-10-27/qa/bowat-pijak.png) |
| Myself | Projeksikan sasaran dari titik hilang jalan sebenar (161,104); tiada garis lorong tambahan dari atas | [Perspektif](../art/ending-comic-2026-10-27/qa/runner-perspective.png) |
| Myself dekat | Sasaran dekat dilukis di depan sprite Qish supaya perkataan tidak ditutup kepala; Space dalam keycap petak | [Jarak pukul](../art/ending-comic-2026-10-27/qa/runner-hit-window.png) |
| Space | Keycap segi empat membesar ikut perkataan, termasuk prompt dunia dan panel senaman | [Prompt](../art/ending-comic-2026-10-27/qa/desktop-space-prompt.png), [senaman 320px](../art/ending-comic-2026-10-27/qa/small-space-reps.png) |
| Masuk boss | Sedia ilustrasi/font sebelum fade; kekalkan kad intro sehingga frame pertama arena siap | [Muatan Bowat diperlahankan](../art/ending-comic-2026-10-27/qa/bowat-loading.png), [muatan runner](../art/ending-comic-2026-10-27/qa/qishex-loading.png) |
| Kad 9 | Komposisi pasangan kekal, tetapi muka dan taman kini cel shading grafik dengan outline/halftone | [Kad baharu](../art/ending-comic-2026-10-27/qa/desktop-secret-card.png) |
| Tamat | Enam watak dan tengah kosong kekal; latar dan manusia diolah semula sebagai ilustrasi komik 2D timbul | [Desktop](../art/ending-comic-2026-10-27/qa/desktop-the-end.png), [phone](../art/ending-comic-2026-10-27/qa/phone-the-end.png), [landscape](../art/ending-comic-2026-10-27/qa/landscape-the-end.png) |

Punca page warna solid: kad intro dibuang sebelum preload Phaser selesai, menyebabkan
warna latar renderer kelihatan. Kini canvas hanya didedahkan selepas render pertama;
runner memberi signal selepas lukisan pertamanya. Semua boss berkongsi pembetulan ini.

Sumber serta prompt Imagegen: [README komik](../art/ending-comic-2026-10-27/README.md).
Audit: `pipeline/audit/qc-comic-boss.mjs` (termasuk muatan perlahan semua lapan boss dan
main runner dengan input sebenar), `qc-followup.mjs` (desktop/phone/landscape), dan
`qc-followup-production.mjs` (fail production sepadan dengan eksport).
Laporan: [boss/keycap/runner](../art/ending-comic-2026-10-27/qa/boss-verification.json),
[ending](../art/ending-comic-2026-10-27/qa/verification.json),
[production](../art/ending-comic-2026-10-27/qa/production-verification.json).

Keputusan akhir pas kedua: semua semakan di atas lulus tanpa ralat browser. Runner
dimainkan hingga 10 SO TINY dengan 0 fail; tiada stroke garisan tambahan. Space prompt
berukuran 41×17px, panel senaman 65×27px, kedua-duanya border-radius 5px dan teks muat.
Countdown disahkan pada pusat (640,360). Build production tempatan sudah dikemas kini.


## Menunggu semakan Faris — pas pantas 27 Oktober 2026

Tamat kini memakai logo title, teks emas timbul, outline pink, bintang dan flourish hati.
Myself: jalan dipisahkan daripada scenery menjadi lapisan canvas bertekstur bergerak,
dengan marking perspektif; keycap aksi dan butang touch A berwarna pink terang/putih
untuk membezakan daripada papan usikan krim.

**QA sengaja tidak dijalankan atas permintaan Faris.** Screenshot dan keputusan audit
pas sebelumnya tidak mengesahkan perubahan terbaru ini. Build production sahaja dikemas kini.


### Susulan pantas: kontras Tamat dan lorong

Logo Tamat dibesarkan, tulisan pink gelap dengan outline putih di atas lapik krim.
Jalan, dua garis pembahagi dan pusat sasaran/Qish kini berkongsi `projectLane()`;
tiga lorong ditandakan oleh sempadan luar solid. **Belum QA, mengikut arahan Faris.**


## Ending penutup dikemas semula & QA — 27 Oktober 2026

Tamat, ucapan dan butang kini satu panel plum gelap; tajuk krim, ucapan terang,
butang magenta dengan label penuh dan anak panah. Label sambung tidak lagi pudar
semasa berkelip. Logo di atas panel; poster penuh kekal. Layout portrait memisahkan
poster di atas daripada logo dan ucapan di bawah.

- [Desktop 1280×720](../art/ending-keepsake-2026-10-27/desktop.png)
- [Telefon 390×844](../art/ending-keepsake-2026-10-27/phone.png)
- [Landscape 844×390](../art/ending-keepsake-2026-10-27/landscape.png)
- [Telefon kecil 320×568](../art/ending-keepsake-2026-10-27/small-phone.png)
- [Dalam aliran ending sebenar](../art/ending-keepsake-2026-10-27/actual-flow.png)

QA memakai `createEndScreen()` yang sama dengan game, stylesheet sebenar dan font
sebenar. Semua empat viewport muat tanpa clipping; logo/panel tidak bertindih;
klik, tap dan aktivasi keyboard berfungsi. Kontras minimum pada kedua-dua hujung
gradient: tajuk **8.76:1**, ucapan **8.44:1**, teks butang **4.98:1**.

Aliran sebenar: party → lilin → Kisah Kita → surat → kad 9 → Tamat → klik butang
menutup ending; save tamat kekal. CSS dan bundle production disahkan sepadan build.

Laporan: [layout/kontras/input](../art/ending-keepsake-2026-10-27/verification.json),
[aliran sebenar](../art/ending-keepsake-2026-10-27/flow-verification.json),
[production](../art/ending-keepsake-2026-10-27/production-verification.json).
Pas ini mengatasi nota “belum QA” bagi **ending sahaja**; runner tidak diaudit semula.

### Susulan tiga boss: render sisi (2026-10-27)

Bowat, Mega Bowat dan finale kini meluaskan canvas/kamera juga, supaya watak,
periuk, hujan dan lapisan gelap dapat dilukis di atas scenery sisi tambahan.
Fizik asal dikekalkan; periuk spawn/despawn di luar skrin, Qish mempunyai margin
sprite di tepi. Semakan hanya tiga isu ini; tiada audit penuh baharu.

TypeScript/Vite dan semakan fokus lulus: sprite Qish penuh pada kedua-dua hujung,
periuk kelihatan melepasi sempadan lama, dan partikel hujan sampai ke kedua-dua sisi.
Bukti: `art/mobile-fullscreen-2026-10-27/qa/wide-fixes/verification.json`.
