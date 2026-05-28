'use client';

import { memo } from 'react';
import { Player, Match } from '@/lib/types';
import { BattleCard } from '@/components/dashboard/BattleCard';
import { BattleCardSkeleton } from '@/components/dashboard/BattleCardSkeleton';
import { Card } from '@/components/ui/card';
import { History } from 'lucide-react';

interface PlayerRecentMatchesProps {
  player: Player;
  matches: Match[];
  players: Player[];
  loading: boolean;
}

export const PlayerRecentMatches = memo(function PlayerRecentMatches({
  player,
  matches,
  players,
  loading,
}: PlayerRecentMatchesProps) {
  return (
    <div>
      <div className="flex items-center space-x-3 mb-4">
        <History className="w-5 h-5 text-emerald-400" />
        <h2 className="text-xl font-bold text-white">Recent Matches</h2>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <BattleCardSkeleton key={i} />
          ))}
        </div>
      ) : matches.length === 0 ? (
        <Card className="border-white/10 bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-sm">
          <div className="p-12 text-center">
            <History className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-400 mb-2">
              No Matches Yet
            </h3>
            <p className="text-gray-500">
              {player.name} hasn't played any matches yet
            </p>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {matches.slice(0, 10).map((match) => (
            <BattleCard key={match.id} match={match} players={players} />
          ))}
        </div>
      )}
    </div>
  );
});
