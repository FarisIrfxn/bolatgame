import * as THREE from "three";
import { input } from "../core/input";
import { gameViewport } from "../core/viewport";
import { onFrame } from "../core/loop";
import { save } from "../core/save";
import { diagnostic } from "../core/diagnostics";
import { GRAPHICS_PROFILES, graphicsMode, graphicsTier, onGraphicsChange, setAutomaticTier, type GraphicsTier } from "../core/graphics";
import { dialogOpen } from "../ui/dialog";
import { el, stage, ui } from "../ui/dom";
import { PaperSprite, paperStandee, releaseZonePaperTextures, type Facing } from "./paper";
import { prepareZoneModels, modelCacheState } from "./models";
import { preloadTextures } from "./textures";
import { makeComposer } from "./post";
import { bendTree, planet } from "./planet";
import { toonify } from "./style";
import { discoveryMarker } from "./discovery";
import type { Box, Pickup, Ride, ZoneBuilder, ZoneDef, ZoneId } from "./zone";

interface Interactable {
  id: string;
  pos: THREE.Vector3;
  range: number;
  label: string;
  /** World-space height for the prompt bubble. */
  top: number;
  when?: () => boolean;
}

interface Exit {
  id: string;
  box: Box;
  /** Where to step the player back to if they stay. */
  back: THREE.Vector3;
}

interface PlacedPickup {
  id: string;
  pos: THREE.Vector3;
  item: Pickup;
  when?: () => boolean;
}

export interface OverworldHooks {
  interact: (zone: ZoneId, id: string) => Promise<void>;
  /** Return true when the player is leaving; the hook must call lock() (travel does). */
  exit: (zone: ZoneId, id: string) => Promise<boolean>;
  /** Qish walked into a pickup. */
  pickup: (zone: ZoneId, id: string) => Promise<void>;
}

const SPEED = 5.2;
const PLAYER_R = 0.42;
const PICKUP_R = 1.0;
const CAM_OFFSET = new THREE.Vector3(0, 19, 17.5);
const TOUCH_DEVICE = typeof navigator !== "undefined" && navigator.maxTouchPoints > 0;

export class Overworld {
  // MSAA plus two full-screen blur passes is disproportionately expensive on
  // iOS WebGL. The desktop path keeps the original look; touch devices use the
  // cheaper path so a world transition does not push Safari over its GPU limit.
  private renderer = new THREE.WebGLRenderer({ antialias: !TOUCH_DEVICE });
  private scene = new THREE.Scene();
  private camera = new THREE.PerspectiveCamera(34, 1, 0.5, 200);
  private post!: ReturnType<typeof makeComposer>;
  // Warm key light plus a cool lavender fill is the shared style anchor for
  // every zone. Individual zones may shift the mood, but never back to the
  // harsh neutral lighting of the old prototype.
  private sun = new THREE.DirectionalLight(0xffe2b8, 2.4);
  private hemi = new THREE.HemisphereLight(0xfff4e0, 0x8d83b7, 1.15);
  private player = new PaperSprite(2.3);
  private bowat = new PaperSprite(1.8);

  private zone: ZoneDef | null = null;
  private zoneRoot = new THREE.Group();
  private npcs = new Map<string, PaperSprite>();
  private colliders: Box[] = [];
  private blockerSets: { get: () => readonly THREE.Vector3[]; r: number }[] = [];
  private regions: ((x: number, z: number) => boolean)[] = [];
  private floors: ((x: number, z: number) => number)[] = [];
  private ride: Ride | null = null;
  private bowatPose: string | null = null;
  private interactables: Interactable[] = [];
  private exits: Exit[] = [];
  private pickups: PlacedPickup[] = [];
  private animated: ((t: number) => void)[] = [];
  /** Big props that turn see-through while they stand between the camera and Qish. */
  private faders: { box: THREE.Box3; mats: THREE.Material[]; k: number }[] = [];
  private fadeRay = new THREE.Ray();
  private fadeHit = new THREE.Vector3();

