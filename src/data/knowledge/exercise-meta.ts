// Per-exercise intelligence metadata, keyed by src/data/exercises.ts ids.
// Kept separate from the display library so the knowledge layer can evolve
// without touching UI-facing exercise content.

export type MovementPattern =
  | 'horizontal-push'
  | 'vertical-push'
  | 'horizontal-pull'
  | 'vertical-pull'
  | 'squat'
  | 'hinge'
  | 'lunge'
  | 'core'
  | 'accessory';

export type Mechanics = 'compound' | 'isolation';

/** Calisthenics skill lineage an exercise contributes to, if any. */
export type SkillFocus = 'pull-strength' | 'push-strength' | 'handstand' | 'lever' | 'explosive' | 'grip';

export interface ExerciseMeta {
  movementPattern: MovementPattern;
  mechanics: Mechanics;
  skillFocus?: SkillFocus;
  /** Ordered easier → harder exercise ids this movement progresses through. */
  progressionChain?: string[];
  /** Equipment-equivalent swaps, best first. */
  substitutions: string[];
  /** Video-ready fields — null until real assets exist (Pro shows video when present). */
  videoUrl: string | null;
  slowMotionUrl: string | null;
  beginnerModification: string;
  advancedProgression: string;
}

const PUSH_UP_CHAIN = ['incline-push-up', 'push-up', 'diamond-push-up', 'pike-push-up'];
const PULL_CHAIN = ['band-row', 'inverted-row', 'chin-up', 'pull-up'];

