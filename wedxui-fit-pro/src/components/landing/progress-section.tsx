'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { TrendingUp, Activity, Award, Flame } from 'lucide-react';

export function ProgressSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  const mockData = {
    weight: [72, 71.5, 71.2, 70.8, 70.5, 70.2, 69.8, 69.5],
    bodyFat: [18, 17.5, 17.2, 16.8, 16.5, 16.2, 15.8, 15.5],
    streak: 12,
    prs: [
      { exercise: 'Bench Press', value: '100 kg' },
      { exercise: 'Squat', value: '140 kg' },
      { exercise: 'Deadlift', value: '180 kg' },
    ],
    xp: 2450,
    xpNext: 3000,
    level: 8,
    achievements: [
      { name: 'First Blood', icon: '🩸', desc: 'Complete your first workout' },
      { name: 'Week Warrior', icon: '🔥', desc: '7-day streak' },
      { name: 'Iron Will', icon: '⚔️', desc: '30-day streak' },
      { name: 'Century Club', icon: '💯', desc: '100 workouts completed' },
      { name: 'PR Breaker', icon: '🏆', desc: 'Set 10 personal records' },
      { name: 'Early Bird', icon: '🌅', desc: '5 AM workout club' },
    ],
  };

  const xpPercent = (mockData.xp / mockData.xpNext) * 100;

  return (
    <section id="progress" className="section-padding relative" ref={ref}>
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-wed-lime/10 text-wed-lime mb-4">
            Evolution
          </span>
          <h2 className="text-4xl md:text-5xl font-black text-white mb-4">PROGRESS</h2>
          <p className="text-wed-gray-300 max-w-xl mx-auto">Watch yourself transform. Data doesn't lie.</p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {/* Weight Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="glass p-5 rounded-2xl"
          >
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-4 h-4 text-wed-blue" />
              <span className="text-sm font-medium text-wed-gray-300">Weight</span>
            </div>
            <div className="text-3xl font-black text-white">69.5 <span className="text-sm font-normal text-wed-gray-400">kg</span></div>
            <div className="mt-3 h-16 flex items-end gap-1">
              {mockData.weight.map((w, i) => (
                <div
                  key={i}
                  className="flex-1 rounded-t-sm bg-wed-blue/30 hover:bg-wed-blue/50 transition-colors"
                  style={{ height: `${((w - 68) / 5) * 100}%`, minHeight: '20%' }}
                />
              ))}
            </div>
          </motion.div>

          {/* Body Fat */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="glass p-5 rounded-2xl"
          >
            <div className="flex items-center gap-2 mb-3">
              <Activity className="w-4 h-4 text-wed-pink" />
              <span className="text-sm font-medium text-wed-gray-300">Body Fat %</span>
            </div>
            <div className="text-3xl font-black text-white">15.5<span className="text-sm font-normal text-wed-gray-400">%</span></div>
            <div className="mt-3 h-16 flex items-end gap-1">
              {mockData.bodyFat.map((bf, i) => (
                <div
                  key={i}
                  className="flex-1 rounded-t-sm bg-wed-pink/30 hover:bg-wed-pink/50 transition-colors"
                  style={{ height: `${(bf / 25) * 100}%`, minHeight: '20%' }}
                />
              ))}
            </div>
          </motion.div>

          {/* Streak */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="glass p-5 rounded-2xl flex flex-col items-center justify-center"
          >
            <div className="relative w-24 h-24 mb-2">
              <svg className="w-24 h-24 -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="8" />
                <circle
                  cx="50" cy="50" r="42" fill="none"
                  stroke="#b026ff"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={`${(mockData.streak / 30) * 264} 264`}
                  className="transition-all duration-1000"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <Flame className="w-8 h-8 text-wed-purple" />
              </div>
            </div>
            <div className="text-3xl font-black text-white">{mockData.streak}</div>
            <div className="text-xs text-wed-gray-400">day streak</div>
          </motion.div>

          {/* PRs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="glass p-5 rounded-2xl"
          >
            <div className="flex items-center gap-2 mb-3">
              <Award className="w-4 h-4 text-wed-lime" />
              <span className="text-sm font-medium text-wed-gray-300">PR Records</span>
            </div>
            <div className="space-y-2">
              {mockData.prs.map((pr) => (
                <div key={pr.exercise} className="flex justify-between items-center text-sm">
                  <span className="text-wed-gray-300">{pr.exercise}</span>
                  <span className="text-white font-bold">{pr.value}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* XP Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="glass p-6 rounded-2xl mb-6"
        >
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-lg font-bold text-white">Level {mockData.level}</h3>
              <p className="text-xs text-wed-gray-400">{mockData.xp} / {mockData.xpNext} XP</p>
            </div>
            <span className="px-3 py-1 rounded-full bg-wed-purple/20 text-wed-purple text-sm font-bold">
              Iron Mind
            </span>
          </div>
          <div className="h-3 rounded-full bg-white/5 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={isInView ? { width: `${xpPercent}%` } : {}}
              transition={{ duration: 1.2, delay: 0.7, ease: 'easeOut' }}
              className="h-full rounded-full bg-gradient-wed"
            />
          </div>
        </motion.div>

        {/* Achievements */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="glass p-6 rounded-2xl"
        >
          <h3 className="text-lg font-bold text-white mb-4">Achievements</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {mockData.achievements.map((ach) => (
              <div key={ach.name} className="text-center p-3 rounded-xl bg-white/5 border border-white/5 hover:border-wed-purple/30 transition-all group">
                <div className="text-2xl mb-1 group-hover:scale-110 transition-transform">{ach.icon}</div>
                <div className="text-xs font-semibold text-white">{ach.name}</div>
                <div className="text-[10px] text-wed-gray-500">{ach.desc}</div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
