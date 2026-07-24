import { collection, addDoc, doc, updateDoc, Timestamp, runTransaction, deleteDoc, writeBatch, getDoc, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Match } from '@/lib/types';

export async function addMatch(matchData: Omit<Match, 'id' | 'createdAt'>) {
  try {
    // Use transaction to ensure atomic updates
    await runTransaction(db, async (transaction) => {
      // ============================================
      // STEP 1: READ ALL REQUIRED DATA FIRST
      // ============================================
      
      const allPlayers = matchData.players;
      const winners = matchData.winner;
      const losers = allPlayers.filter((id) => !winners.includes(id));

      // Read all player documents (both winners and losers)
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

      // ============================================
      // STEP 2: COMPUTE UPDATED STATS
      // ============================================
      
      // Create a map for easy lookup
      const playerDataMap = new Map(
        playerReads.map((p) => [p.id, p])
      );

      // Calculate new stats for each player
      const playerUpdates = allPlayers.map((playerId) => {
        const playerInfo = playerDataMap.get(playerId);
        if (!playerInfo || !playerInfo.exists || !playerInfo.data) {
          return null;
        }

        const currentData = playerInfo.data;
        const isWinner = winners.includes(playerId);

        if (isWinner) {
          // Winner: increment wins, update positive streak
          const currentStreak = currentData.streak || 0;
          const newStreak = currentStreak >= 0 ? currentStreak + 1 : 1;
          
          return {
            ref: playerInfo.ref,
            updates: {
              wins: (currentData.wins || 0) + 1,
              losses: currentData.losses || 0,
              streak: newStreak,
            },
          };
        } else {
          // Loser: increment losses, update negative streak
          const currentStreak = currentData.streak || 0;
          const newStreak = currentStreak <= 0 ? currentStreak - 1 : -1;
          
          return {
            ref: playerInfo.ref,
            updates: {
              wins: currentData.wins || 0,
              losses: (currentData.losses || 0) + 1,
              streak: newStreak,
            },
          };
        }
      }).filter((update): update is NonNullable<typeof update> => update !== null);

      // ============================================
      // STEP 3: PERFORM ALL WRITES
      // ============================================
      
      // Write 1: Create the match document
      const matchRef = doc(collection(db, 'matches'));
      transaction.set(matchRef, {
        ...matchData,
        createdAt: Timestamp.now(),
      });

      // Write 2: Update all player stats
      for (const playerUpdate of playerUpdates) {
        transaction.update(playerUpdate.ref, playerUpdate.updates);
      }
    });

    return { success: true };
  } catch (error) {
    console.error('Error adding match:', error);
    return { success: false, error };
  }
}

export async function deleteMatch(matchId: string) {
  try {
    console.log('🗑️ Deleting match:', matchId);
    
    // Use transaction to ensure atomic updates
    await runTransaction(db, async (transaction) => {
      // ============================================
      // STEP 1: READ MATCH AND PLAYER DATA
      // ============================================
      
      // Read the match document first
      const matchRef = doc(db, 'matches', matchId);
      const matchSnap = await transaction.get(matchRef);
      
      if (!matchSnap.exists()) {
        console.error('❌ Match not found:', matchId);
        throw new Error('Match not found');
      }
      
      const matchData = matchSnap.data() as Match;
      console.log('📄 Match data:', matchData);
      
      const allPlayers = matchData.players;
      const winners = matchData.winner;
      
      console.log('👥 Players in match:', allPlayers);
      console.log('🏆 Winners:', winners);
      
      // Read all player documents
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
      
      // ============================================
      // STEP 2: COMPUTE UPDATED STATS (REVERSE)
      // ============================================
      
      // Create a map for easy lookup
      const playerDataMap = new Map(
        playerReads.map((p) => [p.id, p])
      );
      
      // Calculate updated stats for each player (reverse the match impact)
      const playerUpdates = allPlayers.map((playerId) => {
        const playerInfo = playerDataMap.get(playerId);
        if (!playerInfo || !playerInfo.exists || !playerInfo.data) {
          return null;
        }
        
        const currentData = playerInfo.data;
        const isWinner = winners.includes(playerId);
        
        if (isWinner) {
          // Was a winner: decrement wins
          const newWins = Math.max(0, (currentData.wins || 0) - 1);
          
          console.log(`✅ Updating winner ${playerId}: ${currentData.wins} wins → ${newWins} wins`);
          
          return {
            ref: playerInfo.ref,
            updates: {
              wins: newWins,
              losses: currentData.losses || 0,
              streak: 0,
            },
          };
        } else {
          // Was a loser: decrement losses
          const newLosses = Math.max(0, (currentData.losses || 0) - 1);
          
          console.log(`❌ Updating loser ${playerId}: ${currentData.losses} losses → ${newLosses} losses`);
          
          return {
            ref: playerInfo.ref,
            updates: {
              wins: currentData.wins || 0,
              losses: newLosses,
              streak: 0,
            },
          };
        }
      }).filter((update): update is NonNullable<typeof update> => update !== null);
      
      // ============================================
      // STEP 3: PERFORM ALL WRITES
      // ============================================
      
      console.log('💾 Deleting match and updating', playerUpdates.length, 'players');
      
      // Write 1: Delete the match document
      transaction.delete(matchRef);
      
      // Write 2: Update all player stats
      for (const playerUpdate of playerUpdates) {
        transaction.update(playerUpdate.ref, playerUpdate.updates);
      }
    });
    
    console.log('✅ Match deleted successfully:', matchId);
    return { success: true };
  } catch (error) {
    console.error('❌ Error deleting match:', error);
    return { success: false, error };
  }
}

export async function deleteMultipleMatches(matchIds: string[]) {
  try {
    // Process each match deletion with proper player stat updates
    // We need to do this sequentially to ensure proper transaction handling
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
 * Automatically cleans up (deletes) matches older than 14 days
 * without updating/decrementing player statistics.
 */
export async function cleanupOldMatches() {
  try {
    const fourteenDaysAgo = new Date();
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

    console.log('🧹 Running automatic cleanup of matches older than 14 days...');
    const matchesRef = collection(db, 'matches');
    const q = query(matchesRef, where('createdAt', '<', Timestamp.fromDate(fourteenDaysAgo)));
    
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) {
      console.log('🧹 Auto-cleanup: No matches older than 14 days found.');
      return { success: true, deletedCount: 0 };
    }

    const batch = writeBatch(db);
    querySnapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });

    await batch.commit();
    console.log(`🧹 Auto-cleanup: Successfully deleted ${querySnapshot.size} matches older than 14 days.`);
    return { success: true, deletedCount: querySnapshot.size };
  } catch (error) {
    console.error('🧹 Auto-cleanup Error: Failed to cleanup old matches:', error);
    return { success: false, error };
  }
}
