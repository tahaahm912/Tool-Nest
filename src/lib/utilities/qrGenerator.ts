/**
 * QR Code Generator Utilities.
 * Formats structured payloads (URL, Email, Phone, SMS, WiFi) and calculates color contrast ratios.
 */

export type QrPayloadType = 'url' | 'text' | 'email' | 'phone' | 'sms' | 'wifi';

export interface EmailData {
  address: string;
  subject?: string;
  body?: string;
}

export interface SmsData {
  phone: string;
  message?: string;
}

export interface WifiData {
  ssid: string;
  password?: string;
  encryption: 'WPA' | 'WEP' | 'nopass';
  hidden?: boolean;
}

/**
 * Builds standard encoded payload string based on type.
 */
export function formatQrPayload(
  type: QrPayloadType,
  data: {
    rawText: string;
    url: string;
    email: EmailData;
    phone: string;
    sms: SmsData;
    wifi: WifiData;
  }
): string {
  switch (type) {
    case 'url': {
      let u = data.url.trim();
      if (!u) return '';
      if (!/^https?:\/\//i.test(u) && !u.startsWith('/')) {
        u = 'https://' + u;
      }
      return u;
    }

    case 'email': {
      const email = data.email.address.trim();
      if (!email) return '';
      const params = new URLSearchParams();
      if (data.email.subject) params.append('subject', data.email.subject);
      if (data.email.body) params.append('body', data.email.body);
      const query = params.toString();
      return `mailto:${email}${query ? '?' + query : ''}`;
    }

    case 'phone': {
      const p = data.phone.trim();
      if (!p) return '';
      return `tel:${p}`;
    }

    case 'sms': {
      const p = data.sms.phone.trim();
      if (!p) return '';
      const msg = data.sms.message || '';
      return `smsto:${p}:${msg}`;
    }

    case 'wifi': {
      const ssid = (data.wifi.ssid || '').replace(/([\\;,:"])/g, '\\$1');
      const pass = (data.wifi.password || '').replace(/([\\;,:"])/g, '\\$1');
      const enc = data.wifi.encryption || 'WPA';
      const hidden = data.wifi.hidden ? 'true' : 'false';
      return `WIFI:T:${enc};S:${ssid};P:${pass};H:${hidden};;`;
    }

    case 'text':
    default:
      return data.rawText;
  }
}

/**
 * Calculates relative luminance for WCAG contrast ratio.
 */
function getRelativeLuminance(hex: string): number {
  let cleanHex = hex.replace('#', '');
  if (cleanHex.length === 3) {
    cleanHex = cleanHex.split('').map((c) => c + c).join('');
  }
  const r = parseInt(cleanHex.substring(0, 2), 16) / 255;
  const g = parseInt(cleanHex.substring(2, 4), 16) / 255;
  const b = parseInt(cleanHex.substring(4, 6), 16) / 255;

  const toLinear = (c: number) => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
}

/**
 * Calculates contrast ratio between foreground and background colors.
 * Returns a ratio between 1 and 21.
 */
export function calculateColorContrast(fgHex: string, bgHex: string): number {
  try {
    const l1 = getRelativeLuminance(fgHex);
    const l2 = getRelativeLuminance(bgHex);
    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);
    return (lighter + 0.05) / (darker + 0.05);
  } catch {
    return 21; // Default to passing on parse issue
  }
}
