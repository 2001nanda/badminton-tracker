'use client';

import { forwardRef } from 'react';
import { SummaryCardData } from '@/lib/utils/summaryCardUtils';
import { Trophy, Users, Target, Flame, Crown, Activity } from 'lucide-react';

interface SummaryCardProps {
  data: SummaryCardData;
  format?: 'square' | 'portrait';
}

export const SummaryCard = forwardRef<HTMLDivElement, SummaryCardProps>(
  function SummaryCard({ data, format = 'square' }, ref) {
    const isPortrait = format === 'portrait';
    const cardWidth = 1080;
    const cardHeight = isPortrait ? 1350 : 1080;

    return (
      <div
        ref={ref}
        style={{
          width: `${cardWidth}px`,
          height: `${cardHeight}px`,
          fontFamily: 'system-ui, -apple-system, sans-serif',
        }}
        className="relative overflow-hidden bg-gradient-to-br from-[#0B0F14] via-[#111827] to-[#0B0F14] text-white p-12"
      >
        {/* Background decoration */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/3 rounded-full blur-3xl" />
          {/* Grid pattern */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage:
                'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
              backgroundSize: '40px 40px',
            }}
          />
        </div>

        {/* Content */}
        <div className="relative z-10 h-full flex flex-col">
          {/* Header */}
          <CardHeader date={data.date} dayOfWeek={data.dayOfWeek} />

          {/* Overall Stats */}
          <OverallStats data={data} />

          {/* Top Performers */}
          <TopPerformersSection data={data} />

          {/* Player Rankings Table */}
          <PlayerRankingsTable players={data.playerBreakdown} isPortrait={isPortrait} />

          {/* Additional Insights */}
          <InsightsSection data={data} />

          {/* Footer */}
          <CardFooter />
        </div>
      </div>
    );
  }
);

function CardHeader({ date, dayOfWeek }: { date: string; dayOfWeek: string }) {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-4 mb-3">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
          <span className="text-2xl">🏸</span>
        </div>
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight">
            <span className="bg-gradient-to-r from-emerald-400 to-yellow-400 bg-clip-text text-transparent">
              Today&apos;s Badminton Summary
            </span>
          </h1>
        </div>
      </div>
      <div className="flex items-center gap-3 ml-16">
        <span className="text-lg text-slate-400">{dayOfWeek}</span>
        <span className="text-slate-600">•</span>
        <span className="text-lg text-slate-400">{date}</span>
      </div>
    </div>
  );
}

function OverallStats({ data }: { data: SummaryCardData }) {
  const stats = [
    { label: 'Matches', value: data.totalMatches, icon: Target, color: 'emerald' },
    { label: 'Players', value: data.totalPlayers, icon: Users, color: 'blue' },
    { label: 'Total Wins', value: data.totalWins, icon: Trophy, color: 'yellow' },
    { label: 'Avg/Player', value: data.averageMatchesPerPlayer, icon: Activity, color: 'purple' },
  ];

  return (
    <div className="grid grid-cols-4 gap-4 mb-8">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm p-5 text-center"
        >
          <stat.icon className={`w-6 h-6 mx-auto mb-2 text-${stat.color}-400`} />
          <p className="text-3xl font-bold text-white">{stat.value}</p>
          <p className="text-xs text-slate-400 mt-1 uppercase tracking-wider">{stat.label}</p>
        </div>
      ))}
    </div>
  );
}

