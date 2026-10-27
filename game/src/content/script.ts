import type { Line } from "../ui/dialog";
import type { BossId } from "./bosses";

// All dialogue in one place so Faris can read and tweak it easily.
// Tone: Melayu santai + English, roast sepanjang jalan, sweet di hujung.
// Rule: only use real facts from GAME_VISION.md section 10; never invent memories.

/** The dream that opens the game: Faris and Bolat on the sofa. Each step is a line or a stage action. */
export type DreamStep = Line | { act: "pinch" | "sulk" | "leave" | "cry" };

export const DREAM: DreamStep[] = [
  { who: "qish", text: "Sayang, nanti kita pergi photobooth lagi nak?", expression: "happy" },
  { who: "farisbiasa", text: "Boleh je.", expression: "happy" },
  { who: "qish", text: "Yeay! Kali ni kita buat pose comel-comel tau. Lepas tu makan malatang!", expression: "excited" },
  { who: "farisbiasa", text: "Hmm.", expression: "deadpan" },
  { act: "pinch" },
  { who: "qish", text: "ADUH! Kenapa cubit perut saya??", expression: "surprised" },
  { who: "farisbiasa", text: "Gebu.", expression: "smug" },
  { who: "qish", text: "...Awak cakap saya gemuk ke?", expression: "worried" },
  { who: "farisbiasa", text: "Alamak.", expression: "surprised" },
  { act: "sulk" },
  { who: "qish", text: "Hmph. Saya merajuk.", expression: "pout" },
  { who: "narrator", text: "..." },
  { who: "qish", text: "Saya. Merajuk. Ni. Pujuk la!", expression: "angry" },
  { who: "farisbiasa", text: "k bye", expression: "deadpan" },
  { act: "leave" },
  { who: "qish", text: "...Sayang?", expression: "sad" },
  { act: "cry" },
  { who: "qish", text: "SAYANG!!", expression: "cry" },
];

/** Waking up in the bedroom right after the dream. */
export const WAKE: Line[] = [
  { who: "qish", text: "!!", expression: "surprised" },
  { who: "qish", text: "...Mimpi je rupanya.", expression: "sad" },
  { who: "qish", text: "Eh, bantal saya basah. Saya menangis betul-betul ke tadi?", expression: "sad" },
  { who: "qish", text: "Kejap. Bilik ni rasa lain macam. Macam ada benda hilang...", expression: "thinking" },
  { who: "narrator", text: "Jalan-jalan dalam bilik dan cari apa yang hilang. Tekan A dekat tanda ? untuk tengok." },
];

/** Qish's phone on the desk: the last chat with Faris. */
export const PHONE = {
  status: "Selasa, 3 Nov · 7:42",
  contact: "Faris 🦥",
  lastSeen: "last seen semalam 11:58 PM",
  history: [
    { from: "qish", text: "Hmph.", time: "11:52 PM" },
    { from: "qish", text: "Saya merajuk ni.", time: "11:53 PM" },
    { from: "faris", text: "k bye", time: "11:58 PM" },
  ],
  /** Typed and sent while the phone is open; it never gets a second tick. */
  send: "sayang kat mana? 🥺",
  /** Waking up again after the island: read at last, and Faris types back. */
  wake: {
    status: "Selasa, 3 Nov · 6:46 PM",
    time: "6:46 PM",
    incoming: ["sayang", "dah bangun ke belum", "keluar kejap", "saya tunggu kat luar"],
  },
} as const;

export const CLUE_TALK = {
  bowat: [
    { who: "qish", text: "Bowat? BOWAT?!", expression: "surprised" },
    { who: "qish", text: "Dia selalu tidur sebelah saya. Tinggal lekuk kat bantal je.", expression: "sad" },
    { who: "narrator", text: "Ada bau kentut lagi. Dia tak pergi jauh." },
  ],
  bowatAfter: [{ who: "qish", text: "Bantal Bowat kosong. Dia lagi suka ikut saya ke mana-mana sekarang.", expression: "happy" }],
  strips: [
    { who: "qish", text: "Gambar photobooth kita... semua hilang?!", expression: "surprised" },
    { who: "qish", text: "Sepuluh-sepuluh. Tinggal pin je.", expression: "sad" },
    { who: "qish", text: "Siapa yang sanggup curi kenangan orang ni??", expression: "angry" },
  ],
  stripsStill: [{ who: "qish", text: "Tinggal pin je. Mana la gambar-gambar tu pergi...", expression: "sad" }],
  stripsBack: [
    { who: "qish", text: "Semua strip dah balik. Cukup sepuluh.", expression: "happy" },
    { who: "narrator", text: "Kamera besar tu pos balik elok-elok, siap susun ikut tarikh." },
  ],
  faris: [
    { who: "qish", text: "Last seen semalam. Mesej saya satu tick je.", expression: "sad" },
    { who: "qish", text: "\"k bye\" je dia cakap...?", expression: "sad" },
    { who: "qish", text: "Kejap. Tu betul-betul jadi ke, atau mimpi?", expression: "thinking" },
  ],
  farisStill: [{ who: "qish", text: "Masih satu tick. Faris ni...", expression: "pout" }],
  farisFound: [{ who: "qish", text: "\"keluar kejap\". Dia memang malas taip panjang. Tapi kali ni berbaloi.", expression: "love" }],
} satisfies Record<string, Line[]>;

export const ALL_CLUES: Line[] = [
  { who: "qish", text: "Bowat hilang. Gambar kita hilang. Faris pun hilang.", expression: "worried" },
  { who: "qish", text: "Okay. Saya takkan duduk diam. Saya pergi cari semua!", expression: "excited" },
  { who: "narrator", text: "Pintu bilik kat sebelah kanan." },
];

/** After beating Raja Nonchalant: the island was a dream too. She wakes up again, in the evening. */
export const WAKE_AGAIN: Line[] = [
  { who: "qish", text: "...!", expression: "surprised" },
  { who: "qish", text: "Dah petang?! Saya tidur sepanjang hari ke??", expression: "surprised" },
  { who: "qish", text: "Pulau tu, Raja Nonchalant, kad-kad tu... semua mimpi je ke?", expression: "thinking" },
  { who: "qish", text: "...", expression: "sad" },
  { who: "qish", text: "Faris still takde. Bowat pun takde.", expression: "sad" },
  { who: "narrator", text: "Bilik ni masih sunyi. Tengok sekeliling dulu." },
];

export const WAKE_TALK = {
  bowat: [
    { who: "qish", text: "Bantal Bowat masih kosong...", expression: "sad" },
    { who: "qish", text: "Awak pergi mana, Bowat...", expression: "cry" },
  ],
  bowatAgain: [{ who: "qish", text: "Bowat masih takde...", expression: "sad" }],
  strips: [
    { who: "qish", text: "Eh?", expression: "surprised" },
    { who: "qish", text: "Gambar photobooth kita... semua dah ada balik!", expression: "excited" },
    { who: "qish", text: "Cukup sepuluh. Siapa yang gantung ni?", expression: "thinking" },
  ],
  stripsAgain: [{ who: "qish", text: "Sepuluh-sepuluh ada. Macam tak pernah hilang.", expression: "happy" }],
  faris: [
    { who: "qish", text: "\"keluar kejap\"...?", expression: "thinking" },
    { who: "qish", text: "Dia tunggu kat luar??", expression: "surprised" },
  ],
  farisAgain: [{ who: "qish", text: "\"saya tunggu kat luar\". Okay okay!", expression: "excited" }],
} satisfies Record<string, Line[]>;

export const WAKE_ALL: Line[] = [
  { who: "qish", text: "Bowat takde. Tapi gambar kita dah balik. Dan Faris... tunggu kat luar.", expression: "happy" },
  { who: "qish", text: "Okay. Jom keluar!", expression: "excited" },
];

/** Stepping out of the house to find the party already set up. */
export const PARTY_ARRIVE: Line[] = [
  { who: "qish", text: "Eh...?!", expression: "surprised" },
  { who: "qish", text: "Belon? Kek? ...Semua orang?", expression: "surprised" },
  { who: "narrator", text: "Semua orang tengah tunggu awak." },
];

export const PARTY_WAITING: Line[] = [
  { who: "qish", text: "Faris suruh keluar je, bukan pergi jauh. Semua tengah tunggu kat padang tepi rumah." },
];

export const PARTY_AGAIN: Line = { who: "farisbiasa", text: "Nak sambut sekali lagi?", expression: "happy" };
export const PARTY_SLOTH: Line[] = [{ who: "slothfaris", text: "Party paling best tahun ni. Bowat dah kentut tiga kali.", expression: "laugh" }];

export const doorNotYet = (found: number): Line[] => [
  { who: "qish", text: `Kejap. Ada benda tak kena dalam bilik ni... (${found}/3)`, expression: "thinking" },
  { who: "narrator", text: "Cari semua tanda ? dulu." },
];

export const CONSOLE_BEFORE: Line[] = [
  { who: "qish", text: "Konsol game. Teringat main Roblox dengan GTA dengan Faris.", expression: "happy" },
  { who: "qish", text: "Tapi Player 2 takde hari ni...", expression: "sad" },
];
export const CONSOLE_ASK: Line = { who: "qish", text: "Nak lawan boss mana lagi?", expression: "smug" };

/** First time back on the island after the ending. */
export const REPLAY_HINT: Line[] = [
  { who: "narrator", text: "Semua boss dah boleh dilawan semula!" },
  { who: "narrator", text: "Jumpa dia orang kat zon masing-masing, atau guna konsol game dalam bilik Qish." },
];

export const replayAsk = (name: string): Line => ({ who: "qish", text: `Lawan ${name} sekali lagi?`, expression: "smug" });
export const replayWin = (name: string): Line[] => [{ who: "narrator", text: `Menang lagi lawan ${name}! Kad dia dah lama ada dalam koleksi awak.` }];

export const ROAD_CLOSED: Line[] = [
  { who: "narrator", text: "Jalan ke Litar Sepang ditutup. Ada papan: \"JALAN DITUTUP. Raja Nonchalant sedang malas.\"" },
  { who: "qish", text: "Raja Nonchalant? Siapa pulak tu...", expression: "thinking" },
  { who: "narrator", text: "Ikut jalan kampung ke Bukit Bintang dulu." },
];

/** First steps into Bukit Bintang, down from the north with the skyline behind (draft). */
export const BB_ARRIVE: Line[] = [
  { who: "narrator", text: "Qish naik tangga stesen MRT. Bunyi bandar terus menyerbu." },
  { who: "qish", text: "Bukit Bintang! Skrin besar, monorel, scramble...", expression: "excited" },
  { who: "orang", text: "LARIII!! BUSUK!!" },
  { who: "qish", text: "...Eh? Kenapa semua orang lari?", expression: "surprised" },
  { who: "qish", text: "UHUK! BAU APA NI?!", expression: "angry" },
  { who: "narrator", text: "Awan kentut hijau bersepah satu Bukit Bintang. Kereta berhenti. Orang tutup hidung, lari tak tentu arah." },
  { who: "qish", text: "Ni confirm Bowat. Bau dia saya kenal.", expression: "smug" },
  { who: "qish", text: "Kena cari pewangi. Kedai 24 jam tu mesti ada.", expression: "thinking" },
  { who: "narrator", text: "Kedai 24 jam betul-betul sebelah stesen MRT ni (tanda \"!\")." },
];

/** Buying the air freshener (draft). */
export const BB_SPRAY: Line[] = [
  { who: "kakkedai", text: "Pewangi? Adik ni orang ke-200 tanya hari ni." },
  { who: "kakkedai", text: "Tinggal satu je. Perisa... Bunga Lily." },
  { who: "qish", text: "Bunga favourite saya! Ambil!", expression: "excited" },
  { who: "kakkedai", text: "Tadi ada lelaki rambut kerinting datang, dah bayarkan untuk 'perempuan comel yang akan cari pewangi'. Free." },
  { who: "qish", text: "...Siapa dia ni sebenarnya.", expression: "thinking" },
  { who: "narrator", text: "Dapat Pewangi Bunga Lily! Jalan masuk dalam awan kentut untuk sembur." },
];

/** Walking into a cloud before having the spray. */
export const CLOUD_NO_SPRAY: Line[] = [
  { who: "qish", text: "UHUK UHUK! Tak boleh, busuk gila!", expression: "angry" },
  { who: "narrator", text: "Kena ada pewangi dulu. Cuba kedai 24 jam sebelah stesen MRT Labu Lanjut." },
];

