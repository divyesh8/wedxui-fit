'use client';

import { useState, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Dumbbell, Clock, Target, ChevronRight } from 'lucide-react';

const workoutPlans = [
  {
    id: 'ppl',
    name: 'Push Pull Legs',
    desc: 'Classic 3-day split for balanced hypertrophy',
    difficulty: 'Intermediate',
    days: [
      { name: 'Day A — Push', exercises: ['Bench Press 4x8-12', 'Overhead Press 3x8-12', 'Incline Dumbbell Press 3x10-15', 'Lateral Raises 4x12-15', 'Tricep Pushdowns 4x12-15'] },
      { name: 'Day B — Pull', exercises: ['Deadlift 3x5-8', 'Pull-Ups 4x8-12', 'Barbell Rows 4x8-12', 'Face Pulls 4x15-20', 'Barbell Curls 4x10-12'] },
      { name: 'Day C — Legs', exercises: ['Barbell Squat 4x6-10', 'Romanian Deadlift 3x8-12', 'Leg Press 3x10-15', 'Leg Curls 4x12-15', 'Calf Raises 4x15-20'] },
    ],
  },
  {
    id: 'upperlower',
    name: 'Upper / Lower',
    desc: 'Efficient 4-day split for strength and size',
    difficulty: 'Beginner',
    days: [
      { name: 'Upper A', exercises: ['Bench Press 4x6-10', 'Barbell Row 4x8-12', 'Overhead Press 3x8-12', 'Lat Pulldown 3x10-12', 'Bicep Curls 3x12-15'] },
      { name: 'Lower A', exercises: ['Barbell Squat 4x6-10', 'Romanian Deadlift 3x8-12', 'Leg Press 3x10-15', 'Leg Curls 3x12-15', 'Calf Raises 3x15-20'] },
    ],
  },
  {
    id: 'fullbody',
    name: 'Full Body',
    desc: '3x per week, compound-focused for beginners',
    difficulty: 'Beginner',
    days: [
      { name: 'Full Body A', exercises: ['Squat 3x8-12', 'Bench Press 3x8-12', 'Barbell Row 3x8-12', 'Overhead Press 2x10-12', 'Plank 3x60s'] },
      { name: 'Full Body B', exercises: ['Deadlift 3x5-8', 'Pull-Ups 3x8-12', 'Lunges 3x10-12', 'Dips 3x8-12', 'Leg Raises 3x12-15'] },
    ],
  },
  {
    id: 'calisthenics',
    name: 'Calisthenics',
    desc: 'Bodyweight mastery — strength without equipment',
    difficulty: 'Intermediate',
    days: [
      { name: 'Push Day', exercises: ['Push-Ups 4x15-25', 'Pike Push-Ups 4x8-12', 'Diamond Push-Ups 3x10-15', 'Dips 4x10-15', 'Planche Lean 4x30s'] },
      { name: 'Pull Day', exercises: ['Pull-Ups 4x8-12', 'Chin-Ups 3x8-12', 'Inverted Rows 4x12-15', 'Australian Pull-Ups 3x15-20', 'Dead Hang 3x60s'] },
    ],
  },
  {
    id: 'home',
    name: 'Home Workout',
    desc: 'No gym? No problem. Transform at home.',
    difficulty: 'Beginner',
    days: [
      { name: 'Home A', exercises: ['Push-Ups 4x15-20', 'Squats 4x20-25', 'Lunges 3x12-15', 'Plank 3x45s', 'Mountain Climbers 3x30'] },
      { name: 'Home B', exercises: ['Burpees 4x10-15', 'Glute Bridges 4x15-20', 'Wall Sit 3x45s', 'Tricep Dips 3x12-15', 'Bicycle Crunches 3x20'] },
    ],
  },
  {
    id: 'brosplit',
    name: 'Bro Split',
    desc: 'One muscle group per day for maximum volume',
    difficulty: 'Advanced',
    days: [
      { name: 'Chest', exercises: ['Bench Press 4x8-12', 'Incline Press 4x10-12', 'Cable Flyes 4x12-15', 'Dips 3x10-15', 'Push-Ups 3xFailure'] },
      { name: 'Back', exercises: ['Deadlift 4x5-8', 'Pull-Ups 4x8-12', 'Barbell Rows 4x8-12', 'Seated Cable Row 4x10-12', 'Face Pulls 4x15-20'] },
    ],
  },
];

export function WorkoutsSection() {
  const [activePlan, setActivePlan] = useState('ppl');
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  const plan = workoutPlans.find((p) => p.id === activePlan)!;

  return (
    <section id="workouts" className="section-padding relative" ref={ref}>
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-wed-purple/10 text-wed-purple mb-4">
            Training Protocols
          </span>
          <h2 className="text-4xl md:text-5xl font-black text-white mb-4">WORKOUTS</h2>
          <p className="text-wed-gray-300 max-w-xl mx-auto">Pick your path. Every protocol is a questline.</p>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex flex-wrap justify-center gap-2 mb-10"
        >
          {workoutPlans.map((p) => (
            <button
              key={p.id}
              onClick={() => setActivePlan(p.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                activePlan === p.id
                  ? 'bg-wed-purple text-white shadow-lg shadow-wed-purple/20'
                  : 'bg-white/5 text-wed-gray-300 hover:bg-white/10 border border-white/10'
              }`}
            >
              {p.name}
            </button>
          ))}
        </motion.div>

        {/* Plan display */}
        <motion.div
          key={activePlan}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="flex items-center gap-3 mb-6">
            <Dumbbell className="w-5 h-5 text-wed-purple" />
            <h3 className="text-xl font-bold text-white">{plan.name}</h3>
            <span className="px-2 py-0.5 rounded-full text-xs bg-wed-blue/10 text-wed-blue">{plan.difficulty}</span>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {plan.days.map((day, i) => (
              <motion.div
                key={day.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="glass p-5 rounded-2xl card-hover"
              >
                <h4 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                  <Target className="w-4 h-4 text-wed-lime" />
                  {day.name}
                </h4>
                <ul className="space-y-2">
                  {day.exercises.map((ex) => (
                    <li key={ex} className="text-sm text-wed-gray-300 flex items-center gap-2">
                      <ChevronRight className="w-3 h-3 text-wed-purple flex-shrink-0" />
                      {ex}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
