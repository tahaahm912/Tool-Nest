/**
 * Comprehensive case conversion functions for text, variable names, and copy.
 */

// Minor words that are typically kept lowercase in Title Case unless they are the first or last word
const MINOR_WORDS = new Set([
  'a', 'an', 'the', 'and', 'but', 'or', 'for', 'nor', 'on', 'at', 'to', 'from', 'by', 'with', 'in', 'of',
]);

/**
 * Split text into semantic word tokens, recognizing spaces, underscores, hyphens, and camelCase boundaries.
 */
export const extractWords = (text: string): string[] => {
  if (!text) return [];
  // Handle camelCase and PascalCase transitions (e.g., "myVariableName" -> "my Variable Name")
  const splitCamel = text
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2');

  // Split by non-alphanumeric boundaries (spaces, underscores, hyphens, punctuation)
  const tokens = splitCamel
    .split(/[\s_\-]+/)
    .map((w) => w.replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, ''))
    .filter((w) => w.length > 0);

  return tokens;
};

/**
 * UPPERCASE: Converts all characters to uppercase.
 */
export const toUpperCase = (text: string): string => {
  return text.toUpperCase();
};

/**
 * lowercase: Converts all characters to lowercase.
 */
export const toLowerCase = (text: string): string => {
  return text.toLowerCase();
};

/**
 * Capitalized Case: Capitalizes the first letter of EVERY word.
 */
export const toCapitalizedCase = (text: string): string => {
  if (!text) return '';
  return text.replace(/\b(\p{L})/gu, (char) => char.toUpperCase());
};

/**
 * Title Case: Capitalizes major words while respecting standard grammatical rules.
 */
export const toTitleCase = (text: string): string => {
  if (!text) return '';
  const words = text.toLowerCase().split(/(\s+)/);

  let wordIndex = 0;
  return words
    .map((word) => {
      if (/^\s+$/.test(word)) return word; // Preserve original whitespace

      const isFirstOrLast = wordIndex === 0 || wordIndex === words.filter((w) => !/^\s+$/.test(w)).length - 1;
      wordIndex++;

      // Clean punctuation for minor word checking
      const cleanWord = word.replace(/^[^\p{L}]+|[^\p{L}]+$/gu, '');
      if (!isFirstOrLast && MINOR_WORDS.has(cleanWord)) {
        return word;
      }

      return word.replace(/\b(\p{L})/u, (c) => c.toUpperCase());
    })
    .join('');
};

/**
 * Sentence case: Capitalizes the first letter of each sentence, keeping the rest lowercase.
 */
export const toSentenceCase = (text: string): string => {
  if (!text) return '';
  const lower = text.toLowerCase();
  // Match beginning of text or after punctuation (. ! ?) followed by whitespace
  return lower.replace(/(^\s*|[.!?]\s+)(\p{L})/gu, (_, prefix, char) => {
    return prefix + char.toUpperCase();
  });
};

/**
 * camelCase: Converts text to camelCase (e.g. "hello world" -> "helloWorld").
 */
export const toCamelCase = (text: string): string => {
  const words = extractWords(text);
  if (words.length === 0) return '';
  return words
    .map((w, idx) => {
      const lower = w.toLowerCase();
      if (idx === 0) return lower;
      return lower.charAt(0).toUpperCase() + lower.slice(1);
    })
    .join('');
};

/**
 * PascalCase: Converts text to PascalCase (e.g. "hello world" -> "HelloWorld").
 */
export const toPascalCase = (text: string): string => {
  const words = extractWords(text);
  if (words.length === 0) return '';
  return words
    .map((w) => {
      const lower = w.toLowerCase();
      return lower.charAt(0).toUpperCase() + lower.slice(1);
    })
    .join('');
};

/**
 * snake_case: Converts text to snake_case (e.g. "hello world" -> "hello_world").
 */
export const toSnakeCase = (text: string): string => {
  const words = extractWords(text);
  if (words.length === 0) return '';
  return words.map((w) => w.toLowerCase()).join('_');
};

/**
 * kebab-case: Converts text to kebab-case (e.g. "hello world" -> "hello-world").
 */
export const toKebabCase = (text: string): string => {
  const words = extractWords(text);
  if (words.length === 0) return '';
  return words.map((w) => w.toLowerCase()).join('-');
};

/**
 * CONSTANT_CASE / SCREAMING_SNAKE_CASE: (e.g. "hello world" -> "HELLO_WORLD")
 */
export const toConstantCase = (text: string): string => {
  const words = extractWords(text);
  if (words.length === 0) return '';
  return words.map((w) => w.toUpperCase()).join('_');
};

export type CaseType =
  | 'upper'
  | 'lower'
  | 'title'
  | 'sentence'
  | 'capitalized'
  | 'camel'
  | 'pascal'
  | 'snake'
  | 'kebab'
  | 'constant';

export const convertCase = (text: string, type: CaseType): string => {
  switch (type) {
    case 'upper':
      return toUpperCase(text);
    case 'lower':
      return toLowerCase(text);
    case 'title':
      return toTitleCase(text);
    case 'sentence':
      return toSentenceCase(text);
    case 'capitalized':
      return toCapitalizedCase(text);
    case 'camel':
      return toCamelCase(text);
    case 'pascal':
      return toPascalCase(text);
    case 'snake':
      return toSnakeCase(text);
    case 'kebab':
      return toKebabCase(text);
    case 'constant':
      return toConstantCase(text);
    default:
      return text;
  }
};
