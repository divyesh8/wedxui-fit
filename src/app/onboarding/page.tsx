'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store';
import { OnboardingHeroPanel, OnboardingThemeStrip, type OnboardingStage } from '@/components/onboarding/hero-panel';
import { OnboardingWizard } from '@/components/onboarding/wizard';

/**
 * Standalone, full-screen onboarding — no dashboard chrome.
 * Left: animated anime stage that changes theme per step.
 * Right: the assessment wizard.
 */
export default function OnboardingPage() {
  const router = useRouter();
  const { status, refresh } = useAuthStore();
  const [stage, setStage] = useState<OnboardingStage>(0);

  useEffect(() => {
    refresh().then((user) => {
      if (!user) router.replace('/login');
    });
  }, [refresh, router]);

  if (status !== 'authenticated') return null;

  return (
    <main className="min-h-screen bg-wed-black noise-bg flex">
      <OnboardingHeroPanel stage={stage} />

      <div className="flex-1 min-h-screen px-4 sm:px-8 lg:px-14 py-8 flex flex-col">
        <div className="flex items-center justify-between mb-8">
          <span className="lg:hidden text-lg font-black tracking-tight">
            <span className="text-white">WED</span>
            <span className="text-wed-purple">XUI</span>
            <span className="text-white font-light"> Fit</span>
          </span>
          <span className="hidden lg:block" />
          <Link
            href="/dashboard"
            className="text-xs text-wed-gray-400 hover:text-white transition-colors"
          >
            Skip for now →
          </Link>
        </div>

        <OnboardingThemeStrip stage={stage} />

        <div className="flex-1 flex flex-col justify-center max-w-2xl w-full mx-auto pb-10">
          <OnboardingWizard onStageChange={setStage} />
        </div>
      </div>
    </main>
  );
}
