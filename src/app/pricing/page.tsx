'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { ModernPricingPage, type PricingCardProps } from '@/components/ui/animated-glassy-pricing';

// WEDXUI Fit plans. Payment wiring (Razorpay/Stripe/Play/App Store) is the next
// milestone — for now the CTAs are placeholders (onSelect can call a checkout API).
const plans: PricingCardProps[] = [
  {
    planName: 'Free',
    description: 'Everything you need to start your training arc.',
    price: '0',
    currency: '₹',
    period: '/mo',
    features: [
      'Personalized workout plan',
      'Exercise library (40+)',
      'BMI / macro / 1RM calculators',
      'Progress tracking',
      'Daily anime motivation',
    ],
    buttonText: 'Your Current Plan',
    buttonVariant: 'secondary',
  },
  {
    planName: 'Pro',
    description: 'Enter another universe. AI coaching + the full arc.',
    price: '49',
    originalPrice: '149',
    currency: '₹',
    period: '/mo',
    badge: '₹100 OFF',
    features: [
      'Everything in Free',
      'Unlimited AI coach + nutrition AI',
      'HD exercise video library',
      'Character mentors & unlocks',
      'Premium animated dashboard',
      'Advanced analytics & recovery',
    ],
    buttonText: 'Upgrade — ₹49/mo',
    isPopular: true,
  },
  {
    planName: 'Pro Yearly',
    description: 'Best value — save vs paying monthly.',
    price: '499',
    currency: '₹',
    period: '/yr',
    badge: 'Save ₹89',
    features: [
      'Everything in Pro',
      'Billed once a year',
      'Priority support',
      'Cloud backup',
      'Early access to new features',
    ],
    buttonText: 'Go Yearly',
  },
];

function useCountdown(windowMs: number) {
  // Rolling launch window so the offer always reads as "limited".
  const [target] = useState(() => Date.now() + windowMs);
  const [remaining, setRemaining] = useState(windowMs);
  useEffect(() => {
    const id = setInterval(() => setRemaining(Math.max(0, target - Date.now())), 1000);
    return () => clearInterval(id);
  }, [target]);
  const totalSec = Math.floor(remaining / 1000);
  return {
    h: String(Math.floor(totalSec / 3600)).padStart(2, '0'),
    m: String(Math.floor((totalSec % 3600) / 60)).padStart(2, '0'),
    s: String(totalSec % 60).padStart(2, '0'),
  };
}

export default function PricingPage() {
  const { h, m, s } = useCountdown(3 * 24 * 60 * 60 * 1000);

  return (
    <div className="relative">
      {/* Launch-offer banner */}
      <div className="fixed top-0 inset-x-0 z-30 flex items-center justify-center gap-2 py-2 px-4 text-center text-[13px] font-semibold bg-gradient-purple text-white">
        <Link href="/" className="absolute left-4 hidden sm:flex items-center gap-1 text-white/80 hover:text-white text-xs">
          <ArrowLeft className="w-4 h-4" /> Home
        </Link>
        🔥 Limited Launch Offer — <span className="line-through opacity-70">₹149</span> ₹49/mo · ends in{' '}
        <span className="font-mono tabular-nums">{h}:{m}:{s}</span>
      </div>

      <ModernPricingPage
        title={
          <>
            Enter the <span className="text-wed-purple">Pro Universe</span>
          </>
        }
        subtitle="Start free, then ascend. Unlock the AI coach, nutrition engine, HD video library, and the full anime training arc."
        plans={plans}
        showAnimatedBackground
      />
    </div>
  );
}
