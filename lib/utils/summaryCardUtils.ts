import { Match, Player } from '@/lib/types';
import { isToday, format, isSameDay, parseISO } from 'date-fns';

export interface PlayerSummary {
  id: string;
  name: string;
  played: number;
  wins: number;
  losses: number;
  winPercentage: number;
  rank: number;
}

export interface TopPerformers {
  topPlayer: { name: string; wins: number } | null;
  mostWins: { name: string; wins: number } | null;
  bestWinPercentage: { name: string; percentage: number } | null;
  mostMatchesPlayed: { name: string; matches: number } | null;
}

export interface AdditionalInsights {
  longestWinningStreak: { name: string; streak: number } | null;
  mostActivePlayer: { name: string; matches: number } | null;
  closestCompetition: string | null;
  highestWinRate: { name: string; rate: number } | null;
  totalDistinctPlayers: number;
}

export interface SummaryCardData {
  date: string;
  dayOfWeek: string;
  totalMatches: number;
  totalPlayers: number;
  totalWins: number;
  totalLosses: number;
  averageMatchesPerPlayer: number;
  topPerformers: TopPerformers;
  playerBreakdown: PlayerSummary[];
  insights: AdditionalInsights;
}

/**
 * Filter matches to only today's matches
 */
export function getTodaysMatches(matches: Match[]): Match[] {
  return matches.filter((match) => isToday(match.createdAt));
}

/**
 * Filter matches for a specific date
 */
export function getMatchesByDate(matches: Match[], date: Date): Match[] {
  return matches.filter((match) => isSameDay(match.createdAt, date));
}

/**
 * Get all unique dates (as ISO date strings "YYYY-MM-DD") that have matches
 */
export function getAvailableMatchDates(matches: Match[]): string[] {
  const dateSet = new Set<string>();
  matches.forEach((match) => {
    const dateStr = format(match.createdAt, 'yyyy-MM-dd');
    dateSet.add(dateStr);
  });
  return Array.from(dateSet).sort((a, b) => b.localeCompare(a)); // newest first
}

/**
 * Compute the full summary card data from matches (for any given date)
 */
