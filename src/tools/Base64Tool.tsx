import React, { useState, useMemo } from 'react';
import {
  Binary,
  ArrowRightLeft,
  Copy,
  Check,
  AlertCircle,
  Trash2,
  Download,
  Info,
  Sparkles
} from 'lucide-react';

const SAMPLE_ENCODE = 'Hello, ToolNest Developer Tools! 🚀 Multi-byte UTF-8: 你好世界, Café, résumé.';
const SAMPLE_DECODE = 'SGVsbG8sIFRvb2xOZXN0IERldmVsb3BlciBUb29scyEg8J+agCBNdWx0aS1ieXRlIFVURi04OiDkvaDlpb3kuJbnlYwsIENhZsOpLCByw6lzdW3DqS4=';

export const Base64Tool: React.FC = () => {
  const [mode, setMode] = useState<'encode' | 'decode'>('encode');
  const [input, setInput] = useState<string>(SAMPLE_ENCODE);
  const [urlSafe, setUrlSafe] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  // Safe UTF-8 Base64 conversion
  const output = useMemo(() => {
    setError(null);
    if (!input) return '';

    try {
      if (mode === 'encode') {
        const bytes = new TextEncoder().encode(input);
        let binString = '';
        const len = bytes.length;
        for (let i = 0; i < len; i++) {
          binString += String.fromCharCode(bytes[i]);
        }
        let b64 = btoa(binString);

        if (urlSafe) {
          b64 = b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
        }
        return b64;
      } else {
        // Prepare base64 for decoding
        let clean = input.trim();
        if (urlSafe || clean.includes('-') || clean.includes('_')) {
          clean = clean.replace(/-/g, '+').replace(/_/g, '/');
          while (clean.length % 4 !== 0) {
            clean += '=';
          }
        }

        // Test base64 regex pattern
        if (!/^[A-Za-z0-9+/]*={0,2}$/.test(clean.replace(/\s+/g, ''))) {
          throw new Error('Input contains characters outside the valid Base64 alphabet (A-Z, a-z, 0-9, +, /, =).');
        }

        const binString = atob(clean);
        const bytes = new Uint8Array(binString.length);
        for (let i = 0; i < binString.length; i++) {
          bytes[i] = binString.charCodeAt(i);
        }
        return new TextDecoder().decode(bytes);
      }
    } catch (err: any) {
      setError(err.message || 'Invalid base64 string for decoding');
      return '';
    }
  }, [input, mode, urlSafe]);

  const handleCopy = () => {
    if (!output) return;
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSwap = () => {
    if (!output) return;
    setInput(output);
    setMode((prev) => (prev === 'encode' ? 'decode' : 'encode'));
    setError(null);
  };

  const handleClear = () => {
    setInput('');
    setError(null);
  };

  const handleLoadSample = () => {
    if (mode === 'encode') {
      setInput(SAMPLE_ENCODE);
    } else {
      setInput(SAMPLE_DECODE);
    }
    setError(null);
  };

  const handleDownload = () => {
    if (!output) return;
    const filename = mode === 'encode' ? 'encoded-base64.txt' : 'decoded-text.txt';
    const blob = new Blob([output], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const inputBytes = useMemo(() => new Blob([input]).size, [input]);
  const outputBytes = useMemo(() => new Blob([output]).size, [output]);

  return (
    <div className="space-y-6" id="base64-tool">
      {/* Top Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/70 dark:bg-neutral-900/50">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Mode switch */}
          <div className="flex items-center rounded-xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 p-0.5 shadow-sm">
            <button
              type="button"
              id="b64-mode-encode"
              onClick={() => {
                setMode('encode');
                setError(null);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                mode === 'encode'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-neutral-700 dark:text-neutral-300 hover:text-emerald-600'
              }`}
            >
              Encode (Text → Base64)
            </button>
            <button
              type="button"
              id="b64-mode-decode"
              onClick={() => {
                setMode('decode');
                setError(null);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                mode === 'decode'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-neutral-700 dark:text-neutral-300 hover:text-emerald-600'
              }`}
            >
              Decode (Base64 → Text)
            </button>
          </div>

          {/* URL Safe Toggle */}
          <label
            htmlFor="b64-url-safe"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-850 text-xs font-medium cursor-pointer select-none text-neutral-700 dark:text-neutral-300"
          >
            <input
              id="b64-url-safe"
              type="checkbox"
              checked={urlSafe}
              onChange={(e) => setUrlSafe(e.target.checked)}
              className="w-3.5 h-3.5 accent-emerald-600 rounded"
            />
            <span>URL-Safe (- / _)</span>
          </label>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            id="b64-swap-btn"
            onClick={handleSwap}
            disabled={!output}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200/60 dark:hover:bg-neutral-800 disabled:opacity-40 transition-colors"
            title="Swap input and output"
          >
            <ArrowRightLeft className="w-3.5 h-3.5" />
            <span>Swap</span>
          </button>

          <button
            type="button"
            id="b64-sample-btn"
            onClick={handleLoadSample}
            className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200/60 dark:hover:bg-neutral-800 transition-colors"
          >
            Sample
          </button>

          <button
            type="button"
            id="b64-clear-btn"
            onClick={handleClear}
            disabled={!input}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 disabled:opacity-30 transition-colors"
            title="Clear"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Input / Output Grids */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Input Pane */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-neutral-600 dark:text-neutral-400">
            <label htmlFor="b64-input">
              {mode === 'encode' ? 'Plain Text Input' : 'Base64 Input'}
            </label>
            <span className="font-mono lowercase font-normal text-neutral-400">
              {input.length} chars • {inputBytes} bytes
            </span>
          </div>

          <textarea
            id="b64-input"
            rows={10}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              mode === 'encode'
                ? 'Type or paste plain text, JSON, or code to encode...'
                : 'Paste Base64 encoded string to decode...'
            }
            spellCheck={false}
            className="w-full p-3.5 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 font-mono text-sm leading-relaxed text-neutral-900 dark:text-neutral-100 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 transition-all resize-y"
          />
        </div>

        {/* Output Pane */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-neutral-600 dark:text-neutral-400">
            <label htmlFor="b64-output">
              {mode === 'encode' ? 'Base64 Result' : 'Decoded Text'}
            </label>
            <div className="flex items-center gap-2">
              <span className="font-mono lowercase font-normal text-neutral-400">
                {output.length} chars • {outputBytes} bytes
              </span>
              {output && (
                <button
                  type="button"
                  id="b64-download-btn"
                  onClick={handleDownload}
                  className="p-1 rounded text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors"
                  title="Download as file"
                >
                  <Download className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                type="button"
                id="b64-copy-btn"
                onClick={handleCopy}
                disabled={!output}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-40 transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>

          <textarea
            id="b64-output"
            rows={10}
            readOnly
            value={output}
            placeholder={
              mode === 'encode'
                ? 'Base64 encoded output will appear here automatically...'
                : 'Decoded text will appear here automatically...'
            }
            spellCheck={false}
            className="w-full p-3.5 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/70 dark:bg-neutral-900/50 font-mono text-sm leading-relaxed text-neutral-900 dark:text-neutral-100 shadow-sm focus:outline-none transition-all resize-y cursor-text"
          />
        </div>
      </div>

      {/* Error / Feedback box */}
      {error && (
        <div
          id="b64-error-box"
          className="flex items-start gap-2.5 p-3.5 rounded-xl border border-rose-200 dark:border-rose-900 bg-rose-50/80 dark:bg-rose-950/25 text-rose-800 dark:text-rose-300 text-xs"
        >
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <div className="font-semibold text-rose-900 dark:text-rose-200">Base64 Decode Error</div>
            <div className="font-mono mt-0.5">{error}</div>
          </div>
        </div>
      )}

      {/* Info footer */}
      <div className="p-3.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/30 text-xs text-neutral-500 dark:text-neutral-400 flex items-start gap-2.5">
        <Info className="w-4 h-4 shrink-0 text-neutral-400 mt-0.5" />
        <p className="leading-relaxed">
          Base64 expands binary data size by ~33% (converting each 3 bytes into 4 ASCII characters). The URL-Safe option replaces <code>+</code> and <code>/</code> with <code>-</code> and <code>_</code> so the string can be placed directly in HTTP query parameters and URL paths without percentage-escaping.
        </p>
      </div>
    </div>
  );
};
