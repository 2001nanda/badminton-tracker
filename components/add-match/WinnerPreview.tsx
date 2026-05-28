'use client';

import { memo } from 'react';
import { Trophy } from 'lucide-react';

interface WinnerPreviewProps {
  winnerNames: string[];
  show: boolean;
}

export const WinnerPreview = memo(function WinnerPreview({
  winnerNames,
  show,
}: WinnerPreviewProps) {
  if (!show || winnerNames.length === 0) return null;

  return (
    <div className="glass-card rounded-2xl p-6 border-2 border-emerald-500/30 bg-emerald-500/5 animate-fade-in">
      <div className="flex items-center justify-center gap-3 mb-3">
        <div className="p-2.5 rounded-xl bg-yellow-500/20">
          <Trophy className="w-6 h-6 text-yellow-400" />
        </div>
        <h3 className="text-lg font-bold text-emerald-400">Predicted Winner</h3>
      </div>
      
      <div className="text-center">
        <p className="text-2xl font-bold text-white mb-1">
          {winnerNames.join(' + ')}
        </p>
        <p className="text-sm text-slate-400">
          {winnerNames.length === 1 ? 'Singles Winner' : 'Doubles Winners'}
        </p>
      </div>
    </div>
  );
});
