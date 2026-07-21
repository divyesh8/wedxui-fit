'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Activity,
  Apple,
  Bell,
  Brain,
  Check,
  Dumbbell,
  Loader2,
  Lock,
  Palette,
  ShieldCheck,
  User,
} from 'lucide-react';
import { useSettings } from '@/hooks/use-settings';
import {
  ChipSelect,
  Segmented,
  SettingRow,
  SettingsSection,
  SettingsSkeleton,
  Stepper,
  TextField,
  Toggle,
} from '@/components/settings/controls';
import { SecuritySection } from '@/components/settings/security-section';
import { applyAppearance } from '@/components/providers/appearance-provider';
import {
  ACCENT_COLORS,
  BUDGET_TIERS,
  DIET_TYPES,
  DIFFICULTIES,
  DURATIONS,
  EQUIPMENT_VALUES,
  TRAINING_DAYS,
} from '@/lib/validations/settings';

type TabId = 'account' | 'workout' | 'diet' | 'ai' | 'notifications' | 'privacy' | 'appearance' | 'security';

const TABS: { id: TabId; label: string; icon: typeof User }[] = [
  { id: 'account', label: 'Account', icon: User },
  { id: 'workout', label: 'Workout', icon: Dumbbell },
  { id: 'diet', label: 'Diet', icon: Apple },
  { id: 'ai', label: 'AI Coach', icon: Brain },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'privacy', label: 'Privacy', icon: Lock },
  { id: 'appearance', label: 'Appearance', icon: Palette },
  { id: 'security', label: 'Security', icon: ShieldCheck },
];

const titleCase = (s: string) =>
  s.toLowerCase().replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

/** Full IANA list where the browser exposes it; a sane subset where it does not. */
function useTimezones(): string[] {
  return useMemo(() => {
    const supported = (
      Intl as unknown as { supportedValuesOf?: (k: string) => string[] }
    ).supportedValuesOf;
    if (typeof supported === 'function') {
      try {
        return supported('timeZone');
      } catch {
        /* fall through */
      }
    }
    return [
      'UTC',
      'Asia/Kolkata',
      'Asia/Dubai',
      'Asia/Singapore',
      'Asia/Tokyo',
      'Europe/London',
      'Europe/Berlin',
      'America/New_York',
      'America/Chicago',
      'America/Los_Angeles',
      'Australia/Sydney',
    ];
  }, []);
}

