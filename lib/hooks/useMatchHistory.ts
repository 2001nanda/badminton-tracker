'use client';

import { useMemo } from 'react';
import { useMatches, useMatchesThisWeek, useMatchesThisMonth } from './useMatches';
import { useOptimizedPlayers } from './useOptimizedPlayers';
import { getCanonicalDuoKey } from '@/lib/utils/combinationStats';

interface UseMatchHistoryOptions {
  searchQuery: string;
  filterType: 'all' | 'singles' | 'doubles';
  filterPeriod: 'all' | 'week' | 'month';
  filterPlayer: string;
  filterPartnership?: string;
  filterWinner?: string;
}

export function useMatchHistory(options: UseMatchHistoryOptions) {
  const { matches: allMatches, loading: allLoading } = useMatches();
  const { matches: weekMatches, loading: weekLoading } = useMatchesThisWeek();
  const { matches: monthMatches, loading: monthLoading } = useMatchesThisMonth();
  const { players, playerMap } = useOptimizedPlayers();

  const {
    searchQuery,
    filterType,
    filterPeriod,
    filterPlayer,
    filterPartnership = 'all',
    filterWinner = 'all',
  } = options;

  // Select matches based on period
  const baseMatches = useMemo(() => {
    if (filterPeriod === 'week') return weekMatches;
    if (filterPeriod === 'month') return monthMatches;
    return allMatches;
  }, [filterPeriod, allMatches, weekMatches, monthMatches]);

  const loading =
    filterPeriod === 'week'
      ? weekLoading
      : filterPeriod === 'month'
      ? monthLoading
      : allLoading;

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

      // Filter by partnership (doubles only)
      if (filterPartnership !== 'all') {
        if (match.type !== 'doubles' || match.players.length < 4) return false;
        const keyA = getCanonicalDuoKey(match.players[0], match.players[1]);
        const keyB = getCanonicalDuoKey(match.players[2], match.players[3]);
        if (keyA !== filterPartnership && keyB !== filterPartnership) {
          return false;
        }
      }

      // Filter by winner
      if (filterWinner !== 'all') {
        if (!match.winner || !match.winner.includes(filterWinner)) {
          return false;
        }
      }

      // Search by player names
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const playerNames = match.players
          .map((id) => playerMap.get(id)?.name || '')
          .join(' ')
          .toLowerCase();

        if (!playerNames.includes(query)) {
          return false;
        }
      }

      return true;
    });
  }, [baseMatches, filterType, filterPlayer, filterPartnership, filterWinner, searchQuery, playerMap]);

  return {
    matches: filteredMatches,
    loading,
  };
}
