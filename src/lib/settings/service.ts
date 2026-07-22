import { prisma } from '@/lib/prisma';
import type {
  PrivacySettingsInput,
  NotificationSettingsInput,
  WorkoutSettingsInput,
  DietSettingsInput,
  AiSettingsInput,
  AppearanceSettingsInput,
} from '@/lib/validations/settings';

/**
 * Read-side of the settings domains.
 *
 * These getters NEVER write. Plan generation and the workout session read
 * settings on every request; creating rows as a side effect of a read would
 * mean a GET silently mutating the database. Rows are created only when the
 * user actually saves something (PATCH /api/settings).
 *
 * SETTINGS_DEFAULTS must stay in sync with the `@default(...)` values in
 * prisma/schema.prisma — they are the same values, expressed twice, because a
 * missing row and a default row have to be indistinguishable to callers.
 */

export const SETTINGS_DEFAULTS = {
  privacy: {
    profileVisibility: 'private',
    showWeight: false,
    showProgressPhotos: false,
    showWorkoutHistory: false,
    showStreak: true,
    showAchievements: true,
    allowProfileSearch: false,
    personalizedAi: true,
    anonymousAnalytics: true,
  } satisfies PrivacySettingsInput,

  notifications: {
    workoutReminder: true,
    mealReminder: false,
    waterReminder: false,
    weeklyReport: true,
    monthlyReport: false,
    achievementAlerts: true,
    newFeatures: true,
    marketingEmails: false,
    quietStart: '22:00',
    quietEnd: '07:00',
    muteAll: false,
  } satisfies NotificationSettingsInput,

  workout: {
    preferredDuration: 60,
    difficulty: 'INTERMEDIATE',
    trainingDays: [],
    autoProgression: true,
    restTimerSec: 90,
    defaultEquipment: [],
    warmupEnabled: true,
    cooldownEnabled: true,
    audioCues: true,
    autoStartRestTimer: true,
  } satisfies WorkoutSettingsInput,

  diet: {
    dietType: 'BALANCED',
    allergies: '',
    cuisinePreference: '',
    waterGoalMl: 2500,
    proteinGoalG: null,
    calorieGoal: null,
    mealsPerDay: 3,
    fastingWindow: null,
    supplements: '',
    budgetTier: 'moderate',
    aiMealPlanning: true,
  } satisfies DietSettingsInput,

  ai: {
    personality: 'professional',
    communicationStyle: 'short',
    motivationFrequency: 'medium',
    weeklyCheckins: true,
    dailyCheckins: false,
    adaptiveWorkouts: true,
    adaptiveDiet: true,
    rememberPreferences: true,
  } satisfies AiSettingsInput,

  appearance: {
    theme: 'dark',
    accentColor: 'red',
    glassIntensity: 'medium',
    fontSize: 'medium',
    compactMode: false,
    animations: true,
    reduceMotion: false,
    roundedCorners: 'medium',
    dashboardLayout: 'large',
  } satisfies AppearanceSettingsInput,

  account: {
    timezone: 'UTC',
  },
} as const;

/** Strips Prisma bookkeeping columns so the client sees only real settings. */
function clean<T extends Record<string, unknown>>(row: T | null) {
  if (!row) return null;
  const { id: _id, userId: _userId, createdAt: _createdAt, updatedAt: _updatedAt, ...rest } = row;
  return rest;
}

export async function getWorkoutSettings(userId: string): Promise<WorkoutSettingsInput> {
  const row = await prisma.workoutSettings.findUnique({ where: { userId } });
  return { ...SETTINGS_DEFAULTS.workout, ...(clean(row) ?? {}) } as WorkoutSettingsInput;
}

export async function getDietSettings(userId: string): Promise<DietSettingsInput> {
  const row = await prisma.dietSettings.findUnique({ where: { userId } });
  return { ...SETTINGS_DEFAULTS.diet, ...(clean(row) ?? {}) } as DietSettingsInput;
}

