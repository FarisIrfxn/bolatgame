import "./style.css";
import "./ui/theme.css";
import "./ui/dialogue.css";
import "./ui/paper.css";
import "./ui/adventure-hud.css";
import "./ui/navigation.css";
import "./ui/qc.css";
import "./ui/mobile.css";
import "./core/viewport";
import "./ui/controlHints";
import { input } from "./core/input";
import { onFrame, startLoop, waitFor } from "./core/loop";
import { save } from "./core/save";
import { sfx } from "./core/sfx";
import { music } from "./core/music";
import { BOSSES, bossOfZone, type BossId } from "./content/bosses";
import { diagnostic } from "./core/diagnostics";
import { cycleGraphicsMode, graphicsLabel } from "./core/graphics";
import {
  ALL_CLUES,
  BABAH,
  BB_ARRIVE,
  BB_FAMILY,
  BB_FAMILY_AFTER,
  BB_SPRAY,
  CLOUD_NO_SPRAY,
  BLEP_NOT_READY,
  BOSS_TALK,
  CLUE_TALK,
  COLLECT_TALK,
  CONSOLE_BEFORE,
  GYM_AGAIN,
  GYM_ENOUGH,
  GYM_TALK,
  PJ_ARRIVE,
  PB_ARRIVE,
  PB_POSE,
  PASS_TALK,
  SP_ARRIVE,
  SP_VIP_OPEN,
  spGarageLines,
  spVipAfter,
  spVipNotYet,
  pbPoseAfter,
  boothxLines,
  PJ_DONE,
  PARTY_AGAIN,
  PARTY_ARRIVE,
  PARTY_SLOTH,
  PARTY_WAITING,
  NYOM_ARRIVE,
  RESIT_TALK,
  REPLAY_HINT,
  ROAD_CLOSED,
  SAMPAN_ASK,
  SAMPAN_TIP,
  SKIP_LINES,
  TASIK_ARRIVE,
  WAKE,
  WAKE_AGAIN,
  WAKE_ALL,
  WAKE_TALK,
  ZONE_TALK,
  bossCollectNotYet,
  boothLines,
  doorNotYet,
  lockedLines,
  pjNotReady,
  pjScale,
  replayAsk,
  replayWin,
  stripLines,
} from "./content/script";
import { playDream } from "./intro/dream";
import { activeMinigameScene, destroyMinigame, forceWinMinigame, prepareMinigame, runMinigame } from "./minigames/framework";
import { MINIGAMES } from "./minigames/registry";
import { itemIcon } from "./overworld/items";
import { Overworld } from "./overworld/overworld";
import type { ZoneId } from "./overworld/zone";
import { playEnding } from "./ending/ending";
import { revealCard } from "./ui/cardReveal";
import { mountDevPanel } from "./ui/devPanel";
import { chooseMenu } from "./ui/menu";
import { ask, dialogOpen, say } from "./ui/dialog";
import { el, fadeThrough, stage, ui } from "./ui/dom";
import { hideHud, refreshHud, setCollect, setWorkout, showHud } from "./ui/hud";
import { showPhone } from "./ui/phone";
import { repMeter } from "./ui/reps";
import { mountTouchControls } from "./ui/touch";
import { mountFullscreenButton } from "./ui/fullscreen";
import { zoneTitle } from "./ui/zoneTitle";
import { mountTitleChase } from "./ui/titleChase";
import { showTravelMap } from "./ui/travelMap";
import { showBossSelect } from "./ui/bossSelect";
import {
  COLLECT,
  SHORT,
  babahFixed,
  ZONES,
  ZONE_ORDER,
  awakeAgain,
  clueFlags,
  cluesFound,
  collectDone,
  collectNeed,
  collectedCount,
  gotFlag,
  nextZone,
  photoboothFx,
  prevZone,
  replayUnlocked,
  SP_GIVERS,
} from "./zones/zones";
import { DOCK, JETTY_END, SAMPAN, boat } from "./zones/sampan";
import { KG_GOAL, KG_PER_STATION, KG_START, STATIONS, burn, gym, kgNow, kgText, live, markStation, onWorkout, stationDone, stationPose, workoutDone } from "./zones/workout";

