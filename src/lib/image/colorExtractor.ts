import { ColorData } from './types';

/**
 * Converts RGB components to ColorData with HEX, RGB, HSL, HSV, CMYK
 */
export function rgbToColorData(r: number, g: number, b: number, a = 1): ColorData {
  r = Math.max(0, Math.min(255, Math.round(r)));
  g = Math.max(0, Math.min(255, Math.round(g)));
  b = Math.max(0, Math.min(255, Math.round(b)));
  a = Math.max(0, Math.min(1, a));

  const isTransparent = a < 0.05;

  // HEX
  const toHex = (n: number) => n.toString(16).padStart(2, '0');
  const hex = `#${toHex(r)}${toHex(g)}${toHex(b)}`;

  // RGB strings
  const rgbString = a < 1 ? `rgba(${r}, ${g}, ${b}, ${+a.toFixed(2)})` : `rgb(${r}, ${g}, ${b})`;

  // HSL
  const rf = r / 255;
  const gf = g / 255;
  const bf = b / 255;
  const max = Math.max(rf, gf, bf);
  const min = Math.min(rf, gf, bf);
  const delta = max - min;

  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (delta !== 0) {
    s = l > 0.5 ? delta / (2 - max - min) : delta / (max + min);
    switch (max) {
      case rf:
        h = (gf - bf) / delta + (gf < bf ? 6 : 0);
        break;
      case gf:
        h = (bf - rf) / delta + 2;
        break;
      case bf:
        h = (rf - gf) / delta + 4;
        break;
    }
    h /= 6;
  }

  const hDeg = Math.round(h * 360);
  const sPct = Math.round(s * 100);
  const lPct = Math.round(l * 100);
  const hslString = a < 1
    ? `hsla(${hDeg}, ${sPct}%, ${lPct}%, ${+a.toFixed(2)})`
    : `hsl(${hDeg}, ${sPct}%, ${lPct}%)`;

  // HSV
  let v = max;
  let sHsv = max === 0 ? 0 : delta / max;
  const hsvString = `hsv(${hDeg}, ${Math.round(sHsv * 100)}%, ${Math.round(v * 100)}%)`;

  // CMYK approximation
  let c = 0;
  let m = 0;
  let y = 0;
  let k = 1 - max;

  if (k < 1) {
    c = (1 - rf - k) / (1 - k);
    m = (1 - gf - k) / (1 - k);
    y = (1 - bf - k) / (1 - k);
  }
  const cPct = Math.round(Math.max(0, c) * 100);
  const mPct = Math.round(Math.max(0, m) * 100);
  const yPct = Math.round(Math.max(0, y) * 100);
  const kPct = Math.round(Math.max(0, k) * 100);
  const cmykString = `cmyk(${cPct}%, ${mPct}%, ${yPct}%, ${kPct}%)`;

  // Relative luminance for dark vs light contrast (WCAG)
  const lum = 0.2126 * rf + 0.7152 * gf + 0.0722 * bf;
  const isDark = lum < 0.45;

  return {
    hex: hex.toUpperCase(),
    rgb: { r, g, b, a },
    rgbString,
    hsl: { h: hDeg, s: sPct, l: lPct },
    hslString,
    hsv: { h: hDeg, s: Math.round(sHsv * 100), v: Math.round(v * 100) },
    hsvString,
    cmyk: { c: cPct, m: mPct, y: yPct, k: kPct },
    cmykString,
    isDark,
    isTransparent,
  };
}

/**
 * Parses a HEX string into ColorData
 */
export function hexToColorData(hexStr: string): ColorData | null {
  let hex = hexStr.replace('#', '').trim();
  if (hex.length === 3) {
    hex = hex.split('').map((c) => c + c).join('');
  }
  if (hex.length !== 6 || !/^[0-9a-fA-F]{6}$/.test(hex)) {
    return null;
  }
  const num = parseInt(hex, 16);
  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;
  return rgbToColorData(r, g, b, 1);
}

/**
 * Extracts the pixel color from an Image/Canvas at specific image coordinates
 */
export function getPixelColorAt(
  canvas: HTMLCanvasElement,
  x: number,
  y: number
): ColorData {
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    return rgbToColorData(0, 0, 0, 1);
  }

  const boundedX = Math.max(0, Math.min(canvas.width - 1, Math.floor(x)));
  const boundedY = Math.max(0, Math.min(canvas.height - 1, Math.floor(y)));

  const pixel = ctx.getImageData(boundedX, boundedY, 1, 1).data;
  return rgbToColorData(pixel[0], pixel[1], pixel[2], pixel[3] / 255);
}

/**
 * Extracts a palette of sample dominant colors from an HTMLImageElement
 */
export function extractSamplePalette(img: HTMLImageElement, sampleCount = 8): ColorData[] {
  try {
    const canvas = document.createElement('canvas');
    const size = 120;
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    if (!ctx) return [];

    ctx.drawImage(img, 0, 0, size, size);
    const data = ctx.getImageData(0, 0, size, size).data;

    // Collect color samples across grid
    const colorMap = new Map<string, { r: number; g: number; b: number; count: number }>();

    for (let i = 0; i < data.length; i += 16) {
      const a = data[i + 3];
      if (a < 128) continue; // skip transparent

      // Quantize to 16 buckets
      const qr = Math.round(data[i] / 24) * 24;
      const qg = Math.round(data[i + 1] / 24) * 24;
      const qb = Math.round(data[i + 2] / 24) * 24;

      const key = `${qr},${qg},${qb}`;
      const existing = colorMap.get(key);
      if (existing) {
        existing.count += 1;
      } else {
        colorMap.set(key, { r: qr, g: qg, b: qb, count: 1 });
      }
    }

    const sorted = Array.from(colorMap.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, sampleCount);

    return sorted.map((c) => rgbToColorData(c.r, c.g, c.b, 1));
  } catch {
    return [];
  }
}
