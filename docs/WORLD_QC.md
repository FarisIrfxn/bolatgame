# QC dunia & boss — 26 Oktober 2026

## Susulan QC2 — 27 Oktober 2026

- **Bukit Bintang:** Myvi kini di ruang terbuka sebelah kedai “Untuk disewa”, bukan di belakang bangunan.
  Petak, collider, prompt dan spawn dipindah sekali. Kedua-dua MRT dianjak 2 m menjauhi deret kedai,
  termasuk collider tangga, exit dan titik kembali. Photo spot lebih dekat; kabus beralih 65–170 m
  ketika view aktif supaya bangunan latar tidak hilang dalam kabus.
- **KLIA:** tekstur konkrit apron baharu, sejuk kelabu perak, menggantikan batu blok pada apron dan forecourt.
  Garisan stand, runway, parking dan marking penerbangan dikekalkan selepas semakan tekstur lain.
- **Putrajaya:** jalan jambatan memakai `putra_road` yang sama dengan boulevard; sidewalk memakai pavers
  bercat yang sama dengan tebing, dan struktur menggunakan plaster bercat. Bangku sebelah aiskrim,
  gerai air kelapa/tebu, canopy, vendor, collider dan promptnya dibuang.
- **Sepang:** concourse/paddock/fan zone memakai tekstur konkrit pearl-grey baharu tanpa batu bata atau grid.
- **Mega Bowat:** latar dapur baharu dengan balang dan oven jauh dari tepi kanan. Ia dipaparkan sebagai
  satu ilustrasi penuh; scroll tile lama dibuang supaya tiada sambungan berulang yang terpotong.
- **Qish ex:** figura Qish ex diturunkan ke sidewalk hadapan dengan bayang sentuhan; papan kini memilih
  “GEMOK!”, “BOLAT!”, “EMOK!”, “80 KG!” atau “FAT ASS!” sebelum dipukul menjadi SO TINY.
- **Blep:** kapal Faris dikecilkan 360 → 250 px (potret 68 → 48 px), hitbox ikut saiz. **Satu tekanan A
  menembak satu hati**; tahan A tidak mengulang tembakan. A ketika bar penuh menggunakan Omey Blast.
  Arahan intro dan mesej dalam game dikemas kini. Damage hati 2 supaya mod manual kekal ringan.

Semakan: build TypeScript/Vite lulus; audit laluan empat zon dan kamera Bukit Bintang empat saiz lulus.
`check.mjs` Bukit Bintang/Putrajaya: tiada overlap, pickup terhalang atau error; kedua-dua exit boleh dicapai.
`pipeline/audit/world-qc-v2.mjs` mengesahkan 0 tembakan idle, satu tembakan setiap tekanan, tiada ulang
semasa tahan A, charged blast serta **Blep dimenangi dengan input manual sebenar**. Latar dapur tiada
TileSprite; beberapa variasi papan runner diperhatikan pada spawn sebenar. Tiga boss disemak desktop/phone.

Production port 5180 juga lulus pada empat zon; [production.json](../art/style/world-qc-v2/production.json).
Grid 4×4 (64 frame) disemak:
[Bukit Bintang](../art/style/world-qc-v2/grid-sunway.jpg), [KLIA](../art/style/world-qc-v2/grid-angkasa.jpg),
[Putrajaya](../art/style/world-qc-v2/grid-bukit.jpg), [Sepang](../art/style/world-qc-v2/grid-sepang.jpg).
Perbandingan [KLIA sebelum/selepas](../art/style/world-qc-v2/angkasa-before-after.jpg).

Bukti terkini: [boss-verification.json](../art/style/world-qc-v2/boss-verification.json),
[Myvi](../art/style/world-qc-v2/after-sunway-1.png), [photo spot](../art/style/world-qc-v2/after-sunway-0.png),
[KLIA](../art/style/world-qc-v2/after-angkasa-0.png), [bridge](../art/style/world-qc-v2/after-bukit-2.png),
[Sepang](../art/style/world-qc-v2/after-sepang-1.png), [Mega Bowat](../art/style/world-qc-v2/boss-megabowat.png),
[Qish ex](../art/style/world-qc-v2/boss-qishex.png), [Blep](../art/style/world-qc-v2/boss-blep.png).

Aset baharu dijana **ComfyUI Qwen Turbo seed 953**. Prompt swatch dan dapur:
`art/textures/world-qc-v2/*.txt`; sumber yang diluluskan `qc2_*_00001.png` dalam folder itu dan
`art/storybook/world-qc-v2/qc2_kitchen_v2_00001.png`. Calon awal berikon/bergarisan ditolak.
Eksport boleh diulang: Python venv ComfyUI + `pipeline/tools/world_qc_v2_assets.py`.
Runtime: `assets/textures/{airport_concrete,circuit_concrete}.webp` dan `assets/storybook/bg_megabowat.webp`.
`storybook_assets.py` mengekalkan override ini apabila kit dieksport semula.

## Rekod QC pertama


Pembetulan berdasarkan senarai Faris. Arah seni: Labu Lanjut, tekstur bercat, bentuk licin dan bucu lembut.

