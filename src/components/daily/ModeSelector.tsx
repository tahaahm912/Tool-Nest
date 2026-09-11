import React from 'react';
import { LucideIcon } from 'lucide-react';

export interface ModeOption<T extends string> {
  id: T;
  label: string;
  icon?: LucideIcon;
  badge?: string;
}

interface ModeSelectorProps<T extends string> {
  options: ModeOption<T>[];
  activeId: T;
  onChange: (id: T) => void;
  className?: string;
  size?: 'sm' | 'md';
}

export function ModeSelector<T extends string>({
  options,
  activeId,
  onChange,
  className = '',
  size = 'md',
}: ModeSelectorProps<T>) {
  const sizeClasses = {
    sm: 'p-1 text-xs',
    md: 'p-1.5 text-sm',
  };

  const itemSizeClasses = {
    sm: 'px-2.5 py-1.5 text-xs',
    md: 'px-3.5 py-2 text-sm',
  };

  return (
    <div
      role="tablist"
      className={`inline-flex flex-wrap items-center gap-1 rounded-2xl bg-neutral-100 dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 ${sizeClasses[size]} ${className}`}
    >
      {options.map((opt) => {
        const Icon = opt.icon;
        const isActive = activeId === opt.id;

        return (
          <button
            key={opt.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(opt.id)}
            className={`relative flex items-center gap-2 rounded-xl font-medium transition-all duration-150 whitespace-nowrap ${
              itemSizeClasses[size]
            } ${
              isActive
                ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-sm border border-neutral-200/60 dark:border-neutral-700 font-semibold'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200 hover:bg-black/5 dark:hover:bg-white/5'
            }`}
          >
            {Icon && <Icon className="w-4 h-4 opacity-75" />}
            <span>{opt.label}</span>
            {opt.badge && (
              <span
                className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${
                  isActive
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300'
                    : 'bg-neutral-200 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-400'
                }`}
              >
                {opt.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
