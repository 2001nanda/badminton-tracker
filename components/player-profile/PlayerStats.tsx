'use client';

import { memo } from 'react';
import { Card } from '@/components/ui/card';
import { Player, PlayerExtendedStats } from '@/lib/types';
import { Trophy, Target, Flame, TrendingUp, Zap, Award, Activity, ShieldAlert, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PlayerStatsProps {
  player: Player;
  stats: PlayerExtendedStats;
}

export const PlayerStats = memo(function PlayerStats({ player, stats }: PlayerStatsProps) {
  return (
    <div className="space-y-6 mb-8">
      {/* Recent Form Banner */}
      <div className="glass-card rounded-2xl p-5 border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
            <Activity className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Recent Form</h3>
            <p className="text-xs text-slate-400">Last {stats.recentForm.length} matches (newest first)</p>
          </div>
        </div>

        {stats.recentForm.length === 0 ? (
          <span className="text-xs text-slate-500 italic">No matches recorded yet</span>
        ) : (
          <div className="flex items-center gap-2">
            {stats.recentForm.map((result, idx) => (
              <div
                key={idx}
                className={cn(
                  'w-9 h-9 rounded-xl font-bold flex items-center justify-center text-sm shadow-md transition-all',
                  result === 'W'
                    ? 'bg-gradient-to-br from-emerald-500 to-emerald-700 text-white shadow-emerald-500/20'
                    : 'bg-gradient-to-br from-red-500 to-red-700 text-white shadow-red-500/20'
                )}
                title={result === 'W' ? 'Won Match' : 'Lost Match'}
              >
                {result}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Primary KPI Grid */}
      <div>
        <h2 className="text-base font-semibold text-slate-300 mb-3 flex items-center gap-2">
          <Trophy className="w-4 h-4 text-emerald-400" />
          Performance Overview
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <Card className="border-white/10 bg-white/5 backdrop-blur-sm p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-400">Matches Played</span>
              <Trophy className="w-4 h-4 text-blue-400" />
            </div>
            <p className="text-2xl sm:text-3xl font-extrabold text-white">{stats.totalMatches}</p>
            <p className="text-[11px] text-slate-500 mt-0.5">Career total</p>
          </Card>

          <Card className="border-white/10 bg-white/5 backdrop-blur-sm p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-400">Matches Won</span>
              <Target className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-2xl sm:text-3xl font-extrabold text-emerald-400">{stats.wins}</p>
            <p className="text-[11px] text-slate-500 mt-0.5">{stats.winPercentage}% Win Rate</p>
          </Card>

          <Card className="border-white/10 bg-white/5 backdrop-blur-sm p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-400">Matches Lost</span>
              <TrendingUp className="w-4 h-4 text-red-400" />
            </div>
            <p className="text-2xl sm:text-3xl font-extrabold text-red-400">{stats.losses}</p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              {stats.totalMatches > 0 ? (100 - stats.winPercentage) : 0}% Loss Rate
            </p>
          </Card>

          <Card className="border-white/10 bg-white/5 backdrop-blur-sm p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-400">Winning %</span>
              <Award className="w-4 h-4 text-yellow-400" />
            </div>
            <p className="text-2xl sm:text-3xl font-extrabold text-yellow-400">{stats.winPercentage}%</p>
            <div className="w-full bg-white/10 h-1.5 rounded-full mt-2 overflow-hidden">
              <div
                className="bg-yellow-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, Math.max(0, stats.winPercentage))}%` }}
              />
            </div>
          </Card>
        </div>
      </div>

      {/* Streaks Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Card className="border-white/10 bg-white/5 p-4 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 block mb-1">Current Streak</span>
            <span
              className={cn(
                'text-xl font-bold',
                stats.currentStreak > 0
                  ? 'text-emerald-400'
                  : stats.currentStreak < 0
                  ? 'text-red-400'
                  : 'text-slate-400'
              )}
            >
              {stats.currentStreak > 0
                ? `${stats.currentStreak} Wins 🔥`
                : stats.currentStreak < 0
                ? `${Math.abs(stats.currentStreak)} Losses`
                : 'No active streak'}
            </span>
          </div>
          <Flame
            className={cn(
              'w-6 h-6',
              stats.currentStreak > 0
                ? 'text-yellow-400'
                : stats.currentStreak < 0
                ? 'text-red-400'
                : 'text-slate-600'
            )}
          />
        </Card>

        <Card className="border-white/10 bg-white/5 p-4 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 block mb-1">Longest Win Streak</span>
            <span className="text-xl font-bold text-emerald-400">
              {stats.longestWinningStreak} {stats.longestWinningStreak === 1 ? 'Match' : 'Matches'}
            </span>
          </div>
          <Zap className="w-6 h-6 text-emerald-400" />
        </Card>

        <Card className="border-white/10 bg-white/5 p-4 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 block mb-1">Longest Loss Streak</span>
            <span className="text-xl font-bold text-red-400">
              {stats.longestLosingStreak} {stats.longestLosingStreak === 1 ? 'Match' : 'Matches'}
            </span>
          </div>
          <ShieldAlert className="w-6 h-6 text-red-400" />
        </Card>
      </div>

      {/* Advanced Points Analytics & Singles vs Doubles */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Points Scoring Card */}
        <Card className="border-white/10 bg-white/5 p-5">
          <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
            <Zap className="w-4 h-4 text-emerald-400" />
            Points Scoring Dynamics
          </h3>

          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-black/30 rounded-xl p-3 border border-white/5">
              <span className="text-xs text-slate-400 block mb-1">Points Scored</span>
              <div className="flex items-center gap-1.5">
                <ArrowUpRight className="w-4 h-4 text-emerald-400" />
                <span className="text-xl font-bold text-emerald-400">{stats.totalPointsScored}</span>
              </div>
            </div>

            <div className="bg-black/30 rounded-xl p-3 border border-white/5">
              <span className="text-xs text-slate-400 block mb-1">Points Conceded</span>
              <div className="flex items-center gap-1.5">
                <ArrowDownRight className="w-4 h-4 text-red-400" />
                <span className="text-xl font-bold text-red-400">{stats.totalPointsConceded}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-white/10 text-xs">
            <span className="text-slate-400">Net Points Difference:</span>
            <span
              className={cn(
                'font-bold text-sm',
                stats.pointsDifference >= 0 ? 'text-emerald-400' : 'text-red-400'
              )}
            >
              {stats.pointsDifference >= 0 ? `+${stats.pointsDifference}` : stats.pointsDifference}
            </span>
          </div>
          <div className="flex items-center justify-between pt-2 text-xs">
            <span className="text-slate-400">Average Points / Set:</span>
            <span className="font-bold text-white text-sm">{stats.averagePointsPerSet} pts</span>
          </div>
        </Card>

        {/* Singles vs Doubles Comparison */}
        <Card className="border-white/10 bg-white/5 p-5">
          <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
            <Award className="w-4 h-4 text-blue-400" />
            Singles vs Doubles Record
          </h3>

          <div className="space-y-4">
            {/* Singles */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-semibold text-white">Singles ({stats.singlesMatches} matches)</span>
                <span className="text-blue-400 font-bold">
                  {stats.singlesWins}W - {stats.singlesLosses}L ({stats.singlesWinPercentage}%)
                </span>
              </div>
              <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-blue-500 h-full rounded-full transition-all"
                  style={{ width: `${Math.min(100, Math.max(0, stats.singlesWinPercentage))}%` }}
                />
              </div>
            </div>

            {/* Doubles */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-semibold text-white">Doubles ({stats.doublesMatches} matches)</span>
                <span className="text-emerald-400 font-bold">
                  {stats.doublesWins}W - {stats.doublesLosses}L ({stats.doublesWinPercentage}%)
                </span>
              </div>
              <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-500 h-full rounded-full transition-all"
                  style={{ width: `${Math.min(100, Math.max(0, stats.doublesWinPercentage))}%` }}
                />
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
});
