'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

const HEARTBEAT_INTERVAL_MS = 15_000;

/**
 * Tracks elapsed *active* seconds for a running workout session and
 * periodically syncs them to the server (survives refresh — the server
 * always has the last heartbeat's value). Pausing just stops the local
 * interval and the heartbeat; nothing server-side needs to know "paused"
 * happened, only the resulting activeSeconds.
 */
export function useWorkoutTimer(sessionId: string | null, initialActiveSeconds: number) {
  const [activeSeconds, setActiveSeconds] = useState(initialActiveSeconds);
  const [isRunning, setIsRunning] = useState(Boolean(sessionId));
  const activeSecondsRef = useRef(activeSeconds);
  activeSecondsRef.current = activeSeconds;

  const sendHeartbeat = useCallback(() => {
    if (!sessionId) return;
    fetch(`/api/workouts/${sessionId}/heartbeat`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ activeSeconds: activeSecondsRef.current }),
      keepalive: true,
    }).catch(() => {});
  }, [sessionId]);

  useEffect(() => {
    if (!sessionId || !isRunning) return;
    const tick = setInterval(() => setActiveSeconds((s) => s + 1), 1000);
    const heartbeat = setInterval(sendHeartbeat, HEARTBEAT_INTERVAL_MS);
    return () => {
      clearInterval(tick);
      clearInterval(heartbeat);
      sendHeartbeat(); // flush on pause/unmount so a refresh doesn't lose more than a few seconds
    };
  }, [sessionId, isRunning, sendHeartbeat]);

  const pause = useCallback(() => setIsRunning(false), []);
  const resume = useCallback(() => setIsRunning(true), []);

  const formatted = `${Math.floor(activeSeconds / 60).toString().padStart(2, '0')}:${(activeSeconds % 60).toString().padStart(2, '0')}`;

  return { activeSeconds, isRunning, pause, resume, formatted, flush: sendHeartbeat };
}
