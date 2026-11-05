import { Card } from '@/components/ui/card';
import { Match, Player } from '@/lib/types';
import { format } from 'date-fns';
import { Trophy, Users } from 'lucide-react';
import { memo } from 'react';

interface MatchCardProps {
  match: Match;
  players: Player[];
}

export const MatchCard = memo(function MatchCard({ match, players }: MatchCardProps) {
  const getPlayerName = (id: string) => {
    return players.find((p) => p.id === id)?.name || 'Unknown';
  };

  const isWinner = (playerId: string) => match.winner.includes(playerId);

  const teamAPlayers =
    match.type === 'singles'
      ? [match.players[0]]
      : [match.players[0], match.players[1]];

  const teamBPlayers =
    match.type === 'singles'
      ? [match.players[1]]
      : [match.players[2], match.players[3]];

  const teamAWon = isWinner(teamAPlayers[0]);
  const hasSet2 = match.score.set2 && (match.score.set2.teamA > 0 || match.score.set2.teamB > 0);

  return (
    <Card className="border-white/10 bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-sm hover:from-white/10 hover:to-white/15 transition-all">
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 rounded-lg bg-emerald-500/20">
              <Users className="w-4 h-4 text-emerald-400" />
            </div>
            <span className="text-sm font-medium text-gray-400 capitalize">
              {match.type}
            </span>
          </div>
          <span className="text-xs text-gray-500">
            {format(match.createdAt, 'MMM d, yyyy')}
          </span>
        </div>

        <div className="space-y-3">
          {/* Team A */}
          <div
            className={`flex items-center justify-between p-3 rounded-lg ${
              teamAWon ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-white/5'
            }`}
          >
            <div className="flex items-center space-x-2">
              {teamAWon && <Trophy className="w-4 h-4 text-yellow-400" />}
              <div>
                {teamAPlayers.map((id) => (
                  <p
                    key={id}
                    className={`text-sm ${
                      teamAWon ? 'text-white font-semibold' : 'text-gray-300'
                    }`}
                  >
                    {getPlayerName(id)}
                  </p>
                ))}
              </div>
            </div>
            <div className="text-right">
              <p
                className={`text-lg font-bold ${
                  teamAWon ? 'text-emerald-400' : 'text-gray-400'
                }`}
              >
                {match.score.set1.teamA}
              </p>
              {hasSet2 && match.score.set2 && (
                <p
                  className={`text-sm ${
                    teamAWon ? 'text-emerald-400' : 'text-gray-500'
                  }`}
                >
                  {match.score.set2.teamA}
                  {match.score.set3 && ` • ${match.score.set3.teamA}`}
                </p>
              )}
            </div>
          </div>

          {/* Team B */}
          <div
            className={`flex items-center justify-between p-3 rounded-lg ${
              !teamAWon ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-white/5'
            }`}
          >
            <div className="flex items-center space-x-2">
              {!teamAWon && <Trophy className="w-4 h-4 text-yellow-400" />}
              <div>
                {teamBPlayers.map((id) => (
                  <p
                    key={id}
                    className={`text-sm ${
                      !teamAWon ? 'text-white font-semibold' : 'text-gray-300'
                    }`}
                  >
                    {getPlayerName(id)}
                  </p>
                ))}
              </div>
            </div>
            <div className="text-right">
              <p
                className={`text-lg font-bold ${
                  !teamAWon ? 'text-emerald-400' : 'text-gray-400'
                }`}
              >
                {match.score.set1.teamB}
              </p>
              {hasSet2 && match.score.set2 && (
                <p
                  className={`text-sm ${
                    !teamAWon ? 'text-emerald-400' : 'text-gray-500'
                  }`}
                >
                  {match.score.set2.teamB}
                  {match.score.set3 && ` • ${match.score.set3.teamB}`}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
});
