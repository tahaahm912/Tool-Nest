import React, { useState, useMemo } from 'react';
import { Type, Copy, Check, Trash2, Sparkles, ArrowRight } from 'lucide-react';
import { TextInputArea } from '../components/text/TextInputArea';
import { TextOutputArea } from '../components/text/TextOutputArea';
import { convertCase, CaseType } from '../lib/text/case';
import { copyToClipboard } from '../lib/text/clipboard';

interface CaseOption {
  type: CaseType;
  label: string;
  description: string;
  example: string;
}

const CASE_OPTIONS: CaseOption[] = [
  {
    type: 'sentence',
    label: 'Sentence case',
    description: 'Capitalizes the first letter of each sentence.',
    example: 'The quick brown fox jumps over.',
  },
  {
    type: 'title',
    label: 'Title Case',
    description: 'Capitalizes principal words, keeping minor articles lowercase.',
    example: 'The Quick Brown Fox Jumps Over',
  },
  {
    type: 'capitalized',
    label: 'Capitalized Case',
    description: 'Capitalizes the first letter of every single word.',
    example: 'The Quick Brown Fox Jumps Over',
  },
  {
    type: 'upper',
    label: 'UPPERCASE',
    description: 'Converts all letters to upper case.',
    example: 'THE QUICK BROWN FOX',
  },
  {
    type: 'lower',
    label: 'lowercase',
    description: 'Converts all letters to lower case.',
    example: 'the quick brown fox',
  },
  {
    type: 'camel',
    label: 'camelCase',
    description: 'Removes spaces and capitalizes each word except the first.',
    example: 'theQuickBrownFox',
  },
  {
    type: 'pascal',
    label: 'PascalCase',
    description: 'Capitalizes the first letter of every word with no spaces.',
    example: 'TheQuickBrownFox',
  },
  {
    type: 'snake',
    label: 'snake_case',
    description: 'Converts text to lowercase with words joined by underscores.',
    example: 'the_quick_brown_fox',
  },
  {
    type: 'kebab',
    label: 'kebab-case',
    description: 'Converts text to lowercase with words joined by hyphens.',
    example: 'the-quick-brown-fox',
  },
  {
    type: 'constant',
    label: 'CONSTANT_CASE',
    description: 'Uppercase words joined by underscores for code constants.',
    example: 'THE_QUICK_BROWN_FOX',
  },
];

const SAMPLE_TEXT = `the quick brown FOX jumps over the LAZY dog.
it is essential to standardize variable names and document headlines across engineering teams.`;

export const CaseConverter: React.FC = () => {
  const [inputText, setInputText] = useState<string>(SAMPLE_TEXT);
  const [activeCase, setActiveCase] = useState<CaseType>('title');
  const [copied, setCopied] = useState(false);

  const convertedText = useMemo(() => {
    return convertCase(inputText, activeCase);
  }, [inputText, activeCase]);

  const handleCopy = async () => {
    if (!convertedText) return;
    const success = await copyToClipboard(convertedText);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const activeOption = CASE_OPTIONS.find((c) => c.type === activeCase) || CASE_OPTIONS[0];

  return (
    <div className="space-y-6">
      {/* Case Selector Pills */}
      <div className="space-y-2">
        <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300">
          Select Target Case Format:
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
          {CASE_OPTIONS.map((opt) => {
            const isSelected = activeCase === opt.type;
            return (
              <button
                key={opt.type}
                type="button"
                onClick={() => setActiveCase(opt.type)}
                className={`p-2.5 rounded-xl text-left border transition-all ${
                  isSelected
                    ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 border-neutral-900 dark:border-white shadow-sm ring-2 ring-emerald-500/40'
                    : 'bg-white dark:bg-neutral-900 text-neutral-800 dark:text-neutral-200 border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700'
                }`}
              >
                <div className="text-xs font-bold truncate">{opt.label}</div>
                <div
                  className={`text-[10px] font-mono truncate mt-0.5 ${
                    isSelected
                      ? 'text-neutral-300 dark:text-neutral-600'
                      : 'text-neutral-500 dark:text-neutral-400'
                  }`}
                >
                  {opt.example}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Editor & Output Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Input */}
        <TextInputArea
          id="case-converter-input"
          label="Original Input"
          value={inputText}
          onChange={setInputText}
          placeholder="Paste or type text to convert case..."
          rows={9}
        />

        {/* Output */}
        <TextOutputArea
          id="case-converter-output"
          label={`Converted (${activeOption.label})`}
          badge={activeOption.label}
          value={convertedText}
          placeholder="Converted case will appear here..."
          rows={9}
        />
      </div>

      {/* Description banner */}
      <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/40 flex items-center justify-between gap-4 text-xs">
        <div>
          <span className="font-bold text-neutral-900 dark:text-white mr-1.5">
            {activeOption.label}:
          </span>
          <span className="text-neutral-600 dark:text-neutral-400">
            {activeOption.description}
          </span>
        </div>
        <span className="font-mono text-[11px] text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-200/60 dark:border-emerald-800/60 flex-shrink-0">
          {activeOption.example}
        </span>
      </div>

      {/* Action Footer */}
      <div className="flex items-center justify-between gap-3 pt-4 border-t border-neutral-200/80 dark:border-neutral-800/80 flex-wrap">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setInputText('')}
            disabled={!inputText}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border border-neutral-200 dark:border-neutral-800 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors disabled:opacity-40 disabled:pointer-events-none"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear Input</span>
          </button>

          <button
            type="button"
            onClick={() => setInputText(SAMPLE_TEXT)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Load Sample</span>
          </button>
        </div>

        {convertedText && (
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Result Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Converted Text</span>
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
};
