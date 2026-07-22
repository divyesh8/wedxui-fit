import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth/session';
import { aiOnboardingSchema } from '@/lib/validations/ai-onboarding';
import { buildAthleteProfile, experienceToDbLevel } from '@/lib/ai/athlete-profile';
import { generateIntelligentPlan } from '@/lib/ai/workout-engine';
import { generateNutritionPlan, goalToLegacy } from '@/lib/ai/nutrition-engine';
import { getDietSettings, getWorkoutSettings } from '@/lib/settings/service';
import type { AiOnboardingInput, AthleteProfile } from '@/lib/ai/types';
import type { Prisma, UserProfile } from '@prisma/client';

export const runtime = 'nodejs';

export async function GET() {
  const sessionUser = await getSessionUser();
  if (!sessionUser) return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });

  const profile = await prisma.userProfile.findUnique({ where: { userId: sessionUser.id } });
  return NextResponse.json({
    athleteProfile: profile?.athleteProfile ?? null,
    aiPlan: profile?.aiPlan ?? null,
    aiNutritionPlan: profile?.aiNutritionPlan ?? null,
  });
}

/** Rebuild the engine input from persisted columns + Json blobs (regeneration path). */
function reconstructInput(row: UserProfile, name: string): AiOnboardingInput | null {
  const stored = row.athleteProfile as unknown as AthleteProfile | null;
  const nutrition = (row.nutritionProfile ?? {}) as Record<string, unknown>;
  if (!stored || !row.physique || !row.trainingStyle) return null;
  return {
    physique: stored.physique,
    goalsRanked: stored.goalsRanked,
    trainingStyle: stored.trainingStyle,
    equipmentCards: (nutrition.equipmentCards as string[]) ?? ['bodyweight'],
    experienceTier: stored.experienceTier,
    name,
    age: row.age ?? 25,
    gender: (row.gender ?? 'OTHER') as AiOnboardingInput['gender'],
    heightCm: row.heightCm ?? 170,
    weightKg: row.weightKg ?? 70,
    bodyFatPct: row.bodyFatPct,
    occupation: (row.occupation ?? 'sedentary-job') as AiOnboardingInput['occupation'],
    sleepHours: row.sleepHours ?? 7,
    stressLevel: row.stressLevel ?? 3,
    daysPerWeek: row.daysPerWeek ?? 3,
    sessionMinutes: row.sessionMinutes ?? 60,
    injuries: row.injuries ?? '',
    medicalNotes: row.medicalNotes ?? '',
    foodHabits: (nutrition.foodHabits as string[]) ?? [],
    proteinSources: (nutrition.proteinSources as string[]) ?? [],
    foodsAvoided: (nutrition.foodsAvoided as string) ?? '',
    allergies: (nutrition.allergies as string) ?? '',
    cookingAbility: (nutrition.cookingAbility as AiOnboardingInput['cookingAbility']) ?? 'medium',
    mealsPerDay: (nutrition.mealsPerDay as number) ?? 3,
    waterHabit: (nutrition.waterHabit as AiOnboardingInput['waterHabit']) ?? 'moderate',
    supplements: (nutrition.supplements as string) ?? '',
  };
}

