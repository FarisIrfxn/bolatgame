import { input } from "../core/input";
import { onFrame } from "../core/loop";
import { sfx } from "../core/sfx";
import { el, ui } from "./dom";

export type Speaker =
  | "qish"
  | "bowat"
  | "slothfaris"
  | "faris"
  | "farisbiasa"
  | "bolatdream"
  | "bolat"
  | "snorlax"
  | "blep"
  | "megabowat"
  | "bolatex"
  | "babah"
  | "pakcikkek"
  | "pakciksampan"
  | "pakcikpancing"
  | "kakbatik"
  | "makcikpicnic"
  | "abangshawarma"
  | "kakkedai"
  | "abangvinyl"
  | "pakcik"
  | "kakkek"
  | "abanggepuk"
  | "auntiemala"
  | "abangdubuyo"
  | "crewmcd"
  | "pakciksalai"
  | "kakcookies"
  | "maitre"
  | "chef"
  | "kaktiket"
  | "abangmerch"
  | "ketuakrew"
  | "usher"
  | "marshal"
  | "pengulas"
  | "bouncer"
  | "abangponcho"
  | "pa"
  | "orang"
  | "mystery"
  | "narrator"
  | "sign";

export interface Line {
  who: Speaker;
  text: string;
  /** Optional art expression; speakers without that art keep their normal portrait. */
  expression?: Expression;
}

/** Qish's dialogue faces (`qish_portrait_<name>.webp`), picked per line to suit the moment. */
export const EXPRESSIONS = [
  "excited", // mata besar bersinar, tangan di pipi: teruja
  "happy", // senyum manis, mata tertutup: gembira, lega
  "laugh", // gelak besar
  "shy", // blushing, malu-malu
  "love", // mata bersinar, tangan digenggam: terharu, sayang
  "smug", // senyum nakal, kening terangkat: mengusik
  "surprised", // terkejut, mulut O
  "thinking", // jari di dagu: berfikir, ingin tahu
  "worried", // risau, peluh kecil
  "sad", // sedih
  "cry", // menangis
  "pout", // merajuk, pipi kembung
  "angry", // geram (comel)
  "sleepy", // mengantuk, menguap
] as const;

/** Encik Sloth's faces (`slothfaris_portrait_<name>.webp`): a slow, chill neighbour. */
export const SLOTH_EXPRESSIONS = [
  "happy", // senyum puas, mata tertutup
  "laugh", // gelak besar
  "sleepy", // mata layu, buih di hidung
  "smug", // senyum senget, macam tahu rahsia
  "surprised", // terkejut (lambat), mulut O
  "worried", // risau, peluh kecil
  "deadpan", // muka kosong tak terkesan: "...Bowat."
  "wink", // kenyit mata
  "love", // mata berkaca, hati kecil: terharu
] as const;
/** Bowat's faces (`bowat_portrait_<name>.webp`): a lazy, hungry, gassy sloth who denies everything. */
export const BOWAT_EXPRESSIONS = [
  "sleepy", // mata layu, buih hingus, Zzz
  "nyom", // pipi penuh, pegang cookie
  "sniff", // hidu bau makanan, hidung ke atas
  "innocent", // pandang tepi, bersiul: "Bukan saya."
  "relief", // lega lepas PROT, awan hijau kecil
  "guilty", // tertangkap, peluh
  "happy", // senyum, mata tertutup
  "love", // mata berkaca, hati: "saya lagi sayang awak"
  "defeated", // mengaku kalah, senyum pasrah
  "surprised", // terkejut, mulut O
  "smug", // senyum senget: "0% bukti."
] as const;
/** Faris (both ordinary and Raja Nonchalant) uses one portrait identity. */
export const FARIS_EXPRESSIONS = ["happy", "smug", "surprised", "deadpan", "sleepy", "shy", "sorry", "love", "defeated"] as const;
/** Babah's secret-keeping face is deliberately easy to read. */
export const BABAH_EXPRESSIONS = ["happy", "surprised", "guilty", "thinking", "deadpan", "love"] as const;
export type Expression =
  | (typeof EXPRESSIONS)[number]
  | (typeof SLOTH_EXPRESSIONS)[number]
  | (typeof BOWAT_EXPRESSIONS)[number]
  | (typeof FARIS_EXPRESSIONS)[number]
  | (typeof BABAH_EXPRESSIONS)[number];

type SpeakerArt = {
  name: string;
  /** Alternate names/forms share one figure on the dialogue stage. */
  character?: Speaker;
  portrait?: string;
  expressions?: Partial<Record<NonNullable<Line["expression"]>, string>>;
};

