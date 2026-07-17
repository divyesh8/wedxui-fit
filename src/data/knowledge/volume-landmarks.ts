// Volume, intensity, rest, and progression knowledge — the numeric science
// tables the workout engine reasons from. Values follow mainstream volume-
// landmark research (MEV→MAV ranges), simplified to app scale.

export type ExperienceTier = 'NEVER_TRAINED' | 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'ELITE';

export interface ExperienceProfile {
  tier: ExperienceTier;
  label: string;
  description: string;
  /** Productive weekly hard sets per major muscle group [min, max]. */
  weeklySetsPerMuscle: [number, number];
  /** Working sets prescribed per exercise. */
  setsPerExercise: number;
  /** Hard cap of exercises per session before quality degrades. */
  exercisesPerSessionCap: number;
  /** Minimum times per week each major muscle should be touched. */
  muscleFrequencyMin: number;
  /** Maps to the legacy 3-value DB enum (ExperienceLevel). */
  dbLevel: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
}

export const experienceProfiles: Record<ExperienceTier, ExperienceProfile> = {
  NEVER_TRAINED: {
    tier: 'NEVER_TRAINED', label: 'Never Trained',
    description: 'Brand new — every session teaches movement patterns first.',
    weeklySetsPerMuscle: [6, 10], setsPerExercise: 2, exercisesPerSessionCap: 5,
    muscleFrequencyMin: 2, dbLevel: 'BEGINNER',
  },
  BEGINNER: {
    tier: 'BEGINNER', label: 'Beginner',
    description: 'Under a year of consistent training.',
    weeklySetsPerMuscle: [8, 12], setsPerExercise: 3, exercisesPerSessionCap: 6,
    muscleFrequencyMin: 2, dbLevel: 'BEGINNER',
  },
  INTERMEDIATE: {
    tier: 'INTERMEDIATE', label: 'Intermediate',
    description: '1–3 years of structured training.',
    weeklySetsPerMuscle: [10, 16], setsPerExercise: 3, exercisesPerSessionCap: 7,
    muscleFrequencyMin: 2, dbLevel: 'INTERMEDIATE',
  },
  ADVANCED: {
    tier: 'ADVANCED', label: 'Advanced',
    description: '3+ years — needs deliberate volume management to progress.',
    weeklySetsPerMuscle: [12, 20], setsPerExercise: 4, exercisesPerSessionCap: 8,
    muscleFrequencyMin: 2, dbLevel: 'ADVANCED',
  },
  ELITE: {
    tier: 'ELITE', label: 'Elite',
    description: 'Competitive level — periodized, high work capacity.',
    weeklySetsPerMuscle: [14, 22], setsPerExercise: 4, exercisesPerSessionCap: 8,
    muscleFrequencyMin: 2, dbLevel: 'ADVANCED',
  },
};

export type GoalId =
  | 'max-strength'
  | 'muscle-growth'
  | 'fat-loss'
  | 'recomposition'
  | 'athletic-performance'
  | 'explosive-power'
  | 'endurance'
  | 'mobility'
  | 'general-fitness';

export interface GoalProfile {
  id: GoalId;
  label: string;
  /** Working rep range [low, high] this goal drives toward. */
  repRange: [number, number];
  /** Rest between working sets, seconds. */
  restSec: number;
  /** How load/difficulty advances week to week. */
  progressionScheme: string;
  /** Scales landmark volume (endurance trains lighter/higher, strength lower). */
  volumeMultiplier: number;
}

export const goalProfiles: Record<GoalId, GoalProfile> = {
  'max-strength': {
    id: 'max-strength', label: 'Maximum Strength',
    repRange: [3, 6], restSec: 180,
    progressionScheme: 'Add load when all sets hit the top of the range (double progression, ~2.5% jumps).',
    volumeMultiplier: 0.85,
  },
  'muscle-growth': {
    id: 'muscle-growth', label: 'Muscle Growth',
    repRange: [8, 12], restSec: 90,
    progressionScheme: 'Double progression: add reps to the top of the range, then add load and reset reps.',
    volumeMultiplier: 1.1,
  },
  'fat-loss': {
    id: 'fat-loss', label: 'Fat Reduction',
    repRange: [10, 15], restSec: 60,
    progressionScheme: 'Hold load, shorten rests, add a rep per week; density over intensity.',
    volumeMultiplier: 0.95,
  },
  'recomposition': {
    id: 'recomposition', label: 'Body Recomposition',
    repRange: [8, 12], restSec: 90,
    progressionScheme: 'Double progression at maintenance calories; expect slower load jumps.',
    volumeMultiplier: 1.0,
  },
  'athletic-performance': {
    id: 'athletic-performance', label: 'Athletic Performance',
    repRange: [5, 8], restSec: 120,
    progressionScheme: 'Wave loading: alternate heavier and faster weeks; movement quality gates progress.',
    volumeMultiplier: 0.9,
  },
  'explosive-power': {
    id: 'explosive-power', label: 'Explosive Power',
    repRange: [3, 6], restSec: 150,
    progressionScheme: 'Bar speed rules: keep reps crisp and explosive, stop sets when speed drops.',
    volumeMultiplier: 0.8,
  },
  'endurance': {
    id: 'endurance', label: 'Endurance',
    repRange: [15, 20], restSec: 45,
    progressionScheme: 'Add reps or reduce rest weekly; extend total work time.',
    volumeMultiplier: 1.0,
  },
  'mobility': {
    id: 'mobility', label: 'Mobility',
    repRange: [10, 15], restSec: 45,
    progressionScheme: 'Increase range week to week; load only what full range allows.',
    volumeMultiplier: 0.8,
  },
  'general-fitness': {
    id: 'general-fitness', label: 'General Fitness',
    repRange: [8, 12], restSec: 90,
    progressionScheme: 'Double progression at a comfortable effort (2 reps in reserve).',
    volumeMultiplier: 0.95,
  },
};

/** Sets-per-exercise adjustment when a physique/goal multiplier stacks up. */
export function effectiveSets(base: number, multipliers: number[]): number {
  const product = multipliers.reduce((a, b) => a * b, 1);
  return Math.max(2, Math.min(5, Math.round(base * product)));
}
