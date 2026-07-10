'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Calculator, RotateCcw, Play, Pause, Timer } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { calculateBMI, getBMICategory, calculateBMR, calculateTDEE, calculateOneRepMax, calculateBodyFatMale, calculateBodyFatFemale } from '@/lib/utils';

export default function ToolsPage() {
  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <h2 className="text-2xl font-bold text-white mb-1">Fitness Tools</h2>
        <p className="text-wed-gray-400">Track every metric. Optimize every variable.</p>
      </motion.div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <BMICalculator />
        <CalorieCalculator />
        <ProteinCalculator />
        <WaterCalculator />
        <BodyFatCalculator />
        <OneRMCalculator />
        <MacroCalculator />
        <TimerCard />
      </div>
    </div>
  );
}

function BMICalculator() {
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const bmi = height && weight ? calculateBMI(Number(weight), Number(height)) : null;
  return (
    <Card>
      <CardHeader className="pb-3"><CardTitle className="text-base flex items-center gap-2"><Calculator className="w-4 h-4 text-wed-blue" />BMI Calculator</CardTitle></CardHeader>
      <CardContent className="space-y-3">
        <input type="number" value={height} onChange={(e) => setHeight(e.target.value)} className="w-full h-9 px-3 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:border-wed-purple focus:outline-none" placeholder="Height (cm)" />
        <input type="number" value={weight} onChange={(e) => setWeight(e.target.value)} className="w-full h-9 px-3 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:border-wed-purple focus:outline-none" placeholder="Weight (kg)" />
        {bmi && <div className="pt-2 border-t border-white/10"><div className="text-2xl font-bold text-wed-purple">{bmi.toFixed(1)}</div><div className="text-xs text-wed-gray-400">{getBMICategory(bmi)}</div></div>}
      </CardContent>
    </Card>
  );
}

function CalorieCalculator() {
  const [age, setAge] = useState('');
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [gender, setGender] = useState<'MALE' | 'FEMALE'>('MALE');
  const [activity, setActivity] = useState('1.55');
  const [goal, setGoal] = useState('maintain');
  const bmr = age && weight && height ? calculateBMR(Number(weight), Number(height), Number(age), gender) : null;
  const tdee = bmr ? calculateTDEE(bmr, Number(activity)) : null;
  const target = tdee ? (goal === 'lose' ? tdee - 500 : goal === 'gain' ? tdee + 300 : tdee) : null;
  return (
    <Card>
      <CardHeader className="pb-3"><CardTitle className="text-base flex items-center gap-2"><Calculator className="w-4 h-4 text-wed-lime" />Calorie Calculator</CardTitle></CardHeader>
      <CardContent className="space-y-2">
        <div className="grid grid-cols-2 gap-2">
          <input type="number" value={age} onChange={(e) => setAge(e.target.value)} className="h-8 px-2 rounded-lg bg-white/5 border border-white/10 text-white text-xs focus:border-wed-purple focus:outline-none" placeholder="Age" />
          <input type="number" value={weight} onChange={(e) => setWeight(e.target.value)} className="h-8 px-2 rounded-lg bg-white/5 border border-white/10 text-white text-xs focus:border-wed-purple focus:outline-none" placeholder="Weight" />
          <input type="number" value={height} onChange={(e) => setHeight(e.target.value)} className="h-8 px-2 rounded-lg bg-white/5 border border-white/10 text-white text-xs focus:border-wed-purple focus:outline-none" placeholder="Height" />
          <select value={gender} onChange={(e) => setGender(e.target.value as 'MALE' | 'FEMALE')} className="h-8 px-2 rounded-lg bg-white/5 border border-white/10 text-white text-xs focus:border-wed-purple focus:outline-none"><option value="MALE">Male</option><option value="FEMALE">Female</option></select>
        </div>
        <select value={activity} onChange={(e) => setActivity(e.target.value)} className="w-full h-8 px-2 rounded-lg bg-white/5 border border-white/10 text-white text-xs focus:border-wed-purple focus:outline-none">
          <option value="1.2">Sedentary</option><option value="1.375">Light</option><option value="1.55">Moderate</option><option value="1.725">Active</option><option value="1.9">Very Active</option>
        </select>
        <select value={goal} onChange={(e) => setGoal(e.target.value)} className="w-full h-8 px-2 rounded-lg bg-white/5 border border-white/10 text-white text-xs focus:border-wed-purple focus:outline-none">
          <option value="maintain">Maintain</option><option value="lose">Lose Fat</option><option value="gain">Build Muscle</option>
        </select>
        {target && <div className="pt-2 border-t border-white/10"><div className="text-xl font-bold text-wed-blue">{Math.round(target)} kcal</div><div className="text-xs text-wed-gray-400">daily target</div></div>}
      </CardContent>
    </Card>
  );
}

