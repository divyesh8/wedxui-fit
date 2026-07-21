import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth/session';
import { logActivity } from '@/lib/settings/security';

export const runtime = 'nodejs';

/**
 * DELETE /api/settings/history  { scope: 'workouts' | 'progress' | 'all' }
 *
 * Scopes map to the history that actually exists. There is no meal/diet log
 * table — nutrition plans are generated on demand from the profile, never
 * logged — so there is no "diet history" to clear, and no button offering it.
 *
 * ExerciseLog and SetLog are removed by the onDelete: Cascade on WorkoutLog.
 */
const body = z.object({
  scope: z.enum(['workouts', 'progress', 'all']),
});

export async function DELETE(req: Request) {
  const sessionUser = await getSessionUser();
  if (!sessionUser) return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });

  const parsed = body.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Choose what to delete: workouts, progress, or all.' },
      { status: 400 }
    );
  }
  const { scope } = parsed.data;
  const userId = sessionUser.id;

  let workouts = 0;
  let progress = 0;

  if (scope === 'workouts' || scope === 'all') {
    ({ count: workouts } = await prisma.workoutLog.deleteMany({ where: { userId } }));
  }
  if (scope === 'progress' || scope === 'all') {
    ({ count: progress } = await prisma.progressEntry.deleteMany({ where: { userId } }));
  }

  await logActivity(
    userId,
    'HISTORY_DELETED',
    `${scope}: ${workouts} workout(s), ${progress} progress entr(ies)`,
    req
  );

  return NextResponse.json({ scope, deleted: { workouts, progress } });
}
