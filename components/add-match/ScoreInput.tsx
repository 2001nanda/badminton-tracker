'use client';

import { memo } from 'react';
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
      <div className="grid grid-cols-2 gap-2.5 sm:gap-4">
        {/* Team A Score Card */}
        <div
          className={cn(
            'relative rounded-2xl border-2 transition-all p-2.5 sm:p-4 pt-7 sm:pt-8 flex flex-col justify-between',
            teamAWon
              ? 'border-emerald-500 bg-emerald-500/10 shadow-lg shadow-emerald-500/10'
              : 'border-white/10 bg-white/5'
          )}
        >
          {/* Team A Label with Status */}
          <div className="absolute -top-3 left-2.5 sm:left-4 px-2 py-0.5 rounded-md bg-[#0B0F14] border border-white/10 flex items-center gap-1.5 shadow-sm">
            <div className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="text-[11px] sm:text-xs font-bold text-white">Team A</span>
            {teamAWon && <Trophy className="w-3 h-3 text-yellow-400 ml-0.5" />}
          </div>

          {/* Team A Player Names */}
          {teamAPlayers.length > 0 && (
            <div className="text-[11px] sm:text-xs font-semibold text-emerald-400/90 mb-3 min-h-[1.75rem] flex items-center line-clamp-2 break-words leading-tight">
              {teamAPlayers.join(' + ')}
            </div>
          )}

          {/* Stepper Controls and Center Score */}
          <div className="flex items-center justify-between gap-1 sm:gap-2">
            {/* Minus Button */}
            <button
              type="button"
              onClick={() => handleDecrement(teamAScore, onTeamAChange)}
              disabled={teamAScore === 0}
              className={cn(
                'w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center transition-all shrink-0',
                'bg-white/10 hover:bg-white/20 active:scale-95 text-white',
                'disabled:opacity-20 disabled:cursor-not-allowed'
              )}
            >
              <Minus className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            {/* Score Display (Clean numeric text input that never truncates or cuts off) */}
            <div className="flex-1 min-w-0 flex items-center justify-center">
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={teamAScore}
                onChange={(e) => {
                  const val = parseInt(e.target.value.replace(/[^0-9]/g, '')) || 0;
                  onTeamAChange(Math.min(30, Math.max(0, val)));
                }}
                className={cn(
                  'w-full text-center text-3xl sm:text-5xl font-black bg-transparent border-0 p-0 focus:outline-none focus:ring-0 select-all cursor-pointer',
                  teamAWon ? 'text-emerald-400' : 'text-white'
                )}
                aria-label="Team A Score"
              />
            </div>

            {/* Plus Button */}
            <button
              type="button"
              onClick={() => handleIncrement(teamAScore, onTeamAChange)}
              disabled={teamAScore >= 30}
              className={cn(
                'w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center transition-all shrink-0',
                'bg-emerald-500/20 hover:bg-emerald-500/30 active:scale-95 text-emerald-400',
                'disabled:opacity-20 disabled:cursor-not-allowed'
              )}
            >
              <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>

          {/* Quick 21 button */}
          <div className="mt-3 flex justify-center">
            <button
              type="button"
              onClick={() => onTeamAChange(21)}
              className="text-[10px] sm:text-[11px] font-bold px-2.5 sm:px-3 py-1 rounded-lg bg-white/5 hover:bg-emerald-500/20 hover:text-emerald-300 text-slate-400 transition-colors"
            >
              Set to 21
            </button>
          </div>
        </div>

        {/* Team B Score Card */}
        <div
          className={cn(
            'relative rounded-2xl border-2 transition-all p-2.5 sm:p-4 pt-7 sm:pt-8 flex flex-col justify-between',
            teamBWon
              ? 'border-emerald-500 bg-emerald-500/10 shadow-lg shadow-emerald-500/10'
              : 'border-white/10 bg-white/5'
          )}
        >
          {/* Team B Label with Status */}
          <div className="absolute -top-3 left-2.5 sm:left-4 px-2 py-0.5 rounded-md bg-[#0B0F14] border border-white/10 flex items-center gap-1.5 shadow-sm">
            <div className="w-2 h-2 rounded-full bg-blue-400" />
            <span className="text-[11px] sm:text-xs font-bold text-white">Team B</span>
            {teamBWon && <Trophy className="w-3 h-3 text-yellow-400 ml-0.5" />}
          </div>

          {/* Team B Player Names */}
          {teamBPlayers.length > 0 && (
            <div className="text-[11px] sm:text-xs font-semibold text-blue-400/90 mb-3 min-h-[1.75rem] flex items-center line-clamp-2 break-words leading-tight">
              {teamBPlayers.join(' + ')}
            </div>
          )}

          {/* Stepper Controls and Center Score */}
          <div className="flex items-center justify-between gap-1 sm:gap-2">
            {/* Minus Button */}
            <button
              type="button"
              onClick={() => handleDecrement(teamBScore, onTeamBChange)}
              disabled={teamBScore === 0}
              className={cn(
                'w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center transition-all shrink-0',
                'bg-white/10 hover:bg-white/20 active:scale-95 text-white',
                'disabled:opacity-20 disabled:cursor-not-allowed'
              )}
            >
              <Minus className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            {/* Score Display (Clean numeric text input that never truncates or cuts off) */}
            <div className="flex-1 min-w-0 flex items-center justify-center">
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={teamBScore}
                onChange={(e) => {
                  const val = parseInt(e.target.value.replace(/[^0-9]/g, '')) || 0;
                  onTeamBChange(Math.min(30, Math.max(0, val)));
                }}
                className={cn(
                  'w-full text-center text-3xl sm:text-5xl font-black bg-transparent border-0 p-0 focus:outline-none focus:ring-0 select-all cursor-pointer',
                  teamBWon ? 'text-emerald-400' : 'text-white'
                )}
                aria-label="Team B Score"
              />
            </div>

            {/* Plus Button */}
            <button
              type="button"
              onClick={() => handleIncrement(teamBScore, onTeamBChange)}
              disabled={teamBScore >= 30}
              className={cn(
                'w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center transition-all shrink-0',
                'bg-blue-500/20 hover:bg-blue-500/30 active:scale-95 text-blue-400',
                'disabled:opacity-20 disabled:cursor-not-allowed'
              )}
            >
              <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>

          {/* Quick 21 button */}
          <div className="mt-3 flex justify-center">
            <button
              type="button"
              onClick={() => onTeamBChange(21)}
              className="text-[10px] sm:text-[11px] font-bold px-2.5 sm:px-3 py-1 rounded-lg bg-white/5 hover:bg-blue-500/20 hover:text-blue-300 text-slate-400 transition-colors"
            >
              Set to 21
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});