/** The family sleeping rough by the shuttered shop (draft; Faris to check the tone). */
export const BB_FAMILY: Line[] = [
  { who: "narrator", text: "Satu keluarga duduk atas kotak, tepi kedai yang dah tutup. Budak kecil tu tengok kedai shawarma." },
  { who: "qish", text: "Pakcik, makcik, dah makan?", expression: "worried" },
  { who: "pakcik", text: "Belum lagi, adik. Tak apa." },
  { who: "qish", text: "Jap ye.", expression: "happy" },
  { who: "narrator", text: "Qish pergi ke kedai shawarma dan beli tiga. Abang Shawarma bagi diskaun tanpa diminta." },
  { who: "pakcik", text: "Terima kasih, adik. Semoga Allah murahkan rezeki adik." },
  { who: "qish", text: "Sama-sama. Makan elok-elok ye.", expression: "happy" },
];
export const BB_FAMILY_AFTER: Line[] = [
  { who: "pakcik", text: "Terima kasih lagi sekali, adik. Anak saya suka sangat." },
  { who: "narrator", text: "(Budak tu dah comot dengan sos. Dia senyum lebar.)" },
];

/** Putrajaya: first time over Jambatan Putra. */
/** First steps into Lakefront (draft). */
/** First steps into Nyomnyom City: Bowat smells everything at once and bolts. */
export const NYOM_ARRIVE: Line[] = [
  { who: "narrator", text: "Nyomnyom City. Bandar makanan, bulat macam pizza." },
  { who: "qish", text: "Wah... bau semua benda sedap. Kek mango... ayam gepuk... daging salai...", expression: "love" },
  { who: "bowat", text: "*sniff sniff*", expression: "sniff" },
  { who: "bowat", text: "...NYOM NYOM.", expression: "nyom" },
  { who: "qish", text: "Bowat? Bowat, jangan—", expression: "surprised" },
  { who: "narrator", text: "Bowat dah lesap. Dari jauh kedengaran: \"SATU KEK MANGO! MAKAN SINI!\"" },
  { who: "qish", text: "BOWAT!! Awak mana ada duit!!", expression: "angry" },
  { who: "narrator", text: "Kejar Bowat. Setiap kedai yang dia tinggalkan, bayar resit dia." },
];

/** Paying Bowat's bill at each shop (in his order round the city). */
export const RESIT_TALK: Line[][] = [
  [
    { who: "kakkek", text: "Adik! Sloth kelabu tu kawan adik ke?" },
    { who: "kakkek", text: "Dia makan SEBIJI kek mango. Sebiji. Guna tangan. Lepas tu jilat pinggan." },
    { who: "qish", text: "...Berapa kak?", expression: "worried" },
    { who: "kakkek", text: "RM89. Pinggan tu akak halalkan." },
    { who: "qish", text: "BOWAT!!", expression: "angry" },
  ],
  [
    { who: "abanggepuk", text: "Sloth tu order level 10. LEVEL SEPULUH." },
    { who: "abanggepuk", text: "Dia tak menangis pun. Dia minta tambah sambal." },
    { who: "qish", text: "...Respect.", expression: "smug" },
    { who: "abanggepuk", text: "Tiga ekor ayam, RM42. Lesung pun dia jilat." },
  ],
  [
    { who: "auntiemala", text: "Your friend ah? The grey one?" },
    { who: "auntiemala", text: "He take the basket, put everything. Fishball, sotong, mushroom, all-all." },
    { who: "auntiemala", text: "Weigh already: 2.8 kilo. The bowl ah, not him. RM56." },
    { who: "qish", text: "Mangkuk dia lagi berat dari semua yang saya makan seminggu.", expression: "surprised" },
  ],
  [
    { who: "abangdubuyo", text: "Kak, sloth tu ambil cabaran level 5." },
    { who: "abangdubuyo", text: "Habis. Kuah pun habis. Lepas tu dia minta level 6. Kitorang takde level 6!" },
    { who: "qish", text: "...Dia okay ke?", expression: "worried" },
    { who: "abangdubuyo", text: "Dia okay. Tandas kitorang yang tak okay. RM38." },
  ],
  [
    { who: "crewmcd", text: "Hi kak! Sloth tadi order kat drive-thru... jalan kaki." },
    { who: "crewmcd", text: "Big Mac tiga, fries large lima, McFlurry dua. Lepas tu dia tanya ada Happy Meal untuk sloth tak." },
    { who: "qish", text: "Ada ke?", expression: "thinking" },
    { who: "crewmcd", text: "Takde. Tapi kitorang bagi jugak, sebab dia comel. RM71." },
  ],
  [
    { who: "pakciksalai", text: "Kawan adik tu tidur dalam asap salai pakcik tadi. Lena betul." },
    { who: "pakciksalai", text: "Bangun-bangun, sekilo daging salai hilang. Masak lemak cili api pun licin." },
    { who: "qish", text: "Daging salai favourite saya tu!! Dia tak tinggal sikit pun?", expression: "pout" },
    { who: "pakciksalai", text: "Takde. Tapi pakcik bungkuskan sikit untuk adik. Yang tu free. RM35 je yang dia makan." },
    { who: "qish", text: "Pakcik... terima kasih. 🥹", expression: "love" },
  ],
  [
    { who: "kakcookies", text: "Dia masuk, tengok semua balang, lepas tu peluk balang paling besar." },
    { who: "kakcookies", text: "Lepas tu dia jerit \"MAKAN BANYAK\" dan... dia makan banyak." },
    { who: "qish", text: "Itu move dia. Memang tertulis kat kad dia.", expression: "smug" },
    { who: "kakcookies", text: "40 ketul, RM60. Dia lari ke tengah bandar sambil kunyah. Ke Cosy Place." },
    { who: "qish", text: "Cosy Place...? Tempat first date saya dengan Faris.", expression: "love" },
  ],
];

export const TASIK_ARRIVE: Line[] = [
  { who: "qish", text: "Wah, tasik! Ramai gila orang picnic.", expression: "excited" },
  { who: "qish", text: "Eh... bunga lily! Penuh atas air. Bunga favourite saya!", expression: "excited" },
  { who: "narrator", text: "Hari ni Lakefront memang penuh dengan lily. Kebetulan je. Kot." },
];

export const SAMPAN_ASK: Line = { who: "qish", text: "Naik sampan?", expression: "happy" };
export const SAMPAN_TIP: Line[] = [
  { who: "narrator", text: "Dayung guna anak panah atau joystick. Lalu dekat lily untuk petik." },
  { who: "narrator", text: "Nak turun, dayung balik ke jeti." },
  { who: "bowat", text: "*terus baring dalam sampan* Zzz...", expression: "sleepy" },
];

export const PJ_ARRIVE: Line[] = [
  { who: "narrator", text: "Putrajaya. Petang-petang macam ni, satu Putrajaya keluar jogging." },
  { who: "qish", text: "Ramainya orang jogging...", expression: "surprised" },
  { who: "qish", text: "...Alamak. Hari ni saya tak jogging lagi.", expression: "worried" },
  { who: "qish", text: "Dah la tadi kat Lakefront makan macam Snorlax.", expression: "shy" },
  { who: "narrator", text: "Ada penimbang 20 sen tepi jambatan. Qish naik." },
  { who: "sign", text: "⚖️ 86.0kg" },
  { who: "qish", text: "LAPAN PULUH ENAM?!", expression: "surprised" },
  { who: "qish", text: "Okay. Turun balik 80kg dulu. Baru boleh jumpa sesiapa.", expression: "pout" },
  { who: "narrator", text: "Jogging keliling Putrajaya, dan cuba alat senaman kat Taman Kecergasan (kiri jambatan)." },
  { who: "narrator", text: "Tip: jogging sebelah orang lain yang sama arah, berat turun dua kali ganda!" },
];

/** The scale hits 80kg. */
export const PJ_DONE: Line[] = [
  { who: "sign", text: "⚖️ 80.0kg" },
  { who: "qish", text: "YES! Balik 80kg! Peluh pun dah macam air terjun.", expression: "excited" },
  { who: "mystery", text: "FAT ASS!" },
  { who: "qish", text: "...Eh? Suara siapa tu? Dari arah garisan START...", expression: "surprised" },
  { who: "narrator", text: "Pergi ke garisan START, depan bulatan Dataran Putra!" },
];

export const pjNotReady = (kg: string): Line[] => [
  { who: "qish", text: `Belum habis warm up. Berat sekarang ${kg}, kena turun sampai 80kg dulu.`, expression: "worried" },
  { who: "narrator", text: "Jogging keliling Putrajaya, atau guna alat senaman kat Taman Kecergasan." },
];

export const pjScale = (kg: string, done: boolean): Line[] =>
  done
    ? [
        { who: "sign", text: "⚖️ 80.0kg" },
        { who: "qish", text: "Lapan puluh. Cantik. Jangan sesiapa sentuh penimbang ni.", expression: "smug" },
      ]
    : [
        { who: "sign", text: `⚖️ ${kg}` },
        { who: "qish", text: "Okay, okay. Turun lagi sikit.", expression: "worried" },
      ];

/** The three machines at the Taman Kecergasan. */
export const GYM_TALK: { ask: string; start: Line[]; done: Line[] }[] = [
  {
    ask: "Naik air walker?",
    start: [{ who: "narrator", text: "Hayun kaki macam jalan atas angin! Tekan A berulang-ulang." }],
    done: [{ who: "qish", text: "Rasa macam terbang. Tapi kaki macam jeli.", expression: "laugh" }],
  },
  {
    ask: "Cuba palang tarik?",
    start: [{ who: "narrator", text: "Tarik badan sampai dagu lepas palang! Tekan A berulang-ulang." }],
    done: [
      { who: "qish", text: "LAPAN! Siapa kata saya tak boleh pull up?", expression: "smug" },
      { who: "qish", text: "...Okay, separuh tu saya lompat. Tapi kira la.", expression: "shy" },
    ],
  },
  {
    ask: "Buat sit-up?",
    start: [{ who: "narrator", text: "Sit-up! Tekan A berulang-ulang." }],
    done: [{ who: "qish", text: "Perut saya terbakar. Ni semua sebab Faris cubit perut saya semalam.", expression: "pout" }],
  },
];

export const GYM_AGAIN: Line[] = [{ who: "qish", text: "Dah buat yang ni. Badan saya cakap tak nak.", expression: "sleepy" }];
export const GYM_ENOUGH: Line[] = [{ who: "qish", text: "Dah 80kg. Cukup la senam hari ni.", expression: "happy" }];
export const gymBurn = (kg: string): Line[] => [{ who: "sign", text: `⚖️ ${kg} (-1.0kg!)` }];

