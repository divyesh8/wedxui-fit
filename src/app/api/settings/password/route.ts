import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth/session';
import { hashPassword, verifyPassword } from '@/lib/auth/password';
import { passwordChangeSchema } from '@/lib/validations/settings';
import { logActivity } from '@/lib/settings/security';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  const sessionUser = await getSessionUser();
  if (!sessionUser) return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });

  const parsed = passwordChangeSchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return NextResponse.json({ error: issue.message, field: issue.path[0] }, { status: 400 });
  }
  const { currentPassword, newPassword } = parsed.data;

  const user = await prisma.user.findUniqueOrThrow({
    where: { id: sessionUser.id },
    select: { password: true },
  });

  if (!(await verifyPassword(currentPassword, user.password))) {
    // Being vague about which field is wrong is not useful here — the user is
    // already authenticated, so naming the field is safe and kinder.
    return NextResponse.json(
      { error: 'Current password is incorrect.', field: 'currentPassword' },
      { status: 400 }
    );
  }

  const hashed = await hashPassword(newPassword);
  await prisma.$transaction([
    prisma.user.update({ where: { id: sessionUser.id }, data: { password: hashed } }),
    prisma.securitySettings.upsert({
      where: { userId: sessionUser.id },
      create: { userId: sessionUser.id, lastPasswordChange: new Date() },
      update: { lastPasswordChange: new Date() },
    }),
  ]);

  await logActivity(sessionUser.id, 'PASSWORD_CHANGED', undefined, req);

  return NextResponse.json({ ok: true });
}
