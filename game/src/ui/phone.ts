import { input } from "../core/input";
import { sleep, waitFor } from "../core/loop";
import { sfx } from "../core/sfx";
import { PHONE } from "../content/script";
import { el, ui } from "./dom";

// Qish's phone, opened from the bedroom desk. Morning: the last chat with Faris, then she sends
// one more message that never gets a second tick. After the island ("wake"): it has been read,
// and Faris is typing.

const bubble = (from: string, text: string, time: string, ticks = "") =>
  `<div class="msg ${from}"><span>${text}</span><small>${time}${ticks ? ` <em>${ticks}</em>` : ""}</small></div>`;

export type PhoneMode = "send" | "unanswered" | "wake";

export async function showPhone(mode: PhoneMode) {
  const wake = mode === "wake";
  const history = PHONE.history.map((m) => bubble(m.from, m.text, m.time, m.from === "qish" ? "✓✓" : "")).join("");
  const root = el(
    "div",
    "phone-layer",
    `<div class="phone">
      <div class="phone-status">${wake ? PHONE.wake.status : PHONE.status}</div>
      <div class="phone-head"><b>${PHONE.contact}</b><small>${PHONE.lastSeen}</small></div>
      <div class="phone-chat">${history}${wake ? bubble("qish", PHONE.send, "7:42 AM", "✓✓") : ""}</div>
      <div class="phone-input"><span></span><i>➤</i></div>
    </div>
    <div class="phone-hint">Tekan <kbd data-control="a">Space</kbd> untuk tutup</div>`,
  );
  ui().appendChild(root);
  const chat = root.querySelector(".phone-chat") as HTMLElement;
  const head = root.querySelector(".phone-head small") as HTMLElement;
  const field = root.querySelector(".phone-input span") as HTMLElement;
  const hint = root.querySelector(".phone-hint") as HTMLElement;
  hint.hidden = true;
  root.querySelector(".phone")!.animate([{ transform: "translateY(60%) rotate(-6deg)", opacity: 0 }, { transform: "none", opacity: 1 }], {
    duration: 500,
    easing: "cubic-bezier(.2,1.3,.4,1)",
  });
  await sleep(900);
  if (wake) {
    head.textContent = "online";
    await sleep(500);
    for (const m of PHONE.wake.incoming) {
      head.textContent = "typing...";
      await sleep(900);
      chat.insertAdjacentHTML("beforeend", bubble("faris", m, PHONE.wake.time));
      sfx.blip();
      head.textContent = "online";
      await sleep(350);
    }
  } else {
    // The old messages are there; now the new one, or a reminder that it is still unanswered.
    const text = PHONE.send;
    if (mode === "send") {
      for (let i = 1; i <= text.length; i++) {
        field.textContent = text.slice(0, i);
        if (i % 2 === 0) sfx.talk();
        await sleep(70);
      }
      await sleep(300);
      field.textContent = "";
      sfx.blip();
    }
    chat.insertAdjacentHTML("beforeend", bubble("qish", text, "7:42 AM", "✓"));
  }
  await sleep(600);
  hint.hidden = false;
  let clicked = false;
  root.addEventListener("pointerdown", () => (clicked = true));
  await waitFor(() => input.pressed("a") || input.pressed("b") || clicked);
  sfx.blip();
  root.remove();
}