/** Overworld interactions, keyed "zone:id". */
export const ZONE_TALK: Record<string, Line[]> = {
  "labulanjut:slothBefore": [
    { who: "slothfaris", text: "Pagi, Qish. Mata bengkak ni, menangis ke?", expression: "worried" },
    { who: "qish", text: "Mana ada! ...Encik Sloth ada nampak Faris tak? Dengan Bowat?", expression: "shy" },
    { who: "slothfaris", text: "Faris? Tak nampak pulak.", expression: "smug" },
    { who: "slothfaris", text: "Tapi tadi ada sloth kelabu gemuk lari ikut jalan kampung, ke arah Bukit Bintang. Kentut sepanjang jalan.", expression: "deadpan" },
    { who: "qish", text: "BOWAT!!", expression: "angry" },
    { who: "slothfaris", text: "Sambil makan cookies. Bersepah satu kampung. Ikut je jejak cookies tu.", expression: "sleepy" },
  ],
  "labulanjut:slothAfter": [
    { who: "slothfaris", text: "Bowat dah jumpa? Bagus, bagus.", expression: "happy" },
    { who: "slothfaris", text: "Faris tu memang macam tu. Tak pandai cakap, terus lari.", expression: "sleepy" },
    { who: "slothfaris", text: "Tapi saya rasa dia takkan pergi jauh dari awak.", expression: "wink" },
    { who: "bowat", text: "*kentut senyap*", expression: "relief" },
    { who: "slothfaris", text: "...Bowat.", expression: "deadpan" },
  ],
  "labulanjut:sign": [
    { who: "sign", text: "Labu Lanjut, Sepang" },
    { who: "narrator", text: "Kampung halaman Sepang Baddie." },
  ],
  "labulanjut:cat": [
    { who: "narrator", text: "Kucing oren tidur atas bumbung Myvi. Lagi." },
    { who: "qish", text: "Weh. Myvi saya bukan katil awak.", expression: "pout" },
    { who: "narrator", text: "(Kucing tu tak peduli langsung.)" },
  ],
  "labulanjut:clothes": [
    { who: "qish", text: "Tudung saya dah kering. Baju hitam pun.", expression: "happy" },
    { who: "narrator", text: "Angin Labu Lanjut: dryer paling murah kat Malaysia." },
  ],
  "labulanjut:kedai": [
    { who: "narrator", text: "Kedai runcit kampung. Aiskrim, roti, gas, semua ada." },
    { who: "qish", text: "Nanti la beli aiskrim. Cari Bowat dulu.", expression: "thinking" },
  ],
  "labulanjut:wakaf": [
    { who: "qish", text: "Wakaf ni best untuk lepak petang-petang.", expression: "happy" },
    { who: "narrator", text: "(Tapi sekarang bukan masa lepak.)" },
  ],
  "labulanjut:cats": [
    { who: "qish", text: "Kucing! Banyak gila kat padang ni.", expression: "excited" },
    { who: "narrator", text: "Kucing kampung semua lepak sini. Ada yang kejar ekor sendiri sampai pening." },
    { who: "qish", text: "Okay okay, comel. Fokus.", expression: "laugh" },
  ],
  "labulanjut:hammock": [
    { who: "qish", text: "Buaian... Kalau baring kejap, confirm tertidur sampai petang.", expression: "sleepy" },
    { who: "narrator", text: "(Snorlax Twin approved.)" },
    { who: "qish", text: "...Tak boleh. Bukan sekarang.", expression: "pout" },
  ],
  "labulanjut:bench": [
    { who: "qish", text: "Fuh. Jalan sikit pun dah penat. Confirm saya dah 80kg.", expression: "sleepy" },
    { who: "narrator", text: "(Awak kuyush.)" },
  ],
  "sunway:kedai24": [
    { who: "kakkedai", text: "Pewangi dah habis, dik. Satu KL datang beli hari ni." },
    { who: "kakkedai", text: "Tapi ada aiskrim. Nak?" },
    { who: "qish", text: "Nanti la, kak. Hehe.", expression: "happy" },
  ],
  "sunway:shawarma": [
    { who: "abangshawarma", text: "Shawarma! Ayam, daging, campur! Tambah keju RM2!" },
    { who: "qish", text: "Bau shawarma ni la satu-satunya bau yang mampu lawan bau kentut Bowat.", expression: "smug" },
    { who: "abangshawarma", text: "Abang tak lari tadi. Abang tahan nafas tiga minit. Bisnes tetap bisnes." },
  ],
  "sunway:urut": [
    { who: "orang", text: "Urut kaki, kakak? Refleksologi! Murah, murah!" },
    { who: "qish", text: "Lain kali. Kaki saya kena jalan cari Bowat dulu.", expression: "happy" },
  ],
  "sunway:mamak": [
    { who: "qish", text: "Mamak 24 jam. Roti telur dengan teh tarik kurang manis...", expression: "love" },
    { who: "narrator", text: "(Qish kuatkan semangat dan jalan terus.)" },
  ],
  "sunway:screen": [
    { who: "qish", text: "Skrin besar gila. Macam Times Square versi KL.", expression: "surprised" },
    { who: "qish", text: "Eh, lagu Laufey! Joji pun ada. Siapa yang pilih playlist ni? Taste dia sama macam saya.", expression: "excited" },
    { who: "narrator", text: "(Hmm. Siapa agaknya.)" },
  ],
  "sunway:monorel": [
    { who: "sign", text: "Monorel KL · Stesen Bukit Bintang" },
    { who: "qish", text: "Monorel lalu atas kepala. Wuuush. Comel je bentuk dia, macam ulat bulu.", expression: "happy" },
  ],
  "sunway:burger": [
    { who: "orang", text: "Burger daging special! Telur bungkus!" },
    { who: "qish", text: "Kenapa semua benda kat Bukit Bintang ni bau sedap... kecuali satu.", expression: "pout" },
  ],
  "sunway:vinyl": [
    { who: "abangvinyl", text: "Selamat datang ke Piring Hitam! Nak cari apa?" },
    { who: "qish", text: "Laufey ada? Joji? Bryant Barnes? Malcolm Todd?", expression: "excited" },
    { who: "abangvinyl", text: "Semua ada. Tapi tadi ada orang beli satu set semua tu sekali gus." },
    { who: "abangvinyl", text: "Rambut kerinting. Tak cakap banyak. Bayar, angguk, blah." },
    { who: "qish", text: "...Faris?!", expression: "surprised" },
    { who: "abangvinyl", text: "Dia tak cakap nama. Dia cakap 'k' je." },
  ],
  "sunway:gitar": [
    { who: "qish", text: "Kedai gitar. Ukulele kuning tu comel.", expression: "happy" },
    { who: "narrator", text: "(Satu lagi hobi yang Faris akan beli peralatan dan tak pernah guna.)" },
  ],
  "sunway:busker": [
    { who: "qish", text: "Busker Bintang! Sedap suara akak tu.", expression: "happy" },
    { who: "narrator", text: "Qish masukkan seringgit dalam beg gitar. Request: lagu sedih tapi happy." },
    { who: "qish", text: "Okay tu bukan request. Tu perasaan saya hari ni.", expression: "sad" },
  ],
  "sunway:moto": [
    { who: "sign", text: "ZON MOTOSIKAL" },
    { who: "qish", text: "Motor penuh sebaris. Semua orang datang Bukit Bintang naik motor ke?", expression: "thinking" },
  ],
  "sunway:piano": [
    { who: "sign", text: "Piano Jalanan ♪ Pijak kekunci untuk main!" },
    { who: "qish", text: "Ooh! Macam dalam movie Big tu. Jom main.", expression: "excited" },
  ],
  "sunway:letters": [
    { who: "qish", text: "BUKIT BINTANG. Huruf warna-warni ni pun kena masuk gambar.", expression: "happy" },
  ],
  "angkasa:board": [
    { who: "sign", text: "BERLEPAS · DEPARTURES" },
    { who: "qish", text: "Cosy Place, 08:08. Bukit Bintang, boarding...", expression: "thinking" },
    { who: "qish", text: "MALAS AIR: DELAYED. Lepas tu MALAS. Lepas tu TIDUR. Typical.", expression: "smug" },
    { who: "qish", text: "Eh, ada satu baris tulis... KEK MANGO? Gate 26, RAHSIA?", expression: "surprised" },
    { who: "narrator", text: "Baris tu cepat-cepat bertukar balik. Macam ada orang panik." },
  ],
  "angkasa:terminal": [
    { who: "narrator", text: "KLIA. Dalam daerah Sepang, sebelah je Labu Lanjut." },
    { who: "qish", text: "Sepang Baddie represent. 😎", expression: "smug" },
    { who: "narrator", text: "Dalam terminal penuh orang tarik beg. Babah sedang siapkan kapal di luar, mungkin dia boleh bantu cari Faris." },
  ],
  "angkasa:runway": [
    { who: "narrator", text: "Landasan 08/26. Kapal terbang berlepas dan mendarat tak berhenti-henti." },
    { who: "qish", text: "08... 26. Eh. 8.8 hari kita couple, 26 umur saya tahun ni.", expression: "love" },
    { who: "narrator", text: "Kebetulan je. Kot." },
  ],
  // Nyomnyom City (zone id "cosyplace"). All draft: Faris to check.
  "cosyplace:table": [
    { who: "narrator", text: "Meja 8. Kain putih, lilin, dua kerusi baldu merah. Kad kecil: \"Reserved · Meja 8 · Qish\"." },
    { who: "narrator", text: "Atas meja, dua pinggan lasagna. Masih panas." },
    { who: "qish", text: "Lasagna... Kitorang makan lasagna kat sini masa first date.", expression: "love" },
    { who: "qish", text: "Siapa yang tempah meja ni untuk saya?", expression: "thinking" },
  ],
  "cosyplace:tableAfter": [
    { who: "narrator", text: "Meja 8. Pinggan lasagna dah licin. Licin gila. Macam dijilat." },
    { who: "bowat", text: "...Bukan saya.", expression: "innocent" },
  ],
  "cosyplace:arch": [
    { who: "sign", text: "NYOMNYOM CITY · Bandar paling kenyang kat pulau ni" },
    { who: "qish", text: "Bandar dia bulat macam pizza. Jalan-jalan dia pun potong macam hirisan.", expression: "happy" },
    { who: "qish", text: "Okay, saya dah lapar.", expression: "happy" },
  ],
  "cosyplace:peta": [
    { who: "sign", text: "PETA NYOMNYOM: Kek Mango · Ayam Gepuk · Malatang · Dubuyo · McDonald's · Daging Salai · Cookies · Cosy Place (tengah)" },
    { who: "qish", text: "Semua makanan favourite saya ada dalam satu bandar. Ni syurga ke?", expression: "love" },
    { who: "narrator", text: "Ada tulisan kecil kat bawah: \"Dilarang makan tak bayar. Termasuk sloth.\"" },
  ],
  "cosyplace:scale": [
    { who: "narrator", text: "Qish naik atas penimbang malatang." },
    { who: "sign", text: "80.0kg" },
    { who: "qish", text: "INI PENIMBANG MANGKUK!! Bukan untuk orang!!", expression: "angry" },
    { who: "auntiemala", text: "Ya lah, so you get down lah." },
  ],
  "cosyplace:maitre": [
    { who: "maitre", text: "Bonsoir, mademoiselle. Selamat datang ke Cosy Place." },
    { who: "maitre", text: "Ah, Cik Qish. Ada tempahan atas nama cik. Meja 8." },
    { who: "qish", text: "Tempahan? Saya tak tempah apa-apa pun.", expression: "thinking" },
    { who: "maitre", text: "Dibuat petang tadi oleh seorang encik. Rambut kerinting, nampak... sangat penat." },
    { who: "qish", text: "FARIS?! Dia cakap apa?", expression: "surprised" },
    { who: "maitre", text: "Dia cakap... \"k\"." },
    { who: "qish", text: "...Itu memang dia.", expression: "happy" },
    { who: "maitre", text: "Dia juga pesan lasagna. Dua pinggan. Silakan." },
  ],
  "cosyplace:maitreAgain": [
    { who: "maitre", text: "Meja 8 sentiasa sedia untuk cik. Encik rambut kerinting dah bayar pun." },
  ],
  "cosyplace:piano": [
    { who: "narrator", text: "Pianist main waltz perlahan. Lilin-lilin bergoyang sikit ikut lagu." },
    { who: "qish", text: "Romantiknya. Faris kalau ada kat sini, mesti dah tertidur.", expression: "smug" },
  ],
  "cosyplace:dapur": [
    { who: "narrator", text: "Dari pintu dapur keluar bau lasagna, steak dan garlic bread." },
    { who: "chef", text: "Tetamu tak boleh masuk dapur, mademoiselle!" },
  ],
  "cosyplace:shop:kek": [
    { who: "kakkek", text: "Jemput dik! Kek mango baru keluar oven." },
    { who: "qish", text: "Kek mango... kegemaran saya tu. Bau dia!", expression: "excited" },
  ],
  "cosyplace:shop:gepuk": [
    { who: "abanggepuk", text: "Level berapa dik? Satu sampai sepuluh." },
    { who: "qish", text: "Saya orang Sepang. Awak rasa?", expression: "smug" },
    { who: "abanggepuk", text: "...Sepuluh. Baik, puan." },
  ],
  "cosyplace:shop:malatang": [
    { who: "auntiemala", text: "Ambil mangkuk, pilih sendiri, timbang sini ya!" },
    { who: "qish", text: "Malatang! Last time kitorang makan ni Faris ambil fishball je.", expression: "happy" },
  ],
  "cosyplace:shop:dubuyo": [
    { who: "abangdubuyo", text: "Annyeong! Cabaran level 5 hari ni. Habis, gambar free!" },
    { who: "qish", text: "Dubuyo! Level 5 tu... nanti la. Lepas jumpa Faris.", expression: "happy" },
  ],
  "cosyplace:shop:mcd": [
    { who: "crewmcd", text: "Welcome to McDonald's! Nak upsize, kak?" },
    { who: "qish", text: "Always upsize.", expression: "smug" },
  ],
  "cosyplace:shop:salai": [
    { who: "pakciksalai", text: "Daging salai! Asap kayu getah, salai dari subuh, dik." },
    { who: "qish", text: "Daging salai masak lemak cili api... ni makanan favourite saya!", expression: "love" },
  ],
  "cosyplace:shop:cookies": [
    { who: "kakcookies", text: "Cookies baru keluar oven! Nak rasa satu?" },
    { who: "qish", text: "Bowat mesti suka kedai ni.", expression: "happy" },
  ],
  // Lakefront (zone id "dusun"). All draft: Faris to check.
  "dusun:sign": [
    { who: "sign", text: "LAKEFRONT" },
    { who: "narrator", text: "Tasik paling tenang kat pulau ni. Hari ni penuh dengan lily." },
  ],
  "dusun:batik": [
    { who: "kakbatik", text: "Canting batik, dik! Hari ni kita buat motif bunga lily." },
    { who: "kakbatik", text: "Canting ni isi lilin panas. Lukis garisan dulu, lepas tu baru warna." },
    { who: "qish", text: "Oh, macam inking dulu baru colour! Sama je macam saya lukis.", expression: "excited" },
    { who: "kakbatik", text: "Pandai melukis eh? Nanti datang balik, buat satu." },
    { who: "qish", text: "Nanti. Lepas jumpa orang yang hilang tu." },
  ],
  "dusun:pakcik": [
    { who: "pakciksampan", text: "Nak naik sampan, dik? Hari ni free. Ada orang dah bayar pagi tadi." },
    { who: "qish", text: "Siapa?", expression: "thinking" },
    { who: "pakciksampan", text: "Lelaki rambut kerinting. Malas cakap. Bayar terus blah." },
    { who: "qish", text: "...FARIS.", expression: "pout" },
    { who: "pakciksampan", text: "Naik kat hujung jeti tu. Dayung pelan-pelan, jangan kacau memerang." },
  ],
  "dusun:pancing": [
    { who: "pakcikpancing", text: "Shhh. Ikan dengar." },
    { who: "pakcikpancing", text: "Dari subuh pakcik kat sini. Dapat tiga ekor. Satu memerang curi." },
    { who: "qish", text: "Memerang kat tasik ni memang samseng eh.", expression: "smug" },
  ],
  "dusun:picnic": [
    { who: "makcikpicnic", text: "Jaga-jaga, dik. Memerang kat sini suka curi keropok." },
    { who: "makcikpicnic", text: "Tadi dah tiga bungkus. Pakcik ni pun dah malas kejar." },
    { who: "qish", text: "Comel tapi pencuri. Okay.", expression: "happy" },
  ],
  "dusun:couple": [
    { who: "narrator", text: "Sepasang couple tengah picnic bawah payung. Kongsi satu straw." },
    { who: "qish", text: "Hmph. Kalau Faris ada, mesti dia dah tertidur atas tikar tu.", expression: "pout" },
  ],
  "dusun:bench": [
    { who: "qish", text: "Duduk kejap tengok tasik...", expression: "happy" },
    { who: "narrator", text: "Angin sejuk, air tenang, lily terapung-apung. Bowat dah menguap." },
    { who: "qish", text: "Okay, okay. Bangun. Cari Faris." },
  ],
  "dusun:heart": [
    { who: "qish", text: "Eh... ada orang tanam lily bentuk hati?", expression: "surprised" },
    { who: "narrator", text: "Lily pink, satu-satu, susun jadi hati. Siapa la rajin sangat ni." },
    { who: "qish", text: "Kebetulan je kot. Kan?", expression: "shy" },
  ],
  "dusun:kuih": [
    { who: "narrator", text: "Kuih muih atas but Kancil. Onde-onde, kuih lapis, seri muka. RM1 je." },
    { who: "qish", text: "Saya tak lapar. ...Okay, lapar sikit.", expression: "shy" },
    { who: "narrator", text: "(Snorlax Twin dalam diri awak dah bangun.)" },
  ],
  "dusun:pokok": [
    { who: "narrator", text: "Pokok bunga dalam pasu. Ada lily putih, lily pink, lily peach!" },
    { who: "qish", text: "Lily lagi! Nak beli semua...", expression: "excited" },
    { who: "qish", text: "Tapi yang terapung tengah tasik tu lagi special.", expression: "love" },
  ],
  "dusun:preloved": [
    { who: "narrator", text: "Baju preloved RM5 sehelai. Lorbel versi pagi Ahad." },
    { who: "qish", text: "Jangan tengok. Jangan tengok. Fokus.", expression: "worried" },
  ],
  "dusun:vinyl": [
    { who: "narrator", text: "Peti vinyl dan kaset dalam but Avanza." },
    { who: "qish", text: "Ada Laufey tak? Joji? Malcolm Todd?", expression: "excited" },
    { who: "narrator", text: "Pakcik tu cuma ada P. Ramlee. Lapan keping." },
  ],
  "dusun:otter": [
    { who: "qish", text: "Memerang! Satu family, berenang ikut belakang sampan saya!", expression: "excited" },
    { who: "narrator", text: "Yang kat atas pulau tu tengah berjemur. Yang satu berguling-guling." },
    { who: "qish", text: "Comelnya. Rasa nak bawak balik satu.", expression: "love" },
  ],
  "dusun:otterpair": [
    { who: "qish", text: "Dua ekor tidur terapung... sambil pegang tangan?", expression: "surprised" },
    { who: "narrator", text: "Memerang pegang tangan masa tidur supaya tak hanyut berpisah." },
    { who: "qish", text: "...Okay itu sweet gila.", expression: "love" },
  ],
  "dusun:otterden": [
    { who: "qish", text: "Memerang tengah berjemur atas batu tepi tasik!", expression: "excited" },
    { who: "narrator", text: "Seekor tengah berguling-guling, perut ke atas. Langsung tak peduli orang lalu." },
    { who: "qish", text: "Life goals.", expression: "happy" },
  ],
  "dusun:wakaf": [
    { who: "narrator", text: "Dua makcik lepak dalam wakaf, tengok memerang sambil makan kuih." },
    { who: "makcikpicnic", text: "Tadi ada budak lelaki rambut kerinting lalu sini. Muka macam baru bangun tidur." },
    { who: "qish", text: "Dia pergi mana?!", expression: "surprised" },
    { who: "makcikpicnic", text: "Entah. Dia jalan, lepas tu berhenti, lepas tu jalan balik. Macam malas nak pergi mana-mana." },
  ],
  "dusun:kelapa": [
    { who: "narrator", text: "Air kelapa muda, terus dari buah. Sejuk." },
    { who: "qish", text: "Lepas jalan keliling tasik ni, memang patut.", expression: "happy" },
  ],
  "dusun:nap": [
    { who: "snorlax", text: "Zzz... kenyang... Zzz..." },
    { who: "qish", text: "Dia tidur balik. Typical.", expression: "smug" },
  ],
  // Lorbel (zone id "galeri"): the pasar malam in the back lane.
  "galeri:neon": [
    { who: "narrator", text: "LORBEL. Lorong Belakang." },
    { who: "narrator", text: "Siang tempat buang sampah dengan parking motor. Malam jadi pasar malam paling sesak." },
    { who: "qish", text: "Ramainya orang. Kalau Faris ada kat sini pun, macam mana nak jumpa...", expression: "worried" },
  ],
  "galeri:graffiti": [
    { who: "narrator", text: "Ada contengan kat dinding: \"F + Q\" dalam bentuk hati." },
    { who: "qish", text: "...Siapa conteng ni?", expression: "thinking" },
    { who: "narrator", text: "Huruf F tu senget. Macam orang malas tulis." },
    { who: "qish", text: "FARIS.", expression: "smug" },
  ],
  "galeri:stage": [
    { who: "narrator", text: "Busker sambung nyanyi. Gitar dia masih sumbang sikit." },
    { who: "qish", text: "Faris pernah menang PS4 sebab cosplay sama macam tu tau.", expression: "smug" },
    { who: "narrator", text: "Penonton tepuk tangan. Busker tu tunduk hormat kat Qish." },
  ],
  "galeri:cat": [
    { who: "narrator", text: "Kucing Lorbel tidur celah meja, tunggu orang jatuhkan ayam." },
    { who: "qish", text: "Sama macam Bowat tunggu cookies.", expression: "laugh" },
  ],
  "photobooth:easel": [
    { who: "narrator", text: "Atas easel ada lukisan doodle: dua orang, garisan marker hitam." },
    { who: "qish", text: "Eh, ni lukisan saya! Faris dengan saya.", expression: "surprised" },
    { who: "qish", text: "Bila masa kamera besar tu simpan ni...", expression: "thinking" },
  ],
  "photobooth:camera": [
    { who: "sign", text: "BOLAT·CAM · DIGITAL 9000 · 26.0 MEGAPIXEL" },
    { who: "narrator", text: "Kamera digital pink sebesar rumah. Setiap sepuluh saat dia zoom, bip-bip, FLASH. Tiada siapa tekan." },
    { who: "qish", text: "Kamera besar tu simpan gambar SEMUA benda rupanya.", expression: "smug" },
    { who: "qish", text: "...Faris pun takkan larat angkat benda ni. Dia malas angkat phone pun.", expression: "laugh" },
  ],
  "photobooth:gate": [
    { who: "sign", text: "FOTOBOOTH · senyum! · 1, 2, 3 · cheese!" },
    { who: "qish", text: "Jalan dia macam roll filem. Bengkang-bengkok macam ular.", expression: "thinking" },
    { who: "qish", text: "Kalau Faris, mesti dia cari jalan pintas. Tak boleh, ada tali baldu.", expression: "smug" },
  ],
  "photobooth:tree": [
    { who: "narrator", text: "Pokok Strip: orang sepit strip gambar kat dahan, harap kenangan tu kekal." },
    { who: "qish", text: "Comelnya. Ada couple tulis \"1 tahun ♥\" kat belakang strip.", expression: "love" },
    { who: "narrator", text: "Angin bertiup. Satu strip tercabut, terbang ke langit." },
  ],
  "photobooth:kiosk": [
    { who: "sign", text: "CETAK GAMBAR · dari phone · siap 1 minit · RM2" },
    { who: "qish", text: "Phone saya penuh gambar Faris tidur. Tak payah cetak kot.", expression: "laugh" },
    { who: "qish", text: "...Okay mungkin satu.", expression: "shy" },
  ],
  "photobooth:studio": [
    { who: "sign", text: "STUDIO FLASH · sesi gambar sedang berjalan · senyap ya" },
    { who: "narrator", text: "Flash! Flash! Flash! Tiga lampu menyala bergilir-gilir." },
    { who: "qish", text: "Model tu pose lain setiap kali flash. Saya kat booth pun pose sama je empat kali.", expression: "laugh" },
  ],
  "photobooth:digicam": [
    { who: "narrator", text: "Kamera digital zaman Y2K, besar macam patung. Lensa dia berkilat." },
    { who: "qish", text: "Dulu semua orang bawa kamera macam ni pergi jalan-jalan!", expression: "excited" },
  ],
  "galeri:satay": [
    { who: "narrator", text: "Asap satay naik sampai ke lampu. Bau dia sampai ke bundle." },
    { who: "qish", text: "Fokus, Qish. Cari Faris dulu. ...Lepas tu satay.", expression: "thinking" },
  ],
  "galeri:salai": [
    { who: "qish", text: "DAGING SALAI. Favourite saya!", expression: "excited" },
    { who: "qish", text: "Kalau Faris ada, mesti dia order satu untuk saya.", expression: "love" },
    { who: "narrator", text: "(Penimbang dalam kepala Qish: 80kg.)" },
  ],
  "galeri:malatang": [
    { who: "qish", text: "Malatang!! Pilih sendiri, timbang...", expression: "excited" },
    { who: "qish", text: "...Okay satu mangkuk je. Lepas jumpa Faris.", expression: "shy" },
  ],
  "galeri:balang": [
    { who: "narrator", text: "Air balang enam warna: sirap, bandung, laici, oren, anggur, nanas." },
    { who: "qish", text: "Bandung satu. Nanti. Lepas jumpa Faris.", expression: "happy" },
  ],
  "galeri:mango": [
    { who: "qish", text: "Kek mango! ...HABIS?", expression: "surprised" },
    { who: "pakcikkek", text: "Sorry dik. Semua dah orang borong tadi." },
    { who: "pakcikkek", text: "Lelaki rambut kerinting. Malas cakap. Bayar terus blah." },
    { who: "qish", text: "...Rambut kerinting?", expression: "thinking" },
    { who: "narrator", text: "Atas kaunter ada satu kotak berikat reben pink: \"TEMPAHAN · a/n: F.\"" },
  ],
  "galeri:burger": [
    { who: "narrator", text: "Burger special, telur double, sos berlambak." },
    { who: "qish", text: "Faris mesti order yang paling simple. Malas pilih.", expression: "smug" },
  ],
  "galeri:bundle": [
    { who: "narrator", text: "BUNDLE RM5 semua. Orang berebut macam tengah sale." },
    { who: "qish", text: "Jaket ni comel...", expression: "love" },
    { who: "qish", text: "Faris mesti cakap \"tak payah, awak dah banyak jaket.\"", expression: "pout" },
  ],
  "galeri:jeans": [{ who: "narrator", text: "Jeans RM15. Ada yang ori, ada yang... yakin ori." }],
  "galeri:jaket": [
    { who: "narrator", text: "Jaket tebal-tebal. \"Untuk sejuk aircond.\"" },
    { who: "qish", text: "Malaysia mana ada musim sejuk.", expression: "smug" },
  ],
  "galeri:tshirt": [
    { who: "narrator", text: "T-shirt 3 helai RM10. Ada satu tulis \"I ♥ TIDUR\"." },
    { who: "qish", text: "Ni baju Snorlax Twin.", expression: "laugh" },
  ],
  "galeri:ramen": [
    { who: "qish", text: "Ramen pedas! Level 10.", expression: "excited" },
    { who: "narrator", text: "Ada tulis kecil: \"Level 10 tak boleh refund air.\"" },
    { who: "qish", text: "Nanti. Lepas jumpa Faris. ...Level 10.", expression: "smug" },
  ],
  "galeri:takoyaki": [
    { who: "narrator", text: "Takoyaki 6 biji RM6. Sotong dia sikit, cinta dia banyak." },
    { who: "qish", text: "Faris mesti makan sebiji terus, lepas tu menangis sebab panas.", expression: "laugh" },
  ],
  "galeri:topi": [
    { who: "narrator", text: "Topi bundle: snapback, bucket hat, topi pancing." },
    { who: "qish", text: "Bowat mesti comel pakai bucket hat.", expression: "love" },
  ],
  "galeri:kasut": [{ who: "narrator", text: "Kasut bundle saiz 36 sampai 44. Kadang-kadang sebelah je." }],
  "galeri:mirror": [
    { who: "narrator", text: "Qish tengok cermin bundle." },
    { who: "qish", text: "Antek giler.", expression: "smug" },
    { who: "narrator", text: "(Cermin tu setuju.)" },
  ],
  // Putrajaya
  "bukit:tebu": [
    { who: "narrator", text: "Air tebu sejuk. Mesin perah berpusing, bunyi kriuk kriuk." },
    { who: "qish", text: "Sedapnya... tapi satu cawan tu manis gila. Naik balik nanti berat saya.", expression: "worried" },
    { who: "qish", text: "Lepas jogging la. Upah diri sendiri.", expression: "happy" },
  ],
  "bukit:kelapa": [
    { who: "narrator", text: "Kelapa muda bertimbun. Pakcik tu tebuk satu dengan parang, sekali hayun." },
    { who: "qish", text: "Air kelapa kan sihat. ...Kan?", expression: "worried" },
  ],
  "bukit:aiskrim": [
    { who: "narrator", text: "Ting ting! Aiskrim Malaysia: perisa jagung, kacang merah, durian." },
    { who: "qish", text: "Kenapa semua benda sedap ada kat tempat orang jogging?! Ni ujian ke?", expression: "angry" },
  ],
  "bukit:masjid": [
    { who: "narrator", text: "Masjid Putra. Kubah merah jambu atas tasik, cantik gila waktu petang macam ni." },
    { who: "qish", text: "Kubah dia warna pink. Taste saya.", expression: "happy" },
  ],
  "bukit:perdana": [
    { who: "narrator", text: "Perdana Putra. Kubah hijau, pancutan air menari kat depan." },
    { who: "qish", text: "Pejabat Perdana Menteri. Dia pun kena datang kerja hari Selasa ke?", expression: "thinking" },
  ],
  "bukit:huruf": [
    { who: "narrator", text: "Huruf besar PUTRAJAYA warna-warni. Semua orang ambil gambar kat sini." },
    { who: "qish", text: "Nanti datang balik dengan Faris. Dia kena jadi photographer.", expression: "happy" },
    { who: "qish", text: "Kalau dia tak malas la.", expression: "smug" },
  ],
  "bukit:arch": [
    { who: "narrator", text: "Garisan START Larian Petang Putrajaya. Jam besar tu tak berhenti mengira." },
    { who: "qish", text: "Belum, belum. Warm up dulu.", expression: "happy" },
  ],
  "sepang:gate": [
    { who: "sign", text: "LITAR ANTARABANGSA SEPANG" },
    { who: "qish", text: "Litar F1 kampung saya. Sepang Baddie represent.", expression: "smug" },
  ],
  "sepang:tiket": [{ who: "kaktiket", text: "Adik! Sini kejap, ada orang tinggalkan barang untuk adik." }],
  "sepang:tiketAfter": [{ who: "kaktiket", text: "Pergi la, dik. Dia tunggu lama dah tu. Tidur pun dah dua kali." }],
  "sepang:merch": [{ who: "abangmerch", text: "Adik tudung mauve! Ada barang untuk adik ni." }],
  "sepang:merchAfter": [{ who: "abangmerch", text: "Bantal MALAS RACING tinggal satu je. Nak? Free. Bos dah bayar." }],
  "sepang:krew": [{ who: "ketuakrew", text: "Adik cari bos kami ke? Mari sini." }],
  "sepang:krewAfter": [
    { who: "ketuakrew", text: "Kalau jumpa bos, cakap krew dia rindu." },
    { who: "ketuakrew", text: "...Tak, tipu. Kami tidur je." },
  ],
  "sepang:usher": [{ who: "usher", text: "Adik! Ya, adik. Sini kejap." }],
  "sepang:usherAfter": [{ who: "usher", text: "Kerusi C-12 tu masih panas. Dia baru pindah naik podium." }],
  "sepang:marshal": [{ who: "marshal", text: "Dik! Sini, pakcik ada barang untuk adik." }],
  "sepang:marshalAfter": [
    { who: "marshal", text: "Bendera kuning tu maknanya safety car keluar. Semua kena perlahan, beratur belakang dia." },
    { who: "qish", text: "Macam Raja Nonchalant. Setiap hari.", expression: "smug" },
  ],
  "sepang:pengulas": [{ who: "pengulas", text: "Cik! Cik tudung mauve! Satu soalan untuk penonton!" }],
  "sepang:pengulasAfter": [{ who: "pengulas", text: "Kami doakan yang terbaik untuk gadis tudung mauve! Kembali ke studio." }],
  "sepang:poncho": [
    { who: "abangponcho", text: "Baju hujan RM5! Langit dah gelap tu kak." },
    { who: "qish", text: "Saya nak cari orang, bukan nak beli baju hujan.", expression: "pout" },
    { who: "abangponcho", text: "Orang rambut kerinting? Dia beli payung pantai pagi tadi. Besar gila. Corak pink." },
  ],
  "sepang:food": [
    { who: "sign", text: "SATAY KAJANG · AIS KACANG" },
    { who: "qish", text: "Bau satay... Fokus, Qish. Fokus.", expression: "love" },
  ],
  "sepang:sim": [
    { who: "sign", text: "SIMULATOR F1 · CUBA LAH! RM0" },
    { who: "narrator", text: "Budak tu dah langgar dinding lima kali. Dia masih senyum." },
  ],
  "sepang:showcar": [
    { who: "sign", text: "BOLAT GP · KERETA PAMERAN" },
    { who: "qish", text: "Pink! Ada nama BOLAT kat sayap belakang. ...Siapa yang buat team ni?", expression: "surprised" },
  ],
  "sepang:screen": [
    { who: "narrator", text: "SEPANG TV: peta litar, setiap kereta satu titik warna." },
    { who: "narrator", text: "Tulisan bergerak kat bawah: \"RAJA NONCHALANT: DI PODIUM SEJAK PAGI · TAK MASUK KERETA PUN\"." },
    { who: "qish", text: "Famous sebab malas. Bangga la tu.", expression: "smug" },
  ],
  "sepang:tower": [
    { who: "narrator", text: "Menara masa: senarai kedudukan, lap demi lap." },
    { who: "qish", text: "MALAS RACING takde dalam senarai. Memang tak start pun.", expression: "smug" },
  ],
  "sepang:heli": [
    { who: "narrator", text: "Helikopter perubatan. Juruterbang dia tengah makan roti dalam kokpit." },
    { who: "qish", text: "Harap tak payah guna hari ni.", expression: "worried" },
  ],
  "sepang:banner": [
    { who: "narrator", text: "SEPANG BADDIE ♥ · LABU LANJUT QUEEN. Tali dia senget sebelah." },
    { who: "qish", text: "Dia ikat sendiri ni. Nampak sangat.", expression: "happy" },
  ],
  "sepang:malas": [
    { who: "narrator", text: "Garaj MALAS RACING: kereta berselimut, tiga krew berdengkur atas sofa." },
    { who: "sign", text: "JANGAN KACAU · Raja Nonchalant tengah rehat" },
    { who: "qish", text: "Satu team ikut perangai bos.", expression: "smug" },
  ],
  "sepang:pitwall": [
    { who: "narrator", text: "Krew pit berdiri tepi lorong, tunggu kereta masuk." },
    { who: "narrator", text: "Bila kereta berhenti: BRRRT BRRRT! Empat tayar bertukar dalam dua saat." },
    { who: "qish", text: "Laju gila. Faris bangun tidur pun ambil sejam.", expression: "laugh" },
  ],
  "bukit:archAfter": [
    { who: "narrator", text: "Garisan START. Ada orang conteng kat bawah: \"SHE'S SO TINY\" dengan hati." },
  ],
};

