/**
 * Dev sanity check for the nutrition engine: prints calorie/macro targets and
 * safety warnings for edge-case profiles. Run: npx tsx scripts/verify-nutrition.ts
 */
import { calculateNutritionTargets } from '../src/lib/plan-generator';
import type { OnboardingProfile } from '../src/lib/validations/onboarding';

const base: OnboardingProfile = {
  name: 'Test',
  age: 25,
  gender: 'MALE',
  heightCm: 180,
  weightKg: 80,
  bodyFatPct: null,
  goal: 'GENERAL',
  experience: 'INTERMEDIATE',
  equipment: ['FULL_GYM'],
  daysPerWeek: 5,
  sessionMinutes: 60,
  targetMuscles: [],
  sleepHours: 8,
  diet: 'BALANCED',
  injuries: '',
  medicalNotes: '',
};

function show(label: string, overrides: Partial<OnboardingProfile>) {
  const t = calculateNutritionTargets({ ...base, ...overrides });
  const macroKcal = t.proteinG * 4 + t.carbsG * 4 + t.fatG * 9;
  console.log(`\n=== ${label} ===`);
  console.log(`  BMI ${t.bmi} · ${t.calories} kcal (macros sum ≈ ${macroKcal})`);
  console.log(`  P ${t.proteinG}g / C ${t.carbsG}g / F ${t.fatG}g · fiber ${t.fiberG}g · water ${(t.waterMl / 1000).toFixed(1)}L`);
  for (const w of t.warnings) console.log(`  ⚠ ${w}`);
}

show('Male 80kg muscle gain, 5d', { goal: 'MUSCLE' });
show('Male 90kg fat loss KETO, 4d', { goal: 'FATLOSS', diet: 'KETO', weightKg: 90, heightCm: 175, age: 35, daysPerWeek: 4 });
show('Underweight female fat loss (deficit must be suppressed)', {
  gender: 'FEMALE', goal: 'FATLOSS', age: 30, heightCm: 160, weightKg: 45, daysPerWeek: 2,
});
show('Sedentary female fat loss (floor must apply)', {
  gender: 'FEMALE', goal: 'FATLOSS', age: 40, heightCm: 165, weightKg: 55, daysPerWeek: 1,
});
show('High-protein diet bump + medical note', { diet: 'HIGH_PROTEIN', medicalNotes: 'type 2 diabetes' });
