import { useState, useEffect, useCallback, useRef } from 'react';
import { GoogleMap, LoadScript, Marker, DirectionsRenderer, InfoWindow } from '@react-google-maps/api';
import { MapPin, Navigation, Loader2, AlertCircle, Star, Route, X, Clock, RefreshCw } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

const GOOGLE_MAPS_API_KEY = 'AIzaSyCib6OEwxnVUEan4mgc3YlITa4LMwahmbo';

type LatLng = { lat: number; lng: number };

interface Park {
  id: string;
  name: string;
  center: LatLng;
  zoom: number;
}

interface WaitTimeData {
  id: number | string;
  name: string;
  isOpen: boolean;
  waitTime: number;
  lastUpdated: string;
}

interface Attraction {
  id: string;
  name: string;
  position: LatLng;
  description: string;
  waitTime?: number;
  isOpen?: boolean;
  thrillLevel?: number;
  minHeight?: string;
  passType?: string;
}

// Parks with their database IDs and center coordinates
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
  height: '100%',
};

const mapOptions: google.maps.MapOptions = {
  mapTypeId: 'satellite',
  mapTypeControl: true,
  streetViewControl: false,
  fullscreenControl: true,
  zoomControl: true,
};

// Normalize attraction names for matching with wait times
const normalizeAttractionName = (name: string): string => {
  return name
    .toLowerCase()
    .replace(/['']/g, "'")
    .replace(/[^\w\s']/g, '')
    .replace(/\s+/g, ' ')
    .trim();
};

// Find matching wait time for an attraction
const findWaitTime = (attractionName: string, waitTimes: WaitTimeData[]): WaitTimeData | undefined => {
  const normalizedName = normalizeAttractionName(attractionName);
  
  return waitTimes.find(wt => {
    const normalizedWtName = normalizeAttractionName(wt.name);
    return normalizedName === normalizedWtName || 
           normalizedName.includes(normalizedWtName) || 
           normalizedWtName.includes(normalizedName);
  });
};

interface RouteInfo {
  distance: string;
  duration: string;
  destinationName: string;
}

export default function ParkMap() {
  const mapRef = useRef<google.maps.Map | null>(null);
  const [selectedPark, setSelectedPark] = useState(PARKS[0]);
  const [waitTimes, setWaitTimes] = useState<WaitTimeData[]>([]);
  const [dataSource, setDataSource] = useState<string>('');
  const [isLoadingWaitTimes, setIsLoadingWaitTimes] = useState(false);
  const [lastWaitTimeUpdate, setLastWaitTimeUpdate] = useState<Date | null>(null);
  const [userPosition, setUserPosition] = useState<LatLng | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null);
  const [routeInfo, setRouteInfo] = useState<RouteInfo | null>(null);
  const [isCalculatingRoute, setIsCalculatingRoute] = useState(false);
  const [selectedAttraction, setSelectedAttraction] = useState<Attraction | null>(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);

  // Fetch attractions from database with real coordinates
  const { data: dbAttractions = [], isLoading: isLoadingAttractions } = useQuery({
    queryKey: ['park-attractions', selectedPark.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('content_items')
        .select('id, title, description, latitude, longitude, thrill_level, min_height, pass_type')
        .eq('category_id', selectedPark.id)
        .not('latitude', 'is', null)
        .not('longitude', 'is', null);

      if (error) {
        console.error('Error fetching attractions:', error);
        return [];
      }

      return data.map(item => ({
        id: item.id,
        name: item.title,
        position: {
          lat: Number(item.latitude),
          lng: Number(item.longitude),
        },
        description: item.description || '',
        thrillLevel: item.thrill_level,
        minHeight: item.min_height,
        passType: item.pass_type,
      })) as Attraction[];
    },
  });

  // Fetch wait times from API
  const fetchWaitTimes = useCallback(async (parkId: string) => {
    setIsLoadingWaitTimes(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('queue-times', {
        body: { parkId },
      });

      if (error) {
        console.error('Error fetching wait times:', error);
        setWaitTimes([]);
      } else if (data?.success && data?.data) {
        setWaitTimes(data.data);
        setDataSource(data.source || 'unknown');
        setLastWaitTimeUpdate(new Date());
      }
    } catch (err) {
      console.error('Failed to fetch wait times:', err);
      setWaitTimes([]);
    }
    
    setIsLoadingWaitTimes(false);
  }, []);

  // Merge database attractions with wait times
  const attractionsWithWaitTimes: Attraction[] = dbAttractions.map(attraction => {
    const waitTimeData = findWaitTime(attraction.name, waitTimes);
    return {
      ...attraction,
      waitTime: waitTimeData?.waitTime,
      isOpen: waitTimeData?.isOpen,
    };
  });

  // Fetch wait times when park changes
  useEffect(() => {
    fetchWaitTimes(selectedPark.id);
    setDirections(null);
    setRouteInfo(null);
    setSelectedAttraction(null);
  }, [selectedPark.id, fetchWaitTimes]);

  // Auto-refresh wait times every 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      fetchWaitTimes(selectedPark.id);
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [selectedPark.id, fetchWaitTimes]);

  // Center map when park changes or map loads
  useEffect(() => {
    if (mapRef.current && isMapLoaded) {
      mapRef.current.panTo(selectedPark.center);
      mapRef.current.setZoom(selectedPark.zoom);
    }
  }, [selectedPark, isMapLoaded]);

  const calculateRoute = useCallback((destination: LatLng, destinationName: string) => {
    if (!userPosition) {
      setLocationError('Ative sua localização primeiro para calcular a rota');
      return;
    }

    setIsCalculatingRoute(true);
    setSelectedAttraction(null);

    const directionsService = new google.maps.DirectionsService();
    
    directionsService.route(
      {
        origin: userPosition,
        destination: destination,
        travelMode: google.maps.TravelMode.WALKING,
      },
      (result, status) => {
        setIsCalculatingRoute(false);
        
        if (status === google.maps.DirectionsStatus.OK && result) {
          setDirections(result);
          const leg = result.routes[0].legs[0];
          setRouteInfo({
            distance: leg.distance?.text || '',
            duration: leg.duration?.text || '',
            destinationName,
          });
        } else {
          setLocationError('Não foi possível calcular a rota. Tente novamente.');
        }
      }
    );
  }, [userPosition]);

  const clearRoute = () => {
    setDirections(null);
    setRouteInfo(null);
  };

  const handleGetLocation = () => {
    setIsLoadingLocation(true);
    setLocationError(null);

    if (!navigator.geolocation) {
      setLocationError('Geolocalização não suportada pelo navegador');
      setIsLoadingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const pos: LatLng = { lat: position.coords.latitude, lng: position.coords.longitude };
        setUserPosition(pos);
        if (mapRef.current) {
          mapRef.current.panTo(pos);
          mapRef.current.setZoom(18);
        }
        setIsLoadingLocation(false);
      },
      (error) => {
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setLocationError('Permissão de localização negada');
            break;
          case error.POSITION_UNAVAILABLE:
            setLocationError('Localização indisponível');
            break;
          case error.TIMEOUT:
            setLocationError('Tempo esgotado ao obter localização');
            break;
          default:
            setLocationError('Erro ao obter localização');
        }
        setIsLoadingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  };

  const handleNavigateToAttraction = (position: LatLng) => {
    if (mapRef.current) {
      mapRef.current.panTo(position);
      mapRef.current.setZoom(19);
    }
  };

  const handleRouteToAttraction = (position: LatLng, name: string) => {
    if (!userPosition) {
      handleGetLocation();
      setTimeout(() => {
        if (userPosition) {
          calculateRoute(position, name);
        }
      }, 2000);
    } else {
      calculateRoute(position, name);
    }
  };

  const handleParkChange = (parkId: string) => {
    const park = PARKS.find(p => p.id === parkId);
    if (park) {
      setSelectedPark(park);
    }
  };

  const handleRefreshWaitTimes = () => {
    fetchWaitTimes(selectedPark.id);
  };

  const onMapLoad = (map: google.maps.Map) => {
    mapRef.current = map;
    setIsMapLoaded(true);
  };

  const getMarkerIcon = (attraction: Attraction): google.maps.Symbol | undefined => {
    // Only create icon if Google Maps API is loaded
    if (typeof google === 'undefined' || !google.maps?.SymbolPath) {
      return undefined;
    }
    
    const waitTimeColor = attraction.waitTime !== undefined 
      ? attraction.waitTime > 60 ? '#EF4444' 
        : attraction.waitTime > 30 ? '#F59E0B' 
        : '#22C55E'
      : '#6B7280';

    return {
      path: google.maps.SymbolPath.CIRCLE,
      fillColor: waitTimeColor,
      fillOpacity: 1,
      strokeColor: '#FFFFFF',
      strokeWeight: 2,
      scale: 10,
    };
  };

  const getUserMarkerIcon = (): google.maps.Symbol | undefined => {
    if (typeof google === 'undefined' || !google.maps?.SymbolPath) {
      return undefined;
    }
    return {
      path: google.maps.SymbolPath.CIRCLE,
      fillColor: '#3B82F6',
      fillOpacity: 1,
      strokeColor: '#FFFFFF',
      strokeWeight: 3,
      scale: 12,
    };
  };

  const getWaitTimeColor = (waitTime: number | undefined) => {
    if (waitTime === undefined) return 'bg-muted text-muted-foreground';
    if (waitTime > 60) return 'bg-red-500 text-white';
    if (waitTime > 30) return 'bg-amber-500 text-white';
    return 'bg-green-500 text-white';
  };

  return (
    <AppLayout>
      <div className="space-y-4 h-full">
        {/* Header */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground flex items-center gap-2">
              <MapPin className="w-6 h-6 text-primary" />
              Mapa do Parque
            </h1>
            <p className="text-muted-foreground text-sm">Localize-se e veja tempos de fila em tempo real</p>
          </div>

          <div className="flex gap-2 w-full sm:w-auto flex-wrap">
            <Select value={selectedPark.id} onValueChange={handleParkChange}>
              <SelectTrigger className="w-full sm:w-[200px]">
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

            <Button
              onClick={handleRefreshWaitTimes}
              disabled={isLoadingWaitTimes}
              variant="outline"
              size="icon"
              title="Atualizar tempos de fila"
            >
              <RefreshCw className={`w-4 h-4 ${isLoadingWaitTimes ? 'animate-spin' : ''}`} />
            </Button>

            <Button
              onClick={handleGetLocation}
              disabled={isLoadingLocation}
              variant="outline"
              className="shrink-0"
            >
              {isLoadingLocation ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Navigation className="w-4 h-4" />
              )}
              <span className="hidden sm:inline ml-2">Minha Localização</span>
            </Button>
          </div>
        </div>

        {/* Wait Time Status */}
        {lastWaitTimeUpdate && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
            <Clock className="w-3 h-3" />
            Tempos de fila atualizados às {lastWaitTimeUpdate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
            {waitTimes.length > 0 && (
              <Badge variant="secondary" className="text-xs">
                {waitTimes.filter(w => w.isOpen).length} atrações abertas
              </Badge>
            )}
            {dataSource && (
              <Badge variant="outline" className="text-xs">
                via {dataSource}
              </Badge>
            )}
          </div>
        )}

        {/* Location Error */}
        {locationError && (
          <div className="flex items-center gap-2 p-3 bg-destructive/10 text-destructive rounded-lg text-sm">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {locationError}
            <button onClick={() => setLocationError(null)} className="ml-auto">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Route Info Card */}
        {routeInfo && (
          <Card className="border-2 border-blue-400 bg-blue-50 dark:bg-blue-950/20">
            <CardHeader className="py-3">
              <CardTitle className="text-base flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Route className="w-5 h-5 text-blue-500" />
                  Rota para {routeInfo.destinationName}
                </span>
                <Button variant="ghost" size="sm" onClick={clearRoute}>
                  <X className="w-4 h-4" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="py-2">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">🚶</span>
                  <div>
                    <p className="text-xs text-muted-foreground">Distância</p>
                    <p className="font-bold text-lg">{routeInfo.distance}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl">⏱️</span>
                  <div>
                    <p className="text-xs text-muted-foreground">Tempo estimado</p>
                    <p className="font-bold text-lg">{routeInfo.duration}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Map and Attractions Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-[calc(100vh-320px)] min-h-[400px]">
          {/* Map */}
          <div className="lg:col-span-2 rounded-xl overflow-hidden border shadow-lg">
            <LoadScript googleMapsApiKey={GOOGLE_MAPS_API_KEY}>
              <GoogleMap
                mapContainerStyle={mapContainerStyle}
                center={selectedPark.center}
                zoom={selectedPark.zoom}
                options={mapOptions}
                onLoad={onMapLoad}
              >
                {/* User location marker */}
                {userPosition && isMapLoaded && (
                  <Marker
                    position={userPosition}
                    icon={getUserMarkerIcon()}
                    title="Sua localização"
                    zIndex={1000}
                  />
                )}

                {/* Attraction markers from database - only render when map is loaded */}
                {isMapLoaded && attractionsWithWaitTimes.map((attraction) => (
                  <Marker
                    key={attraction.id}
                    position={attraction.position}
                    icon={getMarkerIcon(attraction)}
                    title={`${attraction.name}${attraction.waitTime !== undefined ? ` - ${attraction.waitTime} min` : ''}`}
                    onClick={() => setSelectedAttraction(attraction)}
                  />
                ))}

                {/* InfoWindow for selected attraction */}
                {selectedAttraction && (
                  <InfoWindow
                    position={selectedAttraction.position}
                    onCloseClick={() => setSelectedAttraction(null)}
                  >
                    <div className="p-2 max-w-[280px]">
                      <h3 className="font-bold text-gray-900 mb-2 text-base">{selectedAttraction.name}</h3>
                      
                      <div className="flex items-center gap-2 mb-3 flex-wrap">
                        {selectedAttraction.waitTime !== undefined ? (
                          <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                            selectedAttraction.waitTime > 60 ? 'bg-red-500 text-white' :
                            selectedAttraction.waitTime > 30 ? 'bg-amber-500 text-white' :
                            'bg-green-500 text-white'
                          }`}>
                            {selectedAttraction.waitTime} min
                          </span>
                        ) : (
                          <span className="px-3 py-1 rounded-full text-sm bg-gray-200 text-gray-600">
                            Sem dados
                          </span>
                        )}
                        
                        {selectedAttraction.isOpen !== undefined && (
                          <span className={`text-sm font-medium ${selectedAttraction.isOpen ? 'text-green-600' : 'text-red-600'}`}>
                            {selectedAttraction.isOpen ? '● Aberto' : '● Fechado'}
                          </span>
                        )}
                      </div>

                      {selectedAttraction.passType && (
                        <p className="text-xs text-gray-500 mb-2">
                          <strong>Pass:</strong> {selectedAttraction.passType}
                        </p>
                      )}

                      {selectedAttraction.minHeight && (
                        <p className="text-xs text-gray-500 mb-2">
                          <strong>Altura mínima:</strong> {selectedAttraction.minHeight}
                        </p>
                      )}

                      <button
                        onClick={() => handleRouteToAttraction(selectedAttraction.position, selectedAttraction.name)}
                        className="w-full bg-blue-500 text-white text-sm py-2 px-3 rounded-lg hover:bg-blue-600 font-medium"
                      >
                        🚶 Como Chegar
                      </button>
                    </div>
                  </InfoWindow>
                )}

                {/* Directions renderer */}
                {directions && (
                  <DirectionsRenderer
                    directions={directions}
                    options={{
                      suppressMarkers: true,
                      polylineOptions: {
                        strokeColor: '#3B82F6',
                        strokeWeight: 5,
                        strokeOpacity: 0.8,
                      },
                    }}
                  />
                )}
              </GoogleMap>
            </LoadScript>
          </div>

          {/* Attractions List */}
          <div className="overflow-auto rounded-xl border bg-card">
            <div className="p-4 border-b bg-muted/50 sticky top-0 z-10">
              <h2 className="font-semibold flex items-center gap-2">
                <Star className="w-4 h-4 text-primary" />
                Atrações ({attractionsWithWaitTimes.length})
              </h2>
              <p className="text-xs text-muted-foreground mt-1">
                Clique para ver no mapa
              </p>
            </div>
            
            <div className="divide-y">
              {isLoadingAttractions ? (
                <div className="p-8 flex items-center justify-center">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
              ) : attractionsWithWaitTimes.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  <MapPin className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>Nenhuma atração cadastrada</p>
                  <p className="text-xs mt-1">Este parque ainda não possui atrações com coordenadas</p>
                </div>
              ) : (
                attractionsWithWaitTimes
                  .sort((a, b) => {
                    // Sort: open first, then by wait time (lower first), then by name
                    if (a.isOpen !== b.isOpen) {
                      return a.isOpen ? -1 : 1;
                    }
                    if (a.waitTime !== undefined && b.waitTime !== undefined) {
                      return a.waitTime - b.waitTime;
                    }
                    if (a.waitTime !== undefined) return -1;
                    if (b.waitTime !== undefined) return 1;
                    return a.name.localeCompare(b.name);
                  })
                  .map((attraction) => (
                    <div
                      key={attraction.id}
                      className={`p-3 hover:bg-muted/50 cursor-pointer transition-colors ${
                        selectedAttraction?.id === attraction.id ? 'bg-primary/10' : ''
                      }`}
                      onClick={() => {
                        setSelectedAttraction(attraction);
                        handleNavigateToAttraction(attraction.position);
                      }}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{attraction.name}</p>
                          <div className="flex items-center gap-2 mt-1">
                            {attraction.isOpen !== undefined && (
                              <span className={`text-xs ${attraction.isOpen ? 'text-green-600' : 'text-red-500'}`}>
                                {attraction.isOpen ? '● Aberto' : '● Fechado'}
                              </span>
                            )}
                            {attraction.passType && (
                              <span className="text-xs text-muted-foreground">
                                {attraction.passType}
                              </span>
                            )}
                          </div>
                        </div>
                        
                        <Badge className={getWaitTimeColor(attraction.waitTime)}>
                          {attraction.waitTime !== undefined ? `${attraction.waitTime} min` : '—'}
                        </Badge>
                      </div>
                    </div>
                  ))
              )}
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
          <span className="font-medium">Legenda:</span>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span>&lt; 30 min</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-amber-500"></div>
            <span>30-60 min</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <span>&gt; 60 min</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-gray-400"></div>
            <span>Sem dados</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            <span>Sua localização</span>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
