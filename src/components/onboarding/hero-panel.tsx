'use client';

import { motion, AnimatePresence } from 'framer-motion';

export type OnboardingStage = number | 'generating' | 'result';

interface Theme {
  kanji: string;
  title: string;
  sub: string;
  color: string;
  quote: { text: string; author: string };
  pose: 'flex' | 'stance';
}

// One original warrior theme per wizard step. Figures are original
// anime-style silhouettes (no licensed character art).
const STEP_THEMES: Theme[] = [
  {
    kanji: '力',
    title: 'POWER',
    sub: 'Every hero starts with a name.',
    color: '#b026ff',
    quote: { text: 'Go beyond! Plus Ultra!', author: 'All Might' },
    pose: 'flex',
  },
  {
    kanji: '体',
    title: 'VESSEL',
    sub: 'Know the body you are forging.',
    color: '#00d4ff',
    quote: { text: 'Human beings are strong because we can change ourselves.', author: 'Saitama' },
    pose: 'stance',
  },
  {
    kanji: '夢',
    title: 'DREAM',
    sub: 'Choose the arc of your story.',
    color: '#ff2d78',
    quote: { text: 'If you don\'t take risks, you can\'t create a future!', author: 'Monkey D. Luffy' },
    pose: 'flex',
  },
  {
    kanji: '鍛',
    title: 'FORGE',
    sub: 'Your weapons. Your battlefield.',
    color: '#ccff00',
    quote: { text: 'Surpass your limits. Right here, right now.', author: 'Yami Sukehiro' },
    pose: 'stance',
  },
  {
    kanji: '心',
    title: 'SPIRIT',
    sub: 'Strength is built while you rest.',
    color: '#b026ff',
    quote: { text: 'Set your heart ablaze.', author: 'Kyojuro Rengoku' },
    pose: 'flex',
  },
];

const RESULT_THEME: Theme = {
  kanji: '覇',
  title: 'ASCEND',
  sub: 'Your legend begins now.',
  color: '#ccff00',
  quote: { text: 'Not giving up is my magic!', author: 'Asta' },
  pose: 'flex',
};

function themeFor(stage: OnboardingStage): Theme {
  if (stage === 'result' || stage === 'generating') return RESULT_THEME;
  return STEP_THEMES[stage] ?? STEP_THEMES[0];
}

/** Angular anime-style warrior silhouette. Two poses: double-biceps flex and wide power stance. */
function Silhouette({ pose, color }: { pose: Theme['pose']; color: string }) {
  return (
    <svg
      viewBox="0 0 240 290"
      className="w-full max-w-[320px] mx-auto float-slow"
      style={{ filter: `drop-shadow(0 0 24px ${color}66) drop-shadow(0 0 80px ${color}33)` }}
      aria-hidden
    >
      {pose === 'flex' ? (
        <g fill="#08080d" stroke={color} strokeWidth="2.5" strokeLinejoin="round">
          <ellipse cx="120" cy="36" rx="15" ry="17" />
          <polygon points="34,52 18,64 20,100 40,116 56,104 64,118 54,152 88,186 76,214 84,272 108,272 120,220 132,272 156,272 164,214 152,186 186,152 176,118 184,104 200,116 220,100 222,64 206,52 196,66 188,96 160,78 140,64 134,56 106,56 100,64 80,78 52,96 44,66" />
        </g>
      ) : (
        <g fill="#08080d" stroke={color} strokeWidth="2.5" strokeLinejoin="round">
          <ellipse cx="120" cy="40" rx="15" ry="17" />
          <polygon points="106,58 64,74 38,130 28,178 50,184 60,140 72,114 64,158 92,192 80,222 90,278 114,278 120,228 126,278 150,278 160,222 148,192 176,158 168,114 180,140 190,184 212,178 202,130 176,74 134,58" />
        </g>
      )}
    </svg>
  );
}

/** Full-height anime stage shown beside the onboarding wizard on large screens. */
export function OnboardingHeroPanel({ stage }: { stage: OnboardingStage }) {
  const theme = themeFor(stage);

  return (
    <aside className="relative hidden lg:flex flex-col justify-between w-[44%] max-w-[620px] h-screen sticky top-0 overflow-hidden border-r border-white/5">
      {/* Themed backdrop */}
      <div
        className="absolute inset-0 transition-all duration-700"
        style={{
          background: `radial-gradient(ellipse at 30% 20%, ${theme.color}22, transparent 60%), radial-gradient(ellipse at 70% 85%, ${theme.color}14, transparent 55%), #050508`,
        }}
      />
      <div className="absolute inset-0 speed-lines opacity-40" />

      {/* Giant kanji watermark */}
      <AnimatePresence mode="wait">
        <motion.span
          key={theme.kanji}
          initial={{ opacity: 0, scale: 1.15 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="absolute right-4 top-8 text-[11rem] font-black leading-none select-none pointer-events-none"
          style={{ color: `${theme.color}16` }}
        >
          {theme.kanji}
        </motion.span>
      </AnimatePresence>

      {/* Vertical katakana strip */}
      <span
        className="absolute left-5 top-1/2 -translate-y-1/2 text-[11px] tracking-[0.5em] text-white/20 select-none pointer-events-none"
        style={{ writingMode: 'vertical-rl' }}
      >
        限界突破 — LIMIT BREAK
      </span>

      {/* Logo */}
      <div className="relative z-10 p-10">
        <span className="text-xl font-black tracking-tight">
          <span className="text-white">WED</span>
          <span className="text-wed-purple">XUI</span>
          <span className="text-white font-light"> Fit</span>
        </span>
      </div>

      {/* Warrior figure */}
      <div className="relative z-10 px-10 flex-1 flex items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={`${theme.kanji}-${theme.pose}`}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.4 }}
            className="w-full relative"
          >
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div
                className="w-72 h-72 rounded-full aura-pulse"
                style={{ background: `radial-gradient(circle, ${theme.color}30, transparent 70%)` }}
              />
            </div>
            <Silhouette pose={theme.pose} color={theme.color} />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Theme + quote */}
      <div className="relative z-10 p-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={theme.title}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.35 }}
          >
            <div className="flex items-center gap-4 mb-4">
              <span className="text-5xl font-black leading-none" style={{ color: theme.color }}>
                {theme.kanji}
              </span>
              <div>
                <p className="text-xl font-black text-white tracking-[0.25em]">{theme.title}</p>
                <p className="text-xs text-wed-gray-400">{theme.sub}</p>
              </div>
            </div>
            <blockquote className="text-sm text-wed-gray-300 leading-relaxed">
              &quot;{theme.quote.text}&quot;{' '}
              <span className="text-wed-gray-500">— {theme.quote.author}</span>
            </blockquote>
          </motion.div>
        </AnimatePresence>

        {/* Step dots */}
        <div className="flex gap-2 mt-6">
          {STEP_THEMES.map((t, i) => (
            <span
              key={t.kanji}
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
      <div className="absolute inset-0 speed-lines opacity-30" />
      <span className="relative text-3xl font-black leading-none" style={{ color: theme.color }}>
        {theme.kanji}
      </span>
      <div className="relative">
        <p className="text-sm font-black text-white tracking-[0.2em]">{theme.title}</p>
        <p className="text-[11px] text-wed-gray-400">{theme.sub}</p>
      </div>
    </div>
  );
}
