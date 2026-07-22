import type { UserProfile } from '@prisma/client';
import type { OnboardingProfile } from '@/lib/validations/onboarding';
import type { WorkoutPlan } from '@/types';
import { generatePlan, type PlanTargets } from '@/lib/plan-generator';
import type { AiPlan, AiNutritionPlan } from '@/lib/ai/types';

/**
 * Maps a persisted UserProfile row back into the shape generatePlan() expects.
 * Safe once onboarding has completed once — profileUpdateSchema only ever
 * patches a subset of fields, so the required enums/numbers stay populated.
 */
export function profileToGeneratorInput(profile: UserProfile, name: string): OnboardingProfile {
  return {
    name,
    age: profile.age ?? 25,
    gender: (profile.gender ?? 'OTHER') as OnboardingProfile['gender'],
    heightCm: profile.heightCm ?? 170,
    weightKg: profile.weightKg ?? 70,
    bodyFatPct: profile.bodyFatPct,
    goal: (profile.goal ?? 'GENERAL') as OnboardingProfile['goal'],
    experience: (profile.experience ?? 'BEGINNER') as OnboardingProfile['experience'],
    equipment: (profile.equipment.length > 0 ? profile.equipment : ['NONE']) as OnboardingProfile['equipment'],
    daysPerWeek: profile.daysPerWeek ?? 3,
    sessionMinutes: profile.sessionMinutes ?? 60,
    targetMuscles: profile.targetMuscles as OnboardingProfile['targetMuscles'],
    sleepHours: profile.sleepHours ?? 7,
    diet: (profile.diet ?? 'BALANCED') as OnboardingProfile['diet'],
    injuries: profile.injuries ?? '',
    medicalNotes: profile.medicalNotes ?? '',
  };
}

/**
 * The single source of truth for "what plan is this user on": the AI-generated
 * plan when one exists, else the legacy deterministic generator. Session
 * tracking, streaks, and XP work identically over both.
 */
export function planFromProfile(row: UserProfile, name: string): { plan: WorkoutPlan; targets: PlanTargets; isAi: boolean } {
  const aiPlan = row.aiPlan as unknown as (AiPlan & { generatedAt?: string }) | null;
  if (aiPlan?.days?.length) {
    const plan: WorkoutPlan = {
      id: `ai-${aiPlan.templateId}`,
      name: aiPlan.name,
      type: aiPlan.type,
      difficulty: row.experience ?? 'BEGINNER',
      days: aiPlan.days.map((d) => ({
        name: d.name,
        exercises: d.exercises.map((e) => ({ id: e.id, name: e.name, sets: e.sets, reps: e.reps, rest: e.rest })),
      })),
    };
    const aiNutrition = row.aiNutritionPlan as unknown as AiNutritionPlan | null;
    const targets = aiNutrition?.targets ?? generatePlan(profileToGeneratorInput(row, name)).targets;
    return { plan, targets, isAi: true };
  }
  const legacy = generatePlan(profileToGeneratorInput(row, name));
  return { plan: legacy.plan, targets: legacy.targets, isAi: false };
}

/** Flat XP reward per completed workout — assumption, no spec given: base + per-exercise. */
export function xpForWorkout(exerciseCount: number): number {
  return 50 + exerciseCount * 10;
}

import { localDateKey } from '@/lib/settings/service';

/**
 * Streak rule: 1-day gap from the previous completed workout continues the
 * streak, a 0-day gap (second workout same day) leaves it unchanged, any
 * larger gap (or no prior workout) resets it to 1.
 * Evaluated in the user's local timezone.
 */
export function applyStreakRule(
  current: { streakDays: number; bestStreak: number },
  previousCompletedAt: Date | null,
  now: Date,
  timezone = 'UTC'
): { streakDays: number; bestStreak: number } {
  let streakDays: number;
  if (!previousCompletedAt) {
    streakDays = 1;
  } else {
    const todayKey = localDateKey(now, timezone);
    const prevKey = localDateKey(previousCompletedAt, timezone);

    if (todayKey === prevKey) {
      streakDays = current.streakDays;
    } else {
      const [tY, tM, tD] = todayKey.split('-').map(Number);
      const [pY, pM, pD] = prevKey.split('-').map(Number);
      const todayMs = Date.UTC(tY, tM - 1, tD);
      const prevMs = Date.UTC(pY, pM - 1, pD);
      const gapDays = Math.round((todayMs - prevMs) / 86_400_000);

      if (gapDays === 1) streakDays = current.streakDays + 1;
      else streakDays = 1;
    }
  }
  return { streakDays, bestStreak: Math.max(current.bestStreak, streakDays) };
}
