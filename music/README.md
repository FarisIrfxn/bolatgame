# BGM game

Lima MP3 dalam folder ini ialah **cover 8-bit yang Faris sediakan**. Tiada lagu
dijana atau ditranskripsi semula. Fail asal dikekalkan.

| Kegunaan | Lagu | Bahagian sumber |
|---|---|---|
| Title; Bowat, Blep, Bolat ex, finale | Joji — Gimme Love | 0:48.642–1:12.946, loop 24.304s |
| Snorlax Twin, Mega Bowat, Qish ex | Joji — SANCTUARY | 1:45.765–2:08.623, loop 22.857s |
| Overworld, termasuk bilik | Laufey — From The Start | Penuh 2:38.453; tamat → mula semula |
| Rhythm Bolat | Laufey — Lover Girl | 0:27.010–0:50.282; ulang dua kali, pusingan 46.545s |
| Kisah Kita → pengakuan → surat → kad ke-9 → Tamat | Bryant Barnes — I'd Rather Pretend | Fail penuh; loop jika ending belum selesai |
| Lilin | Happy Birthday | Melodi sintetik sedia ada dalam `game/src/core/sfx.ts` |

Pemilihan awal potongan berpandukan beat dan pengulangan dalam rakaman. Faris boleh
laras titik chorus selepas dengar dalam game: sunting `cues.json`, kemudian:

```bash
/mnt/storage/Projects/Comfy/.venv/bin/python pipeline/tools/prepare_music.py
cd game
npm run build
```

Skrip mengeksport `game/public/assets/music/` dan metadata/timing ke
`game/src/content/music.generated.json`. Tahap audio diselaraskan dengan gain
tetap, ada ruang untuk SFX, dan tepi chorus diberi fade 5ms supaya tidak berbunyi
klik. MP3 eksport diperiksa supaya tidak senyap atau clipping. Timing potongan
tidak berubah semasa encoding.

`Lover Girl` menggunakan grid half-time **82.5 BPM** (tempo penuh 165 BPM),
count-in empat beat, dan chart mudah yang berkongsi jam AudioContext dengan
audio. Jika mengubah mula potongan, kekalkan beat pertama di masa 0 atau laras
chart juga. Jika mengubah panjang potongan, kekalkan jumlah beat bulat supaya
ulangan kedua masih mengikut chart. `bars` ialah panjang keseluruhan pusingan
dalam bar half-time, termasuk kedua-dua ulangan, tidak termasuk count-in.

Lagu overworld meneruskan kedudukan semasa apabila tukar zon. Muzik busker/piano
sementara disenyapkan supaya melodi tidak berlaga dengan Laufey. Title mula
berbunyi selepas gesture pertama yang dibenarkan browser. Tab tersembunyi
menjeda audio; kembali ke tab menyambungnya. Audio boss berhenti ketika menang
atau skip. Lilin membatalkan semua nota Happy Birthday yang belum dimainkan
sebelum lagu ending bermula.

Audit browser: `node pipeline/audit/music.mjs` (dev server 5181). Semak isyarat
audio sebenar, loop, tukar zon, dua giliran Joji, rhythm dimainkan mengikut jam
audio, retry/skip, peralihan lilin/ending, touch dan fallback jika decode gagal.
Bukti: `art/music/qa/verification.json`.
