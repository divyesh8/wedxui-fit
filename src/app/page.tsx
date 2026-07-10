import { ParticleCanvas } from '@/components/landing/particle-canvas';
import { SiteNav } from '@/components/landing/site-nav';
import { HeroSection } from '@/components/landing/hero-section';
import { AICoachSection } from '@/components/landing/ai-coach-section';
import { MotivationSection } from '@/components/landing/motivation-section';
import { OnboardingModal } from '@/components/landing/onboarding-section';
import { WorkoutsSection } from '@/components/landing/workouts-section';
import { ExercisesSection } from '@/components/landing/exercises-section';
import { ChallengesSection } from '@/components/landing/challenges-section';
import { ToolsSection } from '@/components/landing/tools-section';
import { ProgressSection } from '@/components/landing/progress-section';
import { GamificationSection } from '@/components/landing/gamification-section';
import { Footer } from '@/components/landing/footer';

export default function HomePage() {
  return (
    <main className="relative min-h-screen bg-wed-black noise-bg">
      <ParticleCanvas />
      <SiteNav />
      <HeroSection />
      <AICoachSection />
      <MotivationSection />
      <OnboardingModal />
      <WorkoutsSection />
      <ExercisesSection />
      <ChallengesSection />
      <ToolsSection />
      <ProgressSection />
      <GamificationSection />
      <Footer />
    </main>
  );
}
