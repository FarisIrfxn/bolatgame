import * as THREE from "three";
import { type PersonLook, passengerDoodle } from "../content/doodles";
import { sfx } from "../core/sfx";
import { paperStandee } from "../overworld/paper";
import { roundedBox, canvasTexture, flat, signTexture } from "../overworld/props";
import { shadowed } from "./common";
import type { Anim } from "./labuProps";

// KLIA, Sepang: the airport where Babah fixes planes. Golden hour: the terminal's umbrella roof,
// a runway with traffic, Babah's plane on stand 8 with its engine cowl open, a baggage train,
// waving Jalur Gemilang, a split-flap departures board and passengers wheeling their bags.

const INK = "#17151f";

/** Delta time for props that only get the clock. */
function ticker() {
  let last = -1;
  return (t: number) => {
    const dt = last < 0 ? 0 : Math.min(0.1, t - last);
    last = t;
    return dt;
  };
}

function radial(inner: string, outer: string, size = 64) {
  return canvasTexture(size, size, (g) => {
    const grad = g.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    grad.addColorStop(0, inner);
    grad.addColorStop(1, outer);
    g.fillStyle = grad;
    g.fillRect(0, 0, size, size);
  });
}

function glowSprite(tex: THREE.Texture, color: number, size: number) {
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, color, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
  s.scale.setScalar(size);
  return s;
}

/** A cylinder between two points (struts, rails, handles). */
function rod(a: THREE.Vector3, b: THREE.Vector3, r: number, mat: THREE.Material) {
  const len = a.distanceTo(b);
  const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, len, 6), mat);
  m.position.copy(a).add(b).multiplyScalar(0.5);
  m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), b.clone().sub(a).normalize());
  return m;
}

const v3 = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

// ---------------------------------------------------------------- Airfield

/** Runway 08/26 along x (08 for 8.8, 26 for her age), with piano keys at both ends. */
export function runway(x0: number, x1: number, z0: number, z1: number) {
  const g = new THREE.Group();
  const len = x1 - x0;
  const w = z1 - z0;
  const zc = (z0 + z1) / 2;
  const tex = canvasTexture(512, 128, (c) => {
    c.fillStyle = "#585960";
    c.fillRect(0, 0, 512, 128);
    for (let i = 0; i < 1600; i++) {
      c.fillStyle = Math.random() > 0.5 ? "#62636b" : "#4d4e55";
      c.fillRect(Math.random() * 512, Math.random() * 128, 2, 2);
    }
    // Rubber from touchdowns, darker down the middle.
    c.fillStyle = "rgba(30,30,34,.18)";
    c.fillRect(0, 44, 512, 40);
    c.fillStyle = "#f2efe6";
    c.fillRect(0, 7, 512, 4);
    c.fillRect(0, 117, 512, 4);
    for (let x = 0; x < 512; x += 128) c.fillRect(x + 20, 61, 70, 6);
  });
  tex.wrapS = THREE.RepeatWrapping;
  tex.repeat.set(len / 16, 1);
  const m = new THREE.Mesh(new THREE.PlaneGeometry(len, w), new THREE.MeshLambertMaterial({ map: tex }));
  m.rotation.x = -Math.PI / 2;
  m.position.set((x0 + x1) / 2, 0.035, zc);
  m.receiveShadow = true;
  g.add(m);

  const end = (cx: number, label: string, keysRight: boolean) => {
    const t = canvasTexture(256, 128, (c) => {
      c.fillStyle = "#f2efe6";
      const kx = keysRight ? 150 : 6;
      for (let i = 0; i < 8; i++) c.fillRect(kx, 12 + i * 13.6, 100, 7);
      c.font = "bold 70px 'Bagel Fat One', sans-serif";
      c.textAlign = "center";
      c.textBaseline = "middle";
      c.fillText(label, keysRight ? 72 : 184, 68);
    });
    const mm = new THREE.Mesh(new THREE.PlaneGeometry(8, w), new THREE.MeshLambertMaterial({ map: t, transparent: true, depthWrite: false }));
    mm.rotation.x = -Math.PI / 2;
    mm.position.set(cx, 0.045, zc);
    mm.receiveShadow = true;
    g.add(mm);
  };
  end(x0 + 4, "08", false);
  end(x1 - 4, "26", true);
  return g;
}

/** Edge lights along the runway, green across the 08 threshold, red at the far end. */
export function runwayLights(x0: number, x1: number, z0: number, z1: number): Anim {
  const group = new THREE.Group();
  const tex = radial("rgba(255,255,255,1)", "rgba(255,255,255,0)");
  const edges: THREE.Sprite[] = [];
  const post = flat(0x3a3a40);
  for (let x = x0 + 1; x <= x1; x += 3) {
    for (const z of [z0 - 0.2, z1 + 0.2]) {
      const p = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.07, 0.2, 6), post);
      p.position.set(x, 0.1, z);
      group.add(p);
      const s = glowSprite(tex, 0xffe6b0, 0.6);
      s.position.set(x, 0.24, z);
      group.add(s);
      edges.push(s);
    }
  }
  const ends: THREE.Sprite[] = [];
  for (let i = 0; i < 6; i++) {
    const z = z0 + 0.3 + (i * (z1 - z0 - 0.6)) / 5;
    const gS = glowSprite(tex, 0x6dff9a, 0.6);
    gS.position.set(x0 + 0.4, 0.22, z);
    const rS = glowSprite(tex, 0xff5a4a, 0.6);
    rS.position.set(x1 - 0.4, 0.22, z);
    group.add(gS, rS);
    ends.push(gS);
  }
  const update = (t: number) => {
    edges.forEach((s, i) => (s.material.opacity = 0.7 + Math.sin(t * 2.2 + i * 0.9) * 0.2));
    // Edge lights chase towards the threshold like a welcome mat.
    const on = Math.floor(t * 10) % 12;
    ends.forEach((s, i) => (s.material.opacity = 0.65 + (i === on % 6 ? 0.35 : 0)));
  };
  return { group, update };
}

/** Airport perimeter fence: posts, chain-link and a strand of barbed wire on top. */
export function airsideFence(x0: number, x1: number, z: number, h = 1.5) {
  const g = new THREE.Group();
  const mesh = canvasTexture(64, 64, (c) => {
    c.strokeStyle = "rgba(190,196,204,.85)";
    c.lineWidth = 2;
    for (let i = -64; i < 128; i += 12) {
      c.beginPath();
      c.moveTo(i, 0);
      c.lineTo(i + 64, 64);
      c.moveTo(i + 64, 0);
      c.lineTo(i, 64);
      c.stroke();
    }
  });
  mesh.wrapS = mesh.wrapT = THREE.RepeatWrapping;
  mesh.repeat.set((x1 - x0) / 1.2, h / 1.2);
  const net = new THREE.Mesh(new THREE.PlaneGeometry(x1 - x0, h), new THREE.MeshLambertMaterial({ map: mesh, transparent: true, alphaTest: 0.3, side: THREE.DoubleSide }));
  net.position.set((x0 + x1) / 2, h / 2, z);
  g.add(net);
  const steel = flat(0x9aa0a8);
  for (let x = x0; x <= x1 + 0.01; x += 3) {
    const p = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, h + 0.15, 6), steel);
    p.position.set(x, (h + 0.15) / 2, z);
    g.add(p);
  }
  const wire = new THREE.Mesh(roundedBox(x1 - x0, 0.03, 0.03), flat(0x6b6f76));
  wire.position.set((x0 + x1) / 2, h + 0.12, z);
  g.add(wire);
  return shadowed(g);
}

/** Concrete apron with yellow lead-in lines and the stand number. */
export function apronSlab(x0: number, z0: number, x1: number, z1: number, stand: { x: number; z: number; label: string }) {
  const g = new THREE.Group();
  const yellow = new THREE.MeshBasicMaterial({ color: 0xf2c230 });
  const pts: THREE.Vector3[] = [];
  for (let i = 0; i <= 24; i++) {
    const k = i / 24;
    pts.push(v3(stand.x - 8 + k * 14, 0.07, stand.z + 4.2 * (1 - k) * (1 - k)));
  }
  for (let i = 0; i < pts.length - 1; i++) {
    const a = pts[i];
    const b = pts[i + 1];
    const seg = new THREE.Mesh(new THREE.PlaneGeometry(a.distanceTo(b) + 0.02, 0.14), yellow);
    seg.rotation.x = -Math.PI / 2;
    seg.rotation.z = -Math.atan2(b.z - a.z, b.x - a.x);
    seg.position.copy(a).add(b).multiplyScalar(0.5);
    g.add(seg);
  }
  const stop = new THREE.Mesh(new THREE.PlaneGeometry(0.16, 1.6), yellow);
  stop.rotation.x = -Math.PI / 2;
  stop.position.set(stand.x + 6.3, 0.07, stand.z);
  g.add(stop);
  const num = new THREE.Mesh(
    new THREE.PlaneGeometry(2.2, 1.1),
    new THREE.MeshBasicMaterial({ map: signTexture(stand.label, "#f2c230", INK, 256, 128), transparent: true }),
  );
  num.rotation.x = -Math.PI / 2;
  num.position.set(stand.x + 7.6, 0.075, stand.z + 2.4);
  g.add(num);
  return g;
}

