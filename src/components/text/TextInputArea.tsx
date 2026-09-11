import React, { useState } from 'react';
import { Trash2, Copy, Check, ClipboardPaste } from 'lucide-react';
import { copyToClipboard } from '../../lib/text/clipboard';

interface TextInputAreaProps {
  id?: string;
  label?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  showClear?: boolean;
  showCopy?: boolean;
  showPaste?: boolean;
  helperText?: string;
  className?: string;
}

export const TextInputArea: React.FC<TextInputAreaProps> = ({
  id = 'text-input-area',
  label = 'Input Text',
  value,
  onChange,
  placeholder = 'Type or paste your text here...',
  rows = 8,
  showClear = true,
  showCopy = true,
  showPaste = true,
  helperText,
  className = '',
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!value) return;
    const success = await copyToClipboard(value);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handlePaste = async () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.readText) {
      try {
        const clipText = await navigator.clipboard.readText();
        if (clipText) {
          onChange(clipText);
        }
      } catch {
        // Permission denied or not supported
      }
    }
  };

  return (
    <div className={`space-y-1.5 ${className}`}>
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <label
          htmlFor={id}
          className="text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300"
        >
          {label}
        </label>

        <div className="flex items-center gap-1.5 text-xs">
          {showPaste && (
            <button
              type="button"
              onClick={handlePaste}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors font-medium"
              title="Paste from clipboard"
            >
              <ClipboardPaste className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Paste</span>
            </button>
          )}

          {showCopy && value && (
            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors font-medium"
              title="Copy text"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-emerald-600 dark:text-emerald-400">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Copy</span>
                </>
              )}
            </button>
          )}

          {showClear && value && (
            <button
              type="button"
              onClick={() => onChange('')}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors font-medium"
              title="Clear text"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear</span>
            </button>
          )}
        </div>
      </div>

      <div className="relative rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 shadow-sm focus-within:ring-2 focus-within:ring-emerald-500/30 focus-within:border-emerald-500 overflow-hidden transition-all">
        <textarea
          id={id}
          rows={rows}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full p-3.5 sm:p-4 text-sm sm:text-base text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 bg-transparent focus:outline-none leading-relaxed font-sans resize-y min-h-[140px]"
        />
      </div>

      {helperText && (
        <p className="text-[11px] text-neutral-500 dark:text-neutral-400">{helperText}</p>
      )}
    </div>
  );
};