  private trail: THREE.Vector3[] = [];
  private camTarget = new THREE.Vector3();
  private camOffset = new THREE.Vector3();
  private bubble = el("div", "prompt-bubble");
  private webglWarning = el("div", "webgl-warning", "<strong>Paparan 3D terhenti sekejap.</strong><span>Safari sedang pulihkan grafik. Tunggu sekejap atau refresh; progress awak dah disimpan.</span>");
  private stopLoop: (() => void) | null = null;
  /** An interaction or exit prompt is running. */
  private busy = false;
  /** A scene change is under way; only mount() clears it. */
  private sceneLock = false;
  private ready: Promise<void>;
  private zoneTask: Promise<void> = Promise.resolve();
  private sampleAt = performance.now();
  private sampleFrames = 0;
  private graphicsTierNow: GraphicsTier = graphicsTier();
  private slowSamples = 0;
  private fastSamples = 0;

  constructor(private hooks: OverworldHooks) {
    this.renderer.setPixelRatio(Math.min(GRAPHICS_PROFILES[this.graphicsTierNow].maxDpr, window.devicePixelRatio));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.16;
    this.post = makeComposer(this.renderer, this.scene, this.camera, { lowPower: this.graphicsTierNow > 0 });
    onGraphicsChange((_mode, tier) => {
      this.slowSamples = this.fastSamples = 0;
      this.applyGraphicsTier(tier);
    });
    this.webglWarning.hidden = true;
    ui().appendChild(this.webglWarning);
    this.renderer.domElement.addEventListener("webglcontextlost", (event) => {
      // Safari may reset a WebGL context under memory/GPU pressure. Prevent the
      // browser's default teardown and tell the player what happened instead of
      // leaving a black canvas that looks like a broken save.
      event.preventDefault();
      this.webglWarning.hidden = false;
      diagnostic("world WebGL lost", { zone: this.currentZone });
      console.warn("WebGL context lost; waiting for browser restoration");
    });
    this.renderer.domElement.addEventListener("webglcontextrestored", () => {
      this.renderer.resetState();
      this.webglWarning.hidden = true;
      diagnostic("world WebGL restored", { zone: this.currentZone });
      console.info("WebGL context restored");
    });
    this.ready = this.init();
    // A phone rotation during a boss must not reallocate full-screen world
    // targets while the overworld canvas is detached.
    window.addEventListener("gameviewportresize", () => {
      if (this.renderer.domElement.isConnected) this.resize();
    });
  }

  private async init() {
    await Promise.all([document.fonts.load("74px 'Bagel Fat One'"), document.fonts.load("bold 64px 'Gaegu'")]).catch(() => {});
    this.sun.castShadow = true;
    const shadowSize = GRAPHICS_PROFILES[this.graphicsTierNow].shadowSize;
    this.sun.shadow.mapSize.set(shadowSize, shadowSize);
    const sc = this.sun.shadow.camera;
    sc.left = -26;
    sc.right = 26;
    sc.top = 26;
    sc.bottom = -26;
    sc.near = 1;
    sc.far = 80;
    this.sun.shadow.bias = -0.0006;
    this.sun.shadow.normalBias = 0.02;
    // Painted look: shadows read as soft colour shifts, not dark holes.
    this.sun.shadow.intensity = 0.65;
    this.scene.add(this.hemi, this.sun, this.sun.target, this.zoneRoot);
    await Promise.all([this.player.load("qish"), this.bowat.load("bowat"), preloadTextures()]);
    this.scene.add(this.player.group, this.bowat.group);
    // Qish and Bowat follow the curve in tiny-planet zones (and stay flat elsewhere).
    bendTree(this.player.group);
    bendTree(this.bowat.group);
    this.resize();
  }

  get currentZone() {
    return this.zone?.id ?? null;
  }

  modelState() { return modelCacheState(); }

  /** Startup prepares shared sprites/textures; GLBs are decoded on zone entry. */
  whenReady() { return this.ready; }

  npc(id: string) {
    return this.npcs.get(id);
  }

