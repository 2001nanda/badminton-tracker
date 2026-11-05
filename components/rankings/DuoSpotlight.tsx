'use client';

import { memo } from 'react';
import { Card } from '@/components/ui/card';
import { PartnershipStats } from '@/lib/types';
import { Crown, Flame, Zap, Trophy } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface DuoSpotlightProps {
  bestDuo: PartnershipStats | null;
  mostWinsDuo: PartnershipStats | null;
  mostPlayedDuo: PartnershipStats | null;
  longestStreakDuo: PartnershipStats | null;
  loading: boolean;
}

export const DuoSpotlight = memo(function DuoSpotlight({
  bestDuo,
  mostWinsDuo,
  mostPlayedDuo,
  longestStreakDuo,
  loading,
}: DuoSpotlightProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-24 bg-white/5 rounded-2xl" />
        ))}
      </div>
    );
  }

  const spotlights = [
    {
      icon: Crown,
      label: '👑 Best Partnership',
      name: bestDuo ? bestDuo.duoName : 'N/A',
      detail: bestDuo ? `${bestDuo.winPercentage}% Win Rate` : 'No data',
      gradient: 'from-yellow-400 to-yellow-600',
      iconColor: 'text-yellow-400',
    },
    {
      icon: Trophy,
      label: '🏆 Most Wins',
      name: mostWinsDuo ? mostWinsDuo.duoName : 'N/A',
      detail: mostWinsDuo ? `${mostWinsDuo.wins} total wins` : 'No data',
      gradient: 'from-emerald-400 to-emerald-600',
      iconColor: 'text-emerald-400',
    },
    {
      icon: Zap,
      label: '⚡ Most Played',
      name: mostPlayedDuo ? mostPlayedDuo.duoName : 'N/A',
      detail: mostPlayedDuo ? `${mostPlayedDuo.matchesPlayed} matches` : 'No data',
      gradient: 'from-blue-400 to-purple-600',
      iconColor: 'text-blue-400',
    },
    {
      icon: Flame,
      label: '🔥 Longest Streak',
      name: longestStreakDuo ? longestStreakDuo.duoName : 'N/A',
      detail: longestStreakDuo ? `${longestStreakDuo.longestWinningStreak} in a row` : 'No data',
      gradient: 'from-orange-400 to-red-600',
      iconColor: 'text-orange-400',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
      {spotlights.map((item) => {
        const Icon = item.icon;
        return (
          <Card
            key={item.label}
            className="border-white/10 bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-sm overflow-hidden rounded-2xl"
          >
            <div className="p-4">
              <div className="flex items-center space-x-2 mb-1.5">
                <Icon className={`w-4 h-4 ${item.iconColor}`} />
                <span className="text-xs text-gray-400 font-medium truncate">{item.label}</span>
              </div>
              <p className="text-sm font-bold text-white truncate">{item.name}</p>
              <p className="text-[11px] text-slate-500 mt-0.5">{item.detail}</p>
            </div>
            <div className={`h-1 bg-gradient-to-r ${item.gradient}`} />
          </Card>
        );
      })}
    </div>
  );
});

