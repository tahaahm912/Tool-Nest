/**
 * Utility functions for Study Timer (Pomodoro and Custom Focus Intervals)
 */

export type TimerMode = 'pomodoro' | 'shortBreak' | 'longBreak' | 'custom';

export interface TimerSettings {
  studyDurationMinutes: number;
  shortBreakMinutes: number;
  longBreakMinutes: number;
  sessionsBeforeLongBreak: number;
  soundEnabled: boolean;
  autoStartNext: boolean;
}

export const DEFAULT_TIMER_SETTINGS: TimerSettings = {
  studyDurationMinutes: 25,
  shortBreakMinutes: 5,
  longBreakMinutes: 15,
  sessionsBeforeLongBreak: 4,
  soundEnabled: true,
  autoStartNext: false,
};

const STORAGE_KEY = 'toolnest_study_timer_settings';

export function loadTimerSettings(): TimerSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_TIMER_SETTINGS;
    return { ...DEFAULT_TIMER_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_TIMER_SETTINGS;
  }
}

export function saveTimerSettings(settings: TimerSettings): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch {
    // Ignore if localStorage unavailable
  }
}

/**
 * Format milliseconds or seconds to MM:SS or HH:MM:SS
 */
export function formatTimerTime(totalSeconds: number): string {
  const safeSeconds = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  const seconds = safeSeconds % 60;

  const pad = (n: number) => n.toString().padStart(2, '0');

  if (hours > 0) {
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  }
  return `${pad(minutes)}:${pad(seconds)}`;
}

/**
 * Synthesize a clean, pleasant notification chime using the Web Audio API.
 * This does not rely on any remote audio files or CDN assets.
 */
export function playNotificationChime(): void {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();
    const now = ctx.currentTime;

    // Harmonic bell sequence: 523.25Hz (C5), 659.25Hz (E5), 783.99Hz (G5), 1046.50Hz (C6)
    const notes = [
      { freq: 523.25, time: 0 },
      { freq: 659.25, time: 0.12 },
      { freq: 783.99, time: 0.24 },
      { freq: 1046.5, time: 0.38 },
    ];

    notes.forEach(({ freq, time }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + time);

      gain.gain.setValueAtTime(0, now + time);
      gain.gain.linearRampToValueAtTime(0.3, now + time + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + time + 0.8);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + time);
      osc.stop(now + time + 0.85);
    });

    // Close context after chime finishes to release hardware audio channel
    setTimeout(() => {
      try {
        ctx.close();
      } catch {}
    }, 1500);
  } catch (e) {
    console.warn('Could not play synthesized audio chime:', e);
  }
}

/**
 * Browser notifications management
 */
export function getNotificationPermission(): NotificationPermission | 'unsupported' {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'unsupported';
  }
  return Notification.permission;
}

export async function requestNotificationPermission(): Promise<boolean> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return false;
  }
  try {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  } catch {
    return false;
  }
}

export function showTimerNotification(title: string, body: string): void {
  if (typeof window === 'undefined' || !('Notification' in window)) return;
  if (Notification.permission === 'granted') {
    try {
      new Notification(title, {
        body,
        icon: '/favicon.ico',
        tag: 'study-timer-alert',
      });
    } catch {}
  }
}
