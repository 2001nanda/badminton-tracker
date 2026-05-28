'use client';

import { memo } from 'react';
import { Input } from '@/components/ui/input';
import { Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Player } from '@/lib/types';
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
  players: Player[];
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
  players,
}: HistoryFiltersProps) {
  const hasActiveFilters = filterType !== 'all' || filterPeriod !== 'all' || filterPlayer !== 'all' || searchQuery.trim() !== '';

  const clearFilters = () => {
    onSearchChange('');
    onTypeChange('all');
    onPeriodChange('all');
    onPlayerChange('all');
  };

  return (
    <div className="mb-6 space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        <Input
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search players..."
          className="bg-white/5 border-white/10 text-white pl-12 pr-12 h-12"
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

      {/* Filter Chips */}
      <div className="flex flex-wrap gap-2">
        {/* Match Type */}
        <div className="flex gap-2">
          <button
            onClick={() => onTypeChange('all')}
            className={cn(
              'px-4 py-2 rounded-lg text-sm font-medium transition-all',
              filterType === 'all'
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10'
            )}
          >
            All Matches
          </button>
          <button
            onClick={() => onTypeChange('singles')}
            className={cn(
              'px-4 py-2 rounded-lg text-sm font-medium transition-all',
              filterType === 'singles'
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10'
            )}
          >
            Singles
          </button>
          <button
            onClick={() => onTypeChange('doubles')}
            className={cn(
              'px-4 py-2 rounded-lg text-sm font-medium transition-all',
              filterType === 'doubles'
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10'
            )}
          >
            Doubles
          </button>
        </div>

        {/* Period */}
        <div className="flex gap-2">
          <button
            onClick={() => onPeriodChange('week')}
            className={cn(
              'px-4 py-2 rounded-lg text-sm font-medium transition-all',
              filterPeriod === 'week'
                ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                : 'bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10'
            )}
          >
            This Week
          </button>
          <button
            onClick={() => onPeriodChange('month')}
            className={cn(
              'px-4 py-2 rounded-lg text-sm font-medium transition-all',
              filterPeriod === 'month'
                ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                : 'bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10'
            )}
          >
            This Month
          </button>
        </div>

        {/* Player Filter */}
        <Select value={filterPlayer} onValueChange={onPlayerChange}>
          <SelectTrigger className="w-[180px] bg-white/5 border-white/10 text-white hover:bg-white/10">
            <SelectValue placeholder="All Players" />
          </SelectTrigger>
          <SelectContent 
            className="bg-[#111827] border border-white/10 text-white z-[100]"
            position="popper"
            sideOffset={5}
          >
            <SelectItem 
              value="all"
              className="text-white hover:bg-white/10 focus:bg-white/10 focus:text-white cursor-pointer"
            >
              All Players
            </SelectItem>
            {players.map((player) => (
              <SelectItem 
                key={player.id} 
                value={player.id}
                className="text-white hover:bg-white/10 focus:bg-white/10 focus:text-white cursor-pointer"
              >
                {player.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="text-gray-400 hover:text-white"
          >
            <X className="w-4 h-4 mr-1" />
            Clear Filters
          </Button>
        )}
      </div>
    </div>
  );
});
