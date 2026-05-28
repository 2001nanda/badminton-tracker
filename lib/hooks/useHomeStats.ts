import { useMemo } from 'react';
import { useOptimizedPlayers } from './useOptimizedPlayers';
import { useMatchesThisWeek } from './useMatches';
import { HomeStats } from '@/lib/types';

export function useHomeStats(): { stats: HomeStats; loading: boolean } {
  const { players, loading: playersLoading } = useOptimizedPlayers();
  const { matches, loading: matchesLoading } = useMatchesThisWeek();

  const stats = useMemo(() => {
    if (playersLoading || matchesLoading || players.length === 0) {
      return {
        courtKing: null,
        currentStreak: null,
        mostWinsThisWeek: null,
        mostActive: null,
      };
    }

    // Court King - player with most total wins
    const courtKing = [...players].sort((a, b) => b.wins - a.wins)[0];

    // Current Winning Streak - player with highest current streak
    const currentStreak = [...players].sort((a, b) => b.streak - a.streak)[0];

    // Most Wins This Week
    const winsThisWeek = new Map<string, number>();
    matches.forEach((match) => {
      match.winner.forEach((winnerId) => {
        winsThisWeek.set(winnerId, (winsThisWeek.get(winnerId) || 0) + 1);
      });
    });

    let mostWinsThisWeek = null;
    let maxWins = 0;
    winsThisWeek.forEach((wins, playerId) => {
      if (wins > maxWins) {
        maxWins = wins;
        const player = players.find((p) => p.id === playerId);
        if (player) {
          mostWinsThisWeek = { id: player.id, name: player.name, wins };
        }
      }
    });

    // Most Active Player - player with most matches this week
    const matchCounts = new Map<string, number>();
    matches.forEach((match) => {
      match.players.forEach((playerId) => {
        matchCounts.set(playerId, (matchCounts.get(playerId) || 0) + 1);
      });
    });

    let mostActive = null;
    let maxMatches = 0;
    matchCounts.forEach((count, playerId) => {
      if (count > maxMatches) {
        maxMatches = count;
        const player = players.find((p) => p.id === playerId);
        if (player) {
          mostActive = { id: player.id, name: player.name, matches: count };
        }
      }
    });

    return {
      courtKing: courtKing
        ? { id: courtKing.id, name: courtKing.name, wins: courtKing.wins }
        : null,
      currentStreak: currentStreak && currentStreak.streak > 0
        ? { id: currentStreak.id, name: currentStreak.name, streak: currentStreak.streak }
        : null,
      mostWinsThisWeek,
      mostActive,
    };
  }, [players, matches, playersLoading, matchesLoading]);

  return { stats, loading: playersLoading || matchesLoading };
}
