import {
  collection,
  doc,
  Timestamp,
  runTransaction,
  writeBatch,
  query,
  where,
  getDocs,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Match } from '@/lib/types';
import { getCanonicalDuoKey } from '@/lib/utils/combinationStats';
import { getRetentionSettings, recordCleanupTimestamp } from '@/lib/actions/settingsActions';

export interface AddMatchOptions {
  customMatchId?: string;
}

// Global execution lock to prevent concurrent cleanups
let isCleanupExecuting = false;

export async function addMatch(
  matchData: Omit<Match, 'id' | 'createdAt'>,
  options?: AddMatchOptions
) {
  try {
    const isDoubles = matchData.type === 'doubles' && matchData.players.length >= 4;
    const allPlayers = matchData.players;
    const winners = matchData.winner;

    // Duo canonical keys for doubles
    const duoAKey = isDoubles ? getCanonicalDuoKey(allPlayers[0], allPlayers[1]) : null;
    const duoBKey = isDoubles ? getCanonicalDuoKey(allPlayers[2], allPlayers[3]) : null;

    // Single game scores
    const scoreA = matchData.score?.set1?.teamA ?? 0;
    const scoreB = matchData.score?.set1?.teamB ?? 0;

    // Use transaction to ensure atomic updates across matches, players, and partnershipStats
    await runTransaction(db, async (transaction) => {
      // ============================================
      // STEP 1: READ ALL REQUIRED DATA FIRST
      // ============================================

      // Read player documents
      const playerReads = await Promise.all(
        allPlayers.map(async (playerId) => {
          const playerRef = doc(db, 'players', playerId);
          const playerSnap = await transaction.get(playerRef);
          return {
            id: playerId,
            ref: playerRef,
            exists: playerSnap.exists(),
            data: playerSnap.exists() ? playerSnap.data() : null,
          };
        })
      );

      // Read partnership documents if doubles
      let duoASnap: any = null;
      let duoBSnap: any = null;
      let duoARef: any = null;
      let duoBRef: any = null;

      if (isDoubles && duoAKey && duoBKey) {
        duoARef = doc(db, 'partnershipStats', duoAKey);
        duoBRef = doc(db, 'partnershipStats', duoBKey);
        duoASnap = await transaction.get(duoARef);
        duoBSnap = await transaction.get(duoBRef);
      }

      // ============================================
      // STEP 2: COMPUTE UPDATED STATS
      // ============================================

      const playerDataMap = new Map(playerReads.map((p) => [p.id, p]));

      // Compute player updates
      const playerUpdates = allPlayers
        .map((playerId, idx) => {
          const playerInfo = playerDataMap.get(playerId);
          if (!playerInfo || !playerInfo.exists || !playerInfo.data) {
            return null;
          }

          const currentData = playerInfo.data;
          const isWinner = winners.includes(playerId);

          // Determine which team this player was on
          const isTeamA = matchData.type === 'singles' ? idx === 0 : idx < 2;
          const scored = isTeamA ? scoreA : scoreB;
          const conceded = isTeamA ? scoreB : scoreA;

          const currentStreak = currentData.streak || 0;
          const newStreak = isWinner
            ? currentStreak >= 0 ? currentStreak + 1 : 1
            : currentStreak <= 0 ? currentStreak - 1 : -1;

          const newWins = (currentData.wins || 0) + (isWinner ? 1 : 0);
          const newLosses = (currentData.losses || 0) + (isWinner ? 0 : 1);
          const newPointsScored = (currentData.pointsScored || 0) + scored;
          const newPointsConceded = (currentData.pointsConceded || 0) + conceded;

          const updates: Record<string, any> = {
            wins: newWins,
            losses: newLosses,
            streak: newStreak,
            pointsScored: newPointsScored,
            pointsConceded: newPointsConceded,
          };

          if (matchData.type === 'singles') {
            updates.singlesMatches = (currentData.singlesMatches || 0) + 1;
            updates.singlesWins = (currentData.singlesWins || 0) + (isWinner ? 1 : 0);
            updates.singlesLosses = (currentData.singlesLosses || 0) + (isWinner ? 0 : 1);
          } else {
            updates.doublesMatches = (currentData.doublesMatches || 0) + 1;
            updates.doublesWins = (currentData.doublesWins || 0) + (isWinner ? 1 : 0);
            updates.doublesLosses = (currentData.doublesLosses || 0) + (isWinner ? 0 : 1);
          }

          return {
            ref: playerInfo.ref,
            updates,
          };
        })
        .filter((u): u is NonNullable<typeof u> => u !== null);

      // Compute partnership updates if doubles
      let duoAUpdate: any = null;
      let duoBUpdate: any = null;

      if (isDoubles && duoAKey && duoBKey && duoARef && duoBRef) {
        const isTeamAWinner = winners.includes(allPlayers[0]);

        // Helper for partnership updates
        const updateDuo = (
          snap: any,
          canonicalId: string,
          p1: string,
          p2: string,
          isWin: boolean,
          ptsScored: number,
          ptsConceded: number
        ) => {
          const current = snap.exists() ? snap.data() : null;
          const totalMatches = (current?.totalMatches || 0) + 1;
          const wins = (current?.wins || 0) + (isWin ? 1 : 0);
          const losses = (current?.losses || 0) + (isWin ? 0 : 1);
          const pointsScored = (current?.pointsScored || 0) + ptsScored;
          const pointsConceded = (current?.pointsConceded || 0) + ptsConceded;

          const streak = current?.currentWinningStreak || 0;
          const newStreak = isWin ? (streak >= 0 ? streak + 1 : 1) : (streak <= 0 ? streak - 1 : -1);
          const longest = Math.max(current?.longestWinningStreak || 0, isWin ? newStreak : 0);

          const sortedPlayers = [p1, p2].sort() as [string, string];

          return {
            id: canonicalId,
            playerIds: sortedPlayers,
            totalMatches,
            wins,
            losses,
            pointsScored,
            pointsConceded,
            currentWinningStreak: newStreak,
            longestWinningStreak: longest,
            updatedAt: Timestamp.now(),
          };
        };

        duoAUpdate = updateDuo(
          duoASnap,
          duoAKey,
          allPlayers[0],
          allPlayers[1],
          isTeamAWinner,
          scoreA,
          scoreB
        );

        duoBUpdate = updateDuo(
          duoBSnap,
          duoBKey,
          allPlayers[2],
          allPlayers[3],
          !isTeamAWinner,
          scoreB,
          scoreA
        );
      }

      // ============================================
      // STEP 3: PERFORM ALL WRITES ATOMICALLY
      // ============================================

      // Write 1: Create the match document
      const matchRef = options?.customMatchId
        ? doc(db, 'matches', options.customMatchId)
        : doc(collection(db, 'matches'));

      transaction.set(matchRef, {
        ...matchData,
        createdAt: Timestamp.now(),
      });

      // Write 2: Update all player lifetime statistics
      for (const playerUpdate of playerUpdates) {
        transaction.update(playerUpdate.ref, playerUpdate.updates);
      }

      // Write 3: Update doubles partnership statistics
      if (isDoubles && duoAUpdate && duoBUpdate && duoARef && duoBRef) {
        transaction.set(duoARef, duoAUpdate, { merge: true });
        transaction.set(duoBRef, duoBUpdate, { merge: true });
      }
    });

    return { success: true };
  } catch (error) {
    console.error('Error adding match:', error);
    return { success: false, error };
  }
}