let screen: HTMLElement | null = null;
let minigameHost: HTMLDivElement | null = null;
let travelFailure: HTMLElement | null = null;

function showTravelFailure(retry: () => void) {
  travelFailure?.remove();
  travelFailure = el("div", "travel-failure", `<strong>Belum dapat sediakan bandar.</strong><span>Semak sambungan dan cuba lagi ya.</span><button type="button">Cuba lagi</button>`);
  travelFailure.querySelector("button")!.addEventListener("click", () => {
    travelFailure?.remove();
    travelFailure = null;
    retry();
  }, { once: true });
  ui().appendChild(travelFailure);
}

/** The way on opens once the zone's boss is beaten, or (zones without a boss) everything is collected. */
const zoneCleared = (z: ZoneId) => {
  const boss = bossOfZone(z);
  return boss ? save.hasCard(BOSSES[boss].card) : collectDone(z);
};

/** Putrajaya keeps its finished workout objective visible too. */
let hudKg = "";
let hudBuddy = false;
function refreshWorkout(bump = false) {
  const show = overworld.currentZone === "bukit";
  if (!show) return setWorkout(null);
  const kg = workoutDone() || save.hasCard(BOSSES.qishex.card) ? KG_GOAL : kgNow();
  hudKg = kgText(kg);
  hudBuddy = live.buddy;
  setWorkout({ kg: hudKg, progress: (KG_START - kg) / (KG_START - KG_GOAL), buddy: hudBuddy }, bump);
}

let exercising = false;

// The scale ticks down as she jogs; at 80kg the Qish ex chase is on (once she's off any machine).
onWorkout((kg, step, done) => {
  if (step || kgText(kg) !== hudKg || live.buddy !== hudBuddy) refreshWorkout(step && kg * 10 % 5 < 0.11);
  if (done) {
    refreshWorkout(true);
    void (async () => {
      await waitFor(() => !exercising && !dialogOpen());
      sfx.fanfare();
      await say(PJ_DONE);
    })();
  }
});

/** Show the current zone objective, including its completed state on return visits. */
function refreshCollect(zone: ZoneId, bump = false) {
  if (zone === "bukit") { setCollect(null); return refreshWorkout(bump); }
  setWorkout(null);
  const c = COLLECT[zone];
  const need = collectNeed(zone);
  setCollect(c ? { icon: itemIcon(c.kind), kind: c.kind, name: c.name, got: collectDone(zone) ? need : collectedCount(zone), need } : null, bump);
}

/** Zones reachable so far: the first one, plus every zone after a cleared zone. */
const unlockedZones = () => ZONE_ORDER.filter((z, i) => i === 0 || zoneCleared(ZONE_ORDER[i - 1]));

