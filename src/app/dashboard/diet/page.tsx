'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Apple, Flame, Beef, Wheat, Droplet, Clock, Pill, Leaf, Brain, Sparkles } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { renderAll } from '@/lib/ai/explain';
import { useExplainOptions } from '@/hooks/use-explain-options';
import type { AiNutritionPlan } from '@/lib/ai/types';

export default function DietPage() {
  const [loading, setLoading] = useState(true);
  const [plan, setPlan] = useState<AiNutritionPlan | null>(null);
  const explainOptions = useExplainOptions();

  useEffect(() => {
    fetch('/api/ai/plan')
      .then((r) => r.json())
      .then((d) => setPlan(d.aiNutritionPlan ?? null))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-center py-20 text-wed-gray-400">Loading your nutrition plan…</div>;

  if (!plan) {
    return (
      <div className="max-w-lg mx-auto text-center py-20 space-y-4">
        <Apple className="w-10 h-10 text-wed-purple mx-auto" />
        <h2 className="text-2xl font-bold text-white">No nutrition plan yet</h2>
        <p className="text-wed-gray-400">Complete the AI assessment and your personalized nutrition plan is generated alongside your training program.</p>
        <Link href="/onboarding" className="inline-block px-6 py-3 rounded-xl bg-wed-purple text-white font-semibold">
          Build My Plan
        </Link>
      </div>
    );
  }

  const t = plan.targets;
  // Macro calorie split for the visual bar (protein/carbs 4 kcal/g, fat 9).
  const pCal = t.proteinG * 4;
  const cCal = (t.carbsG ?? 0) * 4;
  const fCal = (t.fatG ?? 0) * 9;
  const totalMacroCal = Math.max(1, pCal + cCal + fCal);
  const pct = (v: number) => `${Math.round((v / totalMacroCal) * 100)}%`;

  const macros = [
    { label: 'Protein', grams: t.proteinG, icon: Beef, color: 'text-wed-purple', bar: 'bg-wed-purple', share: pct(pCal) },
    { label: 'Carbs', grams: t.carbsG ?? 0, icon: Wheat, color: 'text-wed-lime', bar: 'bg-wed-lime', share: pct(cCal) },
    { label: 'Fat', grams: t.fatG ?? 0, icon: Droplet, color: 'text-wed-orange', bar: 'bg-wed-orange', share: pct(fCal) },
  ];

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-bold text-white">Nutrition</h2>
          <span className="text-[11px] px-2 py-0.5 rounded-full bg-white/5 text-wed-gray-400 capitalize border border-white/10">{plan.budgetTier} budget · AI-inferred</span>
        </div>
        <p className="text-wed-gray-400">Built from what you actually eat — no exotic shopping list.</p>
      </motion.div>

      {/* Targets */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Daily Calories', value: `${t.calories.toLocaleString()} kcal`, icon: Flame, color: 'text-wed-purple', bg: 'bg-wed-purple/10' },
          { label: 'Protein', value: `${t.proteinG} g`, icon: Beef, color: 'text-wed-pink', bg: 'bg-wed-pink/10' },
          { label: 'Fiber', value: `${t.fiberG ?? '—'} g`, icon: Leaf, color: 'text-wed-lime', bg: 'bg-wed-lime/10' },
          { label: 'Water', value: `${(t.waterMl / 1000).toFixed(1)} L`, icon: Droplet, color: 'text-wed-blue', bg: 'bg-white/5' },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
            <Card className="card-hover">
              <CardContent className="p-5">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center`}>
                    <s.icon className={`w-5 h-5 ${s.color}`} />
                  </div>
                  <div>
                    <p className="text-xs text-wed-gray-400">{s.label}</p>
                    <p className="text-lg font-bold text-white">{s.value}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Macro split */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-base">Macro Split</CardTitle></CardHeader>
          <CardContent>
            <div className="flex h-3 rounded-full overflow-hidden mb-4">
              {macros.map((m) => <div key={m.label} className={m.bar} style={{ width: m.share }} />)}
            </div>
            <div className="grid grid-cols-3 gap-4">
              {macros.map((m) => (
                <div key={m.label} className="text-center">
                  <m.icon className={`w-4 h-4 mx-auto mb-1 ${m.color}`} />
                  <p className="text-lg font-bold text-white">{m.grams}g</p>
                  <p className="text-xs text-wed-gray-400">{m.label} · {m.share}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Meals */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <h3 className="text-sm font-bold text-wed-gray-200 mb-3 uppercase tracking-wide">Daily Meals</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          {plan.meals.map((m) => (
            <Card key={m.name}>
              <CardContent className="p-5">
                <div className="flex items-center gap-2 mb-2">
                  <Apple className="w-4 h-4 text-wed-purple" />
                  <p className="font-bold text-white">{m.name}</p>
                </div>
                <p className="text-sm text-wed-gray-400 leading-relaxed">{m.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </motion.div>

      {/* Timing + supplements + micros */}
      <div className="grid lg:grid-cols-3 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card className="h-full">
            <CardHeader className="pb-3"><CardTitle className="text-base flex items-center gap-2"><Clock className="w-4 h-4 text-wed-blue" /> Meal Timing</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {plan.timing.map((line, i) => <p key={i} className="text-xs text-wed-gray-300 leading-relaxed">• {line}</p>)}
            </CardContent>
          </Card>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}>
          <Card className="h-full">
            <CardHeader className="pb-3"><CardTitle className="text-base flex items-center gap-2"><Pill className="w-4 h-4 text-wed-lime" /> Supplements</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {plan.supplements.map((line, i) => <p key={i} className="text-xs text-wed-gray-300 leading-relaxed">• {line}</p>)}
            </CardContent>
          </Card>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <Card className="h-full">
            <CardHeader className="pb-3"><CardTitle className="text-base flex items-center gap-2"><Leaf className="w-4 h-4 text-wed-orange" /> Micronutrients</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {plan.micronutrients.map((line, i) => <p key={i} className="text-xs text-wed-gray-300 leading-relaxed">• {line}</p>)}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Reasoning */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }}>
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-base flex items-center gap-2"><Brain className="w-4 h-4 text-wed-purple" /> How this plan was built</CardTitle></CardHeader>
          <CardContent>
            <ul className="space-y-1.5">
              {renderAll(plan.reasoning, explainOptions).map((line, i) => (
                <li key={i} className="text-xs text-wed-gray-400 leading-relaxed flex gap-2">
                  <Sparkles className="w-3 h-3 text-wed-purple flex-shrink-0 mt-0.5" /> {line}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
