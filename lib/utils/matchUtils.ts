import { MatchFormData } from '@/lib/schemas/matchSchema';

export function determineWinner(data: MatchFormData): string[] {
  let teamAWins = 0;
  let teamBWins = 0;

  // Count set wins
  if (data.set1TeamA > data.set1TeamB) teamAWins++;
  else if (data.set1TeamB > data.set1TeamA) teamBWins++;

  if (data.set2TeamA > data.set2TeamB) teamAWins++;
  else if (data.set2TeamB > data.set2TeamA) teamBWins++;

  if (data.set3TeamA !== undefined && data.set3TeamB !== undefined) {
    if (data.set3TeamA > data.set3TeamB) teamAWins++;
    else if (data.set3TeamB > data.set3TeamA) teamBWins++;
  }

  // Return winner IDs
  if (data.type === 'singles') {
    return teamAWins > teamBWins ? [data.playerA] : [data.playerB];
  } else {
    return teamAWins > teamBWins
      ? [data.playerA, data.playerC!]
      : [data.playerB, data.playerD!];
  }
}

export function getWinnerNames(winnerIds: string[], playerMap: Map<string, string>): string[] {
  return winnerIds.map(id => playerMap.get(id) || 'Unknown');
}

export function hasValidScore(data: MatchFormData): boolean {
  // At least set 1 must have valid scores (both teams scored and at least one team reached 21)
  const set1Valid = data.set1TeamA > 0 && data.set1TeamB > 0;
  
  return set1Valid;
}

export function formatScore(data: MatchFormData): string {
  let score = `${data.set1TeamA}-${data.set1TeamB}, ${data.set2TeamA}-${data.set2TeamB}`;
  
  if (data.set3TeamA !== undefined && data.set3TeamB !== undefined && 
      (data.set3TeamA > 0 || data.set3TeamB > 0)) {
    score += `, ${data.set3TeamA}-${data.set3TeamB}`;
  }
  
  return score;
}
