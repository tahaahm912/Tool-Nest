import React from 'react';
import { Lock, Unlock, RotateCcw } from 'lucide-react';

interface DimensionInputsProps {
  originalWidth: number;
  originalHeight: number;
  width: number;
  height: number;
  onWidthChange: (newWidth: number) => void;
  onHeightChange: (newHeight: number) => void;
  lockAspectRatio: boolean;
  onToggleLock: () => void;
  onResetToOriginal: () => void;
  onScalePercentage?: (pct: number) => void;
  className?: string;
}

export const DimensionInputs: React.FC<DimensionInputsProps> = ({
  originalWidth,
  originalHeight,
  width,
  height,
  onWidthChange,
  onHeightChange,
  lockAspectRatio,
  onToggleLock,
  onResetToOriginal,
  onScalePercentage,
  className = '',
}) => {
  const aspectRatio = originalWidth / originalHeight;

  const handleWidthInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    if (isNaN(val) || val <= 0) {
      onWidthChange(1);
      if (lockAspectRatio) {
        onHeightChange(Math.max(1, Math.round(1 / aspectRatio)));
      }
      return;
    }
    const safeW = Math.min(16384, val);
    onWidthChange(safeW);
    if (lockAspectRatio) {
      onHeightChange(Math.max(1, Math.round(safeW / aspectRatio)));
    }
  };

  const handleHeightInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    if (isNaN(val) || val <= 0) {
      onHeightChange(1);
      if (lockAspectRatio) {
        onWidthChange(Math.max(1, Math.round(1 * aspectRatio)));
      }
      return;
    }
    const safeH = Math.min(16384, val);
    onHeightChange(safeH);
    if (lockAspectRatio) {
      onWidthChange(Math.max(1, Math.round(safeH * aspectRatio)));
    }
  };

  const handlePercentClick = (percent: number) => {
    if (onScalePercentage) {
      onScalePercentage(percent);
    } else {
      const scale = percent / 100;
      const targetW = Math.max(1, Math.round(originalWidth * scale));
      const targetH = Math.max(1, Math.round(originalHeight * scale));
      onWidthChange(targetW);
      onHeightChange(targetH);
    }
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Quick Percentage Presets */}
      <div className="flex flex-wrap items-center justify-between gap-1.5">
        <span className="text-xs font-semibold text-neutral-600 dark:text-neutral-400">
          Scale By Percentage:
        </span>
        <div className="flex flex-wrap gap-1">
          {[25, 50, 75, 100, 150, 200].map((pct) => (
            <button
              key={pct}
              type="button"
              onClick={() => handlePercentClick(pct)}
              className="px-2 py-1 text-xs font-mono rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-emerald-500/10 hover:text-emerald-600 dark:hover:text-emerald-400 border border-neutral-200/80 dark:border-neutral-700/80 transition-colors"
            >
              {pct}%
            </button>
          ))}
          <button
            type="button"
            onClick={onResetToOriginal}
            title="Reset to original dimensions"
            className="p-1 rounded-lg text-neutral-500 hover:text-neutral-900 dark:hover:text-white border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors ml-1"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Inputs + Lock Aspect Ratio Toggle */}
      <div className="flex items-center gap-2">
        {/* Width */}
        <div className="flex-1 space-y-1">
          <label htmlFor="dim-width" className="block text-xs font-medium text-neutral-500 dark:text-neutral-400">
            Width (px)
          </label>
          <input
            id="dim-width"
            type="number"
            min={1}
            max={16384}
            value={width || ''}
            onChange={handleWidthInput}
            className="w-full px-3 py-2 text-sm font-mono rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
          />
        </div>

        {/* Lock Ratio Button */}
        <div className="pt-5 flex flex-col items-center">
          <button
            type="button"
            onClick={onToggleLock}
            className={`p-2.5 rounded-xl border transition-colors ${
              lockAspectRatio
                ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 shadow-xs'
                : 'bg-neutral-100 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200'
            }`}
            title={lockAspectRatio ? 'Aspect ratio locked (proportions preserved)' : 'Aspect ratio unlocked'}
          >
            {lockAspectRatio ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
          </button>
        </div>

        {/* Height */}
        <div className="flex-1 space-y-1">
          <label htmlFor="dim-height" className="block text-xs font-medium text-neutral-500 dark:text-neutral-400">
            Height (px)
          </label>
          <input
            id="dim-height"
            type="number"
            min={1}
            max={16384}
            value={height || ''}
            onChange={handleHeightInput}
            className="w-full px-3 py-2 text-sm font-mono rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
          />
        </div>
      </div>

      <div className="text-[11px] text-neutral-400 flex items-center justify-between">
        <span>Original: {originalWidth} × {originalHeight} px</span>
        <span>{lockAspectRatio ? 'Proportions locked' : 'Freeform scaling'}</span>
      </div>
    </div>
  );
};