export default function SettingsPage() {
  const { settings, loading, saveState, update } = useSettings();
  const [tab, setTab] = useState<TabId>('account');
  const timezones = useTimezones();

  // Appearance changes must be visible the instant they are made, not after the
  // round trip — the optimistic value is the one to paint from.
  useEffect(() => {
    if (settings?.appearance) applyAppearance(settings.appearance);
  }, [settings?.appearance]);

  return (
    <div className="mx-auto w-full max-w-4xl">
      <header className="mb-5">
        <div className="flex items-baseline justify-between gap-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Settings</h1>
          <SaveIndicator state={saveState} />
        </div>
        <p className="mt-1 text-sm text-wed-gray-500">
          Changes save automatically.
        </p>
      </header>

      {/* Horizontally scrollable on phones; wraps into a row on larger screens. */}
      <nav
        aria-label="Settings sections"
        className="-mx-4 mb-5 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0"
      >
        <div className="flex gap-2 min-w-max sm:min-w-0 sm:flex-wrap">
          {TABS.map(({ id, label, icon: Icon }) => {
            const active = tab === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => setTab(id)}
                aria-current={active ? 'page' : undefined}
                className={`inline-flex min-h-[44px] items-center gap-2 rounded-xl border px-3.5 text-sm font-medium transition-colors ${
                  active
                    ? 'border-wed-purple bg-wed-purple/15 text-white'
                    : 'border-white/10 bg-white/5 text-wed-gray-300 hover:bg-white/10'
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {label}
              </button>
            );
          })}
        </div>
      </nav>

      {loading || !settings ? (
        <SettingsSkeleton />
      ) : (
        <div className="space-y-4 pb-8">
          {tab === 'account' && (
            <SettingsSection
              title="Account"
              description="Your timezone decides when a day starts — streaks and today's workout follow it."
            >
              <SettingRow
                label="Timezone"
                description="Used for streak boundaries and daily resets."
                htmlFor="tz"
                stacked
              >
                <select
                  id="tz"
                  value={settings.account.timezone}
                  onChange={(e) => update('account', 'timezone', e.target.value)}
                  className="min-h-[44px] w-full rounded-xl border border-white/10 bg-black/40 px-3.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-wed-purple"
                >
                  {timezones.map((tz) => (
                    <option key={tz} value={tz} className="bg-wed-surface">
                      {tz.replace(/_/g, ' ')}
                    </option>
                  ))}
                </select>
              </SettingRow>
            </SettingsSection>
          )}

          {tab === 'workout' && (
            <SettingsSection
              title="Training"
              description="These feed the plan engine. Regenerate your plan to apply the first three."
            >
              <SettingRow
                label="Rest timer"
                description="Applies immediately to the timer between exercises."
                htmlFor="rest"
              >
                <Stepper
                  id="rest"
                  label="Rest timer seconds"
                  value={settings.workout.restTimerSec}
                  onChange={(v) => update('workout', 'restTimerSec', v)}
                  min={15}
                  max={600}
                  step={15}
                  unit="s"
                />
              </SettingRow>

              <SettingRow label="Session length" description="Caps how much work fits." stacked>
                <Segmented
                  label="Preferred session length"
                  value={settings.workout.preferredDuration}
                  onChange={(v) => update('workout', 'preferredDuration', v)}
                  options={DURATIONS.map((d) => ({ value: d, label: `${d}m` }))}
                />
              </SettingRow>

              <SettingRow label="Difficulty" description="Sets baseline volume." stacked>
                <Segmented
                  label="Difficulty"
                  value={settings.workout.difficulty}
                  onChange={(v) => update('workout', 'difficulty', v)}
                  options={DIFFICULTIES.map((d) => ({ value: d, label: titleCase(d) }))}
                />
              </SettingRow>

              <SettingRow
                label="Training days"
                description="How many days the engine programs."
                stacked
              >
                <ChipSelect
                  label="Training days"
                  values={settings.workout.trainingDays}
                  onChange={(v) => update('workout', 'trainingDays', v)}
                  options={TRAINING_DAYS.map((d) => ({ value: d, label: titleCase(d) }))}
                />
              </SettingRow>

              <SettingRow
                label="Available equipment"
                description="Only exercises you can actually do get selected."
                stacked
              >
                <ChipSelect
                  label="Available equipment"
                  values={settings.workout.defaultEquipment}
                  onChange={(v) => update('workout', 'defaultEquipment', v)}
                  options={EQUIPMENT_VALUES.map((e) => ({ value: e, label: titleCase(e) }))}
                />
              </SettingRow>

              <SettingRow label="Auto-start rest timer" htmlFor="autorest">
                <Toggle
                  id="autorest"
                  label="Auto-start rest timer"
                  checked={settings.workout.autoStartRestTimer}
                  onChange={(v) => update('workout', 'autoStartRestTimer', v)}
                />
              </SettingRow>
              <SettingRow label="Warm-up" htmlFor="warmup">
                <Toggle
                  id="warmup"
                  label="Warm-up"
                  checked={settings.workout.warmupEnabled}
                  onChange={(v) => update('workout', 'warmupEnabled', v)}
                />
              </SettingRow>
              <SettingRow label="Cool-down" htmlFor="cooldown">
                <Toggle
                  id="cooldown"
                  label="Cool-down"
                  checked={settings.workout.cooldownEnabled}
                  onChange={(v) => update('workout', 'cooldownEnabled', v)}
                />
              </SettingRow>
              <SettingRow
                label="Progressive overload"
                description="Adds load or reps week to week."
                htmlFor="autoprog"
              >
                <Toggle
                  id="autoprog"
                  label="Progressive overload"
                  checked={settings.workout.autoProgression}
                  onChange={(v) => update('workout', 'autoProgression', v)}
                />
              </SettingRow>
            </SettingsSection>
          )}

          {tab === 'diet' && (
            <SettingsSection
              title="Nutrition"
              description="Feeds the nutrition engine. Regenerate your plan to apply."
            >
              <SettingRow label="Diet type" stacked>
                <Segmented
                  label="Diet type"
                  value={settings.diet.dietType}
                  onChange={(v) => update('diet', 'dietType', v)}
                  options={DIET_TYPES.map((d) => ({ value: d, label: titleCase(d) }))}
                />
              </SettingRow>

              <SettingRow label="Food budget" description="Keeps meals realistic." stacked>
                <Segmented
                  label="Food budget"
                  value={settings.diet.budgetTier}
                  onChange={(v) => update('diet', 'budgetTier', v)}
                  options={BUDGET_TIERS.map((b) => ({ value: b, label: titleCase(b) }))}
                />
              </SettingRow>

              <SettingRow label="Meals per day" htmlFor="meals">
                <Stepper
                  id="meals"
                  label="Meals per day"
                  value={settings.diet.mealsPerDay}
                  onChange={(v) => update('diet', 'mealsPerDay', v)}
                  min={1}
                  max={8}
                />
              </SettingRow>

              <SettingRow label="Daily water goal" htmlFor="water">
                <Stepper
                  id="water"
                  label="Daily water goal millilitres"
                  value={settings.diet.waterGoalMl}
                  onChange={(v) => update('diet', 'waterGoalMl', v)}
                  min={500}
                  max={8000}
                  step={250}
                  unit="ml"
                />
              </SettingRow>

              <SettingRow
                label="Allergies and intolerances"
                description="Excluded from every meal suggestion."
                htmlFor="allergies"
                stacked
              >
                <TextField
                  id="allergies"
                  label="Allergies and intolerances"
                  multiline
                  value={settings.diet.allergies}
                  onChange={(v) => update('diet', 'allergies', v)}
                  placeholder="Peanuts, shellfish, lactose…"
                />
              </SettingRow>

              <SettingRow
                label="Cuisine preference"
                description="Nudges meal styles toward what you enjoy."
                htmlFor="cuisine"
                stacked
              >
                <TextField
                  id="cuisine"
                  label="Cuisine preference"
                  value={settings.diet.cuisinePreference}
                  onChange={(v) => update('diet', 'cuisinePreference', v)}
                  placeholder="South Indian, Mediterranean…"
                />
              </SettingRow>

              <SettingRow label="AI meal planning" htmlFor="aimeal">
                <Toggle
                  id="aimeal"
                  label="AI meal planning"
                  checked={settings.diet.aiMealPlanning}
                  onChange={(v) => update('diet', 'aiMealPlanning', v)}
                />
              </SettingRow>
            </SettingsSection>
          )}

          {tab === 'ai' && (
            <SettingsSection
              title="AI Coach"
              description="Changes how the coach explains its decisions to you."
            >
              <SettingRow label="Explanation depth" stacked>
                <Segmented
                  label="Explanation depth"
                  value={settings.ai.communicationStyle}
                  onChange={(v) => update('ai', 'communicationStyle', v)}
                  options={[
                    { value: 'short' as const, label: 'Short' },
                    { value: 'detailed' as const, label: 'Detailed' },
                    { value: 'scientific' as const, label: 'Scientific' },
                  ]}
                />
              </SettingRow>

              <SettingRow label="Tone" stacked>
                <Segmented
                  label="Tone"
                  value={settings.ai.personality}
                  onChange={(v) => update('ai', 'personality', v)}
                  options={[
                    { value: 'professional' as const, label: 'Professional' },
                    { value: 'friendly' as const, label: 'Friendly' },
                    { value: 'tough-love' as const, label: 'Tough love' },
                    { value: 'analytical' as const, label: 'Analytical' },
                  ]}
                />
              </SettingRow>

              <SettingRow label="Adapt workouts to my results" htmlFor="adaptw">
                <Toggle
                  id="adaptw"
                  label="Adapt workouts to my results"
                  checked={settings.ai.adaptiveWorkouts}
                  onChange={(v) => update('ai', 'adaptiveWorkouts', v)}
                />
              </SettingRow>
              <SettingRow label="Adapt nutrition to my results" htmlFor="adaptd">
                <Toggle
                  id="adaptd"
                  label="Adapt nutrition to my results"
                  checked={settings.ai.adaptiveDiet}
                  onChange={(v) => update('ai', 'adaptiveDiet', v)}
                />
              </SettingRow>
              <SettingRow label="Weekly check-ins" htmlFor="weekly">
                <Toggle
                  id="weekly"
                  label="Weekly check-ins"
                  checked={settings.ai.weeklyCheckins}
                  onChange={(v) => update('ai', 'weeklyCheckins', v)}
                />
              </SettingRow>
            </SettingsSection>
          )}

          {tab === 'notifications' && (
            <SettingsSection
              title="Notifications"
              description="In-app alerts. Push delivery is not enabled yet, so these control what the app shows you here."
            >
              <SettingRow label="Mute everything" description="Overrides all of the below." htmlFor="mute">
                <Toggle
                  id="mute"
                  label="Mute everything"
                  checked={settings.notifications.muteAll}
                  onChange={(v) => update('notifications', 'muteAll', v)}
                />
              </SettingRow>
              {(
                [
                  ['workoutReminder', 'Workout reminders'],
                  ['mealReminder', 'Meal reminders'],
                  ['waterReminder', 'Water reminders'],
                  ['achievementAlerts', 'Achievement unlocks'],
                  ['weeklyReport', 'Weekly report'],
                  ['monthlyReport', 'Monthly report'],
                  ['newFeatures', 'New features'],
                  ['marketingEmails', 'Product emails'],
                ] as const
              ).map(([key, label]) => (
                <SettingRow key={key} label={label} htmlFor={key}>
                  <Toggle
                    id={key}
                    label={label}
                    disabled={settings.notifications.muteAll}
                    checked={settings.notifications[key]}
                    onChange={(v) => update('notifications', key, v)}
                  />
                </SettingRow>
              ))}
              <SettingRow label="Quiet hours start" htmlFor="qs">
                <input
                  id="qs"
                  type="time"
                  aria-label="Quiet hours start"
                  value={settings.notifications.quietStart}
                  onChange={(e) => update('notifications', 'quietStart', e.target.value)}
                  className="min-h-[44px] rounded-xl border border-white/10 bg-black/40 px-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-wed-purple"
                />
              </SettingRow>
              <SettingRow label="Quiet hours end" htmlFor="qe">
                <input
                  id="qe"
                  type="time"
                  aria-label="Quiet hours end"
                  value={settings.notifications.quietEnd}
                  onChange={(e) => update('notifications', 'quietEnd', e.target.value)}
                  className="min-h-[44px] rounded-xl border border-white/10 bg-black/40 px-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-wed-purple"
                />
              </SettingRow>
            </SettingsSection>
          )}

          {tab === 'privacy' && (
            <SettingsSection
              title="Privacy"
              description="Controls what a future public profile would expose, and what the AI may use."
            >
              <SettingRow label="Profile visibility" stacked>
                <Segmented
                  label="Profile visibility"
                  value={settings.privacy.profileVisibility}
                  onChange={(v) => update('privacy', 'profileVisibility', v)}
                  options={[
                    { value: 'private' as const, label: 'Private' },
                    { value: 'followers' as const, label: 'Followers' },
                    { value: 'public' as const, label: 'Public' },
                  ]}
                />
              </SettingRow>
              {(
                [
                  ['showWeight', 'Show my weight'],
                  ['showProgressPhotos', 'Show progress photos'],
                  ['showWorkoutHistory', 'Show workout history'],
                  ['showStreak', 'Show my streak'],
                  ['showAchievements', 'Show achievements'],
                  ['allowProfileSearch', 'Allow others to find me'],
                ] as const
              ).map(([key, label]) => (
                <SettingRow key={key} label={label} htmlFor={key}>
                  <Toggle
                    id={key}
                    label={label}
                    disabled={settings.privacy.profileVisibility === 'private'}
                    checked={settings.privacy[key]}
                    onChange={(v) => update('privacy', key, v)}
                  />
                </SettingRow>
              ))}
              <SettingRow
                label="Personalised AI"
                description="Lets the coach use your logged results. Off means plans use your profile only."
                htmlFor="pai"
              >
                <Toggle
                  id="pai"
                  label="Personalised AI"
                  checked={settings.privacy.personalizedAi}
                  onChange={(v) => update('privacy', 'personalizedAi', v)}
                />
              </SettingRow>
              <SettingRow label="Anonymous analytics" htmlFor="anon">
                <Toggle
                  id="anon"
                  label="Anonymous analytics"
                  checked={settings.privacy.anonymousAnalytics}
                  onChange={(v) => update('privacy', 'anonymousAnalytics', v)}
                />
              </SettingRow>
            </SettingsSection>
          )}

          {tab === 'appearance' && (
            <SettingsSection title="Appearance" description="Applies instantly across the app.">
              <SettingRow label="Accent colour" stacked>
                <div role="radiogroup" aria-label="Accent colour" className="flex flex-wrap gap-3">
                  {ACCENT_COLORS.map((c) => {
                    const swatch = {
                      red: '#FF3B30',
                      orange: '#F59E0B',
                      green: '#22C55E',
                      blue: '#3B82F6',
                      violet: '#8B5CF6',
                    }[c];
                    const active = settings.appearance.accentColor === c;
                    return (
                      <button
                        key={c}
                        type="button"
                        role="radio"
                        aria-checked={active}
                        aria-label={titleCase(c)}
                        onClick={() => update('appearance', 'accentColor', c)}
                        className={`flex h-11 w-11 items-center justify-center rounded-full border-2 transition-transform ${
                          active ? 'scale-110 border-white' : 'border-white/20'
                        }`}
                        style={{ background: swatch }}
                      >
                        {active && <Check className="h-4 w-4 text-white" />}
                      </button>
                    );
                  })}
                </div>
              </SettingRow>

              <SettingRow label="Text size" stacked>
                <Segmented
                  label="Text size"
                  value={settings.appearance.fontSize}
                  onChange={(v) => update('appearance', 'fontSize', v)}
                  options={[
                    { value: 'small' as const, label: 'Small' },
                    { value: 'medium' as const, label: 'Medium' },
                    { value: 'large' as const, label: 'Large' },
                  ]}
                />
              </SettingRow>

              <SettingRow label="Glass blur" stacked>
                <Segmented
                  label="Glass blur"
                  value={settings.appearance.glassIntensity}
                  onChange={(v) => update('appearance', 'glassIntensity', v)}
                  options={[
                    { value: 'low' as const, label: 'Low' },
                    { value: 'medium' as const, label: 'Medium' },
                    { value: 'high' as const, label: 'High' },
                  ]}
                />
              </SettingRow>

              <SettingRow label="Corner radius" stacked>
                <Segmented
                  label="Corner radius"
                  value={settings.appearance.roundedCorners}
                  onChange={(v) => update('appearance', 'roundedCorners', v)}
                  options={[
                    { value: 'none' as const, label: 'Sharp' },
                    { value: 'small' as const, label: 'Small' },
                    { value: 'medium' as const, label: 'Medium' },
                    { value: 'large' as const, label: 'Large' },
                  ]}
                />
              </SettingRow>

              <SettingRow label="Compact mode" description="Tightens spacing." htmlFor="compact">
                <Toggle
                  id="compact"
                  label="Compact mode"
                  checked={settings.appearance.compactMode}
                  onChange={(v) => update('appearance', 'compactMode', v)}
                />
              </SettingRow>
              <SettingRow
                label="Reduce motion"
                description="Disables animations and transitions."
                htmlFor="motion"
              >
                <Toggle
                  id="motion"
                  label="Reduce motion"
                  checked={settings.appearance.reduceMotion}
                  onChange={(v) => update('appearance', 'reduceMotion', v)}
                />
              </SettingRow>
            </SettingsSection>
          )}

          {tab === 'security' && <SecuritySection />}
        </div>
      )}
    </div>
  );
}

function SaveIndicator({ state }: { state: 'idle' | 'saving' | 'saved' | 'error' }) {
  if (state === 'idle') return null;
  const map = {
    saving: { icon: <Loader2 className="h-3.5 w-3.5 animate-spin" />, text: 'Saving', cls: 'text-wed-gray-300' },
    saved: { icon: <Check className="h-3.5 w-3.5" />, text: 'Saved', cls: 'text-wed-lime' },
    error: { icon: <Activity className="h-3.5 w-3.5" />, text: 'Not saved', cls: 'text-[#FF5A4A]' },
  } as const;
  const { icon, text, cls } = map[state];
  return (
    <span role="status" aria-live="polite" className={`inline-flex items-center gap-1.5 text-xs font-medium ${cls}`}>
      {icon}
      {text}
    </span>
  );
}