| Kawasan | Pembetulan |
|---|---|
| Bukit Bintang | Lampu tambahan terapung pada kereta dibuang; kamera ikut sampai hujung bawah; shawarma, MRT dan monorel kembali binaan kod bertepi bulat; empat blok bangunan ditambah di kiri/kanan menara skrin. Myvi diparkir menegak dengan ruang masuk di sebelah kiri, collider/interaksi/spawn ikut kedudukan baharu. Burger di parking motosikal dan bangku MRT dibuang. |
| Tasik Lily | Kamera ikut sampai selatan peta; dua sampan tambahan serta blocker mereka dibuang. Sampan boleh dinaiki mempunyai lantai oval penuh di atas permukaan air dan freeboard lebih tinggi. Snorlax tanpa baju/cetakan, badan dan kepala lebih licin, perut krim bercat; animasi bernafas/tidur kekal. Pokok menggunakan model bercat yang tidak terlalu berbentuk bola; laluan dan parking menyatu dalam tanah. |
| Nyomnyom City | Kereta, van dan teksi menggunakan GLB Bukit Bintang; pergerakan trafik kekal. |
| Photobooth | Lampu jalan yang jatuh di dalam laluan filem tidak lagi diletakkan. Spawn Myvi dianjak sedikit ke dalam kawasan parking supaya boleh bergerak selepas fast travel. |
| Putrajaya | Keluarga berkelah dipindahkan bersama tikar ke padang timur dan menggunakan pose duduk. Bangku dipusing dan diletakkan di sisi promenade dengan collider. Sidewalk, bulatan plaza, jalan dan parking dicat terus ke tanah bertepi lembut; lintasan Hari Bebas Kenderaan menjadi zebra rata. |
| Sepang | 48 kereta parking dan kereta yang mencari petak menggunakan GLB Bukit Bintang; tanah paddock, fan zone, parking dan jalan sambungan menggunakan splat. |
| Semua zon | Gerbang antara bandar dan collider tiangnya dibuang; exit dan semakan progres kekal. Gerbang venue Sepang dan arch START perlumbaan kekal sebagai landmark dalaman. Geometri buatan kod dihaluskan; sambungan jalan KLIA dan tanah Lorbel juga diberi tekstur bercat. |
| Bowat | Bahagian atas awning diselaraskan dengan permukaan collision, mengambil kira ruang alpha; kaki tidak lagi melantun naik semasa berjalan di atas platform. |
| Blep | Dua aset pesawat penuh dijana satu per imej; saiz/kedudukan boss dan had sisi kapal pemain memastikan pesawat tidak terpotong. |
| Bolat ex | Latar studio baharu berterusan sampai tepi kanan, menggantikan bingkai kamera yang nampak terputus. |
| Qish ex | Lapisan segi tiga/jalur blok retro dibuang; runner menggunakan jalan bercat dalam ilustrasi dengan garisan bergerak halus. |

Semakan mesin:

- `npm run build`: TypeScript dan production Vite lulus.
- `node pipeline/audit/world-qc.mjs`: 9 zon, akses Myvi dari pintu masuk, spawn Myvi bebas collider, laluan keluar dan pickup. Enam lily Tasik sengaja perlu sampan; exit timur Tasik dikunci Snorlax, exit barat Labu oleh roadblock.
- Kamera Bukit Bintang/Tasik: gerak ke bawah menggunakan keyboard sebenar pada 1280×720, 1920×1080, 844×390 dan 390×844; seluruh Qish kekal dalam frame.
- Sampan: naik dan dayung dengan input sebenar, hull/lantai disemak dalam screenshot.
- `node pipeline/audit/world-boss-qc.mjs`: empat boss dimuat pada desktop/telefon; Bowat mendarat pada permukaan awning, bounds kedua-dua pesawat dalam canvas.
- Production `localhost:5180`: Bukit Bintang desktop, Tasik Lily telefon dan Putrajaya desktop dimuat tanpa ralat browser/aset; bukti [production.json](../art/style/world-qc/production.json).
- Grid 4×4 lapan zon disemak secara visual (128 frame).
- `check.mjs --zone bukit --from 0,22`: tiada model bertindih, tiada pickup terhalang, kedua-dua exit boleh dicapai.
- Bukti mesin: [verification.json](../art/style/world-qc/verification.json), [boss-verification.json](../art/style/world-qc/boss-verification.json).

Pratonton:

- [Bukit Bintang sebelum / selepas](../art/style/world-qc/bukit-bintang-before-after.jpg)
- [Bukit Bintang](../art/style/world-qc/grid-sunway.jpg) · [Tasik Lily](../art/style/world-qc/grid-dusun.jpg)
- [Nyomnyom](../art/style/world-qc/grid-cosyplace.jpg) · [Photobooth](../art/style/world-qc/grid-photobooth.jpg)
- [Putrajaya](../art/style/world-qc/grid-bukit.jpg) · [Sepang](../art/style/world-qc/grid-sepang.jpg)
- [Lorbel](../art/style/world-qc/grid-galeri.jpg) · [KLIA](../art/style/world-qc/grid-angkasa.jpg)
- [Sampan sedang didayung](../art/style/world-qc/boat-riding.png)
- [Bowat mendarat](../art/style/world-qc/boss-bowat-landed.png) · [Blep](../art/style/world-qc/boss-blep.png) · [Bolat ex](../art/style/world-qc/boss-bolatex.png) · [Qish ex](../art/style/world-qc/boss-qishex.png)

Aset bitmap dijana dengan **ComfyUI Qwen Image Turbo tempatan**, seed 861. Prompt lengkap di
[art/storybook/world-qc/prompts](../art/storybook/world-qc/prompts); PNG sumber di folder induknya.
Eksport: `pipeline/tools/world_qc_assets.py`, dipanggil juga oleh `storybook_assets.py` supaya fail dibaiki
kekal apabila kit dieksport semula. Runtime: `item_playerplane.png`, `item_enemyplane.png`,
`bg_bolatex.webp` dalam `game/public/assets/storybook/`; `putra_road.webp` dalam `assets/textures/`.
