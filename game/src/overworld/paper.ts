import * as THREE from "three";

// Doodle characters as paper cut-outs: a white sticker border around the
// drawing, standing on a plane that flips like Paper Mario when turning.

export type Facing = "front" | "back" | "left" | "right";
type ArtDirection = "front" | "back" | "side";

// Characters can gain drawn walk frames without changing the movement system.
const WALK_FRAMES: Record<string, number> = { qish: 4, bowat: 4 };
/** One idle step: show `face` ("" = normal) for `hold` s; `dip` sinks the paper (dozing), < 0 jolts it up. */
type IdleStep = { face: string; hold: number; dip?: number };
// Characters with idle faces for the front and side views (`<name>_<dir>_<face>.png`): a blink
// every few seconds and, with `chance` instead of a blink, one of their routines.
const IDLE: Record<string, { chance: number; routines: IdleStep[][]; faces?: string[] }> = {
  qish: { chance: 0.2, routines: [[{ face: "laugh", hold: 1.1 }]] },
  faris: { chance: 0.2, routines: [[{ face: "smile", hold: 1.3 }]] },
  babah: { chance: 0.2, routines: [[{ face: "smile", hold: 1.4 }]] },
  slothfaris: {
    chance: 0.45,
    routines: [
      // Tersengguk: eyelids droop, the head drops with a snot bubble, then he jolts awake.
      [
        { face: "drowsy", hold: 1.4 },
        { face: "drowsy", hold: 0.6, dip: 0.3 },
        { face: "nod", hold: 1.8, dip: 1 },
        { face: "", hold: 0.35, dip: -0.7 },
      ],
      [
        { face: "drowsy", hold: 0.8 },
        { face: "yawn", hold: 2 },
      ],
    ],
  },
  // Bowat: a big yawn, or a quiet fart with his eyes squeezed shut ("saya kentut senyap je").
  bowat: { chance: 0.3, faces: ["sniff"], routines: [[{ face: "yawn", hold: 1.8 }], [{ face: "fart", hold: 1.5 }]] },
};

const cache = new Map<string, Promise<{ tex: THREE.Texture; aspect: number; px: number }>>();

/** Load an image and bake a white paper border around its silhouette. */
export function paperTexture(url: string, border = 9) {
  if (!cache.has(url)) {
    cache.set(
      url,
      new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
          const rim = 4;
          const pad = border + rim + 2;
          const c = document.createElement("canvas");
          c.width = img.width + pad * 2;
          c.height = img.height + pad * 2;
          const g = c.getContext("2d")!;
          // Grow the silhouette by stamping it in a ring, then tint the stamp.
          const grown = (r: number, color: string) => {
            const l = document.createElement("canvas");
            l.width = c.width;
            l.height = c.height;
            const lg = l.getContext("2d")!;
            for (let a = 0; a < Math.PI * 2; a += Math.PI / 16) {
              lg.drawImage(img, pad + Math.cos(a) * r, pad + Math.sin(a) * r);
            }
            lg.globalCompositeOperation = "source-in";
            lg.fillStyle = color;
            lg.fillRect(0, 0, l.width, l.height);
            return l;
          };
          // Dark die-cut edge, white paper border, then the drawing: reads on any ground colour.
          g.drawImage(grown(border + rim, "rgba(34,30,44,.85)"), 0, 0);
          g.drawImage(grown(border, "#fffdf6"), 0, 0);
          g.drawImage(img, pad, pad);
          const tex = new THREE.CanvasTexture(c);
          tex.colorSpace = THREE.SRGBColorSpace;
          tex.anisotropy = 4;
          // Cached across zones; zone teardown must not dispose it.
          tex.userData.shared = true;
          resolve({ tex, aspect: c.width / c.height, px: img.height });
        };
        img.onerror = reject;
        img.src = url;
      }),
    );
  }
  return cache.get(url)!;
}

/** A single-image paper standee (e.g. a boss card) that stands upright and casts a shadow. */
export async function paperStandee(url: string, height: number) {
  const { tex, aspect } = await paperTexture(url, 12);
  const group = new THREE.Group();
  const pivot = new THREE.Group();
  pivot.rotation.x = -0.42;
  group.add(pivot);
  const geo = new THREE.PlaneGeometry(1, 1);
  geo.translate(0, 0.5, 0);
  const mesh = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ map: tex, alphaTest: 0.5, side: THREE.DoubleSide, color: 0xfff8ee }));
  mesh.scale.set(height * aspect, height, 1);
  mesh.castShadow = true;
  mesh.customDepthMaterial = new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking, map: tex, alphaTest: 0.5 });
  pivot.add(mesh);
  return { group, pivot };
}

type Tex = { tex: THREE.Texture; aspect: number };

