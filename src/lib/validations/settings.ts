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

export const TRAINING_DAYS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'] as const;

/** Mirrors the Equipment enum in schema.prisma (stored as String[] here). */
export const EQUIPMENT_VALUES = [
  'NONE',
  'DUMBBELLS',
  'BARBELL',
  'PULLUP_BAR',
  'FULL_GYM',
  'RESISTANCE_BANDS',
  'KETTLEBELL',
  'CABLE_MACHINE',
] as const;

/** Mirrors the DietPreference enum in schema.prisma. */
export const DIET_TYPES = ['BALANCED', 'HIGH_PROTEIN', 'KETO', 'VEGAN', 'VEGETARIAN'] as const;

/** Mirrors ExperienceLevel — WorkoutSettings.difficulty defaults to "INTERMEDIATE". */
export const DIFFICULTIES = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'] as const;

/** Matches BudgetTier in src/data/knowledge/nutrition-knowledge.ts. */
export const BUDGET_TIERS = ['budget', 'moderate', 'premium'] as const;

/** Preset session lengths the workout engine is tuned for. */
export const DURATIONS = [15, 30, 45, 60, 90, 120] as const;

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

/** Each accent maps to a real hex applied as a CSS variable — see applyAppearance(). */
export const ACCENT_COLORS = ['red', 'orange', 'green', 'blue', 'violet'] as const;

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

export interface PasswordStrength {
  /** 0–4. Drives both the meter width and its colour. */
  score: 0 | 1 | 2 | 3 | 4;
  label: 'Very weak' | 'Weak' | 'Fair' | 'Strong' | 'Excellent';
  /** Concrete, actionable — never generic "make it stronger". */
  suggestions: string[];
}

const COMMON_PATTERNS = [
  /^password/i,
  /^12345/,
  /^qwerty/i,
  /^letmein/i,
  /^welcome/i,
  /^admin/i,
  /^wedxui/i,
];

/**
 * Deterministic, dependency-free strength estimate. Deliberately NOT a security
 * boundary — the 8-character minimum in passwordChangeSchema is what is actually
 * enforced. This only tells the user how they are doing while they type.
 */
export function passwordStrength(password: string): PasswordStrength {
  const suggestions: string[] = [];
  if (!password) {
    return { score: 0, label: 'Very weak', suggestions: ['Use at least 12 characters'] };
  }

  let points = 0;
  if (password.length >= 8) points += 1;
  if (password.length >= 12) points += 1;
  if (password.length >= 16) points += 1;
  else if (password.length < 12) suggestions.push('Use at least 12 characters');

  const classes = [/[a-z]/, /[A-Z]/, /\d/, /[^A-Za-z0-9]/].filter((r) => r.test(password)).length;
  if (classes >= 3) points += 1;
  if (classes === 4) points += 1;
  if (classes < 3) suggestions.push('Mix upper case, lower case, numbers, and symbols');

  // A single repeated character or a straight run is length without entropy.
  if (/^(.)\1+$/.test(password) || /(.)\1{3,}/.test(password)) {
    points -= 2;
    suggestions.push('Avoid repeating the same character');
  }
  if (COMMON_PATTERNS.some((r) => r.test(password))) {
    points -= 2;
    suggestions.push('Avoid common words like "password" or "qwerty"');
  }

  const score = Math.max(0, Math.min(4, points)) as PasswordStrength['score'];
  const label = (['Very weak', 'Weak', 'Fair', 'Strong', 'Excellent'] as const)[score];
  return { score, label, suggestions };
}
