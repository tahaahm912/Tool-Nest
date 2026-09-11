import React, { useState, useMemo } from 'react';
import { Repeat, Copy, Check, Trash2, Sparkles, ArrowLeftRight, AlignJustify } from 'lucide-react';
import { TextInputArea } from '../components/text/TextInputArea';
import { TextOutputArea } from '../components/text/TextOutputArea';
import { reverseText, ReversalMode } from '../lib/text/reverse';
import { copyToClipboard } from '../lib/text/clipboard';

interface ReversalModeOption {
  mode: ReversalMode;
  label: string;
  description: string;
  example: string;
}

const REVERSAL_MODES: ReversalModeOption[] = [
  {
    mode: 'characters',
    label: 'Reverse Entire Characters',
    description: 'Flips the sequence of all individual characters backwards.',
    example: 'Hello World 🌟 → 🌟 dlroW olleH',
  },
  {
    mode: 'words',
    label: 'Reverse Word Order',
    description: 'Inverts the position of words while keeping each word spelled forward.',
    example: 'One Two Three → Three Two One',
  },
  {
    mode: 'lines',
    label: 'Reverse Line Sequencing',
    description: 'Flips vertical line ordering from bottom to top.',
    example: 'Line 1 / Line 2 → Line 2 / Line 1',
  },
  {
    mode: 'words-in-place',
    label: 'Reverse Each Word In-Place',
    description: 'Spells every individual word backwards without altering word order.',
    example: 'Hello World → olleH dlroW',
  },
];

const SAMPLE_TEXT = `ToolNest Productivity Hub
Build fast, secure browser tools.
Happy coding 🚀`;

export const TextReverser: React.FC = () => {
  const [text, setText] = useState<string>(SAMPLE_TEXT);
  const [mode, setMode] = useState<ReversalMode>('characters');
  const [copied, setCopied] = useState(false);

  const reversedText = useMemo(() => {
    return reverseText(text, mode);
  }, [text, mode]);

  const handleCopy = async () => {
    if (!reversedText) return;
    const success = await copyToClipboard(reversedText);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const activeMode = REVERSAL_MODES.find((m) => m.mode === mode) || REVERSAL_MODES[0];

  return (
    <div className="space-y-6">
      {/* Reversal Mode Selector */}
      <div className="space-y-2">
        <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300">
          Select Reversal Transformation:
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {REVERSAL_MODES.map((item) => {
            const isSelected = mode === item.mode;
            return (
              <button
                key={item.mode}
                type="button"
                onClick={() => setMode(item.mode)}
                className={`p-3 rounded-xl text-left border transition-all ${
                  isSelected
                    ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 border-neutral-900 dark:border-white shadow-sm ring-2 ring-emerald-500/40'
                    : 'bg-white dark:bg-neutral-900 text-neutral-800 dark:text-neutral-200 border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700'
                }`}
              >
                <div className="text-xs font-bold">{item.label}</div>
                <div
                  className={`text-[11px] font-mono mt-1 ${
                    isSelected
                      ? 'text-neutral-300 dark:text-neutral-600'
                      : 'text-neutral-500 dark:text-neutral-400'
                  }`}
                >
                  {item.example}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Editor & Output Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <TextInputArea
          id="text-reverser-input"
          label="Original Text"
          value={text}
          onChange={setText}
          placeholder="Type or paste text to reverse..."
          rows={9}
        />

        <TextOutputArea
          id="text-reverser-output"
          label={`Reversed Output (${activeMode.label})`}
          badge={activeMode.label}
          value={reversedText}
          placeholder="Reversed text will appear here..."
          rows={9}
        />
      </div>

      {/* Mode explainer */}
      <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/40 text-xs text-neutral-600 dark:text-neutral-400 flex items-center justify-between gap-3">
        <div>
          <span className="font-bold text-neutral-900 dark:text-white mr-1.5">
            {activeMode.label}:
          </span>
          {activeMode.description}
        </div>
        <span className="font-mono text-[11px] text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-200/60 dark:border-emerald-800/60 flex-shrink-0">
          Unicode Safe
        </span>
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
            onClick={() => setText(SAMPLE_TEXT)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Load Sample</span>
          </button>
        </div>

        {reversedText && (
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Reversed Text Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Reversed Text</span>
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
};
