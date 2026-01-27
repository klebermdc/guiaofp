import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Ticket, ExternalLink, Loader2, Lightbulb, DollarSign, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface ItineraryData {
  selectedParks: string[];
  duration: number;
  budget: string;
  parkInterest: string;
  adultsCount?: number;
  childrenCount?: number;
  childrenAges?: number[];
  travelStyle?: string;
}

interface TicketRecommendation {
  type: string;
  days: number;
  parks: string[];
  estimatedCostAdult: number;
  estimatedCostChild: number;
  totalEstimate: number;
  reason: string;
  tips: string[];
  buyLink: string;
}

interface TicketSuggestionsProps {
  itineraryData: ItineraryData;
}

export const TicketSuggestions = ({ itineraryData }: TicketSuggestionsProps) => {
  const [recommendation, setRecommendation] = useState<TicketRecommendation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSuggestions = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const { data, error: fnError } = await supabase.functions.invoke('suggest-tickets', {
          body: { itineraryData }
        });

        if (fnError) throw fnError;
        setRecommendation(data);
      } catch (err) {
        console.error('Error fetching suggestions:', err);
        setError('Não foi possível carregar as sugestões.');
      } finally {
        setIsLoading(false);
      }
    };

    if (itineraryData.selectedParks?.length > 0) {
      fetchSuggestions();
    } else {
      setIsLoading(false);
    }
  }, [itineraryData]);

  if (isLoading) {
    return (
      <div className="bg-muted/50 p-6 rounded-xl border border-border">
        <div className="flex items-center justify-center gap-3 text-muted-foreground">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Analisando seu perfil de viagem...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-destructive/10 p-6 rounded-xl border border-destructive/30">
        <p className="text-destructive text-center">{error}</p>
      </div>
    );
  }

  if (!recommendation) {
    return (
      <div className="bg-muted/50 p-6 rounded-xl border border-border">
        <p className="text-muted-foreground text-center">
          Selecione os parques para receber sugestões de ingressos.
        </p>
      </div>
    );
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="bg-muted/50 p-5 rounded-xl border border-border space-y-5">
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
          <Ticket className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h3 className="font-semibold text-foreground text-lg">
            Sugestão de Ingresso
          </h3>
          <p className="text-sm text-muted-foreground">
            Baseado no seu perfil de viagem
          </p>
        </div>
      </div>

      {/* Recommendation Card */}
      <div className="bg-card p-4 rounded-lg border border-border">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xl font-bold text-primary">{recommendation.type}</span>
          <span className="px-3 py-1 bg-primary/10 text-primary text-sm font-medium rounded-full">
            {recommendation.days} dias
          </span>
        </div>

        <p className="text-sm text-foreground mb-4">{recommendation.reason}</p>

        {/* Pricing */}
        <div className="bg-muted/50 p-3 rounded-lg mb-4">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-foreground">Estimativa de Custo</span>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-muted-foreground">Por adulto:</span>
              <span className="ml-2 font-semibold">{formatCurrency(recommendation.estimatedCostAdult)}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Por criança:</span>
              <span className="ml-2 font-semibold">{formatCurrency(recommendation.estimatedCostChild)}</span>
            </div>
          </div>
          <div className="mt-2 pt-2 border-t border-border">
            <span className="text-muted-foreground text-sm">Total estimado:</span>
            <span className="ml-2 text-lg font-bold text-primary">
              {formatCurrency(recommendation.totalEstimate)}
            </span>
          </div>
        </div>

        {/* Parks */}
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-foreground">Parques incluídos</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {recommendation.parks.map((park, idx) => (
              <span 
                key={idx} 
                className="px-2 py-1 bg-muted text-xs font-medium rounded-md text-foreground"
              >
                {park}
              </span>
            ))}
          </div>
        </div>

        {/* Buy Button */}
        <Button 
          asChild 
          className="w-full"
          variant="default"
        >
          <a 
            href={recommendation.buyLink} 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2"
          >
            <ExternalLink className="w-4 h-4" />
            Comprar no Site Oficial
          </a>
        </Button>
      </div>

      {/* Tips */}
      {recommendation.tips.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Lightbulb className="w-4 h-4 text-amber-500" />
            <span className="text-sm font-medium text-foreground">Dicas</span>
          </div>
          <ul className="space-y-2">
            {recommendation.tips.map((tip, idx) => (
              <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                <span className="text-primary mt-1">•</span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
