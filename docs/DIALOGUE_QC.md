# Semua dialog — senarai QC Pokélove Adventure

Snapshot sumber: **26 Oktober 2026**. Teks disalin daripada kod semasa, tanpa pembetulan ejaan atau penulisan semula.

Merangkumi dialog cerita, narator, papan tanda yang dibaca melalui dialog, chat telefon, pilihan jawapan, caption ending, surat, kad ke-9, mesej minigame dan belon dialog NPC. Teks hiasan pada tekstur/model dan teks yang hanya ada dalam imej kad fizikal tidak ditranskrip.

Ini inventori semua cabang yang ditulis dalam sumber, termasuk helper/fallback; bukan rakaman satu playthrough atau pengesahan bahawa setiap cabang masih boleh dicetuskan. Ayat sama pada lokasi berbeza dikekalkan. Placeholder surat juga dikekalkan.

Cara QC: tandakan kotak `☐`, rujuk ID apabila beri pembetulan (contoh `D0012: tukar ayat kepada ...`). Kolum **Konteks** menyimpan nama skrip, cabang dan lokasi kod. Ekspresi `normal` bermakna tiada ekspresi khusus ditetapkan; watak tanpa potret masih disenaraikan.

## Nilai dinamik

- `${got}`, `${need}`, `${need - got}` = bilangan item semasa / sasaran / baki. Sasaran: cookies 6, awan kentut 6, request 6, lily 6, tools 6, resit 7, strip terbang 6, pas paddock 6.
- `${found}` = petunjuk bilik yang diperiksa (daripada 3). `${kg}` = berat semasa, daripada 86.0kg ke 80.0kg.
- `${name}` / `${boss}` = nama boss. `${next}` = nama destinasi. `${BOOTH_NAMES[i]}` dan `${STRIP_STUDIOS[i]}` disenaraikan di bawah.
- Template battle `Qish guna ${m.name.toUpperCase()}!` dan `Raja Nonchalant guna ${mv.name}!` menggunakan nama move dalam bahagian finale. `m.text`, `mv.text` dan `mv.reply` merujuk teks move yang disenaraikan di situ.
- Indeks `[1]`, `[2]`, ... dalam tajuk QC bermula daripada 1 untuk senang dibaca; indeks array dalam kod bermula daripada 0. Syarat kod dikekalkan supaya cabang boleh dijejaki.

## Indeks

- [1. Mimpi sofa](#qc-1) — 18 entri
- [2. Bangun pagi](#qc-2) — 5 entri
- [3. Petunjuk bilik — pagi](#qc-3) — 15 entri
- [4. Tiga petunjuk lengkap](#qc-4) — 3 entri
- [5. Bangun semula — petang](#qc-5) — 6 entri
- [6. Petunjuk bilik — petang](#qc-6) — 10 entri
- [7. Petunjuk petang lengkap](#qc-7) — 2 entri
- [8. Tiba di parti](#qc-8) — 3 entri
- [9. Parti sedang menunggu](#qc-9) — 1 entri
- [10. Ulang sambutan](#qc-10) — 1 entri
- [11. Encik Sloth selepas parti](#qc-11) — 1 entri
- [12. Pintu bilik belum terbuka](#qc-12) — 2 entri
- [13. Konsol sebelum ending](#qc-13) — 2 entri
- [14. Menu konsol](#qc-14) — 1 entri
- [15. Petunjuk main semula](#qc-15) — 2 entri
- [16. Tanya lawan semula](#qc-16) — 1 entri
- [17. Menang lawan semula](#qc-17) — 1 entri
- [18. Jalan Sepang ditutup](#qc-18) — 3 entri
- [19. Tiba di Bukit Bintang](#qc-19) — 9 entri
- [20. Dapat pewangi lily](#qc-20) — 6 entri
- [21. Awan kentut tanpa pewangi](#qc-21) — 2 entri
- [22. Belanja keluarga shawarma](#qc-22) — 7 entri
- [23. Keluarga selepas dibelanja](#qc-23) — 2 entri
- [24. Tiba di Nyomnyom City](#qc-24) — 8 entri
- [25. Resit kedai Nyomnyom](#qc-25) — 31 entri
- [26. Tiba di Tasik Lily](#qc-26) — 3 entri
- [27. Naik sampan](#qc-27) — 1 entri
- [28. Tutorial sampan](#qc-28) — 3 entri
- [29. Tiba di Putrajaya](#qc-29) — 10 entri
- [30. Sasaran berat tercapai](#qc-30) — 5 entri
- [31. Belum cukup bersenam](#qc-31) — 2 entri
- [32. Penimbang Putrajaya](#qc-32) — 4 entri
- [33. Alat senaman](#qc-33) — 10 entri
- [34. Alat senaman sudah dibuat](#qc-34) — 1 entri
- [35. Senaman sudah cukup](#qc-35) — 1 entri
- [36. Teks turun berat (helper dalam kod)](#qc-36) — 1 entri
- [37. Interaksi map · Labu Lanjut](#qc-37) — 30 entri
- [38. Interaksi map · Bukit Bintang](#qc-38) — 37 entri
- [39. Interaksi map · KLIA](#qc-39) — 11 entri
- [40. Interaksi map · Nyomnyom City](#qc-40) — 44 entri
- [41. Interaksi map · Tasik Lily](#qc-41) — 54 entri
- [42. Interaksi map · Lorbel](#qc-42) — 47 entri
- [43. Interaksi map · Lorong Photobooth](#qc-43) — 21 entri
- [44. Interaksi map · Putrajaya](#qc-44) — 17 entri
- [45. Interaksi map · Litar Sepang](#qc-45) — 40 entri
- [46. Booth rekaan](#qc-46) — 12 entri
- [47. Tiba di Lorong Photobooth](#qc-47) — 5 entri
- [48. Bergambar](#qc-48) — 2 entri
- [49. Selepas bergambar](#qc-49) — 5 entri
- [50. Booth sebenar](#qc-50) — 2 entri
- [51. Photo strip](#qc-51) — 2 entri
- [52. Myvi — zon lain belum dibuka](#qc-52) — 2 entri
- [53. Menu Myvi](#qc-53) — 1 entri
- [54. Jalan terkunci](#qc-54) — 2 entri
- [55. Misi koleksi · Bukit Bintang](#qc-55) — 12 entri
- [56. Misi koleksi · Labu Lanjut](#qc-56) — 9 entri
- [57. Misi koleksi · KLIA](#qc-57) — 7 entri
- [58. Misi koleksi · Nyomnyom City](#qc-58) — 6 entri
- [59. Misi koleksi · Lorbel](#qc-59) — 7 entri
- [60. Misi koleksi · Tasik Lily](#qc-60) — 6 entri
- [61. Misi koleksi · Litar Sepang](#qc-61) — 7 entri
- [62. Misi koleksi · Lorong Photobooth](#qc-62) — 7 entri
- [63. Babah di KLIA](#qc-63) — 36 entri
- [64. Blep sebelum kapal siap](#qc-64) — 2 entri
- [65. Boss sebelum koleksi cukup](#qc-65) — 2 entri
- [66. Skip minigame](#qc-66) — 1 entri
- [67. Boss · Bowat](#qc-67) — 17 entri
- [68. Boss · Bolat](#qc-68) — 15 entri
- [69. Boss · Snorlax Twin](#qc-69) — 15 entri
- [70. Boss · Blep](#qc-70) — 7 entri
- [71. Boss · Mega Bowat](#qc-71) — 26 entri
- [72. Boss · Bolat ex](#qc-72) — 16 entri
- [73. Boss · Qish ex](#qc-73) — 11 entri
- [74. Boss · Raja Nonchalant](#qc-74) — 8 entri
- [75. Tiba di Litar Sepang](#qc-75) — 8 entri
- [76. Ambil enam pas paddock](#qc-76) — 35 entri
- [77. VIP — pas belum cukup](#qc-77) — 3 entri
- [78. VIP dibuka](#qc-78) — 4 entri
- [79. VIP selepas dibuka](#qc-79) — 2 entri
- [80. Garaj pasukan F1](#qc-80) — 14 entri
- [81. Dialog sambutan birthday](#qc-81) — 7 entri
- [82. Pengakuan Faris](#qc-82) — 6 entri
- [83. Telefon Qish](#qc-83) — 13 entri
- [84. Nama booth sebenar](#qc-84) — 7 entri
- [85. Studio bagi 10 photo strip](#qc-85) — 10 entri
- [86. Banner birthday](#qc-86) — 1 entri
- [87. Kisah Kita — 9 memori](#qc-87) — 11 entri
- [88. Surat Faris](#qc-88) — 3 entri
- [89. Kad rahsia ke-9](#qc-89) — 6 entri
- [90. Tamat](#qc-90) — 3 entri
- [91. Pilihan jawapan pemain](#qc-91) — 9 entri
- [92. Minigame / teks babak · finaleBattle](#qc-92) — 47 entri
- [93. Minigame / teks babak · blepShooter](#qc-93) — 10 entri
- [94. Minigame / teks babak · bolatRhythm](#qc-94) — 20 entri
- [95. Minigame / teks babak · bolatexMemory](#qc-95) — 8 entri
- [96. Minigame / teks babak · bowatBeach](#qc-96) — 12 entri
- [97. Minigame / teks babak · framework](#qc-97) — 3 entri
- [98. Minigame / teks babak · megaBowatFlappy](#qc-98) — 9 entri
- [99. Minigame / teks babak · registry](#qc-99) — 40 entri
- [100. Minigame / teks babak · qishRunner](#qc-100) — 9 entri
- [101. Minigame / teks babak · snorlaxCatcher](#qc-101) — 15 entri
- [102. Minigame / teks babak · dream](#qc-102) — 3 entri
- [103. Minigame / teks babak · cake](#qc-103) — 2 entri
- [104. Minigame / teks babak · ending](#qc-104) — 8 entri
- [105. Minigame / teks babak · cardReveal](#qc-105) — 6 entri
- [106. Minigame / teks babak · phone](#qc-106) — 4 entri
- [107. Dialog rawak NPC · bintangProps](#qc-107) — 29 entri
- [108. Dialog rawak NPC · cosyPlace](#qc-108) — 22 entri
- [109. Dialog rawak NPC · lorbelProps](#qc-109) — 47 entri
- [110. Dialog rawak NPC · nyomShops](#qc-110) — 10 entri
- [111. Dialog rawak NPC · putrajayaProps](#qc-111) — 30 entri
- [112. Dialog rawak NPC · tasikProps](#qc-112) — 5 entri
- [113. Dialog rawak NPC · zones](#qc-113) — 98 entri

<a id="qc-1"></a>

## 1. Mimpi sofa

| QC / ID | Watak / jenis | Dialog asal | Ekspresi | Konteks / sumber |
|---|---|---|---|---|
| ☐ D0001 | Bolat (mimpi) | Sayang, nanti kita pergi photobooth lagi nak? | normal | DREAM[1] · [script.ts:12](/mnt/storage/qish/game/src/content/script.ts:12) |
| ☐ D0002 | Faris | Boleh je. | normal | DREAM[2] · [script.ts:13](/mnt/storage/qish/game/src/content/script.ts:13) |
| ☐ D0003 | Bolat (mimpi) | Yeay! Kali ni kita buat pose comel-comel tau. Lepas tu makan malatang! | normal | DREAM[3] · [script.ts:14](/mnt/storage/qish/game/src/content/script.ts:14) |
| ☐ D0004 | Faris | Hmm. | normal | DREAM[4] · [script.ts:15](/mnt/storage/qish/game/src/content/script.ts:15) |
| ☐ A0001 | Aksi babak | [Faris cubit perut Bolat] | — | DREAM[5] · Urutan aksi dalam DREAM. · [script.ts:16](/mnt/storage/qish/game/src/content/script.ts:16) |
| ☐ D0005 | Bolat (mimpi) | ADUH! Kenapa cubit perut saya?? | normal | DREAM[6] · [script.ts:17](/mnt/storage/qish/game/src/content/script.ts:17) |
| ☐ D0006 | Faris | Gebu. | normal | DREAM[7] · [script.ts:18](/mnt/storage/qish/game/src/content/script.ts:18) |
| ☐ D0007 | Bolat (mimpi) | ...Awak cakap saya gemuk ke? | normal | DREAM[8] · [script.ts:19](/mnt/storage/qish/game/src/content/script.ts:19) |
| ☐ D0008 | Faris | Alamak. | normal | DREAM[9] · [script.ts:20](/mnt/storage/qish/game/src/content/script.ts:20) |
| ☐ A0002 | Aksi babak | [Bolat merajuk] | — | DREAM[10] · Urutan aksi dalam DREAM. · [script.ts:21](/mnt/storage/qish/game/src/content/script.ts:21) |
| ☐ D0009 | Bolat (mimpi) | Hmph. Saya merajuk. | normal | DREAM[11] · [script.ts:22](/mnt/storage/qish/game/src/content/script.ts:22) |
| ☐ D0010 | Narator | ... | normal | DREAM[12] · [script.ts:23](/mnt/storage/qish/game/src/content/script.ts:23) |
| ☐ D0011 | Bolat (mimpi) | Saya. Merajuk. Ni. Pujuk la! | normal | DREAM[13] · [script.ts:24](/mnt/storage/qish/game/src/content/script.ts:24) |
| ☐ D0012 | Faris | k bye | normal | DREAM[14] · [script.ts:25](/mnt/storage/qish/game/src/content/script.ts:25) |
| ☐ A0003 | Aksi babak | [Faris pergi] | — | DREAM[15] · Urutan aksi dalam DREAM. · [script.ts:26](/mnt/storage/qish/game/src/content/script.ts:26) |
| ☐ D0013 | Bolat (mimpi) | ...Sayang? | normal | DREAM[16] · [script.ts:27](/mnt/storage/qish/game/src/content/script.ts:27) |
| ☐ A0004 | Aksi babak | [Bolat menangis] | — | DREAM[17] · Urutan aksi dalam DREAM. · [script.ts:28](/mnt/storage/qish/game/src/content/script.ts:28) |
| ☐ D0014 | Bolat (mimpi) | SAYANG!! | normal | DREAM[18] · [script.ts:29](/mnt/storage/qish/game/src/content/script.ts:29) |

<a id="qc-2"></a>

## 2. Bangun pagi

| QC / ID | Watak / jenis | Dialog asal | Ekspresi | Konteks / sumber |
|---|---|---|---|---|
| ☐ D0015 | Qish | !! | surprised | WAKE[1] · [script.ts:34](/mnt/storage/qish/game/src/content/script.ts:34) |
| ☐ D0016 | Qish | ...Mimpi je rupanya. | sad | WAKE[2] · [script.ts:35](/mnt/storage/qish/game/src/content/script.ts:35) |
| ☐ D0017 | Qish | Eh, bantal saya basah. Saya menangis betul-betul ke tadi? | sad | WAKE[3] · [script.ts:36](/mnt/storage/qish/game/src/content/script.ts:36) |
| ☐ D0018 | Qish | Kejap. Bilik ni rasa lain macam. Macam ada benda hilang... | thinking | WAKE[4] · [script.ts:37](/mnt/storage/qish/game/src/content/script.ts:37) |
| ☐ D0019 | Narator | Jalan-jalan dalam bilik dan cari apa yang hilang. Tekan A dekat tanda ? untuk tengok. | normal | WAKE[5] · [script.ts:38](/mnt/storage/qish/game/src/content/script.ts:38) |

<a id="qc-3"></a>

## 3. Petunjuk bilik — pagi

| QC / ID | Watak / jenis | Dialog asal | Ekspresi | Konteks / sumber |
|---|---|---|---|---|
| ☐ D0020 | Qish | Bowat? BOWAT?! | surprised | CLUE_TALK.bowat[1] · [script.ts:63](/mnt/storage/qish/game/src/content/script.ts:63) |
| ☐ D0021 | Qish | Dia selalu tidur sebelah saya. Tinggal lekuk kat bantal je. | sad | CLUE_TALK.bowat[2] · [script.ts:64](/mnt/storage/qish/game/src/content/script.ts:64) |
| ☐ D0022 | Narator | Ada bau kentut senyap lagi. Dia tak pergi jauh. | normal | CLUE_TALK.bowat[3] · [script.ts:65](/mnt/storage/qish/game/src/content/script.ts:65) |
| ☐ D0023 | Qish | Bantal Bowat kosong. Dia lagi suka ikut saya ke mana-mana sekarang. | happy | CLUE_TALK.bowatAfter[1] · [script.ts:67](/mnt/storage/qish/game/src/content/script.ts:67) |
| ☐ D0024 | Qish | Gambar photobooth kita... semua hilang?! | surprised | CLUE_TALK.strips[1] · [script.ts:69](/mnt/storage/qish/game/src/content/script.ts:69) |
| ☐ D0025 | Qish | Sepuluh-sepuluh. Tinggal pin je. | sad | CLUE_TALK.strips[2] · [script.ts:70](/mnt/storage/qish/game/src/content/script.ts:70) |
| ☐ D0026 | Qish | Siapa yang sanggup curi kenangan orang ni?? | angry | CLUE_TALK.strips[3] · [script.ts:71](/mnt/storage/qish/game/src/content/script.ts:71) |
| ☐ D0027 | Qish | Tinggal pin je. Mana la gambar-gambar tu pergi... | sad | CLUE_TALK.stripsStill[1] · [script.ts:73](/mnt/storage/qish/game/src/content/script.ts:73) |
| ☐ D0028 | Qish | Semua strip dah balik. Cukup sepuluh. | happy | CLUE_TALK.stripsBack[1] · [script.ts:75](/mnt/storage/qish/game/src/content/script.ts:75) |
| ☐ D0029 | Narator | Bolat ex hantar balik elok-elok, siap susun ikut tarikh. | normal | CLUE_TALK.stripsBack[2] · [script.ts:76](/mnt/storage/qish/game/src/content/script.ts:76) |
| ☐ D0030 | Qish | Last seen semalam. Mesej saya satu tick je. | sad | CLUE_TALK.faris[1] · [script.ts:79](/mnt/storage/qish/game/src/content/script.ts:79) |
| ☐ D0031 | Qish | "k bye" je dia cakap...? | sad | CLUE_TALK.faris[2] · [script.ts:80](/mnt/storage/qish/game/src/content/script.ts:80) |
| ☐ D0032 | Qish | Kejap. Tu betul-betul jadi ke, atau mimpi? | thinking | CLUE_TALK.faris[3] · [script.ts:81](/mnt/storage/qish/game/src/content/script.ts:81) |
| ☐ D0033 | Qish | Masih satu tick. Faris ni... | pout | CLUE_TALK.farisStill[1] · [script.ts:83](/mnt/storage/qish/game/src/content/script.ts:83) |
| ☐ D0034 | Qish | "keluar kejap". Dia memang malas taip panjang. Tapi kali ni berbaloi. | love | CLUE_TALK.farisFound[1] · [script.ts:84](/mnt/storage/qish/game/src/content/script.ts:84) |

<a id="qc-4"></a>

## 4. Tiga petunjuk lengkap

| QC / ID | Watak / jenis | Dialog asal | Ekspresi | Konteks / sumber |
|---|---|---|---|---|
| ☐ D0035 | Qish | Bowat hilang. Gambar kita hilang. Faris pun hilang. | worried | ALL_CLUES[1] · [script.ts:88](/mnt/storage/qish/game/src/content/script.ts:88) |
| ☐ D0036 | Qish | Okay. Saya takkan duduk diam. Saya pergi cari semua! | excited | ALL_CLUES[2] · [script.ts:89](/mnt/storage/qish/game/src/content/script.ts:89) |
| ☐ D0037 | Narator | Pintu bilik kat sebelah kanan. | normal | ALL_CLUES[3] · [script.ts:90](/mnt/storage/qish/game/src/content/script.ts:90) |

<a id="qc-5"></a>

## 5. Bangun semula — petang

| QC / ID | Watak / jenis | Dialog asal | Ekspresi | Konteks / sumber |
|---|---|---|---|---|
| ☐ D0038 | Qish | ...! | surprised | WAKE_AGAIN[1] · [script.ts:95](/mnt/storage/qish/game/src/content/script.ts:95) |
| ☐ D0039 | Qish | Dah petang?! Saya tidur sepanjang hari ke?? | surprised | WAKE_AGAIN[2] · [script.ts:96](/mnt/storage/qish/game/src/content/script.ts:96) |
| ☐ D0040 | Qish | Pulau tu, Raja Nonchalant, kad-kad tu... semua mimpi je ke? | thinking | WAKE_AGAIN[3] · [script.ts:97](/mnt/storage/qish/game/src/content/script.ts:97) |
| ☐ D0041 | Qish | ... | sad | WAKE_AGAIN[4] · [script.ts:98](/mnt/storage/qish/game/src/content/script.ts:98) |
| ☐ D0042 | Qish | Faris still takde. Bowat pun takde. | sad | WAKE_AGAIN[5] · [script.ts:99](/mnt/storage/qish/game/src/content/script.ts:99) |
| ☐ D0043 | Narator | Bilik ni masih sunyi. Tengok sekeliling dulu. | normal | WAKE_AGAIN[6] · [script.ts:100](/mnt/storage/qish/game/src/content/script.ts:100) |

<a id="qc-6"></a>

## 6. Petunjuk bilik — petang

| QC / ID | Watak / jenis | Dialog asal | Ekspresi | Konteks / sumber |
|---|---|---|---|---|
| ☐ D0044 | Qish | Bantal Bowat masih kosong... | sad | WAKE_TALK.bowat[1] · [script.ts:105](/mnt/storage/qish/game/src/content/script.ts:105) |
| ☐ D0045 | Qish | Awak pergi mana, Bowat... | cry | WAKE_TALK.bowat[2] · [script.ts:106](/mnt/storage/qish/game/src/content/script.ts:106) |
| ☐ D0046 | Qish | Bowat masih takde... | sad | WAKE_TALK.bowatAgain[1] · [script.ts:108](/mnt/storage/qish/game/src/content/script.ts:108) |
| ☐ D0047 | Qish | Eh? | surprised | WAKE_TALK.strips[1] · [script.ts:110](/mnt/storage/qish/game/src/content/script.ts:110) |
| ☐ D0048 | Qish | Gambar photobooth kita... semua dah ada balik! | excited | WAKE_TALK.strips[2] · [script.ts:111](/mnt/storage/qish/game/src/content/script.ts:111) |
| ☐ D0049 | Qish | Cukup sepuluh. Siapa yang gantung ni? | thinking | WAKE_TALK.strips[3] · [script.ts:112](/mnt/storage/qish/game/src/content/script.ts:112) |
| ☐ D0050 | Qish | Sepuluh-sepuluh ada. Macam tak pernah hilang. | happy | WAKE_TALK.stripsAgain[1] · [script.ts:114](/mnt/storage/qish/game/src/content/script.ts:114) |
| ☐ D0051 | Qish | "keluar kejap"...? | thinking | WAKE_TALK.faris[1] · [script.ts:116](/mnt/storage/qish/game/src/content/script.ts:116) |
| ☐ D0052 | Qish | Dia tunggu kat luar?? | surprised | WAKE_TALK.faris[2] · [script.ts:117](/mnt/storage/qish/game/src/content/script.ts:117) |
| ☐ D0053 | Qish | "saya tunggu kat luar". Okay okay! | excited | WAKE_TALK.farisAgain[1] · [script.ts:119](/mnt/storage/qish/game/src/content/script.ts:119) |

<a id="qc-7"></a>

## 7. Petunjuk petang lengkap

| QC / ID | Watak / jenis | Dialog asal | Ekspresi | Konteks / sumber |
|---|---|---|---|---|
| ☐ D0054 | Qish | Bowat takde. Tapi gambar kita dah balik. Dan Faris... tunggu kat luar. | happy | WAKE_ALL[1] · [script.ts:123](/mnt/storage/qish/game/src/content/script.ts:123) |
| ☐ D0055 | Qish | Okay. Jom keluar! | excited | WAKE_ALL[2] · [script.ts:124](/mnt/storage/qish/game/src/content/script.ts:124) |

<a id="qc-8"></a>

## 8. Tiba di parti

| QC / ID | Watak / jenis | Dialog asal | Ekspresi | Konteks / sumber |
|---|---|---|---|---|
| ☐ D0056 | Qish | Eh...?! | surprised | PARTY_ARRIVE[1] · [script.ts:129](/mnt/storage/qish/game/src/content/script.ts:129) |
| ☐ D0057 | Qish | Belon? Kek? ...Semua orang? | surprised | PARTY_ARRIVE[2] · [script.ts:130](/mnt/storage/qish/game/src/content/script.ts:130) |
| ☐ D0058 | Narator | Semua orang tengah tunggu awak. | normal | PARTY_ARRIVE[3] · [script.ts:131](/mnt/storage/qish/game/src/content/script.ts:131) |

<a id="qc-9"></a>

## 9. Parti sedang menunggu

| QC / ID | Watak / jenis | Dialog asal | Ekspresi | Konteks / sumber |
|---|---|---|---|---|
| ☐ D0059 | Qish | Faris suruh keluar je, bukan pergi jauh. Semua tengah tunggu kat padang tepi rumah. | normal | PARTY_WAITING[1] · [script.ts:135](/mnt/storage/qish/game/src/content/script.ts:135) |

<a id="qc-10"></a>

## 10. Ulang sambutan

| QC / ID | Watak / jenis | Dialog asal | Ekspresi | Konteks / sumber |
|---|---|---|---|---|
| ☐ D0060 | Faris | Nak sambut sekali lagi? | normal | PARTY_AGAIN · [script.ts:138](/mnt/storage/qish/game/src/content/script.ts:138) |

<a id="qc-11"></a>

## 11. Encik Sloth selepas parti

| QC / ID | Watak / jenis | Dialog asal | Ekspresi | Konteks / sumber |
|---|---|---|---|---|
| ☐ D0061 | Encik Sloth | Party paling best tahun ni. Bowat dah kentut tiga kali. | laugh | PARTY_SLOTH[1] · [script.ts:139](/mnt/storage/qish/game/src/content/script.ts:139) |

<a id="qc-12"></a>

## 12. Pintu bilik belum terbuka

| QC / ID | Watak / jenis | Dialog asal | Ekspresi | Konteks / sumber |
|---|---|---|---|---|
| ☐ D0062 | Qish | Kejap. Ada benda tak kena dalam bilik ni... (${found}/3) | thinking | doorNotYet[1] · [script.ts:142](/mnt/storage/qish/game/src/content/script.ts:142) |
| ☐ D0063 | Narator | Cari semua tanda ? dulu. | normal | doorNotYet[2] · [script.ts:143](/mnt/storage/qish/game/src/content/script.ts:143) |

<a id="qc-13"></a>

## 13. Konsol sebelum ending

| QC / ID | Watak / jenis | Dialog asal | Ekspresi | Konteks / sumber |
|---|---|---|---|---|
| ☐ D0064 | Qish | Konsol game. Teringat main Roblox dengan GTA dengan Faris. | happy | CONSOLE_BEFORE[1] · [script.ts:147](/mnt/storage/qish/game/src/content/script.ts:147) |
| ☐ D0065 | Qish | Tapi Player 2 takde hari ni... | sad | CONSOLE_BEFORE[2] · [script.ts:148](/mnt/storage/qish/game/src/content/script.ts:148) |

<a id="qc-14"></a>

## 14. Menu konsol

| QC / ID | Watak / jenis | Dialog asal | Ekspresi | Konteks / sumber |
|---|---|---|---|---|
| ☐ D0066 | Qish | Nak lawan boss mana lagi? | smug | CONSOLE_ASK · [script.ts:150](/mnt/storage/qish/game/src/content/script.ts:150) |

<a id="qc-15"></a>

## 15. Petunjuk main semula

| QC / ID | Watak / jenis | Dialog asal | Ekspresi | Konteks / sumber |
|---|---|---|---|---|
| ☐ D0067 | Narator | Semua boss dah boleh dilawan semula! | normal | REPLAY_HINT[1] · [script.ts:154](/mnt/storage/qish/game/src/content/script.ts:154) |
| ☐ D0068 | Narator | Jumpa dia orang kat zon masing-masing, atau guna konsol game dalam bilik Qish. | normal | REPLAY_HINT[2] · [script.ts:155](/mnt/storage/qish/game/src/content/script.ts:155) |

<a id="qc-16"></a>

## 16. Tanya lawan semula

| QC / ID | Watak / jenis | Dialog asal | Ekspresi | Konteks / sumber |
|---|---|---|---|---|
| ☐ D0069 | Qish | Lawan ${name} sekali lagi? | smug | replayAsk · [script.ts:158](/mnt/storage/qish/game/src/content/script.ts:158) |

<a id="qc-17"></a>

## 17. Menang lawan semula

| QC / ID | Watak / jenis | Dialog asal | Ekspresi | Konteks / sumber |
|---|---|---|---|---|
| ☐ D0070 | Narator | Menang lagi lawan ${name}! Kad dia dah lama ada dalam koleksi awak. | normal | replayWin[1] · [script.ts:159](/mnt/storage/qish/game/src/content/script.ts:159) |

<a id="qc-18"></a>

## 18. Jalan Sepang ditutup

| QC / ID | Watak / jenis | Dialog asal | Ekspresi | Konteks / sumber |
|---|---|---|---|---|
| ☐ D0071 | Narator | Jalan ke Litar Sepang ditutup. Ada papan: "JALAN DITUTUP. Raja Nonchalant sedang malas." | normal | ROAD_CLOSED[1] · [script.ts:162](/mnt/storage/qish/game/src/content/script.ts:162) |
| ☐ D0072 | Qish | Raja Nonchalant? Siapa pulak tu... | thinking | ROAD_CLOSED[2] · [script.ts:163](/mnt/storage/qish/game/src/content/script.ts:163) |
| ☐ D0073 | Narator | Ikut jalan kampung ke Bukit Bintang dulu. | normal | ROAD_CLOSED[3] · [script.ts:164](/mnt/storage/qish/game/src/content/script.ts:164) |

<a id="qc-19"></a>

## 19. Tiba di Bukit Bintang

| QC / ID | Watak / jenis | Dialog asal | Ekspresi | Konteks / sumber |
|---|---|---|---|---|
| ☐ D0074 | Narator | Qish naik tangga stesen MRT. Bunyi bandar terus menyerbu. | normal | BB_ARRIVE[1] · [script.ts:169](/mnt/storage/qish/game/src/content/script.ts:169) |
| ☐ D0075 | Qish | Bukit Bintang! Skrin besar, monorel, scramble... | excited | BB_ARRIVE[2] · [script.ts:170](/mnt/storage/qish/game/src/content/script.ts:170) |
| ☐ D0076 | Orang ramai | LARIII!! BUSUK!! | normal | BB_ARRIVE[3] · [script.ts:171](/mnt/storage/qish/game/src/content/script.ts:171) |
| ☐ D0077 | Qish | ...Eh? Kenapa semua orang lari? | surprised | BB_ARRIVE[4] · [script.ts:172](/mnt/storage/qish/game/src/content/script.ts:172) |
| ☐ D0078 | Qish | UHUK! BAU APA NI?! | angry | BB_ARRIVE[5] · [script.ts:173](/mnt/storage/qish/game/src/content/script.ts:173) |
| ☐ D0079 | Narator | Awan kentut hijau bersepah satu Bukit Bintang. Kereta berhenti. Orang tutup hidung, lari tak tentu arah. | normal | BB_ARRIVE[6] · [script.ts:174](/mnt/storage/qish/game/src/content/script.ts:174) |
| ☐ D0080 | Qish | Ni confirm Bowat. Bau dia saya kenal. | smug | BB_ARRIVE[7] · [script.ts:175](/mnt/storage/qish/game/src/content/script.ts:175) |
| ☐ D0081 | Qish | Kena cari pewangi. Kedai 24 jam tu mesti ada. | thinking | BB_ARRIVE[8] · [script.ts:176](/mnt/storage/qish/game/src/content/script.ts:176) |
| ☐ D0082 | Narator | Kedai 24 jam betul-betul sebelah stesen MRT ni (tanda "!"). | normal | BB_ARRIVE[9] · [script.ts:177](/mnt/storage/qish/game/src/content/script.ts:177) |

<a id="qc-20"></a>

## 20. Dapat pewangi lily

| QC / ID | Watak / jenis | Dialog asal | Ekspresi | Konteks / sumber |
|---|---|---|---|---|
| ☐ D0083 | Kak Kedai 24 Jam | Pewangi? Adik ni orang ke-200 tanya hari ni. | normal | BB_SPRAY[1] · [script.ts:182](/mnt/storage/qish/game/src/content/script.ts:182) |
| ☐ D0084 | Kak Kedai 24 Jam | Tinggal satu je. Perisa... Bunga Lily. | normal | BB_SPRAY[2] · [script.ts:183](/mnt/storage/qish/game/src/content/script.ts:183) |
| ☐ D0085 | Qish | Bunga favourite saya! Ambil! | excited | BB_SPRAY[3] · [script.ts:184](/mnt/storage/qish/game/src/content/script.ts:184) |
| ☐ D0086 | Kak Kedai 24 Jam | Tadi ada lelaki rambut kerinting datang, dah bayarkan untuk 'perempuan comel yang akan cari pewangi'. Free. | normal | BB_SPRAY[4] · [script.ts:185](/mnt/storage/qish/game/src/content/script.ts:185) |
| ☐ D0087 | Qish | ...Siapa dia ni sebenarnya. | thinking | BB_SPRAY[5] · [script.ts:186](/mnt/storage/qish/game/src/content/script.ts:186) |
| ☐ D0088 | Narator | Dapat Pewangi Bunga Lily! Jalan masuk dalam awan kentut untuk sembur. | normal | BB_SPRAY[6] · [script.ts:187](/mnt/storage/qish/game/src/content/script.ts:187) |

<a id="qc-21"></a>

## 21. Awan kentut tanpa pewangi

| QC / ID | Watak / jenis | Dialog asal | Ekspresi | Konteks / sumber |
|---|---|---|---|---|
| ☐ D0089 | Qish | UHUK UHUK! Tak boleh, busuk gila! | angry | CLOUD_NO_SPRAY[1] · [script.ts:192](/mnt/storage/qish/game/src/content/script.ts:192) |
| ☐ D0090 | Narator | Kena ada pewangi dulu. Cuba kedai 24 jam sebelah stesen MRT Labu Lanjut. | normal | CLOUD_NO_SPRAY[2] · [script.ts:193](/mnt/storage/qish/game/src/content/script.ts:193) |

<a id="qc-22"></a>

## 22. Belanja keluarga shawarma

| QC / ID | Watak / jenis | Dialog asal | Ekspresi | Konteks / sumber |
|---|---|---|---|---|
| ☐ D0091 | Narator | Satu keluarga duduk atas kotak, tepi kedai yang dah tutup. Budak kecil tu tengok kedai shawarma. | normal | BB_FAMILY[1] · [script.ts:198](/mnt/storage/qish/game/src/content/script.ts:198) |
| ☐ D0092 | Qish | Pakcik, makcik, dah makan? | worried | BB_FAMILY[2] · [script.ts:199](/mnt/storage/qish/game/src/content/script.ts:199) |
| ☐ D0093 | Pakcik | Belum lagi, adik. Tak apa. | normal | BB_FAMILY[3] · [script.ts:200](/mnt/storage/qish/game/src/content/script.ts:200) |
| ☐ D0094 | Qish | Jap ye. | happy | BB_FAMILY[4] · [script.ts:201](/mnt/storage/qish/game/src/content/script.ts:201) |
| ☐ D0095 | Narator | Qish pergi ke kedai shawarma dan beli tiga. Abang Shawarma bagi diskaun tanpa diminta. | normal | BB_FAMILY[5] · [script.ts:202](/mnt/storage/qish/game/src/content/script.ts:202) |
| ☐ D0096 | Pakcik | Terima kasih, adik. Semoga Allah murahkan rezeki adik. | normal | BB_FAMILY[6] · [script.ts:203](/mnt/storage/qish/game/src/content/script.ts:203) |
| ☐ D0097 | Qish | Sama-sama. Makan elok-elok ye. | happy | BB_FAMILY[7] · [script.ts:204](/mnt/storage/qish/game/src/content/script.ts:204) |

<a id="qc-23"></a>

## 23. Keluarga selepas dibelanja

| QC / ID | Watak / jenis | Dialog asal | Ekspresi | Konteks / sumber |
|---|---|---|---|---|
| ☐ D0098 | Pakcik | Terima kasih lagi sekali, adik. Anak saya suka sangat. | normal | BB_FAMILY_AFTER[1] · [script.ts:207](/mnt/storage/qish/game/src/content/script.ts:207) |
| ☐ D0099 | Narator | (Budak tu dah comot dengan sos. Dia senyum lebar.) | normal | BB_FAMILY_AFTER[2] · [script.ts:208](/mnt/storage/qish/game/src/content/script.ts:208) |

<a id="qc-24"></a>

## 24. Tiba di Nyomnyom City

| QC / ID | Watak / jenis | Dialog asal | Ekspresi | Konteks / sumber |
|---|---|---|---|---|
| ☐ D0100 | Narator | Nyomnyom City. Bandar makanan, bulat macam pizza. | normal | NYOM_ARRIVE[1] · [script.ts:215](/mnt/storage/qish/game/src/content/script.ts:215) |
| ☐ D0101 | Qish | Wah... bau semua benda sedap. Kek mango... ayam gepuk... daging salai... | love | NYOM_ARRIVE[2] · [script.ts:216](/mnt/storage/qish/game/src/content/script.ts:216) |
| ☐ D0102 | Bowat | *sniff sniff* | sniff | NYOM_ARRIVE[3] · [script.ts:217](/mnt/storage/qish/game/src/content/script.ts:217) |
| ☐ D0103 | Bowat | ...NYOM NYOM. | nyom | NYOM_ARRIVE[4] · [script.ts:218](/mnt/storage/qish/game/src/content/script.ts:218) |
| ☐ D0104 | Qish | Bowat? Bowat, jangan— | surprised | NYOM_ARRIVE[5] · [script.ts:219](/mnt/storage/qish/game/src/content/script.ts:219) |
| ☐ D0105 | Narator | Bowat dah lesap. Dari jauh kedengaran: "SATU KEK MANGO! MAKAN SINI!" | normal | NYOM_ARRIVE[6] · [script.ts:220](/mnt/storage/qish/game/src/content/script.ts:220) |
| ☐ D0106 | Qish | BOWAT!! Awak mana ada duit!! | angry | NYOM_ARRIVE[7] · [script.ts:221](/mnt/storage/qish/game/src/content/script.ts:221) |
| ☐ D0107 | Narator | Kejar Bowat. Setiap kedai yang dia tinggalkan, bayar resit dia. | normal | NYOM_ARRIVE[8] · [script.ts:222](/mnt/storage/qish/game/src/content/script.ts:222) |

<a id="qc-25"></a>

## 25. Resit kedai Nyomnyom

| QC / ID | Watak / jenis | Dialog asal | Ekspresi | Konteks / sumber |
|---|---|---|---|---|
| ☐ D0108 | Kak Kek Mango | Adik! Sloth kelabu tu kawan adik ke? | normal | RESIT_TALK[1][1] · [script.ts:228](/mnt/storage/qish/game/src/content/script.ts:228) |
| ☐ D0109 | Kak Kek Mango | Dia makan SEBIJI kek mango. Sebiji. Guna tangan. Lepas tu jilat pinggan. | normal | RESIT_TALK[1][2] · [script.ts:229](/mnt/storage/qish/game/src/content/script.ts:229) |
| ☐ D0110 | Qish | ...Berapa kak? | worried | RESIT_TALK[1][3] · [script.ts:230](/mnt/storage/qish/game/src/content/script.ts:230) |
| ☐ D0111 | Kak Kek Mango | RM89. Pinggan tu akak halalkan. | normal | RESIT_TALK[1][4] · [script.ts:231](/mnt/storage/qish/game/src/content/script.ts:231) |
| ☐ D0112 | Qish | BOWAT!! | angry | RESIT_TALK[1][5] · [script.ts:232](/mnt/storage/qish/game/src/content/script.ts:232) |
| ☐ D0113 | Abang Gepuk | Sloth tu order level 10. LEVEL SEPULUH. | normal | RESIT_TALK[2][1] · [script.ts:235](/mnt/storage/qish/game/src/content/script.ts:235) |
| ☐ D0114 | Abang Gepuk | Dia tak menangis pun. Dia minta tambah sambal. | normal | RESIT_TALK[2][2] · [script.ts:236](/mnt/storage/qish/game/src/content/script.ts:236) |
| ☐ D0115 | Qish | ...Respect. | smug | RESIT_TALK[2][3] · [script.ts:237](/mnt/storage/qish/game/src/content/script.ts:237) |
| ☐ D0116 | Abang Gepuk | Tiga ekor ayam, RM42. Lesung pun dia jilat. | normal | RESIT_TALK[2][4] · [script.ts:238](/mnt/storage/qish/game/src/content/script.ts:238) |
| ☐ D0117 | Auntie Malatang | Your friend ah? The grey one? | normal | RESIT_TALK[3][1] · [script.ts:241](/mnt/storage/qish/game/src/content/script.ts:241) |
| ☐ D0118 | Auntie Malatang | He take the basket, put everything. Fishball, sotong, mushroom, all-all. | normal | RESIT_TALK[3][2] · [script.ts:242](/mnt/storage/qish/game/src/content/script.ts:242) |
| ☐ D0119 | Auntie Malatang | Weigh already: 2.8 kilo. The bowl ah, not him. RM56. | normal | RESIT_TALK[3][3] · [script.ts:243](/mnt/storage/qish/game/src/content/script.ts:243) |
| ☐ D0120 | Qish | Mangkuk dia lagi berat dari semua yang saya makan seminggu. | surprised | RESIT_TALK[3][4] · [script.ts:244](/mnt/storage/qish/game/src/content/script.ts:244) |
| ☐ D0121 | Abang Dubuyo | Kak, sloth tu ambil cabaran level 5. | normal | RESIT_TALK[4][1] · [script.ts:247](/mnt/storage/qish/game/src/content/script.ts:247) |
| ☐ D0122 | Abang Dubuyo | Habis. Kuah pun habis. Lepas tu dia minta level 6. Kitorang takde level 6! | normal | RESIT_TALK[4][2] · [script.ts:248](/mnt/storage/qish/game/src/content/script.ts:248) |
| ☐ D0123 | Qish | ...Dia okay ke? | worried | RESIT_TALK[4][3] · [script.ts:249](/mnt/storage/qish/game/src/content/script.ts:249) |
| ☐ D0124 | Abang Dubuyo | Dia okay. Tandas kitorang yang tak okay. RM38. | normal | RESIT_TALK[4][4] · [script.ts:250](/mnt/storage/qish/game/src/content/script.ts:250) |
| ☐ D0125 | Crew McD | Hi kak! Sloth tadi order kat drive-thru... jalan kaki. | normal | RESIT_TALK[5][1] · [script.ts:253](/mnt/storage/qish/game/src/content/script.ts:253) |
| ☐ D0126 | Crew McD | Big Mac tiga, fries large lima, McFlurry dua. Lepas tu dia tanya ada Happy Meal untuk sloth tak. | normal | RESIT_TALK[5][2] · [script.ts:254](/mnt/storage/qish/game/src/content/script.ts:254) |
| ☐ D0127 | Qish | Ada ke? | thinking | RESIT_TALK[5][3] · [script.ts:255](/mnt/storage/qish/game/src/content/script.ts:255) |
| ☐ D0128 | Crew McD | Takde. Tapi kitorang bagi jugak, sebab dia comel. RM71. | normal | RESIT_TALK[5][4] · [script.ts:256](/mnt/storage/qish/game/src/content/script.ts:256) |
| ☐ D0129 | Pakcik Salai | Kawan adik tu tidur dalam asap salai pakcik tadi. Lena betul. | normal | RESIT_TALK[6][1] · [script.ts:259](/mnt/storage/qish/game/src/content/script.ts:259) |
| ☐ D0130 | Pakcik Salai | Bangun-bangun, sekilo daging salai hilang. Masak lemak cili api pun licin. | normal | RESIT_TALK[6][2] · [script.ts:260](/mnt/storage/qish/game/src/content/script.ts:260) |
| ☐ D0131 | Qish | Daging salai favourite saya tu!! Dia tak tinggal sikit pun? | pout | RESIT_TALK[6][3] · [script.ts:261](/mnt/storage/qish/game/src/content/script.ts:261) |
| ☐ D0132 | Pakcik Salai | Takde. Tapi pakcik bungkuskan sikit untuk adik. Yang tu free. RM35 je yang dia makan. | normal | RESIT_TALK[6][4] · [script.ts:262](/mnt/storage/qish/game/src/content/script.ts:262) |
| ☐ D0133 | Qish | Pakcik... terima kasih. 🥹 | love | RESIT_TALK[6][5] · [script.ts:263](/mnt/storage/qish/game/src/content/script.ts:263) |
| ☐ D0134 | Kak Cookies | Dia masuk, tengok semua balang, lepas tu peluk balang paling besar. | normal | RESIT_TALK[7][1] · [script.ts:266](/mnt/storage/qish/game/src/content/script.ts:266) |
| ☐ D0135 | Kak Cookies | Lepas tu dia jerit "MAKAN BANYAK" dan... dia makan banyak. | normal | RESIT_TALK[7][2] · [script.ts:267](/mnt/storage/qish/game/src/content/script.ts:267) |
| ☐ D0136 | Qish | Itu move dia. Memang tertulis kat kad dia. | smug | RESIT_TALK[7][3] · [script.ts:268](/mnt/storage/qish/game/src/content/script.ts:268) |
| ☐ D0137 | Kak Cookies | 40 ketul, RM60. Dia lari ke tengah bandar sambil kunyah. Ke Cosy Place. | normal | RESIT_TALK[7][4] · [script.ts:269](/mnt/storage/qish/game/src/content/script.ts:269) |
| ☐ D0138 | Qish | Cosy Place...? Tempat first date saya dengan Faris. | love | RESIT_TALK[7][5] · [script.ts:270](/mnt/storage/qish/game/src/content/script.ts:270) |

<a id="qc-26"></a>

## 26. Tiba di Tasik Lily

| QC / ID | Watak / jenis | Dialog asal | Ekspresi | Konteks / sumber |
|---|---|---|---|---|
| ☐ D0139 | Qish | Wah, tasik! Ramai gila orang picnic. | excited | TASIK_ARRIVE[1] · [script.ts:275](/mnt/storage/qish/game/src/content/script.ts:275) |
| ☐ D0140 | Qish | Eh... bunga lily! Penuh atas air. Bunga favourite saya! | excited | TASIK_ARRIVE[2] · [script.ts:276](/mnt/storage/qish/game/src/content/script.ts:276) |
| ☐ D0141 | Narator | Hari ni Tasik Lily memang penuh dengan lily. Kebetulan je. Kot. | normal | TASIK_ARRIVE[3] · [script.ts:277](/mnt/storage/qish/game/src/content/script.ts:277) |

<a id="qc-27"></a>

## 27. Naik sampan

| QC / ID | Watak / jenis | Dialog asal | Ekspresi | Konteks / sumber |
|---|---|---|---|---|
| ☐ D0142 | Qish | Naik sampan? | happy | SAMPAN_ASK · [script.ts:280](/mnt/storage/qish/game/src/content/script.ts:280) |

<a id="qc-28"></a>

## 28. Tutorial sampan

| QC / ID | Watak / jenis | Dialog asal | Ekspresi | Konteks / sumber |
|---|---|---|---|---|
| ☐ D0143 | Narator | Dayung guna anak panah atau joystick. Lalu dekat lily untuk petik. | normal | SAMPAN_TIP[1] · [script.ts:282](/mnt/storage/qish/game/src/content/script.ts:282) |
| ☐ D0144 | Narator | Nak turun, dayung balik ke jeti. | normal | SAMPAN_TIP[2] · [script.ts:283](/mnt/storage/qish/game/src/content/script.ts:283) |
| ☐ D0145 | Bowat | *terus baring dalam sampan* Zzz... | sleepy | SAMPAN_TIP[3] · [script.ts:284](/mnt/storage/qish/game/src/content/script.ts:284) |

<a id="qc-29"></a>

## 29. Tiba di Putrajaya

| QC / ID | Watak / jenis | Dialog asal | Ekspresi | Konteks / sumber |
|---|---|---|---|---|
| ☐ D0146 | Narator | Putrajaya. Petang-petang macam ni, satu Putrajaya keluar jogging. | normal | PJ_ARRIVE[1] · [script.ts:288](/mnt/storage/qish/game/src/content/script.ts:288) |
| ☐ D0147 | Qish | Ramainya orang jogging... | surprised | PJ_ARRIVE[2] · [script.ts:289](/mnt/storage/qish/game/src/content/script.ts:289) |
| ☐ D0148 | Qish | ...Alamak. Hari ni saya tak jogging lagi. | worried | PJ_ARRIVE[3] · [script.ts:290](/mnt/storage/qish/game/src/content/script.ts:290) |
| ☐ D0149 | Qish | Dah la tadi kat Tasik Lily makan macam Snorlax. | shy | PJ_ARRIVE[4] · [script.ts:291](/mnt/storage/qish/game/src/content/script.ts:291) |
| ☐ D0150 | Narator | Ada penimbang 20 sen tepi jambatan. Qish naik. | normal | PJ_ARRIVE[5] · [script.ts:292](/mnt/storage/qish/game/src/content/script.ts:292) |
| ☐ D0151 | Papan tanda | ⚖️ 86.0kg | normal | PJ_ARRIVE[6] · [script.ts:293](/mnt/storage/qish/game/src/content/script.ts:293) |
| ☐ D0152 | Qish | LAPAN PULUH ENAM?! | surprised | PJ_ARRIVE[7] · [script.ts:294](/mnt/storage/qish/game/src/content/script.ts:294) |
| ☐ D0153 | Qish | Okay. Turun balik 80kg dulu. Baru boleh jumpa sesiapa. | pout | PJ_ARRIVE[8] · [script.ts:295](/mnt/storage/qish/game/src/content/script.ts:295) |
| ☐ D0154 | Narator | Jogging keliling Putrajaya, dan cuba alat senaman kat Taman Kecergasan (kiri jambatan). | normal | PJ_ARRIVE[9] · [script.ts:296](/mnt/storage/qish/game/src/content/script.ts:296) |
| ☐ D0155 | Narator | Tip: jogging sebelah orang lain yang sama arah, berat turun dua kali ganda! | normal | PJ_ARRIVE[10] · [script.ts:297](/mnt/storage/qish/game/src/content/script.ts:297) |

<a id="qc-30"></a>

## 30. Sasaran berat tercapai

| QC / ID | Watak / jenis | Dialog asal | Ekspresi | Konteks / sumber |
|---|---|---|---|---|
| ☐ D0156 | Papan tanda | ⚖️ 80.0kg | normal | PJ_DONE[1] · [script.ts:302](/mnt/storage/qish/game/src/content/script.ts:302) |
| ☐ D0157 | Qish | YES! Balik 80kg! Peluh pun dah macam air terjun. | excited | PJ_DONE[2] · [script.ts:303](/mnt/storage/qish/game/src/content/script.ts:303) |
| ☐ D0158 | ??? | FAT ASS! | normal | PJ_DONE[3] · [script.ts:304](/mnt/storage/qish/game/src/content/script.ts:304) |
| ☐ D0159 | Qish | ...Eh? Suara siapa tu? Dari arah garisan START... | surprised | PJ_DONE[4] · [script.ts:305](/mnt/storage/qish/game/src/content/script.ts:305) |
| ☐ D0160 | Narator | Pergi ke garisan START, depan bulatan Dataran Putra! | normal | PJ_DONE[5] · [script.ts:306](/mnt/storage/qish/game/src/content/script.ts:306) |

<a id="qc-31"></a>

## 31. Belum cukup bersenam

| QC / ID | Watak / jenis | Dialog asal | Ekspresi | Konteks / sumber |
|---|---|---|---|---|
| ☐ D0161 | Qish | Belum habis warm up. Berat sekarang ${kg}, kena turun sampai 80kg dulu. | worried | pjNotReady[1] · [script.ts:310](/mnt/storage/qish/game/src/content/script.ts:310) |
| ☐ D0162 | Narator | Jogging keliling Putrajaya, atau guna alat senaman kat Taman Kecergasan. | normal | pjNotReady[2] · [script.ts:311](/mnt/storage/qish/game/src/content/script.ts:311) |

<a id="qc-32"></a>

## 32. Penimbang Putrajaya

| QC / ID | Watak / jenis | Dialog asal | Ekspresi | Konteks / sumber |
|---|---|---|---|---|
| ☐ D0163 | Papan tanda | ⚖️ 80.0kg | normal | pjScale[1] · done · [script.ts:317](/mnt/storage/qish/game/src/content/script.ts:317) |
| ☐ D0164 | Qish | Lapan puluh. Cantik. Jangan sesiapa sentuh penimbang ni. | smug | pjScale[2] · done · [script.ts:318](/mnt/storage/qish/game/src/content/script.ts:318) |
| ☐ D0165 | Papan tanda | ⚖️ ${kg} | normal | pjScale[1] · bukan done · [script.ts:321](/mnt/storage/qish/game/src/content/script.ts:321) |
| ☐ D0166 | Qish | Okay, okay. Turun lagi sikit. | worried | pjScale[2] · bukan done · [script.ts:322](/mnt/storage/qish/game/src/content/script.ts:322) |

<a id="qc-33"></a>

## 33. Alat senaman

| QC / ID | Watak / jenis | Dialog asal | Ekspresi | Konteks / sumber |
|---|---|---|---|---|
| ☐ D0167 | Qish · soalan pilihan | Naik air walker? | normal | GYM_TALK[1].ask · [script.ts:328](/mnt/storage/qish/game/src/content/script.ts:328) |
| ☐ D0168 | Narator | Hayun kaki macam jalan atas angin! Tekan A berulang-ulang. | normal | GYM_TALK[1].start[1] · [script.ts:329](/mnt/storage/qish/game/src/content/script.ts:329) |
| ☐ D0169 | Qish | Rasa macam terbang. Tapi kaki macam jeli. | laugh | GYM_TALK[1].done[1] · [script.ts:330](/mnt/storage/qish/game/src/content/script.ts:330) |
| ☐ D0170 | Qish · soalan pilihan | Cuba palang tarik? | normal | GYM_TALK[2].ask · [script.ts:333](/mnt/storage/qish/game/src/content/script.ts:333) |
| ☐ D0171 | Narator | Tarik badan sampai dagu lepas palang! Tekan A berulang-ulang. | normal | GYM_TALK[2].start[1] · [script.ts:334](/mnt/storage/qish/game/src/content/script.ts:334) |
| ☐ D0172 | Qish | LAPAN! Siapa kata saya tak boleh pull up? | smug | GYM_TALK[2].done[1] · [script.ts:336](/mnt/storage/qish/game/src/content/script.ts:336) |
| ☐ D0173 | Qish | ...Okay, separuh tu saya lompat. Tapi kira la. | shy | GYM_TALK[2].done[2] · [script.ts:337](/mnt/storage/qish/game/src/content/script.ts:337) |
| ☐ D0174 | Qish · soalan pilihan | Buat sit-up? | normal | GYM_TALK[3].ask · [script.ts:341](/mnt/storage/qish/game/src/content/script.ts:341) |
| ☐ D0175 | Narator | Sit-up! Tekan A berulang-ulang. | normal | GYM_TALK[3].start[1] · [script.ts:342](/mnt/storage/qish/game/src/content/script.ts:342) |
| ☐ D0176 | Qish | Perut saya terbakar. Ni semua sebab Faris cubit perut saya semalam. | pout | GYM_TALK[3].done[1] · [script.ts:343](/mnt/storage/qish/game/src/content/script.ts:343) |

<a id="qc-34"></a>

## 34. Alat senaman sudah dibuat

| QC / ID | Watak / jenis | Dialog asal | Ekspresi | Konteks / sumber |
|---|---|---|---|---|
| ☐ D0177 | Qish | Dah buat yang ni. Badan saya cakap tak nak. | sleepy | GYM_AGAIN[1] · [script.ts:347](/mnt/storage/qish/game/src/content/script.ts:347) |

<a id="qc-35"></a>

## 35. Senaman sudah cukup

| QC / ID | Watak / jenis | Dialog asal | Ekspresi | Konteks / sumber |
|---|---|---|---|---|
| ☐ D0178 | Qish | Dah 80kg. Cukup la senam hari ni. | happy | GYM_ENOUGH[1] · [script.ts:348](/mnt/storage/qish/game/src/content/script.ts:348) |

<a id="qc-36"></a>

## 36. Teks turun berat (helper dalam kod)

| QC / ID | Watak / jenis | Dialog asal | Ekspresi | Konteks / sumber |
|---|---|---|---|---|
| ☐ D0179 | Papan tanda | ⚖️ ${kg} (-1.0kg!) | normal | gymBurn[1] · [script.ts:349](/mnt/storage/qish/game/src/content/script.ts:349) |

<a id="qc-37"></a>

## 37. Interaksi map · Labu Lanjut

| QC / ID | Watak / jenis | Dialog asal | Ekspresi | Konteks / sumber |
|---|---|---|---|---|
| ☐ D0180 | Encik Sloth | Pagi, Qish. Mata bengkak ni, menangis ke? | worried | ZONE_TALK.labulanjut:slothBefore[1] · [script.ts:354](/mnt/storage/qish/game/src/content/script.ts:354) |
| ☐ D0181 | Qish | Mana ada! ...Encik Sloth ada nampak Faris tak? Dengan Bowat? | shy | ZONE_TALK.labulanjut:slothBefore[2] · [script.ts:355](/mnt/storage/qish/game/src/content/script.ts:355) |
| ☐ D0182 | Encik Sloth | Faris? Tak nampak pulak. | smug | ZONE_TALK.labulanjut:slothBefore[3] · [script.ts:356](/mnt/storage/qish/game/src/content/script.ts:356) |
| ☐ D0183 | Encik Sloth | Tapi tadi ada sloth kelabu gemuk lari ikut jalan kampung, ke arah Bukit Bintang. Kentut sepanjang jalan. | deadpan | ZONE_TALK.labulanjut:slothBefore[4] · [script.ts:357](/mnt/storage/qish/game/src/content/script.ts:357) |
| ☐ D0184 | Qish | BOWAT!! | angry | ZONE_TALK.labulanjut:slothBefore[5] · [script.ts:358](/mnt/storage/qish/game/src/content/script.ts:358) |
| ☐ D0185 | Encik Sloth | Sambil makan cookies. Bersepah satu kampung. Ikut je jejak cookies tu. | sleepy | ZONE_TALK.labulanjut:slothBefore[6] · [script.ts:359](/mnt/storage/qish/game/src/content/script.ts:359) |
| ☐ D0186 | Encik Sloth | Bowat dah jumpa? Bagus, bagus. | happy | ZONE_TALK.labulanjut:slothAfter[1] · [script.ts:362](/mnt/storage/qish/game/src/content/script.ts:362) |
| ☐ D0187 | Encik Sloth | Faris tu memang macam tu. Tak pandai cakap, terus lari. | sleepy | ZONE_TALK.labulanjut:slothAfter[2] · [script.ts:363](/mnt/storage/qish/game/src/content/script.ts:363) |
| ☐ D0188 | Encik Sloth | Tapi saya rasa dia takkan pergi jauh dari awak. | wink | ZONE_TALK.labulanjut:slothAfter[3] · [script.ts:364](/mnt/storage/qish/game/src/content/script.ts:364) |
| ☐ D0189 | Bowat | *kentut senyap* | relief | ZONE_TALK.labulanjut:slothAfter[4] · [script.ts:365](/mnt/storage/qish/game/src/content/script.ts:365) |
| ☐ D0190 | Encik Sloth | ...Bowat. | deadpan | ZONE_TALK.labulanjut:slothAfter[5] · [script.ts:366](/mnt/storage/qish/game/src/content/script.ts:366) |
| ☐ D0191 | Papan tanda | Labu Lanjut, Sepang | normal | ZONE_TALK.labulanjut:sign[1] · [script.ts:369](/mnt/storage/qish/game/src/content/script.ts:369) |
| ☐ D0192 | Narator | Kampung halaman Sepang Baddie. | normal | ZONE_TALK.labulanjut:sign[2] · [script.ts:370](/mnt/storage/qish/game/src/content/script.ts:370) |
| ☐ D0193 | Narator | Kucing oren tidur atas bumbung Myvi. Lagi. | normal | ZONE_TALK.labulanjut:cat[1] · [script.ts:373](/mnt/storage/qish/game/src/content/script.ts:373) |
| ☐ D0194 | Qish | Weh. Myvi saya bukan katil awak. | pout | ZONE_TALK.labulanjut:cat[2] · [script.ts:374](/mnt/storage/qish/game/src/content/script.ts:374) |
| ☐ D0195 | Narator | (Kucing tu tak peduli langsung.) | normal | ZONE_TALK.labulanjut:cat[3] · [script.ts:375](/mnt/storage/qish/game/src/content/script.ts:375) |
| ☐ D0196 | Qish | Tudung saya dah kering. Baju hitam pun. | happy | ZONE_TALK.labulanjut:clothes[1] · [script.ts:378](/mnt/storage/qish/game/src/content/script.ts:378) |
| ☐ D0197 | Narator | Angin Labu Lanjut: dryer paling murah kat Malaysia. | normal | ZONE_TALK.labulanjut:clothes[2] · [script.ts:379](/mnt/storage/qish/game/src/content/script.ts:379) |
| ☐ D0198 | Narator | Kedai runcit kampung. Aiskrim, roti, gas, semua ada. | normal | ZONE_TALK.labulanjut:kedai[1] · [script.ts:382](/mnt/storage/qish/game/src/content/script.ts:382) |
| ☐ D0199 | Qish | Nanti la beli aiskrim. Cari Bowat dulu. | thinking | ZONE_TALK.labulanjut:kedai[2] · [script.ts:383](/mnt/storage/qish/game/src/content/script.ts:383) |
| ☐ D0200 | Qish | Wakaf ni best untuk lepak petang-petang. | happy | ZONE_TALK.labulanjut:wakaf[1] · [script.ts:386](/mnt/storage/qish/game/src/content/script.ts:386) |
| ☐ D0201 | Narator | (Tapi sekarang bukan masa lepak.) | normal | ZONE_TALK.labulanjut:wakaf[2] · [script.ts:387](/mnt/storage/qish/game/src/content/script.ts:387) |
| ☐ D0202 | Qish | Kucing! Banyak gila kat padang ni. | excited | ZONE_TALK.labulanjut:cats[1] · [script.ts:390](/mnt/storage/qish/game/src/content/script.ts:390) |
| ☐ D0203 | Narator | Kucing kampung semua lepak sini. Ada yang kejar ekor sendiri sampai pening. | normal | ZONE_TALK.labulanjut:cats[2] · [script.ts:391](/mnt/storage/qish/game/src/content/script.ts:391) |
| ☐ D0204 | Qish | Okay okay, comel. Fokus. | laugh | ZONE_TALK.labulanjut:cats[3] · [script.ts:392](/mnt/storage/qish/game/src/content/script.ts:392) |
| ☐ D0205 | Qish | Buaian... Kalau baring kejap, confirm tertidur sampai petang. | sleepy | ZONE_TALK.labulanjut:hammock[1] · [script.ts:395](/mnt/storage/qish/game/src/content/script.ts:395) |
| ☐ D0206 | Narator | (Snorlax Twin approved.) | normal | ZONE_TALK.labulanjut:hammock[2] · [script.ts:396](/mnt/storage/qish/game/src/content/script.ts:396) |
| ☐ D0207 | Qish | ...Tak boleh. Bukan sekarang. | pout | ZONE_TALK.labulanjut:hammock[3] · [script.ts:397](/mnt/storage/qish/game/src/content/script.ts:397) |
| ☐ D0208 | Qish | Fuh. Jalan sikit pun dah penat. Confirm saya dah 80kg. | sleepy | ZONE_TALK.labulanjut:bench[1] · [script.ts:400](/mnt/storage/qish/game/src/content/script.ts:400) |
| ☐ D0209 | Narator | (Tak. Awak tiny.) | normal | ZONE_TALK.labulanjut:bench[2] · [script.ts:401](/mnt/storage/qish/game/src/content/script.ts:401) |

<a id="qc-38"></a>

## 38. Interaksi map · Bukit Bintang

| QC / ID | Watak / jenis | Dialog asal | Ekspresi | Konteks / sumber |
|---|---|---|---|---|
| ☐ D0210 | Papan tanda | 📸 SPOT GAMBAR | normal | ZONE_TALK.sunway:view[1] · [script.ts:404](/mnt/storage/qish/game/src/content/script.ts:404) |
| ☐ D0211 | Qish | Dari sini nampak semua: scramble, skrin gergasi, KLCC, Menara KL, Merdeka 118. | happy | ZONE_TALK.sunway:view[2] · [script.ts:405](/mnt/storage/qish/game/src/content/script.ts:405) |
| ☐ D0212 | Qish | Kalau Faris ada, mesti dia ambil gambar saya dengan sudut paling tak flattering. | smug | ZONE_TALK.sunway:view[3] · [script.ts:406](/mnt/storage/qish/game/src/content/script.ts:406) |
| ☐ D0213 | Narator | (Kalau tak kira bau kentut, view ni memang 10/10.) | normal | ZONE_TALK.sunway:view[4] · [script.ts:407](/mnt/storage/qish/game/src/content/script.ts:407) |
| ☐ D0214 | Kak Kedai 24 Jam | Pewangi dah habis, dik. Satu KL datang beli hari ni. | normal | ZONE_TALK.sunway:kedai24[1] · [script.ts:410](/mnt/storage/qish/game/src/content/script.ts:410) |
| ☐ D0215 | Kak Kedai 24 Jam | Tapi ada aiskrim. Nak? | normal | ZONE_TALK.sunway:kedai24[2] · [script.ts:411](/mnt/storage/qish/game/src/content/script.ts:411) |
| ☐ D0216 | Qish | Nanti la, kak. Hehe. | happy | ZONE_TALK.sunway:kedai24[3] · [script.ts:412](/mnt/storage/qish/game/src/content/script.ts:412) |
| ☐ D0217 | Abang Shawarma | Shawarma! Ayam, daging, campur! Tambah keju RM2! | normal | ZONE_TALK.sunway:shawarma[1] · [script.ts:415](/mnt/storage/qish/game/src/content/script.ts:415) |
| ☐ D0218 | Qish | Bau shawarma ni la satu-satunya bau yang mampu lawan bau kentut Bowat. | smug | ZONE_TALK.sunway:shawarma[2] · [script.ts:416](/mnt/storage/qish/game/src/content/script.ts:416) |
| ☐ D0219 | Abang Shawarma | Abang tak lari tadi. Abang tahan nafas tiga minit. Bisnes tetap bisnes. | normal | ZONE_TALK.sunway:shawarma[3] · [script.ts:417](/mnt/storage/qish/game/src/content/script.ts:417) |
| ☐ D0220 | Orang ramai | Urut kaki, kakak? Refleksologi! Murah, murah! | normal | ZONE_TALK.sunway:urut[1] · [script.ts:420](/mnt/storage/qish/game/src/content/script.ts:420) |
| ☐ D0221 | Qish | Lain kali. Kaki saya kena jalan cari Bowat dulu. | happy | ZONE_TALK.sunway:urut[2] · [script.ts:421](/mnt/storage/qish/game/src/content/script.ts:421) |
| ☐ D0222 | Qish | Mamak 24 jam. Roti telur dengan teh tarik kurang manis... | love | ZONE_TALK.sunway:mamak[1] · [script.ts:424](/mnt/storage/qish/game/src/content/script.ts:424) |
| ☐ D0223 | Narator | (Qish kuatkan semangat dan jalan terus.) | normal | ZONE_TALK.sunway:mamak[2] · [script.ts:425](/mnt/storage/qish/game/src/content/script.ts:425) |
| ☐ D0224 | Qish | Skrin besar gila. Macam Times Square versi KL. | surprised | ZONE_TALK.sunway:screen[1] · [script.ts:428](/mnt/storage/qish/game/src/content/script.ts:428) |
| ☐ D0225 | Qish | Eh, lagu Laufey! Joji pun ada. Siapa yang pilih playlist ni? Taste dia sama macam saya. | excited | ZONE_TALK.sunway:screen[2] · [script.ts:429](/mnt/storage/qish/game/src/content/script.ts:429) |
| ☐ D0226 | Narator | (Hmm. Siapa agaknya.) | normal | ZONE_TALK.sunway:screen[3] · [script.ts:430](/mnt/storage/qish/game/src/content/script.ts:430) |
| ☐ D0227 | Papan tanda | Monorel KL · Stesen Bukit Bintang | normal | ZONE_TALK.sunway:monorel[1] · [script.ts:433](/mnt/storage/qish/game/src/content/script.ts:433) |
| ☐ D0228 | Qish | Monorel lalu atas kepala. Wuuush. Comel je bentuk dia, macam ulat bulu. | happy | ZONE_TALK.sunway:monorel[2] · [script.ts:434](/mnt/storage/qish/game/src/content/script.ts:434) |
| ☐ D0229 | Orang ramai | Burger daging special! Telur bungkus! | normal | ZONE_TALK.sunway:burger[1] · [script.ts:437](/mnt/storage/qish/game/src/content/script.ts:437) |
| ☐ D0230 | Qish | Kenapa semua benda kat Bukit Bintang ni bau sedap... kecuali satu. | pout | ZONE_TALK.sunway:burger[2] · [script.ts:438](/mnt/storage/qish/game/src/content/script.ts:438) |
| ☐ D0231 | Abang Vinyl | Selamat datang ke Piring Hitam! Nak cari apa? | normal | ZONE_TALK.sunway:vinyl[1] · [script.ts:441](/mnt/storage/qish/game/src/content/script.ts:441) |
| ☐ D0232 | Qish | Laufey ada? Joji? Bryant Barnes? Malcolm Todd? | excited | ZONE_TALK.sunway:vinyl[2] · [script.ts:442](/mnt/storage/qish/game/src/content/script.ts:442) |
| ☐ D0233 | Abang Vinyl | Semua ada. Tapi tadi ada orang beli satu set semua tu sekali gus. | normal | ZONE_TALK.sunway:vinyl[3] · [script.ts:443](/mnt/storage/qish/game/src/content/script.ts:443) |
| ☐ D0234 | Abang Vinyl | Rambut kerinting. Tak cakap banyak. Bayar, angguk, blah. | normal | ZONE_TALK.sunway:vinyl[4] · [script.ts:444](/mnt/storage/qish/game/src/content/script.ts:444) |
| ☐ D0235 | Qish | ...Faris?! | surprised | ZONE_TALK.sunway:vinyl[5] · [script.ts:445](/mnt/storage/qish/game/src/content/script.ts:445) |
| ☐ D0236 | Abang Vinyl | Dia tak cakap nama. Dia cakap 'k' je. | normal | ZONE_TALK.sunway:vinyl[6] · [script.ts:446](/mnt/storage/qish/game/src/content/script.ts:446) |
| ☐ D0237 | Qish | Kedai gitar. Ukulele kuning tu comel. | happy | ZONE_TALK.sunway:gitar[1] · [script.ts:449](/mnt/storage/qish/game/src/content/script.ts:449) |
| ☐ D0238 | Narator | (Satu lagi hobi yang Faris akan beli peralatan dan tak pernah guna.) | normal | ZONE_TALK.sunway:gitar[2] · [script.ts:450](/mnt/storage/qish/game/src/content/script.ts:450) |
| ☐ D0239 | Qish | Busker Bintang! Sedap suara akak tu. | happy | ZONE_TALK.sunway:busker[1] · [script.ts:453](/mnt/storage/qish/game/src/content/script.ts:453) |
| ☐ D0240 | Narator | Qish masukkan seringgit dalam beg gitar. Request: lagu sedih tapi happy. | normal | ZONE_TALK.sunway:busker[2] · [script.ts:454](/mnt/storage/qish/game/src/content/script.ts:454) |
| ☐ D0241 | Qish | Okay tu bukan request. Tu perasaan saya hari ni. | sad | ZONE_TALK.sunway:busker[3] · [script.ts:455](/mnt/storage/qish/game/src/content/script.ts:455) |
| ☐ D0242 | Papan tanda | ZON MOTOSIKAL | normal | ZONE_TALK.sunway:moto[1] · [script.ts:458](/mnt/storage/qish/game/src/content/script.ts:458) |
| ☐ D0243 | Qish | Motor penuh sebaris. Semua orang datang Bukit Bintang naik motor ke? | thinking | ZONE_TALK.sunway:moto[2] · [script.ts:459](/mnt/storage/qish/game/src/content/script.ts:459) |
| ☐ D0244 | Papan tanda | Piano Jalanan ♪ Pijak kekunci untuk main! | normal | ZONE_TALK.sunway:piano[1] · [script.ts:462](/mnt/storage/qish/game/src/content/script.ts:462) |
| ☐ D0245 | Qish | Ooh! Macam dalam movie Big tu. Jom main. | excited | ZONE_TALK.sunway:piano[2] · [script.ts:463](/mnt/storage/qish/game/src/content/script.ts:463) |
| ☐ D0246 | Qish | BUKIT BINTANG. Huruf warna-warni ni pun kena masuk gambar. | happy | ZONE_TALK.sunway:letters[1] · [script.ts:466](/mnt/storage/qish/game/src/content/script.ts:466) |

<a id="qc-39"></a>

## 39. Interaksi map · KLIA

| QC / ID | Watak / jenis | Dialog asal | Ekspresi | Konteks / sumber |
|---|---|---|---|---|
| ☐ D0247 | Papan tanda | BERLEPAS · DEPARTURES | normal | ZONE_TALK.angkasa:board[1] · [script.ts:469](/mnt/storage/qish/game/src/content/script.ts:469) |
| ☐ D0248 | Qish | Cosy Place, 08:08. Bukit Bintang, boarding... | thinking | ZONE_TALK.angkasa:board[2] · [script.ts:470](/mnt/storage/qish/game/src/content/script.ts:470) |
| ☐ D0249 | Qish | MALAS AIR: DELAYED. Lepas tu MALAS. Lepas tu TIDUR. Typical. | smug | ZONE_TALK.angkasa:board[3] · [script.ts:471](/mnt/storage/qish/game/src/content/script.ts:471) |
| ☐ D0250 | Qish | Eh, ada satu baris tulis... KEK MANGO? Gate 26, RAHSIA? | surprised | ZONE_TALK.angkasa:board[4] · [script.ts:472](/mnt/storage/qish/game/src/content/script.ts:472) |
| ☐ D0251 | Narator | Baris tu cepat-cepat bertukar balik. Macam ada orang panik. | normal | ZONE_TALK.angkasa:board[5] · [script.ts:473](/mnt/storage/qish/game/src/content/script.ts:473) |
| ☐ D0252 | Narator | KLIA. Dalam daerah Sepang, sebelah je Labu Lanjut. | normal | ZONE_TALK.angkasa:terminal[1] · [script.ts:476](/mnt/storage/qish/game/src/content/script.ts:476) |
| ☐ D0253 | Qish | Sepang Baddie represent. 😎 | smug | ZONE_TALK.angkasa:terminal[2] · [script.ts:477](/mnt/storage/qish/game/src/content/script.ts:477) |
| ☐ D0254 | Narator | Dalam terminal penuh orang tarik beg. Tapi Raja Nonchalant bukan kat dalam. Kapal dia dah kat langit. | normal | ZONE_TALK.angkasa:terminal[3] · [script.ts:478](/mnt/storage/qish/game/src/content/script.ts:478) |
| ☐ D0255 | Narator | Landasan 08/26. Kapal terbang berlepas dan mendarat tak berhenti-henti. | normal | ZONE_TALK.angkasa:runway[1] · [script.ts:481](/mnt/storage/qish/game/src/content/script.ts:481) |
| ☐ D0256 | Qish | 08... 26. Eh. 8.8 hari kita couple, 26 umur saya tahun ni. | love | ZONE_TALK.angkasa:runway[2] · [script.ts:482](/mnt/storage/qish/game/src/content/script.ts:482) |
| ☐ D0257 | Narator | Kebetulan je. Kot. | normal | ZONE_TALK.angkasa:runway[3] · [script.ts:483](/mnt/storage/qish/game/src/content/script.ts:483) |

<a id="qc-40"></a>

## 40. Interaksi map · Nyomnyom City

| QC / ID | Watak / jenis | Dialog asal | Ekspresi | Konteks / sumber |
|---|---|---|---|---|
| ☐ D0258 | Narator | Meja 8. Kain putih, lilin, dua kerusi baldu merah. Kad kecil: "Reserved · Meja 8 · Qish". | normal | ZONE_TALK.cosyplace:table[1] · [script.ts:487](/mnt/storage/qish/game/src/content/script.ts:487) |
| ☐ D0259 | Narator | Atas meja, dua pinggan lasagna. Masih panas. | normal | ZONE_TALK.cosyplace:table[2] · [script.ts:488](/mnt/storage/qish/game/src/content/script.ts:488) |
| ☐ D0260 | Qish | Lasagna... Kitorang makan lasagna kat sini masa first date. | love | ZONE_TALK.cosyplace:table[3] · [script.ts:489](/mnt/storage/qish/game/src/content/script.ts:489) |
| ☐ D0261 | Qish | Siapa yang tempah meja ni untuk saya? | thinking | ZONE_TALK.cosyplace:table[4] · [script.ts:490](/mnt/storage/qish/game/src/content/script.ts:490) |
| ☐ D0262 | Narator | Meja 8. Pinggan lasagna dah licin. Licin gila. Macam dijilat. | normal | ZONE_TALK.cosyplace:tableAfter[1] · [script.ts:493](/mnt/storage/qish/game/src/content/script.ts:493) |
| ☐ D0263 | Bowat | ...Bukan saya. | innocent | ZONE_TALK.cosyplace:tableAfter[2] · [script.ts:494](/mnt/storage/qish/game/src/content/script.ts:494) |
| ☐ D0264 | Papan tanda | NYOMNYOM CITY · Bandar paling kenyang kat pulau ni | normal | ZONE_TALK.cosyplace:arch[1] · [script.ts:497](/mnt/storage/qish/game/src/content/script.ts:497) |
| ☐ D0265 | Qish | Bandar dia bulat macam pizza. Jalan-jalan dia pun potong macam hirisan. | happy | ZONE_TALK.cosyplace:arch[2] · [script.ts:498](/mnt/storage/qish/game/src/content/script.ts:498) |
| ☐ D0266 | Qish | Okay, saya dah lapar. | happy | ZONE_TALK.cosyplace:arch[3] · [script.ts:499](/mnt/storage/qish/game/src/content/script.ts:499) |
| ☐ D0267 | Papan tanda | PETA NYOMNYOM: Kek Mango · Ayam Gepuk · Malatang · Dubuyo · McDonald's · Daging Salai · Cookies · Cosy Place (tengah) | normal | ZONE_TALK.cosyplace:peta[1] · [script.ts:502](/mnt/storage/qish/game/src/content/script.ts:502) |
| ☐ D0268 | Qish | Semua makanan favourite saya ada dalam satu bandar. Ni syurga ke? | love | ZONE_TALK.cosyplace:peta[2] · [script.ts:503](/mnt/storage/qish/game/src/content/script.ts:503) |
| ☐ D0269 | Narator | Ada tulisan kecil kat bawah: "Dilarang makan tak bayar. Termasuk sloth." | normal | ZONE_TALK.cosyplace:peta[3] · [script.ts:504](/mnt/storage/qish/game/src/content/script.ts:504) |
| ☐ D0270 | Narator | Qish naik atas penimbang malatang. | normal | ZONE_TALK.cosyplace:scale[1] · [script.ts:507](/mnt/storage/qish/game/src/content/script.ts:507) |
| ☐ D0271 | Papan tanda | 80.0kg | normal | ZONE_TALK.cosyplace:scale[2] · [script.ts:508](/mnt/storage/qish/game/src/content/script.ts:508) |
| ☐ D0272 | Qish | INI PENIMBANG MANGKUK!! Bukan untuk orang!! | angry | ZONE_TALK.cosyplace:scale[3] · [script.ts:509](/mnt/storage/qish/game/src/content/script.ts:509) |
| ☐ D0273 | Auntie Malatang | Ya lah, so you get down lah. | normal | ZONE_TALK.cosyplace:scale[4] · [script.ts:510](/mnt/storage/qish/game/src/content/script.ts:510) |
| ☐ D0274 | Maître d' | Bonsoir, mademoiselle. Selamat datang ke Cosy Place. | normal | ZONE_TALK.cosyplace:maitre[1] · [script.ts:513](/mnt/storage/qish/game/src/content/script.ts:513) |
| ☐ D0275 | Maître d' | Ah, Cik Qish. Ada tempahan atas nama cik. Meja 8. | normal | ZONE_TALK.cosyplace:maitre[2] · [script.ts:514](/mnt/storage/qish/game/src/content/script.ts:514) |
| ☐ D0276 | Qish | Tempahan? Saya tak tempah apa-apa pun. | thinking | ZONE_TALK.cosyplace:maitre[3] · [script.ts:515](/mnt/storage/qish/game/src/content/script.ts:515) |
| ☐ D0277 | Maître d' | Dibuat petang tadi oleh seorang encik. Rambut kerinting, nampak... sangat penat. | normal | ZONE_TALK.cosyplace:maitre[4] · [script.ts:516](/mnt/storage/qish/game/src/content/script.ts:516) |
| ☐ D0278 | Qish | FARIS?! Dia cakap apa? | surprised | ZONE_TALK.cosyplace:maitre[5] · [script.ts:517](/mnt/storage/qish/game/src/content/script.ts:517) |
| ☐ D0279 | Maître d' | Dia cakap... "k". | normal | ZONE_TALK.cosyplace:maitre[6] · [script.ts:518](/mnt/storage/qish/game/src/content/script.ts:518) |
| ☐ D0280 | Qish | ...Itu memang dia. | happy | ZONE_TALK.cosyplace:maitre[7] · [script.ts:519](/mnt/storage/qish/game/src/content/script.ts:519) |
| ☐ D0281 | Maître d' | Dia juga pesan lasagna. Dua pinggan. Silakan. | normal | ZONE_TALK.cosyplace:maitre[8] · [script.ts:520](/mnt/storage/qish/game/src/content/script.ts:520) |
| ☐ D0282 | Maître d' | Meja 8 sentiasa sedia untuk cik. Encik rambut kerinting dah bayar pun. | normal | ZONE_TALK.cosyplace:maitreAgain[1] · [script.ts:523](/mnt/storage/qish/game/src/content/script.ts:523) |
| ☐ D0283 | Narator | Pianist main waltz perlahan. Lilin-lilin bergoyang sikit ikut lagu. | normal | ZONE_TALK.cosyplace:piano[1] · [script.ts:526](/mnt/storage/qish/game/src/content/script.ts:526) |
| ☐ D0284 | Qish | Romantiknya. Faris kalau ada kat sini, mesti dah tertidur. | smug | ZONE_TALK.cosyplace:piano[2] · [script.ts:527](/mnt/storage/qish/game/src/content/script.ts:527) |
| ☐ D0285 | Narator | Dari pintu dapur keluar bau lasagna, steak dan garlic bread. | normal | ZONE_TALK.cosyplace:dapur[1] · [script.ts:530](/mnt/storage/qish/game/src/content/script.ts:530) |
| ☐ D0286 | Chef Cosy Place | Tetamu tak boleh masuk dapur, mademoiselle! | normal | ZONE_TALK.cosyplace:dapur[2] · [script.ts:531](/mnt/storage/qish/game/src/content/script.ts:531) |
| ☐ D0287 | Kak Kek Mango | Jemput dik! Kek mango baru keluar oven. | normal | ZONE_TALK.cosyplace:shop:kek[1] · [script.ts:534](/mnt/storage/qish/game/src/content/script.ts:534) |
| ☐ D0288 | Qish | Kek mango... kegemaran saya tu. Bau dia! | excited | ZONE_TALK.cosyplace:shop:kek[2] · [script.ts:535](/mnt/storage/qish/game/src/content/script.ts:535) |
| ☐ D0289 | Abang Gepuk | Level berapa dik? Satu sampai sepuluh. | normal | ZONE_TALK.cosyplace:shop:gepuk[1] · [script.ts:538](/mnt/storage/qish/game/src/content/script.ts:538) |
| ☐ D0290 | Qish | Saya orang Sepang. Awak rasa? | smug | ZONE_TALK.cosyplace:shop:gepuk[2] · [script.ts:539](/mnt/storage/qish/game/src/content/script.ts:539) |
| ☐ D0291 | Abang Gepuk | ...Sepuluh. Baik, puan. | normal | ZONE_TALK.cosyplace:shop:gepuk[3] · [script.ts:540](/mnt/storage/qish/game/src/content/script.ts:540) |
| ☐ D0292 | Auntie Malatang | Ambil mangkuk, pilih sendiri, timbang sini ya! | normal | ZONE_TALK.cosyplace:shop:malatang[1] · [script.ts:543](/mnt/storage/qish/game/src/content/script.ts:543) |
| ☐ D0293 | Qish | Malatang! Last time kitorang makan ni Faris ambil fishball je. | happy | ZONE_TALK.cosyplace:shop:malatang[2] · [script.ts:544](/mnt/storage/qish/game/src/content/script.ts:544) |
| ☐ D0294 | Abang Dubuyo | Annyeong! Cabaran level 5 hari ni. Habis, gambar free! | normal | ZONE_TALK.cosyplace:shop:dubuyo[1] · [script.ts:547](/mnt/storage/qish/game/src/content/script.ts:547) |
| ☐ D0295 | Qish | Dubuyo! Level 5 tu... nanti la. Lepas jumpa Faris. | happy | ZONE_TALK.cosyplace:shop:dubuyo[2] · [script.ts:548](/mnt/storage/qish/game/src/content/script.ts:548) |
| ☐ D0296 | Crew McD | Welcome to McDonald's! Nak upsize, kak? | normal | ZONE_TALK.cosyplace:shop:mcd[1] · [script.ts:551](/mnt/storage/qish/game/src/content/script.ts:551) |
| ☐ D0297 | Qish | Always upsize. | smug | ZONE_TALK.cosyplace:shop:mcd[2] · [script.ts:552](/mnt/storage/qish/game/src/content/script.ts:552) |
| ☐ D0298 | Pakcik Salai | Daging salai! Asap kayu getah, salai dari subuh, dik. | normal | ZONE_TALK.cosyplace:shop:salai[1] · [script.ts:555](/mnt/storage/qish/game/src/content/script.ts:555) |
| ☐ D0299 | Qish | Daging salai masak lemak cili api... ni makanan favourite saya! | love | ZONE_TALK.cosyplace:shop:salai[2] · [script.ts:556](/mnt/storage/qish/game/src/content/script.ts:556) |
| ☐ D0300 | Kak Cookies | Cookies baru keluar oven! Nak rasa satu? | normal | ZONE_TALK.cosyplace:shop:cookies[1] · [script.ts:559](/mnt/storage/qish/game/src/content/script.ts:559) |
| ☐ D0301 | Qish | Bowat mesti suka kedai ni. | happy | ZONE_TALK.cosyplace:shop:cookies[2] · [script.ts:560](/mnt/storage/qish/game/src/content/script.ts:560) |

<a id="qc-41"></a>

## 41. Interaksi map · Tasik Lily

| QC / ID | Watak / jenis | Dialog asal | Ekspresi | Konteks / sumber |
|---|---|---|---|---|
| ☐ D0302 | Papan tanda | TASIK LILY | normal | ZONE_TALK.dusun:sign[1] · [script.ts:564](/mnt/storage/qish/game/src/content/script.ts:564) |
| ☐ D0303 | Narator | Tasik paling tenang kat pulau ni. Hari ni penuh dengan lily. | normal | ZONE_TALK.dusun:sign[2] · [script.ts:565](/mnt/storage/qish/game/src/content/script.ts:565) |
| ☐ D0304 | Kak Batik | Batik lukis, dik! Hari ni semua orang lukis bunga lily. | normal | ZONE_TALK.dusun:batik[1] · [script.ts:568](/mnt/storage/qish/game/src/content/script.ts:568) |
| ☐ D0305 | Kak Batik | Canting ni isi lilin panas. Lukis garisan dulu, lepas tu baru warna. | normal | ZONE_TALK.dusun:batik[2] · [script.ts:569](/mnt/storage/qish/game/src/content/script.ts:569) |
| ☐ D0306 | Qish | Oh, macam inking dulu baru colour! Sama je macam saya lukis. | excited | ZONE_TALK.dusun:batik[3] · [script.ts:570](/mnt/storage/qish/game/src/content/script.ts:570) |
| ☐ D0307 | Kak Batik | Pandai melukis eh? Nanti datang balik, buat satu. | normal | ZONE_TALK.dusun:batik[4] · [script.ts:571](/mnt/storage/qish/game/src/content/script.ts:571) |
| ☐ D0308 | Qish | Nanti. Lepas jumpa orang yang hilang tu. | normal | ZONE_TALK.dusun:batik[5] · [script.ts:572](/mnt/storage/qish/game/src/content/script.ts:572) |
| ☐ D0309 | Pakcik Sampan | Nak naik sampan, dik? Hari ni free. Ada orang dah bayar pagi tadi. | normal | ZONE_TALK.dusun:pakcik[1] · [script.ts:575](/mnt/storage/qish/game/src/content/script.ts:575) |
| ☐ D0310 | Qish | Siapa? | thinking | ZONE_TALK.dusun:pakcik[2] · [script.ts:576](/mnt/storage/qish/game/src/content/script.ts:576) |
| ☐ D0311 | Pakcik Sampan | Lelaki rambut kerinting. Malas cakap. Bayar terus blah. | normal | ZONE_TALK.dusun:pakcik[3] · [script.ts:577](/mnt/storage/qish/game/src/content/script.ts:577) |
| ☐ D0312 | Qish | ...FARIS. | pout | ZONE_TALK.dusun:pakcik[4] · [script.ts:578](/mnt/storage/qish/game/src/content/script.ts:578) |
| ☐ D0313 | Pakcik Sampan | Naik kat hujung jeti tu. Dayung pelan-pelan, jangan kacau memerang. | normal | ZONE_TALK.dusun:pakcik[5] · [script.ts:579](/mnt/storage/qish/game/src/content/script.ts:579) |
| ☐ D0314 | Pakcik Pancing | Shhh. Ikan dengar. | normal | ZONE_TALK.dusun:pancing[1] · [script.ts:582](/mnt/storage/qish/game/src/content/script.ts:582) |
| ☐ D0315 | Pakcik Pancing | Dari subuh pakcik kat sini. Dapat tiga ekor. Satu memerang curi. | normal | ZONE_TALK.dusun:pancing[2] · [script.ts:583](/mnt/storage/qish/game/src/content/script.ts:583) |
| ☐ D0316 | Qish | Memerang kat tasik ni memang samseng eh. | smug | ZONE_TALK.dusun:pancing[3] · [script.ts:584](/mnt/storage/qish/game/src/content/script.ts:584) |
| ☐ D0317 | Makcik Picnic | Jaga-jaga, dik. Memerang kat sini suka curi keropok. | normal | ZONE_TALK.dusun:picnic[1] · [script.ts:587](/mnt/storage/qish/game/src/content/script.ts:587) |
| ☐ D0318 | Makcik Picnic | Tadi dah tiga bungkus. Pakcik ni pun dah malas kejar. | normal | ZONE_TALK.dusun:picnic[2] · [script.ts:588](/mnt/storage/qish/game/src/content/script.ts:588) |
| ☐ D0319 | Qish | Comel tapi pencuri. Okay. | happy | ZONE_TALK.dusun:picnic[3] · [script.ts:589](/mnt/storage/qish/game/src/content/script.ts:589) |
| ☐ D0320 | Narator | Sepasang couple tengah picnic bawah payung. Kongsi satu straw. | normal | ZONE_TALK.dusun:couple[1] · [script.ts:592](/mnt/storage/qish/game/src/content/script.ts:592) |
| ☐ D0321 | Qish | Hmph. Kalau Faris ada, mesti dia dah tertidur atas tikar tu. | pout | ZONE_TALK.dusun:couple[2] · [script.ts:593](/mnt/storage/qish/game/src/content/script.ts:593) |
| ☐ D0322 | Qish | Duduk kejap tengok tasik... | happy | ZONE_TALK.dusun:bench[1] · [script.ts:596](/mnt/storage/qish/game/src/content/script.ts:596) |
| ☐ D0323 | Narator | Angin sejuk, air tenang, lily terapung-apung. Bowat dah menguap. | normal | ZONE_TALK.dusun:bench[2] · [script.ts:597](/mnt/storage/qish/game/src/content/script.ts:597) |
| ☐ D0324 | Qish | Okay, okay. Bangun. Cari Faris. | normal | ZONE_TALK.dusun:bench[3] · [script.ts:598](/mnt/storage/qish/game/src/content/script.ts:598) |
| ☐ D0325 | Qish | Eh... ada orang tanam lily bentuk hati? | surprised | ZONE_TALK.dusun:heart[1] · [script.ts:601](/mnt/storage/qish/game/src/content/script.ts:601) |
| ☐ D0326 | Narator | Lily pink, satu-satu, susun jadi hati. Siapa la rajin sangat ni. | normal | ZONE_TALK.dusun:heart[2] · [script.ts:602](/mnt/storage/qish/game/src/content/script.ts:602) |
| ☐ D0327 | Qish | Kebetulan je kot. Kan? | shy | ZONE_TALK.dusun:heart[3] · [script.ts:603](/mnt/storage/qish/game/src/content/script.ts:603) |
| ☐ D0328 | Narator | Kuih muih atas but Kancil. Onde-onde, kuih lapis, seri muka. RM1 je. | normal | ZONE_TALK.dusun:kuih[1] · [script.ts:606](/mnt/storage/qish/game/src/content/script.ts:606) |
| ☐ D0329 | Qish | Saya tak lapar. ...Okay, lapar sikit. | shy | ZONE_TALK.dusun:kuih[2] · [script.ts:607](/mnt/storage/qish/game/src/content/script.ts:607) |
| ☐ D0330 | Narator | (Snorlax Twin dalam diri awak dah bangun.) | normal | ZONE_TALK.dusun:kuih[3] · [script.ts:608](/mnt/storage/qish/game/src/content/script.ts:608) |
| ☐ D0331 | Narator | Pokok bunga dalam pasu. Ada lily putih, lily pink, lily peach! | normal | ZONE_TALK.dusun:pokok[1] · [script.ts:611](/mnt/storage/qish/game/src/content/script.ts:611) |
| ☐ D0332 | Qish | Lily lagi! Nak beli semua... | excited | ZONE_TALK.dusun:pokok[2] · [script.ts:612](/mnt/storage/qish/game/src/content/script.ts:612) |
| ☐ D0333 | Qish | Tapi yang terapung tengah tasik tu lagi special. | love | ZONE_TALK.dusun:pokok[3] · [script.ts:613](/mnt/storage/qish/game/src/content/script.ts:613) |
| ☐ D0334 | Narator | Baju preloved RM5 sehelai. Lorbel versi pagi Ahad. | normal | ZONE_TALK.dusun:preloved[1] · [script.ts:616](/mnt/storage/qish/game/src/content/script.ts:616) |
| ☐ D0335 | Qish | Jangan tengok. Jangan tengok. Fokus. | worried | ZONE_TALK.dusun:preloved[2] · [script.ts:617](/mnt/storage/qish/game/src/content/script.ts:617) |
| ☐ D0336 | Narator | Peti vinyl dan kaset dalam but Avanza. | normal | ZONE_TALK.dusun:vinyl[1] · [script.ts:620](/mnt/storage/qish/game/src/content/script.ts:620) |
| ☐ D0337 | Qish | Ada Laufey tak? Joji? Malcolm Todd? | excited | ZONE_TALK.dusun:vinyl[2] · [script.ts:621](/mnt/storage/qish/game/src/content/script.ts:621) |
| ☐ D0338 | Narator | Pakcik tu cuma ada P. Ramlee. Lapan keping. | normal | ZONE_TALK.dusun:vinyl[3] · [script.ts:622](/mnt/storage/qish/game/src/content/script.ts:622) |
| ☐ D0339 | Qish | Memerang! Satu family, berenang ikut belakang sampan saya! | excited | ZONE_TALK.dusun:otter[1] · [script.ts:625](/mnt/storage/qish/game/src/content/script.ts:625) |
| ☐ D0340 | Narator | Yang kat atas pulau tu tengah berjemur. Yang satu berguling-guling. | normal | ZONE_TALK.dusun:otter[2] · [script.ts:626](/mnt/storage/qish/game/src/content/script.ts:626) |
| ☐ D0341 | Qish | Comelnya. Rasa nak bawak balik satu. | love | ZONE_TALK.dusun:otter[3] · [script.ts:627](/mnt/storage/qish/game/src/content/script.ts:627) |
| ☐ D0342 | Qish | Dua ekor tidur terapung... sambil pegang tangan? | surprised | ZONE_TALK.dusun:otterpair[1] · [script.ts:630](/mnt/storage/qish/game/src/content/script.ts:630) |
| ☐ D0343 | Narator | Memerang pegang tangan masa tidur supaya tak hanyut berpisah. | normal | ZONE_TALK.dusun:otterpair[2] · [script.ts:631](/mnt/storage/qish/game/src/content/script.ts:631) |
| ☐ D0344 | Qish | ...Okay itu sweet gila. | love | ZONE_TALK.dusun:otterpair[3] · [script.ts:632](/mnt/storage/qish/game/src/content/script.ts:632) |
| ☐ D0345 | Qish | Memerang tengah berjemur atas batu tepi tasik! | excited | ZONE_TALK.dusun:otterden[1] · [script.ts:635](/mnt/storage/qish/game/src/content/script.ts:635) |
| ☐ D0346 | Narator | Seekor tengah berguling-guling, perut ke atas. Langsung tak peduli orang lalu. | normal | ZONE_TALK.dusun:otterden[2] · [script.ts:636](/mnt/storage/qish/game/src/content/script.ts:636) |
| ☐ D0347 | Qish | Life goals. | happy | ZONE_TALK.dusun:otterden[3] · [script.ts:637](/mnt/storage/qish/game/src/content/script.ts:637) |
| ☐ D0348 | Narator | Dua makcik lepak dalam wakaf, tengok memerang sambil makan kuih. | normal | ZONE_TALK.dusun:wakaf[1] · [script.ts:640](/mnt/storage/qish/game/src/content/script.ts:640) |
| ☐ D0349 | Makcik Picnic | Tadi ada budak lelaki rambut kerinting lalu sini. Muka macam baru bangun tidur. | normal | ZONE_TALK.dusun:wakaf[2] · [script.ts:641](/mnt/storage/qish/game/src/content/script.ts:641) |
| ☐ D0350 | Qish | Dia pergi mana?! | surprised | ZONE_TALK.dusun:wakaf[3] · [script.ts:642](/mnt/storage/qish/game/src/content/script.ts:642) |
| ☐ D0351 | Makcik Picnic | Entah. Dia jalan, lepas tu berhenti, lepas tu jalan balik. Macam malas nak pergi mana-mana. | normal | ZONE_TALK.dusun:wakaf[4] · [script.ts:643](/mnt/storage/qish/game/src/content/script.ts:643) |
| ☐ D0352 | Narator | Air kelapa muda, terus dari buah. Sejuk. | normal | ZONE_TALK.dusun:kelapa[1] · [script.ts:646](/mnt/storage/qish/game/src/content/script.ts:646) |
| ☐ D0353 | Qish | Lepas jalan keliling tasik ni, memang patut. | happy | ZONE_TALK.dusun:kelapa[2] · [script.ts:647](/mnt/storage/qish/game/src/content/script.ts:647) |
| ☐ D0354 | Snorlax Twin | Zzz... kenyang... Zzz... | normal | ZONE_TALK.dusun:nap[1] · [script.ts:650](/mnt/storage/qish/game/src/content/script.ts:650) |
| ☐ D0355 | Qish | Dia tidur balik. Typical. | smug | ZONE_TALK.dusun:nap[2] · [script.ts:651](/mnt/storage/qish/game/src/content/script.ts:651) |

<a id="qc-42"></a>

## 42. Interaksi map · Lorbel

| QC / ID | Watak / jenis | Dialog asal | Ekspresi | Konteks / sumber |
|---|---|---|---|---|
| ☐ D0356 | Narator | LORBEL. Lorong Belakang, Cyberjaya. | normal | ZONE_TALK.galeri:neon[1] · [script.ts:655](/mnt/storage/qish/game/src/content/script.ts:655) |
| ☐ D0357 | Narator | Siang tempat buang sampah dengan parking motor. Malam jadi pasar malam paling sesak. | normal | ZONE_TALK.galeri:neon[2] · [script.ts:656](/mnt/storage/qish/game/src/content/script.ts:656) |
| ☐ D0358 | Qish | Ramainya orang. Kalau Faris ada kat sini pun, macam mana nak jumpa... | worried | ZONE_TALK.galeri:neon[3] · [script.ts:657](/mnt/storage/qish/game/src/content/script.ts:657) |
| ☐ D0359 | Narator | Ada contengan kat dinding: "F + Q" dalam bentuk hati. | normal | ZONE_TALK.galeri:graffiti[1] · [script.ts:660](/mnt/storage/qish/game/src/content/script.ts:660) |
| ☐ D0360 | Qish | ...Siapa conteng ni? | thinking | ZONE_TALK.galeri:graffiti[2] · [script.ts:661](/mnt/storage/qish/game/src/content/script.ts:661) |
| ☐ D0361 | Narator | Huruf F tu senget. Macam orang malas tulis. | normal | ZONE_TALK.galeri:graffiti[3] · [script.ts:662](/mnt/storage/qish/game/src/content/script.ts:662) |
| ☐ D0362 | Qish | FARIS. | smug | ZONE_TALK.galeri:graffiti[4] · [script.ts:663](/mnt/storage/qish/game/src/content/script.ts:663) |
| ☐ D0363 | Narator | Busker sambung nyanyi. Gitar dia masih sumbang sikit. | normal | ZONE_TALK.galeri:stage[1] · [script.ts:666](/mnt/storage/qish/game/src/content/script.ts:666) |
| ☐ D0364 | Qish | Faris pernah menang PS4 sebab cosplay sama macam tu tau. | smug | ZONE_TALK.galeri:stage[2] · [script.ts:667](/mnt/storage/qish/game/src/content/script.ts:667) |
| ☐ D0365 | Narator | Penonton tepuk tangan. Busker tu tunduk hormat kat Qish. | normal | ZONE_TALK.galeri:stage[3] · [script.ts:668](/mnt/storage/qish/game/src/content/script.ts:668) |
| ☐ D0366 | Narator | Kucing Lorbel tidur celah meja, tunggu orang jatuhkan ayam. | normal | ZONE_TALK.galeri:cat[1] · [script.ts:671](/mnt/storage/qish/game/src/content/script.ts:671) |
| ☐ D0367 | Qish | Sama macam Bowat tunggu cookies. | laugh | ZONE_TALK.galeri:cat[2] · [script.ts:672](/mnt/storage/qish/game/src/content/script.ts:672) |
| ☐ D0368 | Narator | Asap satay naik sampai ke lampu. Bau dia sampai ke bundle. | normal | ZONE_TALK.galeri:satay[1] · [script.ts:710](/mnt/storage/qish/game/src/content/script.ts:710) |
| ☐ D0369 | Qish | Fokus, Qish. Cari Faris dulu. ...Lepas tu satay. | thinking | ZONE_TALK.galeri:satay[2] · [script.ts:711](/mnt/storage/qish/game/src/content/script.ts:711) |
| ☐ D0370 | Qish | DAGING SALAI. Favourite saya! | excited | ZONE_TALK.galeri:salai[1] · [script.ts:714](/mnt/storage/qish/game/src/content/script.ts:714) |
| ☐ D0371 | Qish | Kalau Faris ada, mesti dia order satu untuk saya. | love | ZONE_TALK.galeri:salai[2] · [script.ts:715](/mnt/storage/qish/game/src/content/script.ts:715) |
| ☐ D0372 | Narator | (Penimbang dalam kepala Qish: 80kg.) | normal | ZONE_TALK.galeri:salai[3] · [script.ts:716](/mnt/storage/qish/game/src/content/script.ts:716) |
| ☐ D0373 | Qish | Malatang!! Pilih sendiri, timbang... | excited | ZONE_TALK.galeri:malatang[1] · [script.ts:719](/mnt/storage/qish/game/src/content/script.ts:719) |
| ☐ D0374 | Qish | ...Okay satu mangkuk je. Lepas jumpa Faris. | shy | ZONE_TALK.galeri:malatang[2] · [script.ts:720](/mnt/storage/qish/game/src/content/script.ts:720) |
| ☐ D0375 | Narator | Air balang enam warna: sirap, bandung, laici, oren, anggur, nanas. | normal | ZONE_TALK.galeri:balang[1] · [script.ts:723](/mnt/storage/qish/game/src/content/script.ts:723) |
| ☐ D0376 | Qish | Bandung satu. Nanti. Lepas jumpa Faris. | happy | ZONE_TALK.galeri:balang[2] · [script.ts:724](/mnt/storage/qish/game/src/content/script.ts:724) |
| ☐ D0377 | Qish | Kek mango! ...HABIS? | surprised | ZONE_TALK.galeri:mango[1] · [script.ts:727](/mnt/storage/qish/game/src/content/script.ts:727) |
| ☐ D0378 | Pakcik Kek | Sorry dik. Semua dah orang borong tadi. | normal | ZONE_TALK.galeri:mango[2] · [script.ts:728](/mnt/storage/qish/game/src/content/script.ts:728) |
| ☐ D0379 | Pakcik Kek | Lelaki rambut kerinting. Malas cakap. Bayar terus blah. | normal | ZONE_TALK.galeri:mango[3] · [script.ts:729](/mnt/storage/qish/game/src/content/script.ts:729) |
| ☐ D0380 | Qish | ...Rambut kerinting? | thinking | ZONE_TALK.galeri:mango[4] · [script.ts:730](/mnt/storage/qish/game/src/content/script.ts:730) |
| ☐ D0381 | Narator | Atas kaunter ada satu kotak berikat reben pink: "TEMPAHAN · a/n: F." | normal | ZONE_TALK.galeri:mango[5] · [script.ts:731](/mnt/storage/qish/game/src/content/script.ts:731) |
| ☐ D0382 | Narator | Burger special, telur double, sos berlambak. | normal | ZONE_TALK.galeri:burger[1] · [script.ts:734](/mnt/storage/qish/game/src/content/script.ts:734) |
| ☐ D0383 | Qish | Faris mesti order yang paling simple. Malas pilih. | smug | ZONE_TALK.galeri:burger[2] · [script.ts:735](/mnt/storage/qish/game/src/content/script.ts:735) |
| ☐ D0384 | Narator | BUNDLE RM5 semua. Orang berebut macam tengah sale. | normal | ZONE_TALK.galeri:bundle[1] · [script.ts:738](/mnt/storage/qish/game/src/content/script.ts:738) |
| ☐ D0385 | Qish | Jaket ni comel... | love | ZONE_TALK.galeri:bundle[2] · [script.ts:739](/mnt/storage/qish/game/src/content/script.ts:739) |
| ☐ D0386 | Qish | Faris mesti cakap "tak payah, awak dah banyak jaket." | pout | ZONE_TALK.galeri:bundle[3] · [script.ts:740](/mnt/storage/qish/game/src/content/script.ts:740) |
| ☐ D0387 | Narator | Jeans RM15. Ada yang ori, ada yang... yakin ori. | normal | ZONE_TALK.galeri:jeans[1] · [script.ts:742](/mnt/storage/qish/game/src/content/script.ts:742) |
| ☐ D0388 | Narator | Jaket tebal-tebal. "Untuk sejuk aircond." | normal | ZONE_TALK.galeri:jaket[1] · [script.ts:744](/mnt/storage/qish/game/src/content/script.ts:744) |
| ☐ D0389 | Qish | Malaysia mana ada musim sejuk. | smug | ZONE_TALK.galeri:jaket[2] · [script.ts:745](/mnt/storage/qish/game/src/content/script.ts:745) |
| ☐ D0390 | Narator | T-shirt 3 helai RM10. Ada satu tulis "I ♥ TIDUR". | normal | ZONE_TALK.galeri:tshirt[1] · [script.ts:748](/mnt/storage/qish/game/src/content/script.ts:748) |
| ☐ D0391 | Qish | Ni baju Snorlax Twin. | laugh | ZONE_TALK.galeri:tshirt[2] · [script.ts:749](/mnt/storage/qish/game/src/content/script.ts:749) |
| ☐ D0392 | Qish | Ramen pedas! Level 10. | excited | ZONE_TALK.galeri:ramen[1] · [script.ts:752](/mnt/storage/qish/game/src/content/script.ts:752) |
| ☐ D0393 | Narator | Ada tulis kecil: "Level 10 tak boleh refund air." | normal | ZONE_TALK.galeri:ramen[2] · [script.ts:753](/mnt/storage/qish/game/src/content/script.ts:753) |
| ☐ D0394 | Qish | Nanti. Lepas jumpa Faris. ...Level 10. | smug | ZONE_TALK.galeri:ramen[3] · [script.ts:754](/mnt/storage/qish/game/src/content/script.ts:754) |
| ☐ D0395 | Narator | Takoyaki 6 biji RM6. Sotong dia sikit, cinta dia banyak. | normal | ZONE_TALK.galeri:takoyaki[1] · [script.ts:757](/mnt/storage/qish/game/src/content/script.ts:757) |
| ☐ D0396 | Qish | Faris mesti makan sebiji terus, lepas tu menangis sebab panas. | laugh | ZONE_TALK.galeri:takoyaki[2] · [script.ts:758](/mnt/storage/qish/game/src/content/script.ts:758) |
| ☐ D0397 | Narator | Topi bundle: snapback, bucket hat, topi pancing. | normal | ZONE_TALK.galeri:topi[1] · [script.ts:761](/mnt/storage/qish/game/src/content/script.ts:761) |
| ☐ D0398 | Qish | Bowat mesti comel pakai bucket hat. | love | ZONE_TALK.galeri:topi[2] · [script.ts:762](/mnt/storage/qish/game/src/content/script.ts:762) |
| ☐ D0399 | Narator | Kasut bundle saiz 36 sampai 44. Kadang-kadang sebelah je. | normal | ZONE_TALK.galeri:kasut[1] · [script.ts:764](/mnt/storage/qish/game/src/content/script.ts:764) |
| ☐ D0400 | Narator | Qish tengok cermin bundle. | normal | ZONE_TALK.galeri:mirror[1] · [script.ts:766](/mnt/storage/qish/game/src/content/script.ts:766) |
| ☐ D0401 | Qish | Antek giler. | smug | ZONE_TALK.galeri:mirror[2] · [script.ts:767](/mnt/storage/qish/game/src/content/script.ts:767) |
| ☐ D0402 | Narator | (Cermin tu setuju.) | normal | ZONE_TALK.galeri:mirror[3] · [script.ts:768](/mnt/storage/qish/game/src/content/script.ts:768) |

<a id="qc-43"></a>

## 43. Interaksi map · Lorong Photobooth

| QC / ID | Watak / jenis | Dialog asal | Ekspresi | Konteks / sumber |
|---|---|---|---|---|
| ☐ D0403 | Narator | Atas easel ada lukisan doodle: dua orang, garisan marker hitam. | normal | ZONE_TALK.photobooth:easel[1] · [script.ts:675](/mnt/storage/qish/game/src/content/script.ts:675) |
| ☐ D0404 | Qish | Eh, ni lukisan saya! Faris dengan saya. | surprised | ZONE_TALK.photobooth:easel[2] · [script.ts:676](/mnt/storage/qish/game/src/content/script.ts:676) |
| ☐ D0405 | Qish | Bila masa Bolat ex ambik ni... | thinking | ZONE_TALK.photobooth:easel[3] · [script.ts:677](/mnt/storage/qish/game/src/content/script.ts:677) |
| ☐ D0406 | Papan tanda | BOLAT·CAM · DIGITAL 9000 · 26.0 MEGAPIXEL | normal | ZONE_TALK.photobooth:camera[1] · [script.ts:680](/mnt/storage/qish/game/src/content/script.ts:680) |
| ☐ D0407 | Narator | Kamera digital pink sebesar rumah. Setiap sepuluh saat dia zoom, bip-bip, FLASH. Tiada siapa tekan. | normal | ZONE_TALK.photobooth:camera[2] · [script.ts:681](/mnt/storage/qish/game/src/content/script.ts:681) |
| ☐ D0408 | Qish | Ni mesti kamera Bolat ex. Dia kan ambil gambar SEMUA benda. | smug | ZONE_TALK.photobooth:camera[3] · [script.ts:682](/mnt/storage/qish/game/src/content/script.ts:682) |
| ☐ D0409 | Qish | ...Faris pun takkan larat angkat benda ni. Dia malas angkat phone pun. | laugh | ZONE_TALK.photobooth:camera[4] · [script.ts:683](/mnt/storage/qish/game/src/content/script.ts:683) |
| ☐ D0410 | Papan tanda | LORONG PHOTOBOOTH · senyum! · 1, 2, 3 · cheese! | normal | ZONE_TALK.photobooth:gate[1] · [script.ts:686](/mnt/storage/qish/game/src/content/script.ts:686) |
| ☐ D0411 | Qish | Jalan dia macam roll filem. Bengkang-bengkok macam ular. | thinking | ZONE_TALK.photobooth:gate[2] · [script.ts:687](/mnt/storage/qish/game/src/content/script.ts:687) |
| ☐ D0412 | Qish | Kalau Faris, mesti dia cari jalan pintas. Tak boleh, ada tali baldu. | smug | ZONE_TALK.photobooth:gate[3] · [script.ts:688](/mnt/storage/qish/game/src/content/script.ts:688) |
| ☐ D0413 | Narator | Pokok Strip: orang sepit strip gambar kat dahan, harap kenangan tu kekal. | normal | ZONE_TALK.photobooth:tree[1] · [script.ts:691](/mnt/storage/qish/game/src/content/script.ts:691) |
| ☐ D0414 | Qish | Comelnya. Ada couple tulis "1 tahun ♥" kat belakang strip. | love | ZONE_TALK.photobooth:tree[2] · [script.ts:692](/mnt/storage/qish/game/src/content/script.ts:692) |
| ☐ D0415 | Narator | Angin bertiup. Satu strip tercabut, terbang ke langit. | normal | ZONE_TALK.photobooth:tree[3] · [script.ts:693](/mnt/storage/qish/game/src/content/script.ts:693) |
| ☐ D0416 | Papan tanda | CETAK GAMBAR · dari phone · siap 1 minit · RM2 | normal | ZONE_TALK.photobooth:kiosk[1] · [script.ts:696](/mnt/storage/qish/game/src/content/script.ts:696) |
| ☐ D0417 | Qish | Phone saya penuh gambar Faris tidur. Tak payah cetak kot. | laugh | ZONE_TALK.photobooth:kiosk[2] · [script.ts:697](/mnt/storage/qish/game/src/content/script.ts:697) |
| ☐ D0418 | Qish | ...Okay mungkin satu. | shy | ZONE_TALK.photobooth:kiosk[3] · [script.ts:698](/mnt/storage/qish/game/src/content/script.ts:698) |
| ☐ D0419 | Papan tanda | STUDIO FLASH · sesi gambar sedang berjalan · senyap ya | normal | ZONE_TALK.photobooth:studio[1] · [script.ts:701](/mnt/storage/qish/game/src/content/script.ts:701) |
| ☐ D0420 | Narator | Flash! Flash! Flash! Tiga lampu menyala bergilir-gilir. | normal | ZONE_TALK.photobooth:studio[2] · [script.ts:702](/mnt/storage/qish/game/src/content/script.ts:702) |
| ☐ D0421 | Qish | Model tu pose lain setiap kali flash. Saya kat booth pun pose sama je empat kali. | laugh | ZONE_TALK.photobooth:studio[3] · [script.ts:703](/mnt/storage/qish/game/src/content/script.ts:703) |
| ☐ D0422 | Narator | Kamera digital zaman Y2K, besar macam patung. Lensa dia berkilat. | normal | ZONE_TALK.photobooth:digicam[1] · [script.ts:706](/mnt/storage/qish/game/src/content/script.ts:706) |
| ☐ D0423 | Qish | Dulu semua orang bawa kamera macam ni pergi jalan-jalan! | excited | ZONE_TALK.photobooth:digicam[2] · [script.ts:707](/mnt/storage/qish/game/src/content/script.ts:707) |

<a id="qc-44"></a>

## 44. Interaksi map · Putrajaya

| QC / ID | Watak / jenis | Dialog asal | Ekspresi | Konteks / sumber |
|---|---|---|---|---|
| ☐ D0424 | Narator | Air tebu sejuk. Mesin perah berpusing, bunyi kriuk kriuk. | normal | ZONE_TALK.bukit:tebu[1] · [script.ts:772](/mnt/storage/qish/game/src/content/script.ts:772) |
| ☐ D0425 | Qish | Sedapnya... tapi satu cawan tu manis gila. Naik balik nanti berat saya. | worried | ZONE_TALK.bukit:tebu[2] · [script.ts:773](/mnt/storage/qish/game/src/content/script.ts:773) |
| ☐ D0426 | Qish | Lepas jogging la. Upah diri sendiri. | happy | ZONE_TALK.bukit:tebu[3] · [script.ts:774](/mnt/storage/qish/game/src/content/script.ts:774) |
| ☐ D0427 | Narator | Kelapa muda bertimbun. Pakcik tu tebuk satu dengan parang, sekali hayun. | normal | ZONE_TALK.bukit:kelapa[1] · [script.ts:777](/mnt/storage/qish/game/src/content/script.ts:777) |
| ☐ D0428 | Qish | Air kelapa kan sihat. ...Kan? | worried | ZONE_TALK.bukit:kelapa[2] · [script.ts:778](/mnt/storage/qish/game/src/content/script.ts:778) |
| ☐ D0429 | Narator | Ting ting! Aiskrim Malaysia: perisa jagung, kacang merah, durian. | normal | ZONE_TALK.bukit:aiskrim[1] · [script.ts:781](/mnt/storage/qish/game/src/content/script.ts:781) |
| ☐ D0430 | Qish | Kenapa semua benda sedap ada kat tempat orang jogging?! Ni ujian ke? | angry | ZONE_TALK.bukit:aiskrim[2] · [script.ts:782](/mnt/storage/qish/game/src/content/script.ts:782) |
| ☐ D0431 | Narator | Masjid Putra. Kubah merah jambu atas tasik, cantik gila waktu petang macam ni. | normal | ZONE_TALK.bukit:masjid[1] · [script.ts:785](/mnt/storage/qish/game/src/content/script.ts:785) |
| ☐ D0432 | Qish | Kubah dia warna pink. Taste saya. | happy | ZONE_TALK.bukit:masjid[2] · [script.ts:786](/mnt/storage/qish/game/src/content/script.ts:786) |
| ☐ D0433 | Narator | Perdana Putra. Kubah hijau, pancutan air menari kat depan. | normal | ZONE_TALK.bukit:perdana[1] · [script.ts:789](/mnt/storage/qish/game/src/content/script.ts:789) |
| ☐ D0434 | Qish | Pejabat Perdana Menteri. Dia pun kena datang kerja hari Selasa ke? | thinking | ZONE_TALK.bukit:perdana[2] · [script.ts:790](/mnt/storage/qish/game/src/content/script.ts:790) |
| ☐ D0435 | Narator | Huruf besar PUTRAJAYA warna-warni. Semua orang ambil gambar kat sini. | normal | ZONE_TALK.bukit:huruf[1] · [script.ts:793](/mnt/storage/qish/game/src/content/script.ts:793) |
| ☐ D0436 | Qish | Nanti datang balik dengan Faris. Dia kena jadi photographer. | happy | ZONE_TALK.bukit:huruf[2] · [script.ts:794](/mnt/storage/qish/game/src/content/script.ts:794) |
| ☐ D0437 | Qish | Kalau dia tak malas la. | smug | ZONE_TALK.bukit:huruf[3] · [script.ts:795](/mnt/storage/qish/game/src/content/script.ts:795) |
| ☐ D0438 | Narator | Garisan START Larian Petang Putrajaya. Jam besar tu tak berhenti mengira. | normal | ZONE_TALK.bukit:arch[1] · [script.ts:798](/mnt/storage/qish/game/src/content/script.ts:798) |
| ☐ D0439 | Qish | Belum, belum. Warm up dulu. | happy | ZONE_TALK.bukit:arch[2] · [script.ts:799](/mnt/storage/qish/game/src/content/script.ts:799) |
| ☐ D0440 | Narator | Garisan START. Ada orang conteng kat bawah: "SHE'S SO TINY" dengan hati. | normal | ZONE_TALK.bukit:archAfter[1] · [script.ts:868](/mnt/storage/qish/game/src/content/script.ts:868) |

<a id="qc-45"></a>

## 45. Interaksi map · Litar Sepang

| QC / ID | Watak / jenis | Dialog asal | Ekspresi | Konteks / sumber |
|---|---|---|---|---|
| ☐ D0441 | Papan tanda | LITAR ANTARABANGSA SEPANG | normal | ZONE_TALK.sepang:gate[1] · [script.ts:802](/mnt/storage/qish/game/src/content/script.ts:802) |
| ☐ D0442 | Qish | Litar F1 kampung saya. Sepang Baddie represent. | smug | ZONE_TALK.sepang:gate[2] · [script.ts:803](/mnt/storage/qish/game/src/content/script.ts:803) |
| ☐ D0443 | Kak Tiket | Adik! Sini kejap, ada orang tinggalkan barang untuk adik. | normal | ZONE_TALK.sepang:tiket[1] · [script.ts:805](/mnt/storage/qish/game/src/content/script.ts:805) |
| ☐ D0444 | Kak Tiket | Pergi la, dik. Dia tunggu lama dah tu. Tidur pun dah dua kali. | normal | ZONE_TALK.sepang:tiketAfter[1] · [script.ts:806](/mnt/storage/qish/game/src/content/script.ts:806) |
| ☐ D0445 | Abang Merch | Adik tudung mauve! Ada barang untuk adik ni. | normal | ZONE_TALK.sepang:merch[1] · [script.ts:807](/mnt/storage/qish/game/src/content/script.ts:807) |
| ☐ D0446 | Abang Merch | Bantal MALAS RACING tinggal satu je. Nak? Free. Bos dah bayar. | normal | ZONE_TALK.sepang:merchAfter[1] · [script.ts:808](/mnt/storage/qish/game/src/content/script.ts:808) |
| ☐ D0447 | Ketua Krew MALAS RACING | Adik cari bos kami ke? Mari sini. | normal | ZONE_TALK.sepang:krew[1] · [script.ts:809](/mnt/storage/qish/game/src/content/script.ts:809) |
| ☐ D0448 | Ketua Krew MALAS RACING | Kalau jumpa bos, cakap krew dia rindu. | normal | ZONE_TALK.sepang:krewAfter[1] · [script.ts:811](/mnt/storage/qish/game/src/content/script.ts:811) |
| ☐ D0449 | Ketua Krew MALAS RACING | ...Tak, tipu. Kami tidur je. | normal | ZONE_TALK.sepang:krewAfter[2] · [script.ts:812](/mnt/storage/qish/game/src/content/script.ts:812) |
| ☐ D0450 | Kak Usher | Adik! Ya, adik. Sini kejap. | normal | ZONE_TALK.sepang:usher[1] · [script.ts:814](/mnt/storage/qish/game/src/content/script.ts:814) |
| ☐ D0451 | Kak Usher | Kerusi C-12 tu masih panas. Dia baru pindah naik podium. | normal | ZONE_TALK.sepang:usherAfter[1] · [script.ts:815](/mnt/storage/qish/game/src/content/script.ts:815) |
| ☐ D0452 | Pakcik Marshal | Dik! Sini, pakcik ada barang untuk adik. | normal | ZONE_TALK.sepang:marshal[1] · [script.ts:816](/mnt/storage/qish/game/src/content/script.ts:816) |
| ☐ D0453 | Pakcik Marshal | Bendera kuning tu maknanya safety car keluar. Semua kena perlahan, beratur belakang dia. | normal | ZONE_TALK.sepang:marshalAfter[1] · [script.ts:818](/mnt/storage/qish/game/src/content/script.ts:818) |
| ☐ D0454 | Qish | Macam Raja Nonchalant. Setiap hari. | smug | ZONE_TALK.sepang:marshalAfter[2] · [script.ts:819](/mnt/storage/qish/game/src/content/script.ts:819) |
| ☐ D0455 | Pengulas | Cik! Cik tudung mauve! Satu soalan untuk penonton! | normal | ZONE_TALK.sepang:pengulas[1] · [script.ts:821](/mnt/storage/qish/game/src/content/script.ts:821) |
| ☐ D0456 | Pengulas | Kami doakan yang terbaik untuk gadis tudung mauve! Kembali ke studio. | normal | ZONE_TALK.sepang:pengulasAfter[1] · [script.ts:822](/mnt/storage/qish/game/src/content/script.ts:822) |
| ☐ D0457 | Abang Baju Hujan | Baju hujan RM5! Langit dah gelap tu kak. | normal | ZONE_TALK.sepang:poncho[1] · [script.ts:824](/mnt/storage/qish/game/src/content/script.ts:824) |
| ☐ D0458 | Qish | Saya nak cari orang, bukan nak beli baju hujan. | pout | ZONE_TALK.sepang:poncho[2] · [script.ts:825](/mnt/storage/qish/game/src/content/script.ts:825) |
| ☐ D0459 | Abang Baju Hujan | Orang rambut kerinting? Dia beli payung pantai pagi tadi. Besar gila. Corak pink. | normal | ZONE_TALK.sepang:poncho[3] · [script.ts:826](/mnt/storage/qish/game/src/content/script.ts:826) |
| ☐ D0460 | Papan tanda | SATAY KAJANG · AIS KACANG | normal | ZONE_TALK.sepang:food[1] · [script.ts:829](/mnt/storage/qish/game/src/content/script.ts:829) |
| ☐ D0461 | Qish | Bau satay... Fokus, Qish. Fokus. | love | ZONE_TALK.sepang:food[2] · [script.ts:830](/mnt/storage/qish/game/src/content/script.ts:830) |
| ☐ D0462 | Papan tanda | SIMULATOR F1 · CUBA LAH! RM0 | normal | ZONE_TALK.sepang:sim[1] · [script.ts:833](/mnt/storage/qish/game/src/content/script.ts:833) |
| ☐ D0463 | Narator | Budak tu dah langgar dinding lima kali. Dia masih senyum. | normal | ZONE_TALK.sepang:sim[2] · [script.ts:834](/mnt/storage/qish/game/src/content/script.ts:834) |
| ☐ D0464 | Papan tanda | BOLAT GP · KERETA PAMERAN | normal | ZONE_TALK.sepang:showcar[1] · [script.ts:837](/mnt/storage/qish/game/src/content/script.ts:837) |
| ☐ D0465 | Qish | Pink! Ada nama BOLAT kat sayap belakang. ...Siapa yang buat team ni? | surprised | ZONE_TALK.sepang:showcar[2] · [script.ts:838](/mnt/storage/qish/game/src/content/script.ts:838) |
| ☐ D0466 | Narator | SEPANG TV: peta litar, setiap kereta satu titik warna. | normal | ZONE_TALK.sepang:screen[1] · [script.ts:841](/mnt/storage/qish/game/src/content/script.ts:841) |
| ☐ D0467 | Narator | Tulisan bergerak kat bawah: "RAJA NONCHALANT: DI PODIUM SEJAK PAGI · TAK MASUK KERETA PUN". | normal | ZONE_TALK.sepang:screen[2] · [script.ts:842](/mnt/storage/qish/game/src/content/script.ts:842) |
| ☐ D0468 | Qish | Famous sebab malas. Bangga la tu. | smug | ZONE_TALK.sepang:screen[3] · [script.ts:843](/mnt/storage/qish/game/src/content/script.ts:843) |
| ☐ D0469 | Narator | Menara masa: senarai kedudukan, lap demi lap. | normal | ZONE_TALK.sepang:tower[1] · [script.ts:846](/mnt/storage/qish/game/src/content/script.ts:846) |
| ☐ D0470 | Qish | MALAS RACING takde dalam senarai. Memang tak start pun. | smug | ZONE_TALK.sepang:tower[2] · [script.ts:847](/mnt/storage/qish/game/src/content/script.ts:847) |
| ☐ D0471 | Narator | Helikopter perubatan. Juruterbang dia tengah makan roti dalam kokpit. | normal | ZONE_TALK.sepang:heli[1] · [script.ts:850](/mnt/storage/qish/game/src/content/script.ts:850) |
| ☐ D0472 | Qish | Harap tak payah guna hari ni. | worried | ZONE_TALK.sepang:heli[2] · [script.ts:851](/mnt/storage/qish/game/src/content/script.ts:851) |
| ☐ D0473 | Narator | SEPANG BADDIE ♥ · LABU LANJUT QUEEN. Tali dia senget sebelah. | normal | ZONE_TALK.sepang:banner[1] · [script.ts:854](/mnt/storage/qish/game/src/content/script.ts:854) |
| ☐ D0474 | Qish | Dia ikat sendiri ni. Nampak sangat. | happy | ZONE_TALK.sepang:banner[2] · [script.ts:855](/mnt/storage/qish/game/src/content/script.ts:855) |
| ☐ D0475 | Narator | Garaj MALAS RACING: kereta berselimut, tiga krew berdengkur atas sofa. | normal | ZONE_TALK.sepang:malas[1] · [script.ts:858](/mnt/storage/qish/game/src/content/script.ts:858) |
| ☐ D0476 | Papan tanda | JANGAN KACAU · Raja Nonchalant tengah rehat | normal | ZONE_TALK.sepang:malas[2] · [script.ts:859](/mnt/storage/qish/game/src/content/script.ts:859) |
| ☐ D0477 | Qish | Satu team ikut perangai bos. | smug | ZONE_TALK.sepang:malas[3] · [script.ts:860](/mnt/storage/qish/game/src/content/script.ts:860) |
| ☐ D0478 | Narator | Krew pit berdiri tepi lorong, tunggu kereta masuk. | normal | ZONE_TALK.sepang:pitwall[1] · [script.ts:863](/mnt/storage/qish/game/src/content/script.ts:863) |
| ☐ D0479 | Narator | Bila kereta berhenti: BRRRT BRRRT! Empat tayar bertukar dalam dua saat. | normal | ZONE_TALK.sepang:pitwall[2] · [script.ts:864](/mnt/storage/qish/game/src/content/script.ts:864) |
| ☐ D0480 | Qish | Laju gila. Faris bangun tidur pun ambil sejam. | laugh | ZONE_TALK.sepang:pitwall[3] · [script.ts:865](/mnt/storage/qish/game/src/content/script.ts:865) |

<a id="qc-46"></a>

## 46. Booth rekaan

| QC / ID | Watak / jenis | Dialog asal | Ekspresi | Konteks / sumber |
|---|---|---|---|---|
| ☐ D0481 | Papan tanda | SENYUM STUDIO · 4 keping · RM15 | normal | boothxLines.7[1] · [script.ts:879](/mnt/storage/qish/game/src/content/script.ts:879) |
| ☐ D0482 | Qish | Senyum. Faris setiap kali masuk booth: muka sama empat keping. | laugh | boothxLines.7[2] · [script.ts:880](/mnt/storage/qish/game/src/content/script.ts:880) |
| ☐ D0483 | Papan tanda | KIMCHI CLICK · frame Korea · filter licin | normal | boothxLines.8[1] · [script.ts:883](/mnt/storage/qish/game/src/content/script.ts:883) |
| ☐ D0484 | Qish | Filter dia licin sangat sampai Faris nampak macam orang lain. | laugh | boothxLines.8[2] · [script.ts:884](/mnt/storage/qish/game/src/content/script.ts:884) |
| ☐ D0485 | Papan tanda | 4 POSE · 4 pose, 4 saat setiap satu | normal | boothxLines.9[1] · [script.ts:887](/mnt/storage/qish/game/src/content/script.ts:887) |
| ☐ D0486 | Qish | Empat pose. Faris: senyum, senyum, senyum, senyum. | smug | boothxLines.9[2] · [script.ts:888](/mnt/storage/qish/game/src/content/script.ts:888) |
| ☐ D0487 | Papan tanda | SNAP SNAP · ada prop: topi, spek besar, bando telinga | normal | boothxLines.10[1] · [script.ts:891](/mnt/storage/qish/game/src/content/script.ts:891) |
| ☐ D0488 | Qish | Bando telinga kucing! Paksa Faris pakai nanti. | excited | boothxLines.10[2] · [script.ts:892](/mnt/storage/qish/game/src/content/script.ts:892) |
| ☐ D0489 | Papan tanda | BOLAT·BOOTH · khas untuk yang demand kiss &amp; cuddle | normal | boothxLines.11[1] · [script.ts:895](/mnt/storage/qish/game/src/content/script.ts:895) |
| ☐ D0490 | Qish | ...Ni booth saya ke? | shy | boothxLines.11[2] · [script.ts:896](/mnt/storage/qish/game/src/content/script.ts:896) |
| ☐ D0491 | Narator | Tulis kecil kat bawah: "Semua request mesti dipenuhi." | normal | boothxLines.11[3] · [script.ts:897](/mnt/storage/qish/game/src/content/script.ts:897) |
| ☐ D0492 | Qish | Satu lagi photobooth! | excited | boothxLines[1] · [script.ts:899](/mnt/storage/qish/game/src/content/script.ts:899) |

<a id="qc-47"></a>

## 47. Tiba di Lorong Photobooth

| QC / ID | Watak / jenis | Dialog asal | Ekspresi | Konteks / sumber |
|---|---|---|---|---|
| ☐ D0493 | Narator | Bip-bip... KLIK! Kamera gergasi kat tengah bandar menyala. Silau satu lorong. | normal | PB_ARRIVE[1] · [script.ts:903](/mnt/storage/qish/game/src/content/script.ts:903) |
| ☐ D0494 | Narator | Angin dari flash tu terbangkan strip-strip gambar ke udara. | normal | PB_ARRIVE[2] · [script.ts:904](/mnt/storage/qish/game/src/content/script.ts:904) |
| ☐ D0495 | Qish | Eh... tu bukan strip orang lain. Tu gambar SAYA dengan Faris! | surprised | PB_ARRIVE[3] · [script.ts:905](/mnt/storage/qish/game/src/content/script.ts:905) |
| ☐ D0496 | Qish | Jalan kat sini bengkang-bengkok macam ular. Kena kejar ikut jalan la ni. | thinking | PB_ARRIVE[4] · [script.ts:906](/mnt/storage/qish/game/src/content/script.ts:906) |
| ☐ D0497 | Narator | Kejar 6 strip yang terbang. Dekat sikit, dia terbang lagi... sampai tersangkut! | normal | PB_ARRIVE[5] · [script.ts:907](/mnt/storage/qish/game/src/content/script.ts:907) |

<a id="qc-48"></a>

## 48. Bergambar

| QC / ID | Watak / jenis | Dialog asal | Ekspresi | Konteks / sumber |
|---|---|---|---|---|
| ☐ D0498 | Narator | 1... 2... 3... | normal | PB_POSE[1] · [script.ts:912](/mnt/storage/qish/game/src/content/script.ts:912) |
| ☐ D0499 | Narator | KLIK! | normal | PB_POSE[2] · [script.ts:913](/mnt/storage/qish/game/src/content/script.ts:913) |

<a id="qc-49"></a>

## 49. Selepas bergambar

| QC / ID | Watak / jenis | Dialog asal | Ekspresi | Konteks / sumber |
|---|---|---|---|---|
| ☐ D0500 | Narator | Dalam gambar: Qish senyum cantik. Belakang dia, Bowat buat muka. | normal | pbPoseAfter[1] · bowat · [script.ts:918](/mnt/storage/qish/game/src/content/script.ts:918) |
| ☐ D0501 | Qish | Bowat! Awak photobomb lagi. | pout | pbPoseAfter[2] · bowat · [script.ts:919](/mnt/storage/qish/game/src/content/script.ts:919) |
| ☐ D0502 | Bowat | *kentut senyap* | smug | pbPoseAfter[3] · bowat · [script.ts:920](/mnt/storage/qish/game/src/content/script.ts:920) |
| ☐ D0503 | Narator | Dalam gambar: Qish senyum seorang. Sebelah dia ada ruang kosong. | normal | pbPoseAfter[1] · bukan bowat · [script.ts:923](/mnt/storage/qish/game/src/content/script.ts:923) |
| ☐ D0504 | Qish | Patutnya ada Faris kat sini. Malas punya orang. | sad | pbPoseAfter[2] · bukan bowat · [script.ts:924](/mnt/storage/qish/game/src/content/script.ts:924) |

<a id="qc-50"></a>

## 50. Booth sebenar

| QC / ID | Watak / jenis | Dialog asal | Ekspresi | Konteks / sumber |
|---|---|---|---|---|
| ☐ D0505 | Papan tanda | ${BOOTH_NAMES[i]} | normal | boothLines[1] · [script.ts:928](/mnt/storage/qish/game/src/content/script.ts:928) |
| ☐ D0506 | Qish | Kitorang pernah ambil gambar kat sini! Strip dari sini pun hilang dari bilik saya... | sad | boothLines[2] · [script.ts:929](/mnt/storage/qish/game/src/content/script.ts:929) |

<a id="qc-51"></a>

## 51. Photo strip

| QC / ID | Watak / jenis | Dialog asal | Ekspresi | Konteks / sumber |
|---|---|---|---|---|
| ☐ D0507 | Papan tanda | Photo strip · ${STRIP_STUDIOS[i]} | normal | stripLines[1] · [script.ts:933](/mnt/storage/qish/game/src/content/script.ts:933) |
| ☐ D0508 | Narator | Satu lagi kenangan korang yang Bolat ex simpan elok-elok. | normal | stripLines[2] · [script.ts:934](/mnt/storage/qish/game/src/content/script.ts:934) |

<a id="qc-52"></a>

## 52. Myvi — zon lain belum dibuka

| QC / ID | Watak / jenis | Dialog asal | Ekspresi | Konteks / sumber |
|---|---|---|---|---|
| ☐ D0509 | Qish | Myvi saya! | excited | MYVI_ALONE[1] · [script.ts:938](/mnt/storage/qish/game/src/content/script.ts:938) |
| ☐ D0510 | Narator | Myvi merah kesayangan. Fast travel boleh guna bila dah buka zon lain. | normal | MYVI_ALONE[2] · [script.ts:939](/mnt/storage/qish/game/src/content/script.ts:939) |

<a id="qc-53"></a>

## 53. Menu Myvi

| QC / ID | Watak / jenis | Dialog asal | Ekspresi | Konteks / sumber |
|---|---|---|---|---|
| ☐ D0511 | Qish | Nak drive Myvi ke mana? | happy | MYVI_ASK · [script.ts:941](/mnt/storage/qish/game/src/content/script.ts:941) |

<a id="qc-54"></a>

## 54. Jalan terkunci

| QC / ID | Watak / jenis | Dialog asal | Ekspresi | Konteks / sumber |
|---|---|---|---|---|
| ☐ D0512 | Narator | Jalan ke ${next} masih tertutup. | normal | lockedLines[1] · [script.ts:944](/mnt/storage/qish/game/src/content/script.ts:944) |
| ☐ D0513 | Narator | Kalahkan boss kat sini dulu! | normal | lockedLines[2] · [script.ts:945](/mnt/storage/qish/game/src/content/script.ts:945) |

<a id="qc-55"></a>

## 55. Misi koleksi · Bukit Bintang

| QC / ID | Watak / jenis | Dialog asal | Ekspresi | Konteks / sumber |
|---|---|---|---|---|
| ☐ D0514 | Narator | PSSSSHT! | normal | COLLECT_TALK.sunway.first[1] · [script.ts:952](/mnt/storage/qish/game/src/content/script.ts:952) |
| ☐ D0515 | Qish | Hilang! Bau lily semerbak. Okay, ni berkesan. | excited | COLLECT_TALK.sunway.first[2] · [script.ts:953](/mnt/storage/qish/game/src/content/script.ts:953) |
| ☐ D0516 | Orang ramai | Eh? Dah tak busuk? Terima kasih, kak! | normal | COLLECT_TALK.sunway.first[3] · [script.ts:954](/mnt/storage/qish/game/src/content/script.ts:954) |
| ☐ D0517 | Narator | Sembur semua awan kentut. Cari awan hijau besar kat sekeliling Bukit Bintang! | normal | COLLECT_TALK.sunway.first[4] · [script.ts:955](/mnt/storage/qish/game/src/content/script.ts:955) |
| ☐ D0518 | Narator | PSSSSHT! | normal | COLLECT_TALK.sunway.done[1] · [script.ts:958](/mnt/storage/qish/game/src/content/script.ts:958) |
| ☐ D0519 | Qish | Awan last! Satu Bukit Bintang dah bau bunga lily. | excited | COLLECT_TALK.sunway.done[2] · [script.ts:959](/mnt/storage/qish/game/src/content/script.ts:959) |
| ☐ D0520 | Narator | Orang ramai mula jalan macam biasa semula. Lampu isyarat hidup balik. | normal | COLLECT_TALK.sunway.done[3] · [script.ts:960](/mnt/storage/qish/game/src/content/script.ts:960) |
| ☐ D0521 | Qish | Tinggal satu sumber bau. Tengah-tengah scramble tu. | thinking | COLLECT_TALK.sunway.done[4] · [script.ts:961](/mnt/storage/qish/game/src/content/script.ts:961) |
| ☐ D0522 | Bowat | *kentut senyap* | innocent | COLLECT_TALK.sunway.done[5] · [script.ts:962](/mnt/storage/qish/game/src/content/script.ts:962) |
| ☐ D0523 | Qish | BOWAT. | angry | COLLECT_TALK.sunway.done[6] · [script.ts:963](/mnt/storage/qish/game/src/content/script.ts:963) |
| ☐ D0524 | Narator | Stesen MRT ke Lorbel ditutup sementara. Busuk sangat, staf pun lari. | normal | COLLECT_TALK.sunway.notYet[1] · [script.ts:966](/mnt/storage/qish/game/src/content/script.ts:966) |
| ☐ D0525 | Qish | Awan kentut dah hilang ${got}/${need}. Kena sembur semua dulu. | thinking | COLLECT_TALK.sunway.notYet[2] · [script.ts:967](/mnt/storage/qish/game/src/content/script.ts:967) |

<a id="qc-56"></a>

## 56. Misi koleksi · Labu Lanjut

| QC / ID | Watak / jenis | Dialog asal | Ekspresi | Konteks / sumber |
|---|---|---|---|---|
| ☐ D0526 | Qish | Eh, cookie? Ada kesan gigit... | thinking | COLLECT_TALK.labulanjut.first[1] · [script.ts:972](/mnt/storage/qish/game/src/content/script.ts:972) |
| ☐ D0527 | Qish | Ni mesti Bowat! Dia makan sambil lari, tercicir sepanjang jalan. | surprised | COLLECT_TALK.labulanjut.first[2] · [script.ts:973](/mnt/storage/qish/game/src/content/script.ts:973) |
| ☐ D0528 | Narator | Kumpul semua cookies Bowat. Cari yang bersinar kat sekeliling kampung! | normal | COLLECT_TALK.labulanjut.first[3] · [script.ts:974](/mnt/storage/qish/game/src/content/script.ts:974) |
| ☐ D0529 | Qish | Cookie last! Semua jejak menuju ke jalan bawah tu... | excited | COLLECT_TALK.labulanjut.done[1] · [script.ts:977](/mnt/storage/qish/game/src/content/script.ts:977) |
| ☐ D0530 | Qish | Ke Bukit Bintang. Tunggu saya, Bowat! | excited | COLLECT_TALK.labulanjut.done[2] · [script.ts:978](/mnt/storage/qish/game/src/content/script.ts:978) |
| ☐ D0531 | Narator | Palang jalan ke Bukit Bintang dah terbuka. | normal | COLLECT_TALK.labulanjut.done[3] · [script.ts:979](/mnt/storage/qish/game/src/content/script.ts:979) |
| ☐ D0532 | Narator | Palang jalan masih tertutup. Ada tulisan: "IKUT JEJAK BOWAT". | normal | COLLECT_TALK.labulanjut.notYet[1] · [script.ts:982](/mnt/storage/qish/game/src/content/script.ts:982) |
| ☐ D0533 | Qish | Cookies baru ${got}/${need}. Ada lagi yang bersepah kat kampung ni. | thinking | COLLECT_TALK.labulanjut.notYet[2] · [script.ts:983](/mnt/storage/qish/game/src/content/script.ts:983) |
| ☐ D0534 | Narator | Cari cahaya kuning yang menegak ke langit! | normal | COLLECT_TALK.labulanjut.notYet[3] · [script.ts:984](/mnt/storage/qish/game/src/content/script.ts:984) |

<a id="qc-57"></a>

## 57. Misi koleksi · KLIA

| QC / ID | Watak / jenis | Dialog asal | Ekspresi | Konteks / sumber |
|---|---|---|---|---|
| ☐ D0535 | Qish | Spanar? Ada tulis "BABAH" kat pemegang... | surprised | COLLECT_TALK.angkasa.first[1] · [script.ts:989](/mnt/storage/qish/game/src/content/script.ts:989) |
| ☐ D0536 | Qish | Ni tools Babah! Macam mana boleh bersepah kat sini? | thinking | COLLECT_TALK.angkasa.first[2] · [script.ts:990](/mnt/storage/qish/game/src/content/script.ts:990) |
| ☐ D0537 | Narator | Kumpul semua tools Babah. Cari cahaya kuning yang menegak ke langit! | normal | COLLECT_TALK.angkasa.first[3] · [script.ts:991](/mnt/storage/qish/game/src/content/script.ts:991) |
| ☐ D0538 | Qish | Tools last! Lengkap semua. | excited | COLLECT_TALK.angkasa.done[1] · [script.ts:994](/mnt/storage/qish/game/src/content/script.ts:994) |
| ☐ D0539 | Narator | Bawa balik kat Babah, dekat kapal terbang kat stand 8. | normal | COLLECT_TALK.angkasa.done[2] · [script.ts:995](/mnt/storage/qish/game/src/content/script.ts:995) |
| ☐ D0540 | Narator | Jalan ke Nyomnyom City masih tertutup. | normal | COLLECT_TALK.angkasa.notYet[1] · [script.ts:998](/mnt/storage/qish/game/src/content/script.ts:998) |
| ☐ D0541 | Qish | Tools Babah baru ${got}/${need}. Kena tolong Babah dulu. | thinking | COLLECT_TALK.angkasa.notYet[2] · [script.ts:999](/mnt/storage/qish/game/src/content/script.ts:999) |

<a id="qc-58"></a>

## 58. Misi koleksi · Nyomnyom City

| QC / ID | Watak / jenis | Dialog asal | Ekspresi | Konteks / sumber |
|---|---|---|---|---|
| ☐ D0542 | Narator | 📃 Resit dibayar. Bowat dah lari ke kedai lain. Cari dia (ada tanda ! atas kepala dia), dan bayar resit kat setiap kedai yang dia tinggalkan. | normal | COLLECT_TALK.cosyplace.first[1] · [script.ts:1003](/mnt/storage/qish/game/src/content/script.ts:1003) |
| ☐ D0543 | Narator | 📃 Semua resit dah langsai. Jumlah: RM391. | normal | COLLECT_TALK.cosyplace.done[1] · [script.ts:1005](/mnt/storage/qish/game/src/content/script.ts:1005) |
| ☐ D0544 | Qish | Duit birthday saya habis kat perut seekor sloth. | cry | COLLECT_TALK.cosyplace.done[2] · [script.ts:1006](/mnt/storage/qish/game/src/content/script.ts:1006) |
| ☐ D0545 | Qish | Okay Bowat. Cosy Place. Awak dah takde tempat nak lari. | smug | COLLECT_TALK.cosyplace.done[3] · [script.ts:1007](/mnt/storage/qish/game/src/content/script.ts:1007) |
| ☐ D0546 | Narator | Pengawal pintu: "Maaf kak. Hutang sloth kelabu tu belum langsai. Tak boleh keluar." | normal | COLLECT_TALK.cosyplace.notYet[1] · [script.ts:1010](/mnt/storage/qish/game/src/content/script.ts:1010) |
| ☐ D0547 | Qish | Resit Bowat baru ${got}/${need}. Kena kejar dia dulu. | pout | COLLECT_TALK.cosyplace.notYet[2] · [script.ts:1011](/mnt/storage/qish/game/src/content/script.ts:1011) |

<a id="qc-59"></a>

## 59. Misi koleksi · Lorbel

| QC / ID | Watak / jenis | Dialog asal | Ekspresi | Konteks / sumber |
|---|---|---|---|---|
| ☐ D0548 | Qish | Kertas? Ada tulis "REQUEST: PELUK 10 SAAT ♥". | surprised | COLLECT_TALK.galeri.first[1] · [script.ts:1016](/mnt/storage/qish/game/src/content/script.ts:1016) |
| ☐ D0549 | Qish | Ni mesti tulisan Bolat. | shy | COLLECT_TALK.galeri.first[2] · [script.ts:1017](/mnt/storage/qish/game/src/content/script.ts:1017) |
| ☐ D0550 | Narator | Kumpul semua kertas request Bolat. Cari cahaya kuning yang menegak ke langit! | normal | COLLECT_TALK.galeri.first[3] · [script.ts:1018](/mnt/storage/qish/game/src/content/script.ts:1018) |
| ☐ D0551 | Qish | Request last: "CIUM PIPI. DUA KALI." ...Okay, cukup enam. | shy | COLLECT_TALK.galeri.done[1] · [script.ts:1021](/mnt/storage/qish/game/src/content/script.ts:1021) |
| ☐ D0552 | Narator | Bawa balik kat Bolat, depan pentas busking. | normal | COLLECT_TALK.galeri.done[2] · [script.ts:1022](/mnt/storage/qish/game/src/content/script.ts:1022) |
| ☐ D0553 | Narator | Jalan keluar tersekat. Orang terlalu ramai. | normal | COLLECT_TALK.galeri.notYet[1] · [script.ts:1025](/mnt/storage/qish/game/src/content/script.ts:1025) |
| ☐ D0554 | Qish | Kertas request baru ${got}/${need}. Bolat tengah tunggu kat pentas. | thinking | COLLECT_TALK.galeri.notYet[2] · [script.ts:1026](/mnt/storage/qish/game/src/content/script.ts:1026) |

<a id="qc-60"></a>

## 60. Misi koleksi · Tasik Lily

| QC / ID | Watak / jenis | Dialog asal | Ekspresi | Konteks / sumber |
|---|---|---|---|---|
| ☐ D0555 | Qish | Lily! Wangi gila... Bunga favourite saya. | love | COLLECT_TALK.dusun.first[1] · [script.ts:1031](/mnt/storage/qish/game/src/content/script.ts:1031) |
| ☐ D0556 | Narator | Kumpul semua lily yang bersinar kat tengah tasik. Enam kuntum! | normal | COLLECT_TALK.dusun.first[2] · [script.ts:1032](/mnt/storage/qish/game/src/content/script.ts:1032) |
| ☐ D0557 | Qish | Kuntum last! Cukup enam, dah jadi satu jambak. | happy | COLLECT_TALK.dusun.done[1] · [script.ts:1035](/mnt/storage/qish/game/src/content/script.ts:1035) |
| ☐ D0558 | Narator | Dayung balik ke jeti, lepas tu bawa jambak lily kat Snorlax Twin dekat jambatan. | normal | COLLECT_TALK.dusun.done[2] · [script.ts:1036](/mnt/storage/qish/game/src/content/script.ts:1036) |
| ☐ D0559 | Narator | Snorlax Twin masih tidur atas jambatan. | normal | COLLECT_TALK.dusun.notYet[1] · [script.ts:1039](/mnt/storage/qish/game/src/content/script.ts:1039) |
| ☐ D0560 | Qish | Lily baru ${got}/${need}. Kena petik lagi kat tengah tasik. | thinking | COLLECT_TALK.dusun.notYet[2] · [script.ts:1040](/mnt/storage/qish/game/src/content/script.ts:1040) |

<a id="qc-61"></a>

## 61. Misi koleksi · Litar Sepang

| QC / ID | Watak / jenis | Dialog asal | Ekspresi | Konteks / sumber |
|---|---|---|---|---|
| ☐ D0561 | Narator | Satu pas dah dapat. Lagi lima. Cari tanda ! kat seluruh litar: pintu masuk, fan zone, pit lane, dan seberang jambatan. | normal | COLLECT_TALK.sepang.first[1] · [script.ts:1044](/mnt/storage/qish/game/src/content/script.ts:1044) |
| ☐ D0562 | Qish | Enam pas! ALL ACCESS. | excited | COLLECT_TALK.sepang.done[1] · [script.ts:1046](/mnt/storage/qish/game/src/content/script.ts:1046) |
| ☐ D0563 | Narator | Atas bangunan pit, seseorang menguap besar. Rambut panjang kerinting bergoyang. | normal | COLLECT_TALK.sepang.done[2] · [script.ts:1047](/mnt/storage/qish/game/src/content/script.ts:1047) |
| ☐ D0564 | Qish | Faris. Duduk situ. Jangan lari lagi. | angry | COLLECT_TALK.sepang.done[3] · [script.ts:1048](/mnt/storage/qish/game/src/content/script.ts:1048) |
| ☐ D0565 | Narator | Pergi ke tangga podium kat belakang bangunan pit. Abang Bouncer tengah tunggu. | normal | COLLECT_TALK.sepang.done[4] · [script.ts:1049](/mnt/storage/qish/game/src/content/script.ts:1049) |
| ☐ D0566 | Narator | Jalan balik ke Labu Lanjut masih ditutup. | normal | COLLECT_TALK.sepang.notYet[1] · [script.ts:1052](/mnt/storage/qish/game/src/content/script.ts:1052) |
| ☐ D0567 | Qish | Pas baru ${got}/${need}. Faris kat podium tu. Saya tak balik selagi tak jumpa dia. | normal | COLLECT_TALK.sepang.notYet[2] · [script.ts:1053](/mnt/storage/qish/game/src/content/script.ts:1053) |

<a id="qc-62"></a>

## 62. Misi koleksi · Lorong Photobooth

| QC / ID | Watak / jenis | Dialog asal | Ekspresi | Konteks / sumber |
|---|---|---|---|---|
| ☐ D0568 | Qish | Dapat pun! Tersangkut akhirnya. | excited | COLLECT_TALK.photobooth.first[1] · [script.ts:1058](/mnt/storage/qish/game/src/content/script.ts:1058) |
| ☐ D0569 | Qish | Gambar kita... elok lagi. Takde koyak. | love | COLLECT_TALK.photobooth.first[2] · [script.ts:1059](/mnt/storage/qish/game/src/content/script.ts:1059) |
| ☐ D0570 | Narator | Lagi lima strip terbang. Dekat sikit, dia terbang lagi. Ikut je jalan ular tu sampai dia tersangkut! | normal | COLLECT_TALK.photobooth.first[3] · [script.ts:1060](/mnt/storage/qish/game/src/content/script.ts:1060) |
| ☐ D0571 | Qish | Strip last! Cukup enam. | happy | COLLECT_TALK.photobooth.done[1] · [script.ts:1063](/mnt/storage/qish/game/src/content/script.ts:1063) |
| ☐ D0572 | Narator | Bawa balik kat Bolat ex, dekat easel depan kamera gergasi. | normal | COLLECT_TALK.photobooth.done[2] · [script.ts:1064](/mnt/storage/qish/game/src/content/script.ts:1064) |
| ☐ D0573 | Narator | Jalan ke Putrajaya masih tertutup. | normal | COLLECT_TALK.photobooth.notYet[1] · [script.ts:1067](/mnt/storage/qish/game/src/content/script.ts:1067) |
| ☐ D0574 | Qish | Strip baru ${got}/${need}. Bolat ex tengah tunggu kat kamera gergasi. | thinking | COLLECT_TALK.photobooth.notYet[2] · [script.ts:1068](/mnt/storage/qish/game/src/content/script.ts:1068) |

<a id="qc-63"></a>

## 63. Babah di KLIA

| QC / ID | Watak / jenis | Dialog asal | Ekspresi | Konteks / sumber |
|---|---|---|---|---|
| ☐ D0575 | Babah | Eh, Qish? Buat apa kat airport ni? | normal | BABAH.intro[1] · [script.ts:1077](/mnt/storage/qish/game/src/content/script.ts:1077) |
| ☐ D0576 | Qish | Babah! Babah ada nampak Faris tak? Dia hilang dari semalam. | worried | BABAH.intro[2] · [script.ts:1078](/mnt/storage/qish/game/src/content/script.ts:1078) |
| ☐ D0577 | Babah | F-Faris? Faris mana? ...Oh, Faris. Tak. Tak nampak. Langsung. | normal | BABAH.intro[3] · [script.ts:1079](/mnt/storage/qish/game/src/content/script.ts:1079) |
| ☐ D0578 | Babah | Babah tak tahu apa-apa pasal kek mango. | normal | BABAH.intro[4] · [script.ts:1080](/mnt/storage/qish/game/src/content/script.ts:1080) |
| ☐ D0579 | Qish | ...Kek mango apa? | thinking | BABAH.intro[5] · [script.ts:1081](/mnt/storage/qish/game/src/content/script.ts:1081) |
| ☐ D0580 | Babah | Kek apa? Takde kek. Babah cakap... kapal. Kapal mango. Eh. | normal | BABAH.intro[6] · [script.ts:1082](/mnt/storage/qish/game/src/content/script.ts:1082) |
| ☐ D0581 | Babah | Ha, alang-alang Qish ada ni, tolong Babah kejap. | normal | BABAH.intro[7] · [script.ts:1083](/mnt/storage/qish/game/src/content/script.ts:1083) |
| ☐ D0582 | Babah | Tadi Raja Nonchalant datang pinjam tools Babah. Katanya nak baiki katil dia. | normal | BABAH.intro[8] · [script.ts:1084](/mnt/storage/qish/game/src/content/script.ts:1084) |
| ☐ D0583 | Babah | Lepas tu dia malas nak pulangkan. Tinggal merata-rata satu airport. | normal | BABAH.intro[9] · [script.ts:1085](/mnt/storage/qish/game/src/content/script.ts:1085) |
| ☐ D0584 | Babah | Tanpa tools tu Babah tak boleh tutup enjin kapal ni. Tolong kutip, boleh? | normal | BABAH.intro[10] · [script.ts:1086](/mnt/storage/qish/game/src/content/script.ts:1086) |
| ☐ D0585 | Narator | Kumpul semua tools Babah. Cari cahaya kuning! | normal | BABAH.intro[11] · [script.ts:1087](/mnt/storage/qish/game/src/content/script.ts:1087) |
| ☐ D0586 | Babah | Belum jumpa satu pun? Cari cahaya kuning tu. | normal | BABAH.remind[1] · got === 0 · [script.ts:1091](/mnt/storage/qish/game/src/content/script.ts:1091) |
| ☐ D0587 | Babah | Dapat ${got}/${need} dah? Ada lagi tu. Spanar tork Babah tu mahal tau. | normal | BABAH.remind[1] · bukan got === 0 · [script.ts:1092](/mnt/storage/qish/game/src/content/script.ts:1092) |
| ☐ D0588 | Narator | Raja Nonchalant tinggal merata: depan terminal, tepi teksi, sampai ke tepi landasan. | normal | BABAH.remind[2] · [script.ts:1093](/mnt/storage/qish/game/src/content/script.ts:1093) |
| ☐ D0589 | Qish | Babah! Semua tools dah jumpa! | excited | BABAH.fix[1] · [script.ts:1096](/mnt/storage/qish/game/src/content/script.ts:1096) |
| ☐ D0590 | Babah | Pandai anak Babah. Kejap, Babah ketatkan bolt terakhir... | normal | BABAH.fix[2] · [script.ts:1097](/mnt/storage/qish/game/src/content/script.ts:1097) |
| ☐ D0591 | Babah | Siap. Enjin elok, minyak penuh, cowling dah tutup. | normal | BABAH.fixed[1] · [script.ts:1100](/mnt/storage/qish/game/src/content/script.ts:1100) |
| ☐ D0592 | Qish | Siapa nak bawa kapal ni? | thinking | BABAH.fixed[2] · [script.ts:1101](/mnt/storage/qish/game/src/content/script.ts:1101) |
| ☐ D0593 | Babah | Pilot cuti hari ni. Qish la bawa. Senang je, macam bawa Myvi. | normal | BABAH.fixed[3] · [script.ts:1102](/mnt/storage/qish/game/src/content/script.ts:1102) |
| ☐ D0594 | Qish | BABAH. | angry | BABAH.fixed[4] · [script.ts:1103](/mnt/storage/qish/game/src/content/script.ts:1103) |
| ☐ D0595 | Babah | Blep tunggu kat tangga tu. Pergi kejar Raja Nonchalant... eh. Pergi la jalan-jalan. Bukan sebab apa-apa. | normal | BABAH.fixed[5] · [script.ts:1104](/mnt/storage/qish/game/src/content/script.ts:1104) |
| ☐ D0596 | Babah | Kapal dah siap. Enjin dah panas. | normal | BABAH.ready[1] · [script.ts:1107](/mnt/storage/qish/game/src/content/script.ts:1107) |
| ☐ D0597 | Babah | Faris? Tak nampak. Langsung. Sumpah. | normal | BABAH.ready[2] · [script.ts:1108](/mnt/storage/qish/game/src/content/script.ts:1108) |
| ☐ D0598 | Babah | Nak terbang sekarang? Blep jadi co-pilot. | normal | BABAH.ask · [script.ts:1111](/mnt/storage/qish/game/src/content/script.ts:1111) |
| ☐ D0599 | Babah | Pakai tali pinggang. Jangan tekan butang merah. | normal | BABAH.sendoff[1] · [script.ts:1113](/mnt/storage/qish/game/src/content/script.ts:1113) |
| ☐ D0600 | Qish | Butang merah tu apa? | thinking | BABAH.sendoff[2] · [script.ts:1114](/mnt/storage/qish/game/src/content/script.ts:1114) |
| ☐ D0601 | Babah | Babah pun tak pasti. Tu yang jangan tekan. | normal | BABAH.sendoff[3] · [script.ts:1115](/mnt/storage/qish/game/src/content/script.ts:1115) |
| ☐ D0602 | Blep | Blep! 😛 | normal | BABAH.sendoff[4] · [script.ts:1116](/mnt/storage/qish/game/src/content/script.ts:1116) |
| ☐ D0603 | Narator | MALAS AIR, kapal Raja Nonchalant, tengah berpusing-pusing atas KLIA. | normal | BABAH.sendoff[5] · [script.ts:1117](/mnt/storage/qish/game/src/content/script.ts:1117) |
| ☐ D0604 | Babah | Nak terbang lagi? Kapal Babah sentiasa siap untuk Qish. | normal | BABAH.again · [script.ts:1120](/mnt/storage/qish/game/src/content/script.ts:1120) |
| ☐ D0605 | Babah | Okay. Kapal tunggu. Babah pun tunggu. Raja Nonchalant je yang tak tunggu sesiapa. | normal | BABAH.notNow[1] · [script.ts:1121](/mnt/storage/qish/game/src/content/script.ts:1121) |
| ☐ D0606 | Babah | Dah balik? Kapal Babah ok tak? ...Calar sikit takpe. | normal | BABAH.after[1] · [script.ts:1123](/mnt/storage/qish/game/src/content/script.ts:1123) |
| ☐ D0607 | Babah | Faris? Tak tahu. Kek takde. Belon pun takde. Padang tepi rumah pun takde apa-apa. | normal | BABAH.after[2] · [script.ts:1124](/mnt/storage/qish/game/src/content/script.ts:1124) |
| ☐ D0608 | Narator | (Babah sangat tak pandai simpan rahsia.) | normal | BABAH.after[3] · [script.ts:1125](/mnt/storage/qish/game/src/content/script.ts:1125) |
| ☐ D0609 | Babah | Selamat hari jadi, Qish. | normal | BABAH.party[1] · [script.ts:1129](/mnt/storage/qish/game/src/content/script.ts:1129) |
| ☐ D0610 | Babah | Babah dah tahu dari awal sebenarnya. Susah betul nak simpan rahsia dengan kamu ni. | normal | BABAH.party[2] · [script.ts:1130](/mnt/storage/qish/game/src/content/script.ts:1130) |

<a id="qc-64"></a>

## 64. Blep sebelum kapal siap

| QC / ID | Watak / jenis | Dialog asal | Ekspresi | Konteks / sumber |
|---|---|---|---|---|
| ☐ D0611 | Blep | Blep! 😛 | normal | BLEP_NOT_READY[1] · [script.ts:1136](/mnt/storage/qish/game/src/content/script.ts:1136) |
| ☐ D0612 | Narator | Blep tunjuk enjin kapal yang masih terbuka. Cakap dengan Babah dulu. | normal | BLEP_NOT_READY[2] · [script.ts:1137](/mnt/storage/qish/game/src/content/script.ts:1137) |

<a id="qc-65"></a>

## 65. Boss sebelum koleksi cukup

| QC / ID | Watak / jenis | Dialog asal | Ekspresi | Konteks / sumber |
|---|---|---|---|---|
| ☐ D0613 | Narator | ${boss} buat-buat tak nampak awak. | normal | bossCollectNotYet[1] · [script.ts:1142](/mnt/storage/qish/game/src/content/script.ts:1142) |
| ☐ D0614 | Narator | Kumpul semua ${name} kat sini dulu (${got}/${need}). | normal | bossCollectNotYet[2] · [script.ts:1143](/mnt/storage/qish/game/src/content/script.ts:1143) |

<a id="qc-66"></a>

## 66. Skip minigame

| QC / ID | Watak / jenis | Dialog asal | Ekspresi | Konteks / sumber |
|---|---|---|---|---|
| ☐ D0615 | Narator | Faris kata awak menang. Jangan bagitau sesiapa. 🤫 | normal | SKIP_LINES[1] · [script.ts:1146](/mnt/storage/qish/game/src/content/script.ts:1146) |

<a id="qc-67"></a>

## 67. Boss · Bowat

| QC / ID | Watak / jenis | Dialog asal | Ekspresi | Konteks / sumber |
|---|---|---|---|---|
| ☐ D0616 | Bowat | *PROT* | relief | BOSS_TALK.bowat.collect[1] · [script.ts:1151](/mnt/storage/qish/game/src/content/script.ts:1151) |
| ☐ D0617 | Qish | BOWAT! Keluar dari situ! | angry | BOSS_TALK.bowat.collect[2] · [script.ts:1152](/mnt/storage/qish/game/src/content/script.ts:1152) |
| ☐ D0618 | Narator | Awan keliling Bowat tebal sangat. Tak boleh dekat. | normal | BOSS_TALK.bowat.collect[3] · [script.ts:1153](/mnt/storage/qish/game/src/content/script.ts:1153) |
| ☐ D0619 | Narator | Sembur awan-awan kentut kat luar dulu, baru awan ni nipis (${got}/${need}). | normal | BOSS_TALK.bowat.collect[4] · [script.ts:1154](/mnt/storage/qish/game/src/content/script.ts:1154) |
| ☐ D0620 | Bowat | *PROT* | relief | BOSS_TALK.bowat.pre[1] · [script.ts:1157](/mnt/storage/qish/game/src/content/script.ts:1157) |
| ☐ D0621 | Qish | BOWAT! Kenapa awak kentut kat semua orang kat sini?? | angry | BOSS_TALK.bowat.pre[2] · [script.ts:1158](/mnt/storage/qish/game/src/content/script.ts:1158) |
| ☐ D0622 | Qish | Satu Bukit Bintang lari sebab awak! Monorel pun nyaris tak berhenti! | angry | BOSS_TALK.bowat.pre[3] · [script.ts:1159](/mnt/storage/qish/game/src/content/script.ts:1159) |
| ☐ D0623 | Bowat | ...Bukan saya. Itu bau shawarma. | innocent | BOSS_TALK.bowat.pre[4] · [script.ts:1160](/mnt/storage/qish/game/src/content/script.ts:1160) |
| ☐ D0624 | Qish · soalan pilihan | Lawan Bowat? | normal | BOSS_TALK.bowat.ask · [script.ts:1162](/mnt/storage/qish/game/src/content/script.ts:1162) |
| ☐ D0625 | Bowat | ...okay okay. Saya kalah. | defeated | BOSS_TALK.bowat.win[1] · [script.ts:1164](/mnt/storage/qish/game/src/content/script.ts:1164) |
| ☐ D0626 | Bowat | Bukan saya yang kentut. 100% bukan saya. 0% bukti. | smug | BOSS_TALK.bowat.win[2] · [script.ts:1165](/mnt/storage/qish/game/src/content/script.ts:1165) |
| ☐ D0627 | Bowat | Raja Nonchalant suruh saya jaga kad ni. Tapi saya lagi sayang awak. Nah. | love | BOSS_TALK.bowat.win[3] · [script.ts:1166](/mnt/storage/qish/game/src/content/script.ts:1166) |
| ☐ D0628 | Bowat | Mulai sekarang saya ikut awak. Jangan risau, saya kentut senyap je. | happy | BOSS_TALK.bowat.after[1] · [script.ts:1169](/mnt/storage/qish/game/src/content/script.ts:1169) |
| ☐ D0629 | Qish | ITU YANG PALING BAHAYA!! | surprised | BOSS_TALK.bowat.after[2] · [script.ts:1170](/mnt/storage/qish/game/src/content/script.ts:1170) |
| ☐ D0630 | Qish | Eh Bowat, awak nampak Faris tak? | thinking | BOSS_TALK.bowat.after[3] · [script.ts:1171](/mnt/storage/qish/game/src/content/script.ts:1171) |
| ☐ D0631 | Bowat | ...Saya tak boleh cakap. Raja Nonchalant pesan. | guilty | BOSS_TALK.bowat.after[4] · [script.ts:1172](/mnt/storage/qish/game/src/content/script.ts:1172) |
| ☐ D0632 | Qish | Siapa Raja Nonchalant ni sebenarnya?? | pout | BOSS_TALK.bowat.after[5] · [script.ts:1173](/mnt/storage/qish/game/src/content/script.ts:1173) |

<a id="qc-68"></a>

## 68. Boss · Bolat

| QC / ID | Watak / jenis | Dialog asal | Ekspresi | Konteks / sumber |
|---|---|---|---|---|
| ☐ D0633 | Narator | Busker tengah nyanyi. Rambut kerinting... spek... baju Pepe... | normal | BOSS_TALK.bolat.collect[1] · got === 0 · [script.ts:1180](/mnt/storage/qish/game/src/content/script.ts:1180) |
| ☐ D0634 | Qish | FARIS?! | surprised | BOSS_TALK.bolat.collect[2] · got === 0 · [script.ts:1181](/mnt/storage/qish/game/src/content/script.ts:1181) |
| ☐ D0635 | Narator | Bukan. Tu cover band Luqman Podolski. | normal | BOSS_TALK.bolat.collect[3] · got === 0 · [script.ts:1182](/mnt/storage/qish/game/src/content/script.ts:1182) |
| ☐ D0636 | Bolat | Qish! Sini, sini! Saya dah booking pentas ni malam ni. | normal | BOSS_TALK.bolat.collect[4] · got === 0 · [script.ts:1183](/mnt/storage/qish/game/src/content/script.ts:1183) |
| ☐ D0637 | Bolat | Saya tulis ${need} kertas request untuk awak. Kiss, cuddle, peluk... semua kena dipenuhi! | normal | BOSS_TALK.bolat.collect[5] · got === 0 · [script.ts:1184](/mnt/storage/qish/game/src/content/script.ts:1184) |
| ☐ D0638 | Bolat | Tapi angin tiup, semua terbang masuk crowd. Tolong kutip balik? | normal | BOSS_TALK.bolat.collect[6] · got === 0 · [script.ts:1185](/mnt/storage/qish/game/src/content/script.ts:1185) |
| ☐ D0639 | Qish | ...Awak suruh saya cari request untuk diri saya sendiri? | surprised | BOSS_TALK.bolat.collect[7] · got === 0 · [script.ts:1186](/mnt/storage/qish/game/src/content/script.ts:1186) |
| ☐ D0640 | Bolat | Yes. All requests must be fulfilled. | normal | BOSS_TALK.bolat.collect[8] · got === 0 · [script.ts:1187](/mnt/storage/qish/game/src/content/script.ts:1187) |
| ☐ D0641 | Bolat | Dah jumpa ${got}/${need}! Lagi ${need - got}. Request tak boleh hilang! | normal | BOSS_TALK.bolat.collect[1] · bukan got === 0 · [script.ts:1189](/mnt/storage/qish/game/src/content/script.ts:1189) |
| ☐ D0642 | Bolat | Semua request dah ada! Okay, naik pentas. | normal | BOSS_TALK.bolat.pre[1] · [script.ts:1191](/mnt/storage/qish/game/src/content/script.ts:1191) |
| ☐ D0643 | Bolat | Kiss. Cuddle. Peluk. Ikut rentak. Semua request MESTI dipenuhi! | normal | BOSS_TALK.bolat.pre[2] · [script.ts:1192](/mnt/storage/qish/game/src/content/script.ts:1192) |
| ☐ D0644 | Qish | ...depan semua orang ni?! | shy | BOSS_TALK.bolat.pre[3] · [script.ts:1193](/mnt/storage/qish/game/src/content/script.ts:1193) |
| ☐ D0645 | Qish · soalan pilihan | Naik pentas dengan Bolat? | normal | BOSS_TALK.bolat.ask · [script.ts:1195](/mnt/storage/qish/game/src/content/script.ts:1195) |
| ☐ D0646 | Bolat | Semua request dipenuhi. Satu Lorbel bagi standing ovation! | normal | BOSS_TALK.bolat.win[1] · [script.ts:1197](/mnt/storage/qish/game/src/content/script.ts:1197) |
| ☐ D0647 | Bolat | Nah, kad ni. Jangan lupa ambil gambar sama-sama nanti! | normal | BOSS_TALK.bolat.win[2] · [script.ts:1198](/mnt/storage/qish/game/src/content/script.ts:1198) |

<a id="qc-69"></a>

## 69. Boss · Snorlax Twin

| QC / ID | Watak / jenis | Dialog asal | Ekspresi | Konteks / sumber |
|---|---|---|---|---|
| ☐ D0648 | Narator | Ada sesuatu yang sangat besar tengah tidur atas tikar picnic, menghalang jambatan. | normal | BOSS_TALK.snorlax.collect[1] · got === 0 · [script.ts:1205](/mnt/storage/qish/game/src/content/script.ts:1205) |
| ☐ D0649 | Qish | ...Kejap. Itu saya ke?? Snorlax Twin?! | surprised | BOSS_TALK.snorlax.collect[2] · got === 0 · [script.ts:1206](/mnt/storage/qish/game/src/content/script.ts:1206) |
| ☐ D0650 | Snorlax Twin | Zzz... bunga... lily... Zzz... | normal | BOSS_TALK.snorlax.collect[3] · got === 0 · [script.ts:1207](/mnt/storage/qish/game/src/content/script.ts:1207) |
| ☐ D0651 | Qish | Dia mengigau pasal lily. Bunga favourite saya tu. | happy | BOSS_TALK.snorlax.collect[4] · got === 0 · [script.ts:1208](/mnt/storage/qish/game/src/content/script.ts:1208) |
| ☐ D0652 | Narator | Banyak lily kat tengah tasik. Naik sampan kat jeti, petik enam kuntum. | normal | BOSS_TALK.snorlax.collect[5] · got === 0 · [script.ts:1209](/mnt/storage/qish/game/src/content/script.ts:1209) |
| ☐ D0653 | Snorlax Twin | Zzz... lily... lagi... Zzz... | normal | BOSS_TALK.snorlax.collect[1] · bukan got === 0 · [script.ts:1212](/mnt/storage/qish/game/src/content/script.ts:1212) |
| ☐ D0654 | Qish | Baru ${got}/${need}. Kena petik lagi kat tengah tasik. | thinking | BOSS_TALK.snorlax.collect[2] · bukan got === 0 · [script.ts:1213](/mnt/storage/qish/game/src/content/script.ts:1213) |
| ☐ D0655 | Qish | Snorlax Twin. Nah, enam kuntum lily. | happy | BOSS_TALK.snorlax.pre[1] · [script.ts:1216](/mnt/storage/qish/game/src/content/script.ts:1216) |
| ☐ D0656 | Narator | Hidung besar tu kembang kempis... bau wangi... sebelah mata terbuka. | normal | BOSS_TALK.snorlax.pre[2] · [script.ts:1217](/mnt/storage/qish/game/src/content/script.ts:1217) |
| ☐ D0657 | Snorlax Twin | ...Wangi. Tapi saya LAPAR. | normal | BOSS_TALK.snorlax.pre[3] · [script.ts:1218](/mnt/storage/qish/game/src/content/script.ts:1218) |
| ☐ D0658 | Qish | Of course. Okay. Kena bagi makan. | smug | BOSS_TALK.snorlax.pre[4] · [script.ts:1219](/mnt/storage/qish/game/src/content/script.ts:1219) |
| ☐ D0659 | Qish · soalan pilihan | Bagi Snorlax Twin makan? | normal | BOSS_TALK.snorlax.ask · [script.ts:1221](/mnt/storage/qish/game/src/content/script.ts:1221) |
| ☐ D0660 | Snorlax Twin | *nyam nyam* ...daging salai, kek mango, Dubuyo, malatang... | normal | BOSS_TALK.snorlax.win[1] · [script.ts:1223](/mnt/storage/qish/game/src/content/script.ts:1223) |
| ☐ D0661 | Snorlax Twin | Okay saya dah kenyang. Lily tu simpan, cantik. Lalu la. Zzz... | normal | BOSS_TALK.snorlax.win[2] · [script.ts:1224](/mnt/storage/qish/game/src/content/script.ts:1224) |
| ☐ D0662 | Qish | Sama macam saya lepas makan. | laugh | BOSS_TALK.snorlax.win[3] · [script.ts:1225](/mnt/storage/qish/game/src/content/script.ts:1225) |

<a id="qc-70"></a>

## 70. Boss · Blep

| QC / ID | Watak / jenis | Dialog asal | Ekspresi | Konteks / sumber |
|---|---|---|---|---|
| ☐ D0663 | Blep | Blep! 😛 | normal | BOSS_TALK.blep.pre[1] · [script.ts:1230](/mnt/storage/qish/game/src/content/script.ts:1230) |
| ☐ D0664 | Narator | MALAS AIR, kapal Raja Nonchalant, tengah berpusing-pusing atas KLIA. | normal | BOSS_TALK.blep.pre[2] · [script.ts:1231](/mnt/storage/qish/game/src/content/script.ts:1231) |
| ☐ D0665 | Qish | Jom terbang. Kita bagi Omey Blast kat dia. | smug | BOSS_TALK.blep.pre[3] · [script.ts:1232](/mnt/storage/qish/game/src/content/script.ts:1232) |
| ☐ D0666 | Qish · soalan pilihan | Terbang kejar MALAS AIR? | normal | BOSS_TALK.blep.ask · [script.ts:1234](/mnt/storage/qish/game/src/content/script.ts:1234) |
| ☐ D0667 | Narator | MALAS AIR terkena Omey Blast. Satu-satunya mesej dari kokpit: | normal | BOSS_TALK.blep.win[1] · [script.ts:1236](/mnt/storage/qish/game/src/content/script.ts:1236) |
| ☐ D0668 | Raja Nonchalant | ALAMAK. | normal | BOSS_TALK.blep.win[2] · [script.ts:1237](/mnt/storage/qish/game/src/content/script.ts:1237) |
| ☐ D0669 | Blep | Blep! Nah kad. | normal | BOSS_TALK.blep.win[3] · [script.ts:1238](/mnt/storage/qish/game/src/content/script.ts:1238) |

<a id="qc-71"></a>

## 71. Boss · Mega Bowat

| QC / ID | Watak / jenis | Dialog asal | Ekspresi | Konteks / sumber |
|---|---|---|---|---|
| ☐ D0670 | Bowat | *nyom* | nyom | BOSS_TALK.megabowat.collect[1] · [script.ts:1243](/mnt/storage/qish/game/src/content/script.ts:1243) |
| ☐ D0671 | Maître d' | Mademoiselle, sloth ini dah duduk di meja 8 cik. Saya tak berani halau. Dia... menggigit. | normal | BOSS_TALK.megabowat.collect[2] · [script.ts:1244](/mnt/storage/qish/game/src/content/script.ts:1244) |
| ☐ D0672 | Maître d' | Tapi dapur tak benarkan hidang lagi. Ehem. Hutang dia kat bandar ni belum langsai. | normal | BOSS_TALK.megabowat.collect[3] · [script.ts:1245](/mnt/storage/qish/game/src/content/script.ts:1245) |
| ☐ D0673 | Qish | Resit Bowat baru ${got}/${need}. Kena settle semua dulu. | thinking | BOSS_TALK.megabowat.collect[4] · [script.ts:1246](/mnt/storage/qish/game/src/content/script.ts:1246) |
| ☐ D0674 | Narator | Bowat duduk di meja 8. Depan dia, sepinggan lasagna. | normal | BOSS_TALK.megabowat.pre[1] · [script.ts:1249](/mnt/storage/qish/game/src/content/script.ts:1249) |
| ☐ D0675 | Qish | Bowat. Itu lasagna first date saya. | angry | BOSS_TALK.megabowat.pre[2] · [script.ts:1250](/mnt/storage/qish/game/src/content/script.ts:1250) |
| ☐ D0676 | Bowat | ...nyom. | nyom | BOSS_TALK.megabowat.pre[3] · [script.ts:1251](/mnt/storage/qish/game/src/content/script.ts:1251) |
| ☐ D0677 | Narator | Kek mango. Ayam gepuk. Malatang. Dubuyo. McD. Daging salai. Cookies. Dan sekarang lasagna. | normal | BOSS_TALK.megabowat.pre[4] · [script.ts:1252](/mnt/storage/qish/game/src/content/script.ts:1252) |
| ☐ D0678 | Narator | Perut Bowat mula bercahaya! | normal | BOSS_TALK.megabowat.pre[5] · [script.ts:1253](/mnt/storage/qish/game/src/content/script.ts:1253) |
| ☐ D0679 | Narator | Bowat sedang evolve! | normal | BOSS_TALK.megabowat.pre[6] · [script.ts:1254](/mnt/storage/qish/game/src/content/script.ts:1254) |
| ☐ D0680 | Mega Bowat | MAKAN BANYAK!! | normal | BOSS_TALK.megabowat.pre[7] · [script.ts:1255](/mnt/storage/qish/game/src/content/script.ts:1255) |
| ☐ D0681 | Narator | Mega Bowat terbang masuk dapur Cosy Place. Chef menjerit dari dalam. | normal | BOSS_TALK.megabowat.pre[8] · [script.ts:1256](/mnt/storage/qish/game/src/content/script.ts:1256) |
| ☐ D0682 | Qish | Bowat, jangan habiskan cookies chef!! | worried | BOSS_TALK.megabowat.pre[9] · [script.ts:1257](/mnt/storage/qish/game/src/content/script.ts:1257) |
| ☐ D0683 | Qish · soalan pilihan | Kejar Mega Bowat ke dapur? | normal | BOSS_TALK.megabowat.ask · [script.ts:1259](/mnt/storage/qish/game/src/content/script.ts:1259) |
| ☐ D0684 | Mega Bowat | *garu ontot* ...okay saya kenyang. | normal | BOSS_TALK.megabowat.win[1] · [script.ts:1261](/mnt/storage/qish/game/src/content/script.ts:1261) |
| ☐ D0685 | Mega Bowat | PROT. | normal | BOSS_TALK.megabowat.win[2] · [script.ts:1262](/mnt/storage/qish/game/src/content/script.ts:1262) |
| ☐ D0686 | Qish | BOWAT!! | angry | BOSS_TALK.megabowat.win[3] · [script.ts:1263](/mnt/storage/qish/game/src/content/script.ts:1263) |
| ☐ D0687 | Bowat | *terbaring, perut ke atas* ...saya dah kecik balik. | defeated | BOSS_TALK.megabowat.after[1] · [script.ts:1266](/mnt/storage/qish/game/src/content/script.ts:1266) |
| ☐ D0688 | Maître d' | Mademoiselle. Untuk kerosakan dapur... | normal | BOSS_TALK.megabowat.after[2] · [script.ts:1267](/mnt/storage/qish/game/src/content/script.ts:1267) |
| ☐ D0689 | Narator | Maître d' hulur resit. Panjang. Sangat panjang. Sampai ke lantai. | normal | BOSS_TALK.megabowat.after[3] · [script.ts:1268](/mnt/storage/qish/game/src/content/script.ts:1268) |
| ☐ D0690 | Qish | ... | worried | BOSS_TALK.megabowat.after[4] · [script.ts:1269](/mnt/storage/qish/game/src/content/script.ts:1269) |
| ☐ D0691 | Maître d' | Bergurau. Encik rambut kerinting dah bayar semua petang tadi. Termasuk dapur. | normal | BOSS_TALK.megabowat.after[5] · [script.ts:1270](/mnt/storage/qish/game/src/content/script.ts:1270) |
| ☐ D0692 | Qish | Faris...? | surprised | BOSS_TALK.megabowat.after[6] · [script.ts:1271](/mnt/storage/qish/game/src/content/script.ts:1271) |
| ☐ D0693 | Maître d' | Dia pesan satu je: jangan bagi cik lapar. | normal | BOSS_TALK.megabowat.after[7] · [script.ts:1272](/mnt/storage/qish/game/src/content/script.ts:1272) |
| ☐ D0694 | Qish | ...Dia ni. Tak reti cakap, tapi reti tempah meja. | love | BOSS_TALK.megabowat.after[8] · [script.ts:1273](/mnt/storage/qish/game/src/content/script.ts:1273) |
| ☐ D0695 | Bowat | Jom. Jalan keluar kat atas kanan. Photobooth. | happy | BOSS_TALK.megabowat.after[9] · [script.ts:1274](/mnt/storage/qish/game/src/content/script.ts:1274) |

<a id="qc-72"></a>

## 72. Boss · Bolat ex

| QC / ID | Watak / jenis | Dialog asal | Ekspresi | Konteks / sumber |
|---|---|---|---|---|
| ☐ D0696 | Narator | Atas easel ada lukisan doodle: dua orang, garisan marker hitam. | normal | BOSS_TALK.bolatex.collect[1] · got === 0 · [script.ts:1281](/mnt/storage/qish/game/src/content/script.ts:1281) |
| ☐ D0697 | Qish | Eh, ni lukisan saya! Faris dengan saya. | surprised | BOSS_TALK.bolatex.collect[2] · got === 0 · [script.ts:1282](/mnt/storage/qish/game/src/content/script.ts:1282) |
| ☐ D0698 | Bolat ex | Hehe. Saya pinjam kejap, nak tiru gaya awak. | normal | BOSS_TALK.bolatex.collect[3] · got === 0 · [script.ts:1283](/mnt/storage/qish/game/src/content/script.ts:1283) |
| ☐ D0699 | Bolat ex | Qish! Awak sampai jugak ke Lorong Photobooth. | normal | BOSS_TALK.bolatex.collect[4] · got === 0 · [script.ts:1284](/mnt/storage/qish/game/src/content/script.ts:1284) |
| ☐ D0700 | Bolat ex | Ni Galeri Memori saya. Dalam lensa BOLAT·CAM. Semua strip korang saya gantung kat depan dia. | normal | BOSS_TALK.bolatex.collect[5] · got === 0 · [script.ts:1285](/mnt/storage/qish/game/src/content/script.ts:1285) |
| ☐ D0701 | Bolat ex | Tapi tadi dia flash kuat sangat... angin dia terbangkan enam strip. | normal | BOSS_TALK.bolatex.collect[6] · got === 0 · [script.ts:1286](/mnt/storage/qish/game/src/content/script.ts:1286) |
| ☐ D0702 | Bolat ex | Strip tu degil. Awak dekat, dia lari. Kejar ikut jalan sampai dia tersangkut! | normal | BOSS_TALK.bolatex.collect[7] · got === 0 · [script.ts:1287](/mnt/storage/qish/game/src/content/script.ts:1287) |
| ☐ D0703 | Bolat ex | Dah dapat ${got}/${need}! Lagi ${need - got}. Tengok cahaya kuning, ikut jalan ular tu. | normal | BOSS_TALK.bolatex.collect[1] · bukan got === 0 · [script.ts:1289](/mnt/storage/qish/game/src/content/script.ts:1289) |
| ☐ D0704 | Bolat ex | Cukup sepuluh balik! Terima kasih, Qish. | normal | BOSS_TALK.bolatex.pre[1] · [script.ts:1291](/mnt/storage/qish/game/src/content/script.ts:1291) |
| ☐ D0705 | Bolat ex | Gambar photobooth yang hilang dari bilik awak tu? Saya yang simpan. | normal | BOSS_TALK.bolatex.pre[2] · [script.ts:1292](/mnt/storage/qish/game/src/content/script.ts:1292) |
| ☐ D0706 | Bolat ex | Semua kenangan korang saya gantung depan lensa ni, bawah lampu. | normal | BOSS_TALK.bolatex.pre[3] · [script.ts:1293](/mnt/storage/qish/game/src/content/script.ts:1293) |
| ☐ D0707 | Bolat ex | Tapi Faris malas susun. Tolong padankan semula! | normal | BOSS_TALK.bolatex.pre[4] · [script.ts:1294](/mnt/storage/qish/game/src/content/script.ts:1294) |
| ☐ D0708 | Qish · soalan pilihan | Susun semula kenangan? | normal | BOSS_TALK.bolatex.ask · [script.ts:1296](/mnt/storage/qish/game/src/content/script.ts:1296) |
| ☐ D0709 | Bolat ex | Semua kenangan dah tersusun. Good memories ♡ | normal | BOSS_TALK.bolatex.win[1] · [script.ts:1298](/mnt/storage/qish/game/src/content/script.ts:1298) |
| ☐ D0710 | Bolat ex | Nanti saya hantar balik semua gambar ni ke bilik awak. | normal | BOSS_TALK.bolatex.win[2] · [script.ts:1299](/mnt/storage/qish/game/src/content/script.ts:1299) |
| ☐ D0711 | Bolat ex | Lepas ni lagi banyak adventure, okay? | normal | BOSS_TALK.bolatex.win[3] · [script.ts:1300](/mnt/storage/qish/game/src/content/script.ts:1300) |

<a id="qc-73"></a>

## 73. Boss · Qish ex

| QC / ID | Watak / jenis | Dialog asal | Ekspresi | Konteks / sumber |
|---|---|---|---|---|
| ☐ D0712 | Narator | Qish berdiri kat garisan START. Badan dah panas, kasut dah ikat. | normal | BOSS_TALK.qishex.pre[1] · [script.ts:1305](/mnt/storage/qish/game/src/content/script.ts:1305) |
| ☐ D0713 | ??? | FAT ASS! | normal | BOSS_TALK.qishex.pre[2] · [script.ts:1306](/mnt/storage/qish/game/src/content/script.ts:1306) |
| ☐ D0714 | Qish | ...Siapa cakap tu?! | angry | BOSS_TALK.qishex.pre[3] · [script.ts:1307](/mnt/storage/qish/game/src/content/script.ts:1307) |
| ☐ D0715 | Narator | Ada orang pecut ke arah Perdana Putra sambil jerit, rambut berkibar. Muka dia... macam Qish. | normal | BOSS_TALK.qishex.pre[4] · [script.ts:1308](/mnt/storage/qish/game/src/content/script.ts:1308) |
| ☐ D0716 | ??? | LAPAN PULUH ENAM KG! FAT ASS! | normal | BOSS_TALK.qishex.pre[5] · [script.ts:1309](/mnt/storage/qish/game/src/content/script.ts:1309) |
| ☐ D0717 | Qish | SAYA DAH 80 LA! SINI AWAK! | angry | BOSS_TALK.qishex.pre[6] · [script.ts:1310](/mnt/storage/qish/game/src/content/script.ts:1310) |
| ☐ D0718 | Narator | Angat Kuyush diaktifkan! | normal | BOSS_TALK.qishex.pre[7] · [script.ts:1311](/mnt/storage/qish/game/src/content/script.ts:1311) |
| ☐ D0719 | Qish · soalan pilihan | Kejar dia? | normal | BOSS_TALK.qishex.ask · [script.ts:1313](/mnt/storage/qish/game/src/content/script.ts:1313) |
| ☐ D0720 | Narator | Satu Putrajaya berhenti jogging. Semua orang lupa matematik dan jerit: | normal | BOSS_TALK.qishex.win[1] · [script.ts:1315](/mnt/storage/qish/game/src/content/script.ts:1315) |
| ☐ D0721 | ??? | SHE'S SO TINY! | normal | BOSS_TALK.qishex.win[2] · [script.ts:1316](/mnt/storage/qish/game/src/content/script.ts:1316) |
| ☐ D0722 | Qish | Tau pun. | smug | BOSS_TALK.qishex.win[3] · [script.ts:1317](/mnt/storage/qish/game/src/content/script.ts:1317) |

<a id="qc-74"></a>

## 74. Boss · Raja Nonchalant

| QC / ID | Watak / jenis | Dialog asal | Ekspresi | Konteks / sumber |
|---|---|---|---|---|
| ☐ D0723 | Raja Nonchalant | Akhirnya awak sampai juga, Qish. | normal | BOSS_TALK.finale.pre[1] · [script.ts:1322](/mnt/storage/qish/game/src/content/script.ts:1322) |
| ☐ D0724 | Qish | FARIS?! Awak pergi mana?! Semalam "k bye" je, lepas tu hilang! | angry | BOSS_TALK.finale.pre[2] · [script.ts:1323](/mnt/storage/qish/game/src/content/script.ts:1323) |
| ☐ D0725 | Raja Nonchalant | Alamak. | normal | BOSS_TALK.finale.pre[3] · [script.ts:1324](/mnt/storage/qish/game/src/content/script.ts:1324) |
| ☐ D0726 | Raja Nonchalant | Saya sekarang Raja Nonchalant. Penjaga kad terakhir. | normal | BOSS_TALK.finale.pre[4] · [script.ts:1325](/mnt/storage/qish/game/src/content/script.ts:1325) |
| ☐ D0727 | Raja Nonchalant | Kalau nak tahu kenapa, kalahkan saya dulu. | normal | BOSS_TALK.finale.pre[5] · [script.ts:1326](/mnt/storage/qish/game/src/content/script.ts:1326) |
| ☐ D0728 | Qish · soalan pilihan | Lawan Raja Nonchalant? | normal | BOSS_TALK.finale.ask · [script.ts:1328](/mnt/storage/qish/game/src/content/script.ts:1328) |
| ☐ D0729 | Raja Nonchalant | Okay okay... awak menang. Macam biasa. | normal | BOSS_TALK.finale.win[1] · [script.ts:1330](/mnt/storage/qish/game/src/content/script.ts:1330) |
| ☐ D0730 | Raja Nonchalant | Sekarang bangun, sayang. Ada orang tunggu awak. | normal | BOSS_TALK.finale.win[2] · [script.ts:1331](/mnt/storage/qish/game/src/content/script.ts:1331) |

<a id="qc-75"></a>

## 75. Tiba di Litar Sepang

| QC / ID | Watak / jenis | Dialog asal | Ekspresi | Konteks / sumber |
|---|---|---|---|---|
| ☐ D0731 | Narator | Guruh berdentum jauh. Langit Sepang dah kelabu, tapi bunyi enjin F1 lagi kuat dari guruh. | normal | SP_ARRIVE[1] · [script.ts:1340](/mnt/storage/qish/game/src/content/script.ts:1340) |
| ☐ D0732 | Qish | Litar Sepang... sebelah rumah saya je ni. Dia lari dekat-dekat je rupanya. | thinking | SP_ARRIVE[2] · [script.ts:1341](/mnt/storage/qish/game/src/content/script.ts:1341) |
| ☐ D0733 | 📢 Pengumuman | Perhatian kepada semua penonton. Pemilik Myvi merah, tudung warna mauve... | normal | SP_ARRIVE[3] · [script.ts:1342](/mnt/storage/qish/game/src/content/script.ts:1342) |
| ☐ D0734 | Qish | Eh. Saya ke? | surprised | SP_ARRIVE[4] · [script.ts:1343](/mnt/storage/qish/game/src/content/script.ts:1343) |
| ☐ D0735 | 📢 Pengumuman | Raja Nonchalant sedang menunggu anda di podium, atas bangunan pit. Beliau pesan, beliau terlalu malas untuk turun. | normal | SP_ARRIVE[5] · [script.ts:1344](/mnt/storage/qish/game/src/content/script.ts:1344) |
| ☐ D0736 | 📢 Pengumuman | Podium ialah kawasan ALL ACCESS. Enam pas paddock anda telah ditinggalkan dengan enam orang di seluruh litar. Sekian, terima kasih. | normal | SP_ARRIVE[6] · [script.ts:1345](/mnt/storage/qish/game/src/content/script.ts:1345) |
| ☐ D0737 | Qish | Dia tinggalkan pas saya dengan ORANG LAIN?! Malas punya Raja. | angry | SP_ARRIVE[7] · [script.ts:1346](/mnt/storage/qish/game/src/content/script.ts:1346) |
| ☐ D0738 | Narator | Kumpul 6 pas paddock. Cari orang yang ada tanda ! dan cahaya kuning yang menegak ke langit. | normal | SP_ARRIVE[8] · [script.ts:1347](/mnt/storage/qish/game/src/content/script.ts:1347) |

<a id="qc-76"></a>

## 76. Ambil enam pas paddock

| QC / ID | Watak / jenis | Dialog asal | Ekspresi | Konteks / sumber |
|---|---|---|---|---|
| ☐ D0739 | Kak Tiket | Adik! Tudung mauve, Myvi merah... Ha, padan dengan gambar ni. | normal | PASS_TALK[1][1] · [script.ts:1353](/mnt/storage/qish/game/src/content/script.ts:1353) |
| ☐ D0740 | Narator | Kak Tiket tunjuk satu lukisan atas kertas. Bentuk orang. Mungkin. Bawah dia tulis: "TUDUNG MAUVE. COMEL. BAGI PAS." | normal | PASS_TALK[1][2] · [script.ts:1354](/mnt/storage/qish/game/src/content/script.ts:1354) |
| ☐ D0741 | Qish | ...Ni lukisan Faris. Teruk gila. Tapi okay la, comel sikit. | shy | PASS_TALK[1][3] · [script.ts:1355](/mnt/storage/qish/game/src/content/script.ts:1355) |
| ☐ D0742 | Kak Tiket | Encik rambut kerinting tu tinggalkan pagi tadi. Lepas tu dia duduk kat kerusi plastik tu, tertidur sejam. | normal | PASS_TALK[1][4] · [script.ts:1356](/mnt/storage/qish/game/src/content/script.ts:1356) |
| ☐ D0743 | Narator | 🎫 Dapat PAS MASUK. | normal | PASS_TALK[1][5] · [script.ts:1357](/mnt/storage/qish/game/src/content/script.ts:1357) |
| ☐ D0744 | Abang Merch | Topi MALAS RACING! Baju MALAS RACING! Bantal MALAS RACING! | normal | PASS_TALK[2][1] · [script.ts:1360](/mnt/storage/qish/game/src/content/script.ts:1360) |
| ☐ D0745 | Qish | Siapa beli bantal kat litar F1? | thinking | PASS_TALK[2][2] · [script.ts:1361](/mnt/storage/qish/game/src/content/script.ts:1361) |
| ☐ D0746 | Abang Merch | Bos MALAS RACING sendiri. Tiga biji. Dia kata untuk "strategi rehat". | normal | PASS_TALK[2][3] · [script.ts:1362](/mnt/storage/qish/game/src/content/script.ts:1362) |
| ☐ D0747 | Abang Merch | Oh ya, ni pas adik. Dia pesan satu je: kalau adik nak apa-apa kat sini, ambil je. Dia dah bayar. | normal | PASS_TALK[2][4] · [script.ts:1363](/mnt/storage/qish/game/src/content/script.ts:1363) |
| ☐ D0748 | Narator | 🧢 Dapat PAS FAN ZONE. | normal | PASS_TALK[2][5] · [script.ts:1364](/mnt/storage/qish/game/src/content/script.ts:1364) |
| ☐ D0749 | Ketua Krew MALAS RACING | Selamat datang ke garaj MALAS RACING. Kereta kami tak keluar langsung hari ni. | normal | PASS_TALK[3][1] · [script.ts:1367](/mnt/storage/qish/game/src/content/script.ts:1367) |
| ☐ D0750 | Qish | Kenapa? | thinking | PASS_TALK[3][2] · [script.ts:1368](/mnt/storage/qish/game/src/content/script.ts:1368) |
| ☐ D0751 | Ketua Krew MALAS RACING | Driver kami cakap nak "rehat mata" kat podium. Dari pagi. | normal | PASS_TALK[3][3] · [script.ts:1369](/mnt/storage/qish/game/src/content/script.ts:1369) |
| ☐ D0752 | Ketua Krew MALAS RACING | Krew kami tukar tayar dua saat. Tidur? Dua jam. Tengok la tu kat sofa belakang. | normal | PASS_TALK[3][4] · [script.ts:1370](/mnt/storage/qish/game/src/content/script.ts:1370) |
| ☐ D0753 | Ketua Krew MALAS RACING | Ni pas adik. Bos pesan: "Kalau dia sampai pit, maknanya dia betul-betul cari saya." | normal | PASS_TALK[3][5] · [script.ts:1371](/mnt/storage/qish/game/src/content/script.ts:1371) |
| ☐ D0754 | Qish | ...Mestilah saya cari. | love | PASS_TALK[3][6] · [script.ts:1372](/mnt/storage/qish/game/src/content/script.ts:1372) |
| ☐ D0755 | Narator | 🔧 Dapat PAS PIT LANE. | normal | PASS_TALK[3][7] · [script.ts:1373](/mnt/storage/qish/game/src/content/script.ts:1373) |
| ☐ D0756 | Kak Usher | Tiket grandstand? ...Eh, adik ni yang dalam banner tu! | normal | PASS_TALK[4][1] · [script.ts:1376](/mnt/storage/qish/game/src/content/script.ts:1376) |
| ☐ D0757 | Qish | Banner apa? | thinking | PASS_TALK[4][2] · [script.ts:1377](/mnt/storage/qish/game/src/content/script.ts:1377) |
| ☐ D0758 | Narator | Kat depan grandstand tergantung dua banner besar: SEPANG BADDIE ♥ dan LABU LANJUT QUEEN. | normal | PASS_TALK[4][3] · [script.ts:1378](/mnt/storage/qish/game/src/content/script.ts:1378) |
| ☐ D0759 | Qish | ...Malu la! | shy | PASS_TALK[4][4] · [script.ts:1379](/mnt/storage/qish/game/src/content/script.ts:1379) |
| ☐ D0760 | Kak Usher | Encik rambut kerinting yang gantung pagi tadi. Lama dia ikat, senget-senget. Lepas tu dia tertidur kat kerusi C-12. | normal | PASS_TALK[4][5] · [script.ts:1380](/mnt/storage/qish/game/src/content/script.ts:1380) |
| ☐ D0761 | Narator | 🎟️ Dapat PAS GRANDSTAND. | normal | PASS_TALK[4][6] · [script.ts:1381](/mnt/storage/qish/game/src/content/script.ts:1381) |
| ☐ D0762 | Pakcik Marshal | Bendera hijau, jalan. Kuning, hati-hati. Biru, bagi laluan. | normal | PASS_TALK[5][1] · [script.ts:1384](/mnt/storage/qish/game/src/content/script.ts:1384) |
| ☐ D0763 | Pakcik Marshal | Bendera putih maknanya menyerah. Raja Nonchalant pun ada satu. Tapi dia malas nak angkat. | normal | PASS_TALK[5][2] · [script.ts:1385](/mnt/storage/qish/game/src/content/script.ts:1385) |
| ☐ D0764 | Pakcik Marshal | Ni pas adik. Dia pesan: "Kalau dia sampai hairpin, maknanya dia tak give up." | normal | PASS_TALK[5][3] · [script.ts:1386](/mnt/storage/qish/game/src/content/script.ts:1386) |
| ☐ D0765 | Qish | Give up? Dia tak kenal saya ke. | smug | PASS_TALK[5][4] · [script.ts:1387](/mnt/storage/qish/game/src/content/script.ts:1387) |
| ☐ D0766 | Narator | 🏁 Dapat PAS MARSHAL. | normal | PASS_TALK[5][5] · [script.ts:1388](/mnt/storage/qish/game/src/content/script.ts:1388) |
| ☐ D0767 | Pengulas | DAN KITA ADA BERITA TERKINI! Seorang gadis bertudung mauve sedang menjelajah litar! | normal | PASS_TALK[6][1] · [script.ts:1391](/mnt/storage/qish/game/src/content/script.ts:1391) |
| ☐ D0768 | Qish | Saya ke tu? | surprised | PASS_TALK[6][2] · [script.ts:1392](/mnt/storage/qish/game/src/content/script.ts:1392) |
| ☐ D0769 | Pengulas | Sumber kami: Raja Nonchalant dah duduk atas podium sejak pagi. Bila ditanya kenapa, beliau jawab... | normal | PASS_TALK[6][3] · [script.ts:1393](/mnt/storage/qish/game/src/content/script.ts:1393) |
| ☐ D0770 | Pengulas | "k." | normal | PASS_TALK[6][4] · [script.ts:1394](/mnt/storage/qish/game/src/content/script.ts:1394) |
| ☐ D0771 | Qish | Typical. | smug | PASS_TALK[6][5] · [script.ts:1395](/mnt/storage/qish/game/src/content/script.ts:1395) |
| ☐ D0772 | Pengulas | Ni pas media, cik. Penonton sekalian, dia makin dekat! | normal | PASS_TALK[6][6] · [script.ts:1396](/mnt/storage/qish/game/src/content/script.ts:1396) |
| ☐ D0773 | Narator | 🎙️ Dapat PAS MEDIA. | normal | PASS_TALK[6][7] · [script.ts:1397](/mnt/storage/qish/game/src/content/script.ts:1397) |

<a id="qc-77"></a>

## 77. VIP — pas belum cukup

| QC / ID | Watak / jenis | Dialog asal | Ekspresi | Konteks / sumber |
|---|---|---|---|---|
| ☐ D0774 | Abang Bouncer | Maaf kak. Podium kawasan ALL ACCESS. | normal | spVipNotYet[1] · [script.ts:1403](/mnt/storage/qish/game/src/content/script.ts:1403) |
| ☐ D0775 | Abang Bouncer | Pas akak baru ${got}/${need}. Raja Nonchalant pesan, enam-enam kena ada. Dia kata "peraturan". | normal | spVipNotYet[2] · [script.ts:1404](/mnt/storage/qish/game/src/content/script.ts:1404) |
| ☐ D0776 | Qish | Sejak bila dia ada peraturan? Buat peraturan pun dia malas. | smug | spVipNotYet[3] · [script.ts:1405](/mnt/storage/qish/game/src/content/script.ts:1405) |

<a id="qc-78"></a>

## 78. VIP dibuka

| QC / ID | Watak / jenis | Dialog asal | Ekspresi | Konteks / sumber |
|---|---|---|---|---|
| ☐ D0777 | Abang Bouncer | Enam pas. Lengkap. ALL ACCESS. | normal | SP_VIP_OPEN[1] · [script.ts:1408](/mnt/storage/qish/game/src/content/script.ts:1408) |
| ☐ D0778 | Narator | Abang Bouncer cabut tali baldu merah. | normal | SP_VIP_OPEN[2] · [script.ts:1409](/mnt/storage/qish/game/src/content/script.ts:1409) |
| ☐ D0779 | Abang Bouncer | Dia kat atas. Dah tertidur dua kali sementara tunggu akak. | normal | SP_VIP_OPEN[3] · [script.ts:1410](/mnt/storage/qish/game/src/content/script.ts:1410) |
| ☐ D0780 | Qish | Dua kali?! | surprised | SP_VIP_OPEN[4] · [script.ts:1411](/mnt/storage/qish/game/src/content/script.ts:1411) |

<a id="qc-79"></a>

## 79. VIP selepas dibuka

| QC / ID | Watak / jenis | Dialog asal | Ekspresi | Konteks / sumber |
|---|---|---|---|---|
| ☐ D0781 | Abang Bouncer | Tahniah kak. Hujan pun dah berhenti. | normal | spVipAfter[1] · clear · [script.ts:1414](/mnt/storage/qish/game/src/content/script.ts:1414) |
| ☐ D0782 | Abang Bouncer | Silakan kak. Hati-hati, tangga licin. | normal | spVipAfter[1] · bukan clear · [script.ts:1414](/mnt/storage/qish/game/src/content/script.ts:1414) |

<a id="qc-80"></a>

## 80. Garaj pasukan F1

| QC / ID | Watak / jenis | Dialog asal | Ekspresi | Konteks / sumber |
|---|---|---|---|---|
| ☐ D0783 | Papan tanda | BOLAT GP · ada sticker hati kat semua tayar | normal | spGarageLines.0[1] · [script.ts:1421](/mnt/storage/qish/game/src/content/script.ts:1421) |
| ☐ D0784 | Qish | Team favourite saya. Obviously. | smug | spGarageLines.0[2] · [script.ts:1422](/mnt/storage/qish/game/src/content/script.ts:1422) |
| ☐ D0785 | Papan tanda | OMEY RACING · syarat masuk team: mesti comel | normal | spGarageLines.1[1] · [script.ts:1425](/mnt/storage/qish/game/src/content/script.ts:1425) |
| ☐ D0786 | Qish | Patut la krew dia comel-comel. | happy | spGarageLines.1[2] · [script.ts:1426](/mnt/storage/qish/game/src/content/script.ts:1426) |
| ☐ D0787 | Papan tanda | ALAMAK RACING · strategi: buat-buat tak tahu | normal | spGarageLines.4[1] · [script.ts:1429](/mnt/storage/qish/game/src/content/script.ts:1429) |
| ☐ D0788 | Qish | Macam kenal je strategi ni. | smug | spGarageLines.4[2] · [script.ts:1430](/mnt/storage/qish/game/src/content/script.ts:1430) |
| ☐ D0789 | Papan tanda | KENTOT BUSHUK · enjin paling senyap dalam grid | normal | spGarageLines.5[1] · [script.ts:1433](/mnt/storage/qish/game/src/content/script.ts:1433) |
| ☐ D0790 | Qish | Senyap... tapi bau dia sampai sini. | laugh | spGarageLines.5[2] · [script.ts:1434](/mnt/storage/qish/game/src/content/script.ts:1434) |
| ☐ D0791 | Papan tanda | SAMBAL GEPUK · pedas level 10, ekzos keluar asap merah | normal | spGarageLines.6[1] · [script.ts:1437](/mnt/storage/qish/game/src/content/script.ts:1437) |
| ☐ D0792 | Qish | Level 10? Orang Sepang makan level 10 untuk sarapan. | smug | spGarageLines.6[2] · [script.ts:1438](/mnt/storage/qish/game/src/content/script.ts:1438) |
| ☐ D0793 | Papan tanda | ANTI EMOK · kereta paling ringan dalam grid | normal | spGarageLines.7[1] · [script.ts:1441](/mnt/storage/qish/game/src/content/script.ts:1441) |
| ☐ D0794 | Narator | Driver dia tak makan nasi seminggu sebelum race. | normal | spGarageLines.7[2] · [script.ts:1442](/mnt/storage/qish/game/src/content/script.ts:1442) |
| ☐ D0795 | Qish | Respect. | smug | spGarageLines.7[3] · [script.ts:1443](/mnt/storage/qish/game/src/content/script.ts:1443) |
| ☐ D0796 | Qish | Garaj F1. Bersih gila, boleh makan atas lantai. | surprised | spGarageLines[1] · [script.ts:1445](/mnt/storage/qish/game/src/content/script.ts:1445) |

<a id="qc-81"></a>

## 81. Dialog sambutan birthday

| QC / ID | Watak / jenis | Dialog asal | Ekspresi | Konteks / sumber |
|---|---|---|---|---|
| ☐ D0797 | Faris | Selamat hari lahir ke-26, sayang. | normal | PARTY[1] · [ending.ts:8](/mnt/storage/qish/game/src/content/ending.ts:8) |
| ☐ D0798 | Qish | BOWAT! Awak kat sini rupanya! | excited | PARTY[2] · [ending.ts:9](/mnt/storage/qish/game/src/content/ending.ts:9) |
| ☐ D0799 | Bowat | *PROT* (kentut gembira) | relief | PARTY[3] · [ending.ts:10](/mnt/storage/qish/game/src/content/ending.ts:10) |
| ☐ D0800 | Encik Sloth | Kitorang semua tolong Faris siapkan dari semalam! | laugh | PARTY[4] · [ending.ts:11](/mnt/storage/qish/game/src/content/ending.ts:11) |
| ☐ D0801 | Qish | Korang... semua ni plan ke dari semalam?? | love | PARTY[5] · [ending.ts:12](/mnt/storage/qish/game/src/content/ending.ts:12) |
| ☐ D0802 | Faris | Saya memang malas. Kecuali untuk bolat. | normal | PARTY[6] · [ending.ts:13](/mnt/storage/qish/game/src/content/ending.ts:13) |
| ☐ D0803 | Faris | Okay, tiup lilin dulu! | normal | PARTY[7] · [ending.ts:14](/mnt/storage/qish/game/src/content/ending.ts:14) |

<a id="qc-82"></a>

## 82. Pengakuan Faris

| QC / ID | Watak / jenis | Dialog asal | Ekspresi | Konteks / sumber |
|---|---|---|---|---|
| ☐ D0804 | Faris | Sayang. Pasal semalam... | normal | CONFESS[1] · [ending.ts:45](/mnt/storage/qish/game/src/content/ending.ts:45) |
| ☐ D0805 | Faris | Sorry saya "k bye" je. Bukan sebab saya tak kisah. | normal | CONFESS[2] · [ending.ts:46](/mnt/storage/qish/game/src/content/ending.ts:46) |
| ☐ D0806 | Faris | Saya memang tak pandai cakap benda-benda macam ni. | normal | CONFESS[3] · [ending.ts:47](/mnt/storage/qish/game/src/content/ending.ts:47) |
| ☐ D0807 | Faris | So saya buat satu game. | normal | CONFESS[4] · [ending.ts:48](/mnt/storage/qish/game/src/content/ending.ts:48) |
| ☐ D0808 | Qish | ...Faris. | cry | CONFESS[5] · [ending.ts:49](/mnt/storage/qish/game/src/content/ending.ts:49) |
| ☐ D0809 | Faris | Ada satu lagi. Yang ni saya tulis betul-betul. | normal | CONFESS[6] · [ending.ts:50](/mnt/storage/qish/game/src/content/ending.ts:50) |

<a id="qc-83"></a>

## 83. Telefon Qish

| QC / ID | Watak / jenis | Dialog asal | Ekspresi | Konteks / sumber |
|---|---|---|---|---|
| ☐ T0001 | Telefon · status | Selasa, 3 Nov · 7:42 | — | PHONE.status · [script.ts:43](/mnt/storage/qish/game/src/content/script.ts:43) |
| ☐ T0002 | Telefon · status | Faris 🦥 | — | PHONE.contact · [script.ts:44](/mnt/storage/qish/game/src/content/script.ts:44) |
| ☐ T0003 | Telefon · status | last seen semalam 11:58 PM | — | PHONE.lastSeen · [script.ts:45](/mnt/storage/qish/game/src/content/script.ts:45) |
| ☐ T0004 | Qish | Hmph. | — | PHONE.history[1].text · [script.ts:47](/mnt/storage/qish/game/src/content/script.ts:47) |
| ☐ T0005 | Qish | Saya merajuk ni. | — | PHONE.history[2].text · [script.ts:48](/mnt/storage/qish/game/src/content/script.ts:48) |
| ☐ T0006 | Faris | k bye | — | PHONE.history[3].text · [script.ts:49](/mnt/storage/qish/game/src/content/script.ts:49) |
| ☐ T0007 | Qish | sayang kat mana? 🥺 | — | PHONE.send · [script.ts:52](/mnt/storage/qish/game/src/content/script.ts:52) |
| ☐ T0008 | Telefon · status | Selasa, 3 Nov · 6:46 PM | — | PHONE.wake.status · [script.ts:55](/mnt/storage/qish/game/src/content/script.ts:55) |
| ☐ T0009 | Telefon · status | 6:46 PM | — | PHONE.wake.time · [script.ts:56](/mnt/storage/qish/game/src/content/script.ts:56) |
| ☐ T0010 | Faris | sayang | — | PHONE.wake.incoming[1] · [script.ts:57](/mnt/storage/qish/game/src/content/script.ts:57) |
| ☐ T0011 | Faris | dah bangun ke belum | — | PHONE.wake.incoming[2] · [script.ts:57](/mnt/storage/qish/game/src/content/script.ts:57) |
| ☐ T0012 | Faris | keluar kejap | — | PHONE.wake.incoming[3] · [script.ts:57](/mnt/storage/qish/game/src/content/script.ts:57) |
| ☐ T0013 | Faris | saya tunggu kat luar | — | PHONE.wake.incoming[4] · [script.ts:57](/mnt/storage/qish/game/src/content/script.ts:57) |

<a id="qc-84"></a>

## 84. Nama booth sebenar

| QC / ID | Watak / jenis | Dialog asal | Ekspresi | Konteks / sumber |
|---|---|---|---|---|
| ☐ T0014 | Teks cerita | 123 Annyeong | — | BOOTH_NAMES[1] · [script.ts:872](/mnt/storage/qish/game/src/content/script.ts:872) |
| ☐ T0015 | Teks cerita | Inssa Film | — | BOOTH_NAMES[2] · [script.ts:872](/mnt/storage/qish/game/src/content/script.ts:872) |
| ☐ T0016 | Teks cerita | Dear Memories | — | BOOTH_NAMES[3] · [script.ts:872](/mnt/storage/qish/game/src/content/script.ts:872) |
| ☐ T0017 | Teks cerita | Fotopot | — | BOOTH_NAMES[4] · [script.ts:872](/mnt/storage/qish/game/src/content/script.ts:872) |
| ☐ T0018 | Teks cerita | Photomansion | — | BOOTH_NAMES[5] · [script.ts:872](/mnt/storage/qish/game/src/content/script.ts:872) |
| ☐ T0019 | Teks cerita | KPIX | — | BOOTH_NAMES[6] · [script.ts:872](/mnt/storage/qish/game/src/content/script.ts:872) |
| ☐ T0020 | Teks cerita | Hana Film | — | BOOTH_NAMES[7] · [script.ts:872](/mnt/storage/qish/game/src/content/script.ts:872) |

<a id="qc-85"></a>

## 85. Studio bagi 10 photo strip

| QC / ID | Watak / jenis | Dialog asal | Ekspresi | Konteks / sumber |
|---|---|---|---|---|
| ☐ T0021 | Teks cerita | 123 Annyeong | — | STRIP_STUDIOS[1] · [script.ts:873](/mnt/storage/qish/game/src/content/script.ts:873) |
| ☐ T0022 | Teks cerita | 123 Annyeong | — | STRIP_STUDIOS[2] · [script.ts:873](/mnt/storage/qish/game/src/content/script.ts:873) |
| ☐ T0023 | Teks cerita | Photo Booth | — | STRIP_STUDIOS[3] · [script.ts:873](/mnt/storage/qish/game/src/content/script.ts:873) |
| ☐ T0024 | Teks cerita | Inssa Film | — | STRIP_STUDIOS[4] · [script.ts:873](/mnt/storage/qish/game/src/content/script.ts:873) |
| ☐ T0025 | Teks cerita | Dear Memories | — | STRIP_STUDIOS[5] · [script.ts:873](/mnt/storage/qish/game/src/content/script.ts:873) |
| ☐ T0026 | Teks cerita | Fotopot | — | STRIP_STUDIOS[6] · [script.ts:873](/mnt/storage/qish/game/src/content/script.ts:873) |
| ☐ T0027 | Teks cerita | Photomansion | — | STRIP_STUDIOS[7] · [script.ts:873](/mnt/storage/qish/game/src/content/script.ts:873) |
| ☐ T0028 | Teks cerita | 123 Annyeong | — | STRIP_STUDIOS[8] · [script.ts:873](/mnt/storage/qish/game/src/content/script.ts:873) |
| ☐ T0029 | Teks cerita | KPIX | — | STRIP_STUDIOS[9] · [script.ts:873](/mnt/storage/qish/game/src/content/script.ts:873) |
| ☐ T0030 | Teks cerita | Hana Film | — | STRIP_STUDIOS[10] · [script.ts:873](/mnt/storage/qish/game/src/content/script.ts:873) |

<a id="qc-86"></a>

## 86. Banner birthday

| QC / ID | Watak / jenis | Dialog asal | Ekspresi | Konteks / sumber |
|---|---|---|---|---|
| ☐ T0031 | Teks cerita | Happy 26th Birthday,&lt;br&gt;Alya Balqis! 💛 | — | BIRTHDAY_BANNER · [ending.ts:18](/mnt/storage/qish/game/src/content/ending.ts:18) |

<a id="qc-87"></a>

## 87. Kisah Kita — 9 memori

| QC / ID | Watak / jenis | Dialog asal | Ekspresi | Konteks / sumber |
|---|---|---|---|---|
| ☐ T0032 | Kisah Kita · caption | Dulu, kita kenal kat tempat kerja. Awak budak baru yang pandai melukis. | — | KISAH_KITA[1].caption · [ending.ts:32](/mnt/storage/qish/game/src/content/ending.ts:32) |
| ☐ T0033 | Kisah Kita · caption | Awak jumpa seorang Faris. Yang malas. | — | KISAH_KITA[2].caption · [ending.ts:33](/mnt/storage/qish/game/src/content/ending.ts:33) |
| ☐ T0034 | Kisah Kita · caption | Mula-mula kawan. Lepas tu rapat. Lepas tu... 8.8. | — | KISAH_KITA[3].caption · [ending.ts:34](/mnt/storage/qish/game/src/content/ending.ts:34) |
| ☐ T0035 | Label ilustrasi | Cosy Place · memori dalam ilustrasi | — | KISAH_KITA[4].mediaLabel · [ending.ts:35](/mnt/storage/qish/game/src/content/ending.ts:35) |
| ☐ T0036 | Kisah Kita · caption | First date kita: Cosy Place, Wangsa Maju. | — | KISAH_KITA[4].caption · [ending.ts:35](/mnt/storage/qish/game/src/content/ending.ts:35) |
| ☐ T0037 | Label ilustrasi | Sunway Lagoon · memori dalam ilustrasi | — | KISAH_KITA[5].mediaLabel · [ending.ts:36](/mnt/storage/qish/game/src/content/ending.ts:36) |
| ☐ T0038 | Kisah Kita · caption | Sunway Lagoon, dari buka sampai tutup. (Dan ya, itu singa. Bukan beruang.) | — | KISAH_KITA[5].caption · [ending.ts:36](/mnt/storage/qish/game/src/content/ending.ts:36) |
| ☐ T0039 | Kisah Kita · caption | Album listening night. Saya menang PS4 sebab muka saya sama Luqman Podolski. | — | KISAH_KITA[6].caption · [ending.ts:37](/mnt/storage/qish/game/src/content/ending.ts:37) |
| ☐ T0040 | Kisah Kita · caption | Dan photobooth. Banyak. Sangat. Photobooth. | — | KISAH_KITA[7].caption · [ending.ts:38](/mnt/storage/qish/game/src/content/ending.ts:38) |
| ☐ T0041 | Kisah Kita · caption | Hari ni 3.11. Awak 26. | — | KISAH_KITA[8].caption · [ending.ts:39](/mnt/storage/qish/game/src/content/ending.ts:39) |
| ☐ T0042 | Kisah Kita · caption | Terima kasih sebab jadi Player 2 saya. Jom sambung adventure seterusnya. | — | KISAH_KITA[9].caption · [ending.ts:40](/mnt/storage/qish/game/src/content/ending.ts:40) |

<a id="qc-88"></a>

## 88. Surat Faris

| QC / ID | Watak / jenis | Dialog asal | Ekspresi | Konteks / sumber |
|---|---|---|---|---|
| ☐ T0043 | Surat Faris | Sayang, | — | LETTER.greeting · [ending.ts:55](/mnt/storage/qish/game/src/content/ending.ts:55) |
| ☐ T0044 | Surat Faris | [Surat sebenar dari Faris akan diletak di sini.] | — | LETTER.body · [ending.ts:56](/mnt/storage/qish/game/src/content/ending.ts:56) |
| ☐ T0045 | Surat Faris | Sayang awak selalu,<br>Faris (Raja Nonchalant) 🦥 | — | LETTER.signoff · [ending.ts:57](/mnt/storage/qish/game/src/content/ending.ts:57) |

<a id="qc-89"></a>

## 89. Kad rahsia ke-9

| QC / ID | Watak / jenis | Dialog asal | Ekspresi | Konteks / sumber |
|---|---|---|---|---|
| ☐ T0046 | Kad ke-9 | Faris &amp; Qish | — | CARD_9.name · [ending.ts:62](/mnt/storage/qish/game/src/content/ending.ts:62) |
| ☐ T0047 | Kad ke-9 | SECRET RARE | — | CARD_9.rarity · [ending.ts:63](/mnt/storage/qish/game/src/content/ending.ts:63) |
| ☐ T0048 | Kad ke-9 | ∞ | — | CARD_9.hp · [ending.ts:64](/mnt/storage/qish/game/src/content/ending.ts:64) |
| ☐ T0049 | Kad ke-9 | Selamanya | — | CARD_9.move · [ending.ts:66](/mnt/storage/qish/game/src/content/ending.ts:66) |
| ☐ T0050 | Kad ke-9 | Bersama sampai bila-bila. Kad ni tak boleh retreat. | — | CARD_9.moveText · [ending.ts:67](/mnt/storage/qish/game/src/content/ending.ts:67) |
| ☐ T0051 | Kad ke-9 | 8 kad untuk 8.8 · kad ke-9 untuk masa depan | — | CARD_9.footer · [ending.ts:68](/mnt/storage/qish/game/src/content/ending.ts:68) |

<a id="qc-90"></a>

## 90. Tamat

| QC / ID | Watak / jenis | Dialog asal | Ekspresi | Konteks / sumber |
|---|---|---|---|---|
| ☐ T0052 | Teks cerita | Tamat | — | THE_END.title · [ending.ts:72](/mnt/storage/qish/game/src/content/ending.ts:72) |
| ☐ T0053 | Teks cerita | Selamat hari lahir, sayang. 💛 | — | THE_END.sub · [ending.ts:73](/mnt/storage/qish/game/src/content/ending.ts:73) |
| ☐ T0054 | Teks cerita | Tekan A untuk terus jalan-jalan | — | THE_END.hint · [ending.ts:74](/mnt/storage/qish/game/src/content/ending.ts:74) |

<a id="qc-91"></a>

## 91. Pilihan jawapan pemain

| QC / ID | Watak / jenis | Dialog asal | Ekspresi | Konteks / sumber |
|---|---|---|---|---|
| ☐ P0001 | Pemain | Nak! / Nanti | — | Pilihan jawapan · Soalan: PARTY_AGAIN · [main.ts:164](/mnt/storage/qish/game/src/main.ts:164) |
| ☐ P0002 | Pemain | Jom! / Nanti dulu | — | Pilihan jawapan · Soalan: SAMPAN_ASK · [main.ts:360](/mnt/storage/qish/game/src/main.ts:360) |
| ☐ P0003 | Pemain | Jom! / Nanti dulu | — | Pilihan jawapan · Soalan: { who: "qish", text: talk.ask } · [main.ts:386](/mnt/storage/qish/game/src/main.ts:386) |
| ☐ P0004 | Pemain | Bowat · Bolat · Snorlax Twin · Blep · Mega Bowat · Bolat ex · Qish ex · Raja Nonchalant · Batal | — | Pilihan jawapan · Soalan: CONSOLE_ASK · [main.ts:458](/mnt/storage/qish/game/src/main.ts:458) |
| ☐ P0005 | Pemain | Zon yang dah dibuka (nama daripada SHORT) · Batal | — | Pilihan jawapan · Soalan: MYVI_ASK · [main.ts:476](/mnt/storage/qish/game/src/main.ts:476) |
| ☐ P0006 | Pemain | Jom! / Nanti dulu | — | Pilihan jawapan · Soalan: { who: "qish", text: talk.ask } · [main.ts:495](/mnt/storage/qish/game/src/main.ts:495) |
| ☐ P0007 | Pemain | Jom terbang! / Nanti dulu | — | Pilihan jawapan · Soalan: BABAH.again · [main.ts:505](/mnt/storage/qish/game/src/main.ts:505) |
| ☐ P0008 | Pemain | Jom terbang! / Nanti dulu | — | Pilihan jawapan · Soalan: BABAH.ask · [main.ts:524](/mnt/storage/qish/game/src/main.ts:524) |
| ☐ P0009 | Pemain | Jom! / Nanti dulu | — | Pilihan jawapan · Soalan: replayAsk(BOSSES[boss].name) · [main.ts:531](/mnt/storage/qish/game/src/main.ts:531) |

<a id="qc-92"></a>

## 92. Minigame / teks babak · finaleBattle

| QC / ID | Watak / jenis | Dialog asal | Ekspresi | Konteks / sumber |
|---|---|---|---|---|
| ☐ B0001 | Battle · name | Omey Blast | — | MOVES[1].name · [finaleBattle.ts:26](/mnt/storage/qish/game/src/minigames/finale/finaleBattle.ts:26) |
| ☐ B0002 | Battle · text | Cuteness overload! Raja Nonchalant tak boleh cakap, fikir atau pertahankan diri. | — | MOVES[1].text · [finaleBattle.ts:26](/mnt/storage/qish/game/src/minigames/finale/finaleBattle.ts:26) |
| ☐ B0003 | Battle · name | Kentot Bushuk | — | MOVES[2].name · [finaleBattle.ts:27](/mnt/storage/qish/game/src/minigames/finale/finaleBattle.ts:27) |
| ☐ B0004 | Battle · text | Kentut senyap... Raja Nonchalant salahkan diri sendiri. 100% guilty, 0% evidence. | — | MOVES[2].text · [finaleBattle.ts:27](/mnt/storage/qish/game/src/minigames/finale/finaleBattle.ts:27) |
| ☐ B0005 | Battle · name | Antek Giler | — | MOVES[3].name · [finaleBattle.ts:28](/mnt/storage/qish/game/src/minigames/finale/finaleBattle.ts:28) |
| ☐ B0006 | Battle · text | Cantik giler, walaupun tanpa makeup. Sangat berkesan! | — | MOVES[3].text · [finaleBattle.ts:28](/mnt/storage/qish/game/src/minigames/finale/finaleBattle.ts:28) |
| ☐ B0007 | Battle · name | Makan Banyak | — | MOVES[4].name · [finaleBattle.ts:29](/mnt/storage/qish/game/src/minigames/finale/finaleBattle.ts:29) |
| ☐ B0008 | Battle · text | Qish curi cookies Bowat. HP naik! | — | MOVES[4].text · [finaleBattle.ts:29](/mnt/storage/qish/game/src/minigames/finale/finaleBattle.ts:29) |
| ☐ B0009 | Battle · name | MALAS | — | ENEMY_MOVES[1].name · [finaleBattle.ts:33](/mnt/storage/qish/game/src/minigames/finale/finaleBattle.ts:33) |
| ☐ B0010 | Battle · text | ...tapi dia terlalu malas nak buat apa-apa. | — | ENEMY_MOVES[1].text · [finaleBattle.ts:33](/mnt/storage/qish/game/src/minigames/finale/finaleBattle.ts:33) |
| ☐ B0011 | Battle · name | ALAMAK | — | ENEMY_MOVES[2].name · [finaleBattle.ts:34](/mnt/storage/qish/game/src/minigames/finale/finaleBattle.ts:34) |
| ☐ B0012 | Battle · text | Dia keliru dengan diri sendiri. | — | ENEMY_MOVES[2].text · [finaleBattle.ts:34](/mnt/storage/qish/game/src/minigames/finale/finaleBattle.ts:34) |
| ☐ B0013 | Battle · name | SILA MENINGGAL | — | ENEMY_MOVES[3].name · [finaleBattle.ts:35](/mnt/storage/qish/game/src/minigames/finale/finaleBattle.ts:35) |
| ☐ B0014 | Battle · text | Gaya Luqman Podolski. Qish tak terkesan. | — | ENEMY_MOVES[3].text · [finaleBattle.ts:35](/mnt/storage/qish/game/src/minigames/finale/finaleBattle.ts:35) |
| ☐ B0015 | Qish | Tak lawak. | — | ENEMY_MOVES[3].reply · [finaleBattle.ts:35](/mnt/storage/qish/game/src/minigames/finale/finaleBattle.ts:35) |
| ☐ B0016 | Battle · name | GARU KEPALA | — | ENEMY_MOVES[4].name · [finaleBattle.ts:36](/mnt/storage/qish/game/src/minigames/finale/finaleBattle.ts:36) |
| ☐ B0017 | Battle · text | Dia garu kepala lama-lama. Tiada apa berlaku. | — | ENEMY_MOVES[4].text · [finaleBattle.ts:36](/mnt/storage/qish/game/src/minigames/finale/finaleBattle.ts:36) |
| ☐ M0001 | Mesej / teks skrin | LITAR SEPANG / PERTEMUAN TERAKHIR | — | drawField · this.textures.exists("sepang_arena") · [finaleBattle.ts:168](/mnt/storage/qish/game/src/minigames/finale/finaleBattle.ts:168) |
| ☐ M0002 | Mesej / teks skrin | LITAR SEPANG | — | drawField · [finaleBattle.ts:179](/mnt/storage/qish/game/src/minigames/finale/finaleBattle.ts:179) |
| ☐ M0003 | Mesej / teks skrin | RAJA NONCHALANT | — | hud · [finaleBattle.ts:193](/mnt/storage/qish/game/src/minigames/finale/finaleBattle.ts:193) |
| ☐ M0004 | Mesej / teks skrin | Lv.26 | — | hud · [finaleBattle.ts:194](/mnt/storage/qish/game/src/minigames/finale/finaleBattle.ts:194) |
| ☐ M0005 | Mesej / teks skrin | QISH ex | — | hud · [finaleBattle.ts:199](/mnt/storage/qish/game/src/minigames/finale/finaleBattle.ts:199) |
| ☐ M0006 | Mesej / teks skrin | Lv.26 | — | hud · [finaleBattle.ts:200](/mnt/storage/qish/game/src/minigames/finale/finaleBattle.ts:200) |
| ☐ M0007 | Mesej / teks skrin | ${Math.max(0, Math.round(this.playerHp))} / ${PLAYER_MAX} | — | refreshBars · [finaleBattle.ts:230](/mnt/storage/qish/game/src/minigames/finale/finaleBattle.ts:230) |
| ☐ M0008 | Mesej / teks skrin | A · Teruskan ▸ | — | say.arrow · [finaleBattle.ts:257](/mnt/storage/qish/game/src/minigames/finale/finaleBattle.ts:257) |
| ☐ M0009 | Mesej / teks skrin | Qish nak guna<br>move mana? | — | choose · options.length &gt; 1 · [finaleBattle.ts:269](/mnt/storage/qish/game/src/minigames/finale/finaleBattle.ts:269) |
| ☐ M0010 | Mesej / teks skrin | Raja Nonchalant mencabar Qish! | — | run · [finaleBattle.ts:349](/mnt/storage/qish/game/src/minigames/finale/finaleBattle.ts:349) |
| ☐ M0011 | Mesej / teks skrin | Pergi, Qish ex! 💛 | — | run · [finaleBattle.ts:351](/mnt/storage/qish/game/src/minigames/finale/finaleBattle.ts:351) |
| ☐ M0012 | Pilihan / nilai teks dinamik | HOT GILER | — | playerTurn[1].label · this.mega · [finaleBattle.ts:365](/mnt/storage/qish/game/src/minigames/finale/finaleBattle.ts:365) |
| ☐ M0013 | Pilihan / nilai teks dinamik | Mega Qish ex · 290 | — | playerTurn[1].sub · this.mega · [finaleBattle.ts:365](/mnt/storage/qish/game/src/minigames/finale/finaleBattle.ts:365) |
| ☐ M0014 | Mesej / teks skrin | Mega Qish ex guna HOT GILER! 🔥 | — | playerTurn · this.mega · [finaleBattle.ts:366](/mnt/storage/qish/game/src/minigames/finale/finaleBattle.ts:366) |
| ☐ M0015 | Pilihan / nilai teks dinamik | ${m.from} · ${m.heal ? `+${m.heal} HP` : `${m.dmg} DMG`} | — | playerTurn.pick.sub · [finaleBattle.ts:371](/mnt/storage/qish/game/src/minigames/finale/finaleBattle.ts:371) |
| ☐ M0016 | Mesej / teks skrin | Qish guna ${m.name.toUpperCase()}! | — | playerTurn · [finaleBattle.ts:373](/mnt/storage/qish/game/src/minigames/finale/finaleBattle.ts:373) |
| ☐ M0017 | Mesej / teks skrin | Raja Nonchalant: "Alamak." | — | playerTurn · m.stun · [finaleBattle.ts:386](/mnt/storage/qish/game/src/minigames/finale/finaleBattle.ts:386) |
| ☐ M0018 | Mesej / teks skrin | Raja Nonchalant masih tergamam. Dia tak boleh bergerak! | — | enemyTurn · this.stunned · [finaleBattle.ts:393](/mnt/storage/qish/game/src/minigames/finale/finaleBattle.ts:393) |
| ☐ M0019 | Mesej / teks skrin | Raja Nonchalant guna ${mv.name}! | — | enemyTurn · [finaleBattle.ts:397](/mnt/storage/qish/game/src/minigames/finale/finaleBattle.ts:397) |
| ☐ M0020 | Mesej / teks skrin | Qish: "${mv.reply}" | — | enemyTurn · mv.reply · [finaleBattle.ts:408](/mnt/storage/qish/game/src/minigames/finale/finaleBattle.ts:408) |
| ☐ M0021 | Mesej / teks skrin | Raja Nonchalant: "Saya belum serius lagi!" | — | megaEvolve · [finaleBattle.ts:412](/mnt/storage/qish/game/src/minigames/finale/finaleBattle.ts:412) |
| ☐ M0022 | Mesej / teks skrin | Tiba-tiba hujan lebat turun atas Litar Sepang... | — | megaEvolve · [finaleBattle.ts:418](/mnt/storage/qish/game/src/minigames/finale/finaleBattle.ts:418) |
| ☐ M0023 | Mesej / teks skrin | Kad Snorlax Twin dalam poket Qish mula bersinar! ✨ | — | megaEvolve · [finaleBattle.ts:419](/mnt/storage/qish/game/src/minigames/finale/finaleBattle.ts:419) |
| ☐ M0024 | Pilihan / nilai teks dinamik | MEGA EVOLVE! | — | megaEvolve[1].label · [finaleBattle.ts:420](/mnt/storage/qish/game/src/minigames/finale/finaleBattle.ts:420) |
| ☐ M0025 | Pilihan / nilai teks dinamik | Snorlax Twin → ? | — | megaEvolve[1].sub · [finaleBattle.ts:420](/mnt/storage/qish/game/src/minigames/finale/finaleBattle.ts:420) |
| ☐ M0026 | Mesej / teks skrin | MEGA QISH ex | — | megaEvolve · [finaleBattle.ts:432](/mnt/storage/qish/game/src/minigames/finale/finaleBattle.ts:432) |
| ☐ M0027 | Mesej / teks skrin | Qish Mega Evolve jadi MEGA QISH ex!! 🔥 | — | megaEvolve · [finaleBattle.ts:436](/mnt/storage/qish/game/src/minigames/finale/finaleBattle.ts:436) |
| ☐ M0028 | Mesej / teks skrin | Ability SEPANG BADDIE aktif! Labu Lanjut queen dah sampai. | — | megaEvolve · [finaleBattle.ts:437](/mnt/storage/qish/game/src/minigames/finale/finaleBattle.ts:437) |
| ☐ M0029 | Mesej / teks skrin | Hujan berhenti. Malaysia berhenti hujan sebab dia muncul. ☀️ | — | victory · [finaleBattle.ts:445](/mnt/storage/qish/game/src/minigames/finale/finaleBattle.ts:445) |
| ☐ M0030 | Mesej / teks skrin | Raja Nonchalant tumbang... dengan malas. | — | victory · [finaleBattle.ts:446](/mnt/storage/qish/game/src/minigames/finale/finaleBattle.ts:446) |

<a id="qc-93"></a>

## 93. Minigame / teks babak · blepShooter

| QC / ID | Watak / jenis | Dialog asal | Ekspresi | Konteks / sumber |
|---|---|---|---|---|
| ☐ M0031 | Mesej / teks skrin | MALAS | — | create.label · [blepShooter.ts:86](/mnt/storage/qish/game/src/minigames/blep/blepShooter.ts:86) |
| ☐ M0032 | Mesej / teks skrin | AIR zzz | — | create.label2 · [blepShooter.ts:87](/mnt/storage/qish/game/src/minigames/blep/blepShooter.ts:87) |
| ☐ M0033 | Mesej / teks skrin | MALAS AIR · RAJA NONCHALANT | — | create · [blepShooter.ts:89](/mnt/storage/qish/game/src/minigames/blep/blepShooter.ts:89) |
| ☐ M0034 | Mesej / teks skrin | OMEY BLAST | — | create · [blepShooter.ts:114](/mnt/storage/qish/game/src/minigames/blep/blepShooter.ts:114) |
| ☐ M0035 | Mesej / teks skrin | Blep! 😛 Elak zzz, hati tembak sendiri! | — | create · [blepShooter.ts:125](/mnt/storage/qish/game/src/minigames/blep/blepShooter.ts:125) |
| ☐ M0036 | Mesej / teks skrin | OMEY BLAST! 💕 | — | omeyBlast · Math.abs(this.ship.x - this.boss.x) &lt; 220 · [blepShooter.ts:182](/mnt/storage/qish/game/src/minigames/blep/blepShooter.ts:182) |
| ☐ M0037 | Mesej / teks skrin | Tersasar! Bawa kapal bawah MALAS AIR | — | omeyBlast · bukan Math.abs(this.ship.x - this.boss.x) &lt; 220 · [blepShooter.ts:183](/mnt/storage/qish/game/src/minigames/blep/blepShooter.ts:183) |
| ☐ M0038 | Mesej / teks skrin | Zzz... mengantuk sekejap! | — | hurt · [blepShooter.ts:192](/mnt/storage/qish/game/src/minigames/blep/blepShooter.ts:192) |
| ☐ M0039 | Mesej / teks skrin | ALAMAK. | — | win · [blepShooter.ts:212](/mnt/storage/qish/game/src/minigames/blep/blepShooter.ts:212) |
| ☐ M0040 | Mesej / teks skrin | z | — | update.label · this.shootIn &lt;= 0 · [blepShooter.ts:280](/mnt/storage/qish/game/src/minigames/blep/blepShooter.ts:280) |

<a id="qc-94"></a>

## 94. Minigame / teks babak · bolatRhythm

| QC / ID | Watak / jenis | Dialog asal | Ekspresi | Konteks / sumber |
|---|---|---|---|---|
| ☐ M0041 | Pilihan / nilai teks dinamik | Kiss | — | REQUESTS[1].label · [bolatRhythm.ts:27](/mnt/storage/qish/game/src/minigames/bolat/bolatRhythm.ts:27) |
| ☐ M0042 | Pilihan / nilai teks dinamik | Cuddle | — | REQUESTS[2].label · [bolatRhythm.ts:28](/mnt/storage/qish/game/src/minigames/bolat/bolatRhythm.ts:28) |
| ☐ M0043 | Pilihan / nilai teks dinamik | Peluk | — | REQUESTS[3].label · [bolatRhythm.ts:29](/mnt/storage/qish/game/src/minigames/bolat/bolatRhythm.ts:29) |
| ☐ M0044 | Mesej / teks skrin | REQUEST<br>MALAM NI | — | create · [bolatRhythm.ts:116](/mnt/storage/qish/game/src/minigames/bolat/bolatRhythm.ts:116) |
| ☐ M0045 | Mesej / teks skrin | ♡ | — | create.t · [bolatRhythm.ts:120](/mnt/storage/qish/game/src/minigames/bolat/bolatRhythm.ts:120) |
| ☐ M0046 | Mesej / teks skrin | ♥ | — | create.glyph · [bolatRhythm.ts:129](/mnt/storage/qish/game/src/minigames/bolat/bolatRhythm.ts:129) |
| ☐ M0047 | Mesej / teks skrin | BUSKING LORBEL | — | drawStage · [bolatRhythm.ts:170](/mnt/storage/qish/game/src/minigames/bolat/bolatRhythm.ts:170) |
| ☐ M0048 | Mesej / teks skrin | ♪ request lagu boleh ♪ | — | drawStage · [bolatRhythm.ts:172](/mnt/storage/qish/game/src/minigames/bolat/bolatRhythm.ts:172) |
| ☐ M0049 | Mesej / teks skrin | ♡ | — | startSong · [bolatRhythm.ts:227](/mnt/storage/qish/game/src/minigames/bolat/bolatRhythm.ts:227) |
| ☐ M0050 | Mesej / teks skrin | Sedia... | — | startSong · [bolatRhythm.ts:243](/mnt/storage/qish/game/src/minigames/bolat/bolatRhythm.ts:243) |
| ☐ M0051 | Mesej / teks skrin | ♥ | — | snap.h · [bolatRhythm.ts:262](/mnt/storage/qish/game/src/minigames/bolat/bolatRhythm.ts:262) |
| ☐ M0052 | Mesej / teks skrin | ♥ | — | snap · i &lt; filled · [bolatRhythm.ts:266](/mnt/storage/qish/game/src/minigames/bolat/bolatRhythm.ts:266) |
| ☐ M0053 | Mesej / teks skrin | ♡ | — | snap · bukan i &lt; filled · [bolatRhythm.ts:266](/mnt/storage/qish/game/src/minigames/bolat/bolatRhythm.ts:266) |
| ☐ M0054 | Mesej / teks skrin | Miss | — | update · n.state === "live"; dt &lt; -this.window · [bolatRhythm.ts:296](/mnt/storage/qish/game/src/minigames/bolat/bolatRhythm.ts:296) |
| ☐ M0055 | Mesej / teks skrin | Perfect! ${REQUESTS[best.kind].icon} | — | update · input.pressed("a") &amp;&amp; this.cooldown &lt;= 0; best; perfect · [bolatRhythm.ts:315](/mnt/storage/qish/game/src/minigames/bolat/bolatRhythm.ts:315) |
| ☐ M0056 | Mesej / teks skrin | Good! | — | update · input.pressed("a") &amp;&amp; this.cooldown &lt;= 0; best; bukan perfect · [bolatRhythm.ts:315](/mnt/storage/qish/game/src/minigames/bolat/bolatRhythm.ts:315) |
| ☐ M0057 | Mesej / teks skrin | ${this.combo} combo! | — | update · input.pressed("a") &amp;&amp; this.cooldown &lt;= 0; best; this.combo &gt;= 4 · [bolatRhythm.ts:316](/mnt/storage/qish/game/src/minigames/bolat/bolatRhythm.ts:316) |
| ☐ M0058 | Mesej / teks skrin | Awal sangat! | — | update · input.pressed("a") &amp;&amp; this.cooldown &lt;= 0; bukan best · [bolatRhythm.ts:324](/mnt/storage/qish/game/src/minigames/bolat/bolatRhythm.ts:324) |
| ☐ M0059 | Mesej / teks skrin | Request dipenuhi: ${pct}%! | — | finish · rate &gt;= PASS_RATE · [bolatRhythm.ts:339](/mnt/storage/qish/game/src/minigames/bolat/bolatRhythm.ts:339) |
| ☐ M0060 | Mesej / teks skrin | ${pct}%... Bolat merajuk 😤<br>Cuba lagi! | — | finish · bukan rate &gt;= PASS_RATE · [bolatRhythm.ts:348](/mnt/storage/qish/game/src/minigames/bolat/bolatRhythm.ts:348) |

<a id="qc-95"></a>

## 95. Minigame / teks babak · bolatexMemory

| QC / ID | Watak / jenis | Dialog asal | Ekspresi | Konteks / sumber |
|---|---|---|---|---|
| ☐ M0061 | Mesej / teks skrin | GALERI MEMORI | — | create · [bolatexMemory.ts:76](/mnt/storage/qish/game/src/minigames/bolatex/bolatexMemory.ts:76) |
| ☐ M0062 | Mesej / teks skrin | Padankan kenangan yang sama! | — | create · [bolatexMemory.ts:129](/mnt/storage/qish/game/src/minigames/bolatex/bolatexMemory.ts:129) |
| ☐ M0063 | Mesej / teks skrin | Kenangan tersusun: ${this.matched} / ${STRIPS.length} | — | refresh · [bolatexMemory.ts:133](/mnt/storage/qish/game/src/minigames/bolatex/bolatexMemory.ts:133) |
| ☐ M0064 | Mesej / teks skrin | Good memories ♡ | — | pick · a.pair === b.pair · [bolatexMemory.ts:179](/mnt/storage/qish/game/src/minigames/bolatex/bolatexMemory.ts:179) |
| ☐ M0065 | Mesej / teks skrin | Ingat ni! | — | pick · a.pair === b.pair · [bolatexMemory.ts:179](/mnt/storage/qish/game/src/minigames/bolatex/bolatexMemory.ts:179) |
| ☐ M0066 | Mesej / teks skrin | Comel! | — | pick · a.pair === b.pair · [bolatexMemory.ts:179](/mnt/storage/qish/game/src/minigames/bolatex/bolatexMemory.ts:179) |
| ☐ M0067 | Mesej / teks skrin | ♡♡♡ | — | pick · a.pair === b.pair · [bolatexMemory.ts:179](/mnt/storage/qish/game/src/minigames/bolatex/bolatexMemory.ts:179) |
| ☐ M0068 | Mesej / teks skrin | Semua kenangan tersusun! ♡ | — | win · [bolatexMemory.ts:205](/mnt/storage/qish/game/src/minigames/bolatex/bolatexMemory.ts:205) |

<a id="qc-96"></a>

## 96. Minigame / teks babak · bowatBeach

| QC / ID | Watak / jenis | Dialog asal | Ekspresi | Konteks / sumber |
|---|---|---|---|---|
| ☐ M0069 | Mesej / teks skrin | Busuk!! | — | create · [bowatBeach.ts:104](/mnt/storage/qish/game/src/minigames/bowat/bowatBeach.ts:104) |
| ☐ M0070 | Mesej / teks skrin | ▼ | — | create · [bowatBeach.ts:111](/mnt/storage/qish/game/src/minigames/bowat/bowatBeach.ts:111) |
| ☐ M0071 | Mesej / teks skrin | BUKIT BINTANG · SIMPANG SCRAMBLE | — | drawBackdrop · [bowatBeach.ts:171](/mnt/storage/qish/game/src/minigames/bowat/bowatBeach.ts:171) |
| ☐ M0072 | Countdown | Sedia... | — | intro · [bowatBeach.ts:218](/mnt/storage/qish/game/src/minigames/bowat/bowatBeach.ts:218) |
| ☐ M0073 | Countdown | Pijak Bowat! | — | intro · [bowatBeach.ts:218](/mnt/storage/qish/game/src/minigames/bowat/bowatBeach.ts:218) |
| ☐ M0074 | Mesej / teks skrin | Bowat ${"●".repeat(HITS_TO_WIN - this.hits)}${"○".repeat(this.hits)} | — | refreshHud · [bowatBeach.ts:228](/mnt/storage/qish/game/src/minigames/bowat/bowatBeach.ts:228) |
| ☐ M0075 | Mesej / teks skrin | Cuba lagi! Ikut anak panah ▼ | — | fail · this.fails &gt;= 2 · [bowatBeach.ts:271](/mnt/storage/qish/game/src/minigames/bowat/bowatBeach.ts:271) |
| ☐ M0076 | Mesej / teks skrin | Bowat gelak... cuba lagi! | — | fail · bukan this.fails &gt;= 2 · [bowatBeach.ts:271](/mnt/storage/qish/game/src/minigames/bowat/bowatBeach.ts:271) |
| ☐ M0077 | Mesej / teks skrin | Aduh! | — | touchBoss · bukan falling &amp;&amp; above; this.bossInvuln &lt;= 0 · [bowatBeach.ts:289](/mnt/storage/qish/game/src/minigames/bowat/bowatBeach.ts:289) |
| ☐ M0078 | Mesej / teks skrin | PROT! | — | stomp · [bowatBeach.ts:298](/mnt/storage/qish/game/src/minigames/bowat/bowatBeach.ts:298) |
| ☐ M0079 | Mesej / teks skrin | Bowat pening! 💫 | — | win · [bowatBeach.ts:314](/mnt/storage/qish/game/src/minigames/bowat/bowatBeach.ts:314) |
| ☐ M0080 | Mesej / teks skrin | PROT! | — | fart · [bowatBeach.ts:321](/mnt/storage/qish/game/src/minigames/bowat/bowatBeach.ts:321) |

<a id="qc-97"></a>

## 97. Minigame / teks babak · framework

| QC / ID | Watak / jenis | Dialog asal | Ekspresi | Konteks / sumber |
|---|---|---|---|---|
| ☐ M0081 | Mesej / teks skrin | ✦ | — | introCard.card · [framework.ts:58](/mnt/storage/qish/game/src/minigames/framework.ts:58) |
| ☐ M0082 | Mesej / teks skrin | A START! Enter / Space / Tap | — | introCard.card · [framework.ts:58](/mnt/storage/qish/game/src/minigames/framework.ts:58) |
| ☐ M0083 | Mesej / teks skrin | Susah sangat? Tekan B untuk skip 😉 | — | runMinigame.ctx.fail · fails &gt;= SKIP_AFTER &amp;&amp; !skipHint · [framework.ts:96](/mnt/storage/qish/game/src/minigames/framework.ts:96) |

<a id="qc-98"></a>

## 98. Minigame / teks babak · megaBowatFlappy

| QC / ID | Watak / jenis | Dialog asal | Ekspresi | Konteks / sumber |
|---|---|---|---|---|
| ☐ M0084 | Mesej / teks skrin | COSY PLACE · DAPUR | — | create · [megaBowatFlappy.ts:76](/mnt/storage/qish/game/src/minigames/megabowat/megaBowatFlappy.ts:76) |
| ☐ M0085 | Mesej / teks skrin | Tekan A untuk PROT! 💨 | — | create · [megaBowatFlappy.ts:85](/mnt/storage/qish/game/src/minigames/megabowat/megaBowatFlappy.ts:85) |
| ☐ M0086 | Mesej / teks skrin | 🍪 ${this.eaten} / ${GOAL} | — | refresh · [megaBowatFlappy.ts:93](/mnt/storage/qish/game/src/minigames/megabowat/megaBowatFlappy.ts:93) |
| ☐ M0087 | Mesej / teks skrin | Kenyang! *garu ontot* 😌 | — | win · [megaBowatFlappy.ts:137](/mnt/storage/qish/game/src/minigames/megabowat/megaBowatFlappy.ts:137) |
| ☐ M0088 | Mesej / teks skrin | Tang! 🍳 | — | bump · [megaBowatFlappy.ts:148](/mnt/storage/qish/game/src/minigames/megabowat/megaBowatFlappy.ts:148) |
| ☐ M0089 | Mesej / teks skrin | Nyam! | — | update · c.cookie; Math.abs(c.x - this.bowat.x) &lt; 60 &amp;&amp; Math.abs(c.gapY - this.bowat.y) &lt; 80 · [megaBowatFlappy.ts:203](/mnt/storage/qish/game/src/minigames/megabowat/megaBowatFlappy.ts:203) |
| ☐ M0090 | Mesej / teks skrin | MAKAN BANYAK! | — | update · c.cookie; Math.abs(c.x - this.bowat.x) &lt; 60 &amp;&amp; Math.abs(c.gapY - this.bowat.y) &lt; 80 · [megaBowatFlappy.ts:203](/mnt/storage/qish/game/src/minigames/megabowat/megaBowatFlappy.ts:203) |
| ☐ M0091 | Mesej / teks skrin | Cookies! 🍪 | — | update · c.cookie; Math.abs(c.x - this.bowat.x) &lt; 60 &amp;&amp; Math.abs(c.gapY - this.bowat.y) &lt; 80 · [megaBowatFlappy.ts:203](/mnt/storage/qish/game/src/minigames/megabowat/megaBowatFlappy.ts:203) |
| ☐ M0092 | Mesej / teks skrin | Lagi! | — | update · c.cookie; Math.abs(c.x - this.bowat.x) &lt; 60 &amp;&amp; Math.abs(c.gapY - this.bowat.y) &lt; 80 · [megaBowatFlappy.ts:203](/mnt/storage/qish/game/src/minigames/megabowat/megaBowatFlappy.ts:203) |

<a id="qc-99"></a>

## 99. Minigame / teks babak · registry

| QC / ID | Watak / jenis | Dialog asal | Ekspresi | Konteks / sumber |
|---|---|---|---|---|
| ☐ M0093 | Intro boss | Bowat | — | MINIGAMES.bowat.title · [registry.ts:19](/mnt/storage/qish/game/src/minigames/registry.ts:19) |
| ☐ M0094 | Intro boss | Boss 1 · Bukit Bintang | — | MINIGAMES.bowat.place · [registry.ts:20](/mnt/storage/qish/game/src/minigames/registry.ts:20) |
| ☐ M0095 | Intro boss | ← → gerak · A lompat | — | MINIGAMES.bowat.howTo · [registry.ts:21](/mnt/storage/qish/game/src/minigames/registry.ts:21) |
| ☐ M0096 | Intro boss | Pijak kepala Bowat 3 kali | — | MINIGAMES.bowat.howTo · [registry.ts:21](/mnt/storage/qish/game/src/minigames/registry.ts:21) |
| ☐ M0097 | Intro boss | Elak awan kentut! 💨 | — | MINIGAMES.bowat.howTo · [registry.ts:21](/mnt/storage/qish/game/src/minigames/registry.ts:21) |
| ☐ M0098 | Intro boss | Bolat | — | MINIGAMES.bolat.title · [registry.ts:28](/mnt/storage/qish/game/src/minigames/registry.ts:28) |
| ☐ M0099 | Intro boss | Boss 2 · Pentas Lorbel | — | MINIGAMES.bolat.place · [registry.ts:29](/mnt/storage/qish/game/src/minigames/registry.ts:29) |
| ☐ M0100 | Intro boss | 💋 Kiss · 🤗 Cuddle · ❤️ Peluk datang ke ♥ | — | MINIGAMES.bolat.howTo · [registry.ts:30](/mnt/storage/qish/game/src/minigames/registry.ts:30) |
| ☐ M0101 | Intro boss | Tekan A bila dia sampai dalam ♥, ikut rentak | — | MINIGAMES.bolat.howTo · [registry.ts:30](/mnt/storage/qish/game/src/minigames/registry.ts:30) |
| ☐ M0102 | Intro boss | Penuhi separuh request untuk menang | — | MINIGAMES.bolat.howTo · [registry.ts:30](/mnt/storage/qish/game/src/minigames/registry.ts:30) |
| ☐ M0103 | Intro boss | Snorlax Twin | — | MINIGAMES.snorlax.title · [registry.ts:38](/mnt/storage/qish/game/src/minigames/registry.ts:38) |
| ☐ M0104 | Intro boss | Boss 3 · Tasik Lily | — | MINIGAMES.snorlax.place · [registry.ts:39](/mnt/storage/qish/game/src/minigames/registry.ts:39) |
| ☐ M0105 | Intro boss | ← → gerak (atau seret jari) | — | MINIGAMES.snorlax.howTo · [registry.ts:40](/mnt/storage/qish/game/src/minigames/registry.ts:40) |
| ☐ M0106 | Intro boss | Tangkap makanan kegemaran dia 🍖🍰🍜🍢🍪 | — | MINIGAMES.snorlax.howTo · [registry.ts:40](/mnt/storage/qish/game/src/minigames/registry.ts:40) |
| ☐ M0107 | Intro boss | Elak jam loceng ⏰ · bagi 12 sampai kenyang | — | MINIGAMES.snorlax.howTo · [registry.ts:40](/mnt/storage/qish/game/src/minigames/registry.ts:40) |
| ☐ M0108 | Intro boss | Blep | — | MINIGAMES.blep.title · [registry.ts:48](/mnt/storage/qish/game/src/minigames/registry.ts:48) |
| ☐ M0109 | Intro boss | Boss 4 · KLIA | — | MINIGAMES.blep.place · [registry.ts:49](/mnt/storage/qish/game/src/minigames/registry.ts:49) |
| ☐ M0110 | Intro boss | Arrow gerak kapal terbang (atau seret jari) | — | MINIGAMES.blep.howTo · [registry.ts:50](/mnt/storage/qish/game/src/minigames/registry.ts:50) |
| ☐ M0111 | Intro boss | Hati tembak sendiri · elak gelembung zzz | — | MINIGAMES.blep.howTo · [registry.ts:50](/mnt/storage/qish/game/src/minigames/registry.ts:50) |
| ☐ M0112 | Intro boss | A bila bar penuh = OMEY BLAST 💕 | — | MINIGAMES.blep.howTo · [registry.ts:50](/mnt/storage/qish/game/src/minigames/registry.ts:50) |
| ☐ M0113 | Intro boss | Mega Bowat | — | MINIGAMES.megabowat.title · [registry.ts:58](/mnt/storage/qish/game/src/minigames/registry.ts:58) |
| ☐ M0114 | Intro boss | Boss 5 · Nyomnyom City | — | MINIGAMES.megabowat.place · [registry.ts:59](/mnt/storage/qish/game/src/minigames/registry.ts:59) |
| ☐ M0115 | Intro boss | Tekan A (atau tap) untuk PROT ke atas 💨 | — | MINIGAMES.megabowat.howTo · [registry.ts:60](/mnt/storage/qish/game/src/minigames/registry.ts:60) |
| ☐ M0116 | Intro boss | Makan 10 cookies 🍪 | — | MINIGAMES.megabowat.howTo · [registry.ts:60](/mnt/storage/qish/game/src/minigames/registry.ts:60) |
| ☐ M0117 | Intro boss | Langgar periuk cuma melantun | — | MINIGAMES.megabowat.howTo · [registry.ts:60](/mnt/storage/qish/game/src/minigames/registry.ts:60) |
| ☐ M0118 | Intro boss | Bolat ex | — | MINIGAMES.bolatex.title · [registry.ts:68](/mnt/storage/qish/game/src/minigames/registry.ts:68) |
| ☐ M0119 | Intro boss | Boss 6 · Galeri Memori | — | MINIGAMES.bolatex.place · [registry.ts:69](/mnt/storage/qish/game/src/minigames/registry.ts:69) |
| ☐ M0120 | Intro boss | Arrow + A untuk buka kad (atau tap) | — | MINIGAMES.bolatex.howTo · [registry.ts:70](/mnt/storage/qish/game/src/minigames/registry.ts:70) |
| ☐ M0121 | Intro boss | Padankan photo strip yang sama | — | MINIGAMES.bolatex.howTo · [registry.ts:70](/mnt/storage/qish/game/src/minigames/registry.ts:70) |
| ☐ M0122 | Intro boss | Tiada had cubaan ♡ | — | MINIGAMES.bolatex.howTo · [registry.ts:70](/mnt/storage/qish/game/src/minigames/registry.ts:70) |
| ☐ M0123 | Intro boss | Qish ex | — | MINIGAMES.qishex.title · [registry.ts:78](/mnt/storage/qish/game/src/minigames/registry.ts:78) |
| ☐ M0124 | Intro boss | Boss 7 · Persiaran Perdana, Putrajaya | — | MINIGAMES.qishex.place · [registry.ts:79](/mnt/storage/qish/game/src/minigames/registry.ts:79) |
| ☐ M0125 | Intro boss | ← → tukar lorong | — | MINIGAMES.qishex.howTo · [registry.ts:80](/mnt/storage/qish/game/src/minigames/registry.ts:80) |
| ☐ M0126 | Intro boss | A bila papan FAT ASS dekat → jadi SO TINY! | — | MINIGAMES.qishex.howTo · [registry.ts:80](/mnt/storage/qish/game/src/minigames/registry.ts:80) |
| ☐ M0127 | Intro boss | Kumpul 10 SO TINY! | — | MINIGAMES.qishex.howTo · [registry.ts:80](/mnt/storage/qish/game/src/minigames/registry.ts:80) |
| ☐ M0128 | Intro boss | Raja Nonchalant | — | MINIGAMES.finale.title · [registry.ts:87](/mnt/storage/qish/game/src/minigames/registry.ts:87) |
| ☐ M0129 | Intro boss | Finale · Litar Sepang | — | MINIGAMES.finale.place · [registry.ts:88](/mnt/storage/qish/game/src/minigames/registry.ts:88) |
| ☐ M0130 | Intro boss | Pilih move dari kad yang awak kumpul | — | MINIGAMES.finale.howTo · [registry.ts:89](/mnt/storage/qish/game/src/minigames/registry.ts:89) |
| ☐ M0131 | Intro boss | Arrow + A untuk pilih, atau tap terus | — | MINIGAMES.finale.howTo · [registry.ts:89](/mnt/storage/qish/game/src/minigames/registry.ts:89) |
| ☐ M0132 | Intro boss | Jangan risau, Qish takkan kalah 💛 | — | MINIGAMES.finale.howTo · [registry.ts:89](/mnt/storage/qish/game/src/minigames/registry.ts:89) |

<a id="qc-100"></a>

## 100. Minigame / teks babak · qishRunner

| QC / ID | Watak / jenis | Dialog asal | Ekspresi | Konteks / sumber |
|---|---|---|---|---|
| ☐ M0133 | Teks skrin | SO TINY! | — | createQishRunner.updateCount · [qishRunner.ts:187](/mnt/storage/qish/game/src/minigames/runner/qishRunner.ts:187) |
| ☐ M0134 | Teks skrin | / | — | createQishRunner.updateCount · [qishRunner.ts:187](/mnt/storage/qish/game/src/minigames/runner/qishRunner.ts:187) |
| ☐ M0135 | Mesej / teks skrin | Sedia... LARI! | — | createQishRunner · [qishRunner.ts:189](/mnt/storage/qish/game/src/minigames/runner/qishRunner.ts:189) |
| ☐ M0136 | Mesej / teks skrin | SHE'S SO TINY!! | — | createQishRunner.win · [qishRunner.ts:217](/mnt/storage/qish/game/src/minigames/runner/qishRunner.ts:217) |
| ☐ M0137 | Mesej / teks skrin | ANGAT KUYUSH! | — | createQishRunner.off · !done &amp;&amp; input.pressed("a"); target · [qishRunner.ts:291](/mnt/storage/qish/game/src/minigames/runner/qishRunner.ts:291) |
| ☐ M0138 | Mesej / teks skrin | SO TINY! 💕 | — | createQishRunner.off · !done &amp;&amp; input.pressed("a"); target · [qishRunner.ts:291](/mnt/storage/qish/game/src/minigames/runner/qishRunner.ts:291) |
| ☐ M0139 | Mesej / teks skrin | Tau pun! | — | createQishRunner.off · !done &amp;&amp; input.pressed("a"); target · [qishRunner.ts:291](/mnt/storage/qish/game/src/minigames/runner/qishRunner.ts:291) |
| ☐ M0140 | Mesej / teks skrin | Antek giler! | — | createQishRunner.off · !done &amp;&amp; input.pressed("a"); target · [qishRunner.ts:291](/mnt/storage/qish/game/src/minigames/runner/qishRunner.ts:291) |
| ☐ M0141 | Mesej / teks skrin | Angat! 😤 | — | createQishRunner.off · w.state === "incoming"; p.z &gt; HIT_NEAR &amp;&amp; !done; w.lane === lane · [qishRunner.ts:308](/mnt/storage/qish/game/src/minigames/runner/qishRunner.ts:308) |

<a id="qc-101"></a>

## 101. Minigame / teks babak · snorlaxCatcher

| QC / ID | Watak / jenis | Dialog asal | Ekspresi | Konteks / sumber |
|---|---|---|---|---|
| ☐ M0142 | Pilihan / nilai teks dinamik | Daging salai | — | FOODS[1].name · [snorlaxCatcher.ts:16](/mnt/storage/qish/game/src/minigames/snorlax/snorlaxCatcher.ts:16) |
| ☐ M0143 | Pilihan / nilai teks dinamik | Kek mango | — | FOODS[2].name · [snorlaxCatcher.ts:17](/mnt/storage/qish/game/src/minigames/snorlax/snorlaxCatcher.ts:17) |
| ☐ M0144 | Pilihan / nilai teks dinamik | Dubuyo | — | FOODS[3].name · [snorlaxCatcher.ts:18](/mnt/storage/qish/game/src/minigames/snorlax/snorlaxCatcher.ts:18) |
| ☐ M0145 | Pilihan / nilai teks dinamik | Malatang | — | FOODS[4].name · [snorlaxCatcher.ts:19](/mnt/storage/qish/game/src/minigames/snorlax/snorlaxCatcher.ts:19) |
| ☐ M0146 | Pilihan / nilai teks dinamik | Cookies | — | FOODS[5].name · [snorlaxCatcher.ts:20](/mnt/storage/qish/game/src/minigames/snorlax/snorlaxCatcher.ts:20) |
| ☐ M0147 | Mesej / teks skrin | Zzz | — | create · [snorlaxCatcher.ts:111](/mnt/storage/qish/game/src/minigames/snorlax/snorlaxCatcher.ts:111) |
| ☐ M0148 | Mesej / teks skrin | Kenyang | — | create · [snorlaxCatcher.ts:118](/mnt/storage/qish/game/src/minigames/snorlax/snorlaxCatcher.ts:118) |
| ☐ M0149 | Mesej / teks skrin | ⚖️ 80.0kg | — | create · [snorlaxCatcher.ts:122](/mnt/storage/qish/game/src/minigames/snorlax/snorlaxCatcher.ts:122) |
| ☐ M0150 | Mesej / teks skrin | Tangkap makanan untuk dia! | — | create · [snorlaxCatcher.ts:131](/mnt/storage/qish/game/src/minigames/snorlax/snorlaxCatcher.ts:131) |
| ☐ M0151 | Mesej / teks skrin | ⏰ | — | spawn.obj · alarm · [snorlaxCatcher.ts:151](/mnt/storage/qish/game/src/minigames/snorlax/snorlaxCatcher.ts:151) |
| ☐ M0152 | Mesej / teks skrin | ⚖️ ${(80 + this.fed * 0.5).toFixed(1)}kg | — | catchFood · [snorlaxCatcher.ts:159](/mnt/storage/qish/game/src/minigames/snorlax/snorlaxCatcher.ts:159) |
| ☐ M0153 | Mesej / teks skrin | ${f.food!.name}! 😋 | — | catchFood · [snorlaxCatcher.ts:161](/mnt/storage/qish/game/src/minigames/snorlax/snorlaxCatcher.ts:161) |
| ☐ M0154 | Mesej / teks skrin | Eh! Jam loceng! ⏰ | — | stumble · [snorlaxCatcher.ts:184](/mnt/storage/qish/game/src/minigames/snorlax/snorlaxCatcher.ts:184) |
| ☐ M0155 | Mesej / teks skrin | !! | — | win · [snorlaxCatcher.ts:195](/mnt/storage/qish/game/src/minigames/snorlax/snorlaxCatcher.ts:195) |
| ☐ M0156 | Mesej / teks skrin | NYAM!! Dah kenyang! 😋 | — | win · [snorlaxCatcher.ts:198](/mnt/storage/qish/game/src/minigames/snorlax/snorlaxCatcher.ts:198) |

<a id="qc-102"></a>

## 102. Minigame / teks babak · dream

| QC / ID | Watak / jenis | Dialog asal | Ekspresi | Konteks / sumber |
|---|---|---|---|---|
| ☐ M0157 | Mesej / teks skrin | CUBIT! | — | act · kind === "pinch" · [dream.ts:41](/mnt/storage/qish/game/src/intro/dream.ts:41) |
| ☐ M0158 | Mesej / teks skrin | hmph 💢 | — | act · bukan kind === "pinch"; kind === "sulk" · [dream.ts:48](/mnt/storage/qish/game/src/intro/dream.ts:48) |
| ☐ M0159 | Mesej / teks skrin | k bye | — | act.bye · bukan kind === "pinch"; bukan kind === "sulk"; kind === "leave" · [dream.ts:52](/mnt/storage/qish/game/src/intro/dream.ts:52) |

<a id="qc-103"></a>

## 103. Minigame / teks babak · cake

| QC / ID | Watak / jenis | Dialog asal | Ekspresi | Konteks / sumber |
|---|---|---|---|---|
| ☐ M0160 | Mesej / teks skrin | Tiup lilin! 🎂<br> Tiup ke mikrofon, atau tahan A / tekan kek | — | blowCandles.hint · [cake.ts:147](/mnt/storage/qish/game/src/ending/cake.ts:147) |
| ☐ M0161 | Teks skrin | Tiup lilin! 🎂<br> 🎤 Mic aktif · tiup kuat-kuat (atau tahan A) | — | blowCandles · mic · [cake.ts:159](/mnt/storage/qish/game/src/ending/cake.ts:159) |

<a id="qc-104"></a>

## 104. Minigame / teks babak · ending

| QC / ID | Watak / jenis | Dialog asal | Ekspresi | Konteks / sumber |
|---|---|---|---|---|
| ☐ M0162 | Teks skrin | SEPUCUK SURAT, UNTUK SAYANG ♡ A Baca terus ♡ ↑ ↓ / Scroll untuk baca | — | letter · [ending.ts:63](/mnt/storage/qish/game/src/ending/ending.ts:63) |
| ☐ M0163 | Teks skrin | A Simpan dalam hati ♡ | — | letter · [ending.ts:85](/mnt/storage/qish/game/src/ending/ending.ts:85) |
| ☐ M0164 | Teks skrin | HP | — | ninthCard · [ending.ts:101](/mnt/storage/qish/game/src/ending/ending.ts:101) |
| ☐ M0165 | Teks skrin | Satu kad lagi...? | — | ninthCard · [ending.ts:123](/mnt/storage/qish/game/src/ending/ending.ts:123) |
| ☐ M0166 | Teks skrin | Kad ke-9 rahsia! | — | ninthCard · [ending.ts:131](/mnt/storage/qish/game/src/ending/ending.ts:131) |
| ☐ M0167 | Mesej / teks skrin | 💌 Pusing belakang! Faris: tekan A lepas serah kad ke-9 | — | ninthCard · firstTime · [ending.ts:138](/mnt/storage/qish/game/src/ending/ending.ts:138) |
| ☐ M0168 | Mesej / teks skrin | Tekan A untuk teruskan | — | ninthCard · bukan firstTime · [ending.ts:139](/mnt/storage/qish/game/src/ending/ending.ts:139) |
| ☐ M0169 | Mesej / teks skrin | SURPRISE!! 🎉 | — | playEnding.shout · [ending.ts:154](/mnt/storage/qish/game/src/ending/ending.ts:154) |

<a id="qc-105"></a>

## 105. Minigame / teks babak · cardReveal

| QC / ID | Watak / jenis | Dialog asal | Ekspresi | Konteks / sumber |
|---|---|---|---|---|
| ☐ M0170 | Teks skrin | SATU JEJAK. SATU KENANGAN. | — | revealCard · [cardReveal.ts:26](/mnt/storage/qish/game/src/ui/cardReveal.ts:26) |
| ☐ M0171 | Teks skrin | KOLEKSI POKÉLOVE · | — | revealCard · [cardReveal.ts:57](/mnt/storage/qish/game/src/ui/cardReveal.ts:57) |
| ☐ M0172 | Teks skrin | / 8 | — | revealCard · [cardReveal.ts:57](/mnt/storage/qish/game/src/ui/cardReveal.ts:57) |
| ☐ M0173 | Teks skrin | ! | — | revealCard · [cardReveal.ts:57](/mnt/storage/qish/game/src/ui/cardReveal.ts:57) |
| ☐ M0174 | Mesej / teks skrin | Dibuang mengikut QC 27 Oktober 2026. | — | Tiada lagi prompt kad fizikal pada reveal biasa. |
| ☐ M0175 | Mesej / teks skrin | Tekan {aksi} untuk teruskan | — | Space pada keyboard, A pada sentuhan; simbol controller ikut peranti. |

<a id="qc-106"></a>

## 106. Minigame / teks babak · phone

| QC / ID | Watak / jenis | Dialog asal | Ekspresi | Konteks / sumber |
|---|---|---|---|---|
| ☐ M0176 | Mesej / teks skrin | ➤ <br> <br> Tekan A untuk tutup | — | showPhone.root · [phone.ts:22](/mnt/storage/qish/game/src/ui/phone.ts:22) |
| ☐ M0177 | Teks skrin | online | — | showPhone · wake · [phone.ts:42](/mnt/storage/qish/game/src/ui/phone.ts:42) |
| ☐ M0178 | Teks skrin | typing... | — | showPhone · wake · [phone.ts:45](/mnt/storage/qish/game/src/ui/phone.ts:45) |
| ☐ M0179 | Teks skrin | online | — | showPhone · wake · [phone.ts:49](/mnt/storage/qish/game/src/ui/phone.ts:49) |

<a id="qc-107"></a>

## 107. Dialog rawak NPC · bintangProps

| QC / ID | Watak / jenis | Dialog asal | Ekspresi | Konteks / sumber |
|---|---|---|---|---|
| ☐ N0001 | NPC · ayat rawak | BUSUKNYA!! | — | PANIC_BARK[1] · [bintangProps.ts:1906](/mnt/storage/qish/game/src/zones/bintangProps.ts:1906) |
| ☐ N0002 | NPC · ayat rawak | Siapa kentut?! | — | PANIC_BARK[2] · [bintangProps.ts:1906](/mnt/storage/qish/game/src/zones/bintangProps.ts:1906) |
| ☐ N0003 | NPC · ayat rawak | Lari!! | — | PANIC_BARK[3] · [bintangProps.ts:1906](/mnt/storage/qish/game/src/zones/bintangProps.ts:1906) |
| ☐ N0004 | NPC · ayat rawak | Tak tahan!! | — | PANIC_BARK[4] · [bintangProps.ts:1906](/mnt/storage/qish/game/src/zones/bintangProps.ts:1906) |
| ☐ N0005 | NPC · ayat rawak | Mak aiii! | — | PANIC_BARK[5] · [bintangProps.ts:1906](/mnt/storage/qish/game/src/zones/bintangProps.ts:1906) |
| ☐ N0006 | NPC · ayat rawak | Hidung saya!! | — | PANIC_BARK[6] · [bintangProps.ts:1906](/mnt/storage/qish/game/src/zones/bintangProps.ts:1906) |
| ☐ N0007 | NPC · ayat rawak | Bau apa ni?! | — | PANIC_BARK[7] · [bintangProps.ts:1906](/mnt/storage/qish/game/src/zones/bintangProps.ts:1906) |
| ☐ N0008 | NPC · ayat rawak | Tolong!! | — | PANIC_BARK[8] · [bintangProps.ts:1906](/mnt/storage/qish/game/src/zones/bintangProps.ts:1906) |
| ☐ N0009 | NPC · ayat rawak | Uhuk uhuk! | — | PANIC_BARK[9] · [bintangProps.ts:1906](/mnt/storage/qish/game/src/zones/bintangProps.ts:1906) |
| ☐ N0010 | NPC · ayat rawak | Ya Allah... | — | PANIC_BARK[10] · [bintangProps.ts:1906](/mnt/storage/qish/game/src/zones/bintangProps.ts:1906) |
| ☐ N0011 | NPC · ayat rawak | Jom shawarma! | — | CALM_BARK[1] · [bintangProps.ts:1907](/mnt/storage/qish/game/src/zones/bintangProps.ts:1907) |
| ☐ N0012 | NPC · ayat rawak | Cantiknya skrin tu | — | CALM_BARK[2] · [bintangProps.ts:1907](/mnt/storage/qish/game/src/zones/bintangProps.ts:1907) |
| ☐ N0013 | NPC · ayat rawak | Monorel dah sampai | — | CALM_BARK[3] · [bintangProps.ts:1907](/mnt/storage/qish/game/src/zones/bintangProps.ts:1907) |
| ☐ N0014 | NPC · ayat rawak | Sale kat Bintang Walk! | — | CALM_BARK[4] · [bintangProps.ts:1907](/mnt/storage/qish/game/src/zones/bintangProps.ts:1907) |
| ☐ N0015 | NPC · ayat rawak | Lagu ni best | — | CALM_BARK[5] · [bintangProps.ts:1907](/mnt/storage/qish/game/src/zones/bintangProps.ts:1907) |
| ☐ N0016 | NPC · ayat rawak | Wangi bau lily... | — | CALM_BARK[6] · [bintangProps.ts:1907](/mnt/storage/qish/game/src/zones/bintangProps.ts:1907) |
| ☐ N0017 | NPC · ayat rawak | Tadi siapa kentut eh? | — | CALM_BARK[7] · [bintangProps.ts:1907](/mnt/storage/qish/game/src/zones/bintangProps.ts:1907) |
| ☐ N0018 | NPC · ayat rawak | Selfie jap! | — | CALM_BARK[8] · [bintangProps.ts:1907](/mnt/storage/qish/game/src/zones/bintangProps.ts:1907) |
| ☐ N0019 | NPC · ayat rawak | Jom karaoke! | — | CALM_BARK[9] · [bintangProps.ts:1907](/mnt/storage/qish/game/src/zones/bintangProps.ts:1907) |
| ☐ N0020 | NPC · ayat rawak | Laparnya... | — | CALM_BARK[10] · [bintangProps.ts:1907](/mnt/storage/qish/game/src/zones/bintangProps.ts:1907) |
| ☐ N0021 | NPC · ayat rawak | Eee bau apa ni | — | WHIFF_BARK[1] · [bintangProps.ts:1908](/mnt/storage/qish/game/src/zones/bintangProps.ts:1908) |
| ☐ N0022 | NPC · ayat rawak | Uhuk... | — | WHIFF_BARK[2] · [bintangProps.ts:1908](/mnt/storage/qish/game/src/zones/bintangProps.ts:1908) |
| ☐ N0023 | NPC · ayat rawak | Busuk sikit area ni | — | WHIFF_BARK[3] · [bintangProps.ts:1908](/mnt/storage/qish/game/src/zones/bintangProps.ts:1908) |
| ☐ N0024 | NPC · ayat rawak | Tumpang lalu~ | — | PASS_BARK[1] · [bintangProps.ts:1909](/mnt/storage/qish/game/src/zones/bintangProps.ts:1909) |
| ☐ N0025 | NPC · ayat rawak | Sorry! | — | PASS_BARK[2] · [bintangProps.ts:1909](/mnt/storage/qish/game/src/zones/bintangProps.ts:1909) |
| ☐ N0026 | NPC · ayat rawak | Excuse me! | — | PASS_BARK[3] · [bintangProps.ts:1909](/mnt/storage/qish/game/src/zones/bintangProps.ts:1909) |
| ☐ N0027 | Belon dialog | Hijau! Jom! | — | bintangCrowd.update · bukan a.kind === "walk"; a.state === "wait"; go; Math.random() &lt; 0.15 · [bintangProps.ts:2216](/mnt/storage/qish/game/src/zones/bintangProps.ts:2216) |
| ☐ N0028 | Belon dialog | Lintas! | — | bintangCrowd.update · bukan a.kind === "walk"; a.state === "wait"; go; Math.random() &lt; 0.15 · [bintangProps.ts:2216](/mnt/storage/qish/game/src/zones/bintangProps.ts:2216) |
| ☐ N0029 | Belon dialog | Cepat sikit~ | — | bintangCrowd.update · bukan a.kind === "walk"; a.state === "wait"; go; Math.random() &lt; 0.15 · [bintangProps.ts:2216](/mnt/storage/qish/game/src/zones/bintangProps.ts:2216) |

<a id="qc-108"></a>

## 108. Dialog rawak NPC · cosyPlace

| QC / ID | Watak / jenis | Dialog asal | Ekspresi | Konteks / sumber |
|---|---|---|---|---|
| ☐ N0030 | NPC · ayat rawak | Steak medium rare, perfect | — | DINER_LINES[1][1] · [cosyPlace.ts:296](/mnt/storage/qish/game/src/zones/cosyPlace.ts:296) |
| ☐ N0031 | NPC · ayat rawak | Romantiknya tempat ni | — | DINER_LINES[1][2] · [cosyPlace.ts:296](/mnt/storage/qish/game/src/zones/cosyPlace.ts:296) |
| ☐ N0032 | NPC · ayat rawak | Sayang, nak dessert? | — | DINER_LINES[1][3] · [cosyPlace.ts:296](/mnt/storage/qish/game/src/zones/cosyPlace.ts:296) |
| ☐ N0033 | NPC · ayat rawak | Mahal tapi berbaloi | — | DINER_LINES[2][1] · [cosyPlace.ts:297](/mnt/storage/qish/game/src/zones/cosyPlace.ts:297) |
| ☐ N0034 | NPC · ayat rawak | Lasagna dia sedap kata orang | — | DINER_LINES[2][2] · [cosyPlace.ts:297](/mnt/storage/qish/game/src/zones/cosyPlace.ts:297) |
| ☐ N0035 | NPC · ayat rawak | Shh, piano tengah main | — | DINER_LINES[2][3] · [cosyPlace.ts:297](/mnt/storage/qish/game/src/zones/cosyPlace.ts:297) |
| ☐ N0036 | NPC · ayat rawak | Happy anniversary, sayang | — | DINER_LINES[3][1] · [cosyPlace.ts:298](/mnt/storage/qish/game/src/zones/cosyPlace.ts:298) |
| ☐ N0037 | NPC · ayat rawak | Cantik chandelier tu | — | DINER_LINES[3][2] · [cosyPlace.ts:298](/mnt/storage/qish/game/src/zones/cosyPlace.ts:298) |
| ☐ N0038 | NPC · ayat rawak | Kenyang... tapi nak lagi | — | DINER_LINES[3][3] · [cosyPlace.ts:298](/mnt/storage/qish/game/src/zones/cosyPlace.ts:298) |
| ☐ N0039 | NPC · ayat rawak | Lilin ni wangi | — | DINER_LINES[4][1] · [cosyPlace.ts:299](/mnt/storage/qish/game/src/zones/cosyPlace.ts:299) |
| ☐ N0040 | NPC · ayat rawak | First date kita kat sini kan? | — | DINER_LINES[4][2] · [cosyPlace.ts:299](/mnt/storage/qish/game/src/zones/cosyPlace.ts:299) |
| ☐ N0041 | NPC · ayat rawak | Pelayan dia handsome | — | DINER_LINES[4][3] · [cosyPlace.ts:299](/mnt/storage/qish/game/src/zones/cosyPlace.ts:299) |
| ☐ N0042 | NPC · ayat rawak | ♪ ~ ♫ | — | cosyPlace.lines[1] · [cosyPlace.ts:379](/mnt/storage/qish/game/src/zones/cosyPlace.ts:379) |
| ☐ N0043 | NPC · ayat rawak | Request? Tak boleh. | — | cosyPlace.lines[2] · [cosyPlace.ts:379](/mnt/storage/qish/game/src/zones/cosyPlace.ts:379) |
| ☐ N0044 | NPC · ayat rawak | ♫ | — | cosyPlace.lines[3] · [cosyPlace.ts:379](/mnt/storage/qish/game/src/zones/cosyPlace.ts:379) |
| ☐ N0045 | NPC · ayat rawak | Lasagna meja 3! | — | cosyPlace.lines[1] · [cosyPlace.ts:430](/mnt/storage/qish/game/src/zones/cosyPlace.ts:430) |
| ☐ N0046 | NPC · ayat rawak | Steak medium rare! | — | cosyPlace.lines[2] · [cosyPlace.ts:430](/mnt/storage/qish/game/src/zones/cosyPlace.ts:430) |
| ☐ N0047 | NPC · ayat rawak | Garnish! GARNISH! | — | cosyPlace.lines[3] · [cosyPlace.ts:430](/mnt/storage/qish/game/src/zones/cosyPlace.ts:430) |
| ☐ N0048 | NPC · ayat rawak | Sapa curi garlic bread saya? | — | cosyPlace.lines[4] · [cosyPlace.ts:430](/mnt/storage/qish/game/src/zones/cosyPlace.ts:430) |
| ☐ N0049 | NPC · ayat rawak | Bonsoir~ | — | cosyPlace.lines[1] · [cosyPlace.ts:475](/mnt/storage/qish/game/src/zones/cosyPlace.ts:475) |
| ☐ N0050 | NPC · ayat rawak | Ada tempahan? | — | cosyPlace.lines[2] · [cosyPlace.ts:475](/mnt/storage/qish/game/src/zones/cosyPlace.ts:475) |
| ☐ N0051 | NPC · ayat rawak | Silakan, mademoiselle | — | cosyPlace.lines[3] · [cosyPlace.ts:475](/mnt/storage/qish/game/src/zones/cosyPlace.ts:475) |

<a id="qc-109"></a>

## 109. Dialog rawak NPC · lorbelProps

| QC / ID | Watak / jenis | Dialog asal | Ekspresi | Konteks / sumber |
|---|---|---|---|---|
| ☐ N0052 | NPC · ayat rawak | Best lagu ni! | — | BARK.sway[1] · [lorbelProps.ts:1579](/mnt/storage/qish/game/src/zones/lorbelProps.ts:1579) |
| ☐ N0053 | NPC · ayat rawak | Encore!! | — | BARK.sway[2] · [lorbelProps.ts:1579](/mnt/storage/qish/game/src/zones/lorbelProps.ts:1579) |
| ☐ N0054 | NPC · ayat rawak | ♪ ~ ♪ | — | BARK.sway[3] · [lorbelProps.ts:1579](/mnt/storage/qish/game/src/zones/lorbelProps.ts:1579) |
| ☐ N0055 | NPC · ayat rawak | Sedap suara dia | — | BARK.sway[4] · [lorbelProps.ts:1579](/mnt/storage/qish/game/src/zones/lorbelProps.ts:1579) |
| ☐ N0056 | NPC · ayat rawak | Request lagu sedih! | — | BARK.sway[5] · [lorbelProps.ts:1579](/mnt/storage/qish/game/src/zones/lorbelProps.ts:1579) |
| ☐ N0057 | NPC · ayat rawak | Sedapnya! | — | BARK.eat[1] · [lorbelProps.ts:1580](/mnt/storage/qish/game/src/zones/lorbelProps.ts:1580) |
| ☐ N0058 | NPC · ayat rawak | Pedas gila! | — | BARK.eat[2] · [lorbelProps.ts:1580](/mnt/storage/qish/game/src/zones/lorbelProps.ts:1580) |
| ☐ N0059 | NPC · ayat rawak | Nak tambah lagi | — | BARK.eat[3] · [lorbelProps.ts:1580](/mnt/storage/qish/game/src/zones/lorbelProps.ts:1580) |
| ☐ N0060 | NPC · ayat rawak | Nyum~ | — | BARK.eat[4] · [lorbelProps.ts:1580](/mnt/storage/qish/game/src/zones/lorbelProps.ts:1580) |
| ☐ N0061 | NPC · ayat rawak | Kenyang... | — | BARK.eat[5] · [lorbelProps.ts:1580](/mnt/storage/qish/game/src/zones/lorbelProps.ts:1580) |
| ☐ N0062 | NPC · ayat rawak | RM5 je?! | — | BARK.browse[1] · [lorbelProps.ts:1581](/mnt/storage/qish/game/src/zones/lorbelProps.ts:1581) |
| ☐ N0063 | NPC · ayat rawak | Cantik ni! | — | BARK.browse[2] · [lorbelProps.ts:1581](/mnt/storage/qish/game/src/zones/lorbelProps.ts:1581) |
| ☐ N0064 | NPC · ayat rawak | Ada saiz M? | — | BARK.browse[3] · [lorbelProps.ts:1581](/mnt/storage/qish/game/src/zones/lorbelProps.ts:1581) |
| ☐ N0065 | NPC · ayat rawak | Vintage ni weh | — | BARK.browse[4] · [lorbelProps.ts:1581](/mnt/storage/qish/game/src/zones/lorbelProps.ts:1581) |
| ☐ N0066 | NPC · ayat rawak | Muat ke ni... | — | BARK.browse[5] · [lorbelProps.ts:1581](/mnt/storage/qish/game/src/zones/lorbelProps.ts:1581) |
| ☐ N0067 | NPC · ayat rawak | Lama lagi ke? | — | BARK.queue[1] · [lorbelProps.ts:1582](/mnt/storage/qish/game/src/zones/lorbelProps.ts:1582) |
| ☐ N0068 | NPC · ayat rawak | Lapar... | — | BARK.queue[2] · [lorbelProps.ts:1582](/mnt/storage/qish/game/src/zones/lorbelProps.ts:1582) |
| ☐ N0069 | NPC · ayat rawak | Bau dia sampai sini | — | BARK.queue[3] · [lorbelProps.ts:1582](/mnt/storage/qish/game/src/zones/lorbelProps.ts:1582) |
| ☐ N0070 | NPC · ayat rawak | Jemput dik! | — | BARK.vendor[1] · [lorbelProps.ts:1583](/mnt/storage/qish/game/src/zones/lorbelProps.ts:1583) |
| ☐ N0071 | NPC · ayat rawak | Murah murah! | — | BARK.vendor[2] · [lorbelProps.ts:1583](/mnt/storage/qish/game/src/zones/lorbelProps.ts:1583) |
| ☐ N0072 | NPC · ayat rawak | Panas-panas! | — | BARK.vendor[3] · [lorbelProps.ts:1583](/mnt/storage/qish/game/src/zones/lorbelProps.ts:1583) |
| ☐ N0073 | NPC · ayat rawak | Sesak gila malam ni | — | BARK.idle[1] · [lorbelProps.ts:1584](/mnt/storage/qish/game/src/zones/lorbelProps.ts:1584) |
| ☐ N0074 | NPC · ayat rawak | Jom makan dulu | — | BARK.idle[2] · [lorbelProps.ts:1584](/mnt/storage/qish/game/src/zones/lorbelProps.ts:1584) |
| ☐ N0075 | NPC · ayat rawak | Parking penuh tadi | — | BARK.idle[3] · [lorbelProps.ts:1584](/mnt/storage/qish/game/src/zones/lorbelProps.ts:1584) |
| ☐ N0076 | NPC · ayat rawak | Cheese! | — | BARK.pose[1] · [lorbelProps.ts:1585](/mnt/storage/qish/game/src/zones/lorbelProps.ts:1585) |
| ☐ N0077 | NPC · ayat rawak | Angle kiri saya lagi cantik | — | BARK.pose[2] · [lorbelProps.ts:1585](/mnt/storage/qish/game/src/zones/lorbelProps.ts:1585) |
| ☐ N0078 | NPC · ayat rawak | Peace ✌ | — | BARK.pose[3] · [lorbelProps.ts:1585](/mnt/storage/qish/game/src/zones/lorbelProps.ts:1585) |
| ☐ N0079 | NPC · ayat rawak | Satu lagi! | — | BARK.pose[4] · [lorbelProps.ts:1585](/mnt/storage/qish/game/src/zones/lorbelProps.ts:1585) |
| ☐ N0080 | NPC · ayat rawak | Mata saya tertutup tak? | — | BARK.pose[5] · [lorbelProps.ts:1585](/mnt/storage/qish/game/src/zones/lorbelProps.ts:1585) |
| ☐ N0081 | NPC · ayat rawak | Buat muka comel! | — | BARK.pose[6] · [lorbelProps.ts:1585](/mnt/storage/qish/game/src/zones/lorbelProps.ts:1585) |
| ☐ N0082 | NPC · ayat rawak | 1, 2, 3... senyum! | — | BARK.snap[1] · [lorbelProps.ts:1586](/mnt/storage/qish/game/src/zones/lorbelProps.ts:1586) |
| ☐ N0083 | NPC · ayat rawak | Satu lagi! | — | BARK.snap[2] · [lorbelProps.ts:1586](/mnt/storage/qish/game/src/zones/lorbelProps.ts:1586) |
| ☐ N0084 | NPC · ayat rawak | Candid, candid! | — | BARK.snap[3] · [lorbelProps.ts:1586](/mnt/storage/qish/game/src/zones/lorbelProps.ts:1586) |
| ☐ N0085 | NPC · ayat rawak | Okay cantik! | — | BARK.snap[4] · [lorbelProps.ts:1586](/mnt/storage/qish/game/src/zones/lorbelProps.ts:1586) |
| ☐ N0086 | NPC · ayat rawak | Dagu turun sikit | — | BARK.snap[5] · [lorbelProps.ts:1586](/mnt/storage/qish/game/src/zones/lorbelProps.ts:1586) |
| ☐ N0087 | NPC · ayat rawak | Flash on ke off? | — | BARK.snap[6] · [lorbelProps.ts:1586](/mnt/storage/qish/game/src/zones/lorbelProps.ts:1586) |
| ☐ N0088 | NPC · ayat rawak | Sesak gila malam ni | — | BARK.walk[1] · [lorbelProps.ts:1587](/mnt/storage/qish/game/src/zones/lorbelProps.ts:1587) |
| ☐ N0089 | NPC · ayat rawak | Jom makan dulu | — | BARK.walk[2] · [lorbelProps.ts:1587](/mnt/storage/qish/game/src/zones/lorbelProps.ts:1587) |
| ☐ N0090 | NPC · ayat rawak | Parking penuh tadi | — | BARK.walk[3] · [lorbelProps.ts:1587](/mnt/storage/qish/game/src/zones/lorbelProps.ts:1587) |
| ☐ N0091 | NPC · ayat rawak | Mana dia ni... | — | BARK.walk[4] · [lorbelProps.ts:1587](/mnt/storage/qish/game/src/zones/lorbelProps.ts:1587) |
| ☐ N0092 | NPC · ayat rawak | Cari air dulu | — | BARK.walk[5] · [lorbelProps.ts:1587](/mnt/storage/qish/game/src/zones/lorbelProps.ts:1587) |
| ☐ N0093 | NPC · ayat rawak | Tumpang lalu~ | — | BARK.bump[1] · [lorbelProps.ts:1588](/mnt/storage/qish/game/src/zones/lorbelProps.ts:1588) |
| ☐ N0094 | NPC · ayat rawak | Eh sorry! | — | BARK.bump[2] · [lorbelProps.ts:1588](/mnt/storage/qish/game/src/zones/lorbelProps.ts:1588) |
| ☐ N0095 | NPC · ayat rawak | Oops, sorry dik | — | BARK.bump[3] · [lorbelProps.ts:1588](/mnt/storage/qish/game/src/zones/lorbelProps.ts:1588) |
| ☐ N0096 | NPC · ayat rawak | Jalan elok-elok~ | — | BARK.bump[4] · [lorbelProps.ts:1588](/mnt/storage/qish/game/src/zones/lorbelProps.ts:1588) |
| ☐ N0097 | NPC · ayat rawak | Sesak kan? | — | BARK.bump[5] · [lorbelProps.ts:1588](/mnt/storage/qish/game/src/zones/lorbelProps.ts:1588) |
| ☐ N0098 | NPC · ayat rawak | Silakan, silakan | — | BARK.bump[6] · [lorbelProps.ts:1588](/mnt/storage/qish/game/src/zones/lorbelProps.ts:1588) |

<a id="qc-110"></a>

## 110. Dialog rawak NPC · nyomShops

| QC / ID | Watak / jenis | Dialog asal | Ekspresi | Konteks / sumber |
|---|---|---|---|---|
| ☐ N0099 | Belon dialog | GEPUK! | — | buildShop.update · k &gt; 0.97 &amp;&amp; beat !== hit; beat % 3 === 0 · [nyomShops.ts:416](/mnt/storage/qish/game/src/zones/nyomShops.ts:416) |
| ☐ N0100 | NPC · ayat rawak | Lama lagi ke? | — | buildShop.lines[1] · [nyomShops.ts:566](/mnt/storage/qish/game/src/zones/nyomShops.ts:566) |
| ☐ N0101 | NPC · ayat rawak | Bau dia sampai sini | — | buildShop.lines[2] · [nyomShops.ts:566](/mnt/storage/qish/game/src/zones/nyomShops.ts:566) |
| ☐ N0102 | NPC · ayat rawak | Level berapa nak ambil ni | — | buildShop.lines[3] · [nyomShops.ts:566](/mnt/storage/qish/game/src/zones/nyomShops.ts:566) |
| ☐ N0103 | NPC · ayat rawak | Masak lemak cili api ni... fuh | — | buildShop.lines[1] · [nyomShops.ts:710](/mnt/storage/qish/game/src/zones/nyomShops.ts:710) |
| ☐ N0104 | NPC · ayat rawak | Nasi tambah! | — | buildShop.lines[2] · [nyomShops.ts:710](/mnt/storage/qish/game/src/zones/nyomShops.ts:710) |
| ☐ N0105 | NPC · ayat rawak | Bau asap pun dah kenyang | — | buildShop.lines[3] · [nyomShops.ts:710](/mnt/storage/qish/game/src/zones/nyomShops.ts:710) |
| ☐ N0106 | NPC · ayat rawak | Bau dia!! | — | buildShop.lines[1] · [nyomShops.ts:784](/mnt/storage/qish/game/src/zones/nyomShops.ts:784) |
| ☐ N0107 | NPC · ayat rawak | Nak satu balang | — | buildShop.lines[2] · [nyomShops.ts:784](/mnt/storage/qish/game/src/zones/nyomShops.ts:784) |
| ☐ N0108 | NPC · ayat rawak | Sabar, sabar... | — | buildShop.lines[3] · [nyomShops.ts:784](/mnt/storage/qish/game/src/zones/nyomShops.ts:784) |

<a id="qc-111"></a>

## 111. Dialog rawak NPC · putrajayaProps

| QC / ID | Watak / jenis | Dialog asal | Ekspresi | Konteks / sumber |
|---|---|---|---|---|
| ☐ N0109 | NPC · ayat rawak | Semangat! | — | JOG_BARK.jog[1] · [putrajayaProps.ts:1323](/mnt/storage/qish/game/src/zones/putrajayaProps.ts:1323) |
| ☐ N0110 | NPC · ayat rawak | Lagi satu round! | — | JOG_BARK.jog[2] · [putrajayaProps.ts:1323](/mnt/storage/qish/game/src/zones/putrajayaProps.ts:1323) |
| ☐ N0111 | NPC · ayat rawak | Fuh, penat... | — | JOG_BARK.jog[3] · [putrajayaProps.ts:1323](/mnt/storage/qish/game/src/zones/putrajayaProps.ts:1323) |
| ☐ N0112 | NPC · ayat rawak | Petang cantik ni | — | JOG_BARK.jog[4] · [putrajayaProps.ts:1323](/mnt/storage/qish/game/src/zones/putrajayaProps.ts:1323) |
| ☐ N0113 | NPC · ayat rawak | Strava dah on? | — | JOG_BARK.jog[5] · [putrajayaProps.ts:1323](/mnt/storage/qish/game/src/zones/putrajayaProps.ts:1323) |
| ☐ N0114 | NPC · ayat rawak | PB hari ni! | — | JOG_BARK.jog[6] · [putrajayaProps.ts:1323](/mnt/storage/qish/game/src/zones/putrajayaProps.ts:1323) |
| ☐ N0115 | NPC · ayat rawak | Lepas ni nasi lemak | — | JOG_BARK.jog[7] · [putrajayaProps.ts:1323](/mnt/storage/qish/game/src/zones/putrajayaProps.ts:1323) |
| ☐ N0116 | NPC · ayat rawak | Esok sambung~ | — | JOG_BARK.jog[8] · [putrajayaProps.ts:1323](/mnt/storage/qish/game/src/zones/putrajayaProps.ts:1323) |
| ☐ N0117 | NPC · ayat rawak | Jangan berhenti! | — | JOG_BARK.jog[9] · [putrajayaProps.ts:1323](/mnt/storage/qish/game/src/zones/putrajayaProps.ts:1323) |
| ☐ N0118 | NPC · ayat rawak | Jalan laju pun kira | — | JOG_BARK.walk[1] · [putrajayaProps.ts:1324](/mnt/storage/qish/game/src/zones/putrajayaProps.ts:1324) |
| ☐ N0119 | NPC · ayat rawak | Dah 8 ribu langkah! | — | JOG_BARK.walk[2] · [putrajayaProps.ts:1324](/mnt/storage/qish/game/src/zones/putrajayaProps.ts:1324) |
| ☐ N0120 | NPC · ayat rawak | Makcik jalan je | — | JOG_BARK.walk[3] · [putrajayaProps.ts:1324](/mnt/storage/qish/game/src/zones/putrajayaProps.ts:1324) |
| ☐ N0121 | NPC · ayat rawak | Hayun tangan! | — | JOG_BARK.walk[4] · [putrajayaProps.ts:1324](/mnt/storage/qish/game/src/zones/putrajayaProps.ts:1324) |
| ☐ N0122 | NPC · ayat rawak | Turun 2kg dah bulan ni | — | JOG_BARK.walk[5] · [putrajayaProps.ts:1324](/mnt/storage/qish/game/src/zones/putrajayaProps.ts:1324) |
| ☐ N0123 | NPC · ayat rawak | Ting ting! | — | JOG_BARK.bike[1] · [putrajayaProps.ts:1325](/mnt/storage/qish/game/src/zones/putrajayaProps.ts:1325) |
| ☐ N0124 | NPC · ayat rawak | Best kayuh petang | — | JOG_BARK.bike[2] · [putrajayaProps.ts:1325](/mnt/storage/qish/game/src/zones/putrajayaProps.ts:1325) |
| ☐ N0125 | NPC · ayat rawak | Angin sedap! | — | JOG_BARK.bike[3] · [putrajayaProps.ts:1325](/mnt/storage/qish/game/src/zones/putrajayaProps.ts:1325) |
| ☐ N0126 | NPC · ayat rawak | Tumpang kanan~ | — | JOG_BARK.pass[1] · [putrajayaProps.ts:1326](/mnt/storage/qish/game/src/zones/putrajayaProps.ts:1326) |
| ☐ N0127 | NPC · ayat rawak | Excuse me! | — | JOG_BARK.pass[2] · [putrajayaProps.ts:1326](/mnt/storage/qish/game/src/zones/putrajayaProps.ts:1326) |
| ☐ N0128 | NPC · ayat rawak | Tepi sikit dik~ | — | JOG_BARK.pass[3] · [putrajayaProps.ts:1326](/mnt/storage/qish/game/src/zones/putrajayaProps.ts:1326) |
| ☐ N0129 | NPC · ayat rawak | Ops, sorry! | — | JOG_BARK.pass[4] · [putrajayaProps.ts:1326](/mnt/storage/qish/game/src/zones/putrajayaProps.ts:1326) |
| ☐ N0130 | NPC · ayat rawak | Jom sama-sama! | — | JOG_BARK.buddy[1] · [putrajayaProps.ts:1327](/mnt/storage/qish/game/src/zones/putrajayaProps.ts:1327) |
| ☐ N0131 | NPC · ayat rawak | Pace awak okay! | — | JOG_BARK.buddy[2] · [putrajayaProps.ts:1327](/mnt/storage/qish/game/src/zones/putrajayaProps.ts:1327) |
| ☐ N0132 | NPC · ayat rawak | Ikut saya! | — | JOG_BARK.buddy[3] · [putrajayaProps.ts:1327](/mnt/storage/qish/game/src/zones/putrajayaProps.ts:1327) |
| ☐ N0133 | NPC · ayat rawak | Semangat dik! | — | JOG_BARK.buddy[4] · [putrajayaProps.ts:1327](/mnt/storage/qish/game/src/zones/putrajayaProps.ts:1327) |
| ☐ N0134 | NPC · ayat rawak | Lagi sikit! | — | JOG_BARK.buddy[5] · [putrajayaProps.ts:1327](/mnt/storage/qish/game/src/zones/putrajayaProps.ts:1327) |
| ☐ N0135 | NPC · ayat rawak | Awak boleh! | — | JOG_BARK.buddy[6] · [putrajayaProps.ts:1327](/mnt/storage/qish/game/src/zones/putrajayaProps.ts:1327) |
| ☐ N0136 | Belon dialog | bike | — | joggers.update · along &gt; -0.6 &amp;&amp; along &lt; (r.kind === "bike" ? 4 : 2.6) &amp;&amp; Math.abs(lat - r.side) &lt; 1.1; r.passCool &lt;= 0 · [putrajayaProps.ts:1454](/mnt/storage/qish/game/src/zones/putrajayaProps.ts:1454) |
| ☐ N0137 | Belon dialog | Ting ting! | — | joggers.update · along &gt; -0.6 &amp;&amp; along &lt; (r.kind === "bike" ? 4 : 2.6) &amp;&amp; Math.abs(lat - r.side) &lt; 1.1; r.passCool &lt;= 0; r.kind === "bike" · [putrajayaProps.ts:1454](/mnt/storage/qish/game/src/zones/putrajayaProps.ts:1454) |
| ☐ N0138 | Belon dialog | Tepi sikit~ | — | joggers.update · along &gt; -0.6 &amp;&amp; along &lt; (r.kind === "bike" ? 4 : 2.6) &amp;&amp; Math.abs(lat - r.side) &lt; 1.1; r.passCool &lt;= 0; r.kind === "bike" · [putrajayaProps.ts:1454](/mnt/storage/qish/game/src/zones/putrajayaProps.ts:1454) |

<a id="qc-112"></a>

## 112. Dialog rawak NPC · tasikProps

| QC / ID | Watak / jenis | Dialog asal | Ekspresi | Konteks / sumber |
|---|---|---|---|---|
| ☐ N0139 | Belon dialog | WOI! Keropok saya! | — | otterThief.update · phase !== lastPhase; phase === 3 · [tasikProps.ts:1108](/mnt/storage/qish/game/src/zones/tasikProps.ts:1108) |
| ☐ N0140 | Belon dialog | Dapat! | — | anglers.update · phase !== r.phase; phase === 1 · [tasikProps.ts:1224](/mnt/storage/qish/game/src/zones/tasikProps.ts:1224) |
| ☐ N0141 | Belon dialog | Haaa! Besar! | — | anglers.update · phase !== r.phase; phase === 1 · [tasikProps.ts:1224](/mnt/storage/qish/game/src/zones/tasikProps.ts:1224) |
| ☐ N0142 | Belon dialog | Rezeki! | — | anglers.update · phase !== r.phase; phase === 1 · [tasikProps.ts:1224](/mnt/storage/qish/game/src/zones/tasikProps.ts:1224) |
| ☐ N0143 | Belon dialog | Shhh! Ikan lari! | — | anglers.update · boat.riding &amp;&amp; Math.hypot(p.x - r.F.x, p.z - r.F.z) &lt; 2.6 &amp;&amp; t - r.hushed &gt; 9 · [tasikProps.ts:1238](/mnt/storage/qish/game/src/zones/tasikProps.ts:1238) |

<a id="qc-113"></a>

## 113. Dialog rawak NPC · zones

| QC / ID | Watak / jenis | Dialog asal | Ekspresi | Konteks / sumber |
|---|---|---|---|---|
| ☐ N0144 | NPC · ayat rawak | Lama lagi ke? | — | ZONES.photobooth.build.standers[8].lines[1] · [zones.ts:1322](/mnt/storage/qish/game/src/zones/zones.ts:1322) |
| ☐ N0145 | NPC · ayat rawak | Nak pose apa nanti? | — | ZONES.photobooth.build.standers[8].lines[2] · [zones.ts:1322](/mnt/storage/qish/game/src/zones/zones.ts:1322) |
| ☐ N0146 | NPC · ayat rawak | Lepas ni giliran kita! | — | ZONES.photobooth.build.standers[8].lines[3] · [zones.ts:1322](/mnt/storage/qish/game/src/zones/zones.ts:1322) |
| ☐ N0147 | NPC · ayat rawak | Frame pink ke biru? | — | ZONES.photobooth.build.standers[8].lines[4] · [zones.ts:1322](/mnt/storage/qish/game/src/zones/zones.ts:1322) |
| ☐ N0148 | NPC · ayat rawak | Comelnya diorang ni | — | ZONES.photobooth.build.standers[13].lines[1] · [zones.ts:1329](/mnt/storage/qish/game/src/zones/zones.ts:1329) |
| ☐ N0149 | NPC · ayat rawak | Strip ni dari mana? | — | ZONES.photobooth.build.standers[13].lines[2] · [zones.ts:1329](/mnt/storage/qish/game/src/zones/zones.ts:1329) |
| ☐ N0150 | NPC · ayat rawak | Siapa couple ni? | — | ZONES.photobooth.build.standers[13].lines[3] · [zones.ts:1329](/mnt/storage/qish/game/src/zones/zones.ts:1329) |
| ☐ N0151 | NPC · ayat rawak | Tengok muka awak ni haha | — | ZONES.photobooth.build.standers[15].lines[1] · [zones.ts:1332](/mnt/storage/qish/game/src/zones/zones.ts:1332) |
| ☐ N0152 | NPC · ayat rawak | Simpan dalam dompet | — | ZONES.photobooth.build.standers[15].lines[2] · [zones.ts:1332](/mnt/storage/qish/game/src/zones/zones.ts:1332) |
| ☐ N0153 | NPC · ayat rawak | Cetak dari phone, RM2! | — | ZONES.photobooth.build.standers[17].lines[1] · [zones.ts:1334](/mnt/storage/qish/game/src/zones/zones.ts:1334) |
| ☐ N0154 | NPC · ayat rawak | Siap seminit! | — | ZONES.photobooth.build.standers[17].lines[2] · [zones.ts:1334](/mnt/storage/qish/game/src/zones/zones.ts:1334) |
| ☐ N0155 | NPC · ayat rawak | Nak bingkai sekali? | — | ZONES.photobooth.build.standers[17].lines[3] · [zones.ts:1334](/mnt/storage/qish/game/src/zones/zones.ts:1334) |
| ☐ N0156 | NPC · ayat rawak | Macam ni okay? | — | ZONES.photobooth.build.standers[18].lines[1] · [zones.ts:1336](/mnt/storage/qish/game/src/zones/zones.ts:1336) |
| ☐ N0157 | NPC · ayat rawak | Rambut saya okay tak? | — | ZONES.photobooth.build.standers[18].lines[2] · [zones.ts:1336](/mnt/storage/qish/game/src/zones/zones.ts:1336) |
| ☐ N0158 | NPC · ayat rawak | Angin! Bagi angin! | — | ZONES.photobooth.build.standers[18].lines[3] · [zones.ts:1336](/mnt/storage/qish/game/src/zones/zones.ts:1336) |
| ☐ N0159 | NPC · ayat rawak | Cantik! Tahan! | — | ZONES.photobooth.build.standers[19].lines[1] · [zones.ts:1337](/mnt/storage/qish/game/src/zones/zones.ts:1337) |
| ☐ N0160 | NPC · ayat rawak | Dagu sikit... YA! | — | ZONES.photobooth.build.standers[19].lines[2] · [zones.ts:1337](/mnt/storage/qish/game/src/zones/zones.ts:1337) |
| ☐ N0161 | NPC · ayat rawak | Lagi satu, lagi satu! | — | ZONES.photobooth.build.standers[19].lines[3] · [zones.ts:1337](/mnt/storage/qish/game/src/zones/zones.ts:1337) |
| ☐ N0162 | NPC · ayat rawak | Jom photobooth! | — | ZONES.photobooth.build.crowd.walk[1] · [zones.ts:1348](/mnt/storage/qish/game/src/zones/zones.ts:1348) |
| ☐ N0163 | NPC · ayat rawak | Strip saya terbang! | — | ZONES.photobooth.build.crowd.walk[2] · [zones.ts:1348](/mnt/storage/qish/game/src/zones/zones.ts:1348) |
| ☐ N0164 | NPC · ayat rawak | Booth mana paling cantik? | — | ZONES.photobooth.build.crowd.walk[3] · [zones.ts:1348](/mnt/storage/qish/game/src/zones/zones.ts:1348) |
| ☐ N0165 | NPC · ayat rawak | Flash dia terang gila | — | ZONES.photobooth.build.crowd.walk[4] · [zones.ts:1348](/mnt/storage/qish/game/src/zones/zones.ts:1348) |
| ☐ N0166 | NPC · ayat rawak | Nak frame apa nanti? | — | ZONES.photobooth.build.crowd.walk[5] · [zones.ts:1348](/mnt/storage/qish/game/src/zones/zones.ts:1348) |
| ☐ N0167 | NPC · ayat rawak | Tunggu gambar kering dulu | — | ZONES.photobooth.build.crowd.walk[6] · [zones.ts:1348](/mnt/storage/qish/game/src/zones/zones.ts:1348) |
| ☐ N0168 | NPC · ayat rawak | Senyum sikit~ | — | ZONES.photobooth.build.crowd.walk[7] · [zones.ts:1348](/mnt/storage/qish/game/src/zones/zones.ts:1348) |
| ☐ N0169 | NPC · ayat rawak | Satu lagi booth! | — | ZONES.photobooth.build.crowd.walk[8] · [zones.ts:1348](/mnt/storage/qish/game/src/zones/zones.ts:1348) |
| ☐ N0170 | NPC · ayat rawak | Pagi-pagi dah jogging! | — | ZONES.dusun.build.jog[1] · [zones.ts:1672](/mnt/storage/qish/game/src/zones/zones.ts:1672) |
| ☐ N0171 | NPC · ayat rawak | Satu round tasik! | — | ZONES.dusun.build.jog[2] · [zones.ts:1672](/mnt/storage/qish/game/src/zones/zones.ts:1672) |
| ☐ N0172 | NPC · ayat rawak | Fuh, penat... | — | ZONES.dusun.build.jog[3] · [zones.ts:1672](/mnt/storage/qish/game/src/zones/zones.ts:1672) |
| ☐ N0173 | NPC · ayat rawak | Lepas ni roti canai | — | ZONES.dusun.build.jog[4] · [zones.ts:1672](/mnt/storage/qish/game/src/zones/zones.ts:1672) |
| ☐ N0174 | NPC · ayat rawak | Strava dah on? | — | ZONES.dusun.build.jog[5] · [zones.ts:1672](/mnt/storage/qish/game/src/zones/zones.ts:1672) |
| ☐ N0175 | NPC · ayat rawak | Jalan pagi, sihat! | — | ZONES.dusun.build.walk[1] · [zones.ts:1673](/mnt/storage/qish/game/src/zones/zones.ts:1673) |
| ☐ N0176 | NPC · ayat rawak | Tengok lily kejap | — | ZONES.dusun.build.walk[2] · [zones.ts:1673](/mnt/storage/qish/game/src/zones/zones.ts:1673) |
| ☐ N0177 | NPC · ayat rawak | Makcik jalan je | — | ZONES.dusun.build.walk[3] · [zones.ts:1673](/mnt/storage/qish/game/src/zones/zones.ts:1673) |
| ☐ N0178 | NPC · ayat rawak | Hayun tangan! | — | ZONES.dusun.build.walk[4] · [zones.ts:1673](/mnt/storage/qish/game/src/zones/zones.ts:1673) |
| ☐ N0179 | NPC · ayat rawak | Udara pagi sedap | — | ZONES.dusun.build.walk[5] · [zones.ts:1673](/mnt/storage/qish/game/src/zones/zones.ts:1673) |
| ☐ N0180 | NPC · ayat rawak | Ting ting! | — | ZONES.dusun.build.bike[1] · [zones.ts:1674](/mnt/storage/qish/game/src/zones/zones.ts:1674) |
| ☐ N0181 | NPC · ayat rawak | Angin pagi sedap! | — | ZONES.dusun.build.bike[2] · [zones.ts:1674](/mnt/storage/qish/game/src/zones/zones.ts:1674) |
| ☐ N0182 | NPC · ayat rawak | Tumpang lalu~ | — | ZONES.dusun.build.pass[1] · [zones.ts:1675](/mnt/storage/qish/game/src/zones/zones.ts:1675) |
| ☐ N0183 | NPC · ayat rawak | Excuse me! | — | ZONES.dusun.build.pass[2] · [zones.ts:1675](/mnt/storage/qish/game/src/zones/zones.ts:1675) |
| ☐ N0184 | NPC · ayat rawak | Tepi sikit dik~ | — | ZONES.dusun.build.pass[3] · [zones.ts:1675](/mnt/storage/qish/game/src/zones/zones.ts:1675) |
| ☐ N0185 | NPC · ayat rawak | Ops, sorry! | — | ZONES.dusun.build.pass[4] · [zones.ts:1675](/mnt/storage/qish/game/src/zones/zones.ts:1675) |
| ☐ N0186 | NPC · ayat rawak | Jom sama-sama! | — | ZONES.dusun.build.buddy[1] · [zones.ts:1676](/mnt/storage/qish/game/src/zones/zones.ts:1676) |
| ☐ N0187 | NPC · ayat rawak | Semangat dik! | — | ZONES.dusun.build.buddy[2] · [zones.ts:1676](/mnt/storage/qish/game/src/zones/zones.ts:1676) |
| ☐ N0188 | NPC · ayat rawak | Pace awak okay! | — | ZONES.dusun.build.buddy[3] · [zones.ts:1676](/mnt/storage/qish/game/src/zones/zones.ts:1676) |
| ☐ N0189 | Belon dialog | NYOM NYOM!! | — | ZONES.cosyplace.build · !beaten; arrived() &amp;&amp; !wasArrived · [zones.ts:2003](/mnt/storage/qish/game/src/zones/zones.ts:2003) |
| ☐ N0190 | Belon dialog | *sniff sniff* | — | ZONES.cosyplace.build · !beaten; !arrived(); t &gt; nextWord · [zones.ts:2014](/mnt/storage/qish/game/src/zones/zones.ts:2014) |
| ☐ N0191 | Belon dialog | nyom | — | ZONES.cosyplace.build · !beaten; bukan !arrived(); bukan run; t &gt; nextWord · [zones.ts:2046](/mnt/storage/qish/game/src/zones/zones.ts:2046) |
| ☐ N0192 | Belon dialog | NYOM NYOM | — | ZONES.cosyplace.build · !beaten; bukan !arrived(); bukan run; t &gt; nextWord · [zones.ts:2046](/mnt/storage/qish/game/src/zones/zones.ts:2046) |
| ☐ N0193 | Belon dialog | nyom~ | — | ZONES.cosyplace.build · !beaten; bukan !arrived(); bukan run; t &gt; nextWord · [zones.ts:2046](/mnt/storage/qish/game/src/zones/zones.ts:2046) |
| ☐ N0194 | Belon dialog | *kunyah* | — | ZONES.cosyplace.build · !beaten; bukan !arrived(); bukan run; t &gt; nextWord · [zones.ts:2046](/mnt/storage/qish/game/src/zones/zones.ts:2046) |
| ☐ N0195 | Belon dialog | sedap... | — | ZONES.cosyplace.build · !beaten; bukan !arrived(); bukan run; t &gt; nextWord · [zones.ts:2046](/mnt/storage/qish/game/src/zones/zones.ts:2046) |
| ☐ N0196 | Belon dialog | !! NYOM! | — | ZONES.cosyplace.build · !beaten; bukan !arrived(); bukan run; near &amp;&amp; fled &lt; N &amp;&amp; !dialogOpen() · [zones.ts:2050](/mnt/storage/qish/game/src/zones/zones.ts:2050) |
| ☐ N0197 | NPC · ayat rawak | RM5 RM5! | — | ZONES.galeri.build.lines[1] · [zones.ts:2414](/mnt/storage/qish/game/src/zones/zones.ts:2414) |
| ☐ N0198 | NPC · ayat rawak | Pilih pilih! | — | ZONES.galeri.build.lines[2] · [zones.ts:2414](/mnt/storage/qish/game/src/zones/zones.ts:2414) |
| ☐ N0199 | NPC · ayat rawak | Bundle baru buka! | — | ZONES.galeri.build.lines[3] · [zones.ts:2414](/mnt/storage/qish/game/src/zones/zones.ts:2414) |
| ☐ N0200 | NPC · ayat rawak | Murah ni dik! | — | ZONES.galeri.build.lines[4] · [zones.ts:2414](/mnt/storage/qish/game/src/zones/zones.ts:2414) |
| ☐ N0201 | NPC · ayat rawak | Satay! Satay! | — | ZONES.galeri.build.VENDOR_LINES.satay[1] · [zones.ts:2426](/mnt/storage/qish/game/src/zones/zones.ts:2426) |
| ☐ N0202 | NPC · ayat rawak | Ayam ke daging? | — | ZONES.galeri.build.VENDOR_LINES.satay[2] · [zones.ts:2426](/mnt/storage/qish/game/src/zones/zones.ts:2426) |
| ☐ N0203 | NPC · ayat rawak | Panas-panas! | — | ZONES.galeri.build.VENDOR_LINES.satay[3] · [zones.ts:2426](/mnt/storage/qish/game/src/zones/zones.ts:2426) |
| ☐ N0204 | NPC · ayat rawak | Daging salai dik! | — | ZONES.galeri.build.VENDOR_LINES.salai[1] · [zones.ts:2427](/mnt/storage/qish/game/src/zones/zones.ts:2427) |
| ☐ N0205 | NPC · ayat rawak | Pedas tak takut? | — | ZONES.galeri.build.VENDOR_LINES.salai[2] · [zones.ts:2427](/mnt/storage/qish/game/src/zones/zones.ts:2427) |
| ☐ N0206 | NPC · ayat rawak | Pilih sendiri, timbang! | — | ZONES.galeri.build.VENDOR_LINES.malatang[1] · [zones.ts:2428](/mnt/storage/qish/game/src/zones/zones.ts:2428) |
| ☐ N0207 | NPC · ayat rawak | Malatang~ | — | ZONES.galeri.build.VENDOR_LINES.malatang[2] · [zones.ts:2428](/mnt/storage/qish/game/src/zones/zones.ts:2428) |
| ☐ N0208 | NPC · ayat rawak | Air balang sejuk! | — | ZONES.galeri.build.VENDOR_LINES.balang[1] · [zones.ts:2429](/mnt/storage/qish/game/src/zones/zones.ts:2429) |
| ☐ N0209 | NPC · ayat rawak | Bandung ada! | — | ZONES.galeri.build.VENDOR_LINES.balang[2] · [zones.ts:2429](/mnt/storage/qish/game/src/zones/zones.ts:2429) |
| ☐ N0210 | NPC · ayat rawak | Sorry, habis! | — | ZONES.galeri.build.VENDOR_LINES.mango[1] · [zones.ts:2430](/mnt/storage/qish/game/src/zones/zones.ts:2430) |
| ☐ N0211 | NPC · ayat rawak | Esok datang awal ye | — | ZONES.galeri.build.VENDOR_LINES.mango[2] · [zones.ts:2430](/mnt/storage/qish/game/src/zones/zones.ts:2430) |
| ☐ N0212 | NPC · ayat rawak | Burger special! | — | ZONES.galeri.build.VENDOR_LINES.burger[1] · [zones.ts:2431](/mnt/storage/qish/game/src/zones/zones.ts:2431) |
| ☐ N0213 | NPC · ayat rawak | Telur double! | — | ZONES.galeri.build.VENDOR_LINES.burger[2] · [zones.ts:2431](/mnt/storage/qish/game/src/zones/zones.ts:2431) |
| ☐ N0214 | NPC · ayat rawak | Level berapa dik? | — | ZONES.galeri.build.VENDOR_LINES.ramen[1] · [zones.ts:2432](/mnt/storage/qish/game/src/zones/zones.ts:2432) |
| ☐ N0215 | NPC · ayat rawak | Pedas gila ni! | — | ZONES.galeri.build.VENDOR_LINES.ramen[2] · [zones.ts:2432](/mnt/storage/qish/game/src/zones/zones.ts:2432) |
| ☐ N0216 | NPC · ayat rawak | Takoyaki panas! | — | ZONES.galeri.build.VENDOR_LINES.takoyaki[1] · [zones.ts:2433](/mnt/storage/qish/game/src/zones/zones.ts:2433) |
| ☐ N0217 | NPC · ayat rawak | Mayo lebih? | — | ZONES.galeri.build.VENDOR_LINES.takoyaki[2] · [zones.ts:2433](/mnt/storage/qish/game/src/zones/zones.ts:2433) |
| ☐ N0218 | NPC · ayat rawak | Siapa leading? | — | ZONES.sepang.build.standers[6].lines[1] · [zones.ts:3050](/mnt/storage/qish/game/src/zones/zones.ts:3050) |
| ☐ N0219 | NPC · ayat rawak | BOLAT GP laju gila | — | ZONES.sepang.build.standers[6].lines[2] · [zones.ts:3050](/mnt/storage/qish/game/src/zones/zones.ts:3050) |
| ☐ N0220 | NPC · ayat rawak | Safety car lagi?! | — | ZONES.sepang.build.standers[6].lines[3] · [zones.ts:3050](/mnt/storage/qish/game/src/zones/zones.ts:3050) |
| ☐ N0221 | NPC · ayat rawak | PIT! PIT! | — | ZONES.sepang.build.standers[7].lines[1] · [zones.ts:3051](/mnt/storage/qish/game/src/zones/zones.ts:3051) |
| ☐ N0222 | NPC · ayat rawak | Ni lap ke berapa? | — | ZONES.sepang.build.standers[7].lines[2] · [zones.ts:3051](/mnt/storage/qish/game/src/zones/zones.ts:3051) |
| ☐ N0223 | NPC · ayat rawak | Overtake! OVERTAKE! | — | ZONES.sepang.build.standers[7].lines[3] · [zones.ts:3051](/mnt/storage/qish/game/src/zones/zones.ts:3051) |
| ☐ N0224 | NPC · ayat rawak | Baju hujan! RM5! | — | ZONES.sepang.build.standers[14].lines[1] · [zones.ts:3058](/mnt/storage/qish/game/src/zones/zones.ts:3058) |
| ☐ N0225 | NPC · ayat rawak | Nak hujan dah ni kak! | — | ZONES.sepang.build.standers[14].lines[2] · [zones.ts:3058](/mnt/storage/qish/game/src/zones/zones.ts:3058) |
| ☐ N0226 | NPC · ayat rawak | Payung pun ada! | — | ZONES.sepang.build.standers[14].lines[3] · [zones.ts:3058](/mnt/storage/qish/game/src/zones/zones.ts:3058) |
| ☐ N0227 | NPC · ayat rawak | Kiri sikit! Kiri! | — | ZONES.sepang.build.standers[16].lines[1] · [zones.ts:3060](/mnt/storage/qish/game/src/zones/zones.ts:3060) |
| ☐ N0228 | NPC · ayat rawak | Penuh dah depan! | — | ZONES.sepang.build.standers[16].lines[2] · [zones.ts:3060](/mnt/storage/qish/game/src/zones/zones.ts:3060) |
| ☐ N0229 | NPC · ayat rawak | Parking belakang bang! | — | ZONES.sepang.build.standers[16].lines[3] · [zones.ts:3060](/mnt/storage/qish/game/src/zones/zones.ts:3060) |
| ☐ N0230 | NPC · ayat rawak | NEEEOOWWW! | — | ZONES.sepang.build.standers[17].lines[1] · [zones.ts:3066](/mnt/storage/qish/game/src/zones/zones.ts:3066) |
| ☐ N0231 | NPC · ayat rawak | Laju gila! | — | ZONES.sepang.build.standers[17].lines[2] · [zones.ts:3066](/mnt/storage/qish/game/src/zones/zones.ts:3066) |
| ☐ N0232 | NPC · ayat rawak | Hujan dah ni | — | ZONES.sepang.build.standers[17].lines[3] · [zones.ts:3066](/mnt/storage/qish/game/src/zones/zones.ts:3066) |
| ☐ N0233 | NPC · ayat rawak | Basah dah track | — | ZONES.sepang.build.standers[17].lines[4] · [zones.ts:3066](/mnt/storage/qish/game/src/zones/zones.ts:3066) |
| ☐ N0234 | NPC · ayat rawak | Siapa leading? | — | ZONES.sepang.build.standers[17].lines[5] · [zones.ts:3066](/mnt/storage/qish/game/src/zones/zones.ts:3066) |
| ☐ N0235 | NPC · ayat rawak | Pit stop dua saat! | — | ZONES.sepang.build.standers[17].lines[6] · [zones.ts:3066](/mnt/storage/qish/game/src/zones/zones.ts:3066) |
| ☐ N0236 | NPC · ayat rawak | Nak hujan dah ni | — | ZONES.sepang.build.crowd.walk[1] · [zones.ts:3075](/mnt/storage/qish/game/src/zones/zones.ts:3075) |
| ☐ N0237 | NPC · ayat rawak | Grandstand mana? | — | ZONES.sepang.build.crowd.walk[2] · [zones.ts:3075](/mnt/storage/qish/game/src/zones/zones.ts:3075) |
| ☐ N0238 | NPC · ayat rawak | Jom tengok pit stop | — | ZONES.sepang.build.crowd.walk[3] · [zones.ts:3075](/mnt/storage/qish/game/src/zones/zones.ts:3075) |
| ☐ N0239 | NPC · ayat rawak | Bawak payung tak? | — | ZONES.sepang.build.crowd.walk[4] · [zones.ts:3075](/mnt/storage/qish/game/src/zones/zones.ts:3075) |
| ☐ N0240 | NPC · ayat rawak | Laju gila tadi! | — | ZONES.sepang.build.crowd.walk[5] · [zones.ts:3075](/mnt/storage/qish/game/src/zones/zones.ts:3075) |
| ☐ N0241 | NPC · ayat rawak | Mana parking kita tadi? | — | ZONES.sepang.build.crowd.walk[6] · [zones.ts:3075](/mnt/storage/qish/game/src/zones/zones.ts:3075) |

## Nota QC yang jelas daripada sumber

- Surat sebenar masih placeholder: `[Surat sebenar dari Faris akan diletak di sini.]`.
- Panggilan diseragamkan kepada `saya` / `awak`, dan nama boss finale kepada **Raja Nonchalant**, mengikut QC Faris (26 Oktober 2026).
- Dialog Babah sebelum ending menyebut `kek mango`, dan gerai Lorbel menyebut tempahan Faris. Semak sama ada petunjuk ini terlalu awal mendedahkan surprise.
- `gymBurn` masih wujud dalam skrip tetapi tiada pemanggil ditemui semasa inventori. Ayatnya tetap disertakan untuk QC kod.

Jumlah: **1313 entri QC** (termasuk aksi, pilihan, metadata telefon dan teks sokongan). Pecahan ID: `D`: 809 · `A`: 4 · `T`: 54 · `P`: 9 · `B`: 17 · `M`: 179 · `N`: 241.


## QC susulan — 27 Oktober 2026

Prompt meminta kad fizikal dibuang daripada reveal kad 1–8, termasuk mode rakaman.
Kad 9 masih mempunyai “Pusing belakang!”, tetapi arahan serahan kepada Faris dibuang.
Label aksi pada footer dialog, phone, senaman, intro boss, peta, TV, reveal dan surat
mengikut input aktif. Ayat tutorial “Tekan A” juga bertukar terus apabila input berubah.
Keyboard: Space / Esc. Touch: A / B. Controller standard: butang bawah / kanan,
dengan simbol Xbox, PlayStation atau susunan Switch yang sepadan.

Audit pagination terkini: 234 teks NPC; desktop 3 halaman, phone 5, landscape 3,
dan 320×568 sebanyak 6 halaman. Semua ayat panjang dipelihara tanpa clipping.
Bukti: `art/style/dialogue/verification.json`. Fail ini ialah inventori/snapshot;
nota terkini ini mengatasi wording A statik dalam baris sejarah yang belum dijana semula.
