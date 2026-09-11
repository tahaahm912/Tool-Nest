import React from 'react';
import { ShieldCheck } from 'lucide-react';

interface PrivacyBadgeProps {
  className?: string;
  extraText?: string;
}

export const PrivacyBadge: React.FC<PrivacyBadgeProps> = ({ className = '', extraText }) => {
  return (
    <div
      className={`flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs font-medium ${className}`}
    >
      <ShieldCheck className="w-4 h-4 flex-shrink-0 text-emerald-600 dark:text-emerald-400" />
      <span>
        Your image is processed locally in your browser and is never uploaded to any server.
        {extraText ? ` ${extraText}` : ''}
      </span>
    </div>
  );
};
