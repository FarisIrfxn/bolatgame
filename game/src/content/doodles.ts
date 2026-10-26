// Placeholder doodles drawn on canvas in the same black-marker style as Qish's drawings, for
// people who have no real art yet (Babah, airport passengers). Each returns a PNG data URL.

const INK = "#17151f";

export interface PersonLook {
  skin: string;
  top: string;
  bottom: string;
  hijab?: string;
  hair?: string;
  cap?: string;
  bag: string;
  backpack?: string;
  kid?: boolean;
  /** What's in the right hand (default: a suitcase, for the airport). */
  carry?: Carry;
  /** Stall vendors wear an apron in this colour. */
  apron?: string;
  /** A white kufi cap (over short hair), a short beard, and a checked sarong (longyi) for the bottom. */
  kufi?: string;
  beard?: boolean;
  sarong?: string;
  /** Fine-dining staff: a bow tie in this colour at the collar. */
  bowtie?: string;
  /** A tall white chef's toque. */
  chef?: boolean;
  /** A full-face race helmet in this colour, visor down (pit crew). */
  helmet?: string;
  /** A hi-vis vest in this colour over the top, with reflective stripes (marshals, parking). */
  vest?: string;
}

export type Carry =
  | "suitcase"
  | "bag"
  | "drink"
  | "candy"
  | "satay"
  | "phone"
  | "wrap"
  | "tray"
  | "bowl"
  | "cone"
  | "camera"
  | "strip"
  | "umbrella"
  | "flag"
  | "mic"
  | "baton"
  | "none";

function marker(c: CanvasRenderingContext2D, w = 5) {
  c.strokeStyle = INK;
  c.lineWidth = w;
  c.lineJoin = "round";
  c.lineCap = "round";
}

function blob(c: CanvasRenderingContext2D, draw: () => void, fill: string) {
  c.beginPath();
  draw();
  c.fillStyle = fill;
  c.fill();
  c.stroke();
}

/** Checked sarong pattern laid over an area that has just been filled (clipped to an ellipse). */
function checks(g: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, color: string) {
  g.save();
  g.beginPath();
  g.ellipse(x + w / 2, y + h / 2, w / 2 - 2, h / 2 - 2, 0, 0, Math.PI * 2);
  g.clip();
  g.fillStyle = color;
  for (let i = x; i < x + w; i += 18) g.fillRect(i, y, 7, h);
  for (let j = y; j < y + h; j += 14) g.fillRect(x, j, w, 5);
  g.restore();
}

/** A round knitted kufi sitting on top of the head (centred on (92, 80) like every head here). */
function kufiCap(g: CanvasRenderingContext2D, color: string) {
  blob(g, () => {
    g.moveTo(56, 58);
    g.quadraticCurveTo(58, 28, 92, 28);
    g.quadraticCurveTo(126, 28, 128, 58);
    g.quadraticCurveTo(92, 50, 56, 58);
  }, color);
  g.fillStyle = "rgba(0,0,0,.12)";
  for (let x = 66; x < 122; x += 10) g.fillRect(x, 40, 4, 10);
}

/** A short beard along the jaw. */
function beard(g: CanvasRenderingContext2D, color: string) {
  blob(g, () => {
    g.moveTo(58, 88);
    g.quadraticCurveTo(62, 126, 92, 126);
    g.quadraticCurveTo(122, 126, 126, 88);
    g.quadraticCurveTo(116, 112, 92, 112);
    g.quadraticCurveTo(68, 112, 58, 88);
  }, color);
}

/** A passenger in the same black-marker doodle style, wheeling a suitcase. Returns a data URL. */
/** A bow tie at the collar (centred under every head here). */
function bowTie(g: CanvasRenderingContext2D, color: string) {
  g.fillStyle = "#f7f4ee";
  g.beginPath();
  g.moveTo(74, 120);
  g.lineTo(92, 142);
  g.lineTo(110, 120);
  g.fill();
  blob(g, () => {
    g.moveTo(92, 128);
    g.lineTo(72, 118);
    g.lineTo(72, 140);
    g.closePath();
    g.moveTo(92, 128);
    g.lineTo(112, 118);
    g.lineTo(112, 140);
    g.closePath();
  }, color);
  blob(g, () => g.arc(92, 129, 5, 0, Math.PI * 2), color);
}

/** A tall, puffy white chef's toque sitting on the head. */
function toque(g: CanvasRenderingContext2D) {
  blob(g, () => g.roundRect(60, 30, 64, 26, 6), "#fbfaf6");
  blob(g, () => {
    g.moveTo(60, 36);
    g.bezierCurveTo(30, 20, 44, -24, 72, -6);
    g.bezierCurveTo(78, -34, 108, -34, 112, -6);
    g.bezierCurveTo(140, -24, 156, 20, 124, 36);
    g.closePath();
  }, "#fbfaf6");
}

export function passengerDoodle(p: PersonLook) {
  const c = document.createElement("canvas");
  c.width = 220;
  c.height = 360;
  const g = c.getContext("2d")!;
  const s = p.kid ? 0.72 : 1;
  g.translate(p.kid ? 30 : 0, p.kid ? 360 * 0.28 : 0);
  g.scale(s, s);
  marker(g);
  const carry = p.carry ?? "suitcase";
  if (carry === "suitcase") {
    // Suitcase behind, handle up to the hand.
    blob(g, () => g.roundRect(128, 214, 70, 104, 12), p.bag);
    g.beginPath();
    g.moveTo(150, 214);
    g.lineTo(146, 176);
    g.moveTo(176, 214);
    g.lineTo(172, 176);
    g.moveTo(140, 176);
    g.lineTo(178, 176);
    g.stroke();
    blob(g, () => g.arc(140, 326, 9, 0, Math.PI * 2), "#2a2a30");
    blob(g, () => g.arc(186, 326, 9, 0, Math.PI * 2), "#2a2a30");
    g.beginPath();
    g.moveTo(140, 250);
    g.lineTo(186, 250);
    g.stroke();
  }
  // Legs and shoes.
  blob(g, () => g.roundRect(62, 226, 26, 100, 10), p.bottom);
  blob(g, () => g.roundRect(94, 226, 26, 100, 10), p.bottom);
  blob(g, () => g.ellipse(72, 330, 20, 10, 0, 0, Math.PI * 2), "#2a2a30");
  blob(g, () => g.ellipse(110, 330, 20, 10, 0, 0, Math.PI * 2), "#2a2a30");
  if (p.backpack) blob(g, () => g.roundRect(34, 128, 34, 76, 12), p.backpack);
  // Body, arms.
  blob(g, () => g.roundRect(52, 118, 80, 118, 26), p.top);
  if (p.apron) blob(g, () => g.roundRect(60, 150, 64, 92, 10), p.apron);
  if (p.vest) hiVis(g, p.vest);
  if (p.bowtie) bowTie(g, p.bowtie);
  blob(g, () => g.roundRect(34, 128, 22, 86, 11), p.top);
  blob(g, () => g.roundRect(128, 128, 22, 52, 11), p.top);
  blob(g, () => g.arc(45, 220, 11, 0, Math.PI * 2), p.skin);
  blob(g, () => g.arc(146, 180, 11, 0, Math.PI * 2), p.skin);
  if (carry !== "suitcase" && carry !== "umbrella") drawCarry(g, carry, p.bag);
  drawHead(g, p);
  if (carry === "umbrella") umbrella(g, p.bag);
  return c.toDataURL();
}

/** A hi-vis vest over the top: open front, two reflective bands. */
function hiVis(g: CanvasRenderingContext2D, color: string) {
  blob(g, () => g.roundRect(58, 126, 68, 104, 18), color);
  g.fillStyle = "#eef0f2";
  for (const y of [168, 196]) g.fillRect(60, y, 64, 8);
  g.beginPath();
  g.moveTo(92, 128);
  g.lineTo(92, 228);
  g.stroke();
}

/** An umbrella held up over the head (drawn last, so the canopy sits over the hair). */
function umbrella(g: CanvasRenderingContext2D, color: string) {
  marker(g, 4);
  g.beginPath();
  g.moveTo(146, 186);
  g.lineTo(146, 30);
  g.stroke();
  blob(g, () => {
    g.moveTo(44, 50);
    g.quadraticCurveTo(52, 2, 128, 2);
    g.quadraticCurveTo(204, 2, 212, 50);
    for (let i = 0; i < 5; i++) g.quadraticCurveTo(212 - i * 33.6 - 16.8, 38, 212 - (i + 1) * 33.6, 50);
  }, color);
  g.strokeStyle = "rgba(0,0,0,.25)";
  g.lineWidth = 3;
  for (const x of [94, 128, 162]) {
    g.beginPath();
    g.moveTo(128, 4);
    g.lineTo(x, 46);
    g.stroke();
  }
  marker(g);
}

