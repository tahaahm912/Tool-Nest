import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import {
  QrCode,
  Link,
  FileText,
  Mail,
  Phone,
  MessageSquare,
  Wifi,
  RotateCcw,
  AlertTriangle,
  Sparkles,
  Sliders,
  Palette,
  Eye,
  Check,
} from 'lucide-react';
import {
  formatQrPayload,
  calculateColorContrast,
  QrPayloadType,
  EmailData,
  SmsData,
  WifiData,
} from '../lib/utilities/qrGenerator';
import { ModeSelector, ModeOption } from '../components/daily/ModeSelector';
import { CopyButton } from '../components/daily/CopyButton';
import { DownloadButton } from '../components/daily/DownloadButton';

const PAYLOAD_MODES: ModeOption<QrPayloadType>[] = [
  { id: 'url', label: 'URL / Link', icon: Link },
  { id: 'text', label: 'Plain Text', icon: FileText },
  { id: 'email', label: 'Email', icon: Mail },
  { id: 'phone', label: 'Phone', icon: Phone },
  { id: 'sms', label: 'SMS Message', icon: MessageSquare },
  { id: 'wifi', label: 'Wi-Fi Network', icon: Wifi },
];

const PRESET_COLORS = [
  { label: 'Classic Black', fg: '#000000', bg: '#ffffff' },
  { label: 'Emerald Forest', fg: '#065f46', bg: '#ecfdf5' },
  { label: 'Midnight Blue', fg: '#1e3a8a', bg: '#eff6ff' },
  { label: 'Deep Indigo', fg: '#3730a3', bg: '#eef2ff' },
  { label: 'Charcoal Dark', fg: '#18181b', bg: '#f4f4f5' },
];

