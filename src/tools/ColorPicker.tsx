import React, { useState, useEffect, useRef, useCallback } from 'react';
import { LoadedImageInfo, ColorData } from '../lib/image/types';
import {
  rgbToColorData,
  hexToColorData,
  extractSamplePalette,
} from '../lib/image/colorExtractor';
import { revokeObjectUrlSafe } from '../lib/image/imageLoader';
import { ImageUpload } from '../components/image/ImageUpload';
import { ImageInfo } from '../components/image/ImageInfo';
import { PrivacyBadge } from '../components/image/PrivacyBadge';
import {
  Pipette,
  Copy,
  Check,
  RotateCcw,
  Palette,
  Crosshair,
  Sliders,
} from 'lucide-react';

export const ColorPicker: React.FC = () => {
  const [imageInfo, setImageInfo] = useState<LoadedImageInfo | null>(null);
  const [activeColor, setActiveColor] = useState<ColorData>(() =>
    rgbToColorData(16, 185, 129, 1) // #10B981
  );
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [cursorPos, setCursorPos] = useState<{ x: number; y: number } | null>(null);
  const [palette, setPalette] = useState<ColorData[]>([]);
  const [isPickingActive, setIsPickingActive] = useState<boolean>(true);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // When image loads, draw it to hidden/offscreen full-resolution canvas for 1:1 pixel sampling
  useEffect(() => {
    if (!imageInfo) {
      setPalette([]);
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = imageInfo.width;
    canvas.height = imageInfo.height;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(imageInfo.imageElement, 0, 0);

    // Extract dominant palette
    const extracted = extractSamplePalette(imageInfo.imageElement, 10);
    setPalette(extracted);

    // Center pixel color sample
    const centerX = Math.floor(imageInfo.width / 2);
    const centerY = Math.floor(imageInfo.height / 2);
    samplePixelAt(centerX, centerY);
  }, [imageInfo]);

  const samplePixelAt = (naturalX: number, naturalY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    const clampedX = Math.max(0, Math.min(canvas.width - 1, Math.floor(naturalX)));
    const clampedY = Math.max(0, Math.min(canvas.height - 1, Math.floor(naturalY)));

    const pixel = ctx.getImageData(clampedX, clampedY, 1, 1).data;
    const color = rgbToColorData(pixel[0], pixel[1], pixel[2], pixel[3] / 255);
    setActiveColor(color);
  };

  const handlePointerAction = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!imageInfo || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();

    // Coordinates relative to displayed container element
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    if (clickX < 0 || clickX > rect.width || clickY < 0 || clickY > rect.height) {
      return;
    }

    // Map displayed element coordinates to natural image pixels
    const scaleX = imageInfo.width / rect.width;
    const scaleY = imageInfo.height / rect.height;

    const naturalX = clickX * scaleX;
    const naturalY = clickY * scaleY;

    setCursorPos({ x: clickX, y: clickY });
    samplePixelAt(naturalX, naturalY);
  };

  const copyVal = (val: string, key: string) => {
    navigator.clipboard.writeText(val);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1500);
  };

  const handleManualHexInput = (hex: string) => {
    const parsed = hexToColorData(hex);
    if (parsed) {
      setActiveColor(parsed);
    }
  };

  const handleClearImage = () => {
    if (imageInfo) {
      revokeObjectUrlSafe(imageInfo.objectUrl);
    }
    setImageInfo(null);
    setPalette([]);
    setCursorPos(null);
  };

  return (
    <div className="space-y-6">
      <PrivacyBadge />

      {/* Hidden 1:1 Canvas for pixel sampling */}
      <canvas ref={canvasRef} className="hidden" aria-hidden="true" />

      {/* Active Color Hero Swatch + Values */}
      <div className="p-5 sm:p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row items-center gap-6">
          {/* Main Color Swatch with built-in input[type=color] */}
          <div className="relative group flex-shrink-0">
            <div
              className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl shadow-inner border border-neutral-300/60 dark:border-neutral-700/60 flex items-center justify-center transition-transform group-hover:scale-105 overflow-hidden"
              style={{ backgroundColor: activeColor.hex }}
            >
              {activeColor.isTransparent && (
                <div className="bg-white/90 dark:bg-black/80 text-[11px] font-semibold px-2 py-1 rounded text-neutral-600 dark:text-neutral-300">
                  Transparent
                </div>
              )}
            </div>
            <input
              type="color"
              value={activeColor.hex}
              onChange={(e) => handleManualHexInput(e.target.value)}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              title="Click to open color palette selector"
            />
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-black/75 text-white text-[10px] px-2 py-0.5 rounded-full pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
              Change Color
            </div>
          </div>

          {/* Color Values Grid */}
          <div className="flex-1 w-full grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* HEX */}
            <div className="flex items-center justify-between p-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/70 dark:bg-neutral-950">
              <div>
                <span className="text-[11px] text-neutral-400 font-bold">HEX</span>
                <div className="text-sm font-bold font-mono text-neutral-900 dark:text-white uppercase">
                  {activeColor.hex}
                </div>
              </div>
              <button
                type="button"
                onClick={() => copyVal(activeColor.hex, 'hex')}
                className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-200/50 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
                title="Copy HEX code"
              >
                {copiedKey === 'hex' ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>

            {/* RGB */}
            <div className="flex items-center justify-between p-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/70 dark:bg-neutral-950">
              <div>
                <span className="text-[11px] text-neutral-400 font-bold">RGB</span>
                <div className="text-sm font-bold font-mono text-neutral-900 dark:text-white">
                  {activeColor.rgbString}
                </div>
              </div>
              <button
                type="button"
                onClick={() => copyVal(activeColor.rgbString, 'rgb')}
                className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-200/50 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
                title="Copy RGB code"
              >
                {copiedKey === 'rgb' ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>

            {/* HSL */}
            <div className="flex items-center justify-between p-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/70 dark:bg-neutral-950">
              <div>
                <span className="text-[11px] text-neutral-400 font-bold">HSL</span>
                <div className="text-sm font-bold font-mono text-neutral-900 dark:text-white">
                  {activeColor.hslString}
                </div>
              </div>
              <button
                type="button"
                onClick={() => copyVal(activeColor.hslString, 'hsl')}
                className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-200/50 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
                title="Copy HSL code"
              >
                {copiedKey === 'hsl' ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>

            {/* CMYK Approximation */}
            <div className="flex items-center justify-between p-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/70 dark:bg-neutral-950">
              <div>
                <span className="text-[11px] text-neutral-400 font-bold">CMYK (approx)</span>
                <div className="text-sm font-bold font-mono text-neutral-900 dark:text-white">
                  {activeColor.cmykString}
                </div>
              </div>
              <button
                type="button"
                onClick={() => copyVal(activeColor.cmykString, 'cmyk')}
                className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-200/50 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
                title="Copy CMYK code"
              >
                {copiedKey === 'cmyk' ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>

        {/* Extracted Palette if image loaded */}
        {palette.length > 0 && (
          <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800 space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-neutral-600 dark:text-neutral-400">
              <Palette className="w-3.5 h-3.5 text-neutral-400" />
              <span>Extracted Image Palette (Click to inspect)</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {palette.map((color, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActiveColor(color)}
                  className="group relative w-9 h-9 rounded-xl border border-neutral-200 dark:border-neutral-700 shadow-2xs hover:scale-110 transition-transform cursor-pointer overflow-hidden"
                  style={{ backgroundColor: color.hex }}
                  title={`${color.hex} - Click to select`}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Image Upload & Interactive Canvas Stage */}
      <ImageUpload
        currentImage={imageInfo}
        onImageLoaded={(loaded) => setImageInfo(loaded)}
        onClear={handleClearImage}
        title="Upload an image to pick colors from pixels"
        subtitle="Click or drag anywhere on the photo to sample exact pixel colors"
      />

      {imageInfo && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <ImageInfo
            fileName={imageInfo.name}
            fileType={imageInfo.type}
            fileSize={imageInfo.size}
            width={imageInfo.width}
            height={imageInfo.height}
            aspectRatio={imageInfo.aspectRatio}
          />

          {/* Interactive Image Display */}
          <div className="p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-900 flex flex-col items-center justify-center relative overflow-hidden select-none bg-checkerboard">
            <div className="text-xs text-white/80 font-medium pb-2 flex items-center gap-1.5 self-start">
              <Crosshair className="w-3.5 h-3.5 text-emerald-400" />
              <span>Tap or click anywhere on the image below to sample color:</span>
            </div>

            <div
              ref={containerRef}
              onClick={handlePointerAction}
              onPointerMove={(e) => {
                if (e.buttons === 1) {
                  handlePointerAction(e);
                }
              }}
              className="relative inline-block cursor-crosshair max-w-full rounded-lg overflow-hidden shadow-xl"
            >
              <img
                src={imageInfo.objectUrl}
                alt="Eyedropper target"
                className="max-h-[440px] max-w-full block object-contain select-none pointer-events-none"
                draggable={false}
              />

              {/* Cursor crosshair indicator */}
              {cursorPos && (
                <div
                  className="absolute pointer-events-none -translate-x-1/2 -translate-y-1/2 transition-transform duration-75"
                  style={{ left: cursorPos.x, top: cursorPos.y }}
                >
                  <div
                    className="w-6 h-6 rounded-full border-2 border-white shadow-md flex items-center justify-center"
                    style={{ backgroundColor: activeColor.hex }}
                  >
                    <div className="w-1 h-1 bg-black rounded-full" />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
