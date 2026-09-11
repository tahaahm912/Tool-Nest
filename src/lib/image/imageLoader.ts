import { LoadedImageInfo } from './types';

export const ACCEPTED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/svg+xml',
  'image/bmp',
  'image/tiff',
];

export const ACCEPTED_IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg', '.bmp', '.tiff'];

/**
 * Format bytes into human readable KB, MB, GB string
 */
export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

/**
 * Validates whether a file is a valid, readable image
 */
export function validateImageFile(file: File): { isValid: boolean; error?: string } {
  if (!file) {
    return { isValid: false, error: 'No file provided.' };
  }

  // Check file mime type or extension
  const isMimeValid = file.type.startsWith('image/') || ACCEPTED_IMAGE_TYPES.includes(file.type);
  const ext = `.${file.name.split('.').pop()?.toLowerCase()}`;
  const isExtValid = ACCEPTED_IMAGE_EXTENSIONS.includes(ext);

  if (!isMimeValid && !isExtValid) {
    return {
      isValid: false,
      error: `Unsupported file format (${file.type || 'unknown'}). Please upload a JPG, PNG, WebP, GIF, or BMP image.`,
    };
  }

  // Check size limit (e.g. 50MB reasonable browser memory ceiling)
  const MAX_SIZE_BYTES = 50 * 1024 * 1024;
  if (file.size > MAX_SIZE_BYTES) {
    return {
      isValid: false,
      error: `File is too large (${formatBytes(file.size)}). Maximum recommended size is 50 MB to prevent browser memory crashes.`,
    };
  }

  return { isValid: true };
}

/**
 * Loads a File into an HTMLImageElement and extracts metadata.
 * Returns the object URL for rendering and tracking.
 */
export function loadImageFromFile(file: File): Promise<LoadedImageInfo> {
  return new Promise((resolve, reject) => {
    const validation = validateImageFile(file);
    if (!validation.isValid) {
      reject(new Error(validation.error));
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    const img = new Image();

    img.onload = () => {
      const width = img.naturalWidth || img.width;
      const height = img.naturalHeight || img.height;

      if (!width || !height) {
        URL.revokeObjectURL(objectUrl);
        reject(new Error('Unable to determine image dimensions. File may be corrupted.'));
        return;
      }

      resolve({
        file,
        name: file.name,
        type: file.type || 'image/jpeg',
        size: file.size,
        width,
        height,
        aspectRatio: width / height,
        objectUrl,
        imageElement: img,
      });
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Failed to decode image. The file may be damaged, encrypted, or not a valid image format.'));
    };

    img.src = objectUrl;
  });
}

/**
 * Revokes an object URL safely to prevent browser memory leaks
 */
export function revokeObjectUrlSafe(url?: string | null): void {
  if (url && url.startsWith('blob:')) {
    try {
      URL.revokeObjectURL(url);
    } catch {
      // Ignored if already revoked
    }
  }
}

/**
 * Downloads a Blob or DataURL with a given filename
 */
export function downloadImage(source: Blob | string, filename: string): void {
  const link = document.createElement('a');
  let url: string;
  let shouldRevoke = false;

  if (typeof source === 'string') {
    url = source;
  } else {
    url = URL.createObjectURL(source);
    shouldRevoke = true;
  }

  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  if (shouldRevoke) {
    setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 1000);
  }
}
