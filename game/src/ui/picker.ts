import { input } from "../core/input";
import { onFrame } from "../core/loop";
import { sfx } from "../core/sfx";
import { ui } from "./dom";

/** Shared keyboard/gamepad/touch behaviour for the map and boss library. */
export function runPicker<T extends string>(root: HTMLElement, buttons: HTMLButtonElement[], initial: number,
  select: (index: number) => void, activate: (index: number) => T | undefined) {
  const previous = document.activeElement as HTMLElement | null;
  ui().appendChild(root);
  let selected=Math.max(0,initial), settled=false, armed=false, held="", repeat=0;
  const paint=(index: number, focus=false)=>{
    selected=index;
    buttons.forEach((b,i)=>{ b.classList.toggle("sel",i===index); b.tabIndex=i===index?0:-1; b.setAttribute("aria-pressed",String(i===index)); });
    select(index);
    if(focus){ buttons[index]?.focus({preventScroll:true});buttons[index]?.scrollIntoView({block:"nearest",inline:"nearest"}); }
  };
  return new Promise<T|null>((resolve)=>{
    const finish=(value:T|null)=>{
      if(settled)return;settled=true;off();root.remove();previous?.isConnected&&previous.focus({preventScroll:true});
      sfx.select();resolve(value);
    };
    const pick=()=>{const value=activate(selected);if(value!==undefined)finish(value);};
    buttons.forEach((button,i)=>{
      button.addEventListener("pointerenter",()=>paint(i));
      button.addEventListener("focus",()=>paint(i));
      button.addEventListener("click",()=>{paint(i);pick();});
    });
    root.querySelector<HTMLButtonElement>(".picker-close")?.addEventListener("click",()=>finish(null));
    root.querySelector<HTMLButtonElement>(".picker-confirm")?.addEventListener("click",pick);
    root.addEventListener("click",e=>{if(e.target===root)finish(null);});
    root.addEventListener("keydown",e=>{
      if(e.key!=="Tab")return;
      const tabbable=[...root.querySelectorAll<HTMLElement>('button:not(:disabled):not([tabindex="-1"])')];
      const first=tabbable[0],last=tabbable[tabbable.length-1];
      if(e.shiftKey&&document.activeElement===first){e.preventDefault();last?.focus();}
      else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first?.focus();}
    });
    const move=(dx:number,dy:number)=>{
      const box=buttons[selected]?.getBoundingClientRect();if(!box)return;
      const x=box.x+box.width/2,y=box.y+box.height/2;
      let next=selected,best=Infinity;
      buttons.forEach((button,i)=>{
        if(i===selected)return;const b=button.getBoundingClientRect();
        const vx=b.x+b.width/2-x,vy=b.y+b.height/2-y;
        const forward=vx*dx+vy*dy,cross=Math.abs(vy*dx-vx*dy);
        const score=forward+cross*2.5;if(forward>8&&score<best){best=score;next=i;}
      });
      if(next!==selected){paint(next,true);sfx.blip();}
    };
    const off=onFrame(dt=>{
      if(!root.isConnected){finish(null);return;}
      // Wait for the opening A press to be released before accepting menu input.
      if(!armed){if(!input.down("a")&&!input.down("b"))armed=true;return;}
      if(input.pressed("b")){finish(null);return;}
      const axis=input.axis();
      const dx=Math.abs(axis.x)>.5&&Math.abs(axis.x)>=Math.abs(axis.y)?Math.sign(axis.x):0;
      const dy=!dx&&Math.abs(axis.y)>.5?Math.sign(axis.y):0;
      const direction=`${dx},${dy}`;
      if(!dx&&!dy){held="";repeat=0;}
      else if(direction!==held){held=direction;repeat=.4;move(dx,dy);}
      else {repeat-=Math.max(0,dt);if(repeat<=0){move(dx,dy);repeat=.14;}}
      if(input.pressed("a"))pick();
    });
    paint(selected,true);
  });
}
