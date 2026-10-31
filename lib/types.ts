export interface Player {
  id: string;
  name: string;
  wins: number;
  losses: number;
  streak: number;
  photoURL?: string; // Optional player photo URL
  pointsScored?: number;
  pointsConceded?: number;
  singlesMatches?: number;
  singlesWins?: number;
  singlesLosses?: number;
  doublesMatches?: number;
  doublesWins?: number;
  doublesLosses?: number;
  createdAt: Date;
}

export interface Match {
  id: string;
  type: 'singles' | 'doubles';
  players: string[]; // Player IDs: [TeamA_P1, TeamB_P1] or [TeamA_P1, TeamA_P2, TeamB_P1, TeamB_P2]
  score: {
    set1: { teamA: number; teamB: number };
    set2?: { teamA: number; teamB: number };
    set3?: { teamA: number; teamB: number };
  };
  winner: string[]; // Player IDs of winners
  createdAt: Date;
}

export interface PermanentPartnershipDoc {
  id: string; // Canonical key: [p1, p2].sort().join('_')
  playerIds: [string, string];
  totalMatches: number;
  wins: number;
  losses: number;
  pointsScored: number;
  pointsConceded: number;
  currentWinningStreak: number;
  longestWinningStreak: number;
  updatedAt?: any;
}

export interface RetentionSettings {
  autoDeleteEnabled: boolean; // default: false (OFF)
  retentionDays: number; // default: 14
  lastCleanupAt?: any;
  updatedAt?: any;
  updatedBy?: string;
}

export interface HomeStats {
  courtKing: { id: string; name: string; wins: number } | null;
  currentStreak: { id: string; name: string; streak: number } | null;
  mostWinsThisWeek: { id: string; name: string; wins: number } | null;
  mostActive: { id: string; name: string; matches: number } | null;
  bestDuo?: { id: string; name: string; wins: number; winPercentage: number } | null;
  mostPlayedDuo?: { id: string; name: string; matches: number } | null;
}

export type MatchResult = 'W' | 'L';

export interface PlayerExtendedStats {
  totalMatches: number;
  wins: number;
  losses: number;
  winPercentage: number;
  currentStreak: number;
  longestWinningStreak: number;
  longestLosingStreak: number;
  totalPointsScored: number;
  totalPointsConceded: number;
  pointsDifference: number;
  averagePointsPerSet: number;
  singlesMatches: number;
  singlesWins: number;
  singlesLosses: number;
  singlesWinPercentage: number;
  doublesMatches: number;
  doublesWins: number;
  doublesLosses: number;
  doublesWinPercentage: number;
  recentForm: MatchResult[]; // Last 5 matches, newest first
}

export interface PartnershipStats {
  id: string; // Canonical key: [p1, p2].sort().join('_')
  player1Id: string;
  player2Id: string;
  player1Name: string;
  player2Name: string;
  duoName: string;
  matchesPlayed: number;
  wins: number;
  losses: number;
  winPercentage: number;
  pointsScored: number;
  pointsConceded: number;
  pointsDifference: number;
  averagePointsPerSet: number;
  currentStreak: number;
  longestWinningStreak: number;
  recentForm: MatchResult[]; // Last 5 matches, newest first
  isQualified: boolean; // At least 5 matches played
  rank?: number;
}

export interface PlayerPartnerRecord {
  partnerId: string;
  partnerName: string;
  matches: number;
  wins: number;
  losses: number;
  winPercentage: number;
  pointsScored: number;
  pointsConceded: number;
}

export interface PlayerRivalRecord {
  opponentId: string;
  opponentName: string;
  matches: number;
  wins: number;
  losses: number;
  winPercentage: number;
  type: 'singles' | 'doubles';
}

export interface HeadToHeadStats {
  entityAName: string;
  entityBName: string;
  totalMatches: number;
  winsA: number;
  winsB: number;
  winPercentageA: number;
  winPercentageB: number;
  pointsA: number;
  pointsB: number;
  recentMatches: Match[];
}
