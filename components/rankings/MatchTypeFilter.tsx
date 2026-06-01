'use client';

import { memo } from 'react';
import { cn } from '@/lib/utils';
import { Users, User } from 'lucide-react';

type MatchTypeFilterValue = 'all' | 'singles' | 'doubles';

interface MatchTypeFilterProps {
  value: MatchTypeFilterValue;
  onChange: (value: MatchTypeFilterValue) => void;
}

export const MatchTypeFilter = memo(function MatchTypeFilter({
  value,
  onChange,
}: MatchTypeFilterProps) {
  const filters = [
    { value: 'all' as const, label: 'All Matches', icon: null },
    { value: 'singles' as const, label: 'Singles', icon: User },
    { value: 'doubles' as const, label: 'Doubles', icon: Users },
  ];

  return (
    <div className="mb-6">
      <div className="flex items-center space-x-2 p-1 rounded-xl bg-white/5 border border-white/10">
        {filters.map((filter) => {
          const Icon = filter.icon;
          return (
            <button
              key={filter.value}
              onClick={() => onChange(filter.value)}
              className={cn(
                'flex-1 flex items-center justify-center space-x-2 px-4 py-2.5 rounded-lg font-medium transition-all',
                value === filter.value
                  ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white shadow-lg'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              )}
            >
              {Icon && <Icon className="w-4 h-4" />}
              <span className="text-sm">{filter.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
});
