import { Card } from '@/components/ui/card';
import { Player } from '@/lib/types';
import { TrendingUp, TrendingDown, Flame } from 'lucide-react';
import { memo } from 'react';

interface PlayerCardProps {
  player: Player;
  rank?: number;
}

export const PlayerCard = memo(function PlayerCard({ player, rank }: PlayerCardProps) {
  const winRate = player.wins + player.losses > 0
    ? ((player.wins / (player.wins + player.losses)) * 100).toFixed(1)
    : '0.0';

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Card className="border-white/10 bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-sm hover:from-white/10 hover:to-white/15 transition-all">
      <div className="p-5">
        <div className="flex items-center space-x-4">
          {rank && (
            <div className="flex-shrink-0">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${
                rank === 1 ? 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-black' :
                rank === 2 ? 'bg-gradient-to-br from-gray-300 to-gray-500 text-black' :
                rank === 3 ? 'bg-gradient-to-br from-orange-400 to-orange-600 text-black' :
                'bg-white/10 text-gray-400'
              }`}>
                {rank}
              </div>
            </div>
          )}
          
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-xl">{getInitials(player.name)}</span>
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-white truncate">{player.name}</h3>
            <div className="flex items-center space-x-3 mt-1">
              <span className="text-sm text-gray-400">
                {player.wins}W - {player.losses}L
              </span>
              <span className="text-sm font-semibold text-emerald-400">
                {winRate}%
              </span>
            </div>
          </div>

          {player.streak !== 0 && (
            <div className={`flex items-center space-x-1 px-3 py-1.5 rounded-full ${
              player.streak > 0 ? 'bg-emerald-500/20' : 'bg-red-500/20'
            }`}>
              {player.streak > 0 ? (
                <>
                  <Flame className="w-4 h-4 text-yellow-400" />
                  <span className="text-sm font-bold text-emerald-400">
                    {Math.abs(player.streak)}
                  </span>
                </>
              ) : (
                <>
                  <TrendingDown className="w-4 h-4 text-red-400" />
                  <span className="text-sm font-bold text-red-400">
                    {Math.abs(player.streak)}
                  </span>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
});
