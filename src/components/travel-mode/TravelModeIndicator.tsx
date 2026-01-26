import { motion } from 'framer-motion';
import { Compass, Power } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTravelMode } from '@/contexts/TravelModeContext';

export const TravelModeIndicator = () => {
  const { isTravelMode, disableTravelMode } = useTravelMode();

  if (!isTravelMode) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="absolute top-2 left-2 z-20 flex items-center gap-2"
    >
      <div className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full shadow-lg">
        <motion.div
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
        >
          <Compass className="w-4 h-4" />
        </motion.div>
        <span className="text-xs font-semibold">Modo Viagem</span>
        <span className="flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-green-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-green-400"></span>
        </span>
      </div>
      
      <Button
        variant="secondary"
        size="sm"
        onClick={disableTravelMode}
        className="h-7 px-2 text-xs shadow-lg"
      >
        <Power className="w-3 h-3 mr-1" />
        Sair
      </Button>
    </motion.div>
  );
};