/** A visitor's head and smiling face, centred on (92, 80) like every person doodle here. */
function drawHead(g: CanvasRenderingContext2D, p: PersonLook) {
  if (p.helmet) {
    // Full-face helmet: no face to draw, just the visor.
    blob(g, () => g.ellipse(92, 78, 42, 46, 0, 0, Math.PI * 2), p.helmet);
    blob(g, () => g.roundRect(54, 62, 78, 28, 13), "#2b3245");
    g.strokeStyle = "rgba(255,255,255,.55)";
    g.lineWidth = 4;
    g.beginPath();
    g.moveTo(64, 70);
    g.lineTo(92, 70);
    g.stroke();
    marker(g);
    return;
  }
  if (p.hijab) {
    blob(g, () => {
      g.moveTo(40, 150);
      g.quadraticCurveTo(40, 30, 92, 28);
      g.quadraticCurveTo(144, 30, 144, 150);
      g.quadraticCurveTo(92, 168, 40, 150);
    }, p.hijab);
    blob(g, () => g.ellipse(92, 84, 33, 38, 0, 0, Math.PI * 2), p.skin);
  } else {
    blob(g, () => g.ellipse(92, 80, 38, 42, 0, 0, Math.PI * 2), p.skin);
    if (p.hair) blob(g, () => {
      g.moveTo(54, 78);
      g.quadraticCurveTo(56, 32, 92, 34);
      g.quadraticCurveTo(130, 32, 130, 78);
      g.quadraticCurveTo(116, 52, 92, 56);
      g.quadraticCurveTo(66, 52, 54, 78);
    }, p.hair);
    if (p.cap) {
      blob(g, () => {
        g.moveTo(52, 66);
        g.quadraticCurveTo(56, 26, 92, 28);
        g.quadraticCurveTo(128, 26, 132, 66);
        g.closePath();
      }, p.cap);
      blob(g, () => g.ellipse(120, 64, 30, 8, -0.1, 0, Math.PI * 2), p.cap);
    }
    if (p.kufi) kufiCap(g, p.kufi);
    if (p.beard) beard(g, p.hair ?? "#26222a");
    if (p.chef) toque(g);
  }
  // Face: dot eyes, small smile, blush.
  g.fillStyle = INK;
  for (const ex of [78, 106]) {
    g.beginPath();
    g.arc(ex, 82, 4.5, 0, Math.PI * 2);
    g.fill();
  }
  g.lineWidth = 4;
  g.beginPath();
  g.arc(92, 94, 9, 0.2, Math.PI - 0.2);
  g.stroke();
  g.fillStyle = "rgba(255,120,140,.35)";
  for (const ex of [70, 114]) {
    g.beginPath();
    g.ellipse(ex, 98, 7, 4, 0, 0, Math.PI * 2);
    g.fill();
  }
}

/** PLACEHOLDER Babah (until his real doodle): aircraft engineer in navy coveralls and a hi-vis vest,
 * ear defenders round his neck, spanner on his shoulder, thumbs up. */
export function babahDoodle() {
  const c = document.createElement("canvas");
  c.width = 240;
  c.height = 400;
  const g = c.getContext("2d")!;
  marker(g);
  const navy = "#2b3a67";
  const skin = "#d9a27a";
  // Boots and legs.
  blob(g, () => g.roundRect(70, 262, 32, 110, 10), navy);
  blob(g, () => g.roundRect(108, 262, 32, 110, 10), navy);
  blob(g, () => g.ellipse(82, 378, 26, 13, 0, 0, Math.PI * 2), "#2a2a30");
  blob(g, () => g.ellipse(130, 378, 26, 13, 0, 0, Math.PI * 2), "#2a2a30");
  // Coverall body, then the vest over it.
  blob(g, () => g.roundRect(56, 140, 100, 136, 28), navy);
  blob(g, () => {
    g.moveTo(62, 158);
    g.lineTo(92, 150);
    g.lineTo(106, 214);
    g.lineTo(120, 150);
    g.lineTo(150, 158);
    g.lineTo(150, 252);
    g.lineTo(62, 252);
    g.closePath();
  }, "#d7f23a");
  g.fillStyle = "#c9ced6";
  g.fillRect(64, 216, 84, 9);
  g.fillRect(64, 234, 84, 9);
  g.strokeRect(64, 216, 84, 9);
  g.strokeRect(64, 234, 84, 9);
  // Pocket pen and name badge.
  g.fillStyle = "#fffdf6";
  g.fillRect(120, 172, 22, 14);
  g.strokeRect(120, 172, 22, 14);
  // Left arm: thumbs up. Right arm: spanner resting on the shoulder.
  blob(g, () => g.roundRect(28, 150, 26, 74, 12), navy);
  blob(g, () => g.roundRect(18, 120, 24, 40, 10), skin);
  blob(g, () => g.roundRect(22, 98, 12, 28, 6), skin);
  blob(g, () => g.roundRect(156, 150, 26, 64, 12), navy);
  blob(g, () => g.arc(170, 132, 13, 0, Math.PI * 2), skin);
  g.save();
  g.translate(170, 132);
  g.rotate(-0.9);
  blob(g, () => g.roundRect(-8, -86, 16, 100, 6), "#b7bec8");
  blob(g, () => {
    g.arc(0, -96, 20, 0, Math.PI * 2);
  }, "#b7bec8");
  g.restore();
  // Ear defenders round the neck.
  g.lineWidth = 7;
  g.beginPath();
  g.arc(106, 146, 34, 0.1 * Math.PI, 0.9 * Math.PI);
  g.stroke();
  marker(g);
  blob(g, () => g.ellipse(70, 146, 13, 17, 0, 0, Math.PI * 2), "#e3350d");
  blob(g, () => g.ellipse(142, 146, 13, 17, 0, 0, Math.PI * 2), "#e3350d");
  // Head: neat hair going grey at the sides, moustache, kind eyes.
  blob(g, () => g.ellipse(106, 88, 42, 48, 0, 0, Math.PI * 2), skin);
  blob(g, () => {
    g.moveTo(64, 82);
    g.quadraticCurveTo(64, 34, 106, 36);
    g.quadraticCurveTo(148, 34, 148, 82);
    g.quadraticCurveTo(140, 58, 106, 60);
    g.quadraticCurveTo(72, 58, 64, 82);
  }, "#26222a");
  g.fillStyle = "#9a97a0";
  g.fillRect(64, 70, 7, 16);
  g.fillRect(141, 70, 7, 16);
  g.fillStyle = INK;
  g.lineWidth = 4;
  for (const ex of [90, 122]) {
    g.beginPath();
    g.arc(ex, 88, 7, Math.PI + 0.3, -0.3);
    g.stroke();
  }
  blob(g, () => {
    g.moveTo(86, 110);
    g.quadraticCurveTo(106, 98, 126, 110);
    g.quadraticCurveTo(106, 106, 86, 110);
  }, "#26222a");
  g.beginPath();
  g.arc(106, 114, 10, 0.25, Math.PI - 0.25);
  g.stroke();
  g.fillStyle = "rgba(255,120,140,.3)";
  for (const ex of [80, 132]) {
    g.beginPath();
    g.ellipse(ex, 104, 8, 5, 0, 0, Math.PI * 2);
    g.fill();
  }
  return c.toDataURL();
}

export const PASSENGER_LOOKS: PersonLook[] = [
  { skin: "#e8b48f", top: "#ff8fb1", bottom: "#3d4a7a", hijab: "#9b6ad6", bag: "#ffcb05" },
  { skin: "#c98c64", top: "#3fae5a", bottom: "#2a2730", cap: "#e3350d", hair: "#26222a", bag: "#3b6fe0", backpack: "#ffcb05" },
  { skin: "#f0c8a8", top: "#f2f0ea", bottom: "#6b5a8a", hair: "#7a4a2a", bag: "#e3350d" },
  { skin: "#d9a27a", top: "#ffcb05", bottom: "#3b6fe0", hair: "#26222a", bag: "#ff8fb1", kid: true },
  { skin: "#e3ad86", top: "#1f2f7a", bottom: "#9aa0aa", hijab: "#7dd3c0", bag: "#2a2730" },
];

