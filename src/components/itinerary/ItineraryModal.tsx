import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, Sparkles, Crown, MessageCircle, Lock, MapPin, Clock } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface ItineraryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isGenerating: boolean;
  result: {
    itinerary: string;
    hasGuide: boolean;
    parkName: string;
  } | null;
  error: string | null;
  onContactGuide?: () => void;
}

export function ItineraryModal({
  open,
  onOpenChange,
  isGenerating,
  result,
  error,
  onContactGuide,
}: ItineraryModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            {result?.hasGuide ? 'Seu Roteiro Otimizado' : 'Dicas para sua Visita'}
          </DialogTitle>
          {result && (
            <DialogDescription className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              {result.parkName}
              {result.hasGuide ? (
                <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white ml-2">
                  <Crown className="w-3 h-3 mr-1" />
                  Plano Premium
                </Badge>
              ) : (
                <Badge variant="secondary" className="ml-2">
                  Plano Básico
                </Badge>
              )}
            </DialogDescription>
          )}
        </DialogHeader>

        <ScrollArea className="flex-1 pr-4">
          {isGenerating && (
            <div className="flex flex-col items-center justify-center py-12 gap-4">
              <Loader2 className="w-10 h-10 animate-spin text-primary" />
              <p className="text-muted-foreground">Gerando seu roteiro...</p>
            </div>
          )}

          {error && (
            <div className="py-8 text-center">
              <p className="text-destructive">{error}</p>
            </div>
          )}

          {result && !isGenerating && (
            <div className="space-y-4">
              {/* Conteúdo do roteiro em markdown */}
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <ReactMarkdown>{result.itinerary}</ReactMarkdown>
              </div>

              {/* CTA para quem NÃO tem guia */}
              {!result.hasGuide && (
                <Card className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border-primary/20 mt-6">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-primary/20 rounded-full">
                        <Lock className="w-6 h-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-2">
                          Quer um roteiro completo e otimizado?
                        </h3>
                        <p className="text-muted-foreground text-sm mb-4">
                          Com o <strong>Guiamento Premium</strong>, você recebe:
                        </p>
                        <ul className="text-sm space-y-2 mb-4">
                          <li className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-primary" />
                            Sequência exata otimizada por horário
                          </li>
                          <li className="flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-primary" />
                            Ajustes em tempo real durante o dia
                          </li>
                          <li className="flex items-center gap-2">
                            <MessageCircle className="w-4 h-4 text-primary" />
                            Suporte direto pelo WhatsApp
                          </li>
                        </ul>
                        {onContactGuide && (
                          <Button 
                            onClick={onContactGuide}
                            className="w-full bg-gradient-to-r from-primary to-primary/80"
                          >
                            <Crown className="w-4 h-4 mr-2" />
                            Falar com um Guia
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
