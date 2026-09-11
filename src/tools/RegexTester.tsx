import React, { useState, useMemo } from 'react';
import {
  Sliders,
  Copy,
  Check,
  Trash2,
  AlertCircle,
  Sparkles,
  ArrowRight,
  Code,
  Info,
  CheckCircle2,
  BookOpen
} from 'lucide-react';

interface RegexPreset {
  name: string;
  pattern: string;
  flags: string;
  sample: string;
}

const PRESETS: RegexPreset[] = [
  {
    name: 'Email Address',
    pattern: '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}',
    flags: 'gi',
    sample: 'Contact us at support@toolnest.dev, sales@example.org or personal.alex99@gmail.com for inquiries.',
  },
  {
    name: 'URL / Web Link',
    pattern: 'https?:\\/\\/[^\\s/$.?#].[^\\s]*',
    flags: 'gi',
    sample: 'Visit https://toolnest.dev and check https://github.com/react or http://localhost:3000.',
  },
  {
    name: 'Hex Color Code',
    pattern: '#(?:[0-9a-fA-F]{3}){1,2}\\b',
    flags: 'gi',
    sample: 'Colors used: #10b981 (emerald), #fff, #3b82f6, and #09090b for dark mode.',
  },
  {
    name: 'IPv4 Address',
    pattern: '\\b(?:\\d{1,3}\\.){3}\\d{1,3}\\b',
    flags: 'g',
    sample: 'Host running on 127.0.0.1 and connecting to gateway 192.168.1.1 or DNS 8.8.8.8.',
  },
  {
    name: 'ISO Date (YYYY-MM-DD)',
    pattern: '\\b\\d{4}-(?:0[1-9]|1[0-2])-(?:0[1-9]|[12]\\d|3[01])\\b',
    flags: 'g',
    sample: 'Product released on 2026-03-09, next milestone is scheduled for 2026-12-31.',
  },
  {
    name: 'Phone (US/Intl)',
    pattern: '\\+?\\d{1,3}?[-.\\s]?\\(?\\d{3}\\)?[-.\\s]?\\d{3}[-.\\s]?\\d{4}',
    flags: 'g',
    sample: 'Call us at +1 (800) 555-0199 or 555-234-5678.',
  },
];

interface MatchItem {
  index: number;
  match: string;
  start: number;
  end: number;
  groups: string[];
}