const overworld = new Overworld({
  async interact(zone, id) {
    if (id === "boss") return bossEncounter(bossOfZone(zone)!);
    if (id === "replay") return rematch(bossOfZone(zone)!, { zone, spawn: "boss" });
    if (id === "myvi") return myviTravel(zone);
    if (id === "roadblock") return say(ROAD_CLOSED);
    if (zone === "bilik") return bedroom(id);
    if (id === "babah") return babahTalk(zone);
    if (zone === "labulanjut") {
      if (id === "door") return void travel("bilik", "door");
      if (id === "faris") {
        const again = await ask(PARTY_AGAIN, ["Nak!", "Nanti"]);
        if (again === 0) void ending();
        return;
      }
      if (id === "sloth" && save.flag("endingSeen")) return say(PARTY_SLOTH);
    }
    if (id === "sloth") return say(ZONE_TALK[save.flag("bowatJoined") ? "labulanjut:slothAfter" : "labulanjut:slothBefore"]);
    if (zone === "sunway") {
      if (id === "kedai24" && !save.flag("bbSpray") && !collectDone("sunway")) {
        await say(BB_SPRAY);
        save.setFlag("bbSpray");
        sfx.spray();
        return;
      }
      if (id.startsWith("cloud:")) {
        sfx.cough();
        return say(CLOUD_NO_SPRAY);
      }
      if (id === "family") {
        if (save.flag("bbShawarma")) return say(BB_FAMILY_AFTER);
        await say(BB_FAMILY);
        save.setFlag("bbShawarma");
        sfx.sparkle();
        return;
      }
    }
    if (zone === "cosyplace") {
      if (id === "maitre") {
        if (save.flag("cosyMaitre")) return say(ZONE_TALK["cosyplace:maitreAgain"]);
        await say(ZONE_TALK["cosyplace:maitre"]);
        save.setFlag("cosyMaitre");
        return;
      }
      if (id === "table" && save.hasCard(BOSSES.megabowat.card)) return say(ZONE_TALK["cosyplace:tableAfter"]);
    }
    if (zone === "dusun") {
      if (id === "sampan") return boardSampan();
      if (id === "dock") return leaveSampan();
    }
    if (zone === "bukit") {
      if (id === "scale") return say(pjScale(kgText(), workoutDone()));
      if (id.startsWith("gym:")) return exercise(Number(id.split(":")[1]));
      if (id === "arch" && save.hasCard(BOSSES.qishex.card)) return say(ZONE_TALK["bukit:archAfter"]);
    }
    if (zone === "sepang") {
      if (id === "vip") return spVip();
      if (SP_GIVERS.some((g) => g.id === id)) {
        const i = SP_GIVERS.findIndex((g) => g.id === id);
        return say(ZONE_TALK[`sepang:${id}${save.flag(gotFlag("sepang", i)) || collectDone("sepang") ? "After" : ""}`]);
      }
      if (id.startsWith("garage:")) return say(spGarageLines(Number(id.split(":")[1])));
    }
    if (zone === "photobooth") {
      if (id.startsWith("boothx:")) return say(boothxLines(Number(id.split(":")[1])));
      if (id === "backdrop") return poseForPicture();
    }
    if (id.startsWith("booth:")) return say(boothLines(Number(id.split(":")[1])));
    if (id.startsWith("strip:")) return say(stripLines(Number(id.split(":")[1])));
    const lines = ZONE_TALK[`${zone}:${id}`];
    if (lines) await say(lines);
  },
  async exit(zone, id) {
    if (id === "party") {
      void ending();
      return true;
    }
    if (awakeAgain() && zone === "labulanjut") {
      await say(PARTY_WAITING);
      return false;
    }
    if (id === "east") {
      if (!zoneCleared(zone)) {
        const talk = COLLECT_TALK[zone];
        await say(!collectDone(zone) && talk ? talk.notYet(collectedCount(zone), collectNeed(zone)) : lockedLines(SHORT[nextZone(zone)]));
        return false;
      }
      void travel(nextZone(zone), "west");
      return true;
    }
    if (id === "west") {
      // Home and Litar Sepang are neighbours, but that road opens only once Qish has come round the island.
      const prev = prevZone(zone);
      if (!unlockedZones().includes(prev)) {
        await say(ROAD_CLOSED);
        return false;
      }
      void travel(prev, "east");
      return true;
    }
    return false;
  },
  async pickup(zone, id) {
    const c = COLLECT[zone];
    if (!c) return;
    save.setFlag(gotFlag(zone, Number(id)));
    if (c.kind === "kentut") sfx.spray();
    else sfx.pickup();
    const got = collectedCount(zone);
    const done = got >= collectNeed(zone);
    refreshCollect(zone, true);
    const talk = COLLECT_TALK[zone];
    // Nyomnyom City: every receipt is a shopkeeper with a story about Bowat.
    if (zone === "cosyplace") await say(RESIT_TALK[Number(id)]);
    // Litar Sepang: every pass comes with a word from whoever Raja Nonchalant left it with.
    if (zone === "sepang") await say(PASS_TALK[Number(id)]);
    if (done) {
      sfx.fanfare();
      if (talk) await say(talk.done);
    } else if (got === 1 && talk) await say(talk.first);
  },
});
// Dev builds only: lets the screenshot script stand Qish anywhere (overworld.placePlayer).
if (import.meta.env.DEV) (window as unknown as { __overworld: Overworld }).__overworld = overworld;

