'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Zap, Dumbbell, Clock, TrendingUp } from 'lucide-react';

const ranks = [
  { name: 'Beginner', icon: '🌱', threshold: 1, color: 'text-green-400' },
  { name: 'Disciplined', icon: '🛡️', threshold: 5, color: 'text-blue-400' },
  { name: 'Iron Mind', icon: '⚔️', threshold: 10, color: 'text-purple-400' },
  { name: 'Relentless', icon: '🔥', threshold: 20, color: 'text-orange-400' },
  { name: 'Beast Mode', icon: '🐺', threshold: 35, color: 'text-red-400' },
  { name: 'Elite', icon: '👑', threshold: 50, color: 'text-yellow-400' },
  { name: 'Legend', icon: '⭐', threshold: 75, color: 'text-wed-lime' },
];

export function GamificationSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const currentLevel = 8;

  return (
    <section id="gamification" className="section-padding relative" ref={ref}>
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-wed-orange/10 text-wed-orange mb-4">
            Rank System
          </span>
          <h2 className="text-4xl md:text-5xl font-black text-white mb-4">RANK UP</h2>
          <p className="text-wed-gray-300 max-w-xl mx-auto">Earn XP. Unlock titles. Become legendary.</p>
        </motion.div>

        {/* Rank Track */}
        <div className="relative">
          <div className="absolute top-8 left-0 right-0 h-0.5 bg-white/10 hidden lg:block" />
          
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-4 lg:gap-2">
            {ranks.map((rank, i) => {
              const isUnlocked = currentLevel >= rank.threshold;
              const isCurrent = currentLevel >= rank.threshold && (i === ranks.length - 1 || currentLevel < ranks[i + 1].threshold);
              
              return (
                <motion.div
                  key={rank.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className={`relative flex flex-col items-center text-center p-4 rounded-2xl transition-all ${
                    isCurrent
                      ? 'glass glow-purple scale-105'
                      : isUnlocked
                      ? 'glass opacity-70'
                      : 'opacity-30'
                  }`}
                >
                  {isCurrent && (
                    <div className="absolute -top-2 px-2 py-0.5 rounded-full bg-wed-purple text-white text-[10px] font-bold">
                      CURRENT
                    </div>
                  )}
                  <div className={`text-3xl mb-2 ${isCurrent ? 'animate-bounce' : ''}`}>{rank.icon}</div>
                  <div className={`text-sm font-bold ${isUnlocked ? 'text-white' : 'text-wed-gray-500'}`}>
                    {rank.name}
                  </div>
                  <div className="text-xs text-wed-gray-500 mt-1">Lv. {rank.threshold}+</div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Stats Row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-12"
        >
          {[
            { label: 'Total XP', value: '2,450', icon: Zap },
            { label: 'Workouts', value: '47', icon: Dumbbell },
            { label: 'Minutes', value: '2,340', icon: Clock },
            { label: 'Reps', value: '8,920', icon: TrendingUp },
          ].map((stat) => (
            <div key={stat.label} className="glass p-4 rounded-2xl text-center">
              <stat.icon className="w-5 h-5 text-wed-purple mx-auto mb-2" />
              <div className="text-2xl font-black text-white">{stat.value}</div>
              <div className="text-xs text-wed-gray-400">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