export const BOOTH_NAMES = ["123 Annyeong", "Inssa Film", "Dear Memories", "Fotopot", "Photomansion", "KPIX", "Hana Film"];
export const STRIP_STUDIOS = ["123 Annyeong", "123 Annyeong", "Photo Booth", "Inssa Film", "Dear Memories", "Fotopot", "Photomansion", "123 Annyeong", "KPIX", "Hana Film"];

/** The made-up booths in FotoBooth (style index 7 onwards). */
export const boothxLines = (style: number): Line[] =>
  (<Record<number, Line[]>>{
    7: [
      { who: "sign", text: "SENYUM STUDIO · 4 keping · RM15" },
      { who: "qish", text: "Senyum. Faris setiap kali masuk booth: muka sama empat keping.", expression: "laugh" },
    ],
    8: [
      { who: "sign", text: "KIMCHI CLICK · frame Korea · filter licin" },
      { who: "qish", text: "Filter dia licin sangat sampai Faris nampak macam orang lain.", expression: "laugh" },
    ],
    9: [
      { who: "sign", text: "4 POSE · 4 pose, 4 saat setiap satu" },
      { who: "qish", text: "Empat pose. Faris: senyum, senyum, senyum, senyum.", expression: "smug" },
    ],
    10: [
      { who: "sign", text: "SNAP SNAP · ada prop: topi, spek besar, bando telinga" },
      { who: "qish", text: "Bando telinga kucing! Paksa Faris pakai nanti.", expression: "excited" },
    ],
    11: [
      { who: "sign", text: "BOLAT·BOOTH · khas untuk yang demand kiss & cuddle" },
      { who: "qish", text: "...Ni booth saya ke?", expression: "shy" },
      { who: "narrator", text: "Tulis kecil kat bawah: \"Semua request mesti dipenuhi.\"" },
    ],
  })[style] ?? [{ who: "qish", text: "Satu lagi photobooth!", expression: "excited" }];

