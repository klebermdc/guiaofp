import { Compass, Power } from 'lucide-react';
import { useTravelMode } from '@/contexts/TravelModeContext';

export const TravelModeIndicator = () => {
  const { isTravelMode, disableTravelMode } = useTravelMode();

  if (!isTravelMode) return null;

  return (
    <div className="absolute top-2 left-2 z-20 flex items-center gap-2 animate-fade-in">
      {/* Main Badge */}
      <div 
        className="flex items-center gap-2 px-3 py-2 rounded-2xl shadow-lg bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"
      >
        <div className="flex items-center justify-center w-6 h-6 rounded-lg bg-white/20">
          <Compass className="w-4 h-4 text-white" />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-white tracking-wide">Modo Viagem</span>
          
          {/* Status dot */}
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full rounded-full bg-green-400 animate-ping opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-400" />
          </span>
        </div>
      </div>
      
      {/* Exit Button */}
      <button
        onClick={disableTravelMode}
        className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-background/90 border border-border/50 shadow-md text-foreground hover:bg-background transition-colors"
      >
        <Power className="w-3.5 h-3.5" />
        <span className="text-xs font-semibold">Sair</span>
      </button>
    </div>
  );
};