function clearScene(keepMusic = false) {
  if (!keepMusic) music.stop();
  screen?.remove();
  screen = null;
  overworld.unmount();
  destroyMinigame();
  minigameHost?.remove();
  minigameHost = null;
  hideHud();
}

async function toZone(id: ZoneId, spawn: string) {
  clearScene(true);
  diagnostic("zone loading", { zone: id, spawn });
  music.play("overworld");
  const loading = el("div", "city-loading");
  loading.textContent = `Sediakan ${ZONES[id].name}…`;
  loading.setAttribute("role", "status");
  document.getElementById("game-viewport")!.appendChild(loading);
  try {
    // Let the loading message paint before synchronous geometry/mask work.
    await new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
    await overworld.loadZone(ZONES[id], spawn);
    await overworld.mount();
    diagnostic("zone ready", { zone: id, models: overworld.modelState() });
    showHud(ZONES[id].name + (id === "bilik" ? bedroomProgress() : ""));
    refreshCollect(id);
    save.data.zone = id;
    save.write();
  } finally { loading.remove(); }
}

async function travel(id: ZoneId, spawn: string) {
  travelFailure?.remove();
  travelFailure = null;
  const previous = overworld.currentZone;
  overworld.lock();
  try {
    await fadeThrough(() => toZone(id, spawn));
    await zoneTitle(ZONES[id].name);
    await arrive(id);
  } catch (error) {
    console.error(`Travel to ${id} failed`, error);
    document.querySelector<HTMLElement>(".fade")?.classList.remove("on");
    try {
      // `toZone` clears the failed scene before building. Rebuild the last
      // known-good zone so a Safari/WebGL hiccup does not strand the player in
      // a locked, empty canvas.
      if (previous && ZONES[previous]) await toZone(previous, "start");
      overworld.unlock();
    } catch (recoveryError) {
      console.error("Travel recovery failed", recoveryError);
      overworld.unlock();
    }
    showTravelFailure(() => void travel(id, spawn));
  }
}

/** First steps into a zone. Bukit Bintang: everyone running from Bowat's clouds. Tasik Lily: lilies everywhere. Putrajaya: Qish remembers she hasn't
 * jogged today and gets on the scale. */
async function arrive(id: ZoneId) {
  if (id === "sunway" && !save.flag("bbArrived") && !collectDone("sunway")) {
    save.setFlag("bbArrived");
    await say(BB_ARRIVE);
  }
  if (id === "cosyplace" && !save.flag("nyomArrived") && !collectDone("cosyplace")) {
    await say(NYOM_ARRIVE);
    save.setFlag("nyomArrived");
  }
  if (id === "dusun" && !save.flag("tasikArrived") && !save.hasCard(BOSSES.snorlax.card)) {
    save.setFlag("tasikArrived");
    await say(TASIK_ARRIVE);
  }
  if (id === "photobooth" && !save.flag("pbArrived") && !collectDone("photobooth")) {
    save.setFlag("pbArrived");
    photoboothFx.kick();
    await new Promise((r) => setTimeout(r, 2600));
    await say(PB_ARRIVE);
  }
  if (id === "bukit" && !save.flag("pjArrived") && !collectDone("bukit")) {
    save.setFlag("pjArrived");
    await say(PJ_ARRIVE);
  }
  if (id === "sepang" && !save.flag("spArrived") && !collectDone("sepang")) {
    save.setFlag("spArrived");
    await new Promise((r) => setTimeout(r, 900));
    sfx.thunder();
    await say(SP_ARRIVE);
  }
}

