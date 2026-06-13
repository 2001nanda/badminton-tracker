'use client';

import { HistoryHeader } from '@/components/history/HistoryHeader';
import { HistoryFilters } from '@/components/history/HistoryFilters';
import { MatchTimeline } from '@/components/history/MatchTimeline';
import { SummaryCardModal, DatePickerModal } from '@/components/summary-card';
import { useMatchHistory } from '@/lib/hooks/useMatchHistory';
import { useOptimizedPlayers } from '@/lib/hooks/useOptimizedPlayers';
import { getMatchesByDate, getAvailableMatchDates, computeSummaryCardData } from '@/lib/utils/summaryCardUtils';
import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { PasswordDialog } from '@/components/ui/PasswordDialog';
import { useDeleteProtection } from '@/lib/contexts/DeleteProtectionContext';
import { Trash2, CheckSquare, X, Lock, Image } from 'lucide-react';
import { deleteMultipleMatches } from '@/lib/actions/matchActions';
import { toast } from 'sonner';
import { useMatches } from '@/lib/hooks/useMatches';
import { parseISO } from 'date-fns';

export default function HistoryPage() {
  const { players } = useOptimizedPlayers();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'singles' | 'doubles'>('all');
  const [filterPeriod, setFilterPeriod] = useState<'all' | 'week' | 'month'>('all');
  const [filterPlayer, setFilterPlayer] = useState<string>('all');
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedMatches, setSelectedMatches] = useState<Set<string>>(new Set());
  const [deleting, setDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [showSummaryCard, setShowSummaryCard] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedSummaryDate, setSelectedSummaryDate] = useState<string | null>(null);
  const { isDeleteEnabled, enableDelete } = useDeleteProtection();

  // Fetch all matches (unfiltered) for summary card generation
  const { matches: allMatches } = useMatches();

  const { matches, loading } = useMatchHistory({
    searchQuery,
    filterType,
    filterPeriod,
    filterPlayer,
  });

  // Get all dates that have matches
  const availableMatchDates = useMemo(
    () => getAvailableMatchDates(allMatches),
    [allMatches]
  );

  // Compute summary card data for the selected date
  const summaryCardData = useMemo(() => {
    if (!selectedSummaryDate) return null;
    const targetDate = parseISO(selectedSummaryDate);
    const matchesForDate = getMatchesByDate(allMatches, targetDate);
    return computeSummaryCardData(matchesForDate, players, targetDate);
  }, [allMatches, players, selectedSummaryDate]);

  const handleGenerateSummaryCard = () => {
    setShowDatePicker(true);
  };

  const handleDateSelected = (dateStr: string) => {
    setSelectedSummaryDate(dateStr);
    setShowDatePicker(false);
    setShowSummaryCard(true);
  };

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
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = async () => {
    setDeleting(true);
    try {
      const result = await deleteMultipleMatches(Array.from(selectedMatches));
      
      if (result.success) {
        toast.success('Matches deleted successfully! 🗑️', {
          description: `${selectedMatches.size} ${selectedMatches.size === 1 ? 'match' : 'matches'} removed`,
        });
        setSelectedMatches(new Set());
        setSelectionMode(false);
        setShowDeleteDialog(false);
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

  const handlePasswordSuccess = () => {
    toast.success('Delete mode enabled! 🔓', {
      description: 'You can now delete matches',
    });
  };

  const handleEnableDeleteMode = () => {
    if (!isDeleteEnabled) {
      setShowPasswordDialog(true);
    } else {
      setSelectionMode(true);
    }
  };

  return (
    <div className="min-h-screen">
      <PasswordDialog
        isOpen={showPasswordDialog}
        onClose={() => setShowPasswordDialog(false)}
        onSuccess={() => {
          enableDelete('iamnoob');
          handlePasswordSuccess();
          setSelectionMode(true);
        }}
      />
      
      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleConfirmDelete}
        title={`Delete ${selectedMatches.size} ${selectedMatches.size === 1 ? 'Match' : 'Matches'}?`}
        description={`Are you sure you want to delete ${selectedMatches.size} ${selectedMatches.size === 1 ? 'match' : 'matches'}? This action cannot be undone and all match data will be permanently removed.`}
        confirmText={`Delete ${selectedMatches.size === 1 ? 'Match' : 'Matches'}`}
        cancelText="Cancel"
        variant="danger"
        loading={deleting}
      />

      <DatePickerModal
        isOpen={showDatePicker}
        onClose={() => setShowDatePicker(false)}
        onSelectDate={handleDateSelected}
        availableDates={availableMatchDates}
      />

      {summaryCardData && (
        <SummaryCardModal
          isOpen={showSummaryCard}
          onClose={() => setShowSummaryCard(false)}
          data={summaryCardData}
        />
      )}
      
      <HistoryHeader totalMatches={matches.length} />
      
      <div className="container mx-auto px-4 py-6 max-w-5xl">
        {/* Selection Mode Controls */}
        {!selectionMode ? (
          <div className="mb-4 flex justify-end gap-2">
            <Button
              onClick={handleGenerateSummaryCard}
              variant="outline"
              className="border-emerald-500/30 hover:bg-emerald-500/10 text-emerald-400 hover:text-emerald-300"
              disabled={loading}
            >
              <Image className="w-4 h-4 mr-2" />
              Generate Summary Card
            </Button>
            <Button
              onClick={handleEnableDeleteMode}
              variant="outline"
              className="border-white/10 hover:bg-white/10 text-white"
              disabled={matches.length === 0}
            >
              {isDeleteEnabled ? (
                <>
                  <CheckSquare className="w-4 h-4 mr-2" />
                  Select Matches
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4 mr-2" />
                  Enable Delete Mode
                </>
              )}
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