export class PaperSprite {
  readonly group = new THREE.Group();
  private name = "";
  private shown: Tex | null = null;
  private held: (Tex & { scale: number }) | null = null;
  private heldName = "";
  private pivot = new THREE.Group();
  private mesh!: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial>;
  private depth!: THREE.MeshDepthMaterial;
  private tex: Record<ArtDirection, { tex: THREE.Texture; aspect: number }> = {} as never;
  private walkTex: Record<ArtDirection, { tex: THREE.Texture; aspect: number }[]> | null = null;
  private walkFrame = -1;
  private idle: (typeof IDLE)[string] | null = null;
  private faceTex: Record<"front" | "side", Record<string, { tex: THREE.Texture; aspect: number }>> | null = null;
  private expr = "";
  private faceTimer = 2.5;
  private blinksLeft = 0;
  private routine: IdleStep[] | null = null;
  private step = 0;
  private dip = 0;
  private dipTarget = 0;
  private facing: Facing = "front";
  private mirror = 1;
  private flip = 1; // 1 = settled, animates 1 -> -1 -> 1 style through 0 when turning
  private flipping = false;
  private pendingFacing: Facing = "front";
  private walkT = 0;
  private height: number;
  /** Extra pose on top of the walk bob (exercising): lift, sway and squash. */
  pose: { y: number; rot: number; squash: number } | null = null;

  /** `lean` tilts the paper back so a high camera angle doesn't squash the drawing. */
  constructor(height: number, lean = -0.42) {
    this.height = height;
    this.group.add(this.pivot);
    this.pivot.rotation.x = lean;
  }

