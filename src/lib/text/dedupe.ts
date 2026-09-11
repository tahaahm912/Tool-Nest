/**
 * Duplicate line removal and deduplication utilities.
 */

export interface DedupeOptions {
  caseSensitive: boolean;
  ignoreWhitespace: boolean;
  removeEmptyLines: boolean;
}

export const DEFAULT_DEDUPE_OPTIONS: DedupeOptions = {
  caseSensitive: false,
  ignoreWhitespace: true,
  removeEmptyLines: true,
};

export interface DedupeResult {
  uniqueText: string;
  originalLinesCount: number;
  uniqueLinesCount: number;
  duplicatesRemoved: number;
}

/**
 * Removes duplicate lines while strictly preserving first occurrence ordering.
 */
export const removeDuplicateLines = (text: string, options: DedupeOptions): DedupeResult => {
  if (!text) {
    return {
      uniqueText: '',
      originalLinesCount: 0,
      uniqueLinesCount: 0,
      duplicatesRemoved: 0,
    };
  }

  const rawLines = text.split('\n');
  const originalLinesCount = rawLines.length;

  const seenKeys = new Set<string>();
  const uniqueLines: string[] = [];

  for (const line of rawLines) {
    let comparisonKey = line;

    if (options.ignoreWhitespace) {
      comparisonKey = comparisonKey.trim();
    }

    if (options.removeEmptyLines && comparisonKey.length === 0) {
      continue;
    }

    if (!options.caseSensitive) {
      comparisonKey = comparisonKey.toLowerCase();
    }

    if (!seenKeys.has(comparisonKey)) {
      seenKeys.add(comparisonKey);
      // Keep output formatted according to whitespace preference
      uniqueLines.push(options.ignoreWhitespace ? line.trim() : line);
    }
  }

  const uniqueLinesCount = uniqueLines.length;
  const duplicatesRemoved = Math.max(0, originalLinesCount - uniqueLinesCount);

  return {
    uniqueText: uniqueLines.join('\n'),
    originalLinesCount,
    uniqueLinesCount,
    duplicatesRemoved,
  };
};
