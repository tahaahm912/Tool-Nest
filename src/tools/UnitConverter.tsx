import React, { useState, useMemo } from 'react';
import {
  Ruler,
  Scale,
  Thermometer,
  Square,
  Droplet,
  Clock,
  Gauge,
  ArrowRightLeft,
  Copy,
  Check,
  RotateCcw,
  Sparkles,
  Info,
  Layers,
  Table,
} from 'lucide-react';
import {
  UnitCategory,
  UNIT_CATEGORIES,
  convertUnit,
  formatPrecise,
} from '../lib/utilities/unitConversion';
import { ModeSelector, ModeOption } from '../components/daily/ModeSelector';
import { CopyButton } from '../components/daily/CopyButton';

const CATEGORY_OPTIONS: ModeOption<UnitCategory>[] = [
  { id: 'length', label: 'Length', icon: Ruler },
  { id: 'weight', label: 'Weight / Mass', icon: Scale },
  { id: 'temperature', label: 'Temperature', icon: Thermometer },
  { id: 'area', label: 'Area', icon: Square },
  { id: 'volume', label: 'Volume', icon: Droplet },
  { id: 'time', label: 'Time', icon: Clock },
  { id: 'speed', label: 'Speed', icon: Gauge },
];

export const UnitConverter: React.FC = () => {
  const [category, setCategory] = useState<UnitCategory>('length');
  const [inputValue, setInputValue] = useState<string>('10');
  const [fromUnit, setFromUnit] = useState<string>('km');
  const [toUnit, setToUnit] = useState<string>('mi');
  const [copiedMatrixUnit, setCopiedMatrixUnit] = useState<string | null>(null);

  const currentCategoryData = UNIT_CATEGORIES[category];

  // When changing category, reset from/to units to defaults
  const handleCategoryChange = (cat: UnitCategory) => {
    setCategory(cat);
    const catData = UNIT_CATEGORIES[cat];
    if (catData.presets.length > 0) {
      setFromUnit(catData.presets[0].from);
      setToUnit(catData.presets[0].to);
      setInputValue(String(catData.presets[0].value));
    } else {
      setFromUnit(catData.units[0].id);
      setToUnit(catData.units[1]?.id || catData.units[0].id);
      setInputValue('1');
    }
  };

  // Swap From and To units
  const handleSwap = () => {
    const temp = fromUnit;
    setFromUnit(toUnit);
    setToUnit(temp);
  };

  // Parse numerical input
  const numericInput = useMemo(() => {
    const parsed = parseFloat(inputValue);
    return isNaN(parsed) ? 0 : parsed;
  }, [inputValue]);

  // Main conversion calculation
  const conversionResult = useMemo(() => {
    try {
      return convertUnit(category, fromUnit, toUnit, numericInput);
    } catch {
      return { result: 0, formula: '', explanation: '' };
    }
  }, [category, fromUnit, toUnit, numericInput]);

  // Full category multi-unit conversion matrix table
  const allConversions = useMemo(() => {
    return currentCategoryData.units.map((unit) => {
      const conv = convertUnit(category, fromUnit, unit.id, numericInput);
      return {
        unit,
        value: conv.result,
        formatted: formatPrecise(conv.result),
      };
    });
  }, [category, fromUnit, numericInput, currentCategoryData]);

  // Copy matrix value
  const handleCopyMatrix = (text: string, id: string) => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(text);
      setCopiedMatrixUnit(id);
      setTimeout(() => setCopiedMatrixUnit(null), 1500);
    }
  };

  // Reset to initial
  const handleReset = () => {
    setCategory('length');
    setFromUnit('km');
    setToUnit('mi');
    setInputValue('10');
  };

  const selectedFromMeta = currentCategoryData.units.find((u) => u.id === fromUnit);
  const selectedToMeta = currentCategoryData.units.find((u) => u.id === toUnit);

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Category Tabs */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-neutral-200 dark:border-neutral-800">
        <div>
          <span className="text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider block mb-1">
            Physical Measurement Category
          </span>
          <ModeSelector
            options={CATEGORY_OPTIONS}
            activeId={category}
            onChange={handleCategoryChange}
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

      {/* Quick Presets */}
      <div>
        <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-2 block">
          Common {currentCategoryData.name} Conversions
        </span>
        <div className="flex flex-wrap gap-2">
          {currentCategoryData.presets.map((p) => (
            <button
              key={p.name}
              type="button"
              onClick={() => {
                setFromUnit(p.from);
                setToUnit(p.to);
                setInputValue(String(p.value));
              }}
              className={`px-3 py-1.5 rounded-xl border text-xs font-medium transition-colors shadow-2xs ${
                fromUnit === p.from && toUnit === p.to
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-800 dark:bg-emerald-950/50 dark:border-emerald-700 dark:text-emerald-300 font-semibold'
                  : 'border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 hover:border-emerald-400'
              }`}
            >
              {p.name}
            </button>
          ))}
        </div>
      </div>

      {/* Main Conversion Panel */}
      <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6 shadow-sm space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-11 gap-4 items-center">
          {/* From Input & Unit */}
          <div className="lg:col-span-5 space-y-2">
            <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider">
              From ({selectedFromMeta?.name})
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                step="any"
                placeholder="Enter value"
                className="w-full rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 px-4 py-3 text-lg font-bold text-neutral-900 dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 shadow-2xs"
              />
              <select
                value={fromUnit}
                onChange={(e) => setFromUnit(e.target.value)}
                className="w-44 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-950 px-3 py-3 text-sm font-semibold text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
              >
                {currentCategoryData.units.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.symbol})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Swap Button */}
          <div className="lg:col-span-1 flex justify-center py-2 lg:py-0">
            <button
              type="button"
              onClick={handleSwap}
              title="Swap units"
              className="p-3 rounded-full bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 transition-transform active:rotate-180 duration-200 shadow-2xs"
            >
              <ArrowRightLeft className="w-5 h-5" />
            </button>
          </div>

          {/* To Unit & Output */}
          <div className="lg:col-span-5 space-y-2">
            <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider">
              To ({selectedToMeta?.name})
            </label>
            <div className="flex items-center gap-2">
              <div className="w-full rounded-xl border border-emerald-200 dark:border-emerald-800/80 bg-emerald-50/50 dark:bg-emerald-950/20 px-4 py-3 text-lg font-extrabold text-emerald-900 dark:text-emerald-300 font-mono truncate shadow-2xs flex items-center justify-between">
                <span>{formatPrecise(conversionResult.result)}</span>
                <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 ml-2">
                  {selectedToMeta?.symbol}
                </span>
              </div>
              <select
                value={toUnit}
                onChange={(e) => setToUnit(e.target.value)}
                className="w-44 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-950 px-3 py-3 text-sm font-semibold text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
              >
                {currentCategoryData.units.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.symbol})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Copy Result & Formula Summary */}
        <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-neutral-500 dark:text-neutral-400">
                Formula:
              </span>
              <span className="text-xs font-mono font-bold text-neutral-800 dark:text-neutral-200">
                {conversionResult.formula}
              </span>
            </div>
            <p className="text-xs text-neutral-600 dark:text-neutral-400">
              {conversionResult.explanation}
            </p>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <CopyButton
              textToCopy={`${formatPrecise(conversionResult.result)} ${selectedToMeta?.symbol}`}
              label="Copy Result"
              variant="primary"
            />
          </div>
        </div>
      </div>

      {/* Multi-Unit Reference Matrix */}
      <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-neutral-900 dark:text-white flex items-center gap-2">
            <Table className="w-4 h-4 text-emerald-600" />
            <span>Complete {currentCategoryData.name} Equivalent Matrix</span>
          </h3>
          <span className="text-xs text-neutral-500">
            {numericInput} {selectedFromMeta?.symbol} in all units
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {allConversions.map(({ unit, formatted }) => (
            <button
              key={unit.id}
              type="button"
              onClick={() => handleCopyMatrix(`${formatted} ${unit.symbol}`, unit.id)}
              className={`p-3.5 rounded-xl border text-left transition-all duration-150 relative group ${
                unit.id === toUnit
                  ? 'bg-emerald-50/70 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-700'
                  : 'bg-neutral-50 hover:bg-neutral-100 dark:bg-neutral-950 dark:hover:bg-neutral-800 border-neutral-200 dark:border-neutral-800'
              }`}
            >
              <div className="flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400 mb-1">
                <span>{unit.name}</span>
                <span className="font-mono font-semibold">{unit.symbol}</span>
              </div>
              <div className="text-base font-bold text-neutral-900 dark:text-neutral-100 font-mono truncate">
                {formatted}
              </div>
              <span className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                {copiedMatrixUnit === unit.id ? (
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                ) : (
                  <Copy className="w-3.5 h-3.5 text-neutral-400" />
                )}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
