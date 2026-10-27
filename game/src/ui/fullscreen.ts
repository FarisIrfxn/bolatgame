import { el } from "./dom";

/** An explicit browser gesture; installed apps already open without browser chrome. */
export function mountFullscreenButton(parent: HTMLElement) {
  if (!document.fullscreenEnabled || (!navigator.maxTouchPoints && !matchMedia("(any-pointer: coarse)").matches)) return;
  const button = el("button", "mobile-fullscreen", "⛶");
  button.type = "button";
  button.setAttribute("aria-label", "Skrin penuh");
  button.title = "Skrin penuh";
  button.addEventListener("pointerdown", event => event.stopPropagation());
  button.addEventListener("click", event => {
    event.stopPropagation();
    void document.documentElement.requestFullscreen({ navigationUI: "hide" }).catch(() => {
      // Unsupported browser policies still allow the full visible game viewport.
      button.hidden = true;
    });
  });
  parent.appendChild(button);
}
