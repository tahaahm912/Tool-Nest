import { ImageFormat } from './types';

export interface ConversionOptions {
  targetFormat: ImageFormat;
  quality: number; // 0.1 to 1.0
  backgroundColor?: string; // used when output is image/jpeg
}

export interface ConversionResult {
  blob: Blob;
  objectUrl: string;
  originalSize: number;
  newSize: number;
  width: number;
  height: number;
  targetFormat: ImageFormat;
}

/**
 * Checks if the image has any transparent pixels
 */
export function detectImageTransparency(img: HTMLImageElement): boolean {
  try {
    const canvas = document.createElement('canvas');
    // Sample down to max 256x256 for fast detection
    const scale = Math.min(1, 256 / Math.max(img.naturalWidth, img.naturalHeight));
    const w = Math.max(1, Math.round(img.naturalWidth * scale));
    const h = Math.max(1, Math.round(img.naturalHeight * scale));

    canvas.width = w;
    canvas.height = h;

    const ctx = canvas.getContext('2d');
    if (!ctx) return false;

    ctx.drawImage(img, 0, 0, w, h);
    const imageData = ctx.getImageData(0, 0, w, h).data;

    for (let i = 3; i < imageData.length; i += 4) {
      if (imageData[i] < 250) {
        return true;
      }
    }
    return false;
  } catch {
    return false;
  }
}

/**
 * Converts an image to the requested format using HTML5 Canvas
 */
export async function convertImageFormat(
  img: HTMLImageElement,
  originalSize: number,
  options: ConversionOptions
): Promise<ConversionResult> {
  const { targetFormat, quality, backgroundColor = '#ffffff' } = options;

  const width = img.naturalWidth || img.width;
  const height = img.naturalHeight || img.height;

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Canvas 2D context creation failed.');
  }

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  // Fill opaque background for JPEG
  if (targetFormat === 'image/jpeg') {
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, width, height);
  }

  ctx.drawImage(img, 0, 0, width, height);

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (b) => {
        if (b) resolve(b);
        else reject(new Error('Format conversion failed.'));
      },
      targetFormat,
      targetFormat === 'image/png' ? undefined : quality
    );
  });

  const objectUrl = URL.createObjectURL(blob);

  return {
    blob,
    objectUrl,
    originalSize,
    newSize: blob.size,
    width,
    height,
    targetFormat,
  };
}
