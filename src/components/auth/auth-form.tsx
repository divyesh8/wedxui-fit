'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Loader2, Zap, ArrowLeft, MailCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store';

interface Props {
  mode: 'login' | 'signup';
}

async function postJson(url: string, payload: object) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await res.json().catch(() => ({}));
  return { res, data } as { res: Response; data: Record<string, unknown> };
}

export function AuthForm({ mode }: Props) {
  const router = useRouter();
  const refresh = useAuthStore((s) => s.refresh);

  const isSignup = mode === 'signup';
  const [view, setView] = useState<'form' | 'otp'>('form');

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [code, setCode] = useState('');
  const [devCode, setDevCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const inputClass =
    'w-full h-12 px-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-wed-gray-500 focus:border-wed-purple focus:outline-none transition-colors';

  async function submitForm(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);

    if (isSignup) {
      if (username.trim().length < 3) return setError('Username must be at least 3 characters.');
      if (password.length < 8) return setError('Password must be at least 8 characters.');
      if (password !== confirm) return setError('Passwords do not match.');
    } else if (!password) {
      return setError('Enter your password.');
    }

    setSubmitting(true);
    if (isSignup) {
      const { res, data } = await postJson('/api/auth/register', { username, email, password, confirmPassword: confirm });
      setSubmitting(false);
      if (!res.ok) return setError((data.error as string) ?? 'Something went wrong.');
      if (data.devCode) setDevCode(String(data.devCode));
      setInfo(`We sent a 6-digit code to ${email}.`);
      setView('otp');
    } else {
      const { res, data } = await postJson('/api/auth/login', { email, password });
      setSubmitting(false);
      if (res.status === 403 && data.needsVerification) {
        await postJson('/api/auth/resend-otp', { email });
        setInfo('Please verify your email — we sent you a fresh code.');
        setView('otp');
        return;
      }
      if (!res.ok) return setError((data.error as string) ?? 'Invalid email or password.');
      await refresh();
      router.replace('/dashboard');
    }
  }

  async function submitOtp(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!/^\d{6}$/.test(code)) return setError('Enter the 6-digit code.');
    setSubmitting(true);
    const { res, data } = await postJson('/api/auth/verify-otp', { email, code });
    setSubmitting(false);
    if (!res.ok) return setError((data.error as string) ?? 'Invalid code.');
    await refresh();
    // A freshly verified account has no profile yet → go to onboarding.
    router.replace('/onboarding');
  }

  async function resend() {
    setError(null);
    setInfo(null);
    const { data } = await postJson('/api/auth/resend-otp', { email });
    if (data.devCode) setDevCode(String(data.devCode));
    setInfo('A new code is on the way.');
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="glass-strong rounded-3xl p-8 w-full max-w-md"
    >
      {view === 'otp' ? (
        <>
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-wed-lime/15 mb-4">
              <MailCheck className="w-6 h-6 text-wed-lime" />
            </div>
            <h1 className="text-2xl font-black text-white">Verify Your Email</h1>
            <p className="text-sm text-wed-gray-400 mt-2">
              Enter the 6-digit code we sent to <span className="text-white">{email}</span>.
            </p>
          </div>

          <form onSubmit={submitOtp} className="space-y-4">
            <input
              inputMode="numeric"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
              placeholder="000000"
              autoComplete="one-time-code"
              className={cn(inputClass, 'text-center text-2xl tracking-[0.5em] font-bold')}
            />

            {devCode && (
              <p className="text-xs text-wed-gray-500 text-center">
                Dev mode — your code is <span className="text-wed-lime font-mono">{devCode}</span>
              </p>
            )}
            {info && <p className="text-sm text-wed-lime bg-wed-lime/10 border border-wed-lime/20 rounded-xl px-4 py-3">{info}</p>}
            {error && <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">{error}</p>}

            <button
              type="submit"
              disabled={submitting}
              className="w-full h-12 rounded-xl bg-gradient-purple text-white font-bold hover:brightness-110 transition-all btn-glow disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
              Verify & Continue
            </button>
          </form>

          <div className="flex items-center justify-between mt-6 text-sm">
            <button onClick={() => setView('form')} className="flex items-center gap-1 text-wed-gray-400 hover:text-white transition-colors">
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
            <button onClick={resend} className="text-wed-purple hover:brightness-125 font-semibold">
              Resend code
            </button>
          </div>
        </>
      ) : (
        <>
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-wed-purple/15 mb-4">
              <Zap className="w-6 h-6 text-wed-purple" />
            </div>
            <h1 className="text-2xl font-black text-white">
              {isSignup ? 'Begin Your Arc' : 'Welcome Back, Warrior'}
            </h1>
            <p className="text-sm text-wed-gray-400 mt-2">
              {isSignup ? 'Every legend has a first episode. This is yours.' : 'Your training continues where you left off.'}
            </p>
          </div>

          <form onSubmit={submitForm} className="space-y-4" noValidate>
            {isSignup && (
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-wed-gray-200 mb-1.5">Username</label>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="your_hero_name"
                  autoComplete="username"
                  className={inputClass}
                />
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-wed-gray-200 mb-1.5">Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
                className={inputClass}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-wed-gray-200 mb-1.5">Password</label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={isSignup ? 'At least 8 characters' : 'Your password'}
                  autoComplete={isSignup ? 'new-password' : 'current-password'}
                  className={cn(inputClass, 'pr-12')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-wed-gray-400 hover:text-white transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {isSignup && (
              <div>
                <label htmlFor="confirm" className="block text-sm font-medium text-wed-gray-200 mb-1.5">Confirm Password</label>
                <input
                  id="confirm"
                  type={showPassword ? 'text' : 'password'}
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder="Repeat your password"
                  autoComplete="new-password"
                  className={inputClass}
                />
              </div>
            )}

            {info && <p className="text-sm text-wed-lime bg-wed-lime/10 border border-wed-lime/20 rounded-xl px-4 py-3">{info}</p>}
            {error && <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">{error}</p>}

            <button
              type="submit"
              disabled={submitting}
              className="w-full h-12 rounded-xl bg-gradient-purple text-white font-bold hover:brightness-110 transition-all btn-glow disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
              {isSignup ? 'Create Account' : 'Enter the Dashboard'}
            </button>
          </form>

          <p className="text-sm text-wed-gray-400 text-center mt-6">
            {isSignup ? (
              <>Already have an account?{' '}
                <Link href="/login" className="text-wed-purple hover:brightness-125 font-semibold">Log in</Link>
              </>
            ) : (
              <>New here?{' '}
                <Link href="/signup" className="text-wed-purple hover:brightness-125 font-semibold">Create your account</Link>
              </>
            )}
          </p>
        </>
      )}
    </motion.div>
  );
}
