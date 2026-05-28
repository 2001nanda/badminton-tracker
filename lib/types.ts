export interface Player {
  id: string;
  name: string;
  wins: number;
  losses: number;
  streak: number;
  photoURL?: string; // Optional player photo URL
  createdAt: Date;
}

export interface Match {
  id: string;
  type: 'singles' | 'doubles';
  players: string[]; // Player IDs
  score: {
    set1: { teamA: number; teamB: number };
    set2: { teamA: number; teamB: number };
    set3?: { teamA: number; teamB: number };
  };
  winner: string[]; // Player IDs of winners
  createdAt: Date;
}

export interface HomeStats {
  courtKing: { id: string; name: string; wins: number } | null;
  currentStreak: { id: string; name: string; streak: number } | null;
  mostWinsThisWeek: { id: string; name: string; wins: number } | null;
  mostActive: { id: string; name: string; matches: number } | null;
}
