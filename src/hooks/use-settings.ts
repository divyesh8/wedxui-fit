'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useUIStore } from '@/store';
import type { SettingsBundle } from '@/lib/settings/service';
import type { SettingsDomain } from '@/lib/validations/settings';

const DEBOUNCE_MS = 500;

export type SaveState = 'idle' | 'saving' | 'saved' | 'error';

/**
 * Loads every settings domain once, then autosaves individual fields.
 *
 * Optimistic: the control moves the instant it is touched. If the PATCH fails
 * the field is rolled back to the server's last known value and the user is
 * told — a toggle must never sit in a state the database does not agree with.
 *
 * Debounced per (domain, field), so dragging a slider issues one request, but
 * flipping two different toggles quickly still issues two.
 */
export function useSettings() {
  const [settings, setSettings] = useState<SettingsBundle | null>(null);
  const [loading, setLoading] = useState(true);
  const [saveState, setSaveState] = useState<SaveState>('idle');
  const addToast = useUIStore((s) => s.addToast);

  // Last value the server confirmed — the rollback target.
  const committed = useRef<SettingsBundle | null>(null);
  const timers = useRef(new Map<string, ReturnType<typeof setTimeout>>());
  const savedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/settings');
        const data = await res.json();
        if (cancelled) return;
        if (!res.ok) throw new Error(data.error ?? 'Could not load settings.');
        setSettings(data.settings);
        committed.current = data.settings;
      } catch (err) {
        if (!cancelled) {
          addToast(err instanceof Error ? err.message : 'Could not load settings.', 'error');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [addToast]);

  // Clear pending debounces on unmount so a navigation cannot fire a stray PATCH.
  useEffect(() => {
    const pending = timers.current;
    return () => {
      pending.forEach(clearTimeout);
      pending.clear();
      if (savedTimer.current) clearTimeout(savedTimer.current);
    };
  }, []);

  const flashSaved = useCallback(() => {
    setSaveState('saved');
    if (savedTimer.current) clearTimeout(savedTimer.current);
    savedTimer.current = setTimeout(() => setSaveState('idle'), 1800);
  }, []);

  const update = useCallback(
    <D extends SettingsDomain>(domain: D, field: string, value: unknown) => {
      // 1. Optimistic local move.
      setSettings((prev) =>
        prev ? { ...prev, [domain]: { ...prev[domain], [field]: value } } : prev
      );

      // 2. Debounce per field.
      const key = `${domain}.${field}`;
      const existing = timers.current.get(key);
      if (existing) clearTimeout(existing);

      timers.current.set(
        key,
        setTimeout(async () => {
          timers.current.delete(key);
          setSaveState('saving');
          try {
            const res = await fetch(`/api/settings?domain=${domain}`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ [field]: value }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error ?? 'Could not save.');

            // 3. Adopt the server's version of the row as the new rollback point.
            setSettings((prev) => (prev ? { ...prev, [domain]: data.settings } : prev));
            committed.current = committed.current
              ? { ...committed.current, [domain]: data.settings }
              : committed.current;
            flashSaved();
          } catch (err) {
            // 4. Roll back to the last confirmed value.
            const fallback = committed.current;
            if (fallback) {
              setSettings((prev) => (prev ? { ...prev, [domain]: fallback[domain] } : prev));
            }
            setSaveState('error');
            addToast(err instanceof Error ? err.message : 'Could not save.', 'error');
          }
        }, DEBOUNCE_MS)
      );
    },
    [addToast, flashSaved]
  );

  return { settings, loading, saveState, update, setSettings };
}
