'use client';

import { useState, useEffect, useCallback } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { RetentionSettings } from '@/lib/types';
import {
  DEFAULT_RETENTION_SETTINGS,
  updateRetentionSettings as updateSettingsAction,
} from '@/lib/actions/settingsActions';

export function useRetentionSettings() {
  const [settings, setSettings] = useState<RetentionSettings>(DEFAULT_RETENTION_SETTINGS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const settingsRef = doc(db, 'systemSettings', 'matchRetention');
      const unsubscribe = onSnapshot(
        settingsRef,
        (snapshot) => {
          if (snapshot.exists()) {
            const data = snapshot.data();
            setSettings({
              autoDeleteEnabled: Boolean(data.autoDeleteEnabled), // Defaults to false
              retentionDays: typeof data.retentionDays === 'number' ? data.retentionDays : 14,
              lastCleanupAt: data.lastCleanupAt?.toDate
                ? data.lastCleanupAt.toDate()
                : data.lastCleanupAt
                ? new Date(data.lastCleanupAt)
                : null,
              updatedAt: data.updatedAt?.toDate
                ? data.updatedAt.toDate()
                : data.updatedAt
                ? new Date(data.updatedAt)
                : undefined,
              updatedBy: data.updatedBy,
            });
          } else {
            // Document does not exist yet -> strictly OFF by default
            setSettings({ ...DEFAULT_RETENTION_SETTINGS });
          }
          setLoading(false);
        },
        (error) => {
          console.error('Error listening to retention settings:', error);
          setSettings({ ...DEFAULT_RETENTION_SETTINGS });
          setLoading(false);
        }
      );

      return () => unsubscribe();
    } catch (err) {
      console.error('Failed to setup retention settings listener:', err);
      setSettings({ ...DEFAULT_RETENTION_SETTINGS });
      setLoading(false);
    }
  }, []);

  const updateSettings = useCallback(
    async (updates: Partial<RetentionSettings>, userEmail?: string) => {
      return await updateSettingsAction(updates, userEmail);
    },
    []
  );

  return {
    settings,
    loading,
    updateSettings,
  };
}

