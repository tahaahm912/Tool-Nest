import React, { useState } from 'react';
import { Copy, Check, LucideIcon } from 'lucide-react';

interface ResultCardProps {
  label: string;
  value: string | number;
  subtitle?: string;
  icon?: LucideIcon;
  variant?: 'emerald' | 'blue' | 'amber' | 'rose' | 'neutral' | 'dark';
  highlight?: boolean;
  copyable?: boolean;
  className?: string;
}

export const ResultCard: React.FC<ResultCardProps> = ({
  label,
  value,
  subtitle,
  icon: Icon,
  variant = 'neutral',
  highlight = false,
  copyable = false,
  className = '',
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(String(value));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const variantStyles = {
    dark: 'bg-neutral-900 text-white dark:bg-neutral-800 border-neutral-900 dark:border-neutral-700',
    emerald: 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/60 text-emerald-950 dark:text-emerald-100',
    blue: 'bg-blue-50/70 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800/60 text-blue-950 dark:text-blue-100',
    amber: 'bg-amber-50/70 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800/60 text-amber-950 dark:text-amber-100',
    rose: 'bg-rose-50/70 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800/60 text-rose-950 dark:text-rose-100',
    neutral: 'bg-neutral-50 dark:bg-neutral-900/60 border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-neutral-100',
  };

  const labelColors = {
    dark: 'text-emerald-400',
    emerald: 'text-emerald-700 dark:text-emerald-300',
    blue: 'text-blue-700 dark:text-blue-300',
    amber: 'text-amber-700 dark:text-amber-300',
    rose: 'text-rose-700 dark:text-rose-300',
    neutral: 'text-neutral-500 dark:text-neutral-400',
  };

  const subtitleColors = {
    dark: 'text-neutral-400',
    emerald: 'text-emerald-600/80 dark:text-emerald-400/80',
    blue: 'text-blue-600/80 dark:text-blue-400/80',
    amber: 'text-amber-600/80 dark:text-amber-400/80',
    rose: 'text-rose-600/80 dark:text-rose-400/80',
    neutral: 'text-neutral-500 dark:text-neutral-400',
  };

  return (
    <div
      className={`rounded-2xl border p-5 relative overflow-hidden transition-all duration-200 ${variantStyles[variant]} ${
        highlight ? 'ring-2 ring-emerald-500/20 shadow-md' : 'shadow-sm'
      } ${className}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <span className={`block text-xs font-bold uppercase tracking-wider ${labelColors[variant]}`}>
            {label}
          </span>
          <div className="mt-1.5 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {value}
            </span>
          </div>
          {subtitle && (
            <p className={`mt-1 text-xs leading-relaxed ${subtitleColors[variant]}`}>
              {subtitle}
            </p>
          )}
        </div>

        <div className="flex items-center gap-1.5 flex-shrink-0">
          {Icon && (
            <div className="p-2 rounded-xl bg-black/5 dark:bg-white/5 flex-shrink-0">
              <Icon className="w-5 h-5 opacity-80" />
            </div>
          )}

          {copyable && (
            <button
              type="button"
              onClick={handleCopy}
              title="Copy value"
              className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            >
              {copied ? (
                <Check className="w-4 h-4 text-emerald-500" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
