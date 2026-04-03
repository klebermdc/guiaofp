import { memo, useMemo, useState } from 'react';
import { Navigation, ArrowUp, CornerUpRight, CornerUpLeft, RotateCcw, ChevronRight, ChevronLeft, MapPin, X, ExternalLink, Route, ChevronUp, ChevronDown, Flag } from 'lucide-react';
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
  speed: number | null;
  distanceToNextStep: number | null;
  destination: { lat: number; lng: number } | null;
  userPosition: { lat: number; lng: number } | null;
  onStop: () => void;
  onRecenter: () => void;
  isOffCenter: boolean;
  onOpenExternal: (app: 'google' | 'waze') => void;
}

function getManeuverInfo(maneuver?: string, instructions?: string) {
  const inst = (instructions || '').toLowerCase();
  switch (maneuver) {
    case 'turn-right':
      return { icon: <CornerUpRight className="w-10 h-10" />, label: 'Vire à direita', color: 'bg-emerald-600' };
    case 'turn-left':
      return { icon: <CornerUpLeft className="w-10 h-10" />, label: 'Vire à esquerda', color: 'bg-emerald-600' };
    case 'turn-slight-right':
    case 'fork-right':
      return { icon: <ChevronRight className="w-10 h-10" />, label: 'Levemente à direita', color: 'bg-emerald-600' };
    case 'turn-slight-left':
    case 'fork-left':
      return { icon: <ChevronLeft className="w-10 h-10" />, label: 'Levemente à esquerda', color: 'bg-emerald-600' };
    case 'uturn-left':
    case 'uturn-right':
      return { icon: <RotateCcw className="w-10 h-10" />, label: 'Faça retorno', color: 'bg-amber-500' };
    case 'straight':
      return { icon: <ArrowUp className="w-10 h-10" />, label: 'Siga em frente', color: 'bg-emerald-600' };
    default: break;
  }
  if (inst.includes('right') || inst.includes('direita'))
    return { icon: <CornerUpRight className="w-10 h-10" />, label: 'Vire à direita', color: 'bg-emerald-600' };
  if (inst.includes('left') || inst.includes('esquerda'))
    return { icon: <CornerUpLeft className="w-10 h-10" />, label: 'Vire à esquerda', color: 'bg-emerald-600' };
  if (inst.includes('u-turn') || inst.includes('retorno'))
    return { icon: <RotateCcw className="w-10 h-10" />, label: 'Faça retorno', color: 'bg-amber-500' };
  if (inst.includes('destination') || inst.includes('destino') || inst.includes('arrived'))
    return { icon: <Flag className="w-10 h-10" />, label: 'Você chegou!', color: 'bg-blue-600' };
  return { icon: <ArrowUp className="w-10 h-10" />, label: 'Siga em frente', color: 'bg-emerald-600' };
}

function getStepManeuverIcon(maneuver?: string, instructions?: string) {
  const inst = (instructions || '').toLowerCase();
  if (maneuver === 'turn-right' || inst.includes('right')) return <CornerUpRight className="w-3.5 h-3.5 shrink-0" />;
  if (maneuver === 'turn-left' || inst.includes('left')) return <CornerUpLeft className="w-3.5 h-3.5 shrink-0" />;
  if (maneuver?.includes('uturn') || inst.includes('u-turn')) return <RotateCcw className="w-3.5 h-3.5 shrink-0" />;
  if (inst.includes('destination') || inst.includes('destino')) return <Flag className="w-3.5 h-3.5 shrink-0 text-primary" />;
  return <ArrowUp className="w-3.5 h-3.5 shrink-0" />;
}

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
    [/\bYour destination\b/gi, 'Seu destino'],
    [/\bis on the right\b/gi, 'está à direita'],
    [/\bis on the left\b/gi, 'está à esquerda'],
  ];
  let t = html;
  for (const [p, r] of translations) t = t.replace(p, r);
  return t.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
}

