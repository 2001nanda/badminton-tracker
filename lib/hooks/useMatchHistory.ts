import { useMemo } from 'react';
import { useMatches, useMatchesThisWeek, useMatchesThisMonth } from './useMatches';
import { useOptimizedPlayers } from './useOptimizedPlayers';

interface UseMatchHistoryOptions {
  searchQuery: string;
  filterType: 'all' | 'singles' | 'doubles';
  filterPeriod: 'all' | 'week' | 'month';
  filterPlayer: string;
}

export function useMatchHistory(options: UseMatchHistoryOptions) {
  const { matches: allMatches, loading: allLoading } = useMatches();
  const { matches: weekMatches, loading: weekLoading } = useMatchesThisWeek();
  const { matches: monthMatches, loading: monthLoading } = useMatchesThisMonth();
  const { players } = useOptimizedPlayers();

  const { searchQuery, filterType, filterPeriod, filterPlayer } = options;

  // Select matches based on period
  const baseMatches = useMemo(() => {
    if (filterPeriod === 'week') return weekMatches;
    if (filterPeriod === 'month') return monthMatches;
    return allMatches;
  }, [filterPeriod, allMatches, weekMatches, monthMatches]);

  const loading = filterPeriod === 'week' ? weekLoading : 
                  filterPeriod === 'month' ? monthLoading : 
                  allLoading;

  // Apply filters
  const filteredMatches = useMemo(() => {
    return baseMatches.filter((match) => {
      // Filter by type
      if (filterType !== 'all' && match.type !== filterType) {
        return false;
      }

      // Filter by player
      if (filterPlayer !== 'all' && !match.players.includes(filterPlayer)) {
        return false;
      }

      // Search by player names
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const playerNames = match.players
          .map((id) => players.find((p) => p.id === id)?.name || '')
          .join(' ')
          .toLowerCase();
        
        if (!playerNames.includes(query)) {
          return false;
        }
      }

      return true;
    });
  }, [baseMatches, filterType, filterPlayer, searchQuery, players]);

  return {
    matches: filteredMatches,
    loading,
  };
}
