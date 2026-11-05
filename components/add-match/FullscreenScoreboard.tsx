'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Player } from '@/lib/types';
import { Button } from '@/components/ui/button';
import {
  X,
  RotateCcw,
  Minus,
  ArrowLeftRight,
  Save,
  Trophy,
  Flame,
  CheckCircle2,
  Maximize2,
  Minimize2,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface FullscreenScoreboardProps {
  isOpen: boolean;
  onClose: () => void;
  matchType: 'singles' | 'doubles';
  teamAPlayers: Player[];
  teamBPlayers: Player[];
  onSaveMatch: (scores: { teamAScore: number; teamBScore: number }) => Promise<void>;
}

interface ScoreAction {
  scoringTeam: 'teamA' | 'teamB';
  prevA: number;
  prevB: number;
}

export function FullscreenScoreboard({
  isOpen,
  onClose,
  matchType,
  teamAPlayers,
  teamBPlayers,
  onSaveMatch,
}: FullscreenScoreboardProps) {
  const [scoreA, setScoreA] = useState<number>(0);
  const [scoreB, setScoreB] = useState<number>(0);
  const [historyStack, setHistoryStack] = useState<ScoreAction[]>([]);
  const [isSwappedEnds, setIsSwappedEnds] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);

  // Game completion prompt dialog
  const [gameDialog, setGameDialog] = useState<{
    winner: 'teamA' | 'teamB';
    scoreText: string;
  } | null>(null);

  const wakeLockRef = useRef<any>(null);

  // Team names
  const teamAName = useMemo(() => {
    return teamAPlayers.map((p) => p.name).join(' + ') || 'Team A';
  }, [teamAPlayers]);

  const teamBName = useMemo(() => {
    return teamBPlayers.map((p) => p.name).join(' + ') || 'Team B';
  }, [teamBPlayers]);

  // Badminton Game winner checker (21 points, 2-point lead, sudden death at 30)
  const checkGameWinner = (sA: number, sB: number): 'teamA' | 'teamB' | null => {
    if (sA >= 21 && sA - sB >= 2) return 'teamA';
    if (sB >= 21 && sB - sA >= 2) return 'teamB';
    if (sA === 30) return 'teamA';
    if (sB === 30) return 'teamB';
    return null;
  };

  // Screen Wake Lock API
  useEffect(() => {
    if (!isOpen) return;

    const requestWakeLock = async () => {
      try {
        if ('wakeLock' in navigator) {
          wakeLockRef.current = await (navigator as any).wakeLock.request('screen');
          console.log('💡 Screen Wake Lock activated');
        }
      } catch (err: any) {
        console.warn('Wake Lock request failed:', err.message);
      }
    };

    requestWakeLock();

    return () => {
      if (wakeLockRef.current) {
        wakeLockRef.current.release().then(() => {
          wakeLockRef.current = null;
          console.log('💡 Screen Wake Lock released');
        });
      }
    };
  }, [isOpen]);

  // Reset when opening
  useEffect(() => {
    if (isOpen) {
      setScoreA(0);
      setScoreB(0);
      setHistoryStack([]);
      setIsSwappedEnds(false);
      setGameDialog(null);
    }
  }, [isOpen]);

  // Haptic feedback helper
  const triggerHaptic = (duration: number | number[] = 40) => {
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(duration);
      } catch (e) {
        // Ignore vibrations unsupported
      }
    }
  };

  // Add Point Handler
  const handleAddPoint = useCallback(
    (team: 'teamA' | 'teamB') => {
      if (gameDialog) return; // Prevent clicking when modal dialog is open

      setHistoryStack((prev) => [
        ...prev,
        {
          scoringTeam: team,
          prevA: scoreA,
          prevB: scoreB,
        },
      ]);

      let nextA = scoreA;
      let nextB = scoreB;

      if (team === 'teamA') {
        if (scoreA < 30) nextA = scoreA + 1;
      } else {
        if (scoreB < 30) nextB = scoreB + 1;
      }

      setScoreA(nextA);
      setScoreB(nextB);
      triggerHaptic(50);

      // Check if this point wins the game
      const winner = checkGameWinner(nextA, nextB);
      if (winner) {
        triggerHaptic([70, 50, 100]);
        setGameDialog({
          winner,
          scoreText: `${nextA} - ${nextB}`,
        });
      }
    },
    [scoreA, scoreB, gameDialog]
  );

  // Minus Point Handler
  const handleMinusPoint = useCallback(
    (team: 'teamA' | 'teamB', e: React.MouseEvent) => {
      e.stopPropagation();

      if (team === 'teamA' && scoreA > 0) {
        setHistoryStack((prev) => [
          ...prev,
          { scoringTeam: 'teamA', prevA: scoreA, prevB: scoreB },
        ]);
        setScoreA((prev) => prev - 1);
        triggerHaptic(20);
      } else if (team === 'teamB' && scoreB > 0) {
        setHistoryStack((prev) => [
          ...prev,
          { scoringTeam: 'teamB', prevA: scoreA, prevB: scoreB },
        ]);
        setScoreB((prev) => prev - 1);
        triggerHaptic(20);
      }
    },
    [scoreA, scoreB]
  );

  // Undo Handler
  const handleUndo = useCallback(() => {
    if (historyStack.length === 0) {
      toast.info('Nothing to undo');
      return;
    }

    const lastAction = historyStack[historyStack.length - 1];
    setHistoryStack((prev) => prev.slice(0, prev.length - 1));

    setScoreA(lastAction.prevA);
    setScoreB(lastAction.prevB);
    setGameDialog(null);
    triggerHaptic(30);
  }, [historyStack]);

  // Toggle Fullscreen
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
        setIsFullscreen(false);
      }
    }
  };

  // Save Match Handler
  const handleFinalSave = async () => {
    if (scoreA === 0 && scoreB === 0) {
      toast.error('No points scored yet');
      return;
    }
    if (scoreA === scoreB) {
      toast.error('Game cannot end in a tie');
      return;
    }

    setSaving(true);
    try {
      await onSaveMatch({
        teamAScore: scoreA,
        teamBScore: scoreB,
      });
      onClose();
    } catch (err) {
      console.error('Failed to save match from scoreboard:', err);
      toast.error('Failed to save match');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  // Determine which side is displayed left vs right based on Swap Ends
  const leftTeamKey = isSwappedEnds ? 'teamB' : 'teamA';
  const rightTeamKey = isSwappedEnds ? 'teamA' : 'teamB';

  const leftTeamName = isSwappedEnds ? teamBName : teamAName;
  const rightTeamName = isSwappedEnds ? teamAName : teamBName;

  const leftScore = isSwappedEnds ? scoreB : scoreA;
  const rightScore = isSwappedEnds ? scoreA : scoreB;

  // Deuce / Game Point Status
  const isDeuce = scoreA >= 20 && scoreB >= 20 && scoreA === scoreB;
  const isGamePointA = (scoreA >= 20 && scoreA - scoreB >= 1) || scoreA === 29;
  const isGamePointB = (scoreB >= 20 && scoreB - scoreA >= 1) || scoreB === 29;

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col select-none touch-manipulation overflow-hidden">
      {/* Top Header Controls Bar */}
      <div className="h-14 sm:h-16 px-4 bg-black/80 backdrop-blur-md border-b border-white/10 flex items-center justify-between shrink-0 z-20">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 text-white"
          >
            <X className="w-5 h-5" />
          </Button>

          <span className="text-xs uppercase tracking-wider font-extrabold px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            {matchType === 'singles' ? 'Singles Game' : 'Doubles Game'}
          </span>
        </div>

        {/* Center Live Game Status Indicator */}
        <div className="flex items-center gap-2">
          {isDeuce ? (
            <span className="flex items-center gap-1.5 text-xs font-black tracking-wider px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse">
              <Flame className="w-3.5 h-3.5 text-amber-400" />
              DEUCE
            </span>
          ) : isGamePointA || isGamePointB ? (
            <span className="flex items-center gap-1.5 text-xs font-black tracking-wider px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 animate-pulse">
              <Flame className="w-3.5 h-3.5 text-emerald-400" />
              GAME POINT
            </span>
          ) : (
            <span className="text-xs font-bold text-slate-400 tracking-wider">
              Target: 21 pts (max 30)
            </span>
          )}
        </div>

        {/* Actions: Swap Ends, Fullscreen */}
        <div className="flex items-center gap-1.5">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsSwappedEnds((prev) => !prev)}
            className="h-9 px-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-xs font-semibold"
            title="Swap Court Sides"
          >
            <ArrowLeftRight className="w-4 h-4 mr-1.5" />
            Swap Ends
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={toggleFullscreen}
            className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white hidden sm:flex"
            title="Toggle Browser Fullscreen"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      {/* 50/50 Court-Side Split Scoring Touch Zones */}
      <div className="flex-1 grid grid-cols-2 divide-x-2 divide-black/80 relative">
        {/* LEFT COURT ZONE */}
        <div
          onClick={() => handleAddPoint(leftTeamKey)}
          className={cn(
            'flex flex-col items-center justify-between p-4 sm:p-6 transition-all duration-75 cursor-pointer active:brightness-110 relative group overflow-hidden',
            leftTeamKey === 'teamA'
              ? 'bg-gradient-to-b from-rose-950/90 via-red-900 to-red-950 text-red-50'
              : 'bg-gradient-to-b from-emerald-950/90 via-emerald-900 to-emerald-950 text-emerald-50'
          )}
        >
          {/* Subtle Court Line Texture */}
          <div className="absolute inset-0 border-4 border-white/5 pointer-events-none m-3 rounded-2xl" />

          {/* Left Team Header */}
          <div className="w-full text-center z-10 pt-2">
            <span
              className={cn(
                'inline-block px-3 py-1 rounded-full text-xs font-black tracking-widest uppercase mb-1',
                leftTeamKey === 'teamA'
                  ? 'bg-red-500/30 text-red-200 border border-red-400/30'
                  : 'bg-emerald-500/30 text-emerald-200 border border-emerald-400/30'
              )}
            >
              {leftTeamKey === 'teamA' ? 'Team A' : 'Team B'}
            </span>
            <h2 className="text-lg sm:text-2xl font-black text-white truncate px-2 max-w-full drop-shadow">
              {leftTeamName}
            </h2>
          </div>

          {/* Giant Score Display */}
          <div className="flex-1 flex flex-col items-center justify-center z-10">
            <div className="text-8xl sm:text-9xl md:text-[14rem] font-black tracking-tighter leading-none text-white drop-shadow-2xl">
              {leftScore}
            </div>
            <div className="text-xs uppercase tracking-widest font-bold opacity-60 mt-1">
              Tap to +1 Point
            </div>
          </div>

          {/* Minus Button for Left Team */}
          <div className="w-full flex justify-center z-10 pb-2">
            <button
              type="button"
              onClick={(e) => handleMinusPoint(leftTeamKey, e)}
              disabled={leftScore === 0}
              className="px-4 py-2 rounded-xl bg-black/40 hover:bg-black/60 text-white/80 hover:text-white text-xs font-bold flex items-center gap-1.5 backdrop-blur-md border border-white/10 active:scale-95 disabled:opacity-20 disabled:cursor-not-allowed transition-all"
            >
              <Minus className="w-4 h-4" />
              -1 Point
            </button>
          </div>
        </div>

        {/* RIGHT COURT ZONE */}
        <div
          onClick={() => handleAddPoint(rightTeamKey)}
          className={cn(
            'flex flex-col items-center justify-between p-4 sm:p-6 transition-all duration-75 cursor-pointer active:brightness-110 relative group overflow-hidden',
            rightTeamKey === 'teamA'
              ? 'bg-gradient-to-b from-rose-950/90 via-red-900 to-red-950 text-red-50'
              : 'bg-gradient-to-b from-emerald-950/90 via-emerald-900 to-emerald-950 text-emerald-50'
          )}
        >
          {/* Subtle Court Line Texture */}
          <div className="absolute inset-0 border-4 border-white/5 pointer-events-none m-3 rounded-2xl" />

          {/* Right Team Header */}
          <div className="w-full text-center z-10 pt-2">
            <span
              className={cn(
                'inline-block px-3 py-1 rounded-full text-xs font-black tracking-widest uppercase mb-1',
                rightTeamKey === 'teamA'
                  ? 'bg-red-500/30 text-red-200 border border-red-400/30'
                  : 'bg-emerald-500/30 text-emerald-200 border border-emerald-400/30'
              )}
            >
              {rightTeamKey === 'teamA' ? 'Team A' : 'Team B'}
            </span>
            <h2 className="text-lg sm:text-2xl font-black text-white truncate px-2 max-w-full drop-shadow">
              {rightTeamName}
            </h2>
          </div>

          {/* Giant Score Display */}
          <div className="flex-1 flex flex-col items-center justify-center z-10">
            <div className="text-8xl sm:text-9xl md:text-[14rem] font-black tracking-tighter leading-none text-white drop-shadow-2xl">
              {rightScore}
            </div>
            <div className="text-xs uppercase tracking-widest font-bold opacity-60 mt-1">
              Tap to +1 Point
            </div>
          </div>

          {/* Minus Button for Right Team */}
          <div className="w-full flex justify-center z-10 pb-2">
            <button
              type="button"
              onClick={(e) => handleMinusPoint(rightTeamKey, e)}
              disabled={rightScore === 0}
              className="px-4 py-2 rounded-xl bg-black/40 hover:bg-black/60 text-white/80 hover:text-white text-xs font-bold flex items-center gap-1.5 backdrop-blur-md border border-white/10 active:scale-95 disabled:opacity-20 disabled:cursor-not-allowed transition-all"
            >
              <Minus className="w-4 h-4" />
              -1 Point
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Sticky Action Bar */}
      <div className="h-16 sm:h-20 px-4 bg-black/90 backdrop-blur-md border-t border-white/10 flex items-center justify-between shrink-0 z-20">
        {/* Undo Action */}
        <Button
          type="button"
          variant="outline"
          onClick={handleUndo}
          disabled={historyStack.length === 0}
          className="h-11 px-4 rounded-xl border-white/20 bg-white/5 hover:bg-white/10 text-white font-bold flex items-center gap-2 disabled:opacity-30"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Undo</span>
        </Button>

        {/* Total Score Summary Box */}
        <div className="flex items-center gap-3 bg-white/5 px-4 py-2 rounded-xl border border-white/10">
          <span className="text-xs font-semibold text-slate-400">Score:</span>
          <span className="text-lg font-black text-white">
            {scoreA} - {scoreB}
          </span>
        </div>

        {/* Save Match Button */}
        <Button
          type="button"
          onClick={handleFinalSave}
          disabled={saving || (scoreA === 0 && scoreB === 0) || scoreA === scoreB}
          className="h-11 px-6 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 text-white font-extrabold shadow-lg shadow-emerald-500/25 flex items-center gap-2 disabled:opacity-40"
        >
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              Save Match 🏸
            </>
          )}
        </Button>
      </div>

      {/* Game Completed Modal Dialog */}
      {gameDialog && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#111827] border border-emerald-500/40 rounded-3xl p-6 sm:p-8 max-w-md w-full text-center shadow-2xl shadow-emerald-500/20 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-yellow-400 to-amber-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-yellow-500/30">
              <Trophy className="w-8 h-8 text-black" />
            </div>

            <h3 className="text-2xl font-black text-white mb-1">GAME COMPLETED!</h3>
            <p className="text-sm text-slate-300 font-semibold mb-2">
              Winner:{' '}
              <span className="text-emerald-400 font-bold">
                {gameDialog.winner === 'teamA' ? teamAName : teamBName}
              </span>
            </p>

            <div className="text-4xl font-black text-white mb-6 py-3 px-6 rounded-2xl bg-white/5 border border-white/10 inline-block">
              {gameDialog.scoreText}
            </div>

            <div className="flex flex-col gap-3">
              <Button
                type="button"
                onClick={handleFinalSave}
                disabled={saving}
                className="w-full h-12 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 font-bold text-white rounded-xl shadow-lg shadow-emerald-500/30 text-base"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Saving Match...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-5 h-5 mr-2" />
                    Save Match to Records
                  </>
                )}
              </Button>

              <Button
                type="button"
                variant="ghost"
                onClick={() => setGameDialog(null)}
                className="text-slate-400 hover:text-white text-xs font-semibold"
              >
                Keep Playing / Edit Score
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
