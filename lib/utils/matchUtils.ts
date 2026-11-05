import { MatchFormData } from '@/lib/schemas/matchSchema';

export function determineWinner(data: MatchFormData): string[] {
  const teamAWon = data.teamAScore > data.teamBScore;

  if (data.type === 'singles') {
    return teamAWon ? [data.playerA] : [data.playerB];
  } else {
    return teamAWon
      ? [data.playerA, data.playerC!]
      : [data.playerB, data.playerD!];
  }
}

export function getWinnerNames(winnerIds: string[], playerMap: Map<string, string>): string[] {
  return winnerIds.map((id) => playerMap.get(id) || 'Unknown');
}

export function hasValidScore(data: MatchFormData): boolean {
  // A valid single game must have different scores, and at least one team must have points
  return (
    data.teamAScore !== data.teamBScore &&
    (data.teamAScore > 0 || data.teamBScore > 0)
  );
}

export function formatScore(data: MatchFormData): string {
  return `${data.teamAScore}-${data.teamBScore}`;
}
