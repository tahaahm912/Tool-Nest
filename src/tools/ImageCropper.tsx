import React, { useState, useEffect, useRef, useCallback } from 'react';
import { LoadedImageInfo, ImageFormat } from '../lib/image/types';
import { executeCrop, CropExecuteResult } from '../lib/image/imageCropper';
import { formatBytes, revokeObjectUrlSafe } from '../lib/image/imageLoader';
import { ImageUpload } from '../components/image/ImageUpload';
import { ImageInfo } from '../components/image/ImageInfo';
import { PrivacyBadge } from '../components/image/PrivacyBadge';
import { QualitySlider } from '../components/image/QualitySlider';
import { DownloadButton } from '../components/image/DownloadButton';
import {
  Crop,
  RotateCw,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Square,
  Sparkles,
  Check,
  RefreshCw,
} from 'lucide-react';

type AspectRatioPreset = 'free' | '1:1' | '4:3' | '16:9' | '3:2';

interface CropBox {
  x: number; // percentage of displayed image (0 to 100)
  y: number;
  width: number;
  height: number;
}

export const ImageCropper: React.FC = () => {
  const [imageInfo, setImageInfo] = useState<LoadedImageInfo | null>(null);
  const [rotation, setRotation] = useState<number>(0);
  const [zoom, setZoom] = useState<number>(1);
  const [aspectRatio, setAspectRatio] = useState<AspectRatioPreset>('free');
  const [format, setFormat] = useState<ImageFormat>('image/png');
  const [quality, setQuality] = useState<number>(0.9);

  // Crop box in percentages (0 to 100)
  const [cropBox, setCropBox] = useState<CropBox>({ x: 10, y: 10, width: 80, height: 80 });

  const [isCropping, setIsCropping] = useState(false);
  const [cropResult, setCropResult] = useState<CropExecuteResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Ref for image container element to measure layout bounds
  const stageRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const prevResultUrlRef = useRef<string | null>(null);

  // Interaction tracking (drag/resize)
  const dragRef = useRef<{
    mode: 'move' | 'nw' | 'ne' | 'se' | 'sw' | 'n' | 'e' | 's' | 'w';
    startX: number;
    startY: number;
    initialCrop: CropBox;
  } | null>(null);

  useEffect(() => {
    return () => {
      revokeObjectUrlSafe(prevResultUrlRef.current);
    };
  }, []);

  const resetCropToAspect = useCallback(
    (preset: AspectRatioPreset, imgW: number, imgH: number) => {
      let targetW = 80;
      let targetH = 80;

      if (preset === '1:1') {
        const imageRatio = imgW / imgH;
        if (imageRatio > 1) {
          targetH = 80;
          targetW = targetH / imageRatio;
        } else {
          targetW = 80;
          targetH = targetW * imageRatio;
        }
      } else if (preset === '16:9') {
        const targetRatio = 16 / 9;
        const imageRatio = imgW / imgH;
        if (imageRatio > targetRatio) {
          targetH = 75;
          targetW = targetH * (targetRatio / imageRatio);
        } else {
          targetW = 75;
          targetH = targetW * (imageRatio / targetRatio);
        }
      } else if (preset === '4:3') {
        const targetRatio = 4 / 3;
        const imageRatio = imgW / imgH;
        if (imageRatio > targetRatio) {
          targetH = 75;
          targetW = targetH * (targetRatio / imageRatio);
        } else {
          targetW = 75;
          targetH = targetW * (imageRatio / targetRatio);
        }
      } else if (preset === '3:2') {
        const targetRatio = 3 / 2;
        const imageRatio = imgW / imgH;
        if (imageRatio > targetRatio) {
          targetH = 75;
          targetW = targetH * (targetRatio / imageRatio);
        } else {
          targetW = 75;
          targetH = targetW * (imageRatio / targetRatio);
        }
      }

      const x = (100 - targetW) / 2;
      const y = (100 - targetH) / 2;
      setCropBox({ x, y, width: targetW, height: targetH });
    },
    []
  );

  const handleImageLoaded = (loaded: LoadedImageInfo) => {
    if (cropResult) {
      revokeObjectUrlSafe(cropResult.objectUrl);
      setCropResult(null);
    }
    setImageInfo(loaded);
    setRotation(0);
    setZoom(1);
    setAspectRatio('free');
    resetCropToAspect('free', loaded.width, loaded.height);

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
    if (cropResult) {
      revokeObjectUrlSafe(cropResult.objectUrl);
    }
    setImageInfo(null);
    setCropResult(null);
    setRotation(0);
    setZoom(1);
    setError(null);
  };

  const handlePresetSelect = (preset: AspectRatioPreset) => {
    setAspectRatio(preset);
    if (imageInfo) {
      resetCropToAspect(preset, imageInfo.width, imageInfo.height);
    }
  };

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  // Convert crop percentage to natural image coordinates
  const getNaturalCropCoordinates = () => {
    if (!imageInfo) return { x: 0, y: 0, width: 0, height: 0 };
    const naturalW = imageInfo.width;
    const naturalH = imageInfo.height;

    const x = Math.max(0, Math.round((cropBox.x / 100) * naturalW));
    const y = Math.max(0, Math.round((cropBox.y / 100) * naturalH));
    const width = Math.min(naturalW - x, Math.round((cropBox.width / 100) * naturalW));
    const height = Math.min(naturalH - y, Math.round((cropBox.height / 100) * naturalH));

    return { x, y, width: Math.max(1, width), height: Math.max(1, height) };
  };

  const currentCropPixels = getNaturalCropCoordinates();

  const runCrop = async () => {
    if (!imageInfo) return;
    setIsCropping(true);
    setError(null);

    try {
      const coords = getNaturalCropCoordinates();
      const res = await executeCrop(imageInfo.imageElement, {
        crop: coords,
        rotation,
        format,
        quality,
      });

      if (prevResultUrlRef.current) {
        revokeObjectUrlSafe(prevResultUrlRef.current);
      }
      prevResultUrlRef.current = res.objectUrl;
      setCropResult(res);
    } catch (err: any) {
      setError(err.message || 'Cropping failed.');
    } finally {
      setIsCropping(false);
    }
  };

  // Pointer event handlers for drag / resize
  const onPointerDown = (
    e: React.PointerEvent,
    mode: 'move' | 'nw' | 'ne' | 'se' | 'sw' | 'n' | 'e' | 's' | 'w'
  ) => {
    e.stopPropagation();
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);

    dragRef.current = {
      mode,
      startX: e.clientX,
      startY: e.clientY,
      initialCrop: { ...cropBox },
    };
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragRef.current || !stageRef.current) return;
    const rect = stageRef.current.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;

    const deltaXPct = ((e.clientX - dragRef.current.startX) / rect.width) * 100;
    const deltaYPct = ((e.clientY - dragRef.current.startY) / rect.height) * 100;

    const { mode, initialCrop } = dragRef.current;

    let newX = initialCrop.x;
    let newY = initialCrop.y;
    let newW = initialCrop.width;
    let newH = initialCrop.height;

    const minPct = 5; // minimum crop size 5%

    if (mode === 'move') {
      newX = Math.max(0, Math.min(100 - initialCrop.width, initialCrop.x + deltaXPct));
      newY = Math.max(0, Math.min(100 - initialCrop.height, initialCrop.y + deltaYPct));
    } else if (mode === 'se') {
      newW = Math.max(minPct, Math.min(100 - initialCrop.x, initialCrop.width + deltaXPct));
      newH = Math.max(minPct, Math.min(100 - initialCrop.y, initialCrop.height + deltaYPct));
    } else if (mode === 'sw') {
      const allowedDeltaX = Math.min(initialCrop.width - minPct, -deltaXPct);
      newX = Math.max(0, initialCrop.x - allowedDeltaX);
      newW = initialCrop.width + (initialCrop.x - newX);
      newH = Math.max(minPct, Math.min(100 - initialCrop.y, initialCrop.height + deltaYPct));
    } else if (mode === 'ne') {
      newW = Math.max(minPct, Math.min(100 - initialCrop.x, initialCrop.width + deltaXPct));
      const allowedDeltaY = Math.min(initialCrop.height - minPct, -deltaYPct);
      newY = Math.max(0, initialCrop.y - allowedDeltaY);
      newH = initialCrop.height + (initialCrop.y - newY);
    } else if (mode === 'nw') {
      const allowedDeltaX = Math.min(initialCrop.width - minPct, -deltaXPct);
      newX = Math.max(0, initialCrop.x - allowedDeltaX);
      newW = initialCrop.width + (initialCrop.x - newX);

      const allowedDeltaY = Math.min(initialCrop.height - minPct, -deltaYPct);
      newY = Math.max(0, initialCrop.y - allowedDeltaY);
      newH = initialCrop.height + (initialCrop.y - newY);
    } else if (mode === 'e') {
      newW = Math.max(minPct, Math.min(100 - initialCrop.x, initialCrop.width + deltaXPct));
    } else if (mode === 's') {
      newH = Math.max(minPct, Math.min(100 - initialCrop.y, initialCrop.height + deltaYPct));
    } else if (mode === 'w') {
      const allowedDeltaX = Math.min(initialCrop.width - minPct, -deltaXPct);
      newX = Math.max(0, initialCrop.x - allowedDeltaX);
      newW = initialCrop.width + (initialCrop.x - newX);
    } else if (mode === 'n') {
      const allowedDeltaY = Math.min(initialCrop.height - minPct, -deltaYPct);
      newY = Math.max(0, initialCrop.y - allowedDeltaY);
      newH = initialCrop.height + (initialCrop.y - newY);
    }

    setCropBox({
      x: Math.max(0, Math.min(100 - newW, newX)),
      y: Math.max(0, Math.min(100 - newH, newY)),
      width: newW,
      height: newH,
    });
  };

  const onPointerUp = (e: React.PointerEvent) => {
    (e.target as HTMLElement).releasePointerCapture?.(e.pointerId);
    dragRef.current = null;
  };

  const getOutputFilename = () => {
    if (!imageInfo) return 'cropped-image';
    const baseName = imageInfo.name.substring(0, imageInfo.name.lastIndexOf('.')) || imageInfo.name;
    const ext = format === 'image/jpeg' ? 'jpg' : format === 'image/png' ? 'png' : 'webp';
    return `${baseName}-cropped.${ext}`;
  };

  return (
    <div className="space-y-6">
      <PrivacyBadge />

      <ImageUpload
        currentImage={imageInfo}
        onImageLoaded={handleImageLoaded}
        onClear={handleReset}
        title="Drop an image to crop"
        subtitle="Supports JPG, PNG, WebP, GIF, and BMP (up to 50 MB)"
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

          {/* Controls Bar: Presets, Rotation, Zoom */}
          <div className="p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 shadow-xs flex flex-wrap items-center justify-between gap-3">
            {/* Aspect Ratio Presets */}
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-xs font-semibold text-neutral-600 dark:text-neutral-400 mr-1">
                Aspect:
              </span>
              {[
                { id: 'free', label: 'Free' },
                { id: '1:1', label: '1:1 Square' },
                { id: '4:3', label: '4:3' },
                { id: '16:9', label: '16:9' },
                { id: '3:2', label: '3:2' },
              ].map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => handlePresetSelect(p.id as AspectRatioPreset)}
                  className={`px-2.5 py-1.5 text-xs font-medium rounded-lg border transition-colors cursor-pointer ${
                    aspectRatio === p.id
                      ? 'bg-emerald-500 text-white border-emerald-500 font-semibold shadow-xs'
                      : 'bg-neutral-100 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>

            {/* Transform Controls (Rotate, Zoom, Reset Crop) */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleRotate}
                title="Rotate 90° Clockwise"
                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-700 cursor-pointer shadow-xs"
              >
                <RotateCw className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Rotate 90° {rotation > 0 ? `(${rotation}°)` : ''}</span>
              </button>

              <div className="flex items-center rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 overflow-hidden">
                <button
                  type="button"
                  onClick={() => setZoom((z) => Math.max(0.6, z - 0.2))}
                  disabled={zoom <= 0.6}
                  title="Zoom Out"
                  className="p-1.5 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 disabled:opacity-30 cursor-pointer"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <span className="px-2 text-xs font-mono text-neutral-600 dark:text-neutral-300">
                  {Math.round(zoom * 100)}%
                </span>
                <button
                  type="button"
                  onClick={() => setZoom((z) => Math.min(2.5, z + 0.2))}
                  disabled={zoom >= 2.5}
                  title="Zoom In"
                  className="p-1.5 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 disabled:opacity-30 cursor-pointer"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
              </div>

              <button
                type="button"
                onClick={() => resetCropToAspect(aspectRatio, imageInfo.width, imageInfo.height)}
                title="Reset Crop Area"
                className="p-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Interactive Cropper Stage */}
          <div className="relative rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-900/90 overflow-hidden flex flex-col items-center justify-center p-4 select-none min-h-[380px] max-h-[550px]">
            {/* Dimensions HUD */}
            <div className="absolute top-3 left-3 z-30 px-2.5 py-1 rounded-md bg-black/70 backdrop-blur-xs text-white text-xs font-mono border border-white/10 shadow-sm flex items-center gap-2">
              <Crop className="w-3.5 h-3.5 text-emerald-400" />
              <span>
                Selection: {currentCropPixels.width} × {currentCropPixels.height} px
              </span>
            </div>

            {/* Stage wrapper */}
            <div
              ref={stageRef}
              className="relative inline-block overflow-hidden shadow-2xl transition-transform duration-100 ease-out"
              style={{
                transform: `scale(${zoom}) rotate(${rotation}deg)`,
                maxWidth: '100%',
                maxHeight: '440px',
              }}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
            >
              {/* Displayed Image */}
              <img
                ref={imageRef}
                src={imageInfo.objectUrl}
                alt="Crop Target"
                className="block max-h-[420px] max-w-full object-contain pointer-events-none"
                draggable={false}
              />

              {/* Shaded Mask Area Outside Crop Box */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: 'rgba(0, 0, 0, 0.55)',
                  clipPath: `polygon(
                    0% 0%, 100% 0%, 100% 100%, 0% 100%,
                    0% 0%,
                    ${cropBox.x}% ${cropBox.y}%,
                    ${cropBox.x}% ${cropBox.y + cropBox.height}%,
                    ${cropBox.x + cropBox.width}% ${cropBox.y + cropBox.height}%,
                    ${cropBox.x + cropBox.width}% ${cropBox.y}%,
                    ${cropBox.x}% ${cropBox.y}%
                  )`,
                }}
              />

              {/* Active Crop Box */}
              <div
                className="absolute border-2 border-emerald-400 shadow-sm cursor-move touch-none group"
                style={{
                  left: `${cropBox.x}%`,
                  top: `${cropBox.y}%`,
                  width: `${cropBox.width}%`,
                  height: `${cropBox.height}%`,
                }}
                onPointerDown={(e) => onPointerDown(e, 'move')}
              >
                {/* Rule-of-thirds grid lines */}
                <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none opacity-40 group-hover:opacity-75 transition-opacity">
                  <div className="border-r border-b border-white/60" />
                  <div className="border-r border-b border-white/60" />
                  <div className="border-b border-white/60" />
                  <div className="border-r border-b border-white/60" />
                  <div className="border-r border-b border-white/60" />
                  <div className="border-b border-white/60" />
                  <div className="border-r border-white/60" />
                  <div className="border-r border-white/60" />
                  <div />
                </div>

                {/* 4 Corner Resize Handles */}
                <div
                  onPointerDown={(e) => onPointerDown(e, 'nw')}
                  className="absolute -top-2 -left-2 w-4 h-4 bg-white border-2 border-emerald-500 rounded-xs shadow-md cursor-nwse-resize"
                />
                <div
                  onPointerDown={(e) => onPointerDown(e, 'ne')}
                  className="absolute -top-2 -right-2 w-4 h-4 bg-white border-2 border-emerald-500 rounded-xs shadow-md cursor-nesw-resize"
                />
                <div
                  onPointerDown={(e) => onPointerDown(e, 'se')}
                  className="absolute -bottom-2 -right-2 w-4 h-4 bg-white border-2 border-emerald-500 rounded-xs shadow-md cursor-nwse-resize"
                />
                <div
                  onPointerDown={(e) => onPointerDown(e, 'sw')}
                  className="absolute -bottom-2 -left-2 w-4 h-4 bg-white border-2 border-emerald-500 rounded-xs shadow-md cursor-nesw-resize"
                />

                {/* 4 Edge Handles */}
                <div
                  onPointerDown={(e) => onPointerDown(e, 'n')}
                  className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-6 h-2 bg-white border border-emerald-500 rounded-xs shadow-xs cursor-ns-resize"
                />
                <div
                  onPointerDown={(e) => onPointerDown(e, 's')}
                  className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-6 h-2 bg-white border border-emerald-500 rounded-xs shadow-xs cursor-ns-resize"
                />
                <div
                  onPointerDown={(e) => onPointerDown(e, 'w')}
                  className="absolute top-1/2 -left-1.5 -translate-y-1/2 w-2 h-6 bg-white border border-emerald-500 rounded-xs shadow-xs cursor-ew-resize"
                />
                <div
                  onPointerDown={(e) => onPointerDown(e, 'e')}
                  className="absolute top-1/2 -right-1.5 -translate-y-1/2 w-2 h-6 bg-white border border-emerald-500 rounded-xs shadow-xs cursor-ew-resize"
                />
              </div>
            </div>
          </div>

          {/* Format Settings and Action Button */}
          <div className="p-5 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 shadow-xs space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-2">
                  Output Format
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'image/png', label: 'PNG' },
                    { id: 'image/jpeg', label: 'JPEG' },
                    { id: 'image/webp', label: 'WebP' },
                  ].map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => setFormat(f.id as ImageFormat)}
                      className={`p-2 rounded-xl border text-center text-xs font-medium transition-colors cursor-pointer ${
                        format === f.id
                          ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 font-semibold ring-2 ring-emerald-500/20'
                          : 'border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 text-neutral-700 dark:text-neutral-300'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                {format !== 'image/png' ? (
                  <QualitySlider value={quality} onChange={setQuality} />
                ) : (
                  <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200 dark:border-neutral-800 text-xs text-neutral-500 dark:text-neutral-400">
                    PNG preserves full lossless fidelity and transparent pixels.
                  </div>
                )}
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 text-xs">
                {error}
              </div>
            )}

            <div className="pt-2">
              <button
                type="button"
                onClick={runCrop}
                disabled={isCropping}
                className="w-full py-3 px-4 rounded-xl font-semibold text-sm bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isCropping ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Rendering Crop...</span>
                  </>
                ) : (
                  <>
                    <Crop className="w-4 h-4" />
                    <span>Crop Image ({currentCropPixels.width} × {currentCropPixels.height} px)</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Cropped Result Display */}
          {cropResult && (
            <div className="space-y-4 animate-in fade-in duration-300">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 shadow-xs">
                <div>
                  <div className="text-sm font-semibold text-neutral-900 dark:text-white flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-500" />
                    <span>Cropped Output:</span>
                    <span className="font-mono text-emerald-600 dark:text-emerald-400">
                      {cropResult.width} × {cropResult.height} px
                    </span>
                    <span className="text-xs text-neutral-400">
                      ({formatBytes(cropResult.fileSize)})
                    </span>
                  </div>
                  <div className="text-xs text-neutral-400 mt-0.5 font-mono">
                    {getOutputFilename()}
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <DownloadButton
                    source={cropResult.blob}
                    fileName={getOutputFilename()}
                    label={`Download Crop (${cropResult.width}×${cropResult.height})`}
                    className="w-full sm:w-auto"
                  />
                </div>
              </div>

              {/* Cropped Preview */}
              <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-100/80 dark:bg-neutral-900/50 p-6 flex flex-col items-center justify-center bg-checkerboard">
                <img
                  src={cropResult.objectUrl}
                  alt="Cropped Result"
                  className="max-h-[380px] max-w-full rounded-lg shadow-md object-contain"
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
