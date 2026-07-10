import Link from 'next/link';
import type { Metadata } from 'next';
import { AuthForm } from '@/components/auth/auth-form';

export const metadata: Metadata = {
  title: 'Login — WEDXUI Fit',
  description: 'Log in to WEDXUI Fit and continue your transformation arc.',
};

export default function LoginPage() {
  return (
    <main className="relative min-h-screen bg-wed-black noise-bg flex flex-col items-center justify-center px-4 py-12">
      <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-wed-purple/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[350px] h-[350px] bg-wed-blue/10 rounded-full blur-[100px] pointer-events-none" />

      <Link href="/" className="mb-8 text-2xl font-black tracking-tight relative z-10">
        <span className="text-white">WED</span>
        <span className="text-wed-purple">XUI</span>
        <span className="text-white font-light"> Fit</span>
      </Link>

      <div className="relative z-10 w-full flex justify-center">
        <AuthForm mode="login" />
      </div>
    </main>
  );
}
