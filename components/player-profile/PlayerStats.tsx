'use client';

import { memo } from 'react';
import { Card } from '@/components/ui/card';
import { Player } from '@/lib/types';
import { Trophy, Target, Flame, TrendingUp } from 'lucide-react';
import { calculateWinRate, getTotalMatches } from '@/lib/utils/statsUtils';

interface PlayerStatsProps {
  player: Player;
}

export const PlayerStats = memo(function PlayerStats({ player }: PlayerStatsProps) {
  const winRate = calculateWinRate(player);
  const totalMatches = getTotalMatches(player);

  const stats = [
    {
      icon: Trophy,
      label: 'Matches Played',
      value: totalMatches,
      color: 'text-blue-400',
      gradient: 'from-blue-400 to-blue-600',
    },
    {
      icon: Target,
      label: 'Wins',
      value: player.wins,
      color: 'text-emerald-400',
      gradient: 'from-emerald-400 to-emerald-600',
    },
    {
      icon: TrendingUp,
      label: 'Losses',
      value: player.losses,
      color: 'text-red-400',
      gradient: 'from-red-400 to-red-600',
    },
    {
      icon: Flame,
      label: 'Win Rate',
      value: `${winRate}%`,
      color: 'text-yellow-400',
      gradient: 'from-yellow-400 to-yellow-600',
    },
  ];

  return (
    <div className="mb-8">
      <h2 className="text-xl font-bold text-white mb-4">Statistics</h2>
      
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card
              key={stat.label}
              className="border-white/10 bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-sm overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <Icon className={`w-5 h-5 ${stat.color}`} />
                </div>
                <p className={`text-3xl font-bold ${stat.color} mb-1`}>
                  {stat.value}
                </p>
                <p className="text-sm text-gray-400">{stat.label}</p>
              </div>
              <div className={`h-1 bg-gradient-to-r ${stat.gradient}`} />
            </Card>
          );
        })}
      </div>

      {/* Current Streak */}
      {player.streak !== 0 && (
        <Card className="border-white/10 bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-sm mt-4">
          <div className="p-6 text-center">
            <div className="flex items-center justify-center space-x-3 mb-2">
              <Flame className={player.streak > 0 ? 'w-6 h-6 text-yellow-400' : 'w-6 h-6 text-red-400'} />
              <h3 className="text-lg font-semibold text-white">Current Streak</h3>
            </div>
            <p className={`text-4xl font-bold ${player.streak > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {Math.abs(player.streak)} {player.streak > 0 ? 'Wins' : 'Losses'}
            </p>
          </div>
        </Card>
      )}
    </div>
  );
});
