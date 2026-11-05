'use client';

import { memo } from 'react';
import { Crown, Flame, Trophy, Zap, Users } from 'lucide-react';
import { HomeStats } from '@/lib/types';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { StatsCardSkeleton } from '@/components/dashboard/StatsCardSkeleton';

interface StatsOverviewProps {
  stats: HomeStats;
  loading: boolean;
}

export const StatsOverview = memo(function StatsOverview({ stats, loading }: StatsOverviewProps) {
  return (
    <section className="mb-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {loading ? (
          <>
            <StatsCardSkeleton />
            <StatsCardSkeleton />
            <StatsCardSkeleton />
            <StatsCardSkeleton />
          </>
        ) : (
          <>
            <StatsCard
              icon={Crown}
              iconColor="bg-yellow-500/20 text-yellow-400"
              title="👑 Court King"
              value={stats.courtKing?.name || 'No data'}
              subtitle={stats.courtKing ? `${stats.courtKing.wins} career wins` : 'Play matches to compete'}
              gradient=""
              glowColor=""
            />
            <StatsCard
              icon={Flame}
              iconColor="bg-orange-500/20 text-orange-400"
              title="🔥 Active Streak"
              value={stats.currentStreak?.name || 'No data'}
              subtitle={stats.currentStreak ? `${stats.currentStreak.streak} in a row` : 'Start your streak'}
              gradient=""
              glowColor=""
            />
            <StatsCard
              icon={Users}
              iconColor="bg-emerald-500/20 text-emerald-400"
              title="👥 Best Duo"
              value={stats.bestDuo?.name || 'No data'}
              subtitle={stats.bestDuo ? `${stats.bestDuo.winPercentage}% win rate` : 'Record doubles matches'}
              gradient=""
              glowColor=""
            />
            <StatsCard
              icon={Zap}
              iconColor="bg-blue-500/20 text-blue-400"
              title="⚡ Weekly Leader"
              value={stats.mostWinsThisWeek?.name || stats.mostActive?.name || 'No data'}
              subtitle={
                stats.mostWinsThisWeek
                  ? `${stats.mostWinsThisWeek.wins} wins this week`
                  : stats.mostActive
                  ? `${stats.mostActive.matches} matches played`
                  : 'Get on the court'
              }
              gradient=""
              glowColor=""
            />
          </>
        )}
      </div>
    </section>
  );
});
