'use client';

import { memo, useState } from 'react';
import { Lock, X, Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PasswordDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const PasswordDialog = memo(function PasswordDialog({
  isOpen,
  onClose,
  onSuccess,
}: PasswordDialogProps) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password === 'iamnoob') {
      onSuccess();
      setPassword('');
      setError('');
      onClose();
    } else {
      setError('Incorrect password');
      setPassword('');
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
      setPassword('');
      setError('');
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={handleBackdropClick}
    >
      <div className="relative w-full max-w-md bg-gradient-to-br from-slate-900 to-slate-800 border border-white/10 rounded-2xl shadow-2xl animate-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          onClick={() => {
            onClose();
            setPassword('');
            setError('');
          }}
          className="absolute top-4 right-4 p-1 rounded-lg hover:bg-white/10 transition-colors text-gray-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Content */}
        <div className="p-6">
          {/* Icon */}
          <div className="w-12 h-12 rounded-full bg-yellow-500/20 flex items-center justify-center mb-4">
            <Lock className="w-6 h-6 text-yellow-400" />
          </div>

          {/* Title */}
          <h3 className="text-xl font-bold text-white mb-2">
            Enable Delete Mode
          </h3>

          {/* Description */}
          <p className="text-gray-400 text-sm leading-relaxed mb-6">
            Enter the password to unlock delete functionality for matches.
          </p>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError('');
                }}
                placeholder="Enter password"
                className={cn(
                  "w-full px-4 py-3 pr-12 rounded-xl bg-white/5 border text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 transition-all",
                  error 
                    ? "border-red-500/50 focus:ring-red-500/50" 
                    : "border-white/10 focus:ring-emerald-500/50"
                )}
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg hover:bg-white/10 transition-colors text-gray-400 hover:text-white"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>

            {error && (
              <p className="text-red-400 text-sm flex items-center gap-2">
                <span className="w-1 h-1 rounded-full bg-red-400"></span>
                {error}
              </p>
            )}

            {/* Actions */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  setPassword('');
                  setError('');
                }}
                className="flex-1 px-4 py-2.5 rounded-xl font-semibold transition-all bg-white/5 hover:bg-white/10 text-white border border-white/10"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!password}
                className={cn(
                  "flex-1 px-4 py-2.5 rounded-xl font-semibold transition-all shadow-lg",
                  "bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white",
                  !password && "opacity-50 cursor-not-allowed"
                )}
              >
                Unlock
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
});
