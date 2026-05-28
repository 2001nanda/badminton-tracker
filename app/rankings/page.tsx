'use client';

import { RankingsHeader } from '@/components/rankings/RankingsHeader';
import { RankingsTabs } from '@/components/rankings/RankingsTabs';
import { RankingsSpotlight } from '@/components/rankings/RankingsSpotlight';
import { RankingsList } from '@/components/rankings/RankingsList';
import { useOptimizedPlayers } from '@/lib/hooks/useOptimizedPlayers';
import { useRankings } from '@/lib/hooks/useRankings';
import { useState } from 'react';

type RankingPeriod = 'all-time' | 'week' | 'month';

export default function RankingsPage() {
  const { players, loading } = useOptimizedPlayers();
  const [period, setPeriod] = useState<RankingPeriod>('all-time');
  const { rankedPlayers, spotlight } = useRankings(players, period);

  return (
    <div className="min-h-screen">
      <RankingsHeader />
      
      <div className="container mx-auto px-4 py-6 max-w-5xl">
        <RankingsTabs 
          value={period}
          onChange={setPeriod}
        />
        
        <RankingsSpotlight 
          spotlight={spotlight}
          loading={loading}
        />
        
        <RankingsList 
          players={rankedPlayers}
          loading={loading}
        />
      </div>
    </div>
  );
}
