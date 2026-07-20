'use client';

import { useEffect } from 'react';

/**
 * Registers the service worker in production only — in dev it would fight
 * Next's hot reload. Failure is non-fatal: the app works fine without it.
 */
export function ServiceWorkerRegistrar() {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') return;
    if (!('serviceWorker' in navigator)) return;

    const register = () => {
      navigator.serviceWorker.register('/sw.js').catch(() => {
        // Offline support is a progressive enhancement — ignore failures.
      });
    };

    // Wait for load so the SW never competes with the first paint.
    if (document.readyState === 'complete') register();
    else window.addEventListener('load', register, { once: true });
  }, []);

  return null;
}
