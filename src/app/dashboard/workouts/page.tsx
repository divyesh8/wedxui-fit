'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Clock, Calendar, CheckCircle, Circle, ChevronRight, Dumbbell, Flame } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const workoutPlans = [
  { id: 'ppl', name: 'Push Pull Legs', days: 6, difficulty: 'Intermediate', active: true },
  { id: 'ul', name: 'Upper / Lower', days: 4, difficulty: 'Beginner', active: false },
  { id: 'fb', name: 'Full Body', days: 3, difficulty: 'Beginner', active: false },
  { id: 'cal', name: 'Calisthenics', days: 4, difficulty: 'Advanced', active: false },
];

const workoutHistory = [
  { id: 1, name: 'Push Day A', date: 'Today', duration: '62 min', exercises: 6, volume: '8,420 kg', completed: true },
  { id: 2, name: 'Pull Day B', date: 'Yesterday', duration: '58 min', exercises: 5, volume: '7,200 kg', completed: true },
  { id: 3, name: 'Leg Day C', date: '2 days ago', duration: '75 min', exercises: 7, volume: '12,100 kg', completed: true },
  { id: 4, name: 'Push Day A', date: '4 days ago', duration: '55 min', exercises: 6, volume: '7,800 kg', completed: true },
];

const todaysWorkout = {
  name: 'Push Day B',
  focus: 'Chest, Shoulders, Triceps',
  duration: '60 min',
  exercises: [
    { name: 'Bench Press', sets: '4x8-12', rest: '90s', completed: false },
    { name: 'Overhead Press', sets: '3x8-12', rest: '90s', completed: false },
    { name: 'Incline Dumbbell Press', sets: '3x10-15', rest: '60s', completed: false },
    { name: 'Lateral Raises', sets: '4x12-15', rest: '60s', completed: false },
    { name: 'Tricep Pushdowns', sets: '4x12-15', rest: '60s', completed: false },
    { name: 'Cable Flyes', sets: '3x15-20', rest: '45s', completed: false },
  ],
};

export default function WorkoutsPage() {
  const [activeTab, setActiveTab] = useState<'today' | 'plans' | 'history'>('today');
  const [exercises, setExercises] = useState(todaysWorkout.exercises);

  const toggleExercise = (index: number) => {
    setExercises((prev) =>
      prev.map((ex, i) => (i === index ? { ...ex, completed: !ex.completed } : ex))
    );
  };

  const completedCount = exercises.filter((e) => e.completed).length;
  const progress = (completedCount / exercises.length) * 100;

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <h2 className="text-2xl font-bold text-white mb-1">Workouts</h2>
        <p className="text-wed-gray-400">Train with purpose. Every session is a step forward.</p>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-2">
        {(['today', 'plans', 'history'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              activeTab === tab
                ? 'bg-wed-purple text-white'
                : 'bg-white/5 text-wed-gray-400 hover:bg-white/10'
            }`}
          >
            {tab === 'today' ? "Today's Workout" : tab === 'plans' ? 'My Plans' : 'History'}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'today' && (
          <motion.div key="today" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
            {/* Workout Header */}
            <Card className="glow-purple">
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-bold text-white">{todaysWorkout.name}</h3>
                    <p className="text-sm text-wed-gray-400">{todaysWorkout.focus}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-sm text-wed-gray-400">Progress</div>
                      <div className="text-lg font-bold text-wed-purple">{completedCount}/{exercises.length}</div>
                    </div>
                    <Button variant="glow" size="lg" className="gap-2">
                      <Play className="w-4 h-4" /> Start Session
                    </Button>
                  </div>
                </div>
                <div className="mt-4 h-2 rounded-full bg-white/10 overflow-hidden">
                  <motion.div className="h-full rounded-full bg-gradient-purple" animate={{ width: `${progress}%` }} transition={{ duration: 0.5 }} />
                </div>
              </CardContent>
            </Card>

            {/* Exercise List */}
            <div className="space-y-3">
              {exercises.map((ex, i) => (
                <motion.div
                  key={ex.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => toggleExercise(i)}
                  className={`flex items-center gap-4 p-4 rounded-xl border transition-all cursor-pointer ${
                    ex.completed
                      ? 'bg-wed-purple/10 border-wed-purple/30'
                      : 'bg-white/5 border-white/5 hover:border-white/15'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                    ex.completed ? 'bg-wed-purple text-white' : 'bg-white/10 text-wed-gray-400'
                  }`}>
                    {ex.completed ? <CheckCircle className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
                  </div>
                  <div className="flex-1">
                    <p className={`font-semibold ${ex.completed ? 'text-wed-gray-400 line-through' : 'text-white'}`}>{ex.name}</p>
                    <p className="text-xs text-wed-gray-500">{ex.sets} • Rest {ex.rest}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-wed-gray-500" />
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {activeTab === 'plans' && (
          <motion.div key="plans" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="grid sm:grid-cols-2 gap-4">
            {workoutPlans.map((plan) => (
              <Card key={plan.id} className={`card-hover ${plan.active ? 'glow-purple' : ''}`}>
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-lg font-bold text-white">{plan.name}</h3>
                      <p className="text-xs text-wed-gray-400">{plan.days} days / week</p>
                    </div>
                    {plan.active && <span className="px-2 py-0.5 rounded-full text-xs bg-wed-purple/20 text-wed-purple font-semibold">Active</span>}
                  </div>
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-white/5 text-wed-gray-400 border border-white/10">{plan.difficulty}</span>
                  </div>
                  <Button variant={plan.active ? 'glow' : 'outline'} size="sm" className="w-full">
                    {plan.active ? 'Continue Plan' : 'Select Plan'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </motion.div>
        )}

        {activeTab === 'history' && (
          <motion.div key="history" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-3">
            {workoutHistory.map((workout, i) => (
              <motion.div
                key={workout.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/5 hover:border-white/15 transition-all"
              >
                <div className="w-10 h-10 rounded-xl bg-wed-purple/10 flex items-center justify-center">
                  <Dumbbell className="w-5 h-5 text-wed-purple" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-white">{workout.name}</p>
                  <p className="text-xs text-wed-gray-400">{workout.exercises} exercises • {workout.volume}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-wed-gray-300">{workout.duration}</p>
                  <p className="text-xs text-wed-gray-500">{workout.date}</p>
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
