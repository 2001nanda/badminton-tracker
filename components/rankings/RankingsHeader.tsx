'use client';

import { memo } from 'react';
import { Trophy } from 'lucide-react';

export const RankingsHeader = memo(function RankingsHeader() {
  return (
    <div className="border-b border-white/10 bg-gradient-to-br from-black via-yellow-950/20 to-black">
      <div className="container mx-auto px-4 py-6 max-w-5xl">
        <div className="flex items-center space-x-4">
          <div className="p-3 rounded-xl bg-gradient-to-br from-yellow-500/20 to-yellow-600/20">
            <Trophy className="w-6 h-6 text-yellow-400" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-yellow-400 to-emerald-400 bg-clip-text text-transparent">
              Rankings
            </h1>
            <p className="text-sm text-gray-400 mt-1">
              Leaderboard based on performance
            </p>
          </div>
        </div>
      </div>
    </div>
  );
});