/** The thing in a pasar malam visitor's right hand (hand at 146,180). */
function drawCarry(g: CanvasRenderingContext2D, carry: Carry, color: string) {
  marker(g, 4);
  if (carry === "bag") {
    // Plastic bag full of bundle clothes, hanging from the hand.
    g.beginPath();
    g.moveTo(134, 202);
    g.quadraticCurveTo(140, 176, 146, 180);
    g.moveTo(160, 202);
    g.quadraticCurveTo(154, 176, 146, 180);
    g.stroke();
    blob(g, () => {
      g.moveTo(126, 202);
      g.lineTo(168, 202);
      g.quadraticCurveTo(178, 250, 160, 268);
      g.lineTo(134, 268);
      g.quadraticCurveTo(116, 250, 126, 202);
    }, color);
  } else if (carry === "drink") {
    // Air balang in a plastic cup with a straw.
    blob(g, () => {
      g.moveTo(132, 150);
      g.lineTo(162, 150);
      g.lineTo(158, 192);
      g.lineTo(136, 192);
      g.closePath();
    }, color);
    g.fillStyle = "rgba(255,255,255,.45)";
    g.fillRect(138, 156, 6, 30);
    g.beginPath();
    g.moveTo(152, 150);
    g.lineTo(160, 122);
    g.stroke();
  } else if (carry === "candy") {
    g.beginPath();
    g.moveTo(146, 180);
    g.lineTo(158, 116);
    g.stroke();
    blob(g, () => {
      g.arc(150, 100, 18, 0, Math.PI * 2);
      g.moveTo(186, 96);
      g.arc(170, 96, 16, 0, Math.PI * 2);
      g.moveTo(178, 78);
      g.arc(160, 80, 18, 0, Math.PI * 2);
    }, color);
  } else if (carry === "satay") {
    for (const [dx, dy] of [[0, -60], [10, -56], [20, -50]]) {
      g.beginPath();
      g.moveTo(146, 180);
      g.lineTo(146 + dx + 8, 180 + dy);
      g.stroke();
      for (let k = 0; k < 3; k++) {
        const t = 0.45 + k * 0.17;
        blob(g, () => g.ellipse(146 + (dx + 8) * t, 180 + dy * t, 6, 8, 0, 0, Math.PI * 2), "#8a4a22");
      }
    }
  } else if (carry === "phone") {
    blob(g, () => g.roundRect(134, 150, 22, 36, 5), "#2a2a30");
    g.fillStyle = "#bfe3ff";
    g.fillRect(138, 155, 14, 24);
  } else if (carry === "camera") {
    // A little pastel digicam held up, lens out, wrist strap dangling.
    blob(g, () => g.roundRect(124, 150, 48, 30, 7), color);
    blob(g, () => g.arc(152, 165, 9, 0, Math.PI * 2), "#3a3442");
    g.fillStyle = "#bfe3ff";
    g.beginPath();
    g.arc(150, 163, 3, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = "#fffdf6";
    g.fillRect(129, 155, 9, 5);
    g.beginPath();
    g.moveTo(128, 180);
    g.quadraticCurveTo(122, 200, 134, 206);
    g.stroke();
  } else if (carry === "strip") {
    // A fresh photo strip pinched at the top, four little frames.
    blob(g, () => g.roundRect(138, 112, 22, 70, 3), "#fffdf6");
    ["#ffd1df", "#d9ccff", "#c8f0dc", "#ffe7b0"].forEach((c, i) => {
      g.fillStyle = c;
      g.fillRect(141, 116 + i * 16, 16, 13);
    });
  } else if (carry === "tray") {
    // A silver tray held up high on the fingertips, a cloche on top.
    g.beginPath();
    g.moveTo(146, 180);
    g.lineTo(152, 118);
    g.stroke();
    blob(g, () => g.ellipse(152, 112, 44, 9, 0, 0, Math.PI * 2), "#d9dde4");
    blob(g, () => {
      g.moveTo(122, 108);
      g.quadraticCurveTo(124, 70, 152, 68);
      g.quadraticCurveTo(180, 70, 182, 108);
      g.closePath();
    }, "#c9ced8");
    g.fillStyle = "rgba(255,255,255,.7)";
    g.beginPath();
    g.ellipse(140, 86, 6, 12, -0.5, 0, Math.PI * 2);
    g.fill();
    blob(g, () => g.arc(152, 64, 6, 0, Math.PI * 2), "#c9ced8");
  } else if (carry === "bowl") {
    // A steaming bowl (malatang, ramen) held in front with chopsticks sticking out.
    g.beginPath();
    g.moveTo(150, 150);
    g.lineTo(178, 112);
    g.moveTo(158, 152);
    g.lineTo(188, 120);
    g.stroke();
    blob(g, () => {
      g.moveTo(124, 152);
      g.lineTo(176, 152);
      g.quadraticCurveTo(172, 188, 150, 190);
      g.quadraticCurveTo(128, 188, 124, 152);
    }, color);
    blob(g, () => g.ellipse(150, 152, 26, 7, 0, 0, Math.PI * 2), "#d9452b");
    g.lineWidth = 3;
    g.strokeStyle = "rgba(23,21,31,.45)";
    for (const sx of [138, 152, 164]) {
      g.beginPath();
      g.moveTo(sx, 140);
      g.quadraticCurveTo(sx - 6, 130, sx, 120);
      g.stroke();
    }
  } else if (carry === "cone") {
    // Soft-serve in a cone.
    blob(g, () => {
      g.moveTo(134, 150);
      g.lineTo(158, 150);
      g.lineTo(146, 190);
      g.closePath();
    }, "#e0a352");
    blob(g, () => {
      g.moveTo(130, 152);
      g.quadraticCurveTo(128, 128, 146, 124);
      g.quadraticCurveTo(150, 104, 146, 98);
      g.quadraticCurveTo(166, 120, 162, 152);
      g.closePath();
    }, color);
  } else if (carry === "flag") {
    // Chequered flag on a stick, waved high.
    g.beginPath();
    g.moveTo(146, 186);
    g.lineTo(176, 40);
    g.stroke();
    g.save();
    g.beginPath();
    g.moveTo(176, 40);
    g.quadraticCurveTo(196, 30, 216, 44);
    g.lineTo(212, 88);
    g.quadraticCurveTo(192, 76, 168, 84);
    g.closePath();
    g.fillStyle = "#fffdf6";
    g.fill();
    g.clip();
    g.fillStyle = "#17151f";
    for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) if ((i + j) % 2) g.fillRect(166 + i * 13, 28 + j * 15, 13, 15);
    g.restore();
    g.beginPath();
    g.moveTo(176, 40);
    g.quadraticCurveTo(196, 30, 216, 44);
    g.lineTo(212, 88);
    g.quadraticCurveTo(192, 76, 168, 84);
    g.closePath();
    g.stroke();
  } else if (carry === "mic") {
    // Handheld microphone up at the mouth.
    g.beginPath();
    g.moveTo(146, 180);
    g.lineTo(126, 124);
    g.stroke();
    blob(g, () => g.arc(122, 114, 12, 0, Math.PI * 2), "#3a3f4a");
    blob(g, () => g.roundRect(136, 146, 16, 14, 3), color);
  } else if (carry === "baton") {
    // Glowing traffic baton, raised.
    g.save();
    g.translate(146, 180);
    g.rotate(0.45);
    g.fillStyle = "rgba(255,150,40,.35)";
    g.fillRect(-14, -112, 28, 104);
    blob(g, () => g.roundRect(-8, -104, 16, 92, 8), color);
    blob(g, () => g.roundRect(-9, -14, 18, 26, 4), "#2a2a30");
    g.restore();
  } else if (carry === "wrap") {
    // Shawarma in a paper wrap, a bite already gone.
    blob(g, () => {
      g.moveTo(132, 186);
      g.lineTo(160, 186);
      g.lineTo(164, 142);
      g.quadraticCurveTo(146, 130, 128, 142);
      g.closePath();
    }, "#f3e2b8");
    blob(g, () => g.ellipse(146, 140, 17, 7, 0, 0, Math.PI * 2), "#c98a4a");
    g.fillStyle = "#5aa040";
    g.fillRect(136, 134, 7, 5);
    g.fillStyle = "#e3350d";
    g.fillRect(148, 135, 6, 4);
    blob(g, () => g.roundRect(130, 160, 32, 28, 4), "#fffdf6");
  }
  marker(g);
}

/** The same visitor seen from behind (watching the busker, browsing a rack). */
export function personBackDoodle(p: PersonLook) {
  const c = document.createElement("canvas");
  c.width = 220;
  c.height = 360;
  const g = c.getContext("2d")!;
  const s = p.kid ? 0.72 : 1;
  g.translate(p.kid ? 30 : 0, p.kid ? 360 * 0.28 : 0);
  g.scale(s, s);
  marker(g);
  blob(g, () => g.roundRect(62, 226, 26, 100, 10), p.bottom);
  blob(g, () => g.roundRect(94, 226, 26, 100, 10), p.bottom);
  blob(g, () => g.ellipse(74, 330, 18, 9, 0, 0, Math.PI * 2), "#2a2a30");
  blob(g, () => g.ellipse(108, 330, 18, 9, 0, 0, Math.PI * 2), "#2a2a30");
  blob(g, () => g.roundRect(52, 118, 80, 118, 26), p.top);
  if (p.vest) {
    blob(g, () => g.roundRect(58, 126, 68, 104, 18), p.vest);
    g.fillStyle = "#eef0f2";
    for (const y of [168, 196]) g.fillRect(60, y, 64, 8);
  }
  if (p.backpack) blob(g, () => g.roundRect(64, 134, 56, 72, 14), p.backpack);
  blob(g, () => g.roundRect(34, 128, 22, 86, 11), p.top);
  blob(g, () => g.roundRect(128, 128, 22, 86, 11), p.top);
  blob(g, () => g.arc(45, 220, 11, 0, Math.PI * 2), p.skin);
  blob(g, () => g.arc(139, 220, 11, 0, Math.PI * 2), p.skin);
  if (p.helmet) {
    blob(g, () => g.ellipse(92, 78, 42, 46, 0, 0, Math.PI * 2), p.helmet);
  } else if (p.hijab) {
    blob(g, () => {
      g.moveTo(40, 150);
      g.quadraticCurveTo(40, 30, 92, 28);
      g.quadraticCurveTo(144, 30, 144, 150);
      g.quadraticCurveTo(92, 172, 40, 150);
    }, p.hijab);
  } else {
    blob(g, () => g.ellipse(92, 80, 38, 42, 0, 0, Math.PI * 2), p.hair ?? p.skin);
    if (p.cap) {
      blob(g, () => {
        g.moveTo(52, 66);
        g.quadraticCurveTo(56, 26, 92, 28);
        g.quadraticCurveTo(128, 26, 132, 66);
        g.closePath();
      }, p.cap);
      // Snapback strap.
      g.beginPath();
      g.moveTo(74, 64);
      g.lineTo(110, 64);
      g.stroke();
    }
    // Ears either side.
    blob(g, () => g.ellipse(53, 84, 6, 10, 0, 0, Math.PI * 2), p.skin);
    blob(g, () => g.ellipse(131, 84, 6, 10, 0, 0, Math.PI * 2), p.skin);
  }
  return c.toDataURL();
}

