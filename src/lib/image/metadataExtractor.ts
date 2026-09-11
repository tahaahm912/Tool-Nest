import exifr from 'exifr';
import { ExifParsedMetadata, LoadedImageInfo } from './types';

/**
 * Parses all available EXIF, TIFF, and GPS metadata from an image File using exifr
 */
export async function extractImageMetadata(
  file: File,
  imageInfo?: LoadedImageInfo
): Promise<ExifParsedMetadata> {
  let raw: Record<string, any> = {};

  try {
    // Parse with exifr options to grab all TIFF, EXIF, GPS, and IPTC segments
    raw = (await exifr.parse(file, {
      tiff: true,
      xmp: true,
      icc: true,
      jfif: true,
      ihdr: true,
      iptc: true,
      mergeOutput: true,
    })) || {};
  } catch (err) {
    console.warn('exifr parse warning:', err);
    // Non-fatal, some images simply lack EXIF headers
    raw = {};
  }

  // Camera info
  const make = raw.Make ? String(raw.Make).trim() : undefined;
  const model = raw.Model ? String(raw.Model).trim() : undefined;
  const lensModel = raw.LensModel ? String(raw.LensModel).trim() : undefined;
  const software = raw.Software ? String(raw.Software).trim() : undefined;

  const hasCamera = Boolean(make || model || lensModel || software);

  // Shooting info
  const iso = typeof raw.ISO === 'number' ? raw.ISO : undefined;
  const fNumber = typeof raw.FNumber === 'number' ? raw.FNumber : undefined;
  let exposureTime: number | string | undefined = raw.ExposureTime;
  if (typeof exposureTime === 'number' && exposureTime > 0 && exposureTime < 1) {
    // format as 1/125s etc.
    const denom = Math.round(1 / exposureTime);
    exposureTime = `1/${denom}s (${exposureTime}s)`;
  } else if (typeof exposureTime === 'number') {
    exposureTime = `${exposureTime}s`;
  }

  const focalLength = typeof raw.FocalLength === 'number' ? raw.FocalLength : undefined;
  const flash = raw.Flash !== undefined ? String(raw.Flash) : undefined;
  const whiteBalance = raw.WhiteBalance !== undefined ? String(raw.WhiteBalance) : undefined;
  const meteringMode = raw.MeteringMode !== undefined ? String(raw.MeteringMode) : undefined;

  let dateTimeOriginal: string | undefined = undefined;
  if (raw.DateTimeOriginal instanceof Date) {
    dateTimeOriginal = raw.DateTimeOriginal.toLocaleString();
  } else if (raw.DateTimeOriginal) {
    dateTimeOriginal = String(raw.DateTimeOriginal);
  } else if (raw.CreateDate instanceof Date) {
    dateTimeOriginal = raw.CreateDate.toLocaleString();
  } else if (raw.CreateDate) {
    dateTimeOriginal = String(raw.CreateDate);
  }

  const orientation = typeof raw.Orientation === 'number' ? raw.Orientation : undefined;

  const hasShooting = Boolean(
    iso || fNumber || exposureTime || focalLength || flash || dateTimeOriginal || orientation
  );

  // GPS info
  const latitude = typeof raw.latitude === 'number' ? raw.latitude : undefined;
  const longitude = typeof raw.longitude === 'number' ? raw.longitude : undefined;
  const altitude = typeof raw.altitude === 'number' ? raw.altitude : undefined;

  const hasGps = latitude !== undefined && longitude !== undefined;
  const googleMapsUrl = hasGps
    ? `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`
    : undefined;

  return {
    file: {
      name: file.name,
      type: file.type || 'image/jpeg',
      size: file.size,
      lastModified: file.lastModified,
    },
    dimensions: imageInfo
      ? {
          width: imageInfo.width,
          height: imageInfo.height,
          aspectRatio: imageInfo.aspectRatio,
        }
      : undefined,
    camera: hasCamera
      ? {
          make,
          model,
          lensModel,
          software,
        }
      : undefined,
    shooting: hasShooting
      ? {
          iso,
          fNumber,
          exposureTime,
          focalLength,
          flash,
          whiteBalance,
          meteringMode,
          dateTimeOriginal,
          orientation,
        }
      : undefined,
    gps: {
      latitude,
      longitude,
      altitude,
      googleMapsUrl,
      hasGps,
    },
    rawTags: Object.keys(raw).length > 0 ? raw : undefined,
  };
}
