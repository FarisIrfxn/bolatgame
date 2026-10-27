// Safari may expose canvas filters without actually applying them. Probe pixels
// once, then use the same Gaussian on the mask pixels when filters don't work.
let nativeBlur: boolean | undefined;

function supportsBlur() {
  if (nativeBlur !== undefined) return nativeBlur;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 9;
  const ctx = canvas.getContext("2d")!;
  ctx.filter = "blur(1px)";
  ctx.fillStyle = "white";
  ctx.fillRect(4, 4, 1, 1);
  nativeBlur = ctx.getImageData(3, 4, 1, 1).data[3] > 0;
  return nativeBlur;
}

/** Opaque RGB splat masks only; runs once per zone, never in the frame loop. */
export function blurMask(source: HTMLCanvasElement, sigma: number): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  const w = canvas.width = source.width;
  const h = canvas.height = source.height;
  const ctx = canvas.getContext("2d")!;
  if (supportsBlur()) {
    ctx.filter = `blur(${sigma}px)`;
    ctx.drawImage(source, 0, 0);
    return canvas;
  }
  const image = source.getContext("2d")!.getImageData(0, 0, w, h);
  const data = image.data;
  const radius = Math.ceil(3 * sigma);
  const kernel = Array.from({ length: 2 * radius + 1 }, (_, i) => Math.exp(-((i - radius) ** 2) / (2 * sigma * sigma)));
  const total = kernel.reduce((sum, v) => sum + v, 0);
  for (let i = 0; i < kernel.length; i++) kernel[i] /= total;
  const horizontal = new Uint8ClampedArray(w * h * 3);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const out = (y * w + x) * 3;
    let r = 0, g = 0, b = 0;
    for (let k = -radius; k <= radius; k++) {
      const offset = (y * w + Math.max(0, Math.min(w - 1, x + k))) * 4;
      const weight = kernel[k + radius];
      r += data[offset] * weight;
      g += data[offset + 1] * weight;
      b += data[offset + 2] * weight;
    }
    horizontal[out] = r; horizontal[out + 1] = g; horizontal[out + 2] = b;
  }
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const out = (y * w + x) * 4;
    let r = 0, g = 0, b = 0;
    for (let k = -radius; k <= radius; k++) {
      const offset = (Math.max(0, Math.min(h - 1, y + k)) * w + x) * 3;
      const weight = kernel[k + radius];
      r += horizontal[offset] * weight;
      g += horizontal[offset + 1] * weight;
      b += horizontal[offset + 2] * weight;
    }
    data[out] = r; data[out + 1] = g; data[out + 2] = b;
  }
  ctx.putImageData(image, 0, 0);
  return canvas;
}
