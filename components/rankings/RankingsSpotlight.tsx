'use client';

import { memo } from 'react';
import { Card } from '@/components/ui/card';
import { Player } from '@/lib/types';
import { Crown, Flame, Zap, Trophy } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface Spotlight {
  courtKing: Player | null;
  longestStreak: Player | null;
  mostActive: Player | null;
  weeklyChampion: Player | null;
}

interface RankingsSpotlightProps {
  spotlight: Spotlight;
  loading: boolean;
}

export const RankingsSpotlight = memo(function RankingsSpotlight({
  spotlight,
  loading,
}: RankingsSpotlightProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-24 bg-white/5" />
        ))}
      </div>
    );
  }

  const spotlights = [
    {
      icon: Crown,
      label: 'Court King',
      player: spotlight.courtKing,
      gradient: 'from-yellow-400 to-yellow-600',
      iconColor: 'text-yellow-400',
    },
    {
      icon: Flame,
      label: 'Longest Streak',
      player: spotlight.longestStreak,
      gradient: 'from-orange-400 to-red-600',
      iconColor: 'text-orange-400',
    },
    {
      icon: Zap,
      label: 'Most Active',
      player: spotlight.mostActive,
      gradient: 'from-blue-400 to-purple-600',
      iconColor: 'text-blue-400',
    },
    {
      icon: Trophy,
      label: 'Weekly Champion',
      player: spotlight.weeklyChampion,
      gradient: 'from-emerald-400 to-emerald-600',
      iconColor: 'text-emerald-400',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
      {spotlights.map((item) => {
        const Icon = item.icon;
        return (
          <Card
            key={item.label}
            className="border-white/10 bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-sm overflow-hidden"
          >
            <div className="p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Icon className={`w-4 h-4 ${item.iconColor}`} />
                <span className="text-xs text-gray-400 font-medium">{item.label}</span>
              </div>
              <p className="text-sm font-bold text-white truncate">
                {item.player?.name || 'N/A'}
              </p>
            </div>
            <div className={`h-1 bg-gradient-to-r ${item.gradient}`} />
          </Card>
        );
      })}
    </div>
  );
});
