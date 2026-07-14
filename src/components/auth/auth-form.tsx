'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Loader2, Zap } from 'lucide-react';
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

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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
      await refresh();
      // A freshly created account has no profile yet → go to onboarding.
      router.replace('/onboarding');
    } else {
      const { res, data } = await postJson('/api/auth/login', { email, password });
      setSubmitting(false);
      if (!res.ok) return setError((data.error as string) ?? 'Invalid email or password.');
      await refresh();
      router.replace('/dashboard');
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="glass-strong rounded-3xl p-8 w-full max-w-md"
    >
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
    </motion.div>
  );
}
