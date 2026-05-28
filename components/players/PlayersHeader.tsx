'use client';

import { memo } from 'react';
import { Button } from '@/components/ui/button';
import { UserPlus, Users } from 'lucide-react';

interface PlayersHeaderProps {
  playerCount: number;
  onAddClick: () => void;
}

export const PlayersHeader = memo(function PlayersHeader({
  playerCount,
  onAddClick,
}: PlayersHeaderProps) {
  return (
    <div className="border-b border-white/10 bg-gradient-to-br from-black via-emerald-950/20 to-black">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-600/20">
              <Users className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-emerald-400 to-yellow-400 bg-clip-text text-transparent">
                Players
              </h1>
              <p className="text-sm text-gray-400 mt-1">
                {playerCount} {playerCount === 1 ? 'player' : 'players'} registered
              </p>
            </div>
          </div>
          
          <Button
            onClick={onAddClick}
            className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 shadow-lg shadow-emerald-500/30"
          >
            <UserPlus className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Add Player</span>
            <span className="sm:hidden">Add</span>
          </Button>
        </div>
      </div>
    </div>
  );
});
