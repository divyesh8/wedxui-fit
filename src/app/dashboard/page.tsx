'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Flame, Dumbbell, Clock, TrendingUp, Calendar, Zap, Trophy, Target, Sparkles, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useProfileStore } from '@/store/profile';

const stats = [
  { label: 'Workout Streak', value: '12 days', icon: Flame, color: 'text-wed-purple', bg: 'bg-wed-purple/10' },
  { label: 'This Week', value: '4 workouts', icon: Dumbbell, color: 'text-wed-blue', bg: 'bg-wed-blue/10' },
  { label: 'Time Trained', value: '3h 45m', icon: Clock, color: 'text-wed-lime', bg: 'bg-wed-lime/10' },
  { label: 'Volume', value: '12,400 kg', icon: TrendingUp, color: 'text-wed-pink', bg: 'bg-wed-pink/10' },
];

const upcomingWorkouts = [
  { day: 'Today', name: 'Push Day A', type: 'Chest & Triceps', duration: '60 min', completed: false },
  { day: 'Tomorrow', name: 'Pull Day B', type: 'Back & Biceps', duration: '60 min', completed: false },
  { day: 'Wed', name: 'Leg Day C', type: 'Quads & Hamstrings', duration: '75 min', completed: false },
];

const recentAchievements = [
  { name: 'Week Warrior', desc: '7-day streak', icon: '🔥', time: '2 days ago' },
  { name: 'PR Breaker', desc: 'New bench PR: 100kg', icon: '🏆', time: '3 days ago' },
  { name: 'Century Club', desc: '100 workouts', icon: '💯', time: '1 week ago' },
];

export default function DashboardPage() {
  const { profile, plan, onboardedAt } = useProfileStore();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Prefer the generated plan for the schedule; fall back to sample data pre-onboarding.
  const dayLabels = ['Today', 'Tomorrow', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const planWorkouts =
    mounted && plan
      ? plan.days.slice(0, 3).map((day, i) => ({
          day: dayLabels[i],
          name: day.name,
          type: `${day.exercises.length} exercises`,
          duration: `${profile?.sessionMinutes ?? 60} min`,
          completed: false,
        }))
      : upcomingWorkouts;

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
        <p className="text-wed-gray-400">You're on a 12-day streak. Keep the momentum going.</p>
      </motion.div>

      {/* Onboarding CTA */}
      {mounted && !onboardedAt && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.05 }}>
          <Link
            href="/dashboard/onboarding"
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
              {planWorkouts.map((workout) => (
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
              ))}
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
                <div className="text-5xl font-black text-white mb-1">8</div>
                <div className="text-sm text-wed-gray-400">Iron Mind</div>
              </div>
              
              <div>
                <div className="flex justify-between text-xs text-wed-gray-400 mb-2">
                  <span>2,450 XP</span>
                  <span>3,000 XP</span>
                </div>
                <Progress value={2450} max={3000} variant="xp" />
              </div>

              <div className="pt-4 border-t border-white/5">
                <p className="text-xs text-wed-gray-400 mb-3">Next Rewards</p>
                <div className="flex items-center gap-2 text-sm text-white">
                  <Trophy className="w-4 h-4 text-wed-lime" />
                  <span>Relentless Title at Level 10</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Target className="w-4 h-4 text-wed-pink" />
              Recent Achievements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-3 gap-3">
              {recentAchievements.map((ach) => (
                <div
                  key={ach.name}
                  className="flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/5"
                >
                  <span className="text-2xl">{ach.icon}</span>
                  <div>
                    <p className="text-sm font-semibold text-white">{ach.name}</p>
                    <p className="text-xs text-wed-gray-400">{ach.desc}</p>
                  </div>
                  <span className="ml-auto text-xs text-wed-gray-500">{ach.time}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
