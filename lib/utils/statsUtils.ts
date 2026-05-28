import { Player } from '@/lib/types';

/**
 * Calculate win rate percentage
 */
export function calculateWinRate(player: Player): number {
  const totalGames = player.wins + player.losses;
  if (totalGames === 0) return 0;
  return Math.round((player.wins / totalGames) * 100);
}

/**
 * Calculate win rate as formatted string
 */
export function formatWinRate(player: Player): string {
  const totalGames = player.wins + player.losses;
  if (totalGames === 0) return '0.0%';
  return `${((player.wins / totalGames) * 100).toFixed(1)}%`;
}

/**
 * Get player initials from name
 */
export function getPlayerInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

/**
 * Format streak display
 */
export function formatStreak(streak: number): string {
  if (streak === 0) return 'No streak';
  const absStreak = Math.abs(streak);
  return streak > 0 ? `${absStreak}W` : `${absStreak}L`;
}

/**
 * Get streak color class
 */
export function getStreakColor(streak: number): string {
  if (streak > 0) return 'text-emerald-400';
  if (streak < 0) return 'text-red-400';
  return 'text-gray-400';
}

/**
 * Calculate total matches played
 */
export function getTotalMatches(player: Player): number {
  return player.wins + player.losses;
}

/**
 * Check if player is on winning streak
 */
export function isWinningStreak(player: Player): boolean {
  return player.streak > 0;
}

/**
 * Check if player is on losing streak
 */
export function isLosingStreak(player: Player): boolean {
  return player.streak < 0;
}

/**
 * Get rank suffix (1st, 2nd, 3rd, etc.)
 */
export function getRankSuffix(rank: number): string {
  if (rank === 1) return 'st';
  if (rank === 2) return 'nd';
  if (rank === 3) return 'rd';
  return 'th';
}

/**
 * Sort players by ranking
 * Primary: Win rate
 * Secondary: Total wins
 */
export function sortPlayersByRank(players: Player[]): Player[] {
  return [...players]
    .filter((p) => getTotalMatches(p) > 0)
    .sort((a, b) => {
      const aWinRate = calculateWinRate(a);
      const bWinRate = calculateWinRate(b);
      
      if (bWinRate !== aWinRate) {
        return bWinRate - aWinRate;
      }
      
      return b.wins - a.wins;
    });
}