  /** Put Qish in (or, with null, out of) something she rides. Place her first: boarding keeps her spot. */
  setRide(ride: Ride | null) {
    this.ride = ride;
    if (ride) {
      ride.vx = ride.vz = 0;
    } else {
      this.player.group.position.y = 0;
      this.player.pose = null;
    }
    this.trail = [];
  }

  get riding() {
    return this.ride !== null;
  }

  /** Hold Bowat in a pose sprite (`"lie_tired"`) where he is, or with null let him follow again. */
  setBowatPose(pose: string | null) {
    this.bowatPose = pose;
  }

  /** Pose Qish on top of her walk bob (exercise machines); null puts her back to normal. */
  setPose(pose: { y: number; rot: number; squash: number } | null) {
    this.player.pose = pose;
  }

  /** Tear down the current zone and build `def`, placing the player at `spawn`. */
  loadZone(def: ZoneDef, spawn: string) {
    // Serialize builds so overlapping travel requests can't evict models while
    // another zone is still cloning them. A failed build must not poison retry.
    const task = this.zoneTask.catch(() => {}).then(() => this.buildZone(def, spawn));
    this.zoneTask = task;
    return task;
  }

  private async buildZone(def: ZoneDef, spawn: string) {
    await this.ready;
    this.disposeZone();
    await releaseZonePaperTextures();
    await prepareZoneModels(def.id, save.hasCard(8));
    this.zone = def;
    const mood = def.mood?.() ?? {};
    this.scene.background = def.planet?.sky ? skyGradient(def.planet.sky) : new THREE.Color(mood.sky ?? def.sky);
    this.scene.fog = new THREE.Fog(mood.fog ?? def.fog, 38, 75);
    const l = mood.light ?? def.light;
    this.sun.intensity = l?.sun ?? 2.1;
    this.sun.color.set(l?.sunColor ?? 0xffe2b8);
    this.hemi.intensity = l?.hemi ?? 1.45;
    this.hemi.color.set(l?.hemiSky ?? 0xfff4e0);
    this.hemi.groundColor.set(l?.hemiGround ?? 0x8d83b7);
    await def.build(this.builder());
    toonify(this.zoneRoot);
    this.collectFaders();
    planet.radius = def.planet?.radius ?? 0;
    if (def.planet) bendTree(this.zoneRoot);
    this.resize();
    const [x, z, f] = def.spawns[spawn] ?? def.spawns.start;
    this.placePlayer(x, z, f);
  }

  private builder(): ZoneBuilder {
    return {
      root: this.zoneRoot,
      collider: (b, pad = 0) => this.colliders.push([b[0] - pad, b[1] - pad, b[2] + pad, b[3] + pad]),
      interact: (id, x, z, label, top = 2.2, range = 1.8, when) => {
        if ((id === "myvi" || id === "replay" || (id === "console" && save.flag("endingSeen")) || (id === "babah" && save.flag("endingSeen"))) && !this.interactables.some(it => it.id === id)) {
          const marker = discoveryMarker(x, top + .12, z, id === "myvi" ? "map" : "replay", when);
          this.zoneRoot.add(marker.sprite); this.animated.push(marker.update);
        }
        this.interactables.push({ id, pos: new THREE.Vector3(x, 0, z), label, top, range, when });
      },
      region: (fn) => this.regions.push(fn),
      floor: (fn) => this.floors.push(fn),
      exit: (id, box, back) => this.exits.push({ id, box, back: new THREE.Vector3(back[0], 0, back[1]) }),
      animate: (fn) => this.animated.push(fn),
      npc: async (name, x, z, height, id = name) => {
        const s = await new PaperSprite(height).load(name);
        s.group.position.set(x, 0, z);
        this.zoneRoot.add(s.group);
        this.npcs.set(id, s);
        return s;
      },
      standee: async (url, x, z, height) => {
        const { group } = await paperStandee(url, height);
        group.position.set(x, 0, z);
        this.zoneRoot.add(group);
        return group;
      },
      pickup: (id, x, z, item, when) => {
        item.group.position.set(x, 0, z);
        this.zoneRoot.add(item.group);
        this.animated.push((t) => item.update(t));
        this.pickups.push({ id, pos: new THREE.Vector3(x, 0, z), item, when });
      },
      player: () => this.player.group.position,
      blockers: (get, r) => this.blockerSets.push({ get, r }),
    };
  }

