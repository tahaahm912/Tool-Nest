/**
 * Reversal utilities for characters, words, and lines.
 * Unicode and emoji safe to prevent surrogate pair corruption.
 */

export type ReversalMode = 'characters' | 'words' | 'lines' | 'words-in-place';

/**
 * Reverses a string character-by-character without corrupting emoji or surrogate pairs.
 */
export const reverseGraphemes = (str: string): string => {
  if (!str) return '';
  if (typeof Intl !== 'undefined' && 'Segmenter' in Intl) {
    try {
      const segmenter = new (Intl as any).Segmenter(undefined, { granularity: 'grapheme' });
      const segments: string[] = [];
      for (const seg of segmenter.segment(str)) {
        segments.push(seg.segment);
      }
      return segments.reverse().join('');
    } catch {
      // Fallback
    }
  }
  return Array.from(str).reverse().join('');
};

/**
 * Reverses the order of words in text while maintaining line structure or spacing.
 */
export const reverseWords = (text: string): string => {
  if (!text) return '';
  // Process line by line to preserve multiline layouts
  const lines = text.split('\n');
  const reversedLines = lines.map((line) => {
    // Match words and intervening whitespace tokens
    const tokens = line.split(/(\s+)/);
    // Extract actual words (non-whitespace)
    const wordsOnly = tokens.filter((t) => !/^\s+$/.test(t));
    wordsOnly.reverse();

    let wordIdx = 0;
    return tokens
      .map((token) => {
        if (/^\s+$/.test(token)) {
          return token;
        }
        return wordsOnly[wordIdx++] || '';
      })
      .join('');
  });

  return reversedLines.join('\n');
};

/**
 * Reverses the line ordering of multiline text.
 */
export const reverseLines = (text: string): string => {
  if (!text) return '';
  return text.split('\n').reverse().join('\n');
};

/**
 * Reverses each word individually while preserving their positions and sentence order.
 */
export const reverseWordsInPlace = (text: string): string => {
  if (!text) return '';
  return text
    .split(/(\s+)/)
    .map((token) => {
      if (/^\s+$/.test(token)) {
        return token;
      }
      return reverseGraphemes(token);
    })
    .join('');
};

/**
 * Universal text reverser.
 */
export const reverseText = (text: string, mode: ReversalMode): string => {
  switch (mode) {
    case 'characters':
      return reverseGraphemes(text);
    case 'words':
      return reverseWords(text);
    case 'lines':
      return reverseLines(text);
    case 'words-in-place':
      return reverseWordsInPlace(text);
    default:
      return text;
  }
};
