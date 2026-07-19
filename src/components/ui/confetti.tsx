'use client';

import { useEffect, useState } from 'react';

// Dependency-free celebration burst. Mount it (e.g. keyed on a completion event)
// and it self-cleans after the animation. Fixed overlay, non-interactive.
const COLORS = ['#FF3B30', '#FF5A4A', '#22C55E', '#F59E0B', '#FFFFFF'];
const PIECES = 90;

interface Piece {
  left: number;
  delay: number;
  duration: number;
  color: string;
  size: number;
  drift: number;
  rotate: number;
}

export function Confetti({ show }: { show: boolean }) {
  const [pieces, setPieces] = useState<Piece[]>([]);

  useEffect(() => {
    if (!show) return;
    setPieces(
      Array.from({ length: PIECES }, () => ({
        left: Math.random() * 100,
        delay: Math.random() * 0.3,
        duration: 2 + Math.random() * 1.5,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        size: 6 + Math.random() * 8,
        drift: (Math.random() - 0.5) * 240,
        rotate: Math.random() * 720,
      }))
    );
    const t = setTimeout(() => setPieces([]), 4000);
    return () => clearTimeout(t);
  }, [show]);

  if (pieces.length === 0) return null;

  return (
    <div className="fixed inset-0 z-[200] pointer-events-none overflow-hidden" aria-hidden>
      <style>{`
        @keyframes wed-confetti-fall {
          0% { transform: translateY(-10vh) translateX(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(110vh) translateX(var(--drift)) rotate(var(--rot)); opacity: 0; }
        }
      `}</style>
      {pieces.map((p, i) => (
        <span
          key={i}
          style={{
            position: 'absolute',
            top: 0,
            left: `${p.left}%`,
            width: p.size,
            height: p.size * 0.4,
            background: p.color,
            borderRadius: 2,
            ['--drift' as string]: `${p.drift}px`,
            ['--rot' as string]: `${p.rotate}deg`,
            animation: `wed-confetti-fall ${p.duration}s cubic-bezier(0.2, 0.7, 0.4, 1) ${p.delay}s forwards`,
          }}
        />
      ))}
    </div>
  );
}