// ---------------------------------------------------------------- Aeroplanes

interface Livery {
  stripe: string;
  stripe2: string;
  tail: string;
  nacelle: number;
  logo(c: CanvasRenderingContext2D): void;
  title?: string;
}

export const LIVERY: Record<"babah" | "red" | "malas", Livery> = {
  // Babah's plane: blue tail with a red swoosh and a heart.
  babah: {
    stripe: "#d6282f",
    stripe2: "#1d3f8f",
    tail: "#1d3f8f",
    nacelle: 0x1d3f8f,
    logo(c) {
      c.fillStyle = "#d6282f";
      c.beginPath();
      c.moveTo(20, 230);
      c.quadraticCurveTo(140, 200, 236, 40);
      c.quadraticCurveTo(170, 180, 20, 250);
      c.fill();
      heart(c, 150, 120, 38, "#ffffff");
    },
  },
  red: {
    stripe: "#e3350d",
    stripe2: "#e3350d",
    tail: "#e3350d",
    nacelle: 0xe3350d,
    logo(c) {
      heart(c, 150, 120, 52, "#ffffff");
    },
  },
  // Raja Nonchalant's own airline. Even the logo is asleep.
  malas: {
    stripe: "#ffcb05",
    stripe2: "#1f2f7a",
    tail: "#ffcb05",
    nacelle: 0xffcb05,
    title: "MALAS AIR",
    logo(c) {
      c.fillStyle = "#1f2f7a";
      c.font = "bold 70px 'Bagel Fat One', sans-serif";
      c.textAlign = "center";
      c.fillText("z", 120, 200);
      c.font = "bold 54px 'Bagel Fat One', sans-serif";
      c.fillText("z", 160, 150);
      c.font = "bold 40px 'Bagel Fat One', sans-serif";
      c.fillText("z", 192, 110);
    },
  },
};

function heart(c: CanvasRenderingContext2D, x: number, y: number, s: number, color: string) {
  c.fillStyle = color;
  c.beginPath();
  c.moveTo(x, y + s * 0.9);
  c.bezierCurveTo(x - s * 1.4, y, x - s * 0.6, y - s, x, y - s * 0.35);
  c.bezierCurveTo(x + s * 0.6, y - s, x + s * 1.4, y, x, y + s * 0.9);
  c.fill();
}

/** Fuselage skin. Canvas x runs round the tube (u: 0 = camera side, .75 = top), canvas y along it (top = nose). */
function fuselageTexture(l: Livery) {
  return canvasTexture(256, 512, (c) => {
    const W = 256;
    const H = 512;
    c.fillStyle = "#f7f6f2";
    c.fillRect(0, 0, W, H);
    c.fillStyle = "#cdd2da";
    c.fillRect(W * 0.1, 0, W * 0.3, H);
    const band = (u0: number, u1: number, color: string) => {
      c.fillStyle = color;
      c.fillRect(W * u0, 0, W * (u1 - u0), H);
    };
    band(0.965, 1, l.stripe);
    band(0, 0.035, l.stripe);
    band(0.045, 0.065, l.stripe2);
    band(0.465, 0.535, l.stripe);
    band(0.435, 0.455, l.stripe2);
    // Windows on both sides, skipping the doors.
    c.fillStyle = "#2b3442";
    for (let y = 40; y < 480; y += 14) {
      if (Math.abs(y - 68) < 16 || Math.abs(y - 440) < 16) continue;
      for (const u of [0.925, 0.575]) c.fillRect(W * u - 3, y, 6, 8);
    }
    c.strokeStyle = "#9aa0aa";
    c.lineWidth = 2;
    for (const y of [56, 428]) for (const u of [0.9, 0.575]) c.strokeRect(W * u - 4, y, 12, 26);
    if (l.title) {
      c.save();
      c.translate(W * 0.86, H * 0.5);
      c.rotate(-Math.PI / 2);
      c.fillStyle = l.stripe2;
      c.font = "bold 30px 'Bagel Fat One', sans-serif";
      c.textAlign = "center";
      c.textBaseline = "middle";
      c.fillText(l.title, 0, 0);
      c.restore();
    }
  });
}

export interface Airliner {
  group: THREE.Group;
  /** Fan discs, spun about their local x. */
  fans: THREE.Object3D[];
  gear: THREE.Group;
  /** The engine on the camera side, for Babah's open cowl. */
  nearEngine: THREE.Group;
  /** Navigation lights; `on` false keeps the beacon and strobe dark (parked, cold). */
  lights(t: number, on: boolean): void;
}

const FY = 1.45;
const R = 0.85;

