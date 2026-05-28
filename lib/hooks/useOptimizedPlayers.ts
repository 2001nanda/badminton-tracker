import { useEffect, useState, useMemo } from 'react';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Player } from '@/lib/types';

/**
 * Optimized hook for fetching players with memoization
 * Reduces unnecessary re-renders by memoizing the players array
 */
export function useOptimizedPlayers() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set a timeout to prevent infinite loading
    const timeout = setTimeout(() => {
      console.log('Players loading timeout - setting loading to false');
      setLoading(false);
    }, 5000);

    try {
      const playersRef = collection(db, 'players');
      const q = query(playersRef, orderBy('name', 'asc'));

      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          clearTimeout(timeout);
          const playersData = snapshot.docs.map((doc) => {
            const data = doc.data();
            return {
              id: doc.id,
              ...data,
              createdAt: data.createdAt?.toDate() || new Date(),
            } as Player;
          });
          setPlayers(playersData);
          setLoading(false);
        },
        (error) => {
          console.error('Error fetching players:', error);
          clearTimeout(timeout);
          setLoading(false);
        }
      );

      return () => {
        clearTimeout(timeout);
        unsubscribe();
      };
    } catch (error) {
      console.error('Error setting up players listener:', error);
      clearTimeout(timeout);
      setLoading(false);
      return () => {};
    }
  }, []);

  // Memoize the players array to prevent unnecessary re-renders
  const memoizedPlayers = useMemo(() => players, [players]);

  // Create a player lookup map for O(1) access
  const playerMap = useMemo(() => {
    return new Map(players.map((player) => [player.id, player]));
  }, [players]);

  return { 
    players: memoizedPlayers, 
    playerMap,
    loading 
  };
}
