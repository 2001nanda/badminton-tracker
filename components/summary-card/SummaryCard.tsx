'use client';

import { forwardRef } from 'react';
import {
  SummaryCardData,
  DuoSummary,
  PlayerSummary,
} from '@/lib/utils/summaryCardUtils';

interface SummaryCardProps {
  data: SummaryCardData;
  format?: 'square' | 'portrait';
}

export const SummaryCard = forwardRef<HTMLDivElement, SummaryCardProps>(
  function SummaryCard({ data, format = 'square' }, ref) {
    const isPortrait = format === 'portrait';
    const isDoubles = data.mode === 'doubles';
    const allPlayersList = isDoubles ? data.individualPlayerStats : data.playerBreakdown;
    const allDuosList = isDoubles ? data.duoBreakdown : [];

    const playerCount = allPlayersList.length;
    const duoCount = isDoubles ? allDuosList.length : playerCount;
    const maxTableRows = Math.max(playerCount, duoCount);

    // Dynamic height calculation:
    // Base square is 1080px, base portrait is 1350px.
    // If table rows exceed 4, allocate additional height (~38px per additional row) so all rows fit comfortably without clipping!
    const extraRows = Math.max(0, maxTableRows - 4);
    const extraHeight = extraRows * 38;

    const baseHeight = isPortrait ? 1350 : 1080;
    const cardWidth = 1080;
    const cardHeight = baseHeight + extraHeight;

    return (
      <div
        ref={ref}
        style={{
          width: `${cardWidth}px`,
          height: `${cardHeight}px`,
          fontFamily: 'system-ui, -apple-system, sans-serif',
        }}
        className="relative overflow-hidden bg-[#070B13] text-white select-none flex flex-col justify-between p-9"
      >
        {/* Outer border glow */}
        <div
          className="absolute inset-0 rounded-[32px] pointer-events-none"
          style={{
            border: '1.5px solid rgba(255,255,255,0.08)',
            boxShadow: 'inset 0 0 80px rgba(16,185,129,0.03)',
          }}
        />

        {/* Ambient background glows */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[-80px] right-[-80px] w-[500px] h-[500px] bg-emerald-500/[0.04] rounded-full blur-[120px]" />
          <div className="absolute bottom-[-80px] left-[-80px] w-[500px] h-[500px] bg-blue-500/[0.04] rounded-full blur-[120px]" />
          <div className="absolute top-[28%] left-[30%] w-[450px] h-[350px] bg-amber-500/[0.03] rounded-full blur-[130px]" />
        </div>

        {/* ==================================================================== */}
        {/* TOP HEADER */}
        {/* ==================================================================== */}
        <div className="relative z-10 flex flex-col items-center justify-center text-center">
          {/* Main Title */}
          <h1 className="text-[34px] font-extrabold tracking-tight flex items-center justify-center gap-2.5">
            <span className="text-white">Badminton</span>
            <span className="text-[#10B981]">Summary</span>
          </h1>

          {/* Subtitle Pills */}
          <div className="flex items-center gap-2 mt-2">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#111724] border border-white/10 text-xs font-semibold text-slate-300 shadow-sm">
              <span className="text-sm">📅</span>
              <span>{data.date}</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#111724] border border-white/10 text-xs font-semibold text-slate-300 shadow-sm">
              <span className="text-sm">🗓</span>
              <span>{data.dayOfWeek}</span>
            </div>
            <div className="flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#063726] border border-[#10B981]/40 text-xs font-bold text-[#34D399] shadow-sm">
              <span className="text-sm">{isDoubles ? '👥' : '👤'}</span>
              <span>{isDoubles ? 'Doubles' : 'Singles'}</span>
            </div>
          </div>
        </div>

        {/* ==================================================================== */}
        {/* TOP STATS ROW (4 CARDS) */}
        {/* ==================================================================== */}
        <div className="relative z-10 grid grid-cols-4 gap-4 mt-4">
          {isDoubles ? (
            <>
              <TopStatCard
                icon={<TargetIcon />}
                value={data.totalMatches}
                label="MATCHES"
                glowColor="rgba(239, 68, 68, 0.2)"
              />
              <TopStatCard
                icon={<PlayersIcon />}
                value={data.totalPlayers}
                label="PLAYERS"
                glowColor="rgba(59, 130, 246, 0.2)"
              />
              <TopStatCard
                icon={<DuosIcon />}
                value={data.totalDuos}
                label="DUOS"
                glowColor="rgba(168, 85, 247, 0.2)"
              />
              <TopStatCard
                icon={<TrophyIcon />}
                value={data.totalTeamWins}
                label="TEAM WINS"
                glowColor="rgba(234, 179, 8, 0.2)"
              />
            </>
          ) : (
            <>
              <TopStatCard
                icon={<TargetIcon />}
                value={data.totalMatches}
                label="MATCHES"
                glowColor="rgba(239, 68, 68, 0.2)"
              />
              <TopStatCard
                icon={<PlayersIcon />}
                value={data.totalPlayers}
                label="PLAYERS"
                glowColor="rgba(59, 130, 246, 0.2)"
              />
              <TopStatCard
                icon={<TrophyIcon />}
                value={data.totalWins}
                label="TOTAL WINS"
                glowColor="rgba(234, 179, 8, 0.2)"
              />
              <TopStatCard
                icon={<DuosIcon />}
                value={data.averageMatchesPerPlayer}
                label="AVG WINS/PLAYER"
                glowColor="rgba(168, 85, 247, 0.2)"
              />
            </>
          )}
        </div>

        {/* ==================================================================== */}
        {/* CENTER PODIUM SECTION */}
        {/* ==================================================================== */}
        <div className="relative z-10 mt-5 mb-3 flex items-center justify-center">
          {isDoubles ? (
            <DoublesPodium duoBreakdown={data.duoBreakdown} />
          ) : (
            <SinglesPodium playerBreakdown={data.playerBreakdown} />
          )}
        </div>

        {/* ==================================================================== */}
        {/* BOTTOM 3-COLUMN SECTION */}
        {/* ==================================================================== */}
        <div className="relative z-10 grid grid-cols-[390px_1fr_1fr] gap-3.5">
          {/* Column 1: Duo Standings / Player Standings Table */}
          <div className="bg-[#0D131F]/90 rounded-2xl p-3 border border-white/10 flex flex-col justify-between shadow-md">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-2">
                {isDoubles ? 'DUO STANDINGS TABLE' : 'PLAYER STANDINGS'}
              </h3>
              <div className="grid grid-cols-[24px_1fr_36px_30px_30px_42px] text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 px-1">
                <span>Rank</span>
                <span>{isDoubles ? 'Duo Team' : 'Player'}</span>
                <span className="text-center">Played</span>
                <span className="text-center">Wins</span>
                <span className="text-center">Losses</span>
                <span className="text-right">Win %</span>
              </div>

              <div className="space-y-1.5">
                {isDoubles
                  ? data.duoBreakdown.map((duo) => (
                      <div
                        key={duo.id}
                        className="grid grid-cols-[24px_1fr_36px_30px_30px_42px] items-center text-xs px-1 py-1 rounded-lg bg-white/[0.02]"
                      >
                        <div className="flex items-center">
                          {duo.rank === 1 ? (
                            <span className="text-amber-400 text-sm">👑</span>
                          ) : duo.rank === 2 ? (
                            <span className="text-blue-400 text-sm">🥈</span>
                          ) : duo.rank === 3 ? (
                            <span className="text-orange-400 text-sm">🥉</span>
                          ) : (
                            <span className="text-slate-400 font-bold text-[11px] ml-0.5">{duo.rank}</span>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 min-w-0 pr-1">
                          <div className="flex items-center -space-x-1 flex-shrink-0">
                            <PlayerAvatarMini color={duo.rank === 1 ? 'emerald' : duo.rank === 2 ? 'blue' : 'orange'} />
                            <PlayerAvatarMini color={duo.rank === 1 ? 'amber' : duo.rank === 2 ? 'cyan' : 'amber'} />
                          </div>
                          <span className="font-bold text-white text-[12px] leading-tight">
                            {duo.duoName}
                          </span>
                        </div>
                        <span className="text-slate-300 text-center font-medium">{duo.played}</span>
                        <span className="text-emerald-400 text-center font-bold">{duo.wins}</span>
                        <span className="text-red-400 text-center font-bold">{duo.losses}</span>
                        <span className="text-white text-right font-bold">{duo.winPercentage}%</span>
                      </div>
                    ))
                  : data.playerBreakdown.map((p) => (
                      <div
                        key={p.id}
                        className="grid grid-cols-[24px_1fr_36px_30px_30px_42px] items-center text-xs px-1 py-1 rounded-lg bg-white/[0.02]"
                      >
                        <div className="flex items-center">
                          {p.rank === 1 ? (
                            <span className="text-amber-400 text-sm">👑</span>
                          ) : p.rank === 2 ? (
                            <span className="text-blue-400 text-sm">🥈</span>
                          ) : p.rank === 3 ? (
                            <span className="text-orange-400 text-sm">🥉</span>
                          ) : (
                            <span className="text-slate-400 font-bold text-[11px] ml-0.5">{p.rank}</span>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 min-w-0 pr-1">
                          <PlayerAvatarMini color={p.rank === 1 ? 'emerald' : p.rank === 2 ? 'blue' : 'orange'} />
                          <span className="font-bold text-white text-[12px] leading-tight">{p.name}</span>
                        </div>
                        <span className="text-slate-300 text-center font-medium">{p.played}</span>
                        <span className="text-emerald-400 text-center font-bold">{p.wins}</span>
                        <span className="text-red-400 text-center font-bold">{p.losses}</span>
                        <span className="text-white text-right font-bold">{p.winPercentage}%</span>
                      </div>
                    ))}
              </div>
            </div>
          </div>

          {/* Column 2: Individual Player Stats (Dynamically renders EVERY participating player) */}
          <div className="bg-[#0D131F]/90 rounded-2xl p-3 border border-white/10 flex flex-col justify-between shadow-md">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-2">
                INDIVIDUAL PLAYER STATS
              </h3>
              <div className="grid grid-cols-[1fr_36px_30px_30px_42px] text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 px-1">
                <span>Player</span>
                <span className="text-center">Played</span>
                <span className="text-center">Wins</span>
                <span className="text-center">Losses</span>
                <span className="text-right">Win %</span>
              </div>

              <div className="space-y-1.5">
                {allPlayersList.map((p) => (
                  <div
                    key={p.id}
                    className="grid grid-cols-[1fr_36px_30px_30px_42px] items-center text-xs px-1 py-1 rounded-lg bg-white/[0.02]"
                  >
                    <div className="flex items-center gap-1.5 min-w-0 pr-1">
                      <span className="text-slate-400 text-xs flex-shrink-0">🏸</span>
                      <span className="font-semibold text-white text-[11.5px] leading-tight">{p.name}</span>
                    </div>
                    <span className="text-slate-300 text-center font-medium">{p.played}</span>
                    <span className="text-emerald-400 text-center font-bold">{p.wins}</span>
                    <span className="text-red-400 text-center font-bold">{p.losses}</span>
                    <span className="text-white text-right font-bold">{p.winPercentage}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Column 3: Win Rate Bar Chart (All participating players) */}
          <div className="bg-[#0D131F]/90 rounded-2xl p-3 border border-white/10 flex flex-col justify-between shadow-md">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-2.5">
                WIN RATE (PLAYERS)
              </h3>

              <div className="space-y-2">
                {allPlayersList.map((p, idx) => {
                  const barColor =
                    idx === 0 || idx === 1
                      ? 'linear-gradient(90deg, #10B981, #34D399)'
                      : idx === 2
                      ? 'linear-gradient(90deg, #3B82F6, #60A5FA)'
                      : 'linear-gradient(90deg, #8B5CF6, #A78BFA)';

                    return (
                      <div key={p.id} className="space-y-0.5">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-semibold text-slate-200">
                            {p.name}
                          </span>
                          <span className="font-bold text-white text-xs">{p.winPercentage}%</span>
                        </div>
                        <div className="h-3 rounded-full bg-[#162032] overflow-hidden p-0.5 flex items-center">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${Math.max(p.winPercentage, 6)}%`,
                              background: barColor,
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>

            {/* Chart X-Axis Ticks */}
            <div className="flex items-center justify-between text-[9px] text-slate-500 pt-2 border-t border-white/5 font-semibold px-0.5">
              <span>0%</span>
              <span>20%</span>
              <span>40%</span>
              <span>60%</span>
              <span>80%</span>
              <span>100%</span>
            </div>
          </div>
        </div>

        {/* ==================================================================== */}
        {/* FOOTER */}
        {/* ==================================================================== */}
        <div className="relative z-10 flex items-center justify-center gap-1.5 text-center mt-3 pt-2">
          <span className="text-emerald-400 text-sm">ⓘ</span>
          <p className="text-[11px] text-slate-400">
            All stats are calculated based on matches played on{' '}
            <span className="text-emerald-400 font-semibold">{data.date}</span>
          </p>
        </div>
      </div>
    );
  }
);

// ============================================================================
// TOP STAT CARD
// ============================================================================

function TopStatCard({
  icon,
  value,
  label,
  glowColor,
}: {
  icon: React.ReactNode;
  value: number | string;
  label: string;
  glowColor: string;
}) {
  return (
    <div
      className="rounded-2xl px-5 py-3.5 bg-[#0D131F]/90 border border-white/10 flex items-center gap-4 shadow-lg"
      style={{
        boxShadow: `0 4px 20px ${glowColor}`,
      }}
    >
      <div className="flex-shrink-0">{icon}</div>
      <div className="flex flex-col">
        <span className="text-3xl font-black text-white leading-none tracking-tight">
          {value}
        </span>
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">
          {label}
        </span>
      </div>
    </div>
  );
}

// ============================================================================
// SVG ICONS FOR STAT CARDS
// ============================================================================

function TargetIcon() {
  return (
    <div className="w-10 h-10 rounded-xl bg-red-500/15 border border-red-500/30 flex items-center justify-center shadow-[0_0_12px_rgba(239,68,68,0.35)]">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#F87171" strokeWidth="2.5">
        <circle cx="12" cy="12" r="10" />
        <circle cx="12" cy="12" r="6" />
        <circle cx="12" cy="12" r="2" fill="#F87171" />
      </svg>
    </div>
  );
}

function PlayersIcon() {
  return (
    <div className="w-10 h-10 rounded-xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center shadow-[0_0_12px_rgba(59,130,246,0.35)]">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#60A5FA" strokeWidth="2">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    </div>
  );
}

function DuosIcon() {
  return (
    <div className="w-10 h-10 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center shadow-[0_0_12px_rgba(168,85,247,0.35)]">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#C084FC" strokeWidth="2">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    </div>
  );
}

function TrophyIcon() {
  return (
    <div className="w-10 h-10 rounded-xl bg-yellow-500/15 border border-yellow-500/30 flex items-center justify-center shadow-[0_0_12px_rgba(234,179,8,0.35)]">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FBBF24" strokeWidth="2">
        <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
        <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
        <path d="M4 22h16" />
        <path d="M10 14.66V17c0 .55-.45 1-1 1H8c-.55 0-1 .45-1 1v1c0 .55.45 1 1 1h8c.55 0 1-.45 1-1v-1c0-.55-.45-1-1-1h-1c-.55 0-1-.45-1-1v-2.34" />
        <path d="M18 4H6v7a6 6 0 0 0 12 0V4z" />
      </svg>
    </div>
  );
}

// ============================================================================
// DOUBLES PODIUM SECTION (EXACT REFERENCE REPLICA)
// ============================================================================

function DoublesPodium({ duoBreakdown }: { duoBreakdown: DuoSummary[] }) {
  const top3 = duoBreakdown.slice(0, 3);
  if (top3.length === 0) return null;

  const rank1 = top3[0];
  const rank2 = top3.length > 1 ? top3[1] : null;
  const rank3 = top3.length > 2 ? top3[2] : null;

  return (
    <div className="relative w-full max-w-[960px] h-[340px] flex items-end justify-center">
      {/* Connecting Curved Dashed Lines Behind Cards */}
      <svg
        className="absolute top-12 left-0 right-0 w-full h-[200px] pointer-events-none z-0"
        viewBox="0 0 960 200"
        fill="none"
      >
        {/* Left Curve: Rank 2 -> Rank 1 */}
        {rank2 && (
          <>
            <path
              d="M 270 120 Q 370 60 430 50"
              stroke="rgba(255, 255, 255, 0.35)"
              strokeWidth="2"
              strokeDasharray="4 4"
            />
            <circle cx="270" cy="120" r="4.5" fill="#38BDF8" className="shadow-[0_0_8px_#38BDF8]" />
            <circle cx="430" cy="50" r="4.5" fill="#FACC15" className="shadow-[0_0_8px_#FACC15]" />
          </>
        )}

        {/* Right Curve: Rank 1 -> Rank 3 */}
        {rank3 && (
          <>
            <path
              d="M 530 50 Q 590 60 690 120"
              stroke="rgba(255, 255, 255, 0.35)"
              strokeWidth="2"
              strokeDasharray="4 4"
            />
            <circle cx="530" cy="50" r="4.5" fill="#FACC15" className="shadow-[0_0_8px_#FACC15]" />
            <circle cx="690" cy="120" r="4.5" fill="#FB923C" className="shadow-[0_0_8px_#FB923C]" />
          </>
        )}
      </svg>

      {/* 3 PODIUM STATIONS */}
      <div className="relative z-10 flex items-end justify-center gap-6 w-full">
        {/* RANK 2 (LEFT) */}
        {rank2 && (
          <div className="flex flex-col items-center">
            {/* Card */}
            <div
              className="w-[245px] rounded-2xl px-4 pt-3.5 pb-2.5 bg-[#0C121D] flex flex-col items-center relative shadow-2xl"
              style={{
                border: '1.5px solid #38BDF8',
                boxShadow: '0 0 28px rgba(56, 189, 248, 0.28), inset 0 0 20px rgba(56, 189, 248, 0.06)',
              }}
            >
              {/* Badge (2) with Laurel */}
              <LaurelRankBadge rank={2} color="#38BDF8" />

              {/* Dual Avatars */}
              <div className="flex items-center gap-2 mt-1">
                <PlayerAvatar color="blue" size="md" />
                <PlayerAvatar color="cyan" size="md" />
              </div>

              {/* Duo Name */}
              <h4 className="font-bold text-white text-[15px] mt-2 text-center truncate max-w-[215px]">
                {rank2.duoName}
              </h4>

              {/* Wins */}
              <p className="font-extrabold text-[#38BDF8] text-[20px] leading-tight mt-0.5">
                {rank2.wins} WINS
              </p>

              {/* Win Rate */}
              <p className="text-slate-400 text-xs font-semibold mt-0.5">
                {rank2.winPercentage}% Win Rate
              </p>

              {/* Inset Bottom Pill */}
              <div className="w-full mt-2.5 py-1.5 px-2.5 rounded-lg bg-[#080C14] border border-white/5 flex items-center justify-between text-[10px] text-slate-300 font-medium">
                <span>{rank2.played} Played</span>
                <span className="text-slate-600">|</span>
                <span className="text-emerald-400 font-semibold">{rank2.wins} Wins</span>
                <span className="text-slate-600">|</span>
                <span className="text-red-400 font-semibold">{rank2.losses} Losses</span>
              </div>
            </div>

            {/* 3D Cylindrical Podium Base */}
            <div className="flex flex-col items-center mt-[-6px]">
              <div
                className="w-[250px] h-[18px] rounded-[125px/9px]"
                style={{
                  background: 'linear-gradient(180deg, #151F30 0%, #0D131F 100%)',
                  borderTop: '2.5px solid #38BDF8',
                  boxShadow: '0 0 22px rgba(56, 189, 248, 0.45)',
                }}
              />
            </div>
          </div>
        )}

        {/* RANK 1 (CENTER - DOMINANT & HIGHEST) */}
        <div className="flex flex-col items-center">
          {/* Card */}
          <div
            className="w-[280px] rounded-2xl px-5 pt-4 pb-3 bg-[#0E1524] flex flex-col items-center relative shadow-2xl"
            style={{
              border: '2px solid #FACC15',
              boxShadow: '0 0 38px rgba(234, 179, 8, 0.45), inset 0 0 25px rgba(234, 179, 8, 0.1)',
            }}
          >
            {/* Overlapping Large Golden Crown */}
            <div className="absolute -top-7 left-1/2 -translate-x-1/2 z-20">
              <GoldenCrown />
            </div>

            {/* Badge (1) with Laurel */}
            <LaurelRankBadge rank={1} color="#FACC15" />

            {/* Dual Avatars */}
            <div className="flex items-center gap-2 mt-1">
              <PlayerAvatar color="emerald" size="lg" />
              <PlayerAvatar color="amber" size="lg" />
            </div>

            {/* Duo Name */}
            <h4 className="font-black text-white text-[17px] mt-2.5 text-center truncate max-w-[245px]">
              {rank1.duoName}
            </h4>

            {/* Wins */}
            <p className="font-black text-[#FACC15] text-[24px] leading-tight mt-0.5">
              {rank1.wins} WINS
            </p>

            {/* Win Rate */}
            <p className="text-slate-300 text-xs font-semibold mt-0.5">
              {rank1.winPercentage}% Win Rate
            </p>

            {/* Inset Bottom Pill */}
            <div className="w-full mt-3 py-1.5 px-3 rounded-lg bg-[#080C14] border border-white/5 flex items-center justify-between text-[11px] text-slate-300 font-medium">
              <span>{rank1.played} Played</span>
              <span className="text-slate-600">|</span>
              <span className="text-emerald-400 font-bold">{rank1.wins} Wins</span>
              <span className="text-slate-600">|</span>
              <span className="text-red-400 font-bold">{rank1.losses} Losses</span>
            </div>
          </div>

          {/* 3D Multi-Tier Cylindrical Podium Base */}
          <div className="flex flex-col items-center mt-[-8px]">
            {/* Top Tier */}
            <div
              className="w-[290px] h-[22px] rounded-[145px/11px] z-10"
              style={{
                background: 'linear-gradient(180deg, #242116 0%, #13141B 100%)',
                borderTop: '3px solid #FACC15',
                boxShadow: '0 0 28px rgba(234, 179, 8, 0.6)',
              }}
            />
            {/* Bottom Tier */}
            <div
              className="w-[310px] h-[16px] -mt-[6px] rounded-[155px/8px]"
              style={{
                background: 'linear-gradient(180deg, #171510 0%, #0A0C12 100%)',
                boxShadow: '0 10px 25px rgba(0, 0, 0, 0.9)',
              }}
            />
          </div>
        </div>

        {/* RANK 3 (RIGHT) */}
        {rank3 && (
          <div className="flex flex-col items-center">
            {/* Card */}
            <div
              className="w-[245px] rounded-2xl px-4 pt-3.5 pb-2.5 bg-[#0C121D] flex flex-col items-center relative shadow-2xl"
              style={{
                border: '1.5px solid #FB923C',
                boxShadow: '0 0 28px rgba(251, 146, 60, 0.28), inset 0 0 20px rgba(251, 146, 60, 0.06)',
              }}
            >
              {/* Badge (3) with Laurel */}
              <LaurelRankBadge rank={3} color="#FB923C" />

              {/* Dual Avatars */}
              <div className="flex items-center gap-2 mt-1">
                <PlayerAvatar color="orange" size="md" />
                <PlayerAvatar color="amber" size="md" />
              </div>

              {/* Duo Name */}
              <h4 className="font-bold text-white text-[15px] mt-2 text-center truncate max-w-[215px]">
                {rank3.duoName}
              </h4>

              {/* Wins */}
              <p className="font-extrabold text-[#FB923C] text-[20px] leading-tight mt-0.5">
                {rank3.wins} WINS
              </p>

              {/* Win Rate */}
              <p className="text-slate-400 text-xs font-semibold mt-0.5">
                {rank3.winPercentage}% Win Rate
              </p>

              {/* Inset Bottom Pill */}
              <div className="w-full mt-2.5 py-1.5 px-2.5 rounded-lg bg-[#080C14] border border-white/5 flex items-center justify-between text-[10px] text-slate-300 font-medium">
                <span>{rank3.played} Played</span>
                <span className="text-slate-600">|</span>
                <span className="text-emerald-400 font-semibold">{rank3.wins} Wins</span>
                <span className="text-slate-600">|</span>
                <span className="text-red-400 font-semibold">{rank3.losses} Losses</span>
              </div>
            </div>

            {/* 3D Cylindrical Podium Base */}
            <div className="flex flex-col items-center mt-[-6px]">
              <div
                className="w-[250px] h-[18px] rounded-[125px/9px]"
                style={{
                  background: 'linear-gradient(180deg, #241A16 0%, #0D131F 100%)',
                  borderTop: '2.5px solid #FB923C',
                  boxShadow: '0 0 22px rgba(251, 146, 60, 0.45)',
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// SINGLES PODIUM SECTION
// ============================================================================

function SinglesPodium({ playerBreakdown }: { playerBreakdown: PlayerSummary[] }) {
  const top3 = playerBreakdown.slice(0, 3);
  if (top3.length === 0) return null;

  const rank1 = top3[0];
  const rank2 = top3.length > 1 ? top3[1] : null;
  const rank3 = top3.length > 2 ? top3[2] : null;

  return (
    <div className="relative w-full max-w-[960px] h-[340px] flex items-end justify-center">
      {/* 3 PODIUM STATIONS */}
      <div className="relative z-10 flex items-end justify-center gap-6 w-full">
        {/* RANK 2 */}
        {rank2 && (
          <div className="flex flex-col items-center">
            <div
              className="w-[240px] rounded-2xl px-4 pt-3.5 pb-2.5 bg-[#0C121D] flex flex-col items-center relative shadow-2xl"
              style={{
                border: '1.5px solid #38BDF8',
                boxShadow: '0 0 28px rgba(56, 189, 248, 0.28)',
              }}
            >
              <LaurelRankBadge rank={2} color="#38BDF8" />
              <div className="mt-1">
                <PlayerAvatar color="blue" size="lg" />
              </div>
              <h4 className="font-bold text-white text-[16px] mt-2 text-center truncate max-w-[210px]">
                {rank2.name}
              </h4>
              <p className="font-extrabold text-[#38BDF8] text-[20px] leading-tight mt-0.5">
                {rank2.wins} WINS
              </p>
              <p className="text-slate-400 text-xs font-semibold mt-0.5">{rank2.winPercentage}% Win Rate</p>
              <div className="w-full mt-2.5 py-1.5 px-2.5 rounded-lg bg-[#080C14] border border-white/5 flex items-center justify-between text-[10px] text-slate-300 font-medium">
                <span>{rank2.played} Played</span>
                <span className="text-slate-600">|</span>
                <span className="text-emerald-400 font-semibold">{rank2.wins} Wins</span>
                <span className="text-slate-600">|</span>
                <span className="text-red-400 font-semibold">{rank2.losses} Losses</span>
              </div>
            </div>
            <div
              className="w-[245px] h-[18px] rounded-[122px/9px] mt-[-6px]"
              style={{
                background: 'linear-gradient(180deg, #151F30 0%, #0D131F 100%)',
                borderTop: '2.5px solid #38BDF8',
                boxShadow: '0 0 20px rgba(56, 189, 248, 0.45)',
              }}
            />
          </div>
        )}

        {/* RANK 1 */}
        <div className="flex flex-col items-center">
          <div
            className="w-[275px] rounded-2xl px-5 pt-4 pb-3 bg-[#0E1524] flex flex-col items-center relative shadow-2xl"
            style={{
              border: '2px solid #FACC15',
              boxShadow: '0 0 38px rgba(234, 179, 8, 0.45)',
            }}
          >
            <div className="absolute -top-7 left-1/2 -translate-x-1/2 z-20">
              <GoldenCrown />
            </div>
            <LaurelRankBadge rank={1} color="#FACC15" />
            <div className="mt-1">
              <PlayerAvatar color="emerald" size="lg" />
            </div>
            <h4 className="font-black text-white text-[18px] mt-2.5 text-center truncate max-w-[240px]">
              {rank1.name}
            </h4>
            <p className="font-black text-[#FACC15] text-[24px] leading-tight mt-0.5">
              {rank1.wins} WINS
            </p>
            <p className="text-slate-300 text-xs font-semibold mt-0.5">{rank1.winPercentage}% Win Rate</p>
            <div className="w-full mt-3 py-1.5 px-3 rounded-lg bg-[#080C14] border border-white/5 flex items-center justify-between text-[11px] text-slate-300 font-medium">
              <span>{rank1.played} Played</span>
              <span className="text-slate-600">|</span>
              <span className="text-emerald-400 font-bold">{rank1.wins} Wins</span>
              <span className="text-slate-600">|</span>
              <span className="text-red-400 font-bold">{rank1.losses} Losses</span>
            </div>
          </div>
          <div
            className="w-[285px] h-[22px] rounded-[142px/11px] mt-[-8px]"
            style={{
              background: 'linear-gradient(180deg, #242116 0%, #13141B 100%)',
              borderTop: '3px solid #FACC15',
              boxShadow: '0 0 26px rgba(234, 179, 8, 0.6)',
            }}
          />
        </div>

        {/* RANK 3 */}
        {rank3 && (
          <div className="flex flex-col items-center">
            <div
              className="w-[240px] rounded-2xl px-4 pt-3.5 pb-2.5 bg-[#0C121D] flex flex-col items-center relative shadow-2xl"
              style={{
                border: '1.5px solid #FB923C',
                boxShadow: '0 0 28px rgba(251, 146, 60, 0.28)',
              }}
            >
              <LaurelRankBadge rank={3} color="#FB923C" />
              <div className="mt-1">
                <PlayerAvatar color="orange" size="lg" />
              </div>
              <h4 className="font-bold text-white text-[16px] mt-2 text-center truncate max-w-[210px]">
                {rank3.name}
              </h4>
              <p className="font-extrabold text-[#FB923C] text-[20px] leading-tight mt-0.5">
                {rank3.wins} WINS
              </p>
              <p className="text-slate-400 text-xs font-semibold mt-0.5">{rank3.winPercentage}% Win Rate</p>
              <div className="w-full mt-2.5 py-1.5 px-2.5 rounded-lg bg-[#080C14] border border-white/5 flex items-center justify-between text-[10px] text-slate-300 font-medium">
                <span>{rank3.played} Played</span>
                <span className="text-slate-600">|</span>
                <span className="text-emerald-400 font-semibold">{rank3.wins} Wins</span>
                <span className="text-slate-600">|</span>
                <span className="text-red-400 font-semibold">{rank3.losses} Losses</span>
              </div>
            </div>
            <div
              className="w-[245px] h-[18px] rounded-[122px/9px] mt-[-6px]"
              style={{
                background: 'linear-gradient(180deg, #241A16 0%, #0D131F 100%)',
                borderTop: '2.5px solid #FB923C',
                boxShadow: '0 0 20px rgba(251, 146, 60, 0.45)',
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// LAUREL WREATH & BADGE SVG
// ============================================================================

function LaurelRankBadge({ rank, color }: { rank: number; color: string }) {
  const isFirst = rank === 1;

  return (
    <div className="flex items-center justify-center gap-1.5">
      {/* Left Laurel Branch */}
      <svg width="22" height="26" viewBox="0 0 24 32" fill="none" className="opacity-90">
        <path d="M18 2C16 6 12 9 8 10C10 12 12 12 15 11" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
        <path d="M17 9C14 13 9 16 5 17C7 19 10 19 13 18" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
        <path d="M16 16C12 20 7 23 3 24C5 26 8 26 11 25" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
        <path d="M15 23C12 26 7 28 3 29C6 30 9 30 11 29" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
        <path d="M19 2C18 10 16 20 12 30" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
      </svg>

      {/* Center Circle with Number */}
      <div
        className="w-7 h-7 rounded-full flex items-center justify-center font-black text-xs shadow-md"
        style={{
          background: color,
          color: isFirst ? '#000' : '#000',
          boxShadow: `0 0 10px ${color}90`,
        }}
      >
        {rank}
      </div>

      {/* Right Laurel Branch (Flipped) */}
      <svg width="22" height="26" viewBox="0 0 24 32" fill="none" className="opacity-90 scale-x-[-1]">
        <path d="M18 2C16 6 12 9 8 10C10 12 12 12 15 11" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
        <path d="M17 9C14 13 9 16 5 17C7 19 10 19 13 18" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
        <path d="M16 16C12 20 7 23 3 24C5 26 8 26 11 25" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
        <path d="M15 23C12 26 7 28 3 29C6 30 9 30 11 29" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
        <path d="M19 2C18 10 16 20 12 30" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    </div>
  );
}

// ============================================================================
// GOLDEN CROWN SVG
// ============================================================================

function GoldenCrown() {
  return (
    <svg
      width="44"
      height="30"
      viewBox="0 0 48 34"
      fill="none"
      className="drop-shadow-[0_0_14px_rgba(234,179,8,0.95)]"
    >
      <path
        d="M6 30L3 9L14 18L24 3L34 18L45 9L42 30H6Z"
        fill="url(#crown_grad)"
        stroke="#FDE047"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <circle cx="24" cy="3" r="2.8" fill="#FFFBEB" stroke="#FACC15" strokeWidth="1" />
      <circle cx="3" cy="9" r="2.5" fill="#FFFBEB" stroke="#FACC15" strokeWidth="1" />
      <circle cx="45" cy="9" r="2.5" fill="#FFFBEB" stroke="#FACC15" strokeWidth="1" />
      <circle cx="14" cy="18" r="2" fill="#FFFBEB" />
      <circle cx="34" cy="18" r="2" fill="#FFFBEB" />
      <defs>
        <linearGradient id="crown_grad" x1="24" y1="3" x2="24" y2="30" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FEF08A" />
          <stop offset="0.45" stopColor="#FACC15" />
          <stop offset="1" stopColor="#CA8A04" />
        </linearGradient>
      </defs>
    </svg>
  );
}

// ============================================================================
// AVATAR COMPONENTS
// ============================================================================

function PlayerAvatar({
  color = 'emerald',
  size = 'md',
}: {
  color: 'emerald' | 'blue' | 'cyan' | 'orange' | 'amber' | 'purple';
  size?: 'sm' | 'md' | 'lg';
}) {
  const gradients = {
    emerald: 'linear-gradient(135deg, #10B981, #059669)',
    blue: 'linear-gradient(135deg, #3B82F6, #1D4ED8)',
    cyan: 'linear-gradient(135deg, #06B6D4, #0891B2)',
    orange: 'linear-gradient(135deg, #F97316, #C2410C)',
    amber: 'linear-gradient(135deg, #F59E0B, #B45309)',
    purple: 'linear-gradient(135deg, #8B5CF6, #6D28D9)',
  };

  const dimensions = size === 'sm' ? 'w-6 h-6' : size === 'lg' ? 'w-11 h-11' : 'w-9 h-9';
  const iconSize = size === 'sm' ? 12 : size === 'lg' ? 22 : 16;

  return (
    <div
      className={`${dimensions} rounded-full flex items-center justify-center shadow-lg ring-2 ring-[#070B13] flex-shrink-0`}
      style={{ background: gradients[color] }}
    >
      <svg
        width={iconSize}
        height={iconSize}
        viewBox="0 0 24 24"
        fill="currentColor"
        className="text-white/95"
      >
        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
      </svg>
    </div>
  );
}

function PlayerAvatarMini({
  color = 'emerald',
}: {
  color: 'emerald' | 'blue' | 'cyan' | 'orange' | 'amber' | 'purple';
}) {
  const gradients = {
    emerald: 'linear-gradient(135deg, #10B981, #059669)',
    blue: 'linear-gradient(135deg, #3B82F6, #1D4ED8)',
    cyan: 'linear-gradient(135deg, #06B6D4, #0891B2)',
    orange: 'linear-gradient(135deg, #F97316, #C2410C)',
    amber: 'linear-gradient(135deg, #F59E0B, #B45309)',
    purple: 'linear-gradient(135deg, #8B5CF6, #6D28D9)',
  };

  return (
    <div
      className="w-4 h-4 rounded-full flex items-center justify-center shadow-sm ring-1 ring-[#0D131F]"
      style={{ background: gradients[color] }}
    >
      <svg width="8" height="8" viewBox="0 0 24 24" fill="currentColor" className="text-white">
        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
      </svg>
    </div>
  );
}
