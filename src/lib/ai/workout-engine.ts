// The workout intelligence engine. Deterministic, knowledge-driven, and fully
// traceable: every exercise, set count, rep range, rest period, and ordering
// decision carries a Reasoning object that explain.ts renders to prose.

import { exercises } from '@/data/exercises';
import type { Exercise } from '@/types';
import { exerciseMeta, type MovementPattern, type SkillFocus } from '@/data/knowledge/exercise-meta';
import { physiqueById } from '@/data/knowledge/physiques';
import { trainingStyleById } from '@/data/knowledge/training-styles';
import { selectTemplate, type TemplateSlot } from '@/data/knowledge/templates';
import { experienceProfiles, goalProfiles, effectiveSets } from '@/data/knowledge/volume-landmarks';
import type { AthleteProfile, AiPlan, AiDay, AiExercise, Reasoning } from './types';

const DIFFICULTY_ORDER = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT'] as const;

/** Session exercise cap from time: quality drops when sessions are stuffed. */
function minutesCap(sessionMinutes: number): number {
  if (sessionMinutes <= 30) return 3;
  if (sessionMinutes <= 45) return 4;
  if (sessionMinutes <= 60) return 5;
  return 6;
}

function blendRepRange(a: [number, number], b: [number, number]): string {
  const lo = Math.round((a[0] + b[0]) / 2);
  const hi = Math.round((a[1] + b[1]) / 2);
  return `${lo}-${hi}`;
}

/** Progression-chain position by tier: beginners earn the harder variations. */
function chainIndexForTier(tier: AthleteProfile['experienceTier'], chainLength: number): number {
  const position = tier === 'NEVER_TRAINED' ? 0 : tier === 'BEGINNER' ? 0.34 : tier === 'INTERMEDIATE' ? 0.67 : 1;
  return Math.min(chainLength - 1, Math.round(position * (chainLength - 1)));
}

