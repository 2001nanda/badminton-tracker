import { Card } from '@/components/ui/card';
import { Trophy, Swords, PlusCircle } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface EmptyRankingsProps {
  matchType?: 'all' | 'singles' | 'doubles';
}

export function EmptyRankings({ matchType = 'all' }: EmptyRankingsProps) {
  const isSingles = matchType === 'singles';
  const isDoubles = matchType === 'doubles';

  return (
    <Card className="glass-card rounded-3xl border-white/10 p-8 sm:p-12 text-center max-w-xl mx-auto">
      <div className="w-20 h-20 mx-auto mb-5 rounded-2xl bg-gradient-to-br from-yellow-500/20 via-emerald-500/20 to-emerald-500/10 border border-white/10 flex items-center justify-center shadow-lg">
        {isSingles ? (
          <Swords className="w-10 h-10 text-emerald-400" />
        ) : (
          <Trophy className="w-10 h-10 text-yellow-400" />
        )}
      </div>

      <h3 className="text-xl sm:text-2xl font-black text-white mb-2">
        {isSingles
          ? 'No Singles Records Available'
          : isDoubles
          ? 'No Doubles Records Available'
          : 'No Rankings Yet'}
      </h3>

      <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto mb-6 leading-relaxed">
        {isSingles
          ? 'No active singles matches are currently stored in your records. Record a 1-on-1 match to establish the Singles leaderboard!'
          : 'Play matches to build the leaderboard! Rankings are based on wins, win rate, and performance streaks.'}
      </p>

      <div className="flex justify-center">
        <Link href="/add-match">
          <Button className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 font-bold rounded-xl px-5 text-white shadow-lg shadow-emerald-500/20 flex items-center gap-2">
            <PlusCircle className="w-4 h-4" />
            {isSingles ? 'Record a Singles Match 🏸' : 'Add a Match 🏸'}
          </Button>
        </Link>
      </div>
    </Card>
  );
}
