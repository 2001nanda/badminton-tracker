'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Lock, Unlock, Settings as SettingsIcon, SlidersHorizontal, Trash2 } from 'lucide-react';
import { useDeleteProtection } from '@/lib/contexts/DeleteProtectionContext';
import { useRetentionSettings } from '@/lib/hooks/useRetentionSettings';
import { PasswordDialog } from '@/components/ui/PasswordDialog';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export function DeleteModeToggle() {
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const { isDeleteEnabled, enableDelete, disableDelete } = useDeleteProtection();
  const { settings } = useRetentionSettings();

  const handleToggle = () => {
    if (isDeleteEnabled) {
      disableDelete();
      toast.success('Delete mode disabled 🔒', {
        description: 'Delete buttons are now hidden',
      });
      setShowMenu(false);
    } else {
      setShowPasswordDialog(true);
      setShowMenu(false);
    }
  };

  const handlePasswordSuccess = () => {
    enableDelete('iamnoob');
    toast.success('Delete mode enabled! 🔓', {
      description: 'Delete buttons are now visible',
    });
  };

  return (
    <>
      <PasswordDialog
        isOpen={showPasswordDialog}
        onClose={() => setShowPasswordDialog(false)}
        onSuccess={handlePasswordSuccess}
      />

      <div className="relative">
        <button
          onClick={() => setShowMenu(!showMenu)}
          className={cn(
            'p-2 rounded-xl transition-all relative',
            showMenu
              ? 'bg-white/10 text-white shadow-inner'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          )}
          title="Settings & Retention"
        >
          <SettingsIcon className="w-5 h-5" />
          {settings.autoDeleteEnabled && (
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          )}
        </button>

        {showMenu && (
          <>
            {/* Backdrop */}
            <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />

            {/* Menu */}
            <div className="absolute right-0 top-full mt-2 w-64 bg-[#111827] border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
              <div className="p-2 space-y-1">
                {/* Link to Full Settings Page */}
                <Link
                  href="/settings"
                  onClick={() => setShowMenu(false)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/10 transition-all text-left text-white group"
                >
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <SlidersHorizontal className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-white flex items-center justify-between">
                      Settings Page
                      <span
                        className={cn(
                          'text-[10px] px-1.5 py-0.2 rounded font-extrabold',
                          settings.autoDeleteEnabled
                            ? 'bg-amber-500/20 text-amber-300'
                            : 'bg-emerald-500/20 text-emerald-300'
                        )}
                      >
                        {settings.autoDeleteEnabled ? 'Auto: ON' : 'Permanent'}
                      </span>
                    </p>
                    <p className="text-xs text-slate-400 truncate">Retention & admin options</p>
                  </div>
                </Link>

                <div className="border-t border-white/5 my-1" />

                {/* Quick Toggle for Delete Mode */}
                <button
                  onClick={handleToggle}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/10 transition-all text-left"
                >
                  {isDeleteEnabled ? (
                    <>
                      <div className="w-8 h-8 rounded-lg bg-red-500/20 flex items-center justify-center shrink-0">
                        <Unlock className="w-4 h-4 text-red-400" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-white">Disable Delete Mode</p>
                        <p className="text-xs text-slate-400">Hide delete buttons</p>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="w-8 h-8 rounded-lg bg-yellow-500/20 flex items-center justify-center shrink-0">
                        <Lock className="w-4 h-4 text-yellow-400" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-white">Enable Delete Mode</p>
                        <p className="text-xs text-slate-400">Show delete buttons</p>
                      </div>
                    </>
                  )}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
