import * as THREE from "three";
import { canvasTexture, flat, roundedBox } from "../overworld/props";
import { frontZ, model, modelBox } from "../overworld/models";
import { paintedMat } from "../overworld/textures";
import { toonRamp } from "../overworld/style";
import { shadowed } from "./common";

// Qish's bedroom in Labu Lanjut: a cut-away diorama room (back and side walls, open front)
// where the game starts after the dream.

export const ROOM: [number, number, number, number] = [-7, -4.5, 5, 4.5];
const WALL_H = 3.6;

/** Keep the painted detail, with warm wooden legs/trim alongside the pink panels. */
function furniturePalette(root: THREE.Object3D, door = false) {
  root.traverse(o => {
    if (!(o instanceof THREE.Mesh)) return;
    const recolor = (src: THREE.MeshLambertMaterial) => {
      const mat = new THREE.MeshToonMaterial({ map: src.map, gradientMap: toonRamp, side: src.side });
      mat.onBeforeCompile = shader => {
        shader.vertexShader = shader.vertexShader.replace("#include <common>", "#include <common>\nvarying vec3 furniturePoint;")
          .replace("#include <worldpos_vertex>", "#include <worldpos_vertex>\nfurniturePoint = (modelMatrix * vec4(transformed,1.)).xyz;");
        shader.fragmentShader = shader.fragmentShader.replace("#include <common>", "#include <common>\nvarying vec3 furniturePoint;")
          .replace("#include <map_fragment>", `#include <map_fragment>
            float pink = smoothstep(.025,.12,diffuseColor.r - diffuseColor.g);
            float wood = ${door ? "max(step(furniturePoint.y,.3),step(2.52,furniturePoint.y))" : "1. - smoothstep(1.08,1.22,furniturePoint.y)"};
            ${door ? "wood = max(wood, step(.66,abs(furniturePoint.z - .4)));" : ""}
            vec3 timber = vec3(.88,.73,.51) * (.55 + .45 * max(diffuseColor.r,max(diffuseColor.g,diffuseColor.b)));
            diffuseColor.rgb = mix(diffuseColor.rgb,timber,pink * wood);
          `);
      };
      mat.customProgramCacheKey = () => `bilik-pink-wood-${door}`;
      return mat;
    };
    o.material = Array.isArray(o.material) ? o.material.map(recolor) : recolor(o.material);
  });
}

function wallpaper() {
  // A quiet painted print: irregular brush dabs and tiny floral dots, rather than ruler-straight stripes.
  let seed = 61234;
  const random = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);
  const t = canvasTexture(512, 512, (g) => {
    g.fillStyle = "#fff9f8";
    g.fillRect(0, 0, 512, 512);
    for (let i = 0; i < 5200; i++) {
      const x = random() * 512, y = random() * 512;
      g.fillStyle = random() > 0.5 ? "rgba(246,178,197,.055)" : "rgba(151,102,119,.025)";
      g.fillRect(x, y, 1 + random() * 8, 2 + random() * 15);
    }
    for (let col = 0; col < 4; col++) {
      const x = 64 + col * 128;
      g.fillStyle = "rgba(248,210,221,.19)";
      g.fillRect(x - 25, 0, 50, 512);
      for (let row = 0; row < 4; row++) {
        const y = 56 + row * 128 + (col % 2) * 40;
        g.fillStyle = "rgba(221,137,166,.32)";
        for (let p = 0; p < 5; p++) {
          g.beginPath();
          g.ellipse(x + Math.cos(p * Math.PI * 2 / 5) * 6, y + Math.sin(p * Math.PI * 2 / 5) * 6, 3, 5, p, 0, Math.PI * 2);
          g.fill();
        }
        g.fillStyle = "rgba(250,213,137,.55)";
        g.beginPath(); g.arc(x, y, 2.2, 0, Math.PI * 2); g.fill();
      }
    }
  });
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return t;
}

