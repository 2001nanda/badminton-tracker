'use client';

import { useState, useMemo, useEffect } from 'react';
import { Check, Users, Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Player } from '@/lib/types';
import { cn } from '@/lib/utils';

interface PlayerSelectionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  players: Player[];
  selectedIds: string[]; // [playerA, playerB] for singles, [playerA, playerC, playerB, playerD] for doubles
  onConfirm: (selectedIds: string[]) => void;
  mode: 'singles' | 'doubles';
}

interface RecentMatchup {
  teamA: string[];
  teamB: string[];
}

export function PlayerSelectionModal({
  open,
  onOpenChange,
  players,
  selectedIds,
  onConfirm,
  mode,
}: PlayerSelectionModalProps) {
  const [tempSelected, setTempSelected] = useState<string[]>([]);
  const [recentMatchups, setRecentMatchups] = useState<RecentMatchup[]>([]);
  const [recentPairs, setRecentPairs] = useState<string[][]>([]);

  const limit = mode === 'singles' ? 2 : 4;

  // Synchronize modal state with props when modal opens
  useEffect(() => {
    if (open) {
      setTempSelected(selectedIds.filter(Boolean));
      
      // Load recent matchups from localStorage based on mode
      try {
        if (mode === 'singles') {
          const storedMatchups = localStorage.getItem('badminton:recent-singles-matchups');
          if (storedMatchups) {
            setRecentMatchups(JSON.parse(storedMatchups).slice(0, 5));
          }
          setRecentPairs([]);
        } else {
          const storedMatchups = localStorage.getItem('badminton:recent-matchups');
          const storedPairs = localStorage.getItem('badminton:recent-pairs');
          if (storedMatchups) {
            setRecentMatchups(JSON.parse(storedMatchups).slice(0, 3));
          }
          if (storedPairs) {
            setRecentPairs(JSON.parse(storedPairs).slice(0, 4));
          }
        }
      } catch (e) {
        console.error('Failed to load recents from localStorage', e);
      }
    }
  }, [open, selectedIds, mode]);

  const playerMap = useMemo(() => new Map(players.map(p => [p.id, p])), [players]);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };


  // Handle individual player selection/toggle
  const handleTogglePlayer = (id: string) => {
    if (tempSelected.includes(id)) {
      // Remove and shift other players
      setTempSelected(prev => prev.filter(selectedId => selectedId !== id));
    } else {
      // Append if limit not reached
      if (tempSelected.length < limit) {
        setTempSelected(prev => [...prev, id]);
      }
    }
  };

  // Quick select a matchup
  const handleSelectRecentMatchup = (matchup: RecentMatchup) => {
    const validIds = [...matchup.teamA, ...matchup.teamB].filter(id => playerMap.has(id));
    if (validIds.length === limit) {
      setTempSelected(validIds);
    }
  };

  // Quick select a 2-player team (pair) - only relevant for doubles
  const handleSelectRecentPair = (pair: string[]) => {
    if (mode === 'singles') return;
    const validIds = pair.filter(id => playerMap.has(id));
    if (validIds.length !== 2) return;

    setTempSelected(prev => {
      if (prev.length === 0 || prev.length === 1) {
        return validIds;
      }
      if (prev.length === 2) {
        if (validIds.some(id => prev.includes(id))) {
          return prev;
        }
        return [...prev, ...validIds];
      }
      return validIds;
    });
  };

  const handleDone = () => {
    if (tempSelected.length === limit) {
      onConfirm(tempSelected);
      onOpenChange(false);
    }
  };

  const handleClear = () => {
    setTempSelected([]);
  };

  // Helper numbers in circles for selection order
  const orderCircles = ['①', '②', '③', '④'];
  const orderLabels = mode === 'singles' 
    ? ['Team A', 'Team B'] 
    : ['Team A - Player 1', 'Team A - Player 2', 'Team B - Player 1', 'Team B - Player 2'];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg bg-[#0F141C] border border-white/10 text-white rounded-2xl p-4 sm:p-6 overflow-hidden flex flex-col max-h-[95vh] sm:max-h-[90vh]">
        <DialogHeader className="mb-3">
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-400" />
            Select Players ({mode === 'singles' ? 'Singles' : 'Doubles'})
          </DialogTitle>
        </DialogHeader>

        {/* Live Selection Tracker */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-3 sm:p-4 mb-3">
          <div className="text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">
            Live Preview
          </div>
          <div className="grid grid-cols-2 gap-3">
            {/* Team A Slot(s) */}
            <div className="space-y-2">
              <div className="text-[11px] font-bold text-emerald-400">Team A</div>
              {(mode === 'singles' ? [0] : [0, 1]).map((index) => {
                const playerId = tempSelected[index];
                const player = playerId ? playerMap.get(playerId) : null;
                const isActive = tempSelected.length === index;

                return (
                  <div
                    key={index}
                    className={cn(
                      "flex items-center gap-2.5 h-11 px-3 rounded-lg border text-sm font-medium transition-all duration-200",
                      player
                        ? "bg-emerald-500/10 border-emerald-500/30 text-white"
                        : isActive
                        ? "bg-white/5 border-emerald-500/40 text-emerald-400 animate-pulse"
                        : "bg-white/2 border-white/5 text-slate-500"
                    )}
                  >
                    <span className="text-xs">{orderCircles[index]}</span>
                    {player ? (
                      <span className="truncate text-xs">{player.name}</span>
                    ) : (
                      <span className="text-[11px] italic font-normal">
                        {isActive ? 'Select player...' : 'Empty'}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Team B Slot(s) */}
            <div className="space-y-2">
              <div className="text-[11px] font-bold text-yellow-400">Team B</div>
              {(mode === 'singles' ? [1] : [2, 3]).map((index) => {
                const playerId = tempSelected[index];
                const player = playerId ? playerMap.get(playerId) : null;
                const isActive = tempSelected.length === index;

                // Adjust display order number circle for singles mode Team B (shows ② for index 1)
                const circleIndex = mode === 'singles' ? 1 : index;

                return (
                  <div
                    key={index}
                    className={cn(
                      "flex items-center gap-2.5 h-11 px-3 rounded-lg border text-sm font-medium transition-all duration-200",
                      player
                        ? "bg-yellow-500/10 border-yellow-500/30 text-white"
                        : isActive
                        ? "bg-white/5 border-yellow-500/40 text-yellow-400 animate-pulse"
                        : "bg-white/2 border-white/5 text-slate-500"
                    )}
                  >
                    <span className="text-xs">{orderCircles[circleIndex]}</span>
                    {player ? (
                      <span className="truncate text-xs">{player.name}</span>
                    ) : (
                      <span className="text-[11px] italic font-normal">
                        {isActive ? 'Select player...' : 'Empty'}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Quick Select Recents */}
        {(recentMatchups.length > 0 || recentPairs.length > 0) && (
          <div className="mb-3 space-y-2">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Recent Matchups {mode === 'doubles' && '& Pairs'}
            </div>
            
            {/* Recent Matchups */}
            {recentMatchups.length > 0 && (
              <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                {recentMatchups.map((m, idx) => {
                  const namesA = m.teamA.map(id => playerMap.get(id)?.name || 'Unknown');
                  const namesB = m.teamB.map(id => playerMap.get(id)?.name || 'Unknown');
                  const label = `${namesA.join(' & ')} vs ${namesB.join(' & ')}`;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSelectRecentMatchup(m)}
                      className="text-xs bg-white/5 hover:bg-emerald-500/15 border border-white/10 hover:border-emerald-500/40 text-slate-300 hover:text-white px-2.5 py-1.5 rounded-full transition-all duration-150 text-left whitespace-nowrap shrink-0"
                    >
                      🏸 {label}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Recent Pairs (only for doubles) */}
            {mode === 'doubles' && recentPairs.length > 0 && (
              <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                {recentPairs.map((p, idx) => {
                  const names = p.map(id => playerMap.get(id)?.name || 'Unknown');
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSelectRecentPair(p)}
                      className="text-xs bg-white/5 hover:bg-emerald-500/15 border border-white/10 hover:border-emerald-500/40 text-slate-300 hover:text-white px-2.5 py-1.5 rounded-full transition-all duration-150 whitespace-nowrap shrink-0"
                    >
                      👥 {names.join(' & ')}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Scrollable Player List */}
        <div className="flex-1 overflow-y-auto max-h-[30vh] min-h-[120px] pr-1 space-y-1.5">
          {players.length === 0 ? (
            <div className="py-8 text-center text-sm text-slate-500">
              No players available.
            </div>
          ) : (
            players.map((player) => {
              const selectedIndex = tempSelected.indexOf(player.id);
              const isSelected = selectedIndex !== -1;

              return (
                <button
                  key={player.id}
                  type="button"
                  onClick={() => handleTogglePlayer(player.id)}
                  disabled={!isSelected && tempSelected.length >= limit}
                  className={cn(
                    "w-full flex items-center justify-between p-3 rounded-xl border transition-all duration-150 text-left",
                    isSelected
                      ? "bg-emerald-500/10 border-emerald-500/40 text-white"
                      : "bg-white/3 border-transparent hover:bg-white/5 hover:border-white/10 text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-md transition-all duration-200",
                      isSelected
                        ? "bg-gradient-to-br from-emerald-400 to-emerald-600"
                        : "bg-white/10"
                    )}>
                      {getInitials(player.name)}
                    </div>
                    <span className="font-medium text-sm">{player.name}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {isSelected && (
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full font-bold">
                          {mode === 'singles' 
                            ? (selectedIndex === 0 ? 'Team A' : 'Team B')
                            : orderLabels[selectedIndex].split(' - ')[0]
                          }
                        </span>
                        <span className="text-lg font-bold text-emerald-400">
                          {orderCircles[selectedIndex]}
                        </span>
                      </div>
                    )}
                    <div className={cn(
                      "w-5 h-5 rounded-md border flex items-center justify-center transition-all duration-150",
                      isSelected
                        ? "border-emerald-500 bg-emerald-500 text-white"
                        : "border-white/20"
                    )}>
                      {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Footer / Actions */}
        <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between gap-3">
          <div>
            {tempSelected.length > 0 && (
              <Button
                type="button"
                variant="ghost"
                onClick={handleClear}
                className="text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 flex items-center gap-1 h-9 rounded-lg"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Clear ({tempSelected.length})
              </Button>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="bg-transparent border-white/10 hover:bg-white/5 text-slate-300 hover:text-white h-10 rounded-xl"
            >
              Cancel
            </Button>
            <Button
              type="button"
              disabled={tempSelected.length !== limit}
              onClick={handleDone}
              className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 shadow-md shadow-emerald-500/20 text-white h-10 rounded-xl px-5 font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Done ({tempSelected.length}/{limit})
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
