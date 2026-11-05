'use client';

import { memo } from 'react';
import { PartnershipStats } from '@/lib/types';
import { DuoRankingCard } from './DuoRankingCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Users, Info } from 'lucide-react';

interface DuoRankingsListProps {
  partnerships: PartnershipStats[];
  loading: boolean;
}

export const DuoRankingsList = memo(function DuoRankingsList({
  partnerships,
  loading,
}: DuoRankingsListProps) {
  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(6)].map((_, i) => (
          <Skeleton key={i} className="h-20 bg-white/5 rounded-2xl" />
        ))}
      </div>
    );
  }

  if (partnerships.length === 0) {
    return (
      <div className="glass-card rounded-2xl p-12 text-center border border-white/10">
        <Users className="w-12 h-12 text-slate-600 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-white mb-1">No Doubles Partnerships Recorded</h3>
        <p className="text-sm text-slate-400">
          Play and record doubles matches to see partnerships ranked on this leaderboard.
        </p>
      </div>
    );
  }

  const qualified = partnerships.filter((p) => p.isQualified);
  const unqualified = partnerships.filter((p) => !p.isQualified);

  return (
    <div className="space-y-6">
      {/* Qualified Leaderboard */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs text-slate-400 px-1">
          <span className="font-bold uppercase tracking-wider text-emerald-400">
            Qualified Partnerships (5+ Matches)
          </span>
          <span>{qualified.length} duos</span>
        </div>

        {qualified.length === 0 ? (
          <div className="p-6 bg-white/5 border border-white/10 rounded-2xl text-center text-xs text-slate-400 flex items-center justify-center gap-2">
            <Info className="w-4 h-4 text-yellow-400" />
            <span>No partnerships have reached the 5-match qualification threshold yet.</span>
          </div>
        ) : (
          qualified.map((partnership, idx) => (
            <DuoRankingCard
              key={partnership.id}
              partnership={partnership}
              rank={idx + 1}
            />
          ))
        )}
      </div>

      {/* Unqualified Partnerships */}
      {unqualified.length > 0 && (
        <div className="space-y-3 pt-4 border-t border-white/10">
          <div className="flex items-center justify-between text-xs text-slate-500 px-1">
            <span className="font-bold uppercase tracking-wider">
              Emerging / Casual Partnerships (&lt; 5 Matches)
            </span>
            <span>{unqualified.length} duos</span>
          </div>

          {unqualified.map((partnership, idx) => (
            <DuoRankingCard
              key={partnership.id}
              partnership={partnership}
              rank={qualified.length + idx + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
});

