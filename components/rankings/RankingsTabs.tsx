'use client';

import { memo } from 'react';
import { cn } from '@/lib/utils';
import { Calendar, CalendarDays, Infinity } from 'lucide-react';

type RankingPeriod = 'all-time' | 'week' | 'month';

interface RankingsTabsProps {
  value: RankingPeriod;
  onChange: (value: RankingPeriod) => void;
}

export const RankingsTabs = memo(function RankingsTabs({
  value,
  onChange,
}: RankingsTabsProps) {
  const tabs = [
    { value: 'all-time' as const, label: 'All Time', icon: Infinity },
    { value: 'week' as const, label: 'This Week', icon: Calendar },
    { value: 'month' as const, label: 'This Month', icon: CalendarDays },
  ];

  return (
    <div className="mb-6">
      <div className="grid grid-cols-3 gap-2 p-1 rounded-xl bg-white/5 border border-white/10">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.value}
              onClick={() => onChange(tab.value)}
              className={cn(
                'flex items-center justify-center space-x-2 px-4 py-3 rounded-lg font-semibold transition-all',
                value === tab.value
                  ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              )}
            >
              <Icon className="w-4 h-4" />
              <span className="hidden sm:inline">{tab.label}</span>
              <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
});
