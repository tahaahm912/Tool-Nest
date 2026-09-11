import React, { useState, useEffect, useMemo } from 'react';
import {
  ArrowLeftRight,
  RefreshCw,
  Coins,
  Copy,
  Check,
  RotateCcw,
  TrendingUp,
  Search,
  Globe,
  CheckCircle2,
} from 'lucide-react';
import {
  currencyService,
  SUPPORTED_CURRENCIES,
  convertCurrency,
  RatesResult,
  CurrencyInfo,
} from '../lib/services/currency';
import { formatNumber, parseNumericInput } from '../lib/formatters';
import { ResultCard } from '../components/calculator/ResultCard';
import { ValidationAlert } from '../components/calculator/ValidationAlert';

export const CurrencyConverter: React.FC = () => {
  const [amount, setAmount] = useState('100');
  const [fromCurrency, setFromCurrency] = useState('USD');
  const [toCurrency, setToCurrency] = useState('EUR');
  const [ratesData, setRatesData] = useState<RatesResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [searchFrom, setSearchFrom] = useState('');
  const [searchTo, setSearchTo] = useState('');

  const fetchRates = async (base: string) => {
    setIsLoading(true);
    try {
      const data = await currencyService.getRates(base);
      setRatesData(data);
    } catch {
      // Fallback is handled inside currencyService
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRates(fromCurrency);
  }, [fromCurrency]);

  const handleSwap = () => {
    const prevFrom = fromCurrency;
    const prevTo = toCurrency;
    setFromCurrency(prevTo);
    setToCurrency(prevFrom);
  };

  const calculation = useMemo(() => {
    const num = parseNumericInput(amount);
    if (num === null || num < 0) {
      return { error: 'Please enter a valid amount (0 or greater).' };
    }

    if (!ratesData || !ratesData.rates) {
      return { error: 'Loading exchange rates...' };
    }

    const converted = convertCurrency(
      num,
      fromCurrency,
      toCurrency,
      ratesData.rates,
      ratesData.base
    );

    // Unit rate (1 from = ? to)
    const unitRate = convertCurrency(1, fromCurrency, toCurrency, ratesData.rates, ratesData.base);
    // Inverse rate (1 to = ? from)
    const inverseRate = unitRate > 0 ? 1 / unitRate : 0;

    return {
      error: null,
      amount: num,
      converted,
      unitRate,
      inverseRate,
    };
  }, [amount, fromCurrency, toCurrency, ratesData]);

  const fromInfo = useMemo(
    () => SUPPORTED_CURRENCIES.find((c) => c.code === fromCurrency) || {
      code: fromCurrency,
      name: fromCurrency,
      symbol: '$',
      flag: '🌐',
    },
    [fromCurrency]
  );

  const toInfo = useMemo(
    () => SUPPORTED_CURRENCIES.find((c) => c.code === toCurrency) || {
      code: toCurrency,
      name: toCurrency,
      symbol: '€',
      flag: '🌐',
    },
    [toCurrency]
  );

  const handleReset = () => {
    setAmount('100');
    setFromCurrency('USD');
    setToCurrency('EUR');
  };

  const handleCopy = () => {
    if (!calculation || calculation.error) return;
    const summary = `${amount} ${fromCurrency} (${fromInfo.name}) = ${formatNumber(calculation.converted, { minDecimals: 2, maxDecimals: 4 })} ${toCurrency} (${toInfo.name})
Exchange Rate: 1 ${fromCurrency} = ${calculation.unitRate.toFixed(4)} ${toCurrency}
Inverse: 1 ${toCurrency} = ${calculation.inverseRate.toFixed(4)} ${fromCurrency}
Source: ${ratesData?.provider || 'ToolNest Forex Rates'} (${ratesData?.lastUpdated || 'Current'})
Calculated on ToolNest.`;

    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(summary);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const popularCurrencies = ['USD', 'EUR', 'GBP', 'JPY', 'INR', 'CAD', 'AUD', 'CHF'];

  // Common denominations for quick conversion reference
  const quickAmounts = [1, 5, 10, 25, 50, 100, 500, 1000];

  return (
    <div className="space-y-6">
      {/* Popular Quick Pairs Header */}
      <div className="flex items-center justify-between gap-3 p-3 rounded-xl bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 flex-wrap">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300">
          <Coins className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>Popular Currencies:</span>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          {popularCurrencies.map((code) => (
            <button
              key={code}
              type="button"
              onClick={() => {
                if (fromCurrency === code) {
                  setToCurrency(code === 'USD' ? 'EUR' : 'USD');
                } else {
                  setToCurrency(code);
                }
              }}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                toCurrency === code
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700 hover:text-neutral-900'
              }`}
            >
              {code}
            </button>
          ))}
        </div>
      </div>

      {/* Main Converter Card */}
      <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/30 p-5 sm:p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-11 gap-4 items-center">
          {/* Amount input */}
          <div className="md:col-span-4 space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300">
              Amount to Convert
            </label>
            <div className="relative rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 shadow-sm focus-within:ring-2 focus-within:ring-emerald-500/30 focus-within:border-emerald-500 overflow-hidden">
              <span className="absolute left-3.5 top-2.5 text-sm font-bold text-neutral-400">
                {fromInfo.symbol}
              </span>
              <input
                type="number"
                min="0"
                step="any"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="100"
                className="w-full pl-9 pr-3.5 py-2.5 text-base font-bold text-neutral-900 dark:text-white bg-transparent focus:outline-none"
              />
            </div>
          </div>

          {/* From Currency Selector */}
          <div className="md:col-span-3 space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300">
              From Currency
            </label>
            <div className="relative">
              <select
                value={fromCurrency}
                onChange={(e) => setFromCurrency(e.target.value)}
                className="w-full rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 px-3 py-2.5 text-sm font-semibold text-neutral-900 dark:text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
              >
                {SUPPORTED_CURRENCIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.flag} {c.code} - {c.name} ({c.symbol})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Swap Button */}
          <div className="md:col-span-1 flex justify-center pt-5">
            <button
              type="button"
              onClick={handleSwap}
              title="Swap Currencies"
              className="p-3 rounded-full border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-200 hover:bg-emerald-50 hover:text-emerald-600 dark:hover:bg-neutral-700 shadow-sm transition-all active:scale-95"
            >
              <ArrowLeftRight className="w-4 h-4" />
            </button>
          </div>

          {/* To Currency Selector */}
          <div className="md:col-span-3 space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300">
              To Currency
            </label>
            <div className="relative">
              <select
                value={toCurrency}
                onChange={(e) => setToCurrency(e.target.value)}
                className="w-full rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 px-3 py-2.5 text-sm font-semibold text-neutral-900 dark:text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
              >
                {SUPPORTED_CURRENCIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.flag} {c.code} - {c.name} ({c.symbol})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {calculation.error && <ValidationAlert message={calculation.error} />}

      {/* Results View */}
      {!calculation.error && (
        <div className="space-y-5 animate-in fade-in duration-200">
          {/* Main Converted Amount Hero Card */}
          <div className="rounded-2xl bg-neutral-900 text-white dark:bg-neutral-800/90 p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm">
            <div>
              <span className="text-xs uppercase font-bold tracking-wider text-neutral-400">
                {amount} {fromInfo.code} ({fromInfo.name}) =
              </span>
              <div className="mt-1 flex items-baseline gap-2 flex-wrap">
                <span className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white">
                  {toInfo.symbol}
                  {formatNumber(calculation.converted, {
                    minDecimals: 2,
                    maxDecimals: 2,
                  })}
                </span>
                <span className="text-xl sm:text-2xl font-bold text-emerald-400">
                  {toInfo.code}
                </span>
              </div>
              <div className="mt-3 flex items-center gap-3 text-xs text-neutral-300 font-medium">
                <span>
                  1 {fromCurrency} = {calculation.unitRate.toFixed(4)} {toCurrency}
                </span>
                <span>•</span>
                <span>
                  1 {toCurrency} = {calculation.inverseRate.toFixed(4)} {fromCurrency}
                </span>
              </div>
            </div>

            <div className="flex flex-col items-end gap-2 text-right">
              <button
                type="button"
                onClick={() => fetchRates(fromCurrency)}
                disabled={isLoading}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-semibold text-white backdrop-blur-sm transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                <span>{isLoading ? 'Updating...' : 'Refresh Rates'}</span>
              </button>
              <span className="text-[11px] text-neutral-400">
                Source: {ratesData?.provider}
              </span>
              <span className="text-[11px] text-neutral-500">
                Updated: {ratesData?.lastUpdated}
              </span>
            </div>
          </div>

          {/* Quick Conversion Matrix */}
          <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-5 shadow-sm space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300">
              Quick Conversion Benchmark ({fromCurrency} to {toCurrency})
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
              {quickAmounts.map((amt) => {
                const convertedAmt = amt * calculation.unitRate;
                return (
                  <div
                    key={amt}
                    className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200/60 dark:border-neutral-700/60 flex flex-col justify-between"
                  >
                    <span className="font-semibold text-neutral-500 dark:text-neutral-400">
                      {fromInfo.symbol}{amt} {fromCurrency}
                    </span>
                    <span className="text-sm font-bold text-neutral-900 dark:text-white mt-1">
                      {toInfo.symbol}
                      {formatNumber(convertedAmt, { minDecimals: 2, maxDecimals: 2 })} {toCurrency}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
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
          <span>Reset Converter</span>
        </button>

        {!calculation.error && (
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Conversion Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Result</span>
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
};
