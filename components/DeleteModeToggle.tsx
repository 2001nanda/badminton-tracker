'use client';

import { useState } from 'react';
import { Lock, Unlock, Settings } from 'lucide-react';
import { useDeleteProtection } from '@/lib/contexts/DeleteProtectionContext';
import { PasswordDialog } from '@/components/ui/PasswordDialog';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export function DeleteModeToggle() {
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const { isDeleteEnabled, enableDelete, disableDelete } = useDeleteProtection();

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
            "p-2 rounded-lg transition-all",
            showMenu 
              ? "bg-white/10 text-white" 
              : "text-slate-400 hover:text-white hover:bg-white/5"
          )}
          title="Settings"
        >
          <Settings className="w-5 h-5" />
        </button>

        {showMenu && (
          <>
            {/* Backdrop */}
            <div 
              className="fixed inset-0 z-40" 
              onClick={() => setShowMenu(false)}
            />
            
            {/* Menu */}
            <div className="absolute right-0 top-full mt-2 w-56 bg-gradient-to-br from-slate-900 to-slate-800 border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden">
              <div className="p-2">
                <button
                  onClick={handleToggle}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/10 transition-all text-left"
                >
                  {isDeleteEnabled ? (
                    <>
                      <div className="w-8 h-8 rounded-lg bg-red-500/20 flex items-center justify-center">
                        <Unlock className="w-4 h-4 text-red-400" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-white">Disable Delete Mode</p>
                        <p className="text-xs text-gray-400">Hide delete buttons</p>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="w-8 h-8 rounded-lg bg-yellow-500/20 flex items-center justify-center">
                        <Lock className="w-4 h-4 text-yellow-400" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-white">Enable Delete Mode</p>
                        <p className="text-xs text-gray-400">Show delete buttons</p>
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
