import React, { useState, useEffect } from 'react';
import { LoadedImageInfo } from '../lib/image/types';
import { fileToBase64, Base64Result } from '../lib/image/base64Helper';
import { formatBytes, revokeObjectUrlSafe } from '../lib/image/imageLoader';
import { ImageUpload } from '../components/image/ImageUpload';
import { ImagePreview } from '../components/image/ImagePreview';
import { ImageInfo } from '../components/image/ImageInfo';
import { PrivacyBadge } from '../components/image/PrivacyBadge';
import {
  Binary,
  Copy,
  Check,
  Download,
  RotateCcw,
  AlertTriangle,
  Code2,
  FileCode,
} from 'lucide-react';

export const ImageToBase64: React.FC = () => {
  const [imageInfo, setImageInfo] = useState<LoadedImageInfo | null>(null);
  const [base64Result, setBase64Result] = useState<Base64Result | null>(null);
  const [outputMode, setOutputMode] = useState<'dataUrl' | 'raw'>('dataUrl');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleImageLoaded = async (loaded: LoadedImageInfo) => {
    setImageInfo(loaded);
    setError(null);

    try {
      const res = await fileToBase64(loaded.file);
      setBase64Result(res);
    } catch (err: any) {
      setError(err.message || 'Failed to encode image to Base64.');
    }
  };

  const handleReset = () => {
    if (imageInfo) {
      revokeObjectUrlSafe(imageInfo.objectUrl);
    }
    setImageInfo(null);
    setBase64Result(null);
    setError(null);
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const downloadAsTextFile = () => {
    if (!base64Result || !imageInfo) return;
    const content = outputMode === 'dataUrl' ? base64Result.dataUrl : base64Result.base64Only;
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${imageInfo.name}-base64.txt`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const htmlSnippet = base64Result
    ? `<img src="${base64Result.dataUrl.slice(0, 50)}..." alt="${imageInfo?.name || 'Embedded image'}" />`
    : '';

  const cssSnippet = base64Result
    ? `background-image: url("${base64Result.dataUrl.slice(0, 50)}...");`
    : '';

  return (
    <div className="space-y-6">
      <PrivacyBadge />

      <ImageUpload
        currentImage={imageInfo}
        onImageLoaded={handleImageLoaded}
        onClear={handleReset}
        title="Drop an image to encode into Base64"
        subtitle="Accepts PNG, JPG, WebP, GIF, SVG, and BMP"
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

          {/* Large image size warning */}
          {base64Result?.isLarge && (
            <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 text-amber-800 dark:text-amber-300 text-xs">
              <AlertTriangle className="w-4 h-4 flex-shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
              <div>
                <span className="font-semibold">Notice regarding large Base64 strings:</span> Base64
                encoding increases raw data size by ~33% ({formatBytes(base64Result.charCount)} characters).
                Embedding huge Base64 strings in HTML/CSS can slow down DOM parsing. Consider standard file URLs for large banners or high-res photos.
              </div>
            </div>
          )}

          {base64Result && (
            <div className="p-5 sm:p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 shadow-xs space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-neutral-100 dark:border-neutral-800">
                <div className="flex items-center gap-2">
                  <Binary className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">
                    Base64 String Output
                  </h3>
                </div>

                {/* Output Mode Switcher */}
                <div className="flex items-center gap-1.5 p-1 rounded-xl bg-neutral-100 dark:bg-neutral-800 border border-neutral-200/80 dark:border-neutral-700/80">
                  <button
                    type="button"
                    onClick={() => setOutputMode('dataUrl')}
                    className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                      outputMode === 'dataUrl'
                        ? 'bg-white dark:bg-neutral-950 text-emerald-600 dark:text-emerald-400 shadow-xs'
                        : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                    }`}
                  >
                    Data URL URI
                  </button>
                  <button
                    type="button"
                    onClick={() => setOutputMode('raw')}
                    className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                      outputMode === 'raw'
                        ? 'bg-white dark:bg-neutral-950 text-emerald-600 dark:text-emerald-400 shadow-xs'
                        : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                    }`}
                  >
                    Raw Base64 Only
                  </button>
                </div>
              </div>

              {/* Textarea representation */}
              <div className="relative">
                <textarea
                  readOnly
                  rows={8}
                  value={outputMode === 'dataUrl' ? base64Result.dataUrl : base64Result.base64Only}
                  className="w-full p-3 font-mono text-xs rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 text-neutral-800 dark:text-neutral-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 select-all resize-y"
                  placeholder="Base64 encoded string..."
                />
                <div className="absolute top-2 right-2 text-[10px] font-mono px-2 py-0.5 rounded-md bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xs text-neutral-500 border border-neutral-200 dark:border-neutral-800">
                  {base64Result.charCount.toLocaleString()} chars
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      copyToClipboard(
                        outputMode === 'dataUrl' ? base64Result.dataUrl : base64Result.base64Only,
                        'main'
                      )
                    }
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors cursor-pointer"
                  >
                    {copiedKey === 'main' ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Copied to Clipboard!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy {outputMode === 'dataUrl' ? 'Data URL' : 'Base64'}</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={downloadAsTextFile}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors cursor-pointer shadow-xs"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download (.txt)</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleReset}
                  className="inline-flex items-center gap-1 text-xs text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset</span>
                </button>
              </div>

              {/* Concise Usage Examples */}
              <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800 space-y-3">
                <div className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 flex items-center gap-1.5">
                  <Code2 className="w-3.5 h-3.5 text-neutral-500" />
                  <span>How to Use Base64 in HTML & CSS</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950/60 space-y-1.5">
                    <div className="flex items-center justify-between text-[11px] font-semibold text-neutral-500">
                      <span>HTML Image Tag</span>
                      <button
                        type="button"
                        onClick={() =>
                          copyToClipboard(
                            `<img src="${base64Result.dataUrl}" alt="${imageInfo.name}" />`,
                            'html'
                          )
                        }
                        className="text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
                      >
                        {copiedKey === 'html' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                        <span>Copy HTML</span>
                      </button>
                    </div>
                    <pre className="text-[11px] font-mono text-neutral-800 dark:text-neutral-200 overflow-x-auto whitespace-pre-wrap break-all">
                      {`<img src="data:${base64Result.mimeType};base64,..."/>`}
                    </pre>
                  </div>

                  <div className="p-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950/60 space-y-1.5">
                    <div className="flex items-center justify-between text-[11px] font-semibold text-neutral-500">
                      <span>CSS Background Image</span>
                      <button
                        type="button"
                        onClick={() =>
                          copyToClipboard(
                            `background-image: url("${base64Result.dataUrl}");`,
                            'css'
                          )
                        }
                        className="text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
                      >
                        {copiedKey === 'css' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                        <span>Copy CSS</span>
                      </button>
                    </div>
                    <pre className="text-[11px] font-mono text-neutral-800 dark:text-neutral-200 overflow-x-auto whitespace-pre-wrap break-all">
                      {`background-image: url("data:${base64Result.mimeType};base64,...");`}
                    </pre>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Visual Preview */}
          <div className="space-y-2">
            <div className="text-xs font-semibold text-neutral-500 px-1">Image Preview</div>
            <ImagePreview
              src={imageInfo.objectUrl}
              alt={imageInfo.name}
              width={imageInfo.width}
              height={imageInfo.height}
              fileSize={imageInfo.size}
              format={imageInfo.type}
            />
          </div>
        </div>
      )}
    </div>
  );
};
