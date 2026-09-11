import React, { useState, useMemo } from 'react';
import { Percent, TrendingUp, TrendingDown, ArrowRight, RotateCcw, Copy, Check } from 'lucide-react';
import { CalculatorInput } from '../components/calculator/CalculatorInput';
import { ResultCard } from '../components/calculator/ResultCard';
import { FormulaBox } from '../components/calculator/FormulaBox';
import { ValidationAlert } from '../components/calculator/ValidationAlert';
import { formatNumber, formatPercent, safeDivide, parseNumericInput } from '../lib/formatters';

type Mode = 'percentage-of' | 'is-what-percent' | 'increase-decrease' | 'add-subtract';

export const PercentageCalculator: React.FC = () => {
  const [activeMode, setActiveMode] = useState<Mode>('percentage-of');
  const [copied, setCopied] = useState(false);

  // State for Mode 1: What is X% of Y?
  const [m1Percent, setM1Percent] = useState('20');
  const [m1Value, setM1Value] = useState('500');

  // State for Mode 2: X is what percent of Y?
  const [m2Part, setM2Part] = useState('50');
  const [m2Total, setM2Total] = useState('200');

  // State for Mode 3: Percentage increase / decrease from X to Y
  const [m3Initial, setM3Initial] = useState('100');
  const [m3Final, setM3Final] = useState('150');

  // State for Mode 4: Add / Subtract percentage from X
  const [m4Base, setM4Base] = useState('500');
  const [m4Percent, setM4Percent] = useState('10');
  const [m4Operation, setM4Operation] = useState<'add' | 'subtract'>('add');

  // Mode 1 Calculation
  const result1 = useMemo(() => {
    const p = parseNumericInput(m1Percent);
    const v = parseNumericInput(m1Value);
    if (p === null || v === null) return null;
    const ans = (p * v) / 100;
    return {
      answer: ans,
      formula: `Result = (${p} × ${v}) ÷ 100`,
      substitution: `(${p}% × ${v}) = ${formatNumber(ans, { maxDecimals: 4 })}`,
    };
  }, [m1Percent, m1Value]);

  // Mode 2 Calculation: Part is what % of Total?
  const result2 = useMemo(() => {
    const part = parseNumericInput(m2Part);
    const total = parseNumericInput(m2Total);
    if (part === null || total === null) return null;
    if (total === 0) {
      return { error: 'Total (Y) cannot be zero. Division by zero is undefined.' };
    }
    const ans = (part / total) * 100;
    return {
      answer: ans,
      formula: `Percentage = (${part} ÷ ${total}) × 100`,
      substitution: `(${part} ÷ ${total}) × 100% = ${formatPercent(ans, 4)}`,
    };
  }, [m2Part, m2Total]);

  // Mode 3 Calculation: Percentage Increase / Decrease from X to Y
  const result3 = useMemo(() => {
    const initial = parseNumericInput(m3Initial);
    const finalVal = parseNumericInput(m3Final);
    if (initial === null || finalVal === null) return null;
    if (initial === 0) {
      return { error: 'Initial value (X) cannot be zero when calculating percentage change.' };
    }
    const diff = finalVal - initial;
    const percentChange = (diff / Math.abs(initial)) * 100;
    const isIncrease = diff >= 0;
    return {
      diff,
      percentChange,
      isIncrease,
      formula: `Change % = [(${finalVal} - ${initial}) ÷ |${initial}|] × 100`,
      substitution: `(${diff >= 0 ? '+' : ''}${diff} ÷ ${Math.abs(initial)}) × 100 = ${diff >= 0 ? '+' : ''}${formatPercent(percentChange, 2)}`,
    };
  }, [m3Initial, m3Final]);

  // Mode 4 Calculation: Add / Subtract Percentage
  const result4 = useMemo(() => {
    const base = parseNumericInput(m4Base);
    const p = parseNumericInput(m4Percent);
    if (base === null || p === null) return null;
    const delta = (base * p) / 100;
    const finalResult = m4Operation === 'add' ? base + delta : base - delta;
    return {
      delta,
      finalResult,
      formula:
        m4Operation === 'add'
          ? `Result = ${base} + (${base} × ${p}%)`
          : `Result = ${base} - (${base} × ${p}%)`,
      substitution:
        m4Operation === 'add'
          ? `${base} + ${formatNumber(delta, { maxDecimals: 4 })} = ${formatNumber(finalResult, { maxDecimals: 4 })}`
          : `${base} - ${formatNumber(delta, { maxDecimals: 4 })} = ${formatNumber(finalResult, { maxDecimals: 4 })}`,
    };
  }, [m4Base, m4Percent, m4Operation]);

  const handleReset = () => {
    if (activeMode === 'percentage-of') {
      setM1Percent('20');
      setM1Value('500');
    } else if (activeMode === 'is-what-percent') {
      setM2Part('50');
      setM2Total('200');
    } else if (activeMode === 'increase-decrease') {
      setM3Initial('100');
      setM3Final('150');
    } else {
      setM4Base('500');
      setM4Percent('10');
      setM4Operation('add');
    }
  };

  const handleCopy = () => {
    let text = '';
    if (activeMode === 'percentage-of' && result1) {
      text = `${m1Percent}% of ${m1Value} = ${formatNumber(result1.answer, { maxDecimals: 4 })}`;
    } else if (activeMode === 'is-what-percent' && result2 && !('error' in result2)) {
      text = `${m2Part} is ${formatPercent(result2.answer, 4)} of ${m2Total}`;
    } else if (activeMode === 'increase-decrease' && result3 && !('error' in result3)) {
      text = `Change from ${m3Initial} to ${m3Final}: ${result3.isIncrease ? 'Increase' : 'Decrease'} of ${formatPercent(Math.abs(result3.percentChange), 2)} (Difference: ${formatNumber(result3.diff, { maxDecimals: 4 })})`;
    } else if (activeMode === 'add-subtract' && result4) {
      text = `${m4Operation === 'add' ? 'Increase' : 'Decrease'} ${m4Base} by ${m4Percent}% = ${formatNumber(result4.finalResult, { maxDecimals: 4 })}`;
    }

    if (text && typeof window !== 'undefined') {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const modes = [
    { id: 'percentage-of', label: 'X% of Y', desc: 'Find percentage amount' },
    { id: 'is-what-percent', label: 'X is what % of Y', desc: 'Find ratio percentage' },
    { id: 'increase-decrease', label: '% Increase / Decrease', desc: 'Growth or change' },
    { id: 'add-subtract', label: 'Add / Subtract %', desc: 'Markups & discounts' },
  ];

  return (
    <div className="space-y-6">
      {/* Mode navigation tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-1.5 rounded-2xl bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
        {modes.map((m) => (
          <button
            key={m.id}
            type="button"
            onClick={() => setActiveMode(m.id as Mode)}
            className={`py-2.5 px-3 rounded-xl text-xs font-semibold text-center transition-all ${
              activeMode === m.id
                ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-sm border border-neutral-200/60 dark:border-neutral-700'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            <div>{m.label}</div>
          </button>
        ))}
      </div>

      {/* Mode 1: What is X% of Y? */}
      {activeMode === 'percentage-of' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <CalculatorInput
              label="Percentage (X)"
              value={m1Percent}
              onChange={setM1Percent}
              suffix="%"
              placeholder="e.g. 20"
            />
            <CalculatorInput
              label="Total Value (Y)"
              value={m1Value}
              onChange={setM1Value}
              placeholder="e.g. 500"
            />
          </div>

          {result1 && (
            <div className="space-y-4">
              <ResultCard
                label={`Result: ${m1Percent}% of ${m1Value}`}
                value={formatNumber(result1.answer, { maxDecimals: 4 })}
                subtitle={`Computed answer for ${m1Percent}% of ${m1Value}`}
                variant="emerald"
                copyable
              />
              <FormulaBox
                formula="Result = (Percentage × Value) ÷ 100"
                substitution={result1.substitution}
              />
            </div>
          )}
        </div>
      )}

      {/* Mode 2: X is what percent of Y? */}
      {activeMode === 'is-what-percent' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <CalculatorInput
              label="Part Value (X)"
              value={m2Part}
              onChange={setM2Part}
              placeholder="e.g. 50"
            />
            <CalculatorInput
              label="Whole / Total (Y)"
              value={m2Total}
              onChange={setM2Total}
              placeholder="e.g. 200"
            />
          </div>

          {result2 && 'error' in result2 && <ValidationAlert message={result2.error!} />}

          {result2 && !('error' in result2) && (
            <div className="space-y-4">
              <ResultCard
                label={`${m2Part} as a Percentage of ${m2Total}`}
                value={formatPercent(result2.answer, 4)}
                subtitle={`${m2Part} divided by ${m2Total} converted to percent`}
                variant="blue"
                copyable
              />
              <FormulaBox
                formula="Percentage = (Part ÷ Total) × 100"
                substitution={result2.substitution}
              />
            </div>
          )}
        </div>
      )}

      {/* Mode 3: Percentage Increase / Decrease from X to Y */}
      {activeMode === 'increase-decrease' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <CalculatorInput
              label="Starting Value (X)"
              value={m3Initial}
              onChange={setM3Initial}
              placeholder="e.g. 100"
            />
            <CalculatorInput
              label="New / Final Value (Y)"
              value={m3Final}
              onChange={setM3Final}
              placeholder="e.g. 150"
            />
          </div>

          {result3 && 'error' in result3 && <ValidationAlert message={result3.error!} />}

          {result3 && !('error' in result3) && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <ResultCard
                  label="Percentage Change"
                  value={`${result3.isIncrease ? '+' : ''}${formatPercent(result3.percentChange, 2)}`}
                  subtitle={result3.isIncrease ? 'Increase' : 'Decrease'}
                  variant={result3.isIncrease ? 'emerald' : 'rose'}
                  icon={result3.isIncrease ? TrendingUp : TrendingDown}
                  copyable
                />
                <ResultCard
                  label="Absolute Difference"
                  value={`${result3.diff >= 0 ? '+' : ''}${formatNumber(result3.diff, { maxDecimals: 4 })}`}
                  subtitle={`Difference between ${m3Final} and ${m3Initial}`}
                  variant="neutral"
                  copyable
                />
              </div>
              <FormulaBox
                formula="Change % = ((New Value - Starting Value) ÷ |Starting Value|) × 100"
                substitution={result3.substitution}
              />
            </div>
          )}
        </div>
      )}

      {/* Mode 4: Add / Subtract Percentage */}
      {activeMode === 'add-subtract' && (
        <div className="space-y-6">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-neutral-700 dark:text-neutral-300">
              Operation:
            </span>
            <div className="inline-flex rounded-xl p-1 bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
              <button
                type="button"
                onClick={() => setM4Operation('add')}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                  m4Operation === 'add'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-neutral-600 dark:text-neutral-400'
                }`}
              >
                + Add Percentage (Markup)
              </button>
              <button
                type="button"
                onClick={() => setM4Operation('subtract')}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                  m4Operation === 'subtract'
                    ? 'bg-rose-600 text-white shadow-sm'
                    : 'text-neutral-600 dark:text-neutral-400'
                }`}
              >
                − Subtract Percentage (Discount)
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <CalculatorInput
              label="Original Value (X)"
              value={m4Base}
              onChange={setM4Base}
              placeholder="e.g. 500"
            />
            <CalculatorInput
              label="Percentage to Apply (%)"
              value={m4Percent}
              onChange={setM4Percent}
              suffix="%"
              placeholder="e.g. 10"
            />
          </div>

          {result4 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <ResultCard
                  label="Final Value"
                  value={formatNumber(result4.finalResult, { maxDecimals: 4 })}
                  subtitle={`${m4Base} ${m4Operation === 'add' ? '+' : '-'} ${m4Percent}%`}
                  variant={m4Operation === 'add' ? 'emerald' : 'blue'}
                  copyable
                />
                <ResultCard
                  label={`${m4Operation === 'add' ? 'Added' : 'Subtracted'} Amount`}
                  value={formatNumber(result4.delta, { maxDecimals: 4 })}
                  subtitle={`${m4Percent}% of ${m4Base}`}
                  variant="neutral"
                  copyable
                />
              </div>
              <FormulaBox
                formula={result4.formula}
                substitution={result4.substitution}
              />
            </div>
          )}
        </div>
      )}

      {/* Action Footer: Reset and Copy */}
      <div className="flex items-center justify-between gap-3 pt-4 border-t border-neutral-200/80 dark:border-neutral-800/80">
        <button
          type="button"
          onClick={handleReset}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Mode</span>
        </button>

        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-neutral-900 hover:bg-neutral-800 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-white text-white shadow-sm transition-colors"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-500" />
              <span>Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copy Result</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