/**
 * Manual Match Deletion:
 * When an admin manually deletes a match, reverse its contribution to player
 * lifetime statistics and doubles partnership statistics.
 */
export async function deleteMatch(matchId: string) {
  try {
    console.log('🗑️ Deleting match manually:', matchId);

    await runTransaction(db, async (transaction) => {
      // STEP 1: READ MATCH DOCUMENT
      const matchRef = doc(db, 'matches', matchId);
      const matchSnap = await transaction.get(matchRef);

      if (!matchSnap.exists()) {
        throw new Error('Match not found');
      }

      const matchData = matchSnap.data() as Match;
      const allPlayers = matchData.players;
      const winners = matchData.winner;
      const isDoubles = matchData.type === 'doubles' && allPlayers.length >= 4;

      // Extract points scored by each team
      const scoreA =
        (matchData.score?.set1?.teamA || 0) +
        (matchData.score?.set2?.teamA || 0) +
        (matchData.score?.set3?.teamA || 0);
      const scoreB =
        (matchData.score?.set1?.teamB || 0) +
        (matchData.score?.set2?.teamB || 0) +
        (matchData.score?.set3?.teamB || 0);

      // Read players
      const playerReads = await Promise.all(
        allPlayers.map(async (playerId) => {
          const playerRef = doc(db, 'players', playerId);
          const playerSnap = await transaction.get(playerRef);
          return {
            id: playerId,
            ref: playerRef,
            exists: playerSnap.exists(),
            data: playerSnap.exists() ? playerSnap.data() : null,
          };
        })
      );

      // Read partnerships if doubles
      let duoARef: any = null;
      let duoBRef: any = null;
      let duoASnap: any = null;
      let duoBSnap: any = null;

      if (isDoubles) {
        const keyA = getCanonicalDuoKey(allPlayers[0], allPlayers[1]);
        const keyB = getCanonicalDuoKey(allPlayers[2], allPlayers[3]);
        duoARef = doc(db, 'partnershipStats', keyA);
        duoBRef = doc(db, 'partnershipStats', keyB);
        duoASnap = await transaction.get(duoARef);
        duoBSnap = await transaction.get(duoBRef);
      }

      // STEP 2: COMPUTE REVERSALS
      const playerDataMap = new Map(playerReads.map((p) => [p.id, p]));

      const playerUpdates = allPlayers
        .map((playerId, idx) => {
          const playerInfo = playerDataMap.get(playerId);
          if (!playerInfo || !playerInfo.exists || !playerInfo.data) return null;

          const current = playerInfo.data;
          const isWinner = winners.includes(playerId);
          const isTeamA = matchData.type === 'singles' ? idx === 0 : idx < 2;
          const scored = isTeamA ? scoreA : scoreB;
          const conceded = isTeamA ? scoreB : scoreA;

          const updates: Record<string, any> = {
            wins: Math.max(0, (current.wins || 0) - (isWinner ? 1 : 0)),
            losses: Math.max(0, (current.losses || 0) - (isWinner ? 0 : 1)),
            pointsScored: Math.max(0, (current.pointsScored || 0) - scored),
            pointsConceded: Math.max(0, (current.pointsConceded || 0) - conceded),
          };

          if (matchData.type === 'singles') {
            updates.singlesMatches = Math.max(0, (current.singlesMatches || 0) - 1);
            updates.singlesWins = Math.max(0, (current.singlesWins || 0) - (isWinner ? 1 : 0));
            updates.singlesLosses = Math.max(0, (current.singlesLosses || 0) - (isWinner ? 0 : 1));
          } else {
            updates.doublesMatches = Math.max(0, (current.doublesMatches || 0) - 1);
            updates.doublesWins = Math.max(0, (current.doublesWins || 0) - (isWinner ? 1 : 0));
            updates.doublesLosses = Math.max(0, (current.doublesLosses || 0) - (isWinner ? 0 : 1));
          }

          return { ref: playerInfo.ref, updates };
        })
        .filter((u): u is NonNullable<typeof u> => u !== null);

      // Reverse partnerships
      let duoAUpdate: any = null;
      let duoBUpdate: any = null;

      if (isDoubles && duoASnap?.exists() && duoBSnap?.exists()) {
        const isTeamAWinner = winners.includes(allPlayers[0]);

        const reverseDuo = (snap: any, isWin: boolean, ptsScored: number, ptsConceded: number) => {
          const current = snap.data();
          return {
            totalMatches: Math.max(0, (current.totalMatches || 0) - 1),
            wins: Math.max(0, (current.wins || 0) - (isWin ? 1 : 0)),
            losses: Math.max(0, (current.losses || 0) - (isWin ? 0 : 1)),
            pointsScored: Math.max(0, (current.pointsScored || 0) - ptsScored),
            pointsConceded: Math.max(0, (current.pointsConceded || 0) - ptsConceded),
            updatedAt: Timestamp.now(),
          };
        };

        duoAUpdate = reverseDuo(duoASnap, isTeamAWinner, scoreA, scoreB);
        duoBUpdate = reverseDuo(duoBSnap, !isTeamAWinner, scoreB, scoreA);
      }

      // STEP 3: PERFORM WRITES
      transaction.delete(matchRef);

      for (const pu of playerUpdates) {
        transaction.update(pu.ref, pu.updates);
      }

      if (isDoubles && duoAUpdate && duoBUpdate && duoARef && duoBRef) {
        transaction.update(duoARef, duoAUpdate);
        transaction.update(duoBRef, duoBUpdate);
      }
    });

    console.log('✅ Match deleted and stats reversed successfully:', matchId);
    return { success: true };
  } catch (error) {
    console.error('❌ Error deleting match:', error);
    return { success: false, error };
  }
}

