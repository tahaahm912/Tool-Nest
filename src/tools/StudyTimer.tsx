import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  TimerMode,
  TimerSettings,
  DEFAULT_TIMER_SETTINGS,
  loadTimerSettings,
  saveTimerSettings,
  playNotificationChime,
  getNotificationPermission,
  requestNotificationPermission,
  showTimerNotification,
} from '../lib/student/timer';
import { StudyTimerDisplay } from '../components/student/StudyTimerDisplay';
import { TimerControls } from '../components/student/TimerControls';
import {
  Sparkles,
  CheckCircle2,
  Settings2,
  X,
  RotateCcw,
  Volume2,
  Flame,
  Award,
  BookOpen
} from 'lucide-react';

export const StudyTimer: React.FC = () => {
  const [settings, setSettings] = useState<TimerSettings>(() => loadTimerSettings());
  const [mode, setMode] = useState<TimerMode>('pomodoro');
  const [customMinutes, setCustomMinutes] = useState<number>(45);

  const getDurationForMode = useCallback(
    (m: TimerMode, s: TimerSettings, customM: number): number => {
      switch (m) {
        case 'pomodoro':
          return s.studyDurationMinutes * 60;
        case 'shortBreak':
          return s.shortBreakMinutes * 60;
        case 'longBreak':
          return s.longBreakMinutes * 60;
        case 'custom':
          return customM * 60;
      }
    },
    []
  );

  const [totalSeconds, setTotalSeconds] = useState<number>(() =>
    getDurationForMode('pomodoro', settings, customMinutes)
  );
  const [remainingSeconds, setRemainingSeconds] = useState<number>(() => totalSeconds);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [currentSession, setCurrentSession] = useState<number>(1);
  const [completedSessionsCount, setCompletedSessionsCount] = useState<number>(() => {
    try {
      return parseInt(localStorage.getItem('toolnest_study_completed_count') || '0', 10);
    } catch {
      return 0;
    }
  });

  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [hasNotificationPermission, setHasNotificationPermission] = useState<boolean>(() => {
    return getNotificationPermission() === 'granted';
  });

  // Target end timestamp ref to guarantee accuracy across inactive tabs
  const endTimeRef = useRef<number | null>(null);
  const timerContainerRef = useRef<HTMLDivElement>(null);

  // Sync settings when modified
  const handleUpdateSettings = (newSettings: Partial<TimerSettings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    saveTimerSettings(updated);

    if (!isRunning) {
      const newTotal = getDurationForMode(mode, updated, customMinutes);
      setTotalSeconds(newTotal);
      setRemainingSeconds(newTotal);
    }
  };

  // Switch timer mode
  const handleSwitchMode = (newMode: TimerMode) => {
    setIsRunning(false);
    endTimeRef.current = null;
    setMode(newMode);
    const newTotal = getDurationForMode(newMode, settings, customMinutes);
    setTotalSeconds(newTotal);
    setRemainingSeconds(newTotal);
  };

  // Start timer
  const handleStart = () => {
    if (remainingSeconds <= 0) {
      const resetTotal = getDurationForMode(mode, settings, customMinutes);
      setRemainingSeconds(resetTotal);
      endTimeRef.current = Date.now() + resetTotal * 1000;
    } else {
      endTimeRef.current = Date.now() + remainingSeconds * 1000;
    }
    setIsRunning(true);
  };

  // Pause timer
  const handlePause = () => {
    setIsRunning(false);
    endTimeRef.current = null;
  };

  // Reset timer
  const handleReset = () => {
    setIsRunning(false);
    endTimeRef.current = null;
    const dur = getDurationForMode(mode, settings, customMinutes);
    setRemainingSeconds(dur);
  };

  // Session completion handler
  const handleSessionComplete = useCallback(() => {
    setIsRunning(false);
    endTimeRef.current = null;

    // Play chime sound
    if (settings.soundEnabled) {
      playNotificationChime();
    }

    // Determine transition
    if (mode === 'pomodoro' || mode === 'custom') {
      const nextSession = currentSession + 1;
      const newCompleted = completedSessionsCount + 1;
      setCompletedSessionsCount(newCompleted);
      try {
        localStorage.setItem('toolnest_study_completed_count', newCompleted.toString());
      } catch {}

      showTimerNotification(
        'Focus Session Completed!',
        `Great job! You finished session #${currentSession}. Time to step away and relax.`
      );

      const isLongBreakDue = currentSession % settings.sessionsBeforeLongBreak === 0;
      const nextMode: TimerMode = isLongBreakDue ? 'longBreak' : 'shortBreak';
      setMode(nextMode);
      setCurrentSession(nextSession > settings.sessionsBeforeLongBreak ? 1 : nextSession);

      const nextDur = getDurationForMode(nextMode, settings, customMinutes);
      setTotalSeconds(nextDur);
      setRemainingSeconds(nextDur);

      if (settings.autoStartNext) {
        endTimeRef.current = Date.now() + nextDur * 1000;
        setIsRunning(true);
      }
    } else {
      // Break completed -> Back to study
      showTimerNotification('Break Over!', 'Ready to resume your study sprint? Let’s stay focused.');
      setMode('pomodoro');
      const focusDur = getDurationForMode('pomodoro', settings, customMinutes);
      setTotalSeconds(focusDur);
      setRemainingSeconds(focusDur);

      if (settings.autoStartNext) {
        endTimeRef.current = Date.now() + focusDur * 1000;
        setIsRunning(true);
      }
    }
  }, [mode, currentSession, completedSessionsCount, settings, customMinutes, getDurationForMode]);

  // Skip to next session
  const handleSkip = () => {
    handleSessionComplete();
  };

  // Accurate timestamp countdown engine
  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      if (!endTimeRef.current) return;
      const msLeft = endTimeRef.current - Date.now();
      const secondsLeft = Math.ceil(msLeft / 1000);

      if (secondsLeft <= 0) {
        setRemainingSeconds(0);
        handleSessionComplete();
      } else {
        setRemainingSeconds(secondsLeft);
      }
    }, 200);

    return () => clearInterval(interval);
  }, [isRunning, handleSessionComplete]);

  // Document Title update for easy background tab monitoring
  useEffect(() => {
    const mins = Math.floor(remainingSeconds / 60);
    const secs = remainingSeconds % 60;
    const timeStr = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    const modeLabel = mode === 'pomodoro' ? 'Focus' : mode === 'shortBreak' ? 'Short Break' : 'Rest';

    if (isRunning) {
      document.title = `(${timeStr}) ${modeLabel} - Study Timer`;
    } else {
      document.title = 'Study Timer - ToolNest';
    }

    return () => {
      document.title = 'ToolNest';
    };
  }, [remainingSeconds, isRunning, mode]);

  // Fullscreen toggle
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      if (timerContainerRef.current?.requestFullscreen) {
        timerContainerRef.current.requestFullscreen();
        setIsFullscreen(true);
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  const handleRequestNotifications = async () => {
    const granted = await requestNotificationPermission();
    setHasNotificationPermission(granted);
    if (granted) {
      showTimerNotification('Notifications Enabled', 'You will be alerted when study intervals complete.');
    }
  };

  return (
    <div
      ref={timerContainerRef}
      className={`relative w-full ${
        isFullscreen
          ? 'min-h-screen flex flex-col items-center justify-center bg-neutral-950 text-white p-6'
          : 'space-y-8'
      }`}
    >
      {/* Top Banner & Mode Summary */}
      {!isFullscreen && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-neutral-900 dark:text-white">
                Pomodoro Focus Engine
              </h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Spaced study intervals scientifically proven to maximize memory retention and prevent fatigue.
              </p>
            </div>
          </div>

          {/* Lifetime completed sessions counter */}
          <div className="flex items-center gap-2 self-start sm:self-center px-3 py-1.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-xs font-semibold text-neutral-700 dark:text-neutral-300">
            <Award className="w-4 h-4 text-amber-500" />
            <span>{completedSessionsCount} Sessions Finished</span>
          </div>
        </div>
      )}

      {/* Main Timer Display Circle */}
      <div className="rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6 sm:p-10 shadow-sm flex flex-col items-center justify-center">
        <StudyTimerDisplay
          remainingSeconds={remainingSeconds}
          totalSeconds={totalSeconds}
          mode={mode}
          currentSession={currentSession}
          totalSessions={settings.sessionsBeforeLongBreak}
          isRunning={isRunning}
          isFullscreen={isFullscreen}
          onToggleFullscreen={toggleFullscreen}
        />

        {/* Timer Control Buttons */}
        <div className="w-full mt-6">
          <TimerControls
            isRunning={isRunning}
            mode={mode}
            onStart={handleStart}
            onPause={handlePause}
            onReset={handleReset}
            onSkip={handleSkip}
            onSwitchMode={handleSwitchMode}
            soundEnabled={settings.soundEnabled}
            onToggleSound={() => handleUpdateSettings({ soundEnabled: !settings.soundEnabled })}
            hasNotificationPermission={hasNotificationPermission}
            onRequestNotifications={handleRequestNotifications}
            onOpenSettings={() => setIsSettingsOpen(true)}
          />
        </div>
      </div>

      {/* Quick Interval Preset Buttons */}
      {!isFullscreen && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <button
            type="button"
            onClick={() => {
              handleSwitchMode('pomodoro');
              handleStart();
            }}
            className="p-3.5 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:border-emerald-300 dark:hover:border-emerald-700 text-left transition-all group shadow-sm"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200 group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
                Standard Sprint
              </span>
              <Flame className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="text-[11px] text-neutral-500">25m focus + 5m rest</div>
          </button>

          <button
            type="button"
            onClick={() => {
              setCustomMinutes(50);
              handleSwitchMode('custom');
              handleStart();
            }}
            className="p-3.5 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:border-purple-300 dark:hover:border-purple-700 text-left transition-all group shadow-sm"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200 group-hover:text-purple-600 dark:group-hover:text-purple-400">
                Deep Work Block
              </span>
              <Sparkles className="w-4 h-4 text-purple-500" />
            </div>
            <div className="text-[11px] text-neutral-500">50m uninterrupted session</div>
          </button>

          <button
            type="button"
            onClick={() => {
              handleSwitchMode('shortBreak');
              handleStart();
            }}
            className="p-3.5 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:border-blue-300 dark:hover:border-blue-700 text-left transition-all group shadow-sm"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                Coffee Break
              </span>
              <span className="text-xs">☕</span>
            </div>
            <div className="text-[11px] text-neutral-500">5m rapid recharge</div>
          </button>

          <button
            type="button"
            onClick={() => playNotificationChime()}
            className="p-3.5 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:bg-neutral-50 dark:hover:bg-neutral-850 text-left transition-all shadow-sm"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200">
                Test Audio Chime
              </span>
              <Volume2 className="w-4 h-4 text-neutral-400" />
            </div>
            <div className="text-[11px] text-neutral-500">Sample pleasant bell sound</div>
          </button>
        </div>
      )}

      {/* Settings Modal Dialog */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/60 backdrop-blur-sm">
          <div className="relative w-full max-w-md rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 pb-3">
              <div className="flex items-center gap-2">
                <Settings2 className="w-5 h-5 text-emerald-600" />
                <h3 className="text-base font-bold text-neutral-900 dark:text-white">
                  Study Timer Settings
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsSettingsOpen(false)}
                className="p-1 rounded-lg text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* Study duration */}
              <div>
                <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Focus Session Duration (minutes)
                </label>
                <input
                  type="number"
                  min="1"
                  max="180"
                  value={settings.studyDurationMinutes}
                  onChange={(e) =>
                    handleUpdateSettings({ studyDurationMinutes: Math.max(1, parseInt(e.target.value) || 25) })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-950 font-mono text-sm text-neutral-900 dark:text-neutral-100"
                />
              </div>

              {/* Short break duration */}
              <div>
                <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Short Break Duration (minutes)
                </label>
                <input
                  type="number"
                  min="1"
                  max="60"
                  value={settings.shortBreakMinutes}
                  onChange={(e) =>
                    handleUpdateSettings({ shortBreakMinutes: Math.max(1, parseInt(e.target.value) || 5) })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-950 font-mono text-sm text-neutral-900 dark:text-neutral-100"
                />
              </div>

              {/* Long break duration */}
              <div>
                <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Long Break Duration (minutes)
                </label>
                <input
                  type="number"
                  min="1"
                  max="90"
                  value={settings.longBreakMinutes}
                  onChange={(e) =>
                    handleUpdateSettings({ longBreakMinutes: Math.max(1, parseInt(e.target.value) || 15) })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-950 font-mono text-sm text-neutral-900 dark:text-neutral-100"
                />
              </div>

              {/* Sessions before long break */}
              <div>
                <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Focus Sessions Before Long Rest
                </label>
                <input
                  type="number"
                  min="1"
                  max="12"
                  value={settings.sessionsBeforeLongBreak}
                  onChange={(e) =>
                    handleUpdateSettings({ sessionsBeforeLongBreak: Math.max(1, parseInt(e.target.value) || 4) })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-950 font-mono text-sm text-neutral-900 dark:text-neutral-100"
                />
              </div>

              {/* Custom mode duration */}
              <div>
                <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Custom Mode Duration (minutes)
                </label>
                <input
                  type="number"
                  min="1"
                  max="300"
                  value={customMinutes}
                  onChange={(e) => setCustomMinutes(Math.max(1, parseInt(e.target.value) || 45))}
                  className="w-full px-3 py-2 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-950 font-mono text-sm text-neutral-900 dark:text-neutral-100"
                />
              </div>

              {/* Auto start toggle */}
              <div className="flex items-center justify-between pt-2 border-t border-neutral-200 dark:border-neutral-800">
                <span className="font-semibold text-neutral-700 dark:text-neutral-300">
                  Auto-start Next Interval
                </span>
                <input
                  type="checkbox"
                  checked={settings.autoStartNext}
                  onChange={(e) => handleUpdateSettings({ autoStartNext: e.target.checked })}
                  className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-neutral-200 dark:border-neutral-800">
              <button
                type="button"
                onClick={() => {
                  setSettings(DEFAULT_TIMER_SETTINGS);
                  saveTimerSettings(DEFAULT_TIMER_SETTINGS);
                }}
                className="text-xs text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
              >
                Reset to Defaults
              </button>
              <button
                type="button"
                onClick={() => setIsSettingsOpen(false)}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
