import { memo, useMemo } from 'react';
import { Navigation, ArrowUp, CornerUpRight, CornerUpLeft, RotateCcw, ChevronRight, ChevronLeft, MapPin, X, ExternalLink, Route } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface NavigationStep {
  instructions: string;
  distance?: { text: string; value: number };
  duration?: { text: string; value: number };
  maneuver?: string;
}

interface NavigationHUDProps {
  destinationName: string;
  distance: string;
  duration: string;
  currentStepIndex: number;
  steps: NavigationStep[];
  speed: number | null; // km/h
  distanceToNextStep: number | null; // meters
  destination: { lat: number; lng: number } | null;
  userPosition: { lat: number; lng: number } | null;
  onStop: () => void;
  onRecenter: () => void;
  isOffCenter: boolean;
  onOpenExternal: (app: 'google' | 'waze') => void;
}

// Map Google Directions maneuver to icon and Portuguese label
function getManeuverInfo(maneuver?: string, instructions?: string) {
  const inst = (instructions || '').toLowerCase();

  // Detect from maneuver string
  switch (maneuver) {
    case 'turn-right':
      return { icon: <CornerUpRight className="w-10 h-10" />, label: 'Vire à direita' };
    case 'turn-left':
      return { icon: <CornerUpLeft className="w-10 h-10" />, label: 'Vire à esquerda' };
    case 'turn-slight-right':
    case 'fork-right':
      return { icon: <ChevronRight className="w-10 h-10" />, label: 'Levemente à direita' };
    case 'turn-slight-left':
    case 'fork-left':
      return { icon: <ChevronLeft className="w-10 h-10" />, label: 'Levemente à esquerda' };
    case 'uturn-left':
    case 'uturn-right':
      return { icon: <RotateCcw className="w-10 h-10" />, label: 'Faça retorno' };
    case 'straight':
      return { icon: <ArrowUp className="w-10 h-10" />, label: 'Siga em frente' };
    default:
      break;
  }

  // Fallback: detect from instruction text
  if (inst.includes('right') || inst.includes('direita'))
    return { icon: <CornerUpRight className="w-10 h-10" />, label: 'Vire à direita' };
  if (inst.includes('left') || inst.includes('esquerda'))
    return { icon: <CornerUpLeft className="w-10 h-10" />, label: 'Vire à esquerda' };
  if (inst.includes('u-turn') || inst.includes('retorno'))
    return { icon: <RotateCcw className="w-10 h-10" />, label: 'Faça retorno' };

  return { icon: <ArrowUp className="w-10 h-10" />, label: 'Siga em frente' };
}

// Translate a single navigation instruction to Portuguese (simplified)
function translateInstruction(html: string): string {
  const translations: [RegExp, string][] = [
    [/\bHead\b/gi, 'Siga'],
    [/\bnorth\b/gi, 'norte'], [/\bsouth\b/gi, 'sul'],
    [/\beast\b/gi, 'leste'], [/\bwest\b/gi, 'oeste'],
    [/\bTurn right\b/gi, 'Vire à direita'],
    [/\bTurn left\b/gi, 'Vire à esquerda'],
    [/\bContinue\b/gi, 'Continue'],
    [/\bKeep right\b/gi, 'Mantenha-se à direita'],
    [/\bKeep left\b/gi, 'Mantenha-se à esquerda'],
    [/\bSlightly right\b/gi, 'Levemente à direita'],
    [/\bSlightly left\b/gi, 'Levemente à esquerda'],
    [/\bSharp right\b/gi, 'Curva forte à direita'],
    [/\bSharp left\b/gi, 'Curva forte à esquerda'],
    [/\bMake a U-turn\b/gi, 'Faça retorno'],
    [/\bon\b/gi, 'na'], [/\bonto\b/gi, 'para'],
    [/\btoward\b/gi, 'em direção a'], [/\btowards\b/gi, 'em direção a'],
    [/\bPass by\b/gi, 'Passe por'],
    [/\(on the right\)/gi, '(à direita)'],
    [/\(on the left\)/gi, '(à esquerda)'],
    [/\bDestination will be\b/gi, 'O destino estará'],
  ];
  let t = html;
  for (const [p, r] of translations) t = t.replace(p, r);
  return t.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
}

function formatDistanceToStep(meters: number | null): string {
  if (meters === null) return '';
  if (meters < 10) return 'Agora';
  if (meters < 1000) return `${Math.round(meters)} m`;
  return `${(meters / 1000).toFixed(1)} km`;
}

