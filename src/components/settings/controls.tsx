'use client';

import { Check, Minus, Plus } from 'lucide-react';
// Import from the zod-free constants module — pulling this from
// validations/settings would drag all of zod into the client bundle.
import { passwordStrength } from '@/lib/settings/constants';

/**
 * Settings control primitives.
 *
 * Every interactive element is at least 44px on its smallest axis (WCAG 2.2
 * target size), which is why the toggles and chips look chunkier than a desktop
 * design would call for — this page is used on a phone first.
 *
 * The accent comes from --wed-accent-rgb (see globals.css) rather than a fixed
 * hex, so the appearance settings can recolour the whole page live.
 */

export function SettingsSection({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-white/10 bg-wed-surface/60 backdrop-blur-xl overflow-hidden">
      <header className="px-4 pt-4 pb-3 sm:px-6 sm:pt-6">
        <h2 className="text-base sm:text-lg font-bold text-white">{title}</h2>
        {description && <p className="mt-1 text-sm text-wed-gray-500">{description}</p>}
      </header>
      <div className="divide-y divide-white/5">{children}</div>
    </section>
  );
}

export function SettingRow({
  label,
  description,
  htmlFor,
  children,
  stacked = false,
}: {
  label: string;
  description?: string;
  htmlFor?: string;
  children: React.ReactNode;
  /** Put the control on its own line — for chips, sliders, and long selects. */
  stacked?: boolean;
}) {
  return (
    <div
      className={`px-4 py-3 sm:px-6 sm:py-4 ${
        stacked ? '' : 'flex items-center justify-between gap-4'
      }`}
    >
      <div className={stacked ? 'mb-3' : 'min-w-0 flex-1'}>
        <label htmlFor={htmlFor} className="block text-sm font-medium text-white">
          {label}
        </label>
        {description && <p className="mt-0.5 text-xs text-wed-gray-500">{description}</p>}
      </div>
      <div className={stacked ? '' : 'shrink-0'}>{children}</div>
    </div>
  );
}

export function Toggle({
  id,
  checked,
  onChange,
  label,
  disabled = false,
}: {
  id: string;
  checked: boolean;
  onChange: (next: boolean) => void;
  /** Accessible name — the visible <label> is in SettingRow, so link via id. */
  label: string;
  disabled?: boolean;
}) {
  return (
    <button
      id={id}
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      // 44px tap target via padding; the visible track is smaller.
      className="relative inline-flex h-11 w-[60px] items-center justify-center disabled:opacity-40"
    >
      <span
        className={`block h-7 w-[52px] rounded-full transition-colors duration-200 ${
          checked ? 'bg-[rgb(var(--wed-accent-rgb))]' : 'bg-white/15'
        }`}
      />
      <span
        className={`absolute top-1/2 h-5 w-5 -translate-y-1/2 rounded-full bg-white shadow transition-all duration-200 ${
          checked ? 'left-[36px]' : 'left-[8px]'
        }`}
      />
    </button>
  );
}