function windowView(evening: boolean) {
  return canvasTexture(256, 192, (c) => {
    const sky = c.createLinearGradient(0, 0, 0, 192);
    if (evening) {
      sky.addColorStop(0, "#ad91b4"); sky.addColorStop(0.55, "#f7b68f"); sky.addColorStop(1, "#ffe1a9");
    } else {
      sky.addColorStop(0, "#82c3e7"); sky.addColorStop(0.7, "#d8e7d7"); sky.addColorStop(1, "#fff0c8");
    }
    c.fillStyle = sky; c.fillRect(0, 0, 256, 192);
    c.fillStyle = evening ? "#fff0c2" : "#fff8db";
    c.beginPath(); c.arc(189, evening ? 85 : 49, evening ? 20 : 15, 0, Math.PI * 2); c.fill();
    c.fillStyle = evening ? "#8ea271" : "#83b676";
    c.beginPath(); c.moveTo(0, 153); c.bezierCurveTo(60, 112, 87, 156, 139, 130); c.bezierCurveTo(195, 105, 220, 151, 256, 132); c.lineTo(256, 192); c.lineTo(0, 192); c.fill();
    c.fillStyle = evening ? "#647c58" : "#5e9967";
    for (const [x, y, r] of [[13, 142, 35], [45, 131, 29], [231, 141, 35], [255, 130, 27]] as const) {
      c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); c.fill();
    }
  });
}

/** The room uses the same painted surfaces and soft trim as the finished outdoor zone. */
export function roomShell(evening = false) {
  const g = new THREE.Group();
  const [x0, z0, x1, z1] = ROOM;
  const centreX = (x0 + x1) / 2;
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(x1 - x0 + 0.8, z1 - z0 + 0.8), paintedMat("bilik_floor", x1 - x0 + 0.8, z1 - z0 + 0.8, 4.5, 0xfff5f2));
  floor.rotation.x = -Math.PI / 2;
  floor.position.set(centreX, -0.015, 0);
  floor.receiveShadow = true;
  g.add(floor);

  const paper = wallpaper();
  const back = paper.clone();
  back.repeat.set((x1 - x0) / 4, 1.1);
  back.needsUpdate = true;
  const side = paper.clone();
  side.repeat.set(2.25, 1.1);
  side.needsUpdate = true;
  const trim = paintedMat("plaster", 1, 1, 2, 0xfff6ee);
  const backWall = new THREE.Mesh(
    roundedBox(x1 - x0 + 0.8, WALL_H, 0.3, 0.06, 3),
    [trim, trim, trim, trim, new THREE.MeshLambertMaterial({ map: back }), trim],
  );
  backWall.position.set(centreX, WALL_H / 2, z0 - 0.15);
  g.add(backWall);
  for (const sx of [x0 - 0.15, x1 + 0.15]) {
    const mats = [trim, trim, trim, trim, trim, trim];
    mats[sx < 0 ? 0 : 1] = new THREE.MeshLambertMaterial({ map: side });
    const w = new THREE.Mesh(roundedBox(0.3, WALL_H, z1 - z0 + 0.8, 0.06, 3), mats);
    w.position.set(sx, WALL_H / 2, 0);
    g.add(w);
  }
  for (const [w, d, x, z, rot] of [[x1 - x0, 0.09, centreX, z0 + 0.04, 0], [z1 - z0, 0.09, x0 + 0.04, 0, Math.PI / 2], [z1 - z0, 0.09, x1 - 0.04, 0, Math.PI / 2]] as const) {
    const skirt = new THREE.Mesh(roundedBox(w, 0.18, d, 0.04), paintedMat("bilik_wood", w, 0.18, 2, 0xfff4f1));
    skirt.position.set(x, 0.1, z); skirt.rotation.y = rot; g.add(skirt);
  }

  // Window and curtains share a local frame on the left wall beside the bed.
  // The view still tells Qish when she has woken up a second time.
  const window = new THREE.Group();
  const glass = new THREE.Mesh(new THREE.PlaneGeometry(1.8, 1.35), new THREE.MeshBasicMaterial({ map: windowView(evening) }));
  glass.position.set(0, 2.25, 0.02);
  window.add(glass);
  const frameMat = paintedMat("bilik_wood", 1, 1, 2, 0xfff6ee);
  for (const [w, h, x, y] of [[2.0, 0.12, 0, 2.95], [2.0, 0.12, 0, 1.55], [0.12, 1.5, -1, 2.25], [0.12, 1.5, 1, 2.25], [0.08, 1.35, 0, 2.25]] as const) {
    const f = new THREE.Mesh(roundedBox(w, h, 0.1, 0.035), frameMat);
    f.position.set(x, y, 0.06);
    window.add(f);
  }
  for (const cx of [-1.25, 1.25]) {
    const c = modelBox("bilik_curtain", 0.58, 1.9, 0.22);
    if (c) {
      c.position.set(cx, 1.15, 0.18);
      window.add(c);
      continue;
    }
    const fallback = new THREE.Mesh(roundedBox(0.47, 1.9, 0.12, 0.05), paintedMat("plaster", 0.47, 1.9, 1, 0xffb8c8));
    (fallback.material as THREE.MeshLambertMaterial).color.set(0xf29ac1);
    fallback.position.set(cx, 2.05, 0.12);
    window.add(fallback);
  }
  const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 3.2, 16), flat(0xfff5f8));
  rod.rotation.z = Math.PI / 2; rod.position.set(0, 3.0, 0.18); window.add(rod);
  window.rotation.y = Math.PI / 2;
  window.position.set(x0 + 0.02, 0, -2.35);
  g.add(window);
  return shadowed(g);
}

