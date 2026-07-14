'use client';

import { useState, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { Calculator, RotateCcw, Timer, Info } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  calculateBMI, getBMICategory, calculateBMRMifflin, calculateTDEE,
  calculateOneRepMax, calculateBodyFatMale, calculateBodyFatFemale,
} from '@/lib/utils';
import { useCalcHistory } from '@/hooks/use-calc-history';

const inputCls = 'w-full h-9 px-3 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:border-wed-purple focus:outline-none placeholder:text-wed-gray-500';
const smallInputCls = 'h-8 px-2 rounded-lg bg-white/5 border border-white/10 text-white text-xs focus:border-wed-purple focus:outline-none placeholder:text-wed-gray-500';

function ErrorText({ msg }: { msg: string | null }) {
  if (!msg) return null;
  return <p className="text-xs text-red-400">{msg}</p>;
}

function Formula({ children }: { children: React.ReactNode }) {
  return (
    <details className="mt-1 group">
      <summary className="flex items-center gap-1 text-[11px] text-wed-gray-500 cursor-pointer select-none hover:text-wed-gray-300">
        <Info className="w-3 h-3" /> Formula & explanation
      </summary>
      <p className="mt-1.5 text-[11px] text-wed-gray-400 leading-relaxed">{children}</p>
    </details>
  );
}

function HistoryList({ items }: { items: string[] }) {
  if (items.length === 0) return null;
  return (
    <div className="mt-2 pt-2 border-t border-white/5">
      <p className="text-[10px] uppercase tracking-wide text-wed-gray-500 mb-1">Recent</p>
      <div className="space-y-0.5">
        {items.map((item, i) => (
          <p key={i} className="text-[11px] text-wed-gray-400">{item}</p>
        ))}
      </div>
    </div>
  );
}

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
        <BMRCalculator />
        <TDEECalculator />
        <ProteinCalculator />
        <WaterCalculator />
        <BodyFatCalculator />
        <OneRMCalculator />
        <MacroCalculator />
        <LeanBodyMassCalculator />
        <IdealWeightCalculator />
        <BodySurfaceAreaCalculator />
        <StrengthStandardsCalculator />
        <WorkoutPaceCalculator />
        <TimerCard />
      </div>
    </div>
  );
}

