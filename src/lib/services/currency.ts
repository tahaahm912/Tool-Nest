/**
 * ToolNest Currency Service Abstraction
 * Supports live exchange rate fetching with automatic cached fallback to offline rates.
 * Works seamlessly in client-side sandboxes without requiring secret API keys.
 */

export interface CurrencyInfo {
  code: string;
  name: string;
  symbol: string;
  flag: string;
}

export const SUPPORTED_CURRENCIES: CurrencyInfo[] = [
  { code: 'USD', name: 'US Dollar', symbol: '$', flag: '🇺🇸' },
  { code: 'EUR', name: 'Euro', symbol: '€', flag: '🇪🇺' },
  { code: 'GBP', name: 'British Pound', symbol: '£', flag: '🇬🇧' },
  { code: 'INR', name: 'Indian Rupee', symbol: '₹', flag: '🇮🇳' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥', flag: '🇯🇵' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'CA$', flag: '🇨🇦' },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$', flag: '🇦🇺' },
  { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF', flag: '🇨🇭' },
  { code: 'CNY', name: 'Chinese Yuan', symbol: '¥', flag: '🇨🇳' },
  { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$', flag: '🇸🇬' },
  { code: 'NZD', name: 'New Zealand Dollar', symbol: 'NZ$', flag: '🇳🇿' },
  { code: 'AED', name: 'UAE Dirham', symbol: 'AED', flag: '🇦🇪' },
  { code: 'SAR', name: 'Saudi Riyal', symbol: 'SAR', flag: '🇸🇦' },
  { code: 'BRL', name: 'Brazilian Real', symbol: 'R$', flag: '🇧🇷' },
  { code: 'MXN', name: 'Mexican Peso', symbol: 'Mex$', flag: '🇲🇽' },
  { code: 'ZAR', name: 'South African Rand', symbol: 'R', flag: '🇿🇦' },
  { code: 'SEK', name: 'Swedish Krona', symbol: 'kr', flag: '🇸🇪' },
  { code: 'NOK', name: 'Norwegian Krone', symbol: 'kr', flag: '🇳🇴' },
  { code: 'KRW', name: 'South Korean Won', symbol: '₩', flag: '🇰🇷' },
  { code: 'TRY', name: 'Turkish Lira', symbol: '₺', flag: '🇹🇷' },
  { code: 'HKD', name: 'Hong Kong Dollar', symbol: 'HK$', flag: '🇭🇰' },
  { code: 'THB', name: 'Thai Baht', symbol: '฿', flag: '🇹🇭' },
  { code: 'MYR', name: 'Malaysian Ringgit', symbol: 'RM', flag: '🇲🇾' },
  { code: 'IDR', name: 'Indonesian Rupiah', symbol: 'Rp', flag: '🇮🇩' },
  { code: 'PHP', name: 'Philippine Peso', symbol: '₱', flag: '🇵🇭' },
  { code: 'PLN', name: 'Polish Zloty', symbol: 'zł', flag: '🇵🇱' },
  { code: 'DKK', name: 'Danish Krone', symbol: 'kr', flag: '🇩🇰' },
  { code: 'EGP', name: 'Egyptian Pound', symbol: 'E£', flag: '🇪🇬' },
  { code: 'ILS', name: 'Israeli Shekel', symbol: '₪', flag: '🇮🇱' },
  { code: 'CLP', name: 'Chilean Peso', symbol: 'CLP$', flag: '🇨🇱' },
];

/**
 * Baseline fallback exchange rates normalized to USD = 1.0.
 * Used when network requests are unavailable or throttled.
 */
export const BASELINE_USD_RATES: Record<string, number> = {
  USD: 1.0,
  EUR: 0.92,
  GBP: 0.79,
  INR: 86.85,
  JPY: 154.2,
  CAD: 1.41,
  AUD: 1.58,
  CHF: 0.89,
  CNY: 7.24,
  SGD: 1.35,
  NZD: 1.76,
  AED: 3.67,
  SAR: 3.75,
  BRL: 5.76,
  MXN: 20.35,
  ZAR: 18.25,
  SEK: 10.82,
  NOK: 11.05,
  KRW: 1428.5,
  TRY: 35.8,
  HKD: 7.78,
  THB: 34.2,
  MYR: 4.45,
  IDR: 16180.0,
  PHP: 58.4,
  PLN: 4.02,
  DKK: 6.88,
  EGP: 50.4,
  ILS: 3.62,
  CLP: 975.0,
};

export interface RatesResult {
  base: string;
  rates: Record<string, number>;
  lastUpdated: string;
  isLive: boolean;
  provider: string;
}

export interface IExchangeRateService {
  getRates(baseCurrency: string): Promise<RatesResult>;
}

class OpenRateService implements IExchangeRateService {
  private cache: Map<string, { data: RatesResult; timestamp: number }> = new Map();
  private readonly CACHE_TTL_MS = 1000 * 60 * 30; // 30 mins

  async getRates(baseCurrency: string): Promise<RatesResult> {
    const cached = this.cache.get(baseCurrency);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL_MS) {
      return cached.data;
    }

    try {
      // Free public Open Exchange API with CORS enabled
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);

      const response = await fetch(`https://open.er-api.com/v6/latest/${baseCurrency}`, {
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const json = await response.json();
      if (json && json.rates) {
        const result: RatesResult = {
          base: baseCurrency,
          rates: json.rates,
          lastUpdated: json.time_last_update_utc || new Date().toUTCString(),
          isLive: true,
          provider: 'Open Exchange Rates (Live)',
        };
        this.cache.set(baseCurrency, { data: result, timestamp: Date.now() });
        return result;
      }
    } catch {
      // Graceful fallback to embedded reference rates
    }

    // Fallback calculation using baseline rates
    const baseToUsd = 1 / (BASELINE_USD_RATES[baseCurrency] || 1.0);
    const convertedRates: Record<string, number> = {};

    Object.entries(BASELINE_USD_RATES).forEach(([curr, rateVsUsd]) => {
      convertedRates[curr] = rateVsUsd * baseToUsd;
    });

    const fallbackResult: RatesResult = {
      base: baseCurrency,
      rates: convertedRates,
      lastUpdated: new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
      isLive: false,
      provider: 'ToolNest International Forex Index (Reference Rates)',
    };

    return fallbackResult;
  }
}

// Singleton currency service instance
export const currencyService: IExchangeRateService = new OpenRateService();

/**
 * Converts an amount from one currency to another using a rates dictionary.
 */
export function convertCurrency(
  amount: number,
  fromCurrency: string,
  toCurrency: string,
  rates: Record<string, number>,
  baseCurrency: string = 'USD'
): number {
  if (fromCurrency === toCurrency) return amount;
  if (!rates || Object.keys(rates).length === 0) return amount;

  // If rates are already relative to fromCurrency:
  if (baseCurrency === fromCurrency && rates[toCurrency]) {
    return amount * rates[toCurrency];
  }

  // Cross-rate calculation
  const fromRate = rates[fromCurrency] || 1;
  const toRate = rates[toCurrency] || 1;
  return (amount / fromRate) * toRate;
}
