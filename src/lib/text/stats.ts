/**
 * Comprehensive Unicode-aware text statistics calculation.
 */

export interface TextStats {
  characters: number;
  charactersNoSpaces: number;
  words: number;
  sentences: number;
  paragraphs: number;
  lines: number;
  spaces: number;
  readingTimeMinutes: number;
  speakingTimeMinutes: number;
  avgWordLength: number;
}

/**
 * Counts characters safely, handling Unicode surrogates and emojis.
 */
export const countGraphemes = (text: string): number => {
  if (!text) return 0;
  if (typeof Intl !== 'undefined' && 'Segmenter' in Intl) {
    try {
      const segmenter = new (Intl as any).Segmenter(undefined, { granularity: 'grapheme' });
      let count = 0;
      for (const _ of segmenter.segment(text)) {
        count++;
      }
      return count;
    } catch {
      // Fallback
    }
  }
  // Code point expansion fallback
  return Array.from(text).length;
};

/**
 * Counts words accurately, ignoring leading/trailing/consecutive whitespaces.
 */
export const countWords = (text: string): number => {
  const trimmed = text.trim();
  if (!trimmed) return 0;
  // Match non-whitespace blocks or word segments
  const words = trimmed.split(/\s+/);
  return words.filter((w) => w.length > 0).length;
};

/**
 * Counts sentences handling common punctuation (.!?) and spacing.
 */
export const countSentences = (text: string): number => {
  const trimmed = text.trim();
  if (!trimmed) return 0;
  // Match sequences ending in ., !, or ? followed by whitespace or end of string
  const matches = trimmed.match(/[^.!?]+[.!?]+(\s|$)/g);
  return matches ? matches.length : 1;
};

/**
 * Counts paragraphs separated by newline breaks.
 */
export const countParagraphs = (text: string): number => {
  const trimmed = text.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\n+/).filter((p) => p.trim().length > 0).length;
};

/**
 * Counts line breaks.
 */
export const countLines = (text: string): number => {
  if (!text) return 0;
  return text.split('\n').length;
};

/**
 * Counts total whitespace characters (spaces, tabs, newlines).
 */
export const countSpaces = (text: string): number => {
  const matches = text.match(/\s/g);
  return matches ? matches.length : 0;
};

/**
 * Calculate comprehensive text statistics in a single pass.
 */
export const calculateTextStats = (text: string): TextStats => {
  if (!text) {
    return {
      characters: 0,
      charactersNoSpaces: 0,
      words: 0,
      sentences: 0,
      paragraphs: 0,
      lines: 0,
      spaces: 0,
      readingTimeMinutes: 0,
      speakingTimeMinutes: 0,
      avgWordLength: 0,
    };
  }

  const characters = countGraphemes(text);
  const charactersNoSpaces = countGraphemes(text.replace(/\s/g, ''));
  const words = countWords(text);
  const sentences = countSentences(text);
  const paragraphs = countParagraphs(text);
  const lines = countLines(text);
  const spaces = countSpaces(text);

  // Average reading speed: 200 words per minute
  // Average speaking speed: 130 words per minute
  const readingTimeMinutes = Math.max(1, Math.ceil(words / 200));
  const speakingTimeMinutes = Math.max(1, Math.ceil(words / 130));

  const avgWordLength = words > 0 ? Number((charactersNoSpaces / words).toFixed(1)) : 0;

  return {
    characters,
    charactersNoSpaces,
    words,
    sentences,
    paragraphs,
    lines,
    spaces,
    readingTimeMinutes: words === 0 ? 0 : readingTimeMinutes,
    speakingTimeMinutes: words === 0 ? 0 : speakingTimeMinutes,
    avgWordLength,
  };
};
