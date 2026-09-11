import React from 'react';
import { HelpCircle } from 'lucide-react';

interface FormulaBoxProps {
  title?: string;
  formula: string;
  explanation?: string;
  substitution?: string;
}

export const FormulaBox: React.FC<FormulaBoxProps> = ({
  title = 'Formula & Calculation',
  formula,
  explanation,
  substitution,
}) => {
  return (
    <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/70 dark:bg-neutral-900/40 p-4 text-xs">
      <div className="flex items-center gap-1.5 font-bold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider mb-2">
        <HelpCircle className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
        <span>{title}</span>
      </div>

      <div className="font-mono text-xs px-3 py-2 rounded-lg bg-white dark:bg-neutral-950 border border-neutral-200/80 dark:border-neutral-800 text-emerald-700 dark:text-emerald-400 mb-1.5 overflow-x-auto">
        {formula}
      </div>

      {substitution && (
        <div className="font-mono text-xs text-neutral-600 dark:text-neutral-400 px-1 py-1">
          <span className="font-semibold text-neutral-500">Values:</span> {substitution}
        </div>
      )}

      {explanation && (
        <p className="mt-1 text-neutral-600 dark:text-neutral-400 leading-relaxed">
          {explanation}
        </p>
      )}
    </div>
  );
};
