/**
 * Mathematical unit conversion engine.
 * Pure browser utility with physical constants and formula explanations.
 */

export type UnitCategory =
  | 'length'
  | 'weight'
  | 'temperature'
  | 'area'
  | 'volume'
  | 'time'
  | 'speed';

export interface UnitDefinition {
  id: string;
  name: string;
  symbol: string;
  // Factor to convert from unit to base unit
  toBase: (val: number) => number;
  // Factor to convert from base unit to this unit
  fromBase: (val: number) => number;
}

export interface UnitCategoryData {
  id: UnitCategory;
  name: string;
  iconName: string;
  baseUnit: string;
  units: UnitDefinition[];
  presets: { name: string; from: string; to: string; value: number }[];
}

export const UNIT_CATEGORIES: Record<UnitCategory, UnitCategoryData> = {
  length: {
    id: 'length',
    name: 'Length',
    iconName: 'Ruler',
    baseUnit: 'm',
    units: [
      {
        id: 'mm',
        name: 'Millimeter',
        symbol: 'mm',
        toBase: (v) => v / 1000,
        fromBase: (v) => v * 1000,
      },
      {
        id: 'cm',
        name: 'Centimeter',
        symbol: 'cm',
        toBase: (v) => v / 100,
        fromBase: (v) => v * 100,
      },
      {
        id: 'm',
        name: 'Meter',
        symbol: 'm',
        toBase: (v) => v,
        fromBase: (v) => v,
      },
      {
        id: 'km',
        name: 'Kilometer',
        symbol: 'km',
        toBase: (v) => v * 1000,
        fromBase: (v) => v / 1000,
      },
      {
        id: 'in',
        name: 'Inch',
        symbol: 'in',
        toBase: (v) => v * 0.0254,
        fromBase: (v) => v / 0.0254,
      },
      {
        id: 'ft',
        name: 'Foot',
        symbol: 'ft',
        toBase: (v) => v * 0.3048,
        fromBase: (v) => v / 0.3048,
      },
      {
        id: 'yd',
        name: 'Yard',
        symbol: 'yd',
        toBase: (v) => v * 0.9144,
        fromBase: (v) => v / 0.9144,
      },
      {
        id: 'mi',
        name: 'Mile',
        symbol: 'mi',
        toBase: (v) => v * 1609.344,
        fromBase: (v) => v / 1609.344,
      },
    ],
    presets: [
      { name: 'Kilometers to Miles', from: 'km', to: 'mi', value: 10 },
      { name: 'Feet to Meters', from: 'ft', to: 'm', value: 6 },
      { name: 'Inches to Centimeters', from: 'in', to: 'cm', value: 12 },
      { name: 'Miles to Kilometers', from: 'mi', to: 'km', value: 60 },
    ],
  },

  weight: {
    id: 'weight',
    name: 'Weight / Mass',
    iconName: 'Scale',
    baseUnit: 'kg',
    units: [
      {
        id: 'mg',
        name: 'Milligram',
        symbol: 'mg',
        toBase: (v) => v / 1000000,
        fromBase: (v) => v * 1000000,
      },
      {
        id: 'g',
        name: 'Gram',
        symbol: 'g',
        toBase: (v) => v / 1000,
        fromBase: (v) => v * 1000,
      },
      {
        id: 'kg',
        name: 'Kilogram',
        symbol: 'kg',
        toBase: (v) => v,
        fromBase: (v) => v,
      },
      {
        id: 'oz',
        name: 'Ounce',
        symbol: 'oz',
        toBase: (v) => v * 0.028349523125,
        fromBase: (v) => v / 0.028349523125,
      },
      {
        id: 'lb',
        name: 'Pound',
        symbol: 'lb',
        toBase: (v) => v * 0.45359237,
        fromBase: (v) => v / 0.45359237,
      },
      {
        id: 't',
        name: 'Metric Ton',
        symbol: 't',
        toBase: (v) => v * 1000,
        fromBase: (v) => v / 1000,
      },
    ],
    presets: [
      { name: 'Kilograms to Pounds', from: 'kg', to: 'lb', value: 70 },
      { name: 'Pounds to Kilograms', from: 'lb', to: 'kg', value: 150 },
      { name: 'Ounces to Grams', from: 'oz', to: 'g', value: 8 },
      { name: 'Grams to Ounces', from: 'g', to: 'oz', value: 250 },
    ],
  },

  temperature: {
    id: 'temperature',
    name: 'Temperature',
    iconName: 'Thermometer',
    baseUnit: 'C',
    units: [
      {
        id: 'C',
        name: 'Celsius',
        symbol: '°C',
        toBase: (v) => v,
        fromBase: (v) => v,
      },
      {
        id: 'F',
        name: 'Fahrenheit',
        symbol: '°F',
        toBase: (v) => ((v - 32) * 5) / 9,
        fromBase: (v) => (v * 9) / 5 + 32,
      },
      {
        id: 'K',
        name: 'Kelvin',
        symbol: 'K',
        toBase: (v) => v - 273.15,
        fromBase: (v) => v + 273.15,
      },
    ],
    presets: [
      { name: 'Body Temp (°C to °F)', from: 'C', to: 'F', value: 37 },
      { name: 'Boiling Point (°C to °F)', from: 'C', to: 'F', value: 100 },
      { name: 'Freezing Point (°F to °C)', from: 'F', to: 'C', value: 32 },
      { name: 'Room Temp (°F to °C)', from: 'F', to: 'C', value: 72 },
    ],
  },

  area: {
    id: 'area',
    name: 'Area',
    iconName: 'Square',
    baseUnit: 'm2',
    units: [
      {
        id: 'cm2',
        name: 'Square Centimeter',
        symbol: 'cm²',
        toBase: (v) => v / 10000,
        fromBase: (v) => v * 10000,
      },
      {
        id: 'm2',
        name: 'Square Meter',
        symbol: 'm²',
        toBase: (v) => v,
        fromBase: (v) => v,
      },
      {
        id: 'km2',
        name: 'Square Kilometer',
        symbol: 'km²',
        toBase: (v) => v * 1000000,
        fromBase: (v) => v / 1000000,
      },
      {
        id: 'ft2',
        name: 'Square Foot',
        symbol: 'sq ft',
        toBase: (v) => v * 0.09290304,
        fromBase: (v) => v / 0.09290304,
      },
      {
        id: 'yd2',
        name: 'Square Yard',
        symbol: 'sq yd',
        toBase: (v) => v * 0.83612736,
        fromBase: (v) => v / 0.83612736,
      },
      {
        id: 'ac',
        name: 'Acre',
        symbol: 'ac',
        toBase: (v) => v * 4046.8564224,
        fromBase: (v) => v / 4046.8564224,
      },
      {
        id: 'ha',
        name: 'Hectare',
        symbol: 'ha',
        toBase: (v) => v * 10000,
        fromBase: (v) => v / 10000,
      },
    ],
    presets: [
      { name: 'Square Feet to Square Meters', from: 'ft2', to: 'm2', value: 1200 },
      { name: 'Acres to Hectares', from: 'ac', to: 'ha', value: 5 },
      { name: 'Square Meters to Square Feet', from: 'm2', to: 'ft2', value: 85 },
      { name: 'Square Kilometers to Acres', from: 'km2', to: 'ac', value: 1 },
    ],
  },

  volume: {
    id: 'volume',
    name: 'Volume',
    iconName: 'Droplet',
    baseUnit: 'l',
    units: [
      {
        id: 'ml',
        name: 'Milliliter',
        symbol: 'mL',
        toBase: (v) => v / 1000,
        fromBase: (v) => v * 1000,
      },
      {
        id: 'l',
        name: 'Liter',
        symbol: 'L',
        toBase: (v) => v,
        fromBase: (v) => v,
      },
      {
        id: 'm3',
        name: 'Cubic Meter',
        symbol: 'm³',
        toBase: (v) => v * 1000,
        fromBase: (v) => v / 1000,
      },
      {
        id: 'gal',
        name: 'Gallon (US)',
        symbol: 'gal',
        toBase: (v) => v * 3.785411784,
        fromBase: (v) => v / 3.785411784,
      },
      {
        id: 'pt',
        name: 'Pint (US)',
        symbol: 'pt',
        toBase: (v) => v * 0.473176473,
        fromBase: (v) => v / 0.473176473,
      },
      {
        id: 'cup',
        name: 'Cup (US)',
        symbol: 'cup',
        toBase: (v) => v * 0.2365882365,
        fromBase: (v) => v / 0.2365882365,
      },
    ],
    presets: [
      { name: 'Gallons to Liters', from: 'gal', to: 'l', value: 10 },
      { name: 'Liters to Gallons', from: 'l', to: 'gal', value: 20 },
      { name: 'Cups to Milliliters', from: 'cup', to: 'ml', value: 2 },
      { name: 'Pints to Cups', from: 'pt', to: 'cup', value: 4 },
    ],
  },

  time: {
    id: 'time',
    name: 'Time',
    iconName: 'Clock',
    baseUnit: 's',
    units: [
      {
        id: 'ms',
        name: 'Millisecond',
        symbol: 'ms',
        toBase: (v) => v / 1000,
        fromBase: (v) => v * 1000,
      },
      {
        id: 's',
        name: 'Second',
        symbol: 's',
        toBase: (v) => v,
        fromBase: (v) => v,
      },
      {
        id: 'min',
        name: 'Minute',
        symbol: 'min',
        toBase: (v) => v * 60,
        fromBase: (v) => v / 60,
      },
      {
        id: 'h',
        name: 'Hour',
        symbol: 'h',
        toBase: (v) => v * 3600,
        fromBase: (v) => v / 3600,
      },
      {
        id: 'd',
        name: 'Day',
        symbol: 'd',
        toBase: (v) => v * 86400,
        fromBase: (v) => v / 86400,
      },
      {
        id: 'wk',
        name: 'Week',
        symbol: 'wk',
        toBase: (v) => v * 604800,
        fromBase: (v) => v / 604800,
      },
      {
        id: 'mo',
        name: 'Month (30.44 d)',
        symbol: 'mo',
        toBase: (v) => v * 2629800, // 30.4375 days * 86400
        fromBase: (v) => v / 2629800,
      },
      {
        id: 'yr',
        name: 'Year (365 d)',
        symbol: 'yr',
        toBase: (v) => v * 31536000,
        fromBase: (v) => v / 31536000,
      },
    ],
    presets: [
      { name: 'Hours to Minutes', from: 'h', to: 'min', value: 2.5 },
      { name: 'Days to Hours', from: 'd', to: 'h', value: 7 },
      { name: 'Minutes to Seconds', from: 'min', to: 's', value: 45 },
      { name: 'Weeks to Days', from: 'wk', to: 'd', value: 4 },
    ],
  },

  speed: {
    id: 'speed',
    name: 'Speed',
    iconName: 'Gauge',
    baseUnit: 'mps',
    units: [
      {
        id: 'mps',
        name: 'Meters per second',
        symbol: 'm/s',
        toBase: (v) => v,
        fromBase: (v) => v,
      },
      {
        id: 'kmh',
        name: 'Kilometers per hour',
        symbol: 'km/h',
        toBase: (v) => v / 3.6,
        fromBase: (v) => v * 3.6,
      },
      {
        id: 'mph',
        name: 'Miles per hour',
        symbol: 'mph',
        toBase: (v) => v * 0.44704,
        fromBase: (v) => v / 0.44704,
      },
      {
        id: 'fps',
        name: 'Feet per second',
        symbol: 'ft/s',
        toBase: (v) => v * 0.3048,
        fromBase: (v) => v / 0.3048,
      },
    ],
    presets: [
      { name: 'Kilometers/h to Miles/h', from: 'kmh', to: 'mph', value: 100 },
      { name: 'Miles/h to Kilometers/h', from: 'mph', to: 'kmh', value: 65 },
      { name: 'Meters/s to Kilometers/h', from: 'mps', to: 'kmh', value: 25 },
      { name: 'Feet/s to Meters/s', from: 'fps', to: 'mps', value: 100 },
    ],
  },
};

