'use client';

import { use, useMemo } from 'react';
import { PlayerProfileHeader } from '@/components/player-profile/PlayerProfileHeader';
import { PlayerStats } from '@/components/player-profile/PlayerStats';
import { PlayerPartnerships } from '@/components/player-profile/PlayerPartnerships';
import { PlayerRivalries } from '@/components/player-profile/PlayerRivalries';
import { PlayerRecentMatches } from '@/components/player-profile/PlayerRecentMatches';
import { useOptimizedPlayers } from '@/lib/hooks/useOptimizedPlayers';
import { useMatchesByPlayer } from '@/lib/hooks/useMatches';
import { notFound } from 'next/navigation';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import {
  calculateExtendedPlayerStats,
  getPlayerPartnershipBreakdown,
  getPlayerRivalryBreakdown,
} from '@/lib/utils/combinationStats';

interface PlayerProfilePageProps {
  params: Promise<{ id: string }>;
}

export default function PlayerProfilePage({ params }: PlayerProfilePageProps) {
  const { id } = use(params);
  const { players, playerMap, loading: playersLoading } = useOptimizedPlayers();
  const { matches, loading: matchesLoading } = useMatchesByPlayer(id);

  const player = players.find((p) => p.id === id);

  const extendedStats = useMemo(() => {
    if (!player) return null;
    return calculateExtendedPlayerStats(id, matches, playerMap);
  }, [id, matches, playerMap, player]);

  const partnerRecords = useMemo(() => {
    if (!player) return [];
    return getPlayerPartnershipBreakdown(id, matches, playerMap);
  }, [id, matches, playerMap, player]);

  const rivalryRecords = useMemo(() => {
    if (!player) return [];
    return getPlayerRivalryBreakdown(id, matches, playerMap);
  }, [id, matches, playerMap, player]);

  if (playersLoading || matchesLoading) {
    return <LoadingSpinner />;
  }

  if (!player || !extendedStats) {
    notFound();
  }

  return (
    <div className="min-h-screen">
      <PlayerProfileHeader player={player} />

      <div className="container mx-auto px-4 py-6 max-w-5xl">
        {/* Performance Statistics & Recent Form */}
        <PlayerStats player={player} stats={extendedStats} />

        {/* Partnership Performance */}
        <PlayerPartnerships partnerRecords={partnerRecords} />

        {/* Rivalry & Opponent Breakdown */}
        <PlayerRivalries rivalRecords={rivalryRecords} />

        {/* Match History */}
        <PlayerRecentMatches
          player={player}
          matches={matches}
          players={players}
          loading={matchesLoading}
        />
      </div>
    </div>
  );
}
