import { SimulatorResult, SimulatorInputs, transportOptions } from '@/data/transportData';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { RefreshCw, CheckCircle, AlertTriangle, TrendingUp } from 'lucide-react';

interface SimulatorResultViewProps {
  results: SimulatorResult[];
  inputs: SimulatorInputs;
  onReset: () => void;
}

export default function SimulatorResultView({ results, inputs, onReset }: SimulatorResultViewProps) {
  const recommended = results.find(r => r.isRecommended);
  const available = results.filter(r => r.available);
  const unavailable = results.filter(r => !r.available);
  const maxCost = Math.max(...available.filter(r => r.totalCost > 0).map(r => r.totalCost), 1);

  return (
    <div className="space-y-6">
      {/* Summary bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-muted/50 rounded-xl p-4">
        <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          <span>👥 {inputs.people} pessoa{inputs.people > 1 ? 's' : ''}</span>
          <span>•</span>
          <span>📅 {inputs.days} dias</span>
          <span>•</span>
          <span>🏨 {inputs.hotelType === 'disney_onsite' ? 'Hotel Disney' : inputs.hotelType === 'universal_onsite' ? 'Hotel Universal' : 'Hotel Off-site'}</span>
          <span>•</span>
          <span>🚕 {inputs.tripsPerDay} corridas/dia</span>
        </div>
        <Button variant="outline" size="sm" onClick={onReset} className="gap-1.5">
          <RefreshCw className="w-3.5 h-3.5" />
          Refazer
        </Button>
      </div>

      {/* Recommendation */}
      {recommended && (
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="p-5 space-y-3">
            <div className="flex items-center gap-2 text-primary font-semibold text-sm">
              <CheckCircle className="w-5 h-5" />
              Nossa recomendação para você
            </div>
            <div className="flex items-center gap-3">
              <span className="text-3xl">{recommended.emoji}</span>
              <div>
                <h3 className="text-lg font-bold text-foreground">{recommended.name}</h3>
                {recommended.totalCost > 0 && (
                  <p className="text-sm text-muted-foreground">
                    Estimativa total: <strong className="text-foreground">US$ {recommended.totalCost.toFixed(0)}</strong>
                    {' '}(US$ {recommended.dailyCost.toFixed(0)}/dia)
                  </p>
                )}
              </div>
            </div>
            {recommended.recommendationReason && (
              <p className="text-sm text-muted-foreground bg-background/60 rounded-lg p-3">
                💡 {recommended.recommendationReason}
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Full comparison */}
      <Card>
        <CardContent className="p-5 space-y-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <TrendingUp className="w-4 h-4 text-primary" />
            Comparativo completo — custo estimado total
          </div>

          <div className="space-y-4">
            {available.map((result) => {
              const barWidth = result.totalCost === 0
                ? 5
                : Math.max(5, (result.totalCost / maxCost) * 100);

              return (
                <div key={result.mode} className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{result.emoji}</span>
                      <span className="text-sm font-medium text-foreground">{result.name}</span>
                      {result.isRecommended && (
                        <span className="text-[10px] font-bold bg-primary text-primary-foreground px-2 py-0.5 rounded-full">
                          RECOMENDADO
                        </span>
                      )}
                    </div>
                    <span className="text-sm font-bold text-foreground">
                      {result.totalCost === 0 ? '🆓 Grátis' : `US$ ${result.totalCost.toFixed(0)}`}
                    </span>
                  </div>

                  {result.totalCost > 0 && (
                    <div className="h-3 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full bg-primary/70 transition-all duration-700"
                        style={{ width: `${barWidth}%` }}
                      />
                    </div>
                  )}

                  <p className="text-[11px] text-muted-foreground">{result.breakdown}</p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Unavailable */}
      {unavailable.length > 0 && (
        <div className="bg-muted/30 rounded-xl p-4 space-y-2">
          <p className="text-xs font-semibold text-muted-foreground">Não disponível para seu perfil:</p>
          {unavailable.map(r => (
            <p key={r.mode} className="text-xs text-muted-foreground flex items-center gap-2">
              <span>{r.emoji}</span>
              <span className="font-medium">{r.name}</span>
              <span>—</span>
              <span>{r.breakdown}</span>
            </p>
          ))}
        </div>
      )}

      {/* Warning */}
      <div className="flex items-start gap-3 rounded-xl border border-yellow-300/50 bg-yellow-50/50 dark:bg-yellow-950/10 dark:border-yellow-500/20 p-3">
        <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 shrink-0 mt-0.5" />
        <p className="text-xs text-yellow-800 dark:text-yellow-300 leading-relaxed">
          Estimativas de mercado 2024/2025. Os valores reais variam conforme temporada, disponibilidade, categoria de veículo, horário (surge pricing) e condições de mercado.
        </p>
      </div>
    </div>
  );
}