export function computeSummaryCardData(
  matchesForDay: Match[],
  players: Player[],
  targetDate?: Date
): SummaryCardData {
  const dateToUse = targetDate || new Date();
  const date = format(dateToUse, 'MMMM d, yyyy');
  const dayOfWeek = format(dateToUse, 'EEEE');

  // Collect stats per player
  const playerStats = new Map<string, { wins: number; losses: number; matches: number }>();

  matchesForDay.forEach((match) => {
    match.players.forEach((playerId) => {
      if (!playerStats.has(playerId)) {
        playerStats.set(playerId, { wins: 0, losses: 0, matches: 0 });
      }
      const stat = playerStats.get(playerId)!;
      stat.matches += 1;

      if (match.winner.includes(playerId)) {
        stat.wins += 1;
      } else {
        stat.losses += 1;
      }
    });
  });

  const totalMatches = matchesForDay.length;
  const totalPlayers = playerStats.size;
  const totalWins = Array.from(playerStats.values()).reduce((sum, s) => sum + s.wins, 0);
  const totalLosses = Array.from(playerStats.values()).reduce((sum, s) => sum + s.losses, 0);
  const averageMatchesPerPlayer = totalPlayers > 0
    ? Math.round((totalMatches * 2 / totalPlayers) * 10) / 10
    : 0;

  // Build player breakdown
  const playerBreakdown: PlayerSummary[] = Array.from(playerStats.entries())
    .map(([playerId, stats]) => {
      const player = players.find((p) => p.id === playerId);
      const totalPlayed = stats.wins + stats.losses;
      return {
        id: playerId,
        name: player?.name || 'Unknown',
        played: totalPlayed,
        wins: stats.wins,
        losses: stats.losses,
        winPercentage: totalPlayed > 0 ? Math.round((stats.wins / totalPlayed) * 100) : 0,
        rank: 0,
      };
    })
    .sort((a, b) => {
      // Sort by win percentage desc, then by wins desc
      if (b.winPercentage !== a.winPercentage) return b.winPercentage - a.winPercentage;
      return b.wins - a.wins;
    });

  // Assign ranks
  playerBreakdown.forEach((p, idx) => {
    p.rank = idx + 1;
  });

  // Top Performers
  const topPlayer = playerBreakdown.length > 0
    ? { name: playerBreakdown[0].name, wins: playerBreakdown[0].wins }
    : null;

  const mostWinsPlayer = [...playerBreakdown].sort((a, b) => b.wins - a.wins)[0];
  const mostWins = mostWinsPlayer
    ? { name: mostWinsPlayer.name, wins: mostWinsPlayer.wins }
    : null;

  const bestWinPctPlayer = [...playerBreakdown]
    .filter((p) => p.played >= 2)
    .sort((a, b) => b.winPercentage - a.winPercentage)[0];
  const bestWinPercentage = bestWinPctPlayer
    ? { name: bestWinPctPlayer.name, percentage: bestWinPctPlayer.winPercentage }
    : null;

  const mostMatchesPlayer = [...playerBreakdown].sort((a, b) => b.played - a.played)[0];
  const mostMatchesPlayed = mostMatchesPlayer
    ? { name: mostMatchesPlayer.name, matches: mostMatchesPlayer.played }
    : null;

  const topPerformers: TopPerformers = {
    topPlayer,
    mostWins,
    bestWinPercentage,
    mostMatchesPlayed,
  };

  // Additional Insights
  const longestWinningStreak = computeLongestWinningStreak(matchesForDay, players);
  const mostActivePlayer = mostMatchesPlayed
    ? { name: mostMatchesPlayed.name, matches: mostMatchesPlayed.matches }
    : null;
  const closestCompetition = computeClosestCompetition(playerBreakdown);
  const highestWinRateMin3 = [...playerBreakdown]
    .filter((p) => p.played >= 3)
    .sort((a, b) => b.winPercentage - a.winPercentage)[0];
  const highestWinRate = highestWinRateMin3
    ? { name: highestWinRateMin3.name, rate: highestWinRateMin3.winPercentage }
    : null;

  const insights: AdditionalInsights = {
    longestWinningStreak,
    mostActivePlayer,
    closestCompetition,
    highestWinRate,
    totalDistinctPlayers: totalPlayers,
  };

  return {
    date,
    dayOfWeek,
    totalMatches,
    totalPlayers,
    totalWins,
    totalLosses,
    averageMatchesPerPlayer,
    topPerformers,
    playerBreakdown,
    insights,
  };
}

/**
 * Compute the longest winning streak for any player across today's matches (in order)
 */
function computeLongestWinningStreak(
  matches: Match[],
  players: Player[]
): { name: string; streak: number } | null {
  // Sort matches chronologically
  const sorted = [...matches].sort(
    (a, b) => a.createdAt.getTime() - b.createdAt.getTime()
  );

  const streaks = new Map<string, number>();
  const maxStreaks = new Map<string, number>();

  sorted.forEach((match) => {
    // Winners get streak incremented
    match.winner.forEach((winnerId) => {
      const current = (streaks.get(winnerId) || 0) + 1;
      streaks.set(winnerId, current);
      const max = maxStreaks.get(winnerId) || 0;
      if (current > max) maxStreaks.set(winnerId, current);
    });

    // Losers get streak reset
    match.players
      .filter((id) => !match.winner.includes(id))
      .forEach((loserId) => {
        streaks.set(loserId, 0);
      });
  });

  let bestId = '';
  let bestStreak = 0;
  maxStreaks.forEach((streak, playerId) => {
    if (streak > bestStreak) {
      bestStreak = streak;
      bestId = playerId;
    }
  });

  if (bestStreak <= 0) return null;

  const player = players.find((p) => p.id === bestId);
  return { name: player?.name || 'Unknown', streak: bestStreak };
}

/**
 * Find the closest competition (two players with the most similar win percentages)
 */
function computeClosestCompetition(breakdown: PlayerSummary[]): string | null {
  if (breakdown.length < 2) return null;

  let minDiff = Infinity;
  let pair: [PlayerSummary, PlayerSummary] | null = null;

  for (let i = 0; i < breakdown.length - 1; i++) {
    for (let j = i + 1; j < breakdown.length; j++) {
      const diff = Math.abs(breakdown[i].winPercentage - breakdown[j].winPercentage);
      if (diff < minDiff) {
        minDiff = diff;
        pair = [breakdown[i], breakdown[j]];
      }
    }
  }

  if (!pair) return null;
  return `${pair[0].name} vs ${pair[1].name} (${minDiff}% difference)`;
}
