'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Loader2, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface Props {
  mode: 'login' | 'signup';
}

export function AuthForm({ mode }: Props) {
  const router = useRouter();
  const { register, login } = useAuthStore();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const isSignup = mode === 'signup';

  const validate = (): string | null => {
    if (isSignup && name.trim().length < 2) return 'Tell us your name (at least 2 characters).';
    if (!EMAIL_RE.test(email)) return 'Enter a valid email address.';
    if (password.length < 6) return 'Password must be at least 6 characters.';
    if (isSignup && password !== confirm) return 'Passwords do not match.';
    return null;
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }
    setError(null);
    setSubmitting(true);
    const result = isSignup ? await register(name, email, password) : await login(email, password);
    if (result) {
      setError(result);
      setSubmitting(false);
      return;
    }
    router.push(isSignup ? '/dashboard/onboarding' : '/dashboard');
  };

  const inputClass =
    'w-full h-12 px-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-wed-gray-500 focus:border-wed-purple focus:outline-none transition-colors';

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="glass-strong rounded-3xl p-8 w-full max-w-md"
    >
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-wed-purple/15 mb-4">
          <Zap className="w-6 h-6 text-wed-purple" />
        </div>
        <h1 className="text-2xl font-black text-white">
          {isSignup ? 'Begin Your Arc' : 'Welcome Back, Warrior'}
        </h1>
        <p className="text-sm text-wed-gray-400 mt-2">
          {isSignup
            ? 'Every legend has a first episode. This is yours.'
            : 'Your training continues where you left off.'}
        </p>
      </div>

      <form onSubmit={submit} className="space-y-4" noValidate>
        {isSignup && (
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-wed-gray-200 mb-1.5">
              Name
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your hero name"
              autoComplete="name"
              className={inputClass}
            />
          </div>
        )}

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-wed-gray-200 mb-1.5">
            Email
          </label>
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
          <label htmlFor="password" className="block text-sm font-medium text-wed-gray-200 mb-1.5">
            Password
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={isSignup ? 'At least 6 characters' : 'Your password'}
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
            <label htmlFor="confirm" className="block text-sm font-medium text-wed-gray-200 mb-1.5">
              Confirm Password
            </label>
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

        {error && (
          <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full h-12 rounded-xl bg-gradient-purple text-white font-bold hover:brightness-110 transition-all btn-glow disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
          {isSignup ? 'Start My Journey' : 'Enter the Dashboard'}
        </button>
      </form>

      <p className="text-sm text-wed-gray-400 text-center mt-6">
        {isSignup ? (
          <>
            Already have an account?{' '}
            <Link href="/login" className="text-wed-purple hover:brightness-125 font-semibold">
              Log in
            </Link>
          </>
        ) : (
          <>
            New here?{' '}
            <Link href="/signup" className="text-wed-purple hover:brightness-125 font-semibold">
              Create your account
            </Link>
          </>
        )}
      </p>
    </motion.div>
  );
}
