import * as THREE from "three";
import { save } from "../core/save";
import { BOSSES, bossOfZone, type BossId } from "../content/bosses";
import { collectible, type ItemKind } from "../overworld/items";
import { mergeStatic } from "../overworld/merge";
import {
  balloons,
  bench,
  bush,
  flat,
  flowerBed,
  lampPost,
  myvi,
  palm,
  roundedBox,
  signBoard,
  simpleBuilding,
} from "../overworld/props";
import { PAL } from "../overworld/style";
import type { Box, ZoneBuilder, ZoneDef, ZoneId } from "../overworld/zone";
import { bed, bedroomDoor, clueMarker, desk, gameConsole, pottedPlant, roomShell, rug, stripBoard, wardrobe } from "./bedroom";
import { catColony } from "./cats";
import { BOUNDS, CAM, STANDARD_SPAWNS, ground, slab, standardLayout } from "./common";
import { splatGround } from "../overworld/splat";
import {
  type Anim,
  bananaTree,
  birds,
  STREAM_BRIDGE,
  bridge,
  butterflies,
  chickens,
  clothesline,
  cloudShadows,
  ducks,
  electricPole,
  fallingLeaves,
  fireflies,
  hammock,
  foodTable,
  kedaiRuncit,
  lanternPole,
  lightPool,
  mailbox,
  mangoTree,
  meadow,
  motorbike,
  oilPalm,
  picketFence,
  pottedFlower,
  rainTree,
  roadBlock,
  sleepingCat,
  stiltHouse,
  stream,
  tikar,
  wakaf,
  welcomeArch,
  wires,
} from "./labuProps";
import {
  bunting,
  cake,
  crate,
  fairyLights,
  hill,
  kampungHouse,
} from "./themeProps";
import { BAYS, BAY_X, MALAS, PIT, TEAMS, TRACK, TW, insideLoop, pitSurface, race, trackSurface } from "./sepangTrack";
import {
  BRIDGE1,
  BRIDGE2,
  BRIDGE_HW,
  DECK as SP_DECK,
  DECK_Y,
  GRANDSTAND,
  PB,
  STAIRS,
  armco,
  barricade,
  bridgeY,
  carPark,
  catchFence,
  chequeredArt,
  commentaryBox,
  drizzle,
  footbridge,
  helicopter,
  hoarding,
  jumbotron,
  lightTower,
  mainGate,
  marshalFlag,
  marshalPost,
  merchTent,
  onBridge,
  parkedCar,
  pitBuilding,
  pitWall,
  podium,
  podiumY,
  rainbow,
  scooters,
  searchingCar,
  showCar,
  shuttleBus,
  simRig,
  sleepyZs,
  startGantry,
  teamFlagArt,
  timingTower,
  transporter,
  vipRope,
  waySign,
  windFlag,
  grandstand as sepangStand,
} from "./sepangProps";
import {
  airsideFence,
  apronSlab,
  babahPlane,
  bagTrain,
  bangMarker,
  controlTower,
  flipBoard,
  floodMast,
  flyoverShadow,
  fuelTruck,
  jalurGemilang,
  kliaLetters,
  passengers,
  runway,
  runwayLights,
  runwayTraffic,
  stairsTruck,
  terminal,
  trolleys,
  windsock,
} from "./kliaProps";
import { type Carry, type PersonLook, BINTANG_LOOKS, FISHER_LOOKS, JOG_LOOKS, LORBEL_LOOKS, PASSENGER_LOOKS, PICNIC_LOOKS, VENDOR_LOOKS, WALK_LOOKS, passengerDoodle, personBackDoodle, sitterDoodle } from "../content/doodles";
import {
  PILLARS,
  RAIL_V,
  ROAD,
  ROT,
  UV,
  W,
  WALK,
  bannerLamp,
  bintangCrowd,
  bollards,
  bowatHaze,
  buskerSpot,
  cardboardCamp,
  cityBlock,
  fartCloud,
  junction,
  monorail,
  motoZone,
  musicNotes,
  photoSpot,
  pianoWalk,
  planterTree,
  recordCrates,
  roofRecord,
  screenTower,
  shawarmaStand,
  shopRow,
  skyline,
  streetSign,
  subwayEntrance,
  traffic,
} from "./bintangProps";
import {
  BOOTH_STYLES,
  type BackdropKind,
  HW,
  PASTEL,
  PB_LOOKS,
  SNAKE,
  backdrop,
  boothMachine,
  checkerDisc,
  checkerFloor,
  digicamStatue,
  filmReel,
  heartGarden,
  filmRoad,
  flashLamp,
  fleeingStrip,
  flowerHedge,
  flowerTub,
  flyingStrips,
  giantCamera,
  lawnFlowers,
  pastelBench,
  photoDecal,
  polaroidBunting,
  printKiosk,
  rng,
  roadRoute,
  roadS,
  ropeLine,
  screenFlash,
  stripTree,
  studioLight,
  studioSet,
  studioShop,
  tripodCamera,
} from "./boothProps";
import { sfx } from "../core/sfx";
import { PaperSprite } from "../overworld/paper";
import { dialogOpen } from "../ui/dialog";
import {
  CITY_R,
  DEG,
  EXIT_A,
  ROAD_IN,
  ROTUNDA_R,
  SIDEWALK_R,
  STREET_W,
  WALK_OUT,
  bowatTrail,
  carMesh,
  cityFloor,
  cityTree,
  crust,
  facing,
  horizonCull,
  local,
  nyomPoint,
  outerGrass,
  outsideCity,
  pepperoni,
  placeAt,
  polar,
  popWord,
  ringTraffic,
  streetLamp,
} from "./nyomProps";
import { NYOM_LOOKS, SHOPS, buildShop, cityMap } from "./nyomShops";
import { BOWAT_SEAT, KITCHEN_DOOR, MAITRE, MEJA8, PIANO, cosyPlace } from "./cosyPlace";
import {
  type StallKind,
  type Stander,
  type Strand,
  type Walker,
  bundleStall,
  buskingStage,
  diningTable,
  festoons,
  foodStall,
  lampLight,
  lightPole,
  lorbelCrowd,
  groundPaint,
  parkingBoom,
  lowWall,
  mannequin,
  neonSign,
  puddle,
  vendorVan,
  shopBlock,
  standMirror,
  warmPool,
} from "./lorbelProps";
import {
  type JogRoute,
  airWalker,
  canopy,
  cruiseBoat,
  dataranPutra,
  dragonBoat,
  fountain,
  hedge,
  iceCreamBike,
  joggers,
  kelapaStall,
  lake,
  landMass,
  masjidPutra,
  minaret,
  pavilion,
  perdanaPutra,
  pigeons,
  pullUpBars,
  putraBridge,
  putraLamp,
  redRoofBlock,
  roadText,
  roundTree,
  royalPalm,
  rubberFloor,
  shoreRail,
  situpBench,
  startArch,
  sweatAndScale,
  wauKite,
  weighScale,
  wordSign,
} from "./putrajayaProps";
import { KG_PER_UNIT, STATIONS, burn, gym, kgNow, live, scaleTicks, workoutDone } from "./workout";
import { BRIDGE, DECK, DOCK, JETTY, JETTY_END, WATER_Y, boat, wet } from "./sampan";
import {
  type BootKind,
  anglers,
  batikCorner,
  bootStall,
  dragonflies,
  egrets,
  fishJumps,
  fishingDeck,
  footBridge,
  frisbee,
  islandOtters,
  jetty,
  lakeLand,
  lakeWater,
  liliumBed,
  lilyPads,
  otterFamily,
  otterPair,
  otterThief,
  parasol,
  picnicMat,
  picnicSpread,
  potLily,
  sampan,
  sampanKiosk,
  shoreFoam,
  shoreReeds,
  snorlaxTwin,
  soapBubbles,
  willow,
} from "./tasikProps";

/** The island is a ring: home in Labu Lanjut, round the island, and Litar Sepang next door to home again.
 * Qish's bedroom ("bilik") is an interior off the house, not part of the ring. */
export const ZONE_ORDER: ZoneId[] = [
  "labulanjut",
  "sunway",
  "galeri",
  "dusun",
  "angkasa",
  "cosyplace",
  "photobooth",
  "bukit",
  "sepang",
];

/** Short names for gates and the Myvi menu. */
export const SHORT: Record<ZoneId, string> = {
  bilik: "Bilik Qish",
  sunway: "Bukit Bintang",
  photobooth: "Photobooth",
  dusun: "Lakefront",
  angkasa: "KLIA",
  cosyplace: "Nyomnyom City",
  galeri: "Lorbel",
  bukit: "Putrajaya",
  sepang: "Litar Sepang",
  labulanjut: "Labu Lanjut",
};

export const nextZone = (id: ZoneId) => ZONE_ORDER[(ZONE_ORDER.indexOf(id) + 1) % ZONE_ORDER.length];
export const prevZone = (id: ZoneId) => ZONE_ORDER[(ZONE_ORDER.indexOf(id) + ZONE_ORDER.length - 1) % ZONE_ORDER.length];

const neighbours = (id: ZoneId) => ({ prev: SHORT[prevZone(id)], next: SHORT[nextZone(id)] });

/** After beating Raja Nonchalant Qish wakes up again; the party in the yard waits until the ending. */
export const awakeAgain = () => save.hasCard(BOSSES.finale.card) && !save.flag("endingSeen");

/** What Qish has noticed in her bedroom: Bowat's pillow, the strip board, the phone. Same three spots
 * on both wake-ups, with their own flags. */
export const CLUES = ["clueBowat", "clueStrips", "clueFaris"] as const;
export const WAKE_CLUES = ["wakeBowat", "wakeStrips", "wakeFaris"] as const;
export const clueFlags = (): readonly string[] => (awakeAgain() ? WAKE_CLUES : CLUES);
export const cluesFound = () => clueFlags().filter((c) => save.flag(c)).length;

/** Bosses come back for rematches once the game has been finished. */
export const replayUnlocked = () => save.flag("endingSeen");

/** Each zone has something to collect; the way on (or the boss) opens once Qish has all of it. */
export interface Collection {
  kind: ItemKind;
  /** HUD label. */
  name: string;
  spots: [number, number][];
}

export const COLLECT: Partial<Record<ZoneId, Collection>> = {
  // Bowat's fart clouds hanging over Bukit Bintang: sprayed away one by one (once Qish has the spray).
  sunway: {
    kind: "kentut",
    name: "Awan kentut",
    // Shawarma front, under the screen tower, Piring Hitam's front, the motorbike bay, and the two zebra
    // crossings either side of Bowat.
    spots: [[-25.3, 10.4], [0, -13.9], [26.2, 11.3], [23.5, -0.4], [-5.4, -5.4], [5.4, 5.4]],
  },
  // Bowat ran off munching cookies and dropped them all over the village.
  labulanjut: {
    kind: "cookie",
    name: "Cookies Bowat",
    spots: [[0, 3.4], [-15.2, -1.2], [16.6, -2.6], [-7.2, 13.6], [6.4, 23.6], [-7.0, 24.2]],
  },
  // Raja Nonchalant borrowed Babah's tools "to fix his bed" and left them all over the airport.
  angkasa: {
    kind: "spanner",
    name: "Tools Babah",
    spots: [[-18.6, 1.6], [-9.4, 7.4], [8.0, 6.7], [-21.0, 12.2], [19.8, 1.6], [0.4, -1.6]],
  },
  // Bolat's song request slips, blown into the Lorbel crowd: both lanes, the bundle, the tables and the food.
  galeri: {
    kind: "request",
    name: "Kertas request",
    spots: [[-20, -6.9], [0.8, -22.4], [11.6, -1.7], [-0.9, 24.8], [-24.0, 2.4], [3.0, 10.6]],
  },
  // Lilies out in the middle of Lakefront, picked from the sampan: the scent is the only thing that
  // stirs Snorlax Twin (before she remembers she's hungry).
  dusun: {
    kind: "lily",
    name: "Bunga lily",
    spots: [[-10.5, -4.5], [-6, -9.2], [3, -9.6], [10.8, -6.4], [11, 2.2], [-8.4, 4.6]],
  },
  // Bowat ate his way round Nyomnyom City without paying: one bill at every shop, in his order.
  cosyplace: {
    kind: "resit",
    name: "Resit Bowat",
    spots: SHOPS.map((s) => s.resit),
  },
  // Six of the strips off Bolat ex's gallery, blown away by the giant camera's flash. These are where
  // each one ends up stuck after fluttering off down the road (see PB_HOPS).
  // Litar Sepang: Raja Nonchalant left Qish's paddock passes with six people round the circuit; the podium
  // is ALL ACCESS. Each pass glows by the person holding it (SP_GIVERS).
  sepang: {
    kind: "pass",
    name: "Pas paddock",
    spots: [[-8.2, 23.3], [12.8, 17.3], [-4.67, -2.45], [0, -15.1], [-30.9, -18.8], [26.2, -16.8]],
  },
  photobooth: {
    kind: "strip",
    name: "Strip terbang",
    spots: [[-20.3, 12.4], [3.5, 17.6], [12.4, 12.9], [6.6, -1.0], [-18.6, -10.9], [14.4, -21.0]],
  },
};

/** Litar Sepang: the six people Raja Nonchalant left Qish's passes with, each standing by the pass
 * (COLLECT.sepang lists the passes in the same order). */
export const SP_GIVERS: { id: string; at: [number, number]; look: PersonLook }[] = [
  { id: "tiket", at: [-8.2, 21.3], look: { skin: "#e3ad86", top: "#d8281e", bottom: "#2a2730", hijab: "#2a2730", bag: "#ffcb05", carry: "none" } },
  { id: "merch", at: [12.8, 14.8], look: { skin: "#c98c64", top: "#8a8f99", bottom: "#2a2730", cap: "#8a8f99", hair: "#26222a", bag: "#333", carry: "none" } },
  { id: "krew", at: [-5.7, -1.75], look: { skin: "#b97a52", top: "#8a8f99", bottom: "#8a8f99", cap: "#5b4766", hair: "#26222a", bag: "#333", carry: "phone" } },
  { id: "usher", at: [1.4, -15.9], look: { skin: "#f0c8a8", top: "#2a2730", bottom: "#2a2730", hijab: "#ffcb05", bag: "#333", carry: "none", vest: "#ffcb05" } },
  { id: "marshal", at: [-32.4, -19.3], look: { skin: "#c98c64", top: "#ff8a1c", bottom: "#ff8a1c", cap: "#fffdf6", hair: "#26222a", bag: "#333", carry: "none" } },
  { id: "pengulas", at: [27.8, -17.4], look: { skin: "#e8b48a", top: "#1f2f7a", bottom: "#2a2730", hair: "#26222a", bag: "#e3350d", carry: "mic", bowtie: "#e3350d" } },
];
export const SP_BOUNCER: PersonLook = { skin: "#a8704a", top: "#17151f", bottom: "#17151f", cap: "#17151f", hair: "#26222a", bag: "#333", carry: "none" };

/** Litar Sepang walking: anywhere but the track (and its run-off), the pit lane, the grandstand and the
 * pit building; the walk-through garage, the bridges and the podium stairs are fine; north of the back
 * straight only the road out. */
export function spWalkable(x: number, z: number) {
  if (onBridge(BRIDGE1, x, z) || onBridge(BRIDGE2, x, z) || podiumY(x, z) > 0) return true;
  if (x > PB.x0 - 0.2 && x < PB.x1 + 0.2 && z > PB.z0 && z < PB.z1) return x > -11.1 && x < -7.55;
  if (z > 0) return true;
  if (x > -24.5 && x < 22.5 && z > -6.1 && z < -2.85) return false;
  if (z > -12 && x > -35 && x < 34 && PIT.nearest(x, z).d < 2.2) return x > -21 && x < 21 && z > -2.85;
  if (TRACK.nearest(x, z).d < TW + 0.95) return false;
  if (x > GRANDSTAND.x0 - 0.3 && x < GRANDSTAND.x1 + 0.3 && z > GRANDSTAND.z0 - 0.6 && z < GRANDSTAND.z1 + 0.12) return false;
  if (z < -6.5 && !insideLoop(x, z)) return x > 22.4 && x < 29.6 && z < -36.6;
  return true;
}

/** FotoBooth: the giant camera's spot, and the plazas off the snake road (each joined to one
 * run only, so there is no short cut across the bends). */
export const PB_CAM: [number, number] = [0, -8.6];
type Plaza = { box: Box } | { x: number; z: number; r: number };
export const PB_PLAZAS: Plaza[] = [
  // Backdrop Alley, north of the bottom run.
  { box: [-29.5, 11.2, -13.5, 17.6] },
  // Myvi bay, south of the bottom run.
  { box: [-27, 20.6, -19.6, 24.8] },
  // Taman Strip inside the right bend, and the path in from the bend.
  { x: 13.0, z: 10.8, r: 4.1 },
  { box: [16.4, 9.6, 22.4, 12.4] },
  // The giant camera's plaza, north of the middle run.
  { box: [-8.6, -4.1, 8.6, 1.4] },
  // Taman Backdrop 2 inside the left bend, and the path in from the bend.
  { box: [-21.2, -12.0, -11.5, -5.2] },
  { box: [-23.8, -10.2, -20.8, -7.4] },
  // Studio Flash, north of the top run.
  { box: [13.4, -21.4, 24.6, -19.4] },
];
export const pbInPlaza = (x: number, z: number, pad = 0) =>
  PB_PLAZAS.some((p) => ("r" in p ? Math.hypot(x - p.x, z - p.z) < p.r + pad : x > p.box[0] - pad && x < p.box[2] + pad && z > p.box[1] - pad && z < p.box[3] + pad));
export const pbWalkable = (x: number, z: number) => pbInPlaza(x, z) || SNAKE.nearest(x, z).d < HW - 0.25;
/** Each runaway strip: where it starts, where it flutters to first, and where it gets stuck. */
export const PB_HOPS: [number, number][][] = [
  [[-27.5, 19.1], [-15.5, 19.3], [-20.3, 12.4]],
  [[-10, 18.7], [-1, 19.8], [3.5, 17.6]],
  [[9.5, 18.6], [23.6, 11.8], [12.4, 12.9]],
  [[12.2, 3.0], [-3, 3.3], [6.6, -1.0]],
  [[-10, 2.6], [-24.6, -4.5], [-18.6, -10.9]],
  [[-11, -17.3], [4, -17.9], [14.4, -21.0]],
];
/** Hooks the photobooth zone fills in for scenes in main: fire the giant camera now, take a picture. */
export const photoboothFx = { kick: () => {}, snap: () => {} };

/** Babah has his tools back and the plane is ready (or Blep is long beaten). */
export const babahFixed = () => save.flag("babahFixed") || save.hasCard(BOSSES.blep.card);

export const gotFlag = (zone: ZoneId, i: number) => `got:${zone}:${i}`;
export const collectNeed = (zone: ZoneId) => COLLECT[zone]?.spots.length ?? 0;
export const collectedCount = (zone: ZoneId) => COLLECT[zone]?.spots.filter((_, i) => save.flag(gotFlag(zone, i))).length ?? 0;

/** All collected here (Putrajaya: back down to 80kg), or the story already went past this zone (saves from
 * before collecting existed). */
export function collectDone(zone: ZoneId) {
  if (zone === "bukit" ? workoutDone() : !COLLECT[zone] || collectedCount(zone) >= collectNeed(zone)) return true;
  return ZONE_ORDER.slice(ZONE_ORDER.indexOf(zone)).some((z) => {
    const boss = bossOfZone(z);
    return !!boss && save.hasCard(BOSSES[boss].card);
  });
}

function placeCollectibles(b: ZoneBuilder, zone: ZoneId) {
  const c = COLLECT[zone];
  if (!c || collectDone(zone)) return;
  c.spots.forEach(([x, z], i) => {
    if (save.flag(gotFlag(zone, i))) return;
    // Bowat's clouds are big and only clear with the air freshener from the 24-hour shop.
    if (c.kind === "kentut") {
      b.pickup(String(i), x, z, fartCloud(i + 1), () => save.flag("bbSpray"));
      b.interact(`cloud:${i}`, x, z, "Uhuk!", 3.6, 2.6, () => !save.flag("bbSpray"));
      return;
    }
    const item = collectible(c.kind, i * 1.3);
    b.pickup(String(i), x, z, item);
    // Lilies float on the lake.
    if (c.kind === "lily") item.group.position.y = WATER_Y + 0.05;
  });
}

/** Place the zone's boss unless already beaten (or back for a rematch after the ending).
 * Card-back standee until the art pass gives each boss a sprite. */
/** A boss with no standee: Qish starts the fight at a spot (the stage, an easel), marked with a "!" until the
 * boss is beaten, and for rematches after the ending. Returns false when the spot is free for ordinary talk. */
function bossSpot(b: ZoneBuilder, boss: BossId, x: number, z: number, label: string, bang: [number, number, number], top = 2.6, range = 1.3, ready = () => true) {
  const beaten = save.hasCard(BOSSES[boss].card);
  if (beaten && !replayUnlocked()) return false;
  b.interact(beaten ? "replay" : "boss", x, z, beaten ? "Main semula" : label, top, range);
  const m = bangMarker(...bang, () => !save.hasCard(BOSSES[boss].card) && ready());
  b.root.add(m.sprite);
  b.animate(m.update);
  return true;
}

/** [x, z] on the ground as an [x, y, z] position. */
const v3of = ([x, z]: [number, number], y = 0): [number, number, number] => [x, y, z];

const zone = (def: Omit<ZoneDef, "bounds" | "cam" | "spawns"> & Partial<Pick<ZoneDef, "bounds" | "cam" | "spawns">>): ZoneDef => ({
  bounds: BOUNDS,
  cam: CAM,
  spawns: { ...STANDARD_SPAWNS },
  ...def,
});

