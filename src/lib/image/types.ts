export type ImageFormat = 'image/jpeg' | 'image/png' | 'image/webp';

export interface ImageDimensions {
  width: number;
  height: number;
  aspectRatio: number;
}

export interface LoadedImageInfo {
  file: File;
  name: string;
  type: string;
  size: number;
  width: number;
  height: number;
  aspectRatio: number;
  objectUrl: string;
  imageElement: HTMLImageElement;
}

export interface ColorData {
  hex: string;
  rgb: { r: number; g: number; b: number; a: number };
  rgbString: string;
  hsl: { h: number; s: number; l: number };
  hslString: string;
  hsv: { h: number; s: number; v: number };
  hsvString: string;
  cmyk: { c: number; m: number; y: number; k: number };
  cmykString: string;
  isDark: boolean;
  isTransparent?: boolean;
}

export interface ExifParsedMetadata {
  file: {
    name: string;
    type: string;
    size: number;
    lastModified: number;
  };
  dimensions?: {
    width: number;
    height: number;
    aspectRatio: number;
  };
  camera?: {
    make?: string;
    model?: string;
    lensModel?: string;
    software?: string;
  };
  shooting?: {
    iso?: number;
    fNumber?: number;
    exposureTime?: number | string;
    focalLength?: number;
    flash?: string | number;
    whiteBalance?: string | number;
    meteringMode?: string | number;
    dateTimeOriginal?: string;
    orientation?: number;
  };
  gps?: {
    latitude?: number;
    longitude?: number;
    altitude?: number;
    googleMapsUrl?: string;
    hasGps: boolean;
  };
  rawTags?: Record<string, unknown>;
}

export interface CropRegion {
  x: number; // percentage or pixel
  y: number;
  width: number;
  height: number;
}
