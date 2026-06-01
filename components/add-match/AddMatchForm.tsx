'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Loader2, Save, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { matchFormSchema, MatchFormData } from '@/lib/schemas/matchSchema';
import { MatchTypeSelector } from './MatchTypeSelector';
import { PlayerSelector } from './PlayerSelector';
import { ScoreInput } from './ScoreInput';
import { WinnerPreview } from './WinnerPreview';
import { useOptimizedPlayers } from '@/lib/hooks/useOptimizedPlayers';
import { addMatch } from '@/lib/actions/matchActions';
import { determineWinner, getWinnerNames, hasValidScore } from '@/lib/utils/matchUtils';
import { Skeleton } from '@/components/ui/skeleton';

export function AddMatchForm() {
  const router = useRouter();
  const { players, playerMap, loading: playersLoading } = useOptimizedPlayers();
  const [submitting, setSubmitting] = useState(false);
  const [visibleSets, setVisibleSets] = useState(1); // Start with only Set 1 visible

  const {
    watch,
    setValue,
    handleSubmit,
    formState: { errors },
  } = useForm<MatchFormData>({
    resolver: zodResolver(matchFormSchema),
    defaultValues: {
      type: 'singles',
      playerA: '',
      playerB: '',
      playerC: '',
      playerD: '',
      set1TeamA: 0,
      set1TeamB: 0,
      set2TeamA: 0,
      set2TeamB: 0,
      set3TeamA: 0,
      set3TeamB: 0,
    },
  });

  const formValues = watch();

  // Calculate winner preview
  const winnerPreview = useMemo(() => {
    if (!hasValidScore(formValues)) return { show: false, names: [] };
    
    const winnerIds = determineWinner(formValues);
    const playerNameMap = new Map(
      players.map(p => [p.id, p.name])
    );
    const names = getWinnerNames(winnerIds, playerNameMap);
    
    return { show: true, names };
  }, [formValues, players]);

  const onSubmit = async (data: MatchFormData) => {
    setSubmitting(true);
    
    try {
      // Prepare match data
      const playerIds = data.type === 'singles'
        ? [data.playerA, data.playerB]
        : [data.playerA, data.playerC!, data.playerB, data.playerD!];

      const winnerIds = determineWinner(data);

      const score: any = {
        set1: { teamA: data.set1TeamA, teamB: data.set1TeamB },
        set2: { teamA: data.set2TeamA, teamB: data.set2TeamB },
      };

      if (data.set3TeamA && data.set3TeamB && (data.set3TeamA > 0 || data.set3TeamB > 0)) {
        score.set3 = { teamA: data.set3TeamA, teamB: data.set3TeamB };
      }

      // Save match
      const result = await addMatch({
        type: data.type,
        players: playerIds,
        score,
        winner: winnerIds,
      });

      if (result.success) {
        toast.success('Match saved successfully! 🏸', {
          description: 'Stats updated for all players',
        });
        router.push('/');
      } else {
        toast.error('Failed to save match', {
          description: 'Please try again',
        });
      }
    } catch (error) {
      console.error('Error saving match:', error);
      toast.error('An error occurred', {
        description: 'Please check your connection and try again',
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (playersLoading) {
    return (
      <div className="space-y-5">
        <Skeleton className="h-40 bg-white/5 rounded-2xl" />
        <Skeleton className="h-64 bg-white/5 rounded-2xl" />
        <Skeleton className="h-48 bg-white/5 rounded-2xl" />
      </div>
    );
  }

  if (players.length === 0) {
    return (
      <div className="glass-card rounded-2xl p-8 text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-emerald-400 to-yellow-400 flex items-center justify-center">
          <span className="text-3xl">🏸</span>
        </div>
        <h3 className="text-xl font-bold text-white mb-2">No players found</h3>
        <p className="text-slate-400 mb-6">Add players first to start recording matches</p>
        <Button
          onClick={() => router.push('/players')}
          className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700"
        >
          Go to Players
        </Button>
      </div>
    );
  }

  const selectedPlayers = [
    formValues.playerA,
    formValues.playerB,
    formValues.playerC,
    formValues.playerD,
  ].filter((id): id is string => Boolean(id));

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 pb-32 md:pb-8">
      {/* Match Type */}
      <div className="glass-card rounded-2xl p-6">
        <h2 className="text-base font-semibold text-white mb-4">Match Type</h2>
        <MatchTypeSelector
          value={formValues.type}
          onChange={(value) => {
            setValue('type', value);
            // Reset players when switching type
            if (value === 'singles') {
              setValue('playerC', '');
              setValue('playerD', '');
            }
          }}
        />
      </div>

      {/* Players */}
      <div className="glass-card rounded-2xl p-6">
        <h2 className="text-base font-semibold text-white mb-5">Players</h2>
        
        <div className="space-y-6">
          {/* Team A */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 rounded-full bg-emerald-400" />
              <span className="text-sm font-semibold text-emerald-400">Team A</span>
            </div>
            <div className="space-y-3">
              <PlayerSelector
                label={formValues.type === 'singles' ? 'Player' : 'Player 1'}
                value={formValues.playerA}
                onChange={(value) => setValue('playerA', value)}
                players={players}
                excludeIds={selectedPlayers.filter(id => id !== formValues.playerA)}
                error={errors.playerA?.message}
              />
              
              {formValues.type === 'doubles' && (
                <PlayerSelector
                  label="Player 2"
                  value={formValues.playerC || ''}
                  onChange={(value) => setValue('playerC', value)}
                  players={players}
                  excludeIds={selectedPlayers.filter(id => id !== formValues.playerC)}
                  error={errors.playerC?.message}
                />
              )}
            </div>
          </div>

          {/* VS Divider */}
          <div className="flex items-center justify-center">
            <span className="text-xs font-bold text-slate-600 px-4 py-1.5 rounded-full bg-white/5">
              VS
            </span>
          </div>

          {/* Team B */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 rounded-full bg-yellow-400" />
              <span className="text-sm font-semibold text-yellow-400">Team B</span>
            </div>
            <div className="space-y-3">
              <PlayerSelector
                label={formValues.type === 'singles' ? 'Player' : 'Player 1'}
                value={formValues.playerB}
                onChange={(value) => setValue('playerB', value)}
                players={players}
                excludeIds={selectedPlayers.filter(id => id !== formValues.playerB)}
                error={errors.playerB?.message}
              />
              
              {formValues.type === 'doubles' && (
                <PlayerSelector
                  label="Player 2"
                  value={formValues.playerD || ''}
                  onChange={(value) => setValue('playerD', value)}
                  players={players}
                  excludeIds={selectedPlayers.filter(id => id !== formValues.playerD)}
                  error={errors.playerD?.message}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Scores */}
      <div className="glass-card rounded-2xl p-6">
        <h2 className="text-base font-semibold text-white mb-5">Scores</h2>
        
        <div className="space-y-4">
          {/* Set 1 - Always visible */}
          <ScoreInput
            setNumber={1}
            teamAScore={formValues.set1TeamA}
            teamBScore={formValues.set1TeamB}
            onTeamAChange={(value) => setValue('set1TeamA', value)}
            onTeamBChange={(value) => setValue('set1TeamB', value)}
            teamAPlayers={
              formValues.type === 'singles'
                ? [playerMap.get(formValues.playerA)?.name].filter(Boolean) as string[]
                : [playerMap.get(formValues.playerA)?.name, playerMap.get(formValues.playerC || '')?.name].filter(Boolean) as string[]
            }
            teamBPlayers={
              formValues.type === 'singles'
                ? [playerMap.get(formValues.playerB)?.name].filter(Boolean) as string[]
                : [playerMap.get(formValues.playerB)?.name, playerMap.get(formValues.playerD || '')?.name].filter(Boolean) as string[]
            }
          />
          
          {/* Set 2 - Show if visibleSets >= 2 */}
          {visibleSets >= 2 && (
            <ScoreInput
              setNumber={2}
              teamAScore={formValues.set2TeamA}
              teamBScore={formValues.set2TeamB}
              onTeamAChange={(value) => setValue('set2TeamA', value)}
              onTeamBChange={(value) => setValue('set2TeamB', value)}
              teamAPlayers={
                formValues.type === 'singles'
                  ? [playerMap.get(formValues.playerA)?.name].filter(Boolean) as string[]
                  : [playerMap.get(formValues.playerA)?.name, playerMap.get(formValues.playerC || '')?.name].filter(Boolean) as string[]
              }
              teamBPlayers={
                formValues.type === 'singles'
                  ? [playerMap.get(formValues.playerB)?.name].filter(Boolean) as string[]
                  : [playerMap.get(formValues.playerB)?.name, playerMap.get(formValues.playerD || '')?.name].filter(Boolean) as string[]
              }
            />
          )}
          
          {/* Set 3 - Show if visibleSets >= 3 */}
          {visibleSets >= 3 && (
            <ScoreInput
              setNumber={3}
              teamAScore={formValues.set3TeamA || 0}
              teamBScore={formValues.set3TeamB || 0}
              onTeamAChange={(value) => setValue('set3TeamA', value)}
              onTeamBChange={(value) => setValue('set3TeamB', value)}
              optional
              teamAPlayers={
                formValues.type === 'singles'
                  ? [playerMap.get(formValues.playerA)?.name].filter(Boolean) as string[]
                  : [playerMap.get(formValues.playerA)?.name, playerMap.get(formValues.playerC || '')?.name].filter(Boolean) as string[]
              }
              teamBPlayers={
                formValues.type === 'singles'
                  ? [playerMap.get(formValues.playerB)?.name].filter(Boolean) as string[]
                  : [playerMap.get(formValues.playerB)?.name, playerMap.get(formValues.playerD || '')?.name].filter(Boolean) as string[]
              }
            />
          )}

          {/* Add Another Set Button */}
          {visibleSets < 3 && (
            <button
              type="button"
              onClick={() => setVisibleSets(prev => Math.min(prev + 1, 3))}
              className="w-full py-3 rounded-xl border-2 border-dashed border-white/10 hover:border-emerald-500/50 hover:bg-emerald-500/5 text-slate-400 hover:text-emerald-400 font-medium text-sm transition-all flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Set {visibleSets + 1}
            </button>
          )}
        </div>
      </div>

      {/* Winner Preview */}
      <WinnerPreview
        winnerNames={winnerPreview.names}
        show={winnerPreview.show}
      />

      {/* Submit Button - Sticky on mobile */}
      <div className="md:relative md:p-0 md:bg-none">
        <div className="fixed bottom-16 left-0 right-0 p-4 bg-gradient-to-t from-[#0B0F14] via-[#0B0F14] to-transparent md:relative md:bottom-0 md:p-0 md:bg-none z-40">
          <Button
            type="submit"
            disabled={submitting || !hasValidScore(formValues)}
            className="w-full h-14 text-base font-semibold bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 shadow-lg shadow-emerald-500/30 transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {submitting ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Saving Match...
              </>
            ) : (
              <>
                <Save className="w-5 h-5 mr-2" />
                Save Match 🏸
              </>
            )}
          </Button>
        </div>
      </div>
    </form>
  );
}
