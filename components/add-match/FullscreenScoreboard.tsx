'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { createPortal } from 'react-dom';
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
  const [mounted, setMounted] = useState<boolean>(false);
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

  // Mount check for React Portal
  useEffect(() => {
    setMounted(true);
  }, []);

  // Team names formatted nicely
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

  // Screen Wake Lock API and Body Shell Hide Hook
  useEffect(() => {
    if (!isOpen) {
      if (typeof document !== 'undefined') {
        document.body.classList.remove('scoreboard-active');
      }
      return;
    }

    if (typeof document !== 'undefined') {
      document.body.classList.add('scoreboard-active');
    }

    const requestWakeLock = async () => {
      try {
        if ('wakeLock' in navigator) {
          wakeLockRef.current = await (navigator as any).wakeLock.request('screen');
        }
      } catch (err: any) {
        console.warn('Wake Lock request failed:', err.message);
      }
    };

    requestWakeLock();

    return () => {
      if (typeof document !== 'undefined') {
        document.body.classList.remove('scoreboard-active');
      }
      if (wakeLockRef.current) {
        wakeLockRef.current.release().then(() => {
          wakeLockRef.current = null;
        }).catch(() => {});
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

  // Toggle Browser Fullscreen
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

  // Save Match Handler (Directly accessible from scoreboard)
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

  if (!isOpen || !mounted) return null;

  // Determine court side layout based on Swap Ends
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

  const content = (
    <div
      className="scoreboard-container fixed inset-0 z-[99999] bg-[#07090E] h-screen h-[100dvh] max-h-[100dvh] w-screen overflow-hidden flex flex-col justify-between select-none touch-manipulation"
      style={{
        paddingTop: 'env(safe-area-inset-top, 0px)',
        paddingLeft: 'env(safe-area-inset-left, 0px)',
        paddingRight: 'env(safe-area-inset-right, 0px)',
      }}
    >
      {/* Sleek Minimal Top Control Bar (Takes minimal screen height) */}
      <div className="scoreboard-header h-11 sm:h-12 px-3 sm:px-4 bg-black/90 backdrop-blur-md border-b border-white/10 flex items-center justify-between shrink-0 z-20">
        {/* Left: Minimal Exit Control */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 active:scale-95 text-slate-300 hover:text-white flex items-center justify-center transition-all"
            title="Exit Scoreboard"
          >
            <X className="w-4 h-4" />
          </button>

          <span className="text-[11px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            {matchType === 'singles' ? 'Singles' : 'Doubles'}
          </span>
        </div>

        {/* Center: Live Game Status Indicator (Only active alerts, no crowded clutter) */}
        <div className="flex items-center">
          {isDeuce ? (
            <span className="flex items-center gap-1 text-[11px] font-black tracking-wider px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse">
              <Flame className="w-3 h-3 text-amber-400" />
              DEUCE
            </span>
          ) : isGamePointA || isGamePointB ? (
            <span className="flex items-center gap-1 text-[11px] font-black tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 animate-pulse">
              <Flame className="w-3 h-3 text-emerald-400" />
              GAME POINT
            </span>
          ) : (
            <span className="text-[11px] font-bold text-slate-400 tracking-wide">
              First to 21 Pts
            </span>
          )}
        </div>

        {/* Right: Swap Ends & Desktop Fullscreen */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setIsSwappedEnds((prev) => !prev)}
            className="h-8 px-2.5 rounded-lg bg-white/10 hover:bg-white/20 active:scale-95 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1 transition-all"
            title="Swap Ends"
          >
            <ArrowLeftRight className="w-3.5 h-3.5" />
            <span className="hidden xs:inline sm:inline">Swap</span>
          </button>

          <button
            type="button"
            onClick={toggleFullscreen}
            className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white hidden sm:flex items-center justify-center transition-all"
            title="Toggle Browser Fullscreen"
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* 50/50 Red & Green Equal Scoring Areas */}
      <div className="flex-1 min-h-0 grid grid-cols-2 divide-x-2 divide-black/90 relative">
        {/* LEFT COURT ZONE */}
        <div
          onClick={() => handleAddPoint(leftTeamKey)}
          className={cn(
            'scoreboard-zone flex flex-col items-center justify-between p-3 sm:p-6 transition-all duration-75 cursor-pointer active:brightness-110 relative group overflow-hidden',
            leftTeamKey === 'teamA'
              ? 'bg-gradient-to-b from-[#4a0808] via-[#5e0a0a] to-[#2b0404] text-red-50'
              : 'bg-gradient-to-b from-[#023126] via-[#064e3b] to-[#02231c] text-emerald-50'
          )}
        >
          {/* Subtle Court Line Boundary */}
          <div className="scoreboard-zone-boundary absolute inset-2 sm:inset-3 border-2 border-white/10 pointer-events-none rounded-2xl" />

          {/* Left Team Header */}
          <div className="scoreboard-team-header w-full text-center z-10 pt-1">
            <span
              className={cn(
                'scoreboard-team-pill inline-block px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-black tracking-widest uppercase mb-1',
                leftTeamKey === 'teamA'
                  ? 'bg-red-500/30 text-red-200 border border-red-400/30'
                  : 'bg-emerald-500/30 text-emerald-200 border border-emerald-400/30'
              )}
            >
              {leftTeamKey === 'teamA' ? 'Team A' : 'Team B'}
            </span>
            <h2 className="scoreboard-player-name text-sm sm:text-xl md:text-2xl font-black text-white px-1 leading-snug line-clamp-2 break-words drop-shadow">
              {leftTeamName}
            </h2>
          </div>

          {/* Huge Score Display */}
          <div className="scoreboard-score-wrapper flex-1 flex flex-col items-center justify-center z-10 my-1 min-h-0">
            <div className="scoreboard-score-text text-7xl sm:text-8xl md:portrait:text-[10rem] lg:portrait:text-[12rem] font-black tracking-tighter leading-none text-white drop-shadow-2xl">
              {leftScore}
            </div>
            <div className="scoreboard-tap-prompt text-[10px] sm:text-xs uppercase tracking-widest font-bold opacity-60 mt-1">
              Tap to +1 Point
            </div>
          </div>

          {/* Left Team Minus Button */}
          <div className="scoreboard-minus-wrapper w-full flex justify-center z-10 pb-1">
            <button
              type="button"
              onClick={(e) => handleMinusPoint(leftTeamKey, e)}
              disabled={leftScore === 0}
              className="scoreboard-minus-btn px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-black/50 hover:bg-black/70 text-white/90 hover:text-white text-xs font-bold flex items-center gap-1 backdrop-blur-md border border-white/15 active:scale-95 disabled:opacity-20 disabled:cursor-not-allowed transition-all"
            >
              <Minus className="w-3.5 h-3.5" />
              <span>-1 Point</span>
            </button>
          </div>
        </div>

        {/* RIGHT COURT ZONE */}
        <div
          onClick={() => handleAddPoint(rightTeamKey)}
          className={cn(
            'scoreboard-zone flex flex-col items-center justify-between p-3 sm:p-6 transition-all duration-75 cursor-pointer active:brightness-110 relative group overflow-hidden',
            rightTeamKey === 'teamA'
              ? 'bg-gradient-to-b from-[#4a0808] via-[#5e0a0a] to-[#2b0404] text-red-50'
              : 'bg-gradient-to-b from-[#023126] via-[#064e3b] to-[#02231c] text-emerald-50'
          )}
        >
          {/* Subtle Court Line Boundary */}
          <div className="scoreboard-zone-boundary absolute inset-2 sm:inset-3 border-2 border-white/10 pointer-events-none rounded-2xl" />

          {/* Right Team Header */}
          <div className="scoreboard-team-header w-full text-center z-10 pt-1">
            <span
              className={cn(
                'scoreboard-team-pill inline-block px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-black tracking-widest uppercase mb-1',
                rightTeamKey === 'teamA'
                  ? 'bg-red-500/30 text-red-200 border border-red-400/30'
                  : 'bg-emerald-500/30 text-emerald-200 border border-emerald-400/30'
              )}
            >
              {rightTeamKey === 'teamA' ? 'Team A' : 'Team B'}
            </span>
            <h2 className="scoreboard-player-name text-sm sm:text-xl md:text-2xl font-black text-white px-1 leading-snug line-clamp-2 break-words drop-shadow">
              {rightTeamName}
            </h2>
          </div>

          {/* Huge Score Display */}
          <div className="scoreboard-score-wrapper flex-1 flex flex-col items-center justify-center z-10 my-1 min-h-0">
            <div className="scoreboard-score-text text-7xl sm:text-8xl md:portrait:text-[10rem] lg:portrait:text-[12rem] font-black tracking-tighter leading-none text-white drop-shadow-2xl">
              {rightScore}
            </div>
            <div className="scoreboard-tap-prompt text-[10px] sm:text-xs uppercase tracking-widest font-bold opacity-60 mt-1">
              Tap to +1 Point
            </div>
          </div>

          {/* Right Team Minus Button */}
          <div className="scoreboard-minus-wrapper w-full flex justify-center z-10 pb-1">
            <button
              type="button"
              onClick={(e) => handleMinusPoint(rightTeamKey, e)}
              disabled={rightScore === 0}
              className="scoreboard-minus-btn px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-black/50 hover:bg-black/70 text-white/90 hover:text-white text-xs font-bold flex items-center gap-1 backdrop-blur-md border border-white/15 active:scale-95 disabled:opacity-20 disabled:cursor-not-allowed transition-all"
            >
              <Minus className="w-3.5 h-3.5" />
              <span>-1 Point</span>
            </button>
          </div>
        </div>
      </div>

      {/* Permanently Visible Bottom Action Bar with Mandatory Save Match Button */}
      <div
        className="scoreboard-bottom-bar shrink-0 z-20 bg-black/95 backdrop-blur-xl border-t border-white/10 px-3 sm:px-6 pt-2 flex items-center justify-between gap-2"
        style={{
          paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom, 0px))',
        }}
      >
        {/* Undo Action */}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleUndo}
          disabled={historyStack.length === 0}
          className="scoreboard-bottom-btn h-10 sm:h-11 px-3 sm:px-4 rounded-xl border-white/20 bg-white/5 hover:bg-white/15 text-white font-bold flex items-center gap-1.5 disabled:opacity-30 text-xs sm:text-sm"
        >
          <RotateCcw className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          <span>Undo</span>
        </Button>

        {/* Live Running Score Summary */}
        <div className="scoreboard-score-summary flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-xl border border-white/10 text-xs sm:text-sm">
          <span className="text-slate-400 font-semibold hidden xs:inline">Score:</span>
          <span className="font-black text-white text-sm sm:text-base tracking-wide">
            {scoreA} - {scoreB}
          </span>
        </div>

        {/* MANDATORY SAVE MATCH BUTTON: Permanently Visible, Uncluttered, Accessible */}
        <Button
          type="button"
          onClick={handleFinalSave}
          disabled={saving || (scoreA === 0 && scoreB === 0) || scoreA === scoreB}
          className="scoreboard-bottom-btn h-10 sm:h-11 px-4 sm:px-6 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 text-white font-extrabold text-xs sm:text-sm shadow-lg shadow-emerald-500/25 flex items-center gap-1.5 disabled:opacity-40"
        >
          {saving ? (
            <>
              <Loader2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin" />
              <span>Saving...</span>
            </>
          ) : (
            <>
              <Save className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>Save Match 🏸</span>
            </>
          )}
        </Button>
      </div>

      {/* Game Completed Modal Dialog */}
      {gameDialog && (
        <div className="fixed inset-0 z-[100000] bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
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

  return createPortal(content, document.body);
}
