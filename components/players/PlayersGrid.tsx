'use client';

import { memo } from 'react';
import { Player } from '@/lib/types';
import { PremiumPlayerCard } from './PremiumPlayerCard';
import { PlayerCardSkeleton } from './PlayerCardSkeleton';
import { EmptyPlayers } from './EmptyPlayers';

interface PlayersGridProps {
  players: Player[];
  loading: boolean;
}

export const PlayersGrid = memo(function PlayersGrid({
  players,
  loading,
}: PlayersGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <PlayerCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (players.length === 0) {
    return <EmptyPlayers />;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {players.map((player) => (
        <PremiumPlayerCard key={player.id} player={player} />
      ))}
    </div>
  );
});
