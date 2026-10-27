# The Adventure of Qish — Game Vision

> Dokumen hidup. Semua keputusan besar, lore dan konteks peribadi dicatat di sini.
> Last update: 2026-10-27
>
> **Identiti browser/home screen (2026-10-27): Bolat The Game.** Nama tab, manifest dan
> Add to Home Screen iOS/Android memakai nama ini. Ikon = close-up Bowat gemuk comel
> jelir lidah, gaya ikon game mobile timbul, latar pink. Logo di dalam game kekal sedia ada.

> **Keputusan QC terkini (2026-10-26):** semua teks pemain menggunakan panggilan **saya / awak**.
> Nama boss finale kini **Raja Nonchalant**. Nama dan petikan lama dalam log sejarah di bawah
> ialah rekod versi terdahulu; keputusan QC ini mengatasi wording lama.

> **QC UI terbaru (2026-10-26):** title memakai latar langit/jalan rumput **dijana 2D timbul**,
> logo + Press Start di tengah. Bolat di kiri dan Bowat di kanan berjalan **di tempat**, tanpa
> bergerak kedudukan. HUD menunjukkan kad sebenar; Myvi membuka peta, TV membuka banner boss.
> Ini menggantikan keputusan canvas/chase dan medallion muka boss dalam log terdahulu.

## 1. Pitch

Game browser hadiah birthday untuk **Qish**, dibuat oleh **Faris**. Qish jelajah Pulau Pokélove
(overworld top-down ala Pokémon), kalahkan 8 boss dengan minigame berlainan genre, dan setiap
boss unlock satu kad Pokélove. Kad fizikal (dah dicetak) diserahkan Faris di dunia sebenar setiap
kali kad unlock. Sesi main dirakam dan diedit kemudian.

**Nama rasmi (2026-10-26): The Adventure of Qish.** Pokélove kekal nama kad dan pulau.
**Arah UI terkini:** ilustrasi 2D licin yang terasa timbul, warna pink, HUD kertas berlapis;
gaya retro/pixel ditolak. Rujukan komposisi tajuk = logo besar atas scenery, rujukan bentuk
= ilustrasi campsite dengan outline, shading dan kedalaman. Watak doodle dan potret anime kekal.

## 2. Prinsip (pillars)

1. **Peribadi dulu, game kemudian.** Setiap scene mesti ada inside joke, kenangan atau benda
   tentang korang berdua. Tiada filler generik.
2. **Mustahil stuck.** Qish mesti boleh habis tanpa frust. Assist / skip selepas gagal berulang.
3. **Kualiti tinggi, tiada deadline.** Faris nak push habis. Polish > kelajuan.
4. **Momen untuk kamera.** Card reveal, evolution, ending: semua direka untuk reaksi yang
   cantik bila dirakam.
5. **Semua platform.** Utama: PC masa stream. Tapi mesti jalan di keyboard, gamepad dan phone (touch).

## 3. Aset sumber sedia ada

| Folder | Isi |
|---|---|
| `cards/` | 8 kad Pokélove (2980×4160) + `Back.png`. Semua dah dicetak fizikal. |
| `strip/` | 10 photo strip photobooth korang (123 Annyeong ×3, Inssa Film, Dear Memories, Fotopot, Photomansion, KPIX, Hana Film, satu tanpa jenama). |

Photobooth = tradisi pasangan ni (kad Bolat pun berlatarkan photo booth). Ini tema berulang dalam game.

### Kad (ikut fail)

| Fail | Nama | Jenis | Moves / teks utama |
|---|---|---|---|
| 1.png | **Blep** | Basic, HP67, psychic/fairy | *Omey Blast* 100 — Faris tak boleh cakap, cuma "Alamak". Weakness grass ×2 |
| 2.png | **Mega Bowat** | Stage 1 (dari Bowat), HP310, water | Ability *Garu Ontot* (garu punggung → PROT PROT KO semua), *Makan Banyak* 10+ (cookies) |
| 3.png | **Bolat** | Trainer/Supporter | Demands kisses, cuddles, unlimited affection. All requests must be fulfilled. (photo booth) |
| 4.png | **Qish ex** | Basic, HP250, fighting | *Antek Giler* 200 (cantik tanpa makeup), *Angat Kuyush* ("fat ass" → semua jerit "SHE'S SO TINY!"). Bersama Bolat & Bowat |
| 5.png | **Bowat** | Basic, HP88, water, sloth | *Kentot Bushuk* (kentut senyap, salahkan orang lain), *Beyak* 10. Pantai |
| 6.png | **Bolat ex** | Basic, HP101, electric | *Memory* 30× — lukis & ambil gambar semua benda, tapi Faris malas |
| 7.png | **Snorlax Twin** | Trainer/Supporter | Tidur, bangun bila lapar sahaja |
| 8.png | **Mega Qish ex** | Stage 2 (dari Snorlax), HP350, fire | Ability *Sepang Baddie* (Labu Lanjut queen, Sambal Ayam Gepuk), *Hot Giler* 290 — "Malaysia stopped raining" |

Evolution chain: Bowat → Mega Bowat · Bolat → Bolat ex · Snorlax Twin → Mega Qish ex.

## 4. Cerita (v2, keputusan Faris 2026-10-24)

**Teras: Faris jenis nonchalant, malas, avoidant. Bolat merajuk, Faris cuma "okbye" dan hilang. Qish keluar cari dia.
Arc emosi: Faris yang tak pandai cakap → hilang → Qish kejar → di ending Faris akhirnya bersuara (surat).**

Trope lama "semua buat-buat lupa birthday" + nota Raja Malas **dibuang terus**. Fokus 100% cari Faris yang hilang;
birthday hanya terdedah di ending (surprise party).

1. **Mimpi (cutscene penuh, tekan A untuk teruskan):** Faris & Bolat **atas sofa tengah borak-borak**, happy.
   Tengah borak, Faris **cubit perut** Bolat (sambung gag "gemuk / 80kg / Anti Emok") → Bolat merajuk.
   Faris (nonchalant, malas, avoidant) tak cakap apa-apa, cuma ***"k bye"*** (ayat sebenar Faris), lalu pergi.
   Bolat menangis... dan terjaga.
   Cadangan visual: lembut, kabur, pastel, gaya doodle Qish sendiri supaya jelas ini mimpi.
2. **Bilik tidur Qish (Labu Lanjut) = tutorial:** satu bilik, Qish jumpa tiga benda hilang:
   - **Bowat** (patung sloth) tiada atas katil (cadangan: lekuk kosong di bantal)
   - **Gambar-gambar photobooth** hilang (cadangan: 10 bekas kosong di dinding/papan)
   - **Faris** hilang (cadangan: phone, chat Faris "last seen...", tiada balasan)
   Lepas ketiga-tiganya ditemui → pintu terbuka → keluar cari.