export const exerciseMeta: Record<string, ExerciseMeta> = {
  'bench-press': {
    movementPattern: 'horizontal-push', mechanics: 'compound',
    substitutions: ['dumbbell-press', 'push-up'],
    videoUrl: null, slowMotionUrl: null,
    beginnerModification: 'Start with the empty bar or dumbbell press to groove the pattern.',
    advancedProgression: 'Pause reps on the chest, or close-grip variations for tricep emphasis.',
  },
  'squat': {
    movementPattern: 'squat', mechanics: 'compound',
    substitutions: ['goblet-squat', 'leg-press', 'lunge'],
    videoUrl: null, slowMotionUrl: null,
    beginnerModification: 'Goblet squats to a box until depth and balance feel natural.',
    advancedProgression: 'Pause squats or tempo descents (3-1-1-0).',
  },
  'deadlift': {
    movementPattern: 'hinge', mechanics: 'compound',
    substitutions: ['romanian-deadlift', 'kettlebell-swing', 'glute-bridge'],
    videoUrl: null, slowMotionUrl: null,
    beginnerModification: 'Romanian deadlifts with light dumbbells to learn the hip hinge.',
    advancedProgression: 'Deficit deadlifts or paused pulls below the knee.',
  },
  'overhead-press': {
    movementPattern: 'vertical-push', mechanics: 'compound',
    substitutions: ['dumbbell-shoulder-press', 'pike-push-up'],
    videoUrl: null, slowMotionUrl: null,
    beginnerModification: 'Seated dumbbell press for a more stable base.',
    advancedProgression: 'Push press for supramaximal overload.',
  },
  'pull-up': {
    movementPattern: 'vertical-pull', mechanics: 'compound', skillFocus: 'pull-strength',
    progressionChain: PULL_CHAIN,
    substitutions: ['lat-pulldown', 'chin-up', 'inverted-row'],
    videoUrl: null, slowMotionUrl: null,
    beginnerModification: 'Inverted rows or band-assisted pull-ups.',
    advancedProgression: 'Weighted pull-ups, archer pull-ups, or explosive chest-to-bar reps.',
  },
  'dip': {
    movementPattern: 'vertical-push', mechanics: 'compound', skillFocus: 'push-strength',
    substitutions: ['diamond-push-up', 'bench-press'],
    videoUrl: null, slowMotionUrl: null,
    beginnerModification: 'Bench dips with feet on the floor.',
    advancedProgression: 'Weighted dips or ring dips.',
  },
  'romanian-deadlift': {
    movementPattern: 'hinge', mechanics: 'compound',
    substitutions: ['glute-bridge', 'kettlebell-swing', 'deadlift'],
    videoUrl: null, slowMotionUrl: null,
    beginnerModification: 'Glute bridges to learn hip extension first.',
    advancedProgression: 'Single-leg RDLs for balance and unilateral strength.',
  },
  'lunge': {
    movementPattern: 'lunge', mechanics: 'compound',
    substitutions: ['bulgarian-split-squat', 'goblet-squat'],
    videoUrl: null, slowMotionUrl: null,
    beginnerModification: 'Static split squats holding a support.',
    advancedProgression: 'Walking lunges with dumbbells or rear-foot-elevated split squats.',
  },
  'plank': {
    movementPattern: 'core', mechanics: 'isolation',
    substitutions: ['dead-bug', 'mountain-climber'],
    videoUrl: null, slowMotionUrl: null,
    beginnerModification: 'Knee plank or incline plank on a bench.',
    advancedProgression: 'Long-lever plank or plank with shoulder taps.',
  },
  'push-up': {
    movementPattern: 'horizontal-push', mechanics: 'compound', skillFocus: 'push-strength',
    progressionChain: PUSH_UP_CHAIN,
    substitutions: ['dumbbell-press', 'bench-press', 'incline-push-up'],
    videoUrl: null, slowMotionUrl: null,
    beginnerModification: 'Incline push-ups on a bench or wall.',
    advancedProgression: 'Diamond, archer, or deficit push-ups.',
  },
  'dumbbell-row': {
    movementPattern: 'horizontal-pull', mechanics: 'compound',
    substitutions: ['inverted-row', 'band-row'],
    videoUrl: null, slowMotionUrl: null,
    beginnerModification: 'Chest-supported band rows.',
    advancedProgression: 'Heavier loading with strict pauses at the top.',
  },
  'leg-press': {
    movementPattern: 'squat', mechanics: 'compound',
    substitutions: ['squat', 'goblet-squat'],
    videoUrl: null, slowMotionUrl: null,
    beginnerModification: 'Light sled with controlled depth.',
    advancedProgression: 'Single-leg pressing or slow eccentrics.',
  },
  'lat-pulldown': {
    movementPattern: 'vertical-pull', mechanics: 'compound',
    substitutions: ['pull-up', 'band-row'],
    videoUrl: null, slowMotionUrl: null,
    beginnerModification: 'Lighter weight with a full stretch at the top.',
    advancedProgression: 'Graduate to strict pull-ups.',
  },
  'face-pull': {
    movementPattern: 'horizontal-pull', mechanics: 'isolation',
    substitutions: ['band-pull-apart'],
    videoUrl: null, slowMotionUrl: null,
    beginnerModification: 'Band pull-aparts at a lighter tension.',
    advancedProgression: 'Pause each rep with full external rotation.',
  },
  'bicep-curl': {
    movementPattern: 'accessory', mechanics: 'isolation',
    substitutions: ['hammer-curl', 'chin-up'],
    videoUrl: null, slowMotionUrl: null,
    beginnerModification: 'Alternating curls with lighter dumbbells.',
    advancedProgression: 'Slow eccentrics (3-4s down) or 21s.',
  },
  'tricep-extension': {
    movementPattern: 'accessory', mechanics: 'isolation',
    substitutions: ['skull-crusher', 'diamond-push-up'],
    videoUrl: null, slowMotionUrl: null,
    beginnerModification: 'Two-hand overhead extension with one dumbbell.',
    advancedProgression: 'Strict single-arm work with pauses at stretch.',
  },
  'pike-push-up': {
    movementPattern: 'vertical-push', mechanics: 'compound', skillFocus: 'handstand',
    progressionChain: ['incline-push-up', 'push-up', 'pike-push-up'],
    substitutions: ['dumbbell-shoulder-press', 'overhead-press'],
    videoUrl: null, slowMotionUrl: null,
    beginnerModification: 'Push-ups first, then pike with a small elevation.',
    advancedProgression: 'Feet-elevated pike push-ups → wall handstand push-ups.',
  },
  'dumbbell-shoulder-press': {
    movementPattern: 'vertical-push', mechanics: 'compound',
    substitutions: ['overhead-press', 'pike-push-up'],
    videoUrl: null, slowMotionUrl: null,
    beginnerModification: 'Seated with back support.',
    advancedProgression: 'Standing single-arm presses for core demand.',
  },
  'lateral-raise': {
    movementPattern: 'accessory', mechanics: 'isolation',
    substitutions: ['band-pull-apart', 'dumbbell-shoulder-press'],
    videoUrl: null, slowMotionUrl: null,
    beginnerModification: 'Partial range with very light dumbbells.',
    advancedProgression: 'Slow tempo with a pause at the top.',
  },
  'band-pull-apart': {
    movementPattern: 'horizontal-pull', mechanics: 'isolation',
    substitutions: ['face-pull', 'lateral-raise'],
    videoUrl: null, slowMotionUrl: null,
    beginnerModification: 'Lighter band, shoulder-width grip.',
    advancedProgression: 'Slower tempo and higher volume.',
  },
  'dumbbell-press': {
    movementPattern: 'horizontal-push', mechanics: 'compound',
    substitutions: ['bench-press', 'push-up'],
    videoUrl: null, slowMotionUrl: null,
    beginnerModification: 'Floor press for a shorter, safer range.',
    advancedProgression: 'Pause at the bottom, or convert to incline pressing.',
  },
  'incline-bench-press': {
    movementPattern: 'horizontal-push', mechanics: 'compound',
    substitutions: ['dumbbell-press', 'push-up'],
    videoUrl: null, slowMotionUrl: null,
    beginnerModification: 'Incline dumbbell press for friendlier shoulder position.',
    advancedProgression: 'Tempo work or closer grip.',
  },
  'incline-push-up': {
    movementPattern: 'horizontal-push', mechanics: 'compound', skillFocus: 'push-strength',
    progressionChain: PUSH_UP_CHAIN,
    substitutions: ['push-up', 'dumbbell-press'],
    videoUrl: null, slowMotionUrl: null,
    beginnerModification: 'Raise the incline (hands on wall) to reduce load.',
    advancedProgression: 'Lower the incline until floor push-ups are possible.',
  },
  'chest-fly': {
    movementPattern: 'accessory', mechanics: 'isolation',
    substitutions: ['dumbbell-press', 'push-up'],
    videoUrl: null, slowMotionUrl: null,
    beginnerModification: 'Reduce range and keep a bigger elbow bend.',
    advancedProgression: 'Slow eccentric with a deep stretch.',
  },
  'chin-up': {
    // Tagged 'grip' (not 'pull-strength') so bar-only templates have a grip
    // builder — chin-ups are the classic bodyweight grip developer.
    movementPattern: 'vertical-pull', mechanics: 'compound', skillFocus: 'grip',
    progressionChain: PULL_CHAIN,
    substitutions: ['pull-up', 'lat-pulldown', 'inverted-row'],
    videoUrl: null, slowMotionUrl: null,
    beginnerModification: 'Band-assisted or slow negatives from the top.',
    advancedProgression: 'Weighted chin-ups or L-sit chin-ups.',
  },
  'inverted-row': {
    movementPattern: 'horizontal-pull', mechanics: 'compound', skillFocus: 'lever',
    progressionChain: ['band-row', 'inverted-row'],
    substitutions: ['dumbbell-row', 'band-row'],
    videoUrl: null, slowMotionUrl: null,
    beginnerModification: 'Raise the bar height or bend the knees.',
    advancedProgression: 'Feet elevated, or tuck front-lever rows.',
  },
  'band-row': {
    movementPattern: 'horizontal-pull', mechanics: 'compound',
    progressionChain: ['band-row', 'inverted-row'],
    substitutions: ['inverted-row', 'dumbbell-row'],
    videoUrl: null, slowMotionUrl: null,
    beginnerModification: 'Lighter band with strict squeeze.',
    advancedProgression: 'Single-arm band rows with rotation control.',
  },
  'superman': {
    movementPattern: 'core', mechanics: 'isolation',
    substitutions: ['glute-bridge', 'dead-bug'],
    videoUrl: null, slowMotionUrl: null,
    beginnerModification: 'Lift arms only, then legs only.',
    advancedProgression: 'Hold each rep 5+ seconds (superman hold).',
  },
  'goblet-squat': {
    movementPattern: 'squat', mechanics: 'compound',
    substitutions: ['squat', 'lunge'],
    videoUrl: null, slowMotionUrl: null,
    beginnerModification: 'Squat to a box holding a light weight.',
    advancedProgression: 'Heavier dumbbell/kettlebell or tempo descents.',
  },
  'bulgarian-split-squat': {
    movementPattern: 'lunge', mechanics: 'compound',
    substitutions: ['lunge', 'goblet-squat'],
    videoUrl: null, slowMotionUrl: null,
    beginnerModification: 'Static split squats on flat ground first.',
    advancedProgression: 'Add dumbbells or a deficit under the front foot.',
  },
  'glute-bridge': {
    movementPattern: 'hinge', mechanics: 'compound',
    substitutions: ['romanian-deadlift', 'kettlebell-swing'],
    videoUrl: null, slowMotionUrl: null,
    beginnerModification: 'Bodyweight with a pause at the top.',
    advancedProgression: 'Single-leg bridges or hip thrusts with load.',
  },
  'calf-raise': {
    movementPattern: 'accessory', mechanics: 'isolation',
    substitutions: [],
    videoUrl: null, slowMotionUrl: null,
    beginnerModification: 'Both legs, flat ground.',
    advancedProgression: 'Single-leg on a step with a deep stretch.',
  },
  'kettlebell-swing': {
    movementPattern: 'hinge', mechanics: 'compound', skillFocus: 'explosive',
    substitutions: ['romanian-deadlift', 'glute-bridge'],
    videoUrl: null, slowMotionUrl: null,
    beginnerModification: 'Hike-and-park drills to learn the hinge snap.',
    advancedProgression: 'Heavier bell or one-arm swings.',
  },
  'hammer-curl': {
    movementPattern: 'accessory', mechanics: 'isolation', skillFocus: 'grip',
    substitutions: ['bicep-curl', 'chin-up'],
    videoUrl: null, slowMotionUrl: null,
    beginnerModification: 'Alternating with lighter dumbbells.',
    advancedProgression: 'Slow eccentrics or cross-body curls.',
  },
  'skull-crusher': {
    movementPattern: 'accessory', mechanics: 'isolation',
    substitutions: ['tricep-extension', 'diamond-push-up'],
    videoUrl: null, slowMotionUrl: null,
    beginnerModification: 'Use dumbbells with neutral grip.',
    advancedProgression: 'Pause at stretch, or incline skull crushers.',
  },
  'diamond-push-up': {
    movementPattern: 'horizontal-push', mechanics: 'compound', skillFocus: 'push-strength',
    progressionChain: PUSH_UP_CHAIN,
    substitutions: ['tricep-extension', 'push-up', 'dip'],
    videoUrl: null, slowMotionUrl: null,
    beginnerModification: 'Regular push-ups until 15 clean reps.',
    advancedProgression: 'Deficit diamonds or slow negatives.',
  },
  'russian-twist': {
    movementPattern: 'core', mechanics: 'isolation',
    substitutions: ['dead-bug', 'plank'],
    videoUrl: null, slowMotionUrl: null,
    beginnerModification: 'Feet on the floor, no weight.',
    advancedProgression: 'Feet elevated holding a dumbbell.',
  },
  'hanging-leg-raise': {
    movementPattern: 'core', mechanics: 'isolation', skillFocus: 'lever',
    progressionChain: ['dead-bug', 'russian-twist', 'hanging-leg-raise'],
    substitutions: ['russian-twist', 'dead-bug'],
    videoUrl: null, slowMotionUrl: null,
    beginnerModification: 'Hanging knee raises, or lying leg raises.',
    advancedProgression: 'Toes-to-bar, then tuck front lever holds.',
  },
  'mountain-climber': {
    movementPattern: 'core', mechanics: 'isolation',
    substitutions: ['plank', 'dead-bug'],
    videoUrl: null, slowMotionUrl: null,
    beginnerModification: 'Slow tempo, hands elevated.',
    advancedProgression: 'Sprint tempo intervals (20s on / 10s off).',
  },
  'dead-bug': {
    movementPattern: 'core', mechanics: 'isolation',
    substitutions: ['plank', 'russian-twist'],
    videoUrl: null, slowMotionUrl: null,
    beginnerModification: 'Move arms only, keep knees bent at 90°.',
    advancedProgression: 'Hold a light weight overhead, slow tempo.',
  },
};
