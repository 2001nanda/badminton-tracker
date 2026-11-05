'use client';

import { memo, useState, useMemo } from 'react';
import { PlayerPartnerRecord } from '@/lib/types';
import { Users, ArrowUpDown } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface PlayerPartnershipsProps {
  partnerRecords: PlayerPartnerRecord[];
}

type SortField = 'matches' | 'wins' | 'winPercentage';

export const PlayerPartnerships = memo(function PlayerPartnerships({ partnerRecords }: PlayerPartnershipsProps) {
  const [sortField, setSortField] = useState<SortField>('winPercentage');
  const [sortAsc, setSortAsc] = useState(false);

  const sortedRecords = useMemo(() => {
    return [...partnerRecords].sort((a, b) => {
      let diff = 0;
      if (sortField === 'winPercentage') {
        diff = b.winPercentage - a.winPercentage;
      } else if (sortField === 'wins') {
        diff = b.wins - a.wins;
      } else {
        diff = b.matches - a.matches;
      }
      return sortAsc ? -diff : diff;
    });
  }, [partnerRecords, sortField, sortAsc]);

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  if (partnerRecords.length === 0) {
    return null;
  }

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Users className="w-5 h-5 text-emerald-400" />
          Partnership Performance
        </h2>
        <span className="text-xs text-slate-400">
          {partnerRecords.length} {partnerRecords.length === 1 ? 'partner' : 'partners'}
        </span>
      </div>

      <Card className="border-white/10 bg-white/5 backdrop-blur-sm overflow-hidden rounded-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-white/5 border-b border-white/10 text-xs font-semibold text-slate-400 uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Partner</th>
                <th
                  onClick={() => toggleSort('matches')}
                  className="py-3 px-4 cursor-pointer hover:text-white transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>Played</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  onClick={() => toggleSort('wins')}
                  className="py-3 px-4 cursor-pointer hover:text-white transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>Won</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3 px-4">Lost</th>
                <th
                  onClick={() => toggleSort('winPercentage')}
                  className="py-3 px-4 cursor-pointer hover:text-white transition-colors text-right"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Win %</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {sortedRecords.map((record) => (
                <tr key={record.partnerId} className="hover:bg-white/5 transition-colors">
                  <td className="py-3.5 px-4 font-medium text-white">
                    <Link
                      href={`/players/${record.partnerId}`}
                      className="hover:text-emerald-400 transition-colors flex items-center gap-2"
                    >
                      <span>{record.partnerName}</span>
                    </Link>
                  </td>
                  <td className="py-3.5 px-4 text-slate-300 font-semibold">{record.matches}</td>
                  <td className="py-3.5 px-4 text-emerald-400 font-semibold">{record.wins}</td>
                  <td className="py-3.5 px-4 text-red-400 font-semibold">{record.losses}</td>
                  <td className="py-3.5 px-4 text-right">
                    <span
                      className={cn(
                        'inline-block px-2.5 py-1 rounded-full text-xs font-bold',
                        record.winPercentage >= 60
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : record.winPercentage >= 40
                          ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                          : 'bg-red-500/20 text-red-400 border border-red-500/30'
                      )}
                    >
                      {record.winPercentage}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
});

