import React, { useState, useMemo } from 'react';
import {
  Fingerprint,
  RefreshCw,
  Copy,
  Check,
  Download,
  Sliders,
  Sparkles,
  Info
} from 'lucide-react';

export const UuidGenerator: React.FC = () => {
  const [count, setCount] = useState<number>(5);
  const [uppercase, setUppercase] = useState<boolean>(false);
  const [hyphens, setHyphens] = useState<boolean>(true);
  const [braces, setBraces] = useState<boolean>(false);
  const [quotes, setQuotes] = useState<boolean>(false);
  const [exportFormat, setExportFormat] = useState<'newlines' | 'comma' | 'json'>('newlines');
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [copiedAll, setCopiedAll] = useState<boolean>(false);

  // Generate tokens
  const generateUuids = (qty: number) => {
    const list: string[] = [];
    for (let i = 0; i < qty; i++) {
      let val = crypto.randomUUID ? crypto.randomUUID() : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0;
        const v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      });

      if (!hyphens) {
        val = val.replace(/-/g, '');
      }
      if (uppercase) {
        val = val.toUpperCase();
      }
      if (braces) {
        val = `{${val}}`;
      }
      if (quotes) {
        val = `"${val}"`;
      }
      list.push(val);
    }
    return list;
  };

  const [uuids, setUuids] = useState<string[]>(() => generateUuids(5));

  const handleRegenerate = () => {
    setUuids(generateUuids(count));
  };

  // When formatting options change, we can re-format current or regenerate
  const formattedUuids = useMemo(() => {
    return uuids.map((id) => {
      let raw = id.replace(/[{}"']/g, '');
      if (!hyphens && raw.includes('-')) {
        raw = raw.replace(/-/g, '');
      } else if (hyphens && !raw.includes('-') && raw.length === 32) {
        raw = `${raw.slice(0, 8)}-${raw.slice(8, 12)}-${raw.slice(12, 16)}-${raw.slice(16, 20)}-${raw.slice(20)}`;
      }

      if (uppercase) raw = raw.toUpperCase();
      else raw = raw.toLowerCase();

      if (braces) raw = `{${raw}}`;
      if (quotes) raw = `"${raw}"`;
      return raw;
    });
  }, [uuids, uppercase, hyphens, braces, quotes]);

  const outputString = useMemo(() => {
    if (exportFormat === 'json') {
      return JSON.stringify(formattedUuids, null, 2);
    } else if (exportFormat === 'comma') {
      return formattedUuids.join(', ');
    } else {
      return formattedUuids.join('\n');
    }
  }, [formattedUuids, exportFormat]);

  const handleCopySingle = (val: string, index: number) => {
    navigator.clipboard.writeText(val);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 1500);
  };

  const handleCopyAll = () => {
    navigator.clipboard.writeText(outputString);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  const handleDownload = () => {
    const ext = exportFormat === 'json' ? 'json' : 'txt';
    const blob = new Blob([outputString], {
      type: ext === 'json' ? 'application/json' : 'text/plain;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `uuids-v4-${formattedUuids.length}.${ext}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6" id="uuid-generator-tool">
      {/* Controls Container */}
      <div className="p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/70 dark:bg-neutral-900/50 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Quantity Selector */}
          <div className="flex items-center gap-3">
            <label htmlFor="uuid-count" className="text-xs font-semibold text-neutral-600 dark:text-neutral-400">
              Quantity:
            </label>
            <select
              id="uuid-count"
              value={count}
              onChange={(e) => {
                const val = Number(e.target.value);
                setCount(val);
                setUuids(generateUuids(val));
              }}
              className="rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-850 px-3 py-1.5 text-xs font-semibold text-neutral-800 dark:text-neutral-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
            >
              <option value={1}>1 UUID</option>
              <option value={5}>5 UUIDs</option>
              <option value={10}>10 UUIDs</option>
              <option value={25}>25 UUIDs</option>
              <option value={50}>50 UUIDs</option>
              <option value={100}>100 UUIDs</option>
            </select>

            <span className="text-xs text-neutral-400 font-medium">Version: <strong>v4 (Random)</strong></span>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              id="uuid-generate-btn"
              onClick={handleRegenerate}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Regenerate</span>
            </button>

            <button
              type="button"
              id="uuid-copy-all-btn"
              onClick={handleCopyAll}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 hover:opacity-90 transition-opacity"
            >
              {copiedAll ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedAll ? 'Copied All!' : 'Copy All'}</span>
            </button>

            <button
              type="button"
              id="uuid-download-btn"
              onClick={handleDownload}
              className="p-1.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-850 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              title="Download as file"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Checkbox format options */}
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-2 border-t border-neutral-200/60 dark:border-neutral-800/60 text-xs">
          <label htmlFor="uuid-opt-uppercase" className="flex items-center gap-2 font-medium text-neutral-700 dark:text-neutral-300 cursor-pointer select-none">
            <input
              id="uuid-opt-uppercase"
              type="checkbox"
              checked={uppercase}
              onChange={(e) => setUppercase(e.target.checked)}
              className="w-3.5 h-3.5 accent-emerald-600 rounded"
            />
            <span>UPPERCASE</span>
          </label>

          <label htmlFor="uuid-opt-hyphens" className="flex items-center gap-2 font-medium text-neutral-700 dark:text-neutral-300 cursor-pointer select-none">
            <input
              id="uuid-opt-hyphens"
              type="checkbox"
              checked={hyphens}
              onChange={(e) => setHyphens(e.target.checked)}
              className="w-3.5 h-3.5 accent-emerald-600 rounded"
            />
            <span>Hyphens (36 chars)</span>
          </label>

          <label htmlFor="uuid-opt-braces" className="flex items-center gap-2 font-medium text-neutral-700 dark:text-neutral-300 cursor-pointer select-none">
            <input
              id="uuid-opt-braces"
              type="checkbox"
              checked={braces}
              onChange={(e) => setBraces(e.target.checked)}
              className="w-3.5 h-3.5 accent-emerald-600 rounded"
            />
            <span>Braces &#123;...&#125;</span>
          </label>

          <label htmlFor="uuid-opt-quotes" className="flex items-center gap-2 font-medium text-neutral-700 dark:text-neutral-300 cursor-pointer select-none">
            <input
              id="uuid-opt-quotes"
              type="checkbox"
              checked={quotes}
              onChange={(e) => setQuotes(e.target.checked)}
              className="w-3.5 h-3.5 accent-emerald-600 rounded"
            />
            <span>Quotes "..."</span>
          </label>

          <div className="flex items-center gap-2 ml-auto">
            <span className="text-neutral-400">Export as:</span>
            <select
              value={exportFormat}
              onChange={(e: any) => setExportFormat(e.target.value)}
              className="bg-transparent border-none text-xs font-semibold text-neutral-700 dark:text-neutral-300 focus:outline-none cursor-pointer underline"
            >
              <option value="newlines">Line-by-line</option>
              <option value="comma">Comma-separated</option>
              <option value="json">JSON Array</option>
            </select>
          </div>
        </div>
      </div>

      {/* UUID List Display */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-neutral-500">
          <span>Generated Identifiers ({formattedUuids.length})</span>
          <span>Click row or icon to copy</span>
        </div>

        <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 divide-y divide-neutral-100 dark:divide-neutral-900 overflow-hidden shadow-sm">
          {formattedUuids.map((id, index) => (
            <div
              key={index}
              className="group flex items-center justify-between p-3 px-4 hover:bg-neutral-50 dark:hover:bg-neutral-900/60 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs text-neutral-400 w-6">
                  {(index + 1).toString().padStart(2, '0')}.
                </span>
                <span className="font-mono text-sm text-neutral-800 dark:text-neutral-200 select-all font-medium">
                  {id}
                </span>
              </div>

              <button
                type="button"
                onClick={() => handleCopySingle(id, index)}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium text-neutral-500 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors"
                title="Copy this UUID"
              >
                {copiedIndex === index ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                    <span className="text-emerald-600 font-semibold">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity">Copy</span>
                  </>
                )}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Info card */}
      <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/30 text-xs text-neutral-500 dark:text-neutral-400 space-y-1">
        <div className="flex items-center gap-1.5 font-semibold text-neutral-700 dark:text-neutral-300">
          <Info className="w-4 h-4 text-emerald-600" />
          <span>About UUID Version 4</span>
        </div>
        <p className="leading-relaxed">
          UUIDs (Universally Unique Identifiers) generated here utilize the browser's native cryptographic pseudo-random number generator (<code>crypto.randomUUID</code>). With 122 bits of randomness, there are 5.3 × 10<sup>36</sup> possible IDs, making collisions virtually impossible in distributed databases and microservices.
        </p>
      </div>
    </div>
  );
};
