import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth/session';

export const runtime = 'nodejs';

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const sessionUser = await getSessionUser();
  if (!sessionUser) return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });

  await prisma.progressEntry.deleteMany({ where: { id: params.id, userId: sessionUser.id } });
  return NextResponse.json({ ok: true });
}