/** A low-poly twin-jet, nose towards +x, standing on its gear at y = 0. */
export function airliner(l: Livery): Airliner {
  const group = new THREE.Group();
  const white = new THREE.MeshLambertMaterial({ color: 0xf7f6f2 });
  const wingMat = new THREE.MeshLambertMaterial({ color: 0xd5d9df, flatShading: false, side: THREE.DoubleSide });
  const dark = flat(0x23262d);

  const body = new THREE.Mesh(new THREE.CylinderGeometry(R, R, 7, 22, 1, true), new THREE.MeshLambertMaterial({ map: fuselageTexture(l) }));
  body.rotation.z = -Math.PI / 2;
  body.position.set(0.6, FY, 0);
  const nose = new THREE.Mesh(new THREE.SphereGeometry(R,22,14, 0, Math.PI * 2, 0, Math.PI / 2), white);
  nose.rotation.z = -Math.PI / 2;
  nose.scale.set(1, 1.6, 1);
  nose.position.set(4.1, FY, 0);
  const cockpit = new THREE.Mesh(roundedBox(0.5, 0.17, 0.95), dark);
  cockpit.position.set(4.75, FY + 0.6, 0);
  cockpit.rotation.z = -0.5;
  // Tail cone sweeps up to the APU exhaust.
  const coneGeo = new THREE.CylinderGeometry(0.2, R, 2.8, 22, 4, true);
  const pos = coneGeo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const k = (pos.getY(i) + 1.4) / 2.8;
    pos.setX(i, pos.getX(i) - k * k * 0.5);
  }
  coneGeo.computeVertexNormals();
  const cone = new THREE.Mesh(coneGeo, white);
  cone.rotation.z = Math.PI / 2;
  cone.position.set(-4.3, FY, 0);
  group.add(body, nose, cockpit, cone);

  const wingShape = new THREE.Shape();
  wingShape.moveTo(1.0, 0);
  wingShape.lineTo(-1.6, 0);
  wingShape.lineTo(-3.3, 4.6);
  wingShape.lineTo(-2.5, 4.6);
  wingShape.closePath();
  const wingGeo = new THREE.ExtrudeGeometry(wingShape, { depth: 0.12, bevelEnabled: false });
  wingGeo.rotateX(Math.PI / 2);
  for (const s of [1, -1]) {
    const geo = s > 0 ? wingGeo : wingGeo.clone().scale(1, 1, -1);
    const w = new THREE.Mesh(geo, wingMat);
    w.position.set(0.4, FY - 0.42, 0);
    w.rotation.x = -0.06 * s;
    const winglet = new THREE.Mesh(roundedBox(0.6, 0.55, 0.06), new THREE.MeshLambertMaterial({ color: new THREE.Color(l.tail) }));
    winglet.position.set(-2.55, FY - 0.1 + 0.28, s * 4.62);
    winglet.rotation.z = 0.35;
    group.add(w, winglet);
  }

  const stabShape = new THREE.Shape();
  stabShape.moveTo(0, 0);
  stabShape.lineTo(-1.1, 0);
  stabShape.lineTo(-1.9, 1.9);
  stabShape.lineTo(-1.4, 1.9);
  stabShape.closePath();
  const stabGeo = new THREE.ExtrudeGeometry(stabShape, { depth: 0.08, bevelEnabled: false });
  stabGeo.rotateX(Math.PI / 2);
  for (const s of [1, -1]) {
    const st = new THREE.Mesh(s > 0 ? stabGeo : stabGeo.clone().scale(1, 1, -1), wingMat);
    st.position.set(-4.4, FY + 0.32, 0);
    group.add(st);
  }

  const finShape = new THREE.Shape();
  finShape.moveTo(0, 0);
  finShape.lineTo(-1.8, 0);
  finShape.lineTo(-2.5, 2.3);
  finShape.lineTo(-1.7, 2.3);
  finShape.closePath();
  const finGeo = new THREE.ExtrudeGeometry(finShape, { depth: 0.12, bevelEnabled: false });
  finGeo.translate(0, 0, -0.06);
  const finTex = canvasTexture(256, 256, (c) => {
    c.fillStyle = l.tail;
    c.fillRect(0, 0, 256, 256);
    l.logo(c);
  });
  finTex.repeat.set(1 / 2.5, 1 / 2.3);
  finTex.offset.set(1, 0);
  const fin = new THREE.Mesh(finGeo, new THREE.MeshLambertMaterial({ map: finTex }));
  fin.position.set(-3.7, FY + 0.5, 0);
  group.add(fin);

  const fans: THREE.Object3D[] = [];
  let nearEngine!: THREE.Group;
  const nacelleMat = new THREE.MeshLambertMaterial({ color: l.nacelle });
  for (const s of [1, -1]) {
    const e = new THREE.Group();
    e.position.set(1.3, FY - 0.95, s * 1.75);
    const nac = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.34, 1.5, 18), nacelleMat);
    nac.rotation.z = -Math.PI / 2;
    const lip = new THREE.Mesh(new THREE.TorusGeometry(0.4, 0.04, 6, 18), flat(0xc9ced6));
    lip.rotation.y = Math.PI / 2;
    lip.position.x = 0.75;
    const intake = new THREE.Mesh(new THREE.CircleGeometry(0.37, 18), dark);
    intake.rotation.y = Math.PI / 2;
    intake.position.x = 0.7;
    const fan = new THREE.Group();
    fan.position.x = 0.72;
    const spinner = new THREE.Mesh(new THREE.ConeGeometry(0.11, 0.22, 10), flat(0xe8e8e8));
    spinner.rotation.z = -Math.PI / 2;
    spinner.position.x = 0.06;
    fan.add(spinner);
    for (let i = 0; i < 7; i++) {
      const blade = new THREE.Mesh(roundedBox(0.02, 0.32, 0.08), flat(0x9aa0aa));
      blade.position.y = 0.18;
      const arm = new THREE.Group();
      arm.rotation.x = (i / 7) * Math.PI * 2;
      blade.rotation.y = 0.5;
      arm.add(blade);
      fan.add(arm);
    }
    fans.push(fan);
    const pylon = new THREE.Mesh(roundedBox(1.0, 0.42, 0.1), wingMat);
    pylon.position.set(-0.15, 0.42, 0);
    e.add(nac, lip, intake, fan, pylon);
    group.add(e);
    if (s > 0) nearEngine = e;
  }

  const gear = new THREE.Group();
  const tyre = flat(0x1c1c22);
  const strut = flat(0xb9bec6);
  for (const [x, z] of [[3.5, 0], [-0.35, 0.75], [-0.35, -0.75]] as const) {
    const top = x > 0 ? FY - R + 0.05 : FY - 0.5;
    const st = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, top - 0.2, 6), strut);
    st.position.set(x, 0.2 + (top - 0.2) / 2, z);
    gear.add(st);
    for (const dz of x > 0 ? [0] : [-0.13, 0.13]) {
      const w = new THREE.Mesh(new THREE.CylinderGeometry(0.21, 0.21, 0.14, 12), tyre);
      w.rotation.x = Math.PI / 2;
      w.position.set(x, 0.21, z + dz);
      gear.add(w);
    }
  }
  group.add(gear);
  shadowed(group);

  const glow = radial("rgba(255,255,255,1)", "rgba(255,255,255,0)");
  const red = glowSprite(glow, 0xff3b30, 0.55);
  red.position.set(-2.9, FY - 0.2, -4.7);
  const green = glowSprite(glow, 0x48ff7a, 0.55);
  green.position.set(-2.9, FY - 0.2, 4.7);
  const strobe = glowSprite(glow, 0xffffff, 1.1);
  strobe.position.set(-5.8, FY + 0.5, 0);
  const beacon = glowSprite(glow, 0xff4030, 0.8);
  beacon.position.set(0.4, FY + R + 0.08, 0);
  const belly = glowSprite(glow, 0xff4030, 0.7);
  belly.position.set(0.4, FY - R - 0.06, 0);
  group.add(red, green, strobe, beacon, belly);
  const lights = (t: number, on: boolean) => {
    red.material.opacity = green.material.opacity = on ? 0.9 : 0.35;
    strobe.material.opacity = on && t % 1.1 < 0.07 ? 1 : 0;
    const b = on && t % 1.3 < 0.18 ? 1 : 0;
    beacon.material.opacity = belly.material.opacity = b;
  };
  return { group, fans, gear, nearEngine, lights };
}

/** Takeoffs and landings on runway 08 (threshold at `x0`), one after the other, in three liveries
 * (MALAS AIR among them). The runway runs right in front of the camera, so both are seen whole. */
export function runwayTraffic(x0: number, zc: number): Anim {
  const group = new THREE.Group();
  const planes = [airliner(LIVERY.red), airliner(LIVERY.malas), airliner(LIVERY.babah)];
  for (const p of planes) {
    p.group.visible = false;
    p.group.scale.setScalar(0.85);
    group.add(p.group);
  }
  const PERIOD = 36;
  const hold = x0 + 6.5;
  let lastRoar = -1;
  const update = (t: number) => {
    const cycle = Math.floor(t / PERIOD);
    const k = t % PERIOD;
    for (const p of planes) p.group.visible = false;
    if (k < 15) {
      // Lined up on the keys, engines spooling; roll, rotate, climb out to the east.
      const p = planes[cycle % 3];
      p.group.visible = true;
      let x = hold;
      let y = 0;
      let pitch = 0;
      if (k > 2 && k <= 8) x = hold + 22 * ((k - 2) / 6) ** 2;
      else if (k > 8) {
        const a = k - 8;
        x = hold + 22 + 7.3 * a + 1.4 * a * a;
        y = 0.55 * a ** 1.75;
        pitch = Math.min(0.22, a * 0.2);
      }
      if (k > 7.2 && k <= 8) pitch = (k - 7.2) * 0.1;
      p.group.position.set(x, y, zc);
      p.group.rotation.z = pitch;
      p.gear.visible = k < 10.2;
      for (const f of p.fans) f.rotation.x = t * (k < 2 ? 8 + k * 12 : 40);
      p.lights(t, true);
      if (k > 1.5 && lastRoar !== cycle) {
        lastRoar = cycle;
        sfx.jet();
      }
    } else if (k > 17) {
      // Landing: in low over the car park, flare, touch down on the keys, slow down and roll away east.
      const p = planes[(cycle + 1) % 3];
      p.group.visible = true;
      const a = k - 17;
      let x: number;
      let y: number;
      let pitch: number;
      if (a < 6) {
        x = hold - 50 + a * 8.3;
        y = 7 * (1 - a / 6) ** 1.3;
        pitch = 0.04 + (a > 5 ? (a - 5) * 0.1 : 0);
      } else {
        const r = a - 6;
        x = r < 9 ? hold + 8.3 * r - 0.4 * r * r : hold + 42.3 + 1.1 * (r - 9);
        y = 0;
        pitch = Math.max(0, 0.14 - r * 0.14);
      }
      p.group.position.set(x, y, zc);
      p.group.rotation.z = pitch;
      p.gear.visible = true;
      for (const f of p.fans) f.rotation.x = t * 30;
      p.lights(t, true);
    }
  };
  return { group, update };
}

/** Every so often a big jet passes overhead: only its shadow sweeps across the ground (and a distant roar). */
export function flyoverShadow(): Anim {
  const group = new THREE.Group();
  const tex = canvasTexture(256, 256, (c) => {
    c.fillStyle = "rgba(20,24,40,1)";
    c.filter = "blur(4px)";
    c.beginPath();
    c.ellipse(128, 128, 112, 15, 0, 0, Math.PI * 2);
    c.fill();
    c.beginPath();
    c.moveTo(150, 120);
    c.lineTo(80, 8);
    c.lineTo(58, 8);
    c.lineTo(95, 128);
    c.lineTo(58, 248);
    c.lineTo(80, 248);
    c.lineTo(150, 136);
    c.fill();
    c.beginPath();
    c.moveTo(36, 124);
    c.lineTo(10, 80);
    c.lineTo(0, 80);
    c.lineTo(14, 128);
    c.lineTo(0, 176);
    c.lineTo(10, 176);
    c.lineTo(36, 132);
    c.fill();
  });
  const m = new THREE.Mesh(new THREE.PlaneGeometry(16, 16), new THREE.MeshBasicMaterial({ map: tex, transparent: true, opacity: 0.22, depthWrite: false }));
  m.rotation.x = -Math.PI / 2;
  m.position.y = 0.09;
  m.renderOrder = 1;
  group.add(m);
  const PERIOD = 41;
  let played = -1;
  const update = (t: number) => {
    const loop = Math.floor(t / PERIOD);
    const k = (t % PERIOD) - 20;
    m.visible = k > 0 && k < 6;
    if (!m.visible) return;
    if (played !== loop) {
      played = loop;
      sfx.jet();
    }
    const dir = loop % 2 ? 1 : -1;
    m.position.x = dir * (-50 + k * 17);
    m.position.z = -8 + k * 3.2 + (loop % 3) * 2;
    m.rotation.z = (dir > 0 ? 0 : Math.PI) - 0.18 * dir;
  };
  return { group, update };
}

