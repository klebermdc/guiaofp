import { memo } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export const AttractionsPageSkeleton = memo(function AttractionsPageSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
      </div>

      {/* Summary cards skeleton */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-xl border bg-card p-4">
            <div className="text-center space-y-2">
              <Skeleton className="h-8 w-12 mx-auto" />
              <Skeleton className="h-3 w-16 mx-auto" />
            </div>
          </div>
        ))}
      </div>

      {/* Generate itinerary card skeleton */}
      <div className="rounded-xl border bg-card p-4 space-y-3">
        <div className="p-3 rounded-lg bg-muted/50 space-y-2">
          <Skeleton className="h-4 w-64" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-3/4" />
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
          <Skeleton className="h-10 w-full sm:w-40" />
        </div>
      </div>

      {/* Tabs skeleton */}
      <div className="space-y-4">
        <div className="flex flex-wrap gap-1 p-2 rounded-xl bg-muted/50">
          {Array.from({ length: 7 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-24" />
          ))}
        </div>

        {/* Attraction cards skeleton */}
        <div className="rounded-xl border bg-card overflow-hidden">
          <div className="h-16 bg-gradient-to-r from-primary/20 to-primary/10" />
          <div className="p-4 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="p-3 rounded-lg border space-y-2">
                <div className="flex items-start gap-3">
                  <Skeleton className="h-5 w-5 mt-1" />
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-5 w-40" />
                      <Skeleton className="h-5 w-16 rounded-full" />
                    </div>
                    <Skeleton className="h-4 w-full" />
                    <div className="flex gap-2">
                      <Skeleton className="h-5 w-16 rounded-full" />
                      <Skeleton className="h-5 w-16 rounded-full" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
});

export default AttractionsPageSkeleton;