  private disposeZone() {
    const bg = this.scene.background as THREE.Texture | null;
    if (bg?.isTexture) bg.dispose();
    const geometries = new Set<THREE.BufferGeometry>();
    const materials = new Set<THREE.Material>();
    const textures = new Set<THREE.Texture>();
    this.zoneRoot.traverse((o) => {
      const m = o as THREE.Mesh;
      if (m.geometry && !m.geometry.userData.shared) geometries.add(m.geometry);
      if ((o as THREE.InstancedMesh).isInstancedMesh) (o as THREE.InstancedMesh).dispose();
      const mats = m.material ? (Array.isArray(m.material) ? [...m.material] : [m.material]) : [];
      if (m.customDepthMaterial) mats.push(m.customDepthMaterial);
      if (m.customDistanceMaterial) mats.push(m.customDistanceMaterial);
      for (const mat of mats) {
        if (mat.userData.shared) continue;
        materials.add(mat);
        // Alpha/emissive maps also own GPU memory, not just the colour map.
        for (const value of Object.values(mat)) {
          if (value?.isTexture && !value.userData.shared) textures.add(value);
        }
      }
    });
    for (const geometry of geometries) geometry.dispose();
    for (const texture of textures) texture.dispose();
    for (const material of materials) material.dispose();
    this.zoneRoot.clear();
    this.renderer.renderLists.dispose();
    this.npcs.clear();
    this.colliders = [];
    this.blockerSets = [];
    this.regions = [];
    this.floors = [];
    this.setRide(null);
    this.interactables = [];
    this.exits = [];
    this.pickups = [];
    this.animated = [];
    this.faders = [];
  }

  /** Give each fading prop its own materials (copies share them) and remember where it stands. */
  private collectFaders() {
    this.zoneRoot.updateMatrixWorld(true);
    const found: THREE.Object3D[] = [];
    this.zoneRoot.traverse((o) => {
      if (o.userData.fade && !found.some((f) => f !== o && isInside(o, f))) found.push(o);
    });
    for (const o of found) {
      const mats: THREE.Material[] = [];
      o.traverse((c) => {
        const m = c as THREE.Mesh;
        if (!m.isMesh) return;
        m.material = Array.isArray(m.material) ? m.material.map((x) => x.clone()) : m.material.clone();
        mats.push(...(Array.isArray(m.material) ? m.material : [m.material]));
      });
      const box = new THREE.Box3().setFromObject(o);
      // Tree crowns are rounder than their boxes; shrink a little so near misses do not fade.
      box.expandByVector(box.getSize(new THREE.Vector3()).multiplyScalar(-0.08));
      this.faders.push({ box, mats, k: 1 });
    }
  }

  private updateFade(dt: number) {
    if (!this.faders.length) return;
    const p = this.player.group.position;
    const head = new THREE.Vector3(p.x, p.y + 1.1, p.z);
    const dist = this.camera.position.distanceTo(head);
    this.fadeRay.set(this.camera.position, head.sub(this.camera.position).normalize());
    for (const f of this.faders) {
      const hit = this.fadeRay.intersectBox(f.box, this.fadeHit);
      const want = hit && this.camera.position.distanceTo(hit) < dist - 0.6 ? 0.3 : 1;
      if (Math.abs(f.k - want) < 0.005) continue;
      f.k += (want - f.k) * Math.min(1, dt * 8);
      if (Math.abs(f.k - want) < 0.01) f.k = want;
      const see = f.k < 0.995;
      for (const m of f.mats) {
        if (m.transparent !== see) {
          m.transparent = see;
          m.depthWrite = !see;
          m.needsUpdate = true;
        }
        m.opacity = f.k;
      }
    }
  }

  async mount() {
    await this.ready;
    stage().appendChild(this.renderer.domElement);
    ui().appendChild(this.bubble);
    this.bubble.hidden = true;
    this.busy = false;
    this.sceneLock = false;
    this.resize();
    this.sampleAt = performance.now();
    this.sampleFrames = 0;
    this.stopLoop = onFrame((dt, t) => this.update(dt, t));
  }

