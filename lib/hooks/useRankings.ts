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
    const playersWithMatches = players.filter(p => getTotalMatches(p) > 0);
    
    if (period === 'all-time') {
      // For all-time with match type filter, recalculate stats
      if (matchType !== 'all') {
        const filteredMatches = allMatches.filter(m => m.type === matchType);
        const filteredStats = new Map<string, { wins: number; losses: number }>();
        
        filteredMatches.forEach(match => {
          match.players.forEach(playerId => {
            if (!filteredStats.has(playerId)) {
              filteredStats.set(playerId, { wins: 0, losses: 0 });
            }
            
            const stats = filteredStats.get(playerId)!;
            if (match.winner.includes(playerId)) {
              stats.wins++;
            } else {
              stats.losses++;
            }
          });
        });
        
        const filteredPlayers = playersWithMatches
          .map(player => {
            const stats = filteredStats.get(player.id) || { wins: 0, losses: 0 };
            return {
              ...player,
              wins: stats.wins,
              losses: stats.losses,
            };
          })
          .filter(p => p.wins + p.losses > 0);
        
        return sortPlayersByRank(filteredPlayers);
      }
      
      return sortPlayersByRank(playersWithMatches);
    }
    
    // For week/month, calculate temporary stats with match type filter
    let matches = period === 'week' ? weekMatches : monthMatches;
    
    // Apply match type filter
    if (matchType !== 'all') {
      matches = matches.filter(m => m.type === matchType);
    }
    
    const periodStats = new Map<string, { wins: number; losses: number }>();
    
    matches.forEach(match => {
      match.players.forEach(playerId => {
        if (!periodStats.has(playerId)) {
          periodStats.set(playerId, { wins: 0, losses: 0 });
        }
        
        const stats = periodStats.get(playerId)!;
        if (match.winner.includes(playerId)) {
          stats.wins++;
        } else {
          stats.losses++;
        }
      });
    });
    
    // Create temporary player objects with period stats
    const periodPlayers = playersWithMatches
      .map(player => {
        const stats = periodStats.get(player.id) || { wins: 0, losses: 0 };
        return {
          ...player,
          wins: stats.wins,
          losses: stats.losses,
        };
      })
      .filter(p => p.wins + p.losses > 0);
    
    return sortPlayersByRank(periodPlayers);
  }, [players, period, matchType, allMatches, weekMatches, monthMatches]);

  const spotlight = useMemo((): Spotlight => {
    if (players.length === 0) {
      return {
        courtKing: null,
        longestStreak: null,
        mostActive: null,
        weeklyChampion: null,
      };
    }

    const playersWithMatches = players.filter(p => getTotalMatches(p) > 0);
    
    // Court King - highest ranked player
    const courtKing = rankedPlayers[0] || null;
    
    // Longest Streak - highest absolute streak (based on filtered matches)
    const longestStreak = [...playersWithMatches]
      .sort((a, b) => Math.abs(b.streak) - Math.abs(a.streak))
      .filter(p => p.streak !== 0)[0] || null;
    
    // Filter week matches by match type
    let filteredWeekMatches = weekMatches;
    if (matchType !== 'all') {
      filteredWeekMatches = weekMatches.filter(m => m.type === matchType);
    }
    
    // Most Active This Week
    const weekActivity = new Map<string, number>();
    filteredWeekMatches.forEach(match => {
      match.players.forEach(playerId => {
        weekActivity.set(playerId, (weekActivity.get(playerId) || 0) + 1);
      });
    });
    
    let mostActive = null;
    let maxActivity = 0;
    weekActivity.forEach((count, playerId) => {
      if (count > maxActivity) {
        maxActivity = count;
        mostActive = players.find(p => p.id === playerId) || null;
      }
    });
    
    // Weekly Champion - most wins this week
    const weekWins = new Map<string, number>();
    filteredWeekMatches.forEach(match => {
      match.winner.forEach(winnerId => {
        weekWins.set(winnerId, (weekWins.get(winnerId) || 0) + 1);
      });
    });
    
    let weeklyChampion = null;
    let maxWins = 0;
    weekWins.forEach((wins, playerId) => {
      if (wins > maxWins) {
        maxWins = wins;
        weeklyChampion = players.find(p => p.id === playerId) || null;
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
