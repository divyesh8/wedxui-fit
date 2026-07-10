'use client';

import { useState, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { TrendingUp, Activity, Award, Flame, Calendar, Camera, Weight, Ruler, Zap, Trophy, TrendingDown, TrendingDownIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';

const weightData = [72, 71.5, 71.2, 70.8, 70.5, 70.2, 69.8, 69.5, 69.3, 69.0, 68.8, 68.5];
const bodyFatData = [18, 17.5, 17.2, 16.8, 16.5, 16.2, 15.8, 15.5, 15.3, 15.0, 14.8, 14.5];
const muscleData = [35, 35.2, 35.5, 35.8, 36.0, 36.3, 36.5, 36.8, 37.0, 37.2, 37.5, 37.8];

const measurements = [
  { label: 'Chest', value: 102, unit: 'cm', change: +2 },
  { label: 'Waist', value: 78, unit: 'cm', change: -4 },
  { label: 'Arms', value: 36, unit: 'cm', change: +1.5 },
  { label: 'Thighs', value: 58, unit: 'cm', change: +2 },
];

const prs = [
  { exercise: 'Bench Press', value: 100, unit: 'kg', date: '2 weeks ago', prev: 92.5 },
  { exercise: 'Squat', value: 140, unit: 'kg', date: '1 month ago', prev: 130 },
  { exercise: 'Deadlift', value: 180, unit: 'kg', date: '3 weeks ago', prev: 170 },
  { exercise: 'Overhead Press', value: 65, unit: 'kg', date: '2 days ago', prev: 60 },
];

const achievements = [
  { name: 'First Blood', icon: '🩸', desc: 'Complete your first workout', unlocked: '1 month ago' },
  { name: 'Week Warrior', icon: '🔥', desc: '7-day streak', unlocked: '2 weeks ago' },
  { name: 'Iron Will', icon: '⚔️', desc: '30-day streak', unlocked: '3 days ago' },
  { name: 'Century Club', icon: '💯', desc: '100 workouts completed', unlocked: '1 week ago' },
  { name: 'PR Breaker', icon: '🏆', desc: 'Set 10 personal records', unlocked: '2 days ago' },
  { name: 'Early Bird', icon: '🌅', desc: '5 AM workout club', unlocked: '5 days ago' },
];

function SimpleBarChart({ data, color, label }: { data: number[]; color: string; label: string }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  return (
    <div className="flex items-end gap-1 h-32">
      {data.map((val, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1">
          <div
            className={`w-full rounded-t-sm transition-all hover:opacity-80 ${color}`}
            style={{ height: `${((val - min) / range) * 100}%`, minHeight: '10%' }}
          />
          {i % 3 === 0 && <span className="text-[10px] text-wed-gray-500">{i + 1}</span>}
        </div>
      ))}
    </div>
  );
}

export default function ProgressPage() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const [timeRange, setTimeRange] = useState('3m');

  return (
    <div className="space-y-6" ref={ref}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-white mb-1">Progress Tracking</h2>
            <p className="text-wed-gray-400">Watch your transformation with data and charts.</p>
          </div>
          <div className="flex gap-2">
            {['1m', '3m', '6m', '1y'].map((r) => (
              <button
                key={r}
                onClick={() => setTimeRange(r)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  timeRange === r ? 'bg-wed-purple text-white' : 'bg-white/5 text-wed-gray-400 hover:bg-white/10'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Current Weight', value: '68.5', unit: 'kg', change: '-3.5', icon: Weight, color: 'text-wed-blue' },
          { label: 'Body Fat', value: '14.5', unit: '%', change: '-3.5', icon: Activity, color: 'text-wed-pink' },
          { label: 'Muscle Mass', value: '37.8', unit: 'kg', change: '+2.8', icon: Zap, color: 'text-wed-lime' },
          { label: 'Workout Streak', value: '12', unit: 'days', change: '+12', icon: Flame, color: 'text-wed-purple' },
        ].map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ delay: i * 0.1 }}>
            <Card>
              <CardContent className="p-5">
                <div className="flex items-center gap-2 mb-2">
                  <stat.icon className={`w-4 h-4 ${stat.color}`} />
                  <span className="text-xs text-wed-gray-400">{stat.label}</span>
                </div>
                <div className="text-2xl font-black text-white">
                  {stat.value}<span className="text-sm font-normal text-wed-gray-400 ml-1">{stat.unit}</span>
                </div>
                <div className={`text-xs font-medium mt-1 ${stat.change.startsWith('-') ? 'text-wed-pink' : 'text-wed-lime'}`}>
                  {stat.change.startsWith('-') ? '' : '+'}{stat.change} since start
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-3 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.3 }}>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingDown className="w-4 h-4 text-wed-blue" /> Weight Trend
              </CardTitle>
            </CardHeader>
            <CardContent>
              <SimpleBarChart data={weightData} color="bg-wed-blue/50" label="Weight" />
              <div className="flex justify-between text-xs text-wed-gray-500 mt-2">
                <span>Start: 72kg</span>
                <span>Current: 68.5kg</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.4 }}>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Activity className="w-4 h-4 text-wed-pink" /> Body Fat %
              </CardTitle>
            </CardHeader>
            <CardContent>
              <SimpleBarChart data={bodyFatData} color="bg-wed-pink/50" label="Body Fat" />
              <div className="flex justify-between text-xs text-wed-gray-500 mt-2">
                <span>Start: 18%</span>
                <span>Current: 14.5%</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.5 }}>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Zap className="w-4 h-4 text-wed-lime" /> Muscle Mass
              </CardTitle>
            </CardHeader>
            <CardContent>
              <SimpleBarChart data={muscleData} color="bg-wed-lime/50" label="Muscle" />
              <div className="flex justify-between text-xs text-wed-gray-500 mt-2">
                <span>Start: 35kg</span>
                <span>Current: 37.8kg</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Measurements & PRs */}
      <div className="grid lg:grid-cols-2 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.6 }}>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Ruler className="w-4 h-4 text-wed-purple" /> Measurements
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {measurements.map((m) => (
                <div key={m.label} className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-wed-purple/10 flex items-center justify-center">
                      <Ruler className="w-4 h-4 text-wed-purple" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">{m.label}</p>
                      <p className="text-xs text-wed-gray-400">{m.value}{m.unit}</p>
                    </div>
                  </div>
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full ${m.change > 0 ? 'bg-wed-lime/10 text-wed-lime' : 'bg-wed-pink/10 text-wed-pink'}`}>
                    {m.change > 0 ? '+' : ''}{m.change}{m.unit}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.7 }}>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Trophy className="w-4 h-4 text-wed-orange" /> Personal Records
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {prs.map((pr) => (
                <div key={pr.exercise} className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                  <div>
                    <p className="text-sm font-semibold text-white">{pr.exercise}</p>
                    <p className="text-xs text-wed-gray-400">{pr.date}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-white">{pr.value}<span className="text-sm font-normal text-wed-gray-400 ml-1">{pr.unit}</span></p>
                    <p className="text-xs text-wed-lime">+{pr.value - pr.prev}{pr.unit} from {pr.prev}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Achievements */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.8 }}>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Award className="w-4 h-4 text-wed-lime" /> Achievements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {achievements.map((ach) => (
                <div key={ach.name} className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5 hover:border-wed-purple/20 transition-all">
                  <span className="text-2xl">{ach.icon}</span>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-white">{ach.name}</p>
                    <p className="text-xs text-wed-gray-400">{ach.desc}</p>
                  </div>
                  <span className="text-xs text-wed-gray-500">{ach.unlocked}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
