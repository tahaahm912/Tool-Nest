import React, { useState } from 'react';
import { Copy, Check, CheckCircle2 } from 'lucide-react';
import { copyToClipboard } from '../../lib/text/clipboard';

interface TextOutputAreaProps {
  id?: string;
  label?: string;
  value: string;
  placeholder?: string;
  rows?: number;
  badge?: string;
  className?: string;
}

export const TextOutputArea: React.FC<TextOutputAreaProps> = ({
  id = 'text-output-area',
  label = 'Result / Output',
  value,
  placeholder = 'Transformed result will appear here...',
  rows = 8,
  badge,
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

  return (
    <div className={`space-y-1.5 ${className}`}>
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <label
            htmlFor={id}
            className="text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300"
          >
            {label}
          </label>
          {badge && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/60">
              {badge}
            </span>
          )}
        </div>

        {value && (
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-colors"
            title="Copy result to clipboard"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Output</span>
              </>
            )}
          </button>
        )}
      </div>

      <div className="relative rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/70 dark:bg-neutral-900/40 shadow-sm overflow-hidden">
        <textarea
          id={id}
          readOnly
          rows={rows}
          value={value}
          placeholder={placeholder}
          className="w-full p-3.5 sm:p-4 text-sm sm:text-base text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 bg-transparent focus:outline-none leading-relaxed font-sans resize-y min-h-[140px] select-all cursor-text"
        />
      </div>
    </div>
  );
};
