import { ImageFormat } from './types';

export interface CompressionOptions {
  quality: number; // 0.1 to 1.0 (for lossy formats)
  format: ImageFormat;
  maxWidth?: number;
  maxHeight?: number;
  backgroundColor?: string; // For converting transparent PNG to JPEG
}

export interface CompressionResult {
  blob: Blob;
  objectUrl: string;
  width: number;
  height: number;
  originalSize: number;
  compressedSize: number;
  reductionPercentage: number;
  format: ImageFormat;
}

/**
 * Calculates aspect-ratio preserving dimensions constrained by optional maxWidth and maxHeight
 */
export function calculateFitDimensions(
  srcWidth: number,
  srcHeight: number,
  maxWidth?: number,
  maxHeight?: number
): { width: number; height: number } {
  let targetWidth = srcWidth;
  let targetHeight = srcHeight;

  // Never upscale
  const boundWidth = maxWidth && maxWidth > 0 ? Math.min(maxWidth, srcWidth) : srcWidth;
  const boundHeight = maxHeight && maxHeight > 0 ? Math.min(maxHeight, srcHeight) : srcHeight;

  const ratio = Math.min(boundWidth / srcWidth, boundHeight / srcHeight);

  if (ratio < 1) {
    targetWidth = Math.round(srcWidth * ratio);
    targetHeight = Math.round(srcHeight * ratio);
  }

  // Ensure minimum 1x1
  targetWidth = Math.max(1, targetWidth);
  targetHeight = Math.max(1, targetHeight);

  return { width: targetWidth, height: targetHeight };
}

/**
 * Compresses an HTMLImageElement using Canvas and exports as Blob
 */
export async function compressImage(
  img: HTMLImageElement,
  originalSize: number,
  options: CompressionOptions
): Promise<CompressionResult> {
  const { quality, format, maxWidth, maxHeight, backgroundColor = '#ffffff' } = options;

  const { width: targetWidth, height: targetHeight } = calculateFitDimensions(
    img.naturalWidth || img.width,
    img.naturalHeight || img.height,
    maxWidth,
    maxHeight
  );

  const canvas = document.createElement('canvas');
  canvas.width = targetWidth;
  canvas.height = targetHeight;

  const ctx = canvas.getContext('2d', { willReadFrequently: false });
  if (!ctx) {
    throw new Error('Could not obtain HTML5 2D Canvas rendering context.');
  }

  // Enable high-quality image smoothing
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  // If output format is JPEG (which does not support alpha), fill background first
  if (format === 'image/jpeg') {
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, targetWidth, targetHeight);
  }

  // Draw image to canvas
  ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

  // Export to Blob
  // For PNG, browser toBlob ignores the quality parameter and uses lossless DEFLATE
  // For JPEG and WebP, quality (0.01 - 1.0) is respected
  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (b) => {
        if (b) {
          resolve(b);
        } else {
          reject(new Error('Canvas image compression failed to output a valid binary blob.'));
        }
      },
      format,
      format === 'image/png' ? undefined : quality
    );
  });

  const compressedSize = blob.size;
  const reductionPercentage =
    originalSize > 0 ? Math.max(0, ((originalSize - compressedSize) / originalSize) * 100) : 0;

  const objectUrl = URL.createObjectURL(blob);

  return {
    blob,
    objectUrl,
    width: targetWidth,
    height: targetHeight,
    originalSize,
    compressedSize,
    reductionPercentage,
    format,
  };
}
