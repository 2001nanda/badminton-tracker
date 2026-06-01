'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

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