  /** Freeze player control until the next mount (scene change in progress). */
  lock() {
    this.sceneLock = true;
    this.bubble.hidden = true;
  }

  /** Give control back after lock() without a scene change (e.g. a cutscene over the zone). */
  unlock() {
    this.sceneLock = false;
  }

  unmount() {
    this.stopLoop?.();
    this.stopLoop = null;
    this.renderer.domElement.remove();
    this.bubble.remove();
    this.webglWarning.hidden = true;
    if (TOUCH_DEVICE) {
      // Release full-screen post targets while a boss or the next city loads.
      // mount() resizes them before the next world frame.
      this.renderer.setSize(1, 1, false);
      this.post.resize(1, 1);
    }
  }

  /** Turn Qish without moving her (posing for a picture). */
  facePlayer(facing: Facing) {
    this.player.face(facing);
  }

  /** Height of the walking surface at (x, z): the ground, or a raised floor. */
  private groundY(x: number, z: number) {
    let y = 0;
    for (const f of this.floors) y = Math.max(y, f(x, z));
    return y;
  }

  placePlayer(x: number, z: number, facing: Facing = "front") {
    this.player.group.position.set(x, this.groundY(x, z), z);
    this.player.face(facing);
    this.trail = [];
    this.camTarget.copy(this.player.group.position);
    // Bowat is away again after the island (he's at the party) until the ending.
    const joined = save.flag("bowatJoined") && !save.flag("bowatAway") && (this.zone?.companion?.() ?? true);
    this.bowat.group.visible = joined;
    if (joined) {
      const b = this.bowat.group.position.copy(this.player.group.position).add(new THREE.Vector3(facing === "left" ? 1.3 : -1.3, 0, -0.5));
      b.y = this.groundY(b.x, b.z);
    }
  }

  private resize() {
    const { width: w, height: h, scale } = gameViewport;
    this.camera.aspect = w / h;
    // Keep similar horizontal coverage on tall phone screens.
    const fov = this.zone?.planet?.fov ?? [34, 48];
    this.camera.fov = w / h < 1 ? fov[1] : fov[0];
    this.camera.updateProjectionMatrix();
    const screenDpr = Math.min(GRAPHICS_PROFILES[this.graphicsTierNow].maxDpr, window.devicePixelRatio);
    this.renderer.setPixelRatio(screenDpr * scale);
    this.renderer.setSize(w, h);
    this.post.resize(w, h);
  }

  private applyGraphicsTier(tier: GraphicsTier) {
    const profile = GRAPHICS_PROFILES[tier];
    diagnostic("graphics setting", { mode: graphicsMode(), tier, ...profile });
    if (tier === this.graphicsTierNow) return;
    this.graphicsTierNow = tier;
    if (this.sun.shadow.mapSize.x !== profile.shadowSize || this.sun.shadow.mapSize.y !== profile.shadowSize) {
      this.sun.shadow.map?.dispose();
      this.sun.shadow.map = null;
      this.sun.shadow.mapSize.set(profile.shadowSize, profile.shadowSize);
      this.sun.shadow.needsUpdate = true;
    }
    this.post.setTiltShift(profile.tiltShift);
    this.resize();
    diagnostic("graphics quality applied", { mode: graphicsMode(), tier, ...profile });
  }

  private blocked(x: number, z: number) {
    const b = this.zone!.bounds;
    if (x < b[0] || x > b[2] || z < b[1] || z > b[3]) return true;
    for (const [x0, z0, x1, z1] of this.colliders) {
      const cx = Math.max(x0, Math.min(x, x1));
      const cz = Math.max(z0, Math.min(z, z1));
      if ((x - cx) ** 2 + (z - cz) ** 2 < PLAYER_R * PLAYER_R) return true;
    }
    if (this.regions.some((r) => r(x, z))) return true;
    // Moving people only stop her moving closer, so a crowd can never trap her.
    const p = this.player.group.position;
    for (const { get, r } of this.blockerSets) {
      const rr = (r + PLAYER_R) ** 2;
      for (const o of get()) {
        const d = (x - o.x) ** 2 + (z - o.z) ** 2;
        if (d < rr && d < (p.x - o.x) ** 2 + (p.z - o.z) ** 2) return true;
      }
    }
    return false;
  }