// ---------------------------------------------------------------- Terminal & tower

/** The terminal: KLIA's grid of white umbrella roofs on tree columns, over a glass hall lit warm inside. */
export function terminal(x0: number, x1: number, z0: number, z1: number) {
  const group = new THREE.Group();
  const M = 4.5;
  const nx = Math.round((x1 - x0) / M);
  const nz = Math.round((z1 - z0) / M);
  const base = 4.0;
  // Each umbrella: ribs from the column out to the corners and edges, darker where they meet.
  const roofTex = canvasTexture(128, 128, (c) => {
    const grad = c.createRadialGradient(64, 64, 4, 64, 64, 92);
    grad.addColorStop(0, "#d9dde2");
    grad.addColorStop(1, "#fbfaf6");
    c.fillStyle = grad;
    c.fillRect(0, 0, 128, 128);
    c.strokeStyle = "rgba(120,128,140,.55)";
    c.lineWidth = 2;
    for (let i = 0; i < 16; i++) {
      const a = (i / 16) * Math.PI * 2;
      const r = 64 / Math.max(Math.abs(Math.cos(a)), Math.abs(Math.sin(a)));
      c.beginPath();
      c.moveTo(64, 64);
      c.lineTo(64 + Math.cos(a) * r, 64 + Math.sin(a) * r);
      c.stroke();
    }
    c.strokeStyle = "#7d8792";
    c.lineWidth = 5;
    c.strokeRect(0, 0, 128, 128);
  });
  const roofMat = new THREE.MeshLambertMaterial({ map: roofTex, flatShading: false, side: THREE.DoubleSide });
  const colMat = flat(0xe1ddd3);
  for (let i = 0; i < nx; i++)
    for (let j = 0; j < nz; j++) {
      const cx = x0 + M * (i + 0.5);
      const cz = z0 + M * (j + 0.5);
      const geo = new THREE.PlaneGeometry(M, M, 6, 6);
      geo.rotateX(-Math.PI / 2);
      const p = geo.attributes.position;
      for (let v = 0; v < p.count; v++) {
        const dx = p.getX(v) / (M / 2);
        const dz = p.getZ(v) / (M / 2);
        p.setY(v, 0.48 * (dx * dx + dz * dz));
      }
      geo.computeVertexNormals();
      const roof = new THREE.Mesh(geo, roofMat);
      roof.position.set(cx, base, cz);
      group.add(roof);
      const col = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.3, base - 0.9, 8), colMat);
      col.position.set(cx, (base - 0.9) / 2, cz);
      group.add(col);
      for (const [sx, sz] of [[1, 1], [1, -1], [-1, 1], [-1, -1]] as const)
        group.add(rod(v3(cx, base - 1.0, cz), v3(cx + sx * 1.05, base + 0.15, cz + sz * 1.05), 0.08, colMat));
      // Skylight where four umbrellas meet.
      if (i > 0 && j > 0) {
        const sky = new THREE.Mesh(roundedBox(0.5, 0.06, 0.5), flat(0x9cc7d6));
        sky.position.set(x0 + M * i, base + 0.98, z0 + M * j);
        group.add(sky);
      }
    }

  const glassTex = canvasTexture(1024, 256, (c) => {
    const grad = c.createLinearGradient(0, 0, 0, 256);
    grad.addColorStop(0, "#ffe7bd");
    grad.addColorStop(1, "#f0b47a");
    c.fillStyle = grad;
    c.fillRect(0, 0, 1024, 256);
    // Check-in counters and their signs.
    for (let x = 40; x < 1024; x += 150) {
      c.fillStyle = "#6c5a52";
      c.fillRect(x, 186, 100, 30);
      c.fillStyle = "#ffcb05";
      c.fillRect(x + 25, 70, 50, 26);
      c.fillStyle = INK;
      c.font = "bold 20px sans-serif";
      c.textAlign = "center";
      c.fillText(String.fromCharCode(65 + (x - 40) / 150), x + 50, 90);
    }
    // People inside.
    for (let i = 0; i < 46; i++) {
      const x = Math.random() * 1024;
      const h = 34 + Math.random() * 16;
      c.fillStyle = `rgba(${70 + Math.random() * 60},${50 + Math.random() * 40},${60 + Math.random() * 50},.55)`;
      c.fillRect(x - 6, 250 - h, 12, h - 12);
      c.beginPath();
      c.arc(x, 250 - h - 2, 6, 0, Math.PI * 2);
      c.fill();
    }
    // Mullions, transoms and a few streaks of reflection.
    c.fillStyle = "#5e6670";
    for (let x = 0; x <= 1024; x += 64) c.fillRect(x - 3, 0, 6, 256);
    c.fillRect(0, 0, 1024, 6);
    c.fillRect(0, 120, 1024, 4);
    c.fillStyle = "rgba(255,255,255,.22)";
    for (let x = 60; x < 1024; x += 230) {
      c.beginPath();
      c.moveTo(x, 0);
      c.lineTo(x + 50, 0);
      c.lineTo(x - 30, 256);
      c.lineTo(x - 80, 256);
      c.fill();
    }
  });
  glassTex.wrapS = THREE.RepeatWrapping;
  const glassMat = (repeat: number) => {
    const t = glassTex.clone();
    t.needsUpdate = true;
    t.repeat.set(repeat, 1);
    return new THREE.MeshLambertMaterial({ map: t, emissive: 0xffffff, emissiveMap: t, emissiveIntensity: 0.45 });
  };
  const h = base - 0.3;
  const fz = z1 - 0.8;
  const front = new THREE.Mesh(new THREE.PlaneGeometry(x1 - x0 - 0.6, h), glassMat((x1 - x0) / 9));
  front.position.set((x0 + x1) / 2, h / 2, fz);
  group.add(front);
  for (const [x, ry] of [[x0 + 0.3, -Math.PI / 2], [x1 - 0.3, Math.PI / 2]] as const) {
    const side = new THREE.Mesh(new THREE.PlaneGeometry(fz - z0 - 0.3, h), glassMat((fz - z0) / 9));
    side.rotation.y = ry;
    side.position.set(x, h / 2, (z0 + fz) / 2);
    group.add(side);
  }
  // Kerb and the drop-off canopy columns stay outside the glass.
  const kerb = new THREE.Mesh(roundedBox(x1 - x0, 0.18, 0.5), flat(0xb8b2a6));
  kerb.position.set((x0 + x1) / 2, 0.09, z1 - 0.3);
  group.add(kerb);
  // Departures door: sliding glass with a sign above.
  const doorX = (x0 + x1) / 2 - 0.5;
  const door = new THREE.Mesh(roundedBox(2.4, 2.4, 0.08), new THREE.MeshLambertMaterial({ color: 0x8fc1cc, transparent: true, opacity: 0.75 }));
  door.position.set(doorX, 1.2, fz + 0.05);
  const frame = new THREE.Mesh(roundedBox(2.7, 0.18, 0.14), flat(0x5e6670));
  frame.position.set(doorX, 2.45, fz + 0.06);
  const sign = new THREE.Mesh(
    roundedBox(4.6, 0.62, 0.1),
    [flat(0x1f2f7a), flat(0x1f2f7a), flat(0x1f2f7a), flat(0x1f2f7a), new THREE.MeshBasicMaterial({ map: signTexture("BERLEPAS · DEPARTURES", "#1f2f7a", "#ffcb05", 640, 86, "bold 44px 'Bagel Fat One', sans-serif") }), flat(0x1f2f7a)],
  );
  sign.position.set(doorX, 3.1, fz + 0.12);
  group.add(door, frame, sign);
  shadowed(group);
  front.castShadow = false;
  return { group, box: [x0, z0, x1, fz + 0.2] as [number, number, number, number] };
}

