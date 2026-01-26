import { motion, AnimatePresence } from 'framer-motion';
import { Plane, MapPin, Compass, Timer, Navigation, Sparkles } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { useTravelMode } from '@/contexts/TravelModeContext';

export const TravelModeToggle = () => {
  const { isTravelMode, toggleTravelMode } = useTravelMode();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
    >
      <motion.div 
        className={`relative overflow-hidden rounded-2xl transition-all duration-500 ${
          isTravelMode 
            ? 'shadow-xl shadow-primary/20' 
            : 'shadow-lg'
        }`}
        style={{
          background: isTravelMode 
            ? 'linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(280 70% 50%) 50%, hsl(320 70% 50%) 100%)'
            : 'hsl(var(--card))',
          border: `1px solid ${isTravelMode ? 'rgba(255,255,255,0.2)' : 'hsl(var(--border))'}`,
        }}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
      >
        {/* Animated background effects when active */}
        <AnimatePresence>
          {isTravelMode && (
            <>
              {/* Floating orbs */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 overflow-hidden pointer-events-none"
              >
                <motion.div
                  className="absolute -top-10 -right-10 w-32 h-32 bg-white/20 rounded-full blur-3xl"
                  animate={{ 
                    scale: [1, 1.2, 1],
                    x: [0, 10, 0],
                    y: [0, -10, 0],
                  }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                />
                <motion.div
                  className="absolute -bottom-8 -left-8 w-24 h-24 bg-purple-300/30 rounded-full blur-2xl"
                  animate={{ 
                    scale: [1, 1.3, 1],
                    x: [0, -5, 0],
                    y: [0, 5, 0],
                  }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
                />
                
                {/* Animated plane */}
                <motion.div
                  initial={{ x: -60, y: 80 }}
                  animate={{ x: 200, y: -40 }}
                  transition={{ 
                    duration: 4, 
                    repeat: Infinity, 
                    repeatType: 'loop',
                    ease: 'linear',
                    repeatDelay: 2,
                  }}
                  className="absolute opacity-30"
                >
                  <Plane className="w-5 h-5 text-white rotate-[-35deg]" />
                </motion.div>
              </motion.div>

              {/* Sparkle decorations */}
              <motion.div
                className="absolute top-3 right-16"
                animate={{ 
                  scale: [0.8, 1.2, 0.8],
                  opacity: [0.5, 1, 0.5],
                  rotate: [0, 180, 360],
                }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                <Sparkles className="w-3 h-3 text-yellow-300" />
              </motion.div>
            </>
          )}
        </AnimatePresence>

        <div className="relative z-10 p-4">
          {/* Header row */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              {/* Icon container */}
              <motion.div 
                className={`relative w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 ${
                  isTravelMode 
                    ? 'bg-white/20 shadow-inner' 
                    : 'bg-gradient-to-br from-primary/20 to-primary/5'
                }`}
                animate={isTravelMode ? { 
                  rotate: [0, 5, -5, 0],
                } : {}}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              >
                {isTravelMode ? (
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: 'spring', stiffness: 200 }}
                  >
                    <Compass className="w-6 h-6 text-white" />
                  </motion.div>
                ) : (
                  <Plane className="w-6 h-6 text-primary" />
                )}
              </motion.div>
              
              {/* Text content */}
              <div>
                <div className="flex items-center gap-2">
                  <h3 className={`font-bold text-base ${isTravelMode ? 'text-white' : 'text-foreground'}`}>
                    Modo Viagem
                  </h3>
                  {isTravelMode && (
                    <motion.span
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex items-center gap-1 px-2 py-0.5 bg-green-500/20 border border-green-400/30 rounded-full"
                    >
                      <span className="relative flex h-1.5 w-1.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-400" />
                      </span>
                      <span className="text-[10px] font-bold text-green-400 uppercase tracking-wider">Ativo</span>
                    </motion.span>
                  )}
                </div>
                <p className={`text-sm mt-0.5 ${isTravelMode ? 'text-white/80' : 'text-muted-foreground'}`}>
                  {isTravelMode ? 'Interface otimizada para os parques' : 'Otimize para uso no parque'}
                </p>
              </div>
            </div>

            {/* Toggle Switch */}
            <Switch
              checked={isTravelMode}
              onCheckedChange={toggleTravelMode}
              className={`scale-110 ${isTravelMode ? 'data-[state=checked]:bg-white/30' : ''}`}
            />
          </div>

          {/* Feature highlights */}
          <AnimatePresence mode="wait">
            {!isTravelMode && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="mt-4 pt-3 border-t border-border/30"
              >
                <div className="flex flex-wrap gap-2">
                  {[
                    { icon: MapPin, label: 'Mapa como Home', color: 'text-blue-400' },
                    { icon: Timer, label: 'Filas ao Vivo', color: 'text-amber-400' },
                    { icon: Navigation, label: 'GPS Ativo', color: 'text-green-400' },
                  ].map((feature, i) => (
                    <motion.span
                      key={feature.label}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-muted/50 border border-border/50 rounded-lg text-xs font-medium text-muted-foreground"
                    >
                      <feature.icon className={`w-3.5 h-3.5 ${feature.color}`} />
                      {feature.label}
                    </motion.span>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
};
