import * as THREE from "three";
import { sfx } from "../core/sfx";
import { canvasTexture, flat, roundedBox } from "../overworld/props";
import type { Box } from "../overworld/zone";
import { shadowed } from "./common";
import type { Anim } from "./labuProps";

// The padang beside Qish's house belongs to the kampung cats: a gang of all colours chasing each
// other, pouncing on yarn, swiping at butterflies, rolling about. The birthday party happens among them.

type Pattern = "solid" | "calico" | "tabby" | "tuxedo" | "siamese";
interface Look {
  body: number;
  pattern: Pattern;
  accent?: number;
  accent2?: number;
  scale?: number;
}

interface Rig {
  g: THREE.Group;
  hips: THREE.Group;
  head: THREE.Group;
  legs: THREE.Group[];
  tail: THREE.Group[];
}

const WHITE = 0xfffaf0;

const css = (c: number) => `#${c.toString(16).padStart(6, "0")}`;

/** The coat painted onto a sphere's UVs: image top = the cat's back, u = 0.5 faces +x (its head
 * end on the torso, its face on the skull). Patterns used to be extra meshes laid over the body,
 * which poked through each other; painted on, they stay put however the cat bends. */
export function paintedCoat(look: Look, part: "torso" | "head") {
  const W = 256;
  const H = 128;
  // Same pattern every visit for a given cat.
  let seed = look.body % 997 + (part === "head" ? 31 : 7);
  const rnd = () => ((seed = (seed * 9301 + 49297) % 233280) / 233280);
  const t = canvasTexture(W, H, (c) => {
    c.fillStyle = css(look.body);
    c.fillRect(0, 0, W, H);
    const acc = css(look.accent ?? look.body);
    const blob = (x: number, y: number, rx: number, ry: number, col: string, wrap = true) => {
      c.fillStyle = col;
      c.beginPath();
      for (let i = 0; i <= 24; i++) {
        const a = (i / 24) * Math.PI * 2;
        const k = 1 + Math.sin(a * 3 + x) * 0.12 + Math.sin(a * 5 + y) * 0.08;
        c.lineTo(x + Math.cos(a) * rx * k, y + Math.sin(a) * ry * k);
      }
      c.fill();
      // Wrap round the seam so a patch on the edge carries on the other side.
      if (!wrap) return;
      if (x - rx < 0) blob(x + W, y, rx, ry, col, false);
      if (x + rx > W) blob(x - W, y, rx, ry, col, false);
    };
    if (look.pattern === "calico") {
      for (let i = 0; i < (part === "torso" ? 5 : 2); i++)
        blob(rnd() * W, 10 + rnd() * 50, 22 + rnd() * 20, 14 + rnd() * 12, i % 2 ? css(look.accent2 ?? look.body) : acc);
    }
    if (look.pattern === "tabby") {
      c.strokeStyle = acc;
      c.lineCap = "round";
      if (part === "torso") {
        // A soft darker saddle along the spine instead of lines meeting at the top.
        const saddle = c.createLinearGradient(0, 0, 0, H * 0.32);
        saddle.addColorStop(0, acc);
        saddle.addColorStop(1, "rgba(0,0,0,0)");
        c.globalAlpha = 0.55;
        c.fillStyle = saddle;
        c.fillRect(0, 0, W, H * 0.32);
        c.globalAlpha = 1;
        // Stripes over the back, side to side: at fixed x along the body, i.e. u = acos(-x) / 2pi and 1 - u.
        for (const xs of [-0.7, -0.4, -0.1, 0.2, 0.5]) {
          const u = Math.acos(-xs) / (Math.PI * 2);
          c.lineWidth = 6;
          c.globalAlpha = 0.75;
          // Start clear of the sphere's top pole, where every stripe would pinch into one point.
          for (const uu of [u, 1 - u]) {
            c.beginPath();
            c.moveTo(uu * W, H * 0.2);
            c.quadraticCurveTo(uu * W + 4, H * 0.36, uu * W - 2, H * 0.56);
            c.stroke();
          }
          c.globalAlpha = 1;
        }
      } else {
        // The "M" on the forehead.
        c.lineWidth = 5;
        for (const dx of [-14, 0, 14]) {
          c.beginPath();
          c.moveTo(W / 2 + dx, 8);
          c.lineTo(W / 2 + dx * 0.6, 34);
          c.stroke();
        }
      }
    }
    if (look.pattern === "tuxedo") {
      c.fillStyle = css(WHITE);
      if (part === "torso") {
        c.fillRect(0, H * 0.62, W, H);
        blob(W / 2, H * 0.62, 46, 34, css(WHITE)); // bib at the chest end
      } else {
        blob(W / 2, H * 0.78, 34, 26, css(WHITE)); // white muzzle and chin
      }
    }
    if (look.pattern === "siamese" && part === "head") blob(W / 2, H * 0.6, 40, 34, acc); // dark mask
  });
  return new THREE.MeshLambertMaterial({ map: t });
}

