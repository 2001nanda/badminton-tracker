'use client';

import { useState } from 'react';
import { useRetentionSettings } from '@/lib/hooks/useRetentionSettings';
import { useDeleteProtection } from '@/lib/contexts/DeleteProtectionContext';
import { useAuth } from '@/lib/auth/AuthProvider';
import { cleanupOldMatches } from '@/lib/actions/matchActions';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { PasswordDialog } from '@/components/ui/PasswordDialog';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import {
  Settings as SettingsIcon,
  Trash2,
  ShieldCheck,
  ShieldAlert,
  Clock,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Lock,
  Unlock,
  Info,
  Flame,
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export default function SettingsPage() {
  const { settings, loading: settingsLoading, updateSettings } = useRetentionSettings();
  const { isDeleteEnabled, enableDelete, disableDelete } = useDeleteProtection();
  const { user, isAdmin } = useAuth();

  const [saving, setSaving] = useState(false);
  const [runningCleanup, setRunningCleanup] = useState(false);
  const [showConfirmEnableDialog, setShowConfirmEnableDialog] = useState(false);
  const [showConfirmManualCleanupDialog, setShowConfirmManualCleanupDialog] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);

  // An authorized admin is either authenticated as admin or has entered the admin password
  const hasAdminPrivilege = isAdmin || isDeleteEnabled;

  const handleToggleAutoDelete = async () => {
    if (!hasAdminPrivilege) {
      toast.error('Admin Access Required', {
        description: 'Please enable Delete Mode with the admin passkey first to modify retention settings.',
      });
      setShowPasswordDialog(true);
      return;
    }

    if (!settings.autoDeleteEnabled) {
      // Prompt confirmation before enabling auto delete
      setShowConfirmEnableDialog(true);
    } else {
      // Disabling auto delete does not require scary confirmation
      setSaving(true);
      const res = await updateSettings(
        { autoDeleteEnabled: false },
        user?.email || 'admin'
      );
      setSaving(false);
      if (res.success) {
        toast.success('Auto Delete Disabled 🛡️', {
          description: 'Match history will now be retained permanently.',
        });
      } else {
        toast.error('Failed to update settings');
      }
    }
  };

  const handleConfirmEnableAutoDelete = async () => {
    setSaving(true);
    const res = await updateSettings(
      { autoDeleteEnabled: true, retentionDays: 14 },
      user?.email || 'admin'
    );
    setSaving(false);
    setShowConfirmEnableDialog(false);

    if (res.success) {
      toast.success('Auto Delete Enabled (14 Days) 🧹', {
        description: 'Match documents older than 14 days will be deleted. Player and duo lifetime stats remain permanent.',
      });
    } else {
      toast.error('Failed to update settings');
    }
  };

  const handleManualCleanup = async () => {
    setRunningCleanup(true);
    try {
      const res = await cleanupOldMatches({ force: true });
      if (res.success) {
        toast.success('Cleanup Completed 🧹', {
          description: `Pruned ${res.deletedCount} match records older than 14 days.`,
        });
      } else {
        toast.error('Cleanup Failed', {
          description: String(res.error || 'Unknown error'),
        });
      }
    } catch (e) {
      toast.error('Cleanup execution error');
    } finally {
      setRunningCleanup(false);
      setShowConfirmManualCleanupDialog(false);
    }
  };

  const handlePasswordSuccess = () => {
    enableDelete('iamnoob');
    toast.success('Admin Mode Activated 🔓', {
      description: 'You now have full permission to modify retention settings and delete records.',
    });
  };

  if (settingsLoading) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-3xl flex justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-white/10 pb-6">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
          <SettingsIcon className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Settings</h1>
          <p className="text-sm text-slate-400">
            System configuration, data retention policies, and administrative security
          </p>
        </div>
      </div>

      {/* SECTION 1: MATCH HISTORY RETENTION */}
      <Card className="glass-card rounded-3xl p-6 sm:p-8 border border-white/10 relative overflow-hidden">
        <div className="flex items-start justify-between gap-4 mb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-emerald-400" />
              <h2 className="text-lg sm:text-xl font-bold text-white">Match History Retention</h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-400">
              Configure automatic cleanup policies for temporary detailed match records
            </p>
          </div>

          <span
            className={cn(
              'px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border shrink-0',
              settings.autoDeleteEnabled
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
            )}
          >
            {settings.autoDeleteEnabled ? 'Auto Delete: ON' : 'Permanent: OFF'}
          </span>
        </div>

        {/* Toggle Card */}
        <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                Auto Delete Old Matches
                <span className="text-[11px] font-semibold text-slate-400 bg-white/5 px-2.5 py-0.5 rounded-md border border-white/10">
                  Retention: {settings.retentionDays || 14} Days
                </span>
              </h3>
              <p className="text-xs sm:text-sm mt-1 text-slate-300 font-medium">
                {settings.autoDeleteEnabled
                  ? 'Match records older than 14 days will be automatically deleted.'
                  : 'Your match history will be retained permanently. No automatic deletion will occur.'}
              </p>
            </div>

            {/* Toggle Switch */}
            <button
              type="button"
              onClick={handleToggleAutoDelete}
              disabled={saving}
              className={cn(
                'w-16 h-9 rounded-full transition-colors relative flex items-center p-1 shrink-0',
                settings.autoDeleteEnabled
                  ? 'bg-emerald-500'
                  : 'bg-slate-700 hover:bg-slate-600',
                'disabled:opacity-50 disabled:cursor-not-allowed'
              )}
            >
              <div
                className={cn(
                  'w-7 h-7 rounded-full bg-white shadow-md transform transition-transform duration-200 flex items-center justify-center text-[10px] font-black',
                  settings.autoDeleteEnabled ? 'translate-x-7 text-emerald-600' : 'translate-x-0 text-slate-600'
                )}
              >
                {settings.autoDeleteEnabled ? 'ON' : 'OFF'}
              </div>
            </button>
          </div>

          {/* Explanation Banner */}
          <div
            className={cn(
              'p-4 rounded-xl flex items-start gap-3 text-xs leading-relaxed border',
              settings.autoDeleteEnabled
                ? 'bg-amber-950/30 text-amber-200 border-amber-500/30'
                : 'bg-emerald-950/30 text-emerald-200 border-emerald-500/30'
            )}
          >
            <Info className="w-4 h-4 shrink-0 mt-0.5" />
            <div>
              {settings.autoDeleteEnabled ? (
                <>
                  <span className="font-bold">Active 14-Day Expiration:</span> Detailed match documents older than 14 days are eligible for cleanup. Player lifetime stats and doubles partnership records remain permanent and are never decremented.
                </>
              ) : (
                <>
                  <span className="font-bold">Default Permanent Retention:</span> Automatic deletion is completely disabled. Every match record, score, and set history persists indefinitely in Firestore until you explicitly choose otherwise.
                </>
              )}
            </div>
          </div>

          {/* Metadata Row: Last Cleanup, Permission Warning */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-white/5 text-xs text-slate-400">
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              <span>Last Cleanup:</span>
              <span className="text-white font-mono font-semibold">
                {settings.lastCleanupAt
                  ? `${format(settings.lastCleanupAt, 'MMM d, yyyy • h:mm a')} (${formatDistanceToNow(
                      settings.lastCleanupAt,
                      { addSuffix: true }
                    )})`
                  : 'Never executed'}
              </span>
            </div>

            {!hasAdminPrivilege && (
              <div className="flex items-center gap-1.5 text-amber-400 font-semibold">
                <Lock className="w-3.5 h-3.5" />
                <span>Admin privilege required to edit</span>
              </div>
            )}
          </div>
        </div>

        {/* Manual Cleanup Action */}
        <div className="mt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-black/30 border border-white/5">
          <div>
            <h4 className="text-sm font-bold text-white">Manual Cleanup Trigger</h4>
            <p className="text-xs text-slate-400">
              Force an immediate scan and removal of match records older than 14 days
            </p>
          </div>

          <Button
            type="button"
            variant="outline"
            disabled={runningCleanup || !hasAdminPrivilege}
            onClick={() => setShowConfirmManualCleanupDialog(true)}
            className="border-white/20 bg-white/5 hover:bg-white/10 text-white font-bold text-xs h-10 px-4 rounded-xl shrink-0"
          >
            <Trash2 className="w-4 h-4 mr-2 text-rose-400" />
            {runningCleanup ? 'Cleaning up...' : 'Run Cleanup Now'}
          </Button>
        </div>
      </Card>

      {/* SECTION 2: ADMINISTRATIVE SECURITY & DELETION MODE */}
      <Card className="glass-card rounded-3xl p-6 sm:p-8 border border-white/10 space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <h2 className="text-lg sm:text-xl font-bold text-white">Administrative Security</h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-400">
              Password-protected mode for record deletions and policy modifications
            </p>
          </div>

          <span
            className={cn(
              'px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border shrink-0',
              isDeleteEnabled
                ? 'bg-red-500/20 text-red-300 border-red-500/40'
                : 'bg-slate-700/50 text-slate-300 border-slate-600'
            )}
          >
            {isDeleteEnabled ? 'Delete Mode: Active' : 'Protected'}
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-white/5 border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-white">Admin Deletion Passkey</h3>
            <p className="text-xs sm:text-sm text-slate-300 mt-0.5">
              {isDeleteEnabled
                ? 'Delete buttons are currently visible across match history and settings.'
                : 'Unlock admin capabilities using the secret administrator passkey.'}
            </p>
          </div>

          {isDeleteEnabled ? (
            <Button
              type="button"
              onClick={disableDelete}
              className="bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/30 font-bold h-11 px-5 rounded-xl text-xs"
            >
              <Lock className="w-4 h-4 mr-2" />
              Lock Admin Mode
            </Button>
          ) : (
            <Button
              type="button"
              onClick={() => setShowPasswordDialog(true)}
              className="bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 font-bold h-11 px-5 rounded-xl text-xs"
            >
              <Unlock className="w-4 h-4 mr-2" />
              Unlock Admin Mode
            </Button>
          )}
        </div>
      </Card>

      {/* Confirmation Dialogs */}
      <ConfirmDialog
        isOpen={showConfirmEnableDialog}
        onClose={() => setShowConfirmEnableDialog(false)}
        onConfirm={handleConfirmEnableAutoDelete}
        title="Enable Automatic 14-Day Match Deletion?"
        description="Detailed match documents older than 14 days will be automatically deleted on schedule. Player lifetime statistics (wins, losses, points) and doubles partnership records are permanent and will NEVER be changed."
        confirmText="Enable Auto Delete"
        cancelText="Keep Permanent"
        variant="danger"
        loading={saving}
      />

      <ConfirmDialog
        isOpen={showConfirmManualCleanupDialog}
        onClose={() => setShowConfirmManualCleanupDialog(false)}
        onConfirm={handleManualCleanup}
        title="Execute Manual Match Cleanup Now?"
        description="This will scan Firestore and delete all detailed match documents older than 14 days immediately. Player lifetime totals and partnership statistics will not be changed."
        confirmText="Run Cleanup Now"
        cancelText="Cancel"
        variant="danger"
        loading={runningCleanup}
      />

      <PasswordDialog
        isOpen={showPasswordDialog}
        onClose={() => setShowPasswordDialog(false)}
        onSuccess={handlePasswordSuccess}
      />
    </div>
  );
}

