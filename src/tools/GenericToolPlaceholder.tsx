import React, { useState } from 'react';
import { Sparkles, Play, Check, SlidersHorizontal, ArrowUpRight } from 'lucide-react';
import { Tool } from '../types';
import { DynamicIcon } from '../components/DynamicIcon';

interface GenericToolPlaceholderProps {
  tool: Tool;
}

export const GenericToolPlaceholder: React.FC<GenericToolPlaceholderProps> = ({ tool }) => {
  const [inputText, setInputText] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [previewResult, setPreviewResult] = useState<string | null>(null);

  const handleRun = () => {
    setIsRunning(true);
    setTimeout(() => {
      setIsRunning(false);
      setPreviewResult(
        `Preview processed successfully for: "${inputText || 'Default test parameters'}". Full engine scheduled in Category Rollout.`
      );
    }, 600);
  };

  return (
    <div className="space-y-6">
      {/* Configuration & Parameters Box */}
      <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/40 p-5 sm:p-6">
        <div className="flex items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-neutral-900 dark:text-neutral-100">
            <SlidersHorizontal className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>{tool.name} Parameters & Inputs</span>
          </div>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20">
            <Sparkles className="w-3.5 h-3.5" />
            Phase 1 Foundation
          </span>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider mb-2">
              Primary Input / Data
            </label>
            <textarea
              rows={4}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={`Enter or paste your data for ${tool.name.toLowerCase()}...`}
              className="w-full rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-3 text-sm text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all font-mono"
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Client-side engine architecture is configured and ready for implementation.
            </p>

            <button
              type="button"
              onClick={handleRun}
              disabled={isRunning}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-all disabled:opacity-50"
            >
              <Play className={`w-4 h-4 ${isRunning ? 'animate-spin' : ''}`} />
              <span>{isRunning ? 'Processing...' : `Run ${tool.name}`}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Output / Preview Area */}
      {previewResult && (
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4 sm:p-5 animate-in fade-in duration-200">
          <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-semibold text-sm mb-2">
            <Check className="w-4 h-4" />
            <span>Output Ready</span>
          </div>
          <p className="text-sm text-neutral-800 dark:text-neutral-200 font-mono break-all">
            {previewResult}
          </p>
        </div>
      )}
    </div>
  );
};
