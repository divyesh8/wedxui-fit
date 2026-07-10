'use client';

import { useState, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Trophy, Clock, Target, Users, Zap, Shield } from 'lucide-react';

const challenges = [
  {
    id: '30day',
    name: '30-Day Transformation',
    desc: 'Complete a workout every day for 30 days. No excuses. No rest days.',
    duration: 30,
    difficulty: 'Intermediate',
    xpReward: 5000,
    badge: '🔥',
    participants: 12400,
  },
  {
    id: 'pushup100',
    name: '100 Push-Up Challenge',
    desc: 'Build up to 100 consecutive push-ups. Start where you are, build where you want to be.',
    duration: 21,
    difficulty: 'Beginner',
    xpReward: 2000,
    badge: '💪',
    participants: 28700,
  },
  {
    id: 'plank5min',
    name: '5-Minute Plank Master',
    desc: 'Hold a plank for 5 minutes straight. Core of steel incoming.',
    duration: 14,
    difficulty: 'Advanced',
    xpReward: 3000,
    badge: '🧘',
    participants: 8500,
  },
  {
    id: 'pullup20',
    name: '20 Pull-Ups Challenge',
    desc: 'Go from zero to 20 strict pull-ups. The ultimate test of pulling power.',
    duration: 45,
    difficulty: 'Advanced',
    xpReward: 4000,
    badge: '⚡',
    participants: 6200,
  },
  {
    id: 'squat100',
    name: '100 Squats Daily',
    desc: '100 bodyweight squats every day for 30 days. Build unbreakable legs.',
    duration: 30,
    difficulty: 'Beginner',
    xpReward: 2500,
    badge: '🦵',
    participants: 19200,
  },
  {
    id: 'run5k',
    name: 'Couch to 5K',
    desc: 'Go from sedentary to running 5 kilometers in 8 weeks. Cardio dominance.',
    duration: 56,
    difficulty: 'Beginner',
    xpReward: 3500,
    badge: '🏃',
    participants: 31000,
  },
];

export function ChallengesSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section id="challenges" className="section-padding relative" ref={ref}>
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-wed-pink/10 text-wed-pink mb-4">
            Trials
          </span>
          <h2 className="text-4xl md:text-5xl font-black text-white mb-4">CHALLENGES</h2>
          <p className="text-wed-gray-300 max-w-xl mx-auto">Accept the quest. Earn the badge.</p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {challenges.map((c, i) => (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="glass p-6 rounded-2xl card-hover group relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-wed-purple/10 to-transparent rounded-bl-full" />
              
              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl">{c.badge}</span>
                <div>
                  <h3 className="text-lg font-bold text-white group-hover:text-wed-purple transition-colors">
                    {c.name}
                  </h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-wed-blue/10 text-wed-blue">
                      {c.difficulty}
                    </span>
                  </div>
                </div>
              </div>

              <p className="text-sm text-wed-gray-400 mb-4">{c.desc}</p>

              <div className="flex items-center gap-4 text-xs text-wed-gray-500 mb-4">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {c.duration} days
                </span>
                <span className="flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5 text-wed-lime" />
                  {c.xpReward} XP
                </span>
                <span className="flex items-center gap-1">
                  <Users className="w-3.5 h-3.5" />
                  {(c.participants / 1000).toFixed(1)}K
                </span>
              </div>

              <button className="w-full py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm font-semibold text-white hover:bg-wed-purple/20 hover:border-wed-purple/30 transition-all">
                Accept Challenge
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
