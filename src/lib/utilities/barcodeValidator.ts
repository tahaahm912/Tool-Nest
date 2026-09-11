/**
 * Barcode format validators, checksum calculators, and specifications.
 */

export type BarcodeFormat = 'CODE128' | 'EAN13' | 'EAN8' | 'UPC' | 'CODE39' | 'ITF14';

export interface BarcodeFormatMeta {
  id: BarcodeFormat;
  name: string;
  category: string;
  description: string;
  placeholder: string;
  defaultExample: string;
  allowedCharsDescription: string;
}

export const BARCODE_FORMATS: BarcodeFormatMeta[] = [
  {
    id: 'CODE128',
    name: 'Code 128',
    category: 'Universal / Logistics',
    description: 'High-density alphanumeric barcode supporting all standard 128 ASCII characters.',
    placeholder: 'e.g. TN-LOG-98214',
    defaultExample: 'TN-DAILY-2026',
    allowedCharsDescription: 'Any standard ASCII characters (letters, numbers, symbols).',
  },
  {
    id: 'EAN13',
    name: 'EAN-13',
    category: 'Retail (Global)',
    description: 'International standard for commercial products sold at retail point-of-sale outside North America.',
    placeholder: '12 or 13 digits, e.g. 5901234123457',
    defaultExample: '5901234123457',
    allowedCharsDescription: 'Exactly 12 or 13 digits (0-9). 13th digit is the Modulo-10 checksum.',
  },
  {
    id: 'EAN8',
    name: 'EAN-8',
    category: 'Retail (Small items)',
    description: 'Compact 8-digit barcode designed for small packages with limited label space.',
    placeholder: '7 or 8 digits, e.g. 96385074',
    defaultExample: '96385074',
    allowedCharsDescription: 'Exactly 7 or 8 digits (0-9). 8th digit is the Modulo-10 checksum.',
  },
  {
    id: 'UPC',
    name: 'UPC-A',
    category: 'Retail (North America)',
    description: 'Standard 12-digit barcode widely used in the United States and Canada.',
    placeholder: '11 or 12 digits, e.g. 012345678905',
    defaultExample: '012345678905',
    allowedCharsDescription: 'Exactly 11 or 12 digits (0-9). 12th digit is the Modulo-10 checksum.',
  },
  {
    id: 'CODE39',
    name: 'Code 39',
    category: 'Industrial / Defense',
    description: 'Standard industrial barcode supporting uppercase letters, numbers, and common punctuation.',
    placeholder: 'e.g. INVENT-2026-X',
    defaultExample: 'CODE39-TEST',
    allowedCharsDescription: 'Uppercase letters (A-Z), numbers (0-9), and characters: - . $ / + % [space].',
  },
  {
    id: 'ITF14',
    name: 'ITF-14',
    category: 'Shipping / Master Cartons',
    description: 'Interleaved 2 of 5 standard used to mark corrugated cardboard packaging and cartons.',
    placeholder: '13 or 14 digits, e.g. 10012345678902',
    defaultExample: '10012345678902',
    allowedCharsDescription: 'Exactly 13 or 14 numeric digits (0-9).',
  },
];

/**
 * Calculates standard Modulo 10 check digit for EAN-13, EAN-8, UPC-A, and ITF-14.
 */
export function calculateEanCheckDigit(digitsWithoutCheck: string): number {
  const digits = digitsWithoutCheck.split('').map(Number);
  const len = digits.length;
  let sum = 0;

  for (let i = 0; i < len; i++) {
    // Starting from rightmost to leftmost: alternating weights 3 and 1
    const weight = (len - i) % 2 === 1 ? 3 : 1;
    sum += digits[i] * weight;
  }

  const remainder = sum % 10;
  return remainder === 0 ? 0 : 10 - remainder;
}

export interface ValidationResult {
  isValid: boolean;
  sanitizedValue: string;
  errorMessage?: string;
  warningMessage?: string;
  computedCheckDigit?: number;
}

/**
 * Validates a barcode string for the given format.
 */
