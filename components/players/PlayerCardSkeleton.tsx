import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function PlayerCardSkeleton() {
  return (
    <Card className="border-white/10 bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-sm">
      <div className="p-6">
        <div className="flex items-center space-x-4 mb-4">
          <Skeleton className="w-16 h-16 rounded-full bg-white/10" />
          <div className="flex-1">
            <Skeleton className="h-6 w-32 mb-2 bg-white/10" />
            <Skeleton className="h-4 w-24 bg-white/10" />
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-3 mb-4">
          <Skeleton className="h-16 rounded-lg bg-white/10" />
          <Skeleton className="h-16 rounded-lg bg-white/10" />
          <Skeleton className="h-16 rounded-lg bg-white/10" />
        </div>
        
        <Skeleton className="h-10 rounded-lg bg-white/10" />
      </div>
    </Card>
  );
}
