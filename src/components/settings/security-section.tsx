'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  AlertTriangle,
  Check,
  Copy,
  Download,
  KeyRound,
  Laptop,
  Loader2,
  Lock,
  LogOut,
  QrCode,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Smartphone,
  Tablet,
  Trash2,
  X,
} from 'lucide-react';
import { useSettings } from '@/hooks/use-settings';
import { useUIStore } from '@/store';
import { PasswordMeter, SettingRow, SettingsSection, TextField } from '@/components/settings/controls';
// Crypto-free module — importing securityScore from ./security would pull node
// crypto + bcryptjs into this client component's bundle.
import { securityScore } from '@/lib/settings/constants';

interface Device {
  id: string;
  label: string;
  kind: 'mobile' | 'tablet' | 'desktop';
  userAgent: string | null;
  ipAddress: string | null;
  createdAt: string;
  expiresAt: string;
  current: boolean;
}

interface ActivityEntry {
  id: string;
  action: string;
  detail: string | null;
  ipAddress: string | null;
  createdAt: string;
}

interface AccountDeletionState {
  pending: boolean;
  requestedAt: string | null;
  scheduledFor: string | null;
}

// ─── MODAL PRIMITIVE ──────────────────────────────────────────────────────────
export function Modal({
  isOpen,
  onClose,
  title,
  children,
}: {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className="relative z-10 w-full max-w-lg overflow-hidden rounded-2xl border border-white/10 bg-[#121216] p-6 shadow-2xl transition-all"
      >
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <h3 id="modal-title" className="text-lg font-bold text-white">
            {title}
          </h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="flex h-11 w-11 items-center justify-center rounded-xl text-wed-gray-400 hover:bg-white/10 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="mt-4">{children}</div>
      </div>
    </div>
  );
}