export const ZONES: Record<ZoneId, ZoneDef> = {
  bilik: zone({
    id: "bilik",
    name: "Bilik Qish",
    sky: 0x9b839e,
    fog: 0x9b839e,
    light: { sun: 1.5, hemi: 1.35, sunColor: 0xffe0b8, hemiSky: 0xfff0f4, hemiGround: 0xc99a6b },
    mood: () => save.hasCard(BOSSES.finale.card) ? {
      sky: 0x75607f,
      fog: 0x75607f,
      light: { sun: 1.2, hemi: 1.2, sunColor: 0xffc69d, hemiSky: 0xffdfcc, hemiGround: 0x9b7b85 },
    } : {},
    bounds: [-6.6, -2.6, 4.6, 4.2],
    cam: [-3.4, -0.6, 2.8, 0.6],
    camScale: 0.62,
    spawns: { start: [-2.4, -1.2, "front"], door: [3.9, 0.4, "left"], console: [3.2, 3.35, "right"] },
    async build(b) {
      b.root.add(roomShell(save.hasCard(BOSSES.finale.card)));
      b.collider([-7, -4.5, 5, -2.9]);

      b.root.add(bed(-4.6, -2.45));
      b.collider([-6.2, -4.5, -3.0, -0.35]);
      b.interact("bed", -3.2, -1.6, "Tengok", 1.9, 1.7);

      const d = desk(3.3, -3.45);
      b.root.add(d.group);
      b.animate(d.update);
      b.collider([1.95, -4.45, 4.65, -2.35]);
      b.interact("phone", 3.8, -1.95, "Phone", 1.9, 1.6);

      const stripsBack = save.hasCard(BOSSES.bolatex.card);
      b.root.add(stripBoard(-0.65, 1.62, -4.45, stripsBack));
      b.interact("board", -0.65, -2.5, "Tengok", 2.2, 1.8);

      b.root.add(wardrobe(-6.0, 2.2));
      b.collider([-6.55, 1.0, -5.45, 3.4]);
      b.root.add(bedroomDoor(4.88, 0.4));
      b.interact("door", 4.0, 0.4, "Keluar", 3.0, 1.4);
      b.root.add(rug(-0.2, 0.8));
      const tv = gameConsole(4.45, 3.35, replayUnlocked());
      b.root.add(tv.group);
      b.animate(tv.update);
      b.collider([3.95, 2.3, 4.95, 4.4]);
      b.interact("console", 3.6, 3.35, replayUnlocked() ? "Main semula boss" : "Tengok", 2.0, 1.4);
      b.root.add(pottedPlant(-4.9, 3.8));
      b.collider([-5.3, 3.4, -4.5, 4.2]);

      const flags = clueFlags();
      for (const [i, x, y, z] of [[0, -3.9, 2.0, -3.9], [1, -0.65, 2.6, -4.3], [2, 4.05, 2.0, -3.1]] as const) {
        const m = clueMarker(x, y, z, () => save.flag(flags[i]));
        b.root.add(m.sprite);
        b.animate(m.update);
      }
    },
  }),

  // Bukit Bintang (the zone id stays "sunway" so old saves still work), the city of music, on a late
  // afternoon. The scramble crossing is the centrepiece, turned 45° so the roads make an X and the four
  // blocks sit top, right, bottom and left. Qish comes up out of the MRT from Labu Lanjut on the left
  // block and goes down into the MRT for Lorbel on the right block, across the scramble.
  //   top: the screen tower (curved corner screen, a screen each face)
  //   left: MRT from Labu Lanjut, kedai 24 jam, shawarma, mamak, urut; monorail station overhead
  //   right: MRT to Lorbel, Piring Hitam, kedai gitar, a family sleeping rough, ZON MOTOSIKAL, burger, Myvi
  //   bottom: BUKIT BINTANG letters, the photo spot (low camera: scramble, screens, skyline), piano, buskers
  sunway: zone({
    id: "sunway",
    name: "Bukit Bintang",
    sky: 0xa9c3e4,
    fog: 0xc8d4e6,
    light: { sun: 2.1, hemi: 1.15, sunColor: 0xffd2a0, hemiSky: 0xe8f0ff, hemiGround: 0x8a8278 },
    bounds: [-34, -26, 38.5, 28.6],
    cam: [-30, -24, 35, 28.6],
    spawns: {
      start: [-17.5, 5.6, "front"],
      west: [-17.5, 5.6, "front"],
      east: [17.5, 5.6, "front"],
      myvi: [35.2, 20.5, "right"],
      boss: [2.8, 2.8, "left"],
    },
    // A little lower than usual everywhere, so the screens read; on the photo spot, a low camera looking
    // across the letters and the scramble at the screen tower with the KL skyline either side.
    scenic: {
      weight: (x, z) => Math.max(0.3, THREE.MathUtils.clamp((3 - Math.hypot(x, z - 20.6)) / 1.6, 0, 1)),
      offset: [0, 3.4, 11],
      lookY: 2.5,
      lookAhead: 25,
      fog: [65, 170],
    },
    async build(b) {
      const box = (x0: number, z0: number, x1: number, z1: number) => b.collider([x0, z0, x1, z1]);
      const post = (x: number, z: number, r = 0.3) => box(x - r, z - r, x + r, z + r);
      const anim = (a: Anim) => {
        b.root.add(a.group);
        b.animate(a.update);
      };
      const statics = new THREE.Group();
      const add = (...o: THREE.Object3D[]) => statics.add(...o);
      const beaten = save.hasCard(BOSSES.bowat.card);
      const spots = COLLECT.sunway!.spots;
      const cloudLeft = (i: number) => !collectDone("sunway") && !save.flag(gotFlag("sunway", i));
      const left = () => spots.filter((_, i) => cloudLeft(i)).length;
      const clouds = () => spots.map((p, i) => (cloudLeft(i) ? p : null));
      const screens = { clouds: left };
      /** A frame turned `rot` about (ox, oz): build-space (bx, bz) to the world. */
      const frame = (ox: number, oz: number, rot: number) => (bx: number, bz: number): [number, number] => [ox + bx * Math.cos(rot) + bz * Math.sin(rot), oz - bx * Math.sin(rot) + bz * Math.cos(rot)];
      /** Keep Qish out of a turned building: (0..len) along, (-depth..0) back from the front. */
      const solidIn = (ox: number, oz: number, rot: number, len: number, depth: number) =>
        b.region((x, z) => {
          const dx = x - ox;
          const dz = z - oz;
          const bx = dx * Math.cos(rot) - dz * Math.sin(rot);
          const bz = dx * Math.sin(rot) + dz * Math.cos(rot);
          return bx > -0.4 && bx < len + 0.4 && bz > -depth - 0.4 && bz < 0.4;
        });
      /** A building put together at the origin, turned and stood at (ox, oz). */
      const turned = (o: THREE.Object3D, ox: number, oz: number, rot: number) => {
        const g = new THREE.Group();
        g.add(o);
        g.position.set(ox, 0, oz);
        g.rotation.y = rot;
        return g;
      };

      // ---- Ground, roads, the scramble, the skyline
      add(junction());
      b.root.add(skyline());

      // ---- Top: the screen tower
      anim(screenTower(W(-11.5, -11.5), screens));
      b.region((x, z) => {
        const [u, v] = UV(x, z);
        return u < -11.1 && v < -11.1;
      });
      b.interact("screen", 0, -12.4, "Tengok skrin", 3.4, 1.8, () => !cloudLeft(1));

      // ---- Left: up from the MRT from Labu Lanjut; kedai 24 jam, shawarma, mamak, urut facing the street
      add(subwayEntrance(-17.5, 3, SHORT.labulanjut, "#e3350d"));
      box(-19.2, 0.0, -18.8, 3.9);
      box(-16.2, 0.0, -15.8, 3.9);
      box(-19.1, -0.1, -15.9, 0.4);
      post(-15.4, 4.3, 0.3);
      b.exit("west", [-18.7, 0.5, -16.3, 1.5], [-17.5, 4.6]);
      const LR = Math.PI / 4;
      const [lx, lz] = W(-12.5, 35);
      const lf = frame(lx, lz, LR);
      add(
        turned(
          shopRow(0, -6, 16, 0, 9, [["urut", 0, 3.5], ["mamak", 3.5, 7.5], ["shawarma", 7.5, 12], ["kedai24", 12, 16]], {
            seed: 3,
            wall: "#e6d6c0",
            band: "#c9b090",
            signs: [["SPA", "#ffe28a", 2], ["KARAOKE", "#7dd3ff", 8], ["HOTEL", "#ff5c93", 14]],
          }),
          lx,
          lz,
          LR,
        ),
      );
      solidIn(lx, lz, LR, 16, 6);
      {
        const sw = shawarmaStand(0, 0);
        sw.group.position.set(...v3of(lf(9.8, 0.9)));
        sw.group.rotation.y = LR;
        anim(sw);
        b.region((x, z) => {
          const [bx, bz] = [(x - lx) * Math.cos(LR) - (z - lz) * Math.sin(LR), (x - lx) * Math.sin(LR) + (z - lz) * Math.cos(LR)];
          return bx > 8 && bx < 11.6 && bz > 0 && bz < 1.5;
        });
      }
      await b.standee(passengerDoodle({ ...VENDOR_LOOKS[2], apron: "#fffdf6", cap: "#e3350d" }), ...lf(9.2, 0.3), 1.85);
      b.interact("shawarma", ...lf(9.8, 2.2), "Tengok", 2.6, 1.5);
      await b.standee(passengerDoodle({ ...VENDOR_LOOKS[3], carry: "none" }), ...lf(14, 0.5), 1.85);
      b.interact("kedai24", ...lf(14, 1.8), "Beli pewangi", 2.6, 1.7, () => !save.flag("bbSpray") && !collectDone("sunway"));
      b.interact("kedai24", ...lf(14, 1.8), "Tengok", 2.6, 1.7, () => save.flag("bbSpray") || collectDone("sunway"));
      {
        const [mx, mz] = lf(14, 0.4);
        const m = bangMarker(mx, 4.8, mz, () => !save.flag("bbSpray") && !collectDone("sunway"));
        b.root.add(m.sprite);
        b.animate(m.update);
      }
      for (const [bx, seed] of [[5.5, 1], [4.0, 2]] as const) {
        const [tx, tz] = lf(bx, bx === 5.5 ? 2.0 : 3.4);
        add(diningTable(tx, tz, 0x3b6fe0, 0xe3350d, seed, true));
        post(tx, tz, 0.7);
      }
      b.interact("mamak", ...lf(5.5, 0.8), "Tengok", 2.4, 1.2);
      await b.standee(passengerDoodle({ ...BINTANG_LOOKS[8], carry: "phone" }), ...lf(1.8, 1.4), 1.85);
      b.interact("urut", ...lf(1.8, 2.4), "Tengok", 2.6, 1.4);
      // Under the monorail station: a little square with trees.
      for (const [x, z] of [[-32.0, -4.0], [-30.5, -12]] as const) {
        add(planterTree(x, z, Math.round(x * z)));
        post(x, z, 1.0);
      }

      // ---- Right: down into the MRT for Lorbel; Piring Hitam, the guitar shop, a family sleeping rough
      add(subwayEntrance(17.5, 3, SHORT.galeri, "#3b6fe0"));
      box(15.8, 0.0, 16.2, 3.9);
      box(18.8, 0.0, 19.2, 3.9);
      box(15.9, -0.1, 19.1, 0.4);
      post(19.6, 4.3, 0.3);
      b.exit("east", [16.3, 0.5, 18.7, 1.5], [17.5, 4.6]);
      const RR = -Math.PI / 4;
      const [rx, rz] = W(19, -12.5);
      const rf = frame(rx, rz, RR);
      add(turned(shopRow(0, -6, 16, 0, 4.2, [["gitar", 0, 4], ["vinyl", 4, 11], ["tutup", 11, 16]], { seed: 9, wall: "#efe6da" }), rx, rz, RR));
      solidIn(rx, rz, RR, 16, 6);
      {
        const [ux, uz] = rf(7.5, -2.5);
        anim(roofRecord(ux, 4.2, uz, 1.6));
      }
      for (const bx of [5.6, 9.4]) {
        const [cx, cz] = rf(bx, 0.8);
        const crates = recordCrates(cx, cz, 2);
        crates.rotation.y = RR;
        add(crates);
        post(cx, cz, 0.7);
      }
      await b.standee(passengerDoodle({ skin: "#c98c64", top: "#2a2730", bottom: "#3d4a7a", hair: "#26222a", cap: "#ff8fb1", bag: "#000", carry: "none" }), ...rf(7.5, 0.6), 1.85);
      b.interact("vinyl", ...rf(7.5, 2.0), "Tengok", 2.6, 1.4);
      {
        const [nx, nz] = rf(7.5, 0.9);
        anim(musicNotes(nx, 2.8, nz, () => !cloudLeft(2), 4));
      }
      b.interact("gitar", ...rf(2, 1.8), "Tengok", 2.4, 1.3);
      {
        const [cx, cz] = rf(13.5, 1.1);
        const camp = cardboardCamp(cx, cz);
        camp.rotation.y = RR;
        add(camp);
        post(cx, cz, 1.4);
        // Before and after Qish buys them shawarma; swapped live when she does.
        const fam: [number, number, PersonLook, number][] = [
          [12.4, 1.2, { skin: "#a87a52", top: "#e8e4dc", bottom: "#3d5a7a", sarong: "#26324a", hair: "#26222a", kufi: "#fffdf6", beard: true, bag: "#000" }, 1.62],
          [13.8, 1.3, { skin: "#b9875e", top: "#7a3b52", bottom: "#4a2a3a", hijab: "#3a2a4a", bag: "#000" }, 1.58],
          [14.9, 1.6, { skin: "#b9875e", top: "#f6a04b", bottom: "#3d4a7a", hair: "#26222a", bag: "#000", kid: true }, 1.28],
        ];
        const hungry: THREE.Object3D[] = [];
        const fed: THREE.Object3D[] = [];
        for (const [bx, bz, look, h] of fam) {
          hungry.push(await b.standee(sitterDoodle({ ...look, carry: "none" }), ...rf(bx, bz), h));
          fed.push(await b.standee(sitterDoodle({ ...look, carry: "wrap" }), ...rf(bx, bz), h));
        }
        b.animate(() => {
          const f = save.flag("bbShawarma");
          hungry.forEach((o) => (o.visible = !f));
          fed.forEach((o) => (o.visible = f));
        });
        b.interact("family", ...rf(13.5, 2.9), "Tengok", 2.4, 1.6);
      }
      add(motoZone(20, -4.6, 27, -1.6));
      for (let i = 0; i < 6; i++) add(motorbike(20.8 + i * 1.1, -3.9, i % 2 ? 0.08 : -0.06));
      box(20.1, -4.6, 27, -3.2);
      b.interact("moto", 23.5, -2.4, "Tengok", 2.2, 1.0, () => !cloudLeft(3));
      // In the open beside the rental shop, visible from the front promenade.
      b.root.add(myvi(36.2, 17.8, 0));
      box(35.25, 16.05, 37.15, 19.55);
      b.interact("myvi", 35.0, 20.0, "Myvi", 2.2, 2.0);
      add(planterTree(32.5, -9.5, 7));
      post(32.5, -9.5, 1.0);

      // ---- Bottom: the letters, the photo spot, the street piano, buskers
      add(photoSpot(0, 20.6));
      b.interact("view", 0, 20.6, "Tengok", 2.4, 1.0);
      anim(pianoWalk(-6, 25.4, 13, 0.92, 2.1, b.player));
      add(signBoard(7.4, 26.4, "Piano Jalanan ♪"));
      post(7.4, 26.4, 0.2);
      b.interact("piano", 7.4, 27.2, "Tengok", 2.2, 1.0);
      add(buskerSpot(-7.5, 22.6));
      box(-9.3, 22.0, -8.6, 22.6);
      b.interact("busker", -7.5, 24.4, "Tengok", 2.6, 1.6);
      anim(musicNotes(-7.5, 2.4, 22.4, () => !cloudLeft(5), 5));
      add(planterTree(11.5, 27, 11));
      post(11.5, 27, 1.0);

      // ---- Monorail along Jalan Bukit Bintang, and city blocks behind the side blocks
      anim(monorail(b.player));
      for (const u of PILLARS) post(...W(u, RAIL_V), 0.6);
      b.interact("monorel", ...W(-17, 7.2), "Tengok", 2.6, 1.4);
      const back = (u0: number, v0: number, u1: number, v1: number, h: number, seed: number, wall: string) => {
        const g = new THREE.Group();
        g.add(cityBlock(u0, v0, u1, v1, h, { seed, wall }));
        g.rotation.y = ROT;
        add(g);
        b.region((x, z) => {
          const [u, v] = UV(x, z);
          return u > u0 - 0.4 && u < u1 + 0.4 && v > v0 - 0.4 && v < v1 + 0.4;
        });
      };
      back(-56, -32, -37, -12, 11, 31, "#d1c7d7");
      back(-34, -54, -13, -38, 15, 32, "#d8d0bd");
      back(-76, -30, -58, -12, 15, 33, "#c5d1db");
      back(-32, -74, -13, -56, 12, 34, "#ddc6bc");
      back(14, -40, 40, -24, 12, 21, "#d8cfc4");
      back(-40, 14, -22, 40, 10, 22, "#c9d2dc");

      // ---- Street furniture along every sidewalk, in the road frame
      const furniture = new THREE.Group();
      furniture.rotation.y = ROT;
      const K = ROAD + 0.7;
      let li = 0;
      for (const a of [13, 24]) {
        for (const d of [-1, 1]) {
          for (const [lu, lv, ry] of [[d * a, -K, -Math.PI / 2], [d * a, K, Math.PI / 2], [-K, d * a, 0], [K, d * a, Math.PI]] as const) {
            const [wx, wz] = W(lu, lv);
            // The generated monorail station has a fuller rounded footprint than the old beam-built
            // one; leave its platform corner clear instead of growing a lamp through the glass wall.
            if (wx > -29 && wx < -19 && wz > -14 && wz < -4) continue;
            const l = bannerLamp(lu, lv, li++);
            l.rotation.y = ry;
            furniture.add(l);
            post(wx, wz, 0.15);
          }
        }
      }
      add(furniture);
      add(streetSign(...W(-WALK + 0.4, WALK - 0.4), "Jln Bukit Bintang"), streetSign(...W(WALK - 0.4, -WALK + 0.4), "Jln Sultan Ismail"));
      const bl: [number, number][] = [];
      for (const s of [-1, 1]) for (const t of [-1, 1]) for (const k of [ROAD + 0.6, ROAD + 1.6, ROAD + 2.6]) bl.push(W(s * (WALK - 0.2), t * k), W(s * k, t * (WALK - 0.2)));
      add(bollards(bl));

      // ---- Traffic, the crowd, Bowat in the middle
      const cars = traffic({ jam: () => left() > 0, bowatHere: () => !beaten, player: b.player });
      anim(cars);
      b.blockers(cars.solid, 1.0);
      const Wl = BINTANG_LOOKS;
      const side = (axis: "u" | "v", d: number, off: number, a0: number, a1: number): [number, number][] =>
        axis === "u" ? [W(d * a0, off), W(d * a1, off)] : [W(off, d * a0), W(off, d * a1)];
      const crowd = await bintangCrowd({
        looks: Wl,
        crossers: 20,
        walkRoutes: [
          side("u", -1, -7, 11, 30), side("u", -1, 7, 11, 24), side("u", 1, -7, 11, 30), side("u", 1, 7, 11, 22),
          side("v", -1, -7, 11, 26), side("v", -1, 7, 11, 26), side("v", 1, -7, 11, 22), side("v", 1, 7, 11, 22),
          [lf(15, 2.2), lf(1, 2.2)], [rf(1, 2.2), rf(15, 2.6)], [[-10, 26.5], [-3, 24]], [[24, -6.2], [32, -6.2]],
        ],
        stand: [
          { x: lf(9.6, 2.4)[0], z: lf(9.6, 2.4)[1], look: Wl[2], back: true, cloud: 0 },
          { x: lf(9.4, 3.3)[0], z: lf(9.4, 3.3)[1], look: Wl[6], back: true, cloud: 0 },
          { x: lf(9.2, 4.2)[0], z: lf(9.2, 4.2)[1], look: Wl[1], back: true, cloud: 0 },
          { x: -1.8, z: -11.8, look: Wl[3], back: true, cloud: 1 },
          { x: 1.9, z: -11.6, look: Wl[9], back: true, cloud: 1 },
          { x: rf(6, 2.2)[0], z: rf(6, 2.2)[1], look: Wl[5], back: true, cloud: 2 },
          { x: -9.4, z: 25.4, look: Wl[0], back: true, cloud: 5 },
          { x: -8.0, z: 25.7, look: Wl[7], back: true, cloud: 5 },
          { x: -6.6, z: 25.2, look: Wl[4], back: true, cloud: 5 },
          { x: 24.8, z: -0.9, look: Wl[8], cloud: 3 },
        ],
        musicians: [
          { x: -8.3, z: 22.3, look: { skin: "#c98c64", top: "#2a2730", bottom: "#3d4a7a", hair: "#26222a", cap: "#3b6fe0", bag: "#000" }, kind: "guitar", cloud: 5 },
          { x: -6.6, z: 22.3, look: { skin: "#ecc0a0", top: "#ff8fb1", bottom: "#2a2730", hijab: "#fffdf6", bag: "#000" }, kind: "mic", cloud: 5 },
        ],
        player: b.player,
        clouds,
        light: cars.light,
        walkLeft: cars.walkLeft,
        bowatHere: () => !beaten,
      });
      anim(crowd);
      b.blockers(crowd.solid, 0.3);
      if (import.meta.env.DEV) Object.assign(window, { __bb: { crowd: crowd.debug, light: cars.light, left: cars.walkLeft } });

      if (!beaten) {
        // Bowat turns round every so often to show off the source of it all: PROT!
        const bowat = await b.npc("bowat", 0, 0, 1.8, "boss");
        void bowat.prefetch("fart_back");
        b.animate((t) => {
          const phase = t % 4.2;
          bowat.face(phase > 3.4 ? "back" : "front");
          // The pose swaps in at the middle of each paper flip (about 0.09 s after turning).
          bowat.hold(phase > 3.49 || phase < 0.09 ? "fart_back" : null);
        });
        anim(bowatHaze(0, 0, left, b.player));
        // While the clouds last he sits behind a wall of them: Qish can only shout from the edge.
        b.region((x, z) => left() > 0 && Math.hypot(x, z) < 2.6);
        b.collider([-0.6, -0.35, 0.6, 0.35]);
        b.interact("boss", 0, 0, "Bowat!", 2.8, 4.0);
      } else if (replayUnlocked()) {
        await b.npc("bowat", 4.2, 21.6, 1.8, "replay");
        post(4.2, 21.6, 0.5);
        b.interact("replay", 4.2, 21.6, "Main semula", 2.8, 2.0);
      }
      placeCollectibles(b, "sunway");
      b.root.add(mergeStatic(statics));
    },
  }),

// FotoBooth: a pastel photobooth town on a bright studio day. The road is one long film strip
  // winding like a snake: in from Nyomnyom at the bottom left, east along the bottom, a bend up on the
  // right, back west through the middle, a bend up on the left, and east along the top out to
  // Putrajaya. Photobooth machines line the road (the seven real studios their strips came from, and
  // more), backdrops with ring lights and softboxes, Y2K digicam statues, flash-head street lamps,
  // strips riding the breeze. The giant pink camera in the middle flashes the whole town every few
  // seconds; Bolat ex's Galeri Memori hangs across its front and the fight starts at the easel. Six of
  // the strips blew off the gallery: Qish chases them along the road until each one gets stuck.
  //   bottom run: welcome canisters, Backdrop Alley (north), booths 1-4, Myvi bay (south)
  //   right bend: Taman Strip (strip tree, print kiosk) inside, studio shops outside
  //   middle run: booths, the giant camera plaza (north), photographers (south)
  //   left bend: Taman Backdrop 2 inside (sequin, wings, photo-frame cut-out), shops outside
  //   top run: made-up booths, Studio Flash, the way out
  photobooth: zone({
    id: "photobooth",
    name: "FotoBooth",
    sky: 0xffe2ec,
    fog: 0xffe9f0,
    light: { sun: 2.2, hemi: 1.25, sunColor: 0xfff1ea, hemiSky: 0xfff6fb, hemiGround: 0xc9a6b8 },
    bounds: [-38, -29, 38, 25.5],
    cam: [-21, -16, 21, 15],
    spawns: {
      start: [-33, 18.8, "right"],
      west: [-33, 18.8, "right"],
      east: [33.5, -17.5, "left"],
      myvi: [-20.4, 22.6, "left"],
      boss: [PB_CAM[0] - 5.1, PB_CAM[1] + 6.2, "back"],
    },
    async build(b) {
      const statics = new THREE.Group();
      const add = (...o: THREE.Object3D[]) => statics.add(...o);
      const anim = (a: Anim) => {
        b.root.add(a.group);
        b.animate(a.update);
      };
      const box = (bx: Box) => b.collider(bx);
      const post = (x: number, z: number, r = 0.25) => box([x - r, z - r, x + r, z + r]);
      const near = (x: number, z: number, r: number) => Math.hypot(b.player().x - x, b.player().z - z) < r;
      /** Centre-line z of the road run nearest (x, hint). */
      const runZ = (x: number, hint: number) => SNAKE.nearest(x, hint).z;
      /** The road's north edge under a booth-wide stretch around x. */
      const northEdge = (x: number, hint: number) => Math.min(runZ(x - 1.4, hint), runZ(x, hint), runZ(x + 1.4, hint)) - HW;
      const southEdge = (x: number, hint: number) => Math.max(runZ(x - 1.4, hint), runZ(x, hint), runZ(x + 1.4, hint)) + HW;

      // ---- Ground: mint lawn everywhere, the film-strip road over it, checkered plazas.
      ground(b, "#cdebd8", ["#bfe3cc", "#dff3e6"], 18, [0, -2, 84, 62]);
      b.root.add(filmRoad());
      for (const p of PB_PLAZAS) b.root.add("r" in p ? checkerDisc(p.x, p.z, p.r) : checkerFloor(p.box[0], p.box[1], p.box[2], p.box[3]));
      b.region((x, z) => !pbWalkable(x, z));
      // Lawn flowers wherever nobody walks and nothing stands.
      add(lawnFlowers([-37, -28, 37, 25], (x, z) => !pbWalkable(x, z) && SNAKE.nearest(x, z).d > HW + 0.7 && Math.abs(x - PB_CAM[0]) > 7.5, 1100));
      add(flowerHedge(-37.5, 25, 37.5, 25, 2));

      // ---- Strips on the wind, the giant camera's town-wide flash.
      const wind = flyingStrips([-40, -26, 40, 24], 34);
      anim(wind);
      const wash = screenFlash();
      anim(wash);
      b.animate(() => wash.follow(b.player()));
      const shot = (x: number, z: number) => {
        if (near(x, z, 7) && !dialogOpen()) sfx.shutter();
      };

      // ---- Gates: canister welcome sign on the Nyomnyom end, photo-strip sign on the Putrajaya end.
      b.exit("west", [-38, 16, -36.4, 21.6], [-34.4, 18.8]);
      b.exit("east", [36.4, -20.4, 38, -14.6], [34.4, -17.6]);
      add(signBoard(-31, southEdge(-31, 18.8) + 0.9, `← ${SHORT.cosyplace}`));

      // ---- Photobooth machines along the north side of every run, facing the road.
      const booths: { x: number; hint: number; style: number }[] = [
        // Bottom run: the first four studios they've been to.
        { x: -8.5, hint: 19, style: 0 },
        { x: -4.5, hint: 19, style: 1 },
        { x: -0.5, hint: 19, style: 2 },
        { x: 3.5, hint: 19, style: 3 },
        { x: 7.5, hint: 19, style: 7 },
        // Middle run, either side of the camera plaza.
        { x: -15.3, hint: 2.6, style: 4 },
        { x: -11.5, hint: 2.6, style: 5 },
        { x: 10.9, hint: 2.8, style: 6 },
        // Top run: made-up studios.
        { x: -11, hint: -17.4, style: 8 },
        { x: -6.6, hint: -17.4, style: 9 },
        { x: -2.2, hint: -17.4, style: 10 },
        { x: 2.2, hint: -17.4, style: 11 },
        { x: 6.6, hint: -17.4, style: 7 },
      ];
      const boothFronts: [number, number][] = [];
      booths.forEach(({ x, hint, style }, i) => {
        const z = northEdge(x, hint) - 0.25 - 1.1;
        const bm = boothMachine(x, z, BOOTH_STYLES[style], i + 3, shot, wind);
        add(bm.statics);
        anim(bm);
        box(bm.box);
        boothFronts.push(bm.front);
        // The seven real studios talk about their strips; the made-up ones have their own lines.
        if (style < 7) b.interact(`booth:${style}`, x - 0.6, bm.front[1] - 0.4, "Tengok", 4.3, 1.9);
        else b.interact(`boothx:${style}`, x - 0.6, bm.front[1] - 0.4, "Tengok", 4.3, 1.9);
      });

      // ---- The giant camera in the middle, Galeri Memori across its front.
      const shown = (i: number) => i < 4 || collectDone("photobooth") || save.flag(gotFlag("photobooth", i - 4));
      const cam = giantCamera(PB_CAM[0], PB_CAM[1], shown, (s) => {
        const d = b.player().distanceTo(cam.flashPos);
        if (d > 26 || dialogOpen()) return;
        wash.pop(s * THREE.MathUtils.clamp(1 - (d - 7) / 22, 0.3, 0.8));
        sfx.bigFlash();
      }, wind);
      add(cam.statics);
      anim(cam);
      cam.boxes.forEach(box);
      photoboothFx.kick = cam.kick;
      cam.stripX.forEach((x, i) => b.interact(`strip:${i}`, x, cam.stripZ, "Tengok", 2.4, 0.5, () => shown(i)));
      b.interact("camera", PB_CAM[0] - 0.4, cam.stripZ + 0.6, "Tengok", 5.6, 1.4);
      const [ex, ez] = cam.easel;
      if (!bossSpot(b, "bolatex", ex, ez, "Kamera besar", [ex, 2.9, ez - 0.7], 2.6, 1.4)) b.interact("easel", ex, ez, "Tengok", 2.6, 1.4);
      // Ring light and a tripod either side of the plaza.
      const camLights = [studioLight("ring", PB_CAM[0] + 7.6, PB_CAM[1] + 5.4, -2.6, 2.1, 7), studioLight("softbox", PB_CAM[0] - 7.7, PB_CAM[1] + 5.8, 2.5, 2.3, 8)];
      camLights.forEach((l) => {
        anim(l);
        add(l.statics);
        post(l.group.position.x, l.group.position.z, 0.4);
      });
      add(tripodCamera(PB_CAM[0] + 5.6, PB_CAM[1] + 8.6, Math.PI + 0.2));
      post(PB_CAM[0] + 5.6, PB_CAM[1] + 8.6, 0.35);
      add(photoDecal(PB_CAM[0] - 0.4, PB_CAM[1] + 8.8, 1.0));

      // ---- Backdrop Alley (north of the bottom run): three backdrops, lights, tripods, people posing.
      const alley: [BackdropKind, number][] = [["flowers", -26], ["balloons", -21.5], ["neon", -17]];
      alley.forEach(([kind, x], i) => {
        const bd = backdrop(kind, x, 10.7, i);
        add(bd.statics);
        anim(bd);
        box(bd.box);
        add(tripodCamera(x, 14.7, Math.PI));
        post(x, 14.7, 0.35);
        b.interact("backdrop", x, 11.9, "Bergambar", 3.4, 1.3);
      });
      const alleyLights = [studioLight("softbox", -28.6, 12.0, 0.6, 2.3, 1), studioLight("ring", -23.75, 11.7, 0.15, 2.0, 2), studioLight("umbrella", -19.25, 11.8, -0.1, 2.4, 3), studioLight("ring", -14.4, 12.0, -0.6, 2.0, 4)];
      alleyLights.forEach((l) => {
        anim(l);
        add(l.statics);
        post(l.group.position.x, l.group.position.z, 0.4);
      });
      photoboothFx.snap = () => {
        const p = b.player();
        // Whichever backdrop she is at: its lights and the camera on the tripod.
        [...alleyLights, ...p4Lights].forEach((l) => {
          if (Math.hypot(l.group.position.x - p.x, l.group.position.z - p.z) < 6) l.fire(1);
        });
        wash.pop(0.75);
      };

      // ---- Taman Strip (inside the right bend): the strip tree, the print kiosk, benches.
      const tree = stripTree(13.0, 10.6, wind, 1);
      add(tree.statics);
      anim(tree);
      b.region((x, z) => Math.hypot(x - 13.0, z - 10.6) < 1.75);
      b.interact("tree", 13.0, 12.5, "Tengok", 4.4, 1.3);
      const kiosk = printKiosk(13.2, 7.7, wind);
      add(kiosk.statics);
      anim(kiosk);
      box(kiosk.box);
      b.interact("kiosk", 13.2, 8.9, "Tengok", 3.4, 1.4);
      add(pastelBench(10.0, 12.6, 0.9, PASTEL.lilac), pastelBench(16.2, 13.4, -0.7, PASTEL.mint));
      box([9.3, 11.8, 10.7, 13.4]);
      box([15.5, 12.6, 16.9, 14.2]);
      add(flowerTub(9.8, 9.0, 1), flowerTub(16.6, 8.6, 2));
      post(9.8, 9.0, 0.55);
      post(16.6, 8.6, 0.55);

      // ---- Taman Backdrop 2 (inside the left bend): sequin curtain, angel wings, photo-frame cut-out.
      const p4: [BackdropKind, number, number][] = [["sequin", -18.6, -12.35], ["wings", -14.2, -12.35], ["frame", -16.4, -8.2]];
      p4.forEach(([kind, x, z], i) => {
        const bd = backdrop(kind, x, z, i + 4);
        add(bd.statics);
        anim(bd);
        if (kind === "frame") {
          // The cut-out is open in the middle: only its legs are solid.
          post(x - 1.8, z, 0.3);
          post(x + 1.8, z, 0.3);
        } else box(bd.box);
        b.interact("backdrop", x, z + (kind === "frame" ? -0.8 : 1.2), kind === "frame" ? "Bergambar" : "Bergambar", 3.4, 1.3);
      });
      const p4Lights = [studioLight("ring", -20.6, -10.4, 0.7, 2.0, 5), studioLight("softbox", -12.0, -10.2, -0.7, 2.3, 6)];
      p4Lights.forEach((l) => {
        anim(l);
        add(l.statics);
        post(l.group.position.x, l.group.position.z, 0.4);
      });
      add(tripodCamera(-16.4, -5.8, Math.PI));
      post(-16.4, -5.8, 0.35);
      add(photoDecal(-21.9, -8.8, 0.8));

      // ---- Studio Flash (north of the top run): a shoot under way, strobes firing in turn.
      const studio = studioSet(19, -22.6);
      add(studio.statics);
      box(studio.box);
      studio.lights.forEach((l) => {
        anim(l);
        add(l.statics);
        post(l.group.position.x, l.group.position.z, 0.4);
      });
      let strobe = 0;
      b.animate((t) => {
        if (t > strobe) {
          strobe = t + 2.4;
          const i = Math.floor(t / 2.4) % 4;
          if (i < 3) studio.lights[i].fire(1);
          else studio.lights.forEach((l) => l.fire(0.9));
          if (near(19, -20.6, 7) && !dialogOpen()) sfx.shutter();
        }
      });
      b.interact("studio", 19, -20.8, "Tengok", 3.4, 1.8);

      // ---- Digicam statues on the lawn between the middle and top runs (seen from the middle run).
      const statues: [number, number, number, string][] = [
        [13.5, -6.0, 0xd8dce4, "SILVER 2005"], [19.4, -9.6, 0xff9fc0, "PINK 7.1MP"], [25.6, -8.0, 0x8fc4f0, "BIRU ZOOM 3x"],
        [9.4, -11.8, 0xfff0c4, "KUNING 5MP"], [30.2, -9.5, 0xcdb9f2, "UNGU SLIM"],
      ];
      statues.forEach(([x, z, color, label], i) => {
        const s = digicamStatue(x, z, color, label, i);
        add(s.statics);
        anim(s);
      });
      add(heartGarden(17.8, -2.6, 1.1, 1), heartGarden(-31, 8.0, 0.9, 2), filmReel(29.5, -3.0, Math.PI - 0.25), filmReel(-34.5, 4.5, 0));

      // ---- Flash-head street lamps along the road, polaroid bunting across it.
      const lamps: [number, number][] = [
        [-24, northEdge(-24, 19) - 0.5], [-11, northEdge(-11, 19) - 0.5], [5.5, northEdge(5.5, 19) - 0.5], [19.2, 18.0], [26.6, 9.6],
        [8.6, northEdge(8.6, 2.6) - 0.6], [-8.6, northEdge(-8.6, 2.6) - 0.6], [-27.6, -6.2], [-13.3, northEdge(-13.3, -17.4) - 0.6],
        [10.2, northEdge(10.2, -17.4) - 0.6], [26.6, northEdge(26.6, -17.4) - 0.6], [-14, southEdge(-14, 19) + 0.6], [14, southEdge(14, 2.6) + 0.6],
      ];
      lamps.forEach(([x, z], i) => {
        if (SNAKE.nearest(x, z).d < HW + 0.35) return;
        const l = flashLamp(x, z, i);
        add(l.statics);
        anim(l);
        post(x, z, 0.25);
      });
      const across = (x: number, hint: number): [[number, number, number], [number, number, number]] => [[x, 4.3, northEdge(x, hint) - 0.35], [x, 4.3, southEdge(x, hint) + 0.35]];
      const bunting = polaroidBunting([across(-30.5, 19), across(-6.5, 19), across(5.5, 19), across(-9.6, 2.6), across(-0.5, -17.4), across(11.8, -17.4)]);
      add(bunting.statics);
      anim(bunting);

      // ---- Studio shops round the edges, all facing the camera.
      const shops: [number, number, number, string][] = [
        [-31, -25, 6.5, "HARU STUDIO"], [-24.5, -25.5, 6, "SNAP & SMILE"], [-16, -26.5, 7, "POSE POSE"], [-8, -27, 7, "MOMEN ♥"], [0, -27, 7, "SELF STUDIO"],
        [8, -27, 7, "4CUT LAB"], [15.5, -27.5, 6.5, "FILEM KITA"], [27, -26, 7, "KEDAI KAMERA"], [34, -25.5, 5.5, "FRAME IT"],
        [-33.5, -13.2, 6, "STUDIO SENYUM"], [-33.5, -4.6, 6, "CETAK & BINGKAI"], [31.2, 6.4, 7, "Y2K DIGICAM"], [31.2, 15.4, 7, "BOOTH HQ"],
      ];
      shops.forEach(([x, z, w, name], i) => add(studioShop(x, z, w, name, i)));

      // ---- South edge of the bottom run: Myvi bay, benches, tubs; tubs and tripods along the middle run.
      add(myvi(-23.6, 23.0, Math.PI / 2));
      box([-25.5, 22.0, -21.7, 24.0]);
      b.interact("myvi", -23.6, 23.0, "Myvi", 2.2, 2.8);
      add(checkerFloor(-27, southEdge(-23.5, 19) - 0.2, -19.6, 24.8, "#e9e4ee", "#f6f3f8"));
      add(pastelBench(-12.5, 23.3, 0, PASTEL.pink), pastelBench(9.6, 23.0, 0, PASTEL.butter));
      [[-16.5, 23.4], [-2.6, 23.6], [4.8, 23.4], [14.5, 23.0], [-35, 22.8]].forEach(([x, z], i) => add(flowerTub(x, z, i + 3)));
      [[-6.6, 6.4], [4.6, 6.6], [-19.5, 6.6], [19.6, 1.0]].forEach(([x, z], i) => add(flowerTub(x, z, i + 6, 0.9)));
      add(tripodCamera(-1.2, southEdge(-1.2, 2.6) + 0.9, Math.PI + 0.1), tripodCamera(-5.2, -14.0, 0.2));
      for (const [x, z] of [[-26, 6.8], [-12, 8.6], [0, 8.4], [6.5, 8.8], [-30, -16], [23, -11.5]] as const) add(flowerTub(x, z, Math.round(x + z) & 7, 1.1));

      // ---- Velvet rope along both edges, gapped at plaza mouths and booth fronts.
      const ropeGap = (x: number, z: number) =>
        pbInPlaza(x, z, 0.6) ||
        boothFronts.some(([fx, fz]) => Math.abs(x - fx) < 1.75 && Math.abs(z - fz) < 1.6) ||
        Math.hypot(x + 23.6, z - 21.6) < 3.6;
      add(ropeLine(ropeGap));

      // ---- The six strips that blew off the gallery: each sits glowing on the road, flutters on ahead
      // when Qish comes near, and gets stuck on its last spot, where it's an ordinary pickup.
      const chase = !collectDone("photobooth") && !save.hasCard(BOSSES.bolatex.card);
      if (chase) {
        PB_HOPS.forEach((hops, k) => {
          if (save.flag(gotFlag("photobooth", k))) return;
          const fs = fleeingStrip(k + 4, hops, b.player, () => {
            sfx.whip();
          });
          anim(fs);
          const item = collectible("strip", k * 1.3);
          const [fx, fz] = hops[hops.length - 1];
          b.pickup(String(k), fx, fz, item, () => fs.landed());
          // The glowing pickup only shows once the strip has stuck; until then the strip itself flies about.
          b.animate(() => {
            if (save.flag(gotFlag("photobooth", k))) return;
            const l = fs.landed();
            item.group.visible = l;
            fs.group.visible = !l;
          });
        });
      }

      // ---- People: strolling the road both ways, posing at every backdrop, photographers, queues.
      const S = (x: number, z: number) => roadS(x, z);
      const sA0 = S(-34, 18.8);
      const sA1 = S(14, 19);
      const sB0 = S(13, 3);
      const sB1 = S(-14, 3);
      const sC0 = S(-15, -17.5);
      const sC1 = S(33, -17.5);
      const walkers: Walker[] = [
        { path: roadRoute(sA0 + 2, sA1, 0.9), look: PB_LOOKS[0], phase: 0.1, speed: 0.8 },
        { path: roadRoute(sA0 + 6, sA1 + 8, -0.9), look: PB_LOOKS[2], phase: 0.6, speed: 0.75 },
        { path: roadRoute(sA1 - 10, sB0 + 12, -0.8), look: PB_LOOKS[3], phase: 0.3, speed: 0.8 },
        { path: roadRoute(sB0, sB1, 0.8), look: PB_LOOKS[5], phase: 0.7, speed: 0.7 },
        { path: roadRoute(sB0 + 4, sC0 + 10, -0.85), look: PB_LOOKS[6], phase: 0.2, speed: 0.8 },
        { path: roadRoute(sB1 - 6, sC0 + 22, 0.9), look: PB_LOOKS[9], phase: 0.5, speed: 0.75 },
        { path: roadRoute(sC0, sC1, -0.9), look: PB_LOOKS[10], phase: 0.15, speed: 0.8 },
        { path: roadRoute(sC0 + 8, sC1, 0.9), look: PB_LOOKS[7], phase: 0.8, speed: 0.7 },
        { path: roadRoute(sA0 + 14, sA1 - 4, 0), look: PB_LOOKS[8], phase: 0.45, speed: 0.9 },
        { path: roadRoute(sC0 + 4, sC1 - 6, 0.1), look: PB_LOOKS[11], phase: 0.35, speed: 0.85 },
      ];
      const L = (i: number) => PB_LOOKS[i % PB_LOOKS.length];
      const standers: Stander[] = [
        // Backdrop Alley: two posing at each, a photographer behind each tripod.
        ...alley.flatMap(([, x], i) => [
          { x: x - 0.55, z: 11.55, look: L(i * 3), mode: "pose" as const },
          { x: x + 0.5, z: 11.65, look: L(i * 3 + 1), mode: "pose" as const, flip: true },
          { x: x + 0.1, z: 15.45, look: L(i * 3 + 2), mode: "snap" as const, back: true },
        ]),
        // Taman Backdrop 2: posing at the sequin, at the wings, behind the frame; one photographer.
        { x: -19.0, z: -11.5, look: L(4), mode: "pose" },
        { x: -18.1, z: -11.45, look: L(5), mode: "pose", flip: true },
        { x: -14.2, z: -11.5, look: L(7), mode: "pose" },
        { x: -16.75, z: -8.75, look: L(0), mode: "pose" },
        { x: -16.0, z: -8.8, look: L(9), mode: "pose", flip: true },
        { x: -16.3, z: -5.2, look: L(1), mode: "snap", back: true },
        // Queues at the busiest booths.
        ...[0, 2, 5, 10].map((i, k) => ({ x: booths[i].x - 1.75, z: boothFronts[i][1] - 0.45, look: L(k + 2), mode: "queue" as const, lines: ["Lama lagi ke?", "Nak pose apa nanti?", "Lepas ni giliran kita!", "Frame pink ke biru?"] })),
        // Photographers on the lawn shooting the booths and the camera.
        { x: -6.6, z: southEdge(-6.6, 19) + 0.9, look: L(4), mode: "snap", back: true },
        { x: 1.6, z: southEdge(1.6, 19) + 1.0, look: L(1), mode: "snap", back: true },
        { x: -3.4, z: southEdge(-3.4, 2.6) + 0.9, look: L(9), mode: "snap", back: true },
        { x: 3.8, z: southEdge(3.8, 2.6) + 1.1, look: L(2), mode: "snap", back: true },
        // Looking at the gallery, and a selfie by the strap.
        { x: PB_CAM[0] + 3.2, z: cam.stripZ + 0.5, look: L(3), mode: "idle", back: true, lines: ["Comelnya diorang ni", "Strip ni dari mana?", "Siapa couple ni?"] },
        { x: PB_CAM[0] - 6.6, z: PB_CAM[1] + 7.3, look: L(5), mode: "pose" },
        // Taman Strip: a couple on a bench with their strips, the kiosk staffer.
        { x: 9.85, z: 12.75, look: L(0), mode: "idle", seated: true, lines: ["Tengok muka awak ni haha", "Simpan dalam dompet"] },
        { x: 10.4, z: 12.25, look: L(3), mode: "idle", seated: true, flip: true },
        { x: 13.2, z: 6.95, look: { ...L(6), apron: "#3fae8a", carry: "none" }, mode: "vendor", lines: ["Cetak dari phone, RM2!", "Siap seminit!", "Nak bingkai sekali?"] },
        // Studio Flash: the model, the photographer, an assistant.
        { x: 19, z: -22.55, look: L(7), mode: "pose", lines: ["Macam ni okay?", "Rambut saya okay tak?", "Angin! Bagi angin!"] },
        { x: 17.2, z: -20.3, look: L(1), mode: "snap", back: true, lines: ["Cantik! Tahan!", "Dagu sikit... YA!", "Lagi satu, lagi satu!"] },
        { x: 21.6, z: -21.4, look: L(10), mode: "idle" },
        // Shooting the digicam statues, and a selfie at the heart garden.
        { x: 19.4, z: -7.3, look: L(4), mode: "snap", back: true },
        { x: 13.0, z: -3.6, look: L(8), mode: "pose" },
        { x: 21.6, z: -1.2, look: L(2), mode: "pose" },
        // By the canisters, taking a selfie with the sign.
        { x: -30.9, z: 16.0, look: L(11), mode: "pose" },
      ];
      const crowd = await lorbelCrowd(walkers, standers, b.player, 0.62, {
        tint: 0xfff6f0,
        walk: ["Jom photobooth!", "Strip saya terbang!", "Booth mana paling cantik?", "Flash dia terang gila", "Nak frame apa nanti?", "Tunggu gambar kering dulu", "Senyum sikit~", "Satu lagi booth!"],
      });
      anim(crowd);
      add(crowd.statics);
      b.blockers(crowd.solid, 0.34);

      // ---- Day-time life: cloud shadows sweeping over, butterflies round the gardens.
      anim(cloudShadows([-24, 20]));
      anim(butterflies([[-21, 8], [12, 14], [-15, -4], [20, -4], [-33, 21], [0, 23]]));

      b.root.add(mergeStatic(statics));
    },
  }),

  // Lakefront (the zone id stays "dusun" so old saves still work). A calm lake in the middle of the
  // zone on a bright morning, water lilies everywhere, something going on all the way round it. Qish
  // comes in at the bottom-left corner from Lorbel, and the road to KLIA leaves at the top-right corner,
  // over the bridge on the lake's north arm where Snorlax Twin is asleep on a picnic mat.
  //   north-west: batik corner        north: Snorlax bridge        north-east: road out to KLIA
  //   west: picnic lawn               middle: lake, island         east: otters, wakaf, angler
  //   south-west: way in, Taman Lily  south: jetty, anglers' deck  south-east: car boot sale
  dusun: zone({
    id: "dusun",
    name: "Lakefront",
    sky: 0xbfe4f3,
    fog: 0xd3ecf2,
    light: { sun: 2.35, hemi: 1.15, sunColor: 0xfff0d6, hemiSky: 0xf2fbff, hemiGround: 0x6b9a4a },
    bounds: [-29, -25, 29, 22],
    cam: [-26, -23, 26, 22],
    spawns: {
      start: [-25.4, 17.2, "right"],
      west: [-25.4, 17.2, "right"],
      east: [26.2, -19.4, "left"],
      myvi: [16.2, 19.0, "front"],
      boss: [-0.8, -14.8, "right"],
    },
    async build(b) {
      boat.riding = false;
      const box = (x0: number, z0: number, x1: number, z1: number) => b.collider([x0, z0, x1, z1]);
      const post = (x: number, z: number, r = 0.3) => box(x - r, z - r, x + r, z + r);
      const anim = (a: Anim) => {
        b.root.add(a.group);
        b.animate(a.update);
      };
      const statics = new THREE.Group();
      const add = (...o: THREE.Object3D[]) => statics.add(...o);
      const beaten = save.hasCard(BOSSES.snorlax.card);


      // ---- Land, water, banks
      b.root.add(lakeLand(1.2, (p) => {
      // ---- Paths: the way in, the promenade round the lake, the road out
      const ring: [number, number][] = [
        [16.8, -2.6], [17.4, 0.5], [16.4, 4.6], [13.6, 8.6], [8, 11.2], [2, 12.0], [-4, 11.8], [-10, 10.0], [-15, 6.6], [-17.6, 1.6],
        [-17.8, -4], [-16, -9], [-12, -13], [-6, -14.8], [0, -15.0], [4.8, -13.4], [5.2, -13.2],
      ];
      p.path("pavers", ring, 2.4);
      p.path("pavers", [[-31, 18], [-24, 17.2], [-19, 13], [-15.6, 8.4], [-15, 6.6]], 2.4);
      p.path("pavers", [[10.0, -13.2], [14, -15.2], [20, -18.4], [31, -19.4]], 2.4);
      p.path("pavers", [[-2.2, 11.9], [-2.2, 8.4]], 1.6);
      p.path("pavers", [[7.2, 11.4], [7.2, 8.2]], 2.0);
      p.path("pavers", [[-7, -14.9], [-7, -18.3]], 1.8);
      p.path("pavers", [[17.6, 2.2], [21.0, 3.0]], 1.6);

        p.rect("tar", 3.4, 13.4, 17.8, 22.4, 0.25, 1.0);
      }));
      anim(lakeWater());
      anim(shoreFoam());
      add(shoreReeds());
      b.region(wet);
      add(
        lilyPads([
          [-10.5, -4.5, 2.6, 26], [-6, -9.2, 2.2, 18], [3, -9.6, 2.2, 18], [10.8, -6.4, 2.4, 20], [11, 2.2, 2.2, 18], [-8.4, 4.6, 2.2, 16],
          [-11.6, 1.0, 1.4, 10], [7, -2, 2, 12], [1, -2.6, 4.6, 16], [-4, 0.5, 1.8, 10], [4.5, 5.2, 1.2, 6], [12.8, -2.6, 1.4, 10],
        ]),
      );

      // ---- South-west: the way in from Lorbel, the LAKEFRONT letters, Taman Lily
      b.exit("west", [-29.6, 16.6, -28.0, 19.4], [-26.2, 17.6]);
      for (const [x, z, seed] of [[-11.8, 14.2, 4], [-7.8, 14.2, 5], [-11.8, 16.8, 6], [-7.8, 16.8, 7]] as const) {
        add(liliumBed(x, z, 2.6, 1.1, seed));
        box(x - 1.4, z - 0.65, x + 1.4, z + 0.65);
      }
      add(signBoard(-14.2, 13.6, "Taman Lily"));
      post(-14.2, 13.6, 0.2);
      for (let k = 0; k < 26; k++) {
        const a = (k / 26) * Math.PI * 2;
        const hx = 16 * Math.sin(a) ** 3;
        const hz = -(13 * Math.cos(a) - 5 * Math.cos(2 * a) - 2 * Math.cos(3 * a) - Math.cos(4 * a));
        add(potLily(-9.8 + hx * 0.075, 19.8 + hz * 0.075, k % 3 ? 0xff9cc2 : 0xf2558f, k));
      }
      box(-11.1, 18.7, -8.5, 20.8);
      b.interact("heart", -9.8, 18.2, "Tengok", 1.8, 1.6);
      anim(willow(-14.4, 5.4, [0.6, -0.8], 1));
      post(-14.4, 5.4, 0.35);

      // ---- West: the picnic lawn (and the otter that raids it)
      add(picnicMat(-23.0, -1.6, 3.6, 2.8, "#e3350d", 0.05), picnicSpread(-22.7, -1.9, 1));
      for (const [x, z, look, wave] of [[-24.6, -2.3, 0, false], [-21.6, -2.5, 1, false], [-24.3, -0.5, 2, true], [-22.1, -0.4, 4, false]] as const) {
        await b.standee(sitterDoodle(PICNIC_LOOKS[look], wave), x, z, PICNIC_LOOKS[look].kid ? 1.3 : 1.65);
      }
      box(-25.2, -3.1, -20.9, 0.0);
      b.interact("picnic", -23.0, 0.9, "Tengok", 2.4, 1.9);
      anim(otterThief([-10.4, -1.6], [-13.5, -1.6], [-22.7, -1.9], [-21.6, 2.1, -2.5]));
      add(picnicMat(-23.6, 5.4, 2.6, 2.0, "#ff5c93", -0.08), parasol(-24.9, 4.5, "#ff8fb1", "#fffdf6", 2.2, [0.1, 0.12]));
      for (const [x, z, look] of [[-24.2, 5.2, 3], [-23.0, 5.3, 1]] as const) await b.standee(sitterDoodle({ ...PICNIC_LOOKS[look], carry: "drink" }), x, z, 1.65);
      box(-25.0, 4.4, -22.3, 6.2);
      b.interact("couple", -21.6, 5.6, "Tengok", 2.4, 1.6);
      await b.standee(passengerDoodle({ ...PICNIC_LOOKS[4], carry: "none" }), -26.0, -8.2, 1.3);
      anim(soapBubbles(-25.5, 1.0, -8.4));
      post(-26.0, -8.2, 0.3);
      // Frisbee on the open lawn behind the batik corner.
      for (const [x, z, look] of [[-19.6, -18.0, 3], [-13.4, -21.4, 5]] as const) {
        await b.standee(passengerDoodle({ ...LORBEL_LOOKS[look], carry: "none" }), x, z, 1.85);
        post(x, z, 0.3);
      }
      anim(frisbee([-19.4, -18.2], [-13.6, -21.6]));
      add(rainTree(-27.0, -13.0, 1));
      post(-27.0, -13.0, 0.6);
      anim(fallingLeaves(-27.0, -13.0, 4.2, 5));

      // ---- North-west: the batik corner
      const batik = batikCorner(-7, -19.6);
      anim(batik);
      add(batik.statics);
      box(-9.8, -20.3, -4.2, -18.8);
      box(-4.2, -19.9, -2.7, -18.9);
      post(-9.9, -21.3, 0.2);
      post(-4.1, -21.3, 0.2);
      await b.standee(passengerDoodle({ ...VENDOR_LOOKS[1], apron: "#7a2a5a" }), -6.0, -18.55, 1.85);
      await b.standee(passengerDoodle({ ...PICNIC_LOOKS[2], carry: "none" }), -9.4, -18.5, 1.3);
      b.interact("batik", -7, -17.8, "Tengok", 2.9, 2.0);
      anim(willow(-11.6, -10.4, [0.6, 0.6], 3));
      post(-11.6, -10.4, 0.35);

      // ---- The promenade: lily beds, benches, lamps
      for (const [x, z, w, d, seed] of [[-8.8, 8.4, 2.4, 0.9, 1], [4.6, 10.0, 1.6, 0.8, 2], [-3.0, -13.0, 2.4, 0.8, 3], [-19.6, -8.0, 0.9, 2.4, 8]] as const) {
        add(liliumBed(x, z, w, d, seed));
        box(x - w / 2 - 0.1, z - d / 2 - 0.1, x + w / 2 + 0.1, z + d / 2 + 0.1);
      }
      for (const [x, z, rot] of [[2.4, 9.9, Math.PI], [-15.6, -2.6, Math.PI / 2]] as const) {
        const bn = bench(x, z);
        bn.rotation.y = rot;
        add(bn);
        if (rot === Math.PI) box(x - 1.1, z - 0.35, x + 1.1, z + 0.35);
        else box(x - 0.35, z - 1.1, x + 0.35, z + 1.1);
      }
      b.interact("bench", 2.4, 10.6, "Duduk", 1.6, 1.3);
      for (const [x, z] of [[-19.6, 0.4], [-18.6, 9.4], [-3, 13.6], [9.6, 13.0], [19.0, 1.0], [-14.2, -14.6], [3.0, -16.4], [15.2, -17.4]] as const) {
        add(lampPost(x, z));
        post(x, z, 0.15);
      }

      // ---- South: the sampan jetty and the anglers' deck
      add(jetty(JETTY));
      add(sampanKiosk(-4.6, 9.8));
      box(-5.55, 9.1, -3.5, 10.5);
      await b.standee(passengerDoodle({ skin: "#b97a52", top: "#3b6fe0", bottom: "#2a2730", cap: "#ffcb05", hair: "#d9d6cf", bag: "#000", carry: "none" }), -0.6, 9.6, 1.85);
      post(-0.6, 9.6, 0.3);
      b.interact("pakcik", -0.6, 10.1, "Tengok", 2.6, 1.3);
      anim(sampan(b.player));
      b.interact("sampan", JETTY_END[0], JETTY_END[1], "Naik sampan", 1.6, 1.5, () => !boat.riding);
      b.interact("dock", DOCK[0], DOCK[1], "Turun", 1.6, 2.0, () => boat.riding);
      add(fishingDeck(DECK));
      box(5.7, 4.6, 8.7, 5.85);
      anim(
        await anglers(
          [
            { x: 6.4, z: 5.15, y: 0.13, look: FISHER_LOOKS[0], float: [6.0, 1.8] },
            { x: 8.0, z: 5.15, y: 0.13, look: FISHER_LOOKS[1], float: [8.8, 2.1] },
            { x: 17.8, z: -2.3, y: 0, look: FISHER_LOOKS[2], float: [17.8, -5.4] },
          ],
          b.player,
        ),
      );
      add(parasol(18.6, -1.8, "#3fae5a", "#fffdf6", 2.4, [0.12, -0.12]));
      post(17.8, -2.3, 0.35);
      b.interact("pancing", 7.2, 7.0, "Tengok", 2.6, 1.9);
      b.interact("pancing", 17.0, -1.2, "Tengok", 2.6, 1.6);
      anim(willow(12.6, -11.4, [-0.5, 0.8], 2));
      post(12.6, -11.4, 0.35);

      // ---- South-east: car boot sale in the car park
      for (const x of [3.6, 6.4, 9.2, 12.0, 14.8, 17.6]) add(new THREE.Mesh(roundedBox(0.08, 0.02, 3.6), new THREE.MeshBasicMaterial({ color: 0xf2f0ea })).translateX(x).translateY(0.06).translateZ(15.6));
      add(signBoard(3.0, 13.0, "Car Boot Sale"));
      post(3.0, 13.0, 0.2);
      const stalls: [number, BootKind, number, number][] = [
        [5.0, "kuih", 0xf2f0ea, 3.4],
        [7.8, "pokok", 0x3b6fe0, 4.0],
        [10.6, "preloved", 0xc9ccd2, 4.1],
        [13.4, "vinyl", 0x2f8a5a, 4.1],
      ];
      for (const [x, kind, color, L] of stalls) {
        const st = bootStall(x, 14.0 + L / 2, kind, color);
        add(st.group);
        box(x - 1.0, 13.9, x + 1.0, st.tableZ + 0.45);
        b.interact(kind, x, st.tableZ + 1.0, "Tengok", 2.4, 1.3);
      }
      box(12.0, 17.0, 12.4, 20.0);
      b.root.add(myvi(16.2, 15.8, Math.PI));
      box(15.3, 14.0, 17.1, 17.6);
      b.interact("myvi", 16.2, 18.2, "Myvi", 2.2, 1.6);
      for (const [x, z, i] of [[6.0, 18.0, 0], [8.8, 18.6, 1], [11.6, 18.7, 2], [14.4, 18.7, 3]] as const) await b.standee(passengerDoodle(VENDOR_LOOKS[i]), x, z, 1.85);
      for (const [x, z, look] of [[4.6, 20.4, 6], [5.6, 20.6, 3], [8.3, 20.8, 0], [11.3, 20.6, 10], [14.0, 20.8, 4]] as const) {
        await b.standee(passengerDoodle(LORBEL_LOOKS[look]), x, z, LORBEL_LOOKS[look].kid ? 1.35 : 1.85);
        post(x, z, 0.28);
      }

      // ---- East: otters sunbathing on the bank, the wakaf, egrets along the east arm
      for (const [x, z, sz] of [[15.4, 1.6, 0.5], [14.8, 3.4, 0.42], [13.8, 5.2, 0.45], [16.0, 3.0, 0.3]] as const) {
        const rock = new THREE.Mesh(new THREE.SphereGeometry(sz, 24, 16), flat(0xa9a597));
        rock.scale.y = 0.5;
        rock.position.set(x, 0.05, z);
        add(rock);
      }
      anim(islandOtters([{ rest: [15.6, 2.1, 2.6], water: [12.4, 0.8] }, { rest: [14.9, 3.9, 0.3], water: [11.4, 3.2] }, { rest: [14.0, 5.7, 2.0], water: [10.2, 4.0] }], [15.0, 3.6], b.player));
      b.interact("otterden", 15.9, 4.2, "Tengok", 1.6, 1.6, () => !boat.riding);
      add(wakaf(22.4, 3.4));
      box(20.8, 1.8, 24.0, 5.0);
      // Two makcik on the wakaf's front step (inside, the roof would hide them).
      for (const [x, look] of [[21.7, 0], [23.1, 3]] as const) {
        const st = await b.standee(sitterDoodle({ ...PICNIC_LOOKS[look], carry: "drink" }), x, 5.4, 1.65);
        st.position.y = 0.2;
      }
      box(20.9, 5.0, 23.9, 5.8);
      b.interact("wakaf", 22.4, 6.6, "Tengok", 2.6, 1.6);
      // A family picnic and an air kelapa stall on the east lawn.
      add(picnicMat(24.4, 11.6, 3.2, 2.4, "#3b6fe0", 0.1), picnicSpread(24.4, 11.4, 2));
      for (const [x, z, look, wave] of [[23.0, 11.0, 5, false], [25.8, 10.9, 4, true], [24.6, 12.6, 1, false]] as const) {
        await b.standee(sitterDoodle(PICNIC_LOOKS[look], wave), x, z, PICNIC_LOOKS[look].kid ? 1.3 : 1.65);
      }
      box(22.6, 10.3, 26.2, 12.9);
      add(canopy(20.4, 16.2, 2.6, 2.0, "#3fae5a"), kelapaStall(20.4, 16.2));
      box(19.3, 15.7, 21.5, 16.7);
      await b.standee(passengerDoodle(VENDOR_LOOKS[3]), 20.4, 15.4, 1.85);
      b.interact("kelapa", 20.4, 17.4, "Tengok", 2.4, 1.6);
      add(signBoard(19.4, 6.6, "Kawasan Memerang"));
      post(19.4, 6.6, 0.2);

      // ---- North: Snorlax Twin asleep across the bridge
      add(footBridge(BRIDGE));
      if (!beaten) {
        add(tikar(3.3, -13.6, 3.8, 4.6));
        anim(snorlaxTwin(3.3, -13.6, 0, b.player));
        box(1.4, -16.8, 5.45, -11.3);
        b.interact("boss", 0.4, -14.4, "Kejutkan", 2.8, 2.4);
      } else {
        // Fed and asleep again, off the path now, between the batik corner and the bridge.
        add(tikar(1.6, -20.4, 3.8, 4.6));
        anim(snorlaxTwin(1.6, -20.4, 0.2, b.player));
        box(-0.2, -23.4, 3.4, -18.2);
        b.interact(replayUnlocked() ? "replay" : "nap", 1.6, -17.2, replayUnlocked() ? "Main semula" : "Tengok", 2.8, 1.8);
      }

      // ---- North-east: the road out to KLIA
      b.exit("east", [28.0, -20.8, 29.6, -18.0], [26.4, -19.4]);
      anim(iceCreamBike(19.4, -16.0, b.player));
      box(18.7, -16.6, 20.2, -14.8);
      add(signBoard(11.6, -16.0, "KLIA ↗"));
      post(11.6, -16.0, 0.2);
      for (const [x, z, seed] of [[16.0, -12.6, 9], [22.6, -15.6, 10]] as const) {
        add(liliumBed(x, z, 2.4, 0.9, seed));
        box(x - 1.3, z - 0.55, x + 1.3, z + 0.55);
      }
      {
        const bn = bench(18.8, -20.6);
        add(bn);
        box(17.7, -21.0, 19.9, -20.2);
      }

      // ---- Trees all round, hills and the far side
      for (const [x, z, s] of [
        [-27.6, 13.4, 1.1], [-26.6, 21.0, 0.8], [-17.4, 20.6, 0.85], [-27.8, -20.6, 1.2], [-22.0, -22.6, 1.0], [-14.6, -21.6, 1.1], [-21.2, 8.2, 0.85],
        [-20.6, -15.6, 1.0], [13.6, -22.0, 1.1], [17.4, -23.2, 1.0], [23.6, -14.0, 1.1], [25.6, -10.6, 0.9], [14.8, -9.6, 0.8],
        [25.4, 9.6, 1.2], [27.0, 15.0, 1.0], [21.6, 12.6, 0.9], [27.4, -2.6, 1.1], [20.2, 18.0, 0.9],
      ] as const) {
        add(roundTree(x, z, s, 0x4f9a3a));
        post(x, z);
      }
      add(rainTree(24.6, 19.6, 4), rainTree(5.0, -23.4, 5));
      for (let k = 0; k < 16; k++) {
        const x = -30 + k * 4.1;
        const z = -27.4 - (k % 3) * 1.6;
        add(k % 4 === 1 ? rainTree(x, z - 1.5, k) : roundTree(x, z, 1.2 + (k % 3) * 0.25, k % 2 ? 0x4a9038 : 0x3f8a3a));
      }
      for (const [x, z, r, c] of [[-34, -40, 16, 0x6fae4f], [-6, -44, 18, 0x7cb85a], [22, -42, 17, 0x68a84a], [42, -30, 14, 0x74b356], [44, 8, 14, 0x6fae4f]] as const) add(hill(x, z, r, c));

      // ---- The island and the otters out on the water
      add(roundTree(1.4, -3.0, 1.15, 0x4a9038), roundTree(2.9, -4.0, 0.7, 0x5aa040));
      for (const [x, z, sz] of [[0.2, -2.6, 0.5], [2.6, -4.2, 0.42], [1.6, -1.4, 0.38], [-0.8, -2.8, 0.3]] as const) {
        const rock = new THREE.Mesh(new THREE.SphereGeometry(sz, 24, 16), flat(0xa9a597));
        rock.scale.y = 0.5;
        rock.position.set(x, 0.05, z);
        add(rock);
      }
      anim(islandOtters([{ rest: [0.4, -3.4, 0.3], water: [-2.4, -2.0] }, { rest: [2.6, -2.2, 2.4], water: [4.8, -1.2] }], [1.3, -2.8], b.player));
      anim(otterFamily([1, -2.6], 8.2, 5.0, b.player));
      anim(otterPair(-7.5, -6.4));
      b.interact("otter", 1.4, 0.6, "Tengok", 1.6, 2.2, () => boat.riding);
      b.interact("otterpair", -7.5, -6.4, "Tengok", 1.4, 2.4, () => boat.riding);
      anim(butterflies([[-11.8, 14.2], [-7.8, 16.8], [-8.8, 8.4], [-9.8, 19.8], [4.6, 10.0], [-3.0, -13.0], [-19.6, -8.0]]));

      // ---- Morning walkers and joggers on the promenade (they turn back before Snorlax Twin)
      const south: [number, number][] = [[-15, 6.6], [-10, 10.0], [-4, 11.8], [2, 12.0], [8, 11.2], [13.6, 8.6], [16.4, 4.6], [17.2, 0.6]];
      const west: [number, number][] = [[-15, 6.6], [-17.6, 1.6], [-17.8, -4], [-16, -9], [-12, -13], [-6, -14.8], [-2.4, -15.0]];
      anim(
        await joggers(
          [
            { path: south, look: JOG_LOOKS[1], phase: 0.1 },
            { path: west, look: JOG_LOOKS[6], phase: 0.55 },
            { path: south, look: WALK_LOOKS[0], kind: "walk", phase: 0.65 },
            { path: west, look: WALK_LOOKS[2], kind: "walk", phase: 0.2 },
            { path: south, look: JOG_LOOKS[3], kind: "bike", bike: "#ff8fb1", phase: 0.35 },
          ],
          b.player,
          {
            jog: ["Pagi-pagi dah jogging!", "Satu round tasik!", "Fuh, penat...", "Lepas ni roti canai", "Strava dah on?"],
            walk: ["Jalan pagi, sihat!", "Tengok lily kejap", "Makcik jalan je", "Hayun tangan!", "Udara pagi sedap"],
            bike: ["Ting ting!", "Angin pagi sedap!"],
            pass: ["Tumpang lalu~", "Excuse me!", "Tepi sikit dik~", "Ops, sorry!"],
            buddy: ["Jom sama-sama!", "Semangat dik!", "Pace awak okay!"],
          },
        ),
      );

      // ---- Little life
      anim(dragonflies([[-12.2, 0], [-4, 7.0], [8, 6.4], [-11, -7], [13, -4], [4, -8], [-5, -10.8], [18, -6.2]]));
      anim(fishJumps());
      anim(egrets([[-13.2, -5.4], [10.2, -10.2], [24.6, -4.6], [21.0, -8.4], [-5.0, -12.2], [-11.4, 4.0], [27.0, -9.0]], b.player));
      anim(birds([-20, 10]));
      anim(cloudShadows([-18, 16]));

      placeCollectibles(b, "dusun");
      b.root.add(mergeStatic(statics));
    },
  }),

  // KLIA, Sepang (the zone id stays "angkasa" so old saves still work). Golden hour at the airport
  // where Babah works: terminal and departures board on the left, his plane on stand 8 on the right,
  // the runway behind the airside fence, taxis and the KLIA blocks out front.
  angkasa: zone({
    id: "angkasa",
    name: "KLIA",
    sky: 0xf4b98e,
    fog: 0xf2c6a2,
    light: { sun: 1.7, hemi: 0.9, sunColor: 0xffc893, hemiSky: 0xfff0dc, hemiGround: 0x76718e },
    bounds: [-23, -4.6, 23, 14],
    spawns: { ...STANDARD_SPAWNS, boss: [17.8, 2.4, "front"], babah: [12.1, 2.4, "front"] },
    async build(b) {
      const box = (x0: number, z0: number, x1: number, z1: number) => b.collider([x0, z0, x1, z1]);
      const post = (x: number, z: number, r = 0.25) => box(x - r, z - r, x + r, z + r);
      const anim = (a: Anim) => {
        b.root.add(a.group);
        b.animate(a.update);
      };
      const statics = new THREE.Group();
      const add = (...o: THREE.Object3D[]) => statics.add(...o);

      add(splatGround([0, -4, 120, 90], (p) => {
        p.rect("pavers", -27, 3, 27, 6.2, 0.15, 0.8);
        p.rect("pavers", -23, -1.7, -2.6, 3.2, 0.15, 0.8);
        p.rect("pavers", -2.6, -9.6, 26, 3.0, 0.15, 0.8);
        p.rect("tar", -19, 7.2, -11, 12, 0.2, 0.8);
      }, { grass: 7, dirt: 3.2, tar: 5, pavers: 5 }, 10, "grass", { pavers: "airport_concrete" }));
      standardLayout(b, { ...neighbours("angkasa"), ground: false });

      // ---- Airside: Babah's plane on stand 8, the baggage train behind it.
      add(airsideFence(-60, 60, -10.1));
      add(apronSlab(-2.6, -9.6, 26, 2.8, { x: 12.5, z: -3.6, label: "8" }));
      const plane = babahPlane(12.5, -3.6, babahFixed);
      anim(plane);
      plane.boxes.forEach((bx) => b.collider(bx));
      add(stairsTruck(15.8, -2.65));
      box(15.0, -2.7, 16.6, 0.9);
      add(fuelTruck(3.6, -3.6, Math.PI / 2));
      box(1.6, -4.6, 5.6, -2.7);
      anim(bagTrain(-1, 22, -7.3));
      for (const x of [-1.6, 24.6]) add(floodMast(x, -9.2));
      add(lightPool(0.6, -6.4, 3.4), lightPool(22.4, -6.4, 3.4));
      anim(controlTower(22.6, 0.2));
      box(21.9, -0.5, 23.3, 0.9);

      // ---- Runway 08/26 right in front, behind a low fence: planes take off and land past the camera.
      add(runway(-6.5, 90, 8.6, 12.6));
      anim(runwayLights(-6.5, 90, 8.6, 12.6));
      anim(runwayTraffic(-6.5, 10.6));
      add(airsideFence(-7, 60, 7.4, 0.9));
      const side = airsideFence(7.4, 16, 0, 0.9);
      side.rotation.y = -Math.PI / 2;
      side.position.x = -7;
      add(side);
      box(-7.2, 7.2, 23, 7.6);
      box(-7.2, 7.2, -6.8, 14);
      b.interact("runway", 8, 6.8, "Tengok", 1.6, 1.4);
      anim(windsock(-8.6, 13.4));

      // ---- Terminal front: flags, departures board, trolleys, people coming and going.
      const term = terminal(-21.5, -3.5, -10.6, -1.6);
      add(term.group);
      b.collider(term.box);
      add(kliaLetters(-12.5, 4.75, -1.9, 0.62));
      b.interact("terminal", -13, -1.4, "Tengok", 2.8, 1.6);
      for (let i = 0; i < 3; i++) {
        anim(jalurGemilang(-20.6 + i * 1.4, -1.0, i * 0.8));
        post(-20.6 + i * 1.4, -1.0, 0.15);
      }
      anim(flipBoard(-8.2, -1.05));
      box(-10.4, -1.35, -6.0, -0.75);
      b.interact("board", -8.2, -0.5, "Baca", 4.0, 1.8);
      add(trolleys(-5.4, -0.7));
      box(-5.7, -1.2, -4.0, -0.2);
      add(bench(-13.6, 2.3));
      box(-14.7, 1.9, -12.5, 2.7);
      for (const [x, z] of [[-22.3, 1.6], [-3.4, 1.9]] as const) {
        add(palm(x, z, 0.9, x));
        post(x, z, 0.35);
      }
      anim(
        await passengers([
          { x0: -18.4, x1: -11.2, z: -0.25, look: PASSENGER_LOOKS[0], speed: 1.1, phase: 0 },
          { x0: -19.5, x1: -6.2, z: 0.75, look: PASSENGER_LOOKS[1], speed: 1.4, phase: 0.45 },
          { x0: -14.5, x1: -4.2, z: 1.45, look: PASSENGER_LOOKS[2], speed: 0.9, phase: 0.7 },
          { x0: -13.8, x1: -4.6, z: 1.65, look: PASSENGER_LOOKS[3], speed: 0.9, phase: 0.78 },
          { x0: -21, x1: -15.4, z: 0.2, look: PASSENGER_LOOKS[4], speed: 0.8, phase: 0.2 },
        ]),
      );

      // ---- Landside: Myvi parking and the taxi rank, west of the runway.
      for (const x of [-7, 2, 11, 19]) {
        add(lampPost(x, 6.9));
        post(x, 6.9, 0.18);
      }
      for (const [x, z] of [[-22, 8.4], [-12.4, 13.2], [-20.6, 13.4]] as const) {
        add(palm(x, z, 1, x + z));
        post(x, z, 0.3);
      }
      add(
        meadow([-34, 6.4, 34, 18], [
          [-19.4, 7, -10.6, 12.4],
          [-11.2, 8.1, -7.3, 12.3],
          [-6.6, 8.4, 90, 12.8],
        ], 300, 110),
        meadow([-40, -12.6, 40, -10.4], [], 120, 20),
      );
      anim(birds([-12, 10]));
      anim(cloudShadows([-10, 14]));
      anim(flyoverShadow());
      placeCollectibles(b, "angkasa");
      b.root.add(mergeStatic(statics));

      // ---- Babah, beside his engine: photo-referenced uniform, living doodle idle.
      const babah = await b.npc("babah", 12.1, 0.45, 2.5, "babah");
      b.animate((t) => (babah.group.rotation.z = babahFixed() ? 0 : Math.sin(t * 5) * 0.025));
      b.interact("babah", 12.1, 0.45, "Cakap", 3.1, 2.2);
      const bang = bangMarker(12.1, 3.5, 0.45, () => !save.hasCard(BOSSES.blep.card) && (!save.flag("babahMet") || collectDone("angkasa")));
      b.root.add(bang.sprite);
      b.animate(bang.update);
      // After the ending Babah offers the rematch himself, so Blep's card-back standee only stands here until beaten.
      // All flight and rematch interactions go through Babah.
    },
  }),

  // Nyomnyom City (zone id "cosyplace" so old saves still work): a round food town cut like a pizza, on
  // a tiny planet. Cosy Place, the fine-dining rotunda of the first date, is in the middle; a ring road
  // goes round it, eight brick streets run out to the crust, and every slice is a place to eat. In from
  // KLIA at the bottom, out to FotoBooth at the top right. Bowat bolts on arrival and eats his
  // way round the slices without paying: Qish follows and settles each bill, and at the end he is at
  // table 8 in Cosy Place with her first-date lasagna, about to evolve.
  cosyplace: zone({
    id: "cosyplace",
    name: "Nyomnyom City",
    sky: 0xf6b98a,
    fog: 0xf0a888,
    light: { sun: 1.55, hemi: 0.95, sunColor: 0xff9f62, hemiSky: 0xc8a8e0, hemiGround: 0x6a5648 },
    planet: {
      radius: 30,
      camOffset: [0, 15.5, 17.5],
      fov: [40, 54],
      sky: ["#2e2f6e", "#5b3f86", "#a95c8f", "#f07f6a", "#ffb27a", "#ffd9a6", "#ffd9a6", "#ffd9a6", "#ffd9a6"],
    },
    bounds: [-35.5, -35.5, 35.5, 35.5],
    cam: [-40, -40, 40, 40],
    spawns: {
      // Far enough in that the welcome arch isn't between the camera and Qish.
      start: [0, 28.6, "back"],
      west: [0, 28.6, "back"],
      east: [...polar(30.6, EXIT_A), "front"] as [number, number, "front"],
      myvi: [...nyomPoint(157.5, 22.2, 1.0), "right"] as [number, number, "right"],
      boss: [MEJA8[0] + 0.2, MEJA8[1] + 1.7, "back"],
    },
    companion: () => save.hasCard(BOSSES.megabowat.card),
    async build(b) {
      const statics = new THREE.Group();
      const add = (...o: THREE.Object3D[]) => statics.add(...o);
      const anim = (a: Anim) => {
        b.root.add(a.group);
        b.animate(a.update);
      };
      const beaten = save.hasCard(BOSSES.megabowat.card);
      b.root.add(cityFloor(), outerGrass(), crust());
      b.region(outsideCity);

      // ---- Gates in the crust: KLIA at the bottom, FotoBooth top right.
      b.exit("west", [-STREET_W / 2, 33.4, STREET_W / 2, 36], [0, 28.8]);
      const ex = polar(33.9, EXIT_A);
      b.exit("east", [ex[0] - 1.1, ex[1] - 1.1, ex[0] + 1.1, ex[1] + 1.1], polar(31.4, EXIT_A));

      // ---- The slices. Each shop is baked on its own so it can drop out of the draw once it's over
      // the horizon.
      const cull = horizonCull(b.player);
      b.animate(cull.update);
      const shops = SHOPS.map(buildShop);
      shops.forEach((sh, i) => {
        const [cx, cz] = polar(SHOPS[i].r, SHOPS[i].a);
        const baked = mergeStatic(sh.statics);
        b.root.add(baked);
        cull.at(baked, cx, cz, 9);
        add(sh.plates);
        sh.anims.forEach((a) => {
          anim(a);
          cull.at(a.group, cx, cz, 9);
        });
        sh.boxes.forEach((bx) => b.collider(bx));
        sh.lights.forEach((l) => b.root.add(l));
      });
      SHOPS.forEach((sp, i) => b.interact(`shop:${sp.kind}`, ...sp.vendor, "Cakap", 2.6, 1.5, () => !resitWaiting(i)));
      const scale = SHOPS.find((sp) => sp.kind === "malatang")!;
      b.interact("scale", ...local(scale.a, scale.r, -0.6, 4.6, scale.out), "Timbang", 1.6, 1.1);

      // Car park slice: the Myvi, two more cars, an air balang stall and the city map.
      const PARK = 157.5 * DEG;
      const parked: [number, number, number][] = [[22.2, 3.6, -1], [27.4, 3.6, 0xf2f0ea], [24.8, -3.6, 0x3b6fe0]];
      parked.forEach(([r, t, color]) => {
        const [x, z] = nyomPoint(157.5, r, t);
        const car = color < 0 ? myvi(x, z, facing(PARK)) : placeAt(carMesh(color, "car"), PARK, 0);
        if (color >= 0) car.position.set(x, 0, z);
        add(car);
        b.collider([x - 1.3, z - 1.3, x + 1.3, z + 1.3]);
      });
      const [mx, mz] = nyomPoint(157.5, 22.2, 3.6);
      b.interact("myvi", mx, mz, "Myvi", 2.2, 2.8);
      const [bx, bz] = nyomPoint(157.5, 21.5, -3.4);
      const balang = foodStall(bx, bz, "balang", facing(PARK));
      add(balang.statics);
      anim(balang.anim);
      b.collider(balang.box);
      add(cityMap(PARK, 17.4));
      const [px, pz] = polar(17.4, PARK);
      b.collider([px - 0.9, pz - 0.5, px + 0.9, pz + 0.5]);
      b.interact("peta", px, pz, "Tengok", 3.2, 1.8);

      // ---- Street furniture: lamps either side of every street mouth, pepperoni planters, trees.
      for (let i = 0; i < 8; i++) {
        for (const off of [-11.5, 11.5]) {
          const [x, z] = polar(WALK_OUT - 0.25, (i * 45 + off) * DEG);
          const lamp = streetLamp(x, z);
          add(lamp.group, lamp.glow, lamp.pool);
          b.collider([x - 0.2, z - 0.2, x + 0.2, z + 0.2]);
        }
        const mid = (22.5 + i * 45) * DEG;
        for (const off of [-14, 14]) {
          const [x, z] = polar(17.6, mid + off * DEG);
          add(pepperoni(x, z, 1, i * 2 + (off > 0 ? 1 : 0)));
          b.collider([x - 0.75, z - 0.75, x + 0.75, z + 0.75]);
        }
        for (const off of [-15, 15]) {
          const [x, z] = polar(31.0, mid + off * DEG);
          add(cityTree(x, z, 1.1, i * 5 + off));
          b.collider([x - 0.3, z - 0.3, x + 0.3, z + 0.3]);
        }
      }
      // Beyond the crust: trees all round, so the horizon is a line of treetops against the sunset.
      const rr = (k: number) => (Math.sin(k * 12.9898) * 43758.5453) % 1;
      for (let i = 0; i < 64; i++) {
        const a = (i / 64) * Math.PI * 2 + rr(i) * 0.05;
        const r = 38.5 + Math.abs(rr(i + 7)) * 8;
        const [x, z] = polar(r, a);
        const kind = i % 4;
        add(kind === 0 ? rainTree(x, z, i) : kind === 1 ? oilPalm(x, z, i) : kind === 2 ? mangoTree(x, z, i) : cityTree(x, z, 1.5, i));
      }

      // ---- Cosy Place in the middle.
      const cosy = cosyPlace();
      add(cosy.statics);
      cosy.anims.forEach(anim);
      cosy.boxes.forEach((bx) => b.collider(bx));
      cosy.lights.forEach((l) => b.root.add(l));
      b.interact("maitre", ...MAITRE, "Cakap", 2.6, 1.6);
      b.interact("piano", PIANO[0] + 0.6, PIANO[1] + 1.4, "Dengar", 2.4, 1.4);
      // Mega Bowat is in the kitchen: rematches start at its door.
      const rematch = beaten && replayUnlocked();
      b.interact(rematch ? "replay" : "dapur", KITCHEN_DOOR[0], KITCHEN_DOOR[1] + 0.6, rematch ? "Main semula" : "Tengok", 2.8, 1.4);

      // ---- Bowat. On the first visit he bolts and eats his way round; he sits at the shop he is at
      // until Qish gets close, then dashes on to the next, leaving the bill behind. The receipts
      // (pickups) wait at each shop he has left. Finally he is at table 8 with the lasagna.
      const N = SHOPS.length;
      let fled = collectDone("cosyplace") ? N : collectedCount("cosyplace");
      let bowatAt: THREE.Vector3 | null = null;
      const resitWaiting = (i: number) => !beaten && i < fled && !save.flag(gotFlag("cosyplace", i)) && !collectDone("cosyplace");
      const SEAT: [number, number] = [BOWAT_SEAT[0], BOWAT_SEAT[1]];
      const cosyRoute: [number, number][] = [[0, ROAD_IN - 0.4], [0, ROTUNDA_R + 0.6], [-1.9, 4.2], [-1.9, 1.6], SEAT];
      const spotOf = (i: number) => (i < N ? SHOPS[i].eat : SEAT);
      const SIT_Y = 0.32; // stool and chair seat height
      const atTable = () => !beaten && fled >= N && run === null;
      let run: { pts: [number, number][]; cum: number[]; s: number } | null = null;
      const startRun = (from: [number, number]) => {
        const pts = fled < N ? bowatTrail(from, SHOPS[fled].eat) : bowatTrail(from, SEAT, cosyRoute);
        const cum = [0];
        for (let k = 1; k < pts.length; k++) cum.push(cum[k - 1] + Math.hypot(pts[k][0] - pts[k - 1][0], pts[k][1] - pts[k - 1][1]));
        run = { pts, cum, s: 0 };
      };
      if (!beaten) {
        const bw = await new PaperSprite(1.8).load("bowat");
        void bw.prefetch("sit_eat_front_0", "sit_eat_front_1", "sit_eat_side_0", "sit_eat_side_1");
        if (import.meta.env.DEV) Object.assign(window, { __nyomBowat: bw });
        b.root.add(bw.group);
        bowatAt = bw.group.position;
        const word = popWord(2.6, 2.2);
        b.root.add(word.sprite);
        // A "!" over him while he sits eating, so he's easy to spot from across the city.
        const mark = bangMarker(0, 0, 0, () => arrived() && run === null && fled < N);
        b.root.add(mark.sprite);
        shops.forEach((sh, i) => (sh.plates.visible = i < fled));
        const arrived = () => save.flag("nyomArrived") || collectDone("cosyplace");
        let placed = false;
        let nextWord = 0;
        let last = -1;
        let wasArrived = arrived();
        b.animate((t) => {
          const dt = last < 0 ? 0 : Math.min(0.1, t - last);
          last = t;
          const p = b.player();
          const g = bw.group.position;
          let moving = false;
          if (arrived() && !wasArrived) {
            // The arrival scene is over: he's off to the first shop.
            wasArrived = true;
            word.say("NYOM NYOM!!");
            startRun([g.x, g.z]);
          }
          if (!arrived()) {
            // Beside Qish while she takes it all in; then he's off.
            if (!placed) g.set(p.x - 1.3, 0, p.z - 0.4);
            placed = true;
            bw.face("front");
            bw.hold("sniff");
            if (t > nextWord) {
              nextWord = t + 2.2;
              word.say("*sniff sniff*");
            }
          } else if (run) {
            const r = run;
            r.s += dt * 6.8;
            const end = r.cum[r.cum.length - 1];
            let k = 1;
            while (k < r.cum.length - 1 && r.cum[k] < r.s) k++;
            const [ax, az] = r.pts[k - 1];
            const [bx2, bz2] = r.pts[k];
            const f = Math.min(1, (r.s - r.cum[k - 1]) / (r.cum[k] - r.cum[k - 1] || 1));
            g.set(ax + (bx2 - ax) * f, 0, az + (bz2 - az) * f);
            bw.hold(null);
            const dx = bx2 - ax;
            const dz = bz2 - az;
            bw.face(Math.abs(dx) > Math.abs(dz) ? (dx > 0 ? "right" : "left") : dz > 0 ? "front" : "back");
            moving = true;
            if (r.s >= end) {
              run = null;
              shops.forEach((sh, i) => (sh.plates.visible = i < fled));
            }
          } else {
            // Sitting and eating, bobbing over his plate.
            const [sx, sz] = spotOf(fled);
            if (!placed || Math.hypot(g.x - sx, g.z - sz) > 0.01) g.set(sx, 0, sz);
            placed = true;
            bw.face(fled < N ? "front" : "right");
            // Sat down with a cookie: chew, chew, big bite.
            bw.hold(`sit_eat_${fled < N ? "front" : "side"}_${Math.floor(t * 2.6) % 3 === 2 ? 1 : 0}`);
            g.y = SIT_Y + Math.abs(Math.sin(t * 5)) * 0.03;
            if (t > nextWord) {
              nextWord = t + 1.8 + Math.random();
              word.say(["nyom", "NYOM NYOM", "nyom~", "*kunyah*", "sedap..."][Math.floor(Math.random() * 5)]);
            }
            const near = Math.hypot(p.x - g.x, p.z - g.z) < 4.3;
            if (near && fled < N && !dialogOpen()) {
              word.say("!! NYOM!");
              fled++;
              g.y = 0;
              bw.hold(null);
              startRun([g.x, g.z]);
            }
          }
          if (run || !arrived()) g.y = 0;
          bw.update(dt, moving);
          word.update(t, g.x, g.z);
          mark.update(t);
          mark.sprite.position.set(g.x, mark.sprite.position.y + 3.0 + g.y, g.z);
        });
      }
      // Table 8: look at it, or (Bowat there) face him; rematches happen at the kitchen door.
      b.interact("table", MEJA8[0], MEJA8[1] + 0.9, "Tengok", 1.9, 1.5, () => !atTable());
      b.interact("boss", MEJA8[0], MEJA8[1] + 0.9, "Bowat!", 1.9, 1.5, () => atTable());
      const bang = bangMarker(BOWAT_SEAT[0], 3.2, BOWAT_SEAT[1], () => atTable() && collectDone("cosyplace"));
      b.root.add(bang.sprite);
      b.animate(bang.update);
      // Each receipt waits at the shop Bowat has run off from.
      if (!collectDone("cosyplace") && !beaten) {
        SHOPS.forEach((sp, i) => {
          if (save.flag(gotFlag("cosyplace", i))) return;
          const item = collectible("resit", i * 1.3);
          b.pickup(String(i), ...sp.resit, item, () => i < fled);
          // Hidden until he has run off from this shop; after that the pickup looks after itself.
          let shown = false;
          b.animate(() => {
            if (i >= fled) item.group.visible = false;
            else if (!shown) item.group.visible = shown = true;
          });
          const m = bangMarker(...v3of(sp.vendor, 3.0), () => resitWaiting(i));
          b.root.add(m.sprite);
          b.animate(m.update);
        });
      }

      // ---- People: strolling the outer sidewalk both ways, up and down the streets, round the
      // plaza; waiters in Cosy Place; diners, queues and shopkeepers at every slice.
      const ring = (r: number, dir: 1 | -1, n = 36): [number, number][] => Array.from({ length: n }, (_, k) => polar(r, (dir * k * 2 * Math.PI) / n));
      const walkers: Walker[] = [
        ...[0, 1, 2, 3, 4, 5].map((i) => ({ path: ring(SIDEWALK_R, i % 2 ? 1 : -1), look: NYOM_LOOKS[i], loop: true, phase: i / 6, speed: 0.9 })),
        ...[0, 2, 4, 6].map((k, i) => ({ path: [polar(WALK_OUT + 0.4, k * 45 * DEG + 0.04), polar(CITY_R - 1.2, k * 45 * DEG + 0.04)], look: NYOM_LOOKS[6 + i], phase: i * 0.27 })),
        ...[0, 1].map((i) => ({ path: ring(9.25, i ? 1 : -1, 28), look: NYOM_LOOKS[10 + i], loop: true, phase: i * 0.5, speed: 0.6 })),
        ...cosy.walkers,
      ];
      const standers = [...shops.flatMap((sh) => sh.crowd), ...cosy.crowd];
      const crowd = await lorbelCrowd(walkers, standers, b.player, 60 / 96);
      anim(crowd);
      for (const o of crowd.group.children) if (!(o as THREE.Sprite).isSprite) cull.follow(o);
      add(crowd.statics);
      anim(cosy.doors(crowd.solid));
      b.blockers(crowd.solid, 0.34);
      const traffic = ringTraffic(() => (bowatAt ? [b.player(), bowatAt] : [b.player()]));
      anim(traffic);
      b.blockers(traffic.solid, 0.9);

      b.root.add(mergeStatic(statics));
    },
  }),

  // Lorbel (Lorong Belakang), Cyberjaya: the back lanes behind a row of shops, a pasar malam by night.
  // The zone id stays "galeri" so old saves still work. Laid out from Faris's sketch: Qish comes in from
  // the left along Lorong Datang to the main corridor that runs top to bottom. Up the corridor are the
  // bundle stalls, down it the food stalls (both sides), with the vendors' vans parked behind them. The
  // busking stage sits left of the corridor facing right, round tables across the corridor facing it;
  // Bolat's fight starts at the stage. The way on is Lorong Keluar, back out to the left.
  galeri: zone({
    id: "galeri",
    name: "Lorbel",
    sky: 0x1c1830,
    fog: 0x241d38,
    light: { sun: 0.8, hemi: 0.6, sunColor: 0xffb877, hemiSky: 0x8a80c8, hemiGround: 0x3a2a30 },
    bounds: [-31, -26, 16.2, 26.2],
    cam: [-16, -18.5, 3, 18.5],
    spawns: {
      start: [-28.4, -6.9, "right"],
      west: [-28.4, -6.9, "right"],
      east: [-28.4, 9.3, "right"],
      myvi: [-19.4, 1.5, "front"],
      boss: [-0.4, 1.2, "left"],
    },
    async build(b) {
      const box = (x0: number, z0: number, x1: number, z1: number) => b.collider([x0, z0, x1, z1]);
      const anim = (a: Anim) => {
        b.root.add(a.group);
        b.animate(a.update);
      };
      const statics = new THREE.Group();
      const add = (...o: THREE.Object3D[]) => statics.add(...o);
      const BEAT = 60 / 92;
      const wallZ = (x: number, z0: number, z1: number) => {
        const w = lowWall(z0, z1, 0);
        w.rotation.y = -Math.PI / 2;
        w.position.x = x;
        return w;
      };
      // The corridor's walkway is x -2..2; the stalls line it on both sides.
      const CW = 2;

      add(splatGround([-6, 0, 110, 100], (p) => {
        p.rect("tar", -31, -4.3, -7.1, 6.9, 0.18, 0.8);
        p.rect("tar", -31, 12, -6.8, 26.4, 0.18, 0.8);
      }, undefined, 8, "tar"));
      for (const [x, z, w, d, s] of [[-24, -6.4, 2.4, 1.1, 1], [0.2, -4.6, 2.2, 1.1, 2], [11.8, 1.4, 2.0, 1.0, 3], [0.4, 21.4, 1.6, 1.0, 4], [-11, 9.6, 2.6, 1.1, 5], [0.3, -19.6, 1.6, 1.0, 6]] as const)
        add(puddle(x, z, w, d, s));

      // ---- Shop backs. Tall blocks only stand north of where she walks, so they never hide her;
      // the open sides (the lot behind the stage, the car park, the lot behind the food) are low.
      const blocks = [
        // North of Lorong Datang and west of the bundle stalls: the LORBEL neon and the graffiti.
        shopBlock(-44, -37, -6.5, -9.2, 7.2, { seed: 1, acs: [[-27.5, 4.6], [-12.4, 3.0], [-9.6, 5.0]], heart: true, bins: [-29.8, -8.6] }),
        // The corridor's far end.
        shopBlock(-6.5, -37, 6.5, -25.4, 7.6, { seed: 2, acs: [[-4.2, 4.8], [4.0, 3.2]] }),
        // East of the bundle stalls, behind the tables' top row.
        shopBlock(6.5, -37, 44, -9.4, 7.4, { seed: 3, acs: [[17.4, 4.6]] }),
        // Behind the tables.
        shopBlock(16.2, -9.4, 44, 9.7, 7.0, { seed: 4, acs: [[20, 4.2]] }),
      ];
      for (const bl of blocks) {
        anim(bl);
        add(bl.statics);
      }
      box(-44, -37, -6.5, -9.2);
      box(-6.5, -37, 6.5, -25.4);
      box(6.5, -37, 44, -9.4);
      box(16.2, -9.4, 44, 9.7);
      box(-30.3, -9.2, -29.3, -8.3);
      box(-9.1, -9.2, -6.5, -8.3);
      anim(neonSign("LORBEL", -17, 3.9, -9.15, "#ff4fa0", 5.4, 1.5));
      anim(neonSign("BUNDLE", 0, 5.2, -25.35, "#4fd2ff", 4.4, 1.25));
      anim(neonSign("♥", 12.5, 6.4, -9.35, "#ff5fa2", 1.5, 1.5));
      b.interact("neon", -17, -8.4, "Tengok", 2.2, 1.8);
      b.interact("graffiti", -21.4, -8.6, "Tengok", 1.8, 1.4);

      // ---- The two lanes off to the left: in along Lorong Datang, out along Lorong Keluar.
      b.exit("west", [-32, -8.5, -30.5, -5.3], [-28.6, -6.9]);
      b.exit("east", [-32, 7.7, -30.5, 10.9], [-28.6, 9.3]);
      // The lot behind the stage, between the lanes: low walls, the Myvi, bikes and crates.
      // The car park is walled off from Lorong Datang; cars (and Qish) come in and out from Lorong Keluar through
      // a barrier that lifts when she walks up to it.
      add(lowWall(-31.5, -6.9, -4.45), lowWall(-31.5, -17.6, 7.15), lowWall(-10.4, -6.9, 7.15));
      box(-31.5, -4.6, -6.8, -4.3);
      box(-31.5, 7.0, -17.4, 7.3);
      box(-10.6, 7.0, -6.8, 7.3);
      box(-17.6, 6.9, -16.85, 7.4);
      box(-10.9, 6.9, -10.4, 7.4);
      anim(parkingBoom(-17.1, 7.15, 6.5, () => Math.hypot(b.player().x + 14, b.player().z - 7.15) < 5));
      add(groundPaint("↑ MASUK", -15.6, 4.6, 2.6, 0.9), groundPaint("KELUAR ↓", -12.4, 4.6, 2.6, 0.9));
      slab(b, -17.6, 2.0, -17.5, 6.9, flat(0xd9d5cc), 0.04);
      slab(b, -10.5, 2.0, -10.4, 6.9, flat(0xd9d5cc), 0.04);
      // Parking bays along the top of the lot (so they show from Lorong Datang too); the Myvi nose-out in the
      // middle bay under a light, reachable over the low wall from either lane.
      const BAY_X = [-28.5, -25.9, -23.3, -20.7, -18.1, -15.5, -12.9, -10.3];
      const paint = flat(0xd9d5cc);
      for (const x of BAY_X) slab(b, x - 0.06, -3.9, x + 0.06, 0.9, paint, 0.04);
      slab(b, BAY_X[0], 0.84, BAY_X[BAY_X.length - 1], 0.96, paint, 0.04);
      add(myvi(-19.4, -1.6, 0));
      box(-20.3, -3.5, -18.5, 0.3);
      b.interact("myvi", -19.4, -4.4, "Myvi", 2.2, 1.4);
      b.interact("myvi", -19.4, 0.9, "Myvi", 2.2, 1.4);
      add(signBoard(-27.2, -3.4, "P · PARKING"), warmPool(-19.4, -1.4, 3.4));
      box(-28.1, -3.6, -26.3, -3.2);
      b.root.add(lampLight(-19.4, 4.4, -0.6, 18, 12, 0xffc890));
      for (const [x, z] of [[-25.2, -1.6], [-24.2, -1.5], [-14.8, -1.6], [-14.0, -1.4], [-13.2, -1.6]] as const) {
        add(motorbike(x, z, 0.05));
        box(x - 0.3, z - 0.8, x + 0.3, z + 0.8);
      }
      for (const [x, z] of [[-11.6, -2.0], [-11.0, -0.6], [-8.6, 5.8], [-28.6, 5.6], [-9.0, -3.0], [-27.6, -1.0]] as const) {
        add(crate(x, z));
        box(x - 0.6, z - 0.45, x + 0.6, z + 0.45);
      }
      // The car park south of Lorong Keluar, and the lot behind the east food stalls.
      add(lowWall(-31.5, -6.6, 11.75), wallZ(-6.6, 11.75, 26.4), wallZ(6.6, 9.7, 26.4), lowWall(4.1, 16.2, 9.75), lowWall(-6.6, 6.6, 26.5));
      // Vendors' vans parked tight behind the food stalls, so no empty strip shows behind the kiosks.
      for (const [i, z] of [11.7, 16.0, 20.3].entries()) {
        const cols = [[0xf4f1e6, 0xe3350d], [0x9fb8d8, 0x2a2730], [0xf2d27a, 0x2f8a4a]][i];
        add(vendorVan(-5.35, z + 2.1, Math.PI / 2, cols[0], cols[1]), vendorVan(5.35, z + 2.1, -Math.PI / 2, cols[(i + 1) % 2], cols[i % 2]));
      }
      box(-31.5, 11.6, -4.1, 27.5);
      box(4.1, 9.7, 17, 27.5);
      box(-6.6, 26.3, 6.6, 27.5);
      for (const [x, z, r] of [[-27.8, 14.2, 0.2], [-26.6, 14.3, 0.1], [-16.4, 14.2, -0.2], [-15.2, 14.1, 0.3], [-11.2, 14.3, 0.1], [-20.4, 21.0, 0.2], [-12.0, 21.2, -0.1]] as const) add(motorbike(x, z, r));

      // ---- Busking stage, left of the corridor, facing straight across at the tables.
      const SX = -4.6;
      const SZ = 1.2;
      const SROT = Math.PI / 2;
      const SW = 10;
      const SD = 4.6;
      const stage = await buskingStage(SX, SZ, SROT, BEAT, { w: SW, d: SD, sideBanner: true });
      anim(stage);
      add(stage.statics);
      stage.boxes.forEach((bx) => b.collider(bx));
      if (!bossSpot(b, "bolat", -1.6, SZ, "Pentas", [-2.6, 4.2, SZ], 2.6, 2.2)) b.interact("stage", -1.6, SZ, "Tengok", 2.6, 2.2);
      const stageTop = (lx: number, lz: number): [number, number, number] => [SX + lx * Math.cos(SROT) + lz * Math.sin(SROT), 5.25, SZ - lx * Math.sin(SROT) + lz * Math.cos(SROT)];

      // ---- Round tables across from the stage, facing it.
      // A tidy 3 x 5 grid filling the area from the gallery wall to the low wall, straight aisles, red and blue in a checker (each table's stools match it).
      const tables: [number, number][] = [];
      [5.6, 9.6, 13.6].forEach((x, ci) =>
        [-7.4, -3.6, 0.2, 4.0, 7.8].forEach((z, ri) => {
          tables.push([x, z]);
          const col = (ci + ri) % 2 ? 0x3b6fe0 : 0xd63a3a;
          add(diningTable(x, z, col, col, ci * 4 + ri, true));
          box(x - 0.95, z - 0.95, x + 0.95, z + 0.95);
        }),
      );
      anim(sleepingCat(7.6, 0, -1.7));
      b.interact("cat", 7.6, -1.7, "Tengok", 1.3, 1.2);
      // ---- Up the corridor: bundle stalls both sides, mannequins and a mirror at the far end.
      const BUNDLE = [
        [-4.35, -22.85, 1, 0x3b6fe0, "BUNDLE", "RM5 semua", "bundle"],
        [-4.35, -17.85, 1, 0xe3350d, "JEANS", "RM15 · pilih sendiri", "jeans"],
        [-4.35, -12.85, 1, 0x8a5ad6, "KASUT", "saiz 36-44", "kasut"],
        [4.35, -22.85, -1, 0x2f8a4a, "JAKET", "untuk sejuk aircond", "jaket"],
        [4.35, -17.85, -1, 0xf2a71b, "T-SHIRT", "3 helai RM10", "tshirt"],
        [4.35, -12.85, -1, 0x1fa0a0, "TOPI", "snapback RM10", "topi"],
      ] as const;
      BUNDLE.forEach(([x, z, face, col, text, sub, id], i) => {
        const st = bundleStall(x, z, face, 4.9, col, text, sub, 40 + i * 9, b.player);
        add(st.statics);
        anim(st.anim);
        b.collider(st.box);
        b.interact(id, face * -1.7, z, "Tengok", 2.8, 1.4);
      });
      add(mannequin(1.3, -24.9, "#e3350d"), standMirror(-1.3, -25.0));
      box(0.9, -25.4, 1.7, -24.5);
      box(-1.7, -25.4, -0.9, -24.7);
      b.interact("mirror", -1.3, -24.2, "Tengok", 2.3, 1.0);

      // ---- Down the corridor: food stalls both sides, facing in.
      const STALLS: [number, number, StallKind][] = [
        [-2.95, 13.4, "satay"],
        [-2.95, 17.0, "salai"],
        [-2.95, 20.6, "malatang"],
        [-2.95, 24.2, "ramen"],
        [2.95, 13.4, "balang"],
        [2.95, 17.0, "mango"],
        [2.95, 20.6, "burger"],
        [2.95, 24.2, "takoyaki"],
      ];
      for (const [x, z, kind] of STALLS) {
        const s = foodStall(x, z, kind, x < 0 ? Math.PI / 2 : -Math.PI / 2);
        add(s.statics);
        anim(s.anim);
        b.collider(s.box);
        b.interact(kind, x < 0 ? -1.4 : 1.4, z, "Tengok", 3.6, 1.4);
      }

      // ---- Bulbs. Strings tie off on the shop walls, the stage truss and the stall
      // canopies; the only poles stand in the lot and the car park, out of the way.
      const P = (x: number, y: number, z: number): [number, number, number] => [x, y, z];
      const lotPoles = [-28, -22, -9.6];
      const parkPoles = [-28, -21, -14];
      for (const x of lotPoles) {
        add(lightPole(x, 1.5, 5.6));
        box(x - 0.2, 1.3, x + 0.2, 1.7);
      }
      for (const x of parkPoles) add(lightPole(x, 15.6, 5.4));
      const S: Strand[] = [];
      // Lorong Datang: the wall to the lot poles.
      for (const [wx, pi] of [[-30.5, 0], [-25.5, 0], [-25.5, 1], [-19.5, 1], [-19.5, 2], [-13.5, 2], [-9.5, 2]] as const)
        S.push({ a: P(wx, 4.7, -9.1), b: P(lotPoles[pi], 5.5, 1.5), sag: 1.3 });
      // Lorong Keluar: the lot poles to the car park poles.
      for (const [a, c] of [[0, 0], [0, 1], [1, 1], [1, 2], [2, 2]] as const) S.push({ a: P(lotPoles[a], 5.5, 1.5), b: P(parkPoles[c], 5.3, 15.6), sag: 1.4 });
      S.push({ a: P(-9.6, 5.5, 1.5), b: stageTop(SW / 2, -SD / 2), sag: 1.0 }, { a: P(-9.6, 5.5, 1.5), b: stageTop(-SW / 2, -SD / 2), sag: 1.0 });
      // Bundle corridor: criss-cross between the side walls, all the way up.
      const wW = (z: number) => P(-6.45, 5.0, z);
      const wE = (z: number) => P(6.45, 5.0, z);
      for (let z = -25.2; z < -10; z += 2.8) S.push({ a: wW(z), b: wE(z + 2.8), sag: 0.8 }, { a: wE(z), b: wW(z + 2.8), sag: 0.8 });
      // Over the stage, the corridor and the tables.
      const galL = P(6.5, 5.0, -9.35);
      const galR = P(14.8, 5.0, -9.35);
      const eW = (z: number) => P(16.15, 5.2, z);
      S.push(
        { a: stageTop(SW / 2, SD / 2), b: eW(-6), sag: 1.6 },
        { a: stageTop(SW / 2, SD / 2), b: galL, sag: 1.2 },
        { a: stageTop(0, SD / 2), b: eW(1), sag: 1.6 },
        { a: stageTop(-SW / 2, SD / 2), b: eW(5), sag: 1.6 },
        { a: stageTop(-SW / 2, SD / 2), b: eW(9.5), sag: 1.4 },
        { a: P(-6.45, 5.0, -9.4), b: eW(-2), sag: 1.8 },
        { a: galR, b: eW(-6), sag: 0.8 },
        { a: galL, b: eW(3), sag: 1.6 },
        { a: wE(-9.6), b: stageTop(0, SD / 2), sag: 1.4 },
      );
      // Food corridor: zig-zag between the canopies.
      for (let z = 11.8; z < 25; z += 2.2) S.push({ a: P(-CW, 2.9, z), b: P(CW, 2.9, z + 1.1), sag: 0.4 }, { a: P(CW, 2.9, z + 1.1), b: P(-CW, 2.9, z + 2.2), sag: 0.4 });
      S.push({ a: stageTop(-SW / 2, SD / 2), b: P(-CW, 2.9, 11.8), sag: 0.8 }, { a: eW(9.5), b: P(CW, 2.9, 11.8), sag: 1.2 });
      anim(festoons(S));
      for (const [x, z, r] of [[-25, -6.9, 3.2], [-18, -6.9, 3.2], [-11, -6.9, 3.2], [-25, 9.3, 3.2], [-18, 9.3, 3.2], [-11, 9.3, 3.2], [0, -22, 3], [0, -17, 3], [0, -12, 3], [0, -6.5, 3.5], [0.5, 1, 3.5], [8.5, -3, 4], [12, 3.5, 4], [8, 8, 3], [0, 13.5, 2.8], [0, 18, 2.8], [0, 22.5, 2.8]] as const)
        add(warmPool(x, z, r));
      for (const [x, y, z, i, col] of [
        [-20, 4.2, -6.9, 22, 0xffb468],
        [-20, 4.2, 9.3, 22, 0xffb468],
        [0, 4.6, -18, 26, 0xffc080],
        [0.4, 4.6, 1.2, 24, 0xff78c0],
        [10, 4.6, 0, 30, 0xffb468],
        [0, 4.2, 19, 28, 0xffa860],
        [10.5, 3.0, -6.2, 16, 0xffa0c8],
      ] as const)
        b.root.add(lampLight(x, y, z, i, 14, col));

      // ---- The crowd.
      const L = LORBEL_LOOKS;
      const V = VENDOR_LOOKS;
      const look = (i: number) => L[((i % L.length) + L.length) % L.length];
      const walkers: Walker[] = [
        // Lorong Datang and Lorong Keluar, both ways; some carry on up or down the corridor.
        { path: [[-30.5, -8.3], [-1, -8.3]], look: look(0), phase: 0.1 },
        { path: [[-30.5, -6.9], [0, -6.9]], look: look(1), phase: 0.55 },
        { path: [[-30, -5.4], [-1.5, -5.6]], look: look(2), phase: 0.3, speed: 0.8 },
        { path: [[-29, -7.6], [-0.8, -7.6], [-0.8, -24.5]], look: look(3), phase: 0.8, speed: 1.2 },
        { path: [[-30.5, 8.0], [-1, 8.0]], look: look(4), phase: 0.15 },
        { path: [[-30.5, 9.4], [-0.5, 9.6]], look: look(5), phase: 0.6 },
        { path: [[-30, 10.8], [-1, 10.6]], look: look(6), phase: 0.4, speed: 0.85 },
        { path: [[-29, 9.9], [-0.6, 10], [-0.6, 25.6]], look: look(7), phase: 0.25 },
        // Up and down the corridor.
        { path: [[-1.2, -24.6], [-1.2, 25.6]], look: look(8), phase: 0.2 },
        { path: [[0, -24.4], [0, 25.8]], look: look(9), phase: 0.7, speed: 1.1 },
        { path: [[1.2, -24.6], [1.2, 25.6]], look: look(10), phase: 0.45 },
        { path: [[0.6, -16], [0.6, 20]], look: look(11), phase: 0.05, speed: 0.8 },
        { path: [[-0.4, -12], [-0.4, -24]], look: look(1), phase: 0.6, speed: 0.9 },
        { path: [[0.4, 12], [0.4, 25]], look: look(4), phase: 0.35, speed: 0.9 },
        // Round the tables, and through them.
        { path: [[3.2, -9.0], [15.6, -9.0], [15.6, 9.25], [3.2, 9.25]], look: look(2), loop: true, phase: 0 },
        { path: [[3.2, -9.0], [15.6, -9.0], [15.6, 9.25], [3.2, 9.25]], look: look(5), loop: true, phase: 0.5, speed: 0.9 },
        { path: [[7.6, -9.0], [7.6, 9.2]], look: look(0), phase: 0.3 },
        { path: [[11.6, -9.0], [11.6, 9.2]], look: look(7), phase: 0.75 },
        // Someone fetching their bike from the car park.
        { path: [[-14, 9.6], [-14, 6.0], [-14, 3.2]], look: look(9), phase: 0.4, speed: 0.8 },
      ];
      const st: Stander[] = [];
      // Diners at the round tables: behind (facing the camera), in front (backs to it), and on the sides.
      tables.forEach(([x, z], i) => {
        st.push({ x, z: z - 0.9, look: look(i + 3), mode: "eat", seated: true });
        st.push({ x, z: z + 0.9, look: look(i + 6), mode: "eat", seated: true, back: true });
        if (i % 3 === 1) st.push({ x: x - 0.9, z: z + 0.05, look: look(i + 9), mode: "eat", seated: true });
      });
      // The audience in front of the stage, swaying on the beat.
      for (const [x, z, i] of [[1.35, -2.2, 0], [1.35, -0.5, 1], [1.35, 2.9, 2], [1.35, 4.7, 3]] as const)
        st.push({ x, z, look: look(i * 5 + 1), mode: "sway", back: true, solid: false, flip: i % 2 === 1 });
      // Gallery visitors, and people chatting by the lane walls.
      st.push(
        { x: -23.0, z: -8.6, look: look(7), mode: "idle" },
        { x: -22.2, z: -8.55, look: look(2), mode: "idle", flip: true },
        { x: -12.6, z: -5.1, look: look(11), mode: "idle", back: true },
        { x: -14.6, z: 11.0, look: look(3), mode: "idle" },
        { x: -27.0, z: 8.6, look: look(8), mode: "idle", back: true },
      );
      // Bundle: a vendor and two people digging through the rails in each stall, a few more in the corridor.
      BUNDLE.forEach(([x, z, face], i) => {
        st.push({ x: x + face * 1.2, z: z + 1.9, look: V[i % V.length], mode: "vendor", solid: false, lines: ["RM5 RM5!", "Pilih pilih!", "Bundle baru buka!", "Murah ni dik!"] });
        st.push({ x: x - face * 0.4, z: z - 0.4, look: look(i * 3 + 2), mode: "browse", back: true, solid: false });
        st.push({ x: x + face * 0.5, z: z + 1.6, look: look(i * 3 + 5), mode: "browse", back: true, solid: false, flip: true });
      });
      st.push(
        { x: -1.5, z: -15.4, look: look(6), mode: "browse", back: true },
        { x: 1.5, z: -11.0, look: look(10), mode: "browse", back: true },
        { x: 1.5, z: -20.6, look: look(3), mode: "browse", back: true, flip: true },
        { x: -1.5, z: -23.2, look: look(8), mode: "browse", back: true },
      );
      // Food: vendors behind their counters, queues along the corridor, people eating on their feet.
      const VENDOR_LINES: Record<StallKind, string[]> = {
        satay: ["Satay! Satay!", "Ayam ke daging?", "Panas-panas!"],
        salai: ["Daging salai dik!", "Pedas tak takut?"],
        malatang: ["Pilih sendiri, timbang!", "Malatang~"],
        balang: ["Air balang sejuk!", "Bandung ada!"],
        mango: ["Sorry, habis!", "Esok datang awal ye"],
        burger: ["Burger special!", "Telur double!"],
        ramen: ["Level berapa dik?", "Pedas gila ni!"],
        takoyaki: ["Takoyaki panas!", "Mayo lebih?"],
      };
      STALLS.forEach(([x, z, kind], i) => st.push({ x, z: z - 0.5, look: V[(i + 1) % V.length], mode: "vendor", solid: false, lines: VENDOR_LINES[kind] }));
      for (const [x, z, i] of [[-1.5, 13.0, 0], [-1.4, 14.1, 1], [-1.5, 16.6, 2], [1.5, 13.2, 3], [1.4, 20.2, 4], [-1.5, 20.9, 5], [-1.5, 23.8, 6], [1.5, 24.6, 7]] as const)
        st.push({ x, z, look: look(i * 7 + 1), mode: "queue", back: true, flip: i % 2 === 0 });
      for (const [x, z, i] of [[0.6, 18.6, 0], [-0.6, 22.4, 1], [-0.5, 12.2, 2]] as const) st.push({ x, z, look: look(i * 5 + 4), mode: "eat" });
      const crowd = await lorbelCrowd(walkers, st, b.player, BEAT);
      anim(crowd);
      add(crowd.statics);
      b.blockers(crowd.solid, 0.34);

      placeCollectibles(b, "galeri");
      b.root.add(mergeStatic(statics));
    },
  }),

  // Putrajaya (was Bukit Bunga; the id stays "bukit" for old saves). Late afternoon, car-free evening:
  // Qish comes in from the south over Jambatan Putra, up Persiaran Perdana to the Dataran Putra
  // roundabout, Masjid Putra on the water to the west and Perdana Putra at the top. Everyone is out
  // jogging, so before the Qish ex chase she has to jog and use the Taman Kecergasan machines to get
  // the scale from 86kg back to 80kg. The road on to Litar Sepang leaves along the east waterfront.
  bukit: zone({
    id: "bukit",
    name: "Putrajaya",
    sky: 0xffd9b0,
    fog: 0xf6dcc2,
    light: { sun: 2.3, hemi: 1.05, sunColor: 0xffcf96, hemiSky: 0xffeedb, hemiGround: 0x6b8f4a },
    bounds: [-16, -15.6, 33.6, 43],
    cam: [-12, -8, 20, 35],
    spawns: {
      start: [0, 40.8, "back"],
      west: [0, 40.8, "back"],
      east: [30.4, 9.8, "left"],
      myvi: [8.2, 13.6, "front"],
      boss: [0, 12.8, "front"],
    },
    async build(b) {
      const box = (x0: number, z0: number, x1: number, z1: number) => b.collider([x0, z0, x1, z1]);
      const anim = (a: Anim) => {
        b.root.add(a.group);
        b.animate(a.update);
      };
      const statics = new THREE.Group();
      const add = (...o: THREE.Object3D[]) => statics.add(...o);
      const C: [number, number] = [0, -3];
      const R = { plaza: 7.6, road: 9.2, track: 10.9 };
      const onRing = (r: number, deg: number): [number, number] => [C[0] + Math.cos((deg * Math.PI) / 180) * r, C[1] + Math.sin((deg * Math.PI) / 180) * r];
      const arc = (r: number, from: number, to: number, step = 15) => {
        const pts: [number, number][] = [];
        const n = Math.max(1, Math.round(Math.abs(to - from) / step));
        for (let k = 0; k <= n; k++) pts.push(onRing(r, from + ((to - from) * k) / n));
        return pts;
      };

      // ---- Land, lake, waterfront
      const shoreE: [number, number][] = [[3.9, 24.4], [5.4, 24.4], [6.3, 23.2], [10, 21.3], [15.5, 18.3], [21.5, 15.3], [28, 13.3], [34.5, 12.5]];
      const shoreW: [number, number][] = [[-3.9, 24.4], [-5.4, 24.4], [-6.3, 23.2], [-10, 21.1], [-13.8, 18.9], [-15.5, 16.2], [-16.5, 12.2], [-31.5, 12.2], [-33, 10.5]];
      b.root.add(
        landMass([
          [-70, -45], [70, -45], [70, 12.4], [34.6, 12.8], [28, 13.6], [21.5, 15.6], [15.5, 18.6], [10, 21.6], [6.4, 23.5], [5.4, 24.65], [-5.4, 24.65],
          [-6.4, 23.5], [-10, 21.4], [-13.8, 19.2], [-15.8, 16.4], [-16.8, 12.5], [-31.6, 12.5], [-33.4, 10.6], [-33.6, -16], [-70, -16],
        ], 1.4, (p) => {
          p.blob("pavers", C[0], C[1], R.track + 0.1, 0.012);
          p.blob("tar", C[0], C[1], R.road, 0.006);
          p.blob("pavers", C[0], C[1], R.plaza, 0.006);
          p.path("pavers", [[-3.4, 7.0], [-3.4, 20.9], [-5.4, 22.9]], 2.0);
          p.path("pavers", [[3.4, 7.0], [3.4, 20.9], [5.4, 22.9]], 2.0);
          p.rect("pavers", -3.95, 21.0, 3.95, 24.7, 0.02, 0.7);
          p.rect("tar", -2.4, 5, 2.4, 24.7, 0.02, 0.6);
          p.rect("tar", -2.4, -16.6, 2.4, -11.2, 0.06, 0.6);
          p.path("pavers", [[-10.7, -3], [-13.8, 0.6], [-16.2, 3.5]], 2.2);
          p.path("pavers", [[-5.4, 22.9], [-10, 20.2], [-13.6, 17.9], [-15, 15.4], [-15.1, 8.4], [-14.6, 3.6]], 2.0);
          p.path("pavers", [[5.4, 22.9], [10, 20.3], [15.5, 17.3], [21.5, 14.4], [28, 12.2], [34, 11.4]], 2.2);
          p.path("pavers", [[10.7, -3], [16, 2], [22, 9.8], [34, 9.8]], 2.2);
          p.rect("tar", 6.2, 8.4, 12.6, 12.6, 0.2, 0.8);
        }),
      );
      anim(lake(-80, -40, 80, 90));
      for (const pts of [shoreE, shoreW]) {
        const r = shoreRail(pts);
        add(r.group);
        r.boxes.forEach((bx) => b.collider(bx));
      }

      // ---- Jambatan Putra
      add(putraBridge(-3.9, 3.9, 24.6, 52));
      box(3.55, 24.6, 4.3, 44);
      box(-4.3, 24.6, -3.55, 44);
      for (const [px, pz] of [[-5.85, 27.4], [5.85, 27.4], [-5.85, 38.8], [5.85, 38.8]] as const) add(pavilion(px, pz));
      for (const z of [30.5, 35.5, 42.5, 47.5]) for (const sx of [-3.75, 3.75]) add(putraLamp(sx, z, 3.0));
      for (const sx of [-1, 1]) {
        const f = jalurGemilang(sx * 4.6, 24.0, sx);
        anim(f);
      }
      b.exit("west", [-3.6, 42.4, 3.6, 45], [0, 41.2]);
      add(signBoard(-2.9, 42.3, `← ${SHORT.photobooth}`));
      const scale = weighScale(2.85, 39.3, b.player, kgNow);
      anim(scale);
      box(2.4, 38.9, 3.3, 39.45);
      b.interact("scale", 2.85, 39.9, "Timbang", 3.3, 1.1);

      // ---- Persiaran Perdana: zebra paint crosses the road at grade.
      for (let z = 8.6; z < 24; z += 1.8) add(new THREE.Mesh(roundedBox(0.12, 0.02, 0.8), new THREE.MeshLambertMaterial({ color: 0xf6efe0 })).translateY(0.035).translateZ(z));
      for (let x = -2.05; x <= 2.1; x += 0.75) add(new THREE.Mesh(roundedBox(0.42, 0.012, 2.2), new THREE.MeshLambertMaterial({ color: 0xfff2d9 })).translateX(x).translateY(0.035).translateZ(22.9));
      add(roadText("HARI BEBAS", 0, 16.4, 4.2, 0.9), roadText("KENDERAAN", 0, 17.6, 4.2, 0.9));
      for (const z of [14.2, 19.6]) {
        for (const sx of [-1, 1]) {
          add(royalPalm(sx * 5.3, z, 5.0, z));
          box(sx * 5.3 - 0.3, z - 0.3, sx * 5.3 + 0.3, z + 0.3);
        }
      }
      for (const z of [11.5, 15.2, 18.9]) for (const sx of [-1, 1]) add(putraLamp(sx * 4.75, z));

      // ---- Dataran Putra
      add(dataranPutra(C[0], C[1], R));
      box(-3.2, C[1] - 1.4, 3.2, C[1] + 1.4);
      box(-1.6, C[1] - 3.2, 1.6, C[1] + 3.2);
      for (const deg of [-150, -122, -58, -30, 30, 150]) {
        const [x, z] = onRing(11.7, deg);
        anim(jalurGemilang(x, z, deg));
        box(x - 0.15, z - 0.15, x + 0.15, z + 0.15);
      }
      for (const deg of [-165, -105, -75, -15, 15, 45, 135, 165]) {
        const [x, z] = onRing(11.9, deg);
        add(putraLamp(x, z));
      }
      for (const deg of [-140, -40, 0, 180, 60, 120]) {
        const [x, z] = onRing(13.6, deg);
        add(roundTree(x, z, 0.95, 0x4a9038));
        box(x - 0.3, z - 0.3, x + 0.3, z + 0.3);
      }

      // ---- Perdana Putra at the top
      add(perdanaPutra(0, -20.6));
      anim(fountain(0, -17.9, 8, 2.2));
      add(hedge(-40, -16.9, -2.8, -16.4), hedge(2.8, -16.9, 40, -16.4));
      for (const sx of [-1, 1]) add(new THREE.Mesh(roundedBox(0.7, 1.6, 0.7), flat(0xe6d6bc)).translateX(sx * 3.1).translateY(0.8).translateZ(-16.6));
      b.interact("perdana", 0, -15.4, "Tengok", 3.5, 2.2);
      for (const [x, z, w, d, f, s] of [[18.5, -22, 8, 5, 3, 0], [28, -21, 7, 5, 2, 1], [-13.5, -22, 8, 5, 3, 2], [-24, -21, 6, 5, 2, 3], [31, -8, 4.6, 7, 2, 4]] as const) {
        add(redRoofBlock(x, z, w, d, f, s));
      }
      box(28.6, -11.6, 33.6, -4.4);
      for (const [x, z, h] of [[-30, -44, 12], [-18, -48, 16], [12, -46, 14], [24, -50, 19], [36, -44, 11]] as const) add(new THREE.Mesh(roundedBox(5, h, 5), flat(0xd9c9b8)).translateX(x).translateY(h / 2).translateZ(z));

      // ---- Masjid Putra on the water to the west
      add(masjidPutra(-24.2, 1));
      add(minaret(-20.4, -12.4));
      b.interact("masjid", -15.2, 3.5, "Tengok", 3.6, 1.8);

      // ---- West: promenade, gardens and the Taman Kecergasan
      add(rubberFloor(-14.1, 11.2, -6.8, 16.3));
      add(signBoard(-6.2, 10.6, "Taman Kecergasan"));
      const [aw, pu, su] = STATIONS.map((st) => st.at);
      anim(airWalker(aw[0], aw[1], 0, gym));
      box(aw[0] - 1.2, aw[1] - 0.8, aw[0] - 0.8, aw[1] + 0.8);
      box(aw[0] + 0.8, aw[1] - 0.8, aw[0] + 1.2, aw[1] + 0.8);
      add(pullUpBars(pu[0], pu[1]));
      for (const dx of [-1.3, 0, 1.3]) box(pu[0] + dx - 0.15, pu[1] - 0.15, pu[0] + dx + 0.15, pu[1] + 0.15);
      add(situpBench(su[0], su[1]));
      STATIONS.forEach((st, i) => b.interact(`gym:${i}`, st.spot[0], st.spot[1] + 0.5, st.name, 2.9, 1.5));
      for (const [x, z] of [[-7.4, 19.4], [-8.2, 7.8], [-12.4, 8.2], [-7.2, -12.2], [-12.6, -9.0]] as const) add(flowerBed(x, z, 2.4, 1.3));
      for (const [x, z, s] of [[-6.6, 3.6, 1.0], [-11.6, 4.8, 1.1], [-14.6, -6.0, 1.2], [-6.2, -14.0, 1.0], [-11.0, -14.6, 1.1], [-14.0, 10.0, 0.9]] as const) {
        add(roundTree(x, z, s, 0x4f9a3a));
        box(x - 0.3, z - 0.3, x + 0.3, z + 0.3);
      }

      // ---- East: parking, waterfront stalls, the lawn with kites, and the road to Sepang
      for (const x of [7.0, 9.4, 11.8]) add(new THREE.Mesh(roundedBox(0.08, 0.02, 3.4), new THREE.MeshBasicMaterial({ color: 0xf2f0ea })).translateX(x).translateY(0.06).translateZ(10.5));
      b.root.add(myvi(8.2, 10.5, 0));
      box(7.2, 8.6, 9.2, 12.4);
      b.interact("myvi", 8.2, 11.6, "Myvi", 2.2, 2.4);
      add(motorbike(10.6, 10.4, 0.2));
      anim(iceCreamBike(19.6, 12.2, b.player));
      box(18.9, 11.6, 20.4, 13.4);
      b.interact("aiskrim", 19.6, 13.8, "Tengok", 2.8, 1.6);
      add(wordSign("PUTRAJAYA", 12.6, 5.6, 7.4, 1.6));
      box(9.0, 5.2, 16.2, 5.9);
      b.interact("huruf", 12.6, 6.8, "Tengok", 2.6, 1.8);
      for (const [x, z, s] of [
        [6.6, 3.0, 1.0], [19.6, -12.0, 1.3], [26.4, -14.2, 1.1], [30.6, 2.4, 1.0], [25.6, 4.2, 0.9], [8.2, -13.4, 1.1],
        [12.6, -9.6, 0.9], [27.4, -2.2, 1.2], [20.6, 4.4, 0.8], [31.6, -14.0, 1.0],
      ] as const) {
        add(roundTree(x, z, s, 0x4a9038));
        box(x - 0.3, z - 0.3, x + 0.3, z + 0.3);
      }
      for (const [x, z] of [[7.8, 18.8], [24.0, 6.6], [14.6, -12.0]] as const) add(flowerBed(x, z, 2.4, 1.3));
      add(tikar(18.8, -8.2, 3.0, 2.2), tikar(26.0, -8.2, 2.4, 1.7));
      for (const [x, z] of [[21.4, -13.2], [13.8, -13.4]] as const) add(bench(x, z));
      b.exit("east", [32.4, 7.8, 34.2, 11.8], [30.6, 9.8]);

      // ---- Life
      anim(dragonBoat(-26, 30, 17, 3.6, -0.8, 0.05));
      anim(cruiseBoat(23, 31.5, 14, 4.2, -0.8, 0.032, 2));
      anim(birds([-14, 36]));
      anim(butterflies([[-7.4, 19.4], [-8.2, 7.8], [7.8, 18.8], [24.0, 6.6], [-12.4, 8.2], [14.6, -12.0]]));
      anim(pigeons(-4.8, -6.6, 1.6, 7, b.player));
      anim(pigeons(4.4, 0.6, 1.5, 6, b.player));
      anim(pigeons(2.6, 22.2, 1.3, 5, b.player));
      anim(await wauKite(16.4, -5.2, LORBEL_LOOKS[3], ["#ff5c93", "#ffcb05"]));
      anim(await wauKite(23.4, -1.6, LORBEL_LOOKS[9], ["#3b6fe0", "#e3350d"], 2));
      anim(await wauKite(-9.6, -9.6, LORBEL_LOOKS[3], ["#3fae5a", "#ffcb05"], 4));
      anim(await wauKite(28.6, -5.4, LORBEL_LOOKS[9], ["#9b6ad6", "#fffdf6"], 1));
      for (const [i, x, z, look] of [[0, 17.8, -8.5, 0], [1, 19.6, -8.5, 6], [2, 18.8, -7.4, 3], [1, 25.2, -8.0, 4], [0, 26.8, -8.4, 10]] as const) {
        const s = await b.standee(sitterDoodle({ ...LORBEL_LOOKS[look], carry: i === 1 ? "drink" : "none" }), x, z, LORBEL_LOOKS[look].kid ? 1.35 : 1.85);
        s.position.y = 0.04;
      }
      for (const [x, z, look] of [[19.0, 11.6, 2]] as const) {
        await b.standee(passengerDoodle(VENDOR_LOOKS[look]), x, z, 1.85);
      }

      // ---- The evening crowd
      const J = JOG_LOOKS;
      const ringCCW = (r: number) => arc(r, 0, -345);
      const ringCW = (r: number) => arc(r, 0, 345);
      const routes: JogRoute[] = [
        ...[0, 0.2, 0.4, 0.6, 0.8].map((ph, i) => ({ path: ringCCW(10.45), loop: true, look: J[i], phase: ph })),
        ...[0.1, 0.45, 0.75].map((ph, i) => ({ path: ringCW(9.75), loop: true, look: J[5 + i], phase: ph })),
        ...[0.3, 0.85].map((ph, i) => ({ path: ringCCW(10.1), loop: true, look: WALK_LOOKS[i], kind: "walk" as const, phase: ph })),
        ...[0, 0.33, 0.66].map((ph, i) => ({
          path: [[-3.45, 23.6], [-3.45, 7.6], ...arc(10.45, 108, -72, 20), [3.45, 7.6], [3.45, 23.6]] as [number, number][],
          loop: true,
          look: J[(i * 3 + 2) % J.length],
          phase: ph,
        })),
        ...[0.15, 0.6].map((ph, i) => ({ path: [[1.4, 24.0], [1.4, 50]] as [number, number][], look: J[8 - i], phase: ph })),
        { path: [[-1.6, 22.0], [-1.6, 50]], look: WALK_LOOKS[2], kind: "walk", phase: 0.4 },
        ...[0.1, 0.55].map((ph, i) => ({ path: [[5.6, 22.9], [10, 20.3], [15.5, 17.3], [21.5, 14.4], [28, 12.2], [34, 11.4]] as [number, number][], look: J[(i * 4 + 1) % J.length], phase: ph })),
        { path: [[5.6, 22.9], [10, 20.3], [15.5, 17.3], [21.5, 14.4], [28, 12.2], [34, 11.4]], look: WALK_LOOKS[1], kind: "walk", phase: 0.7 },
        ...[0.2, 0.7].map((ph, i) => ({ path: [[-5.6, 22.9], [-10, 20.2], [-13.6, 17.9], [-15.0, 15.4], [-15.1, 8.4], [-14.6, 3.6], [-13.8, 0.6], onRing(R.track, 180)] as [number, number][], look: J[(i * 5 + 3) % J.length], phase: ph })),
        { path: [onRing(R.track, 0), [16, 2], [22, 9.8], [34, 9.8]], look: J[4], phase: 0.5 },
        ...[0, 0.5].map((ph, i) => ({ path: arc((R.plaza + R.road) / 2 + 0.3, 0, 345), loop: true, look: J[(i * 7 + 1) % J.length], kind: "bike" as const, bike: i ? "#2fa36b" : "#ff8fb1", phase: ph })),
        { path: [[-1.0, 6.4], [-1.0, 46]], look: J[2], kind: "bike", bike: "#2fa36b", phase: 0.3 },
      ];
      const crowd = await joggers(routes, b.player);
      anim(crowd);
      anim(sweatAndScale(b.player, () => !workoutDone(), () => scaleTicks.n));
      // Jogging burns: a little for every step she runs, double beside a jogging buddy.
      {
        const last = new THREE.Vector3().copy(b.player());
        b.animate(() => {
          const p = b.player();
          const d = Math.hypot(p.x - last.x, p.z - last.z);
          last.copy(p);
          live.buddy = crowd.buddy();
          if (d > 0 && d < 1) burn(d * KG_PER_UNIT * (live.buddy ? 2 : 1));
        });
      }

      // ---- Qish ex: the chase starts at the START line once she's warmed up.
      anim(startArch(0, 11.0, 9.6));
      box(-5.4, 10.6, -4.2, 11.4);
      box(4.2, 10.6, 5.4, 11.4);
      if (!bossSpot(b, "qishex", 0, 11.6, "Garisan START", [0, 5.4, 11.0], 3.2, 1.6, workoutDone)) b.interact("arch", 0, 11.6, "Garisan START", 3.2, 1.6);

      b.root.add(mergeStatic(statics));
    },
  }),

  // Litar Sepang, the finale. Qish parks outside and walks in through the main gate: the fan zone, the
  // paddock, the garages along the pit lane (one is a walk-through), a footbridge over the main
  // straight to the grandstand under its leaf roofs, and a second bridge over the back straight on the
  // way out to Labu Lanjut. An F1 race is on the whole time. Raja Nonchalant waits on the podium on the pit
  // building's roof, which is ALL ACCESS: he left six passes with six people round the circuit. Grey
  // and about to rain until he's beaten (then it clears and there's a rainbow).
  sepang: zone({
    id: "sepang",
    name: "Litar Sepang",
    sky: 0x8d93a6,
    fog: 0x9ca1b1,
    light: { sun: 1.3, hemi: 1.25, sunColor: 0xd8deea, hemiSky: 0xc6ccda, hemiGround: 0x4e5a48 },
    mood: () =>
      save.hasCard(BOSSES.finale.card)
        ? { sky: 0xffd3a1, fog: 0xf6dcc0, light: { sun: 2.4, hemi: 1.05, sunColor: 0xffc887, hemiSky: 0xffeedb, hemiGround: 0x6b8f4a } }
        : {},
    bounds: [-46, -41.6, 46, 39.6],
    cam: [-31, -33, 31, 29],
    spawns: {
      start: [-42.6, 32.6, "right"],
      west: [-42.6, 32.6, "right"],
      east: [26, -39.2, "front"],
      myvi: [-33.3, 28.6, "front"],
      boss: [0, 1.9, "back"],
    },
    async build(b) {
      const statics = new THREE.Group();
      const add = (...o: THREE.Object3D[]) => statics.add(...o);
      const anim = (a: Anim) => {
        b.root.add(a.group);
        b.animate(a.update);
      };
      const box = (x0: number, z0: number, x1: number, z1: number) => b.collider([x0, z0, x1, z1]);
      const post = (x: number, z: number, r = 0.25) => box(x - r, z - r, x + r, z + r);
      const clear = save.hasCard(BOSSES.finale.card);
      const passOpen = () => collectDone("sepang");
      const got = (i: number) => save.flag(gotFlag("sepang", i));

      // ---- Ground: grass, the circuit and pit lane, the paddock and fan zone paving, the car park.
      add(splatGround([0, -5, 160, 130], (p) => {
        p.rect("pavers", -46, -1.4, 46, 10.4, 0.12, 0.6);
        p.rect("pavers", -46, 12, 46, 22.6, 0.16, 0.7);
        p.rect("tar", -46, 10.4, 46, 12.0, 0.06, 0.3);
        p.rect("tar", -46, 22.6, 46, 39.6, 0.16, 0.8);
        p.rect("tar", -64, 30, -45.5, 35.2, 0.12, 0.6);
        p.rect("tar", 24, -64, 28, -36.6, 0.12, 0.6);
      }, { grass: 7, dirt: 3.2, tar: 5, pavers: 5 }, 10, "grass", { pavers: "circuit_concrete" }));
      add(trackSurface(), pitSurface());
      for (let x = -44; x < 46; x += 3) add(new THREE.Mesh(roundedBox(1.4, 0.02, 0.1), new THREE.MeshBasicMaterial({ color: 0xf2f0ea })).translateX(x).translateY(0.05).translateZ(11.2));
      add(carPark(-46, 46, 22.6, 39.6, [{ z0: 22.8, z1: 27.2 }, { z0: 35.2, z1: 39.6 }]));
      for (let x = -10; x <= 10; x += 1.2) add(new THREE.Mesh(roundedBox(0.6, 0.02, 4.0), new THREE.MeshBasicMaterial({ color: 0xf2f0ea })).translateX(x).translateY(0.05).translateZ(25));

      // ---- Where she can walk: off the track and the pit lane, out of the grandstand and the pit
      // building (bar the walk-through garage); up the bridges and the podium stairs; the VIP rope
      // stays up until she has all six passes.
      b.region((x, z) => !spWalkable(x, z));
      box(GRANDSTAND.x0 - .3, GRANDSTAND.z1 - .2, GRANDSTAND.x1 + .3, GRANDSTAND.z1 + .42);
      b.region((x, z) => !passOpen() && x > -1.7 && x < 1.7 && z > 9.7 && z < 10.5);
      b.floor((x, z) => Math.max(bridgeY(BRIDGE1, x, z), bridgeY(BRIDGE2, x, z), podiumY(x, z)));
      for (const br of [BRIDGE1, BRIDGE2]) {
        const za = Math.min(br.z0, br.z1);
        const zb = Math.max(br.z0, br.z1);
        box(br.x - BRIDGE_HW - 0.15, za, br.x - BRIDGE_HW, zb);
        box(br.x + BRIDGE_HW, za, br.x + BRIDGE_HW + 0.15, zb);
      }
      // Deck parapets, stair rails, the podium steps.
      box(SP_DECK[0] - 0.1, -1.55, SP_DECK[2] + 0.1, -1.3);
      box(SP_DECK[0] - 0.1, 4.45, STAIRS.x0 - 0.05, 4.75);
      box(STAIRS.x1 + 0.05, 4.45, SP_DECK[2] + 0.1, 4.75);
      box(STAIRS.x0 - 0.15, STAIRS.z0, STAIRS.x0, STAIRS.z1);
      box(STAIRS.x1, STAIRS.z0, STAIRS.x1 + 0.15, STAIRS.z1);
      box(-2.4, -1.3, 2.4, 0.3);

      // ---- The circuit dressing: fences, armco, hoardings, the gantry, the pit wall.
      add(armco((x, z) => (Math.abs(z + 13.95) < 1.2 && x > -37 && x < 34) || onBridge(BRIDGE1, x, z) || onBridge(BRIDGE2, x, z)));
      add(new THREE.Mesh(roundedBox(69, 0.5, 0.3), flat(0xe6e2da)).translateX(-1.5).translateY(0.25).translateZ(-13.95));
      add(catchFence([[-36, -13.95], [33, -13.95]], 2.4, 0.5));
      add(new THREE.Mesh(roundedBox(61, 0.9, 0.35), flat(0xe6e2da)).translateX(-0.5).translateY(0.45).translateZ(-36.3));
      add(catchFence([[-31, -36.3], [30, -36.3]], 2.4, 0.9));
      const ADS: [string, string, string][] = [
        ["MALAS AIR", "#5b4766", "#ffcb05"], ["DUBUYO · PEDAS", "#17151f", "#ff4b2b"], ["NYOMNYOM CITY", "#ff8a1c", "#fffdf6"], ["BOLAT·CAM", "#ff6fa0", "#fffdf6"],
        ["ANTI EMOK", "#22b8c8", "#fffdf6"], ["MYVI", "#d8281e", "#fffdf6"], ["AYAM GEPUK", "#ffcb05", "#17151f"], ["KEK MANGO", "#ffbe1a", "#2f8a3a"],
        ["LORBEL", "#2a2730", "#ffd34d"], ["LAKEFRONT", "#a8e3c8", "#2a6a4a"],
      ];
      let ad = 0;
      for (let x = -33; x < 31; x += 5.8) {
        if (Math.abs(x - BRIDGE1.x) < 3) continue;
        const [t, bg, fg] = ADS[ad++ % ADS.length];
        add(hoarding(t, bg, fg, x, -13.62));
      }
      for (let x = -27.5; x < 21; x += 5.8) {
        const [t, bg, fg] = ADS[ad++ % ADS.length];
        add(hoarding(t, bg, fg, x, -35.95));
      }
      add(startGantry(0));
      post(0, -14.3, 0.3);
      const wall = pitWall();
      add(wall.group);

      // ---- Pit building, podium, grandstand, bridges.
      const pits = pitBuilding();
      add(pits.group, podium());
      b.root.add(pits.roof);
      {
        let last = -1;
        b.animate((t) => {
          const dt = last < 0 ? 0 : t - last;
          last = t;
          const p = b.player();
          pits.fade(p.y < 1 && p.z < PB.z0 + 0.4 && p.z > -7 && p.x > PB.x0 - 2 && p.x < PB.x1 + 2, dt);
        });
      }
      const stand = await sepangStand(() => {
        const p = b.player();
        if (Math.abs(p.x) < 30 && p.z < -2 && p.z > -30 && !dialogOpen()) sfx.cheer();
      });
      add(stand.statics);
      anim(stand);
      for (const [i, x] of [-15, -5, 5, 15].entries()) {
        const f = jalurGemilang(x, GRANDSTAND.z0 + 0.6, i * 1.3);
        f.group.position.y = 5.5;
        anim(f);
      }
      add(footbridge(BRIDGE1, [0.8, -14.8]), footbridge(BRIDGE2, [-27.6, -36.7]));
      add(waySign("↑ GRANDSTAND", -21.4, 6.2), waySign("↑ LABU LANJUT", 23.4, -22.4));
      post(-21.4, 6.2, 0.15);
      post(23.4, -22.4, 0.15);

      // ---- The race.
      const rc = await race({
        player: b.player,
        onPass: (k) => {
          if (!dialogOpen()) sfx.zoom(k);
        },
        onStop: () => {
          if (!dialogOpen()) sfx.wheelGun();
        },
      });
      anim(rc);

      // ---- Main gate and the fences off it.
      const gateway = mainGate(21);
      add(gateway.group);
      b.root.add(gateway.sign);
      {
        // The big sign over the gate fades while she's inside (it would hide the fan zone).
        let last = -1;
        b.animate((t) => {
          const dt = last < 0 ? 0 : t - last;
          last = t;
          const p = b.player();
          gateway.fade(p.z < 20.2 && p.z > 8 && Math.abs(p.x) < 16, dt);
        });
      }
      box(-13.6, 20, -11.6, 22);
      box(11.6, 20, 13.6, 22);
      box(-9.75, 19.9, -6.65, 22.15);
      box(6.65, 19.9, 9.75, 22.15);
      post(-3.4, 21, 0.2);
      post(3.4, 21, 0.2);
      for (const [x0, x1] of [[-46, -13.6], [13.6, 46], [-11.6, -9.75], [9.75, 11.6], [-6.65, -3.55], [3.55, 6.65]] as const) {
        add(barricade(x0, x1, 21));
        box(x0, 20.85, x1, 21.15);
      }
      b.interact("gate", -4.8, 22.7, "Tengok", 6.2, 1.1);
      for (const [i, x] of [-18.6, -15.6, 15.6, 18.6].entries()) {
        anim(jalurGemilang(x, 23.4, i));
        post(x, 23.4, 0.12);
      }

      // ---- Car park: rows of cars, the Myvi, a car crawling round for a space, the shuttle bus,
      // a poncho stall, the attendant waving his baton. The road in from Putrajaya on the west.
      const CAR_COLORS = [0xf4f2ea, 0x3a3f4a, 0xb9bdc4, 0xd8281e, 0x2f62d8, 0x17151f, 0xffffff, 0x8c3a2a, 0x2f8a5a, 0xc9ced6];
      const rcar = rng(31);
      for (let k = 0; k < 35; k++) {
        const x = -43.7 + k * 2.6;
        for (const [z, rot] of [[25.0, Math.PI], [37.4, 0]] as const) {
          if (z < 30 && Math.abs(x) < 10.8) continue;
          if (z < 30 && k === 4) continue;
          if (z > 30 && x > 30.5 && x < 41.5) continue;
          if (rcar() < 0.18) continue;
          add(parkedCar(x, z, rot + (rcar() - 0.5) * 0.06, CAR_COLORS[Math.floor(rcar() * CAR_COLORS.length)]));
          box(x - 0.9, z - 1.75, x + 0.9, z + 1.75);
        }
      }
      b.root.add(myvi(-33.3, 25.0, Math.PI));
      box(-34.3, 23.2, -32.3, 26.8);
      b.interact("myvi", -33.3, 27.6, "Myvi", 2.2, 2.0);
      add(shuttleBus(36, 37.2));
      box(31.9, 36, 40.1, 38.4);
      anim(searchingCar(-52, 52, 30.6, b.player));
      add(waySign("← PUTRAJAYA", -42.4, 29.2));
      post(-42.4, 29.2, 0.15);
      b.exit("west", [-46, 30.0, -44.6, 35.2], [-43, 32.6]);
      for (const x of [-30, 30]) {
        add(lightTower(x, 22.1, [x * 0.8, 33]));
        post(x, 22.1, 0.4);
      }
      for (const [x, z, s] of [[-40, 40.6, 1.1], [-20, 40.8, 1.0], [-8, 40.4, 1.2], [10, 40.8, 1.0], [22, 40.5, 1.1], [42, 40.6, 1.0]] as const) add(palm(x, z, s, x));
      for (const [x, z, w, d, s] of [[-18, 33.6, 3, 1.5, 1], [6, 32, 2.4, 1.1, 2], [24, 34, 3.2, 1.4, 3], [-30, 8.6, 2.6, 1.2, 4], [18, 9.2, 2.0, 1.0, 5], [-12, 18.0, 2.0, 1.0, 6], [6.6, -16.0, 1.6, 0.7, 7], [-28, -17.2, 2.2, 1.0, 8]] as const) {
        add(puddle(x, z, w, d, s));
      }

      // ---- Fan zone: big screen, food trucks, the sim rig, merch tents, the show car, flags.
      anim(jumbotron(-15, 13.2, 8, rc));
      post(-18.4, 13.2, 0.3);
      post(-11.6, 13.2, 0.3);
      for (const [x, body, stripe, sign] of [[-26.2, 0xffcb05, 0xe3350d, "SATAY KAJANG"], [-20.4, 0xff8fb1, 0x2f62d8, "AIS KACANG"]] as const) {
        add(vendorVan(x, 16.6, 0, body, stripe));
        box(x - 2.6, 15.6, x + 2.1, 17.6);
        add(waySign(sign, x - 0.4, 15.2, "#fffdf6", "#e3350d"));
      }
      b.interact("food", -23.3, 18.4, "Tengok", 3.0, 2.2);
      anim(simRig(-7.5, 15.4));
      box(-9.2, 14.7, -5.8, 16.7);
      b.interact("sim", -7.5, 17.4, "Tengok", 2.6, 1.6);
      add(merchTent(7.4, 15.2, TEAMS[0]), merchTent(12.8, 15.2, TEAMS[MALAS]), merchTent(18.2, 15.2, TEAMS[1]));
      for (const x of [7.4, 12.8, 18.2]) box(x - 1.8, 13.7, x + 1.8, 16.2);
      anim(showCar(25.6, 15.4, TEAMS[0]));
      box(22.7, 12.5, 28.5, 18.3);
      b.interact("showcar", 25.6, 19.0, "Tengok", 2.4, 1.8);
      b.interact("screen", -15, 15.6, "Tengok", 6.6, 2.2);
      for (const [i, z] of [13.4, 16.2, 19.0].entries()) {
        anim(windFlag(-3.6, z, teamFlagArt(TEAMS[[0, 4, 6][i]]), i));
        anim(windFlag(3.6, z, i === 1 ? chequeredArt : teamFlagArt(TEAMS[[3, 0, 7][i]]), i + 2));
        post(-3.6, z, 0.1);
        post(3.6, z, 0.1);
      }
      for (const [x, z] of [[31.5, 19.4], [35, 19.4], [-32, 19.4], [-35.5, 19.4]] as const) add(bench(x, z));
      for (const [x, z, s] of [[-41, 15, 1.1], [41, 15, 1.0], [-38, 12.8, 0.9], [38.6, 12.8, 1.0]] as const) {
        add(palm(x, z, s, z));
        post(x, z, 0.3);
      }

      // ---- Paddock: transporters, tyre stacks, scooters, the media and medical centres, the timing
      // tower and the bridge up to the grandstand side.
      add(transporter(-15.4, 7.6, TEAMS[0]), transporter(9.6, 7.6, TEAMS[4]), transporter(29.6, 7.6, TEAMS[6]));
      box(-18.9, 6.4, -10.1, 8.8);
      box(6.1, 6.4, 14.9, 8.8);
      box(26.1, 6.4, 34.9, 8.8);
      for (const [x, z, ti] of [[-7.6, 6.0, MALAS], [5.2, 5.8, 5], [17.2, 6.0, 7], [-21.0, 8.8, 1]] as const) {
        for (const [dx, dz] of [[0, 0], [0.75, 0], [0.38, 0.65]] as const) {
          for (let k = 0; k < 3; k++) {
            add(new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.34, 0.26, 10), flat(0x1c1c22)).translateX(x + dx).translateY(0.14 + k * 0.27).translateZ(z + dz));
            add(new THREE.Mesh(new THREE.CylinderGeometry(0.355, 0.355, 0.1, 10), flat(TEAMS[ti].body)).translateX(x + dx).translateY(0.16 + k * 0.27).translateZ(z + dz));
          }
        }
        box(x - 0.4, z - 0.4, x + 1.15, z + 1.05);
      }
      anim(scooters(-42, 42, 11.2, b.player));
      const media = simpleBuilding(-37.4, 3.0, 13, 7, 5.6, "#dfe6ee", 0x8c929c, "#e3350d");
      add(media.group, waySign("PUSAT MEDIA", -33.4, 7.3, "#e3350d", "#fffdf6"));
      box(...media.box);
      const medic = simpleBuilding(37, 2.4, 11, 6, 4.2, "#f4f2ea", 0xd8281e, "#e3350d");
      add(medic.group, waySign("PUSAT PERUBATAN", 33.6, 6.2, "#fffdf6", "#d8281e"));
      box(...medic.box);
      post(-33.4, 7.3, 0.15);
      post(33.6, 6.2, 0.15);
      for (const [x, z] of [[-44.5, -5], [44.5, -5]] as const) {
        add(lightTower(x, z, [x * 0.7, -20]));
        post(x, z, 0.4);
      }

      // ---- Infield: marshal posts, the helicopter, the commentary box, the timing tower.
      add(marshalPost(-33.6, -20.75, 9), marshalPost(31.0, -15.4, 2));
      box(-34.6, -21.6, -32.6, -19.9);
      box(30.0, -16.3, 32.0, -14.5);
      anim(marshalFlag(-31.7, 1.0, -19.3, rc.safety));
      anim(marshalFlag(29.7, 1.0, -16.6, rc.safety, 1.4));
      await b.standee(passengerDoodle(SP_GIVERS[4].look), 29.0, -16.6, 1.85);
      anim(helicopter(-29.6, -25.0));
      box(-31.4, -27.6, -27.8, -22.6);
      b.interact("heli", -27.0, -22.6, "Tengok", 3.0, 2.0);
      add(commentaryBox(29.2, -19.6));
      box(27.6, -20.8, 31.4, -18.4);
      anim(timingTower(21.4, -15.6, rc));
      box(20.3, -16.1, 22.5, -15.1);
      b.interact("tower", 21.4, -14.6, "Tengok", 3.2, 1.4);
      b.interact("banner", 0, -14.8, "Tengok", 1.6, 1.0, () => got(3));
      for (const [x, z, s] of [[-21.4, -26.4, 1.0], [-35.4, -14.8, 0.9], [-20.4, -14.8, 0.8], [33.4, -26.4, 1.0], [20.4, -26.6, 0.9]] as const) {
        add(palm(x, z, s, x));
        post(x, z, 0.3);
      }

      // ---- North of the back straight: oil palm all the way to the hills, the road out to Labu Lanjut.
      for (const [x, z] of [[-12, -39.5], [10, -39.5]] as const) add(lightTower(x, z, [x, -28]));
      const rp = rng(9);
      for (let z = -39.4; z > -60; z -= 4.2) {
        for (let x = -56; x < 57; x += 4.6) {
          const px = x + (rp() - 0.5) * 1.2 + (Math.round(z) % 2 ? 2.3 : 0);
          const pz = z + (rp() - 0.5) * 1.0;
          if (px > 20.5 && px < 31.5) continue;
          if (Math.abs(px + 12) < 2.4 && pz > -42) continue;
          if (Math.abs(px - 10) < 2.4 && pz > -42) continue;
          add(oilPalm(px, pz, rp() * 6, 1.25));
        }
      }
      b.exit("east", [24.4, -41.6, 27.6, -40.8], [26, -39.4]);

      // ---- Weather: drizzle and lightning until Raja Nonchalant is beaten; then a rainbow.
      if (!clear) {
        const rain = drizzle();
        anim(rain);
        b.animate(() => rain.follow(b.player()));
        const wash = screenFlash();
        anim(wash);
        b.animate(() => wash.follow(b.player()));
        let next = 7;
        b.animate((t) => {
          if (t < next) return;
          next = t + 14 + Math.random() * 12;
          if (dialogOpen()) return;
          wash.pop(0.3);
          setTimeout(() => sfx.thunder(), 500 + Math.random() * 900);
        });
      } else b.root.add(rainbow());

      // ---- People. Fans walking in from their cars and round the fan zone, team staff in the paddock,
      // fans at the fence on the grandstand side and picnicking in the infield.
      const L = (i: number, carry: Carry = "none", extra: Partial<PersonLook> = {}): PersonLook => ({ ...LORBEL_LOOKS[i % LORBEL_LOOKS.length], carry, ...extra });
      const staff = (ti: number, i: number): PersonLook => ({ skin: ["#f2c9a5", "#c98e5f", "#e8b48a", "#a8704a"][i % 4], top: TEAMS[ti].css, bottom: "#2a2730", cap: TEAMS[ti].css, hair: "#26222a", bag: "#333", carry: i % 2 ? "phone" : "none" });
      const walkers: Walker[] = [
        { path: [[-40, 33.2], [-14, 33.2], [-4.5, 29], [-2.5, 23.2]], look: L(0, "umbrella") },
        { path: [[38, 32.8], [12, 33.5], [4.4, 29], [2.5, 23.2]], look: L(1, "flag") },
        { path: [[-22, 28.6], [-6, 28.8], [-0.9, 23.2]], look: L(2, "umbrella"), phase: 0.4 },
        { path: [[27, 28.4], [8, 28.6], [0.9, 23.2]], look: L(4, "umbrella"), phase: 0.7 },
        { path: [[-36, 33.6], [-10, 33.6], [-3.6, 28.4]], look: L(7, "drink"), phase: 0.2 },
        { path: [[-34, 19.4], [-4.5, 19.4], [-2, 13], [2, 13], [4.5, 19.4], [34, 19.4]], look: L(5, "flag") },
        { path: [[34, 18.8], [4.6, 18.8], [2.2, 12.6], [-2.2, 12.6], [-4.6, 18.8], [-34, 18.8]], look: L(6, "umbrella"), phase: 0.5 },
        { path: [[-30, 12.6], [-4, 12.6]], look: L(9, "drink"), phase: 0.3 },
        { path: [[30, 12.4], [4.2, 12.6]], look: L(10, "umbrella"), phase: 0.6 },
        { path: [[-42, 9.6], [-23, 9.6], [-3, 9.9]], look: staff(0, 0) },
        { path: [[42, 9.8], [22, 9.8], [3.2, 10.0]], look: staff(4, 1), phase: 0.5 },
        { path: [[-20, 5.4], [-2.4, 5.4]], look: staff(1, 2), phase: 0.2 },
        { path: [[20, 5.4], [2.4, 5.4]], look: staff(6, 3), phase: 0.6 },
        { path: [[-20.4, -2.1], [-12.2, -2.1]], look: staff(1, 1), phase: 0.1 },
        { path: [[3, -2.2], [20, -2.2]], look: staff(5, 0), phase: 0.4 },
        { path: [[-36, -16.2], [-24, -21], [-20.4, -16]], look: L(8, "umbrella"), phase: 0.3 },
        { path: [[19.4, -16.6], [24, -22], [31, -23.6]], look: L(2, "flag"), phase: 0.6 },
      ];
      const standers: Stander[] = [
        { x: 8.2, z: 23.5, look: L(8), mode: "queue", back: true, solid: false },
        { x: 8.6, z: 24.5, look: L(10, "umbrella"), mode: "queue", back: true, solid: false },
        { x: -26.4, z: 18.6, look: L(1), mode: "queue", back: true },
        { x: -26.0, z: 19.7, look: L(3), mode: "queue", back: true },
        { x: -20.6, z: 18.6, look: L(6), mode: "queue", back: true },
        { x: -16.6, z: 16.4, look: L(2, "umbrella"), mode: "idle", back: true, lines: ["Siapa leading?", "BOLAT GP laju gila", "Safety car lagi?!"] },
        { x: -14.0, z: 16.8, look: L(5), mode: "idle", back: true, lines: ["PIT! PIT!", "Ni lap ke berapa?", "Overtake! OVERTAKE!"] },
        { x: -15.2, z: 17.6, look: L(9), mode: "idle", back: true },
        { x: 6.6, z: 16.9, look: L(0), mode: "browse", back: true },
        { x: 17.8, z: 17.0, look: L(4), mode: "browse", back: true },
        { x: 24.2, z: 19.3, look: L(10), mode: "pose" },
        { x: 27.2, z: 20.2, look: L(11, "camera"), mode: "snap", back: true },
        { x: -7.5, z: 16.5, look: L(3), mode: "browse", back: true, seated: true },
        { x: -22, z: 32.6, look: { skin: "#b97a52", top: "#3b6fe0", bottom: "#2a2730", cap: "#2a2730", hair: "#26222a", bag: "#ff8a1c", carry: "baton", vest: "#ff8a1c" }, mode: "vendor", lines: ["Kiri sikit! Kiri!", "Penuh dah depan!", "Parking belakang bang!"] },
        { x: -21.6, z: -23.2, look: L(4, "umbrella"), mode: "eat", seated: true },
        { x: -20.6, z: -24.0, look: L(0, "umbrella"), mode: "eat", seated: true },
        { x: 19.8, z: -24.0, look: L(6, "umbrella"), mode: "idle", seated: true },
        { x: 21.0, z: -23.2, look: L(8, "drink"), mode: "idle", seated: true },
      ];
      const crowd = await lorbelCrowd(walkers, standers, b.player, 0.7, {
        tint: 0xe8ecf2,
        walk: ["Nak hujan dah ni", "Grandstand mana?", "Jom tengok pit stop", "Bawak payung tak?", "Laju gila tadi!", "Mana parking kita tadi?"],
      });
      anim(crowd);
      add(crowd.statics);
      b.blockers(crowd.solid, 0.34);
      for (const [i, [x, z]] of wall.spots.entries()) {
        const s = await b.standee(personBackDoodle({ ...staff([0, 1, 4, 6][i], i), carry: "none" }), x + (i % 2 ? 0.5 : -0.5), z, 1.6);
        s.position.y = 1.16;
      }
      // MALAS RACING's crew, fast asleep on their sofa.
      const zz = sleepyZs();
      anim(zz);
      for (const [k, dx] of [-0.9, 0.05, 0.95].entries()) {
        const s = await b.standee(passengerDoodle({ ...staff(MALAS, k), carry: "none" }), BAY_X[3] + dx, 3.55, 1.55);
        s.position.y = -0.2;
        s.children[0].rotation.z = [0.35, -0.1, -0.4][k];
        zz.add(BAY_X[3] + dx, 2.3, 3.5, k);
      }
      b.interact("malas", BAY_X[3], 5.4, "Tengok", 2.6, 1.6);
      for (const [i, bx] of BAY_X.entries()) {
        const t = BAYS[i];
        if (t === "pass" || t === MALAS || bx === 0) continue;
        b.interact(`garage:${t}`, bx, 5.3, "Tengok", 2.8, 1.5);
      }
      b.interact("pitwall", 12, -2.3, "Tengok", 2.4, 1.6);

      // ---- The six people holding Qish's passes ("!" until she has theirs).
      for (const [i, g] of SP_GIVERS.entries()) {
        await b.standee(passengerDoodle(g.look), g.at[0], g.at[1], g.look.kid ? 1.35 : 1.85);
        b.interact(g.id, g.at[0], g.at[1] + 0.4, "Tegur", 2.8, 1.7);
        const m = bangMarker(g.at[0], 2.75, g.at[1], () => !got(i) && !passOpen());
        b.root.add(m.sprite);
        b.animate(m.update);
      }
      placeCollectibles(b, "sepang");

      // ---- VIP rope at the foot of the podium stairs, and the bouncer.
      await b.standee(passengerDoodle(SP_BOUNCER), 2.4, 10.7, 1.95);
      const rope = vipRope(0, 10.1, passOpen);
      anim(rope);
      post(-1.75, 10.1, 0.15);
      b.interact("vip", 0.9, 11.0, "Tegur", 2.9, 1.6);

      // ---- Raja Nonchalant on the top step (zzz), "!" once the way up is open.
      const beaten = save.hasCard(BOSSES.finale.card);
      if (!beaten || replayUnlocked()) {
        const f = await b.npc("faris", 0, -0.5, 2.4, beaten ? "replay" : "boss");
        f.group.position.y = DECK_Y + 0.8;
        b.interact(beaten ? "replay" : "boss", 0, 1.1, beaten ? "Main semula" : "Raja Nonchalant!", DECK_Y + 3.5, 1.9, () => b.player().y > 3);
        const m = bangMarker(0, DECK_Y + 3.9, -0.5, () => !save.hasCard(BOSSES.finale.card) && passOpen());
        b.root.add(m.sprite);
        b.animate(m.update);
        if (!beaten) zz.add(0.6, DECK_Y + 3.2, -0.5, 3);
      }

      b.root.add(mergeStatic(statics));
    },
  }),

  labulanjut: zone({
    id: "labulanjut",
    name: "Labu Lanjut",
    sky: 0xbfe3f5,
    fog: 0xcfe6ee,
    // Morning when she first steps out; golden evening once the party is set up.
    mood: () =>
      save.hasCard(BOSSES.finale.card)
        ? { sky: 0xf2a98c, fog: 0xf0b8a0, light: { sun: 1.45, hemi: 0.8, sunColor: 0xff9a50, hemiSky: 0xffc4a0, hemiGround: 0x6a5a7a } }
        : {},
    // The village runs north to south: home at the top, the kampung road down to Bukit Bintang,
    // and a side road west to Litar Sepang. "east" is the spawn coming back up from Bukit Bintang.
    // West of the house is the padang where the kampung cats play, and where the party happens.
    bounds: [-31, -11, 20, 38.6],
    cam: [-19, -4, 6, 33],
    spawns: {
      start: [0, -1.0, "front"],
      door: [0, -1.0, "front"],
      west: [-16.6, 17.5, "right"],
      east: [0, 34.6, "back"],
      myvi: [13, -2.6, "front"],
    },
    async build(b) {
      const party = save.hasCard(BOSSES.finale.card);
      const waiting = awakeAgain();
      const sepangOpen = save.hasCard(BOSSES.qishex.card);
      const box = (x0: number, z0: number, x1: number, z1: number) => b.collider([x0, z0, x1, z1]);
      const post = (x: number, z: number, r = 0.25) => box(x - r, z - r, x + r, z + r);
      const anim = (a: Anim) => {
        b.root.add(a.group);
        b.animate(a.update);
      };
      // Static props go into one group that is baked down to a few meshes at the end.
      const statics = new THREE.Group();
      const add = (...o: THREE.Object3D[]) => statics.add(...o);

      // One painted ground: grass, with the yard path, Myvi pad, roads and worn spots blended in
      // through a soft mask instead of hard slabs on top.
      b.root.add(
        splatGround([0, 14, 110, 90], (p) => {
          p.rect("dirt", -1.9, -2.2, 1.9, 5.6, 0.35, 0.9); // yard path from the porch to the gate
          p.blob("dirt", 0, -1.6, 2.6, 0.25); // worn patch at the porch steps
          p.rect("dirt", 10.0, -10.2, 16.0, -3.0, 0.4, 1.2); // dirt round the Myvi pad...
          p.rect("pavers", 10.7, -9.5, 15.3, -3.7, 0.15, 0.6); // ...and the pad itself
          // Kampung road and the side road west to Sepang, each on a dusty shoulder.
          p.rect("dirt", -3.6, 4.4, 3.6, 46, 0.45, 1.2);
          p.rect("tar", -2.5, 5.2, 2.5, 46, 0.12, 0.8);
          p.rect("dirt", -26, 14.8, -1.5, 20.2, 0.45, 1.2);
          p.rect("tar", -26, 15.9, -1.8, 19.1, 0.12, 0.8);
          // Worn grass on the padang where the cats play and by the benches, and the stream banks.
          for (const [x, z, r, k] of [[-20, -1.5, 2.2, 0.55], [-25, 1.8, 1.1, 0.5], [-29.2, -2.4, 1.2, 0.6], [-11.6, -2.4, 1.2, 0.6], [-10.5, 25.2, 2.0, 0.8], [13.9, 23.4, 2.4, 0.85]] as const)
            p.blob("dirt", x, z, r, 0.35, k);
          // Sandy banks either side of the stream, ragged on the grass side.
          p.rect("dirt", -56, 25.6, 56, 31.0, 0.55, 0.5);
        }),
      );

      // ---- Home yard
      const house = kampungHouse(0, -7, party);
      b.root.add(house.group); // kept out of the bake so it can fade when Qish walks behind it
      if (house.generated) {
        // Measured off the generated model: walls z -12.9..-3.0, porch columns at z -1.9, steps out to -0.4.
        box(-7.6, -12.9, 3.9, -3.0);
        for (const x of [-1.85, 1.95]) post(x, -1.9, 0.32);
        // The porch is reached up its steps only: its raised sides and the step ends are solid.
        box(-2.6, -3.0, -1.2, -1.55);
        box(1.3, -3.0, 2.7, -1.55);
        box(-2.55, -1.6, -1.25, -.35);
        box(1.25, -1.6, 2.55, -.35);
        b.floor((x, z) => Math.abs(x - .05) < 2.2 && z > -3.0 && z < -1.6 ? .45 : Math.abs(x) < 1.25 && z >= -1.6 && z < -.35 ? .45 * (-.35 - z) / 1.25 : 0);
      } else {
        b.collider(house.box);
      }
      // Wooden door on the porch, with a frame and a brass knob (the generated house has its own).
      if (!house.generated) {
        const doorFrame = new THREE.Mesh(roundedBox(1.95, 2.75, 0.16, 0.08), flat(PAL.wood));
        doorFrame.position.set(0, 0.42 + 1.37, -3.42);
        const door = new THREE.Mesh(roundedBox(1.6, 2.5, 0.2, 0.08), flat(PAL.woodDark));
        door.position.set(0, 0.42 + 1.25, -3.36);
        const knob = new THREE.Mesh(new THREE.SphereGeometry(0.09, 12, 10), flat(0xe8b84a));
        knob.position.set(0.55, 1.6, -3.22);
        add(doorFrame, door, knob);
        // The porch floor and its step lift Qish up; the porch columns stand in her way.
        b.floor((x, z) => (Math.abs(x) < 2.05 && z > -3.5 && z < -1.2 ? 0.42 : Math.abs(x) < 1.3 && z >= -1.2 && z < -0.55 ? 0.22 : 0));
        for (const x of [-1.85, 1.85]) post(x, -1.35, 0.25);
      }
      b.interact("door", 0, -0.45, "Masuk bilik", 3.2, 2.0);
      // Pots either side of the porch (the generated house's porch is wider than the old one).
      // Pots flank the porch steps; beds and bushes sit along the house front, which (generated house)
      // runs from 7.85 m west of the door to 4.15 m east of it.
      const [potL, potR] = house.generated ? [-2.8, 3.0] : [-2.5, 2.5];
      for (const x of [potL, potR]) {
        add(pottedFlower(x, -2.9, x < 0 ? 0xff5fa2 : 0xffffff));
        post(x, -2.9, 0.35);
      }
      const beds = house.generated ? ([] as const) : ([[-8.4, -2.9, 3.2], [8.2, -2.9, 3.6]] as const);
      for (const [x, z, w] of beds) {
        add(flowerBed(x, z, w, 0.9));
        box(x - w / 2, z - 0.45, x + w / 2, z + 0.45);
      }
      for (const x of house.generated ? [-9.0, 5.6] : [-7.6, 7.6]) {
        add(bush(x, -4.6));
        box(x - 0.7, -5.0, x + 0.7, -4.2);
      }
      add(myvi(13, -6.3));
      box(11.9, -8.1, 14.1, -4.5);
      b.interact("myvi", 13, -4.0, "Myvi", 2.2, 1.9);
      anim(sleepingCat(13, 2.0, -6.7));
      b.interact("cat", 11.4, -6.6, "Tengok", 2.9, 1.3);
      add(mangoTree(18.8, -8.8, 1));
      post(18.8, -8.8, 0.45);
      anim(fallingLeaves(18.8, -8.8, 3.2));
      anim(clothesline(8.3, -7.7, 3.4));
      post(6.6, -7.7, 0.15);
      post(10.0, -7.7, 0.15);
      b.interact("clothes", 8.3, -6.7, "Tengok", 2.8, 1.6);

      add(signBoard(-4.4, 3.7, "Labu Lanjut"));
      box(-5.3, 3.5, -3.5, 3.9);
      b.interact("sign", -4.4, 3.7, "Baca");
      add(picketFence(-31, -3.2, 5.3), picketFence(3.2, 19.6, 5.3));
      box(-31.5, 5.1, -3.0, 5.5);
      // Past the padang's fence, west of the village is plantation; only the Sepang road goes through.
      box(-32, 5.5, -20.4, 15.6);
      box(-32, 19.4, -20.4, 40);
      box(3.0, 5.1, 20, 5.5);
      anim(hammock(10, 3.5));
      post(8.05, 3.5, 0.25);
      post(11.95, 3.5, 0.25);
      b.interact("hammock", 10, 3.5, "Baring", 2.2, 1.6);
      add(mailbox(3.7, 5.95));
      post(3.7, 5.95, 0.3);
      anim(chickens([8.6, -2.2, 19, 2.6], b.player));
      // Behind the house and round the padang.
      for (const [x, z, i] of [[-10.4, -12.4, 0], [7.2, -12.8, 1], [-15, -12.8, 2], [15.5, -12.4, 3]] as const) add(bananaTree(x, z, i));
      for (const [x, z] of [[-4, -16.2], [3.5, -16.4], [21.5, -9.5]] as const) add(palm(x, z, 1, x));
      for (const [x, z] of [[-20.5, -13.6], [-26, -14.2], [-31.5, -13], [-34.5, -8.5], [-34.8, -3.5], [-34.4, 1.5]] as const) add(oilPalm(x, z, x + z, 1.05));
      for (let z = -9.5; z <= 4; z += 1.7) add(bush(-31.8, z, 0.9, 0x4e8a33));

      // ---- The padang
      for (const [x, z, seed] of [[-28.5, -8.6, 0], [-12.6, -9.2, 2]] as const) {
        add(rainTree(x, z, seed));
        post(x, z, 0.6);
        anim(fallingLeaves(x, z, 4.2, 6));
      }
      for (const x of [-25.5, -14.5]) {
        add(lanternPole(x, 0.6, party));
        post(x, 0.6, 0.15);
      }
      // Two benches face each other across the padang, the cats (and later the party) between them.
      for (const [x, rot] of [[-29.6, Math.PI / 2], [-11.2, -Math.PI / 2]] as const) {
        add(bench(x, -2.4, rot));
        box(x - 0.45, -3.6, x + 0.45, -1.2);
      }
      b.interact("bench", -11.2, -2.4, "Duduk", 1.5, 1.7);
      anim(
        catColony(
          [-30.5, -9.5, -10.6, 4.4],
          party
            ? { chase: [-19.5, 2.6], watch: [-23.4, 3.4], yarn: [-27.8, 2.6], bat: [-13.6, -7.4], roll: [-29.2, -4.6], spin: [-14.8, 3.4], groom: [-25.6, -7.6], sleep: [-23.9, -1.8], friend: [-16.2, -1.2] }
            : { chase: [-20, -1.5], watch: [-16.5, 1.8], yarn: [-25, 1.5], bat: [-14, -6], roll: [-24.5, -6.5], spin: [-17.5, 3.4], groom: [-27.2, -5.4], sleep: [-28.2, -7.6], friend: [-12, 0] },
          b.player,
        ),
      );
      if (party) b.interact("cats", -23.4, 3.4, "Tengok", 1.6, 1.5);
      else b.interact("cats", -16.5, 1.8, "Tengok", 1.6, 1.5);

      // ---- Kampung road
      const neighbourA = stiltHouse(-11.5, 12, { wall: "#a9d3df", roof: 0x6f8fb4, shutter: 0x3f7f9a, evening: party, model: "stilt_blue" });
      const neighbourB = stiltHouse(12, 11.5, { wall: "#e3edc0", roof: 0xc0674a, shutter: 0xa8573c, evening: party, model: "stilt_terra", door: "west" });
      for (const h of [neighbourA, neighbourB]) {
        add(h.group);
        h.boxes.forEach((bx) => b.collider(bx));
      }
      for (const [x, z, i] of [[-17.2, 14.6, 0], [-5.6, 8.2, 1], [16.8, 13, 2], [6.4, 12.6, 3], [-16.4, 23, 4], [17, 25.5, 5]] as const) {
        add(bananaTree(x, z, i));
        post(x, z, 0.3);
      }
      const poles: [number, number][] = [[3.9, 12.6], [3.9, 19.6], [3.9, 25.6]];
      for (const [x, z] of poles) {
        add(electricPole(x, z));
        post(x, z, 0.18);
      }
      add(wires(poles));
      const lamps: [number, number][] = [[-3.7, 9.2], [-3.7, 21.6]];
      for (const [x, z] of lamps) {
        add(lampPost(x, z));
        post(x, z, 0.18);
        if (party) add(lightPool(x + 0.6, z + 0.6));
      }
      // Side road west to Litar Sepang, blocked until Qish has come round the island.
      b.exit("west", [-21, 15.8, -18.6, 19.2], [-16.4, 17.5]);
      if (!sepangOpen) {
        // Fills the gap between the plantation fences (x < -20.4), so it can't be walked round.
        add(roadBlock(-19.6, 17.5));
        box(-20.5, 15.5, -19.0, 19.5);
        b.interact("roadblock", -18.2, 17.5, "Baca", 2.2, 1.6);
      }
      const kedai = kedaiRuncit(11.8, 19, party);
      add(kedai.group);
      kedai.boxes.forEach((bx) => b.collider(bx));
      b.interact("kedai", 13.9, 22.7, "Tengok", 3.4, 1.8);
      add(motorbike(16.6, 21.9, 0.35));
      box(16.0, 21.0, 17.2, 22.8);
      add(wakaf(-10.5, 22.4));
      box(-12.2, 20.7, -8.8, 24.5);
      b.interact("wakaf", -10.5, 25.0, "Lepak", 4.4, 1.7);
      // Only the water texture scrolls, and it survives baking (same material), so the stream is static.
      const water = stream(-55, 55, 27, 29.6);
      add(water.group);
      b.animate(water.update);
      box(-55, 26.8, -2.75, 29.8);
      box(2.75, 26.8, 55, 29.8);
      add(bridge(-2.75, 2.75, 27, 29.6));
      // Walk up and over the arched deck.
      b.floor((x, z) => {
        if (Math.abs(x) > 2.6 || z < 27 - STREAM_BRIDGE.overhang || z > 29.6 + STREAM_BRIDGE.overhang) return 0;
        const u = (z - (27 - STREAM_BRIDGE.overhang)) / (2.6 + STREAM_BRIDGE.overhang * 2);
        return STREAM_BRIDGE.deckEnd + (STREAM_BRIDGE.deckMid - STREAM_BRIDGE.deckEnd) * Math.sin(Math.PI * u);
      });
      anim(ducks(28.3, [[-17, -5], [5, 17]]));
      add(welcomeArch(0, 32.4, "KAMPUNG LABU LANJUT"));
      box(-4.3, 32.0, -3.5, 32.8);
      box(3.5, 32.0, 4.3, 32.8);

      // Ladang sawit down south and round the edges.
      // Rows thin out towards the camera so they frame the exit gate instead of hiding it.
      for (const [z, xs] of [[32.4, [-18.5, -14.5, -10.5, -7, 7, 10.5, 14.5, 18.5]], [35.8, [-18.5, -14.5, -10.5, 10.5, 14.5, 18.5]], [39.4, [-18.5, -14, 14, 18.5]]] as const)
        for (const x of xs) {
          const seed = Math.abs(x * 7 + z);
          add(oilPalm(x + (seed % 3) * 0.3, z, seed, 0.95 + (seed % 4) * 0.05));
          post(x, z, 0.45);
        }
      for (let z = -6; z <= 30; z += 4.5)
        for (const x of [-23.5, 23.5]) if ((x > 0 || z > 12) && !(x < 0 && z > 14 && z < 21)) add(oilPalm(x + (z % 2), z, z + x, 1.05));

      b.exit("east", [-3, 37.6, 3, 39], [0, 35.8]);

      add(
        meadow([-36, -12, 26, 44], [
          [-31.5, -11, -10.1, 5.1],
          [-8.6, -11, 5.2, -1.4],
          [-1.7, -4, 1.7, 5],
          [10.3, -9.8, 15.7, -3.3],
          [-3.1, 4.6, 3.1, 46],
          [-26, 15.4, -2.6, 19.6],
          [-15.5, 9.2, -7.5, 16],
          [8, 8.6, 16, 15.5],
          [7.8, 16.4, 17.4, 24.3],
          [-12.6, 20.4, -8.4, 25],
          [-56, 26.6, 56, 30],
          [-7.3, -3.5, -3.9, -2.3],
          [7.6, 2.6, 12.4, 4.4], // hammock
          [4.7, -3.5, 8.1, -2.3],
        ]),
      );
      anim(butterflies([[-8.6, -1.6], [8.2, -1.6], [-4, 2.2], [16, 1.5], [-12, 19.5], [12.5, 26], [-6, 30.5]]));
      anim(birds([-6, 34]));
      anim(cloudShadows([-12, 42]));
      placeCollectibles(b, "labulanjut");
      if (party) {
        add(bunting(-8, 8, -3.2, 4.2), bunting(-28.5, -12.6, -8.8, 4.6), tikar(-20, -2.6, 9, 3.6));
        // The cake and the two food tables are generated models: collide with what they really cover.
        for (const t of [cake(-20, -5.6), foodTable(-24.2, -5.6), foodTable(-15.8, -5.6)]) {
          add(t);
          const bb = new THREE.Box3().setFromObject(t);
          box(bb.min.x + 0.05, bb.min.z + 0.05, bb.max.x - 0.05, bb.max.z - 0.05);
        }
      }
      b.root.add(mergeStatic(statics));

      if (!party) {
        await b.npc("slothfaris", 4.6, 1.6, 1.9, "sloth");
        box(4.2, 1.3, 5.0, 1.9);
        b.interact("sloth", 4.6, 1.6, "Cakap", 2.3);
        return;
      }

      // The birthday party on the padang: lights, cake, balloons and everyone from the island, among the cats.
      anim(fireflies([-30, -9, 18, 30]));
      for (const fl of [
        fairyLights(-6, 6, -3.0, 3.3, 18),
        fairyLights(-30.5, -3.4, 5.3, 1.5, 34),
        fairyLights(3.4, 19.4, 5.3, 1.5, 22),
        fairyLights(-28.5, -12.6, -8.4, 4.2, 26),
        fairyLights(-25.3, -14.7, 0.6, 3.4, 16),
      ])
        anim(fl);
      // Two bunches by the cake and two tied down on the grass beside the lantern poles.
      for (const [x, z, y] of [[-21.6, -6.2, 1.0], [-18.4, -6.2, 1.0], [-26.5, 1.7, 0], [-13.5, 1.7, 0]] as const) anim(balloons(x, z, y));
      await b.npc("faris", -22.4, -3.6, 2.4, "faris");
      box(-22.8, -3.9, -22.0, -3.3);
      await b.npc("slothfaris", -17.6, -3.6, 1.9, "sloth");
      box(-18.0, -3.9, -17.2, -3.3);
      if (waiting) {
        // Bowat waits with everyone (he only follows Qish again after the party).
        await b.npc("bowat", -20, -2.0, 1.8, "bowatparty");
        box(-20.4, -2.3, -19.6, -1.7);
        // Walking onto the padang starts the surprise.
        b.exit("party", [-31, -9.5, -11.8, 4.6], [-10.6, -0.8]);
      } else {
        b.interact("faris", -22.4, -3.6, "Cakap", 2.9);
        b.interact("sloth", -17.6, -3.6, "Cakap", 2.3);
      }
    },
  }),
};
