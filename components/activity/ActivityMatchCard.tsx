'use client';

import { memo, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Match, Player } from '@/lib/types';
import { format } from 'date-fns';
import { Trophy, User, Users, Flame, Trash2 } from 'lucide-react';
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
        toast.error('Failed to delete match', {
          description: 'Please try again',
        });
      }
    } catch (error) {
      console.error('Error deleting match:', error);
      toast.error('An error occurred', {
        description: 'Please check your connection and try again',
      });
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

  const isWinner = (playerId: string) => match.winner.includes(playerId);

  const teamAPlayers = match.type === 'singles' 
    ? [match.players[0]] 
    : [match.players[0], match.players[1]];
  
  const teamBPlayers = match.type === 'singles'
    ? [match.players[1]]
    : [match.players[2], match.players[3]];

  const teamAWon = isWinner(teamAPlayers[0]);
  const winnerNames = match.winner.map(id => getPlayerName(id)).join(' + ');
  const loserNames = match.players
    .filter(id => !match.winner.includes(id))
    .map(id => getPlayerName(id))
    .join(' + ');

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
          "border-white/10 bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-sm hover:from-white/10 hover:to-white/15 transition-all relative",
          selectionMode && "cursor-pointer",
          isSelected && "ring-2 ring-emerald-500"
        )}
        onClick={selectionMode ? handleToggle : undefined}
      >
      <div className="p-5">
        {/* Selection Checkbox */}
        {selectionMode && (
          <div className="absolute top-4 left-4 z-10">
            <div 
              className={cn(
                "w-6 h-6 rounded border-2 flex items-center justify-center transition-all",
                isSelected 
                  ? "bg-emerald-500 border-emerald-500" 
                  : "bg-white/10 border-white/30"
              )}
            >
              {isSelected && (
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
          </div>
        )}

        {/* Delete Button (only when NOT in selection mode AND delete is enabled) */}
        {!selectionMode && isDeleteEnabled && (
          <div className="absolute top-4 right-4 z-10">
            <Button
              onClick={handleDeleteClick}
              disabled={deleting}
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 hover:bg-red-500/20 hover:text-red-400 text-gray-500"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        )}

        {/* Header */}
        <div className={cn(
          "flex items-start justify-between mb-4",
          selectionMode && "ml-8"
        )}>
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-emerald-500/20">
              {match.type === 'singles' ? (
                <User className="w-4 h-4 text-emerald-400" />
              ) : (
                <Users className="w-4 h-4 text-emerald-400" />
              )}
            </div>
            <div>
              <p className="text-sm font-semibold text-emerald-400 capitalize">
                {match.type}
              </p>
              <p className="text-xs text-gray-500">
                {format(match.createdAt, 'h:mm a')}
              </p>
            </div>
          </div>
          
          {!selectionMode && <Trophy className="w-5 h-5 text-yellow-400 mr-10" />}
        </div>

        {/* Match Summary */}
        <div className="mb-4">
          <div className="flex items-center space-x-2 mb-2">
            <Flame className="w-4 h-4 text-yellow-400" />
            <p className="text-white font-semibold">
              {winnerNames}
            </p>
            <span className="text-gray-400">defeated</span>
            <p className="text-gray-300">
              {loserNames}
            </p>
          </div>
        </div>

        {/* Score */}
        <div className="flex items-center space-x-4">
          <div className={cn(
            'flex-1 p-3 rounded-lg text-center',
            teamAWon ? 'bg-emerald-500/20 border border-emerald-500/30' : 'bg-white/5'
          )}>
            <p className={cn(
              'text-2xl font-bold',
              teamAWon ? 'text-emerald-400' : 'text-gray-500'
            )}>
              {match.score.set1.teamA}
            </p>
            <p className={cn(
              'text-xs',
              teamAWon ? 'text-emerald-400' : 'text-gray-600'
            )}>
              {match.score.set2.teamA}
              {match.score.set3 && ` • ${match.score.set3.teamA}`}
            </p>
          </div>

          <span className="text-gray-600 font-bold">-</span>

          <div className={cn(
            'flex-1 p-3 rounded-lg text-center',
            !teamAWon ? 'bg-emerald-500/20 border border-emerald-500/30' : 'bg-white/5'
          )}>
            <p className={cn(
              'text-2xl font-bold',
              !teamAWon ? 'text-emerald-400' : 'text-gray-500'
            )}>
              {match.score.set1.teamB}
            </p>
            <p className={cn(
              'text-xs',
              !teamAWon ? 'text-emerald-400' : 'text-gray-600'
            )}>
              {match.score.set2.teamB}
              {match.score.set3 && ` • ${match.score.set3.teamB}`}
            </p>
          </div>
        </div>
      </div>
    </Card>
    </>
  );
});
