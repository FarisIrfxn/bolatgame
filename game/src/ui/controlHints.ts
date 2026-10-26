import { input, type Button } from "../core/input";
import { onFrame } from "../core/loop";

/** Explicit action tokens keep prose and character names untouched. */
export function controlHints(text: string) {
  return text.replace(/\b([AB])\b/g, token => `<kbd data-control="${token.toLowerCase()}">${input.label(token.toLowerCase() as Button)}</kbd>`);
}

let dirty = true;
const observer = new MutationObserver(() => { dirty = true; });
observer.observe(document.body, { childList: true, subtree: true });
let previous = "";
onFrame(() => {
  const labels = `${input.lastDevice}:${input.label("a")}:${input.label("b")}`;
  if (previous !== labels) {
    previous = labels; dirty = true;
    document.body.dataset.inputDevice = input.lastDevice;
  }
  if (!dirty) return;
  dirty = false;
  document.querySelectorAll<HTMLElement>("[data-control]").forEach(node => {
    const label = input.label(node.dataset.control as Button);
    if (node.textContent !== label) node.textContent = label;
  });
});