/** Litar Sepang: the bouncer at the podium stairs lets Qish up once she has all six passes. */
async function spVip() {
  if (!collectDone("sepang")) return say(spVipNotYet(collectedCount("sepang"), collectNeed("sepang")));
  if (save.flag("spVip") || save.hasCard(BOSSES.finale.card)) return say(spVipAfter(save.hasCard(BOSSES.finale.card)));
  save.setFlag("spVip");
  await say(SP_VIP_OPEN.slice(0, 1));
  sfx.sparkle();
  await say(SP_VIP_OPEN.slice(1));
}

/** Lorong Photobooth: stand at a backdrop and have the picture taken (Bowat photobombs if he's along). */
async function poseForPicture() {
  overworld.facePlayer("front");
  await say(PB_POSE.slice(0, 1));
  photoboothFx.snap();
  sfx.shutter();
  await say(PB_POSE.slice(1));
  await say(pbPoseAfter(save.flag("bowatJoined") && !save.flag("bowatAway")));
}

/** Tasik Lily: step into the sampan at the end of the jetty and row out (asked the first time). */
async function boardSampan() {
  if (!save.flag("sampanTip") && (await ask(SAMPAN_ASK, ["Jom!", "Nanti dulu"])) !== 0) return;
  sfx.splash();
  overworld.placePlayer(DOCK[0], DOCK[1], "back");
  SAMPAN.heading = Math.PI;
  overworld.setRide(SAMPAN);
  boat.riding = true;
  if (!save.flag("sampanTip")) {
    save.setFlag("sampanTip");
    await say(SAMPAN_TIP);
  }
}

/** Back at the jetty: tie up and climb out. */
async function leaveSampan() {
  overworld.setRide(null);
  boat.riding = false;
  overworld.placePlayer(JETTY_END[0], JETTY_END[1] + 0.6, "front");
  sfx.splash();
}

/** A Taman Kecergasan machine: mash A through the reps, each one ticking the scale down. */
async function exercise(i: number) {
  if (workoutDone()) return say(GYM_ENOUGH);
  if (stationDone(i)) return say(GYM_AGAIN);
  const st = STATIONS[i];
  const talk = GYM_TALK[i];
  if ((await ask({ who: "qish", text: talk.ask }, ["Jom!", "Nanti dulu"])) !== 0) return;
  await say(talk.start);
  exercising = true;
  overworld.placePlayer(st.spot[0], st.spot[1], "front");
  gym.active = i;
  gym.rep = -10;
  let now = 0;
  const stopPose = onFrame((_, t) => {
    now = t;
    overworld.setPose(stationPose(i, t, Math.max(0, 1 - (t - gym.rep) * 2.2)));
  });
  await repMeter(st.name, st.reps, () => {
    gym.rep = now;
    sfx.rep();
    burn(KG_PER_STATION / st.reps);
  });
  stopPose();
  overworld.setPose(null);
  gym.active = -1;
  markStation(i);
  overworld.placePlayer(st.spot[0], st.spot[1] + 1.2, "front");
  exercising = false;
  if (!workoutDone()) await say(talk.done);
}

/** Bedroom: notice the three missing things, then the door opens. Played twice: in the morning,
 * and again when she wakes up after the island. */
