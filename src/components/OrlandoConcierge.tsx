import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, ArrowLeft, MapPin, Navigation, Share2, RotateCcw, Sparkles, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { openExternalUrl } from '@/lib/open-external-url';
import { AppLayout } from '@/components/layout/AppLayout';

interface Place {
  name: string;
  address: string;
  distance_km: number;
  time_min: string;
  summary: string;
  gmaps: string;
  waze: string;
}

interface Category {
  id: string;
  icon: string;
  label: string;
  places: Place[];
}

interface ConciergeResult {
  categories: Category[];
}

const CATEGORY_COLORS: Record<string, string> = {
  parques: '#FF6B35',
  compras: '#7C3AED',
  lojas: '#059669',
  passeios: '#0891B2',
  cafes: '#D97706',
  fastfood: '#DC2626',
  restaurantes: '#BE185D',
  mercados: '#1D4ED8',
  brasileiros: '#047857',
};

type ViewState = 'input' | 'loading' | 'results' | 'error';

const OrlandoConcierge = () => {
  const navigate = useNavigate();
  const [address, setAddress] = useState('');
  const [viewState, setViewState] = useState<ViewState>('input');
  const [result, setResult] = useState<ConciergeResult | null>(null);
  const [submittedAddress, setSubmittedAddress] = useState('');

  const handleSearch = async () => {
    if (!address || address.length < 10) return;
    setViewState('loading');
    setSubmittedAddress(address);

    try {
      const { data, error } = await supabase.functions.invoke('concierge-recommend', {
        body: { address },
      });

      if (error) throw error;
      if (!data || !data.categories) throw new Error('Invalid response');

      setResult(data as ConciergeResult);
      setViewState('results');
    } catch {
      setViewState('error');
    }
  };

  const handleNewSearch = () => {
    setViewState('input');
    setResult(null);
    setAddress('');
    setSubmittedAddress('');
  };

  const handleShare = () => {
    if (!result) return;
    let text = `*Orlando Concierge* ✨\nHotel: ${submittedAddress}\n\n`;
    for (const cat of result.categories) {
      text += `${cat.icon} *${cat.label}*\n`;
      const top3 = cat.places.slice(0, 3);
      for (const place of top3) {
        text += `• ${place.name} (${place.distance_km}km, ${place.time_min})\n`;
      }
      text += '\n';
    }
    text += '_Gerado pelo OFP Planejador_';
    openExternalUrl(`https://wa.me/?text=${encodeURIComponent(text)}`, { preferSameTabOnMobile: true });
  };

  return (
    <AppLayout>
      <div className="min-h-screen bg-background pb-24 lg:pb-8">
        {/* Header */}
        <div className="sticky top-0 z-30 bg-background/95 backdrop-blur-sm border-b border-border/50">
          <div className="flex items-center gap-3 px-4 py-3 max-w-2xl mx-auto">
            <Button
              variant="ghost"
              size="icon"
              className="shrink-0"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <Sparkles className="w-5 h-5 text-[#FF6B35] shrink-0" />
              <div className="min-w-0">
                <h1 className="text-base font-bold text-foreground leading-tight">
                  Orlando Concierge
                </h1>
                {submittedAddress && viewState === 'results' && (
                  <p className="text-[10px] text-muted-foreground leading-none mt-0.5 truncate">
                    {submittedAddress}
                  </p>
                )}
              </div>
            </div>
            {viewState === 'results' && (
              <Button variant="outline" size="sm" onClick={handleNewSearch} className="shrink-0">
                <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
                Nova busca
              </Button>
            )}
          </div>
        </div>

        <div className="max-w-2xl mx-auto px-4">
          {/* INPUT STATE */}
          {viewState === 'input' && (
            <div className="flex flex-col items-center justify-center py-16 space-y-6">
              <div className="w-16 h-16 bg-[#FF6B35]/10 rounded-2xl flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-[#FF6B35]" />
              </div>
              <div className="text-center space-y-2">
                <h2 className="text-xl font-bold text-foreground">
                  Descubra locais perto do seu hotel
                </h2>
                <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                  Digite o endereço onde está hospedado e receba recomendações personalizadas
                </p>
              </div>
              <div className="w-full max-w-md space-y-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    placeholder="Ex: 7102 Grand National Dr, Orlando, FL"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    className="pl-10 h-12 text-base"
                  />
                </div>
                <Button
                  onClick={handleSearch}
                  disabled={!address || address.length < 10}
                  className="w-full h-12 text-base font-semibold"
                  style={{ backgroundColor: '#FF6B35' }}
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Descobrir
                </Button>
                {address.length > 0 && address.length < 10 && (
                  <p className="text-xs text-muted-foreground text-center">
                    Digite o endereço completo (mínimo 10 caracteres)
                  </p>
                )}
              </div>
            </div>
          )}

          {/* LOADING STATE */}
          {viewState === 'loading' && (
            <div className="flex flex-col items-center justify-center py-20 space-y-4">
              <Loader2 className="w-10 h-10 text-[#FF6B35] animate-spin" />
              <div className="text-center">
                <p className="text-foreground font-semibold">Preparando suas recomendações...</p>
                <p className="text-sm text-muted-foreground mt-1">Isso pode levar alguns segundos</p>
              </div>
            </div>
          )}

          {/* ERROR STATE */}
          {viewState === 'error' && (
            <div className="flex flex-col items-center justify-center py-20 space-y-4">
              <div className="text-4xl">😔</div>
              <div className="text-center">
                <p className="text-foreground font-semibold">
                  Não foi possível gerar as recomendações
                </p>
                <p className="text-sm text-muted-foreground mt-1">Verifique o endereço e tente novamente</p>
              </div>
              <Button onClick={handleNewSearch} style={{ backgroundColor: '#FF6B35' }}>
                <RotateCcw className="w-4 h-4 mr-2" />
                Tentar novamente
              </Button>
            </div>
          )}

          {/* RESULTS STATE */}
          {viewState === 'results' && result && (
            <div className="py-4 space-y-6">
              {result.categories.map((category) => {
                const accentColor = CATEGORY_COLORS[category.id] || '#FF6B35';
                return (
                  <section key={category.id}>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-xl">{category.icon}</span>
                      <h2 className="text-base font-bold text-foreground">{category.label}</h2>
                    </div>
                    <div className="space-y-2">
                      {category.places.map((place, idx) => (
                        <Card
                          key={`${category.id}-${idx}`}
                          className="overflow-hidden border-l-4"
                          style={{ borderLeftColor: accentColor }}
                        >
                          <CardContent className="p-3 sm:p-4">
                            <div className="flex items-start justify-between gap-2">
                              <h3 className="font-semibold text-foreground text-sm leading-tight">{place.name}</h3>
                              <div className="flex items-center gap-1.5 shrink-0">
                                <Badge variant="secondary" className="text-[10px] px-2 py-0.5">
                                  {place.distance_km} km
                                </Badge>
                                <Badge variant="secondary" className="text-[10px] px-2 py-0.5">
                                  {place.time_min}
                                </Badge>
                              </div>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">{place.address}</p>
                            <p className="text-xs text-foreground/70 italic mt-1.5">{place.summary}</p>
                            <div className="flex gap-2 mt-2.5">
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 text-xs gap-1.5"
                                onClick={() => openExternalUrl(place.gmaps)}
                              >
                                <MapPin className="w-3 h-3" />
                                Google Maps
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 text-xs gap-1.5"
                                onClick={() => openExternalUrl(place.waze)}
                              >
                                <Navigation className="w-3 h-3" />
                                Waze
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </section>
                );
              })}
            </div>
          )}
        </div>

        {/* WhatsApp Share FAB */}
        {viewState === 'results' && (
          <button
            onClick={handleShare}
            className="fixed bottom-20 right-4 lg:bottom-6 lg:right-6 bg-[#25D366] hover:bg-[#20BD5A] text-white rounded-full px-4 py-2.5 shadow-lg flex items-center gap-2 text-sm font-semibold transition-colors z-20"
          >
            <Share2 size={16} />
            WhatsApp
          </button>
        )}
      </div>
    </AppLayout>
  );
};

export default OrlandoConcierge;
