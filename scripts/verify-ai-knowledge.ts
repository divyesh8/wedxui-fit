/**
 * Integrity check for the AI knowledge base. Fails (exit 1) if the knowledge
 * graph has dangling references or unfillable template slots.
 * Run: npx tsx scripts/verify-ai-knowledge.ts
 */
import { exercises } from '../src/data/exercises';
import { exerciseMeta } from '../src/data/knowledge/exercise-meta';
import { physiques } from '../src/data/knowledge/physiques';
import { trainingStyles } from '../src/data/knowledge/training-styles';
import { splitTemplates } from '../src/data/knowledge/templates';
import { experienceProfiles, goalProfiles } from '../src/data/knowledge/volume-landmarks';
import { foodHabits, proteinSources, inferBudgetTier } from '../src/data/knowledge/nutrition-knowledge';

const errors: string[] = [];
const exerciseIds = new Set(exercises.map((e) => e.id));

// 1. Every exercise has meta; every meta key is a real exercise.
for (const ex of exercises) {
  if (!exerciseMeta[ex.id]) errors.push(`missing meta for exercise '${ex.id}'`);
}
for (const id of Object.keys(exerciseMeta)) {
  if (!exerciseIds.has(id)) errors.push(`meta references unknown exercise '${id}'`);
}

// 2. Progression chains and substitutions only reference real exercises.
for (const [id, meta] of Object.entries(exerciseMeta)) {
  for (const ref of meta.progressionChain ?? []) {
    if (!exerciseIds.has(ref)) errors.push(`'${id}' progressionChain → unknown '${ref}'`);
  }
  for (const ref of meta.substitutions) {
    if (!exerciseIds.has(ref)) errors.push(`'${id}' substitutions → unknown '${ref}'`);
  }
}

// 3. Every template slot must be fillable by at least one exercise using only
//    bodyweight+bar equipment (the most restrictive realistic equipment set).
const minimalEquipment = new Set(['NONE', 'PULLUP_BAR']);
for (const template of splitTemplates) {
  const bodyweightTemplate = template.styles.includes('calisthenics');
  for (const day of template.days) {
    for (const slot of day.slots) {
      const candidates = exercises.filter((ex) => {
        const meta = exerciseMeta[ex.id];
        if (!meta) return false;
        const matches = slot.kind === 'pattern' ? meta.movementPattern === slot.value : meta.skillFocus === slot.value;
        if (!matches) return false;
        if (!bodyweightTemplate) return true; // gym templates assume at least some equipment; checked loosely
        return ex.equipment.some((e) => minimalEquipment.has(e));
      });
      if (candidates.length === 0) {
        errors.push(`${template.id}/${day.name}: slot ${slot.kind}:${slot.value} has NO candidates${bodyweightTemplate ? ' (bodyweight+bar)' : ''}`);
      }
    }
  }
}

// 4. Physique/style/goal/experience/nutrition table sanity.
if (physiques.length !== 11) errors.push(`expected 11 physiques, got ${physiques.length}`);
if (trainingStyles.length !== 8) errors.push(`expected 8 training styles, got ${trainingStyles.length}`);
if (Object.keys(goalProfiles).length !== 9) errors.push(`expected 9 goals, got ${Object.keys(goalProfiles).length}`);
if (Object.keys(experienceProfiles).length !== 5) errors.push(`expected 5 experience tiers`);
if (foodHabits.length !== 11) errors.push(`expected 11 food habits, got ${foodHabits.length}`);
if (proteinSources.length < 8) errors.push(`too few protein sources`);

// 5. Budget inference spot checks (spec: student + eggs + home-cooked → budget).
const studentTier = inferBudgetTier(['home-cooked', 'egg-based'], ['eggs', 'chicken']);
if (studentTier !== 'budget') errors.push(`student case inferred '${studentTier}', expected 'budget'`);
const premiumTier = inferBudgetTier(['athlete-focused', 'high-protein'], ['whey', 'red-meat']);
if (premiumTier !== 'premium') errors.push(`premium case inferred '${premiumTier}', expected 'premium'`);

if (errors.length > 0) {
  console.error(`✗ Knowledge base FAILED (${errors.length} problems):`);
  for (const e of errors) console.error('  - ' + e);
  process.exit(1);
}
console.log(`✓ Knowledge base OK: ${exercises.length} exercises with meta, ${splitTemplates.length} templates, all slots fillable, budget inference correct.`);
