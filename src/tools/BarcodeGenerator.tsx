import React, { useState, useEffect, useRef } from 'react';
import JsBarcode from 'jsbarcode';
import {
  ScanLine,
  Check,
  AlertCircle,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Layers,
  Sliders,
  Type,
  Maximize2,
} from 'lucide-react';
import {
  BarcodeFormat,
  BARCODE_FORMATS,
  validateBarcode,
} from '../lib/utilities/barcodeValidator';
import { ModeSelector, ModeOption } from '../components/daily/ModeSelector';
import { CopyButton } from '../components/daily/CopyButton';
import { DownloadButton } from '../components/daily/DownloadButton';

const FORMAT_OPTIONS: ModeOption<BarcodeFormat>[] = BARCODE_FORMATS.map((f) => ({
  id: f.id,
  label: f.name,
  badge: f.category.split(' ')[0],
}));

export const BarcodeGenerator: React.FC = () => {
  const [format, setFormat] = useState<BarcodeFormat>('CODE128');
  const [rawValue, setRawValue] = useState<string>('TN-DAILY-2026');

  // Customization options
  const [barWidth, setBarWidth] = useState<number>(2);
  const [height, setHeight] = useState<number>(80);
  const [displayValue, setDisplayValue] = useState<boolean>(true);
  const [fontSize, setFontSize] = useState<number>(16);
  const [margin, setMargin] = useState<number>(10);
  const [lineColor, setLineColor] = useState<string>('#000000');
  const [background, setBackground] = useState<string>('#ffffff');

  const svgRef = useRef<SVGSVGElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Validation
  const validation = validateBarcode(format, rawValue);
  const currentFormatMeta = BARCODE_FORMATS.find((f) => f.id === format)!;

  // When changing format, if current value is default for old format, switch to default for new format
  const handleFormatChange = (newFormat: BarcodeFormat) => {
    setFormat(newFormat);
    const meta = BARCODE_FORMATS.find((f) => f.id === newFormat);
    if (meta) {
      setRawValue(meta.defaultExample);
    }
  };

  // Render barcode whenever parameters or input change
  useEffect(() => {
    if (!validation.isValid || !validation.sanitizedValue) {
      if (svgRef.current) {
        svgRef.current.innerHTML = '';
      }
      if (canvasRef.current) {
        const ctx = canvasRef.current.getContext('2d');
        if (ctx) ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      }
      return;
    }

    try {
      if (svgRef.current) {
        JsBarcode(svgRef.current, validation.sanitizedValue, {
          format: format === 'UPC' ? 'UPC' : format,
          width: barWidth,
          height: height,
          displayValue: displayValue,
          fontSize: fontSize,
          margin: margin,
          lineColor: lineColor,
          background: background,
          valid: (valid) => {
            if (!valid) console.warn('JsBarcode reported invalid state');
          },
        });
      }

      if (canvasRef.current) {
        JsBarcode(canvasRef.current, validation.sanitizedValue, {
          format: format === 'UPC' ? 'UPC' : format,
          width: barWidth,
          height: height,
          displayValue: displayValue,
          fontSize: fontSize,
          margin: margin,
          lineColor: lineColor,
          background: background,
        });
      }
    } catch (err) {
      console.error('Barcode rendering error:', err);
    }
  }, [
    format,
    validation.sanitizedValue,
    validation.isValid,
    barWidth,
    height,
    displayValue,
    fontSize,
    margin,
    lineColor,
    background,
  ]);

  // Download PNG
  const handleDownloadPng = () => {
    if (!canvasRef.current || !validation.isValid) return;
    const url = canvasRef.current.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = `barcode-${format.toLowerCase()}-${validation.sanitizedValue}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Download SVG
  const handleDownloadSvg = () => {
    if (!svgRef.current || !validation.isValid) return;
    const serializer = new XMLSerializer();
    const source = serializer.serializeToString(svgRef.current);
    const blob = new Blob([source], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `barcode-${format.toLowerCase()}-${validation.sanitizedValue}.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Reset to format default
  const handleReset = () => {
    setBarWidth(2);
    setHeight(80);
    setDisplayValue(true);
    setFontSize(16);
    setMargin(10);
    setLineColor('#000000');
    setBackground('#ffffff');
    setRawValue(currentFormatMeta.defaultExample);
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Format Selector */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-neutral-200 dark:border-neutral-800">
        <div>
          <span className="text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider block mb-1">
            Standard Barcode Symbology
          </span>
          <ModeSelector
            options={FORMAT_OPTIONS}
            activeId={format}
            onChange={handleFormatChange}
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
        {/* Left Column: Data Input & Parameters */}
        <div className="lg:col-span-6 space-y-6">
          {/* Format Description Banner */}
          <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-900/60 border border-neutral-200 dark:border-neutral-800 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wide">
                {currentFormatMeta.name} ({currentFormatMeta.category})
              </span>
              <span className="text-[11px] font-mono text-neutral-500">
                Format: {currentFormatMeta.id}
              </span>
            </div>
            <p className="text-xs text-neutral-600 dark:text-neutral-400">
              {currentFormatMeta.description}
            </p>
            <p className="text-[11px] text-neutral-500 dark:text-neutral-400 pt-1">
              <strong>Rules:</strong> {currentFormatMeta.allowedCharsDescription}
            </p>
          </div>

          {/* Barcode Value Input */}
          <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-5 sm:p-6 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                <ScanLine className="w-4 h-4 text-emerald-600" />
                <span>Barcode Value</span>
              </label>
              <button
                type="button"
                onClick={() => setRawValue(currentFormatMeta.defaultExample)}
                className="text-xs font-medium text-emerald-600 hover:underline"
              >
                Insert Example
              </button>
            </div>

            <input
              type="text"
              value={rawValue}
              onChange={(e) => setRawValue(e.target.value)}
              placeholder={currentFormatMeta.placeholder}
              className={`w-full rounded-xl border px-3.5 py-2.5 text-sm font-mono tracking-wider focus:outline-none focus:ring-2 ${
                validation.isValid
                  ? 'border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 focus:ring-emerald-500/30 focus:border-emerald-500'
                  : 'border-rose-300 dark:border-rose-800 bg-rose-50/50 dark:bg-rose-950/20 text-rose-900 dark:text-rose-200 focus:ring-rose-500/30 focus:border-rose-500'
              }`}
            />

            {/* Validation Alerts */}
            {!validation.isValid && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold">Format Error:</span>{' '}
                  {validation.errorMessage}
                </div>
              </div>
            )}

            {validation.warningMessage && (
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs flex items-start gap-2">
                <Check className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold">Auto-Computed:</span>{' '}
                  {validation.warningMessage}
                </div>
              </div>
            )}
          </div>

          {/* Dimension and Visual Adjustments */}
          <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-5 sm:p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-neutral-900 dark:text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-emerald-600" />
              <span>Barcode Dimensions & Layout</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  Bar Width: {barWidth}px
                </label>
                <input
                  type="range"
                  min="1"
                  max="4"
                  step="0.5"
                  value={barWidth}
                  onChange={(e) => setBarWidth(Number(e.target.value))}
                  className="w-full accent-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  Height: {height}px
                </label>
                <input
                  type="range"
                  min="40"
                  max="140"
                  step="5"
                  value={height}
                  onChange={(e) => setHeight(Number(e.target.value))}
                  className="w-full accent-emerald-600"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  Quiet Margin: {margin}px
                </label>
                <input
                  type="range"
                  min="0"
                  max="25"
                  step="5"
                  value={margin}
                  onChange={(e) => setMargin(Number(e.target.value))}
                  className="w-full accent-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  Font Size: {fontSize}px
                </label>
                <input
                  type="range"
                  min="12"
                  max="24"
                  step="1"
                  value={fontSize}
                  onChange={(e) => setFontSize(Number(e.target.value))}
                  className="w-full accent-emerald-600"
                />
              </div>
            </div>

            {/* Display Text & Colors */}
            <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800 flex flex-wrap items-center justify-between gap-4">
              <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-medium text-neutral-800 dark:text-neutral-200">
                <input
                  type="checkbox"
                  checked={displayValue}
                  onChange={(e) => setDisplayValue(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                />
                <span>Display human-readable text below bars</span>
              </label>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 text-xs text-neutral-600 dark:text-neutral-400">
                  <span>Lines:</span>
                  <input
                    type="color"
                    value={lineColor}
                    onChange={(e) => setLineColor(e.target.value)}
                    className="w-6 h-6 rounded border border-neutral-300 cursor-pointer p-0 bg-transparent"
                  />
                </div>
                <div className="flex items-center gap-1.5 text-xs text-neutral-600 dark:text-neutral-400">
                  <span>Bg:</span>
                  <input
                    type="color"
                    value={background}
                    onChange={(e) => setBackground(e.target.value)}
                    className="w-6 h-6 rounded border border-neutral-300 cursor-pointer p-0 bg-transparent"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Live Barcode Rendering & Export */}
        <div className="lg:col-span-6 space-y-6">
          <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6 shadow-sm flex flex-col items-center text-center">
            <span className="text-xs font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider mb-4">
              Optical Laser & Camera Scanner Preview
            </span>

            {/* SVG Render Container */}
            <div
              className="w-full min-h-[160px] p-6 rounded-2xl shadow-inner border border-neutral-200/80 dark:border-neutral-800 flex items-center justify-center overflow-x-auto transition-colors"
              style={{ backgroundColor: background }}
            >
              {validation.isValid ? (
                <div className="flex flex-col items-center">
                  <svg ref={svgRef} className="max-w-full h-auto block" />
                  {/* Hidden canvas for PNG raster generation */}
                  <canvas ref={canvasRef} className="hidden" />
                </div>
              ) : (
                <div className="text-center py-6 text-neutral-400 dark:text-neutral-600">
                  <ScanLine className="w-12 h-12 mx-auto mb-2 opacity-40" />
                  <p className="text-xs">Correct the input to render barcode preview</p>
                </div>
              )}
            </div>

            {/* Validation & Scannable Badge */}
            {validation.isValid ? (
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-3 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
                <span>Ready for commercial & inventory scanner recognition</span>
              </p>
            ) : (
              <p className="text-xs text-rose-500 mt-3 flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 text-rose-500" />
                <span>Invalid barcode input for symbology {format}</span>
              </p>
            )}

            {/* Download Buttons */}
            <div className="mt-6 w-full flex flex-col sm:flex-row items-center justify-center gap-3">
              <DownloadButton
                onDownloadPng={handleDownloadPng}
                onDownloadSvg={handleDownloadSvg}
                disabled={!validation.isValid}
                pngLabel="Download PNG"
                svgLabel="Download SVG"
              />
            </div>

            {/* Barcode Payload & Copy */}
            <div className="mt-6 w-full pt-4 border-t border-neutral-100 dark:border-neutral-800 text-left">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-semibold text-neutral-600 dark:text-neutral-400">
                  Barcode Value:
                </span>
                <CopyButton
                  textToCopy={validation.sanitizedValue}
                  label="Copy Value"
                  size="sm"
                  variant="ghost"
                  disabled={!validation.isValid}
                />
              </div>
              <div className="p-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 font-mono text-xs text-neutral-800 dark:text-neutral-200 break-all">
                {validation.sanitizedValue || '(No barcode generated)'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