/** FotoBooth arrival: the giant camera flashes, strips everywhere. */
export const PB_ARRIVE: Line[] = [
  { who: "narrator", text: "Bip-bip... KLIK! Kamera gergasi kat tengah bandar menyala. Silau satu lorong." },
  { who: "narrator", text: "Angin dari flash tu terbangkan strip-strip gambar ke udara." },
  { who: "qish", text: "Eh... tu bukan strip orang lain. Tu gambar SAYA dengan Faris!", expression: "surprised" },
  { who: "qish", text: "Jalan kat sini bengkang-bengkok macam ular. Kena kejar ikut jalan la ni.", expression: "thinking" },
  { who: "narrator", text: "Kejar 6 strip yang terbang. Dekat sikit, dia terbang lagi... sampai tersangkut!" },
];

/** Posing at a backdrop: the lights fire, Bowat photobombs. */
export const PB_POSE: Line[] = [
  { who: "narrator", text: "1... 2... 3..." },
  { who: "narrator", text: "KLIK!" },
];
export const pbPoseAfter = (bowat: boolean): Line[] =>
  bowat
    ? [
        { who: "narrator", text: "Dalam gambar: Qish senyum cantik. Belakang dia, Bowat buat muka." },
        { who: "qish", text: "Bowat! Awak photobomb lagi.", expression: "pout" },
        { who: "bowat", text: "*kentut senyap*", expression: "smug" },
      ]
    : [
        { who: "narrator", text: "Dalam gambar: Qish senyum seorang. Sebelah dia ada ruang kosong." },
        { who: "qish", text: "Patutnya ada Faris kat sini. Malas punya orang.", expression: "sad" },
      ];

