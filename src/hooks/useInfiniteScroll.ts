import { useState, useEffect, useRef, useMemo, useCallback } from 'react';

interface UseInfiniteScrollOptions<T> {
  /** Full list of items to paginate */
  items: T[];
  /** Items per page */
  pageSize: number;
  /** Optional: root margin for IntersectionObserver */
  rootMargin?: string;
}

interface UseInfiniteScrollResult<T> {
  /** Currently visible items (paginated) */
  visibleItems: T[];
  /** Ref to attach to the sentinel element at bottom of list */
  loadMoreRef: React.RefObject<HTMLDivElement>;
  /** Whether there are more items to load */
  hasMore: boolean;
  /** Total items count */
  totalCount: number;
  /** Currently visible count */
  visibleCount: number;
  /** Reset pagination (e.g., when filters change) */
  reset: () => void;
}

/**
 * Hook for client-side infinite scroll / lazy loading.
 * Paginates a pre-fetched list using IntersectionObserver.
 */
export function useInfiniteScroll<T>({
  items,
  pageSize,
  rootMargin = '200px',
}: UseInfiniteScrollOptions<T>): UseInfiniteScrollResult<T> {
  const [visibleCount, setVisibleCount] = useState(pageSize);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const hasMore = visibleCount < items.length;

  // Reset when items change (e.g., filter applied)
  const prevLengthRef = useRef(items.length);
  useEffect(() => {
    if (items.length !== prevLengthRef.current) {
      setVisibleCount(pageSize);
      prevLengthRef.current = items.length;
    }
  }, [items.length, pageSize]);

  // Setup IntersectionObserver
  useEffect(() => {
    observerRef.current?.disconnect();

    if (!hasMore) return;

    observerRef.current = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisibleCount(prev => Math.min(prev + pageSize, items.length));
        }
      },
      { rootMargin }
    );

    const el = loadMoreRef.current;
    if (el) observerRef.current.observe(el);

    return () => observerRef.current?.disconnect();
  }, [hasMore, pageSize, items.length, rootMargin]);

  const visibleItems = useMemo(
    () => items.slice(0, visibleCount),
    [items, visibleCount]
  );

  const reset = useCallback(() => {
    setVisibleCount(pageSize);
  }, [pageSize]);

  return {
    visibleItems,
    loadMoreRef: loadMoreRef as React.RefObject<HTMLDivElement>,
    hasMore,
    totalCount: items.length,
    visibleCount: Math.min(visibleCount, items.length),
    reset,
  };
}
