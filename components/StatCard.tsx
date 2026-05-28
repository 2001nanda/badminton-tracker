import { Card } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  gradient?: string;
}

export function StatCard({ title, value, subtitle, icon: Icon, gradient = 'from-emerald-500 to-emerald-600' }: StatCardProps) {
  return (
    <Card className="relative overflow-hidden border-white/10 bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-sm">
      <div className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm text-gray-400 font-medium mb-2">{title}</p>
            <p className="text-3xl font-bold text-white mb-1">{value}</p>
            {subtitle && (
              <p className="text-sm text-gray-300">{subtitle}</p>
            )}
          </div>
          <div className={cn('p-3 rounded-xl bg-gradient-to-br', gradient)}>
            <Icon className="w-6 h-6 text-white" />
          </div>
        </div>
      </div>
      <div className={cn('absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r', gradient)} />
    </Card>
  );
}
