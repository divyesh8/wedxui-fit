'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Sparkles, Flame, Droplets, Beef, RefreshCw, ArrowRight, Brain, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { physiques } from '@/data/knowledge/physiques';
import { trainingStyles } from '@/data/knowledge/training-styles';
import { equipmentCards } from '@/data/knowledge/equipment-cards';
import { goalProfiles, experienceProfiles } from '@/data/knowledge/volume-landmarks';
import { foodHabits, proteinSources } from '@/data/knowledge/nutrition-knowledge';
import { aiOnboardingSchema } from '@/lib/validations/ai-onboarding';
import { renderAll } from '@/lib/ai/explain';
import type { AiOnboardingInput, AthleteProfile, AiPlan, AiNutritionPlan } from '@/lib/ai/types';
import { PHYSIQUE_ART } from '@/components/onboarding/physique-art';
import type { OnboardingStage } from '@/components/onboarding/hero-panel';

const STEP_TITLES = [
  'Choose Your Physique',
  'Rank Your Goals',
  'Training Style',
  'Your Arsenal',
  'Experience Level',
  'Lifestyle',
  'Nutrition World',
  'Your Athlete Profile',
];

const ACCENT = '#b026ff';

type FormState = Omit<AiOnboardingInput, 'physique' | 'trainingStyle' | 'experienceTier'> & {
  physique: AiOnboardingInput['physique'] | '';
  trainingStyle: AiOnboardingInput['trainingStyle'] | '';
  experienceTier: AiOnboardingInput['experienceTier'] | '';
  // numeric fields kept as strings for inputs
  ageStr: string; heightStr: string; weightStr: string; bodyFatStr: string; sleepStr: string;
};

const INITIAL: FormState = {
  physique: '', goalsRanked: [], trainingStyle: '', equipmentCards: [], experienceTier: '',
  name: '', age: 0, gender: 'MALE', heightCm: 0, weightKg: 0, bodyFatPct: null,
  occupation: 'sedentary-job', sleepHours: 0, stressLevel: 3, daysPerWeek: 4, sessionMinutes: 60,
  injuries: '', medicalNotes: '',
  foodHabits: [], proteinSources: [], foodsAvoided: '', allergies: '',
  cookingAbility: 'medium', mealsPerDay: 3, waterHabit: 'moderate', supplements: '',
  ageStr: '', heightStr: '', weightStr: '', bodyFatStr: '', sleepStr: '',
};

interface AiResult {
  athleteProfile: AthleteProfile;
  aiPlan: AiPlan & { generatedAt?: string };
  aiNutritionPlan: AiNutritionPlan;
}

function Chip({ active, onClick, children, badge }: { active: boolean; onClick: () => void; children: React.ReactNode; badge?: string }) {
  return (
    <button type="button" onClick={onClick}
      className={cn('relative px-4 py-2.5 rounded-xl border text-sm font-medium transition-all',
        active
          ? 'border-wed-purple bg-wed-purple/20 text-white shadow-[0_0_16px_rgba(176,38,255,0.25)]'
          : 'border-white/10 bg-white/5 text-wed-gray-300 hover:border-white/25 hover:text-white')}>
      {children}
      {badge && (
        <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-wed-lime text-wed-black text-[11px] font-black flex items-center justify-center">{badge}</span>
      )}
    </button>
  );
}

function Field({ label, optional, children }: { label: string; optional?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-wed-gray-200 mb-1.5">
        {label}{optional && <span className="ml-2 text-xs text-wed-gray-500">optional</span>}
      </label>
      {children}
    </div>
  );
}

const inputCls = 'w-full h-11 px-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-wed-gray-500 focus:border-wed-purple focus:outline-none transition-colors';

