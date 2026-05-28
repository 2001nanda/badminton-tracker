import { Skeleton } from '@/components/ui/skeleton';

export function StatsCardSkeleton() {
  return (
    <div className="glass-card rounded-2xl p-5 animate-pulse">
      <div className="flex items-start justify-between mb-4">
        <Skeleton className="h-3 w-24 bg-white/10" />
        <Skeleton className="h-9 w-9 rounded-lg bg-white/10" />
      </div>
      <Skeleton className="h-7 w-32 mb-2 bg-white/10" />
      <Skeleton className="h-4 w-28 bg-white/10" />
    </div>
  );
}
