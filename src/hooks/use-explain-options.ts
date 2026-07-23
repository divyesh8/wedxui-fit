'use client';

import { useEffect, useState } from 'react';
import type { ExplainOptions } from '@/lib/ai/explain';

/**
 * Reads the user's AI Coach tone settings for renderAll()/renderReasoning().
 *
 * Deliberately separate from useSettings(): this is a silent, read-only lookup
 * used on pages that only render reasoning (workouts, diet, onboarding). It
 * never toasts and never writes — a settings fetch failing must not interrupt a
 * workout, so the default professional/short tone is simply kept.
 *
 * Returns undefined until loaded, which renderReasoning treats as "use defaults".
 */
export function useExplainOptions(): ExplainOptions | undefined {
  const [options, setOptions] = useState<ExplainOptions | undefined>(undefined);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/settings')
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (cancelled || !d?.settings?.ai) return;
        setOptions({
          style: d.settings.ai.communicationStyle,
          personality: d.settings.ai.personality,
        });
      })
      .catch(() => {
        // Tone is cosmetic — fall back to defaults rather than surfacing an error.
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return options;
}
