'use client';

import { memo } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Player } from '@/lib/types';
import { Crown, Medal, Trophy, Flame } from 'lucide-react';
import { cn } from '@/lib/utils';
import { calculateWinRate, getPlayerInitials } from '@/lib/utils/statsUtils';

interface RankingCardProps {
  player: Player;
  rank: number;
}

export const RankingCard = memo(function RankingCard({
  player,
  rank,
}: RankingCardProps) {
  const winRate = calculateWinRate(player);
  const initials = getPlayerInitials(player.name);
  const isTopThree = rank <= 3;

  const getRankBadge = () => {
    if (rank === 1) {
      return (
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center shadow-lg shadow-yellow-500/50">
          <Crown className="w-6 h-6 text-black" />
        </div>
      );
    }
    if (rank === 2) {
      return (
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-300 to-gray-500 flex items-center justify-center shadow-lg shadow-gray-500/50">
          <Medal className="w-6 h-6 text-black" />
        </div>
      );
    }
    if (rank === 3) {
      return (
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/50">
          <Trophy className="w-6 h-6 text-black" />
        </div>
      );
    }
    return (
      <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
        <span className="text-xl font-bold text-gray-400">#{rank}</span>
      </div>
    );
  };

  return (
    <Link href={`/players/${player.id}`}>
      <Card className={cn(
        'group relative overflow-hidden border-white/10 backdrop-blur-sm transition-all hover:scale-105 cursor-pointer',
        isTopThree
          ? 'bg-gradient-to-br from-white/10 to-white/15 hover:from-white/15 hover:to-white/20 shadow-lg'
          : 'bg-gradient-to-br from-white/5 to-white/10 hover:from-white/10 hover:to-white/15'
      )}>
        {rank === 1 && (
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-yellow-500/20 to-transparent rounded-bl-full" />
        )}

        <div className="p-4 md:p-5">
          <div className="flex items-center space-x-4">
            {/* Rank Badge */}
            <div className="flex-shrink-0">
              {getRankBadge()}
            </div>

            {/* Player Avatar */}
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
              <span className="text-white font-bold text-lg">{initials}</span>
            </div>

            {/* Player Info */}
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-bold text-white truncate group-hover:text-emerald-400 transition-colors">
                {player.name}
              </h3>
              <div className="flex items-center space-x-3 mt-1">
                <span className="text-sm text-gray-400">
                  {player.wins}W - {player.losses}L
                </span>
                {player.streak !== 0 && (
                  <div className="flex items-center space-x-1">
                    <Flame className="w-3 h-3 text-yellow-400" />
                    <span className={cn(
                      'text-xs font-semibold',
                      player.streak > 0 ? 'text-emerald-400' : 'text-red-400'
                    )}>
                      {Math.abs(player.streak)}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Win Rate */}
            <div className="flex-shrink-0 text-right">
              <div className="text-2xl md:text-3xl font-bold text-emerald-400">
                {winRate}%
              </div>
              <div className="text-xs text-gray-500">Win Rate</div>
            </div>
          </div>
        </div>

        {/* Bottom Accent */}
        {isTopThree && (
          <div className={cn(
            'h-1 bg-gradient-to-r',
            rank === 1 && 'from-yellow-400 to-yellow-600',
            rank === 2 && 'from-gray-300 to-gray-500',
            rank === 3 && 'from-orange-400 to-orange-600'
          )} />
        )}
      </Card>
    </Link>
  );
});