/** Lorbel's busker: long curly hair, specs, a white Pepe tee and an acoustic guitar. The same
 * Luqman Podolski cosplay that won Faris a PS4 (an easter egg, not Faris himself). */
export function buskerDoodle() {
  const c = document.createElement("canvas");
  c.width = 240;
  c.height = 400;
  const g = c.getContext("2d")!;
  marker(g);
  const skin = "#d9a27a";
  blob(g, () => g.roundRect(78, 262, 30, 110, 10), "#3d5a8f");
  blob(g, () => g.roundRect(112, 262, 30, 110, 10), "#3d5a8f");
  blob(g, () => g.ellipse(90, 376, 24, 12, 0, 0, Math.PI * 2), "#f2f0ea");
  blob(g, () => g.ellipse(132, 376, 24, 12, 0, 0, Math.PI * 2), "#f2f0ea");
  blob(g, () => g.roundRect(62, 140, 96, 136, 28), "#f7f5ef");
  // Pepe on the tee.
  blob(g, () => g.ellipse(110, 186, 26, 20, 0, 0, Math.PI * 2), "#5aa04a");
  blob(g, () => g.ellipse(100, 178, 8, 6, 0, 0, Math.PI * 2), "#ffffff");
  blob(g, () => g.ellipse(120, 178, 8, 6, 0, 0, Math.PI * 2), "#ffffff");
  blob(g, () => g.ellipse(110, 196, 14, 4, 0, 0, Math.PI * 2), "#b8584a");
  // Guitar across the body: neck to the left, body bottom right.
  g.save();
  g.translate(118, 228);
  g.rotate(-0.42);
  blob(g, () => g.roundRect(-118, -8, 110, 16, 4), "#6b4421");
  blob(g, () => g.roundRect(-134, -12, 22, 24, 5), "#3a2412");
  blob(g, () => {
    g.ellipse(16, 0, 46, 38, 0, 0, Math.PI * 2);
  }, "#d38a3c");
  blob(g, () => g.arc(4, 0, 11, 0, Math.PI * 2), "#3a2412");
  g.restore();
  // Strumming hand and fretting hand.
  blob(g, () => g.arc(140, 232, 12, 0, Math.PI * 2), skin);
  blob(g, () => g.arc(38, 186, 12, 0, Math.PI * 2), skin);
  // Big curly hair, then the face, then specs.
  g.fillStyle = "#26222a";
  for (const [hx, hy, r] of [[70, 70, 30], [100, 50, 32], [136, 62, 30], [150, 100, 26], [58, 108, 26], [64, 140, 22], [154, 138, 22], [112, 40, 24], [82, 44, 24]] as const) {
    g.beginPath();
    g.arc(hx, hy, r, 0, Math.PI * 2);
    g.fill();
    g.stroke();
  }
  blob(g, () => g.ellipse(106, 104, 36, 42, 0, 0, Math.PI * 2), skin);
  g.fillStyle = "#26222a";
  g.beginPath();
  g.ellipse(106, 70, 34, 14, 0, Math.PI, 0);
  g.fill();
  g.lineWidth = 4;
  for (const ex of [90, 122]) {
    g.beginPath();
    g.arc(ex, 104, 12, 0, Math.PI * 2);
    g.stroke();
  }
  g.beginPath();
  g.moveTo(102, 104);
  g.lineTo(110, 104);
  g.stroke();
  g.fillStyle = INK;
  for (const ex of [90, 122]) {
    g.beginPath();
    g.arc(ex, 105, 3.5, 0, Math.PI * 2);
    g.fill();
  }
  // Singing: open mouth.
  blob(g, () => g.ellipse(106, 126, 8, 7, 0, 0, Math.PI * 2), "#8a2a2a");
  return c.toDataURL();
}

/** The busker's friend sitting on a cajon, slapping it. */
export function cajonDoodle() {
  const c = document.createElement("canvas");
  c.width = 240;
  c.height = 340;
  const g = c.getContext("2d")!;
  marker(g);
  const skin = "#c98c64";
  // The cajon box.
  blob(g, () => g.roundRect(60, 214, 112, 116, 8), "#c88a4a");
  blob(g, () => g.arc(116, 290, 14, 0, Math.PI * 2), "#3a2412");
  // Legs over the front, shoes on the floor.
  blob(g, () => g.roundRect(54, 214, 40, 22, 10), "#2a2730");
  blob(g, () => g.roundRect(138, 214, 40, 22, 10), "#2a2730");
  blob(g, () => g.roundRect(50, 222, 24, 96, 10), "#2a2730");
  blob(g, () => g.roundRect(158, 222, 24, 96, 10), "#2a2730");
  blob(g, () => g.ellipse(58, 324, 20, 10, 0, 0, Math.PI * 2), "#e3350d");
  blob(g, () => g.ellipse(174, 324, 20, 10, 0, 0, Math.PI * 2), "#e3350d");
  // Body leaning in, both hands down on the box.
  blob(g, () => g.roundRect(72, 110, 88, 112, 26), "#ffcb05");
  blob(g, () => g.roundRect(56, 122, 22, 92, 11), "#ffcb05");
  blob(g, () => g.roundRect(154, 122, 22, 92, 11), "#ffcb05");
  blob(g, () => g.arc(70, 222, 12, 0, Math.PI * 2), skin);
  blob(g, () => g.arc(164, 222, 12, 0, Math.PI * 2), skin);
  // Head with a bucket hat.
  blob(g, () => g.ellipse(116, 74, 36, 40, 0, 0, Math.PI * 2), skin);
  blob(g, () => {
    g.moveTo(66, 58);
    g.lineTo(166, 58);
    g.lineTo(150, 22);
    g.lineTo(82, 22);
    g.closePath();
  }, "#3fae5a");
  g.fillStyle = INK;
  for (const ex of [102, 130]) {
    g.beginPath();
    g.arc(ex, 78, 4.5, 0, Math.PI * 2);
    g.fill();
  }
  g.lineWidth = 4;
  g.beginPath();
  g.arc(116, 90, 9, 0.2, Math.PI - 0.2);
  g.stroke();
  return c.toDataURL();
}

/** Pasar malam crowd: visitors with what they bought, and the stall vendors. */
export const LORBEL_LOOKS: PersonLook[] = [
  { skin: "#e8b48f", top: "#ff8fb1", bottom: "#3d4a7a", hijab: "#9b6ad6", bag: "#ffcb05", carry: "drink" },
  { skin: "#c98c64", top: "#3fae5a", bottom: "#2a2730", cap: "#e3350d", hair: "#26222a", bag: "#f2f0ea", carry: "bag" },
  { skin: "#f0c8a8", top: "#f2f0ea", bottom: "#6b5a8a", hair: "#7a4a2a", bag: "#ff8fb1", carry: "candy" },
  { skin: "#d9a27a", top: "#ffcb05", bottom: "#3b6fe0", hair: "#26222a", bag: "#ffb4d0", carry: "candy", kid: true },
  { skin: "#e3ad86", top: "#1f2f7a", bottom: "#9aa0aa", hijab: "#7dd3c0", bag: "#2a2730", carry: "phone" },
  { skin: "#b97a52", top: "#e3350d", bottom: "#2a2730", hair: "#1c1a20", bag: "#7a3b22", carry: "satay" },
  { skin: "#ecc0a0", top: "#2a2730", bottom: "#c9b48a", hijab: "#f2d27a", bag: "#e8f0ff", carry: "bag" },
  { skin: "#d39a72", top: "#9fd3b0", bottom: "#3d4a7a", hair: "#26222a", backpack: "#3b6fe0", bag: "#e3350d", carry: "drink" },
  { skin: "#f2cfb2", top: "#b9c4ff", bottom: "#2a2730", hijab: "#2a2730", bag: "#ffcb05", carry: "none" },
  { skin: "#c98c64", top: "#f6a04b", bottom: "#4a4a55", cap: "#2a2730", hair: "#26222a", bag: "#46b86a", carry: "drink", kid: true },
  { skin: "#e0a882", top: "#6b5a8a", bottom: "#d9d2c4", hijab: "#ff8fb1", bag: "#f2f0ea", carry: "satay" },
  { skin: "#b97a52", top: "#f2f0ea", bottom: "#3b6fe0", hair: "#3a2a20", bag: "#ffcb05", carry: "phone" },
];

