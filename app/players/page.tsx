'use client';

import { PlayersHeader } from '@/components/players/PlayersHeader';
import { PlayersGrid } from '@/components/players/PlayersGrid';
import { AddPlayerModal } from '@/components/players/AddPlayerModal';
import { PlayerSearch } from '@/components/players/PlayerSearch';
import { useOptimizedPlayers } from '@/lib/hooks/useOptimizedPlayers';
import { usePlayerStore } from '@/lib/store/usePlayerStore';
import { useMemo, useState } from 'react';

export default function PlayersPage() {
  const { players, loading } = useOptimizedPlayers();
  const { showAddModal, setShowAddModal } = usePlayerStore();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredPlayers = useMemo(() => {
    if (!searchQuery.trim()) return players;
    
    const query = searchQuery.toLowerCase();
    return players.filter(player => 
      player.name.toLowerCase().includes(query)
    );
  }, [players, searchQuery]);

  return (
    <div className="min-h-screen">
      <PlayersHeader 
        playerCount={players.length}
        onAddClick={() => setShowAddModal(true)}
      />
      
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <PlayerSearch 
          value={searchQuery}
          onChange={setSearchQuery}
          resultCount={filteredPlayers.length}
        />
        
        <PlayersGrid 
          players={filteredPlayers}
          loading={loading}
        />
      </div>

      <AddPlayerModal 
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
      />
    </div>
  );
}
