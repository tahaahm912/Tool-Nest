/**
 * ToolNest - Reusable Formatting and Mathematical Utilities
 * Safe numeric operations preventing NaN, Infinity, and floating-point rounding errors.
 */

export interface FormatNumberOptions {
  minDecimals?: number;
  maxDecimals?: number;
  useGrouping?: boolean;
}

/**
 * Formats a number with commas and controlled decimal places.
 * Safely handles NaN, null, and undefined.
 */
export function formatNumber(
  value: number | string | null | undefined,
  options: number | FormatNumberOptions = {}
): string {
  if (value === null || value === undefined || value === '') return '0';
  const num = typeof value === 'string' ? parseFloat(value) : value;

  if (!isFinite(num) || isNaN(num)) return '0';

  const opts: FormatNumberOptions =
    typeof options === 'number'
      ? { minDecimals: options, maxDecimals: options }
      : options;

  const { minDecimals = 0, maxDecimals = 2, useGrouping = true } = opts;

  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: minDecimals,
    maximumFractionDigits: maxDecimals,
    useGrouping,
  }).format(num);
}

/**
 * Formats currency values with symbols (e.g., $1,250.00, €1.250,00).
 */
export function formatCurrency(
  value: number | string | null | undefined,
  currencyCode: string = 'USD',
  decimals: number = 2
): string {
  if (value === null || value === undefined || value === '') return '$0.00';
  const num = typeof value === 'string' ? parseFloat(value) : value;

  if (!isFinite(num) || isNaN(num)) return '$0.00';

  const currencySymbols: Record<string, string> = {
    USD: '$',
    EUR: '€',
    GBP: '£',
    INR: '₹',
    JPY: '¥',
    CAD: 'CA$',
    AUD: 'A$',
    CHF: 'CHF ',
    CNY: '¥',
  };

  const symbol = currencySymbols[currencyCode] || `${currencyCode} `;
  const formattedVal = formatNumber(num, { minDecimals: decimals, maxDecimals: decimals });
  return `${symbol}${formattedVal}`;
}

/**
 * Formats percentage values (e.g., 25.5%).
 */
export function formatPercent(
  value: number | string | null | undefined,
  decimals: number = 2
): string {
  if (value === null || value === undefined || value === '') return '0%';
  const num = typeof value === 'string' ? parseFloat(value) : value;

  if (!isFinite(num) || isNaN(num)) return '0%';

  // Trim trailing zeros if clean integer
  const formatted = formatNumber(num, { minDecimals: 0, maxDecimals: decimals });
  return `${formatted}%`;
}

/**
 * Formats GPA or CGPA numbers strictly to 2 decimal places.
 */
export function formatGpa(value: number | string | null | undefined): string {
  if (value === null || value === undefined || value === '') return '0.00';
  const num = typeof value === 'string' ? parseFloat(value) : value;

  if (!isFinite(num) || isNaN(num)) return '0.00';
  return num.toFixed(2);
}

/**
 * Division operation that prevents division-by-zero crashes, returning fallback.
 */
export function safeDivide(
  numerator: number,
  denominator: number,
  fallback: number = 0
): number {
  if (!isFinite(numerator) || !isFinite(denominator) || denominator === 0) {
    return fallback;
  }
  const result = numerator / denominator;
  return isFinite(result) ? result : fallback;
}

/**
 * Parses user input string safely into clean number, or null if invalid.
 */
export function parseNumericInput(val: string): number | null {
  const clean = val.trim().replace(/,/g, '');
  if (!clean) return null;
  const num = parseFloat(clean);
  return isNaN(num) ? null : num;
}
