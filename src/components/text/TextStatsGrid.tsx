import React from 'react';
import { Clock, Volume2, AlignLeft, Hash, Type, FileText } from 'lucide-react';
import { TextStats } from '../../lib/text/stats';

interface TextStatsGridProps {
  stats: TextStats;
  compact?: boolean;
}

export const TextStatsGrid: React.FC<TextStatsGridProps> = ({ stats, compact = false }) => {
  return (
    <div className="space-y-3">
      {/* Primary Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/90 p-3.5 text-center shadow-sm">
          <div className="text-2xl sm:text-3xl font-extrabold text-neutral-900 dark:text-white tracking-tight">
            {stats.words.toLocaleString()}
          </div>
          <div className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 mt-0.5">
            Words
          </div>
        </div>

        <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/90 p-3.5 text-center shadow-sm">
          <div className="text-2xl sm:text-3xl font-extrabold text-neutral-900 dark:text-white tracking-tight">
            {stats.characters.toLocaleString()}
          </div>
          <div className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 mt-0.5">
            Characters (with spaces)
          </div>
        </div>

        <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/90 p-3.5 text-center shadow-sm">
          <div className="text-2xl sm:text-3xl font-extrabold text-neutral-900 dark:text-white tracking-tight">
            {stats.charactersNoSpaces.toLocaleString()}
          </div>
          <div className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 mt-0.5">
            Characters (no spaces)
          </div>
        </div>

        <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/90 p-3.5 text-center shadow-sm">
          <div className="text-2xl sm:text-3xl font-extrabold text-neutral-900 dark:text-white tracking-tight">
            {stats.sentences.toLocaleString()}
          </div>
          <div className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 mt-0.5">
            Sentences
          </div>
        </div>
      </div>

      {!compact && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="rounded-xl border border-neutral-200/80 dark:border-neutral-800/80 bg-neutral-50/70 dark:bg-neutral-900/50 p-3 text-center">
            <div className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
              {stats.paragraphs}
            </div>
            <div className="text-[11px] font-medium text-neutral-500 dark:text-neutral-400">
              Paragraphs
            </div>
          </div>

          <div className="rounded-xl border border-neutral-200/80 dark:border-neutral-800/80 bg-neutral-50/70 dark:bg-neutral-900/50 p-3 text-center">
            <div className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
              {stats.lines}
            </div>
            <div className="text-[11px] font-medium text-neutral-500 dark:text-neutral-400">
              Total Lines
            </div>
          </div>

          <div className="rounded-xl border border-neutral-200/80 dark:border-neutral-800/80 bg-neutral-50/70 dark:bg-neutral-900/50 p-3 text-center flex flex-col items-center justify-center">
            <div className="inline-flex items-center gap-1 text-sm font-bold text-neutral-900 dark:text-neutral-100">
              <Clock className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>~{stats.readingTimeMinutes} min</span>
            </div>
            <div className="text-[11px] font-medium text-neutral-500 dark:text-neutral-400">
              Reading Time (200 wpm)
            </div>
          </div>

          <div className="rounded-xl border border-neutral-200/80 dark:border-neutral-800/80 bg-neutral-50/70 dark:bg-neutral-900/50 p-3 text-center flex flex-col items-center justify-center">
            <div className="inline-flex items-center gap-1 text-sm font-bold text-neutral-900 dark:text-neutral-100">
              <Volume2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>~{stats.speakingTimeMinutes} min</span>
            </div>
            <div className="text-[11px] font-medium text-neutral-500 dark:text-neutral-400">
              Speaking Time (130 wpm)
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
