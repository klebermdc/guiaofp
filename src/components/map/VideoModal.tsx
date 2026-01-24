import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Maximize2 } from 'lucide-react';

interface VideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoUrl: string;
  title: string;
}

export function VideoModal({ isOpen, onClose, videoUrl, title }: VideoModalProps) {
  const [isLandscape, setIsLandscape] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Detect orientation changes
  useEffect(() => {
    const checkOrientation = () => {
      setIsLandscape(window.innerWidth > window.innerHeight);
    };

    checkOrientation();
    window.addEventListener('resize', checkOrientation);
    window.addEventListener('orientationchange', checkOrientation);

    return () => {
      window.removeEventListener('resize', checkOrientation);
      window.removeEventListener('orientationchange', checkOrientation);
    };
  }, []);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const getYoutubeEmbedUrl = (url: string) => {
    const match = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
    return match ? `https://www.youtube.com/embed/${match[1]}` : url;
  };

  const isYoutube = videoUrl.includes('youtube') || videoUrl.includes('youtu.be');

  const handleBackdropClick = (e: React.MouseEvent | React.TouchEvent) => {
    if (e.target === containerRef.current) {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={containerRef}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 backdrop-blur-sm"
          onClick={handleBackdropClick}
          onTouchEnd={handleBackdropClick}
        >
          {/* Close button - only visible in portrait */}
          {!isLandscape && (
            <motion.button
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              onClick={onClose}
              className="absolute top-4 right-4 z-10 p-2 bg-white/10 hover:bg-white/20 active:bg-white/30 rounded-full backdrop-blur-sm transition-colors touch-manipulation"
            >
              <X className="w-6 h-6 text-white" />
            </motion.button>
          )}

          {/* Video container */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className={`relative ${
              isLandscape 
                ? 'w-full h-full' 
                : 'w-[95vw] max-w-lg aspect-video rounded-2xl overflow-hidden shadow-2xl'
            }`}
            onClick={(e) => e.stopPropagation()}
            onTouchEnd={(e) => e.stopPropagation()}
          >
            {/* Title bar - only in portrait */}
            {!isLandscape && (
              <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/80 to-transparent p-3 z-10">
                <h3 className="text-white font-semibold text-sm truncate pr-8">{title}</h3>
              </div>
            )}

            {/* Video player */}
            <div className={`w-full h-full bg-black ${isLandscape ? '' : 'rounded-2xl overflow-hidden'}`}>
              {isYoutube ? (
                <iframe
                  src={`${getYoutubeEmbedUrl(videoUrl)}?autoplay=1&playsinline=1&rel=0&modestbranding=1`}
                  className="w-full h-full"
                  allowFullScreen
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
                />
              ) : (
                <video 
                  src={videoUrl} 
                  controls 
                  autoPlay 
                  playsInline
                  className="w-full h-full object-contain" 
                />
              )}
            </div>

            {/* Landscape hint - only in portrait */}
            {!isLandscape && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 }}
                className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-black/60 backdrop-blur-sm px-3 py-1.5 rounded-full"
              >
                <Maximize2 className="w-3.5 h-3.5 text-white/80" />
                <span className="text-white/80 text-xs font-medium">Gire para tela cheia</span>
              </motion.div>
            )}

            {/* Close hint in landscape */}
            {isLandscape && (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                onClick={onClose}
                className="absolute top-3 right-3 p-2 bg-black/50 hover:bg-black/70 active:bg-black/80 rounded-full transition-colors touch-manipulation z-10"
              >
                <X className="w-5 h-5 text-white" />
              </motion.button>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
