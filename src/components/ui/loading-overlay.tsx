import { createContext, useContext, useState, useCallback, ReactNode, forwardRef } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoadingContextType {
  isLoading: boolean;
  message: string;
  showLoading: (message?: string) => void;
  hideLoading: () => void;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export const useLoading = () => {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
};

interface LoadingProviderProps {
  children: ReactNode;
}

export const LoadingProvider = ({ children }: LoadingProviderProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('Carregando...');

  const showLoading = useCallback((msg?: string) => {
    setMessage(msg || 'Carregando...');
    setIsLoading(true);
  }, []);

  const hideLoading = useCallback(() => {
    setIsLoading(false);
  }, []);

  return (
    <LoadingContext.Provider value={{ isLoading, message, showLoading, hideLoading }}>
      {children}
      {isLoading && <LoadingOverlay message={message} />}
    </LoadingContext.Provider>
  );
};

interface LoadingOverlayProps {
  message?: string;
  className?: string;
}

export const LoadingOverlay = forwardRef<HTMLDivElement, LoadingOverlayProps>(
  ({ message, className }, ref) => {
    return (
      <div 
        ref={ref}
        className={cn(
          "fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50",
          "animate-fade-in",
          className
        )}
        role="status"
        aria-live="polite"
      >
        <div className="bg-card border border-border p-6 rounded-xl shadow-lg flex flex-col items-center gap-4 min-w-[200px]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-foreground font-medium text-center">
            {message || 'Carregando...'}
          </p>
        </div>
      </div>
    );
  }
);

LoadingOverlay.displayName = 'LoadingOverlay';
