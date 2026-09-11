import React, { useRef, useState, useCallback, useEffect } from 'react';
import { Upload, AlertCircle, X, RefreshCw, FileImage } from 'lucide-react';
import { LoadedImageInfo } from '../../lib/image/types';
import { loadImageFromFile, revokeObjectUrlSafe } from '../../lib/image/imageLoader';

interface ImageUploadProps {
  onImageLoaded: (info: LoadedImageInfo) => void;
  onClear?: () => void;
  currentImage?: LoadedImageInfo | null;
  accept?: string;
  className?: string;
  title?: string;
  subtitle?: string;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  onImageLoaded,
  onClear,
  currentImage,
  accept = 'image/jpeg,image/png,image/webp,image/gif,image/bmp,image/svg+xml',
  className = '',
  title = 'Drag and drop your image here',
  subtitle = 'Supports JPG, PNG, WebP, GIF, and BMP (up to 50 MB)',
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback(
    async (file: File) => {
      setErrorMessage(null);
      setIsLoading(true);

      try {
        const info = await loadImageFromFile(file);
        onImageLoaded(info);
      } catch (err: any) {
        setErrorMessage(err.message || 'Failed to process selected image.');
      } finally {
        setIsLoading(false);
      }
    },
    [onImageLoaded]
  );

  // Handle drag events
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      processFile(file);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      processFile(file);
      // Reset input value so re-selecting same file triggers onChange
      e.target.value = '';
    }
  };

  // Support paste from clipboard
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      if (e.clipboardData && e.clipboardData.files.length > 0) {
        const file = e.clipboardData.files[0];
        if (file.type.startsWith('image/')) {
          e.preventDefault();
          processFile(file);
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [processFile]);

  const handleClear = () => {
    if (currentImage) {
      revokeObjectUrlSafe(currentImage.objectUrl);
    }
    setErrorMessage(null);
    onClear?.();
  };

  const openFilePicker = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Hidden native input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleInputChange}
        className="sr-only"
        id="image-file-input"
        aria-label="Upload an image file"
      />

      {/* Upload Zone */}
      {!currentImage ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={openFilePicker}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              openFilePicker();
            }
          }}
          className={`relative group cursor-pointer border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
            isDragging
              ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20 scale-[1.005]'
              : 'border-neutral-300 dark:border-neutral-700 bg-neutral-50/60 dark:bg-neutral-900/30 hover:border-emerald-500/60 hover:bg-neutral-100/50 dark:hover:bg-neutral-900/60'
          }`}
        >
          <div className="flex flex-col items-center justify-center space-y-3">
            <div
              className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 ${
                isDragging
                  ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                  : 'bg-white dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700 shadow-sm'
              }`}
            >
              {isLoading ? (
                <RefreshCw className="w-6 h-6 animate-spin text-emerald-500" />
              ) : (
                <Upload className="w-6 h-6" />
              )}
            </div>

            <div className="space-y-1">
              <p className="text-base font-semibold text-neutral-900 dark:text-white">
                {title}
              </p>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                or <span className="text-emerald-600 dark:text-emerald-400 font-medium underline underline-offset-2">browse files</span> from your computer
              </p>
            </div>

            <div className="text-xs text-neutral-400 dark:text-neutral-500 max-w-sm pt-1">
              {subtitle}
            </div>
          </div>
        </div>
      ) : (
        /* Image active header with Replace and Clear actions */
        <div className="flex items-center justify-between p-3.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/80 dark:bg-neutral-900/50">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center flex-shrink-0 text-emerald-600 dark:text-emerald-400">
              <FileImage className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-neutral-900 dark:text-white truncate" title={currentImage.name}>
                {currentImage.name}
              </p>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                {currentImage.width} × {currentImage.height} px
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              type="button"
              onClick={openFilePicker}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg text-neutral-700 dark:text-neutral-200 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-700/60 transition-colors shadow-xs"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Replace</span>
            </button>
            <button
              type="button"
              onClick={handleClear}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 hover:bg-rose-100 dark:hover:bg-rose-900/60 transition-colors"
              title="Remove image"
            >
              <X className="w-3.5 h-3.5" />
              <span>Clear</span>
            </button>
          </div>
        </div>
      )}

      {/* Error Message */}
      {errorMessage && (
        <div className="flex items-start gap-2.5 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs animate-in fade-in">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold">Error Loading Image</p>
            <p className="mt-0.5">{errorMessage}</p>
          </div>
          <button
            type="button"
            onClick={() => setErrorMessage(null)}
            className="text-rose-400 hover:text-rose-600 dark:hover:text-rose-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
