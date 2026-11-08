'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Loader2, Save, Swords, Zap } from 'lucide-react';
import { toast } from 'sonner';
import { matchFormSchema, MatchFormData } from '@/lib/schemas/matchSchema';
import { MatchTypeSelector } from './MatchTypeSelector';
import { DoublesPlayerSelector } from './DoublesPlayerSelector';
import { SinglesPlayerSelector } from './SinglesPlayerSelector';
import { ScoreInput } from './ScoreInput';
import { WinnerPreview } from './WinnerPreview';
import { FullscreenScoreboard } from './FullscreenScoreboard';
import { useOptimizedPlayers } from '@/lib/hooks/useOptimizedPlayers';
import { addMatch } from '@/lib/actions/matchActions';
import { determineWinner, getWinnerNames, hasValidScore } from '@/lib/utils/matchUtils';
import { Skeleton } from '@/components/ui/skeleton';

export function AddMatchForm() {
  const router = useRouter();
  const { players, playerMap, loading: playersLoading } = useOptimizedPlayers();
  const [submitting, setSubmitting] = useState(false);
  const [scoreboardOpen, setScoreboardOpen] = useState(false);

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
      teamAScore: 0,
      teamBScore: 0,
    },
  });

  const formValues = watch();

  // Selected Team Players for Scoreboard and Labels
  const teamAPlayers = useMemo(() => {
    if (formValues.type === 'singles') {
      const p = playerMap.get(formValues.playerA);
      return p ? [p] : [];
    }
    const p1 = playerMap.get(formValues.playerA);
    const p2 = playerMap.get(formValues.playerC || '');
    return [p1, p2].filter(Boolean) as any[];
  }, [formValues.type, formValues.playerA, formValues.playerC, playerMap]);

  const teamBPlayers = useMemo(() => {
    if (formValues.type === 'singles') {
      const p = playerMap.get(formValues.playerB);
      return p ? [p] : [];
    }
    const p1 = playerMap.get(formValues.playerB);
    const p2 = playerMap.get(formValues.playerD || '');
    return [p1, p2].filter(Boolean) as any[];
  }, [formValues.type, formValues.playerB, formValues.playerD, playerMap]);

  const hasAllRequiredPlayers = useMemo(() => {
    if (formValues.type === 'singles') {
      return Boolean(formValues.playerA && formValues.playerB);
    }
    return Boolean(
      formValues.playerA && formValues.playerB && formValues.playerC && formValues.playerD
    );
  }, [formValues]);

  // Calculate winner preview
  const winnerPreview = useMemo(() => {
    if (!hasValidScore(formValues)) return { show: false, names: [] };

    const winnerIds = determineWinner(formValues);
    const playerNameMap = new Map(players.map((p) => [p.id, p.name]));
    const names = getWinnerNames(winnerIds, playerNameMap);

    return { show: true, names };
  }, [formValues, players]);

  const onSubmit = async (data: MatchFormData) => {
    setSubmitting(true);

    try {
      const playerIds =
        data.type === 'singles'
          ? [data.playerA, data.playerB]
          : [data.playerA, data.playerC!, data.playerB, data.playerD!];

      const winnerIds = determineWinner(data);

      // Save as one independent match record (Single Game Model)
      const result = await addMatch({
        type: data.type,
        players: playerIds,
        score: {
          set1: { teamA: data.teamAScore, teamB: data.teamBScore },
        },
        winner: winnerIds,
      });

      if (result.success) {
        // Cache matchup in localStorage for fast selection
        if (data.type === 'singles') {
          const teamA = [data.playerA];
          const teamB = [data.playerB];

          try {
            const storedMatchups = localStorage.getItem('badminton:recent-singles-matchups');
            const recentMatchups = storedMatchups ? JSON.parse(storedMatchups) : [];
            const newMatchup = { teamA, teamB };

            const filteredMatchups = recentMatchups.filter((m: any) => {
              return !(m.teamA[0] === teamA[0] && m.teamB[0] === teamB[0]);
            });

            filteredMatchups.unshift(newMatchup);
            localStorage.setItem(
              'badminton:recent-singles-matchups',
              JSON.stringify(filteredMatchups.slice(0, 5))
            );
          } catch (e) {
            console.error('Failed to update recent singles matchups in localStorage', e);
          }
        } else if (data.type === 'doubles') {
          const teamA = [data.playerA, data.playerC!];
          const teamB = [data.playerB, data.playerD!];

          try {
            const storedMatchups = localStorage.getItem('badminton:recent-matchups');
            const recentMatchups = storedMatchups ? JSON.parse(storedMatchups) : [];
            const newMatchup = { teamA, teamB };

            const filteredMatchups = recentMatchups.filter((m: any) => {
              return !(
                m.teamA[0] === teamA[0] &&
                m.teamA[1] === teamA[1] &&
                m.teamB[0] === teamB[0] &&
                m.teamB[1] === teamB[1]
              );
            });

            filteredMatchups.unshift(newMatchup);
            localStorage.setItem(
              'badminton:recent-matchups',
              JSON.stringify(filteredMatchups.slice(0, 5))
            );

            // Update recent pairs
            const storedPairs = localStorage.getItem('badminton:recent-pairs');
            let recentPairs = storedPairs ? JSON.parse(storedPairs) : [];

            [teamA, teamB].forEach((pair) => {
              recentPairs = recentPairs.filter(
                (p: string[]) =>
                  !(p[0] === pair[0] && p[1] === pair[1]) &&
                  !(p[0] === pair[1] && p[1] === pair[0])
              );
              recentPairs.unshift(pair);
            });
            localStorage.setItem('badminton:recent-pairs', JSON.stringify(recentPairs.slice(0, 10)));
          } catch (e) {
            console.error('Failed to update recent teams in localStorage', e);
          }
        }

        toast.success('Game saved successfully! 🏸', {
          description: 'Lifetime player and partnership stats updated',
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

  // Bridge from court-side live scoreboard
  const handleScoreboardSave = async (scores: { teamAScore: number; teamBScore: number }) => {
    setValue('teamAScore', scores.teamAScore);
    setValue('teamBScore', scores.teamBScore);

    const payload: MatchFormData = {
      ...formValues,
      teamAScore: scores.teamAScore,
      teamBScore: scores.teamBScore,
    };

    await onSubmit(payload);
  };

  const handleLaunchScoreboard = () => {
    if (!hasAllRequiredPlayers) {
      toast.error('Please select players first', {
        description:
          formValues.type === 'singles'
            ? 'Select 2 players for singles'
            : 'Select 4 players for doubles',
      });
      return;
    }
    setScoreboardOpen(true);
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

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 sm:space-y-5 pb-10">
        {/* Match Type */}
        <div className="glass-card rounded-2xl p-4 sm:p-6">
          <h2 className="text-sm sm:text-base font-semibold text-white mb-3 sm:mb-4">Match Type</h2>
          <MatchTypeSelector
            value={formValues.type}
            onChange={(value) => {
              setValue('type', value);
              if (value === 'singles') {
                setValue('playerC', '');
                setValue('playerD', '');
              }
            }}
          />
        </div>

        {/* Players */}
        <div className="glass-card rounded-2xl p-4 sm:p-6">
          <h2 className="text-sm sm:text-base font-semibold text-white mb-4 sm:mb-5">Players</h2>

          {formValues.type === 'singles' ? (
            <SinglesPlayerSelector
              players={players}
              selected={[formValues.playerA, formValues.playerB]}
              onChange={(selected) => {
                setValue('playerA', selected[0] || '');
                setValue('playerB', selected[1] || '');
              }}
              errors={errors}
            />
          ) : (
            <DoublesPlayerSelector
              players={players}
              selected={[
                formValues.playerA,
                formValues.playerC || '',
                formValues.playerB,
                formValues.playerD || '',
              ]}
              onChange={(selected) => {
                setValue('playerA', selected[0] || '');
                setValue('playerC', selected[1] || '');
                setValue('playerB', selected[2] || '');
                setValue('playerD', selected[3] || '');
              }}
              errors={errors}
            />
          )}
        </div>

        {/* Live Scoreboard Banner / Quick Launch */}
        <div className="glass-card rounded-2xl p-4 sm:p-5 border border-emerald-500/30 bg-gradient-to-r from-emerald-950/40 via-black to-emerald-950/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white shadow-lg shadow-emerald-500/30 shrink-0">
              <Zap className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-extrabold text-white flex items-center gap-1.5 flex-wrap">
                Court-Side Live Scoreboard
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
                  SINGLE GAME
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Large Red/Green split touch screen with undo, haptics and 21-point rules
              </p>
            </div>
          </div>

          <Button
            type="button"
            onClick={handleLaunchScoreboard}
            className="w-full sm:w-auto h-11 px-5 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 font-bold rounded-xl shadow-md shadow-emerald-500/20 text-white shrink-0"
          >
            <Swords className="w-4 h-4 mr-2" />
            Launch Live Scoreboard
          </Button>
        </div>

        {/* Single Game Score Entry */}
        <div className="glass-card rounded-2xl p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4 sm:mb-5">
            <div>
              <h2 className="text-sm sm:text-base font-semibold text-white">Game Score</h2>
              <p className="text-[11px] sm:text-xs text-slate-400">1 Game Played = 1 Match Record</p>
            </div>
            <span className="text-xs text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
              Badminton 21 Pts
            </span>
          </div>

          <ScoreInput
            teamAScore={formValues.teamAScore}
            teamBScore={formValues.teamBScore}
            onTeamAChange={(value) => setValue('teamAScore', value)}
            onTeamBChange={(value) => setValue('teamBScore', value)}
            teamAPlayers={
              formValues.type === 'singles'
                ? ([playerMap.get(formValues.playerA)?.name].filter(Boolean) as string[])
                : ([
                    playerMap.get(formValues.playerA)?.name,
                    playerMap.get(formValues.playerC || '')?.name,
                  ].filter(Boolean) as string[])
            }
            teamBPlayers={
              formValues.type === 'singles'
                ? ([playerMap.get(formValues.playerB)?.name].filter(Boolean) as string[])
                : ([
                    playerMap.get(formValues.playerB)?.name,
                    playerMap.get(formValues.playerD || '')?.name,
                  ].filter(Boolean) as string[])
            }
          />
        </div>

        {/* Winner Preview */}
        <WinnerPreview winnerNames={winnerPreview.names} show={winnerPreview.show} />

        {/* Submit Button (Permanently visible in-flow, never obscured or cramped) */}
        <div className="pt-2">
          <Button
            type="submit"
            disabled={submitting || !hasValidScore(formValues)}
            className="w-full h-14 text-base font-bold bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 shadow-lg shadow-emerald-500/30 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed rounded-2xl"
          >
            {submitting ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Saving Match...
              </>
            ) : (
              <>
                <Save className="w-5 h-5 mr-2" />
                Save Game 🏸
              </>
            )}
          </Button>
        </div>
      </form>

      {/* Fullscreen Scoreboard Modal */}
      <FullscreenScoreboard
        isOpen={scoreboardOpen}
        onClose={() => setScoreboardOpen(false)}
        matchType={formValues.type}
        teamAPlayers={teamAPlayers}
        teamBPlayers={teamBPlayers}
        onSaveMatch={handleScoreboardSave}
      />
    </>
  );
}
