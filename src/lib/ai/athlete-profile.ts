// Step 8 synthesizer: turns raw onboarding answers into the AthleteProfile the
// workout and nutrition engines reason from. Pure and deterministic.

import { physiqueById } from '@/data/knowledge/physiques';
import { expandEquipment } from '@/data/knowledge/equipment-cards';
import { foodHabits as habitKnowledge, inferBudgetTier, proteinSources as sourceKnowledge } from '@/data/knowledge/nutrition-knowledge';
import { experienceProfiles } from '@/data/knowledge/volume-landmarks';
import type { AiOnboardingInput, AthleteProfile, Reasoning } from './types';

function recoveryScore(input: AiOnboardingInput, reasoning: Reasoning[]): number {
  let score = 40;
  if (input.sleepHours >= 7 && input.sleepHours <= 9) score += 25;
  else if (input.sleepHours >= 6) score += 12;
  else if (input.sleepHours > 9) score += 15;
  else score -= 10; // <6h actively hurts — chronic under-sleep is the biggest recovery limiter.

  if (input.stressLevel <= 2) score += 20;
  else if (input.stressLevel === 3) score += 10;
  // 4–5 adds nothing.

  const occupationBonus: Record<AiOnboardingInput['occupation'], number> = {
    'sedentary-job': 15, // low external fatigue → full recovery budget for training
    'student': 12,
    'active-job': 8,
    'shift-work': 3, // circadian disruption taxes recovery
    'physical-job': 0, // manual labor already consumes recovery capacity
  };
  score += occupationBonus[input.occupation];

  const clamped = Math.max(0, Math.min(100, score));
  reasoning.push({
    rule: 'recovery-score',
    inputs: { sleepHours: input.sleepHours, stressLevel: input.stressLevel, occupation: input.occupation, score: clamped },
  });
  return clamped;
}

export function buildAthleteProfile(input: AiOnboardingInput): AthleteProfile {
  const reasoning: Reasoning[] = [];
  const warnings: string[] = [];
  const physique = physiqueById(input.physique);

  const equipment = expandEquipment(input.equipmentCards);
  reasoning.push({ rule: 'equipment-expansion', inputs: { cards: input.equipmentCards.join(', '), unlocked: equipment.join(', ') } });

  const recovery = recoveryScore(input, reasoning);

  // Recovery caps how many hard days the engine programs, regardless of ambition.
  let effectiveDays = input.daysPerWeek;
  if (recovery < 40 && input.daysPerWeek > 3) {
    effectiveDays = 3;
    warnings.push('Recovery capacity is limited right now (sleep/stress/work load) — training days capped at 3 so every session stays productive.');
    reasoning.push({ rule: 'recovery-day-cap', inputs: { requested: input.daysPerWeek, granted: effectiveDays, recovery } });
  } else if (recovery < 60 && input.daysPerWeek > 5) {
    effectiveDays = 5;
    warnings.push('With moderate recovery capacity, 5 quality days beat 6+ tired ones — days capped at 5.');
    reasoning.push({ rule: 'recovery-day-cap', inputs: { requested: input.daysPerWeek, granted: effectiveDays, recovery } });
  }

  const budgetTier = inferBudgetTier(input.foodHabits, input.proteinSources);
  reasoning.push({ rule: 'budget-inference', inputs: { habits: input.foodHabits.join(', ') || 'none', sources: input.proteinSources.join(', ') || 'none', tier: budgetTier } });

  const habitFlags = input.foodHabits.map((id) => habitKnowledge.find((h) => h.id === id)?.infers ?? {});
  const selectedSources = input.proteinSources.map((id) => sourceKnowledge.find((s) => s.id === id)).filter(Boolean);
  const vegan = habitFlags.some((f) => f.vegan) || (selectedSources.length > 0 && selectedSources.every((s) => s!.vegan));
  const vegetarian = vegan || habitFlags.some((f) => f.vegetarian) || (selectedSources.length > 0 && selectedSources.every((s) => s!.vegetarian));

  const strengths: string[] = [];
  const weaknesses: string[] = [];
  if (input.sleepHours >= 7.5) strengths.push(`Solid sleep foundation (${input.sleepHours}h) — recovery works in your favor.`);
  else if (input.sleepHours < 6.5) weaknesses.push(`Short sleep (${input.sleepHours}h) — the biggest lever you can pull for results.`);
  if (input.stressLevel >= 4) weaknesses.push('High stress load — volume is kept conservative until it eases.');
  else if (input.stressLevel <= 2) strengths.push('Low stress — you can handle productive training volume.');
  if (equipment.length >= 5) strengths.push('Wide equipment access — the full exercise library is available.');
  if (equipment.length <= 2) weaknesses.push('Limited equipment — progression will lean on harder bodyweight variations.');
  if (input.experienceTier === 'NEVER_TRAINED' || input.experienceTier === 'BEGINNER') {
    strengths.push('Beginner adaptation window — the fastest progress of your training life happens now.');
  }
  if (input.injuries.trim()) weaknesses.push('Existing injuries noted — flagged movements should be trained pain-free only.');
  if (physique && physique.difficulty >= 4) {
    warnings.push(`${physique.name} is a ${physique.estimatedYears} commitment — the plan optimizes the long game, not shortcuts.`);
  }

  return {
    version: 1,
    physique: input.physique,
    trainingStyle: input.trainingStyle,
    goalsRanked: input.goalsRanked,
    experienceTier: input.experienceTier,
    equipment,
    recoveryScore: recovery,
    budgetTier,
    dietFlags: { vegetarian, vegan },
    strengths,
    weaknesses,
    capacity: { daysPerWeek: input.daysPerWeek, sessionMinutes: input.sessionMinutes, effectiveDays },
    warnings,
    reasoning,
  };
}

/** Maps the 5-tier experience to the legacy 3-value DB enum column. */
export function experienceToDbLevel(tier: AiOnboardingInput['experienceTier']): 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' {
  return experienceProfiles[tier].dbLevel;
}
