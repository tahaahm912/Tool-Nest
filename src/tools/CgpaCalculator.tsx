import React, { useState, useMemo } from 'react';
import { Plus, Trash2, Award, GraduationCap, RotateCcw, Copy, Check, Info } from 'lucide-react';
import { ResultCard } from '../components/calculator/ResultCard';
import { ValidationAlert } from '../components/calculator/ValidationAlert';
import { formatGpa, formatNumber, safeDivide } from '../lib/formatters';

interface Semester {
  id: string;
  name: string;
  gpa: string;
  credits: string;
}

export const CgpaCalculator: React.FC = () => {
  const [scale, setScale] = useState<'4.0' | '5.0' | '10.0'>('4.0');
  const [semesters, setSemesters] = useState<Semester[]>([
    { id: '1', name: 'Semester 1', gpa: '3.80', credits: '16' },
    { id: '2', name: 'Semester 2', gpa: '3.65', credits: '18' },
    { id: '3', name: 'Semester 3', gpa: '3.90', credits: '15' },
    { id: '4', name: 'Semester 4', gpa: '3.75', credits: '17' },
  ]);

  const [copied, setCopied] = useState(false);

  const maxScaleValue = parseFloat(scale);

  const calculation = useMemo(() => {
    let totalQualityPoints = 0;
    let totalCredits = 0;
    let invalidGpaMsg: string | null = null;
    let invalidCreditMsg: string | null = null;

    semesters.forEach((sem, idx) => {
      const gpaNum = parseFloat(sem.gpa);
      const creditsNum = parseFloat(sem.credits);

      if (isNaN(gpaNum) || gpaNum < 0 || gpaNum > maxScaleValue) {
        invalidGpaMsg = `${sem.name || `Semester ${idx + 1}`} has an invalid GPA. It must be between 0.00 and ${scale}.`;
      }
      if (isNaN(creditsNum) || creditsNum <= 0) {
        invalidCreditMsg = `${sem.name || `Semester ${idx + 1}`} must have credit hours greater than 0.`;
      }

      if (!isNaN(gpaNum) && !isNaN(creditsNum) && creditsNum > 0) {
        totalQualityPoints += gpaNum * creditsNum;
        totalCredits += creditsNum;
      }
    });

    if (invalidGpaMsg) {
      return {
        error: invalidGpaMsg,
        cgpa: '0.00',
        totalCredits: 0,
        totalQualityPoints: 0,
        numSemesters: semesters.length,
      };
    }

    if (invalidCreditMsg) {
      return {
        error: invalidCreditMsg,
        cgpa: '0.00',
        totalCredits: 0,
        totalQualityPoints: 0,
        numSemesters: semesters.length,
      };
    }

    if (totalCredits === 0) {
      return {
        error: 'Total credit hours must be greater than zero.',
        cgpa: '0.00',
        totalCredits: 0,
        totalQualityPoints: 0,
        numSemesters: semesters.length,
      };
    }

    const calculatedCgpa = safeDivide(totalQualityPoints, totalCredits, 0);

    // Degree Classification
    let classification = 'Good Standing';
    const ratio = calculatedCgpa / maxScaleValue;
    if (ratio >= 0.95) classification = 'First Class with Distinction / High Honors';
    else if (ratio >= 0.85) classification = 'First Class / Honors';
    else if (ratio >= 0.70) classification = 'Second Class Upper';
    else if (ratio >= 0.50) classification = 'Pass Division';
    else classification = 'Academic Warning / Sub-minimum';

    return {
      error: null,
      cgpa: formatGpa(calculatedCgpa),
      totalCredits,
      totalQualityPoints,
      numSemesters: semesters.length,
      classification,
    };
  }, [semesters, maxScaleValue, scale]);

  const addSemester = () => {
    setSemesters((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        name: `Semester ${prev.length + 1}`,
        gpa: '3.50',
        credits: '16',
      },
    ]);
  };

  const removeSemester = (id: string) => {
    if (semesters.length <= 1) return;
    setSemesters((prev) => prev.filter((s) => s.id !== id));
  };

  const updateSemester = (id: string, field: keyof Semester, val: string) => {
    setSemesters((prev) =>
      prev.map((s) => (s.id === id ? { ...s, [field]: val } : s))
    );
  };

  const handleReset = () => {
    setSemesters([
      { id: '1', name: 'Semester 1', gpa: '3.50', credits: '16' },
      { id: '2', name: 'Semester 2', gpa: '3.60', credits: '16' },
      { id: '3', name: 'Semester 3', gpa: '3.70', credits: '15' },
    ]);
  };

  const handleCopy = () => {
    if (calculation.error) return;
    const summary = `Cumulative GPA (CGPA) Report:
Overall CGPA: ${calculation.cgpa} / ${scale} (${calculation.classification})
Total Completed Semesters: ${calculation.numSemesters}
Total Earned Credits: ${calculation.totalCredits}
Total Quality Points: ${formatNumber(calculation.totalQualityPoints, { maxDecimals: 2 })}
Semesters Breakdown:
${semesters.map((s) => `- ${s.name}: GPA ${s.gpa}, ${s.credits} Credits`).join('\n')}
Calculated on ToolNest.`;

    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(summary);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Scale Selection Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
        <div className="flex items-center gap-2">
          <GraduationCap className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span className="text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300">
            Grading Scale:
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          {(['4.0', '5.0', '10.0'] as const).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setScale(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                scale === s
                  ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-sm border border-neutral-200 dark:border-neutral-700'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900'
              }`}
            >
              {s} Scale {s === '4.0' ? '(US / Standard)' : s === '10.0' ? '(India / Europe)' : ''}
            </button>
          ))}
        </div>
      </div>

      {/* Top CGPA Hero Card */}
      <div className="rounded-2xl bg-neutral-900 text-white dark:bg-neutral-800/90 p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm">
        <div>
          <span className="text-xs uppercase font-bold tracking-wider text-emerald-400">
            Cumulative Grade Point Average (CGPA)
          </span>
          <div className="mt-2 flex items-baseline gap-3">
            <span className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white">
              {calculation.cgpa}
            </span>
            <span className="text-sm text-neutral-400 font-medium">
              out of {scale} Scale
            </span>
          </div>
          {!calculation.error && (
            <p className="mt-2 text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
              <Award className="w-4 h-4" />
              <span>{calculation.classification}</span>
            </p>
          )}
        </div>

        <div className="grid grid-cols-3 gap-2 sm:gap-3 w-full sm:w-auto flex-shrink-0">
          <div className="px-3 sm:px-4 py-3 rounded-xl bg-white/10 dark:bg-neutral-700/50 backdrop-blur-sm text-center">
            <div className="text-[11px] text-neutral-300">Semesters</div>
            <div className="text-lg sm:text-xl font-bold text-white">{calculation.numSemesters}</div>
          </div>
          <div className="px-3 sm:px-4 py-3 rounded-xl bg-white/10 dark:bg-neutral-700/50 backdrop-blur-sm text-center">
            <div className="text-[11px] text-neutral-300">Credits</div>
            <div className="text-lg sm:text-xl font-bold text-white">{calculation.totalCredits}</div>
          </div>
          <div className="px-3 sm:px-4 py-3 rounded-xl bg-white/10 dark:bg-neutral-700/50 backdrop-blur-sm text-center">
            <div className="text-[11px] text-neutral-300">Points</div>
            <div className="text-lg sm:text-xl font-bold text-white">
              {formatNumber(calculation.totalQualityPoints, { maxDecimals: 1 })}
            </div>
          </div>
        </div>
      </div>

      {calculation.error && <ValidationAlert message={calculation.error} />}

      {/* Semester Rows */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300">
            Academic Terms ({semesters.length})
          </h3>
          <span className="text-xs text-neutral-500 dark:text-neutral-400">
            Formula: Sum(GPA × Credits) ÷ Sum(Credits)
          </span>
        </div>

        <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/30 overflow-hidden divide-y divide-neutral-200 dark:divide-neutral-800">
          <div className="hidden sm:grid sm:grid-cols-12 gap-3 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 bg-neutral-100/70 dark:bg-neutral-900/80">
            <div className="col-span-5">Semester / Academic Term</div>
            <div className="col-span-3">Term GPA (Max: {scale})</div>
            <div className="col-span-3">Total Credits</div>
            <div className="col-span-1 text-center">Action</div>
          </div>

          {semesters.map((semester, idx) => (
            <div
              key={semester.id}
              className="grid grid-cols-1 sm:grid-cols-12 gap-3 p-3 sm:px-4 sm:py-3 items-center"
            >
              {/* Semester Name */}
              <div className="sm:col-span-5">
                <label className="block sm:hidden text-xs font-medium text-neutral-500 mb-1">
                  Term / Semester Name
                </label>
                <input
                  type="text"
                  value={semester.name}
                  onChange={(e) => updateSemester(semester.id, 'name', e.target.value)}
                  placeholder={`e.g. Semester ${idx + 1}`}
                  className="w-full rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 px-3 py-2 text-sm text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                />
              </div>

              {/* Term GPA */}
              <div className="sm:col-span-3">
                <label className="block sm:hidden text-xs font-medium text-neutral-500 mb-1">
                  Term GPA (0.00 - {scale})
                </label>
                <input
                  type="number"
                  min="0"
                  max={scale}
                  step="0.01"
                  value={semester.gpa}
                  onChange={(e) => updateSemester(semester.id, 'gpa', e.target.value)}
                  placeholder="e.g. 3.75"
                  className="w-full rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 px-3 py-2 text-sm font-semibold text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                />
              </div>

              {/* Credits */}
              <div className="sm:col-span-3">
                <label className="block sm:hidden text-xs font-medium text-neutral-500 mb-1">
                  Credit Hours
                </label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  step="0.5"
                  value={semester.credits}
                  onChange={(e) => updateSemester(semester.id, 'credits', e.target.value)}
                  placeholder="e.g. 16"
                  className="w-full rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 px-3 py-2 text-sm font-semibold text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                />
              </div>

              {/* Remove */}
              <div className="sm:col-span-1 flex justify-end sm:justify-center">
                <button
                  type="button"
                  onClick={() => removeSemester(semester.id)}
                  disabled={semesters.length <= 1}
                  title="Remove Semester"
                  className="p-2 rounded-lg text-neutral-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Add Semester Button */}
        <button
          type="button"
          onClick={addSemester}
          className="w-full py-2.5 rounded-xl border border-dashed border-neutral-300 dark:border-neutral-700 hover:border-emerald-500 dark:hover:border-emerald-500 text-neutral-600 dark:text-neutral-300 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20 font-semibold text-xs flex items-center justify-center gap-1.5 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add Another Semester</span>
        </button>
      </div>

      {/* Action Footer */}
      <div className="flex items-center justify-between gap-3 pt-4 border-t border-neutral-200/80 dark:border-neutral-800/80">
        <button
          type="button"
          onClick={handleReset}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Semesters</span>
        </button>

        {!calculation.error && (
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Summary Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy CGPA Report</span>
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
};
