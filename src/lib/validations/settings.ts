import { z } from 'zod';

/**
 * Field names and value sets mirror prisma/schema.prisma EXACTLY, so a parsed
 * object is handed straight to prisma.<model>.upsert() with no remapping.
 * Zod strips unknown keys by default — that is what makes the direct upsert safe.
 *
 * Every schema is `.partial()` at the point of use: the client PATCHes only the
 * field the user touched, and Prisma column defaults fill the rest on create.
 */

// ─── Shared value sets ─────────────────────────────────
//
// Defined in ../settings/constants (zod-free) and re-exported here, so client
// components can import the value sets without pulling zod into their bundle.

import {
  ACCENT_COLORS,
  BUDGET_TIERS,
  DIET_TYPES,
  DIFFICULTIES,
  DURATIONS,
  EQUIPMENT_VALUES,
  TRAINING_DAYS,
} from '@/lib/settings/constants';

export {
  ACCENT_COLORS,
  BUDGET_TIERS,
  DIET_TYPES,
  DIFFICULTIES,
  DURATIONS,
  EQUIPMENT_VALUES,
  TRAINING_DAYS,
};
export { passwordStrength, type PasswordStrength } from '@/lib/settings/constants';

const HHMM = /^([01]\d|2[0-3]):[0-5]\d$/;
const timeString = z.string().regex(HHMM, 'Use 24-hour HH:MM, e.g. 22:30');

// ─── Privacy ───────────────────────────────────────────

export const privacySettingsSchema = z.object({
  profileVisibility: z.enum(['public', 'followers', 'private']),
  showWeight: z.boolean(),
  showProgressPhotos: z.boolean(),
  showWorkoutHistory: z.boolean(),
  showStreak: z.boolean(),
  showAchievements: z.boolean(),
  allowProfileSearch: z.boolean(),
  personalizedAi: z.boolean(),
  anonymousAnalytics: z.boolean(),
});

// ─── Notifications ─────────────────────────────────────

export const notificationSettingsSchema = z.object({
  workoutReminder: z.boolean(),
  mealReminder: z.boolean(),
  waterReminder: z.boolean(),
  weeklyReport: z.boolean(),
  monthlyReport: z.boolean(),
  achievementAlerts: z.boolean(),
  newFeatures: z.boolean(),
  marketingEmails: z.boolean(),
  quietStart: timeString,
  quietEnd: timeString,
  muteAll: z.boolean(),
});

// ─── Workout ───────────────────────────────────────────

export const workoutSettingsSchema = z.object({
  preferredDuration: z
    .number()
    .int()
    .refine((n) => (DURATIONS as readonly number[]).includes(n), 'Pick a preset session length'),
  difficulty: z.enum(DIFFICULTIES),
  trainingDays: z.array(z.enum(TRAINING_DAYS)).max(7, 'A week has seven days'),
  autoProgression: z.boolean(),
  // 15s–10min. Below 15s the timer is noise; above 10min it is not a rest timer.
  restTimerSec: z.number().int().min(15, 'Minimum 15 seconds').max(600, 'Maximum 10 minutes'),
  defaultEquipment: z.array(z.enum(EQUIPMENT_VALUES)),
  warmupEnabled: z.boolean(),
  cooldownEnabled: z.boolean(),
  audioCues: z.boolean(),
  autoStartRestTimer: z.boolean(),
});

// ─── Diet ──────────────────────────────────────────────

export const dietSettingsSchema = z.object({
  dietType: z.enum(DIET_TYPES),
  allergies: z.string().max(500, 'Keep it under 500 characters'),
  cuisinePreference: z.string().max(500, 'Keep it under 500 characters'),
  waterGoalMl: z.number().int().min(500, 'At least 500 ml').max(8000, 'At most 8000 ml'),
  proteinGoalG: z.number().int().min(20).max(400).nullable(),
  calorieGoal: z.number().int().min(1000).max(6000).nullable(),
  mealsPerDay: z.number().int().min(1, 'At least one meal').max(8, 'At most eight meals'),
  fastingWindow: z.enum(['16:8', '18:6', '20:4', '5:2']).nullable(),
  supplements: z.string().max(500, 'Keep it under 500 characters'),
  budgetTier: z.enum(BUDGET_TIERS),
  aiMealPlanning: z.boolean(),
});

