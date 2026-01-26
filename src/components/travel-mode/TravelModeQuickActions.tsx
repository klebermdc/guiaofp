import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { Map, Clock, X, Compass, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTravelMode } from '@/contexts/TravelModeContext';

interface QuickAction {
  id: string;
  icon: React.ReactNode;
  label: string;
  path: string;
  color: string;
}

const QUICK_ACTIONS: QuickAction[] = [
  {
    id: 'map',
    icon: <Map className="w-5 h-5" />,
    label: 'Mapa + GPS',
    path: '/mapa',
    color: 'bg-blue-500 hover:bg-blue-600',
  },
  {
    id: 'queues',
    icon: <Clock className="w-5 h-5" />,
    label: 'Filas ao Vivo',
    path: '/mapa',
    color: 'bg-amber-500 hover:bg-amber-600',
  },
];

export const TravelModeQuickActions = () => {
  const { isTravelMode, disableTravelMode } = useTravelMode();
  const [isExpanded, setIsExpanded] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Don't show on map page (it's the main page in travel mode)
  if (!isTravelMode || location.pathname === '/mapa') {
    return null;
  }

  const handleAction = (action: QuickAction) => {
    navigate(action.path);
    setIsExpanded(false);
  };

  return (
    <div className="fixed bottom-24 lg:bottom-6 right-4 z-50 flex flex-col items-end gap-2">
      {/* Quick Actions Menu */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="flex flex-col gap-2 mb-2"
          >
            {QUICK_ACTIONS.map((action, index) => (
              <motion.div
                key={action.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: index * 0.05 }}
              >
                <Button
                  onClick={() => handleAction(action)}
                  className={`${action.color} text-white shadow-lg flex items-center gap-2 pr-4`}
                  size="lg"
                >
                  {action.icon}
                  <span className="text-sm font-medium">{action.label}</span>
                </Button>
              </motion.div>
            ))}

            {/* Exit Travel Mode */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ delay: QUICK_ACTIONS.length * 0.05 }}
            >
              <Button
                onClick={disableTravelMode}
                variant="outline"
                className="shadow-lg flex items-center gap-2 bg-background/95 backdrop-blur-sm"
                size="lg"
              >
                <X className="w-4 h-4" />
                <span className="text-sm">Sair do Modo Viagem</span>
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main FAB Button */}
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Button
          onClick={() => setIsExpanded(!isExpanded)}
          className={`w-14 h-14 rounded-full shadow-xl transition-all duration-300 ${
            isExpanded 
              ? 'bg-muted text-foreground' 
              : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
          }`}
          size="icon"
        >
          <AnimatePresence mode="wait">
            {isExpanded ? (
              <motion.div
                key="close"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
              >
                <X className="w-6 h-6" />
              </motion.div>
            ) : (
              <motion.div
                key="compass"
                initial={{ rotate: 90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: -90, opacity: 0 }}
                className="relative"
              >
                <Compass className="w-6 h-6" />
                {/* Pulsing indicator */}
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </Button>
      </motion.div>

      {/* Travel Mode Label */}
      {!isExpanded && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-[10px] font-medium text-muted-foreground bg-background/80 backdrop-blur-sm px-2 py-0.5 rounded-full"
        >
          Modo Viagem
        </motion.div>
      )}
    </div>
  );
};
