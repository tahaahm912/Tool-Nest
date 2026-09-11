import React from 'react';
import { TimerMode, formatTimerTime } from '../../lib/student/timer';
import { Flame, Coffee, BedDouble, Sliders, Maximize2, Minimize2 } from 'lucide-react';

interface StudyTimerDisplayProps {
  remainingSeconds: number;
  totalSeconds: number;
  mode: TimerMode;
  currentSession: number;
  totalSessions: number;
  isRunning: boolean;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
}

export const StudyTimerDisplay: React.FC<StudyTimerDisplayProps> = ({
  remainingSeconds,
  totalSeconds,
  mode,
  currentSession,
  totalSessions,
  isRunning,
  isFullscreen,
  onToggleFullscreen,
}) => {
  const fractionRemaining = totalSeconds > 0 ? remainingSeconds / totalSeconds : 0;
  const progressPercent = Math.max(0, Math.min(100, (1 - fractionRemaining) * 100));

  // Circular SVG dimensions
  const size = isFullscreen ? 360 : 280;
  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (fractionRemaining * circumference);

  const getModeDetails = () => {
    switch (mode) {
      case 'pomodoro':
        return {
          title: 'Deep Focus',
          icon: <Flame className="w-4 h-4 text-emerald-500" />,
          colorClass: 'text-emerald-600 dark:text-emerald-400',
          strokeClass: 'stroke-emerald-500',
          bgPill: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-700 dark:text-emerald-300',
        };
      case 'shortBreak':
        return {
          title: 'Short Break',
          icon: <Coffee className="w-4 h-4 text-blue-500" />,
          colorClass: 'text-blue-600 dark:text-blue-400',
          strokeClass: 'stroke-blue-500',
          bgPill: 'bg-blue-500/10 border-blue-500/20 text-blue-700 dark:text-blue-300',
        };
      case 'longBreak':
        return {
          title: 'Long Rest Break',
          icon: <BedDouble className="w-4 h-4 text-indigo-500" />,
          colorClass: 'text-indigo-600 dark:text-indigo-400',
          strokeClass: 'stroke-indigo-500',
          bgPill: 'bg-indigo-500/10 border-indigo-500/20 text-indigo-700 dark:text-indigo-300',
        };
      case 'custom':
        return {
          title: 'Custom Focus Interval',
          icon: <Sliders className="w-4 h-4 text-purple-500" />,
          colorClass: 'text-purple-600 dark:text-purple-400',
          strokeClass: 'stroke-purple-500',
          bgPill: 'bg-purple-500/10 border-purple-500/20 text-purple-700 dark:text-purple-300',
        };
    }
  };

  const details = getModeDetails();

  return (
    <div className="relative flex flex-col items-center justify-center p-4">
      {/* Fullscreen toggle button in top-right */}
      <button
        type="button"
        onClick={onToggleFullscreen}
        className="absolute top-2 right-2 p-2 rounded-xl text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors z-20"
        title={isFullscreen ? 'Exit Fullscreen' : 'Enter Focus Fullscreen'}
      >
        {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
      </button>

      {/* SVG Progress Ring */}
      <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        <svg className="w-full h-full transform -rotate-90" viewBox={`0 0 ${size} ${size}`}>
          {/* Background track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            className="stroke-neutral-200 dark:stroke-neutral-800"
            strokeWidth={strokeWidth}
            fill="transparent"
          />

          {/* Animated remaining path */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            className={`${details.strokeClass} transition-all duration-300 ease-linear`}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
          />
        </svg>

        {/* Center Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center select-none px-4">
          {/* Mode Pill */}
          <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border mb-2 ${details.bgPill}`}>
            {details.icon}
            <span>{details.title}</span>
          </div>

          {/* Huge Timer Digits */}
          <div
            className={`font-mono font-black tracking-tight text-neutral-900 dark:text-neutral-50 ${
              isFullscreen ? 'text-7xl sm:text-8xl' : 'text-5xl sm:text-6xl'
            }`}
          >
            {formatTimerTime(remainingSeconds)}
          </div>

          {/* Session Indicator */}
          <div className="flex items-center gap-1.5 mt-3">
            <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
              Session {currentSession} of {totalSessions}
            </span>
          </div>

          {/* Cycle dots */}
          <div className="flex items-center gap-1.5 mt-1.5">
            {Array.from({ length: totalSessions }).map((_, i) => (
              <span
                key={i}
                className={`w-2 h-2 rounded-full transition-all ${
                  i < currentSession - 1
                    ? 'bg-emerald-500'
                    : i === currentSession - 1
                    ? 'bg-emerald-500 ring-2 ring-emerald-500/40 animate-pulse'
                    : 'bg-neutral-300 dark:bg-neutral-700'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
