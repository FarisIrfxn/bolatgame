/** Small local crash trail for phone Safari, including cases where the page dies
 * before a console can be inspected. Open ?diag=1 to copy it after reopening. */
const KEY = "qish-diagnostics-v1";
type Entry = { at: string; event: string; detail?: unknown };
let entries: Entry[] = [];
try { entries = JSON.parse(localStorage.getItem(KEY) || "[]") as Entry[]; } catch { /* private browsing may block storage */ }
if (!Array.isArray(entries)) entries = [];

let view: HTMLTextAreaElement | null = null;
function refresh() { if (view) view.value = JSON.stringify(entries, null, 2); }

export function diagnostic(event: string, detail?: unknown) {
  entries.push({ at: new Date().toISOString(), event, ...(detail === undefined ? {} : { detail }) });
  entries = entries.slice(-60);
  try { localStorage.setItem(KEY, JSON.stringify(entries)); } catch { /* keep playing if storage is full */ }
  refresh();
}

let resizeLoopErrors = 0;
let lastResizeLoopLog = 0;
window.addEventListener("error", e => {
  if (e.message === "ResizeObserver loop completed with undelivered notifications.") {
    resizeLoopErrors++;
    const now = performance.now();
    if (now - lastResizeLoopLog >= 5000) {
      lastResizeLoopLog = now;
      diagnostic("resize observer loop", { count: resizeLoopErrors, viewport: [innerWidth, innerHeight], visualViewport: window.visualViewport ? [Math.round(window.visualViewport.width), Math.round(window.visualViewport.height)] : null });
      resizeLoopErrors = 0;
    }
    return;
  }
  diagnostic("js error", { message: e.message, file: e.filename, line: e.lineno });
});
window.addEventListener("unhandledrejection", e => diagnostic("promise error", String(e.reason?.stack || e.reason)));
document.addEventListener("visibilitychange", () => diagnostic("visibility changed", { state: document.visibilityState, viewport: [innerWidth, innerHeight] }));
window.addEventListener("pagehide", e => diagnostic("page hidden", { persisted: e.persisted, state: document.visibilityState, viewport: [innerWidth, innerHeight] }));
const navigation = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined;
diagnostic("page opened", { ua: navigator.userAgent, viewport: [innerWidth, innerHeight], dpr: devicePixelRatio, navigation: navigation?.type ?? "unknown", deviceMemory: (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? null });

if (new URLSearchParams(location.search).has("diag")) {
  const show = () => {
    const panel = document.createElement("aside");
    panel.style.cssText = "position:fixed;z-index:99999;left:50%;top:max(4px,env(safe-area-inset-top));transform:translateX(-50%);padding:4px;background:#fff9ed;color:#34233b;border:2px solid #c47b9c;border-radius:10px;font:13px sans-serif";
    const toggle = document.createElement("button");
    toggle.textContent = "Log";
    const head = document.createElement("div");
    head.textContent = "Diagnostik tempatan · boleh salin selepas refresh";
    const copy = document.createElement("button");
    copy.textContent = "Salin log";
    copy.style.cssText = "float:right;margin:4px;padding:5px 9px";
    view = document.createElement("textarea");
    view.readOnly = true;
    view.style.cssText = "display:block;width:100%;height:30vh;box-sizing:border-box;font:11px monospace";
    copy.onclick = () => {
      void navigator.clipboard?.writeText(view!.value).then(() => { copy.textContent = "Disalin"; }).catch(() => view!.select());
      if (!navigator.clipboard) view!.select();
    };
    const setOpen = (open: boolean) => {
      panel.style.width = open ? "min(90vw,420px)" : "auto";
      head.hidden = copy.hidden = view!.hidden = !open;
      toggle.textContent = open ? "Tutup log" : "Log";
    };
    let open = false;
    toggle.onclick = () => { open = !open; setOpen(open); };
    panel.append(toggle, head, copy, view);
    setOpen(false);
    document.body.appendChild(panel);
    refresh();
  };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", show, { once: true });
  else show();
}