  private update(dt: number, t: number) {
    if (!this.zone) return;
    const p = this.player.group.position;
    const locked = this.busy || this.sceneLock || dialogOpen();
    let moving = false;

    if (this.ride) moving = this.steer(dt, t, locked);
    else if (!locked) {
      const ax = input.axis();
      if (Math.hypot(ax.x, ax.y) > 0.15) {
        moving = true;
        const nx = p.x + ax.x * SPEED * dt;
        const nz = p.z + ax.y * SPEED * dt;
        if (!this.blocked(nx, p.z)) p.x = nx;
        if (!this.blocked(p.x, nz)) p.z = nz;
        if (this.floors.length) p.y = this.groundY(p.x, p.z);
        this.player.face(Math.abs(ax.x) > Math.abs(ax.y) ? (ax.x > 0 ? "right" : "left") : ax.y > 0 ? "front" : "back");
        this.trail.push(p.clone());
        if (this.trail.length > 80) this.trail.shift();
      }
    }
    this.player.update(dt, moving && !this.ride);
    this.updateBowat(dt);
    for (const n of this.npcs.values()) n.update(dt, false);
    for (const fn of this.animated) fn(t);

    let near: Interactable | null = null;
    let best = Infinity;
    for (const it of this.interactables) {
      if (it.when && !it.when()) continue;
      const d = Math.hypot(it.pos.x - p.x, it.pos.z - p.z);
      if (d < it.range && d < best) {
        best = d;
        near = it;
      }
    }
    if (near && !locked) {
      this.showBubble(near);
      if (input.pressed("a")) void this.runInteract(near);
    } else {
      this.bubble.hidden = true;
    }

    if (!locked) {
      const got = this.pickups.find((it) => Math.hypot(it.pos.x - p.x, it.pos.z - p.z) < PICKUP_R && (!it.when || it.when()));
      if (got) void this.runPickup(got);
    }

    if (!locked && !this.ride) {
      for (const ex of this.exits) {
        const [x0, z0, x1, z1] = ex.box;
        if (p.x > x0 && p.x < x1 && p.z > z0 && p.z < z1) {
          void this.runExit(ex);
          break;
        }
      }
    }

    this.updateCamera(dt);
    this.updateFade(dt);
    this.post.composer.render(dt);
    if (!document.hidden) {
      this.sampleFrames++;
      const elapsed = performance.now() - this.sampleAt;
      if (elapsed >= 5000) {
        const fps = Math.round(this.sampleFrames * 1000 / elapsed);
        const closedMaps = new Set<THREE.Texture>();
        this.zoneRoot.traverse(o => {
          const m = o as THREE.Mesh;
          if (!m.material) return;
          for (const mat of Array.isArray(m.material) ? m.material : [m.material]) {
            for (const key of ["map", "emissiveMap", "alphaMap"] as const) {
              const texture = (mat as THREE.MeshStandardMaterial)[key];
              if (texture?.image && "width" in texture.image && texture.image.width === 0) closedMaps.add(texture);
            }
          }
        });
        diagnostic("world performance", {
          zone: this.zone.id,
          fps,
          gpuTextures: this.renderer.info.memory.textures,
          gpuGeometries: this.renderer.info.memory.geometries,
          closedMaps: closedMaps.size,
          canvas: [this.renderer.domElement.width, this.renderer.domElement.height],
          mode: graphicsMode(),
          tier: this.graphicsTierNow,
        });
        if (graphicsMode() === "auto") {
          this.slowSamples = fps < 43 ? this.slowSamples + 1 : 0;
          this.fastSamples = fps > 56 ? this.fastSamples + 1 : 0;
          if (this.slowSamples >= 2 && this.graphicsTierNow < 2) {
            this.slowSamples = this.fastSamples = 0;
            setAutomaticTier((this.graphicsTierNow + 1) as GraphicsTier);
          } else if (this.fastSamples >= 6 && this.graphicsTierNow > 0) {
            this.slowSamples = this.fastSamples = 0;
            setAutomaticTier((this.graphicsTierNow - 1) as GraphicsTier);
          }
        }
        this.sampleAt = performance.now();
        this.sampleFrames = 0;
      }
    } else {
      this.sampleAt = performance.now();
      this.sampleFrames = 0;
    }
  }

