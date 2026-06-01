'use client';

import { memo, useMemo } from 'react';
import { Match, Player } from '@/lib/types';

interface WinsComparisonChartProps {
  matches: Match[];
  players: Player[];
  loading: boolean;
}

interface PlayerWinData {
  playerId: string;
  playerName: string;
  singlesWins: number;
  doublesWins: number;
  totalWins: number;
  totalMatches: number;
}

export const WinsComparisonChart = memo(function WinsComparisonChart({ 
  matches, 
  players, 
  loading 
}: WinsComparisonChartProps) {
  const chartData = useMemo(() => {
    if (!matches.length || !players.length) return [];

    // Calculate wins per player by match type from matches
    const winsMap = new Map<string, { singles: number; doubles: number }>();

    matches.forEach((match) => {
      // Count wins
      match.winner.forEach((winnerId) => {
        const current = winsMap.get(winnerId) || { singles: 0, doubles: 0 };
        if (match.type === 'singles') {
          current.singles += 1;
        } else {
          current.doubles += 1;
        }
        winsMap.set(winnerId, current);
      });
    });

    // Create data for ALL players who have wins, using their total wins from player record
    const data: PlayerWinData[] = [];
    
    players.forEach((player) => {
      if (player.wins > 0) {
        const matchWins = winsMap.get(player.id) || { singles: 0, doubles: 0 };
        
        // Use player's total wins, and distribute based on match data ratio
        // If we have match data for this player, use it; otherwise show total as doubles
        const totalMatchWins = matchWins.singles + matchWins.doubles;
        
        let singlesWins = matchWins.singles;
        let doublesWins = matchWins.doubles;
        
        // If player has more wins than we've counted from matches, 
        // it means we're only seeing recent matches
        if (player.wins > totalMatchWins && totalMatchWins > 0) {
          // Scale up proportionally
          const ratio = player.wins / totalMatchWins;
          singlesWins = Math.round(matchWins.singles * ratio);
          doublesWins = Math.round(matchWins.doubles * ratio);
          
          // Adjust to match exact total
          const diff = player.wins - (singlesWins + doublesWins);
          if (diff !== 0) {
            doublesWins += diff;
          }
        } else if (totalMatchWins === 0 && player.wins > 0) {
          // No match data but player has wins - assume all doubles
          doublesWins = player.wins;
        }
        
        data.push({
          playerId: player.id,
          playerName: player.name,
          singlesWins,
          doublesWins,
          totalWins: player.wins, // Use actual total from player record
          totalMatches: player.wins + player.losses, // Total matches = wins + losses
        });
      }
    });

    // Sort by total wins descending
    return data.sort((a, b) => b.totalWins - a.totalWins).slice(0, 10);
  }, [matches, players]);

  const maxWins = useMemo(() => {
    return Math.max(...chartData.map(d => Math.max(d.singlesWins, d.doublesWins)), 1);
  }, [chartData]);

  if (loading) {
    return (
      <section className="mb-8">
        <div className="bg-[#151B23] rounded-xl border border-gray-800/50 p-6">
          <div className="h-6 w-48 bg-gray-800/50 rounded animate-pulse mb-6" />
          <div className="h-64 bg-gray-800/30 rounded animate-pulse" />
        </div>
      </section>
    );
  }

  if (chartData.length === 0) {
    return (
      <section className="mb-8">
        <div className="bg-[#151B23] rounded-xl border border-gray-800/50 p-6">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <span className="text-2xl">📊</span>
            Singles vs Doubles Wins
          </h2>
          <div className="text-center py-12 text-gray-400">
            <p>No match data available yet</p>
            <p className="text-sm mt-2">Play some matches to see the comparison</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="mb-8">
      <div className="bg-[#151B23] rounded-xl border border-gray-800/50 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <span className="text-2xl">📊</span>
            Singles vs Doubles Wins
          </h2>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500" />
              <span className="text-gray-400">Singles</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-emerald-500" />
              <span className="text-gray-400">Doubles</span>
            </div>
          </div>
        </div>

        {/* Chart Container */}
        <div className="relative">
          {/* Y-axis labels */}
          <div className="absolute left-0 top-0 bottom-12 w-10 flex flex-col justify-between text-xs text-gray-500">
            <span>{maxWins}</span>
            <span>{Math.floor(maxWins * 0.75)}</span>
            <span>{Math.floor(maxWins * 0.5)}</span>
            <span>{Math.floor(maxWins * 0.25)}</span>
            <span>0</span>
          </div>

          {/* Chart area */}
          <div className="ml-12 overflow-x-auto">
            <div className="relative" style={{ height: '300px' }}>
              {/* Grid lines */}
              <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                {[0, 1, 2, 3, 4].map((i) => (
                  <div key={i} className="border-t border-gray-800/30 w-full" />
                ))}
              </div>

              {/* Bars Container */}
              <div className="absolute inset-0 flex items-end gap-6 pb-12">
                {chartData.map((data) => {
                  const chartHeight = 300 - 48; // Total height minus bottom padding
                  const singlesHeightPx = (data.singlesWins / maxWins) * chartHeight;
                  const doublesHeightPx = (data.doublesWins / maxWins) * chartHeight;

                  return (
                    <div key={data.playerId} className="flex flex-col items-center gap-3 min-w-[100px]">
                      {/* Bars */}
                      <div className="relative group w-8">
                        {/* Singles Bar */}
                        <div className="relative w-8">
                          <div
                            className="w-full bg-gradient-to-t from-blue-600 to-blue-400 rounded-t-md transition-all duration-300 hover:from-blue-500 hover:to-blue-300 cursor-pointer shadow-lg"
                            style={{ 
                              height: `${singlesHeightPx}px`,
                              minHeight: data.singlesWins > 0 ? '4px' : '0px'
                            }}
                          />
                        </div>

                        {/* Doubles Bar */}
                        <div className="relative w-8">
                          <div
                            className="w-full bg-gradient-to-t from-emerald-600 to-emerald-400 rounded-t-md transition-all duration-300 hover:from-emerald-500 hover:to-emerald-300 cursor-pointer shadow-lg"
                            style={{ 
                              height: `${doublesHeightPx}px`,
                              minHeight: data.doublesWins > 0 ? '4px' : '0px'
                            }}
                          />
                        </div>

                        {/* Tooltip - shows on hover of the entire bar group */}
                        <div className="absolute bottom-0 left-full ml-3 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 text-white text-xs px-3 py-2 rounded whitespace-nowrap z-20 shadow-xl border border-gray-700 pointer-events-none">
                          <div className="font-semibold mb-1">{data.playerName}</div>
                          <div className="text-blue-400">Singles: {data.singlesWins}</div>
                          <div className="text-emerald-400">Doubles: {data.doublesWins}</div>
                          <div className="text-gray-300 mt-1 pt-1 border-t border-gray-700">
                            Total: {data.totalMatches} matches
                          </div>
                        </div>
                      </div>

                      {/* Player Name */}
                      <div className="text-center absolute bottom-0">
                        <p className="text-sm font-medium text-white truncate max-w-[100px]" title={data.playerName}>
                          {data.playerName}
                        </p>
                        <p className="text-xs text-gray-500">
                          {data.totalWins} total
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
});