/** The control tower: Kurokawa's torch, beacon blinking, radar turning. */
export function controlTower(x: number, z: number): Anim {
  const group = new THREE.Group();
  const shell = flat(0xe9e5dc);
  const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.62, 4.6, 12), shell);
  shaft.position.y = 2.3;
  group.add(shaft);
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    const rib = new THREE.Mesh(roundedBox(0.12, 4.4, 0.2), flat(0xd4cfc4));
    rib.position.set(Math.cos(a) * 0.52, 2.2, Math.sin(a) * 0.52);
    rib.rotation.y = -a;
    rib.rotation.z = Math.cos(a) * 0.04;
    rib.rotation.x = -Math.sin(a) * 0.04;
    group.add(rib);
  }
  const flare = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 0.45, 0.9, 14), shell);
  flare.position.y = 5.0;
  const bandTex = canvasTexture(256, 32, (c) => {
    const grad = c.createLinearGradient(0, 0, 0, 32);
    grad.addColorStop(0, "#c8fff5");
    grad.addColorStop(1, "#5fc9c0");
    c.fillStyle = grad;
    c.fillRect(0, 0, 256, 32);
    c.fillStyle = "#3d4a52";
    for (let i = 0; i < 256; i += 16) c.fillRect(i, 0, 2, 32);
  });
  const band = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.15, 0.6, 16), new THREE.MeshBasicMaterial({ map: bandTex }));
  band.position.y = 5.75;
  const roof = new THREE.Mesh(new THREE.CylinderGeometry(1.3, 1.2, 0.16, 16), flat(0xd7d2c7));
  roof.position.y = 6.12;
  const cap = new THREE.Mesh(new THREE.ConeGeometry(0.85, 0.45, 14), shell);
  cap.position.y = 6.42;
  const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.9, 6), flat(0x8a8f96));
  mast.position.y = 7.05;
  const radar = new THREE.Group();
  radar.position.y = 6.75;
  const dish = new THREE.Mesh(roundedBox(1.1, 0.22, 0.07), flat(0xf0f0f0));
  dish.position.x = 0.2;
  radar.add(dish);
  group.add(flare, band, roof, cap, mast, radar);
  shadowed(group);
  const glow = radial("rgba(255,255,255,1)", "rgba(255,255,255,0)");
  const beacon = glowSprite(glow, 0xff3b30, 0.9);
  beacon.position.y = 7.55;
  const halo = glowSprite(glow, 0x9ffff0, 3.4);
  halo.position.y = 5.75;
  halo.material.opacity = 0.35;
  group.add(beacon, halo);
  group.position.set(x, 0, z);
  const update = (t: number) => {
    radar.rotation.y = t * 1.6;
    beacon.material.opacity = t % 1.5 < 0.5 ? 1 : 0.1;
  };
  return { group, update };
}

/** Floodlight mast over the apron. */
export function floodMast(x: number, z: number, faceZ = 1) {
  const g = new THREE.Group();
  const steel = flat(0x9aa0a8);
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.16, 6.2, 8), steel);
  pole.position.y = 3.1;
  const head = new THREE.Mesh(roundedBox(1.4, 0.5, 0.25), flat(0x5e6670));
  head.position.set(0, 6.2, 0.1 * faceZ);
  head.rotation.x = 0.4 * faceZ;
  g.add(pole, head);
  for (const lx of [-0.4, 0, 0.4]) {
    const lamp = new THREE.Mesh(new THREE.PlaneGeometry(0.32, 0.3), new THREE.MeshBasicMaterial({ color: 0xfff1cf }));
    lamp.position.set(lx, 6.12, 0.24 * faceZ);
    lamp.rotation.x = 0.4 * faceZ;
    if (faceZ < 0) lamp.rotation.y = Math.PI;
    g.add(lamp);
  }
  shadowed(g);
  const glow = glowSprite(radial("rgba(255,240,200,1)", "rgba(255,240,200,0)"), 0xffffff, 1.8);
  glow.position.set(0, 6.1, 0.3 * faceZ);
  glow.material.opacity = 0.7;
  g.add(glow);
  g.position.set(x, 0, z);
  return g;
}

/** Windsock on the airfield, swinging in the evening breeze. */
export function windsock(x: number, z: number): Anim {
  const group = new THREE.Group();
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.07, 3, 6), flat(0xd8d8d8));
  pole.position.y = 1.5;
  group.add(pole);
  const tex = canvasTexture(64, 128, (c) => {
    for (let i = 0; i < 5; i++) {
      c.fillStyle = i % 2 ? "#ffffff" : "#ff6a1a";
      c.fillRect(0, i * 25.6, 64, 25.6);
    }
  });
  const pivot = new THREE.Group();
  pivot.position.y = 2.9;
  const sockGeo = new THREE.CylinderGeometry(0.26, 0.13, 1.6, 12, 1, true);
  sockGeo.translate(0, -0.8, 0);
  const sock = new THREE.Mesh(sockGeo, new THREE.MeshLambertMaterial({ map: tex, side: THREE.DoubleSide }));
  sock.rotation.z = Math.PI / 2;
  pivot.add(sock);
  group.add(pivot);
  shadowed(group);
  group.position.set(x, 0, z);
  const update = (t: number) => {
    pivot.rotation.y = 0.5 + Math.sin(t * 0.7) * 0.35;
    sock.rotation.z = Math.PI / 2 - 0.15 + Math.sin(t * 3.1) * 0.06;
  };
  return { group, update };
}

// ---------------------------------------------------------------- Landside

/** Split-flap departures board. Destinations are the island; one row keeps flipping to something it shouldn't. */
export function flipBoard(x: number, z: number): Anim {
  const group = new THREE.Group();
  const W = 640;
  const H = 384;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const c = canvas.getContext("2d")!;
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  type Row = [string, string, string, string, string];
  const rows: Row[] = [
    ["08:08", "COSY PLACE", "G8", "ON TIME", "#7dffa0"],
    ["09:30", "BUKIT BINTANG", "G2", "BOARDING", "#ffcb05"],
    ["10:15", "PHOTOBOOTH", "G3", "ON TIME", "#7dffa0"],
    ["11:03", "LABU LANJUT", "G1", "ON TIME", "#7dffa0"],
    ["12:00", "MALAS AIR", "G?", "DELAYED", "#ff6b5a"],
    ["13:30", "BUKIT BUNGA", "G7", "ON TIME", "#7dffa0"],
  ];
  const SECRET: Row = ["??:??", "KEK MANGO", "G26", "RAHSIA", "#ff8fb1"];
  const MALAS_STATUS = ["DELAYED", "MALAS", "TIDUR", "DELAYED"];
  const shown: Row[] = rows.map((r) => [...r] as Row);
  const CH = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const cols = [28, 128, 430, 500];
  const cell = (s: string, x: number, y: number, color: string, width: number) => {
    for (let i = 0; i < width; i++) {
      const cx = x + i * 19;
      c.fillStyle = "#23262e";
      c.fillRect(cx, y - 16, 17, 30);
      c.fillStyle = "#14161b";
      c.fillRect(cx, y - 1, 17, 2);
      const ch = s[i] ?? " ";
      if (ch !== " ") {
        c.fillStyle = color;
        c.fillText(ch, cx + 8.5, y);
      }
    }
  };
  const draw = () => {
    c.fillStyle = "#101217";
    c.fillRect(0, 0, W, H);
    c.fillStyle = "#1f2f7a";
    c.fillRect(0, 0, W, 54);
    c.fillStyle = "#ffcb05";
    c.font = "bold 30px 'Bagel Fat One', sans-serif";
    c.textAlign = "left";
    c.textBaseline = "middle";
    c.fillText("✈ BERLEPAS · DEPARTURES", 22, 29);
    c.font = "bold 15px monospace";
    c.fillStyle = "#9aa3b5";
    ["MASA", "DESTINASI", "GATE", "STATUS"].forEach((h, i) => c.fillText(h, cols[i], 72));
    c.font = "bold 22px monospace";
    c.textAlign = "center";
    shown.forEach((r, i) => {
      const y = 108 + i * 46;
      cell(r[0], cols[0], y, "#ffe9b0", 5);
      cell(r[1], cols[1], y, "#ffffff", 15);
      cell(r[2], cols[2], y, "#ffe9b0", 3);
      cell(r[3], cols[3], y, r[4], 7);
    });
    tex.needsUpdate = true;
  };
  draw();
  const board = new THREE.Mesh(new THREE.PlaneGeometry(4.2, 2.52), new THREE.MeshBasicMaterial({ map: tex }));
  board.position.set(0, 2.1, 0.08);
  const back = new THREE.Mesh(roundedBox(4.45, 2.75, 0.14), flat(0x3d4450));
  back.position.set(0, 2.1, 0);
  const legMat = flat(0x5e6670);
  for (const lx of [-1.6, 1.6]) {
    const leg = new THREE.Mesh(roundedBox(0.16, 0.8, 0.16), legMat);
    leg.position.set(lx, 0.4, 0);
    group.add(leg);
  }
  group.add(back, board);
  shadowed(group);
  board.castShadow = false;
  group.position.set(x, 0, z);

  // One flip at a time: scramble for a moment, then settle on the target.
  let flipping = -1;
  let flipStart = 0;
  let target: Row = rows[0];
  let nextFlip = 3;
  let secretOn = false;
  let malasI = 0;
  let lastDraw = 0;
  const update = (t: number) => {
    if (flipping < 0 && t > nextFlip) {
      if (secretOn) {
        // The cake row hurries back to normal.
        flipping = 5;
        target = rows[5];
        secretOn = false;
      } else {
        const roll = Math.floor(t) % 3;
        if (roll === 0) {
          flipping = 5;
          target = SECRET;
          secretOn = true;
        } else if (roll === 1) {
          flipping = 4;
          malasI = (malasI + 1) % MALAS_STATUS.length;
          target = [...rows[4]] as Row;
          target[3] = MALAS_STATUS[malasI];
        } else {
          flipping = 1;
          target = [...rows[1]] as Row;
          target[3] = shown[1][3] === "BOARDING" ? "GATE OPEN" : "BOARDING";
        }
      }
      flipStart = t;
      nextFlip = t + (secretOn ? 1.8 : 3.5);
      sfx.flap();
    }
    if (flipping >= 0 && t - lastDraw > 0.06) {
      lastDraw = t;
      const k = (t - flipStart) / 0.6;
      const row = shown[flipping];
      for (const col of [0, 1, 2, 3] as const) {
        const want = target[col];
        let s = "";
        for (let i = 0; i < want.length || i < row[col].length; i++) {
          const settle = (i + col * 3) / 20;
          s += k > settle + 0.3 || want[i] === " " ? (want[i] ?? " ") : CH[Math.floor(Math.random() * CH.length)];
        }
        row[col] = s.trimEnd();
      }
      row[4] = target[4];
      if (k >= 1.6) {
        shown[flipping] = [...target] as Row;
        flipping = -1;
      }
      draw();
    }
  };
  return { group, update };
}