export const VENDOR_LOOKS: PersonLook[] = [
  { skin: "#b97a52", top: "#2a2730", bottom: "#2a2730", cap: "#e3350d", hair: "#26222a", bag: "#000", carry: "none", apron: "#f2f0ea" },
  { skin: "#e3ad86", top: "#ff8fb1", bottom: "#2a2730", hijab: "#3b6fe0", bag: "#000", carry: "none", apron: "#ffcb05" },
  { skin: "#c98c64", top: "#f2f0ea", bottom: "#4a4a55", hair: "#1c1a20", bag: "#000", carry: "none", apron: "#e3350d" },
  { skin: "#ecc0a0", top: "#46b86a", bottom: "#2a2730", hijab: "#2a2730", bag: "#000", carry: "none", apron: "#f2f0ea" },
];

// ---------------------------------------------------------------- Putrajaya joggers

export interface JogLook {
  skin: string;
  top: string;
  bottom: string;
  shoe: string;
  hijab?: string;
  hair?: string;
  /** Long hair in a ponytail that swings (seen from behind). */
  ponytail?: boolean;
  cap?: string;
  band?: string;
  /** Running shorts (bare knees) instead of leggings or trackpants. */
  shorts?: boolean;
  kid?: boolean;
}

/** A thick marker stroke in a colour: ink outline first, then the fill on top. */
function limb(g: CanvasRenderingContext2D, pts: [number, number][], w: number, fill: string) {
  for (const [lw, col] of [[w + 9, INK], [w, fill]] as const) {
    g.lineWidth = lw;
    g.strokeStyle = col;
    g.beginPath();
    pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y)));
    g.stroke();
  }
  marker(g);
}

function jogHead(g: CanvasRenderingContext2D, p: JogLook, back: boolean, x: number, y: number) {
  if (p.hijab) {
    blob(g, () => {
      g.moveTo(x - 52, y + 70);
      g.quadraticCurveTo(x - 54, y - 52, x, y - 54);
      g.quadraticCurveTo(x + 54, y - 52, x + 52, y + 70);
      g.quadraticCurveTo(x, y + 88, x - 52, y + 70);
    }, p.hijab);
    if (!back) blob(g, () => g.ellipse(x, y + 4, 33, 37, 0, 0, Math.PI * 2), p.skin);
  } else {
    if (back) {
      if (p.ponytail) blob(g, () => g.ellipse(x + 6, y + 42, 13, 30, 0.25, 0, Math.PI * 2), p.hair ?? "#26222a");
      blob(g, () => g.ellipse(x, y, 38, 42, 0, 0, Math.PI * 2), p.hair ?? p.skin);
      blob(g, () => g.ellipse(x - 39, y + 4, 6, 10, 0, 0, Math.PI * 2), p.skin);
      blob(g, () => g.ellipse(x + 39, y + 4, 6, 10, 0, 0, Math.PI * 2), p.skin);
    } else {
      if (p.ponytail) blob(g, () => g.ellipse(x + 40, y - 14, 12, 22, -0.6, 0, Math.PI * 2), p.hair ?? "#26222a");
      blob(g, () => g.ellipse(x, y, 38, 42, 0, 0, Math.PI * 2), p.skin);
      if (p.hair) blob(g, () => {
        g.moveTo(x - 38, y - 2);
        g.quadraticCurveTo(x - 36, y - 48, x, y - 46);
        g.quadraticCurveTo(x + 38, y - 48, x + 38, y - 2);
        g.quadraticCurveTo(x + 24, y - 28, x, y - 24);
        g.quadraticCurveTo(x - 24, y - 28, x - 38, y - 2);
      }, p.hair);
    }
    if (p.cap) {
      blob(g, () => {
        g.moveTo(x - 40, y - 14);
        g.quadraticCurveTo(x - 36, y - 54, x, y - 52);
        g.quadraticCurveTo(x + 36, y - 54, x + 40, y - 14);
        g.closePath();
      }, p.cap);
      if (!back) blob(g, () => g.ellipse(x + 26, y - 16, 30, 8, -0.1, 0, Math.PI * 2), p.cap);
    }
  }
  if (p.band) {
    // Sweatband round the forehead (over the hijab too).
    blob(g, () => g.roundRect(x - 40, y - 26, 80, 15, 7), p.band);
  }
  if (back) return;
  // Face: puffing cheeks, an open "huff" mouth, a drop of sweat.
  g.fillStyle = INK;
  for (const ex of [x - 14, x + 14]) {
    g.beginPath();
    g.arc(ex, y + 2, 4.5, 0, Math.PI * 2);
    g.fill();
  }
  blob(g, () => g.ellipse(x, y + 20, 6, 7, 0, 0, Math.PI * 2), "#7a2a35");
  g.fillStyle = "rgba(255,110,130,.45)";
  for (const ex of [x - 22, x + 22]) {
    g.beginPath();
    g.ellipse(ex, y + 14, 8, 5, 0, 0, Math.PI * 2);
    g.fill();
  }
  marker(g, 3);
  blob(g, () => {
    g.moveTo(x + 44, y - 20);
    g.quadraticCurveTo(x + 52, y - 6, x + 44, y - 2);
    g.quadraticCurveTo(x + 36, y - 6, x + 44, y - 20);
  }, "#8fd3ff");
  marker(g);
}

/** A jogger mid-stride, front or back, in two frames (left knee up / right knee up). Data URL. */
export function joggerDoodle(p: JogLook, frame: 0 | 1, back = false) {
  const c = document.createElement("canvas");
  c.width = 220;
  c.height = 360;
  const g = c.getContext("2d")!;
  const s = p.kid ? 0.72 : 1;
  g.translate(p.kid ? 30 : 0, p.kid ? 360 * 0.28 : 0);
  g.scale(s, s);
  marker(g);
  // Legs: one planted, one with the knee up. Shorts leave the shins bare.
  const legs: [number, boolean][] = [[75, frame === 0], [107, frame === 1]];
  for (const [lx, up] of legs) {
    const foot = up ? 288 : 326;
    const knee = up ? 262 : 280;
    limb(g, [[lx, 226], [lx + (up ? 4 : 0), knee]], 24, p.bottom);
    limb(g, [[lx + (up ? 4 : 0), knee], [lx, foot - 8]], 22, p.shorts ? p.skin : p.bottom);
    blob(g, () => g.ellipse(lx, foot, 19, 10, 0, 0, Math.PI * 2), p.shoe);
    g.fillStyle = "#fffdf6";
    g.fillRect(lx - 12, foot + 2, 24, 4);
  }
  // Arms pump the other way round: the arm opposite the raised knee comes forward.
  const fwdLeft = frame === 1;
  const armL: [number, number][] = fwdLeft ? [[50, 134], [40, 178], [70, 160]] : [[50, 134], [36, 182], [30, 212]];
  const armR: [number, number][] = fwdLeft ? [[134, 134], [148, 182], [154, 212]] : [[134, 134], [144, 178], [114, 160]];
  const drawArm = (pts: [number, number][]) => {
    limb(g, pts.slice(0, 2), 20, p.top);
    limb(g, pts.slice(1), 18, p.skin);
    blob(g, () => g.arc(pts[2][0], pts[2][1], 10, 0, Math.PI * 2), p.skin);
  };
  // From the front the forward hand crosses over the body; from behind it's hidden behind it.
  const fwd = fwdLeft ? armL : armR;
  const bk = fwdLeft ? armR : armL;
  if (back) drawArm(fwd);
  else drawArm(bk);
  blob(g, () => g.roundRect(52, 118, 80, 116, 26), p.top);
  // A stripe across the tee and a number bib for the fun-run folk.
  g.fillStyle = "rgba(255,255,255,.55)";
  g.fillRect(56, 150, 72, 8);
  if (back) drawArm(bk);
  else drawArm(fwd);
  if (!back) {
    // Smartwatch on the left wrist.
    blob(g, () => g.roundRect(armL[2][0] - 9, armL[2][1] - 22, 16, 12, 3), "#2a2a30");
  }
  jogHead(g, p, back, 92, 80);
  return c.toDataURL();
}

