import React, { useState } from 'react';
import { Download, Check, FileDown } from 'lucide-react';

interface DownloadButtonProps {
  onDownloadPng?: () => void;
  onDownloadSvg?: () => void;
  pngLabel?: string;
  svgLabel?: string;
  className?: string;
  disabled?: boolean;
}

export const DownloadButton: React.FC<DownloadButtonProps> = ({
  onDownloadPng,
  onDownloadSvg,
  pngLabel = 'Download PNG',
  svgLabel = 'Download SVG',
  className = '',
  disabled = false,
}) => {
  const [pngSuccess, setPngSuccess] = useState(false);
  const [svgSuccess, setSvgSuccess] = useState(false);

  const handlePng = () => {
    if (disabled || !onDownloadPng) return;
    onDownloadPng();
    setPngSuccess(true);
    setTimeout(() => setPngSuccess(false), 2000);
  };

  const handleSvg = () => {
    if (disabled || !onDownloadSvg) return;
    onDownloadSvg();
    setSvgSuccess(true);
    setTimeout(() => setSvgSuccess(false), 2000);
  };

  return (
    <div className={`inline-flex flex-wrap items-center gap-2 ${className}`}>
      {onDownloadPng && (
        <button
          type="button"
          onClick={handlePng}
          disabled={disabled}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white shadow-sm transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {pngSuccess ? <Check className="w-4 h-4 text-white" /> : <Download className="w-4 h-4" />}
          <span>{pngSuccess ? 'Saved PNG!' : pngLabel}</span>
        </button>
      )}

      {onDownloadSvg && (
        <button
          type="button"
          onClick={handleSvg}
          disabled={disabled}
          className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-sm font-semibold bg-white dark:bg-neutral-900 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-neutral-800 dark:text-neutral-200 border border-neutral-200 dark:border-neutral-700 shadow-sm transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {svgSuccess ? <Check className="w-4 h-4 text-emerald-500" /> : <FileDown className="w-4 h-4 opacity-75" />}
          <span>{svgSuccess ? 'Saved SVG!' : svgLabel}</span>
        </button>
      )}
    </div>
  );
};
