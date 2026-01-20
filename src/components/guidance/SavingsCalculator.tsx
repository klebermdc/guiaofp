import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Clock, TrendingDown, Sparkles, Users, Timer, Zap, Calculator } from "lucide-react";
import { cn } from "@/lib/utils";

type ParkType = "disney" | "universal" | "other";
type SeasonType = "low" | "medium" | "high";

interface CalculatorResult {
  withoutGuidance: number;
  withGuidance: number;
  timeSaved: number;
  percentSaved: number;
  extraAttractions: number;
}

// Average wait times per attraction (in minutes)
const BASE_WAIT_TIMES: Record<ParkType, Record<SeasonType, number>> = {
  disney: { low: 35, medium: 55, high: 85 },
  universal: { low: 30, medium: 45, high: 70 },
  other: { low: 20, medium: 35, high: 50 }
};

// Guidance efficiency (reduction percentage)
const GUIDANCE_EFFICIENCY: Record<SeasonType, number> = {
  low: 0.30,    // 30% reduction in low season
  medium: 0.40, // 40% reduction in medium season
  high: 0.50    // 50% reduction in high season (more value when busy)
};

export const SavingsCalculator = () => {
  const [attractions, setAttractions] = useState(8);
  const [parkType, setParkType] = useState<ParkType>("disney");
  const [season, setSeason] = useState<SeasonType>("medium");
  const [groupSize, setGroupSize] = useState(4);

  const calculateSavings = (): CalculatorResult => {
    const baseWait = BASE_WAIT_TIMES[parkType][season];
    const efficiency = GUIDANCE_EFFICIENCY[season];
    
    // Group size affects wait time slightly (larger groups = harder to coordinate)
    const groupFactor = 1 + (groupSize > 4 ? (groupSize - 4) * 0.05 : 0);
    
    const withoutGuidance = Math.round(attractions * baseWait * groupFactor);
    const withGuidance = Math.round(withoutGuidance * (1 - efficiency));
    const timeSaved = withoutGuidance - withGuidance;
    const percentSaved = Math.round(efficiency * 100);
    
    // Extra attractions possible with saved time
    const avgAttractionTime = 15; // Average ride duration
    const extraAttractions = Math.floor(timeSaved / (baseWait * 0.5 + avgAttractionTime));
    
    return {
      withoutGuidance,
      withGuidance,
      timeSaved,
      percentSaved,
      extraAttractions
    };
  };

  const result = calculateSavings();

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours === 0) return `${mins}min`;
    return `${hours}h ${mins}min`;
  };

  const parkLabels: Record<ParkType, string> = {
    disney: "Disney (Magic Kingdom, EPCOT, etc.)",
    universal: "Universal (Studios, Islands, Epic)",
    other: "Outros (SeaWorld, Busch Gardens)"
  };

  const seasonLabels: Record<SeasonType, { label: string; description: string }> = {
    low: { label: "Baixa", description: "Jan, Set, Nov" },
    medium: { label: "Média", description: "Mai, Out" },
    high: { label: "Alta", description: "Verão, Feriados" }
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-green-500/10 via-emerald-500/10 to-teal-500/10 border-b">
        <CardTitle className="text-xl flex items-center gap-2">
          <Timer className="w-5 h-5 text-green-500" />
          Calculadora de Economia
        </CardTitle>
        <CardDescription>
          Veja quanto tempo você pode economizar com o guiamento remoto
        </CardDescription>
      </CardHeader>
      
      <CardContent className="p-6">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Controls */}
          <div className="space-y-6">
            {/* Attractions Slider */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Atrações planejadas</Label>
                <Badge variant="secondary" className="font-mono">
                  {attractions} atrações
                </Badge>
              </div>
              <Slider
                value={[attractions]}
                onValueChange={(v) => setAttractions(v[0])}
                min={3}
                max={15}
                step={1}
                className="py-2"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>3 (relaxado)</span>
                <span>15 (intenso)</span>
              </div>
            </div>

            {/* Park Type */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Tipo de parque</Label>
              <Select value={parkType} onValueChange={(v) => setParkType(v as ParkType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(parkLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Season */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Temporada</Label>
              <div className="grid grid-cols-3 gap-2">
                {(Object.entries(seasonLabels) as [SeasonType, { label: string; description: string }][]).map(([value, { label, description }]) => (
                  <button
                    key={value}
                    onClick={() => setSeason(value)}
                    className={cn(
                      "p-3 rounded-lg border text-center transition-all",
                      season === value
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border hover:border-primary/50"
                    )}
                  >
                    <div className="font-medium text-sm">{label}</div>
                    <div className="text-xs text-muted-foreground">{description}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Group Size */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Tamanho do grupo
                </Label>
                <Badge variant="secondary" className="font-mono">
                  {groupSize} {groupSize === 1 ? 'pessoa' : 'pessoas'}
                </Badge>
              </div>
              <Slider
                value={[groupSize]}
                onValueChange={(v) => setGroupSize(v[0])}
                min={1}
                max={10}
                step={1}
                className="py-2"
              />
            </div>
          </div>

          {/* Results */}
          <div className="space-y-4">
            {/* Main Result */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 p-6 text-white">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
              
              <div className="relative">
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="w-5 h-5" />
                  <span className="font-medium">Tempo economizado</span>
                </div>
                
                <div className="text-4xl md:text-5xl font-bold mb-2">
                  {formatTime(result.timeSaved)}
                </div>
                
                <div className="flex items-center gap-2 text-white/80">
                  <TrendingDown className="w-4 h-4" />
                  <span>{result.percentSaved}% menos tempo em filas</span>
                </div>
              </div>
            </div>

            {/* Comparison */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20">
                <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Sem guiamento
                </div>
                <div className="text-xl font-bold text-red-600 dark:text-red-400">
                  {formatTime(result.withoutGuidance)}
                </div>
                <div className="text-xs text-muted-foreground">
                  em filas
                </div>
              </div>
              
              <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20">
                <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                  <Zap className="w-3 h-3" />
                  Com guiamento
                </div>
                <div className="text-xl font-bold text-green-600 dark:text-green-400">
                  {formatTime(result.withGuidance)}
                </div>
                <div className="text-xs text-muted-foreground">
                  em filas
                </div>
              </div>
            </div>

            {/* Extra Attractions */}
            {result.extraAttractions > 0 && (
              <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium">Atrações extras possíveis</div>
                    <div className="text-xs text-muted-foreground">
                      Com o tempo economizado, você pode fazer mais!
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-primary">
                    +{result.extraAttractions}
                  </div>
                </div>
              </div>
            )}

            {/* Disclaimer */}
            <p className="text-xs text-muted-foreground text-center">
              * Estimativas baseadas em médias históricas. Resultados reais podem variar 
              conforme condições do dia, escolha de atrações e decisões do grupo.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