export const RegexTester: React.FC = () => {
  const [pattern, setPattern] = useState<string>('([a-zA-Z0-9._%+-]+)@([a-zA-Z0-9.-]+\\.[a-zA-Z]{2,})');
  const [flags, setFlags] = useState<{ g: boolean; i: boolean; m: boolean; s: boolean; u: boolean }>({
    g: true,
    i: true,
    m: false,
    s: false,
    u: false,
  });

  const [testString, setTestString] = useState<string>(
    'Hello, send your inquiries to support@toolnest.dev or team@example.com anytime!'
  );
  const [replaceString, setReplaceString] = useState<string>('contact-$1 at $2');
  const [showSubstitution, setShowSubstitution] = useState<boolean>(true);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Build flags string
  const flagsString = useMemo(() => {
    let f = '';
    if (flags.g) f += 'g';
    if (flags.i) f += 'i';
    if (flags.m) f += 'm';
    if (flags.s) f += 's';
    if (flags.u) f += 'u';
    return f;
  }, [flags]);

  // Compile regex & analyze matches
  const analysis = useMemo(() => {
    if (!pattern) {
      return { matches: [], error: null, replaced: testString };
    }

    try {
      const rx = new RegExp(pattern, flagsString);
      const matches: MatchItem[] = [];

      if (flags.g) {
        let m: RegExpExecArray | null;
        let iterationCount = 0;
        const maxMatches = 500; // safety ceiling against catastrophic backtracking

        while ((m = rx.exec(testString)) !== null && iterationCount < maxMatches) {
          iterationCount++;
          const groups = m.slice(1).map((g) => (g !== undefined ? g : ''));
          matches.push({
            index: matches.length,
            match: m[0],
            start: m.index,
            end: m.index + m[0].length,
            groups,
          });

          // Prevent zero-length infinite loops
          if (m.index === rx.lastIndex) {
            rx.lastIndex++;
          }
        }
      } else {
        const m = rx.exec(testString);
        if (m) {
          const groups = m.slice(1).map((g) => (g !== undefined ? g : ''));
          matches.push({
            index: 0,
            match: m[0],
            start: m.index,
            end: m.index + m[0].length,
            groups,
          });
        }
      }

      // Replaced string
      let replaced = '';
      try {
        replaced = testString.replace(rx, replaceString);
      } catch {
        replaced = testString;
      }

      return { matches, error: null, replaced };
    } catch (err: any) {
      return { matches: [], error: err.message || 'Invalid regular expression', replaced: testString };
    }
  }, [pattern, flagsString, testString, replaceString]);

  // Visual text highlighting
  const highlightedSegments = useMemo(() => {
    if (!analysis.matches.length || !testString) {
      return [{ text: testString, isMatch: false, matchIndex: -1 }];
    }

    const segments: { text: string; isMatch: boolean; matchIndex: number }[] = [];
    let lastIndex = 0;

    analysis.matches.forEach((m, idx) => {
      if (m.start > lastIndex) {
        segments.push({
          text: testString.slice(lastIndex, m.start),
          isMatch: false,
          matchIndex: -1,
        });
      }
      segments.push({
        text: testString.slice(m.start, m.end),
        isMatch: true,
        matchIndex: idx,
      });
      lastIndex = m.end;
    });

    if (lastIndex < testString.length) {
      segments.push({
        text: testString.slice(lastIndex),
        isMatch: false,
        matchIndex: -1,
      });
    }

    return segments;
  }, [testString, analysis.matches]);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1500);
  };

  const handleApplyPreset = (preset: RegexPreset) => {
    setPattern(preset.pattern);
    setTestString(preset.sample);
    const newFlags = { g: false, i: false, m: false, s: false, u: false };
    if (preset.flags.includes('g')) newFlags.g = true;
    if (preset.flags.includes('i')) newFlags.i = true;
    if (preset.flags.includes('m')) newFlags.m = true;
    if (preset.flags.includes('s')) newFlags.s = true;
    if (preset.flags.includes('u')) newFlags.u = true;
    setFlags(newFlags);
  };

  return (
    <div className="space-y-6" id="regex-tester-tool">
      {/* Preset Library Bar */}
      <div className="p-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/70 dark:bg-neutral-900/40">
        <div className="flex items-center gap-2 flex-wrap text-xs">
          <span className="font-semibold text-neutral-600 dark:text-neutral-400 flex items-center gap-1">
            <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
            <span>Preset Patterns:</span>
          </span>
          {PRESETS.map((p) => (
            <button
              key={p.name}
              type="button"
              onClick={() => handleApplyPreset(p)}
              className="px-2.5 py-1 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 font-medium hover:text-emerald-600 dark:hover:text-emerald-400 hover:border-emerald-300 dark:hover:border-emerald-700 transition-colors"
            >
              {p.name}
            </button>
          ))}
        </div>
      </div>

      {/* Regex Pattern Input & Flags */}
      <div className="p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 shadow-sm space-y-3">
        <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-neutral-600 dark:text-neutral-400">
          <label htmlFor="regex-pattern-input">Regular Expression Pattern</label>
          <span className="font-mono text-neutral-400">/{pattern}/{flagsString}</span>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch gap-3">
          {/* Delimiter + Input */}
          <div className="flex-1 flex items-center rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 px-3 focus-within:ring-2 focus-within:ring-emerald-500/30 focus-within:border-emerald-500 transition-all">
            <span className="font-mono text-neutral-400 text-base select-none mr-2">/</span>
            <input
              id="regex-pattern-input"
              type="text"
              value={pattern}
              onChange={(e) => setPattern(e.target.value)}
              placeholder="Enter regex pattern (e.g. [a-z0-9]+)..."
              spellCheck={false}
              className="w-full py-2.5 bg-transparent font-mono text-sm text-neutral-900 dark:text-neutral-100 focus:outline-none"
            />
            <span className="font-mono text-neutral-400 text-base select-none ml-2">/</span>
          </div>

          {/* Flags toggles */}
          <div className="flex items-center gap-1 p-1 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-850 text-xs">
            {(['g', 'i', 'm', 's', 'u'] as const).map((flag) => {
              const active = flags[flag];
              const descriptions: Record<string, string> = {
                g: 'global (find all matches)',
                i: 'case-insensitive',
                m: 'multiline (^ and $ match line breaks)',
                s: 'dotAll (. matches newlines)',
                u: 'unicode',
              };

              return (
                <button
                  key={flag}
                  type="button"
                  id={`flag-${flag}`}
                  onClick={() => setFlags((prev) => ({ ...prev, [flag]: !prev[flag] }))}
                  title={`${flag}: ${descriptions[flag]}`}
                  className={`w-8 h-8 rounded-lg font-mono font-bold transition-all ${
                    active
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100'
                  }`}
                >
                  {flag}
                </button>
              );
            })}
          </div>
        </div>

        {/* Syntax Error Banner */}
        {analysis.error && (
          <div className="flex items-start gap-2 p-3 rounded-xl border border-rose-200 dark:border-rose-900 bg-rose-50/80 dark:bg-rose-950/25 text-rose-800 dark:text-rose-300 text-xs font-mono">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Regex Syntax Error: </span>
              {analysis.error}
            </div>
          </div>
        )}
      </div>

      {/* Test String and Match Highlight View */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Test String Input */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-neutral-600 dark:text-neutral-400">
            <label htmlFor="regex-test-string">Test String</label>
            <button
              type="button"
              onClick={() => setTestString('')}
              className="text-neutral-400 hover:text-rose-500 transition-colors flex items-center gap-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear</span>
            </button>
          </div>

          <textarea
            id="regex-test-string"
            rows={8}
            value={testString}
            onChange={(e) => setTestString(e.target.value)}
            placeholder="Enter test string to evaluate regex matches..."
            spellCheck={false}
            className="w-full p-3.5 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 font-mono text-sm leading-relaxed text-neutral-900 dark:text-neutral-100 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 transition-all resize-y"
          />
        </div>

        {/* Visual Match Highlight Canvas */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-neutral-600 dark:text-neutral-400">
            <span>Visual Match Highlighting</span>
            <span className="font-semibold text-emerald-600 dark:text-emerald-400">
              {analysis.matches.length} {analysis.matches.length === 1 ? 'match' : 'matches'} found
            </span>
          </div>

          <div className="w-full h-44 p-3.5 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/80 dark:bg-neutral-900/60 font-mono text-sm leading-relaxed overflow-y-auto whitespace-pre-wrap break-words text-neutral-800 dark:text-neutral-200">
            {highlightedSegments.map((seg, i) =>
              seg.isMatch ? (
                <mark
                  key={i}
                  className="bg-emerald-200 dark:bg-emerald-900/70 text-emerald-950 dark:text-emerald-200 font-semibold px-0.5 rounded shadow-sm"
                  title={`Match #${seg.matchIndex + 1}`}
                >
                  {seg.text}
                </mark>
              ) : (
                <span key={i}>{seg.text}</span>
              )
            )}
          </div>
        </div>
      </div>

      {/* Capture Groups & Match Breakdown */}
      {analysis.matches.length > 0 && (
        <div className="p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/40 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-neutral-700 dark:text-neutral-300">
              Match Details & Capture Groups ({analysis.matches.length})
            </span>
            <button
              type="button"
              onClick={() => handleCopy(analysis.matches.map((m) => m.match).join('\n'), 'allMatches')}
              className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
            >
              {copiedKey === 'allMatches' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedKey === 'allMatches' ? 'Copied' : 'Copy All Matches'}</span>
            </button>
          </div>

          <div className="divide-y divide-neutral-100 dark:divide-neutral-800/80 max-h-60 overflow-y-auto rounded-xl border border-neutral-200 dark:border-neutral-800">
            {analysis.matches.map((m) => (
              <div key={m.index} className="p-3 hover:bg-neutral-50 dark:hover:bg-neutral-850/40 text-xs">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[11px]">
                      Match #{m.index + 1}
                    </span>
                    <span className="font-mono text-neutral-400 text-[11px]">
                      indices [{m.start}:{m.end}]
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopy(m.match, `match-${m.index}`)}
                    className="text-neutral-400 hover:text-emerald-600"
                    title="Copy match string"
                  >
                    {copiedKey === `match-${m.index}` ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>

                <div className="font-mono text-xs text-neutral-800 dark:text-neutral-200 font-semibold bg-neutral-100/60 dark:bg-neutral-950 p-1.5 rounded mb-1">
                  {m.match}
                </div>

                {m.groups.length > 0 && (
                  <div className="flex items-center gap-2 flex-wrap pt-1">
                    <span className="text-[10px] text-neutral-400 font-medium">Capture Groups:</span>
                    {m.groups.map((grp, gIdx) => (
                      <span
                        key={gIdx}
                        className="font-mono text-[11px] px-2 py-0.5 rounded border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300"
                      >
                        ${gIdx + 1}: <strong>{grp || '<empty>'}</strong>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Replace / Substitution Preview Section */}
      <div className="p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/40 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-neutral-700 dark:text-neutral-300">
            <Code className="w-4 h-4 text-emerald-600" />
            <span>Regex Substitution / Replace</span>
          </div>

          <button
            type="button"
            onClick={() => handleCopy(analysis.replaced, 'replacedText')}
            disabled={!analysis.replaced}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-40 transition-colors"
          >
            {copiedKey === 'replacedText' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedKey === 'replacedText' ? 'Copied' : 'Copy Result'}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-1">
            <label htmlFor="regex-replace-pattern" className="block text-[11px] text-neutral-400 mb-1">
              Replacement Pattern (use $1, $2, etc.)
            </label>
            <input
              id="regex-replace-pattern"
              type="text"
              value={replaceString}
              onChange={(e) => setReplaceString(e.target.value)}
              placeholder="e.g. [$1] or sanitized..."
              className="w-full p-2 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 font-mono text-xs text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-[11px] text-neutral-400 mb-1">
              Transformed Result Preview
            </label>
            <div className="p-2 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 font-mono text-xs text-neutral-800 dark:text-neutral-200 min-h-[38px] flex items-center overflow-x-auto">
              {analysis.replaced}
            </div>
          </div>
        </div>
      </div>

      {/* Cheat Sheet Footnote */}
      <div className="p-3.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/30 text-xs text-neutral-500 dark:text-neutral-400 flex items-start gap-2.5">
        <Info className="w-4 h-4 shrink-0 text-neutral-400 mt-0.5" />
        <p className="leading-relaxed">
          <strong>Regex Quick Reference:</strong> <code>.</code> any character, <code>\d</code> digit, <code>\w</code> word character, <code>\s</code> whitespace, <code>+</code> 1 or more, <code>*</code> 0 or more, <code>?</code> optional, <code>(...)</code> capture group, <code>[...]</code> character set.
        </p>
      </div>
    </div>
  );
};
