export interface Base64Result {
  dataUrl: string;
  base64Only: string;
  mimeType: string;
  charCount: number;
  byteSize: number;
  approxKb: number;
  isLarge: boolean;
}

/**
 * Converts a File or Blob into a Data URL and separate Base64 payload
 */
export function fileToBase64(file: File | Blob): Promise<Base64Result> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      const dataUrl = reader.result as string;
      const commaIndex = dataUrl.indexOf(',');
      const base64Only = commaIndex !== -1 ? dataUrl.slice(commaIndex + 1) : dataUrl;

      // Extract mime type
      const mimeMatch = dataUrl.match(/^data:([^;]+);/);
      const mimeType = mimeMatch ? mimeMatch[1] : (file.type || 'application/octet-stream');

      const charCount = base64Only.length;
      // 4 Base64 chars = 3 bytes
      const byteSize = Math.floor((charCount * 3) / 4);
      const approxKb = +(byteSize / 1024).toFixed(1);
      const isLarge = charCount > 1_000_000; // > 1MB of text

      resolve({
        dataUrl,
        base64Only,
        mimeType,
        charCount,
        byteSize,
        approxKb,
        isLarge,
      });
    };

    reader.onerror = () => {
      reject(new Error('Failed to read image file into Base64 format.'));
    };

    reader.readAsDataURL(file);
  });
}
