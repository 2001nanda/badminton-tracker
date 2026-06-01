'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, PlusCircle, Users, Trophy, History } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DeleteModeToggle } from './DeleteModeToggle';

const navItems = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/add-match', label: 'Add Match', icon: PlusCircle },
  { href: '/players', label: 'Players', icon: Users },
  { href: '/rankings', label: 'Rankings', icon: Trophy },
  { href: '/history', label: 'History', icon: History },
];

export function DesktopNavigation() {
  const pathname = usePathname();

  return (
    <nav className="hidden md:block border-b border-white/10 bg-gray-900/50 backdrop-blur-xl sticky top-0 z-50">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-yellow-400 rounded-lg flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <span className="text-xl">🏸</span>
            </div>
            <span className="text-lg font-bold text-white">
              Badminton Tracker
            </span>
          </div>
          <div className="flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-2 px-4 py-2 rounded-lg transition-all font-medium text-sm',
                    isActive
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
            <div className="ml-2 pl-2 border-l border-white/10">
              <DeleteModeToggle />
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

export function MobileNavigation() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 border-t border-white/10 bg-gray-900/95 backdrop-blur-xl z-50">
      <div className="flex justify-around items-center h-16 px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg transition-all flex-1',
                isActive
                  ? 'text-emerald-400'
                  : 'text-slate-400'
              )}
            >
              <Icon className={cn('w-5 h-5', isActive && 'scale-110')} />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
