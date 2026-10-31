import { Match, Player, PlayerExtendedStats, PartnershipStats, PlayerPartnerRecord, PlayerRivalRecord, HeadToHeadStats, MatchResult } from '@/lib/types';

/**
 * Generate a canonical, order-independent key for a duo of players based on IDs.
 * [pA, pB] and [pB, pA] yield the exact same identifier.
 */
export function getCanonicalDuoKey(playerAId: string, playerBId: string): string {
  return [playerAId, playerBId].sort().join('_');
}

/**
 * Helper to get clean initials from a name
 */
export function getPlayerInitials(name: string): string {
  if (!name) return '??';
  return name
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

/**
 * Format duo name deterministically from two players
 */
export function getDuoName(
  p1: Player | undefined,
  p2: Player | undefined,
  fallbackId1?: string,
  fallbackId2?: string
): string {
  const name1 = p1?.name || fallbackId1 || 'Unknown';
  const name2 = p2?.name || fallbackId2 || 'Unknown';
  return `${name1} + ${name2}`;
}

/**
 * Calculate comprehensive statistics for an individual player from match history
 */
export function calculateExtendedPlayerStats(
  playerId: string,
  matches: Match[],
  playerMap: Map<string, Player>
): PlayerExtendedStats {
  const player = playerMap.get(playerId);
  const playerMatches = matches.filter((m) => m.players && m.players.includes(playerId));

  // Sort chronological (oldest first) for streaks and timeline
  const chronological = [...playerMatches].sort((a, b) => {
    const timeA = a.createdAt instanceof Date ? a.createdAt.getTime() : new Date(a.createdAt).getTime();
    const timeB = b.createdAt instanceof Date ? b.createdAt.getTime() : new Date(b.createdAt).getTime();
    return timeA - timeB;
  });

  let wins = 0;
  let losses = 0;
  let singlesMatches = 0;
  let singlesWins = 0;
  let singlesLosses = 0;
  let doublesMatches = 0;
  let doublesWins = 0;
  let doublesLosses = 0;

  let totalPointsScored = 0;
  let totalPointsConceded = 0;
  let totalSetsPlayed = 0;

  // Streak tracking across history
  let activeStreak = 0; // positive = win streak, negative = loss streak
  let longestWinningStreak = 0;
  let longestLosingStreak = 0;
  let currentRunningWinStreak = 0;
  let currentRunningLossStreak = 0;

  chronological.forEach((match) => {
    const isWinner = match.winner && match.winner.includes(playerId);
    const isSingles = match.type === 'singles';

    if (isSingles) {
      singlesMatches++;
      if (isWinner) singlesWins++;
      else singlesLosses++;
    } else {
      doublesMatches++;
      if (isWinner) doublesWins++;
      else doublesLosses++;
    }

    if (isWinner) {
      wins++;
      currentRunningWinStreak++;
      currentRunningLossStreak = 0;
      if (currentRunningWinStreak > longestWinningStreak) {
        longestWinningStreak = currentRunningWinStreak;
      }
      activeStreak = activeStreak >= 0 ? activeStreak + 1 : 1;
    } else {
      losses++;
      currentRunningLossStreak++;
      currentRunningWinStreak = 0;
      if (currentRunningLossStreak > longestLosingStreak) {
        longestLosingStreak = currentRunningLossStreak;
      }
      activeStreak = activeStreak <= 0 ? activeStreak - 1 : -1;
    }

    // Points calculation
    // Determine if player was Team A or Team B
    let isTeamA = false;
    if (match.type === 'singles') {
      isTeamA = match.players[0] === playerId;
    } else if (match.players.length >= 4) {
      isTeamA = match.players[0] === playerId || match.players[1] === playerId;
    }

    const s1 = match.score?.set1;
    const s2 = match.score?.set2;
    const s3 = match.score?.set3;

    if (s1 && (s1.teamA > 0 || s1.teamB > 0)) {
      totalSetsPlayed++;
      totalPointsScored += isTeamA ? s1.teamA : s1.teamB;
      totalPointsConceded += isTeamA ? s1.teamB : s1.teamA;
    }
    if (s2 && (s2.teamA > 0 || s2.teamB > 0)) {
      totalSetsPlayed++;
      totalPointsScored += isTeamA ? s2.teamA : s2.teamB;
      totalPointsConceded += isTeamA ? s2.teamB : s2.teamA;
    }
    if (s3 && (s3.teamA > 0 || s3.teamB > 0)) {
      totalSetsPlayed++;
      totalPointsScored += isTeamA ? s3.teamA : s3.teamB;
      totalPointsConceded += isTeamA ? s3.teamB : s3.teamA;
    }
  });

  const totalMatches = wins + losses;
  const winPercentage = totalMatches > 0 ? Math.round((wins / totalMatches) * 100) : 0;
  const singlesWinPercentage = singlesMatches > 0 ? Math.round((singlesWins / singlesMatches) * 100) : 0;
  const doublesWinPercentage = doublesMatches > 0 ? Math.round((doublesWins / doublesMatches) * 100) : 0;
  const pointsDifference = totalPointsScored - totalPointsConceded;
  const averagePointsPerSet = totalSetsPlayed > 0 ? Number((totalPointsScored / totalSetsPlayed).toFixed(1)) : 0;

  // Recent 5 match form (newest first)
  const newestFirst = [...chronological].reverse();
  const recentForm: MatchResult[] = newestFirst.slice(0, 5).map((m) => {
    return m.winner && m.winner.includes(playerId) ? 'W' : 'L';
  });

  // Prioritize player's permanent lifetime counters from Firestore document
  const finalWins = player?.wins ?? wins;
  const finalLosses = player?.losses ?? losses;
  const finalTotalMatches = finalWins + finalLosses;
  const finalWinPercentage = finalTotalMatches > 0 ? Math.round((finalWins / finalTotalMatches) * 100) : 0;

  const finalPointsScored = Math.max(totalPointsScored, player?.pointsScored || 0);
  const finalPointsConceded = Math.max(totalPointsConceded, player?.pointsConceded || 0);
  const finalPointsDifference = finalPointsScored - finalPointsConceded;

  const finalDoublesWins: number = player?.doublesWins ?? (player?.doublesMatches ? (player.doublesWins ?? 0) : finalWins);
  const finalDoublesLosses: number = player?.doublesLosses ?? (player?.doublesMatches ? (player.doublesLosses ?? 0) : finalLosses);
  const finalDoublesMatches: number = player?.doublesMatches ?? (finalDoublesWins + finalDoublesLosses);
  const finalDoublesWinPercentage = finalDoublesMatches > 0 ? Math.round((finalDoublesWins / finalDoublesMatches) * 100) : 0;

  const finalSinglesWins: number = player?.singlesWins ?? singlesWins;
  const finalSinglesLosses: number = player?.singlesLosses ?? singlesLosses;
  const finalSinglesMatches: number = player?.singlesMatches ?? (finalSinglesWins + finalSinglesLosses);
  const finalSinglesWinPercentage = finalSinglesMatches > 0 ? Math.round((finalSinglesWins / finalSinglesMatches) * 100) : 0;

  const finalAveragePointsPerSet = finalTotalMatches > 0 ? Number((finalPointsScored / finalTotalMatches).toFixed(1)) : averagePointsPerSet;

  return {
    totalMatches: finalTotalMatches,
    wins: finalWins,
    losses: finalLosses,
    winPercentage: finalWinPercentage,
    currentStreak: player?.streak !== undefined ? player.streak : activeStreak,
    longestWinningStreak: Math.max(longestWinningStreak, player && player.streak > 0 ? player.streak : 0),
    longestLosingStreak,
    totalPointsScored: finalPointsScored,
    totalPointsConceded: finalPointsConceded,
    pointsDifference: finalPointsDifference,
    averagePointsPerSet: finalAveragePointsPerSet,
    singlesMatches: finalSinglesMatches,
    singlesWins: finalSinglesWins,
    singlesLosses: finalSinglesLosses,
    singlesWinPercentage: finalSinglesWinPercentage,
    doublesMatches: finalDoublesMatches,
    doublesWins: finalDoublesWins,
    doublesLosses: finalDoublesLosses,
    doublesWinPercentage: finalDoublesWinPercentage,
    recentForm,
  };
}

/**
 * Calculate all Doubles Partnerships statistics from historical doubles matches
 */
export function calculateAllPartnershipStats(
  matches: Match[],
  playerMap: Map<string, Player>
): PartnershipStats[] {
  const doublesMatches = matches.filter((m) => m.type === 'doubles' && m.players && m.players.length >= 4);

  // Group by canonical duo key
  const duoMatchesMap = new Map<string, { p1: string; p2: string; matches: Match[] }>();

  doublesMatches.forEach((match) => {
    const teamA1 = match.players[0];
    const teamA2 = match.players[1];
    const teamB1 = match.players[2];
    const teamB2 = match.players[3];

    // Canonical keys
    const keyA = getCanonicalDuoKey(teamA1, teamA2);
    const keyB = getCanonicalDuoKey(teamB1, teamB2);

    if (!duoMatchesMap.has(keyA)) {
      const sorted = [teamA1, teamA2].sort();
      duoMatchesMap.set(keyA, { p1: sorted[0], p2: sorted[1], matches: [] });
    }
    duoMatchesMap.get(keyA)!.matches.push(match);

    if (!duoMatchesMap.has(keyB)) {
      const sorted = [teamB1, teamB2].sort();
      duoMatchesMap.set(keyB, { p1: sorted[0], p2: sorted[1], matches: [] });
    }
    duoMatchesMap.get(keyB)!.matches.push(match);
  });

  const partnerships: PartnershipStats[] = [];

  duoMatchesMap.forEach(({ p1, p2, matches: duoMatches }, key) => {
    const player1 = playerMap.get(p1);
    const player2 = playerMap.get(p2);
    const p1Name = player1?.name || 'Unknown';
    const p2Name = player2?.name || 'Unknown';
    const duoName = `${p1Name} + ${p2Name}`;

    // Chronological sort
    const chronological = [...duoMatches].sort((a, b) => {
      const timeA = a.createdAt instanceof Date ? a.createdAt.getTime() : new Date(a.createdAt).getTime();
      const timeB = b.createdAt instanceof Date ? b.createdAt.getTime() : new Date(b.createdAt).getTime();
      return timeA - timeB;
    });

    let wins = 0;
    let losses = 0;
    let pointsScored = 0;
    let pointsConceded = 0;
    let setsPlayed = 0;

    let activeStreak = 0;
    let longestWinningStreak = 0;
    let currentWinStreak = 0;

    chronological.forEach((match) => {
      // Determine if this duo was Team A or Team B
      const isTeamA = (match.players[0] === p1 && match.players[1] === p2) ||
                      (match.players[0] === p2 && match.players[1] === p1);

      const isWinner = match.winner && (match.winner.includes(p1) || match.winner.includes(p2));

      if (isWinner) {
        wins++;
        currentWinStreak++;
        if (currentWinStreak > longestWinningStreak) longestWinningStreak = currentWinStreak;
        activeStreak = activeStreak >= 0 ? activeStreak + 1 : 1;
      } else {
        losses++;
        currentWinStreak = 0;
        activeStreak = activeStreak <= 0 ? activeStreak - 1 : -1;
      }

      // Points calculation
      const s1 = match.score?.set1;
      const s2 = match.score?.set2;
      const s3 = match.score?.set3;

      if (s1 && (s1.teamA > 0 || s1.teamB > 0)) {
        setsPlayed++;
        pointsScored += isTeamA ? s1.teamA : s1.teamB;
        pointsConceded += isTeamA ? s1.teamB : s1.teamA;
      }
      if (s2 && (s2.teamA > 0 || s2.teamB > 0)) {
        setsPlayed++;
        pointsScored += isTeamA ? s2.teamA : s2.teamB;
        pointsConceded += isTeamA ? s2.teamB : s2.teamA;
      }
      if (s3 && (s3.teamA > 0 || s3.teamB > 0)) {
        setsPlayed++;
        pointsScored += isTeamA ? s3.teamA : s3.teamB;
        pointsConceded += isTeamA ? s3.teamB : s3.teamA;
      }
    });

    const matchesPlayed = wins + losses;
    const winPercentage = matchesPlayed > 0 ? Math.round((wins / matchesPlayed) * 100) : 0;
    const pointsDifference = pointsScored - pointsConceded;
    const averagePointsPerSet = setsPlayed > 0 ? Number((pointsScored / setsPlayed).toFixed(1)) : 0;

    // Recent form (last 5 matches, newest first)
    const newestFirst = [...chronological].reverse();
    const recentForm: MatchResult[] = newestFirst.slice(0, 5).map((m) => {
      return m.winner && (m.winner.includes(p1) || m.winner.includes(p2)) ? 'W' : 'L';
    });

    partnerships.push({
      id: key,
      player1Id: p1,
      player2Id: p2,
      player1Name: p1Name,
      player2Name: p2Name,
      duoName,
      matchesPlayed,
      wins,
      losses,
      winPercentage,
      pointsScored,
      pointsConceded,
      pointsDifference,
      averagePointsPerSet,
      currentStreak: activeStreak,
      longestWinningStreak,
      recentForm,
      isQualified: matchesPlayed >= 5,
    });
  });

  // Sort: qualified partnerships first by win rate, then wins, then matches; then unqualified partnerships
  partnerships.sort((a, b) => {
    // 1. Minimum 5 matches qualification
    if (a.isQualified !== b.isQualified) {
      return a.isQualified ? -1 : 1;
    }
    // 2. Win Percentage descending
    if (b.winPercentage !== a.winPercentage) {
      return b.winPercentage - a.winPercentage;
    }
    // 3. Wins descending
    if (b.wins !== a.wins) {
      return b.wins - a.wins;
    }
    // 4. Matches played descending
    if (b.matchesPlayed !== a.matchesPlayed) {
      return b.matchesPlayed - a.matchesPlayed;
    }
    // 5. Duo name alphabetical
    return a.duoName.localeCompare(b.duoName);
  });

  // Assign ranks
  partnerships.forEach((p, idx) => {
    p.rank = idx + 1;
  });

  return partnerships;
}

/**
 * Get all doubles partners a player has teamed up with and their respective records
 */
export function getPlayerPartnershipBreakdown(
  playerId: string,
  matches: Match[],
  playerMap: Map<string, Player>
): PlayerPartnerRecord[] {
  const doublesMatches = matches.filter(
    (m) => m.type === 'doubles' && m.players && m.players.length >= 4 && m.players.includes(playerId)
  );

  const partnersMap = new Map<string, { matches: number; wins: number; losses: number; pointsScored: number; pointsConceded: number }>();

  doublesMatches.forEach((match) => {
    const isTeamA = match.players[0] === playerId || match.players[1] === playerId;
    const partnerId = isTeamA
      ? (match.players[0] === playerId ? match.players[1] : match.players[0])
      : (match.players[2] === playerId ? match.players[3] : match.players[2]);

    if (!partnerId) return;

    if (!partnersMap.has(partnerId)) {
      partnersMap.set(partnerId, { matches: 0, wins: 0, losses: 0, pointsScored: 0, pointsConceded: 0 });
    }
    const stat = partnersMap.get(partnerId)!;
    stat.matches++;

    const isWinner = match.winner && match.winner.includes(playerId);
    if (isWinner) stat.wins++;
    else stat.losses++;

    const s1 = match.score?.set1;
    const s2 = match.score?.set2;
    const s3 = match.score?.set3;

    if (s1) {
      stat.pointsScored += isTeamA ? s1.teamA : s1.teamB;
      stat.pointsConceded += isTeamA ? s1.teamB : s1.teamA;
    }
    if (s2) {
      stat.pointsScored += isTeamA ? s2.teamA : s2.teamB;
      stat.pointsConceded += isTeamA ? s2.teamB : s2.teamA;
    }
    if (s3) {
      stat.pointsScored += isTeamA ? s3.teamA : s3.teamB;
      stat.pointsConceded += isTeamA ? s3.teamB : s3.teamA;
    }
  });

  const records: PlayerPartnerRecord[] = [];
  partnersMap.forEach((stat, partnerId) => {
    const partner = playerMap.get(partnerId);
    const winPercentage = stat.matches > 0 ? Math.round((stat.wins / stat.matches) * 100) : 0;
    records.push({
      partnerId,
      partnerName: partner?.name || 'Unknown',
      matches: stat.matches,
      wins: stat.wins,
      losses: stat.losses,
      winPercentage,
      pointsScored: stat.pointsScored,
      pointsConceded: stat.pointsConceded,
    });
  });

  return records.sort((a, b) => {
    if (b.winPercentage !== a.winPercentage) return b.winPercentage - a.winPercentage;
    if (b.wins !== a.wins) return b.wins - a.wins;
    return b.matches - a.matches;
  });
}

/**
 * Get opponent rivalry breakdown for a player
 */
export function getPlayerRivalryBreakdown(
  playerId: string,
  matches: Match[],
  playerMap: Map<string, Player>
): PlayerRivalRecord[] {
  const playerMatches = matches.filter((m) => m.players && m.players.includes(playerId));

  const rivalryMap = new Map<string, { matches: number; wins: number; losses: number; type: 'singles' | 'doubles' }>();

  playerMatches.forEach((match) => {
    const isWinner = match.winner && match.winner.includes(playerId);
    const isSingles = match.type === 'singles';

    let opponents: string[] = [];
    if (isSingles) {
      const opp = match.players[0] === playerId ? match.players[1] : match.players[0];
      if (opp) opponents = [opp];
    } else if (match.players.length >= 4) {
      const isTeamA = match.players[0] === playerId || match.players[1] === playerId;
      opponents = isTeamA ? [match.players[2], match.players[3]] : [match.players[0], match.players[1]];
    }

    opponents.filter(Boolean).forEach((oppId) => {
      const key = `${oppId}_${match.type}`;
      if (!rivalryMap.has(key)) {
        rivalryMap.set(key, { matches: 0, wins: 0, losses: 0, type: match.type });
      }
      const stat = rivalryMap.get(key)!;
      stat.matches++;
      if (isWinner) stat.wins++;
      else stat.losses++;
    });
  });

  const records: PlayerRivalRecord[] = [];
  rivalryMap.forEach((stat, key) => {
    const [opponentId] = key.split('_');
    const opp = playerMap.get(opponentId);
    records.push({
      opponentId,
      opponentName: opp?.name || 'Unknown',
      matches: stat.matches,
      wins: stat.wins,
      losses: stat.losses,
      winPercentage: stat.matches > 0 ? Math.round((stat.wins / stat.matches) * 100) : 0,
      type: stat.type,
    });
  });

  return records.sort((a, b) => b.matches - a.matches);
}

/**
 * Calculate Head-to-Head record between two singles players or two doubles partnerships
 */
export function calculateHeadToHead(
  teamAIds: string[],
  teamBIds: string[],
  matches: Match[],
  playerMap: Map<string, Player>
): HeadToHeadStats {
  const isSingles = teamAIds.length === 1 && teamBIds.length === 1;

  const nameA = isSingles
    ? playerMap.get(teamAIds[0])?.name || 'Player A'
    : `${playerMap.get(teamAIds[0])?.name || 'P1'} + ${playerMap.get(teamAIds[1])?.name || 'P2'}`;

  const nameB = isSingles
    ? playerMap.get(teamBIds[0])?.name || 'Player B'
    : `${playerMap.get(teamBIds[0])?.name || 'P1'} + ${playerMap.get(teamBIds[1])?.name || 'P2'}`;

  const h2hMatches: Match[] = [];
  let winsA = 0;
  let winsB = 0;
  let pointsA = 0;
  let pointsB = 0;

  matches.forEach((m) => {
    if (isSingles) {
      if (m.type !== 'singles' || !m.players || m.players.length < 2) return;
      const hasA = m.players.includes(teamAIds[0]);
      const hasB = m.players.includes(teamBIds[0]);
      if (hasA && hasB) {
        h2hMatches.push(m);
        const aWon = m.winner && m.winner.includes(teamAIds[0]);
        if (aWon) winsA++;
        else winsB++;

        const isAFirst = m.players[0] === teamAIds[0];
        [m.score?.set1, m.score?.set2, m.score?.set3].filter(Boolean).forEach((s) => {
          if (s) {
            pointsA += isAFirst ? s.teamA : s.teamB;
            pointsB += isAFirst ? s.teamB : s.teamA;
          }
        });
      }
    } else {
      if (m.type !== 'doubles' || !m.players || m.players.length < 4) return;
      const matchTeamA = [m.players[0], m.players[1]];
      const matchTeamB = [m.players[2], m.players[3]];

      const keyA = getCanonicalDuoKey(teamAIds[0], teamAIds[1]);
      const keyB = getCanonicalDuoKey(teamBIds[0], teamBIds[1]);

      const matchKeyA = getCanonicalDuoKey(matchTeamA[0], matchTeamA[1]);
      const matchKeyB = getCanonicalDuoKey(matchTeamB[0], matchTeamB[1]);

      const direct = (matchKeyA === keyA && matchKeyB === keyB);
      const reverse = (matchKeyA === keyB && matchKeyB === keyA);

      if (direct || reverse) {
        h2hMatches.push(m);
        const aWon = direct
          ? (m.winner && (m.winner.includes(teamAIds[0]) || m.winner.includes(teamAIds[1])))
          : (m.winner && (m.winner.includes(teamAIds[0]) || m.winner.includes(teamAIds[1])));

        if (aWon) winsA++;
        else winsB++;

        [m.score?.set1, m.score?.set2, m.score?.set3].filter(Boolean).forEach((s) => {
          if (s) {
            if (direct) {
              pointsA += s.teamA;
              pointsB += s.teamB;
            } else {
              pointsA += s.teamB;
              pointsB += s.teamA;
            }
          }
        });
      }
    }
  });

  const total = winsA + winsB;
  return {
    entityAName: nameA,
    entityBName: nameB,
    totalMatches: total,
    winsA,
    winsB,
    winPercentageA: total > 0 ? Math.round((winsA / total) * 100) : 0,
    winPercentageB: total > 0 ? Math.round((winsB / total) * 100) : 0,
    pointsA,
    pointsB,
    recentMatches: [...h2hMatches].sort((a, b) => {
      const timeA = a.createdAt instanceof Date ? a.createdAt.getTime() : new Date(a.createdAt).getTime();
      const timeB = b.createdAt instanceof Date ? b.createdAt.getTime() : new Date(b.createdAt).getTime();
      return timeB - timeA;
    }),
  };
}

/**
 * Algorithm to generate two balanced doubles teams from 4 chosen players
 * using their individual win percentages and pairing history
 */
export function generateBalancedTeams(
  fourPlayerIds: string[],
  players: Player[],
  allMatches: Match[]
): { teamA: [Player, Player]; teamB: [Player, Player]; balanceScore: number } {
  const pMap = new Map(players.map((p) => [p.id, p]));
  const partnerships = calculateAllPartnershipStats(allMatches, pMap);
  const partMap = new Map(partnerships.map((p) => [p.id, p]));

  // There are 3 possible unique team pairings from 4 players [0, 1, 2, 3]:
  // Pair 1: (0, 1) vs (2, 3)
  // Pair 2: (0, 2) vs (1, 3)
  // Pair 3: (0, 3) vs (1, 2)
  const [p0, p1, p2, p3] = fourPlayerIds;

  const candidatePairings = [
    { teamA: [p0, p1], teamB: [p2, p3] },
    { teamA: [p0, p2], teamB: [p1, p3] },
    { teamA: [p0, p3], teamB: [p1, p2] },
  ];

  const evaluated = candidatePairings.map((c) => {
    const playerA1 = pMap.get(c.teamA[0])!;
    const playerA2 = pMap.get(c.teamA[1])!;
    const playerB1 = pMap.get(c.teamB[0])!;
    const playerB2 = pMap.get(c.teamB[1])!;

    // Individual win rates
    const winRateA1 = playerA1.wins + playerA1.losses > 0 ? (playerA1.wins / (playerA1.wins + playerA1.losses)) * 100 : 50;
    const winRateA2 = playerA2.wins + playerA2.losses > 0 ? (playerA2.wins / (playerA2.wins + playerA2.losses)) * 100 : 50;
    const winRateB1 = playerB1.wins + playerB1.losses > 0 ? (playerB1.wins / (playerB1.wins + playerB1.losses)) * 100 : 50;
    const winRateB2 = playerB2.wins + playerB2.losses > 0 ? (playerB2.wins / (playerB2.wins + playerB2.losses)) * 100 : 50;

    // Team combined average rating
    const teamARating = (winRateA1 + winRateA2) / 2;
    const teamBRating = (winRateB1 + winRateB2) / 2;

    // Minor adjustment for prior synergy if they played together
    const duoA = partMap.get(getCanonicalDuoKey(c.teamA[0], c.teamA[1]));
    const duoB = partMap.get(getCanonicalDuoKey(c.teamB[0], c.teamB[1]));
    const synergyA = duoA && duoA.matchesPlayed >= 3 ? (duoA.winPercentage - 50) * 0.1 : 0;
    const synergyB = duoB && duoB.matchesPlayed >= 3 ? (duoB.winPercentage - 50) * 0.1 : 0;

    const adjustedDiff = Math.abs((teamARating + synergyA) - (teamBRating + synergyB));

    return {
      teamA: [playerA1, playerA2] as [Player, Player],
      teamB: [playerB1, playerB2] as [Player, Player],
      balanceScore: adjustedDiff,
    };
  });

  // Sort by smallest skill gap / lowest balanceScore
  evaluated.sort((a, b) => a.balanceScore - b.balanceScore);
  return evaluated[0];
}
