// The 11 target-physique archetypes shown as cards in onboarding Step 1.
// Card fields feed the UI; `bias` feeds the workout intelligence engine.

export type PhysiqueId =
  | 'lean-athletic'
  | 'lean-muscular'
  | 'classic-aesthetic'
  | 'powerlifter'
  | 'bodybuilder'
  | 'calisthenics-athlete'
  | 'gymnast'
  | 'functional-athlete'
  | 'mass-monster'
  | 'beach-body'
  | 'transformation';

export interface PhysiqueBias {
  /** Preferred working rep range [low, high]. */
  repRange: [number, number];
  /** Scales landmark weekly volume: 0.8 conservative → 1.2 high-volume. */
  volumeMultiplier: number;
  /** Relative slot weighting when filling a day. Sums needn't be 1. */
  mix: { compound: number; isolation: number; skill: number };
  cardio: 'none' | 'light' | 'moderate' | 'high';
}

export interface Physique {
  id: PhysiqueId;
  name: string;
  description: string;
  advantages: string[];
  philosophy: string;
  /** 1 (accessible) – 5 (extreme commitment). */
  difficulty: number;
  estimatedYears: string;
  characteristics: string[];
  /** Key into the PHYSIQUE_SILHOUETTES SVG map (original artwork, no IP). */
  silhouette: 'runner' | 'athletic' | 'v-taper' | 'block' | 'mass' | 'bar-athlete' | 'rings' | 'hybrid' | 'beach' | 'arrow';
  bias: PhysiqueBias;
}

