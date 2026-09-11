import React, { useState, useMemo } from 'react';
import { FileText, Copy, Check, Trash2, RotateCcw, Sparkles } from 'lucide-react';
import { TextInputArea } from '../components/text/TextInputArea';
import { TextStatsGrid } from '../components/text/TextStatsGrid';
import { calculateTextStats } from '../lib/text/stats';
import { copyToClipboard } from '../lib/text/clipboard';

const SAMPLE_TEXT = `The quick brown fox jumps over the lazy dog. Rapid text analysis empowers writers, editors, and students to monitor prose density, rhythm, and clarity in real time.

Whether crafting concise social snippets, academic essays, or comprehensive technical documentation, tracking exact word counts and estimated reading durations ensures your message reaches its audience with maximum impact.`;

export const WordCounter: React.FC = () => {
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

  const handleClear = () => {
    setText('');
  };

  const handleLoadSample = () => {
    setText(SAMPLE_TEXT);
  };

  return (
    <div className="space-y-6">
      {/* Real-time Statistics Cards */}
      <TextStatsGrid stats={stats} />

      {/* Main Text Input Editor */}
      <div className="space-y-2">
        <TextInputArea
          id="word-counter-input"
          label="Content Editor"
          value={text}
          onChange={setText}
          placeholder="Type or paste your text here to count words, characters, and sentences in real time..."
          rows={10}
          helperText={`${stats.characters.toLocaleString()} characters | ${stats.words.toLocaleString()} words | ~${stats.readingTimeMinutes} min reading time`}
        />
      </div>

      {/* Action Footer */}
      <div className="flex items-center justify-between gap-3 pt-4 border-t border-neutral-200/80 dark:border-neutral-800/80 flex-wrap">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleClear}
            disabled={!text}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border border-neutral-200 dark:border-neutral-800 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors disabled:opacity-40 disabled:pointer-events-none"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear Text</span>
          </button>

          <button
            type="button"
            onClick={handleLoadSample}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
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
                <span>Text Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Entire Text</span>
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
};
