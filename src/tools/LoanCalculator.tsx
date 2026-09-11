import React, { useState, useMemo } from 'react';
import {
  BadgeDollarSign,
  PieChart,
  Calendar,
  RotateCcw,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  Download,
} from 'lucide-react';
import { CalculatorInput } from '../components/calculator/CalculatorInput';
import { ResultCard } from '../components/calculator/ResultCard';
import { ValidationAlert } from '../components/calculator/ValidationAlert';
import { FormulaBox } from '../components/calculator/FormulaBox';
import { formatCurrency, formatNumber, formatPercent, parseNumericInput } from '../lib/formatters';

interface AmortizationRow {
  month: number;
  payment: number;
  principal: number;
  interest: number;
  balance: number;
}

export const LoanCalculator: React.FC = () => {
  const [currency, setCurrency] = useState('USD');
  const [principal, setPrincipal] = useState('250000');
  const [annualRate, setAnnualRate] = useState('6.5');
  const [termValue, setTermValue] = useState('30');
  const [termUnit, setTermUnit] = useState<'years' | 'months'>('years');
  const [showSchedule, setShowSchedule] = useState(false);
  const [scheduleView, setScheduleView] = useState<'yearly' | 'monthly'>('yearly');
  const [copied, setCopied] = useState(false);

  const currencies = [
    { code: 'USD', symbol: '$' },
    { code: 'EUR', symbol: '€' },
    { code: 'GBP', symbol: '£' },
    { code: 'INR', symbol: '₹' },
    { code: 'JPY', symbol: '¥' },
    { code: 'CAD', symbol: 'CA$' },
    { code: 'AUD', symbol: 'A$' },
  ];

  const calculation = useMemo(() => {
    const P = parseNumericInput(principal);
    const R = parseNumericInput(annualRate);
    const T = parseNumericInput(termValue);

    if (P === null || P <= 0) {
      return { error: 'Please enter a valid loan amount greater than zero.' };
    }
    if (R === null || R < 0) {
      return { error: 'Please enter a valid interest rate (0% or greater).' };
    }
    if (T === null || T <= 0) {
      return { error: 'Please enter a loan term greater than zero.' };
    }

    const n = termUnit === 'years' ? Math.round(T * 12) : Math.round(T);
    if (n <= 0) {
      return { error: 'Loan term must be at least 1 month.' };
    }

    let monthlyPayment = 0;
    const r = R / 12 / 100; // monthly rate

    if (R === 0) {
      // 0% interest zero-apr loan
      monthlyPayment = P / n;
    } else {
      // Standard amortized loan formula
      const compound = Math.pow(1 + r, n);
      monthlyPayment = (P * r * compound) / (compound - 1);
    }

    const totalPayment = monthlyPayment * n;
    const totalInterest = Math.max(0, totalPayment - P);
    const principalShare = (P / totalPayment) * 100;
    const interestShare = (totalInterest / totalPayment) * 100;

    // Generate monthly schedule
    let remainingBalance = P;
    const monthlySchedule: AmortizationRow[] = [];

    for (let m = 1; m <= n; m++) {
      const interestForMonth = R === 0 ? 0 : remainingBalance * r;
      let principalForMonth = monthlyPayment - interestForMonth;

      if (m === n || principalForMonth > remainingBalance) {
        principalForMonth = remainingBalance;
        remainingBalance = 0;
      } else {
        remainingBalance -= principalForMonth;
      }

      monthlySchedule.push({
        month: m,
        payment: principalForMonth + interestForMonth,
        principal: principalForMonth,
        interest: interestForMonth,
        balance: Math.max(0, remainingBalance),
      });

      if (remainingBalance <= 0) break;
    }

    // Generate yearly aggregation
    const yearlySchedule: {
      year: number;
      principal: number;
      interest: number;
      balance: number;
    }[] = [];

    let currentYearPrincipal = 0;
    let currentYearInterest = 0;

    monthlySchedule.forEach((row) => {
      currentYearPrincipal += row.principal;
      currentYearInterest += row.interest;

      if (row.month % 12 === 0 || row.month === monthlySchedule.length) {
        const yr = Math.ceil(row.month / 12);
        yearlySchedule.push({
          year: yr,
          principal: currentYearPrincipal,
          interest: currentYearInterest,
          balance: row.balance,
        });
        currentYearPrincipal = 0;
        currentYearInterest = 0;
      }
    });

    return {
      error: null,
      monthlyPayment,
      totalPayment,
      totalInterest,
      principalShare,
      interestShare,
      totalMonths: n,
      monthlySchedule,
      yearlySchedule,
    };
  }, [principal, annualRate, termValue, termUnit]);

  const handleReset = () => {
    setPrincipal('250000');
    setAnnualRate('6.5');
    setTermValue('30');
    setTermUnit('years');
  };

  const handleCopy = () => {
    if (!calculation || calculation.error) return;
    const summary = `EMI / Loan Calculation Summary:
Loan Amount: ${formatCurrency(principal, currency)}
Annual Interest Rate: ${annualRate}%
Loan Term: ${termValue} ${termUnit} (${calculation.totalMonths} months)
Monthly EMI Payment: ${formatCurrency(calculation.monthlyPayment, currency)}
Total Interest Payable: ${formatCurrency(calculation.totalInterest, currency)}
Total Overall Payment: ${formatCurrency(calculation.totalPayment, currency)}
Principal / Interest Breakdown: ${formatPercent(calculation.principalShare, 1)} Principal / ${formatPercent(calculation.interestShare, 1)} Interest
Calculated on ToolNest.`;

    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(summary);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const downloadCsv = () => {
    if (!calculation || calculation.error || !calculation.monthlySchedule) return;
    const headers = ['Month', 'Monthly Payment', 'Principal Paid', 'Interest Paid', 'Remaining Balance'];
    const rows = calculation.monthlySchedule.map((r) => [
      r.month,
      r.payment.toFixed(2),
      r.principal.toFixed(2),
      r.interest.toFixed(2),
      r.balance.toFixed(2),
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `amortization_schedule_${principal}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Currency & Unit Selector Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
        <div className="flex items-center gap-2">
          <BadgeDollarSign className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span className="text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300">
            Currency:
          </span>
          <div className="flex items-center gap-1">
            {currencies.map((c) => (
              <button
                key={c.code}
                type="button"
                onClick={() => setCurrency(c.code)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                  currency === c.code
                    ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-sm border border-neutral-200 dark:border-neutral-700'
                    : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900'
                }`}
              >
                {c.symbol} {c.code}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Input parameters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <CalculatorInput
          label="Loan Amount (Principal)"
          value={principal}
          onChange={setPrincipal}
          prefix={currencies.find((c) => c.code === currency)?.symbol || '$'}
          placeholder="e.g. 250000"
        />

        <CalculatorInput
          label="Annual Interest Rate"
          value={annualRate}
          onChange={setAnnualRate}
          suffix="%"
          step="0.05"
          placeholder="e.g. 6.5"
        />

        <div className="space-y-1.5">
          <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-700 dark:text-neutral-300">
            Loan Tenure
          </label>
          <div className="flex rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 shadow-sm overflow-hidden focus-within:ring-2 focus-within:ring-emerald-500/30 focus-within:border-emerald-500">
            <input
              type="number"
              min="1"
              max="600"
              value={termValue}
              onChange={(e) => setTermValue(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm font-medium text-neutral-900 dark:text-neutral-100 bg-transparent focus:outline-none"
            />
            <div className="flex items-center bg-neutral-100 dark:bg-neutral-900 border-l border-neutral-200 dark:border-neutral-800 p-1">
              <button
                type="button"
                onClick={() => setTermUnit('years')}
                className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
                  termUnit === 'years'
                    ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-sm'
                    : 'text-neutral-500 hover:text-neutral-900'
                }`}
              >
                Yrs
              </button>
              <button
                type="button"
                onClick={() => setTermUnit('months')}
                className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
                  termUnit === 'months'
                    ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-sm'
                    : 'text-neutral-500 hover:text-neutral-900'
                }`}
              >
                Mos
              </button>
            </div>
          </div>
        </div>
      </div>

      {calculation.error && <ValidationAlert message={calculation.error} />}

      {/* Results Section */}
      {!calculation.error && (
        <div className="space-y-5 animate-in fade-in duration-200">
          {/* Main EMI Card */}
          <div className="rounded-2xl bg-neutral-900 text-white dark:bg-neutral-800/90 p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm">
            <div>
              <span className="text-xs uppercase font-bold tracking-wider text-emerald-400">
                Monthly EMI Installment
              </span>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white">
                  {formatCurrency(calculation.monthlyPayment, currency)}
                </span>
                <span className="text-sm text-neutral-400 font-medium">/ month</span>
              </div>
              <p className="mt-2 text-xs text-neutral-300">
                Total duration: {calculation.totalMonths} monthly payments ({termValue} {termUnit})
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 w-full sm:w-auto flex-shrink-0">
              <div className="px-4 py-3 rounded-xl bg-white/10 dark:bg-neutral-700/50 backdrop-blur-sm text-center">
                <div className="text-xs text-neutral-300">Total Interest</div>
                <div className="text-lg sm:text-xl font-bold text-amber-300">
                  {formatCurrency(calculation.totalInterest, currency)}
                </div>
              </div>
              <div className="px-4 py-3 rounded-xl bg-white/10 dark:bg-neutral-700/50 backdrop-blur-sm text-center">
                <div className="text-xs text-neutral-300">Total Payment</div>
                <div className="text-lg sm:text-xl font-bold text-white">
                  {formatCurrency(calculation.totalPayment, currency)}
                </div>
              </div>
            </div>
          </div>

          {/* Visual Breakdown Bar: Principal vs Interest */}
          <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/40 p-5 space-y-3">
            <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-emerald-600" />
                <span>Principal: {formatPercent(calculation.principalShare, 1)} ({formatCurrency(principal, currency)})</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-amber-500" />
                <span>Interest: {formatPercent(calculation.interestShare, 1)} ({formatCurrency(calculation.totalInterest, currency)})</span>
              </div>
            </div>

            {/* Split Progress Bar */}
            <div className="w-full h-4 rounded-full bg-neutral-200 dark:bg-neutral-800 flex overflow-hidden">
              <div
                style={{ width: `${calculation.principalShare}%` }}
                className="h-full bg-emerald-600 transition-all duration-300"
                title={`Principal: ${formatPercent(calculation.principalShare, 1)}`}
              />
              <div
                style={{ width: `${calculation.interestShare}%` }}
                className="h-full bg-amber-500 transition-all duration-300"
                title={`Interest: ${formatPercent(calculation.interestShare, 1)}`}
              />
            </div>
          </div>

          {/* Amortization Schedule Drawer */}
          <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 overflow-hidden shadow-sm">
            <div className="p-4 bg-neutral-50/70 dark:bg-neutral-900/60 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setShowSchedule(!showSchedule)}
                className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-neutral-800 dark:text-neutral-200 hover:text-emerald-600 transition-colors"
              >
                <span>Amortization Schedule</span>
                {showSchedule ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </button>

              {showSchedule && (
                <div className="flex items-center gap-2">
                  <div className="inline-flex rounded-lg p-1 bg-neutral-200/60 dark:bg-neutral-800 text-xs">
                    <button
                      type="button"
                      onClick={() => setScheduleView('yearly')}
                      className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
                        scheduleView === 'yearly'
                          ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-sm'
                          : 'text-neutral-600 dark:text-neutral-400'
                      }`}
                    >
                      Yearly Summary
                    </button>
                    <button
                      type="button"
                      onClick={() => setScheduleView('monthly')}
                      className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
                        scheduleView === 'monthly'
                          ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-sm'
                          : 'text-neutral-600 dark:text-neutral-400'
                      }`}
                    >
                      Monthly Breakdown
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={downloadCsv}
                    title="Export Schedule as CSV"
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>CSV</span>
                  </button>
                </div>
              )}
            </div>

            {showSchedule && (
              <div className="max-h-96 overflow-y-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead className="sticky top-0 bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 font-bold uppercase tracking-wider">
                    <tr>
                      <th className="py-2.5 px-4">{scheduleView === 'yearly' ? 'Year' : 'Month'}</th>
                      {scheduleView === 'monthly' && <th className="py-2.5 px-4">EMI Payment</th>}
                      <th className="py-2.5 px-4">Principal Paid</th>
                      <th className="py-2.5 px-4">Interest Paid</th>
                      <th className="py-2.5 px-4 text-right">Remaining Balance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800 text-neutral-800 dark:text-neutral-200 font-medium">
                    {scheduleView === 'yearly'
                      ? calculation.yearlySchedule.map((yr) => (
                          <tr key={yr.year} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50">
                            <td className="py-2.5 px-4 font-bold text-neutral-900 dark:text-white">
                              Year {yr.year}
                            </td>
                            <td className="py-2.5 px-4 text-emerald-600 dark:text-emerald-400 font-semibold">
                              {formatCurrency(yr.principal, currency)}
                            </td>
                            <td className="py-2.5 px-4 text-amber-600 dark:text-amber-400 font-semibold">
                              {formatCurrency(yr.interest, currency)}
                            </td>
                            <td className="py-2.5 px-4 text-right font-bold text-neutral-900 dark:text-white">
                              {formatCurrency(yr.balance, currency)}
                            </td>
                          </tr>
                        ))
                      : calculation.monthlySchedule.map((mo) => (
                          <tr key={mo.month} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50">
                            <td className="py-2.5 px-4 font-bold">Month {mo.month}</td>
                            <td className="py-2.5 px-4">{formatCurrency(mo.payment, currency)}</td>
                            <td className="py-2.5 px-4 text-emerald-600 dark:text-emerald-400">
                              {formatCurrency(mo.principal, currency)}
                            </td>
                            <td className="py-2.5 px-4 text-amber-600 dark:text-amber-400">
                              {formatCurrency(mo.interest, currency)}
                            </td>
                            <td className="py-2.5 px-4 text-right font-bold">
                              {formatCurrency(mo.balance, currency)}
                            </td>
                          </tr>
                        ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <FormulaBox
            formula="EMI = P × r × (1 + r)ⁿ ÷ ((1 + r)ⁿ - 1)"
            explanation="Where P = Principal Loan Amount, r = Monthly Interest Rate (Annual Rate ÷ 1200), and n = Total Number of Months."
            substitution={`P = ${formatCurrency(principal, currency)}, r = ${(parseFloat(annualRate) / 1200).toFixed(6)}, n = ${calculation.totalMonths}`}
          />
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
          <span>Reset Loan</span>
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
                <span>Summary Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Loan Summary</span>
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
};
