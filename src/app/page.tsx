import { ParticleCanvas } from '@/components/landing/particle-canvas';
import { SiteNav } from '@/components/landing/site-nav';
import { HeroSection } from '@/components/landing/hero-section';
import { AICoachSection } from '@/components/landing/ai-coach-section';
import { FeaturesShowcase } from '@/components/landing/features-showcase';
import { Footer } from '@/components/landing/footer';

// The landing page is marketing only: workouts, exercises, challenges, tools,
// progress, and gamification all live behind login in /dashboard.
export default function HomePage() {
  return (
    <main className="relative min-h-screen bg-wed-black noise-bg">
      <ParticleCanvas />
      <SiteNav />
      <HeroSection />
      <AICoachSection />
      <FeaturesShowcase />
      <Footer />
    </main>
  );
}
