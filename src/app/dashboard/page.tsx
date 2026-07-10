'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Flame, Dumbbell, Calendar, Zap, Trophy, Target, Sparkles, ArrowRight, Droplets, Quote } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useProfileStore } from '@/store/profile';
import { getRandomQuote, type AnimeQuote } from '@/data/quotes';
import { calculateXPForLevel, getRankFromLevel } from '@/lib/utils';

// Achievements unlock once workout logging ships — shown locked, never faked.
const lockedAchievements = [
  { name: 'First Blood', desc: 'Complete your first workout', icon: '🩸' },
  { name: 'Week Warrior', desc: 'Reach a 7-day streak', icon: '🔥' },
  { name: 'Centurion', desc: 'Log 100 workouts', icon: '💯' },
];

export default function DashboardPage() {
  const { profile, plan, targets, onboardedAt } = useProfileStore();
  const [mounted, setMounted] = useState(false);
  const [quote, setQuote] = useState<AnimeQuote | null>(null);

  useEffect(() => {
    setMounted(true);
    setQuote(getRandomQuote());
  }, []);

  const dayLabels = ['Today', 'Tomorrow', 'Day 3', 'Day 4', 'Day 5', 'Day 6', 'Day 7'];
  const planWorkouts =
    mounted && plan
      ? plan.days.slice(0, 3).map((day, i) => ({
          day: dayLabels[i],
          name: day.name,
          type: `${day.exercises.length} exercises`,
          duration: `${profile?.sessionMinutes ?? 60} min`,
        }))
      : [];

  // Real starting values — XP and streaks stay at zero until workout logging ships.
  const level = 1;
  const xp = 0;
  const xpForNext = calculateXPForLevel(level);
  const rank = getRankFromLevel(level);

  const stats = [
    {
      label: 'Workout Streak',
      value: '0 days',
      icon: Flame,
      color: 'text-wed-purple',
      bg: 'bg-wed-purple/10',
    },
    {
      label: 'Training Plan',
      value: mounted && plan ? `${plan.days.length} days/week` : '—',
      icon: Dumbbell,
      color: 'text-wed-blue',
      bg: 'bg-wed-blue/10',
    },
    {
      label: 'Calorie Target',
      value: mounted && targets ? `${targets.calories.toLocaleString()} kcal` : '—',
      icon: Target,
      color: 'text-wed-lime',
      bg: 'bg-wed-lime/10',
    },
    {
      label: 'Water Target',
      value: mounted && targets ? `${(targets.waterMl / 1000).toFixed(1)} L` : '—',
      icon: Droplets,
      color: 'text-wed-pink',
      bg: 'bg-wed-pink/10',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-2xl font-bold text-white mb-1">
          Welcome back, {mounted && profile?.name ? profile.name : 'Warrior'}
        </h2>
        <p className="text-wed-gray-400">
          {mounted && plan
            ? `Your ${plan.name} is ready. Next up: ${plan.days[0]?.name}.`
            : 'Your story starts with the first episode — forge your profile below.'}
        </p>
      </motion.div>

      {/* Anime quote of the session */}
      {quote && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.05 }}>
          <div className="flex items-start gap-3 p-4 rounded-2xl glass">
            <Quote className="w-4 h-4 text-wed-purple mt-1 flex-shrink-0" />
            <p className="text-sm text-wed-gray-200">
              &quot;{quote.text}&quot;{' '}
              <span className="text-wed-gray-500">— {quote.author}</span>
            </p>
          </div>
        </motion.div>
      )}

      {/* Onboarding CTA */}
      {mounted && !onboardedAt && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
          <Link
            href="/onboarding"
            className="flex items-center justify-between gap-4 p-5 rounded-2xl border border-wed-purple/40 bg-wed-purple/10 hover:bg-wed-purple/15 transition-all group"
          >
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl bg-wed-purple/20 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-wed-purple" />
              </div>
              <div>
                <p className="text-sm font-bold text-white">Forge your profile</p>
                <p className="text-xs text-wed-gray-400">
                  Take the 2-minute assessment and get a personalized training protocol.
                </p>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-wed-purple group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.1 }}
          >
            <Card className="card-hover">
              <CardContent className="p-5">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center`}>
                    <stat.icon className={`w-5 h-5 ${stat.color}`} />
                  </div>
                  <div>
                    <p className="text-xs text-wed-gray-400">{stat.label}</p>
                    <p className="text-lg font-bold text-white">{stat.value}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Upcoming Workouts */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="lg:col-span-2"
        >
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Calendar className="w-4 h-4 text-wed-blue" />
                Upcoming Workouts
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {planWorkouts.length === 0 ? (
                <p className="text-sm text-wed-gray-400 py-8 text-center">
                  No plan yet — complete your{' '}
                  <Link href="/onboarding" className="text-wed-purple font-semibold">
                    assessment
                  </Link>{' '}
                  to generate your weekly protocol.
                </p>
              ) : (
                planWorkouts.map((workout) => (
                  <div
                    key={workout.name}
                    className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5 hover:border-wed-purple/20 transition-all group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-wed-purple/10 flex items-center justify-center">
                        <Dumbbell className="w-5 h-5 text-wed-purple" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-white group-hover:text-wed-purple transition-colors">
                          {workout.name}
                        </p>
                        <p className="text-xs text-wed-gray-400">{workout.type} • {workout.duration}</p>
                      </div>
                    </div>
                    <span className="text-xs text-wed-gray-500 px-2 py-1 rounded-full bg-white/5">
                      {workout.day}
                    </span>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* XP & Level */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Card className="h-full">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Zap className="w-4 h-4 text-wed-lime" />
                Level Progress
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <div className="text-5xl font-black text-white mb-1">{level}</div>
                <div className="text-sm text-wed-gray-400">
                  {rank.icon} {rank.name}
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs text-wed-gray-400 mb-2">
                  <span>{xp} XP</span>
                  <span>{xpForNext} XP</span>
                </div>
                <Progress value={xp} max={xpForNext} variant="xp" />
              </div>

              <div className="pt-4 border-t border-white/5">
                <p className="text-xs text-wed-gray-400 mb-3">How to earn XP</p>
                <div className="flex items-center gap-2 text-sm text-white">
                  <Trophy className="w-4 h-4 text-wed-lime" />
                  <span>Complete workouts to level up</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Achievements (locked until earned) */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Target className="w-4 h-4 text-wed-pink" />
              Achievements to Unlock
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-3 gap-3">
              {lockedAchievements.map((ach) => (
                <div
                  key={ach.name}
                  className="flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/5 opacity-70"
                >
                  <span className="text-2xl grayscale">{ach.icon}</span>
                  <div>
                    <p className="text-sm font-semibold text-white">{ach.name}</p>
                    <p className="text-xs text-wed-gray-400">{ach.desc}</p>
                  </div>
                  <span className="ml-auto text-xs text-wed-gray-500">🔒</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
