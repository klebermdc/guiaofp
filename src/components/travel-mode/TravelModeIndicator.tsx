import { motion } from 'framer-motion';
import { Compass, Power, Sparkles } from 'lucide-react';
import { useTravelMode } from '@/contexts/TravelModeContext';

export const TravelModeIndicator = () => {
  const { isTravelMode, disableTravelMode } = useTravelMode();

  if (!isTravelMode) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.9 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      className="absolute top-2 left-2 z-20 flex items-center gap-2"
    >
      {/* Main Badge */}
      <motion.div 
        className="relative flex items-center gap-2 px-3 py-2 rounded-2xl shadow-xl overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.9) 0%, rgba(147, 51, 234, 0.9) 50%, rgba(236, 72, 153, 0.9) 100%)',
          backdropFilter: 'blur(12px)',
        }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        {/* Animated background glow */}
        <motion.div
          className="absolute inset-0 opacity-50"
          animate={{
            background: [
              'radial-gradient(circle at 0% 0%, rgba(255,255,255,0.3) 0%, transparent 50%)',
              'radial-gradient(circle at 100% 100%, rgba(255,255,255,0.3) 0%, transparent 50%)',
              'radial-gradient(circle at 0% 100%, rgba(255,255,255,0.3) 0%, transparent 50%)',
              'radial-gradient(circle at 0% 0%, rgba(255,255,255,0.3) 0%, transparent 50%)',
            ],
          }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* Sparkle effect */}
        <motion.div
          className="absolute -top-1 -right-1"
          animate={{ 
            scale: [1, 1.2, 1],
            rotate: [0, 15, 0],
            opacity: [0.7, 1, 0.7]
          }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <Sparkles className="w-3 h-3 text-yellow-300" />
        </motion.div>

        {/* Compass icon with rotation */}
        <motion.div
          className="relative z-10 flex items-center justify-center w-7 h-7 rounded-lg bg-white/20"
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
        >
          <Compass className="w-4 h-4 text-white" />
        </motion.div>

        {/* Text and status */}
        <div className="relative z-10 flex items-center gap-2">
          <span className="text-xs font-bold text-white tracking-wide">Modo Viagem</span>
          
          {/* Pulsing status dot */}
          <span className="relative flex h-2.5 w-2.5">
            <motion.span 
              className="absolute inline-flex h-full w-full rounded-full bg-green-400"
              animate={{ scale: [1, 1.5, 1], opacity: [1, 0, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-400 shadow-lg shadow-green-400/50" />
          </span>
        </div>
      </motion.div>
      
      {/* Exit Button */}
      <motion.button
        onClick={disableTravelMode}
        className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-background/80 backdrop-blur-md border border-border/50 shadow-lg text-foreground hover:bg-background transition-colors"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Power className="w-3.5 h-3.5" />
        <span className="text-xs font-semibold">Sair</span>
      </motion.button>
    </motion.div>
  );
};
