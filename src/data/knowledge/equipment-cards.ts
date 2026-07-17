// Equipment cards for onboarding Step 4. Each card expands to the legacy
// Equipment enum values the exercise library understands, so the engine knows
// exactly which exercises are possible.

export type LegacyEquipment =
  | 'NONE'
  | 'DUMBBELLS'
  | 'BARBELL'
  | 'PULLUP_BAR'
  | 'FULL_GYM'
  | 'RESISTANCE_BANDS'
  | 'KETTLEBELL'
  | 'CABLE_MACHINE';

export interface EquipmentCard {
  id: string;
  name: string;
  description: string;
  /** Legacy Equipment values this card unlocks ('NONE' = bodyweight always available). */
  grants: LegacyEquipment[];
  /** Emoji used on the card (no external assets needed). */
  icon: string;
}

export const equipmentCards: EquipmentCard[] = [
  {
    id: 'commercial-gym', name: 'Commercial Gym',
    description: 'Full gym membership — barbells, machines, cables, everything.',
    grants: ['FULL_GYM', 'BARBELL', 'DUMBBELLS', 'CABLE_MACHINE', 'PULLUP_BAR', 'KETTLEBELL', 'RESISTANCE_BANDS', 'NONE'],
    icon: '🏢',
  },
  {
    id: 'private-gym', name: 'Private / Garage Gym',
    description: 'Your own setup: barbell, plates, rack, dumbbells.',
    grants: ['BARBELL', 'DUMBBELLS', 'PULLUP_BAR', 'KETTLEBELL', 'NONE'],
    icon: '🏠',
  },
  {
    id: 'basic-home-gym', name: 'Basic Home Gym',
    description: 'Dumbbells, bands, and a pull-up bar at home.',
    grants: ['DUMBBELLS', 'RESISTANCE_BANDS', 'PULLUP_BAR', 'NONE'],
    icon: '🏋️',
  },
  {
    id: 'adjustable-dumbbells', name: 'Adjustable Dumbbells',
    description: 'A pair of adjustable dumbbells covers most loaded movements.',
    grants: ['DUMBBELLS', 'NONE'],
    icon: '⚙️',
  },
  {
    id: 'resistance-bands', name: 'Resistance Bands',
    description: 'Bands travel anywhere and load pushes, pulls, and raises.',
    grants: ['RESISTANCE_BANDS', 'NONE'],
    icon: '🎗️',
  },
  {
    id: 'pullup-bar', name: 'Pull-up Bar',
    description: 'A doorway or outdoor bar — the calisthenics essential.',
    grants: ['PULLUP_BAR', 'NONE'],
    icon: '🤸',
  },
  {
    id: 'dip-station', name: 'Dip Station',
    description: 'Parallel bars for dips, rows, and support holds.',
    grants: ['NONE'], // library's dip variants map to bodyweight patterns
    icon: '🅿️',
  },
  {
    id: 'bench', name: 'Bench',
    description: 'A flat bench extends dumbbell and bodyweight options.',
    grants: ['NONE'],
    icon: '🪑',
  },
  {
    id: 'bodyweight', name: 'Bodyweight Only',
    description: 'No equipment — your body is the gym.',
    grants: ['NONE'],
    icon: '🧍',
  },
  {
    id: 'mix-match', name: 'Mix & Match',
    description: 'Pick individual pieces below to build your exact setup.',
    grants: [],
    icon: '🧩',
  },
];

/** Union of legacy equipment across selected cards; always includes bodyweight. */
export function expandEquipment(cardIds: string[]): LegacyEquipment[] {
  const set = new Set<LegacyEquipment>(['NONE']);
  for (const id of cardIds) {
    const card = equipmentCards.find((c) => c.id === id);
    for (const eq of card?.grants ?? []) set.add(eq);
  }
  return Array.from(set);
}