/** Jalur Gemilang on a pole, waving. */
export function jalurGemilang(x: number, z: number, phase = 0): Anim {
  const group = new THREE.Group();
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.07, 4.6, 8), flat(0xeeeeee));
  pole.position.y = 2.3;
  const knob = new THREE.Mesh(new THREE.SphereGeometry(0.09,20,14), flat(0xd4af37));
  knob.position.y = 4.65;
  group.add(pole, knob);
  const tex = canvasTexture(280, 140, (c) => {
    for (let i = 0; i < 14; i++) {
      c.fillStyle = i % 2 ? "#ffffff" : "#cc0001";
      c.fillRect(0, i * 10, 280, 10);
    }
    c.fillStyle = "#010066";
    c.fillRect(0, 0, 140, 80);
    c.fillStyle = "#ffcc00";
    c.beginPath();
    c.arc(52, 40, 28, 0, Math.PI * 2);
    c.fill();
    c.fillStyle = "#010066";
    c.beginPath();
    c.arc(61, 40, 24, 0, Math.PI * 2);
    c.fill();
    c.fillStyle = "#ffcc00";
    c.beginPath();
    for (let i = 0; i < 28; i++) {
      const a = (i / 28) * Math.PI * 2 - Math.PI / 2;
      const r = i % 2 ? 9 : 24;
      const px = 100 + Math.cos(a) * r;
      const py = 40 + Math.sin(a) * r;
      if (i) c.lineTo(px, py);
      else c.moveTo(px, py);
    }
    c.fill();
  });
  const W = 2.0;
  const geo = new THREE.PlaneGeometry(W, 1.0, 14, 4);
  geo.translate(W / 2, 0, 0);
  const base = Float32Array.from(geo.attributes.position.array as Float32Array);
  const flag = new THREE.Mesh(geo, new THREE.MeshLambertMaterial({ map: tex, side: THREE.DoubleSide }));
  flag.position.set(0.05, 3.95, 0);
  flag.castShadow = true;
  group.add(flag);
  shadowed(pole);
  group.position.set(x, 0, z);
  const pos = geo.attributes.position;
  const update = (t: number) => {
    for (let i = 0; i < pos.count; i++) {
      const bx = base[i * 3];
      const by = base[i * 3 + 1];
      const k = bx / W;
      pos.setZ(i, Math.sin(bx * 2.6 - t * 5.5 + phase) * 0.16 * k + Math.sin(by * 3 - t * 3) * 0.03 * k);
      pos.setY(i, by - k * k * 0.12);
    }
    pos.needsUpdate = true;
    geo.computeVertexNormals();
  };
  return { group, update };
}

/** A nest of luggage trolleys. */
export function trolleys(x: number, z: number, n = 5) {
  const g = new THREE.Group();
  const steel = flat(0xb5bcc6);
  const red = flat(0xd6282f);
  for (let i = 0; i < n; i++) {
    const t = new THREE.Group();
    const deck = new THREE.Mesh(roundedBox(0.5, 0.05, 0.85), steel);
    deck.position.y = 0.32;
    const back = new THREE.Mesh(roundedBox(0.5, 0.75, 0.04), steel);
    back.position.set(0, 0.7, -0.4);
    back.rotation.x = -0.15;
    const handle = new THREE.Mesh(roundedBox(0.56, 0.07, 0.07), red);
    handle.position.set(0, 1.1, -0.47);
    t.add(deck, back, handle);
    for (const [wx, wz] of [[-0.2, 0.35], [0.2, 0.35], [-0.2, -0.35], [0.2, -0.35]]) {
      const w = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.05, 8), flat(0x2a2a30));
      w.rotation.z = Math.PI / 2;
      w.position.set(wx, 0.08, wz);
      t.add(w);
    }
    t.position.set(x + i * 0.28, 0, z);
    t.rotation.y = Math.PI / 2;
    g.add(t);
  }
  return shadowed(g);
}

/** Airport taxi, sedan with a roof sign. */
export function taxi(x: number, z: number, rotY: number, body: number, lower: number) {
  const g = new THREE.Group();
  const top = flat(body);
  const bottom = new THREE.Mesh(roundedBox(1.75, 0.5, 3.8), flat(lower));
  bottom.position.y = 0.52;
  const mid = new THREE.Mesh(roundedBox(1.78, 0.28, 3.8), top);
  mid.position.y = 0.9;
  const cabin = new THREE.Mesh(roundedBox(1.6, 0.55, 1.9), top);
  cabin.position.set(0, 1.32, -0.15);
  const glass = new THREE.Mesh(roundedBox(1.64, 0.36, 1.7), flat(0x2f4258));
  glass.position.set(0, 1.34, -0.15);
  const sign = new THREE.Mesh(
    roundedBox(0.75, 0.25, 0.3),
    [flat(0xffcb05), flat(0xffcb05), flat(0xffcb05), flat(0xffcb05), new THREE.MeshBasicMaterial({ map: signTexture("TEKSI", "#ffcb05", INK, 256, 86, "bold 56px 'Bagel Fat One', sans-serif") }), flat(0xffcb05)],
  );
  sign.position.set(0, 1.72, -0.15);
  sign.rotation.y = Math.PI / 2;
  g.add(bottom, mid, cabin, glass, sign);
  for (const [wx, wz] of [[-0.85, 1.2], [0.85, 1.2], [-0.85, -1.25], [0.85, -1.25]]) {
    const w = new THREE.Mesh(new THREE.CylinderGeometry(0.33, 0.33, 0.25, 10), flat(0x1c1c22));
    w.rotation.z = Math.PI / 2;
    w.position.set(wx, 0.33, wz);
    g.add(w);
  }
  for (const hx of [-0.55, 0.55]) {
    const hl = new THREE.Mesh(roundedBox(0.35, 0.16, 0.05), new THREE.MeshBasicMaterial({ color: 0xfff6cf }));
    hl.position.set(hx, 0.75, 1.91);
    g.add(hl);
  }
  g.position.set(x, 0, z);
  g.rotation.y = rotY;
  return shadowed(g);
}

/** Big chunky K L I A blocks, standing on the terminal roof. */
export function kliaLetters(x: number, y: number, z: number, scale = 1) {
  const g = new THREE.Group();
  const colors = ["#e3350d", "#ffcb05", "#3b6fe0", "#3fae5a"];
  "KLIA".split("").forEach((ch, i) => {
    const tex = canvasTexture(128, 128, (c) => {
      c.fillStyle = colors[i];
      c.fillRect(0, 0, 128, 128);
      c.fillStyle = "#fffdf6";
      c.font = "bold 104px 'Bagel Fat One', sans-serif";
      c.textAlign = "center";
      c.textBaseline = "middle";
      c.fillText(ch, 64, 72);
    });
    const plain = new THREE.MeshLambertMaterial({ color: new THREE.Color(colors[i]) });
    const face = new THREE.MeshLambertMaterial({ map: tex });
    const b = new THREE.Mesh(roundedBox(1.35, 1.35, 1.35), [plain, plain, face, plain, face, plain]);
    b.position.set(-2.4 + i * 1.6, 0.675 + (i % 2) * 0.12, 0);
    b.rotation.y = (i - 1.5) * 0.08;
    g.add(b);
  });
  g.position.set(x, y, z);
  g.scale.setScalar(scale);
  return shadowed(g);
}

