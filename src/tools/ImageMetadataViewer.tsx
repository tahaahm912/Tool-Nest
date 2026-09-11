import React, { useState, useEffect } from 'react';
import { LoadedImageInfo, ExifParsedMetadata } from '../lib/image/types';
import { extractImageMetadata } from '../lib/image/metadataExtractor';
import { formatBytes, revokeObjectUrlSafe } from '../lib/image/imageLoader';
import { ImageUpload } from '../components/image/ImageUpload';
import { ImagePreview } from '../components/image/ImagePreview';
import { PrivacyBadge } from '../components/image/PrivacyBadge';
import {
  Info,
  Camera,
  MapPin,
  Calendar,
  Layers,
  Copy,
  Check,
  Download,
  RotateCcw,
  ShieldAlert,
  ExternalLink,
  Sliders,
  FileText,
} from 'lucide-react';

export const ImageMetadataViewer: React.FC = () => {
  const [imageInfo, setImageInfo] = useState<LoadedImageInfo | null>(null);
  const [metadata, setMetadata] = useState<ExifParsedMetadata | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'structured' | 'raw'>('structured');
  const [error, setError] = useState<string | null>(null);

  const handleImageLoaded = async (loaded: LoadedImageInfo) => {
    setImageInfo(loaded);
    setIsLoading(true);
    setError(null);

    try {
      const parsed = await extractImageMetadata(loaded.file, loaded);
      setMetadata(parsed);
    } catch (err: any) {
      setError(err.message || 'Failed to extract metadata.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    if (imageInfo) {
      revokeObjectUrlSafe(imageInfo.objectUrl);
    }
    setImageInfo(null);
    setMetadata(null);
    setError(null);
  };

  const copyMetadata = (format: 'json' | 'text') => {
    if (!metadata) return;
    let content = '';
    if (format === 'json') {
      content = JSON.stringify(metadata, null, 2);
    } else {
      content = formatMetadataAsText(metadata);
    }
    navigator.clipboard.writeText(content);
    setCopiedKey(format);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const downloadMetadata = (format: 'json' | 'text') => {
    if (!metadata || !imageInfo) return;
    let content = '';
    let mime = 'text/plain';
    let ext = 'txt';

    if (format === 'json') {
      content = JSON.stringify(metadata, null, 2);
      mime = 'application/json';
      ext = 'json';
    } else {
      content = formatMetadataAsText(metadata);
    }

    const blob = new Blob([content], { type: `${mime};charset=utf-8` });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${imageInfo.name}-metadata.${ext}`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const formatMetadataAsText = (m: ExifParsedMetadata): string => {
    const lines: string[] = [];
    lines.push(`FILE INFORMATION`);
    lines.push(`Name: ${m.file.name}`);
    lines.push(`Type: ${m.file.type}`);
    lines.push(`Size: ${formatBytes(m.file.size)}`);
    if (m.dimensions) {
      lines.push(`Dimensions: ${m.dimensions.width} x ${m.dimensions.height} px`);
    }

    if (m.camera) {
      lines.push(`\nCAMERA`);
      if (m.camera.make) lines.push(`Make: ${m.camera.make}`);
      if (m.camera.model) lines.push(`Model: ${m.camera.model}`);
      if (m.camera.lensModel) lines.push(`Lens: ${m.camera.lensModel}`);
      if (m.camera.software) lines.push(`Software: ${m.camera.software}`);
    }

    if (m.shooting) {
      lines.push(`\nEXPOSURE & SHOOTING`);
      if (m.shooting.dateTimeOriginal) lines.push(`Date: ${m.shooting.dateTimeOriginal}`);
      if (m.shooting.exposureTime) lines.push(`Shutter: ${m.shooting.exposureTime}`);
      if (m.shooting.fNumber) lines.push(`Aperture: f/${m.shooting.fNumber}`);
      if (m.shooting.iso) lines.push(`ISO: ${m.shooting.iso}`);
      if (m.shooting.focalLength) lines.push(`Focal Length: ${m.shooting.focalLength}mm`);
    }

    if (m.gps?.hasGps) {
      lines.push(`\nGPS COORDINATES`);
      lines.push(`Latitude: ${m.gps.latitude}`);
      lines.push(`Longitude: ${m.gps.longitude}`);
      if (m.gps.altitude) lines.push(`Altitude: ${m.gps.altitude}m`);
    }

    return lines.join('\n');
  };

  return (
    <div className="space-y-6">
      <PrivacyBadge extraText="Metadata is read in-memory; no coordinates or tags are ever transmitted." />

      <ImageUpload
        currentImage={imageInfo}
        onImageLoaded={handleImageLoaded}
        onClear={handleReset}
        title="Drop a photo to view EXIF and camera metadata"
        subtitle="Inspect camera model, exposure settings, timestamps, and GPS tags"
      />

      {imageInfo && metadata && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* GPS Sensitive Privacy Warning */}
          {metadata.gps.hasGps && (
            <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-amber-900 dark:text-amber-200 space-y-2">
              <div className="flex items-center gap-2 font-semibold text-sm text-amber-800 dark:text-amber-300">
                <ShieldAlert className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                <span>Sensitive Location Coordinates Detected</span>
              </div>
              <p className="text-xs text-amber-700 dark:text-amber-300">
                This image contains embedded GPS latitude and longitude metadata. If you share this photo publicly on social platforms or forums, your physical shooting location may be revealed.
              </p>
              <div className="flex items-center gap-3 pt-1 text-xs">
                <span className="font-mono font-semibold">
                  {metadata.gps.latitude?.toFixed(6)}, {metadata.gps.longitude?.toFixed(6)}
                </span>
                {metadata.gps.googleMapsUrl && (
                  <a
                    href={metadata.gps.googleMapsUrl}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold hover:underline"
                  >
                    <span>View on Google Maps</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Action Header: View Mode Switch & Export Buttons */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 shadow-xs">
            {/* Tabs */}
            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-neutral-100 dark:bg-neutral-800 border border-neutral-200/80 dark:border-neutral-700/80">
              <button
                type="button"
                onClick={() => setActiveTab('structured')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                  activeTab === 'structured'
                    ? 'bg-white dark:bg-neutral-950 text-emerald-600 dark:text-emerald-400 shadow-xs'
                    : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                }`}
              >
                Categorized View
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('raw')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                  activeTab === 'raw'
                    ? 'bg-white dark:bg-neutral-950 text-emerald-600 dark:text-emerald-400 shadow-xs'
                    : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                }`}
              >
                Raw EXIF Tags {metadata.rawTags ? `(${Object.keys(metadata.rawTags).length})` : ''}
              </button>
            </div>

            {/* Export Actions */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => copyMetadata('json')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors cursor-pointer shadow-xs"
              >
                {copiedKey === 'json' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>Copy JSON</span>
              </button>

              <button
                type="button"
                onClick={() => downloadMetadata('json')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors cursor-pointer shadow-xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>JSON</span>
              </button>

              <button
                type="button"
                onClick={() => downloadMetadata('text')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors cursor-pointer shadow-xs"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Text</span>
              </button>

              <button
                type="button"
                onClick={handleReset}
                className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 cursor-pointer ml-1"
                title="Reset"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {activeTab === 'structured' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* File & Dimension Information */}
              <div className="p-5 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 shadow-xs space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-neutral-100 dark:border-neutral-800">
                  <Layers className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                    File & Dimensions
                  </h3>
                </div>

                <div className="space-y-2.5 text-xs">
                  <div className="flex items-center justify-between py-1 border-b border-neutral-100 dark:border-neutral-800/60">
                    <span className="text-neutral-500">File Name</span>
                    <span className="font-semibold text-neutral-900 dark:text-white font-mono truncate max-w-[220px]">
                      {metadata.file.name}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-1 border-b border-neutral-100 dark:border-neutral-800/60">
                    <span className="text-neutral-500">MIME Format</span>
                    <span className="font-semibold text-neutral-900 dark:text-white font-mono uppercase">
                      {metadata.file.type}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-1 border-b border-neutral-100 dark:border-neutral-800/60">
                    <span className="text-neutral-500">File Size</span>
                    <span className="font-semibold text-neutral-900 dark:text-white font-mono">
                      {formatBytes(metadata.file.size)}
                    </span>
                  </div>
                  {metadata.dimensions && (
                    <>
                      <div className="flex items-center justify-between py-1 border-b border-neutral-100 dark:border-neutral-800/60">
                        <span className="text-neutral-500">Width</span>
                        <span className="font-semibold text-neutral-900 dark:text-white font-mono">
                          {metadata.dimensions.width} px
                        </span>
                      </div>
                      <div className="flex items-center justify-between py-1 border-b border-neutral-100 dark:border-neutral-800/60">
                        <span className="text-neutral-500">Height</span>
                        <span className="font-semibold text-neutral-900 dark:text-white font-mono">
                          {metadata.dimensions.height} px
                        </span>
                      </div>
                      <div className="flex items-center justify-between py-1">
                        <span className="text-neutral-500">Aspect Ratio</span>
                        <span className="font-semibold text-neutral-900 dark:text-white font-mono">
                          {metadata.dimensions.aspectRatio.toFixed(3)}:1
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Camera & Hardware Information */}
              <div className="p-5 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 shadow-xs space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-neutral-100 dark:border-neutral-800">
                  <Camera className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                    Camera & Equipment
                  </h3>
                </div>

                {metadata.camera ? (
                  <div className="space-y-2.5 text-xs">
                    {metadata.camera.make && (
                      <div className="flex items-center justify-between py-1 border-b border-neutral-100 dark:border-neutral-800/60">
                        <span className="text-neutral-500">Camera Manufacturer</span>
                        <span className="font-semibold text-neutral-900 dark:text-white">
                          {metadata.camera.make}
                        </span>
                      </div>
                    )}
                    {metadata.camera.model && (
                      <div className="flex items-center justify-between py-1 border-b border-neutral-100 dark:border-neutral-800/60">
                        <span className="text-neutral-500">Model Name</span>
                        <span className="font-semibold text-neutral-900 dark:text-white">
                          {metadata.camera.model}
                        </span>
                      </div>
                    )}
                    {metadata.camera.lensModel && (
                      <div className="flex items-center justify-between py-1 border-b border-neutral-100 dark:border-neutral-800/60">
                        <span className="text-neutral-500">Lens Specification</span>
                        <span className="font-semibold text-neutral-900 dark:text-white">
                          {metadata.camera.lensModel}
                        </span>
                      </div>
                    )}
                    {metadata.camera.software && (
                      <div className="flex items-center justify-between py-1">
                        <span className="text-neutral-500">Processing Software</span>
                        <span className="font-semibold text-neutral-900 dark:text-white">
                          {metadata.camera.software}
                        </span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-4 text-center text-xs text-neutral-400 italic">
                    No camera hardware tags detected in this image header.
                  </div>
                )}
              </div>

              {/* Exposure & Shooting Settings */}
              <div className="p-5 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 shadow-xs space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-neutral-100 dark:border-neutral-800">
                  <Sliders className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                    Exposure & Shooting Details
                  </h3>
                </div>

                {metadata.shooting ? (
                  <div className="space-y-2.5 text-xs">
                    {metadata.shooting.dateTimeOriginal && (
                      <div className="flex items-center justify-between py-1 border-b border-neutral-100 dark:border-neutral-800/60">
                        <span className="text-neutral-500">Capture Date / Time</span>
                        <span className="font-semibold text-neutral-900 dark:text-white font-mono">
                          {metadata.shooting.dateTimeOriginal}
                        </span>
                      </div>
                    )}
                    {metadata.shooting.exposureTime !== undefined && (
                      <div className="flex items-center justify-between py-1 border-b border-neutral-100 dark:border-neutral-800/60">
                        <span className="text-neutral-500">Shutter Speed</span>
                        <span className="font-semibold text-neutral-900 dark:text-white font-mono">
                          {metadata.shooting.exposureTime}
                        </span>
                      </div>
                    )}
                    {metadata.shooting.fNumber !== undefined && (
                      <div className="flex items-center justify-between py-1 border-b border-neutral-100 dark:border-neutral-800/60">
                        <span className="text-neutral-500">Aperture</span>
                        <span className="font-semibold text-neutral-900 dark:text-white font-mono">
                          f/{metadata.shooting.fNumber}
                        </span>
                      </div>
                    )}
                    {metadata.shooting.iso !== undefined && (
                      <div className="flex items-center justify-between py-1 border-b border-neutral-100 dark:border-neutral-800/60">
                        <span className="text-neutral-500">ISO Sensitivity</span>
                        <span className="font-semibold text-neutral-900 dark:text-white font-mono">
                          ISO {metadata.shooting.iso}
                        </span>
                      </div>
                    )}
                    {metadata.shooting.focalLength !== undefined && (
                      <div className="flex items-center justify-between py-1 border-b border-neutral-100 dark:border-neutral-800/60">
                        <span className="text-neutral-500">Focal Length</span>
                        <span className="font-semibold text-neutral-900 dark:text-white font-mono">
                          {metadata.shooting.focalLength} mm
                        </span>
                      </div>
                    )}
                    {metadata.shooting.flash !== undefined && (
                      <div className="flex items-center justify-between py-1 border-b border-neutral-100 dark:border-neutral-800/60">
                        <span className="text-neutral-500">Flash</span>
                        <span className="font-semibold text-neutral-900 dark:text-white">
                          {metadata.shooting.flash}
                        </span>
                      </div>
                    )}
                    {metadata.shooting.orientation !== undefined && (
                      <div className="flex items-center justify-between py-1">
                        <span className="text-neutral-500">EXIF Orientation</span>
                        <span className="font-semibold text-neutral-900 dark:text-white font-mono">
                          Tag {metadata.shooting.orientation}
                        </span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-4 text-center text-xs text-neutral-400 italic">
                    No exposure settings found (e.g. exported without EXIF from graphic design editor).
                  </div>
                )}
              </div>

              {/* GPS Information */}
              <div className="p-5 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 shadow-xs space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-neutral-100 dark:border-neutral-800">
                  <MapPin className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                    Geolocation (GPS)
                  </h3>
                </div>

                {metadata.gps.hasGps ? (
                  <div className="space-y-2.5 text-xs">
                    <div className="flex items-center justify-between py-1 border-b border-neutral-100 dark:border-neutral-800/60">
                      <span className="text-neutral-500">Latitude</span>
                      <span className="font-semibold text-neutral-900 dark:text-white font-mono">
                        {metadata.gps.latitude?.toFixed(6)}°
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-1 border-b border-neutral-100 dark:border-neutral-800/60">
                      <span className="text-neutral-500">Longitude</span>
                      <span className="font-semibold text-neutral-900 dark:text-white font-mono">
                        {metadata.gps.longitude?.toFixed(6)}°
                      </span>
                    </div>
                    {metadata.gps.altitude !== undefined && (
                      <div className="flex items-center justify-between py-1 border-b border-neutral-100 dark:border-neutral-800/60">
                        <span className="text-neutral-500">Altitude</span>
                        <span className="font-semibold text-neutral-900 dark:text-white font-mono">
                          {metadata.gps.altitude.toFixed(1)} m above sea level
                        </span>
                      </div>
                    )}
                    {metadata.gps.googleMapsUrl && (
                      <div className="pt-2">
                        <a
                          href={metadata.gps.googleMapsUrl}
                          target="_blank"
                          rel="noreferrer noopener"
                          className="w-full py-2 px-3 rounded-xl border border-emerald-500/30 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-semibold flex items-center justify-center gap-1.5 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-colors"
                        >
                          <span>Open Location in Google Maps</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-4 text-center text-xs text-neutral-400 italic">
                    No GPS location tags embedded in this image.
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Raw EXIF Tags JSON View */
            <div className="p-5 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                  Full Raw Tag Dictionary
                </span>
                <button
                  type="button"
                  onClick={() => copyMetadata('json')}
                  className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold hover:underline flex items-center gap-1"
                >
                  {copiedKey === 'json' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  <span>Copy Entire JSON</span>
                </button>
              </div>
              <pre className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-950 text-neutral-200 text-xs font-mono max-h-[480px] overflow-auto select-all">
                {JSON.stringify(metadata.rawTags || metadata, null, 2)}
              </pre>
            </div>
          )}

          {/* Visual Preview */}
          <div className="space-y-2">
            <div className="text-xs font-semibold text-neutral-500 px-1">Image Preview</div>
            <ImagePreview
              src={imageInfo.objectUrl}
              alt={imageInfo.name}
              width={imageInfo.width}
              height={imageInfo.height}
              fileSize={imageInfo.size}
              format={imageInfo.type}
            />
          </div>
        </div>
      )}
    </div>
  );
};
