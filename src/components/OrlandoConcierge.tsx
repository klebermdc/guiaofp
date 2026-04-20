import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, ArrowLeft, MapPin, Navigation, Share2, RotateCcw, Sparkles, Search, Building2, LocateFixed } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { openExternalUrl } from '@/lib/open-external-url';

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

interface AutocompleteSuggestion {
  type: 'place' | 'address';
  label: string;
  sublabel: string;
  lat: number;
  lng: number;
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
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<AutocompleteSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);
  const debounceRef = useRef<number | null>(null);
  const suppressNextFetchRef = useRef(false);

  // Debounced autocomplete
  useEffect(() => {
    if (suppressNextFetchRef.current) {
      suppressNextFetchRef.current = false;
      return;
    }
    if (debounceRef.current) window.clearTimeout(debounceRef.current);
    if (address.trim().length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    debounceRef.current = window.setTimeout(async () => {
      setLoadingSuggestions(true);
      try {
        const { data } = await supabase.functions.invoke('concierge-recommend', {
          body: { mode: 'autocomplete', query: address.trim() },
        });
        const list = (data?.suggestions ?? []) as AutocompleteSuggestion[];
        setSuggestions(list);
        setShowSuggestions(list.length > 0);
      } catch {
        setSuggestions([]);
      } finally {
        setLoadingSuggestions(false);
      }
    }, 350);
    return () => {
      if (debounceRef.current) window.clearTimeout(debounceRef.current);
    };
  }, [address]);

  const runRecommendation = async (payload: { address?: string; lat?: number; lng?: number }, displayLabel: string) => {
    setViewState('loading');
    setSubmittedAddress(displayLabel);
    setErrorMessage(null);
    setShowSuggestions(false);
    try {
      const { data, error } = await supabase.functions.invoke('concierge-recommend', {
        body: payload,
      });
      const payloadError =
        data && typeof data === 'object' && 'error' in data && typeof (data as { error?: unknown }).error === 'string'
          ? (data as { error: string }).error
          : null;
      if (error || payloadError) {
        setErrorMessage(payloadError || 'Não foi possível gerar as recomendações. Tente novamente.');
        setViewState('error');
        return;
      }
      if (!data || !data.categories) {
        setErrorMessage('Resposta inesperada do servidor. Tente novamente.');
        setViewState('error');
        return;
      }
      setResult(data as ConciergeResult);
      setViewState('results');
    } catch {
      setErrorMessage('Falha de conexão. Verifique sua internet e tente novamente.');
      setViewState('error');
    }
  };

  const handleSearch = async () => {
    if (!address || address.length < 10) return;
    await runRecommendation({ address }, address);
  };

  const handleSelectSuggestion = (s: AutocompleteSuggestion) => {
    const display = s.sublabel ? `${s.label}, ${s.sublabel}` : s.label;
    suppressNextFetchRef.current = true;
    setAddress(display);
    setShowSuggestions(false);
    runRecommendation({ lat: s.lat, lng: s.lng, address: display }, display);
  };

  const handleUseCurrentLocation = () => {
    if (!('geolocation' in navigator)) {
      setErrorMessage('Seu dispositivo não suporta geolocalização.');
      setViewState('error');
      return;
    }
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGpsLoading(false);
        runRecommendation(
          { lat: pos.coords.latitude, lng: pos.coords.longitude },
          'Minha localização atual',
        );
      },
      (err) => {
        setGpsLoading(false);
        const msg =
          err.code === err.PERMISSION_DENIED
            ? 'Permissão de localização negada. Habilite o GPS nas configurações do navegador.'
            : 'Não foi possível obter sua localização atual.';
        setErrorMessage(msg);
        setViewState('error');
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 },
    );
  };

  const handleNewSearch = () => {
    setViewState('input');
    setResult(null);
    setAddress('');
    setSubmittedAddress('');
    setErrorMessage(null);
    setSuggestions([]);
    setShowSuggestions(false);
  };

  const handleBack = () => {
    if (viewState === 'results' || viewState === 'error' || viewState === 'loading') {
      handleNewSearch();
    } else {
      navigate(-1);
    }
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
      <div className="min-h-screen bg-background pb-24 lg:pb-8">
        {/* Header */}
        <div className="sticky top-0 z-30 bg-background/95 backdrop-blur-sm border-b border-border/50">
          <div className="flex items-center gap-3 px-4 py-3 max-w-2xl mx-auto">
            <Button
              variant="ghost"
              size="icon"
              className="shrink-0"
              onClick={handleBack}
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
                  Digite o nome do hotel ou endereço e receba recomendações personalizadas
                </p>
              </div>
              <div className="w-full max-w-md space-y-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground z-10" />
                  <Input
                    placeholder="Ex: Rosen Plaza ou 7102 Grand National Dr"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        if (suggestions.length > 0 && showSuggestions) {
                          handleSelectSuggestion(suggestions[0]);
                        } else {
                          handleSearch();
                        }
                      }
                      if (e.key === 'Escape') setShowSuggestions(false);
                    }}
                    className="pl-10 h-12 text-base"
                  />
                  {/* Suggestions dropdown */}
                  {showSuggestions && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-popover border border-border rounded-lg shadow-lg z-20 overflow-hidden max-h-80 overflow-y-auto">
                      {loadingSuggestions ? (
                        <div className="px-3 py-2 text-xs text-muted-foreground flex items-center gap-2">
                          <Loader2 className="w-3 h-3 animate-spin" /> Buscando...
                        </div>
                      ) : (
                        suggestions.map((s, i) => (
                          <button
                            key={`${s.label}-${i}`}
                            type="button"
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => handleSelectSuggestion(s)}
                            className="w-full text-left px-3 py-2.5 hover:bg-accent transition-colors flex items-start gap-2.5 border-b border-border/40 last:border-b-0"
                          >
                            <div className="shrink-0 mt-0.5">
                              {s.type === 'place' ? (
                                <Building2 className="w-4 h-4 text-[#FF6B35]" />
                              ) : (
                                <MapPin className="w-4 h-4 text-muted-foreground" />
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium text-foreground truncate">{s.label}</p>
                              {s.sublabel && (
                                <p className="text-xs text-muted-foreground truncate">{s.sublabel}</p>
                              )}
                            </div>
                          </button>
                        ))
                      )}
                    </div>
                  )}
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
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleUseCurrentLocation}
                  disabled={gpsLoading}
                  className="w-full h-11 text-sm font-medium"
                >
                  {gpsLoading ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <LocateFixed className="w-4 h-4 mr-2" />
                  )}
                  Usar minha localização atual
                </Button>
                {address.length > 0 && address.length < 10 && suggestions.length === 0 && (
                  <p className="text-xs text-muted-foreground text-center">
                    Digite o endereço completo (mínimo 10 caracteres) ou escolha uma sugestão
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
                <p className="text-sm text-muted-foreground mt-1">
                  {errorMessage || 'Verifique o endereço e tente novamente'}
                </p>
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
  );
};

export default OrlandoConcierge;