// ---------------------------------------------------------------- Apron vehicles

/** Babah's plane on stand 8. Engine cowl open until he gets his tools back; then it closes, the fan idles
 * and the beacon comes on. `fixed` is read every frame so the change shows the moment he finishes. */
export function babahPlane(x: number, z: number, fixed: () => boolean): Anim & { boxes: [number, number, number, number][] } {
  const plane = airliner(LIVERY.babah);
  const group = plane.group;
  group.position.set(x, 0, z);
  const e = plane.nearEngine;
  // Engine guts showing under the open cowl.
  const gutsTex = canvasTexture(128, 64, (c) => {
    c.fillStyle = "#b8743a";
    c.fillRect(0, 0, 128, 64);
    c.strokeStyle = "#ffd27a";
    c.lineWidth = 4;
    for (let i = 0; i < 6; i++) {
      c.beginPath();
      c.moveTo(0, 8 + i * 10);
      c.bezierCurveTo(40, 2 + i * 12, 80, 20 + i * 6, 128, 6 + i * 10);
      c.stroke();
    }
    c.fillStyle = "#3a3a40";
    for (let i = 0; i < 5; i++) c.fillRect(10 + i * 24, 26, 10, 12);
  });
  const guts = new THREE.Mesh(new THREE.CylinderGeometry(0.43, 0.36, 1.3, 16, 1, true, -Math.PI / 2, Math.PI), new THREE.MeshLambertMaterial({ map: gutsTex, side: THREE.DoubleSide }));
  guts.rotation.z = -Math.PI / 2;
  guts.position.x = -0.05;
  const hinge = new THREE.Group();
  hinge.position.y = 0.46;
  const cowl = new THREE.Mesh(
    new THREE.CylinderGeometry(0.46, 0.38, 1.25, 16, 1, true, -Math.PI / 2, Math.PI),
    new THREE.MeshLambertMaterial({ color: LIVERY.babah.nacelle, side: THREE.DoubleSide }),
  );
  cowl.rotation.z = -Math.PI / 2;
  cowl.position.set(-0.05, -0.46, 0);
  cowl.castShadow = true;
  hinge.add(cowl);
  e.add(guts, hinge);

  const extras = new THREE.Group();
  group.add(extras);
  // A-frame ladder at the engine and Babah's toolbox.
  const ladder = new THREE.Group();
  const yellow = flat(0xf2c230);
  for (const s of [-1, 1]) {
    ladder.add(rod(v3(-0.3, 0, 0.5 * s), v3(0, 1.6, 0.18 * s), 0.035, yellow));
    ladder.add(rod(v3(0.3, 0, 0.5 * s), v3(0, 1.6, 0.18 * s), 0.035, yellow));
  }
  for (let i = 1; i < 5; i++) {
    const k = i / 5;
    const zz = 0.5 - 0.32 * k;
    ladder.add(rod(v3(-0.3 + 0.3 * k, 1.6 * k, -zz), v3(-0.3 + 0.3 * k, 1.6 * k, zz), 0.025, yellow));
  }
  ladder.position.set(1.0, 0, 2.75);
  ladder.rotation.y = Math.PI / 2;
  extras.add(ladder);
  const box = new THREE.Group();
  const red = flat(0xc8282f);
  const tb = new THREE.Mesh(roundedBox(0.75, 0.38, 0.4), red);
  tb.position.y = 0.19;
  const lid = new THREE.Mesh(roundedBox(0.75, 0.05, 0.4), red);
  lid.position.set(0, 0.48, -0.26);
  lid.rotation.x = -1.2;
  const handle = new THREE.Mesh(roundedBox(0.4, 0.05, 0.05), flat(0x2a2a30));
  handle.position.set(0, 0.42, 0);
  box.add(tb, lid, handle);
  box.position.set(2.5, 0, 3.3);
  box.rotation.y = 0.3;
  group.add(box);
  // Cones and wheel chocks.
  const coneMat = flat(0xff6a1a);
  const stripe = flat(0xffffff);
  for (const [cx, cz] of [[6.3, 0.4], [-3.0, 5.2], [-6.6, 0], [-3.0, -5.2]] as const) {
    const c = new THREE.Mesh(new THREE.ConeGeometry(0.22, 0.6, 10), coneMat);
    c.position.set(cx, 0.3, cz);
    const s = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.15, 0.08, 10), stripe);
    s.position.set(cx, 0.33, cz);
    group.add(c, s);
  }
  for (const [cx, cz] of [[3.5, 0.32], [-0.35, 1.1], [-0.35, -1.1]] as const) {
    const ch = new THREE.Mesh(roundedBox(0.22, 0.14, 0.3), yellow);
    ch.position.set(cx + 0.3, 0.07, cz);
    group.add(ch);
  }
  shadowed(extras);
  shadowed(box);

  // Sparks while Babah works on the engine.
  const sparkTex = radial("rgba(255,240,170,1)", "rgba(255,200,80,0)");
  const sparks = Array.from({ length: 6 }, () => {
    const s = glowSprite(sparkTex, 0xffffff, 0.22);
    s.visible = false;
    group.add(s);
    return { s, vx: 0, vy: 0, vz: 0, life: 0 };
  });
  const enginePos = v3(1.3, FY - 0.95, 1.75 + 0.3);
  let nextBurst = 1.5;
  let open = fixed() ? 0 : 1;
  const tick = ticker();
  const update = (t: number) => {
    const dt = tick(t);
    const done = fixed();
    open += ((done ? 0 : 1) - open) * Math.min(1, dt * 2.5);
    hinge.rotation.x = -1.9 * open;
    guts.visible = open > 0.02;
    ladder.visible = !done;
    plane.fans[0].rotation.x += dt * (done ? 3 : 0);
    plane.fans[1].rotation.x += dt * (done ? 3 : 0);
    plane.lights(t, done);
    if (!done && t > nextBurst) {
      nextBurst = t + 1.6 + Math.random() * 1.6;
      for (const p of sparks) {
        p.life = 0.5 + Math.random() * 0.3;
        p.vx = (Math.random() - 0.3) * 1.6;
        p.vy = 1 + Math.random() * 1.6;
        p.vz = 0.6 + Math.random() * 1.2;
        p.s.position.copy(enginePos);
        p.s.visible = true;
      }
    }
    for (const p of sparks) {
      if (p.life <= 0) continue;
      p.life -= dt;
      p.vy -= dt * 6;
      p.s.position.x += p.vx * dt;
      p.s.position.y = Math.max(0.05, p.s.position.y + p.vy * dt);
      p.s.position.z += p.vz * dt;
      p.s.material.opacity = Math.min(1, p.life * 3);
      if (p.life <= 0) p.s.visible = false;
    }
  };
  const boxes: [number, number, number, number][] = [
    [x - 6.2, z - 0.9, x + 5.5, z + 0.9],
    [x - 3.0, z + 0.9, x + 0.9, z + 4.5],
    [x + 0.5, z + 1.2, x + 2.1, z + 2.3],
    [x + 2.1, z + 3.0, x + 2.9, z + 3.6],
  ];
  return { group, update, boxes };
}

/** Passenger stairs truck parked at the forward door. */
export function stairsTruck(x: number, z: number) {
  const g = new THREE.Group();
  const white = flat(0xf2f0ea);
  const yellow = flat(0xf2c230);
  const chassis = new THREE.Mesh(roundedBox(1.5, 0.45, 3.4), white);
  chassis.position.set(0, 0.5, 1.5);
  const cab = new THREE.Mesh(roundedBox(1.5, 0.8, 0.9), white);
  cab.position.set(0, 0.95, 3.0);
  const glass = new THREE.Mesh(roundedBox(1.52, 0.35, 0.7), flat(0x2f4258));
  glass.position.set(0, 1.12, 3.0);
  g.add(chassis, cab, glass);
  const steps = 7;
  for (let i = 0; i < steps; i++) {
    const k = i / steps;
    const st = new THREE.Mesh(roundedBox(1.1, 0.08, 0.36), flat(0x8a8f96));
    st.position.set(0, 0.8 + k * 1.05, 2.3 - k * 2.0);
    g.add(st);
  }
  const top = new THREE.Mesh(roundedBox(1.2, 0.08, 0.7), flat(0x8a8f96));
  top.position.set(0, 1.9, 0.05);
  g.add(top);
  for (const s of [-0.6, 0.6]) {
    g.add(rod(v3(s, 1.5, 2.4), v3(s, 2.55, 0.25), 0.04, yellow));
    g.add(rod(v3(s, 2.55, 0.25), v3(s, 2.55, -0.3), 0.04, yellow));
    g.add(rod(v3(s, 0.8, 2.4), v3(s, 1.5, 2.4), 0.04, yellow));
    const side = new THREE.Mesh(roundedBox(0.06, 0.5, 2.4), white);
    side.position.set(s, 1.15, 1.25);
    side.rotation.x = 0.48;
    g.add(side);
  }
  for (const [wx, wz] of [[-0.75, 0.6], [0.75, 0.6], [-0.75, 2.9], [0.75, 2.9]]) {
    const w = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 0.2, 10), flat(0x1c1c22));
    w.rotation.z = Math.PI / 2;
    w.position.set(wx, 0.28, wz);
    g.add(w);
  }
  g.position.set(x, 0, z);
  return shadowed(g);
}

