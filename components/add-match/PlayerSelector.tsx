'use client';

import { memo, useState } from 'react';
import { Check, ChevronsUpDown, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Player } from '@/lib/types';
import { Input } from '@/components/ui/input';

interface PlayerSelectorProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  players: Player[];
  excludeIds?: string[];
  error?: string;
}

export const PlayerSelector = memo(function PlayerSelector({
  label,
  value,
  onChange,
  players,
  excludeIds = [],
  error,
}: PlayerSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const availablePlayers = players.filter(p => !excludeIds.includes(p.id));
  const selectedPlayer = players.find(p => p.id === value);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const filteredPlayers = availablePlayers.filter(player =>
    player.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div>
      <label className="text-sm font-medium text-slate-300 mb-2 block">{label}</label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className={cn(
          "w-full h-14 bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20 text-white transition-all",
          !value && "text-slate-400"
        )}>
          {value && selectedPlayer ? (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-sm font-bold text-white shadow-md">
                {getInitials(selectedPlayer.name)}
              </div>
              <span className="font-medium">{selectedPlayer.name}</span>
            </div>
          ) : (
            <SelectValue placeholder="Select player..." />
          )}
        </SelectTrigger>
        <SelectContent 
          className="bg-[#111827] border border-white/10 text-white z-[100]"
          position="popper"
          sideOffset={5}
        >
          {/* Search Input */}
          <div className="flex items-center border-b border-white/10 px-3 py-2 bg-[#111827] sticky top-0 z-10">
            <Search className="mr-2 h-4 w-4 shrink-0 text-slate-400" />
            <Input
              placeholder="Search player..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-8 border-0 bg-transparent text-white placeholder:text-slate-500 focus-visible:ring-0 focus-visible:ring-offset-0"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
          
          {/* Player List */}
          <div className="max-h-64 overflow-auto p-1">
            {filteredPlayers.length === 0 ? (
              <div className="py-6 text-center text-sm text-slate-400">
                No player found.
              </div>
            ) : (
              filteredPlayers.map((player) => (
                <SelectItem 
                  key={player.id} 
                  value={player.id}
                  className="cursor-pointer hover:bg-white/10 text-white focus:bg-white/10 focus:text-white data-[state=checked]:bg-emerald-500/20"
                >
                  <div className="flex items-center gap-3 py-1">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-sm font-bold text-white shadow-md">
                      {getInitials(player.name)}
                    </div>
                    <span className="text-white">{player.name}</span>
                  </div>
                </SelectItem>
              ))
            )}
          </div>
        </SelectContent>
      </Select>
      {error && (
        <p className="text-red-400 text-xs mt-1.5">{error}</p>
      )}
    </div>
  );
});
