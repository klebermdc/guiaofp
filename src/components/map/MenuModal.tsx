import { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import { X, UtensilsCrossed, Loader2, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MenuModalProps {
  menuUrl: string;
  restaurantName: string;
  onClose: () => void;
}

export function MenuModal({ menuUrl, restaurantName, onClose }: MenuModalProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const handleIframeLoad = () => {
    setIsLoading(false);
  };

  const handleIframeError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  return createPortal(
    <motion.div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      onClick={onClose}
    >
      <motion.div
        className="relative w-full h-full max-w-4xl max-h-[90vh] m-4 bg-background rounded-xl overflow-hidden shadow-2xl flex flex-col"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b bg-background shrink-0">
          <div className="flex items-center gap-2">
            <UtensilsCrossed className="w-5 h-5 text-primary" />
            <span className="font-medium text-sm truncate">{restaurantName}</span>
          </div>
          <div className="flex items-center gap-2">
            <a
              href={menuUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-full hover:bg-muted transition-colors"
              title="Abrir em nova aba"
            >
              <ExternalLink className="w-4 h-4 text-muted-foreground" />
            </a>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-muted transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Loading indicator */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-background z-10 mt-14">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Carregando cardápio...</p>
            </div>
          </div>
        )}

        {/* Error fallback */}
        {hasError && (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 p-6">
            <p className="text-muted-foreground text-center">
              Não foi possível carregar o cardápio dentro do app.
            </p>
            <Button asChild>
              <a href={menuUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="w-4 h-4 mr-2" />
                Abrir em nova aba
              </a>
            </Button>
          </div>
        )}

        {/* Iframe */}
        {!hasError && (
          <iframe
            src={menuUrl}
            className="flex-1 w-full border-0"
            title={`Cardápio - ${restaurantName}`}
            onLoad={handleIframeLoad}
            onError={handleIframeError}
            sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
          />
        )}
      </motion.div>
    </motion.div>,
    document.body
  );
}
