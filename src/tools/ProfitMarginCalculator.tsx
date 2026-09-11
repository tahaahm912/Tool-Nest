import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  HelpCircle,
  RotateCcw,
  Copy,
  Check,
  Percent,
} from 'lucide-react';
import { CalculatorInput } from '../components/calculator/CalculatorInput';
import { ResultCard } from '../components/calculator/ResultCard';
import { ValidationAlert } from '../components/calculator/ValidationAlert';
import { FormulaBox } from '../components/calculator/FormulaBox';
import { formatCurrency, formatPercent, safeDivide, parseNumericInput } from '../lib/formatters';

type Mode = 'calculate-margin' | 'calculate-price';

export const ProfitMarginCalculator: React.FC = () => {
  const [mode, setMode] = useState<Mode>('calculate-margin');
  const [currency, setCurrency] = useState('USD');
  const [copied, setCopied] = useState(false);

  // Mode 1: Cost Price & Selling Price
  const [m1Cost, setM1Cost] = useState('60');
  const [m1Revenue, setM1Revenue] = useState('100');

  // Mode 2: Cost Price & Desired Profit Margin
  const [m2Cost, setM2Cost] = useState('50');
  const [m2Margin, setM2Margin] = useState('25');

  const currencies = [
    { code: 'USD', symbol: '$' },
    { code: 'EUR', symbol: '€' },
    { code: 'GBP', symbol: '£' },
    { code: 'INR', symbol: '₹' },
    { code: 'CAD', symbol: 'CA$' },
    { code: 'AUD', symbol: 'A$' },
  ];

  // Mode 1 Calculation
  const result1 = useMemo(() => {
    const cost = parseNumericInput(m1Cost);
    const revenue = parseNumericInput(m1Revenue);

    if (cost === null || cost < 0) {
      return { error: 'Please enter a valid cost price (0 or greater).' };
    }
    if (revenue === null || revenue < 0) {
      return { error: 'Please enter a valid selling price (0 or greater).' };
    }

    const profit = revenue - cost;
    const isLoss = profit < 0;
    const marginPercent = revenue > 0 ? (profit / revenue) * 100 : 0;
    const markupPercent = cost > 0 ? (profit / cost) * 100 : 0;

    return {
      error: null,
      profit,
      isLoss,
      marginPercent,
      markupPercent,
      cost,
      revenue,
    };
  }, [m1Cost, m1Revenue]);

  // Mode 2 Calculation: Target Selling Price
  const result2 = useMemo(() => {
    const cost = parseNumericInput(m2Cost);
    const targetMargin = parseNumericInput(m2Margin);

    if (cost === null || cost <= 0) {
      return { error: 'Please enter a valid cost price greater than 0.' };
    }
    if (targetMargin === null) {
      return { error: 'Please enter a desired profit margin percentage.' };
    }
    if (targetMargin >= 100) {
      return {
        error: 'Profit margin cannot be 100% or greater. A 100% margin requires an infinite selling price.',
      };
    }
    if (targetMargin <= -100) {
      return { error: 'Profit margin cannot be less than or equal to -100%.' };
    }

    const marginFraction = targetMargin / 100;
    const requiredSellingPrice = cost / (1 - marginFraction);
    const profit = requiredSellingPrice - cost;
    const markupPercent = (profit / cost) * 100;

    return {
      error: null,
      requiredSellingPrice,
      profit,
      markupPercent,
      cost,
      targetMargin,
    };
  }, [m2Cost, m2Margin]);

  const handleReset = () => {
    if (mode === 'calculate-margin') {
      setM1Cost('60');
      setM1Revenue('100');
    } else {
      setM2Cost('50');
      setM2Margin('25');
    }
  };

  const handleCopy = () => {
    let summary = '';
    if (mode === 'calculate-margin' && result1 && !result1.error) {
      summary = `Profit & Margin Analysis:
Cost Price: ${formatCurrency(result1.cost, currency)}
Selling Price: ${formatCurrency(result1.revenue, currency)}
Gross ${result1.isLoss ? 'Loss' : 'Profit'}: ${formatCurrency(result1.profit, currency)}
Profit Margin: ${formatPercent(result1.marginPercent, 2)}
Markup: ${formatPercent(result1.markupPercent, 2)}
Calculated on ToolNest.`;
    } else if (mode === 'calculate-price' && result2 && !result2.error) {
      summary = `Target Selling Price Calculation:
Cost Price: ${formatCurrency(result2.cost, currency)}
Desired Margin: ${formatPercent(result2.targetMargin, 2)}
Required Selling Price: ${formatCurrency(result2.requiredSellingPrice, currency)}
Expected Profit: ${formatCurrency(result2.profit, currency)}
Corresponding Markup: ${formatPercent(result2.markupPercent, 2)}
Calculated on ToolNest.`;
    }

    if (summary && typeof window !== 'undefined') {
      navigator.clipboard.writeText(summary);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header: Mode & Currency Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setMode('calculate-margin')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              mode === 'calculate-margin'
                ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-sm border border-neutral-200 dark:border-neutral-700'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900'
            }`}
          >
            Calculate Profit & Margin
          </button>
          <button
            type="button"
            onClick={() => setMode('calculate-price')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              mode === 'calculate-price'
                ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-sm border border-neutral-200 dark:border-neutral-700'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900'
            }`}
          >
            Calculate Selling Price
          </button>
        </div>

        <div className="flex items-center gap-1">
          {currencies.map((c) => (
            <button
              key={c.code}
              type="button"
              onClick={() => setCurrency(c.code)}
              className={`px-2 py-1 rounded-md text-xs font-semibold transition-all ${
                currency === c.code
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              {c.symbol} {c.code}
            </button>
          ))}
        </div>
      </div>

      {/* Mode 1: Calculate Profit & Margin */}
      {mode === 'calculate-margin' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <CalculatorInput
              label="Cost Price (COGS)"
              value={m1Cost}
              onChange={setM1Cost}
              prefix={currencies.find((c) => c.code === currency)?.symbol || '$'}
              placeholder="e.g. 60"
              helperText="The direct cost to manufacture or purchase the item"
            />
            <CalculatorInput
              label="Selling Price (Revenue)"
              value={m1Revenue}
              onChange={setM1Revenue}
              prefix={currencies.find((c) => c.code === currency)?.symbol || '$'}
              placeholder="e.g. 100"
              helperText="The price charged to the customer"
            />
          </div>

          {result1.error && <ValidationAlert message={result1.error} />}

          {!result1.error && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <ResultCard
                  label={result1.isLoss ? 'Gross Loss' : 'Gross Profit'}
                  value={formatCurrency(Math.abs(result1.profit), currency)}
                  subtitle={result1.isLoss ? 'Selling below unit cost' : 'Revenue minus cost price'}
                  variant={result1.isLoss ? 'rose' : 'emerald'}
                  icon={result1.isLoss ? TrendingDown : TrendingUp}
                  copyable
                />
                <ResultCard
                  label="Profit Margin"
                  value={formatPercent(result1.marginPercent, 2)}
                  subtitle="Profit as % of Selling Price"
                  variant={result1.isLoss ? 'rose' : 'blue'}
                  icon={Percent}
                  copyable
                />
                <ResultCard
                  label="Markup"
                  value={formatPercent(result1.markupPercent, 2)}
                  subtitle="Profit as % of Cost Price"
                  variant="neutral"
                  copyable
                />
              </div>

              <FormulaBox
                title="Formulas"
                formula="Profit = Revenue - Cost  |  Margin = (Profit ÷ Revenue) × 100  |  Markup = (Profit ÷ Cost) × 100"
                substitution={`Profit = ${formatCurrency(result1.revenue, currency)} - ${formatCurrency(result1.cost, currency)} = ${formatCurrency(result1.profit, currency)}`}
              />
            </div>
          )}
        </div>
      )}

      {/* Mode 2: Calculate Selling Price */}
      {mode === 'calculate-price' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <CalculatorInput
              label="Cost Price (COGS)"
              value={m2Cost}
              onChange={setM2Cost}
              prefix={currencies.find((c) => c.code === currency)?.symbol || '$'}
              placeholder="e.g. 50"
              helperText="The original purchase or production cost"
            />
            <CalculatorInput
              label="Desired Profit Margin"
              value={m2Margin}
              onChange={setM2Margin}
              suffix="%"
              placeholder="e.g. 25"
              helperText="Percentage of selling price retained as profit (cannot be 100%)"
            />
          </div>

          {result2.error && <ValidationAlert message={result2.error} />}

          {!result2.error && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <ResultCard
                  label="Required Selling Price"
                  value={formatCurrency(result2.requiredSellingPrice, currency)}
                  subtitle="Charge this price to earn your target margin"
                  variant="emerald"
                  copyable
                />
                <ResultCard
                  label="Profit per Unit"
                  value={formatCurrency(result2.profit, currency)}
                  subtitle={`Earnings per sale at ${result2.targetMargin}% margin`}
                  variant="blue"
                  copyable
                />
                <ResultCard
                  label="Equivalent Markup"
                  value={formatPercent(result2.markupPercent, 2)}
                  subtitle="Markup required on cost price"
                  variant="neutral"
                  copyable
                />
              </div>

              <FormulaBox
                title="Selling Price Formula"
                formula="Selling Price = Cost Price ÷ (1 - (Margin % ÷ 100))"
                substitution={`Selling Price = ${formatCurrency(result2.cost, currency)} ÷ (1 - ${(parseFloat(result2.targetMargin) / 100).toFixed(4)}) = ${formatCurrency(result2.requiredSellingPrice, currency)}`}
              />
            </div>
          )}
        </div>
      )}

      {/* Educational Explainer: Margin vs. Markup */}
      <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/70 dark:bg-neutral-900/40 p-5 space-y-2.5">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-neutral-800 dark:text-neutral-200">
          <HelpCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>Profit Margin vs. Markup: The Key Difference</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed pt-1">
          <div className="p-3 rounded-xl bg-white dark:bg-neutral-950 border border-neutral-200/60 dark:border-neutral-800">
            <span className="font-bold text-neutral-900 dark:text-white block mb-1">
              Profit Margin (Profit ÷ Revenue)
            </span>
            Measures what portion of your sales revenue you actually keep as profit. For instance, if an item costs $60 and sells for $100, your margin is 40%. A margin can never exceed 100%.
          </div>
          <div className="p-3 rounded-xl bg-white dark:bg-neutral-950 border border-neutral-200/60 dark:border-neutral-800">
            <span className="font-bold text-neutral-900 dark:text-white block mb-1">
              Markup (Profit ÷ Cost)
            </span>
            Measures how much you mark up the base cost to arrive at the selling price. In the same example ($60 cost, $100 sale), your markup is 66.7%. A markup can easily exceed 100%.
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="flex items-center justify-between gap-3 pt-4 border-t border-neutral-200/80 dark:border-neutral-800/80">
        <button
          type="button"
          onClick={handleReset}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Calculator</span>
        </button>

        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-colors"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5" />
              <span>Report Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copy Analysis</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
