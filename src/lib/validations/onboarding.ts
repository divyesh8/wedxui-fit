import { z } from 'zod';

// Enum values mirror prisma/schema.prisma so profiles sync cleanly once the API layer lands.
export const GOALS = [
  { value: 'STRENGTH', label: 'Build Strength', icon: '🏋️' },
  { value: 'MUSCLE', label: 'Build Muscle', icon: '💪' },
  { value: 'FATLOSS', label: 'Lose Fat', icon: '🔥' },
  { value: 'ENDURANCE', label: 'Endurance', icon: '🏃' },
  { value: 'CALISTHENICS', label: 'Calisthenics', icon: '🤸' },
  { value: 'GENERAL', label: 'General Fitness', icon: '⚡' },
] as const;

export const EXPERIENCE_LEVELS = [
  { value: 'BEGINNER', label: 'Beginner', hint: 'Less than 6 months' },
  { value: 'INTERMEDIATE', label: 'Intermediate', hint: '6 months – 2 years' },
  { value: 'ADVANCED', label: 'Advanced', hint: '2+ years' },
] as const;

export const EQUIPMENT_OPTIONS = [
  { value: 'NONE', label: 'Bodyweight Only' },
  { value: 'DUMBBELLS', label: 'Dumbbells' },
  { value: 'BARBELL', label: 'Barbell' },
  { value: 'PULLUP_BAR', label: 'Pull-up Bar' },
  { value: 'RESISTANCE_BANDS', label: 'Bands' },
  { value: 'KETTLEBELL', label: 'Kettlebell' },
  { value: 'FULL_GYM', label: 'Full Gym' },
] as const;

export const MUSCLE_OPTIONS = [
  { value: 'CHEST', label: 'Chest' },
  { value: 'BACK', label: 'Back' },
  { value: 'SHOULDERS', label: 'Shoulders' },
  { value: 'ARMS', label: 'Arms' },
  { value: 'LEGS', label: 'Legs' },
  { value: 'CORE', label: 'Core' },
] as const;

export const DIETS = [
  { value: 'BALANCED', label: 'Balanced' },
  { value: 'HIGH_PROTEIN', label: 'High Protein' },
  { value: 'KETO', label: 'Keto' },
  { value: 'VEGAN', label: 'Vegan' },
  { value: 'VEGETARIAN', label: 'Vegetarian' },
] as const;

export const onboardingSchema = z.object({
  name: z.string().trim().min(1, 'Tell us your name').max(50),
  age: z.coerce.number().int().min(10, 'Age must be 10–100').max(100, 'Age must be 10–100'),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']),
  heightCm: z.coerce.number().min(100, 'Height must be 100–250 cm').max(250, 'Height must be 100–250 cm'),
  weightKg: z.coerce.number().min(30, 'Weight must be 30–300 kg').max(300, 'Weight must be 30–300 kg'),
  bodyFatPct: z.coerce.number().min(3).max(60).nullable(),
  goal: z.enum(['STRENGTH', 'MUSCLE', 'FATLOSS', 'ENDURANCE', 'CALISTHENICS', 'GENERAL']),
  experience: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']),
  equipment: z.array(z.enum(['NONE', 'DUMBBELLS', 'BARBELL', 'PULLUP_BAR', 'RESISTANCE_BANDS', 'KETTLEBELL', 'FULL_GYM'])).min(1, 'Pick at least one'),
  daysPerWeek: z.number().int().min(1).max(7),
  sessionMinutes: z.number().int().min(15).max(180),
  targetMuscles: z.array(z.enum(['CHEST', 'BACK', 'SHOULDERS', 'ARMS', 'LEGS', 'CORE'])),
  sleepHours: z.coerce.number().min(3, 'Sleep must be 3–14 h').max(14, 'Sleep must be 3–14 h'),
  diet: z.enum(['BALANCED', 'HIGH_PROTEIN', 'KETO', 'VEGAN', 'VEGETARIAN']),
  injuries: z.string().max(500).default(''),
  medicalNotes: z.string().max(500).default(''),
});

export type OnboardingProfile = z.infer<typeof onboardingSchema>;

// Used by PATCH /api/profile — every onboarding field is independently editable
// afterward, plus two profile-only override fields with no onboarding step.
export const profileUpdateSchema = onboardingSchema
  .omit({ name: true })
  .partial()
  .extend({
    name: z.string().trim().min(1, 'Name cannot be empty').max(50).optional(),
    image: z.string().url().optional().nullable(),
    waterIntakeMl: z.coerce.number().int().min(500, 'Water goal must be 500–10000 ml').max(10000, 'Water goal must be 500–10000 ml').optional(),
    targetWeightKg: z.coerce.number().min(30).max(300).optional().nullable(),
  });

export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;

/** Which profile fields each wizard step validates before advancing. */
export const STEP_FIELDS: (keyof OnboardingProfile)[][] = [
  ['name', 'age', 'gender'],
  ['heightCm', 'weightKg', 'bodyFatPct'],
  ['goal', 'experience'],
  ['equipment', 'daysPerWeek', 'sessionMinutes', 'targetMuscles'],
  ['sleepHours', 'diet', 'injuries', 'medicalNotes'],
];
