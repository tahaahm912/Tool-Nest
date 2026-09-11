/**
 * Precision Timer & Stopwatch Engine.
 * Calculates elapsed and remaining durations from monotonic timestamps (Date.now() / performance.now())
 * to ensure 100% accuracy when tabs are throttled or backgrounded.
 */

export interface FormattedTime {
  hours: string;
  minutes: string;
  seconds: string;
  milliseconds: string; // 2 digits or 3 digits
  totalMs: number;
}

/**
 * Splits milliseconds into formatted zero-padded time components.
 */
export function formatMilliseconds(totalMs: number): FormattedTime {
  const safeMs = Math.max(0, Math.floor(totalMs));
  const ms = safeMs % 1000;
  const totalSec = Math.floor(safeMs / 1000);
  const s = totalSec % 60;
  const totalMin = Math.floor(totalSec / 60);
  const m = totalMin % 60;
  const h = Math.floor(totalMin / 60);

  return {
    hours: String(h).padStart(2, '0'),
    minutes: String(m).padStart(2, '0'),
    seconds: String(s).padStart(2, '0'),
    milliseconds: String(Math.floor(ms / 10)).padStart(2, '0'), // Centiseconds
    totalMs: safeMs,
  };
}

/**
 * Plays a pleasant completion chime using the Web Audio API.
 * Does not require external audio assets or network requests.
 */
export function playCompletionChime(): void {
  if (typeof window === 'undefined') return;

  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;

    const ctx = new AudioCtx();
    const now = ctx.currentTime;

    // Harmonic triad chime (G5, B5, D6) for a celebratory finish
    const notes = [
      { freq: 783.99, start: 0, duration: 0.4 },     // G5
      { freq: 987.77, start: 0.12, duration: 0.5 },   // B5
      { freq: 1174.66, start: 0.25, duration: 0.8 },  // D6
    ];

    notes.forEach(({ freq, start, duration }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + start);

      gain.gain.setValueAtTime(0.001, now + start);
      gain.gain.exponentialRampToValueAtTime(0.2, now + start + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + start + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + start);
      osc.stop(now + start + duration);
    });

    // Cleanup audio context after chime finishes
    setTimeout(() => {
      ctx.close().catch(() => {});
    }, 1500);
  } catch (err) {
    console.warn('Audio playback not permitted or unavailable:', err);
  }
}

/**
 * Sends a native browser desktop notification if permission was previously granted.
 */
export function sendTimerNotification(title: string, body: string): void {
  if (typeof window === 'undefined' || !('Notification' in window)) return;

  if (Notification.permission === 'granted') {
    try {
      new Notification(title, {
        body,
        icon: '/favicon.ico',
      });
    } catch (e) {
      console.warn('Notification failed:', e);
    }
  }
}