export const boothLines = (i: number): Line[] => [
  { who: "sign", text: BOOTH_NAMES[i] },
  { who: "qish", text: "Kitorang pernah ambil gambar kat sini! Strip dari sini pun hilang dari bilik saya...", expression: "sad" },
];

export const stripLines = (i: number): Line[] => [
  { who: "sign", text: `Photo strip · ${STRIP_STUDIOS[i]}` },
  { who: "narrator", text: "Satu lagi kenangan korang yang kamera besar tu simpan elok-elok." },
];

export const MYVI_ALONE: Line[] = [
  { who: "qish", text: "Myvi saya!", expression: "excited" },
  { who: "narrator", text: "Myvi merah kesayangan. Fast travel boleh guna bila dah buka zon lain." },
];
export const MYVI_ASK: Line = { who: "qish", text: "Nak drive Myvi ke mana?", expression: "happy" };

export const lockedLines = (next: string): Line[] => [
  { who: "narrator", text: `Jalan ke ${next} masih tertutup.` },
  { who: "narrator", text: "Kalahkan boss kat sini dulu!" },
];

/** Collecting in each zone: first pickup, all collected, and trying the way on too early. */
export const COLLECT_TALK: Record<string, { first: Line[]; done: Line[]; notYet: (got: number, need: number) => Line[] }> = {
  sunway: {
    first: [
      { who: "narrator", text: "PSSSSHT!" },
      { who: "qish", text: "Hilang! Bau lily semerbak. Okay, ni berkesan.", expression: "excited" },
      { who: "orang", text: "Eh? Dah tak busuk? Terima kasih, kak!" },
      { who: "narrator", text: "Sembur semua awan kentut. Cari awan hijau besar kat sekeliling Bukit Bintang!" },
    ],
    done: [
      { who: "narrator", text: "PSSSSHT!" },
      { who: "qish", text: "Awan last! Satu Bukit Bintang dah bau bunga lily.", expression: "excited" },
      { who: "narrator", text: "Orang ramai mula jalan macam biasa semula. Lampu isyarat hidup balik." },
      { who: "qish", text: "Tinggal satu sumber bau. Tengah-tengah scramble tu.", expression: "thinking" },
      { who: "bowat", text: "*kentut senyap*", expression: "innocent" },
      { who: "qish", text: "BOWAT.", expression: "angry" },
    ],
    notYet: (got, need) => [
      { who: "narrator", text: "Stesen MRT ke Lorbel ditutup sementara. Busuk sangat, staf pun lari." },
      { who: "qish", text: `Awan kentut dah hilang ${got}/${need}. Kena sembur semua dulu.`, expression: "thinking" },
    ],
  },
  labulanjut: {
    first: [
      { who: "qish", text: "Eh, cookie? Ada kesan gigit...", expression: "thinking" },
      { who: "qish", text: "Ni mesti Bowat! Dia makan sambil lari, tercicir sepanjang jalan.", expression: "surprised" },
      { who: "narrator", text: "Kumpul semua cookies Bowat. Cari yang bersinar kat sekeliling kampung!" },
    ],
    done: [
      { who: "qish", text: "Cookie last! Semua jejak menuju ke jalan bawah tu...", expression: "excited" },
      { who: "qish", text: "Ke Bukit Bintang. Tunggu saya, Bowat!", expression: "excited" },
      { who: "narrator", text: "Palang jalan ke Bukit Bintang dah terbuka." },
    ],
    notYet: (got, need) => [
      { who: "narrator", text: "Palang jalan masih tertutup. Ada tulisan: \"IKUT JEJAK BOWAT\"." },
      { who: "qish", text: `Cookies baru ${got}/${need}. Ada lagi yang bersepah kat kampung ni.`, expression: "thinking" },
      { who: "narrator", text: "Cari cahaya kuning yang menegak ke langit!" },
    ],
  },
  angkasa: {
    first: [
      { who: "qish", text: "Spanar? Ada tulis \"BABAH\" kat pemegang...", expression: "surprised" },
      { who: "qish", text: "Ni tools Babah! Macam mana boleh bersepah kat sini?", expression: "thinking" },
      { who: "narrator", text: "Kumpul semua tools Babah. Cari cahaya kuning yang menegak ke langit!" },
    ],
    done: [
      { who: "qish", text: "Tools last! Lengkap semua.", expression: "excited" },
      { who: "narrator", text: "Bawa balik kat Babah, dekat kapal terbang kat stand 8." },
    ],
    notYet: (got, need) => [
      { who: "narrator", text: "Jalan ke Nyomnyom City masih tertutup." },
      { who: "qish", text: `Tools Babah baru ${got}/${need}. Kena tolong Babah dulu.`, expression: "thinking" },
    ],
  },
  cosyplace: {
    first: [{ who: "narrator", text: "📃 Resit dibayar. Bowat dah lari ke kedai lain. Cari dia (ada tanda ! atas kepala dia), dan bayar resit kat setiap kedai yang dia tinggalkan." }],
    done: [
      { who: "narrator", text: "📃 Semua resit dah langsai. Jumlah: RM391." },
      { who: "qish", text: "Duit birthday saya habis kat perut seekor sloth.", expression: "cry" },
      { who: "qish", text: "Okay Bowat. Cosy Place. Awak dah takde tempat nak lari.", expression: "smug" },
    ],
    notYet: (got, need) => [
      { who: "narrator", text: "Pengawal pintu: \"Maaf kak. Hutang sloth kelabu tu belum langsai. Tak boleh keluar.\"" },
      { who: "qish", text: `Resit Bowat baru ${got}/${need}. Kena kejar dia dulu.`, expression: "pout" },
    ],
  },
  galeri: {
    first: [
      { who: "qish", text: "Kertas? Ada tulis \"REQUEST: PELUK 10 SAAT ♥\".", expression: "surprised" },
      { who: "qish", text: "Macam tulisan saya sendiri. Bolat punya kerja la ni.", expression: "shy" },
      { who: "narrator", text: "Kumpul semua kertas request Bolat. Cari cahaya kuning yang menegak ke langit!" },
    ],
    done: [
      { who: "qish", text: "Request last: \"CIUM PIPI. DUA KALI.\" ...Okay, cukup enam.", expression: "shy" },
      { who: "narrator", text: "Bawa balik kat Bolat, depan pentas busking." },
    ],
    notYet: (got, need) => [
      { who: "narrator", text: "Jalan keluar tersekat. Orang terlalu ramai." },
      { who: "qish", text: `Kertas request baru ${got}/${need}. Bolat tengah tunggu kat pentas.`, expression: "thinking" },
    ],
  },
  dusun: {
    first: [
      { who: "qish", text: "Lily! Wangi gila... Bunga favourite saya.", expression: "love" },
      { who: "narrator", text: "Kumpul semua lily yang bersinar kat tengah tasik. Enam kuntum!" },
    ],
    done: [
      { who: "qish", text: "Kuntum last! Cukup enam, dah jadi satu jambak.", expression: "happy" },
      { who: "narrator", text: "Dayung balik ke jeti, lepas tu bawa jambak lily kat Snorlax Twin dekat jambatan." },
    ],
    notYet: (got, need) => [
      { who: "narrator", text: "Snorlax Twin masih tidur atas jambatan." },
      { who: "qish", text: `Lily baru ${got}/${need}. Kena petik lagi kat tengah tasik.`, expression: "thinking" },
    ],
  },
  sepang: {
    first: [{ who: "narrator", text: "Satu pas dah dapat. Lagi lima. Cari tanda ! kat seluruh litar: pintu masuk, fan zone, pit lane, dan seberang jambatan." }],
    done: [
      { who: "qish", text: "Enam pas! ALL ACCESS.", expression: "excited" },
      { who: "narrator", text: "Atas bangunan pit, seseorang menguap besar. Rambut panjang kerinting bergoyang." },
      { who: "qish", text: "Faris. Duduk situ. Jangan lari lagi.", expression: "angry" },
      { who: "narrator", text: "Pergi ke tangga podium kat belakang bangunan pit. Abang Bouncer tengah tunggu." },
    ],
    notYet: (got, need) => [
      { who: "narrator", text: "Jalan balik ke Labu Lanjut masih ditutup." },
      { who: "qish", text: `Pas baru ${got}/${need}. Faris kat podium tu. Saya tak balik selagi tak jumpa dia.` },
    ],
  },
  photobooth: {
    first: [
      { who: "qish", text: "Dapat pun! Tersangkut akhirnya.", expression: "excited" },
      { who: "qish", text: "Gambar kita... elok lagi. Takde koyak.", expression: "love" },
      { who: "narrator", text: "Lagi lima strip terbang. Dekat sikit, dia terbang lagi. Ikut je jalan ular tu sampai dia tersangkut!" },
    ],
    done: [
      { who: "qish", text: "Strip last! Cukup enam.", expression: "happy" },
      { who: "narrator", text: "Jom pulangkan semua strip ke kamera besar di tengah FotoBooth." },
    ],
    notYet: (got, need) => [
      { who: "narrator", text: "Jalan ke Putrajaya masih tertutup." },
      { who: "qish", text: `Strip baru ${got}/${need}. Kamera besar tu masih perlukan strip yang lain.`, expression: "thinking" },
    ],
  },
};

/** Babah, Qish's dad: aircraft engineer at KLIA, in on the birthday surprise and terrible at hiding it.
 * All draft: Faris to check how Babah talks and what he calls her. */
