import { exercises } from '@/data/exercises';
import type { Exercise, WorkoutPlan, WorkoutDay } from '@/types';
import type { OnboardingProfile } from '@/lib/validations/onboarding';
import { calculateBMR, calculateTDEE } from '@/lib/utils';

export interface PlanTargets {
  calories: number;
  proteinG: number;
  waterMl: number;
}

export interface GeneratedPlan {
  plan: WorkoutPlan;
  targets: PlanTargets;
}

const GOAL_SCHEMES: Record<OnboardingProfile['goal'], { sets: number; reps: string; restSec: number; label: string }> = {
  STRENGTH: { sets: 4, reps: '3-5', restSec: 180, label: 'Strength' },
  MUSCLE: { sets: 4, reps: '8-12', restSec: 90, label: 'Hypertrophy' },
  FATLOSS: { sets: 3, reps: '12-15', restSec: 60, label: 'Fat Loss' },
  ENDURANCE: { sets: 3, reps: '15-20', restSec: 45, label: 'Endurance' },
  CALISTHENICS: { sets: 4, reps: 'AMRAP', restSec: 90, label: 'Calisthenics' },
  GENERAL: { sets: 3, reps: '8-12', restSec: 90, label: 'Foundation' },
};

const DIFFICULTY_ORDER = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT'] as const;

interface DayTemplate {
  name: string;
  muscles: string[];
}

function splitFor(days: number): { type: string; label: string; templates: DayTemplate[] } {
  if (days <= 3) {
    const fullBody: DayTemplate[] = ['A', 'B', 'C'].map((v) => ({
      name: `Full Body ${v}`,
      muscles: ['LEGS', 'CHEST', 'BACK', 'SHOULDERS', 'CORE', 'ARMS'],
    }));
    return { type: 'FULL_BODY', label: 'Full Body', templates: fullBody.slice(0, Math.max(days, 1)) };
  }
  if (days === 4) {
    return {
      type: 'UPPER_LOWER',
      label: 'Upper/Lower',
      templates: [
        { name: 'Upper A', muscles: ['CHEST', 'BACK', 'SHOULDERS', 'ARMS', 'ARMS'] },
        { name: 'Lower A', muscles: ['LEGS', 'LEGS', 'LEGS', 'CORE'] },
        { name: 'Upper B', muscles: ['BACK', 'CHEST', 'SHOULDERS', 'ARMS', 'ARMS'] },
        { name: 'Lower B', muscles: ['LEGS', 'LEGS', 'CORE', 'CORE'] },
      ],
    };
  }
  const ppl: DayTemplate[] = [
    { name: 'Push', muscles: ['CHEST', 'CHEST', 'SHOULDERS', 'ARMS'] },
    { name: 'Pull', muscles: ['BACK', 'BACK', 'SHOULDERS', 'ARMS'] },
    { name: 'Legs', muscles: ['LEGS', 'LEGS', 'LEGS', 'CORE'] },
    { name: 'Push B', muscles: ['CHEST', 'SHOULDERS', 'CHEST', 'ARMS'] },
    { name: 'Pull B', muscles: ['BACK', 'BACK', 'ARMS', 'CORE'] },
    { name: 'Legs B', muscles: ['LEGS', 'LEGS', 'CORE', 'CORE'] },
    { name: 'Active Recovery', muscles: ['CORE', 'LEGS'] },
  ];
  return { type: 'PPL', label: 'Push/Pull/Legs', templates: ppl.slice(0, Math.min(days, 7)) };
}

function exercisesPerDay(sessionMinutes: number): number {
  if (sessionMinutes <= 30) return 3;
  if (sessionMinutes <= 45) return 4;
  if (sessionMinutes <= 60) return 5;
  return 6;
}

