/**
 * Cryptographically Secure Random Number Generator Utilities.
 * Uses window.crypto.getRandomValues to eliminate modulo bias.
 */

export interface RandomNumberOptions {
  min: number;
  max: number;
  quantity: number;
  allowDuplicates: boolean;
  mode: 'integer' | 'decimal';
  decimalPlaces?: number;
  sortOrder?: 'none' | 'asc' | 'desc';
}

export interface RandomNumberResult {
  numbers: number[];
  min: number;
  max: number;
  sum: number;
  average: number;
  uniqueCount: number;
  generatedAt: Date;
}

/**
 * Generates an unbiased cryptographically secure integer in [min, max] inclusive.
 * Uses rejection sampling on 32-bit unsigned integers to eliminate modulo bias.
 */
export function getSecureRandomInt(min: number, max: number): number {
  if (min > max) {
    throw new Error('Minimum value cannot be greater than maximum value');
  }
  if (min === max) return min;

  const range = max - min + 1;
  const maxUint32 = 0xffffffff;
  // Largest multiple of range that fits in 32 bits
  const limit = maxUint32 - (maxUint32 % range);

  const buffer = new Uint32Array(1);
  let randomVal: number;

  do {
    window.crypto.getRandomValues(buffer);
    randomVal = buffer[0];
  } while (randomVal >= limit);

  return min + (randomVal % range);
}

/**
 * Generates a cryptographically secure decimal in [min, max).
 */
export function getSecureRandomFloat(min: number, max: number, decimals: number = 2): number {
  if (min > max) {
    throw new Error('Minimum value cannot be greater than maximum value');
  }
  if (min === max) return min;

  const buffer = new Uint32Array(2);
  window.crypto.getRandomValues(buffer);

  // 53 bits of randomness for standard double precision
  const mantissa = (buffer[0] * 0x200000 + (buffer[1] >>> 11)) * (1 / 0x20000000000000);
  const raw = min + mantissa * (max - min);

  const factor = Math.pow(10, decimals);
  return Math.round(raw * factor) / factor;
}

/**
 * Generates a batch of numbers according to user specifications.
 */
export function generateRandomNumbers(options: RandomNumberOptions): RandomNumberResult {
  const {
    min,
    max,
    quantity,
    allowDuplicates,
    mode,
    decimalPlaces = 2,
    sortOrder = 'none',
  } = options;

  if (min > max) {
    throw new Error('Minimum value cannot be greater than maximum value.');
  }

  if (quantity <= 0) {
    throw new Error('Quantity must be at least 1.');
  }

  if (quantity > 1000) {
    throw new Error('Maximum batch size is 1,000 numbers.');
  }

  if (mode === 'integer' && !allowDuplicates) {
    const availableNumbers = max - min + 1;
    if (quantity > availableNumbers) {
      throw new Error(
        `Cannot generate ${quantity} unique integers from a range of ${availableNumbers} possible values (${min} to ${max}). Either enable duplicates or widen your range.`
      );
    }
  }

  const results: number[] = [];

  if (mode === 'integer') {
    if (!allowDuplicates) {
      // If sampling large portion of range, reservoir or Fisher-Yates shuffle is optimal
      const range = max - min + 1;
      if (quantity > range / 2 && range <= 10000) {
        // Generate full array and shuffle with crypto
        const pool = Array.from({ length: range }, (_, i) => min + i);
        // Partial Fisher-Yates
        for (let i = 0; i < quantity; i++) {
          const j = getSecureRandomInt(i, pool.length - 1);
          const temp = pool[i];
          pool[i] = pool[j];
          pool[j] = temp;
          results.push(pool[i]);
        }
      } else {
        // Set-based rejection sampling for smaller quantities
        const seen = new Set<number>();
        while (results.length < quantity) {
          const n = getSecureRandomInt(min, max);
          if (!seen.has(n)) {
            seen.add(n);
            results.push(n);
          }
        }
      }
    } else {
      for (let i = 0; i < quantity; i++) {
        results.push(getSecureRandomInt(min, max));
      }
    }
  } else {
    // Decimal mode
    if (!allowDuplicates) {
      const seen = new Set<number>();
      let attempts = 0;
      while (results.length < quantity && attempts < quantity * 20) {
        attempts++;
        const n = getSecureRandomFloat(min, max, decimalPlaces);
        if (!seen.has(n)) {
          seen.add(n);
          results.push(n);
        }
      }
      // If range too narrow for decimals, fill remainder
      while (results.length < quantity) {
        results.push(getSecureRandomFloat(min, max, decimalPlaces));
      }
    } else {
      for (let i = 0; i < quantity; i++) {
        results.push(getSecureRandomFloat(min, max, decimalPlaces));
      }
    }
  }

  // Apply sorting if requested
  if (sortOrder === 'asc') {
    results.sort((a, b) => a - b);
  } else if (sortOrder === 'desc') {
    results.sort((a, b) => b - a);
  }

  const calculatedMin = results.length > 0 ? Math.min(...results) : 0;
  const calculatedMax = results.length > 0 ? Math.max(...results) : 0;
  const sum = results.reduce((acc, curr) => acc + curr, 0);
  const average = results.length > 0 ? sum / results.length : 0;
  const uniqueCount = new Set(results).size;

  return {
    numbers: results,
    min: calculatedMin,
    max: calculatedMax,
    sum: Math.round(sum * 1000) / 1000,
    average: Math.round(average * 1000) / 1000,
    uniqueCount,
    generatedAt: new Date(),
  };
}
