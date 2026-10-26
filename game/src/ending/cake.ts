import { input } from "../core/input";
import { onFrame } from "../core/loop";
import { sfx } from "../core/sfx";
import { el } from "../ui/dom";

// The birthday cake moment: 26 candles, blown out by blowing into the mic
// (or holding A / pressing on the cake when there is no mic).

interface Mic {
  level(): number;
  close(): void;
}

async function openMic(isClosed: () => boolean): Promise<Mic | null> {
  let stream: MediaStream | null = null;
  let ac: AudioContext | null = null;
  try {
    stream = await navigator.mediaDevices.getUserMedia({
      audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false },
    });
    // getUserMedia cannot be cancelled. A late permission response must not leave
    // the mic recording after the player has finished with the button fallback.
    if (isClosed()) {
      stream.getTracks().forEach((t) => t.stop());
      return null;
    }
    ac = new AudioContext();
    void ac.resume().catch(() => {});
    const an = ac.createAnalyser();
    an.fftSize = 1024;
    ac.createMediaStreamSource(stream).connect(an);
    const buf = new Float32Array(an.fftSize);
    const context = ac;
    const tracks = stream.getTracks();
    let closed = false;
    return {
      level() {
        an.getFloatTimeDomainData(buf);
        let sum = 0;
        for (const v of buf) sum += v * v;
        return Math.sqrt(sum / buf.length);
      },
      close() {
        if (closed) return;
        closed = true;
        tracks.forEach((t) => t.stop());
        void context.close().catch(() => {});
      },
    };
  } catch {
    stream?.getTracks().forEach((t) => t.stop());
    if (ac && ac.state !== "closed") void ac.close().catch(() => {});
    return null;
  }
}

interface Candle {
  x: number;
  y: number;
  lit: boolean;
  smoke: number;
}

function layout(count: number, w: number) {
  const candles: Candle[] = [];
  const rows = [Math.ceil(count / 2), Math.floor(count / 2)];
  rows.forEach((n, r) => {
    for (let i = 0; i < n; i++) {
      const span = w * (r === 0 ? 0.4 : 0.36);
      candles.push({
        x: w / 2 - span / 2 + (span * (i + 0.5)) / n,
        y: 140 + r * 22,
        lit: true,
        smoke: 0,
      });
    }
  });
  return candles;
}

function draw(g: CanvasRenderingContext2D, w: number, h: number, candles: Candle[], t: number, art: HTMLImageElement, candleArt: HTMLImageElement) {
  g.clearRect(0, 0, w, h);
  // The raised illustration is separate from the live candle/flame/smoke layer.
  g.drawImage(art, w / 2 - 250, 45, 500, 395);
  // Candles
  for (const c of candles) {
    // Painted wax, spiral stripes, wick and highlights; only the live flame is procedural.
    g.drawImage(candleArt, c.x - 6, c.y - 44, 12, 44);
    if (c.lit) {
      const f = 1 + Math.sin(t * 18 + c.x) * 0.15;
      const grd = g.createRadialGradient(c.x, c.y - 48, 1, c.x, c.y - 48, 22);
      grd.addColorStop(0, "rgba(255,230,140,.85)");
      grd.addColorStop(1, "rgba(255,200,80,0)");
      g.fillStyle = grd;
      g.fillRect(c.x - 22, c.y - 66, 44, 44);
      g.fillStyle = "#ffb703";
      g.beginPath();
      g.ellipse(c.x, c.y - 48, 6, 11 * f, 0, 0, Math.PI * 2);
      g.fill();
      g.fillStyle = "#fff3b0";
      g.beginPath();
      g.ellipse(c.x, c.y - 45, 3, 6 * f, 0, 0, Math.PI * 2);
      g.fill();
    } else if (c.smoke > 0) {
      g.fillStyle = `rgba(200,200,210,${c.smoke})`;
      g.beginPath();
      g.arc(c.x + Math.sin(t * 5 + c.x) * 4, c.y - 48 - (1 - c.smoke) * 40, 6 + (1 - c.smoke) * 8, 0, Math.PI * 2);
      g.fill();
    }
  }
}

/** Shows the cake and resolves when every candle is out. */
export async function blowCandles(root: HTMLElement, count: number) {
  const art = new Image();
  art.src = "/assets/ui/mango-cake.webp";
  const candleArt = new Image();
  candleArt.src = "/assets/ending/candle.png";
  await Promise.all([art.decode(), candleArt.decode()]);
  const wrap = el("div", "cake-scene");
  const canvas = el("canvas");
  const W = 640;
  const H = 460;
  const resolution = Math.min(2, window.devicePixelRatio || 1);
  canvas.width = W * resolution;
  canvas.height = H * resolution;
  const hint = el("div", "cake-hint", `Tiup lilin! 🎂<br><small>Tiup ke mikrofon, atau tahan <kbd data-control="a">Space</kbd> / tekan kek</small>`);
  const meter = el("div", "cake-meter", "<div></div>");
  meter.hidden = true;
  wrap.append(canvas, hint, meter);
  root.appendChild(wrap);
  const g = canvas.getContext("2d")!;
  g.scale(resolution, resolution);
  const candles = layout(count, W);
  const stopSong = sfx.happyBirthday();

  let mic: Mic | null = null;
  let closed = false;
  let pressing = false;
  const press = () => (pressing = true);
  canvas.addEventListener("pointerdown", press);
  const release = () => (pressing = false);
  window.addEventListener("pointerup", release);
  window.addEventListener("pointercancel", release);
  window.addEventListener("blur", release);

  // Draw and enable buttons immediately; permission can remain pending forever.
  draw(g, W, H, candles, performance.now() / 1000, art, candleArt);
  void openMic(() => closed || !wrap.isConnected).then((ready) => {
    if (closed || !wrap.isConnected) { ready?.close(); return; }
    mic = ready;
    if (mic) {
      meter.hidden = false;
      hint.innerHTML = `Tiup lilin! 🎂<br><small>🎤 Mic aktif · tiup kuat-kuat (atau tahan <kbd data-control="a">Space</kbd>)</small>`;
    }
  });

  await new Promise<void>((resolve) => {
    let acc = 0;
    let doneT = -1;
    const off = onFrame((dt, t) => {
      if (!wrap.isConnected) { off(); resolve(); return; }
      const level = mic ? mic.level() : 0;
      if (mic) (meter.firstElementChild as HTMLElement).style.width = `${Math.min(100, level * 600)}%`;
      const blowing = level > 0.12 || input.down("a") || pressing;
      if (blowing && doneT < 0) {
        acc += dt;
        while (acc > 0.09) {
          acc -= 0.09;
          const lit = candles.filter((c) => c.lit);
          if (lit.length) {
            const c = lit[Math.floor(Math.random() * lit.length)];
            c.lit = false;
            c.smoke = 1;
            sfx.puff();
          }
        }
      }
      for (const c of candles) if (!c.lit) c.smoke = Math.max(0, c.smoke - dt * 0.6);
      draw(g, W, H, candles, t, art, candleArt);
      if (doneT < 0 && candles.every((c) => !c.lit)) doneT = t;
      if (doneT >= 0 && t - doneT > 1.2) {
        off();
        resolve();
      }
    });
  });
  closed = true;
  stopSong();
  canvas.removeEventListener("pointerdown", press);
  window.removeEventListener("pointerup", release);
  window.removeEventListener("pointercancel", release);
  window.removeEventListener("blur", release);
  // Assignment is asynchronous through the permission callback.
  (mic as Mic | null)?.close();
  hint.remove();
  meter.remove();
  return wrap;
}
