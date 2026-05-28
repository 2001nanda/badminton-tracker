'use client';

import { memo } from 'react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface ScoreInputProps {
  setNumber: number;
  teamAScore: number;
  teamBScore: number;
  onTeamAChange: (value: number) => void;
  onTeamBChange: (value: number) => void;
  optional?: boolean;
}

export const ScoreInput = memo(function ScoreInput({
  setNumber,
  teamAScore,
  teamBScore,
  onTeamAChange,
  onTeamBChange,
  optional = false,
}: ScoreInputProps) {
  const teamAWon = teamAScore > teamBScore && teamAScore >= 21;
  const teamBWon = teamBScore > teamAScore && teamBScore >= 21;

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
          <label className="absolute -top-2.5 left-3 px-2 bg-[#111827] text-xs font-medium text-slate-400">
            Team A
          </label>
          <Input
            type="number"
            min="0"
            max="30"
            value={teamAScore || ''}
            onChange={(e) => onTeamAChange(parseInt(e.target.value) || 0)}
            className={cn(
              'bg-transparent border-0 text-center text-3xl font-bold h-20 focus-visible:ring-0 focus-visible:ring-offset-0',
              teamAWon ? 'text-emerald-400' : 'text-white'
            )}
            placeholder="0"
          />
        </div>

        {/* Team B Score */}
        <div className={cn(
          'relative rounded-xl border-2 transition-all',
          teamBWon ? 'border-emerald-500 bg-emerald-500/10' : 'border-white/10 bg-white/5'
        )}>
          <label className="absolute -top-2.5 left-3 px-2 bg-[#111827] text-xs font-medium text-slate-400">
            Team B
          </label>
          <Input
            type="number"
            min="0"
            max="30"
            value={teamBScore || ''}
            onChange={(e) => onTeamBChange(parseInt(e.target.value) || 0)}
            className={cn(
              'bg-transparent border-0 text-center text-3xl font-bold h-20 focus-visible:ring-0 focus-visible:ring-offset-0',
              teamBWon ? 'text-emerald-400' : 'text-white'
            )}
            placeholder="0"
          />
        </div>
      </div>
    </div>
  );
});
