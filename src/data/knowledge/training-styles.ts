// The 8 training styles from onboarding Step 3. Each style constrains which
// exercise mechanics/patterns the engine is allowed to program, so e.g. a
// Calisthenics athlete never gets machine isolation work.

import type { Mechanics } from './exercise-meta';

export type TrainingStyleId =
  | 'gym'
  | 'calisthenics'
  | 'hybrid'
  | 'powerlifting'
  | 'bodybuilding'
  | 'functional'
  | 'street-workout'
  | 'cross-training';

export interface TrainingStyle {
  id: TrainingStyleId;
  name: string;
  description: string;
  /** Mechanics the engine may program under this style. */
  allowedMechanics: Mechanics[];
  /** If true, only bodyweight/bar movements are allowed (no external-load isolation). */
  bodyweightOnly: boolean;
  /** If true, prefer exercises tagged with a skillFocus when filling slots. */
  skillPriority: boolean;
  /** Default rest bias in seconds when goal doesn't override. */
  defaultRestSec: number;
}

export const trainingStyles: TrainingStyle[] = [
  {
    id: 'gym',
    name: 'Gym',
    description: 'Full access to barbells, dumbbells, and machines — the classic mixed approach.',
    allowedMechanics: ['compound', 'isolation'],
    bodyweightOnly: false,
    skillPriority: false,
    defaultRestSec: 90,
  },
  {
    id: 'calisthenics',
    name: 'Calisthenics',
    description: 'Bodyweight mastery through skill progressions. No machines, no isolation — just you and the bar.',
    allowedMechanics: ['compound'],
    bodyweightOnly: true,
    skillPriority: true,
    defaultRestSec: 120,
  },
  {
    id: 'hybrid',
    name: 'Hybrid',
    description: 'Weights and bodyweight together — strength work plus skill practice.',
    allowedMechanics: ['compound', 'isolation'],
    bodyweightOnly: false,
    skillPriority: true,
    defaultRestSec: 100,
  },
  {
    id: 'powerlifting',
    name: 'Powerlifting',
    description: 'The squat, bench, and deadlift come first. Heavy compounds, minimal fluff.',
    allowedMechanics: ['compound', 'isolation'],
    bodyweightOnly: false,
    skillPriority: false,
    defaultRestSec: 180,
  },
  {
    id: 'bodybuilding',
    name: 'Bodybuilding',
    description: 'Muscle-by-muscle volume with plenty of isolation and detail work.',
    allowedMechanics: ['compound', 'isolation'],
    bodyweightOnly: false,
    skillPriority: false,
    defaultRestSec: 75,
  },
  {
    id: 'functional',
    name: 'Functional Training',
    description: 'Movement-pattern strength, explosiveness, and carryover to real-world tasks and sport.',
    allowedMechanics: ['compound'],
    bodyweightOnly: false,
    skillPriority: false,
    defaultRestSec: 90,
  },
  {
    id: 'street-workout',
    name: 'Street Workout',
    description: 'Bar-based calisthenics with an emphasis on dynamic and explosive bodyweight skills.',
    allowedMechanics: ['compound'],
    bodyweightOnly: true,
    skillPriority: true,
    defaultRestSec: 120,
  },
  {
    id: 'cross-training',
    name: 'Cross Training',
    description: 'Mixed-modal conditioning: strength, gymnastics, and metabolic work combined.',
    allowedMechanics: ['compound', 'isolation'],
    bodyweightOnly: false,
    skillPriority: true,
    defaultRestSec: 75,
  },
];

export const trainingStyleById = (id: string): TrainingStyle | undefined =>
  trainingStyles.find((s) => s.id === id);
