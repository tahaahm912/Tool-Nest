import React from 'react';
import { Download } from 'lucide-react';
import { downloadImage } from '../../lib/image/imageLoader';

interface DownloadButtonProps {
  source: Blob | string | null;
  fileName: string;
  label?: string;
  disabled?: boolean;
  className?: string;
  variant?: 'primary' | 'secondary';
}

export const DownloadButton: React.FC<DownloadButtonProps> = ({
  source,
  fileName,
  label = 'Download Image',
  disabled = false,
  className = '',
  variant = 'primary',
}) => {
  const handleDownload = () => {
    if (!source) return;
    downloadImage(source, fileName);
  };

  const baseStyles =
    'inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500/40 shadow-xs cursor-pointer disabled:opacity-40 disabled:pointer-events-none disabled:cursor-not-allowed';

  const variantStyles =
    variant === 'primary'
      ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20'
      : 'bg-white dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-700/60';

  return (
    <button
      type="button"
      onClick={handleDownload}
      disabled={disabled || !source}
      className={`${baseStyles} ${variantStyles} ${className}`}
    >
      <Download className="w-4 h-4" />
      <span>{label}</span>
    </button>
  );
};