async function bedroom(id: string) {
  const again = awakeAgain();
  const flags = clueFlags();
  const clue = async (i: number, first: () => Promise<void>, revisit: () => Promise<void>) => {
    if (save.flag(flags[i])) return revisit();
    await first();
    save.setFlag(flags[i]);
    showHud(ZONES.bilik.name + bedroomProgress());
    if (cluesFound() === flags.length) await say(again ? WAKE_ALL : ALL_CLUES);
  };
  if (id === "bed") {
    if (again) return clue(0, () => say(WAKE_TALK.bowat), () => say(WAKE_TALK.bowatAgain));
    return clue(0, () => say(CLUE_TALK.bowat), () => say(save.flag("bowatJoined") ? CLUE_TALK.bowatAfter : CLUE_TALK.bowat.slice(1, 2)));
  }
  if (id === "board") {
    if (again) return clue(1, () => say(WAKE_TALK.strips), () => say(WAKE_TALK.stripsAgain));
    const back = save.hasCard(BOSSES.bolatex.card);
    return clue(1, () => say(CLUE_TALK.strips), () => say(back ? CLUE_TALK.stripsBack : CLUE_TALK.stripsStill));
  }
  if (id === "phone") {
    if (again)
      return clue(
        2,
        async () => {
          await showPhone("wake");
          await say(WAKE_TALK.faris);
        },
        () => say(WAKE_TALK.farisAgain),
      );
    return clue(
      2,
      async () => {
        await showPhone("send");
        await say(CLUE_TALK.faris);
      },
      async () => {
        if (save.flag("endingSeen")) return say(CLUE_TALK.farisFound);
        await showPhone("unanswered");
        await say(CLUE_TALK.farisStill);
      },
    );
  }
  if (id === "console") {
    return replayConsole();
  }
  if (id === "door") {
    const n = cluesFound();
    if (n < flags.length) return say(doorNotYet(n));
    await travel("labulanjut", "door");
    if (again) await say(PARTY_ARRIVE);
  }
}

const bedroomProgress = () => (cluesFound() < clueFlags().length ? ` · Benda hilang ${cluesFound()}/${clueFlags().length}` : "");

async function myviTravel(here: ZoneId) {
  if (awakeAgain()) return say(PARTY_WAITING);
  overworld.lock();
  try {
    const pick = await showTravelMap(here, unlockedZones());
    if (pick && unlockedZones().includes(pick)) await travel(pick, "myvi");
    else overworld.unlock();
  } catch (error) { overworld.unlock(); throw error; }
}

async function replayConsole() {
  if (!replayUnlocked()) return say(CONSOLE_BEFORE);
  const bosses = (Object.keys(BOSSES) as BossId[]).filter(b => save.hasCard(BOSSES[b].card));
  overworld.lock();
  try {
    const pick = await showBossSelect(bosses);
    if (pick) void playBoss(pick, { zone: "bilik", spawn: "console" });
    else overworld.unlock();
  } catch (error) { overworld.unlock(); throw error; }
}

async function bossEncounter(boss: BossId) {
  const zone = BOSSES[boss].zone;
  if (boss === "qishex" && !collectDone(zone)) return say(pjNotReady(kgText()));
  if (boss === "bowat" && !collectDone(zone) && !save.flag("bbSpray")) {
    sfx.cough();
    return say([...BOSS_TALK.bowat.collect!(collectedCount(zone), collectNeed(zone)).slice(0, 3), ...CLOUD_NO_SPRAY.slice(1)]);
  }
  const c = COLLECT[zone];
  if (c && !collectDone(zone)) {
    const collectTalk = BOSS_TALK[boss].collect;
    return say(collectTalk ? collectTalk(collectedCount(zone), collectNeed(zone)) : bossCollectNotYet(BOSSES[boss].name, c.name, collectedCount(zone), collectNeed(zone)));
  }
  if (boss === "blep" && !babahFixed()) return say(BLEP_NOT_READY);
  const talk = BOSS_TALK[boss];
  await say(talk.pre);
  const choice = await ask({ who: "qish", text: talk.ask }, ["Jom!", "Nanti dulu"]);
  if (choice === 0) void playBoss(boss);
}

