import { BOSSES, type BossId } from "../content/bosses";
import { el } from "./dom";
import { runPicker } from "./picker";

const GENRE:Record<BossId,string>={bowat:"Platformer",bolat:"Rhythm",snorlax:"Tangkap makanan",blep:"Shooter",megabowat:"Flappy",bolatex:"Memory",qishex:"Runner",finale:"Finale"};
const PLACE:Record<BossId,string>={bowat:"Bukit Bintang",bolat:"Lorbel",snorlax:"Lakefront",blep:"KLIA",megabowat:"Nyomnyom City",bolatex:"FotoBooth",qishex:"Putrajaya",finale:"Litar Sepang"};

/** The bedroom console's post-game boss library. Only earned bosses are supplied by main. */
export function showBossSelect(bosses:BossId[]) {
  if(!bosses.length)return Promise.resolve<BossId|null>(null);
  const root=el("div","game-picker boss-library");
  root.setAttribute("role","dialog");root.setAttribute("aria-modal","true");root.setAttribute("aria-labelledby","boss-select-title");
  root.innerHTML=`<section class="picker-panel boss-panel"><header class="picker-header"><div><span class="picker-eyebrow">KONSOL BOLAT</span><h2 id="boss-select-title">Main semula boss</h2></div><button class="picker-close" aria-label="Tutup pilihan boss">×</button></header>
    <div class="boss-grid">${bosses.map(id=>{
      const number=Object.keys(BOSSES).indexOf(id)+1;
      return `<button class="boss-choice" data-boss="${id}" aria-label="Lawan ${BOSSES[id].name}"><img class="boss-banner-bg" src="/assets/storybook/bg_${id}.webp" alt=""><span class="boss-number">${String(number).padStart(2,"0")}</span><span class="boss-genre">${GENRE[id]}</span><img class="boss-banner-portrait" src="/assets/storybook/${id==="blep"?"../chars/babah_front":id==="finale"?"faris_idle":`${id}_idle`}.png" alt=""><span class="boss-banner-name"><strong>${BOSSES[id].name}</strong><small>${PLACE[id]}</small></span><span class="boss-play" aria-hidden="true">▶</span></button>`;
    }).join("")}</div>
    <footer class="picker-footer"><span>← ↑ ↓ → Pilih · <kbd data-control="a">Space</kbd> Main · <kbd data-control="b">Esc</kbd> Tutup</span><strong class="boss-caption"></strong></footer></section>`;
  const buttons=[...root.querySelectorAll<HTMLButtonElement>(".boss-choice")];
  return runPicker<BossId>(root,buttons,0,i=>{root.querySelector(".boss-caption")!.textContent=GENRE[bosses[i]];},i=>bosses[i]);
}