/** Someone on a Putrajaya rental bike, seen head-on (or from behind), with a basket. Data URL. */
export function cyclistDoodle(p: JogLook, bike: string, back = false) {
  const c = document.createElement("canvas");
  c.width = 220;
  c.height = 380;
  const g = c.getContext("2d")!;
  marker(g);
  // Wheel seen end-on, the frame, then the rider.
  blob(g, () => g.ellipse(110, 318, 13, 50, 0, 0, Math.PI * 2), "#2a2a30");
  g.fillStyle = "#9aa0aa";
  g.fillRect(106, 276, 8, 84);
  blob(g, () => g.roundRect(100, 214, 20, 74, 8), bike);
  // Legs down to the pedals, one up one down.
  limb(g, [[88, 226], [72, 268], [86, 300]], 22, p.bottom);
  limb(g, [[132, 226], [150, 282], [140, 330]], 22, p.bottom);
  blob(g, () => g.ellipse(84, 304, 16, 8, 0, 0, Math.PI * 2), p.shoe);
  blob(g, () => g.ellipse(142, 334, 16, 8, 0, 0, Math.PI * 2), p.shoe);
  blob(g, () => g.roundRect(70, 120, 80, 112, 26), p.top);
  // Arms out to the handlebar grips.
  limb(g, [[72, 136], [52, 196]], 18, p.top);
  limb(g, [[148, 136], [168, 196]], 18, p.top);
  marker(g, 7);
  g.beginPath();
  g.moveTo(38, 206);
  g.quadraticCurveTo(110, 190, 182, 206);
  g.stroke();
  marker(g);
  blob(g, () => g.arc(48, 204, 11, 0, Math.PI * 2), p.skin);
  blob(g, () => g.arc(172, 204, 11, 0, Math.PI * 2), p.skin);
  if (!back) {
    // Wicker basket in front, a bell on the bar.
    blob(g, () => g.roundRect(80, 212, 60, 40, 6), "#d9a860");
    g.beginPath();
    for (const bx of [92, 104, 116, 128]) {
      g.moveTo(bx, 214);
      g.lineTo(bx, 250);
    }
    g.stroke();
    blob(g, () => g.arc(150, 196, 8, Math.PI, 0), "#ffcb05");
  }
  jogHead(g, { ...p, band: undefined }, back, 110, 80);
  if (!back) {
    // Helmet over the head.
    blob(g, () => {
      g.moveTo(68, 70);
      g.quadraticCurveTo(70, 26, 110, 26);
      g.quadraticCurveTo(150, 26, 152, 70);
      g.closePath();
    }, p.cap ?? "#3b6fe0");
  }
  return c.toDataURL();
}

export const JOG_LOOKS: JogLook[] = [
  { skin: "#e8b48f", top: "#ff5c93", bottom: "#2a2730", shoe: "#7dd3c0", hijab: "#2a2730" },
  { skin: "#c98c64", top: "#f2f0ea", bottom: "#3b6fe0", shoe: "#e3350d", hair: "#26222a", band: "#e3350d", shorts: true },
  { skin: "#f0c8a8", top: "#9fd3b0", bottom: "#3d4a7a", shoe: "#ff8fb1", hair: "#3a2a20", ponytail: true },
  { skin: "#b97a52", top: "#ffcb05", bottom: "#2a2730", shoe: "#f2f0ea", cap: "#2a2730", hair: "#1c1a20", shorts: true },
  { skin: "#e3ad86", top: "#7a5cff", bottom: "#2a2730", shoe: "#ffcb05", hijab: "#f6a04b" },
  { skin: "#d39a72", top: "#3fae5a", bottom: "#4a4a55", shoe: "#3b6fe0", hair: "#9a97a0", band: "#f2f0ea" },
  { skin: "#ecc0a0", top: "#f6a04b", bottom: "#2a2730", shoe: "#9b6ad6", hijab: "#7dd3c0" },
  { skin: "#c98c64", top: "#e3350d", bottom: "#2a2730", shoe: "#46b86a", hair: "#26222a", shorts: true, kid: true },
  { skin: "#f2cfb2", top: "#2a2730", bottom: "#ff8fb1", shoe: "#f2f0ea", hair: "#7a4a2a", ponytail: true, cap: "#ff8fb1" },
  { skin: "#b97a52", top: "#1f2f7a", bottom: "#9aa0aa", shoe: "#ffcb05", hair: "#26222a", band: "#ffcb05", shorts: true },
];

/** Makcik power-walkers: telekung-bright tudung, big tees, arms swinging. */
export const WALK_LOOKS: JogLook[] = [
  { skin: "#e3ad86", top: "#ff8fb1", bottom: "#2a2730", shoe: "#f2f0ea", hijab: "#9b6ad6" },
  { skin: "#d9a27a", top: "#7dd3c0", bottom: "#3d4a7a", shoe: "#f2f0ea", hijab: "#ffcb05" },
  { skin: "#c98c64", top: "#f2f0ea", bottom: "#2a2730", shoe: "#3b6fe0", hair: "#9a97a0", cap: "#3fae5a" },
];

// ---------------------------------------------------------------- Tasik Lily

/** Someone sitting cross-legged on a picnic mat, holding what they're eating (or waving). Data URL;
 * the canvas is shorter than a standing doodle, so stand it about 1.25 tall. */
export function sitterDoodle(p: PersonLook, wave = false) {
  const c = document.createElement("canvas");
  c.width = 220;
  c.height = 262;
  const g = c.getContext("2d")!;
  const s = p.kid ? 0.78 : 1;
  g.translate(p.kid ? 22 : 0, p.kid ? 262 * 0.22 : 0);
  g.scale(s, s);
  marker(g);
  // Crossed legs: two folded shins in front of the body, feet poking out at the sides.
  blob(g, () => g.ellipse(92, 232, 66, 22, 0, 0, Math.PI * 2), p.bottom);
  if (p.sarong) checks(g, 26, 210, 132, 44, p.sarong);
  g.beginPath();
  g.moveTo(92, 214);
  g.quadraticCurveTo(80, 236, 60, 246);
  g.stroke();
  blob(g, () => g.ellipse(30, 238, 14, 9, -0.3, 0, Math.PI * 2), p.skin);
  blob(g, () => g.ellipse(154, 238, 14, 9, 0.3, 0, Math.PI * 2), p.skin);
  blob(g, () => g.roundRect(52, 118, 80, 104, 26), p.top);
  if (p.apron) blob(g, () => g.roundRect(60, 150, 64, 70, 10), p.apron);
  if (p.bowtie) bowTie(g, p.bowtie);
  // Left arm resting on the knee; right arm up with the food (or waving hello).
  blob(g, () => g.roundRect(34, 128, 22, 78, 11), p.top);
  blob(g, () => g.arc(45, 210, 11, 0, Math.PI * 2), p.skin);
  if (wave) {
    blob(g, () => g.roundRect(130, 70, 22, 70, 11), p.top);
    blob(g, () => g.arc(141, 64, 13, 0, Math.PI * 2), p.skin);
  } else {
    blob(g, () => g.roundRect(128, 128, 22, 52, 11), p.top);
    blob(g, () => g.arc(146, 180, 11, 0, Math.PI * 2), p.skin);
    const carry = p.carry ?? "none";
    if (carry !== "suitcase" && carry !== "none") drawCarry(g, carry, p.bag);
  }
  drawHead(g, p);
  return c.toDataURL();
}

/** An angler on a folding stool seen from behind, bucket hat on, both hands forward on the rod (the
 * rod itself is 3D so it can bend). Data URL; stand it about 1.5 tall. */
export function fisherBackDoodle(p: PersonLook & { hat: string }) {
  const c = document.createElement("canvas");
  c.width = 220;
  c.height = 300;
  const g = c.getContext("2d")!;
  marker(g);
  // Folding stool: crossed legs and a canvas seat.
  g.lineWidth = 6;
  g.beginPath();
  g.moveTo(58, 296);
  g.lineTo(126, 236);
  g.moveTo(126, 296);
  g.lineTo(58, 236);
  g.stroke();
  marker(g);
  blob(g, () => g.roundRect(48, 226, 88, 16, 6), "#3b6fe0");
  // Knees out front, so only the thighs and shoes show either side.
  blob(g, () => g.roundRect(30, 222, 34, 26, 12), p.bottom);
  blob(g, () => g.roundRect(120, 222, 34, 26, 12), p.bottom);
  blob(g, () => g.ellipse(36, 284, 16, 9, 0, 0, Math.PI * 2), "#2a2a30");
  blob(g, () => g.ellipse(148, 284, 16, 9, 0, 0, Math.PI * 2), "#2a2a30");
  g.beginPath();
  g.moveTo(36, 248);
  g.lineTo(36, 276);
  g.moveTo(148, 248);
  g.lineTo(148, 276);
  g.stroke();
  // Back, bent forward a little, arms reaching ahead.
  blob(g, () => g.roundRect(50, 120, 84, 112, 28), p.top);
  blob(g, () => g.roundRect(34, 132, 22, 66, 11), p.top);
  blob(g, () => g.roundRect(128, 132, 22, 66, 11), p.top);
  // Neck and bucket hat.
  blob(g, () => g.roundRect(78, 100, 28, 26, 8), p.skin);
  blob(g, () => g.ellipse(92, 78, 36, 34, 0, 0, Math.PI * 2), p.hair ?? "#3a3a40");
  blob(g, () => g.ellipse(55, 84, 6, 10, 0, 0, Math.PI * 2), p.skin);
  blob(g, () => g.ellipse(129, 84, 6, 10, 0, 0, Math.PI * 2), p.skin);
  blob(g, () => g.ellipse(92, 72, 58, 16, 0, 0, Math.PI * 2), p.hat);
  blob(g, () => {
    g.moveTo(58, 72);
    g.quadraticCurveTo(60, 28, 92, 28);
    g.quadraticCurveTo(124, 28, 126, 72);
    g.closePath();
  }, p.hat);
  return c.toDataURL();
}