/**
 * Converts a numerical value from one unit to another within the specified category.
 */
export function convertUnit(
  category: UnitCategory,
  fromUnitId: string,
  toUnitId: string,
  value: number
): { result: number; formula: string; explanation: string } {
  const cat = UNIT_CATEGORIES[category];
  if (!cat) {
    throw new Error(`Unknown unit category: ${category}`);
  }

  const fromUnit = cat.units.find((u) => u.id === fromUnitId);
  const toUnit = cat.units.find((u) => u.id === toUnitId);

  if (!fromUnit || !toUnit) {
    return {
      result: value,
      formula: 'Direct 1:1',
      explanation: 'Same unit selected.',
    };
  }

  if (fromUnitId === toUnitId) {
    return {
      result: value,
      formula: `${value} ${fromUnit.symbol} = ${value} ${toUnit.symbol}`,
      explanation: `Converting between identical units.`,
    };
  }

  // Convert to base, then to target
  const baseValue = fromUnit.toBase(value);
  const result = toUnit.fromBase(baseValue);

  // Generate formula
  let formula = '';
  let explanation = '';

  if (category === 'temperature') {
    if (fromUnit.id === 'C' && toUnit.id === 'F') {
      formula = `(°C × 9/5) + 32 = °F`;
      explanation = `Multiply Celsius by 9/5 (1.8), then add 32.`;
    } else if (fromUnit.id === 'F' && toUnit.id === 'C') {
      formula = `(°F − 32) × 5/9 = °C`;
      explanation = `Subtract 32 from Fahrenheit, then multiply by 5/9 (0.5556).`;
    } else if (fromUnit.id === 'C' && toUnit.id === 'K') {
      formula = `°C + 273.15 = K`;
      explanation = `Add 273.15 to the Celsius temperature.`;
    } else if (fromUnit.id === 'K' && toUnit.id === 'C') {
      formula = `K − 273.15 = °C`;
      explanation = `Subtract 273.15 from the Kelvin temperature.`;
    } else if (fromUnit.id === 'F' && toUnit.id === 'K') {
      formula = `(°F − 32) × 5/9 + 273.15 = K`;
      explanation = `Convert Fahrenheit to Celsius, then add 273.15.`;
    } else if (fromUnit.id === 'K' && toUnit.id === 'F') {
      formula = `(K − 273.15) × 9/5 + 32 = °F`;
      explanation = `Convert Kelvin to Celsius, then convert to Fahrenheit.`;
    }
  } else {
    // Linear multiplier
    const factor = toUnit.fromBase(fromUnit.toBase(1));
    const factorFormatted = formatPrecise(factor);
    formula = `1 ${fromUnit.symbol} = ${factorFormatted} ${toUnit.symbol}`;
    explanation = `Multiply the ${fromUnit.name.toLowerCase()} value by ${factorFormatted}`;
  }

  return { result, formula, explanation };
}

/**
 * Formats a number with smart precision, avoiding scientific notation when possible.
 */
export function formatPrecise(val: number): string {
  if (isNaN(val) || !isFinite(val)) return '0';
  if (val === 0) return '0';

  const absVal = Math.abs(val);
  if (absVal >= 1000000000 || (absVal < 0.000001 && absVal > 0)) {
    return val.toExponential(4);
  }

  // Round smartly: up to 6 significant decimals, strip trailing zeroes
  const rounded = parseFloat(val.toFixed(6));
  return rounded.toLocaleString('en-US', {
    maximumFractionDigits: 6,
  });
}
