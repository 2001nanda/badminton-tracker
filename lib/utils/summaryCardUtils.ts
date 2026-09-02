import { Match, Player } from '@/lib/types';
import { isToday, format, isSameDay } from 'date-fns';

export interface PlayerSummary {
  id: string;
  name: string;
  played: number;
  wins: number;
  losses: number;
  winPercentage: number;
  rank: number;
}

export interface DuoSummary {
  id: string; // Canonical duo key: [player1Id, player2Id].sort().join('_')
  player1Id: string;
  player2Id: string;
  player1Name: string;
  player2Name: string;
  duoName: string;
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

export interface TopDuoPerformers {
  topDuo: { name: string; wins: number; winPercentage: number } | null;
  mostWinsDuo: { name: string; wins: number } | null;
  bestWinRateDuo: { name: string; percentage: number } | null;
}

export interface AdditionalInsights {
  longestWinningStreak: { name: string; streak: number } | null;
  mostActivePlayer: { name: string; matches: number } | null;
  closestCompetition: string | null;
  highestWinRate: { name: string; rate: number } | null;
  totalDistinctPlayers: number;
}

export interface SinglesSummaryData {
  mode: 'singles';
  date: string;
  dayOfWeek: string;
  totalMatches: number;
  totalPlayers: number;
  totalWins: number;
  totalLosses: number;
  averageMatchesPerPlayer: number;
  topPerformers: TopPerformers;
  playerBreakdown: PlayerSummary[];
  insights?: AdditionalInsights;
}

export interface DoublesSummaryData {
  mode: 'doubles';
  date: string;
  dayOfWeek: string;
  totalMatches: number;
  totalPlayers: number;
  totalDuos: number;
  totalTeamWins: number;
  topDuoPerformers: TopDuoPerformers;
  duoBreakdown: DuoSummary[];
  individualPlayerStats: PlayerSummary[];
  insights?: AdditionalInsights;
}

export type SummaryCardData = SinglesSummaryData | DoublesSummaryData;

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
 * Generate a canonical, order-independent key for a duo of players.
 * For example, ["playerA", "playerB"] and ["playerB", "playerA"] produce the exact same key.
 */
export function getCanonicalDuoKey(playerAId: string, playerBId: string): string {
  return [playerAId, playerBId].sort().join('_');
}

/**
 * Analyze the match composition of a given set of matches for a day
 */
export function getSessionMatchComposition(matchesForDay: Match[]): {
  singlesCount: number;
  doublesCount: number;
  isMixed: boolean;
} {
  const singlesCount = matchesForDay.filter((m) => m.type === 'singles').length;
  const doublesCount = matchesForDay.filter((m) => m.type === 'doubles').length;
  return {
    singlesCount,
    doublesCount,
    isMixed: singlesCount > 0 && doublesCount > 0,
  };
}

/**
 * Compute the summary card data for a Doubles session.
 * Aggregates matches strictly by canonical Duo / Team (1 match = 1 Duo win, 1 Duo loss).
 * Individual player statistics are calculated separately as secondary context.
 */
export function computeDoublesSummary(
  doublesMatches: Match[],
  players: Player[],
  targetDate?: Date
): DoublesSummaryData {
  const dateToUse = targetDate || new Date();
  const date = format(dateToUse, 'MMMM d, yyyy');
  const dayOfWeek = format(dateToUse, 'EEEE');

  const playerMap = new Map(players.map((p) => [p.id, p]));

  // Map of canonical duoKey -> { player1Id, player2Id, wins, losses, played }
  const duoStatsMap = new Map<
    string,
    { player1Id: string; player2Id: string; wins: number; losses: number; played: number }
  >();

  // Map of playerId -> individual stats during doubles matches (for secondary display)
  const individualStatsMap = new Map<
    string,
    { wins: number; losses: number; played: number }
  >();

  doublesMatches.forEach((match) => {
    if (!match.players || match.players.length < 4) return;

    const teamAPlayer1 = match.players[0];
    const teamAPlayer2 = match.players[1];
    const teamBPlayer1 = match.players[2];
    const teamBPlayer2 = match.players[3];

    const teamAKey = getCanonicalDuoKey(teamAPlayer1, teamAPlayer2);
    const teamBKey = getCanonicalDuoKey(teamBPlayer1, teamBPlayer2);

    // Initialize Team A Duo
    if (!duoStatsMap.has(teamAKey)) {
      const sortedIds = [teamAPlayer1, teamAPlayer2].sort();
      duoStatsMap.set(teamAKey, {
        player1Id: sortedIds[0],
        player2Id: sortedIds[1],
        wins: 0,
        losses: 0,
        played: 0,
      });
    }

    // Initialize Team B Duo
    if (!duoStatsMap.has(teamBKey)) {
      const sortedIds = [teamBPlayer1, teamBPlayer2].sort();
      duoStatsMap.set(teamBKey, {
        player1Id: sortedIds[0],
        player2Id: sortedIds[1],
        wins: 0,
        losses: 0,
        played: 0,
      });
    }

    // Determine winning team based on match.winner IDs
    const isTeamAWinner =
      match.winner.includes(teamAPlayer1) || match.winner.includes(teamAPlayer2);

    const teamAStats = duoStatsMap.get(teamAKey)!;
    const teamBStats = duoStatsMap.get(teamBKey)!;

    teamAStats.played += 1;
    teamBStats.played += 1;

    if (isTeamAWinner) {
      teamAStats.wins += 1;
      teamBStats.losses += 1;
    } else {
      teamBStats.wins += 1;
      teamAStats.losses += 1;
    }

    // Track secondary individual player statistics
    match.players.slice(0, 4).forEach((playerId) => {
      if (!individualStatsMap.has(playerId)) {
        individualStatsMap.set(playerId, { wins: 0, losses: 0, played: 0 });
      }
      const pStat = individualStatsMap.get(playerId)!;
      pStat.played += 1;
      if (match.winner.includes(playerId)) {
        pStat.wins += 1;
      } else {
        pStat.losses += 1;
      }
    });
  });

  const totalMatches = doublesMatches.length;
  const totalPlayers = individualStatsMap.size;
  const totalDuos = duoStatsMap.size;
  // In doubles, total team wins equals the total number of match victories
  const totalTeamWins = totalMatches;

  // Build duo breakdown
  const duoBreakdown: DuoSummary[] = Array.from(duoStatsMap.entries())
    .map(([duoKey, stats]) => {
      const p1 = playerMap.get(stats.player1Id);
      const p2 = playerMap.get(stats.player2Id);
      const player1Name = p1?.name || 'Unknown';
      const player2Name = p2?.name || 'Unknown';
      const duoName = `${player1Name} + ${player2Name}`;
      const winPercentage =
        stats.played > 0 ? Math.round((stats.wins / stats.played) * 100) : 0;

      return {
        id: duoKey,
        player1Id: stats.player1Id,
        player2Id: stats.player2Id,
        player1Name,
        player2Name,
        duoName,
        played: stats.played,
        wins: stats.wins,
        losses: stats.losses,
        winPercentage,
        rank: 0,
      };
    })
    .sort((a, b) => {
      // 1. Primary: Win percentage descending
      if (b.winPercentage !== a.winPercentage) {
        return b.winPercentage - a.winPercentage;
      }
      // 2. Secondary: Total wins descending
      if (b.wins !== a.wins) {
        return b.wins - a.wins;
      }
      // 3. Tertiary: Matches played descending
      if (b.played !== a.played) {
        return b.played - a.played;
      }
      // 4. Deterministic tie-breaker: Alphabetical comparison of duoName
      return a.duoName.localeCompare(b.duoName);
    });

  // Assign ranks (1, 2, 3...)
  duoBreakdown.forEach((duo, idx) => {
    duo.rank = idx + 1;
  });

  // Build secondary individual player stats
  const individualPlayerStats: PlayerSummary[] = Array.from(individualStatsMap.entries())
    .map(([playerId, stats]) => {
      const player = playerMap.get(playerId);
      const winPercentage =
        stats.played > 0 ? Math.round((stats.wins / stats.played) * 100) : 0;
      return {
        id: playerId,
        name: player?.name || 'Unknown',
        played: stats.played,
        wins: stats.wins,
        losses: stats.losses,
        winPercentage,
        rank: 0,
      };
    })
    .sort((a, b) => {
      if (b.winPercentage !== a.winPercentage) return b.winPercentage - a.winPercentage;
      if (b.wins !== a.wins) return b.wins - a.wins;
      return b.played - a.played;
    });

  individualPlayerStats.forEach((p, idx) => {
    p.rank = idx + 1;
  });

  // Top Duo Performers
  const topDuo =
    duoBreakdown.length > 0
      ? {
          name: duoBreakdown[0].duoName,
          wins: duoBreakdown[0].wins,
          winPercentage: duoBreakdown[0].winPercentage,
        }
      : null;

  const mostWinsDuoRecord = [...duoBreakdown].sort((a, b) => b.wins - a.wins)[0];
  const mostWinsDuo = mostWinsDuoRecord
    ? { name: mostWinsDuoRecord.duoName, wins: mostWinsDuoRecord.wins }
    : null;

  const bestWinRateDuoRecord =
    [...duoBreakdown]
      .filter((d) => d.played >= 2)
      .sort((a, b) => b.winPercentage - a.winPercentage)[0] || duoBreakdown[0];

  const bestWinRateDuo = bestWinRateDuoRecord
    ? { name: bestWinRateDuoRecord.duoName, percentage: bestWinRateDuoRecord.winPercentage }
    : null;

  const topDuoPerformers: TopDuoPerformers = {
    topDuo,
    mostWinsDuo,
    bestWinRateDuo,
  };

  return {
    mode: 'doubles',
    date,
    dayOfWeek,
    totalMatches,
    totalPlayers,
    totalDuos,
    totalTeamWins,
    topDuoPerformers,
    duoBreakdown,
    individualPlayerStats,
  };
}

/**
 * Compute the summary card data for a Singles session.
 * Aggregates matches directly by Player ID.
 */
export function computeSinglesSummary(
  singlesMatches: Match[],
  players: Player[],
  targetDate?: Date
): SinglesSummaryData {
  const dateToUse = targetDate || new Date();
  const date = format(dateToUse, 'MMMM d, yyyy');
  const dayOfWeek = format(dateToUse, 'EEEE');

  const playerStats = new Map<string, { wins: number; losses: number; matches: number }>();

  singlesMatches.forEach((match) => {
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

  const totalMatches = singlesMatches.length;
  const totalPlayers = playerStats.size;
  const totalWins = Array.from(playerStats.values()).reduce((sum, s) => sum + s.wins, 0);
  const totalLosses = Array.from(playerStats.values()).reduce((sum, s) => sum + s.losses, 0);
  const averageMatchesPerPlayer =
    totalPlayers > 0
      ? Math.round(((totalMatches * 2) / totalPlayers) * 10) / 10
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
      if (b.winPercentage !== a.winPercentage) return b.winPercentage - a.winPercentage;
      if (b.wins !== a.wins) return b.wins - a.wins;
      return b.played - a.played;
    });

  playerBreakdown.forEach((p, idx) => {
    p.rank = idx + 1;
  });

  // Top Performers
  const topPlayer =
    playerBreakdown.length > 0
      ? { name: playerBreakdown[0].name, wins: playerBreakdown[0].wins }
      : null;

  const mostWinsPlayer = [...playerBreakdown].sort((a, b) => b.wins - a.wins)[0];
  const mostWins = mostWinsPlayer
    ? { name: mostWinsPlayer.name, wins: mostWinsPlayer.wins }
    : null;

  const bestWinPctPlayer =
    [...playerBreakdown]
      .filter((p) => p.played >= 2)
      .sort((a, b) => b.winPercentage - a.winPercentage)[0] || playerBreakdown[0];
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
  const longestWinningStreak = computeLongestWinningStreak(singlesMatches, players);
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
    mode: 'singles',
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
 * Compute summary card data with automatic or preferred match-type separation.
 * Singles and Doubles matches are never combined into a single leaderboard.
 */
export function computeSummaryCardData(
  matchesForDay: Match[],
  players: Player[],
  targetDate?: Date,
  preferredMode: 'singles' | 'doubles' | 'auto' = 'auto'
): SummaryCardData {
  const doublesMatches = matchesForDay.filter((m) => m.type === 'doubles');
  const singlesMatches = matchesForDay.filter((m) => m.type === 'singles');

  if (preferredMode === 'doubles') {
    return computeDoublesSummary(doublesMatches, players, targetDate);
  }

  if (preferredMode === 'singles') {
    return computeSinglesSummary(singlesMatches, players, targetDate);
  }

  // Auto-detection:
  // If there are doubles matches on this date, default to doubles summary.
  // Otherwise default to singles summary.
  if (doublesMatches.length > 0) {
    return computeDoublesSummary(doublesMatches, players, targetDate);
  }

  return computeSinglesSummary(singlesMatches, players, targetDate);
}

/**
 * Compute the longest winning streak for any player across matches (in order)
 */
function computeLongestWinningStreak(
  matches: Match[],
  players: Player[]
): { name: string; streak: number } | null {
  const sorted = [...matches].sort(
    (a, b) => a.createdAt.getTime() - b.createdAt.getTime()
  );

  const streaks = new Map<string, number>();
  const maxStreaks = new Map<string, number>();

  sorted.forEach((match) => {
    match.winner.forEach((winnerId) => {
      const current = (streaks.get(winnerId) || 0) + 1;
      streaks.set(winnerId, current);
      const max = maxStreaks.get(winnerId) || 0;
      if (current > max) maxStreaks.set(winnerId, current);
    });

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
