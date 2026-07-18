'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Play, Pause, Clock, CheckCircle, Circle, ChevronRight, Dumbbell, Timer, SkipForward } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useWorkoutTimer } from '@/hooks/use-workout-timer';
import { useRestTimer } from '@/hooks/use-rest-timer';
import { useUIStore } from '@/store';
import type { WorkoutPlan } from '@/types';
import type { AiPlan } from '@/lib/ai/types';
import { renderAll } from '@/lib/ai/explain';
import { Brain } from 'lucide-react';
import { exercises as exerciseLibrary } from '@/data/exercises';

interface ExerciseLogDTO {
  id: string;
  exerciseId: string;
  completedAt: string | null;
}

interface SessionDTO {
  id: string;
  name: string;
  startedAt: string;
  activeSeconds: number;
  exercises: ExerciseLogDTO[];
}

interface HistoryEntry {
  id: string;
  name: string;
  completedAt: string;
  durationMin: number | null;
  exerciseCount: number;
  xpEarned: number;
}

async function postJson(url: string, method: string, body?: object) {
  const res = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  return { res, data };
}

export default function WorkoutsPage() {
  const addToast = useUIStore((s) => s.addToast);
  const [activeTab, setActiveTab] = useState<'today' | 'plans' | 'history'>('today');
  const [loading, setLoading] = useState(true);
  const [notOnboarded, setNotOnboarded] = useState(false);
  const [plan, setPlan] = useState<WorkoutPlan | null>(null);
  const [nextDayIndex, setNextDayIndex] = useState(0);
  const [session, setSession] = useState<SessionDTO | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [starting, setStarting] = useState(false);
  const [aiPlan, setAiPlan] = useState<AiPlan | null>(null);

  const loadToday = () => {
    fetch('/api/workouts/today')
      .then(async (res) => {
        if (res.status === 404) {
          setNotOnboarded(true);
          return;
        }
        const data = await res.json();
        setPlan(data.plan);
        setNextDayIndex(data.nextDayIndex);
        setSession(data.activeSession);
      })
      .finally(() => setLoading(false));
  };

  const loadHistory = () => {
    fetch('/api/workouts/history')
      .then((res) => res.json())
      .then((data) => setHistory(data.history ?? []))
      .catch(() => {});
  };

  useEffect(() => {
    loadToday();
    loadHistory();
    // Reasoning traces for the "Why?" expandables on the plan tab.
    fetch('/api/ai/plan')
      .then((r) => r.json())
      .then((d) => setAiPlan(d.aiPlan ?? null))
      .catch(() => {});
  }, []);

  const timer = useWorkoutTimer(session?.id ?? null, session?.activeSeconds ?? 0);

  const activeDay = useMemo(() => {
    if (!plan || !session) return null;
    return plan.days.find((d) => d.name === session.name) ?? null;
  }, [plan, session]);

  // Session logs are the source of truth — a plan regenerated mid-session must
  // not orphan the in-progress workout, so decorate logs from the plan day when
  // it still matches and fall back to the static library for names.
  const exerciseRows = useMemo(() => {
    if (!session) return [];
    return session.exercises.map((log) => {
      const dayEx = activeDay?.exercises.find((e) => e.id === log.exerciseId);
      const lib = exerciseLibrary.find((e) => e.id === log.exerciseId);
      return {
        id: log.exerciseId,
        name: dayEx?.name ?? lib?.name ?? log.exerciseId,
        sets: dayEx?.sets ?? 3,
        reps: dayEx?.reps ?? '8-12',
        rest: dayEx?.rest ?? '90s',
        logId: log.id,
        completed: Boolean(log.completedAt),
      };
    });
  }, [activeDay, session]);

  const restTimer = useRestTimer(() => {});

  const startSession = async () => {
    setStarting(true);
    const { res, data } = await postJson('/api/workouts/start', 'POST', { dayIndex: nextDayIndex });
    setStarting(false);
    if (res.ok) setSession(data.session);
    else addToast(data.error ?? 'Could not start workout.', 'error');
  };

  const completeExercise = async (logId: string, restSeconds: number) => {
    if (!session) return;
    timer.flush();
    const { res, data } = await postJson(`/api/workouts/${session.id}/exercises/${logId}/complete`, 'PATCH');
    if (!res.ok) {
      addToast(data.error ?? 'Could not update exercise.', 'error');
      return;
    }
    if (data.workoutCompleted) {
      addToast(`Workout complete! +${data.workoutLog.xpEarned} XP · ${data.profile.streakDays}-day streak`, 'success');
      for (const a of data.unlockedAchievements ?? []) {
        addToast(`Achievement unlocked: ${a.icon} ${a.name}`, 'success');
      }
      setSession(null);
      loadToday();
      loadHistory();
    } else {
      setSession((s) => (s ? { ...s, exercises: s.exercises.map((e) => (e.id === logId ? { ...e, completedAt: new Date().toISOString() } : e)) } : s));
      restTimer.start(restSeconds);
    }
  };

  if (loading) return <div className="text-center py-20 text-wed-gray-400">Loading…</div>;

  if (notOnboarded) {
    return (
      <div className="max-w-lg mx-auto text-center py-20 space-y-4">
        <h2 className="text-2xl font-bold text-white">No plan yet</h2>
        <p className="text-wed-gray-400">Complete your assessment to generate your training protocol.</p>
        <Link href="/onboarding" className="inline-block px-6 py-3 rounded-xl bg-wed-purple text-white font-semibold">
          Start Onboarding
        </Link>
      </div>
    );
  }

  const nextDay = plan?.days[nextDayIndex];
  const completedCount = exerciseRows.filter((e) => e.completed).length;
  const progress = exerciseRows.length > 0 ? (completedCount / exerciseRows.length) * 100 : 0;

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <h2 className="text-2xl font-bold text-white mb-1">Workouts</h2>
        <p className="text-wed-gray-400">Train with purpose. Every session is a step forward.</p>
      </motion.div>

      <div className="flex gap-2">
        {(['today', 'plans', 'history'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              activeTab === tab ? 'bg-wed-purple text-white' : 'bg-white/5 text-wed-gray-400 hover:bg-white/10'
            }`}
          >
            {tab === 'today' ? "Today's Workout" : tab === 'plans' ? 'My Plan' : 'History'}
          </button>
        ))}
      </div>

      {/* No AnimatePresence here — its mode="wait" exit transition wedges in this
          app (hidden-tab throttling never completes the exit), freezing tab switches. */}
      <div>
        {activeTab === 'today' && (
          <motion.div key="today" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <Card className="glow-purple">
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-bold text-white">{session ? session.name : nextDay?.name ?? 'Rest Day'}</h3>
                    <p className="text-sm text-wed-gray-400">
                      {session ? `${completedCount}/${exerciseRows.length} exercises` : `${nextDay?.exercises.length ?? 0} exercises planned`}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    {session && (
                      <div className="flex items-center gap-2 text-wed-purple font-mono text-lg">
                        <Timer className="w-4 h-4" /> {timer.formatted}
                        <button
                          onClick={() => (timer.isRunning ? timer.pause() : timer.resume())}
                          className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10"
                        >
                          {timer.isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                        </button>
                      </div>
                    )}
                    {!session && nextDay && (
                      <Button variant="glow" size="lg" className="gap-2" onClick={startSession} disabled={starting}>
                        <Play className="w-4 h-4" /> {starting ? 'Starting…' : 'Start Session'}
                      </Button>
                    )}
                  </div>
                </div>
                {session && (
                  <div className="mt-4 h-2 rounded-full bg-white/10 overflow-hidden">
                    <motion.div className="h-full rounded-full bg-gradient-purple" animate={{ width: `${progress}%` }} transition={{ duration: 0.5 }} />
                  </div>
                )}
              </CardContent>
            </Card>

            {restTimer.isRunning && (
              <Card className="border-wed-lime/30 bg-wed-lime/5">
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm text-wed-gray-300">Rest</p>
                    <p className="text-2xl font-mono font-bold text-wed-lime">{restTimer.formatted}</p>
                  </div>
                  <button onClick={restTimer.skip} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-sm text-white">
                    <SkipForward className="w-4 h-4" /> Skip Rest
                  </button>
                </CardContent>
              </Card>
            )}

            <div className="space-y-3">
              {(session ? exerciseRows : nextDay?.exercises.map((ex) => ({ ...ex, logId: '', completed: false })) ?? []).map((ex, i) => (
                <motion.div
                  key={ex.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => session && !ex.completed && completeExercise(ex.logId, parseInt(ex.rest) || 60)}
                  className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${session ? 'cursor-pointer' : ''} ${
                    ex.completed ? 'bg-wed-purple/10 border-wed-purple/30' : 'bg-white/5 border-white/5 hover:border-white/15'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                    ex.completed ? 'bg-wed-purple text-white' : 'bg-white/10 text-wed-gray-400'
                  }`}>
                    {ex.completed ? <CheckCircle className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
                  </div>
                  <div className="flex-1">
                    <p className={`font-semibold ${ex.completed ? 'text-wed-gray-400 line-through' : 'text-white'}`}>{ex.name}</p>
                    <p className="text-xs text-wed-gray-500">{ex.sets} × {ex.reps} • Rest {ex.rest}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-wed-gray-500" />
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {activeTab === 'plans' && plan && (
          <motion.div key="plans" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
            <Card className="glow-purple">
              <CardContent className="p-5">
                <h3 className="text-lg font-bold text-white">{plan.name}</h3>
                <p className="text-xs text-wed-gray-400">{plan.days.length} days / week • {plan.difficulty}</p>
                {aiPlan && (
                  <div className="mt-3 pt-3 border-t border-white/10">
                    <p className="text-xs font-semibold text-wed-purple mb-1.5 flex items-center gap-1"><Brain className="w-3.5 h-3.5" /> Why this program</p>
                    <ul className="space-y-1">
                      {renderAll(aiPlan.reasoning).map((l, i) => (
                        <li key={i} className="text-[11px] text-wed-gray-400 leading-relaxed">• {l}</li>
                      ))}
                    </ul>
                    <div className="mt-2 space-y-0.5">
                      {aiPlan.validations.map((v, i) => (
                        <p key={i} className={`text-[11px] ${v.startsWith('✓') ? 'text-wed-lime' : 'text-yellow-300'}`}>{v}</p>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
            {plan.days.map((day, dayIdx) => (
              <Card key={day.name}>
                <CardContent className="p-4">
                  <p className="font-semibold text-white mb-2">{day.name}</p>
                  {aiPlan?.days[dayIdx] ? (
                    <div className="space-y-2">
                      {aiPlan.days[dayIdx].exercises.map((ex) => (
                        <div key={ex.id} className="border-b border-white/5 pb-1.5 last:border-0 last:pb-0">
                          <div className="flex items-center justify-between">
                            <p className="text-xs text-wed-gray-200">{ex.name}</p>
                            <p className="text-[11px] text-wed-gray-500">{ex.sets} × {ex.reps} · {ex.rest}</p>
                          </div>
                          <details>
                            <summary className="text-[10px] text-wed-purple cursor-pointer select-none hover:brightness-125">Why?</summary>
                            <ul className="mt-1 space-y-0.5">
                              {renderAll(ex.reasoning).map((l, i) => (
                                <li key={i} className="text-[10px] text-wed-gray-400 leading-relaxed">• {l}</li>
                              ))}
                            </ul>
                          </details>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-wed-gray-400">{day.exercises.map((e) => e.name).join(' • ')}</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </motion.div>
        )}

        {activeTab === 'history' && (
          <motion.div key="history" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
            {history.length === 0 ? (
              <p className="text-sm text-wed-gray-400 py-8 text-center">No completed workouts yet — finish one to see it here.</p>
            ) : (
              history.map((workout, i) => (
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
                    <p className="text-xs text-wed-gray-400">{workout.exerciseCount} exercises • +{workout.xpEarned} XP</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-wed-gray-300 flex items-center gap-1"><Clock className="w-3 h-3" /> {workout.durationMin ?? '—'} min</p>
                    <p className="text-xs text-wed-gray-500">{new Date(workout.completedAt).toLocaleDateString()}</p>
                  </div>
                  <CheckCircle className="w-5 h-5 text-wed-lime" />
                </motion.div>
              ))
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
