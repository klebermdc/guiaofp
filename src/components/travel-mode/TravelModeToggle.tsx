import { memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plane, MapPin, Power } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent } from '@/components/ui/card';
import { useTravelMode } from '@/contexts/TravelModeContext';

const TravelModeToggleComponent = () => {
  const { isTravelMode, toggleTravelMode } = useTravelMode();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
    >
      <Card 
        className={`relative overflow-hidden transition-all duration-500 ${
          isTravelMode 
            ? 'bg-gradient-to-r from-blue-600 to-purple-600 border-blue-500 shadow-lg shadow-blue-500/25' 
            : 'bg-gradient-to-r from-muted/50 to-muted/30 border-border'
        }`}
      >
        {/* Animated background effect when active */}
        <AnimatePresence>
          {isTravelMode && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="absolute inset-0 overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-purple-400/20 rounded-full blur-xl" />
              {/* Animated plane */}
              <motion.div
                initial={{ x: -50, y: 50 }}
                animate={{ x: 150, y: -50 }}
                transition={{ 
                  duration: 3, 
                  repeat: Infinity, 
                  repeatType: 'loop',
                  ease: 'linear' 
                }}
                className="absolute opacity-20"
              >
                <Plane className="w-6 h-6 text-white rotate-[-30deg]" />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <CardContent className="p-4 relative z-10">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <motion.div 
                className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors duration-300 ${
                  isTravelMode 
                    ? 'bg-white/20 text-white' 
                    : 'bg-primary/10 text-primary'
                }`}
                animate={isTravelMode ? { 
                  scale: [1, 1.1, 1],
                  rotate: [0, 5, -5, 0]
                } : {}}
                transition={{ duration: 2, repeat: Infinity }}
              >
                {isTravelMode ? (
                  <MapPin className="w-6 h-6" />
                ) : (
                  <Plane className="w-6 h-6" />
                )}
              </motion.div>
              
              <div>
                <h3 className={`font-semibold ${isTravelMode ? 'text-white' : 'text-foreground'}`}>
                  Modo Viagem
                </h3>
                <p className={`text-sm ${isTravelMode ? 'text-white/80' : 'text-muted-foreground'}`}>
                  {isTravelMode ? 'Ativo • Interface otimizada' : 'Otimize para uso no parque'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Status indicator */}
              <AnimatePresence mode="wait">
                {isTravelMode && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0 }}
                    className="flex items-center gap-1.5 px-2 py-1 bg-white/20 rounded-full"
                  >
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-green-400"></span>
                    </span>
                    <span className="text-xs font-medium text-white">ON</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Toggle Switch */}
              <Switch
                checked={isTravelMode}
                onCheckedChange={toggleTravelMode}
                className={isTravelMode ? 'data-[state=checked]:bg-white/30' : ''}
              />
            </div>
          </div>

          {/* Feature highlights when inactive */}
          <AnimatePresence>
            {!isTravelMode && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-3 pt-3 border-t border-border/50"
              >
                <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1 px-2 py-1 bg-muted rounded-full">
                    🗺️ Mapa como Home
                  </span>
                  <span className="flex items-center gap-1 px-2 py-1 bg-muted rounded-full">
                    ⏱️ Filas ao Vivo
                  </span>
                  <span className="flex items-center gap-1 px-2 py-1 bg-muted rounded-full">
                    📍 GPS Ativo
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export const TravelModeToggle = memo(TravelModeToggleComponent);