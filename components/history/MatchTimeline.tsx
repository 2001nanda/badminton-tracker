'use client';

import { memo } from 'react';
import { Match, Player } from '@/lib/types';
import { ActivityMatchCard } from '@/components/activity/ActivityMatchCard';
import { BattleCardSkeleton } from '@/components/dashboard/BattleCardSkeleton';
import { EmptyHistory } from './EmptyHistory';
import { format, isToday, isYesterday, isThisWeek } from 'date-fns';

interface MatchTimelineProps {
  matches: Match[];
  players: Player[];
  loading: boolean;
  selectionMode?: boolean;
  selectedMatches?: Set<string>;
  onToggleSelection?: (matchId: string) => void;
}

export const MatchTimeline = memo(function MatchTimeline({
  matches,
  players,
  loading,
  selectionMode = false,
  selectedMatches = new Set(),
  onToggleSelection,
}: MatchTimelineProps) {
  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(8)].map((_, i) => (
          <BattleCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (matches.length === 0) {
    return <EmptyHistory />;
  }

  // Group matches by date
  const groupedMatches = matches.reduce((groups, match) => {
    let dateLabel: string;
    
    if (isToday(match.createdAt)) {
      dateLabel = 'Today';
    } else if (isYesterday(match.createdAt)) {
      dateLabel = 'Yesterday';
    } else if (isThisWeek(match.createdAt)) {
      dateLabel = format(match.createdAt, 'EEEE');
    } else {
      dateLabel = format(match.createdAt, 'MMMM d, yyyy');
    }

    if (!groups[dateLabel]) {
      groups[dateLabel] = [];
    }
    groups[dateLabel].push(match);
    return groups;
  }, {} as Record<string, Match[]>);

  return (
    <div className="space-y-8">
      {Object.entries(groupedMatches).map(([dateLabel, dateMatches]) => (
        <div key={dateLabel}>
          {/* Date Header */}
          <div className="sticky top-0 z-10 bg-black/80 backdrop-blur-sm py-3 mb-4">
            <h3 className="text-lg font-bold text-emerald-400">{dateLabel}</h3>
            <div className="h-px bg-gradient-to-r from-emerald-500/50 to-transparent mt-2" />
          </div>

          {/* Matches for this date */}
          <div className="space-y-4">
            {dateMatches.map((match) => (
              <ActivityMatchCard
                key={match.id}
                match={match}
                players={players}
                selectionMode={selectionMode}
                isSelected={selectedMatches.has(match.id)}
                onToggleSelection={onToggleSelection}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
});
