'use client';

import { memo } from 'react';
import { Match, Player } from '@/lib/types';
import { BattleCard } from '@/components/dashboard/BattleCard';
import { BattleCardSkeleton } from '@/components/dashboard/BattleCardSkeleton';
import { EmptyBattles } from '@/components/dashboard/EmptyBattles';
import { Swords } from 'lucide-react';

interface RecentBattlesFeedProps {
  matches: Match[];
  players: Player[];
  loading: boolean;
}

export const RecentBattlesFeed = memo(function RecentBattlesFeed({
  matches,
  players,
  loading,
}: RecentBattlesFeedProps) {
  return (
    <section>
      {/* Section Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <Swords className="w-5 h-5 text-emerald-400" />
          <h2 className="text-xl font-bold text-white">Recent Matches</h2>
        </div>
        {!loading && matches.length > 0 && (
          <span className="text-sm text-slate-500">
            {matches.length} {matches.length === 1 ? 'match' : 'matches'}
          </span>
        )}
      </div>

      {/* Feed Content */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <BattleCardSkeleton key={i} />
          ))}
        </div>
      ) : matches.length === 0 ? (
        <EmptyBattles />
      ) : (
        <div className="space-y-3">
          {matches.map((match) => (
            <BattleCard key={match.id} match={match} players={players} />
          ))}
        </div>
      )}
    </section>
  );
});
