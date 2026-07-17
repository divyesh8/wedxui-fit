import { z } from 'zod';
import { physiques } from '@/data/knowledge/physiques';
import { trainingStyles } from '@/data/knowledge/training-styles';
import { equipmentCards } from '@/data/knowledge/equipment-cards';
import { goalProfiles } from '@/data/knowledge/volume-landmarks';
import { foodHabits, proteinSources } from '@/data/knowledge/nutrition-knowledge';

// Ids are validated against the knowledge base so the engine can never receive
// a value it has no rules for.
const physiqueIds = physiques.map((p) => p.id) as [string, ...string[]];
const styleIds = trainingStyles.map((s) => s.id) as [string, ...string[]];
const cardIds = equipmentCards.map((c) => c.id) as [string, ...string[]];
const goalIds = Object.keys(goalProfiles) as [string, ...string[]];
const habitIds = foodHabits.map((h) => h.id) as [string, ...string[]];
const sourceIds = proteinSources.map((s) => s.id) as [string, ...string[]];

export const aiOnboardingSchema = z.object({
  physique: z.enum(physiqueIds),
  goalsRanked: z.array(z.enum(goalIds)).min(1, 'Pick at least one goal').max(4),
  trainingStyle: z.enum(styleIds),
  equipmentCards: z.array(z.enum(cardIds)).min(1, 'Pick your equipment'),
  experienceTier: z.enum(['NEVER_TRAINED', 'BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'ELITE']),

  name: z.string().trim().min(1).max(50),
  age: z.coerce.number().int().min(10).max(100),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']),
  heightCm: z.coerce.number().min(100).max(250),
  weightKg: z.coerce.number().min(30).max(300),
  bodyFatPct: z.coerce.number().min(3).max(60).nullable(),
  occupation: z.enum(['sedentary-job', 'active-job', 'physical-job', 'student', 'shift-work']),
  sleepHours: z.coerce.number().min(3).max(14),
  stressLevel: z.coerce.number().int().min(1).max(5),
  daysPerWeek: z.coerce.number().int().min(1).max(7),
  sessionMinutes: z.coerce.number().int().min(15).max(180),
  injuries: z.string().max(500).default(''),
  medicalNotes: z.string().max(500).default(''),

  foodHabits: z.array(z.enum(habitIds)).max(11).default([]),
  proteinSources: z.array(z.enum(sourceIds)).max(11).default([]),
  foodsAvoided: z.string().max(300).default(''),
  allergies: z.string().max(300).default(''),
  cookingAbility: z.enum(['low', 'medium', 'high']),
  mealsPerDay: z.coerce.number().int().min(2).max(6),
  waterHabit: z.enum(['low', 'moderate', 'high']),
  supplements: z.string().max(300).default(''),
});

export type AiOnboardingParsed = z.infer<typeof aiOnboardingSchema>;
