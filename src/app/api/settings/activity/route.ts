import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth/session';

export const runtime = 'nodejs';

const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 100;

/** GET /api/settings/activity?page=1&pageSize=20 */
export async function GET(req: Request) {
  const sessionUser = await getSessionUser();
  if (!sessionUser) return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });

  const params = new URL(req.url).searchParams;
  const page = Math.max(1, parseInt(params.get('page') ?? '1', 10) || 1);
  const pageSize = Math.min(
    MAX_PAGE_SIZE,
    Math.max(1, parseInt(params.get('pageSize') ?? String(DEFAULT_PAGE_SIZE), 10) || DEFAULT_PAGE_SIZE)
  );

  const [entries, total] = await Promise.all([
    prisma.activityLog.findMany({
      where: { userId: sessionUser.id },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: { id: true, action: true, detail: true, ipAddress: true, createdAt: true },
    }),
    prisma.activityLog.count({ where: { userId: sessionUser.id } }),
  ]);

  return NextResponse.json({
    entries,
    page,
    pageSize,
    total,
    hasMore: page * pageSize < total,
  });
}
