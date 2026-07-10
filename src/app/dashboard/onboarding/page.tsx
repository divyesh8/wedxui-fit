import { redirect } from 'next/navigation';

// The assessment moved to a standalone, full-screen experience.
export default function LegacyOnboardingRedirect() {
  redirect('/onboarding');
}
