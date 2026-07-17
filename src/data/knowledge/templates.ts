// Split templates the workout engine selects from. Each day is a list of
// SLOTS (movement pattern or calisthenics skill + priority) — the engine fills
// slots with concrete exercises the user's equipment/style/experience allow.

import type { MovementPattern, SkillFocus } from './exercise-meta';
import type { TrainingStyleId } from './training-styles';

export interface TemplateSlot {
  kind: 'pattern' | 'skill';
  value: MovementPattern | SkillFocus;
  /** 1 = anchors the day (filled first, ordered first), 3 = optional filler. */
  priority: 1 | 2 | 3;
  /** Optional slots are dropped first when sessionMinutes caps the day. */
  optional?: boolean;
}

export interface TemplateDay {
  name: string;
  slots: TemplateSlot[];
}

export interface SplitTemplate {
  id: string;
  name: string;
  /** Loose classification for display + WorkoutPlan.type compat. */
  type: 'FULL_BODY' | 'UPPER_LOWER' | 'PPL' | 'CUSTOM';
  minDays: number;
  maxDays: number;
  /** Styles this template is designed for; engine prefers style-specific ones. */
  styles: TrainingStyleId[];
  days: TemplateDay[];
  rationale: string;
}

const p = (value: MovementPattern, priority: 1 | 2 | 3 = 2, optional = false): TemplateSlot =>
  ({ kind: 'pattern', value, priority, optional });
const s = (value: SkillFocus, priority: 1 | 2 | 3 = 1, optional = false): TemplateSlot =>
  ({ kind: 'skill', value, priority, optional });

