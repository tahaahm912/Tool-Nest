import React from 'react';
import { formatBytes } from '../../lib/image/imageLoader';
import { FileText, Image as ImageIcon, Maximize2, Tag } from 'lucide-react';

interface ImageInfoProps {
  fileName: string;
  fileType: string;
  fileSize: number;
  width?: number;
  height?: number;
  aspectRatio?: number;
  className?: string;
  compact?: boolean;
}

export const ImageInfo: React.FC<ImageInfoProps> = ({
  fileName,
  fileType,
  fileSize,
  width,
  height,
  aspectRatio,
  className = '',
  compact = false,
}) => {
  const formatAspect = (ar?: number) => {
    if (!ar) return '';
    if (Math.abs(ar - 1) < 0.02) return '1:1 (Square)';
    if (Math.abs(ar - 16 / 9) < 0.05) return '16:9 (Widescreen)';
    if (Math.abs(ar - 4 / 3) < 0.05) return '4:3 (Standard)';
    if (Math.abs(ar - 3 / 2) < 0.05) return '3:2 (Classic 35mm)';
    return `${ar.toFixed(2)}:1`;
  };

  if (compact) {
    return (
      <div className={`flex flex-wrap items-center gap-2 text-xs text-neutral-600 dark:text-neutral-400 ${className}`}>
        <span className="font-medium text-neutral-900 dark:text-neutral-200 truncate max-w-[200px]" title={fileName}>
          {fileName}
        </span>
        <span>•</span>
        <span className="uppercase font-mono">{fileType.replace('image/', '')}</span>
        <span>•</span>
        <span className="font-mono">{formatBytes(fileSize)}</span>
        {width && height && (
          <>
            <span>•</span>
            <span className="font-mono">{width} × {height} px</span>
          </>
        )}
      </div>
    );
  }

  return (
    <div className={`grid grid-cols-2 sm:grid-cols-4 gap-3 ${className}`}>
      <div className="p-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950">
        <div className="flex items-center gap-1.5 text-xs text-neutral-400 font-medium mb-1">
          <FileText className="w-3.5 h-3.5" />
          <span>File Name</span>
        </div>
        <div className="text-sm font-semibold text-neutral-900 dark:text-white truncate" title={fileName}>
          {fileName}
        </div>
      </div>

      <div className="p-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950">
        <div className="flex items-center gap-1.5 text-xs text-neutral-400 font-medium mb-1">
          <Tag className="w-3.5 h-3.5" />
          <span>Format & Size</span>
        </div>
        <div className="text-sm font-semibold text-neutral-900 dark:text-white font-mono">
          <span className="uppercase">{fileType.replace('image/', '')}</span> · {formatBytes(fileSize)}
        </div>
      </div>

      <div className="p-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950">
        <div className="flex items-center gap-1.5 text-xs text-neutral-400 font-medium mb-1">
          <Maximize2 className="w-3.5 h-3.5" />
          <span>Dimensions</span>
        </div>
        <div className="text-sm font-semibold text-neutral-900 dark:text-white font-mono">
          {width && height ? `${width} × ${height} px` : '—'}
        </div>
      </div>

      <div className="p-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950">
        <div className="flex items-center gap-1.5 text-xs text-neutral-400 font-medium mb-1">
          <ImageIcon className="w-3.5 h-3.5" />
          <span>Aspect Ratio</span>
        </div>
        <div className="text-sm font-semibold text-neutral-900 dark:text-white">
          {formatAspect(aspectRatio) || '—'}
        </div>
      </div>
    </div>
  );
};