export const QrCodeGenerator: React.FC = () => {
  const [mode, setMode] = useState<QrPayloadType>('url');

  // Input states
  const [urlInput, setUrlInput] = useState('https://toolnest.dev');
  const [textInput, setTextInput] = useState('Welcome to ToolNest!');
  const [emailInput, setEmailInput] = useState<EmailData>({
    address: 'contact@example.com',
    subject: 'Project Inquiry',
    body: 'Hello, I would like to get in touch regarding your product.',
  });
  const [phoneInput, setPhoneInput] = useState('+15551234567');
  const [smsInput, setSmsInput] = useState<SmsData>({
    phone: '+15551234567',
    message: 'Hello, please send me the requested information.',
  });
  const [wifiInput, setWifiInput] = useState<WifiData>({
    ssid: 'Guest_WiFi',
    password: 'SecurePassword123',
    encryption: 'WPA',
    hidden: false,
  });

  // Customization states
  const [size, setSize] = useState<number>(300);
  const [errorLevel, setErrorLevel] = useState<'L' | 'M' | 'Q' | 'H'>('M');
  const [fgColor, setFgColor] = useState<string>('#000000');
  const [bgColor, setBgColor] = useState<string>('#ffffff');
  const [margin, setMargin] = useState<number>(2);

  // Logo overlay
  const [logoFile, setLogoFile] = useState<string | null>(null);

  // Error and feedback state
  const [contrastRatio, setContrastRatio] = useState<number>(21);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Compute current encoded string
  const encodedContent = formatQrPayload(mode, {
    rawText: textInput,
    url: urlInput,
    email: emailInput,
    phone: phoneInput,
    sms: smsInput,
    wifi: wifiInput,
  });

  // Calculate contrast ratio whenever colors change
  useEffect(() => {
    const ratio = calculateColorContrast(fgColor, bgColor);
    setContrastRatio(Math.round(ratio * 10) / 10);
  }, [fgColor, bgColor]);

  // Render QR Code onto Canvas
  useEffect(() => {
    if (!canvasRef.current) return;

    if (!encodedContent.trim()) {
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      }
      setErrorMessage('Please enter content above to generate the QR code.');
      return;
    }

    setErrorMessage(null);

    // If logo is enabled, force higher error correction so the code is still fully readable
    const actualErrorLevel = logoFile && (errorLevel === 'L' || errorLevel === 'M') ? 'Q' : errorLevel;

    QRCode.toCanvas(
      canvasRef.current,
      encodedContent,
      {
        width: size,
        margin: margin,
        errorCorrectionLevel: actualErrorLevel,
        color: {
          dark: fgColor,
          light: bgColor,
        },
      },
      (error) => {
        if (error) {
          console.error('QR Code render error:', error);
          setErrorMessage('Unable to encode content. Text might be too long for this error correction level.');
        } else if (logoFile && canvasRef.current) {
          // Draw logo in the center of the canvas
          const canvas = canvasRef.current;
          const ctx = canvas.getContext('2d');
          if (!ctx) return;

          const img = new Image();
          img.onload = () => {
            const logoSize = Math.floor(size * 0.22);
            const x = (size - logoSize) / 2;
            const y = (size - logoSize) / 2;
            const pad = 4;

            // Draw white background pill behind logo
            ctx.fillStyle = bgColor;
            ctx.beginPath();
            ctx.roundRect(x - pad, y - pad, logoSize + pad * 2, logoSize + pad * 2, 8);
            ctx.fill();

            // Draw image inside
            ctx.drawImage(img, x, y, logoSize, logoSize);
          };
          img.src = logoFile;
        }
      }
    );
  }, [encodedContent, size, errorLevel, fgColor, bgColor, margin, logoFile]);

  // Handle PNG Download
  const handleDownloadPng = () => {
    if (!canvasRef.current) return;
    const url = canvasRef.current.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = `toolnest-qr-${mode}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Handle SVG Download
  const handleDownloadSvg = async () => {
    if (!encodedContent.trim()) return;

    try {
      const svgString = await QRCode.toString(encodedContent, {
        type: 'svg',
        width: size,
        margin: margin,
        errorCorrectionLevel: logoFile ? 'H' : errorLevel,
        color: {
          dark: fgColor,
          light: bgColor,
        },
      });

      const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `toolnest-qr-${mode}.svg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to generate SVG QR code:', err);
    }
  };

  // Handle Logo Upload
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setLogoFile(event.target?.result as string);
      if (errorLevel === 'L' || errorLevel === 'M') {
        setErrorLevel('Q'); // Elevate error correction for logo safety
      }
    };
    reader.readAsDataURL(file);
  };

  // Reset to default
  const handleReset = () => {
    setUrlInput('https://toolnest.dev');
    setTextInput('Welcome to ToolNest!');
    setEmailInput({
      address: 'contact@example.com',
      subject: 'Project Inquiry',
      body: 'Hello, I would like to get in touch regarding your product.',
    });
    setPhoneInput('+15551234567');
    setSmsInput({
      phone: '+15551234567',
      message: 'Hello, please send me the requested information.',
    });
    setWifiInput({
      ssid: 'Guest_WiFi',
      password: 'SecurePassword123',
      encryption: 'WPA',
      hidden: false,
    });
    setSize(300);
    setErrorLevel('M');
    setFgColor('#000000');
    setBgColor('#ffffff');
    setMargin(2);
    setLogoFile(null);
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Type Selector Tabs */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-neutral-200 dark:border-neutral-800">
        <div>
          <span className="text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider block mb-1">
            QR Data Format
          </span>
          <ModeSelector
            options={PAYLOAD_MODES}
            activeId={mode}
            onChange={(m) => setMode(m)}
          />
        </div>

        <button
          type="button"
          onClick={handleReset}
          className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-xl transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Defaults</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Data Input & Customization Controls */}
        <div className="lg:col-span-7 space-y-6">
          {/* Input Fields according to mode */}
          <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-5 sm:p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-neutral-900 dark:text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-emerald-600" />
              <span>Input Information</span>
            </h3>

            {mode === 'url' && (
              <div>
                <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                  Destination URL
                </label>
                <input
                  type="text"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder="https://example.com"
                  className="w-full rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 px-3.5 py-2.5 text-sm text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 font-mono"
                />
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                  Prefixes like <code className="text-emerald-600 font-semibold">https://</code> are automatically added if omitted.
                </p>
              </div>
            )}

            {mode === 'text' && (
              <div>
                <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                  Text Content
                </label>
                <textarea
                  rows={4}
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  placeholder="Enter any text, notes, or instructions..."
                  className="w-full rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 p-3 text-sm text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                />
                <div className="flex justify-between text-xs text-neutral-500 mt-1">
                  <span>{textInput.length} characters</span>
                  <span>Supports multiline text</span>
                </div>
              </div>
            )}

            {mode === 'email' && (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                    Recipient Email
                  </label>
                  <input
                    type="email"
                    value={emailInput.address}
                    onChange={(e) =>
                      setEmailInput({ ...emailInput, address: e.target.value })
                    }
                    placeholder="name@company.com"
                    className="w-full rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 px-3 py-2 text-sm text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                    Subject Line (Optional)
                  </label>
                  <input
                    type="text"
                    value={emailInput.subject || ''}
                    onChange={(e) =>
                      setEmailInput({ ...emailInput, subject: e.target.value })
                    }
                    placeholder="Subject of the email"
                    className="w-full rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 px-3 py-2 text-sm text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                    Email Body (Optional)
                  </label>
                  <textarea
                    rows={2}
                    value={emailInput.body || ''}
                    onChange={(e) =>
                      setEmailInput({ ...emailInput, body: e.target.value })
                    }
                    placeholder="Pre-filled message body..."
                    className="w-full rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 p-2.5 text-sm text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                  />
                </div>
              </div>
            )}

            {mode === 'phone' && (
              <div>
                <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={phoneInput}
                  onChange={(e) => setPhoneInput(e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  className="w-full rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 px-3.5 py-2.5 text-sm text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 font-mono"
                />
                <p className="text-xs text-neutral-500 mt-1">
                  Scanning dials this number immediately on smartphones.
                </p>
              </div>
            )}

            {mode === 'sms' && (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                    Recipient Phone Number
                  </label>
                  <input
                    type="tel"
                    value={smsInput.phone}
                    onChange={(e) =>
                      setSmsInput({ ...smsInput, phone: e.target.value })
                    }
                    placeholder="+1 (555) 000-0000"
                    className="w-full rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 px-3 py-2 text-sm text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                    Pre-filled SMS Message
                  </label>
                  <textarea
                    rows={2}
                    value={smsInput.message || ''}
                    onChange={(e) =>
                      setSmsInput({ ...smsInput, message: e.target.value })
                    }
                    placeholder="Message to send..."
                    className="w-full rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 p-2.5 text-sm text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                  />
                </div>
              </div>
            )}

            {mode === 'wifi' && (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                    Network Name (SSID)
                  </label>
                  <input
                    type="text"
                    value={wifiInput.ssid}
                    onChange={(e) =>
                      setWifiInput({ ...wifiInput, ssid: e.target.value })
                    }
                    placeholder="e.g. CoffeeShop_WiFi"
                    className="w-full rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 px-3 py-2 text-sm text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                      Wi-Fi Password
                    </label>
                    <input
                      type="text"
                      value={wifiInput.password || ''}
                      onChange={(e) =>
                        setWifiInput({ ...wifiInput, password: e.target.value })
                      }
                      placeholder="Password"
                      className="w-full rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 px-3 py-2 text-sm text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                      Security Type
                    </label>
                    <select
                      value={wifiInput.encryption}
                      onChange={(e) =>
                        setWifiInput({
                          ...wifiInput,
                          encryption: e.target.value as any,
                        })
                      }
                      className="w-full rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 px-3 py-2 text-sm text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                    >
                      <option value="WPA">WPA / WPA2 / WPA3</option>
                      <option value="WEP">WEP</option>
                      <option value="nopass">None (Open Network)</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Design & Style Customization */}
          <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-5 sm:p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-neutral-900 dark:text-white flex items-center gap-2">
              <Palette className="w-4 h-4 text-emerald-600" />
              <span>Appearance & Parameters</span>
            </h3>

            {/* Color presets */}
            <div>
              <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Color Presets
              </label>
              <div className="flex flex-wrap gap-2">
                {PRESET_COLORS.map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => {
                      setFgColor(preset.fg);
                      setBgColor(preset.bg);
                    }}
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-neutral-200 dark:border-neutral-800 text-xs font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
                  >
                    <span
                      className="w-3.5 h-3.5 rounded-full border border-neutral-300 shadow-xs"
                      style={{ backgroundColor: preset.fg }}
                    />
                    <span>{preset.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Color Pickers */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                  Foreground (Modules)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={fgColor}
                    onChange={(e) => setFgColor(e.target.value)}
                    className="w-9 h-9 rounded-lg border border-neutral-200 dark:border-neutral-700 cursor-pointer p-0.5 bg-transparent"
                  />
                  <input
                    type="text"
                    value={fgColor}
                    onChange={(e) => setFgColor(e.target.value)}
                    className="w-full rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 px-2.5 py-1.5 text-xs font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                  Background
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                    className="w-9 h-9 rounded-lg border border-neutral-200 dark:border-neutral-700 cursor-pointer p-0.5 bg-transparent"
                  />
                  <input
                    type="text"
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                    className="w-full rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 px-2.5 py-1.5 text-xs font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Contrast Ratio Warning */}
            {contrastRatio < 3 && (
              <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-xs flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold">Poor Color Contrast ({contrastRatio}:1):</span>{' '}
                  QR scanners require high contrast between dark and light modules. Camera readers may fail to scan this code reliably.
                </div>
              </div>
            )}

            {/* Size & Error Correction */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div>
                <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  Size: {size}px
                </label>
                <input
                  type="range"
                  min="180"
                  max="480"
                  step="20"
                  value={size}
                  onChange={(e) => setSize(Number(e.target.value))}
                  className="w-full accent-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  Quiet Margin: {margin}
                </label>
                <input
                  type="range"
                  min="1"
                  max="6"
                  step="1"
                  value={margin}
                  onChange={(e) => setMargin(Number(e.target.value))}
                  className="w-full accent-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  Error Correction
                </label>
                <select
                  value={errorLevel}
                  onChange={(e) => setErrorLevel(e.target.value as any)}
                  className="w-full rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 px-2.5 py-1.5 text-xs text-neutral-900 dark:text-neutral-100"
                >
                  <option value="L">L - Low (7%)</option>
                  <option value="M">M - Medium (15%)</option>
                  <option value="Q">Q - Quartile (25%)</option>
                  <option value="H">H - High (30%)</option>
                </select>
              </div>
            </div>

            {/* Center Logo Upload (Optional) */}
            <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800">
              <div className="flex items-center justify-between">
                <div>
                  <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300">
                    Center Logo / Icon (Optional)
                  </label>
                  <p className="text-[11px] text-neutral-500">
                    Upload a square PNG or JPG to embed in the middle. Automatically enables High Error Correction.
                  </p>
                </div>
                {logoFile && (
                  <button
                    type="button"
                    onClick={() => setLogoFile(null)}
                    className="text-xs text-rose-600 hover:underline"
                  >
                    Remove Logo
                  </button>
                )}
              </div>
              <input
                type="file"
                accept="image/png, image/jpeg, image/svg+xml"
                onChange={handleLogoUpload}
                className="mt-2 block w-full text-xs text-neutral-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-neutral-100 dark:file:bg-neutral-800 file:text-neutral-700 dark:file:text-neutral-300 hover:file:bg-neutral-200"
              />
            </div>
          </div>
        </div>

        {/* Right Column: Live QR Preview & Actions */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6 shadow-sm flex flex-col items-center text-center">
            <span className="text-xs font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider mb-4">
              Real-Time Scan Preview
            </span>

            {/* Canvas Container */}
            <div
              className="p-4 rounded-2xl shadow-inner border border-neutral-200/80 dark:border-neutral-800 flex items-center justify-center transition-all"
              style={{ backgroundColor: bgColor }}
            >
              <canvas
                ref={canvasRef}
                className="max-w-full h-auto block rounded-lg transition-transform duration-200"
                style={{ width: `${Math.min(size, 280)}px`, height: `${Math.min(size, 280)}px` }}
              />
            </div>

            {errorMessage ? (
              <p className="text-xs text-rose-600 dark:text-rose-400 mt-3">{errorMessage}</p>
            ) : (
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-3 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
                <span>Scannable with any iOS or Android camera</span>
              </p>
            )}

            {/* Download Buttons */}
            <div className="mt-6 w-full flex flex-col sm:flex-row items-center justify-center gap-3">
              <DownloadButton
                onDownloadPng={handleDownloadPng}
                onDownloadSvg={handleDownloadSvg}
                disabled={!encodedContent.trim() || !!errorMessage}
                pngLabel="Download PNG"
                svgLabel="Download SVG"
              />
            </div>

            {/* Encoded payload info */}
            <div className="mt-6 w-full pt-4 border-t border-neutral-100 dark:border-neutral-800 text-left">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-semibold text-neutral-600 dark:text-neutral-400">
                  Encoded Payload:
                </span>
                <CopyButton
                  textToCopy={encodedContent}
                  label="Copy Content"
                  size="sm"
                  variant="ghost"
                />
              </div>
              <div className="p-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 font-mono text-xs text-neutral-800 dark:text-neutral-300 break-all max-h-24 overflow-y-auto">
                {encodedContent || '(Empty)'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
