import React, { useState, useMemo } from 'react';
import {
  CheckCircle2,
  XCircle,
  AlertCircle,
  Copy,
  Check,
  Download,
  Trash2,
  FileCheck2,
  ListTree,
  ChevronRight,
  Info
} from 'lucide-react';
import { validateJson, formatJsonString } from '../lib/developer/jsonUtils';

const SAMPLES = {
  valid: `{
  "status": "success",
  "data": {
    "user": {
      "id": "usr_9821a",
      "name": "Alex Mercer",
      "roles": ["developer", "admin"],
      "verified": true
    },
    "tokenExpiry": 1741528000
  },
  "metrics": {
    "latencyMs": 42
  }
}`,
  trailingComma: `{
  "name": "Invalid Json Sample",
  "version": 1.0,
  "features": [
    "item1",
    "item2",
  ]
}`,
  unquotedKeys: `{
  name: "Missing Quotes on Key",
  active: true
}`,
  unclosedBracket: `{
  "title": "Unclosed Object",
  "details": {
    "description": "Missing closing curly bracket"
}`
};

export const JsonValidator: React.FC = () => {
  const [input, setInput] = useState<string>(SAMPLES.valid);
  const [copied, setCopied] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'formatted' | 'raw'>('formatted');

  const validation = useMemo(() => validateJson(input), [input]);

  const formattedOutput = useMemo(() => {
    if (!validation.valid || !input.trim()) return '';
    return formatJsonString(input, 2).result;
  }, [validation.valid, input]);

  const handleCopy = (text: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClear = () => {
    setInput('');
  };

  const handleDownload = () => {
    if (!input.trim() || !validation.valid) return;
    const blob = new Blob([formattedOutput || input], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'validated-payload.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6" id="json-validator-tool">
      {/* Sample presets bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/70 dark:bg-neutral-900/40">
        <div className="flex items-center gap-2 flex-wrap text-xs">
          <span className="font-semibold text-neutral-600 dark:text-neutral-400">Load Test Sample:</span>
          <button
            type="button"
            id="val-sample-valid"
            onClick={() => setInput(SAMPLES.valid)}
            className="px-2.5 py-1 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-emerald-600 dark:text-emerald-400 font-medium hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition-colors"
          >
            ✓ Valid JSON
          </button>
          <button
            type="button"
            id="val-sample-comma"
            onClick={() => setInput(SAMPLES.trailingComma)}
            className="px-2.5 py-1 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-rose-600 dark:text-rose-400 font-medium hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
          >
            ✗ Trailing Comma
          </button>
          <button
            type="button"
            id="val-sample-quotes"
            onClick={() => setInput(SAMPLES.unquotedKeys)}
            className="px-2.5 py-1 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-amber-600 dark:text-amber-400 font-medium hover:bg-amber-50 dark:hover:bg-amber-950/30 transition-colors"
          >
            ✗ Unquoted Keys
          </button>
          <button
            type="button"
            id="val-sample-bracket"
            onClick={() => setInput(SAMPLES.unclosedBracket)}
            className="px-2.5 py-1 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-rose-600 dark:text-rose-400 font-medium hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
          >
            ✗ Unclosed Bracket
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            id="val-clear-btn"
            onClick={handleClear}
            disabled={!input}
            className="px-2.5 py-1 rounded-lg text-xs font-medium text-neutral-500 hover:text-rose-600 hover:bg-neutral-200/50 dark:hover:bg-neutral-800 disabled:opacity-30 transition-colors flex items-center gap-1"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear</span>
          </button>
        </div>
      </div>

      {/* Primary Input & Validation Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Left Column: Input Area */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label
              htmlFor="json-validator-input"
              className="text-xs font-semibold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 flex items-center gap-1.5"
            >
              <FileCheck2 className="w-4 h-4 text-emerald-600" />
              <span>Input JSON String</span>
            </label>
            <span className="text-xs text-neutral-400 font-mono">
              {input.length} characters
            </span>
          </div>

          <textarea
            id="json-validator-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Paste your JSON here to validate syntax..."
            spellCheck={false}
            rows={14}
            className="w-full p-3.5 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 font-mono text-xs leading-relaxed text-neutral-900 dark:text-neutral-100 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 transition-all resize-y"
          />
        </div>

        {/* Right Column: Validation Analysis */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 flex items-center gap-1.5">
              <ListTree className="w-4 h-4 text-emerald-600" />
              <span>Validation Result & Diagnostics</span>
            </span>

            {validation.valid && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  id="val-copy-btn"
                  onClick={() => handleCopy(formattedOutput)}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
                <button
                  type="button"
                  id="val-download-btn"
                  onClick={handleDownload}
                  className="p-1 rounded-lg text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors"
                  title="Download clean JSON"
                >
                  <Download className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Validation verdict badge */}
          {validation.isEmpty ? (
            <div className="p-8 rounded-2xl border border-dashed border-neutral-200 dark:border-neutral-800 text-center space-y-2">
              <Info className="w-8 h-8 mx-auto text-neutral-400" />
              <div className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                Awaiting JSON Input
              </div>
              <p className="text-xs text-neutral-400 max-w-xs mx-auto">
                Paste any payload or click one of the test samples above to begin analysis.
              </p>
            </div>
          ) : validation.valid ? (
            <div className="space-y-3">
              <div
                id="validator-success-box"
                className="p-4 rounded-2xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50/80 dark:bg-emerald-950/20 text-emerald-900 dark:text-emerald-200 space-y-2"
              >
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  <span className="font-bold text-sm">Valid JSON! No syntax errors detected.</span>
                </div>
                <p className="text-xs text-emerald-700 dark:text-emerald-300/90 leading-relaxed">
                  The document strictly complies with RFC 8259 specifications. All keys and strings are correctly quoted, and punctuation is balanced.
                </p>
              </div>

              {/* Statistics Grid */}
              {validation.stats && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <div className="p-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60">
                    <span className="text-neutral-500 dark:text-neutral-400 block text-[11px]">Root Type</span>
                    <span className="font-bold font-mono text-neutral-900 dark:text-neutral-100 uppercase">
                      {validation.stats.type}
                    </span>
                  </div>
                  <div className="p-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60">
                    <span className="text-neutral-500 dark:text-neutral-400 block text-[11px]">Keys / Items</span>
                    <span className="font-bold font-mono text-neutral-900 dark:text-neutral-100">
                      {validation.stats.keysCount}
                    </span>
                  </div>
                  <div className="p-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60">
                    <span className="text-neutral-500 dark:text-neutral-400 block text-[11px]">Max Depth</span>
                    <span className="font-bold font-mono text-neutral-900 dark:text-neutral-100">
                      {validation.stats.depth} levels
                    </span>
                  </div>
                  <div className="p-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60">
                    <span className="text-neutral-500 dark:text-neutral-400 block text-[11px]">Payload Size</span>
                    <span className="font-bold font-mono text-neutral-900 dark:text-neutral-100">
                      {validation.stats.sizeBytes} B
                    </span>
                  </div>
                </div>
              )}

              {/* Formatted Code preview */}
              <div>
                <div className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 mb-1.5 flex items-center justify-between">
                  <span>Formatted Document Preview</span>
                  <span className="text-[11px] font-mono text-neutral-400">indent: 2 spaces</span>
                </div>
                <pre className="p-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-900 text-neutral-100 font-mono text-xs overflow-x-auto max-h-56">
                  {formattedOutput}
                </pre>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div
                id="validator-error-box"
                className="p-4 rounded-2xl border border-rose-200 dark:border-rose-900 bg-rose-50/80 dark:bg-rose-950/25 text-rose-900 dark:text-rose-200 space-y-2"
              >
                <div className="flex items-center gap-2">
                  <XCircle className="w-5 h-5 text-rose-600 dark:text-rose-400" />
                  <span className="font-bold text-sm">Invalid JSON Syntax</span>
                </div>
                <p className="text-xs font-mono text-rose-800 dark:text-rose-300 break-words bg-rose-100/60 dark:bg-rose-900/40 p-2.5 rounded-lg border border-rose-200/60 dark:border-rose-800">
                  {validation.error?.message}
                </p>
              </div>

              {/* Exact Location Card */}
              {validation.error && (validation.error.line !== undefined || validation.error.position !== undefined) && (
                <div className="p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 space-y-3">
                  <div className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
                    Pinpointed Location
                  </div>

                  <div className="flex items-center gap-4 text-xs">
                    {validation.error.line !== undefined && (
                      <div className="px-3 py-1.5 rounded-lg bg-neutral-100 dark:bg-neutral-800 font-medium">
                        Line: <span className="font-bold text-rose-600 dark:text-rose-400 font-mono">{validation.error.line}</span>
                      </div>
                    )}
                    {validation.error.column !== undefined && (
                      <div className="px-3 py-1.5 rounded-lg bg-neutral-100 dark:bg-neutral-800 font-medium">
                        Column: <span className="font-bold text-rose-600 dark:text-rose-400 font-mono">{validation.error.column}</span>
                      </div>
                    )}
                    {validation.error.position !== undefined && (
                      <div className="px-3 py-1.5 rounded-lg bg-neutral-100 dark:bg-neutral-800 font-medium">
                        Char Offset: <span className="font-mono text-neutral-700 dark:text-neutral-300">{validation.error.position}</span>
                      </div>
                    )}
                  </div>

                  {validation.error.snippet && (
                    <div>
                      <span className="text-[11px] text-neutral-400 block mb-1">Surrounding snippet context:</span>
                      <pre className="p-2.5 rounded-lg bg-neutral-100 dark:bg-neutral-950 font-mono text-xs text-rose-700 dark:text-rose-300 overflow-x-auto border border-neutral-200 dark:border-neutral-800">
                        "{validation.error.snippet}"
                      </pre>
                    </div>
                  )}
                </div>
              )}

              {/* Troubleshooting Tips */}
              <div className="p-3.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/40 text-xs text-neutral-600 dark:text-neutral-400 space-y-1.5">
                <span className="font-semibold text-neutral-800 dark:text-neutral-200 block">Common JSON Syntax Pitfalls:</span>
                <ul className="list-disc list-inside space-y-0.5 text-[11px] text-neutral-500 dark:text-neutral-400">
                  <li>Trailing commas after the last item in arrays or objects are illegal in standard JSON.</li>
                  <li>All property keys must be surrounded by double quotes (<code>"key"</code>, not <code>'key'</code> or unquoted).</li>
                  <li>Single quotes (<code>'</code>) are not allowed anywhere in standard JSON.</li>
                  <li>Ensure every opening bracket (<code>&#123;</code>, <code>[</code>) has a matching closing bracket (<code>&#125;</code>, <code>]</code>).</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