  /** Paddling: the boat eases up to speed and drifts to a stop, bumps off the shore, and turns to
   * follow where it is going. Returns whether she is paddling. */
  private steer(dt: number, t: number, locked: boolean) {
    const r = this.ride!;
    const p = this.player.group.position;
    const ax = input.axis();
    const push = !locked && Math.hypot(ax.x, ax.y) > 0.15;
    const k = Math.min(1, dt * (push ? 1.7 : 0.75));
    r.vx += ((push ? ax.x * r.speed : 0) - r.vx) * k;
    r.vz += ((push ? ax.y * r.speed : 0) - r.vz) * k;
    const nx = p.x + r.vx * dt;
    const nz = p.z + r.vz * dt;
    if (r.canGo(nx, p.z)) p.x = nx;
    else r.vx *= -0.3;
    if (r.canGo(p.x, nz)) p.z = nz;
    else r.vz *= -0.3;
    const speed = Math.hypot(r.vx, r.vz);
    if (speed > 0.3) {
      let d = Math.atan2(r.vx, r.vz) - r.heading;
      d = Math.atan2(Math.sin(d), Math.cos(d));
      r.heading += d * Math.min(1, dt * 3);
    }
    if (push) this.player.face(Math.abs(ax.x) > Math.abs(ax.y) ? (ax.x > 0 ? "right" : "left") : ax.y > 0 ? "front" : "back");
    p.y = r.seat + Math.sin(t * 1.8) * 0.04;
    // Leaning into each stroke while she paddles.
    this.player.pose = { y: 0, rot: push ? Math.sin(t * 5.5) * 0.08 : Math.sin(t * 1.8) * 0.02, squash: 1 };
    return push;
  }

  private updateBowat(dt: number) {
    if (!this.bowat.group.visible) return;
    const b = this.bowat.group.position;
    // Straight to sleep on the back of the boat; otherwise whatever a scene asked for.
    const pose = this.ride ? "lie_sleep" : this.bowatPose;
    this.bowat.hold(pose);
    if (pose && !this.ride) {
      this.bowat.update(dt, false);
      return;
    }
    if (this.ride) {
      // Along for the ride at the back of the boat, doing none of the paddling.
      const p = this.player.group.position;
      const h = this.ride.heading;
      b.set(p.x - Math.sin(h) * 0.95 + 0.45, p.y + 0.08, p.z - Math.cos(h) * 0.95);
      this.bowat.face("front");
      this.bowat.update(dt, false);
      return;
    }
    const target = this.trail.length > 22 ? this.trail[this.trail.length - 22] : null;
    let moving = false;
    if (target) {
      const dx = target.x - b.x;
      const dz = target.z - b.z;
      const d = Math.hypot(dx, dz);
      if (d > 0.15) {
        const step = Math.min(d, SPEED * 1.05 * dt);
        b.x += (dx / d) * step;
        b.z += (dz / d) * step;
        if (this.floors.length) b.y = this.groundY(b.x, b.z);
        moving = true;
        this.bowat.face(Math.abs(dx) > Math.abs(dz) ? (dx > 0 ? "right" : "left") : dz > 0 ? "front" : "back");
      }
    }
    this.bowat.update(dt, moving);
  }

