import React, { useState, useMemo } from 'react';
import { Hash, Copy, Check, Trash2, Sparkles, AlertCircle } from 'lucide-react';
import { TextInputArea } from '../components/text/TextInputArea';
import { calculateTextStats } from '../lib/text/stats';
import { copyToClipboard } from '../lib/text/clipboard';

interface PlatformLimit {
  name: string;
  max: number;
  label: string;
}

const PLATFORM_LIMITS: PlatformLimit[] = [
  { name: 'X / Twitter', max: 280, label: 'Tweet limit' },
  { name: 'SMS Message', max: 160, label: 'Single SMS segment' },
  { name: 'Google SEO Title', max: 60, label: 'SERP title cutoff' },
  { name: 'Google Meta Description', max: 160, label: 'SERP snippet bounds' },
  { name: 'Instagram Caption', max: 2200, label: 'Post caption limit' },
  { name: 'LinkedIn Post', max: 3000, label: 'Feed update threshold' },
];

const SAMPLE_TEXT = `Unlock the full potential of your text with instant character tracking. Whether you are composing concise social media tweets (280 chars), crafting search engine titles, or preparing SMS copy, precise character counts keep your content within strict platform bounds. 🚀`;

export const CharacterCounter: React.FC = () => {
  const [text, setText] = useState<string>(SAMPLE_TEXT);
  const [copied, setCopied] = useState(false);

  const stats = useMemo(() => calculateTextStats(text), [text]);

  const handleCopy = async () => {
    if (!text) return;
    const success = await copyToClipboard(text);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Primary Character Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4 text-center shadow-sm sm:col-span-1">
          <div className="text-3xl font-extrabold text-neutral-900 dark:text-white tracking-tight">
            {stats.characters.toLocaleString()}
          </div>
          <div className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 mt-0.5">
            Total Characters
          </div>
        </div>

        <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4 text-center shadow-sm sm:col-span-1">
          <div className="text-3xl font-extrabold text-neutral-900 dark:text-white tracking-tight">
            {stats.charactersNoSpaces.toLocaleString()}
          </div>
          <div className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 mt-0.5">
            Chars (No Spaces)
          </div>
        </div>

        <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4 text-center shadow-sm sm:col-span-1">
          <div className="text-3xl font-extrabold text-neutral-900 dark:text-white tracking-tight">
            {stats.words.toLocaleString()}
          </div>
          <div className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 mt-0.5">
            Words
          </div>
        </div>

        <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4 text-center shadow-sm sm:col-span-1">
          <div className="text-3xl font-extrabold text-neutral-900 dark:text-white tracking-tight">
            {stats.spaces.toLocaleString()}
          </div>
          <div className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 mt-0.5">
            Spaces
          </div>
        </div>

        <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4 text-center shadow-sm sm:col-span-1">
          <div className="text-3xl font-extrabold text-neutral-900 dark:text-white tracking-tight">
            {stats.lines.toLocaleString()}
          </div>
          <div className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 mt-0.5">
            Lines
          </div>
        </div>
      </div>

      {/* Editor Area */}
      <TextInputArea
        id="character-counter-input"
        label="Character Counter Editor"
        value={text}
        onChange={setText}
        placeholder="Type or paste your text to count characters..."
        rows={8}
      />

      {/* Platform Length Limit Progress Indicators */}
      <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/70 dark:bg-neutral-900/40 p-5 space-y-4">
        <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300">
          Social & Platform Length Benchmarks
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {PLATFORM_LIMITS.map((platform) => {
            const current = stats.characters;
            const remaining = platform.max - current;
            const percentage = Math.min(100, Math.round((current / platform.max) * 100));
            const isOver = remaining < 0;

            return (
              <div
                key={platform.name}
                className="p-3.5 rounded-xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-950 shadow-sm space-y-2"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-neutral-900 dark:text-white">
                    {platform.name}
                  </span>
                  <span
                    className={`font-semibold ${
                      isOver
                        ? 'text-rose-600 dark:text-rose-400'
                        : 'text-neutral-500 dark:text-neutral-400'
                    }`}
                  >
                    {current} / {platform.max}
                  </span>
                </div>

                <div className="w-full h-1.5 rounded-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${
                      isOver
                        ? 'bg-rose-500'
                        : percentage > 85
                        ? 'bg-amber-500'
                        : 'bg-emerald-500'
                    }`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-neutral-500 dark:text-neutral-400">
                    {platform.label}
                  </span>
                  <span
                    className={`font-semibold ${
                      isOver
                        ? 'text-rose-600 dark:text-rose-400'
                        : 'text-neutral-600 dark:text-neutral-400'
                    }`}
                  >
                    {isOver ? `${Math.abs(remaining)} over` : `${remaining} left`}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
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

        {text && (
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Text</span>
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
};
