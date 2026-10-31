'use client';

import { useState } from 'react';
import { Player, Match } from '@/lib/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Shuffle, Check, Dices, ArrowRight, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { generateBalancedTeams } from '@/lib/utils/combinationStats';

interface RandomTeamGeneratorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  players: Player[];
  allMatches: Match[];
  onApplyTeams: (teamAPlayers: [string, string], teamBPlayers: [string, string]) => void;
}

export function RandomTeamGeneratorModal({
  open,
  onOpenChange,
  players,
  allMatches,
  onApplyTeams,
}: RandomTeamGeneratorModalProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [generatedPairing, setGeneratedPairing] = useState<{
    teamA: [Player, Player];
    teamB: [Player, Player];
    balanceScore: number;
  } | null>(null);

  const playerMap = new Map(players.map((p) => [p.id, p]));

  const handleToggle = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds((prev) => prev.filter((pId) => pId !== id));
      setGeneratedPairing(null);
    } else {
      if (selectedIds.length < 4) {
        setSelectedIds((prev) => [...prev, id]);
        setGeneratedPairing(null);
      }
    }
  };

  const handleGenerate = () => {
    if (selectedIds.length !== 4) return;
    const result = generateBalancedTeams(selectedIds, players, allMatches);
    setGeneratedPairing(result);
  };

  const handleApply = () => {
    if (!generatedPairing) return;
    onApplyTeams(
      [generatedPairing.teamA[0].id, generatedPairing.teamA[1].id],
      [generatedPairing.teamB[0].id, generatedPairing.teamB[1].id]
    );
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-[#0F141C] border border-white/10 text-white rounded-2xl p-5">
        <DialogHeader className="mb-2">
          <DialogTitle className="text-lg font-bold flex items-center gap-2">
            <Dices className="w-5 h-5 text-emerald-400" />
            Balanced Team Generator
          </DialogTitle>
          <p className="text-xs text-slate-400">
            Select 4 players to calculate mathematically balanced doubles teams
          </p>
        </DialogHeader>

        {/* Player Selection list */}
        <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
          {players.map((p) => {
            const isSelected = selectedIds.includes(p.id);
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => handleToggle(p.id)}
                disabled={!isSelected && selectedIds.length >= 4}
                className={cn(
                  'w-full flex items-center justify-between p-2.5 rounded-xl border text-xs font-medium transition-all text-left',
                  isSelected
                    ? 'bg-emerald-500/15 border-emerald-500/40 text-white'
                    : 'bg-white/5 border-transparent text-slate-300 hover:bg-white/10 disabled:opacity-30'
                )}
              >
                <span>{p.name}</span>
                <span className="text-[11px] text-slate-400">
                  {p.wins}W - {p.losses}L
                </span>
              </button>
            );
          })}
        </div>

        {/* Selected Counter & Generate Button */}
        <div className="pt-2">
          <Button
            type="button"
            onClick={handleGenerate}
            disabled={selectedIds.length !== 4}
            className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 text-white font-bold h-11 rounded-xl text-xs flex items-center justify-center gap-2 disabled:opacity-40"
          >
            <Shuffle className="w-4 h-4" />
            <span>Generate Teams ({selectedIds.length}/4 selected)</span>
          </Button>
        </div>

        {/* Generated Teams Outcome */}
        {generatedPairing && (
          <div className="mt-3 p-4 bg-white/5 border border-emerald-500/30 rounded-2xl space-y-3 animate-fade-in">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-emerald-400 flex items-center gap-1">
                <ShieldCheck className="w-4 h-4" /> Balanced Matchup Found
              </span>
              <span className="text-slate-400 font-mono text-[11px]">
                Skill Gap: {generatedPairing.balanceScore.toFixed(1)}%
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-center text-xs">
              <div className="p-3 bg-red-950/20 border border-red-500/30 rounded-xl">
                <span className="text-[10px] uppercase font-bold text-red-400 block mb-1">Team A</span>
                <p className="font-bold text-white truncate">{generatedPairing.teamA[0].name}</p>
                <p className="font-bold text-white truncate">{generatedPairing.teamA[1].name}</p>
              </div>

              <div className="p-3 bg-emerald-950/20 border border-emerald-500/30 rounded-xl">
                <span className="text-[10px] uppercase font-bold text-emerald-400 block mb-1">Team B</span>
                <p className="font-bold text-white truncate">{generatedPairing.teamB[0].name}</p>
                <p className="font-bold text-white truncate">{generatedPairing.teamB[1].name}</p>
              </div>
            </div>

            <Button
              type="button"
              onClick={handleApply}
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold h-10 rounded-xl text-xs flex items-center justify-center gap-1.5"
            >
              <span>Apply Setup to Match</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

