import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  ShieldCheck,
  Copy,
  Check,
  Trash2,
  FileUp,
  Key,
  Sliders,
  CheckCircle2,
  XCircle,
  Upload,
  Info,
  Layers
} from 'lucide-react';
import {
  calculateSha,
  calculateMd5,
  calculateCrc32,
  calculateHmac
} from '../lib/developer/cryptoUtils';

const SAMPLE_TEXT = 'The quick brown fox jumps over the lazy dog';

interface HashOutput {
  id: string;
  name: string;
  digest: string;
  bits: number;
}

export const HashGenerator: React.FC = () => {
  const [inputMode, setInputMode] = useState<'text' | 'file'>('text');
  const [inputText, setInputText] = useState<string>(SAMPLE_TEXT);
  const [file, setFile] = useState<File | null>(null);
  const [isHashingFile, setIsHashingFile] = useState<boolean>(false);

  const [useHmac, setUseHmac] = useState<boolean>(false);
  const [secretKey, setSecretKey] = useState<string>('');
  const [uppercase, setUppercase] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Checksum comparison
  const [compareHash, setCompareHash] = useState<string>('');

  const [hashes, setHashes] = useState<HashOutput[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Compute text hashes
  useEffect(() => {
    if (inputMode === 'file') return;

    let isMounted = true;

    async function computeHashes() {
      if (!inputText) {
        setHashes([]);
        return;
      }

      try {
        if (useHmac && secretKey) {
          const [hmac256, hmac512] = await Promise.all([
            calculateHmac(inputText, secretKey, 'SHA-256'),
            calculateHmac(inputText, secretKey, 'SHA-512'),
          ]);

          if (isMounted) {
            setHashes([
              { id: 'hmac-sha256', name: 'HMAC-SHA256', digest: hmac256, bits: 256 },
              { id: 'hmac-sha512', name: 'HMAC-SHA512', digest: hmac512, bits: 512 },
            ]);
          }
        } else {
          const [sha256, sha512, sha384, sha1] = await Promise.all([
            calculateSha(inputText, 'SHA-256'),
            calculateSha(inputText, 'SHA-512'),
            calculateSha(inputText, 'SHA-384'),
            calculateSha(inputText, 'SHA-1'),
          ]);

          const md5 = calculateMd5(inputText);
          const crc32 = calculateCrc32(inputText);

          if (isMounted) {
            setHashes([
              { id: 'sha256', name: 'SHA-256', digest: sha256.hex, bits: 256 },
              { id: 'sha512', name: 'SHA-512', digest: sha512.hex, bits: 512 },
              { id: 'sha384', name: 'SHA-384', digest: sha384.hex, bits: 384 },
              { id: 'sha1', name: 'SHA-1', digest: sha1.hex, bits: 160 },
              { id: 'md5', name: 'MD5', digest: md5, bits: 128 },
              { id: 'crc32', name: 'CRC32', digest: crc32, bits: 32 },
            ]);
          }
        }
      } catch (err) {
        console.error('Hash calculation error:', err);
      }
    }

    computeHashes();
    return () => {
      isMounted = false;
    };
  }, [inputText, useHmac, secretKey, inputMode]);

  // Compute file hashes
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    setFile(selected);
    setIsHashingFile(true);

    try {
      const buffer = await selected.arrayBuffer();
      const [sha256, sha512, sha1] = await Promise.all([
        calculateSha(buffer, 'SHA-256'),
        calculateSha(buffer, 'SHA-512'),
        calculateSha(buffer, 'SHA-1'),
      ]);

      const uint8 = new Uint8Array(buffer);
      const md5 = calculateMd5(uint8);
      const crc32 = calculateCrc32(uint8);

      setHashes([
        { id: 'sha256', name: 'SHA-256', digest: sha256.hex, bits: 256 },
        { id: 'sha512', name: 'SHA-512', digest: sha512.hex, bits: 512 },
        { id: 'sha1', name: 'SHA-1', digest: sha1.hex, bits: 160 },
        { id: 'md5', name: 'MD5', digest: md5, bits: 128 },
        { id: 'crc32', name: 'CRC32', digest: crc32, bits: 32 },
      ]);
    } catch (err) {
      console.error('File hash error:', err);
    } finally {
      setIsHashingFile(false);
    }
  };

  const handleCopy = (digest: string, id: string) => {
    const formatted = uppercase ? digest.toUpperCase() : digest.toLowerCase();
    navigator.clipboard.writeText(formatted);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  // Match comparison
  const comparisonResult = useMemo(() => {
    const cleanCompare = compareHash.trim().toLowerCase();
    if (!cleanCompare) return null;

    const matched = hashes.find(
      (h) => h.digest.toLowerCase() === cleanCompare
    );

    return {
      isMatch: !!matched,
      matchedAlgorithm: matched?.name,
    };
  }, [compareHash, hashes]);

  return (
    <div className="space-y-6" id="hash-generator-tool">
      {/* Configuration Header */}
      <div className="p-3.5 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/70 dark:bg-neutral-900/50 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center rounded-xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 p-0.5 shadow-sm">
            <button
              type="button"
              id="hash-mode-text"
              onClick={() => {
                setInputMode('text');
                setFile(null);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                inputMode === 'text'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-neutral-700 dark:text-neutral-300 hover:text-emerald-600'
              }`}
            >
              Text Input
            </button>
            <button
              type="button"
              id="hash-mode-file"
              onClick={() => {
                setInputMode('file');
                setUseHmac(false);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                inputMode === 'file'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-neutral-700 dark:text-neutral-300 hover:text-emerald-600'
              }`}
            >
              File Checksum
            </button>
          </div>

          {inputMode === 'text' && (
            <label
              htmlFor="hash-hmac-toggle"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-850 text-xs font-medium cursor-pointer text-neutral-700 dark:text-neutral-300 select-none"
            >
              <input
                id="hash-hmac-toggle"
                type="checkbox"
                checked={useHmac}
                onChange={(e) => setUseHmac(e.target.checked)}
                className="w-3.5 h-3.5 accent-emerald-600 rounded"
              />
              <span>HMAC Secret Key</span>
            </label>
          )}

          <label
            htmlFor="hash-uppercase-toggle"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-850 text-xs font-medium cursor-pointer text-neutral-700 dark:text-neutral-300 select-none"
          >
            <input
              id="hash-uppercase-toggle"
              type="checkbox"
              checked={uppercase}
              onChange={(e) => setUppercase(e.target.checked)}
              className="w-3.5 h-3.5 accent-emerald-600 rounded"
            />
            <span>UPPERCASE Hex</span>
          </label>
        </div>

        <div className="flex items-center gap-2">
          {inputMode === 'text' && (
            <>
              <button
                type="button"
                id="hash-sample-btn"
                onClick={() => setInputText(SAMPLE_TEXT)}
                className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200/60 dark:hover:bg-neutral-800 transition-colors"
              >
                Sample
              </button>
              <button
                type="button"
                id="hash-clear-btn"
                onClick={() => {
                  setInputText('');
                  setCompareHash('');
                }}
                disabled={!inputText}
                className="p-1.5 rounded-lg text-neutral-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 disabled:opacity-30 transition-colors"
                title="Clear input"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Input Section */}
      {inputMode === 'text' ? (
        <div className="space-y-3">
          {useHmac && (
            <div>
              <label htmlFor="hash-secret-key" className="block text-xs font-semibold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-1.5 flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-emerald-600" />
                <span>HMAC Secret Key (Salt)</span>
              </label>
              <input
                id="hash-secret-key"
                type="text"
                value={secretKey}
                onChange={(e) => setSecretKey(e.target.value)}
                placeholder="Enter secret key for keyed-hash message authentication..."
                className="w-full rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 px-3.5 py-2 text-sm font-mono text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
              />
            </div>
          )}

          <div>
            <div className="flex items-center justify-between mb-1.5 text-xs font-semibold uppercase tracking-wider text-neutral-600 dark:text-neutral-400">
              <label htmlFor="hash-text-input">Plain Text Input</label>
              <span className="font-mono text-neutral-400 font-normal lowercase">
                {inputText.length} chars • {new Blob([inputText]).size} bytes
              </span>
            </div>
            <textarea
              id="hash-text-input"
              rows={4}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Enter or paste text to compute cryptographic hashes..."
              className="w-full p-3.5 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 font-mono text-sm leading-relaxed text-neutral-900 dark:text-neutral-100 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 transition-all resize-y"
            />
          </div>
        </div>
      ) : (
        <div className="p-6 rounded-2xl border-2 border-dashed border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 text-center space-y-3">
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileChange}
            className="hidden"
            id="hash-file-picker"
          />
          <Upload className="w-8 h-8 mx-auto text-emerald-600" />
          <div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-colors"
            >
              Choose Local File to Hash
            </button>
            <p className="text-xs text-neutral-400 mt-2">
              All computation happens 100% locally in your browser. The file is never uploaded.
            </p>
          </div>
          {file && (
            <div className="inline-flex items-center gap-2 p-2 px-3 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-xs font-mono text-neutral-800 dark:text-neutral-200">
              <span>{file.name}</span>
              <span className="text-neutral-400">({(file.size / 1024).toFixed(1)} KB)</span>
              {isHashingFile && <span className="text-emerald-500 font-semibold animate-pulse">Hashing...</span>}
            </div>
          )}
        </div>
      )}

      {/* Calculated Digests List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-neutral-500">
          <span>Cryptographic Hash Digests</span>
          <span>Click icon to copy digest</span>
        </div>

        <div className="space-y-2.5">
          {hashes.map((item) => {
            const displayDigest = uppercase ? item.digest.toUpperCase() : item.digest.toLowerCase();
            const isMatched = compareHash.trim().toLowerCase() === item.digest.toLowerCase();

            return (
              <div
                key={item.id}
                className={`p-3.5 rounded-2xl border transition-all ${
                  isMatched
                    ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20 shadow-sm ring-1 ring-emerald-500'
                    : 'border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-neutral-900 dark:text-neutral-100">
                      {item.name}
                    </span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-500">
                      {item.bits} bits
                    </span>
                    {isMatched && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-600 text-white flex items-center gap-1">
                        <Check className="w-3 h-3" /> MATCHED
                      </span>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => handleCopy(item.digest, item.id)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors"
                  >
                    {copiedId === item.id ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedId === item.id ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>

                <div className="font-mono text-xs text-neutral-800 dark:text-neutral-200 break-all select-all leading-relaxed bg-neutral-50 dark:bg-neutral-950 p-2 rounded-xl border border-neutral-100 dark:border-neutral-800">
                  {displayDigest}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Hash Comparator / Verification Section */}
      <div className="p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/40 space-y-3">
        <label htmlFor="hash-compare-input" className="block text-xs font-semibold uppercase tracking-wider text-neutral-600 dark:text-neutral-400">
          Verify Checksum / Compare Hash
        </label>
        <input
          id="hash-compare-input"
          type="text"
          value={compareHash}
          onChange={(e) => setCompareHash(e.target.value)}
          placeholder="Paste expected hash here to automatically verify match..."
          className="w-full rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 px-3.5 py-2 text-xs font-mono text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
        />

        {comparisonResult && (
          <div
            className={`flex items-center gap-2 p-3 rounded-xl text-xs font-medium ${
              comparisonResult.isMatch
                ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                : 'bg-rose-50 dark:bg-rose-950/30 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
            }`}
          >
            {comparisonResult.isMatch ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>
                  <strong>Exact Match!</strong> Verified against <strong>{comparisonResult.matchedAlgorithm}</strong>.
                </span>
              </>
            ) : (
              <>
                <XCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
                <span>No match found among the calculated hashes. Ensure the input string and algorithm match.</span>
              </>
            )}
          </div>
        )}
      </div>

      {/* Info card */}
      <div className="p-3.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/30 text-xs text-neutral-500 dark:text-neutral-400 flex items-start gap-2.5">
        <Info className="w-4 h-4 shrink-0 text-neutral-400 mt-0.5" />
        <p className="leading-relaxed">
          Cryptographic hashes are one-way irreversible deterministic mathematical functions. A tiny alteration in the source text completely changes the resulting avalanche of bits. SHA-256 and SHA-512 are industry standards for digital signatures, password salting, and file integrity verification.
        </p>
      </div>
    </div>
  );
};
