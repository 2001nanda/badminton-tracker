'use client';

import { use } from 'react';
import { PlayerProfileHeader } from '@/components/player-profile/PlayerProfileHeader';
import { PlayerStats } from '@/components/player-profile/PlayerStats';
import { PlayerRecentMatches } from '@/components/player-profile/PlayerRecentMatches';
import { useOptimizedPlayers } from '@/lib/hooks/useOptimizedPlayers';
import { useMatchesByPlayer } from '@/lib/hooks/useMatches';
import { notFound } from 'next/navigation';
import { LoadingSpinner } from '@/components/LoadingSpinner';

interface PlayerProfilePageProps {
  params: Promise<{ id: string }>;
}

export default function PlayerProfilePage({ params }: PlayerProfilePageProps) {
  const { id } = use(params);
  const { players, loading: playersLoading } = useOptimizedPlayers();
  const { matches, loading: matchesLoading } = useMatchesByPlayer(id);

  const player = players.find(p => p.id === id);

  if (playersLoading) {
    return <LoadingSpinner />;
  }

  if (!player) {
    notFound();
  }

  return (
    <div className="min-h-screen">
      <PlayerProfileHeader player={player} />
      
      <div className="container mx-auto px-4 py-6 max-w-5xl">
        <PlayerStats player={player} />
        
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
