import React from 'react';
import { Trash2, AlertCircle } from 'lucide-react';
import { AssessmentItem } from '../../lib/student/grades';
import { formatNumber } from '../../lib/formatters';

interface DynamicAssessmentRowProps {
  index: number;
  item: AssessmentItem;
  mode: 'simple' | 'weighted';
  canRemove: boolean;
  onChange: (id: string, field: keyof AssessmentItem, value: string) => void;
  onRemove: (id: string) => void;
}

export const DynamicAssessmentRow: React.FC<DynamicAssessmentRowProps> = ({
  index,
  item,
  mode,
  canRemove,
  onChange,
  onRemove,
}) => {
  const obtainedNum = parseFloat(item.obtained);
  const totalNum = parseFloat(item.total);
  const weightNum = parseFloat(item.weight);

  const isObtainedInvalid = !isNaN(obtainedNum) && !isNaN(totalNum) && totalNum > 0 && obtainedNum > totalNum;
  const isNegative = (!isNaN(obtainedNum) && obtainedNum < 0) || (!isNaN(totalNum) && totalNum < 0);

  const percentage = !isNaN(obtainedNum) && !isNaN(totalNum) && totalNum > 0
    ? (obtainedNum / totalNum) * 100
    : 0;

  const weightedContribution = mode === 'weighted' && !isNaN(weightNum)
    ? (percentage * weightNum) / 100
    : 0;

  return (
    <div className="p-3.5 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm transition-all hover:border-neutral-300 dark:hover:border-neutral-700">
      <div className="grid grid-cols-12 gap-3 items-center">
        {/* Assessment Name */}
        <div className="col-span-12 sm:col-span-4">
          <label htmlFor={`assess-name-${item.id}`} className="block text-[11px] font-semibold text-neutral-500 uppercase tracking-wider mb-1 sm:hidden">
            Assessment Name
          </label>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs text-neutral-400 w-5 hidden sm:inline-block">
              {(index + 1).toString().padStart(2, '0')}.
            </span>
            <input
              id={`assess-name-${item.id}`}
              type="text"
              value={item.name}
              onChange={(e) => onChange(item.id, 'name', e.target.value)}
              placeholder="e.g. Midterm Exam"
              className="w-full px-3 py-2 text-xs font-semibold text-neutral-900 dark:text-neutral-100 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
            />
          </div>
        </div>

        {/* Obtained Marks */}
        <div className="col-span-6 sm:col-span-2">
          <label htmlFor={`assess-ob-${item.id}`} className="block text-[11px] font-semibold text-neutral-500 uppercase tracking-wider mb-1 sm:hidden">
            Obtained
          </label>
          <input
            id={`assess-ob-${item.id}`}
            type="number"
            min="0"
            step="any"
            value={item.obtained}
            onChange={(e) => onChange(item.id, 'obtained', e.target.value)}
            placeholder="Score"
            className={`w-full px-3 py-2 text-xs font-mono font-semibold bg-neutral-50 dark:bg-neutral-950 border rounded-xl focus:outline-none focus:ring-2 ${
              isObtainedInvalid || isNegative
                ? 'border-rose-400 text-rose-600 focus:ring-rose-500/30'
                : 'border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-neutral-100 focus:ring-emerald-500/30'
            }`}
          />
        </div>

        {/* Total Possible Marks */}
        <div className="col-span-6 sm:col-span-2">
          <label htmlFor={`assess-tot-${item.id}`} className="block text-[11px] font-semibold text-neutral-500 uppercase tracking-wider mb-1 sm:hidden">
            Total Possible
          </label>
          <input
            id={`assess-tot-${item.id}`}
            type="number"
            min="0.1"
            step="any"
            value={item.total}
            onChange={(e) => onChange(item.id, 'total', e.target.value)}
            placeholder="Out of"
            className="w-full px-3 py-2 text-xs font-mono font-semibold text-neutral-900 dark:text-neutral-100 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
          />
        </div>

        {/* Weight % (Only in Weighted Mode) */}
        {mode === 'weighted' ? (
          <div className="col-span-6 sm:col-span-2">
            <label htmlFor={`assess-wt-${item.id}`} className="block text-[11px] font-semibold text-neutral-500 uppercase tracking-wider mb-1 sm:hidden">
              Weight %
            </label>
            <div className="relative">
              <input
                id={`assess-wt-${item.id}`}
                type="number"
                min="0"
                max="100"
                step="any"
                value={item.weight}
                onChange={(e) => onChange(item.id, 'weight', e.target.value)}
                placeholder="Weight"
                className="w-full pl-3 pr-7 py-2 text-xs font-mono font-semibold text-neutral-900 dark:text-neutral-100 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
              />
              <span className="absolute right-2.5 top-2 text-xs text-neutral-400 select-none">%</span>
            </div>
          </div>
        ) : null}

        {/* Summary Pill & Delete Action */}
        <div className={`col-span-6 ${mode === 'weighted' ? 'sm:col-span-2' : 'sm:col-span-4'} flex items-center justify-between sm:justify-end gap-2`}>
          <div className="text-right">
            <div className="font-mono text-xs font-bold text-neutral-800 dark:text-neutral-200">
              {formatNumber(percentage, 1)}%
            </div>
            {mode === 'weighted' && (
              <div className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400">
                +{formatNumber(weightedContribution, 2)} pts
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => onRemove(item.id)}
            disabled={!canRemove}
            className="p-2 rounded-xl text-neutral-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
            title="Remove assessment"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {isObtainedInvalid && (
        <div className="flex items-center gap-1.5 mt-2 text-[11px] text-rose-600 dark:text-rose-400">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>Obtained score ({obtainedNum}) cannot exceed total possible marks ({totalNum}).</span>
        </div>
      )}
    </div>
  );
};
