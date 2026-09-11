import React, { useState, useEffect, useRef } from 'react';
import { LoadedImageInfo, ImageFormat } from '../lib/image/types';
import {
  convertImageFormat,
  detectImageTransparency,
  ConversionResult,
} from '../lib/image/imageConverter';
import { formatBytes, revokeObjectUrlSafe } from '../lib/image/imageLoader';
import { ImageUpload } from '../components/image/ImageUpload';
import { ImagePreview } from '../components/image/ImagePreview';
import { ImageInfo } from '../components/image/ImageInfo';
import { PrivacyBadge } from '../components/image/PrivacyBadge';
import { QualitySlider } from '../components/image/QualitySlider';
import { DownloadButton } from '../components/image/DownloadButton';
import {
  RefreshCw,
  AlertTriangle,
  RotateCcw,
  Check,
  Sparkles,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';

export const ImageFormatConverter: React.FC = () => {
  const [imageInfo, setImageInfo] = useState<LoadedImageInfo | null>(null);
  const [targetFormat, setTargetFormat] = useState<ImageFormat>('image/webp');
  const [quality, setQuality] = useState<number>(0.85);
  const [hasTransparency, setHasTransparency] = useState<boolean>(false);
  const [isConverting, setIsConverting] = useState<boolean>(false);
  const [conversionResult, setConversionResult] = useState<ConversionResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const prevResultUrlRef = useRef<string | null>(null);

  useEffect(() => {
    return () => {
      revokeObjectUrlSafe(prevResultUrlRef.current);
    };
  }, []);

  const handleImageLoaded = (loaded: LoadedImageInfo) => {
    if (conversionResult) {
      revokeObjectUrlSafe(conversionResult.objectUrl);
      setConversionResult(null);
    }
    setImageInfo(loaded);

    // Detect transparency for PNG / WebP inputs
    const transparent = detectImageTransparency(loaded.imageElement);
    setHasTransparency(transparent);

    // Default target format: if input is PNG, default to WebP; if JPEG, default to PNG or WebP
    if (loaded.type === 'image/jpeg') {
      setTargetFormat('image/webp');
    } else if (loaded.type === 'image/webp') {
      setTargetFormat('image/png');
    } else {
      setTargetFormat('image/webp');
    }
    setError(null);
  };

  const handleReset = () => {
    if (imageInfo) {
      revokeObjectUrlSafe(imageInfo.objectUrl);
    }
    if (conversionResult) {
      revokeObjectUrlSafe(conversionResult.objectUrl);
    }
    setImageInfo(null);
    setConversionResult(null);
    setHasTransparency(false);
    setError(null);
  };

  const runConversion = async () => {
    if (!imageInfo) return;
    setIsConverting(true);
    setError(null);

    try {
      const res = await convertImageFormat(imageInfo.imageElement, imageInfo.size, {
        targetFormat,
        quality,
      });

      if (prevResultUrlRef.current) {
        revokeObjectUrlSafe(prevResultUrlRef.current);
      }
      prevResultUrlRef.current = res.objectUrl;
      setConversionResult(res);
    } catch (err: any) {
      setError(err.message || 'Conversion failed.');
    } finally {
      setIsConverting(false);
    }
  };

  // Convert on image load automatically
  useEffect(() => {
    if (imageInfo && !conversionResult && !isConverting) {
      runConversion();
    }
  }, [imageInfo]);

  const willLoseTransparency = hasTransparency && targetFormat === 'image/jpeg';

  const getOutputFilename = () => {
    if (!imageInfo) return 'converted-image';
    const baseName = imageInfo.name.substring(0, imageInfo.name.lastIndexOf('.')) || imageInfo.name;
    const ext = targetFormat === 'image/jpeg' ? 'jpg' : targetFormat === 'image/png' ? 'png' : 'webp';
    return `${baseName}.${ext}`;
  };

  return (
    <div className="space-y-6">
      <PrivacyBadge />

      <ImageUpload
        currentImage={imageInfo}
        onImageLoaded={handleImageLoaded}
        onClear={handleReset}
        title="Drop an image to convert format"
        subtitle="Accepts PNG, JPG, WebP, GIF, BMP, and SVG (up to 50 MB)"
      />

      {imageInfo && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <ImageInfo
            fileName={imageInfo.name}
            fileType={imageInfo.type}
            fileSize={imageInfo.size}
            width={imageInfo.width}
            height={imageInfo.height}
            aspectRatio={imageInfo.aspectRatio}
          />

          {/* Format Selection Card */}
          <div className="p-5 sm:p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 shadow-xs space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800">
              <div className="flex items-center gap-2">
                <RefreshCw className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">
                  Format Conversion
                </h3>
              </div>
              <button
                type="button"
                onClick={handleReset}
                className="inline-flex items-center gap-1 text-xs text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            </div>

            {/* Warning if transparency will be dropped for JPEG */}
            {willLoseTransparency && (
              <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-amber-800 dark:text-amber-300 text-xs">
                <ShieldAlert className="w-5 h-5 flex-shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
                <div>
                  <p className="font-semibold text-sm">Transparency Warning</p>
                  <p className="mt-0.5 text-amber-700 dark:text-amber-400">
                    Your source image contains transparent pixels. The JPEG format does not support transparency; transparent areas will be filled with an opaque white background. To preserve transparency, select <strong>PNG</strong> or <strong>WebP</strong>.
                  </p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Target Format Options */}
              <div className="space-y-3">
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                  Select Output Format
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    {
                      id: 'image/png',
                      label: 'PNG',
                      desc: 'Lossless & Transparency',
                      supportedTrans: true,
                    },
                    {
                      id: 'image/jpeg',
                      label: 'JPEG',
                      desc: 'Universal Photo Format',
                      supportedTrans: false,
                    },
                    {
                      id: 'image/webp',
                      label: 'WebP',
                      desc: 'Modern Web Performance',
                      supportedTrans: true,
                    },
                  ].map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => setTargetFormat(f.id as ImageFormat)}
                      className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                        targetFormat === f.id
                          ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 font-semibold ring-2 ring-emerald-500/20'
                          : 'border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-950 hover:bg-neutral-100 dark:hover:bg-neutral-800/60 text-neutral-700 dark:text-neutral-300'
                      }`}
                    >
                      <div className="text-sm font-bold">{f.label}</div>
                      <div className="text-[10px] text-neutral-400 dark:text-neutral-500 mt-1">
                        {f.desc}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Quality Settings */}
              <div>
                {targetFormat !== 'image/png' ? (
                  <QualitySlider value={quality} onChange={setQuality} />
                ) : (
                  <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200 dark:border-neutral-800 text-xs text-neutral-500 dark:text-neutral-400 space-y-1">
                    <p className="font-semibold text-neutral-800 dark:text-neutral-200">
                      Lossless PNG Compression
                    </p>
                    <p>
                      PNG preserves original pixel fidelity and transparent layers without compression degradation.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 text-xs">
                {error}
              </div>
            )}

            <button
              type="button"
              onClick={runConversion}
              disabled={isConverting}
              className="w-full py-2.5 px-4 rounded-xl font-semibold text-sm bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isConverting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Converting Format...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Convert to {targetFormat.replace('image/', '').toUpperCase()}</span>
                </>
              )}
            </button>
          </div>

          {/* Conversion Result Section */}
          {conversionResult && (
            <div className="space-y-4 animate-in fade-in duration-300">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 shadow-xs">
                <div>
                  <div className="text-sm font-semibold text-neutral-900 dark:text-white flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-500" />
                    <span>Conversion Ready:</span>
                    <span className="uppercase font-mono text-emerald-600 dark:text-emerald-400">
                      {conversionResult.targetFormat.replace('image/', '')}
                    </span>
                    <span className="text-xs text-neutral-400">
                      ({formatBytes(conversionResult.newSize)})
                    </span>
                  </div>
                  <div className="text-xs text-neutral-400 mt-0.5 font-mono">
                    {getOutputFilename()}
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <DownloadButton
                    source={conversionResult.blob}
                    fileName={getOutputFilename()}
                    label={`Download ${conversionResult.targetFormat.replace('image/', '').toUpperCase()}`}
                    className="w-full sm:w-auto"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold text-neutral-500 px-1">
                    <span>Source: {imageInfo.type.replace('image/', '').toUpperCase()}</span>
                    <span>{formatBytes(imageInfo.size)}</span>
                  </div>
                  <ImagePreview
                    src={imageInfo.objectUrl}
                    alt="Original"
                    width={imageInfo.width}
                    height={imageInfo.height}
                    fileSize={imageInfo.size}
                    format={imageInfo.type}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold text-emerald-600 dark:text-emerald-400 px-1">
                    <span>Converted: {conversionResult.targetFormat.replace('image/', '').toUpperCase()}</span>
                    <span>{formatBytes(conversionResult.newSize)}</span>
                  </div>
                  <ImagePreview
                    src={conversionResult.objectUrl}
                    alt="Converted"
                    width={conversionResult.width}
                    height={conversionResult.height}
                    fileSize={conversionResult.newSize}
                    format={conversionResult.targetFormat}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
