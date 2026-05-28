'use client';

import { DashboardHero } from '@/components/dashboard/DashboardHero';
import { StatsOverview } from '@/components/dashboard/StatsOverview';
import { RecentBattlesFeed } from '@/components/dashboard/RecentBattlesFeed';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { useHomeStats } from '@/lib/hooks/useHomeStats';
import { useOptimizedMatches } from '@/lib/hooks/useOptimizedMatches';
import { useOptimizedPlayers } from '@/lib/hooks/useOptimizedPlayers';

export default function HomePage() {
  const { stats, loading: statsLoading } = useHomeStats();
  const { matches, loading: matchesLoading } = useOptimizedMatches(10);
  const { players } = useOptimizedPlayers();

  return (
    <div className="min-h-screen">
      {/* Hero Header */}
      <DashboardHero />

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6 max-w-7xl space-y-8">
        {/* Stats Overview */}
        <StatsOverview stats={stats} loading={statsLoading} />

        {/* Quick Actions - Mobile Only */}
        <div className="md:hidden">
          <QuickActions />
        </div>

        {/* Recent Battles Feed */}
        <RecentBattlesFeed 
          matches={matches} 
          players={players} 
          loading={matchesLoading} 
        />
      </div>
    </div>
  );
}
