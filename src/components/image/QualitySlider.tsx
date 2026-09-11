import React from 'react';
import { Sliders } from 'lucide-react';

interface QualitySliderProps {
  value: number; // 0.1 to 1.0
  onChange: (val: number) => void;
  disabled?: boolean;
  className?: string;
}

export const QualitySlider: React.FC<QualitySliderProps> = ({
  value,
  onChange,
  disabled = false,
  className = '',
}) => {
  const percent = Math.round(value * 100);

  const getDescriptor = (p: number) => {
    if (p >= 92) return { label: 'Maximum Quality', note: 'Negligible compression artifacts, larger file' };
    if (p >= 80) return { label: 'High (Recommended)', note: 'Excellent balance of sharpness and size savings' };
    if (p >= 60) return { label: 'Medium', note: 'Noticeable compression, very small file size' };
    return { label: 'Low', note: 'Aggressive compression, best for low-bandwidth avatars' };
  };

  const descriptor = getDescriptor(percent);

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center justify-between">
        <label htmlFor="quality-slider" className="flex items-center gap-1.5 text-xs font-semibold text-neutral-700 dark:text-neutral-300">
          <Sliders className="w-3.5 h-3.5 text-neutral-400" />
          <span>Compression Quality</span>
        </label>
        <div className="flex items-center gap-2">
          <span className="text-xs text-neutral-500 dark:text-neutral-400 font-medium">
            {descriptor.label}
          </span>
          <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-mono font-bold text-xs">
            {percent}%
          </span>
        </div>
      </div>

      <input
        id="quality-slider"
        type="range"
        min={10}
        max={100}
        step={1}
        value={percent}
        disabled={disabled}
        onChange={(e) => onChange(Number(e.target.value) / 100)}
        className="w-full h-2 bg-neutral-200 dark:bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-emerald-500 disabled:opacity-40"
      />

      <div className="flex items-center justify-between text-[11px] text-neutral-400">
        <span>Smaller Size (10%)</span>
        <span className="hidden sm:inline italic text-neutral-400">{descriptor.note}</span>
        <span>Best Quality (100%)</span>
      </div>
    </div>
  );
};
