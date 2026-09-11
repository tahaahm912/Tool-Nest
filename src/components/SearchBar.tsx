import React, { useRef } from 'react';
import { Search, X } from 'lucide-react';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  autoFocus?: boolean;
  onClear?: () => void;
  id?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChange,
  placeholder = 'Search for a tool by name, category, or keyword...',
  className = '',
  size = 'md',
  autoFocus = false,
  onClear,
  id = 'global-search-input',
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleClear = () => {
    onChange('');
    if (onClear) onClear();
    inputRef.current?.focus();
  };

  const sizeClasses = {
    sm: 'py-2 pl-9 pr-8 text-sm',
    md: 'py-2.5 pl-10 pr-9 text-base',
    lg: 'py-3.5 pl-12 pr-12 text-base md:text-lg',
  };

  const iconSizes = {
    sm: 'w-4 h-4 left-3',
    md: 'w-4.5 h-4.5 left-3.5',
    lg: 'w-5 h-5 left-4',
  };

  return (
    <div className={`relative w-full ${className}`}>
      <Search
        className={`absolute top-1/2 -translate-y-1/2 text-neutral-400 dark:text-neutral-500 pointer-events-none ${iconSizes[size]}`}
      />
      <input
        ref={inputRef}
        id={id}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        className={`w-full rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/90 text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all shadow-sm ${sizeClasses[size]}`}
      />
      {value && (
        <button
          type="button"
          onClick={handleClear}
          aria-label="Clear search input"
          className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};