/** Qish's bed against the back-left wall. Bowat's spot on the second pillow is empty. */
export function bed(x: number, z: number) {
  const generated = modelBox("bilik_bed", 3.2, 1.65, 4.15);
  if (generated) {
    generated.position.set(x, 0, z);
    return generated;
  }
  const g = new THREE.Group();
  const wood = flat(0xfff4ef);
  const frame = new THREE.Mesh(new THREE.BoxGeometry(3, 0.5, 4), wood);
  frame.position.y = 0.25;
  const head = new THREE.Mesh(new THREE.BoxGeometry(3.2, 1.7, 0.25), wood);
  head.position.set(0, 0.85, -2.05);
  const mattress = new THREE.Mesh(new THREE.BoxGeometry(2.85, 0.32, 3.85), flat(0xf29ac1));
  mattress.position.y = 0.66;
  const blanket = new THREE.Mesh(new THREE.BoxGeometry(2.95, 0.2, 2.5), flat(0xf29ac1));
  blanket.position.set(0, 0.86, 0.7);
  blanket.rotation.x = -0.03;
  const fold = new THREE.Mesh(new THREE.BoxGeometry(2.95, 0.24, 0.5), flat(0xf29ac1));
  fold.position.set(0, 0.9, -0.5);
  g.add(frame, head, mattress, blanket, fold);
  // Qish's pillow (left) and Bowat's spot (right) with only a dent left.
  const pillow = new THREE.Mesh(new THREE.BoxGeometry(1.15, 0.28, 0.7), flat(0xf29ac1));
  pillow.position.set(-0.68, 0.92, -1.45);
  pillow.rotation.z = 0.04;
  const bowatPillow = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.24, 0.66), flat(0xf29ac1));
  bowatPillow.position.set(0.7, 0.9, -1.45);
  const dent = new THREE.Mesh(new THREE.CircleGeometry(0.28, 24), new THREE.MeshLambertMaterial({ color: 0xe2a2b8 }));
  dent.rotation.x = -Math.PI / 2;
  dent.scale.set(1, 0.75, 1);
  dent.position.set(0.7, 1.025, -1.42);
  g.add(pillow, bowatPillow, dent);
  g.position.set(x, 0, z);
  return shadowed(g);
}

