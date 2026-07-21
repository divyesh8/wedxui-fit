import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth/session';
import { getSettingsBundle } from '@/lib/settings/service';
import { logActivity } from '@/lib/settings/security';
import {
  settingsSchemas,
  isSettingsDomain,
  DOMAIN_MODEL,
  SETTINGS_DOMAINS,
} from '@/lib/validations/settings';

export const runtime = 'nodejs';

export async function GET() {
  const sessionUser = await getSessionUser();
  if (!sessionUser) return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });

  const settings = await getSettingsBundle(sessionUser.id);
  return NextResponse.json({ settings });
}

/**
 * PATCH /api/settings?domain=workout
 *
 * Partial by design — the UI autosaves one field at a time, so the body carries
 * only what changed. The parsed object is upserted directly; Zod has already
 * stripped anything that is not a real column for that domain.
 */
export async function PATCH(req: Request) {
  const sessionUser = await getSessionUser();
  if (!sessionUser) return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });

  const domain = new URL(req.url).searchParams.get('domain');
  if (!isSettingsDomain(domain)) {
    return NextResponse.json(
      { error: `Unknown settings domain. Expected one of: ${SETTINGS_DOMAINS.join(', ')}.` },
      { status: 400 }
    );
  }

  const parsed = settingsSchemas[domain].partial().safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return NextResponse.json({ error: issue.message, field: issue.path[0] }, { status: 400 });
  }
  const data = parsed.data;
  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: 'No recognised settings in request body.' }, { status: 400 });
  }

  // DOMAIN_MODEL maps the domain to its Prisma delegate. The delegates have
  // different generated types, so this one access is cast; `data` is already
  // schema-validated for exactly this domain, which is what makes it safe.
  const delegate = prisma[DOMAIN_MODEL[domain]] as unknown as {
    upsert(args: {
      where: { userId: string };
      create: Record<string, unknown>;
      update: Record<string, unknown>;
    }): Promise<Record<string, unknown>>;
  };

  const row = await delegate.upsert({
    where: { userId: sessionUser.id },
    create: { userId: sessionUser.id, ...data },
    update: data,
  });

  await logActivity(
    sessionUser.id,
    'SETTINGS_UPDATED',
    `${domain}: ${Object.keys(data).join(', ')}`,
    req
  );

  const { id: _id, userId: _userId, createdAt: _c, updatedAt: _u, ...settings } = row;
  return NextResponse.json({ domain, settings });
}