/** Low-poly cat facing +x. `hips` pivots at the back legs so the body can sit up, rear or roll. */
function catRig(look: Look): Rig {
  const g = new THREE.Group();
  const hips = new THREE.Group();
  hips.position.set(-0.22, 0.3, 0);
  g.add(hips);
  const body = new THREE.Group();
  body.position.set(0.22, -0.3, 0);
  hips.add(body);
  const main = flat(look.body);
  const acc = flat(look.accent ?? look.body);
  const white = flat(WHITE);
  const dark = flat(0x17151f);

  const torso = new THREE.Mesh(new THREE.SphereGeometry(0.27, 24, 18), paintedCoat(look, "torso"));
  torso.scale.set(1.55, 0.78, 0.85);
  torso.position.y = 0.42;
  body.add(torso);

  const head = new THREE.Group();
  head.position.set(0.38, 0.64, 0);
  body.add(head);
  const skull = new THREE.Mesh(new THREE.SphereGeometry(0.19, 24, 18), paintedCoat(look, "head"));
  skull.scale.set(1, 0.92, 1.05);
  const muzzle = new THREE.Mesh(new THREE.SphereGeometry(0.085, 18, 14), look.pattern === "tuxedo" ? white : look.pattern === "siamese" ? acc : main);
  muzzle.scale.set(0.9, 0.75, 1.25);
  muzzle.position.set(0.15, -0.05, 0);
  const nose = new THREE.Mesh(roundedBox(0.035, 0.03, 0.05), flat(0xff8fa8));
  nose.position.set(0.225, -0.01, 0);
  head.add(skull, muzzle, nose);
  for (const s of [-1, 1]) {
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.032, 18, 14), dark);
    eye.position.set(0.16, 0.05, s * 0.085);
    const ear = new THREE.Mesh(new THREE.ConeGeometry(0.075, 0.15, 14), look.pattern === "siamese" ? acc : main);
    ear.position.set(-0.02, 0.17, s * 0.1);
    ear.rotation.x = s * 0.25;
    head.add(eye, ear);
  }

  const legMat = look.pattern === "siamese" ? acc : look.pattern === "tuxedo" ? white : main;
  const legs = ([[0.24, 0.12], [0.24, -0.12], [-0.24, 0.12], [-0.24, -0.12]] as const).map(([x, z]) => {
    const pivot = new THREE.Group();
    pivot.position.set(x, 0.32, z);
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.045, 0.32, 14), legMat);
    leg.geometry.translate(0, -0.16, 0);
    pivot.add(leg);
    body.add(pivot);
    return pivot;
  });

  const tail: THREE.Group[] = [];
  let parent: THREE.Object3D = body;
  for (let i = 0; i < 5; i++) {
    const seg = new THREE.Group();
    if (i === 0) seg.position.set(-0.4, 0.48, 0);
    else seg.position.y = 0.13;
    const m = look.pattern === "tabby" && i % 2 ? acc : look.pattern === "siamese" ? acc : main;
    const piece = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.042, 0.14, 14), m);
    piece.geometry.translate(0, 0.065, 0);
    seg.add(piece);
    parent.add(seg);
    tail.push(seg);
    parent = seg;
  }
  // A bit larger than life so they read next to the 2.3-unit doodle characters.
  g.scale.setScalar(1.4 * (look.scale ?? 1));
  return { g: shadowed(g), hips, head, legs, tail };
}

