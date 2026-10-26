import type { BossId } from "../content/bosses";
import { BolatRhythm } from "./bolat/bolatRhythm";
import { BolatexMemory } from "./bolatex/bolatexMemory";
import { BlepShooter } from "./blep/blepShooter";
import { BowatBeach } from "./bowat/bowatBeach";
import { FinaleBattle } from "./finale/finaleBattle";
import type { MinigameDef } from "./framework";
import { MegaBowatFlappy } from "./megabowat/megaBowatFlappy";
import { createQishRunner } from "./runner/qishRunner";
import { SnorlaxCatcher } from "./snorlax/snorlaxCatcher";

// One entry per boss. placeholder.ts is kept for prototyping new minigames:
// { scene: PlaceholderScene, sceneKey: "Placeholder", plan: "..." }.


export const MINIGAMES: Record<BossId, MinigameDef> = {
  bowat: {
    id: "bowat",
    title: "Bowat",
    place: "Boss 1 · Bukit Bintang",
    howTo: ["← → gerak · A lompat", "Pijak kepala Bowat 3 kali", "Elak awan kentut! 💨"],
    scene: BowatBeach,
    sceneKey: "BowatBeach",
    color: "#7cc8f2",
  },
  bolat: {
    id: "bolat",
    title: "Bolat",
    place: "Boss 2 · Pentas Lorbel",
    howTo: ["↑ ↓ pilih Kiss, Cuddle atau Peluk", "Padankan lorong hati, tekan A ikut rentak", "Penuhi separuh request untuk menang"],
    scene: BolatRhythm,
    sceneKey: "BolatRhythm",
    color: "#ff8fb1",
  },

  snorlax: {
    id: "snorlax",
    title: "Snorlax Twin",
    place: "Boss 3 · Lakefront",
    howTo: ["← → gerak (atau seret jari)", "Tangkap makanan kegemaran dia 🍖🍰🍜🍢🍪", "Elak jam loceng ⏰ · bagi 12 sampai kenyang"],
    scene: SnorlaxCatcher,
    sceneKey: "SnorlaxCatcher",
    color: "#5aa844",
  },

  blep: {
    id: "blep",
    title: "Babah",
    place: "Boss 4 · KLIA",
    howTo: ["Arrow gerak kapal terbang (atau seret jari)", "Tekan A untuk tembak hati · elak gelembung zzz", "Ikut latihan Babah sampai bar MALAS AIR habis"],
    scene: BlepShooter,
    sceneKey: "BlepShooter",
    color: "#e0784a",
  },

  megabowat: {
    id: "megabowat",
    title: "Mega Bowat",
    place: "Boss 5 · Nyomnyom City",
    howTo: ["Tekan A (atau tap) untuk PROT ke atas 💨", "Makan 10 cookies 🍪", "Langgar periuk cuma melantun"],
    scene: MegaBowatFlappy,
    sceneKey: "MegaBowatFlappy",
    color: "#c0392b",
  },

  bolatex: {
    id: "bolatex",
    title: "Bolat 2",
    place: "Boss 6 · Galeri Memori",
    howTo: ["Arrow + A untuk buka kad (atau tap)", "Padankan photo strip yang sama", "Tiada had cubaan ♡"],
    scene: BolatexMemory,
    sceneKey: "BolatexMemory",
    color: "#f2b705",
  },

  qishex: {
    id: "qishex",
    title: "Myself",
    place: "Boss 7 · Persiaran Perdana, Putrajaya",
    howTo: ["← → tukar lorong", "A bila papan usikan dekat → jadi SO TINY!", "Kumpul 10 SO TINY!"],
    custom: createQishRunner,
    color: "#e67e22",
  },

  finale: {
    id: "finale",
    title: "Raja Nonchalant",
    place: "Finale · Litar Sepang",
    howTo: ["Pilih move dari kad yang awak kumpul", "Arrow + A untuk pilih, atau tap terus", "Jangan risau, Qish takkan kalah 💛"],
    scene: FinaleBattle,
    sceneKey: "FinaleBattle",
    color: "#ff9a5a",
  },
};
