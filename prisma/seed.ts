import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Matches the 3 achievements already shown (as a hardcoded locked list) on the
// dashboard. `condition` is JSON parsed by the workout-completion transaction:
// { metric: 'totalWorkouts' | 'streakDays', gte: number }.
const achievements = [
  {
    name: 'First Blood',
    description: 'Complete your first workout',
    icon: '🩸',
    category: 'consistency',
    condition: JSON.stringify({ metric: 'totalWorkouts', gte: 1 }),
    xpReward: 25,
  },
  {
    name: 'Week Warrior',
    description: 'Reach a 7-day streak',
    icon: '🔥',
    category: 'streak',
    condition: JSON.stringify({ metric: 'streakDays', gte: 7 }),
    xpReward: 100,
  },
  {
    name: 'Centurion',
    description: 'Log 100 workouts',
    icon: '💯',
    category: 'consistency',
    condition: JSON.stringify({ metric: 'totalWorkouts', gte: 100 }),
    xpReward: 500,
  },
];

async function main() {
  let created = 0;
  for (const a of achievements) {
    const existing = await prisma.achievement.findFirst({ where: { name: a.name } });
    if (existing) {
      await prisma.achievement.update({ where: { id: existing.id }, data: a });
    } else {
      await prisma.achievement.create({ data: a });
      created++;
    }
  }
  console.log(`Seeded ${achievements.length} achievements (${created} newly created).`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
