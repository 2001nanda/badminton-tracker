'use client';

import { memo } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { PlusCircle, Swords, Trophy, Users } from 'lucide-react';

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
      href: '/combinations',
      icon: Swords,
      label: 'Duos / H2H',
      gradient: 'from-purple-500 to-purple-600',
      hoverGradient: 'hover:from-purple-600 hover:to-purple-700',
    },
    {
      href: '/rankings',
      icon: Trophy,
      label: 'Rankings',
      gradient: 'from-yellow-500 to-yellow-600',
      hoverGradient: 'hover:from-yellow-600 hover:to-yellow-700',
    },
    {
      href: '/players',
      icon: Users,
      label: 'Players',
      gradient: 'from-blue-500 to-blue-600',
      hoverGradient: 'hover:from-blue-600 hover:to-blue-700',
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 mb-6">
      {actions.map((action) => {
        const Icon = action.icon;
        return (
          <Link key={action.href} href={action.href}>
            <Button
              className={`w-full h-16 bg-gradient-to-r ${action.gradient} ${action.hoverGradient} rounded-2xl shadow-md transition-all hover:scale-105 border border-white/10`}
            >
              <div className="flex items-center space-x-2.5">
                <Icon className="w-5 h-5 text-white" />
                <span className="text-sm font-bold text-white">{action.label}</span>
              </div>
            </Button>
          </Link>
        );
      })}
    </div>
  );
});