function TopPerformersSection({ data }: { data: SummaryCardData }) {
  const { topPerformers } = data;
  const performers = [
    {
      label: 'Top Player',
      name: topPerformers.topPlayer?.name || '—',
      detail: topPerformers.topPlayer ? `${topPerformers.topPlayer.wins} wins` : '',
      icon: Crown,
    },
    {
      label: 'Most Wins',
      name: topPerformers.mostWins?.name || '—',
      detail: topPerformers.mostWins ? `${topPerformers.mostWins.wins} wins` : '',
      icon: Trophy,
    },
    {
      label: 'Best Win %',
      name: topPerformers.bestWinPercentage?.name || '—',
      detail: topPerformers.bestWinPercentage
        ? `${topPerformers.bestWinPercentage.percentage}%`
        : '',
      icon: Target,
    },
    {
      label: 'Most Active',
      name: topPerformers.mostMatchesPlayed?.name || '—',
      detail: topPerformers.mostMatchesPlayed
        ? `${topPerformers.mostMatchesPlayed.matches} matches`
        : '',
      icon: Flame,
    },
  ];

  return (
    <div className="mb-8">
      <h2 className="text-xl font-bold text-emerald-400 mb-4 flex items-center gap-2">
        <Crown className="w-5 h-5" />
        Top Performers
      </h2>
      <div className="grid grid-cols-4 gap-3">
        {performers.map((p) => (
          <div
            key={p.label}
            className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4"
          >
            <p className="text-xs text-slate-400 uppercase tracking-wider mb-2">{p.label}</p>
            <p className="text-base font-bold text-white truncate">{p.name}</p>
            <p className="text-sm text-emerald-400 mt-1">{p.detail}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function PlayerRankingsTable({
  players,
  isPortrait,
}: {
  players: SummaryCardData['playerBreakdown'];
  isPortrait: boolean;
}) {
  // Show max 8 players in square format, 12 in portrait
  const maxPlayers = isPortrait ? 12 : 8;
  const displayPlayers = players.slice(0, maxPlayers);

  return (
    <div className="mb-8 flex-1">
      <h2 className="text-xl font-bold text-emerald-400 mb-4 flex items-center gap-2">
        <Users className="w-5 h-5" />
        Player Rankings
      </h2>
      <div className="rounded-xl border border-white/10 overflow-hidden">
        {/* Header row */}
        <div className="grid grid-cols-[40px_1fr_80px_80px_80px_80px] px-5 py-3 bg-white/5 border-b border-white/10">
          <span className="text-xs font-semibold text-slate-400 uppercase">#</span>
          <span className="text-xs font-semibold text-slate-400 uppercase">Player</span>
          <span className="text-xs font-semibold text-slate-400 uppercase text-center">Played</span>
          <span className="text-xs font-semibold text-slate-400 uppercase text-center">Won</span>
          <span className="text-xs font-semibold text-slate-400 uppercase text-center">Lost</span>
          <span className="text-xs font-semibold text-slate-400 uppercase text-center">Win%</span>
        </div>
        {/* Player rows */}
        {displayPlayers.map((player, idx) => (
          <div
            key={player.id}
            className={`grid grid-cols-[40px_1fr_80px_80px_80px_80px] px-5 py-3 items-center ${
              idx % 2 === 0 ? 'bg-white/[0.02]' : ''
            } ${idx === 0 ? 'border-l-2 border-l-yellow-400' : ''}`}
          >
            <span
              className={`text-sm font-bold ${
                player.rank === 1
                  ? 'text-yellow-400'
                  : player.rank === 2
                  ? 'text-slate-300'
                  : player.rank === 3
                  ? 'text-orange-400'
                  : 'text-slate-500'
              }`}
            >
              {player.rank === 1 ? '🥇' : player.rank === 2 ? '🥈' : player.rank === 3 ? '🥉' : player.rank}
            </span>
            <span className="text-sm font-semibold text-white truncate">{player.name}</span>
            <span className="text-sm text-slate-300 text-center">{player.played}</span>
            <span className="text-sm text-emerald-400 font-semibold text-center">{player.wins}</span>
            <span className="text-sm text-red-400 text-center">{player.losses}</span>
            <span className="text-sm font-bold text-white text-center">{player.winPercentage}%</span>
          </div>
        ))}
      </div>
      {players.length > maxPlayers && (
        <p className="text-xs text-slate-500 mt-2 text-center">
          + {players.length - maxPlayers} more players
        </p>
      )}
    </div>
  );
}

function InsightsSection({ data }: { data: SummaryCardData }) {
  const { insights } = data;
  const items = [
    insights.longestWinningStreak && {
      label: '🔥 Longest Streak',
      value: `${insights.longestWinningStreak.name} (${insights.longestWinningStreak.streak} wins)`,
    },
    insights.closestCompetition && {
      label: '⚔️ Closest Battle',
      value: insights.closestCompetition,
    },
    insights.highestWinRate && {
      label: '🎯 Highest Win Rate',
      value: `${insights.highestWinRate.name} (${insights.highestWinRate.rate}%)`,
    },
    {
      label: '👥 Total Players',
      value: `${insights.totalDistinctPlayers} players competed today`,
    },
  ].filter(Boolean) as { label: string; value: string }[];

  if (items.length === 0) return null;

  return (
    <div className="mb-6">
      <div className="flex flex-wrap gap-3">
        {items.map((item) => (
          <div
            key={item.label}
            className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 flex items-center gap-2"
          >
            <span className="text-xs text-slate-400">{item.label}:</span>
            <span className="text-xs font-semibold text-white">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function CardFooter() {
  return (
    <div className="mt-auto pt-4 border-t border-white/10 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <span className="text-lg">🏸</span>
        <span className="text-sm font-semibold text-slate-400">Badminton Tracker</span>
      </div>
      <span className="text-xs text-slate-600">Generated with Badminton Tracker App</span>
    </div>
  );
}
