import { Card } from '@/components/ui/card';
import { Trophy } from 'lucide-react';

export function EmptyRankings() {
  return (
    <Card className="border-white/10 bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-sm">
      <div className="p-12 text-center">
        <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-yellow-500/20 to-orange-500/20 flex items-center justify-center">
          <Trophy className="w-12 h-12 text-yellow-400" />
        </div>
        
        <h3 className="text-2xl font-bold text-white mb-3">
          No Rankings Yet
        </h3>
        <p className="text-gray-400 max-w-md mx-auto">
          Play some matches to see the leaderboard! Rankings are based on wins, win rate, and current streak.
        </p>
      </div>
    </Card>
  );
}
