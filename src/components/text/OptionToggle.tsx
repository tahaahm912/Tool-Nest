import React from 'react';

interface OptionToggleProps {
  id: string;
  label: string;
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  className?: string;
}

export const OptionToggle: React.FC<OptionToggleProps> = ({
  id,
  label,
  description,
  checked,
  onChange,
  className = '',
}) => {
  return (
    <label
      htmlFor={id}
      className={`flex items-start gap-3 p-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/80 cursor-pointer select-none transition-colors hover:border-neutral-300 dark:hover:border-neutral-700 ${
        checked ? 'bg-emerald-50/30 dark:bg-emerald-950/20 border-emerald-300/80 dark:border-emerald-800/80' : ''
      } ${className}`}
    >
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 rounded border-neutral-300 text-emerald-600 focus:ring-emerald-500 w-4 h-4 accent-emerald-600 cursor-pointer flex-shrink-0"
      />
      <div className="space-y-0.5">
        <div className="text-xs font-semibold text-neutral-900 dark:text-neutral-100">
          {label}
        </div>
        {description && (
          <div className="text-[11px] text-neutral-500 dark:text-neutral-400 leading-normal">
            {description}
          </div>
        )}
      </div>
    </label>
  );
};
