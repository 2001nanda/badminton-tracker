'use client';

import { memo } from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatsCardProps {
  icon: LucideIcon;
  iconColor: string;
  title: string;
  value: string;
  subtitle: string;
  gradient: string;
  glowColor: string;
}

export const StatsCard = memo(function StatsCard({
  icon: Icon,
  iconColor,
  title,
  value,
  subtitle,
}: StatsCardProps) {
  return (
    <div className="glass-card glass-card-hover rounded-2xl p-5 animate-fade-in">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">
            {title}
          </p>
        </div>
        <div className={cn('p-2 rounded-lg', iconColor)}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      
      <div>
        <h3 className="text-2xl font-bold text-white mb-1 truncate">
          {value}
        </h3>
        <p className="text-sm text-slate-400">
          {subtitle}
        </p>
      </div>
    </div>
  );
});
