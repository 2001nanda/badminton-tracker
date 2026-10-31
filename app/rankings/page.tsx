'use client';

import { useState } from 'react';
import { RankingsHeader } from '@/components/rankings/RankingsHeader';
import { RankingsTabs } from '@/components/rankings/RankingsTabs';
import { RankingsSpotlight } from '@/components/rankings/RankingsSpotlight';
import { RankingsList } from '@/components/rankings/RankingsList';
import { MatchTypeFilter } from '@/components/rankings/MatchTypeFilter';
import { DuoSpotlight } from '@/components/rankings/DuoSpotlight';
import { DuoRankingsList } from '@/components/rankings/DuoRankingsList';
import { useOptimizedPlayers } from '@/lib/hooks/useOptimizedPlayers';
import { useRankings } from '@/lib/hooks/useRankings';
import { usePartnerships } from '@/lib/hooks/usePartnerships';
import { User, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

type MainRankingTab = 'individual' | 'doubles';
type RankingPeriod = 'all-time' | 'week' | 'month';
type MatchTypeFilter = 'all' | 'singles' | 'doubles';

export default function RankingsPage() {
  const [mainTab, setMainTab] = useState<MainRankingTab>('individual');
  const { players, loading: playersLoading } = useOptimizedPlayers();
  const [period, setPeriod] = useState<RankingPeriod>('all-time');
  const [matchType, setMatchType] = useState<MatchTypeFilter>('all');
  const { rankedPlayers, spotlight } = useRankings(players, period, matchType);

  const {
    partnerships,
    bestPartnership,
    mostWinsPartnership,
    mostPlayedPartnership,
    longestStreakPartnership,
    loading: partnershipsLoading,
  } = usePartnerships();

  return (
    <div className="min-h-screen">
      <RankingsHeader />

      <div className="container mx-auto px-4 py-6 max-w-5xl">
        {/* Main Tab Switcher: Individual vs Doubles */}
        <div className="flex bg-white/5 border border-white/10 p-1.5 rounded-2xl mb-6 max-w-md mx-auto">
          <button
            onClick={() => setMainTab('individual')}
            className={cn(
              'flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2',
              mainTab === 'individual'
                ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-500/20'
                : 'text-slate-400 hover:text-white'
            )}
          >
            <User className="w-4 h-4" />
            Individual Leaderboard
          </button>
          <button
            onClick={() => setMainTab('doubles')}
            className={cn(
              'flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2',
              mainTab === 'doubles'
                ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-500/20'
                : 'text-slate-400 hover:text-white'
            )}
          >
            <Users className="w-4 h-4" />
            Doubles Partnerships
          </button>
        </div>

        {/* INDIVIDUAL RANKINGS VIEW */}
        {mainTab === 'individual' && (
          <div>
            <RankingsTabs value={period} onChange={setPeriod} />

            <MatchTypeFilter value={matchType} onChange={setMatchType} />

            <RankingsSpotlight spotlight={spotlight} loading={playersLoading} />

            <RankingsList players={rankedPlayers} loading={playersLoading} matchType={matchType} />
          </div>
        )}

        {/* DOUBLES PARTNERSHIPS LEADERBOARD */}
        {mainTab === 'doubles' && (
          <div>
            <DuoSpotlight
              bestDuo={bestPartnership}
              mostWinsDuo={mostWinsPartnership}
              mostPlayedDuo={mostPlayedPartnership}
              longestStreakDuo={longestStreakPartnership}
              loading={partnershipsLoading}
            />

            <DuoRankingsList
              partnerships={partnerships}
              loading={partnershipsLoading}
            />
          </div>
        )}
      </div>
    </div>
  );
}