function WhyDetails({ lines, label = 'Why?' }: { lines: string[]; label?: string }) {
  if (lines.length === 0) return null;
  return (
    <details className="mt-1.5">
      <summary className="text-[11px] text-wed-purple cursor-pointer select-none hover:brightness-125 flex items-center gap-1">
        <Brain className="w-3 h-3" /> {label}
      </summary>
      <ul className="mt-1.5 space-y-1">
        {lines.map((l, i) => <li key={i} className="text-[11px] text-wed-gray-400 leading-relaxed">• {l}</li>)}
      </ul>
    </details>
  );
}

export function OnboardingWizard({ onStageChange }: { onStageChange?: (stage: OnboardingStage) => void }) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormState>(INITIAL);
  const [error, setError] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState<AiResult | null>(null);
  const [loadingExisting, setLoadingExisting] = useState(true);
  const [regenerating, setRegenerating] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Returning users with a stored plan land straight on their profile reveal.
    fetch('/api/ai/plan')
      .then((r) => r.json())
      .then((data) => {
        if (data.aiPlan && data.athleteProfile && data.aiNutritionPlan) {
          setResult({ athleteProfile: data.athleteProfile, aiPlan: data.aiPlan, aiNutritionPlan: data.aiNutritionPlan });
        }
      })
      .catch(() => {})
      .finally(() => setLoadingExisting(false));
  }, []);

  useEffect(() => {
    onStageChange?.(generating ? 'generating' : result ? 'result' : Math.min(step, 4));
  }, [generating, result, step, onStageChange]);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
    setError(null);
  };
  const toggleIn = (key: 'goalsRanked' | 'equipmentCards' | 'foodHabits' | 'proteinSources', value: string) => {
    const list = form[key] as string[];
    set(key, (list.includes(value) ? list.filter((v) => v !== value) : [...list, value]) as never);
  };

  const stepValid = (): string | null => {
    switch (step) {
      case 0: return form.physique ? null : 'Choose the physique you want to build.';
      case 1: return form.goalsRanked.length > 0 ? null : 'Pick at least one goal — tap in priority order.';
      case 2: return form.trainingStyle ? null : 'Choose your training style.';
      case 3: return form.equipmentCards.length > 0 ? null : 'Select your equipment situation.';
      case 4: return form.experienceTier ? null : 'Select your experience level.';
      case 5: {
        if (!form.name.trim()) return 'Enter your name.';
        const age = Number(form.ageStr), h = Number(form.heightStr), w = Number(form.weightStr), s = Number(form.sleepStr);
        if (!age || age < 10 || age > 100) return 'Enter a valid age (10–100).';
        if (!h || h < 100 || h > 250) return 'Enter a valid height in cm (100–250).';
        if (!w || w < 30 || w > 300) return 'Enter a valid weight in kg (30–300).';
        if (!s || s < 3 || s > 14) return 'Enter your average sleep hours (3–14).';
        return null;
      }
      default: return null;
    }
  };

  const next = () => {
    const problem = stepValid();
    if (problem) return setError(problem);
    setStep((s) => Math.min(s + 1, 6));
  };
  const back = () => setStep((s) => Math.max(s - 1, 0));

  const buildPayload = (): AiOnboardingInput => ({
    physique: form.physique as AiOnboardingInput['physique'],
    goalsRanked: form.goalsRanked,
    trainingStyle: form.trainingStyle as AiOnboardingInput['trainingStyle'],
    equipmentCards: form.equipmentCards,
    experienceTier: form.experienceTier as AiOnboardingInput['experienceTier'],
    name: form.name.trim(),
    age: Number(form.ageStr),
    gender: form.gender,
    heightCm: Number(form.heightStr),
    weightKg: Number(form.weightStr),
    bodyFatPct: form.bodyFatStr ? Number(form.bodyFatStr) : null,
    occupation: form.occupation,
    sleepHours: Number(form.sleepStr),
    stressLevel: form.stressLevel,
    daysPerWeek: form.daysPerWeek,
    sessionMinutes: form.sessionMinutes,
    injuries: form.injuries,
    medicalNotes: form.medicalNotes,
    foodHabits: form.foodHabits,
    proteinSources: form.proteinSources,
    foodsAvoided: form.foodsAvoided,
    allergies: form.allergies,
    cookingAbility: form.cookingAbility,
    mealsPerDay: form.mealsPerDay,
    waterHabit: form.waterHabit,
    supplements: form.supplements,
  });

  const submit = async () => {
    const problem = stepValid();
    if (problem) return setError(problem);
    const payload = buildPayload();
    const parsed = aiOnboardingSchema.safeParse(payload);
    if (!parsed.success) {
      setError(parsed.error.issues[0].message);
      return;
    }
    setError(null);
    setGenerating(true);
    const started = Date.now();
    try {
      const res = await fetch('/api/ai/plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Plan generation failed.');
      // Let the forging moment breathe even on fast responses.
      const wait = Math.max(0, 1400 - (Date.now() - started));
      await new Promise((r) => setTimeout(r, wait));
      setResult(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not save your assessment — check your connection and try again.');
    } finally {
      setGenerating(false);
    }
  };

  const regenerate = async () => {
    setRegenerating(true);
    setError(null);
    try {
      const res = await fetch('/api/ai/plan', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Regeneration failed.');
      setResult(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Regeneration failed.');
    } finally {
      setRegenerating(false);
    }
  };

  if (!mounted || loadingExisting) return null;

  // ── Generating splash ───────────────────────────────────
  if (generating) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
          className="w-16 h-16 rounded-full border-2 border-wed-purple border-t-transparent mb-6" />
        <h2 className="text-2xl font-black text-white mb-2">Analyzing Your Profile…</h2>
        <p className="text-wed-gray-400 text-sm">Physique · goals · equipment · recovery · nutrition — every choice is being reasoned, not randomized.</p>
      </div>
    );
  }

  // ── Result: the athlete profile reveal ──────────────────
  if (result) {
    const { athleteProfile: ap, aiPlan, aiNutritionPlan: np } = result;
    const physique = physiques.find((p) => p.id === ap.physique);
    return (
      <div className="max-w-3xl mx-auto space-y-6 pb-16">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-wed-lime/10 border border-wed-lime/30 text-wed-lime text-xs font-semibold mb-4">
            <Sparkles className="w-3.5 h-3.5" /> Athlete Profile Forged
          </div>
          <h2 className="text-3xl font-black text-white mb-1">{aiPlan.name}</h2>
          <p className="text-wed-gray-400 text-sm">
            {physique?.name} · {ap.capacity.effectiveDays} days/week · {ap.capacity.sessionMinutes} min sessions
          </p>
        </motion.div>

        {/* Athlete profile card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="glass rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2"><Brain className="w-4 h-4 text-wed-purple" /> Athlete Analysis</h3>
            <span className="text-xs px-2 py-1 rounded-full bg-wed-purple/15 text-wed-purple font-semibold">Recovery {ap.recoveryScore}/100</span>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <p className="text-[11px] uppercase tracking-wide text-wed-lime mb-1.5">Strengths</p>
              {ap.strengths.map((s) => <p key={s} className="text-xs text-wed-gray-300 mb-1">+ {s}</p>)}
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-wide text-wed-pink mb-1.5">Watch-outs</p>
              {ap.weaknesses.length === 0 && <p className="text-xs text-wed-gray-500">Nothing flagged.</p>}
              {ap.weaknesses.map((w) => <p key={w} className="text-xs text-wed-gray-300 mb-1">− {w}</p>)}
            </div>
          </div>
          {ap.warnings.length > 0 && (
            <div className="mt-3 rounded-xl border border-yellow-500/30 bg-yellow-500/10 p-3 space-y-1">
              {ap.warnings.map((w) => (
                <p key={w} className="text-xs text-yellow-300 flex items-start gap-1.5"><ShieldAlert className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" /> {w}</p>
              ))}
            </div>
          )}
          <WhyDetails lines={renderAll(ap.reasoning)} label="How this was computed" />
        </motion.div>

        {/* Nutrition targets strip */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="grid grid-cols-3 gap-3">
          {[
            { icon: Flame, label: 'Calories', value: `${np.targets.calories.toLocaleString()} kcal` },
            { icon: Beef, label: 'Protein', value: `${np.targets.proteinG} g` },
            { icon: Droplets, label: 'Water', value: `${(np.targets.waterMl / 1000).toFixed(1)} L` },
          ].map((t) => (
            <div key={t.label} className="glass rounded-2xl p-4 text-center">
              <t.icon className="w-5 h-5 mx-auto mb-1.5 text-wed-purple" />
              <p className="text-lg font-bold text-white">{t.value}</p>
              <p className="text-xs text-wed-gray-400">{t.label}</p>
            </div>
          ))}
        </motion.div>

        {/* Workout plan with per-exercise Why */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="space-y-3">
          <div className="glass rounded-2xl p-4">
            <h3 className="text-sm font-bold text-white mb-2">Why this split?</h3>
            <ul className="space-y-1">
              {renderAll(aiPlan.reasoning).map((l, i) => <li key={i} className="text-xs text-wed-gray-400">• {l}</li>)}
            </ul>
            <div className="mt-2 pt-2 border-t border-white/5 space-y-1">
              {aiPlan.validations.map((v, i) => (
                <p key={i} className={cn('text-[11px]', v.startsWith('✓') ? 'text-wed-lime' : 'text-yellow-300')}>{v}</p>
              ))}
            </div>
          </div>
          {aiPlan.days.map((day, i) => (
            <div key={day.name} className="glass rounded-2xl p-5">
              <h3 className="font-bold text-white mb-3"><span className="text-wed-purple mr-2">Day {i + 1}</span>{day.name}</h3>
              <div className="space-y-2.5">
                {day.exercises.map((ex) => (
                  <div key={ex.id} className="border-b border-white/5 pb-2 last:border-0 last:pb-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-white">{ex.name}</p>
                      <p className="text-xs text-wed-gray-400">{ex.sets} × {ex.reps} · rest {ex.rest}</p>
                    </div>
                    <WhyDetails lines={renderAll(ex.reasoning)} />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </motion.div>

        {/* Nutrition plan */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass rounded-2xl p-5 space-y-3">
          <h3 className="text-sm font-bold text-white">Nutrition Plan <span className="ml-2 text-[11px] font-normal px-2 py-0.5 rounded-full bg-white/5 text-wed-gray-400 capitalize">{np.budgetTier} budget · inferred</span></h3>
          <div className="grid sm:grid-cols-2 gap-2">
            {np.meals.map((m) => (
              <div key={m.name} className="rounded-xl bg-white/5 p-3">
                <p className="text-xs font-semibold text-white mb-1">{m.name}</p>
                <p className="text-[11px] text-wed-gray-400 leading-relaxed">{m.description}</p>
              </div>
            ))}
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-wide text-wed-gray-500 mb-1">Meal timing</p>
            {np.timing.map((t, i) => <p key={i} className="text-xs text-wed-gray-300 mb-1">• {t}</p>)}
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-wide text-wed-gray-500 mb-1">Supplements</p>
            {np.supplements.map((s, i) => <p key={i} className="text-xs text-wed-gray-300 mb-1">• {s}</p>)}
          </div>
          <WhyDetails lines={renderAll(np.reasoning)} label="How this was computed" />
        </motion.div>

        {error && <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">{error}</p>}

        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <button onClick={() => router.replace('/dashboard')}
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-wed-lime text-wed-black font-bold hover:brightness-110 transition-all">
            Enter Dashboard <ArrowRight className="w-4 h-4" />
          </button>
          <button onClick={regenerate} disabled={regenerating}
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-white/10 text-wed-gray-300 hover:bg-white/5 transition-all disabled:opacity-50">
            <RefreshCw className={cn('w-4 h-4', regenerating && 'animate-spin')} /> Regenerate Plan
          </button>
          <button onClick={() => { setResult(null); setStep(0); }}
            className="px-6 py-3 rounded-xl border border-white/10 text-wed-gray-300 hover:bg-white/5 transition-all">
            Retake Assessment
          </button>
        </div>
      </div>
    );
  }

  // ── Wizard steps ────────────────────────────────────────
  const progress = ((step + 1) / 7) * 100;

  return (
    <div className="max-w-2xl mx-auto w-full pb-16">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-1">Build Your Athlete Profile</h2>
        <p className="text-wed-gray-400 text-sm">Step {step + 1} of 7 — {STEP_TITLES[step]}</p>
        <div className="h-1 rounded-full bg-white/10 mt-4">
          <motion.div className="h-full rounded-full bg-gradient-purple" animate={{ width: `${progress}%` }} transition={{ duration: 0.3 }} />
        </div>
      </div>

      <div className="glass rounded-2xl p-6 md:p-8">
        {/* Keyed remount per step; deliberately NO AnimatePresence exit animation
            (its mode="wait" transition is known to wedge in this app). */}
        <motion.div key={step} initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.25 }} className="space-y-5">
          {step === 0 && (
            <div className="grid sm:grid-cols-2 gap-3">
              {physiques.map((p) => {
                const Art = PHYSIQUE_ART[p.silhouette];
                const active = form.physique === p.id;
                return (
                  <button key={p.id} type="button" onClick={() => set('physique', p.id)}
                    className={cn('text-left rounded-2xl border p-4 transition-all',
                      active ? 'border-wed-purple bg-wed-purple/10 shadow-[0_0_20px_rgba(176,38,255,0.2)]' : 'border-white/10 bg-white/5 hover:border-white/25')}>
                    <div className="h-28 mb-2">{Art && <Art color={active ? '#ccff00' : ACCENT} />}</div>
                    <p className="font-bold text-white text-sm">{p.name}</p>
                    <p className="text-[11px] text-wed-gray-400 mt-1 leading-relaxed">{p.description}</p>
                    <div className="flex items-center gap-2 mt-2 text-[10px] text-wed-gray-500">
                      <span>Difficulty {'★'.repeat(p.difficulty)}{'☆'.repeat(5 - p.difficulty)}</span>
                      <span>· {p.estimatedYears}</span>
                    </div>
                    {active && (
                      <div className="mt-2 pt-2 border-t border-white/10 space-y-1">
                        <p className="text-[11px] text-wed-gray-300 italic">{p.philosophy}</p>
                        <p className="text-[10px] text-wed-lime">{p.advantages.join(' · ')}</p>
                        <p className="text-[10px] text-wed-gray-400">{p.characteristics.join(' · ')}</p>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {step === 1 && (
            <>
              <p className="text-xs text-wed-gray-400 -mt-1">Tap in priority order — your first pick leads the programming.</p>
              <div className="flex flex-wrap gap-2">
                {Object.values(goalProfiles).map((g) => {
                  const rank = form.goalsRanked.indexOf(g.id);
                  return (
                    <Chip key={g.id} active={rank !== -1} badge={rank !== -1 ? String(rank + 1) : undefined}
                      onClick={() => toggleIn('goalsRanked', g.id)}>
                      {g.label}
                    </Chip>
                  );
                })}
              </div>
              {form.goalsRanked[0] && (
                <p className="text-xs text-wed-gray-400">
                  Primary: <span className="text-white font-semibold">{goalProfiles[form.goalsRanked[0] as keyof typeof goalProfiles].label}</span>
                  {' — '}{goalProfiles[form.goalsRanked[0] as keyof typeof goalProfiles].progressionScheme}
                </p>
              )}
            </>
          )}

          {step === 2 && (
            <div className="grid sm:grid-cols-2 gap-3">
              {trainingStyles.map((s) => (
                <button key={s.id} type="button" onClick={() => set('trainingStyle', s.id)}
                  className={cn('text-left rounded-2xl border p-4 transition-all',
                    form.trainingStyle === s.id ? 'border-wed-purple bg-wed-purple/10' : 'border-white/10 bg-white/5 hover:border-white/25')}>
                  <p className="font-bold text-white text-sm">{s.name}</p>
                  <p className="text-[11px] text-wed-gray-400 mt-1">{s.description}</p>
                </button>
              ))}
            </div>
          )}

          {step === 3 && (
            <>
              <p className="text-xs text-wed-gray-400 -mt-1">Pick every card that matches your reality — the engine only programs exercises your setup allows.</p>
              <div className="grid sm:grid-cols-2 gap-3">
                {equipmentCards.map((c) => {
                  const active = form.equipmentCards.includes(c.id);
                  return (
                    <button key={c.id} type="button" onClick={() => toggleIn('equipmentCards', c.id)}
                      className={cn('text-left rounded-2xl border p-4 transition-all flex items-start gap-3',
                        active ? 'border-wed-purple bg-wed-purple/10' : 'border-white/10 bg-white/5 hover:border-white/25')}>
                      <span className="text-2xl">{c.icon}</span>
                      <span>
                        <p className="font-bold text-white text-sm flex items-center gap-1.5">{c.name}{active && <CheckCircle2 className="w-3.5 h-3.5 text-wed-lime" />}</p>
                        <p className="text-[11px] text-wed-gray-400 mt-0.5">{c.description}</p>
                      </span>
                    </button>
                  );
                })}
              </div>
            </>
          )}

          {step === 4 && (
            <div className="space-y-3">
              {Object.values(experienceProfiles).map((e) => (
                <button key={e.tier} type="button" onClick={() => set('experienceTier', e.tier)}
                  className={cn('w-full text-left rounded-2xl border p-4 transition-all',
                    form.experienceTier === e.tier ? 'border-wed-purple bg-wed-purple/10' : 'border-white/10 bg-white/5 hover:border-white/25')}>
                  <p className="font-bold text-white text-sm">{e.label}</p>
                  <p className="text-[11px] text-wed-gray-400 mt-0.5">{e.description}</p>
                </button>
              ))}
            </div>
          )}

          {step === 5 && (
            <>
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Name"><input className={inputCls} value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="Your name" /></Field>
                <Field label="Age"><input type="number" className={inputCls} value={form.ageStr} onChange={(e) => set('ageStr', e.target.value)} placeholder="22" /></Field>
                <Field label="Gender">
                  <div className="flex gap-2">
                    {(['MALE', 'FEMALE', 'OTHER'] as const).map((g) => (
                      <Chip key={g} active={form.gender === g} onClick={() => set('gender', g)}>{g.charAt(0) + g.slice(1).toLowerCase()}</Chip>
                    ))}
                  </div>
                </Field>
                <Field label="Estimated body fat %" optional><input type="number" className={inputCls} value={form.bodyFatStr} onChange={(e) => set('bodyFatStr', e.target.value)} placeholder="18" /></Field>
                <Field label="Height (cm)"><input type="number" className={inputCls} value={form.heightStr} onChange={(e) => set('heightStr', e.target.value)} placeholder="175" /></Field>
                <Field label="Weight (kg)"><input type="number" className={inputCls} value={form.weightStr} onChange={(e) => set('weightStr', e.target.value)} placeholder="70" /></Field>
                <Field label="Sleep (hours/night)"><input type="number" step="0.5" className={inputCls} value={form.sleepStr} onChange={(e) => set('sleepStr', e.target.value)} placeholder="7.5" /></Field>
                <Field label="Stress level">
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((n) => <Chip key={n} active={form.stressLevel === n} onClick={() => set('stressLevel', n)}>{n}</Chip>)}
                  </div>
                </Field>
              </div>
              <Field label="Occupation / daily activity">
                <div className="flex flex-wrap gap-2">
                  {([['sedentary-job', 'Desk job'], ['active-job', 'On my feet'], ['physical-job', 'Physical labor'], ['student', 'Student'], ['shift-work', 'Shift work']] as const).map(([id, label]) => (
                    <Chip key={id} active={form.occupation === id} onClick={() => set('occupation', id)}>{label}</Chip>
                  ))}
                </div>
              </Field>
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label={`Training days per week — ${form.daysPerWeek}`}>
                  <input type="range" min={1} max={7} value={form.daysPerWeek} onChange={(e) => set('daysPerWeek', Number(e.target.value))} className="w-full accent-[#b026ff]" />
                </Field>
                <Field label={`Session length — ${form.sessionMinutes} min`}>
                  <input type="range" min={15} max={120} step={15} value={form.sessionMinutes} onChange={(e) => set('sessionMinutes', Number(e.target.value))} className="w-full accent-[#b026ff]" />
                </Field>
              </div>
              <Field label="Past injuries" optional><input className={inputCls} value={form.injuries} onChange={(e) => set('injuries', e.target.value)} placeholder="e.g. lower back strain (2023)" /></Field>
              <Field label="Medical notes" optional><input className={inputCls} value={form.medicalNotes} onChange={(e) => set('medicalNotes', e.target.value)} placeholder="Anything your coach should know" /></Field>
            </>
          )}

          {step === 6 && (
            <>
              <Field label="How do you usually eat? (pick all that apply)">
                <div className="flex flex-wrap gap-2">
                  {foodHabits.map((h) => (
                    <Chip key={h.id} active={form.foodHabits.includes(h.id)} onClick={() => toggleIn('foodHabits', h.id)}>{h.label}</Chip>
                  ))}
                </div>
              </Field>
              <Field label="Protein sources you actually eat">
                <div className="flex flex-wrap gap-2">
                  {proteinSources.map((s) => (
                    <Chip key={s.id} active={form.proteinSources.includes(s.id)} onClick={() => toggleIn('proteinSources', s.id)}>{s.label}</Chip>
                  ))}
                </div>
              </Field>
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Foods you avoid" optional><input className={inputCls} value={form.foodsAvoided} onChange={(e) => set('foodsAvoided', e.target.value)} placeholder="e.g. red meat, dairy" /></Field>
                <Field label="Food allergies" optional><input className={inputCls} value={form.allergies} onChange={(e) => set('allergies', e.target.value)} placeholder="e.g. peanuts" /></Field>
                <Field label="Cooking ability">
                  <div className="flex gap-2">
                    {([['low', 'Minimal'], ['medium', 'Can cook'], ['high', 'Confident']] as const).map(([id, label]) => (
                      <Chip key={id} active={form.cookingAbility === id} onClick={() => set('cookingAbility', id)}>{label}</Chip>
                    ))}
                  </div>
                </Field>
                <Field label={`Meals per day — ${form.mealsPerDay}`}>
                  <input type="range" min={2} max={6} value={form.mealsPerDay} onChange={(e) => set('mealsPerDay', Number(e.target.value))} className="w-full accent-[#b026ff]" />
                </Field>
                <Field label="Water intake">
                  <div className="flex gap-2">
                    {([['low', 'Barely any'], ['moderate', 'Some'], ['high', 'Plenty']] as const).map(([id, label]) => (
                      <Chip key={id} active={form.waterHabit === id} onClick={() => set('waterHabit', id)}>{label}</Chip>
                    ))}
                  </div>
                </Field>
                <Field label="Supplements you already use" optional><input className={inputCls} value={form.supplements} onChange={(e) => set('supplements', e.target.value)} placeholder="e.g. whey, creatine" /></Field>
              </div>
            </>
          )}
        </motion.div>

        {error && <p className="mt-4 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">{error}</p>}

        <div className="flex justify-between mt-8">
          <button onClick={back} disabled={step === 0}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/10 text-wed-gray-300 hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-all text-sm">
            <ChevronLeft className="w-4 h-4" /> Back
          </button>
          {step < 6 ? (
            <button onClick={next}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-wed-purple text-white font-semibold hover:brightness-110 transition-all text-sm">
              Next <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button onClick={submit}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-wed-lime text-wed-black font-bold hover:brightness-110 transition-all text-sm">
              <Sparkles className="w-4 h-4" /> Analyze & Generate
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
