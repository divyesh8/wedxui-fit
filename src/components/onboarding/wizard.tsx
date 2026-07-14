'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Sparkles, Flame, Droplets, Beef, RotateCcw, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  onboardingSchema,
  STEP_FIELDS,
  GOALS,
  EXPERIENCE_LEVELS,
  EQUIPMENT_OPTIONS,
  MUSCLE_OPTIONS,
  DIETS,
  type OnboardingProfile,
} from '@/lib/validations/onboarding';
import { generatePlan } from '@/lib/plan-generator';
import { useProfileStore } from '@/store/profile';
import type { OnboardingStage } from '@/components/onboarding/hero-panel';

const STEP_TITLES = ['Identity', 'Body Metrics', 'Goal & Experience', 'Training Setup', 'Lifestyle'];

type FormState = {
  name: string;
  age: string;
  gender: OnboardingProfile['gender'] | '';
  heightCm: string;
  weightKg: string;
  bodyFatPct: string;
  goal: OnboardingProfile['goal'] | '';
  experience: OnboardingProfile['experience'] | '';
  equipment: string[];
  daysPerWeek: number;
  sessionMinutes: number;
  targetMuscles: string[];
  sleepHours: string;
  diet: OnboardingProfile['diet'] | '';
  injuries: string;
  medicalNotes: string;
};

const INITIAL_FORM: FormState = {
  name: '',
  age: '',
  gender: '',
  heightCm: '',
  weightKg: '',
  bodyFatPct: '',
  goal: '',
  experience: '',
  equipment: [],
  daysPerWeek: 4,
  sessionMinutes: 60,
  targetMuscles: [],
  sleepHours: '',
  diet: '',
  injuries: '',
  medicalNotes: '',
};

function toProfileInput(form: FormState) {
  return {
    ...form,
    bodyFatPct: form.bodyFatPct === '' ? null : form.bodyFatPct,
  };
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'px-4 py-2.5 rounded-xl border text-sm font-medium transition-all',
        active
          ? 'border-wed-purple bg-wed-purple/20 text-white shadow-[0_0_16px_rgba(176,38,255,0.25)]'
          : 'border-white/10 bg-white/5 text-wed-gray-300 hover:border-white/25 hover:text-white'
      )}
    >
      {children}
    </button>
  );
}

function FieldLabel({ children, optional }: { children: React.ReactNode; optional?: boolean }) {
  return (
    <label className="block text-sm font-medium text-wed-gray-200 mb-1.5">
      {children}
      {optional && <span className="ml-2 text-xs text-wed-gray-500">optional</span>}
    </label>
  );
}