export async function deleteMultipleMatches(matchIds: string[]) {
  try {
    for (const matchId of matchIds) {
      await deleteMatch(matchId);
    }
    return { success: true };
  } catch (error) {
    console.error('Error deleting matches:', error);
    return { success: false, error };
  }
}

/**
 * Match History Retention Cleanup:
 * - Controlled by persistent Firestore settings (OFF by default).
 * - Exits immediately if autoDeleteEnabled is false, making ZERO deletions.
 * - If enabled, deletes detailed match records older than the configured retention period (default 14 days).
 * - NEVER deletes or alters player documents, lifetime counters, or partnership statistics.
 * - Concurrency protected: cannot execute multiple instances simultaneously.
 */
export async function cleanupOldMatches(options?: { force?: boolean }) {
  if (isCleanupExecuting) {
    console.log('🧹 Cleanup already in progress, skipping concurrent execution.');
    return { success: false, error: 'Cleanup already running' };
  }

  isCleanupExecuting = true;

  try {
    // Step 1: Read persistent settings from Firestore
    const settings = await getRetentionSettings();

    // Step 2: Check if enabled
    if (!settings.autoDeleteEnabled && !options?.force) {
      console.log('🧹 Match history auto-delete is DISABLED in Settings (OFF by default). No matches will be deleted.');
      return { success: true, deletedCount: 0, disabled: true };
    }

    const retentionDays = settings.retentionDays || 14;
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

    console.log(`🧹 Running match history cleanup: pruning matches older than ${retentionDays} days (before ${cutoffDate.toISOString()})...`);
    const matchesRef = collection(db, 'matches');
    const q = query(matchesRef, where('createdAt', '<', Timestamp.fromDate(cutoffDate)));

    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) {
      console.log(`🧹 Auto-cleanup: No matches older than ${retentionDays} days found.`);
      await recordCleanupTimestamp(0);
      return { success: true, deletedCount: 0 };
    }

    const batch = writeBatch(db);
    querySnapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });

    await batch.commit();
    await recordCleanupTimestamp(querySnapshot.size);

    console.log(
      `🧹 Auto-cleanup: Successfully pruned ${querySnapshot.size} expired match records. Lifetime player and partnership statistics remain permanent.`
    );
    return { success: true, deletedCount: querySnapshot.size };
  } catch (error) {
    console.error('🧹 Auto-cleanup Error: Failed to execute match cleanup:', error);
    return { success: false, error };
  } finally {
    isCleanupExecuting = false;
  }
}