// ─── MAIN SECURITY SECTION ───────────────────────────────────────────────────
export function SecuritySection() {
  const { settings, setSettings } = useSettings();
  const addToast = useUIStore((s) => s.addToast);

  const [devices, setDevices] = useState<Device[]>([]);
  const [loadingDevices, setLoadingDevices] = useState(true);

  const [activity, setActivity] = useState<ActivityEntry[]>([]);
  const [activityPage, setActivityPage] = useState(1);
  const [hasMoreActivity, setHasMoreActivity] = useState(false);
  const [loadingActivity, setLoadingActivity] = useState(true);

  const [deletionState, setDeletionState] = useState<AccountDeletionState>({
    pending: false,
    requestedAt: null,
    scheduledFor: null,
  });

  // Fetch devices, activity, deletion status
  const fetchDevices = useCallback(async () => {
    try {
      const res = await fetch('/api/settings/devices');
      const data = await res.json();
      if (res.ok) setDevices(data.devices || []);
    } catch {
      /* ignore */
    } finally {
      setLoadingDevices(false);
    }
  }, []);

  const fetchActivity = useCallback(async (page = 1) => {
    try {
      setLoadingActivity(true);
      const res = await fetch(`/api/settings/activity?page=${page}&pageSize=10`);
      const data = await res.json();
      if (res.ok) {
        setActivity((prev) => (page === 1 ? data.entries : [...prev, ...data.entries]));
        setHasMoreActivity(data.hasMore);
        setActivityPage(page);
      }
    } catch {
      /* ignore */
    } finally {
      setLoadingActivity(false);
    }
  }, []);

  const fetchDeletionState = useCallback(async () => {
    try {
      const res = await fetch('/api/settings/account');
      const data = await res.json();
      if (res.ok) setDeletionState(data);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    fetchDevices();
    fetchActivity(1);
    fetchDeletionState();
  }, [fetchDevices, fetchActivity, fetchDeletionState]);

  const sec = settings?.security || {
    twoFactorEnabled: false,
    recoveryCodeCount: 0,
    lastPasswordChange: null,
  };

  const scoreData = securityScore({
    twoFactorEnabled: sec.twoFactorEnabled,
    recoveryCodeCount: sec.recoveryCodeCount,
    activeDevices: devices.length || 1,
    lastPasswordChange: sec.lastPasswordChange ? new Date(sec.lastPasswordChange) : null,
  });

  return (
    <div className="space-y-6">
      {/* Security Health Score */}
      <SecurityScoreCard scoreData={scoreData} />

      {/* Password Change Card */}
      <PasswordCard />

      {/* Two-Factor Auth Card */}
      <TwoFactorCard
        security={sec}
        onUpdateSecurity={(updated) => {
          if (settings) {
            setSettings({
              ...settings,
              security: { ...settings.security, ...updated },
            });
          }
          fetchActivity(1);
        }}
      />

      {/* Signed-in Devices */}
      <DevicesCard
        devices={devices}
        loading={loadingDevices}
        onRefresh={() => {
          fetchDevices();
          fetchActivity(1);
        }}
      />

      {/* Activity Log */}
      <ActivityCard
        activity={activity}
        loading={loadingActivity}
        hasMore={hasMoreActivity}
        onLoadMore={() => fetchActivity(activityPage + 1)}
      />

      {/* Data Export & History Cleanup */}
      <DataCard onRefreshActivity={() => fetchActivity(1)} />

      {/* Danger Zone: Account Deletion */}
      <DangerZone
        deletionState={deletionState}
        onRefresh={() => {
          fetchDeletionState();
          fetchActivity(1);
        }}
      />
    </div>
  );
}

// ─── SECURITY SCORE CARD ──────────────────────────────────────────────────────
function SecurityScoreCard({
  scoreData,
}: {
  scoreData: { score: number; label: 'Weak' | 'Medium' | 'Strong'; tips: string[] };
}) {
  const badgeColor =
    scoreData.label === 'Strong'
      ? 'bg-wed-lime/20 text-wed-lime border-wed-lime/30'
      : scoreData.label === 'Medium'
        ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
        : 'bg-[#FF5A4A]/20 text-[#FF5A4A] border-[#FF5A4A]/30';

  return (
    <SettingsSection title="Security Status" description="Real-time security health evaluation of your account.">
      <div className="p-4 sm:p-6 space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5 border border-white/10">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-white">{scoreData.score}</span>
                <span className="text-xs text-wed-gray-500">/ 100</span>
                <span className={`ml-2 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${badgeColor}`}>
                  {scoreData.label}
                </span>
              </div>
              <p className="text-xs text-wed-gray-400 mt-0.5">Account security rating</p>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full transition-all duration-500 rounded-full"
            style={{
              width: `${scoreData.score}%`,
              background:
                scoreData.score >= 80
                  ? 'rgb(var(--wed-accent-rgb))'
                  : scoreData.score >= 55
                    ? '#F59E0B'
                    : '#FF5A4A',
            }}
          />
        </div>

        {/* Tips */}
        {scoreData.tips.length > 0 && (
          <div className="rounded-xl border border-white/10 bg-white/5 p-3.5 space-y-1.5">
            <p className="text-xs font-semibold text-white">Recommendations to strengthen security:</p>
            <ul className="space-y-1">
              {scoreData.tips.map((tip, i) => (
                <li key={i} className="text-xs text-wed-gray-400 flex items-start gap-2">
                  <span className="text-amber-400 font-bold">•</span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </SettingsSection>
  );
}

// ─── PASSWORD CARD ────────────────────────────────────────────────────────────
function PasswordCard() {
  const addToast = useUIStore((s) => s.addToast);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ currentPassword?: string; newPassword?: string; confirmPassword?: string }>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    if (!currentPassword) {
      setErrors({ currentPassword: 'Enter your current password.' });
      return;
    }
    if (!newPassword) {
      setErrors({ newPassword: 'Enter a new password.' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrors({ confirmPassword: 'Passwords do not match.' });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/settings/password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.field) {
          setErrors({ [data.field]: data.error });
        } else {
          addToast(data.error || 'Could not change password.', 'error');
        }
        return;
      }
      addToast('Password updated successfully.', 'success');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch {
      addToast('Network error while updating password.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SettingsSection title="Password" description="Ensure your account uses a strong password with at least 8 characters.">
      <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4">
        <SettingRow label="Current password" htmlFor="curr-pass" stacked>
          <TextField
            id="curr-pass"
            label="Current password"
            type="password"
            autoComplete="current-password"
            value={currentPassword}
            onChange={setCurrentPassword}
            error={errors.currentPassword}
            placeholder="••••••••"
          />
        </SettingRow>

        <SettingRow label="New password" htmlFor="new-pass" stacked>
          <div>
            <TextField
              id="new-pass"
              label="New password"
              type="password"
              autoComplete="new-password"
              value={newPassword}
              onChange={setNewPassword}
              error={errors.newPassword}
              placeholder="••••••••"
            />
            <PasswordMeter password={newPassword} />
          </div>
        </SettingRow>

        <SettingRow label="Confirm new password" htmlFor="conf-pass" stacked>
          <TextField
            id="conf-pass"
            label="Confirm new password"
            type="password"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={setConfirmPassword}
            error={errors.confirmPassword}
            placeholder="••••••••"
          />
        </SettingRow>

        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            disabled={loading || !currentPassword || !newPassword || !confirmPassword}
            className="inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-[rgb(var(--wed-accent-rgb))] px-5 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-40"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            Update Password
          </button>
        </div>
      </form>
    </SettingsSection>
  );
}

// ─── TWO-FACTOR AUTH CARD ─────────────────────────────────────────────────────
function TwoFactorCard({
  security,
  onUpdateSecurity,
}: {
  security: { twoFactorEnabled: boolean; recoveryCodeCount: number };
  onUpdateSecurity: (updated: Partial<{ twoFactorEnabled: boolean; recoveryCodeCount: number }>) => void;
}) {
  const addToast = useUIStore((s) => s.addToast);

  // Setup state
  const [enrolling, setEnrolling] = useState(false);
  const [setupData, setSetupData] = useState<{ secret: string; qrDataUrl: string } | null>(null);
  const [tokenInput, setTokenInput] = useState('');
  const [tokenError, setTokenError] = useState('');
  const [verifying, setVerifying] = useState(false);

  // Recovery codes modal
  const [recoveryCodes, setRecoveryCodes] = useState<string[] | null>(null);

  // Disable modal
  const [disableModalOpen, setDisableModalOpen] = useState(false);
  const [disablePassword, setDisablePassword] = useState('');
  const [disableError, setDisableError] = useState('');
  const [disabling, setDisabling] = useState(false);

  // Regenerate codes modal
  const [regenModalOpen, setRegenModalOpen] = useState(false);
  const [regenPassword, setRegenPassword] = useState('');
  const [regenError, setRegenError] = useState('');
  const [regenerating, setRegenerating] = useState(false);

  // Start enrollment
  const handleBeginEnrollment = async () => {
    setEnrolling(true);
    setTokenError('');
    try {
      const res = await fetch('/api/settings/2fa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      const data = await res.json();
      if (!res.ok) {
        addToast(data.error || 'Could not begin 2FA setup.', 'error');
        return;
      }
      setSetupData({ secret: data.secret, qrDataUrl: data.qrDataUrl });
    } catch {
      addToast('Network error starting 2FA setup.', 'error');
    } finally {
      setEnrolling(false);
    }
  };

  // Confirm enrollment
  const handleConfirmEnrollment = async (e: React.FormEvent) => {
    e.preventDefault();
    setTokenError('');

    if (!tokenInput || tokenInput.length !== 6) {
      setTokenError('Enter the 6-digit code from your authenticator app.');
      return;
    }

    setVerifying(true);
    try {
      const res = await fetch('/api/settings/2fa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: tokenInput }),
      });
      const data = await res.json();
      if (!res.ok) {
        setTokenError(data.error || 'Invalid authentication code.');
        return;
      }
      addToast('Two-factor authentication enabled!', 'success');
      setSetupData(null);
      setTokenInput('');
      onUpdateSecurity({ twoFactorEnabled: true, recoveryCodeCount: data.recoveryCodes?.length || 10 });
      if (data.recoveryCodes) {
        setRecoveryCodes(data.recoveryCodes);
      }
    } catch {
      setTokenError('Network error confirming 2FA.');
    } finally {
      setVerifying(false);
    }
  };

  // Disable 2FA
  const handleDisable2FA = async (e: React.FormEvent) => {
    e.preventDefault();
    setDisableError('');

    if (!disablePassword) {
      setDisableError('Enter your password to confirm.');
      return;
    }

    setDisabling(true);
    try {
      const res = await fetch('/api/settings/2fa', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: disablePassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        setDisableError(data.error || 'Incorrect password.');
        return;
      }
      addToast('Two-factor authentication disabled.', 'info');
      setDisableModalOpen(false);
      setDisablePassword('');
      onUpdateSecurity({ twoFactorEnabled: false, recoveryCodeCount: 0 });
    } catch {
      setDisableError('Network error disabling 2FA.');
    } finally {
      setDisabling(false);
    }
  };

  // Regenerate codes
  const handleRegenerateCodes = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegenError('');

    if (!regenPassword) {
      setRegenError('Enter your password to confirm.');
      return;
    }

    setRegenerating(true);
    try {
      const res = await fetch('/api/settings/2fa/recovery-codes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: regenPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        setRegenError(data.error || 'Incorrect password.');
        return;
      }
      addToast('New recovery codes generated.', 'success');
      setRegenModalOpen(false);
      setRegenPassword('');
      onUpdateSecurity({ recoveryCodeCount: data.recoveryCodes?.length || 10 });
      setRecoveryCodes(data.recoveryCodes);
    } catch {
      setRegenError('Network error regenerating codes.');
    } finally {
      setRegenerating(false);
    }
  };

  return (
    <>
      <SettingsSection
        title="Two-Factor Authentication"
        description="Add an extra layer of security to your account using an authenticator app (Google Authenticator, 1Password, Authy)."
      >
        <div className="p-4 sm:p-6 space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl border ${
                security.twoFactorEnabled ? 'bg-wed-lime/10 border-wed-lime/30 text-wed-lime' : 'bg-white/5 border-white/10 text-wed-gray-400'
              }`}>
                {security.twoFactorEnabled ? <ShieldCheck className="h-5 w-5" /> : <ShieldAlert className="h-5 w-5" />}
              </div>
              <div>
                <p className="text-sm font-semibold text-white">
                  {security.twoFactorEnabled ? '2FA is Enabled' : '2FA is Disabled'}
                </p>
                <p className="text-xs text-wed-gray-500">
                  {security.twoFactorEnabled
                    ? `${security.recoveryCodeCount} recovery codes remaining`
                    : 'Protect your account against unauthorized access'}
                </p>
              </div>
            </div>

            {!security.twoFactorEnabled && !setupData && (
              <button
                type="button"
                onClick={handleBeginEnrollment}
                disabled={enrolling}
                className="inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-[rgb(var(--wed-accent-rgb))] px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-40"
              >
                {enrolling ? <Loader2 className="h-4 w-4 animate-spin" /> : <QrCode className="h-4 w-4" />}
                Enable 2FA
              </button>
            )}

            {security.twoFactorEnabled && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setRegenModalOpen(true)}
                  className="inline-flex min-h-[44px] items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3.5 py-2 text-xs font-medium text-white transition-colors hover:bg-white/10"
                >
                  <KeyRound className="h-3.5 w-3.5" />
                  Codes
                </button>
                <button
                  type="button"
                  onClick={() => setDisableModalOpen(true)}
                  className="inline-flex min-h-[44px] items-center gap-1.5 rounded-xl border border-[#FF5A4A]/30 bg-[#FF5A4A]/10 px-3.5 py-2 text-xs font-medium text-[#FF5A4A] transition-colors hover:bg-[#FF5A4A]/20"
                >
                  Disable
                </button>
              </div>
            )}
          </div>

          {/* Pending Setup Wizard */}
          {setupData && !security.twoFactorEnabled && (
            <div className="mt-4 rounded-xl border border-white/10 bg-black/40 p-4 sm:p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <QrCode className="h-4 w-4 text-wed-purple" /> Setup Authenticator App
                </h4>
                <button
                  type="button"
                  onClick={() => setSetupData(null)}
                  className="text-xs text-wed-gray-400 hover:text-white"
                >
                  Cancel
                </button>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-6">
                <div className="rounded-xl bg-white p-2 shrink-0">
                  <img src={setupData.qrDataUrl} alt="2FA QR Code" className="h-44 w-44" />
                </div>
                <div className="space-y-3 text-xs text-wed-gray-300 flex-1">
                  <p>
                    1. Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.).
                  </p>
                  <p>2. Or enter this setup key manually:</p>
                  <div className="flex items-center gap-2">
                    <code className="rounded-lg bg-white/10 px-3 py-2 font-mono text-sm text-white select-all">
                      {setupData.secret}
                    </code>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(setupData.secret);
                        addToast('Secret copied to clipboard.', 'info');
                      }}
                      className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-white/5 hover:bg-white/10"
                    >
                      <Copy className="h-4 w-4 text-white" />
                    </button>
                  </div>
                </div>
              </div>

              <form onSubmit={handleConfirmEnrollment} className="pt-2 border-t border-white/10 space-y-3">
                <SettingRow label="3. Enter 6-digit code from app" htmlFor="totp-code" stacked>
                  <div className="flex items-center gap-3">
                    <TextField
                      id="totp-code"
                      label="6-digit code"
                      value={tokenInput}
                      onChange={(val) => setTokenInput(val.replace(/\D/g, '').slice(0, 6))}
                      error={tokenError}
                      placeholder="123456"
                    />
                    <button
                      type="submit"
                      disabled={verifying || tokenInput.length !== 6}
                      className="inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-[rgb(var(--wed-accent-rgb))] px-5 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-40 shrink-0"
                    >
                      {verifying && <Loader2 className="h-4 w-4 animate-spin" />}
                      Verify & Activate
                    </button>
                  </div>
                </SettingRow>
              </form>
            </div>
          )}
        </div>
      </SettingsSection>

      {/* Recovery Codes Modal */}
      {recoveryCodes && (
        <RecoveryCodesModal
          codes={recoveryCodes}
          onClose={() => setRecoveryCodes(null)}
        />
      )}

      {/* Disable 2FA Modal */}
      <Modal isOpen={disableModalOpen} onClose={() => setDisableModalOpen(false)} title="Disable Two-Factor Auth">
        <form onSubmit={handleDisable2FA} className="space-y-4">
          <p className="text-xs text-wed-gray-400">
            Disabling 2FA will reduce your account security. Confirm your password to proceed.
          </p>
          <TextField
            id="disable-pass"
            label="Password"
            type="password"
            value={disablePassword}
            onChange={setDisablePassword}
            error={disableError}
            placeholder="Enter password"
          />
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setDisableModalOpen(false)}
              className="min-h-[44px] rounded-xl border border-white/10 bg-white/5 px-4 text-sm font-medium text-white hover:bg-white/10"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={disabling || !disablePassword}
              className="inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-[#FF5A4A] px-4 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-40"
            >
              {disabling && <Loader2 className="h-4 w-4 animate-spin" />}
              Confirm Disable
            </button>
          </div>
        </form>
      </Modal>

      {/* Regenerate Recovery Codes Modal */}
      <Modal isOpen={regenModalOpen} onClose={() => setRegenModalOpen(false)} title="Regenerate Recovery Codes">
        <form onSubmit={handleRegenerateCodes} className="space-y-4">
          <p className="text-xs text-wed-gray-400">
            Regenerating will invalidate all existing recovery codes. Confirm your password to continue.
          </p>
          <TextField
            id="regen-pass"
            label="Password"
            type="password"
            value={regenPassword}
            onChange={setRegenPassword}
            error={regenError}
            placeholder="Enter password"
          />
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setRegenModalOpen(false)}
              className="min-h-[44px] rounded-xl border border-white/10 bg-white/5 px-4 text-sm font-medium text-white hover:bg-white/10"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={regenerating || !regenPassword}
              className="inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-[rgb(var(--wed-accent-rgb))] px-4 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-40"
            >
              {regenerating && <Loader2 className="h-4 w-4 animate-spin" />}
              Generate New Codes
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}

// ─── RECOVERY CODES MODAL ────────────────────────────────────────────────────
function RecoveryCodesModal({
  codes,
  onClose,
}: {
  codes: string[];
  onClose: () => void;
}) {
  const addToast = useUIStore((s) => s.addToast);
  const [savedChecked, setSavedChecked] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(codes.join('\n'));
    addToast('Recovery codes copied to clipboard.', 'info');
  };

  const handleDownload = () => {
    const text = `WEDXUI FIT RECOVERY CODES\nGenerated: ${new Date().toISOString()}\n\nKeep these codes in a secure location. Each code can be used once.\n\n${codes.join(
      '\n'
    )}`;
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'wedxui-fit-recovery-codes.txt';
    link.click();
    URL.revokeObjectURL(url);
    addToast('Downloaded wedxui-fit-recovery-codes.txt', 'info');
  };

  return (
    <Modal isOpen={true} onClose={() => {}} title="Save Your Recovery Codes">
      <div className="space-y-4">
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3.5 text-xs text-amber-200 flex items-start gap-2.5">
          <AlertTriangle className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
          <p>
            These codes are shown <strong>EXACTLY ONCE</strong>. If you lose access to your authenticator app, these are the only way back into your account.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2 rounded-xl bg-black/60 p-4 border border-white/10 font-mono text-sm text-center text-white">
          {codes.map((code, i) => (
            <div key={i} className="py-1.5 px-2 bg-white/5 rounded-lg border border-white/5 tracking-wider">
              {code}
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleCopy}
            className="flex-1 inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 text-xs font-medium text-white hover:bg-white/10"
          >
            <Copy className="h-4 w-4" /> Copy All
          </button>
          <button
            type="button"
            onClick={handleDownload}
            className="flex-1 inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 text-xs font-medium text-white hover:bg-white/10"
          >
            <Download className="h-4 w-4" /> Download (.txt)
          </button>
        </div>

        <label className="flex items-center gap-3 pt-2 cursor-pointer">
          <input
            type="checkbox"
            checked={savedChecked}
            onChange={(e) => setSavedChecked(e.target.checked)}
            className="h-5 w-5 rounded border-white/20 bg-black/40 text-[rgb(var(--wed-accent-rgb))] focus:ring-0 cursor-pointer"
          />
          <span className="text-xs text-wed-gray-300 font-medium select-none">
            I have backed up these recovery codes in a safe place.
          </span>
        </label>

        <div className="pt-2">
          <button
            type="button"
            disabled={!savedChecked}
            onClick={onClose}
            className="w-full min-h-[44px] rounded-xl bg-[rgb(var(--wed-accent-rgb))] px-4 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-30"
          >
            I Saved Them — Done
          </button>
        </div>
      </div>
    </Modal>
  );
}

// ─── DEVICES CARD ─────────────────────────────────────────────────────────────
function DevicesCard({
  devices,
  loading,
  onRefresh,
}: {
  devices: Device[];
  loading: boolean;
  onRefresh: () => void;
}) {
  const addToast = useUIStore((s) => s.addToast);
  const [revokingId, setRevokingId] = useState<string | null>(null);
  const [revokingAll, setRevokingAll] = useState(false);

  const handleRevoke = async (sessionId: string) => {
    setRevokingId(sessionId);
    try {
      const res = await fetch('/api/settings/devices', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId }),
      });
      const data = await res.json();
      if (!res.ok) {
        addToast(data.error || 'Could not revoke session.', 'error');
        return;
      }
      addToast('Session revoked.', 'info');
      onRefresh();
    } catch {
      addToast('Network error revoking session.', 'error');
    } finally {
      setRevokingId(null);
    }
  };

  const handleRevokeAll = async () => {
    setRevokingAll(true);
    try {
      const res = await fetch('/api/settings/devices', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ all: true }),
      });
      const data = await res.json();
      if (!res.ok) {
        addToast(data.error || 'Could not revoke sessions.', 'error');
        return;
      }
      addToast(`Revoked ${data.revoked} other session(s).`, 'info');
      onRefresh();
    } catch {
      addToast('Network error revoking sessions.', 'error');
    } finally {
      setRevokingAll(false);
    }
  };

  const nonCurrentCount = devices.filter((d) => !d.current).length;

  return (
    <SettingsSection
      title="Active Sessions"
      description="Devices currently signed into your account. You can revoke any unrecognized session."
    >
      <div className="p-4 sm:p-6 space-y-4">
        {loading ? (
          <div className="flex items-center justify-center py-6">
            <Loader2 className="h-6 w-6 animate-spin text-wed-gray-500" />
          </div>
        ) : devices.length === 0 ? (
          <p className="text-xs text-wed-gray-500 py-4 text-center">No active sessions found.</p>
        ) : (
          <div className="space-y-3">
            {devices.map((device) => {
              const Icon = device.kind === 'mobile' ? Smartphone : device.kind === 'tablet' ? Tablet : Laptop;
              return (
                <div
                  key={device.id}
                  className="flex items-center justify-between gap-4 rounded-xl border border-white/10 bg-white/5 p-3.5"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-black/40 text-white border border-white/10">
                      <Icon className="h-5 w-5 text-wed-gray-300" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-semibold text-white truncate">{device.label}</p>
                        {device.current && (
                          <span className="rounded-full bg-wed-lime/20 border border-wed-lime/30 px-2 py-0.5 text-[10px] font-bold text-wed-lime">
                            This device
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-wed-gray-500 truncate">
                        IP: {device.ipAddress || 'Unknown'} · Signed in {new Date(device.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {!device.current && (
                    <button
                      type="button"
                      onClick={() => handleRevoke(device.id)}
                      disabled={revokingId === device.id}
                      className="inline-flex min-h-[44px] items-center gap-1.5 rounded-xl border border-[#FF5A4A]/30 bg-[#FF5A4A]/10 px-3 py-1.5 text-xs font-medium text-[#FF5A4A] transition-colors hover:bg-[#FF5A4A]/20 shrink-0"
                    >
                      {revokingId === device.id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <LogOut className="h-3.5 w-3.5" />
                      )}
                      Revoke
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {nonCurrentCount > 0 && (
          <div className="pt-2 flex justify-end">
            <button
              type="button"
              onClick={handleRevokeAll}
              disabled={revokingAll}
              className="inline-flex min-h-[44px] items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 text-xs font-semibold text-white transition-colors hover:bg-white/10 disabled:opacity-40"
            >
              {revokingAll && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              Revoke all other devices ({nonCurrentCount})
            </button>
          </div>
        )}
      </div>
    </SettingsSection>
  );
}

// ─── ACTIVITY CARD ────────────────────────────────────────────────────────────
function ActivityCard({
  activity,
  loading,
  hasMore,
  onLoadMore,
}: {
  activity: ActivityEntry[];
  loading: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
}) {
  return (
    <SettingsSection
      title="Security Log"
      description="Audit trail of security events and settings changes on your account."
    >
      <div className="p-4 sm:p-6 space-y-4">
        {activity.length === 0 && !loading ? (
          <p className="text-xs text-wed-gray-500 py-4 text-center">No activity recorded yet.</p>
        ) : (
          <div className="divide-y divide-white/5">
            {activity.map((item) => (
              <div key={item.id} className="py-3 first:pt-0 last:pb-0 flex items-start justify-between gap-4">
                <div className="space-y-0.5 min-w-0">
                  <p className="text-xs font-semibold text-white font-mono">{item.action}</p>
                  {item.detail && <p className="text-xs text-wed-gray-400 truncate">{item.detail}</p>}
                  <p className="text-[11px] text-wed-gray-500">
                    {new Date(item.createdAt).toLocaleString()} {item.ipAddress ? `· ${item.ipAddress}` : ''}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {hasMore && (
          <div className="pt-2 flex justify-center">
            <button
              type="button"
              onClick={onLoadMore}
              disabled={loading}
              className="inline-flex min-h-[44px] items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 text-xs font-medium text-white hover:bg-white/10 disabled:opacity-40"
            >
              {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              Load More Activity
            </button>
          </div>
        )}
      </div>
    </SettingsSection>
  );
}

// ─── DATA CARD (EXPORT & HISTORY) ─────────────────────────────────────────────
function DataCard({ onRefreshActivity }: { onRefreshActivity: () => void }) {
  const addToast = useUIStore((s) => s.addToast);
  const [clearModalOpen, setClearModalOpen] = useState(false);
  const [scope, setScope] = useState<'workouts' | 'progress' | 'all'>('workouts');
  const [clearing, setClearing] = useState(false);

  const handleClearHistory = async () => {
    setClearing(true);
    try {
      const res = await fetch('/api/settings/history', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scope }),
      });
      const data = await res.json();
      if (!res.ok) {
        addToast(data.error || 'Could not clear history.', 'error');
        return;
      }
      addToast(
        `Cleared ${scope}: ${data.deleted.workouts} workout(s), ${data.deleted.progress} progress entry(ies).`,
        'success'
      );
      setClearModalOpen(false);
      onRefreshActivity();
    } catch {
      addToast('Network error clearing history.', 'error');
    } finally {
      setClearing(false);
    }
  };

  return (
    <>
      <SettingsSection
        title="Your Data"
        description="Download your complete account data or clear historical workout logs."
      >
        <div className="p-4 sm:p-6 space-y-4">
          <SettingRow label="Export complete dataset" description="JSON bundle of profile, logs, settings, and activity.">
            <a
              href="/api/settings/export"
              download
              className="inline-flex min-h-[44px] items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-white/10"
            >
              <Download className="h-4 w-4" /> Download Export (.json)
            </a>
          </SettingRow>

          <SettingRow label="Clear activity history" description="Permanently delete recorded workout logs or progress entries.">
            <button
              type="button"
              onClick={() => setClearModalOpen(true)}
              className="inline-flex min-h-[44px] items-center gap-1.5 rounded-xl border border-[#FF5A4A]/30 bg-[#FF5A4A]/10 px-4 py-2.5 text-xs font-semibold text-[#FF5A4A] transition-colors hover:bg-[#FF5A4A]/20"
            >
              <Trash2 className="h-4 w-4" /> Clear History
            </button>
          </SettingRow>
        </div>
      </SettingsSection>

      <Modal isOpen={clearModalOpen} onClose={() => setClearModalOpen(false)} title="Clear Logged History">
        <div className="space-y-4">
          <p className="text-xs text-wed-gray-400">
            Select the domain of data you wish to permanently delete. This operation cannot be undone.
          </p>

          <div className="space-y-2">
            {(
              [
                ['workouts', 'Workouts logs only (session & exercise records)'],
                ['progress', 'Progress entries only (weight & body measurements)'],
                ['all', 'All historical data (workouts + progress)'],
              ] as const
            ).map(([val, label]) => (
              <label key={val} className="flex items-center gap-3 p-3 rounded-xl border border-white/10 bg-black/40 cursor-pointer">
                <input
                  type="radio"
                  name="scope"
                  value={val}
                  checked={scope === val}
                  onChange={() => setScope(val)}
                  className="h-4 w-4 text-[rgb(var(--wed-accent-rgb))]"
                />
                <span className="text-xs text-white font-medium">{label}</span>
              </label>
            ))}
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setClearModalOpen(false)}
              className="min-h-[44px] rounded-xl border border-white/10 bg-white/5 px-4 text-sm font-medium text-white hover:bg-white/10"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={clearing}
              onClick={handleClearHistory}
              className="inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-[#FF5A4A] px-4 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-40"
            >
              {clearing && <Loader2 className="h-4 w-4 animate-spin" />}
              Confirm Deletion
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}

// ─── DANGER ZONE: ACCOUNT DELETION ───────────────────────────────────────────
function DangerZone({
  deletionState,
  onRefresh,
}: {
  deletionState: AccountDeletionState;
  onRefresh: () => void;
}) {
  const addToast = useUIStore((s) => s.addToast);
  const [modalOpen, setModalOpen] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmText, setConfirmText] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  const handleRequestDeletion = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!password) {
      setError('Enter your password.');
      return;
    }
    if (confirmText !== 'DELETE') {
      setError('You must type DELETE to confirm.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/settings/account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password, confirmText }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Could not request account deletion.');
        return;
      }
      addToast('Account deletion requested. 30-day grace period active.', 'info');
      setModalOpen(false);
      setPassword('');
      setConfirmText('');
      onRefresh();
    } catch {
      setError('Network error requesting account deletion.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelDeletion = async () => {
    setCancelling(true);
    try {
      const res = await fetch('/api/settings/account', { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) {
        addToast(data.error || 'Could not cancel deletion.', 'error');
        return;
      }
      addToast('Account deletion request cancelled.', 'success');
      onRefresh();
    } catch {
      addToast('Network error cancelling account deletion.', 'error');
    } finally {
      setCancelling(false);
    }
  };

  return (
    <>
      <SettingsSection
        title="Danger Zone"
        description="Irreversible account actions. Requests feature a 30-day grace period before permanent purging."
      >
        <div className="p-4 sm:p-6 space-y-4">
          {deletionState.pending ? (
            <div className="rounded-xl border border-[#FF5A4A]/30 bg-[#FF5A4A]/10 p-4 space-y-3">
              <div className="flex items-start gap-3 text-xs text-white">
                <AlertTriangle className="h-5 w-5 text-[#FF5A4A] shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-sm text-[#FF5A4A]">Account Scheduled for Deletion</p>
                  <p className="mt-1 text-wed-gray-300">
                    Requested on {deletionState.requestedAt ? new Date(deletionState.requestedAt).toLocaleDateString() : '—'}. Permanent purge scheduled for{' '}
                    <strong>{deletionState.scheduledFor ? new Date(deletionState.scheduledFor).toLocaleDateString() : '—'}</strong>.
                  </p>
                </div>
              </div>
              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={handleCancelDeletion}
                  disabled={cancelling}
                  className="inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-white px-4 py-2 text-xs font-bold text-black transition-opacity hover:opacity-90 disabled:opacity-40"
                >
                  {cancelling && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  Cancel Deletion Request
                </button>
              </div>
            </div>
          ) : (
            <SettingRow
              label="Delete your WEDXUI FIT account"
              description="Schedules permanent removal of your user profile, workout history, and personal data."
            >
              <button
                type="button"
                onClick={() => setModalOpen(true)}
                className="inline-flex min-h-[44px] items-center gap-1.5 rounded-xl bg-[#FF5A4A] px-4 py-2.5 text-xs font-semibold text-white transition-opacity hover:opacity-90"
              >
                <Trash2 className="h-4 w-4" /> Delete Account
              </button>
            </SettingRow>
          )}
        </div>
      </SettingsSection>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Delete Account Confirmation">
        <form onSubmit={handleRequestDeletion} className="space-y-4">
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3.5 text-xs text-red-200">
            <p>
              Your account will enter a 30-day grace period during which you can cancel deletion at any time. After 30 days, your data will be permanently purged.
            </p>
          </div>

          <SettingRow label="Confirm Password" htmlFor="del-pass" stacked>
            <TextField
              id="del-pass"
              label="Password"
              type="password"
              value={password}
              onChange={setPassword}
              placeholder="Enter password"
            />
          </SettingRow>

          <SettingRow label="Type DELETE to confirm" htmlFor="del-confirm" stacked>
            <TextField
              id="del-confirm"
              label="Type DELETE to confirm"
              value={confirmText}
              onChange={setConfirmText}
              error={error}
              placeholder="DELETE"
            />
          </SettingRow>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="min-h-[44px] rounded-xl border border-white/10 bg-white/5 px-4 text-sm font-medium text-white hover:bg-white/10"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !password || confirmText !== 'DELETE'}
              className="inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-[#FF5A4A] px-4 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-40"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              Request Account Deletion
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}
