'use client';

import { forwardRef } from 'react';
import { SummaryCardData } from '@/lib/utils/summaryCardUtils';

interface SummaryCardProps {
  data: SummaryCardData;
  format?: 'square' | 'portrait';
}

export const SummaryCard = forwardRef<HTMLDivElement, SummaryCardProps>(
  function SummaryCard({ data, format = 'square' }, ref) {
    const isPortrait = format === 'portrait';
    const cardWidth = 1080;
    const cardHeight = isPortrait ? 1350 : 1080;

    // Get top 3 for podium
    const top3 = data.playerBreakdown.slice(0, 3);
    const remaining = data.playerBreakdown.slice(3);

    // Podium order: [2nd, 1st, 3rd]
    const podiumOrder =
      top3.length >= 3
        ? [top3[1], top3[0], top3[2]]
        : top3.length === 2
        ? [top3[1], top3[0]]
        : top3;

    return (
      <div
        ref={ref}
        style={{
          width: `${cardWidth}px`,
          height: `${cardHeight}px`,
          fontFamily: 'system-ui, -apple-system, sans-serif',
        }}
        className="relative overflow-hidden bg-[#050B15] text-white"
      >
        {/* Outer border glow */}
        <div
          className="absolute inset-0 rounded-[32px] pointer-events-none"
          style={{
            border: '1.5px solid rgba(255,255,255,0.08)',
            boxShadow: 'inset 0 0 60px rgba(16,185,129,0.03)',
          }}
        />

        {/* Background effects */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[-100px] right-[-100px] w-[400px] h-[400px] bg-emerald-500/[0.04] rounded-full blur-[100px]" />
          <div className="absolute bottom-[-100px] left-[-100px] w-[400px] h-[400px] bg-blue-500/[0.03] rounded-full blur-[100px]" />
        </div>

        {/* Content */}
        <div className="relative z-10 h-full flex flex-col px-12 py-10">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center gap-4 mb-4">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center"
                style={{
                  background: 'rgba(16,185,129,0.15)',
                  border: '1px solid rgba(16,185,129,0.4)',
                  boxShadow: '0 0 24px rgba(16,185,129,0.3)',
                }}
              >
                <span className="text-3xl">🏸</span>
              </div>
              <h1 className="text-5xl font-extrabold tracking-tight">
                <span className="text-white">Badminton </span>
                <span
                  style={{
                    background: 'linear-gradient(to right, #34D399, #FACC15)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  Summary
                </span>
              </h1>
            </div>

            {/* Date pill */}
            <div
              className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full"
              style={{
                background: 'rgba(16,185,129,0.06)',
                border: '1px solid rgba(16,185,129,0.35)',
                boxShadow: '0 0 16px rgba(16,185,129,0.12)',
              }}
            >
              <span className="text-emerald-400 text-lg">📅</span>
              <span className="text-white font-semibold text-lg">{data.date}</span>
              <span
                className="px-3 py-1 rounded-lg text-sm font-medium"
                style={{ background: 'rgba(255,255,255,0.1)', color: '#94A3B8' }}
              >
                {data.dayOfWeek}
              </span>
            </div>

            <p className="text-slate-500 text-sm mt-3 flex items-center gap-2">
              <span>📅</span> Summary for this date only
            </p>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-4 gap-4 mb-8">
            <StatBox icon="🎯" value={data.totalMatches} label="MATCHES" color="emerald" />
            <StatBox icon="👥" value={data.totalPlayers} label="PLAYERS" color="blue" />
            <StatBox icon="🏆" value={data.totalWins} label="TOTAL WINS" color="yellow" />
            <StatBox icon="📊" value={data.averageMatchesPerPlayer} label="AVG WINS/PLAYER" color="purple" />
          </div>

          {/* Podium Section */}
          {top3.length > 0 && (
            <div className="flex items-end justify-center gap-5 mb-8">
              {podiumOrder.map((player, idx) => {
                let rank: number;
                if (top3.length >= 3) {
                  rank = [2, 1, 3][idx];
                } else if (top3.length === 2) {
                  rank = [2, 1][idx];
                } else {
                  rank = 1;
                }
                return (
                  <PodiumCard key={player.id} player={player} rank={rank} />
                );
              })}
            </div>
          )}

          {/* Rankings Table */}
          {remaining.length > 0 && (
            <div
              className="rounded-2xl overflow-hidden mb-6 flex-1"
              style={{
                border: '1px solid rgba(255,255,255,0.08)',
                background: 'rgba(255,255,255,0.02)',
              }}
            >
              {/* Table Header */}
              <div
                className="grid grid-cols-[70px_1fr_100px_80px_80px_90px] px-6 py-3"
                style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}
              >
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Rank</span>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Player</span>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider text-center">Played</span>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider text-center">Wins</span>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider text-center">Losses</span>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Win %</span>
              </div>
              {/* Table Rows */}
              {remaining.slice(0, isPortrait ? 8 : 5).map((player) => (
                <div
                  key={player.id}
                  className="grid grid-cols-[70px_1fr_100px_80px_80px_90px] px-6 py-4 items-center"
                  style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                >
                  <span className="text-lg font-bold text-slate-300">{player.rank}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-lg">🏸</span>
                    <span className="text-base font-semibold text-white">{player.name}</span>
                  </div>
                  <span className="text-base text-slate-300 text-center">{player.played}</span>
                  <span className="text-base text-emerald-400 font-bold text-center">{player.wins}</span>
                  <span className="text-base text-red-400 font-bold text-center">{player.losses}</span>
                  <span className="text-base text-white font-bold text-right">{player.winPercentage}%</span>
                </div>
              ))}
            </div>
          )}

          {/* Footer */}
          <div
            className="mt-auto rounded-2xl px-6 py-4 flex items-center gap-3"
            style={{
              border: '1px solid rgba(255,255,255,0.08)',
              background: 'rgba(255,255,255,0.02)',
            }}
          >
            <span className="text-emerald-400 text-xl">ⓘ</span>
            <p className="text-sm text-slate-400">
              All stats are calculated based on matches played on{' '}
              <span className="text-emerald-400 font-semibold">{data.date}</span>
            </p>
          </div>
        </div>
      </div>
    );
  }
);

// --- Sub-components ---

function StatBox({
  icon,
  value,
  label,
  color,
}: {
  icon: string;
  value: number | string;
  label: string;
  color: 'emerald' | 'blue' | 'yellow' | 'purple';
}) {
  const borderColors = {
    emerald: 'rgba(16,185,129,0.25)',
    blue: 'rgba(59,130,246,0.25)',
    yellow: 'rgba(234,179,8,0.25)',
    purple: 'rgba(168,85,247,0.25)',
  };

  const iconColors = {
    emerald: '#34D399',
    blue: '#60A5FA',
    yellow: '#FBBF24',
    purple: '#A78BFA',
  };

  return (
    <div
      className="rounded-2xl p-5 flex flex-col items-center gap-2 text-center"
      style={{
        border: `1px solid ${borderColors[color]}`,
        background: 'rgba(255,255,255,0.03)',
      }}
    >
      <span className="text-3xl" style={{ filter: `drop-shadow(0 0 6px ${iconColors[color]})` }}>
        {icon}
      </span>
      <span className="text-4xl font-extrabold text-white">{value}</span>
      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.15em]">
        {label}
      </span>
    </div>
  );
}

function PodiumCard({
  player,
  rank,
}: {
  player: { name: string; wins: number; losses: number; played: number; winPercentage: number };
  rank: number;
}) {
  const isFirst = rank === 1;
  const isSecond = rank === 2;

  const borderColor = isFirst
    ? 'rgba(234,179,8,0.6)'
    : isSecond
    ? 'rgba(96,165,250,0.5)'
    : 'rgba(249,115,22,0.5)';

  const glowColor = isFirst
    ? '0 0 30px rgba(234,179,8,0.25)'
    : isSecond
    ? '0 0 20px rgba(96,165,250,0.15)'
    : '0 0 20px rgba(249,115,22,0.15)';

  const medalEmoji = isFirst ? '🥇' : isSecond ? '🥈' : '🥉';
  const crownEmoji = isFirst ? '👑' : null;

  const winsColor = isFirst ? '#FBBF24' : isSecond ? '#60A5FA' : '#F97316';

  const cardWidth = isFirst ? '220px' : '180px';
  const cardPadding = isFirst ? 'py-8 px-5' : 'py-6 px-4';
  const marginTop = isFirst ? '0px' : '32px';

  return (
    <div
      className={`relative flex flex-col items-center rounded-2xl ${cardPadding}`}
      style={{
        width: cardWidth,
        marginTop,
        border: `1.5px solid ${borderColor}`,
        background: 'rgba(255,255,255,0.03)',
        boxShadow: glowColor,
      }}
    >
      {/* Crown */}
      {crownEmoji && (
        <span className="absolute -top-7 text-4xl">{crownEmoji}</span>
      )}

      {/* Medal */}
      <span className={`text-5xl ${isFirst ? 'mt-2' : ''}`}>{medalEmoji}</span>

      {/* Name */}
      <h3
        className="font-extrabold text-white mt-3 text-center truncate w-full"
        style={{ fontSize: isFirst ? '22px' : '18px' }}
      >
        {player.name}
      </h3>

      {/* Wins */}
      <p
        className="font-extrabold mt-2"
        style={{ color: winsColor, fontSize: isFirst ? '24px' : '20px' }}
      >
        {player.wins} WINS
      </p>

      {/* Win Rate */}
      <p className="text-slate-400 text-sm mt-1">
        {player.winPercentage}% Win Rate
      </p>

      {/* Stats Row */}
      <div
        className="flex items-center gap-3 mt-4 pt-3 w-full justify-center"
        style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}
      >
        <span className="text-emerald-400 text-sm font-bold">{player.wins}W</span>
        <span className="text-red-400 text-sm font-bold">{player.losses}L</span>
        <span className="text-slate-400 text-sm">{player.played} Played</span>
      </div>
    </div>
  );
}
