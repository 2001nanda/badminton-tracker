import { Player } from '@/lib/types';

export function calculateWinRate(player: Player): number {
  const totalGames = player.wins + player.losses;
  if (totalGames === 0) return 0;
  return (player.wins / totalGames) * 100;
}

export function getPlayerInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function formatStreak(streak: number): string {
  if (streak === 0) return 'No streak';
  const absStreak = Math.abs(streak);
  return streak > 0 ? `${absStreak} win streak` : `${absStreak} loss streak`;
}