type Pose = "stand" | "walk" | "run" | "sit" | "loaf" | "crouch" | "rear" | "back";

/** Put the rig in a pose for time t. `tailAmp`/`tailSpeed` set how lively the tail is. */
function pose(r: Rig, p: Pose, t: number, phase: number, tailAmp = 0.25, tailSpeed = 3) {
  r.hips.position.y = 0.3;
  r.hips.rotation.set(0, 0, 0);
  r.hips.scale.set(1, 1, 1);
  r.head.rotation.set(0, 0, 0);
  for (const l of r.legs) {
    l.rotation.set(0, 0, 0);
    l.scale.set(1, 1, 1);
  }
  const lift = { stand: 0.9, walk: 0.9, run: 0.5, sit: 1.6, loaf: 1.2, crouch: 0.4, rear: 0.3, back: 0.6 }[p];
  r.tail.forEach((s, i) => {
    s.rotation.z = i === 0 ? lift : 0.18 + Math.sin(t * tailSpeed + phase + i * 0.7) * tailAmp * 0.5;
    s.rotation.x = Math.sin(t * tailSpeed * 0.7 + phase + i * 0.6) * tailAmp;
  });
  const gait = (f: number, amp: number) => {
    const s = Math.sin(t * f + phase) * amp;
    r.legs[0].rotation.z = s;
    r.legs[3].rotation.z = s;
    r.legs[1].rotation.z = -s;
    r.legs[2].rotation.z = -s;
  };
  switch (p) {
    case "walk":
      gait(9, 0.5);
      r.hips.position.y = 0.3 + Math.abs(Math.sin(t * 9 + phase)) * 0.025;
      break;
    case "run":
      gait(16, 0.8);
      r.hips.position.y = 0.33 + Math.abs(Math.sin(t * 16 + phase)) * 0.07;
      r.hips.rotation.z = Math.sin(t * 16 + phase) * 0.08;
      break;
    case "sit":
      r.hips.position.y = 0.17;
      r.hips.rotation.z = 0.6;
      r.head.rotation.z = -0.45;
      r.legs[0].rotation.z = r.legs[1].rotation.z = -0.6;
      r.legs[0].scale.y = r.legs[1].scale.y = 1.4;
      r.legs[2].rotation.z = r.legs[3].rotation.z = -1.35;
      break;
    case "loaf":
      r.hips.position.y = 0.12;
      for (const l of r.legs) l.scale.y = 0.15;
      r.head.rotation.z = -0.25;
      r.hips.scale.y = 1 + Math.sin(t * 1.6 + phase) * 0.05;
      break;
    case "crouch":
      r.hips.position.y = 0.21;
      r.hips.rotation.z = -0.1;
      r.hips.rotation.x = Math.sin(t * 22) * 0.1; // butt wiggle
      for (const l of r.legs) l.scale.y = 0.72;
      break;
    case "rear":
      r.hips.position.y = 0.22;
      r.hips.rotation.z = 1.15;
      r.head.rotation.z = -0.5;
      r.legs[2].rotation.z = r.legs[3].rotation.z = -1.0;
      r.legs[0].rotation.z = -1.2 + Math.sin(t * 13) * 0.7;
      r.legs[1].rotation.z = -1.2 - Math.sin(t * 13) * 0.7;
      break;
    case "back":
      r.hips.position.y = 0.42;
      r.hips.rotation.x = Math.PI - 0.3 + Math.sin(t * 3 + phase) * 0.35;
      r.legs.forEach((l, i) => (l.rotation.z = Math.sin(t * 5 + i * 1.3) * 0.6));
      r.head.rotation.x = Math.sin(t * 3 + phase) * 0.3;
      break;
  }
}

