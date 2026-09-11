import React from 'react';
import { GradeScaleItem, DEFAULT_GRADE_SCALE } from '../../lib/student/grades';
import { BookOpen } from 'lucide-react';

interface GradeScaleDisplayProps {
  scale?: GradeScaleItem[];
}

export const GradeScaleDisplay: React.FC<GradeScaleDisplayProps> = ({
  scale = DEFAULT_GRADE_SCALE,
}) => {
  return (
    <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 p-4 sm:p-5 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-emerald-600" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-800 dark:text-neutral-200">
            Grading Scale Reference
          </h3>
        </div>
        <span className="text-xs text-neutral-400">Standard Collegiate 100-pt Scale</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 pt-1">
        {scale.map((item) => (
          <div
            key={item.letter}
            className="flex items-center justify-between p-2 rounded-xl bg-neutral-50 dark:bg-neutral-850/60 border border-neutral-100 dark:border-neutral-800 text-xs"
          >
            <div className="flex items-center gap-2">
              <span className="font-bold text-neutral-900 dark:text-neutral-100 font-mono w-7">
                {item.letter}
              </span>
              <span className="text-neutral-500 font-mono text-[11px]">
                {item.minPercentage}% - {Math.ceil(item.maxPercentage)}%
              </span>
            </div>
            <span className="text-[10px] text-neutral-400 truncate max-w-[70px]" title={item.description}>
              {item.description}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