// ─── AI ────────────────────────────────────────────────

export const aiSettingsSchema = z.object({
  personality: z.enum(['professional', 'friendly', 'tough-love', 'analytical']),
  communicationStyle: z.enum(['short', 'detailed', 'scientific']),
  motivationFrequency: z.enum(['low', 'medium', 'high']),
  weeklyCheckins: z.boolean(),
  dailyCheckins: z.boolean(),
  adaptiveWorkouts: z.boolean(),
  adaptiveDiet: z.boolean(),
  rememberPreferences: z.boolean(),
});

// ─── Appearance ────────────────────────────────────────

export const appearanceSettingsSchema = z.object({
  theme: z.enum(['dark', 'light', 'system']),
  accentColor: z.enum(ACCENT_COLORS),
  glassIntensity: z.enum(['low', 'medium', 'high']),
  fontSize: z.enum(['small', 'medium', 'large']),
  compactMode: z.boolean(),
  animations: z.boolean(),
  reduceMotion: z.boolean(),
  roundedCorners: z.enum(['none', 'small', 'medium', 'large']),
  dashboardLayout: z.enum(['large', 'compact']),
});

// ─── Account (UserSettings) ────────────────────────────
//
// Only `timezone` is exposed. UserSettings also carries unitSystem / language /
// country, but nothing in the app reads them (no unit conversion, no i18n), and
// shipping a control that changes nothing is exactly what the spec forbids.
// The columns stay in the schema, unused, until a feature actually consumes them.

export const accountSettingsSchema = z.object({
  timezone: z
    .string()
    .min(1, 'Pick a timezone')
    .max(64)
    .refine((tz) => {
      try {
        new Intl.DateTimeFormat('en-US', { timeZone: tz });
        return true;
      } catch {
        return false;
      }
    }, 'Not a recognised IANA timezone'),
});

// ─── Domain registry ───────────────────────────────────

export const settingsSchemas = {
  privacy: privacySettingsSchema,
  notifications: notificationSettingsSchema,
  workout: workoutSettingsSchema,
  diet: dietSettingsSchema,
  ai: aiSettingsSchema,
  appearance: appearanceSettingsSchema,
  account: accountSettingsSchema,
} as const;

export type SettingsDomain = keyof typeof settingsSchemas;

export const SETTINGS_DOMAINS = Object.keys(settingsSchemas) as SettingsDomain[];

export function isSettingsDomain(value: string | null): value is SettingsDomain {
  return value !== null && Object.prototype.hasOwnProperty.call(settingsSchemas, value);
}

/** Prisma delegate name per domain — keeps the PATCH handler free of a switch. */
export const DOMAIN_MODEL = {
  privacy: 'privacySettings',
  notifications: 'notificationSettings',
  workout: 'workoutSettings',
  diet: 'dietSettings',
  ai: 'aiSettings',
  appearance: 'appearanceSettings',
  account: 'userSettings',
} as const satisfies Record<SettingsDomain, string>;

export type PrivacySettingsInput = z.infer<typeof privacySettingsSchema>;
export type NotificationSettingsInput = z.infer<typeof notificationSettingsSchema>;
export type WorkoutSettingsInput = z.infer<typeof workoutSettingsSchema>;
export type DietSettingsInput = z.infer<typeof dietSettingsSchema>;
export type AiSettingsInput = z.infer<typeof aiSettingsSchema>;
export type AppearanceSettingsInput = z.infer<typeof appearanceSettingsSchema>;
export type AccountSettingsInput = z.infer<typeof accountSettingsSchema>;

// ─── Password ──────────────────────────────────────────

export const passwordChangeSchema = z
  .object({
    currentPassword: z.string().min(1, 'Enter your current password'),
    newPassword: z.string().min(8, 'Password must be at least 8 characters').max(128),
    confirmPassword: z.string(),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords do not match',
  })
  .refine((d) => d.newPassword !== d.currentPassword, {
    path: ['newPassword'],
    message: 'New password must be different from the current one',
  });
