import React, { useState, useEffect, useCallback } from 'react';
import {
  Copy,
  Check,
  RefreshCw,
  ShieldCheck,
  ShieldAlert,
  Eye,
  EyeOff,
  Sparkles,
  Lock,
  RotateCcw,
} from 'lucide-react';
import { OptionToggle } from '../components/text/OptionToggle';
import { copyToClipboard } from '../lib/text/clipboard';

const UPPERCASE_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const LOWERCASE_CHARS = 'abcdefghijklmnopqrstuvwxyz';
const NUMBER_CHARS = '0123456789';
const SYMBOL_CHARS = '!@#$%^&*()_+-=[]{}|;:,.<>?';

const AMBIGUOUS_CHARS = new Set(['O', '0', 'l', '1', 'I', 'o', '|', '`', '\'']);

type StrengthLevel = 'Weak' | 'Fair' | 'Good' | 'Strong';

interface StrengthInfo {
  level: StrengthLevel;
  color: string;
  barColor: string;
  width: string;
  tips: string;
}

export const PasswordGenerator: React.FC = () => {
  const [length, setLength] = useState<number>(18);
  const [includeUpper, setIncludeUpper] = useState<boolean>(true);
  const [includeLower, setIncludeLower] = useState<boolean>(true);
  const [includeNumbers, setIncludeNumbers] = useState<boolean>(true);
  const [includeSymbols, setIncludeSymbols] = useState<boolean>(true);
  const [excludeAmbiguous, setExcludeAmbiguous] = useState<boolean>(false);
  const [requireEveryCategory, setRequireEveryCategory] = useState<boolean>(true);

  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);

  /**
   * Cryptographically secure random integer in [0, max - 1].
   */
  const getSecureRandomInt = (max: number): number => {
    if (max <= 0) return 0;
    const array = new Uint32Array(1);
    // Unbiased rejection sampling to avoid modulo bias
    const maxUint32 = 0xffffffff;
    const limit = maxUint32 - (maxUint32 % max);
    let randomVal = 0;
    do {
      window.crypto.getRandomValues(array);
      randomVal = array[0];
    } while (randomVal >= limit);
    return randomVal % max;
  };

  /**
   * Shuffle array in-place using Fisher-Yates with crypto randomness.
   */
  const cryptoShuffle = (arr: string[]): string[] => {
    const result = [...arr];
    for (let i = result.length - 1; i > 0; i--) {
      const j = getSecureRandomInt(i + 1);
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  };

  const generatePassword = useCallback(() => {
    // Build character pools
    let upperPool = UPPERCASE_CHARS;
    let lowerPool = LOWERCASE_CHARS;
    let numberPool = NUMBER_CHARS;
    let symbolPool = SYMBOL_CHARS;

    if (excludeAmbiguous) {
      upperPool = upperPool.split('').filter((c) => !AMBIGUOUS_CHARS.has(c)).join('');
      lowerPool = lowerPool.split('').filter((c) => !AMBIGUOUS_CHARS.has(c)).join('');
      numberPool = numberPool.split('').filter((c) => !AMBIGUOUS_CHARS.has(c)).join('');
      symbolPool = symbolPool.split('').filter((c) => !AMBIGUOUS_CHARS.has(c)).join('');
    }

    const activePools: string[] = [];
    if (includeUpper && upperPool) activePools.push(upperPool);
    if (includeLower && lowerPool) activePools.push(lowerPool);
    if (includeNumbers && numberPool) activePools.push(numberPool);
    if (includeSymbols && symbolPool) activePools.push(symbolPool);

    if (activePools.length === 0) {
      setPassword('');
      return;
    }

    const chars: string[] = [];

    // If requireEveryCategory is true and length >= number of active categories,
    // ensure at least one character from each active pool
    if (requireEveryCategory && length >= activePools.length) {
      for (const pool of activePools) {
        const randIndex = getSecureRandomInt(pool.length);
        chars.push(pool[randIndex]);
      }
    }

    // Combine all active pools for remainder
    const fullCharset = activePools.join('');

    while (chars.length < length) {
      const randIndex = getSecureRandomInt(fullCharset.length);
      chars.push(fullCharset[randIndex]);
    }

    // Unbiased shuffle so required characters aren't clustered at the beginning
    const finalPassword = cryptoShuffle(chars).join('');
    setPassword(finalPassword);
  }, [
    length,
    includeUpper,
    includeLower,
    includeNumbers,
    includeSymbols,
    excludeAmbiguous,
    requireEveryCategory,
  ]);

  useEffect(() => {
    generatePassword();
  }, [generatePassword]);

  const handleCopy = async () => {
    if (!password) return;
    const success = await copyToClipboard(password);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  /**
   * Password strength calculation based on length and character set variety.
   */
  const calculateStrength = (): StrengthInfo => {
    if (!password) {
      return {
        level: 'Weak',
        color: 'text-neutral-400',
        barColor: 'bg-neutral-300 dark:bg-neutral-700',
        width: '5%',
        tips: 'Select at least one character set to generate a password.',
      };
    }

    let categoriesCount = 0;
    if (/[A-Z]/.test(password)) categoriesCount++;
    if (/[a-z]/.test(password)) categoriesCount++;
    if (/[0-9]/.test(password)) categoriesCount++;
    if (/[^A-Za-z0-9]/.test(password)) categoriesCount++;

    if (length < 8 || categoriesCount <= 1) {
      return {
        level: 'Weak',
        color: 'text-rose-600 dark:text-rose-400',
        barColor: 'bg-rose-500',
        width: '25%',
        tips: 'Very susceptible to automated dictionary attacks. Increase length to 12+ characters.',
      };
    }

    if (length < 12 || categoriesCount === 2) {
      return {
        level: 'Fair',
        color: 'text-amber-600 dark:text-amber-400',
        barColor: 'bg-amber-500',
        width: '50%',
        tips: 'Decent protection for low-risk accounts. Add symbols or numbers for greater resilience.',
      };
    }

    if (length < 16 || categoriesCount === 3) {
      return {
        level: 'Good',
        color: 'text-blue-600 dark:text-blue-400',
        barColor: 'bg-blue-500',
        width: '75%',
        tips: 'Safe against standard brute-force cracking. Recommended minimum for personal accounts.',
      };
    }

    return {
      level: 'Strong',
      color: 'text-emerald-600 dark:text-emerald-400',
      barColor: 'bg-emerald-600',
      width: '100%',
      tips: 'Cryptographically high entropy. Ideal for master passwords, crypto keys, and banking.',
    };
  };

  const strength = calculateStrength();

  const handleResetDefaults = () => {
    setLength(18);
    setIncludeUpper(true);
    setIncludeLower(true);
    setIncludeNumbers(true);
    setIncludeSymbols(true);
    setExcludeAmbiguous(false);
    setRequireEveryCategory(true);
  };

  const noCategoriesSelected = !includeUpper && !includeLower && !includeNumbers && !includeSymbols;

  return (
    <div className="space-y-6">
      {/* Password Display Card */}
      <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-900 text-white dark:bg-neutral-800/90 p-5 sm:p-7 shadow-sm space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-300">
              Generated Password
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-neutral-200 transition-colors"
              title={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>

            <button
              type="button"
              onClick={generatePassword}
              disabled={noCategoriesSelected}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-neutral-200 transition-colors disabled:opacity-30"
              title="Regenerate password"
            >
              <RefreshCw className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={handleCopy}
              disabled={!password}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-colors disabled:opacity-30"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Token string */}
        <div className="py-2">
          {noCategoriesSelected ? (
            <div className="text-rose-400 text-sm font-semibold">
              Please select at least one character category below.
            </div>
          ) : (
            <div className="font-mono text-xl sm:text-2xl font-bold tracking-wider break-all select-all text-white">
              {showPassword ? password : '•'.repeat(password.length)}
            </div>
          )}
        </div>

        {/* Strength meter bar */}
        <div className="pt-2 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-neutral-300">Strength:</span>
            <span className="font-bold text-white uppercase tracking-wider">
              {strength.level} ({length} characters)
            </span>
          </div>

          <div className="w-full h-2 rounded-full bg-white/20 overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${strength.barColor}`}
              style={{ width: strength.width }}
            />
          </div>

          <p className="text-[11px] text-neutral-300">{strength.tips}</p>
        </div>
      </div>

      {/* Configuration Controls */}
      <div className="space-y-5 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/70 dark:bg-neutral-900/40 p-5 sm:p-6">
        {/* Length Slider */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <label
              htmlFor="password-length-slider"
              className="text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300"
            >
              Password Length:
            </label>
            <div className="flex items-center gap-2">
              <span className="text-xs text-neutral-500 dark:text-neutral-400">Characters:</span>
              <span className="font-mono font-bold text-base px-2.5 py-0.5 rounded-md bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-emerald-600 dark:text-emerald-400">
                {length}
              </span>
            </div>
          </div>

          <input
            id="password-length-slider"
            type="range"
            min="6"
            max="64"
            value={length}
            onChange={(e) => setLength(Number(e.target.value))}
            className="w-full accent-emerald-600 cursor-pointer h-2 bg-neutral-200 dark:bg-neutral-800 rounded-lg"
          />

          <div className="flex justify-between text-[10px] text-neutral-400 font-mono">
            <span>6 (Min)</span>
            <span>16 (Recommended)</span>
            <span>32</span>
            <span>64 (Max)</span>
          </div>
        </div>

        {/* Character Categories */}
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 block">
            Character Sets:
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            <OptionToggle
              id="pwd-upper"
              label="Uppercase Letters"
              description="A, B, C, D... Z"
              checked={includeUpper}
              onChange={setIncludeUpper}
            />

            <OptionToggle
              id="pwd-lower"
              label="Lowercase Letters"
              description="a, b, c, d... z"
              checked={includeLower}
              onChange={setIncludeLower}
            />

            <OptionToggle
              id="pwd-numbers"
              label="Numbers"
              description="0, 1, 2, 3... 9"
              checked={includeNumbers}
              onChange={setIncludeNumbers}
            />

            <OptionToggle
              id="pwd-symbols"
              label="Special Symbols"
              description="!@#$%^&*()_+-="
              checked={includeSymbols}
              onChange={setIncludeSymbols}
            />
          </div>
        </div>

        {/* Advanced Options */}
        <div className="space-y-2 pt-2 border-t border-neutral-200/80 dark:border-neutral-800/80">
          <label className="text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 block">
            Security & Clarity Rules:
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <OptionToggle
              id="pwd-ambiguous"
              label="Exclude Ambiguous Characters"
              description="Removes confusing characters: O, 0, l, 1, I, |"
              checked={excludeAmbiguous}
              onChange={setExcludeAmbiguous}
            />

            <OptionToggle
              id="pwd-require-all"
              label="Guarantee Category Representation"
              description="Forces at least one character from every active set."
              checked={requireEveryCategory}
              onChange={setRequireEveryCategory}
            />
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="flex items-center justify-between gap-3 pt-4 border-t border-neutral-200/80 dark:border-neutral-800/80 flex-wrap">
        <button
          type="button"
          onClick={handleResetDefaults}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Defaults</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={generatePassword}
            disabled={noCategoriesSelected}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-800 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 shadow-sm transition-colors disabled:opacity-40"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Generate New</span>
          </button>

          {password && (
            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Password Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Password</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