const SPEAKERS: Record<Speaker, SpeakerArt> = {
  qish: {
    name: "Qish",
    portrait: "/assets/chars/qish_portrait_normal.webp",
    expressions: Object.fromEntries(EXPRESSIONS.map((e) => [e, `/assets/chars/qish_portrait_${e}.webp`])),
  },
  bowat: {
    name: "Bowat",
    portrait: "/assets/chars/bowat_portrait_normal.webp",
    expressions: Object.fromEntries(BOWAT_EXPRESSIONS.map((e) => [e, `/assets/chars/bowat_portrait_${e}.webp`])),
  },
  slothfaris: {
    name: "Encik Sloth",
    portrait: "/assets/chars/slothfaris_portrait_normal.webp",
    expressions: Object.fromEntries(SLOTH_EXPRESSIONS.map((e) => [e, `/assets/chars/slothfaris_portrait_${e}.webp`])),
  },
  faris: {
    name: "Raja Nonchalant",
    portrait: "/assets/chars/faris_portrait_normal.webp",
    expressions: Object.fromEntries(FARIS_EXPRESSIONS.map((e) => [e, `/assets/chars/faris_portrait_${e}.webp`])),
  },
  // Plain Faris and Bolat, outside the Raja Nonchalant act (the dream and the end).
  farisbiasa: {
    name: "Faris", character: "faris",
    portrait: "/assets/chars/faris_portrait_normal.webp",
    expressions: Object.fromEntries(FARIS_EXPRESSIONS.map((e) => [e, `/assets/chars/faris_portrait_${e}.webp`])),
  },
  // No portrait: her only front doodle is laughing, and the dream turns sad.
  bolatdream: { name: "Qish", character: "qish", portrait: "/assets/chars/qish_portrait_normal.webp",
    expressions: Object.fromEntries(EXPRESSIONS.map((e) => [e, `/assets/chars/qish_portrait_${e}.webp`])) },
  // Bosses without art yet: name only until the art pass.
  bolat: { name: "Bolat · suara hati" },
  snorlax: { name: "Snorlax Twin" },
  blep: { name: "Blep" },
  megabowat: { name: "Mega Bowat", character: "bowat", portrait: "/assets/chars/bowat_front.png" },
  bolatex: { name: "Kamera besar" },
  babah: {
    name: "Babah",
    portrait: "/assets/chars/babah_portrait_normal.webp",
    expressions: Object.fromEntries(BABAH_EXPRESSIONS.map((e) => [e, `/assets/chars/babah_portrait_${e}.webp`])),
  },
  pakcikkek: { name: "Pakcik Kek" },
  pakciksampan: { name: "Pakcik Sampan" },
  pakcikpancing: { name: "Pakcik Pancing" },
  kakbatik: { name: "Kak Batik" },
  makcikpicnic: { name: "Makcik Picnic" },
  abangshawarma: { name: "Abang Shawarma" },
  kakkedai: { name: "Kak Kedai 24 Jam" },
  abangvinyl: { name: "Abang Vinyl" },
  pakcik: { name: "Pakcik" },
  // Nyomnyom City.
  kakkek: { name: "Kak Kek Mango" },
  abanggepuk: { name: "Abang Gepuk" },
  auntiemala: { name: "Auntie Malatang" },
  abangdubuyo: { name: "Abang Dubuyo" },
  crewmcd: { name: "Crew McD" },
  pakciksalai: { name: "Pakcik Salai" },
  kakcookies: { name: "Kak Cookies" },
  maitre: { name: "Maître d'" },
  chef: { name: "Chef Cosy Place" },
  // Litar Sepang.
  kaktiket: { name: "Kak Tiket" },
  abangmerch: { name: "Abang Merch" },
  ketuakrew: { name: "Ketua Krew MALAS RACING" },
  usher: { name: "Kak Usher" },
  marshal: { name: "Pakcik Marshal" },
  pengulas: { name: "Pengulas" },
  bouncer: { name: "Abang Bouncer" },
  abangponcho: { name: "Abang Baju Hujan" },
  pa: { name: "📢 Pengumuman" },
  orang: { name: "Orang ramai" },
  mystery: { name: "???" },
  narrator: { name: "" },
  sign: { name: "Papan tanda" },
};

let open = 0;

/** True while any dialog is on screen; scenes pause player control. */
export const dialogOpen = () => open > 0;

