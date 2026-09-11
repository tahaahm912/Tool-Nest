import { ImageFormat } from './types';

export interface CropRect {
  x: number; // in natural image pixels
  y: number;
  width: number;
  height: number;
}

export interface CropExecuteOptions {
  crop: CropRect;
  rotation?: number; // 0, 90, 180, 270
  format: ImageFormat;
  quality: number;
  backgroundColor?: string;
}

export interface CropExecuteResult {
  blob: Blob;
  objectUrl: string;
  width: number;
  height: number;
  fileSize: number;
  format: ImageFormat;
}

/**
 * Cuts out the selected crop rectangle from an HTMLImageElement, applying any rotation,
 * and outputs a new high-quality image Blob.
 */
export async function executeCrop(
  img: HTMLImageElement,
  options: CropExecuteOptions
): Promise<CropExecuteResult> {
  const { crop, rotation = 0, format, quality, backgroundColor = '#ffffff' } = options;

  const naturalW = img.naturalWidth || img.width;
  const naturalH = img.naturalHeight || img.height;

  // Bound coordinates to actual image boundaries
  const safeX = Math.max(0, Math.min(naturalW - 1, Math.round(crop.x)));
  const safeY = Math.max(0, Math.min(naturalH - 1, Math.round(crop.y)));
  const safeW = Math.max(1, Math.min(naturalW - safeX, Math.round(crop.width)));
  const safeH = Math.max(1, Math.min(naturalH - safeY, Math.round(crop.height)));

  // First step: render crop region onto canvas
  const cropCanvas = document.createElement('canvas');
  cropCanvas.width = safeW;
  cropCanvas.height = safeH;

  const cropCtx = cropCanvas.getContext('2d');
  if (!cropCtx) {
    throw new Error('Failed to create canvas context for cropping.');
  }

  cropCtx.imageSmoothingEnabled = true;
  cropCtx.imageSmoothingQuality = 'high';

  if (format === 'image/jpeg') {
    cropCtx.fillStyle = backgroundColor;
    cropCtx.fillRect(0, 0, safeW, safeH);
  }

  // Draw slice from source image
  cropCtx.drawImage(img, safeX, safeY, safeW, safeH, 0, 0, safeW, safeH);

  // If rotation is applied (e.g. 90, 180, 270)
  let finalCanvas = cropCanvas;
  const normalizedRotation = ((rotation % 360) + 360) % 360;

  if (normalizedRotation !== 0) {
    const rotCanvas = document.createElement('canvas');
    const rotCtx = rotCanvas.getContext('2d');
    if (!rotCtx) throw new Error('Canvas rotation context failed.');

    if (normalizedRotation === 90 || normalizedRotation === 270) {
      rotCanvas.width = safeH;
      rotCanvas.height = safeW;
    } else {
      rotCanvas.width = safeW;
      rotCanvas.height = safeH;
    }

    rotCtx.imageSmoothingEnabled = true;
    rotCtx.imageSmoothingQuality = 'high';

    if (format === 'image/jpeg') {
      rotCtx.fillStyle = backgroundColor;
      rotCtx.fillRect(0, 0, rotCanvas.width, rotCanvas.height);
    }

    rotCtx.translate(rotCanvas.width / 2, rotCanvas.height / 2);
    rotCtx.rotate((normalizedRotation * Math.PI) / 180);
    rotCtx.drawImage(cropCanvas, -safeW / 2, -safeH / 2);

    finalCanvas = rotCanvas;
  }

  const blob = await new Promise<Blob>((resolve, reject) => {
    finalCanvas.toBlob(
      (b) => {
        if (b) resolve(b);
        else reject(new Error('Cropping failed to generate binary image blob.'));
      },
      format,
      format === 'image/png' ? undefined : quality
    );
  });

  const objectUrl = URL.createObjectURL(blob);

  return {
    blob,
    objectUrl,
    width: finalCanvas.width,
    height: finalCanvas.height,
    fileSize: blob.size,
    format,
  };
}