export const BABAH = {
  intro: [
    { who: "babah", text: "Eh, kakak? Buat apa kat airport ni?", expression: "surprised" },
    { who: "qish", text: "Babah! Babah ada nampak Faris tak? Dia hilang dari semalam.", expression: "worried" },
    { who: "babah", text: "F-Faris? Faris mana? ...Oh, Faris. Tak. Tak nampak. Langsung.", expression: "guilty" },
    { who: "babah", text: "Babah tak tahu apa-apa pasal kek mango.", expression: "guilty" },
    { who: "qish", text: "...Kek mango apa?", expression: "thinking" },
    { who: "babah", text: "Kek apa? Takde kek. Babah cakap... kapal. Kapal mango. Eh.", expression: "guilty" },
    { who: "babah", text: "Ha, alang-alang Qish ada ni, tolong Babah kejap.", expression: "happy" },
    { who: "babah", text: "Tadi Babah kelam-kabut buat kerja lain. Kerja biasa! Bukan kerja rahsia.", expression: "guilty" },
    { who: "babah", text: "Lepas tu tools Babah tercicir merata-rata satu airport.", expression: "deadpan" },
    { who: "babah", text: "Tanpa tools tu Babah tak boleh tutup enjin kapal ni. Tolong kutip, boleh?", expression: "thinking" },
    { who: "narrator", text: "Kumpul semua tools Babah. Cari cahaya kuning!" },
  ] as Line[],
  remind: (got: number, need: number): Line[] => [
    got === 0
      ? { who: "babah", text: "Belum jumpa satu pun? Cari cahaya kuning tu.", expression: "thinking" }
      : { who: "babah", text: `Dapat ${got}/${need} dah? Ada lagi tu. Spanar tork Babah tu mahal tau.`, expression: "thinking" },
    { who: "narrator", text: "Tools Babah tercicir merata: depan terminal, sekitar parking, sampai ke tepi landasan." },
  ],
  fix: [
      { who: "qish", text: "Babah! Semua tools dah jumpa!", expression: "excited" },
    { who: "babah", text: "Pandai anak Babah. Kejap, Babah ketatkan bolt terakhir...", expression: "happy" },
  ] as Line[],
  fixed: [
    { who: "babah", text: "Siap. Enjin elok, minyak penuh, cowling dah tutup.", expression: "happy" },
    { who: "qish", text: "Siapa nak bawa kapal ni?", expression: "thinking" },
    { who: "babah", text: "Pilot cuti hari ni. Qish la bawa. Senang je, macam bawa Myvi.", expression: "deadpan" },
    { who: "qish", text: "BABAH.", expression: "angry" },
    { who: "babah", text: "Cuba cari Faris dari atas. Mana tahu dari langit kakak boleh nampak dia. Babah teman naik kapal satu lagi.", expression: "guilty" },
  ] as Line[],
  ready: [
    { who: "babah", text: "Kapal dah siap. Enjin dah panas.", expression: "happy" },
    { who: "babah", text: "Faris? Tak nampak. Langsung. Sumpah.", expression: "guilty" },
  ] as Line[],
  /** Babah sending her off to fight Blep. */
  ask: { who: "babah", text: "Kapal dah ready nak berlepas. Nak cuba cari Faris dari langit?", expression: "happy" } as Line,
  sendoff: [
    { who: "babah", text: "Pakai tali pinggang. Jangan tekan butang merah.", expression: "thinking" },
    { who: "qish", text: "Butang merah tu apa?", expression: "thinking" },
    { who: "babah", text: "Babah pun tak pasti. Tu yang jangan tekan.", expression: "deadpan" },
    { who: "narrator", text: "Kapal dah ready nak berlepas. Babah akan pandu MALAS AIR dan tunjuk jalan dari atas." },
  ] as Line[],
  /** After the ending, at KLIA: the rematch goes through Babah. */
  again: { who: "babah", text: "Nak terbang lagi? Kapal Babah sentiasa siap untuk Qish.", expression: "happy" } as Line,
  notNow: [{ who: "babah", text: "Okay, cari Babah bila kakak dah ready. Kapal tunggu kat sini.", expression: "deadpan" }] as Line[],
  after: [
    { who: "babah", text: "Dah balik? Kapal Babah ok tak? ...Calar sikit takpe.", expression: "thinking" },
    { who: "babah", text: "Faris? Tak tahu. Kek takde. Belon pun takde. Padang tepi rumah pun takde apa-apa.", expression: "guilty" },
    { who: "narrator", text: "(Babah sangat tak pandai simpan rahsia.)" },
  ] as Line[],
  /** At the party on the padang, and back at KLIA after the ending. */
  party: [
    { who: "babah", text: "Selamat hari jadi, Qish.", expression: "love" },
    { who: "babah", text: "Babah dah tahu dari awal sebenarnya. Susah betul nak simpan rahsia dengan kamu ni.", expression: "happy" },
  ] as Line[],
};

/** Blep before Babah has closed up the engine. */
export const BLEP_NOT_READY: Line[] = [
  { who: "narrator", text: "Enjin kapal masih terbuka. Cakap dengan Babah dulu." },
];

/** Talking to a boss before collecting everything in its zone. */
export const bossCollectNotYet = (boss: string, name: string, got: number, need: number): Line[] => [
  { who: "narrator", text: `${boss} buat-buat tak nampak awak.` },
  { who: "narrator", text: `Kumpul semua ${name} kat sini dulu (${got}/${need}).` },
];

export const SKIP_LINES: Line[] = [{ who: "narrator", text: "Faris kata awak menang. Jangan bagitau sesiapa. 🤫" }];

export const BOSS_TALK: Record<BossId, { pre: Line[]; ask: string; win: Line[]; after?: Line[]; collect?: (got: number, need: number) => Line[] }> = {
  bowat: {
    collect: (got, need) => [
      { who: "bowat", text: "*PROT*", expression: "relief" },
      { who: "qish", text: "BOWAT! Keluar dari situ!", expression: "angry" },
      { who: "narrator", text: "Awan keliling Bowat tebal sangat. Tak boleh dekat." },
      { who: "narrator", text: `Sembur awan-awan kentut kat luar dulu, baru awan ni nipis (${got}/${need}).` },
    ],
    pre: [
      { who: "bowat", text: "*PROT*", expression: "relief" },
      { who: "qish", text: "BOWAT! Kenapa awak kentut kat semua orang kat sini??", expression: "angry" },
      { who: "qish", text: "Satu Bukit Bintang lari sebab awak! Monorel pun nyaris tak berhenti!", expression: "angry" },
      { who: "bowat", text: "...Bukan saya. Itu bau shawarma.", expression: "innocent" },
    ],
    ask: "Lawan Bowat?",
    win: [
      { who: "bowat", text: "...okay okay. Saya kalah.", expression: "defeated" },
      { who: "bowat", text: "Bukan saya yang kentut. 100% bukan saya. 0% bukti.", expression: "smug" },
      { who: "bowat", text: "Raja Nonchalant suruh saya jaga kad ni. Tapi saya lagi sayang awak. Nah.", expression: "love" },
    ],
    after: [
      { who: "bowat", text: "Mulai sekarang saya ikut awak. Jangan risau, saya kentut senyap je.", expression: "happy" },
      { who: "qish", text: "ITU YANG PALING BAHAYA!!", expression: "surprised" },
      { who: "qish", text: "Eh Bowat, awak nampak Faris tak?", expression: "thinking" },
      { who: "bowat", text: "...Saya tak boleh cakap. Raja Nonchalant pesan.", expression: "guilty" },
      { who: "qish", text: "Siapa Raja Nonchalant ni sebenarnya??", expression: "pout" },
    ],
  },
  bolat: {
    collect: (got, need) => got === 0 ? [
      { who: "narrator", text: "Busker tengah nyanyi. Rambut kerinting... spek... baju Pepe..." },
      { who: "qish", text: "FARIS?!", expression: "surprised" },
      { who: "narrator", text: "Bukan. Tu cover band Luqman Podolski." },
      { who: "bolat", text: "Psst. Saya ni Bolat. Suara dalam hati awak yang nak dimanja tu." },
      { who: "qish", text: "Oh. Diri dalaman saya pun keluar jalan-jalan kat sini?", expression: "surprised" },
      { who: "bolat", text: `Mimpi kan. Saya tulis ${need} kertas request, tapi angin tiup masuk crowd. Tolong kutip?` },
    ] : [{ who: "bolat", text: `Dah jumpa ${got}/${need}. Lagi ${need - got}, lepas tu kita ikut rentak!` }],
    pre: [
      { who: "bolat", text: "Semua kertas dah ada. Rasa nak menari atas pentas?" },
      { who: "bolat", text: "Gerakkan hati atas atau bawah. Pilih Kiss, Cuddle atau Peluk, kemudian tekan A ikut rentak." },
      { who: "qish", text: "Okay. Sekali-sekala layan hati sendiri.", expression: "shy" },
    ],
    ask: "Rasa nak menari atas pentas?",
    win: [
      { who: "narrator", text: "Satu Corbel happy!" },
      { who: "bolat", text: "Hati pun dah happy. Jom sambung cari Faris." },
    ],
  },
  snorlax: {
    collect: (got, need) =>
      got === 0
        ? [
            { who: "narrator", text: "Ada sesuatu yang sangat besar tengah tidur atas tikar picnic, menghalang jambatan." },
            { who: "qish", text: "...Kejap. Itu saya ke?? Snorlax Twin?!", expression: "surprised" },
            { who: "snorlax", text: "Zzz... bunga... lily... Zzz..." },
            { who: "qish", text: "Dia mengigau pasal lily. Bunga favourite saya tu.", expression: "happy" },
            { who: "narrator", text: "Banyak lily kat tengah tasik. Naik sampan kat jeti, petik enam kuntum." },
          ]
        : [
            { who: "snorlax", text: "Zzz... lily... lagi... Zzz..." },
            { who: "qish", text: `Baru ${got}/${need}. Kena petik lagi kat tengah tasik.`, expression: "thinking" },
          ],
    pre: [
      { who: "qish", text: "Snorlax Twin. Nah, enam kuntum lily.", expression: "happy" },
      { who: "narrator", text: "Hidung besar tu kembang kempis... bau wangi... sebelah mata terbuka." },
      { who: "snorlax", text: "...Wangi. Tapi saya LAPAR." },
      { who: "qish", text: "Of course. Okay. Kena bagi makan.", expression: "smug" },
    ],
    ask: "Bagi Snorlax Twin makan?",
    win: [
      { who: "snorlax", text: "*nyam nyam* ...daging salai, kek mango, Dubuyo, malatang..." },
      { who: "snorlax", text: "Okay saya dah kenyang. Lily tu simpan, cantik. Lalu la. Zzz..." },
      { who: "qish", text: "Sama macam saya lepas makan.", expression: "laugh" },
    ],
  },
  blep: {
    pre: [
      { who: "babah", text: "Ikut kapal Babah. Kita cuba cari Faris dari langit.", expression: "happy" },
      { who: "qish", text: "Okay Babah. Kakak ready!", expression: "excited" },
    ],
    ask: "Berlepas dengan Babah?",
    win: [
      { who: "babah", text: "Pandai kakak bawa kapal! Boleh jadi pilot dah ni.", expression: "happy" },
      { who: "babah", text: "Babah jumpa kad Blep ni dalam kokpit. Simpan elok-elok.", expression: "thinking" },
      { who: "qish", text: "Tak nampak Faris lagi... cuba cari kat tempat seterusnya pula.", expression: "thinking" },
    ],
  },
  megabowat: {
    collect: (got, need) => [
      { who: "bowat", text: "*nyom*", expression: "nyom" },
      { who: "maitre", text: "Mademoiselle, sloth ini dah duduk di meja 8 cik. Saya tak berani halau. Dia... menggigit." },
      { who: "maitre", text: "Tapi dapur tak benarkan hidang lagi. Ehem. Hutang dia kat bandar ni belum langsai." },
      { who: "qish", text: `Resit Bowat baru ${got}/${need}. Kena settle semua dulu.`, expression: "thinking" },
    ],
    pre: [
      { who: "narrator", text: "Bowat duduk di meja 8. Depan dia, sepinggan lasagna." },
      { who: "qish", text: "Bowat. Itu lasagna first date saya.", expression: "angry" },
      { who: "bowat", text: "...nyom.", expression: "nyom" },
      { who: "narrator", text: "Kek mango. Ayam gepuk. Malatang. Dubuyo. McD. Daging salai. Cookies. Dan sekarang lasagna." },
      { who: "narrator", text: "Perut Bowat mula bercahaya!" },
      { who: "narrator", text: "Bowat sedang evolve!" },
      { who: "megabowat", text: "MAKAN BANYAK!!" },
      { who: "narrator", text: "Mega Bowat terbang masuk dapur Cosy Place. Chef menjerit dari dalam." },
      { who: "qish", text: "Bowat, jangan habiskan cookies chef!!", expression: "worried" },
    ],
    ask: "Kejar Mega Bowat ke dapur?",
    win: [
      { who: "megabowat", text: "*garu ontot* ...okay saya kenyang." },
      { who: "megabowat", text: "PROT." },
      { who: "qish", text: "BOWAT!!", expression: "angry" },
    ],
    after: [
      { who: "bowat", text: "*terbaring, perut ke atas* ...saya dah kecik balik.", expression: "defeated" },
      { who: "maitre", text: "Mademoiselle. Untuk kerosakan dapur..." },
      { who: "narrator", text: "Maître d' hulur resit. Panjang. Sangat panjang. Sampai ke lantai." },
      { who: "qish", text: "...", expression: "worried" },
      { who: "maitre", text: "Bergurau. Encik rambut kerinting dah bayar semua petang tadi. Termasuk dapur." },
      { who: "qish", text: "Faris...?", expression: "surprised" },
      { who: "maitre", text: "Dia pesan satu je: jangan bagi cik lapar." },
      { who: "qish", text: "...Dia ni. Tak reti cakap, tapi reti tempah meja.", expression: "love" },
      { who: "bowat", text: "Jom. Jalan keluar kat atas kanan. Photobooth.", expression: "happy" },
    ],
  },
  bolatex: {
    collect: (got, need) => got === 0 ? [
      { who: "narrator", text: "Kamera besar tu berbunyi. Lampu pada lensanya berkelip." },
      { who: "qish", text: "Eh, ni lukisan saya! Faris dengan saya.", expression: "surprised" },
      { who: "bolatex", text: "Selamat datang ke FotoBooth! Saya kamera yang jaga semua strip korang." },
      { who: "bolatex", text: "Tadi flash kuat sangat, enam strip terbang. Kejar ikut jalan sampai dia tersangkut!" },
    ] : [{ who: "bolatex", text: `Dah dapat ${got}/${need}. Lagi ${need - got}! Ikut cahaya kuning sepanjang jalan.` }],
    pre: [
      { who: "bolatex", text: "Cukup sepuluh balik! Terima kasih, Qish." },
      { who: "bolatex", text: "Gambar yang hilang dari bilik awak tu saya simpankan. Jom padankan kenangan korang." },
    ],
    ask: "Susun semula kenangan?",
    win: [
      { who: "bolatex", text: "Semua kenangan dah tersusun. Good memories ♡" },
      { who: "bolatex", text: "Saya simpankan strip ni elok-elok, lepas tu pos balik ke rumah awak." },
      { who: "qish", text: "Terima kasih, kamera besar. Jangan flash sampai terbang lagi tau.", expression: "happy" },
    ],
  },
  qishex: {
    pre: [
      { who: "narrator", text: "Qish berdiri kat garisan START. Badan dah panas, kasut dah ikat." },
      { who: "mystery", text: "FAT ASS!" },
      { who: "qish", text: "...Siapa cakap tu?!", expression: "angry" },
      { who: "narrator", text: "Ada orang pecut ke arah Perdana Putra sambil jerit, rambut berkibar. Muka dia... macam Qish." },
      { who: "mystery", text: "LAPAN PULUH ENAM KG! FAT ASS!" },
      { who: "qish", text: "SAYA DAH 80 LA! SINI AWAK!", expression: "angry" },
      { who: "narrator", text: "Angat Kuyush diaktifkan!" },
    ],
    ask: "Kejar dia?",
    win: [
      { who: "narrator", text: "Satu Putrajaya berhenti jogging. Semua orang lupa matematik dan jerit:" },
      { who: "mystery", text: "SHE'S SO TINY!" },
      { who: "qish", text: "Tau pun.", expression: "smug" },
    ],
  },
  finale: {
    pre: [
      { who: "faris", text: "Akhirnya awak sampai juga, Qish.", expression: "sleepy" },
      { who: "qish", text: "FARIS?! Awak pergi mana?! Semalam \"k bye\" je, lepas tu hilang!", expression: "angry" },
      { who: "faris", text: "Alamak.", expression: "surprised" },
      { who: "faris", text: "Saya sekarang Raja Nonchalant. Penjaga kad terakhir.", expression: "smug" },
      { who: "faris", text: "Kalau nak tahu kenapa, kalahkan saya dulu.", expression: "smug" },
    ],
    ask: "Lawan Raja Nonchalant?",
    win: [
      { who: "faris", text: "Okay okay... awak menang. Macam biasa.", expression: "defeated" },
      { who: "faris", text: "Sekarang bangun, sayang. Ada orang tunggu awak.", expression: "love" },
    ],
  },
};