/** Babah: asks for his tools at KLIA, closes up the engine once he has them and flies Qish off to fight
 * Blep, and never quite keeps the secret. At the party (and after it) he just says happy birthday. */
async function babahTalk(zone: ZoneId) {
  if (save.flag("endingSeen")) {
    await say(BABAH.party);
    if (zone !== "angkasa") return;
    const again = await ask(BABAH.again, ["Jom terbang!", "Nanti dulu"]);
    if (again === 0) void playBoss("blep", { zone, spawn: "babah" });
    return;
  }
  if (save.hasCard(BOSSES.blep.card)) return say(BABAH.after);
  if (!save.flag("babahMet")) {
    await say(BABAH.intro);
    save.setFlag("babahMet");
    return;
  }
  if (!collectDone("angkasa")) return say(BABAH.remind(collectedCount("angkasa"), collectNeed("angkasa")));
  if (!save.flag("babahFixed")) {
    await say(BABAH.fix);
    for (const d of [0, 260, 520]) setTimeout(() => sfx.clank(), d);
    save.setFlag("babahFixed");
    await new Promise((r) => setTimeout(r, 1100));
    sfx.fanfare();
    await say(BABAH.fixed);
  } else await say(BABAH.ready);
  const go = await ask(BABAH.ask, ["Jom terbang!", "Nanti dulu"]);
  if (go !== 0) return say(BABAH.notNow);
  await say(BABAH.sendoff);
  void playBoss("blep");
}

async function rematch(boss: BossId, back: { zone: ZoneId; spawn: string }) {
  const choice = await ask(replayAsk(BOSSES[boss].name), ["Jom!", "Nanti dulu"]);
  if (choice === 0) void playBoss(boss, back);
}

/** Play a boss minigame. With `rematch` it is a replay after the ending: no card, no story, straight back. */
async function playBoss(boss: BossId, rematch?: { zone: ZoneId; spawn: string }) {
  const info = BOSSES[boss];
  const talk = BOSS_TALK[boss];
  overworld.lock();
  diagnostic("boss preparing", { boss, zone: overworld.currentZone });
  await prepareMinigame(MINIGAMES[boss]);
  diagnostic("boss assets ready", { boss });
  let bossResult!: Promise<"win" | "skip">;
  await fadeThrough(async () => {
    clearScene();
    diagnostic("boss world unmounted", { boss });
    minigameHost = el("div");
    minigameHost.style.cssText = "position:absolute;inset:0;background:#0d1230";
    minigameHost.appendChild(el("div", "rotate-hint", "Pusingkan phone 🔄 untuk skrin besar"));
    stage().appendChild(minigameHost);
    // Lift the fade only once the illustrated intro is mounted, including cold loads.
    await new Promise<void>((resolve, reject) => {
      bossResult = runMinigame(MINIGAMES[boss], minigameHost!, resolve);
      void bossResult.catch(reject);
    });
  });
  const result = await bossResult;
  if (rematch) {
    await say(result === "win" ? replayWin(info.name) : SKIP_LINES);
    await travel(rematch.zone, rematch.spawn);
    return;
  }
  await say(result === "win" ? talk.win : [...SKIP_LINES, ...talk.win.slice(-1)]);
  await revealCard(info.card);
  if (boss === "bowat") save.setFlag("bowatJoined");
  if (boss === "finale") return wakeAgain();
  await travel(info.zone, "boss");
  // Shrunk back from Mega Bowat: flat on his back, belly up, for the after-talk.
  if (boss === "megabowat") overworld.setBowatPose("lie_tired");
  if (talk.after) await say(talk.after);
  overworld.setBowatPose(null);
}

/** After Raja Nonchalant: white-out, and Qish wakes up in her bedroom again. Bowat is away (at the party). */
async function wakeAgain() {
  save.setFlag("bowatAway");
  await fadeThrough(async () => {
    await toZone("bilik", "start");
    overworld.lock();
  }, true);
  await zoneTitle(ZONES.bilik.name, true);
  await say(WAKE_AGAIN);
  overworld.unlock();
}

