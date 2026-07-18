/**
 * Dev utility: toggle Pro access for a user until payments wire isPro automatically.
 * Run: npx tsx scripts/set-pro.ts <email> <on|off>
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const [email, state] = process.argv.slice(2);

if (!email || !['on', 'off'].includes(state)) {
  console.error('Usage: npx tsx scripts/set-pro.ts <email> <on|off>');
  process.exit(1);
}

prisma.user
  .update({ where: { email }, data: { isPro: state === 'on' } })
  .then((u) => console.log(`isPro=${u.isPro} for ${u.email}`))
  .catch((e) => {
    console.error(e.message);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
