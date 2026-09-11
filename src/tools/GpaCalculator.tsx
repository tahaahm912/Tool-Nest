import React, { useState, useMemo } from 'react';
import { Plus, Trash2, Award, BookOpen, RotateCcw, Copy, Check, Info } from 'lucide-react';
import { ResultCard } from '../components/calculator/ResultCard';
import { ValidationAlert } from '../components/calculator/ValidationAlert';
import { formatGpa, formatNumber, safeDivide } from '../lib/formatters';

interface Course {
  id: string;
  name: string;
  credits: string;
  grade: string;
}

const DEFAULT_GRADE_POINTS: Record<string, number> = {
  'A+': 4.0,
  A: 4.0,
  'A-': 3.7,
  'B+': 3.3,
  B: 3.0,
  'B-': 2.7,
  'C+': 2.3,
  C: 2.0,
  'C-': 1.7,
  'D+': 1.3,
  D: 1.0,
  F: 0.0,
};

export const GpaCalculator: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([
    { id: '1', name: 'Computer Science 101', credits: '4', grade: 'A' },
    { id: '2', name: 'Calculus II', credits: '4', grade: 'A-' },
    { id: '3', name: 'Physics & Mechanics', credits: '4', grade: 'B+' },
    { id: '4', name: 'Academic Writing', credits: '3', grade: 'A' },
  ]);

  const [copied, setCopied] = useState(false);

  const calculation = useMemo(() => {
    let earnedPoints = 0;
    let totalCredits = 0;
    let hasInvalidCredits = false;

    courses.forEach((c) => {
      const cr = parseFloat(c.credits);
      if (isNaN(cr) || cr < 0) {
        hasInvalidCredits = true;
      } else {
        const pts = DEFAULT_GRADE_POINTS[c.grade] ?? 0;
        earnedPoints += pts * cr;
        totalCredits += cr;
      }
    });

    if (hasInvalidCredits) {
      return {
        error: 'Please enter valid positive credit numbers for all courses.',
        totalCredits: 0,
        earnedPoints: 0,
        gpa: '0.00',
      };
    }

    if (totalCredits === 0) {
      return {
        error: 'Total credit hours must be greater than zero to calculate GPA.',
        totalCredits: 0,
        earnedPoints: 0,
        gpa: '0.00',
      };
    }

    const calculatedGpa = safeDivide(earnedPoints, totalCredits, 0);

    // Academic distinction classification
    let distinction = 'Good Standing';
    if (calculatedGpa >= 3.9) distinction = 'Summa Cum Laude / Highest Honors';
    else if (calculatedGpa >= 3.7) distinction = 'Magna Cum Laude / High Honors';
    else if (calculatedGpa >= 3.5) distinction = "Dean's Honor List";
    else if (calculatedGpa < 2.0) distinction = 'Academic Warning / Probation Risk';

    return {
      error: null,
      totalCredits,
      earnedPoints,
      gpa: formatGpa(calculatedGpa),
      numericGpa: calculatedGpa,
      distinction,
    };
  }, [courses]);

  const addCourse = () => {
    setCourses((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        name: `Course ${prev.length + 1}`,
        credits: '3',
        grade: 'A',
      },
    ]);
  };

  const removeCourse = (id: string) => {
    if (courses.length <= 1) return;
    setCourses((prev) => prev.filter((c) => c.id !== id));
  };

  const updateCourse = (id: string, field: keyof Course, val: string) => {
    setCourses((prev) =>
      prev.map((c) => (c.id === id ? { ...c, [field]: val } : c))
    );
  };

  const handleReset = () => {
    setCourses([
      { id: '1', name: 'Course 1', credits: '3', grade: 'A' },
      { id: '2', name: 'Course 2', credits: '3', grade: 'B' },
      { id: '3', name: 'Course 3', credits: '4', grade: 'A-' },
    ]);
  };

  const handleCopy = () => {
    if (calculation.error) return;
    const summary = `Term GPA Report:
Cumulative Term GPA: ${calculation.gpa} / 4.00 (${calculation.distinction})
Total Credits Earned: ${calculation.totalCredits}
Total Grade Points: ${formatNumber(calculation.earnedPoints, { maxDecimals: 2 })}
Courses:
${courses.map((c) => `- ${c.name || 'Course'}: ${c.credits} cr (${c.grade} = ${DEFAULT_GRADE_POINTS[c.grade]?.toFixed(1) || '0.0'})`).join('\n')}
Calculated on ToolNest.`;

    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(summary);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Results Hero Bar */}
      <div className="rounded-2xl bg-neutral-900 text-white dark:bg-neutral-800/90 p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm">
        <div>
          <span className="text-xs uppercase font-bold tracking-wider text-emerald-400">
            Term Grade Point Average (GPA)
          </span>
          <div className="mt-2 flex items-baseline gap-3">
            <span className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white">
              {calculation.gpa}
            </span>
            <span className="text-sm text-neutral-400 font-medium">
              on 4.00 Scale
            </span>
          </div>
          {!calculation.error && (
            <p className="mt-2 text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
              <Award className="w-4 h-4" />
              <span>{calculation.distinction}</span>
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3 w-full sm:w-auto flex-shrink-0">
          <div className="px-4 py-3 rounded-xl bg-white/10 dark:bg-neutral-700/50 backdrop-blur-sm text-center">
            <div className="text-xs text-neutral-300">Total Credits</div>
            <div className="text-xl font-bold text-white">{calculation.totalCredits}</div>
          </div>
          <div className="px-4 py-3 rounded-xl bg-white/10 dark:bg-neutral-700/50 backdrop-blur-sm text-center">
            <div className="text-xs text-neutral-300">Total Points</div>
            <div className="text-xl font-bold text-white">
              {formatNumber(calculation.earnedPoints, { maxDecimals: 2 })}
            </div>
          </div>
        </div>
      </div>

      {calculation.error && <ValidationAlert message={calculation.error} />}

      {/* Course Entry Table */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300">
            Courses & Semester Modules ({courses.length})
          </h3>
          <span className="text-xs text-neutral-500 dark:text-neutral-400">
            Standard 4.0 Collegiate Scale
          </span>
        </div>

        <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/30 overflow-hidden divide-y divide-neutral-200 dark:divide-neutral-800">
          <div className="hidden sm:grid sm:grid-cols-12 gap-3 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 bg-neutral-100/70 dark:bg-neutral-900/80">
            <div className="col-span-6">Course Name / Code</div>
            <div className="col-span-3">Credit Hours</div>
            <div className="col-span-2">Grade</div>
            <div className="col-span-1 text-center">Del</div>
          </div>

          {courses.map((course, idx) => (
            <div
              key={course.id}
              className="grid grid-cols-1 sm:grid-cols-12 gap-3 p-3 sm:px-4 sm:py-3 items-center"
            >
              {/* Course Title */}
              <div className="sm:col-span-6">
                <label className="block sm:hidden text-xs font-medium text-neutral-500 mb-1">
                  Course Name
                </label>
                <input
                  type="text"
                  value={course.name}
                  onChange={(e) => updateCourse(course.id, 'name', e.target.value)}
                  placeholder={`e.g. Course ${idx + 1}`}
                  className="w-full rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 px-3 py-2 text-sm text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                />
              </div>

              {/* Credit Hours */}
              <div className="sm:col-span-3">
                <label className="block sm:hidden text-xs font-medium text-neutral-500 mb-1">
                  Credit Hours
                </label>
                <input
                  type="number"
                  min="0"
                  max="30"
                  step="0.5"
                  value={course.credits}
                  onChange={(e) => updateCourse(course.id, 'credits', e.target.value)}
                  placeholder="3"
                  className="w-full rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 px-3 py-2 text-sm font-semibold text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                />
              </div>

              {/* Letter Grade */}
              <div className="sm:col-span-2">
                <label className="block sm:hidden text-xs font-medium text-neutral-500 mb-1">
                  Letter Grade
                </label>
                <select
                  value={course.grade}
                  onChange={(e) => updateCourse(course.id, 'grade', e.target.value)}
                  className="w-full rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 px-3 py-2 text-sm font-semibold text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                >
                  {Object.keys(DEFAULT_GRADE_POINTS).map((letter) => (
                    <option key={letter} value={letter}>
                      {letter} ({DEFAULT_GRADE_POINTS[letter].toFixed(1)})
                    </option>
                  ))}
                </select>
              </div>

              {/* Remove Course Action */}
              <div className="sm:col-span-1 flex justify-end sm:justify-center">
                <button
                  type="button"
                  onClick={() => removeCourse(course.id)}
                  disabled={courses.length <= 1}
                  title="Remove Course"
                  className="p-2 rounded-lg text-neutral-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Add Course Button */}
        <button
          type="button"
          onClick={addCourse}
          className="w-full py-2.5 rounded-xl border border-dashed border-neutral-300 dark:border-neutral-700 hover:border-emerald-500 dark:hover:border-emerald-500 text-neutral-600 dark:text-neutral-300 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20 font-semibold text-xs flex items-center justify-center gap-1.5 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add Another Course</span>
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
          <span>Reset Courses</span>
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
                <span>Transcript Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Summary</span>
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
};
