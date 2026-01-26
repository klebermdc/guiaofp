import { useState, memo, useCallback, forwardRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Map, Clock, X, Compass } from 'lucide-react';
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

const TravelModeQuickActionsInner = forwardRef<HTMLDivElement>((_, ref) => {
  const { isTravelMode, disableTravelMode } = useTravelMode();
  const [isExpanded, setIsExpanded] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleAction = useCallback((path: string) => {
    navigate(path);
    setIsExpanded(false);
  }, [navigate]);

  const toggleExpanded = useCallback(() => {
    setIsExpanded(prev => !prev);
  }, []);

  // Don't show on map page or when travel mode is off
  if (!isTravelMode || location.pathname === '/mapa') {
    return null;
  }

  return (
    <div ref={ref} className="fixed bottom-24 lg:bottom-6 right-4 z-50 flex flex-col items-end gap-2">
      {/* Quick Actions Menu */}
      {isExpanded && (
        <div className="flex flex-col gap-2 mb-2 animate-fade-in">
          {QUICK_ACTIONS.map((action) => (
            <Button
              key={action.id}
              onClick={() => handleAction(action.path)}
              className={`${action.color} text-white shadow-lg flex items-center gap-2 pr-4`}
              size="lg"
            >
              {action.icon}
              <span className="text-sm font-medium">{action.label}</span>
            </Button>
          ))}

          {/* Exit Travel Mode */}
          <Button
            onClick={disableTravelMode}
            variant="outline"
            className="shadow-lg flex items-center gap-2 bg-background/95"
            size="lg"
          >
            <X className="w-4 h-4" />
            <span className="text-sm">Sair do Modo Viagem</span>
          </Button>
        </div>
      )}

      {/* Main FAB Button */}
      <Button
        onClick={toggleExpanded}
        className={`w-14 h-14 rounded-full shadow-xl transition-colors ${
          isExpanded 
            ? 'bg-muted text-foreground' 
            : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
        }`}
        size="icon"
      >
        {isExpanded ? (
          <X className="w-6 h-6" />
        ) : (
          <div className="relative">
            <Compass className="w-6 h-6" />
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500" />
            </span>
          </div>
        )}
      </Button>

      {/* Travel Mode Label */}
      {!isExpanded && (
        <div className="text-[10px] font-medium text-muted-foreground bg-background/80 px-2 py-0.5 rounded-full">
          Modo Viagem
        </div>
      )}
    </div>
  );
});

TravelModeQuickActionsInner.displayName = 'TravelModeQuickActionsInner';

export const TravelModeQuickActions = memo(TravelModeQuickActionsInner);