3. **Perjalanan:** jelajah pulau. Bowat dijumpai dulu (boss #1, lepas tu ikut Qish). 10 photo strip yang hilang
   rupanya disimpan Bolat ex di Galeri Memori, gerai pop-up dia di **Lorong Photobooth** (dipakai untuk Memory Bolat ex); lepas menang, strip balik ke papan
   dalam bilik. (Idea asal: strip bertaburan di seluruh pulau sebagai collectible, belum dibuat.) Setiap boss pegang satu kad.
4. **Finale di Litar Sepang:** battle turn-based lawan Raja Malas Faris guna moves dari kad yang dikumpul.
   Snorlax Twin Mega Evolve jadi Mega Qish ex, *Hot Giler*, hujan berhenti. Faris: *"Sekarang bangun, sayang. Ada orang
   tunggu kau."*
5. **Bangun semula (keputusan Faris 2026-10-24):** skrin putih → Qish terjaga lagi dalam bilik, **dah petang** (tidur
   sepanjang hari, gag Snorlax). Pulau tadi rupanya mimpi juga. Masih sedih: **Bowat masih takde**, tapi **gambar
   photobooth dah ada balik** atas papan. **Phone:** mesej pagi tadi dah dibaca (✓✓ biru), Faris online, typing...
   *"sayang" / "dah bangun ke belum" / "keluar kejap" / "aku tunggu kat luar"*.
6. **Sambutan kat luar rumah:** laman Labu Lanjut waktu senja dengan bunting, lampu, kek mango, belon; Faris, Encik
   Sloth, Bowat dan kad-kad boss berdiri **menunggu**. Qish jalan ke arah mereka → **"SURPRISE!"** → tiup lilin
   (lihat bahagian 12).
   **Baris meta di ending (disahkan Faris):** Faris mengaku dia tak pandai cakap benda macam ni, *"so aku buat satu game."*
   Ini penutup arc avoidant: game ni sendiri ialah cara Faris bersuara.

**Durioo dibuang sepenuhnya dari game** (keputusan Faris 2026-10-24): tiada nama Durioo, office atau Cyberjaya di
mana-mana, termasuk Kisah Kita. **Kecuali:** nama "Cyberjaya" dibenarkan untuk zon **Lorbel · Cyberjaya** (disahkan
Faris 2026-10-25); Durioo & office tetap tiada. ✅ Dah dibuang dari kod (lihat log "Cerita v2" di bahagian 13).

## 5. Boss & minigame (draf susunan)

Laluan (v2): bilik tidur & rumah Labu Lanjut (mula) → 8 zon → Litar Sepang → balik ke rumah Labu Lanjut (party).
Urutan pulau (2026-10-25): Labu Lanjut → **Bukit Bintang** (dulu Sunway Lagoon) → **Lorbel** → **Tasik Lily** (dulu Dusun) → KLIA → **Nyomnyom City** (dulu Cosy Place) → **Lorong Photobooth** →
**Putrajaya** (dulu Bukit Bunga) → Litar Sepang. Lorbel & Photobooth bertukar tempat supaya Bolat masih sebelum Bolat ex (rantai evolusi).
Pembentangan visual: https://claude.ai/artifact/U38coGYuXMR2oytB2jQbWa

| # | Kad | Zon | Genre | Idea |
|---|---|---|---|---|
| 1 | Bowat | **Bukit Bintang** (dulu Sunway Lagoon; tukar 2026-10-25) | Platformer 2D | Sembur 6 awan kentut dulu (orang ramai lari), lepas tu Bowat di tengah scramble: elak awan kentut, pijak Bowat. Tutorial |
| 2 | Bolat | **Lorbel** (pasar malam lorong belakang, Cyberjaya; trigger di pentas busking) | Rhythm | Note Kiss/Cuddle/Peluk; semua request mesti dipenuhi. Kumpul 6 kertas request dulu |
| 3 | Snorlax Twin | **Tasik Lily** (dulu Dusun; tukar 2026-10-25) | Catcher | Tidur atas tikar picnic halang jambatan; kumpul 6 lily naik sampan, bau lily kejutkan dia, lepas tu tangkap makanan isi hunger bar |
| 4 | Blep | **KLIA** (dulu Angkasa; tukar 2026-10-25) | Shmup top-down di langit atas KLIA | Omey Blast vs kapal terbang "MALAS AIR" → "ALAMAK". Cameo Babah (engineer) |
| 5 | Mega Bowat | **Nyomnyom City** (bandar makanan bulat; Cosy Place di tengah, boss di dapur) | Flappy-style | Bayar 6 resit hutang makan Bowat dulu; Bowat terlalu kenyang → evolve; terbang guna PROT PROT, makan cookies |
| 6 | Bolat ex | **Lorong Photobooth** (Galeri Memori pop-up antara booth; trigger di easel) | Memory match | Guna gambar dari photo strip sebenar. Kumpul 6 roll filem dulu |
| 7 | Qish ex | **Putrajaya** (dulu Bukit Bunga; tukar 2026-10-25) | Runner 3D atas Persiaran Perdana | Turunkan berat 86→80kg dulu (jogging + alat senaman), lepas tu "fat ass" → dipukul jadi "SO TINY!" |
| 8 | Mega Qish ex | Litar Sepang | Battle turn-based (+ lumba optional) | Finale lawan Faris |

## 6. Gaya visual

**Diorama 3D + watak doodle paper-cutout** (diputuskan 2026-10-24): dunia 3D low-poly + lighting/tilt-shift,
watak ialah sprite doodle Qish (garisan marker hitam) yang berdiri macam potongan kertas, flip bila tukar arah
(macam Paper Mario). Pixel art cuma aksen. Minigame boleh guna gaya sendiri.

**Semakan Faris (2026-10-25): gaya sekarang "sgt sampah".** Dia nak SATU gaya seragam: estetik ala Nintendo,
bentuk smooth/bulat, gabung 2D, shading cantik. Punca utama: dunia dibina dari ~400 primitif `MeshLambertMaterial`
bucu tajam tanpa sistem shading/palet. Cadangan Claude: (1) jana 3–4 *style frame* scene sama (rumah Labu Lanjut)
dengan Qwen Image 2.1 untuk Faris pilih, (2) frame terpilih jadi "style anchor" untuk semua aset 2D (Qwen Edit),
(3) renderer toon seragam (ramp lembut + rim light + outline + palet terhad) dan geometri bucu bulat untuk semua prop.
Style frame dijana (2026-10-25): `art/style/style_A..D.png` + `style_compare.png` (workflow
`pipeline/workflows/style_*.json`, Qwen Edit dengan doodle Qish + Bowat sebagai image_2). A Paper Mario, B Animal
Crossing/Kirby, C Captain Toad, D Wind Waker (keluar lebih kepada ilustrasi isometrik 2D).
**Keputusan Faris (2026-10-25): gaya B (Animal Crossing / Kirby).** `art/style/style_B.png` = style anchor rasmi:
bentuk 3D chunky bulat tanpa bucu tajam, pokok lollipop gebu, shading toon gradient lembut (cahaya hangat, bayang
lilac sejuk), palet pastel tepu, tilt-shift ringan, awan 2D dilukis. (Cadangan Claude: watak kekal 2D outline; belum disahkan.)
**Semakan Faris #2 (2026-10-25, lepas pas pertama gaya B): "masih x smooth".** Dia beri rujukan `ref/style_ref_yono.webp`
(4 screenshot, gaya Yono and the Celestial Elephants / Pokémon Let's Go): tekstur **dilukis tangan** atas semua benda
(rumput bergradien, tebing batu bata, papan kayu berurat dengan highlight tepi), teres tanah bertebing, air cyan
bergaya dengan buih tepi, cahaya lembut dan bayang tak keras, prop mid-poly bertekstur, bukan warna rata.
Dia juga tanya kenapa tak guna ComfyUI lebih banyak (setakat ni cuma style frame + Myvi). Arah baru: semua permukaan
dan prop utama dijana ComfyUI (kit tekstur seamless + model 3D TRELLIS.2), bukan primitif berwarna rata.

## 7. Teknikal

- **Stack:** Vite + TypeScript · Three.js (overworld, runner 3D) · Phaser 3 (minigame 2D) · Howler.js
- **Input:** abstraction layer tunggal → keyboard, Gamepad API, touch (virtual joystick + butang)
- **Save:** localStorage + panel dev rahsia (lompat scene, reset, unlock) untuk retake masa rakam
- **Deploy:** main local di PC untuk stream; link private (Vercel/Cloudflare Pages) untuk phone
- **Mesin dev:** RTX 5080 16GB, 125GB RAM, 24 core, Node 22

## 8. Pipeline aset (ComfyUI local, dipandu via comfy-mcp)

**Dioptimumkan 2026-10-25** (butiran & penanda aras: `pipeline/README.md`):
- 2D: Qwen Image 2.1 Turbo via `pipeline/tools/qwen_gen.py` — prop `--t2i` ±5s, scene/edit 15–35s (dulu 187s).
- 3D: gambar prop gaya B (`--t2i`, latar putih) → `pipeline/tools/gen3d.py` (TRELLIS.2, preset game 20k tri,
  tekstur 1024) ±36s → `.web.glb` ±0.4MB. Ujian pertama: Myvi (`art/3d/`).
- Semakan: `pipeline/tools/render_glb.py` render 4 sudut dengan three.js game.
- (Rancangan asal, sebelum gaya B:) watak chibi pixel, boss img2img + LoRA pixel, Kenney CC0 untuk prototaip.
- Background parallax: dijana terus
- Muzik: ACE-Step; SFX: jsfxr

## 9. Soalan terbuka

Ditanya terus dalam chat secara berperingkat; jawapan dicatat di bahagian 10.

## 10. Konteks peribadi

### Keputusan arah (2026-10-24)

- **Tahap gaming Qish: jarang main.** Implikasi: kontrol minimum (gerak + 1 butang aksi),
  tutorial visual dalam setiap minigame, kesukaran sangat rendah secara default, auto-assist
  selepas gagal, tiada fail state yang menghukum. Minigame mesti difahami dalam 5 saat.
- **Bahasa:** Melayu santai campur English, macam korang bersembang.
- **Tona:** kelakar/roast sepanjang game, sweet dan emosi di ending.
- **Sesi:** dirakam, diedit kemudian (bukan live). Retake dan panel dev memang berguna.

### Qish

- **Nama penuh:** Alya Balqis ("Qish" dari Balqis). **Birthday: 3 November**, sambut umur **26** (2026).
- Orang **Sepang**, rumah di **Labu Lanjut** (asal "Sepang Baddie" & "Labu Lanjut queen").
- Selalu nak kurus → "anti gemuk / Anti Emok". Kuat tidur (asal Snorlax Twin).
- Selalu jelir lidah sambil bunyi "blep" (asal kad Blep).

### Keluarga Qish

- **Babah** (panggilan Qish untuk ayah dia) — **engineer pesawat di KLIA**. Cameo di zon KLIA (keputusan Faris 2026-10-25):
  Raja Malas pinjam tools Babah lepas tu tinggal merata, Babah minta Qish tolong kumpul supaya dia boleh siapkan kapal
  terbang. Babah **dalam komplot surprise** tapi cover teruk ("Babah tak tahu apa-apa pasal kek mango"). Sprite =
  sprite doodle licin + potret anime daripada `ref/babah.jpeg` (pas watak 2026-10-26).

### Panggilan

- Qish panggil Faris: **sayang**. Faris panggil Qish: **sayang** atau **Bolat**.

### Watak

- **Bowat** — patung sloth yang korang ada bersama. Dianggap watak korang dalam "multiverse",
  macam Bubu Dudu (pasangan beruang terkenal di TikTok). → Cadangan: Bowat jadi **companion yang
  ikut Qish di overworld** (macam Pikachu dalam Pokémon Yellow).
- **Bolat** — versi kartun korang, "kalau korang ada animated series". Faris juga guna "Bolat"
  sebagai panggilan Qish. → Gaya doodle Bolat boleh jadi bahasa visual cutscene/dialog.
- **Blep** — sebab comel, dia selalu jelir lidah dan bunyi "blep".
- **Snorlax Twin** — usik dia gemuk macam Snorlax dan kuat tidur.

### Kamus istilah

| Istilah | Maksud |
|---|---|
| Omey | Comel |
| Alamak | Reaksi Faris bila tak tahu nak react apa (memang selalu sebut) |
| Garu Bontot / Garu Ontot | Garu punggung, habit comel |
| Beyak | Berak |
| Antek | Cantik giler |
| Angat Kuyush / Anti Emok | Dia selalu nak kurus, anti gemuk |
| Sepang Baddie / Labu Lanjut | Dia orang Sepang, rumah di Labu Lanjut |
| Kentot Bushuk | Kentut busuk |

### Rujukan visual (`ref/`)

- `bowat - yg kelabu tu dia.jpeg` — doodle dua sloth. **Bowat = yang kelabu/beige** (kanan, jalur mata
  kelabu, tangan/kaki coklat gelap). Yang kiri berbaju biru = **Faris** versi sloth.
  Disahkan: sloth kelabu = **versi sloth Qish**, sloth biru = **versi sloth Faris**. Patung Bowat milik Faris.
  Gambar patung sebenar tak diperlukan; doodle + art kad dah cukup sebagai rujukan.
- `ni kitorang.jpeg` — doodle gaya Bolat untuk **Faris** (rambut panjang beralun, kiri) dan **Qish** (kanan).
  Ini rupa rasmi watak kartun korang, guna untuk sprite, cutscene dan villain Faris.
  **Kedua-dua doodle (sloth & manusia) dilukis sendiri oleh Qish.** Tiada lukisan lain.
  → Pipeline: AI jana **turnaround sheet** (depan/sisi/belakang/3-4) dari doodle dia dulu, kemudian
  turnaround tu jadi rujukan untuk semua sprite & model. Gaya game = menghormati gaya lukisan Qish.
- `ni aqish.jpg` — selfie Qish (rujukan wajah, tudung mauve, baju hitam).
- `faris.jpeg` — foto Faris, rambut pendek kerinting, baju putih jalur halus: rujukan potret anime.
  **Sprite kekal rambut panjang doodle Qish** (pilihan Faris, 2026-10-26).
- `babah.jpeg` — foto Babah: rambut pendek belah tepi, misai/janggut halus, uniform engineer putih
  dengan trim merah, lanyard ID, seluar hitam. Rujukan kedua-dua sprite dan potret Babah.
- `aku pakai spek jugak waktu ni.png` — Faris & Qish di **album listening night** EP *Kau Apa Sebenarnya?*
  (Warner Music). Faris cosplay: **rambut panjang kerinting, cermin mata, t-shirt putih Pepe the Frog**.
- `luqman podolski himself.jpg` — Luqman Podolski asli (rujukan kostum; meme **"Sila Meninggal"**).

### Kisah korang

- Kenal sebab Qish **intern di office Faris (Durioo, Cyberjaya)** sebagai **storyboard artist** (dia pandai melukis), mula berkawan, jadi rapat.
- **Mula couple: 8.8** (8 Ogos). Kebetulan cantik: **8 kad untuk 8.8**.
- **Main game bersama** selalu (walaupun Qish sendiri jarang main): **Roblox, GTA**, game random asalkan multiplayer.
  **Keputusan: TIADA co-op.** Qish main seorang; dia mungkin ulang main sendiri nanti.

### Tempat penting (calon landmark overworld)

- ~~Office Durioo, Cyberjaya~~ — **dibuang dari game (2026-10-24)**. Diganti dengan **bilik tidur / rumah Qish di
  Labu Lanjut** sebagai tempat mula. (Fakta peribadi kekal di bahagian "Kisah korang" sebagai konteks sahaja.)
- Photobooth (tradisi; 10 strip)
- **Cosy Place Restaurant, Wangsa Maju** — dinner **first date**. Restoran **fine dining klasik**: beef steak, waiter berpakaian
  uniform (vest, bow tie). Korang makan **lasagna**. Tiada momen khas nak dimasukkan (Faris: "tak perlu"). Dalam game jadi
  pusat **Nyomnyom City** (2026-10-25).
- **Sunway Lagoon** — *(dibuang dari overworld 2026-10-25, diganti Bukit Bintang; kenangan & gag singa kekal dalam Kisah Kita sahaja)*
  duduk dari buka pagi sampai tutup malam, cuba semua benda. Faris tersilap tunjuk
  **singa** dan kata itu **beruang**. → NPC/gag "Beruang!" depan singa.
- **Album listening night Luqman Podolski** — kena cosplay jadi Luqman Podolski, Faris paling sama,
  **menang PS4**. → Easter egg / pertandingan cosplay.
- **Lorbel** (Lorong Belakang) — lorong belakang kedai di **Cyberjaya** yang jadi pasar malam waktu malam. Ganti Galeri
  Memori sebagai zon boss #6 (keputusan Faris 2026-10-25). Nama zon dalam game: **"Lorbel · Cyberjaya"** (disahkan Faris).
- **Myvi merah Qish** — selalu naik bersama (tiada nama/cerita khas, cuma bagus untuk diselitkan). → Cadangan: kenderaan/fast travel di overworld, dan
  lumba Litar Sepang guna Myvi merah, bukan kereta F1.

### Inside joke

- "Gemuk", "Bolat"
- Qish selalu sebut berat dia, contoh **"80kg"**, bila miss exercise atau makan banyak sehari.
  → Cadangan: gag penimbang yang muncul "80kg" setiap kali dia makan dalam game.

### Kegemaran

- **Bunga: lily** (disahkan Faris 2026-10-25) — kedua-dua jenis: lily bunga (Lilium, putih/pink) dan water lily /
  teratai atas air. → Zon **Tasik Lily** penuh dengan kedua-duanya.
- **Makanan:** daging salai, kek mango, Dubuyo (ramen pedas), malatang → item makanan dalam game,
  makanan yang jatuh dalam minigame Snorlax Twin.
- **Takut / tak suka:** tiada.
- **Muzik kegemaran:** Joji, Bryant Barnes, Laufey, Malcolm Todd. Pilihan BGM game dikemas kini Faris pada
  2026-10-26: Joji untuk title & boss, Laufey untuk overworld & rhythm, Bryant Barnes untuk ending
  (lihat bahagian 11). Faris sudah sediakan lima cover **8-bit/chiptune** dalam `music/`;
  audio dipotong dan dipasang terus, tiada penjanaan semula.

## 11. Pilihan BGM (keputusan Faris, 2026-10-26)

Title guna *Gimme Love*. Semua boss selain rhythm bergilir antara dua lagu Joji; rhythm kekal Laufey.
Overworld kekal Laufey dan ending kekal Bryant Barnes. Semua dalam versi **8-bit/chiptune**.
Fail yang disediakan mengesahkan dua lagu Joji ialah *Gimme Love* dan *SANCTUARY*.
Rhythm tidak dikira dalam giliran, supaya finale kekal *Gimme Love*.

| Scene | Lagu | Catatan |
|---|---|---|
| Title screen | Joji — *Gimme Love* | Loop hook yang sama dengan boss |
| Overworld | Laufey — *From The Start* | Lagu penuh mula → habis → loop; sambung kedudukan apabila tukar zon |
| 1 Bowat (Bukit Bintang) | Joji — *Gimme Love* | Giliran Joji 1 |
| 2 Bolat (rhythm, Lorbel) | Laufey — *Lover Girl* | Chorus 23.273s diulang dua kali; grid half-time 82.5 BPM, jam audio sebenar |
| 3 Snorlax Twin (Tasik Lily) | Joji — *SANCTUARY* | Giliran Joji 2 |
| 4 Blep (KLIA) | Joji — *Gimme Love* | Giliran Joji 3 |
| 5 Mega Bowat (Nyomnyom City) | Joji — *SANCTUARY* | Giliran Joji 4 |
| 6 Bolat ex (Lorong Photobooth) | Joji — *Gimme Love* | Giliran Joji 5 |
| 7 Qish ex (runner Putrajaya) | Joji — *SANCTUARY* | Giliran Joji 6 |
| 8 Finale battle (Litar Sepang) | Joji — *Gimme Love* | Giliran Joji 7; loop hook sebelum beat switch perlahan |
| Surprise party & tiup lilin | *Happy Birthday to You* 8-bit | Kekal; sudah dijana terus dalam `core/sfx.ts` |
| Ending (cutscene "Kisah Kita", surat, kad rahsia) | Bryant Barnes — *I'd Rather Pretend* | Ikut fail sebenar Faris, menggantikan cadangan *My Everything* |

**Lima cover sudah disediakan dan dipasang:** *Gimme Love*, *SANCTUARY*, *From The Start*, *Lover Girl*, *I'd Rather Pretend*.
*Happy Birthday* sudah ada sebagai melodi sintetik dalam game, jadi jumlah keseluruhan ialah **6 lagu unik**.
Pilihan ini menggantikan draf terdahulu termasuk *Priceless* untuk Bolat ex dan calon Malcolm Todd.
Sumber, timecode potongan dan cara eksport semula: `music/README.md`, `music/cues.json` dan
`pipeline/tools/prepare_music.py`. Potongan awal boleh dilaras selepas Faris dengar dalam game.
Chiptune sementara hanya digunakan sebagai fallback rhythm jika audio gagal didekod.
**Tiada credits** (Faris: dia dah tahu siapa buat).

**Elak:** Joji *Glimpse of Us* (tentang bandingkan dengan ex), Laufey *Let You Break My Heart Again* /
*Promise* (patah hati), Joji *Love You Less* (tajuk negatif).

## 12. Ending & replay (cadangan Claude, menunggu persetujuan Faris)

**Ending (selepas kad ke-8):**

1. *Hot Giler* kalahkan Raja Malas Faris → hujan berhenti, matahari keluar. Faris: "Sekarang bangun, sayang."
2. Qish bangun semula di bilik (lihat bahagian 4, langkah 5–6), keluar rumah → **"SURPRISE!"** di laman: Faris, Bowat,
   Encik Sloth dan kad-kad boss dah tunggu dengan kek & belon. Rupanya Faris "hilang" sebab siapkan sambutan.
3. **Tiup lilin:** kek mango, 26 lilin, *Happy Birthday* 8-bit. Qish **tiup ke mikrofon** (PC/phone)
   untuk padam lilin; fallback tahan butang. Confetti + **"Happy 26th Birthday, Alya Balqis!"**
   (Momen terbaik untuk kamera. Boleh sync dengan kek sebenar di dunia nyata.)
4. Cutscene **"Kisah Kita"** dalam gaya doodle Qish sendiri, ikut kronologi (**v2: tanpa sebutan Durioo/office**;
   slide pertama = **"kenal kat tempat kerja"**, tanpa nama): kenal kat tempat kerja → kawan →
   8.8 → first date Cosy Place → Sunway Lagoon (singa/"beruang") → listening night & PS4 →
   montaj 10 photo strip sebenar → hari ini, 3.11, umur 26. BGM: *I'd Rather Pretend* 8-bit
   (ikut fail sebenar Faris pada 2026-10-26; menggantikan cadangan *My Everything*).
5. **Surat dari Faris** ditaip huruf demi huruf (Faris tulis sendiri).
6. Belakang kad Pokélove muncul dan berpusing → **kad ke-9 rahsia** (cth. "Bowat & Bolat",
   Secret Rare / Legendary, tema birthday). Skrin: **"Pusing belakang 💌"** → Faris serah kad ke-9 fizikal.
   8 kad = 8.8 (masa lalu korang), kad ke-9 = masa depan.

Tiada credits.

**Replay solo:**

- "Mode rakaman" (default ON untuk main pertama): papar "Minta kad betul dari Faris!" setiap unlock.
  Replay seterusnya: prompt tu hilang, kad terus masuk galeri.
- Post-game: free roam, **Pokélove-dex** (galeri kad holo digital), ulang mana-mana minigame dengan
  high score, koleksi tersembunyi (10 photo strip → Album Photobooth).

**Geografi overworld:** Pulau Pokélove = Lembah Klang versi mini. Cyberjaya (office, mula) dan
Sepang/Labu Lanjut (rumah Qish, litar) memang berjiran. Sunway Lagoon dan Wangsa Maju (Cosy Place)
jadi zon/landmark lain.

## 13. Log kemajuan

### Fasa 0 — Turnaround watak (2026-10-24)

- Turnaround 4 pandangan (depan, 3/4, sisi, belakang) siap untuk **Qish, Faris, Bowat, sloth Faris**:
  `art/turnaround/` (`*_sheet.png` lutsinar, `*_view1..4.png` setiap pandangan, `overview.png`).
- Model: Qwen Image 2.1 Edit (local, port 8189). Butiran & helah dalam `pipeline/README.md`.
- Semakan Faris #1: Faris "macam orang lain" dan sisi Bowat pelik → dibuat semula dengan edit satu figura
  pada satu masa dari doodle asal. Faris kini kepala besar, muka panjang senget, rambut mengembang (ikut doodle).
  Versi lama disimpan dalam `art/turnaround/old/`.
- Isu kecil yang tinggal: pandangan 3/4 Qish & Faris hampir sama dengan depan (tak kritikal untuk sprite 4 arah);
  belakang kepala Qish cuma bulatan.

### Fasa 0 — Mock HD-2D (2026-10-24)

- 4 mock pekan permulaan (office Durioo) dijana: `art/mock/town_morning.png`, `town_goldenhour.png`, `town_alt1/2.png`.
  Diorama 3D + tilt-shift + cahaya pagi, Myvi merah, belon birthday, signboard DURIOO oren.
- Prompt "pixel sprite" tak menjadi (model kekalkan doodle). Perbandingan sprite dibuat manual:
  `art/mock/sprite_style_compare.png` (A doodle licin vs B pixel 48px).
- **Keputusan Faris (2026-10-24): gaya A — watak doodle paper-cutout dalam diorama 3D.** Pixel art hanya aksen
  (UI, ikon item, minigame retro).

### Fasa 1 — Vertical slice (2026-10-24)

Siap dan boleh dimainkan (`game/`, `npm run dev` → http://localhost:5180):

- Title → nota Raja Malas → dialog intro → overworld **Durioo, Cyberjaya** (Three.js, diorama tilt-shift,
  watak paper-cutout yang flip bila tukar arah, belon birthday, Myvi merah, bangku "80kg", Encik Sloth).
- Gate **→ Sunway Lagoon** → boss **Bowat** (Phaser platformer: pijak 3 kali, elak awan kentut, gunung berapi
  Sunway Lagoon di latar). Tiada game over; assist selepas gagal; skip selepas 3 kali gagal.
- Card reveal holo #5 Bowat + "📸 Minta kad betul dari Faris!" (hanya main pertama). Bowat kemudian ikut Qish.
- Input keyboard/gamepad/touch, save localStorage, panel dev rahsia (` atau 5 tap bucu kiri atas).
- Diuji headless (Chromium, desktop + phone portrait/landscape). Belum diuji dengan gamepad sebenar.

Isu & langkah seterusnya:
- **Qish (lineart hitam-putih) kurang menonjol dalam dunia 3D berwarna.** Dah tambah rim gelap; cadangan:
  warnakan sprite Qish & Faris dengan warna rata (macam sloth). Perlu Faris pilih warna.
- Myvi nampak macam kotak; perlu model lebih baik (Hunyuan3D?).
- Tiada BGM lagi (tunggu 8-bit dari Faris). SFX sintetik buat sementara.
- Kamera phone portrait agak dekat.

## 14. Roadmap v2 — prototype penuh dulu (cadangan Claude, 2026-10-24)

Prinsip: siapkan **seluruh game dari title sampai ending dalam kualiti prototype** (boleh main habis, aset
sementara), kemudian baru buat pass seni, audio dan polish. Sebab: birthday belum tentu bila → mesti ada game
lengkap seawal mungkin; pacing & kesukaran untuk pemain jarang main hanya boleh diuji bila semua ada; aset
boleh ditukar kemudian tanpa ubah logik.

| Fasa | Isi | Saiz |
|---|---|---|
| **2A Asas** | Peta pulau dengan zon bersambung + gating ikut kad; rangka minigame generik (intro, assist, skip, menang → kad); Myvi fast travel | M |
| **2B Risiko tinggi dulu** | Finale battle turn-based + Mega Evolve (paling kompleks & teras emosi); ending penuh (party, tiup lilin mikrofon, Kisah Kita, surat placeholder, kad ke-9 placeholder) | L |
| **2C Minigame susah** | Runner 3D (Qish ex), Rhythm (Bolat, guna beat placeholder ikut BPM *Lover Girl*) | M + M |
| **2D Minigame mudah** | Catcher (Snorlax Twin), Shmup (Blep), Flappy (Mega Bowat), Memory (Bolat ex) | S ×4 |
| **2E Playtest #1** | Main habis dari awal sampai akhir; tala kesukaran & panjang setiap zon (sasaran 30–45 min) | S |
| **3 Seni** | Warna sprite Qish/Faris, art boss setiap zon, environment setiap zon, Myvi, kad ke-9 | L |
| **4 Audio & polish** | Masukkan BGM 8-bit Faris, chart rhythm ikut lagu sebenar, SFX, juice, ujian gamepad/phone, deploy, playtest #2 | M |

Kerja Faris (selari, tak menghalang prototype): pilih warna sprite; sahkan lagu & buat 8-bit (rhythm perlukan
lagu *Lover Girl* sebelum Fasa 4); tulis surat; kumpul gambar untuk Kisah Kita; cetak kad ke-9 lepas direka.

### Fasa 2A — Asas pulau (2026-10-24) ✅

- **10 zon bersambung** (`game/src/zones/zones.ts`): Durioo → Sunway Lagoon → Lorong Photobooth → Dusun →
  Angkasa → Cosy Place → Galeri Memori → Bukit Bunga → Litar Sepang → Rumah Labu Lanjut. Setiap zon ada prop
  tema (gunung berapi + singa "beruang", 7 studio photobooth, Snorlax Twin halang jalan + pagar pokok,
  planetarium + roket, meja Cosy Place + lampu, 10 photo strip sebenar atas easel, bukit bunga, litar + flag,
  rumah + bunting + kek mango).
- **Gating:** gate timur terkunci sampai boss zon tu kalah. **Myvi** di setiap zon = fast travel ke zon yang dah dibuka.
- **Rangka minigame** (`game/src/minigames/framework.ts` + `registry.ts`): kad intro boss → scene Phaser →
  `ctx.win()/ctx.fail()`; selepas 3 kali gagal keluar "Tekan B untuk skip" secara automatik untuk semua minigame.
- Boss 2–8 guna **placeholder** (tekan A 3 kali) dengan pelan minigame tertulis di skrin; boss belum ada art
  → standee belakang kad. Dialog pre/menang untuk semua 8 boss dalam `content/script.ts`.
- Ending = stub ("SURPRISE!" + ucapan) sehingga Fasa 2B.
- Diuji headless: main penuh 10 zon, 8 kad, gate terkunci, menu Myvi, ending — tiada error console.

### Fasa 2B — Finale & ending (2026-10-24) ✅

- **Finale battle** (`game/src/minigames/finale/finaleBattle.ts`): gaya Pokémon di Litar Sepang. Moves dari kad:
  Omey Blast (100, stun → "Alamak"), Kentot Bushuk (60), Antek Giler (200), Makan Banyak (+80 HP). Serangan Raja Malas
  semua tak berguna (MALAS, ALAMAK, SILA MENINGGAL, GARU KEPALA); HP Qish tak boleh jatuh bawah 1/4 → mustahil kalah.
  Bila HP Faris ≤ 50%: hujan turun, kad Snorlax Twin bersinar, butang **MEGA EVOLVE** → Mega Qish ex (aura api) →
  **HOT GILER (290 × ∞)** → hujan berhenti → Raja Malas tumbang. Kad Mega Qish ex tak didedahkan sebelum card reveal.
- **Ending** (`game/src/ending/`): rumah gelap → SURPRISE! (semua watak + kad sebagai tetamu, confetti) → dialog party →
  **kek mango 26 lilin** (tiup ke mikrofon dengan meter, atau tahan A / tekan kek; Happy Birthday 8-bit) →
  banner "Happy 26th Birthday, Alya Balqis!" → **Kisah Kita** (9 slide) → **surat** → **kad ke-9** + "💌 Pusing belakang!"
  → Tamat → bebas jalan-jalan. Boleh main semula melalui pintu rumah Labu Lanjut.
- Semua teks ending = **draf dalam suara Faris** di `game/src/content/ending.ts`.
- Diuji headless: battle dimainkan dengan tekan A sahaja sampai menang, ending sampai habis, tiada error.

**Perlu dari Faris untuk ending:**
1. Surat sebenar → `LETTER` dalam `content/ending.ts`.
2. Gambar Cosy Place & Sunway Lagoon untuk Kisah Kita (letak dalam `game/public/assets/story/`).
3. Semak/ubah caption Kisah Kita & dialog party.
4. Reka & cetak kad ke-9 (sekarang placeholder HTML: "Faris & Qish · SECRET RARE · HP ∞ · Selamanya").

### Fasa 2C — Minigame susah (2026-10-24) ✅

- **Rhythm Bolat** (`game/src/minigames/bolat/bolatRhythm.ts`): satu butang; 💋 Kiss / 🤗 Cuddle / ❤️ Peluk datang ke ♥,
  tekan A ikut rentak. Setiap hit = flash photobooth + photo strip terisi; di hujung strip "dicetak". Lulus 50%;
  gagal → "Bolat merajuk" → ulang dengan nota lebih perlahan & tetingkap masa lebih luas. Tekan tanpa nota → lockout 0.22s
  (elak button mashing). **Muzik = chiptune original sementara** (`core/chiptune.ts`, 118 BPM, 22 bar).
  Bila Faris siap 8-bit *Lover Girl*: ganti lagu dan chart semula `buildChart()` ikut beat lagu sebenar.
- **Runner 3D Qish ex** (`game/src/minigames/runner/qishRunner.ts`, Three.js): 3 lorong di Bukit Bunga, Bowat lari di sebelah.
  Papan FAT ASS! → tukar lorong + A bila dekat → SO TINY! Kumpul 10 → "SHE'S SO TINY!!". Terlepas = tersadung sahaja;
  setiap 3 kali tersadung = 1 fail (skip selepas 3 fail). Bantuan: papan lebih jarang + gelang kuning tunjuk sasaran.
- Rangka minigame kini sokong game bukan Phaser (`custom` dalam `MinigameDef`).
- Diuji headless: rhythm (biar gagal → mula semula, hit Perfect dengan input sebenar, menang), runner (input lorong + A,
  menang), kedua-dua terus ke card reveal. Tiada error.
- Isu seni untuk Fasa 3: Qish & Bowat dari belakang dalam runner/battle cuma bentuk putih/beige kosong.

### Fasa 2D — Minigame mudah (2026-10-24) ✅ → **Prototype penuh siap**

- **Catcher Snorlax Twin** (`minigames/snorlax/`): tangkap 🍖 daging salai, 🍰 kek mango, 🍜 Dubuyo, 🍢 malatang, 🍪 cookies;
  elak ⏰. Penimbang naik "80.0kg → 80.5kg…". 12 makanan → "NYAM!! Dah kenyang!". Sokong seret jari.
- **Shooter Blep** (`minigames/blep/`): roket Qish tembak hati sendiri; elak gelembung zzz; A bila bar penuh = OMEY BLAST.
  Kapal Raja Malas (Faris dalam kubah) → "ALAMAK.".
- **Flappy Mega Bowat** (`minigames/megabowat/`): A/tap = PROT ke atas; makan 10 cookies; langgar periuk cuma melantun.
- **Memory Bolat ex** (`minigames/bolatex/`): 12 kad (belakang Pokélove), 6 pasang photo strip sebenar; tiada had cubaan.
- Semua ada assist selepas gagal + skip automatik (rangka). Placeholder tak lagi digunakan oleh mana-mana boss.
- Diuji headless: setiap minigame dengan input sebenar + menang → card reveal; playthrough penuh pulau 8/8 kad, tiada error.

**Seterusnya: Fasa 2E Playtest #1** — Faris main dari awal sampai habis di PC sebenar (dengan bunyi & gamepad),
catat apa yang susah/membosankan/lawak tak kena. Selepas itu Fasa 3 (seni).

### Cerita v2 — mimpi sofa, bilik tidur, buang Durioo (2026-10-24) ✅

- **Mimpi** (`game/src/intro/dream.ts`, skrip `DREAM` dalam `content/script.ts`): pentas DOM pastel, Faris & Bolat
  atas sofa ungu. Cubit perut ("CUBIT!") → Bolat pusing merajuk ("hmph 💢") → "k bye", Faris pudar ke kiri →
  Bolat pusing belakang menangis, air mata terpercik, warna pudar → skrin goncang, kabur, putih → bangun.
  Speaker baru: `farisbiasa` ("Faris", bukan Raja Malas) & `bolatdream` ("Bolat", tanpa potret sebab doodle depan
  Qish ketawa).
- **Bilik Qish** (zon `bilik`, prop dalam `zones/bedroom.ts`): diorama potongan (dinding belakang + sisi), katil dengan
  lekuk di bantal Bowat, papan gabus 10 slot strip kosong, meja dengan phone bercahaya, almari, permaidani, pintu
  kanan. Tanda **?** kuning atas 3 benda; HUD "Benda hilang n/3"; pintu terkunci sampai 3/3.
  **Phone** (`ui/phone.ts`): chat dengan "Faris 🦥", last seen semalam 11:58 PM: "Hmph." / "Aku merajuk ni." /
  **"k bye"**, kemudian Qish taip "sayang kat mana? 🥺" → satu tick sahaja. Status bar: Selasa, 3 Nov · 7:42.
  Papan strip penuh semula lepas kad Bolat ex; phone tunjuk mesej "jom balik rumah" lepas finale.
- **Pulau jadi bulatan:** Rumah Labu Lanjut (zon mula, rumah kampung bumbung pelana) → Sunway → … → Litar Sepang →
  balik Labu Lanjut. Jalan barat rumah ↔ Sepang "DITUTUP. Raja Malas sedang malas." sampai Bukit Bunga selesai.
  Encik Sloth di laman rumah bagi hint Bowat lari ke Sunway Lagoon (trope "hari Selasa" dibuang).
  Bunting + kek di laman hanya muncul lepas ending.
- **Dialog lain:** Bowat (lepas menang) "Aku tak boleh cakap. Raja Malas pesan."; Bolat ex simpan gambar photobooth
  yang hilang; finale "Semalam 'k bye' je, lepas tu hilang!"; party "siapkan dari semalam"; Kisah Kita slide 1
  "kenal kat tempat kerja"; **`CONFESS`** (dalam `content/ending.ts`) selepas Kisah Kita: Faris minta maaf pasal "k bye",
  "aku tak pandai cakap... so aku buat satu game", terus ke surat.
- Diuji headless (desktop 1280×720 & phone 390×844): mimpi penuh, 3 benda hilang, pintu terkunci/terbuka, laman rumah,
  jalan Sepang tertutup, hint Encik Sloth. Tiada error console / 404.
- Semua dialog baru = **draf**; Faris semak (terutama "Gebu." dalam mimpi dan chat phone).

### Post-game: lawan semula semua boss (2026-10-24) ✅

- Lepas ending (`endingSeen`), **semua 8 boss muncul semula** di zon masing-masing dengan label "Main semula"
  (Snorlax Twin tidur tepi jalan, bukan halang jalan). Tanya "Lawan X sekali lagi?" → minigame → "Menang lagi!" →
  balik ke tempat tadi. Tiada card reveal, tiada cerita, save tak berubah.
- **Konsol game dalam bilik Qish** (TV + 2 controller, dinding kanan): sebelum tamat cuma "Teringat main Roblox
  dengan GTA dengan Faris... Player 2 takde hari ni". Lepas tamat, skrin "MAIN SEMULA" dan menu pilih mana-mana
  daripada 8 boss.
- Kali pertama keluar dari ending: narator beritahu boss boleh dilawan semula (`REPLAY_HINT`).
- Diuji headless: menu konsol (8 boss + Batal), menang → balik bilik tanpa card reveal, kad kekal 8/8, rematch
  di Sunway & Dusun. Tiada error. Belum ada high score.

### Ending v2 — bangun semula & sambutan di luar rumah (2026-10-24) ✅

- Lepas kalahkan Raja Malas (bukan rematch): kad #8 → **white-out** perlahan → bilik Qish, `WAKE_AGAIN` (dah petang,
  "semua mimpi je ke?", "Faris still takde. Bowat pun takde."). Flag `bowatAway` sembunyikan Bowat companion sampai
  habis sambutan.
- Bilik main semula dengan flag `wake*` sendiri (tanda ? baru, HUD n/3): katil (Bowat masih takde), papan (strip dah
  balik), phone mode `wake` (dibaca ✓✓, online → typing → 4 mesej Faris). Pintu terbuka lepas 3/3.
- Laman rumah ikut cerita (`ZoneDef.mood`): pagi sebelum finale, senja selepasnya. Lepas finale: bunting, lampu,
  kek, 2 ikat belon, Faris, Encik Sloth, Bowat, 6 kad boss sebagai tetamu. Keluar pintu → "Eh...?! Belon? Kek?
  ...Semua orang?" → jalan dekat mereka → `playEnding()` terus atas scene 3D (rumah gelap & bilik party DOM dibuang).
  Gate & Myvi dikunci masa sambutan menunggu ("Semua tengah tunggu kat depan rumah").
- Party dialog: Qish jumpa Bowat ("BOWAT! Kau kat sini rupanya!"); Faris guna nama "Faris" (bukan Raja Malas).
- Lepas tamat: Bowat ikut semula, sambutan kekal di laman; cakap dengan Faris → "Nak sambut sekali lagi?" (ganti pintu
  rumah sebagai cara ulang ending; pintu sekarang sentiasa ke bilik).
- Diuji headless: finale (force win) → kad → bangun → 3 benda → phone → laman → SURPRISE → party → kek → Kisah Kita →
  pengakuan → surat → kad ke-9 → Tamat; dan keadaan selepas tamat (Faris tanya sambut lagi, Bowat ikut). Tiada error.

### Kumpul untuk buka jalan/boss + Labu Lanjut v2 (2026-10-24) ✅ (Labu Lanjut sahaja setakat ni)

**Keputusan Faris:** setiap zon ada benda untuk dikumpul; kena cukup dulu baru boleh lawan boss (zon tanpa boss: baru
palang jalan terbuka).

- **Sistem generik** (`COLLECT` dalam `zones/zones.ts`, visual `overworld/items.ts`): item doodle terapung dengan cahaya
  menegak ke langit (senang nampak dari jauh), ambil dengan jalan lalu (tiada butang). HUD "ikon Nama n/N" bawah slot kad.
  Dialog pertama ambil, siap semua, dan cubaan awal dalam `COLLECT_TALK` (`content/script.ts`). Boss di zon yang belum
  cukup: "X buat-buat tak nampak kau" (`bossCollectNotYet`). Save lama yang dah lepas zon tu dikira siap.
  Panel dev: "🍪 Kumpul semua zon ni".
- **Labu Lanjut: 6 cookies Bowat** ("Bowat makan sambil lari, tercicir satu kampung"); siap → palang "IKUT JEJAK BOWAT"
  di gerbang selatan terangkat → Sunway Lagoon.
- **Labu Lanjut kini menegak (atas → bawah):** rumah Qish di atas → jalan kampung tar menurun → jambatan kayu atas
  sungai → gerbang "KAMPUNG LABU LANJUT" → ladang sawit → palang ke Sunway Lagoon. Jalan sisi barat ke Litar Sepang
  (papan "DITUTUP" + "Baca" sampai Bukit Bunga selesai). Spawn "east" = balik dari Sunway (bawah kampung).
- **Hidupkan kampung:** ayam kampung + anak ayam (bertempiaran & berkokok bila Qish dekat), kucing oren tidur atas
  bumbung Myvi (zzz), ampaian (tudung mauve, baju hitam, tuala) berkibar, buaian berayun, pokok mangga + daun gugur,
  itik dalam sungai, rama-rama, burung lalu (bayang di tanah), bayang awan bergerak, rumput & bunga liar, 2 rumah kayu
  jiran atas tiang, kedai runcit (aiskrim, kerusi plastik merah, kapcai), wakaf, tiang elektrik + wayar, lampu jalan,
  peti surat, pagar. Waktu senja (party): tingkap & kedai menyala, lampu jalan, fairy lights atas pagar, kunang-kunang.
- Prop statik dibakar jadi beberapa mesh (`overworld/merge.ts`): ~1600 → ~370 objek, untuk phone.
- Dialog baru (draf, Faris semak): kucing, ampaian, kedai runcit, wakaf, buaian ("Snorlax Twin approved"), Encik Sloth
  (jejak cookies), cookies pertama/siap/belum cukup.
- Diuji headless: palang tutup → 6 cookies → palang buka → Sunway → balik muncul di bawah; jalan Sepang dua arah; save
  lama; party SURPRISE; senja; phone portrait. Tiada error (cuma favicon.ico 404 lama).

**Cadangan item zon lain (draf, tunggu Faris):** ~~Sunway 🐚 kerang~~ (Bukit Bintang: awan kentut, 2026-10-25) · Photobooth 🎟️ token photobooth · Dusun 🍎 buah
(kejutkan Snorlax Twin, dia bangun bila lapar) · Angkasa ⭐ bintang · Cosy Place 🌹 bunga ros first date · Galeri 🎞️ roll
filem · Bukit Bunga 🌸 bunga · Litar Sepang 🌶️ cili padi (untuk *Hot Giler*).

### Padang kucing & party pindah ke kiri rumah (2026-10-25) ✅

**Permintaan Faris:** belah kiri rumah jadi padang/taman kosong, banyak kucing pelbagai warna bermain, dan birthday
berlaku di situ.

- **Padang** (x -31…-10, kiri rumah): rumput baru potong berjalur, 2 pokok hujan-hujan berbunga merah jambu (daun gugur),
  2 tiang buluh + tanglung, 2 bangku, pagar & semak di tepi. Ampaian dan ayam dipindah ke laman kanan.
- **10 kucing** (`zones/cats.ts`): oren tabby & hitam kejar-mengejar dalam bulatan (yang hitam melompat), kelabu duduk
  tengok, anak kucing kelabu intai → goyang punggung → terkam bola benang merah jambu (Qish boleh sepak bola tu),
  calico berdiri tampar rama-rama, putih berguling, anak kucing oren kejar ekor sampai pening, siam menjilat kaki,
  tortoiseshell tidur, tuxedo merayau dan datang duduk sebelah Qish sambil mengiau. "Tengok" → dialog kucing (draf).
- **Party kini di padang:** tikar, kek mango atas meja, 2 meja makanan (daging salai, malatang, Dubuyo, air), bunting &
  lampu antara pokok, lampu antara tiang tanglung, belon, Faris/Encik Sloth/Bowat atas tikar, 6 kad boss di kiri-kanan,
  kucing bermain di depan. Masuk padang = mula SURPRISE. Dari pintu rumah dah nampak belon & meja di kiri.
  `PARTY_WAITING`: "tunggu kat padang tepi rumah".
- Diuji headless: pagi, party menunggu (pencetus jalan), lepas tamat, phone portrait, ujian cookies → Sunway masih lulus.
  Tiada error baru.

### Angkasa → KLIA + cameo Babah (2026-10-25) ✅

**Keputusan Faris:** zon Angkasa jadi **KLIA** (ayah Qish kerja situ). Babah = engineer pesawat, dalam komplot surprise
tapi cover teruk. Minigame Blep pindah ke langit senja atas KLIA. Id zon dalam kod kekal `angkasa` (save lama selamat).

- **Zon** (`zones/zones.ts`, prop dalam `zones/kliaProps.ts`): golden hour. Terminal dengan bumbung "payung" KLIA atas
  tiang pokok, dinding kaca bercahaya (orang & kaunter di dalam), blok **K L I A** atas bumbung, pintu BERLEPAS,
  3 **Jalur Gemilang** berkibar, **papan berlepas split-flap** (destinasi pulau; MALAS AIR DELAYED → MALAS → TIDUR; satu
  baris kadang-kadang terflip jadi "KEK MANGO · G26 · RAHSIA" lepas tu cepat-cepat tukar balik), troli, 5 penumpang doodle
  tarik beg. Apron: **kapal Babah di stand 8** (cowling enjin terbuka, tangga A, kotak tools, percikan api), tangga
  penumpang, trak minyak, **tug + 3 troli bagasi** berpusing, menara kawalan (radar berpusing, beacon), lampu limpah.
- **Landasan 08/26 di depan kamera** (08 = 8.8, 26 = umur dia; "Tengok" kat pagar → easter egg). Kapal berlepas & mendarat
  silih berganti (merah, MALAS AIR kuning, biru Babah), lampu landasan, windsock, bayang jet lalu atas kepala + bunyi
  gemuruh. Kiri depan: parking Myvi + teksi.
- **Kumpul: 6 Tools Babah** (spanar). Aliran: cakap Babah (tanda ! kuning) → dia minta tolong (Raja Malas pinjam tools
  "nak baiki katil" lepas tu malas pulangkan) → kumpul 6 → balik kat Babah → bunyi ketuk, cowling tutup, kipas enjin
  berpusing → "Qish la bawa. Senang je, macam bawa Myvi." → baru boleh lawan Blep (`BLEP_NOT_READY` kalau belum).
  Flag: `babahMet`, `babahFixed`. Dialog dalam `BABAH` (`content/script.ts`) termasuk selepas menang ("Padang tepi rumah
  pun takde apa-apa") dan selepas ending.
- **Babah = placeholder doodle canvas** (`content/doodles.ts`: coverall navy, vest hi-vis, ear defender, misai, spanar,
  thumbs up), juga potret dialog. Bila aset sebenar siap: letak `public/assets/chars/babah_{front,side,back}.png`, tukar
  `b.standee(babahDoodle()...)` jadi `b.npc("babah", ...)` dan potret dalam `ui/dialog.ts`.
- **Minigame Blep**: langit senja (gradient, matahari, awan parallax), kapal Qish dari atas dengan contrail, boss jadi
  kapal kuning **MALAS AIR** dengan Faris dalam kokpit.
- Diuji headless (1280×720): babak penuh Babah → 6 tools → baiki → Blep → minigame. Tiada error (cuma favicon 404 lama).

- **Babah hantar Qish lawan boss** (permintaan Faris): lepas baiki enjin (atau cakap dengan dia lagi bila kapal dah siap),
  Babah tanya "Nak terbang sekarang? Blep jadi co-pilot." → "Jom terbang!" → pesan "jangan tekan butang merah" → terus
  minigame Blep. "Nanti dulu" → kapal tunggu. Blep di tangga masih boleh dicakap terus macam boss lain. Lepas ending,
  cakap dengan Babah di KLIA → ucap selamat hari jadi + "Nak terbang lagi?" (rematch). **Kad Blep "Main semula" tak
  muncul di KLIA** (Faris: bertindih dengan Babah); rematch Blep cuma melalui Babah atau konsol dalam bilik.
- **Babah di party ending** (disahkan Faris): standee sebelah Faris di padang; `PARTY` (`content/ending.ts`) ada 3 baris
  baru ("...BABAH? Babah pun ada?!" / "Babah dah cakap kan, takde kek. ...Okay, ada kek." / simpan rahsia lagi susah
  dari baiki enjin). Lepas tamat, boleh cakap dengan dia di padang.

**Perlu dari Faris:** gambar rujukan Babah (untuk aset sebenar); semak cara Babah bercakap & panggil Qish (sekarang "Qish").

### Galeri Memori → Lorbel (2026-10-25) ✅

**Permintaan Faris:** zon Galeri Memori jadi **Lorbel** (lorong belakang Cyberjaya, pasar malam). Qish masuk dari kiri;
depan dia pentas busking dengan banyak meja makan di depannya; atas = baju bundle; bawah = makanan; banyak lampu kuning
tergantung; sesak dan sempit sebab lorong belakang. Id zon dalam kod kekal `galeri` (save lama selamat).

- **Susun atur v2 ikut lakaran Faris** (`zones/zones.ts`, prop dalam `zones/lorbelProps.ts`), waktu malam:
  ```
            [bundle] | LALUAN BUNDLE | [bundle]
  LORONG DATANG ->   |               |  [Galeri Memori]
  (masuk dari kiri)  |   laluan      |
  [lot]   [PENTAS] > |   utama       |  ( ) ( )  MEJA MAKAN (bulat)
  LORONG KELUAR <-   |   (atas-bawah)|  ( ) ( )
  (ke Bukit Bunga)   |               |
            [makan]  | LALUAN MAKANAN| [makan]
  ```
  - **Lorong Datang (kiri atas):** Qish masuk dari kiri. Dinding belakang kedai (aircond berpusing, paip, tong sampah,
    plat "DILARANG BUANG SAMPAH"), neon **LORBEL** pink berkelip, contengan **"F + Q"** dalam hati ("Tengok" → "FARIS.").
  - **Laluan utama** menegak, **sempit (lebar 4) dan panjang** (Faris minta sempit + panjang, 2026-10-25).
    **Naik = bundle:** 6 gerai (BUNDLE RM5, JEANS, KASUT | JAKET "untuk sejuk aircond", T-SHIRT, TOPI) kiri-kanan, rak baju face-out yang berayun (berkibar bila Qish lalu), meja lipat baju berlipat, neon BUNDLE di
    hujung, mannequin & cermin ("Antek giler."). **Turun = makanan:** 6 gerai menghadap laluan (kanopi separuh supaya kaunter
    nampak dari atas): Satay (bara + asap), Daging Salai, Malatang, Ramen Pedas | Air Balang, **Kek Mango "HABIS!"** (diborong
    "lelaki rambut kerinting, malas cakap" + kotak "TEMPAHAN a/n: F." → bayangan sambutan), Burger, Takoyaki.
  - **Pentas busking** kiri laluan, menghadap kanan **lurus** (tak senget, permintaan Faris), banner "BUSKING LORBEL" di hujung yang menghadap
    kamera, 4 lampu par menyapu warna, speaker berdenyut ikut beat, kotak tip "TQ ♥". Busker = **cover band Luqman Podolski**
    (rambut kerinting, spek, baju Pepe → "FARIS?!" → "Bukan.") + kawan main cajon. Penonton berdiri di laluan depan pentas.
    **Muzik busker** (lagu asal sementara, `core/busker.ts`) makin kuat bila Qish makin dekat pentas.
  - **Meja makan bulat** seberang laluan menghadap pentas: grid kemas 3 × 5 (15 meja) penuh dari dinding atas sampai dinding bawah (tiada ruang kosong), lorong lurus di antara, merah & biru
    berselang (stool sama warna), orang duduk makan, kucing tidur di lorong tengah.
  - **Galeri Memori** = gerai pop-up Bolat ex di atas meja makan: 10 photo strip sebenar disepit atas tali lampu depan dinding
    gabus, papan "GALERI MEMORI · pop-up · oleh Bolat ex", easel dengan **doodle Qish sendiri**, kamera instant & roll filem.
  - **Lorong Keluar (kiri bawah):** jalan keluar ke zon seterusnya, balik ke arah kiri. Antara dua lorong: **parking belakang
    pentas** dengan petak bergaris putih, papan "P · PARKING", lampu, motor & crate; **Myvi merah** di petak tengah menghadap
    kamera (nampak dari pintu masuk). **Laluan masuk/keluar parking** dari Lorong Keluar: palang parking rendah (naik bila
    Qish dekat), papan "P · MASUK / KELUAR", garisan lorong; Qish boleh masuk berjalan sampai ke Myvi (atau tekan "Myvi" dari
    Lorong Datang atas dinding). Satu kertas request ada dalam parking. Bawah Lorong Keluar: parking motor.
  - **Lampu:** mentol kuning bersilang atas semua kawasan (bergoyang, sesekali berkelip), diikat pada dinding, truss pentas,
    tiang galeri dan kanopi gerai; tiang cuma dalam lot & parking supaya tak halang kamera. Bangunan tinggi hanya di sebelah
    utara kawasan berjalan supaya Qish tak pernah tersorok.
- **Orang ramai (sesak):** 22 pejalan kaki dengan laluan sendiri + ~85 orang berdiri (makan, beratur, pilih baju, peniaga,
  penonton bergoyang ikut beat). Pejalan kaki **halang jalan Qish** (sistem `blockers` baru dalam overworld: tak boleh rapat,
  tapi sentiasa boleh undur, jadi mustahil tersekat); bila Qish depan mereka: berhenti + belon "Tumpang lalu~" / "Eh sorry!";
  kalau Qish tak gerak, mereka pusing balik. Orang berdekatan sesekali cakap ("RM5 je?!", "Encore!!", "Pedas gila!").
- **Trigger boss tanpa kad:** standee kad Bolat ex dibuang (permintaan Faris). Qish jumpa Bolat ex di **easel** galeri, dengan
  tanda **"!"** kuning terapung sampai Bolat ex kalah. Kali pertama: Qish nampak doodle dia atas easel → Bolat ex "pinjam kejap,
  nak tiru gaya kau" → minta cari roll filem. Lepas tamat game: easel = "Main semula".
- **Kumpul: 6 roll filem Bolat ex** (jatuh masa berasak-asak): Lorong Datang, Lorong Keluar, bundle, meja makan,
  laluan makanan, celah dekat troli ais krim.
  Bolat ex terangkan dulu (`BOSS_TALK.bolatex.collect`), lepas cukup baru boleh lawan.
- **Minigame Memory** kini malam Lorbel: kad disepit pada tali lampu, bergoyang, bokeh, tajuk neon.
- Dialog baru semua **draf** (`content/script.ts`, kunci `galeri:*`): neon, contengan, pentas, kucing, easel, 6 gerai,
  5 kanopi bundle, cermin, roll filem. Speaker baru `pakcikkek`.
- Prestasi: prop statik dibakar (`mergeStatic`); kertas orang ramai tak cast shadow (malam). Bilangan objek ≈ Labu Lanjut.
- Diuji headless (1280×720 & phone 390×844): masuk dari kiri, 6 roll filem, Bolat ex sebelum/selepas, dialog zon, minigame.
  Tiada error console (cuma favicon 404 lama). Belum diuji di GPU sebenar untuk fps.

**Perlu dari Faris:** semak dialog; apa-apa detail Lorbel sebenar (gerai kegemaran korang, lagu busker, benda yang selalu
korang beli).

### Lorbel ↔ Photobooth: tukar boss (2026-10-25) ✅

**Permintaan Faris:** buang ruang kosong belakang kiosk makanan; buang troli keropok lekor, gula kapas, ais krim potong;
boss Photobooth (Bolat, rhythm) jadi boss Lorbel, ditrigger di **pentas**; Galeri Memori dibuang dari Lorbel dan dipindah ke
Photobooth.

- **Bolat (kad 3) → Lorbel.** Trigger di depan pentas busking (tanda "!" atas pentas, label "Pentas"). Kali pertama: lawak busker
  Luqman Podolski ("FARIS?!" → "Bukan."), lepas tu Bolat dah booking pentas, tulis 6 kertas request (kiss, cuddle, peluk) tapi
  semua terbang masuk crowd. **Kumpul 6 kertas request** (item baru `request`), balik ke pentas → "Naik pentas dengan Bolat?" →
  rhythm. Menang: "Satu Lorbel bagi standing ovation!". Lepas kalah (sebelum tamat) pentas = cakap biasa; lepas tamat = main semula.
- **Bolat ex (kad 6) → Lorong Photobooth.** Galeri Memori (10 strip, papan, easel doodle Qish, meja kamera) di tengah lorong,
  7 booth di kiri-kanan. Trigger di easel dengan "!" (tiada kad standee), **6 roll filem** bersepah sekitar booth & parking.
- **Urutan pulau ditukar** (Lorbel ke-3, Photobooth ke-7) supaya rantai evolusi Bolat → Bolat ex kekal. Gate setiap zon ikut
  urutan baru secara automatik.
- **Lorbel:** van peniaga (3 setiap sisi) diparking rapat belakang kiosk makanan supaya tiada lorong kosong; troli lekor, gula
  kapas, ais krim potong dibuang; tempat galeri lama jadi satu lagi baris meja bulat.
- **Minigame rhythm kini atas pentas Lorbel waktu malam** (`minigames/bolat/bolatRhythm.ts`, permintaan Faris): dinding belakang
  kedai, mentol kuning bergantung, truss + banner "BUSKING LORBEL", 4 lampu par menyapu warna, speaker berdenyut ikut beat,
  busker Luqman Podolski + kawan cajon, Faris & Bolat di kanan pentas, penonton (siluet dari belakang) bergoyang ikut beat di
  depan. Setiap hit: pentas strobe ikut warna request + hati naik dari crowd; papan kapur **"REQUEST MALAM NI"** (4 hati)
  ganti photo strip, dan membesar ke tengah bila menang. Intro "Boss 2 · Pentas Lorbel".
- Diuji headless: Bolat sebelum/selepas kertas request → minigame rhythm; Bolat ex sebelum/selepas roll filem → minigame memory.
  Tiada error.

### Bukit Bunga → Putrajaya (2026-10-25) ✅

**Permintaan Faris:** fokus zon Bukit Bunga, jadikan cantik & hidup, tukar jadi **Putrajaya** ikut gambar udara (Masjid Putra,
Dataran Putra, Perdana Putra, Jambatan Putra). Qish datang dari bawah. Ramai orang jogging di sidewalk, ngam dengan boss
runner. Bila sampai, Bolat teringat dia belum jogging/bersenam hari tu → ada **bar untuk turunkan kg**. Id zon kekal `bukit`.

- **Susun atur** (`zones/zones.ts`, prop dalam `zones/putrajayaProps.ts`), petang keemasan, "Hari Bebas Kenderaan":
  - **Jambatan Putra** (masuk dari bawah, spawn atas jambatan): jalan merah, balustrade, lampu Putrajaya, 4 **pavilion oktagon**
    atas tiang dalam tasik, Jalur Gemilang di kepala jambatan. **Penimbang 20 sen** tepi jambatan (jarum berpusing ikut berat
    bila Qish naik; "Timbang").
  - **Persiaran Perdana**: jalan merah kosong kereta ("HARI BEBAS KENDERAAN" dicat), sidewalk krim, royal palm, lampu.
    **Gerbang inflatable START** ("LARIAN PETANG") dengan jam perlumbaan yang mengira = tempat mula lawan Qish ex.
  - **Dataran Putra**: plaza bulat corak radial, **taman bintang 14 bucu**, jalan bulatan merah, **trek jogging** keliling,
    6 Jalur Gemilang, lampu, pokok bulat, burung merpati (terbang bila Qish lalu).
  - **Perdana Putra** di atas: kubah bawang hijau, tiang portico, sayap bumbung hijau, menara sudut berkubah, pancutan air
    menari di depan. Blok kerajaan bumbung merah di belakang + bangunan tinggi dalam kabus.
  - **Masjid Putra** di barat atas tasik: kubah merah jambu bercorak, kubah kecil, arked bumbung kelabu-biru, menara tinggi.
  - **Barat:** promenade tepi tasik, taman bunga, **Taman Kecergasan** (lantai getah hijau, air walker, palang tarik, bangku sit-up).
  - **Timur:** parking Myvi, promenade dengan khemah **air tebu** (roda mesin berpusing) & **air kelapa**, **motor aiskrim**
    (loceng ting-ting bila Qish dekat), huruf besar **PUTRAJAYA** warna-warni, padang dengan budak main **wau bulan**,
    keluarga berkelah, jalan keluar **→ Litar Sepang**.
  - **Tasik:** air beralun + kilauan matahari, **bot naga** (pendayung ikut rentak drummer), bot cruise, burung lalu.
- **Orang ramai jogging** (~26): jogger doodle baru dengan langkah 2 frame (`joggerDoodle`, depan/belakang), makcik power-walk,
  basikal sewa (`cyclistDoodle`). Laluan: trek bulatan (dua arah), gelung Persiaran Perdana, jambatan, promenade timur/barat,
  jalan bulatan untuk basikal. Mereka **mengelak ke tepi** (bukan berhenti), cakap "Tumpang kanan~", basikal bunyi loceng.
- **Bar berat (kg)** (`zones/workout.ts`, HUD `setWorkout`): mula **86.0kg** (sambung gag penimbang Snorlax Twin: 80 → 86kg
  lepas makan 12 benda), sasaran **80.0kg**. Turun ikut jarak Qish jogging; **×2 bila jogging sebelah jogger lain sama arah**
  (jogger cakap "Jom sama-sama!", HUD tunjuk ×2). Peluh terpercik & "-0.1kg" timbul atas kepala. **3 alat senaman**: tekan A
  berulang-ulang (air walker 12, palang tarik 8, sit-up 10), Qish bergerak ikut alat, setiap alat -1.0kg. Berat disimpan
  dalam save (`vals.pjKg`, flag `pjFit`). Panel dev "Kumpul semua" = terus 80kg.
- **Cerita:** masuk kali pertama → `PJ_ARRIVE` (ramai jogging, "aku tak jogging lagi", makan macam Snorlax, 86kg?!).
  Sampai 80kg → `PJ_DONE` ("FAT ASS!" dari arah START) → tanda "!" atas gerbang. Pre-boss baru: orang pecut ke Perdana Putra,
  "LAPAN PULUH ENAM KG! FAT ASS!" → "AKU DAH 80 LA!". Sebelum cukup: `pjNotReady`. Dialog prop: tebu, kelapa, aiskrim,
  masjid, Perdana Putra, huruf PUTRAJAYA, gerbang (semua **draf**).
- **Minigame runner** kini atas Persiaran Perdana: jalan merah 3 lorong, sidewalk, royal palm & lampu Putrajaya, jogger
  dipintas, Perdana Putra di hujung, tasik di kiri kanan. Intro "Boss 7 · Persiaran Perdana, Putrajaya".

**Perlu dari Faris:** semak angka 86 → 80kg (okay ke gurau ni untuk Bolat?), dialog draf, dan apa-apa kenangan Putrajaya
korang (tempat jogging, makan lepas jogging, Floria?).

### Dusun → Tasik Lily (2026-10-25) ✅

**Permintaan Faris:** fokus zon Dusun, cantik & hidupkan, tukar jadi **tasik**: orang picnic, memerang (otter), orang
memancing, **naik sampan untuk collect barang**, banyak **bunga lily (bunga favourite Qish)**, orang buat batik painting,
orang berniaga di but kereta. Jawapan Faris: collect = **bunga lily**; lily = **dua-dua** (Lilium + teratai); nama
**umum** (bukan tasik sebenar) → "Tasik Lily"; Snorlax Twin **tidur atas tikar picnic, halang jambatan**. Id zon kekal
`dusun` (save lama selamat).

- **Susun atur** (`zones/zones.ts`, prop dalam `zones/tasikProps.ts`, bentuk tasik & sampan dalam `zones/sampan.ts`), pagi
  cerah. Qish masuk dari barat (Lorbel), promenade sepanjang tebing selatan, keluar ke KLIA ikut jambatan di timur.
  - **Tasik:** air hijau-biru beralun + kilauan, buih putih di tebing, tebing tanah + rumput, **teratai** berkelompok
    (pad + bunga pink/putih/rose + kudup), mensiang & rumput air & batu sepanjang tebing, **pulau kecil** di tengah
    (pokok hujan-hujan, batu, memerang berjemur), anak sungai ke selatan bawah jambatan, ikan melompat, pepatung, bangau
    putih (terbang bila Qish dekat).
  - **Barat:** gerbang "← Lorbel", huruf besar **TASIK LILY** warna-warni, **sudut batik lukis**: 3 frame atas easel (yang
    tengah sedang dilukis, warna terisi sikit-sikit depan mata, motif lily), 4 kain batik siap berkibar atas tali, banner
    "BATIK LUKIS · CUBA SENDIRI", meja pewarna, periuk lilin berasap, Kak Batik + budak. Willow condong atas air.
  - **Promenade selatan:** batas **Lilium** (putih, pink, rose, peach, kuning), bangku menghadap tasik, lampu, 2 willow,
    pejalan kaki & jogger & basikal pagi (patah balik sebelum Snorlax; cakap "Jalan pagi, sihat!", "Lepas ni roti canai").
  - **Jeti sampan:** jeti kayu, kiosk biru "SAMPAN · SEWA", Pakcik Sampan, 2 sampan sewa tertambat. **Pelantar memancing:**
    2 pakcik (doodle dari belakang atas stool) + seorang lagi di tebing timur bawah payung; joran 3D, tali, pelampung
    terangguk; sesekali ikan terangkat ("Dapat!"), "Shhh! Ikan lari!" kalau sampan Qish terlalu dekat.
  - **Laman picnic:** keluarga atas tikar gingham merah (bakul, pinggan, termos, keropok), couple bawah payung pink, budak
    tiup buih sabun, dua orang main frisbee. **Memerang pencuri:** setiap ~30s seekor memerang naik dari tasik, lari ke
    bakul, curi keropok ("WOI! Keropok aku!"), terjun balik makan atas air.
  - **Taman Lily:** 4 batas Lilium + **lily pink tersusun bentuk hati** ("Siapa la rajin sangat ni." → bayangan Faris).
  - **Car boot sale** (parking): Kancil kuih muih RM1, Saga pokok bunga (termasuk lily dalam pasu), MPV preloved RM5
    (rak baju, kasut), MPV vinyl & kaset ("Ada Laufey tak? Joji?" → "P. Ramlee je. Lapan keping."), peniaga & pembeli;
    **Myvi merah** Qish parking sebelah.
  - **Snorlax Twin** (model 3D baru, ganti standee kad): baring terlentang atas tikar picnic betul-betul depan jambatan,
    badan biru, perut krim, **baju pink dengan muka Qish** (dipotong dari art kad 7), kaki ke arah kamera, perut naik turun,
    "Z" terapung, berdengkur bila Qish dekat. Lepas menang dia tidur balik di tepi (sebelah Myvi); lepas ending = main semula.
- **Sampan (mekanik baru enjin):** `Overworld.setRide()` + `Ride` (`overworld/zone.ts`): bila naik, Qish meluncur atas air
  (pecut perlahan, hanyut bila lepas, melantun dari tebing), sampan pusing ikut arah, Qish duduk dalam sampan sambil
  mendayung, **Bowat baring di belakang sampan** (tak tolong dayung), riak air di belakang. Hanya boleh dalam tasik (bukan
  anak sungai), elak pulau, jeti, pelantar. Juga baru: `b.region()` (kawasan larangan bukan kotak: air) dan `interact(...,
  when)` (prompt bersyarat: "Naik sampan" di darat, "Turun" atas air).
- **Memerang:** keluarga (ibu + 3 anak) berenang keliling pulau berbaris; bila sampan dekat mereka **ikut belakang sampan**
  sampai Qish jauh. Dua ekor tidur terapung **pegang tangan** (dialog: "...Okay itu sweet gila."). Yang berjemur atas pulau
  terjun bila sampan dekat, naik balik bila Qish pergi.
- **Kumpul: 6 bunga lily** (item baru `lily`, terapung atas air dengan cahaya menegak) di tengah tasik, hanya boleh
  dipetik dari sampan. Aliran: masuk kali pertama `TASIK_ARRIVE` ("bunga favourite aku!") → Snorlax mengigau "lily..."
  (`BOSS_TALK.snorlax.collect`) → Pakcik Sampan: free, "lelaki rambut kerinting, malas cakap" dah bayar → naik sampan
  (tip kali pertama) → petik 6 → turun di jeti → bagi Snorlax: bau wangi, sebelah mata terbuka, "Tapi aku LAPAR." →
  minigame. Flag: `tasikArrived`, `sampanTip`.
- **Minigame Snorlax** kini berlatar Tasik Lily (langit pagi, pokok seberang, tasik penuh teratai, tebing berumput).
  Intro "Boss 3 · Tasik Lily".
- Dialog baru semua **draf** (`content/script.ts`, kunci `dusun:*`): papan, batik, pakcik sampan, pancing, picnic, couple,
  bangku, hati lily, 4 gerai car boot, memerang, memerang pegang tangan, Snorlax tidur. Speaker baru: Pakcik Sampan, Pakcik
  Pancing, Kak Batik, Makcik Picnic.
- Prestasi: prop statik dibakar; bahagian kecil (memerang, willow, sampan, Snorlax) dibakar per kumpulan. ~510 objek
  (Putrajaya ~590, Lorbel ~610).
- Diuji headless (1280×720 & phone 390×844): masuk dari Lorbel, Snorlax sebelum lily, pakcik, naik sampan, dayung (tak
  boleh keluar tasik), petik lily, memerang ikut & terjun, turun di jeti, jalan kaki tak boleh masuk air, Snorlax lepas 6
  lily → minigame, keadaan lepas menang. Tiada error console (cuma favicon 404 lama). Belum diuji di GPU sebenar untuk fps.

**Perlu dari Faris:** semak dialog draf; nak tukar nama "Tasik Lily"? Ada kenangan picnic/tasik/batik sebenar korang?

### Tasik Lily v2 — tasik di tengah, aliran pepenjuru (2026-10-25) ✅

**Maklum balas Faris:** map-map lain terlalu general (semua mula kiri, jalan lurus ke kanan); nak cara lain. Tasik mesti
**di tengah** supaya **sekeliling hidup**, bukan depan je. Faris pilih **pepenjuru**: masuk penjuru kiri bawah, keluar
penjuru kanan atas. Map lain: **tasik dulu, yang lain kemudian** (tengok satu-satu lepas ni).

- **Tasik di tengah** (`zones/sampan.ts`: `LAKE` dengan dua lengan, `BOAT` = badan tasik sahaja untuk sampan). Lengan utara
  keluar ke atas map, lengan timur keluar ke kanan, jadi penjuru timur laut (jalan ke KLIA) hanya boleh dicapai ikut
  **jambatan atas lengan utara**, tempat Snorlax Twin tidur. Pulau kecil di tengah (2 pokok, batu, memerang).
- **Laluan:** masuk dari gerbang "← Lorbel" di kiri bawah, jalan pepenjuru naik ke **promenade gelung** keliling tasik.
  Sebelah barat-utara gelung sampai ke jambatan Snorlax; sebelah selatan-timur berakhir di muara lengan timur (pakcik
  pancing). Lepas jambatan: jalan pepenjuru ke gerbang "KLIA →" di kanan atas.
- **Setiap sisi:**
  - Barat daya: gerbang masuk, huruf TASIK LILY, Taman Lily (4 batas + hati lily pink), willow.
  - Barat: laman picnic (family + memerang pencuri keropok, couple bawah payung, budak buih sabun).
  - Barat laut: sudut batik lukis; padang belakang dengan dua orang main frisbee; willow.
  - Utara: Snorlax Twin atas tikar di kepala jambatan (lepas menang: tidur di padang sebelah batik).
  - Timur laut: jalan keluar, motor aiskrim, batas lily, bangku, papan "KLIA ↗", willow.
  - Timur: **memerang berjemur atas batu tepi promenade** (terjun bila Qish lalu, naik balik bila dia pergi), wakaf dengan
    dua makcik (dialog: nampak "budak lelaki rambut kerinting... macam malas nak pergi mana-mana"), papan "Kawasan
    Memerang", pakcik pancing di muara, family picnic kedua, gerai air kelapa.
  - Selatan: jeti sampan + kiosk + Pakcik Sampan, pelantar 2 pakcik memancing, bangku, batas lily.
  - Tenggara: car boot sale (4 kereta + Myvi merah).
  - Atas air: 6 lily untuk dikumpul di sekeliling pulau, keluarga memerang ikut sampan, sepasang memerang tidur pegang
    tangan, ikan melompat, bangau, pepatung.
- Pejalan kaki/jogger kini di dua laluan (selatan-timur dan barat-utara), patah balik sebelum Snorlax.
- Dialog draf baru: `dusun:otterden`, `dusun:wakaf`, `dusun:kelapa`.
- ~580 objek (Lorbel ~610). Diuji headless: semua 8 sisi, naik sampan dari jeti selatan, petik lily, turun, Snorlax di
  jambatan utara → minigame. Tiada error.

### Sunway Lagoon → Bukit Bintang (2026-10-25) ✅

**Permintaan Faris:** fokus zon Sunway Lagoon, cantik & hidupkan, tukar jadi **Bukit Bintang** (rujukan: gambar udara simpang
BB) campur sikit tema **bandar muzik**: crosswalk besar macam Shibuya, skrin-skrin macam New York, nampak tower-tower KL,
gelandangan Rohingya, kedai shawarma, monorel. Masa misi Bowat, **NPC lari sebab kentut bersepah**; bila dah settle semua,
**kembali berjalan macam biasa**. Jawapan Faris: layout **scramble di tengah** (masuk atas, keluar kanan); "vinyl music" =
**bandar muzik** (kedai vinyl, busker, nota muzik, skrin main lagu); misi = **sembur 6 awan kentut**; Sunway Lagoon **buang
terus** (gag singa kekal dalam Kisah Kita sahaja). Id zon kekal `sunway` (save lama selamat).

- **Susun atur** (`zones/zones.ts`, prop dalam `zones/bintangProps.ts`), lewat petang. Jalan Bukit Bintang (timur-barat) ×
  Jalan Sultan Ismail (utara-selatan), **scramble di tengah**: 4 zebra + **X kuning** pepenjuru, garisan berhenti, kaki lima
  bata merah, bollard, lampu isyarat dengan lampu pejalan kaki. Masuk dari **atas** (kaki lima barat, dari Labu Lanjut),
  keluar **kanan** ke Lorbel.
  - Barat laut: deretan kedai **URUT KAKI** (tout "Urut kaki, kakak?"), **KEDAI 24 JAM** (pewangi), **SHAWARMA BINTANG**
    (spit daging berpusing, asap, abang shawarma, barisan orang), **MAMAK 24J** (meja plastik biru); papan neon menegak
    HOTEL/KARAOKE/SPA, skrin atas bumbung.
  - Timur laut: mall **BINTANG WALK** dinding kaca, **skrin melengkung gergasi di sudut**, skrin iklan, jalur equaliser,
    kiosk **BURGER**, **stesen monorel Bukit Bintang** dengan tangga.
  - **Monorel** atas Jalan Sultan Ismail: landasan konkrit, tiang-T, kereta 2 gerabak putih-biru lalu, berhenti di stesen,
    patah balik (bunyi wuuush).
  - Barat daya: **PIRING HITAM** (kedai vinyl; **piring hitam gergasi berpusing atas bumbung**, peti vinyl, Abang Vinyl),
    **KEDAI GITAR**, **busker** (gitar + penyanyi, amp, beg gitar penuh syiling, papan "request lagu RM1", nota muzik terapung,
    muzik akustik ikut jarak), **keluarga Rohingya** atas kotak tepi kedai bertutup (bapa berkopiah & kain pelekat, ibu
    bertudung, anak kecil).
  - Tenggara: petak merah **ZON MOTOSIKAL** (motor sebaris), **Piano Jalanan** (14 kekunci dicat, berbunyi bila dipijak),
    huruf **BUKIT BINTANG**, Myvi merah Qish.
  - Lampu jalan hitam dengan banner **"♪ BANDAR MUZIK"**, papan nama jalan hijau, pokok dalam pasu granit.
- **Skrin LED hidup** (canvas dilukis semula ~12fps): masa misi semua skrin besar tunjuk **"⚠ BERITA TERKINI: AWAN KENTUT
  MISTERI LANDA BUKIT BINTANG"** + siluet sloth + kiraan awan + ticker ("Suspek: sloth kelabu, gemuk, comel · Suspek nafi:
  '0% bukti'"). Lepas selesai: **"SEDANG DIMAIN"** dengan piring hitam berpusing bergilir **Laufey / Joji / Bryant Barnes /
  Malcolm Todd** (ikut senarai BGM), iklan shawarma & Piring Hitam, equaliser.
- **Skyline KL & kamera scenic (enjin baru):** kamera overworld top-down memang tak pernah nampak langit, jadi ZoneDef dapat
  `scenic` (weight/offset/lookY/lookAhead): bila Qish di hujung utara (masuk dari Labu Lanjut), kamera turun rendah dan pandang
  sepanjang jalan ke **Menara Berkembar Petronas (dengan skybridge), Menara KL, Merdeka 118** + langit senja. Bila dia jalan
  ke selatan, kamera balik top-down (sedikit rendah dari biasa supaya skrin & kedai nampak).
- **Misi (koleksi baru `kentut`, kunci `got:sunway:*`):** masuk kali pertama `BB_ARRIVE` (semua orang lari, "BAU APA NI?!") →
  tanda "!" atas Kedai 24 Jam → Kak Kedai: pewangi tinggal satu, **perisa Bunga Lily**, dah dibayar oleh "lelaki rambut
  kerinting" (flag `bbSpray`) → **6 awan kentut besar** (depan shawarma, depan mall, depan Piring Hitam, Zon Motosikal, jalan
  barat, jalan selatan) dihilangkan dengan jalan masuk (bunyi PSSSHT, kabus pink). Sebelum ada pewangi: "Uhuk!" batuk.
  Bowat duduk tengah scramble dalam kubah awan (tak boleh dekat; "PROT!" berkala) sampai semua 6 hilang.
- **NPC panik → tenang:** 16 pelintas + 13 pejalan kaki + orang berdiri. Masa misi: doodle baru **tutup hidung, tangan
  terkapai, mata "> <", garisan bau hijau**, lari laju bertaburan (lalu tengah simpang, elak awan), jerit "BUSUKNYA!!",
  "Siapa kentut?!"; kereta **jem** berhenti dengan lampu hazard berkelip & hon. Orang dekat awan yang dah disembur kembali
  tenang (barisan shawarma, penonton busker, peminat skrin muncul balik ikut awan masing-masing). Semua awan hilang →
  **lampu isyarat hidup**: kereta ikut fasa (EW → NS) dan **fasa scramble** di mana semua orang melintas serentak termasuk
  pepenjuru (bunyi bip lintasan). Sementara Bowat masih di tengah, fasa pejalan kaki kekal & orang melintas mengelilingi dia.
  Kereta sentiasa berhenti untuk Qish.
- **Gelandangan:** cakap dengan keluarga → Qish belanja **3 shawarma** (flag `bbShawarma`), mereka terus pegang shawarma.
  Ditulis dengan hormat (tiada lawak tentang mereka).
- **Minigame Bowat** kini di simpang Bukit Bintang waktu senja: skyline KL (Menara KL, Petronas, Merdeka 118), bangunan
  bertingkap menyala, skrin (BOWAT / vs QISH / BANDAR MUZIK), monorel lalu, kaki lima bata, zebra + X kuning, platform =
  **kanopi kedai berjalur**. Intro "Boss 1 · Bukit Bintang".
- Teks lain dikemas kini: Encik Sloth ("ke arah Bukit Bintang"), palang Labu Lanjut "Bukit Bintang ↓", papan berlepas KLIA,
  kad 5 boss "Bukit Bintang". Kisah Kita masih sebut Sunway Lagoon (kenangan sebenar).
- Dialog baru semua **draf** (`content/script.ts`: `BB_*`, `CLOUD_NO_SPRAY`, `sunway:*`, `COLLECT_TALK.sunway`,
  `BOSS_TALK.bowat.collect/pre`). Speaker baru: Abang Shawarma, Kak Kedai 24 Jam, Abang Vinyl, Pakcik, Orang ramai.
  Hint Faris: Abang Vinyl kata lelaki rambut kerinting beli satu set vinyl Laufey/Joji/Bryant Barnes/Malcolm Todd, cakap "k" je.
- Prestasi: prop statik, landasan monorel, skyline, setiap kereta dibakar (`mergeStatic`); lampu hazard 1 mesh/kereta.
  ~1350 draw call di tengah (Lorbel ~1180). Diuji headless (1280×720 & phone 390×844): masuk + kamera scenic, awan sebelum
  pewangi, beli pewangi, sembur awan, keluarga, semua awan → tenang, kitaran lampu + fasa scramble, Bowat → minigame,
  keadaan lepas menang. Tiada error. Belum diuji di GPU sebenar untuk fps.

**Perlu dari Faris:** semak dialog draf (terutama keluarga Rohingya, okay tak nadanya?); nak tambah kenangan BB sebenar
korang (tempat makan, kedai yang selalu pergi)? Lagu apa nak busker main?

### Bukit Bintang v2 — simpang X, scramble luas, MRT, menara skrin (2026-10-25) ✅

**Maklum balas Faris:** tengah-tengah (scramble) kena lagi luas sebab itulah attraction utama; masuk dari **subway bawah
tanah**: Labu Lanjut di satu seberang, Lorbel di seberang lagi satu; **pusing** simpang supaya jalan nampak bentuk **X**
(bukan +), dan bahagian yang ada **skrin digital besar duduk di atas**.

- **Simpang dipusing 45°** (`zones/bintangProps.ts`: rangka jalan `W(u,v)`/`UV(x,z)`, `ROT`): Jalan Bukit Bintang dari kiri
  atas ke kanan bawah, Jalan Sultan Ismail dari kanan atas ke kiri bawah. Jalan kini **11 lebar, 2 lorong sehala**, zebra
  lebih panjang, garisan scramble kuning (bila dipusing nampak macam + di tengah). Empat blok: **atas, kanan, bawah, kiri**.
  Lorong, lampu isyarat (3 bucu), lampu banner, bollard, laluan orang ramai semua ikut rangka jalan. 24 kereta.
- **Atas: menara skrin** (`screenTower`), bucunya menghala ke simpang: **skrin melengkung gergasi di bucu** + **skrin besar
  di kedua-dua muka** + jalur equaliser di atas + "BINTANG WALK". Tak kena kabus, jadi menyala dari seberang simpang.
- **Kiri: stesen MRT "Labu Lanjut"** (tangga turun, dinding kaca, logo MRT, totem). Qish muncul di atas tangga bila datang
  dari Labu Lanjut; turun tangga = balik. Kedai 24 jam (pewangi) betul-betul sebelah, lepas tu shawarma, mamak, urut
  sepanjang muka blok. Stesen monorel di atas blok kiri.
- **Kanan: stesen MRT "Lorbel"** (turun = ke Lorbel), Kedai Gitar, Piring Hitam (piring hitam gergasi atas bumbung),
  keluarga Rohingya tepi kedai bertutup, ZON MOTOSIKAL, kiosk burger, Myvi.
- **Bawah: SPOT GAMBAR** (bulatan pink "📸"). Berdiri atasnya → **kamera turun rendah** pandang seberang scramble ke menara
  skrin, dengan **Petronas di kiri, Menara KL & Merdeka 118 di kanan** (macam gambar rujukan). Huruf BUKIT BINTANG,
  piano jalanan, busker.
- **Monorel** kini datang dari kiri atas sepanjang Jalan Bukit Bintang dan **berhenti di stesen hujung** atas blok kiri
  (penahan merah), lepas tu patah balik. Tak lagi melintang depan spot gambar atau atas scramble.
- Kamera masuk dari utara (versi 1) dibuang; skyline sekarang dari spot gambar.
- **Awan kentut** dipindah: depan shawarma, bawah menara skrin, depan Piring Hitam, Zon Motosikal, dan **dua zebra di
  tengah** kiri atas & kanan bawah Bowat.
- Dialog dikemas kini untuk MRT (`BB_ARRIVE`: naik tangga MRT; kedai 24 jam "sebelah stesen MRT"), spot gambar, monorel,
  "stesen MRT ke Lorbel ditutup sementara" (`COLLECT_TALK.sunway.notYet`).
- Diuji headless (1280×720 & 390×844): muncul dari MRT, beli pewangi, sembur awan, keluarga, semua awan → lampu & fasa
  scramble, spot gambar (masa misi: skrin BERITA TERKINI; lepas: Malcolm Todd / Bryant Barnes / iklan shawarma), Bowat →
  minigame. Tiada error.

**Perlu dari Faris:** sudut spot gambar okay? Nak MRT tu nama stesen sebenar (cth. "MRT Bukit Bintang") atau kekal nama
destinasi (Labu Lanjut / Lorbel)?


### Cosy Place → Nyomnyom City (2026-10-25) — keputusan

**Permintaan Faris:** fokus Cosy Place, cantik & hidupkan; tukar jadi **Nyomnyom City**, bandar makanan. Kamera macam
**fish eye**, Qish teroka **map berbentuk bulat**. Kedai: McDonald's, Dubuyo, malatang, Cosy Place + tema makanan.

Jawapan Faris (AskUserQuestion):
- **Kamera: tiny planet** — tanah melengkung ke bawah di tepi skrin macam Qish jalan atas planet kecil (bukan efek kanta).
- **Layout: bandar pizza** — bandar bulat dipotong macam pizza, jalan dari tengah keluar jadi hirisan, setiap hirisan satu
  kedai makan. **Cosy Place di tengah.** Jalan lingkar keliling. Masuk bawah (dari KLIA), keluar kanan atas (ke Photobooth).
- **Misi: bayar hutang Bowat** — masuk bandar, Bowat lari makan kat setiap kedai tak bayar; Qish bayar resit dia satu-satu.
  Akhir sekali Bowat di Cosy Place terlalu kenyang → Mega Bowat → minigame dapur.
- **Kedai tambahan:** kek mango, daging salai, Ayam Gepuk, kedai cookies (selain McD, Dubuyo, malatang).
- **Cosy Place sebenar:** fine dining klasik, beef steak, waiter berpakaian uniform. First date makan **lasagna**.
  Momen first date: tak perlu.
- **Waktu:** senja → lampu kedai & neon mula menyala.

### Nyomnyom City — dibina (2026-10-25) ✅

Id zon dalam kod kekal `cosyplace` (save lama selamat). Nama HUD/Myvi: **Nyomnyom City**.

- **Enjin baru: tiny planet** (`overworld/planet.ts`). Zon boleh set `planet: { radius, camOffset, fov, sky }`: setiap
  material dalam zon ditampal dalam vertex shader supaya dunia dibalut atas sfera di bawah kamera (jejari 30). Tanah
  melengkung jatuh di semua tepi, bangunan condong keluar, langit senja (gradient) nampak di ufuk. Berjalan, collider,
  bayang dan kamera kekal rata; cuma lukisan yang bengkok. Geometri besar dipecah (tessellate) supaya ikut lengkung.
  Prompt "A" dikira ikut kedudukan bengkok. Benda yang dah jatuh bawah ufuk disorok (`horizonCull`) supaya draw call
  sekitar ~680 (tanpa sorok ~1130).
- **Susun atur bandar pizza** (`zones/nyomProps.ts`, `nyomShops.ts`, `cosyPlace.ts`): bandar bulat jejari ~33. Tengah:
  plaza marmar + **Cosy Place**. Jalan lingkar sehala ikut jam (kereta, teksi, van, rider delivery pink; semua berhenti
  untuk Qish & Bowat), zebra di setiap simpang. 8 jalan bata merah (potongan pizza) ke **kerak roti** (gelang doh
  berbonjol, warna keemasan dengan tompok hangus). Setiap hirisan lantai berwarna ikut kedainya. Pasu bunga merah bulat
  ("pepperoni"), lampu jalan menyala, pokok di belakang kedai, hutan pokok di luar kerak (nampak sebagai ufuk).
  Masuk dari **KLIA di bawah** (gerbang "NYOMNYOM CITY"), keluar ke **Photobooth di kanan atas** (gerbang pink).
- **7 kedai** (hirisan, ikut jam dari gerbang): **Kek Mango** (kek mango gergasi berpusing atas bumbung, peti kek),
  *(hirisan parking: Myvi, 2 kereta, gerai air balang, papan Peta Nyomnyom)*, **Ayam Gepuk** (lesung gergasi, antan
  menumbuk "GEPUK!", papan level pedas 1–10 "Sepang"), **Malatang** (bumbung pagoda, tanglung merah berbuai, mangkuk
  gergasi + cucuk, peti pilih sendiri, **penimbang "80.0kg"** boleh dinaiki), **Dubuyo** (kedai hitam-merah, periuk
  ramen gergasi + chopstick angkat mi, neon "LEVEL 🔥5", barisan orang), **McDonald's** (golden arches atas tiang,
  drive-thru dengan kereta menunggu, fries gergasi), **Daging Salai** (gerai kampung, bumbung zink, 3 tong salai berasap
  tebal, daging tergantung), **Cookies** (bumbung coklat meleleh, cookie gergasi berpusing, balang besar). Kedai separuh
  utara menghadap tengah; separuh selatan menghadap **luar** (sebab kamera sentiasa dari selatan, supaya tak tutup Qish).
- **Cosy Place** (fine dining klasik): rotunda 12 tiang, kubah rusuk emas + kaca, chandelier kristal dengan lilin
  berkelip, lantai papan catur marmar + karpet burgundy, meja kain putih (steak, wine, lilin, ros), kerusi baldu merah,
  **4 pasangan dinner**, **3 waiter** (vest, bow tie, dulang cloche) keluar masuk **dapur** (pintu berayun), chef bertopi
  tinggi menjerit order, **pianist di grand piano** + nota muzik terapung + **muzik waltz piano asli** (`core/piano.ts`,
  makin kuat bila dekat). Karpet merah + tali baldu ke jalan, **Maître d'** di podium. **Meja 8** (betul-betul bawah
  chandelier): kad "Reserved · Meja 8 · Qish", dua pinggan **lasagna**.
- **Misi "bayar hutang Bowat"** (koleksi baru `resit`, 7 resit, kunci `got:cosyplace:*`): masuk kali pertama
  `NYOM_ARRIVE` → Bowat "*sniff sniff*... NYOM NYOM" → lari. Dia duduk makan di kedai (tanda ! atas kepala, "nyom"),
  bila Qish dekat dia **lari ke kedai seterusnya** ikut jalan & kaki lima, tinggalkan **timbunan pinggan** dan **resit**
  (tanda ! atas penjual). Ambil resit = dialog lucu setiap kedai (`RESIT_TALK`, jumlah RM391). Lepas Cookies, Bowat
  lari masuk Cosy Place ke Meja 8. Semua resit langsai → "Bowat!" → dia makan lasagna first date → evolve → Mega Bowat
  terbang masuk dapur → minigame. **Lepas menang:** Maître d' bagi resit kerosakan dapur panjang ke lantai... "Bergurau.
  Encik rambut kerinting dah bayar semua petang tadi." Bowat ikut Qish semula. Main semula (lepas ending) di pintu dapur.
- **Hint Faris:** Maître d' — meja ditempah petang tadi oleh "encik rambut kerinting, nampak sangat penat", dia cakap "k",
  pesan lasagna dua pinggan.
- Speaker baru: Kak Kek Mango, Abang Gepuk, Auntie Malatang, Abang Dubuyo, Crew McD, Pakcik Salai, Kak Cookies,
  Maître d', Chef Cosy Place. Doodle baru: bow tie, topi chef, bawa dulang cloche / mangkuk / aiskrim cone.
- Diuji headless (1280×720 & 390×844): ketibaan + Bowat lari, kejar & bayar resit, Meja 8 → minigame, keadaan lepas
  menang (Bowat ikut, Meja 8 licin), gerbang keluar terkunci → terbuka ke Photobooth. Tiada error. `npm run build` lulus.
  Belum diuji di GPU sebenar untuk fps (~680 draw call, ~270k segi tiga).

**Perlu dari Faris:** semak dialog draf (terutama resit setiap kedai & Maître d'); kuat sangat ke lengkung planet
(jejari 30, boleh dikurangkan/ditambah); harga dalam resit okay? Ada kedai/menu sebenar yang korang selalu order
(contoh order McD, level Dubuyo) nak masukkan?

### Lorong Photobooth v2 — jalan ular, kamera gergasi (2026-10-25) — keputusan

**Permintaan Faris:** fokus Photobooth, cantik & hidupkan. Jalan bandar **bengkang-bengkok macam ular**. Bandar bertema
photobooth: banyak mesin photobooth, kamera digital, backdrop, lampu flash, **strip berterbangan**.

Jawapan Faris (AskUserQuestion):
- **Layout: Ular S 3 lengkok** — masuk kiri bawah (dari Nyomnyom), jalan meliuk 3 kali naik ke atas, keluar kanan atas
  (ke Putrajaya). Centrepiece di lengkok tengah; booth, backdrop & lampu flash dalam setiap lengkok.
- **Centrepiece: kamera digital gergasi** — bangunan bentuk kamera digital pink, lensa jadi pintu Galeri Memori, FLASH
  besar berkala menyala seluruh bandar, strip terpancut keluar dari slot macam printer.
- **Waktu: siang pastel studio** — cerah, krim-pink macam studio photobooth Korea, bayang lembut.
- **Misi: kejar strip terbang** — 6 strip ditiup angin sepanjang jalan ular; bila Qish dekat ia terbang lari ke spot
  seterusnya, akhirnya tersangkut (atas backdrop, lampu flash, dll). Ganti 6 roll filem.

### Lorong Photobooth v2 — dibina (2026-10-25) ✅

Id zon kekal `photobooth`. Prop baru semua dalam `zones/boothProps.ts`; susun atur dalam `zones/zones.ts` (`PB_*`).

- **Jalan ular = jalur filem gergasi** (`SNAKE`, `filmRoad`): satu spline Catmull-Rom (~200 unit, ~40 saat jalan kaki).
  Masuk kiri bawah dari Nyomnyom → larian bawah (meliuk) ke timur → **lengkok kanan** naik → larian tengah ke barat →
  **lengkok kiri** naik → larian atas ke timur → keluar kanan atas ke Putrajaya. Tekstur negatif filem: jalur sprocket
  ungu dengan lubang, cetakan tepi "BOLAT 400 ▶ 26 / QISH ♥", bingkai pucat dengan hati. **Tali baldu** atas tiang
  loyang sepanjang kedua-dua tepi (ada bukaan di mulut plaza & depan booth). Rumput mint + bunga pastel di luar jalan;
  `region` sekat semua kecuali jalan + plaza, jadi **tiada jalan pintas** merentas lengkok (diuji).
- **Kamera digital gergasi BOLAT·CAM** (`giantCamera`) di tengah, utara larian tengah: badan pink bucu bulat, plat atas
  perak, butang shutter, dial mod berpusing, lampu AF, tali kamera terjuntai ke plaza, lensa berzoom. Setiap 10 s:
  **zoom keluar → bip-bip → FLASH** (tingkap flash menyala, flare besar, PointLight, kolam cahaya, **skrin jadi putih**
  bila Qish dekat, `sfx.bigFlash`) → apertur iris tutup-buka → **strip cetak naik dari slot atas** → ditiup angin.
  **Galeri Memori** = dua tali lampu kiri-kanan lensa dengan 10 strip sebenar disepit; 4 sentiasa ada, 6 lagi **peg
  kosong** sampai Qish kutip. Easel (doodle Qish) = trigger Bolat ex dengan "!"; meja kamera instan; papan A-frame.
- **13 mesin photobooth** (`boothMachine`): 7 studio sebenar (123 Annyeong, Inssa Film, Dear Memories, Fotopot,
  Photomansion, KPIX, Hana Film) + rekaan (Senyum Studio, Kimchi Click, 4 Pose, Snap Snap, BOLAT·BOOTH). Papan marquee
  mentol berkejar, langsir berayun, skrin sentuh. Berkala ada sesi: skrin kira **3·2·1 → CHEESE!** ×4 flash (langsir
  menyala, cahaya tumpah ke jalan, bunyi shutter bila dekat) → **CETAK...** → strip keluar slot tepi, kadang terbang.
- **Backdrop Alley** (utara larian bawah): dinding bunga "senyum sikit ♥", gerbang belon "senyum~", neon "SAY CHEESE!";
  ring light, softbox, payung, tripod DSLR, orang bergaya bertukar pose + jurugambar. **Taman Backdrop 2** (dalam lengkok
  kiri): langsir labuci berkilau, sayap bidadari, bingkai polaroid gergasi "#BOLATEX ♥ kenangan" (orang pose di belakang).
  Tekan A di backdrop = **"Bergambar"**: Qish menghadap kamera, lampu flash, KLIK, Bowat photobomb (*kentut senyap*).
- **Taman Strip** (dalam lengkok kanan): **Pokok Strip** (dahan penuh strip berkibar, sekali-sekala satu tercabut terbang),
  kiosk **CETAK GAMBAR** (printer meludah gambar), bangku pastel dengan couple tengok strip.
- **Studio Flash** (utara larian atas): kertas latar pink melengkung, 3 strobe menyala bergilir, model atas stool,
  jurugambar, pembantu. **Patung kamera digital Y2K** atas pelantar (5, flash sendiri), **taman bentuk hati**, **gulungan
  filem gergasi** dengan ekor filem meliuk atas rumput. **Lampu jalan kepala flash**, **bunting polaroid** merentas
  jalan, kedai studio pastel dua tingkat di sekeliling (HARU STUDIO, POSE POSE, 4CUT LAB, KEDAI KAMERA, Y2K DIGICAM...).
  Pintu masuk: dua **tin filem gergasi "BOLAT 400"** dengan banner LORONG PHOTOBOOTH; keluar: dua strip gergasi +
  "PUTRAJAYA →". Myvi di petak selatan larian bawah.
- **Strip berterbangan** (`flyingStrips`): ~34 strip rekaan sentiasa hanyut ikut angin dari kiri, ditambah yang
  dicetak oleh booth, kamera gergasi, kiosk dan pokok.
- **Misi baru: kejar 6 strip terbang** (item `strip`, ganti roll filem; kunci `got:photobooth:*` sama). Setiap strip
  (gambar sebenar #5–#10) bercahaya atas jalan; Qish dekat (3.6) → *whoosh* terbang ke depan ikut jalan → dekat lagi →
  terbang dan **tersangkut** (gerbang belon, depan Fotopot, Pokok Strip, plaza kamera, langsir labuci, Studio Flash)
  → baru boleh kutip. Ketibaan pertama: kamera flash + `PB_ARRIVE`. Lepas cukup 6 → easel → memory minigame.
- Orang ramai siang (`lorbelCrowd` dapat `tint` & ayat jalan sendiri; mod baru **pose** & **snap**), doodle baru pegang
  **kamera digital** atau **strip**. Bayang awan & rama-rama.
- Dialog baru semua **draf** (`PB_ARRIVE`, `PB_POSE`, `boothxLines`, `photobooth:camera/gate/tree/kiosk/studio`,
  `COLLECT_TALK.photobooth`, `BOSS_TALK.bolatex`).
- Diuji headless (1280×720 & 390×844): ketibaan, semua kawasan, tak boleh potong lengkok, kejar & kutip 6 strip, galeri
  penuh, easel → Bolat ex. Tiada error. ~1150 draw call paling sibuk (Lorbel ~1180). Belum diuji di GPU sebenar.

**Perlu dari Faris:** semak dialog draf; nak tukar booth rekaan jadi studio lain yang korang pernah pergi? Flash skrin
putih setiap 10 s okay atau terlalu kerap untuk stream?

### Litar Sepang v2 — arena litar penuh (2026-10-25) — keputusan

**Permintaan Faris:** fokus Litar Sepang, cantik & hidupkan. Qish **mula dari luar litar, parking depan pintu masuk**,
rasa masuk satu arena litar lengkap: ada pit, ada perlumbaan tengah berlangsung.

Jawapan Faris (AskUserQuestion):
- **Layout: ala Sepang sebenar** — parking (bawah, dari Putrajaya) → pintu masuk → fan zone & paddock → bangunan pit
  + garaj → **jambatan atas main straight** (kereta lalu bawah kaki) → **grandstand bumbung daun di tengah** antara main
  straight & back straight → jambatan kedua atas back straight → keluar kanan atas ke Labu Lanjut.
- **Lumba: F1 penuh** — grid F1 berwarna-warni, pit stop krew tukar tayar, safety car sekali-sekala.
- **Cuaca: mendung, nak hujan** — langit kelabu-ungu, angin, guruh jauh, renyai; lampu stadium dah menyala. Sedia
  pentas untuk finale (Hot Giler hentikan hujan).
- **Misi: 6 pas paddock** — Raja Malas tunggu kat podium (kawasan ALL ACCESS); kumpul 6 pas dari orang di seluruh
  litar (kaunter tiket, merch, krew pit, usher grandstand, marshal, pengulas) untuk masuk.

### Litar Sepang v2 — dibina (2026-10-25) ✅

Id zon kekal `sepang`. Prop baru dalam `zones/sepangTrack.ts` (litar, kereta, simulasi lumba) dan `zones/sepangProps.ts`
(bangunan, grandstand, jambatan, cuaca); susun atur dalam `zones/zones.ts` (`SP_GIVERS`, `spWalkable`).

- **Enjin baru: lantai bertingkat** (`ZoneBuilder.floor`): zon boleh beri ketinggian kaki Qish ikut (x, z). Dipakai untuk
  dua jambatan (naik ramp, lalu atas trek, kereta lalu bawah kaki) dan tangga ke podium atas bumbung. Bowat ikut sekali.
- **Susun atur (selatan → utara):** **parking** (Qish masuk dari Putrajaya di kiri bawah, Myvi dalam petak, ~50 kereta
  parkir, sebuah kereta merayap cari parking dan berhenti untuk Qish, bas shuttle, gerai baju hujan RM5, jaga parking
  dengan baton) → **pintu masuk** (dua pylon merah, papan "LITAR ANTARABANGSA SEPANG", turnstile, 2 kaunter tiket, pagar
  kiri-kanan, Jalur Gemilang) → **fan zone** (skrin besar SEPANG TV dengan peta litar live + 6 teratas + ticker, food truck
  satay & ais kacang, simulator F1, 3 khemah merch, kereta pameran BOLAT GP berpusing, bendera team) → **paddock**
  (3 trak transporter, timbunan tayar, skuter berulang-alik, Pusat Media, Pusat Perubatan) → **bangunan pit** (9 bay:
  7 garaj team + 1 laluan "↑ PIT LANE" + MALAS RACING; garaj terbuka dua hujung, kereta spare atas stand; MALAS RACING:
  kereta berselimut, 3 krew tidur atas sofa dengan zzz, papan "JANGAN KACAU") → **pit lane** (lorong laju + jalur kerja,
  kotak team berwarna, had laju 80) → **pit wall** (pagar, 4 gantry team) → **main straight** (garisan start, petak grid,
  gantry lampu hijau) → **grandstand di tengah** (10 tingkat kerusi berwarna, ~250 penonton instanced yang bersorak,
  Mexican wave tiap ~24 s, payung, Jalur Gemilang, **bumbung 7 daun putih** atas tiang + kabel, banner Faris
  "SEPANG BADDIE ♥" & "LABU LANJUT QUEEN") → **back straight** → ladang sawit → jalan keluar ke Labu Lanjut.
  Infield barat: pos marshal 9, helipad + helikopter perubatan; infield timur: kotak pengulas LIVE, menara masa (susunan
  sebenar dari simulasi), pos marshal 2. Hoarding iklan sepanjang trek (MALAS AIR, DUBUYO, NYOMNYOM CITY, BOLAT·CAM...).
- **Perlumbaan F1** (`race`): 9 kereta, 7 team rekaan (BOLAT GP, OMEY RACING, KEK MANGO F1, ALAMAK RACING, KENTOT
  BUSHUK, SAMBAL GEPUK, ANTI EMOK; MALAS RACING tak keluar garaj). Brek masuk selekoh ikut kelengkungan trek, beratur,
  **overtake** tukar lorong. **Pit stop** satu demi satu: kereta masuk pit lane, 7 krew (doodle bertopi keledar) lari
  keluar, jek angkat, "BRRRT" wheel gun, label "2.3s" atas kotak, kereta keluar. **Safety car** keluar tiap ~70–100 s:
  semua beratur belakang, bendera marshal jadi kuning, menara & skrin tulis SAFETY CAR. Trek basah: **semburan air**
  belakang setiap kereta, lampu hujan merah berkelip, bunyi **NEEEOOWW** (Doppler) bila lalu dekat Qish.
- **Cuaca:** mendung kelabu-ungu, **renyai** (garis hujan + riak titisan), **kilat** + guruh tiap 14–26 s, lampu stadium
  menyala. Lepas Raja Malas kalah: cerah keemasan + **pelangi**, tiada hujan.
- **Misi 6 pas paddock** (item baru `pass`, kunci `got:sepang:*`): masuk kali pertama → guruh + `SP_ARRIVE` (PA panggil
  "pemilik Myvi merah, tudung mauve", Raja Malas di podium, 6 pas ditinggalkan dengan 6 orang). Pas bercahaya depan
  setiap orang (tanda "!"): **Kak Tiket** (lukisan teruk Faris "TUDUNG MAUVE. COMEL. BAGI PAS."), **Abang Merch** (bantal
  MALAS RACING, "dia dah bayar"), **Ketua Krew MALAS** (di jalur pit, lalu garaj laluan), **Kak Usher** (banner, kerusi
  C-12), **Pakcik Marshal** (bendera putih), **Pengulas** ("k."). Cukup 6 → **Abang Bouncer** cabut tali baldu VIP →
  tangga → podium atas bumbung: Faris berdiri atas anak tangga P1 (trofi, champagne, payung pantai pink, zzz) → finale.
- Bumbung bangunan pit jadi **lutsinar** bila Qish di pit lane belakangnya, supaya dia tak hilang dari kamera.
- Papan besar pintu masuk juga pudar bila Qish dalam fan zone. Penonton grandstand bersorak (bunyi) bila Mexican wave
  lalu dan Qish dekat.
- Dialog baru semua **draf** (`SP_ARRIVE`, `PASS_TALK`, `spVipNotYet`/`SP_VIP_OPEN`, `spGarageLines`, `sepang:*` dalam
  `ZONE_TALK`, `COLLECT_TALK.sepang`). Speaker baru: Kak Tiket, Abang Merch, Ketua Krew MALAS RACING, Kak Usher, Pakcik
  Marshal, Pengulas, Abang Bouncer, Abang Baju Hujan, 📢 Pengumuman. Doodle baru: keledar krew pit, vest hi-vis, payung,
  bendera checkered, mic, baton.
- Diuji headless (1280×720): ketibaan + PA, kutip 6 pas dengan dialog, tali VIP halang → buka, naik tangga ke dek
  (tinggi 3.6) → dialog Raja Malas bermula, jambatan (tinggi 3.8, rel halang tepi), garaj laluan → jalur pit, lorong laju
  tak boleh dipijak, bumbung lutsinar. Tiada error. ~375–880 draw call sebingkai (zon lain ~700–1150). Belum diuji di GPU
  sebenar, phone, atau gamepad.

**Perlu dari Faris:** semak dialog draf (terutama lukisan "TUDUNG MAUVE. COMEL. BAGI PAS.", banner SEPANG BADDIE / LABU
LANJUT QUEEN, "k."); nama team rekaan okay? Ada kenangan sebenar korang di Sepang (tengok MotoGP/F1, makan kat mana)
nak diselitkan? Bunyi NEEEOOWW + guruh terlalu kuat untuk stream?

### Kad tajuk zon & dialog gaya VN (2026-10-25) ✅
- **Kad tajuk zon** (`game/src/ui/zoneTitle.ts`): setiap kali masuk zon baru, nama zon keluar besar di tengah skrin
  (huruf jatuh satu-satu, garis emas + ♥, bunyi arpeggio `sfx.place`). Nama "A · B" jadi tajuk A + subtajuk B (cth.
  "KLIA" / "Sepang"). Balik ke zon yang sama (lepas boss/rematch) tak tunjuk lagi. Dialog ketibaan tunggu kad habis.
  Bilik Qish ditunjuk masa bangun (intro & lepas Raja Malas).
- **Dialog gaya visual novel** (`game/src/ui/dialog.ts`): watak utama yang ada potret (Qish, Bowat, Raja Malas/Faris,
  Encik Sloth, Babah) berdiri besar di belakang kotak dialog — Qish di kiri, yang lain di kanan. Yang bercakap
  menyala (dan melompat sikit bila mula cakap), yang lain digelapkan. Narrator/NPC tanpa potret = semua gelap. Tag
  nama ikut sebelah penutur. Potret kecil lama dalam kotak dibuang.
- Diuji headless 1280×720, phone 390×844 & landscape 844×390 (3 watak muat).
- Bila NPC lain (Pakcik Kek, boss tanpa art) dapat art, cukup tambah `portrait` dalam `SPEAKERS` — terus naik pentas.

### Gaya B dipasang — Labu Lanjut dulu (2026-10-25)

- **Lapisan gaya global** (`game/src/overworld/style.ts`): palet `PAL` diambil dari anchor `art/style/style_B.png`, dan
  `toonify()` menukar semua bahan Lambert/Phong/Standard jadi `MeshToonMaterial` dengan ramp lembut dua jalur (bayang
  hangat-lilac). Ia jalan sekali selepas setiap zon dibina, jadi **semua zon** dapat shading baru tanpa ubah prop.
  Zon lain diuji (Bukit Bintang, Tasik Lily): tiada yang rosak, tapi prop di sana masih bersegi (pusingan seterusnya).
- **Model 3D jana pertama dalam game:** Myvi (`public/assets/models/myvi.glb`, TRELLIS.2, 0.44MB) melalui
  `overworld/models.ts`. Model dipreload sebelum zon pertama dan dipakai `myvi()`, jadi Myvi di **semua zon** dah
  bertukar. Atribut kuantisasi meshopt ditukar ke float masa preload (kalau tak, `mergeStatic` rosakkan bentuknya).
- **Prop Labu Lanjut dirombak:** rumah Qish (dinding krim atas plinth batu, bumbung genting plum, porch bergable
  atas dua tiang, tingkap berbingkai + shutter + kotak bunga, pintu kayu); pokok mangga & hujan-hujan jadi mahkota
  "awan" bulat; pisang, sawit, kelapa guna daun lengkung licin (`leafBlade`); semak, batas bunga, pasu, pagar kayu
  bulat, peti surat, bangku papan, rumah jiran atas tiang (bumbung genting biru/terracotta), wakaf; semua `BoxGeometry`
  dalam `labuProps.ts` jadi `roundedBox`. Rumput & tar dilembutkan ikut palet.
- Lantai porch baru ada `floor()` supaya Qish naik atasnya, dan tiang porch ada collider.
- Sebelum/selepas: `art/style/labu_before_after.png`.
- Dev sahaja: `window.__overworld` (untuk skrip screenshot teleport Qish).

### Pas 2 gaya: tekstur lukisan tangan + model 3D ComfyUI (2026-10-25)

Ikut rujukan Faris (`ref/style_ref_yono.webp`). Anchor rupa baru: `art/style/anchor_painted_00003.png`.
- **Kit tekstur** (`art/textures/`, Qwen T2I ±4s + `pipeline/tools/seamless.py`): rumput, tanah, papan kayu, batu
  bata, genting, plaster, tar, dedaun, air, tikar → `game/public/assets/textures/*.webp` (10–50KB). Plaster & tar
  dilukis prosedur (T2I asyik keluar sprite sheet untuk permukaan rata). Loader: `overworld/textures.ts`
  (`painted`, `paintedMat`, `paintedGround`).
- **12 model 3D Labu** (`art/props/labu` konsep T2I → `art/3d/labu` TRELLIS.2 → `public/assets/models`): rumah Qish
  (seed 7, 80k tri; seed asal berlubang), kedai runcit (papan tanda kosong + teks tajam dilukis game, sebab teks
  dalam model rosak), dua rumah atas tiang (pintu menghadap jalan), wakaf, pokok mangga, hujan-hujan, pisang, sawit,
  kelapa, semak, bangku. Builder lama kekal sebagai fallback kalau model gagal dimuat. Pokok/semak/bangku/kelapa/Myvi
  dikongsi zon lain, jadi zon tu pun dah guna model.
- Bayang lebih lembut (`sun.shadow.intensity` 0.65), grade saturasi 1.16 → 1.04 (tekstur dah bawa warna sendiri).
- Kemajuan: `art/style/labu_progress.png` (asal → gaya B pas 1 → sekarang).
- Belum: teres/tebing tanah bertingkat macam rujukan (ubah layout), pagar/peti surat/gerbang/tiang lampu masih buatan
  tangan, zon lain belum dapat tekstur & model sendiri, saiz muat turun naik ±10MB (perlu muat malas ikut zon untuk phone).

### Pas 3: "blend in" (2026-10-25)

Faris: GLB nampak lain lighting dan gelap; bentuk jelas tak blend (jalan, parking, rumput tajam).
- **Bahan model:** TRELLIS bawa normal map bising + peta metal/rough + bayang yang di-bake dalam tekstur. Di bawah
  toon ramp, model jadi gelap bertompok. `models.ts` kini buang semua tu, simpan warna sahaja (+ emissive 0.22 dari
  tekstur sendiri supaya bayang tak berganda).
- **Cahaya global lebih lembut:** ramp bayang 0.4 → 0.6, hemi 1.1 → 1.45, matahari 2.4 → 2.1, exposure 1.16.
- **Splat ground** (`overworld/splat.ts`): satu permukaan rumput yang campurkan tanah/tar/batu ikut topeng canvas
  bertepi bergerigi + pecahan ala sapuan cat dalam shader. Labu: laluan rumah, lapik Myvi, jalan & bahu berdebu,
  tompok rumput haus (separa), tebing sungai. Kepingan slab, rumput berjalur padang dan jalur bata tebing dibuang.
- **Rumput:** kon tajam diganti rumpun silang bertekstur lukisan (`art/sprites` → `textures/tuft.webp`,
  `flowers.webp`); `meadow()` dikongsi, jadi semua zon yang guna meadow dapat.
- Perbandingan: `art/style/labu_blend_before_after.png`.
- Masih buatan tangan & keras: pagar, gerbang kampung, tiang lampu/elektrik, papan tanda, kotak bunga, kucing/ayam.

### Pas 4: prop baki, susun atur & haiwan (2026-10-25)

- **8 model lagi (ComfyUI → TRELLIS.2):** gerbang kampung, pagar (ruas 2.6 m disusun), batas bunga (diregang ikut
  saiz), tiang lampu, tiang elektrik (dinipiskan 0.55), papan tanda, peti surat, pasu bunga. Teks gerbang & papan
  tanda dilukis game atas papan kosong model; kedudukan muka papan dicari dengan raycast (`frontZ` dalam `models.ts`).
  Papan tanda, tiang lampu & batas bunga dikongsi zon lain.
- **Rumah Qish:** pintu model 1.85 m kanan dari tengah; rumah dianjak supaya pintu tepat atas laluan (`HOUSE_DOOR_X`).
  Pasu, batas bunga & semak disusun semula ikut muka rumah baru.
- **Bangku:** bangku halaman dibuang; dua bangku padang kini menghadap satu sama lain merentasi padang (x −29.6 &
  −11.2, z −2.4). `bench()` kini terima `rotY`.
- **Haiwan** (kucing, ayam, itik, burung, rama-rama): kekal buatan tangan sebab beranimasi, tapi sfera/kon/silinder
  dinaikkan ke 14–18 segmen dan kotak kecil jadi `roundedBox`.
- **Cookies:** semakan automatik (headless, setiap zon) cari pickup yang tak boleh dicapai: semua zon OK kecuali
  lily Tasik Lily (sengaja, dikutip dari sampan). Cookie Labu di (−9.2, 15.0) terselit dalam collider rumah atas tiang
  baru → dialih ke (−7.2, 13.6).

### Pas 5: audit penuh Labu Lanjut (2026-10-25)

Audit 4×4 screenshot seluruh zon + skrip automatik (pertindihan model, prop atas jalan, laluan berjalan, cookie).
- **Rumah Qish:** collider kini ikut model sebenar (dinding z −12.9..−3.0, tiang porch, lantai porch & tangga boleh
  dipijak). Dulu satu kotak besar membiarkan Qish tembus ke porch dan menghalang ruang kosong.
- **Pudar automatik** (`overworld.updateFade`): rumah, kedai, rumah atas tiang, wakaf, gerbang & pokok jadi lut sinar
  (30%) bila menghalang Qish dari kamera; kad teks memudar bersama. Prop pudar tidak di-bake (`merge.ts`).
- **Pertindihan:** dua kelapa tumbuh dalam bumbung rumah (dialih ke belakang), pisang belakang rumah dijarakkan,
  mangga dialih dari atas lapik Myvi, sawit di tengah jalan Sepang dibuang, collider kedai lama (ruang depan kosong)
  diganti kotak ikut model.
- **Gerbang Litar Sepang & Bukit Bintang dibuang** (keputusan Faris: biar Qish jumpa sendiri). Pintu keluar & semakan
  progres kekal. Tiang elektrik terakhir (tembus gerbang kampung) dibuang.
- **6 model lagi:** jambatan melengkung (Qish naik ikut lengkung, `STREAM_BRIDGE`), motor kapcai, buaian, tiang lanjung
  (menyala masa parti), penghadang "DITUTUP", ampaian (baju kekal beranimasi).
- **Sungai:** tepi air beralun & pudar ke tebing pasir yang lebih lebar, dengan jalur buih putih.
- **Kucing:** corak (calico, tabby, tuxedo, siamese) kini tekstur dilukis atas badan/kepala, bukan mesh bertindih.
- **Ayam:** direka semula: badan titisan, rump, 3 bulu ekor bulat, sayap, balung 3 bonjol (kon ekor lama nampak lubang).
- Semua zon disemak selepas perubahan kongsi: tiada ralat, cookie boleh dicapai.
- Masih buatan tangan (sengaja, beranimasi): kucing, ayam, itik, burung, rama-rama, baju di ampaian.

### Pas 6: kemasan akhir Labu + panduan untuk agent lain (2026-10-26)

- **Bug tersekat di "DITUTUP":** Qish boleh lalu atas rumput keliling penghadang ke pintu keluar barat; bila pintu
  menolak, titik pulang (−16.8, 17.5) jatuh dalam collider penghadang → tersekat. Penghadang kini di celah ladang
  sawit (x −19.6) supaya tak boleh dikelilingi, titik pulang dialih, dan `runExit` kini cari tempat kosong terdekat
  kalau titik pulang terhalang.
- Lampu depan gerbang dibuang; kotak tanaman depan rumah dibuang; sisi porch & hujung tangga kini pepejal (porch
  hanya dinaiki ikut tangga); baju ampaian digantung ikut lengkung tali (raycast); rumput keluar dari buaian;
  kucing atas Myvi kini kot belang bertekstur; burung dibentuk semula (badan bulat, kepala, paruh, sayap bulat).
- **Panduan:** `docs/ZONE_ART_GUIDE.md` (konsep, peta kod, workflow 10 langkah, gotcha, definisi siap), skill projek
  `.claude/skills/zone-art`, `AGENTS.md` + `CLAUDE.md`. Alat audit dipindah ke `pipeline/audit/` (`shots.mjs`,
  `check.mjs`, `front_view.mjs`); `pipeline/tools/prop_concepts.py` & `texture_kit.py` kini boleh guna semula
  ikut zon.

### Bilik Qish: pas seni selepas Labu Lanjut (2026-10-26)

- Diorama bilik dipadankan dengan Labu: lantai papan dan trim bertekstur lukisan, kertas dinding pastel dengan
  corak cat lembut, pintu bertepi bulat, permaidani tenunan bercorak lily. Lima prop utama dijana dengan
  ComfyUI/TRELLIS.2: katil (lekuk kosong Bowat pada bantal biru), meja melukis + phone, almari, konsol dua
  controller, dan pokok pasu. Doodle asal Qish tentang mereka berdua dibingkaikan di atas katil.
- Papan gabus masih memaparkan **10 slot kosong** ketika mula; selepas kad Bolat ex ia memaparkan kesemua 10 strip
  sebenar. Konsol mengekalkan tulisan `PLAYER 2?` / `MAIN SEMULA` dalam game supaya jelas walau model TV berubah.
- Waktu pagi dan bangun semula kini ada langit tingkap dan cahaya berbeza (pagi biru, petang jingga-ungu), tanpa
  mengubah tutorial tiga petunjuk, pintu atau replay. Model dipasang dengan fallback sedia ada dalam `bedroom.ts`.
- Semakan: build TypeScript/Vite lulus; screenshot pagi dan petang disemak; `check.mjs` tiada ralat, pickup tak
  boleh dicapai atau model bertindih. Collider almari dan konsol diukur semula ikut footprint model.
  Perbandingan: `art/style/bilik_before_after.png`; keadaan petang: `art/style/bilik_evening.png`.

### Semakan Faris: bilik mesti pink putih dan tersusun (2026-10-26)

- Faris nampak **tingkap dan papan strip bertindih, TV senget**, dan palet katil/lantai/pintu belum kena.
  Papan dikecilkan dan dialih ke kanan dengan jurang jelas dari langsir; TV dipindah ke dinding belakang
  supaya skrin tegak menghadap bilik, meja melukis ke dinding kanan. Collider dan titik interaksi ikut
  susun atur baru.
- **Katil baharu** dijana semula daripada konsep `art/props/bilik/bilik_bed_00003.png`: rangka putih,
  selimut dan bantal merah jambu lembut, lekuk Bowat **kosong** pada bantal kanan. Konsep sebelumnya
  yang berwarna biru/merah dibuang daripada game.
- Lantai kini papan putih dengan garis sambungan merah jambu lembut (`bilik_floor` daripada Qwen T2I),
  pintu dan trim menggunakan tekstur kayu putih bercat (`bilik_wood`), dinding lebih putih dengan corak
  bunga pink, papan pinboard pink. Aksen permaidani lily dan foto asal Qish dikekalkan.
- Screenshot sebelum/selepas pembetulan: `art/style/bilik_pink_white_before_after.png`.

### Pembetulan bilik: tilam pink sekata, langsir 3D, tikar besar (2026-10-26)

- **Arahan Faris:** kain tilam/cadar mesti pink sekata, bukan dua warna atau jalur selimut lain;
  jana katil 3D semula, jana langsir, besarkan tikar, dan kembalikan TV ke sebelah pintu.
- Katil dijana semula daripada `bilik_bed_00004.png`; semua kain dan kedua-dua bantal satu pink,
  rangka putih. `pink_bedding.py` membetulkan albedo coral keluaran TRELLIS kepada pink sambil
  mengekalkan detail kain. Fail runtime baharu `bilik_bed_solidpink.glb` mengelakkan cache katil lama.
- Langsir ialah dua salinan model `bilik_curtain.glb`, dengan lipatan dan gelung 3D. Tingkap dianjak
  sedikit supaya langsir tidak masuk ke katil; papan strip dijarakkan daripada langsir.
- Tikar dibesarkan daripada 3.8 × 2.7 kepada 6.6 × 4.4. TV kembali di dinding kanan sebelah pintu,
  selari dengan dinding; spawn replay dan collider turut dipindahkan.
- Paparan akhir: `art/style/bilik_solidpink_final.png`.

### Bilik lebih padat, meja dan pintu pink penuh (2026-10-26)

- Arahan Faris: jana meja pink dan rapatkan ke dinding atas, buang frame atas katil, pindah tingkap + langsir ke kiri katil, TV ke ruang bawah, karpet bulat, kecilkan bahagian kanan bilik, jana pintu pink penuh.
- Dinding kanan ditarik dari x=7 ke x=5 (lebar 14 → 12). Lantai, dinding belakang, trim, batas berjalan dan spawn pintu/konsol diselaraskan.
- Meja/kerusi/lampu pink baharu di (3.3, -3.45), papan gambar di (-0.65, -4.45). Tingkap dan dua langsir 3D dipasang bersama pada dinding kiri, sebelah katil. Frame doodle atas katil dibuang.
- TV di sudut kanan bawah (4.45, 3.35); karpet berdiameter sama 5.2 × 5.2, menggantikan bulatan yang diregangkan pada permukaan 6.6 × 4.4.
- Meja dan pintu dijana Qwen → TRELLIS.2 menggunakan seed 91; pintu termasuk panel, bingkai dan tombol semuanya pink.
- Semakan laluan juga menemui spawn lama 0.02 m di dalam jarak pelanggaran katil; spawn mula dialih ke (-2.4, -1.2). Kamera boleh ikut ke kanan secukupnya supaya prompt phone tidak terpotong pada skrin phone portrait.
- Validasi: build TypeScript/Vite lulus; audit 8 model tiada pertindihan/error; semua 5 interaksi boleh dicapai dan ketiga-tiga spawn bebas halangan. Semakan visual desktop, phone portrait dan bilik petang selesai. Gambar: `art/style/bilik_compact_pink.png`, perbandingan `art/style/bilik_compact_before_after.png`.

### Pas watak Qish: sprite berjalan + potret dialog (2026-10-26)

- Faris pilih turnaround doodle Qish berwarna selepas dua pembetulan: **doodle tidak bertudung**;
  kolar kecil hanya bawah dagu, lengan halus tanpa lengan baju, badan sangat kecil berbanding kepala.
  Rujukan tepat: `ref/ni kitorang.jpeg`; konsep akhir: `art/concepts/qish_turnaround_concept_v3.png`.
- Overworld: 4 bingkai berjalan × 3 arah (depan, belakang, sisi; sisi kiri di-flip), warna rambut
  coklat, baju pink, kulit peach. Sumber di `art/chars/qish/`; `export_game_assets.py` memotong
  bingkai serta mengekalkan nama aset idle lama untuk cutscene dan standee.
- Dialog: potret Qish HD anime dengan tudung mauve seperti konsep yang Faris suka. Ada ekspresi
  normal dan `excited` bermata besar; beberapa baris gembira dipilih secara eksplisit melalui
  `Line.expression`, bukan semua ayat bertanda seru.
- Animasi berjalan disambung pada `PaperSprite` secara generik supaya watak lain boleh mendapat
  bingkai berjalan kemudian. Potret ekspresi boleh ditambah pada `SPEAKERS` bagi watak lain.
- Validasi: eksport aset berjaya; `npm run build` lulus. Semakan headless desktop (1280×720)
  dan phone portrait (390×844) menunjukkan sprite dan potret muat; 4 bingkai berjalan bertukar
  ketika gerak dan kembali idle selepas berhenti; potret bertukar `excited` → normal tanpa ralat.

### Pembetulan Qish: idle berdiri, kelip mata, bug jalan kiri (2026-10-26)

- Maklum balas Faris: idle nampak macam tengah jalan, rambut nampak terpotong di atas, ada bug bila
  tahan kiri, muka sprite terlalu statik. (Sambungan sesi Codex yang kehabisan token.)
- Idle baharu dijana dengan **ComfyUI img2img** (`qwen_gen.py --image`, Qwen edit turbo, seed 7)
  daripada bingkai jalan sendiri: berdiri tegak, kaki rapat, tangan ke sisi, garis rambut atas
  bersambung. Sumber: `art/chars/qish/idle_{front,side,back}.png` (+ `_blink`, `_laugh` untuk depan
  dan sisi); input/prompt di `art/chars/qish/work/`. Semua variasi muka sejajar piksel.
- Muka hidup (`PaperSprite`, set `IDLE_FACES`): bila berhenti, mata bulat + senyum kecil; kelip
  setiap 2–4.5 s (25% kelip dua kali), sesekali ketawa ^^ selama ±1.4 s. Semasa berjalan kekal muka ^^.
- Bug kiri: setiap tukar bingkai jalan, `applyTexture()` set semula lebar tanpa tanda cermin, jadi
  Qish terbalik sekejap ke kanan. Kini lebar (cermin + squeeze pusing) diset sekali di hujung `update()`.
- Validasi: build lulus; semakan headless dalam bilik: idle berdiri, kelip tertangkap, 6 bingkai
  jalan kiri semuanya menghadap kiri.
- Susulan: Faris masih nampak "secebis terpotong" pada rambut masa jalan ke depan. Puncanya takuk kecil
  pada garis atas rambut di **semua 12 bingkai jalan** (warisan patahan garis doodle asal). Setiap bingkai
  dibaiki dengan ComfyUI img2img (`work/p_hair.txt`, seed 7; depan #3 seed 11) dan disimpan sebagai
  `art/chars/qish/walk_{front,side,back}_{0-3}.png`. Tocang kanan bingkai belakang #1 yang terpotong
  oleh sheet asal dilengkapkan (`work/p_pig.txt`). Eksport kini guna bingkai ini (latar putih → alpha,
  buang coretan bingkai jiran); `seal_hair_gap` lama dibuang. Disemak dalam game semasa jalan ke bawah.
- Susulan 2: jalan kiri/kanan, satu tangan asyik terangkat. Empat bingkai sisi dijana semula (ComfyUI img2img)
  dengan hayunan tangan: #1 tangan ke depan (`work/p_arm_fwd.txt`, s7), #2 dan #4 tangan turun
  (`p_arm_down.txt`, s7), #3 tangan ke belakang (`p_arm_back2.txt`, s23). Pratonton `art/chars/qish/preview_side_walk.gif`.

### Ekspresi dialog Qish (2026-10-26)

- 13 ekspresi baharu untuk potret dialog HD, dijana ComfyUI img2img daripada `portrait_normal.png`
  (prompt di `art/chars/qish/work/expr/`, seed 7; happy & laugh seed 11). Jumlah 15 dengan normal + excited:
  `excited happy laugh shy love smug surprised thinking worried sad cry pout angry sleepy`.
  Lembaran: `art/chars/qish/preview_expressions.jpg`.
- Guna dalam skrip dialog: `{ who: "qish", text: "...", expression: "pout" }`. Senarai + maksud setiap
  muka ada pada `EXPRESSIONS` dalam `game/src/ui/dialog.ts`; dialog hanya pramuat muka yang dipakai.
- Disusun ikut situasi (2026-10-26): 312 daripada 317 baris Qish dalam `content/script.ts` dan 3 dalam
  `content/ending.ts` kini ada `expression`. Sengaja kekal normal: 5 baris neutral/arahan, dan soalan pilihan
  (`ask`) dalam `main.ts`. Faris boleh tukar mana-mana muka terus dalam fail skrip.
  Disemak dalam game: potret bertukar ikut baris (surprised → sad → angry → sad → cry → pout → thinking).

### Pas watak Encik Sloth: sprite doodle licin + potret anime (2026-10-26)

- Keputusan Faris: **komposisi & rupa kekal sama macam doodle**, cuma gaya seni berubah. Garis bengkang-bengkok
  doodle hanya rujukan, jadi garis akhir mesti licin. Konsep pertama (badan/pose baru) dan pas "painted" ditolak.
- **Overworld = B (doodle garis licin)**, warna rata. Badan biru membalut belakang kepala macam hud, jadi pandangan
  sisi/belakang ada biru di belakang kepala. Garis atas kepala dibaiki jadi satu lengkung. Pandangan sisi kini
  **3/4 ikut sloth biru dalam doodle Qish** (`ref/bowat - yg kelabu tu dia.jpeg`), muka nampak sikit.
- **Idle hidup:** kelip biasa; sesekali **tersengguk** (mata layu → mata tutup + buih hingus, badan jatuh perlahan →
  tersedar dengan lonjakan kecil); sesekali **menguap**. Rutin di `IDLE` dalam `game/src/overworld/paper.ts`
  (umum, Qish guna rutin gelak yang sama).
- **Dialog = A (anime garis nipis + cel shading)**, badan penuh komposisi sama. 10 ekspresi (`SLOTH_EXPRESSIONS`
  dalam `ui/dialog.ts`): `normal happy laugh sleepy smug surprised worried deadpan wink love`. Semua 10 baris
  Encik Sloth bertanda ekspresi (cth. "Faris? Tak nampak pulak." = smug sebab dia dalam komplot; "...Bowat." = deadpan).
- Aset: `art/chars/slothfaris/` (README ada seed & prompt), eksport `pipeline/tools/export_game_assets.py`
  (`key_white(neutral=True)` supaya muka krim pucat tak tembus). Pratonton: `preview_concepts_v3.jpg`,
  `preview_idle_doodle.gif`.

### Padang parti Labu Lanjut: kemas & meja 3D (2026-10-26)

- Permintaan Faris: **Babah dibuang** dari parti (standee, collider, "Cakap"); dialog `BABAH.party` masih dipakai di KLIA
  selepas ending. **Kad boss berdiri dibuang** (6 standee kiri kanan). **Belon "random"** antara bangku kanan dan
  rumah dibuang. **Dua belon atas tiang lantera** kini diikat ke tanah sebelah tiang (ada pemberat pink kecil).
- **Meja kek & meja makanan kini model 3D** (`prop_concepts.py --zone labu caketable foodtable clothtable`):
  `foodtable` (alas hijau, daging salai, malatang, Dubuyo, air), dan kek mangga 2 tingkat (`cake`) atas
  `clothtable` (alas pink). TRELLIS buang meja dari konsep kek, jadi kek & meja dijana berasingan. Collider ikut
  kotak model.
- **Tikar:** soalan Faris "kedut, 3D atau texture blend?" → pilih **kedut + tekstur anyaman + tepi lembut**, bukan
  model 3D (TRELLIS lemah untuk benda nipis rata, dan watak duduk atasnya). `tikar()` kini mesh berkedut
  (lipatan lembut, bucu terangkat sikit) bertekstur `thatch`, lorek kedut dicat dalam vertex colour, bingkai
  gelap di tepi, dan alpha beralun supaya masuk dalam rumput. Tikar Snorlax (Tasik Lily) dan Putrajaya ikut sama.
  `mergeStatic` kini simpan vertex colour.
- Audit: `shots.mjs` / `check.mjs` terima `--save '<json>'` untuk buka zon dalam keadaan parti
  (`{"cards":[1,2,3,4,5,6,7,8],"flags":{"introSeen":true,"endingSeen":true}}`). `check.mjs`: tiada ralat,
  satu "overlap" (kek atas mejanya, sengaja). Sebelum/selepas: `art/style/labu_party_before_after.png`.

### Pas watak Bowat: sprite doodle licin, jalan, pose babak + potret anime (2026-10-26)

- Ikut cara Encik Sloth: **overworld = B (doodle garis licin)**, **dialog = A (anime cel shading)**, komposisi dari
  turnaround + doodle Qish (`ref/bowat - yg kelabu tu dia.jpeg`). Faris luluskan konsep (`art/chars/bowat/preview_concepts.jpg`).
- Maklum balas Faris: pandangan sisi dari doodle "macam tak berdiri" (doodle Bowat duduk, kaki ke depan). Sisi 3/4 kini
  berdiri tegak, muka masih ikut doodle Qish.
- **Jalan sebiji macam Qish:** 4 bingkai × depan/sisi/belakang (terkedek-kedek). Bingkai belakang dibuat dengan padam muka
  dari bingkai depan (model asyik pusing Bowat ke sisi bila diminta "dari belakang").
- **Idle:** kelip; sesekali menguap; sesekali **kentut senyap** (mata picit + awan hijau kecil): "aku kentut senyap je".
  Juga muka `sniff` (hidu) untuk ketibaan Nyomnyom.
- **Pose babak** (`PaperSprite.hold()` baharu, umum untuk watak lain):
  - Bukit Bintang (boss): setiap kali pusing belakang → `fart_back` (punggung keluar, jeling, awan "PROT!").
  - Nyomnyom: hidu masa tiba; **duduk makan cookie** (kunyah ↔ gigit) di setiap kedai dan meja 8 (bukan lagi sprite
    berdiri yang diangkat).
  - Tasik Lily: dalam sampan **baring tidur** (Zzz, buih hingus), ikut skrip "*terus baring dalam sampan*".
  - Lepas Mega Bowat: **baring penat, perut ke atas** semasa dialog "...aku dah kecik balik".
  - Minigame pantai: jalan 4 bingkai, pose kentut bila lepas awan, muka sakit bila dipijak, mata pusing bila kalah.
- **Dialog:** 12 ekspresi (`BOWAT_EXPRESSIONS` dalam `ui/dialog.ts`): `normal sleepy nyom sniff innocent relief guilty
  happy love defeated surprised smug`. Semua 20 baris Bowat bertanda ikut cerita (cth. "...Bukan aku." = innocent,
  "0% bukti." = smug, "*PROT*" = relief, "aku lagi sayang kau" = love, "Aku tak boleh cakap" = guilty).
- Aset & prompt: `art/chars/bowat/README.md`. Eksport `export_game_assets.py` (`export_bowat`, penapis `flatten` untuk
  bintik seed ComfyUI). Pratonton: `art/chars/bowat/preview_sheet.jpg`, `preview_walk.gif`.
- Diuji headless: ikut Qish & jalan 3 arah, idle, 12 potret dalam dialog, Bukit Bintang, duduk makan di Nyomnyom,
  sampan, pose baring, minigame pantai. `tsc` + `vite build` lulus. `dist/` belum dibina semula (tunnel masih versi lama).
- Belum: **Mega Bowat** belum ada art sendiri (flappy dan dialog masih guna gambar Bowat).

### Semakan animasi Bowat (2026-10-26)

- Faris minta jana semula semua arah jalan Bowat kerana gerak lama kurang jelas, bersama pose `fart_back`,
  `lie_sleep` dan potret `sniff`.
- 12 bingkai jalan dijana semula daripada idle yang diluluskan, dengan kaki menapak/terangkat serta hayunan tangan
  yang lebih nyata. Sisi bingkai 2/3 diedit sekali lagi untuk bezakan langkah; bingkai belakang dibersihkan supaya
  tiada mata terselit pada hud belakang.
- `fart_back` kini menunjukkan punggung dari belakang dengan awan PROT; `lie_sleep` baring dengan kedua-dua mata
  tertutup; `sniff` menunjukkan hidung dan wap aroma tanpa air liur. Sumber ada di `art/chars/bowat/`, prompt dan
  calon di `art/chars/bowat/work/`, salinan lama di `work/v1_backup/`.
- Eksport dan pratonton: `art/chars/bowat/work/install_v2.py`, `preview_sheet_v2.jpg`, `preview_walk_v2.gif`.

### Pas seni penuh Bukit Bintang (2026-10-26) ✅

- Susun atur simpang-X v2, MRT, monorel, trafik, orang ramai, skrin hidup dan misi awan kentut dikekalkan;
  rupa blok lama diganti dengan set **14 model 3D bercat**: menara skrin, dua deret kedai, pintu MRT,
  stesen + tren monorel, bas, dua kereta, teksi, kiosk burger, gerai shawarma, pokok pasu dan lampu banner.
- Tanah kini satu `splatGround` besar berasas tekstur `bb_pavers`: jalan tar simpang-X dicat dengan topeng
  poligon mengikut putaran asal, sementara zebra crossing, garisan jalan dan yellow box kekal decal tajam.
  Baki geometri prosedur menggunakan bucu bulat dan bahan bercat; model besar ikut sistem fade kamera.
- Teks penting kekal dibuat dalam game (nama stesen, papan kedai, banner dan skrin), bukan dibakar ke model,
  supaya sentiasa jelas. Model trafik baharu masih memakai pergerakan, lampu hazard dan collider lama.
- Audit desktop 4×4 dan telefon 390×844 lulus tanpa ralat halaman. `check.mjs`: **tiada pickup tak boleh
  dicapai, tiada model bertindih**, kedua-dua exit boleh dicapai. `tsc` + production build Vite lulus.
- Bukti visual: `art/style/bukit_bintang_before_after.png`, `art/style/bukit_bintang_final_audit.png`
  dan `art/style/bukit_bintang_phone.png`. Konsep, GLB dan prompt direkod dalam `pipeline/README.md`.

### Pas UI scrapbook, finale & halaman ending (2026-10-26)

- Arahan Faris: game masih terlalu prototaip; cantikkan ikut tema, cuba ComfyUI dahulu dan
  kenal pasti baki HUD/UI/visual yang perlukan pas seni.
- **Tema UI bersama** (`game/src/ui/theme.css`): kertas krim, pink susu, lilac, bayang lembut,
  tab nama, pita foto dan kad koleksi. Tajuk, menu sambung/main baru, HUD lokasi/kad/misi,
  senaman, prompt, dialog/pilihan, touch, intro boss, card reveal dan halaman ending diselaraskan.
- **Tajuk baru:** pulau kampung bercat dengan rumah pink, Myvi merah, sungai/jambatan, photo
  strip sebenar dan Bowat. Copy kini tentang mencari Faris; birthday tidak didedahkan awal.
- HUD menunjukkan thumbnail kad sebenar mengikut urutan boss `[5,3,7,1,2,6,4,8]`, slot kosong
  bernombor dan bar kemajuan misi. Art kad terkunci/evolusi tidak dibocorkan dalam intro boss.
- **ComfyUI Qwen Turbo**, seed 88: ilustrasi tajuk, arena Sepang kosong, poskad lasagna Cosy
  Place dan singa Sunway. Prompt + PNG sumber di `art/ui/`; empat WebP runtime berjumlah kurang
  0.5 MB. Tiada fallback Imagegen diperlukan. Poskad jelas dilabel sebagai ilustrasi.
- **Finale:** background Sepang bercat, bayang sentuhan watak, panel HP kertas, pilihan move
  bulat dengan sumber kad + DMG/HP. Hujan/tint cuaca kekal beranimasi. Bug A penutup dialog
  terus memilih move dibetulkan: menu menunggu frame baharu dan butang dilepaskan.
- **Ending:** scrapbook Kisah Kita; dua kotak foto kosong diganti poskad. Surat mempunyai
  butang sambung sendiri, scroll keyboard/gamepad dan kertas yang boleh disentuh tanpa terus
  menutup halaman. Arahan fail kod dibuang dari teks surat dalam game. Babah tidak lagi disebut
  dalam dialog parti, sepadan dengan keputusan parti 2026-10-26.
- **Surat sebenar masih placeholder** dan kad ke-9 masih reka HTML/doodle sementara.
  Faris/Mega Qish/Mega Bowat, visual canvas minigame, enam zon baki, mimpi sofa, kek interaktif,
  album kad dan audio ialah kerja seni seterusnya. Audit terperinci dengan keutamaan dan fail:
  `docs/UI_ART_AUDIT.md`.
- Bukti visual di `art/style/ui/`; skrip boleh diulang: `pipeline/audit/ui.mjs` dan
  `pipeline/audit/story-ui.mjs`. Keputusan disimpan dalam JSON selepas setiap audit lulus.
- **Validasi akhir:** TypeScript + build production lulus; 27 semakan UI pada desktop,
  phone portrait dan landscape lulus. Finale dimainkan dengan input sebenar sampai kad #8.
  Ending ketiga-tiga saiz lulus: 9 memori, surat panjang boleh ditatal, kad #9 dan Tamat;
  tujuh minigame lain dimuat untuk inventori visual. Tiada ralat browser/aset. Production
  port 5180 disemak berasingan. Gamepad fizikal, mikrofon sebenar dan fps phone belum diuji.

### Pas watak Faris & Babah: doodle berwarna + potret anime (2026-10-26) ✅

- **Pilihan Faris:** rambut sprite Faris kekal panjang macam doodle Qish, walaupun foto baharu
  berambut pendek. Kepala besar senget, badan kecil, baju teal dan seluar pendek navy dikekalkan.
  Potret anime menggunakan wajah/rambut pendek kerinting dan baju putih jalur halus `ref/faris.jpeg`.
- **Babah:** sprite dan potret daripada `ref/babah.jpeg`: rambut belah tepi, misai/janggut halus,
  uniform engineer putih trim merah, lanyard ID, seluar hitam. Placeholder canvas diganti `b.npc("babah", ...)`
  di KLIA; interaksi dan misi tools kekal. Babah tidak ditambah semula ke parti.
- Kedua-duanya ada 3 pandangan (sisi kanan dicermin untuk kiri), kelip mata dan sesekali senyum.
  NPC berdiri di lokasi babak, jadi belum memerlukan bingkai jalan. Faris di mimpi/parti/podium
  memakai sumber doodle baharu melalui nama aset sedia ada.
- **Dialog:** Faris 10 potret (`normal happy smug surprised deadpan sleepy shy sorry love defeated`),
  Babah 7 (`normal happy surprised guilty thinking deadpan love`). Ekspresi dipilih setiap baris dalam
  `content/script.ts` dan `content/ending.ts`; Faris biasa/Raja Malas berkongsi satu figura pentas.
  Pilihan eksplisit Faris: potret anime + sprite doodle untuk kedua-duanya walaupun pas UI retro berjalan selari.
- **Pipeline:** ComfyUI Qwen Edit Turbo tempatan; prompt/seed/calon di `art/chars/<nama>/work/`,
  generator `pipeline/tools/human_characters.py`. Rujukan input menggunakan hash supaya nama
  `portrait_normal.png` antara watak tidak bertindih dalam queue. Eksport membersihkan grain latar,
  mengekalkan baju putih, menyelaraskan bingkai idle dan crop potret dada ke atas. Framing telefon dibetulkan
  supaya potret tidak terkeluar di tepi kanan.
- Pratonton: `art/chars/faris/preview_concepts.jpg`, `preview_expressions.jpg`, `preview_idle.gif`
  dan set yang sama dalam `art/chars/babah/`. README setiap watak menerangkan cara jana/eksport semula.
- **Validasi:** TypeScript + production build lulus. Audit `pipeline/audit/human-characters.mjs`
  lulus desktop 1280×720, phone 390×844 dan landscape 844×390: 17 potret, sampling licin,
  crop muat, alias Faris tunggal, NPC KLIA/parti, pertukaran kelip/senyum, tiada ralat browser/aset.
  Kesemua 31 aset pada production port 5180 disahkan sepadan dengan hasil eksport.
  Bukti screenshot dan laporan: `art/chars/human-audit/`.

### Katalog QC semua UI & HUD (2026-10-26)

- Permintaan Faris: tunjukkan UI, HUD dan panel lain untuk QC. Katalog baharu
  `docs/UI_QC.md`: 82 screenshot semasa, 8 contact sheet, pautan gambar saiz penuh dan
  ruang catatan mengikut ID. Bukti dalam `art/ui-qc/`.
- Meliputi title/menu/reset, lokasi/kad/quest, workout/rep, dialog/pilihan, phone pagi/petang,
  Myvi, replay, nama zon, dev panel, card reveal biasa/rakaman, mimpi, intro + semua 8
  minigame, bantuan skip dan ending penuh. UI dan ending turut ditangkap phone portrait.
- Gaya semasa direkod: HUD/menu/minigame retro, dialog krim/pink + potret anime, dunia 3D
  bercat. Surat/kad ke-9 ditanda draf; album kad/photobooth interaktif belum ada.
- Skrip: `pipeline/audit/ui-qc.mjs` dan `ui-qc-catalog.py`. Preview memakai komponen sebenar
  dengan save browser berasingan; nilai misi/workout dan kiraan gagal tertentu disimulasi.
  Tiada seni/gameplay diubah. Tangkapan tanpa ralat browser/aset; QC visual menunggu Faris.

### The Adventure of Qish — ilustrasi timbul & HUD kertas pink (2026-10-26)

- Faris **tak mahu retro lagi**. Nama rasmi baharu **The Adventure of Qish**; Pokélove
  kekal nama koleksi kad dan pulau. Rujukan pertama untuk komposisi logo/menu, kedua untuk
  ilustrasi beroutline, shading dan rasa kedalaman. Tema biru gelap diganti pink/krim.
- **Logo alpha** dan **scenery kampung waktu subuh pink** dijana built-in image_gen.
  Sumber/prompt penuh: `art/ui/paper/`; runtime `qish-logo.webp`, `qish-title.webp`.
  Logo besar di tengah, menu di bawah, Qish dan Bowat doodle di bucu scenery.
- **Kertas berlapis:** tepi pink, lipatan, grain, pita washi, highlight dan bayang untuk
  HUD lokasi/kad/quest, senaman, dialog, pilihan, intro boss, reveal, phone, surat dan ending.
  HUD memaparkan kad sebenar semula. Bar berat disusun dua baris supaya muat pada phone.
- **Minigame licin:** kit ComfyUI Qwen Turbo seed 733, 99 fail runtime (13 watak × 4 pose
  + sheet, 26 ikon, 8 latar). Bingkai 256px, latar 1600×900. Kod `minigames/storybook.ts`
  menggantikan lapisan retro; Phaser memakai antialias/linear. Runner dirender 4× resolusi,
  tanda dan panel kertas. Latar/map 3D overworld tidak dirombak dalam pas UI ini.
- Doodle berjalan Qish/Bowat dan potret HD sedia ada dikekalkan. Saiz visual/hitbox awan
  Bowat dikekalkan selepas pertukaran resolusi. Tween VFX dan evolusi disesuaikan untuk
  sprite besar; prompt terapung mengekalkan anchor dunia semasa animasi.
- **QC semasa:** `docs/UI_QC.md` → `art/ui-paper-qc/` (82 screenshot, 8 contact sheet,
  desktop + phone). Snapshot retro lama kekal `art/ui-qc/` sebagai rekod.
- **Validasi:** TypeScript/build lulus; semakan UI desktop/portrait/landscape lulus;
  8 scene minigame + rematch dan input sampel lulus; finale dimainkan dengan input sebenar
  sampai Mega Evolve/Hot Giler/kad #8. Ending lengkap ditangkap desktop dan phone.
  Kesemua 99 aset boleh didekod, 24 hash sprite berjalan asal tidak berubah.
  Production 5180 disemak desktop/phone, logo/kad/HUD dimuat tanpa permintaan aset retro.
- Surat dan kad ke-9 masih draf. Gamepad fizikal, mikrofon dan fps peranti sebenar belum
  diuji dalam pas ini. Bukti mesin: `art/storybook/qa/`, `art/ui/paper/production-verification.json`.

### BGM cover 8-bit Faris dipasang (2026-10-26)

- Faris sudah menyediakan lima MP3 cover 8-bit dalam `music/`; tiada penjanaan semula.
  Title dan empat boss menggunakan hook *Gimme Love* (24.304s); tiga boss lain
  *SANCTUARY* (22.857s), bergilir tanpa mengira rhythm. Finale kekal *Gimme Love*.
- Overworld *From The Start* main penuh 158.453s, tamat → loop dari mula; tukar zon
  mengekalkan kedudukan lagu. Muzik busker/piano sementara disenyapkan supaya tidak bertindih.
- Rhythm *Lover Girl*: chorus 23.273s × 2, pusingan 46.545s, empat beat count-in,
  grid half-time 82.5 BPM dan chart 50 nota. Audio dan penghakiman berkongsi jam AudioContext;
  retry mula semula, skip/menang menghentikan audio. Fallback sintetik hanya jika decode gagal.
- Ending ikut fail sebenar: Bryant Barnes *I'd Rather Pretend*, menggantikan draf
  *My Everything*. Bermula pada Kisah Kita, berterusan melalui surat/kad rahsia/Tamat.
  Happy Birthday membatalkan semua nota terjadual apabila lilin selesai supaya tidak bertindih.
- Eksport boleh diulang: `music/cues.json` → `pipeline/tools/prepare_music.py` →
  `game/public/assets/music/` + `content/music.generated.json`. Gain tetap, ruang SFX,
  fade tepi 5ms, pemeriksaan eksport tidak senyap/clipping. Timecode awal boleh dilaras Faris.
- **Validasi:** TypeScript + production build lulus. Audit browser `pipeline/audit/music.mjs`
  lulus: isyarat audio title/Joji sebenar, loop penuh overworld + kesinambungan antara zon,
  kedua-dua loop chorus boss, rhythm 50/50 hit menggunakan keyboard dan jam audio,
  retry/skip, lilin → Kisah Kita → surat → kad ke-9 → Tamat, touch phone dan fallback
  audio rosak. Tiada ralat browser. Bukti: `art/music/qa/verification.json`.


### Pembetulan dialog NPC terpotong (2026-10-26)

- Belon NPC dahulu memakai canvas 320 × 96 dengan teks satu baris; ayat panjang melepasi tepi canvas.
  `ui/speechBubble.ts` kini membalut teks ikut ukuran font sebenar dan menambah tinggi belon mengikut
  bilangan baris. Nisbah sprite diselaraskan; belon membesar ke atas tanpa mengalih ekor dari NPC.
  Dipakai oleh crowd Lorbel/Photobooth/Sepang/Cosy Place, Bukit Bintang, jogger Putrajaya/Tasik,
  jeritan Tasik Lily dan pop-up Nyomnyom. Ayat panjang diberi masa membaca lebih lama.
- Dialog utama diukur ikut ruang/font sebenar. Jika panjang, A menyambung halaman (`Sambung ayat`);
  pilihan jawapan hanya muncul selepas halaman akhir. Ruang footer dibesarkan supaya petunjuk A tidak
  menindih teks, termasuk telefon landscape. Kandungan dialog dan ID QC kekal.
- Audit `node pipeline/audit/dialogue.mjs`: 242 ayat NPC, pemeliharaan setiap aksara pada dialog panjang
  berbilang halaman, dan pilihan jawapan lulus pada 1280×720, 390×844, 844×390 serta 320×568.
  Tiada ralat JavaScript browser. Bukti: `art/style/dialogue/verification.json` dan screenshot sefolder.

### QC HUD game, title ringkas & outline boss (2026-10-26)

- Permintaan Faris: reka semula lokasi/kad/objective, buang label “Pulau Pokélove” dari
  HUD. Lokasi kini ribbon dengan pin; lapan medallion bulat mengelilingi kiraan kad di kiri.
  Art medallion hanya dimuat untuk kad yang sudah diperoleh.
- Objective berdiri sendiri di hujung kanan. Selepas cukup, ia **kekal dengan Complete**,
  kiraan penuh dan check hijau, termasuk apabila kembali ke zon atau memakai save lama
  yang sudah melepasi boss. Workout Putrajaya juga mengekalkan keadaan siap.
- Title **hanya logo + Press Start**; scenery detail/ayat tambahan dibuang. Langit pink,
  awan, rumput dan jalan ringkas dilukis dalam canvas. **Bolat = doodle manusia Qish** di
  kiri, **Bowat = sloth** di kanan (disahkan Faris), menggunakan empat bingkai jalan sedia
  ada, bergerak ulang-alik saling mengejar. Tiada penjanaan aset baharu.
- Semua pose sprite boss fight mendapat outline putih + rim halus seperti paper-cutout
  overworld. Border diproses ketika muat texture, setiap bingkai berasingan; dimensi asal,
  frame index dan hitbox kekal. Runner menerima border canvas/DOM yang sama.
- Kod: `ui/adventure-hud.css`, `ui/titleChase.ts`, `ui/hud.ts`, `core/paperBorder.ts`,
  `minigames/storybook.ts`; main mengurus objective lengkap setiap kali masuk zon.
- Validasi HUD/title/persistence: desktop 1280×720, phone 390×844, landscape 844×390 dan
  phone kecil 320×568 lulus. Semua lapan minigame dan rematch lulus pada salinan QA tetap;
  tiada ralat browser/aset, 24 sprite berjalan asal masih mempunyai hash yang sama.
  Build TypeScript/Vite lulus. Guard masa animasi mencegah frame -1 ketika frame awal browser.
- Gambar terbaru dan pautan semakan di bahagian atas `docs/UI_QC.md`;
  `art/ui-hud-refresh/` mengandungi screenshot, overview dan keputusan audit.

### QC dunia & empat boss: kamera, parking dan bentuk licin (2026-10-26)

- Senarai Faris diselesaikan merentasi Bukit Bintang, Tasik Lily, Nyomnyom, Photobooth, Putrajaya,
  Sepang dan minigame Bowat/Blep/Bolat ex/Qish ex. Katalog pembetulan + bukti: `docs/WORLD_QC.md`.
- BB: lampu tambahan kereta, burger parking motosikal dan bangku MRT dibuang; shawarma/MRT/monorel
  kembali binaan kod bertekstur/bucu bulat; empat blok mengapit menara skrin. Parking Myvi dipusing
  menegak, masuk dari sebelah kiri; collider/interaksi/spawn ikut kedudukan baharu dan diuji flood fill.
- BB/Tasik: had kamera selatan dilanjutkan; berjalan ke bawah lulus desktop, landscape dan portrait.
  Tasik tinggal satu sampan yang boleh dinaiki, lantai penuh di atas air, Snorlax licin tanpa baju/cetakan.
- GLB kereta BB dikongsi dengan Nyomnyom dan kereta parking Sepang. Gerbang antara bandar beserta
  collider tiangnya dibuang. Photobooth menapis lampu atas jalan; spawn Myvi di sempadan kawasan
  berjalan turut dianjak masuk supaya tidak tersekat selepas fast travel.
- Putrajaya: keluarga duduk bersama tikar di padang, bangku ikut arah promenade, lintasan zebra rata.
  `splatShape` melukis tanah bercat pada outline bertebing/lubang tasik; `MaskPainter.path` memberi
  laluan spline. Tasik, Putrajaya, KLIA, Lorbel dan paddock/parking Sepang berkongsi permukaan bercat,
  tanpa lapisan slab jalan lama. Baki prop kod menggunakan kotak bulat dan lengkung lebih licin.
- Bowat: permukaan awning mengikut alpha art dan kaki tidak lagi diangkat masa berjalan.
  Blep: pesawat penuh dijana semula satu per imej; framing/tepi pergerakan dilaras. Bolat ex: studio
  latar berterusan; Qish ex: polygon/jalur retro dibuang, ilustrasi jalan sebenar menjadi permukaan.
- ComfyUI Qwen Turbo seed 861: sumber/prompt `art/storybook/world-qc/`; eksport boleh diulang
  `pipeline/tools/world_qc_assets.py`. Art berjalan asal dan dialog tidak ditukar.
- Validasi: TypeScript + production build lulus; audit laluan 9 zon dan empat boss desktop/telefon,
  kamera 4 saiz dan sampan dengan input sebenar. Bukti `art/style/world-qc/`. Kawalan gamepad fizikal
  dan prestasi telefon sebenar tidak diukur dalam pas ini.


### QC title dijana, kad sebenar, peta Myvi & banner TV (2026-10-26)

- Permintaan Faris menggantikan title canvas dengan ilustrasi 2D timbul seperti arena boss:
  langit pink dan jalan rumput ringkas, tiada scenery terperinci. Built-in image_gen menjana
  `art/ui/paper/title-meadow-source.png`; prompt penuh sefolder, runtime `title-meadow.webp`.
  Logo dibesarkan, diletakkan bersama Press Start di tengah. Bolat manusia di kiri dan
  Bowat sloth di kanan kekal pada tempat masing-masing; hanya empat bingkai jalan asal bertukar.
- HUD menggunakan art kad sebenar daripada `assets/cards/` dalam susunan sekeliling kiraan.
  Lokasi dan objective Complete daripada pas sebelumnya dikekalkan.
- Myvi membuka peta pulau dengan sembilan destinasi, lokasi semasa, preview dan laluan terkunci.
  Destinasi semasa/terkunci tidak boleh dipilih untuk travel; unlock perjalanan dan guard parti kekal.
- TV bilik membuka banner pilihan boss dengan muka boss, latar arena, nama, zon dan genre.
  Syarat rematch selepas ending dan kad sudah diperoleh kekal. Rematch kembali ke konsol tanpa
  memberi kad sekali lagi. Kedua-dua picker menyokong klik/sentuhan, arah + A, B/Esc dan ×.
- `ui/picker.ts` berkongsi input/focus/cleanup; main mengunci gerakan semasa picker terbuka
  dan memulihkannya apabila dibatalkan. Baris banner tidak mengecil hingga bertindih pada
  telefon pendek; grid boleh diskrol.
- Bukti dan gambar terkini: `art/ui-navigation/`, `docs/UI_QC.md`. Audit
  `pipeline/audit/navigation.mjs` meliputi title statik dengan walk frames, art kad sebenar,
  gate destinasi, cancel/unlock, travel sebenar, lapan banner dan memulakan rematch.
  Saiz: 1280×720, 390×844, 844×390, 320×568. Build TypeScript/Vite serta audit production
  title/HUD lulus. Gamepad fizikal belum diuji; keyboard dan emulasi sentuhan diuji di browser.

### QC susulan: konkrit airport/litar, view BB & input Blep (2026-10-27)

- Faris: Myvi BB masih tersorok → ruang terbuka sebelah kedai “Untuk disewa”; collider/spawn/prompt
  dipindah bersama. MRT kiri/kanan dianjak 2 m dari kedai. Photo spot lebih dekat dan menggunakan
  jarak kabus sendiri supaya bangunan sisi tidak lenyap; Qish kekal dalam frame di tepi bawah.
- Konkrit baharu ComfyUI Qwen Turbo seed 953: `airport_concrete` untuk KLIA, `circuit_concrete`
  untuk concourse/paddock/fan zone Sepang. Calon awal terselit ikon/marking ditolak; prompt macro
  bahan kosong berjaya. Sumber/prompt `art/textures/world-qc-v2/`, exporter `world_qc_v2_assets.py`.
- Jalan/sidewalk Jambatan Putra memakai tekstur bercat yang sama dengan boulevard/tebing.
  Air tebu, air kelapa (canopy/vendor/collider/interaksi sekali) serta bangku sebelah aiskrim dibuang.
- Dapur Mega Bowat dijana semula, semua balang lengkap dalam frame. Latar menjadi ilustrasi penuh,
  bukan tile bergerak. Qish ex diturunkan ke sidewalk dengan bayang; papan usikan bervariasi
  GEMOK/BOLAT/EMOK/80 KG/FAT ASS.
- Blep: kapal Faris lebih kecil, collision ikut saiz. A menembak hati sekali setiap tekanan;
  tiada tembak automatik/ulang semasa tahan. A ketika bar penuh melepaskan Omey Blast.
  Damage hati 2 untuk mengekalkan tempo mesra pemain baharu. Arahan intro diselaraskan.
- TypeScript + production build lulus. Laluan empat zon, kamera empat saiz, desktop/phone tiga boss,
  serta overlap BB/Putrajaya lulus. Blep dimainkan hingga menang dengan arah + A sebenar, tanpa
  forceWin. Bukti dan senarai: `docs/WORLD_QC.md`, `art/style/world-qc-v2/`.

### QC playtest penuh: title, cerita Bolat/Babah, boss & ending (2026-10-27)

Senarai panjang Faris (title → ending, semua zon dan boss). Dimulakan oleh Codex, disiapkan oleh Claude.
- **Title:** logo bernafas perlahan; butang jadi teks sahaja dengan anak panah ▸ pada pilihan, tiada
  "(kad x/8)", teks di tengah. **Mimpi:** sofa 2D timbul dijana + pose duduk Faris/Qish; Bolat → Qish
  (potret dialog Qish; dialog mimpi guna potret besar kiri/kanan sama macam dialog lain, bukan gambar
  kecil dalam kotak). **Bilik:** "bau kentut" (tanpa "senyap"); pintu/meja ada aksen kayu, tak
  pink penuh; telefon jadi handset grafit, chat neutral.
- **Labu Lanjut:** tangga rumah solid, prompt "Masuk bilik" dari tangga; bangku "(Awak kuyush.)";
  banner zon "Labu Lanjut" sahaja. **BB:** Myvi menegak tepi kedai sewa; huruf warna-warni dibuang.
- **Cerita:** Bolat = suara hati/diri dalaman Qish (Lorbel). Blep bukan watak bercakap, hanya kad.
  Boss KLIA kini **Babah** (terbang dengan Babah cari Faris dari langit); Omey Blast dibuang; Raja
  Nonchalant dan Faris tidak muncul di KLIA. Tools Babah tercicir sebab Babah sendiri kelam-kabut
  "kerja rahsia" (bukan Faris pinjam, supaya tak bercanggah dengan "tak nampak Faris").
  Kamera besar FotoBooth yang bercakap, simpan strip dan pos ke rumah. Tasik Lily → **Lakefront**,
  Lorong Photobooth → **FotoBooth**, batik lukis → canting batik, Cyberjaya/Sepang dibuang dari nama.
- **Boss:** Bowat bar nyawa tengah (2D timbul), nyawa Qish dibuang, "pening" di tengah. Bolat rhythm
  3 lorong (↑/↓ pilih Kiss/Cuddle/Peluk + A ikut rentak), lagu original 108 BPM disintesis (bukan
  Laufey), lorong dalam panel bawah pentas, urutan tak berulang. Snorlax: paparan berat dibuang, bar
  kenyang timbul. Mega Bowat: menghadap kanan, collision ikut piksel, HUD atas periuk. Bolat 2: teks
  match tak tenggelam. Raja Nonchalant: "Pergi, Qish!", teks move kecil, dialog tumbang hilang dulu.
  TV main semula: Babah / Bolat 2 / Myself (nama kad bercetak kekal).
- **Dunia:** Lorbel kurang penonton depan pentas, NPC parking tak stuck; Lakefront papan dibuang,
  sampan tak tenggelam; KLIA teksi/papan dibuang; Nyomnyom banner cookie tanpa bulatan, kereta ada
  bayang sentuh jalan; Putrajaya rumput sesat & tiga bangku dibuang; Sepang khemah baju hujan
  dibuang, concourse kosong, penonton duduk guna doodle, depan grandstand solid, kenderaan lebih licin.
- **Surprise/Ending:** satu watak kanan pada satu masa (Qish kekal kiri); kek mangga 2D timbul;
  "nonchalant, avoidant dan malas"; jarak "Jom sambung adventure"; potret Qish menangis dijana semula
  (tangan penuh); draf surat penuh suara Faris dalam `content/ending.ts` (Faris semak/ubah);
  "Click to continue" berkelip di bawah. Gambar kad rahsia/Tamat: letak `ref/kad-rahsia.png` dan
  `ref/tamat.png` lalu build (lihat `ref/ENDING_ART.md`).
- **Susulan Faris:** title landing — logo muncul kecil lalu membesar (lantun), Bolat masuk dari kiri dan
  Bowat dari kanan; Press Start → logo mengecil untuk menu (phone pun). Butang menu di tengah.
  Mimpi menangis: sprite baru `qish-seated-cry` (ComfyUI Qwen edit seed 12 daripada sprite duduk),
  kekal duduk di sofa, air mata dikira dari kedudukan mata. Muzik title hanya boleh mula selepas
  tekanan pertama (polisi autoplay browser), jadi Press Start sengaja jadi "pintu" bunyi.
- **Nota:** penanda PETA terapung atas Myvi dan ULANG pada rematch; narrator kotak ungu italik
  berlabel "Cerita", berbeza daripada NPC.
- TypeScript + production build lulus; audit `ui.mjs` dan `dialogue.mjs` lulus (desktop/phone/
  landscape). Gambar sebelum/selepas: `art/playtest-qc/` (`pipeline/audit/playtest-after.mjs`).


### QC susulan Faris: boss, input, audio & gambar ending (2026-10-27)

- Bukit Bintang: tapak tar parking kini di bawah Myvi menegak sebelah kedai sewa; tapak
  lama dibuang. Myvi dan rematch memakai satu tanda `!` dalam bulatan kuning, jarak
  terapung dan bob dikurangkan.
- Bowat: “Bowat pening!” tepat pusat arena. Bolat: instruction bawah banner busking
  dibuang. Bolat 2: tajuk dan “Kenangan tersusun” dikecilkan, muat panel. Myself:
  semua papan usikan datang dari bahagian bawah boulevard. Nyomnyom: drip sphere
  di tepi bumbung kedai cookies dibuang kerana menutup banner. Finale: panel dialog
  tumbang disembunyikan bersama teks sebelum dialog kemenangan muncul.
- Input aktif menentukan label: keyboard Space/Esc, touch A/B, controller standard
  bawah/kanan dengan simbol Xbox/PlayStation/Switch. Pertukaran berlaku semasa bermain,
  termasuk ayat tutorial, footer dialog, peta/TV, senaman, phone, boss, surat dan kad.
  Butang Y/X tambahan tidak lagi dianggap confirm/cancel. Touch UI hilang apabila
  keyboard/controller digunakan; key/touch yang tersangkut dibersihkan apabila blur.
- Prompt “Minta kad betul dari Faris” dibuang untuk kad 1–8. Kad 9 mengekalkan
  “Pusing belakang!”, tetapi tiada lagi arahan kepada Faris untuk tekan selepas serah.
  BGM biasa 0.8 → 0.16, rhythm 0.9 → 0.24 untuk mengutamakan SFX.
- Imagegen: memori “Mula-mula kawan” mengedit doodle asal dengan warna/latar/shading;
  kad 9 mengkartunkan foto sebenar Faris/Qish bersama; poster Tamat baharu mempunyai
  Faris, Qish, Bolat, Raja Nonchalant, Bowat dan Encik Sloth di sekeliling tengah kosong.
  Lilin pink/krim 2D timbul menggantikan rectangle; 26 flame/smoke kekal interaktif.
  Sumber/prompt `art/ending-qc-2026-10-27/README.md`, exporter `ending_qc_assets.py`.
- Validasi: TypeScript + production build lulus; ending penuh desktop/phone/landscape,
  ukuran teks boss, panel kemenangan, tiga zon dunia, emulasi Xbox/PS/Switch, reveal
  recording ON tanpa prompt fizikal dan hash aset production lulus tanpa ralat browser.
  Audit dialog 234 ayat NPC + pagination 4 saiz hingga 320×568 lulus. Gamepad fizikal,
  mic sebenar dan tahap speaker sebenar masih belum diuji. Bukti `docs/UI_QC.md`.

### Ikon browser & Add to Home Screen (2026-10-27)

- Permintaan Faris: muka Bowat gemuk comel jelir lidah, gaya ikon game mobile seperti
  Angry Birds/Clash of Clans; nama tab dan home screen **Bolat The Game**.
- Built-in Imagegen menggunakan potret Bowat yang diluluskan sebagai rujukan. Master/prompt:
  `art/app-icon/`; exporter: `python3 pipeline/tools/app_icons.py`.
- Favicon ICO 16/32/48px, PNG 16/32px, Apple touch icon 180px dan manifest icon 192/512px.
  Latar penuh, tanpa sudut bulat dibakar; mata/hidung/lidah berada dalam ruang mask tengah.
- `game/index.html` memasang nama tab, metadata iOS, manifest dan ikon; manifest memakai
  nama penuh pada name/short_name serta display standalone. Logo title game kekal.
- Validasi: TypeScript/Vite production build lulus. Chromium desktop 1280×720 dan mobile
  390×844: nama tepat, manifest tanpa parse/installability error, semua ikon production
  sepadan fail sumber dan boleh didekod, tiada page error. Preview favicon serta mask
  bulat/squircle disemak di `art/app-icon/qa-icon-preview.png`; laporan `verification.json`.
  Add to Home Screen pada peranti iOS/Android fizikal belum diuji.


### QC kedua: countdown, jalan runner, keycap & ending komik (2026-10-27)

- Faris: “Sedia/Pijak Bowat” masih belum tengah → semua hint Bowat bermula pada pusat
  arena, bukan hanya mesej menang.
- Runner pas sebelumnya terlalu rendah dan garis overlay tak sepadan dengan gambar.
  Garis bergerak tambahan dibuang terus. Jalan dalam `bg_qishex` mempunyai titik hilang
  (161,104) pada kanvas 320×180; sasaran kini diproyeksikan ke titik ini hingga kaki Qish.
  Papan dekat masuk lapisan depan supaya kepala Qish tidak menutup teks sasaran.
- Semua label keyboard termasuk Space memakai keycap segi empat yang lebar mengikut
  perkataan, termasuk prompt dunia, senaman dan prompt pukul runner. Touch A/B kekal.
- Page warna solid sebelum boss berpunca daripada intro dibuang semasa aset masih
  preload. Ilustrasi intro disediakan semasa overworld masih kelihatan; fade hanya
  dibuka selepas intro dipasang. Kad kekal sehingga render pertama Phaser atau canvas
  runner siap. Tiada lagi frame loading warna solid yang terdedah.
- Faris luluskan komposisi kad 9/Tamat tetapi menolak rendering terlalu realistik.
  Kedua-duanya diedit Imagegen dalam arah Ben 10 / Into the Spider-Verse: contour
  tebal, bentuk grafik, cel shadow tegas, sedikit halftone/hatching pada watak dan
  latar sekali. Enam watak, pose dan tengah kosong poster dikekalkan.
  Sumber/prompt `art/ending-comic-2026-10-27/README.md`; runtime `couple-comic.webp` dan
  `ensemble-comic.webp`. Sumber pas terdahulu kekal sebagai rekod.
- Skrip semakan dan screenshot: `docs/UI_QC.md`, `art/ending-comic-2026-10-27/qa/`.

  Validasi pas kedua: build TypeScript/Vite lulus; lapan boss dengan muatan PNG sengaja
  ditahan mengekalkan intro sehingga frame arena siap; kedua-dua countdown Bowat tepat
  (640,360). Runner menang 10/10 melalui input lorong/Space, 0 fail, 0 stroke garis
  overlay. Space muat keycap petak pada desktop dan 320px. Ending penuh tiga saiz dan
  hash gambar komik production lulus tanpa ralat browser.

  Prompt dunia kini mengekalkan node keycap, hanya mengemas kini bila label berubah;
  binaan semula setiap frame sebelumnya boleh menetapkan semula simbol controller.


### Pas pantas: logo Tamat & jalan runner berasingan (2026-10-27)

- Faris mahu Tamat lebih berhias: logo title ditambah ke tengah poster, tulisan emas
  timbul beroutline pink, bintang dan pemisah hati. Komposisi watak kekal.
- Permintaan jalan/FAT ASS ditafsir sebagai boss Myself (FAT ASS hanya pada runner).
  `runner/road.ts` memisahkan scenery melalui cutout alpha canvas; permukaan jalan
  dilukis sebagai lapisan sendiri menggunakan tekstur bercat `putra_road`, dengan
  sampling perspektif dan marking bergerak pada kelajuan dunia yang sama dengan sasaran.
  Scenery/kerb kekal statik. Keycap aksi dan touch A kini pink terang dengan tulisan putih.
- Faris minta cepat dan mahu semak sendiri: tiada QA/audit browser dijalankan untuk pas
  ini. Hanya build production dikemas kini. Tiada screenshot QA baharu.


### Logo Tamat lebih besar & tiga lorong tepat (2026-10-27)

- Logo di skrin Tamat dibesarkan (hingga 420px / 195px tinggi); perkataan Tamat kini
  pink gelap, outline putih dan lapik krim supaya kontras dengan langit poster.
- Punca lorong tidak jelas: marking dan sasaran menggunakan lebar tetap berbeza daripada
  jalan yang luas. `runner/perspective.ts` kini menjadi satu sumber koordinat bagi
  pembahagi, pusat sasaran dan pusat Qish. Dua garis putus pada sempadan 1/3 dan 2/3;
  sasaran muncul tepat pusat salah satu tiga lorong. Garis solid luar menandakan lebar
  kawasan bermain. Kawalan tap mengikut tiga bahagian yang sama.
- Arahan terdahulu untuk tidak menjalankan QA diteruskan: hanya build production,
  semakan visual/gameplay diserahkan kepada Faris.


### Ending penutup: panel ucapan jelas & QA fokus (2026-10-27)

- Faris masih menolak rupa Tamat/ucapan/Click to continue dan membenarkan QA untuk
  bahagian ini. Ucapan kini satu panel plum gelap dengan bingkai krim/pink, tajuk
  krim besar, ucapan putih-pink dan butang sambung magenta timbul. Teks tidak berkelip
  pudar; hanya anak panah kecil bergerak. Logo title berada di atas panel.
- Desktop/landscape mengekalkan poster penuh dan mesej di ruang tengah. Portrait
  meletakkan poster di bahagian atas, kemudian logo/panel di bawah supaya watak kekal
  nampak dan tulisan tidak dikecilkan ke ruang 38% skrin.
- `ending/endScreen.ts` ialah renderer sebenar yang dipakai oleh ending dan preview
  QA; tiada salinan markup berasingan. Klik/sentuh butang diteruskan oleh confirm
  ending sedia ada.
- Build TypeScript/Vite lulus. QA fokus pada 1280×720, 390×844, 844×390, 320×568: tiada
  clipping/overlap, klik/tap/keyboard berfungsi. Kontras minimum tajuk 8.76:1, ucapan
  8.44:1 dan butang 4.98:1. Aliran ending sebenar dimainkan hingga kad 9/Tamat;
  butang sambung menutup ending dan progress kekal disimpan.
- CSS/bundle production port 5180 disahkan sama byte-for-byte dengan build semasa.
  Bukti `art/ending-keepsake-2026-10-27/`, skrip `ending-keepsake.mjs` dan
  `ending-keepsake-flow.mjs`. QA ini khusus ending; tiada QA baharu untuk runner.


### Loading penuh, mikrofon tanpa block & dependency production (2026-10-27)

- Faris minta baiki mikrofon dan dependency. Untuk download, Faris memilih **semua aset
  dimuat di awal**, menggantikan cadangan lazy-load zon. 38 MB audit lama cuma title;
  semua 471 aset game sebenar berjumlah **67.5 MB** (browser icon/manifest diurus browser).
- Entry `boot.ts`: background pastel `dream-sky`/haze sedia ada + Bowat idle, kelip dan
  menguap; teks Sediakan adventure, bar MB/peratus dari byte sebenar. Press Start hanya
  dipasang selepas download dan persediaan model/sprite selesai. Retry mengekalkan fail siap.
- Manifest saiz/hash dijana Vite daripada `public/assets`. Cache Storage + asset worker
  mengikut hash menyajikan gambar/GLB/muzik tanpa bergantung pada cache HTTP yang boleh
  mengeluarkan model awal. HTML/JS/CSS kekal mengikut cache hosting biasa; bukan offline app.
  Jika worker/storage disekat, fallback HTTP masih membenarkan game dimainkan.
- Lilin dirender dan fallback Space/touch aktif terus walaupun permission mic belum
  dijawab. Stream lewat dihentikan, kegagalan setup dan scene dibuang membersihkan mic/context.
- Vite **6.4.5**, esbuild **0.25.12**, lockfile dikemas kini; audit dependency penuh **0 vulnerabilities**.
- Validasi: npm ci + TypeScript + build production bersih; loading empat saiz termasuk
  320px, download gagal/retry, 471 aset lengkap/cache, Press Start ke mimpi; tujuh keadaan
  mic pending/deny/allow/setup-fail/cancel lulus tanpa page error. Simulasi browser, bukan
  ujian mic/controller/phone fizikal. Bukti: `art/startup-mic-2026-10-27/qa/`,
  `docs/startup-mic-audit.json`. Pemulihan save rosak masih kerja berasingan.


### Fon landscape: satu komposisi desktop (2026-10-27)

- Faris mahu fon rotate landscape mempunyai UI/HUD yang sama seperti desktop.
  Permukaan game kini 1280×720 dengan skala sekata untuk semua landscape, dari
  loading/title hingga dunia, lapan boss dan ending. Nisbah skrin berbeza mendapat
  bingkai; notch/home indicator dikecualikan. Portrait kekal responsif.
- CSS memakai ukuran/breakpoint container game; kamera dan prompt memakai koordinat
  logik yang sama. Resolusi renderer/postprocessing mengikut paparan × DPR dengan had.
  Joystick/A/B berasingan dalam piksel fizikal, dengan target sekurang-kurangnya 48px
  pada landscape pendek. Grid memory 568×320 tidak ditutup kawalan.
- Phaser tidak lagi double-scale. Bounds sentuhan diselaraskan selepas putaran dan
  sebelum touch bermula; audit menemui koordinat orientasi lama dan mengesahkan
  pembetulannya. Runner juga diuji tap tiga lorong selepas rotate. Air mata mimpi
  mengambil kira skala; kawalan disembunyikan sepanjang mimpi.
- TypeScript/Vite lulus. Lapan saiz desktop/landscape/tablet dibanding dengan desktop;
  tambahan portrait 390×844/320×568 untuk panel bersama. Semua lapan boss, peta, dialog,
  reveal, phone, senaman, mimpi dan ending lulus. Ending sebenar selesai dengan touch
  kek semasa mic pending, surat, kad 9 dan butang Tamat. Production 5180 pada DPR 3
  serta byte JS/CSS sepadan build lulus tanpa page error.
- Bukti/laporan dan skrip: `art/mobile-landscape-2026-10-27/README.md`,
  `pipeline/audit/mobile-landscape*.mjs`, `docs/UI_QC.md`. Emulasi Chromium;
  fon fizikal, Safari dan prestasi/FPS peranti belum diuji dalam pas ini.


### Mobile port fullscreen adaptif (2026-10-27)

- Faris memilih fill penuh selepas semakan bingkai pink pada fon memanjang. Landscape
  kini menggunakan tinggi logik 720 dan lebar mengikut visual viewport; latar memenuhi
  skrin sementara HUD/font mengekalkan skala desktop dan bergerak ke sisi yang selamat.
  Kamera dunia menunjukkan lebih banyak kawasan kiri/kanan, tanpa mengubah collider.
- Built-in Imagegen menghasilkan 10 panorama sekitar 3:1: title, lapan boss dan Tamat.
  Sumber/prompt `art/mobile-fullscreen-2026-10-27/`; WebP runtime `assets/mobile/`.
  Asal 16:9 kekal. Tambahan 1.77 MB; semua 481 aset/69.3 MB masih dimuat di awal.
- Boss mengekalkan arena/hitbox 1280×720 dan bounds touch tepat selepas rotate. Runner
  mempunyai panorama/road berterusan dan projection tiga lorong asal. Finale memakai
  menu move native touch minimum 44px; memory ditap terus tanpa joystick menutup kad.
- Safe area melindungi HUD/panel/touch di bawah notch/home indicator. Butang fullscreen
  pilihan pada title, manifest landscape, status bar iOS translucent. Pointer cancel,
  capture hilang, rotate, blur dan app switch melepaskan input. Dialog/surat boleh
  diskrol dengan jari; swipe dialog tidak mengesahkan/skip ayat.
- GPU fon: had DPR dunia 1.5, shadow map 1024px, clock dan Phaser maksimum 60 FPS.
  Simulasi paparan 120 Hz mengekalkan game time sambil mengurangkan update ke 60;
  desktop bukan touch kekal. Tiada tuntutan FPS hardware dibuat.
- TypeScript/Vite lulus. Sembilan zon, semua lapan boss, lapan saiz landscape/desktop/
  tablet, portrait panel bersama, mimpi/senaman/ending sebenar, tap move finale hingga
  damage, memory, tiga lorong runner, surat, pending mic + touch kek, save ending,
  gangguan multitouch dan notch asimetri lulus. Production 5180 pada DPR 3 serta
  byte JS/CSS build sepadan lulus tanpa page error.
- Bukti: `art/mobile-fullscreen-2026-10-27/README.md`, `qa/summary.json`,
  `pipeline/audit/mobile-fullscreen*.mjs`, `docs/UI_QC.md`. Emulasi Chromium sahaja;
  fon fizikal, Safari, FPS, haba dan penggunaan bateri peranti belum diukur.

### Pembaikan fokus Safari: blend dan resource bandar (2026-10-27)

- Canvas blur kini diuji melalui piksel; Chrome mengekalkan filter asal. Browser yang
  tidak melaksanakannya menggunakan Gaussian RGB sekali semasa membina mask, bukan
  setiap frame. Ini fallback runtime kecil; mask siap semasa build belum dilaksanakan.
- Texture painted sumber kekal dalam cache; salinan UV dimiliki bandar. Teardown
  membersihkan alpha/emissive maps, mask/uniform splat, instancing dan render lists.
  Texture beam pentas Lorbel yang tersalah ditanda kekal turut dibersihkan.
- Pertukaran bandar memaparkan `Sediakan [nama bandar]…` sebelum kerja pembinaan;
  mesej dibuang juga jika pembinaan gagal. Download awal semua aset dikekalkan.
- Audit `node pipeline/audit/mobile-resources.mjs` (dev server 5181) lulus: 15
  pembinaan Labu/BB/Lorbel, tiada page error, salinan texture bukan kongsi dari
  bandar sebelumnya tidak lagi mempunyai alokasi GPU. Ujian mask RGB: RMSE 0.064/255
  terhadap Chrome; Labu boleh dibina dengan canvas filter dimatikan.
- Had: cache kongsi/watak masih bertambah semasa audit pendek; ini bukan bukti
  memory keseluruhan sudah plateau atau crash Safari sudah selesai. Semua 51 GLB
  masih decode di awal; pemuatan model mengikut bandar dan profiling iPhone kekal
  susulan. Build TypeScript/Vite lulus; ujian ini Chromium, bukan iPhone fizikal.

### Susulan wide tiga boss (2026-10-27)

- Hujan/langit finale, periuk Mega Bowat dan sprite di tepi Bowat masih terpotong
  pada canvas 16:9. Tiga scene ini kini mempunyai render window lebar dengan kamera
  mengimbangi sisi; koordinat gameplay dan bounds fizik asal dikekalkan.
- Hujan/langit memenuhi sisi tambahan; periuk spawn/despawn di luar skrin sebenar.
  Bounds pergerakan Qish mengambil kira lebar doodle, termasuk pada paparan 16:9.
- Pas fokus atas permintaan Faris untuk menjimatkan masa/token; tiada audit penuh.

### Model GLB mengikut bandar (2026-10-27)

- Semua fail masih download awal ke cache; title kini decode **0 GLB**. Ketika
  `Sediakan [bandar]…`, loader menyediakan hanya `ZONE_MODELS` destinasi, maksimum
  dua fail serentak. Bandar lama dibersihkan sebelum model tidak diperlukan
  dilepaskan (geometry, material, texture dan ImageBitmap); model kongsi dikekalkan.
- Inventori semua bandar sebelum/selepas finale: bilik 7, Labu 26 (parti 28), BB 12,
  Lorbel 3, Lakefront 6, KLIA 4, Nyomnyom 7, FotoBooth 2, Putrajaya 7, Sepang 6.
  Ini bilangan model aktif, bukan ukuran keseluruhan penggunaan RAM/GPU.
- Peta normal/metal/rough TRELLIS yang tidak digunakan ditutup sebaik model decode.
  Pembinaan bandar disusun bersiri; kegagalan fail menawarkan retry termasuk bandar
  pertama. Tiny-planet tidak lagi dispose geometry milik cache model kongsi.
- Audit turut menemui pose sniff Bowat cuba memuat nama fail tidak wujud; pose kini
  memakai muka depan/sisi sedia ada. Tiada aset atau reka bentuk bandar ditukar.
- `pipeline/audit/zone-models.mjs` lulus 30 keadaan bandar: tiada model hilang atau
  model tidak diperlukan dalam cache; decoded ImageBitmap tepat sepadan model aktif.
  Myvi/papan kongsi dipakai semula; kegagalan GLB bandar pertama dan retry lulus,
  tanpa page error. Bukti audit: `/tmp/qish-zone-models.json` (sementara).
- Build TypeScript/Vite lulus. Pengesahan ini browser Chromium dengan emulasi touch;
  ujian crash/FPS pada Safari iPhone sebenar masih diperlukan. Tiada deploy Netlify.

### Spot kamera Bukit Bintang pada mobile (2026-10-27)

- Audit fokus `pipeline/audit/bb-scenic.mjs` mengukur spot foto dalam landscape,
  portrait dan desktop. Skyline hanya ~9 ribu segi tiga; shadow pass ialah beban
  besar. Fader objek tidak aktif di titik tersebut.
- Mobile BB kini mengecilkan kawasan shadow secara beransur apabila kamera
  masuk spot foto (radius 26 ke 14); desktop dan bandar lain kekal radius 26.
  Skrin animasi BB berhenti melukis semula canvas apabila di luar pandangan,
  lalu sambung apabila kelihatan. Resolusi, mipmap dan rupa skrin dikekalkan.
- Pada emulasi touch landscape, spot foto turun daripada ~1.29 juta kepada
  ~0.93 juta segi tiga setiap frame; portrait ~1.00 juta kepada ~0.64 juta.
  Screenshot selepas perubahan masih mengekalkan komposisi dan skrin. Build
  lulus; tiada page error dalam tiga layout. Angka ini daripada GPU desktop,
  bukan bukti crash Safari fizikal sudah selesai. Uji di iPhone sebenar.

### Susulan kestabilan mobile seluruh game (2026-10-27)

- Spot kamera BB, lingkaran foto dan interaksinya dibuang atas permintaan Faris.
  Piano, busker, pemuzik, penonton, pokok dan collider dipindah ke arah simpang;
  ruang bawah dipendekkan dan kamera tidak lagi menunjukkan plaza kosong panjang.
- Audit A/B BB menunjukkan trafik/shadow melukis ratusan ribu segi tiga, manakala
  kemas kini crowd mengambil masa CPU. Di touch, 24 kenderaan masih dipaparkan
  penuh tetapi satu InstancedMesh ringkas melukis bayangnya; crowd bergerak pada
  30 Hz. Desktop kekal dengan bayang dan kadar asal. Skrin animasi kekal hidup.
- Semua boss Phaser touch kini memakai Canvas 2D supaya WebGL dunia tidak perlu
  berkongsi bajet GPU dengan WebGL kedua. Loader seni boss hanya memproses sheet
  dan item yang digunakan; contoh Bolat 6 tekstur `art_` termasuk latar berbanding
  hampir 40 sebelum ini. Boss custom Qish ex masih laluan tersendiri.
- Cache kertas NPC khusus bandar dilepaskan ketika keluar; Qish/Bowat dikekalkan.
  Audit tiga pusingan Labu/BB/Lorbel: tekstur GPU Labu pada pusingan ketiga turun
  daripada 133 kepada 98 berbanding sebelum pelepasan, tiada imej model tertutup
  yang masih digunakan. Material depth NPC juga dibersihkan.
- `?diag=1` membuka log tempatan yang kekal selepas refresh, termasuk peringkat
  download/peralihan, FPS, kiraan sumber GPU, tekstur tertutup dan WebGL context loss.
  Audit emulasi touch semua 10 zon/8 boss, potret dan landscape: 20 lawatan zon,
  16 kemasukan boss, dan Bolat menang lalu pulang ke bandar dalam kedua-dua
  orientasi tanpa ralat. Audit laluan BB: 54 model, tiada pertindihan, pickup
  tercapai, exit barat/timur tercapai. Grid 4×4 BB diperiksa; perbandingan kamera
  di `art/style/bukit_bintang_mobile_before.png` dan `bukit_bintang_mobile_after.png`.
  Build production lulus. Safari iPhone fizikal, FPS sebenar dan punca tepat model hitam
  masih perlu disahkan menggunakan log/peranti tersebut; tiada deploy Netlify.