function TextField(props: React.InputHTMLAttributes<HTMLInputElement> & { error?: string }) {
  const { error, className, ...rest } = props;
  return (
    <div>
      <input
        {...rest}
        className={cn(
          'w-full h-11 px-4 rounded-xl bg-white/5 border text-white placeholder:text-wed-gray-500 focus:outline-none transition-colors',
          error ? 'border-red-500/60' : 'border-white/10 focus:border-wed-purple',
          className
        )}
      />
      {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
    </div>
  );
}

export function OnboardingWizard({ onStageChange }: { onStageChange?: (stage: OnboardingStage) => void }) {
  const router = useRouter();
  const { profile, plan, targets, onboardedAt, completeOnboarding, resetOnboarding } = useProfileStore();

  const [mounted, setMounted] = useState(false);
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [errors, setErrors] = useState<Partial<Record<keyof OnboardingProfile, string>>>({});
  const [generating, setGenerating] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);

  useEffect(() => setMounted(true), []);

  // Keep the anime stage panel in sync with the wizard.
  const isResult = Boolean(mounted && onboardedAt && plan && profile && !generating);
  useEffect(() => {
    onStageChange?.(generating ? 'generating' : isResult ? 'result' : step);
  }, [generating, isResult, step, onStageChange]);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const toggle = (key: 'equipment' | 'targetMuscles', value: string) =>
    set(key, form[key].includes(value) ? form[key].filter((v) => v !== value) : [...form[key], value]);

  /** Validate only the current step's fields; returns true if clean. */
  const validateStep = (): boolean => {
    const result = onboardingSchema.safeParse(toProfileInput(form));
    if (result.success) return true;
    const stepFields = STEP_FIELDS[step];
    const stepErrors: typeof errors = {};
    for (const issue of result.error.issues) {
      const field = issue.path[0] as keyof OnboardingProfile;
      if (stepFields.includes(field) && !stepErrors[field]) stepErrors[field] = issue.message;
    }
    setErrors(stepErrors);
    return Object.keys(stepErrors).length === 0;
  };

  const next = () => validateStep() && setStep((s) => Math.min(s + 1, STEP_TITLES.length - 1));
  const back = () => setStep((s) => Math.max(s - 1, 0));

  const submit = () => {
    const result = onboardingSchema.safeParse(toProfileInput(form));
    if (!result.success) {
      validateStep();
      return;
    }
    setSyncError(null);
    setGenerating(true);
    // Persist to Neon and hold the "forging" animation for at least 1.4s so
    // the reveal doesn't feel instant even on a fast connection.
    const persist = fetch('/api/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(result.data),
    });
    const pause = new Promise((resolve) => setTimeout(resolve, 1400));
    Promise.all([persist, pause])
      .then(([res]) => {
        if (!res.ok) throw new Error('save failed');
        const generated = generatePlan(result.data);
        completeOnboarding(result.data, generated.plan, generated.targets);
      })
      .catch(() => {
        setSyncError('We generated your protocol but could not save it to your account. Check your connection and try again.');
      })
      .finally(() => setGenerating(false));
  };

  if (!mounted) return null;

  // ── Result view (already onboarded) ─────────────────────
  if (onboardedAt && plan && profile && !generating) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-wed-lime/10 border border-wed-lime/30 text-wed-lime text-xs font-semibold mb-4">
            <Sparkles className="w-3.5 h-3.5" /> Protocol Generated
          </div>
          <h2 className="text-3xl font-black text-white mb-2">{plan.name}</h2>
          <p className="text-wed-gray-400">
            Built for {profile.name} · {profile.daysPerWeek} days/week · {profile.sessionMinutes} min sessions
          </p>
        </motion.div>

        {targets && (
          <div className="grid grid-cols-3 gap-4">
            {[
              { icon: Flame, label: 'Daily Calories', value: `${targets.calories.toLocaleString()} kcal`, color: 'text-wed-purple' },
              { icon: Beef, label: 'Protein Target', value: `${targets.proteinG} g`, color: 'text-wed-blue' },
              { icon: Droplets, label: 'Water Target', value: `${(targets.waterMl / 1000).toFixed(1)} L`, color: 'text-wed-lime' },
              // Macro fields only exist on plans generated after the nutrition-engine upgrade.
              ...(targets.carbsG != null
                ? [
                    { icon: Flame, label: 'Carbs', value: `${targets.carbsG} g`, color: 'text-wed-pink' },
                    { icon: Flame, label: 'Fat', value: `${targets.fatG} g`, color: 'text-wed-blue' },
                    { icon: Flame, label: 'Fiber', value: `${targets.fiberG} g`, color: 'text-wed-lime' },
                  ]
                : []),
            ].map((t, i) => (
              <motion.div
                key={t.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.1 }}
                className="glass rounded-2xl p-4 text-center"
              >
                <t.icon className={cn('w-5 h-5 mx-auto mb-2', t.color)} />
                <p className="text-lg font-bold text-white">{t.value}</p>
                <p className="text-xs text-wed-gray-400">{t.label}</p>
              </motion.div>
            ))}
          </div>
        )}

        {targets && targets.warnings != null && targets.warnings.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="rounded-2xl border border-yellow-500/30 bg-yellow-500/10 p-4 space-y-1"
          >
            {targets.warnings.map((w) => (
              <p key={w} className="text-sm text-yellow-300">⚠ {w}</p>
            ))}
          </motion.div>
        )}

        <div className="space-y-3">
          {plan.days.map((day, i) => (
            <motion.div
              key={day.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.08 }}
              className="glass rounded-2xl p-5"
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-white">
                  <span className="text-wed-purple mr-2">Day {i + 1}</span>
                  {day.name}
                </h3>
                <span className="text-xs text-wed-gray-500">{day.exercises.length} exercises</span>
              </div>
              <div className="space-y-2">
                {day.exercises.map((ex) => (
                  <div key={ex.name} className="flex items-center justify-between text-sm py-1.5 border-b border-white/5 last:border-0">
                    <span className="text-wed-gray-200">{ex.name}</span>
                    <span className="text-wed-gray-500 text-xs">
                      {ex.sets} × {ex.reps} · rest {ex.rest}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        <div className="flex items-center justify-center gap-3 pb-8">
          <button
            onClick={() => {
              resetOnboarding();
              setForm(INITIAL_FORM);
              setStep(0);
            }}
            className="flex items-center gap-2 px-5 py-3 rounded-xl border border-white/10 text-wed-gray-300 hover:bg-white/5 transition-all text-sm"
          >
            <RotateCcw className="w-4 h-4" /> Retake Assessment
          </button>
          <button
            onClick={() => router.push('/dashboard')}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-purple text-white font-bold hover:brightness-110 transition-all btn-glow"
          >
            Enter Dashboard <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  // ── Generating view ─────────────────────────────────────
  if (generating) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
          className="w-16 h-16 rounded-full border-2 border-wed-purple border-t-transparent mb-6"
        />
        <h2 className="text-2xl font-black text-white mb-2">Forging Your Protocol…</h2>
        <p className="text-wed-gray-400 text-sm">Analyzing goals, equipment, and recovery capacity.</p>
      </div>
    );
  }

  // ── Wizard view ─────────────────────────────────────────
  const progress = ((step + 1) / STEP_TITLES.length) * 100;

  return (
    <div className="max-w-2xl mx-auto w-full">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-1">Forge Your Profile</h2>
        <p className="text-wed-gray-400 text-sm">
          Step {step + 1} of {STEP_TITLES.length} — {STEP_TITLES[step]}
        </p>
        <div className="h-1 rounded-full bg-white/10 mt-4">
          <motion.div className="h-full rounded-full bg-gradient-purple" animate={{ width: `${progress}%` }} transition={{ duration: 0.3 }} />
        </div>
      </div>

      <div className="glass rounded-2xl p-6 md:p-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.25 }}
            className="space-y-5"
          >
            {step === 0 && (
              <>
                <div>
                  <FieldLabel>Name</FieldLabel>
                  <TextField value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="Alex" error={errors.name} />
                </div>
                <div>
                  <FieldLabel>Age</FieldLabel>
                  <TextField type="number" value={form.age} onChange={(e) => set('age', e.target.value)} placeholder="22" error={errors.age} />
                </div>
                <div>
                  <FieldLabel>Gender</FieldLabel>
                  <div className="flex flex-wrap gap-2">
                    {(['MALE', 'FEMALE', 'OTHER'] as const).map((g) => (
                      <Chip key={g} active={form.gender === g} onClick={() => set('gender', g)}>
                        {g.charAt(0) + g.slice(1).toLowerCase()}
                      </Chip>
                    ))}
                  </div>
                  {errors.gender && <p className="mt-1 text-xs text-red-400">Select a gender</p>}
                </div>
              </>
            )}

            {step === 1 && (
              <>
                <div>
                  <FieldLabel>Height (cm)</FieldLabel>
                  <TextField type="number" value={form.heightCm} onChange={(e) => set('heightCm', e.target.value)} placeholder="175" error={errors.heightCm} />
                </div>
                <div>
                  <FieldLabel>Weight (kg)</FieldLabel>
                  <TextField type="number" value={form.weightKg} onChange={(e) => set('weightKg', e.target.value)} placeholder="70" error={errors.weightKg} />
                </div>
                <div>
                  <FieldLabel optional>Body Fat %</FieldLabel>
                  <TextField type="number" value={form.bodyFatPct} onChange={(e) => set('bodyFatPct', e.target.value)} placeholder="18" error={errors.bodyFatPct} />
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <div>
                  <FieldLabel>Primary Goal</FieldLabel>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {GOALS.map((g) => (
                      <button
                        key={g.value}
                        type="button"
                        onClick={() => set('goal', g.value)}
                        className={cn(
                          'p-4 rounded-xl border text-center transition-all',
                          form.goal === g.value
                            ? 'border-wed-purple bg-wed-purple/20 shadow-[0_0_16px_rgba(176,38,255,0.25)]'
                            : 'border-white/10 bg-white/5 hover:border-white/25'
                        )}
                      >
                        <div className="text-2xl mb-1">{g.icon}</div>
                        <div className="text-xs font-semibold text-white">{g.label}</div>
                      </button>
                    ))}
                  </div>
                  {errors.goal && <p className="mt-1 text-xs text-red-400">Pick a goal</p>}
                </div>
                <div>
                  <FieldLabel>Experience</FieldLabel>
                  <div className="grid sm:grid-cols-3 gap-2">
                    {EXPERIENCE_LEVELS.map((lvl) => (
                      <button
                        key={lvl.value}
                        type="button"
                        onClick={() => set('experience', lvl.value)}
                        className={cn(
                          'p-3 rounded-xl border text-center transition-all',
                          form.experience === lvl.value
                            ? 'border-wed-blue bg-wed-blue/20 shadow-[0_0_16px_rgba(0,212,255,0.2)]'
                            : 'border-white/10 bg-white/5 hover:border-white/25'
                        )}
                      >
                        <div className="text-sm font-semibold text-white">{lvl.label}</div>
                        <div className="text-[11px] text-wed-gray-400">{lvl.hint}</div>
                      </button>
                    ))}
                  </div>
                  {errors.experience && <p className="mt-1 text-xs text-red-400">Pick your experience level</p>}
                </div>
              </>
            )}

            {step === 3 && (
              <>
                <div>
                  <FieldLabel>Available Equipment</FieldLabel>
                  <div className="flex flex-wrap gap-2">
                    {EQUIPMENT_OPTIONS.map((eq) => (
                      <Chip key={eq.value} active={form.equipment.includes(eq.value)} onClick={() => toggle('equipment', eq.value)}>
                        {eq.label}
                      </Chip>
                    ))}
                  </div>
                  {errors.equipment && <p className="mt-1 text-xs text-red-400">{errors.equipment}</p>}
                </div>
                <div>
                  <FieldLabel>Workout Days / Week</FieldLabel>
                  <div className="flex flex-wrap gap-2">
                    {[2, 3, 4, 5, 6].map((d) => (
                      <Chip key={d} active={form.daysPerWeek === d} onClick={() => set('daysPerWeek', d)}>
                        {d} days
                      </Chip>
                    ))}
                  </div>
                </div>
                <div>
                  <FieldLabel>Session Duration</FieldLabel>
                  <div className="flex flex-wrap gap-2">
                    {[30, 45, 60, 90, 120].map((m) => (
                      <Chip key={m} active={form.sessionMinutes === m} onClick={() => set('sessionMinutes', m)}>
                        {m} min
                      </Chip>
                    ))}
                  </div>
                </div>
                <div>
                  <FieldLabel optional>Priority Muscles</FieldLabel>
                  <div className="flex flex-wrap gap-2">
                    {MUSCLE_OPTIONS.map((m) => (
                      <Chip key={m.value} active={form.targetMuscles.includes(m.value)} onClick={() => toggle('targetMuscles', m.value)}>
                        {m.label}
                      </Chip>
                    ))}
                  </div>
                </div>
              </>
            )}

            {step === 4 && (
              <>
                <div>
                  <FieldLabel>Sleep (hours / night)</FieldLabel>
                  <TextField type="number" value={form.sleepHours} onChange={(e) => set('sleepHours', e.target.value)} placeholder="7" error={errors.sleepHours} />
                </div>
                <div>
                  <FieldLabel>Diet Preference</FieldLabel>
                  <div className="flex flex-wrap gap-2">
                    {DIETS.map((d) => (
                      <Chip key={d.value} active={form.diet === d.value} onClick={() => set('diet', d.value)}>
                        {d.label}
                      </Chip>
                    ))}
                  </div>
                  {errors.diet && <p className="mt-1 text-xs text-red-400">Pick a diet preference</p>}
                </div>
                <div>
                  <FieldLabel optional>Injuries</FieldLabel>
                  <textarea
                    value={form.injuries}
                    onChange={(e) => set('injuries', e.target.value)}
                    placeholder="e.g. left knee — avoid deep squats"
                    rows={2}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-wed-gray-500 focus:border-wed-purple focus:outline-none text-sm"
                  />
                </div>
                <div>
                  <FieldLabel optional>Medical Notes</FieldLabel>
                  <textarea
                    value={form.medicalNotes}
                    onChange={(e) => set('medicalNotes', e.target.value)}
                    placeholder="Anything your coach should know"
                    rows={2}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-wed-gray-500 focus:border-wed-purple focus:outline-none text-sm"
                  />
                </div>
              </>
            )}
          </motion.div>
        </AnimatePresence>

        {syncError && (
          <p className="mt-4 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">{syncError}</p>
        )}

        <div className="flex justify-between mt-8">
          <button
            onClick={back}
            disabled={step === 0}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/10 text-wed-gray-300 hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-all text-sm"
          >
            <ChevronLeft className="w-4 h-4" /> Back
          </button>
          {step < STEP_TITLES.length - 1 ? (
            <button
              onClick={next}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-wed-purple text-white font-semibold hover:brightness-110 transition-all text-sm"
            >
              Next <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={submit}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-wed-lime text-wed-black font-bold hover:brightness-110 transition-all text-sm"
            >
              <Sparkles className="w-4 h-4" /> Generate My Protocol
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
