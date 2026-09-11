import React, { useState, useEffect, useRef } from 'react';
import { LoadedImageInfo, ImageFormat } from '../lib/image/types';
import { resizeImage, ResizeResult } from '../lib/image/imageResizer';
import { formatBytes, revokeObjectUrlSafe } from '../lib/image/imageLoader';
import { ImageUpload } from '../components/image/ImageUpload';
import { ImagePreview } from '../components/image/ImagePreview';
import { ImageInfo } from '../components/image/ImageInfo';
import { PrivacyBadge } from '../components/image/PrivacyBadge';
import { DimensionInputs } from '../components/image/DimensionInputs';
import { QualitySlider } from '../components/image/QualitySlider';
import { DownloadButton } from '../components/image/DownloadButton';
import { Maximize, RefreshCw, RotateCcw, AlertTriangle, ArrowRight } from 'lucide-react';

export const ImageResizer: React.FC = () => {
  const [imageInfo, setImageInfo] = useState<LoadedImageInfo | null>(null);
  const [width, setWidth] = useState<number>(0);
  const [height, setHeight] = useState<number>(0);
  const [lockAspectRatio, setLockAspectRatio] = useState<boolean>(true);
  const [format, setFormat] = useState<ImageFormat>('image/png');
  const [quality, setQuality] = useState<number>(0.9);
  const [isResizing, setIsResizing] = useState<boolean>(false);
  const [resizeResult, setResizeResult] = useState<ResizeResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const prevResultUrlRef = useRef<string | null>(null);

  useEffect(() => {
    return () => {
      revokeObjectUrlSafe(prevResultUrlRef.current);
    };
  }, []);

  const handleImageLoaded = (loaded: LoadedImageInfo) => {
    if (resizeResult) {
      revokeObjectUrlSafe(resizeResult.objectUrl);
      setResizeResult(null);
    }
    setImageInfo(loaded);
    setWidth(loaded.width);
    setHeight(loaded.height);
    setLockAspectRatio(true);

    if (loaded.type === 'image/jpeg') {
      setFormat('image/jpeg');
    } else if (loaded.type === 'image/webp') {
      setFormat('image/webp');
    } else {
      setFormat('image/png');
    }
    setError(null);
  };

  const handleReset = () => {
    if (imageInfo) {
      revokeObjectUrlSafe(imageInfo.objectUrl);
    }
    if (resizeResult) {
      revokeObjectUrlSafe(resizeResult.objectUrl);
    }
    setImageInfo(null);
    setResizeResult(null);
    setWidth(0);
    setHeight(0);
    setError(null);
  };

  const handleResetToOriginal = () => {
    if (!imageInfo) return;
    setWidth(imageInfo.width);
    setHeight(imageInfo.height);
  };

  const runResize = async () => {
    if (!imageInfo) return;
    if (width <= 0 || height <= 0) {
      setError('Dimensions must be greater than zero.');
      return;
    }

    setIsResizing(true);
    setError(null);

    try {
      const res = await resizeImage(imageInfo.imageElement, {
        width,
        height,
        format,
        quality,
      });

      if (prevResultUrlRef.current) {
        revokeObjectUrlSafe(prevResultUrlRef.current);
      }
      prevResultUrlRef.current = res.objectUrl;
      setResizeResult(res);
    } catch (err: any) {
      setError(err.message || 'Resizing failed.');
    } finally {
      setIsResizing(false);
    }
  };

  const isUpscaling = imageInfo && (width > imageInfo.width * 1.5 || height > imageInfo.height * 1.5);

  const getOutputFilename = () => {
    if (!imageInfo) return 'resized-image';
    const baseName = imageInfo.name.substring(0, imageInfo.name.lastIndexOf('.')) || imageInfo.name;
    const ext = format === 'image/jpeg' ? 'jpg' : format === 'image/png' ? 'png' : 'webp';
    return `${baseName}-${width}x${height}.${ext}`;
  };

  return (
    <div className="space-y-6">
      <PrivacyBadge />

      <ImageUpload
        currentImage={imageInfo}
        onImageLoaded={handleImageLoaded}
        onClear={handleReset}
        title="Drop an image to resize"
        subtitle="Accepts JPG, PNG, WebP, GIF, and BMP (up to 50 MB)"
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

          {/* Resizing Configuration Panel */}
          <div className="p-5 sm:p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 shadow-xs space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800">
              <div className="flex items-center gap-2">
                <Maximize className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">
                  Target Dimensions & Format
                </h3>
              </div>
              <button
                type="button"
                onClick={handleResetToOriginal}
                className="inline-flex items-center gap-1 text-xs text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Dimensions</span>
              </button>
            </div>

            {/* Dimension Inputs with Aspect Ratio Lock */}
            <DimensionInputs
              originalWidth={imageInfo.width}
              originalHeight={imageInfo.height}
              width={width}
              height={height}
              onWidthChange={setWidth}
              onHeightChange={setHeight}
              lockAspectRatio={lockAspectRatio}
              onToggleLock={() => setLockAspectRatio((prev) => !prev)}
              onResetToOriginal={handleResetToOriginal}
            />

            {/* Upscaling warning banner if applicable */}
            {isUpscaling && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 text-amber-800 dark:text-amber-300 text-xs">
                <AlertTriangle className="w-4 h-4 flex-shrink-0 text-amber-600" />
                <span>
                  Notice: Scaling to {width} × {height} px exceeds 150% of original resolution, which may introduce raster pixelation.
                </span>
              </div>
            )}

            {/* Format & Quality Settings */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 border-t border-neutral-100 dark:border-neutral-800">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-2">
                  Output Format
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'image/png', label: 'PNG', note: 'Lossless' },
                    { id: 'image/jpeg', label: 'JPEG', note: 'Photos' },
                    { id: 'image/webp', label: 'WebP', note: 'Modern Web' },
                  ].map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => setFormat(f.id as ImageFormat)}
                      className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                        format === f.id
                          ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 font-semibold ring-2 ring-emerald-500/20'
                          : 'border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-950 text-neutral-700 dark:text-neutral-300'
                      }`}
                    >
                      <div className="text-xs font-medium">{f.label}</div>
                      <div className="text-[10px] text-neutral-400 font-mono mt-0.5">{f.note}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                {format !== 'image/png' ? (
                  <QualitySlider value={quality} onChange={setQuality} />
                ) : (
                  <div className="p-3.5 rounded-xl bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200 dark:border-neutral-800 text-xs text-neutral-500 dark:text-neutral-400">
                    PNG format preserves maximum pixel sharpness and transparent alpha channels.
                  </div>
                )}
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 text-xs">
                {error}
              </div>
            )}

            <div>
              <button
                type="button"
                onClick={runResize}
                disabled={isResizing || width <= 0 || height <= 0}
                className="w-full py-2.5 px-4 rounded-xl font-semibold text-sm bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isResizing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Rendering Resized Image...</span>
                  </>
                ) : (
                  <>
                    <Maximize className="w-4 h-4" />
                    <span>Resize to {width} × {height} px</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Resized Result Section */}
          {resizeResult && (
            <div className="space-y-4 animate-in fade-in duration-300">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 shadow-xs">
                <div>
                  <div className="text-sm font-semibold text-neutral-900 dark:text-white flex items-center gap-2">
                    <span>Resized Result:</span>
                    <span className="font-mono text-emerald-600 dark:text-emerald-400">
                      {resizeResult.width} × {resizeResult.height} px
                    </span>
                    <span className="text-xs text-neutral-400">
                      ({formatBytes(resizeResult.fileSize)})
                    </span>
                  </div>
                  <div className="text-xs text-neutral-400 mt-0.5 font-mono">
                    {getOutputFilename()}
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <DownloadButton
                    source={resizeResult.blob}
                    fileName={getOutputFilename()}
                    label={`Download Resized (${resizeResult.width}×${resizeResult.height})`}
                    className="w-full sm:w-auto"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="text-xs font-semibold text-neutral-500 px-1">
                    Original ({imageInfo.width} × {imageInfo.height} px)
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
                  <div className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 px-1">
                    Resized ({resizeResult.width} × {resizeResult.height} px)
                  </div>
                  <ImagePreview
                    src={resizeResult.objectUrl}
                    alt="Resized"
                    width={resizeResult.width}
                    height={resizeResult.height}
                    fileSize={resizeResult.fileSize}
                    format={resizeResult.format}
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