  async load(name: string) {
    this.name = name;
    const [front, back, side] = await Promise.all(
      (["front", "back", "side"] as const).map((d) => paperTexture(`/assets/chars/${name}_${d}.png`)),
    );
    this.tex = { front, back, side };
    const frameCount = WALK_FRAMES[name] ?? 0;
    if (frameCount) {
      const directions: ArtDirection[] = ["front", "back", "side"];
      const cycles = await Promise.all(directions.map((direction) =>
        Promise.all(Array.from({ length: frameCount }, (_, frame) =>
          paperTexture(`/assets/chars/${name}_${direction}_walk_${frame}.png`))),
      ));
      this.walkTex = { front: cycles[0], back: cycles[1], side: cycles[2] };
    }
    const idle = IDLE[name];
    if (idle) {
      this.idle = idle;
      const names = ["blink", ...new Set([...(idle.faces ?? []), ...idle.routines.flat().map((st) => st.face).filter(Boolean)])];
      const load = async (d: string) => {
        const texs = await Promise.all(names.map((f) => paperTexture(`/assets/chars/${name}_${d}_${f}.png`)));
        return Object.fromEntries(names.map((f, k) => [f, texs[k]]));
      };
      const [f, s] = await Promise.all([load("front"), load("side")]);
      this.faceTex = { front: f, side: s };
    }
    const geo = new THREE.PlaneGeometry(1, 1);
    geo.translate(0, 0.5, 0);
    const mat = new THREE.MeshBasicMaterial({ map: front.tex, alphaTest: 0.5, side: THREE.DoubleSide, color: 0xfff8ee });
    this.mesh = new THREE.Mesh(geo, mat);
    this.mesh.castShadow = true;
    this.depth = new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking, map: front.tex, alphaTest: 0.5 });
    this.mesh.customDepthMaterial = this.depth;
    this.pivot.add(this.mesh);

    const shadow = new THREE.Mesh(
      new THREE.CircleGeometry(0.42, 24),
      new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.22, depthWrite: false }),
    );
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.y = 0.02;
    shadow.scale.set(this.height * 0.55, this.height * 0.35, 1);
    this.group.add(shadow);
    this.applyTexture();
    return this;
  }

  /**
   * Hold a pose until `hold(null)`: an idle face of the current view (`"yawn"`), or a pose
   * sprite `<name>_<pose>.png` (loaded on first use). Pose sprites share the idle sprites'
   * pixel density (standing on a 512 px canvas), so by default they draw at image height / 512.
   */
  hold(pose: string | null, scale?: number) {
    if ((pose ?? "") === this.heldName && (!this.held || scale === undefined || this.held.scale === scale)) return;
    this.heldName = pose ?? "";
    const isFace = !pose || Object.values(this.faceTex ?? {}).some((faces) => pose in faces);
    if (isFace) {
      this.held = null;
      if (this.mesh) this.applyTexture();
      return;
    }
    // The previous pose stays up until this one has loaded.
    void paperTexture(`/assets/chars/${this.name}_${pose}.png`).then((t) => {
      if (this.heldName !== pose) return;
      this.held = { ...t, scale: scale ?? t.px / 512 };
      this.applyTexture();
    });
  }

  /** Load pose sprites ahead of time so the first `hold()` shows up at once. */
  prefetch(...poses: string[]) {
    return Promise.all(poses.map((pose) => paperTexture(`/assets/chars/${this.name}_${pose}.png`)));
  }

  private applyTexture() {
    const key = this.facing === "left" || this.facing === "right" ? "side" : this.facing;
    const heldFace = key !== "back" && this.heldName ? this.faceTex?.[key][this.heldName] : undefined;
    const face = key !== "back" && this.expr ? this.faceTex?.[key][this.expr] : undefined;
    const t =
      this.held ??
      heldFace ??
      (this.walkFrame >= 0 ? this.walkTex?.[key][this.walkFrame] ?? this.tex[key] : face ?? this.tex[key]);
    this.shown = t;
    this.mesh.material.map = t.tex;
    this.depth.map = t.tex;
    this.mesh.material.needsUpdate = true;
    this.depth.needsUpdate = true;
    this.mirror = this.facing === "left" ? -1 : 1;
    // Width (with the left-facing mirror) is set every frame in update().
    this.mesh.scale.y = this.height * (this.held?.scale ?? 1);
  }

  /** Idle face: open eyes most of the time, a blink every few seconds, now and then a routine. */
  private updateFace(dt: number, moving: boolean) {
    const idle = this.idle;
    if (!idle) return;
    let next = this.expr;
    if (moving) {
      next = "";
      this.routine = null;
      this.dipTarget = 0;
      this.faceTimer = 1.5 + Math.random();
    } else if ((this.faceTimer -= dt) <= 0) {
      if (this.routine && this.step < this.routine.length) {
        const st = this.routine[this.step++];
        next = st.face;
        this.dipTarget = st.dip ?? 0;
        this.faceTimer = st.hold + Math.random() * 0.5;
      } else if (this.routine) {
        this.routine = null;
        next = "";
        this.dipTarget = 0;
        this.faceTimer = 2 + Math.random() * 2.5;
      } else if (this.expr === "") {
        if (this.blinksLeft === 0 && Math.random() < idle.chance) {
          this.routine = idle.routines[Math.floor(Math.random() * idle.routines.length)];
          this.step = 0;
          this.faceTimer = 0;
        } else {
          next = "blink";
          this.faceTimer = 0.12;
          if (this.blinksLeft === 0) this.blinksLeft = Math.random() < 0.25 ? 1 : 0;
          else this.blinksLeft--;
        }
      } else {
        next = "";
        this.faceTimer = this.blinksLeft ? 0.14 : 2 + Math.random() * 2.5;
      }
    }
    // Drift down slowly while dozing off, snap back fast when jolting awake.
    this.dip += (this.dipTarget - this.dip) * Math.min(1, dt * (this.dipTarget < this.dip ? 14 : 3));
    if (next !== this.expr) {
      this.expr = next;
      this.applyTexture();
    }
  }

  face(f: Facing) {
    if (f === this.pendingFacing) return;
    this.pendingFacing = f;
    if (!this.flipping) {
      this.flipping = true;
      this.flip = 1;
    }
  }

  get currentFacing() {
    return this.pendingFacing;
  }

  update(dt: number, moving: boolean) {
    if (this.flipping) {
      this.flip -= dt * 11;
      if (this.flip <= 0 && this.facing !== this.pendingFacing) {
        this.facing = this.pendingFacing;
        this.applyTexture();
      }
      if (this.flip <= -1) {
        this.flip = 1;
        this.flipping = this.facing !== this.pendingFacing;
      }
    }
    if (moving) this.walkT += dt * 11;
    else this.walkT += (Math.round(this.walkT / Math.PI) * Math.PI - this.walkT) * Math.min(1, dt * 12);
    if (this.walkTex) {
      const frame = moving ? Math.floor((this.walkT % (Math.PI * 2)) / (Math.PI / 2)) : -1;
      if (frame !== this.walkFrame) {
        this.walkFrame = frame;
        this.applyTexture();
      }
    }
    this.updateFace(dt, moving);
    // After any texture swap, so the mirror and turn squeeze never drop for a frame.
    const squeeze = this.flipping ? Math.abs(this.flip) : 1;
    const t = this.shown;
    if (t) this.mesh.scale.x = this.mesh.scale.y * t.aspect * Math.max(0.04, squeeze) * this.mirror;
    this.pivot.position.y = Math.abs(Math.sin(this.walkT)) * (this.walkTex ? 0.045 : 0.14);
    this.pivot.rotation.z = Math.sin(this.walkT) * (this.walkTex ? 0.025 : 0.07);
    const p = this.pose;
    this.pivot.position.y += (p?.y ?? 0) - this.dip * 0.035 * this.height;
    this.pivot.rotation.z += p?.rot ?? 0;
    this.pivot.scale.y = (p?.squash ?? 1) * (1 - Math.max(0, this.dip) * 0.035);
  }
}
