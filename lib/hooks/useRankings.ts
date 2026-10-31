import { useMemo } from 'react';
import { Player } from '@/lib/types';
import { sortPlayersByRank, getTotalMatches } from '@/lib/utils/statsUtils';
import { useMatchesThisWeek, useMatchesThisMonth, useMatches } from './useMatches';

type RankingPeriod = 'all-time' | 'week' | 'month';
type MatchTypeFilter = 'all' | 'singles' | 'doubles';

interface Spotlight {
  courtKing: Player | null;
  longestStreak: Player | null;
  mostActive: Player | null;
  weeklyChampion: Player | null;
}

export function useRankings(players: Player[], period: RankingPeriod, matchType: MatchTypeFilter = 'all') {
  const { matches: allMatches } = useMatches();
  const { matches: weekMatches } = useMatchesThisWeek();
  const { matches: monthMatches } = useMatchesThisMonth();

  const rankedPlayers = useMemo(() => {
    const playersWithMatches = players.filter((p) => getTotalMatches(p) > 0);

    // ==========================================
    // ALL TIME RANKINGS
    // ==========================================
    if (period === 'all-time') {
      if (matchType === 'all') {
        // Overall All-Time: Use permanent lifetime wins/losses
        return sortPlayersByRank(playersWithMatches);
      }

      // Count matches currently present in the matches collection
      const filteredMatches = allMatches.filter((m) => m.type === matchType);
      const matchStats = new Map<string, { wins: number; losses: number }>();

      filteredMatches.forEach((match) => {
        match.players.forEach((playerId) => {
          if (!matchStats.has(playerId)) {
            matchStats.set(playerId, { wins: 0, losses: 0 });
          }
          const s = matchStats.get(playerId)!;
          if (match.winner && match.winner.includes(playerId)) {
            s.wins++;
          } else {
            s.losses++;
          }
        });
      });

      if (matchType === 'singles') {
        // Singles All-Time: Combine permanent player singles aggregate stats with match documents
        const singlesPlayers = playersWithMatches
          .map((player) => {
            const m = matchStats.get(player.id) || { wins: 0, losses: 0 };
            const wins = Math.max(m.wins, player.singlesWins || 0);
            const losses = Math.max(m.losses, player.singlesLosses || 0);
            const singlesMatches = Math.max(m.wins + m.losses, player.singlesMatches || wins + losses);

            return {
              ...player,
              wins,
              losses,
              singlesWins: wins,
              singlesLosses: losses,
              singlesMatches,
            };
          })
          .filter((p) => p.wins + p.losses > 0 || (p.singlesMatches && p.singlesMatches > 0));

        return sortPlayersByRank(singlesPlayers);
      }

      if (matchType === 'doubles') {
        // Doubles All-Time: Combine permanent player doubles aggregate stats with match documents
        const doublesPlayers = playersWithMatches
          .map((player) => {
            const m = matchStats.get(player.id) || { wins: 0, losses: 0 };
            const wins = Math.max(m.wins, player.doublesWins ?? player.wins);
            const losses = Math.max(m.losses, player.doublesLosses ?? player.losses);
            const doublesMatches = Math.max(m.wins + m.losses, player.doublesMatches ?? wins + losses);

            return {
              ...player,
              wins,
              losses,
              doublesWins: wins,
              doublesLosses: losses,
              doublesMatches,
            };
          })
          .filter((p) => p.wins + p.losses > 0);

        return sortPlayersByRank(doublesPlayers);
      }
    }

    // ==========================================
    // PERIOD RANKINGS (WEEK / MONTH)
    // ==========================================
    let periodMatches = period === 'week' ? weekMatches : monthMatches;

    if (matchType !== 'all') {
      periodMatches = periodMatches.filter((m) => m.type === matchType);
    }

    const periodStats = new Map<string, { wins: number; losses: number }>();

    periodMatches.forEach((match) => {
      match.players.forEach((playerId) => {
        if (!periodStats.has(playerId)) {
          periodStats.set(playerId, { wins: 0, losses: 0 });
        }
        const stats = periodStats.get(playerId)!;
        if (match.winner && match.winner.includes(playerId)) {
          stats.wins++;
        } else {
          stats.losses++;
        }
      });
    });

    const periodPlayers = playersWithMatches
      .map((player) => {
        const stats = periodStats.get(player.id) || { wins: 0, losses: 0 };
        return {
          ...player,
          wins: stats.wins,
          losses: stats.losses,
        };
      })
      .filter((p) => p.wins + p.losses > 0);

    return sortPlayersByRank(periodPlayers);
  }, [players, period, matchType, allMatches, weekMatches, monthMatches]);

  const spotlight = useMemo((): Spotlight => {
    if (players.length === 0 || rankedPlayers.length === 0) {
      return {
        courtKing: null,
        longestStreak: null,
        mostActive: null,
        weeklyChampion: null,
      };
    }

    // Court King - highest ranked player in current filtered view
    const courtKing = rankedPlayers[0] || null;

    // Longest Streak
    const longestStreak =
      [...rankedPlayers]
        .sort((a, b) => Math.abs(b.streak) - Math.abs(a.streak))
        .filter((p) => p.streak !== 0)[0] || null;

    // Filter week matches by match type
    let filteredWeekMatches = weekMatches;
    if (matchType !== 'all') {
      filteredWeekMatches = weekMatches.filter((m) => m.type === matchType);
    }

    // Most Active This Week
    const weekActivity = new Map<string, number>();
    filteredWeekMatches.forEach((match) => {
      match.players.forEach((playerId) => {
        weekActivity.set(playerId, (weekActivity.get(playerId) || 0) + 1);
      });
    });

    let mostActive = null;
    let maxActivity = 0;
    weekActivity.forEach((count, playerId) => {
      if (count > maxActivity) {
        maxActivity = count;
        mostActive = players.find((p) => p.id === playerId) || null;
      }
    });

    // Weekly Champion - most wins this week
    const weekWins = new Map<string, number>();
    filteredWeekMatches.forEach((match) => {
      if (match.winner) {
        match.winner.forEach((winnerId) => {
          weekWins.set(winnerId, (weekWins.get(winnerId) || 0) + 1);
        });
      }
    });

    let weeklyChampion = null;
    let maxWins = 0;
    weekWins.forEach((wins, playerId) => {
      if (wins > maxWins) {
        maxWins = wins;
        weeklyChampion = players.find((p) => p.id === playerId) || null;
      }
    });

    return {
      courtKing,
      longestStreak,
      mostActive,
      weeklyChampion,
    };
  }, [players, rankedPlayers, weekMatches, matchType]);

  return { rankedPlayers, spotlight };
}
