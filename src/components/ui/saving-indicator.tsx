import { Loader2, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SavingIndicatorProps {
  isSaving: boolean;
  className?: string;
  showSaved?: boolean;
}

export function SavingIndicator({ isSaving, className, showSaved = true }: SavingIndicatorProps) {
  if (!isSaving && !showSaved) return null;

  return (
    <div
      className={cn(
        'fixed bottom-4 right-4 z-50 flex items-center gap-2 px-3 py-2 rounded-full text-xs font-medium transition-all duration-300 shadow-lg backdrop-blur-sm',
        isSaving 
          ? 'bg-primary/90 text-primary-foreground' 
          : 'bg-success/90 text-white opacity-0 pointer-events-none',
        className
      )}
      style={{
        opacity: isSaving ? 1 : 0,
        transform: isSaving ? 'translateY(0)' : 'translateY(10px)',
      }}
    >
      {isSaving ? (
        <>
          <Loader2 className="w-3 h-3 animate-spin" />
          <span>Salvando...</span>
        </>
      ) : (
        <>
          <Check className="w-3 h-3" />
          <span>Salvo</span>
        </>
      )}
    </div>
  );
}
