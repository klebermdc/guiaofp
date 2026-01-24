import { useState, useRef, useCallback } from 'react';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';
import { MapPin, Save, X, Search, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

const GOOGLE_MAPS_API_KEY = 'AIzaSyCib6OEwxnVUEan4mgc3YlITa4LMwahmbo';

type LatLng = { lat: number; lng: number };

interface Park {
  id: string;
  name: string;
  center: LatLng;
  zoom: number;
}

interface AttractionItem {
  id: string;
  title: string;
  category_id: string;
  latitude: number | null;
  longitude: number | null;
  park_name?: string;
}

const PARKS: Park[] = [
  { id: 'dd6b79b8-d934-4e15-8967-1f1af1911fef', name: 'Magic Kingdom', center: { lat: 28.4177, lng: -81.5812 }, zoom: 17 },
  { id: '03e87b8e-7467-4121-971b-91826dd55bec', name: 'EPCOT', center: { lat: 28.3747, lng: -81.5494 }, zoom: 16 },
  { id: 'ffdca010-b62c-40cc-98ee-37a853da037d', name: 'Hollywood Studios', center: { lat: 28.3575, lng: -81.5583 }, zoom: 17 },
  { id: '0ba5dfb2-4a27-48d2-9fa5-b014f04a4205', name: 'Animal Kingdom', center: { lat: 28.3580, lng: -81.5900 }, zoom: 16 },
  { id: 'c63c98b3-1cef-4d90-8142-0a68331907e1', name: 'Universal Studios', center: { lat: 28.4752, lng: -81.4683 }, zoom: 17 },
  { id: '5a1bb5ed-866e-4a73-86ff-2ad23ebc1148', name: 'Islands of Adventure', center: { lat: 28.4711, lng: -81.4710 }, zoom: 17 },
  { id: 'ba562b14-26bf-4b12-a13d-2aa7df43297e', name: 'Epic Universe', center: { lat: 28.4720, lng: -81.4450 }, zoom: 16 },
];

const mapContainerStyle = {
  width: '100%',
  height: '500px',
};

const mapOptions: google.maps.MapOptions = {
  mapTypeId: 'satellite',
  mapTypeControl: true,
  streetViewControl: false,
  fullscreenControl: true,
  zoomControl: true,
};

export function AttractionCoordinatesEditor() {
  const queryClient = useQueryClient();
  const mapRef = useRef<google.maps.Map | null>(null);
  const [selectedPark, setSelectedPark] = useState(PARKS[0]);
  const [selectedAttraction, setSelectedAttraction] = useState<AttractionItem | null>(null);
  const [pendingCoords, setPendingCoords] = useState<LatLng | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isMapLoaded, setIsMapLoaded] = useState(false);

  // Fetch all attractions for selected park
  const { data: attractions = [], isLoading } = useQuery({
    queryKey: ['admin-attractions', selectedPark.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('content_items')
        .select('id, title, category_id, latitude, longitude')
        .eq('category_id', selectedPark.id)
        .order('title');

      if (error) throw error;
      return data as AttractionItem[];
    },
  });

  // Save coordinates mutation
  const saveMutation = useMutation({
    mutationFn: async ({ id, lat, lng }: { id: string; lat: number; lng: number }) => {
      const { error } = await supabase
        .from('content_items')
        .update({ latitude: lat, longitude: lng })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-attractions'] });
      queryClient.invalidateQueries({ queryKey: ['park-attractions'] });
      toast.success('Coordenadas salvas com sucesso!');
      setPendingCoords(null);
      setSelectedAttraction(null);
    },
    onError: (error) => {
      console.error('Error saving coordinates:', error);
      toast.error('Erro ao salvar coordenadas');
    },
  });

  // Filter attractions by search term
  const filteredAttractions = attractions.filter(a =>
    a.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Count stats
  const withCoords = attractions.filter(a => a.latitude && a.longitude).length;
  const withoutCoords = attractions.length - withCoords;

  const handleMapClick = useCallback((e: google.maps.MapMouseEvent) => {
    if (!selectedAttraction) {
      toast.error('Selecione uma atração primeiro');
      return;
    }
    
    if (e.latLng) {
      const coords = {
        lat: e.latLng.lat(),
        lng: e.latLng.lng(),
      };
      setPendingCoords(coords);
    }
  }, [selectedAttraction]);

  const handleMarkerDragEnd = useCallback((attraction: AttractionItem, e: google.maps.MapMouseEvent) => {
    if (e.latLng) {
      const newLat = e.latLng.lat();
      const newLng = e.latLng.lng();
      
      // Auto-save on drag
      saveMutation.mutate({
        id: attraction.id,
        lat: newLat,
        lng: newLng,
      });
    }
  }, [saveMutation]);

  const handleSaveCoords = () => {
    if (!selectedAttraction || !pendingCoords) return;
    
    saveMutation.mutate({
      id: selectedAttraction.id,
      lat: pendingCoords.lat,
      lng: pendingCoords.lng,
    });
  };

  const handleCancelPending = () => {
    setPendingCoords(null);
  };

  const handleSelectAttraction = (attraction: AttractionItem) => {
    setSelectedAttraction(attraction);
    setPendingCoords(null);
    
    // If attraction has coords, pan to it
    if (attraction.latitude && attraction.longitude && mapRef.current) {
      mapRef.current.panTo({ lat: Number(attraction.latitude), lng: Number(attraction.longitude) });
      mapRef.current.setZoom(19);
    }
  };

  const handleParkChange = (parkId: string) => {
    const park = PARKS.find(p => p.id === parkId);
    if (park) {
      setSelectedPark(park);
      setSelectedAttraction(null);
      setPendingCoords(null);
      setSearchTerm('');
    }
  };

  const onMapLoad = (map: google.maps.Map) => {
    mapRef.current = map;
    setIsMapLoaded(true);
  };

  const getMarkerIcon = (hasCoords: boolean, isSelected: boolean, isPending: boolean): google.maps.Symbol | undefined => {
    if (typeof google === 'undefined' || !google.maps?.SymbolPath) return undefined;

    if (isPending) {
      return {
        path: google.maps.SymbolPath.CIRCLE,
        fillColor: '#3B82F6',
        fillOpacity: 1,
        strokeColor: '#FFFFFF',
        strokeWeight: 3,
        scale: 14,
      };
    }

    if (isSelected) {
      return {
        path: google.maps.SymbolPath.CIRCLE,
        fillColor: '#F59E0B',
        fillOpacity: 1,
        strokeColor: '#FFFFFF',
        strokeWeight: 3,
        scale: 12,
      };
    }

    return {
      path: google.maps.SymbolPath.CIRCLE,
      fillColor: hasCoords ? '#22C55E' : '#EF4444',
      fillOpacity: 1,
      strokeColor: '#FFFFFF',
      strokeWeight: 2,
      scale: 8,
    };
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <MapPin className="w-5 h-5 text-primary" />
            Editor de Coordenadas
          </h2>
          <p className="text-sm text-muted-foreground">
            Clique no mapa para definir a localização exata de cada atração
          </p>
        </div>

        <Select value={selectedPark.id} onValueChange={handleParkChange}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Selecione o parque" />
          </SelectTrigger>
          <SelectContent>
            {PARKS.map((park) => (
              <SelectItem key={park.id} value={park.id}>
                {park.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Stats */}
      <div className="flex gap-4 flex-wrap">
        <Badge variant="secondary" className="text-sm">
          Total: {attractions.length} atrações
        </Badge>
        <Badge className="bg-green-500 text-white text-sm">
          <CheckCircle2 className="w-3 h-3 mr-1" />
          {withCoords} com coordenadas
        </Badge>
        <Badge className="bg-red-500 text-white text-sm">
          <AlertCircle className="w-3 h-3 mr-1" />
          {withoutCoords} sem coordenadas
        </Badge>
      </div>

      {/* Selected attraction info */}
      {selectedAttraction && (
        <Card className="border-2 border-amber-400 bg-amber-50 dark:bg-amber-950/20">
          <CardHeader className="py-3">
            <CardTitle className="text-base flex items-center justify-between">
              <span className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-amber-500" />
                {selectedAttraction.title}
              </span>
              <Button variant="ghost" size="sm" onClick={() => setSelectedAttraction(null)}>
                <X className="w-4 h-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="py-2">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="text-sm">
                {pendingCoords ? (
                  <p className="text-blue-600 font-medium">
                    Nova posição: {pendingCoords.lat.toFixed(5)}, {pendingCoords.lng.toFixed(5)}
                  </p>
                ) : selectedAttraction.latitude && selectedAttraction.longitude ? (
                  <p className="text-green-600">
                    Atual: {Number(selectedAttraction.latitude).toFixed(5)}, {Number(selectedAttraction.longitude).toFixed(5)}
                  </p>
                ) : (
                  <p className="text-red-500">Sem coordenadas - clique no mapa para definir</p>
                )}
              </div>
              
              {pendingCoords && (
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleCancelPending}
                  >
                    <X className="w-4 h-4 mr-1" />
                    Cancelar
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleSaveCoords}
                    disabled={saveMutation.isPending}
                    className="bg-green-500 hover:bg-green-600"
                  >
                    {saveMutation.isPending ? (
                      <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4 mr-1" />
                    )}
                    Salvar
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Map */}
        <div className="lg:col-span-2 rounded-xl overflow-hidden border shadow-lg">
          <LoadScript googleMapsApiKey={GOOGLE_MAPS_API_KEY}>
            <GoogleMap
              mapContainerStyle={mapContainerStyle}
              center={selectedPark.center}
              zoom={selectedPark.zoom}
              options={mapOptions}
              onLoad={onMapLoad}
              onClick={handleMapClick}
            >
              {/* Existing attractions markers */}
              {isMapLoaded && attractions.map((attraction) => {
                if (!attraction.latitude || !attraction.longitude) return null;
                
                const isSelected = selectedAttraction?.id === attraction.id;
                
                return (
                  <Marker
                    key={attraction.id}
                    position={{ lat: Number(attraction.latitude), lng: Number(attraction.longitude) }}
                    icon={getMarkerIcon(true, isSelected, false)}
                    title={attraction.title}
                    draggable={true}
                    onClick={() => handleSelectAttraction(attraction)}
                    onDragEnd={(e) => handleMarkerDragEnd(attraction, e)}
                  />
                );
              })}

              {/* Pending coords marker */}
              {isMapLoaded && pendingCoords && (
                <Marker
                  position={pendingCoords}
                  icon={getMarkerIcon(false, false, true)}
                  title="Nova posição"
                />
              )}
            </GoogleMap>
          </LoadScript>
        </div>

        {/* Attractions List */}
        <Card>
          <CardHeader className="py-3">
            <CardTitle className="text-base">Atrações</CardTitle>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar atração..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[400px]">
              {isLoading ? (
                <div className="p-8 flex items-center justify-center">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
              ) : filteredAttractions.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  <MapPin className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>Nenhuma atração encontrada</p>
                </div>
              ) : (
                <div className="divide-y">
                  {filteredAttractions.map((attraction) => {
                    const hasCoords = attraction.latitude && attraction.longitude;
                    const isSelected = selectedAttraction?.id === attraction.id;
                    
                    return (
                      <div
                        key={attraction.id}
                        className={`p-3 cursor-pointer transition-colors hover:bg-muted/50 ${
                          isSelected ? 'bg-amber-50 dark:bg-amber-950/20' : ''
                        }`}
                        onClick={() => handleSelectAttraction(attraction)}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <div className={`w-3 h-3 rounded-full shrink-0 ${
                              hasCoords ? 'bg-green-500' : 'bg-red-500'
                            }`} />
                            <span className="text-sm truncate">{attraction.title}</span>
                          </div>
                          {hasCoords ? (
                            <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                          ) : (
                            <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
        <span className="font-medium">Legenda:</span>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
          <span>Com coordenadas</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <span>Sem coordenadas</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-amber-500"></div>
          <span>Selecionado</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-blue-500"></div>
          <span>Nova posição</span>
        </div>
      </div>
    </div>
  );
}
