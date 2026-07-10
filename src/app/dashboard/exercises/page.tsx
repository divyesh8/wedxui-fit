'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Info, X, AlertTriangle, Lightbulb, Sparkles } from 'lucide-react';
import { exercises, exerciseCategories, difficultyLabels } from '@/data/exercises';
import { Exercise } from '@/types';
import { isExerciseAvailable } from '@/lib/plan-generator';
import { useProfileStore } from '@/store/profile';

// Training-style groupings by required equipment.
const styleFilters = [
  { value: 'all', label: 'All Styles' },
  { value: 'gym', label: 'Gym' },
  { value: 'home', label: 'Home' },
  { value: 'calisthenics', label: 'Calisthenics' },
];

function matchesStyle(ex: Exercise, style: string): boolean {
  switch (style) {
    case 'gym':
      return ex.equipment.some((e) => ['FULL_GYM', 'BARBELL', 'CABLE_MACHINE'].includes(e));
    case 'home':
      return ex.equipment.some((e) => ['NONE', 'DUMBBELLS', 'RESISTANCE_BANDS', 'KETTLEBELL', 'PULLUP_BAR'].includes(e));
    case 'calisthenics':
      return ex.equipment.includes('NONE') || ex.equipment.includes('PULLUP_BAR');
    default:
      return true;
  }
}

export default function ExercisesPage() {
  const { profile, onboardedAt } = useProfileStore();
  const [filter, setFilter] = useState('all');
  const [style, setStyle] = useState('all');
  const [forYou, setForYou] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const hasProfile = mounted && !!onboardedAt && !!profile;

  const filtered = exercises.filter((ex) => {
    const matchesFilter = filter === 'all' || ex.primaryMuscles.some((m) => m.toLowerCase() === filter);
    const matchesSearch = ex.name.toLowerCase().includes(search.toLowerCase());
    const matchesPreference =
      !hasProfile || !forYou || !profile || isExerciseAvailable(ex, profile.equipment as string[], profile.goal);
    return matchesFilter && matchesStyle(ex, style) && matchesSearch && matchesPreference;
  });

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <h2 className="text-2xl font-bold text-white mb-1">Exercise Library</h2>
        <p className="text-wed-gray-400">Master every technique. Knowledge is power.</p>
      </motion.div>

      {/* Search & Filter */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-wed-gray-500" />
          <input
            type="text"
            placeholder="Search exercises..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-11 pl-10 pr-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-wed-gray-500 focus:border-wed-purple focus:outline-none focus:ring-1 focus:ring-wed-purple/50"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {exerciseCategories.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setFilter(cat.value)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                filter === cat.value ? 'bg-wed-purple text-white' : 'bg-white/5 text-wed-gray-300 hover:bg-white/10 border border-white/10'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Training style + personal preference */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="flex flex-wrap items-center gap-2">
        {styleFilters.map((s) => (
          <button
            key={s.value}
            onClick={() => setStyle(s.value)}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
              style === s.value ? 'bg-wed-blue text-wed-black' : 'bg-white/5 text-wed-gray-300 hover:bg-white/10 border border-white/10'
            }`}
          >
            {s.label}
          </button>
        ))}
        {hasProfile && (
          <button
            onClick={() => setForYou((v) => !v)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
              forYou
                ? 'bg-wed-lime/20 text-wed-lime border border-wed-lime/40'
                : 'bg-white/5 text-wed-gray-300 hover:bg-white/10 border border-white/10'
            }`}
            title="Only exercises that match your equipment and goal"
          >
            <Sparkles className="w-3.5 h-3.5" /> For You
          </button>
        )}
      </motion.div>

      {filtered.length === 0 && (
        <p className="text-sm text-wed-gray-400 py-10 text-center">
          Nothing matches these filters — try turning off &quot;For You&quot; or picking another style.
        </p>
      )}

      {/* Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((ex, i) => (
          <motion.div
            key={ex.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}
            onClick={() => setSelectedExercise(ex)}
            className="glass p-5 rounded-2xl cursor-pointer card-hover group"
          >
            <div className="flex items-start justify-between mb-3">
              <h3 className="text-lg font-bold text-white group-hover:text-wed-purple transition-colors">{ex.name}</h3>
              <Info className="w-4 h-4 text-wed-gray-500 group-hover:text-wed-purple transition-colors" />
            </div>
            <p className="text-sm text-wed-gray-400 mb-3 line-clamp-2">{ex.description}</p>
            <div className="flex flex-wrap gap-2">
              <span className="px-2 py-0.5 rounded-full text-xs bg-wed-purple/10 text-wed-purple">{difficultyLabels[ex.difficulty]}</span>
              {ex.primaryMuscles.map((m) => (
                <span key={m} className="px-2 py-0.5 rounded-full text-xs bg-white/5 text-wed-gray-400 border border-white/10">{m}</span>
              ))}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedExercise && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => setSelectedExercise(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-strong p-6 md:p-8 rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-2xl font-bold text-white">{selectedExercise.name}</h3>
                  <div className="flex gap-2 mt-2">
                    <span className="px-2 py-0.5 rounded-full text-xs bg-wed-purple/10 text-wed-purple">{difficultyLabels[selectedExercise.difficulty]}</span>
                    {selectedExercise.primaryMuscles.map((m) => (
                      <span key={m} className="px-2 py-0.5 rounded-full text-xs bg-wed-blue/10 text-wed-blue">{m}</span>
                    ))}
                  </div>
                </div>
                <button onClick={() => setSelectedExercise(null)} className="p-2 rounded-lg hover:bg-white/10 text-wed-gray-400 hover:text-white transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <p className="text-wed-gray-300 mb-6">{selectedExercise.description}</p>

              <div className="mb-6">
                <h4 className="text-sm font-semibold text-wed-gray-200 mb-3 uppercase tracking-wide">Instructions</h4>
                <ol className="space-y-2">
                  {selectedExercise.instructions.map((step, i) => (
                    <li key={i} className="flex gap-3 text-sm text-wed-gray-300">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-wed-purple/20 text-wed-purple text-xs font-bold flex items-center justify-center">{i + 1}</span>
                      {step}
                    </li>
                  ))}
                </ol>
              </div>

              <div className="grid sm:grid-cols-2 gap-4 mb-6">
                <div className="glass p-4 rounded-xl">
                  <h4 className="text-sm font-semibold text-wed-lime mb-2 flex items-center gap-2"><Lightbulb className="w-4 h-4" /> Tips</h4>
                  <ul className="space-y-1">
                    {selectedExercise.tips.map((tip, i) => (
                      <li key={i} className="text-xs text-wed-gray-300">• {tip}</li>
                    ))}
                  </ul>
                </div>
                <div className="glass p-4 rounded-xl">
                  <h4 className="text-sm font-semibold text-red-400 mb-2 flex items-center gap-2"><AlertTriangle className="w-4 h-4" /> Common Mistakes</h4>
                  <ul className="space-y-1">
                    {selectedExercise.commonMistakes.map((m, i) => (
                      <li key={i} className="text-xs text-wed-gray-300">• {m}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {selectedExercise.alternatives.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-wed-gray-200 mb-2">Alternatives</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedExercise.alternatives.map((alt) => (
                      <span key={alt} className="px-3 py-1.5 rounded-lg bg-white/5 text-sm text-wed-gray-300 border border-white/10">{alt.replace(/-/g, ' ')}</span>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
