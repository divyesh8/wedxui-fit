'use client';

import { useState, useRef } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, ChevronLeft, Check } from 'lucide-react';

const steps = [
  {
    title: 'Basic Info',
    fields: [
      { name: 'age', label: 'Age', type: 'number', placeholder: '22', min: 10, max: 100 },
      { name: 'gender', label: 'Gender', type: 'select', options: ['Male', 'Female', 'Other'] },
      { name: 'height', label: 'Height (cm)', type: 'number', placeholder: '175', min: 100, max: 250 },
      { name: 'weight', label: 'Weight (kg)', type: 'number', placeholder: '70', min: 30, max: 300 },
    ],
  },
  {
    title: 'Fitness Profile',
    fields: [
      { name: 'goal', label: 'Primary Goal', type: 'select', options: ['Build Strength', 'Build Muscle', 'Lose Fat', 'Endurance', 'Calisthenics', 'General Fitness'] },
      { name: 'experience', label: 'Experience', type: 'select', options: ['Beginner (<6 months)', 'Intermediate (6mo-2yr)', 'Advanced (2+ years)'] },
    ],
  },
  {
    title: 'Schedule & Lifestyle',
    fields: [
      { name: 'days', label: 'Workout Days / Week', type: 'select', options: ['2', '3', '4', '5', '6', '7'] },
      { name: 'time', label: 'Session Time (min)', type: 'select', options: ['30', '45', '60', '90', '120'] },
      { name: 'sleep', label: 'Sleep (hours)', type: 'number', placeholder: '7', min: 3, max: 14 },
      { name: 'diet', label: 'Diet Preference', type: 'select', options: ['Balanced', 'High Protein', 'Keto', 'Vegan', 'Vegetarian'] },
    ],
  },
];

export function OnboardingModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  const openModal = () => { setIsOpen(true); setStep(0); };
  const closeModal = () => setIsOpen(false);
  const nextStep = () => setStep((s) => Math.min(s + 1, steps.length));
  const prevStep = () => setStep((s) => Math.max(s - 1, 0));

  const updateField = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const currentStep = steps[step];
  const progress = ((step + 1) / steps.length) * 100;

  return (
    <section id="onboarding" className="section-padding relative" ref={ref}>
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="glass p-8 md:p-12 rounded-3xl text-center"
        >
          <h2 className="text-3xl md:text-4xl font-black text-white mb-4">Forge Your Profile</h2>
          <p className="text-wed-gray-300 mb-8 max-w-lg mx-auto">
            Answer a few questions and our AI will generate a personalized training protocol designed specifically for your body, goals, and lifestyle.
          </p>
          <button
            onClick={openModal}
            className="px-8 py-4 rounded-full bg-gradient-purple text-white font-bold text-lg hover:brightness-110 transition-all btn-glow"
          >
            Start Assessment
          </button>
        </motion.div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={closeModal}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-strong p-6 md:p-8 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-bold text-white">{currentStep?.title}</h3>
                  <p className="text-xs text-wed-gray-400">Step {step + 1} of {steps.length}</p>
                </div>
                <button onClick={closeModal} className="p-2 rounded-lg hover:bg-white/10 text-wed-gray-400 hover:text-white transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Progress bar */}
              <div className="h-1 rounded-full bg-white/10 mb-6">
                <motion.div
                  className="h-full rounded-full bg-gradient-purple"
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>

              {/* Fields */}
              <div className="space-y-4 mb-8">
                {currentStep?.fields.map((field) => (
                  <div key={field.name}>
                    <label className="block text-sm font-medium text-wed-gray-200 mb-1.5">{field.label}</label>
                    {field.type === 'select' ? (
                      <select
                        value={formData[field.name] || ''}
                        onChange={(e) => updateField(field.name, e.target.value)}
                        className="w-full h-11 px-4 rounded-xl bg-white/5 border border-white/10 text-white focus:border-wed-purple focus:outline-none"
                      >
                        <option value="" disabled>Select...</option>
                        {field.options?.map((opt) => (
                          <option key={opt} value={opt.toLowerCase().replace(/\s+/g, '-')}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type={field.type}
                        value={formData[field.name] || ''}
                        onChange={(e) => updateField(field.name, e.target.value)}
                        min={field.min}
                        max={field.max}
                        placeholder={field.placeholder}
                        className="w-full h-11 px-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-wed-gray-500 focus:border-wed-purple focus:outline-none"
                      />
                    )}
                  </div>
                ))}
              </div>

              {/* Navigation */}
              <div className="flex justify-between">
                <button
                  onClick={prevStep}
                  disabled={step === 0}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/10 text-wed-gray-300 hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronLeft className="w-4 h-4" /> Back
                </button>
                {step < steps.length - 1 ? (
                  <button
                    onClick={nextStep}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-wed-purple text-white font-semibold hover:brightness-110 transition-all"
                  >
                    Next <ChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    onClick={() => { closeModal(); }}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-wed-lime text-wed-black font-bold hover:brightness-110 transition-all"
                  >
                    <Check className="w-4 h-4" /> Generate Plan
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
