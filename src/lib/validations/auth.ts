import { z } from 'zod';

export const registerSchema = z
  .object({
    username: z
      .string()
      .trim()
      .min(3, 'Username must be at least 3 characters')
      .max(20, 'Username must be 20 characters or fewer')
      .regex(/^[a-zA-Z0-9_]+$/, 'Letters, numbers, and underscores only'),
    email: z.string().trim().toLowerCase().email('Enter a valid email'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords do not match',
  });

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email('Enter a valid email'),
  password: z.string().min(1, 'Enter your password'),
});

export const otpSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  code: z.string().regex(/^\d{6}$/, 'Enter the 6-digit code'),
});

export const emailSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
});
