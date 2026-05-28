'use client';

import { memo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Card } from '@/components/ui/card';
import { Player } from '@/lib/types';
import { Crown, Flame, Zap, Trophy, Edit } from 'lucide-react';
import { cn } from '@/lib/utils';
import { calculateWinRate, getTotalMatches, getPlayerInitials } from '@/lib/utils/statsUtils';
import { EditPlayerModal } from './EditPlayerModal';

interface PremiumPlayerCardProps {
  player: Player;
  badges?: {
    courtKing?: boolean;
    hotStreak?: boolean;
    mostActive?: boolean;
    weeklyChampion?: boolean;
  };
}

export const PremiumPlayerCard = memo(function PremiumPlayerCard({
  player,
  badges = {},
}: PremiumPlayerCardProps) {
  const [editModalOpen, setEditModalOpen] = useState(false);
  const winRate = calculateWinRate(player);
  const totalMatches = getTotalMatches(player);
  const initials = getPlayerInitials(player.name);

  const handleEditClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setEditModalOpen(true);
  };

  return (
    <>
      <Link href={`/players/${player.id}`}>
        <Card className="group relative overflow-hidden border-white/10 bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-sm hover:from-white/10 hover:to-white/15 transition-all hover:scale-105 hover:shadow-xl hover:shadow-emerald-500/20 cursor-pointer">
          {/* Edit Button - Shows on hover */}
          <button
            onClick={handleEditClick}
            className="absolute top-3 left-3 p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity z-10"
            title="Edit player"
          >
            <Edit className="w-4 h-4 text-white" />
          </button>

          {/* Badges */}
          {Object.values(badges).some(Boolean) && (
            <div className="absolute top-3 right-3 flex flex-wrap gap-1 justify-end z-10">
              {badges.courtKing && (
                <div className="p-1.5 rounded-lg bg-yellow-500/20 backdrop-blur-sm">
                  <Crown className="w-4 h-4 text-yellow-400" />
                </div>
              )}
              {badges.hotStreak && (
                <div className="p-1.5 rounded-lg bg-orange-500/20 backdrop-blur-sm">
                  <Flame className="w-4 h-4 text-orange-400" />
                </div>
              )}
              {badges.mostActive && (
                <div className="p-1.5 rounded-lg bg-blue-500/20 backdrop-blur-sm">
                  <Zap className="w-4 h-4 text-blue-400" />
                </div>
              )}
              {badges.weeklyChampion && (
                <div className="p-1.5 rounded-lg bg-emerald-500/20 backdrop-blur-sm">
                  <Trophy className="w-4 h-4 text-emerald-400" />
                </div>
              )}
            </div>
          )}

          <div className="p-6">
            {/* Avatar and Name */}
            <div className="flex items-center space-x-4 mb-4">
              {player.photoURL ? (
                <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-emerald-500/30 flex-shrink-0 group-hover:scale-110 group-hover:border-emerald-500/50 transition-all">
                  <Image
                    src={player.photoURL}
                    alt={player.name}
                    width={64}
                    height={64}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                  <span className="text-white font-bold text-xl">{initials}</span>
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-bold text-white truncate group-hover:text-emerald-400 transition-colors">
                  {player.name}
                </h3>
                <p className="text-sm text-gray-400">
                  {totalMatches} {totalMatches === 1 ? 'match' : 'matches'}
                </p>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="text-center p-2 rounded-lg bg-white/5">
                <p className="text-2xl font-bold text-emerald-400">{player.wins}</p>
                <p className="text-xs text-gray-500">Wins</p>
              </div>
              <div className="text-center p-2 rounded-lg bg-white/5">
                <p className="text-2xl font-bold text-red-400">{player.losses}</p>
                <p className="text-xs text-gray-500">Losses</p>
              </div>
              <div className="text-center p-2 rounded-lg bg-white/5">
                <p className="text-2xl font-bold text-yellow-400">{winRate}%</p>
                <p className="text-xs text-gray-500">Win Rate</p>
              </div>
            </div>

            {/* Streak */}
            {player.streak !== 0 && (
              <div className={cn(
                'flex items-center justify-center space-x-2 p-2 rounded-lg',
                player.streak > 0 ? 'bg-emerald-500/20' : 'bg-red-500/20'
              )}>
                {player.streak > 0 ? (
                  <>
                    <Flame className="w-4 h-4 text-yellow-400" />
                    <span className="text-sm font-semibold text-emerald-400">
                      {Math.abs(player.streak)} Win Streak
                    </span>
                  </>
                ) : (
                  <>
                    <span className="text-sm font-semibold text-red-400">
                      {Math.abs(player.streak)} Loss Streak
                    </span>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Bottom Accent */}
          <div className="h-1 bg-gradient-to-r from-emerald-400 to-yellow-400" />
        </Card>
      </Link>

      {/* Edit Modal */}
      <EditPlayerModal
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        player={player}
      />
    </>
  );
});
