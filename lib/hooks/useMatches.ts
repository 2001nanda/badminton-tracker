import { useEffect, useState } from 'react';
import { collection, query, orderBy, onSnapshot, limit, where, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Match } from '@/lib/types';
import { startOfWeek, startOfMonth } from 'date-fns';

export function useMatches(limitCount?: number) {
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
      const q = limitCount
        ? query(matchesRef, orderBy('createdAt', 'desc'), limit(limitCount))
        : query(matchesRef, orderBy('createdAt', 'desc'));

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

  return { matches, loading };
}

export function useMatchesByPlayer(playerId: string) {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!playerId) {
      setMatches([]);
      setLoading(false);
      return;
    }

    // Set a timeout to prevent infinite loading
    const timeout = setTimeout(() => {
      console.log('Player matches loading timeout - setting loading to false');
      setLoading(false);
    }, 5000);

    try {
      const matchesRef = collection(db, 'matches');
      const q = query(
        matchesRef,
        where('players', 'array-contains', playerId),
        orderBy('createdAt', 'desc')
      );

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
          console.error('Error fetching player matches:', error);
          clearTimeout(timeout);
          setLoading(false);
        }
      );

      return () => {
        clearTimeout(timeout);
        unsubscribe();
      };
    } catch (error) {
      console.error('Error setting up player matches listener:', error);
      clearTimeout(timeout);
      setLoading(false);
      return () => {};
    }
  }, [playerId]);

  return { matches, loading };
}

export function useMatchesThisWeek() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set a timeout to prevent infinite loading
    const timeout = setTimeout(() => {
      console.log('Weekly matches loading timeout - setting loading to false');
      setLoading(false);
    }, 5000);

    try {
      const weekStart = startOfWeek(new Date(), { weekStartsOn: 0 });

      const matchesRef = collection(db, 'matches');
      const q = query(
        matchesRef,
        where('createdAt', '>=', Timestamp.fromDate(weekStart)),
        orderBy('createdAt', 'desc')
      );

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
          console.error('Error fetching weekly matches:', error);
          clearTimeout(timeout);
          setLoading(false);
        }
      );

      return () => {
        clearTimeout(timeout);
        unsubscribe();
      };
    } catch (error) {
      console.error('Error setting up weekly matches listener:', error);
      clearTimeout(timeout);
      setLoading(false);
      return () => {};
    }
  }, []);

  return { matches, loading };
}

export function useMatchesThisMonth() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set a timeout to prevent infinite loading
    const timeout = setTimeout(() => {
      console.log('Monthly matches loading timeout - setting loading to false');
      setLoading(false);
    }, 5000);

    try {
      const monthStart = startOfMonth(new Date());

      const matchesRef = collection(db, 'matches');
      const q = query(
        matchesRef,
        where('createdAt', '>=', Timestamp.fromDate(monthStart)),
        orderBy('createdAt', 'desc')
      );

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
          console.error('Error fetching monthly matches:', error);
          clearTimeout(timeout);
          setLoading(false);
        }
      );

      return () => {
        clearTimeout(timeout);
        unsubscribe();
      };
    } catch (error) {
      console.error('Error setting up monthly matches listener:', error);
      clearTimeout(timeout);
      setLoading(false);
      return () => {};
    }
  }, []);

  return { matches, loading };
}
