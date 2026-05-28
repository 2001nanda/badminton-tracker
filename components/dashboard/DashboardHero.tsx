'use client';

import { format } from 'date-fns';
import { PlusCircle } from 'lucide-react';
import Link from 'next/link';
import { memo } from 'react';

export const DashboardHero = memo(function DashboardHero() {
  const today = new Date();

  return (
    <div className="border-b border-white/10 bg-gradient-to-b from-gray-900/50 to-transparent">
      <div className="container mx-auto px-4 py-6 md:py-8 max-w-7xl">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {/* Left: Title and Date */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-yellow-400 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <span className="text-2xl">🏸</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-white">
                Badminton Tracker
              </h1>
            </div>
            <p className="text-slate-400 text-sm ml-[52px]">
              Track matches, rankings and streaks with friends
            </p>
            <p className="text-slate-500 text-xs ml-[52px]">
              {format(today, 'EEEE, MMMM d, yyyy')}
            </p>
          </div>

          {/* Right: Add Match Button */}
          <Link
            href="/add-match"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-semibold rounded-xl shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 transition-all hover:scale-105 active:scale-95"
          >
            <PlusCircle className="w-5 h-5" />
            <span>Add Match</span>
          </Link>
        </div>
      </div>
    </div>
  );
});
