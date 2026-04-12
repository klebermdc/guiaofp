import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, ArrowLeft, MapPin, Navigation, Share2, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
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
    let text = `*Orlando Concierge*\nHotel: ${submittedAddress}\n\n`;
    for (const cat of result.categories) {
      text += `${cat.icon} *${cat.label}*\n`;
      const top3 = cat.places.slice(0, 3);
      for (const place of top3) {
        text += `- ${place.name} (${place.distance_km}km, ${place.time_min})\n`;
      }
      text += '\n';
    }
    text += '_Gerado pelo OFP Planejador_';
    openExternalUrl(`https://wa.me/?text=${encodeURIComponent(text)}`, { preferSameTabOnMobile: true });
  };

  // INPUT STATE
  if (viewState === 'input') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] flex flex-col items-center justify-center px-4">
        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 text-white/60 hover:text-white flex items-center gap-1 text-sm transition-colors"
        >
          <ArrowLeft size={18} />
          Voltar
        </button>

        <div className="w-full max-w-md text-center space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-white font-display">
              Orlando Concierge
            </h1>
            <p className="text-white/70 mt-2">
              Descubra os melhores locais perto do seu hotel
            </p>
          </div>

          <div className="space-y-3">
            <Input
              placeholder="Digite o endereço do seu hotel em Orlando..."
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="bg-white/10 border-white/20 text-white placeholder:text-white/40 h-12 text-base"
            />
            <Button
              onClick={handleSearch}
              disabled={!address || address.length < 10}
              className="w-full h-12 text-base font-semibold bg-[#FF6B35] hover:bg-[#FF5722] text-white border-0"
            >
              <span className="mr-2">✨</span> Descobrir
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // LOADING STATE
  if (viewState === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] flex flex-col items-center justify-center px-4">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 text-[#FF6B35] animate-spin mx-auto" />
          <p className="text-white/80 text-lg">Preparando suas recomendações...</p>
          <p className="text-white/40 text-sm">Isso pode levar alguns segundos</p>
        </div>
      </div>
    );
  }

  // ERROR STATE
  if (viewState === 'error') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] flex flex-col items-center justify-center px-4">
        <div className="text-center space-y-4 max-w-sm">
          <div className="text-4xl">😔</div>
          <p className="text-white text-lg font-semibold">
            Não foi possível gerar as recomendações.
          </p>
          <p className="text-white/60 text-sm">Tente novamente.</p>
          <Button
            onClick={() => { setViewState('input'); }}
            className="bg-[#FF6B35] hover:bg-[#FF5722] text-white border-0"
          >
            <RotateCcw size={16} className="mr-2" />
            Tentar novamente
          </Button>
        </div>
      </div>
    );
  }

  // RESULTS STATE
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-[#0f0c29]/80 backdrop-blur-md border-b border-white/10 px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="min-w-0 flex-1">
            <h1 className="text-lg font-bold text-white font-display truncate">
              Orlando Concierge
            </h1>
            <p className="text-xs text-white/50 truncate">{submittedAddress}</p>
          </div>
          <Button
            onClick={handleNewSearch}
            variant="outline"
            size="sm"
            className="ml-3 border-white/20 text-white hover:bg-white/10 flex-shrink-0"
          >
            Nova busca
          </Button>
        </div>
      </div>

      {/* Categories */}
      <ScrollArea className="flex-1">
        <div className="max-w-4xl mx-auto px-4 py-6 space-y-8 pb-24">
          {result?.categories.map((category) => {
            const accentColor = CATEGORY_COLORS[category.id] || '#FF6B35';
            return (
              <section key={category.id}>
                <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                  <span className="text-xl">{category.icon}</span>
                  {category.label}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {category.places.map((place, idx) => (
                    <div
                      key={`${category.id}-${idx}`}
                      className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border-l-4"
                      style={{ borderLeftColor: accentColor }}
                    >
                      <h3 className="font-bold text-white text-sm">{place.name}</h3>
                      <p className="text-xs text-white/60 mt-0.5">{place.address}</p>

                      <div className="flex items-center gap-2 mt-2">
                        <span className="bg-white/20 rounded-full px-3 py-1 text-xs text-white font-medium">
                          {place.distance_km} km
                        </span>
                        <span className="bg-white/20 rounded-full px-3 py-1 text-xs text-white font-medium">
                          {place.time_min}
                        </span>
                      </div>

                      <p className="text-sm text-white/80 italic mt-2">{place.summary}</p>

                      <div className="flex gap-2 mt-3">
                        <button
                          onClick={() => openExternalUrl(place.gmaps)}
                          className="flex items-center gap-1.5 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors"
                        >
                          <MapPin size={14} />
                          Google Maps
                        </button>
                        <button
                          onClick={() => openExternalUrl(place.waze)}
                          className="flex items-center gap-1.5 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors"
                        >
                          <Navigation size={14} />
                          Waze
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      </ScrollArea>

      {/* WhatsApp Share FAB */}
      <button
        onClick={handleShare}
        className="fixed bottom-6 right-6 bg-[#25D366] hover:bg-[#20BD5A] text-white rounded-full px-5 py-3 shadow-lg flex items-center gap-2 text-sm font-semibold transition-colors z-20"
      >
        <Share2 size={18} />
        Compartilhar
      </button>
    </div>
  );
};

export default OrlandoConcierge;
