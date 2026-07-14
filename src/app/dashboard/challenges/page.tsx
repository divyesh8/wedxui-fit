'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Clock, Zap, Users, CheckCircle, Lock, Flame, Star, Target, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

// Intentionally not wired to Neon — the Challenge/UserChallenge join-and-browse
// flow doesn't exist yet, so there's nothing real to show here. The workout
// completion transaction (api/workouts/[id]/exercises/[id]/complete) does bump
// progress on any real UserChallenge rows a user has joined once that flow ships.
const activeChallenges = [
  { id: '30day', name: '30-Day Transformation', desc: 'Complete a workout every day for 30 days', progress: 45, duration: 30, xpReward: 5000, badge: '🔥', daysLeft: 16 },
  { id: 'pushup100', name: '100 Push-Up Challenge', desc: 'Build up to 100 consecutive push-ups', progress: 70, duration: 21, xpReward: 2000, badge: '💪', daysLeft: 6 },
];

const availableChallenges = [
  { id: 'plank5min', name: '5-Minute Plank Master', desc: 'Hold a plank for 5 minutes straight', difficulty: 'Advanced', xpReward: 3000, badge: '🧘', participants: 8500 },
  { id: 'pullup20', name: '20 Pull-Ups Challenge', desc: 'Go from zero to 20 strict pull-ups', difficulty: 'Advanced', xpReward: 4000, badge: '⚡', participants: 6200 },
  { id: 'squat100', name: '100 Squats Daily', desc: '100 bodyweight squats every day for 30 days', difficulty: 'Beginner', xpReward: 2500, badge: '🦵', participants: 19200 },
  { id: 'run5k', name: 'Couch to 5K', desc: 'Go from sedentary to running 5 kilometers', difficulty: 'Beginner', xpReward: 3500, badge: '🏃', participants: 31000 },
];

const completedChallenges = [
  { id: 'first7', name: 'Week Warrior', desc: '7-day workout streak', completedAt: '2 weeks ago', xpEarned: 500, badge: '🔥' },
  { id: 'firstworkout', name: 'First Blood', desc: 'Complete your first workout', completedAt: '1 month ago', xpEarned: 100, badge: '🩸' },
];

export default function ChallengesPage() {
  const [activeTab, setActiveTab] = useState<'active' | 'available' | 'completed'>('active');

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <h2 className="text-2xl font-bold text-white mb-1">Challenges</h2>
        <p className="text-wed-gray-400">Accept quests. Earn badges. Become legendary.</p>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Active', value: '2', icon: Flame, color: 'text-wed-purple' },
          { label: 'Completed', value: '12', icon: CheckCircle, color: 'text-wed-lime' },
          { label: 'XP Earned', value: '8.5K', icon: Zap, color: 'text-wed-blue' },
          { label: 'Rank', value: 'Iron Mind', icon: Trophy, color: 'text-wed-orange' },
        ].map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
            <Card>
              <CardContent className="p-4 flex items-center gap-3">
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
                <div>
                  <p className="text-xs text-wed-gray-400">{stat.label}</p>
                  <p className="text-lg font-bold text-white">{stat.value}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {(['active', 'available', 'completed'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              activeTab === tab ? 'bg-wed-purple text-white' : 'bg-white/5 text-wed-gray-400 hover:bg-white/10'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'active' && (
          <motion.div key="active" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
            {activeChallenges.map((c) => (
              <Card key={c.id} className="glow-purple">
                <CardContent className="p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                    <div className="flex items-center gap-4">
                      <span className="text-4xl">{c.badge}</span>
                      <div>
                        <h3 className="text-lg font-bold text-white">{c.name}</h3>
                        <p className="text-sm text-wed-gray-400">{c.desc}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-wed-gray-400">{c.daysLeft} days left</p>
                      <p className="text-xs text-wed-lime">{c.xpReward} XP on completion</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <div className="flex justify-between text-xs text-wed-gray-400 mb-1">
                        <span>Progress</span>
                        <span>{c.progress}%</span>
                      </div>
                      <Progress value={c.progress} max={100} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </motion.div>
        )}

        {activeTab === 'available' && (
          <motion.div key="available" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="grid sm:grid-cols-2 gap-4">
            {availableChallenges.map((c, i) => (
              <motion.div key={c.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                <Card className="card-hover h-full">
                  <CardContent className="p-5">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-3xl">{c.badge}</span>
                      <div>
                        <h3 className="text-lg font-bold text-white">{c.name}</h3>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-wed-blue/10 text-wed-blue">{c.difficulty}</span>
                      </div>
                    </div>
                    <p className="text-sm text-wed-gray-400 mb-4">{c.desc}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 text-xs text-wed-gray-500">
                        <span className="flex items-center gap-1"><Zap className="w-3 h-3 text-wed-lime" /> {c.xpReward} XP</span>
                        <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {(c.participants / 1000).toFixed(1)}K</span>
                      </div>
                      <Button variant="outline" size="sm">Join</Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}

        {activeTab === 'completed' && (
          <motion.div key="completed" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-3">
            {completedChallenges.map((c, i) => (
              <motion.div key={c.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }} className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/5">
                <span className="text-2xl">{c.badge}</span>
                <div className="flex-1">
                  <p className="font-semibold text-white">{c.name}</p>
                  <p className="text-xs text-wed-gray-400">{c.desc}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-wed-lime font-semibold">+{c.xpEarned} XP</p>
                  <p className="text-xs text-wed-gray-500">{c.completedAt}</p>
                </div>
                <CheckCircle className="w-5 h-5 text-wed-lime" />
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
