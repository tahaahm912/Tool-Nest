/**
 * Multiline text sorting utilities.
 */

export type SortMode =
  | 'alphabetical-asc'
  | 'alphabetical-desc'
  | 'length-asc'
  | 'length-desc'
  | 'numeric-asc'
  | 'numeric-desc'
  | 'random';

export interface SortOptions {
  mode: SortMode;
  caseSensitive: boolean;
  removeEmptyLines: boolean;
  trimLines: boolean;
}

export const DEFAULT_SORT_OPTIONS: SortOptions = {
  mode: 'alphabetical-asc',
  caseSensitive: false,
  removeEmptyLines: true,
  trimLines: false,
};

/**
 * Fisher-Yates unbiased shuffle algorithm.
 */
export const shuffleArray = <T>(array: T[]): T[] => {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    // Generate cryptographically secure or pseudo-random integer index
    let j: number;
    if (typeof window !== 'undefined' && window.crypto && window.crypto.getRandomValues) {
      const buf = new Uint32Array(1);
      window.crypto.getRandomValues(buf);
      j = buf[0] % (i + 1);
    } else {
      j = Math.floor(Math.random() * (i + 1));
    }
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
};

/**
 * Extracts a numeric value from the beginning or content of a string line for numeric sorting.
 */
const extractLeadingNumber = (str: string): number => {
  const match = str.match(/[-+]?[0-9]*\.?[0-9]+/);
  if (!match) return NaN;
  return parseFloat(match[0]);
};

/**
 * Sorts multiline text based on configuration.
 */
export const sortLines = (text: string, options: SortOptions): string => {
  if (!text) return '';

  let lines = text.split('\n');

  if (options.trimLines) {
    lines = lines.map((l) => l.trim());
  }

  if (options.removeEmptyLines) {
    lines = lines.filter((l) => l.trim().length > 0);
  }

  if (lines.length <= 1) {
    return lines.join('\n');
  }

  const { mode, caseSensitive } = options;

  if (mode === 'random') {
    return shuffleArray(lines).join('\n');
  }

  const sorted = [...lines].sort((a, b) => {
    switch (mode) {
      case 'alphabetical-asc': {
        if (!caseSensitive) {
          return a.localeCompare(b, undefined, { sensitivity: 'base' });
        }
        return a.localeCompare(b);
      }

      case 'alphabetical-desc': {
        if (!caseSensitive) {
          return b.localeCompare(a, undefined, { sensitivity: 'base' });
        }
        return b.localeCompare(a);
      }

      case 'length-asc': {
        if (a.length !== b.length) {
          return a.length - b.length;
        }
        return a.localeCompare(b);
      }

      case 'length-desc': {
        if (a.length !== b.length) {
          return b.length - a.length;
        }
        return a.localeCompare(b);
      }

      case 'numeric-asc': {
        const numA = extractLeadingNumber(a);
        const numB = extractLeadingNumber(b);

        if (!isNaN(numA) && !isNaN(numB)) {
          return numA - numB;
        }
        if (!isNaN(numA)) return -1;
        if (!isNaN(numB)) return 1;
        return a.localeCompare(b);
      }

      case 'numeric-desc': {
        const numA = extractLeadingNumber(a);
        const numB = extractLeadingNumber(b);

        if (!isNaN(numA) && !isNaN(numB)) {
          return numB - numA;
        }
        if (!isNaN(numA)) return 1;
        if (!isNaN(numB)) return -1;
        return b.localeCompare(a);
      }

      default:
        return 0;
    }
  });

  return sorted.join('\n');
};
