'use client';

import { PlusCircle } from 'lucide-react';
import Link from 'next/link';

export function EmptyBattles() {
  return (
    <div className="glass-card rounded-2xl p-12 text-center">
      {/* Icon */}
      <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-emerald-400 to-yellow-400 flex items-center justify-center shadow-lg shadow-emerald-500/20">
        <span className="text-4xl">🏸</span>
      </div>

      {/* Content */}
      <h3 className="text-xl font-bold text-white mb-2">
        No matches yet
      </h3>
      <p className="text-slate-400 mb-6 max-w-sm mx-auto text-sm">
        Add your first badminton match to start tracking rankings and streaks
      </p>

      {/* Action Button */}
      <Link
        href="/add-match"
        className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-semibold rounded-xl shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 transition-all hover:scale-105 active:scale-95"
      >
        <PlusCircle className="w-5 h-5" />
        <span>Add Match</span>
      </Link>
    </div>
  );
}
