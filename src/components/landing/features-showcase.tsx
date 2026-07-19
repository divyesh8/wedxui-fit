'use client';

import { motion } from 'framer-motion';
import { Brain, Dumbbell, Apple, Calculator, TrendingUp, Trophy, ShieldCheck, Sparkles } from 'lucide-react';
import { PHYSIQUE_ART } from '@/components/onboarding/physique-art';
import { physiques } from '@/data/knowledge/physiques';

// Real sample lines the engine actually produces (see src/lib/ai/explain.ts) —
// shown as static exhibits so the "explains itself" claim is demonstrable, not
// marketing fluff.
const REASONING_SAMPLES = [
  'Bench press fills the horizontal-push slot: your commercial gym allows barbells, and it serves the Classic Aesthetic physique under Gym training.',
  '4 sets — intermediate baseline of 3, adjusted for Muscle Growth and the Mass Monster physique (compound movement).',
  'Your eating pattern (home-cooked, egg-based) points to budget-tier food choices — the nutrition plan stays inside that reality.',
  'Recovery score 62/100 — based on 6.5h sleep, stress level 3/5, and a desk job.',
];

const FEATURES = [
  { icon: Brain, title: 'AI Workout Engine', desc: 'A knowledge-driven engine picks every exercise from your equipment, goal, and recovery — then proves why.', span: 'lg:col-span-2', accent: 'text-wed-purple' },
  { icon: Apple, title: 'Nutrition Intelligence', desc: 'Calories, macros, meal timing and supplements — built only from foods you actually eat, at a budget it infers for you.', span: '', accent: 'text-wed-lime' },
  { icon: Dumbbell, title: 'Physique System', desc: '11 target physiques, each with its own programming bias.', span: '', accent: 'text-wed-pink' },
  { icon: Calculator, title: '14 Calculators', desc: 'BMI, body fat, TDEE, 1RM, strength standards, and more.', span: '', accent: 'text-wed-purple' },
  { icon: TrendingUp, title: 'Real Progress', desc: 'Server-tracked streaks, XP, and weekly adherence from your actual logged sessions.', span: '', accent: 'text-wed-lime' },
  { icon: Trophy, title: 'Earned Achievements', desc: 'Unlocks tied to real milestones — nothing handed out for free.', span: '', accent: 'text-wed-orange' },
];

export function FeaturesShowcase() {
  return (
    <section id="features" className="relative py-24 md:py-32 px-4">
      <div className="max-w-6xl mx-auto">
        {/* AI reasoning showcase */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-6"
          >
            <ShieldCheck className="w-4 h-4 text-wed-lime" />
            <span className="text-sm font-medium text-wed-gray-200">Every recommendation is explainable</span>
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="text-4xl md:text-6xl font-black tracking-tight mb-4"
          >
            <span className="text-white">It doesn&apos;t just tell you </span>
            <span className="text-gradient">what.</span>
            <br />
            <span className="text-white">It tells you </span>
            <span className="text-gradient">why.</span>
          </motion.h2>
          <p className="text-wed-gray-400 max-w-2xl mx-auto">
            Tap &quot;Why?&quot; on any exercise and read the exact reasoning. These are real lines the engine produces:
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-4 max-w-4xl mx-auto mb-24">
          {REASONING_SAMPLES.map((line, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="glass rounded-2xl p-5 flex gap-3"
            >
              <Brain className="w-4 h-4 text-wed-purple flex-shrink-0 mt-0.5" />
              <p className="text-sm text-wed-gray-200 leading-relaxed">{line}</p>
            </motion.div>
          ))}
        </div>

        {/* Bento feature grid */}
        <div className="text-center mb-12">
          <motion.h2
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="text-3xl md:text-5xl font-black text-white tracking-tight"
          >
            One platform. Every system.
          </motion.h2>
        </div>

        <div className="grid md:grid-cols-3 gap-4 mb-24">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
              className={`glass rounded-3xl p-6 card-hover ${f.span}`}
            >
              <div className="w-11 h-11 rounded-2xl bg-white/5 flex items-center justify-center mb-4">
                <f.icon className={`w-5 h-5 ${f.accent}`} />
              </div>
              <h3 className="text-lg font-bold text-white mb-1.5">{f.title}</h3>
              <p className="text-sm text-wed-gray-400 leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* Physique gallery */}
        <div className="text-center mb-10">
          <motion.h2
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="text-3xl md:text-5xl font-black text-white tracking-tight mb-3"
          >
            Pick your <span className="text-gradient">destination.</span>
          </motion.h2>
          <p className="text-wed-gray-400 max-w-xl mx-auto">
            Every physique programs differently. The engine knows the difference.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {physiques.slice(0, 6).map((p, i) => {
            const Art = PHYSIQUE_ART[p.silhouette];
            return (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="glass rounded-2xl p-4 text-center card-hover"
              >
                <div className="h-20 mb-2">{Art && <Art color="#FF3B30" />}</div>
                <p className="text-xs font-bold text-white">{p.name}</p>
              </motion.div>
            );
          })}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="mt-24 text-center glass rounded-3xl p-12 relative overflow-hidden"
        >
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[400px] h-[400px] bg-wed-purple/10 rounded-full blur-[100px] pointer-events-none" />
          <Sparkles className="w-8 h-8 text-wed-purple mx-auto mb-4 relative" />
          <h2 className="text-3xl md:text-5xl font-black text-white mb-4 relative">Your program is two minutes away.</h2>
          <p className="text-wed-gray-400 max-w-xl mx-auto mb-8 relative">
            Answer a few questions about your goal, body, equipment, and food. The AI does the rest — and shows its work.
          </p>
          <a
            href="/signup"
            className="relative inline-flex items-center gap-2 px-8 py-4 rounded-full bg-gradient-purple text-white font-bold text-lg hover:brightness-110 transition-all btn-glow"
          >
            Start Free <Sparkles className="w-5 h-5" />
          </a>
        </motion.div>
      </div>
    </section>
  );
}
