import { doc, getDoc, setDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { RetentionSettings } from '@/lib/types';

export const DEFAULT_RETENTION_SETTINGS: RetentionSettings = {
  autoDeleteEnabled: false, // Default is strictly OFF
  retentionDays: 14,
  lastCleanupAt: null,
};

/**
 * Fetch persistent retention settings from Firestore.
 * If not yet created in the database, safely defaults to OFF (autoDeleteEnabled = false).
 */
export async function getRetentionSettings(): Promise<RetentionSettings> {
  try {
    const settingsRef = doc(db, 'systemSettings', 'matchRetention');
    const snap = await getDoc(settingsRef);

    if (!snap.exists()) {
      return { ...DEFAULT_RETENTION_SETTINGS };
    }

    const data = snap.data();
    return {
      autoDeleteEnabled: Boolean(data.autoDeleteEnabled), // Defaults to false
      retentionDays: typeof data.retentionDays === 'number' ? data.retentionDays : 14,
      lastCleanupAt: data.lastCleanupAt?.toDate ? data.lastCleanupAt.toDate() : (data.lastCleanupAt ? new Date(data.lastCleanupAt) : null),
      updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : undefined,
      updatedBy: data.updatedBy,
    };
  } catch (error) {
    console.error('Error fetching retention settings from Firestore:', error);
    // On any error, fail safe: autoDeleteEnabled is OFF
    return { ...DEFAULT_RETENTION_SETTINGS };
  }
}

/**
 * Update retention settings in Firestore.
 */
export async function updateRetentionSettings(
  updates: Partial<RetentionSettings>,
  updatedBy?: string
): Promise<{ success: boolean; error?: any }> {
  try {
    const settingsRef = doc(db, 'systemSettings', 'matchRetention');
    await setDoc(
      settingsRef,
      {
        ...updates,
        updatedAt: Timestamp.now(),
        ...(updatedBy ? { updatedBy } : {}),
      },
      { merge: true }
    );
    return { success: true };
  } catch (error) {
    console.error('Error updating retention settings:', error);
    return { success: false, error };
  }
}

/**
 * Record a completed cleanup timestamp in Firestore.
 */
export async function recordCleanupTimestamp(deletedCount: number): Promise<void> {
  try {
    const settingsRef = doc(db, 'systemSettings', 'matchRetention');
    await setDoc(
      settingsRef,
      {
        lastCleanupAt: Timestamp.now(),
        lastCleanupDeletedCount: deletedCount,
        updatedAt: Timestamp.now(),
      },
      { merge: true }
    );
  } catch (error) {
    console.error('Error recording cleanup timestamp:', error);
  }
}

