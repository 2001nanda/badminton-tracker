import { Skeleton } from '@/components/ui/skeleton';

export function BattleCardSkeleton() {
  return (
    <div className="glass-card rounded-2xl overflow-hidden animate-pulse">
      {/* Header */}
      <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Skeleton className="h-7 w-7 rounded-lg bg-white/10" />
          <Skeleton className="h-4 w-16 bg-white/10" />
        </div>
        <Skeleton className="h-3 w-20 bg-white/10" />
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Team A */}
        <div className="p-3 rounded-xl bg-white/5">
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-32 bg-white/10" />
            <Skeleton className="h-7 w-12 bg-white/10" />
          </div>
        </div>

        {/* VS */}
        <div className="flex items-center justify-center">
          <Skeleton className="h-5 w-10 rounded-full bg-white/10" />
        </div>

        {/* Team B */}
        <div className="p-3 rounded-xl bg-white/5">
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-32 bg-white/10" />
            <Skeleton className="h-7 w-12 bg-white/10" />
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-4 py-2 border-t border-white/10 bg-black/20">
        <Skeleton className="h-3 w-40 mx-auto bg-white/10" />
      </div>
    </div>
  );
}
