/**
 * Behavioral verification of the AI engines against the spec's canonical
 * users (A/B/C) plus edge cases. Exit 1 on any assertion failure.
 * Run: npx tsx scripts/verify-ai-engine.ts
 */
import { buildAthleteProfile } from '../src/lib/ai/athlete-profile';
import { generateIntelligentPlan } from '../src/lib/ai/workout-engine';
import { generateNutritionPlan } from '../src/lib/ai/nutrition-engine';
import { renderReasoning } from '../src/lib/ai/explain';
import type { AiOnboardingInput } from '../src/lib/ai/types';

const failures: string[] = [];
const check = (cond: boolean, msg: string) => { if (!cond) failures.push(msg); };

const baseInput: AiOnboardingInput = {
  physique: 'classic-aesthetic',
  goalsRanked: ['muscle-growth'],
  trainingStyle: 'gym',
  equipmentCards: ['commercial-gym'],
  experienceTier: 'INTERMEDIATE',
  name: 'Test', age: 25, gender: 'MALE', heightCm: 178, weightKg: 75, bodyFatPct: null,
  occupation: 'sedentary-job', sleepHours: 8, stressLevel: 2,
  daysPerWeek: 5, sessionMinutes: 60, injuries: '', medicalNotes: '',
  foodHabits: ['home-cooked', 'egg-based'], proteinSources: ['eggs', 'chicken'],
  foodsAvoided: '', allergies: '', cookingAbility: 'high', mealsPerDay: 4,
  waterHabit: 'moderate', supplements: '',
};

// ── User A: Classic Aesthetic / Muscle Growth / Commercial Gym ──
{
  const profile = buildAthleteProfile(baseInput);
  const plan = generateIntelligentPlan(profile);
  check(['ppl', 'upper-lower'].includes(plan.templateId), `A: expected UL/PPL, got ${plan.templateId}`);
  check(plan.days.length === 5, `A: expected 5 days, got ${plan.days.length}`);
  const allReps = plan.days.flatMap((d) => d.exercises.map((e) => e.reps));
  check(allReps.every((r) => Number(r.split('-')[0]) >= 6 && Number(r.split('-')[1]) <= 15), `A: reps outside hypertrophy range: ${allReps.join(',')}`);
  const everyExerciseReasoned = plan.days.every((d) => d.exercises.every((e) => e.reasoning.length >= 3));
  check(everyExerciseReasoned, 'A: some exercise lacks selection/volume/rest reasoning');
  check(plan.validations.some((v) => v.startsWith('✓')), 'A: no passing validations reported');
}

// ── User B: Calisthenics Athlete / Max Strength / Bar + Bodyweight ──
{
  const profile = buildAthleteProfile({
    ...baseInput,
    physique: 'calisthenics-athlete',
    goalsRanked: ['max-strength'],
    trainingStyle: 'calisthenics',
    equipmentCards: ['pullup-bar', 'bodyweight'],
    daysPerWeek: 3,
  });
  const plan = generateIntelligentPlan(profile);
  check(plan.templateId === 'calisthenics-skill', `B: expected calisthenics-skill, got ${plan.templateId}`);
  const allExercises = plan.days.flatMap((d) => d.exercises);
  check(allExercises.every((e) => e.mechanics !== 'isolation'), `B: isolation leaked in: ${allExercises.filter((e) => e.mechanics === 'isolation').map((e) => e.name).join(',')}`);
  check(allExercises.some((e) => e.skillFocus === 'pull-strength'), 'B: no pull-strength progression programmed');
  const skillRungReasoned = allExercises.some((e) => e.reasoning.some((r) => r.rule === 'skill-progression-level'));
  check(skillRungReasoned, 'B: no skill-progression reasoning present');
}

// ── User C: Mass Monster / Muscle Growth / Commercial Gym / Advanced ──
{
  const profile = buildAthleteProfile({
    ...baseInput, physique: 'mass-monster', experienceTier: 'ADVANCED', daysPerWeek: 4, sessionMinutes: 75,
  });
  const plan = generateIntelligentPlan(profile);
  const allExercises = plan.days.flatMap((d) => d.exercises);
  const compounds = allExercises.filter((e) => e.mechanics === 'compound');
  check(compounds.length / allExercises.length >= 0.5, `C: compounds not dominant (${compounds.length}/${allExercises.length})`);
  check(allExercises.some((e) => e.sets >= 4), 'C: no high-volume (4+ set) work for advanced mass monster');
}

