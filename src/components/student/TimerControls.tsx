import React from 'react';
import { Play, Pause, RotateCcw, SkipForward, Volume2, VolumeX, Bell, BellOff, Settings } from 'lucide-react';
import { TimerMode } from '../../lib/student/timer';

interface TimerControlsProps {
  isRunning: boolean;
  mode: TimerMode;
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
  onSkip: () => void;
  onSwitchMode: (mode: TimerMode) => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  hasNotificationPermission: boolean;
  onRequestNotifications: () => void;
  onOpenSettings: () => void;
}

export const TimerControls: React.FC<TimerControlsProps> = ({
  isRunning,
  mode,
  onStart,
  onPause,
  onReset,
  onSkip,
  onSwitchMode,
  soundEnabled,
  onToggleSound,
  hasNotificationPermission,
  onRequestNotifications,
  onOpenSettings,
}) => {
  return (
    <div className="space-y-6 w-full max-w-lg mx-auto">
      {/* Mode Switcher Tabs */}
      <div className="flex items-center justify-center p-1.5 rounded-2xl bg-neutral-100 dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-700/60 shadow-inner">
        <button
          type="button"
          onClick={() => onSwitchMode('pomodoro')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all ${
            mode === 'pomodoro'
              ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 shadow-sm'
              : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100'
          }`}
        >
          Pomodoro
        </button>
        <button
          type="button"
          onClick={() => onSwitchMode('shortBreak')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all ${
            mode === 'shortBreak'
              ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 shadow-sm'
              : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100'
          }`}
        >
          Short Break
        </button>
        <button
          type="button"
          onClick={() => onSwitchMode('longBreak')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all ${
            mode === 'longBreak'
              ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 shadow-sm'
              : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100'
          }`}
        >
          Long Break
        </button>
        <button
          type="button"
          onClick={() => onSwitchMode('custom')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all ${
            mode === 'custom'
              ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 shadow-sm'
              : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100'
          }`}
        >
          Custom
        </button>
      </div>

      {/* Main Playback Action Buttons */}
      <div className="flex items-center justify-center gap-3">
        {/* Reset Button */}
        <button
          type="button"
          id="timer-reset-btn"
          onClick={onReset}
          className="p-3.5 rounded-2xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-850 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 shadow-sm transition-all"
          title="Reset timer"
        >
          <RotateCcw className="w-5 h-5" />
        </button>

        {/* Big Start / Pause Primary Button */}
        <button
          type="button"
          id="timer-main-toggle-btn"
          onClick={isRunning ? onPause : onStart}
          className={`flex items-center justify-center gap-2.5 px-8 py-4 rounded-2xl text-base font-bold text-white shadow-md transition-all transform active:scale-95 ${
            isRunning
              ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-500/20'
              : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20'
          }`}
        >
          {isRunning ? (
            <>
              <Pause className="w-6 h-6 fill-current" />
              <span>Pause Focus</span>
            </>
          ) : (
            <>
              <Play className="w-6 h-6 fill-current ml-0.5" />
              <span>Start Focus</span>
            </>
          )}
        </button>

        {/* Skip to Next Session */}
        <button
          type="button"
          id="timer-skip-btn"
          onClick={onSkip}
          className="p-3.5 rounded-2xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-850 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 shadow-sm transition-all"
          title="Skip to next session"
        >
          <SkipForward className="w-5 h-5" />
        </button>
      </div>

      {/* Auxiliary settings & audio toggles */}
      <div className="flex items-center justify-center gap-2 text-xs">
        <button
          type="button"
          onClick={onToggleSound}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition-all ${
            soundEnabled
              ? 'border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400'
              : 'border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-850 text-neutral-400'
          }`}
          title={soundEnabled ? 'Chime sound is ON' : 'Chime sound is MUTED'}
        >
          {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
          <span>{soundEnabled ? 'Chime On' : 'Muted'}</span>
        </button>

        <button
          type="button"
          onClick={onRequestNotifications}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition-all ${
            hasNotificationPermission
              ? 'border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-400'
              : 'border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-850 text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
          }`}
          title={hasNotificationPermission ? 'Notifications enabled' : 'Click to enable desktop alerts'}
        >
          {hasNotificationPermission ? <Bell className="w-3.5 h-3.5" /> : <BellOff className="w-3.5 h-3.5" />}
          <span>{hasNotificationPermission ? 'Alerts Active' : 'Enable Alerts'}</span>
        </button>

        <button
          type="button"
          onClick={onOpenSettings}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-850 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          title="Configure durations"
        >
          <Settings className="w-3.5 h-3.5" />
          <span>Durations</span>
        </button>
      </div>
    </div>
  );
};
