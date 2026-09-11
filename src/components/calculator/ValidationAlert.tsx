import React from 'react';
import { AlertCircle } from 'lucide-react';

interface ValidationAlertProps {
  message: string;
  className?: string;
}

export const ValidationAlert: React.FC<ValidationAlertProps> = ({ message, className = '' }) => {
  if (!message) return null;

  return (
    <div
      role="alert"
      className={`rounded-xl border border-rose-200 dark:border-rose-900/50 bg-rose-50/80 dark:bg-rose-950/40 p-4 text-sm text-rose-800 dark:text-rose-200 flex items-start gap-3 ${className}`}
    >
      <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 flex-shrink-0 mt-0.5" />
      <div className="flex-1 font-medium">{message}</div>
    </div>
  );
};