export async function getAiSettings(userId: string): Promise<AiSettingsInput> {
  const row = await prisma.aiSettings.findUnique({ where: { userId } });
  return { ...SETTINGS_DEFAULTS.ai, ...(clean(row) ?? {}) } as AiSettingsInput;
}

export async function getPrivacySettings(userId: string): Promise<PrivacySettingsInput> {
  const row = await prisma.privacySettings.findUnique({ where: { userId } });
  return { ...SETTINGS_DEFAULTS.privacy, ...(clean(row) ?? {}) } as PrivacySettingsInput;
}

/** IANA zone for day-boundary maths (streaks, "today"). Falls back to UTC. */
export async function getUserTimezone(userId: string): Promise<string> {
  const row = await prisma.userSettings.findUnique({
    where: { userId },
    select: { timezone: true },
  });
  return row?.timezone || 'UTC';
}

export interface SettingsBundle {
  privacy: PrivacySettingsInput;
  notifications: NotificationSettingsInput;
  workout: WorkoutSettingsInput;
  diet: DietSettingsInput;
  ai: AiSettingsInput;
  appearance: AppearanceSettingsInput;
  account: { timezone: string };
  security: {
    twoFactorEnabled: boolean;
    recoveryCodeCount: number;
    lastPasswordChange: Date | null;
  };
}

/** Every domain in one round trip — what GET /api/settings returns. */
export async function getSettingsBundle(userId: string): Promise<SettingsBundle> {
  const [privacy, notifications, workout, diet, ai, appearance, account, security] = await Promise.all([
    prisma.privacySettings.findUnique({ where: { userId } }),
    prisma.notificationSettings.findUnique({ where: { userId } }),
    prisma.workoutSettings.findUnique({ where: { userId } }),
    prisma.dietSettings.findUnique({ where: { userId } }),
    prisma.aiSettings.findUnique({ where: { userId } }),
    prisma.appearanceSettings.findUnique({ where: { userId } }),
    prisma.userSettings.findUnique({ where: { userId }, select: { timezone: true } }),
    prisma.securitySettings.findUnique({ where: { userId } }),
  ]);

  return {
    privacy: { ...SETTINGS_DEFAULTS.privacy, ...(clean(privacy) ?? {}) } as PrivacySettingsInput,
    notifications: {
      ...SETTINGS_DEFAULTS.notifications,
      ...(clean(notifications) ?? {}),
    } as NotificationSettingsInput,
    workout: { ...SETTINGS_DEFAULTS.workout, ...(clean(workout) ?? {}) } as WorkoutSettingsInput,
    diet: { ...SETTINGS_DEFAULTS.diet, ...(clean(diet) ?? {}) } as DietSettingsInput,
    ai: { ...SETTINGS_DEFAULTS.ai, ...(clean(ai) ?? {}) } as AiSettingsInput,
    appearance: {
      ...SETTINGS_DEFAULTS.appearance,
      ...(clean(appearance) ?? {}),
    } as AppearanceSettingsInput,
    account: { timezone: account?.timezone || 'UTC' },
    security: {
      twoFactorEnabled: security?.twoFactorEnabled ?? false,
      recoveryCodeCount: security?.recoveryCodes?.length ?? 0,
      lastPasswordChange: security?.lastPasswordChange ?? null,
    },
  };
}

/**
 * Calendar date in the user's own timezone, as YYYY-MM-DD.
 * Streaks break on local midnight, not UTC midnight — a 1am session in IST
 * belongs to the day the user thinks it does.
 */
export function localDateKey(date: Date, timezone: string): string {
  try {
    // en-CA formats as YYYY-MM-DD, which sorts and compares lexicographically.
    return new Intl.DateTimeFormat('en-CA', {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(date);
  } catch {
    return new Intl.DateTimeFormat('en-CA', {
      timeZone: 'UTC',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(date);
  }
}
