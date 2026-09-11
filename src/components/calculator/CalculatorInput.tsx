import React from 'react';

interface CalculatorInputProps {
  id?: string;
  label: string;
  value: string | number;
  onChange: (value: string) => void;
  type?: 'text' | 'number' | 'date';
  placeholder?: string;
  prefix?: string;
  suffix?: string;
  min?: number;
  max?: number;
  step?: number | string;
  helperText?: string;
  error?: string;
  disabled?: boolean;
  className?: string;
}

export const CalculatorInput: React.FC<CalculatorInputProps> = ({
  id,
  label,
  value,
  onChange,
  type = 'number',
  placeholder,
  prefix,
  suffix,
  min,
  max,
  step = 'any',
  helperText,
  error,
  disabled = false,
  className = '',
}) => {
  const inputId = id || `calc-input-${label.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;

  return (
    <div className={`space-y-1.5 ${className}`}>
      <label
        htmlFor={inputId}
        className="block text-xs font-semibold uppercase tracking-wider text-neutral-700 dark:text-neutral-300"
      >
        {label}
      </label>

      <div className="relative rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 shadow-sm focus-within:ring-2 focus-within:ring-emerald-500/30 focus-within:border-emerald-500 transition-all flex items-center overflow-hidden">
        {prefix && (
          <span className="pl-3.5 pr-1.5 text-sm font-semibold text-neutral-500 dark:text-neutral-400 select-none">
            {prefix}
          </span>
        )}

        <input
          id={inputId}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          min={min}
          max={max}
          step={step}
          disabled={disabled}
          className={`w-full px-3 py-2.5 text-sm font-medium text-neutral-900 dark:text-neutral-100 bg-transparent focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed ${
            prefix ? 'pl-1' : 'pl-3.5'
          } ${suffix ? 'pr-1' : 'pr-3.5'}`}
        />

        {suffix && (
          <span className="pr-3.5 pl-1.5 text-xs font-semibold text-neutral-500 dark:text-neutral-400 select-none">
            {suffix}
          </span>
        )}
      </div>

      {error ? (
        <p className="text-xs text-rose-600 dark:text-rose-400 font-medium">{error}</p>
      ) : helperText ? (
        <p className="text-xs text-neutral-500 dark:text-neutral-400">{helperText}</p>
      ) : null}
    </div>
  );
};
