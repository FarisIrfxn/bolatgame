import { THE_END } from "../content/ending";
import { el } from "../ui/dom";

/** The final keepsake, shared by the ending flow and its focused visual preview. */
export function createEndScreen() {
  return el("div", "the-end has-art", `
    <img class="ending-poster" src="${THE_END.art}" alt="Faris, Qish, Bolat, Raja Nonchalant, Bowat dan Encik Sloth">
    <div class="ending-message">
      <img class="ending-logo" src="/assets/ui/qish-logo.webp" alt="The Adventure of Qish">
      <section class="ending-keepsake" aria-label="Ucapan penutup">
        <div class="ending-word"><span aria-hidden="true">✦</span><h1>${THE_END.title}</h1><span aria-hidden="true">✦</span></div>
        <div class="ending-flourish" aria-hidden="true"><i></i>♥<i></i></div>
        <p class="ending-greeting">${THE_END.sub}</p>
        <button type="button" class="ending-continue"><span>${THE_END.hint}</span><span class="ending-continue-arrow" aria-hidden="true">→</span></button>
      </section>
    </div>`);
}