export const PICNIC_LOOKS: PersonLook[] = [
  { skin: "#e3ad86", top: "#ff8fb1", bottom: "#3d4a7a", hijab: "#7dd3c0", bag: "#ffcb05", carry: "drink" },
  { skin: "#c98c64", top: "#f2f0ea", bottom: "#2a2730", hair: "#26222a", bag: "#e3350d", carry: "satay" },
  { skin: "#d9a27a", top: "#ffcb05", bottom: "#3b6fe0", hair: "#26222a", bag: "#ffb4d0", carry: "candy", kid: true },
  { skin: "#ecc0a0", top: "#9b6ad6", bottom: "#d9d2c4", hijab: "#ffcb05", bag: "#f2f0ea", carry: "phone" },
  { skin: "#b97a52", top: "#46b86a", bottom: "#4a4a55", hair: "#1c1a20", bag: "#3b6fe0", carry: "drink", kid: true },
  { skin: "#f0c8a8", top: "#3b6fe0", bottom: "#c9b48a", hijab: "#ff8fb1", bag: "#fff", carry: "none" },
];

export const FISHER_LOOKS: (PersonLook & { hat: string })[] = [
  { skin: "#b97a52", top: "#2f8a5a", bottom: "#4a4a55", hair: "#d9d6cf", bag: "#000", hat: "#c9b48a" },
  { skin: "#c98c64", top: "#e3350d", bottom: "#2a2730", hair: "#26222a", bag: "#000", hat: "#3d4a7a" },
  { skin: "#d39a72", top: "#f2f0ea", bottom: "#3b6fe0", hair: "#3a2a20", bag: "#000", hat: "#5f8f3a" },
];

// ---------------------------------------------------------------- Bukit Bintang

/** Head from behind: hair (or tudung), cap, ears. Same frame as drawHead. */
function headBack(g: CanvasRenderingContext2D, p: PersonLook) {
  if (p.hijab) {
    blob(g, () => {
      g.moveTo(40, 150);
      g.quadraticCurveTo(40, 30, 92, 28);
      g.quadraticCurveTo(144, 30, 144, 150);
      g.quadraticCurveTo(92, 172, 40, 150);
    }, p.hijab);
    return;
  }
  blob(g, () => g.ellipse(92, 80, 38, 42, 0, 0, Math.PI * 2), p.hair ?? p.skin);
  if (p.cap) {
    blob(g, () => {
      g.moveTo(52, 66);
      g.quadraticCurveTo(56, 26, 92, 28);
      g.quadraticCurveTo(128, 26, 132, 66);
      g.closePath();
    }, p.cap);
  }
  if (p.kufi) kufiCap(g, p.kufi);
  if (p.chef) toque(g);
  blob(g, () => g.ellipse(53, 84, 6, 10, 0, 0, Math.PI * 2), p.skin);
  blob(g, () => g.ellipse(131, 84, 6, 10, 0, 0, Math.PI * 2), p.skin);
}

/** The panicking face: eyes squeezed shut ("> <"), a wobbly open mouth, a green tinge and sweat. */
function panicFace(g: CanvasRenderingContext2D) {
  g.fillStyle = "rgba(130,190,60,.35)";
  g.beginPath();
  g.ellipse(92, 96, 30, 18, 0, 0, Math.PI * 2);
  g.fill();
  marker(g, 4);
  g.beginPath();
  g.moveTo(70, 74);
  g.lineTo(82, 81);
  g.lineTo(70, 88);
  g.moveTo(114, 74);
  g.lineTo(102, 81);
  g.lineTo(114, 88);
  g.stroke();
  blob(g, () => {
    g.moveTo(80, 104);
    g.quadraticCurveTo(86, 98, 92, 104);
    g.quadraticCurveTo(98, 110, 104, 104);
    g.quadraticCurveTo(104, 116, 92, 116);
    g.quadraticCurveTo(80, 116, 80, 104);
  }, "#7a2a35");
  marker(g, 3);
  for (const [x, y] of [[136, 60], [44, 70]] as const) {
    blob(g, () => {
      g.moveTo(x, y);
      g.quadraticCurveTo(x + 8, y + 14, x, y + 18);
      g.quadraticCurveTo(x - 8, y + 14, x, y);
    }, "#8fd3ff");
  }
  marker(g);
}

/** Green stink squiggles round the head, for anyone caught near one of Bowat's clouds. */
function stinkLines(g: CanvasRenderingContext2D, frame: number) {
  g.strokeStyle = "#5f9a2a";
  g.lineWidth = 5;
  g.lineCap = "round";
  for (const [x, y, k] of [[22, 40, 1], [160, 30, -1], [172, 96, 1]] as const) {
    const o = frame ? 4 : -4;
    g.beginPath();
    g.moveTo(x, y);
    g.quadraticCurveTo(x + 10 * k + o, y + 10, x, y + 20);
    g.quadraticCurveTo(x - 10 * k - o, y + 30, x, y + 40);
    g.stroke();
  }
  marker(g);
}

/** Someone out in Bukit Bintang, mid-step, front or back, two frames. Calm: strolling with a phone, a
 * shopping bag or a drink. Panic: running flat out, one hand pinching the nose and the other arm
 * flapping, stink lines round the head. Data URL, same 220×360 frame as the other people. */
export function cityWalkerDoodle(p: PersonLook, frame: 0 | 1, back = false, panic = false) {
  const c = document.createElement("canvas");
  c.width = 220;
  c.height = 360;
  const g = c.getContext("2d")!;
  const s = p.kid ? 0.72 : 1;
  g.translate(p.kid ? 30 : 0, p.kid ? 360 * 0.28 : 0);
  g.scale(s, s);
  marker(g);
  // Legs: strolling = one foot a little ahead; panic = a running stride with a knee up.
  for (const [lx, fwd] of [[75, frame === 0], [107, frame === 1]] as const) {
    if (panic) {
      const foot = fwd ? 288 : 326;
      const knee = fwd ? 262 : 280;
      limb(g, [[lx, 226], [lx + (fwd ? 4 : 0), knee]], 24, p.bottom);
      limb(g, [[lx + (fwd ? 4 : 0), knee], [lx, foot - 8]], 22, p.bottom);
      blob(g, () => g.ellipse(lx, foot, 19, 10, 0, 0, Math.PI * 2), "#2a2a30");
    } else {
      const foot = fwd ? 322 : 330;
      const dx = fwd ? -6 : 6;
      limb(g, [[lx, 226], [lx + dx, foot - 10]], 24, p.bottom);
      blob(g, () => g.ellipse(lx + dx, foot, 19, 10, 0, 0, Math.PI * 2), "#2a2a30");
    }
  }
  if (p.backpack && !back) blob(g, () => g.roundRect(34, 128, 34, 76, 12), p.backpack);
  if (panic && !back) {
    // Left arm flapping above the head (higher on frame 1), right hand up pinching the nose.
    const up = frame ? [[50, 134], [26, 92], [34, 46]] : [[50, 134], [22, 104], [16, 62]];
    limb(g, up.slice(0, 2) as [number, number][], 20, p.top);
    limb(g, up.slice(1) as [number, number][], 18, p.skin);
    blob(g, () => g.arc(up[2][0], up[2][1], 11, 0, Math.PI * 2), p.skin);
    blob(g, () => g.roundRect(52, 118, 80, 116, 26), p.top);
    if (p.apron) blob(g, () => g.roundRect(60, 150, 64, 80, 10), p.apron);
    drawHead(g, p);
    // Paint over drawHead's calm face (no outline) and draw the panicked one.
    g.fillStyle = p.skin;
    g.beginPath();
    g.ellipse(92, 92, p.hijab ? 29 : 33, 27, 0, 0, Math.PI * 2);
    g.fill();
    if (p.beard) beard(g, p.hair ?? "#26222a");
    panicFace(g);
    limb(g, [[134, 134], [150, 166], [108, 100]], 18, p.top);
    blob(g, () => g.ellipse(102, 92, 13, 10, 0, 0, Math.PI * 2), p.skin);
    stinkLines(g, frame);
    return c.toDataURL();
  }
  if (panic && back) {
    // Both arms flailing over the head as they run off.
    blob(g, () => g.roundRect(52, 118, 80, 116, 26), p.top);
    if (p.backpack) blob(g, () => g.roundRect(64, 134, 56, 72, 14), p.backpack);
    for (const [pts] of [[frame ? [[50, 134], [28, 96], [40, 52]] : [[50, 134], [22, 108], [18, 66]]], [frame ? [[134, 134], [160, 108], [166, 66]] : [[134, 134], [156, 96], [144, 52]]]] as [number, number][][][]) {
      limb(g, pts.slice(0, 2), 20, p.top);
      limb(g, pts.slice(1), 18, p.skin);
      blob(g, () => g.arc(pts[2][0], pts[2][1], 11, 0, Math.PI * 2), p.skin);
    }
    headBack(g, p);
    stinkLines(g, frame);
    return c.toDataURL();
  }
  // Calm: the free arm swings with the step, the other holds whatever they carry.
  const swing = frame ? 8 : -8;
  blob(g, () => g.roundRect(52, 118, 80, 118, 26), p.top);
  if (p.apron) blob(g, () => g.roundRect(60, 150, 64, 92, 10), p.apron);
  if (p.bowtie && !back) bowTie(g, p.bowtie);
  if (back) {
    if (p.backpack) blob(g, () => g.roundRect(64, 134, 56, 72, 14), p.backpack);
    blob(g, () => g.roundRect(34 + swing / 2, 128, 22, 86, 11), p.top);
    blob(g, () => g.roundRect(128 - swing / 2, 128, 22, 86, 11), p.top);
    blob(g, () => g.arc(45 + swing / 2, 220, 11, 0, Math.PI * 2), p.skin);
    blob(g, () => g.arc(139 - swing / 2, 220, 11, 0, Math.PI * 2), p.skin);
    headBack(g, p);
    return c.toDataURL();
  }
  g.save();
  g.translate(45, 128);
  g.rotate(swing * 0.02);
  blob(g, () => g.roundRect(-11, 0, 22, 86, 11), p.top);
  blob(g, () => g.arc(0, 92, 11, 0, Math.PI * 2), p.skin);
  g.restore();
  blob(g, () => g.roundRect(128, 128, 22, 52, 11), p.top);
  blob(g, () => g.arc(146, 180, 11, 0, Math.PI * 2), p.skin);
  const carry = p.carry ?? "none";
  if (carry !== "suitcase" && carry !== "none") drawCarry(g, carry, p.bag);
  drawHead(g, p);
  return c.toDataURL();
}

