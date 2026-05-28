'use client';

import { memo } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { PlusCircle, Users, Trophy, History } from 'lucide-react';

export const QuickActions = memo(function QuickActions() {
  const actions = [
    {
      href: '/add-match',
      icon: PlusCircle,
      label: 'Add Match',
      gradient: 'from-emerald-500 to-emerald-600',
      hoverGradient: 'hover:from-emerald-600 hover:to-emerald-700',
    },
    {
      href: '/players',
      icon: Users,
      label: 'Players',
      gradient: 'from-blue-500 to-blue-600',
      hoverGradient: 'hover:from-blue-600 hover:to-blue-700',
    },
    {
      href: '/rankings',
      icon: Trophy,
      label: 'Rankings',
      gradient: 'from-yellow-500 to-yellow-600',
      hoverGradient: 'hover:from-yellow-600 hover:to-yellow-700',
    },
    {
      href: '/history',
      icon: History,
      label: 'History',
      gradient: 'from-purple-500 to-purple-600',
      hoverGradient: 'hover:from-purple-600 hover:to-purple-700',
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3">
      {actions.map((action) => {
        const Icon = action.icon;
        return (
          <Link key={action.href} href={action.href}>
            <Button
              className={`w-full h-20 bg-gradient-to-r ${action.gradient} ${action.hoverGradient} shadow-lg transition-all hover:scale-105`}
            >
              <div className="flex flex-col items-center space-y-1">
                <Icon className="w-6 h-6" />
                <span className="text-sm font-semibold">{action.label}</span>
              </div>
            </Button>
          </Link>
        );
      })}
    </div>
  );
});