/** Desk with a lamp, her sketchbook and Qish's phone, whose screen glows. */
export function desk(x: number, z: number, turn = 0) {
  const generated = modelBox("bilik_desk", 2.65, 2.0, 2.0);
  if (generated) {
    generated.rotation.y = turn;
    generated.position.set(x, 0, z + 0.05);
    furniturePalette(generated);
    return { group: generated, update: (_t: number) => {} };
  }
  const g = new THREE.Group();
  const wood = flat(0xf29ac1);
  const top = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.12, 1.2), wood);
  top.position.y = 1.05;
  g.add(top);
  for (const [lx, lz] of [[-1.2, -0.5], [1.2, -0.5], [-1.2, 0.5], [1.2, 0.5]] as const) {
    const leg = new THREE.Mesh(new THREE.BoxGeometry(0.1, 1.0, 0.1), flat(0xf29ac1));
    leg.position.set(lx, 0.5, lz);
    g.add(leg);
  }
  const lampBase = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.2, 0.08, 10), flat(0xf29ac1));
  lampBase.position.set(-0.9, 1.15, -0.25);
  const lampPole = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.7, 6), flat(0xf29ac1));
  lampPole.position.set(-0.9, 1.5, -0.25);
  const shade = new THREE.Mesh(new THREE.ConeGeometry(0.3, 0.32, 10, 1, true), flat(0xf29ac1));
  shade.position.set(-0.9, 1.9, -0.25);
  g.add(lampBase, lampPole, shade);
  // Sketchbook (she draws) and pens.
  const book = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.05, 0.5), flat(0xf29ac1));
  book.position.set(0.05, 1.14, 0.1);
  book.rotation.y = 0.2;
  g.add(book);
  for (let i = 0; i < 3; i++) {
    const pen = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.45, 5), flat([0xe3350d, 0x3b6fe0, 0x17151f][i]));
    pen.rotation.z = Math.PI / 2;
    pen.position.set(0.1, 1.18 + i * 0.001, 0.42 + i * 0.06);
    g.add(pen);
  }
  const phone = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.05, 0.62), flat(0x222230));
  phone.position.set(0.85, 1.135, 0.12);
  phone.rotation.y = -0.25;
  const screenMat = new THREE.MeshBasicMaterial({ color: 0x9fb8ff });
  const screen = new THREE.Mesh(new THREE.PlaneGeometry(0.28, 0.54), screenMat);
  screen.rotation.x = -Math.PI / 2;
  screen.position.set(0, 0.03, 0);
  phone.add(screen);
  g.add(phone);
  const chair = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.12, 0.8), flat(0xf29ac1));
  chair.position.set(0.2, 0.6, 1.0);
  const chairBack = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.8, 0.1), flat(0xf29ac1));
  chairBack.position.set(0.2, 1.05, 1.38);
  const chairLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.6, 6), flat(0xf29ac1));
  chairLeg.position.set(0.2, 0.3, 1.0);
  g.add(chair, chairBack, chairLeg);
  g.position.set(x, 0, z);
  g.rotation.y = turn;
  const update = (t: number) => screenMat.color.setHSL(0.62, 0.9, 0.72 + Math.sin(t * 3) * 0.1);
  return { group: shadowed(g), update };
}