/* Visual-novel stage: the main cast (speakers with portraits) stand big behind the dialog box,
 * Qish on the left and everyone else on the right. Whoever is talking is lit; the rest sit in
 * shadow. The stage lingers for a moment after a say() ends so back-to-back calls in one scene
 * don't make it blink. */
let cast: { root: HTMLElement; left: HTMLElement; right: HTMLElement; figs: Map<Speaker, HTMLImageElement> } | null = null;
let castTimer = 0;
let lit = "";
/** The one partner shown on the right; it stays up (in shadow) while Qish or the narrator talks. */
let partner = "";

function openStage(lines: Line[]) {
  clearTimeout(castTimer);
  for (const line of lines) {
    const sp = SPEAKERS[line.who];
    if (!sp.portrait) continue;
    // Warm only the faces this conversation uses.
    const face = line.expression && sp.expressions?.[line.expression];
    if (face) new Image().src = face;
    if (!cast) {
      const root = el("div", "vn-stage");
      const left = el("div", "side left");
      const right = el("div", "side right");
      root.append(left, right);
      ui().appendChild(root);
      cast = { root, left, right, figs: new Map() };
      lit = "";
      partner = "";
    }
    const character = sp.character ?? line.who;
    if (cast.figs.has(character)) continue;
    const img = el("img", "vn-fig dim");
    img.src = sp.portrait;
    img.alt = sp.name;
    (character === "qish" ? cast.left : cast.right).appendChild(img);
    cast.figs.set(character, img);
    cast.root.dataset.n = String(cast.figs.size);
  }
}

/** Light up whoever is talking; narrators and portrait-less NPCs leave everyone in shadow. */
function spotlight(line: Line) {
  if (!cast) return;
  const sp = SPEAKERS[line.who];
  const character = sp.portrait ? sp.character ?? line.who : "";
  if (character && character !== "qish") partner = character;
  else if (!partner) partner = [...cast.figs.keys()].find((id) => id !== "qish") ?? "";
  for (const [id, img] of cast.figs) {
    if (id === character) {
      const expression = line.expression ? sp.expressions?.[line.expression] : undefined;
      const src = expression ?? sp.portrait!;
      if (img.getAttribute("src") !== src) img.src = src;
      img.alt = sp.name;
    }
    // One partner on the right at a time: three portraits used to overlap during the
    // birthday conversation. Qish keeps her place on the left.
    img.hidden = id !== "qish" && id !== partner;
    img.classList.toggle("dim", id !== character);
    img.classList.toggle("lit", id === character);
    if (id === character && lit !== character) {
      img.classList.remove("hop");
      void img.offsetWidth;
      img.classList.add("hop");
    }
  }
  lit = character;
  // Size by what is on stage, not by everyone who has spoken in this scene.
  cast.root.dataset.n = String([...cast.figs.values()].filter((img) => !img.hidden).length);
}

function closeStage() {
  clearTimeout(castTimer);
  castTimer = window.setTimeout(() => {
    if (!cast || open > 0) return;
    const root = cast.root;
    cast = null;
    root.classList.add("out");
    setTimeout(() => root.remove(), 250);
  }, 180);
}

function build(line: Line) {
  const sp = SPEAKERS[line.who];
  const root = el("div", "dialog");
  root.dataset.speaker = line.who;
  root.classList.add(line.who === "narrator" ? "dialog-narrator" : line.who === "sign" ? "dialog-sign" : "dialog-character");
  const box = el("div", "box");
  // Name tag on the speaker's side of the stage.
  if (cast && sp.portrait && sp.portrait !== SPEAKERS.qish.portrait) box.classList.add("right");
  box.appendChild(el("div", "name", line.who === "narrator" ? "Cerita" : sp.name));
  const text = el("div", "text");
  box.appendChild(text);
  root.appendChild(box);
  return { root, box, text };
}

/** Measure against the actual font and viewport, including phones in landscape. */
function instructionText(value: string, label = input.label("a")) {
  return value.replace(/\b([Tt]ekan|[Tt]ahan) A\b/g, (_match, verb: string) => `${verb} ${label}`);
}

function pageText(remaining: string, text: HTMLElement) {
  const fits = (value: string) => {
    // Reserve the widest confirm label so switching devices cannot overflow a page.
    text.textContent = instructionText(value, "Space");
    return text.scrollHeight <= text.clientHeight + 1 && text.scrollWidth <= text.clientWidth + 1;
  };
  if (fits(remaining)) return remaining;
  const chars = Array.from(remaining);
  let low = 1;
  let high = chars.length;
  while (low < high) {
    const mid = Math.ceil((low + high) / 2);
    if (fits(chars.slice(0, mid).join(""))) low = mid;
    else high = mid - 1;
  }
  let page = chars.slice(0, low).join("");
  const wordEnd = Math.max(page.lastIndexOf(" "), page.lastIndexOf("\n"));
  if (wordEnd > page.length / 2) page = page.slice(0, wordEnd + 1);
  return page;
}