  private updateCamera(dt: number) {
    const p = this.player.group.position;
    const c = this.zone!.cam;
    const tx = THREE.MathUtils.clamp(p.x, c[0], c[2]);
    const tz = THREE.MathUtils.clamp(p.z, c[1], c[3]);
    this.camTarget.x += (tx - this.camTarget.x) * Math.min(1, dt * 4);
    this.camTarget.z += (tz - this.camTarget.z) * Math.min(1, dt * 4);
    const po = this.zone!.planet?.camOffset;
    if (po) this.camOffset.set(...po);
    else this.camOffset.copy(CAM_OFFSET).multiplyScalar(this.zone!.camScale ?? 1);
    this.camera.position.copy(this.camTarget).add(this.camOffset);
    this.camera.lookAt(this.camTarget.x, 1, this.camTarget.z);
    planet.centre(this.camTarget.x, this.camTarget.z);
    const shadowRadius = TOUCH_DEVICE && this.zone!.id === "sunway" ? 18 : 26;
    const shadowCamera = this.sun.shadow.camera;
    if (shadowCamera.right !== shadowRadius) {
      shadowCamera.left = shadowCamera.bottom = -shadowRadius;
      shadowCamera.right = shadowCamera.top = shadowRadius;
      shadowCamera.updateProjectionMatrix();
    }
    this.sun.position.set(this.camTarget.x - 12, 22, this.camTarget.z + 9);
    this.sun.target.position.copy(this.camTarget);
  }

  private showBubble(it: Interactable) {
    const v = it.pos.clone();
    v.y = it.top;
    planet.bend(v).project(this.camera);
    this.bubble.style.left = `${((v.x + 1) / 2) * gameViewport.width}px`;
    this.bubble.style.top = `${((1 - v.y) / 2) * gameViewport.height}px`;
    const content = `<kbd data-control="a">${input.label("a")}</kbd>${it.label}`;
    // Preserve the live keycap across frames; rebuilding it also reset controller labels.
    if (this.bubble.innerHTML !== content) this.bubble.innerHTML = content;
    this.bubble.hidden = false;
  }

  private async runInteract(it: Interactable) {
    this.busy = true;
    this.bubble.hidden = true;
    const npc = this.npcs.get(it.id);
    if (npc) {
      const dx = this.player.group.position.x - npc.group.position.x;
      npc.face(Math.abs(dx) < 0.6 ? "front" : dx > 0 ? "right" : "left");
    }
    try {
      await this.hooks.interact(this.zone!.id, it.id);
    } finally {
      npc?.face("front");
      this.busy = false;
    }
  }

  private async runPickup(it: PlacedPickup) {
    this.pickups = this.pickups.filter((p) => p !== it);
    it.item.pop();
    this.busy = true;
    try {
      await this.hooks.pickup(this.zone!.id, it.id);
    } finally {
      this.busy = false;
    }
  }

  private async runExit(ex: Exit) {
    this.busy = true;
    this.bubble.hidden = true;
    try {
      // A leaving exit calls lock() via the hook, which keeps control frozen through the fade.
      const leaving = await this.hooks.exit(this.zone!.id, ex.id);
      if (!leaving) {
        const p = this.player.group.position.copy(ex.back);
        // If the way back is blocked (a prop moved onto it), spiral out to the nearest free spot.
        for (let r = 0.3; this.blocked(p.x, p.z) && r < 4; r += 0.3)
          for (let a = 0; a < 12 && this.blocked(p.x, p.z); a++) p.set(ex.back.x + Math.cos(a * 0.524) * r, 0, ex.back.z + Math.sin(a * 0.524) * r);
        this.trail = [];
      }
    } finally {
      this.busy = false;
    }
  }
}

function isInside(o: THREE.Object3D, a: THREE.Object3D) {
  for (let p = o.parent; p; p = p.parent) if (p === a) return true;
  return false;
}

/** A vertical sky gradient (top colour first) for zones where the horizon shows. */
function skyGradient(stops: string[]) {
  const c = document.createElement("canvas");
  c.width = 2;
  c.height = 256;
  const g = c.getContext("2d")!;
  const grad = g.createLinearGradient(0, 0, 0, 256);
  stops.forEach((s, i) => grad.addColorStop(i / (stops.length - 1), s));
  g.fillStyle = grad;
  g.fillRect(0, 0, 2, 256);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}
