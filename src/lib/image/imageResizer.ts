import { ImageFormat } from './types';

export interface ResizeOptions {
  width: number;
  height: number;
  format: ImageFormat;
  quality: number;
  backgroundColor?: string;
}

export interface ResizeResult {
  blob: Blob;
  objectUrl: string;
  width: number;
  height: number;
  fileSize: number;
  format: ImageFormat;
}

/**
 * Resizes an image to exact target dimensions using HTML5 Canvas
 */
export async function resizeImage(
  img: HTMLImageElement,
  options: ResizeOptions
): Promise<ResizeResult> {
  const { width, height, format, quality, backgroundColor = '#ffffff' } = options;

  const validWidth = Math.max(1, Math.min(16384, Math.round(width)));
  const validHeight = Math.max(1, Math.min(16384, Math.round(height)));

  const canvas = document.createElement('canvas');
  canvas.width = validWidth;
  canvas.height = validHeight;

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Canvas 2D context creation failed.');
  }

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  if (format === 'image/jpeg') {
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, validWidth, validHeight);
  }

  ctx.drawImage(img, 0, 0, validWidth, validHeight);

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (b) => {
        if (b) resolve(b);
        else reject(new Error('Resizing failed to produce image binary blob.'));
      },
      format,
      format === 'image/png' ? undefined : quality
    );
  });

  const objectUrl = URL.createObjectURL(blob);

  return {
    blob,
    objectUrl,
    width: validWidth,
    height: validHeight,
    fileSize: blob.size,
    format,
  };
}