export const NavigationHUD = memo(function NavigationHUD({
  destinationName,
  distance,
  duration,
  currentStepIndex,
  steps,
  speed,
  distanceToNextStep,
  destination,
  userPosition,
  onStop,
  onRecenter,
  isOffCenter,
  onOpenExternal,
}: NavigationHUDProps) {
  const currentStep = steps[currentStepIndex];
  const nextStep = steps[currentStepIndex + 1];

  const maneuver = useMemo(
    () => getManeuverInfo(currentStep?.maneuver, currentStep?.instructions),
    [currentStep?.maneuver, currentStep?.instructions],
  );

  const translatedInstruction = useMemo(
    () => (currentStep ? translateInstruction(currentStep.instructions) : ''),
    [currentStep?.instructions],
  );

  const nextManeuver = useMemo(
    () => (nextStep ? getManeuverInfo(nextStep.maneuver, nextStep.instructions) : null),
    [nextStep?.maneuver, nextStep?.instructions],
  );

  return (
    <div className="absolute inset-x-0 top-0 bottom-0 z-30 pointer-events-none flex flex-col safe-area-top">
      {/* ─── Top: Direction card ─── */}
      <div className="pointer-events-auto mx-2 mt-2 rounded-2xl bg-emerald-600 text-white shadow-2xl overflow-hidden">
        {/* Main direction row */}
        <div className="flex items-center gap-3 px-4 py-3">
          {/* Turn icon */}
          <div className="shrink-0 bg-white/20 rounded-xl p-2">
            {maneuver.icon}
          </div>

          {/* Instruction + distance to step */}
          <div className="flex-1 min-w-0">
            {distanceToNextStep !== null && distanceToNextStep > 10 && (
              <p className="text-2xl font-black leading-none tracking-tight">
                {formatDistanceToStep(distanceToNextStep)}
              </p>
            )}
            {distanceToNextStep !== null && distanceToNextStep <= 10 && (
              <p className="text-2xl font-black leading-none tracking-tight">Agora</p>
            )}
            <p className="text-sm text-white/90 mt-0.5 line-clamp-2 leading-snug">
              {translatedInstruction || maneuver.label}
            </p>
          </div>

          {/* Stop button */}
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0 h-10 w-10 bg-white/20 hover:bg-red-500/80 text-white rounded-full"
            onClick={onStop}
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Next step preview */}
        {nextManeuver && (
          <div className="flex items-center gap-2 px-4 py-1.5 bg-black/20 text-xs text-white/80">
            <span className="opacity-70">Depois:</span>
            <span className="shrink-0">{nextStep && translateInstruction(nextStep.instructions).slice(0, 40)}</span>
          </div>
        )}
      </div>

      {/* ─── Re-center button (appears when user pans away) ─── */}
      {isOffCenter && (
        <div className="pointer-events-auto mx-auto mt-3">
          <Button
            size="sm"
            className="rounded-full bg-blue-500 hover:bg-blue-600 text-white shadow-lg gap-2 px-4"
            onClick={onRecenter}
          >
            <Navigation className="w-4 h-4" />
            Recentralizar
          </Button>
        </div>
      )}

      {/* Spacer */}
      <div className="flex-1" />

      {/* ─── Bottom: Info bar + controls ─── */}
      <div className="pointer-events-auto mx-2 mb-20 space-y-2">
        {/* Speed badge - floating */}
        {speed !== null && speed > 0 && (
          <div className="flex justify-start">
            <div className="bg-background/95 backdrop-blur-sm rounded-xl px-3 py-1.5 shadow-lg border border-border/50 flex items-center gap-2">
              <span className="text-lg font-black text-foreground">{Math.round(speed)}</span>
              <span className="text-[10px] text-muted-foreground leading-none">km/h</span>
            </div>
          </div>
        )}

        {/* Bottom bar */}
        <div className="rounded-2xl bg-background/95 backdrop-blur-sm shadow-2xl border border-border/50 overflow-hidden">
          {/* ETA & distance */}
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-4">
              <div>
                <p className="text-xl font-black text-foreground leading-none">{duration}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">Tempo estimado</p>
              </div>
              <div className="w-px h-8 bg-border" />
              <div>
                <p className="text-xl font-black text-foreground leading-none">{distance}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">Distância</p>
              </div>
            </div>

            {/* External nav buttons */}
            <div className="flex gap-1.5">
              <Button
                variant="outline"
                size="sm"
                className="h-9 px-2.5 text-xs gap-1.5 rounded-xl"
                onClick={() => onOpenExternal('google')}
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Maps
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-9 px-2.5 text-xs gap-1.5 rounded-xl"
                onClick={() => onOpenExternal('waze')}
              >
                <Route className="w-3.5 h-3.5" />
                Waze
              </Button>
            </div>
          </div>

          {/* Destination name */}
          <div className="flex items-center gap-2 px-4 py-2 bg-muted/50 border-t border-border/50">
            <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
            <p className="text-xs font-medium text-foreground truncate">{destinationName}</p>
            <span className="text-xs text-muted-foreground ml-auto shrink-0">
              {steps.length > 0 && `${currentStepIndex + 1}/${steps.length}`}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
});