export type Instrument = "guitar" | "keys" | "mic";

/** A Bukit Bintang street musician facing the crowd, two frames so they bob to the beat. Data URL. */
export function musicianDoodle(p: PersonLook, kind: Instrument, frame: 0 | 1) {
  const c = document.createElement("canvas");
  c.width = 240;
  c.height = 360;
  const g = c.getContext("2d")!;
  g.translate(10, frame ? 4 : 0);
  marker(g);
  blob(g, () => g.roundRect(62, 226, 26, 100, 10), p.bottom);
  blob(g, () => g.roundRect(94, 226, 26, 100, 10), p.bottom);
  blob(g, () => g.ellipse(72, 330, 20, 10, 0, 0, Math.PI * 2), "#2a2a30");
  blob(g, () => g.ellipse(110, 330, 20, 10, 0, 0, Math.PI * 2), "#2a2a30");
  blob(g, () => g.roundRect(52, 118, 80, 118, 26), p.top);
  if (kind === "guitar") {
    // Acoustic guitar across the body, neck up to the left, strumming hand on the sound hole.
    g.save();
    g.translate(100, 196);
    g.rotate(-0.5);
    blob(g, () => g.roundRect(-112, -9, 92, 18, 4), "#6b4224");
    blob(g, () => g.roundRect(-128, -12, 22, 24, 5), "#4a2a14");
    blob(g, () => {
      g.ellipse(0, 0, 40, 34, 0, 0, Math.PI * 2);
      g.moveTo(-14, 0);
      g.ellipse(-26, 0, 28, 26, 0, 0, Math.PI * 2);
    }, "#e0a352");
    blob(g, () => g.arc(-12, 0, 10, 0, Math.PI * 2), "#2a1a10");
    g.restore();
    blob(g, () => g.roundRect(30, 132, 22, 60, 11), p.top);
    blob(g, () => g.arc(28, 112, 11, 0, Math.PI * 2), p.skin);
    blob(g, () => g.roundRect(128, 128, 22, 70, 11), p.top);
    blob(g, () => g.arc(frame ? 112 : 118, frame ? 206 : 196, 11, 0, Math.PI * 2), p.skin);
  } else if (kind === "keys") {
    // A keyboard on an X-stand in front, both hands on the keys.
    g.lineWidth = 6;
    g.beginPath();
    g.moveTo(30, 330);
    g.lineTo(170, 226);
    g.moveTo(170, 330);
    g.lineTo(30, 226);
    g.stroke();
    marker(g);
    blob(g, () => g.roundRect(4, 206, 196, 30, 6), "#2a2730");
    g.fillStyle = "#fffdf6";
    g.fillRect(12, 214, 180, 14);
    g.fillStyle = INK;
    for (let x = 18; x < 190; x += 12) if ((x / 12) % 7 !== 2 && (x / 12) % 7 !== 6) g.fillRect(x, 214, 6, 8);
    blob(g, () => g.roundRect(34, 128, 22, 76, 11), p.top);
    blob(g, () => g.roundRect(128, 128, 22, 76, 11), p.top);
    blob(g, () => g.arc(frame ? 60 : 52, 210, 11, 0, Math.PI * 2), p.skin);
    blob(g, () => g.arc(frame ? 130 : 138, 210, 11, 0, Math.PI * 2), p.skin);
  } else {
    // Singing into a handheld mic, the other arm out to the crowd.
    blob(g, () => g.roundRect(34, 128, 22, 60, 11), p.top);
    blob(g, () => g.roundRect(128, 104, 22, 50, 11), p.top);
    blob(g, () => g.arc(frame ? 18 : 24, 112, 11, 0, Math.PI * 2), p.skin);
    g.save();
    g.translate(45, 190);
    g.rotate(-1.1 + (frame ? 0.15 : 0));
    blob(g, () => g.roundRect(-11, -80, 22, 80, 11), p.top);
    g.restore();
    blob(g, () => g.roundRect(120, 82, 14, 36, 5), "#2a2a30");
    blob(g, () => g.arc(127, 80, 11, 0, Math.PI * 2), "#9aa0aa");
    blob(g, () => g.arc(130, 120, 11, 0, Math.PI * 2), p.skin);
  }
  drawHead(g, p);
  if (kind === "mic") {
    // Open, singing mouth over the smile.
    blob(g, () => g.ellipse(92, 104, 8, 9, 0, 0, Math.PI * 2), "#7a2a35");
  }
  return c.toDataURL();
}

/** Shoppers, tourists and office folk for Bukit Bintang. */
export const BINTANG_LOOKS: PersonLook[] = [
  { skin: "#e8b48f", top: "#ff8fb1", bottom: "#3d4a7a", hijab: "#9b6ad6", bag: "#ffcb05", carry: "bag" },
  { skin: "#c98c64", top: "#2a2730", bottom: "#9aa0aa", hair: "#26222a", bag: "#f2f0ea", carry: "phone" },
  { skin: "#f0c8a8", top: "#f2f0ea", bottom: "#6b5a8a", hair: "#7a4a2a", bag: "#ff5c93", carry: "bag" },
  { skin: "#e3ad86", top: "#3b6fe0", bottom: "#2a2730", hijab: "#f2d27a", bag: "#2a2730", carry: "drink" },
  { skin: "#b97a52", top: "#e3350d", bottom: "#2a2730", hair: "#1c1a20", cap: "#2a2730", bag: "#7a3b22", carry: "phone" },
  { skin: "#f2cfb2", top: "#9fd3b0", bottom: "#3d4a7a", hair: "#3a2a20", backpack: "#e3350d", bag: "#ffcb05", carry: "drink" },
  { skin: "#ecc0a0", top: "#2a2730", bottom: "#c9b48a", hijab: "#ff8fb1", bag: "#e8f0ff", carry: "bag" },
  { skin: "#d39a72", top: "#ffcb05", bottom: "#3b6fe0", hair: "#26222a", bag: "#ffb4d0", carry: "none", kid: true },
  { skin: "#e0a882", top: "#6b5a8a", bottom: "#d9d2c4", hijab: "#2a2730", bag: "#f2f0ea", carry: "phone" },
  { skin: "#f6dcc6", top: "#f6a04b", bottom: "#4a4a55", hair: "#c9a050", backpack: "#3b6fe0", bag: "#46b86a", carry: "phone" },
];
