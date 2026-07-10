'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Activity, Flame, Weight, Plus, Trash2, LineChart, Sparkles } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useProfileStore } from '@/store/profile';
import { useProgressStore, type ProgressEntry } from '@/store/progress';
import { formatDate } from '@/lib/utils';

function TrendChart({ data, color }: { data: number[]; color: string }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  return (
    <div className="flex items-end gap-1 h-32">
      {data.map((val, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1">
          <div
            className={`w-full rounded-t-sm transition-all hover:opacity-80 ${color}`}
            style={{ height: `${Math.max(((val - min) / range) * 100, 8)}%` }}
            title={String(val)}
          />
        </div>
      ))}
    </div>
  );
}

export default function ProgressPage() {
  const { profile, onboardedAt } = useProfileStore();
  const { entries, addEntry, removeEntry } = useProgressStore();

  const [mounted, setMounted] = useState(false);
  const [weight, setWeight] = useState('');
  const [bodyFat, setBodyFat] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  // The onboarding measurement is the first real data point.
  const baseline: ProgressEntry[] =
    onboardedAt && profile?.weightKg
      ? [{ id: 'baseline', date: onboardedAt, weightKg: profile.weightKg, bodyFatPct: profile.bodyFatPct ?? null }]
      : [];
  const allEntries = [...baseline, ...entries];

  const weightSeries = allEntries.map((e) => e.weightKg);
  const bodyFatSeries = allEntries.filter((e) => e.bodyFatPct != null).map((e) => e.bodyFatPct as number);

  const current = allEntries[allEntries.length - 1];
  const first = allEntries[0];
  const weightChange = current && first ? current.weightKg - first.weightKg : 0;

  const submitEntry = (e: React.FormEvent) => {
    e.preventDefault();
    const w = parseFloat(weight);
    const bf = bodyFat === '' ? null : parseFloat(bodyFat);
    if (Number.isNaN(w) || w < 30 || w > 300) {
      setFormError('Enter a weight between 30 and 300 kg.');
      return;
    }
    if (bf !== null && (Number.isNaN(bf) || bf < 3 || bf > 60)) {
      setFormError('Body fat must be between 3 and 60%.');
      return;
    }
    addEntry(w, bf);
    setWeight('');
    setBodyFat('');
    setFormError(null);
  };

  const stats = [
    {
      label: 'Current Weight',
      value: current ? `${current.weightKg}` : '—',
      unit: current ? 'kg' : '',
      icon: Weight,
      color: 'text-wed-blue',
    },
    {
      label: 'Body Fat',
      value: current?.bodyFatPct != null ? `${current.bodyFatPct}` : '—',
      unit: current?.bodyFatPct != null ? '%' : '',
      icon: Activity,
      color: 'text-wed-pink',
    },
    {
      label: 'Change Since Start',
      value: allEntries.length > 1 ? `${weightChange > 0 ? '+' : ''}${weightChange.toFixed(1)}` : '—',
      unit: allEntries.length > 1 ? 'kg' : '',
      icon: LineChart,
      color: 'text-wed-lime',
    },
    {
      label: 'Entries Logged',
      value: `${allEntries.length}`,
      unit: '',
      icon: Flame,
      color: 'text-wed-purple',
    },
  ];

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <h2 className="text-2xl font-bold text-white mb-1">Progress Tracking</h2>
        <p className="text-wed-gray-400">Your real numbers — log check-ins and watch the trend build.</p>
      </motion.div>

      {/* Not onboarded yet */}
      {!onboardedAt && (
        <Link
          href="/dashboard/onboarding"
          className="flex items-center gap-3 p-5 rounded-2xl border border-wed-purple/40 bg-wed-purple/10 hover:bg-wed-purple/15 transition-all"
        >
          <Sparkles className="w-5 h-5 text-wed-purple" />
          <p className="text-sm text-white">
            Complete your assessment first — your starting weight becomes the first point on these charts.
          </p>
        </Link>
      )}

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
            <Card>
              <CardContent className="p-5">
                <div className="flex items-center gap-2 mb-2">
                  <stat.icon className={`w-4 h-4 ${stat.color}`} />
                  <span className="text-xs text-wed-gray-400">{stat.label}</span>
                </div>
                <div className="text-2xl font-black text-white">
                  {stat.value}
                  <span className="text-sm font-normal text-wed-gray-400 ml-1">{stat.unit}</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Log a check-in */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Plus className="w-4 h-4 text-wed-lime" /> Log a Check-In
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={submitEntry} className="flex flex-col sm:flex-row gap-3">
              <input
                type="number"
                step="0.1"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder="Weight (kg)"
                className="flex-1 h-11 px-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-wed-gray-500 focus:border-wed-purple focus:outline-none"
              />
              <input
                type="number"
                step="0.1"
                value={bodyFat}
                onChange={(e) => setBodyFat(e.target.value)}
                placeholder="Body fat % (optional)"
                className="flex-1 h-11 px-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-wed-gray-500 focus:border-wed-purple focus:outline-none"
              />
              <button
                type="submit"
                className="h-11 px-6 rounded-xl bg-wed-purple text-white font-semibold hover:brightness-110 transition-all"
              >
                Log Entry
              </button>
            </form>
            {formError && <p className="text-xs text-red-400 mt-2">{formError}</p>}
          </CardContent>
        </Card>
      </motion.div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Weight className="w-4 h-4 text-wed-blue" /> Weight Trend
              </CardTitle>
            </CardHeader>
            <CardContent>
              {weightSeries.length >= 2 ? (
                <>
                  <TrendChart data={weightSeries} color="bg-wed-blue/50" />
                  <div className="flex justify-between text-xs text-wed-gray-500 mt-2">
                    <span>Start: {first?.weightKg}kg</span>
                    <span>Current: {current?.weightKg}kg</span>
                  </div>
                </>
              ) : (
                <p className="text-sm text-wed-gray-400 py-10 text-center">
                  Log at least two check-ins to see your weight trend.
                </p>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Activity className="w-4 h-4 text-wed-pink" /> Body Fat %
              </CardTitle>
            </CardHeader>
            <CardContent>
              {bodyFatSeries.length >= 2 ? (
                <>
                  <TrendChart data={bodyFatSeries} color="bg-wed-pink/50" />
                  <div className="flex justify-between text-xs text-wed-gray-500 mt-2">
                    <span>Start: {bodyFatSeries[0]}%</span>
                    <span>Current: {bodyFatSeries[bodyFatSeries.length - 1]}%</span>
                  </div>
                </>
              ) : (
                <p className="text-sm text-wed-gray-400 py-10 text-center">
                  Include body fat % in your check-ins to track it here.
                </p>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Entry history */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <LineChart className="w-4 h-4 text-wed-purple" /> Check-In History
            </CardTitle>
          </CardHeader>
          <CardContent>
            {allEntries.length === 0 ? (
              <p className="text-sm text-wed-gray-400 py-6 text-center">
                No check-ins yet. Log your first one above — future you will thank you.
              </p>
            ) : (
              <div className="space-y-2">
                {[...allEntries].reverse().map((entry) => (
                  <div key={entry.id} className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                    <div>
                      <p className="text-sm font-semibold text-white">
                        {entry.weightKg} kg
                        {entry.bodyFatPct != null && (
                          <span className="text-wed-gray-400 font-normal"> · {entry.bodyFatPct}% bf</span>
                        )}
                        {entry.id === 'baseline' && (
                          <span className="ml-2 text-[10px] uppercase tracking-wide text-wed-purple">assessment</span>
                        )}
                      </p>
                      <p className="text-xs text-wed-gray-500">{formatDate(entry.date)}</p>
                    </div>
                    {entry.id !== 'baseline' && (
                      <button
                        onClick={() => removeEntry(entry.id)}
                        className="p-2 rounded-lg text-wed-gray-500 hover:text-red-400 hover:bg-red-500/5 transition-all"
                        aria-label="Delete entry"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
