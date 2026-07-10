import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { WorkoutPlan } from '@/types';
import type { OnboardingProfile } from '@/lib/validations/onboarding';
import type { PlanTargets } from '@/lib/plan-generator';

interface ProfileState {
  profile: OnboardingProfile | null;
  plan: WorkoutPlan | null;
  targets: PlanTargets | null;
  /** ISO-8601 timestamp of onboarding completion; null = not onboarded. */
  onboardedAt: string | null;

  completeOnboarding: (profile: OnboardingProfile, plan: WorkoutPlan, targets: PlanTargets) => void;
  resetOnboarding: () => void;
}

export const useProfileStore = create<ProfileState>()(
  persist(
    (set) => ({
      profile: null,
      plan: null,
      targets: null,
      onboardedAt: null,

      completeOnboarding: (profile, plan, targets) =>
        set({ profile, plan, targets, onboardedAt: new Date().toISOString() }),

      resetOnboarding: () => set({ profile: null, plan: null, targets: null, onboardedAt: null }),
    }),
    { name: 'wedxui-profile' }
  )
);
