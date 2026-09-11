/**
 * Reusable JSON parsing, formatting, validation, and metadata utilities.
 * 100% Client-side and secure.
 */

export interface JsonErrorDetail {
  message: string;
  line?: number;
  column?: number;
  position?: number;
  snippet?: string;
}

export interface JsonValidationResult {
  valid: boolean;
  isEmpty: boolean;
  data?: any;
  error?: JsonErrorDetail;
  stats?: {
    type: 'object' | 'array' | 'string' | 'number' | 'boolean' | 'null';
    sizeBytes: number;
    charCount: number;
    lineCount: number;
    keysCount: number;
    depth: number;
  };
}

/**
 * Calculates line and column numbers from 0-based character index.
 */
export function getLineColFromIndex(text: string, index: number): { line: number; column: number } {
  let line = 1;
  let column = 1;
  const clamped = Math.max(0, Math.min(index, text.length));

  for (let i = 0; i < clamped; i++) {
    if (text[i] === '\n') {
      line++;
      column = 1;
    } else {
      column++;
    }
  }

  return { line, column };
}

/**
 * Extracts line/col/pos from JSON.parse error message.
 */
function extractErrorLocation(err: Error, text: string): { line?: number; column?: number; position?: number; snippet?: string } {
  const msg = err.message || '';

  // Chrome / V8: "at position 42 (line 3 column 5)"
  const posLineColMatch = msg.match(/at position (\d+)(?: \(line (\d+) column (\d+)\))?/i);
  if (posLineColMatch) {
    const pos = parseInt(posLineColMatch[1], 10);
    const line = posLineColMatch[2] ? parseInt(posLineColMatch[2], 10) : getLineColFromIndex(text, pos).line;
    const col = posLineColMatch[3] ? parseInt(posLineColMatch[3], 10) : getLineColFromIndex(text, pos).column;

    const start = Math.max(0, pos - 20);
    const end = Math.min(text.length, pos + 20);
    const snippet = text.slice(start, end);

    return { line, column: col, position: pos, snippet };
  }

  // Firefox: "JSON.parse: expected double-quoted property name at line 3 column 5 of the JSON data"
  const ffMatch = msg.match(/at line (\d+) column (\d+)/i);
  if (ffMatch) {
    const line = parseInt(ffMatch[1], 10);
    const col = parseInt(ffMatch[2], 10);
    return { line, column: col };
  }

  // Safari: "JSON Parse error: Unexpected identifier "foo""
  return {};
}

/**
 * Recursively calculates structural depth and total keys/items count.
 */
function inspectJsonStructure(val: any, currentDepth = 1): { depth: number; totalKeys: number } {
  if (val === null || typeof val !== 'object') {
    return { depth: currentDepth, totalKeys: 0 };
  }

  let maxChildDepth = currentDepth;
  let keys = 0;

  if (Array.isArray(val)) {
    keys += val.length;
    for (const item of val) {
      if (typeof item === 'object' && item !== null) {
        const res = inspectJsonStructure(item, currentDepth + 1);
        maxChildDepth = Math.max(maxChildDepth, res.depth);
        keys += res.totalKeys;
      }
    }
  } else {
    const objKeys = Object.keys(val);
    keys += objKeys.length;
    for (const k of objKeys) {
      const item = val[k];
      if (typeof item === 'object' && item !== null) {
        const res = inspectJsonStructure(item, currentDepth + 1);
        maxChildDepth = Math.max(maxChildDepth, res.depth);
        keys += res.totalKeys;
      }
    }
  }

  return { depth: maxChildDepth, totalKeys: keys };
}

/**
 * Validates a JSON string with rich location parsing and structure metrics.
 */
export function validateJson(input: string): JsonValidationResult {
  const trimmed = input.trim();
  if (!trimmed) {
    return {
      valid: false,
      isEmpty: true,
    };
  }

  try {
    const parsed = JSON.parse(trimmed);
    const { depth, totalKeys } = inspectJsonStructure(parsed);

    const type =
      parsed === null
        ? 'null'
        : Array.isArray(parsed)
        ? 'array'
        : typeof parsed === 'object'
        ? 'object'
        : (typeof parsed as any);

    return {
      valid: true,
      isEmpty: false,
      data: parsed,
      stats: {
        type,
        sizeBytes: new Blob([trimmed]).size,
        charCount: trimmed.length,
        lineCount: trimmed.split('\n').length,
        keysCount: totalKeys,
        depth,
      },
    };
  } catch (err: any) {
    const loc = extractErrorLocation(err, trimmed);
    return {
      valid: false,
      isEmpty: false,
      error: {
        message: err.message || 'Syntax Error: Invalid JSON format',
        line: loc.line,
        column: loc.column,
        position: loc.position,
        snippet: loc.snippet,
      },
    };
  }
}

/**
 * Formats JSON with indentation (2, 4, or tabs).
 */
export function formatJsonString(input: string, indent: 2 | 4 | '\t' = 2): { success: boolean; result: string; error?: string } {
  try {
    const trimmed = input.trim();
    if (!trimmed) return { success: true, result: '' };
    const parsed = JSON.parse(trimmed);
    const result = JSON.stringify(parsed, null, indent);
    return { success: true, result };
  } catch (err: any) {
    return { success: false, result: '', error: err.message || 'Invalid JSON syntax' };
  }
}

/**
 * Minifies JSON string to a single compact line.
 */
export function minifyJsonString(input: string): { success: boolean; result: string; error?: string } {
  try {
    const trimmed = input.trim();
    if (!trimmed) return { success: true, result: '' };
    const parsed = JSON.parse(trimmed);
    const result = JSON.stringify(parsed);
    return { success: true, result };
  } catch (err: any) {
    return { success: false, result: '', error: err.message || 'Invalid JSON syntax' };
  }
}
