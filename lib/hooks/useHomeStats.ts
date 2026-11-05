import { useMemo } from 'react';
import { useOptimizedPlayers } from './useOptimizedPlayers';
import { useMatchesThisWeek, useMatches } from './useMatches';
import { HomeStats } from '@/lib/types';
import { calculateAllPartnershipStats } from '@/lib/utils/combinationStats';

export function useHomeStats(): { stats: HomeStats; loading: boolean } {
  const { players, playerMap, loading: playersLoading } = useOptimizedPlayers();
  const { matches: weekMatches, loading: weekMatchesLoading } = useMatchesThisWeek();
  const { matches: allMatches, loading: allMatchesLoading } = useMatches();

  const loading = playersLoading || weekMatchesLoading || allMatchesLoading;

  const stats = useMemo(() => {
    if (loading || players.length === 0) {
      return {
        courtKing: null,
        currentStreak: null,
        mostWinsThisWeek: null,
        mostActive: null,
        bestDuo: null,
        mostPlayedDuo: null,
      };
    }

    // Court King - player with most total wins
    const courtKing = [...players].sort((a, b) => b.wins - a.wins)[0];

    // Current Winning Streak - player with highest current streak
    const currentStreak = [...players].sort((a, b) => b.streak - a.streak)[0];

    // Most Wins This Week
    const winsThisWeek = new Map<string, number>();
    weekMatches.forEach((match) => {
      match.winner.forEach((winnerId) => {
        winsThisWeek.set(winnerId, (winsThisWeek.get(winnerId) || 0) + 1);
      });
    });

    let mostWinsThisWeek = null;
    let maxWins = 0;
    winsThisWeek.forEach((wins, playerId) => {
      if (wins > maxWins) {
        maxWins = wins;
        const player = playerMap.get(playerId);
        if (player) {
          mostWinsThisWeek = { id: player.id, name: player.name, wins };
        }
      }
    });

    // Most Active Player - player with most matches this week
    const matchCounts = new Map<string, number>();
    weekMatches.forEach((match) => {
      match.players.forEach((playerId) => {
        matchCounts.set(playerId, (matchCounts.get(playerId) || 0) + 1);
      });
    });

    let mostActive = null;
    let maxMatches = 0;
    matchCounts.forEach((count, playerId) => {
      if (count > maxMatches) {
        maxMatches = count;
        const player = playerMap.get(playerId);
        if (player) {
          mostActive = { id: player.id, name: player.name, matches: count };
        }
      }
    });

    // Duo highlights from all doubles matches
    const allPartnerships = calculateAllPartnershipStats(allMatches, playerMap);
    const qualifiedDuos = allPartnerships.filter((d) => d.isQualified);
    const topDuo = qualifiedDuos[0] || allPartnerships[0] || null;
    const mostPlayedDuoRecord = [...allPartnerships].sort((a, b) => b.matchesPlayed - a.matchesPlayed)[0] || null;

    const bestDuo = topDuo
      ? { id: topDuo.id, name: topDuo.duoName, wins: topDuo.wins, winPercentage: topDuo.winPercentage }
      : null;

    const mostPlayedDuo = mostPlayedDuoRecord
      ? { id: mostPlayedDuoRecord.id, name: mostPlayedDuoRecord.duoName, matches: mostPlayedDuoRecord.matchesPlayed }
      : null;

    return {
      courtKing: courtKing
        ? { id: courtKing.id, name: courtKing.name, wins: courtKing.wins }
        : null,
      currentStreak: currentStreak && currentStreak.streak > 0
        ? { id: currentStreak.id, name: currentStreak.name, streak: currentStreak.streak }
        : null,
      mostWinsThisWeek,
      mostActive,
      bestDuo,
      mostPlayedDuo,
    };
  }, [players, playerMap, weekMatches, allMatches, loading]);

  return { stats, loading };
}
