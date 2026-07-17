// Local, deterministic explanation renderer. Each engine decision is a
// Reasoning {rule, inputs}; this maps rules to natural-language templates.
// An LLM could later rephrase these — the decisions themselves never change.

import type { Reasoning } from './types';

type Renderer = (i: Record<string, string | number>) => string;

const TEMPLATES: Record<string, Renderer> = {
  // athlete profile
  'recovery-score': (i) =>
    `Recovery score ${i.score}/100 — based on ${i.sleepHours}h sleep, stress level ${i.stressLevel}/5, and a ${String(i.occupation).replace(/-/g, ' ')}.`,
  'equipment-expansion': (i) =>
    `Your setup (${i.cards}) unlocks: ${i.unlocked}.`,
  'recovery-day-cap': (i) =>
    `You asked for ${i.requested} days, but with a recovery score of ${i.recovery}/100 the plan programs ${i.granted} — every session should be one you can actually recover from.`,
  'budget-inference': (i) =>
    `Your eating pattern (${i.habits}; ${i.sources}) points to ${i.tier}-tier food choices — the nutrition plan stays inside that reality.`,

  // workout engine
  'template-selected': (i) =>
    `${i.template} split chosen for ${i.style} at ${i.days} days/week: ${i.rationale}`,
  'recovery-cap-applied': (i) =>
    `Programmed ${i.programmed} of the requested ${i.requested} days (recovery score ${i.recoveryScore}/100).`,
  'session-cap': (i) =>
    `Capped at ${i.cap} exercises per session — your ${i.sessionMinutes}-minute window and experience level both limit how much quality work fits.`,
  'slot-dropped-for-time': (i) =>
    `Dropped optional ${String(i.slot).split(':')[1]} work to fit the session cap of ${i.cap}.`,
  'slot-unfillable': (i) =>
    `No available exercise fits ${i.slot} with your current equipment — expand your setup to unlock it.`,
  'skill-progression-level': (i) =>
    `${i.exercise} is rung ${i.rung} of the ${String(i.skill).replace(/-/g, ' ')} progression — matched to your ${String(i.tier).toLowerCase().replace(/_/g, ' ')} level.`,
  'exercise-selected': (i) =>
    `${i.exercise} fills the ${String(i.slot).split(':')[1]?.replace(/-/g, ' ')} slot: your equipment (${i.equipment}) allows it, and it serves the ${i.physique} physique under ${i.style} training.`,
  'volume-assigned': (i) =>
    `${i.sets} sets — ${i.tier} baseline of ${i.base}, adjusted for ${i.goal} and the ${i.physique} physique (${i.mechanics} movement).`,
  'reps-assigned': (i) =>
    `${i.reps} reps blends what ${i.goal} demands with what builds the ${i.physique} look.`,
  'rest-assigned': (i) =>
    i.mechanics === 'isolation'
      ? `${i.restSec}s rest — isolation work recovers quickly, keeping the session dense.`
      : `${i.restSec}s rest — ${i.goal} needs near-full recovery between hard compound sets.`,
  'exercise-order': (i) =>
    `Order: ${i.order} — highest-skill work happens while your nervous system is freshest.`,
  'progression-scheme': (i) =>
    `Week-to-week progression for ${i.goal}: ${i.scheme}`,

  // nutrition engine
  'nutrition-targets': (i) =>
    `${i.calories} kcal and ${i.proteinG}g protein daily, computed via ${i.method} for your ${String(i.goal).replace(/-/g, ' ')} goal.`,
  'meal-sources': (i) =>
    `Meals are built from what you already eat (${i.sources}) at a ${i.budgetTier} budget — no exotic shopping list.`,
  'protein-distribution': (i) =>
    `${i.totalProtein}g protein split across ${i.mealCount} meals ≈ ${i.proteinPerMeal}g each — steady supply beats one giant dose.`,
  'supplement-tier': (i) =>
    `Supplement suggestions match your ${i.tier} food budget${i.vegan === 'true' ? ' and plant-based preference' : ''} — nothing you don't need.`,
};

export function renderReasoning(r: Reasoning): string {
  const template = TEMPLATES[r.rule];
  if (template) return template(r.inputs);
  // Unknown rule: degrade gracefully rather than hiding the trace.
  return `${r.rule}: ${Object.entries(r.inputs).map(([k, v]) => `${k}=${v}`).join(', ')}`;
}

export function renderAll(reasoning: Reasoning[]): string[] {
  return reasoning.map(renderReasoning);
}
