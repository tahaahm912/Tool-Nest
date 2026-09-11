import React, { useState, useEffect } from 'react';
import {
  Dices,
  RotateCcw,
  Sparkles,
  Copy,
  Check,
  Hash,
  Sliders,
  TrendingUp,
  Filter,
  Layers,
  ArrowDownUp,
  Trash2,
} from 'lucide-react';
import {
  generateRandomNumbers,
  RandomNumberResult,
} from '../lib/utilities/randomNumberGenerator';
import { ModeSelector, ModeOption } from '../components/daily/ModeSelector';
import { CopyButton } from '../components/daily/CopyButton';
import { ResultCard } from '../components/calculator/ResultCard';

const MODE_OPTIONS: ModeOption<'integer' | 'decimal'>[] = [
  { id: 'integer', label: 'Integers (Whole Numbers)', icon: Hash },
  { id: 'decimal', label: 'Decimals (Floating Point)', icon: Sliders },
];

const PRESETS = [
  { label: 'Dice Roll (1-6)', min: 1, max: 6, qty: 1, dup: true, mode: 'integer' as const },
  { label: 'Lottery 6/49 (1-49)', min: 1, max: 49, qty: 6, dup: false, mode: 'integer' as const },
  { label: 'Percentage (1-100)', min: 1, max: 100, qty: 5, dup: true, mode: 'integer' as const },
  { label: 'Coin Toss (0-1)', min: 0, max: 1, qty: 1, dup: true, mode: 'integer' as const },
  { label: 'Random Decimals (0-1)', min: 0, max: 1, qty: 5, dup: true, mode: 'decimal' as const },
];