export function Segmented<T extends string | number>({
  value,
  options,
  onChange,
  label,
}: {
  value: T;
  options: { value: T; label: string }[];
  onChange: (next: T) => void;
  label: string;
}) {
  return (
    <div
      role="radiogroup"
      aria-label={label}
      className="flex flex-wrap gap-1.5 rounded-xl bg-black/40 p-1.5"
    >
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={String(opt.value)}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(opt.value)}
            className={`min-h-[38px] flex-1 rounded-lg px-3 text-sm font-medium transition-colors ${
              active
                ? 'bg-[rgb(var(--wed-accent-rgb))] text-white'
                : 'text-wed-gray-300 hover:bg-white/5'
            }`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

export function Stepper({
  id,
  value,
  onChange,
  min,
  max,
  step = 1,
  unit,
  label,
}: {
  id: string;
  value: number;
  onChange: (next: number) => void;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  label: string;
}) {
  const clamp = (n: number) => Math.max(min, Math.min(max, n));
  return (
    <div className="flex items-center gap-1">
      <button
        type="button"
        aria-label={`Decrease ${label}`}
        disabled={value <= min}
        onClick={() => onChange(clamp(value - step))}
        className="flex h-11 w-11 items-center justify-center rounded-lg bg-white/5 text-white hover:bg-white/10 disabled:opacity-30"
      >
        <Minus className="h-4 w-4" />
      </button>
      <output
        id={id}
        aria-label={label}
        className="min-w-[76px] text-center font-mono text-sm font-semibold text-white tabular-nums"
      >
        {value}
        {unit && <span className="ml-0.5 text-xs text-wed-gray-500">{unit}</span>}
      </output>
      <button
        type="button"
        aria-label={`Increase ${label}`}
        disabled={value >= max}
        onClick={() => onChange(clamp(value + step))}
        className="flex h-11 w-11 items-center justify-center rounded-lg bg-white/5 text-white hover:bg-white/10 disabled:opacity-30"
      >
        <Plus className="h-4 w-4" />
      </button>
    </div>
  );
}

export function ChipSelect<T extends string>({
  values,
  options,
  onChange,
  label,
}: {
  values: T[];
  options: { value: T; label: string }[];
  onChange: (next: T[]) => void;
  label: string;
}) {
  const toggle = (v: T) =>
    onChange(values.includes(v) ? values.filter((x) => x !== v) : [...values, v]);

  return (
    <div role="group" aria-label={label} className="flex flex-wrap gap-2">
      {options.map((opt) => {
        const active = values.includes(opt.value);
        return (
          <button
            key={opt.value}
            type="button"
            aria-pressed={active}
            onClick={() => toggle(opt.value)}
            className={`inline-flex min-h-[44px] items-center gap-1.5 rounded-xl border px-3.5 text-sm font-medium transition-colors ${
              active
                ? 'border-[rgb(var(--wed-accent-rgb))] bg-[rgb(var(--wed-accent-rgb)/0.15)] text-white'
                : 'border-white/10 bg-white/5 text-wed-gray-300 hover:bg-white/10'
            }`}
          >
            {active && <Check className="h-3.5 w-3.5" />}
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

export function TextField({
  id,
  value,
  onChange,
  placeholder,
  label,
  type = 'text',
  multiline = false,
  error,
  autoComplete,
}: {
  id: string;
  value: string;
  onChange: (next: string) => void;
  placeholder?: string;
  label: string;
  type?: string;
  multiline?: boolean;
  error?: string;
  autoComplete?: string;
}) {
  const cls = `w-full rounded-xl border bg-black/40 px-3.5 py-3 text-sm text-white placeholder:text-wed-gray-500 focus:outline-none focus:ring-2 focus:ring-[rgb(var(--wed-accent-rgb))] ${
    error ? 'border-[#FF5A4A]' : 'border-white/10'
  }`;
  return (
    <div>
      {multiline ? (
        <textarea
          id={id}
          aria-label={label}
          aria-invalid={Boolean(error)}
          value={value}
          rows={3}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          className={`${cls} resize-y min-h-[88px]`}
        />
      ) : (
        <input
          id={id}
          type={type}
          aria-label={label}
          aria-invalid={Boolean(error)}
          autoComplete={autoComplete}
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          className={`${cls} min-h-[44px]`}
        />
      )}
      {error && (
        <p role="alert" className="mt-1.5 text-xs text-[#FF5A4A]">
          {error}
        </p>
      )}
    </div>
  );
}

/** Live feedback while typing a new password. Mirrors passwordStrength(). */
export function PasswordMeter({ password }: { password: string }) {
  const { score, label, suggestions } = passwordStrength(password);
  if (!password) return null;

  const colors = ['#FF5A4A', '#FF5A4A', '#F59E0B', '#22C55E', '#22C55E'];
  return (
    <div className="mt-2">
      <div className="flex items-center gap-2">
        <div
          className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/10"
          role="progressbar"
          aria-valuenow={score}
          aria-valuemin={0}
          aria-valuemax={4}
          aria-label="Password strength"
        >
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{ width: `${((score + 1) / 5) * 100}%`, background: colors[score] }}
          />
        </div>
        <span className="text-xs font-medium" style={{ color: colors[score] }}>
          {label}
        </span>
      </div>
      {suggestions.length > 0 && (
        <ul className="mt-1.5 space-y-0.5">
          {suggestions.map((s) => (
            <li key={s} className="text-xs text-wed-gray-500">
              · {s}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function SettingsSkeleton() {
  return (
    <div className="space-y-4" aria-busy="true" aria-label="Loading settings">
      {[0, 1, 2].map((section) => (
        <div
          key={section}
          className="rounded-2xl border border-white/10 bg-wed-surface/60 p-4 sm:p-6"
        >
          <div className="h-5 w-40 animate-pulse rounded bg-white/10" />
          <div className="mt-2 h-3 w-56 animate-pulse rounded bg-white/5" />
          <div className="mt-5 space-y-4">
            {[0, 1, 2].map((row) => (
              <div key={row} className="flex items-center justify-between gap-4">
                <div className="flex-1 space-y-2">
                  <div className="h-3.5 w-32 animate-pulse rounded bg-white/10" />
                  <div className="h-3 w-48 animate-pulse rounded bg-white/5" />
                </div>
                <div className="h-7 w-[52px] shrink-0 animate-pulse rounded-full bg-white/10" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
