import React, { useState } from 'react';
import { ZoomIn, ZoomOut, RotateCcw, Maximize2 } from 'lucide-react';
import { formatBytes } from '../../lib/image/imageLoader';

interface ImagePreviewProps {
  src: string;
  alt?: string;
  width?: number;
  height?: number;
  fileSize?: number;
  format?: string;
  className?: string;
  maxContainerHeight?: string;
  showZoomControls?: boolean;
}

export const ImagePreview: React.FC<ImagePreviewProps> = ({
  src,
  alt = 'Image preview',
  width,
  height,
  fileSize,
  format,
  className = '',
  maxContainerHeight = 'max-h-[420px]',
  showZoomControls = true,
}) => {
  const [zoomLevel, setZoomLevel] = useState(1);

  const handleZoomIn = () => setZoomLevel((prev) => Math.min(prev + 0.25, 3));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(prev - 0.25, 0.5));
  const handleResetZoom = () => setZoomLevel(1);

  return (
    <div
      className={`relative rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-100/70 dark:bg-neutral-900/60 overflow-hidden flex flex-col ${className}`}
    >
      {/* Top Bar with Badges and Zoom */}
      <div className="flex items-center justify-between px-3.5 py-2 border-b border-neutral-200/80 dark:border-neutral-800/80 bg-white/70 dark:bg-neutral-950/70 backdrop-blur-xs z-10">
        <div className="flex items-center gap-2 text-xs font-mono text-neutral-600 dark:text-neutral-400">
          {format && (
            <span className="uppercase px-1.5 py-0.5 rounded-md bg-neutral-200/70 dark:bg-neutral-800 font-semibold text-neutral-800 dark:text-neutral-200">
              {format.replace('image/', '')}
            </span>
          )}
          {width && height && (
            <span>
              {width} × {height} px
            </span>
          )}
          {fileSize !== undefined && (
            <>
              <span>•</span>
              <span className="font-semibold">{formatBytes(fileSize)}</span>
            </>
          )}
        </div>

        {showZoomControls && (
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handleZoomOut}
              disabled={zoomLevel <= 0.5}
              title="Zoom out"
              className="p-1 rounded-md text-neutral-500 hover:text-neutral-900 dark:hover:text-white disabled:opacity-30 disabled:pointer-events-none hover:bg-neutral-200/50 dark:hover:bg-neutral-800 transition-colors"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-[11px] font-mono text-neutral-500 w-9 text-center">
              {Math.round(zoomLevel * 100)}%
            </span>
            <button
              type="button"
              onClick={handleZoomIn}
              disabled={zoomLevel >= 3}
              title="Zoom in"
              className="p-1 rounded-md text-neutral-500 hover:text-neutral-900 dark:hover:text-white disabled:opacity-30 disabled:pointer-events-none hover:bg-neutral-200/50 dark:hover:bg-neutral-800 transition-colors"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            {zoomLevel !== 1 && (
              <button
                type="button"
                onClick={handleResetZoom}
                title="Reset zoom to 100%"
                className="p-1 ml-0.5 rounded-md text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Image Stage with Checkerboard for transparency */}
      <div
        className={`relative flex items-center justify-center p-4 overflow-auto min-h-[220px] ${maxContainerHeight} bg-checkerboard`}
      >
        <div
          className="transition-transform duration-150 ease-out flex items-center justify-center shadow-md rounded-lg overflow-hidden bg-white/10"
          style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'center center' }}
        >
          <img
            src={src}
            alt={alt}
            className="max-h-[380px] max-w-full object-contain select-none"
            loading="lazy"
            decoding="async"
          />
        </div>
      </div>
    </div>
  );
};