export const splitTemplates: SplitTemplate[] = [
  {
    id: 'full-body',
    name: 'Full Body',
    type: 'FULL_BODY',
    minDays: 1, maxDays: 3,
    styles: ['gym', 'hybrid', 'bodybuilding', 'functional', 'cross-training'],
    rationale: 'At 1–3 days/week, hitting every pattern each session maximizes per-muscle frequency.',
    days: [
      { name: 'Full Body A', slots: [p('squat', 1), p('horizontal-push', 1), p('horizontal-pull', 1), p('hinge', 2), p('core', 3), p('accessory', 3, true)] },
      { name: 'Full Body B', slots: [p('hinge', 1), p('vertical-push', 1), p('vertical-pull', 1), p('lunge', 2), p('core', 3), p('accessory', 3, true)] },
      { name: 'Full Body C', slots: [p('squat', 1), p('vertical-push', 1), p('horizontal-pull', 1), p('lunge', 2), p('core', 3), p('accessory', 3, true)] },
    ],
  },
  {
    id: 'upper-lower',
    name: 'Upper / Lower',
    type: 'UPPER_LOWER',
    minDays: 4, maxDays: 4,
    styles: ['gym', 'hybrid', 'bodybuilding', 'functional', 'cross-training'],
    rationale: 'Four days split into upper and lower halves trains each muscle twice weekly with focused sessions.',
    days: [
      { name: 'Upper A', slots: [p('horizontal-push', 1), p('horizontal-pull', 1), p('vertical-push', 2), p('vertical-pull', 2), p('accessory', 3, true)] },
      { name: 'Lower A', slots: [p('squat', 1), p('hinge', 2), p('lunge', 2), p('core', 3), p('accessory', 3, true)] },
      { name: 'Upper B', slots: [p('vertical-push', 1), p('vertical-pull', 1), p('horizontal-push', 2), p('horizontal-pull', 2), p('accessory', 3, true)] },
      { name: 'Lower B', slots: [p('hinge', 1), p('squat', 2), p('lunge', 2), p('core', 3), p('accessory', 3, true)] },
    ],
  },
  {
    id: 'ppl',
    name: 'Push / Pull / Legs',
    type: 'PPL',
    minDays: 5, maxDays: 7,
    styles: ['gym', 'hybrid', 'bodybuilding', 'cross-training'],
    rationale: 'At 5+ days, grouping by push/pull/legs keeps volume high while each muscle still recovers between its sessions.',
    days: [
      { name: 'Push', slots: [p('horizontal-push', 1), p('vertical-push', 2), p('horizontal-push', 2), p('accessory', 3, true)] },
      { name: 'Pull', slots: [p('vertical-pull', 1), p('horizontal-pull', 2), p('horizontal-pull', 3), p('accessory', 3, true)] },
      { name: 'Legs', slots: [p('squat', 1), p('hinge', 2), p('lunge', 2), p('core', 3)] },
      { name: 'Push B', slots: [p('vertical-push', 1), p('horizontal-push', 2), p('accessory', 3), p('accessory', 3, true)] },
      { name: 'Pull B', slots: [p('horizontal-pull', 1), p('vertical-pull', 2), p('accessory', 3), p('core', 3, true)] },
      { name: 'Legs B', slots: [p('hinge', 1), p('squat', 2), p('lunge', 3), p('core', 3)] },
      { name: 'Active Recovery', slots: [p('core', 2), p('lunge', 3, true), p('accessory', 3, true)] },
    ],
  },
  {
    id: 'powerlifting-block',
    name: 'Powerlifting Block',
    type: 'UPPER_LOWER',
    minDays: 3, maxDays: 4,
    styles: ['powerlifting'],
    rationale: 'Each session anchors on one competition lift pattern, with supporting work behind it.',
    days: [
      { name: 'Squat Day', slots: [p('squat', 1), p('lunge', 2), p('core', 3), p('accessory', 3, true)] },
      { name: 'Bench Day', slots: [p('horizontal-push', 1), p('horizontal-pull', 2), p('vertical-push', 3), p('accessory', 3, true)] },
      { name: 'Deadlift Day', slots: [p('hinge', 1), p('vertical-pull', 2), p('core', 3), p('accessory', 3, true)] },
      { name: 'Volume Day', slots: [p('squat', 1), p('horizontal-push', 2), p('horizontal-pull', 2), p('accessory', 3, true)] },
    ],
  },
  {
    id: 'calisthenics-skill',
    name: 'Skill & Strength',
    type: 'CUSTOM',
    minDays: 2, maxDays: 6,
    styles: ['calisthenics', 'street-workout'],
    rationale: 'Skill-first bodyweight training: pulling strength, lever and handstand progressions anchor each day, with core and grip supporting them.',
    days: [
      { name: 'Pull Skill', slots: [s('pull-strength', 1), s('lever', 2), p('horizontal-pull', 2), s('grip', 3, true)] },
      { name: 'Push Skill', slots: [s('handstand', 1), s('push-strength', 2), p('vertical-push', 2), p('core', 3)] },
      // Lunge-anchored: the library's bodyweight leg work is unilateral
      // (lunge/split squat) + hip hinge (glute bridge); loaded squats and
      // explosive hinges need equipment the pure-bodyweight user lacks.
      { name: 'Legs & Core', slots: [p('lunge', 1), p('hinge', 2), p('core', 2), p('core', 3, true)] },
      { name: 'Pull Volume', slots: [s('pull-strength', 1), p('horizontal-pull', 2), s('lever', 3), p('core', 3, true)] },
      { name: 'Push Volume', slots: [s('push-strength', 1), p('horizontal-push', 2), p('vertical-push', 3), p('core', 3, true)] },
      { name: 'Skill Practice', slots: [s('handstand', 1), s('lever', 2), s('grip', 3), p('core', 3, true)] },
    ],
  },
];

/** Deterministic template choice: style-specific first, then day-count fit. */
export function selectTemplate(style: TrainingStyleId, daysPerWeek: number): SplitTemplate {
  const styled = splitTemplates.filter((t) => t.styles.includes(style));
  const fits = (t: SplitTemplate) => daysPerWeek >= t.minDays && daysPerWeek <= t.maxDays;
  return (
    styled.find(fits) ??
    styled[0] ??
    splitTemplates.find(fits) ??
    splitTemplates[0]
  );
}