/** Long dialogue continues on the next page with A; choices appear after the last page. */
async function typeLine(line: Line, box: HTMLElement, text: HTMLElement, onDone?: () => void) {
  let remaining = line.text;
  do {
    const page = pageText(remaining, text);
    remaining = remaining.slice(page.length);
    text.textContent = "";
    text.scrollTop = 0;
    await typePage({ ...line, text: page }, box, text, remaining ? undefined : onDone, !!remaining);
  } while (remaining);
}

/** Type out one page; a confirm while typing reveals this page, never skips later text. */
function typePage(line: Line, box: HTMLElement, text: HTMLElement, onDone?: () => void, more = false) {
  return new Promise<void>((resolve) => {
    let shown = 0;
    let acc = 0;
    let done = false;
    let clicked = false;
    const next = el("div", "next", `<kbd data-control="a">Space</kbd> ${more ? "Sambung ayat" : "Teruskan"} <span>▸</span>`);
    const click = () => (clicked = true);
    // Native clicks are cancelled by a scroll gesture. A finger scrolling a
    // page after rotation must not also confirm/skip that page.
    box.addEventListener("click", click);
    const off = onFrame((dt) => {
      const full = instructionText(line.text);
      const confirm = input.pressed("a") || clicked;
      clicked = false;
      if (!done) {
        acc += dt;
        while (acc > 0.028 && shown < full.length) {
          acc -= 0.028;
          shown++;
          if (shown % 3 === 0 && full[shown - 1] !== " ") sfx.talk();
        }
        if (confirm) shown = full.length;
        text.textContent = full.slice(0, shown);
        if (shown >= full.length) {
          done = true;
          if (onDone) onDone();
          else box.appendChild(next);
        }
        return;
      }
      if (text.textContent !== full) text.textContent = full;
      if (!onDone && confirm) {
        sfx.blip();
        off();
        box.removeEventListener("click", click);
        next.remove();
        resolve();
      }
    });
    if (onDone) {
      // Choice lines resolve as soon as the text is out; the choice UI takes over input.
      const check = onFrame(() => {
        if (done) {
          check();
          off();
          box.removeEventListener("click", click);
          resolve();
        }
      });
    }
  });
}

export async function say(lines: Line[]) {
  open++;
  openStage(lines);
  try {
    for (const line of lines) {
      spotlight(line);
      const { root, box, text } = build(line);
      ui().appendChild(root);
      await typeLine(line, box, text);
      root.remove();
    }
  } finally {
    open--;
    if (!open) closeStage();
  }
}

/** Show a line with choices; resolves with the chosen index. */
export async function ask(line: Line, choices: string[]) {
  open++;
  openStage([line]);
  spotlight(line);
  const { root, box, text } = build(line);
  ui().appendChild(root);
  try {
    await typeLine(line, box, text, () => {});
    const row = el("div", "choices");
    const btns = choices.map((c, i) => {
      const b = el("button", "choice", c);
      b.addEventListener("pointerdown", () => (picked = i));
      row.appendChild(b);
      return b;
    });
    box.appendChild(row);
    let sel = 0;
    let picked = -1;
    const dirOf = () => {
      const ax = input.axis();
      return Math.abs(ax.x) > 0.5 ? Math.sign(ax.x) : Math.abs(ax.y) > 0.5 ? Math.sign(ax.y) : 0;
    };
    // A direction still held from walking into the trigger must not move the selection;
    // only a fresh press does.
    let lastAxis = dirOf();
    btns[0].classList.add("sel");
    return await new Promise<number>((resolve) => {
      const off = onFrame(() => {
        const dir = dirOf();
        if (dir && dir !== lastAxis) {
          sel = (sel + dir + choices.length) % choices.length;
          btns.forEach((b, i) => b.classList.toggle("sel", i === sel));
          sfx.blip();
        }
        lastAxis = dir;
        if (input.pressed("a")) picked = sel;
        if (picked >= 0) {
          off();
          sfx.select();
          resolve(picked);
        }
      });
    });
  } finally {
    root.remove();
    open--;
    if (!open) closeStage();
  }
}
