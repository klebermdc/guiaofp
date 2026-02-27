import { cn } from '@/lib/utils';

interface SkeletonCardProps {
  count?: number;
  variant?: 'default' | 'compact' | 'wide';
  className?: string;
}

/**
 * Reusable skeleton loader for card-based content.
 * Uses Tailwind animate-pulse for smooth loading animation.
 */
export const SkeletonCard = ({ count = 6, variant = 'default', className }: SkeletonCardProps) => {
  return (
    <div className={cn(
      "grid gap-3",
      variant === 'wide' ? "grid-cols-1" : "grid-cols-1 sm:grid-cols-2",
      className
    )}>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={cn(
            "rounded-lg border border-border bg-muted/30 animate-pulse",
            variant === 'compact' ? "p-3" : "p-4"
          )}
        >
          {/* Icon + Title row */}
          <div className="flex items-center gap-3 mb-3">
            <div className="h-8 w-8 rounded-md bg-muted" />
            <div className="flex-1 space-y-1.5">
              <div className="h-3.5 w-3/4 rounded bg-muted" />
              <div className="h-2.5 w-1/2 rounded bg-muted" />
            </div>
          </div>
          {variant !== 'compact' && (
            <>
              <div className="h-2.5 w-full rounded bg-muted mb-2" />
              <div className="h-2.5 w-2/3 rounded bg-muted" />
            </>
          )}
        </div>
      ))}
    </div>
  );
};

/**
 * Inline skeleton for single-line loading states (e.g., badges, labels).
 */
export const SkeletonLine = ({ width = 'w-24', className }: { width?: string; className?: string }) => (
  <div className={cn("h-3 rounded bg-muted animate-pulse", width, className)} />
);

/**
 * Skeleton for planner day rows.
 */
export const SkeletonPlannerDay = ({ count = 3 }: { count?: number }) => (
  <div className="space-y-4">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="rounded-xl border border-border bg-card animate-pulse">
        {/* Day header */}
        <div className="p-4 border-b border-border/50">
          <div className="flex items-center gap-2 mb-1">
            <div className="h-5 w-14 rounded bg-muted" />
          </div>
          <div className="h-4 w-48 rounded bg-muted mt-1" />
        </div>
        {/* Time slots grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 p-3">
          {Array.from({ length: 4 }).map((_, j) => (
            <div key={j} className="min-h-[100px] border-2 border-dashed border-border/30 rounded-lg p-2">
              <div className="flex items-center gap-1.5 mb-2 pb-1 border-b border-border/20">
                <div className="h-4 w-4 rounded bg-muted" />
                <div className="h-3 w-12 rounded bg-muted" />
              </div>
              <div className="space-y-1.5">
                {j % 2 === 0 && (
                  <div className="h-10 rounded-md bg-muted/50" />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    ))}
  </div>
);
