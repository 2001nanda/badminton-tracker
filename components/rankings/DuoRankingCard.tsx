'use client';

import { memo } from 'react';
import { Card } from '@/components/ui/card';
import { PartnershipStats } from '@/lib/types';
import { Crown, Medal, Trophy, Flame, ShieldAlert } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getPlayerInitials } from '@/lib/utils/combinationStats';

interface DuoRankingCardProps {
  partnership: PartnershipStats;
  rank: number;
}

export const DuoRankingCard = memo(function DuoRankingCard({
  partnership,
  rank,
}: DuoRankingCardProps) {
  const isTopThree = rank <= 3 && partnership.isQualified;

  const getRankBadge = () => {
    if (!partnership.isQualified) {
      return (
        <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
          <span className="text-xs font-bold text-slate-500">#{rank}</span>
        </div>
      );
    }
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
        <span className="text-lg font-bold text-gray-400">#{rank}</span>
      </div>
    );
  };

  const initials1 = getPlayerInitials(partnership.player1Name);
  const initials2 = getPlayerInitials(partnership.player2Name);

  return (
    <Card
      className={cn(
        'group relative overflow-hidden border-white/10 backdrop-blur-sm transition-all hover:scale-[1.01] rounded-2xl',
        isTopThree
          ? 'bg-gradient-to-br from-white/10 to-white/15 hover:from-white/15 hover:to-white/20 shadow-lg'
          : 'bg-gradient-to-br from-white/5 to-white/10 hover:from-white/10 hover:to-white/15'
      )}
    >
      {rank === 1 && partnership.isQualified && (
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-yellow-500/20 to-transparent rounded-bl-full pointer-events-none" />
      )}

      <div className="p-4 md:p-5">
        <div className="flex items-center space-x-3 sm:space-x-4">
          {/* Rank Badge */}
          <div className="flex-shrink-0">{getRankBadge()}</div>

          {/* Overlapping Duo Avatars */}
          <div className="flex items-center -space-x-3 flex-shrink-0">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-xs font-bold text-white border-2 border-[#111827] shadow-md">
              {initials1}
            </div>
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center text-xs font-bold text-black border-2 border-[#111827] shadow-md">
              {initials2}
            </div>
          </div>

          {/* Duo Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-bold text-white truncate group-hover:text-emerald-400 transition-colors">
                {partnership.duoName}
              </h3>
              {!partnership.isQualified && (
                <span className="text-[10px] bg-white/10 text-slate-400 px-2 py-0.5 rounded-full font-medium shrink-0">
                  {partnership.matchesPlayed}/5 to qualify
                </span>
              )}
            </div>

            <div className="flex items-center space-x-3 mt-1 text-xs sm:text-sm text-gray-400">
              <span>
                {partnership.wins}W - {partnership.losses}L ({partnership.matchesPlayed} played)
              </span>
              {partnership.currentStreak !== 0 && (
                <div className="flex items-center space-x-1">
                  <Flame className="w-3.5 h-3.5 text-yellow-400" />
                  <span
                    className={cn(
                      'text-xs font-semibold',
                      partnership.currentStreak > 0 ? 'text-emerald-400' : 'text-red-400'
                    )}
                  >
                    {Math.abs(partnership.currentStreak)}
                    {partnership.currentStreak > 0 ? 'W' : 'L'}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Win Rate */}
          <div className="flex-shrink-0 text-right">
            <div className="text-xl sm:text-3xl font-extrabold text-emerald-400">
              {partnership.winPercentage}%
            </div>
            <div className="text-[11px] text-gray-500 font-medium">Win Rate</div>
          </div>
        </div>
      </div>

      {/* Top 3 bottom accent bar */}
      {isTopThree && (
        <div
          className={cn(
            'h-1 bg-gradient-to-r',
            rank === 1 && 'from-yellow-400 to-yellow-600',
            rank === 2 && 'from-gray-300 to-gray-500',
            rank === 3 && 'from-orange-400 to-orange-600'
          )}
        />
      )}
    </Card>
  );
});

