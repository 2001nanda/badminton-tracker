import { useEffect, useState, useMemo } from 'react';
import { collection, query, orderBy, onSnapshot, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Match } from '@/lib/types';

/**
 * Optimized hook for fetching matches with memoization
 * Reduces unnecessary re-renders by memoizing the matches array
 */
export function useOptimizedMatches(limitCount: number = 10) {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set a timeout to prevent infinite loading
    const timeout = setTimeout(() => {
      console.log('Matches loading timeout - setting loading to false');
      setLoading(false);
    }, 5000);

    try {
      const matchesRef = collection(db, 'matches');
      const q = query(matchesRef, orderBy('createdAt', 'desc'), limit(limitCount));

      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          clearTimeout(timeout);
          const matchesData = snapshot.docs.map((doc) => {
            const data = doc.data();
            return {
              id: doc.id,
              ...data,
              createdAt: data.createdAt?.toDate() || new Date(),
            } as Match;
          });
          setMatches(matchesData);
          setLoading(false);
        },
        (error) => {
          console.error('Error fetching matches:', error);
          clearTimeout(timeout);
          setLoading(false);
        }
      );

      return () => {
        clearTimeout(timeout);
        unsubscribe();
      };
    } catch (error) {
      console.error('Error setting up matches listener:', error);
      clearTimeout(timeout);
      setLoading(false);
      return () => {};
    }
  }, [limitCount]);

  // Memoize the matches array to prevent unnecessary re-renders
  const memoizedMatches = useMemo(() => matches, [matches]);

  return { matches: memoizedMatches, loading };
}
