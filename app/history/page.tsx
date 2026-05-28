'use client';

import { HistoryHeader } from '@/components/history/HistoryHeader';
import { HistoryFilters } from '@/components/history/HistoryFilters';
import { MatchTimeline } from '@/components/history/MatchTimeline';
import { useMatchHistory } from '@/lib/hooks/useMatchHistory';
import { useOptimizedPlayers } from '@/lib/hooks/useOptimizedPlayers';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Trash2, CheckSquare, X } from 'lucide-react';
import { deleteMultipleMatches } from '@/lib/actions/matchActions';
import { toast } from 'sonner';

export default function HistoryPage() {
  const { players } = useOptimizedPlayers();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'singles' | 'doubles'>('all');
  const [filterPeriod, setFilterPeriod] = useState<'all' | 'week' | 'month'>('all');
  const [filterPlayer, setFilterPlayer] = useState<string>('all');
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedMatches, setSelectedMatches] = useState<Set<string>>(new Set());
  const [deleting, setDeleting] = useState(false);

  const { matches, loading } = useMatchHistory({
    searchQuery,
    filterType,
    filterPeriod,
    filterPlayer,
  });

  const handleToggleSelection = (matchId: string) => {
    setSelectedMatches(prev => {
      const newSet = new Set(prev);
      if (newSet.has(matchId)) {
        newSet.delete(matchId);
      } else {
        newSet.add(matchId);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (selectedMatches.size === matches.length) {
      setSelectedMatches(new Set());
    } else {
      setSelectedMatches(new Set(matches.map(m => m.id)));
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedMatches.size === 0) return;

    const confirmed = window.confirm(
      `Are you sure you want to delete ${selectedMatches.size} ${selectedMatches.size === 1 ? 'match' : 'matches'}? This action cannot be undone.`
    );

    if (!confirmed) return;

    setDeleting(true);
    try {
      const result = await deleteMultipleMatches(Array.from(selectedMatches));
      
      if (result.success) {
        toast.success('Matches deleted successfully! 🗑️', {
          description: `${selectedMatches.size} ${selectedMatches.size === 1 ? 'match' : 'matches'} removed`,
        });
        setSelectedMatches(new Set());
        setSelectionMode(false);
      } else {
        toast.error('Failed to delete matches', {
          description: 'Please try again',
        });
      }
    } catch (error) {
      console.error('Error deleting matches:', error);
      toast.error('An error occurred', {
        description: 'Please check your connection and try again',
      });
    } finally {
      setDeleting(false);
    }
  };

  const handleCancelSelection = () => {
    setSelectionMode(false);
    setSelectedMatches(new Set());
  };

  return (
    <div className="min-h-screen">
      <HistoryHeader totalMatches={matches.length} />
      
      <div className="container mx-auto px-4 py-6 max-w-5xl">
        {/* Selection Mode Controls */}
        {!selectionMode ? (
          <div className="mb-4 flex justify-end">
            <Button
              onClick={() => setSelectionMode(true)}
              variant="outline"
              className="border-white/10 hover:bg-white/10 text-white"
              disabled={matches.length === 0}
            >
              <CheckSquare className="w-4 h-4 mr-2" />
              Select Matches
            </Button>
          </div>
        ) : (
          <div className="mb-4 glass-card rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                onClick={handleSelectAll}
                variant="outline"
                size="sm"
                className="border-white/10 hover:bg-white/10 text-white"
              >
                {selectedMatches.size === matches.length ? 'Deselect All' : 'Select All'}
              </Button>
              <span className="text-sm text-slate-400">
                {selectedMatches.size} of {matches.length} selected
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                onClick={handleDeleteSelected}
                disabled={selectedMatches.size === 0 || deleting}
                className="bg-red-500 hover:bg-red-600 text-white"
                size="sm"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Selected
              </Button>
              <Button
                onClick={handleCancelSelection}
                variant="outline"
                size="sm"
                className="border-white/10 hover:bg-white/10 text-white"
              >
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
            </div>
          </div>
        )}

        <HistoryFilters
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          filterType={filterType}
          onTypeChange={setFilterType}
          filterPeriod={filterPeriod}
          onPeriodChange={setFilterPeriod}
          filterPlayer={filterPlayer}
          onPlayerChange={setFilterPlayer}
          players={players}
        />
        
        <MatchTimeline
          matches={matches}
          players={players}
          loading={loading}
          selectionMode={selectionMode}
          selectedMatches={selectedMatches}
          onToggleSelection={handleToggleSelection}
        />
      </div>
    </div>
  );
}
