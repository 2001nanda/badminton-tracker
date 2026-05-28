'use client';

import { memo } from 'react';
import { Match, Player } from '@/lib/types';
import { format, formatDistanceToNow } from 'date-fns';
import { Trophy, Users, User } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BattleCardProps {
  match: Match;
  players: Player[];
}

export const BattleCard = memo(function BattleCard({ match, players }: BattleCardProps) {
  const getPlayerName = (id: string) => {
    return players.find((p) => p.id === id)?.name || 'Unknown';
  };

  const isWinner = (playerId: string) => match.winner.includes(playerId);

  const teamAPlayers = match.type === 'singles' 
    ? [match.players[0]] 
    : [match.players[0], match.players[1]];
  
  const teamBPlayers = match.type === 'singles'
    ? [match.players[1]]
    : [match.players[2], match.players[3]];

  const teamAWon = isWinner(teamAPlayers[0]);

  return (
    <div className="glass-card glass-card-hover rounded-2xl overflow-hidden animate-fade-in">
      {/* Match Header */}
      <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-emerald-500/20">
            {match.type === 'singles' ? (
              <User className="w-4 h-4 text-emerald-400" />
            ) : (
              <Users className="w-4 h-4 text-emerald-400" />
            )}
          </div>
          <span className="text-sm font-semibold text-emerald-400 capitalize">
            {match.type}
          </span>
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-400">
            {formatDistanceToNow(match.createdAt, { addSuffix: true })}
          </p>
        </div>
      </div>

      {/* Match Content */}
      <div className="p-4 space-y-3">
        {/* Team A */}
        <div className={cn(
          'p-3 rounded-xl flex items-center justify-between',
          teamAWon 
            ? 'bg-emerald-500/10 border border-emerald-500/30' 
            : 'bg-white/5'
        )}>
          <div className="flex items-center gap-2 flex-1 min-w-0">
            {teamAWon && <Trophy className="w-4 h-4 text-yellow-400 flex-shrink-0" />}
            <span className={cn(
              'font-semibold text-sm truncate',
              teamAWon ? 'text-white' : 'text-slate-300'
            )}>
              {teamAPlayers.map(getPlayerName).join(' + ')}
            </span>
          </div>
          <div className="flex items-baseline gap-1 flex-shrink-0 ml-2">
            <span className={cn(
              'text-2xl font-bold',
              teamAWon ? 'text-emerald-400' : 'text-slate-500'
            )}>
              {match.score.set1.teamA}
            </span>
            <span className={cn(
              'text-xs',
              teamAWon ? 'text-emerald-400/70' : 'text-slate-600'
            )}>
              {match.score.set2.teamA}
              {match.score.set3 && ` ${match.score.set3.teamA}`}
            </span>
          </div>
        </div>

        {/* VS Divider */}
        <div className="flex items-center justify-center">
          <span className="text-xs font-bold text-slate-600 px-3 py-1 rounded-full bg-white/5">
            VS
          </span>
        </div>

        {/* Team B */}
        <div className={cn(
          'p-3 rounded-xl flex items-center justify-between',
          !teamAWon 
            ? 'bg-emerald-500/10 border border-emerald-500/30' 
            : 'bg-white/5'
        )}>
          <div className="flex items-center gap-2 flex-1 min-w-0">
            {!teamAWon && <Trophy className="w-4 h-4 text-yellow-400 flex-shrink-0" />}
            <span className={cn(
              'font-semibold text-sm truncate',
              !teamAWon ? 'text-white' : 'text-slate-300'
            )}>
              {teamBPlayers.map(getPlayerName).join(' + ')}
            </span>
          </div>
          <div className="flex items-baseline gap-1 flex-shrink-0 ml-2">
            <span className={cn(
              'text-2xl font-bold',
              !teamAWon ? 'text-emerald-400' : 'text-slate-500'
            )}>
              {match.score.set1.teamB}
            </span>
            <span className={cn(
              'text-xs',
              !teamAWon ? 'text-emerald-400/70' : 'text-slate-600'
            )}>
              {match.score.set2.teamB}
              {match.score.set3 && ` ${match.score.set3.teamB}`}
            </span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-4 py-2 border-t border-white/10 bg-black/20">
        <p className="text-xs text-slate-500 text-center">
          {format(match.createdAt, 'MMM d, yyyy • h:mm a')}
        </p>
      </div>
    </div>
  );
});
