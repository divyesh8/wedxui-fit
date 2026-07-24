/**
 * End-to-end verification of the Settings feature against a running dev server.
 *
 *   npx tsx scripts/verify-settings.ts
 *
 * Creates a disposable user, mints a real session with the app's own signing
 * code (so no password is ever typed anywhere), exercises every settings API
 * the way the UI does, and deletes the user afterwards.
 *
 * The TOTP step generates codes with otplib — the same algorithm an
 * authenticator app runs — so the 2FA path is verified for real, not stubbed.
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { generateSync } from 'otplib';
import { SignJWT } from 'jose';

const BASE = process.env.VERIFY_BASE_URL ?? 'http://localhost:3000';
const prisma = new PrismaClient();

let passed = 0;
let failed = 0;

function check(label: string, ok: boolean, detail = '') {
  if (ok) {
    passed++;
    console.log(`  PASS  ${label}${detail ? ` — ${detail}` : ''}`);
  } else {
    failed++;
    console.log(`  FAIL  ${label}${detail ? ` — ${detail}` : ''}`);
  }
}

async function main() {
  const stamp = Date.now();
  const email = `settings-e2e-${stamp}@example.test`;

  // ── Setup: disposable user + a real session cookie ──
  const user = await prisma.user.create({
    data: {
      username: `e2e_${stamp}`.slice(0, 20),
      email,
      name: 'Settings E2E',
      password: await bcrypt.hash(`verify-only-${stamp}`, 12),
      emailVerified: new Date(),
    },
  });

  const session = await prisma.authSession.create({
    data: {
      userId: user.id,
      expiresAt: new Date(Date.now() + 86_400_000),
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) Safari/604.1',
      ipAddress: '127.0.0.1',
    },
  });
  // Second session so device revocation has a target that is not "this device".
  const otherSession = await prisma.authSession.create({
    data: {
      userId: user.id,
      expiresAt: new Date(Date.now() + 86_400_000),
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0 Safari/537.36',
      ipAddress: '203.0.113.9',
    },
  });

  const token = await new SignJWT({ sid: session.id })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(user.id)
    .setIssuedAt()
    .setExpirationTime(Math.floor(Date.now() / 1000) + 86_400)
    .sign(new TextEncoder().encode(process.env.JWT_SECRET!));

  const cookie = `wedxui_session=${token}`;
  const api = (path: string, init: RequestInit = {}) =>
    fetch(`${BASE}${path}`, {
      ...init,
      headers: { 'Content-Type': 'application/json', Cookie: cookie, ...(init.headers ?? {}) },
    });

  console.log(`\nSettings E2E — ${email}\n`);

  try {
    // ── 1. GET returns every domain, defaults applied with no rows present ──
    console.log('GET /api/settings');
    const bundle = await (await api('/api/settings')).json();
    const s = bundle.settings;
    check('all domains present',
      ['privacy', 'notifications', 'workout', 'diet', 'ai', 'appearance', 'account', 'security']
        .every((k) => s?.[k] !== undefined));
    check('defaults applied without rows', s.workout.restTimerSec === 90 && s.diet.waterGoalMl === 2500,
      `restTimerSec=${s.workout.restTimerSec}, waterGoalMl=${s.diet.waterGoalMl}`);
    check('no settings rows created by a GET',
      (await prisma.workoutSettings.count({ where: { userId: user.id } })) === 0);

    // ── 2. PATCH persists, and a re-GET reads it back (the "reload" test) ──
    console.log('\nPATCH /api/settings?domain=…');
    const patch = await api('/api/settings?domain=workout', {
      method: 'PATCH',
      body: JSON.stringify({ restTimerSec: 150, trainingDays: ['MON', 'WED', 'FRI'], preferredDuration: 30 }),
    });
    check('workout PATCH accepted', patch.ok, `HTTP ${patch.status}`);
    const reread = (await (await api('/api/settings')).json()).settings;
    check('survives a reload', reread.workout.restTimerSec === 150,
      `restTimerSec=${reread.workout.restTimerSec}`);
    check('written to Postgres',
      (await prisma.workoutSettings.findUnique({ where: { userId: user.id } }))?.restTimerSec === 150);

    await api('/api/settings?domain=diet', {
      method: 'PATCH',
      body: JSON.stringify({ dietType: 'VEGAN', waterGoalMl: 4000, budgetTier: 'budget', mealsPerDay: 5 }),
    });
    await api('/api/settings?domain=appearance', {
      method: 'PATCH',
      body: JSON.stringify({ accentColor: 'blue', fontSize: 'large', compactMode: true }),
    });
    await api('/api/settings?domain=ai', {
      method: 'PATCH',
      body: JSON.stringify({ communicationStyle: 'scientific', personality: 'tough-love' }),
    });
    const afterAll = (await (await api('/api/settings')).json()).settings;
    check('diet persisted', afterAll.diet.dietType === 'VEGAN' && afterAll.diet.waterGoalMl === 4000);
    check('appearance persisted', afterAll.appearance.accentColor === 'blue');
    check('ai persisted', afterAll.ai.communicationStyle === 'scientific');

    // ── 3. Validation actually rejects bad input ──
    console.log('\nValidation');
    const bad = await api('/api/settings?domain=workout', {
      method: 'PATCH',
      body: JSON.stringify({ restTimerSec: 9999 }),
    });
    check('out-of-range value rejected', bad.status === 400, `HTTP ${bad.status}`);
    const badDomain = await api('/api/settings?domain=nope', { method: 'PATCH', body: '{}' });
    check('unknown domain rejected', badDomain.status === 400, `HTTP ${badDomain.status}`);
    const unauth = await fetch(`${BASE}/api/settings`);
    check('unauthenticated GET rejected', unauth.status === 401, `HTTP ${unauth.status}`);

    // ── 4. Password change ──
    console.log('\nPOST /api/settings/password');
    const wrongPw = await api('/api/settings/password', {
      method: 'POST',
      body: JSON.stringify({ currentPassword: 'not-it', newPassword: 'NewPass!2345', confirmPassword: 'NewPass!2345' }),
    });
    check('wrong current password rejected', wrongPw.status === 400);
    const goodPw = await api('/api/settings/password', {
      method: 'POST',
      body: JSON.stringify({
        currentPassword: `verify-only-${stamp}`,
        newPassword: 'NewPass!2345',
        confirmPassword: 'NewPass!2345',
      }),
    });
    check('password changed', goodPw.ok, `HTTP ${goodPw.status}`);
    const rehashed = await prisma.user.findUniqueOrThrow({ where: { id: user.id }, select: { password: true } });
    check('new hash verifies', await bcrypt.compare('NewPass!2345', rehashed.password));

    // ── 5. 2FA enrollment with real TOTP codes ──
    console.log('\nPOST /api/settings/2fa');
    const begin = await (await api('/api/settings/2fa', { method: 'POST', body: '{}' })).json();
    check('QR data URL returned', typeof begin.qrDataUrl === 'string' && begin.qrDataUrl.startsWith('data:image/png'));
    check('secret returned for manual entry', typeof begin.secret === 'string' && begin.secret.length > 0);
    check('not enabled until verified',
      (await prisma.securitySettings.findUnique({ where: { userId: user.id } }))?.twoFactorEnabled === false);
    check('secret encrypted at rest',
      !(await prisma.securitySettings.findUnique({ where: { userId: user.id } }))?.totpSecret?.includes(begin.secret));

    const wrongCode = await api('/api/settings/2fa', { method: 'POST', body: JSON.stringify({ token: '000000' }) });
    check('wrong TOTP rejected', wrongCode.status === 400);

    const realCode = generateSync({ secret: begin.secret });
    const confirmRes = await api('/api/settings/2fa', { method: 'POST', body: JSON.stringify({ token: realCode }) });
    const confirm = await confirmRes.json();
    check('real TOTP accepted', confirmRes.ok, `HTTP ${confirmRes.status}`);
    check('10 recovery codes issued', Array.isArray(confirm.recoveryCodes) && confirm.recoveryCodes.length === 10);
    const secRow = await prisma.securitySettings.findUnique({ where: { userId: user.id } });
    check('2FA enabled in DB', secRow?.twoFactorEnabled === true);
    check('recovery codes stored hashed',
      secRow?.recoveryCodes.every((h) => h.startsWith('$2')) === true &&
      !secRow?.recoveryCodes.includes(confirm.recoveryCodes[0]));

    const regen = await (await api('/api/settings/2fa/recovery-codes', {
      method: 'POST',
      body: JSON.stringify({ password: 'NewPass!2345' }),
    })).json();
    check('codes regenerated', regen.recoveryCodes?.length === 10 &&
      regen.recoveryCodes[0] !== confirm.recoveryCodes[0]);

    // ── 6. Devices ──
    console.log('\nGET/DELETE /api/settings/devices');
    const devices = (await (await api('/api/settings/devices')).json()).devices;
    check('both sessions listed', devices.length === 2, `${devices.length} device(s)`);
    check('current device flagged', devices.filter((d: { current: boolean }) => d.current).length === 1);
    check('UA parsed into a label',
      devices.some((d: { label: string }) => d.label.includes('Safari') || d.label.includes('Chrome')),
      devices.map((d: { label: string }) => d.label).join(' | '));

    const revokeSelf = await api('/api/settings/devices', {
      method: 'DELETE',
      body: JSON.stringify({ sessionId: session.id }),
    });
    check('cannot revoke current device', revokeSelf.status === 400);
    const revoke = await api('/api/settings/devices', {
      method: 'DELETE',
      body: JSON.stringify({ sessionId: otherSession.id }),
    });
    check('other device revoked', revoke.ok);
    check('session row deleted',
      (await prisma.authSession.findUnique({ where: { id: otherSession.id } })) === null);

    // ── 7. Activity log ──
    console.log('\nGET /api/settings/activity');
    const activity = await (await api('/api/settings/activity?page=1&pageSize=50')).json();
    const actions: string[] = activity.entries.map((e: { action: string }) => e.action);
    check('settings updates audited', actions.includes('SETTINGS_UPDATED'));
    check('password change audited', actions.includes('PASSWORD_CHANGED'));
    check('2FA enable audited', actions.includes('TWO_FACTOR_ENABLED'));
    check('device revocation audited', actions.includes('DEVICE_REVOKED'));

    // ── 8. Export ──
    console.log('\nGET /api/settings/export');
    const exportRes = await api('/api/settings/export');
    const exportBody = await exportRes.json();
    check('served as a download',
      exportRes.headers.get('content-disposition')?.includes('attachment') === true);
    check('contains the user and their settings',
      exportBody.user?.email === email && exportBody.settings?.workout?.restTimerSec === 150);
    check('no password hash in export', !JSON.stringify(exportBody).includes(rehashed.password));
    check('no TOTP secret in export', !JSON.stringify(exportBody).includes(begin.secret));

    // ── 9. Account deletion request + cancel ──
    console.log('\nPOST/DELETE /api/settings/account');
    const noConfirm = await api('/api/settings/account', {
      method: 'POST',
      body: JSON.stringify({ password: 'NewPass!2345', confirmText: 'delete' }),
    });
    check('requires the exact DELETE confirmation', noConfirm.status === 400);
    const del = await (await api('/api/settings/account', {
      method: 'POST',
      body: JSON.stringify({ password: 'NewPass!2345', confirmText: 'DELETE' }),
    })).json();
    const days = Math.round((new Date(del.scheduledFor).getTime() - Date.now()) / 86_400_000);
    check('scheduled 30 days out', del.pending === true && days === 30, `${days} days`);
    const cancel = await api('/api/settings/account', { method: 'DELETE' });
    check('cancellable', cancel.ok);
    check('cancellation recorded',
      (await prisma.deleteAccountRequest.findUnique({ where: { userId: user.id } }))?.cancelledAt !== null);

    // ── 10. History deletion ──
    console.log('\nDELETE /api/settings/history');
    await prisma.progressEntry.create({
      data: { userId: user.id, date: new Date(), weightKg: 70 },
    });
    const hist = await (await api('/api/settings/history', {
      method: 'DELETE',
      body: JSON.stringify({ scope: 'progress' }),
    })).json();
    check('progress history cleared', hist.deleted.progress === 1, `${hist.deleted.progress} deleted`);
  } finally {
    // Cascade removes settings, sessions, activity, and deletion requests.
    await prisma.user.delete({ where: { id: user.id } }).catch(() => {});
  }

  console.log(`\n${passed} passed, ${failed} failed\n`);
  if (failed > 0) process.exitCode = 1;
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