export async function POST(req: Request) {
  const sessionUser = await getSessionUser();
  if (!sessionUser) return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const isRegeneration = Object.keys(body).length === 0;

  const existingRow = await prisma.userProfile.findUnique({ where: { userId: sessionUser.id } });
  const user = await prisma.user.findUniqueOrThrow({ where: { id: sessionUser.id }, select: { isPro: true, name: true } });

  let input: AiOnboardingInput;
  if (isRegeneration) {
    const rebuilt = existingRow ? reconstructInput(existingRow, user.name ?? 'Warrior') : null;
    if (!rebuilt) {
      return NextResponse.json({ error: 'No AI profile to regenerate from — complete the assessment first.' }, { status: 404 });
    }
    // Free tier: one regeneration per day; Pro: unlimited.
    const prevPlan = existingRow?.aiPlan as { generatedAt?: string } | null;
    if (!user.isPro && prevPlan?.generatedAt) {
      const ageMs = Date.now() - new Date(prevPlan.generatedAt).getTime();
      if (ageMs < 24 * 60 * 60 * 1000) {
        return NextResponse.json(
          { error: 'Free plan regeneration is once per day — upgrade to Pro for unlimited regenerations.', pro: false },
          { status: 429 }
        );
      }
    }
    input = rebuilt;
  } else {
    const parsed = aiOnboardingSchema.safeParse(body);
    if (!parsed.success) {
      const issue = parsed.error.issues[0];
      return NextResponse.json({ error: issue.message, field: issue.path.join('.') }, { status: 400 });
    }
    input = parsed.data as AiOnboardingInput;
  }

  // Overlay domain Workout & Diet settings onto input
  const [wSettings, dSettings] = await Promise.all([
    getWorkoutSettings(sessionUser.id),
    getDietSettings(sessionUser.id),
  ]);

  if (wSettings.preferredDuration) input.sessionMinutes = wSettings.preferredDuration;
  if (wSettings.trainingDays && wSettings.trainingDays.length > 0) input.daysPerWeek = wSettings.trainingDays.length;
  if (wSettings.defaultEquipment && wSettings.defaultEquipment.length > 0) input.equipmentCards = wSettings.defaultEquipment;
  if (wSettings.difficulty) {
    const diffMap: Record<string, AiOnboardingInput['experienceTier']> = {
      BEGINNER: 'BEGINNER',
      INTERMEDIATE: 'INTERMEDIATE',
      ADVANCED: 'ADVANCED',
      EXPERT: 'ADVANCED',
    };
    input.experienceTier = diffMap[wSettings.difficulty] || 'INTERMEDIATE';
  }

  if (dSettings.allergies !== undefined) input.allergies = dSettings.allergies;
  if (dSettings.mealsPerDay) input.mealsPerDay = dSettings.mealsPerDay;

  // Deterministic pipeline: profile → workout plan → nutrition plan.
  const athleteProfile = buildAthleteProfile(input);
  if (dSettings.budgetTier) {
    athleteProfile.budgetTier = dSettings.budgetTier as 'budget' | 'moderate' | 'premium';
  }
  const aiPlan = { ...generateIntelligentPlan(athleteProfile), generatedAt: new Date().toISOString() };
  const aiNutritionPlan = generateNutritionPlan(input, athleteProfile);

  // Persist AI columns + legacy-compat columns (existing dashboard/session
  // routes read goal/experience/equipment/etc. and must keep working).
  const nutritionProfile = {
    foodHabits: input.foodHabits,
    proteinSources: input.proteinSources,
    foodsAvoided: input.foodsAvoided,
    allergies: input.allergies,
    cookingAbility: input.cookingAbility,
    mealsPerDay: input.mealsPerDay,
    waterHabit: input.waterHabit,
    supplements: input.supplements,
    equipmentCards: input.equipmentCards,
  };
  const data = {
    physique: input.physique,
    trainingStyle: input.trainingStyle,
    goalsRanked: input.goalsRanked,
    stressLevel: input.stressLevel,
    occupation: input.occupation,
    nutritionProfile: nutritionProfile as Prisma.InputJsonValue,
    athleteProfile: athleteProfile as unknown as Prisma.InputJsonValue,
    aiPlan: aiPlan as unknown as Prisma.InputJsonValue,
    aiNutritionPlan: aiNutritionPlan as unknown as Prisma.InputJsonValue,
    // Legacy-compat mirror
    age: input.age,
    gender: input.gender,
    heightCm: input.heightCm,
    weightKg: input.weightKg,
    bodyFatPct: input.bodyFatPct,
    goal: goalToLegacy(input.goalsRanked[0]),
    experience: experienceToDbLevel(input.experienceTier),
    equipment: athleteProfile.equipment,
    daysPerWeek: input.daysPerWeek,
    sessionMinutes: input.sessionMinutes,
    sleepHours: input.sleepHours,
    diet: athleteProfile.dietFlags.vegan ? ('VEGAN' as const) : athleteProfile.dietFlags.vegetarian ? ('VEGETARIAN' as const) : ('BALANCED' as const),
    injuries: input.injuries,
    medicalNotes: input.medicalNotes,
  };

  await prisma.$transaction([
    prisma.user.update({ where: { id: sessionUser.id }, data: { name: input.name } }),
    prisma.userProfile.upsert({
      where: { userId: sessionUser.id },
      create: { userId: sessionUser.id, ...data },
      update: data,
    }),
  ]);

  return NextResponse.json({ athleteProfile, aiPlan, aiNutritionPlan });
}