export const physiques: Physique[] = [
  {
    id: 'lean-athletic',
    name: 'Lean Athletic',
    description: 'Low body fat, visible muscle tone, built to move — the look of a sprinter or footballer.',
    advantages: ['Fast to reach', 'Easy to maintain', 'Great conditioning', 'Everyday agility'],
    philosophy: 'Full-body training, moderate volume, conditioning woven in. Movement quality over maximal load.',
    difficulty: 2,
    estimatedYears: '0.5–1.5 years',
    characteristics: ['Visible abs at low bf%', 'Toned, not bulky', 'High work capacity'],
    silhouette: 'runner',
    bias: { repRange: [10, 15], volumeMultiplier: 0.9, mix: { compound: 3, isolation: 1, skill: 1 }, cardio: 'moderate' },
  },
  {
    id: 'lean-muscular',
    name: 'Lean Muscular',
    description: 'Noticeably muscular but stays lean year-round. Athletic size without the bulk.',
    advantages: ['Strong and lean simultaneously', 'Sustainable diet', 'Looks good in and out of clothes'],
    philosophy: 'Hypertrophy fundamentals at controlled calories — progressive overload with conditioning support.',
    difficulty: 3,
    estimatedYears: '1.5–3 years',
    characteristics: ['Defined chest and arms', 'Visible ab outline', 'Moderate mass'],
    silhouette: 'athletic',
    bias: { repRange: [8, 12], volumeMultiplier: 1.0, mix: { compound: 3, isolation: 2, skill: 0 }, cardio: 'light' },
  },
  {
    id: 'classic-aesthetic',
    name: 'Classic Aesthetic',
    description: 'The golden-era look: broad shoulders, small waist, balanced proportions.',
    advantages: ['Timeless proportions', 'Balanced development', 'Strong V-taper'],
    philosophy: 'Proportion-first hypertrophy — extra shoulder and back width work, waist kept tight, nothing overpowered.',
    difficulty: 3,
    estimatedYears: '2–4 years',
    characteristics: ['V-taper', 'Wide upper back', 'Tight midsection', 'Symmetry'],
    silhouette: 'v-taper',
    bias: { repRange: [8, 12], volumeMultiplier: 1.05, mix: { compound: 3, isolation: 2, skill: 0 }, cardio: 'light' },
  },
  {
    id: 'powerlifter',
    name: 'Powerlifter',
    description: 'Built to move maximal weight in squat, bench, and deadlift. Thick, dense, powerful.',
    advantages: ['Objective strength progress', 'Simple focused training', 'Dense muscle'],
    philosophy: 'The big three come first: low reps, heavy loads, long rests. Accessories only serve the lifts.',
    difficulty: 3,
    estimatedYears: '2–5 years',
    characteristics: ['Thick torso and hips', 'Powerful posterior chain', 'Mass over definition'],
    silhouette: 'block',
    bias: { repRange: [3, 6], volumeMultiplier: 0.85, mix: { compound: 4, isolation: 1, skill: 0 }, cardio: 'none' },
  },
  {
    id: 'bodybuilder',
    name: 'Bodybuilder',
    description: 'Maximum muscle in every visible muscle group, sculpted through volume and detail work.',
    advantages: ['Complete development', 'Mind-muscle mastery', 'Visible results per muscle'],
    philosophy: 'High-volume hypertrophy with isolation detail — every muscle trained deliberately, twice a week.',
    difficulty: 4,
    estimatedYears: '3–6 years',
    characteristics: ['Full round muscle bellies', 'Detail and separation', 'High volume tolerance'],
    silhouette: 'mass',
    bias: { repRange: [8, 15], volumeMultiplier: 1.15, mix: { compound: 2, isolation: 3, skill: 0 }, cardio: 'light' },
  },
  {
    id: 'calisthenics-athlete',
    name: 'Calisthenics Athlete',
    description: 'Master of your own bodyweight — pull-ups, levers, and bar skills with a lean build.',
    advantages: ['Train anywhere', 'Relative strength', 'Skill unlocks feel like achievements'],
    philosophy: 'Skill progressions over weights: earn harder variations. No isolation machines — the bar and floor are the gym.',
    difficulty: 3,
    estimatedYears: '1–3 years',
    characteristics: ['High strength-to-weight ratio', 'Developed back and arms', 'Lean by necessity'],
    silhouette: 'bar-athlete',
    bias: { repRange: [5, 12], volumeMultiplier: 1.0, mix: { compound: 2, isolation: 0, skill: 4 }, cardio: 'light' },
  },
  {
    id: 'gymnast',
    name: 'Gymnast Physique',
    description: 'Elite bodyweight control: straight-arm strength, mobility, and dense upper-body muscle.',
    advantages: ['Exceptional core and shoulder strength', 'Mobility built-in', 'Unmistakable physique'],
    philosophy: 'Straight-arm and isometric skill work, strict positions, patient progressions. Strength is a skill.',
    difficulty: 5,
    estimatedYears: '3–6+ years',
    characteristics: ['Dense shoulders and arms', 'Iron core', 'Full-range mobility'],
    silhouette: 'rings',
    bias: { repRange: [4, 8], volumeMultiplier: 0.95, mix: { compound: 1, isolation: 0, skill: 5 }, cardio: 'light' },
  },
  {
    id: 'functional-athlete',
    name: 'Functional Athlete',
    description: 'Strong, fast, mobile, conditioned — performance in any direction, sport-ready.',
    advantages: ['Carries over to any sport', 'Injury resilience', 'Balanced capabilities'],
    philosophy: 'Movement patterns over muscles: hinge, squat, push, pull, carry — loaded and explosive, plus conditioning.',
    difficulty: 3,
    estimatedYears: '1–3 years',
    characteristics: ['Athletic build', 'Explosive hips', 'Endurance base'],
    silhouette: 'hybrid',
    bias: { repRange: [6, 10], volumeMultiplier: 0.95, mix: { compound: 4, isolation: 1, skill: 1 }, cardio: 'high' },
  },
  {
    id: 'mass-monster',
    name: 'Mass Monster',
    description: 'Maximum size, full stop. Heavy compounds, big volume, big eating.',
    advantages: ['Fastest route to raw size', 'Strength comes with it', 'Commanding presence'],
    philosophy: 'Heavy compound lifts, high weekly volume, aggressive progressive overload, calories to match.',
    difficulty: 5,
    estimatedYears: '4–8 years',
    characteristics: ['Maximum muscle mass', 'Thick everywhere', 'Definition secondary'],
    silhouette: 'mass',
    bias: { repRange: [6, 10], volumeMultiplier: 1.2, mix: { compound: 4, isolation: 2, skill: 0 }, cardio: 'none' },
  },
  {
    id: 'beach-body',
    name: 'Beach Body',
    description: 'The mirror muscles: chest, arms, shoulders, abs — lean enough to show them off.',
    advantages: ['Visible results fast', 'Motivating to train', 'Flexible schedule'],
    philosophy: 'Upper-body emphasis with enough leg and pull work to stay balanced; abs and arms get dedicated slots.',
    difficulty: 2,
    estimatedYears: '0.5–2 years',
    characteristics: ['Developed chest and arms', 'Visible abs', 'Moderate legs'],
    silhouette: 'beach',
    bias: { repRange: [8, 12], volumeMultiplier: 1.0, mix: { compound: 2, isolation: 3, skill: 0 }, cardio: 'moderate' },
  },
  {
    id: 'transformation',
    name: 'Transformation',
    description: 'A complete body recomposition — losing fat and building muscle from wherever you start today.',
    advantages: ['Built for beginners', 'Every week shows progress', 'Sustainable habits first'],
    philosophy: 'Simple compound movements, consistency over intensity, conditioning for fat loss, habits before heroics.',
    difficulty: 1,
    estimatedYears: '0.5–2 years',
    characteristics: ['Steady fat loss', 'Newbie muscle gains', 'Habit foundation'],
    silhouette: 'arrow',
    bias: { repRange: [10, 15], volumeMultiplier: 0.85, mix: { compound: 3, isolation: 1, skill: 0 }, cardio: 'moderate' },
  },
];

export const physiqueById = (id: string): Physique | undefined => physiques.find((p) => p.id === id);
