import { Resend } from 'resend';

/**
 * Send the 6-digit verification code.
 * - In development the code is logged to the server console so the flow is
 *   testable without an inbox.
 * - If OTP_DEV_MODE=true, the code is logged and NO email is sent (useful for
 *   local/staging testing).
 * - Otherwise a real email is sent via Resend. Any failure THROWS so the caller
 *   can surface it — we never pretend an email was sent when it wasn't.
 */
export async function sendOtpEmail(to: string, code: string, username: string): Promise<void> {
  if (process.env.NODE_ENV !== 'production') {
    console.log(`\n[WEDXUI OTP] ${to} -> ${code}\n`);
  }

  if (process.env.OTP_DEV_MODE === 'true') {
    console.log(`[WEDXUI OTP dev-mode] code for ${to}: ${code}`);
    return;
  }

  if (!process.env.RESEND_API_KEY) {
    throw new Error('RESEND_API_KEY is not set — the verification email cannot be sent.');
  }

  const resend = new Resend(process.env.RESEND_API_KEY);
  const from = process.env.EMAIL_FROM ?? 'WEDXUI Fit <onboarding@resend.dev>';

  const { error } = await resend.emails.send({
    from,
    to,
    subject: 'Your WEDXUI Fit verification code',
    html: `
      <div style="font-family:-apple-system,system-ui,sans-serif;background:#0a0a0f;color:#fff;padding:40px;border-radius:16px;max-width:480px;margin:auto;">
        <h1 style="color:#b026ff;margin:0 0 8px;">WEDXUI Fit</h1>
        <p style="color:#a1a1aa;">Hey ${username}, welcome. Enter this code to verify your email:</p>
        <div style="font-size:36px;font-weight:900;letter-spacing:10px;color:#ccff00;margin:24px 0;">${code}</div>
        <p style="color:#71717a;font-size:13px;">This code expires in ${process.env.OTP_TTL_MINUTES ?? '5'} minutes. If you didn't sign up, ignore this email.</p>
      </div>`,
  });

  if (error) {
    // Resend returns errors in the response object rather than throwing.
    console.error('[WEDXUI OTP] Resend send failed:', JSON.stringify(error));
    throw new Error(`Verification email failed: ${error.message ?? 'unknown Resend error'}`);
  }
}
