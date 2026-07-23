/**
 * Zod-free settings constants and helpers.
 *
 * These live apart from validations/settings.ts on purpose. The settings page
 * and its controls need the value sets and the strength meter, but importing
 * them from the schema module pulled all of zod (~57 kB) into the client
 * bundle. Nothing here imports zod, so the client pays only for what it uses;
 * validations/settings.ts re-exports these for server-side schema building.
 */

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

/** Each accent maps to a real hex applied as a CSS variable — see applyAppearance(). */
export const ACCENT_COLORS = ['red', 'orange', 'green', 'blue', 'violet'] as const;

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

export interface SecurityScore {
  score: number;
  label: 'Weak' | 'Medium' | 'Strong';
  tips: string[];
}

/**
 * 0–100 based on real account state, not vibes.
 *
 * Lives here (not in security.ts) because the security card renders it client
 * side, and security.ts imports node crypto + bcryptjs — importing that module
 * into a client component drags server-only code into the browser bundle.
 * This function is pure, so both server and client can share it safely.
 */
export function securityScore(input: {
  twoFactorEnabled: boolean;
  recoveryCodeCount: number;
  activeDevices: number;
  lastPasswordChange: Date | null;
}): SecurityScore {
  let score = 40; // baseline: bcrypt-hashed password + server-side sessions
  const tips: string[] = [];

  if (input.twoFactorEnabled) score += 35;
  else tips.push('Enable two-factor authentication — the single biggest win.');

  if (input.recoveryCodeCount > 0) score += 10;
  else if (input.twoFactorEnabled) tips.push('Generate recovery codes so you cannot be locked out.');

  if (input.activeDevices <= 3) score += 10;
  else tips.push(`${input.activeDevices} devices are signed in — revoke any you don't recognise.`);

  const ninetyDays = 90 * 24 * 60 * 60 * 1000;
  if (input.lastPasswordChange && Date.now() - input.lastPasswordChange.getTime() < ninetyDays) {
    score += 5;
  }

  const clamped = Math.max(0, Math.min(100, score));
  return {
    score: clamped,
    label: clamped >= 80 ? 'Strong' : clamped >= 55 ? 'Medium' : 'Weak',
    tips,
  };
}
