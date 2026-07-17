// Shared types for the AI intelligence layer. Everything is JSON-serializable
// so athlete profiles and plans persist directly into UserProfile Json columns.

import type { PhysiqueId } from '@/data/knowledge/physiques';
import type { TrainingStyleId } from '@/data/knowledge/training-styles';
import type { GoalId, ExperienceTier } from '@/data/knowledge/volume-landmarks';
import type { LegacyEquipment } from '@/data/knowledge/equipment-cards';
import type { BudgetTier } from '@/data/knowledge/nutrition-knowledge';
import type { MovementPattern, Mechanics, SkillFocus } from '@/data/knowledge/exercise-meta';
import type { PlanTargets } from '@/lib/plan-generator';

/** One traceable decision: a rule id + the inputs that fired it. explain.ts renders it to prose. */
export interface Reasoning {
  rule: string;
  inputs: Record<string, string | number>;
}

export type Occupation = 'sedentary-job' | 'active-job' | 'physical-job' | 'student' | 'shift-work';

/** Everything the 8-step onboarding collects. */
export interface AiOnboardingInput {
  // Step 1–5
  physique: PhysiqueId;
  goalsRanked: GoalId[]; // index 0 = primary
  trainingStyle: TrainingStyleId;
  equipmentCards: string[];
  experienceTier: ExperienceTier;
  // Step 6 — lifestyle
  name: string;
  age: number;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  heightCm: number;
  weightKg: number;
  bodyFatPct: number | null;
  occupation: Occupation;
  sleepHours: number;
  /** 1 (calm) – 5 (very high). */
  stressLevel: number;
  daysPerWeek: number;
  sessionMinutes: number;
  injuries: string;
  medicalNotes: string;
  // Step 7 — nutrition
  foodHabits: string[];
  proteinSources: string[];
  foodsAvoided: string;
  allergies: string;
  cookingAbility: 'low' | 'medium' | 'high';
  mealsPerDay: number;
  waterHabit: 'low' | 'moderate' | 'high';
  supplements: string;
}

/** Synthesized Step-8 output — the engine's model of the user. */
export interface AthleteProfile {
  version: 1;
  physique: PhysiqueId;
  trainingStyle: TrainingStyleId;
  goalsRanked: GoalId[];
  experienceTier: ExperienceTier;
  equipment: LegacyEquipment[];
  /** 0–100, from sleep + stress + occupation. */
  recoveryScore: number;
  budgetTier: BudgetTier;
  dietFlags: { vegetarian: boolean; vegan: boolean };
  strengths: string[];
  weaknesses: string[];
  capacity: {
    daysPerWeek: number;
    sessionMinutes: number;
    /** Days the engine actually programs (recovery may cap below requested). */
    effectiveDays: number;
  };
  warnings: string[];
  reasoning: Reasoning[];
}

export interface AiExercise {
  id: string;
  name: string;
  sets: number;
  reps: string;
  rest: string;
  pattern: MovementPattern;
  mechanics: Mechanics;
  skillFocus?: SkillFocus;
  reasoning: Reasoning[];
}

export interface AiDay {
  name: string;
  exercises: AiExercise[];
  reasoning: Reasoning[];
}

export interface AiPlan {
  version: 1;
  templateId: string;
  name: string;
  type: 'FULL_BODY' | 'UPPER_LOWER' | 'PPL' | 'CUSTOM';
  days: AiDay[];
  reasoning: Reasoning[];
  /** Human-readable results of the balance checks (coverage, volume, frequency). */
  validations: string[];
}

export interface AiMeal {
  name: string;
  description: string;
  proteinSources: string[];
}

export interface AiNutritionPlan {
  version: 1;
  targets: PlanTargets;
  budgetTier: BudgetTier;
  meals: AiMeal[];
  timing: string[];
  micronutrients: string[];
  supplements: string[];
  reasoning: Reasoning[];
}
