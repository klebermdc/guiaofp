import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Loader2, Clock, MapPin, RotateCcw, Zap, AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface ItineraryItem {
  order: number;
  time: string;
  name: string;
  area: string;
  type: 'ride' | 'show' | 'experience' | 'meet' | 'meal' | 'break';
  duration_min: number;
  tip: string;
  icon: string;
}

interface ItineraryData {
  title: string;
  strategy: string;
  estimated_duration: string;
  items: ItineraryItem[];
  tips: string[];
}

const TYPE_STYLES: Record<string, string> = {
  ride: 'bg-blue-500/10 text-blue-600 border-blue-500/30',
  show: 'bg-purple-500/10 text-purple-600 border-purple-500/30',
  experience: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30',
  meet: 'bg-pink-500/10 text-pink-600 border-pink-500/30',
  meal: 'bg-orange-500/10 text-orange-600 border-orange-500/30',
  break: 'bg-gray-500/10 text-gray-600 border-gray-500/30',
};

const TYPE_LABELS: Record<string, string> = {
  ride: 'Atração',
  show: 'Show',
  experience: 'Experiência',
  meet: 'Personagem',
  meal: 'Refeição',
  break: 'Descanso',
};

interface ParkItineraryTimelineProps {
  parkName: string;
}

export const ParkItineraryTimeline = ({ parkName }: ParkItineraryTimelineProps) => {
  const { user } = useAuth();
  const [isGenerating, setIsGenerating] = useState(false);
  const [itinerary, setItinerary] = useState<ItineraryData | null>(null);

  const generateItinerary = async () => {
    setIsGenerating(true);
    setItinerary(null);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-park-itinerary`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            parkName,
            userId: user?.id || null,
          }),
        }
      );

      if (!response.ok) {
        if (response.status === 429) {
          toast.error('Muitas solicitações. Tente novamente em alguns segundos.');
          return;
        }
        if (response.status === 402) {
          toast.error('Créditos insuficientes para gerar roteiro.');
          return;
        }
        throw new Error('Erro ao gerar roteiro');
      }

      // Parse SSE stream
      const reader = response.body?.getReader();
      if (!reader) throw new Error('No reader');

      const decoder = new TextDecoder();
      let textBuffer = '';
      let fullContent = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf('\n')) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith('\r')) line = line.slice(0, -1);
          if (line.startsWith(':') || line.trim() === '') continue;
          if (!line.startsWith('data: ')) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === '[DONE]') break;

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) fullContent += content;
          } catch {
            textBuffer = line + '\n' + textBuffer;
            break;
          }
        }
      }

      // Extract JSON from the response (handle markdown code blocks)
      let jsonContent = fullContent;
      const jsonMatch = fullContent.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (jsonMatch) {
        jsonContent = jsonMatch[1].trim();
      } else {
        // Try to find raw JSON
        const startIdx = fullContent.indexOf('{');
        const endIdx = fullContent.lastIndexOf('}');
        if (startIdx !== -1 && endIdx !== -1) {
          jsonContent = fullContent.slice(startIdx, endIdx + 1);
        }
      }

      const parsed: ItineraryData = JSON.parse(jsonContent);
      setItinerary(parsed);
      toast.success('Roteiro gerado com sucesso! 🎉');
    } catch (error) {
      console.error('Error generating itinerary:', error);
      toast.error('Erro ao gerar roteiro. Tente novamente.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Zap className="h-5 w-5 text-yellow-500" />
          Roteiro Inteligente do Parque
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          IA monta a melhor ordem de atrações com base nos tempos de fila dos últimos 30 dias
          {user ? ' e no seu perfil de viagem' : ''}.
        </p>
      </CardHeader>
      <CardContent>
        {!itinerary && !isGenerating && (
          <Button
            onClick={generateItinerary}
            className="w-full gap-2 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white shadow-lg"
            size="lg"
          >
            <Sparkles className="h-5 w-5" />
            Gerar Roteiro Inteligente
          </Button>
        )}

        {isGenerating && (
          <div className="flex flex-col items-center gap-3 py-8">
            <div className="relative">
              <Loader2 className="h-10 w-10 animate-spin text-yellow-500" />
              <Sparkles className="h-4 w-4 text-yellow-400 absolute -top-1 -right-1 animate-pulse" />
            </div>
            <p className="text-sm text-muted-foreground animate-pulse">
              Analisando dados de fila e montando seu roteiro...
            </p>
          </div>
        )}

        {itinerary && (
          <div className="space-y-4">
            {/* Strategy header */}
            <div className="p-3 rounded-lg bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/20">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-semibold">{itinerary.title}</span>
                <Badge variant="outline" className="text-xs">
                  <Clock className="h-3 w-3 mr-1" />
                  {itinerary.estimated_duration}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">{itinerary.strategy}</p>
            </div>

            {/* Timeline */}
            <div className="relative">
              <div className="absolute left-[23px] top-4 bottom-4 w-0.5 bg-border" />
              <div className="space-y-1">
                {itinerary.items.map((item, idx) => (
                  <div key={idx} className="flex gap-3 relative">
                    {/* Time dot */}
                    <div className="flex flex-col items-center shrink-0 z-10">
                      <div className="text-[10px] text-muted-foreground font-mono w-[46px] text-right pr-1">
                        {item.time}
                      </div>
                    </div>

                    {/* Dot on timeline */}
                    <div className="flex items-center shrink-0 z-10 -ml-[13px]">
                      <div className={`w-3 h-3 rounded-full border-2 ${
                        item.type === 'meal' || item.type === 'break'
                          ? 'bg-muted border-muted-foreground/40'
                          : 'bg-primary border-primary'
                      }`} />
                    </div>

                    {/* Content */}
                    <div className={`flex-1 p-2.5 rounded-lg border mb-1 ${TYPE_STYLES[item.type] || TYPE_STYLES.ride}`}>
                      <div className="flex items-start gap-2">
                        <span className="text-lg leading-none">{item.icon}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-medium text-sm">{item.name}</span>
                            <Badge variant="outline" className="text-[9px] px-1 py-0 h-4">
                              {TYPE_LABELS[item.type] || item.type}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-3 mt-1 text-[11px] text-muted-foreground">
                            {item.area && (
                              <span className="flex items-center gap-0.5">
                                <MapPin className="h-2.5 w-2.5" />
                                {item.area}
                              </span>
                            )}
                            {item.duration_min > 0 && (
                              <span>{item.duration_min} min</span>
                            )}
                          </div>
                          {item.tip && (
                            <p className="text-[11px] text-muted-foreground/80 mt-1 italic">
                              💡 {item.tip}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* General tips */}
            {itinerary.tips && itinerary.tips.length > 0 && (
              <div className="p-3 rounded-lg bg-muted/40 border border-border/50 space-y-1.5">
                <span className="text-xs font-semibold">💡 Dicas Gerais</span>
                {itinerary.tips.map((tip, idx) => (
                  <p key={idx} className="text-xs text-muted-foreground">• {tip}</p>
                ))}
              </div>
            )}

            {/* Regenerate button */}
            <Button
              onClick={generateItinerary}
              variant="outline"
              size="sm"
              className="w-full gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              Gerar Novo Roteiro
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
