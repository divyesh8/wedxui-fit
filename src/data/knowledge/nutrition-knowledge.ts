// Nutrition knowledge: food-habit lifestyle options (onboarding Step 7),
// protein sources with cost tiers (budget is INFERRED, never asked), meal
// timing rules, and micronutrient/supplement guidance.

export type BudgetTier = 'budget' | 'moderate' | 'premium';

export interface FoodHabit {
  id: string;
  label: string;
  /** What this habit tells the engine, without asking about money. */
  infers: {
    budgetSignal?: BudgetTier;
    cooking?: 'low' | 'medium' | 'high';
    vegetarian?: boolean;
    vegan?: boolean;
  };
}

export const foodHabits: FoodHabit[] = [
  { id: 'home-cooked', label: 'Mostly home-cooked meals', infers: { budgetSignal: 'budget', cooking: 'high' } },
  { id: 'family-meals', label: 'Traditional family meals', infers: { budgetSignal: 'budget', cooking: 'medium' } },
  { id: 'vegetarian', label: 'Vegetarian meals', infers: { vegetarian: true } },
  { id: 'egg-based', label: 'Egg-based meals', infers: { budgetSignal: 'budget' } },
  { id: 'chicken-fish', label: 'Chicken and fish regularly', infers: { budgetSignal: 'moderate' } },
  { id: 'plant-based', label: 'Plant-based meals', infers: { vegan: true } },
  { id: 'eat-outside', label: 'Frequently eat outside', infers: { budgetSignal: 'moderate', cooking: 'low' } },
  { id: 'convenience', label: 'Convenience foods', infers: { budgetSignal: 'moderate', cooking: 'low' } },
  { id: 'athlete-focused', label: 'Athlete-focused eating', infers: { budgetSignal: 'premium', cooking: 'high' } },
  { id: 'high-protein', label: 'High-protein lifestyle', infers: { budgetSignal: 'premium' } },
  { id: 'balanced-mixed', label: 'Balanced mixed diet', infers: {} },
];

export interface ProteinSource {
  id: string;
  label: string;
  tier: BudgetTier;
  proteinPer100g: number;
  vegetarian: boolean;
  vegan: boolean;
}

export const proteinSources: ProteinSource[] = [
  { id: 'eggs', label: 'Eggs', tier: 'budget', proteinPer100g: 13, vegetarian: true, vegan: false },
  { id: 'lentils', label: 'Lentils & beans', tier: 'budget', proteinPer100g: 9, vegetarian: true, vegan: true },
  { id: 'paneer', label: 'Paneer / cottage cheese', tier: 'budget', proteinPer100g: 18, vegetarian: true, vegan: false },
  { id: 'milk-curd', label: 'Milk & curd', tier: 'budget', proteinPer100g: 4, vegetarian: true, vegan: false },
  { id: 'soy', label: 'Soy chunks / tofu', tier: 'budget', proteinPer100g: 17, vegetarian: true, vegan: true },
  { id: 'peanuts', label: 'Peanuts & nut butters', tier: 'budget', proteinPer100g: 25, vegetarian: true, vegan: true },
  { id: 'chicken', label: 'Chicken', tier: 'moderate', proteinPer100g: 27, vegetarian: false, vegan: false },
  { id: 'fish', label: 'Fish', tier: 'moderate', proteinPer100g: 22, vegetarian: false, vegan: false },
  { id: 'red-meat', label: 'Red meat', tier: 'premium', proteinPer100g: 26, vegetarian: false, vegan: false },
  { id: 'whey', label: 'Whey protein', tier: 'premium', proteinPer100g: 80, vegetarian: true, vegan: false },
  { id: 'plant-protein', label: 'Plant protein powder', tier: 'premium', proteinPer100g: 75, vegetarian: true, vegan: true },
];

export interface MealTimingRule {
  goal: 'muscle-growth' | 'fat-loss' | 'max-strength' | 'default';
  guidance: string[];
}

export const mealTimingRules: MealTimingRule[] = [
  {
    goal: 'muscle-growth',
    guidance: [
      'Spread protein across 3–5 meals, 0.4 g/kg per meal, so muscle protein synthesis stays elevated.',
      'Place a carb + protein meal within 2 hours after training to support recovery.',
      'A protein-rich meal before sleep (e.g. curd, paneer, or casein) supports overnight recovery.',
    ],
  },
  {
    goal: 'fat-loss',
    guidance: [
      'Front-load protein at breakfast — it is the most filling macronutrient and protects muscle in a deficit.',
      'Keep most carbs around your training window for energy and recovery.',
      'Plan meals in advance: hunger decisions made in the moment default to convenience food.',
    ],
  },
  {
    goal: 'max-strength',
    guidance: [
      'Eat a carb-containing meal 1–2 hours before heavy sessions for peak output.',
      'Do not train fasted on maximal-strength days.',
    ],
  },
  {
    goal: 'default',
    guidance: [
      'Aim for protein at every meal, and eat within a consistent daily window your schedule can sustain.',
      'Have a normal balanced meal within 2 hours of finishing training.',
    ],
  },
];

export const micronutrientReminders: string[] = [
  'Vegetables at 2+ meals daily cover most micronutrient needs — variety beats supplements.',
  'If you rarely get sunlight, vitamin D is the one supplement worth discussing with a doctor.',
  'Vegetarian and vegan lifters should watch iron and B12 (fortified foods or supplements).',
  'Salt lost in sweat matters on hard training days — do not aggressively restrict sodium while training.',
];

export const supplementGuidance: Record<BudgetTier, string[]> = {
  budget: [
    'No supplement is required — whole foods can cover everything at your intake level.',
    'Creatine monohydrate (~3–5 g/day) is the only cheap, strongly evidence-backed option if you want one.',
  ],
  moderate: [
    'Creatine monohydrate 3–5 g/day is the best-evidence performance supplement.',
    'Whey protein is a convenience, not a requirement — use it only on days food falls short.',
  ],
  premium: [
    'Creatine monohydrate 3–5 g/day, and whey/plant protein as convenient toppers on training days.',
    'Caffeine 1–3 mg/kg pre-training aids performance if it does not disturb your sleep.',
  ],
};

/**
 * Budget inference: premium signals only win when nothing indicates budget
 * constraints; explicit budget signals (home-cooked, egg-based, student-style
 * eating) always pull the tier down. Deterministic and explainable.
 */
export function inferBudgetTier(habitIds: string[], proteinSourceIds: string[]): BudgetTier {
  const habitSignals = habitIds
    .map((id) => foodHabits.find((h) => h.id === id)?.infers.budgetSignal)
    .filter((s): s is BudgetTier => Boolean(s));
  const sourceTiers = proteinSourceIds
    .map((id) => proteinSources.find((s) => s.id === id)?.tier)
    .filter((t): t is BudgetTier => Boolean(t));

  const all = [...habitSignals, ...sourceTiers];
  if (all.length === 0) return 'moderate';
  const counts = { budget: 0, moderate: 0, premium: 0 };
  for (const t of all) counts[t]++;
  // Any budget signal caps the tier at moderate unless premium clearly dominates.
  if (counts.budget > 0 && counts.premium <= counts.budget) return 'budget';
  if (counts.premium > counts.budget + counts.moderate) return 'premium';
  return 'moderate';
}
