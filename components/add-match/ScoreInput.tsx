'use client';

import { memo } from 'react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { Plus, Minus, Trophy } from 'lucide-react';

interface ScoreInputProps {
  teamAScore: number;
  teamBScore: number;
  onTeamAChange: (value: number) => void;
  onTeamBChange: (value: number) => void;
  teamAPlayers?: string[];
  teamBPlayers?: string[];
}

export const ScoreInput = memo(function ScoreInput({
  teamAScore,
  teamBScore,
  onTeamAChange,
  onTeamBChange,
  teamAPlayers = [],
  teamBPlayers = [],
}: ScoreInputProps) {
  const teamAWon = (teamAScore >= 21 && teamAScore - teamBScore >= 2) || teamAScore === 30;
  const teamBWon = (teamBScore >= 21 && teamBScore - teamAScore >= 2) || teamBScore === 30;

  const handleIncrement = (currentScore: number, onChange: (value: number) => void) => {
    if (currentScore < 30) {
      onChange(currentScore + 1);
    }
  };

  const handleDecrement = (currentScore: number, onChange: (value: number) => void) => {
    if (currentScore > 0) {
      onChange(currentScore - 1);
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        {/* Team A Score */}
        <div
          className={cn(
            'relative rounded-2xl border-2 transition-all p-3 pt-7',
            teamAWon
              ? 'border-emerald-500 bg-emerald-500/10 shadow-lg shadow-emerald-500/10'
              : 'border-white/10 bg-white/5'
          )}
        >
          {/* Team A Label with Player Names */}
          <div className="absolute -top-3 left-3 px-2 py-0.5 rounded-md bg-[#0B0F14] border border-white/10 flex items-center gap-1.5 shadow-sm">
            <div className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="text-xs font-bold text-white">Team A</span>
            {teamAWon && <Trophy className="w-3 h-3 text-yellow-400 ml-0.5" />}
          </div>

          {teamAPlayers.length > 0 && (
            <div className="text-[11px] font-semibold text-emerald-400/90 mb-3 truncate">
              {teamAPlayers.join(' + ')}
            </div>
          )}

          <div className="flex items-center justify-between gap-1">
            {/* Minus Button */}
            <button
              type="button"
              onClick={() => handleDecrement(teamAScore, onTeamAChange)}
              disabled={teamAScore === 0}
              className={cn(
                'w-10 h-10 rounded-xl flex items-center justify-center transition-all shrink-0',
                'bg-white/5 hover:bg-white/15 active:scale-95 text-white',
                'disabled:opacity-30 disabled:cursor-not-allowed'
              )}
            >
              <Minus className="w-5 h-5" />
            </button>

            {/* Score Input */}
            <Input
              type="number"
              min="0"
              max="30"
              value={teamAScore || ''}
              onChange={(e) => onTeamAChange(Math.min(30, Math.max(0, parseInt(e.target.value) || 0)))}
              className={cn(
                'bg-transparent border-0 text-center text-4xl sm:text-5xl font-black h-14 w-20 focus-visible:ring-0 focus-visible:ring-offset-0 px-0',
                teamAWon ? 'text-emerald-400' : 'text-white'
              )}
              placeholder="0"
            />

            {/* Plus Button */}
            <button
              type="button"
              onClick={() => handleIncrement(teamAScore, onTeamAChange)}
              disabled={teamAScore >= 30}
              className={cn(
                'w-10 h-10 rounded-xl flex items-center justify-center transition-all shrink-0',
                'bg-emerald-500/20 hover:bg-emerald-500/30 active:scale-95 text-emerald-400',
                'disabled:opacity-30 disabled:cursor-not-allowed'
              )}
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>

          {/* Quick 21 button */}
          <div className="mt-3 flex justify-center">
            <button
              type="button"
              onClick={() => onTeamAChange(21)}
              className="text-[11px] font-bold px-3 py-1 rounded-lg bg-white/5 hover:bg-emerald-500/20 hover:text-emerald-300 text-slate-400 transition-colors"
            >
              Set to 21
            </button>
          </div>
        </div>

        {/* Team B Score */}
        <div
          className={cn(
            'relative rounded-2xl border-2 transition-all p-3 pt-7',
            teamBWon
              ? 'border-emerald-500 bg-emerald-500/10 shadow-lg shadow-emerald-500/10'
              : 'border-white/10 bg-white/5'
          )}
        >
          {/* Team B Label with Player Names */}
          <div className="absolute -top-3 left-3 px-2 py-0.5 rounded-md bg-[#0B0F14] border border-white/10 flex items-center gap-1.5 shadow-sm">
            <div className="w-2 h-2 rounded-full bg-blue-400" />
            <span className="text-xs font-bold text-white">Team B</span>
            {teamBWon && <Trophy className="w-3 h-3 text-yellow-400 ml-0.5" />}
          </div>

          {teamBPlayers.length > 0 && (
            <div className="text-[11px] font-semibold text-blue-400/90 mb-3 truncate">
              {teamBPlayers.join(' + ')}
            </div>
          )}

          <div className="flex items-center justify-between gap-1">
            {/* Minus Button */}
            <button
              type="button"
              onClick={() => handleDecrement(teamBScore, onTeamBChange)}
              disabled={teamBScore === 0}
              className={cn(
                'w-10 h-10 rounded-xl flex items-center justify-center transition-all shrink-0',
                'bg-white/5 hover:bg-white/15 active:scale-95 text-white',
                'disabled:opacity-30 disabled:cursor-not-allowed'
              )}
            >
              <Minus className="w-5 h-5" />
            </button>

            {/* Score Input */}
            <Input
              type="number"
              min="0"
              max="30"
              value={teamBScore || ''}
              onChange={(e) => onTeamBChange(Math.min(30, Math.max(0, parseInt(e.target.value) || 0)))}
              className={cn(
                'bg-transparent border-0 text-center text-4xl sm:text-5xl font-black h-14 w-20 focus-visible:ring-0 focus-visible:ring-offset-0 px-0',
                teamBWon ? 'text-emerald-400' : 'text-white'
              )}
              placeholder="0"
            />

            {/* Plus Button */}
            <button
              type="button"
              onClick={() => handleIncrement(teamBScore, onTeamBChange)}
              disabled={teamBScore >= 30}
              className={cn(
                'w-10 h-10 rounded-xl flex items-center justify-center transition-all shrink-0',
                'bg-blue-500/20 hover:bg-blue-500/30 active:scale-95 text-blue-400',
                'disabled:opacity-30 disabled:cursor-not-allowed'
              )}
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>

          {/* Quick 21 button */}
          <div className="mt-3 flex justify-center">
            <button
              type="button"
              onClick={() => onTeamBChange(21)}
              className="text-[11px] font-bold px-3 py-1 rounded-lg bg-white/5 hover:bg-blue-500/20 hover:text-blue-300 text-slate-400 transition-colors"
            >
              Set to 21
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});
