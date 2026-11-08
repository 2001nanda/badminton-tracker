'use client';

import { memo } from 'react';
import { User, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MatchTypeSelectorProps {
  value: 'singles' | 'doubles';
  onChange: (value: 'singles' | 'doubles') => void;
}

export const MatchTypeSelector = memo(function MatchTypeSelector({
  value,
  onChange,
}: MatchTypeSelectorProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <button
        type="button"
        onClick={() => onChange('singles')}
        className={cn(
          'p-3.5 sm:p-5 rounded-xl border-2 transition-all',
          value === 'singles'
            ? 'border-emerald-500 bg-emerald-500/10'
            : 'border-white/10 hover:border-white/20 hover:bg-white/5'
        )}
      >
        <div className="flex flex-col items-center gap-1.5 sm:gap-2">
          <div className={cn(
            'p-2.5 sm:p-3 rounded-lg',
            value === 'singles' ? 'bg-emerald-500/20' : 'bg-white/5'
          )}>
            <User className={cn(
              'w-5 h-5 sm:w-6 sm:h-6',
              value === 'singles' ? 'text-emerald-400' : 'text-slate-400'
            )} />
          </div>
          <span className={cn(
            'font-semibold text-sm sm:text-base',
            value === 'singles' ? 'text-white' : 'text-slate-400'
          )}>
            Singles
          </span>
          <span className="text-[11px] sm:text-xs text-slate-500">1 vs 1</span>
        </div>
      </button>

      <button
        type="button"
        onClick={() => onChange('doubles')}
        className={cn(
          'p-3.5 sm:p-5 rounded-xl border-2 transition-all',
          value === 'doubles'
            ? 'border-emerald-500 bg-emerald-500/10'
            : 'border-white/10 hover:border-white/20 hover:bg-white/5'
        )}
      >
        <div className="flex flex-col items-center gap-1.5 sm:gap-2">
          <div className={cn(
            'p-2.5 sm:p-3 rounded-lg',
            value === 'doubles' ? 'bg-emerald-500/20' : 'bg-white/5'
          )}>
            <Users className={cn(
              'w-5 h-5 sm:w-6 sm:h-6',
              value === 'doubles' ? 'text-emerald-400' : 'text-slate-400'
            )} />
          </div>
          <span className={cn(
            'font-semibold text-sm sm:text-base',
            value === 'doubles' ? 'text-white' : 'text-slate-400'
          )}>
            Doubles
          </span>
          <span className="text-[11px] sm:text-xs text-slate-500">2 vs 2</span>
        </div>
      </button>
    </div>
  );
});
