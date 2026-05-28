'use client';

import { memo } from 'react';
import { History } from 'lucide-react';

interface HistoryHeaderProps {
  totalMatches: number;
}

export const HistoryHeader = memo(function HistoryHeader({
  totalMatches,
}: HistoryHeaderProps) {
  return (
    <div className="border-b border-white/10 bg-gradient-to-br from-black via-purple-950/20 to-black">
      <div className="container mx-auto px-4 py-6 max-w-5xl">
        <div className="flex items-center space-x-4">
          <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500/20 to-purple-600/20">
            <History className="w-6 h-6 text-purple-400" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Match History
            </h1>
            <p className="text-sm text-gray-400 mt-1">
              {totalMatches} {totalMatches === 1 ? 'match' : 'matches'} recorded
            </p>
          </div>
        </div>
      </div>
    </div>
  );
});