// ── Edge: Never trained, bodyweight only, 2 days, poor recovery ──
{
  const profile = buildAthleteProfile({
    ...baseInput,
    physique: 'transformation', goalsRanked: ['fat-loss'], trainingStyle: 'gym',
    equipmentCards: ['bodyweight'], experienceTier: 'NEVER_TRAINED',
    daysPerWeek: 6, sleepHours: 5, stressLevel: 5, occupation: 'physical-job', sessionMinutes: 30,
  });
  check(profile.recoveryScore < 45, `Edge: recovery should be low, got ${profile.recoveryScore}`);
  check(profile.capacity.effectiveDays === 3, `Edge: expected recovery cap to 3 days, got ${profile.capacity.effectiveDays}`);
  const plan = generateIntelligentPlan(profile);
  const allExercises = plan.days.flatMap((d) => d.exercises);
  check(allExercises.length > 0, 'Edge: empty plan');
  check(allExercises.every((e) => e.sets === 2), `Edge: never-trained should get 2 sets, got ${allExercises.map((e) => e.sets).join(',')}`);
  check(plan.days.every((d) => d.exercises.length <= 3), 'Edge: 30-min session should cap at 3 exercises');
}

// ── Nutrition: student budget case (spec example) ──
{
  const profile = buildAthleteProfile({ ...baseInput, occupation: 'student' });
  const nutrition = generateNutritionPlan({ ...baseInput, occupation: 'student' }, profile);
  check(profile.budgetTier === 'budget', `Nutrition: expected budget tier, got ${profile.budgetTier}`);
  check(nutrition.meals.length === 4, `Nutrition: expected 4 meals, got ${nutrition.meals.length}`);
  const usesOwnSources = nutrition.meals.every((m) => m.proteinSources.every((s) => ['eggs', 'chicken'].includes(s)));
  check(usesOwnSources, 'Nutrition: meals used sources the user never selected');
  check(nutrition.supplements[0]?.includes('No supplement is required'), 'Nutrition: budget tier should lead with "nothing required"');
  check(!nutrition.supplements.join(' ').toLowerCase().includes('whey'), 'Nutrition: budget tier should not suggest whey');
  check(nutrition.targets.calories > 1500, 'Nutrition: implausible calorie target');
}

// ── Determinism: same input → identical output ──
{
  const p1 = buildAthleteProfile(baseInput);
  const p2 = buildAthleteProfile(baseInput);
  check(JSON.stringify(p1) === JSON.stringify(p2), 'Determinism: athlete profile differs across runs');
  check(
    JSON.stringify(generateIntelligentPlan(p1)) === JSON.stringify(generateIntelligentPlan(p2)),
    'Determinism: plan differs across runs'
  );
}

// ── Explainability: every reasoning rule renders to prose ──
{
  const profile = buildAthleteProfile(baseInput);
  const plan = generateIntelligentPlan(profile);
  const nutrition = generateNutritionPlan(baseInput, profile);
  const allReasoning = [
    ...profile.reasoning,
    ...plan.reasoning,
    ...plan.days.flatMap((d) => [...d.reasoning, ...d.exercises.flatMap((e) => e.reasoning)]),
    ...nutrition.reasoning,
  ];
  const unrendered = allReasoning.filter((r) => renderReasoning(r).startsWith(r.rule + ':'));
  check(unrendered.length === 0, `Explain: ${unrendered.length} rules missing templates: ${Array.from(new Set(unrendered.map((r) => r.rule))).join(', ')}`);
}

if (failures.length > 0) {
  console.error(`✗ Engine verification FAILED (${failures.length}):`);
  for (const f of failures) console.error('  - ' + f);
  process.exit(1);
}
console.log('✓ Engine verification passed: users A/B/C behave per spec, edge cases hold, output is deterministic, every decision renders to prose.');
