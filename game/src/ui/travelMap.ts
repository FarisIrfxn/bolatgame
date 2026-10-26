import type { ZoneId } from "../overworld/zone";
import { el } from "./dom";
import { runPicker } from "./picker";

const PLACES: {id:ZoneId;name:string;x:number;y:number;icon:string;scene:string}[] = [
  {id:"labulanjut",name:"Labu Lanjut",x:18,y:22,icon:"cookie",scene:"/assets/ui/title-island.webp"},
  {id:"sunway",name:"Bukit Bintang",x:42,y:13,icon:"fart",scene:"/assets/storybook/bg_bowat.webp"},
  {id:"galeri",name:"Lorbel",x:68,y:17,icon:"request",scene:"/assets/storybook/bg_bolat.webp"},
  {id:"dusun",name:"Lakefront",x:82,y:39,icon:"lily",scene:"/assets/storybook/bg_snorlax.webp"},
  {id:"angkasa",name:"KLIA",x:78,y:70,icon:"spanner",scene:"/assets/storybook/bg_blep.webp"},
  {id:"cosyplace",name:"Nyomnyom City",x:53,y:82,icon:"resit",scene:"/assets/storybook/bg_megabowat.webp"},
  {id:"photobooth",name:"FotoBooth",x:27,y:77,icon:"film",scene:"/assets/storybook/bg_bolatex.webp"},
  {id:"bukit",name:"Putrajaya",x:12,y:56,icon:"star",scene:"/assets/storybook/bg_qishex.webp"},
  {id:"sepang",name:"Litar Sepang",x:27,y:44,icon:"pass",scene:"/assets/storybook/bg_finale.webp"},
];

/** The real island route and the same unlock rules used by gates. Current/locked nodes never travel. */
export function showTravelMap(here:ZoneId,unlocked:ZoneId[]) {
  const root=el("div","game-picker travel-map");
  root.setAttribute("role","dialog");root.setAttribute("aria-modal","true");root.setAttribute("aria-labelledby","travel-map-title");
  root.innerHTML=`<section class="picker-panel map-panel">
    <header class="picker-header"><div><span class="picker-eyebrow">MYVI TRAVEL</span><h2 id="travel-map-title">Nak ke mana?</h2></div><button class="picker-close" aria-label="Tutup peta">×</button></header>
    <div class="map-layout"><div class="map-board">
      <svg class="map-terrain" viewBox="0 0 1000 700" preserveAspectRatio="none" aria-hidden="true">
        <defs><linearGradient id="island-land" x2="0" y2="1"><stop stop-color="#eaf0c5"/><stop offset="1" stop-color="#c4d9a9"/></linearGradient><linearGradient id="map-sea" x2="0" y2="1"><stop stop-color="#d9eddf"/><stop offset="1" stop-color="#c0dfda"/></linearGradient></defs>
        <rect width="1000" height="700" rx="28" fill="url(#map-sea)"/>
        <path d="M105 135Q190 65 350 58Q470 15 635 65Q820 50 898 195Q955 280 900 400Q960 560 790 615Q645 685 480 640Q275 690 155 570Q10 490 62 355Q15 235 105 135Z" fill="#a4c4ae" transform="translate(0 15)"/>
        <path d="M105 135Q190 65 350 58Q470 15 635 65Q820 50 898 195Q955 280 900 400Q960 560 790 615Q645 685 480 640Q275 690 155 570Q10 490 62 355Q15 235 105 135Z" fill="url(#island-land)" stroke="#fff9dc" stroke-width="13"/>
        <path d="M380 65Q420 185 540 220T570 435Q540 560 650 650" fill="none" stroke="#bad9c7" stroke-width="29"/>
        <path d="M380 65Q420 185 540 220T570 435Q540 560 650 650" fill="none" stroke="#dfefe0" stroke-width="10"/>
        <path d="M180 154Q260 85 420 91T680 119Q830 130 820 273T780 490Q700 580 530 574T270 539Q120 530 120 392T270 308Q230 245 180 154" fill="none" stroke="#e1caa2" stroke-width="23" stroke-linecap="round"/>
        <path d="M180 154Q260 85 420 91T680 119Q830 130 820 273T780 490Q700 580 530 574T270 539Q120 530 120 392T270 308Q230 245 180 154" fill="none" stroke="#fff9e6" stroke-width="4" stroke-dasharray="8 13"/>
        <g fill="#a1bf91" opacity=".65"><circle cx="365" cy="330" r="35"/><circle cx="335" cy="340" r="26"/><circle cx="690" cy="360" r="32"/><circle cx="725" cy="375" r="25"/><circle cx="400" cy="480" r="22"/></g>
        <g fill="none" stroke="#fff9e7" stroke-width="4" stroke-linecap="round"><path d="M22 600q30 15 60 0m745 65q35 16 70 0M925 76q25 12 50 0M45 72q22 10 44 0"/></g>
      </svg>
      ${PLACES.map(p=>`<button class="map-stop ${unlocked.includes(p.id)?"":"locked"} ${here===p.id?"here":""}" data-zone="${p.id}" style="--map-x:${p.x}%;--map-y:${p.y}%" aria-label="${p.name}${here===p.id?", awak di sini":unlocked.includes(p.id)?"":", belum dibuka"}"><span class="map-dot"><img src="/assets/storybook/item_${p.icon}.png" alt="">${unlocked.includes(p.id)?"":'<span class="map-lock">🔒</span>'}</span><strong>${p.name}</strong>${here===p.id?'<span class="map-here">AWAK DI SINI</span>':""}</button>`).join("")}
    </div><aside class="map-destination"><div class="map-preview"><img alt=""></div><div class="destination-copy"><span class="destination-state"></span><h3></h3><p></p></div><button class="picker-confirm">Pergi <span>➜</span></button></aside></div>
    <footer class="picker-footer"><span>← ↑ ↓ → Pilih · <kbd data-control="a">Space</kbd> Pergi · <kbd data-control="b">Esc</kbd> Tutup</span><span>🔒 Belum dibuka</span></footer>
  </section>`;
  const buttons=[...root.querySelectorAll<HTMLButtonElement>(".map-stop")];
  const confirm=root.querySelector<HTMLButtonElement>(".picker-confirm")!;
  const select=(i:number)=>{
    const p=PLACES[i],available=unlocked.includes(p.id),current=p.id===here;
    root.querySelector<HTMLImageElement>(".map-preview img")!.src=p.scene;
    root.querySelector(".destination-copy h3")!.textContent=p.name;
    root.querySelector(".destination-state")!.textContent=current?"AWAK DI SINI":available?"DESTINASI DIBUKA":"BELUM DIBUKA";
    root.querySelector(".destination-copy p")!.textContent=current?"Myvi sedang parkir di sini.":available?"Jom naik Myvi dan sambung perjalanan.":"Teruskan pengembaraan untuk buka laluan ini.";
    confirm.disabled=!available||current;
    root.querySelector(".map-destination")!.classList.toggle("locked",!available);
  };
  return runPicker<ZoneId>(root,buttons,Math.max(0,PLACES.findIndex(p=>p.id===here)),select,i=>unlocked.includes(PLACES[i].id)&&PLACES[i].id!==here?PLACES[i].id:undefined);
}
