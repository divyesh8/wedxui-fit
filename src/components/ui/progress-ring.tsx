'use client';

import { motion } from 'framer-motion';

interface ProgressRingProps {
  /** Current value (clamped to 0..max for the arc; the label shows the raw value). */
  value: number;
  max: number;
  label: string;
  sublabel?: string;
  /** Stroke color — pass a hex so the SVG stroke stays exact. */
  color?: string;
  size?: number;
}

/**
 * Minimal SVG progress ring. Pure presentation: callers pass real numbers,
 * this never invents or estimates a value.
 */
export function ProgressRing({
  value,
  max,
  label,
  sublabel,
  color = '#FF3B30',
  size = 104,
}: ProgressRingProps) {
  const stroke = 8;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const ratio = max > 0 ? Math.min(1, Math.max(0, value / max)) : 0;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90" aria-hidden>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.08)"
            strokeWidth={stroke}
          />
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: circumference * (1 - ratio) }}
            transition={{ duration: 0.9, ease: 'easeOut' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xl font-black text-white leading-none tabular-nums">{value}</span>
          {sublabel && <span className="text-[10px] text-wed-gray-400 mt-0.5">{sublabel}</span>}
        </div>
      </div>
      <span className="text-[11px] font-medium text-wed-gray-400 text-center">{label}</span>
    </div>
  );
}
