import type { Line } from "../ui/dialog";

// Optional personal art: adding either file under ref/ includes it in the next build.
// Glob keeps the game playable while Faris is preparing those images.
const personalArt = import.meta.glob<string>("../../../ref/{kad-rahsia,tamat}.{png,jpg,jpeg,webp}", { eager: true, query: "?url", import: "default" });
const suppliedArt = (name: string) => Object.entries(personalArt).find(([path]) => path.split("/").pop()?.split(".")[0] === name)?.[1];

// Ending content. Everything here is a DRAFT in Faris's voice: Faris, edit freely.
// Generated art sources/prompts: art/ending-qc-2026-10-27/README.md and art/ending-comic-2026-10-27/README.md.

/** Outside the house, right after "SURPRISE!". */
export const PARTY: Line[] = [
  { who: "farisbiasa", text: "Selamat hari lahir ke-26, sayang.", expression: "love" },
  { who: "qish", text: "BOWAT! Awak kat sini rupanya!", expression: "excited" },
  { who: "bowat", text: "*PROT* (kentut gembira)", expression: "relief" },
  { who: "slothfaris", text: "Kitorang semua tolong Faris siapkan dari semalam!", expression: "laugh" },
  { who: "qish", text: "Korang... semua ni plan ke dari semalam??", expression: "love" },
  { who: "farisbiasa", text: "Saya memang malas. Kecuali untuk bolat.", expression: "shy" },
  { who: "farisbiasa", text: "Okay, tiup lilin dulu!", expression: "happy" },
];

export const CANDLES = 26;
export const BIRTHDAY_BANNER = "Happy 26th Birthday,<br>Alya Balqis! 💛";

export interface Slide {
  img?: string;
  /** A caption on illustrated postcards so generated art is never passed off as a real photo. */
  mediaLabel?: string;
  /** Shown in a dashed frame when the real photo isn't added yet. */
  placeholder?: string;
  /** Show the photobooth strips montage instead of one image. */
  strips?: boolean;
  caption: string;
}

export const KISAH_KITA: Slide[] = [
  { img: "/assets/chars/qish_front.png", caption: "Dulu, kita kenal kat tempat kerja. Awak budak baru yang pandai melukis." },
  { img: "/assets/chars/faris_front.png", caption: "Awak jumpa seorang Faris. Yang nonchalant, avoidant dan malas." },
  { img: "/assets/ending/memory-friends.webp", caption: "Mula-mula kawan. Lepas tu rapat. Lepas tu... 8.8." },
  { img: "/assets/ui/cosy-memory.webp", mediaLabel: "Cosy Place · memori dalam ilustrasi", caption: "First date kita: Cosy Place, Wangsa Maju." },
  { img: "/assets/ui/sunway-memory.webp", mediaLabel: "Sunway Lagoon · memori dalam ilustrasi", caption: "Sunway Lagoon, dari buka sampai tutup. (Dan ya, itu singa. Bukan beruang.)" },
  { img: "/assets/story/listening_night.webp", caption: "Album listening night. Saya menang PS4 sebab muka saya sama Luqman Podolski." },
  { strips: true, caption: "Dan photobooth. Banyak. Sangat. Photobooth." },
  { caption: "Hari ni 3.11. Awak 26." },
  { caption: "Terima kasih sebab jadi Player 2 saya.\n\nJom sambung adventure seterusnya." },
];

/** After Kisah Kita, before the letter: the avoidant one finally talks. */
export const CONFESS: Line[] = [
  { who: "farisbiasa", text: "Sayang. Pasal semalam...", expression: "sorry" },
  { who: "farisbiasa", text: "Sorry saya \"k bye\" je. Bukan sebab saya tak kisah.", expression: "sorry" },
  { who: "farisbiasa", text: "Saya memang tak pandai cakap benda-benda macam ni.", expression: "shy" },
  { who: "farisbiasa", text: "So saya buat satu game.", expression: "shy" },
  { who: "qish", text: "...Faris.", expression: "cry" },
  { who: "farisbiasa", text: "Ada satu lagi. Yang ni saya tulis betul-betul.", expression: "love" },
];

/** A complete editable draft in Faris's voice, based on their established story. */
export const LETTER = {
  greeting: "Sayang,",
  body: `Selamat hari lahir yang ke-26, sayang.

Saya fikir lama nak bagi awak apa. Akhirnya saya buat satu dunia yang penuh dengan benda pasal kita. Myvi merah awak, photobooth kita, lasagna first date, Bowat yang tak habis-habis kentut. Semua benda kecil yang buat saya teringat kat awak.

Saya tahu saya selalu nampak nonchalant. Kadang-kadang saya malas, kadang-kadang saya mengelak bila tak tahu nak cakap apa. Awak merajuk, saya boleh pula cakap “k bye”. Saya tahu benda tu boleh buat awak rasa macam awak kena pujuk hati sendiri. Saya minta maaf, sayang.

Saya sayang awak. Ayat pendek je, tapi saya tak nak awak kena teka lagi. Saya nak belajar dengar sampai habis, cakap apa yang saya rasa, dan hadir waktu awak perlukan saya. Saya tak akan terus pandai, tapi saya nak cuba. Untuk awak. Untuk kita.

Terima kasih sebab bagi saya masuk dalam dunia awak. Sebab melukis kita jadi dua orang doodle yang comel. Sebab ajak saya ambil gambar lagi walaupun saya malas. Sebab main game random dengan saya, asalkan dapat main sama-sama.

Sejak 8.8, banyak kenangan kecil kita dah jadi benda yang paling saya sayang. Saya nak lagi. Lagi strip photobooth, lagi jalan-jalan, lagi makan sama-sama. Lagi hari biasa yang jadi best sebab ada awak.

Hari ni awak tak perlu kejar saya sampai hujung pulau. Saya ada kat sini. Game ni cara saya mula cakap, lepas ni saya nak sambung cakap sendiri.

Happy birthday, Alya Balqis. Terima kasih sebab jadi Player 2 saya.

Jom sambung adventure kita, sayang.`,
  signoff: "Sayang awak selalu,\nFaris (Raja Nonchalant) 🦥",
};

/** The secret 9th card, with the real couple reinterpreted as a happy cartoon. */
export const CARD_9 = {
  name: "Faris & Qish",
  rarity: "SECRET RARE",
  hp: "∞",
  art: suppliedArt("kad-rahsia") ?? "/assets/ending/couple-comic.webp",
  move: "Selamanya",
  moveText: "Bersama sampai bila-bila. Kad ni tak boleh retreat.",
  footer: "8 kad untuk 8.8 · kad ke-9 untuk masa depan",
};

export const THE_END = {
  art: suppliedArt("tamat") ?? "/assets/ending/ensemble-comic.webp",
  title: "Tamat",
  sub: "Selamat hari lahir, sayang. 💛",
  hint: "Click to continue",
};
