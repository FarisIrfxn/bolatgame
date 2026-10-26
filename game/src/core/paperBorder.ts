/** Render a die-cut border inside the existing transparent margin. Frame sizes stay unchanged. */
export function paperBorder(source: CanvasImageSource & { width: number; height: number }, cellWidth = source.width, cellHeight = source.height) {
  const canvas = document.createElement("canvas");
  canvas.width = source.width; canvas.height = source.height;
  const g = canvas.getContext("2d")!;
  const cell = document.createElement("canvas"); cell.width = cellWidth; cell.height = cellHeight;
  const c = cell.getContext("2d")!;
  const layer = document.createElement("canvas"); layer.width = cellWidth; layer.height = cellHeight;
  const l = layer.getContext("2d")!;
  const border = Math.max(2, Math.round(cellHeight * .013));
  const rim = Math.max(1, Math.round(border * .3));
  for (let y=0;y<source.height;y+=cellHeight) for (let x=0;x<source.width;x+=cellWidth) {
    c.clearRect(0,0,cellWidth,cellHeight);
    for (const [radius,color] of [[border+rim,"#513c5166"],[border,"#fffdf6"]] as const) {
      l.clearRect(0,0,cellWidth,cellHeight);l.globalCompositeOperation="source-over";
      for (let n=0;n<24;n++) {
        const a=n/24*Math.PI*2;
        l.drawImage(source,x,y,cellWidth,cellHeight,Math.cos(a)*radius,Math.sin(a)*radius,cellWidth,cellHeight);
      }
      l.globalCompositeOperation="source-in";l.fillStyle=color;l.fillRect(0,0,cellWidth,cellHeight);
      c.drawImage(layer,0,0);
    }
    c.drawImage(source,x,y,cellWidth,cellHeight,0,0,cellWidth,cellHeight);
    g.drawImage(cell,x,y);
  }
  return canvas;
}
