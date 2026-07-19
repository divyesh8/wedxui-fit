'use client';

import { motion } from 'framer-motion';

export type OnboardingStage = number | 'generating' | 'result';

interface Theme {
  index: string;
  title: string;
  sub: string;
  color: string;
  line: string;
  pose: 'flex' | 'stance';
}

// One premium theme per wizard stage (0–4; later steps reuse 4). Original
// silhouette art, original coach-voice copy — no licensed material.
const STEP_THEMES: Theme[] = [
  {
    index: '01',
    title: 'PHYSIQUE',
    sub: 'Choose the body you are building.',
    color: '#FF3B30',
    line: 'Every great program starts with a destination.',
    pose: 'flex',
  },
  {
    index: '02',
    title: 'GOALS',
    sub: 'Rank what matters most.',
    color: '#FF5A4A',
    line: 'Your first pick leads the programming. The rest support it.',
    pose: 'stance',
  },
  {
    index: '03',
    title: 'STYLE',
    sub: 'Train the way you love to train.',
    color: '#FF3B30',
    line: 'The best program is the one you want to come back to.',
    pose: 'flex',
  },
  {
    index: '04',
    title: 'ARSENAL',
    sub: 'Your setup defines your exercise pool.',
    color: '#F59E0B',
    line: 'The AI only programs movements your equipment allows.',
    pose: 'stance',
  },
  {
    index: '05',
    title: 'PROFILE',
    sub: 'Recovery, lifestyle, and fuel.',
    color: '#FF3B30',
    line: 'Volume is earned by recovery — we program what you can absorb.',
    pose: 'flex',
  },
];

const RESULT_THEME: Theme = {
  index: 'AI',
  title: 'ANALYSIS',
  sub: 'Reasoned. Not randomized.',
  color: '#22C55E',
  line: 'Every exercise, set, and rest period has a reason you can read.',
  pose: 'flex',
};

function themeFor(stage: OnboardingStage): Theme {
  if (stage === 'result' || stage === 'generating') return RESULT_THEME;
  return STEP_THEMES[stage] ?? STEP_THEMES[STEP_THEMES.length - 1];
}

/** Original angular athlete silhouette. Two poses: double-biceps flex and wide power stance. */
function Silhouette({ pose, color }: { pose: Theme['pose']; color: string }) {
  return (
    <svg
      viewBox="0 0 240 290"
      className="w-full max-w-[320px] mx-auto float-slow"
      style={{ filter: `drop-shadow(0 0 24px ${color}55) drop-shadow(0 0 80px ${color}22)` }}
      aria-hidden
    >
      {pose === 'flex' ? (
        <g fill="#0a0a0a" stroke={color} strokeWidth="2.5" strokeLinejoin="round">
          <ellipse cx="120" cy="36" rx="15" ry="17" />
          <polygon points="34,52 18,64 20,100 40,116 56,104 64,118 54,152 88,186 76,214 84,272 108,272 120,220 132,272 156,272 164,214 152,186 186,152 176,118 184,104 200,116 220,100 222,64 206,52 196,66 188,96 160,78 140,64 134,56 106,56 100,64 80,78 52,96 44,66" />
        </g>
      ) : (
        <g fill="#0a0a0a" stroke={color} strokeWidth="2.5" strokeLinejoin="round">
          <ellipse cx="120" cy="40" rx="15" ry="17" />
          <polygon points="106,58 64,74 38,130 28,178 50,184 60,140 72,114 64,158 92,192 80,222 90,278 114,278 120,228 126,278 150,278 160,222 148,192 176,158 168,114 180,140 190,184 212,178 202,130 176,74 134,58" />
        </g>
      )}
    </svg>
  );
}

/** Full-height premium stage shown beside the onboarding wizard on large screens. */
export function OnboardingHeroPanel({ stage }: { stage: OnboardingStage }) {
  const theme = themeFor(stage);

  return (
    <aside className="relative hidden lg:flex flex-col justify-between w-[44%] max-w-[620px] h-screen sticky top-0 overflow-hidden border-r border-white/5 bg-black">
      {/* Accent backdrop */}
      <div
        className="absolute inset-0 transition-all duration-700"
        style={{
          background: `radial-gradient(ellipse at 30% 20%, ${theme.color}1e, transparent 60%), radial-gradient(ellipse at 70% 85%, ${theme.color}10, transparent 55%), #000`,
        }}
      />

      {/* Giant step-number watermark (keyed remount, no exit animation) */}
      <motion.span
        key={theme.index}
        initial={{ opacity: 0, scale: 1.1 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="absolute right-6 top-6 text-[10rem] font-black leading-none select-none pointer-events-none tracking-tighter"
        style={{ color: `${theme.color}14` }}
      >
        {theme.index}
      </motion.span>

      {/* Logo */}
      <div className="relative z-10 p-10">
        <span className="text-xl font-black tracking-tight">
          <span className="text-white">WEDXUI</span>
          <span className="text-wed-purple"> FIT</span>
        </span>
      </div>

      {/* Athlete figure */}
      <div className="relative z-10 px-10 flex-1 flex items-center justify-center">
        <motion.div
          key={`${theme.index}-${theme.pose}`}
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full relative"
        >
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div
              className="w-72 h-72 rounded-full aura-pulse"
              style={{ background: `radial-gradient(circle, ${theme.color}26, transparent 70%)` }}
            />
          </div>
          <Silhouette pose={theme.pose} color={theme.color} />
        </motion.div>
      </div>

      {/* Stage title + coach line */}
      <div className="relative z-10 p-10">
        <motion.div
          key={theme.title}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
        >
          <div className="flex items-center gap-4 mb-4">
            <span className="text-4xl font-black leading-none tracking-tight" style={{ color: theme.color }}>
              {theme.index}
            </span>
            <div>
              <p className="text-xl font-black text-white tracking-[0.25em]">{theme.title}</p>
              <p className="text-xs text-wed-gray-400">{theme.sub}</p>
            </div>
          </div>
          <blockquote className="text-sm text-wed-gray-300 leading-relaxed">{theme.line}</blockquote>
        </motion.div>

        {/* Step dots */}
        <div className="flex gap-2 mt-6">
          {STEP_THEMES.map((t, i) => (
            <span
              key={t.index}
              className="h-1 rounded-full transition-all duration-300"
              style={{
                width: typeof stage === 'number' && i === stage ? 28 : 10,
                background:
                  stage === 'result' || stage === 'generating' || (typeof stage === 'number' && i <= stage)
                    ? theme.color
                    : 'rgba(255,255,255,0.15)',
              }}
            />
          ))}
        </div>
      </div>
    </aside>
  );
}

/** Compact themed strip for small screens (the side stage is hidden there). */
export function OnboardingThemeStrip({ stage }: { stage: OnboardingStage }) {
  const theme = themeFor(stage);
  return (
    <div className="lg:hidden flex items-center gap-3 mb-6 p-4 rounded-2xl glass overflow-hidden relative">
      <span className="relative text-2xl font-black leading-none tracking-tight" style={{ color: theme.color }}>
        {theme.index}
      </span>
      <div className="relative">
        <p className="text-sm font-black text-white tracking-[0.2em]">{theme.title}</p>
        <p className="text-[11px] text-wed-gray-400">{theme.sub}</p>
      </div>
    </div>
  );
}