/** Pink pin board on the back wall: ten strip slots, empty until the strips come home. */
export function stripBoard(x: number, y: number, z: number, filled: boolean) {
  const g = new THREE.Group();
  const w = 3.15, h = 1.78;
  const frame = new THREE.Mesh(roundedBox(w + 0.16, h + 0.16, 0.13, 0.06), paintedMat("bilik_wood", w, h, 2.3, 0xfff4f1));
  g.add(frame);
  const cork = canvasTexture(512, 256, (c) => {
    c.fillStyle = "#eecbd6"; c.fillRect(0, 0, 512, 256);
    let seed = 8821;
    const random = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);
    for (let i = 0; i < 4100; i++) {
      c.fillStyle = random() > 0.5 ? "rgba(141,75,108,.075)" : "rgba(255,255,255,.22)";
      c.fillRect(random() * 512, random() * 256, 1 + random() * 8, 1 + random() * 3);
    }
  });
  const face = new THREE.Mesh(new THREE.PlaneGeometry(w - 0.13, h - 0.13), new THREE.MeshLambertMaterial({ map: cork }));
  face.position.z = 0.073; g.add(face);
  const colors = [0xe18aaa, 0xfff8f1, 0xc882a2, 0xf4b7c8, 0xe8c890];
  const loader = new THREE.TextureLoader();
  for (let i = 0; i < 10; i++) {
    const col = i % 5, row = Math.floor(i / 5);
    const px = -1.12 + col * 0.56, py = 0.40 - row * 0.78;
    if (filled) {
      const tex = loader.load(`/assets/strips/strip${i}.webp`);
      tex.colorSpace = THREE.SRGBColorSpace;
      const p = new THREE.Mesh(new THREE.PlaneGeometry(0.32, 0.63), new THREE.MeshBasicMaterial({ map: tex }));
      p.position.set(px, py, 0.092);
      p.rotation.z = ((i % 3) - 1) * 0.035;
      g.add(p);
    } else {
      const slot = canvasTexture(64, 112, (c) => {
        c.fillStyle = "rgba(175,100,134,.19)"; c.fillRect(0, 0, 64, 112);
        c.strokeStyle = "rgba(128,67,98,.8)"; c.lineWidth = 4; c.setLineDash([7, 5]);
        c.strokeRect(3, 3, 58, 106);
      });
      const p = new THREE.Mesh(new THREE.PlaneGeometry(0.32, 0.63), new THREE.MeshBasicMaterial({ map: slot, transparent: true, depthWrite: false }));
      p.position.set(px, py, 0.085); g.add(p);
    }
    const pin = new THREE.Mesh(new THREE.SphereGeometry(0.048, 12, 8), flat(colors[i % 5]));
    pin.position.set(px, py + 0.335, 0.11); g.add(pin);
  }
  g.position.set(x, y, z);
  return g;
}

export function wardrobe(x: number, z: number) {
  const generated = modelBox("bilik_wardrobe", 2.2, 3.05, 1.05);
  if (generated) {
    generated.rotation.y = Math.PI / 2;
    generated.position.set(x, 0, z);
    return generated;
  }
  const g = new THREE.Group();
  const body = new THREE.Mesh(new THREE.BoxGeometry(1.1, 3.0, 2.2), flat(0xf3e9dc));
  body.position.y = 1.5;
  g.add(body);
  for (const dz of [-0.53, 0.53]) {
    const knob = new THREE.Mesh(new THREE.SphereGeometry(0.06, 6, 4), flat(0xc9a24a));
    knob.position.set(0.57, 1.5, dz * 0.25);
    g.add(knob);
  }
  const line = new THREE.Mesh(new THREE.BoxGeometry(0.02, 2.8, 0.02), flat(0xc9b8a4));
  line.position.set(0.56, 1.5, 0);
  g.add(line);
  g.position.set(x, 0, z);
  return shadowed(g);
}

/** The bedroom door on the right wall, plus its frame. */
export function bedroomDoor(x: number, z: number) {
  const generated = modelBox("bilik_door", 1.65, 2.8, 0.22);
  if (generated) {
    generated.rotation.y = -Math.PI / 2;
    generated.position.set(x, 0, z);
    furniturePalette(generated, true);
    return generated;
  }
  const g = new THREE.Group();
  const wood = paintedMat("bilik_wood", 1.4, 2.6, 1.1, 0xf29ac1);
  const door = new THREE.Mesh(roundedBox(0.1, 2.6, 1.4, 0.045, 3), wood);
  door.position.y = 1.3;
  const frame = new THREE.Mesh(roundedBox(0.06, 2.8, 1.65, 0.025, 3), wood);
  frame.position.set(0.03, 1.4, 0);
  for (const py of [0.66, 1.88]) {
    const panel = new THREE.Mesh(roundedBox(0.018, 0.87, 1.07, 0.008, 3), wood);
    panel.position.set(-0.061, py, -0.03);
    g.add(panel);
  }
  const knob = new THREE.Mesh(new THREE.SphereGeometry(0.08, 16, 12), flat(0xf29ac1));
  knob.position.set(-0.08, 1.25, 0.5);
  g.add(frame, door, knob);
  g.position.set(x, 0, z);
  return shadowed(g);
}

