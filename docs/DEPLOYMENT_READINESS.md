# Audit deployment — 27 Oktober 2026

**Keputusan: sesuai untuk preview di Netlify; belum sign-off production akhir.**
Build bersih lulus. Susulan permintaan Faris: isu mikrofon telah dibaiki, Vite/esbuild dinaik
taraf dan loading penuh dipasang. Pemulihan save masih terbuka; playtest peranti sebenar
masih diperlukan sebelum sesi birthday. Tiada commit, push GitHub atau deployment dibuat.

## Susulan loading, mikrofon dan dependency

- **Mikrofon:** rendering dan fallback Space/touch bermula tanpa menunggu permission.
  Permission ditolak tidak menghentikan game. Jika permission diterima selepas scene selesai,
  stream terus dihentikan tanpa mencipta AudioContext. Stream/context turut ditutup jika setup
  gagal atau scene dibuang.
- **Dependency:** Vite **6.4.5**, esbuild **0.25.12**, lockfile dikemas kini. `npm audit` penuh:
  **0 vulnerabilities**. `npm ci` + TypeScript + build production bersih lulus.
- **Keputusan Faris menggantikan cadangan lazy-load:** download semua aset game pada awal.
  Loading memakai background pastel mimpi, Bowat idle/kelip/menguap, bar byte/MB/peratus,
  dan retry untuk fail gagal. Press Start hanya muncul selepas download serta persediaan model.
  Muatan penuh sekitar **68 MB**; angka 38 MB asal hanya pemerhatian muatan title lama.
- Senarai aset/saiz/hash dijana semasa build. Cache aset mengikut hash kandungan melayani imej,
  GLB dan audio, sementara HTML/JS/CSS menggunakan tingkah laku update hosting biasa.
  Fail yang sudah siap tidak diulang ketika retry. Storage/service worker disekat → fallback
  HTTP cache; browser tersebut mungkin perlu meminta semula aset yang dikeluarkan dari cache.
- Skrip susulan: `pipeline/audit/startup-mic.mjs`; bukti `art/startup-mic-2026-10-27/qa/`.
  Loading empat saiz, 471 aset/67.5 MB tersimpan, retry dan tujuh keadaan mikrofon lulus
  tanpa page error; ringkasan committed di `docs/startup-mic-audit.json`.
  `docs/deployment-audit.json` di bawah ialah snapshot audit **sebelum** pembetulan ini.

## Rekod penemuan audit asal

| Keutamaan | Penemuan dan kesan | Tindakan |
|---|---|---|
| P1 | `game/src/ending/cake.ts:121`: `await openMic()` berjalan sebelum loop lilin dan kawalan fallback dipasang. Jika pemain belum menjawab permission mikrofon, Space/touch tidak boleh meneruskan ending. Reproduksi browser dengan promise permission yang kekal pending: selepas tahan Space 3.5 saat, satu lilin pun belum selesai. | Mulakan render dan kawalan fallback segera; sambungkan mikrofon secara async. Tutup stream jika permission baru selesai selepas scene ditutup. |
| P2 | `game/src/core/save.ts:24`: JSON hanya di-parse dan spread tanpa validasi struktur. Contohnya `cards: null, flags: null` diterima walaupun akses berikutnya menganggap array/object. | Validasi medan, kekalkan progress sah dan pulihkan nilai rosak kepada default; uji Press Start/Sambung serta save lama. |
| P2 | `game/src/overworld/models.ts:76` + `overworld.ts:124`: **51 GLB / 26,769,216 bait** dimuat sebelum zon pertama, termasuk prop bandar dan parti yang belum diperlukan. Browser title sudah meminta sekitar **38 MB** pada localhost. | Muat model/tekstur mengikut zon; cache aset kongsi dan prefetch zon seterusnya. Sediakan loading/retry yang jelas untuk sambungan perlahan. |
| P2 | `main.ts` mengimport `framework.ts`/`registry.ts` secara statik. Title turut memuat Phaser dan semua minigame. Tiga JS bundle berjumlah sekitar **2.87 MB mentah / 0.77 MB gzip**. `manualChunks` membantu cache tetapi tidak menangguhkan muatan. | Dynamic import subsystem minigame ketika diperlukan; kemudian pecah mengikut boss jika berbaloi. |
| P2 | Vite **5.4.11**: `npm audit` melaporkan **1 high + 1 moderate** pada Vite/esbuild. Audit dependency runtime sahaja = **0**. Ini masalah tooling/dev server; output Netlify ialah fail statik dan tidak menjalankan Vite server. | Naik taraf kepada versi disokong, kemas kini lockfile, ulang clean build dan browser smoke. Jangan jalankan `npm audit fix --force` tanpa menilai perubahan major. |
| P2 | Pemulihan gagal muat aset belum lengkap. Runner menangkap error gambar dengan `console.error`, tetapi promise frame pertama kekal pending; intro boleh kekal “Sekejap ya…”. `prepareMinigame()` juga boleh reject tanpa UI retry. Ini pemeriksaan kod, bukan kegagalan dalam happy-path smoke. | Sediakan retry/kembali ke overworld untuk network/decode error. |
| P3 | Dua model lama (`bilik_bed.glb`, `bilik_desk.glb`, jumlah 861 KB) tidak lagi disenaraikan loader tetapi masih disalin ke deployment. Aset retro dan CSS bertindih juga calon kemasan selepas inventori penggunaan. | Buang hanya selepas sahkan semua rujukan dinamik dan exporter. Tiada aset dibuang dalam audit ini. |
| P3 | Font utama datang dari Google Fonts; renderer menggunakan DPR sehingga 2, shadow 2048 dan beberapa postprocessing pass tanpa tahap kualiti telefon. | Pertimbang self-host font dan mod kualiti lebih ringan selepas profiling peranti sebenar. Prestasi RTX 5080 bukan bukti prestasi phone. |

