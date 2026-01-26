import { Skeleton, SkeletonCard, SkeletonList } from './skeleton';

// Dashboard skeleton for loading states
export function DashboardSkeleton() {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Welcome Header Skeleton */}
      <div className="rounded-2xl gradient-primary p-8 opacity-60">
        <Skeleton className="h-4 w-32 mb-2 bg-white/20" />
        <Skeleton className="h-10 w-64 mb-2 bg-white/20" />
        <Skeleton className="h-5 w-48 bg-white/20" />
      </div>

      {/* Quick Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-xl border bg-card p-6">
            <div className="flex items-center gap-4">
              <Skeleton className="h-12 w-12 rounded-xl" />
              <div className="space-y-2">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-4 w-32" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SkeletonCard />
        <SkeletonCard />
      </div>
    </div>
  );
}

// Map sidebar skeleton
export function MapSidebarSkeleton() {
  return (
    <div className="space-y-3 p-4">
      <Skeleton className="h-6 w-32 mb-4" />
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="rounded-lg border bg-card p-3">
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-lg" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
            <Skeleton className="h-6 w-12 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

// Client list skeleton for admin
export function ClientListSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-10 w-32" />
      </div>
      <SkeletonList count={5} />
    </div>
  );
}

// Profile form skeleton
export function ProfileFormSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <Skeleton className="h-6 w-40" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
        <Skeleton className="h-10 w-full" />
      </div>
      <div className="space-y-4">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-24 w-full" />
      </div>
    </div>
  );
}

// Content list skeleton
export function ContentListSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i} className="rounded-xl border bg-card overflow-hidden">
          <Skeleton className="h-40 w-full rounded-none" />
          <div className="p-4 space-y-2">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </div>
      ))}
    </div>
  );
}

// Table skeleton
export function TableSkeleton({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className="rounded-lg border overflow-hidden">
      <div className="bg-muted/50 p-4 flex gap-4">
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton key={i} className="h-4 flex-1" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="p-4 flex gap-4 border-t">
          {Array.from({ length: cols }).map((_, colIndex) => (
            <Skeleton key={colIndex} className="h-4 flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
}

// Inline loading placeholder
export function InlineLoader({ className = '' }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 text-muted-foreground ${className}`}>
      <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      <span className="text-sm">Carregando...</span>
    </div>
  );
}
