import React from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  HelpCircle,
  TrendingUp,
  Percent,
  Calendar,
  Info
} from 'lucide-react';
import { AttendanceResult } from '../../lib/student/attendance';
import { formatNumber } from '../../lib/formatters';

interface AttendanceSummaryProps {
  result: AttendanceResult;
}

export const AttendanceSummary: React.FC<AttendanceSummaryProps> = ({ result }) => {
  const {
    total,
    attended,
    missed,
    currentPercentage,
    requiredPercentage,
    status,
    classesToAttend,
    classesCanMiss,
    message,
  } = result;

  const isSafe = status === 'above' || status === 'exact';
  const percentageDisplay = formatNumber(currentPercentage, 1);

  return (
    <div className="space-y-6" id="attendance-summary-card">
      {/* Primary Status Banner */}
      <div
        className={`p-6 rounded-2xl border transition-all ${
          isSafe
            ? 'bg-emerald-50/70 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800'
            : status === 'unreachable'
            ? 'bg-rose-50/70 dark:bg-rose-950/20 border-rose-200 dark:border-rose-800'
            : 'bg-amber-50/70 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800'
        }`}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div
              className={`p-3 rounded-2xl flex-shrink-0 ${
                isSafe
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : status === 'unreachable'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'bg-amber-600 text-white shadow-sm'
              }`}
            >
              {isSafe ? (
                <CheckCircle2 className="w-7 h-7" />
              ) : status === 'unreachable' ? (
                <XCircle className="w-7 h-7" />
              ) : (
                <AlertTriangle className="w-7 h-7" />
              )}
            </div>

            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                  Attendance Status
                </span>
                <span
                  className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                    isSafe
                      ? 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300'
                      : status === 'unreachable'
                      ? 'bg-rose-100 dark:bg-rose-900/60 text-rose-800 dark:text-rose-300'
                      : 'bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300'
                  }`}
                >
                  {isSafe ? 'Criteria Met' : status === 'unreachable' ? 'Unattainable' : 'Shortage Alert'}
                </span>
              </div>

              <h2 className="text-xl sm:text-2xl font-black text-neutral-900 dark:text-white">
                {message}
              </h2>
            </div>
          </div>

          <div className="flex flex-col items-start md:items-end flex-shrink-0">
            <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
              Current Percentage
            </span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span
                className={`font-mono text-4xl font-black ${
                  isSafe
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-rose-600 dark:text-rose-400'
                }`}
              >
                {percentageDisplay}%
              </span>
              <span className="text-xs font-medium text-neutral-400">
                (target: {requiredPercentage}%)
              </span>
            </div>
          </div>
        </div>

        {/* Visual Dual Progress Bar */}
        <div className="mt-6 pt-5 border-t border-neutral-200/60 dark:border-neutral-800/60">
          <div className="flex items-center justify-between text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-2">
            <span>0%</span>
            <span className="font-semibold text-neutral-700 dark:text-neutral-300 flex items-center gap-1">
              <span>Required: <strong>{requiredPercentage}%</strong></span>
            </span>
            <span>100%</span>
          </div>

          <div className="relative w-full h-4 rounded-full bg-neutral-200 dark:bg-neutral-800 overflow-hidden shadow-inner">
            {/* Target marker line */}
            <div
              className="absolute top-0 bottom-0 w-1 bg-neutral-900 dark:bg-white z-10 opacity-70"
              style={{ left: `${Math.min(100, Math.max(0, requiredPercentage))}%` }}
              title={`Required Threshold: ${requiredPercentage}%`}
            />

            {/* Current Fill bar */}
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                isSafe
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500'
                  : 'bg-gradient-to-r from-rose-500 to-amber-500'
              }`}
              style={{ width: `${Math.min(100, Math.max(0, currentPercentage))}%` }}
            />
          </div>
        </div>
      </div>

      {/* Metrics 4-Card Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 shadow-sm">
          <div className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider mb-1">
            Total Classes
          </div>
          <div className="font-mono text-2xl font-bold text-neutral-900 dark:text-neutral-100">
            {total}
          </div>
          <div className="text-xs text-neutral-400 mt-1">Conducted so far</div>
        </div>

        <div className="p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 shadow-sm">
          <div className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-1">
            Attended
          </div>
          <div className="font-mono text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            {attended}
          </div>
          <div className="text-xs text-neutral-400 mt-1">Present in session</div>
        </div>

        <div className="p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 shadow-sm">
          <div className="text-[11px] font-semibold text-rose-600 dark:text-rose-400 uppercase tracking-wider mb-1">
            Missed / Bunked
          </div>
          <div className="font-mono text-2xl font-bold text-rose-600 dark:text-rose-400">
            {missed}
          </div>
          <div className="text-xs text-neutral-400 mt-1">Absent sessions</div>
        </div>

        <div className="p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 shadow-sm">
          <div className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-1">
            {status === 'above' ? 'Safety Buffer' : 'Deficit'}
          </div>
          <div className="font-mono text-2xl font-bold text-neutral-900 dark:text-neutral-100">
            {status === 'above' ? `+${classesCanMiss}` : classesToAttend > 0 ? `-${classesToAttend}` : '0'}
          </div>
          <div className="text-xs text-neutral-400 mt-1">
            {status === 'above' ? 'Classes can miss' : 'Classes to recover'}
          </div>
        </div>
      </div>

      {/* Projection details calculation note */}
      {result.projectedAttendanceIfAttended && (
        <div className="p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/60 dark:bg-neutral-900/40 text-xs text-neutral-600 dark:text-neutral-400 space-y-1.5">
          <div className="font-semibold text-neutral-800 dark:text-neutral-200 flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-emerald-600" />
            <span>Mathematical Projection Details</span>
          </div>
          <p className="leading-relaxed">
            By attending the next <strong>{result.projectedAttendanceIfAttended.futureAttended}</strong> classes consecutively, your attended count will become <strong>{result.projectedAttendanceIfAttended.newAttended}</strong> out of <strong>{result.projectedAttendanceIfAttended.newTotal}</strong> total classes, which yields an attendance of <strong>{formatNumber(result.projectedAttendanceIfAttended.newPercentage, 1)}%</strong> (meeting your {requiredPercentage}% requirement).
          </p>
        </div>
      )}

      {result.projectedAttendanceIfMissed && classesCanMiss > 0 && (
        <div className="p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/60 dark:bg-neutral-900/40 text-xs text-neutral-600 dark:text-neutral-400 space-y-1.5">
          <div className="font-semibold text-neutral-800 dark:text-neutral-200 flex items-center gap-1.5">
            <Info className="w-4 h-4 text-blue-600" />
            <span>Attendance Buffer Projection</span>
          </div>
          <p className="leading-relaxed">
            If you miss the next <strong>{classesCanMiss}</strong> {classesCanMiss === 1 ? 'class' : 'classes'}, your total classes will rise to <strong>{result.projectedAttendanceIfMissed.newTotal}</strong> while attendance stays at <strong>{attended}</strong>, resulting in <strong>{formatNumber(result.projectedAttendanceIfMissed.newPercentage, 1)}%</strong>. If you miss {classesCanMiss + 1} classes, your attendance will drop below {requiredPercentage}%.
          </p>
        </div>
      )}
    </div>
  );
};
