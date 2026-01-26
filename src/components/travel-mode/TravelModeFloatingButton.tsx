import { motion, AnimatePresence } from 'framer-motion';
import { Plane } from 'lucide-react';
import { useTravelMode } from '@/contexts/TravelModeContext';
import { useNavigate } from 'react-router-dom';

export const TravelModeFloatingButton = () => {
  const { isTravelMode, disableTravelMode } = useTravelMode();
  const navigate = useNavigate();

  if (!isTravelMode) return null;

  const handleClick = () => {
    navigate('/mapa');
  };

  return (
    <AnimatePresence>
      <motion.button
        initial={{ opacity: 0, scale: 0, x: -20 }}
        animate={{ opacity: 1, scale: 1, x: 0 }}
        exit={{ opacity: 0, scale: 0, x: -20 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleClick}
        className="fixed bottom-24 lg:bottom-6 left-6 z-50 h-16 w-16 rounded-full shadow-lg transition-all duration-300 overflow-hidden flex items-center justify-center"
        style={{
          background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 50%, #ec4899 100%)',
        }}
      >
        {/* Animated glow rings */}
        <motion.span
          className="absolute inset-0 rounded-full"
          style={{
            background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.5) 0%, rgba(139, 92, 246, 0.5) 50%, rgba(236, 72, 153, 0.5) 100%)',
          }}
          animate={{ scale: [1, 1.3, 1], opacity: [0.7, 0, 0.7] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        />
        
        {/* Second glow ring with offset timing */}
        <motion.span
          className="absolute inset-0 rounded-full"
          style={{
            background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.4) 0%, rgba(139, 92, 246, 0.4) 50%, rgba(236, 72, 153, 0.4) 100%)',
          }}
          animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
        />

        {/* Flying plane animation */}
        <motion.div
          className="relative z-10"
          animate={{ 
            y: [0, -3, 0],
            rotate: [0, 5, 0, -5, 0]
          }}
          transition={{ 
            duration: 3, 
            repeat: Infinity, 
            ease: 'easeInOut' 
          }}
        >
          <Plane className="w-7 h-7 text-white" strokeWidth={2.5} />
        </motion.div>

        {/* Active status indicator */}
        <motion.div
          className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-green-500 border-2 border-white flex items-center justify-center"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-white" />
        </motion.div>
      </motion.button>

      {/* Label below button */}
      <motion.span
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        className="fixed bottom-[4.5rem] lg:bottom-[0.5rem] left-6 z-50 text-[10px] font-semibold text-muted-foreground whitespace-nowrap w-16 text-center"
      >
        Modo Viagem
      </motion.span>
    </AnimatePresence>
  );
};
