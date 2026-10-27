import { save } from "../core/save";
import { getGraphicsPreference, setGraphicsPreference, type GraphicsPreference } from "../core/graphics";
import { el } from "./dom";
import { refreshHud } from "./hud";

export interface DevActions {
  title: () => void;
  intro: () => void;
  zones: { id: string; label: string }[];
  goZone: (id: string) => void;
  bossHere: () => void;
  winBoss: () => void;
  collectHere: () => void;
  reveal: (n: number) => void;
}

/**
 * Hidden panel for recording retakes: press ` (backquote) on keyboard, or tap the
 * top-left corner five times quickly on a phone.
 */
export function mountDevPanel(actions: DevActions) {
  let panel: HTMLDivElement | null = null;

  const render = () => {
    if (!panel) return;
    const s = save.data;
    panel.innerHTML = `<h4>Panel dev (rahsia)</h4>
      <div>Kad: ${s.cards.sort((a, b) => a - b).join(", ") || "-"}</div>`;
    const btn = (label: string, fn: () => void) => {
      const b = el("button", "", label);
      b.addEventListener("click", () => {
        fn();
        render();
      });
      panel!.appendChild(b);
    };
    const graphics = el("section", "dev-graphics");
    const graphicsTitle = el("strong", "", "Grafik (debug)");
    const graphicsSelect = el("select");
    const choices: [GraphicsPreference, string][] = [
      ["auto", "Auto ikut peranti"],
      ["rendah", "Rendah"],
      ["sederhana", "Sederhana"],
      ["tinggi", "Tinggi"],
    ];
    for (const [value, label] of choices) {
      const option = el("option", "", label);
      option.value = value;
      graphicsSelect.appendChild(option);
    }
    graphicsSelect.value = getGraphicsPreference();
    const graphicsHint = el("small", "", "Profil digunakan selepas reload. Auto ikut pengesanan peranti.");
    const applyGraphics = el("button", "", "Guna profil & reload");
    applyGraphics.type = "button";
    applyGraphics.addEventListener("click", () => {
      setGraphicsPreference(graphicsSelect.value as GraphicsPreference);
      window.location.reload();
    });
    graphics.append(graphicsTitle, graphicsSelect, graphicsHint, applyGraphics);
    panel.appendChild(graphics);
    const check = (label: string, value: boolean, fn: (v: boolean) => void) => {
      const l = el("label");
      const c = el("input");
      c.type = "checkbox";
      c.checked = value;
      c.addEventListener("change", () => fn(c.checked));
      l.append(c, label);
      panel!.appendChild(l);
    };
    check("Mode rakaman (nota kad rahsia)", s.recordingMode, (v) => {
      s.recordingMode = v;
      save.write();
    });
    check("Bowat dah join", save.flag("bowatJoined"), (v) => save.setFlag("bowatJoined", v));
    btn("▶ Title", actions.title);
    btn("▶ Intro (mimpi sofa)", actions.intro);
    const row = el("div");
    row.style.cssText = "display:grid;grid-template-columns:1fr 1fr;gap:4px";
    for (const z of actions.zones) {
      const b = el("button", "", `↪ ${z.label}`);
      b.addEventListener("click", () => actions.goZone(z.id));
      row.appendChild(b);
    }
    panel!.appendChild(row);
    btn("⚔ Boss zon ni", actions.bossHere);
    btn("⚡ Menang boss sekarang", actions.winBoss);
    btn("🍪 Kumpul semua zon ni", actions.collectHere);
    btn("▶ Uji card reveal (#5)", () => actions.reveal(5));
    btn("Reset 'dah serah kad'", () => {
      s.handedOver = [];
      save.write();
    });
    btn("Unlock semua kad", () => {
      s.cards = [1, 2, 3, 4, 5, 6, 7, 8];
      save.write();
      refreshHud();
    });
    btn("⚠ Reset save penuh", () => {
      save.reset();
      refreshHud();
    });
    btn("Tutup", toggle);
  };

  function toggle() {
    if (panel) {
      panel.remove();
      panel = null;
    } else {
      panel = el("div", "dev");
      document.body.appendChild(panel);
      render();
    }
  }

  window.addEventListener("keydown", (e) => {
    if (e.code === "Backquote") toggle();
  });

  let taps: number[] = [];
  window.addEventListener("pointerdown", (e) => {
    if (e.clientX > 70 || e.clientY > 70) return;
    const now = performance.now();
    taps = [...taps.filter((t) => now - t < 1500), now];
    if (taps.length >= 5) {
      taps = [];
      toggle();
    }
  });
}
