'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Countdown timer for rest between exercises/sets. Pattern lifted from the
 * plain countdown in dashboard/tools/page.tsx's TimerCard. Calls onRestEnd
 * when it reaches 0 (naturally or via skip) so the caller can auto-advance.
 */
export function useRestTimer(onRestEnd: () => void) {
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const onRestEndRef = useRef(onRestEnd);
  onRestEndRef.current = onRestEnd;

  const clear = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = null;
  }, []);

  const start = useCallback((seconds: number) => {
    clear();
    setSecondsLeft(seconds);
    setIsRunning(true);
    intervalRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clear();
          setIsRunning(false);
          if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
            new Notification('Rest over — next exercise!');
          }
          onRestEndRef.current();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [clear]);

  const skip = useCallback(() => {
    clear();
    setSecondsLeft(0);
    setIsRunning(false);
    onRestEndRef.current();
  }, [clear]);

  useEffect(() => clear, [clear]);

  const formatted = `${Math.floor(secondsLeft / 60).toString().padStart(2, '0')}:${(secondsLeft % 60).toString().padStart(2, '0')}`;

  return { secondsLeft, isRunning, start, skip, formatted };
}
