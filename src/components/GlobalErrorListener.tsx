import { useEffect } from 'react';
import { handleError } from '@/lib/error-handler';
import { useLoading } from '@/components/ui/loading-overlay';

/**
 * Captures errors that ErrorBoundaries don't catch (async/unhandled rejections)
 * and prevents the app from "falling apart" silently.
 */
export function GlobalErrorListener() {
  const { hideLoading } = useLoading();

  useEffect(() => {
    const onError = (event: ErrorEvent) => {
      // Ensure global loading is not stuck on screen
      hideLoading();

      handleError(event.error ?? event.message, {
        title: 'Erro inesperado',
        description: 'Ocorreu um erro. Recarregue a página e tente novamente.',
      });

      event.preventDefault();
    };

    const onUnhandledRejection = (event: PromiseRejectionEvent) => {
      hideLoading();

      handleError(event.reason, {
        title: 'Erro inesperado',
        description: 'Ocorreu um erro. Recarregue a página e tente novamente.',
      });

      event.preventDefault();
    };

    window.addEventListener('error', onError);
    window.addEventListener('unhandledrejection', onUnhandledRejection);

    return () => {
      window.removeEventListener('error', onError);
      window.removeEventListener('unhandledrejection', onUnhandledRejection);
    };
  }, [hideLoading]);

  return null;
}
