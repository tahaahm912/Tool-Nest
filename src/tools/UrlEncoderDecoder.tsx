import React, { useState, useMemo } from 'react';
import {
  Link,
  ArrowRightLeft,
  Copy,
  Check,
  AlertCircle,
  Trash2,
  Table,
  Globe,
  Info
} from 'lucide-react';
import { encodeUrlText, decodeUrlText, parseUrlStructure } from '../lib/developer/urlUtils';

const SAMPLE_URL = 'https://api.toolnest.dev/v1/search?query=hello+world&category=developer%20tools&filter=active&tags=json,base64';
const SAMPLE_COMPONENT = 'user input with special characters: & ? = / # @ + % and spaces!';

export const UrlEncoderDecoder: React.FC = () => {
  const [mode, setMode] = useState<'encode' | 'decode'>('encode');
  const [scope, setScope] = useState<'component' | 'full'>('component');
  const [spaceAsPlus, setSpaceAsPlus] = useState<boolean>(false);
  const [input, setInput] = useState<string>(SAMPLE_COMPONENT);
  const [copied, setCopied] = useState<boolean>(false);

  // Conversion result
  const conversion = useMemo(() => {
    if (mode === 'encode') {
      return encodeUrlText(input, scope, spaceAsPlus);
    } else {
      return decodeUrlText(input, scope, true);
    }
  }, [input, mode, scope, spaceAsPlus]);

  // URL query parameter and structure inspection
  const parsed = useMemo(() => {
    return parseUrlStructure(input);
  }, [input]);

  const handleCopy = () => {
    if (!conversion.result) return;
    navigator.clipboard.writeText(conversion.result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSwap = () => {
    if (!conversion.result) return;
    setInput(conversion.result);
    setMode((m) => (m === 'encode' ? 'decode' : 'encode'));
  };

  const handleClear = () => {
    setInput('');
  };

  const handleLoadSample = () => {
    if (mode === 'encode') {
      setInput(SAMPLE_COMPONENT);
    } else {
      setInput(SAMPLE_URL);
    }
  };

  return (
    <div className="space-y-6" id="url-encoder-decoder-tool">
      {/* Configuration bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/70 dark:bg-neutral-900/50">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Mode Switcher */}
          <div className="flex items-center rounded-xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 p-0.5 shadow-sm">
            <button
              type="button"
              id="url-mode-encode"
              onClick={() => setMode('encode')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                mode === 'encode'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-neutral-700 dark:text-neutral-300 hover:text-emerald-600'
              }`}
            >
              Encode (Text → URL)
            </button>
            <button
              type="button"
              id="url-mode-decode"
              onClick={() => setMode('decode')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                mode === 'decode'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-neutral-700 dark:text-neutral-300 hover:text-emerald-600'
              }`}
            >
              Decode (URL → Text)
            </button>
          </div>

          {/* Scope selection */}
          <div className="flex items-center rounded-xl bg-white dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-700 px-1 py-0.5 text-xs">
            <button
              type="button"
              id="url-scope-comp"
              onClick={() => setScope('component')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                scope === 'component'
                  ? 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900'
                  : 'text-neutral-600 dark:text-neutral-400'
              }`}
              title="Encodes all special characters including /, ?, &, = (standard encodeURIComponent)"
            >
              Component
            </button>
            <button
              type="button"
              id="url-scope-full"
              onClick={() => setScope('full')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                scope === 'full'
                  ? 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900'
                  : 'text-neutral-600 dark:text-neutral-400'
              }`}
              title="Preserves URL protocol, host slashes and colons (encodeURI)"
            >
              Full URL
            </button>
          </div>

          {/* Space encoding */}
          {mode === 'encode' && (
            <label
              htmlFor="url-space-plus"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-850 text-xs font-medium cursor-pointer text-neutral-700 dark:text-neutral-300 select-none"
            >
              <input
                id="url-space-plus"
                type="checkbox"
                checked={spaceAsPlus}
                onChange={(e) => setSpaceAsPlus(e.target.checked)}
                className="w-3.5 h-3.5 accent-emerald-600 rounded"
              />
              <span>Encode spaces as '+'</span>
            </label>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            id="url-swap-btn"
            onClick={handleSwap}
            disabled={!conversion.result}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200/60 dark:hover:bg-neutral-800 disabled:opacity-40 transition-colors"
            title="Swap input and output"
          >
            <ArrowRightLeft className="w-3.5 h-3.5" />
            <span>Swap</span>
          </button>

          <button
            type="button"
            id="url-sample-btn"
            onClick={handleLoadSample}
            className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200/60 dark:hover:bg-neutral-800 transition-colors"
          >
            Sample
          </button>

          <button
            type="button"
            id="url-clear-btn"
            onClick={handleClear}
            disabled={!input}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 disabled:opacity-30 transition-colors"
            title="Clear"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Editor & Result Grids */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Input Pane */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-neutral-600 dark:text-neutral-400">
            <label htmlFor="url-input">
              {mode === 'encode' ? 'Raw Text / String Input' : 'Encoded URL Input'}
            </label>
            <span className="font-mono text-neutral-400 font-normal lowercase">
              {input.length} characters
            </span>
          </div>

          <textarea
            id="url-input"
            rows={8}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              mode === 'encode'
                ? 'Enter text, query parameters, or URL to encode...'
                : 'Paste percent-encoded URL (e.g. %20, %2F) to decode...'
            }
            spellCheck={false}
            className="w-full p-3.5 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 font-mono text-sm leading-relaxed text-neutral-900 dark:text-neutral-100 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 transition-all resize-y"
          />
        </div>

        {/* Output Pane */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-neutral-600 dark:text-neutral-400">
            <label htmlFor="url-output">
              {mode === 'encode' ? 'Encoded Output (Percent-Encoded)' : 'Decoded Text Output'}
            </label>
            <div className="flex items-center gap-2">
              <span className="font-mono text-neutral-400 font-normal lowercase">
                {conversion.result.length} characters
              </span>
              <button
                type="button"
                id="url-copy-btn"
                onClick={handleCopy}
                disabled={!conversion.result}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-40 transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>

          <textarea
            id="url-output"
            rows={8}
            readOnly
            value={conversion.result}
            placeholder={
              mode === 'encode'
                ? 'Encoded string will appear here...'
                : 'Decoded text will appear here...'
            }
            spellCheck={false}
            className="w-full p-3.5 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/70 dark:bg-neutral-900/50 font-mono text-sm leading-relaxed text-neutral-900 dark:text-neutral-100 shadow-sm focus:outline-none transition-all resize-y cursor-text"
          />
        </div>
      </div>

      {/* Error display */}
      {conversion.error && (
        <div
          id="url-error-banner"
          className="flex items-start gap-2.5 p-3.5 rounded-xl border border-rose-200 dark:border-rose-900 bg-rose-50/80 dark:bg-rose-950/25 text-rose-800 dark:text-rose-300 text-xs"
        >
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <div className="font-semibold text-rose-900 dark:text-rose-200">URL Decoding Issue</div>
            <div className="font-mono mt-0.5">{conversion.error}</div>
          </div>
        </div>
      )}

      {/* URL Parameters Breakdown Section (Rendered when valid URL query parameters detected) */}
      {parsed.params.length > 0 && (
        <div className="p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/40 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-neutral-700 dark:text-neutral-300">
              <Table className="w-4 h-4 text-emerald-600" />
              <span>Parsed Query Parameters ({parsed.params.length})</span>
            </div>
            {parsed.host && (
              <span className="text-xs font-mono text-neutral-500">
                Host: {parsed.host}
              </span>
            )}
          </div>

          <div className="overflow-x-auto rounded-xl border border-neutral-200 dark:border-neutral-800">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-neutral-50 dark:bg-neutral-800/60 border-b border-neutral-200 dark:border-neutral-800 text-neutral-500 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-2.5 pl-3">Key (Parameter)</th>
                  <th className="p-2.5">Decoded Value</th>
                  <th className="p-2.5 pr-3 text-right">Raw Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
                {parsed.params.map((param, idx) => (
                  <tr key={idx} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-800/30">
                    <td className="p-2.5 pl-3 font-semibold text-emerald-600 dark:text-emerald-400">
                      {param.key}
                    </td>
                    <td className="p-2.5 text-neutral-800 dark:text-neutral-200">
                      {param.value}
                    </td>
                    <td className="p-2.5 pr-3 text-right text-neutral-400">
                      {encodeURIComponent(param.value)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Guide Note */}
      <div className="p-3.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/30 text-xs text-neutral-500 dark:text-neutral-400 flex items-start gap-2.5">
        <Info className="w-4 h-4 shrink-0 text-neutral-400 mt-0.5" />
        <p className="leading-relaxed">
          <strong>Component vs Full URL:</strong> Use <em>Component</em> mode when encoding individual form fields, tokens, or query values (encodes <code>&amp;</code>, <code>=</code>, <code>?</code>, <code>/</code>). Use <em>Full URL</em> when you have a complete address and only want to escape spaces and non-ASCII symbols without breaking the web protocol or path slashes.
        </p>
      </div>
    </div>
  );
};