// ---------------------------------------------------------------- Litar Sepang (all draft)

/** First steps into Litar Sepang: thunder, F1 engines, and the PA calling for the owner of a red Myvi. */
export const SP_ARRIVE: Line[] = [
  { who: "narrator", text: "Guruh berdentum jauh. Langit Sepang dah kelabu, tapi bunyi enjin F1 lagi kuat dari guruh." },
  { who: "qish", text: "Litar Sepang... sebelah rumah saya je ni. Dia lari dekat-dekat je rupanya.", expression: "thinking" },
  { who: "pa", text: "Perhatian kepada semua penonton. Pemilik Myvi merah, tudung warna mauve..." },
  { who: "qish", text: "Eh. Saya ke?", expression: "surprised" },
  { who: "pa", text: "Raja Nonchalant sedang menunggu anda di podium, atas bangunan pit. Beliau pesan, beliau terlalu malas untuk turun." },
  { who: "pa", text: "Podium ialah kawasan ALL ACCESS. Enam pas paddock anda telah ditinggalkan dengan enam orang di seluruh litar. Sekian, terima kasih." },
  { who: "qish", text: "Dia tinggalkan pas saya dengan ORANG LAIN?! Malas punya Raja.", expression: "angry" },
  { who: "narrator", text: "Kumpul 6 pas paddock. Cari orang yang ada tanda ! dan cahaya kuning yang menegak ke langit." },
];

/** Each pass, from the person Raja Nonchalant left it with (order of SP_GIVERS). */
export const PASS_TALK: Line[][] = [
  [
    { who: "kaktiket", text: "Adik! Tudung mauve, Myvi merah... Ha, padan dengan gambar ni." },
    { who: "narrator", text: "Kak Tiket tunjuk satu lukisan atas kertas. Bentuk orang. Mungkin. Bawah dia tulis: \"TUDUNG MAUVE. COMEL. BAGI PAS.\"" },
    { who: "qish", text: "...Ni lukisan Faris. Teruk gila. Tapi okay la, comel sikit.", expression: "shy" },
    { who: "kaktiket", text: "Encik rambut kerinting tu tinggalkan pagi tadi. Lepas tu dia duduk kat kerusi plastik tu, tertidur sejam." },
    { who: "narrator", text: "🎫 Dapat PAS MASUK." },
  ],
  [
    { who: "abangmerch", text: "Topi MALAS RACING! Baju MALAS RACING! Bantal MALAS RACING!" },
    { who: "qish", text: "Siapa beli bantal kat litar F1?", expression: "thinking" },
    { who: "abangmerch", text: "Bos MALAS RACING sendiri. Tiga biji. Dia kata untuk \"strategi rehat\"." },
    { who: "abangmerch", text: "Oh ya, ni pas adik. Dia pesan satu je: kalau adik nak apa-apa kat sini, ambil je. Dia dah bayar." },
    { who: "narrator", text: "🧢 Dapat PAS FAN ZONE." },
  ],
  [
    { who: "ketuakrew", text: "Selamat datang ke garaj MALAS RACING. Kereta kami tak keluar langsung hari ni." },
    { who: "qish", text: "Kenapa?", expression: "thinking" },
    { who: "ketuakrew", text: "Driver kami cakap nak \"rehat mata\" kat podium. Dari pagi." },
    { who: "ketuakrew", text: "Krew kami tukar tayar dua saat. Tidur? Dua jam. Tengok la tu kat sofa belakang." },
    { who: "ketuakrew", text: "Ni pas adik. Bos pesan: \"Kalau dia sampai pit, maknanya dia betul-betul cari saya.\"" },
    { who: "qish", text: "...Mestilah saya cari.", expression: "love" },
    { who: "narrator", text: "🔧 Dapat PAS PIT LANE." },
  ],
  [
    { who: "usher", text: "Tiket grandstand? ...Eh, adik ni yang dalam banner tu!" },
    { who: "qish", text: "Banner apa?", expression: "thinking" },
    { who: "narrator", text: "Kat depan grandstand tergantung dua banner besar: SEPANG BADDIE ♥ dan LABU LANJUT QUEEN." },
    { who: "qish", text: "...Malu la!", expression: "shy" },
    { who: "usher", text: "Encik rambut kerinting yang gantung pagi tadi. Lama dia ikat, senget-senget. Lepas tu dia tertidur kat kerusi C-12." },
    { who: "narrator", text: "🎟️ Dapat PAS GRANDSTAND." },
  ],
  [
    { who: "marshal", text: "Bendera hijau, jalan. Kuning, hati-hati. Biru, bagi laluan." },
    { who: "marshal", text: "Bendera putih maknanya menyerah. Raja Nonchalant pun ada satu. Tapi dia malas nak angkat." },
    { who: "marshal", text: "Ni pas adik. Dia pesan: \"Kalau dia sampai hairpin, maknanya dia tak give up.\"" },
    { who: "qish", text: "Give up? Dia tak kenal saya ke.", expression: "smug" },
    { who: "narrator", text: "🏁 Dapat PAS MARSHAL." },
  ],
  [
    { who: "pengulas", text: "DAN KITA ADA BERITA TERKINI! Seorang gadis bertudung mauve sedang menjelajah litar!" },
    { who: "qish", text: "Saya ke tu?", expression: "surprised" },
    { who: "pengulas", text: "Sumber kami: Raja Nonchalant dah duduk atas podium sejak pagi. Bila ditanya kenapa, beliau jawab..." },
    { who: "pengulas", text: "\"k.\"" },
    { who: "qish", text: "Typical.", expression: "smug" },
    { who: "pengulas", text: "Ni pas media, cik. Penonton sekalian, dia makin dekat!" },
    { who: "narrator", text: "🎙️ Dapat PAS MEDIA." },
  ],
];

/** The VIP rope at the podium stairs. */
export const spVipNotYet = (got: number, need: number): Line[] => [
  { who: "bouncer", text: "Maaf kak. Podium kawasan ALL ACCESS." },
  { who: "bouncer", text: `Pas akak baru ${got}/${need}. Raja Nonchalant pesan, enam-enam kena ada. Dia kata \"peraturan\".` },
  { who: "qish", text: "Sejak bila dia ada peraturan? Buat peraturan pun dia malas.", expression: "smug" },
];
export const SP_VIP_OPEN: Line[] = [
  { who: "bouncer", text: "Enam pas. Lengkap. ALL ACCESS." },
  { who: "narrator", text: "Abang Bouncer cabut tali baldu merah." },
  { who: "bouncer", text: "Dia kat atas. Dah tertidur dua kali sementara tunggu akak." },
  { who: "qish", text: "Dua kali?!", expression: "surprised" },
];
export const spVipAfter = (clear: boolean): Line[] => [
  { who: "bouncer", text: clear ? "Tahniah kak. Hujan pun dah berhenti." : "Silakan kak. Hati-hati, tangga licin." },
];

/** The garages, from the paddock side (team index in TEAMS). */
export const spGarageLines = (team: number): Line[] =>
  (<Record<number, Line[]>>{
    0: [
      { who: "sign", text: "BOLAT GP · ada sticker hati kat semua tayar" },
      { who: "qish", text: "Team favourite saya. Obviously.", expression: "smug" },
    ],
    1: [
      { who: "sign", text: "OMEY RACING · syarat masuk team: mesti comel" },
      { who: "qish", text: "Patut la krew dia comel-comel.", expression: "happy" },
    ],
    4: [
      { who: "sign", text: "ALAMAK RACING · strategi: buat-buat tak tahu" },
      { who: "qish", text: "Macam kenal je strategi ni.", expression: "smug" },
    ],
    5: [
      { who: "sign", text: "KENTOT BUSHUK · enjin paling senyap dalam grid" },
      { who: "qish", text: "Senyap... tapi bau dia sampai sini.", expression: "laugh" },
    ],
    6: [
      { who: "sign", text: "SAMBAL GEPUK · pedas level 10, ekzos keluar asap merah" },
      { who: "qish", text: "Level 10? Orang Sepang makan level 10 untuk sarapan.", expression: "smug" },
    ],
    7: [
      { who: "sign", text: "ANTI EMOK · kereta paling ringan dalam grid" },
      { who: "narrator", text: "Driver dia tak makan nasi seminggu sebelum race." },
      { who: "qish", text: "Respect.", expression: "smug" },
    ],
  })[team] ?? [{ who: "qish", text: "Garaj F1. Bersih gila, boleh makan atas lantai.", expression: "surprised" }];
