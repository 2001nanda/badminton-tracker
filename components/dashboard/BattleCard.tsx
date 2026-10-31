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

  const isWinner = (playerId: string) => match.winner && match.winner.includes(playerId);

  const teamAPlayers =
    match.type === 'singles' ? [match.players[0]] : [match.players[0], match.players[1]];
  const teamBPlayers =
    match.type === 'singles' ? [match.players[1]] : [match.players[2], match.players[3]];

  const teamAName = teamAPlayers.map(getPlayerName).join(' + ');
  const teamBName = teamBPlayers.map(getPlayerName).join(' + ');

  const teamAWon = teamAPlayers.some(isWinner);

  const s1 = match.score?.set1;
  const s2 = match.score?.set2;
  const s3 = match.score?.set3;

  let setsWonA = 0;
  let setsWonB = 0;
  if (s1 && (s1.teamA > 0 || s1.teamB > 0)) {
    if (s1.teamA > s1.teamB) setsWonA++;
    else if (s1.teamB > s1.teamA) setsWonB++;
  }
  if (s2 && (s2.teamA > 0 || s2.teamB > 0)) {
    if (s2.teamA > s2.teamB) setsWonA++;
    else if (s2.teamB > s2.teamA) setsWonB++;
  }
  if (s3 && (s3.teamA > 0 || s3.teamB > 0)) {
    if (s3.teamA > s3.teamB) setsWonA++;
    else if (s3.teamB > s3.teamA) setsWonB++;
  }

  const isMultiSet = (s2 && (s2.teamA > 0 || s2.teamB > 0)) || (s3 && (s3.teamA > 0 || s3.teamB > 0));
  const matchDate = match.createdAt instanceof Date ? match.createdAt : new Date(match.createdAt);

  return (
    <div className="glass-card glass-card-hover rounded-2xl overflow-hidden animate-fade-in border border-white/10">
      {/* Match Header */}
      <div className="px-4 py-2.5 border-b border-white/10 flex items-center justify-between bg-black/20">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded-md bg-emerald-500/20 text-emerald-400">
            {match.type === 'singles' ? <User className="w-3.5 h-3.5" /> : <Users className="w-3.5 h-3.5" />}
          </div>
          <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
            {match.type}
          </span>
          <span className="text-slate-500 text-xs">•</span>
          <span className="text-xs text-slate-400 font-medium">
            {isMultiSet ? `Sets: ${setsWonA} - ${setsWonB}` : `Game: ${s1?.teamA ?? 0} - ${s1?.teamB ?? 0}`}
          </span>
        </div>
        <div>
          <p className="text-[11px] text-slate-400">
            {formatDistanceToNow(matchDate, { addSuffix: true })}
          </p>
        </div>
      </div>

      {/* Match Content */}
      <div className="p-4 space-y-2">
        {/* Team A */}
        <div
          className={cn(
            'p-2.5 rounded-xl flex items-center justify-between border transition-colors',
            teamAWon ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-white/5 border-transparent'
          )}
        >
          <div className="flex items-center gap-2 flex-1 min-w-0 pr-2">
            {teamAWon && <Trophy className="w-4 h-4 text-yellow-400 shrink-0" />}
            <span className={cn('font-semibold text-sm truncate', teamAWon ? 'text-white' : 'text-slate-300')}>
              {teamAName}
            </span>
          </div>

          <div className="flex items-center gap-3 shrink-0 font-mono text-sm">
            {s1 && (
              <span className={cn('font-bold', s1.teamA > s1.teamB ? 'text-emerald-400' : 'text-slate-400')}>
                {s1.teamA}
              </span>
            )}
            {isMultiSet && s2 && (
              <span className={cn('font-bold', s2.teamA > s2.teamB ? 'text-emerald-400' : 'text-slate-400')}>
                {s2.teamA}
              </span>
            )}
            {isMultiSet && s3 && (s3.teamA > 0 || s3.teamB > 0) && (
              <span className={cn('font-bold', s3.teamA > s3.teamB ? 'text-emerald-400' : 'text-slate-400')}>
                {s3.teamA}
              </span>
            )}
          </div>
        </div>

        {/* Team B */}
        <div
          className={cn(
            'p-2.5 rounded-xl flex items-center justify-between border transition-colors',
            !teamAWon ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-white/5 border-transparent'
          )}
        >
          <div className="flex items-center gap-2 flex-1 min-w-0 pr-2">
            {!teamAWon && <Trophy className="w-4 h-4 text-yellow-400 shrink-0" />}
            <span className={cn('font-semibold text-sm truncate', !teamAWon ? 'text-white' : 'text-slate-300')}>
              {teamBName}
            </span>
          </div>

          <div className="flex items-center gap-3 shrink-0 font-mono text-sm">
            {s1 && (
              <span className={cn('font-bold', s1.teamB > s1.teamA ? 'text-emerald-400' : 'text-slate-400')}>
                {s1.teamB}
              </span>
            )}
            {isMultiSet && s2 && (
              <span className={cn('font-bold', s2.teamB > s2.teamA ? 'text-emerald-400' : 'text-slate-400')}>
                {s2.teamB}
              </span>
            )}
            {isMultiSet && s3 && (s3.teamA > 0 || s3.teamB > 0) && (
              <span className={cn('font-bold', s3.teamB > s3.teamA ? 'text-emerald-400' : 'text-slate-400')}>
                {s3.teamB}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Footer Date */}
      <div className="px-4 py-1.5 border-t border-white/5 bg-black/10 flex items-center justify-between text-[11px] text-slate-500">
        <span>{format(matchDate, 'MMM d, yyyy • h:mm a')}</span>
        <span className="font-mono text-slate-400">
          {s1 ? `${s1.teamA}-${s1.teamB}` : ''}
          {isMultiSet && s2 && (s2.teamA > 0 || s2.teamB > 0) ? `, ${s2.teamA}-${s2.teamB}` : ''}
          {isMultiSet && s3 && (s3.teamA > 0 || s3.teamB > 0) ? `, ${s3.teamA}-${s3.teamB}` : ''}
        </span>
      </div>
    </div>
  );
});
