import React, { useState, useMemo } from 'react';
import { CopyX, Copy, Check, Trash2, Sparkles, RotateCcw, ListFilter } from 'lucide-react';
import { TextInputArea } from '../components/text/TextInputArea';
import { TextOutputArea } from '../components/text/TextOutputArea';
import { OptionToggle } from '../components/text/OptionToggle';
import { removeDuplicateLines, DedupeOptions, DEFAULT_DEDUPE_OPTIONS } from '../lib/text/dedupe';
import { copyToClipboard } from '../lib/text/clipboard';

const SAMPLE_LINES = `apple@example.com
banana@example.com
apple@example.com
cherry@example.com
  banana@example.com  
orange@example.com
CHERRY@EXAMPLE.COM
apple@example.com
grape@example.com`;

export const DuplicateLineRemover: React.FC = () => {
  const [text, setText] = useState<string>(SAMPLE_LINES);
  const [options, setOptions] = useState<DedupeOptions>(DEFAULT_DEDUPE_OPTIONS);
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => {
    return removeDuplicateLines(text, options);
  }, [text, options]);

  const handleCopy = async () => {
    if (!result.uniqueText) return;
    const success = await copyToClipboard(result.uniqueText);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Metric Cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-center shadow-sm">
          <div className="text-2xl sm:text-3xl font-extrabold text-neutral-900 dark:text-white">
            {result.originalLinesCount.toLocaleString()}
          </div>
          <div className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 mt-0.5">
            Original Lines
          </div>
        </div>

        <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-center shadow-sm">
          <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
            {result.uniqueLinesCount.toLocaleString()}
          </div>
          <div className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 mt-0.5">
            Unique Lines
          </div>
        </div>

        <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-center shadow-sm">
          <div className="text-2xl sm:text-3xl font-extrabold text-rose-600 dark:text-rose-400">
            {result.duplicatesRemoved.toLocaleString()}
          </div>
          <div className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 mt-0.5">
            Duplicates Removed
          </div>
        </div>
      </div>

      {/* Options */}
      <div className="space-y-2">
        <label className="text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300">
          Deduplication Options:
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <OptionToggle
            id="dedupe-ignore-whitespace"
            label="Ignore Whitespace"
            description="Treats lines with different leading/trailing spaces as duplicates."
            checked={options.ignoreWhitespace}
            onChange={(checked) => setOptions((prev) => ({ ...prev, ignoreWhitespace: checked }))}
          />

          <OptionToggle
            id="dedupe-case-sensitive"
            label="Case Sensitive"
            description="Distinguishes 'Item' from 'item' as unique entries."
            checked={options.caseSensitive}
            onChange={(checked) => setOptions((prev) => ({ ...prev, caseSensitive: checked }))}
          />

          <OptionToggle
            id="dedupe-remove-empty"
            label="Remove Empty Lines"
            description="Excludes blank lines from unique output."
            checked={options.removeEmptyLines}
            onChange={(checked) => setOptions((prev) => ({ ...prev, removeEmptyLines: checked }))}
          />
        </div>
      </div>

      {/* Editor & Deduplicated Output */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <TextInputArea
          id="duplicate-lines-input"
          label={`Original List (${result.originalLinesCount} lines)`}
          value={text}
          onChange={setText}
          placeholder="Paste multiline list here..."
          rows={10}
        />

        <TextOutputArea
          id="duplicate-lines-output"
          label={`Unique List (${result.uniqueLinesCount} lines)`}
          badge={`${result.duplicatesRemoved} duplicates removed`}
          value={result.uniqueText}
          placeholder="Unique lines will appear here in original order..."
          rows={10}
        />
      </div>

      {/* Action Footer */}
      <div className="flex items-center justify-between gap-3 pt-4 border-t border-neutral-200/80 dark:border-neutral-800/80 flex-wrap">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setText('')}
            disabled={!text}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border border-neutral-200 dark:border-neutral-800 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors disabled:opacity-40 disabled:pointer-events-none"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear Text</span>
          </button>

          <button
            type="button"
            onClick={() => setText(SAMPLE_LINES)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Load Sample</span>
          </button>
        </div>

        {result.uniqueText && (
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Unique Lines Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Unique Lines</span>
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
};
