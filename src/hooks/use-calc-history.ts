'use client';

import { useCallback, useEffect, useState } from 'react';

const MAX_HISTORY = 5;

/**
 * Per-calculator result history, kept in localStorage (not synced to Neon —
 * these are stateless utility scratch-pads, not part of the user's fitness
 * record). Keyed per calculator so each tool has its own history.
 */
export function useCalcHistory(key: string) {
  const storageKey = `wedxui-calc-history:${key}`;
  const [history, setHistory] = useState<string[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) setHistory(JSON.parse(raw));
    } catch {
      // ignore corrupt storage
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const push = useCallback((entry: string) => {
    setHistory((prev) => {
      const next = [entry, ...prev].slice(0, MAX_HISTORY);
      try {
        localStorage.setItem(storageKey, JSON.stringify(next));
      } catch {
        // storage full/unavailable — history just won't persist
      }
      return next;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageKey]);

  return { history, push };
}
