import type { ZoneId } from "../overworld/zone";

export type BossId = "bowat" | "bolat" | "snorlax" | "blep" | "megabowat" | "bolatex" | "qishex" | "finale";

/** Boss order follows the card evolution chains: Bowat→Mega Bowat, Bolat→Bolat ex, Snorlax Twin→Mega Qish ex. */
export const BOSSES: Record<BossId, { card: number; zone: ZoneId; name: string }> = {
  bowat: { card: 5, zone: "sunway", name: "Bowat" },
  // Bolat fights on the Lorbel busking stage; Bolat ex keeps the Galeri Memori in the photobooth lane.
  bolat: { card: 3, zone: "galeri", name: "Bolat" },
  snorlax: { card: 7, zone: "dusun", name: "Snorlax Twin" },
  blep: { card: 1, zone: "angkasa", name: "Babah" },
  megabowat: { card: 2, zone: "cosyplace", name: "Mega Bowat" },
  bolatex: { card: 6, zone: "photobooth", name: "Bolat 2" },
  qishex: { card: 4, zone: "bukit", name: "Myself" },
  finale: { card: 8, zone: "sepang", name: "Raja Nonchalant" },
};

export const bossOfZone = (zone: ZoneId) => (Object.keys(BOSSES) as BossId[]).find((id) => BOSSES[id].zone === zone);
