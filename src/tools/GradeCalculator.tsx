import React, { useState, useMemo } from 'react';
import {
  AssessmentItem,
  calculateGrades,
  calculateTargetFinalScore,
  DEFAULT_GRADE_SCALE,
  GradeScaleItem,
} from '../lib/student/grades';
import { DynamicAssessmentRow } from '../components/student/DynamicAssessmentRow';
import { GradeScaleDisplay } from '../components/student/GradeScaleDisplay';
import {
  Plus,
  Trash2,
  Copy,
  Check,
  RotateCcw,
  Target,
  Award,
  AlertTriangle,
  BookOpen,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { formatNumber } from '../lib/formatters';

const PRESET_COLLEGE: AssessmentItem[] = [
  { id: '1', name: 'Homework Assignments', obtained: '92', total: '100', weight: '20' },
  { id: '2', name: 'Midterm Examination', obtained: '84', total: '100', weight: '30' },
  { id: '3', name: 'Semester Project', obtained: '95', total: '100', weight: '20' },
  { id: '4', name: 'Final Examination', obtained: '88', total: '100', weight: '30' },
];

const PRESET_PARTIAL: AssessmentItem[] = [
  { id: '1', name: 'Weekly Problem Sets', obtained: '18', total: '20', weight: '20' },
  { id: '2', name: 'Midterm 1', obtained: '42', total: '50', weight: '25' },
  { id: '3', name: 'Midterm 2', obtained: '45', total: '50', weight: '25' },
];

export const GradeCalculator: React.FC = () => {
  const [mode, setMode] = useState<'weighted' | 'simple'>('weighted');
  const [items, setItems] = useState<AssessmentItem[]>(PRESET_COLLEGE);
  const [targetGrade, setTargetGrade] = useState<number>(85);
  const [copied, setCopied] = useState<boolean>(false);
  const [showScaleReference, setShowScaleReference] = useState<boolean>(false);

  // Dynamic Grade Calculation
  const result = useMemo(() => {
    return calculateGrades(items, mode, DEFAULT_GRADE_SCALE);
  }, [items, mode]);

  // Target Final Planner calculation
  const targetPlanning = useMemo(() => {
    if (mode !== 'weighted') return null;
    return calculateTargetFinalScore(result.percentage, result.totalWeight, targetGrade);
  }, [mode, result.percentage, result.totalWeight, targetGrade]);

  // Assessment item actions
  const handleItemChange = (id: string, field: keyof AssessmentItem, value: string) => {
    setItems((prev) =>
      prev.map((it) => (it.id === id ? { ...it, [field]: value } : it))
    );
  };

  const handleAddItem = () => {
    const newItem: AssessmentItem = {
      id: Date.now().toString(),
      name: `Assessment #${items.length + 1}`,
      obtained: '',
      total: '100',
      weight: mode === 'weighted' ? '10' : '0',
    };
    setItems([...items, newItem]);
  };

  const handleRemoveItem = (id: string) => {
    if (items.length <= 1) return;
    setItems((prev) => prev.filter((it) => it.id !== id));
  };

  const handleReset = () => {
    setItems([
      { id: '1', name: 'Assignment 1', obtained: '', total: '100', weight: '25' },
      { id: '2', name: 'Midterm Exam', obtained: '', total: '100', weight: '35' },
      { id: '3', name: 'Final Exam', obtained: '', total: '100', weight: '40' },
    ]);
  };

  const handleLoadPreset = (presetType: 'standard' | 'partial') => {
    if (presetType === 'standard') {
      setItems(PRESET_COLLEGE);
    } else {
      setItems(PRESET_PARTIAL);
    }
  };

  const handleCopyReport = () => {
    let report = `Academic Grade Calculation Report:\n`;
    report += `Mode: ${mode === 'weighted' ? 'Weighted Syllabus' : 'Simple Marks'}\n`;
    report += `Overall Percentage: ${formatNumber(result.percentage, 1)}%\n`;
    report += `Letter Grade: ${result.letterGrade} (${result.gradeDescription})\n\n`;
    report += `Components Breakdown:\n`;
    result.assessments.forEach((a) => {
      report += `• ${a.name}: ${a.obtained}/${a.total} (${formatNumber(a.percentage, 1)}%)`;
      if (mode === 'weighted') {
        report += ` [Weight: ${a.weight}%, Contribution: +${formatNumber(a.weightedContribution, 2)} pts]`;
      }
      report += `\n`;
    });
    if (targetPlanning && targetPlanning.remainingWeight > 0) {
      report += `\nTarget Final Planner (Aiming for ${targetGrade}%):\n`;
      report += `• ${targetPlanning.message}\n`;
    }
    report += `\nGenerated with ToolNest Grade Calculator`;

    navigator.clipboard.writeText(report);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Top Header & Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-200 dark:border-neutral-800 pb-4">
        {/* Mode Toggle Tabs */}
        <div className="flex items-center p-1.5 rounded-2xl bg-neutral-100 dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-750">
          <button
            type="button"
            onClick={() => setMode('weighted')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              mode === 'weighted'
                ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 shadow-sm'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100'
            }`}
          >
            Weighted Syllabus Mode
          </button>
          <button
            type="button"
            onClick={() => setMode('simple')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              mode === 'simple'
                ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 shadow-sm'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100'
            }`}
          >
            Simple Points / Marks Mode
          </button>
        </div>

        {/* Action Controls: Presets, Copy, Reset */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => handleLoadPreset('standard')}
            className="px-3 py-1.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-xs font-semibold text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
          >
            Full Syllabus Preset
          </button>
          <button
            type="button"
            onClick={() => handleLoadPreset('partial')}
            className="px-3 py-1.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-xs font-semibold text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
          >
            Partial Term Preset
          </button>
          <button
            type="button"
            onClick={handleCopyReport}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="p-2 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 transition-colors"
            title="Reset assessments"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Grade Results Overview Card */}
      <div className="rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-mono font-black text-3xl shadow-sm flex-shrink-0">
              {result.letterGrade}
            </div>

            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                  Calculated Academic Standing
                </span>
                {result.isPartial && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300">
                    Partial Term
                  </span>
                )}
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-neutral-900 dark:text-white">
                {result.gradeDescription}
              </h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                {mode === 'weighted'
                  ? `Based on ${result.totalWeight.toFixed(1)}% total syllabus weight evaluated.`
                  : `Sum of ${formatNumber(result.totalObtainedMarks, 1)} earned out of ${formatNumber(result.totalPossibleMarks, 1)} possible marks.`}
              </p>
            </div>
          </div>

          {/* Percentage numbers */}
          <div className="flex flex-col items-start md:items-end">
            <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
              {result.isPartial ? 'Current Weighted Total' : 'Overall Grade'}
            </span>
            <div className="font-mono text-4xl sm:text-5xl font-black text-neutral-900 dark:text-white mt-1">
              {formatNumber(result.percentage, 1)}%
            </div>
            {result.isPartial && (
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 mt-1">
                Normalized Average: {formatNumber(result.normalizedPercentage, 1)}%
              </span>
            )}
          </div>
        </div>

        {/* Warning if weights != 100 in weighted mode */}
        {result.warning && (
          <div className="mt-5 p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/80 flex items-center gap-2.5 text-xs text-amber-800 dark:text-amber-300">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{result.warning}</span>
          </div>
        )}

        {/* Syllabus Weight Progress Bar (in weighted mode) */}
        {mode === 'weighted' && (
          <div className="mt-6 pt-5 border-t border-neutral-100 dark:border-neutral-800">
            <div className="flex items-center justify-between text-xs font-medium text-neutral-500 mb-2">
              <span>Syllabus Weight Allocated: <strong>{result.totalWeight.toFixed(1)}%</strong></span>
              <span>Remaining: <strong>{Math.max(0, 100 - result.totalWeight).toFixed(1)}%</strong></span>
            </div>
            <div className="w-full h-3 rounded-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden shadow-inner">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  result.totalWeight > 100
                    ? 'bg-rose-500'
                    : result.totalWeight === 100
                    ? 'bg-emerald-500'
                    : 'bg-blue-500'
                }`}
                style={{ width: `${Math.min(100, result.totalWeight)}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Target Final Grade Planner Card (When partial weight < 100% in weighted mode) */}
      {mode === 'weighted' && result.totalWeight < 100 && targetPlanning && (
        <div className="p-6 rounded-3xl border border-blue-200 dark:border-blue-850 bg-blue-50/40 dark:bg-blue-950/20 shadow-sm space-y-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-blue-600 text-white shadow-sm">
              <Target className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <h3 className="text-base font-bold text-neutral-900 dark:text-white">
                  Target Final Grade Planner
                </h3>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-neutral-500">Desired Target Grade:</span>
                  <input
                    type="number"
                    min="50"
                    max="100"
                    value={targetGrade}
                    onChange={(e) => setTargetGrade(parseFloat(e.target.value) || 85)}
                    className="w-16 px-2 py-1 rounded-lg border border-neutral-300 dark:border-neutral-700 text-xs font-mono font-bold bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white text-center"
                  />
                  <span className="text-xs text-neutral-500">%</span>
                </div>
              </div>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1.5 leading-relaxed">
                {targetPlanning.message}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Assessment Components List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-neutral-900 dark:text-white flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-emerald-600" />
            <span>Coursework & Assessments</span>
          </h3>

          <button
            type="button"
            onClick={handleAddItem}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Assessment</span>
          </button>
        </div>

        {/* Dynamic Rows */}
        <div className="space-y-2.5">
          {items.map((item, index) => (
            <DynamicAssessmentRow
              key={item.id}
              index={index}
              item={item}
              mode={mode}
              canRemove={items.length > 1}
              onChange={handleItemChange}
              onRemove={handleRemoveItem}
            />
          ))}
        </div>
      </div>

      {/* Collapsible Grading Scale Reference */}
      <div className="border-t border-neutral-200 dark:border-neutral-800 pt-6">
        <button
          type="button"
          onClick={() => setShowScaleReference(!showScaleReference)}
          className="flex items-center justify-between w-full p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-left hover:bg-neutral-50 dark:hover:bg-neutral-850 transition-colors"
        >
          <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200 flex items-center gap-2">
            <Award className="w-4 h-4 text-emerald-600" />
            <span>Collegiate Letter Grade Conversion Thresholds</span>
          </span>
          {showScaleReference ? <ChevronUp className="w-4 h-4 text-neutral-400" /> : <ChevronDown className="w-4 h-4 text-neutral-400" />}
        </button>

        {showScaleReference && (
          <div className="mt-3">
            <GradeScaleDisplay />
          </div>
        )}
      </div>
    </div>
  );
};