/** Turn the head toward a world point (within reach of a cat's neck). */
function lookAt(r: Rig, x: number, z: number, up = 0) {
  const want = Math.atan2(-(z - r.g.position.z), x - r.g.position.x) - r.g.rotation.y;
  r.head.rotation.y = THREE.MathUtils.clamp(Math.atan2(Math.sin(want), Math.cos(want)), -1.1, 1.1);
  if (up) r.head.rotation.z += up;
}

const face = (r: Rig, dx: number, dz: number) => {
  if (Math.hypot(dx, dz) > 1e-4) r.g.rotation.y = Math.atan2(-dz, dx);
};

export interface CatSpots {
  chase: [number, number];
  watch: [number, number];
  yarn: [number, number];
  bat: [number, number];
  roll: [number, number];
  spin: [number, number];
  groom: [number, number];
  sleep: [number, number];
  friend: [number, number];
}

export function catColony(area: Box, spots: CatSpots, player: () => THREE.Vector3): Anim {
  const group = new THREE.Group();
  const add = (look: Look, at: [number, number]) => {
    const r = catRig(look);
    r.g.position.set(at[0], 0, at[1]);
    group.add(r.g);
    return r;
  };
  const chaseA = add({ body: 0xf0a04b, pattern: "tabby", accent: 0xc9772e }, spots.chase);
  const chaseB = add({ body: 0x2a2730, pattern: "solid" }, spots.chase);
  const watcher = add({ body: 0x8a93a3, pattern: "solid", scale: 0.95 }, spots.watch);
  const kitten = add({ body: 0x9a9aa4, pattern: "tabby", accent: 0x5f5f6a, scale: 0.7 }, spots.yarn);
  const batter = add({ body: WHITE, pattern: "calico", accent: 0xf0a04b, accent2: 0x2a2730 }, spots.bat);
  const roller = add({ body: WHITE, pattern: "solid" }, spots.roll);
  const spinner = add({ body: 0xf6b26b, pattern: "tabby", accent: 0xd9822b, scale: 0.65 }, spots.spin);
  const groomer = add({ body: 0xf3e3c8, pattern: "siamese", accent: 0x5a3d2b }, spots.groom);
  const sleeper = add({ body: 0x3b2a20, pattern: "calico", accent: 0xc9772e, accent2: 0x6b4a2a }, spots.sleep);
  const friend = add({ body: 0x22202a, pattern: "tuxedo" }, spots.friend);
  face(sleeper, 1, 0.4);
  face(groomer, 0.6, 1);

  // Yarn ball for the kitten.
  const ball = new THREE.Mesh(new THREE.SphereGeometry(0.22, 18, 14), flat(0xff7fae));
  ball.castShadow = true;
  ball.position.set(spots.yarn[0] + 1, 0.22, spots.yarn[1]);
  group.add(ball);
  const ballVel = new THREE.Vector2();
  let kittenMode: "approach" | "crouch" | "pounce" | "rest" = "rest";
  let kittenT = 1;
  const pounceFrom = new THREE.Vector2();
  const pounceTo = new THREE.Vector2();

  // Butterfly the calico keeps swiping at.
  const fly = new THREE.Group();
  const wingMat = new THREE.MeshLambertMaterial({ color: 0x8fd0ff, side: THREE.DoubleSide, emissive: 0x113355, emissiveIntensity: 0.3 });
  const wings = [-1, 1].map((s) => {
    const geo = new THREE.PlaneGeometry(0.2, 0.17);
    geo.rotateX(-Math.PI / 2);
    geo.translate(0, 0, (s * 0.17) / 2);
    const w = new THREE.Mesh(geo, wingMat);
    fly.add(w);
    return w;
  });
  group.add(fly);

  const friendTarget = new THREE.Vector2(...spots.friend);
  let friendT = 0;
  let lastMeow = -10;
  let last = -1;

  const clampArea = (v: THREE.Vector2) => {
    v.x = THREE.MathUtils.clamp(v.x, area[0], area[2]);
    v.y = THREE.MathUtils.clamp(v.y, area[1], area[3]);
    return v;
  };
  const meow = (t: number) => {
    if (t - lastMeow > 5) {
      lastMeow = t;
      sfx.meow();
    }
  };

  const update = (t: number) => {
    const dt = last < 0 ? 0 : Math.min(0.1, t - last);
    last = t;
    const p = player();

    // Two cats chasing round and round, the black one hopping now and then.
    const th = t * 1.5 + Math.sin(t * 0.4) * 0.6;
    for (const [r, off] of [[chaseA, 0], [chaseB, -0.85]] as const) {
      const a = th + off;
      r.g.position.set(spots.chase[0] + Math.cos(a) * 2.8, 0, spots.chase[1] + Math.sin(a) * 1.6);
      face(r, -Math.sin(a) * 2.8, Math.cos(a) * 1.6);
      pose(r, "run", t, off * 3, 0.15, 6);
    }
    const hop = t % 5;
    if (hop < 0.5) chaseB.g.position.y = Math.sin((hop / 0.5) * Math.PI) * 0.55;

    // The grey one sits and watches them go round.
    pose(watcher, "sit", t, 1, 0.3, 2);
    face(watcher, spots.chase[0] - spots.watch[0], spots.chase[1] - spots.watch[1]);
    lookAt(watcher, chaseA.g.position.x, chaseA.g.position.z);

    // Kitten vs yarn: stalk, wiggle, pounce, bat it away. Qish can kick it too.
    const bp = new THREE.Vector2(ball.position.x, ball.position.z);
    const kp = new THREE.Vector2(kitten.g.position.x, kitten.g.position.z);
    const toQish = new THREE.Vector2(bp.x - p.x, bp.y - p.z);
    if (toQish.length() < 0.65) ballVel.copy(toQish.normalize().multiplyScalar(3.2));
    kittenT -= dt;
    if (kittenMode === "rest") {
      pose(kitten, "sit", t, 2, 0.5, 5);
      lookAt(kitten, bp.x, bp.y);
      if (kittenT <= 0) kittenMode = "approach";
    } else if (kittenMode === "approach") {
      const d = bp.clone().sub(kp);
      if (d.length() < 1.0) {
        kittenMode = "crouch";
        kittenT = 0.9;
      } else {
        kp.add(d.normalize().multiplyScalar(Math.min(d.length(), 2.2 * dt)));
        face(kitten, d.x, d.y);
      }
      pose(kitten, "walk", t, 2, 0.3, 6);
    } else if (kittenMode === "crouch") {
      face(kitten, bp.x - kp.x, bp.y - kp.y);
      pose(kitten, "crouch", t, 2, 0.6, 12);
      if (kittenT <= 0) {
        kittenMode = "pounce";
        kittenT = 0.45;
        pounceFrom.copy(kp);
        pounceTo.copy(bp);
      }
    } else {
      const k = 1 - Math.max(0, kittenT) / 0.45;
      kp.lerpVectors(pounceFrom, pounceTo, k * 0.8);
      pose(kitten, "run", t, 2, 0.2, 6);
      kitten.g.position.y = Math.sin(k * Math.PI) * 0.55;
      if (kittenT <= 0) {
        const a = Math.random() * Math.PI * 2;
        ballVel.set(Math.cos(a), Math.sin(a)).multiplyScalar(2 + Math.random() * 1.5);
        kittenMode = "rest";
        kittenT = 0.6 + Math.random() * 0.8;
        kitten.g.position.y = 0;
      }
    }
    kitten.g.position.x = kp.x;
    kitten.g.position.z = kp.y;
    bp.addScaledVector(ballVel, dt);
    const before = bp.clone();
    clampArea(bp);
    if (bp.x !== before.x) ballVel.x *= -0.6;
    if (bp.y !== before.y) ballVel.y *= -0.6;
    ballVel.multiplyScalar(Math.max(0, 1 - 1.6 * dt));
    ball.position.x = bp.x;
    ball.position.z = bp.y;
    ball.rotation.z -= (ballVel.x * dt) / 0.22;
    ball.rotation.x += (ballVel.y * dt) / 0.22;

    // Calico swiping at a butterfly.
    const [bx, bz] = spots.bat;
    fly.position.set(bx + 0.6 + Math.sin(t * 0.9) * 0.4, 1.5 + Math.sin(t * 2.3) * 0.25, bz + Math.cos(t * 0.7) * 0.35);
    fly.rotation.y = Math.sin(t * 0.9) * 1.2;
    const flap = Math.sin(t * 20) * 1.0;
    wings[0].rotation.x = flap;
    wings[1].rotation.x = -flap;
    face(batter, fly.position.x - bx, fly.position.z - bz);
    const swipe = t % 3.4 > 2.4;
    pose(batter, swipe ? "rear" : "sit", t, 3, 0.4, 4);
    if (!swipe) lookAt(batter, fly.position.x, fly.position.z, 0.5);

    // White cat rolling on its back in the grass, sitting up now and then to look at Qish.
    const rolling = t % 9 < 6;
    pose(roller, rolling ? "back" : "sit", t, 4, 0.4, 3);
    if (!rolling) lookAt(roller, p.x, p.z);

    // Ginger kitten chasing its own tail until it gets dizzy.
    const spinning = t % 5 < 3;
    if (spinning) {
      spinner.g.rotation.y += dt * 8;
      const a = spinner.g.rotation.y;
      spinner.g.position.set(spots.spin[0] + Math.sin(a) * 0.25, 0, spots.spin[1] + Math.cos(a) * 0.25);
      pose(spinner, "run", t, 5, 0.4, 10);
    } else {
      pose(spinner, "sit", t, 5, 0.2, 2);
      spinner.head.rotation.x = Math.sin(t * 7) * 0.35;
    }

    // Siamese grooming: paw up, lick, look around.
    pose(groomer, "sit", t, 6, 0.35, 2.5);
    const licking = t % 4 < 2.6;
    if (licking) {
      groomer.legs[0].rotation.z = -1.9;
      groomer.head.rotation.z = -0.15 + Math.sin(t * 9) * 0.12;
      groomer.head.rotation.y = 0.35;
    } else lookAt(groomer, p.x, p.z);

    pose(sleeper, "loaf", t, 7, 0.08, 1);

    // Tuxedo wanders about, and comes over to sit with Qish when she is near.
    const fp = new THREE.Vector2(friend.g.position.x, friend.g.position.z);
    const toP = new THREE.Vector2(p.x - fp.x, p.z - fp.y);
    friendT -= dt;
    if (toP.length() < 3.5) {
      if (toP.length() > 1.2) {
        fp.add(toP.clone().normalize().multiplyScalar(Math.min(toP.length() - 1.2, 2.4 * dt)));
        face(friend, toP.x, toP.y);
        pose(friend, "walk", t, 8, 0.4, 5);
      } else {
        face(friend, toP.x, toP.y);
        pose(friend, "sit", t, 8, 0.5, 4);
        lookAt(friend, p.x, p.z, 0.15);
        meow(t);
      }
    } else {
      if (friendT <= 0) {
        friendT = 2.5 + Math.random() * 3;
        clampArea(friendTarget.set(fp.x + (Math.random() - 0.5) * 5, fp.y + (Math.random() - 0.5) * 4));
      }
      const d = friendTarget.clone().sub(fp);
      if (d.length() > 0.1) {
        fp.add(d.clone().normalize().multiplyScalar(Math.min(d.length(), 1.1 * dt)));
        face(friend, d.x, d.y);
        pose(friend, "walk", t, 8, 0.3, 4);
      } else pose(friend, "sit", t, 8, 0.4, 3);
    }
    friend.g.position.x = fp.x;
    friend.g.position.z = fp.y;
  };
  return { group, update };
}