function formatDistanceToStep(meters: number | null): string {
  if (meters === null) return '';
  if (meters < 10) return 'Agora';
  if (meters < 100) return `${Math.round(meters / 10) * 10} m`;
  if (meters < 1000) return `${Math.round(meters / 50) * 50} m`;
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
  onStop,
  onRecenter,
  isOffCenter,
  onOpenExternal,
}: NavigationHUDProps) {
  const [stepsExpanded, setStepsExpanded] = useState(false);

  const currentStep = steps[currentStepIndex];
  const nextStep = steps[currentStepIndex + 1];
  const isLastStep = currentStepIndex >= steps.length - 1;
  const isArriving = isLastStep && distanceToNextStep !== null && distanceToNextStep < 30;

  const maneuver = useMemo(
    () => getManeuverInfo(
      isArriving ? 'arrived' : currentStep?.maneuver,
      isArriving ? 'destination' : currentStep?.instructions
    ),
    [currentStep?.maneuver, currentStep?.instructions, isArriving],
  );

  const translatedInstruction = useMemo(
    () => isArriving ? 'Você chegou ao destino!' : (currentStep ? translateInstruction(currentStep.instructions) : ''),
    [currentStep?.instructions, isArriving],
  );

  const nextManeuver = useMemo(
    () => (nextStep ? getManeuverInfo(nextStep.maneuver, nextStep.instructions) : null),
    [nextStep?.maneuver, nextStep?.instructions],
  );

  const progressPct = steps.length > 1 ? (currentStepIndex / (steps.length - 1)) * 100 : 0;

  return (
    <div className="absolute inset-x-0 top-0 bottom-0 z-30 pointer-events-none flex flex-col safe-area-top">
      {/* ─── Top: Direction card ─── */}
      <div className={`pointer-events-auto mx-2 mt-2 rounded-2xl text-white shadow-2xl overflow-hidden ${isArriving ? 'bg-blue-600' : maneuver.color}`}>
        {/* Progress bar */}
        {steps.length > 1 && (
          <div className="h-1 bg-white/20">
            <div
              className="h-full bg-white/70 transition-all duration-500"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        )}

        {/* Main direction row */}
        <div className="flex items-center gap-3 px-4 py-3">
          <div className="shrink-0 bg-white/20 rounded-xl p-2">
            {maneuver.icon}
          </div>

          <div className="flex-1 min-w-0">
            {!isArriving && distanceToNextStep !== null && (
              <p className="text-2xl font-black leading-none tracking-tight">
                {formatDistanceToStep(distanceToNextStep)}
              </p>
            )}
            <p className={`text-white/90 mt-0.5 line-clamp-2 leading-snug ${isArriving ? 'text-lg font-bold' : 'text-sm'}`}>
              {translatedInstruction || maneuver.label}
            </p>
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="shrink-0 h-11 w-11 bg-white/20 hover:bg-red-500/80 text-white rounded-full"
            onClick={onStop}
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Next step preview */}
        {nextManeuver && !isArriving && (
          <div className="flex items-center gap-2 px-4 py-2 bg-black/20 text-xs text-white/80 border-t border-white/10">
            <span className="opacity-60 shrink-0">Depois:</span>
            <span className="truncate">{translateInstruction(nextStep?.instructions ?? '').slice(0, 50)}</span>
          </div>
        )}

        {/* Step counter */}
        {steps.length > 0 && (
          <div className="flex items-center gap-1.5 px-4 py-1.5 bg-black/10 text-[10px] text-white/60">
            <span>Passo {currentStepIndex + 1} de {steps.length}</span>
            <div className="flex gap-0.5 ml-1">
              {steps.slice(0, Math.min(steps.length, 8)).map((_, i) => (
                <div
                  key={i}
                  className={`h-1 rounded-full transition-all ${
                    i < currentStepIndex ? 'w-3 bg-white/70' :
                    i === currentStepIndex ? 'w-4 bg-white' :
                    'w-1.5 bg-white/30'
                  }`}
                />
              ))}
              {steps.length > 8 && <span className="text-white/40 text-[9px]">+{steps.length - 8}</span>}
            </div>
          </div>
        )}
      </div>

      {/* ─── Re-center button ─── */}
      {isOffCenter && (
        <div className="pointer-events-auto mx-auto mt-3">
          <Button
            size="sm"
            className="rounded-full bg-blue-500 hover:bg-blue-600 text-white shadow-lg gap-2 px-4 h-10"
            onClick={onRecenter}
          >
            <Navigation className="w-4 h-4" />
            Recentralizar
          </Button>
        </div>
      )}

      <div className="flex-1" />

      {/* ─── Bottom: Steps list (expandable) + Info bar ─── */}
      <div className="pointer-events-auto mx-2 mb-20 space-y-2">
        {/* Speed badge */}
        {speed !== null && speed > 0 && (
          <div className="flex justify-start">
            <div className="bg-background/95 backdrop-blur-sm rounded-xl px-3 py-1.5 shadow-lg border border-border/50 flex items-center gap-1.5">
              <span className="text-lg font-black text-foreground">{Math.round(speed)}</span>
              <span className="text-[10px] text-muted-foreground leading-none">km/h</span>
            </div>
          </div>
        )}

        {/* Expandable steps list */}
        {stepsExpanded && steps.length > 0 && (
          <div className="rounded-2xl bg-background/98 backdrop-blur-sm shadow-xl border border-border/50 overflow-hidden max-h-52 overflow-y-auto">
            {steps.map((step, i) => (
              <div
                key={i}
                className={`flex items-start gap-2.5 px-3 py-2 border-b border-border/30 last:border-0 ${
                  i === currentStepIndex ? 'bg-primary/10' : i < currentStepIndex ? 'opacity-40' : ''
                }`}
              >
                <div className={`mt-0.5 ${i === currentStepIndex ? 'text-primary' : 'text-muted-foreground'}`}>
                  {getStepManeuverIcon(step.maneuver, step.instructions)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-xs leading-snug ${i === currentStepIndex ? 'font-semibold text-foreground' : 'text-muted-foreground'}`}>
                    {translateInstruction(step.instructions)}
                  </p>
                  {step.distance && (
                    <p className="text-[10px] text-muted-foreground/60 mt-0.5">{step.distance.text}</p>
                  )}
                </div>
                {i === currentStepIndex && (
                  <div className="shrink-0 w-1.5 h-1.5 rounded-full bg-primary mt-1.5" />
                )}
              </div>
            ))}
          </div>
        )}

        {/* Bottom bar */}
        <div className="rounded-2xl bg-background/95 backdrop-blur-sm shadow-2xl border border-border/50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-4">
              <div>
                <p className="text-xl font-black text-foreground leading-none">{duration}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">Estimativa</p>
              </div>
              <div className="w-px h-8 bg-border" />
              <div>
                <p className="text-xl font-black text-foreground leading-none">{distance}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">Distância</p>
              </div>
            </div>

            <div className="flex gap-1.5">
              {steps.length > 0 && (
                <Button
                  variant="outline"
                  size="icon"
                  className="h-11 w-11 rounded-xl"
                  onClick={() => setStepsExpanded(v => !v)}
                >
                  {stepsExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                className="h-11 px-3 text-xs gap-1.5 rounded-xl"
                onClick={() => onOpenExternal('google')}
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Maps
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-11 px-3 text-xs gap-1.5 rounded-xl"
                onClick={() => onOpenExternal('waze')}
              >
                <Route className="w-3.5 h-3.5" />
                Waze
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-2 px-4 py-2 bg-muted/50 border-t border-border/50">
            <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
            <p className="text-xs font-medium text-foreground truncate">{destinationName}</p>
          </div>
        </div>
      </div>
    </div>
  );
});
