import React, { useState, useMemo } from 'react';
import {
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  Minimize2,
  Maximize2,
  Download,
  Trash2,
  FileCode,
  ArrowRight,
  Info
} from 'lucide-react';
import { validateJson, formatJsonString, minifyJsonString } from '../lib/developer/jsonUtils';

const SAMPLE_JSON = `{
  "app": "ToolNest",
  "version": "2.4.0",
  "category": "developer-tools",
  "active": true,
  "config": {
    "theme": "dark",
    "offlineSupport": true,
    "maxPayloadSizeMb": 10
  },
  "tools": [
    { "id": "json-formatter", "enabled": true, "rating": 4.9 },
    { "id": "hash-generator", "enabled": true, "rating": 4.8 },
    { "id": "regex-tester", "enabled": true, "rating": 5.0 }
  ],
  "stats": {
    "dailyRuns": 14200,
    "uptime": 99.99
  }
}`;

export const JsonFormatter: React.FC = () => {
  const [input, setInput] = useState<string>(SAMPLE_JSON);
  const [indent, setIndent] = useState<2 | 4 | '\t'>(2);
  const [copied, setCopied] = useState<boolean>(false);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // Real-time validation
  const validation = useMemo(() => validateJson(input), [input]);

  // Handle Pretty Print / Format
  const handleFormat = (indentSpaces: 2 | 4 | '\t' = indent) => {
    if (!input.trim()) return;
    const res = formatJsonString(input, indentSpaces);
    if (res.success) {
      setInput(res.result);
      showNotice('Formatted successfully');
    }
  };

  // Handle Minify
  const handleMinify = () => {
    if (!input.trim()) return;
    const res = minifyJsonString(input);
    if (res.success) {
      setInput(res.result);
      showNotice('Minified JSON to 1 line');
    }
  };

  const showNotice = (msg: string) => {
    setActionNotice(msg);
    setTimeout(() => setActionNotice(null), 2500);
  };

  const handleCopy = () => {
    if (!input.trim()) return;
    navigator.clipboard.writeText(input);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClear = () => {
    setInput('');
  };

  const handleLoadSample = () => {
    setInput(SAMPLE_JSON);
    showNotice('Loaded sample JSON');
  };

  const handleDownload = () => {
    if (!input.trim()) return;
    const blob = new Blob([input], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'formatted-data.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showNotice('JSON downloaded');
  };

  return (
    <div className="space-y-5" id="json-formatter-tool">
      {/* Top Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/70 dark:bg-neutral-900/50 backdrop-blur-sm">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center rounded-xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 p-0.5 shadow-sm">
            <button
              type="button"
              id="json-indent-2"
              onClick={() => {
                setIndent(2);
                handleFormat(2);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                indent === 2
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-neutral-700 dark:text-neutral-300 hover:text-emerald-600'
              }`}
            >
              2 Spaces
            </button>
            <button
              type="button"
              id="json-indent-4"
              onClick={() => {
                setIndent(4);
                handleFormat(4);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                indent === 4
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-neutral-700 dark:text-neutral-300 hover:text-emerald-600'
              }`}
            >
              4 Spaces
            </button>
            <button
              type="button"
              id="json-indent-tab"
              onClick={() => {
                setIndent('\t');
                handleFormat('\t');
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                indent === '\t'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-neutral-700 dark:text-neutral-300 hover:text-emerald-600'
              }`}
            >
              Tabs
            </button>
          </div>

          <button
            type="button"
            id="json-format-btn"
            onClick={() => handleFormat()}
            disabled={!input.trim()}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm disabled:opacity-40 transition-colors"
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span>Format JSON</span>
          </button>

          <button
            type="button"
            id="json-minify-btn"
            onClick={handleMinify}
            disabled={!input.trim()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-850 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 disabled:opacity-40 transition-colors"
          >
            <Minimize2 className="w-3.5 h-3.5" />
            <span>Minify</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            id="json-load-sample"
            onClick={handleLoadSample}
            className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200/60 dark:hover:bg-neutral-800 transition-colors"
          >
            Sample
          </button>

          <button
            type="button"
            id="json-download-btn"
            onClick={handleDownload}
            disabled={!input.trim() || !validation.valid}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200/60 dark:hover:bg-neutral-800 disabled:opacity-40 transition-colors"
            title="Download formatted JSON file"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download</span>
          </button>

          <button
            type="button"
            id="json-copy-btn"
            onClick={handleCopy}
            disabled={!input.trim()}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 hover:opacity-90 disabled:opacity-40 transition-opacity"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>

          <button
            type="button"
            id="json-clear-btn"
            onClick={handleClear}
            disabled={!input}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 disabled:opacity-30 transition-colors"
            title="Clear JSON"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Temporary action notification */}
      {actionNotice && (
        <div className="text-xs text-emerald-600 dark:text-emerald-400 font-medium px-1 flex items-center gap-1.5 animate-fadeIn">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* Editor Container */}
      <div className="relative">
        <div className="flex items-center justify-between pb-2 text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
          <div className="flex items-center gap-2">
            <FileCode className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>JSON Editor & Preview</span>
          </div>

          <div className="flex items-center gap-3 lowercase font-mono font-normal">
            {validation.valid && validation.stats && (
              <>
                <span>{validation.stats.lineCount} lines</span>
                <span>•</span>
                <span>{validation.stats.charCount} chars</span>
                <span>•</span>
                <span>{Math.round(validation.stats.sizeBytes / 1024 * 10) / 10} KB</span>
              </>
            )}
          </div>
        </div>

        <div className="relative">
          <textarea
            id="json-input-editor"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Paste or type your JSON code here..."
            spellCheck={false}
            className="w-full h-96 p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 font-mono text-sm leading-relaxed text-neutral-900 dark:text-neutral-100 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 transition-all resize-y"
          />
        </div>
      </div>

      {/* Status & Error Banner */}
      {input.trim() ? (
        validation.valid ? (
          <div
            id="json-valid-banner"
            className="flex items-start gap-3 p-3.5 rounded-xl border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/70 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-300 text-xs"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <div className="flex-1 space-y-1">
              <div className="font-semibold text-emerald-900 dark:text-emerald-200">
                Valid JSON Structure
              </div>
              <div className="text-emerald-700/90 dark:text-emerald-400/90 flex flex-wrap items-center gap-x-3 gap-y-1">
                <span>Root: <strong>{validation.stats?.type}</strong></span>
                <span>Total Keys: <strong>{validation.stats?.keysCount}</strong></span>
                <span>Max Depth: <strong>{validation.stats?.depth} levels</strong></span>
              </div>
            </div>
          </div>
        ) : (
          <div
            id="json-error-banner"
            className="flex items-start gap-3 p-3.5 rounded-xl border border-rose-200 dark:border-rose-900/50 bg-rose-50/70 dark:bg-rose-950/20 text-rose-800 dark:text-rose-300 text-xs"
          >
            <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
            <div className="space-y-1 flex-1">
              <div className="font-semibold text-rose-900 dark:text-rose-200">
                JSON Syntax Error
              </div>
              <div className="font-mono text-rose-700 dark:text-rose-300 break-all">
                {validation.error?.message}
              </div>
              {validation.error?.line !== undefined && (
                <div className="text-rose-600 dark:text-rose-400 font-medium pt-0.5">
                  Location: Line {validation.error.line}, Column {validation.error.column}
                  {validation.error.snippet && (
                    <span className="block mt-1 font-mono text-[11px] bg-white/60 dark:bg-neutral-900/80 p-1.5 rounded border border-rose-200 dark:border-rose-900">
                      near: "{validation.error.snippet}"
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        )
      ) : (
        <div className="p-3 rounded-xl border border-dashed border-neutral-200 dark:border-neutral-800 text-center text-xs text-neutral-400">
          Enter or paste JSON above to preview, validate, format, and download.
        </div>
      )}
    </div>
  );
};