Vite 5 sudah di luar julat sokongan pada waktu audit; rujuk
[sokongan keluaran Vite](https://vite.dev/releases).

## Semakan yang dibuat

- `npm run build`: TypeScript dan Vite lulus.
- Salinan bersih dengan **src + public + konfigurasi game + package-lock**, tanpa `art/`,
  `cards/`, `strip/`, `ref/`, sumber MP3 dan tanpa `node_modules` asal:
  `npm ci` + `npm run build` lulus. Build Netlify tidak perlu menjalankan Python/ComfyUI.
- `npm audit --omit=dev --json`: 0 advisory runtime; audit penuh mempunyai dua dependency terjejas.
- TOML boleh di-parse; base/build/publish dan lockfile wujud.
- Semakan calon commit menggunakan metadata Git sementara di `/tmp`, tanpa mengubah index repo sebenar:
  sekitar **73 MB**, fail terbesar MP3 ending **5.83 MB**; tiada dependency/build/temp atau bahan
  sumber besar terselit. Corak token lazim/private key tidak dijumpai dalam fail yang diperiksa.
- Audit browser production desktop 1280×720 dan portrait 390×844, akses aset runtime,
  muatan title/Sambung dan smoke zon. Bukti mesin: `docs/deployment-audit.json`.
  **478/478 aset HTTP 200 dengan saiz sepadan**, sembilan zon desktop dan Sambung kedua-dua
  viewport lulus tanpa page error. Save rosak selepas Press Start menghasilkan
  `TypeError: Cannot read properties of null (reading 'introSeen')`.
  Smoke zon menggunakan panel retake; ia bukan playthrough gameplay penuh. Viewport portrait
  tidak mengemulasikan semua ciri touch/hardware telefon.
- Build browser akhir menggunakan salinan tetap pada localhost:5190 kerana watcher 5180
  sedang membina perubahan runner/CSS semasa audit. Sumber salinan disemak sepadan
  dengan workspace selepas build. Mikrofon diuji pada komponen dev sebenar.

Audit boleh diulang dengan production server 5180 dan dev server 5181 berjalan:
`node pipeline/audit/deployment.mjs`. Ia memerlukan Chromium + `playwright-core` seperti audit
lain (`PW_CORE` untuk lokasi module). `GAME_URL`, `DEV_URL`, `AUDIT_OUT` boleh ditukar;
bukti default ditulis ke `art/deployment-audit/`. Kes save/mic menggunakan storage browser
berasingan dan simulasi permission pending, tanpa mengubah save pemain sebenar.

Had: belum diuji pada Netlify sebenar, Safari/iPhone sebenar, telefon Android sebenar,
controller fizikal atau mikrofon sebenar. Audit ini tidak menggantikan playtest title → ending
dengan input biasa. Surat `LETTER` dalam `game/src/content/ending.ts` masih dilabel draf;
semak kandungannya sebelum hadiah.

## Apa yang perlu commit

| Fail/folder | Sebab |
|---|---|
| `game/src/`, `game/public/`, `game/index.html` | Semua kod dan **aset runtime**, termasuk GLB, sprite, kad, strip, muzik, ikon dan manifest. Jangan ignore `public/` walaupun ia hasil eksport. |
| `game/package.json`, `game/package-lock.json`, `game/tsconfig.json`, `game/vite.config.ts` | Build boleh diulang pada mesin baru. |
| `game/.gitignore`, `game/.nvmrc`, `game/serve.mjs`, `game/README.md` | Konfigurasi Node dan arahan local/tunnel. |
| `.gitignore`, `netlify.toml`, `AGENTS.md`, `CLAUDE.md`, `GAME_VISION.md`, `docs/` | Konfigurasi deployment serta keputusan projek. |
| `pipeline/README.md`, `pipeline/tools/`, `pipeline/audit/`, `pipeline/tests/`, `pipeline/workflows/` | Kod exporter/workflow/audit, tanpa cache dan input gambar peribadi. |
| `music/README.md`, `music/cues.json`, `ref/ENDING_ART.md`, `.claude/skills/` | Metadata sumber dan panduan; bahan binari diarkib berasingan. |

**Ignore:** `node_modules/`, `dist/`, `.netlify/`, cache, log, `.env*`, folder credential/local agent,
`art/` (1.8 GB), `cards/`, `strip/`, gambar dalam `ref/`, MP3 sumber dalam `music/` dan
`pipeline/inputs/`. Peraturan sudah ditambah di `.gitignore` root. Fail tidak dipadam.

**Backup sumber seni secara berasingan sebelum bergantung pada repo ini.** Clone GitHub
boleh membina game daripada eksport committed, tetapi tidak boleh menjana semula semua seni
tanpa arkib sumber yang di-ignore. Pautan screenshot/prompt dalam docs mungkin merujuk arkib tersebut.
Jika mahu versioning seni penuh kemudian, gunakan arkib/repo seni atau Git LFS yang disengajakan.

Pengecualian masa depan: `ref/kad-rahsia.*` / `ref/tamat.*` boleh mengubah hasil build melalui
`import.meta.glob`. Tiada override tersebut semasa audit. Jika ditambah kelak, pindahkan art siap
ke runtime committed atau track override itu secara eksplisit supaya Netlify sama dengan local.

Metadata `.git` tidak tersedia dalam sesi agent ini (direktori kelihatan kosong), jadi status
tracked/staged/history/remote sebenar **tidak dapat disahkan**. `.gitignore` tidak mengeluarkan
fail yang sudah tracked. Semak dahulu dalam terminal IDE:

```bash
git status --short
git ls-files game/node_modules game/dist art cards strip ref music pipeline/inputs
git diff --check
```

Jika output kedua mengandungi bahan yang mahu di-ignore, keluarkan **laluan yang disahkan sahaja**
daripada index dengan `git rm --cached` (atau `-r --cached` untuk folder), sambil mengekalkan fail local.
Jangan jalankan pembersihan menyeluruh tanpa melihat senarai. Jika terminal sebenar mengesahkan
belum ada repo, barulah `git init -b main`.

Selepas isu release diselesaikan, stage dan review:

```bash
git add .gitignore netlify.toml AGENTS.md CLAUDE.md GAME_VISION.md docs game pipeline music ref/ENDING_ART.md .claude/skills
git diff --cached --stat
git diff --cached --check
git status --short
```

Cadangan: repo GitHub **private**, kerana kod/content/runtime sendiri mengandungi cerita dan
gambar peribadi. Ignore foto rujukan tidak menjadikan runtime anonim.

## GitHub → Netlify

`netlify.toml` root sudah menetapkan **base `game`**, **build `npm run build`**, **publish `dist`**
(iaitu `game/dist`), **Node 22**. Ini mengikuti
[tetapan base/publish Netlify](https://docs.netlify.com/build/configure-builds/overview/) dan
[panduan Vite](https://docs.netlify.com/build/frameworks/framework-setup-guides/vite/).

Selepas commit/push dan import repo dalam Netlify, guna konfigurasi tersebut. Tiada backend,
database, API key, ComfyUI atau server `serve.mjs` diperlukan di hosting. Jangan set `NODE_ENV=production`
untuk install yang mengecualikan devDependencies; compiler Vite/TypeScript diperlukan ketika build.

Tiada SPA rewrite ditambah kerana game hanya memakai URL root. Fail hilang patut kekal 404.
Tiada cache `immutable` menyeluruh pada `/assets/*`, kerana fail art mempunyai nama stabil.
Header `X-Robots-Tag: noindex, nofollow` ditambah; ia **bukan kawalan akses** untuk link peribadi.

Selepas preview HTTPS tersedia, semak: fresh game, Sambung selepas reload, semua boss,
Myvi/TV, phone portrait/landscape, bunyi selepas gesture, mic allow/deny/pending,
fallback lilin dan ending lengkap. Save localStorage milik origin browser: progress dari
domain tunnel lama tidak berpindah sendiri ke domain Netlify atau custom domain baharu.
