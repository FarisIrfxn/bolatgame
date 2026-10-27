import "./style.css";
import "./ui/loading.css";
import "./core/viewport";
import { createAssetDownload } from "./core/preload";

const root = document.createElement("div");
root.className = "startup-loading dream";
root.setAttribute("aria-label", "Memuatkan game");
root.innerHTML = `<div class="dream-sky"></div><div class="dream-haze"></div>
  <div class="startup-content">
    <div class="startup-mascot"><img src="/assets/chars/bowat_front.png" alt="Bowat"><span></span></div>
    <h1>Sediakan adventure…</h1>
    <p class="startup-status" role="status">Bowat tengah siapkan semuanya untuk awak.</p>
    <div class="startup-track" role="progressbar" aria-label="Muat turun game" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"><div></div></div>
    <p class="startup-size">0 MB</p>
    <button class="startup-retry" hidden>Cuba lagi</button>
  </div>`;
document.getElementById("ui")!.appendChild(root);
const image = root.querySelector("img")!;
const status = root.querySelector<HTMLElement>(".startup-status")!;
const size = root.querySelector<HTMLElement>(".startup-size")!;
const bar = root.querySelector<HTMLElement>(".startup-track")!;
const ink = bar.firstElementChild as HTMLElement;
const retry = root.querySelector<HTMLButtonElement>("button")!;
const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
const idle = window.setInterval(() => {
  if (reduceMotion) return;
  const beat = Math.floor(performance.now() / 140) % 40;
  const face = beat === 20 || beat === 23 ? "blink" : beat >= 32 && beat <= 36 ? "yawn" : "normal";
  const src = `/assets/chars/bowat_front${face === "normal" ? "" : `_${face}`}.png`;
  if (image.getAttribute("src") !== src) image.src = src;
}, 140);

const download = createAssetDownload();
let game: typeof import("./main") | undefined;
let busy = false;
async function boot() {
  if (busy) return;
  busy = true;
  retry.hidden = true;
  status.textContent = "Bowat tengah siapkan semuanya untuk awak.";
  root.classList.remove("preparing", "download-error");
  try {
    await download.run(({ loaded, total }) => {
      const percent = total ? Math.floor(loaded / total * 100) : 100;
      ink.style.width = `${percent}%`;
      bar.setAttribute("aria-valuenow", String(percent));
      size.textContent = `${(loaded / 1_000_000).toFixed(1)} / ${(total / 1_000_000).toFixed(1)} MB · ${percent}%`;
    });
    status.textContent = "Semua dah dimuat. Sekejap lagi…";
    root.classList.add("preparing");
    // The loading view paints before the large game libraries are parsed. Main
    // prepares shared sprites/textures; GLBs are decoded when entering a zone.
    game ??= await import("./main");
    await game.startGame();
    window.clearInterval(idle);
    root.remove();
  } catch (error) {
    console.error("Game startup failed", error);
    root.classList.remove("preparing");
    root.classList.add("download-error");
    status.textContent = "Belum dapat siapkan semuanya. Semak sambungan dan cuba lagi ya.";
    retry.hidden = false;
  } finally { busy = false; }
}
retry.addEventListener("click", () => void boot());
// Ignore early taps/keys: Press Start is mounted only after downloads and setup.
void boot();