function BMICalculator() {
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [bmi, setBmi] = useState<number | null>(null);
  const { history, push } = useCalcHistory('bmi');

  const compute = () => {
    const h = Number(height), w = Number(weight);
    if (!height || !weight) return setError('Enter both height and weight.');
    if (Number.isNaN(h) || Number.isNaN(w)) return setError('Enter valid numbers.');
    if (h < 100 || h > 250) return setError('Height must be 100–250 cm.');
    if (w < 20 || w > 400) return setError('Weight must be 20–400 kg.');
    setError(null);
    const result = calculateBMI(w, h);
    setBmi(result);
    push(`${result.toFixed(1)} (${getBMICategory(result)})`);
  };

  return (
    <Card>
      <CardHeader className="pb-3"><CardTitle className="text-base flex items-center gap-2"><Calculator className="w-4 h-4 text-wed-blue" />BMI Calculator</CardTitle></CardHeader>
      <CardContent className="space-y-3">
        <input type="number" value={height} onChange={(e) => setHeight(e.target.value)} className={inputCls} placeholder="Height (cm)" />
        <input type="number" value={weight} onChange={(e) => setWeight(e.target.value)} className={inputCls} placeholder="Weight (kg)" />
        <ErrorText msg={error} />
        <button onClick={compute} className="w-full h-9 rounded-lg bg-wed-blue/20 text-wed-blue text-sm font-semibold hover:bg-wed-blue/30 transition-all">Calculate</button>
        {bmi != null && !error && <div className="pt-2 border-t border-white/10"><div className="text-2xl font-bold text-wed-purple">{bmi.toFixed(1)}</div><div className="text-xs text-wed-gray-400">{getBMICategory(bmi)}</div></div>}
        <Formula>BMI = weight (kg) / height (m)². Categories: &lt;18.5 underweight, 18.5–25 normal, 25–30 overweight, &gt;30 obese.</Formula>
        <HistoryList items={history} />
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
  const [error, setError] = useState<string | null>(null);
  const [target, setTarget] = useState<number | null>(null);
  const { history, push } = useCalcHistory('calorie');

  const compute = () => {
    const a = Number(age), w = Number(weight), h = Number(height);
    if (!age || !weight || !height) return setError('Fill in age, weight, and height.');
    if (a < 10 || a > 100) return setError('Age must be 10–100.');
    if (w < 20 || w > 400) return setError('Weight must be 20–400 kg.');
    if (h < 100 || h > 250) return setError('Height must be 100–250 cm.');
    setError(null);
    const bmr = calculateBMRMifflin(w, h, a, gender);
    const tdee = calculateTDEE(bmr, Number(activity));
    const result = goal === 'lose' ? tdee - 500 : goal === 'gain' ? tdee + 300 : tdee;
    setTarget(result);
    push(`${Math.round(result)} kcal (${goal})`);
  };

  return (
    <Card>
      <CardHeader className="pb-3"><CardTitle className="text-base flex items-center gap-2"><Calculator className="w-4 h-4 text-wed-lime" />Calorie Calculator</CardTitle></CardHeader>
      <CardContent className="space-y-2">
        <div className="grid grid-cols-2 gap-2">
          <input type="number" value={age} onChange={(e) => setAge(e.target.value)} className={smallInputCls} placeholder="Age" />
          <input type="number" value={weight} onChange={(e) => setWeight(e.target.value)} className={smallInputCls} placeholder="Weight" />
          <input type="number" value={height} onChange={(e) => setHeight(e.target.value)} className={smallInputCls} placeholder="Height" />
          <select value={gender} onChange={(e) => setGender(e.target.value as 'MALE' | 'FEMALE')} className={smallInputCls}><option value="MALE">Male</option><option value="FEMALE">Female</option></select>
        </div>
        <select value={activity} onChange={(e) => setActivity(e.target.value)} className={`w-full ${smallInputCls}`}>
          <option value="1.2">Sedentary</option><option value="1.375">Light</option><option value="1.55">Moderate</option><option value="1.725">Active</option><option value="1.9">Very Active</option>
        </select>
        <select value={goal} onChange={(e) => setGoal(e.target.value)} className={`w-full ${smallInputCls}`}>
          <option value="maintain">Maintain</option><option value="lose">Lose Fat</option><option value="gain">Build Muscle</option>
        </select>
        <ErrorText msg={error} />
        <button onClick={compute} className="w-full h-8 rounded-lg bg-wed-lime/20 text-wed-lime text-xs font-semibold hover:bg-wed-lime/30 transition-all">Calculate</button>
        {target != null && !error && <div className="pt-2 border-t border-white/10"><div className="text-xl font-bold text-wed-blue">{Math.round(target)} kcal</div><div className="text-xs text-wed-gray-400">daily target</div></div>}
        <Formula>Mifflin–St Jeor BMR × activity multiplier = TDEE. Deficit −500 kcal to lose, surplus +300 kcal to gain.</Formula>
        <HistoryList items={history} />
      </CardContent>
    </Card>
  );
}

function BMRCalculator() {
  const [age, setAge] = useState('');
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [gender, setGender] = useState<'MALE' | 'FEMALE'>('MALE');
  const [error, setError] = useState<string | null>(null);
  const [bmr, setBmr] = useState<number | null>(null);
  const { history, push } = useCalcHistory('bmr');

  const compute = () => {
    const a = Number(age), w = Number(weight), h = Number(height);
    if (!age || !weight || !height) return setError('Fill in all fields.');
    if (a < 10 || a > 100) return setError('Age must be 10–100.');
    if (w < 20 || w > 400) return setError('Weight must be 20–400 kg.');
    if (h < 100 || h > 250) return setError('Height must be 100–250 cm.');
    setError(null);
    const result = calculateBMRMifflin(w, h, a, gender);
    setBmr(result);
    push(`${Math.round(result)} kcal/day`);
  };

  return (
    <Card>
      <CardHeader className="pb-3"><CardTitle className="text-base flex items-center gap-2"><Calculator className="w-4 h-4 text-wed-orange" />BMR Calculator</CardTitle></CardHeader>
      <CardContent className="space-y-2">
        <div className="grid grid-cols-2 gap-2">
          <input type="number" value={age} onChange={(e) => setAge(e.target.value)} className={smallInputCls} placeholder="Age" />
          <select value={gender} onChange={(e) => setGender(e.target.value as 'MALE' | 'FEMALE')} className={smallInputCls}><option value="MALE">Male</option><option value="FEMALE">Female</option></select>
          <input type="number" value={weight} onChange={(e) => setWeight(e.target.value)} className={smallInputCls} placeholder="Weight (kg)" />
          <input type="number" value={height} onChange={(e) => setHeight(e.target.value)} className={smallInputCls} placeholder="Height (cm)" />
        </div>
        <ErrorText msg={error} />
        <button onClick={compute} className="w-full h-8 rounded-lg bg-wed-orange/20 text-wed-orange text-xs font-semibold hover:bg-wed-orange/30 transition-all">Calculate</button>
        {bmr != null && !error && <div className="pt-2 border-t border-white/10"><div className="text-xl font-bold text-wed-orange">{Math.round(bmr)} kcal</div><div className="text-xs text-wed-gray-400">at complete rest / day</div></div>}
        <Formula>Mifflin–St Jeor: Men 10W + 6.25H − 5A + 5. Women 10W + 6.25H − 5A − 161 (W=kg, H=cm, A=years).</Formula>
        <HistoryList items={history} />
      </CardContent>
    </Card>
  );
}

function TDEECalculator() {
  const [bmrInput, setBmrInput] = useState('');
  const [activity, setActivity] = useState('1.55');
  const [error, setError] = useState<string | null>(null);
  const [tdee, setTdee] = useState<number | null>(null);
  const { history, push } = useCalcHistory('tdee');

  const compute = () => {
    const b = Number(bmrInput);
    if (!bmrInput) return setError('Enter your BMR (see BMR Calculator).');
    if (Number.isNaN(b) || b <= 0) return setError('Enter a valid BMR value.');
    if (b < 500 || b > 5000) return setError('BMR must be 500–5000 kcal.');
    setError(null);
    const result = calculateTDEE(b, Number(activity));
    setTdee(result);
    push(`${Math.round(result)} kcal/day`);
  };

  return (
    <Card>
      <CardHeader className="pb-3"><CardTitle className="text-base flex items-center gap-2"><Calculator className="w-4 h-4 text-wed-purple" />TDEE Calculator</CardTitle></CardHeader>
      <CardContent className="space-y-3">
        <input type="number" value={bmrInput} onChange={(e) => setBmrInput(e.target.value)} className={inputCls} placeholder="Your BMR (kcal)" />
        <select value={activity} onChange={(e) => setActivity(e.target.value)} className={inputCls}>
          <option value="1.2">Sedentary</option><option value="1.375">Light</option><option value="1.55">Moderate</option><option value="1.725">Active</option><option value="1.9">Very Active</option>
        </select>
        <ErrorText msg={error} />
        <button onClick={compute} className="w-full h-9 rounded-lg bg-wed-purple/20 text-wed-purple text-sm font-semibold hover:bg-wed-purple/30 transition-all">Calculate</button>
        {tdee != null && !error && <div className="pt-2 border-t border-white/10"><div className="text-2xl font-bold text-wed-purple">{Math.round(tdee)} kcal</div><div className="text-xs text-wed-gray-400">total daily energy</div></div>}
        <Formula>TDEE = BMR × activity multiplier (1.2 sedentary → 1.9 very active). Your total calories burned per day including activity.</Formula>
        <HistoryList items={history} />
      </CardContent>
    </Card>
  );
}

function ProteinCalculator() {
  const [weight, setWeight] = useState('');
  const [goal, setGoal] = useState('maintain');
  const [error, setError] = useState<string | null>(null);
  const [protein, setProtein] = useState<number | null>(null);
  const { history, push } = useCalcHistory('protein');
  const multiplier = goal === 'muscle' ? 2.2 : goal === 'fatloss' ? 2.0 : 1.6;

  const compute = () => {
    const w = Number(weight);
    if (!weight) return setError('Enter your weight.');
    if (Number.isNaN(w) || w < 20 || w > 400) return setError('Weight must be 20–400 kg.');
    setError(null);
    const result = w * multiplier;
    setProtein(result);
    push(`${Math.round(result)}g (${goal})`);
  };

  return (
    <Card>
      <CardHeader className="pb-3"><CardTitle className="text-base flex items-center gap-2"><Calculator className="w-4 h-4 text-wed-pink" />Protein Calculator</CardTitle></CardHeader>
      <CardContent className="space-y-3">
        <input type="number" value={weight} onChange={(e) => setWeight(e.target.value)} className={inputCls} placeholder="Weight (kg)" />
        <select value={goal} onChange={(e) => setGoal(e.target.value)} className={inputCls}>
          <option value="maintain">Maintain</option><option value="muscle">Build Muscle</option><option value="fatloss">Lose Fat</option>
        </select>
        <ErrorText msg={error} />
        <button onClick={compute} className="w-full h-9 rounded-lg bg-wed-pink/20 text-wed-pink text-sm font-semibold hover:bg-wed-pink/30 transition-all">Calculate</button>
        {protein != null && !error && <div className="pt-2 border-t border-white/10"><div className="text-2xl font-bold text-wed-lime">{Math.round(protein)}g</div><div className="text-xs text-wed-gray-400">protein per day</div></div>}
        <Formula>Protein target = bodyweight (kg) × {multiplier}g/kg. Higher for muscle gain (2.2), moderate for fat loss (2.0), maintenance (1.6).</Formula>
        <HistoryList items={history} />
      </CardContent>
    </Card>
  );
}

function WaterCalculator() {
  const [weight, setWeight] = useState('');
  const [activity, setActivity] = useState('moderate');
  const [error, setError] = useState<string | null>(null);
  const [water, setWater] = useState<number | null>(null);
  const { history, push } = useCalcHistory('water');

  const compute = () => {
    const w = Number(weight);
    if (!weight) return setError('Enter your weight.');
    if (Number.isNaN(w) || w < 20 || w > 400) return setError('Weight must be 20–400 kg.');
    setError(null);
    const base = w * 0.033;
    const multiplier = activity === 'high' ? 1.3 : activity === 'moderate' ? 1.1 : 1.0;
    const result = base * multiplier;
    setWater(result);
    push(`${result.toFixed(1)}L (${activity})`);
  };

  return (
    <Card>
      <CardHeader className="pb-3"><CardTitle className="text-base flex items-center gap-2"><Calculator className="w-4 h-4 text-cyan-400" />Water Intake</CardTitle></CardHeader>
      <CardContent className="space-y-3">
        <input type="number" value={weight} onChange={(e) => setWeight(e.target.value)} className={inputCls} placeholder="Weight (kg)" />
        <select value={activity} onChange={(e) => setActivity(e.target.value)} className={inputCls}>
          <option value="low">Low Activity</option><option value="moderate">Moderate</option><option value="high">High Activity</option>
        </select>
        <ErrorText msg={error} />
        <button onClick={compute} className="w-full h-9 rounded-lg bg-cyan-400/20 text-cyan-400 text-sm font-semibold hover:bg-cyan-400/30 transition-all">Calculate</button>
        {water != null && !error && <div className="pt-2 border-t border-white/10"><div className="text-2xl font-bold text-cyan-400">{water.toFixed(1)}L</div><div className="text-xs text-wed-gray-400">water per day</div></div>}
        <Formula>Base = weight (kg) × 33ml, scaled ×1.1 (moderate) or ×1.3 (high activity) for sweat loss.</Formula>
        <HistoryList items={history} />
      </CardContent>
    </Card>
  );
}

function BodyFatCalculator() {
  const [waist, setWaist] = useState('');
  const [neck, setNeck] = useState('');
  const [height, setHeight] = useState('');
  const [hip, setHip] = useState('');
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [error, setError] = useState<string | null>(null);
  const [bf, setBf] = useState<number | null>(null);
  const { history, push } = useCalcHistory('bodyfat');

  const compute = () => {
    const w = Number(waist), n = Number(neck), h = Number(height), hp = Number(hip);
    if (!waist || !neck || !height || (gender === 'female' && !hip)) return setError('Fill in all required fields.');
    if (w <= n) return setError('Waist must be greater than neck measurement.');
    if (w < 30 || w > 200 || n < 15 || n > 80 || h < 100 || h > 250) return setError('Check your measurements are in cm and realistic.');
    setError(null);
    const result = gender === 'male' ? calculateBodyFatMale(w, n, h) : calculateBodyFatFemale(w, n, h, hp);
    setBf(result);
    push(`${result.toFixed(1)}%`);
  };

  return (
    <Card>
      <CardHeader className="pb-3"><CardTitle className="text-base flex items-center gap-2"><Calculator className="w-4 h-4 text-wed-orange" />Body Fat %</CardTitle></CardHeader>
      <CardContent className="space-y-2">
        <div className="grid grid-cols-2 gap-2">
          <input type="number" value={waist} onChange={(e) => setWaist(e.target.value)} className={smallInputCls} placeholder="Waist (cm)" />
          <input type="number" value={neck} onChange={(e) => setNeck(e.target.value)} className={smallInputCls} placeholder="Neck (cm)" />
          <input type="number" value={height} onChange={(e) => setHeight(e.target.value)} className={smallInputCls} placeholder="Height (cm)" />
          <select value={gender} onChange={(e) => setGender(e.target.value as 'male' | 'female')} className={smallInputCls}><option value="male">Male</option><option value="female">Female</option></select>
        </div>
        {gender === 'female' && <input type="number" value={hip} onChange={(e) => setHip(e.target.value)} className={`w-full ${smallInputCls}`} placeholder="Hip (cm)" />}
        <ErrorText msg={error} />
        <button onClick={compute} className="w-full h-8 rounded-lg bg-wed-orange/20 text-wed-orange text-xs font-semibold hover:bg-wed-orange/30 transition-all">Calculate</button>
        {bf != null && !error && <div className="pt-2 border-t border-white/10"><div className="text-xl font-bold text-wed-pink">{bf.toFixed(1)}%</div></div>}
        <Formula>US Navy method: uses waist, neck (and hip for women) circumferences with height via log-based formula.</Formula>
        <HistoryList items={history} />
      </CardContent>
    </Card>
  );
}

function OneRMCalculator() {
  const [weight, setWeight] = useState('');
  const [reps, setReps] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [rm, setRm] = useState<number | null>(null);
  const { history, push } = useCalcHistory('1rm');

  const compute = () => {
    const w = Number(weight), r = Number(reps);
    if (!weight || !reps) return setError('Enter weight and reps.');
    if (w <= 0 || w > 500) return setError('Weight must be 1–500 kg.');
    if (!Number.isInteger(r) || r <= 0 || r > 20) return setError('Reps must be a whole number 1–20.');
    setError(null);
    const result = calculateOneRepMax(w, r);
    setRm(result);
    push(`${result.toFixed(1)}kg (${w}kg × ${r})`);
  };

  return (
    <Card>
      <CardHeader className="pb-3"><CardTitle className="text-base flex items-center gap-2"><Calculator className="w-4 h-4 text-wed-purple" />One Rep Max</CardTitle></CardHeader>
      <CardContent className="space-y-3">
        <input type="number" value={weight} onChange={(e) => setWeight(e.target.value)} className={inputCls} placeholder="Weight lifted (kg)" />
        <input type="number" value={reps} onChange={(e) => setReps(e.target.value)} className={inputCls} placeholder="Reps performed" />
        <ErrorText msg={error} />
        <button onClick={compute} className="w-full h-9 rounded-lg bg-wed-purple/20 text-wed-purple text-sm font-semibold hover:bg-wed-purple/30 transition-all">Calculate</button>
        {rm != null && !error && <div className="pt-2 border-t border-white/10"><div className="text-2xl font-bold text-wed-purple">{rm.toFixed(1)} kg</div><div className="text-xs text-wed-gray-400">estimated 1RM</div></div>}
        <Formula>Epley formula: 1RM = weight × (1 + reps/30). Estimates your true one-rep max from a submaximal set.</Formula>
        <HistoryList items={history} />
      </CardContent>
    </Card>
  );
}

function MacroCalculator() {
  const [calories, setCalories] = useState('');
  const [goal, setGoal] = useState('balanced');
  const [error, setError] = useState<string | null>(null);
  const [macros, setMacros] = useState<{ p: number; c: number; f: number } | null>(null);
  const { history, push } = useCalcHistory('macro');

  const compute = () => {
    const cals = Number(calories);
    if (!calories) return setError('Enter your daily calories.');
    if (Number.isNaN(cals) || cals < 500 || cals > 10000) return setError('Calories must be 500–10000.');
    setError(null);
    const splits: Record<string, { p: number; c: number; f: number }> = {
      balanced: { p: cals * 0.3 / 4, c: cals * 0.4 / 4, f: cals * 0.3 / 9 },
      'high-protein': { p: cals * 0.4 / 4, c: cals * 0.3 / 4, f: cals * 0.3 / 9 },
      keto: { p: cals * 0.25 / 4, c: cals * 0.05 / 4, f: cals * 0.7 / 9 },
    };
    const result = splits[goal];
    setMacros(result);
    push(`P${Math.round(result.p)}/C${Math.round(result.c)}/F${Math.round(result.f)}g`);
  };

  return (
    <Card>
      <CardHeader className="pb-3"><CardTitle className="text-base flex items-center gap-2"><Calculator className="w-4 h-4 text-yellow-400" />Macro Calculator</CardTitle></CardHeader>
      <CardContent className="space-y-3">
        <input type="number" value={calories} onChange={(e) => setCalories(e.target.value)} className={inputCls} placeholder="Daily calories" />
        <select value={goal} onChange={(e) => setGoal(e.target.value)} className={inputCls}>
          <option value="balanced">Balanced</option><option value="high-protein">High Protein</option><option value="keto">Keto</option>
        </select>
        <ErrorText msg={error} />
        <button onClick={compute} className="w-full h-9 rounded-lg bg-yellow-400/20 text-yellow-400 text-sm font-semibold hover:bg-yellow-400/30 transition-all">Calculate</button>
        {macros != null && !error && <div className="pt-2 border-t border-white/10 grid grid-cols-3 gap-2 text-center"><div><div className="text-lg font-bold text-wed-lime">{Math.round(macros.p)}g</div><div className="text-[10px] text-wed-gray-400">Protein</div></div><div><div className="text-lg font-bold text-wed-blue">{Math.round(macros.c)}g</div><div className="text-[10px] text-wed-gray-400">Carbs</div></div><div><div className="text-lg font-bold text-wed-pink">{Math.round(macros.f)}g</div><div className="text-[10px] text-wed-gray-400">Fats</div></div></div>}
        <Formula>Splits calories by % across protein/carbs/fat, converted via 4 kcal/g (protein, carbs) and 9 kcal/g (fat).</Formula>
        <HistoryList items={history} />
      </CardContent>
    </Card>
  );
}

/** Boer formula — more accurate than the older Hume/James formulas for most body types. */
function calculateLeanBodyMass(weightKg: number, heightCm: number, gender: 'MALE' | 'FEMALE'): number {
  if (gender === 'FEMALE') return 0.252 * weightKg + 0.473 * heightCm - 48.3;
  return 0.407 * weightKg + 0.267 * heightCm - 19.2;
}

function LeanBodyMassCalculator() {
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [gender, setGender] = useState<'MALE' | 'FEMALE'>('MALE');
  const [error, setError] = useState<string | null>(null);
  const [lbm, setLbm] = useState<number | null>(null);
  const { history, push } = useCalcHistory('lbm');

  const compute = () => {
    const w = Number(weight), h = Number(height);
    if (!weight || !height) return setError('Enter weight and height.');
    if (w < 20 || w > 400) return setError('Weight must be 20–400 kg.');
    if (h < 100 || h > 250) return setError('Height must be 100–250 cm.');
    setError(null);
    const result = calculateLeanBodyMass(w, h, gender);
    setLbm(result);
    push(`${result.toFixed(1)} kg`);
  };

  return (
    <Card>
      <CardHeader className="pb-3"><CardTitle className="text-base flex items-center gap-2"><Calculator className="w-4 h-4 text-wed-blue" />Lean Body Mass</CardTitle></CardHeader>
      <CardContent className="space-y-2">
        <div className="grid grid-cols-2 gap-2">
          <input type="number" value={weight} onChange={(e) => setWeight(e.target.value)} className={smallInputCls} placeholder="Weight (kg)" />
          <input type="number" value={height} onChange={(e) => setHeight(e.target.value)} className={smallInputCls} placeholder="Height (cm)" />
        </div>
        <select value={gender} onChange={(e) => setGender(e.target.value as 'MALE' | 'FEMALE')} className={`w-full ${smallInputCls}`}><option value="MALE">Male</option><option value="FEMALE">Female</option></select>
        <ErrorText msg={error} />
        <button onClick={compute} className="w-full h-8 rounded-lg bg-wed-blue/20 text-wed-blue text-xs font-semibold hover:bg-wed-blue/30 transition-all">Calculate</button>
        {lbm != null && !error && <div className="pt-2 border-t border-white/10"><div className="text-xl font-bold text-wed-blue">{lbm.toFixed(1)} kg</div><div className="text-xs text-wed-gray-400">lean mass</div></div>}
        <Formula>Boer formula: Men = 0.407×weight + 0.267×height − 19.2. Women = 0.252×weight + 0.473×height − 48.3.</Formula>
        <HistoryList items={history} />
      </CardContent>
    </Card>
  );
}

/** Devine formula, the clinical standard for ideal bodyweight. */
function calculateIdealWeight(heightCm: number, gender: 'MALE' | 'FEMALE'): number {
  const inches = heightCm / 2.54;
  const base = gender === 'FEMALE' ? 45.5 : 50;
  return base + 2.3 * (inches - 60);
}

function IdealWeightCalculator() {
  const [height, setHeight] = useState('');
  const [gender, setGender] = useState<'MALE' | 'FEMALE'>('MALE');
  const [error, setError] = useState<string | null>(null);
  const [ideal, setIdeal] = useState<number | null>(null);
  const { history, push } = useCalcHistory('idealweight');

  const compute = () => {
    const h = Number(height);
    if (!height) return setError('Enter your height.');
    if (h < 140 || h > 220) return setError('Height must be 140–220 cm for this formula.');
    setError(null);
    const result = calculateIdealWeight(h, gender);
    setIdeal(result);
    push(`${result.toFixed(1)} kg`);
  };

  return (
    <Card>
      <CardHeader className="pb-3"><CardTitle className="text-base flex items-center gap-2"><Calculator className="w-4 h-4 text-wed-lime" />Ideal Weight</CardTitle></CardHeader>
      <CardContent className="space-y-3">
        <input type="number" value={height} onChange={(e) => setHeight(e.target.value)} className={inputCls} placeholder="Height (cm)" />
        <select value={gender} onChange={(e) => setGender(e.target.value as 'MALE' | 'FEMALE')} className={inputCls}><option value="MALE">Male</option><option value="FEMALE">Female</option></select>
        <ErrorText msg={error} />
        <button onClick={compute} className="w-full h-9 rounded-lg bg-wed-lime/20 text-wed-lime text-sm font-semibold hover:bg-wed-lime/30 transition-all">Calculate</button>
        {ideal != null && !error && <div className="pt-2 border-t border-white/10"><div className="text-2xl font-bold text-wed-lime">{ideal.toFixed(1)} kg</div><div className="text-xs text-wed-gray-400">ideal bodyweight</div></div>}
        <Formula>Devine formula: Men = 50kg + 2.3kg per inch over 5ft. Women = 45.5kg + 2.3kg per inch over 5ft.</Formula>
        <HistoryList items={history} />
      </CardContent>
    </Card>
  );
}

/** Mosteller formula — simplest and most widely used clinical BSA estimate. */
function calculateBSA(heightCm: number, weightKg: number): number {
  return Math.sqrt((heightCm * weightKg) / 3600);
}

function BodySurfaceAreaCalculator() {
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [bsa, setBsa] = useState<number | null>(null);
  const { history, push } = useCalcHistory('bsa');

  const compute = () => {
    const h = Number(height), w = Number(weight);
    if (!height || !weight) return setError('Enter height and weight.');
    if (h < 100 || h > 250) return setError('Height must be 100–250 cm.');
    if (w < 20 || w > 400) return setError('Weight must be 20–400 kg.');
    setError(null);
    const result = calculateBSA(h, w);
    setBsa(result);
    push(`${result.toFixed(2)} m²`);
  };

  return (
    <Card>
      <CardHeader className="pb-3"><CardTitle className="text-base flex items-center gap-2"><Calculator className="w-4 h-4 text-cyan-400" />Body Surface Area</CardTitle></CardHeader>
      <CardContent className="space-y-2">
        <div className="grid grid-cols-2 gap-2">
          <input type="number" value={height} onChange={(e) => setHeight(e.target.value)} className={smallInputCls} placeholder="Height (cm)" />
          <input type="number" value={weight} onChange={(e) => setWeight(e.target.value)} className={smallInputCls} placeholder="Weight (kg)" />
        </div>
        <ErrorText msg={error} />
        <button onClick={compute} className="w-full h-8 rounded-lg bg-cyan-400/20 text-cyan-400 text-xs font-semibold hover:bg-cyan-400/30 transition-all">Calculate</button>
        {bsa != null && !error && <div className="pt-2 border-t border-white/10"><div className="text-xl font-bold text-cyan-400">{bsa.toFixed(2)} m²</div></div>}
        <Formula>Mosteller formula: BSA = √((height(cm) × weight(kg)) / 3600). Used clinically for metabolic estimates.</Formula>
        <HistoryList items={history} />
      </CardContent>
    </Card>
  );
}

interface StrengthTier { name: string; mult: number }
const STRENGTH_STANDARDS: Record<string, StrengthTier[]> = {
  bench: [{ name: 'Beginner', mult: 0.5 }, { name: 'Novice', mult: 0.75 }, { name: 'Intermediate', mult: 1.0 }, { name: 'Advanced', mult: 1.5 }, { name: 'Elite', mult: 2.0 }],
  squat: [{ name: 'Beginner', mult: 0.75 }, { name: 'Novice', mult: 1.0 }, { name: 'Intermediate', mult: 1.5 }, { name: 'Advanced', mult: 2.0 }, { name: 'Elite', mult: 2.5 }],
  deadlift: [{ name: 'Beginner', mult: 1.0 }, { name: 'Novice', mult: 1.25 }, { name: 'Intermediate', mult: 1.75 }, { name: 'Advanced', mult: 2.25 }, { name: 'Elite', mult: 3.0 }],
  ohp: [{ name: 'Beginner', mult: 0.35 }, { name: 'Novice', mult: 0.5 }, { name: 'Intermediate', mult: 0.75 }, { name: 'Advanced', mult: 1.0 }, { name: 'Elite', mult: 1.25 }],
};

function StrengthStandardsCalculator() {
  const [lift, setLift] = useState('bench');
  const [bodyweight, setBodyweight] = useState('');
  const [maxLift, setMaxLift] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [tier, setTier] = useState<{ name: string; ratio: number } | null>(null);
  const { history, push } = useCalcHistory('strength');

  const compute = () => {
    const bw = Number(bodyweight), ml = Number(maxLift);
    if (!bodyweight || !maxLift) return setError('Enter bodyweight and your max lift.');
    if (bw < 20 || bw > 400) return setError('Bodyweight must be 20–400 kg.');
    if (ml <= 0 || ml > 500) return setError('Lift weight must be 1–500 kg.');
    setError(null);
    const ratio = ml / bw;
    const tiers = STRENGTH_STANDARDS[lift];
    let matched = tiers[0];
    for (const t of tiers) if (ratio >= t.mult) matched = t;
    setTier({ name: matched.name, ratio });
    push(`${matched.name} (${ratio.toFixed(2)}× BW, ${lift})`);
  };

  return (
    <Card>
      <CardHeader className="pb-3"><CardTitle className="text-base flex items-center gap-2"><Calculator className="w-4 h-4 text-wed-orange" />Strength Standards</CardTitle></CardHeader>
      <CardContent className="space-y-2">
        <select value={lift} onChange={(e) => setLift(e.target.value)} className={`w-full ${smallInputCls}`}>
          <option value="bench">Bench Press</option><option value="squat">Squat</option><option value="deadlift">Deadlift</option><option value="ohp">Overhead Press</option>
        </select>
        <div className="grid grid-cols-2 gap-2">
          <input type="number" value={bodyweight} onChange={(e) => setBodyweight(e.target.value)} className={smallInputCls} placeholder="Bodyweight (kg)" />
          <input type="number" value={maxLift} onChange={(e) => setMaxLift(e.target.value)} className={smallInputCls} placeholder="Max lift (kg)" />
        </div>
        <ErrorText msg={error} />
        <button onClick={compute} className="w-full h-8 rounded-lg bg-wed-orange/20 text-wed-orange text-xs font-semibold hover:bg-wed-orange/30 transition-all">Calculate</button>
        {tier != null && !error && <div className="pt-2 border-t border-white/10"><div className="text-xl font-bold text-wed-orange">{tier.name}</div><div className="text-xs text-wed-gray-400">{tier.ratio.toFixed(2)}× bodyweight</div></div>}
        <Formula>Ratio = max lift ÷ bodyweight, matched against approximate strength tiers per lift. General estimate, not gender/age-adjusted.</Formula>
        <HistoryList items={history} />
      </CardContent>
    </Card>
  );
}

function WorkoutPaceCalculator() {
  const [sets, setSets] = useState('');
  const [reps, setReps] = useState('');
  const [minutes, setMinutes] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pace, setPace] = useState<{ setsPerMin: number; repsPerMin: number } | null>(null);
  const { history, push } = useCalcHistory('pace');

  const compute = () => {
    const s = Number(sets), r = Number(reps), m = Number(minutes);
    if (!sets || !reps || !minutes) return setError('Enter total sets, reps, and duration.');
    if (s <= 0 || s > 200) return setError('Sets must be 1–200.');
    if (r <= 0 || r > 5000) return setError('Reps must be 1–5000.');
    if (m <= 0 || m > 600) return setError('Duration must be 1–600 minutes.');
    setError(null);
    const result = { setsPerMin: s / m, repsPerMin: r / m };
    setPace(result);
    push(`${result.setsPerMin.toFixed(2)} sets/min, ${result.repsPerMin.toFixed(1)} reps/min`);
  };

  return (
    <Card>
      <CardHeader className="pb-3"><CardTitle className="text-base flex items-center gap-2"><Calculator className="w-4 h-4 text-wed-pink" />Workout Pace</CardTitle></CardHeader>
      <CardContent className="space-y-2">
        <div className="grid grid-cols-3 gap-2">
          <input type="number" value={sets} onChange={(e) => setSets(e.target.value)} className={smallInputCls} placeholder="Total sets" />
          <input type="number" value={reps} onChange={(e) => setReps(e.target.value)} className={smallInputCls} placeholder="Total reps" />
          <input type="number" value={minutes} onChange={(e) => setMinutes(e.target.value)} className={smallInputCls} placeholder="Minutes" />
        </div>
        <ErrorText msg={error} />
        <button onClick={compute} className="w-full h-8 rounded-lg bg-wed-pink/20 text-wed-pink text-xs font-semibold hover:bg-wed-pink/30 transition-all">Calculate</button>
        {pace != null && !error && (
          <div className="pt-2 border-t border-white/10 grid grid-cols-2 gap-2 text-center">
            <div><div className="text-lg font-bold text-wed-pink">{pace.setsPerMin.toFixed(2)}</div><div className="text-[10px] text-wed-gray-400">sets/min</div></div>
            <div><div className="text-lg font-bold text-wed-blue">{pace.repsPerMin.toFixed(1)}</div><div className="text-[10px] text-wed-gray-400">reps/min</div></div>
          </div>
        )}
        <Formula>Pace = total sets (or reps) ÷ session duration in minutes. Higher pace means less rest between sets.</Formula>
        <HistoryList items={history} />
      </CardContent>
    </Card>
  );
}

function TimerCard() {
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startTimer = useCallback((seconds: number) => {
    setTime(seconds);
    setIsRunning(true);
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setTime((prev) => { if (prev <= 1) { if (intervalRef.current) clearInterval(intervalRef.current); setIsRunning(false); return 0; } return prev - 1; });
    }, 1000);
  }, []);

  const toggle = () => {
    if (isRunning) { if (intervalRef.current) clearInterval(intervalRef.current); setIsRunning(false); }
    else if (time > 0) startTimer(time);
  };
  const reset = () => { if (intervalRef.current) clearInterval(intervalRef.current); setTime(0); setIsRunning(false); };
  const formatTime = (s: number) => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;

  return (
    <Card>
      <CardHeader className="pb-3"><CardTitle className="text-base flex items-center gap-2"><Timer className="w-4 h-4 text-wed-purple" />Rest Timer</CardTitle></CardHeader>
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
        <p className="mt-3 text-[11px] text-wed-gray-500">Standalone countdown — the same timer engine also drives rest between exercises during a live workout session.</p>
      </CardContent>
    </Card>
  );
}
