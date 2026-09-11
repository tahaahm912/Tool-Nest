import React, { useState, useMemo } from 'react';
import { Tag, Sparkles, ShoppingBag, RotateCcw, Copy, Check, Plus } from 'lucide-react';
import { CalculatorInput } from '../components/calculator/CalculatorInput';
import { ResultCard } from '../components/calculator/ResultCard';
import { ValidationAlert } from '../components/calculator/ValidationAlert';
import { FormulaBox } from '../components/calculator/FormulaBox';
import { formatCurrency, formatPercent, parseNumericInput } from '../lib/formatters';

type DiscountMode = 'price-from-discount' | 'discount-from-price' | 'stacked-discount';

export const DiscountCalculator: React.FC = () => {
  const [mode, setMode] = useState<DiscountMode>('price-from-discount');
  const [currency, setCurrency] = useState('USD');
  const [copied, setCopied] = useState(false);

  // Mode 1: Original Price & Discount % (with optional Tax %)
  const [m1Original, setM1Original] = useState('120');
  const [m1DiscountPercent, setM1DiscountPercent] = useState('25');
  const [m1TaxPercent, setM1TaxPercent] = useState('8.5');

  // Mode 2: Original Price & Sale Price -> Find %
  const [m2Original, setM2Original] = useState('150');
  const [m2Sale, setM2Sale] = useState('105');

  // Mode 3: Stacked Discounts (e.g. 30% off + extra 15% coupon)
  const [m3Original, setM3Original] = useState('200');
  const [m3Discount1, setM3Discount1] = useState('20');
  const [m3Discount2, setM3Discount2] = useState('10');

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
    const original = parseNumericInput(m1Original);
    const discountPct = parseNumericInput(m1DiscountPercent);
    const taxPct = parseNumericInput(m1TaxPercent) ?? 0;

    if (original === null || original < 0) {
      return { error: 'Please enter a valid original price (0 or greater).' };
    }
    if (discountPct === null || discountPct < 0 || discountPct > 100) {
      return { error: 'Discount percentage must be between 0% and 100%.' };
    }
    if (taxPct < 0) {
      return { error: 'Sales tax cannot be negative.' };
    }

    const discountAmount = (original * discountPct) / 100;
    const priceAfterDiscount = Math.max(0, original - discountAmount);
    const taxAmount = (priceAfterDiscount * taxPct) / 100;
    const finalPrice = priceAfterDiscount + taxAmount;

    return {
      error: null,
      original,
      discountPct,
      taxPct,
      discountAmount,
      priceAfterDiscount,
      taxAmount,
      finalPrice,
    };
  }, [m1Original, m1DiscountPercent, m1TaxPercent]);

  // Mode 2 Calculation: Find Discount %
  const result2 = useMemo(() => {
    const original = parseNumericInput(m2Original);
    const sale = parseNumericInput(m2Sale);

    if (original === null || original <= 0) {
      return { error: 'Original price must be greater than zero.' };
    }
    if (sale === null || sale < 0) {
      return { error: 'Sale price cannot be negative.' };
    }
    if (sale > original) {
      return {
        error: 'Sale price is higher than the original price. This represents a markup, not a discount.',
      };
    }

    const savings = original - sale;
    const discountPct = (savings / original) * 100;

    return {
      error: null,
      original,
      sale,
      savings,
      discountPct,
    };
  }, [m2Original, m2Sale]);

  // Mode 3 Calculation: Stacked / Double Discounts
  const result3 = useMemo(() => {
    const original = parseNumericInput(m3Original);
    const d1 = parseNumericInput(m3Discount1);
    const d2 = parseNumericInput(m3Discount2);

    if (original === null || original <= 0) {
      return { error: 'Original price must be greater than zero.' };
    }
    if (d1 === null || d1 < 0 || d1 > 100 || d2 === null || d2 < 0 || d2 > 100) {
      return { error: 'Each discount percentage must be between 0% and 100%.' };
    }

    const afterFirst = original * (1 - d1 / 100);
    const finalPrice = afterFirst * (1 - d2 / 100);
    const totalSavings = original - finalPrice;
    const effectiveDiscountPct = (totalSavings / original) * 100;

    return {
      error: null,
      original,
      d1,
      d2,
      afterFirst,
      finalPrice,
      totalSavings,
      effectiveDiscountPct,
    };
  }, [m3Original, m3Discount1, m3Discount2]);

  const handleReset = () => {
    if (mode === 'price-from-discount') {
      setM1Original('120');
      setM1DiscountPercent('25');
      setM1TaxPercent('8.5');
    } else if (mode === 'discount-from-price') {
      setM2Original('150');
      setM2Sale('105');
    } else {
      setM3Original('200');
      setM3Discount1('20');
      setM3Discount2('10');
    }
  };

  const handleCopy = () => {
    let summary = '';
    if (mode === 'price-from-discount' && result1 && !result1.error) {
      summary = `Discount Calculation:
Original Price: ${formatCurrency(result1.original, currency)}
Discount: ${result1.discountPct}% (${formatCurrency(result1.discountAmount, currency)} saved)
Price Before Tax: ${formatCurrency(result1.priceAfterDiscount, currency)}
Sales Tax (${result1.taxPct}%): ${formatCurrency(result1.taxAmount, currency)}
Final Total Price: ${formatCurrency(result1.finalPrice, currency)}
Calculated on ToolNest.`;
    } else if (mode === 'discount-from-price' && result2 && !result2.error) {
      summary = `Discount Rate Analysis:
Original Price: ${formatCurrency(result2.original, currency)}
Sale Price: ${formatCurrency(result2.sale, currency)}
Total Savings: ${formatCurrency(result2.savings, currency)}
Calculated Discount: ${formatPercent(result2.discountPct, 2)} OFF
Calculated on ToolNest.`;
    } else if (mode === 'stacked-discount' && result3 && !result3.error) {
      summary = `Stacked Discount Calculation:
Original Price: ${formatCurrency(result3.original, currency)}
Discounts: ${result3.d1}% + ${result3.d2}% Extra
Final Price: ${formatCurrency(result3.finalPrice, currency)}
Total Savings: ${formatCurrency(result3.totalSavings, currency)} (${formatPercent(result3.effectiveDiscountPct, 2)} effective discount)
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
      {/* Mode & Currency Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
        <div className="flex items-center gap-1 flex-wrap">
          <button
            type="button"
            onClick={() => setMode('price-from-discount')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              mode === 'price-from-discount'
                ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-sm border border-neutral-200 dark:border-neutral-700'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900'
            }`}
          >
            Find Final Price
          </button>
          <button
            type="button"
            onClick={() => setMode('discount-from-price')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              mode === 'discount-from-price'
                ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-sm border border-neutral-200 dark:border-neutral-700'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900'
            }`}
          >
            Find Discount %
          </button>
          <button
            type="button"
            onClick={() => setMode('stacked-discount')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              mode === 'stacked-discount'
                ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-sm border border-neutral-200 dark:border-neutral-700'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900'
            }`}
          >
            Stacked Discounts (Double %)
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

      {/* Mode 1: Price from Discount */}
      {mode === 'price-from-discount' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <CalculatorInput
              label="Original Price"
              value={m1Original}
              onChange={setM1Original}
              prefix={currencies.find((c) => c.code === currency)?.symbol || '$'}
              placeholder="e.g. 120"
            />
            <CalculatorInput
              label="Discount"
              value={m1DiscountPercent}
              onChange={setM1DiscountPercent}
              suffix="%"
              placeholder="e.g. 25"
            />
            <CalculatorInput
              label="Sales Tax (Optional)"
              value={m1TaxPercent}
              onChange={setM1TaxPercent}
              suffix="%"
              placeholder="e.g. 8.5"
              helperText="Set to 0 if tax is included"
            />
          </div>

          {result1.error && <ValidationAlert message={result1.error} />}

          {!result1.error && (
            <div className="space-y-5 animate-in fade-in duration-200">
              {/* Main Result Hero */}
              <div className="rounded-2xl bg-neutral-900 text-white dark:bg-neutral-800/90 p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm">
                <div>
                  <span className="text-xs uppercase font-bold tracking-wider text-emerald-400">
                    Final Out-of-Pocket Price
                  </span>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white">
                      {formatCurrency(result1.finalPrice, currency)}
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-neutral-300">
                    You save a total of {formatCurrency(result1.discountAmount, currency)} ({result1.discountPct}% OFF)
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 w-full sm:w-auto flex-shrink-0">
                  <div className="px-4 py-3 rounded-xl bg-white/10 dark:bg-neutral-700/50 backdrop-blur-sm text-center">
                    <div className="text-xs text-neutral-300">Discount Saved</div>
                    <div className="text-lg sm:text-xl font-bold text-emerald-300">
                      {formatCurrency(result1.discountAmount, currency)}
                    </div>
                  </div>
                  <div className="px-4 py-3 rounded-xl bg-white/10 dark:bg-neutral-700/50 backdrop-blur-sm text-center">
                    <div className="text-xs text-neutral-300">Sales Tax</div>
                    <div className="text-lg sm:text-xl font-bold text-white">
                      {formatCurrency(result1.taxAmount, currency)}
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <ResultCard
                  label="Original Retail Price"
                  value={formatCurrency(result1.original, currency)}
                  subtitle="Before discount applied"
                  variant="neutral"
                  copyable
                />
                <ResultCard
                  label="Price After Discount"
                  value={formatCurrency(result1.priceAfterDiscount, currency)}
                  subtitle="Subtotal before sales tax"
                  variant="blue"
                  copyable
                />
                <ResultCard
                  label="Total Money Saved"
                  value={formatCurrency(result1.discountAmount, currency)}
                  subtitle={`${result1.discountPct}% markdown savings`}
                  variant="emerald"
                  copyable
                />
              </div>

              <FormulaBox
                formula="Final Price = (Original Price - Discount Amount) + Sales Tax"
                substitution={`${formatCurrency(result1.original, currency)} - ${formatCurrency(result1.discountAmount, currency)} + ${formatCurrency(result1.taxAmount, currency)} = ${formatCurrency(result1.finalPrice, currency)}`}
              />
            </div>
          )}
        </div>
      )}

      {/* Mode 2: Discount % from Price */}
      {mode === 'discount-from-price' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <CalculatorInput
              label="Original Price"
              value={m2Original}
              onChange={setM2Original}
              prefix={currencies.find((c) => c.code === currency)?.symbol || '$'}
              placeholder="e.g. 150"
            />
            <CalculatorInput
              label="Sale / Clearance Price"
              value={m2Sale}
              onChange={setM2Sale}
              prefix={currencies.find((c) => c.code === currency)?.symbol || '$'}
              placeholder="e.g. 105"
            />
          </div>

          {result2.error && <ValidationAlert message={result2.error} />}

          {!result2.error && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <ResultCard
                  label="Discount Percentage"
                  value={`${formatPercent(result2.discountPct, 2)} OFF`}
                  subtitle={`Total markdown from original price`}
                  variant="emerald"
                  icon={Tag}
                  copyable
                />
                <ResultCard
                  label="You Save"
                  value={formatCurrency(result2.savings, currency)}
                  subtitle={`Direct price reduction`}
                  variant="blue"
                  copyable
                />
              </div>

              <FormulaBox
                formula="Discount % = ((Original Price - Sale Price) ÷ Original Price) × 100"
                substitution={`((${formatCurrency(result2.original, currency)} - ${formatCurrency(result2.sale, currency)}) ÷ ${formatCurrency(result2.original, currency)}) × 100 = ${formatPercent(result2.discountPct, 2)} OFF`}
              />
            </div>
          )}
        </div>
      )}

      {/* Mode 3: Stacked Discounts */}
      {mode === 'stacked-discount' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <CalculatorInput
              label="Original Price"
              value={m3Original}
              onChange={setM3Original}
              prefix={currencies.find((c) => c.code === currency)?.symbol || '$'}
              placeholder="e.g. 200"
            />
            <CalculatorInput
              label="Primary Discount"
              value={m3Discount1}
              onChange={setM3Discount1}
              suffix="%"
              placeholder="e.g. 20"
              helperText="Storewide discount or sale"
            />
            <CalculatorInput
              label="Extra Promo / Coupon"
              value={m3Discount2}
              onChange={setM3Discount2}
              suffix="%"
              placeholder="e.g. 10"
              helperText="VIP or member promo code"
            />
          </div>

          {result3.error && <ValidationAlert message={result3.error} />}

          {!result3.error && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <ResultCard
                  label="Final Stacked Price"
                  value={formatCurrency(result3.finalPrice, currency)}
                  subtitle="After applying both discounts successively"
                  variant="emerald"
                  copyable
                />
                <ResultCard
                  label="Total Dollar Savings"
                  value={formatCurrency(result3.totalSavings, currency)}
                  subtitle="Combined savings"
                  variant="blue"
                  copyable
                />
                <ResultCard
                  label="Effective Discount Rate"
                  value={formatPercent(result3.effectiveDiscountPct, 2)}
                  subtitle={`Not simply ${parseFloat(m3Discount1) + parseFloat(m3Discount2)}% (compounds sequentially)`}
                  variant="amber"
                  copyable
                />
              </div>

              <FormulaBox
                formula="Final Price = Original × (1 - D1%) × (1 - D2%)"
                explanation="Stacked discounts do not simply add together. The second discount is calculated on the already discounted subtotal."
                substitution={`${formatCurrency(result3.original, currency)} × (1 - ${result3.d1}%) × (1 - ${result3.d2}%) = ${formatCurrency(result3.finalPrice, currency)}`}
              />
            </div>
          )}
        </div>
      )}

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
              <span>Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copy Discount Summary</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
