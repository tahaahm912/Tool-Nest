import React, { useState, useMemo } from 'react';
import { Minimize2, Copy, Check, Trash2, Sparkles, RotateCcw } from 'lucide-react';
import { TextInputArea } from '../components/text/TextInputArea';
import { TextOutputArea } from '../components/text/TextOutputArea';
import { OptionToggle } from '../components/text/OptionToggle';
import { cleanText, CleanupOptions, DEFAULT_CLEANUP_OPTIONS } from '../lib/text/cleanup';
import { copyToClipboard } from '../lib/text/clipboard';

const SAMPLE_TEXT = `   This is an    example text      with unnecessary spaces.   
It has multiple     consecutive spaces between      words.


There are also   several redundant     blank lines.



   And trailing/leading spaces     on each line.   `;

export const RemoveExtraSpaces: React.FC = () => {
  const [text, setText] = useState<string>(SAMPLE_TEXT);
  const [options, setOptions] = useState<CleanupOptions>(DEFAULT_CLEANUP_OPTIONS);
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => {
    return cleanText(text, options);
  }, [text, options]);

  const handleCopy = async () => {
    if (!result.cleanedText) return;
    const success = await copyToClipboard(result.cleanedText);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleResetOptions = () => {
    setOptions(DEFAULT_CLEANUP_OPTIONS);
  };

  return (
    <div className="space-y-6">
      {/* Metric summary banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-center shadow-sm">
          <div className="text-2xl font-extrabold text-neutral-900 dark:text-white">
            {result.originalCharCount.toLocaleString()}
          </div>
          <div className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 mt-0.5">
            Original Characters
          </div>
        </div>

        <div className="p-3.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-center shadow-sm">
          <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
            {result.cleanedCharCount.toLocaleString()}
          </div>
          <div className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 mt-0.5">
            Cleaned Characters
          </div>
        </div>

        <div className="p-3.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-center shadow-sm">
          <div className="text-2xl font-extrabold text-rose-600 dark:text-rose-400">
            {result.charsRemoved.toLocaleString()}
          </div>
          <div className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 mt-0.5">
            Characters Removed
          </div>
        </div>

        <div className="p-3.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-center shadow-sm">
          <div className="text-2xl font-extrabold text-blue-600 dark:text-blue-400">
            {result.reductionPercentage}%
          </div>
          <div className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 mt-0.5">
            Size Reduction
          </div>
        </div>
      </div>

      {/* Cleanup Options */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300">
            Whitespace Cleanup Rules:
          </label>
          <button
            type="button"
            onClick={handleResetOptions}
            className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline inline-flex items-center gap-1"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Default Rules</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          <OptionToggle
            id="opt-collapse-spaces"
            label="Collapse Multiple Spaces"
            description="Turns 2 or more consecutive spaces into a single space."
            checked={options.collapseSpaces}
            onChange={(checked) => setOptions((prev) => ({ ...prev, collapseSpaces: checked }))}
          />

          <OptionToggle
            id="opt-trim-lines"
            label="Trim Lines"
            description="Strips leading and trailing spaces from each individual line."
            checked={options.trimLines}
            onChange={(checked) => setOptions((prev) => ({ ...prev, trimLines: checked }))}
          />

          <OptionToggle
            id="opt-collapse-blank-lines"
            label="Collapse Blank Lines"
            description="Reduces 2+ empty blank lines to a single blank line."
            checked={options.collapseBlankLines}
            onChange={(checked) =>
              setOptions((prev) => ({
                ...prev,
                collapseBlankLines: checked,
                removeEmptyLines: checked ? false : prev.removeEmptyLines,
              }))
            }
          />

          <OptionToggle
            id="opt-remove-empty-lines"
            label="Remove All Empty Lines"
            description="Strips every blank line completely from the text."
            checked={options.removeEmptyLines}
            onChange={(checked) =>
              setOptions((prev) => ({
                ...prev,
                removeEmptyLines: checked,
                collapseBlankLines: checked ? false : prev.collapseBlankLines,
              }))
            }
          />

          <OptionToggle
            id="opt-trim-outer"
            label="Trim Outer Text"
            description="Removes whitespace at the very start and end of the document."
            checked={options.trimOuter}
            onChange={(checked) => setOptions((prev) => ({ ...prev, trimOuter: checked }))}
          />
        </div>
      </div>

      {/* Editor & Cleaned Output */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <TextInputArea
          id="remove-spaces-input"
          label="Original Text"
          value={text}
          onChange={setText}
          placeholder="Paste text with excessive spaces or blank lines..."
          rows={10}
        />

        <TextOutputArea
          id="remove-spaces-output"
          label="Cleaned Output"
          badge={`${result.charsRemoved} chars saved`}
          value={result.cleanedText}
          placeholder="Cleaned text will appear here automatically..."
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
            <span>Clear Input</span>
          </button>

          <button
            type="button"
            onClick={() => setText(SAMPLE_TEXT)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Load Sample</span>
          </button>
        </div>

        {result.cleanedText && (
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Cleaned Text Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Cleaned Text</span>
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
};
