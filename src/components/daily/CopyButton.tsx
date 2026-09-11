import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

interface CopyButtonProps {
  textToCopy: string;
  label?: string;
  copiedLabel?: string;
  className?: string;
  variant?: 'primary' | 'secondary' | 'ghost' | 'icon';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
}

export const CopyButton: React.FC<CopyButtonProps> = ({
  textToCopy,
  label = 'Copy',
  copiedLabel = 'Copied!',
  className = '',
  variant = 'secondary',
  size = 'md',
  disabled = false,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (disabled || !textToCopy) return;

    try {
      if (typeof window !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(textToCopy);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
    }
  };

  const sizeClasses = {
    sm: 'px-2.5 py-1.5 text-xs',
    md: 'px-3.5 py-2 text-sm',
    lg: 'px-4 py-2.5 text-base',
  };

  const variantClasses = {
    primary:
      'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm border border-emerald-600',
    secondary:
      'bg-white dark:bg-neutral-900 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-neutral-800 dark:text-neutral-200 border border-neutral-200 dark:border-neutral-700 shadow-sm',
    ghost:
      'bg-transparent hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100',
    icon: 'p-2 rounded-lg bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-600 dark:text-neutral-300',
  };

  if (variant === 'icon') {
    return (
      <button
        type="button"
        onClick={handleCopy}
        disabled={disabled || !textToCopy}
        aria-label={copied ? copiedLabel : label}
        title={copied ? copiedLabel : label}
        className={`transition-all duration-150 inline-flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed ${variantClasses.icon} ${className}`}
      >
        {copied ? (
          <Check className="w-4 h-4 text-emerald-500 animate-in fade-in" />
        ) : (
          <Copy className="w-4 h-4" />
        )}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      disabled={disabled || !textToCopy}
      aria-label={copied ? copiedLabel : label}
      className={`inline-flex items-center gap-2 rounded-xl font-medium transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
    >
      {copied ? (
        <Check className="w-4 h-4 text-emerald-500 animate-in fade-in" />
      ) : (
        <Copy className="w-4 h-4 opacity-80" />
      )}
      <span>{copied ? copiedLabel : label}</span>
    </button>
  );
};
