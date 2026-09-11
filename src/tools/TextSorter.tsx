import React, { useState, useMemo } from 'react';
import {
  ArrowUpDown,
  Copy,
  Check,
  Trash2,
  Sparkles,
  Shuffle,
  RotateCcw,
  ArrowDownAZ,
  ArrowUpAZ,
  ListOrdered,
} from 'lucide-react';
import { TextInputArea } from '../components/text/TextInputArea';
import { TextOutputArea } from '../components/text/TextOutputArea';
import { OptionToggle } from '../components/text/OptionToggle';
import { sortLines, SortMode, SortOptions, DEFAULT_SORT_OPTIONS } from '../lib/text/sort';
import { copyToClipboard } from '../lib/text/clipboard';

const SAMPLE_LIST = `Banana
Apple
10. Watermelon
2. Orange
Pineapple
1. Strawberry
Mango
Kiwi
Blueberry`;

interface SortModeButton {
  mode: SortMode;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const SORT_MODES: SortModeButton[] = [
  { mode: 'alphabetical-asc', label: 'Alphabetical (A → Z)', icon: ArrowDownAZ },
  { mode: 'alphabetical-desc', label: 'Alphabetical (Z → A)', icon: ArrowUpAZ },
  { mode: 'numeric-asc', label: 'Numeric (1 → 9)', icon: ListOrdered },
  { mode: 'numeric-desc', label: 'Numeric (9 → 1)', icon: ListOrdered },
  { mode: 'length-asc', label: 'Shortest → Longest', icon: ArrowUpDown },
  { mode: 'length-desc', label: 'Longest → Shortest', icon: ArrowUpDown },
  { mode: 'random', label: 'Random Shuffle', icon: Shuffle },
];

export const TextSorter: React.FC = () => {
  const [text, setText] = useState<string>(SAMPLE_LIST);
  const [options, setOptions] = useState<SortOptions>(DEFAULT_SORT_OPTIONS);
  const [shuffleKey, setShuffleKey] = useState<number>(0);
  const [copied, setCopied] = useState(false);

  const sortedText = useMemo(() => {
    return sortLines(text, options);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, options, shuffleKey]);

  const originalLineCount = text ? text.split('\n').length : 0;
  const sortedLineCount = sortedText ? sortedText.split('\n').length : 0;

  const handleCopy = async () => {
    if (!sortedText) return;
    const success = await copyToClipboard(sortedText);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleModeClick = (mode: SortMode) => {
    if (mode === 'random') {
      setShuffleKey((k) => k + 1);
    }
    setOptions((prev) => ({ ...prev, mode }));
  };

  return (
    <div className="space-y-6">
      {/* Sorting Mode Selector */}
      <div className="space-y-2">
        <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300">
          Select Sorting Method:
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
          {SORT_MODES.map((item) => {
            const Icon = item.icon;
            const isSelected = options.mode === item.mode;
            return (
              <button
                key={item.mode}
                type="button"
                onClick={() => handleModeClick(item.mode)}
                className={`p-2.5 rounded-xl text-center border transition-all flex flex-col items-center justify-center gap-1.5 ${
                  isSelected
                    ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 border-neutral-900 dark:border-white shadow-sm ring-2 ring-emerald-500/40'
                    : 'bg-white dark:bg-neutral-900 text-neutral-800 dark:text-neutral-200 border border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-[11px] font-bold leading-tight">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Sorting Options Toggles */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <OptionToggle
          id="sort-case-sensitive"
          label="Case Sensitive"
          description="Capital letters sorted distinctly from lowercase."
          checked={options.caseSensitive}
          onChange={(checked) => setOptions((prev) => ({ ...prev, caseSensitive: checked }))}
        />

        <OptionToggle
          id="sort-remove-empty"
          label="Remove Empty Lines"
          description="Filters out blank lines from the sorted output."
          checked={options.removeEmptyLines}
          onChange={(checked) => setOptions((prev) => ({ ...prev, removeEmptyLines: checked }))}
        />

        <OptionToggle
          id="sort-trim-lines"
          label="Trim Line Margins"
          description="Trims outer spaces from every line before sorting."
          checked={options.trimLines}
          onChange={(checked) => setOptions((prev) => ({ ...prev, trimLines: checked }))}
        />
      </div>

      {/* Input / Output Editors */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <TextInputArea
          id="text-sorter-input"
          label={`Original List (${originalLineCount} lines)`}
          value={text}
          onChange={setText}
          placeholder="Enter lines to sort (one per line)..."
          rows={10}
        />

        <TextOutputArea
          id="text-sorter-output"
          label={`Sorted Output (${sortedLineCount} lines)`}
          badge={SORT_MODES.find((m) => m.mode === options.mode)?.label}
          value={sortedText}
          placeholder="Sorted result will appear here..."
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
            <span>Clear List</span>
          </button>

          <button
            type="button"
            onClick={() => setText(SAMPLE_LIST)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Load Sample List</span>
          </button>
        </div>

        {sortedText && (
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Sorted List Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Sorted List</span>
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
};
