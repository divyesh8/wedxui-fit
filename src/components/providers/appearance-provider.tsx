'use client';

import { useEffect } from 'react';
import type { AppearanceSettingsInput } from '@/lib/validations/settings';

/**
 * Turns AppearanceSettings into CSS custom properties on <html>.
 *
 * Everything here is a variable the stylesheet already consumes (see the
 * appearance block in globals.css), so changing one value restyles the whole
 * app without a re-render or a reload. `wed-purple` in tailwind.config.ts is
 * defined as rgb(var(--wed-accent-rgb) / <alpha-value>), which is why setting
 * one variable recolours every accent in the product.
 */

/** Channel form ("R G B") so Tailwind opacity modifiers keep working. */
const ACCENT_RGB: Record<AppearanceSettingsInput['accentColor'], string> = {
  red: '255 59 48', // #FF3B30 — the WEDXUI default
  orange: '245 158 11', // #F59E0B
  green: '34 197 94', // #22C55E
  blue: '59 130 246', // #3B82F6
  violet: '139 92 246', // #8B5CF6
};

const FONT_SCALE: Record<AppearanceSettingsInput['fontSize'], string> = {
  small: '0.9375', // 15px base
  medium: '1', // 16px base
  large: '1.125', // 18px base
};

const GLASS_BLUR: Record<AppearanceSettingsInput['glassIntensity'], string> = {
  low: '6px',
  medium: '16px',
  high: '28px',
};

const CORNER: Record<AppearanceSettingsInput['roundedCorners'], string> = {
  none: '0rem',
  small: '0.375rem',
  medium: '0.75rem',
  large: '1.25rem',
};

export function applyAppearance(a: AppearanceSettingsInput): void {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;

  root.style.setProperty('--wed-accent-rgb', ACCENT_RGB[a.accentColor] ?? ACCENT_RGB.red);
  root.style.setProperty('--wed-font-scale', FONT_SCALE[a.fontSize] ?? FONT_SCALE.medium);
  root.style.setProperty('--wed-glass-blur', GLASS_BLUR[a.glassIntensity] ?? GLASS_BLUR.medium);
  root.style.setProperty('--wed-corner', CORNER[a.roundedCorners] ?? CORNER.medium);

  root.dataset.density = a.compactMode ? 'compact' : 'comfortable';
  // Turning animations off is the same user intent as reducing motion, so both
  // drive the one attribute the stylesheet reacts to.
  root.dataset.reduceMotion = String(a.reduceMotion || !a.animations);
}

/**
 * Applies the saved appearance once per dashboard mount.
 *
 * Renders nothing. There is a brief flash of the default accent before this
 * resolves — acceptable because the default IS the brand colour, so only users
 * who changed it see any shift, and only on a cold load.
 */
export function AppearanceProvider() {
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/settings');
        if (!res.ok) return; // not signed in, or offline — keep the defaults
        const data = await res.json();
        if (!cancelled && data?.settings?.appearance) {
          applyAppearance(data.settings.appearance);
        }
      } catch {
        // Appearance is cosmetic; a failure here must never surface to the user.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return null;
}
