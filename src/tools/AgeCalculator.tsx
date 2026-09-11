import React, { useState, useMemo } from 'react';
import { Calendar, Clock, Gift, Heart, RotateCcw, Copy, Check, Sparkles } from 'lucide-react';
import { CalculatorInput } from '../components/calculator/CalculatorInput';
import { ResultCard } from '../components/calculator/ResultCard';
import { ValidationAlert } from '../components/calculator/ValidationAlert';
import { formatNumber } from '../lib/formatters';

export const AgeCalculator: React.FC = () => {
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);
  const [birthDate, setBirthDate] = useState('2000-01-15');
  const [targetDate, setTargetDate] = useState(todayStr);
  const [copied, setCopied] = useState(false);

  // Accurate calendar calculation accounting for leap years and variable month lengths
  const calculation = useMemo(() => {
    if (!birthDate) {
      return { error: 'Please enter your date of birth.' };
    }
    if (!targetDate) {
      return { error: 'Please enter an "as of" target date.' };
    }

    const [bY, bM, bD] = birthDate.split('-').map(Number);
    const [tY, tM, tD] = targetDate.split('-').map(Number);

    const bDate = new Date(Date.UTC(bY, bM - 1, bD, 0, 0, 0));
    const tDate = new Date(Date.UTC(tY, tM - 1, tD, 0, 0, 0));

    if (isNaN(bDate.getTime()) || isNaN(tDate.getTime())) {
      return { error: 'Invalid date format provided.' };
    }

    if (tDate < bDate) {
      return {
        error: 'Date of birth cannot be in the future relative to the "as of" date.',
      };
    }

    // Chronological difference
    let years = tY - bY;
    let months = tM - bM;
    let days = tD - bD;

    if (days < 0) {
      months -= 1;
      // Days in the month prior to the target date
      const daysInPrevMonth = new Date(Date.UTC(tY, tM - 1, 0)).getUTCDate();
      days += daysInPrevMonth;
    }

    if (months < 0) {
      years -= 1;
      months += 12;
    }

    // Total units lived
    const diffMs = tDate.getTime() - bDate.getTime();
    const totalDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const totalWeeks = Math.floor(totalDays / 7);
    const totalMonths = years * 12 + months;
    const totalHours = totalDays * 24;
    const totalMinutes = totalHours * 60;

    // Upcoming birthday calculation
    let nextBday = new Date(Date.UTC(tY, bM - 1, bD, 0, 0, 0));
    // If birth was Feb 29 and next year is not a leap year, celebrate on March 1st
    if (bM === 2 && bD === 29) {
      const isLeap = (tY % 4 === 0 && tY % 100 !== 0) || tY % 400 === 0;
      if (!isLeap) {
        nextBday = new Date(Date.UTC(tY, 2, 1, 0, 0, 0));
      }
    }

    if (nextBday < tDate) {
      const nextYear = tY + 1;
      nextBday = new Date(Date.UTC(nextYear, bM - 1, bD, 0, 0, 0));
      if (bM === 2 && bD === 29) {
        const isNextLeap = (nextYear % 4 === 0 && nextYear % 100 !== 0) || nextYear % 400 === 0;
        if (!isNextLeap) {
          nextBday = new Date(Date.UTC(nextYear, 2, 1, 0, 0, 0));
        }
      }
    }

    const nextBdayDiffMs = nextBday.getTime() - tDate.getTime();
    const nextBirthdayDays = Math.ceil(nextBdayDiffMs / (1000 * 60 * 60 * 24));
    const nextBdayWeekday = new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      timeZone: 'UTC',
    }).format(nextBday);

    return {
      error: null,
      years,
      months,
      days,
      totalMonths,
      totalWeeks,
      totalDays,
      totalHours,
      totalMinutes,
      nextBirthdayDays,
      nextBdayWeekday,
    };
  }, [birthDate, targetDate]);

  const handleReset = () => {
    setBirthDate('2000-01-15');
    setTargetDate(todayStr);
  };

  const handleCopy = () => {
    if (!calculation || calculation.error) return;
    const summary = `Age Calculation Report:
Exact Age: ${calculation.years} years, ${calculation.months} months, ${calculation.days} days
Total Months: ${formatNumber(calculation.totalMonths)}
Total Weeks: ${formatNumber(calculation.totalWeeks)}
Total Days: ${formatNumber(calculation.totalDays)}
Total Hours: ${formatNumber(calculation.totalHours)}
Next Birthday: in ${calculation.nextBirthdayDays} days (${calculation.nextBdayWeekday})
Calculated on ToolNest.`;

    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(summary);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Input controls bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 mb-1.5">
            Date of Birth
          </label>
          <input
            type="date"
            value={birthDate}
            onChange={(e) => setBirthDate(e.target.value)}
            className="w-full rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 px-3.5 py-2.5 text-sm font-medium text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all shadow-sm"
          />
          <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
            Select the day you were born
          </p>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 mb-1.5">
            Age As Of (Target Date)
          </label>
          <input
            type="date"
            value={targetDate}
            onChange={(e) => setTargetDate(e.target.value)}
            className="w-full rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 px-3.5 py-2.5 text-sm font-medium text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all shadow-sm"
          />
          <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
            Defaults to today, or choose any future or past date
          </p>
        </div>
      </div>

      {/* Action buttons: Reset & Copy */}
      <div className="flex items-center justify-between gap-3 pt-2">
        <button
          type="button"
          onClick={handleReset}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Dates</span>
        </button>

        {calculation && !calculation.error && (
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
                <span>Copy Summary</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* Error state */}
      {calculation.error && <ValidationAlert message={calculation.error} />}

      {/* Results view */}
      {!calculation.error && (
        <div className="space-y-5 animate-in fade-in duration-200">
          {/* Main Hero Card */}
          <div className="rounded-2xl bg-neutral-900 text-white dark:bg-neutral-800/90 p-6 sm:p-8 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm">
            <div>
              <span className="text-xs uppercase font-bold tracking-wider text-emerald-400">
                Exact Chronological Age
              </span>
              <div className="mt-2 flex items-baseline gap-2 flex-wrap justify-center sm:justify-start">
                <span className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white">
                  {calculation.years}
                </span>
                <span className="text-base text-neutral-300 font-medium">years,</span>
                <span className="text-3xl sm:text-4xl font-bold text-white">
                  {calculation.months}
                </span>
                <span className="text-base text-neutral-300 font-medium">months,</span>
                <span className="text-3xl sm:text-4xl font-bold text-white">
                  {calculation.days}
                </span>
                <span className="text-base text-neutral-300 font-medium">days</span>
              </div>
            </div>

            <div className="flex items-center gap-3.5 px-5 py-3.5 rounded-xl bg-white/10 dark:bg-neutral-700/50 backdrop-blur-sm flex-shrink-0">
              <Gift className="w-7 h-7 text-amber-300" />
              <div className="text-left">
                <div className="text-xs text-neutral-300">Next Birthday In</div>
                <div className="text-lg font-bold text-white">
                  {calculation.nextBirthdayDays}{' '}
                  {calculation.nextBirthdayDays === 1 ? 'day' : 'days'}
                </div>
                <div className="text-[11px] text-neutral-400">
                  on {calculation.nextBdayWeekday}
                </div>
              </div>
            </div>
          </div>

          {/* Breakdown stat grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <ResultCard
              label="Total Months"
              value={formatNumber(calculation.totalMonths)}
              subtitle="Cumulative months lived"
              variant="neutral"
              copyable
            />
            <ResultCard
              label="Total Weeks"
              value={formatNumber(calculation.totalWeeks)}
              subtitle="Full elapsed weeks"
              variant="neutral"
              copyable
            />
            <ResultCard
              label="Total Days"
              value={formatNumber(calculation.totalDays)}
              subtitle="Days on Earth"
              variant="emerald"
              copyable
            />
            <ResultCard
              label="Total Hours"
              value={formatNumber(calculation.totalHours)}
              subtitle="Hours lived"
              variant="blue"
              copyable
            />
          </div>
        </div>
      )}
    </div>
  );
};
