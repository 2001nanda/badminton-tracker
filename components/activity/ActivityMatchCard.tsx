'use client';

import { memo, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Match, Player } from '@/lib/types';
import { format } from 'date-fns';
import { Trophy, User, Users, Trash2, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { useDeleteProtection } from '@/lib/contexts/DeleteProtectionContext';
import { deleteMatch } from '@/lib/actions/matchActions';
import { toast } from 'sonner';

interface ActivityMatchCardProps {
  match: Match;
  players: Player[];
  selectionMode?: boolean;
  isSelected?: boolean;
  onToggleSelection?: (matchId: string) => void;
}

export const ActivityMatchCard = memo(function ActivityMatchCard({
  match,
  players,
  selectionMode = false,
  isSelected = false,
  onToggleSelection,
}: ActivityMatchCardProps) {
  const [deleting, setDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const { isDeleteEnabled } = useDeleteProtection();

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = async () => {
    setDeleting(true);
    try {
      const result = await deleteMatch(match.id);
      if (result.success) {
        toast.success('Match deleted successfully! 🗑️');
        setShowDeleteDialog(false);
      } else {
        toast.error('Failed to delete match. Please try again.');
      }
    } catch (error) {
      console.error('Error deleting match:', error);
      toast.error('An error occurred while deleting match.');
    } finally {
      setDeleting(false);
    }
  };

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onToggleSelection) {
      onToggleSelection(match.id);
    }
  };

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

  // Set-by-set score summary & games won count
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
    <>
      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Match?"
        description="Are you sure you want to delete this match? This action cannot be undone and all match data will be permanently removed."
        confirmText="Delete Match"
        cancelText="Cancel"
        variant="danger"
        loading={deleting}
      />

      <Card
        className={cn(
          'border-white/10 bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-sm hover:from-white/10 hover:to-white/15 transition-all relative overflow-hidden rounded-2xl',
          selectionMode && 'cursor-pointer',
          isSelected && 'ring-2 ring-emerald-500'
        )}
        onClick={selectionMode ? handleToggle : undefined}
      >
        <div className="p-4 sm:p-5">
          {/* Selection Checkbox */}
          {selectionMode && (
            <div className="absolute top-4 left-4 z-10">
              <div
                className={cn(
                  'w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all',
                  isSelected ? 'bg-emerald-500 border-emerald-500 text-white' : 'bg-white/10 border-white/30'
                )}
              >
                {isSelected && <CheckCircle2 className="w-4 h-4 stroke-[3]" />}
              </div>
            </div>
          )}

          {/* Delete Button (only when delete mode enabled) */}
          {!selectionMode && isDeleteEnabled && (
            <div className="absolute top-4 right-4 z-10">
              <Button
                onClick={handleDeleteClick}
                disabled={deleting}
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 hover:bg-red-500/20 hover:text-red-400 text-slate-500 rounded-lg"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          )}

          {/* Card Top Meta */}
          <div className={cn('flex items-center justify-between mb-3', selectionMode && 'ml-8')}>
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
                {match.type === 'singles' ? <User className="w-3.5 h-3.5" /> : <Users className="w-3.5 h-3.5" />}
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                {match.type}
              </span>
              <span className="text-slate-500 text-xs">•</span>
              <span className="text-xs text-slate-400">{format(matchDate, 'h:mm a')}</span>
            </div>

            <div className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-white/10 text-slate-300 mr-8">
              {isMultiSet ? `Sets: ${setsWonA} - ${setsWonB}` : `Game: ${s1?.teamA ?? 0} - ${s1?.teamB ?? 0}`}
            </div>
          </div>

          {/* Team A vs Team B Sports Scoreboard Row */}
          <div className="space-y-2 mb-3">
            {/* Team A */}
            <div
              className={cn(
                'flex items-center justify-between p-2.5 rounded-xl border transition-colors',
                teamAWon
                  ? 'bg-emerald-500/10 border-emerald-500/30'
                  : 'bg-white/5 border-transparent'
              )}
            >
              <div className="flex items-center gap-2 min-w-0 pr-2">
                {teamAWon && <Trophy className="w-4 h-4 text-yellow-400 shrink-0" />}
                <span className={cn('text-sm font-semibold truncate', teamAWon ? 'text-white' : 'text-slate-300')}>
                  {teamAName}
                </span>
              </div>
              <div className="flex items-center gap-2 shrink-0 font-mono text-sm">
                {s1 && <span className={cn('font-bold', s1.teamA > s1.teamB ? 'text-emerald-400' : 'text-slate-400')}>{s1.teamA}</span>}
                {isMultiSet && s2 && <span className={cn('font-bold', s2.teamA > s2.teamB ? 'text-emerald-400' : 'text-slate-400')}>{s2.teamA}</span>}
                {isMultiSet && s3 && (s3.teamA > 0 || s3.teamB > 0) && (
                  <span className={cn('font-bold', s3.teamA > s3.teamB ? 'text-emerald-400' : 'text-slate-400')}>{s3.teamA}</span>
                )}
              </div>
            </div>

            {/* Team B */}
            <div
              className={cn(
                'flex items-center justify-between p-2.5 rounded-xl border transition-colors',
                !teamAWon
                  ? 'bg-emerald-500/10 border-emerald-500/30'
                  : 'bg-white/5 border-transparent'
              )}
            >
              <div className="flex items-center gap-2 min-w-0 pr-2">
                {!teamAWon && <Trophy className="w-4 h-4 text-yellow-400 shrink-0" />}
                <span className={cn('text-sm font-semibold truncate', !teamAWon ? 'text-white' : 'text-slate-300')}>
                  {teamBName}
                </span>
              </div>
              <div className="flex items-center gap-2 shrink-0 font-mono text-sm">
                {s1 && <span className={cn('font-bold', s1.teamB > s1.teamA ? 'text-emerald-400' : 'text-slate-400')}>{s1.teamB}</span>}
                {isMultiSet && s2 && <span className={cn('font-bold', s2.teamB > s2.teamA ? 'text-emerald-400' : 'text-slate-400')}>{s2.teamB}</span>}
                {isMultiSet && s3 && (s3.teamA > 0 || s3.teamB > 0) && (
                  <span className={cn('font-bold', s3.teamB > s3.teamA ? 'text-emerald-400' : 'text-slate-400')}>{s3.teamB}</span>
                )}
              </div>
            </div>
          </div>

          {/* Score Pill Ribbon */}
          <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-white/5 text-[11px] text-slate-400">
            <span className="font-semibold text-slate-500">Score:</span>
            {s1 && (
              <span className="px-2 py-0.5 rounded bg-white/5 font-mono text-slate-300">
                {isMultiSet ? `S1: ${s1.teamA}-${s1.teamB}` : `${s1.teamA}-${s1.teamB}`}
              </span>
            )}
            {isMultiSet && s2 && (
              <span className="px-2 py-0.5 rounded bg-white/5 font-mono text-slate-300">
                S2: {s2.teamA}-${s2.teamB}
              </span>
            )}
            {isMultiSet && s3 && (s3.teamA > 0 || s3.teamB > 0) && (
              <span className="px-2 py-0.5 rounded bg-white/5 font-mono text-slate-300">
                S3: {s3.teamA}-${s3.teamB}
              </span>
            )}
          </div>
        </div>
      </Card>
    </>
  );
});
