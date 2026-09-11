/**
 * Text whitespace cleanup and formatting utilities.
 */

export interface CleanupOptions {
  collapseSpaces: boolean; // Turn 2+ consecutive spaces into 1 space
  trimLines: boolean; // Trim leading/trailing whitespace on every line
  removeEmptyLines: boolean; // Completely strip blank/empty lines
  collapseBlankLines: boolean; // Reduce 2+ consecutive empty lines to 1 blank line
  trimOuter: boolean; // Trim beginning and end of entire text
}

export const DEFAULT_CLEANUP_OPTIONS: CleanupOptions = {
  collapseSpaces: true,
  trimLines: true,
  removeEmptyLines: false,
  collapseBlankLines: true,
  trimOuter: true,
};

export interface CleanupResult {
  cleanedText: string;
  originalCharCount: number;
  cleanedCharCount: number;
  charsRemoved: number;
  reductionPercentage: number;
}

/**
 * Applies selected cleanup operations to text without losing non-whitespace content.
 */
export const cleanText = (text: string, options: CleanupOptions): CleanupResult => {
  const originalCharCount = text.length;
  if (!text) {
    return {
      cleanedText: '',
      originalCharCount: 0,
      cleanedCharCount: 0,
      charsRemoved: 0,
      reductionPercentage: 0,
    };
  }

  let lines = text.split('\n');

  // Step 1: Process each individual line
  lines = lines.map((line) => {
    let l = line;
    if (options.collapseSpaces) {
      // Replace 2 or more horizontal whitespace characters (spaces, tabs) with a single space
      l = l.replace(/[ \t]{2,}/g, ' ');
    }
    if (options.trimLines) {
      l = l.trim();
    }
    return l;
  });

  // Step 2: Line filtering and collapsing
  if (options.removeEmptyLines) {
    lines = lines.filter((line) => line.trim().length > 0);
  } else if (options.collapseBlankLines) {
    const collapsed: string[] = [];
    let prevWasBlank = false;
    for (const line of lines) {
      const isBlank = line.trim().length === 0;
      if (isBlank) {
        if (!prevWasBlank) {
          collapsed.push('');
          prevWasBlank = true;
        }
      } else {
        collapsed.push(line);
        prevWasBlank = false;
      }
    }
    lines = collapsed;
  }

  let cleaned = lines.join('\n');

  if (options.trimOuter) {
    cleaned = cleaned.trim();
  }

  const cleanedCharCount = cleaned.length;
  const charsRemoved = Math.max(0, originalCharCount - cleanedCharCount);
  const reductionPercentage =
    originalCharCount > 0 ? Number(((charsRemoved / originalCharCount) * 100).toFixed(1)) : 0;

  return {
    cleanedText: cleaned,
    originalCharCount,
    cleanedCharCount,
    charsRemoved,
    reductionPercentage,
  };
};
