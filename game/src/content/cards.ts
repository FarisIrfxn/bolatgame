// Card numbers match the printed cards in /cards (1.png .. 8.png).
export const CARDS: Record<number, { name: string; boss: string }> = {
  1: { name: "Blep", boss: "KLIA" },
  2: { name: "Mega Bowat", boss: "Dapur Cosy Place" },
  3: { name: "Bolat", boss: "Lorbel" },
  4: { name: "Qish ex", boss: "Putrajaya" },
  5: { name: "Bowat", boss: "Bukit Bintang" },
  6: { name: "Bolat ex", boss: "Galeri Memori" },
  7: { name: "Snorlax Twin", boss: "Lakefront" },
  8: { name: "Mega Qish ex", boss: "Litar Sepang" },
};

export const cardImage = (n: number) => `/assets/cards/${n}.webp`;
export const CARD_BACK = "/assets/cards/back.webp";
