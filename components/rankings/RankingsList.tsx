'use client';

import { memo } from 'react';
import { Player } from '@/lib/types';
import { RankingCard } from './RankingCard';
import { RankingCardSkeleton } from './RankingCardSkeleton';
import { EmptyRankings } from './EmptyRankings';

interface RankingsListProps {
  players: Player[];
  loading: boolean;
}

export const RankingsList = memo(function RankingsList({
  players,
  loading,
}: RankingsListProps) {
  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(8)].map((_, i) => (
          <RankingCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (players.length === 0) {
    return <EmptyRankings />;
  }

  return (
    <div className="space-y-3">
      {players.map((player, index) => (
        <RankingCard
          key={player.id}
          player={player}
          rank={index + 1}
        />
      ))}
    </div>
  );
});