function ProteinCalculator() {
  const [weight, setWeight] = useState('');
  const [goal, setGoal] = useState('maintain');
  const multiplier = goal === 'muscle' ? 2.2 : goal === 'fatloss' ? 2.0 : 1.6;
  const protein = weight ? Number(weight) * multiplier : null;
  return (
    <Card>
      <CardHeader className="pb-3"><CardTitle className="text-base flex items-center gap-2"><Calculator className="w-4 h-4 text-wed-pink" />Protein Calculator</CardTitle></CardHeader>
      <CardContent className="space-y-3">
        <input type="number" value={weight} onChange={(e) => setWeight(e.target.value)} className="w-full h-9 px-3 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:border-wed-purple focus:outline-none" placeholder="Weight (kg)" />
        <select value={goal} onChange={(e) => setGoal(e.target.value)} className="w-full h-9 px-3 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:border-wed-purple focus:outline-none">
          <option value="maintain">Maintain</option><option value="muscle">Build Muscle</option><option value="fatloss">Lose Fat</option>
        </select>
        {protein && <div className="pt-2 border-t border-white/10"><div className="text-2xl font-bold text-wed-lime">{Math.round(protein)}g</div><div className="text-xs text-wed-gray-400">protein per day</div></div>}
      </CardContent>
    </Card>
  );
}

function WaterCalculator() {
  const [weight, setWeight] = useState('');
  const [activity, setActivity] = useState('moderate');
  const base = weight ? Number(weight) * 0.033 : null;
  const multiplier = activity === 'high' ? 1.3 : activity === 'moderate' ? 1.1 : 1.0;
  const water = base ? base * multiplier : null;
  return (
    <Card>
      <CardHeader className="pb-3"><CardTitle className="text-base flex items-center gap-2"><Calculator className="w-4 h-4 text-cyan-400" />Water Intake</CardTitle></CardHeader>
      <CardContent className="space-y-3">
        <input type="number" value={weight} onChange={(e) => setWeight(e.target.value)} className="w-full h-9 px-3 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:border-wed-purple focus:outline-none" placeholder="Weight (kg)" />
        <select value={activity} onChange={(e) => setActivity(e.target.value)} className="w-full h-9 px-3 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:border-wed-purple focus:outline-none">
          <option value="low">Low Activity</option><option value="moderate">Moderate</option><option value="high">High Activity</option>
        </select>
        {water && <div className="pt-2 border-t border-white/10"><div className="text-2xl font-bold text-cyan-400">{water.toFixed(1)}L</div><div className="text-xs text-wed-gray-400">water per day</div></div>}
      </CardContent>
    </Card>
  );
}

function BodyFatCalculator() {
  const [waist, setWaist] = useState('');
  const [neck, setNeck] = useState('');
  const [height, setHeight] = useState('');
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const bf = waist && neck && height ? (gender === 'male' ? calculateBodyFatMale(Number(waist), Number(neck), Number(height)) : calculateBodyFatFemale(Number(waist), Number(neck), Number(height), Number(waist) * 1.1)) : null;
  return (
    <Card>
      <CardHeader className="pb-3"><CardTitle className="text-base flex items-center gap-2"><Calculator className="w-4 h-4 text-wed-orange" />Body Fat %</CardTitle></CardHeader>
      <CardContent className="space-y-2">
        <div className="grid grid-cols-2 gap-2">
          <input type="number" value={waist} onChange={(e) => setWaist(e.target.value)} className="h-8 px-2 rounded-lg bg-white/5 border border-white/10 text-white text-xs focus:border-wed-purple focus:outline-none" placeholder="Waist (cm)" />
          <input type="number" value={neck} onChange={(e) => setNeck(e.target.value)} className="h-8 px-2 rounded-lg bg-white/5 border border-white/10 text-white text-xs focus:border-wed-purple focus:outline-none" placeholder="Neck (cm)" />
          <input type="number" value={height} onChange={(e) => setHeight(e.target.value)} className="h-8 px-2 rounded-lg bg-white/5 border border-white/10 text-white text-xs focus:border-wed-purple focus:outline-none" placeholder="Height (cm)" />
          <select value={gender} onChange={(e) => setGender(e.target.value as 'male' | 'female')} className="h-8 px-2 rounded-lg bg-white/5 border border-white/10 text-white text-xs focus:border-wed-purple focus:outline-none"><option value="male">Male</option><option value="female">Female</option></select>
        </div>
        {bf && <div className="pt-2 border-t border-white/10"><div className="text-xl font-bold text-wed-pink">{bf.toFixed(1)}%</div></div>}
      </CardContent>
    </Card>
  );
}

