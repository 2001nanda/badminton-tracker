'use client';

import { memo } from 'react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { Plus, Minus } from 'lucide-react';

interface ScoreInputProps {
  setNumber: number;
  teamAScore: number;
  teamBScore: number;
  onTeamAChange: (value: number) => void;
  onTeamBChange: (value: number) => void;
  optional?: boolean;
  teamAPlayers?: string[];
  teamBPlayers?: string[];
}

export const ScoreInput = memo(function ScoreInput({
  setNumber,
  teamAScore,
  teamBScore,
  onTeamAChange,
  onTeamBChange,
  optional = false,
  teamAPlayers = [],
  teamBPlayers = [],
}: ScoreInputProps) {
  const teamAWon = teamAScore > teamBScore && teamAScore >= 21;
  const teamBWon = teamBScore > teamAScore && teamBScore >= 21;

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
    <div className="glass-card rounded-xl p-5">
      <div className="text-center mb-4">
        <h3 className="text-sm font-semibold text-slate-300">
          Set {setNumber} {optional && <span className="text-slate-500">(Optional)</span>}
        </h3>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        {/* Team A Score */}
        <div className={cn(
          'relative rounded-xl border-2 transition-all',
          teamAWon ? 'border-emerald-500 bg-emerald-500/10' : 'border-white/10 bg-white/5'
        )}>
          {/* Team A Label with Player Names */}
          <div className="absolute -top-2.5 left-3 px-2 bg-[#111827]">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-emerald-400" />
              <span className="text-xs font-medium text-slate-400">Team A</span>
            </div>
            {teamAPlayers.length > 0 && (
              <div className="text-[10px] text-emerald-400 font-medium mt-0.5 leading-tight">
                {teamAPlayers.join(' + ')}
              </div>
            )}
          </div>
          
          <div className="flex items-center justify-between p-2 pt-6">
            {/* Minus Button */}
            <button
              type="button"
              onClick={() => handleDecrement(teamAScore, onTeamAChange)}
              disabled={teamAScore === 0}
              className={cn(
                "w-10 h-10 rounded-lg flex items-center justify-center transition-all",
                "bg-white/5 hover:bg-white/10 active:scale-95",
                "disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-white/5",
                teamAWon ? "text-emerald-400" : "text-white"
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
              onChange={(e) => onTeamAChange(parseInt(e.target.value) || 0)}
              className={cn(
                'bg-transparent border-0 text-center text-4xl font-bold h-14 w-20 focus-visible:ring-0 focus-visible:ring-offset-0 px-0',
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
                "w-10 h-10 rounded-lg flex items-center justify-center transition-all",
                "bg-emerald-500/20 hover:bg-emerald-500/30 active:scale-95",
                "disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-emerald-500/20",
                teamAWon ? "text-emerald-400" : "text-emerald-400"
              )}
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Team B Score */}
        <div className={cn(
          'relative rounded-xl border-2 transition-all',
          teamBWon ? 'border-emerald-500 bg-emerald-500/10' : 'border-white/10 bg-white/5'
        )}>
          {/* Team B Label with Player Names */}
          <div className="absolute -top-2.5 left-3 px-2 bg-[#111827]">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-yellow-400" />
              <span className="text-xs font-medium text-slate-400">Team B</span>
            </div>
            {teamBPlayers.length > 0 && (
              <div className="text-[10px] text-yellow-400 font-medium mt-0.5 leading-tight">
                {teamBPlayers.join(' + ')}
              </div>
            )}
          </div>
          
          <div className="flex items-center justify-between p-2 pt-6">
            {/* Minus Button */}
            <button
              type="button"
              onClick={() => handleDecrement(teamBScore, onTeamBChange)}
              disabled={teamBScore === 0}
              className={cn(
                "w-10 h-10 rounded-lg flex items-center justify-center transition-all",
                "bg-white/5 hover:bg-white/10 active:scale-95",
                "disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-white/5",
                teamBWon ? "text-emerald-400" : "text-white"
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
              onChange={(e) => onTeamBChange(parseInt(e.target.value) || 0)}
              className={cn(
                'bg-transparent border-0 text-center text-4xl font-bold h-14 w-20 focus-visible:ring-0 focus-visible:ring-offset-0 px-0',
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
                "w-10 h-10 rounded-lg flex items-center justify-center transition-all",
                "bg-yellow-500/20 hover:bg-yellow-500/30 active:scale-95",
                "disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-yellow-500/20",
                teamBWon ? "text-emerald-400" : "text-yellow-400"
              )}
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});
