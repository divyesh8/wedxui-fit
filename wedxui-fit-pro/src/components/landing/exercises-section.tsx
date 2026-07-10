'use client';

import { useState, useRef } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { Search, Filter, Info, X } from 'lucide-react';
import { exercises, exerciseCategories, difficultyLabels, equipmentLabels } from '@/data/exercises';

export function ExercisesSection() {
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [selectedExercise, setSelectedExercise] = useState<string | null>(null);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  const filtered = exercises.filter((ex) => {
    const matchesFilter = filter === 'all' || ex.primaryMuscles.some((m) => m.toLowerCase() === filter);
    const matchesSearch = ex.name.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const selected = exercises.find((e) => e.id === selectedExercise);

  return (
    <section id="exercises" className="section-padding relative" ref={ref}>
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-wed-lime/10 text-wed-lime mb-4">
            Movements
          </span>
          <h2 className="text-4xl md:text-5xl font-black text-white mb-4">EXERCISES</h2>
          <p className="text-wed-gray-300 max-w-xl mx-auto">Master every technique. Knowledge is power.</p>
        </motion.div>

        {/* Search & Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex flex-col sm:flex-row gap-4 mb-8"
        >
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-wed-gray-400" />
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
                  filter === cat.value
                    ? 'bg-wed-purple text-white'
                    : 'bg-white/5 text-wed-gray-300 hover:bg-white/10 border border-white/10'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Exercise Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((ex, i) => (
            <motion.div
              key={ex.id}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4, delay: i * 0.05 }}
              onClick={() => setSelectedExercise(ex.id)}
              className="glass p-5 rounded-2xl cursor-pointer card-hover group"
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-lg font-bold text-white group-hover:text-wed-purple transition-colors">
                  {ex.name}
                </h3>
                <Info className="w-4 h-4 text-wed-gray-500 group-hover:text-wed-purple transition-colors" />
              </div>
              <p className="text-sm text-wed-gray-400 mb-3 line-clamp-2">{ex.description}</p>
              <div className="flex flex-wrap gap-2">
                <span className="px-2 py-0.5 rounded-full text-xs bg-wed-purple/10 text-wed-purple">
                  {difficultyLabels[ex.difficulty]}
                </span>
                {ex.equipment.slice(0, 2).map((eq) => (
                  <span key={eq} className="px-2 py-0.5 rounded-full text-xs bg-white/5 text-wed-gray-400 border border-white/10">
                    {equipmentLabels[eq] || eq}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Detail Modal */}
        <AnimatePresence>
          {selected && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
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
                    <h3 className="text-2xl font-bold text-white">{selected.name}</h3>
                    <div className="flex gap-2 mt-2">
                      <span className="px-2 py-0.5 rounded-full text-xs bg-wed-purple/10 text-wed-purple">
                        {difficultyLabels[selected.difficulty]}
                      </span>
                      {selected.primaryMuscles.map((m) => (
                        <span key={m} className="px-2 py-0.5 rounded-full text-xs bg-wed-blue/10 text-wed-blue">
                          {m}
                        </span>
                      ))}
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedExercise(null)}
                    className="p-2 rounded-lg hover:bg-white/10 text-wed-gray-400 hover:text-white transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <p className="text-wed-gray-300 mb-6">{selected.description}</p>

                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-wed-gray-200 mb-3 uppercase tracking-wide">Instructions</h4>
                  <ol className="space-y-2">
                    {selected.instructions.map((step, i) => (
                      <li key={i} className="flex gap-3 text-sm text-wed-gray-300">
                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-wed-purple/20 text-wed-purple text-xs font-bold flex items-center justify-center">
                          {i + 1}
                        </span>
                        {step}
                      </li>
                    ))}
                  </ol>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="glass p-4 rounded-xl">
                    <h4 className="text-sm font-semibold text-wed-lime mb-2">Tips</h4>
                    <ul className="space-y-1">
                      {selected.tips.map((tip, i) => (
                        <li key={i} className="text-xs text-wed-gray-300">• {tip}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="glass p-4 rounded-xl">
                    <h4 className="text-sm font-semibold text-red-400 mb-2">Common Mistakes</h4>
                    <ul className="space-y-1">
                      {selected.commonMistakes.map((m, i) => (
                        <li key={i} className="text-xs text-wed-gray-300">• {m}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
