'use client';

import { useState } from 'react';
import { Users, ArrowLeftRight, Shuffle, Edit2, UserPlus, Dices } from 'lucide-react';
import { Player } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { PlayerSelectionModal } from './PlayerSelectionModal';
import { RandomTeamGeneratorModal } from './RandomTeamGeneratorModal';
import { useMatches } from '@/lib/hooks/useMatches';
import { cn } from '@/lib/utils';

interface DoublesPlayerSelectorProps {
  players: Player[];
  selected: string[]; // [playerA, playerC, playerB, playerD]
  onChange: (selected: string[]) => void;
  errors?: {
    playerA?: { message?: string };
    playerB?: { message?: string };
    playerC?: { message?: string };
    playerD?: { message?: string };
  };
}

export function DoublesPlayerSelector({
  players,
  selected,
  onChange,
  errors,
}: DoublesPlayerSelectorProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [generatorOpen, setGeneratorOpen] = useState(false);
  const { matches } = useMatches();

  const playerMap = new Map(players.map((p) => [p.id, p]));

  const playerA = selected[0] ? playerMap.get(selected[0]) : null;
  const playerC = selected[1] ? playerMap.get(selected[1]) : null;
  const playerB = selected[2] ? playerMap.get(selected[2]) : null;
  const playerD = selected[3] ? playerMap.get(selected[3]) : null;

  const hasAllPlayers = playerA && playerB && playerC && playerD;

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Swaps all of Team A with Team B
  const handleSwapTeams = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!hasAllPlayers) return;
    // Swap: [A, C, B, D] -> [B, D, A, C]
    onChange([selected[2], selected[3], selected[0], selected[1]]);
  };

  // Swaps playerA and playerC (Team A partners)
  const handleSwapTeamA = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!playerA || !playerC) return;
    // Swap: [A, C, B, D] -> [C, A, B, D]
    onChange([selected[1], selected[0], selected[2], selected[3]]);
  };

  // Swaps playerB and playerD (Team B partners)
  const handleSwapTeamB = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!playerB || !playerD) return;
    // Swap: [A, C, B, D] -> [A, C, D, B]
    onChange([selected[0], selected[1], selected[3], selected[2]]);
  };

  const handleApplyGeneratedTeams = (teamA: [string, string], teamB: [string, string]) => {
    onChange([teamA[0], teamA[1], teamB[0], teamB[1]]);
  };

  // Check if we have any validation errors for the player fields
  const hasError = errors?.playerA || errors?.playerB || errors?.playerC || errors?.playerD;
  const errorMessage = errors?.playerA?.message || errors?.playerB?.message || errors?.playerC?.message || errors?.playerD?.message;

  return (
    <div className="space-y-4">
      {/* Top action strip: Quick Team Generator */}
      <div className="flex justify-end">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setGeneratorOpen(true)}
          className="bg-white/5 border-white/10 hover:bg-emerald-500/10 hover:text-emerald-400 text-slate-300 text-xs h-8 px-2.5 rounded-xl flex items-center gap-1.5"
        >
          <Dices className="w-3.5 h-3.5 text-emerald-400" />
          <span>Balanced Team Generator</span>
        </Button>
      </div>

      {!hasAllPlayers ? (
        // Empty State: Click to select players
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className={cn(
            "w-full py-8 px-4 rounded-2xl border-2 border-dashed border-white/10 hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all text-center flex flex-col items-center justify-center gap-3 cursor-pointer group",
            hasError && "border-red-500/50 hover:border-red-500 bg-red-500/5"
          )}
        >
          <div className="w-12 h-12 rounded-xl bg-white/5 group-hover:bg-emerald-500/10 flex items-center justify-center text-slate-400 group-hover:text-emerald-400 transition-all">
            <UserPlus className="w-6 h-6" />
          </div>
          <div>
            <p className="text-white font-semibold text-sm">Select 4 Players</p>
            <p className="text-slate-400 text-xs mt-1">Tap to select partners for Team A and Team B</p>
          </div>
          {errorMessage && (
            <p className="text-red-400 text-xs font-medium mt-1">{errorMessage}</p>
          )}
        </button>
      ) : (
        // Premium Selected State
        <div 
          onClick={() => setModalOpen(true)}
          className="border border-white/10 rounded-2xl bg-white/2 hover:bg-white/5 hover:border-white/20 transition-all p-5 cursor-pointer relative group"
        >
          {/* Header Action: Change Players */}
          <div className="absolute top-4 right-4 opacity-70 group-hover:opacity-100 transition-opacity">
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="h-8 w-8 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white rounded-lg"
              onClick={(e) => {
                e.stopPropagation();
                setModalOpen(true);
              }}
            >
              <Edit2 className="w-4 h-4" />
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-7 gap-4 items-center">
            {/* Team A Card */}
            <div className="md:col-span-3 bg-emerald-500/5 border border-emerald-500/15 rounded-xl p-4 relative">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Team A</span>
                {/* Swap Partners A */}
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  className="h-6 w-6 text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10 rounded"
                  title="Swap partners order"
                  onClick={handleSwapTeamA}
                >
                  <Shuffle className="w-3.5 h-3.5" />
                </Button>
              </div>
              
              <div className="space-y-2.5">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-xs font-bold text-white shadow-md">
                    {getInitials(playerA.name)}
                  </div>
                  <span className="text-sm font-medium text-white truncate">{playerA.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-xs font-bold text-white shadow-md">
                    {getInitials(playerC!.name)}
                  </div>
                  <span className="text-sm font-medium text-white truncate">{playerC!.name}</span>
                </div>
              </div>
            </div>

            {/* VS Divider & Global Swap */}
            <div className="md:col-span-1 flex flex-col items-center justify-center gap-2">
              <span className="text-xs font-bold text-slate-600 px-3 py-1 rounded-full bg-white/5 select-none">
                VS
              </span>
              {/* Swap Teams Button */}
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-8 px-2.5 bg-white/5 border-white/10 hover:bg-white/10 text-slate-400 hover:text-white rounded-lg flex items-center gap-1.5"
                title="Swap Team A and Team B"
                onClick={handleSwapTeams}
              >
                <ArrowLeftRight className="w-3.5 h-3.5" />
                <span className="text-[10px] font-semibold">Swap Teams</span>
              </Button>
            </div>

            {/* Team B Card */}
            <div className="md:col-span-3 bg-yellow-500/5 border border-yellow-500/15 rounded-xl p-4 relative">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-yellow-400">Team B</span>
                {/* Swap Partners B */}
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  className="h-6 w-6 text-slate-400 hover:text-yellow-400 hover:bg-yellow-500/10 rounded"
                  title="Swap partners order"
                  onClick={handleSwapTeamB}
                >
                  <Shuffle className="w-3.5 h-3.5" />
                </Button>
              </div>

              <div className="space-y-2.5">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center text-xs font-bold text-white shadow-md">
                    {getInitials(playerB.name)}
                  </div>
                  <span className="text-sm font-medium text-white truncate">{playerB.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center text-xs font-bold text-white shadow-md">
                    {getInitials(playerD!.name)}
                  </div>
                  <span className="text-sm font-medium text-white truncate">{playerD!.name}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-3 text-center">
            <span className="text-[11px] text-slate-500 group-hover:text-slate-400 transition-colors">
              Click anywhere on the card to change players
            </span>
          </div>

          {errorMessage && (
            <p className="text-red-400 text-xs font-medium mt-2 text-center">{errorMessage}</p>
          )}
        </div>
      )}

      {/* Embedded Dialog Modal */}
      <PlayerSelectionModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        players={players}
        selectedIds={selected}
        onConfirm={onChange}
        mode="doubles"
      />

      {/* Random Balanced Team Generator Modal */}
      <RandomTeamGeneratorModal
        open={generatorOpen}
        onOpenChange={setGeneratorOpen}
        players={players}
        allMatches={matches}
        onApplyTeams={handleApplyGeneratedTeams}
      />
    </div>
  );
}
