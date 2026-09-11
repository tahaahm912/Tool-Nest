import React, { useState, useEffect, useRef } from 'react';
import {
  Timer,
  Play,
  Pause,
  RotateCcw,
  Flag,
  Bell,
  BellRing,
  Volume2,
  VolumeX,
  Clock,
  Sparkles,
  Zap,
  Trash2,
  Check,
} from 'lucide-react';
import {
  formatMilliseconds,
  playCompletionChime,
  sendTimerNotification,
} from '../lib/utilities/timerEngine';
import { ModeSelector, ModeOption } from '../components/daily/ModeSelector';
import { CopyButton } from '../components/daily/CopyButton';

type ActiveTab = 'stopwatch' | 'timer';

interface LapRecord {
  lapIndex: number;
  lapTimeMs: number;
  totalTimeMs: number;
}

const TIMER_PRESETS = [
  { label: '1 min', seconds: 60 },
  { label: '5 min', seconds: 300 },
  { label: '10 min', seconds: 600 },
  { label: '15 min', seconds: 900 },
  { label: '25 min (Pomodoro)', seconds: 1500 },
  { label: '30 min', seconds: 1800 },
  { label: '60 min (1 hr)', seconds: 3600 },
];

export const StopwatchTimer: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('stopwatch');

  // -------------------------------------------------------------
  // STOPWATCH STATE
  // -------------------------------------------------------------
  const [swRunning, setSwRunning] = useState(false);
  const [swElapsedMs, setSwElapsedMs] = useState(0);
  const [laps, setLaps] = useState<LapRecord[]>([]);

  // Refs for monotonic timestamp calculation
  const swStartTimeRef = useRef<number>(0);
  const swAccumulatedRef = useRef<number>(0);
  const swIntervalRef = useRef<number | null>(null);
  const lastLapTotalRef = useRef<number>(0);

  // -------------------------------------------------------------
  // COUNTDOWN TIMER STATE
  // -------------------------------------------------------------
  const [timerInputHours, setTimerInputHours] = useState(0);
  const [timerInputMinutes, setTimerInputMinutes] = useState(5);
  const [timerInputSeconds, setTimerInputSeconds] = useState(0);

  const [timerRunning, setTimerRunning] = useState(false);
  const [timerTotalDurationMs, setTimerTotalDurationMs] = useState(300000); // 5 mins
  const [timerRemainingMs, setTimerRemainingMs] = useState(300000);
  const [timerCompleted, setTimerCompleted] = useState(false);

  // Sound & Notification Preferences
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');

  const timerTargetEndRef = useRef<number>(0);
  const timerIntervalRef = useRef<number | null>(null);

  // Check notification permission on mount
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setNotificationPermission(Notification.permission);
    }
  }, []);

  // Request notification permission on explicit click
  const handleRequestNotification = async () => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      const perm = await Notification.requestPermission();
      setNotificationPermission(perm);
    }
  };

  // -------------------------------------------------------------
  // STOPWATCH CONTROLS & INTERVAL
  // -------------------------------------------------------------
  const startStopwatch = () => {
    if (swRunning) return;
    swStartTimeRef.current = Date.now();
    setSwRunning(true);

    if (swIntervalRef.current) clearInterval(swIntervalRef.current);
    swIntervalRef.current = window.setInterval(() => {
      const current = Date.now();
      const elapsed = swAccumulatedRef.current + (current - swStartTimeRef.current);
      setSwElapsedMs(elapsed);
    }, 30);
  };

  const pauseStopwatch = () => {
    if (!swRunning) return;
    if (swIntervalRef.current) {
      clearInterval(swIntervalRef.current);
      swIntervalRef.current = null;
    }
    const current = Date.now();
    swAccumulatedRef.current += current - swStartTimeRef.current;
    setSwElapsedMs(swAccumulatedRef.current);
    setSwRunning(false);
  };

  const resetStopwatch = () => {
    if (swIntervalRef.current) {
      clearInterval(swIntervalRef.current);
      swIntervalRef.current = null;
    }
    swAccumulatedRef.current = 0;
    swStartTimeRef.current = 0;
    lastLapTotalRef.current = 0;
    setSwRunning(false);
    setSwElapsedMs(0);
    setLaps([]);
  };

  const recordLap = () => {
    if (!swRunning && swElapsedMs === 0) return;
    const currentTotal = swElapsedMs;
    const lapSplit = currentTotal - lastLapTotalRef.current;
    lastLapTotalRef.current = currentTotal;

    setLaps((prev) => [
      {
        lapIndex: prev.length + 1,
        lapTimeMs: lapSplit,
        totalTimeMs: currentTotal,
      },
      ...prev,
    ]);
  };

  // Compute fastest and slowest laps
  const { fastestLapIdx, slowestLapIdx } = React.useMemo(() => {
    if (laps.length < 2) return { fastestLapIdx: null, slowestLapIdx: null };
    let minTime = Infinity;
    let maxTime = -Infinity;
    let minIdx = -1;
    let maxIdx = -1;

    laps.forEach((lap) => {
      if (lap.lapTimeMs < minTime) {
        minTime = lap.lapTimeMs;
        minIdx = lap.lapIndex;
      }
      if (lap.lapTimeMs > maxTime) {
        maxTime = lap.lapTimeMs;
        maxIdx = lap.lapIndex;
      }
    });

    return { fastestLapIdx: minIdx, slowestLapIdx: maxIdx };
  }, [laps]);

  // -------------------------------------------------------------
  // COUNTDOWN CONTROLS & INTERVAL
  // -------------------------------------------------------------
  const applyPreset = (seconds: number) => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    setTimerInputHours(h);
    setTimerInputMinutes(m);
    setTimerInputSeconds(s);

    const ms = seconds * 1000;
    setTimerTotalDurationMs(ms);
    setTimerRemainingMs(ms);
    setTimerRunning(false);
    setTimerCompleted(false);
  };

  const startTimer = () => {
    if (timerRunning) return;

    let initialMs = timerRemainingMs;
    if (timerCompleted || initialMs <= 0) {
      initialMs =
        (timerInputHours * 3600 + timerInputMinutes * 60 + timerInputSeconds) * 1000;
      if (initialMs <= 0) return;
      setTimerTotalDurationMs(initialMs);
      setTimerRemainingMs(initialMs);
    }

    setTimerCompleted(false);
    setTimerRunning(true);
    timerTargetEndRef.current = Date.now() + initialMs;

    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    timerIntervalRef.current = window.setInterval(() => {
      const now = Date.now();
      const remaining = Math.max(0, timerTargetEndRef.current - now);
      setTimerRemainingMs(remaining);

      if (remaining <= 0) {
        if (timerIntervalRef.current) {
          clearInterval(timerIntervalRef.current);
          timerIntervalRef.current = null;
        }
        setTimerRunning(false);
        setTimerCompleted(true);

        // Sound alert
        if (soundEnabled) {
          playCompletionChime();
        }

        // Notification alert
        sendTimerNotification(
          'ToolNest Timer Finished!',
          'Your countdown timer has completed.'
        );
      }
    }, 100);
  };

  const pauseTimer = () => {
    if (!timerRunning) return;
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    const now = Date.now();
    const remaining = Math.max(0, timerTargetEndRef.current - now);
    setTimerRemainingMs(remaining);
    setTimerRunning(false);
  };

  const resetTimer = () => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    const ms =
      (timerInputHours * 3600 + timerInputMinutes * 60 + timerInputSeconds) * 1000;
    setTimerRunning(false);
    setTimerCompleted(false);
    setTimerRemainingMs(ms > 0 ? ms : 300000);
    setTimerTotalDurationMs(ms > 0 ? ms : 300000);
  };

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (swIntervalRef.current) clearInterval(swIntervalRef.current);
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, []);

  const formattedSw = formatMilliseconds(swElapsedMs);
  const formattedTimer = formatMilliseconds(timerRemainingMs);

  const timerProgress =
    timerTotalDurationMs > 0
      ? Math.min(100, Math.max(0, ((timerTotalDurationMs - timerRemainingMs) / timerTotalDurationMs) * 100))
      : 0;

  // Laps copy string
  const lapsCopyString = laps
    .map((l) => {
      const split = formatMilliseconds(l.lapTimeMs);
      const total = formatMilliseconds(l.totalTimeMs);
      return `Lap ${l.lapIndex}: ${split.minutes}:${split.seconds}.${split.milliseconds} (Total: ${total.hours}:${total.minutes}:${total.seconds}.${total.milliseconds})`;
    })
    .join('\n');

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Mode Switcher */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-neutral-200 dark:border-neutral-800">
        <div>
          <span className="text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider block mb-1">
            Timer Utility Mode
          </span>
          <ModeSelector
            options={[
              { id: 'stopwatch', label: 'Precision Stopwatch', icon: Clock },
              { id: 'timer', label: 'Countdown Timer', icon: Timer },
            ]}
            activeId={activeTab}
            onChange={(tab) => setActiveTab(tab)}
          />
        </div>

        {/* Global Sound & Notification Toggles */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-2 rounded-xl border text-xs font-medium transition-colors ${
              soundEnabled
                ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 text-emerald-800 dark:text-emerald-300'
                : 'bg-neutral-100 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 text-neutral-500'
            }`}
            title={soundEnabled ? 'Chime sound enabled' : 'Chime sound muted'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {notificationPermission !== 'granted' && (
            <button
              type="button"
              onClick={handleRequestNotification}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 shadow-2xs"
            >
              <Bell className="w-3.5 h-3.5" />
              <span>Enable Alerts</span>
            </button>
          )}
        </div>
      </div>

      {/* ========================================================= */}
      {/* STOPWATCH VIEW                                            */}
      {/* ========================================================= */}
      {activeTab === 'stopwatch' && (
        <div className="space-y-6">
          {/* Main Stopwatch Digital Clock */}
          <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-800 p-8 sm:p-12 shadow-sm text-center">
            <span className="text-xs font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest block mb-4">
              Elapsed Time
            </span>

            <div className="flex items-baseline justify-center font-mono tracking-tight text-neutral-900 dark:text-white font-black">
              <span className="text-6xl sm:text-8xl">{formattedSw.hours}</span>
              <span className="text-4xl sm:text-6xl opacity-30 mx-1">:</span>
              <span className="text-6xl sm:text-8xl">{formattedSw.minutes}</span>
              <span className="text-4xl sm:text-6xl opacity-30 mx-1">:</span>
              <span className="text-6xl sm:text-8xl">{formattedSw.seconds}</span>
              <span className="text-3xl sm:text-5xl text-emerald-600 dark:text-emerald-400 ml-2 font-bold">
                .{formattedSw.milliseconds}
              </span>
            </div>

            {/* Stopwatch Primary Controls */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              {!swRunning ? (
                <button
                  type="button"
                  onClick={startStopwatch}
                  className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl text-base font-bold bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white shadow-md transition-all duration-150 transform hover:-translate-y-0.5"
                >
                  <Play className="w-5 h-5 fill-current" />
                  <span>{swElapsedMs > 0 ? 'Resume' : 'Start'}</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={pauseStopwatch}
                  className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl text-base font-bold bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white shadow-md transition-all duration-150 transform hover:-translate-y-0.5"
                >
                  <Pause className="w-5 h-5 fill-current" />
                  <span>Pause</span>
                </button>
              )}

              <button
                type="button"
                onClick={recordLap}
                disabled={!swRunning}
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl text-base font-semibold bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 border border-neutral-200 dark:border-neutral-700 shadow-2xs transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Flag className="w-4 h-4" />
                <span>Lap</span>
              </button>

              <button
                type="button"
                onClick={resetStopwatch}
                disabled={swElapsedMs === 0 && !swRunning}
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl text-base font-semibold bg-white dark:bg-neutral-900 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200 border border-neutral-200 dark:border-neutral-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Reset</span>
              </button>
            </div>
          </div>

          {/* Lap History Table */}
          {laps.length > 0 && (
            <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800">
                <div className="flex items-center gap-2">
                  <Flag className="w-4 h-4 text-emerald-600" />
                  <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
                    Recorded Laps ({laps.length})
                  </h3>
                </div>

                <div className="flex items-center gap-2">
                  <CopyButton
                    textToCopy={lapsCopyString}
                    label="Copy Laps"
                    size="sm"
                    variant="ghost"
                  />
                  <button
                    type="button"
                    onClick={() => setLaps([])}
                    title="Clear Laps"
                    className="p-1.5 text-neutral-400 hover:text-rose-600 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="max-h-72 overflow-y-auto divide-y divide-neutral-100 dark:divide-neutral-800/80">
                {laps.map((lap) => {
                  const isFastest = lap.lapIndex === fastestLapIdx;
                  const isSlowest = lap.lapIndex === slowestLapIdx;
                  const split = formatMilliseconds(lap.lapTimeMs);
                  const total = formatMilliseconds(lap.totalTimeMs);

                  return (
                    <div
                      key={lap.lapIndex}
                      className="py-2.5 px-2 flex items-center justify-between text-sm hover:bg-neutral-50 dark:hover:bg-neutral-800/50 rounded-xl transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-mono font-bold text-neutral-500 w-12">
                          #{lap.lapIndex}
                        </span>
                        {isFastest && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                            Fastest
                          </span>
                        )}
                        {isSlowest && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300">
                            Slowest
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-6 font-mono">
                        <span
                          className={`font-semibold ${
                            isFastest
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : isSlowest
                              ? 'text-rose-600 dark:text-rose-400'
                              : 'text-neutral-900 dark:text-neutral-100'
                          }`}
                        >
                          +{split.minutes}:{split.seconds}.{split.milliseconds}
                        </span>
                        <span className="text-xs text-neutral-400">
                          {total.hours}:{total.minutes}:{total.seconds}.{total.milliseconds}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* COUNTDOWN TIMER VIEW                                      */}
      {/* ========================================================= */}
      {activeTab === 'timer' && (
        <div className="space-y-6">
          {/* Presets */}
          <div>
            <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-2 block">
              Quick Timer Presets
            </span>
            <div className="flex flex-wrap gap-2">
              {TIMER_PRESETS.map((p) => (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => applyPreset(p.seconds)}
                  className="px-3.5 py-1.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-xs font-medium text-neutral-700 dark:text-neutral-300 hover:border-emerald-500 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors shadow-2xs"
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Main Countdown Visual Card */}
          <div
            className={`rounded-3xl border p-8 sm:p-12 shadow-sm text-center transition-all duration-300 ${
              timerCompleted
                ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-700 ring-4 ring-emerald-500/20'
                : 'bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800'
            }`}
          >
            {timerCompleted ? (
              <div className="space-y-2 mb-4">
                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-emerald-600 text-white animate-bounce">
                  <Check className="w-3.5 h-3.5" />
                  <span>Time is Up!</span>
                </span>
                <p className="text-sm text-emerald-800 dark:text-emerald-200">
                  Your countdown session has finished.
                </p>
              </div>
            ) : (
              <span className="text-xs font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest block mb-4">
                Remaining Time
              </span>
            )}

            {/* Big Countdown Digits */}
            <div className="flex items-baseline justify-center font-mono tracking-tight font-black text-neutral-900 dark:text-white">
              <span className="text-6xl sm:text-8xl">{formattedTimer.hours}</span>
              <span className="text-4xl sm:text-6xl opacity-30 mx-1">:</span>
              <span className="text-6xl sm:text-8xl">{formattedTimer.minutes}</span>
              <span className="text-4xl sm:text-6xl opacity-30 mx-1">:</span>
              <span className="text-6xl sm:text-8xl">{formattedTimer.seconds}</span>
            </div>

            {/* Progress Bar */}
            <div className="mt-6 max-w-md mx-auto">
              <div className="h-2.5 w-full rounded-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
                <div
                  className="h-full bg-emerald-600 rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${timerProgress}%` }}
                />
              </div>
              <div className="mt-1.5 flex justify-between text-[11px] font-mono text-neutral-400">
                <span>0%</span>
                <span>{Math.round(timerProgress)}% elapsed</span>
                <span>100%</span>
              </div>
            </div>

            {/* Controls */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              {!timerRunning ? (
                <button
                  type="button"
                  onClick={startTimer}
                  className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl text-base font-bold bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white shadow-md transition-all duration-150 transform hover:-translate-y-0.5"
                >
                  <Play className="w-5 h-5 fill-current" />
                  <span>
                    {timerRemainingMs < timerTotalDurationMs && !timerCompleted
                      ? 'Resume'
                      : 'Start Timer'}
                  </span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={pauseTimer}
                  className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl text-base font-bold bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white shadow-md transition-all duration-150 transform hover:-translate-y-0.5"
                >
                  <Pause className="w-5 h-5 fill-current" />
                  <span>Pause</span>
                </button>
              )}

              <button
                type="button"
                onClick={resetTimer}
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl text-base font-semibold bg-white dark:bg-neutral-900 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200 border border-neutral-200 dark:border-neutral-700 transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Reset</span>
              </button>
            </div>
          </div>

          {/* Time Duration Dial Adjustment (when paused or idle) */}
          {!timerRunning && (
            <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                <Timer className="w-4 h-4 text-emerald-600" />
                <span>Set Custom Timer Duration</span>
              </h3>

              <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto text-center">
                <div>
                  <label className="block text-xs font-semibold text-neutral-500 uppercase mb-1">
                    Hours
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="99"
                    value={timerInputHours}
                    onChange={(e) => {
                      const h = Math.max(0, parseInt(e.target.value) || 0);
                      setTimerInputHours(h);
                      const ms = (h * 3600 + timerInputMinutes * 60 + timerInputSeconds) * 1000;
                      setTimerTotalDurationMs(ms);
                      setTimerRemainingMs(ms);
                    }}
                    className="w-full rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 p-3 text-center text-2xl font-bold font-mono text-neutral-900 dark:text-white focus:ring-2 focus:ring-emerald-500/30"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-500 uppercase mb-1">
                    Minutes
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="59"
                    value={timerInputMinutes}
                    onChange={(e) => {
                      const m = Math.max(0, Math.min(59, parseInt(e.target.value) || 0));
                      setTimerInputMinutes(m);
                      const ms = (timerInputHours * 3600 + m * 60 + timerInputSeconds) * 1000;
                      setTimerTotalDurationMs(ms);
                      setTimerRemainingMs(ms);
                    }}
                    className="w-full rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 p-3 text-center text-2xl font-bold font-mono text-neutral-900 dark:text-white focus:ring-2 focus:ring-emerald-500/30"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-500 uppercase mb-1">
                    Seconds
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="59"
                    value={timerInputSeconds}
                    onChange={(e) => {
                      const s = Math.max(0, Math.min(59, parseInt(e.target.value) || 0));
                      setTimerInputSeconds(s);
                      const ms = (timerInputHours * 3600 + timerInputMinutes * 60 + s) * 1000;
                      setTimerTotalDurationMs(ms);
                      setTimerRemainingMs(ms);
                    }}
                    className="w-full rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 p-3 text-center text-2xl font-bold font-mono text-neutral-900 dark:text-white focus:ring-2 focus:ring-emerald-500/30"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
