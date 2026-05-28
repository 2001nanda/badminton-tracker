import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function RankingCardSkeleton() {
  return (
    <Card className="border-white/10 bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-sm">
      <div className="p-5">
        <div className="flex items-center space-x-4">
          <Skeleton className="w-12 h-12 rounded-full bg-white/10" />
          <Skeleton className="w-14 h-14 rounded-full bg-white/10" />
          <div className="flex-1">
            <Skeleton className="h-6 w-32 mb-2 bg-white/10" />
            <Skeleton className="h-4 w-24 bg-white/10" />
          </div>
          <div className="text-right">
            <Skeleton className="h-8 w-16 mb-1 bg-white/10" />
            <Skeleton className="h-3 w-12 bg-white/10" />
          </div>
        </div>
      </div>
    </Card>
  );
}
