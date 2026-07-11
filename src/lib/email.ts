import { Resend } from 'resend';

/**
 * Send the 6-digit verification code. In development the code is also logged to
 * the server console so the flow is testable without opening an inbox. If
 * OTP_DEV_MODE=true (or no RESEND_API_KEY), it only logs and does not email.
 */
export async function sendOtpEmail(to: string, code: string, username: string): Promise<void> {
  if (process.env.NODE_ENV !== 'production') {
    console.log(`\n[WEDXUI OTP] ${to} -> ${code}\n`);
  }

  const devMode = process.env.OTP_DEV_MODE === 'true' || !process.env.RESEND_API_KEY;
  if (devMode) return;

  const resend = new Resend(process.env.RESEND_API_KEY);
  const from = process.env.EMAIL_FROM ?? 'WEDXUI Fit <onboarding@resend.dev>';
  await resend.emails.send({
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
}
