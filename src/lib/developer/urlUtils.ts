/**
 * Reusable URL Encoding, Decoding, and Parsing Utilities.
 * 100% Client-side and robust against URIError.
 */

export interface UrlParamItem {
  key: string;
  value: string;
}

export interface ParsedUrlDetails {
  isValidUrl: boolean;
  protocol?: string;
  host?: string;
  pathname?: string;
  search?: string;
  hash?: string;
  params: UrlParamItem[];
}

/**
 * Encodes text or URL component with options.
 */
export function encodeUrlText(
  input: string,
  mode: 'component' | 'full' = 'component',
  spaceAsPlus: boolean = false
): { result: string; error?: string } {
  try {
    if (!input) return { result: '' };

    let encoded = mode === 'component' ? encodeURIComponent(input) : encodeURI(input);

    if (spaceAsPlus) {
      encoded = encoded.replace(/%20/g, '+');
    }

    return { result: encoded };
  } catch (err: any) {
    return { result: '', error: err.message || 'Failed to encode URL' };
  }
}

/**
 * Decodes URL string safely.
 */
export function decodeUrlText(
  input: string,
  mode: 'component' | 'full' = 'component',
  plusAsSpace: boolean = true
): { result: string; error?: string } {
  try {
    if (!input) return { result: '' };

    let prepared = input;
    if (plusAsSpace) {
      prepared = prepared.replace(/\+/g, ' ');
    }

    const decoded = mode === 'component' ? decodeURIComponent(prepared) : decodeURI(prepared);
    return { result: decoded };
  } catch (err: any) {
    return {
      result: '',
      error: 'Malformed URL sequence: contains invalid percent-encoded characters (e.g. invalid % sequences)',
    };
  }
}

/**
 * Inspects whether the string is a complete URL and extracts its query params and parts.
 */
export function parseUrlStructure(text: string): ParsedUrlDetails {
  const trimmed = text.trim();
  if (!trimmed) {
    return { isValidUrl: false, params: [] };
  }

  try {
    // Try standard URL parsing (must include protocol)
    let urlObj: URL;
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('ftp://')) {
      urlObj = new URL(trimmed);
    } else if (trimmed.includes('?') && !trimmed.includes(' ')) {
      urlObj = new URL('https://domain.com/' + trimmed.replace(/^\//, ''));
    } else {
      return { isValidUrl: false, params: [] };
    }

    const params: UrlParamItem[] = [];
    urlObj.searchParams.forEach((value, key) => {
      params.push({ key, value });
    });

    const isRealUrl = trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('ftp://');

    return {
      isValidUrl: isRealUrl,
      protocol: isRealUrl ? urlObj.protocol : undefined,
      host: isRealUrl ? urlObj.host : undefined,
      pathname: isRealUrl ? urlObj.pathname : undefined,
      search: urlObj.search || undefined,
      hash: urlObj.hash || undefined,
      params,
    };
  } catch {
    return { isValidUrl: false, params: [] };
  }
}
