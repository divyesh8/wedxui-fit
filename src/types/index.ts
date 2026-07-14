export interface Exercise {
  id: string;
  name: string;
  slug: string;
  description: string;
  instructions: string[];
  difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT';
  equipment: string[];
  primaryMuscles: string[];
  secondaryMuscles: string[];
  category: string;
  tips: string[];
  commonMistakes: string[];
  alternatives: string[];
}

export interface WorkoutPlan {
  id: string;
  name: string;
  type: string;
  difficulty: string;
  days: WorkoutDay[];
}

export interface WorkoutDay {
  name: string;
  exercises: { id: string; name: string; sets: number; reps: string; rest: string }[];
}

export interface Quote {
  text: string;
  author: string;
  category: string;
}

export interface Challenge {
  id: string;
  name: string;
  description: string;
  durationDays: number;
  difficulty: string;
  badgeIcon: string;
  xpReward: number;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  xpReward: number;
}
