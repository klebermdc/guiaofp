import { useEffect, useRef, useCallback } from 'react';

/**
 * Hook that provides automatic recovery from stuck loading states.
 * If isLoading remains true for longer than maxDuration, onTimeout is called.
 */
export const useLoadingRecovery = (
  isLoading: boolean,
  onTimeout: () => void,
  maxDuration: number = 10000
) => {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const clearRecoveryTimeout = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (isLoading) {
      // Start timeout when loading begins
      clearRecoveryTimeout();
      timeoutRef.current = setTimeout(() => {
        console.warn('[LoadingRecovery] Loading stuck, triggering recovery');
        onTimeout();
      }, maxDuration);
    } else {
      // Clear timeout when loading ends
      clearRecoveryTimeout();
    }

    return clearRecoveryTimeout;
  }, [isLoading, onTimeout, maxDuration, clearRecoveryTimeout]);

  return { clearRecoveryTimeout };
};
