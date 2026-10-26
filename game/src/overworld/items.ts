import * as THREE from "three";
import type { Pickup } from "./zone";

// Collectibles Qish gathers in each zone before the way on (or the boss) opens.
// Drawn on canvas in the same black-marker doodle style as the characters, so the
// same picture works as the floating pickup and as the HUD icon.

export type ItemKind = "cookie" | "spanner" | "film" | "request" | "lily" | "kentut" | "resit" | "strip" | "pass";

const INK = "#17151f";

function wobblyCircle(g: CanvasRenderingContext2D, cx: number, cy: number, r: number) {
  g.beginPath();
  for (let i = 0; i <= 28; i++) {
    const a = (i / 28) * Math.PI * 2;
    const rr = r * (1 + Math.sin(i * 2.7) * 0.03);
    const x = cx + Math.cos(a) * rr;
    const y = cy + Math.sin(a) * rr;
    if (i) g.lineTo(x, y);
    else g.moveTo(x, y);
  }
  g.closePath();
}

const DRAW: Record<ItemKind, (g: CanvasRenderingContext2D, s: number) => void> = {
  spanner: (g, s) => drawSpanner(g, s),
  film: (g, s) => drawFilm(g, s),
  request: (g, s) => drawRequest(g, s),
  lily: (g, s) => drawLily(g, s),
  kentut: (g, s) => drawKentut(g, s),
  resit: (g, s) => drawResit(g, s),
  strip: (g, s) => drawStrip(g, s),
  pass: (g, s) => drawPass(g, s),
  /** Bowat's chocolate-chip cookie, with a bite out of it. */
  cookie(g, s) {
    const c = s / 2;
    const r = s * 0.38;
    const bites: [number, number, number][] = [
      [c + r * 0.92, c - r * 0.55, r * 0.3],
      [c + r * 0.55, c - r * 0.92, r * 0.24],
    ];
    g.save();
    wobblyCircle(g, c, c, r);
    g.fillStyle = "#e0a352";
    g.fill();
    g.clip();
    g.fillStyle = "rgba(255,226,160,.6)";
    g.beginPath();
    g.ellipse(c - r * 0.25, c - r * 0.25, r * 0.5, r * 0.3, -0.6, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = "#4a2a17";
    for (const [dx, dy, k] of [[-0.4, -0.05, 1], [0.15, -0.3, 0.9], [0.4, 0.25, 1.1], [-0.1, 0.42, 0.85], [-0.5, 0.38, 0.7], [0.05, 0.08, 0.95], [-0.25, -0.5, 0.8]]) {
      g.beginPath();
      g.ellipse(c + dx * r, c + dy * r, r * 0.12 * k, r * 0.095 * k, dx * 2, 0, Math.PI * 2);
      g.fill();
    }
    g.restore();
    g.lineWidth = s * 0.05;
    g.lineJoin = "round";
    g.strokeStyle = INK;
    wobblyCircle(g, c, c, r);
    g.stroke();
    // The bite: cut it out, then ink its edge.
    g.globalCompositeOperation = "destination-out";
    for (const [x, y, br] of bites) {
      g.beginPath();
      g.arc(x, y, br, 0, Math.PI * 2);
      g.fill();
    }
    g.globalCompositeOperation = "source-over";
    g.save();
    wobblyCircle(g, c, c, r);
    g.clip();
    for (const [x, y, br] of bites) {
      g.beginPath();
      g.arc(x, y, br, 0, Math.PI * 2);
      g.stroke();
    }
    g.restore();
  },
};

/** One of Bowat's green fart clouds (Bukit Bintang), with stink squiggles and a little spray mist. */
function drawKentut(g: CanvasRenderingContext2D, s: number) {
  const k = s / 128;
  const puffs: [number, number, number][] = [[64, 66, 30], [40, 74, 22], [88, 76, 22], [62, 42, 22], [84, 52, 17], [44, 52, 16]];
  g.lineJoin = "round";
  g.fillStyle = INK;
  for (const [x, y, r] of puffs) {
    g.beginPath();
    g.arc(x * k, y * k, (r + 4) * k, 0, Math.PI * 2);
    g.fill();
  }
  g.fillStyle = "#a6d65a";
  for (const [x, y, r] of puffs) {
    g.beginPath();
    g.arc(x * k, y * k, r * k, 0, Math.PI * 2);
    g.fill();
  }
  g.fillStyle = "#d6f29a";
  g.beginPath();
  g.ellipse(52 * k, 52 * k, 11 * k, 8 * k, -0.5, 0, Math.PI * 2);
  g.fill();
  g.strokeStyle = "#3f6b1c";
  g.lineWidth = 4 * k;
  g.lineCap = "round";
  for (const sx of [46, 64, 82]) {
    g.beginPath();
    g.moveTo(sx * k, 70 * k);
    g.quadraticCurveTo((sx + 7) * k, 78 * k, sx * k, 86 * k);
    g.quadraticCurveTo((sx - 7) * k, 94 * k, sx * k, 102 * k);
    g.stroke();
  }
}

/** One of Bolat's song request slips: a folded note with a heart and "REQ ♪" scrawled on it. */
/** A pink water lily in bloom on its pad, picked from the middle of Tasik Lily. */
function drawLily(g: CanvasRenderingContext2D, s: number) {
  const k = s / 128;
  g.save();
  g.scale(k, k);
  g.translate(64, 70);
  g.lineJoin = "round";
  g.lineCap = "round";
  g.strokeStyle = INK;
  g.lineWidth = 5;
  // The pad, with its notch.
  g.fillStyle = "#5fae4a";
  g.beginPath();
  g.ellipse(0, 22, 52, 24, 0, 0.22, Math.PI * 2 - 0.22 + Math.PI * 0);
  g.lineTo(0, 22);
  g.closePath();
  g.fill();
  g.stroke();
  g.strokeStyle = "rgba(23,21,31,.35)";
  g.lineWidth = 2.5;
  for (const a of [2.2, 2.9, 3.6, 4.3]) {
    g.beginPath();
    g.moveTo(0, 22);
    g.lineTo(Math.cos(a) * 44, 22 + Math.sin(a) * 19);
    g.stroke();
  }
  // Petals: an outer ring of soft pink, an inner ring of hot pink, pointed like a star.
  const petal = (a: number, len: number, w: number, fill: string) => {
    g.save();
    g.rotate(a);
    g.fillStyle = fill;
    g.beginPath();
    g.moveTo(0, 0);
    g.quadraticCurveTo(w, -len * 0.5, 0, -len);
    g.quadraticCurveTo(-w, -len * 0.5, 0, 0);
    g.fill();
    g.stroke();
    g.restore();
  };
  g.strokeStyle = INK;
  g.lineWidth = 4;
  g.translate(0, 4);
  g.scale(1, 0.82);
  for (let i = 0; i < 8; i++) petal(-1.3 + (i / 7) * 2.6 + (i % 2 ? 0.05 : 0), 52, 15, "#ffc2da");
  for (let i = 0; i < 5; i++) petal(-0.8 + (i / 4) * 1.6, 44, 13, "#ff6fa6");
  g.fillStyle = "rgba(255,255,255,.55)";
  g.beginPath();
  g.ellipse(-8, -30, 4, 10, -0.2, 0, Math.PI * 2);
  g.fill();
  // Golden centre.
  g.fillStyle = "#ffcf3a";
  g.beginPath();
  g.ellipse(0, -6, 13, 9, 0, 0, Math.PI * 2);
  g.fill();
  g.stroke();
  g.fillStyle = "#e09a14";
  for (const [dx, dy] of [[-5, -8], [3, -9], [6, -4], [-2, -3]]) {
    g.beginPath();
    g.arc(dx, dy, 2, 0, Math.PI * 2);
    g.fill();
  }
  g.restore();
}

function drawRequest(g: CanvasRenderingContext2D, s: number) {
  const k = s / 128;
  g.save();
  g.scale(k, k);
  g.translate(64, 64);
  g.rotate(-0.12);
  g.lineJoin = "round";
  g.lineCap = "round";
  g.strokeStyle = INK;
  g.lineWidth = 6;
  // The paper, with its folded-down corner.
  g.fillStyle = "#fff6e0";
  g.beginPath();
  g.moveTo(-40, -46);
  g.lineTo(24, -46);
  g.lineTo(42, -28);
  g.lineTo(42, 46);
  g.lineTo(-40, 46);
  g.closePath();
  g.fill();
  g.stroke();
  g.fillStyle = "#e8d6b0";
  g.beginPath();
  g.moveTo(24, -46);
  g.lineTo(24, -28);
  g.lineTo(42, -28);
  g.closePath();
  g.fill();
  g.stroke();
  // Ruled lines.
  g.strokeStyle = "rgba(90,120,200,.45)";
  g.lineWidth = 3;
  for (const y of [-6, 10, 26]) {
    g.beginPath();
    g.moveTo(-30, y);
    g.lineTo(32, y);
    g.stroke();
  }
  g.fillStyle = "#ff5c93";
  g.font = "bold 22px 'Bagel Fat One', sans-serif";
  g.textAlign = "center";
  g.textBaseline = "middle";
  g.fillText("REQ ♪", -2, -26);
  // Big heart.
  g.beginPath();
  g.moveTo(0, 38);
  g.bezierCurveTo(-30, 18, -22, -6, 0, 8);
  g.bezierCurveTo(22, -6, 30, 18, 0, 38);
  g.fill();
  g.strokeStyle = INK;
  g.lineWidth = 4;
  g.stroke();
  g.restore();
}

/** Bolat ex's 35mm film roll: a yellow canister labelled BOLAT with a tail of film curling out. */
function drawFilm(g: CanvasRenderingContext2D, s: number) {
  const k = s / 128;
  g.save();
  g.scale(k, k);
  g.lineJoin = "round";
  g.lineCap = "round";
  g.strokeStyle = INK;
  g.lineWidth = 6;
  // Film tail first so the canister sits over it.
  g.save();
  g.translate(64, 70);
  g.beginPath();
  g.moveTo(14, -18);
  g.bezierCurveTo(46, -22, 60, 0, 50, 22);
  g.bezierCurveTo(44, 36, 26, 40, 16, 32);
  g.lineTo(18, 14);
  g.bezierCurveTo(30, 18, 36, 8, 30, -2);
  g.lineTo(14, -2);
  g.closePath();
  g.fillStyle = "#3a2a20";
  g.fill();
  g.stroke();
  g.fillStyle = "#f6e7c8";
  for (const [x, y] of [[24, -14], [36, -12], [44, -4], [46, 8], [42, 20], [32, 28]]) g.fillRect(x - 2.5, y - 2.5, 5, 5);
  g.restore();
  // Canister body, caps and label.
  g.fillStyle = "#2a2730";
  g.beginPath();
  g.roundRect(26, 20, 52, 10, 3);
  g.fill();
  g.stroke();
  g.beginPath();
  g.roundRect(30, 102, 44, 10, 3);
  g.fill();
  g.stroke();
  g.fillStyle = "#ffcb05";
  g.beginPath();
  g.roundRect(24, 28, 56, 76, 10);
  g.fill();
  g.stroke();
  g.fillStyle = "#e3350d";
  g.fillRect(27, 50, 50, 22);
  g.strokeRect(27, 50, 50, 22);
  g.fillStyle = "#fffdf6";
  g.font = "bold 15px 'Bagel Fat One', sans-serif";
  g.textAlign = "center";
  g.textBaseline = "middle";
  g.fillText("BOLAT", 52, 62);
  g.fillStyle = "rgba(255,255,255,.55)";
  g.fillRect(32, 34, 7, 64);
  // Spool knob on top.
  g.fillStyle = "#2a2730";
  g.beginPath();
  g.roundRect(44, 10, 16, 12, 3);
  g.fill();
  g.stroke();
  g.restore();
}

/** Babah's spanner: chrome, red rubber grip, his name scratched on the handle. */
function drawSpanner(g: CanvasRenderingContext2D, s: number) {
  const k = s / 128;
  g.save();
  g.translate(s / 2, s / 2);
  g.rotate(-Math.PI / 4);
  g.scale(k, k);
  g.lineWidth = 5;
  g.lineJoin = "round";
  g.strokeStyle = INK;
  // Handle with the grip.
  g.beginPath();
  g.roundRect(-9, -30, 18, 62, 6);
  g.fillStyle = "#c9ced6";
  g.fill();
  g.stroke();
  g.beginPath();
  g.roundRect(-11, 4, 22, 30, 8);
  g.fillStyle = "#e3350d";
  g.fill();
  g.stroke();
  // Open jaw on top, ring at the bottom.
  g.beginPath();
  g.moveTo(-10, -28);
  g.lineTo(-24, -44);
  g.lineTo(-22, -60);
  g.lineTo(-9, -60);
  g.lineTo(-7, -46);
  g.lineTo(7, -46);
  g.lineTo(9, -60);
  g.lineTo(22, -60);
  g.lineTo(24, -44);
  g.lineTo(10, -28);
  g.closePath();
  g.fillStyle = "#dfe3e8";
  g.fill();
  g.stroke();
  g.beginPath();
  g.arc(0, 46, 17, 0, Math.PI * 2);
  g.fillStyle = "#dfe3e8";
  g.fill();
  g.stroke();
  g.beginPath();
  g.arc(0, 46, 7, 0, Math.PI * 2);
  g.fillStyle = INK;
  g.fill();
  g.fillStyle = "rgba(255,255,255,.75)";
  g.fillRect(-4, -26, 4, 24);
  g.restore();
}

/** A long till receipt with a torn zigzag foot, Bowat's paw print, and a red BELUM BAYAR stamp (Nyomnyom City). */
function drawResit(g: CanvasRenderingContext2D, s: number) {
  const k = s / 128;
  g.save();
  g.scale(k, k);
  g.translate(64, 64);
  g.rotate(0.1);
  g.lineJoin = "round";
  g.lineCap = "round";
  g.strokeStyle = INK;
  g.lineWidth = 6;
  g.fillStyle = "#fffdf4";
  g.beginPath();
  g.moveTo(-28, -54);
  g.lineTo(28, -54);
  g.lineTo(28, 44);
  for (let i = 0; i < 7; i++) g.lineTo(28 - (i + 0.5) * 8, i % 2 ? 44 : 52);
  g.lineTo(-28, 44);
  g.closePath();
  g.fill();
  g.stroke();
  g.fillStyle = INK;
  g.font = "bold 15px 'Bagel Fat One', sans-serif";
  g.textAlign = "center";
  g.textBaseline = "middle";
  g.fillText("RESIT", 0, -40);
  g.fillStyle = "rgba(23,21,31,.5)";
  for (const [y, w] of [[-26, 40], [-17, 30], [-8, 36], [1, 26]] as const) g.fillRect(-20, y, w, 3.5);
  g.fillRect(-20, 14, 40, 3);
  g.font = "bold 13px 'Bagel Fat One', sans-serif";
  g.fillStyle = INK;
  g.fillText("RM ???", 0, 28);
  // Bowat's paw print.
  g.fillStyle = "#8a7a6a";
  g.beginPath();
  g.ellipse(14, -6, 7, 6, 0, 0, Math.PI * 2);
  for (const [dx, dy] of [[-6, -13], [1, -16], [8, -15]]) g.ellipse(14 + dx * 0.9, -6 + dy * 0.6, 2.6, 2.6, 0, 0, Math.PI * 2);
  g.fill();
  // The red stamp, slapped on crooked.
  g.save();
  g.rotate(-0.42);
  g.strokeStyle = "rgba(220,40,50,.9)";
  g.fillStyle = "rgba(220,40,50,.9)";
  g.lineWidth = 3.5;
  g.strokeRect(-32, -9, 64, 20);
  g.font = "bold 12px 'Bagel Fat One', sans-serif";
  g.fillText("BELUM BAYAR", 0, 2);
  g.restore();
  g.restore();
}

/** One of their photo strips, blown off Bolat ex's gallery: four frames of two doodled faces leaning
 * in, a wonky heart in the last, and a clothes peg still clipped on top (Lorong Photobooth). */
function drawStrip(g: CanvasRenderingContext2D, s: number) {
  const k = s / 128;
  g.save();
  g.scale(k, k);
  g.translate(64, 66);
  g.rotate(-0.16);
  g.lineJoin = "round";
  g.lineCap = "round";
  g.strokeStyle = INK;
  g.lineWidth = 5;
  g.fillStyle = "#fffdf6";
  g.beginPath();
  g.roundRect(-20, -56, 40, 112, 4);
  g.fill();
  g.stroke();
  const frames = ["#ffd1df", "#d9ccff", "#c8f0dc", "#ffe7b0"];
  frames.forEach((c, i) => {
    const y = -50 + i * 25;
    g.fillStyle = c;
    g.fillRect(-14, y, 28, 21);
    g.lineWidth = 2.5;
    if (i === 3) {
      g.fillStyle = "#ff4f8a";
      g.beginPath();
      g.moveTo(0, y + 18);
      g.bezierCurveTo(-12, y + 9, -7, y + 1, 0, y + 7);
      g.bezierCurveTo(7, y + 1, 12, y + 9, 0, y + 18);
      g.fill();
      g.stroke();
    } else {
      for (const fx of [-5, 5]) {
        g.fillStyle = "#f6d2b8";
        g.beginPath();
        g.arc(fx, y + 11 + (fx > 0 ? 1 : 0), 5, 0, Math.PI * 2);
        g.fill();
        g.stroke();
      }
    }
  });
  // The peg.
  g.lineWidth = 4;
  g.fillStyle = "#ff8fb1";
  g.beginPath();
  g.roundRect(-6, -66, 12, 22, 3);
  g.fill();
  g.stroke();
  g.restore();
}

/** A paddock pass on a lanyard: red strap, white card, ALL ACCESS band, a doodle face and a barcode. */
function drawPass(g: CanvasRenderingContext2D, s: number) {
  const k = s / 128;
  g.save();
  g.scale(k, k);
  g.lineJoin = "round";
  g.lineCap = "round";
  g.strokeStyle = INK;
  // Lanyard loop.
  g.lineWidth = 12;
  g.strokeStyle = "#e3350d";
  g.beginPath();
  g.moveTo(44, 46);
  g.quadraticCurveTo(30, 4, 64, 4);
  g.quadraticCurveTo(98, 4, 84, 46);
  g.stroke();
  g.lineWidth = 3;
  g.strokeStyle = "#fffdf6";
  g.setLineDash([6, 6]);
  g.stroke();
  g.setLineDash([]);
  g.translate(64, 80);
  g.rotate(0.08);
  g.strokeStyle = INK;
  g.lineWidth = 5;
  g.fillStyle = "#fffdf6";
  g.beginPath();
  g.roundRect(-30, -38, 60, 80, 7);
  g.fill();
  g.stroke();
  g.fillStyle = "#17151f";
  g.fillRect(-28, -36, 56, 18);
  g.fillStyle = "#ffcb05";
  g.font = "bold 13px 'Bagel Fat One', sans-serif";
  g.textAlign = "center";
  g.textBaseline = "middle";
  g.fillText("PADDOCK", 0, -27);
  // Face square.
  g.fillStyle = "#ffd1df";
  g.lineWidth = 3;
  g.beginPath();
  g.roundRect(-22, -12, 22, 24, 3);
  g.fill();
  g.stroke();
  g.fillStyle = "#5b4766";
  g.beginPath();
  g.arc(-11, -2, 8, Math.PI, 0);
  g.fill();
  // Barcode and the clip.
  g.fillStyle = INK;
  for (let i = 0; i < 9; i++) g.fillRect(4 + i * 2.6, -10 + (i % 3), i % 2 ? 1.2 : 2, 20);
  g.fillStyle = "#e3350d";
  g.fillRect(-28, 22, 56, 16);
  g.fillStyle = "#fffdf6";
  g.font = "bold 11px 'Bagel Fat One', sans-serif";
  g.fillText("ALL ACCESS", 0, 30);
  g.fillStyle = "#c9ccd2";
  g.beginPath();
  g.roundRect(-8, -48, 16, 14, 3);
  g.fill();
  g.stroke();
  g.restore();
}

const canvases = new Map<ItemKind, HTMLCanvasElement>();

function itemCanvas(kind: ItemKind) {
  let c = canvases.get(kind);
  if (!c) {
    c = document.createElement("canvas");
    c.width = c.height = 128;
    DRAW[kind](c.getContext("2d")!, 128);
    canvases.set(kind, c);
  }
  return c;
}

/** Data URL of the item picture, for the HUD. */
export const itemIcon = (kind: ItemKind) => itemCanvas(kind).toDataURL();

function radialTexture(inner: string, outer: string) {
  const c = document.createElement("canvas");
  c.width = c.height = 64;
  const g = c.getContext("2d")!;
  const grad = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  grad.addColorStop(0, inner);
  grad.addColorStop(1, outer);
  g.fillStyle = grad;
  g.fillRect(0, 0, 64, 64);
  return new THREE.CanvasTexture(c);
}

function beamTexture() {
  const c = document.createElement("canvas");
  c.width = 4;
  c.height = 64;
  const g = c.getContext("2d")!;
  const grad = g.createLinearGradient(0, 0, 0, 64);
  grad.addColorStop(0, "rgba(255,240,180,0)");
  grad.addColorStop(1, "rgba(255,240,180,1)");
  g.fillStyle = grad;
  g.fillRect(0, 0, 4, 64);
  return new THREE.CanvasTexture(c);
}

/** A floating, glowing pickup with a soft light beam so it can be spotted from across the zone. */
export function collectible(kind: ItemKind, phase = 0): Pickup {
  const group = new THREE.Group();
  const tex = new THREE.CanvasTexture(itemCanvas(kind));
  tex.colorSpace = THREE.SRGBColorSpace;
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex }));
  sprite.scale.setScalar(0.95);
  group.add(sprite);

  const glow = new THREE.Mesh(
    new THREE.PlaneGeometry(1.8, 1.8),
    new THREE.MeshBasicMaterial({ map: radialTexture("rgba(255,214,90,.9)", "rgba(255,214,90,0)"), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }),
  );
  glow.rotation.x = -Math.PI / 2;
  glow.position.y = 0.09;
  const shadow = new THREE.Mesh(
    new THREE.CircleGeometry(0.32, 16),
    new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.22, depthWrite: false }),
  );
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = 0.1;
  const beam = new THREE.Mesh(
    new THREE.CylinderGeometry(0.28, 0.42, 6, 12, 1, true),
    new THREE.MeshBasicMaterial({ map: beamTexture(), color: 0xffe9a0, transparent: true, opacity: 0.4, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide }),
  );
  beam.position.y = 3;
  group.add(glow, shadow, beam);

  const sparkTex = radialTexture("rgba(255,255,255,1)", "rgba(255,240,170,0)");
  const sparks = Array.from({ length: 4 }, () => {
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: sparkTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
    s.scale.setScalar(0.22);
    group.add(s);
    return s;
  });

  let popped = false;
  let popStart = -1;
  const update = (t: number) => {
    if (popped) {
      if (popStart < 0) popStart = t;
      const k = Math.min(1, (t - popStart) / 0.45);
      sprite.position.y += 0.06;
      sprite.scale.setScalar(0.95 + k * 0.9);
      sprite.material.opacity = 1 - k;
      sprite.material.rotation += 0.25;
      for (const m of [glow.material, beam.material]) m.opacity = (1 - k) * 0.4;
      shadow.visible = false;
      sparks.forEach((s, i) => {
        const a = (i / sparks.length) * Math.PI * 2;
        s.position.set(Math.cos(a) * (0.4 + k * 1.4), 1 + k * 1.2, Math.sin(a) * (0.4 + k * 1.4));
        s.material.opacity = 1 - k;
      });
      if (k >= 1) group.visible = false;
      return;
    }
    const bob = Math.sin(t * 2.4 + phase) * 0.14;
    sprite.position.y = 1.05 + bob;
    sprite.material.rotation = Math.sin(t * 1.7 + phase) * 0.18;
    shadow.scale.setScalar(1 - bob * 0.8);
    const pulse = 1 + Math.sin(t * 3 + phase) * 0.12;
    glow.scale.setScalar(pulse);
    beam.material.opacity = 0.3 + Math.sin(t * 2 + phase) * 0.08;
    sparks.forEach((s, i) => {
      const a = t * 1.6 + phase + (i / sparks.length) * Math.PI * 2;
      s.position.set(Math.cos(a) * 0.62, 1.05 + Math.sin(t * 3 + i) * 0.35, Math.sin(a) * 0.62);
      s.material.opacity = 0.5 + Math.sin(t * 5 + i * 1.7) * 0.5;
    });
  };
  return {
    group,
    update,
    pop() {
      popped = true;
    },
  };
}