/** Fuel bowser parked by the tail. */
export function fuelTruck(x: number, z: number, rotY = 0) {
  const g = new THREE.Group();
  const white = flat(0xf2f0ea);
  const cab = new THREE.Mesh(roundedBox(1.4, 1.1, 1.3), white);
  cab.position.set(0, 0.95, 1.9);
  const glass = new THREE.Mesh(roundedBox(1.42, 0.45, 0.9), flat(0x2f4258));
  glass.position.set(0, 1.2, 2.1);
  const bed = new THREE.Mesh(roundedBox(1.4, 0.3, 3.0), flat(0x5e6670));
  bed.position.set(0, 0.5, -0.4);
  const tank = new THREE.Mesh(new THREE.CylinderGeometry(0.72, 0.72, 2.9, 14), new THREE.MeshLambertMaterial({ color: 0xe8e4da }));
  tank.rotation.x = Math.PI / 2;
  tank.position.set(0, 1.35, -0.4);
  const band = new THREE.Mesh(new THREE.CylinderGeometry(0.735, 0.735, 0.4, 14), flat(0xd6282f));
  band.rotation.x = Math.PI / 2;
  band.position.set(0, 1.35, -0.4);
  g.add(cab, glass, bed, tank, band);
  for (const [wx, wz] of [[-0.72, 1.9], [0.72, 1.9], [-0.72, -1.2], [0.72, -1.2]]) {
    const w = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.34, 0.22, 10), flat(0x1c1c22));
    w.rotation.z = Math.PI / 2;
    w.position.set(wx, 0.34, wz);
    g.add(w);
  }
  g.position.set(x, 0, z);
  g.rotation.y = rotY;
  return shadowed(g);
}

/** Baggage tug pulling three carts of colourful suitcases round a loop behind the plane. */
export function bagTrain(x0: number, x1: number, zc: number, r = 0.8): Anim {
  const group = new THREE.Group();
  const straight = x1 - x0;
  const total = straight * 2 + Math.PI * r * 2;
  /** Point and heading at distance s round the loop (clockwise seen from above: +x along the near lane). */
  const at = (s: number): [number, number, number] => {
    s = ((s % total) + total) % total;
    if (s < straight) return [x0 + s, zc + r, 0];
    s -= straight;
    if (s < Math.PI * r) {
      const a = s / r;
      return [x1 + Math.sin(a) * r, zc + Math.cos(a) * r, a];
    }
    s -= Math.PI * r;
    if (s < straight) return [x1 - s, zc - r, Math.PI];
    s -= straight;
    const a = s / r;
    return [x0 - Math.sin(a) * r, zc - Math.cos(a) * r, Math.PI + a];
  };
  const tug = new THREE.Group();
  const yel = flat(0xf2c230);
  const tBody = new THREE.Mesh(roundedBox(1.2, 0.5, 0.9), yel);
  tBody.position.y = 0.42;
  const tCab = new THREE.Mesh(roundedBox(0.5, 0.5, 0.86), flat(0x2f4258));
  tCab.position.set(-0.2, 0.92, 0);
  const tRoof = new THREE.Mesh(roundedBox(0.62, 0.06, 0.95), yel);
  tRoof.position.set(-0.2, 1.2, 0);
  const beacon = new THREE.Mesh(new THREE.SphereGeometry(0.07,20,14), new THREE.MeshBasicMaterial({ color: 0xffa020 }));
  beacon.position.set(-0.2, 1.28, 0);
  tug.add(tBody, tCab, tRoof, beacon);
  const wheels = (o: THREE.Group, len: number) => {
    for (const [wx, wz] of [[-len, 0.42], [len, 0.42], [-len, -0.42], [len, -0.42]]) {
      const w = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.17, 0.12, 8), flat(0x1c1c22));
      w.rotation.x = Math.PI / 2;
      w.position.set(wx, 0.17, wz);
      o.add(w);
    }
  };
  wheels(tug, 0.4);
  const bagColors = [0xff8fb1, 0x3b6fe0, 0xffcb05, 0x3fae5a, 0x9b6ad6, 0xe3350d, 0x2a2730, 0xf2f0ea];
  const carts = Array.from({ length: 3 }, (_, ci) => {
    const c = new THREE.Group();
    const deck = new THREE.Mesh(roundedBox(1.2, 0.08, 0.85), flat(0x8a8f96));
    deck.position.y = 0.36;
    c.add(deck);
    for (let i = 0; i < 5; i++) {
      const h = 0.25 + ((i + ci) % 3) * 0.08;
      const bag = new THREE.Mesh(roundedBox(0.34, h, 0.5), flat(bagColors[(i * 3 + ci * 2) % bagColors.length]));
      bag.position.set(-0.4 + (i % 3) * 0.4, 0.4 + h / 2 + (i > 2 ? 0.3 : 0), i > 2 ? 0 : (i % 2 ? 0.12 : -0.12));
      bag.rotation.y = (i - 2) * 0.12;
      c.add(bag);
    }
    wheels(c, 0.4);
    group.add(c);
    return c;
  });
  group.add(tug);
  shadowed(group);
  const SPEED = 2.4;
  const update = (t: number) => {
    const s = t * SPEED;
    const [x, z, a] = at(s);
    tug.position.set(x, 0, z);
    tug.rotation.y = a;
    carts.forEach((c, i) => {
      const [cx, cz, ca] = at(s - 1.45 - i * 1.45);
      c.position.set(cx, 0, cz);
      c.rotation.y = ca;
    });
    beacon.visible = t % 0.8 < 0.4;
  };
  return { group, update };
}

// ---------------------------------------------------------------- People

/** Passengers wheeling their bags along the terminal front, turning round at the ends. */
export async function passengers(lanes: { x0: number; x1: number; z: number; look: PersonLook; speed: number; phase: number }[]): Promise<Anim> {
  const group = new THREE.Group();
  const list = await Promise.all(
    lanes.map(async (l) => {
      const { group: g, pivot } = await paperStandee(passengerDoodle(l.look), l.look.kid ? 1.35 : 1.85);
      g.position.set(l.x0, 0, l.z);
      group.add(g);
      return { g, pivot, l };
    }),
  );
  const update = (t: number) => {
    for (const { g, pivot, l } of list) {
      const span = l.x1 - l.x0;
      const d = (t * l.speed + l.phase * span) % (span * 2);
      const forward = d < span;
      g.position.x = l.x0 + (forward ? d : span * 2 - d);
      pivot.scale.x = forward ? 1 : -1;
      g.position.y = Math.abs(Math.sin(t * 7 + l.phase * 5)) * 0.06;
      pivot.rotation.z = Math.sin(t * 7 + l.phase * 5) * 0.04;
    }
  };
  return { group, update };
}


/** Yellow "!" bubble over someone with something to say. */
export function bangMarker(x: number, y: number, z: number, show: () => boolean) {
  const tex = canvasTexture(64, 64, (c) => {
    c.fillStyle = "#ffcb05";
    c.beginPath();
    c.arc(32, 32, 28, 0, Math.PI * 2);
    c.fill();
    c.lineWidth = 5;
    c.strokeStyle = INK;
    c.stroke();
    c.fillStyle = INK;
    c.font = "bold 40px 'Bagel Fat One', sans-serif";
    c.textAlign = "center";
    c.textBaseline = "middle";
    c.fillText("!", 32, 35);
  });
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, depthTest: false }));
  s.scale.setScalar(0.7);
  s.renderOrder = 5;
  s.position.set(x, y, z);
  const update = (t: number) => {
    s.visible = show();
    s.position.y = y + Math.abs(Math.sin(t * 4)) * 0.18;
  };
  return { sprite: s, update };
}
