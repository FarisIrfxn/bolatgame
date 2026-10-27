import type * as THREE from "three";
import type { Facing, PaperSprite } from "./paper";

export type Box = [number, number, number, number]; // x0, z0, x1, z1

export type ZoneId =
  | "bilik"
  | "labulanjut"
  | "sunway"
  | "photobooth"
  | "dusun"
  | "angkasa"
  | "cosyplace"
  | "galeri"
  | "bukit"
  | "sepang";

/** What a zone's build() can add to the world. Everything is torn down when the zone unloads. */
export interface ZoneBuilder {
  root: THREE.Group;
  collider(box: Box, pad?: number): void;
  /** `when` hides the prompt while it returns false (a jetty that reads "Naik" on foot and "Turun" afloat). */
  interact(id: string, x: number, z: number, label: string, top?: number, range?: number, when?: () => boolean): void;
  /** Extra no-go ground for walking (a lake shore that isn't boxes): true blocks. */
  region(blocked: (x: number, z: number) => boolean): void;
  /** Raised walkways (a footbridge, stairs up to a roof): how high Qish's feet are at (x, z). The
   * highest floor wins; 0 is the ground. Walking stays 2D, so keep raised ground fenced in with
   * colliders or regions wherever it would drop off. */
  floor(height: (x: number, z: number) => number): void;
  exit(id: string, box: Box, back: [number, number]): void;
  animate(fn: (t: number) => void): void;
  /** A doodle character NPC (uses /assets/chars/<name>_*.png). `id` matches its interact id so it turns to face the player. */
  npc(name: string, x: number, z: number, height: number, id?: string): Promise<PaperSprite>;
  /** A single-image paper standee. */
  standee(url: string, x: number, z: number, height: number): Promise<THREE.Group>;
  /** Something Qish picks up by walking into it. `item.pop()` plays when she does. `when` keeps it
   * from triggering while it returns false (fart clouds before she has the spray). */
  pickup(id: string, x: number, z: number, item: Pickup, when?: () => boolean): void;
  /** Live player position, for props that react to her (chickens running off). */
  player(): THREE.Vector3;
  /** People who move about (a crowd): circles of radius `r` read every frame. They block Qish like
   * colliders, except that she can always step away from one she is already touching. */
  blockers(get: () => readonly THREE.Vector3[], r: number): void;
}

/** Something Qish rides (the sampan). While riding, `canGo` replaces the walk bounds, colliders and
 * regions, she glides with a little drift, and the overworld keeps velocity and heading up to date
 * here so the zone can draw the boat and its wake. */
export interface Ride {
  canGo(x: number, z: number): boolean;
  speed: number;
  /** Height of her feet: below the gunwale, so she sits in the boat. */
  seat: number;
  vx: number;
  vz: number;
  /** Radians, 0 = towards the camera (+z). */
  heading: number;
}

export interface Pickup {
  group: THREE.Object3D;
  update(t: number): void;
  pop(): void;
}

export interface ZoneDef {
  id: ZoneId;
  name: string;
  sky: number;
  fog: number;
  /** Sky/fog/light picked when the zone loads, for zones whose time of day follows the story. */
  mood?: () => Partial<Pick<ZoneDef, "sky" | "fog" | "light">>;
  /** Optional lighting override (night zones). */
  light?: { sun: number; hemi: number; sunColor?: number; hemiSky?: number; hemiGround?: number };
  /** Player walk bounds. */
  bounds: Box;
  /** Camera target clamp. */
  cam: Box;
  /** Camera distance multiplier (indoor rooms sit closer). */
  camScale?: number;
  /** Tiny-planet zone (Nyomnyom City): the world is drawn wrapped onto a sphere of this radius under
   * the camera, seen from `camOffset` (default: the usual camera) with a vertical `fov`, over a sky
   * gradient (top to horizon colours) instead of the flat sky colour. */
  planet?: { radius: number; camOffset?: [number, number, number]; fov?: [number, number]; sky?: string[] };
  spawns: Record<string, [number, number, Facing]>;
  /** Whether Bowat tags along here (default yes, once he has joined): Nyomnyom City has him run off. */
  companion?: () => boolean;
  build(b: ZoneBuilder): Promise<void>;
}
