'use client';

import { memo } from 'react';
import { PlayerRivalRecord } from '@/lib/types';
import { Swords } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface PlayerRivalriesProps {
  rivalRecords: PlayerRivalRecord[];
}

export const PlayerRivalries = memo(function PlayerRivalries({ rivalRecords }: PlayerRivalriesProps) {
  if (rivalRecords.length === 0) return null;

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Swords className="w-5 h-5 text-orange-400" />
          Rivalry & Opponent Records
        </h2>
        <span className="text-xs text-slate-400">Top Opponents Faced</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {rivalRecords.slice(0, 6).map((record) => (
          <Card key={`${record.opponentId}_${record.type}`} className="border-white/10 bg-white/5 p-4 rounded-xl">
            <div className="flex items-center justify-between mb-2">
              <Link
                href={`/players/${record.opponentId}`}
                className="font-bold text-sm text-white hover:text-emerald-400 transition-colors truncate"
              >
                vs {record.opponentName}
              </Link>
              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-white/10 text-slate-400">
                {record.type}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span>{record.matches} matches</span>
              <span className={cn('font-bold', record.winPercentage >= 50 ? 'text-emerald-400' : 'text-red-400')}>
                {record.wins}W - {record.losses}L ({record.winPercentage}%)
              </span>
            </div>

            <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
              <div
                className={cn('h-full rounded-full', record.winPercentage >= 50 ? 'bg-emerald-500' : 'bg-red-500')}
                style={{ width: `${Math.min(100, Math.max(0, record.winPercentage))}%` }}
              />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
});

