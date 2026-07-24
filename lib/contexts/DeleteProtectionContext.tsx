'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { cleanupOldMatches } from '@/lib/actions/matchActions';

interface DeleteProtectionContextType {
  isDeleteEnabled: boolean;
  enableDelete: (password: string) => boolean;
  disableDelete: () => void;
}

const DeleteProtectionContext = createContext<DeleteProtectionContextType | undefined>(undefined);

const CORRECT_PASSWORD = 'iamnoob';
const STORAGE_KEY = 'delete_protection_enabled';

export function DeleteProtectionProvider({ children }: { children: ReactNode }) {
  const [isDeleteEnabled, setIsDeleteEnabled] = useState(false);

  // Load state from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'true') {
      setIsDeleteEnabled(true);
    }
  }, []);

  // Automatic cleanup of old matches (> 14 days) on app mount
  useEffect(() => {
    const runAutoCleanup = async () => {
      try {
        const lastRun = localStorage.getItem('last_match_cleanup_run');
        const now = Date.now();
        
        // Throttle: only run once every 24 hours (86,400,000 milliseconds)
        if (lastRun && now - parseInt(lastRun, 10) < 24 * 60 * 60 * 1000) {
          console.log('🧹 Auto-cleanup throttled (already checked in the last 24h).');
          return;
        }
        
        const result = await cleanupOldMatches();
        if (result.success) {
          localStorage.setItem('last_match_cleanup_run', now.toString());
        }
      } catch (error) {
        console.error('[Auto Cleanup] Failed to run match cleanup:', error);
      }
    };

    // Wait a brief delay after mounting to let initial queries finish
    const delayId = setTimeout(runAutoCleanup, 3000);
    return () => clearTimeout(delayId);
  }, []);

  const enableDelete = (password: string): boolean => {
    if (password === CORRECT_PASSWORD) {
      setIsDeleteEnabled(true);
      localStorage.setItem(STORAGE_KEY, 'true');
      return true;
    }
    return false;
  };

  const disableDelete = () => {
    setIsDeleteEnabled(false);
    localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <DeleteProtectionContext.Provider value={{ isDeleteEnabled, enableDelete, disableDelete }}>
      {children}
    </DeleteProtectionContext.Provider>
  );
}

export function useDeleteProtection() {
  const context = useContext(DeleteProtectionContext);
  if (context === undefined) {
    throw new Error('useDeleteProtection must be used within a DeleteProtectionProvider');
  }
  return context;
}
