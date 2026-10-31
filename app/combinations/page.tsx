'use client';

import { useState, useMemo } from 'react';
import { useOptimizedPlayers } from '@/lib/hooks/useOptimizedPlayers';
import { useMatches } from '@/lib/hooks/useMatches';
import { usePartnerships } from '@/lib/hooks/usePartnerships';
import {
  calculateHeadToHead,
} from '@/lib/utils/combinationStats';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { BattleCard } from '@/components/dashboard/BattleCard';
import { Users, Swords, Trophy, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export default function CombinationsPage() {
  const { players, playerMap, loading: playersLoading } = useOptimizedPlayers();
  const { matches, loading: matchesLoading } = useMatches();
  const { partnerships, getPartnershipBetween } = usePartnerships();

  // Mode switcher: 'explorer' or 'compare'
  const [activeTab, setActiveTab] = useState<'explorer' | 'compare'>('explorer');

  // Explorer states
  const [player1Id, setPlayer1Id] = useState<string>('');
  const [player2Id, setPlayer2Id] = useState<string>('');

  // Comparison states
  const [compA1, setCompA1] = useState<string>('');
  const [compA2, setCompA2] = useState<string>('');
  const [compB1, setCompB1] = useState<string>('');
  const [compB2, setCompB2] = useState<string>('');

  // Auto-select initial players if available
  useMemo(() => {
    if (players.length >= 2 && !player1Id && !player2Id) {
      setPlayer1Id(players[0].id);
      setPlayer2Id(players[1].id);
    }
    if (players.length >= 4 && !compA1 && !compA2 && !compB1 && !compB2) {
      setCompA1(players[0].id);
      setCompA2(players[1].id);
      setCompB1(players[2].id);
      setCompB2(players[3].id);
    }
  }, [players, player1Id, player2Id, compA1, compA2, compB1, compB2]);

  // Selected partnership in Explorer
  const selectedPartnership = useMemo(() => {
    if (!player1Id || !player2Id || player1Id === player2Id) return null;
    return getPartnershipBetween(player1Id, player2Id);
  }, [player1Id, player2Id, getPartnershipBetween]);

  // Match history for selected partnership
  const partnershipMatches = useMemo(() => {
    if (!player1Id || !player2Id || player1Id === player2Id) return [];
    return matches.filter((m) => {
      if (m.type !== 'doubles' || !m.players || m.players.length < 4) return false;
      const teamAHasBoth = m.players[0] === player1Id && m.players[1] === player2Id ||
                           m.players[0] === player2Id && m.players[1] === player1Id;
      const teamBHasBoth = m.players[2] === player1Id && m.players[3] === player2Id ||
                           m.players[2] === player2Id && m.players[3] === player1Id;
      return teamAHasBoth || teamBHasBoth;
    });
  }, [player1Id, player2Id, matches]);

  // Comparison Partnerships & H2H
  const duoA = useMemo(() => {
    if (!compA1 || !compA2 || compA1 === compA2) return null;
    return getPartnershipBetween(compA1, compA2);
  }, [compA1, compA2, getPartnershipBetween]);

  const duoB = useMemo(() => {
    if (!compB1 || !compB2 || compB1 === compB2) return null;
    return getPartnershipBetween(compB1, compB2);
  }, [compB1, compB2, getPartnershipBetween]);

  const h2hRecord = useMemo(() => {
    if (!compA1 || !compA2 || !compB1 || !compB2) return null;
    if (compA1 === compA2 || compB1 === compB2) return null;
    return calculateHeadToHead([compA1, compA2], [compB1, compB2], matches, playerMap);
  }, [compA1, compA2, compB1, compB2, matches, playerMap]);

  if (playersLoading || matchesLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="border-b border-white/10 bg-gradient-to-br from-black via-slate-900/40 to-black">
        <div className="container mx-auto px-4 py-6 max-w-5xl">
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <Swords className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-white">
                Partnership Explorer & Comparison
              </h1>
              <p className="text-xs md:text-sm text-slate-400">
                Analyze chemistry, win rates, points, and head-to-head records for any duo
              </p>
            </div>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex gap-2 mt-5">
            <button
              onClick={() => setActiveTab('explorer')}
              className={cn(
                'px-4 py-2 rounded-xl text-xs md:text-sm font-bold transition-all flex items-center gap-2',
                activeTab === 'explorer'
                  ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                  : 'bg-white/5 text-slate-400 hover:text-white border border-white/10'
              )}
            >
              <Users className="w-4 h-4" />
              Partnership Explorer
            </button>
            <button
              onClick={() => setActiveTab('compare')}
              className={cn(
                'px-4 py-2 rounded-xl text-xs md:text-sm font-bold transition-all flex items-center gap-2',
                activeTab === 'compare'
                  ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                  : 'bg-white/5 text-slate-400 hover:text-white border border-white/10'
              )}
            >
              <Swords className="w-4 h-4" />
              Duo vs Duo Comparison
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 max-w-5xl">
        {/* ==================================================================== */}
        {/* TAB 1: PARTNERSHIP EXPLORER */}
        {/* ==================================================================== */}
        {activeTab === 'explorer' && (
          <div className="space-y-6">
            {/* Player Selection Card */}
            <Card className="border-white/10 bg-white/5 backdrop-blur-sm p-5 rounded-2xl">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-400" />
                Select Two Players
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-slate-400 mb-1.5 block">Player 1</label>
                  <Select value={player1Id} onValueChange={setPlayer1Id}>
                    <SelectTrigger className="bg-white/5 border-white/10 text-white h-12">
                      <SelectValue placeholder="Select Player 1" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#111827] border-white/10 text-white z-[100]">
                      {players.map((p) => (
                        <SelectItem key={p.id} value={p.id} disabled={p.id === player2Id}>
                          {p.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-xs text-slate-400 mb-1.5 block">Player 2</label>
                  <Select value={player2Id} onValueChange={setPlayer2Id}>
                    <SelectTrigger className="bg-white/5 border-white/10 text-white h-12">
                      <SelectValue placeholder="Select Player 2" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#111827] border-white/10 text-white z-[100]">
                      {players.map((p) => (
                        <SelectItem key={p.id} value={p.id} disabled={p.id === player1Id}>
                          {p.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {player1Id === player2Id && player1Id !== '' && (
                <p className="text-xs text-red-400 mt-2">Please select two distinct players.</p>
              )}
            </Card>

            {/* Partnership Metrics */}
            {selectedPartnership ? (
              <div className="space-y-6">
                {/* Duo Headline Card */}
                <div className="glass-card rounded-2xl p-6 border border-emerald-500/20 bg-emerald-500/5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs uppercase font-bold text-emerald-400 tracking-wider">
                          Partnership Profile
                        </span>
                        {selectedPartnership.isQualified ? (
                          <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                            <ShieldCheck className="w-3 h-3" /> Qualified Duo
                          </span>
                        ) : (
                          <span className="text-[10px] bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded-full font-bold">
                            Under 5 Matches
                          </span>
                        )}
                      </div>
                      <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                        {selectedPartnership.duoName}
                      </h2>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="text-3xl font-extrabold text-emerald-400">
                          {selectedPartnership.winPercentage}%
                        </p>
                        <p className="text-xs text-slate-400">Win Rate</p>
                      </div>
                    </div>
                  </div>

                  {/* Form strip */}
                  <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between">
                    <span className="text-xs text-slate-400 font-semibold">Recent 5 Matches:</span>
                    <div className="flex items-center gap-1.5">
                      {selectedPartnership.recentForm.map((res, i) => (
                        <span
                          key={i}
                          className={cn(
                            'w-7 h-7 rounded-lg text-xs font-bold flex items-center justify-center text-white',
                            res === 'W' ? 'bg-emerald-600' : 'bg-red-600'
                          )}
                        >
                          {res}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 4 Stat Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  <Card className="border-white/10 bg-white/5 p-4 rounded-xl">
                    <span className="text-xs text-slate-400 block mb-1">Matches Played</span>
                    <p className="text-2xl font-extrabold text-white">{selectedPartnership.matchesPlayed}</p>
                    <p className="text-[11px] text-slate-500 mt-1">Together on court</p>
                  </Card>

                  <Card className="border-white/10 bg-white/5 p-4 rounded-xl">
                    <span className="text-xs text-slate-400 block mb-1">Wins / Losses</span>
                    <p className="text-2xl font-extrabold text-emerald-400">
                      {selectedPartnership.wins}W - {selectedPartnership.losses}L
                    </p>
                    <p className="text-[11px] text-slate-500 mt-1">{selectedPartnership.winPercentage}% victory rate</p>
                  </Card>

                  <Card className="border-white/10 bg-white/5 p-4 rounded-xl">
                    <span className="text-xs text-slate-400 block mb-1">Points Difference</span>
                    <p
                      className={cn(
                        'text-2xl font-extrabold',
                        selectedPartnership.pointsDifference >= 0 ? 'text-emerald-400' : 'text-red-400'
                      )}
                    >
                      {selectedPartnership.pointsDifference >= 0
                        ? `+${selectedPartnership.pointsDifference}`
                        : selectedPartnership.pointsDifference}
                    </p>
                    <p className="text-[11px] text-slate-500 mt-1">
                      {selectedPartnership.pointsScored} - {selectedPartnership.pointsConceded}
                    </p>
                  </Card>

                  <Card className="border-white/10 bg-white/5 p-4 rounded-xl">
                    <span className="text-xs text-slate-400 block mb-1">Current Streak</span>
                    <p
                      className={cn(
                        'text-2xl font-extrabold flex items-center gap-1.5',
                        selectedPartnership.currentStreak > 0 ? 'text-emerald-400' : 'text-slate-400'
                      )}
                    >
                      {selectedPartnership.currentStreak > 0
                        ? `${selectedPartnership.currentStreak}W 🔥`
                        : `${Math.abs(selectedPartnership.currentStreak)}L`}
                    </p>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Peak streak: {selectedPartnership.longestWinningStreak} wins
                    </p>
                  </Card>
                </div>

                {/* Match Timeline for this Duo */}
                <div>
                  <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-emerald-400" />
                    Matches Involving This Duo ({partnershipMatches.length})
                  </h3>
                  <div className="space-y-3">
                    {partnershipMatches.map((m) => (
                      <BattleCard key={m.id} match={m} players={players} />
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <Card className="border-white/10 bg-white/5 p-12 text-center rounded-2xl">
                <Users className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-white mb-1">No Partnership Data Found</h3>
                <p className="text-sm text-slate-400 max-w-md mx-auto">
                  These two players haven&apos;t played a recorded doubles match together yet.
                </p>
              </Card>
            )}
          </div>
        )}

        {/* ==================================================================== */}
        {/* TAB 2: DUO VS DUO COMPARISON */}
        {/* ==================================================================== */}
        {activeTab === 'compare' && (
          <div className="space-y-6">
            {/* Duo Pickers */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Duo A Picker */}
              <Card className="border-emerald-500/20 bg-emerald-500/5 p-5 rounded-2xl">
                <h3 className="text-xs uppercase font-bold text-emerald-400 mb-3 tracking-wider">
                  Partnership A
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  <Select value={compA1} onValueChange={setCompA1}>
                    <SelectTrigger className="bg-white/5 border-white/10 text-white text-xs h-10">
                      <SelectValue placeholder="Player 1" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#111827] border-white/10 text-white z-[100]">
                      {players.map((p) => (
                        <SelectItem key={p.id} value={p.id} disabled={p.id === compA2}>
                          {p.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={compA2} onValueChange={setCompA2}>
                    <SelectTrigger className="bg-white/5 border-white/10 text-white text-xs h-10">
                      <SelectValue placeholder="Player 2" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#111827] border-white/10 text-white z-[100]">
                      {players.map((p) => (
                        <SelectItem key={p.id} value={p.id} disabled={p.id === compA1}>
                          {p.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </Card>

              {/* Duo B Picker */}
              <Card className="border-yellow-500/20 bg-yellow-500/5 p-5 rounded-2xl">
                <h3 className="text-xs uppercase font-bold text-yellow-400 mb-3 tracking-wider">
                  Partnership B
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  <Select value={compB1} onValueChange={setCompB1}>
                    <SelectTrigger className="bg-white/5 border-white/10 text-white text-xs h-10">
                      <SelectValue placeholder="Player 1" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#111827] border-white/10 text-white z-[100]">
                      {players.map((p) => (
                        <SelectItem key={p.id} value={p.id} disabled={p.id === compB2}>
                          {p.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={compB2} onValueChange={setCompB2}>
                    <SelectTrigger className="bg-white/5 border-white/10 text-white text-xs h-10">
                      <SelectValue placeholder="Player 2" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#111827] border-white/10 text-white z-[100]">
                      {players.map((p) => (
                        <SelectItem key={p.id} value={p.id} disabled={p.id === compB1}>
                          {p.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </Card>
            </div>

            {/* Side-by-Side Comparison Matrix */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Duo A Stats */}
              <Card className="border-white/10 bg-white/5 p-5 rounded-2xl">
                <h4 className="text-lg font-bold text-white mb-4">
                  {duoA?.duoName || 'Partnership A'}
                </h4>
                {duoA ? (
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between py-1.5 border-b border-white/5">
                      <span className="text-slate-400">Matches Played:</span>
                      <span className="font-bold text-white">{duoA.matchesPlayed}</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-white/5">
                      <span className="text-slate-400">Win Rate:</span>
                      <span className="font-bold text-emerald-400">{duoA.winPercentage}%</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-white/5">
                      <span className="text-slate-400">Wins - Losses:</span>
                      <span className="font-semibold text-white">{duoA.wins}W - {duoA.losses}L</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-white/5">
                      <span className="text-slate-400">Points Differential:</span>
                      <span className="font-semibold text-white">
                        {duoA.pointsDifference >= 0 ? `+${duoA.pointsDifference}` : duoA.pointsDifference}
                      </span>
                    </div>
                    <div className="flex justify-between py-1.5">
                      <span className="text-slate-400">Peak Streak:</span>
                      <span className="font-semibold text-yellow-400">{duoA.longestWinningStreak} wins</span>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 italic">Select two players to see stats</p>
                )}
              </Card>

              {/* Duo B Stats */}
              <Card className="border-white/10 bg-white/5 p-5 rounded-2xl">
                <h4 className="text-lg font-bold text-white mb-4">
                  {duoB?.duoName || 'Partnership B'}
                </h4>
                {duoB ? (
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between py-1.5 border-b border-white/5">
                      <span className="text-slate-400">Matches Played:</span>
                      <span className="font-bold text-white">{duoB.matchesPlayed}</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-white/5">
                      <span className="text-slate-400">Win Rate:</span>
                      <span className="font-bold text-yellow-400">{duoB.winPercentage}%</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-white/5">
                      <span className="text-slate-400">Wins - Losses:</span>
                      <span className="font-semibold text-white">{duoB.wins}W - {duoB.losses}L</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-white/5">
                      <span className="text-slate-400">Points Differential:</span>
                      <span className="font-semibold text-white">
                        {duoB.pointsDifference >= 0 ? `+${duoB.pointsDifference}` : duoB.pointsDifference}
                      </span>
                    </div>
                    <div className="flex justify-between py-1.5">
                      <span className="text-slate-400">Peak Streak:</span>
                      <span className="font-semibold text-yellow-400">{duoB.longestWinningStreak} wins</span>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 italic">Select two players to see stats</p>
                )}
              </Card>
            </div>

            {/* Head-to-Head Banner */}
            {h2hRecord && (
              <Card className="border-white/10 bg-gradient-to-r from-emerald-950/30 via-slate-900/40 to-yellow-950/30 p-6 rounded-2xl">
                <div className="text-center mb-5">
                  <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block mb-1">
                    Direct Rivalry
                  </span>
                  <h3 className="text-xl font-extrabold text-white">
                    Head-to-Head Matchups ({h2hRecord.totalMatches})
                  </h3>
                </div>

                {h2hRecord.totalMatches > 0 ? (
                  <div className="space-y-5">
                    <div className="flex items-center justify-between max-w-md mx-auto">
                      <div className="text-center">
                        <span className="text-3xl font-extrabold text-emerald-400">{h2hRecord.winsA}</span>
                        <p className="text-xs text-slate-400 mt-1">Wins</p>
                      </div>
                      <div className="px-4 py-1.5 rounded-full bg-white/10 text-xs font-bold text-slate-300">
                        VS
                      </div>
                      <div className="text-center">
                        <span className="text-3xl font-extrabold text-yellow-400">{h2hRecord.winsB}</span>
                        <p className="text-xs text-slate-400 mt-1">Wins</p>
                      </div>
                    </div>

                    <div className="space-y-2 mt-4">
                      {h2hRecord.recentMatches.map((m) => (
                        <BattleCard key={m.id} match={m} players={players} />
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-center text-xs text-slate-400 italic">
                    These two specific partnerships have not yet played against each other in historical records.
                  </p>
                )}
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
