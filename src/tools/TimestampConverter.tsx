import React, { useState, useEffect, useMemo } from 'react';
import {
  Clock,
  Copy,
  Check,
  RotateCcw,
  Calendar,
  ArrowRightLeft,
  Pause,
  Play,
  Globe,
  Info
} from 'lucide-react';

export const TimestampConverter: React.FC = () => {
  // Live ticking current time
  const [currentMs, setCurrentMs] = useState<number>(() => Date.now());
  const [isPaused, setIsPaused] = useState<boolean>(false);

  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setCurrentMs(Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, [isPaused]);

  // Mode: Timestamp -> Date OR Date -> Timestamp
  const [activeTab, setActiveTab] = useState<'tsToDate' | 'dateToTs'>('tsToDate');

  // Tab 1 state: Timestamp -> Date
  const [tsInput, setTsInput] = useState<string>(() => Math.floor(Date.now() / 1000).toString());
  const [unit, setUnit] = useState<'auto' | 's' | 'ms'>('auto');

  // Tab 2 state: Date -> Timestamp
  const [datetimeInput, setDatetimeInput] = useState<string>(() => {
    const now = new Date();
    // YYYY-MM-DDTHH:mm
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`;
  });

  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Compute parsed date from timestamp
  const dateFromTimestamp = useMemo(() => {
    const clean = tsInput.trim();
    if (!clean) return null;
    const num = Number(clean);
    if (isNaN(num)) return null;

    let ms: number;
    if (unit === 's') {
      ms = num * 1000;
    } else if (unit === 'ms') {
      ms = num;
    } else {
      // Auto: if > 100 billion, assume ms, else seconds
      ms = Math.abs(num) > 1e11 ? num : num * 1000;
    }

    const d = new Date(ms);
    return isNaN(d.getTime()) ? null : d;
  }, [tsInput, unit]);

  // Compute timestamp from date input
  const tsFromDate = useMemo(() => {
    if (!datetimeInput) return null;
    const d = new Date(datetimeInput);
    if (isNaN(d.getTime())) return null;
    return {
      date: d,
      seconds: Math.floor(d.getTime() / 1000),
      milliseconds: d.getTime(),
    };
  }, [datetimeInput]);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1500);
  };

  const getRelativeTimeString = (targetDate: Date) => {
    const diffSec = Math.floor((targetDate.getTime() - currentMs) / 1000);
    const absSec = Math.abs(diffSec);

    let descriptor = '';
    if (absSec < 60) descriptor = `${absSec} second${absSec !== 1 ? 's' : ''}`;
    else if (absSec < 3600) descriptor = `${Math.floor(absSec / 60)} minute${Math.floor(absSec / 60) !== 1 ? 's' : ''}`;
    else if (absSec < 86400) descriptor = `${Math.floor(absSec / 3600)} hour${Math.floor(absSec / 3600) !== 1 ? 's' : ''}`;
    else descriptor = `${Math.floor(absSec / 86400)} day${Math.floor(absSec / 86400) !== 1 ? 's' : ''}`;

    if (diffSec > 0) return `in ${descriptor}`;
    if (diffSec < 0) return `${descriptor} ago`;
    return 'just now';
  };

  const getDayOfYear = (d: Date) => {
    const start = new Date(d.getFullYear(), 0, 0);
    const diff = d.getTime() - start.getTime() + ((start.getTimezoneOffset() - d.getTimezoneOffset()) * 60 * 1000);
    const oneDay = 1000 * 60 * 60 * 24;
    return Math.floor(diff / oneDay);
  };

  const isLeapYear = (year: number) => {
    return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
  };

  // Preset shortcuts for Date -> Timestamp
  const setPreset = (preset: 'now' | 'todayStart' | 'todayEnd' | 'monthStart' | 'yearStart') => {
    const now = new Date();
    const pad = (n: number) => n.toString().padStart(2, '0');
    let target = new Date();

    if (preset === 'now') {
      target = now;
    } else if (preset === 'todayStart') {
      target = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
    } else if (preset === 'todayEnd') {
      target = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
    } else if (preset === 'monthStart') {
      target = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0);
    } else if (preset === 'yearStart') {
      target = new Date(now.getFullYear(), 0, 1, 0, 0, 0);
    }

    setDatetimeInput(
      `${target.getFullYear()}-${pad(target.getMonth() + 1)}-${pad(target.getDate())}T${pad(target.getHours())}:${pad(target.getMinutes())}`
    );
  };

  return (
    <div className="space-y-6" id="timestamp-converter-tool">
      {/* Live Current Epoch Banner */}
      <div className="p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/70 dark:bg-neutral-900/50 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <Clock className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">
              Current Unix Epoch
            </div>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="font-mono text-xl font-bold text-neutral-900 dark:text-neutral-100">
                {Math.floor(currentMs / 1000)}
              </span>
              <span className="text-xs text-neutral-500 font-mono">
                ({currentMs} ms)
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsPaused(!isPaused)}
            className="p-2 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
            title={isPaused ? 'Resume live clock' : 'Pause clock'}
          >
            {isPaused ? <Play className="w-4 h-4 text-emerald-600" /> : <Pause className="w-4 h-4" />}
          </button>

          <button
            type="button"
            id="ts-copy-now-btn"
            onClick={() => copyToClipboard(Math.floor(currentMs / 1000).toString(), 'now')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-colors"
          >
            {copiedKey === 'now' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedKey === 'now' ? 'Copied' : 'Copy Timestamp'}</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-neutral-200 dark:border-neutral-800 pb-2">
        <button
          type="button"
          id="ts-tab-to-date"
          onClick={() => setActiveTab('tsToDate')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'tsToDate'
              ? 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 shadow-sm'
              : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Timestamp → Human Date</span>
        </button>

        <button
          type="button"
          id="ts-tab-to-ts"
          onClick={() => setActiveTab('dateToTs')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'dateToTs'
              ? 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 shadow-sm'
              : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>Human Date → Timestamp</span>
        </button>
      </div>

      {/* Tab 1: Timestamp to Date */}
      {activeTab === 'tsToDate' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-3">
            <div className="flex-1">
              <label htmlFor="ts-input-field" className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider mb-2">
                Unix Timestamp
              </label>
              <input
                id="ts-input-field"
                type="text"
                value={tsInput}
                onChange={(e) => setTsInput(e.target.value)}
                placeholder="Enter seconds or milliseconds (e.g. 1741528000)..."
                className="w-full rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 px-4 py-2.5 font-mono text-sm text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
              />
            </div>

            {/* Unit selector */}
            <div className="flex items-center gap-1 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-850 p-1 text-xs">
              <button
                type="button"
                onClick={() => setUnit('auto')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                  unit === 'auto' ? 'bg-emerald-600 text-white' : 'text-neutral-600 dark:text-neutral-400'
                }`}
              >
                Auto-Detect
              </button>
              <button
                type="button"
                onClick={() => setUnit('s')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                  unit === 's' ? 'bg-emerald-600 text-white' : 'text-neutral-600 dark:text-neutral-400'
                }`}
              >
                Seconds
              </button>
              <button
                type="button"
                onClick={() => setUnit('ms')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                  unit === 'ms' ? 'bg-emerald-600 text-white' : 'text-neutral-600 dark:text-neutral-400'
                }`}
              >
                Milliseconds
              </button>
            </div>

            <button
              type="button"
              onClick={() => setTsInput(Math.floor(Date.now() / 1000).toString())}
              className="px-3.5 py-2.5 rounded-xl text-xs font-semibold border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-850 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            >
              Use Current
            </button>
          </div>

          {/* Results Display */}
          {dateFromTimestamp ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
              <div className="p-3.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 flex items-center justify-between">
                <div>
                  <div className="text-[11px] text-neutral-400 uppercase font-semibold">Local Timezone</div>
                  <div className="font-mono text-sm font-semibold text-neutral-900 dark:text-neutral-100 mt-1">
                    {dateFromTimestamp.toString()}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => copyToClipboard(dateFromTimestamp.toString(), 'local')}
                  className="p-2 text-neutral-400 hover:text-emerald-600 transition-colors"
                >
                  {copiedKey === 'local' ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>

              <div className="p-3.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 flex items-center justify-between">
                <div>
                  <div className="text-[11px] text-neutral-400 uppercase font-semibold">UTC / GMT (RFC 7231)</div>
                  <div className="font-mono text-sm font-semibold text-neutral-900 dark:text-neutral-100 mt-1">
                    {dateFromTimestamp.toUTCString()}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => copyToClipboard(dateFromTimestamp.toUTCString(), 'utc')}
                  className="p-2 text-neutral-400 hover:text-emerald-600 transition-colors"
                >
                  {copiedKey === 'utc' ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>

              <div className="p-3.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 flex items-center justify-between">
                <div>
                  <div className="text-[11px] text-neutral-400 uppercase font-semibold">ISO 8601 Standard</div>
                  <div className="font-mono text-sm font-semibold text-neutral-900 dark:text-neutral-100 mt-1">
                    {dateFromTimestamp.toISOString()}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => copyToClipboard(dateFromTimestamp.toISOString(), 'iso')}
                  className="p-2 text-neutral-400 hover:text-emerald-600 transition-colors"
                >
                  {copiedKey === 'iso' ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>

              <div className="p-3.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 flex items-center justify-between">
                <div>
                  <div className="text-[11px] text-neutral-400 uppercase font-semibold">Relative Time</div>
                  <div className="font-mono text-sm font-semibold text-emerald-600 dark:text-emerald-400 mt-1">
                    {getRelativeTimeString(dateFromTimestamp)}
                  </div>
                </div>
                <span className="text-xs text-neutral-400">
                  Day {getDayOfYear(dateFromTimestamp)} of 365 {isLeapYear(dateFromTimestamp.getFullYear()) && '(Leap Year)'}
                </span>
              </div>
            </div>
          ) : (
            <div className="p-6 text-center text-xs text-neutral-400 border border-dashed rounded-xl">
              Please enter a valid numeric Unix timestamp above.
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Date to Timestamp */}
      {activeTab === 'dateToTs' && (
        <div className="space-y-4">
          <div>
            <label htmlFor="date-input-field" className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider mb-2">
              Select Calendar Date & Time
            </label>
            <input
              id="date-input-field"
              type="datetime-local"
              value={datetimeInput}
              onChange={(e) => setDatetimeInput(e.target.value)}
              className="w-full sm:w-auto rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 px-4 py-2.5 font-mono text-sm text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
            />
          </div>

          {/* Quick preset chips */}
          <div className="flex items-center gap-2 flex-wrap text-xs">
            <span className="text-neutral-500">Quick Shortcuts:</span>
            <button
              type="button"
              onClick={() => setPreset('now')}
              className="px-2.5 py-1 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-850 hover:bg-neutral-100 dark:hover:bg-neutral-800"
            >
              Now
            </button>
            <button
              type="button"
              onClick={() => setPreset('todayStart')}
              className="px-2.5 py-1 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-850 hover:bg-neutral-100 dark:hover:bg-neutral-800"
            >
              Start of Today (00:00)
            </button>
            <button
              type="button"
              onClick={() => setPreset('todayEnd')}
              className="px-2.5 py-1 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-850 hover:bg-neutral-100 dark:hover:bg-neutral-800"
            >
              End of Today (23:59)
            </button>
            <button
              type="button"
              onClick={() => setPreset('monthStart')}
              className="px-2.5 py-1 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-850 hover:bg-neutral-100 dark:hover:bg-neutral-800"
            >
              Start of Month
            </button>
            <button
              type="button"
              onClick={() => setPreset('yearStart')}
              className="px-2.5 py-1 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-850 hover:bg-neutral-100 dark:hover:bg-neutral-800"
            >
              Start of Year
            </button>
          </div>

          {/* Calculated Output */}
          {tsFromDate ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 flex items-center justify-between">
                <div>
                  <div className="text-[11px] font-semibold text-neutral-400 uppercase">Unix Epoch (Seconds)</div>
                  <div className="font-mono text-lg font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                    {tsFromDate.seconds}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => copyToClipboard(tsFromDate.seconds.toString(), 'tsSec')}
                  className="p-2 text-neutral-400 hover:text-emerald-600 transition-colors"
                >
                  {copiedKey === 'tsSec' ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>

              <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 flex items-center justify-between">
                <div>
                  <div className="text-[11px] font-semibold text-neutral-400 uppercase">Unix Epoch (Milliseconds)</div>
                  <div className="font-mono text-lg font-bold text-neutral-900 dark:text-neutral-100 mt-1">
                    {tsFromDate.milliseconds}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => copyToClipboard(tsFromDate.milliseconds.toString(), 'tsMs')}
                  className="p-2 text-neutral-400 hover:text-emerald-600 transition-colors"
                >
                  {copiedKey === 'tsMs' ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>
          ) : (
            <div className="p-6 text-center text-xs text-neutral-400 border border-dashed rounded-xl">
              Select a calendar date above to compute its epoch timestamps.
            </div>
          )}
        </div>
      )}

      {/* Info card */}
      <div className="p-3.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/30 text-xs text-neutral-500 dark:text-neutral-400 flex items-start gap-2.5">
        <Info className="w-4 h-4 shrink-0 text-neutral-400 mt-0.5" />
        <p className="leading-relaxed">
          Unix time represents the count of seconds elapsed since <strong>00:00:00 UTC on January 1, 1970</strong> (not counting leap seconds). Timestamps with 10 digits are typically seconds, while 13 digits are milliseconds.
        </p>
      </div>
    </div>
  );
};
