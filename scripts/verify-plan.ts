/**
 * Dev sanity check for the plan generator: prints generated plans for
 * home-gym profiles so equipment coverage can be eyeballed after
 * exercise-library changes. Run: npx tsx scripts/verify-plan.ts
 */
import { generatePlan } from '../src/lib/plan-generator';
import { exercises } from '../src/data/exercises';
import type { OnboardingProfile } from '../src/lib/validations/onboarding';

const base: OnboardingProfile = {
  name: 'HomeTest',
  age: 25,
  gender: 'FEMALE',
  heightCm: 165,
  weightKg: 60,
  bodyFatPct: null,
  goal: 'GENERAL',
  experience: 'BEGINNER',
  equipment: ['NONE'],
  daysPerWeek: 3,
  sessionMinutes: 60,
  targetMuscles: [],
  sleepHours: 8,
  diet: 'BALANCED',
  injuries: '',
  medicalNotes: '',
};

function show(label: string, profile: OnboardingProfile) {
  const { plan, targets } = generatePlan(profile);
  console.log(`\n=== ${label} → ${plan.name} (${targets.calories} kcal / ${targets.proteinG}g protein) ===`);
  for (const day of plan.days) {
    console.log(`  ${day.name}: ${day.exercises.map((e) => e.name).join(' | ')}`);
  }
}

console.log(`Exercise library size: ${exercises.length}`);

show('Bodyweight only, 3d', base);
show('Dumbbells + bands, 4d muscle', {
  ...base,
  name: 'DbTest',
  gender: 'MALE',
  goal: 'MUSCLE',
  experience: 'INTERMEDIATE',
  equipment: ['DUMBBELLS', 'RESISTANCE_BANDS'],
  daysPerWeek: 4,
  weightKg: 74,
  heightCm: 178,
});
show('Pull-up bar calisthenics, 5d', {
  ...base,
  name: 'CaliTest',
  goal: 'CALISTHENICS',
  equipment: ['PULLUP_BAR'],
  daysPerWeek: 5,
});