function OneRMCalculator() {
  const [weight, setWeight] = useState('');
  const [reps, setReps] = useState('');
  const rm = weight && reps ? calculateOneRepMax(Number(weight), Number(reps)) : null;
  return (
    <Card>
      <CardHeader className="pb-3"><CardTitle className="text-base flex items-center gap-2"><Calculator className="w-4 h-4 text-wed-purple" />One Rep Max</CardTitle></CardHeader>
      <CardContent className="space-y-3">
        <input type="number" value={weight} onChange={(e) => setWeight(e.target.value)} className="w-full h-9 px-3 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:border-wed-purple focus:outline-none" placeholder="Weight lifted (kg)" />
        <input type="number" value={reps} onChange={(e) => setReps(e.target.value)} className="w-full h-9 px-3 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:border-wed-purple focus:outline-none" placeholder="Reps performed" />
        {rm && <div className="pt-2 border-t border-white/10"><div className="text-2xl font-bold text-wed-purple">{rm.toFixed(1)} kg</div><div className="text-xs text-wed-gray-400">estimated 1RM</div></div>}
      </CardContent>
    </Card>
  );
}

function MacroCalculator() {
  const [calories, setCalories] = useState('');
  const [goal, setGoal] = useState('balanced');
  const cals = Number(calories) || 0;
  const macros = cals > 0 ? { balanced: { p: cals * 0.3 / 4, c: cals * 0.4 / 4, f: cals * 0.3 / 9 }, 'high-protein': { p: cals * 0.4 / 4, c: cals * 0.3 / 4, f: cals * 0.3 / 9 }, keto: { p: cals * 0.25 / 4, c: cals * 0.05 / 4, f: cals * 0.7 / 9 } }[goal] : null;
  return (
    <Card>
      <CardHeader className="pb-3"><CardTitle className="text-base flex items-center gap-2"><Calculator className="w-4 h-4 text-yellow-400" />Macro Calculator</CardTitle></CardHeader>
      <CardContent className="space-y-3">
        <input type="number" value={calories} onChange={(e) => setCalories(e.target.value)} className="w-full h-9 px-3 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:border-wed-purple focus:outline-none" placeholder="Daily calories" />
        <select value={goal} onChange={(e) => setGoal(e.target.value)} className="w-full h-9 px-3 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:border-wed-purple focus:outline-none">
          <option value="balanced">Balanced</option><option value="high-protein">High Protein</option><option value="keto">Keto</option>
        </select>
        {macros && <div className="pt-2 border-t border-white/10 grid grid-cols-3 gap-2 text-center"><div><div className="text-lg font-bold text-wed-lime">{Math.round(macros.p)}g</div><div className="text-[10px] text-wed-gray-400">Protein</div></div><div><div className="text-lg font-bold text-wed-blue">{Math.round(macros.c)}g</div><div className="text-[10px] text-wed-gray-400">Carbs</div></div><div><div className="text-lg font-bold text-wed-pink">{Math.round(macros.f)}g</div><div className="text-[10px] text-wed-gray-400">Fats</div></div></div>}
      </CardContent>
    </Card>
  );
}

function TimerCard() {
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [intervalRef, setIntervalRef] = useState<NodeJS.Timeout | null>(null);
  const startTimer = useCallback((seconds: number) => {
    setTime(seconds);
    setIsRunning(true);
    if (intervalRef) clearInterval(intervalRef);
    const ref = setInterval(() => {
      setTime((prev) => { if (prev <= 1) { clearInterval(ref); setIsRunning(false); return 0; } return prev - 1; });
    }, 1000);
    setIntervalRef(ref);
  }, [intervalRef]);
  const toggle = () => { if (isRunning) { if (intervalRef) clearInterval(intervalRef); setIsRunning(false); } else if (time > 0) startTimer(time); };
  const reset = () => { if (intervalRef) clearInterval(intervalRef); setTime(0); setIsRunning(false); };
  const formatTime = (s: number) => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;
  return (
    <Card>
      <CardHeader className="pb-3"><CardTitle className="text-base flex items-center gap-2"><Timer className="w-4 h-4 text-wed-purple" />Workout Timer</CardTitle></CardHeader>
      <CardContent className="text-center">
        <div className="text-4xl font-mono font-bold text-white mb-4">{formatTime(time)}</div>
        <div className="flex justify-center gap-2 mb-4">
          <button onClick={toggle} className="px-4 py-2 rounded-lg bg-wed-purple text-white text-sm font-semibold hover:brightness-110 transition-all">{isRunning ? 'Pause' : 'Start'}</button>
          <button onClick={reset} className="p-2 rounded-lg bg-white/5 text-wed-gray-400 hover:text-white hover:bg-white/10 transition-all"><RotateCcw className="w-4 h-4" /></button>
        </div>
        <div className="flex justify-center gap-2">
          {[30, 60, 90, 180].map((s) => (
            <button key={s} onClick={() => startTimer(s)} className="px-2 py-1 rounded-lg bg-white/5 text-xs text-wed-gray-300 hover:bg-white/10 transition-all">{s < 60 ? `${s}s` : `${s / 60}m`}</button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