/** Low cabinet with a TV and a console: two controllers, like always.
 * After the ending its screen invites a rematch. */
export function gameConsole(x: number, z: number, replay: boolean) {
  const generated = modelBox("bilik_console", 2.05, 1.95, 0.95);
  if (generated) {
    // The screen itself is authored in-game so its replay label remains sharp and stateful.
    // modelBox scales the outer group, so compensate for that scale when adding a new child.
    const scale = generated.scale.clone();
    const screen = new THREE.Mesh(new THREE.PlaneGeometry(1.32 / scale.x, 0.77 / scale.y), new THREE.MeshBasicMaterial({ map: consoleScreen(replay), transparent: true }));
    screen.position.set(0, 1.40 / scale.y, frontZ(generated, 0, 1.40) / scale.z + 0.015);
    generated.add(screen);
    generated.rotation.y = -Math.PI / 2;
    generated.position.set(x, 0, z);
    return { group: generated, update: (_t: number) => {} };
  }
  const g = new THREE.Group();
  const cab = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.7, 1.9), flat(0xf3e9dc));
  cab.position.y = 0.35;
  g.add(cab);
  const tv = new THREE.Mesh(new THREE.BoxGeometry(0.12, 1.0, 1.6), flat(0x1d1c26));
  tv.position.set(0.2, 1.25, 0);
  g.add(tv);
  const screenTex = consoleScreen(replay);
  const screenMat = new THREE.MeshBasicMaterial({ map: screenTex });
  const screen = new THREE.Mesh(new THREE.PlaneGeometry(1.45, 0.88), screenMat);
  screen.rotation.y = -Math.PI / 2;
  screen.position.set(0.13, 1.25, 0);
  g.add(screen);
  const box = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.12, 0.7), flat(0xffffff));
  box.position.set(-0.05, 0.76, 0.35);
  g.add(box);
  for (const [dz, c] of [[-0.55, 0xff8fb1], [-0.25, 0x3b6fe0]] as const) {
    const pad = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.08, 0.18), flat(c));
    pad.position.set(-0.15, 0.74, dz);
    pad.rotation.y = 0.3;
    g.add(pad);
  }
  g.position.set(x, 0, z);
  const update = (t: number) => screenMat.color.setScalar(replay ? 0.85 + Math.sin(t * 4) * 0.15 : 0.6);
  return { group: shadowed(g), update };
}

function consoleScreen(replay: boolean) {
  return canvasTexture(256, 160, (c) => {
    c.fillStyle = replay ? "#1f2f7a" : "#202436";
    c.fillRect(0, 0, 256, 160);
    c.textAlign = "center";
    c.textBaseline = "middle";
    c.fillStyle = "#ffcb05";
    c.font = "bold 34px 'Bagel Fat One', sans-serif";
    c.fillText(replay ? "MAIN SEMULA" : "PLAYER 2?", 128, 64);
    c.fillStyle = "#ffffff";
    c.font = "bold 24px 'Gaegu', sans-serif";
    c.fillText(replay ? "▶ 8 boss" : "...", 128, 112);
  });
}

