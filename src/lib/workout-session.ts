import type { UserProfile } from '@prisma/client';
import type { OnboardingProfile } from '@/lib/validations/onboarding';

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

/** Flat XP reward per completed workout — assumption, no spec given: base + per-exercise. */
export function xpForWorkout(exerciseCount: number): number {
  return 50 + exerciseCount * 10;
}

function startOfDayUTC(d: Date): number {
  return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
}

/**
 * Streak rule: 1-day gap from the previous completed workout continues the
 * streak, a 0-day gap (second workout same day) leaves it unchanged, any
 * larger gap (or no prior workout) resets it to 1.
 */
export function applyStreakRule(
  current: { streakDays: number; bestStreak: number },
  previousCompletedAt: Date | null,
  now: Date
): { streakDays: number; bestStreak: number } {
  let streakDays: number;
  if (!previousCompletedAt) {
    streakDays = 1;
  } else {
    const gapDays = Math.round((startOfDayUTC(now) - startOfDayUTC(previousCompletedAt)) / 86_400_000);
    if (gapDays === 1) streakDays = current.streakDays + 1;
    else if (gapDays === 0) streakDays = current.streakDays;
    else streakDays = 1;
  }
  return { streakDays, bestStreak: Math.max(current.bestStreak, streakDays) };
}
