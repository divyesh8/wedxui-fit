'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Settings, Bell, Moon, Globe, Ruler, Weight, Calendar, Edit3, Save, Camera, Shield,
  Flame, Activity, Clock, Trophy, Zap,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { GOALS, EXPERIENCE_LEVELS } from '@/lib/validations/onboarding';
import { calculateXPForLevel, getRankFromLevel } from '@/lib/utils';

interface ProfileData {
  age: number | null;
  gender: string | null;
  heightCm: number | null;
  weightKg: number | null;
  bodyFatPct: number | null;
  goal: string | null;
  experience: string | null;
  daysPerWeek: number | null;
  sessionMinutes: number | null;
  xp: number;
  level: number;
  streakDays: number;
  bestStreak: number;
  totalWorkouts: number;
  totalMinutes: number;
}

interface FetchState {
  loading: boolean;
  name: string;
  email: string;
  profile: ProfileData | null;
  achievementsCount: number;
}

const GOAL_LABEL = Object.fromEntries(GOALS.map((g) => [g.value, g.label]));
const EXPERIENCE_LABEL = Object.fromEntries(EXPERIENCE_LEVELS.map((e) => [e.value, e.label]));

export default function ProfilePage() {
  const [state, setState] = useState<FetchState>({ loading: true, name: '', email: '', profile: null, achievementsCount: 0 });
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', age: '', heightCm: '', weightKg: '', bodyFatPct: '' });

  const load = () => {
    fetch('/api/profile')
      .then((res) => res.json())
      .then((data) => {
        setState({ loading: false, name: data.user?.name ?? '', email: data.user?.email ?? '', profile: data.profile, achievementsCount: data.achievementsCount ?? 0 });
        setForm({
          name: data.user?.name ?? '',
          age: data.profile?.age?.toString() ?? '',
          heightCm: data.profile?.heightCm?.toString() ?? '',
          weightKg: data.profile?.weightKg?.toString() ?? '',
          bodyFatPct: data.profile?.bodyFatPct?.toString() ?? '',
        });
      })
      .catch(() => setState((s) => ({ ...s, loading: false })));
  };

  useEffect(load, []);

  const handleChange = (field: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    const body: Record<string, unknown> = { name: form.name };
    if (form.age) body.age = Number(form.age);
    if (form.heightCm) body.heightCm = Number(form.heightCm);
    if (form.weightKg) body.weightKg = Number(form.weightKg);
    body.bodyFatPct = form.bodyFatPct ? Number(form.bodyFatPct) : null;

    const res = await fetch('/api/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    setSaving(false);
    if (!res.ok) {
      setError(data.error ?? 'Could not save changes.');
      return;
    }
    setState((s) => ({ ...s, name: data.user?.name ?? s.name, profile: data.profile }));
    setIsEditing(false);
  };

  if (state.loading) {
    return <div className="text-center py-20 text-wed-gray-400">Loading profile…</div>;
  }

  const p = state.profile;

  if (!p) {
    return (
      <div className="max-w-lg mx-auto text-center py-20 space-y-4">
        <h2 className="text-2xl font-bold text-white">No profile yet</h2>
        <p className="text-wed-gray-400">Complete your assessment to forge your character sheet.</p>
        <Link href="/onboarding" className="inline-block px-6 py-3 rounded-xl bg-wed-purple text-white font-semibold">
          Start Onboarding
        </Link>
      </div>
    );
  }

  const level = p.level;
  const rank = getRankFromLevel(level);
  const xpForNext = calculateXPForLevel(level);

  const stats = [
    { label: 'Workouts', value: p.totalWorkouts.toLocaleString(), icon: Calendar },
    { label: 'Minutes', value: p.totalMinutes.toLocaleString(), icon: Clock },
    { label: 'Achievements', value: state.achievementsCount.toLocaleString(), icon: Trophy },
    { label: 'XP', value: p.xp.toLocaleString(), icon: Zap },
  ];

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-white mb-1">Profile</h2>
            <p className="text-wed-gray-400">Your character sheet. Keep it updated.</p>
          </div>
          <Button
            variant={isEditing ? 'glow' : 'outline'}
            size="sm"
            onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
            disabled={saving}
            className="gap-2"
          >
            {isEditing ? <><Save className="w-4 h-4" /> {saving ? 'Saving…' : 'Save'}</> : <><Edit3 className="w-4 h-4" /> Edit Profile</>}
          </Button>
        </div>
        {error && <p className="mt-3 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">{error}</p>}
      </motion.div>

      {/* Profile Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Card className="glow-purple">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-wed-purple to-wed-blue flex items-center justify-center text-4xl">
                  🥷
                </div>
                <button className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-wed-surface border border-white/10 flex items-center justify-center text-wed-gray-400 hover:text-white transition-colors">
                  <Camera className="w-4 h-4" />
                </button>
              </div>
              <div className="text-center sm:text-left flex-1">
                {isEditing ? (
                  <input
                    value={form.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    className="w-full max-w-xs h-9 px-3 rounded-lg bg-white/5 border border-white/10 text-white text-lg font-bold focus:border-wed-purple focus:outline-none"
                  />
                ) : (
                  <h3 className="text-2xl font-bold text-white">{state.name || 'Warrior'}</h3>
                )}
                <p className="text-wed-purple font-semibold">{rank.icon} {rank.name} • Level {level}</p>
                <p className="text-sm text-wed-gray-400 mt-1">{state.email}</p>
                <div className="flex flex-wrap gap-2 mt-3 justify-center sm:justify-start">
                  {p.goal && <span className="px-2 py-1 rounded-full text-xs bg-wed-purple/10 text-wed-purple border border-wed-purple/20">{GOAL_LABEL[p.goal] ?? p.goal}</span>}
                  {p.experience && <span className="px-2 py-1 rounded-full text-xs bg-wed-blue/10 text-wed-blue border border-wed-blue/20">{EXPERIENCE_LABEL[p.experience] ?? p.experience}</span>}
                  {p.daysPerWeek && <span className="px-2 py-1 rounded-full text-xs bg-wed-lime/10 text-wed-lime border border-wed-lime/20">{p.daysPerWeek} days/week</span>}
                </div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-black text-white">{p.streakDays}</div>
                <div className="text-xs text-wed-gray-400">day streak</div>
                {p.streakDays > 0 && (
                  <div className="flex items-center gap-1 mt-1 justify-center">
                    <Flame className="w-4 h-4 text-wed-orange" />
                    <span className="text-xs text-wed-orange">On Fire</span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + i * 0.1 }}>
            <Card>
              <CardContent className="p-4 text-center">
                <stat.icon className="w-5 h-5 text-wed-purple mx-auto mb-2" />
                <div className="text-2xl font-black text-white">{stat.value}</div>
                <div className="text-xs text-wed-gray-400">{stat.label}</div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        {/* Physical Stats */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Ruler className="w-4 h-4 text-wed-blue" /> Physical Stats
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { label: 'Age', field: 'age' as const, unit: 'years', icon: Calendar, value: p.age },
                { label: 'Height', field: 'heightCm' as const, unit: 'cm', icon: Ruler, value: p.heightCm },
                { label: 'Weight', field: 'weightKg' as const, unit: 'kg', icon: Weight, value: p.weightKg },
                { label: 'Body Fat', field: 'bodyFatPct' as const, unit: '%', icon: Activity, value: p.bodyFatPct },
              ].map((item) => (
                <div key={item.field} className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-wed-blue/10 flex items-center justify-center">
                    <item.icon className="w-5 h-5 text-wed-blue" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-wed-gray-400">{item.label}</p>
                    {isEditing ? (
                      <input
                        type="number"
                        value={form[item.field]}
                        onChange={(e) => handleChange(item.field, e.target.value)}
                        className="w-full h-8 px-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:border-wed-purple focus:outline-none"
                      />
                    ) : (
                      <p className="text-lg font-bold text-white">
                        {item.value ?? '—'} <span className="text-sm font-normal text-wed-gray-400">{item.value != null ? item.unit : ''}</span>
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        {/* Settings (visual only — not wired to UserSettings in this pass) */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Settings className="w-4 h-4 text-wed-purple" /> Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { label: 'Notifications', desc: 'Workout reminders & achievements', icon: Bell, enabled: true },
                { label: 'Dark Mode', desc: 'Always on for WEDXUI Fit', icon: Moon, enabled: true },
                { label: 'Unit System', desc: 'Metric (kg, cm)', icon: Ruler, enabled: true },
                { label: 'Language', desc: 'English', icon: Globe, enabled: true },
                { label: 'Privacy', desc: 'Public profile', icon: Shield, enabled: false },
              ].map((setting) => (
                <div key={setting.label} className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                      <setting.icon className="w-4 h-4 text-wed-gray-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{setting.label}</p>
                      <p className="text-xs text-wed-gray-400">{setting.desc}</p>
                    </div>
                  </div>
                  <button
                    className={`w-10 h-5 rounded-full transition-all relative ${
                      setting.enabled ? 'bg-wed-purple' : 'bg-white/10'
                    }`}
                  >
                    <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${
                      setting.enabled ? 'left-5' : 'left-0.5'
                    }`} />
                  </button>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Level Progress */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-white">Level Progress</h3>
                <p className="text-sm text-wed-gray-400">{p.xp.toLocaleString()} / {xpForNext.toLocaleString()} XP to Level {level + 1}</p>
              </div>
              <span className="px-3 py-1 rounded-full bg-wed-purple/20 text-wed-purple text-sm font-bold">{rank.name}</span>
            </div>
            <Progress value={p.xp} max={xpForNext} variant="xp" />
            <div className="flex justify-between mt-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{p.totalWorkouts}</div>
                <div className="text-xs text-wed-gray-400">Workouts</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{state.achievementsCount}</div>
                <div className="text-xs text-wed-gray-400">Achievements</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{level}</div>
                <div className="text-xs text-wed-gray-400">Current Level</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{p.totalMinutes}</div>
                <div className="text-xs text-wed-gray-400">Minutes</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