export function rug(x: number, z: number) {
  const textile = canvasTexture(512, 512, (c) => {
    c.clearRect(0, 0, 512, 512);
    c.fillStyle = "#e9aebf";
    c.beginPath(); c.ellipse(256, 256, 246, 246, 0, 0, Math.PI * 2); c.fill();
    c.strokeStyle = "#f9e8dd"; c.lineWidth = 17;
    c.beginPath(); c.ellipse(256, 256, 204, 204, 0, 0, Math.PI * 2); c.stroke();
    c.strokeStyle = "rgba(138,78,117,.4)"; c.lineWidth = 3;
    c.beginPath(); c.ellipse(256, 256, 228, 228, 0, 0, Math.PI * 2); c.stroke();
    c.fillStyle = "#f7e8dd";
    c.beginPath(); c.ellipse(256, 256, 180, 180, 0, 0, Math.PI * 2); c.fill();
    // Soft woven strokes, clipped to the rug.
    c.save(); c.beginPath(); c.ellipse(256, 256, 242, 242, 0, 0, Math.PI * 2); c.clip();
    for (let row = 0; row < 120; row++) for (let col = 0; col < 90; col++) {
      const px = col * 6 + ((row * 13) % 5), py = row * 5;
      c.fillStyle = (row + col) % 3 ? "rgba(143,91,117,.027)" : "rgba(255,255,255,.055)";
      c.fillRect(px, py, 2, 1);
    }
    c.restore();
    // A little lily at the centre, a personal cue for Qish.
    c.fillStyle = "rgba(226,150,178,.64)";
    for (let i = 0; i < 6; i++) {
      c.save(); c.translate(256, 256); c.rotate(i * Math.PI / 3);
      c.beginPath(); c.ellipse(0, -38, 17, 40, 0, 0, Math.PI * 2); c.fill(); c.restore();
    }
    c.fillStyle = "#edc473"; c.beginPath(); c.arc(256, 256, 15, 0, Math.PI * 2); c.fill();
  });
  // Equal world-space axes keep the circular textile round instead of stretching it.
  const m = new THREE.Mesh(new THREE.PlaneGeometry(5.2, 5.2), new THREE.MeshLambertMaterial({ map: textile, transparent: true, depthWrite: false, side: THREE.DoubleSide }));
  m.rotation.x = -Math.PI / 2;
  m.position.set(x, 0.013, z);
  m.receiveShadow = true;
  return m;
}

export function pottedPlant(x: number, z: number) {
  const generated = model("bilik_plant", 1.12, "height");
  if (generated) {
    generated.position.set(x, 0, z);
    return generated;
  }
  const g = new THREE.Group();
  const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.28, 0.6, 8), flat(0xe8a17a));
  pot.position.y = 0.3;
  g.add(pot);
  for (let i = 0; i < 5; i++) {
    const leaf = new THREE.Mesh(new THREE.IcosahedronGeometry(0.32, 0), flat(0x5aa844));
    leaf.position.set(Math.cos(i * 1.3) * 0.22, 0.85 + (i % 3) * 0.22, Math.sin(i * 1.3) * 0.22);
    g.add(leaf);
  }
  g.position.set(x, 0, z);
  return shadowed(g);
}

/** A bobbing "?" over a clue until it has been looked at. */
export function clueMarker(x: number, y: number, z: number, found: () => boolean) {
  const tex = canvasTexture(64, 64, (c) => {
    c.fillStyle = "#ffcb05";
    c.beginPath();
    c.arc(32, 32, 28, 0, Math.PI * 2);
    c.fill();
    c.lineWidth = 5;
    c.strokeStyle = "#17151f";
    c.stroke();
    c.fillStyle = "#17151f";
    c.font = "bold 40px 'Bagel Fat One', sans-serif";
    c.textAlign = "center";
    c.textBaseline = "middle";
    c.fillText("?", 32, 35);
  });
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, depthTest: false }));
  s.scale.setScalar(0.6);
  s.renderOrder = 5;
  s.position.set(x, y, z);
  const update = (t: number) => {
    s.visible = !found();
    s.position.y = y + Math.sin(t * 3 + x) * 0.12;
  };
  return { sprite: s, update };
}