export function validateBarcode(format: BarcodeFormat, rawValue: string): ValidationResult {
  const value = rawValue.trim();

  if (!value) {
    return {
      isValid: false,
      sanitizedValue: '',
      errorMessage: 'Please enter a barcode value to generate.',
    };
  }

  switch (format) {
    case 'CODE128': {
      // Must contain only ASCII 0-127
      for (let i = 0; i < value.length; i++) {
        if (value.charCodeAt(i) > 127) {
          return {
            isValid: false,
            sanitizedValue: value,
            errorMessage: `Invalid character '${value[i]}' at position ${i + 1}. Code 128 requires standard ASCII characters.`,
          };
        }
      }
      return { isValid: true, sanitizedValue: value };
    }

    case 'EAN13': {
      const cleanDigits = value.replace(/\s+/g, '');
      if (!/^\d+$/.test(cleanDigits)) {
        return {
          isValid: false,
          sanitizedValue: cleanDigits,
          errorMessage: 'EAN-13 allows only numeric digits (0-9). Letters and symbols are not permitted.',
        };
      }

      if (cleanDigits.length === 12) {
        const check = calculateEanCheckDigit(cleanDigits);
        return {
          isValid: true,
          sanitizedValue: cleanDigits + check,
          warningMessage: `Auto-appended checksum digit ${check} to complete 13 digits.`,
          computedCheckDigit: check,
        };
      }

      if (cleanDigits.length === 13) {
        const payload = cleanDigits.slice(0, 12);
        const expectedCheck = calculateEanCheckDigit(payload);
        const actualCheck = Number(cleanDigits[12]);

        if (expectedCheck !== actualCheck) {
          return {
            isValid: false,
            sanitizedValue: cleanDigits,
            errorMessage: `Invalid EAN-13 check digit. Last digit is ${actualCheck}, but should be ${expectedCheck} (calculated from ${payload}).`,
            computedCheckDigit: expectedCheck,
          };
        }
        return { isValid: true, sanitizedValue: cleanDigits };
      }

      return {
        isValid: false,
        sanitizedValue: cleanDigits,
        errorMessage: `EAN-13 requires exactly 12 or 13 digits (entered ${cleanDigits.length}).`,
      };
    }

    case 'EAN8': {
      const cleanDigits = value.replace(/\s+/g, '');
      if (!/^\d+$/.test(cleanDigits)) {
        return {
          isValid: false,
          sanitizedValue: cleanDigits,
          errorMessage: 'EAN-8 allows only numeric digits (0-9). Letters and symbols are not permitted.',
        };
      }

      if (cleanDigits.length === 7) {
        const check = calculateEanCheckDigit(cleanDigits);
        return {
          isValid: true,
          sanitizedValue: cleanDigits + check,
          warningMessage: `Auto-appended checksum digit ${check} to complete 8 digits.`,
          computedCheckDigit: check,
        };
      }

      if (cleanDigits.length === 8) {
        const payload = cleanDigits.slice(0, 7);
        const expectedCheck = calculateEanCheckDigit(payload);
        const actualCheck = Number(cleanDigits[7]);

        if (expectedCheck !== actualCheck) {
          return {
            isValid: false,
            sanitizedValue: cleanDigits,
            errorMessage: `Invalid EAN-8 check digit. Last digit is ${actualCheck}, but should be ${expectedCheck} (calculated from ${payload}).`,
            computedCheckDigit: expectedCheck,
          };
        }
        return { isValid: true, sanitizedValue: cleanDigits };
      }

      return {
        isValid: false,
        sanitizedValue: cleanDigits,
        errorMessage: `EAN-8 requires exactly 7 or 8 digits (entered ${cleanDigits.length}).`,
      };
    }

    case 'UPC': {
      const cleanDigits = value.replace(/\s+/g, '');
      if (!/^\d+$/.test(cleanDigits)) {
        return {
          isValid: false,
          sanitizedValue: cleanDigits,
          errorMessage: 'UPC-A allows only numeric digits (0-9). Letters and symbols are not permitted.',
        };
      }

      if (cleanDigits.length === 11) {
        const check = calculateEanCheckDigit(cleanDigits);
        return {
          isValid: true,
          sanitizedValue: cleanDigits + check,
          warningMessage: `Auto-appended checksum digit ${check} to complete 12 digits.`,
          computedCheckDigit: check,
        };
      }

      if (cleanDigits.length === 12) {
        const payload = cleanDigits.slice(0, 11);
        const expectedCheck = calculateEanCheckDigit(payload);
        const actualCheck = Number(cleanDigits[11]);

        if (expectedCheck !== actualCheck) {
          return {
            isValid: false,
            sanitizedValue: cleanDigits,
            errorMessage: `Invalid UPC-A check digit. Last digit is ${actualCheck}, but should be ${expectedCheck} (calculated from ${payload}).`,
            computedCheckDigit: expectedCheck,
          };
        }
        return { isValid: true, sanitizedValue: cleanDigits };
      }

      return {
        isValid: false,
        sanitizedValue: cleanDigits,
        errorMessage: `UPC-A requires exactly 11 or 12 digits (entered ${cleanDigits.length}).`,
      };
    }

    case 'CODE39': {
      const upper = value.toUpperCase();
      const code39Regex = /^[0-9A-Z\-.$/+% ]+$/;
      if (!code39Regex.test(upper)) {
        return {
          isValid: false,
          sanitizedValue: upper,
          errorMessage: 'Code 39 only allows uppercase letters (A-Z), numbers (0-9), space, and symbols: - . $ / + %',
        };
      }
      return { isValid: true, sanitizedValue: upper };
    }

    case 'ITF14': {
      const cleanDigits = value.replace(/\s+/g, '');
      if (!/^\d+$/.test(cleanDigits)) {
        return {
          isValid: false,
          sanitizedValue: cleanDigits,
          errorMessage: 'ITF-14 allows only numeric digits (0-9).',
        };
      }

      if (cleanDigits.length === 13) {
        const check = calculateEanCheckDigit(cleanDigits);
        return {
          isValid: true,
          sanitizedValue: cleanDigits + check,
          warningMessage: `Auto-appended checksum digit ${check} to complete 14 digits.`,
          computedCheckDigit: check,
        };
      }

      if (cleanDigits.length === 14) {
        const payload = cleanDigits.slice(0, 13);
        const expectedCheck = calculateEanCheckDigit(payload);
        const actualCheck = Number(cleanDigits[13]);

        if (expectedCheck !== actualCheck) {
          return {
            isValid: false,
            sanitizedValue: cleanDigits,
            errorMessage: `Invalid ITF-14 check digit. Last digit is ${actualCheck}, but should be ${expectedCheck}.`,
            computedCheckDigit: expectedCheck,
          };
        }
        return { isValid: true, sanitizedValue: cleanDigits };
      }

      return {
        isValid: false,
        sanitizedValue: cleanDigits,
        errorMessage: `ITF-14 requires exactly 13 or 14 digits (entered ${cleanDigits.length}).`,
      };
    }

    default:
      return { isValid: true, sanitizedValue: value };
  }
}