export const RandomNumberGenerator: React.FC = () => {
  const [mode, setMode] = useState<'integer' | 'decimal'>('integer');
  const [min, setMin] = useState<number>(1);
  const [max, setMax] = useState<number>(100);
  const [quantity, setQuantity] = useState<number>(5);
  const [allowDuplicates, setAllowDuplicates] = useState<boolean>(true);
  const [decimalPlaces, setDecimalPlaces] = useState<number>(2);
  const [sortOrder, setSortOrder] = useState<'none' | 'asc' | 'desc'>('none');
  const [copyFormat, setCopyFormat] = useState<'comma' | 'newline' | 'json'>('comma');

  // Generation result state
  const [result, setResult] = useState<RandomNumberResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  // Perform random generation
  const handleGenerate = () => {
    try {
      setError(null);
      const res = generateRandomNumbers({
        min,
        max,
        quantity,
        allowDuplicates,
        mode,
        decimalPlaces,
        sortOrder,
      });
      setResult(res);
    } catch (err: any) {
      setError(err.message || 'Error generating random numbers.');
    }
  };

  // Initial generation on mount
  useEffect(() => {
    handleGenerate();
  }, []);

  // Copy individual number
  const handleCopySingle = (val: number, idx: number) => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(String(val));
      setCopiedIndex(idx);
      setTimeout(() => setCopiedIndex(null), 1500);
    }
  };

  // Format all numbers for copying
  const getFormattedCopyString = (): string => {
    if (!result || result.numbers.length === 0) return '';
    if (copyFormat === 'comma') {
      return result.numbers.join(', ');
    }
    if (copyFormat === 'newline') {
      return result.numbers.join('\n');
    }
    if (copyFormat === 'json') {
      return JSON.stringify(result.numbers);
    }
    return result.numbers.join(', ');
  };

  // Reset to defaults
  const handleReset = () => {
    setMode('integer');
    setMin(1);
    setMax(100);
    setQuantity(5);
    setAllowDuplicates(true);
    setDecimalPlaces(2);
    setSortOrder('none');
    setError(null);
    try {
      const res = generateRandomNumbers({
        min: 1,
        max: 100,
        quantity: 5,
        allowDuplicates: true,
        mode: 'integer',
        decimalPlaces: 2,
        sortOrder: 'none',
      });
      setResult(res);
    } catch {
      // Ignored
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header Mode & Quick Presets */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-neutral-200 dark:border-neutral-800">
        <div>
          <span className="text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider block mb-1">
            Random Number Type
          </span>
          <ModeSelector
            options={MODE_OPTIONS}
            activeId={mode}
            onChange={(m) => {
              setMode(m);
              setError(null);
            }}
          />
        </div>

        <button
          type="button"
          onClick={handleReset}
          className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-xl transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Defaults</span>
        </button>
      </div>

      {/* Quick Presets */}
      <div>
        <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-2 block">
          Quick Generation Presets
        </span>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((p) => (
            <button
              key={p.label}
              type="button"
              onClick={() => {
                setMin(p.min);
                setMax(p.max);
                setQuantity(p.qty);
                setAllowDuplicates(p.dup);
                setMode(p.mode);
                setError(null);
                try {
                  const res = generateRandomNumbers({
                    min: p.min,
                    max: p.max,
                    quantity: p.qty,
                    allowDuplicates: p.dup,
                    mode: p.mode,
                    decimalPlaces: 2,
                    sortOrder,
                  });
                  setResult(res);
                } catch (e: any) {
                  setError(e.message);
                }
              }}
              className="px-3 py-1.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-xs font-medium text-neutral-700 dark:text-neutral-300 hover:border-emerald-500 hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors shadow-2xs"
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Configuration Controls */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-5 sm:p-6 shadow-sm space-y-5">
            <h3 className="text-sm font-bold text-neutral-900 dark:text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-emerald-600" />
              <span>Range & Distribution Bounds</span>
            </h3>

            {/* Min and Max Inputs */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                  Minimum Value
                </label>
                <input
                  type="number"
                  value={min}
                  onChange={(e) => setMin(Number(e.target.value))}
                  step={mode === 'decimal' ? '0.1' : '1'}
                  className="w-full rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 px-3 py-2 text-sm text-neutral-900 dark:text-neutral-100 font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                  Maximum Value
                </label>
                <input
                  type="number"
                  value={max}
                  onChange={(e) => setMax(Number(e.target.value))}
                  step={mode === 'decimal' ? '0.1' : '1'}
                  className="w-full rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 px-3 py-2 text-sm text-neutral-900 dark:text-neutral-100 font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Quantity */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-medium text-neutral-700 dark:text-neutral-300">
                  Quantity of Numbers: <span className="font-bold text-emerald-600">{quantity}</span>
                </label>
                <span className="text-[11px] text-neutral-500">Max 1,000</span>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="1"
                  max="100"
                  value={quantity > 100 ? 100 : quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  className="w-full accent-emerald-600"
                />
                <input
                  type="number"
                  min="1"
                  max="1000"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, Math.min(1000, Number(e.target.value))))}
                  className="w-20 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 px-2.5 py-1 text-xs text-center font-mono"
                />
              </div>
            </div>

            {/* Mode-specific settings */}
            {mode === 'decimal' && (
              <div>
                <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                  Decimal Places Precision
                </label>
                <select
                  value={decimalPlaces}
                  onChange={(e) => setDecimalPlaces(Number(e.target.value))}
                  className="w-full rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 px-3 py-2 text-sm text-neutral-900 dark:text-neutral-100"
                >
                  <option value="1">1 Decimal Place (0.1)</option>
                  <option value="2">2 Decimal Places (0.01)</option>
                  <option value="3">3 Decimal Places (0.001)</option>
                  <option value="4">4 Decimal Places (0.0001)</option>
                  <option value="5">5 Decimal Places (0.00001)</option>
                  <option value="6">6 Decimal Places (0.000001)</option>
                </select>
              </div>
            )}

            {/* Duplicates & Sorting Toggles */}
            <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800 space-y-3">
              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <span className="block text-xs font-medium text-neutral-900 dark:text-white">
                    Allow Duplicate Numbers
                  </span>
                  <span className="block text-[11px] text-neutral-500">
                    When disabled, all generated numbers will be completely unique.
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={allowDuplicates}
                  onChange={(e) => setAllowDuplicates(e.target.checked)}
                  className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                />
              </label>

              <div>
                <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  Sort Output
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'none', label: 'Random Order' },
                    { id: 'asc', label: 'Ascending (1 → 9)' },
                    { id: 'desc', label: 'Descending (9 → 1)' },
                  ].map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setSortOrder(s.id as any)}
                      className={`px-2.5 py-1.5 rounded-xl border text-xs font-medium transition-colors ${
                        sortOrder === s.id
                          ? 'bg-emerald-50 border-emerald-300 text-emerald-800 dark:bg-emerald-950/50 dark:border-emerald-700 dark:text-emerald-300 font-semibold'
                          : 'border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800'
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Error Display */}
            {error && (
              <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-xs">
                <strong>Validation Error:</strong> {error}
              </div>
            )}

            {/* Primary Action Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleGenerate}
                className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white shadow-sm transition-all duration-150"
              >
                <Dices className="w-4 h-4" />
                <span>{result ? 'Generate Again' : 'Generate Random Numbers'}</span>
              </button>
            </div>

            {/* Cryptographic Security Note */}
            <div className="flex items-center gap-2 text-[11px] text-neutral-500 dark:text-neutral-400">
              <Sparkles className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
              <span>Uses hardware-level crypto.getRandomValues() to eliminate bias.</span>
            </div>
          </div>
        </div>

        {/* Right Column: Output Display & Statistical Breakdown */}
        <div className="lg:col-span-7 space-y-6">
          {/* Main Results Container */}
          <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-5 sm:p-6 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-neutral-100 dark:border-neutral-800">
              <div>
                <h3 className="text-sm font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                  <Hash className="w-4 h-4 text-emerald-600" />
                  <span>Generated Results ({result?.numbers.length || 0})</span>
                </h3>
              </div>

              {result && result.numbers.length > 0 && (
                <div className="flex items-center gap-2">
                  <select
                    value={copyFormat}
                    onChange={(e) => setCopyFormat(e.target.value as any)}
                    className="rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-950 px-2 py-1 text-xs text-neutral-700 dark:text-neutral-300"
                  >
                    <option value="comma">Comma-separated</option>
                    <option value="newline">One per line</option>
                    <option value="json">JSON Array</option>
                  </select>
                  <CopyButton
                    textToCopy={getFormattedCopyString()}
                    label="Copy All"
                    size="sm"
                    variant="secondary"
                  />
                  <button
                    type="button"
                    onClick={() => setResult(null)}
                    title="Clear Results"
                    className="p-1.5 text-neutral-400 hover:text-rose-600 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Results Grid / List */}
            {result && result.numbers.length > 0 ? (
              <div className="max-h-80 overflow-y-auto pr-1">
                {result.numbers.length === 1 ? (
                  // Single giant number highlight
                  <div className="py-8 text-center bg-neutral-50 dark:bg-neutral-950 rounded-2xl border border-neutral-200/80 dark:border-neutral-800">
                    <span className="text-xs font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest block mb-2">
                      Random Selection
                    </span>
                    <span className="text-5xl sm:text-6xl font-black text-neutral-900 dark:text-white tracking-tight font-mono">
                      {result.numbers[0]}
                    </span>
                    <div className="mt-4">
                      <CopyButton
                        textToCopy={String(result.numbers[0])}
                        label="Copy Number"
                        size="sm"
                        variant="secondary"
                      />
                    </div>
                  </div>
                ) : (
                  // Multi-number chip grid
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5">
                    {result.numbers.map((num, idx) => (
                      <button
                        key={`${idx}-${num}`}
                        type="button"
                        onClick={() => handleCopySingle(num, idx)}
                        title="Click to copy single number"
                        className={`group relative p-3 rounded-xl border text-center transition-all duration-150 ${
                          copiedIndex === idx
                            ? 'bg-emerald-100 border-emerald-400 text-emerald-900 dark:bg-emerald-950 dark:border-emerald-600 dark:text-emerald-100'
                            : 'bg-neutral-50 hover:bg-neutral-100 dark:bg-neutral-950 dark:hover:bg-neutral-800 border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-neutral-100 hover:border-emerald-400'
                        }`}
                      >
                        <span className="text-xs text-neutral-400 block font-mono text-[10px]">
                          #{idx + 1}
                        </span>
                        <span className="text-lg font-bold font-mono tracking-tight block truncate">
                          {num}
                        </span>
                        <span className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          {copiedIndex === idx ? (
                            <Check className="w-3 h-3 text-emerald-600" />
                          ) : (
                            <Copy className="w-3 h-3 text-neutral-400" />
                          )}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="py-12 text-center text-neutral-400 dark:text-neutral-600">
                <Dices className="w-12 h-12 mx-auto mb-2 opacity-40" />
                <p className="text-xs">Click "Generate Random Numbers" to roll</p>
              </div>
            )}
          </div>

          {/* Statistical Breakdown Grid */}
          {result && result.numbers.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <ResultCard
                label="Minimum"
                value={result.min}
                variant="neutral"
              />
              <ResultCard
                label="Maximum"
                value={result.max}
                variant="neutral"
              />
              <ResultCard
                label="Average (Mean)"
                value={result.average}
                variant="neutral"
              />
              <ResultCard
                label="Total Sum"
                value={result.sum}
                variant="emerald"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
