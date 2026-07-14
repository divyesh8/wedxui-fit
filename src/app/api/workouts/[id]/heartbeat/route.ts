import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth/session';

export const runtime = 'nodejs';

const bodySchema = z.object({ activeSeconds: z.number().int().min(0).max(6 * 60 * 60) });

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const sessionUser = await getSessionUser();
  if (!sessionUser) return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });

  const parsed = bodySchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: 'Invalid activeSeconds.' }, { status: 400 });

  const session = await prisma.workoutLog.findUnique({ where: { id: params.id } });
  if (!session || session.userId !== sessionUser.id) {
    return NextResponse.json({ error: 'Session not found.' }, { status: 404 });
  }
  if (session.completedAt) {
    return NextResponse.json({ error: 'Session already completed.' }, { status: 409 });
  }

  const updated = await prisma.workoutLog.update({
    where: { id: params.id },
    data: { activeSeconds: parsed.data.activeSeconds },
  });

  return NextResponse.json({ activeSeconds: updated.activeSeconds });
}