function availableTo(profile: OnboardingProfile) {
  return (ex: Exercise): boolean => {
    if (profile.goal === 'CALISTHENICS') {
      return ex.equipment.includes('NONE') || (ex.equipment.includes('PULLUP_BAR') && profile.equipment.includes('PULLUP_BAR'));
    }
    return ex.equipment.includes('NONE') || ex.equipment.some((e) => (profile.equipment as string[]).includes(e));
  };
}

/** Sort candidates so difficulty closest to the user's experience comes first (stable). */
function byExperienceFit(experience: OnboardingProfile['experience']) {
  const target = DIFFICULTY_ORDER.indexOf(experience);
  return (a: Exercise, b: Exercise) =>
    Math.abs(DIFFICULTY_ORDER.indexOf(a.difficulty) - target) - Math.abs(DIFFICULTY_ORDER.indexOf(b.difficulty) - target);
}

/**
 * Deterministically generate a weekly workout plan plus nutrition targets
 * from an onboarding profile. Pure function: same profile in, same plan out.
 */
export function generatePlan(profile: OnboardingProfile): GeneratedPlan {
  const scheme = GOAL_SCHEMES[profile.goal];
  const split = splitFor(profile.daysPerWeek);
  const cap = exercisesPerDay(profile.sessionMinutes);
  const isAvailable = availableTo(profile);
  const fit = byExperienceFit(profile.experience);

  // Pool per muscle group, filtered by equipment and sorted by experience fit.
  // Falls back to bodyweight movements so no slot is ever empty.
  const poolFor = (muscle: string): Exercise[] => {
    const matches = exercises.filter((ex) => ex.primaryMuscles.includes(muscle));
    const usable = matches.filter(isAvailable);
    const pool = usable.length > 0 ? usable : matches.filter((ex) => ex.equipment.includes('NONE'));
    return (pool.length > 0 ? pool : matches).slice().sort(fit);
  };

  const days: WorkoutDay[] = split.templates.map((template, dayIndex) => {
    // Prioritize the user's target muscles so they survive the session-length cap.
    const ordered = [...template.muscles].sort((a, b) => {
      const aT = (profile.targetMuscles as string[]).includes(a) ? 0 : 1;
      const bT = (profile.targetMuscles as string[]).includes(b) ? 0 : 1;
      return aT - bT;
    });

    const picked: Exercise[] = [];
    for (const muscle of ordered.slice(0, cap)) {
      const pool = poolFor(muscle).filter((ex) => !picked.includes(ex));
      if (pool.length === 0) continue;
      // Rotate by day index so day A and day B vary their selections.
      picked.push(pool[dayIndex % pool.length]);
    }

    const setsForDay = profile.experience === 'BEGINNER' ? Math.max(scheme.sets - 1, 2) : scheme.sets;
    return {
      name: template.name,
      exercises: picked.map((ex) => ({
        name: ex.name,
        sets: setsForDay,
        reps: scheme.reps,
        rest: `${scheme.restSec}s`,
      })),
    };
  });

  const plan: WorkoutPlan = {
    id: `generated-${profile.goal.toLowerCase()}-${profile.daysPerWeek}d`,
    name: `${scheme.label} ${split.label} Protocol`,
    type: split.type,
    difficulty: profile.experience,
    days,
  };

  // Nutrition targets from BMR/TDEE with a goal-based adjustment.
  const bmr = calculateBMR(profile.weightKg, profile.heightCm, profile.age, profile.gender);
  const activity = 1.2 + profile.daysPerWeek * 0.05;
  const goalFactor = profile.goal === 'FATLOSS' ? 0.85 : profile.goal === 'MUSCLE' || profile.goal === 'STRENGTH' ? 1.1 : 1.0;
  const proteinPerKg = profile.goal === 'MUSCLE' || profile.goal === 'STRENGTH' ? 2.0 : 1.6;

  return {
    plan,
    targets: {
      calories: Math.round(calculateTDEE(bmr, activity) * goalFactor),
      proteinG: Math.round(profile.weightKg * proteinPerKg),
      waterMl: Math.round(profile.weightKg * 35),
    },
  };
}