async function ending() {
  overworld.lock();
  await playEnding();
  save.setFlag("bowatAway", false);
  await travel("labulanjut", "start");
  if (!save.flag("replayHintSeen")) {
    await say(REPLAY_HINT);
    save.setFlag("replayHintSeen");
  }
}

async function title() {
  clearScene();
  music.play("gimmeLove");
  screen = el(
    "div",
    "title-screen big",
    `<div class="title-inner">
      <h1 class="logo"><span class="sr-only">The Adventure of Qish</span><img src="/assets/ui/qish-logo.webp" alt="" fetchpriority="high"></h1>
      <button class="press">Press Start</button>
    </div>`,
  );
  ui().appendChild(screen);
  mountTitleChase(screen);
  mountFullscreenButton(screen);
  let clicked = false;
  screen.addEventListener("pointerdown", () => (clicked = true));
  await waitFor(() => input.pressed("a") || input.pressed("start") || clicked);
  sfx.unlock();
  music.unlock();
  sfx.select();

  const inner = screen.querySelector(".title-inner") as HTMLElement;
  inner.querySelector(".press")?.remove();
  // The big landing logo shrinks back to make room for the menu.
  screen.classList.remove("big");
  if (!save.hasProgress()) {
    save.newGame();
    return intro();
  }
  while (true) {
    const pick = await chooseMenu(inner, ["Sambung", `Grafik: ${graphicsLabel()}`, "Main baru"]);
    if (pick === 0) {
      const z = save.data.zone as ZoneId | undefined;
      return travel(z && ZONES[z] ? z : "labulanjut", "start");
    }
    if (pick === 1) {
      cycleGraphicsMode();
      continue;
    }
    const sure = await chooseMenu(inner, ["Tak jadi", "Ya, mula baru"], "Mula semula? Progress lama akan hilang.");
    if (sure === 1) {
      save.newGame();
      refreshHud();
      return intro();
    }
  }
}

async function intro() {
  // Only scene setup happens inside the fades; dialogue plays once they lift.
  await fadeThrough(() => clearScene());
  const removeDream = await playDream();
  save.setFlag("introSeen");
  await fadeThrough(async () => {
    removeDream();
    await toZone("bilik", "start");
    overworld.lock();
  });
  await zoneTitle(ZONES.bilik.name, true);
  await say(WAKE);
  overworld.unlock();
}

async function testReveal(n: number) {
  await revealCard(n);
  refreshHud();
}

// Test hook for headless playthroughs (dev server only).
if (import.meta.env.DEV) Object.assign(window, { __pokelove: { overworld, save, travel, loadZone: toZone, playEnding, say, boardSampan, playBoss, activeMinigameScene, music, input, myviTravel, replayConsole } });

export async function startGame() {
  await overworld.whenReady();
  // A key held during the last bit of loading must not auto-press Start.
  input.poll();
  input.poll();
  startLoop();
  mountTouchControls();
  mountDevPanel({
    title: () => void title(),
    intro: () => void intro(),
    zones: (["bilik", ...ZONE_ORDER] as ZoneId[]).map((id) => ({ id, label: SHORT[id] })),
    goZone: (id) => void travel(id as ZoneId, "start"),
    bossHere: () => {
      const boss = overworld.currentZone ? bossOfZone(overworld.currentZone) : undefined;
      if (boss) void playBoss(boss);
    },
    winBoss: forceWinMinigame,
    collectHere: () => {
      const z = overworld.currentZone;
      if (z === "bukit") return burn(KG_START);
      if (!z || !COLLECT[z]) return;
      COLLECT[z]!.spots.forEach((_, i) => save.setFlag(gotFlag(z, i)));
      void travel(z, "start");
    },
    reveal: (n) => void testReveal(n),
  });
  void title();
}
