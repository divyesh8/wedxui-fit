// The nutrition intelligence engine. Numeric core reuses the proven
// calculateNutritionTargets (Mifflin–St Jeor + macro split); this layer adds
// meal structure, timing, and source selection constrained to what the user
// actually eats and can afford (budget is inferred, never asked).

import { calculateNutritionTargets } from '@/lib/plan-generator';
import type { OnboardingProfile } from '@/lib/validations/onboarding';
import {
  proteinSources as sourceKnowledge,
  mealTimingRules,
  micronutrientReminders,
  supplementGuidance,
  type ProteinSource,
} from '@/data/knowledge/nutrition-knowledge';
import type { GoalId } from '@/data/knowledge/volume-landmarks';
import type { AiOnboardingInput, AthleteProfile, AiNutritionPlan, AiMeal, Reasoning } from './types';

/** New 9-goal space → legacy FitnessGoal for the numeric core. */
export function goalToLegacy(goal: GoalId | undefined): OnboardingProfile['goal'] {
  switch (goal) {
    case 'max-strength': return 'STRENGTH';
    case 'explosive-power': return 'STRENGTH';
    case 'muscle-growth': return 'MUSCLE';
    case 'fat-loss': return 'FATLOSS';
    case 'endurance': return 'ENDURANCE';
    default: return 'GENERAL';
  }
}

const MEAL_NAMES = ['Breakfast', 'Lunch', 'Dinner', 'Snack 1', 'Snack 2', 'Snack 3'];

function usableSources(input: AiOnboardingInput, profile: AthleteProfile): ProteinSource[] {
  const avoidedText = `${input.foodsAvoided} ${input.allergies}`.toLowerCase();
  const isAvoided = (s: ProteinSource) =>
    s.label.toLowerCase().split(/[\s/&]+/).some((word) => word.length > 3 && avoidedText.includes(word));

  // Start from what the user actually eats.
  let sources = input.proteinSources
    .map((id) => sourceKnowledge.find((s) => s.id === id))
    .filter((s): s is ProteinSource => Boolean(s))
    .filter((s) => !isAvoided(s));

  // Respect diet flags even if a conflicting source slipped in.
  if (profile.dietFlags.vegan) sources = sources.filter((s) => s.vegan);
  else if (profile.dietFlags.vegetarian) sources = sources.filter((s) => s.vegetarian);

  // Nothing selected → sensible defaults within the inferred budget + diet.
  if (sources.length === 0) {
    sources = sourceKnowledge
      .filter((s) => !isAvoided(s))
      .filter((s) => (profile.dietFlags.vegan ? s.vegan : profile.dietFlags.vegetarian ? s.vegetarian : true))
      .filter((s) => (profile.budgetTier === 'budget' ? s.tier === 'budget' : s.tier !== 'premium' || profile.budgetTier === 'premium'));
  }
  return sources;
}

export function generateNutritionPlan(input: AiOnboardingInput, profile: AthleteProfile): AiNutritionPlan {
  const reasoning: Reasoning[] = [];
  const primaryGoal = profile.goalsRanked[0];

  // Numeric core — reuse the verified Mifflin–St Jeor engine.
  const targets = calculateNutritionTargets({
    name: input.name,
    age: input.age,
    gender: input.gender,
    heightCm: input.heightCm,
    weightKg: input.weightKg,
    bodyFatPct: input.bodyFatPct,
    goal: goalToLegacy(primaryGoal),
    experience: 'BEGINNER', // unused by nutrition math
    equipment: ['NONE'],
    daysPerWeek: input.daysPerWeek,
    sessionMinutes: input.sessionMinutes,
    targetMuscles: [],
    sleepHours: input.sleepHours,
    diet: profile.dietFlags.vegan ? 'VEGAN' : profile.dietFlags.vegetarian ? 'VEGETARIAN' : 'BALANCED',
    injuries: input.injuries,
    medicalNotes: input.medicalNotes,
  });
  reasoning.push({
    rule: 'nutrition-targets',
    inputs: { calories: targets.calories, proteinG: targets.proteinG, method: 'Mifflin-St Jeor × activity, goal-adjusted', goal: primaryGoal ?? 'general-fitness' },
  });

  // Meal skeleton constrained to the user's own food world.
  const sources = usableSources(input, profile);
  reasoning.push({
    rule: 'meal-sources',
    inputs: { sources: sources.map((s) => s.label).join(', ') || 'none', budgetTier: profile.budgetTier },
  });

  const mealCount = Math.max(2, Math.min(6, input.mealsPerDay || 3));
  const proteinPerMeal = Math.round(targets.proteinG / mealCount);
  const meals: AiMeal[] = Array.from({ length: mealCount }, (_, i) => {
    const mealSources = sources.length > 0
      ? [sources[i % sources.length], sources[(i + 1) % sources.length]]
          .filter((s, idx, arr) => arr.findIndex((x) => x.id === s.id) === idx)
      : [];
    return {
      name: MEAL_NAMES[i] ?? `Meal ${i + 1}`,
      description: mealSources.length > 0
        ? `~${proteinPerMeal}g protein built around ${mealSources.map((s) => s.label.toLowerCase()).join(' or ')}, plus carbs and vegetables.`
        : `~${proteinPerMeal}g protein from your preferred sources, plus carbs and vegetables.`,
      proteinSources: mealSources.map((s) => s.id),
    };
  });
  reasoning.push({
    rule: 'protein-distribution',
    inputs: { mealCount, proteinPerMeal, totalProtein: targets.proteinG },
  });

  const timingKey = (['muscle-growth', 'fat-loss', 'max-strength'] as const).find((g) => g === primaryGoal) ?? 'default';
  const timing = mealTimingRules.find((r) => r.goal === timingKey)?.guidance ?? [];

  const supplements = supplementGuidance[profile.budgetTier].filter(
    (line) => !(profile.dietFlags.vegan && line.toLowerCase().includes('whey'))
  );
  reasoning.push({ rule: 'supplement-tier', inputs: { tier: profile.budgetTier, vegan: String(profile.dietFlags.vegan) } });

  return {
    version: 1,
    targets,
    budgetTier: profile.budgetTier,
    meals,
    timing,
    micronutrients: micronutrientReminders,
    supplements,
    reasoning,
  };
}
