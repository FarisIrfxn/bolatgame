import * as THREE from "three";
import type { Facing } from "../overworld/paper";
import { canvasTexture, flat, myvi, roundedBox, signTexture } from "../overworld/props";
import { paintedMat, type PaintedName } from "../overworld/textures";
import type { Box, ZoneBuilder } from "../overworld/zone";

// Shared layout for the island zones: a footpath runs west -> east along z 3..6.2,
// with exit gates at both ends and Qish's Myvi parked at the west side.

export const PATH_Z: [number, number] = [3, 6.2];
export const WEST_EXIT: Box = [-23, 2.8, -20.2, 6.4];
export const EAST_EXIT: Box = [20.2, 2.8, 23, 6.4];
export const BOUNDS: Box = [-23, -11, 23, 14];
export const CAM: Box = [-14, -5, 15, 8];

export const STANDARD_SPAWNS: Record<string, [number, number, Facing]> = {
  start: [-18.4, 4.6, "right"],
  west: [-18.4, 4.6, "right"],
  east: [18.4, 4.6, "left"],
  myvi: [-11.6, 8.8, "right"],
  boss: [3, 2.6, "front"],
};

/** Speckled ground plane. `area` = [centre x, centre z, width, depth] for zones laid out off the default square. */
export function ground(b: ZoneBuilder, base: string, speck: [string, string], repeat = 18, area: [number, number, number, number] = [0, 0, 90, 70]) {
  const tex = canvasTexture(256, 256, (g) => {
    g.fillStyle = base;
    g.fillRect(0, 0, 256, 256);
    for (let i = 0; i < 900; i++) {
      g.fillStyle = Math.random() > 0.5 ? speck[0] : speck[1];
      g.fillRect(Math.random() * 256, Math.random() * 256, 3, 6);
    }
  });
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  const [cx, cz, w, d] = area;
  tex.repeat.set((repeat * w) / 90, (repeat * d) / 90);
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, d), new THREE.MeshLambertMaterial({ map: tex }));
  m.rotation.x = -Math.PI / 2;
  m.position.set(cx, 0, cz);
  m.receiveShadow = true;
  b.root.add(m);
}

/** Ground plane with a hand-painted texture (art/textures) repeating every `metres`. */
export function paintedGround(b: ZoneBuilder, name: PaintedName, area: [number, number, number, number], metres = 6, tint = 0xffffff) {
  const [cx, cz, w, d] = area;
  const mat = paintedMat(name, w, d, metres);
  mat.color.setHex(tint);
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, d), mat);
  m.rotation.x = -Math.PI / 2;
  m.position.set(cx, 0, cz);
  m.receiveShadow = true;
  b.root.add(m);
  return m;
}

export function slab(b: ZoneBuilder, x0: number, z0: number, x1: number, z1: number, mat: THREE.Material, y = 0.03) {
  const m = new THREE.Mesh(roundedBox(x1 - x0, y * 2, z1 - z0), mat);
  m.position.set((x0 + x1) / 2, y, (z0 + z1) / 2);
  m.receiveShadow = true;
  b.root.add(m);
  return m;
}

export function tiles(b: ZoneBuilder, x0: number, z0: number, x1: number, z1: number, fill = "#e2cfa6", line = "#c9b48a") {
  const t = canvasTexture(128, 128, (g) => {
    g.fillStyle = fill;
    g.fillRect(0, 0, 128, 128);
    g.strokeStyle = line;
    g.lineWidth = 3;
    for (let i = 0; i <= 128; i += 32) {
      g.beginPath();
      g.moveTo(i, 0);
      g.lineTo(i, 128);
      g.moveTo(0, i);
      g.lineTo(128, i);
      g.stroke();
    }
  });
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set((x1 - x0) / 2, (z1 - z0) / 2);
  return slab(b, x0, z0, x1, z1, new THREE.MeshLambertMaterial({ map: t }));
}

/** Footpath, gates to the neighbouring zones and the Myvi parking spot. */
export function standardLayout(
  b: ZoneBuilder,
  opts: { prev?: string; next?: string; pathFill?: string; pathLine?: string; myvi?: boolean; ground?: boolean },
) {
  if (opts.ground !== false) tiles(b, -26, PATH_Z[0], 26, PATH_Z[1], opts.pathFill, opts.pathLine);
  if (opts.prev) {
    b.exit("west", WEST_EXIT, [-18.6, 4.6]);
  } else {
    b.collider([-23, 2.6, -21, 6.6]);
  }
  if (opts.next) {
    b.exit("east", EAST_EXIT, [18.6, 4.6]);
  } else {
    b.collider([21, 2.6, 23, 6.6]);
  }
  if (opts.myvi !== false) {
    if (opts.ground !== false) slab(b, -19, 7.2, -11, 12, flat(0x55555e), 0.025);
    b.root.add(myvi(-15, 9.6, Math.PI / 2));
    b.collider([-16.9, 8.6, -13.1, 10.6]);
    b.interact("myvi", -15, 9.6, "Myvi", 2.2, 2.8);
  }
}

/** A sign on posts facing the camera. */
export function bigSign(b: ZoneBuilder, x: number, y: number, z: number, text: string, bg: string, fg: string, w = 5, h = 1.2) {
  const m = new THREE.Mesh(
    roundedBox(w, h, 0.2),
    [flat(0x6b4f2a), flat(0x6b4f2a), flat(0x6b4f2a), flat(0x6b4f2a), new THREE.MeshLambertMaterial({ map: signTexture(text, bg, fg, 640, Math.round(640 * (h / w))) }), flat(0x6b4f2a)],
  );
  m.position.set(x, y, z);
  m.castShadow = true;
  b.root.add(m);
  return m;
}

export function shadowed<T extends THREE.Object3D>(o: T): T {
  o.traverse((c) => {
    if ((c as THREE.Mesh).isMesh) {
      c.castShadow = true;
      c.receiveShadow = true;
    }
  });
  return o;
}
