import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNumber(num: number, digits = 1): string {
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(digits) + 'M';
  if (num >= 1_000) return (num / 1_000).toFixed(digits) + 'K';
  return num.toString();
}

export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function calculateXPForLevel(level: number): number {
  return Math.floor(100 * Math.pow(1.15, level - 1));
}

export function calculateLevelFromXP(xp: number): number {
  let level = 1;
  let xpNeeded = 100;
  let totalXP = 0;
  
  while (totalXP + xpNeeded <= xp) {
    totalXP += xpNeeded;
    level++;
    xpNeeded = calculateXPForLevel(level);
  }
  
  return level;
}

export function getRankFromLevel(level: number): { name: string; icon: string } {
  const ranks = [
    { threshold: 1, name: 'Beginner', icon: '🌱' },
    { threshold: 5, name: 'Disciplined', icon: '🛡️' },
    { threshold: 10, name: 'Iron Mind', icon: '⚔️' },
    { threshold: 20, name: 'Relentless', icon: '🔥' },
    { threshold: 35, name: 'Beast Mode', icon: '🐺' },
    { threshold: 50, name: 'Elite', icon: '👑' },
    { threshold: 75, name: 'Legend', icon: '⭐' },
  ];
  
  for (let i = ranks.length - 1; i >= 0; i--) {
    if (level >= ranks[i].threshold) return ranks[i];
  }
  return ranks[0];
}

export function calculateBMI(weightKg: number, heightCm: number): number {
  const heightM = heightCm / 100;
  return weightKg / (heightM * heightM);
}

export function getBMICategory(bmi: number): string {
  if (bmi < 18.5) return 'Underweight';
  if (bmi < 25) return 'Normal';
  if (bmi < 30) return 'Overweight';
  return 'Obese';
}

export function calculateBMR(weightKg: number, heightCm: number, age: number, gender: Gender): number {
  if (gender === 'FEMALE') {
    return 447.593 + 9.247 * weightKg + 3.098 * heightCm - 4.33 * age;
  }
  return 88.362 + 13.397 * weightKg + 4.799 * heightCm - 5.677 * age;
}

/**
 * Mifflin–St Jeor BMR — preferred over Harris–Benedict for accuracy.
 * Men: 10W + 6.25H − 5A + 5 · Women: 10W + 6.25H − 5A − 161 · OTHER: midpoint (−78).
 */
export function calculateBMRMifflin(weightKg: number, heightCm: number, age: number, gender: Gender): number {
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  if (gender === 'MALE') return base + 5;
  if (gender === 'FEMALE') return base - 161;
  return base - 78;
}

export function calculateTDEE(bmr: number, activityMultiplier: number): number {
  return bmr * activityMultiplier;
}

export function calculateOneRepMax(weightKg: number, reps: number): number {
  // Epley formula
  return weightKg * (1 + reps / 30);
}

export function calculateBodyFatMale(waistCm: number, neckCm: number, heightCm: number): number {
  return 495 / (1.0324 - 0.19077 * Math.log10(waistCm - neckCm) + 0.15456 * Math.log10(heightCm)) - 450;
}

export function calculateBodyFatFemale(waistCm: number, neckCm: number, heightCm: number, hipCm: number): number {
  return 495 / (1.29579 - 0.35004 * Math.log10(waistCm + hipCm - neckCm) + 0.221 * Math.log10(heightCm)) - 450;
}

export type Gender = 'MALE' | 'FEMALE' | 'OTHER';