export function generateIntelligentPlan(profile: AthleteProfile): AiPlan {
  const physique = physiqueById(profile.physique)!;
  const style = trainingStyleById(profile.trainingStyle)!;
  const exp = experienceProfiles[profile.experienceTier];
  const goal = goalProfiles[profile.goalsRanked[0] ?? 'general-fitness'];
  const planReasoning: Reasoning[] = [];

  const template = selectTemplate(style.id, profile.capacity.effectiveDays);
  planReasoning.push({
    rule: 'template-selected',
    inputs: { template: template.name, style: style.name, days: profile.capacity.effectiveDays, rationale: template.rationale },
  });
  if (profile.capacity.effectiveDays < profile.capacity.daysPerWeek) {
    planReasoning.push({
      rule: 'recovery-cap-applied',
      inputs: { requested: profile.capacity.daysPerWeek, programmed: profile.capacity.effectiveDays, recoveryScore: profile.recoveryScore },
    });
  }

  const cap = Math.min(exp.exercisesPerSessionCap, minutesCap(profile.capacity.sessionMinutes));
  planReasoning.push({
    rule: 'session-cap',
    inputs: { cap, experienceCap: exp.exercisesPerSessionCap, minutesCap: minutesCap(profile.capacity.sessionMinutes), sessionMinutes: profile.capacity.sessionMinutes },
  });

  const equipmentSet = new Set<string>(profile.equipment);
  const targetDifficulty = DIFFICULTY_ORDER.indexOf(exp.dbLevel);

  const availableTo = (ex: Exercise): boolean => {
    const meta = exerciseMeta[ex.id];
    if (!meta) return false;
    if (!style.allowedMechanics.includes(meta.mechanics)) return false;
    if (style.bodyweightOnly && !ex.equipment.some((e) => e === 'NONE' || e === 'PULLUP_BAR')) return false;
    return ex.equipment.some((e) => equipmentSet.has(e));
  };

  const candidatesFor = (slot: TemplateSlot): Exercise[] =>
    exercises
      .filter((ex) => {
        const meta = exerciseMeta[ex.id];
        if (!meta || !availableTo(ex)) return false;
        return slot.kind === 'pattern' ? meta.movementPattern === slot.value : meta.skillFocus === slot.value;
      })
      .sort(
        (a, b) =>
          Math.abs(DIFFICULTY_ORDER.indexOf(a.difficulty) - targetDifficulty) -
          Math.abs(DIFFICULTY_ORDER.indexOf(b.difficulty) - targetDifficulty)
      );

  const days: AiDay[] = template.days.slice(0, profile.capacity.effectiveDays).map((dayTemplate, dayIndex) => {
    const dayReasoning: Reasoning[] = [];
    // Trim to cap: optional slots go first, then lowest-priority.
    let slots = [...dayTemplate.slots].sort((a, b) => a.priority - b.priority);
    while (slots.length > cap) {
      const optionalIdx = slots.map((s, i) => (s.optional ? i : -1)).filter((i) => i !== -1).pop();
      const dropIdx = optionalIdx !== undefined ? optionalIdx : slots.length - 1;
      const dropped = slots.splice(dropIdx, 1)[0];
      dayReasoning.push({ rule: 'slot-dropped-for-time', inputs: { slot: `${dropped.kind}:${dropped.value}`, cap } });
    }

    const picked: AiExercise[] = [];
    const usedIds = new Set<string>();

    for (const slot of slots) {
      let pool = candidatesFor(slot).filter((ex) => !usedIds.has(ex.id));
      if (pool.length === 0) {
        // Repair via substitutions of any same-slot exercise already known.
        const anyCandidate = candidatesFor(slot)[0];
        const subs = anyCandidate ? exerciseMeta[anyCandidate.id].substitutions : [];
        pool = subs
          .map((id) => exercises.find((e) => e.id === id))
          .filter((e): e is Exercise => Boolean(e && availableTo(e) && !usedIds.has(e.id)));
        if (pool.length === 0) {
          dayReasoning.push({ rule: 'slot-unfillable', inputs: { slot: `${slot.kind}:${slot.value}` } });
          continue;
        }
      }

      const meta0 = exerciseMeta[pool[0].id];
      let chosen: Exercise;
      const exerciseReasoning: Reasoning[] = [];

      if (slot.kind === 'skill' && meta0.progressionChain) {
        // Walk the progression chain to the tier-appropriate rung that's available.
        const chain = meta0.progressionChain
          .map((id) => exercises.find((e) => e.id === id))
          .filter((e): e is Exercise => Boolean(e && availableTo(e) && !usedIds.has(e.id)));
        const idx = chain.length > 0 ? chainIndexForTier(profile.experienceTier, chain.length) : -1;
        chosen = idx >= 0 ? chain[idx] : pool[dayIndex % pool.length];
        if (idx >= 0) {
          exerciseReasoning.push({
            rule: 'skill-progression-level',
            inputs: { skill: String(slot.value), tier: profile.experienceTier, rung: `${idx + 1}/${chain.length}`, exercise: chosen.name },
          });
        }
      } else {
        // Rotate deterministic variety across A/B days.
        chosen = pool[dayIndex % pool.length];
      }
      usedIds.add(chosen.id);

      const meta = exerciseMeta[chosen.id];
      exerciseReasoning.push({
        rule: 'exercise-selected',
        inputs: {
          exercise: chosen.name,
          slot: `${slot.kind}:${slot.value}`,
          equipment: chosen.equipment.filter((e) => equipmentSet.has(e)).join('/') || 'bodyweight',
          physique: physique.name,
          style: style.name,
        },
      });

      // Volume: landmarks × goal × physique; isolation gets one set less.
      const baseSets = effectiveSets(exp.setsPerExercise, [goal.volumeMultiplier, physique.bias.volumeMultiplier]);
      const sets = meta.mechanics === 'isolation' ? Math.max(2, baseSets - 1) : baseSets;
      exerciseReasoning.push({
        rule: 'volume-assigned',
        inputs: { sets, base: exp.setsPerExercise, goal: goal.label, physique: physique.name, mechanics: meta.mechanics, tier: exp.label },
      });

      // Reps: blend goal and physique ranges; skills honor the goal floor.
      const reps = slot.kind === 'skill' && goal.id === 'max-strength'
        ? `${goal.repRange[0]}-${goal.repRange[1]}`
        : blendRepRange(goal.repRange, physique.bias.repRange);
      exerciseReasoning.push({ rule: 'reps-assigned', inputs: { reps, goal: goal.label, physique: physique.name } });

      // Rest: compounds/skills rest by goal (and style floor); isolation recovers fast.
      const restSec = meta.mechanics === 'isolation' ? 60 : Math.max(goal.restSec, style.defaultRestSec);
      exerciseReasoning.push({ rule: 'rest-assigned', inputs: { restSec, mechanics: meta.mechanics, goal: goal.label } });

      picked.push({
        id: chosen.id,
        name: chosen.name,
        sets,
        reps,
        rest: `${restSec}s`,
        pattern: meta.movementPattern,
        mechanics: meta.mechanics,
        skillFocus: meta.skillFocus,
        reasoning: exerciseReasoning,
      });
    }

    // Order: skills first (freshest nervous system), compounds, then isolation.
    const mechRank = (e: AiExercise) => (e.skillFocus ? 0 : e.mechanics === 'compound' ? 1 : 2);
    picked.sort((a, b) => mechRank(a) - mechRank(b));
    dayReasoning.push({ rule: 'exercise-order', inputs: { order: 'skills → compounds → isolation' } });

    return { name: dayTemplate.name, exercises: picked, reasoning: dayReasoning };
  });

  // ── Weekly balance validations ─────────────────────────
  const validations: string[] = [];

  const patternsProgrammed = new Set<MovementPattern>();
  const skillsProgrammed = new Set<SkillFocus>();
  for (const day of days) for (const ex of day.exercises) {
    patternsProgrammed.add(ex.pattern);
    if (ex.skillFocus) skillsProgrammed.add(ex.skillFocus);
  }
  const requiredPatterns = new Set<string>();
  for (const day of template.days.slice(0, profile.capacity.effectiveDays))
    for (const slot of day.slots)
      if (!slot.optional && slot.kind === 'pattern' && slot.value !== 'accessory') requiredPatterns.add(slot.value);
  const missing = Array.from(requiredPatterns).filter((p) => !patternsProgrammed.has(p as MovementPattern));
  validations.push(
    missing.length === 0
      ? `✓ Movement coverage: all ${requiredPatterns.size} required patterns programmed (${Array.from(patternsProgrammed).join(', ')}).`
      : `⚠ Missing patterns: ${missing.join(', ')} — no available exercise fits (equipment-limited).`
  );

  // Per-muscle weekly sets vs landmarks.
  const weeklySets: Record<string, number> = {};
  for (const day of days) for (const ex of day.exercises) {
    const lib = exercises.find((e) => e.id === ex.id)!;
    for (const muscle of lib.primaryMuscles) weeklySets[muscle] = (weeklySets[muscle] ?? 0) + ex.sets;
  }
  const [minSets, maxSets] = exp.weeklySetsPerMuscle;
  const overtrained = Object.entries(weeklySets).filter(([m, s]) => m !== 'CARDIO' && s > maxSets * 1.25);
  validations.push(
    overtrained.length === 0
      ? `✓ No muscle exceeds the ${exp.label} weekly volume ceiling (${maxSets} sets).`
      : `⚠ High volume: ${overtrained.map(([m, s]) => `${m} ${s} sets`).join(', ')} — trim if recovery lags.`
  );
  const majorMuscles = ['CHEST', 'BACK', 'LEGS'];
  const undertrained = majorMuscles.filter((m) => (weeklySets[m] ?? 0) < Math.min(minSets, 6) && profile.capacity.effectiveDays >= 3);
  if (undertrained.length > 0) validations.push(`⚠ Below minimum effective volume: ${undertrained.join(', ')}.`);

  // Frequency: how many days touch each major muscle.
  const freq: Record<string, number> = {};
  for (const day of days) {
    const touched = new Set<string>();
    for (const ex of day.exercises) {
      const lib = exercises.find((e) => e.id === ex.id)!;
      lib.primaryMuscles.forEach((m) => touched.add(m));
    }
    touched.forEach((m) => (freq[m] = (freq[m] ?? 0) + 1));
  }
  if (profile.capacity.effectiveDays >= 4) {
    const lowFreq = majorMuscles.filter((m) => (freq[m] ?? 0) < exp.muscleFrequencyMin);
    validations.push(
      lowFreq.length === 0
        ? `✓ Every major muscle is trained ${exp.muscleFrequencyMin}×+ per week.`
        : `⚠ Trained once/week: ${lowFreq.join(', ')} (split-limited at ${profile.capacity.effectiveDays} days).`
    );
  }

  planReasoning.push({
    rule: 'progression-scheme',
    inputs: { scheme: goal.progressionScheme, goal: goal.label },
  });

  return {
    version: 1,
    templateId: template.id,
    name: `${goal.label} ${template.name} Protocol`,
    type: template.type,
    days,
    reasoning: planReasoning,
    validations,
  };
}
