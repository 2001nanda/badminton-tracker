'use client';

import { memo } from 'react';
import { Input } from '@/components/ui/input';
import { Search, X, Users, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Player, PartnershipStats } from '@/lib/types';
import { cn } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface HistoryFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  filterType: 'all' | 'singles' | 'doubles';
  onTypeChange: (value: 'all' | 'singles' | 'doubles') => void;
  filterPeriod: 'all' | 'week' | 'month';
  onPeriodChange: (value: 'all' | 'week' | 'month') => void;
  filterPlayer: string;
  onPlayerChange: (value: string) => void;
  filterPartnership: string;
  onPartnershipChange: (value: string) => void;
  filterWinner: string;
  onWinnerChange: (value: string) => void;
  players: Player[];
  partnerships: PartnershipStats[];
}

export const HistoryFilters = memo(function HistoryFilters({
  searchQuery,
  onSearchChange,
  filterType,
  onTypeChange,
  filterPeriod,
  onPeriodChange,
  filterPlayer,
  onPlayerChange,
  filterPartnership,
  onPartnershipChange,
  filterWinner,
  onWinnerChange,
  players,
  partnerships,
}: HistoryFiltersProps) {
  const hasActiveFilters =
    filterType !== 'all' ||
    filterPeriod !== 'all' ||
    filterPlayer !== 'all' ||
    filterPartnership !== 'all' ||
    filterWinner !== 'all' ||
    searchQuery.trim() !== '';

  const clearFilters = () => {
    onSearchChange('');
    onTypeChange('all');
    onPeriodChange('all');
    onPlayerChange('all');
    onPartnershipChange('all');
    onWinnerChange('all');
  };

  return (
    <div className="mb-6 space-y-4">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        <Input
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search by player or partner names..."
          className="bg-white/5 border-white/10 text-white pl-12 pr-12 h-12 rounded-xl"
        />
        {searchQuery && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onSearchChange('')}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Filter Row 1: Chips */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Match Type */}
        <div className="flex gap-1.5 bg-white/5 p-1 rounded-xl border border-white/10">
          <button
            onClick={() => onTypeChange('all')}
            className={cn(
              'px-3 py-1.5 rounded-lg text-xs font-semibold transition-all',
              filterType === 'all'
                ? 'bg-emerald-500 text-white shadow-sm'
                : 'text-gray-400 hover:text-white'
            )}
          >
            All
          </button>
          <button
            onClick={() => onTypeChange('singles')}
            className={cn(
              'px-3 py-1.5 rounded-lg text-xs font-semibold transition-all',
              filterType === 'singles'
                ? 'bg-emerald-500 text-white shadow-sm'
                : 'text-gray-400 hover:text-white'
            )}
          >
            Singles
          </button>
          <button
            onClick={() => onTypeChange('doubles')}
            className={cn(
              'px-3 py-1.5 rounded-lg text-xs font-semibold transition-all',
              filterType === 'doubles'
                ? 'bg-emerald-500 text-white shadow-sm'
                : 'text-gray-400 hover:text-white'
            )}
          >
            Doubles
          </button>
        </div>

        {/* Period */}
        <div className="flex gap-1.5 bg-white/5 p-1 rounded-xl border border-white/10">
          <button
            onClick={() => onPeriodChange('all')}
            className={cn(
              'px-3 py-1.5 rounded-lg text-xs font-semibold transition-all',
              filterPeriod === 'all'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-gray-400 hover:text-white'
            )}
          >
            All Time
          </button>
          <button
            onClick={() => onPeriodChange('week')}
            className={cn(
              'px-3 py-1.5 rounded-lg text-xs font-semibold transition-all',
              filterPeriod === 'week'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-gray-400 hover:text-white'
            )}
          >
            This Week
          </button>
          <button
            onClick={() => onPeriodChange('month')}
            className={cn(
              'px-3 py-1.5 rounded-lg text-xs font-semibold transition-all',
              filterPeriod === 'month'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-gray-400 hover:text-white'
            )}
          >
            This Month
          </button>
        </div>

        {/* Clear Filters Button */}
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="text-gray-400 hover:text-white text-xs h-9 rounded-xl ml-auto"
          >
            <X className="w-3.5 h-3.5 mr-1" />
            Reset Filters
          </Button>
        )}
      </div>

      {/* Filter Row 2: Dropdowns */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
        {/* Player Dropdown */}
        <Select value={filterPlayer} onValueChange={onPlayerChange}>
          <SelectTrigger className="bg-white/5 border-white/10 text-white h-10 rounded-xl text-xs">
            <SelectValue placeholder="Filter Player" />
          </SelectTrigger>
          <SelectContent className="bg-[#111827] border-white/10 text-white z-[100]">
            <SelectItem value="all">All Players</SelectItem>
            {players.map((player) => (
              <SelectItem key={player.id} value={player.id}>
                {player.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Partnership Dropdown */}
        <Select value={filterPartnership} onValueChange={onPartnershipChange}>
          <SelectTrigger className="bg-white/5 border-white/10 text-white h-10 rounded-xl text-xs">
            <SelectValue placeholder="Filter Partnership" />
          </SelectTrigger>
          <SelectContent className="bg-[#111827] border-white/10 text-white z-[100]">
            <SelectItem value="all">All Partnerships</SelectItem>
            {partnerships.map((p) => (
              <SelectItem key={p.id} value={p.id}>
                {p.duoName} ({p.matchesPlayed} matches)
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Winner Filter Dropdown */}
        <Select value={filterWinner} onValueChange={onWinnerChange}>
          <SelectTrigger className="bg-white/5 border-white/10 text-white h-10 rounded-xl text-xs">
            <SelectValue placeholder="Filter Winner" />
          </SelectTrigger>
          <SelectContent className="bg-[#111827] border-white/10 text-white z-[100]">
            <SelectItem value="all">Any Winner</SelectItem>
            {players.map((player) => (
              <SelectItem key={player.id} value={player.id}>
                Won by {player.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
});
