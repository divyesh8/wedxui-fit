import Link from 'next/link';

export const metadata = { title: 'Offline — WEDXUI FIT' };

/**
 * Served by the service worker when a navigation fails and nothing is cached.
 * Intentionally static and dependency-free so it works with no network.
 */
export default function OfflinePage() {
  return (
    <main className="min-h-screen bg-black flex items-center justify-center px-6">
      <div className="w-full max-w-sm text-center">
        <div className="w-14 h-14 rounded-2xl bg-wed-purple/15 border border-wed-purple/30 flex items-center justify-center mx-auto mb-6">
          {/* Simple offline glyph — no icon library needed on this route. */}
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FF3B30" strokeWidth="2" strokeLinecap="round" aria-hidden>
            <path d="M2 2l20 20M8.5 16.5a5 5 0 017 0M5 12.5a10 10 0 015-2.6M1.5 8.8A15 15 0 016 6.2M22.5 8.8a15 15 0 00-9.6-3.7" />
            <circle cx="12" cy="20" r="0.5" fill="#FF3B30" />
          </svg>
        </div>

        <h1 className="text-2xl font-black text-white mb-2">You&apos;re offline</h1>
        <p className="text-sm text-wed-gray-400 leading-relaxed mb-8">
          WEDXUI FIT needs a connection to load your plan and log training. Your
          completed sessions are safe on the server — nothing is lost.
        </p>

        <Link
          href="/dashboard"
          className="inline-flex items-center justify-center min-h-[48px] px-6 rounded-xl bg-wed-purple text-white font-bold hover:brightness-110 transition-all"
        >
          Try again
        </Link>
      </div>
    </main>
  );
}
