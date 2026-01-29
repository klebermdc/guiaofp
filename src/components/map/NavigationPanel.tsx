/**
 * NavigationPanel Component
 * 
 * GPS-style navigation panel with route preview and guided navigation modes.
 * Extracted from ParkMap.tsx for maintainability.
 */

import { memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navigation, X, ChevronUp, ChevronDown, Home, Play, Pause, ArrowUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { RouteInfo, LatLng, NavigationMode } from '@/hooks/useParkNavigation';

interface NavigationPanelProps {
  routeInfo: RouteInfo;
  routeSteps: google.maps.DirectionsStep[];
  navigationMode: NavigationMode;
  userPosition: LatLng | null;
  isExpanded: boolean;
  bearingToDestination: number;
  mapRef: React.MutableRefObject<google.maps.Map | null>;
  onToggleExpanded: () => void;
  onStopNavigation: () => void;
  onStartGuidedNavigation: () => void;
  onSetNavigationMode: (mode: NavigationMode) => void;
  translateNavigationStep: (instruction: string) => string;
}

export const NavigationPanel = memo(function NavigationPanel({
  routeInfo,
  routeSteps,
  navigationMode,
  userPosition,
  isExpanded,
  bearingToDestination,
  mapRef,
  onToggleExpanded,
  onStopNavigation,
  onStartGuidedNavigation,
  onSetNavigationMode,
  translateNavigationStep,
}: NavigationPanelProps) {
  const navigate = useNavigate();

  const handleModeToggle = () => {
    if (navigationMode === 'preview') {
      onStartGuidedNavigation();
    } else {
      onSetNavigationMode('preview');
      // Reset map to show full route
      if (mapRef.current && userPosition && routeInfo.destination) {
        const bounds = new google.maps.LatLngBounds();
        bounds.extend(userPosition);
        bounds.extend(routeInfo.destination);
        mapRef.current.fitBounds(bounds, { top: 100, bottom: 250, left: 50, right: 50 });
        mapRef.current.setHeading(0);
        mapRef.current.setTilt(0);
      }
    }
  };

  return (
    <div className={`absolute bottom-0 left-0 right-0 z-20 transition-all duration-300 safe-area-bottom ${isExpanded ? 'h-auto' : 'h-16'}`}>
      <Card className="rounded-t-xl rounded-b-none border-t-2 border-blue-500 bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-2xl">
        {/* Collapse Toggle */}
        <button 
          onClick={onToggleExpanded}
          className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-blue-600 rounded-full p-1 shadow-lg"
        >
          {isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
        </button>

        <CardHeader className="py-2 pb-1 pt-4">
          <CardTitle className="text-sm flex items-center justify-between">
            <span className="flex items-center gap-2 truncate">
              <Navigation className={`w-4 h-4 shrink-0 ${navigationMode === 'guided' ? 'animate-pulse' : ''}`} />
              <span className="truncate">{routeInfo.destinationName}</span>
            </span>
            <div className="flex items-center gap-2 shrink-0">
              <span className="font-bold text-xs">{routeInfo.distance}</span>
              <span className="text-blue-200 text-xs">|</span>
              <span className="font-bold text-xs">{routeInfo.duration}</span>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => {
                  onStopNavigation();
                  navigate('/dashboard');
                }}
                className="text-white hover:bg-white/20 h-8 px-2 gap-1"
                title="Voltar ao início"
              >
                <Home className="w-4 h-4" />
                <span className="text-xs hidden sm:inline">Início</span>
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={onStopNavigation}
                className="text-white hover:bg-red-500/50 h-8 w-8 p-0"
                title="Parar navegação"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        
        {isExpanded && (
          <CardContent className="py-3 pb-5">
            {/* Mode indicator and controls */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Badge 
                  variant={navigationMode === 'guided' ? 'default' : 'secondary'}
                  className={navigationMode === 'guided' ? 'bg-green-500 text-white' : 'bg-white/20 text-white'}
                >
                  {navigationMode === 'guided' ? '🧭 Navegando' : '👁️ Visualizando rota'}
                </Badge>
              </div>
              
              {/* Play/Pause Navigation Button */}
              <Button
                size="sm"
                onClick={handleModeToggle}
                className={`gap-2 ${
                  navigationMode === 'guided' 
                    ? 'bg-amber-500 hover:bg-amber-600' 
                    : 'bg-green-500 hover:bg-green-600'
                }`}
              >
                {navigationMode === 'guided' ? (
                  <>
                    <Pause className="w-4 h-4" />
                    Ver Rota
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    Iniciar Navegação
                  </>
                )}
              </Button>
            </div>

            {/* Preview Mode: Show route steps */}
            {navigationMode === 'preview' && routeSteps.length > 0 && (
              <div className="bg-white/10 rounded-lg p-3">
                <p className="text-xs text-blue-200 mb-2 font-medium">📋 Instruções da rota:</p>
                <div className="space-y-2 max-h-32 overflow-auto">
                  {routeSteps.map((step, index) => (
                    <div key={index} className="flex items-start gap-2 text-xs">
                      <span className="bg-white/20 rounded-full w-5 h-5 flex items-center justify-center text-[10px] shrink-0 mt-0.5 font-bold">
                        {index + 1}
                      </span>
                      <span 
                        className="text-white/90 leading-tight"
                        dangerouslySetInnerHTML={{ __html: translateNavigationStep(step.instructions) }}
                      />
                    </div>
                  ))}
                </div>
                <p className="text-xs text-blue-200 mt-3 text-center">
                  Toque em "Iniciar Navegação" para ser guiado em tempo real
                </p>
              </div>
            )}

            {/* Guided Mode: Navigation info */}
            {navigationMode === 'guided' && routeInfo?.destination && userPosition && (
              <div className="flex flex-col items-center gap-3">
                {/* Distance and ETA - prominent display */}
                <div className="flex items-center justify-center gap-6 w-full">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-white">
                      {routeInfo.distance}
                    </p>
                    <p className="text-xs text-blue-200">Distância</p>
                  </div>
                  <div className="w-px h-10 bg-white/30" />
                  <div className="text-center">
                    <p className="text-2xl font-bold text-white">
                      {routeInfo.duration}
                    </p>
                    <p className="text-xs text-blue-200">Tempo estimado</p>
                  </div>
                </div>

                {/* Current instruction */}
                {routeSteps.length > 0 && (
                  <div className="bg-white/10 rounded-lg p-3 w-full">
                    <p className="text-xs text-blue-200 mb-1 flex items-center gap-1">
                      <Navigation className="w-3 h-3" />
                      Próxima instrução:
                    </p>
                    <p 
                      className="text-sm text-white font-medium"
                      dangerouslySetInnerHTML={{ __html: translateNavigationStep(routeSteps[0]?.instructions || '') }}
                    />
                  </div>
                )}

                {/* Status indicator */}
                <p className="text-xs text-blue-200 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                  GPS ativo • Mapa gira automaticamente
                </p>
              </div>
            )}

            {/* Fallback: When no route steps available */}
            {navigationMode === 'preview' && routeSteps.length === 0 && routeInfo?.destination && (
              <div className="bg-white/10 rounded-lg p-3 text-center">
                <div className="relative w-20 h-20 mx-auto mb-3">
                  <div className="absolute inset-0 rounded-full bg-white/10 border-2 border-white/40" />
                  <div 
                    className="absolute inset-0 flex items-center justify-center transition-transform duration-500"
                    style={{ transform: `rotate(${bearingToDestination}deg)` }}
                  >
                    <ArrowUp className="w-10 h-10 text-white" strokeWidth={3} />
                  </div>
                </div>
                <p className="text-sm text-white/90">
                  Siga na direção indicada
                </p>
                <p className="text-xs text-blue-200 mt-1">
                  Distância aproximada: {routeInfo.distance}
                </p>
              </div>
            )}
          </CardContent>
        )}
      </Card>
    </div>
  );
});

NavigationPanel.displayName = 'NavigationPanel';
