import React, { useState, useEffect, useRef } from 'react';
import { LoadedImageInfo, ImageFormat } from '../lib/image/types';
import { compressImage, CompressionResult } from '../lib/image/imageCompressor';
import { formatBytes, revokeObjectUrlSafe } from '../lib/image/imageLoader';
import { ImageUpload } from '../components/image/ImageUpload';
import { ImagePreview } from '../components/image/ImagePreview';
import { ImageInfo } from '../components/image/ImageInfo';
import { PrivacyBadge } from '../components/image/PrivacyBadge';
import { QualitySlider } from '../components/image/QualitySlider';
import { DownloadButton } from '../components/image/DownloadButton';
import {
  FileArchive,
  ArrowRight,
  TrendingDown,
  RefreshCw,
  RotateCcw,
  Sparkles,
  Info,
} from 'lucide-react';

export const ImageCompressor: React.FC = () => {
  const [imageInfo, setImageInfo] = useState<LoadedImageInfo | null>(null);
  const [format, setFormat] = useState<ImageFormat>('image/webp');
  const [quality, setQuality] = useState<number>(0.8);
  const [maxWidth, setMaxWidth] = useState<number | undefined>(undefined);
  const [maxHeight, setMaxHeight] = useState<number | undefined>(undefined);
  const [isCompressing, setIsCompressing] = useState(false);
  const [compressionResult, setCompressionResult] = useState<CompressionResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Keep track of result objectUrl to revoke on cleanup
  const prevResultUrlRef = useRef<string | null>(null);

  useEffect(() => {
    return () => {
      revokeObjectUrlSafe(prevResultUrlRef.current);
    };
  }, []);

  const handleImageLoaded = (loaded: LoadedImageInfo) => {
    // Revoke previous compressed result if any
    if (compressionResult) {
      revokeObjectUrlSafe(compressionResult.objectUrl);
      setCompressionResult(null);
    }
    setImageInfo(loaded);
    setMaxWidth(undefined);
    setMaxHeight(undefined);
    // Default output format: WebP is best for compression, or JPEG if input was JPEG
    if (loaded.type === 'image/jpeg') {
      setFormat('image/jpeg');
    } else {
      setFormat('image/webp');
    }
    setError(null);
  };

  const handleReset = () => {
    if (imageInfo) {
      revokeObjectUrlSafe(imageInfo.objectUrl);
    }
    if (compressionResult) {
      revokeObjectUrlSafe(compressionResult.objectUrl);
    }
    setImageInfo(null);
    setCompressionResult(null);
    setMaxWidth(undefined);
    setMaxHeight(undefined);
    setError(null);
  };

  const runCompression = async () => {
    if (!imageInfo) return;
    setIsCompressing(true);
    setError(null);

    try {
      const res = await compressImage(imageInfo.imageElement, imageInfo.size, {
        quality,
        format,
        maxWidth,
        maxHeight,
      });

      if (prevResultUrlRef.current) {
        revokeObjectUrlSafe(prevResultUrlRef.current);
      }
      prevResultUrlRef.current = res.objectUrl;
      setCompressionResult(res);
    } catch (err: any) {
      setError(err.message || 'Compression failed.');
    } finally {
      setIsCompressing(false);
    }
  };

  // Auto-compress when first loaded for instant gratification
  useEffect(() => {
    if (imageInfo && !compressionResult && !isCompressing) {
      runCompression();
    }
  }, [imageInfo]);

  const getOutputFilename = () => {
    if (!imageInfo) return 'compressed-image';
    const baseName = imageInfo.name.substring(0, imageInfo.name.lastIndexOf('.')) || imageInfo.name;
    const ext = format === 'image/jpeg' ? 'jpg' : format === 'image/png' ? 'png' : 'webp';
    return `${baseName}-compressed.${ext}`;
  };

  return (
    <div className="space-y-6">
      <PrivacyBadge />

      {/* Upload or Active Image Header */}
      <ImageUpload
        currentImage={imageInfo}
        onImageLoaded={handleImageLoaded}
        onClear={handleReset}
        title="Drop an image to compress"
        subtitle="Accepts JPG, PNG, and WebP (up to 50 MB)"
      />

      {imageInfo && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Basic Image Details */}
          <ImageInfo
            fileName={imageInfo.name}
            fileType={imageInfo.type}
            fileSize={imageInfo.size}
            width={imageInfo.width}
            height={imageInfo.height}
            aspectRatio={imageInfo.aspectRatio}
          />

          {/* Compression Configuration Panel */}
          <div className="p-5 sm:p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 shadow-xs space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800">
              <div className="flex items-center gap-2">
                <FileArchive className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">
                  Compression Settings
                </h3>
              </div>
              <button
                type="button"
                onClick={handleReset}
                className="inline-flex items-center gap-1 text-xs text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column: Format & Quality */}
              <div className="space-y-5">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-2">
                    Output Format
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'image/webp', label: 'WebP', badge: 'Smallest' },
                      { id: 'image/jpeg', label: 'JPEG', badge: 'Standard' },
                      { id: 'image/png', label: 'PNG', badge: 'Lossless' },
                    ].map((f) => (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => setFormat(f.id as ImageFormat)}
                        className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                          format === f.id
                            ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 font-semibold ring-2 ring-emerald-500/20'
                            : 'border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-950 hover:bg-neutral-100 dark:hover:bg-neutral-800/60 text-neutral-700 dark:text-neutral-300'
                        }`}
                      >
                        <div className="text-sm">{f.label}</div>
                        <div className="text-[10px] text-neutral-400 dark:text-neutral-500 font-mono mt-0.5">
                          {f.badge}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Quality Slider - only applicable for lossy formats (JPEG / WebP) */}
                {format !== 'image/png' ? (
                  <QualitySlider value={quality} onChange={setQuality} />
                ) : (
                  <div className="p-3.5 rounded-xl bg-neutral-100/70 dark:bg-neutral-800/40 border border-neutral-200 dark:border-neutral-800 text-xs text-neutral-600 dark:text-neutral-400">
                    <div className="flex items-center gap-1.5 font-semibold text-neutral-800 dark:text-neutral-200 mb-1">
                      <Info className="w-3.5 h-3.5 text-neutral-500" />
                      <span>Lossless PNG Mode</span>
                    </div>
                    PNG compression is lossless; browser deflate compression reduces file size without any pixel deterioration.
                  </div>
                )}
              </div>

              {/* Right Column: Optional Dimensions Constraint */}
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                      Maximum Dimensions (Optional)
                    </label>
                    <span className="text-[11px] text-neutral-400">Preserves aspect ratio</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label htmlFor="max-w" className="block text-[11px] text-neutral-400 mb-1">Max Width (px)</label>
                      <input
                        id="max-w"
                        type="number"
                        placeholder={`e.g. ${imageInfo.width}`}
                        value={maxWidth || ''}
                        onChange={(e) => setMaxWidth(e.target.value ? parseInt(e.target.value, 10) : undefined)}
                        className="w-full px-3 py-2 text-sm font-mono rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50/50 dark:bg-neutral-950 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                      />
                    </div>
                    <div>
                      <label htmlFor="max-h" className="block text-[11px] text-neutral-400 mb-1">Max Height (px)</label>
                      <input
                        id="max-h"
                        type="number"
                        placeholder={`e.g. ${imageInfo.height}`}
                        value={maxHeight || ''}
                        onChange={(e) => setMaxHeight(e.target.value ? parseInt(e.target.value, 10) : undefined)}
                        className="w-full px-3 py-2 text-sm font-mono rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50/50 dark:bg-neutral-950 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-3">
                  <button
                    type="button"
                    onClick={runCompression}
                    disabled={isCompressing}
                    className="w-full py-2.5 px-4 rounded-xl font-semibold text-sm bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isCompressing ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Compressing Image...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span>Apply Compression</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 text-xs">
                {error}
              </div>
            )}
          </div>

          {/* Results Comparison Section */}
          {compressionResult && (
            <div className="space-y-4 animate-in fade-in duration-300">
              {/* Big Metric Banner */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950">
                  <div className="text-xs text-neutral-400 font-medium mb-1">Original Size</div>
                  <div className="text-xl font-bold font-mono text-neutral-700 dark:text-neutral-300">
                    {formatBytes(compressionResult.originalSize)}
                  </div>
                  <div className="text-[11px] text-neutral-400 mt-1">
                    {imageInfo.width} × {imageInfo.height} px
                  </div>
                </div>

                <div className="p-4 rounded-2xl border border-emerald-500/30 bg-emerald-50/30 dark:bg-emerald-950/20">
                  <div className="text-xs text-emerald-700 dark:text-emerald-400 font-medium mb-1">
                    Compressed Size
                  </div>
                  <div className="text-xl font-bold font-mono text-emerald-700 dark:text-emerald-400">
                    {formatBytes(compressionResult.compressedSize)}
                  </div>
                  <div className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-1">
                    {compressionResult.width} × {compressionResult.height} px
                  </div>
                </div>

                <div className="p-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 flex flex-col justify-between">
                  <div className="text-xs text-emerald-800 dark:text-emerald-300 font-medium flex items-center gap-1">
                    <TrendingDown className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Size Reduction</span>
                  </div>
                  <div className="text-2xl font-extrabold font-mono text-emerald-600 dark:text-emerald-400">
                    {compressionResult.reductionPercentage > 0
                      ? `${compressionResult.reductionPercentage.toFixed(1)}%`
                      : '0% (Optimized)'}
                  </div>
                  <div className="text-[11px] text-emerald-700 dark:text-emerald-400">
                    Saved {formatBytes(Math.max(0, compressionResult.originalSize - compressionResult.compressedSize))}
                  </div>
                </div>
              </div>

              {/* Side-by-Side or Stacked Visual Previews */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold text-neutral-600 dark:text-neutral-400 px-1">
                    <span>Original Preview</span>
                    <span className="font-mono">{formatBytes(imageInfo.size)}</span>
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
                  <div className="flex items-center justify-between text-xs font-semibold text-emerald-700 dark:text-emerald-400 px-1">
                    <span>Compressed Preview</span>
                    <span className="font-mono">{formatBytes(compressionResult.compressedSize)}</span>
                  </div>
                  <ImagePreview
                    src={compressionResult.objectUrl}
                    alt="Compressed"
                    width={compressionResult.width}
                    height={compressionResult.height}
                    fileSize={compressionResult.compressedSize}
                    format={compressionResult.format}
                  />
                </div>
              </div>

              {/* Bottom Action Bar */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 shadow-xs">
                <div className="text-xs text-neutral-500 dark:text-neutral-400 text-center sm:text-left">
                  Output: <span className="font-mono font-semibold text-neutral-800 dark:text-neutral-200">{getOutputFilename()}</span>
                </div>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <DownloadButton
                    source={compressionResult.blob}
                    fileName={getOutputFilename()}
                    label={`Download Compressed (${formatBytes(compressionResult.compressedSize)})`}
                    className="w-full sm:w-auto"
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
